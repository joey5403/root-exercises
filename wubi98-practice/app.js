// 五笔 98 字根练习工具 - 核心逻辑
// 功能：随机练习、错题复习、统计追踪、本地存储

// 本地存储键名
const STORAGE_KEY = 'wubi98_stats';

// 应用状态
const state = {
  currentRadical: null,      // 当前字根
  mode: 'all',               // 练习模式：'all' 全部 / 'wrong' 错题
  category: 'all',           // 分类筛选：'all' 或具体分类名
  isPaused: false,           // 暂停状态
  stats: {},                 // 统计数据
  sessionStart: null         // 会话开始时间
};

// 初始化：加载数据、设置事件监听、更新 UI
function init() {
  loadStats();
  setupEventListeners();
  updateStatsDisplay();
  showStartScreen();
}

// 加载统计数据（从 localStorage）
function loadStats() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state.stats = JSON.parse(saved);
    } catch (e) {
      state.stats = {};
    }
  }
  
  // 初始化所有字根的统计数据
  radicals.forEach(radical => {
    const key = radical.key;
    if (!state.stats[key]) {
      state.stats[key] = { errors: 0, correct: 0, lastPracticed: null };
    }
  });
}

// 保存统计数据（到 localStorage）
function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.stats));
}

// 设置事件监听器
function setupEventListeners() {
  // 键盘输入监听
  document.addEventListener('keydown', handleKeyPress);
  
  // 按钮点击事件
  document.getElementById('startBtn')?.addEventListener('click', startPractice);
  document.getElementById('pauseBtn')?.addEventListener('click', togglePause);
  document.getElementById('modeToggle')?.addEventListener('click', toggleMode);
  document.getElementById('statsBtn')?.addEventListener('click', toggleStatsPanel);
  document.getElementById('resetStats')?.addEventListener('click', resetStats);
  
  // 分类选择下拉框
  document.getElementById('categorySelect')?.addEventListener('change', (e) => {
    state.category = e.target.value;
    state.currentRadical = null;
    showStartScreen();
  });
}

// 显示开始屏幕
function showStartScreen() {
  const container = document.getElementById('practiceArea');
  if (container) {
    container.innerHTML = `
      <div class="start-screen">
        <h2>五笔 98 字根练习</h2>
        <p>按键盘输入字根对应的键位</p>
        <button id="startBtn" class="btn btn-primary">开始练习</button>
      </div>
    `;
    document.getElementById('startBtn')?.addEventListener('click', startPractice);
  }
}

// 开始练习
function startPractice() {
  state.sessionStart = Date.now();
  state.isPaused = false;
  nextQuestion();
  updatePauseButton();
}

// 下一题：随机选择并显示字根
function nextQuestion() {
  if (state.isPaused) return;
  
  const pool = getQuestionPool();
  if (pool.length === 0) {
    showNoQuestionsMessage();
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  state.currentRadical = pool[randomIndex];
  
  displayQuestion(state.currentRadical);
}

// 获取题目池（根据分类和模式筛选）
function getQuestionPool() {
  let pool = radicals;
  
  // 按分类筛选
  if (state.category !== 'all') {
    pool = radicals.filter(r => r.category === state.category);
  }
  
  if (state.mode === 'wrong') {
    // 错题模式：只显示错误次数>0 的字根
    const wrongRadicals = pool.filter(r => {
      const stats = state.stats[r.key];
      return stats && stats.errors > 0;
    });
    return wrongRadicals.length > 0 ? wrongRadicals : pool;
  }
  return pool;
}

// 显示题目（字根图片）
function displayQuestion(radical) {
  const container = document.getElementById('practiceArea');
  if (!container) return;
  
  container.innerHTML = `
    <div class="question">
      <div class="radical-image">
        <img src="${radical.image}" alt="${radical.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23eee%22 width=%22200%22 height=%22200%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22>图片加载失败</text></svg>'">
      </div>
      <div class="feedback" id="feedback"></div>
      <div class="hint">提示：${radical.category}</div>
    </div>
  `;
}

// 处理键盘输入（监听字母键）
function handleKeyPress(e) {
  // 如果未开始练习或暂停中，忽略输入
  if (!state.currentRadical || state.isPaused) return;
  
  // 只处理字母键
  if (e.key.length !== 1 || !/[a-zA-Z]/.test(e.key)) return;
  
  const userInput = e.key.toLowerCase();
  const correctKey = state.currentRadical.key;
  
  checkAnswer(userInput, correctKey);
}

// 检查答案（判断正误并记录）
function checkAnswer(userInput, correctKey) {
  const feedback = document.getElementById('feedback');
  if (!feedback) return;
  
  if (userInput === correctKey) {
    // 答案正确：显示绿色反馈，0.5 秒后下一题
    feedback.className = 'feedback correct';
    feedback.textContent = '✓ 正确！';
    recordAnswer(true);
    
    setTimeout(() => {
      nextQuestion();
    }, 500);
  } else {
    // 答案错误：显示红色反馈和正确答案
    feedback.className = 'feedback wrong';
    feedback.textContent = `✗ 错误！正确答案是：${correctKey.toUpperCase()}`;
    recordAnswer(false);
  }
  
  updateStatsDisplay();
}

// 记录答案（更新统计数据）
function recordAnswer(isCorrect) {
  const key = state.currentRadical.key;
  
  if (!state.stats[key]) {
    state.stats[key] = { errors: 0, correct: 0, lastPracticed: null };
  }
  
  if (isCorrect) {
    state.stats[key].correct++;
  } else {
    state.stats[key].errors++;
  }
  
  state.stats[key].lastPracticed = Date.now();
  saveStats();
}

// 切换暂停状态
function togglePause() {
  state.isPaused = !state.isPaused;
  updatePauseButton();
  
  if (state.isPaused) {
    const container = document.getElementById('practiceArea');
    if (container) {
      container.innerHTML += `
        <div class="pause-overlay">
          <h3>已暂停</h3>
          <p>点击"继续"恢复练习</p>
        </div>
      `;
    }
  } else {
    nextQuestion();
  }
}

// 更新暂停按钮文本
function updatePauseButton() {
  const btn = document.getElementById('pauseBtn');
  if (btn) {
    btn.textContent = state.isPaused ? '继续' : '暂停';
    btn.disabled = !state.currentRadical;
  }
}

// 切换练习模式（全部练习/错题复习）
function toggleMode() {
  state.mode = state.mode === 'all' ? 'wrong' : 'all';
  const btn = document.getElementById('modeToggle');
  if (btn) {
    btn.textContent = state.mode === 'all' ? '模式：全部练习' : '模式：错题复习';
  }
  
  // 重置当前题目，但保留分类选择
  state.currentRadical = null;
  showStartScreen();
}

// 显示无题目消息（错题本已清空）
function showNoQuestionsMessage() {
  const container = document.getElementById('practiceArea');
  if (container) {
    container.innerHTML = `
      <div class="no-questions">
        <h3>🎉 太棒了！</h3>
        <p>错题本已清空，切换回全部练习模式吧！</p>
        <button onclick="toggleMode()" class="btn btn-primary">切换模式</button>
      </div>
    `;
  }
}

// 更新统计显示（总次数、正确率、Top5、掌握情况）
function updateStatsDisplay() {
  const totalCorrect = Object.values(state.stats).reduce((sum, s) => sum + (s.correct || 0), 0);
  const totalErrors = Object.values(state.stats).reduce((sum, s) => sum + (s.errors || 0), 0);
  const total = totalCorrect + totalErrors;
  
  // 总练习次数
  const totalEl = document.getElementById('totalPractices');
  if (totalEl) {
    totalEl.textContent = total;
  }
  
  // 正确率
  const accuracyEl = document.getElementById('accuracy');
  if (accuracyEl && total > 0) {
    const accuracy = ((totalCorrect / total) * 100).toFixed(1);
    accuracyEl.textContent = accuracy + '%';
  }
  
  // Top 5 错误字根
  updateTopErrors();
  
  // 已掌握/需复习
  updateMasteryStatus();
}

// 更新 Top 5 错误字根（按错误次数和错误率排序）
function updateTopErrors() {
  const container = document.getElementById('topErrors');
  if (!container) return;
  
  const errorList = radicals
    .filter(r => state.stats[r.key] && state.stats[r.key].errors > 0)
    .map(r => {
      const stats = state.stats[r.key];
      const total = (stats.errors || 0) + (stats.correct || 0);
      const errorRate = total > 0 ? stats.errors / total : 0;
      return {
        ...r,
        errors: stats.errors,
        errorRate: errorRate
      };
    })
    .sort((a, b) => {
      // 先按错误次数排序，如果错误次数相同则按错误率排序
      if (b.errors !== a.errors) {
        return b.errors - a.errors;
      }
      return b.errorRate - a.errorRate;
    })
    .slice(0, 5);
  
  if (errorList.length === 0) {
    container.innerHTML = '<p class="empty">暂无错题</p>';
    return;
  }
  
  container.innerHTML = errorList.map(r => `
    <div class="error-item">
      <span class="key">${r.key.toUpperCase()}</span>
      <span class="name">${r.name}</span>
      <span class="count">错误 ${r.errors} 次</span>
    </div>
  `).join('');
}

// 更新掌握状态（已掌握/需复习字根数量）
function updateMasteryStatus() {
  const masteredEl = document.getElementById('masteredCount');
  const needReviewEl = document.getElementById('needReviewCount');
  
  if (!masteredEl || !needReviewEl) return;
  
  let mastered = 0;
  let needReview = 0;
  
  const keyStats = {};
  radicals.forEach(r => {
    const stats = state.stats[r.key];
    if (stats) {
      keyStats[r.key] = stats;
    }
  });
  
  Object.keys(keyStats).forEach(key => {
    const stats = keyStats[key];
    if (stats.errors === 0 && stats.correct > 0) {
      mastered++;
    } else if (stats.errors > 0) {
      needReview++;
    }
  });
  
  masteredEl.textContent = mastered;
  needReviewEl.textContent = needReview;
}

// 切换统计面板显示/隐藏
function toggleStatsPanel() {
  const panel = document.getElementById('statsPanel');
  if (panel) {
    panel.classList.toggle('hidden');
  }
}

// 重置统计数据（清空所有练习记录）
function resetStats() {
  if (confirm('确定要重置所有统计数据吗？此操作不可恢复！')) {
    state.stats = {};
    radicals.forEach(radical => {
      state.stats[radical.key] = { errors: 0, correct: 0, lastPracticed: null };
    });
    saveStats();
    updateStatsDisplay();
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
