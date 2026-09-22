const STORAGE_RATES = 'act_rates';
const STORAGE_HISTORY = 'act_history';

const els = {
  rateAedUsd: document.getElementById('rateAedUsd'),
  rateUsdKgs: document.getElementById('rateUsdKgs'),
  fetchRateBtn: document.getElementById('fetchRateBtn'),
  rateUpdatedHint: document.getElementById('rateUpdatedHint'),

  carPrice: document.getElementById('carPrice'),
  carPriceCur: document.getElementById('carPriceCur'),
  logistics: document.getElementById('logistics'),
  logisticsCur: document.getElementById('logisticsCur'),
  customs: document.getElementById('customs'),
  customsCur: document.getElementById('customsCur'),
  other: document.getElementById('other'),
  otherCur: document.getElementById('otherCur'),

  calcBtn: document.getElementById('calcBtn'),
  resultCard: document.getElementById('resultCard'),
  resultAed: document.getElementById('resultAed'),
  resultUsd: document.getElementById('resultUsd'),
  resultKgs: document.getElementById('resultKgs'),
  toggleBreakdownBtn: document.getElementById('toggleBreakdownBtn'),
  breakdown: document.getElementById('breakdown'),

  historyList: document.getElementById('historyList'),
  emptyHistoryHint: document.getElementById('emptyHistoryHint'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
};

function loadRates() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_RATES) || 'null');
    if (saved) {
      if (saved.aedUsd) els.rateAedUsd.value = saved.aedUsd;
      if (saved.usdKgs) els.rateUsdKgs.value = saved.usdKgs;
      if (saved.updatedAt) {
        els.rateUpdatedHint.textContent = 'Курс USD→KGS обновлён: ' + formatDateTime(saved.updatedAt);
      }
    }
  } catch (e) {}
}

function saveRates(updatedAt) {
  const data = {
    aedUsd: parseFloat(els.rateAedUsd.value) || 0,
    usdKgs: parseFloat(els.rateUsdKgs.value) || 0,
  };
  if (updatedAt) data.updatedAt = updatedAt;
  else {
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_RATES) || 'null');
      if (prev && prev.updatedAt) data.updatedAt = prev.updatedAt;
    } catch (e) {}
  }
  localStorage.setItem(STORAGE_RATES, JSON.stringify(data));
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmt(num, decimals) {
  return num.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

async function fetchLiveRate() {
  els.fetchRateBtn.disabled = true;
  els.fetchRateBtn.textContent = 'Загрузка...';
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('network');
    const data = await res.json();
    const kgs = data && data.rates && data.rates.KGS;
    if (!kgs) throw new Error('no-kgs');
    els.rateUsdKgs.value = kgs.toFixed(2);
    const now = new Date().toISOString();
    saveRates(now);
    els.rateUpdatedHint.textContent = 'Курс USD→KGS обновлён: ' + formatDateTime(now);
  } catch (e) {
    els.rateUpdatedHint.textContent = 'Не удалось получить курс. Введите вручную.';
  } finally {
    els.fetchRateBtn.disabled = false;
    els.fetchRateBtn.textContent = 'Обновить курс';
  }
}

function toUsd(amount, currency, rates) {
  if (currency === 'USD') return amount;
  if (currency === 'AED') return amount / rates.aedUsd;
  if (currency === 'KGS') return amount / rates.usdKgs;
  return 0;
}

function readInputs() {
  return {
    carPrice: { amount: parseFloat(els.carPrice.value) || 0, currency: els.carPriceCur.value },
    logistics: { amount: parseFloat(els.logistics.value) || 0, currency: els.logisticsCur.value },
    customs: { amount: parseFloat(els.customs.value) || 0, currency: els.customsCur.value },
    other: { amount: parseFloat(els.other.value) || 0, currency: els.otherCur.value },
  };
}

function calculate() {
  const rates = {
    aedUsd: parseFloat(els.rateAedUsd.value) || 3.6725,
    usdKgs: parseFloat(els.rateUsdKgs.value) || 0,
  };
  saveRates();

  const inputs = readInputs();
  const labels = {
    carPrice: 'Цена авто',
    logistics: 'Логистика / доставка',
    customs: 'Растаможка / пошлины',
    other: 'Прочие расходы',
  };

  const items = [];
  let totalUsd = 0;
  for (const key of Object.keys(inputs)) {
    const { amount, currency } = inputs[key];
    const usd = toUsd(amount, currency, rates);
    totalUsd += usd;
    items.push({ label: labels[key], amount, currency, usd });
  }

  const totalAed = totalUsd * rates.aedUsd;
  const totalKgs = totalUsd * rates.usdKgs;

  renderResult(totalAed, totalUsd, totalKgs, items);
  saveToHistory({ items, rates, totalAed, totalUsd, totalKgs, timestamp: new Date().toISOString() });
  renderHistory();
}

function renderResult(aed, usd, kgs, items) {
  els.resultCard.hidden = false;
  els.resultAed.textContent = fmt(aed, 2);
  els.resultUsd.textContent = fmt(usd, 2);
  els.resultKgs.textContent = fmt(kgs, 0);

  els.breakdown.innerHTML = items
    .filter((i) => i.amount > 0)
    .map(
      (i) =>
        `<div class="breakdown-row"><span>${i.label} (${fmt(i.amount, 2)} ${i.currency})</span><span>$${fmt(i.usd, 2)}</span></div>`
    )
    .join('');

  els.resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function saveToHistory(record) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
  } catch (e) {}
  history.unshift(record);
  history = history.slice(0, 50);
  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
}

function deleteHistoryItem(index) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
  } catch (e) {}
  history.splice(index, 1);
  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
  } catch (e) {}

  if (history.length === 0) {
    els.historyList.innerHTML = '<p class="empty-hint">Пока нет сохранённых расчётов</p>';
    return;
  }

  els.historyList.innerHTML = history
    .map(
      (rec, idx) => `
      <div class="history-item">
        <div class="history-item-top">
          <span class="history-date">${formatDateTime(rec.timestamp)}</span>
          <button class="history-delete" data-idx="${idx}">Удалить</button>
        </div>
        <div class="history-totals">
          <div class="history-total"><span class="cur">AED</span><span class="val">${fmt(rec.totalAed, 2)}</span></div>
          <div class="history-total"><span class="cur">USD</span><span class="val">${fmt(rec.totalUsd, 2)}</span></div>
          <div class="history-total"><span class="cur">KGS</span><span class="val">${fmt(rec.totalKgs, 0)}</span></div>
        </div>
      </div>`
    )
    .join('');

  els.historyList.querySelectorAll('.history-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteHistoryItem(parseInt(btn.dataset.idx, 10)));
  });
}

els.calcBtn.addEventListener('click', calculate);
els.fetchRateBtn.addEventListener('click', fetchLiveRate);
els.toggleBreakdownBtn.addEventListener('click', () => {
  const hidden = els.breakdown.hidden;
  els.breakdown.hidden = !hidden;
  els.toggleBreakdownBtn.textContent = hidden ? 'Скрыть детали расчёта' : 'Показать детали расчёта';
});
els.clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Удалить всю историю расчётов?')) {
    localStorage.setItem(STORAGE_HISTORY, '[]');
    renderHistory();
  }
});

loadRates();
renderHistory();
