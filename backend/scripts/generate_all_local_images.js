const fs = require('fs');
const path = require('path');

const publicImagesDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images');
const distImagesDir = path.join(__dirname, '..', '..', 'frontend', 'dist', 'images');

// Full-bleed professional SVG generator
// No card-in-a-card, no "Campus Announcement" badges, no graduation caps on projects/items
function buildSvg({ bgStart, bgEnd, pattern = 'grid', accentColor = '#7c3aed', contentSvg }) {
    let patternDef = '';
    if (pattern === 'grid') {
        patternDef = `
        <pattern id="pat" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="${accentColor}" stroke-width="0.8" stroke-opacity="0.12"/>
        </pattern>`;
    } else if (pattern === 'dots') {
        patternDef = `
        <pattern id="pat" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.5" fill="${accentColor}" fill-opacity="0.16"/>
        </pattern>`;
    } else if (pattern === 'circuit') {
        patternDef = `
        <pattern id="pat" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 0 30 H 60 M 30 0 V 60 M 15 15 H 45 V 45 H 15 Z" fill="none" stroke="${accentColor}" stroke-width="0.7" stroke-opacity="0.12"/>
            <circle cx="30" cy="30" r="3" fill="${accentColor}" fill-opacity="0.2"/>
        </pattern>`;
    } else {
        patternDef = '';
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgStart}"/>
      <stop offset="100%" stop-color="${bgEnd}"/>
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
    </radialGradient>
    ${patternDef}
  </defs>

  <!-- Background Base -->
  <rect width="600" height="360" fill="url(#bgGrad)"/>
  ${patternDef ? '<rect width="600" height="360" fill="url(#pat)"/>' : ''}

  <!-- Ambient Glow -->
  <circle cx="300" cy="180" r="160" fill="url(#glowGrad)"/>

  <!-- Content Layer -->
  ${contentSvg}
</svg>`;
}

// Ensure directory exists
function writeSvg(subDir, fileName, svgContent) {
    const pubDir = path.join(publicImagesDir, subDir);
    fs.mkdirSync(pubDir, { recursive: true });
    fs.writeFileSync(path.join(pubDir, fileName), svgContent, 'utf8');

    if (fs.existsSync(path.dirname(distImagesDir))) {
        const dDir = path.join(distImagesDir, subDir);
        fs.mkdirSync(dDir, { recursive: true });
        fs.writeFileSync(path.join(dDir, fileName), svgContent, 'utf8');
    }
}

console.log("Generating 100% Subject-Specific Full-Bleed Illustrations...");

// ============================================================================
// 1. PROJECTS — TOPIC-SPECIFIC ASSETS
// ============================================================================

// 1.1 Face Recognition Attendance Tracker (attendance.svg)
writeSvg('projects', 'attendance.svg', buildSvg({
    bgStart: '#0f172a',
    bgEnd: '#1e1b4b',
    accentColor: '#38bdf8',
    pattern: 'circuit',
    contentSvg: `
      <!-- Face Wireframe Silhouette -->
      <g transform="translate(180, 50)" stroke="#38bdf8" stroke-width="2" fill="none">
        <!-- Head Contour -->
        <path d="M 60 40 C 60 10, 180 10, 180 40 C 180 110, 190 180, 150 230 C 130 255, 110 255, 90 230 C 50 180, 60 110, 60 40 Z" stroke-opacity="0.8" fill="#1e293b" fill-opacity="0.5"/>
        <!-- Eyes / Nose / Mouth Meshes -->
        <ellipse cx="95" cy="100" rx="16" ry="8" stroke="#00f2fe" stroke-width="1.8"/>
        <circle cx="95" cy="100" r="3" fill="#00f2fe"/>
        <ellipse cx="145" cy="100" rx="16" ry="8" stroke="#00f2fe" stroke-width="1.8"/>
        <circle cx="145" cy="100" r="3" fill="#00f2fe"/>
        <path d="M 120 105 L 115 140 L 125 140 Z" stroke="#38bdf8" stroke-width="1.5"/>
        <path d="M 100 175 Q 120 195 140 175" stroke="#38bdf8" stroke-width="2"/>
        <!-- Biometric Mesh Points -->
        <g fill="#38bdf8">
          <circle cx="70" cy="50" r="3"/><circle cx="120" cy="30" r="3"/><circle cx="170" cy="50" r="3"/>
          <circle cx="65" cy="130" r="3"/><circle cx="175" cy="130" r="3"/>
          <circle cx="90" cy="210" r="3"/><circle cx="150" cy="210" r="3"/>
          <line x1="70" y1="50" x2="120" y2="30" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4"/>
          <line x1="170" y1="50" x2="120" y2="30" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4"/>
          <line x1="95" y1="100" x2="120" y2="105" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4"/>
          <line x1="145" y1="100" x2="120" y2="105" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4"/>
        </g>
        <!-- Scanning Laser Beam -->
        <line x1="20" y1="120" x2="220" y2="120" stroke="#22d3ee" stroke-width="3" filter="drop-shadow(0 0 8px #00f2fe)"/>
        <!-- Target Corners -->
        <path d="M 30 50 H 10 V 70" stroke="#22d3ee" stroke-width="3.5"/>
        <path d="M 210 50 H 230 V 70" stroke="#22d3ee" stroke-width="3.5"/>
        <path d="M 30 220 H 10 V 200" stroke="#22d3ee" stroke-width="3.5"/>
        <path d="M 210 220 H 230 V 200" stroke="#22d3ee" stroke-width="3.5"/>
      </g>
      <!-- HUD Telemetry Badges -->
      <g transform="translate(60, 290)">
        <rect width="180" height="34" rx="8" fill="#0284c7" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="90" y="22" font-family="monospace" font-size="12" font-weight="700" fill="#38bdf8" text-anchor="middle">FACE ID: VERIFIED 99.8%</text>
      </g>
      <g transform="translate(360, 290)">
        <rect width="180" height="34" rx="8" fill="#059669" fill-opacity="0.25" stroke="#34d399" stroke-width="1.5"/>
        <text x="90" y="22" font-family="monospace" font-size="12" font-weight="700" fill="#34d399" text-anchor="middle">LMS ATTENDANCE: LOGGED</text>
      </g>`
}));

// 1.2 Crop Disease Classifier (crop-disease.svg)
writeSvg('projects', 'crop-disease.svg', buildSvg({
    bgStart: '#064e3b',
    bgEnd: '#022c22',
    accentColor: '#10b981',
    pattern: 'grid',
    contentSvg: `
      <!-- Botanical Leaves -->
      <g transform="translate(180, 50)">
        <!-- Left Healthy Leaf -->
        <path d="M 120 230 C 50 180, 20 100, 60 40 C 130 50, 140 160, 120 230 Z" fill="#10b981" fill-opacity="0.85" stroke="#34d399" stroke-width="2"/>
        <path d="M 60 40 C 80 100, 100 160, 120 230" stroke="#064e3b" stroke-width="2" fill="none"/>
        <path d="M 75 80 Q 95 90 105 110 M 65 120 Q 90 130 110 150" stroke="#064e3b" stroke-width="1.5" fill="none"/>

        <!-- Right Diagnostic Target Leaf with Disease Spot -->
        <path d="M 120 230 C 190 180, 220 100, 180 40 C 110 50, 100 160, 120 230 Z" fill="#059669" fill-opacity="0.8" stroke="#34d399" stroke-width="2"/>
        <path d="M 180 40 C 160 100, 140 160, 120 230" stroke="#064e3b" stroke-width="2" fill="none"/>

        <!-- Disease Lesions -->
        <ellipse cx="160" cy="110" rx="18" ry="12" fill="#78350f" fill-opacity="0.9" stroke="#f59e0b" stroke-width="1.5"/>
        <ellipse cx="145" cy="140" rx="12" ry="8" fill="#78350f" fill-opacity="0.85" stroke="#f59e0b" stroke-width="1.5"/>

        <!-- AI Diagnostic Inspection Reticle -->
        <circle cx="160" cy="110" r="38" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="6,4" fill="none"/>
        <circle cx="160" cy="110" r="5" fill="#f59e0b"/>
        <line x1="110" y1="110" x2="210" y2="110" stroke="#fbbf24" stroke-width="1.5" stroke-opacity="0.7"/>
        <line x1="160" y1="60" x2="160" y2="160" stroke="#fbbf24" stroke-width="1.5" stroke-opacity="0.7"/>
      </g>
      <!-- Classification Banner -->
      <g transform="translate(140, 290)">
        <rect width="320" height="36" rx="8" fill="#78350f" fill-opacity="0.7" stroke="#fbbf24" stroke-width="1.5"/>
        <text x="160" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#fef3c7" text-anchor="middle">LEAF SCAB DETECTED • CONFIDENCE: 98.4%</text>
      </g>`
}));

// 1.3 End-to-End Encrypted Student Academic File Vault (encrypted-vault.svg)
writeSvg('projects', 'encrypted-vault.svg', buildSvg({
    bgStart: '#111827',
    bgEnd: '#1e1b4b',
    accentColor: '#818cf8',
    pattern: 'circuit',
    contentSvg: `
      <!-- Heavy Vault Door -->
      <g transform="translate(190, 45)">
        <!-- Outer Steel Ring -->
        <circle cx="110" cy="110" r="100" fill="#1f2937" stroke="#6366f1" stroke-width="4"/>
        <circle cx="110" cy="110" r="85" fill="#111827" stroke="#4f46e5" stroke-width="2"/>
        <!-- Vault Locking Bolts -->
        <circle cx="110" cy="22" r="7" fill="#818cf8"/><circle cx="110" cy="198" r="7" fill="#818cf8"/>
        <circle cx="22" cy="110" r="7" fill="#818cf8"/><circle cx="198" cy="110" r="7" fill="#818cf8"/>
        <circle cx="48" cy="48" r="7" fill="#818cf8"/><circle cx="172" cy="172" r="7" fill="#818cf8"/>
        <circle cx="48" cy="172" r="7" fill="#818cf8"/><circle cx="172" cy="48" r="7" fill="#818cf8"/>

        <!-- Central Rotary Combination Dial -->
        <circle cx="110" cy="110" r="55" fill="#312e81" stroke="#a5b4fc" stroke-width="3"/>
        <!-- Shield & Padlock Core -->
        <path d="M 110 80 L 132 90 V 115 C 132 130 110 142 110 142 C 110 142 88 130 88 115 V 90 Z" fill="#4338ca" stroke="#c7d2fe" stroke-width="2"/>
        <circle cx="110" cy="106" r="4.5" fill="#ffffff"/>
        <path d="M 110 110 V 120" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <!-- Hex Encryption Stream -->
      <text x="60" y="80" font-family="monospace" font-size="11" fill="#6366f1" fill-opacity="0.6">AES-256-GCM</text>
      <text x="60" y="100" font-family="monospace" font-size="11" fill="#6366f1" fill-opacity="0.4">0x4F8A7B2C</text>
      <text x="60" y="120" font-family="monospace" font-size="11" fill="#6366f1" fill-opacity="0.3">RSA-4096 BIT</text>
      <text x="460" y="80" font-family="monospace" font-size="11" fill="#6366f1" fill-opacity="0.6">ZERO-KNOWLEDGE</text>
      <text x="460" y="100" font-family="monospace" font-size="11" fill="#6366f1" fill-opacity="0.4">SHA-512 HASH</text>
      <text x="460" y="120" font-family="monospace" font-size="11" fill="#6366f1" fill-opacity="0.3">VERIFIED KEY</text>
      <!-- Status Badge -->
      <g transform="translate(160, 290)">
        <rect width="280" height="36" rx="8" fill="#312e81" fill-opacity="0.8" stroke="#818cf8" stroke-width="1.5"/>
        <text x="140" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#e0e7ff" text-anchor="middle">END-TO-END ENCRYPTED VAULT</text>
      </g>`
}));

// 1.4 Automated Code Judging Sandbox on Kubernetes (kubernetes-sandbox.svg)
writeSvg('projects', 'kubernetes-sandbox.svg', buildSvg({
    bgStart: '#0c4a6e',
    bgEnd: '#082f49',
    accentColor: '#38bdf8',
    pattern: 'grid',
    contentSvg: `
      <!-- Code Terminal Window -->
      <g transform="translate(60, 45)">
        <rect width="260" height="190" rx="8" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
        <rect width="260" height="26" rx="8" fill="#1e293b"/>
        <circle cx="16" cy="13" r="4.5" fill="#ef4444"/><circle cx="30" cy="13" r="4.5" fill="#eab308"/><circle cx="44" cy="13" r="4.5" fill="#22c55e"/>
        <text x="65" y="17" font-family="monospace" font-size="10" fill="#94a3b8">sandbox-cgroups-worker-01</text>
        <!-- Code output lines -->
        <text x="16" y="55" font-family="monospace" font-size="11" fill="#38bdf8">$ g++ solution.cpp -O3</text>
        <text x="16" y="80" font-family="monospace" font-size="11" fill="#94a3b8">Testcase 1: PASS [0.012s]</text>
        <text x="16" y="105" font-family="monospace" font-size="11" fill="#94a3b8">Testcase 2: PASS [0.018s]</text>
        <text x="16" y="130" font-family="monospace" font-size="11" fill="#94a3b8">Testcase 3: PASS [0.021s]</text>
        <text x="16" y="160" font-family="monospace" font-size="12" font-weight="700" fill="#4ade80">ACCEPTED • 100/100 PTS</text>
      </g>
      <!-- Kubernetes Helm & Pods -->
      <g transform="translate(370, 50)">
        <!-- K8s Wheel -->
        <circle cx="85" cy="85" r="70" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8" stroke-width="3"/>
        <circle cx="85" cy="85" r="28" fill="#0284c7" stroke="#ffffff" stroke-width="2.5"/>
        <!-- 7 Spokes -->
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round">
          <line x1="85" y1="15" x2="85" y2="57"/>
          <line x1="145" y1="52" x2="108" y2="73"/>
          <line x1="150" y1="120" x2="110" y2="98"/>
          <line x1="100" y1="155" x2="92" y2="113"/>
          <line x1="45" y1="140" x2="68" y2="105"/>
          <line x1="25" y1="78" x2="62" y2="82"/>
          <line x1="50" y1="30" x2="72" y2="65"/>
        </g>
        <!-- Pod Cubes -->
        <g transform="translate(20, 160)" stroke="#38bdf8" stroke-width="1.5" fill="#0369a1">
          <polygon points="25,5 45,15 25,25 5,15"/>
          <polygon points="5,15 25,25 25,45 5,35"/>
          <polygon points="45,15 25,25 25,45 45,35"/>
        </g>
        <g transform="translate(90, 160)" stroke="#38bdf8" stroke-width="1.5" fill="#0369a1">
          <polygon points="25,5 45,15 25,25 5,15"/>
          <polygon points="5,15 25,25 25,45 5,35"/>
          <polygon points="45,15 25,25 25,45 45,35"/>
        </g>
      </g>
      <!-- Footer Badge -->
      <g transform="translate(150, 290)">
        <rect width="300" height="36" rx="8" fill="#0f172a" fill-opacity="0.8" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="150" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#38bdf8" text-anchor="middle">CONTAINERIZED RUNNER ON K8S</text>
      </g>`
}));

// 1.5 Book Exchange & Library (book-exchange.svg)
writeSvg('projects', 'book-exchange.svg', buildSvg({
    bgStart: '#311042',
    bgEnd: '#1e102f',
    accentColor: '#c084fc',
    pattern: 'dots',
    contentSvg: `
      <!-- Books Stack & Exchange Arrows -->
      <g transform="translate(180, 50)">
        <!-- Stacked Books -->
        <rect x="30" y="160" width="180" height="30" rx="4" fill="#3b82f6" stroke="#93c5fd" stroke-width="2"/>
        <line x1="30" y1="175" x2="210" y2="175" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.6"/>
        <rect x="40" y="125" width="160" height="30" rx="4" fill="#8b5cf6" stroke="#c4b5fd" stroke-width="2"/>
        <line x1="40" y1="140" x2="200" y2="140" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.6"/>
        <rect x="50" y="90" width="140" height="30" rx="4" fill="#ec4899" stroke="#fbcfe8" stroke-width="2"/>
        <line x1="50" y1="105" x2="190" y2="105" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.6"/>
        
        <!-- Open Top Book with Glowing Bookmark -->
        <path d="M 60 55 Q 120 70 120 85 Q 120 70 180 55 L 180 85 Q 120 100 120 85 Q 120 100 60 85 Z" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <path d="M 120 60 V 95" stroke="#e11d48" stroke-width="3"/>

        <!-- Exchange Recycling Arrows -->
        <g stroke="#38bdf8" stroke-width="3" fill="none">
          <path d="M 10 70 A 90 90 0 0 1 230 70" stroke-dasharray="8,5"/>
          <polyline points="220,55 235,70 220,85"/>
          <path d="M 230 200 A 90 90 0 0 1 10 200" stroke-dasharray="8,5"/>
          <polyline points="20,185 5,200 20,215"/>
        </g>
      </g>
      <!-- Footer Badge -->
      <g transform="translate(160, 290)">
        <rect width="280" height="36" rx="8" fill="#1e102f" fill-opacity="0.8" stroke="#c084fc" stroke-width="1.5"/>
        <text x="140" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#e9d5ff" text-anchor="middle">PEER-TO-PEER BOOK EXCHANGE</text>
      </g>`
}));

// 1.6 Student Portfolio & Showcase (portfolio.svg)
writeSvg('projects', 'portfolio.svg', buildSvg({
    bgStart: '#18181b',
    bgEnd: '#27272a',
    accentColor: '#a855f7',
    pattern: 'grid',
    contentSvg: `
      <!-- Modern Developer Desk & Laptop Workstation -->
      <g transform="translate(150, 45)">
        <!-- Laptop Screen -->
        <rect x="40" y="30" width="220" height="140" rx="8" fill="#09090b" stroke="#71717a" stroke-width="3"/>
        <rect x="48" y="38" width="204" height="124" rx="4" fill="#18181b"/>
        <!-- Window Bar -->
        <circle cx="60" cy="48" r="3.5" fill="#ef4444"/><circle cx="72" cy="48" r="3.5" fill="#eab308"/><circle cx="84" cy="48" r="3.5" fill="#22c55e"/>
        <!-- Code / UI Wireframe on Laptop -->
        <rect x="60" y="62" width="60" height="8" rx="2" fill="#a855f7"/>
        <rect x="60" y="76" width="100" height="6" rx="2" fill="#3b82f6"/>
        <rect x="60" y="88" width="80" height="6" rx="2" fill="#10b981"/>
        <rect x="145" y="62" width="90" height="85" rx="4" fill="#27272a" stroke="#52525b" stroke-width="1.5"/>
        <circle cx="190" cy="90" r="16" fill="#a855f7" fill-opacity="0.4"/>
        <!-- Laptop Base -->
        <path d="M 10 170 H 290 L 270 185 H 30 Z" fill="#3f3f46" stroke="#71717a" stroke-width="2"/>
        <rect x="125" y="172" width="50" height="4" rx="2" fill="#71717a"/>
      </g>
      <!-- Skill Radar Badges -->
      <g transform="translate(160, 290)">
        <rect width="280" height="36" rx="8" fill="#09090b" fill-opacity="0.8" stroke="#a855f7" stroke-width="1.5"/>
        <text x="140" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#f3e8ff" text-anchor="middle">STUDENT DEVELOPER PORTFOLIO</text>
      </g>`
}));

// 1.7 Campus Navigator & Indoor Wayfinder (navigator.svg)
writeSvg('projects', 'navigator.svg', buildSvg({
    bgStart: '#0f172a',
    bgEnd: '#0284c7',
    accentColor: '#38bdf8',
    pattern: 'grid',
    contentSvg: `
      <!-- Isometric Campus Map & GPS Pin -->
      <g transform="translate(170, 45)">
        <!-- 3D Isometric Map Base -->
        <polygon points="130,10 250,75 130,140 10,75" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <!-- Campus Buildings 3D -->
        <!-- Vyas Building -->
        <g transform="translate(50, 45)">
          <polygon points="25,5 50,18 25,32 0,18" fill="#38bdf8" fill-opacity="0.8"/>
          <polygon points="0,18 25,32 25,60 0,46" fill="#0284c7"/>
          <polygon points="50,18 25,32 25,60 50,46" fill="#0369a1"/>
        </g>
        <!-- Dhruv Building -->
        <g transform="translate(140, 40)">
          <polygon points="25,5 50,18 25,32 0,18" fill="#818cf8" fill-opacity="0.8"/>
          <polygon points="0,18 25,32 25,70 0,56" fill="#4f46e5"/>
          <polygon points="50,18 25,32 25,70 50,56" fill="#4338ca"/>
        </g>
        <!-- Navigation Route Path -->
        <path d="M 40 85 Q 85 105 130 90 T 170 50" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,4"/>
        
        <!-- Large 3D Map Pin -->
        <g transform="translate(105, 5)">
          <path d="M 25 0 C 11 0, 0 11, 0 25 C 0 43, 25 70, 25 70 C 25 70, 50 43, 50 25 C 50 11, 39 0, 25 0 Z" fill="#ef4444" stroke="#ffffff" stroke-width="2.5" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))"/>
          <circle cx="25" cy="24" r="10" fill="#ffffff"/>
        </g>
      </g>
      <!-- Location HUD -->
      <g transform="translate(150, 290)">
        <rect width="300" height="36" rx="8" fill="#0f172a" fill-opacity="0.8" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="150" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#bae6fd" text-anchor="middle">MIT-WPU INDOOR GPS NAVIGATION</text>
      </g>`
}));

// 1.8 Academic Planner & Schedule (academic-planner.svg)
writeSvg('projects', 'academic-planner.svg', buildSvg({
    bgStart: '#1e1b4b',
    bgEnd: '#311042',
    accentColor: '#a78bfa',
    pattern: 'dots',
    contentSvg: `
      <!-- Calendar Schedule & Goal Rings -->
      <g transform="translate(160, 45)">
        <!-- Calendar Base -->
        <rect width="280" height="190" rx="12" fill="#ffffff" stroke="#c4b5fd" stroke-width="2"/>
        <rect width="280" height="42" rx="12" fill="#6d28d9"/>
        <!-- Ring loops -->
        <rect x="40" y="-8" width="12" height="20" rx="4" fill="#4c1d95"/>
        <rect x="90" y="-8" width="12" height="20" rx="4" fill="#4c1d95"/>
        <rect x="140" y="-8" width="12" height="20" rx="4" fill="#4c1d95"/>
        <rect x="190" y="-8" width="12" height="20" rx="4" fill="#4c1d95"/>
        <rect x="230" y="-8" width="12" height="20" rx="4" fill="#4c1d95"/>
        <text x="140" y="28" font-family="sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">SEMESTER PLANNER 2026</text>
        
        <!-- Checklist items -->
        <g transform="translate(30, 60)">
          <rect y="5" width="16" height="16" rx="4" fill="#10b981"/><path d="M 3 13 L 7 17 L 13 8" stroke="#ffffff" stroke-width="2" fill="none"/>
          <text x="26" y="18" font-family="sans-serif" font-size="12" font-weight="600" fill="#1f2937">Machine Learning Capstone Milestone</text>
          
          <rect y="35" width="16" height="16" rx="4" fill="#10b981"/><path d="M 3 43 L 7 47 L 13 38" stroke="#ffffff" stroke-width="2" fill="none"/>
          <text x="26" y="48" font-family="sans-serif" font-size="12" font-weight="600" fill="#1f2937">Vyas Hall Lab Practical Exam</text>
          
          <rect y="65" width="16" height="16" rx="4" fill="#6366f1"/><circle cx="8" cy="73" r="3" fill="#ffffff"/>
          <text x="26" y="78" font-family="sans-serif" font-size="12" font-weight="600" fill="#4338ca">Hackathon Team Submission [4d left]</text>

          <rect y="95" width="16" height="16" rx="4" fill="#e5e7eb"/>
          <text x="26" y="108" font-family="sans-serif" font-size="12" font-weight="600" fill="#9ca3af">Campus Placement Mock Interview</text>
        </g>
      </g>
      <g transform="translate(150, 290)">
        <rect width="300" height="36" rx="8" fill="#1e1b4b" fill-opacity="0.8" stroke="#a78bfa" stroke-width="1.5"/>
        <text x="150" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#ddd6fe" text-anchor="middle">ACADEMIC DEADLINE & STUDY PLANNER</text>
      </g>`
}));

// 1.9 Smart Energy & Lighting Optimization (smart-energy.svg)
writeSvg('projects', 'smart-energy.svg', buildSvg({
    bgStart: '#064e3b',
    bgEnd: '#065f46',
    accentColor: '#34d399',
    pattern: 'grid',
    contentSvg: `
      <!-- Smart Building & Solar Power Grid -->
      <g transform="translate(160, 40)">
        <!-- Building Frame -->
        <rect x="50" y="40" width="180" height="180" rx="6" fill="#042f2e" stroke="#2dd4bf" stroke-width="2.5"/>
        <!-- Rooftop Solar Panels -->
        <polygon points="50,40 140,10 230,40" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
        <line x1="80" y1="30" x2="200" y2="30" stroke="#bae6fd" stroke-width="1.5"/>
        <line x1="140" y1="10" x2="140" y2="40" stroke="#bae6fd" stroke-width="1.5"/>
        <!-- Glowing Windows (PIR Motion Detected) -->
        <rect x="70" y="60" width="30" height="35" rx="3" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
        <rect x="125" y="60" width="30" height="35" rx="3" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
        <rect x="180" y="60" width="30" height="35" rx="3" fill="#134e4a" stroke="#2dd4bf" stroke-width="1"/>
        <rect x="70" y="115" width="30" height="35" rx="3" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
        <rect x="125" y="115" width="30" height="35" rx="3" fill="#134e4a" stroke="#2dd4bf" stroke-width="1"/>
        <rect x="180" y="115" width="30" height="35" rx="3" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>

        <!-- Energy Lightning Pulse -->
        <path d="M 270 90 L 250 130 H 265 L 245 170" stroke="#facc15" stroke-width="4" fill="none" stroke-linejoin="round"/>
      </g>
      <!-- Telemetry Gauge -->
      <g transform="translate(140, 290)">
        <rect width="320" height="36" rx="8" fill="#042f2e" fill-opacity="0.8" stroke="#34d399" stroke-width="1.5"/>
        <text x="160" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#a7f3d0" text-anchor="middle">VYAS ENERGY OPTIMIZATION • -34.2%</text>
      </g>`
}));

// 1.10 Campus Air Quality & Noise Monitoring (air-quality.svg)
writeSvg('projects', 'air-quality.svg', buildSvg({
    bgStart: '#0f766e',
    bgEnd: '#134e4a',
    accentColor: '#5eead4',
    pattern: 'dots',
    contentSvg: `
      <!-- Environmental Sensor Tower & AQI Dial -->
      <g transform="translate(160, 45)">
        <!-- Central Circular AQI Gauge -->
        <circle cx="140" cy="100" r="85" fill="#042f2e" stroke="#2dd4bf" stroke-width="4"/>
        <circle cx="140" cy="100" r="72" fill="#115e59" stroke="#5eead4" stroke-width="1.5" stroke-dasharray="8,4"/>
        <!-- Needle & Score -->
        <text x="140" y="90" font-family="monospace" font-size="14" font-weight="700" fill="#99f6e4" text-anchor="middle">AQI LEVEL</text>
        <text x="140" y="130" font-family="sans-serif" font-size="38" font-weight="900" fill="#34d399" text-anchor="middle">42</text>
        <text x="140" y="155" font-family="monospace" font-size="11" font-weight="700" fill="#a7f3d0" text-anchor="middle">AIR QUALITY: GOOD</text>

        <!-- Sensor Antenna -->
        <line x1="260" y1="40" x2="260" y2="180" stroke="#5eead4" stroke-width="3"/>
        <circle cx="260" cy="35" r="6" fill="#34d399"/>
        <!-- Sound Waves -->
        <path d="M 270 45 A 25 25 0 0 1 270 85" stroke="#5eead4" stroke-width="2" fill="none"/>
        <path d="M 280 35 A 40 40 0 0 1 280 95" stroke="#5eead4" stroke-width="2" fill="none"/>
      </g>
      <!-- Telemetry Bar -->
      <g transform="translate(130, 290)">
        <rect width="340" height="36" rx="8" fill="#042f2e" fill-opacity="0.8" stroke="#5eead4" stroke-width="1.5"/>
        <text x="170" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#ccfbf1" text-anchor="middle">PM2.5: 12 ug/m3 • NOISE: 48 dB (ATRI LAWNS)</text>
      </g>`
}));

// 1.11 Automated Water Tank Level & Purity Sensor Network (water-tank.svg)
writeSvg('projects', 'water-tank.svg', buildSvg({
    bgStart: '#0c4a6e',
    bgEnd: '#075985',
    accentColor: '#38bdf8',
    pattern: 'grid',
    contentSvg: `
      <!-- Industrial Water Reservoir with Ultrasonic Sensor -->
      <g transform="translate(180, 45)">
        <!-- Tank Cylinder -->
        <rect x="40" y="20" width="160" height="180" rx="20" fill="#082f49" stroke="#38bdf8" stroke-width="3"/>
        <!-- Water Level (78%) -->
        <path d="M 40 80 Q 80 70 120 80 T 200 80 V 180 C 200 190 190 200 180 200 H 60 C 50 200 40 190 40 180 Z" fill="#0284c7" fill-opacity="0.85"/>
        <path d="M 40 80 Q 80 90 120 80 T 200 80" stroke="#bae6fd" stroke-width="2.5" fill="none"/>

        <!-- Top Ultrasonic Sensor -->
        <rect x="100" y="5" width="40" height="18" rx="3" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
        <!-- Sonic Pulse Waves -->
        <path d="M 105 32 Q 120 40 135 32" stroke="#38bdf8" stroke-width="2" fill="none"/>
        <path d="M 98 44 Q 120 56 142 44" stroke="#38bdf8" stroke-width="2" fill="none"/>

        <!-- Gauge Level Marker -->
        <line x1="210" y1="20" x2="225" y2="20" stroke="#ffffff" stroke-width="2"/>
        <line x1="210" y1="80" x2="235" y2="80" stroke="#38bdf8" stroke-width="3"/>
        <line x1="210" y1="140" x2="225" y2="140" stroke="#ffffff" stroke-width="2"/>
        <line x1="210" y1="200" x2="225" y2="200" stroke="#ffffff" stroke-width="2"/>
        <text x="245" y="85" font-family="monospace" font-size="14" font-weight="800" fill="#38bdf8">78%</text>
      </g>
      <!-- Telemetry Bar -->
      <g transform="translate(130, 290)">
        <rect width="340" height="36" rx="8" fill="#082f49" fill-opacity="0.8" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="170" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#e0f2fe" text-anchor="middle">DHRUV OVERHEAD TANK • PURITY: 99.4%</text>
      </g>`
}));

// Additional Project Specific SVGs:
// 1.12 AI Predictor (ai-predictor.svg)
writeSvg('projects', 'ai-predictor.svg', buildSvg({
    bgStart: '#311042',
    bgEnd: '#1e1b4b',
    accentColor: '#c084fc',
    pattern: 'circuit',
    contentSvg: `
      <g transform="translate(150, 45)">
        <circle cx="150" cy="100" r="70" fill="#4c1d95" stroke="#c084fc" stroke-width="3"/>
        <!-- Neural Nodes -->
        <circle cx="110" cy="80" r="10" fill="#f43f5e"/><circle cx="110" cy="120" r="10" fill="#f43f5e"/>
        <circle cx="150" cy="65" r="10" fill="#38bdf8"/><circle cx="150" cy="100" r="10" fill="#38bdf8"/><circle cx="150" cy="135" r="10" fill="#38bdf8"/>
        <circle cx="190" cy="100" r="12" fill="#10b981"/>
        <line x1="110" y1="80" x2="150" y2="65" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/>
        <line x1="110" y1="80" x2="150" y2="100" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/>
        <line x1="110" y1="120" x2="150" y2="100" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/>
        <line x1="110" y1="120" x2="150" y2="135" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/>
        <line x1="150" y1="65" x2="190" y2="100" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/>
        <line x1="150" y1="100" x2="190" y2="100" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/>
        <line x1="150" y1="135" x2="190" y2="100" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/>
      </g>
      <g transform="translate(140, 290)">
        <rect width="320" height="36" rx="8" fill="#1e1b4b" fill-opacity="0.8" stroke="#c084fc" stroke-width="1.5"/>
        <text x="160" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#f3e8ff" text-anchor="middle">ACADEMIC RISK PREDICTOR • GRADIENT BOOST</text>
      </g>`
}));

// 1.13 Multilingual LLM Assistant (llm-assistant.svg)
writeSvg('projects', 'llm-assistant.svg', buildSvg({
    bgStart: '#1e1b4b',
    bgEnd: '#0f172a',
    accentColor: '#818cf8',
    pattern: 'dots',
    contentSvg: `
      <g transform="translate(170, 45)">
        <!-- Speech Bubbles -->
        <rect x="10" y="20" width="160" height="55" rx="14" fill="#3730a3" stroke="#818cf8" stroke-width="2"/>
        <text x="30" y="52" font-family="sans-serif" font-size="14" font-weight="700" fill="#ffffff">नमस्कार! Exam कब है?</text>
        <rect x="90" y="90" width="170" height="55" rx="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="110" y="122" font-family="sans-serif" font-size="13" font-weight="700" fill="#38bdf8">Vyas Hall: 10:00 AM</text>
        <!-- AI Core Sparks -->
        <circle cx="50" cy="180" r="16" fill="#818cf8" fill-opacity="0.3"/>
        <path d="M 50 168 L 54 176 L 62 180 L 54 184 L 50 192 L 46 184 L 38 180 L 46 176 Z" fill="#c7d2fe"/>
      </g>
      <g transform="translate(130, 290)">
        <rect width="340" height="36" rx="8" fill="#1e1b4b" fill-opacity="0.8" stroke="#818cf8" stroke-width="1.5"/>
        <text x="170" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#e0e7ff" text-anchor="middle">LOCAL MULTILINGUAL CAMPUS LLM • RAG</text>
      </g>`
}));

// 1.14 Autonomous Rover (delivery-rover.svg)
writeSvg('projects', 'delivery-rover.svg', buildSvg({
    bgStart: '#1c1917',
    bgEnd: '#292524',
    accentColor: '#f97316',
    pattern: 'grid',
    contentSvg: `
      <g transform="translate(160, 50)">
        <!-- Chassis -->
        <rect x="40" y="90" width="180" height="60" rx="10" fill="#44403c" stroke="#f97316" stroke-width="2.5"/>
        <!-- LiDAR Turret -->
        <rect x="110" y="55" width="40" height="35" rx="5" fill="#1c1917" stroke="#f97316" stroke-width="2"/>
        <circle cx="130" cy="65" r="8" fill="#ef4444"/>
        <!-- 4 Rugged Wheels -->
        <rect x="25" y="135" width="45" height="40" rx="8" fill="#0c0a09" stroke="#78716c" stroke-width="3"/>
        <rect x="190" y="135" width="45" height="40" rx="8" fill="#0c0a09" stroke="#78716c" stroke-width="3"/>
        <!-- Cargo Hatch -->
        <rect x="60" y="100" width="140" height="25" rx="4" fill="#292524" stroke="#f97316" stroke-width="1.5"/>
        <text x="130" y="117" font-family="monospace" font-size="11" font-weight="800" fill="#fdba74" text-anchor="middle">MIT-WPU ROVER 01</text>
      </g>
      <g transform="translate(130, 290)">
        <rect width="340" height="36" rx="8" fill="#1c1917" fill-opacity="0.8" stroke="#f97316" stroke-width="1.5"/>
        <text x="170" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#fed7aa" text-anchor="middle">AUTONOMOUS DELIVERY ROVER • LIDAR SLAM</text>
      </g>`
}));

// 1.15 Robotic Arm (robotic-arm.svg)
writeSvg('projects', 'robotic-arm.svg', buildSvg({
    bgStart: '#1e293b',
    bgEnd: '#0f172a',
    accentColor: '#38bdf8',
    pattern: 'grid',
    contentSvg: `
      <g transform="translate(180, 45)">
        <!-- Arm Base -->
        <rect x="80" y="190" width="100" height="25" rx="5" fill="#334155" stroke="#64748b" stroke-width="2"/>
        <circle cx="130" cy="190" r="18" fill="#475569" stroke="#38bdf8" stroke-width="2.5"/>
        <!-- Segment 1 -->
        <line x1="130" y1="190" x2="100" y2="110" stroke="#38bdf8" stroke-width="8" stroke-linecap="round"/>
        <circle cx="100" cy="110" r="14" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
        <!-- Segment 2 -->
        <line x1="100" y1="110" x2="160" y2="50" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
        <circle cx="160" cy="50" r="10" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
        <!-- End Effector Gripper holding test tube -->
        <path d="M 160 50 L 175 70 M 160 50 L 150 70" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <rect x="156" y="65" width="10" height="35" rx="5" fill="#ec4899" stroke="#ffffff" stroke-width="1.5"/>
      </g>
      <g transform="translate(140, 290)">
        <rect width="320" height="36" rx="8" fill="#0f172a" fill-opacity="0.8" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="160" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#bae6fd" text-anchor="middle">6-DOF LAB ROBOTIC ARM • OPENCV</text>
      </g>`
}));

// Domain fallbacks for projects
const DOMAIN_DATA = [
    { file: 'ai-1.svg', title: 'AI & Machine Learning', color: '#7c3aed', bg1: '#1e1b4b', bg2: '#0f172a' },
    { file: 'ai-2.svg', title: 'Computer Vision & Deep Learning', color: '#db2777', bg1: '#311042', bg2: '#18181b' },
    { file: 'web-1.svg', title: 'Full Stack Web Platform', color: '#2563eb', bg1: '#172554', bg2: '#0f172a' },
    { file: 'web-2.svg', title: 'Modern Web Architecture', color: '#0d9488', bg1: '#134e4a', bg2: '#0f172a' },
    { file: 'mobile-1.svg', title: 'Mobile App Architecture', color: '#6d28d9', bg1: '#2e1065', bg2: '#0f172a' },
    { file: 'mobile-2.svg', title: 'Cross-Platform Solutions', color: '#4f46e5', bg1: '#1e1b4b', bg2: '#0f172a' },
    { file: 'cyber-1.svg', title: 'Cyber Defense & Security', color: '#e11d48', bg1: '#4c0519', bg2: '#0f172a' },
    { file: 'cyber-2.svg', title: 'Network Security Audit', color: '#ea580c', bg1: '#431407', bg2: '#0f172a' },
    { file: 'cloud-1.svg', title: 'Cloud & Kubernetes Infra', color: '#0284c7', bg1: '#082f49', bg2: '#0f172a' },
    { file: 'cloud-2.svg', title: 'DevOps & CI/CD Pipelines', color: '#1d4ed8', bg1: '#172554', bg2: '#0f172a' },
    { file: 'iot-1.svg', title: 'IoT Sensors & Embedded', color: '#059669', bg1: '#064e3b', bg2: '#0f172a' },
    { file: 'iot-2.svg', title: 'Hardware Telemetry Systems', color: '#16a34a', bg1: '#14532d', bg2: '#0f172a' },
    { file: 'data-1.svg', title: 'Data Science & Big Data', color: '#ca8a04', bg1: '#422006', bg2: '#0f172a' },
    { file: 'data-2.svg', title: 'Analytics & Visualization', color: '#d97706', bg1: '#451a03', bg2: '#0f172a' },
    { file: 'blockchain-1.svg', title: 'Blockchain & Smart Contracts', color: '#9333ea', bg1: '#3b0764', bg2: '#0f172a' },
    { file: 'blockchain-2.svg', title: 'Decentralized Protocols', color: '#c026d3', bg1: '#4a044e', bg2: '#0f172a' },
    { file: 'robotics-1.svg', title: 'Autonomous Robotics', color: '#475569', bg1: '#1e293b', bg2: '#0f172a' },
    { file: 'robotics-2.svg', title: 'Mechatronics & Automation', color: '#334155', bg1: '#0f172a', bg2: '#1e293b' },
    { file: 'uiux-1.svg', title: 'UI / UX Product Design', color: '#db2777', bg1: '#500724', bg2: '#0f172a' },
    { file: 'uiux-2.svg', title: 'Design Systems & Prototyping', color: '#7c3aed', bg1: '#2e1065', bg2: '#0f172a' },
    { file: 'arvr-1.svg', title: 'AR / VR & Spatial Computing', color: '#7c3aed', bg1: '#3b0764', bg2: '#0f172a' },
    { file: 'arvr-2.svg', title: 'Immersive 3D Environments', color: '#2563eb', bg1: '#1e1b4b', bg2: '#0f172a' }
];

for (const d of DOMAIN_DATA) {
    writeSvg('projects', d.file, buildSvg({
        bgStart: d.bg1,
        bgEnd: d.bg2,
        accentColor: d.color,
        pattern: 'circuit',
        contentSvg: `
          <g transform="translate(180, 70)">
            <circle cx="120" cy="80" r="70" fill="${d.color}" fill-opacity="0.2" stroke="${d.color}" stroke-width="2"/>
            <circle cx="120" cy="80" r="45" fill="${d.color}" fill-opacity="0.4" stroke="#ffffff" stroke-width="2"/>
            <path d="M 85 80 H 155 M 120 45 V 115" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
          </g>
          <g transform="translate(130, 280)">
            <rect width="340" height="36" rx="8" fill="#0f172a" fill-opacity="0.8" stroke="${d.color}" stroke-width="1.5"/>
            <text x="170" y="23" font-family="monospace" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">${d.title.toUpperCase()}</text>
          </g>`
    }));
}

// ============================================================================
// 2. LOST & FOUND — REALISTIC ITEM-SPECIFIC ASSETS
// ============================================================================

// 2.1 Smartphone (phone.svg)
writeSvg('lost-found', 'phone.svg', buildSvg({
    bgStart: '#1e1b4b',
    bgEnd: '#0f172a',
    accentColor: '#38bdf8',
    pattern: 'grid',
    contentSvg: `
      <!-- Sleek Modern Smartphone -->
      <g transform="translate(230, 30)">
        <!-- Phone Outer Frame -->
        <rect x="0" y="0" width="140" height="270" rx="26" fill="#18181b" stroke="#71717a" stroke-width="3"/>
        <!-- Display Glass -->
        <rect x="6" y="6" width="128" height="258" rx="20" fill="#09090b"/>
        <!-- Wallpaper Gradient -->
        <rect x="6" y="6" width="128" height="258" rx="20" fill="url(#bgGrad)" fill-opacity="0.5"/>
        <!-- Dynamic Island / Top Speaker -->
        <rect x="45" y="14" width="50" height="12" rx="6" fill="#000000"/>
        <circle cx="82" cy="20" r="3" fill="#1e293b"/>
        <!-- Lock Screen Time -->
        <text x="70" y="70" font-family="sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle">10:42</text>
        <text x="70" y="88" font-family="sans-serif" font-size="11" font-weight="500" fill="#94a3b8" text-anchor="middle">Monday, Sep 28</text>
        <!-- Home Bar -->
        <rect x="45" y="252" width="50" height="4" rx="2" fill="#ffffff" fill-opacity="0.8"/>
      </g>
      <!-- Item Tag -->
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#e0f2fe" text-anchor="middle">SMARTPHONE DEVICE</text>
      </g>`
}));

// 2.2 Water Bottle (water-bottle.svg)
writeSvg('lost-found', 'water-bottle.svg', buildSvg({
    bgStart: '#0f766e',
    bgEnd: '#134e4a',
    accentColor: '#5eead4',
    pattern: 'dots',
    contentSvg: `
      <!-- Insulated Steel Flask -->
      <g transform="translate(245, 30)">
        <!-- Cap with Carrying Loop -->
        <rect x="35" y="10" width="40" height="25" rx="5" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
        <path d="M 45 10 C 45 -5, 65 -5, 65 10" stroke="#94a3b8" stroke-width="3" fill="none"/>
        <!-- Neck -->
        <rect x="42" y="35" width="26" height="15" fill="#64748b"/>
        <!-- Main Bottle Body with Specular Highlight -->
        <rect x="20" y="50" width="70" height="210" rx="14" fill="#0284c7" stroke="#e2e8f0" stroke-width="3"/>
        <rect x="26" y="55" width="12" height="195" rx="6" fill="#ffffff" fill-opacity="0.35"/>
        <rect x="20" y="130" width="70" height="6" fill="#0369a1"/>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#134e4a" stroke="#5eead4" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#ccfbf1" text-anchor="middle">STAINLESS STEEL WATER BOTTLE</text>
      </g>`
}));

// 2.3 Student / College ID Card (id-card.svg)
writeSvg('lost-found', 'id-card.svg', buildSvg({
    bgStart: '#1e1b4b',
    bgEnd: '#311042',
    accentColor: '#a78bfa',
    pattern: 'grid',
    contentSvg: `
      <!-- Realistic Laminated ID Card with Lanyard -->
      <g transform="translate(180, 20)">
        <!-- Purple Lanyard Ribbon -->
        <path d="M 120 0 L 120 40" stroke="#7c3aed" stroke-width="16" stroke-linecap="square"/>
        <!-- Metal Clip -->
        <rect x="112" y="35" width="16" height="15" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
        
        <!-- Card Body -->
        <rect x="10" y="48" width="220" height="225" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.3))"/>
        <!-- Card Header Banner -->
        <rect x="10" y="48" width="220" height="42" rx="12" fill="#6d28d9"/>
        <text x="120" y="73" font-family="sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">MIT WORLD PEACE UNIVERSITY</text>
        
        <!-- Student Photo Silhouette -->
        <rect x="25" y="105" width="60" height="75" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="55" cy="130" r="14" fill="#94a3b8"/>
        <path d="M 35 170 C 35 152 75 152 75 170 Z" fill="#94a3b8"/>

        <!-- Details -->
        <text x="95" y="120" font-family="sans-serif" font-size="12" font-weight="800" fill="#0f172a">STUDENT ID</text>
        <text x="95" y="138" font-family="sans-serif" font-size="10" font-weight="600" fill="#64748b">PRN: WPU-2024-AI</text>
        <text x="95" y="154" font-family="sans-serif" font-size="10" font-weight="600" fill="#64748b">B.Tech Computer Eng</text>
        
        <!-- Barcode -->
        <g transform="translate(30, 205)" stroke="#0f172a" stroke-width="2">
          <line x1="0" y1="0" x2="0" y2="25"/><line x1="6" y1="0" x2="6" y2="25"/><line x1="10" y1="0" x2="10" y2="25"/>
          <line x1="18" y1="0" x2="18" y2="25"/><line x1="26" y1="0" x2="26" y2="25"/><line x1="32" y1="0" x2="32" y2="25"/>
          <line x1="40" y1="0" x2="40" y2="25"/><line x1="50" y1="0" x2="50" y2="25"/><line x1="60" y1="0" x2="60" y2="25"/>
          <line x1="72" y1="0" x2="72" y2="25"/><line x1="85" y1="0" x2="85" y2="25"/><line x1="95" y1="0" x2="95" y2="25"/>
          <line x1="110" y1="0" x2="110" y2="25"/><line x1="125" y1="0" x2="125" y2="25"/><line x1="140" y1="0" x2="140" y2="25"/>
          <line x1="160" y1="0" x2="160" y2="25"/><line x1="175" y1="0" x2="175" y2="25"/>
        </g>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#ede9fe" text-anchor="middle">COLLEGE IDENTITY CARD</text>
      </g>`
}));

// 2.4 Laptop (laptop.svg)
writeSvg('lost-found', 'laptop.svg', buildSvg({
    bgStart: '#1e293b',
    bgEnd: '#0f172a',
    accentColor: '#38bdf8',
    pattern: 'grid',
    contentSvg: `
      <!-- Precision Laptop Open at Angle -->
      <g transform="translate(170, 40)">
        <!-- Display Shell -->
        <rect x="25" y="15" width="210" height="140" rx="8" fill="#18181b" stroke="#94a3b8" stroke-width="3"/>
        <rect x="33" y="23" width="194" height="124" rx="4" fill="#0284c7"/>
        <circle cx="130" cy="85" r="24" fill="#ffffff" fill-opacity="0.3"/>
        
        <!-- Base / Keyboard Deck -->
        <path d="M 0 160 H 260 L 240 185 H 20 Z" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
        <!-- Trackpad -->
        <rect x="105" y="165" width="50" height="15" rx="3" fill="#475569"/>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#e0f2fe" text-anchor="middle">LAPTOP NOTEBOOK PC</text>
      </g>`
}));

// 2.5 Earphones / Earbuds (earphones.svg)
writeSvg('lost-found', 'earphones.svg', buildSvg({
    bgStart: '#311042',
    bgEnd: '#1e1b4b',
    accentColor: '#c084fc',
    pattern: 'dots',
    contentSvg: `
      <!-- Wireless Earbuds Case & Pods -->
      <g transform="translate(190, 50)">
        <!-- Charging Case Open -->
        <rect x="40" y="60" width="140" height="100" rx="30" fill="#1e1b4b" stroke="#c084fc" stroke-width="3"/>
        <ellipse cx="110" cy="60" rx="55" ry="18" fill="#3b0764" stroke="#c084fc" stroke-width="2"/>
        <!-- LED status -->
        <circle cx="110" cy="110" r="4" fill="#22c55e" filter="drop-shadow(0 0 4px #22c55e)"/>
        
        <!-- Left Earbud -->
        <g transform="translate(20, 20)">
          <ellipse cx="25" cy="25" rx="14" ry="18" fill="#ffffff" stroke="#c084fc" stroke-width="2"/>
          <rect x="22" y="35" width="8" height="35" rx="4" fill="#ffffff" stroke="#c084fc" stroke-width="1.5"/>
        </g>
        <!-- Right Earbud -->
        <g transform="translate(160, 20)">
          <ellipse cx="25" cy="25" rx="14" ry="18" fill="#ffffff" stroke="#c084fc" stroke-width="2"/>
          <rect x="20" y="35" width="8" height="35" rx="4" fill="#ffffff" stroke="#c084fc" stroke-width="1.5"/>
        </g>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#1e1b4b" stroke="#c084fc" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#f3e8ff" text-anchor="middle">WIRELESS EARPHONES / AUDIO</text>
      </g>`
}));

// 2.6 Wallet (wallet.svg)
writeSvg('lost-found', 'wallet.svg', buildSvg({
    bgStart: '#451a03',
    bgEnd: '#1c1917',
    accentColor: '#f59e0b',
    pattern: 'grid',
    contentSvg: `
      <!-- Leather Bi-Fold Wallet -->
      <g transform="translate(170, 50)">
        <!-- Outer Leather Body -->
        <rect x="20" y="30" width="220" height="150" rx="14" fill="#78350f" stroke="#d97706" stroke-width="3"/>
        <!-- Stitching Lines -->
        <rect x="26" y="36" width="208" height="138" rx="10" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="6,4"/>
        <!-- Inner Card Pockets -->
        <rect x="40" y="55" width="90" height="50" rx="4" fill="#92400e" stroke="#b45309" stroke-width="2"/>
        <!-- Credit / Metro Cards Peeking -->
        <rect x="45" y="45" width="80" height="30" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="55" y="65" font-family="monospace" font-size="8" font-weight="700" fill="#ffffff">METRO PASS</text>
        <rect x="45" y="35" width="80" height="20" rx="4" fill="#10b981"/>
        <!-- Wallet Flap Snap -->
        <path d="M 240 85 H 210 Q 200 85 200 100 Q 200 115 210 115 H 240 Z" fill="#92400e" stroke="#d97706" stroke-width="2"/>
        <circle cx="215" cy="100" r="5" fill="#facc15"/>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#1c1917" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#fef3c7" text-anchor="middle">LEATHER WALLET / CARDS</text>
      </g>`
}));

// 2.7 Keys & Keychain (keys.svg)
writeSvg('lost-found', 'keys.svg', buildSvg({
    bgStart: '#3f3f46',
    bgEnd: '#18181b',
    accentColor: '#fbbf24',
    pattern: 'dots',
    contentSvg: `
      <!-- Keyring with Brass Key & Keychain Charm -->
      <g transform="translate(200, 45)">
        <!-- Heavy Keyring -->
        <circle cx="90" cy="70" r="35" fill="none" stroke="#cbd5e1" stroke-width="6"/>
        
        <!-- Brass Key -->
        <g transform="rotate(35 90 70)">
          <circle cx="90" cy="70" r="18" fill="none" stroke="#f59e0b" stroke-width="5"/>
          <rect x="86" y="88" width="8" height="90" fill="#f59e0b"/>
          <!-- Key Notches -->
          <rect x="94" y="140" width="10" height="6" fill="#f59e0b"/>
          <rect x="94" y="155" width="14" height="6" fill="#f59e0b"/>
          <rect x="94" y="170" width="8" height="6" fill="#f59e0b"/>
        </g>

        <!-- Red Rubber Keychain Charm -->
        <g transform="translate(110, 80)">
          <rect width="40" height="65" rx="8" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
          <circle cx="20" cy="30" r="12" fill="#ffffff"/>
          <path d="M 12 30 H 28 M 20 22 V 38" stroke="#ef4444" stroke-width="2"/>
        </g>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#18181b" stroke="#fbbf24" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#fef3c7" text-anchor="middle">KEYS & KEYCHAIN CHARM</text>
      </g>`
}));

// 2.8 College Backpack (backpack.svg)
writeSvg('lost-found', 'backpack.svg', buildSvg({
    bgStart: '#1e293b',
    bgEnd: '#0f172a',
    accentColor: '#38bdf8',
    pattern: 'grid',
    contentSvg: `
      <!-- Modern Rucksack Backpack -->
      <g transform="translate(200, 30)">
        <!-- Top Handle -->
        <path d="M 70 30 C 70 10, 130 10, 130 30" stroke="#475569" stroke-width="6" fill="none"/>
        <!-- Main Bag Body -->
        <path d="M 40 50 C 40 30, 160 30, 160 50 L 175 220 C 175 240, 25 240, 25 220 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
        <!-- Front Utility Zipper Compartment -->
        <rect x="45" y="130" width="110" height="80" rx="10" fill="#334155" stroke="#64748b" stroke-width="2"/>
        <!-- Zipper Tracks -->
        <path d="M 50 145 H 150" stroke="#facc15" stroke-width="2.5" stroke-dasharray="4,2"/>
        <!-- Side Mesh Bottle Pocket -->
        <path d="M 25 150 L 20 210 H 35 L 35 150 Z" fill="#475569"/>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#e0f2fe" text-anchor="middle">COLLEGE LAPTOP BACKPACK</text>
      </g>`
}));

// 2.9 Scientific Calculator (calculator.svg)
writeSvg('lost-found', 'calculator.svg', buildSvg({
    bgStart: '#134e4a',
    bgEnd: '#042f2e',
    accentColor: '#2dd4bf',
    pattern: 'grid',
    contentSvg: `
      <!-- Casio fx-991EX Scientific Calculator -->
      <g transform="translate(220, 25)">
        <!-- Body -->
        <rect width="160" height="260" rx="16" fill="#1e293b" stroke="#64748b" stroke-width="3"/>
        <!-- Solar Panel & LCD Display -->
        <rect x="18" y="20" width="124" height="60" rx="6" fill="#0f172a" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="85" y="24" width="50" height="12" rx="2" fill="#78350f" stroke="#d97706" stroke-width="1"/>
        <text x="26" y="55" font-family="monospace" font-size="11" fill="#2dd4bf">∫ sin(x) dx = -cos(x)</text>
        <text x="135" y="72" font-family="monospace" font-size="14" font-weight="700" fill="#2dd4bf" text-anchor="end">-0.8414</text>

        <!-- Function & Numeric Keypad -->
        <g fill="#475569">
          <!-- Row 1 -->
          <circle cx="35" cy="105" r="9"/><circle cx="65" cy="105" r="9"/><circle cx="95" cy="105" r="9"/><circle cx="125" cy="105" r="9"/>
          <!-- Row 2 -->
          <rect x="25" y="130" width="22" height="15" rx="3"/><rect x="55" y="130" width="22" height="15" rx="3"/><rect x="85" y="130" width="22" height="15" rx="3"/><rect x="115" y="130" width="22" height="15" rx="3" fill="#ea580c"/>
          <!-- Row 3 -->
          <rect x="25" y="160" width="22" height="15" rx="3"/><rect x="55" y="160" width="22" height="15" rx="3"/><rect x="85" y="160" width="22" height="15" rx="3"/><rect x="115" y="160" width="22" height="15" rx="3"/>
          <!-- Row 4 -->
          <rect x="25" y="190" width="22" height="15" rx="3"/><rect x="55" y="190" width="22" height="15" rx="3"/><rect x="85" y="190" width="22" height="15" rx="3"/><rect x="115" y="190" width="22" height="15" rx="3"/>
          <!-- Row 5 -->
          <rect x="25" y="220" width="22" height="15" rx="3"/><rect x="55" y="220" width="22" height="15" rx="3"/><rect x="85" y="220" width="22" height="15" rx="3"/><rect x="115" y="220" width="22" height="15" rx="3" fill="#2563eb"/>
        </g>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#042f2e" stroke="#2dd4bf" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#ccfbf1" text-anchor="middle">SCIENTIFIC CALCULATOR</text>
      </g>`
}));

// 2.10 Smartwatch (watch.svg)
writeSvg('lost-found', 'watch.svg', buildSvg({
    bgStart: '#18181b',
    bgEnd: '#27272a',
    accentColor: '#ec4899',
    pattern: 'dots',
    contentSvg: `
      <!-- Smartwatch & Strap -->
      <g transform="translate(230, 20)">
        <!-- Silicone Strap -->
        <rect x="35" y="10" width="70" height="60" rx="8" fill="#3f3f46"/>
        <rect x="35" y="200" width="70" height="60" rx="8" fill="#3f3f46"/>
        <!-- Watch Dial -->
        <rect x="20" y="60" width="100" height="140" rx="28" fill="#09090b" stroke="#71717a" stroke-width="3"/>
        <rect x="28" y="68" width="84" height="124" rx="20" fill="#18181b"/>
        <!-- Display Info -->
        <text x="70" y="115" font-family="sans-serif" font-size="24" font-weight="800" fill="#ffffff" text-anchor="middle">10:42</text>
        <circle cx="50" cy="145" r="8" fill="#ef4444" fill-opacity="0.3"/>
        <path d="M 46 145 L 49 148 L 54 142" stroke="#ef4444" stroke-width="2" fill="none"/>
        <text x="65" y="150" font-family="monospace" font-size="12" font-weight="700" fill="#f43f5e">74 BPM</text>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#18181b" stroke="#ec4899" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#fce7f3" text-anchor="middle">SMARTWATCH / FITNESS BAND</text>
      </g>`
}));

// 2.11 Charger (charger.svg)
writeSvg('lost-found', 'charger.svg', buildSvg({
    bgStart: '#431407',
    bgEnd: '#1c1917',
    accentColor: '#fb923c',
    pattern: 'grid',
    contentSvg: `
      <!-- USB-C Power Adapter & Coiled Cable -->
      <g transform="translate(200, 45)">
        <!-- Power Brick -->
        <rect x="30" y="60" width="90" height="100" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
        <rect x="15" y="85" width="15" height="20" rx="2" fill="#94a3b8"/>
        <rect x="15" y="115" width="15" height="20" rx="2" fill="#94a3b8"/>
        <!-- Type-C Port -->
        <rect x="110" y="102" width="10" height="16" rx="4" fill="#0f172a"/>
        
        <!-- Braided Cable -->
        <path d="M 120 110 C 180 110, 160 180, 120 180 C 80 180, 140 230, 200 200" stroke="#94a3b8" stroke-width="6" fill="none" stroke-linecap="round"/>
        <!-- USB-C Connector Head -->
        <rect x="195" y="192" width="25" height="15" rx="3" fill="#334155"/>
        <rect x="220" y="195" width="12" height="9" rx="2" fill="#94a3b8"/>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#1c1917" stroke="#fb923c" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#ffedd5" text-anchor="middle">USB-C FAST CHARGER & CABLE</text>
      </g>`
}));

// 2.12 USB Flash Drive (usb-drive.svg)
writeSvg('lost-found', 'usb-drive.svg', buildSvg({
    bgStart: '#1e1b4b',
    bgEnd: '#0f172a',
    accentColor: '#818cf8',
    pattern: 'grid',
    contentSvg: `
      <!-- High Speed USB 3.0 Pendrive -->
      <g transform="translate(220, 50)">
        <!-- Metallic Plug -->
        <rect x="50" y="20" width="60" height="45" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
        <rect x="62" y="32" width="12" height="14" rx="2" fill="#0284c7"/>
        <rect x="86" y="32" width="12" height="14" rx="2" fill="#0284c7"/>
        <!-- Main Red/Black Casing -->
        <rect x="35" y="60" width="90" height="140" rx="14" fill="#1e1b4b" stroke="#e11d48" stroke-width="3"/>
        <rect x="60" y="90" width="40" height="60" rx="6" fill="#e11d48"/>
        <!-- Lanyard Loop Hole -->
        <circle cx="80" cy="180" r="10" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#0f172a" stroke="#818cf8" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#e0e7ff" text-anchor="middle">USB 3.0 FLASH PENDRIVE</text>
      </g>`
}));

// 2.13 Notebook (notebook.svg)
writeSvg('lost-found', 'notebook.svg', buildSvg({
    bgStart: '#172554',
    bgEnd: '#0f172a',
    accentColor: '#60a5fa',
    pattern: 'dots',
    contentSvg: `
      <!-- Spiral Bound Notebook -->
      <g transform="translate(200, 35)">
        <!-- Hardcover Base -->
        <rect x="30" y="20" width="160" height="210" rx="8" fill="#1e40af" stroke="#93c5fd" stroke-width="2.5"/>
        <rect x="45" y="30" width="135" height="190" rx="4" fill="#f8fafc"/>
        <!-- Ruled lines -->
        <line x1="55" y1="65" x2="170" y2="65" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="55" y1="95" x2="170" y2="95" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="55" y1="125" x2="170" y2="125" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="55" y1="155" x2="170" y2="155" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="55" y1="185" x2="170" y2="185" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Spiral Wire Binding Rings -->
        <g fill="#475569">
          <circle cx="35" cy="45" r="5"/><circle cx="35" cy="75" r="5"/><circle cx="35" cy="105" r="5"/>
          <circle cx="35" cy="135" r="5"/><circle cx="35" cy="165" r="5"/><circle cx="35" cy="195" r="5"/>
        </g>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#0f172a" stroke="#60a5fa" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#dbeafe" text-anchor="middle">LECTURE NOTES & TEXTBOOK</text>
      </g>`
}));

// 2.14 Spectacles (spectacles.svg)
writeSvg('lost-found', 'spectacles.svg', buildSvg({
    bgStart: '#1e1b4b',
    bgEnd: '#311042',
    accentColor: '#c084fc',
    pattern: 'grid',
    contentSvg: `
      <!-- Modern Eyeglasses & Case -->
      <g transform="translate(170, 70)">
        <!-- Left Frame Lens -->
        <circle cx="70" cy="70" r="45" fill="#f8fafc" fill-opacity="0.3" stroke="#e2e8f0" stroke-width="5"/>
        <!-- Right Frame Lens -->
        <circle cx="190" cy="70" r="45" fill="#f8fafc" fill-opacity="0.3" stroke="#e2e8f0" stroke-width="5"/>
        <!-- Nose Bridge -->
        <path d="M 115 65 Q 130 50 145 65" stroke="#e2e8f0" stroke-width="5" fill="none"/>
        <!-- Temples -->
        <line x1="25" y1="65" x2="2" y2="40" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
        <line x1="235" y1="65" x2="258" y2="40" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
        <!-- Glass reflections -->
        <line x1="50" y1="50" x2="80" y2="80" stroke="#ffffff" stroke-width="2" stroke-opacity="0.6"/>
        <line x1="170" y1="50" x2="200" y2="80" stroke="#ffffff" stroke-width="2" stroke-opacity="0.6"/>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#1e1b4b" stroke="#c084fc" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#f3e8ff" text-anchor="middle">PRESCRIPTION SPECTACLES</text>
      </g>`
}));

// 2.15 Umbrella (umbrella.svg)
writeSvg('lost-found', 'umbrella.svg', buildSvg({
    bgStart: '#0f172a',
    bgEnd: '#1e293b',
    accentColor: '#38bdf8',
    pattern: 'dots',
    contentSvg: `
      <!-- Umbrella -->
      <g transform="translate(190, 50)">
        <!-- Canopy -->
        <path d="M 20 120 C 20 30, 200 30, 200 120 Q 155 105 110 120 Q 65 105 20 120 Z" fill="#2563eb" stroke="#93c5fd" stroke-width="2.5"/>
        <!-- Central Shaft -->
        <line x1="110" y1="30" x2="110" y2="180" stroke="#94a3b8" stroke-width="4"/>
        <line x1="110" y1="20" x2="110" y2="30" stroke="#94a3b8" stroke-width="4"/>
        <!-- Curved Handle -->
        <path d="M 110 180 C 110 205, 80 205, 80 185" stroke="#78350f" stroke-width="6" fill="none" stroke-linecap="round"/>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#dbeafe" text-anchor="middle">CAMPUS UMBRELLA</text>
      </g>`
}));

// 2.16 Jacket / Hoodie (jacket.svg)
writeSvg('lost-found', 'jacket.svg', buildSvg({
    bgStart: '#1e1b4b',
    bgEnd: '#0f172a',
    accentColor: '#818cf8',
    pattern: 'grid',
    contentSvg: `
      <!-- MIT-WPU Hoodie -->
      <g transform="translate(200, 45)">
        <!-- Body -->
        <path d="M 40 50 L 70 20 H 130 L 160 50 L 185 100 L 165 110 L 150 75 V 190 H 50 V 75 L 35 110 L 15 100 Z" fill="#312e81" stroke="#818cf8" stroke-width="2.5"/>
        <!-- Kangaroo Pocket -->
        <rect x="65" y="130" width="70" height="45" rx="6" fill="#4338ca"/>
        <!-- Drawstrings -->
        <line x1="90" y1="35" x2="90" y2="85" stroke="#ffffff" stroke-width="2"/>
        <line x1="110" y1="35" x2="110" y2="85" stroke="#ffffff" stroke-width="2"/>
        <text x="100" y="65" font-family="sans-serif" font-size="10" font-weight="900" fill="#c7d2fe" text-anchor="middle">MIT-WPU</text>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#0f172a" stroke="#818cf8" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#e0e7ff" text-anchor="middle">COLLEGE HOODIE / JACKET</text>
      </g>`
}));

// 2.17 Mouse (mouse.svg)
writeSvg('lost-found', 'mouse.svg', buildSvg({
    bgStart: '#18181b',
    bgEnd: '#27272a',
    accentColor: '#a1a1aa',
    pattern: 'grid',
    contentSvg: `
      <!-- Wireless Mouse -->
      <g transform="translate(230, 45)">
        <rect x="20" y="20" width="100" height="170" rx="50" fill="#3f3f46" stroke="#d4d4d8" stroke-width="3"/>
        <line x1="70" y1="20" x2="70" y2="80" stroke="#71717a" stroke-width="2"/>
        <!-- Scroll Wheel -->
        <rect x="64" y="45" width="12" height="30" rx="6" fill="#18181b" stroke="#a1a1aa" stroke-width="1.5"/>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#18181b" stroke="#a1a1aa" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#f4f4f5" text-anchor="middle">WIRELESS OPTICAL MOUSE</text>
      </g>`
}));

// 2.18 Other (other.svg)
writeSvg('lost-found', 'other.svg', buildSvg({
    bgStart: '#1e1b4b',
    bgEnd: '#0f172a',
    accentColor: '#a78bfa',
    pattern: 'dots',
    contentSvg: `
      <!-- Personal Campus Belonging Pouch -->
      <g transform="translate(200, 50)">
        <rect x="20" y="40" width="160" height="130" rx="16" fill="#312e81" stroke="#a78bfa" stroke-width="2.5"/>
        <line x1="20" y1="65" x2="180" y2="65" stroke="#facc15" stroke-width="3" stroke-dasharray="6,3"/>
        <circle cx="100" cy="115" r="22" fill="#4338ca"/>
        <path d="M 90 115 H 110 M 100 105 V 125" stroke="#ffffff" stroke-width="3"/>
      </g>
      <g transform="translate(180, 310)">
        <rect width="240" height="30" rx="6" fill="#0f172a" stroke="#a78bfa" stroke-width="1.2"/>
        <text x="120" y="19" font-family="sans-serif" font-size="12" font-weight="700" fill="#ede9fe" text-anchor="middle">CAMPUS BELONGING / ACCESSORY</text>
      </g>`
}));

console.log("✅ Successfully generated all subject-specific illustrations in public and dist!");
