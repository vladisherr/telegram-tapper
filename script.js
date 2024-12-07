// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Конфигурация игры
const CONFIG = {
    TOTAL_POOL: 10000,
    INITIAL_MINING_POWER: 0.0001,
    UPDATE_INTERVAL: 1000,
    MINERS: [
        { id: 1, name: "Базовый майнер", basePower: 0.0001, basePrice: 10 },
        { id: 2, name: "Продвинутый майнер", basePower: 0.0005, basePrice: 50 },
        { id: 3, name: "Супер майнер", basePower: 0.002, basePrice: 200 },
        { id: 4, name: "Мега майнер", basePower: 0.01, basePrice: 1000 }
    ]
};

// Состояние игры
const gameState = {
    userBalance: 0,
    miningPower: CONFIG.INITIAL_MINING_POWER,
    miners: {},
    totalMined: 0,
    lastUpdate: Date.now()
};

// Инициализация майнеров
function initializeMiners() {
    const minersGrid = document.querySelector('.miners-grid');
    CONFIG.MINERS.forEach(miner => {
        gameState.miners[miner.id] = { count: 0, level: 1 };
        
        const minerCard = document.createElement('div');
        minerCard.className = 'miner-card';
        minerCard.innerHTML = `
            <h3>${miner.name}</h3>
            <p>Мощность: ${miner.basePower} USDT/с</p>
            <p>Количество: <span id="miner-${miner.id}-count">0</span></p>
            <p>Уровень: <span id="miner-${miner.id}-level">1</span></p>
            <button onclick="buyMiner(${miner.id})">Купить (${miner.basePrice} USDT)</button>
            <button onclick="upgradeMiner(${miner.id})">Улучшить</button>
        `;
        minersGrid.appendChild(minerCard);
    });
}

// Функция покупки майнера
function buyMiner(minerId) {
    const miner = CONFIG.MINERS.find(m => m.id === minerId);
    const price = miner.basePrice * (gameState.miners[minerId].count + 1);
    
    if (gameState.userBalance >= price) {
        gameState.userBalance -= price;
        gameState.miners[minerId].count++;
        gameState.miningPower += miner.basePower * gameState.miners[minerId].level;
        updateUI();
    } else {
        alert('Недостаточно средств!');
    }
}

// Функция улучшения майнера
function upgradeMiner(minerId) {
    const upgradePrice = CONFIG.MINERS.find(m => m.id === minerId).basePrice * 
                        gameState.miners[minerId].level * 2;
    
    if (gameState.userBalance >= upgradePrice) {
        gameState.userBalance -= upgradePrice;
        gameState.miners[minerId].level++;
        updateMiningPower();
        updateUI();
    } else {
        alert('Недостаточно средств для улучшения!');
    }
}

// Обновление мощности майнинга
function updateMiningPower() {
    gameState.miningPower = CONFIG.MINERS.reduce((power, miner) => {
        const minerState = gameState.miners[miner.id];
        return power + (miner.basePower * minerState.count * minerState.level);
    }, CONFIG.INITIAL_MINING_POWER);
}

// Обновление интерфейса
function updateUI() {
    document.querySelector('.balance-amount').textContent = 
        `${gameState.userBalance.toFixed(4)} USDT`;
    document.querySelector('.power-amount').textContent = 
        `${gameState.miningPower.toFixed(4)} USDT/с`;
    document.querySelector('.total-mined').textContent = 
        `Всего намайнено: ${gameState.totalMined.toFixed(4)} USDT`;
    
    // Обновление счетчиков майнеров
    Object.keys(gameState.miners).forEach(minerId => {
        document.getElementById(`miner-${minerId}-count`).textContent = 
            gameState.miners[minerId].count;
        document.getElementById(`miner-${minerId}-level`).textContent = 
            gameState.miners[minerId].level;
    });
}

// Основной игровой цикл
function gameLoop() {
    const now = Date.now();
    const delta = (now - gameState.lastUpdate) / 1000;
    
    const mined = gameState.miningPower * delta;
    gameState.userBalance += mined;
    gameState.totalMined += mined;
    
    gameState.lastUpdate = now;
    updateUI();
}

// Инициализация игры
function initGame() {
    initializeMiners();
    setInterval(gameLoop, CONFIG.UPDATE_INTERVAL);
    updateUI();
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);
