// ─── Navigation ──────────────────────────────────────────────────────────────
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

// ─── Charts ───────────────────────────────────────────────────────────────────
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = '#2a3348';
Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size = 12;

const months = ['Февраль', 'Март', 'Апрель', 'Май', 'Июнь'];
const revenues = [69000000, 72000000, 75000000, 79200000, 82500000];
const expenses = [49700000, 52200000, 54800000, 57800000, 59400000];
const profits  = revenues.map((r, i) => r - expenses[i]);

new Chart(document.getElementById('trendChart'), {
  type: 'line',
  data: {
    labels: months,
    datasets: [
      { label: 'Выручка',       data: revenues, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.07)', tension: 0.4, fill: true, pointRadius: 4 },
      { label: 'Расходы',       data: expenses, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)',  tension: 0.4, fill: true, pointRadius: 4 },
      { label: 'Чистая прибыль',data: profits,  borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.06)', tension: 0.4, fill: true, pointRadius: 4 },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { ticks: { callback: v => '₸' + (v/1000000).toFixed(0) + 'М' } } },
  },
});

const expenseLabels = ['Титан','ФОТ','Ремонт','Логистика','Аренда','Страхование','Командировки','Административные'];
const expenseData   = [22600000,12000000,8000000,7000000,4000000,2000000,2000000,1800000];
const totalExp = expenseData.reduce((a,b) => a+b, 0);

new Chart(document.getElementById('expenseChart'), {
  type: 'doughnut',
  data: {
    labels: expenseLabels,
    datasets: [{ data: expenseData, backgroundColor: ['#ef4444','#3b82f6','#f59e0b','#a78bfa','#34d399','#60a5fa','#fbbf24','#94a3b8'], borderWidth: 2, borderColor: '#161b27' }],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 11, font: { size: 11 } } },
      tooltip: { callbacks: { label: ctx => ` ₸${(ctx.parsed/1000000).toFixed(1)}М (${((ctx.parsed/totalExp)*100).toFixed(1)}%)` } },
    },
  },
});

new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: expenseLabels,
    datasets: [{ label: '₸', data: expenseData, backgroundColor: expenseData.map((_,i) => i===0?'rgba(239,68,68,0.7)':'rgba(59,130,246,0.6)'), borderRadius: 4 }],
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { callback: v => '₸'+(v/1000000).toFixed(0)+'М' } } },
  },
});

// ─── Report calculator ────────────────────────────────────────────────────────
document.getElementById('calcBtn').addEventListener('click', () => {
  const volume    = parseFloat(document.getElementById('f-volume').value)     || 1000;
  const price     = parseFloat(document.getElementById('f-price').value)      || 82500;
  const contracts = parseFloat(document.getElementById('f-contracts').value)  || 0;
  const penalties = parseFloat(document.getElementById('f-penalties').value)  || 0;
  const rentInc   = parseFloat(document.getElementById('f-rent-income').value)|| 0;
  const titan     = parseFloat(document.getElementById('f-titan').value)      || 22600000;
  const payroll   = parseFloat(document.getElementById('f-payroll').value)    || 12000000;
  const rent      = parseFloat(document.getElementById('f-rent').value)       || 4000000;
  const insurance = parseFloat(document.getElementById('f-insurance').value)  || 2000000;
  const repair    = parseFloat(document.getElementById('f-repair').value)     || 8000000;
  const logistics = parseFloat(document.getElementById('f-logistics').value)  || 7000000;
  const travel    = parseFloat(document.getElementById('f-travel').value)     || 2000000;
  const admin     = parseFloat(document.getElementById('f-admin').value)      || 1800000;

  const revenue  = volume*price + contracts + penalties + rentInc;
  const exps     = titan + payroll + rent + insurance + repair + logistics + travel + admin;
  const profit   = revenue - exps;
  const ebitda   = (profit/revenue*100).toFixed(1);
  const costTon  = (exps/volume).toFixed(0);
  const expRatio = (exps/revenue*100).toFixed(1);
  const titanPct = (titan/exps*100).toFixed(1);

  const fmt = n => '₸' + Math.round(n).toLocaleString('ru-RU');
  const checks = [
    { ok: parseFloat(ebitda)   >= 35,    text: `EBITDA margin: ${ebitda}% (цель ≥35%)` },
    { ok: parseFloat(costTon)  <= 55000, text: `Себестоимость: ₸${costTon}/т (цель ≤₸55 000)` },
    { ok: parseFloat(expRatio) <= 65,    text: `Коэфф. расходов: ${expRatio}% (норма ≤65%)` },
    { ok: parseFloat(titanPct) <= 30,    text: `Доля Титан: ${titanPct}% (норма ≤30%)` },
  ];

  const el = document.getElementById('reportResult');
  el.classList.remove('hidden');
  el.innerHTML = `
    <div style="font-size:15px;font-weight:700;margin-bottom:14px">Результаты периода</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
      <div><span style="color:var(--text2)">Выручка:</span> <strong>${fmt(revenue)}</strong></div>
      <div><span style="color:var(--text2)">Расходы:</span> <strong>${fmt(exps)}</strong></div>
      <div><span style="color:var(--text2)">Чистая прибыль:</span> <strong style="color:${profit>0?'var(--green)':'var(--red)'}">${fmt(profit)}</strong></div>
      <div><span style="color:var(--text2)">Объём добычи:</span> <strong>${volume} т</strong></div>
    </div>
    <div style="font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px">Аудит показателей</div>
    ${checks.map(c => `
      <div style="padding:8px 12px;margin-bottom:6px;border-radius:6px;
        background:${c.ok?'rgba(34,197,94,.08)':'rgba(239,68,68,.08)'};
        border-left:3px solid ${c.ok?'var(--green)':'var(--red)'};font-size:13px">
        <span style="color:${c.ok?'var(--green)':'var(--red)'};font-weight:700">${c.ok?'✓ ОК':'✗ КРИТИЧНО'}</span>
        &nbsp;—&nbsp;${c.text}
      </div>`).join('')}
  `;
});

// ─── KPI form ─────────────────────────────────────────────────────────────────
document.getElementById('kpiBtn').addEventListener('click', () => {
  const production = document.getElementById('kpi-production').value || '—';
  const revenue    = document.getElementById('kpi-revenue').value;
  const titanFact  = document.getElementById('kpi-titan-fact').value;
  const titanPlan  = document.getElementById('kpi-titan-plan').value;
  const logistFact = document.getElementById('kpi-logist-fact').value;
  const logistPlan = document.getElementById('kpi-logist-plan').value;
  const balance    = document.getElementById('kpi-balance').value;
  const fmt = n => n ? '₸'+(parseFloat(n)/1000000).toFixed(1)+'М' : '—';
  const today = new Date().toLocaleDateString('ru-RU', { day:'numeric', month:'short' });
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${today}</td><td>${production}</td><td>${fmt(revenue)}</td>
    <td class="${parseFloat(titanFact)<=parseFloat(titanPlan)?'ok':'warn'}">${fmt(titanFact)} / ${fmt(titanPlan)}</td>
    <td class="${parseFloat(logistFact)<=parseFloat(logistPlan)?'ok':'warn'}">${fmt(logistFact)} / ${fmt(logistPlan)}</td>
    <td>${fmt(balance)}</td>`;
  document.getElementById('kpiBody').prepend(row);
  ['kpi-production','kpi-revenue','kpi-titan-fact','kpi-titan-plan','kpi-logist-fact','kpi-logist-plan','kpi-balance']
    .forEach(id => { document.getElementById(id).value = ''; });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD — специфичный парсер для cash flow формата СБК/Титан
// ═══════════════════════════════════════════════════════════════════════════════

// Внутригрупповые переводы — пропускаем
const INTERNAL_KEYS = ['займ','возврат предоплат','возврат займ','движения связанных','кредит форте','погашение кредита','форте кредит'];
const INTERNAL_CP   = ['сбк','лд','absolute','абсолют','агро','аго','авантаж','шыгыс мунай','форте'];

// Служебные строки
const SKIP_LABELS = ['остаток','итого','поступление','выбытие','дата','контрагент','назначение','сумма','народный','евразийск','рбк','бцк','свободные','банк'];

// Prefix назначения → категория расходов
const PURPOSE_PREFIX = {
  'мр ':  'f-repair',    // материальные расходы
  'нт ':  'f-repair',    // нефтепромысловые
  'трт ': 'f-logistics', // транспорт
  'ауп ': 'f-admin',     // административные
};

// Маппинг контрагент+назначение → поле формы
const FIELD_MAP = [
  // ── ДОХОДЫ ──
  { id: '__oil__',    label: '🛢 Выручка от нефти',     income: true, keys: ['за нефть','нефть ','реализац нефт','анп ','анп\n','лайнс джамп','lines jump'] },
  { id: 'f-rent-income', label: '🔧 Аренда техники (доход)', income: true, keys: ['аренда техники'] },
  { id: 'f-penalties',   label: '📋 Прочие доходы',         income: true, keys: ['возмещение штрафа','возмещение расходов','за снегоуборочн','возврат по запчаст','за газ на а/м','concept возмещ'] },

  // ── РАСХОДЫ — ФОТ ──
  { id: 'f-payroll', label: '👷 Зарплата',  keys: ['зарплат','сотрудники','отпускные','оклад','амантаев','сандигалиев','хамитов','бакытбек'] },
  { id: 'f-payroll', label: '🏛 Налоги с ФОТ', keys: ['ипн','соц.налог','соц.отч','мед.отч','пенс.отч','кпн','нао гкп','угд','инпн','налоги, пенс','налог за дб','отч за дб'] },

  // ── РАСХОДЫ — ремонт ──
  { id: 'f-repair', label: '🔩 Ремонт и запчасти', keys: [
    'ремонт','запчаст','подшипник','редуктор','генератор','стартер','двигател','тнвд',
    'фильтр','масл','антифриз','манжет','шестерн','цапф','пневмоусил','тормоз','аккумулят',
    'ремень клин','набивка','сальник','электрод','перемотка','насос','погрузчик','лизинг',
    'ремтехком','кама урал','корнеев','гайдарь','амандосов','тарлан','олжас',
    'star master','евразиан маш','кастон','адал тау','ролова','кэлм','шебер',
    'ремонт вагон','частотный прео','пожарн','tops safety','противофонтан','астр',
    'насосы винт','ремонт генер','ремонт старт','ремонт редук','замена масла',
    'противопожарн','зип','запчасти',
  ]},

  // ── РАСХОДЫ — топливо / логистика ──
  { id: 'f-logistics', label: '🚛 Логистика и топливо', keys: [
    'дизтопливо','бензин','азс ','азс\n','дт ','перевозк','доставк',
    'вахт','гелиос','gs&ko','royal petrol','куценко','калмукашев',
    'трекер','бесхлебнов','газ для газели','пропан','гсм',
    'перевозка нефти','tas building',
  ]},

  // ── РАСХОДЫ — инфраструктура ──
  { id: 'f-rent', label: '🏢 Аренда и инфраструктура', keys: [
    'аренда офис','it-cube','аренда кварт','электроэнергия','энергосистема',
    'вода в офисе','вывоз мусор','qazaqgaz','qazagaz','газ ауп','ауп газ',
    'aqtobe-su','believe вода','neo plus','казахтелеком','дивизион',
    'связь, интернет','ауп вода','ауп электр','охрана','бастион',
  ]},

  // ── РАСХОДЫ — страхование ──
  { id: 'f-insurance', label: '🛡 Страхование', keys: ['страхован','каско','аманат','полис','ауп застрах'] },

  // ── РАСХОДЫ — административные ──
  { id: 'f-admin', label: '📎 Административные', keys: [
    'комиссия банка','канцтовар','картридж','почта','нотариус','алем тат',
    'ауп почта','жихаз','шолпан','заправка картр','обслуживание трекер',
    'госпошлина','юр услуг','адвокат','суд','продукты питания','анвар','инком',
    'кх жана','баня','питание','ауп фитнес','ауп масс','медикам','ауп продукт',
    'ауп табурет','ауп канц','ауп вывоз','вывоз','сбор','роялти','абонплата',
    'абон плата','обслуживание','ауп спирт','термометр','услуги такси',
    'мойка а/м','мусор','возмещение','ремонт вагонч',
  ]},

  // ── РАСХОДЫ — командировочные ──
  { id: 'f-travel', label: '✈ Командировочные', keys: [
    'командир','суточн','билет','проезд сотруд','перелет','гостиниц','отрар',
    'ауп расходы по суду','касенов','увайдолла','юр суд',
  ]},
];

// Поля, которые считаются "личными" расходами (не бизнес) — помечаем но не скрываем
const PERSONAL_KEYS = ['обучение детей','зем.участок','земельный','квартира','фитнес','массажное кресло','прадо','каско прадо','болсын к'];

function cleanNum(val) {
  if (!val && val !== 0) return null;
  const s = String(val).replace(/\s/g,'').replace(',','.').replace(/[^\d.\-]/g,'');
  const n = parseFloat(s);
  return isNaN(n) || n === 0 ? null : n;
}

function isInternal(cp, pur) {
  const t = (cp+' '+pur).toLowerCase();
  if (INTERNAL_KEYS.some(k => t.includes(k))) return true;
  const cpLow = cp.toLowerCase().trim();
  return INTERNAL_CP.some(k => cpLow === k || cpLow.startsWith(k+' '));
}

function isSkip(label) {
  const l = String(label).toLowerCase().trim();
  if (!l || l==='.' || l==='-' || l==='итого') return true;
  return SKIP_LABELS.some(s => l.startsWith(s));
}

function isPersonal(cp, pur) {
  const t = (cp+' '+pur).toLowerCase();
  return PERSONAL_KEYS.some(k => t.includes(k));
}

function matchField(cp, pur) {
  const cpL  = cp.toLowerCase();
  const purL = pur.toLowerCase().trim();
  const full = cpL + ' ' + purL;

  // 1) prefix назначения
  for (const [prefix, fid] of Object.entries(PURPOSE_PREFIX)) {
    if (purL.startsWith(prefix)) {
      // уточнение: топливо → логистика даже если prefix = мр/нт
      if ((fid==='f-repair'||fid==='f-admin') && (purL.includes('бензин')||purL.includes('дизт')||purL.includes(' дт ')||purL.includes('пропан')||purL.includes('гсм'))) {
        return FIELD_MAP.find(f=>f.id==='f-logistics');
      }
      const f = FIELD_MAP.find(f=>f.id===fid && !f.income);
      if (f) return f;
    }
  }

  // 2) ключевые слова
  for (const f of FIELD_MAP) {
    if (f.keys.some(k => full.includes(k))) return f;
  }
  return null;
}

// ── Главная функция разбора workbook ──────────────────────────────────────────
function processWorkbook(sheets) {
  const totals    = {};   // fieldId → sum
  const byLine    = {};   // lineKey → {fieldId, label, sum, count, type, sheet, cp, pur}
  const unmatched = {};   // lineKey → {sum, count, sheet, cp, pur, side}
  const personal  = {};   // lineKey → {sum, cp, pur, sheet}
  let oilRevenue  = 0;
  let otherIncome = 0;
  let skipped     = 0;
  const summary   = [];

  for (const [sheetName, rows] of Object.entries(sheets)) {
    let shIn = 0, shEx = 0, shSkip = 0;

    for (const row of rows) {
      // ── Доходная сторона (cols 1,2,3) ──
      const cpIn  = String(row[1]||'').trim();
      const purIn = String(row[2]||'').trim();
      const amIn  = cleanNum(row[3]);

      if (cpIn && amIn && !isSkip(cpIn) && !isSkip(purIn)) {
        if (isInternal(cpIn, purIn)) { skipped++; shSkip++; }
        else {
          const m = matchField(cpIn, purIn);
          const key = cpIn + ' | ' + purIn;
          if (m && m.income) {
            totals[m.id] = (totals[m.id]||0) + amIn;
            if (m.id==='__oil__') oilRevenue += amIn; else otherIncome += amIn;
            shIn += amIn;
            if (!byLine[key]) byLine[key] = { fieldId:m.id, label:m.label, sum:0, count:0, type:'income', sheet:sheetName, cp:cpIn, pur:purIn };
            byLine[key].sum += amIn; byLine[key].count++;
          } else {
            if (!unmatched[key]) unmatched[key] = { sum:0, count:0, sheet:sheetName, cp:cpIn, pur:purIn, side:'income' };
            unmatched[key].sum += amIn; unmatched[key].count++;
          }
        }
      }

      // ── Расходная сторона (cols 5,6,7) ──
      const cpEx  = String(row[5]||'').trim();
      const purEx = String(row[6]||'').trim();
      const amEx  = cleanNum(row[7]);
      const labelEx = cpEx || purEx;

      if (labelEx && amEx && !isSkip(labelEx)) {
        if (isInternal(cpEx, purEx)) { skipped++; shSkip++; }
        else if (isPersonal(cpEx, purEx)) {
          const key = cpEx+'|'+purEx;
          if (!personal[key]) personal[key] = { sum:0, cp:cpEx, pur:purEx, sheet:sheetName };
          personal[key].sum += amEx;
        } else {
          const m = matchField(cpEx, purEx);
          const key = cpEx + ' | ' + purEx;
          if (m && !m.income) {
            totals[m.id] = (totals[m.id]||0) + amEx;
            shEx += amEx;
            if (!byLine[key]) byLine[key] = { fieldId:m.id, label:m.label, sum:0, count:0, type:'expense', sheet:sheetName, cp:cpEx, pur:purEx };
            byLine[key].sum += amEx; byLine[key].count++;
          } else {
            if (!unmatched[key]) unmatched[key] = { sum:0, count:0, sheet:sheetName, cp:cpEx, pur:purEx, side:'expense' };
            unmatched[key].sum += amEx; unmatched[key].count++;
          }
        }
      }
    }

    if (shIn+shEx > 0) summary.push({ sheetName, income:shIn, expense:shEx, skipped:shSkip });
  }

  return { totals, byLine, unmatched, personal, oilRevenue, otherIncome,
           grandIncome: oilRevenue+otherIncome, skipped, summary };
}

// ── Рендер превью ─────────────────────────────────────────────────────────────
let parsedData = {};

function fmtN(n) { return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }); }
function fmtM(n) { return '₸' + (n/1000000).toFixed(2) + 'М'; }

function renderPreview(result, filename) {
  const { totals, byLine, unmatched, personal, oilRevenue, otherIncome, grandIncome, skipped, summary } = result;
  parsedData = {};

  // Переносим в parsedData только реальные поля формы
  for (const [fid, val] of Object.entries(totals)) {
    if (fid !== '__oil__' && fid !== '__other_income__' && document.getElementById(fid)) {
      parsedData[fid] = val;
    }
  }
  // Нефтяная выручка → f-contracts (сумма продажи нефти)
  if (totals['__oil__']) parsedData['f-contracts'] = totals['__oil__'];

  const totalExpenses = Object.entries(totals)
    .filter(([k]) => !k.startsWith('__'))
    .reduce((s,[,v]) => s+v, 0);

  let html = '';

  // ── Итоговая сводка ──
  html += `
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
    <div style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);border-radius:8px;padding:14px;text-align:center">
      <div style="font-size:10px;color:var(--text2);text-transform:uppercase;margin-bottom:4px">🛢 Выручка от нефти</div>
      <div style="font-size:18px;font-weight:700;color:var(--green)">₸${fmtN(oilRevenue)}</div>
    </div>
    <div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:14px;text-align:center">
      <div style="font-size:10px;color:var(--text2);text-transform:uppercase;margin-bottom:4px">Расходы бизнеса</div>
      <div style="font-size:18px;font-weight:700;color:var(--red)">₸${fmtN(totalExpenses)}</div>
    </div>
    <div style="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.3);border-radius:8px;padding:14px;text-align:center">
      <div style="font-size:10px;color:var(--text2);text-transform:uppercase;margin-bottom:4px">Прибыль (чистая)</div>
      <div style="font-size:18px;font-weight:700;color:${oilRevenue-totalExpenses>=0?'var(--green)':'var(--red)'}">₸${fmtN(oilRevenue+otherIncome-totalExpenses)}</div>
    </div>
  </div>
  <div style="font-size:11px;color:var(--text2);margin-bottom:14px">
    Листов: <strong style="color:var(--text)">${summary.length}</strong> &nbsp;|&nbsp;
    Пропущено внутренних: <strong style="color:var(--text)">${skipped}</strong> &nbsp;|&nbsp;
    ${summary.map(s=>`<span style="color:var(--accent2)">${s.sheetName}</span>`).join(' · ')}
  </div>`;

  // ── Категории расходов (сводная таблица) ──
  const catTotals = {};
  for (const [key, info] of Object.entries(byLine)) {
    if (info.type === 'expense') {
      const cat = info.label;
      catTotals[cat] = (catTotals[cat]||0) + info.sum;
    }
  }
  if (Object.keys(catTotals).length > 0) {
    html += `<div style="font-size:11px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">▼ Расходы по категориям</div>`;
    html += `<table><thead><tr><th>Категория</th><th style="text-align:right">Сумма (₸)</th><th style="text-align:right">%</th></tr></thead><tbody>`;
    for (const [cat, sum] of Object.entries(catTotals).sort(([,a],[,b])=>b-a)) {
      const pct = totalExpenses > 0 ? ((sum/totalExpenses)*100).toFixed(1) : '0';
      html += `<tr><td>${cat}</td><td style="text-align:right;font-weight:600">${fmtN(sum)}</td><td style="text-align:right;color:var(--text2)">${pct}%</td></tr>`;
    }
    html += `</tbody></table>`;
  }

  // ── Детализация транзакций ──
  const incomeLines  = Object.entries(byLine).filter(([,v])=>v.type==='income');
  const expenseLines = Object.entries(byLine).filter(([,v])=>v.type==='expense').sort(([,a],[,b])=>b.sum-a.sum);

  if (incomeLines.length > 0) {
    html += `<div style="font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.5px;margin:14px 0 8px">▲ Доходы</div>`;
    html += `<table><thead><tr><th>Контрагент</th><th>Назначение</th><th>Лист</th><th style="text-align:right">Сумма</th></tr></thead><tbody>`;
    for (const [, info] of incomeLines) {
      html += `<tr><td><strong>${info.cp}</strong></td><td style="color:var(--text2);font-size:12px">${info.pur}</td><td style="color:var(--text2);font-size:11px">${info.sheet}</td><td style="text-align:right;font-weight:700;color:var(--green)">₸${fmtN(info.sum)}</td></tr>`;
    }
    html += `</tbody></table>`;
  }

  if (expenseLines.length > 0) {
    html += `<div style="font-size:11px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.5px;margin:14px 0 8px">▼ Расходы (детализация)</div>`;
    html += `<table><thead><tr><th>Контрагент</th><th>Назначение</th><th>Категория</th><th style="text-align:right">Сумма</th></tr></thead><tbody>`;
    for (const [, info] of expenseLines) {
      html += `<tr><td>${info.cp}</td><td style="color:var(--text2);font-size:12px">${info.pur.substring(0,50)}</td><td class="mapped" style="font-size:11px">${info.label}</td><td style="text-align:right;font-weight:600">₸${fmtN(info.sum)}</td></tr>`;
    }
    html += `</tbody></table>`;
  }

  // ── Личные расходы (не включены в бизнес) ──
  const personalEntries = Object.values(personal);
  if (personalEntries.length > 0) {
    const pTotal = personalEntries.reduce((s,v)=>s+v.sum,0);
    html += `<div style="font-size:11px;font-weight:700;color:var(--yellow);text-transform:uppercase;letter-spacing:.5px;margin:14px 0 8px">⚠ Личные расходы (не включены) — ₸${fmtN(pTotal)}</div>`;
    html += `<table><thead><tr><th>Контрагент</th><th>Назначение</th><th style="text-align:right">Сумма</th></tr></thead><tbody>`;
    for (const p of personalEntries.sort((a,b)=>b.sum-a.sum)) {
      html += `<tr><td>${p.cp}</td><td style="color:var(--text2);font-size:12px">${p.pur}</td><td style="text-align:right;color:var(--yellow);font-weight:600">₸${fmtN(p.sum)}</td></tr>`;
    }
    html += `</tbody></table>`;
  }

  // ── Нераспознанные — ручной маппинг ──
  const unmatchedEntries = Object.entries(unmatched).sort(([,a],[,b])=>b.sum-a.sum);
  if (unmatchedEntries.length > 0) {
    html += `<div style="font-size:11px;font-weight:700;color:var(--yellow);text-transform:uppercase;letter-spacing:.5px;margin:14px 0 8px">? Нераспознанные — выберите категорию</div>`;
    html += `<table><thead><tr><th>Контрагент</th><th>Назначение</th><th style="text-align:right">Сумма</th><th>Категория</th></tr></thead><tbody>`;
    for (const [key, info] of unmatchedEntries) {
      html += `<tr>
        <td>${info.cp}</td>
        <td style="color:var(--text2);font-size:12px">${info.pur.substring(0,45)}</td>
        <td style="text-align:right;font-weight:600">₸${fmtN(info.sum)}</td>
        <td><select class="manual-map" data-key="${key}" data-sum="${info.sum}" data-side="${info.side}"
          style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:3px 6px;color:var(--text);font-size:11px;width:100%">
          <option value="">— выбрать —</option>
          <option value="__oil__">🛢 Выручка от нефти</option>
          <option value="__skip__">✕ Пропустить</option>
          ${FIELD_MAP.filter(f=>!f.income).map(f=>`<option value="${f.id}">${f.label}</option>`).join('')}
        </select></td>
      </tr>`;
    }
    html += `</tbody></table>`;
  }

  document.getElementById('uploadPreview').innerHTML = html;
  document.getElementById('uploadFileName').textContent = filename;
  const matched = Object.keys(byLine).length;
  document.getElementById('uploadHint').textContent =
    `Распознано: ${matched} транзакций · Нераспознано: ${unmatchedEntries.length} · Личных: ${personalEntries.length}`;
  document.getElementById('uploadHint').style.color = '';
  document.getElementById('uploadZone').classList.add('hidden');
  document.getElementById('uploadResult').classList.remove('hidden');

  // Ручной маппинг нераспознанных
  document.querySelectorAll('.manual-map').forEach(sel => {
    sel.addEventListener('change', () => {
      const fid = sel.value;
      const sum = parseFloat(sel.dataset.sum);
      if (!fid || fid === '__skip__') { sel.closest('tr').style.opacity='.4'; return; }
      if (fid === '__oil__') {
        parsedData['f-contracts'] = (parsedData['f-contracts']||0) + sum;
      } else {
        parsedData[fid] = (parsedData[fid]||0) + sum;
      }
      sel.closest('tr').style.opacity = '.45';
      sel.disabled = true;
    });
  });
}

function renderSimplePreview(rows, filename) {
  parsedData = {};
  let matched = 0;
  let html = `<table><thead><tr><th>Поле</th><th>Значение</th><th>Категория</th></tr></thead><tbody>`;
  rows.forEach(([key, val]) => {
    const f   = matchField(String(key), '');
    const num = cleanNum(val);
    if (f && num) { parsedData[f.id] = (parsedData[f.id]||0)+num; matched++; html += `<tr><td>${key}</td><td>${fmtN(num)}</td><td class="mapped">${f.label}</td></tr>`; }
    else          { html += `<tr><td>${key}</td><td>${val}</td><td class="unmapped">—</td></tr>`; }
  });
  html += `</tbody></table>`;
  document.getElementById('uploadPreview').innerHTML = html;
  document.getElementById('uploadFileName').textContent = filename;
  document.getElementById('uploadHint').textContent = `Распознано: ${matched} из ${rows.length}`;
  document.getElementById('uploadZone').classList.add('hidden');
  document.getElementById('uploadResult').classList.remove('hidden');
}

// ── Обработчик файла ──────────────────────────────────────────────────────────
function handleFile(file) {
  const name = file.name;
  const ext  = name.split('.').pop().toLowerCase();

  if (ext === 'xlsx' || ext === 'xls') {
    const reader = new FileReader();
    reader.onload = e => {
      const wb     = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      const sheets = {};
      wb.SheetNames.forEach(n => { sheets[n] = XLSX.utils.sheet_to_json(wb.Sheets[n], { header:1, defval:'' }); });
      renderPreview(processWorkbook(sheets), name);
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      let rows = [];
      if (ext==='json') { try { const o=JSON.parse(text); rows=Array.isArray(o)?o.map(i=>[Object.values(i)[0],Object.values(i)[1]]):Object.entries(o); } catch{} }
      else { const sep=ext==='csv'?/[;,]/:/[\t:—–]/; rows=text.trim().split(/\r?\n/).map(l=>{const p=l.split(sep).map(s=>s.trim().replace(/^["']|["']$/g,'')); return p.length>=2?[p[0],p[1]]:null;}).filter(Boolean); }
      renderSimplePreview(rows, name);
    };
    reader.readAsText(file, 'UTF-8');
  }
}

// ── События ───────────────────────────────────────────────────────────────────
document.getElementById('browseBtn').addEventListener('click', () => document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

const zone = document.getElementById('uploadZone');
zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
zone.addEventListener('drop', e => {
  e.preventDefault(); zone.classList.remove('drag-over');
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
  for (const [fid, val] of Object.entries(parsedData)) {
    const el = document.getElementById(fid);
    if (el) { el.value = Math.round(val); count++; }
  }
  document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
  const hint = document.getElementById('uploadHint');
  hint.textContent = `✓ Заполнено полей: ${count}. Проверьте и нажмите «Рассчитать».`;
  hint.style.color = 'var(--green)';
});
