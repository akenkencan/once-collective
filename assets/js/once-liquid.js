/* User-supplied liquid engine, including the newest sixfold spectrum variant. */
(()=>{
  var create = function createOnceLiquid(canvas, initial) {
      var MAXB = 28;
      var CURSOR = MAXB - 1;
      var P = {};
      var key;
      for (key in initial) P[key] = initial[key];
      var gl = null;
      try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false }); } catch (e) { gl = null; }
      if (!gl) return { ok: false, set: function () {}, destroy: function () {} };
      var deriv = gl.getExtension('OES_standard_derivatives');

      var FS_BODY = `
#define MAXB 28
precision highp float;
uniform vec2 uRes;
uniform vec3 uB[MAXB];
uniform vec3 uPal[7];
uniform vec4 uK[20];

float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float a = hash(i); float b = hash(i + vec2(1.0, 0.0)); float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return s / 0.9375;
}
vec3 ramp(float x, float sharp) {
  x = fract(x) * 6.0;
  vec3 col = uPal[0];
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    if (x >= fi && x < fi + 1.0) {
      float tt = clamp((x - fi - 0.5) * sharp + 0.5, 0.0, 1.0);
      tt = tt * tt * (3.0 - 2.0 * tt);
      col = mix(uPal[i], uPal[i + 1], tt);
    }
  }
  return col;
}
vec3 spectral(float x) {
  vec3 c = 0.5 + 0.5 * cos(6.2831853 * (x + vec3(0.0, 0.33, 0.67)));
  return clamp(c * 1.1 - 0.05, 0.0, 1.0);
}
vec4 over(vec4 dst, vec3 c, float a) { return vec4(c * a + dst.rgb * (1.0 - a), a + dst.a * (1.0 - a)); }

void main() {
  vec4 k0 = uK[0]; vec4 k1 = uK[1]; vec4 k2 = uK[2]; vec4 k3 = uK[3]; vec4 k4 = uK[4];
  vec4 k5 = uK[5]; vec4 k6 = uK[6]; vec4 k7 = uK[7]; vec4 k8 = uK[8]; vec4 k9 = uK[9];
  vec4 k10 = uK[10]; vec4 k11 = uK[11]; vec4 k12 = uK[12]; vec4 k13 = uK[13];
  vec4 k18 = uK[18]; vec4 k19 = uK[19];
  float aspect = k12.w; float t = k12.z; float seed = k12.y;
  vec2 fc = gl_FragCoord.xy;
  vec2 p0 = vec2(fc.x, uRes.y - fc.y) / uRes.y;
  float px = 1.0 / uRes.y;
  vec2 ctr = vec2(aspect * 0.5, 0.5);
  vec2 p = p0;

  if (k9.z > 0.5) {
    vec2 mp = k9.xy;
    vec2 dm = p - mp;
    float dl = length(dm);
    float R = max(k8.w, 0.01);
    float w = exp(-(dl * dl) / (R * R * 0.35));
    if (k18.w != 0.0) {
      float an = k18.w * w * 3.0;
      float cs = cos(an); float sn = sin(an);
      dm = vec2(cs * dm.x - sn * dm.y, sn * dm.x + cs * dm.y);
    }
    if (k18.z != 0.0) dm *= 1.0 - k18.z * w * 0.6;
    p = mp + dm;
    dl = length(dm);
    if (k8.z > 0.0) {
      float env = exp(-dl / (R * max(k18.x, 0.05))) * smoothstep(0.0, R * 0.12, dl);
      p += k8.z * 0.02 * env * sin(dl * k18.y - k9.w * 6.2831853) * (dm / (dl + 0.0001));
    }
  }
  if (k19.w > 0.0) {
    vec2 sd = p - k19.xy; float sl = length(sd);
    float rad = k19.z * 0.55;
    float band = exp(-pow((sl - rad) / 0.035, 2.0));
    p += k19.w * 0.03 * band * exp(-k19.z * 1.6) * (sd / (sl + 0.0001));
  }

  vec2 sc = k10.xy;
  vec2 q = p;
  if (k11.z > 0.5) q.x = sc.x + abs(q.x - sc.x);
  if (k11.w > 0.5) q.y = sc.y + abs(q.y - sc.y);
  float fold = k1.w; float twist = k10.z; float echo = k10.w;
  if (fold > 1.5 || echo > 0.0) {
    vec2 d = q - sc; float r = length(d);
    float ang = atan(d.y, d.x) - k2.x - twist * r;
    if (echo > 0.0) r = echo - abs(mod(r, 2.0 * echo) - echo);
    if (fold > 1.5) {
      float seg = 6.2831853 / fold;
      ang = mod(ang, seg);
      if (k11.y < 0.5) ang = min(ang, seg - ang);
    }
    q = sc + r * vec2(cos(ang + k2.x), sin(ang + k2.x));
  }

  vec2 wq = q * k0.z + vec2(seed);
  vec2 wv = vec2(fbm(wq + vec2(0.0, t * 0.05)), fbm(wq + vec2(5.2, 1.3) - vec2(t * 0.04, 0.0))) - 0.5;
  vec2 fq = q + wv * 2.0 * k0.y;

  float f = 0.0;
  for (int i = 0; i < MAXB; i++) { vec3 b = uB[i]; vec2 d = fq - b.xy; f += (b.z * b.z) / (dot(d, d) + 0.00001); }
  f = min(f, 60.0);

  if (k0.w > 0.0) { float cr = fbm(fq * k1.x + vec2(seed * 1.7, t * 0.02)); f *= 1.0 + k0.w * (cr - 0.5) * 1.8; }
  if (k1.y > 0.0) { float vn = fbm(fq * k1.z + vec2(11.3, seed + t * 0.03)); f *= 1.0 - k1.y * smoothstep(0.52, 0.74, vn); }
  if (k11.x > 0.0) f *= smoothstep(k11.x, k11.x + 0.05, length(p0 - sc));

  float ef = k12.x;
  if (ef > 0.0) {
    float fade = 1.0;
    fade *= mix(smoothstep(0.0, ef, p0.x), 1.0, k13.x);
    fade *= mix(smoothstep(0.0, ef, aspect - p0.x), 1.0, k13.y);
    fade *= mix(smoothstep(0.0, ef, p0.y), 1.0, k13.z);
    fade *= mix(smoothstep(0.0, ef, 1.0 - p0.y), 1.0, k13.w);
    f *= fade;
  }

  float T = k0.x;
  float depthN = clamp((f - T) / (T * 1.5), 0.0, 1.0);
  float hgt = sqrt(depthN);
  vec3 n = vec3(0.0, 0.0, 1.0);
#ifdef HAS_DERIV
  float aaF = max(fwidth(f), 0.0001);
  vec2 gr = vec2(dFdx(hgt), dFdy(hgt)) * uRes.y * 0.06 * k6.y;
  if (k6.y > 0.001) n = normalize(vec3(-gr, 1.0));
#else
  float aaF = T * 0.03;
#endif

  vec4 outc = vec4(0.0);

  if (k7.w > 0.5) {
    vec2 g = p0 * k8.x;
    vec2 dl = min(fract(g), 1.0 - fract(g)) / k8.x;
    float gline = 1.0 - smoothstep(0.0, px, min(dl.x, dl.y));
    vec2 dcen = abs(p0 - ctr);
    float axis = 1.0 - smoothstep(px * 0.5, px * 1.5, min(dcen.x, dcen.y));
    outc = over(outc, uK[17].rgb, max(gline * 0.6, axis) * k8.y);
  }

  float rings = k5.z; float gap = k5.w;
  float outer = T * (1.0 - gap * (rings + 0.5)) - aaF;
  if (f > outer) {
    float soft = max(T * k6.x, aaF);
    float aBody = smoothstep(T - soft, T, f);

    vec2 cq = fq * k3.y + vec2(seed * 0.37);
    float fl = t * 0.06 * k3.x;
    float n1 = fbm(cq + vec2(fl, -fl * 0.7));
    float n2 = fbm(cq * 1.7 + vec2(4.1 - fl * 0.5, 2.3));
    float th = (depthN * 0.8 + n1 * 1.3 + n2 * 0.5) * k2.z * 0.6 + k3.z + (1.0 - n.z) * k7.x * 2.0;
    vec3 col = k2.y > 0.5 ? spectral(th) : ramp(th, k2.w);
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum), col, k3.w) * k4.x;

    if (k4.y > 0.0) {
      float pn = fbm(fq * k4.z + vec2(23.1 + t * 0.015, t * 0.01));
      col = mix(col, uK[14].rgb, smoothstep(0.42, 0.7, pn) * k4.y);
    }
    if (k4.w > 0.0) {
      float e = clamp((f - T) / (T * k5.x), 0.0, 1.0);
      float g1 = fbm(fq * 90.0 + vec2(seed));
      float g2 = vnoise(fq * 260.0);
      float m = 1.0 - smoothstep(0.0, 1.0, e);
      m = mix(m, smoothstep(0.25, 0.75, m + (g1 - 0.5) * 1.2), k5.y);
      vec3 cc = uK[15].rgb * (0.5 + 0.9 * g1) * (0.85 + 0.3 * g2);
      col = mix(col, cc, clamp(m, 0.0, 1.0) * k4.w);
    }

    vec3 L = normalize(vec3(cos(k6.w), sin(k6.w), 0.9));
    col *= mix(1.0, 0.8 + 0.3 * dot(n, L), k6.y);
    vec3 Rf = reflect(-L, n);
    col += pow(max(Rf.z, 0.0), 32.0) * k6.z * k6.y;
    col += (hash(fc + vec2(t * 61.0, t * 17.0)) - 0.5) * k7.y;
    col = clamp(col, 0.0, 1.0);

    if (rings > 0.5) {
      float ra = 0.0;
      for (int r = 1; r <= 5; r++) {
        float fr = float(r);
        if (fr <= rings) {
          float lv = T * (1.0 - gap * fr);
          float rl = 1.0 - smoothstep(aaF * 0.6, aaF * 1.6, abs(f - lv));
          ra = max(ra, rl * (1.0 - 0.18 * fr));
        }
      }
      ra *= (1.0 - aBody);
      outc = over(outc, uK[16].rgb, ra * k7.z);
    }
    outc = over(outc, col, aBody * k7.z);
  }

  gl_FragColor = outc;
}
`;
      var FS = (deriv ? '#extension GL_OES_standard_derivatives : enable\n#define HAS_DERIV 1\n' : '') + FS_BODY;
      var VS = 'attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }';

      function compile(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('ONCE liquid shader:', gl.getShaderInfoLog(s)); return null; }
        return s;
      }
      var vs = compile(gl.VERTEX_SHADER, VS);
      var fs = compile(gl.FRAGMENT_SHADER, FS);
      if (!vs || !fs) return { ok: false, set: function () {}, destroy: function () {} };
      var prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn('ONCE liquid link:', gl.getProgramInfoLog(prog)); return { ok: false, set: function () {}, destroy: function () {} }; }
      gl.useProgram(prog);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var aLoc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(aLoc);
      gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
      var uRes = gl.getUniformLocation(prog, 'uRes');
      var uB = gl.getUniformLocation(prog, 'uB');
      var uPal = gl.getUniformLocation(prog, 'uPal');
      var uK = gl.getUniformLocation(prog, 'uK');
      gl.clearColor(0, 0, 0, 0);

      var K = new Float32Array(80);
      var B = new Float32Array(MAXB * 3);
      var PAL = new Float32Array(21);

      function hex(h) {
        h = String(h || '#000000').replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        var v = parseInt(h, 16) || 0;
        return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
      }
      function srand(i, k) { var x = Math.sin((i + 1) * 127.1 + k * 311.7 + (Number(P.seed) || 0) * 74.7) * 43758.5453; return x - Math.floor(x); }
      function aspect() { return canvas.height > 0 ? canvas.width / canvas.height : 1; }
      function bleed() {
        return { L: P.anchor === 'left' ? 1 : 0, R: P.anchor === 'right' ? 1 : 0, T: P.anchor === 'top' ? 1 : 0, B: P.anchor === 'bottom' ? 1 : 0 };
      }
      function maxCount() { return Math.max(0, Math.min(CURSOR, Math.round(P.count))); }

      var blobs = [];
      var T = 0;
      function initBlobs() {
        blobs = [];
        for (var i = 0; i < MAXB; i++) {
          var a = srand(i, 1) * Math.PI * 2, rr = Math.sqrt(srand(i, 2));
          blobs.push({ x: 0, y: 0, vx: 0, vy: 0, ox: Math.cos(a) * rr, oy: Math.sin(a) * rr, rf: srand(i, 3), ph: srand(i, 4) * 6.2832, life: 0, dr: 0, r: 0, on: false });
        }
        placeAll();
      }
      function homeOf(b, A) {
        var s = P.scale, sp = P.spread * s;
        if (P.anchor === 'left') return [sp * 0.15 + b.ox * sp * 0.35, 0.5 + b.oy * sp * 1.1];
        if (P.anchor === 'right') return [A - sp * 0.15 + b.ox * sp * 0.35, 0.5 + b.oy * sp * 1.1];
        if (P.anchor === 'top') return [A / 2 + b.ox * sp * 1.1, sp * 0.15 + b.oy * sp * 0.35];
        if (P.anchor === 'bottom') return [A / 2 + b.ox * sp * 1.1, 1 - sp * 0.15 + b.oy * sp * 0.35];
        return [A / 2 + b.ox * sp, 0.5 + b.oy * sp];
      }
      function placeAll() {
        var A = aspect();
        for (var i = 0; i < blobs.length; i++) { var h = homeOf(blobs[i], A); blobs[i].x = h[0]; blobs[i].y = h[1]; blobs[i].vx = 0; blobs[i].vy = 0; }
      }

      var m = { x: -10, y: -10, sx: -10, sy: -10, vx: 0, vy: 0, t: 0, has: false, inside: false, down: false, lx: -10, ly: -10, cb: 0 };
      var shock = { x: 0, y: 0, age: 9, s: 0 };
      var rippleClock = 0;
      var FX = new Float32Array(MAXB), FY = new Float32Array(MAXB);

      function step(dt) {
        if (dt <= 0) return;
        T += dt;
        var A = aspect();
        var n = maxCount();
        var s = P.scale;
        var ga = P.gravityAngle * Math.PI / 180, gdx = Math.cos(ga), gdy = Math.sin(ga);
        var bl = bleed();
        var i, j, b;
        for (i = 0; i < CURSOR; i++) {
          b = blobs[i];
          if (i < n) {
            b.on = true;
            b.r = P.size * s * (1 - P.sizeVar * 0.6 + P.sizeVar * 1.2 * b.rf) * (1 + P.pulse * Math.sin(T * 1.3 * (0.7 + b.rf) + b.ph));
          } else if (b.life > 0) {
            b.life -= dt / 9;
            b.on = b.life > 0;
            b.r = b.on ? b.dr * s * Math.sqrt(b.life) : 0;
          } else { b.on = false; b.r = 0; }
          FX[i] = 0; FY[i] = 0;
        }
        for (i = 0; i < CURSOR; i++) {
          b = blobs[i]; if (!b.on) continue;
          for (j = i + 1; j < CURSOR; j++) {
            var c = blobs[j]; if (!c.on) continue;
            var dx = c.x - b.x, dy = c.y - b.y, d = Math.sqrt(dx * dx + dy * dy) + 0.00001;
            var rs = (b.r + c.r) * 0.9, f = 0;
            if (d < rs) f = -P.separation * 1.5 * (rs - d) / rs;
            else if (d < rs * 4) { var k = (d - rs) / (rs * 3); f = P.cohesion * 0.25 * k * (1 - k) * 4; }
            var ux = dx / d, uy = dy / d;
            FX[i] += ux * f; FY[i] += uy * f; FX[j] -= ux * f; FY[j] -= uy * f;
          }
        }
        var mR = Math.max(P.mouseRadius, 0.01), mOn = m.has && m.inside && P.mouseMode !== 'off';
        for (i = 0; i < CURSOR; i++) {
          b = blobs[i]; if (!b.on) continue;
          var fx = FX[i], fy = FY[i];
          if (i < n) { var h = homeOf(b, A); fx += (h[0] - b.x) * P.home; fy += (h[1] - b.y) * P.home; }
          fx += gdx * P.gravity; fy += gdy * P.gravity;
          var heat = P.heat * Math.sin(T * P.heatRate * (0.6 + 0.8 * b.rf) * 2 + b.ph);
          fx -= gdx * heat * 0.8; fy -= gdy * heat * 0.8;
          fx += P.turbulence * 0.35 * Math.sin(b.y * 3.1 + T * 0.7 + b.ph);
          fy += P.turbulence * 0.35 * Math.cos(b.x * 2.7 - T * 0.6 + b.ph * 1.3);
          if (mOn) {
            var mx = b.x - m.sx, my = b.y - m.sy, md = Math.sqrt(mx * mx + my * my) + 0.00001;
            if (md < mR) {
              var w = Math.pow(1 - md / mR, P.falloff);
              var F = P.mouseForce * w;
              var ux2 = mx / md, uy2 = my / md;
              var mode = P.mouseMode;
              if (mode === 'attract') { fx -= ux2 * F; fy -= uy2 * F; }
              else if (mode === 'repel') { fx += ux2 * F * 1.5; fy += uy2 * F * 1.5; }
              else if (mode === 'stir') { fx += -uy2 * F; fy += ux2 * F; }
              else if (mode === 'vortex') { fx += -uy2 * F * 1.2 - ux2 * F * 0.6; fy += ux2 * F * 1.2 - uy2 * F * 0.6; }
              else if (mode === 'pull') { fx += (m.sx - b.x) * F * 6 + (m.vx - b.vx) * w * 2; fy += (m.sy - b.y) * F * 6 + (m.vy - b.vy) * w * 2; }
              else if (mode === 'drag') { fx += m.vx * F * 2.5; fy += m.vy * F * 2.5; }
              fx += m.vx * w * P.fling * 3; fy += m.vy * w * P.fling * 3;
            }
          }
          var mg = P.contain ? P.padding + b.r * 1.25 : P.padding, KW = 30;
          if (!bl.L && b.x < mg) fx += (mg - b.x) * KW; else if (bl.L && b.x < -0.6) fx += (-0.6 - b.x) * KW;
          if (!bl.R && b.x > A - mg) fx -= (b.x - (A - mg)) * KW; else if (bl.R && b.x > A + 0.6) fx -= (b.x - A - 0.6) * KW;
          if (!bl.T && b.y < mg) fy += (mg - b.y) * KW; else if (bl.T && b.y < -0.6) fy += (-0.6 - b.y) * KW;
          if (!bl.B && b.y > 1 - mg) fy -= (b.y - (1 - mg)) * KW; else if (bl.B && b.y > 1.6) fy -= (b.y - 1.6) * KW;

          b.vx += fx * dt; b.vy += fy * dt;
          var damp = Math.exp(-P.viscosity * dt);
          b.vx *= damp; b.vy *= damp;
          var sp2 = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          if (sp2 > 3) { b.vx *= 3 / sp2; b.vy *= 3 / sp2; }
          b.x += b.vx * dt; b.y += b.vy * dt;
          if (P.contain) {
            var lo = mg * 0.6;
            if (!bl.L) b.x = Math.max(b.x, lo);
            if (!bl.R) b.x = Math.min(b.x, A - lo);
            if (!bl.T) b.y = Math.max(b.y, lo);
            if (!bl.B) b.y = Math.min(b.y, 1 - lo);
          }
        }
      }

      function cursorTick(rdt) {
        var follow = 1 + 30 * Math.pow(1 - Math.min(P.cursorLag, 0.95), 2);
        var a = 1 - Math.exp(-follow * rdt);
        if (m.sx < -5) { m.sx = m.x; m.sy = m.y; }
        m.sx += (m.x - m.sx) * a; m.sy += (m.y - m.sy) * a;
        var dm = Math.exp(-6 * rdt);
        m.vx *= dm; m.vy *= dm;
        rippleClock += rdt * P.rippleSpeed;
        if (shock.s > 0) { shock.age += rdt; if (shock.age > 3) shock.s = 0; }
        var target = (m.has && m.inside && P.mouseMode !== 'off') ? P.cursorBlob : 0;
        m.cb += (target - m.cb) * (1 - Math.exp(-6 * rdt));
        var cb = blobs[CURSOR];
        cb.x = m.sx; cb.y = m.sy; cb.r = m.cb * P.scale; cb.on = cb.r > 0.001;
      }

      function spawn(x, y) {
        var n = maxCount();
        if (n >= CURSOR) return;
        var best = -1, bestLife = 2;
        for (var i = n; i < CURSOR; i++) { if (blobs[i].life < bestLife) { bestLife = blobs[i].life; best = i; } }
        if (best < 0) return;
        var b = blobs[best];
        b.x = x; b.y = y; b.vx = m.vx * 0.3; b.vy = m.vy * 0.3; b.life = 1; b.dr = P.dropSize; b.on = true; b.r = P.dropSize * P.scale;
        dirty = true;
      }
      function burst(x, y) {
        var R = Math.max(P.mouseRadius, 0.05) * 2;
        for (var i = 0; i < CURSOR; i++) {
          var b = blobs[i]; if (!b.on) continue;
          var dx = b.x - x, dy = b.y - y, d = Math.sqrt(dx * dx + dy * dy) + 0.0001;
          if (d < R) { var w = 1 - d / R; var imp = (0.6 + P.mouseForce * 0.12) * w; b.vx += dx / d * imp; b.vy += dy / d * imp; }
        }
      }
      function click(x, y) {
        if (P.clickAction === 'none') return;
        if (P.splash > 0) { shock.x = x; shock.y = y; shock.age = 0; shock.s = P.splash * (P.clickAction === 'burst' ? 1.4 : 0.8); }
        if (P.clickAction === 'drop') spawn(x, y);
        else if (P.clickAction === 'burst') burst(x, y);
        dirty = true;
      }

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var placed = false;
      function resize() {
        var scale = Math.min(dpr * (P.resolution || 0.75),620/Math.max(canvas.clientWidth,canvas.clientHeight,1));
        var w = Math.max(2, Math.round(canvas.clientWidth * scale)), h = Math.max(2, Math.round(canvas.clientHeight * scale));
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); dirty = true; }
        if (!placed && canvas.clientHeight > 0) { placed = true; placeAll(); }
      }

      function foldPt(x, y, A, rot) {
        var cx = P.symCX * A, cy = P.symCY;
        if (P.mirrorX) x = cx + Math.abs(x - cx);
        if (P.mirrorY) y = cy + Math.abs(y - cy);
        var fold = Math.round(Number(P.symmetry)) || 1, echo = Number(P.echo) || 0;
        if (fold > 1 || echo > 0) {
          var dx = x - cx, dy = y - cy, r = Math.sqrt(dx * dx + dy * dy);
          var a = Math.atan2(dy, dx) - rot - (Number(P.twist) || 0) * r;
          if (echo > 0) { var mm = ((r % (2 * echo)) + 2 * echo) % (2 * echo); r = echo - Math.abs(mm - echo); }
          if (fold > 1) {
            var seg = Math.PI * 2 / fold;
            a = ((a % seg) + seg) % seg;
            if (P.symMode !== 'rotate') a = Math.min(a, seg - a);
          }
          x = cx + r * Math.cos(a + rot); y = cy + r * Math.sin(a + rot);
        }
        return [x, y];
      }

      function render() {
        var A = aspect();
        var D = Math.PI / 180;
        var fold = Math.round(Number(P.symmetry)) || 1;
        var rot = (Number(P.symAngle) || 0) * D + P.symSpin * T * 0.15;
        for (var i = 0; i < MAXB; i++) {
          var b = blobs[i], x = b.x, y = b.y;
          if (b.on) { var fp = foldPt(x, y, A, rot); x = fp[0]; y = fp[1]; }
          B[i * 3] = x; B[i * 3 + 1] = y; B[i * 3 + 2] = b.on ? b.r : 0;
        }
        var cols = [P.c0, P.c1, P.c2, P.c3, P.c4, P.c5, P.c0];
        for (var c = 0; c < 7; c++) { var rgb = hex(cols[c]); PAL[c * 3] = rgb[0]; PAL[c * 3 + 1] = rgb[1]; PAL[c * 3 + 2] = rgb[2]; }
        var bl = bleed();
        var mOn = m.has && m.inside && P.mouseMode !== 'off';
        var cursorFx = m.has && m.inside;
        var vals = [
          P.tension, P.warp, P.warpScale, P.crinkle,
          P.crinkleScale, P.voids, P.voidScale, fold,
          rot, P.palette === 'spectral' ? 1 : 0, P.bands, P.sharpness,
          P.colorFlow, P.colorScale, P.hue, P.saturation,
          P.brightness, P.pools, P.poolScale, P.crust,
          P.crustWidth, P.crustGrain, P.rings, P.ringGap,
          P.softness, P.depth, P.specular, P.lightAngle * D,
          P.viewShift, P.grain, P.opacity, P.grid ? 1 : 0,
          P.gridCount, P.gridOpacity, P.ripple, P.mouseRadius,
          m.sx, m.sy, cursorFx ? 1 : 0, rippleClock,
          P.symCX * A, P.symCY, P.twist, P.echo,
          P.core, P.symMode === 'rotate' ? 1 : 0, P.mirrorX ? 1 : 0, P.mirrorY ? 1 : 0,
          P.edgeFade, ((Number(P.seed) || 0) * 1.731) % 50, T, A,
          bl.L, bl.R, bl.T, bl.B
        ];
        for (var v = 0; v < vals.length; v++) K[v] = Number(vals[v]) || 0;
        var colKeys = [P.poolColor, P.crustColor, P.ringColor, P.gridColor];
        for (var q = 0; q < 4; q++) { var cc = hex(colKeys[q]); K[56 + q * 4] = cc[0]; K[57 + q * 4] = cc[1]; K[58 + q * 4] = cc[2]; K[59 + q * 4] = 0; }
        K[72] = Number(P.rippleDecay) || 1; K[73] = Number(P.rippleWave) || 40; K[74] = Number(P.lens) || 0; K[75] = Number(P.swirl) || 0;
        K[76] = shock.x; K[77] = shock.y; K[78] = shock.age; K[79] = shock.s;

        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform3fv(uB, B);
        gl.uniform3fv(uPal, PAL);
        gl.uniform4fv(uK, K);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      function local(e) {
        var r = canvas.getBoundingClientRect();
        if (!r.height) return null;
        return { x: (e.clientX - r.left) / r.height, y: (e.clientY - r.top) / r.height, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom };
      }
      function onMove(e) {
        var l = local(e); if (!l) return;
        var now = performance.now();
        if (m.has) {
          var dtm = Math.max((now - m.t) / 1000, 0.008);
          m.vx = m.vx * 0.6 + ((l.x - m.x) / dtm) * 0.4;
          m.vy = m.vy * 0.6 + ((l.y - m.y) / dtm) * 0.4;
          var vmax = 5, vm = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
          if (vm > vmax) { m.vx *= vmax / vm; m.vy *= vmax / vm; }
        }
        m.x = l.x; m.y = l.y; m.t = now; m.has = true; m.inside = l.inside;
        if (m.down && P.paintTrail && l.inside) {
          var ddx = l.x - m.lx, ddy = l.y - m.ly;
          if (Math.sqrt(ddx * ddx + ddy * ddy) > Math.max(P.dropSize, 0.02) * 0.7) { spawn(l.x, l.y); m.lx = l.x; m.ly = l.y; }
        }
      }
      function onDown(e) {
        var l = local(e); if (!l || !l.inside) return;
        m.down = true; m.lx = l.x; m.ly = l.y;
        click(l.x, l.y);
      }
      function onUp() { m.down = false; }
      function onLeave() { m.inside = false; m.down = false; }
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });
      window.addEventListener('blur', onLeave);
      document.addEventListener('mouseleave', onLeave);

      var visible = true, io = null;
      if (typeof IntersectionObserver !== 'undefined') {
        io = new IntersectionObserver(function (en) { visible = en[0] ? en[0].isIntersecting : true; });
        io.observe(canvas);
      }

      var dead = false, raf = 0, last = performance.now(), dirty = true;
      initBlobs();if(P.paused)step(1/60);
      function frame(now) {
        if (dead) return;
        raf = requestAnimationFrame(frame);
        var rdt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        if (!visible) return;
        resize();
        cursorTick(rdt);
        if (P.paused) { if (dirty) { render(); dirty = false; } return; }
        step(rdt * P.speed);
        render();
        dirty = false;
      }
      raf = requestAnimationFrame(frame);

      return {
        ok: true,
        set: function (np) {
          var reseed = np.seed !== undefined && np.seed !== P.seed;
          for (var k2 in np) P[k2] = np[k2];
          if (reseed) initBlobs();
          dirty = true;
        },
        drop: spawn,
        destroy: function () {
          dead = true; cancelAnimationFrame(raf);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerdown', onDown);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('blur', onLeave);
          document.removeEventListener('mouseleave', onLeave);
          if (io) io.disconnect();
          var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
        }
      };
    };

const base={"count": 14, "size": 0.04, "sizeVar": 0.59, "tension": 0.85, "warp": 0.07, "warpScale": 3, "crinkle": 0.64, "crinkleScale": 16, "voids": 0.28, "voidScale": 4.5, "symmetry": 1, "symSpin": 0, "speed": 0.35, "turbulence": 1.2, "viscosity": 4.9, "gravity": 0, "gravityAngle": 90, "heat": 0, "heatRate": 0.3, "cohesion": 1.2, "separation": 1, "pulse": 0.08, "home": 1, "aspect": "1:1", "anchor": "center", "contain": true, "padding": 0.06, "edgeFade": 0.04, "spread": 0.42, "scale": 1, "palette": "film", "c0": "#d8aec9", "c1": "#b0a2d5", "c2": "#94c9df", "c3": "#aad8c5", "c4": "#e0d49a", "c5": "#dcc4b2", "bands": 5.1, "sharpness": 2.85, "colorFlow": 0.4, "colorScale": 1.5, "hue": 0, "saturation": 1, "brightness": 1, "pools": 0.035, "poolScale": 2, "poolColor": "#171d28", "crust": 0.08, "crustWidth": 0.47, "crustColor": "#6b7295", "crustGrain": 0.51, "rings": 3, "ringGap": 0.11, "ringColor": "#b5b8cf", "softness": 0.196, "depth": 0.23, "specular": 0.42, "lightAngle": 118, "viewShift": 0.59, "grain": 0.045, "opacity": 1, "grid": false, "gridCount": 8, "gridOpacity": 0.35, "gridColor": "#B99A63", "mouseMode": "attract", "mouseRadius": 0.29, "mouseForce": 2, "ripple": 0.71, "clickSpawn": true, "dropSize": 0.15, "veil": "off", "tearX": 0.5, "tearY": 0.5, "tearAngle": 70, "tearLength": 0.6, "opening": 0.06, "jagged": 0.5, "breathe": 0.2, "lipWidth": 0.012, "lipColor": "#D1C4AC", "voidColor": "#000201", "glow": 0.35, "resolution": 0.65, "paused": false, "seed": 1};
const aboutPreset={"count": 14, "size": 0.06, "sizeVar": 0.63, "tension": 1, "warp": 0.07, "warpScale": 3, "crinkle": 0.64, "crinkleScale": 16, "voids": 0.28, "voidScale": 4.5, "symmetry": 1, "symSpin": 0, "speed": 1, "turbulence": 1.88, "viscosity": 4.9, "gravity": 0, "gravityAngle": 90, "heat": 0, "heatRate": 0.3, "cohesion": 1.2, "separation": 1, "pulse": 0.08, "home": 1, "aspect": "1:1", "anchor": "center", "contain": true, "padding": 0.06, "edgeFade": 0.04, "spread": 0.42, "scale": 1, "palette": "film", "c0": "#d8aec9", "c1": "#b0a2d5", "c2": "#94c9df", "c3": "#aad8c5", "c4": "#e0d49a", "c5": "#dcc4b2", "bands": 5.1, "sharpness": 2.85, "colorFlow": 0.4, "colorScale": 1.5, "hue": 0, "saturation": 1, "brightness": 1, "pools": 0.035, "poolScale": 2, "poolColor": "#171d28", "crust": 0.08, "crustWidth": 0.47, "crustColor": "#6b7295", "crustGrain": 0.51, "rings": 3, "ringGap": 0.11, "ringColor": "#b5b8cf", "softness": 0.196, "depth": 0.23, "specular": 0.42, "lightAngle": 118, "viewShift": 0.59, "grain": 0.045, "opacity": 1, "grid": false, "gridCount": 8, "gridOpacity": 0.35, "gridColor": "#B99A63", "mouseMode": "attract", "mouseRadius": 0.29, "mouseForce": 2, "ripple": 0.71, "clickSpawn": true, "dropSize": 0.15, "veil": "off", "tearX": 0.5, "tearY": 0.5, "tearAngle": 70, "tearLength": 0.6, "opening": 0.06, "jagged": 0.5, "breathe": 0.2, "lipWidth": 0.012, "lipColor": "#D1C4AC", "voidColor": "#000201", "glow": 0.35, "resolution": 0.65, "paused": false, "seed": 1};
const spectrumPreset={"count": 3, "size": 0.095, "sizeVar": 0.63, "tension": 1.82, "warp": 0.2, "warpScale": 1.6, "crinkle": 0.51, "crinkleScale": 20, "voids": 0.12, "voidScale": 4, "symmetry": 6, "symMode": "kaleido", "mirrorX": false, "mirrorY": false, "symAngle": 0, "symSpin": 0, "twist": 0, "echo": 0, "core": 0, "symCX": 0.5, "symCY": 0.5, "speed": 0.6, "turbulence": 0.6, "viscosity": 1.8, "gravity": 0, "gravityAngle": 90, "heat": 0, "heatRate": 0.3, "cohesion": 1.2, "separation": 1, "pulse": 0.08, "home": 1, "aspect": "1:1", "anchor": "center", "contain": true, "padding": 0.06, "edgeFade": 0.04, "spread": 0.32, "scale": 1, "palette": "oil", "c0": "#1E3A5F", "c1": "#3E6FA8", "c2": "#7A4FA0", "c3": "#C2507E", "c4": "#D9A441", "c5": "#4F8F5B", "bands": 4.45, "sharpness": 2.35, "colorFlow": 1.04, "colorScale": 2.55, "hue": 0.33, "saturation": 1, "brightness": 1, "pools": 0.4, "poolScale": 2, "poolColor": "#0B0806", "crust": 0.75, "crustWidth": 0.57, "crustColor": "#7A4A2A", "crustGrain": 0.7, "rings": 3, "ringGap": 0.15, "ringColor": "#D1C4AC", "softness": 0.13, "depth": 0, "specular": 0.4, "lightAngle": 225, "viewShift": 0.6, "grain": 0.05, "opacity": 1, "grid": false, "gridCount": 8, "gridOpacity": 0.35, "gridColor": "#B99A63", "mouseMode": "attract", "mouseRadius": 0.5, "mouseForce": 3.5, "falloff": 3.1, "fling": 2.25, "cursorLag": 0.3, "cursorBlob": 0, "ripple": 1.41, "rippleSpeed": 0.27, "rippleWave": 15, "rippleDecay": 1, "lens": 0, "swirl": 0, "clickAction": "drop", "splash": 0.4, "paintTrail": false, "dropSize": 0.08, "resolution": 0.75, "paused": false, "seed": 1};
const latestPreset={"count": 14, "size": 0.085, "sizeVar": 0.5, "tension": 1, "warp": 0.08, "warpScale": 2.2, "crinkle": 0.3, "crinkleScale": 14, "voids": 0.08, "voidScale": 4, "symmetry": 1, "symMode": "rotate", "mirrorX": false, "mirrorY": false, "symAngle": 0, "symSpin": 0.04, "twist": 0, "echo": 0, "core": 0, "symCX": 0.5, "symCY": 0.5, "speed": 0.6, "turbulence": 0.6, "viscosity": 1.8, "gravity": 0, "gravityAngle": 90, "heat": 0, "heatRate": 0.3, "cohesion": 1.2, "separation": 1, "pulse": 0.08, "home": 1, "aspect": "16:9", "anchor": "center", "contain": true, "padding": 0.06, "edgeFade": 0.04, "spread": 0.3, "scale": 1, "palette": "film", "c0": "#FF9EC7", "c1": "#C9A0FF", "c2": "#8FD3FF", "c3": "#9FF0C0", "c4": "#F7E58A", "c5": "#FFB38A", "bands": 1.6, "sharpness": 1.2, "colorFlow": 0.4, "colorScale": 1.5, "hue": 0, "saturation": 1, "brightness": 1, "pools": 0.35, "poolScale": 2, "poolColor": "#0B0806", "crust": 0.72, "crustWidth": 0.45, "crustColor": "#7A4A2A", "crustGrain": 0.6, "rings": 2, "ringGap": 0.115, "ringColor": "#D1C4AC", "softness": 0.121, "depth": 0, "specular": 0.4, "lightAngle": 225, "viewShift": 0.6, "grain": 0.05, "opacity": 1, "grid": true, "gridCount": 8, "gridOpacity": 0.35, "gridColor": "#B99A63", "mouseMode": "drag", "mouseRadius": 1.04, "mouseForce": 5.5, "falloff": 2.85, "fling": 1.82, "cursorLag": 0.72, "cursorBlob": 0.16, "ripple": 0.37, "rippleSpeed": 0.06, "rippleWave": 40, "rippleDecay": 1, "lens": 0.16, "swirl": 0.04, "clickAction": "drop", "splash": 0.34, "paintTrail": false, "dropSize": 0.06, "resolution": 0.75, "paused": false, "seed": 1};
document.querySelectorAll('[data-once-liquid]').forEach((root,index)=>{
 const variant=Number(root.dataset.onceLiquid)||0,isAbout=root.dataset.liquidPreset==='about-new';
 const chosen=root.dataset.liquidPreset==='mandala'?spectrumPreset:((isAbout&&variant%3===2)?spectrumPreset:(isAbout?aboutPreset:latestPreset));
 const params={...spectrumPreset,...chosen,seed:1+variant*137,hue:(Number(chosen.hue)||0)+(isAbout?.04:.025)*variant,paused:matchMedia('(prefers-reduced-motion: reduce)').matches};
 const effect=create(root.querySelector('canvas'),params);if(!effect.ok){root.querySelector('canvas').hidden=true;root.classList.add('liquid-fallback')}
});
})();
