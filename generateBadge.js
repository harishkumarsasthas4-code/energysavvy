const { makeBadge } = require('badge-maker');

function generateBadge(savings) {
  const savingsValue = parseFloat(savings);
  let color = 'brightgreen';
  let label = 'energy savings';
  
  if (savingsValue > 10) {
    color = 'red';
    label = 'high energy waste';
  } else if (savingsValue > 3) {
    color = 'yellow';
    label = 'medium energy waste';
  } else if (savingsValue > 0) {
    color = 'yellowgreen';
    label = 'low energy waste';
  }

  const format = {
    label: '⚡ energy',
    message: `${savings} Wh saved`,
    color: color,
    style: 'flat-square'
  };

  return makeBadge(format);
}

function generateSvgBadge(score) {
  // Generate a more visual badge with gradient
  const percentage = Math.min(100, Math.max(0, score));
  let color;
  
  if (percentage >= 80) color = '#2ecc71';
  else if (percentage >= 60) color = '#f1c40f';
  else if (percentage >= 40) color = '#e67e22';
  else color = '#e74c3c';

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20">
  <linearGradient id="smooth" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="round">
    <rect width="120" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#round)">
    <rect width="55" height="20" fill="#555"/>
    <rect x="55" width="65" height="20" fill="${color}"/>
    <rect width="120" height="20" fill="url(#smooth)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana" font-size="11">
    <text x="27.5" y="14">Energy</text>
    <text x="87" y="14">${percentage}%</text>
  </g>
</svg>
  `;
}

module.exports = { generateBadge, generateSvgBadge };