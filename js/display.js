/**
 * Miradas! Lac Banquet — Display Page
 * Fetches live vote counts from API and shows QR code for voting.
 */

const KINGS = [
  { id: 'golden-boy', name: 'The Golden Boy', suit: '♠', isRed: false },
  { id: 'classic', name: 'The Classic', suit: '♠', isRed: false },
  { id: 'maverick', name: 'The Maverick', suit: '♥', isRed: true },
  { id: 'historian', name: 'The Historian', suit: '♥', isRed: true },
  { id: 'flame', name: 'The Flame', suit: '♦', isRed: true },
  { id: 'voice', name: 'The Voice', suit: '♦', isRed: true },
  { id: 'mustang', name: 'The Mustang', suit: '♣', isRed: false },
  { id: 'heartbreaker', name: 'The Heartbreaker', suit: '♣', isRed: false },
];

// Vote counts from API
let votes = KINGS.reduce((acc, k) => ({ ...acc, [k.id]: 0 }), {});
let cardElements = [];

function getTotalVotes() {
  return Object.values(votes).reduce((a, b) => a + b, 0);
}

function getLeadingIds() {
  const max = Math.max(...Object.values(votes));
  if (max === 0) return [];
  return Object.entries(votes).filter(([, v]) => v === max).map(([id]) => id);
}

function renderCard(king, voteCount, percent, isLeading) {
  const suitClass = king.isRed ? 'suit-red' : '';
  const card = document.createElement('div');
  card.className = `king-card${isLeading ? ' leading' : ''}`;
  card.dataset.kingId = king.id;

  card.innerHTML = `
    <span class="king-card__corner king-card__corner--tl ${suitClass}">K ${king.suit}</span>
    <span class="king-card__corner king-card__corner--br ${suitClass}">K ${king.suit}</span>
    <span class="king-card__crown ${suitClass}">♛</span>
    <span class="king-card__suit ${suitClass}">${king.suit}</span>
    <span class="king-card__name">${king.name}</span>
    <span class="king-card__votes">${voteCount} vote${voteCount !== 1 ? 's' : ''} (${percent}%)</span>
    <div class="king-card__bar"><div class="king-card__bar-fill" style="width: ${percent}%"></div></div>
  `;

  return card;
}

function updateDisplay() {
  const total = getTotalVotes();
  const leadingIds = getLeadingIds();

  document.getElementById('prediction-count').textContent = total;

  const totalPct = total || 1;

  if (cardElements.length === 0) {
    const grid = document.getElementById('king-grid');
    grid.innerHTML = '';
    KINGS.forEach((king) => {
      const v = votes[king.id];
      const percent = Math.round((v / totalPct) * 100);
      const isLeading = leadingIds.includes(king.id) && v > 0;
      const card = renderCard(king, v, percent, isLeading);
      cardElements.push({ el: card, king });
      grid.appendChild(card);
    });
  } else {
    cardElements.forEach(({ el, king }) => {
      const v = votes[king.id];
      const percent = Math.round((v / totalPct) * 100);
      const isLeading = leadingIds.includes(king.id) && v > 0;
      el.classList.toggle('leading', isLeading);
      el.querySelector('.king-card__votes').textContent =
        `${v} vote${v !== 1 ? 's' : ''} (${percent}%)`;
      el.querySelector('.king-card__bar-fill').style.width = `${percent}%`;
    });
  }
}

async function fetchVotes() {
  try {
    const res = await fetch('/api/votes');
    const data = await res.json();
    if (data?.counts) {
      votes = KINGS.reduce((acc, k) => ({ ...acc, [k.id]: Number(data.counts[k.id]) || 0 }), {});
      updateDisplay();
    }
  } catch (err) {
    console.warn('Failed to fetch votes:', err);
  }
}

function init() {
  votes = KINGS.reduce((acc, k) => ({ ...acc, [k.id]: 0 }), {});

  // QR code pointing to voting URL
  const voteUrl = window.location.origin + '/';
  const qrImg = document.getElementById('qr-code');
  if (qrImg) {
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?' +
      new URLSearchParams({ size: '160x160', data: voteUrl }).toString();
  }

  fetchVotes();
  setInterval(fetchVotes, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
