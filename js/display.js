/**
 * Miradas! Lac Banquet — Display Page
 * Simulated real-time vote counts for demo (no backend).
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

// Simulated vote counts — randomly incremented
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

function simulateVote() {
  // Randomly increment a King's votes
  const idx = Math.floor(Math.random() * KINGS.length);
  votes[KINGS[idx].id]++;
  updateDisplay();
}

function init() {
  // Initial render with some seed votes for demo
  votes = KINGS.reduce((acc, k) => ({ ...acc, [k.id]: 0 }), {});
  votes['historian'] = 1;
  votes['voice'] = 1;

  updateDisplay();

  // Simulate new votes every 3–6 seconds
  function scheduleNext() {
    const delay = 3000 + Math.random() * 3000;
    setTimeout(() => {
      simulateVote();
      scheduleNext();
    }, delay);
  }
  scheduleNext();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
