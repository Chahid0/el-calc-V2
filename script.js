// ===== THEME & INIT =====
let isDark = false; 

function toggleTheme() {
  isDark = !isDark;
  document.body.classList.toggle('light', !isDark);
  // الحفاظ على الوضع الداكن عند التنقل بين الصفحات
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.textContent = isDark ? '🌙' : '☀️';
  });
}

// تطبيق الثيم المحفوظ عند تحميل كل صفحة
window.onload = () => {
    if (localStorage.getItem('theme') === 'light') {
        toggleTheme();
    }
};

// ===== HELPERS (دوال مساعدة) =====
function showResult(id, value, detail) {
  document.getElementById(id+'-val').textContent = value;
  document.getElementById(id+'-detail').textContent = detail || '';
  document.getElementById(id+'-result').classList.add('show');
  document.getElementById(id+'-err').style.display = 'none';
}
function showError(id) {
  document.getElementById(id+'-err').style.display = 'block';
  document.getElementById(id+'-result').classList.remove('show');
}
function v(id) { return parseFloat(document.getElementById(id).value); }
function ok(...vals) { return vals.every(x => !isNaN(x) && String(x) !== ''); }

// ===== OHM (قانون أوم) =====
function updateOhmFields() {
  const calc = document.getElementById('ohm-calc').value;
  document.getElementById('ohm-field-R').style.display = calc==='R' ? 'none' : 'block';
  document.getElementById('ohm-field-I').style.display = calc==='I' ? 'none' : 'block';
  document.getElementById('ohm-field-U').style.display = calc==='U' ? 'none' : 'block';
  document.getElementById('ohm-result').classList.remove('show');
}
function calcOhm() {
  const calc = document.getElementById('ohm-calc').value;
  if (calc==='U') {
    const R=v('ohm-R'), I=v('ohm-I');
    if (!ok(R,I)) return showError('ohm');
    showResult('ohm', `U = ${(R*I).toFixed(3)} V`, `U = ${R} Ω × ${I} A`);
  } else if (calc==='R') {
    const U=v('ohm-U'), I=v('ohm-I');
    if (!ok(U,I)||I===0) return showError('ohm');
    showResult('ohm', `R = ${(U/I).toFixed(3)} Ω`, `R = ${U} V / ${I} A`);
  } else {
    const U=v('ohm-U'), R=v('ohm-R');
    if (!ok(U,R)||R===0) return showError('ohm');
    showResult('ohm', `I = ${(U/R).toFixed(3)} A`, `I = ${U} V / ${R} Ω`);
  }
}

// ===== PUISSANCE (القدرة الكهربائية) =====
function calcPuissance() {
  const U=v('p-U'), I=v('p-I'), cos=v('p-cos');
  const type=document.getElementById('p-type').value;
  if (!ok(U,I,cos)) return showError('p');
  const k = type==='tri' ? Math.sqrt(3) : 1;
  const S=k*U*I, P=S*cos, Q=S*Math.sqrt(1-cos*cos);
  showResult('p', `P = ${P.toFixed(1)} W`,
    `${type==='tri'?'Triphasé':'Monophasé'} | S = ${S.toFixed(1)} VA | Q = ${Q.toFixed(1)} VAR`);
}

// ===== MOTEURS (المحركات) =====
function calcGlissement() {
  const Ns=v('g-Ns'), Nr=v('g-Nr');
  if (!ok(Ns,Nr)||Ns===0) return showError('g');
  const g=(Ns-Nr)/Ns*100;
  const q = g<5 ? '✅ Bon' : g<10 ? '⚠️ Élevé' : '❌ Très élevé';
  showResult('g', `g = ${g.toFixed(2)} %`, `Ns=${Ns} | Nr=${Nr} tr/min | ${q}`);
}
function calcVitesse() {
  const f=v('ns-f'), p=v('ns-p');
  if (!ok(f,p)||p===0) return showError('ns');
  showResult('ns', `Ns = ${(60*f/p).toFixed(0)} tr/min`, `f = ${f} Hz | p = ${p} paires de pôles`);
}
function calcRendement() {
  const Pu=v('r-Pu'), Pa=v('r-Pa');
  if (!ok(Pu,Pa)||Pa===0) return showError('r');
  showResult('r', `η = ${(Pu/Pa*100).toFixed(2)} %`, `Pertes = ${(Pa-Pu).toFixed(1)} W`);
}

// ===== TRANSFORMATEURS (المحولات) =====
function calcRapport() {
  const U1=v('m-U1'), U2=v('m-U2');
  if (!ok(U1,U2)||U1===0) return showError('m');
  const m=U2/U1;
  const t = m<1?'🔽 Abaisseur':m>1?'🔼 Élévateur':'➡️ Isolement';
  showResult('m', `m = ${m.toFixed(4)}`, `${t} | U1=${U1} V → U2=${U2} V`);
}
function calcCourantsTransfo() {
  const S=v('ti-S'), U1=v('ti-U1'), U2=v('ti-U2');
  const calc=document.getElementById('ti-calc').value;
  if (!ok(S,U1,U2)) return showError('ti');
  const I1=S/U1, I2=S/U2;
  if (calc==='I1') showResult('ti', `I1 = ${I1.toFixed(3)} A`, `I2 = ${I2.toFixed(3)} A | S = ${S} VA`);
  else showResult('ti', `I2 = ${I2.toFixed(3)} A`, `I1 = ${I1.toFixed(3)} A | S = ${S} VA`);
}
function calcRendementTransfo() {
  const P2=v('rt-P2'), Pfer=v('rt-Pfer'), Pcu=v('rt-Pcu');
  if (!ok(P2,Pfer,Pcu)) return showError('rt');
  const P1=P2+Pfer+Pcu;
  showResult('rt', `η = ${(P2/P1*100).toFixed(2)} %`, `P1 = ${P1.toFixed(1)} W | Pfer=${Pfer} W | Pcu=${Pcu} W`);
}

// ===== CABLAGE (مقطع الكابلات) =====
function calcSection() {
  const type = document.getElementById('cab-type').value;
  const rho = parseFloat(document.getElementById('cab-mat').value);
  const I = v('cab-I');
  const L = v('cab-L');
  const duPerc = v('cab-du-perc');
  const cos = v('cab-cos');

  if (!ok(I, L, duPerc, cos) || I === 0 || L === 0 || duPerc === 0) return showError('cab');

  const U = type === 'mono' ? 230 : 400;
  const deltaU = (duPerc / 100) * U; 
  
  let S = 0;
  if (type === 'mono') {
    S = (2 * rho * L * I * cos) / deltaU;
  } else {
    S = (Math.sqrt(3) * rho * L * I * cos) / deltaU;
  }

  const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
  let S_std = standardSections.find(sec => sec >= S);
  if (!S_std) S_std = "Spécial (>300)";
  const matName = rho === 0.0225 ? 'Cuivre' : 'Aluminium';

  showResult('cab', 
    `S = ${S_std} mm²`, 
    `Calcul exact: ${S.toFixed(2)} mm² | ΔU max: ${deltaU.toFixed(1)} V | ${matName}`
  );
}

// ===== LESSONS (الدروس) =====
const lessons = {
  ohm: {
    title: "Loi d'Ohm & Lois de Kirchhoff",
    html: `<div class="lesson-section"><h3>1. Loi d'Ohm</h3><p>La loi d'Ohm établit la relation entre la tension (U), le courant (I) et la résistance (R) :</p><div class="lesson-formula">U = R × I</div></div>`
  },
  puissance: {
    title: "Triangle des Puissances",
    html: `<div class="lesson-section"><h3>1. Les trois types de puissance</h3><p>Active (P), Réactive (Q), Apparente (S).</p><div class="lesson-formula">S² = P² + Q²</div></div>`
  },
  moteur: {
    title: "Moteur Asynchrone Triphasé",
    html: `<div class="lesson-section"><h3>1. Principe</h3><div class="lesson-formula">Ns = (60 × f) / p</div></div>`
  },
  transformateur: {
    title: "Transformateur",
    html: `<div class="lesson-section"><h3>1. Principe</h3><div class="lesson-formula">m = U2/U1 = N2/N1 = I1/I2</div></div>`
  },
  protection: {
    title: "Protections",
    html: `<div class="lesson-section"><h3>Disjoncteur</h3><p>Thermique (surcharge) et Magnétique (court-circuit).</p></div>`
  }
};

function openLesson(key) {
  if(!lessons[key]) return;
  document.getElementById('modal-title').textContent = lessons[key].title;
  document.getElementById('modal-body').innerHTML = lessons[key].html;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModalBtn() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalBtn();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModalBtn(); });
