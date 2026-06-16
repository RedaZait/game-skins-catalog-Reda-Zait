const skinsList = document.querySelector('#skins-list');
const playerForm = document.querySelector('#player-form');
const playerSelect = document.querySelector('#player-select');
const message = document.querySelector('#message');
const wealthTable = document.querySelector('#wealth-table');
const refreshWealthButton = document.querySelector('#refresh-wealth');
const refreshShopButton = document.querySelector('#refresh-shop');
const selectedPlayerCard = document.querySelector('#selected-player-card');

const statSkins = document.querySelector('#stat-skins');
const statPlayers = document.querySelector('#stat-players');
const statRichest = document.querySelector('#stat-richest');

let skins = [];
let players = [];
let rankingCache = [];

const skinVisuals = {
  'Dragon Rouge': {
    image: '/assets/skins/dragon-lore.jpg',
    icon: '🐉',
    description: 'Un skin légendaire inspiré d’un dragon rouge, parfait pour dominer le shop.'
  },
  'Samouraï Cyber': {
    image: '/assets/skins/samourai-cyber.jpg',
    icon: '⚔️',
    description: 'Un skin cybernétique au style samouraï futuriste.'
  },
  'Fantôme Bleu': {
    image: '/assets/skins/fantome-bleu.jpg',
    icon: '👻',
    description: 'Un skin rare à l’ambiance froide et spectrale.'
  },
  'Soldat Basique': {
    image: '/assets/skins/soldat-basique.jpg',
    icon: '🪖',
    description: 'Un skin commun simple, efficace et accessible.'
  },
  'Néon Vortex': {
    image: '/assets/skins/neon-vortex.jpg',
    icon: '🌀',
    description: 'Un skin épique au rendu néon et dynamique.'
  },
  'Ombre Royale': {
    image: '/assets/skins/ombre-royale.jpg',
    icon: '👑',
    description: 'Un skin légendaire sombre, luxueux et imposant.'
  }
};

function formatCredits(value) {
  return `${Number(value || 0).toFixed(0)} crédits`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeRarity(rarete) {
  const value = String(rarete).toLowerCase();
  if (value === 'rare') return 'rare';
  if (value === 'epique') return 'epique';
  if (value === 'legendaire') return 'legendaire';
  return 'commun';
}

function getRarityLabel(rarete) {
  return rarete;
}

function getRarityClass(rarete) {
  return `rarity-${normalizeRarity(rarete)}`;
}

function getFallbackGradient(rarete) {
  const rarity = normalizeRarity(rarete);

  if (rarity === 'rare') {
    return 'linear-gradient(135deg, #1d4ed8, #60a5fa)';
  }

  if (rarity === 'epique') {
    return 'linear-gradient(135deg, #6d28d9, #c084fc)';
  }

  if (rarity === 'legendaire') {
    return 'linear-gradient(135deg, #d97706, #fbbf24)';
  }

  return 'linear-gradient(135deg, #374151, #9ca3af)';
}

function showMessage(text, type = 'success') {
  message.textContent = text;
  message.className = `message ${type}`;
}

async function requestJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    const details = data.errors?.map((err) => `${err.field}: ${err.message}`).join(' | ');
    throw new Error(details || data.message || 'Erreur API');
  }

  return data;
}

async function loadSkins() {
  skins = await requestJSON('/api/skins');
  renderSkins();
  updateStats();
}

async function loadPlayers() {
  players = await requestJSON('/api/players');
  renderPlayers();
  renderSelectedPlayer();
  updateStats();
}

async function loadWealth() {
  rankingCache = await requestJSON('/api/analytics/wealth');
  renderWealth(rankingCache);
  updateStats();
}

function updateStats() {
  statSkins.textContent = skins.length;
  statPlayers.textContent = players.length;

  if (rankingCache.length > 0) {
    statRichest.textContent = formatCredits(rankingCache[0].fortuneTotale);
  } else {
    statRichest.textContent = '0 crédits';
  }
}

function getSelectedPlayer() {
  return players.find((player) => player._id === playerSelect.value);
}

function renderPlayers() {
  const selectedValue = playerSelect.value;

  playerSelect.innerHTML = '<option value="">Aucun joueur</option>';

  players.forEach((player) => {
    const option = document.createElement('option');
    option.value = player._id;
    option.textContent = `${player.pseudo} — ${formatCredits(player.solde)}`;
    playerSelect.appendChild(option);
  });

  if (players.some((player) => player._id === selectedValue)) {
    playerSelect.value = selectedValue;
  }
}

function renderSelectedPlayer() {
  const player = getSelectedPlayer();

  if (!player) {
    selectedPlayerCard.className = 'selected-player-card empty';
    selectedPlayerCard.innerHTML = '<p>Aucun joueur sélectionné.</p>';
    return;
  }

  const inventory = Array.isArray(player.inventory) ? player.inventory : [];

  const inventoryHtml = inventory.length > 0
    ? inventory.map((item) => {
        const skin = item.skin;
        const date = item.obtainedAt
          ? new Date(item.obtainedAt).toLocaleDateString('fr-FR')
          : 'date inconnue';

        return `
          <div class="inventory-item">
            <div>
              <strong>${escapeHtml(skin?.nom || 'Skin inconnu')}</strong>
              <small>${escapeHtml(skin?.rarete || 'Rareté inconnue')} • obtenu le ${date}</small>
            </div>
            <span>${formatCredits(skin?.prix || 0)}</span>
          </div>
        `;
      }).join('')
    : '<p class="empty-inventory">Aucun skin acheté pour le moment.</p>';

  selectedPlayerCard.className = 'selected-player-card';
  selectedPlayerCard.innerHTML = `
    <h3>${escapeHtml(player.pseudo)}</h3>
    <p>Profil joueur et inventaire actuel.</p>

    <div class="player-meta">
      <span class="meta-chip">💰 Solde : ${formatCredits(player.solde)}</span>
      <span class="meta-chip">🎒 Skins possédés : ${inventory.length}</span>
    </div>

    <div class="inventory-section">
      <h4>Inventaire du joueur</h4>
      <div class="inventory-list">
        ${inventoryHtml}
      </div>
    </div>
  `;
}

function renderSkins() {
  skinsList.innerHTML = '';

  skins.forEach((skin) => {
    const visual = skinVisuals[skin.nom] || {};
    const card = document.createElement('article');
    card.className = 'skin-card';

    const buttonDisabled = !playerSelect.value;
    const bgStyle = getFallbackGradient(skin.rarete);

    card.innerHTML = `
      <div class="skin-image" style="background:${bgStyle}">
        ${
          visual.image
            ? `<img src="${visual.image}" alt="${escapeHtml(skin.nom)}" onerror="this.remove()">`
            : ''
        }
        <div class="overlay"></div>
        <div class="placeholder-icon">${visual.icon || '🎮'}</div>
      </div>

      <div class="skin-body">
        <div class="skin-topline">
          <h3 class="skin-title">${escapeHtml(skin.nom)}</h3>
          <span class="rarity-badge ${getRarityClass(skin.rarete)}">${escapeHtml(getRarityLabel(skin.rarete))}</span>
        </div>

        <p class="skin-description">
          ${escapeHtml(visual.description || 'Skin disponible dans le catalogue du jeu.')}
        </p>

        <div class="skin-footer">
          <span class="skin-price">${formatCredits(skin.prix)}</span>
          <button class="btn btn-primary buy-btn" data-skin-id="${skin._id}" ${buttonDisabled ? 'disabled' : ''}>
            Acheter
          </button>
        </div>
      </div>
    `;

    card.querySelector('.buy-btn').addEventListener('click', () => buySkin(skin._id));
    skinsList.appendChild(card);
  });
}

function renderWealth(ranking) {
  wealthTable.innerHTML = '';

  ranking.forEach((player, index) => {
    const row = document.createElement('tr');
    if (index === 0) row.classList.add('top-1');
    if (index === 1) row.classList.add('top-2');
    if (index === 2) row.classList.add('top-3');

    row.innerHTML = `
      <td><span class="rank-badge">${index + 1}</span></td>
      <td>${escapeHtml(player.pseudo)}</td>
      <td>${formatCredits(player.solde)}</td>
      <td>${formatCredits(player.valeurInventaire)}</td>
      <td>${player.nombreSkins}</td>
      <td><strong>${formatCredits(player.fortuneTotale)}</strong></td>
    `;

    wealthTable.appendChild(row);
  });

  if (ranking.length === 0) {
    wealthTable.innerHTML = `
      <tr>
        <td colspan="6">Aucune donnée disponible pour le moment.</td>
      </tr>
    `;
  }
}

async function buySkin(skinId) {
  const playerId = playerSelect.value;

  if (!playerId) {
    showMessage('Sélectionne un joueur avant d’acheter un skin.', 'error');
    return;
  }

  try {
    const result = await requestJSON(`/api/players/${playerId}/buy`, {
      method: 'POST',
      body: JSON.stringify({ skinId })
    });

    showMessage(result.message, 'success');
    await Promise.all([loadPlayers(), loadWealth()]);
    renderSkins();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

playerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const pseudo = document.querySelector('#pseudo').value;
  const solde = Number(document.querySelector('#solde').value);

  try {
    const player = await requestJSON('/api/players', {
      method: 'POST',
      body: JSON.stringify({ pseudo, solde })
    });

    showMessage(`Joueur ${player.pseudo} créé.`, 'success');
    playerForm.reset();

    await Promise.all([loadPlayers(), loadWealth()]);
    playerSelect.value = player._id;
    renderSelectedPlayer();
    renderSkins();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

playerSelect.addEventListener('change', () => {
  renderSelectedPlayer();
  renderSkins();
});

refreshWealthButton.addEventListener('click', loadWealth);
refreshShopButton.addEventListener('click', async () => {
  await Promise.all([loadSkins(), loadPlayers()]);
  showMessage('Boutique actualisée.', 'success');
});

async function init() {
  try {
    await Promise.all([loadSkins(), loadPlayers(), loadWealth()]);
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

init();