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

function getEliminatedIds() {
  // Sort kings by vote count ascending
  const sorted = KINGS.map(king => ({ id: king.id, votes: votes[king.id] }))
    .sort((a, b) => a.votes - b.votes);
  
  const eliminated = [];
  let i = 0;
  while (i < 4 && i < sorted.length) {
    eliminated.push(sorted[i].id);
    i++;
  }
  // Include ties: if the next has the same votes as the last included, include it
  while (i < sorted.length && sorted[i].votes === sorted[i-1].votes) {
    eliminated.push(sorted[i].id);
    i++;
  }
  return eliminated;
}

function renderCard(king, voteCount, percent, isLeading, isEliminated) {
  const suitClass = king.isRed ? 'suit-red' : '';
  const card = document.createElement('div');
  card.className = `king-card${isLeading ? ' leading' : ''}${isEliminated ? ' eliminated' : ''}`;
  card.dataset.kingId = king.id;

  card.innerHTML = `
    <div class="king-card__inner">
      <div class="king-card__front">
        <span class="king-card__corner king-card__corner--tl ${suitClass}">K ${king.suit}</span>
        <span class="king-card__corner king-card__corner--br ${suitClass}">K ${king.suit}</span>
        <span class="king-card__crown ${suitClass}">♛</span>
        <span class="king-card__suit ${suitClass}">${king.suit}</span>
        <span class="king-card__name">${king.name}</span>
      </div>
      <div class="king-card__back">
        <span class="king-card__corner king-card__corner--tl ${suitClass}">K ${king.suit}</span>
        <span class="king-card__corner king-card__corner--br ${suitClass}">K ${king.suit}</span>
        <span class="king-card__crown ${suitClass}">♛</span>
        <span class="king-card__suit ${suitClass}">${king.suit}</span>
        <span class="king-card__name">${king.name}</span>
        <span class="king-card__votes">${voteCount} vote${voteCount !== 1 ? 's' : ''} (${percent}%)</span>
        <div class="king-card__bar"><div class="king-card__bar-fill" style="width: ${percent}%"></div></div>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });

  return card;
}

function updateDisplay() {
  const total = getTotalVotes();
  const leadingIds = getLeadingIds();
  const eliminatedIds = getEliminatedIds();

  document.getElementById('prediction-count').textContent = total;

  const totalPct = total || 1;

  if (cardElements.length === 0) {
    const grid = document.getElementById('king-grid');
    grid.innerHTML = '';
    KINGS.forEach((king) => {
      const v = votes[king.id];
      const percent = Math.round((v / totalPct) * 100);
      const isLeading = leadingIds.includes(king.id) && v > 0;
      const isEliminated = eliminatedIds.includes(king.id);
      const card = renderCard(king, v, percent, isLeading, isEliminated);
      cardElements.push({ el: card, king });
      grid.appendChild(card);
    });
  } else {
    cardElements.forEach(({ el, king }) => {
      const v = votes[king.id];
      const percent = Math.round((v / totalPct) * 100);
      const isLeading = leadingIds.includes(king.id) && v > 0;
      const isEliminated = eliminatedIds.includes(king.id);
      el.classList.toggle('leading', isLeading);
      el.classList.toggle('eliminated', isEliminated);
      const back = el.querySelector('.king-card__back');
      if (back) {
        back.querySelector('.king-card__votes').textContent =
          `${v} vote${v !== 1 ? 's' : ''} (${percent}%)`;
        back.querySelector('.king-card__bar-fill').style.width = `${percent}%`;
      }
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
