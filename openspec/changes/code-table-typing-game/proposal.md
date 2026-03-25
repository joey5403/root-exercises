## Why

字根打字游戏需要重构以提供更好的学习体验。当前的随机字根选择机制不够直观，用户无法系统地练习单个汉字的字根拆分。

## What Changes

- 默认码表文件位于 `docs/assets/code/wb98.txt`（UTF-16 编码格式）
- 支持用户上传自定义码表文件（相同格式）
- 文档文件存放在 `docs/assets/document/` 目录（共 4 个文件：前 500.txt, 中 500.txt, 后 500.txt, 前 1500.txt）
- **BREAKING**: 从随机字根选择改为随机单字下落机制
- 随机汉字从 4 个文档文件中取出

## Capabilities

### New Capabilities
- `code-table`: 码表管理功能，包括默认码表加载和自定义码表上传
- `falling-character`: 单字下落游戏机制，随机汉字从屏幕上方下落
- `document-system`: 文档管理系统，支持 4 个文档文件的存储和切换
- `correct-history`: 正确汉字历史记录显示功能，展示用户已正确输入的所有汉字

### Modified Capabilities

## Impact

- 现有游戏逻辑需要重构为下落机制
- 新增文件上传功能
- 码表格式使用 UTF-16 编码与现有 wb98.txt 兼容
- 文档系统复用现有 4 个文件，支持切换查看
- 新增正确汉字显示区域，记录用户已正确输入的所有汉字
