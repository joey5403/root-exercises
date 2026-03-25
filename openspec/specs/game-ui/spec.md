# Game UI Specification

## Purpose

This specification defines the user interface components and rendering for the radical typing game.

## Requirements

### Requirement: 游戏画布渲染
系统 SHALL 提供游戏区域画布，用于显示掉落的字根元素。

#### Scenario: 游戏区域初始化
- **WHEN** 用户进入游戏页面
- **THEN** 系统渲染固定尺寸的游戏画布区域，设置合适的背景色

#### Scenario: 字根元素渲染
- **WHEN** 新字根生成
- **THEN** 系统在画布顶部随机水平位置创建字根元素，显示字根字符和对应键位

#### Scenario: 字根位置更新
- **WHEN** 字根下落过程中
- **THEN** 系统每帧更新字根元素的垂直位置，保持流畅动画

### Requirement: 字根显示样式
系统 SHALL 为活跃字根提供清晰的视觉样式，确保用户可快速识别。

#### Scenario: 字根图片渲染
- **WHEN** 新字根生成
- **THEN** 系统使用 `radicals` 数组中对应字根的 `image` 字段路径渲染图片，确保字型正确

#### Scenario: 键位提示
- **WHEN** 字根图片显示在游戏区域
- **THEN** 系统在图片下方或旁边显示对应键位（较小字体），使用对比色

#### Scenario: 字根外观
- **WHEN** 字根显示在游戏区域
- **THEN** 字根元素显示字根字符（较大字体）和键位提示（较小字体），使用对比色

#### Scenario: 消除动画
- **WHEN** 用户正确输入字根键位
- **THEN** 字根元素播放缩放淡出动画后移除

#### Scenario: 触底效果
- **WHEN** 字根到达底部边界
- **THEN** 字根元素变红并停留短暂时间后移除

### Requirement: 进度显示
系统 SHALL 实时显示游戏进度信息。

#### Scenario: 倒计时显示
- **WHEN** 游戏进行中
- **THEN** 系统在页面固定位置显示剩余时间（分：秒格式）

#### Scenario: 分数显示
- **WHEN** 用户正确输入键位
- **THEN** 系统更新并显示当前正确计数

#### Scenario: 活跃字根数显示
- **WHEN** 游戏进行中
- **THEN** 系统显示当前活跃字根数量（格式：当前/最大）

### Requirement: 配置面板
系统 SHALL 在游戏开始前提供配置面板，允许用户自定义游戏参数。

#### Scenario: 配置表单显示
- **WHEN** 用户进入游戏页面
- **THEN** 系统显示配置面板，包含时长、最大字根数、下落速度、生成延迟输入框

#### Scenario: 配置值范围限制
- **WHEN** 用户输入配置值
- **THEN** 系统限制输入范围：时长 1-30 分钟、最大字根数 1-10、速度 1-10、延迟 500-5000ms

#### Scenario: 配置保存
- **WHEN** 用户点击开始游戏
- **THEN** 系统保存用户配置到 localStorage，下次打开时自动加载

#### Scenario: 恢复默认配置
- **WHEN** 用户点击"恢复默认"按钮
- **THEN** 系统重置所有配置为默认值并保存到 localStorage
