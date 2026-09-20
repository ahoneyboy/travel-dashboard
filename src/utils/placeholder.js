// 占位插画：用 SVG 生成「旅行感」的封面/照片占位图（dataURL），
// 用于没有真实照片的演示数据和未上传图片的记录

const SCENES = {
  mountain: (c) => `
    <circle cx="600" cy="150" r="70" fill="${c[3]}" opacity="0.9"/>
    <polygon points="0,420 200,220 340,420" fill="${c[2]}" opacity="0.55"/>
    <polygon points="180,420 420,160 700,420" fill="${c[1]}" opacity="0.75"/>
    <polygon points="480,420 640,260 820,420" fill="${c[2]}" opacity="0.6"/>
    <rect y="410" width="820" height="90" fill="${c[1]}" opacity="0.35"/>`,
  sea: (c) => `
    <circle cx="620" cy="190" r="80" fill="${c[3]}" opacity="0.95"/>
    <path d="M0 300 Q 120 270 240 300 T 480 300 T 820 300 V 500 H 0 Z" fill="${c[1]}" opacity="0.55"/>
    <path d="M0 350 Q 150 320 300 350 T 820 350 V 500 H 0 Z" fill="${c[2]}" opacity="0.6"/>
    <path d="M0 410 Q 180 380 360 410 T 820 410 V 500 H 0 Z" fill="${c[1]}" opacity="0.8"/>`,
  city: (c) => `
    <circle cx="160" cy="130" r="55" fill="${c[3]}" opacity="0.9"/>
    <rect x="80" y="250" width="90" height="250" rx="6" fill="${c[2]}" opacity="0.7"/>
    <rect x="200" y="180" width="110" height="320" rx="6" fill="${c[1]}" opacity="0.8"/>
    <rect x="340" y="290" width="80" height="210" rx="6" fill="${c[2]}" opacity="0.7"/>
    <rect x="450" y="150" width="120" height="350" rx="6" fill="${c[1]}" opacity="0.85"/>
    <rect x="600" y="240" width="100" height="260" rx="6" fill="${c[2]}" opacity="0.75"/>`,
  desert: (c) => `
    <circle cx="650" cy="170" r="75" fill="${c[3]}" opacity="0.95"/>
    <path d="M0 330 Q 220 240 460 330 T 820 330 V 500 H 0 Z" fill="${c[1]}" opacity="0.7"/>
    <path d="M0 400 Q 260 320 520 400 T 820 400 V 500 H 0 Z" fill="${c[2]}" opacity="0.75"/>
    <path d="M0 460 Q 300 400 820 460 V 500 H 0 Z" fill="${c[1]}" opacity="0.9"/>`,
  aurora: (c) => `
    <rect width="820" height="500" fill="#1f2d3a"/>
    <path d="M-40 260 Q 200 60 440 200 T 860 120" stroke="${c[1]}" stroke-width="90" fill="none" opacity="0.4" stroke-linecap="round"/>
    <path d="M-40 330 Q 260 140 520 260 T 860 210" stroke="${c[3]}" stroke-width="55" fill="none" opacity="0.5" stroke-linecap="round"/>
    <circle cx="700" cy="90" r="4" fill="#fff" opacity="0.9"/><circle cx="220" cy="80" r="3" fill="#fff" opacity="0.8"/>
    <circle cx="460" cy="50" r="3" fill="#fff" opacity="0.7"/><circle cx="600" cy="140" r="2.5" fill="#fff" opacity="0.8"/>
    <polygon points="0,500 240,330 480,500" fill="#0e1720"/><polygon points="300,500 560,360 820,500" fill="#152230"/>`,
  temple: (c) => `
    <circle cx="640" cy="160" r="70" fill="${c[3]}" opacity="0.9"/>
    <path d="M180 320 H 500 L 470 290 H 210 Z" fill="${c[2]}"/>
    <path d="M210 290 L 340 180 L 470 290 Z" fill="${c[1]}"/>
    <rect x="230" y="320" width="220" height="14" rx="7" fill="${c[2]}" opacity="0.85"/>
    <rect x="320" y="334" width="40" height="86" fill="${c[1]}" opacity="0.9"/>
    <path d="M120 420 H 560" stroke="${c[2]}" stroke-width="10" stroke-linecap="round" opacity="0.6"/>`,
}

// 每种场景配套的柔和配色：[天空, 主体, 次主体, 点缀]
const PALETTES = {
  green: ['#dff0e5', '#4a9e6e', '#7fbf9a', '#e0a85a'],
  blue: ['#dcebf9', '#5b8fd6', '#8fb5e3', '#e8935a'],
  orange: ['#fdeedd', '#e8935a', '#f0b183', '#4a9e6e'],
  purple: ['#ece5f7', '#9b7ec4', '#b79dd6', '#e0a85a'],
  gold: ['#fdf3e0', '#e0a85a', '#ecc07f', '#5b8fd6'],
}

/** 生成一张场景插画 dataURL；kind: mountain/sea/city/desert/aurora/temple */
export function placeholderImage(kind = 'mountain', title = '', palette = 'green') {
  const c = PALETTES[palette] || PALETTES.green
  const draw = SCENES[kind] || SCENES.mountain
  const label = title
    ? `<text x="42" y="452" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="40" font-weight="700" fill="#ffffff" opacity="0.92">${escapeXml(
        title
      )}</text>`
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 500">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient></defs>
    <rect width="820" height="500" fill="${c[0]}"/>
    ${draw(c)}${label}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (ch) => `&#${ch.charCodeAt(0)};`)
}
