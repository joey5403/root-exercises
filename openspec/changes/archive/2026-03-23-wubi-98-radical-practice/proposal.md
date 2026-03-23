## Why

五笔 98 输入法学习者需要高效记忆字根，但传统背诵方式枯燥且缺乏反馈。本工具通过交互式练习帮助用户快速掌握字根分布，并使用本地存储记录学习进度和错误统计，实现个性化复习。

## What Changes

- 新增交互式五笔 98 字根练习界面
- 支持从"字根"文件夹加载字根图片进行练习
- 使用浏览器本地存储记录错误次数和学习统计
- 提供正确率、错误分布等数据分析

## Capabilities

### New Capabilities

- `radical-practice`: 字根练习核心功能，支持随机显示字根、用户输入键位、判断正误
- `progress-tracking`: 学习进度追踪，记录每个字根的错误次数、练习时间、正确率
- `statistics-dashboard`: 统计面板，展示总体正确率、错误最多的字根、学习时长等
- `image-management`: 字根图片管理，从本地文件夹加载和映射字根与键位关系

### Modified Capabilities

- (无)

## Impact

- 前端：HTML/CSS/JavaScript单页应用
- 存储：浏览器 localStorage API
- 资源：依赖"字根"文件夹中的 JPG 图片文件
- 无后端依赖，纯前端实现
