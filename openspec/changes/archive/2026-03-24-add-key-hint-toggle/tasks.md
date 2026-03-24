## 1. 配置结构修改

- [x] 1.1 在 `docs/game.js` 的 `gameConfig` 中添加 `enableKeyHint: false` 配置项
- [x] 1.2 确保配置加载逻辑从 localStorage 读取 `enableKeyHint` 值
- [x] 1.3 确保配置保存逻辑将 `enableKeyHint` 写入 localStorage

## 2. 字根渲染逻辑修改

- [x] 2.1 在字根渲染函数中添加条件判断，根据 `enableKeyHint` 决定是否渲染键位提示
- [x] 2.2 确保 Canvas 渲染时根据配置动态显示/隐藏键位提示文字
- [x] 2.3 验证配置切换时活跃字根立即更新渲染状态

## 3. 配置面板 UI 开发

- [x] 3.1 在 `docs/index.html` 配置面板中添加 Toggle Switch 控件
- [x] 3.2 为 Toggle Switch 添加清晰标签（如"显示键位提示（初学者建议开启）"）
- [x] 3.3 绑定事件监听器，切换时更新 `enableKeyHint` 配置

## 4. 测试与验证

- [x] 4.1 测试首次访问时键位提示默认隐藏
- [x] 4.2 测试开关切换功能正常，配置即时生效
- [x] 4.3 测试页面刷新后配置保持
- [x] 4.4 测试游戏进行中切换配置，活跃字根立即响应
