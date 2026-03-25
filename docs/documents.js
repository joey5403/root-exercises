// 文档系统 - 文档加载和切换

const documents = {
  files: ['前500.txt', '中500.txt', '后500.txt', '前1500.txt'],
  currentFile: '前500.txt',
  content: new Map()
};

// 初始化
document.addEventListener('DOMContentLoaded', init);

function init() {
  setupTabListeners();
  loadDocument('前500.txt');
  
  document.getElementById('backToGameBtn')?.addEventListener('click', () => {
    window.location.href = 'code-game.html';
  });
}

// 设置标签页监听
function setupTabListeners() {
  const tabs = document.querySelectorAll('.document-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const file = tab.dataset.file;
      if (file && file !== documents.currentFile) {
        // 更新标签页状态
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 加载文档
        loadDocument(file);
      }
    });
  });
}

// 加载文档
async function loadDocument(filename) {
  documents.currentFile = filename;
  
  // 检查是否已缓存
  if (documents.content.has(filename)) {
    displayDocument(filename);
    return;
  }
  
  try {
    const encodedFilename = encodeURIComponent(filename);
    const response = await fetch(`assets/document/${encodedFilename}`);
    const text = await response.text();
    documents.content.set(filename, text);
    displayDocument(filename);
  } catch (e) {
    console.error('加载文档失败', e);
    document.getElementById('documentContent').innerHTML = 
      '<p class="error">加载文档失败，请稍后重试</p>';
  }
}

// 显示文档
function displayDocument(filename) {
  const content = documents.content.get(filename);
  if (!content) return;
  
  // 更新标题
  const title = filename.replace('.txt', '');
  document.getElementById('documentTitle').textContent = title;
  
  // 更新汉字数量
  const charCount = content.trim().length;
  document.getElementById('charCount').textContent = charCount;
  
  // 显示内容
  const contentEl = document.getElementById('documentContent');
  if (contentEl) {
    // 将汉字分组显示，每行 50 个
    const chars = content.trim().split('');
    const lines = [];
    for (let i = 0; i < chars.length; i += 50) {
      lines.push(chars.slice(i, i + 50).join(''));
    }
    contentEl.innerHTML = lines.map(line => 
      `<div class="doc-line">${line}</div>`
    ).join('');
  }
}
