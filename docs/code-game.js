// 码表打字游戏 - 游戏核心逻辑
// 功能：单字下落、拼音/字根输入判定、错误追踪、统计报告

// 默认配置参数
const defaultConfig = {
  duration: 180000,        // 游戏时长（毫秒）默认 3 分钟
  fallSpeed: 2,            // 下落速度（像素/帧）
  spawnDelay: 1000,        // 新字生成延迟（毫秒）
  charSize: { width: 80, height: 80 },  // 汉字尺寸
  enableSoundEffects: true,  // 音效开关
  enableKeyHint: true,     // 字根编码提示开关
  inputMode: 'both'        // 输入模式：both/pinyin/wubi
};

// 当前游戏配置
let gameConfig = { ...defaultConfig };

// 游戏状态
const gameState = {
  isActive: false,
  isPaused: false,
  startTime: null,
  endTime: null,
  lastSpawnTime: null,
  animationFrameId: null,
  activeChars: [],         // 当前掉落的汉字：{id, char, pinyin, wubi, x, y, element}
  correctCount: 0,
  errorCount: 0,
  errorLog: [],            // 错误记录：{type, char, expected, time}
  charIdCounter: 0,
  currentInput: '',        // 当前输入内容
  correctHistory: []       // 已正确输入的汉字历史
};

// 码表数据
const codeTable = {
  isDefault: true,
  customData: null,
  charToWubi: new Map(),   // 汉字 -> 五笔编码
  wubiToChar: new Map()    // 五笔编码 -> 汉字
};

// 文档数据
const documentData = {
  files: ['前500.txt', '中500.txt', '后500.txt', '前1500.txt'],
  currentFile: '前500.txt',
  chars: []                // 当前文档的汉字数组
};

// 本地存储键名
const GAME_STORAGE_KEY = 'wubi98_code_game_stats';
const CONFIG_STORAGE_KEY = 'wubi98_code_game_config';
const CODE_TABLE_KEY = 'wubi98_custom_code_table';

// 拼音映射表（简化版）
const pinyinMap = new Map([
  ['的', 'di'], ['一', 'yi'], ['是', 'shi'], ['了', 'le'], ['不', 'bu'],
  ['在', 'zai'], ['有', 'you'], ['个', 'ge'], ['人', 'ren'], ['这', 'zhe'],
  ['上', 'shang'], ['中', 'zhong'], ['大', 'da'], ['为', 'wei'], ['来', 'lai'],
  ['我', 'wo'], ['到', 'dao'], ['出', 'chu'], ['要', 'yao'], ['以', 'yi'],
  ['时', 'shi'], ['和', 'he'], ['地', 'di'], ['们', 'men'], ['得', 'de'],
  ['可', 'ke'], ['下', 'xia'], ['对', 'dui'], ['生', 'sheng'], ['也', 'ye'],
  ['子', 'zi'], ['就', 'jiu'], ['过', 'guo'], ['能', 'neng'], ['他', 'ta'],
  ['会', 'hui'], ['多', 'duo'], ['发', 'fa'], ['说', 'shuo'], ['而', 'er'],
  ['于', 'yu'], ['自', 'zi'], ['之', 'zhi'], ['用', 'yong'], ['年', 'nian'],
  ['行', 'xing'], ['家', 'jia'], ['方', 'fang'], ['后', 'hou'], ['作', 'zuo'],
  ['成', 'cheng'], ['开', 'kai'], ['面', 'mian'], ['事', 'shi'], ['好', 'hao'],
  ['小', 'xiao'], ['心', 'xin'], ['前', 'qian'], ['所', 'suo'], ['道', 'dao'],
  ['法', 'fa'], ['如', 'ru'], ['进', 'jin'], ['着', 'zhe'], ['同', 'tong'],
  ['经', 'jing'], ['分', 'fen'], ['定', 'ding'], ['都', 'dou'], ['然', 'ran'],
  ['与', 'yu'], ['本', 'ben'], ['还', 'hai'], ['其', 'qi'], ['当', 'dang'],
  ['动', 'dong'], ['已', 'yi'], ['两', 'liang'], ['点', 'dian'], ['从', 'cong'],
  ['问', 'wen'], ['里', 'li'], ['主', 'zhu'], ['实', 'shi'], ['天', 'tian'],
  ['高', 'gao'], ['去', 'qu'], ['现', 'xian'], ['长', 'chang'], ['此', 'ci'],
  ['三', 'san'], ['将', 'jiang'], ['无', 'wu'], ['国', 'guo'], ['全', 'quan'],
  ['文', 'wen'], ['理', 'li'], ['明', 'ming'], ['日', 'ri'], ['些', 'xie'],
  ['看', 'kan'], ['只', 'zhi'], ['公', 'gong'], ['等', 'deng'], ['十', 'shi'],
  ['意', 'yi'], ['正', 'zheng'], ['外', 'wai'], ['想', 'xiang'], ['间', 'jian'],
  ['把', 'ba'], ['情', 'qing'], ['者', 'zhe'], ['没', 'mei'], ['重', 'zhong'],
  ['相', 'xiang'], ['那', 'na'], ['向', 'xiang'], ['知', 'zhi'], ['因', 'yin'],
  ['样', 'yang'], ['学', 'xue'], ['应', 'ying'], ['又', 'you'], ['手', 'shou'],
  ['但', 'dan'], ['信', 'xin'], ['关', 'guan'], ['使', 'shi'], ['种', 'zhong'],
  ['见', 'jian'], ['力', 'li'], ['名', 'ming'], ['二', 'er'], ['处', 'chu'],
  ['门', 'men'], ['并', 'bing'], ['口', 'kou'], ['么', 'me'], ['先', 'xian'],
  ['位', 'wei'], ['头', 'tou'], ['回', 'hui'], ['话', 'hua'], ['很', 'hen'],
  ['再', 'zai'], ['由', 'you'], ['身', 'shen'], ['入', 'ru'], ['内', 'nei'],
  ['第', 'di'], ['平', 'ping'], ['被', 'bei'], ['给', 'gei'], ['次', 'ci'],
  ['别', 'bie'], ['几', 'ji'], ['月', 'yue'], ['真', 'zhen'], ['立', 'li'],
  ['新', 'xin'], ['通', 'tong'], ['少', 'shao'], ['机', 'ji'], ['打', 'da'],
  ['水', 'shui'], ['果', 'guo'], ['最', 'zui'], ['部', 'bu'], ['何', 'he'],
  ['安', 'an'], ['接', 'jie'], ['报', 'bao'], ['声', 'sheng'], ['才', 'cai'],
  ['体', 'ti'], ['今', 'jin'], ['合', 'he'], ['性', 'xing'], ['西', 'xi'],
  ['你', 'ni'], ['放', 'fang'], ['表', 'biao'], ['目', 'mu'], ['加', 'jia'],
  ['常', 'chang'], ['做', 'zuo'], ['己', 'ji'], ['老', 'lao'], ['四', 'si'],
  ['件', 'jian'], ['解', 'jie'], ['路', 'lu'], ['更', 'geng'], ['走', 'zou'],
  ['比', 'bi'], ['总', 'zong'], ['金', 'jin'], ['管', 'guan'], ['光', 'guang'],
  ['工', 'gong'], ['结', 'jie'], ['提', 'ti'], ['任', 'ren'], ['东', 'dong'],
  ['原', 'yuan'], ['便', 'bian'], ['美', 'mei'], ['及', 'ji'], ['教', 'jiao'],
  ['难', 'nan'], ['世', 'shi'], ['至', 'zhi'], ['气', 'qi'], ['神', 'shen'],
  ['山', 'shan'], ['数', 'shu'], ['利', 'li'], ['书', 'shu'], ['代', 'dai'],
  ['直', 'zhi'], ['色', 'se'], ['场', 'chang'], ['变', 'bian'], ['记', 'ji'],
  ['张', 'zhang'], ['必', 'bi'], ['受', 'shou'], ['交', 'jiao'], ['非', 'fei'],
  ['服', 'fu'], ['化', 'hua'], ['求', 'qiu'], ['风', 'feng'], ['度', 'du'],
  ['太', 'tai'], ['万', 'wan'], ['各', 'ge'], ['算', 'suan'], ['边', 'bian'],
  ['王', 'wang'], ['什', 'shen'], ['快', 'kuai'], ['许', 'xu'], ['连', 'lian'],
  ['五', 'wu'], ['活', 'huo'], ['思', 'si'], ['该', 'gai'], ['步', 'bu'],
  ['海', 'hai'], ['指', 'zhi'], ['物', 'wu'], ['则', 'ze'], ['女', 'nv'],
  ['或', 'huo'], ['完', 'wan'], ['马', 'ma'], ['强', 'qiang'], ['言', 'yan'],
  ['条', 'tiao'], ['特', 'te'], ['命', 'ming'], ['感', 'gan'], ['清', 'qing'],
  ['带', 'dai'], ['认', 'ren'], ['保', 'bao'], ['望', 'wang'], ['转', 'zhuan'],
  ['传', 'chuan'], ['儿', 'er'], ['制', 'zhi'], ['干', 'gan'], ['计', 'ji'],
  ['民', 'min'], ['白', 'bai'], ['住', 'zhu'], ['字', 'zi'], ['它', 'ta'],
  ['义', 'yi'], ['车', 'che'], ['像', 'xiang'], ['反', 'fan'], ['象', 'xiang'],
  ['题', 'ti'], ['却', 'que'], ['流', 'liu'], ['且', 'qie'], ['即', 'ji'],
  ['深', 'shen'], ['近', 'jin'], ['形', 'xing'], ['取', 'qu'], ['往', 'wang'],
  ['系', 'xi'], ['量', 'liang'], ['论', 'lun'], ['告', 'gao'], ['息', 'xi'],
  ['让', 'rang'], ['决', 'jue'], ['未', 'wei'], ['花', 'hua'], ['收', 'shou'],
  ['满', 'man'], ['每', 'mei'], ['华', 'hua'], ['业', 'ye'], ['南', 'nan'],
  ['觉', 'jue'], ['电', 'dian'], ['空', 'kong'], ['眼', 'yan'], ['听', 'ting'],
  ['远', 'yuan'], ['师', 'shi'], ['元', 'yuan'], ['请', 'qing'], ['容', 'rong'],
  ['她', 'ta'], ['军', 'jun'], ['士', 'shi'], ['百', 'bai'], ['办', 'ban'],
  ['语', 'yu'], ['期', 'qi'], ['北', 'bei'], ['林', 'lin'], ['识', 'shi'],
  ['半', 'ban'], ['夫', 'fu'], ['客', 'ke'], ['战', 'zhan'], ['院', 'yuan'],
  ['城', 'cheng'], ['候', 'hou'], ['单', 'dan'], ['音', 'yin'], ['台', 'tai'],
  ['死', 'si'], ['视', 'shi'], ['领', 'ling'], ['失', 'shi'], ['司', 'si'],
  ['亲', 'qin'], ['始', 'shi'], ['极', 'ji'], ['双', 'shuang'], ['令', 'ling'],
  ['改', 'gai'], ['功', 'gong'], ['程', 'cheng'], ['爱', 'ai'], ['德', 'de'],
  ['复', 'fu'], ['切', 'qie'], ['随', 'sui'], ['李', 'li'], ['员', 'yuan'],
  ['离', 'li'], ['轻', 'qing'], ['观', 'guan'], ['青', 'qing'], ['足', 'zu'],
  ['落', 'luo'], ['叫', 'jiao'], ['根', 'gen'], ['怎', 'zen'], ['持', 'chi'],
  ['精', 'jing'], ['送', 'song'], ['众', 'zhong'], ['影', 'ying'], ['八', 'ba'],
  ['首', 'shou'], ['包', 'bao'], ['准', 'zhun'], ['兴', 'xing'], ['红', 'hong'],
  ['达', 'da'], ['早', 'zao'], ['尽', 'jin'], ['故', 'gu'], ['房', 'fang'],
  ['引', 'yin'], ['火', 'huo'], ['站', 'zhan'], ['似', 'si'], ['找', 'zhao'],
  ['备', 'bei'], ['调', 'diao'], ['断', 'duan'], ['设', 'she'], ['格', 'ge'],
  ['消', 'xiao'], ['拉', 'la'], ['照', 'zhao'], ['布', 'bu'], ['友', 'you'],
  ['整', 'zheng'], ['术', 'shu'], ['石', 'shi'], ['展', 'zhan'], ['紧', 'jin'],
  ['据', 'ju'], ['终', 'zhong'], ['周', 'zhou'], ['式', 'shi'], ['举', 'ju'],
  ['飞', 'fei'], ['片', 'pian'], ['虽', 'sui'], ['易', 'yi'], ['运', 'yun'],
  ['笑', 'xiao'], ['云', 'yun'], ['建', 'jian'], ['谈', 'tan'], ['界', 'jie'],
  ['务', 'wu'], ['写', 'xie'], ['钱', 'qian'], ['商', 'shang'], ['乐', 'le'],
  ['推', 'tui'], ['注', 'zhu'], ['越', 'yue'], ['千', 'qian'], ['微', 'wei'],
  ['若', 'ruo'], ['约', 'yue'], ['英', 'ying'], ['集', 'ji'], ['示', 'shi'],
  ['呢', 'ne'], ['待', 'dai'], ['坐', 'zuo'], ['议', 'yi'], ['乎', 'hu'],
  ['留', 'liu'], ['称', 'cheng'], ['品', 'pin'], ['志', 'zhi'], ['黑', 'hei'],
  ['存', 'cun'], ['六', 'liu'], ['造', 'zao'], ['低', 'di'], ['江', 'jiang'],
  ['念', 'nian'], ['产', 'chan'], ['刻', 'ke'], ['节', 'jie'], ['尔', 'er'],
  ['吃', 'chi'], ['势', 'shi'], ['依', 'yi'], ['图', 'tu'], ['共', 'gong'],
  ['曾', 'zeng'], ['响', 'xiang'], ['底', 'di'], ['装', 'zhuang'], ['具', 'ju'],
  ['喜', 'xi'], ['严', 'yan'], ['九', 'jiu'], ['况', 'kuang'], ['跟', 'gen'],
  ['罗', 'luo'], ['须', 'xu'], ['显', 'xian'], ['热', 're'], ['病', 'bing'],
  ['证', 'zheng'], ['刚', 'gang'], ['治', 'zhi'], ['绝', 'jue'], ['群', 'qun'],
  ['市', 'shi'], ['阳', 'yang'], ['确', 'que'], ['究', 'jiu'], ['久', 'jiu'],
  ['除', 'chu'], ['闻', 'wen'], ['答', 'da'], ['段', 'duan'], ['官', 'guan'],
  ['政', 'zheng'], ['类', 'lei'], ['黄', 'huang'], ['武', 'wu'], ['七', 'qi'],
  ['支', 'zhi'], ['费', 'fei'], ['父', 'fu'], ['统', 'tong'], ['府', 'fu']
]);

// 初始化：设置事件监听
function init() {
  loadConfig();
  loadCodeTable();
  loadDocument();
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
  const durationEl = document.getElementById('configDuration');
  const fallSpeedEl = document.getElementById('configFallSpeed');
  const spawnDelayEl = document.getElementById('configSpawnDelay');
  const keyHintToggleEl = document.getElementById('keyHintToggle');
  const inputModeSelectEl = document.getElementById('inputModeSelect');
  
  if (durationEl) gameConfig.duration = Math.min(30, Math.max(1, parseInt(durationEl.value))) * 60000;
  if (fallSpeedEl) gameConfig.fallSpeed = Math.min(10, Math.max(1, parseInt(fallSpeedEl.value)));
  if (spawnDelayEl) gameConfig.spawnDelay = Math.min(5000, Math.max(500, parseInt(spawnDelayEl.value)));
  if (keyHintToggleEl) gameConfig.enableKeyHint = keyHintToggleEl.checked;
  if (inputModeSelectEl) gameConfig.inputMode = inputModeSelectEl.value;
}

// 更新 UI 显示配置
function updateConfigUI() {
  const durationEl = document.getElementById('configDuration');
  const fallSpeedEl = document.getElementById('configFallSpeed');
  const spawnDelayEl = document.getElementById('configSpawnDelay');
  const keyHintToggleEl = document.getElementById('keyHintToggle');
  const inputModeSelectEl = document.getElementById('inputModeSelect');
  
  if (durationEl) durationEl.value = gameConfig.duration / 60000;
  if (fallSpeedEl) fallSpeedEl.value = gameConfig.fallSpeed;
  if (spawnDelayEl) spawnDelayEl.value = gameConfig.spawnDelay;
  if (keyHintToggleEl) keyHintToggleEl.checked = gameConfig.enableKeyHint;
  if (inputModeSelectEl) inputModeSelectEl.value = gameConfig.inputMode;
}

// 重置为默认配置
function resetConfig() {
  gameConfig = { ...defaultConfig };
  saveConfig();
  updateConfigUI();
}

// 加载码表
async function loadCodeTable() {
  try {
    // 检查是否有自定义码表
    const savedCodeTable = localStorage.getItem(CODE_TABLE_KEY);
    if (savedCodeTable) {
      try {
        const data = JSON.parse(savedCodeTable);
        codeTable.customData = data;
        buildCodeTableMap(data);
        codeTable.isDefault = false;
        updateCodeTableStatus('自定义');
        console.log('加载自定义码表成功');
        return;
      } catch (e) {
        console.warn('加载自定义码表失败，使用默认码表', e);
      }
    }
    
    // 加载默认码表
    const response = await fetch('assets/code/wb98.txt');
    const text = await response.text();
    parseCodeTable(text);
    codeTable.isDefault = true;
    updateCodeTableStatus('默认');
    console.log('加载默认码表成功');
  } catch (e) {
    console.error('加载码表失败', e);
    updateCodeTableStatus('加载失败');
  }
}

// 解析码表文件（UTF-16 格式）
function parseCodeTable(text) {
  const lines = text.split(/\r?\n/);
  const data = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const char = parts[0].trim();
      const code = parts[1].trim();
      if (char && code) {
        data.push({ char, code });
      }
    }
  }
  
  codeTable.customData = data;
  buildCodeTableMap(data);
}

// 构建码表映射
function buildCodeTableMap(data) {
  codeTable.charToWubi.clear();
  codeTable.wubiToChar.clear();
  
  for (const item of data) {
    codeTable.charToWubi.set(item.char, item.code);
    if (!codeTable.wubiToChar.has(item.code)) {
      codeTable.wubiToChar.set(item.code, []);
    }
    codeTable.wubiToChar.get(item.code).push(item.char);
  }
}

// 上传自定义码表
function handleCodeTableUpload(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const text = e.target.result;
      parseCodeTable(text);
      codeTable.isDefault = false;
      localStorage.setItem(CODE_TABLE_KEY, JSON.stringify(codeTable.customData));
      updateCodeTableStatus('自定义');
      alert('码表加载成功！');
    } catch (err) {
      alert('码表格式错误：' + err.message);
    }
  };
  reader.onerror = function() {
    alert('读取文件失败');
  };
  reader.readAsText(file, 'UTF-16');
}

// 更新码表状态显示
function updateCodeTableStatus(status) {
  const el = document.getElementById('codeTableStatus');
  if (el) el.textContent = status;
}

// 加载文档
async function loadDocument() {
  try {
    const encodedFilename = encodeURIComponent(documentData.currentFile);
    const response = await fetch(`assets/document/${encodedFilename}`);
    const text = await response.text();
    documentData.chars = text.split('').filter(char => char.trim());
    console.log(`加载文档 ${documentData.currentFile} 成功，共 ${documentData.chars.length} 个汉字`);
  } catch (e) {
    console.error('加载文档失败', e);
  }
}

// 切换文档
async function switchDocument(filename) {
  documentData.currentFile = filename;
  await loadDocument();
}

// 随机获取汉字
function getRandomChar() {
  if (documentData.chars.length === 0) return '的';
  const index = Math.floor(Math.random() * documentData.chars.length);
  return documentData.chars[index];
}

// 获取汉字的拼音
function getPinyin(char) {
  return pinyinMap.get(char) || '';
}

// 获取汉字的五笔编码
function getWubi(char) {
  return codeTable.charToWubi.get(char) || '';
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
  
  // 音量控制事件
  const volumeSlider = document.getElementById('volumeSlider');
  if (volumeSlider) {
    const savedVolume = AudioManager.getVolume() * 100;
    volumeSlider.value = savedVolume;
    updateVolumeDisplay(savedVolume);
    
    volumeSlider.addEventListener('input', (e) => {
      const volume = parseInt(e.target.value) / 100;
      AudioManager.setVolume(volume);
      updateVolumeDisplay(e.target.value);
    });
  }
  
  // 键位提示开关事件
  const keyHintToggle = document.getElementById('keyHintToggle');
  if (keyHintToggle) {
    keyHintToggle.checked = gameConfig.enableKeyHint;
    keyHintToggle.addEventListener('change', (e) => {
      gameConfig.enableKeyHint = e.target.checked;
      saveConfig();
      refreshActiveChars();
    });
  }
  
  // 输入模式选择事件
  const inputModeSelect = document.getElementById('inputModeSelect');
  if (inputModeSelect) {
    inputModeSelect.value = gameConfig.inputMode;
    inputModeSelect.addEventListener('change', (e) => {
      gameConfig.inputMode = e.target.value;
      saveConfig();
    });
  }
  
  // 码表上传事件
  document.getElementById('uploadCodeTableBtn')?.addEventListener('click', () => {
    document.getElementById('codeTableInput')?.click();
  });
  
  document.getElementById('codeTableInput')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCodeTableUpload(file);
      e.target.value = ''; // 重置 input
    }
  });
  
  // 移动端音频初始化
  document.addEventListener('click', () => {
    AudioManager.resumeAudioContext();
  }, { once: true });
  
  document.addEventListener('keydown', () => {
    AudioManager.resumeAudioContext();
  }, { once: true });
}

// 显示开始屏幕
function showStartScreen() {
  const startScreen = document.getElementById('startScreen');
  const gameArea = document.getElementById('gameArea');
  const resultPanel = document.getElementById('resultPanel');
  
  if (startScreen) startScreen.classList.remove('hidden');
  if (gameArea) gameArea.innerHTML = '';
  if (resultPanel) resultPanel.classList.add('hidden');
  
  gameState.activeChars = [];
  gameState.correctCount = 0;
  gameState.errorCount = 0;
  gameState.errorLog = [];
  
  // 清空历史记录
  clearCorrectHistory();
  
  updateConfigUI();
  updateStatsDisplay();
}

// 开始游戏
function startGame() {
  if (gameState.isActive) return;
  
  AudioManager.init();
  AudioManager.resumeAudioContext();
  
  gameState.isActive = true;
  gameState.isPaused = false;
  gameState.startTime = Date.now();
  gameState.endTime = gameState.startTime + gameConfig.duration;
  gameState.lastSpawnTime = 0;
  gameState.activeChars = [];
  gameState.correctCount = 0;
  gameState.errorCount = 0;
  gameState.errorLog = [];
  
  const startScreen = document.getElementById('startScreen');
  const gameArea = document.getElementById('gameArea');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const startBtnLarge = document.getElementById('startBtnLarge');
  
  if (startScreen) startScreen.classList.add('hidden');
  if (startBtnLarge) startBtnLarge.classList.add('hidden');
  if (gameArea) gameArea.innerHTML = '';
  if (startBtn) startBtn.disabled = true;
  if (pauseBtn) pauseBtn.disabled = false;
  
  gameLoop();
  startTimer();
}

// 游戏主循环
function gameLoop() {
  if (!gameState.isActive || gameState.isPaused) return;
  
  const now = Date.now();
  
  // 生成新汉字
  if (!gameState.lastSpawnTime || now - gameState.lastSpawnTime >= gameConfig.spawnDelay) {
    if (gameState.activeChars.length < 1) { // 单字模式，只保留一个汉字
      spawnChar();
      gameState.lastSpawnTime = now;
    }
  }
  
  // 更新汉字位置
  updateCharPositions();
  
  // 检查游戏结束
  if (now >= gameState.endTime) {
    endGame();
    return;
  }
  
  gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

// 生成汉字
function spawnChar() {
  const char = getRandomChar();
  const pinyin = getPinyin(char);
  const wubi = getWubi(char);
  
  const gameArea = document.getElementById('gameArea');
  if (!gameArea) return;
  
  const rect = gameArea.getBoundingClientRect();
  const maxX = rect.width - gameConfig.charSize.width;
  const x = Math.random() * maxX;
  
  const charElement = document.createElement('div');
  charElement.className = 'falling-char';
  charElement.style.left = x + 'px';
  charElement.style.top = '0px';
  charElement.style.width = gameConfig.charSize.width + 'px';
  charElement.style.height = gameConfig.charSize.height + 'px';
  
  // 显示汉字
  const charSpan = document.createElement('span');
  charSpan.className = 'char-text';
  charSpan.textContent = char;
  charElement.appendChild(charSpan);
  
  // 显示字根编码
  if (gameConfig.enableKeyHint && wubi) {
    const wubiSpan = document.createElement('span');
    wubiSpan.className = 'wubi-hint';
    wubiSpan.textContent = wubi;
    charElement.appendChild(wubiSpan);
  }
  
  gameArea.appendChild(charElement);
  
  gameState.activeChars.push({
    id: gameState.charIdCounter++,
    char,
    pinyin,
    wubi,
    x,
    y: 0,
    element: charElement
  });
  
  updateActiveCount();
}

// 更新汉字位置
function updateCharPositions() {
  for (let i = gameState.activeChars.length - 1; i >= 0; i--) {
    const activeChar = gameState.activeChars[i];
    activeChar.y += gameConfig.fallSpeed;
    activeChar.element.style.top = activeChar.y + 'px';
    
    // 检查是否触底
    const gameArea = document.getElementById('gameArea');
    if (gameArea && activeChar.y > gameArea.clientHeight - gameConfig.charSize.height) {
      recordError('missed', activeChar.char, activeChar.pinyin || activeChar.wubi);
      removeChar(i);
    }
  }
}

// 移除汉字
function removeChar(index) {
  const activeChar = gameState.activeChars[index];
  if (activeChar && activeChar.element) {
    activeChar.element.remove();
  }
  gameState.activeChars.splice(index, 1);
  updateActiveCount();
}

// 刷新活跃汉字显示
function refreshActiveChars() {
  for (const activeChar of gameState.activeChars) {
    // 移除旧的 wubi 提示
    const oldHint = activeChar.element.querySelector('.wubi-hint');
    if (oldHint) oldHint.remove();
    
    // 添加新的 wubi 提示
    if (gameConfig.enableKeyHint && activeChar.wubi) {
      const wubiSpan = document.createElement('span');
      wubiSpan.className = 'wubi-hint';
      wubiSpan.textContent = activeChar.wubi;
      activeChar.element.appendChild(wubiSpan);
    }
  }
}

// 处理键盘输入
function handleKeyPress(e) {
  if (!gameState.isActive || gameState.isPaused) return;
  
  const key = e.key.toLowerCase();
  
  // 空格或回车：清空当前输入
  if (key === ' ' || key === 'enter') {
    gameState.currentInput = '';
    updateCurrentInputDisplay();
    return;
  }
  
  // 忽略修饰键
  if (key.length > 1) return;
  
  // 添加到当前输入显示
  gameState.currentInput += key;
  updateCurrentInputDisplay();
  
  // 检查是否匹配当前汉字
  const now = Date.now();
  
  for (let i = 0; i < gameState.activeChars.length; i++) {
    const activeChar = gameState.activeChars[i];
    let isMatch = false;
    
    // 根据输入模式检查匹配
    if (gameConfig.inputMode === 'both' || gameConfig.inputMode === 'pinyin') {
      if (activeChar.pinyin && activeChar.pinyin.toLowerCase().startsWith(gameState.currentInput)) {
        isMatch = true;
      }
    }
    
    if (gameConfig.inputMode === 'both' || gameConfig.inputMode === 'wubi') {
      if (activeChar.wubi && activeChar.wubi.toLowerCase().startsWith(gameState.currentInput)) {
        isMatch = true;
      }
    }
    
    if (isMatch) {
      // 正确输入
      gameState.correctCount++;
      
      // 添加到正确历史
      addToCorrectHistory(activeChar.char);
      
      // 清空当前输入
      gameState.currentInput = '';
      updateCurrentInputDisplay();
      
      AudioManager.play('correct');
      
      // 播放消除动画
      playEliminateAnimation(activeChar.element);
      
      // 移除汉字
      removeChar(i);
      
      updateStatsDisplay();
      return;
    }
  }
  
  // 没有匹配的汉字，记录错误
  recordError('wrong', null, key);
  
  // 如果输入超过 4 个字符，清空当前输入
  if (gameState.currentInput.length >= 4) {
    gameState.currentInput = '';
    updateCurrentInputDisplay();
  }
}

// 播放消除动画
function playEliminateAnimation(element) {
  element.style.transition = 'transform 0.2s, opacity 0.2s';
  element.style.transform = 'scale(1.5)';
  element.style.opacity = '0';
  setTimeout(() => {
    element.remove();
  }, 200);
}

// 记录错误
function recordError(type, char, expected) {
  gameState.errorCount++;
  gameState.errorLog.push({
    type,
    char: char || '?',
    expected,
    time: Date.now() - gameState.startTime
  });
  AudioManager.play('incorrect');
  updateStatsDisplay();
}

// 更新统计显示
function updateStatsDisplay() {
  const correctEl = document.getElementById('correctCount');
  const errorEl = document.getElementById('errorCount');
  
  if (correctEl) correctEl.textContent = gameState.correctCount;
  if (errorEl) errorEl.textContent = gameState.errorCount;
}

// 更新活跃汉字数显示
function updateActiveCount() {
  const activeEl = document.getElementById('activeCount');
  if (activeEl) activeEl.textContent = `${gameState.activeChars.length}/1`;
}

// 更新当前输入显示
function updateCurrentInputDisplay() {
  const displayEl = document.getElementById('currentInputDisplay');
  if (displayEl) {
    displayEl.textContent = gameState.currentInput || '';
  }
}

// 添加到正确历史
function addToCorrectHistory(char) {
  gameState.correctHistory.push(char);
  renderCorrectHistory();
}

// 渲染正确历史
function renderCorrectHistory() {
  const historyEl = document.getElementById('correctHistoryList');
  const historyPanel = document.getElementById('historyPanel');
  
  if (!historyEl) return;
  
  // 显示历史面板
  if (historyPanel && gameState.correctHistory.length > 0) {
    historyPanel.classList.remove('hidden');
  }
  
  // 清空并重新渲染
  historyEl.innerHTML = '';
  for (const char of gameState.correctHistory) {
    const charEl = document.createElement('span');
    charEl.className = 'history-char';
    charEl.textContent = char;
    historyEl.appendChild(charEl);
  }
}

// 清空历史记录
function clearCorrectHistory() {
  gameState.correctHistory = [];
  gameState.currentInput = '';
  renderCorrectHistory();
  updateCurrentInputDisplay();
  
  // 隐藏历史面板
  const historyPanel = document.getElementById('historyPanel');
  if (historyPanel) {
    historyPanel.classList.add('hidden');
  }
}

// 开始计时器
function startTimer() {
  const timerEl = document.getElementById('timer');
  
  const updateTimer = () => {
    if (!gameState.isActive || gameState.isPaused) return;
    
    const remaining = Math.max(0, gameState.endTime - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    if (timerEl) {
      timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (remaining > 0) {
      requestAnimationFrame(updateTimer);
    }
  };
  
  updateTimer();
}

// 切换暂停
function togglePause() {
  if (!gameState.isActive) return;
  
  gameState.isPaused = !gameState.isPaused;
  
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) {
    pauseBtn.textContent = gameState.isPaused ? '继续' : '暂停';
  }
  
  if (!gameState.isPaused) {
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
  }
}

// 退出游戏
function quitGame() {
  if (!gameState.isActive) return;
  
  gameState.isActive = false;
  gameState.isPaused = false;
  
  if (gameState.animationFrameId) {
    cancelAnimationFrame(gameState.animationFrameId);
  }
  
  showStartScreen();
  
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  
  if (startBtn) startBtn.disabled = false;
  if (pauseBtn) {
    pauseBtn.disabled = true;
    pauseBtn.textContent = '暂停';
  }
}

// 重新开始游戏
function restartGame() {
  quitGame();
  startGame();
  // 清空历史记录
  clearCorrectHistory();
}

// 结束游戏
function endGame() {
  gameState.isActive = false;
  
  if (gameState.animationFrameId) {
    cancelAnimationFrame(gameState.animationFrameId);
  }
  
  // 清理活跃汉字
  for (const activeChar of gameState.activeChars) {
    activeChar.element.remove();
  }
  gameState.activeChars = [];
  
  // 显示结果面板
  showResultPanel();
  
  // 保存统计数据
  saveGameStats();
}

// 显示结果面板
function showResultPanel() {
  const resultPanel = document.getElementById('resultPanel');
  const startScreen = document.getElementById('startScreen');
  
  if (startScreen) startScreen.classList.add('hidden');
  if (resultPanel) resultPanel.classList.remove('hidden');
  
  // 计算正确率
  const total = gameState.correctCount + gameState.errorCount;
  const accuracy = total > 0 ? Math.round((gameState.correctCount / total) * 100) : 0;
  
  // 计算评分
  let grade = 'F';
  if (accuracy >= 90) grade = 'A';
  else if (accuracy >= 80) grade = 'B';
  else if (accuracy >= 70) grade = 'C';
  else if (accuracy >= 60) grade = 'D';
  
  // 更新显示
  const accuracyEl = document.getElementById('resultAccuracy');
  const gradeEl = document.getElementById('resultGrade');
  const correctEl = document.getElementById('resultCorrect');
  const errorsEl = document.getElementById('resultErrors');
  
  if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
  if (gradeEl) gradeEl.textContent = grade;
  if (correctEl) correctEl.textContent = gameState.correctCount;
  if (errorsEl) errorsEl.textContent = gameState.errorCount;
  
  // 显示错误列表
  showErrorList();
  
  // 显示最常错汉字
  showTopErrorChars();
}

// 显示错误列表
function showErrorList() {
  const errorListEl = document.getElementById('errorList');
  if (!errorListEl) return;
  
  if (gameState.errorLog.length === 0) {
    errorListEl.innerHTML = '<p class="empty">暂无错误</p>';
    return;
  }
  
  const html = gameState.errorLog.slice(-20).map(error => {
    const time = formatTime(error.time);
    return `
      <div class="error-item">
        <span class="error-char">${error.char}</span>
        <span class="error-expected">期望：${error.expected}</span>
        <span class="error-time">${time}</span>
      </div>
    `;
  }).join('');
  
  errorListEl.innerHTML = html;
}

// 显示最常错汉字
function showTopErrorChars() {
  const topErrorCharsEl = document.getElementById('topErrorChars');
  if (!topErrorCharsEl) return;
  
  const charErrorCount = new Map();
  for (const error of gameState.errorLog) {
    if (error.char && error.char !== '?') {
      charErrorCount.set(error.char, (charErrorCount.get(error.char) || 0) + 1);
    }
  }
  
  if (charErrorCount.size === 0) {
    topErrorCharsEl.innerHTML = '<p class="empty">暂无数据</p>';
    return;
  }
  
  const sorted = [...charErrorCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const html = sorted.map(([char, count]) => {
    return `
      <div class="top-error-item">
        <span class="top-error-char">${char}</span>
        <span class="top-error-count">${count}次</span>
      </div>
    `;
  }).join('');
  
  topErrorCharsEl.innerHTML = html;
}

// 格式化时间
function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// 更新音量显示
function updateVolumeDisplay(value) {
  const el = document.getElementById('volumeValue');
  if (el) el.textContent = `${value}%`;
}

// 保存游戏统计
function saveGameStats() {
  const stats = {
    date: Date.now(),
    accuracy: gameState.correctCount + gameState.errorCount > 0
      ? Math.round((gameState.correctCount / (gameState.correctCount + gameState.errorCount)) * 100)
      : 0,
    correct: gameState.correctCount,
    errors: gameState.errorCount,
    duration: gameConfig.duration
  };
  
  let allStats = [];
  const saved = localStorage.getItem(GAME_STORAGE_KEY);
  if (saved) {
    try {
      allStats = JSON.parse(saved);
    } catch (e) {
      console.warn('加载历史统计失败', e);
    }
  }
  
  allStats.push(stats);
  allStats = allStats.slice(-50); // 保留最近 50 局
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(allStats));
}

// 初始化游戏
init();
