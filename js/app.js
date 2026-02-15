/**
 * Miradas! Lac Banquet — Voting App
 * Handles name entry, King selection, localStorage, and screen transitions.
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

const STORAGE_KEY = 'miradas_vote';

function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStored(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage write failed', e);
  }
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add('active');
}

function renderKingCard(king, options = {}) {
  const { selected = false, clickable = true, showVotes = false, votes = 0, percent = 0 } = options;
  const suitClass = king.isRed ? 'suit-red' : '';
  const card = document.createElement('div');
  card.className = `king-card${selected ? ' selected' : ''}`;
  card.dataset.kingId = king.id;
  if (clickable) card.setAttribute('role', 'button');
  if (clickable) card.setAttribute('tabindex', '0');

  card.innerHTML = `
    <span class="king-card__corner king-card__corner--tl ${suitClass}">K ${king.suit}</span>
    <span class="king-card__corner king-card__corner--br ${suitClass}">K ${king.suit}</span>
    <span class="king-card__crown ${suitClass}">♛</span>
    <span class="king-card__suit ${suitClass}">${king.suit}</span>
    <span class="king-card__name">${king.name}</span>
    ${showVotes ? `
      <span class="king-card__votes">${votes} vote${votes !== 1 ? 's' : ''} (${percent}%)</span>
      <div class="king-card__bar"><div class="king-card__bar-fill" style="width: ${percent}%"></div></div>
    ` : ''}
  `;

  return card;
}

function init() {
  const formName = document.getElementById('form-name');
  const inputName = document.getElementById('input-name');
  const kingGrid = document.getElementById('king-grid');
  const btnBet = document.getElementById('btn-bet');
  const btnChange = document.getElementById('btn-change');
  const confirmationText = document.getElementById('confirmation-text');
  const confirmationName = document.getElementById('confirmation-name');
  const confirmationCard = document.getElementById('confirmation-card');
  const confirmationLabel = document.getElementById('confirmation-label');

  let selectedKingId = null;

  // Populate King grid (needed for screen 2 and when changing prediction)
  KINGS.forEach((king) => {
    const card = renderKingCard(king, { clickable: true });
    card.addEventListener('click', () => selectKing(king.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectKing(king.id);
      }
    });
    kingGrid.appendChild(card);
  });

  function selectKing(id) {
    selectedKingId = selectedKingId === id ? null : id;
    updateSelection();
  }

  function updateSelection() {
    kingGrid.querySelectorAll('.king-card').forEach((el) => {
      const id = el.dataset.kingId;
      el.classList.toggle('selected', id === selectedKingId);
    });
    btnBet.disabled = !selectedKingId;
  }

  // Restore from localStorage
  const stored = getStored();
  if (stored?.name) {
    inputName.value = stored.name;
  }
  if (stored?.kingId) {
    const king = KINGS.find((k) => k.id === stored.kingId);
    if (king) {
      showScreen('screen-confirmation');
      selectedKingId = king.id;
      confirmationName.textContent = stored.name;
      confirmationText.innerHTML = `Your prediction, <span id="confirmation-name">${stored.name}</span>:`;
      confirmationLabel.textContent = `King ${king.name} ${king.suit}`;
      confirmationCard.innerHTML = '';
      confirmationCard.appendChild(renderKingCard(king, { selected: true, clickable: false }));
    }
  }

  // Screen 1: Name entry
  formName.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = inputName.value.trim();
    if (!name) return;
    setStored({ name, kingId: null });
    showScreen('screen-selection');
    selectedKingId = null;
    updateSelection();
  });

  // Screen 2: Bet
  btnBet.addEventListener('click', () => {
    if (!selectedKingId) return;
    const king = KINGS.find((k) => k.id === selectedKingId);
    const name = getStored()?.name || inputName.value.trim() || 'Guest';
    setStored({ name, kingId: selectedKingId });
    confirmationName.textContent = name;
    confirmationText.innerHTML = `Your prediction, <span id="confirmation-name">${name}</span>:`;
    confirmationLabel.textContent = `King ${king.name} ${king.suit}`;
    confirmationCard.innerHTML = '';
    confirmationCard.appendChild(renderKingCard(king, { selected: true, clickable: false }));
    showScreen('screen-confirmation');
  });

  // Screen 3: Change prediction
  btnChange.addEventListener('click', () => {
    showScreen('screen-selection');
    selectedKingId = getStored()?.kingId || null;
    updateSelection();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
