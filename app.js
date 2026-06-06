// Navigation
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.section;
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});

// Chart defaults
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = '#2a3348';
Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size = 12;

// Data: last 5 months (Feb–Jun 2026)
const months = ['Февраль', 'Март', 'Апрель', 'Май', 'Июнь'];
const revenues  = [69000000, 72000000, 75000000, 79200000, 82500000];
const expenses  = [49700000, 52200000, 54800000  , 57800000, 59400000];
const profits   = revenues.map((r, i) => r - expenses[i]);

// Trend chart
new Chart(document.getElementById('trendChart'), {
  type: 'line',
  data: {
    labels: months,
    datasets: [
      {
        label: 'Выручка',
        data: revenues,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.07)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
      {
        label: 'Расходы',
        data: expenses,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.06)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
      {
        label: 'Чистая прибыль',
        data: profits,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.06)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { ticks: { callback: v => '₸' + (v / 1000000).toFixed(0) + 'М' } },
    },
  },
});

// Pie — expense structure (current: Titan 38%)
const expenseLabels = ['Титан', 'ФОТ', 'Ремонт', 'Логистика', 'Аренда', 'Страхование', 'Командировки', 'Административные'];
const expenseData   = [22600000, 12000000, 8000000, 7000000, 4000000, 2000000, 2000000, 1800000];
const totalExpenses = expenseData.reduce((a, b) => a + b, 0); // 59 400 000

new Chart(document.getElementById('expenseChart'), {
  type: 'doughnut',
  data: {
    labels: expenseLabels,
    datasets: [{
      data: expenseData,
      backgroundColor: ['#ef4444','#3b82f6','#f59e0b','#a78bfa','#34d399','#60a5fa','#fbbf24','#94a3b8'],
      borderWidth: 2,
      borderColor: '#161b27',
    }],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 11, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: ctx => {
            const pct = ((ctx.parsed / totalExpenses) * 100).toFixed(1);
            return ` ₸${(ctx.parsed / 1000000).toFixed(1)}М (${pct}%)`;
          },
        },
      },
    },
  },
});

// Horizontal bar
new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: expenseLabels,
    datasets: [{
      label: '₸',
      data: expenseData,
      backgroundColor: expenseData.map((_, i) => i === 0 ? 'rgba(239,68,68,0.7)' : 'rgba(59,130,246,0.6)'),
      borderRadius: 4,
    }],
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { callback: v => '₸' + (v / 1000000).toFixed(0) + 'М' } },
    },
  },
});

// Report calculator
document.getElementById('calcBtn').addEventListener('click', () => {
  const volume   = parseFloat(document.getElementById('f-volume').value)    || 1000;
  const price    = parseFloat(document.getElementById('f-price').value)     || 82500;
  const contracts= parseFloat(document.getElementById('f-contracts').value) || 0;
  const penalties= parseFloat(document.getElementById('f-penalties').value) || 0;
  const rentInc  = parseFloat(document.getElementById('f-rent-income').value)|| 0;

  const titan    = parseFloat(document.getElementById('f-titan').value)     || 22600000;
  const payroll  = parseFloat(document.getElementById('f-payroll').value)   || 12000000;
  const rent     = parseFloat(document.getElementById('f-rent').value)      || 4000000;
  const insurance= parseFloat(document.getElementById('f-insurance').value) || 2000000;
  const repair   = parseFloat(document.getElementById('f-repair').value)    || 8000000;
  const logistics= parseFloat(document.getElementById('f-logistics').value) || 7000000;
  const travel   = parseFloat(document.getElementById('f-travel').value)    || 2000000;
  const admin    = parseFloat(document.getElementById('f-admin').value)     || 1800000;

  const revenue  = volume * price + contracts + penalties + rentInc;
  const expenses = titan + payroll + rent + insurance + repair + logistics + travel + admin;
  const profit   = revenue - expenses;
  const ebitda   = (profit / revenue * 100).toFixed(1);
  const costTon  = (expenses / volume).toFixed(0);
  const expRatio = (expenses / revenue * 100).toFixed(1);
  const titanPct = (titan / expenses * 100).toFixed(1);

  const fmt = n => '₸' + Math.round(n).toLocaleString('ru-RU');

  const checks = [
    { ok: parseFloat(ebitda) >= 35,   text: `EBITDA margin: ${ebitda}% (цель ≥35%)` },
    { ok: parseFloat(costTon) <= 55000,text: `Себестоимость: ₸${costTon}/т (цель ≤₸55 000)` },
    { ok: parseFloat(expRatio) <= 65,  text: `Коэфф. расходов: ${expRatio}% (норма ≤65%)` },
    { ok: parseFloat(titanPct) <= 30,  text: `Доля Титан: ${titanPct}% (норма ≤30%)` },
  ];

  const el = document.getElementById('reportResult');
  el.classList.remove('hidden');
  el.innerHTML = `
    <div style="font-size:15px;font-weight:700;margin-bottom:14px">Результаты периода</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
      <div><span style="color:var(--text2)">Выручка:</span> <strong>${fmt(revenue)}</strong></div>
      <div><span style="color:var(--text2)">Расходы:</span> <strong>${fmt(expenses)}</strong></div>
      <div><span style="color:var(--text2)">Чистая прибыль:</span> <strong style="color:${profit>0?'var(--green)':'var(--red)'}">${fmt(profit)}</strong></div>
      <div><span style="color:var(--text2)">Объём добычи:</span> <strong>${volume} т</strong></div>
    </div>
    <div style="font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px">Аудит показателей</div>
    ${checks.map(c => `
      <div style="padding:8px 12px;margin-bottom:6px;border-radius:6px;background:${c.ok?'rgba(34,197,94,.08)':'rgba(239,68,68,.08)'};
        border-left:3px solid ${c.ok?'var(--green)':'var(--red)'};font-size:13px">
        <span style="color:${c.ok?'var(--green)':'var(--red)'};font-weight:700">${c.ok?'✓ ОК':'✗ КРИТИЧНО'}</span>
        &nbsp;—&nbsp;${c.text}
      </div>`).join('')}
  `;
});

// KPI form
document.getElementById('kpiBtn').addEventListener('click', () => {
  const production = document.getElementById('kpi-production').value || '—';
  const revenue    = document.getElementById('kpi-revenue').value;
  const titanFact  = document.getElementById('kpi-titan-fact').value;
  const titanPlan  = document.getElementById('kpi-titan-plan').value;
  const logistFact = document.getElementById('kpi-logist-fact').value;
  const logistPlan = document.getElementById('kpi-logist-plan').value;
  const balance    = document.getElementById('kpi-balance').value;

  const fmt = n => n ? '₸' + (parseFloat(n) / 1000000).toFixed(1) + 'М' : '—';
  const titanOk  = parseFloat(titanFact)  <= parseFloat(titanPlan);
  const logistOk = parseFloat(logistFact) <= parseFloat(logistPlan);

  const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${today}</td>
    <td>${production}</td>
    <td>${fmt(revenue)}</td>
    <td class="${titanOk ? 'ok' : 'warn'}">${fmt(titanFact)} / ${fmt(titanPlan)}</td>
    <td class="${logistOk ? 'ok' : 'warn'}">${fmt(logistFact)} / ${fmt(logistPlan)}</td>
    <td>${fmt(balance)}</td>
  `;
  document.getElementById('kpiBody').prepend(row);

  ['kpi-production','kpi-revenue','kpi-titan-fact','kpi-titan-plan','kpi-logist-fact','kpi-logist-plan','kpi-balance']
    .forEach(id => { document.getElementById(id).value = ''; });
});

// ─── FILE UPLOAD ───────────────────────────────────────────────────────────

// Keyword map: ключевые слова → id поля формы
const FIELD_MAP = [
  { id: 'f-volume',     keys: ['объём добычи','добыча','volume','тонны','тонн'] },
  { id: 'f-price',      keys: ['цена нефти','цена','price','спот'] },
  { id: 'f-contracts',  keys: ['контрактные поставки','контракт','contracts'] },
  { id: 'f-penalties',  keys: ['штрафные санкции','штрафы','penalties'] },
  { id: 'f-rent-income',keys: ['аренда оборудования','аренда доход','rent income','сдача'] },
  { id: 'f-titan',      keys: ['титан','titan','буровая'] },
  { id: 'f-payroll',    keys: ['фот','зарплата','payroll','налоги с зарплаты','фонд оплаты'] },
  { id: 'f-rent',       keys: ['аренда офиса','аренда','инфраструктура','rent'] },
  { id: 'f-insurance',  keys: ['страхование','insurance'] },
  { id: 'f-repair',     keys: ['ремонт','эксплуатация','repair'] },
  { id: 'f-logistics',  keys: ['логистика','транспорт','logistics'] },
  { id: 'f-travel',     keys: ['командировочные','командировки','travel'] },
  { id: 'f-admin',      keys: ['административные','хозяйственные','admin'] },
];

function matchField(key) {
  const k = key.toLowerCase().trim();
  for (const f of FIELD_MAP) {
    if (f.keys.some(kw => k.includes(kw))) return f.id;
  }
  return null;
}

function cleanNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const s = String(val).replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(s.replace(/[^\d.\-]/g, ''));
  return isNaN(n) ? null : n;
}

let parsedData = {};

function showPreview(rows, filename) {
  const preview = document.getElementById('uploadPreview');
  const hint    = document.getElementById('uploadHint');
  parsedData = {};

  let matched = 0;
  let html = '<table><thead><tr><th>Поле файла</th><th>Значение</th><th>Маппинг</th></tr></thead><tbody>';

  rows.forEach(([key, val]) => {
    const fieldId = matchField(String(key));
    const num     = cleanNumber(val);
    const display = num !== null ? num.toLocaleString('ru-RU') : val;

    if (fieldId && num !== null) {
      parsedData[fieldId] = num;
      matched++;
      const label = FIELD_MAP.find(f => f.id === fieldId)?.keys[0] || fieldId;
      html += `<tr><td>${key}</td><td>${display}</td><td class="mapped">✓ ${label}</td></tr>`;
    } else {
      html += `<tr><td>${key}</td><td>${display}</td><td class="unmapped">—</td></tr>`;
    }
  });

  html += '</tbody></table>';
  preview.innerHTML = html;
  hint.textContent  = `Распознано полей: ${matched} из ${rows.length}`;

  document.getElementById('uploadFileName').textContent = filename;
  document.getElementById('uploadZone').classList.add('hidden');
  document.getElementById('uploadResult').classList.remove('hidden');
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const rows  = [];
  for (const line of lines) {
    // support comma and semicolon delimiters
    const parts = line.split(/[;,]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length >= 2) rows.push([parts[0], parts[1]]);
  }
  return rows;
}

function parseTXT(text) {
  const rows = [];
  for (const line of text.trim().split(/\r?\n/)) {
    // "Key: Value" or "Key — Value" or "Key\tValue"
    const m = line.match(/^(.+?)[\t:—–-]+\s*(.+)$/);
    if (m) rows.push([m[1].trim(), m[2].trim()]);
  }
  return rows;
}

function parseJSON(text) {
  try {
    const obj = JSON.parse(text);
    if (Array.isArray(obj)) {
      // [{name, value}] or [{key, value}] or first object entries
      return obj.map(item => {
        const k = item.name || item.key || item.поле || item.статья || Object.keys(item)[0];
        const v = item.value || item.значение || item.сумма || Object.values(item)[1] || Object.values(item)[0];
        return [k, v];
      });
    }
    return Object.entries(obj);
  } catch { return []; }
}

function parseExcel(buffer) {
  const wb  = XLSX.read(buffer, { type: 'array' });
  const ws  = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const rows = [];
  for (const row of data) {
    if (row.length >= 2 && row[0] !== '') rows.push([row[0], row[1]]);
  }
  return rows;
}

function handleFile(file) {
  const name = file.name;
  const ext  = name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  if (ext === 'xlsx' || ext === 'xls') {
    reader.onload = e => {
      const rows = parseExcel(new Uint8Array(e.target.result));
      showPreview(rows, name);
    };
    reader.readAsArrayBuffer(file);
  } else {
    reader.onload = e => {
      const text = e.target.result;
      let rows = [];
      if (ext === 'csv')        rows = parseCSV(text);
      else if (ext === 'json')  rows = parseJSON(text);
      else                      rows = parseTXT(text);
      showPreview(rows, name);
    };
    reader.readAsText(file, 'UTF-8');
  }
}

// Events
document.getElementById('browseBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

const zone = document.getElementById('uploadZone');
zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
zone.addEventListener('drop', e => {
  e.preventDefault();
  zone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

document.getElementById('clearFileBtn').addEventListener('click', () => {
  parsedData = {};
  document.getElementById('fileInput').value = '';
  document.getElementById('uploadResult').classList.add('hidden');
  document.getElementById('uploadZone').classList.remove('hidden');
});

document.getElementById('applyDataBtn').addEventListener('click', () => {
  let count = 0;
  for (const [fieldId, value] of Object.entries(parsedData)) {
    const el = document.getElementById(fieldId);
    if (el) { el.value = value; count++; }
  }
  // scroll to form
  document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('uploadHint').textContent = `✓ Заполнено полей: ${count}. Проверьте данные и нажмите «Рассчитать».`;
  document.getElementById('uploadHint').style.color = 'var(--green)';
});
