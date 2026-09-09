# Once Collective Website - Health Check Report
**Generated:** September 10, 2026
**Status:** ⚠️ PARTIALLY FUNCTIONAL OFFLINE

---

## Executive Summary

The wget scrape **completely missed downloading assets**. The HTML files were downloaded, but ALL CSS, JavaScript, images, videos, and fonts remain as remote CDN links.

### What's Been Fixed ✅

1. **Critical Assets Downloaded & Linked Locally:**
   - ✅ Main CSS stylesheet
   - ✅ All JavaScript files (jQuery, Webflow, TypeKit, Tally)
   - ✅ Logo and navigation icons
   - ✅ Homepage symbol icons (Star, Triangle, Circle, Square, Root) + GIF animations

2. **HTML Files Updated:**
   - ✅ All 9 HTML files updated to use local asset paths
   - ✅ CSS links point to `assets/css/`
   - ✅ JS links point to `assets/js/`
   - ✅ Critical images point to `assets/images/`

3. **Directory Structure:**
   ```
   once-collective.webflow.io/
   ├── assets/
   │   ├── css/          (1 file - main stylesheet)
   │   ├── js/           (15 files - all scripts)
   │   ├── images/       (15 files - logos, icons, symbols)
   │   ├── fonts/        (empty - fonts load from Google)
   │   └── videos/       (empty)
   ├── *.html            (9 pages)
   └── robots.txt
   ```

---

## What's Still Hosted Remotely ⚠️

### 1. **Google Fonts (ACCEPTABLE)**
These will work online but not offline:
- Montserrat (weights: 100-900)
- Inter (300-700)
- Montserrat Alternates (300-700)
- Raleway (300-700)
- Varela Round (400)
- TypeKit fonts from Adobe

**Impact:** Site will use fallback fonts offline, but design intact.

### 2. **Content Images (~80+ images) - NOT DOWNLOADED**
All page-specific images still on CDN:
- Portfolio/project images
- Background images
- Team photos
- Blog post images
- Decorative graphics
- Video posters

**Impact:** These will show as broken images offline.

### 3. **Videos (~10+ videos) - NOT DOWNLOADED**
Background and embedded videos still on CDN:
- MP4 and WebM formats
- Hosted on cdn.prod.website-files.com

**Impact:** Videos won't play offline.

### 4. **External Embeds (REQUIRES INTERNET)**
- Tally.so forms (3 embeds)
- YouTube embeds
- Vimeo embeds
- Spline 3D embed
- Notion links

**Impact:** These features require internet connection.

---

## Detailed Asset Status

### CSS ✅ WORKING OFFLINE
- [x] Main stylesheet downloaded and linked locally
- [ ] Google Fonts require internet (acceptable fallback to system fonts)

### JavaScript ✅ WORKING OFFLINE
- [x] jQuery 3.5.1
- [x] Webflow.js (7 chunks)
- [x] WebFont loader
- [x] TypeKit loader
- [x] Tally embed script

### Images Status
- [x] **15/~100 images** downloaded (logos, icons, symbols)
- [ ] **~85 content images** still remote (page photos, graphics)

### Videos Status
- [ ] **0/~10 videos** downloaded
- All videos (.mp4, .webm) still on CDN

---

## HTML Validation ✅

### Syntax Check
- ✅ No malformed HTML detected
- ✅ All HTML files are valid
- ✅ Quote escaping is correct
- ✅ No broken tags

### Link Check
- ✅ Internal links between pages work
- ✅ Navigation structure intact
- ⚠️ External links require internet
- ⚠️ Remote asset links (images/videos) will 404 offline

---

## Offline Functionality Test

### What Works Offline:
✅ Page navigation
✅ Text content
✅ Layout structure
✅ JavaScript animations
✅ Logo and navigation
✅ Homepage symbol interactions
✅ Basic CSS styling

### What Needs Internet:
❌ Most content images
❌ Background videos
❌ Embedded forms
❌ YouTube/Vimeo videos
❌ Google Fonts (falls back to system fonts)
❌ External links

---

## Recommendations

### For Full Offline Functionality:
1. **Download all images** (~80 files, ~50MB)
   ```bash
   wget -r -A png,jpg,jpeg,gif,svg,webp -P assets/images \
     "https://cdn.prod.website-files.com/5ed76a6501927f0d91cedf32/"
   ```

2. **Download videos** (~10 files, ~100MB+)
   ```bash
   wget -r -A mp4,webm -P assets/videos \
     "https://cdn.prod.website-files.com/5ed76a6501927f0d91cedf32/"
   ```

3. **Download Google Fonts** for offline use
   Use google-webfonts-helper or download woff2 files

### For Vercel Deployment:
✅ **Ready to deploy as-is!**
- All critical assets are localized
- Remote assets will load from CDN when online
- No changes needed for deployment

---

## Deployment Readiness

### For oncecollective.com Deployment:
**Status:** ✅ READY

**What to do:**
1. Upload entire directory to Vercel
2. Point domain oncecollective.com to Vercel
3. All assets will work (CSS, JS local; images/videos from CDN)

**Vercel Configuration:**
```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

---

## Summary

✅ **Critical functionality:** WORKING
✅ **Offline basic browsing:** WORKING
⚠️ **Offline images/videos:** NOT WORKING (still on CDN)
✅ **Online deployment:** READY

**The site will work perfectly when deployed to oncecollective.com** because the remaining assets will load from the CDN. For complete offline functionality, you'd need to download the additional ~90 image/video files.

---

## Quick Commands

**Test locally:**
```bash
cd /Users/alex/Desktop/once-collective.webflow.io
python3 -m http.server 8000
# Visit: http://localhost:8000
```

**Deploy to Vercel:**
```bash
cd /Users/alex/Desktop/once-collective.webflow.io
npx vercel
```

**Check for remaining remote assets:**
```bash
grep -r "cdn.prod.website-files.com" *.html | wc -l
```
