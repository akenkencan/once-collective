/* Native contact form bridge. Configure the receiver server-side; no success is
   reported until that receiver has accepted the email and explicit consent. */
module.exports = async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const receiver=process.env.ONCE_EMAIL_CAPTURE_URL,token=process.env.ONCE_EMAIL_CAPTURE_TOKEN;
 if(req.method==='GET')return res.status(200).json({ready:Boolean(receiver)});
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'})}
 const origin=req.headers.origin,local=process.env.NODE_ENV!=='production'&&/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin||'');if(req.headers['sec-fetch-site']==='cross-site'||origin&&!/^https:\/\/(www\.)?oncecollective\.com$/.test(origin)&&!local)return res.status(403).json({error:'Invalid origin'});
 if(Number(req.headers['content-length']||0)>4096)return res.status(413).json({error:'Request too large'});
 if(String(req.headers['content-type']||'').split(';')[0].trim().toLowerCase()!=='application/json')return res.status(415).json({error:'JSON required'});
 try{if(Buffer.byteLength(typeof req.body==='string'?req.body:JSON.stringify(req.body)||'','utf8')>4096)return res.status(413).json({error:'Request too large'})}catch{return res.status(400).json({error:'Invalid request'})}
 let body=req.body;if(typeof body==='string'){try{body=JSON.parse(body)}catch{return res.status(400).json({error:'Invalid request'})}}
 if(!body||Array.isArray(body)||typeof body.email!=='string'||body.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)||typeof body.mailingList!=='boolean'||!['about','concept'].includes(body.source))return res.status(400).json({error:'Invalid email details'});
 if(body.website)return res.status(400).json({error:'Invalid request'});
 if(!receiver)return res.status(503).json({error:'Email capture unavailable'});
 try{const destination=new URL(receiver);if(destination.protocol!=='https:')throw new Error('Invalid receiver');const response=await fetch(destination,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({email:body.email.trim(),mailingList:body.mailingList,source:body.source,consentRecordedAt:new Date().toISOString()}),signal:AbortSignal.timeout(10000)});if(!response.ok)return res.status(502).json({error:'Email capture unavailable'});return res.status(200).json({saved:true})}catch{return res.status(502).json({error:'Email capture unavailable'})}
};
