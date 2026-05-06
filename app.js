// ── Firestore 同期 ────────────────────────────────────────

let _suppressSnapshot = false; // 自分の書き込みによる再レンダーを抑制

async function fsWrite(data) {
  if (typeof FAMILY_DOC === 'undefined') return; // Firebase未初期化時はスキップ
  try {
    _suppressSnapshot = true;
    await FAMILY_DOC.set(data, { merge: true });
  } catch (e) {
    console.warn('Firestore write failed:', e);
  } finally {
    setTimeout(() => { _suppressSnapshot = false; }, 600);
  }
}

function startFirestoreSync() {
  if (typeof FAMILY_DOC === 'undefined') return;

  FAMILY_DOC.onSnapshot(snapshot => {
    if (_suppressSnapshot || !snapshot.exists) return;

    const data = snapshot.data();

    // 出産予定日
    if (data.dueDate !== undefined) {
      if (data.dueDate) localStorage.setItem('dueDate', data.dueDate);
      else              localStorage.removeItem('dueDate');
      renderDueDateInfo();
      renderRoadmap();
      if (calDisplayMode === 'calendar') renderCalendarGrid();
    }

    // カスタムイベント
    if (data.customEvents !== undefined) {
      localStorage.setItem('customEvents', JSON.stringify(data.customEvents || []));
      renderCalendarContent();
    }

    // チェックリスト
    if (data.todos !== undefined) {
      Object.entries(data.todos || {}).forEach(([key, val]) => {
        localStorage.setItem(key, val ? '1' : '0');
      });
      renderRoadmap();
    }

    // 区選択
    if (data.ward !== undefined) {
      if (data.ward) localStorage.setItem('selectedWard', data.ward);
      else           localStorage.removeItem('selectedWard');
      const sel = document.getElementById('ward-select');
      if (sel) sel.value = data.ward || '';
      renderRoadmap();
      renderWardBadge();
    }
  }, err => console.warn('Firestore listen error:', err));
}

// ── 区選択 ────────────────────────────────────────────────────

function getWard() {
  return localStorage.getItem('selectedWard') || '';
}

function saveWard(wardId) {
  if (wardId) localStorage.setItem('selectedWard', wardId);
  else        localStorage.removeItem('selectedWard');
  fsWrite({ ward: wardId || null });
  renderWardBadge();
  renderRoadmap();
  calcSimulator();
}

function renderWardBadge() {
  const el = document.getElementById('ward-badge');
  if (!el) return;
  const wardId = getWard();
  const ward = WARDS.find(w => w.id === wardId);
  el.textContent = ward ? `📍 ${ward.name}` : '';
  el.style.display = ward ? 'inline-block' : 'none';
}

// 区固有 todos + 共通 todos を結合して返す
function getMergedTodos(phase) {
  const wardId = getWard();
  const wardTodos = wardId && WARD_DATA[wardId]?.todos?.[phase.id] || [];
  return [...wardTodos, ...phase.todos];
}

// 区固有 benefits + 共通 benefits を結合して返す
function getMergedBenefits(phase) {
  const wardId = getWard();
  const wardBenefits = wardId && WARD_DATA[wardId]?.benefits?.[phase.id] || [];
  return [...phase.benefits, ...wardBenefits];
}

// 区固有の cash 合計を返す
function getWardCashTotal(phaseId) {
  const wardId = getWard();
  const benefits = wardId && WARD_DATA[wardId]?.benefits?.[phaseId] || [];
  return benefits.reduce((s, b) => s + (b.amount || 0), 0);
}

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

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

function getDueDate() {
  const val = localStorage.getItem('dueDate');
  return val ? new Date(val) : null;
}

function getWeekDate(dueDate, week) {
  return addDays(dueDate, -(40 - week) * 7);
}

function getPhaseStartDate(dueDate, phaseId) {
  const w = PHASE_WEEKS[phaseId];
  if (phaseId === 'postnatal' || phaseId === 'childcare') return dueDate;
  return addDays(dueDate, -(40 - w.start) * 7);
}

function getWeekNumForDate(dueDate, date) {
  const lmp = addDays(dueDate, -280);
  const diff = Math.floor((date - lmp) / 86400000);
  return { weeks: Math.floor(diff / 7), days: diff % 7 };
}

function getCurrentWeeks(dueDate) {
  return getWeekNumForDate(dueDate, new Date());
}

function formatYen(amount) {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

// ── 予定日設定 ───────────────────────────────────────────

const PHASE_WEEKS = {
  early:     { start: 0,  end: 15 },
  mid:       { start: 16, end: 27 },
  late:      { start: 28, end: 36 },
  birth:     { start: 37, end: 42 },
  postnatal: { start: 40, end: 56 },
  childcare: { start: 40, end: null },
};

function initWardSelect() {
  const sel = document.getElementById('ward-select');
  if (!sel) return;
  sel.innerHTML = '<option value="">区を選択してください</option>'
    + WARDS.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
  sel.value = getWard();
  renderWardBadge();
}

function initDueDatePanel() {
  const dueDate = getDueDate();
  const input = document.getElementById('due-date-input');
  if (dueDate) input.value = toDateStr(dueDate);
  renderDueDateInfo();
}

function saveDueDate() {
  const val = document.getElementById('due-date-input').value;
  if (val) localStorage.setItem('dueDate', val);
  else localStorage.removeItem('dueDate');
  fsWrite({ dueDate: val || null });
  renderDueDateInfo();
  renderRoadmap();
  if (calDisplayMode === 'calendar') renderCalendarGrid();
}

function renderDueDateInfo() {
  const el = document.getElementById('due-date-info');
  const dueDate = getDueDate();
  if (!dueDate) {
    el.innerHTML = `<span style="color:var(--muted);font-size:13px">予定日を入力すると各フェーズの日程・妊娠週数が表示されます</span>`;
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
  fsWrite({ customEvents: events });
}

function getEventsForDate(dateStr) {
  return getCustomEvents().filter(e => e.date === dateStr);
}

function getEventsForWeek(week) {
  return getCustomEvents().filter(e => e.week === week);
}

function addEventForWeek(week) {
  const titleEl = document.getElementById(`new-event-title-${week}`);
  const dateEl  = document.getElementById(`new-event-date-${week}`);
  const title = titleEl.value.trim();
  if (!title) { titleEl.focus(); return; }
  const events = getCustomEvents();
  events.push({ id: Date.now(), week, title, date: dateEl.value });
  saveCustomEvents(events);
  titleEl.value = ''; dateEl.value = '';
  renderCalendarContent();
  openWeeks.add(week);
}

function addEventForDate(dateStr) {
  const titleEl = document.getElementById('cal-new-event-title');
  const title = titleEl.value.trim();
  if (!title) { titleEl.focus(); return; }
  const dueDate = getDueDate();
  let week = null;
  if (dueDate) {
    const d = new Date(dateStr);
    week = getWeekNumForDate(dueDate, d).weeks;
  }
  const events = getCustomEvents();
  events.push({ id: Date.now(), week, title, date: dateStr });
  saveCustomEvents(events);
  titleEl.value = '';
  renderCalendarContent();
  selectedCalDate = dateStr;
  renderDayDetail(dateStr);
}

function deleteEvent(id) {
  saveCustomEvents(getCustomEvents().filter(e => e.id !== id));
  renderCalendarContent();
  if (selectedCalDate) renderDayDetail(selectedCalDate);
}

// ── Roadmap ────────────────────────────────────────────────

let activePhaseId = PHASES[0].id;

function renderPhaseChip(phase) {
  const isActive = phase.id === activePhaseId;
  const dueDate = getDueDate();
  let dateStr = '';
  if (dueDate) {
    const startDate = getPhaseStartDate(dueDate, phase.id);
    dateStr = `<span class="chip-date">${formatMonthJP(startDate)}</span>`;
  }
  return `
    <button class="phase-chip ${isActive ? 'active' : ''}"
      style="${isActive ? `background:${phase.color};color:${phase.activeText}` : ''}"
      onclick="selectPhase('${phase.id}')">
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
    ? `<a class="todo-link" href="${todo.url}" target="_blank" rel="noopener">公式ページ</a>` : '';
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

function renderAffiliateProducts(products) {
  if (!products || products.length === 0) return '';
  return `
    <div class="affiliate-list">
      ${products.map(p => `
        <div class="affiliate-item">
          <span class="affiliate-emoji">${p.emoji}</span>
          <div class="affiliate-info">
            <div class="affiliate-name">${p.name}</div>
            <div class="affiliate-note">${p.note}</div>
          </div>
          <div class="affiliate-links">
            <a class="affiliate-link amz"  href="${p.amzUrl}"  target="_blank" rel="noopener sponsored">Amazon</a>
            <a class="affiliate-link rktn" href="${p.rktnUrl}" target="_blank" rel="noopener sponsored">楽天</a>
          </div>
        </div>`).join('')}
      <div class="affiliate-disclosure">※ Amazon・楽天アフィリエイトリンクを含みます</div>
    </div>`;
}

function renderBenefitItem(benefit) {
  const amountStr = benefit.amount != null ? formatYen(benefit.amount) : '要確認';
  const amountClass = benefit.amount != null ? '' : 'unknown';
  const linkHtml = benefit.url
    ? `<a class="benefit-link" href="${benefit.url}" target="_blank" rel="noopener">詳細</a>` : '';
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
  const todos    = getMergedTodos(phase);
  const benefits = getMergedBenefits(phase);
  const cashTotal = phase.cashTotal + getWardCashTotal(phase.id);

  // 区未選択の場合のガイダンス
  const wardId = getWard();
  const wardNote = !wardId
    ? `<div class="ward-note">📍 区を選択すると区役所手続き・区独自の給付金も表示されます</div>` : '';

  const cashStr = cashTotal > 0
    ? `<div class="cash-badge">
        <div class="cash-badge-label">このフェーズで受取</div>
        <div class="cash-badge-amount" style="color:${phase.color.replace('b','8')}">${formatYen(cashTotal)}〜</div>
       </div>` : '';
  const todosHtml = todos.length > 0
    ? `<ul class="todo-list">${todos.map((t,i) => renderTodoItem(t, phase.id, i)).join('')}</ul>`
    : `<p class="empty-state">このフェーズの手続きはありません</p>`;
  const benefitsHtml = benefits.length > 0
    ? `<div class="benefit-list">${benefits.map(renderBenefitItem).join('')}</div>
       <div class="benefit-disclaimer">※ 金額は目安です。制度は年度ごとに変わる場合があります。最新情報・申請条件は各自治体の公式サイトをご確認ください。</div>`
    : `<p class="empty-state">このフェーズでの給付はありません</p>`;
  const affiliateProds = AFFILIATE_PRODUCTS.phase[phase.id] || [];
  const affiliateHtml  = renderAffiliateProducts(affiliateProds);
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
      ${wardNote}
      <div class="phase-card-body">
        <div class="card-section">
          <div class="section-heading">✅ やること</div>
          ${todosHtml}
        </div>
        <div class="card-section">
          <div class="section-heading">💰 もらえるお金・サービス</div>
          ${benefitsHtml}
        </div>
        ${affiliateHtml ? `
        <div class="card-section">
          <div class="section-heading">🛍 準備リスト</div>
          ${affiliateHtml}
        </div>` : ''}
      </div>
    </div>
  `;
}

function renderRoadmap() {
  document.getElementById('timeline').innerHTML = PHASES.map(renderPhaseChip).join('');
  document.getElementById('phase-detail').innerHTML = renderPhaseCard(PHASES.find(p => p.id === activePhaseId));
}

function selectPhase(id) {
  activePhaseId = id;
  renderRoadmap();
}

function toggleTodo(key, checked) {
  localStorage.setItem(key, checked ? '1' : '0');
  fsWrite({ todos: { [key]: checked } });
  renderRoadmap();
}

// ── カレンダー（カレンダービュー） ────────────────────────

let calDisplayMode = 'calendar';
let calViewYear  = new Date().getFullYear();
let calViewMonth = new Date().getMonth();
let selectedCalDate = null;

const DOW_LABELS = ['月','火','水','木','金','土','日'];
const TRIMESTER_COLORS = { first:'#bbf7d0', second:'#fbcfe8', third:'#ddd6fe', term:'#fef08a' };
const TRIMESTER_TEXTS  = { first:'#166534', second:'#831843', third:'#4c1d95', term:'#78350f' };

function renderCalendarContent() {
  if (calDisplayMode === 'calendar') renderCalendarGrid();
  else renderCalendarList();
  document.getElementById('btn-cal-view').classList.toggle('active', calDisplayMode === 'calendar');
  document.getElementById('btn-list-view').classList.toggle('active', calDisplayMode === 'list');
}

function setCalView(mode) {
  calDisplayMode = mode;
  renderCalendarContent();
}

// 予定日から全マイルストーン日付のマップを作成
function buildMilestoneMap(dueDate) {
  const map = {};
  CALENDAR_WEEKS.forEach(w => {
    const d = getWeekDate(dueDate, w.week);
    map[toDateStr(d)] = w;
  });
  return map;
}

// カスタムイベントを日付→リストのマップに
function buildEventMap() {
  const map = {};
  getCustomEvents().forEach(e => {
    if (e.date) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
  });
  return map;
}

function renderCalendarGrid() {
  const dueDate   = getDueDate();
  const milestones = dueDate ? buildMilestoneMap(dueDate) : {};
  const eventMap   = buildEventMap();
  const todayStr   = toDateStr(new Date());

  const firstDay = new Date(calViewYear, calViewMonth, 1);
  const lastDay  = new Date(calViewYear, calViewMonth + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // 月=0

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(new Date(calViewYear, calViewMonth, d));
  }

  let rows = '';
  for (let i = 0; i < cells.length; i += 7) {
    const week = cells.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    const tds = week.map((d, dow) => {
      if (!d) return `<td class="cal-empty"></td>`;
      const ds = toDateStr(d);
      const m  = milestones[ds];
      const ev = eventMap[ds] || [];
      const isToday    = ds === todayStr;
      const isSelected = ds === selectedCalDate;
      const isSat = dow === 5, isSun = dow === 6;
      let weekLabel = '';
      if (dueDate) {
        const { weeks } = getWeekNumForDate(dueDate, d);
        if (weeks >= 4 && weeks <= 42) weekLabel = `<span class="cal-week-label">${weeks}w</span>`;
      }
      return `
        <td class="cal-day ${isToday?'today':''} ${isSelected?'selected':''} ${m?'has-milestone':''} ${ev.length?'has-event':''} ${isSat?'sat':''} ${isSun?'sun':''}"
            onclick="selectCalDay('${ds}')">
          <span class="cal-day-num">${d.getDate()}</span>
          ${weekLabel}
          <div class="cal-dots">
            ${m  ? `<span class="cal-dot milestone" style="background:${TRIMESTER_COLORS[m.trimester]}"></span>` : ''}
            ${ev.length ? `<span class="cal-dot event"></span>` : ''}
          </div>
        </td>`;
    }).join('');
    rows += `<tr>${tds}</tr>`;
  }

  const noDueDateNote = !dueDate
    ? `<div class="cal-no-due">📅 出産予定日を設定すると妊娠週数・マイルストーンが表示されます</div>` : '';

  document.getElementById('calendar-content').innerHTML = `
    ${noDueDateNote}
    <div class="cal-month-nav">
      <button class="cal-nav-btn" onclick="changeCalMonth(-1)">‹</button>
      <span class="cal-month-label">${calViewYear}年${calViewMonth+1}月</span>
      <button class="cal-nav-btn" onclick="changeCalMonth(1)">›</button>
    </div>
    <div class="cal-legend">
      <span class="legend-item"><span class="cal-dot milestone" style="background:#f9a8d4"></span>マイルストーン</span>
      <span class="legend-item"><span class="cal-dot event"></span>予定</span>
    </div>
    <div class="cal-grid-wrapper">
      <table class="cal-grid">
        <thead><tr>${DOW_LABELS.map((d,i) => `<th class="${i===5?'sat':i===6?'sun':''}">${d}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div id="cal-day-detail" class="cal-day-detail">
      <p class="cal-select-prompt">日付をタップすると詳細が表示されます</p>
    </div>
  `;

  if (selectedCalDate) renderDayDetail(selectedCalDate);
}

function changeCalMonth(delta) {
  calViewMonth += delta;
  if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
  if (calViewMonth < 0)  { calViewMonth = 11; calViewYear--; }
  renderCalendarGrid();
}

function selectCalDay(dateStr) {
  selectedCalDate = dateStr;
  renderCalendarGrid();
}

function renderDayDetail(dateStr) {
  const el = document.getElementById('cal-day-detail');
  if (!el) return;
  const dueDate  = getDueDate();
  const d        = new Date(dateStr);
  const evList   = getEventsForDate(dateStr);
  const milestones = dueDate ? buildMilestoneMap(dueDate) : {};
  const milestone  = milestones[dateStr];

  let weekInfo = '';
  if (dueDate) {
    const { weeks, days } = getWeekNumForDate(dueDate, d);
    if (weeks >= 0 && weeks <= 42) {
      weekInfo = `<div class="day-week-badge">妊娠 ${weeks}週${days}日</div>`;
    }
  }

  const milestoneHtml = milestone ? `
    <div class="day-milestone">
      <div class="day-milestone-header">
        <span class="day-milestone-emoji">${milestone.babyEmoji}</span>
        <div>
          <div class="day-milestone-week">${milestone.label}（${milestone.babySize}）</div>
          <div class="day-milestone-text">${milestone.babyDev}</div>
        </div>
      </div>
    </div>` : '';

  const evHtml = evList.map(e => `
    <div class="custom-event">
      <span class="event-icon">📌</span>
      <span class="event-title">${e.title}</span>
      <button class="event-delete" onclick="deleteEvent(${e.id})">✕</button>
    </div>`).join('');

  el.innerHTML = `
    <div class="day-detail-header">
      <span class="day-detail-date">${formatDateJP(d)}</span>
      ${weekInfo}
    </div>
    ${milestoneHtml}
    ${evHtml ? `<div class="day-events">${evHtml}</div>` : ''}
    <div class="event-add-form" style="margin-top:10px">
      <input class="event-input" type="text" id="cal-new-event-title" placeholder="予定を追加（例：○○産院 健診）" maxlength="40">
      <button class="event-add-btn" onclick="addEventForDate('${dateStr}')">追加</button>
    </div>
  `;
}

// ── カレンダー（リスト表示） ───────────────────────────────

const openWeeks = new Set();

function renderCalendarList() {
  const trimesters = ['first', 'second', 'third', 'term'];
  const html = trimesters.map(tri => {
    const info = TRIMESTER_INFO[tri];
    const weeks = CALENDAR_WEEKS.filter(w => w.trimester === tri);
    return `
      <div class="trimester-group">
        <div class="trimester-header" style="background:${info.color};color:${info.text}">
          <span class="trimester-label">${info.label}</span>
          <span class="trimester-weeks">${info.weeks}</span>
        </div>
        <div class="week-cards">${weeks.map(w => renderWeekCard(w, info)).join('')}</div>
      </div>
    `;
  }).join('');
  document.getElementById('calendar-content').innerHTML = html;
}

function renderWeekCard(w, triInfo) {
  const isOpen   = openWeeks.has(w.week);
  const dueDate  = getDueDate();
  const events   = getEventsForWeek(w.week);
  let dateBadge  = '';
  if (dueDate) {
    const d = getWeekDate(dueDate, w.week);
    dateBadge = `<span class="week-actual-date">${formatDateJP(d)}頃</span>`;
  }

  const weekProds   = AFFILIATE_PRODUCTS.week[w.week] || [];
  const weekAffHtml = renderAffiliateProducts(weekProds);

  const eventsHtml = events.map(e => `
    <div class="custom-event">
      <span class="event-icon">📌</span>
      <span class="event-title">${e.title}</span>
      ${e.date ? `<span class="event-date">${e.date.replace(/-/g,'/')}</span>` : ''}
      <button class="event-delete" onclick="deleteEvent(${e.id})">✕</button>
    </div>`).join('');

  const eventsSection = isOpen ? `
    <div class="week-events-section">
      <div class="week-detail-label">📌 予定・メモ</div>
      ${eventsHtml}
      <div class="event-add-form">
        <input class="event-input" type="text" id="new-event-title-${w.week}" placeholder="例：○○産院 健診" maxlength="40">
        <input class="event-date-input" type="date" id="new-event-date-${w.week}">
        <button class="event-add-btn" onclick="addEventForWeek(${w.week})">追加</button>
      </div>
    </div>` : (events.length > 0 ? `<span class="event-badge">${events.length}件の予定</span>` : '');

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
        ${weekAffHtml ? `
        <div class="week-detail-item">
          <div class="week-detail-label">🛍 今週の準備リスト</div>
          ${weekAffHtml}
        </div>` : ''}
      </div>` : ''}
    </div>
  `;
}

function toggleWeek(week) {
  if (openWeeks.has(week)) openWeeks.delete(week); else openWeeks.add(week);
  renderCalendarList();
}

// ── Googleカレンダー (.ics) エクスポート ─────────────────

function generateICS() {
  const dueDate = getDueDate();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//うぶごえ//JP',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:うぶごえ 妊娠カレンダー',
    'X-WR-TIMEZONE:Asia/Tokyo',
  ];

  const icsDate = d => toDateStr(d).replace(/-/g, '');

  if (dueDate) {
    CALENDAR_WEEKS.forEach(w => {
      const d = getWeekDate(dueDate, w.week);
      const next = addDays(d, 1);
      lines.push(
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${icsDate(d)}`,
        `DTEND;VALUE=DATE:${icsDate(next)}`,
        `SUMMARY:🤰 ${w.label}（${w.babySize}）`,
        `DESCRIPTION:${w.babyDev}\\n${w.momBody}\\n注意：${w.attention}`,
        `UID:ubugoe-week-${w.week}@ubugoe`,
        'END:VEVENT',
      );
    });
  }

  getCustomEvents().forEach(e => {
    if (!e.date) return;
    const d    = new Date(e.date);
    const next = addDays(d, 1);
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${icsDate(d)}`,
      `DTEND;VALUE=DATE:${icsDate(next)}`,
      `SUMMARY:📌 ${e.title}`,
      `UID:ubugoe-event-${e.id}@ubugoe`,
      'END:VEVENT',
    );
  });

  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'ubugoe-calendar.ics'; a.click();
  URL.revokeObjectURL(url);
}

// ── シミュレーター ────────────────────────────────────────

function calcSimulator() {
  const empType  = document.getElementById('sim-emp').value;
  const salary   = parseFloat(document.getElementById('sim-salary').value) || 30;
  const leaveMo  = parseFloat(document.getElementById('sim-leave').value) || 12;
  const salaryYen   = salary * 10000;
  const dailySalary = salaryYen / 30;

  const wardId = getWard();
  const wardSimBenefits = wardId && WARD_DATA[wardId]?.simBenefits || [];
  const fixed = [
    { name: '妊婦支援給付金',            amount: 50000  },
    { name: 'マタニティパス',            amount: 6000   },
    { name: '出産育児一時金',            amount: 500000 },
    { name: '子育て応援ギフト（商品）',   amount: 100000 },
    { name: '赤ちゃんファースト・東京都', amount: 100000 },
    ...wardSimBenefits,
  ];
  const variable = [];
  if (empType === 'employee' || empType === 'parttime') {
    const note  = empType === 'parttime' ? '（健康保険加入が条件）' : '';
    const note2 = empType === 'parttime' ? '（雇用保険加入が条件）' : '';
    variable.push({ name: `出産手当金（98日分）${note}`, amount: Math.round(dailySalary*(2/3)*98) });
    const d   = leaveMo * 30;
    const lcv = d <= 180
      ? Math.round(salaryYen * 0.67 * (d/30))
      : Math.round(salaryYen * 0.67 * 6 + salaryYen * 0.5 * (leaveMo-6));
    variable.push({ name: `育児休業給付金（${leaveMo}ヶ月）${note2}`, amount: lcv });
  } else {
    variable.push({ name: '出産手当金',    amount: null });
    variable.push({ name: '育児休業給付金', amount: null });
  }
  variable.push({ name: '児童手当（3歳まで36ヶ月）', amount: 15000 * 36 });

  const total = [...fixed, ...variable].reduce((s,r) => s+(r.amount||0), 0);
  document.getElementById('sim-total-amount').textContent = formatYen(total);
  document.getElementById('sim-breakdown').innerHTML = `
    <div class="result-section-label">全員共通の給付</div>
    ${fixed.map(r => `<div class="result-row"><span class="result-row-name">${r.name}</span><span class="result-row-amount">${formatYen(r.amount)}</span></div>`).join('')}
    <div class="result-section-label">雇用形態別の給付</div>
    ${variable.map(r => `<div class="result-row"><span class="result-row-name">${r.name}</span><span class="result-row-amount ${r.amount==null?'variable':''}">${r.amount!=null?formatYen(r.amount):'対象外'}</span></div>`).join('')}
    <div class="sim-insurance">
      <div class="sim-insurance-heading">💡 分娩費の自己負担に備えて、マタニティ保険を検討しませんか？</div>
      <a class="sim-insurance-link" href="https://hoken.kakaku.com/ins/seimei/" target="_blank" rel="noopener sponsored">保険を無料で比較する →</a>
      <div class="affiliate-disclosure">※ 広告リンクを含みます</div>
    </div>
  `;
  calcCashflow();
}

function calcCashflow() {
  const deliveryCost = (parseFloat(document.getElementById('cf-delivery').value)||55)*10000;
  const payMethod    = document.getElementById('cf-method').value;
  const babyGoods    = (parseFloat(document.getElementById('cf-baby').value)||15)*10000;
  const matGoods     = (parseFloat(document.getElementById('cf-mat').value)||5)*10000;
  const empType      = document.getElementById('sim-emp')?.value || 'employee';
  const salary       = (parseFloat(document.getElementById('sim-salary')?.value)||30)*10000;
  const leaveMo      = parseFloat(document.getElementById('sim-leave')?.value)||12;

  const selfPay    = payMethod === 'direct' ? Math.max(deliveryCost-500000,0) : deliveryCost;
  const postBirthIn = payMethod === 'direct' ? 0 : 500000;
  const earlyIn    = 66000;
  const peak       = selfPay + babyGoods + matGoods - earlyIn;
  const postGrants = 250000 + postBirthIn;

  let leaveIncome = 0;
  if (empType === 'employee' || empType === 'parttime') {
    leaveIncome = leaveMo <= 6
      ? Math.round(salary * 0.67 * leaveMo)
      : Math.round(salary * 0.67 * 6 + salary * 0.5 * (leaveMo-6));
  }

  const timeline = [
    { timing:'妊娠初期',       dir:'in',  label:'妊婦支援給付金・応援券・マタニティパス', amount:earlyIn },
    { timing:'妊娠〜出産前',   dir:'out', label:'マタニティ用品',                        amount:matGoods },
    { timing:'出産',           dir:'out', label:`分娩費自己負担（${payMethod==='direct'?'差額':'全額先払い'}）`, amount:selfPay },
    { timing:'出産',           dir:'out', label:'ベビー用品準備',                        amount:babyGoods },
    { timing:'産後1〜2ヶ月',   dir:'in',  label:'葛飾給付金・子育てギフト・赤ちゃんファースト', amount:postGrants-postBirthIn },
    payMethod!=='direct' ? { timing:'産後2ヶ月以内', dir:'in', label:'出産育児一時金（後日申請）', amount:500000 } : null,
    { timing:`育休中（${leaveMo}ヶ月）`, dir:'in', label:'育児休業給付金', amount:leaveIncome },
    { timing:'3歳まで（毎月）', dir:'in',  label:'児童手当（3歳まで）',    amount:15000*36 },
  ].filter(Boolean);

  const totalIn  = timeline.filter(t=>t.dir==='in').reduce((s,t)=>s+t.amount,0);
  const totalOut = timeline.filter(t=>t.dir==='out').reduce((s,t)=>s+t.amount,0);

  document.getElementById('cf-peak-amount').textContent = formatYen(Math.max(peak,0));
  document.getElementById('cf-net-amount').textContent  = formatYen(totalIn-totalOut);
  document.getElementById('cf-timeline').innerHTML = timeline.map(t => `
    <div class="cf-row ${t.dir}">
      <span class="cf-timing">${t.timing}</span>
      <span class="cf-label">${t.label}</span>
      <span class="cf-amount ${t.dir}">${t.dir==='out'?'-':'+'}${formatYen(t.amount)}</span>
    </div>`).join('');
}



// ── タブ切り替え ──────────────────────────────────────────

function showTab(name) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  document.getElementById(`tab-${name}`).classList.add('active');
  if (name === 'sim')      calcSimulator();
  if (name === 'calendar') renderCalendarContent();
}

// ── 初期化 ────────────────────────────────────────────────

function initApp() {
  startFirestoreSync();
  initDueDatePanel();
  initWardSelect();
  renderRoadmap();

  document.getElementById('due-date-input').addEventListener('change', saveDueDate);
  document.getElementById('ward-select').addEventListener('change', e => saveWard(e.target.value));

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
  initApp();
});
