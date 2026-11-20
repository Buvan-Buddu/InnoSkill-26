const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const brandingDir = path.join(__dirname, '..', 'public', 'branding');
  if (!fs.existsSync(brandingDir)) {
    fs.mkdirSync(brandingDir, { recursive: true });
  }

  // 1. Inspect logo (Asset 1: a13b4d98-9073-4086-a5d7-12cc51d27322.jpeg)
  const logoPath = path.join(__dirname, '..', 'a13b4d98-9073-4086-a5d7-12cc51d27322.jpeg');
  const iconPath = path.join(__dirname, '..', 'b30a4767-ae98-43da-9c8c-6bded810c9a2.jpeg');

  const logoMeta = await sharp(logoPath).metadata();
  console.log('Logo metadata:', logoMeta);

  // Check trimmed bounds for logo to see if there's excessive padding or clean border
  // Dark navy background is approximately RGB(11, 36, 61)
  // Let's create high quality web-optimized versions of the logo:
  // - public/branding/innoskill-ai-logo.png
  // - public/branding/innoskill-ai-logo.webp
  await sharp(logoPath)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(brandingDir, 'innoskill-ai-logo.png'));

  await sharp(logoPath)
    .webp({ quality: 95, lossless: false })
    .toFile(path.join(brandingDir, 'innoskill-ai-logo.webp'));

  console.log('Generated innoskill-ai-logo.png and .webp');

  // 2. Process Icon (Asset 2: b30a4767-ae98-43da-9c8c-6bded810c9a2.jpeg)
  // The icon has a light/off-white background. Let's inspect the icon pixels to see how to extract transparent background cleanly.
  const iconRaw = await sharp(iconPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = iconRaw.info;
  const data = iconRaw.data;

  // Let's create a transparent version of the icon by removing the light background (RGB ~ 240-255)
  // Let's check non-background bounding box and alpha mask
  // Also create a version on dark navy (#0B243D) and a transparent version
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const dstIdx = (y * width + x) * 4;
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      // Check if it's the off-white background: typically r > 230 && g > 230 && b > 225
      // Let's compute color distance to background or lightness
      const isLightBg = (r > 235 && g > 235 && b > 230);
      
      if (!isLightBg) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Icon bounding box: minX=${minX}, maxX=${maxX}, minY=${minY}, maxY=${maxY}, boxWidth=${maxX - minX + 1}, boxHeight=${maxY - minY + 1}`);

  // Create transparent PNG with anti-aliasing feathering on background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const dstIdx = (y * width + x) * 4;
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      // Smooth alpha transition for near-white edges
      const brightness = (r + g + b) / 3;
      let alpha = 255;
      if (brightness > 248 && r > 240 && g > 240 && b > 235) {
        alpha = 0;
      } else if (brightness > 235 && r > 225 && g > 225) {
        // Linear feathering between 235 and 248
        alpha = Math.round(255 * (1 - (brightness - 235) / 13));
      }

      rgbaBuffer[dstIdx] = r;
      rgbaBuffer[dstIdx + 1] = g;
      rgbaBuffer[dstIdx + 2] = b;
      rgbaBuffer[dstIdx + 3] = alpha;
    }
  }

  // Save the full transparent icon
  const transparentIcon = sharp(rgbaBuffer, {
    raw: { width, height, channels: 4 }
  });

  // Also crop tight with a nice 5% padding
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const pad = Math.round(Math.max(cropW, cropH) * 0.06);

  const croppedX = Math.max(0, minX - pad);
  const croppedY = Math.max(0, minY - pad);
  const croppedW = Math.min(width - croppedX, cropW + pad * 2);
  const croppedH = Math.min(height - croppedY, cropH + pad * 2);

  const croppedTransparent = sharp(rgbaBuffer, {
    raw: { width, height, channels: 4 }
  }).extract({
    left: croppedX,
    top: croppedY,
    width: croppedW,
    height: croppedH
  });

  // Save original uncropped transparent icon
  await transparentIcon
    .png({ quality: 100 })
    .toFile(path.join(brandingDir, 'innoskill-ai-icon-raw.png'));

  // Save cropped transparent icon (ideal for sidebar, header compact, favicon)
  await croppedTransparent
    .clone()
    .png({ quality: 100 })
    .toFile(path.join(brandingDir, 'innoskill-ai-icon.png'));

  await croppedTransparent
    .clone()
    .webp({ quality: 95 })
    .toFile(path.join(brandingDir, 'innoskill-ai-icon.webp'));

  // Generate favicon versions: 32x32, 48x48, 192x192, 512x512, and .ico
  await croppedTransparent
    .clone()
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(brandingDir, 'innoskill-ai-favicon-32x32.png'));

  await croppedTransparent
    .clone()
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(brandingDir, 'innoskill-ai-favicon-48x48.png'));

  await croppedTransparent
    .clone()
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(brandingDir, 'innoskill-ai-icon-192.png'));

  await croppedTransparent
    .clone()
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(brandingDir, 'innoskill-ai-icon-512.png'));

  // Also copy to root public/favicon.ico and app/favicon.ico
  // A standard 32x32 PNG can be saved as favicon.ico or we can generate valid ICO
  const ico32 = await croppedTransparent
    .clone()
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(brandingDir, 'innoskill-ai-favicon.png'), ico32);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), ico32);
  fs.writeFileSync(path.join(__dirname, '..', 'app', 'favicon.ico'), ico32);

  // Also copy to public/logo for backward-compatibility if any file looks at /logo/
  const publicLogoDir = path.join(__dirname, '..', 'public', 'logo');
  if (!fs.existsSync(publicLogoDir)) {
    fs.mkdirSync(publicLogoDir, { recursive: true });
  }
  fs.copyFileSync(path.join(brandingDir, 'innoskill-ai-logo.png'), path.join(publicLogoDir, 'logo.png'));
  fs.copyFileSync(path.join(brandingDir, 'innoskill-ai-logo.png'), path.join(publicLogoDir, 'Name.png'));
  fs.copyFileSync(path.join(brandingDir, 'innoskill-ai-icon.png'), path.join(publicLogoDir, 'icon.png'));

  console.log('All branding assets generated successfully!');
}

main().catch(err => {
  console.error('Error processing branding:', err);
  process.exit(1);
});
