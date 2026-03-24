## Context

当前字根掉落游戏使用 Canvas 渲染，但仅支持单字根轮流显示，缺乏即时听觉反馈。用户在游戏过程中无法通过声音立即得知输入是否正确，需要等待游戏结束才能了解整体表现。

技术现状：
- Canvas 渲染循环已使用 requestAnimationFrame
- 掉落逻辑为单字根队列式显示
- 无音频资源管理系统
- 游戏设置面板已存在，可扩展音量控制 UI

约束条件：
- 音效文件需保持轻量（每个 < 100KB）以避免加载延迟
- 需兼容移动端浏览器的音频自动播放策略限制
- Canvas 多字根渲染需保持 60fps 流畅度
- 不引入外部音频库，使用原生 Web Audio API 或 HTML5 Audio

## Goals / Non-Goals

**Goals:**
- 实现即时音效反馈：正确输入播放成功音效，错误输入播放失败音效
- Canvas 同时渲染多个掉落字根（默认 3-5 个），提升游戏挑战性
- 音量控制功能：支持 0-100% 调节和静音切换
- 音频资源预加载管理，避免首次播放延迟
- 多字根输入判定逻辑适配，支持 Canvas 坐标碰撞检测

**Non-Goals:**
- 不支持自定义音效上传功能
- 不添加背景音乐（BGM）
- 不改变现有游戏计分规则
- 不支持音效播放速度/音调调节

## Decisions

### 1. 音频播放方案：HTML5 Audio vs Web Audio API

**选择：HTML5 Audio**

理由：
- 音效场景简单（仅正确/错误两种），无需 Web Audio API 的复杂音频图处理能力
- HTML5 Audio API 更简洁，代码量减少约 60%
- 移动端兼容性更好，处理自动播放策略更直接
- 性能开销更低，符合轻量级需求

替代方案：
- Web Audio API：适合需要音频混音、均衡器、动态效果的复杂场景，但本需求过度设计

### 2. 多字根数量策略

**选择：动态数量（3-5 个），根据游戏难度递增**

理由：
- 初始 3 个字根降低新手门槛
- 随分数提升逐步增加到 5 个，增加挑战性
- 固定上限 5 个避免 Canvas 渲染性能下降和视觉混乱

替代方案：
- 固定数量：实现简单但缺乏成长性
- 完全动态（无上限）：可能导致性能问题和用户体验下降

### 3. 音效触发时机

**选择：输入判定后立即触发，与视觉反馈同步**

理由：
- 即时反馈强化学习闭环
- 与 Canvas 视觉高亮动画同步（同一 requestAnimationFrame 周期）
- 避免延迟导致的音画不同步

### 4. 音频资源管理

**选择：AudioManager 单例模式，游戏初始化时预加载**

实现方式：
```javascript
class AudioManager {
  constructor() {
    this.sounds = {
      correct: new Audio('/assets/sounds/correct.mp3'),
      incorrect: new Audio('/assets/sounds/incorrect.mp3')
    };
    this.volume = 1.0;
  }
  play(name) { /* ... */ }
  setVolume(level) { /* ... */ }
}
```

理由：
- 预加载消除首次播放延迟
- 单例模式避免重复实例化开销
- 集中管理音量状态

### 5. 多字根输入判定算法

**选择：Canvas 坐标矩形碰撞检测**

实现方式：
- 每个掉落字根维护 bounding box（x, y, width, height）
- 用户输入时遍历所有活跃字根，检测输入键位对应区域
- 命中后触发音效并移除该字根

理由：
- 矩形检测计算量小，性能优于圆形或多边形检测
- 适配 Canvas 2D 渲染坐标系
- 支持多个字根同时命中的场景

## Risks / Trade-offs

**[风险] 移动端浏览器音频自动播放限制**
→  mitigation：在用户首次交互（点击/触摸）后初始化 Audio 对象，游戏开始按钮作为音频上下文激活点

**[风险] 多字根渲染性能下降**
→ mitigation：限制最大字根数量为 5，使用 requestAnimationFrame 统一渲染循环，避免频繁 DOM 操作

**[风险] 音效文件加载失败**
→ mitigation：添加加载错误处理，静音降级不影响游戏核心功能

**[风险] 音效播放延迟影响体验**
→ mitigation：预加载所有音效，使用 Audio.cloneNode() 支持重叠播放

**[权衡] HTML5 Audio 不支持高级音频处理**
→ 接受：当前需求无需混音/均衡器功能，未来需要时可升级 Web Audio API

**[权衡] 矩形碰撞检测精度有限**
→ 接受：字根为方块状视觉元素，矩形检测足够精确，且性能优于像素级检测

## Migration Plan

### 部署步骤

1. **音频资源准备**
   - 制作 correct.mp3 和 incorrect.mp3（< 100KB/个）
   - 放置于 `assets/sounds/` 目录

2. **代码实现**
   - 创建 `AudioManager` 类（`src/audio/AudioManager.js`）
   - 修改 `game.js` 掉落逻辑支持多字根数组
   - 实现 Canvas 多目标渲染循环
   - 添加输入判定碰撞检测
   - 扩展游戏设置面板音量控制 UI

3. **测试验证**
   - 红/绿 TDD：先写 AudioManager 单元测试
   - Canvas 渲染性能测试（目标 60fps）
   - 移动端音频自动播放策略验证

4. **发布**
   - 合并至主分支
   - 验证生产环境音频资源 CDN 加载

### 回滚策略

- 功能开关控制：`config.enableSoundEffects` 和 `config.enableMultiRadical`
- 紧急情况下通过配置关闭新功能，无需代码回滚
- 音频资源可独立于代码回滚

## Open Questions

1. 音效文件具体音色风格待定（电子音/自然音？）
2. 多字根初始数量是否需要难度设置选项？
3. 是否需要音效开关（独立于音量控制）？
