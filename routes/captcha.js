const express = require('express');

const router = express.Router();

function randomText(len = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

router.get('/', (req, res) => {
  const text = randomText(5);
  if (req.session) req.session.captcha = text;

  // Build a simple SVG captcha to avoid native deps.
  const width = 140, height = 44;
  const chars = text.split('');
  const letters = chars
    .map((ch, i) => {
      const x = 18 + i * 24 + (Math.random() * 6 - 3);
      const y = 28 + (Math.random() * 6 - 3);
      const rotate = (Math.random() - 0.5) * 20;
      return `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})" font-size="26" font-family="sans-serif" fill="#222">${ch}</text>`;
    })
    .join('');

  // noise lines
  let lines = '';
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#f4f6f6"/>
    ${lines}
    ${letters}
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

module.exports = router;
