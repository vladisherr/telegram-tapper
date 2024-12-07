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
    lastUpdate: Date.now(),
    achievements: {},
    lastCoinAnimation: Date.now()
};

// Достижения
const ACHIEVEMENTS = [
    {
        id: 'first_miner',
        name: 'Первый майнер',
        description: 'Купите вашего первого майнера',
        icon: '🎮',
        condition: (state) => Object.values(state.miners).some(m => m.count > 0)
    },
    {
        id: 'speed_demon',
        name: 'Скоростной демон',
        description: 'Достигните скорости майнинга 0.1 USDT/с',
        icon: '⚡',
        condition: (state) => state.miningPower >= 0.1
    },
    {
        id: 'millionaire',
        name: 'Миллионер',
        description: 'Намайните 1000 USDT',
        icon: '💰',
        condition: (state) => state.totalMined >= 1000
    }
];

ACHIEVEMENTS.forEach(a => {
    gameState.achievements[a.id] = false;
});

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

// Функция создания анимации монетки
function createCoinAnimation() {
    const container = document.querySelector('.coin-container');
    const coin = document.createElement('div');
    coin.className = 'coin';
    
    // Рандомная позиция по X
    const randomX = Math.random() * (container.offsetWidth - 40);
    coin.style.left = `${randomX}px`;
    
    container.appendChild(coin);
    
    // Удаляем монетку после анимации
    setTimeout(() => {
        coin.remove();
    }, 3000);
}

// Обновление прогресс-бара
function updateProgressBar() {
    const progress = document.getElementById('mining-progress');
    const maxPower = 0.1; // Максимальная мощность для полной шкалы
    const percentage = (gameState.miningPower / maxPower) * 100;
    progress.style.width = `${Math.min(percentage, 100)}%`;
}

// Проверка достижений
function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (!gameState.achievements[achievement.id] && achievement.condition(gameState)) {
            gameState.achievements[achievement.id] = true;
            showAchievementNotification(achievement);
            updateAchievementsDisplay();
        }
    });
}

// Показ уведомления о достижении
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Обновление отображения достижений
function updateAchievementsDisplay() {
    const container = document.getElementById('achievements-list');
    container.innerHTML = '';
    
    ACHIEVEMENTS.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${gameState.achievements[achievement.id] ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
        `;
        container.appendChild(card);
    });
}

// Основной игровой цикл
function gameLoop() {
    const now = Date.now();
    const delta = (now - gameState.lastUpdate) / 1000;
    
    const mined = gameState.miningPower * delta;
    gameState.userBalance += mined;
    gameState.totalMined += mined;
    
    // Создаем анимацию монетки каждые 3 секунды
    if (now - gameState.lastCoinAnimation > 3000) {
        createCoinAnimation();
        gameState.lastCoinAnimation = now;
    }
    
    gameState.lastUpdate = now;
    
    updateUI();
    updateProgressBar();
    checkAchievements();
}

// Инициализация игры
function initGame() {
    initializeMiners();
    updateAchievementsDisplay();
    gameState.lastCoinAnimation = Date.now();
    setInterval(gameLoop, CONFIG.UPDATE_INTERVAL);
    updateUI();
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);
