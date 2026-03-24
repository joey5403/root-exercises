## Why

当前字根打字游戏的键位提示（key hint）始终显示在字根图片下方，部分用户希望专注于字根形状识别而非依赖键位提示。本功能添加一个开关配置，允许用户控制键位提示的显示/隐藏，提供更灵活的学习模式。

## What Changes

- 新增配置项 `enableKeyHint`（默认为 false）用于控制键位提示的显示/隐藏
- 配置面板新增键位提示开关 UI 控件
- 字根渲染逻辑根据配置条件渲染键位提示元素
- 配置持久化保存到 localStorage

## Capabilities

### New Capabilities

- `key-hint-toggle`: 字根键位提示显示/隐藏的配置控制能力

### Modified Capabilities

- `radical-typing-game`: 字根渲染逻辑新增对键位提示开关的响应

## Impact

- 修改 `docs/game.js` 中的配置结构 `gameConfig` 和字根渲染函数
- 修改 `docs/index.html` 添加配置开关 UI
- 现有游戏逻辑不受影响，默认显示键位提示保持向后兼容
