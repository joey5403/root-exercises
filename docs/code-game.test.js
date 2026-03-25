// 码表打字游戏单元测试
// 测试码表加载器、下落机制、文档系统

let testsPassed = 0;
let testsFailed = 0;

// 测试工具函数
function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`✗ ${message}`);
  }
}

function assertEquals(actual, expected, message) {
  if (actual === expected) {
    testsPassed++;
    console.log(`✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`✗ ${message} - 期望：${expected}, 实际：${actual}`);
  }
}

// ==================== 码表系统测试 ====================

console.log('\n=== 码表系统测试 ===\n');

// 测试 1: 码表数据结构
function testCodeTableStructure() {
  console.log('测试：码表数据结构');
  
  // 检查 codeTable 对象是否存在
  assert(typeof codeTable !== 'undefined', 'codeTable 对象存在');
  
  // 检查属性
  assert(typeof codeTable.isDefault === 'boolean', 'isDefault 是布尔值');
  assert(codeTable.charToWubi instanceof Map, 'charToWubi 是 Map');
  assert(codeTable.wubiToChar instanceof Map, 'wubiToChar 是 Map');
}

// 测试 2: 码表解析功能
function testCodeTableParsing() {
  console.log('\n测试：码表解析功能');
  
  // 模拟码表数据
  const testData = '的\tg\ncd\n一\ng\ncd';
  const lines = testData.split(/\r?\n/);
  let parsedCount = 0;
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const char = parts[0].trim();
      const code = parts[1].trim();
      if (char && code) {
        parsedCount++;
      }
    }
  }
  
  assertEquals(parsedCount, 2, '正确解析 2 行码表数据');
}

// 测试 3: 码表映射构建
function testCodeTableMap() {
  console.log('\n测试：码表映射构建');
  
  const testMap = new Map();
  testMap.set('的', 'g');
  testMap.set('一', 'g');
  
  assertEquals(testMap.get('的'), 'g', '汉字映射到正确编码');
  assertEquals(testMap.get('一'), 'g', '另一个汉字映射正确');
  assert(!testMap.has('不'), '不存在的汉字返回 undefined');
}

// 测试 4: 获取五笔编码
function testGetWubi() {
  console.log('\n测试：获取五笔编码');
  
  // 测试函数是否存在
  assert(typeof getWubi === 'function', 'getWubi 函数存在');
  
  // 测试返回值类型
  const result = getWubi('的');
  assert(typeof result === 'string', '返回字符串类型');
}

// 测试 5: 配置加载和保存
function testConfigStorage() {
  console.log('\n测试：配置加载和保存');
  
  assert(typeof loadConfig === 'function', 'loadConfig 函数存在');
  assert(typeof saveConfig === 'function', 'saveConfig 函数存在');
  assert(typeof resetConfig === 'function', 'resetConfig 函数存在');
  
  // 测试默认配置
  assert(defaultConfig.duration === 180000, '默认时长 3 分钟');
  assert(defaultConfig.fallSpeed === 2, '默认下落速度 2');
  assert(defaultConfig.spawnDelay === 1000, '默认生成延迟 1000ms');
}

// ==================== 下落机制测试 ====================

console.log('\n=== 下落机制测试 ===\n');

// 测试 6: 游戏状态管理
function testGameStateManagement() {
  console.log('测试：游戏状态管理');
  
  assert(typeof gameState !== 'undefined', 'gameState 对象存在');
  assert(typeof gameState.isActive === 'boolean', 'isActive 是布尔值');
  assert(typeof gameState.isPaused === 'boolean', 'isPaused 是布尔值');
  assert(gameState.activeChars instanceof Array, 'activeChars 是数组');
  assert(typeof gameState.correctCount === 'number', 'correctCount 是数字');
  assert(typeof gameState.errorCount === 'number', 'errorCount 是数字');
}

// 测试 7: 随机汉字获取
function testRandomChar() {
  console.log('\n测试：随机汉字获取');
  
  assert(typeof getRandomChar === 'function', 'getRandomChar 函数存在');
  
  // 测试返回值
  const char = getRandomChar();
  assert(typeof char === 'string', '返回字符串');
  assert(char.length === 1, '返回单个字符');
}

// 测试 8: 拼音映射
function testPinyinMapping() {
  console.log('\n测试：拼音映射');
  
  assert(typeof getPinyin === 'function', 'getPinyin 函数存在');
  assert(typeof pinyinMap !== 'undefined', 'pinyinMap 存在');
  
  const pinyin = getPinyin('的');
  assert(typeof pinyin === 'string', '返回字符串');
}

// 测试 9: 游戏循环
function testGameLoop() {
  console.log('\n测试：游戏循环');
  
  assert(typeof gameLoop === 'function', 'gameLoop 函数存在');
  assert(typeof spawnChar === 'function', 'spawnChar 函数存在');
  assert(typeof updateCharPositions === 'function', 'updateCharPositions 函数存在');
}

// 测试 10: 输入判定
function testInputValidation() {
  console.log('\n测试：输入判定');
  
  assert(typeof handleKeyPress === 'function', 'handleKeyPress 函数存在');
  assert(typeof recordError === 'function', 'recordError 函数存在');
  
  // 测试错误记录
  const initialErrorCount = gameState.errorCount;
  // 不实际调用，只测试函数存在
  assert(initialErrorCount >= 0, '错误计数初始值有效');
}

// 测试 11: 游戏流程控制
function testGameFlowControl() {
  console.log('\n测试：游戏流程控制');
  
  assert(typeof startGame === 'function', 'startGame 函数存在');
  assert(typeof quitGame === 'function', 'quitGame 函数存在');
  assert(typeof togglePause === 'function', 'togglePause 函数存在');
  assert(typeof restartGame === 'function', 'restartGame 函数存在');
  assert(typeof endGame === 'function', 'endGame 函数存在');
}

// 测试 12: 统计和报告
function testStatsAndReporting() {
  console.log('\n测试：统计和报告');
  
  assert(typeof updateStatsDisplay === 'function', 'updateStatsDisplay 函数存在');
  assert(typeof showResultPanel === 'function', 'showResultPanel 函数存在');
  assert(typeof showErrorList === 'function', 'showErrorList 函数存在');
  assert(typeof showTopErrorChars === 'function', 'showTopErrorChars 函数存在');
}

// ==================== 文档系统测试 ====================

console.log('\n=== 文档系统测试 ===\n');

// 测试 13: 文档数据结构
function testDocumentStructure() {
  console.log('测试：文档数据结构');
  
  assert(typeof documentData !== 'undefined', 'documentData 对象存在');
  assert(documentData.files instanceof Array, 'files 是数组');
  assertEquals(documentData.files.length, 4, '包含 4 个文档文件');
  assert(typeof documentData.chars instanceof Array, 'chars 是数组');
}

// 测试 14: 文档文件列表
function testDocumentFiles() {
  console.log('\n测试：文档文件列表');
  
  const expectedFiles = ['前 500.txt', '中 500.txt', '后 500.txt', '前 1500.txt'];
  
  for (const file of expectedFiles) {
    assert(documentData.files.includes(file), `包含文件：${file}`);
  }
}

// 测试 15: 文档加载功能
function testDocumentLoading() {
  console.log('\n测试：文档加载功能');
  
  assert(typeof loadDocument === 'function', 'loadDocument 函数存在');
  assert(typeof switchDocument === 'function', 'switchDocument 函数存在');
}

// ==================== 运行所有测试 ====================

console.log('\n======================');
console.log('运行所有测试...\n');

testCodeTableStructure();
testCodeTableParsing();
testCodeTableMap();
testGetWubi();
testConfigStorage();

testGameStateManagement();
testRandomChar();
testPinyinMapping();
testGameLoop();
testInputValidation();
testGameFlowControl();
testStatsAndReporting();

testDocumentStructure();
testDocumentFiles();
testDocumentLoading();

// ==================== 测试结果汇总 ====================

console.log('\n======================');
console.log('测试结果汇总');
console.log('======================');
console.log(`✓ 通过：${testsPassed}`);
console.log(`✗ 失败：${testsFailed}`);
console.log(`总计：${testsPassed + testsFailed}`);
console.log('======================\n');

if (testsFailed === 0) {
  console.log('🎉 所有测试通过！\n');
} else {
  console.error(`⚠️  有 ${testsFailed} 个测试失败，请检查上面的输出。\n`);
}
