## Why

当前字根掉落游戏缺乏即时听觉反馈，用户需要等待游戏结束才能了解整体表现。添加音效反馈可以增强游戏沉浸感，提升用户体验。同时优化掉落逻辑以支持多字根同时显示，增加游戏挑战性。

## What Changes

- 添加正确/错误音效反馈：用户输入正确键位时播放成功音效，输入错误时播放失败音效
- 优化掉落逻辑：Canvas 画布同时渲染多个掉落字根，而非单字根轮流显示
- 音效资源管理：引入轻量级音效文件（mp3 格式），通过 Web Audio API 或 HTML5 Audio 播放
- 音量控制选项：游戏设置面板新增音量调节滑块，支持静音切换
- 多字根渲染性能优化：使用 Canvas requestAnimationFrame 实现流畅动画

## Capabilities

### New Capabilities
- `sound-feedback`: 游戏音效反馈系统，包括正确/错误音效播放、音量控制、音频资源管理

### Modified Capabilities
- `radical-typing-game`: 掉落逻辑从单字根改为多字根同时渲染，输入判定逻辑需适配 Canvas 多目标检测

## Impact

- 新增音效文件：`assets/sounds/correct.mp3`、`assets/sounds/incorrect.mp3`
- 修改 `game.js`：掉落逻辑、Canvas 渲染逻辑、音效播放逻辑
- 游戏设置面板新增音量控制 UI
- 移动端浏览器需处理音频自动播放策略限制
