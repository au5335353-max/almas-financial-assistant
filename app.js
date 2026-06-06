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

// ─── FILE UPLOAD ─────────────────────────────────────────────────────────────

// Правила маппинга: ключевые слова → id поля формы
const FIELD_MAP = [
  { id: 'f-volume',      label: 'Объём добычи (тонны)',            keys: ['объём добычи','добыча','volume','тонны','тонн','нефть добыч'] },
  { id: 'f-price',       label: 'Цена нефти (₸/тонна)',            keys: ['цена нефти','цена реализ','price','спот','стоимость нефти'] },
  { id: 'f-contracts',   label: 'Контрактные поставки',            keys: ['контрактные поставки','контракт','долгосрочн'] },
  { id: 'f-penalties',   label: 'Штрафные санкции',                keys: ['штраф','неустойка','penalties','санкц'] },
  { id: 'f-rent-income', label: 'Аренда оборудования (доход)',     keys: ['аренда оборудован','сдача в аренду','аренда актив','доход аренд'] },
  { id: 'f-titan',       label: 'Буровая компания Титан',          keys: ['титан','titan','буровая','тоо тит','тоо «тит','ооо тит','drilling'] },
  { id: 'f-payroll',     label: 'ФОТ и налоги',                   keys: ['фот','зарплат','salary','payroll','оплата труд','налог с зарп','соц отч','пенсионн','инпн','ипн','фонд оплат','лд','физ лицо','физическое лицо'] },
  { id: 'f-rent',        label: 'Аренда офиса / инфраструктура',   keys: ['аренда офис','аренда помещ','аренда склад','коммунал','электр','газ','вода','инфраструктур'] },
  { id: 'f-insurance',   label: 'Страхование',                     keys: ['страхован','insurance','страховка','полис'] },
  { id: 'f-repair',      label: 'Ремонт и эксплуатация',           keys: ['ремонт','эксплуатац','тех обслуж','запчаст','зип','техническ обслуж','repair','maintenance','сервис'] },
  { id: 'f-logistics',   label: 'Логистика и транспорт',           keys: ['логистик','транспорт','перевозк','доставк','freight','logistics','тоо aktobe','aktobe gruup','it-cube','ит куб'] },
  { id: 'f-travel',      label: 'Командировочные',                 keys: ['командиров','суточные','travel','билет','гостиниц','проезд'] },
  { id: 'f-admin',       label: 'Административные расходы',        keys: ['администрат','хозяйствен','офисн','канцел','связь','интернет','почта','банковск','комисс','расчётно-кассов','рко','налог на имущ','зем налог','нds','ндс','налог','сбор'] },
];

// Категории доходов для автоматического распознавания
const INCOME_KEYS = ['выручка','реализац','продажа нефти','доход от реализ','поступлен','revenue','income','приход','зачислен'];

function matchField(text) {
  const t = String(text).toLowerCase().trim();
  for (const f of FIELD_MAP) {
    if (f.keys.some(kw => t.includes(kw))) return f;
  }
  return null;
}

function isIncomeRow(text) {
  const t = String(text).toLowerCase();
  return INCOME_KEYS.some(k => t.includes(k));
}

function cleanNum(val) {
  if (val === null || val === undefined || val === '' || val === '—' || val === '-') return null;
  const s = String(val).replace(/\s/g, '').replace(',', '.').replace(/[^\d.\-]/g, '');
  const n = parseFloat(s);
  return isNaN(n) || n === 0 ? null : n;
}

// ── Умный анализ Excel: все листы, поиск числовых колонок ──────────────────

function analyzeWorkbook(buffer) {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheets = {};

  wb.SheetNames.forEach(sheetName => {
    const ws   = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    sheets[sheetName] = rows;
  });

  return sheets;
}

// Находит числовые колонки в листе и возвращает {colIndex, header}[]
function findNumericCols(rows) {
  if (rows.length < 2) return [];
  const headerRow = rows.find(r => r.some(c => c !== '')) || rows[0];
  const numCols = [];

  for (let ci = 0; ci < headerRow.length; ci++) {
    let numCount = 0;
    for (let ri = 1; ri < Math.min(rows.length, 30); ri++) {
      if (cleanNum(rows[ri][ci]) !== null) numCount++;
    }
    if (numCount >= 2) {
      numCols.push({ colIndex: ci, header: String(headerRow[ci] || `Колонка ${ci+1}`) });
    }
  }
  return numCols;
}

// Находит текстовую колонку (наименование/контрагент)
function findLabelCol(rows) {
  if (rows.length < 2) return 0;
  const headerRow = rows[0];
  // Ищем колонку с заголовком "наименование", "контрагент", "статья" и т.д.
  const labelKeys = ['наименован','контрагент','статья','описан','назначен','получател','плательщ','name','description'];
  for (let ci = 0; ci < headerRow.length; ci++) {
    const h = String(headerRow[ci]).toLowerCase();
    if (labelKeys.some(k => h.includes(k))) return ci;
  }
  // Fallback: первая колонка с текстом
  for (let ci = 0; ci < headerRow.length; ci++) {
    let textCount = 0;
    for (let ri = 1; ri < Math.min(rows.length, 20); ri++) {
      const v = rows[ri][ci];
      if (v && isNaN(parseFloat(String(v).replace(/\s/g,'')))) textCount++;
    }
    if (textCount >= 3) return ci;
  }
  return 0;
}

// Суммирует транзакции по маппингу
function aggregateSheet(rows, labelCol, amountCol) {
  const totals = {}; // fieldId → sum
  const byCounterparty = {}; // label → {fieldId, sum, count}
  const unmatched = {}; // label → sum
  let totalIncome = 0;

  for (let ri = 1; ri < rows.length; ri++) {
    const row   = rows[ri];
    const label = String(row[labelCol] || '').trim();
    const num   = cleanNum(row[amountCol]);

    if (!label || num === null || num <= 0) continue;

    if (isIncomeRow(label)) {
      totalIncome += num;
      continue;
    }

    const match = matchField(label);
    if (match) {
      totals[match.id] = (totals[match.id] || 0) + num;
      if (!byCounterparty[label]) byCounterparty[label] = { fieldId: match.id, fieldLabel: match.label, sum: 0, count: 0 };
      byCounterparty[label].sum   += num;
      byCounterparty[label].count += 1;
    } else {
      unmatched[label] = (unmatched[label] || 0) + num;
    }
  }

  return { totals, byCounterparty, unmatched, totalIncome };
}

// Основная функция разбора всех листов
function processWorkbook(sheets) {
  const allTotals      = {};
  const allCounterpart = {};
  const allUnmatched   = {};
  let   grandIncome    = 0;
  const sheetSummaries = [];

  for (const [sheetName, rows] of Object.entries(sheets)) {
    if (rows.length < 2) continue;

    const labelCol   = findLabelCol(rows);
    const numCols    = findNumericCols(rows);
    if (numCols.length === 0) continue;

    // Берём колонку с наибольшей суммой (скорее всего — сумма транзакции)
    let bestCol = numCols[0];
    let bestSum = 0;
    for (const nc of numCols) {
      let s = 0;
      for (let ri = 1; ri < rows.length; ri++) { const n = cleanNum(rows[ri][nc.colIndex]); if (n && n > 0) s += n; }
      if (s > bestSum) { bestSum = s; bestCol = nc; }
    }

    const { totals, byCounterparty, unmatched, totalIncome } = aggregateSheet(rows, labelCol, bestCol.colIndex);

    sheetSummaries.push({ sheetName, rowCount: rows.length - 1, amountCol: bestCol.header, totalIncome, totals, byCounterparty, unmatched });
    grandIncome += totalIncome;
    for (const [k, v] of Object.entries(totals))       allTotals[k] = (allTotals[k] || 0) + v;
    for (const [k, v] of Object.entries(byCounterparty)) {
      if (!allCounterpart[k]) allCounterpart[k] = { ...v };
      else { allCounterpart[k].sum += v.sum; allCounterpart[k].count += v.count; }
    }
    for (const [k, v] of Object.entries(unmatched))    allUnmatched[k] = (allUnmatched[k] || 0) + v;
  }

  return { allTotals, allCounterpart, allUnmatched, grandIncome, sheetSummaries };
}

// ── Простой парсер CSV/TXT/JSON (оставляем) ──────────────────────────────

function parseTextRows(text, ext) {
  if (ext === 'json') {
    try {
      const obj = JSON.parse(text);
      if (Array.isArray(obj)) return obj.map(item => [Object.values(item)[0], Object.values(item)[1]]);
      return Object.entries(obj);
    } catch { return []; }
  }
  const sep = ext === 'csv' ? /[;,]/ : /[\t:—–]/;
  return text.trim().split(/\r?\n/).map(line => {
    const parts = line.split(sep).map(p => p.trim().replace(/^["']|["']$/g, ''));
    return parts.length >= 2 ? [parts[0], parts[1]] : null;
  }).filter(Boolean);
}

// ── Рендер превью ─────────────────────────────────────────────────────────

let parsedData = {};

function renderPreview(result, filename) {
  const { allTotals, allCounterpart, allUnmatched, grandIncome, sheetSummaries } = result;
  parsedData = { ...allTotals };

  const fmtN = n => n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
  let html = '';

  // Сводка по листам
  html += `<div style="margin-bottom:12px;font-size:12px;color:var(--text2)">
    Листов обработано: <strong style="color:var(--text)">${sheetSummaries.length}</strong> &nbsp;|&nbsp;
    Доходы: <strong style="color:var(--green)">₸${fmtN(grandIncome)}</strong>
  </div>`;

  // Таблица: распознанные → форма
  if (Object.keys(allCounterpart).length > 0) {
    html += `<div style="font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Распознанные транзакции</div>`;
    html += `<table><thead><tr><th>Контрагент / Статья</th><th>Лист</th><th>Сумма (₸)</th><th>Категория</th></tr></thead><tbody>`;
    for (const [label, info] of Object.entries(allCounterpart)) {
      const sheet = sheetSummaries.find(s => s.byCounterparty[label])?.sheetName || '—';
      html += `<tr>
        <td>${label}</td>
        <td style="color:var(--text2);font-size:11px">${sheet}</td>
        <td style="font-weight:600">${fmtN(info.sum)}</td>
        <td class="mapped">→ ${info.fieldLabel}</td>
      </tr>`;
    }
    html += `</tbody></table>`;
  }

  // Таблица: нераспознанные
  if (Object.keys(allUnmatched).length > 0) {
    html += `<div style="font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin:14px 0 8px">Нераспознанные строки</div>`;
    html += `<table><thead><tr><th>Контрагент / Статья</th><th>Сумма (₸)</th><th>Действие</th></tr></thead><tbody>`;
    for (const [label, sum] of Object.entries(allUnmatched)) {
      html += `<tr>
        <td>${label}</td>
        <td>${fmtN(sum)}</td>
        <td><select class="manual-map" data-label="${label}" data-sum="${sum}" style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:3px 6px;color:var(--text);font-size:11px">
          <option value="">— выбрать категорию —</option>
          ${FIELD_MAP.map(f => `<option value="${f.id}">${f.label}</option>`).join('')}
        </select></td>
      </tr>`;
    }
    html += `</tbody></table>`;
  }

  document.getElementById('uploadPreview').innerHTML = html;
  document.getElementById('uploadFileName').textContent = filename;
  document.getElementById('uploadHint').textContent =
    `Автоматически распознано: ${Object.keys(allCounterpart).length} строк · Нераспознано: ${Object.keys(allUnmatched).length}`;
  document.getElementById('uploadHint').style.color = '';
  document.getElementById('uploadZone').classList.add('hidden');
  document.getElementById('uploadResult').classList.remove('hidden');

  // Ручной маппинг нераспознанных
  document.querySelectorAll('.manual-map').forEach(sel => {
    sel.addEventListener('change', () => {
      const fieldId = sel.value;
      const sum     = parseFloat(sel.dataset.sum);
      const label   = sel.dataset.label;
      if (fieldId && sum) {
        parsedData[fieldId] = (parsedData[fieldId] || 0) + sum;
        sel.closest('tr').style.opacity = '.5';
        sel.disabled = true;
        document.getElementById('uploadHint').textContent = `Добавлено вручную: ${label} → ${FIELD_MAP.find(f=>f.id===fieldId)?.label}`;
        document.getElementById('uploadHint').style.color = 'var(--green)';
      }
    });
  });
}

function renderSimplePreview(rows, filename) {
  parsedData = {};
  const fmtN = n => n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
  let matched = 0;
  let html = `<table><thead><tr><th>Поле</th><th>Значение</th><th>Категория</th></tr></thead><tbody>`;

  rows.forEach(([key, val]) => {
    const f   = matchField(String(key));
    const num = cleanNum(val);
    if (f && num !== null) {
      parsedData[f.id] = (parsedData[f.id] || 0) + num;
      matched++;
      html += `<tr><td>${key}</td><td>${fmtN(num)}</td><td class="mapped">→ ${f.label}</td></tr>`;
    } else {
      html += `<tr><td>${key}</td><td>${val}</td><td class="unmapped">—</td></tr>`;
    }
  });
  html += `</tbody></table>`;

  document.getElementById('uploadPreview').innerHTML = html;
  document.getElementById('uploadFileName').textContent = filename;
  document.getElementById('uploadHint').textContent = `Распознано: ${matched} из ${rows.length} строк`;
  document.getElementById('uploadZone').classList.add('hidden');
  document.getElementById('uploadResult').classList.remove('hidden');
}

// ── Обработка файла ───────────────────────────────────────────────────────

function handleFile(file) {
  const name = file.name;
  const ext  = name.split('.').pop().toLowerCase();

  if (ext === 'xlsx' || ext === 'xls') {
    const reader = new FileReader();
    reader.onload = e => {
      const sheets = analyzeWorkbook(new Uint8Array(e.target.result));
      const result = processWorkbook(sheets);
      renderPreview(result, name);
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader = new FileReader();
    reader.onload = e => {
      const rows = parseTextRows(e.target.result, ext);
      renderSimplePreview(rows, name);
    };
    reader.readAsText(file, 'UTF-8');
  }
}

// ── События ───────────────────────────────────────────────────────────────

document.getElementById('browseBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

const zone = document.getElementById('uploadZone');
zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
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
    if (el) { el.value = Math.round(value); count++; }
  }
  document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
  const hint = document.getElementById('uploadHint');
  hint.textContent = `✓ Заполнено полей: ${count}. Проверьте данные и нажмите «Рассчитать».`;
  hint.style.color = 'var(--green)';
});
