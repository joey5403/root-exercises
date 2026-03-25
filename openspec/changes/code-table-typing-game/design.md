## Context

当前字根打字游戏使用随机字根选择机制，用户无法系统地练习单个汉字的字根拆分。需要创建一个**新游戏**实现单字下落机制，并增加码表管理和文档系统功能。

**重要**: 这是一个新游戏，不修改现有的 `game.js` 和 `game.html` 文件。

现有文件结构：
- 码表文件：`docs/assets/code/wb98.txt`（UTF-16 编码，二里头/夏朝文字编码格式）
- 文档文件：`docs/assets/document/` 目录下 4 个文件（前 500.txt, 中 500.txt, 后 500.txt, 前 1500.txt）

新游戏文件结构：
- `code-game.html`: 新游戏页面
- `code-game.js`: 新游戏核心逻辑
- `code-game.css`: 新游戏样式（可选，或复用现有样式）

## Goals / Non-Goals

**Goals:**
- 创建新游戏实现随机单字下落机制
- 支持默认码表（docs/assets/code/wb98.txt）加载
- 支持用户上传自定义码表
- 复用现有 4 个文档文件，支持切换查看
- 保持 60fps 流畅动画
- **新建文件**: `code-game.html`, `code-game.js`，不修改现有 `game.html`, `game.js`

**Non-Goals:**
- 不修改现有字根打字游戏
- 不修改现有音效系统
- 不修改分数计算逻辑
- 不添加多人游戏功能
- 不修改 UI 主题系统

## Decisions

### 码表格式设计
**Decision:** 使用 UTF-16 编码格式，与现有 wb98.txt 文件兼容

**Rationale:** 
- 与现有码表文件兼容，无需转换
- 支持大量汉字字符
- 可使用现有解析逻辑

**Alternatives Considered:**
- UTF-8 文本格式：需要转换现有码表文件
- JSON 格式：过于复杂，不适合大量码表数据

### 下落机制实现
**Decision:** 使用 Canvas + requestAnimationFrame 实现单字下落动画

**Rationale:**
- Canvas 提供高性能 2D 渲染
- requestAnimationFrame 保证 60fps 流畅动画
- 与现有渲染架构兼容

**Alternatives Considered:**
- CSS Animation：难以实现复杂的碰撞检测和输入判定
- SVG：性能不如 Canvas，尤其是频繁重绘场景

### 文档系统设计
**Decision:** 复用现有 4 个文档文件（前 500.txt, 中 500.txt, 后 500.txt, 前 1500.txt），纯文本格式存储汉字列表

**Rationale:**
- 文件已存在，无需重新创建
- 纯文本格式简单易用
- 可直接从文件中随机选择汉字用于游戏

**Alternatives Considered:**
- 重新创建 Markdown 文档：增加不必要的工作量
- JSON 格式：不必要地增加复杂度

### 正确历史显示设计
**Decision:** 在游戏区域下方添加固定面板，显示当前输入和已正确汉字历史

**Rationale:**
- 提供实时反馈，用户知道正在输入什么
- 记录正确汉字帮助建立成就感
- 便于复习和查看练习进度

**Alternatives Considered:**
- 仅在结果面板显示：无法提供实时反馈
- 使用模态框显示：干扰游戏体验

## Risks / Trade-offs

**[Risk] 码表文件过大影响加载性能** → Mitigation: 实现懒加载或分页加载机制

**[Risk] 自定义码表格式验证不严格导致解析错误** → Mitigation: 实现严格的格式验证和错误提示

**[Risk] Canvas 渲染在低端设备上性能不足** → Mitigation: 提供性能降级选项，降低渲染频率

**[Trade-off] 单字下落 vs 多字下落** → 单字下落更专注练习，但可能降低游戏趣味性

**[Trade-off] Markdown 解析依赖第三方库** → 增加依赖但获得更好的文档编辑体验

## Open Questions

- 是否需要支持码表的增量更新？
- 文档系统是否需要搜索功能？
- 是否需要支持多种码表格式（如五笔 86、郑码等）？
