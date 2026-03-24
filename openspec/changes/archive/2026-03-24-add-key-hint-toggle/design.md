## Context

当前字根打字游戏的键位提示（key hint）始终显示在字根图片下方，用户无法关闭该提示。部分进阶用户希望专注于字根形状识别而非依赖键位提示。需要在不破坏现有功能的前提下，添加可配置的键位提示开关能力。

技术约束：
- 配置需持久化到 localStorage
- 默认值为 false（键位提示默认隐藏）
- 修改涉及 `docs/game.js` 和 `docs/index.html` 两个文件

## Goals / Non-Goals

**Goals:**
- 添加 `enableKeyHint` 配置项控制键位提示显示/隐藏
- 配置面板新增开关 UI 控件
- 配置持久化到 localStorage
- 字根渲染逻辑响应配置状态

**Non-Goals:**
- 不修改游戏核心逻辑（计时、得分等）
- 不添加其他提示类型（如拼音提示、部首提示）
- 不修改现有用户的默认体验（新用户默认隐藏键位提示）

## Decisions

### 1. 配置默认值为 false

**Decision:** `enableKeyHint` 默认值为 false，键位提示默认隐藏。

**Rationale:** 
- 鼓励用户专注于字根形状识别，符合进阶学习需求
- 用户可通过配置面板主动开启提示，保持可控性
- 符合"少即是多"的设计原则，界面更简洁

**Alternatives Considered:**
- 默认值为 true：保持现有体验，但违背功能初衷（让用户主动选择是否显示）
- 首次使用时询问：增加交互复杂度，可能打扰用户

### 2. 配置存储使用 localStorage

**Decision:** 使用 localStorage 存储用户配置选择。

**Rationale:**
- 与现有配置存储方式一致（`docs/game.js` 已使用 localStorage）
- 无需后端支持，实现简单
- 配置即时生效，无需刷新页面

**Alternatives Considered:**
- 使用 sessionStorage：标签页关闭后丢失，体验不佳
- 使用 Cookie：增加 HTTP 请求开销，不必要
- 使用后端存储：增加复杂度，配置无需跨设备同步

### 3. 配置面板 UI 使用 Toggle Switch

**Decision:** 在配置面板中使用 Toggle Switch 控件作为开关 UI。

**Rationale:**
- Toggle Switch 直观表达"开/关"状态
- 与现有配置项 UI 风格一致
- 移动端和桌面端体验良好

**Alternatives Considered:**
- 使用 Checkbox：视觉表达不如 Toggle Switch 清晰
- 使用下拉选择（显示/隐藏）：操作步数更多

### 4. 条件渲染在字根渲染函数中处理

**Decision:** 在 `docs/game.js` 的字根渲染函数中通过条件判断是否渲染键位提示元素。

**Rationale:**
- 逻辑集中，易于维护
- 避免额外的 DOM 操作，性能更优
- 代码改动最小化

**Alternatives Considered:**
- 使用 CSS 控制显示/隐藏：仍会渲染 DOM 元素，占用内存
- 提取为独立函数：增加调用开销，逻辑分散

## Risks / Trade-offs

**[Risk] 老用户升级后键位提示突然隐藏，可能造成困惑** → Mitigation: 在 CHANGELOG 中明确说明此 breaking change，提供开启提示的指引

**[Risk] 新用户不知道可以开启键位提示** → Mitigation: 配置面板中提供清晰的标签说明，如"显示键位提示（初学者建议开启）"

**[Trade-off] 默认隐藏键位提示可能增加初学者的学习难度** → 接受此 trade-off，因为初学者可主动开启提示，而进阶用户获得了更简洁的界面

**[Risk] localStorage 在某些浏览器隐私模式下不可用** → Mitigation: 添加 try-catch 容错处理，降级为内存存储

## Migration Plan

### 部署步骤
1. 修改 `docs/game.js`：
   - 在 `gameConfig` 中添加 `enableKeyHint: false`
   - 在字根渲染函数中添加条件判断
   - 确保配置保存逻辑包含新字段
2. 修改 `docs/index.html`：
   - 在配置面板中添加 Toggle Switch 控件
   - 绑定事件监听器更新配置
3. 测试验证：
   - 开关功能正常
   - 配置持久化生效
   - 页面刷新后配置保持

### 回滚策略
- Git revert 恢复到上一版本
- 前端代码无数据库变更，回滚无数据风险

## Open Questions

- 是否需要在后续版本中添加"首次使用引导"，提示用户可以开启键位提示？
- 是否需要针对不同学习阶段推荐不同的默认配置？
