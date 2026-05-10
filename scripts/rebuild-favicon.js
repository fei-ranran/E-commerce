const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const repoRoot = path.join(__dirname, '..');
  const publicDir = path.join(repoRoot, 'public');
  const srcSvg = path.join(publicDir, 'favicon.svg');

  if (!fs.existsSync(srcSvg)) {
    console.error('Source SVG not found:', srcSvg);
    process.exit(2);
  }

  const sizes = [16, 32, 48, 64, 96, 128, 192, 256, 512];

  try {
    for (const s of sizes) {
      const out = path.join(publicDir, `favicon-${s}.png`);
      await sharp(srcSvg)
        .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(out);
      console.log('Written', out);
    }

    // Apple touch icon
    const appleOut = path.join(publicDir, 'apple-touch-icon.png');
    await sharp(srcSvg)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(appleOut);
    console.log('Written', appleOut);

    console.log('Favicon rebuild complete. You can reference these files in your HTML head:');
    console.log(' - favicon-16.png, favicon-32.png, favicon-48.png, favicon-64.png, favicon-96.png, favicon-128.png, favicon-192.png, favicon-256.png, favicon-512.png');
    console.log(' - apple-touch-icon.png');
  } catch (err) {
    console.error('Error while rebuilding favicons:', err);
    process.exit(1);
  }
}

main();
