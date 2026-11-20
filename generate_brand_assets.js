const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. InnoSkill AI Icon SVG
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#a7f3d0" />
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.2" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background container -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" stroke="#1e293b" stroke-width="4" />

  <!-- Outer ambient aura -->
  <circle cx="256" cy="256" r="170" fill="none" stroke="url(#ringGrad)" stroke-width="3" stroke-dasharray="16 12" />

  <!-- Core InnoSkill Neural Motif (Interlocking 'I' & 'S' + Skill Nodes) -->
  <g filter="url(#glow)">
    <!-- Neural orbit paths -->
    <path d="M 160 180 C 160 130, 240 120, 290 150 C 340 180, 360 230, 330 280 C 300 330, 210 330, 180 370 C 150 410, 220 430, 280 410" 
          fill="none" stroke="url(#primaryGrad)" stroke-width="26" stroke-linecap="round" />
    
    <!-- Central Ascension Spine ('I' / Career Pathway) -->
    <path d="M 256 120 L 256 392" 
          fill="none" stroke="url(#accentGrad)" stroke-width="24" stroke-linecap="round" />

    <!-- Core Dynamic Cross-Spark / Innovation Flare -->
    <path d="M 180 256 L 332 256" 
          fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-opacity="0.9" />

    <!-- Innovation Spark / Star Nodes -->
    <circle cx="256" cy="120" r="18" fill="#ffffff" stroke="#06b6d4" stroke-width="6" />
    <circle cx="256" cy="392" r="18" fill="#ffffff" stroke="#10b981" stroke-width="6" />
    <circle cx="180" cy="256" r="14" fill="#38bdf8" stroke="#ffffff" stroke-width="4" />
    <circle cx="332" cy="256" r="14" fill="#10b981" stroke="#ffffff" stroke-width="4" />

    <!-- Central Neural Core Diamond -->
    <polygon points="256,224 288,256 256,288 224,256" fill="#ffffff" />
    <circle cx="256" cy="256" r="6" fill="#0f172a" />
  </g>
</svg>`;

// 2. Full Horizontal Lockup SVG
const logoFullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 260" width="1000" height="260">
  <defs>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
    <linearGradient id="aiBadge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  </defs>

  <!-- Embedded Icon Mark -->
  <g transform="translate(20, 20) scale(0.43)">
    ${logoSvg.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">', '').replace('</svg>', '')}
  </g>

  <!-- InnoSkill AI Wordmark -->
  <text x="270" y="130" font-family="'Inter', -apple-system, sans-serif" font-size="78" font-weight="900" fill="url(#textGrad)" letter-spacing="-1.5">
    InnoSkill
  </text>
  
  <!-- AI Badge -->
  <rect x="635" y="66" width="110" height="68" rx="16" fill="url(#aiBadge)" />
  <text x="690" y="118" font-family="'Inter', -apple-system, sans-serif" font-size="44" font-weight="900" fill="#090d16" text-anchor="middle" letter-spacing="1">
    AI
  </text>

  <!-- Subtitle / Tagline -->
  <text x="275" y="185" font-family="'Inter', -apple-system, sans-serif" font-size="22" font-weight="700" fill="#94a3b8" letter-spacing="3.5">
    INCLUSIVE CAREER COMPANION
  </text>
  
  <!-- Accent underline bar -->
  <rect x="275" y="202" width="470" height="4" rx="2" fill="url(#aiBadge)" opacity="0.8" />
</svg>`;

// 3. Favicon SVG
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="#0f172a" />
  <path d="M 20 22 C 20 16, 30 15, 36 19 C 42 23, 45 29, 41 35 C 37 41, 26 41, 22 46 C 18 51, 27 54, 35 51" 
        fill="none" stroke="url(#favGrad)" stroke-width="4" stroke-linecap="round" />
  <path d="M 32 14 L 32 50" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
  <circle cx="32" cy="14" r="3.5" fill="#ffffff" />
  <circle cx="32" cy="50" r="3.5" fill="#ffffff" />
  <polygon points="32,28 36,32 32,36 28,32" fill="#ffffff" />
</svg>`;

// Write SVGs to public/logo and root /logo
const dirs = [
  path.join(__dirname, 'public', 'logo'),
  path.join(__dirname, 'logo'),
  path.join(__dirname, 'public'),
  path.join(__dirname, 'app')
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

fs.writeFileSync(path.join(__dirname, 'public', 'logo', 'logo.svg'), logoSvg);
fs.writeFileSync(path.join(__dirname, 'public', 'logo', 'logo-full.svg'), logoFullSvg);
fs.writeFileSync(path.join(__dirname, 'logo', 'logo.svg'), logoSvg);
fs.writeFileSync(path.join(__dirname, 'logo', 'logo-full.svg'), logoFullSvg);
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), faviconSvg);
fs.writeFileSync(path.join(__dirname, 'app', 'icon.svg'), faviconSvg);

console.log('SVGs created successfully.');

// Create HTML canvas renderers to export high-res PNG and JPEG
const renderHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: transparent; }
    #iconCanvas { width: 512px; height: 512px; }
    #bannerCanvas { width: 1000px; height: 260px; }
  </style>
</head>
<body>
  <div id="iconContainer" style="width: 512px; height: 512px;">
    ${logoSvg}
  </div>
  <div id="bannerContainer" style="width: 1000px; height: 260px; background: #090d16;">
    ${logoFullSvg}
  </div>
</body>
</html>`;

const renderHtmlPath = path.join(__dirname, 'temp_logo_render.html');
fs.writeFileSync(renderHtmlPath, renderHtml);

// Use Headless Edge with screenshot or Node buffer to write out png/jpeg
// We can use a small node script with a pure base64 PNG generator or render
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

try {
  // Generate square logo PNG (512x512)
  const iconImgHtml = `<!DOCTYPE html><html><body style="margin:0;background:#090d16;display:flex;justify-content:center;align-items:center;height:100vh;">${logoSvg}</body></html>`;
  const iconHtmlPath = path.join(__dirname, 'temp_icon.html');
  fs.writeFileSync(iconHtmlPath, iconImgHtml);
  
  const iconPngPath = path.join(__dirname, 'public', 'logo', 'logo.png');
  execSync(`"${edgePath}" --headless --disable-gpu --window-size=512,512 --screenshot="${iconPngPath}" "${iconHtmlPath}"`);
  
  // Copy to logo.jpeg and other locations
  fs.copyFileSync(iconPngPath, path.join(__dirname, 'public', 'logo', 'logo.jpeg'));
  fs.copyFileSync(iconPngPath, path.join(__dirname, 'logo', 'logo.png'));
  fs.copyFileSync(iconPngPath, path.join(__dirname, 'logo', 'logo.jpeg'));
  fs.copyFileSync(iconPngPath, path.join(__dirname, 'app', 'favicon.ico'));
  fs.copyFileSync(iconPngPath, path.join(__dirname, 'public', 'favicon.ico'));

  // Generate full banner PNG (Name.png)
  const bannerImgHtml = `<!DOCTYPE html><html><body style="margin:0;background:#090d16;display:flex;justify-content:center;align-items:center;height:100vh;">${logoFullSvg}</body></html>`;
  const bannerHtmlPath = path.join(__dirname, 'temp_banner.html');
  fs.writeFileSync(bannerHtmlPath, bannerImgHtml);

  const bannerPngPath = path.join(__dirname, 'public', 'logo', 'Name.png');
  execSync(`"${edgePath}" --headless --disable-gpu --window-size=1000,260 --screenshot="${bannerPngPath}" "${bannerHtmlPath}"`);
  fs.copyFileSync(bannerPngPath, path.join(__dirname, 'logo', 'Name.png'));

  // Clean temp files
  fs.unlinkSync(renderHtmlPath);
  fs.unlinkSync(iconHtmlPath);
  fs.unlinkSync(bannerHtmlPath);

  console.log('All InnoSkill AI brand image assets generated successfully.');
} catch (e) {
  console.error('Error generating image assets:', e);
}
