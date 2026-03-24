// 五笔 98 字根打字游戏 - 游戏核心逻辑
// 功能：字根掉落、键盘输入判定、错误追踪、统计报告

// 默认配置参数
const defaultConfig = {
  duration: 180000,        // 游戏时长（毫秒）默认 3 分钟
  maxRadicals: 5,          // 最大同时掉落数
  fallSpeed: 2,            // 下落速度（像素/帧）
  spawnDelay: 1000,        // 新字根生成延迟（毫秒）
  radicalSize: { width: 60, height: 60 }  // 字根图片尺寸
};

// 当前游戏配置（从 defaultConfig 或 localStorage 加载）
let gameConfig = { ...defaultConfig };

// 游戏状态
const gameState = {
  isActive: false,
  isPaused: false,
  startTime: null,
  endTime: null,
  lastSpawnTime: null,
  animationFrameId: null,
  activeRadicals: [],      // 当前掉落的字根：{id, radical, x, y, element}
  correctCount: 0,
  errorCount: 0,
  errorLog: [],            // 错误记录：{type, radical, expectedKey, time}
  radicalIdCounter: 0
};

// 本地存储键名
const GAME_STORAGE_KEY = 'wubi98_game_stats';
const CONFIG_STORAGE_KEY = 'wubi98_game_config';

// 初始化：设置事件监听
function init() {
  loadConfig();
  setupEventListeners();
  showStartScreen();
}

// 加载配置
function loadConfig() {
  const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (saved) {
    try {
      const userConfig = JSON.parse(saved);
      gameConfig = { ...gameConfig, ...userConfig };
    } catch (e) {
      console.warn('加载配置失败', e);
    }
  }
}

// 保存配置
function saveConfig() {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(gameConfig));
}

// 从 UI 读取配置
function loadConfigFromUI() {
  const duration = parseInt(document.getElementById('configDuration')?.value) || 3;
  const maxRadicals = parseInt(document.getElementById('configMaxRadicals')?.value) || 5;
  const fallSpeed = parseInt(document.getElementById('configFallSpeed')?.value) || 2;
  const spawnDelay = parseInt(document.getElementById('configSpawnDelay')?.value) || 1000;
  
  gameConfig.duration = Math.min(30, Math.max(1, duration)) * 60000;
  gameConfig.maxRadicals = Math.min(10, Math.max(1, maxRadicals));
  gameConfig.fallSpeed = Math.min(10, Math.max(1, fallSpeed));
  gameConfig.spawnDelay = Math.min(5000, Math.max(500, spawnDelay));
}

// 更新 UI 显示配置
function updateConfigUI() {
  const durationEl = document.getElementById('configDuration');
  const maxRadicalsEl = document.getElementById('configMaxRadicals');
  const fallSpeedEl = document.getElementById('configFallSpeed');
  const spawnDelayEl = document.getElementById('configSpawnDelay');
  
  if (durationEl) durationEl.value = gameConfig.duration / 60000;
  if (maxRadicalsEl) maxRadicalsEl.value = gameConfig.maxRadicals;
  if (fallSpeedEl) fallSpeedEl.value = gameConfig.fallSpeed;
  if (spawnDelayEl) spawnDelayEl.value = gameConfig.spawnDelay;
}

// 重置为默认配置
function resetConfig() {
  gameConfig = { ...defaultConfig };
  saveConfig();
  updateConfigUI();
}

// 设置事件监听器
function setupEventListeners() {
  // 键盘输入监听
  document.addEventListener('keydown', handleKeyPress);
  
  // 按钮点击事件
  document.getElementById('startBtn')?.addEventListener('click', startGame);
  document.getElementById('startBtnLarge')?.addEventListener('click', () => {
    loadConfigFromUI();
    startGame();
  });
  document.getElementById('pauseBtn')?.addEventListener('click', togglePause);
  document.getElementById('quitBtn')?.addEventListener('click', quitGame);
  document.getElementById('restartBtn')?.addEventListener('click', restartGame);
  document.getElementById('backBtn')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  
  // 配置面板事件
  document.getElementById('resetConfigBtn')?.addEventListener('click', resetConfig);
}

// 显示开始屏幕
function showStartScreen() {
  const startScreen = document.getElementById('startScreen');
  const gameArea = document.getElementById('gameArea');
  const resultPanel = document.getElementById('resultPanel');
  
  if (startScreen) startScreen.classList.remove('hidden');
  if (gameArea) gameArea.innerHTML = '';
  if (resultPanel) resultPanel.classList.add('hidden');
  
  gameState.activeRadicals = [];
  gameState.correctCount = 0;
  gameState.errorCount = 0;
  gameState.errorLog = [];
  
  // 加载并显示配置
  updateConfigUI();
  updateStatsDisplay();
}

// 开始游戏
function startGame() {
  if (gameState.isActive) return;
  
  gameState.isActive = true;
  gameState.isPaused = false;
  gameState.startTime = Date.now();
  gameState.endTime = gameState.startTime + gameConfig.duration;
  gameState.lastSpawnTime = gameState.startTime;
  gameState.activeRadicals = [];
  gameState.correctCount = 0;
  gameState.errorCount = 0;
  gameState.errorLog = [];
  gameState.radicalIdCounter = 0;
  
  // 隐藏开始屏幕，显示游戏区域
  const startScreen = document.getElementById('startScreen');
  if (startScreen) startScreen.classList.add('hidden');
  
  // 更新按钮状态
  updateButtons();
  
  // 启动游戏循环
  gameLoop();
}

// 游戏主循环
function gameLoop() {
  if (!gameState.isActive || gameState.isPaused) {
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
    return;
  }
  
  const now = Date.now();
  
  // 检查时间是否结束
  if (now >= gameState.endTime) {
    endGame();
    return;
  }
  
  // 更新倒计时显示
  updateTimer();
  
  // 生成新字根
  if (now - gameState.lastSpawnTime >= gameConfig.spawnDelay) {
    if (gameState.activeRadicals.length < gameConfig.maxRadicals) {
      spawnRadical();
      gameState.lastSpawnTime = now;
    }
  }
  
  // 更新字根位置
  updateRadicalPositions();
  
  // 继续游戏循环
  gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

// 生成新字根
function spawnRadical() {
  const pool = radicals;
  if (pool.length === 0) return;
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  const radical = pool[randomIndex];
  
  const gameArea = document.getElementById('gameArea');
  if (!gameArea) return;
  
  const gameAreaRect = gameArea.getBoundingClientRect();
  const maxX = gameAreaRect.width - gameConfig.radicalSize.width;
  const x = Math.floor(Math.random() * maxX);
  
  // 创建字根元素
  const element = document.createElement('div');
  element.className = 'falling-radical';
  element.style.left = x + 'px';
  element.style.top = '0px';
  element.style.width = gameConfig.radicalSize.width + 'px';
  element.style.height = gameConfig.radicalSize.height + 'px';
  
  element.innerHTML = `
    <img src="${radical.image}" alt="${radical.name}" class="radical-img">
    <div class="key-hint">${radical.key.toUpperCase()}</div>
  `;
  
  // 添加图片加载失败处理
  const img = element.querySelector('img');
  img.onerror = function() {
    this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23eee%22 width=%2260%22 height=%2260%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2224%22>' + radical.name + '</text></svg>';
  };
  
  gameArea.appendChild(element);
  
  // 添加到活跃字根列表
  gameState.activeRadicals.push({
    id: ++gameState.radicalIdCounter,
    radical: radical,
    x: x,
    y: 0,
    element: element
  });
  
  updateActiveCount();
}

// 更新字根位置
function updateRadicalPositions() {
  const gameArea = document.getElementById('gameArea');
  if (!gameArea) return;
  
  const gameAreaRect = gameArea.getBoundingClientRect();
  const maxY = gameAreaRect.height - gameConfig.radicalSize.height;
  
  // 从后向前遍历，便于删除
  for (let i = gameState.activeRadicals.length - 1; i >= 0; i--) {
    const activeRadical = gameState.activeRadicals[i];
    activeRadical.y += gameConfig.fallSpeed;
    activeRadical.element.style.top = activeRadical.y + 'px';
    
    // 检查是否触底
    if (activeRadical.y >= maxY) {
      // 触底，记录错误
      recordError('missed', activeRadical.radical);
      
      // 添加触底效果
      activeRadical.element.classList.add('hit-bottom');
      
      // 延迟后移除
      setTimeout(() => {
        if (activeRadical.element.parentNode) {
          activeRadical.element.parentNode.removeChild(activeRadical.element);
        }
      }, 500);
      
      // 从活跃列表移除
      gameState.activeRadicals.splice(i, 1);
      updateActiveCount();
    }
  }
}

// 处理键盘输入
function handleKeyPress(e) {
  if (!gameState.isActive || gameState.isPaused) return;
  
  // 只处理字母键
  if (e.key.length !== 1 || !/[a-zA-Z]/.test(e.key)) return;
  
  const userInput = e.key.toLowerCase();
  checkInput(userInput);
}

// 检查输入
function checkInput(userInput) {
  // 查找匹配的字根
  const matchIndex = gameState.activeRadicals.findIndex(ar => 
    ar.radical.key.toLowerCase() === userInput
  );
  
  if (matchIndex !== -1) {
    // 正确输入
    const matched = gameState.activeRadicals[matchIndex];
    handleCorrectInput(matched);
  } else {
    // 错误输入
    handleWrongInput(userInput);
  }
}

// 处理正确输入
function handleCorrectInput(matchedRadical) {
  gameState.correctCount++;
  
  // 添加消除动画
  matchedRadical.element.classList.add('eliminated');
  
  // 延迟后移除元素
  setTimeout(() => {
    if (matchedRadical.element.parentNode) {
      matchedRadical.element.parentNode.removeChild(matchedRadical.element);
    }
  }, 300);
  
  // 从活跃列表移除
  gameState.activeRadicals.splice(gameState.activeRadicals.indexOf(matchedRadical), 1);
  updateActiveCount();
  updateStatsDisplay();
}

// 处理错误输入
function handleWrongInput(userInput) {
  gameState.errorCount++;
  
  // 记录错误
  recordError('wrong', null, userInput);
  updateStatsDisplay();
}

// 记录错误
function recordError(type, radical, userInput) {
  const error = {
    type: type,  // 'wrong' 或 'missed'
    radical: radical,
    expectedKey: radical ? radical.key : userInput,
    time: Date.now() - gameState.startTime
  };
  
  if (radical) {
    error.radicalName = radical.name;
    error.radicalKey = radical.key;
  }
  
  gameState.errorLog.push(error);
}

// 更新计时器显示
function updateTimer() {
  const timerEl = document.getElementById('timer');
  if (!timerEl || !gameState.endTime) return;
  
  const remaining = Math.max(0, gameState.endTime - Date.now());
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  
  timerEl.textContent = 
    String(minutes).padStart(2, '0') + ':' + 
    String(seconds).padStart(2, '0');
  
  // 最后 30 秒显示红色
  if (remaining < 30000) {
    timerEl.style.color = '#e53e3e';
  } else {
    timerEl.style.color = '';
  }
}

// 更新统计显示
function updateStatsDisplay() {
  const correctEl = document.getElementById('correctCount');
  const errorEl = document.getElementById('errorCount');
  
  if (correctEl) correctEl.textContent = gameState.correctCount;
  if (errorEl) errorEl.textContent = gameState.errorCount;
}

// 更新活跃字根数显示
function updateActiveCount() {
  const activeEl = document.getElementById('activeCount');
  if (activeEl) {
    activeEl.textContent = gameState.activeRadicals.length + '/' + gameConfig.maxRadicals;
  }
}

// 更新按钮状态
function updateButtons() {
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) {
    pauseBtn.disabled = !gameState.isActive;
    pauseBtn.textContent = gameState.isPaused ? '继续' : '暂停';
  }
}

// 切换暂停状态
function togglePause() {
  if (!gameState.isActive) return;
  
  gameState.isPaused = !gameState.isPaused;
  updateButtons();
  
  const gameArea = document.getElementById('gameArea');
  if (!gameArea) return;
  
  if (gameState.isPaused) {
    // 显示暂停遮罩
    const pauseOverlay = document.createElement('div');
    pauseOverlay.className = 'pause-overlay';
    pauseOverlay.id = 'pauseOverlay';
    pauseOverlay.innerHTML = `
      <h3>已暂停</h3>
      <p>点击"继续"恢复游戏</p>
    `;
    gameArea.appendChild(pauseOverlay);
  } else {
    // 移除暂停遮罩
    const pauseOverlay = document.getElementById('pauseOverlay');
    if (pauseOverlay) {
      pauseOverlay.parentNode.removeChild(pauseOverlay);
    }
  }
}

// 结束游戏
function endGame() {
  gameState.isActive = false;
  gameState.isPaused = false;
  gameState.endTime = Date.now();
  
  // 取消动画循环
  if (gameState.animationFrameId) {
    cancelAnimationFrame(gameState.animationFrameId);
  }
  
  // 清除所有活跃字根
  gameState.activeRadicals.forEach(ar => {
    if (ar.element.parentNode) {
      ar.element.parentNode.removeChild(ar.element);
    }
  });
  gameState.activeRadicals = [];
  
  // 显示结果面板
  showResultPanel();
  
  // 保存统计数据
  saveGameStats();
  
  // 更新按钮状态
  updateButtons();
}

// 显示结果面板
function showResultPanel() {
  const resultPanel = document.getElementById('resultPanel');
  if (!resultPanel) return;
  
  // 计算正确率
  const total = gameState.correctCount + gameState.errorCount;
  const accuracy = total > 0 ? ((gameState.correctCount / total) * 100).toFixed(1) : 0;
  
  // 计算评分
  const grade = calculateGrade(parseFloat(accuracy));
  
  // 更新结果统计
  document.getElementById('resultAccuracy').textContent = accuracy + '%';
  document.getElementById('resultGrade').textContent = grade;
  document.getElementById('resultCorrect').textContent = gameState.correctCount;
  document.getElementById('resultErrors').textContent = gameState.errorCount;
  
  // 显示错误列表
  displayErrorList();
  
  // 显示最常错字根
  displayTopErrorRadicals();
  
  // 显示结果面板
  resultPanel.classList.remove('hidden');
}

// 计算评分
function calculateGrade(accuracy) {
  if (accuracy >= 90) return 'A';
  if (accuracy >= 80) return 'B';
  if (accuracy >= 70) return 'C';
  if (accuracy >= 60) return 'D';
  return 'F';
}

// 显示错误列表
function displayErrorList() {
  const container = document.getElementById('errorList');
  if (!container) return;
  
  if (gameState.errorLog.length === 0) {
    container.innerHTML = '<p class="empty">暂无错误 🎉</p>';
    return;
  }
  
  const errors = gameState.errorLog.slice(0, 20); // 最多显示 20 条
  
  container.innerHTML = errors.map(error => {
    const timeStr = formatTime(error.time);
    const typeText = error.type === 'missed' ? '漏掉' : '拼错';
    const radicalName = error.radicalName || '-';
    const key = (error.radicalKey || error.expectedKey || '').toUpperCase();
    
    return `
      <div class="error-item">
        <span class="error-type ${error.type}">${typeText}</span>
        <span class="key-badge">${key}</span>
        <span class="radical-name">${radicalName}</span>
        <span class="error-time">${timeStr}</span>
      </div>
    `;
  }).join('');
}

// 显示最常错字根
function displayTopErrorRadicals() {
  const container = document.getElementById('topErrorRadicals');
  if (!container) return;
  
  // 统计每个字根的错误次数
  const errorCount = {};
  gameState.errorLog.forEach(error => {
    if (error.radicalKey) {
      if (!errorCount[error.radicalKey]) {
        errorCount[error.radicalKey] = {
          key: error.radicalKey,
          name: error.radicalName,
          count: 0
        };
      }
      errorCount[error.radicalKey].count++;
    }
  });
  
  const errorList = Object.values(errorCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  
  if (errorList.length === 0) {
    container.innerHTML = '<p class="empty">暂无数据</p>';
    return;
  }
  
  container.innerHTML = errorList.map(item => `
    <div class="error-item">
      <span class="key-badge">${item.key.toUpperCase()}</span>
      <span class="radical-name">${item.name}</span>
      <span class="error-count">错误 ${item.count} 次</span>
    </div>
  `).join('');
}

// 格式化时间显示
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

// 保存游戏统计数据
function saveGameStats() {
  const session = {
    date: new Date().toISOString(),
    duration: gameConfig.duration,
    correctCount: gameState.correctCount,
    errorCount: gameState.errorCount,
    errorLog: gameState.errorLog
  };
  
  // 保存到 localStorage
  const saved = localStorage.getItem(GAME_STORAGE_KEY);
  let history = [];
  
  if (saved) {
    try {
      history = JSON.parse(saved);
    } catch (e) {
      history = [];
    }
  }
  
  history.push(session);
  
  // 只保留最近 100 局
  if (history.length > 100) {
    history = history.slice(-100);
  }
  
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(history));
}

// 退出游戏
function quitGame() {
  if (!gameState.isActive && !gameState.isPaused) {
    // 未开始状态，返回首页
    window.location.href = 'index.html';
    return;
  }
  
  if (confirm('确定要退出游戏吗？当前进度将不会保存。')) {
    gameState.isActive = false;
    gameState.isPaused = false;
    
    if (gameState.animationFrameId) {
      cancelAnimationFrame(gameState.animationFrameId);
    }
    
    // 清除所有活跃字根
    gameState.activeRadicals.forEach(ar => {
      if (ar.element.parentNode) {
        ar.element.parentNode.removeChild(ar.element);
      }
    });
    gameState.activeRadicals = [];
    
    showStartScreen();
    updateButtons();
  }
}

// 重新开始游戏
function restartGame() {
  showStartScreen();
  updateButtons();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
