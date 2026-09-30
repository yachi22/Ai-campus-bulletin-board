const fs = require('fs');
const path = require('path');

const publicImagesDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images');
const distImagesDir = path.join(__dirname, '..', '..', 'frontend', 'dist', 'images');

// Full-bleed professional SVG builder
function makeSvg({ bg1, bg2, accent, pattern = 'grid', titleTag, body }) {
    let pat = '';
    if (pattern === 'grid') {
        pat = `<pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="${accent}" stroke-width="0.8" stroke-opacity="0.12"/></pattern>`;
    } else if (pattern === 'dots') {
        pat = `<pattern id="p" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.5" fill="${accent}" fill-opacity="0.15"/></pattern>`;
    } else if (pattern === 'circuit') {
        pat = `<pattern id="p" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M 0 28 H 56 M 28 0 V 56 M 14 14 H 42 V 42 H 14 Z" fill="none" stroke="${accent}" stroke-width="0.75" stroke-opacity="0.12"/><circle cx="28" cy="28" r="2.5" fill="${accent}" fill-opacity="0.2"/></pattern>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="gl" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    ${pat}
  </defs>

  <rect width="600" height="360" fill="url(#bg)"/>
  ${pat ? '<rect width="600" height="360" fill="url(#p)"/>' : ''}
  <circle cx="300" cy="170" r="170" fill="url(#gl)"/>

  ${body}

  ${titleTag ? `
  <g transform="translate(140, 305)">
    <rect width="320" height="34" rx="8" fill="#0f172a" fill-opacity="0.82" stroke="${accent}" stroke-width="1.3"/>
    <text x="160" y="22" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc" text-anchor="middle" letter-spacing="0.5">${titleTag.toUpperCase()}</text>
  </g>` : ''}
</svg>`;
}

function save(dir, file, svg) {
    const p1 = path.join(publicImagesDir, dir);
    fs.mkdirSync(p1, { recursive: true });
    fs.writeFileSync(path.join(p1, file), svg, 'utf8');

    if (fs.existsSync(path.dirname(distImagesDir))) {
        const p2 = path.join(distImagesDir, dir);
        fs.mkdirSync(p2, { recursive: true });
        fs.writeFileSync(path.join(p2, file), svg, 'utf8');
    }
}

console.log("Building 100% comprehensive local asset suite...");

// ============================================================================
// 1. ALL PROJECT SPECIFIC ASSETS
// ============================================================================

// 1.1 Attendance
save('projects', 'attendance.svg', makeSvg({
    bg1: '#0f172a', bg2: '#1e1b4b', accent: '#38bdf8', pattern: 'circuit',
    titleTag: 'AI Biometric Face Attendance',
    body: `
      <g transform="translate(190, 45)" stroke="#38bdf8" stroke-width="2" fill="none">
        <path d="M 50 30 C 50 5, 170 5, 170 30 C 170 100, 180 170, 140 220 C 120 245, 100 245, 80 220 C 40 170, 50 100, 50 30 Z" stroke-opacity="0.8" fill="#1e293b" fill-opacity="0.5"/>
        <ellipse cx="85" cy="90" rx="16" ry="8" stroke="#00f2fe" stroke-width="1.8"/>
        <circle cx="85" cy="90" r="3.5" fill="#00f2fe"/>
        <ellipse cx="135" cy="90" rx="16" ry="8" stroke="#00f2fe" stroke-width="1.8"/>
        <circle cx="135" cy="90" r="3.5" fill="#00f2fe"/>
        <path d="M 110 95 L 105 130 L 115 130 Z" stroke="#38bdf8" stroke-width="1.5"/>
        <path d="M 90 165 Q 110 185 130 165" stroke="#38bdf8" stroke-width="2.5"/>
        <line x1="15" y1="110" x2="205" y2="110" stroke="#22d3ee" stroke-width="3" filter="drop-shadow(0 0 8px #00f2fe)"/>
        <path d="M 25 40 H 10 V 55 M 195 40 H 210 V 55 M 25 210 H 10 V 195 M 195 210 H 210 V 195" stroke="#22d3ee" stroke-width="3.5"/>
      </g>`
}));

// 1.2 Crop Disease
save('projects', 'crop-disease.svg', makeSvg({
    bg1: '#064e3b', bg2: '#022c22', accent: '#34d399', pattern: 'grid',
    titleTag: 'Plant & Crop Disease Diagnostics',
    body: `
      <g transform="translate(190, 45)">
        <path d="M 110 210 C 40 160, 10 80, 50 20 C 120 30, 130 140, 110 210 Z" fill="#10b981" fill-opacity="0.85" stroke="#34d399" stroke-width="2"/>
        <path d="M 50 20 C 70 80, 90 140, 110 210" stroke="#064e3b" stroke-width="2" fill="none"/>
        <path d="M 110 210 C 180 160, 210 80, 170 20 C 100 30, 90 140, 110 210 Z" fill="#059669" fill-opacity="0.8" stroke="#34d399" stroke-width="2"/>
        <ellipse cx="150" cy="90" rx="18" ry="12" fill="#78350f" fill-opacity="0.9" stroke="#f59e0b" stroke-width="1.5"/>
        <circle cx="150" cy="90" r="36" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="6,4" fill="none"/>
        <circle cx="150" cy="90" r="5" fill="#f59e0b"/>
      </g>`
}));

// 1.3 Encrypted Vault
save('projects', 'encrypted-vault.svg', makeSvg({
    bg1: '#111827', bg2: '#1e1b4b', accent: '#818cf8', pattern: 'circuit',
    titleTag: 'End-to-End Cryptographic Vault',
    body: `
      <g transform="translate(195, 45)">
        <circle cx="105" cy="105" r="95" fill="#1f2937" stroke="#6366f1" stroke-width="4"/>
        <circle cx="105" cy="105" r="80" fill="#111827" stroke="#4f46e5" stroke-width="2"/>
        <circle cx="105" cy="105" r="50" fill="#312e81" stroke="#a5b4fc" stroke-width="3"/>
        <path d="M 105 75 L 127 85 V 110 C 127 125 105 137 105 137 C 105 137 83 125 83 110 V 85 Z" fill="#4338ca" stroke="#c7d2fe" stroke-width="2"/>
        <circle cx="105" cy="101" r="4.5" fill="#ffffff"/>
        <path d="M 105 105 V 115" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      </g>`
}));

// 1.4 Kubernetes Sandbox
save('projects', 'kubernetes-sandbox.svg', makeSvg({
    bg1: '#0c4a6e', bg2: '#082f49', accent: '#38bdf8', pattern: 'grid',
    titleTag: 'Kubernetes Code Sandbox Runner',
    body: `
      <g transform="translate(60, 45)">
        <rect width="260" height="190" rx="8" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
        <rect width="260" height="26" rx="8" fill="#1e293b"/>
        <circle cx="16" cy="13" r="4.5" fill="#ef4444"/><circle cx="30" cy="13" r="4.5" fill="#eab308"/><circle cx="44" cy="13" r="4.5" fill="#22c55e"/>
        <text x="16" y="58" font-family="monospace" font-size="11" fill="#38bdf8">$ g++ test_runner.cpp -O3</text>
        <text x="16" y="85" font-family="monospace" font-size="11" fill="#94a3b8">Testcase 1: PASS [0.012s]</text>
        <text x="16" y="112" font-family="monospace" font-size="11" fill="#94a3b8">Testcase 2: PASS [0.018s]</text>
        <text x="16" y="145" font-family="monospace" font-size="12" font-weight="700" fill="#4ade80">ACCEPTED • 100/100 PTS</text>
      </g>
      <g transform="translate(370, 50)">
        <circle cx="85" cy="85" r="70" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8" stroke-width="3"/>
        <circle cx="85" cy="85" r="28" fill="#0284c7" stroke="#ffffff" stroke-width="2.5"/>
      </g>`
}));

// 1.5 Book Exchange
save('projects', 'book-exchange.svg', makeSvg({
    bg1: '#311042', bg2: '#1e102f', accent: '#c084fc', pattern: 'dots',
    titleTag: 'Peer-to-Peer Academic Book Exchange',
    body: `
      <g transform="translate(190, 45)">
        <rect x="20" y="150" width="180" height="30" rx="4" fill="#3b82f6" stroke="#93c5fd" stroke-width="2"/>
        <rect x="30" y="115" width="160" height="30" rx="4" fill="#8b5cf6" stroke="#c4b5fd" stroke-width="2"/>
        <rect x="40" y="80" width="140" height="30" rx="4" fill="#ec4899" stroke="#fbcfe8" stroke-width="2"/>
        <path d="M 50 45 Q 110 60 110 75 Q 110 60 170 45 L 170 75 Q 110 90 110 75 Q 110 90 50 75 Z" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <g stroke="#38bdf8" stroke-width="3" fill="none">
          <path d="M 0 60 A 90 90 0 0 1 220 60" stroke-dasharray="8,5"/>
          <polyline points="210,45 225,60 210,75"/>
        </g>
      </g>`
}));

// 1.6 Student Portfolio
save('projects', 'portfolio.svg', makeSvg({
    bg1: '#18181b', bg2: '#27272a', accent: '#a855f7', pattern: 'grid',
    titleTag: 'Student Software Portfolio & Projects',
    body: `
      <g transform="translate(160, 45)">
        <rect x="30" y="25" width="220" height="140" rx="8" fill="#09090b" stroke="#71717a" stroke-width="3"/>
        <rect x="38" y="33" width="204" height="124" rx="4" fill="#18181b"/>
        <circle cx="50" cy="43" r="3.5" fill="#ef4444"/><circle cx="62" cy="43" r="3.5" fill="#eab308"/><circle cx="74" cy="43" r="3.5" fill="#22c55e"/>
        <rect x="50" y="60" width="60" height="8" rx="2" fill="#a855f7"/>
        <rect x="50" y="75" width="100" height="6" rx="2" fill="#3b82f6"/>
        <rect x="50" y="88" width="80" height="6" rx="2" fill="#10b981"/>
        <path d="M 0 165 H 280 L 260 180 H 20 Z" fill="#3f3f46" stroke="#71717a" stroke-width="2"/>
      </g>`
}));

// 1.7 Campus Navigator
save('projects', 'navigator.svg', makeSvg({
    bg1: '#0f172a', bg2: '#0284c7', accent: '#38bdf8', pattern: 'grid',
    titleTag: 'MIT-WPU Campus Map & Wayfinder',
    body: `
      <g transform="translate(170, 45)">
        <polygon points="130,10 250,75 130,140 10,75" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <path d="M 40 85 Q 85 105 130 90 T 170 50" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,4"/>
        <g transform="translate(105, 5)">
          <path d="M 25 0 C 11 0, 0 11, 0 25 C 0 43, 25 70, 25 70 C 25 70, 50 43, 50 25 C 50 11, 39 0, 25 0 Z" fill="#ef4444" stroke="#ffffff" stroke-width="2.5"/>
          <circle cx="25" cy="24" r="10" fill="#ffffff"/>
        </g>
      </g>`
}));

// 1.8 Academic Planner
save('projects', 'academic-planner.svg', makeSvg({
    bg1: '#1e1b4b', bg2: '#311042', accent: '#a78bfa', pattern: 'dots',
    titleTag: 'Semester Schedule & Study Planner',
    body: `
      <g transform="translate(160, 45)">
        <rect width="280" height="190" rx="12" fill="#ffffff" stroke="#c4b5fd" stroke-width="2"/>
        <rect width="280" height="42" rx="12" fill="#6d28d9"/>
        <text x="140" y="28" font-family="sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">SEMESTER PLANNER 2026</text>
        <g transform="translate(30, 60)">
          <rect y="5" width="16" height="16" rx="4" fill="#10b981"/><path d="M 3 13 L 7 17 L 13 8" stroke="#ffffff" stroke-width="2" fill="none"/>
          <text x="26" y="18" font-family="sans-serif" font-size="12" font-weight="600" fill="#1f2937">Machine Learning Capstone Sprint</text>
          <rect y="35" width="16" height="16" rx="4" fill="#10b981"/><path d="M 3 43 L 7 47 L 13 38" stroke="#ffffff" stroke-width="2" fill="none"/>
          <text x="26" y="48" font-family="sans-serif" font-size="12" font-weight="600" fill="#1f2937">Vyas Hall Lab Practical Exam</text>
          <rect y="65" width="16" height="16" rx="4" fill="#6366f1"/><circle cx="8" cy="73" r="3" fill="#ffffff"/>
          <text x="26" y="78" font-family="sans-serif" font-size="12" font-weight="600" fill="#4338ca">Hackathon Team Submission [4d left]</text>
        </g>
      </g>`
}));

// 1.9 Smart Energy
save('projects', 'smart-energy.svg', makeSvg({
    bg1: '#064e3b', bg2: '#065f46', accent: '#34d399', pattern: 'grid',
    titleTag: 'Vyas Smart Energy & IoT Optimization',
    body: `
      <g transform="translate(170, 40)">
        <rect x="50" y="40" width="180" height="180" rx="6" fill="#042f2e" stroke="#2dd4bf" stroke-width="2.5"/>
        <polygon points="50,40 140,10 230,40" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
        <rect x="70" y="60" width="30" height="35" rx="3" fill="#facc15"/><rect x="125" y="60" width="30" height="35" rx="3" fill="#facc15"/>
        <rect x="70" y="115" width="30" height="35" rx="3" fill="#facc15"/><rect x="180" y="115" width="30" height="35" rx="3" fill="#facc15"/>
        <path d="M 270 90 L 250 130 H 265 L 245 170" stroke="#facc15" stroke-width="4" fill="none"/>
      </g>`
}));

// 1.10 Air Quality
save('projects', 'air-quality.svg', makeSvg({
    bg1: '#0f766e', bg2: '#134e4a', accent: '#5eead4', pattern: 'dots',
    titleTag: 'Campus Environmental IoT Mesh Network',
    body: `
      <g transform="translate(170, 45)">
        <circle cx="130" cy="100" r="85" fill="#042f2e" stroke="#2dd4bf" stroke-width="4"/>
        <text x="130" y="90" font-family="monospace" font-size="14" font-weight="700" fill="#99f6e4" text-anchor="middle">AQI LEVEL</text>
        <text x="130" y="130" font-family="sans-serif" font-size="38" font-weight="900" fill="#34d399" text-anchor="middle">42</text>
        <line x1="250" y1="40" x2="250" y2="180" stroke="#5eead4" stroke-width="3"/>
        <circle cx="250" cy="35" r="6" fill="#34d399"/>
      </g>`
}));

// 1.11 Water Tank
save('projects', 'water-tank.svg', makeSvg({
    bg1: '#0c4a6e', bg2: '#075985', accent: '#38bdf8', pattern: 'grid',
    titleTag: 'Automated Water Tank Telemetry & Purity',
    body: `
      <g transform="translate(190, 45)">
        <rect x="40" y="20" width="160" height="180" rx="20" fill="#082f49" stroke="#38bdf8" stroke-width="3"/>
        <path d="M 40 80 Q 80 70 120 80 T 200 80 V 180 C 200 190 190 200 180 200 H 60 C 50 200 40 190 40 180 Z" fill="#0284c7" fill-opacity="0.85"/>
        <rect x="100" y="5" width="40" height="18" rx="3" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
        <text x="120" y="135" font-family="monospace" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">78%</text>
      </g>`
}));

// 1.12 AI Risk Predictor
save('projects', 'ai-predictor.svg', makeSvg({
    bg1: '#311042', bg2: '#1e1b4b', accent: '#c084fc', pattern: 'circuit',
    titleTag: 'Student Academic Risk Predictor',
    body: `
      <g transform="translate(160, 45)">
        <circle cx="140" cy="100" r="70" fill="#4c1d95" stroke="#c084fc" stroke-width="3"/>
        <circle cx="100" cy="80" r="10" fill="#f43f5e"/><circle cx="100" cy="120" r="10" fill="#f43f5e"/>
        <circle cx="140" cy="65" r="10" fill="#38bdf8"/><circle cx="140" cy="100" r="10" fill="#38bdf8"/>
        <circle cx="180" cy="100" r="12" fill="#10b981"/>
        <line x1="100" y1="80" x2="140" y2="65" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/>
        <line x1="100" y1="120" x2="140" y2="100" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/>
        <line x1="140" y1="65" x2="180" y2="100" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/>
      </g>`
}));

// 1.13 Local LLM Assistant
save('projects', 'llm-assistant.svg', makeSvg({
    bg1: '#1e1b4b', bg2: '#0f172a', accent: '#818cf8', pattern: 'dots',
    titleTag: 'Multilingual Campus Q&A Assistant',
    body: `
      <g transform="translate(180, 45)">
        <rect x="0" y="20" width="170" height="55" rx="14" fill="#3730a3" stroke="#818cf8" stroke-width="2"/>
        <text x="20" y="52" font-family="sans-serif" font-size="14" font-weight="700" fill="#ffffff">नमस्कार! Exam कब है?</text>
        <rect x="80" y="90" width="180" height="55" rx="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="100" y="122" font-family="sans-serif" font-size="13" font-weight="700" fill="#38bdf8">Vyas Hall: 10:00 AM</text>
      </g>`
}));

// 1.14 Freelance Marketplace
save('projects', 'freelance-marketplace.svg', makeSvg({
    bg1: '#1e1b4b', bg2: '#1e293b', accent: '#3b82f6', pattern: 'grid',
    titleTag: 'Student Freelance & Skill Marketplace',
    body: `
      <g transform="translate(160, 45)">
        <rect width="280" height="180" rx="10" fill="#0f172a" stroke="#3b82f6" stroke-width="2"/>
        <rect x="20" y="25" width="110" height="130" rx="8" fill="#1e293b"/>
        <circle cx="75" cy="65" r="22" fill="#3b82f6"/>
        <text x="75" y="110" font-family="sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">Dev Teammate</text>
        <rect x="150" y="25" width="110" height="130" rx="8" fill="#1e293b"/>
        <circle cx="205" cy="65" r="22" fill="#10b981"/>
        <text x="205" y="110" font-family="sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">UI Designer</text>
      </g>`
}));

// 1.15 Event Ticketing
save('projects', 'ticketing.svg', makeSvg({
    bg1: '#4a044e', bg2: '#18181b', accent: '#f43f5e', pattern: 'dots',
    titleTag: 'Event Registration & Ticketing Pass',
    body: `
      <g transform="translate(170, 45)">
        <rect width="260" height="180" rx="12" fill="#ffffff" stroke="#f43f5e" stroke-width="3"/>
        <rect width="80" height="180" rx="12" fill="#f43f5e"/>
        <circle cx="80" cy="90" r="14" fill="#18181b"/>
        <rect x="110" y="30" width="60" height="60" fill="#000000"/>
        <text x="110" y="125" font-family="sans-serif" font-size="14" font-weight="900" fill="#0f172a">AAROHAN FEST</text>
        <text x="110" y="145" font-family="monospace" font-size="11" fill="#64748b">VIP ACCESS PASS</text>
      </g>`
}));

// 1.16 Prerequisite Graph Visualizer
save('projects', 'prerequisite-graph.svg', makeSvg({
    bg1: '#111827', bg2: '#1e293b', accent: '#10b981', pattern: 'grid',
    titleTag: 'Course Prerequisite Interactive Graph',
    body: `
      <g transform="translate(160, 45)">
        <circle cx="50" cy="100" r="30" fill="#10b981"/><text x="50" y="105" font-family="sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">CS101</text>
        <circle cx="150" cy="50" r="30" fill="#3b82f6"/><text x="150" y="55" font-family="sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">CS201</text>
        <circle cx="150" cy="150" r="30" fill="#8b5cf6"/><text x="150" y="155" font-family="sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">MATH3</text>
        <circle cx="240" cy="100" r="34" fill="#f43f5e"/><text x="240" y="105" font-family="sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">AI 401</text>
        <line x1="80" y1="90" x2="120" y2="60" stroke="#cbd5e1" stroke-width="3"/>
        <line x1="80" y1="110" x2="120" y2="140" stroke="#cbd5e1" stroke-width="3"/>
        <line x1="180" y1="60" x2="210" y2="90" stroke="#cbd5e1" stroke-width="3"/>
        <line x1="180" y1="140" x2="210" y2="110" stroke="#cbd5e1" stroke-width="3"/>
      </g>`
}));

// 1.17 Study Buddy
save('projects', 'study-buddy.svg', makeSvg({
    bg1: '#1e1b4b', bg2: '#311042', accent: '#ec4899', pattern: 'dots',
    titleTag: 'Peer Study Buddy & Roommate Match',
    body: `
      <g transform="translate(170, 45)">
        <circle cx="90" cy="90" r="60" fill="#ec4899" fill-opacity="0.5" stroke="#f472b6" stroke-width="3"/>
        <circle cx="170" cy="90" r="60" fill="#3b82f6" fill-opacity="0.5" stroke="#60a5fa" stroke-width="3"/>
        <text x="130" y="95" font-family="sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">96%</text>
        <text x="130" y="115" font-family="monospace" font-size="11" font-weight="700" fill="#fdf2f8" text-anchor="middle">MATCH</text>
      </g>`
}));

// 1.18 QR Scanner App
save('projects', 'qr-scanner.svg', makeSvg({
    bg1: '#0f172a', bg2: '#0284c7', accent: '#38bdf8', pattern: 'grid',
    titleTag: 'Instant ID Card OCR & QR Scanner',
    body: `
      <g transform="translate(200, 45)">
        <rect width="200" height="180" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <rect x="50" y="40" width="100" height="100" fill="#ffffff"/>
        <rect x="65" y="55" width="70" height="70" fill="#0f172a"/>
        <line x1="20" y1="90" x2="180" y2="90" stroke="#22d3ee" stroke-width="3" filter="drop-shadow(0 0 6px #22d3ee)"/>
      </g>`
}));

// 1.19 Vulnerability Scanner
save('projects', 'vulnerability-scanner.svg', makeSvg({
    bg1: '#4c0519', bg2: '#0f172a', accent: '#f43f5e', pattern: 'circuit',
    titleTag: 'Intranet Vulnerability & Port Scanner',
    body: `
      <g transform="translate(180, 45)">
        <circle cx="120" cy="90" r="75" fill="#1e293b" stroke="#f43f5e" stroke-width="3"/>
        <circle cx="120" cy="90" r="45" fill="none" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,4"/>
        <line x1="120" y1="90" x2="175" y2="40" stroke="#fb7185" stroke-width="3"/>
        <circle cx="160" cy="55" r="6" fill="#fbbf24"/>
      </g>`
}));

// 1.20 Phishing Simulation
save('projects', 'phishing-simulation.svg', makeSvg({
    bg1: '#431407', bg2: '#0f172a', accent: '#fb923c', pattern: 'grid',
    titleTag: 'Cyber Phishing Awareness Suite',
    body: `
      <g transform="translate(180, 45)">
        <path d="M 120 20 L 190 50 V 110 C 190 160, 120 190, 120 190 C 120 190, 50 160, 50 110 V 50 Z" fill="#7c2d12" stroke="#fb923c" stroke-width="3"/>
        <circle cx="120" cy="90" r="22" fill="#ea580c"/>
        <path d="M 110 90 L 117 97 L 132 82" stroke="#ffffff" stroke-width="3.5" fill="none"/>
      </g>`
}));

// 1.21 Cloud Backup
save('projects', 'cloud-backup.svg', makeSvg({
    bg1: '#082f49', bg2: '#0f172a', accent: '#38bdf8', pattern: 'grid',
    titleTag: 'Multi-Cloud Backup & Disaster Recovery',
    body: `
      <g transform="translate(170, 45)">
        <path d="M 170 120 A 45 45 0 0 0 110 80 A 60 60 0 0 0 20 130 A 40 40 0 0 0 50 180 H 190 A 35 35 0 0 0 170 120 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="3"/>
        <path d="M 110 130 V 95 M 95 110 L 110 95 L 125 110" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>`
}));

// 1.22 Observability Dashboard
save('projects', 'observability.svg', makeSvg({
    bg1: '#172554', bg2: '#0f172a', accent: '#60a5fa', pattern: 'grid',
    titleTag: 'Prometheus & Grafana Telemetry Dashboard',
    body: `
      <g transform="translate(160, 45)">
        <rect width="280" height="180" rx="10" fill="#0f172a" stroke="#3b82f6" stroke-width="2"/>
        <polyline points="20,140 60,110 100,125 140,80 180,95 220,50 260,65" fill="none" stroke="#60a5fa" stroke-width="3.5"/>
        <circle cx="220" cy="50" r="5" fill="#facc15"/>
      </g>`
}));

// 1.23 Metro Commute
save('projects', 'metro-commute.svg', makeSvg({
    bg1: '#042f2e', bg2: '#0f172a', accent: '#2dd4bf', pattern: 'grid',
    titleTag: 'Pune Metro & Campus Shuttle Optimization',
    body: `
      <g transform="translate(160, 45)">
        <rect x="20" y="40" width="240" height="110" rx="20" fill="#115e59" stroke="#2dd4bf" stroke-width="3"/>
        <rect x="40" y="55" width="45" height="40" rx="6" fill="#f8fafc"/>
        <rect x="100" y="55" width="45" height="40" rx="6" fill="#f8fafc"/>
        <rect x="160" y="55" width="45" height="40" rx="6" fill="#f8fafc"/>
        <line x1="0" y1="170" x2="280" y2="170" stroke="#94a3b8" stroke-width="6"/>
      </g>`
}));

// 1.24 Placement Analytics
save('projects', 'placement-analytics.svg', makeSvg({
    bg1: '#1e1b4b', bg2: '#0f172a', accent: '#818cf8', pattern: 'grid',
    titleTag: '5-Year Campus Placement Trend Analysis',
    body: `
      <g transform="translate(170, 45)">
        <rect x="20" y="110" width="35" height="70" rx="4" fill="#3b82f6"/>
        <rect x="70" y="80" width="35" height="100" rx="4" fill="#6366f1"/>
        <rect x="120" y="50" width="35" height="130" rx="4" fill="#8b5cf6"/>
        <rect x="170" y="20" width="35" height="160" rx="4" fill="#10b981"/>
        <path d="M 35 100 L 85 70 L 135 40 L 185 10" stroke="#facc15" stroke-width="3.5" fill="none"/>
      </g>`
}));

// 1.25 Sentiment NLP
save('projects', 'sentiment-nlp.svg', makeSvg({
    bg1: '#311042', bg2: '#0f172a', accent: '#f472b6', pattern: 'dots',
    titleTag: 'NLP Sentiment Analysis on Student Feedback',
    body: `
      <g transform="translate(170, 45)">
        <circle cx="80" cy="80" r="50" fill="#10b981" fill-opacity="0.8"/>
        <circle cx="180" cy="110" r="45" fill="#f43f5e" fill-opacity="0.8"/>
        <circle cx="120" cy="140" r="35" fill="#f59e0b" fill-opacity="0.8"/>
        <text x="80" y="85" font-family="sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">POSITIVE</text>
      </g>`
}));

// 1.26 Blockchain Degree Verification
save('projects', 'blockchain-verify.svg', makeSvg({
    bg1: '#2e1065', bg2: '#0f172a', accent: '#a855f7', pattern: 'circuit',
    titleTag: 'Decentralized Degree & Certificate Protocol',
    body: `
      <g transform="translate(170, 45)">
        <rect x="20" y="30" width="70" height="70" rx="10" fill="#581c87" stroke="#c084fc" stroke-width="2.5"/>
        <rect x="150" y="30" width="70" height="70" rx="10" fill="#581c87" stroke="#c084fc" stroke-width="2.5"/>
        <rect x="85" y="110" width="70" height="70" rx="10" fill="#6b21a8" stroke="#c084fc" stroke-width="2.5"/>
        <line x1="90" y1="65" x2="150" y2="65" stroke="#ffffff" stroke-width="3"/>
        <line x1="55" y1="100" x2="85" y2="130" stroke="#ffffff" stroke-width="3"/>
      </g>`
}));

// 1.27 Voting DApp
save('projects', 'voting-dapp.svg', makeSvg({
    bg1: '#1e1b4b', bg2: '#0f172a', accent: '#6366f1', pattern: 'dots',
    titleTag: 'Transparent Student Council Voting DApp',
    body: `
      <g transform="translate(180, 45)">
        <rect x="30" y="60" width="180" height="130" rx="12" fill="#312e81" stroke="#818cf8" stroke-width="3"/>
        <rect x="70" y="20" width="100" height="60" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <path d="M 100 45 L 112 57 L 140 25" stroke="#10b981" stroke-width="4" fill="none"/>
      </g>`
}));

// 1.28 Green Campus Rewards
save('projects', 'green-rewards.svg', makeSvg({
    bg1: '#064e3b', bg2: '#022c22', accent: '#34d399', pattern: 'grid',
    titleTag: 'Campus Green Initiative Token Rewards',
    body: `
      <g transform="translate(190, 45)">
        <circle cx="110" cy="100" r="80" fill="#047857" stroke="#34d399" stroke-width="4"/>
        <path d="M 110 50 C 70 70, 70 130, 110 150 C 150 130, 150 70, 110 50 Z" fill="#a7f3d0"/>
      </g>`
}));

// 1.29 Disinfection Robot
save('projects', 'disinfection-robot.svg', makeSvg({
    bg1: '#1e1b4b', bg2: '#0f172a', accent: '#a855f7', pattern: 'circuit',
    titleTag: 'Autonomous UV-C Disinfection Robot',
    body: `
      <g transform="translate(200, 45)">
        <rect x="40" y="130" width="120" height="60" rx="12" fill="#334155" stroke="#94a3b8" stroke-width="3"/>
        <rect x="60" y="30" width="16" height="100" rx="8" fill="#c084fc" filter="drop-shadow(0 0 8px #c084fc)"/>
        <rect x="92" y="30" width="16" height="100" rx="8" fill="#c084fc" filter="drop-shadow(0 0 8px #c084fc)"/>
        <rect x="124" y="30" width="16" height="100" rx="8" fill="#c084fc" filter="drop-shadow(0 0 8px #c084fc)"/>
      </g>`
}));

// 1.30 Metaverse Tour
save('projects', 'metaverse-tour.svg', makeSvg({
    bg1: '#3b0764', bg2: '#0f172a', accent: '#c084fc', pattern: 'grid',
    titleTag: 'MIT-WPU 3D Virtual Campus Metaverse',
    body: `
      <g transform="translate(170, 50)">
        <rect x="20" y="30" width="220" height="110" rx="30" fill="#18181b" stroke="#c084fc" stroke-width="3"/>
        <circle cx="80" cy="85" r="30" fill="#38bdf8" fill-opacity="0.5"/>
        <circle cx="180" cy="85" r="30" fill="#ec4899" fill-opacity="0.5"/>
      </g>`
}));

// 1.31 AR Simulator
save('projects', 'ar-simulator.svg', makeSvg({
    bg1: '#0369a1', bg2: '#0f172a', accent: '#38bdf8', pattern: 'dots',
    titleTag: 'Augmented Reality Lab Experiment Simulator',
    body: `
      <g transform="translate(210, 45)">
        <circle cx="90" cy="90" r="50" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8" stroke-width="3"/>
        <circle cx="45" cy="55" r="14" fill="#38bdf8"/>
        <circle cx="135" cy="125" r="14" fill="#38bdf8"/>
      </g>`
}));

// 1.32 Flight Simulator
save('projects', 'flight-simulator.svg', makeSvg({
    bg1: '#1e293b', bg2: '#0f172a', accent: '#f59e0b', pattern: 'grid',
    titleTag: 'VR Drone Pilot Flight Simulator',
    body: `
      <g transform="translate(180, 50)">
        <line x1="30" y1="90" x2="210" y2="90" stroke="#f59e0b" stroke-width="4"/>
        <line x1="120" y1="30" x2="120" y2="150" stroke="#f59e0b" stroke-width="4"/>
        <circle cx="30" cy="90" r="20" fill="none" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="210" cy="90" r="20" fill="none" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="120" cy="30" r="20" fill="none" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="120" cy="150" r="20" fill="none" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="120" cy="90" r="15" fill="#ef4444"/>
      </g>`
}));

// ============================================================================
// 2. ALL BULLETINS ASSETS
// ============================================================================
const BULLETINS = [
    { f: 'academic.svg', t: 'Official Academic Circular', c: '#2563eb', b1: '#172554', b2: '#0f172a' },
    { f: 'placements.svg', t: 'Campus Placement & Recruitment', c: '#16a34a', b1: '#052e16', b2: '#0f172a' },
    { f: 'internships.svg', t: 'Summer & Winter Internships', c: '#0d9488', b1: '#042f2e', b2: '#0f172a' },
    { f: 'hackathons.svg', t: 'Hackathon Innovation Challenge', c: '#db2777', b1: '#500724', b2: '#0f172a' },
    { f: 'workshops.svg', t: 'Hands-on Technical Workshop', c: '#7c3aed', b1: '#2e1065', b2: '#0f172a' },
    { f: 'clubs.svg', t: 'Student Club Activities & Drive', c: '#ea580c', b1: '#431407', b2: '#0f172a' },
    { f: 'cultural.svg', t: 'Aarohan Cultural Festival', c: '#c026d3', b1: '#4a044e', b2: '#0f172a' },
    { f: 'sports.svg', t: 'Sports Championship & Athletics', c: '#ca8a04', b1: '#422006', b2: '#0f172a' },
    { f: 'research.svg', t: 'Research Papers & Symposium', c: '#0284c7', b1: '#082f49', b2: '#0f172a' },
    { f: 'scholarships.svg', t: 'Merit Scholarships & Financial Aid', c: '#059669', b1: '#064e3b', b2: '#0f172a' },
    { f: 'announcements.svg', t: 'Campus Administration Circular', c: '#475569', b1: '#1e293b', b2: '#0f172a' },
    { f: 'competitions.svg', t: 'Inter-College Competition & Awards', c: '#e11d48', b1: '#4c0519', b2: '#0f172a' },
    { f: 'career.svg', t: 'Career Guidance & Resume Reviews', c: '#6d28d9', b1: '#2e1065', b2: '#0f172a' },
    { f: 'default.svg', t: 'MIT-WPU Campus Bulletin', c: '#7c3aed', b1: '#1e1b4b', b2: '#0f172a' }
];

for (const b of BULLETINS) {
    save('bulletins', b.f, makeSvg({
        bg1: b.b1, bg2: b.b2, accent: b.c, pattern: 'grid',
        titleTag: b.t,
        body: `
          <g transform="translate(200, 50)">
            <circle cx="100" cy="80" r="65" fill="${b.c}" fill-opacity="0.3" stroke="${b.c}" stroke-width="3"/>
            <circle cx="100" cy="80" r="30" fill="${b.c}"/>
          </g>`
    }));
}

// ============================================================================
// 3. ALL EVENTS ASSETS
// ============================================================================
const EVENTS = [
    { f: 'workshop.svg', t: 'Hands-on Technical Lab Workshop', c: '#7c3aed', b1: '#2e1065', b2: '#0f172a' },
    { f: 'hackathon.svg', t: '36-Hour Hackathon Sprint', c: '#db2777', b1: '#500724', b2: '#0f172a' },
    { f: 'guest-lecture.svg', t: 'Distinguished Keynote & Lecture', c: '#2563eb', b1: '#172554', b2: '#0f172a' },
    { f: 'seminar.svg', t: 'Academic Seminar & Colloquium', c: '#0284c7', b1: '#082f49', b2: '#0f172a' },
    { f: 'cultural.svg', t: 'Campus Cultural Showcase & Fest', c: '#c026d3', b1: '#4a044e', b2: '#0f172a' },
    { f: 'sports.svg', t: 'Inter-Department Sports Cup', c: '#ca8a04', b1: '#422006', b2: '#0f172a' },
    { f: 'club.svg', t: 'Student Organization Showcase', c: '#ea580c', b1: '#431407', b2: '#0f172a' },
    { f: 'placement.svg', t: 'Placement Preparation & Mock Drive', c: '#16a34a', b1: '#052e16', b2: '#0f172a' },
    { f: 'research.svg', t: 'Research Symposium & Paper Track', c: '#0284c7', b1: '#082f49', b2: '#0f172a' },
    { f: 'entrepreneurship.svg', t: 'Venture & Startup Pitch Day', c: '#e11d48', b1: '#4c0519', b2: '#0f172a' },
    { f: 'default.svg', t: 'MIT-WPU Campus Event', c: '#7c3aed', b1: '#1e1b4b', b2: '#0f172a' }
];

for (const ev of EVENTS) {
    save('events', ev.f, makeSvg({
        bg1: ev.b1, bg2: ev.b2, accent: ev.c, pattern: 'dots',
        titleTag: ev.t,
        body: `
          <g transform="translate(200, 50)">
            <circle cx="100" cy="80" r="65" fill="${ev.c}" fill-opacity="0.3" stroke="${ev.c}" stroke-width="3"/>
            <polygon points="100,50 125,100 75,100" fill="${ev.c}"/>
          </g>`
    }));
}

// ============================================================================
// 4. ALL OPPORTUNITIES ASSETS
// ============================================================================
const OPPS = [
    { f: 'internships.svg', t: 'Corporate Internship Opportunity', c: '#2563eb', b1: '#172554', b2: '#0f172a' },
    { f: 'hackathons.svg', t: 'Hackathon Challenge & Grant', c: '#db2777', b1: '#500724', b2: '#0f172a' },
    { f: 'scholarships.svg', t: 'University Merit Scholarship', c: '#059669', b1: '#064e3b', b2: '#0f172a' },
    { f: 'research.svg', t: 'Paid Research Assistantship', c: '#0284c7', b1: '#082f49', b2: '#0f172a' },
    { f: 'competitions.svg', t: 'National Engineering Contest', c: '#e11d48', b1: '#4c0519', b2: '#0f172a' },
    { f: 'workshops.svg', t: 'Certified Technical Bootcamp', c: '#7c3aed', b1: '#2e1065', b2: '#0f172a' },
    { f: 'certifications.svg', t: 'Professional Industry Credential', c: '#0d9488', b1: '#042f2e', b2: '#0f172a' },
    { f: 'placement-prep.svg', t: 'Placement & DSA Interview Prep', c: '#16a34a', b1: '#052e16', b2: '#0f172a' },
    { f: 'entrepreneurship.svg', t: 'Startup Seed Grant & Incubation', c: '#ea580c', b1: '#431407', b2: '#0f172a' },
    { f: 'default.svg', t: 'Career Opportunity', c: '#7c3aed', b1: '#1e1b4b', b2: '#0f172a' }
];

for (const op of OPPS) {
    save('opportunities', op.f, makeSvg({
        bg1: op.b1, bg2: op.b2, accent: op.c, pattern: 'grid',
        titleTag: op.t,
        body: `
          <g transform="translate(200, 50)">
            <circle cx="100" cy="80" r="65" fill="${op.c}" fill-opacity="0.3" stroke="${op.c}" stroke-width="3"/>
            <rect x="75" y="55" width="50" height="50" rx="8" fill="${op.c}"/>
          </g>`
    }));
}

console.log("✅ All assets generated successfully in frontend/public and frontend/dist!");
