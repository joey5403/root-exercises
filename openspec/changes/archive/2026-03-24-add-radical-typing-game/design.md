## Context

现有练习工具采用静态展示模式，用户被动记忆字根。需要引入游戏化机制提升练习趣味性和效率。

**技术约束：**
- 纯前端实现，无需后端服务
- 复用现有 `radicals` 数据结构和 `localStorage` 存储方案
- 保持与现有 `app.js` 代码风格一致
- 游戏时长：3 分钟（180 秒），最大同时掉落字根数：默认 5 个
- 下落速度：默认 2 像素/帧（可配置）
- 生成延迟：默认 1000 毫秒（可配置）
- 字根显示：使用 `data.js` 中定义的图片路径（`radical.image` 字段）

## Goals / Non-Goals

**Goals:**
- 实现字根掉落动画效果（从顶部随机位置下落）
- 实时键盘输入判定，命中时消除字根并计分
- 记录错误输入（拼错/漏掉）并在游戏结束后展示
- 游戏结束显示统计报告：正确率、错误字根列表、评分
- 支持暂停/继续功能
- 游戏开始前可自定义配置（时长、速度、延迟），配置保存到 localStorage

**Non-Goals:**
- 不包含排行榜功能（需后端支持）
- 不支持多人对战模式
- 不实现连击奖励机制（首期简化实现）

## Decisions

### 1. 渲染方案：Canvas vs DOM 动画
**决策：** 使用 DOM 元素 + CSS 动画

**理由：**
- 项目已有 DOM 操作基础架构（`app.js`）
- 字根数量有限（≤5 个同时显示），性能开销可接受
- CSS `requestAnimationFrame` 足够实现流畅动画
- 便于样式定制和响应式布局

### 2. 游戏循环实现
**决策：** 使用 `requestAnimationFrame` + 时间戳增量更新

**理由：**
- 比 `setInterval` 更精确，避免时间漂移
- 浏览器自动优化性能（后台时暂停）
- 与现有 `app.js` 的 `updateTimer()` 风格一致

### 3. 碰撞检测简化
**决策：** 不使用物理碰撞检测，使用固定游戏时长 + 底部边界判定

**理由：**
- 降低实现复杂度
- 用户只需在字根落地前输入，无需精确碰撞计算
- 字根触底时触发错误判定

### 4. 数据结构设计
**决策：** 扩展 `state` 对象，新增 `gameState` 字段

```javascript
state.gameState = {
  isActive: false,
  startTime: null,
  endTime: null,
  duration: 180000,  // 3 分钟
  maxRadicals: 5,
  activeRadicals: [],     // 当前掉落的字根
  correctCount: 0,
  errorLog: []            // 错误记录：{radical, expectedKey, time}
};
```

### 5. 错误追踪策略
**决策：** 记录两类错误
- **拼错错误：** 用户输入错误键位时，记录当前所有 activeRadicals
- **漏掉错误：** 字根触底时，记录该字根

### 6. 游戏配置参数
**决策：** 使用可配置参数对象管理游戏难度

```javascript
const gameConfig = {
  duration: 180000,        // 游戏时长（毫秒）
  maxRadicals: 5,          // 最大同时掉落数
  fallSpeed: 2,            // 下落速度（像素/帧）
  spawnDelay: 1000,        // 新字根生成延迟（毫秒）
  radicalSize: { width: 60, height: 60 }  // 字根图片尺寸
};
```

**理由：**
- 便于后续扩展难度等级（简单/中等/困难）
- 用户可在游戏前自定义参数
- 参数集中管理，便于调整平衡性

### 7. 字根图片渲染
**决策：** 使用 `radicals` 数组中的 `image` 字段路径渲染字根图片

**理由：**
- 确保字型显示正确（五笔字根包含特殊字形）
- 与现有练习工具保持视觉一致性
- 复用已有图片资源，无需新增素材

### 8. 配置持久化
**决策：** 使用 localStorage 保存用户配置，key 为 `wubi98_game_config`

**理由：**
- 用户无需每次游戏都重新设置
- 纯前端实现，无需后端
- 配置数据结构简单，适合 localStorage

## Risks / Trade-offs

**[性能风险] DOM 元素频繁创建/销毁可能影响性能**
→ Mitigation: 使用对象池复用字根元素，限制最大同时显示数量

**[输入延迟] 快速输入时键盘事件可能丢失**
→ Mitigation: 使用 `keydown` 而非 `keypress`，增加防抖逻辑

**[动画卡顿] 低性能设备可能掉帧**
→ Mitigation: 根据 `requestAnimationFrame` 回调间隔动态调整下落速度

**[代码复用] 与 `app.js` 存在重复逻辑（如键位判定）**
→ Mitigation: 抽取公共函数到 `utils.js`（二期优化）

## Open Questions

1. 是否需要音效反馈？（首期不实现）
2. 是否需要难度分级（不同下落速度）？（首期固定速度）
3. 是否需要支持触屏输入？（首期仅支持键盘）
