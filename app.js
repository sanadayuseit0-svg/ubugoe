// ── 認証 ─────────────────────────────────────────────────

function checkAuth() {
  return localStorage.getItem('ubugoe_auth') === APP_PASSWORD;
}

function submitAuth() {
  const input = document.getElementById('auth-input').value;
  if (input === APP_PASSWORD) {
    localStorage.setItem('ubugoe_auth', APP_PASSWORD);
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    initApp();
  } else {
    const err = document.getElementById('auth-error');
    err.textContent = 'パスワードが違います';
    document.getElementById('auth-input').value = '';
    document.getElementById('auth-input').focus();
    setTimeout(() => { err.textContent = ''; }, 2500);
  }
}

function logout() {
  localStorage.removeItem('ubugoe_auth');
  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('auth-input').value = '';
}

// ── 定数 ─────────────────────────────────────────────────

const PHASE_WEEKS = {
  early:     { start: 0,  end: 15 },
  mid:       { start: 16, end: 27 },
  late:      { start: 28, end: 36 },
  birth:     { start: 37, end: 42 },
  postnatal: { start: 40, end: 56 },
  childcare: { start: 40, end: null },
};

let activePhaseId = PHASES[0].id;
const openWeeks = new Set();

// ── 日付ユーティリティ ───────────────────────────────────

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateJP(date) {
  return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;
}

function formatMonthJP(date) {
  return `${date.getFullYear()}年${date.getMonth()+1}月頃`;
}

function getDueDate() {
  const val = localStorage.getItem('dueDate');
  return val ? new Date(val) : null;
}

// 予定日から指定週のカレンダー日付を計算（予定日 = 40週0日）
function getWeekDate(dueDate, week) {
  return addDays(dueDate, -(40 - week) * 7);
}

// 予定日からフェーズの開始日を計算
function getPhaseStartDate(dueDate, phaseId) {
  const w = PHASE_WEEKS[phaseId];
  if (phaseId === 'postnatal' || phaseId === 'childcare') return dueDate;
  return addDays(dueDate, -(40 - w.start) * 7);
}

// 現在の妊娠週数（予定日から計算）
function getCurrentWeeks(dueDate) {
  const lmp = addDays(dueDate, -280);
  const diff = Math.floor((new Date() - lmp) / 86400000);
  return { weeks: Math.floor(diff / 7), days: diff % 7 };
}

function formatYen(amount) {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

// ── 予定日設定 ───────────────────────────────────────────

function initDueDatePanel() {
  const dueDate = getDueDate();
  const input = document.getElementById('due-date-input');
  if (dueDate) {
    input.value = dueDate.toISOString().split('T')[0];
  }
  renderDueDateInfo();
}

function saveDueDate() {
  const val = document.getElementById('due-date-input').value;
  if (val) {
    localStorage.setItem('dueDate', val);
  } else {
    localStorage.removeItem('dueDate');
  }
  renderDueDateInfo();
  renderRoadmap();
  const calSection = document.getElementById('section-calendar');
  if (calSection.classList.contains('active')) renderCalendar();
}

function renderDueDateInfo() {
  const el = document.getElementById('due-date-info');
  const dueDate = getDueDate();
  if (!dueDate) {
    el.innerHTML = `<span style="color:var(--muted);font-size:13px">予定日を入力すると各フェーズの日程が表示されます</span>`;
    return;
  }
  const { weeks, days } = getCurrentWeeks(dueDate);
  const isPregnant = weeks >= 0 && weeks <= 42;
  const progressPct = Math.min(Math.max((weeks / 40) * 100, 0), 100);

  el.innerHTML = `
    <div class="due-info-grid">
      <div class="due-info-item">
        <span class="due-info-label">出産予定日</span>
        <span class="due-info-value">${formatDateJP(dueDate)}</span>
      </div>
      ${isPregnant ? `
      <div class="due-info-item">
        <span class="due-info-label">現在の妊娠週数</span>
        <span class="due-info-value accent">${weeks}週${days}日</span>
      </div>
      <div class="due-info-item">
        <span class="due-info-label">予定日まで</span>
        <span class="due-info-value">${Math.max(0, Math.round((dueDate - new Date()) / 86400000))}日</span>
      </div>` : `
      <div class="due-info-item">
        <span class="due-info-label">予定日まで</span>
        <span class="due-info-value">${Math.round((dueDate - new Date()) / 86400000)}日</span>
      </div>`}
    </div>
    ${isPregnant ? `
    <div class="preg-progress">
      <div class="preg-progress-track">
        <div class="preg-progress-fill" style="width:${progressPct}%"></div>
      </div>
      <div class="preg-progress-labels">
        <span>妊娠初期</span><span>中期</span><span>後期</span><span>出産</span>
      </div>
    </div>` : ''}
  `;
}

// ── カスタムイベント ──────────────────────────────────────

function getCustomEvents() {
  try { return JSON.parse(localStorage.getItem('customEvents') || '[]'); } catch { return []; }
}

function saveCustomEvents(events) {
  localStorage.setItem('customEvents', JSON.stringify(events));
}

function getEventsForWeek(week) {
  return getCustomEvents().filter(e => e.week === week);
}

function addEventForWeek(week) {
  const titleEl = document.getElementById(`new-event-title-${week}`);
  const dateEl  = document.getElementById(`new-event-date-${week}`);
  const title = titleEl.value.trim();
  const date  = dateEl.value;
  if (!title) { titleEl.focus(); return; }
  const events = getCustomEvents();
  events.push({ id: Date.now(), week, title, date });
  saveCustomEvents(events);
  titleEl.value = '';
  dateEl.value  = '';
  renderCalendar();
  openWeeks.add(week);
}

function deleteEvent(id) {
  const events = getCustomEvents().filter(e => e.id !== id);
  saveCustomEvents(events);
  renderCalendar();
}

// ── Roadmap ────────────────────────────────────────────────

function renderPhaseChip(phase) {
  const isActive = phase.id === activePhaseId;
  const dueDate = getDueDate();
  let dateStr = '';
  if (dueDate) {
    const startDate = getPhaseStartDate(dueDate, phase.id);
    dateStr = `<span class="chip-date">${formatMonthJP(startDate)}</span>`;
  }
  return `
    <button
      class="phase-chip ${isActive ? 'active' : ''}"
      style="${isActive ? `background:${phase.color};color:${phase.activeText}` : ''}"
      onclick="selectPhase('${phase.id}')"
    >
      <span class="chip-icon">${phase.icon}</span>
      <span class="chip-name">${phase.name}</span>
      <span class="chip-period">${phase.period}</span>
      ${dateStr}
    </button>
  `;
}

function renderTodoItem(todo, phaseId, idx) {
  const key = `todo-${phaseId}-${idx}`;
  const checked = localStorage.getItem(key) === '1';
  const linkHtml = todo.url
    ? `<a class="todo-link" href="${todo.url}" target="_blank" rel="noopener">公式ページ</a>`
    : '';
  return `
    <li class="todo-item">
      <input type="checkbox" class="todo-check" id="${key}" ${checked ? 'checked' : ''}
        onchange="toggleTodo('${key}', this.checked)">
      <label for="${key}" class="todo-content" style="cursor:pointer">
        <div class="todo-title ${checked ? 'done' : ''}">${todo.title}</div>
        <div class="todo-meta">
          <span>📍 ${todo.where}</span>
          <span>⏰ ${todo.deadline}</span>
        </div>
        ${linkHtml}
      </label>
    </li>
  `;
}

function renderBenefitItem(benefit) {
  const amountStr = benefit.amount != null ? formatYen(benefit.amount) : '要確認';
  const amountClass = benefit.amount != null ? '' : 'unknown';
  const linkHtml = benefit.url
    ? `<a class="benefit-link" href="${benefit.url}" target="_blank" rel="noopener">詳細</a>`
    : '';
  return `
    <div class="benefit-item">
      <span class="benefit-tag tag-${benefit.tag}">${benefit.tag}</span>
      <div class="benefit-info">
        <div class="benefit-name">${benefit.name}</div>
        <div class="benefit-note">${benefit.note}</div>
        ${linkHtml}
      </div>
      <div class="benefit-amount ${amountClass}">${amountStr}</div>
    </div>
  `;
}

function renderPhaseCard(phase) {
  const cashStr = phase.cashTotal > 0
    ? `<div class="cash-badge">
        <div class="cash-badge-label">このフェーズで受取</div>
        <div class="cash-badge-amount" style="color:${phase.color.replace('b','8')}">${formatYen(phase.cashTotal)}〜</div>
       </div>`
    : '';
  const todosHtml = phase.todos.length > 0
    ? `<ul class="todo-list">${phase.todos.map((t,i) => renderTodoItem(t, phase.id, i)).join('')}</ul>`
    : `<p class="empty-state">このフェーズの手続きはありません</p>`;
  const benefitsHtml = phase.benefits.length > 0
    ? `<div class="benefit-list">${phase.benefits.map(renderBenefitItem).join('')}</div>`
    : `<p class="empty-state">このフェーズでの給付はありません</p>`;

  return `
    <div class="phase-card">
      <div class="phase-card-header">
        <div class="phase-card-icon" style="background:${phase.lightColor}">${phase.icon}</div>
        <div>
          <div class="phase-card-title">${phase.name}</div>
          <div class="phase-card-period">${phase.period}</div>
        </div>
        ${cashStr}
      </div>
      <div class="phase-card-body">
        <div class="card-section">
          <div class="section-heading">✅ やること</div>
          ${todosHtml}
        </div>
        <div class="card-section">
          <div class="section-heading">💰 もらえるお金・サービス</div>
          ${benefitsHtml}
        </div>
      </div>
    </div>
  `;
}

function renderRoadmap() {
  const phase = PHASES.find(p => p.id === activePhaseId);
  document.getElementById('timeline').innerHTML = PHASES.map(renderPhaseChip).join('');
  document.getElementById('phase-detail').innerHTML = renderPhaseCard(phase);
}

function selectPhase(id) {
  activePhaseId = id;
  renderRoadmap();
}

function toggleTodo(key, checked) {
  localStorage.setItem(key, checked ? '1' : '0');
  renderRoadmap();
}

// ── Calendar ───────────────────────────────────────────────

function renderCalendar() {
  const trimesters = ['first', 'second', 'third', 'term'];
  const html = trimesters.map(tri => {
    const info = TRIMESTER_INFO[tri];
    const weeks = CALENDAR_WEEKS.filter(w => w.trimester === tri);
    const weekCardsHtml = weeks.map(w => renderWeekCard(w, info)).join('');
    return `
      <div class="trimester-group">
        <div class="trimester-header" style="background:${info.color};color:${info.text}">
          <span class="trimester-label">${info.label}</span>
          <span class="trimester-weeks">${info.weeks}</span>
        </div>
        <div class="week-cards">${weekCardsHtml}</div>
      </div>
    `;
  }).join('');
  document.getElementById('calendar-content').innerHTML = html;
}

function renderWeekCard(w, triInfo) {
  const isOpen = openWeeks.has(w.week);
  const dueDate = getDueDate();
  const events = getEventsForWeek(w.week);

  let dateBadge = '';
  if (dueDate) {
    const d = getWeekDate(dueDate, w.week);
    dateBadge = `<span class="week-actual-date">${formatDateJP(d)}頃</span>`;
  }

  const eventsHtml = events.map(e => `
    <div class="custom-event">
      <span class="event-icon">📌</span>
      <span class="event-title">${e.title}</span>
      ${e.date ? `<span class="event-date">${e.date.replace(/-/g,'/')}</span>` : ''}
      <button class="event-delete" onclick="deleteEvent(${e.id})" title="削除">✕</button>
    </div>
  `).join('');

  const eventsSection = isOpen ? `
    <div class="week-events-section">
      <div class="week-detail-label">📌 予定・メモ</div>
      ${eventsHtml}
      <div class="event-add-form">
        <input class="event-input" type="text" id="new-event-title-${w.week}" placeholder="例：○○産院 健診" maxlength="40">
        <input class="event-date-input" type="date" id="new-event-date-${w.week}">
        <button class="event-add-btn" onclick="addEventForWeek(${w.week})">追加</button>
      </div>
    </div>
  ` : (events.length > 0 ? `<span class="event-badge">${events.length}件の予定</span>` : '');

  return `
    <div class="week-card ${isOpen ? 'open' : ''}" id="week-${w.week}">
      <div class="week-card-header" onclick="toggleWeek(${w.week})">
        <span class="week-badge" style="background:${triInfo.color};color:${triInfo.text}">${w.label}</span>
        <div class="week-baby-size">
          <span class="week-emoji">${w.babyEmoji}</span>
          <div>
            <div class="week-size-name">${w.babySize}</div>
            <div class="week-size-text">${w.babyDev.slice(0, 24)}…</div>
          </div>
        </div>
        ${dateBadge}
        ${eventsSection && !isOpen ? eventsSection : ''}
        <span class="week-expand-icon">▾</span>
      </div>
      ${isOpen ? `
      <div class="week-card-body">
        <div class="week-detail-item">
          <div class="week-detail-label">👶 赤ちゃんの発育</div>
          <div class="week-detail-text">${w.babyDev}</div>
        </div>
        <div class="week-detail-item">
          <div class="week-detail-label">🤰 ママの体の変化</div>
          <div class="week-detail-text">${w.momBody}</div>
        </div>
        <div class="week-detail-item">
          <div class="week-detail-label">⚠️ 注意・ポイント</div>
          <div class="week-detail-text">${w.attention}</div>
        </div>
        <div class="week-detail-item">
          <div class="week-detail-label">🏥 検診・医療</div>
          <div class="week-detail-text">${w.medical}</div>
        </div>
        ${eventsSection}
      </div>` : ''}
    </div>
  `;
}

function toggleWeek(week) {
  if (openWeeks.has(week)) { openWeeks.delete(week); } else { openWeeks.add(week); }
  renderCalendar();
}

// ── 手元資金シミュレーション ──────────────────────────────

function calcCashflow() {
  const deliveryCost = (parseFloat(document.getElementById('cf-delivery').value) || 55) * 10000;
  const payMethod    = document.getElementById('cf-method').value;
  const babyGoods    = (parseFloat(document.getElementById('cf-baby').value) || 15) * 10000;
  const matGoods     = (parseFloat(document.getElementById('cf-mat').value) || 5) * 10000;
  const empType      = document.getElementById('sim-emp') ? document.getElementById('sim-emp').value : 'employee';
  const salary       = (parseFloat(document.getElementById('sim-salary')?.value) || 30) * 10000;
  const leaveMo      = parseFloat(document.getElementById('sim-leave')?.value) || 12;

  // 出産時の自己負担
  const selfPay = payMethod === 'direct'
    ? Math.max(deliveryCost - 500000, 0)
    : deliveryCost;

  // 産後すぐ戻ってくる金額
  const postBirthIn = payMethod === 'direct' ? 0 : 500000;

  // 手元に必要なピーク資金
  const earlyIn = 66000; // 妊娠初期給付
  const peak = selfPay + babyGoods + matGoods - earlyIn;

  // 産後給付合計
  const postGrants = 50000 + 100000 + 100000 + postBirthIn; // 葛飾+ギフト+都+一時金後払い

  // 育休中の収入
  let leaveIncome = 0;
  if (empType === 'employee' || empType === 'parttime') {
    const monthly = salary;
    const d180 = Math.min(leaveMo, 6);
    const dRest = Math.max(leaveMo - 6, 0);
    leaveIncome = Math.round(monthly * 0.67 * d180 + monthly * 0.5 * dRest);
  }

  // タイムライン
  const timeline = [
    { timing: '妊娠初期',    dir: 'in',  label: '妊婦支援給付金・応援券・マタニティパス', amount: earlyIn },
    { timing: '妊娠〜出産前', dir: 'out', label: 'マタニティ用品',                       amount: matGoods },
    { timing: '出産',        dir: 'out', label: `分娩費自己負担（${payMethod === 'direct' ? '直接支払後差額' : '後日申請のため全額'}）`, amount: selfPay },
    { timing: '出産',        dir: 'out', label: 'ベビー用品準備',                         amount: babyGoods },
    { timing: '産後1〜2ヶ月', dir: 'in',  label: 'かつしか給付金・子育てギフト・赤ちゃんファースト', amount: postGrants - postBirthIn },
    payMethod !== 'direct'
      ? { timing: '産後2ヶ月以内', dir: 'in', label: '出産育児一時金（後日申請）', amount: 500000 }
      : null,
    { timing: `育休中（${leaveMo}ヶ月）`, dir: 'in', label: '育児休業給付金', amount: leaveIncome },
    { timing: '3歳まで（毎月）', dir: 'in', label: '児童手当（3歳まで）', amount: 15000 * 36 },
  ].filter(Boolean);

  const totalIn  = timeline.filter(t => t.dir === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = timeline.filter(t => t.dir === 'out').reduce((s, t) => s + t.amount, 0);

  const rowsHtml = timeline.map(t => `
    <div class="cf-row ${t.dir}">
      <span class="cf-timing">${t.timing}</span>
      <span class="cf-label">${t.label}</span>
      <span class="cf-amount ${t.dir}">${t.dir === 'out' ? '-' : '+'}${formatYen(t.amount)}</span>
    </div>
  `).join('');

  document.getElementById('cf-peak-amount').textContent = formatYen(Math.max(peak, 0));
  document.getElementById('cf-net-amount').textContent  = formatYen(totalIn - totalOut);
  document.getElementById('cf-timeline').innerHTML = rowsHtml;
}

// ── 給付シミュレーター ────────────────────────────────────

function calcSimulator() {
  const empType  = document.getElementById('sim-emp').value;
  const salary   = parseFloat(document.getElementById('sim-salary').value) || 30;
  const leaveMo  = parseFloat(document.getElementById('sim-leave').value) || 12;
  const salaryYen = salary * 10000;
  const dailySalary = salaryYen / 30;

  const fixed = [
    { name: '妊婦支援給付金', amount: 50000 },
    { name: '子育て応援券',   amount: 10000 },
    { name: 'マタニティパス', amount: 6000  },
    { name: '出産育児一時金', amount: 500000 },
    { name: 'かつしか出産応援給付金',      amount: 50000  },
    { name: '子育て応援ギフト（商品）',    amount: 100000 },
    { name: '赤ちゃんファースト・東京都（商品）', amount: 100000 },
  ];

  const variable = [];
  if (empType === 'employee' || empType === 'parttime') {
    const note = empType === 'parttime' ? '（健康保険加入が条件）' : '';
    variable.push({ name: `出産手当金（98日分）${note}`, amount: Math.round(dailySalary * (2/3) * 98) });
    const d = leaveMo * 30;
    const lcv = d <= 180
      ? Math.round(salaryYen * 0.67 * (d / 30))
      : Math.round(salaryYen * 0.67 * 6 + salaryYen * 0.5 * (leaveMo - 6));
    const note2 = empType === 'parttime' ? '（雇用保険加入が条件）' : '';
    variable.push({ name: `育児休業給付金（${leaveMo}ヶ月）${note2}`, amount: lcv });
  } else {
    variable.push({ name: '出産手当金',    amount: null });
    variable.push({ name: '育児休業給付金', amount: null });
  }
  variable.push({ name: '児童手当（3歳まで36ヶ月）', amount: 15000 * 36 });

  const fixedTotal = fixed.reduce((s,r) => s + r.amount, 0);
  const varTotal   = variable.reduce((s,r) => s + (r.amount||0), 0);
  const grandTotal = fixedTotal + varTotal;

  document.getElementById('sim-total-amount').textContent = formatYen(grandTotal);
  document.getElementById('sim-breakdown').innerHTML = `
    <div class="result-section-label">全員共通の給付</div>
    ${fixed.map(r => `
      <div class="result-row">
        <span class="result-row-name">${r.name}</span>
        <span class="result-row-amount">${formatYen(r.amount)}</span>
      </div>`).join('')}
    <div class="result-section-label">雇用形態別の給付</div>
    ${variable.map(r => `
      <div class="result-row">
        <span class="result-row-name">${r.name}</span>
        <span class="result-row-amount ${r.amount==null?'variable':''}">${r.amount!=null?formatYen(r.amount):'対象外'}</span>
      </div>`).join('')}
  `;

  calcCashflow();
}

// ── タブ切り替え ──────────────────────────────────────────

function showTab(name) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  document.getElementById(`tab-${name}`).classList.add('active');
  if (name === 'sim')      { calcSimulator(); }
  if (name === 'calendar') { renderCalendar(); }
}

// ── 初期化 ────────────────────────────────────────────────

function initApp() {
  initDueDatePanel();
  renderRoadmap();

  document.getElementById('due-date-input').addEventListener('change', saveDueDate);

  ['sim-emp','sim-salary','sim-leave'].forEach(id => {
    document.getElementById(id).addEventListener('change', calcSimulator);
    document.getElementById(id).addEventListener('input',  calcSimulator);
  });

  ['cf-delivery','cf-method','cf-baby','cf-mat'].forEach(id => {
    document.getElementById(id).addEventListener('change', calcCashflow);
    document.getElementById(id).addEventListener('input',  calcCashflow);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    initApp();
  }
});
