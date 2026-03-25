# Radical Typing Game Specification

## Purpose

This specification defines the core gameplay mechanics for the radical typing game, including multi-radical rendering and input validation.

## Requirements

### Requirement: 多字根同时掉落渲染
Canvas 画布 SHALL 同时渲染多个掉落字根，每个字根根据 `enableKeyHint` 配置决定是否在其下方显示键位提示。当 `enableKeyHint` 为 true 时，每个字根独立下落并显示对应的键位提示；当 `enableKeyHint` 为 false 时，字根正常下落但不显示键位提示元素。

#### Scenario: 游戏启动时多个字根同时显示
- **WHEN** 游戏开始
- **THEN** Canvas 画布上同时显示 3-5 个字根，每个字根位于不同的水平位置

#### Scenario: 字根独立下落
- **WHEN** 游戏进行中
- **THEN** 每个字根以各自的速度独立下落，互不干扰

#### Scenario: 字根到达底部后重置
- **WHEN** 某个字根下落到 Canvas 底部
- **THEN** 该字根重置到顶部随机位置，其他字根继续正常下落

#### Scenario: 多字根渲染性能
- **WHEN** Canvas 上有 5 个字根同时下落
- **THEN** 使用 requestAnimationFrame 实现流畅动画，帧率保持 60fps

#### Scenario: 启用键位提示时的渲染
- **WHEN** `enableKeyHint` 配置为 true
- **THEN** Canvas 上每个掉落字根下方显示对应的键位提示文字

#### Scenario: 禁用键位提示时的渲染
- **WHEN** `enableKeyHint` 配置为 false
- **THEN** Canvas 上只渲染字根图片，不显示任何键位提示文字

#### Scenario: 配置切换时的实时渲染更新
- **WHEN** 游戏进行中用户切换 `enableKeyHint` 配置
- **THEN** 所有当前活跃字根立即根据新配置显示或隐藏键位提示，无需重新开始游戏

### Requirement: 多目标输入判定
系统 SHALL 支持对 Canvas 上多个掉落字根进行输入判定，用户输入匹配任何活跃字根的拼音均视为正确。

#### Scenario: 匹配当前任意字根
- **WHEN** Canvas 上有多个字根，用户输入匹配其中任意一个字根的拼音
- **THEN** 系统判定为正确输入，播放正确音效，该字根重置到顶部

#### Scenario: 不匹配任何字根
- **WHEN** 用户输入的拼音与 Canvas 上所有字根都不匹配
- **THEN** 系统判定为错误输入，播放错误音效，字根位置不变

#### Scenario: 多个字根具有相同拼音
- **WHEN** Canvas 上有多个字根具有相同拼音，用户输入该拼音
- **THEN** 系统判定最先下落（最接近底部）的字根为正确匹配

### Requirement: 字根掉落控制
系统 SHALL 控制字根从页面顶部随机位置向下掉落，同时存在的字根数量不超过配置的最大值（默认 5 个）。

#### Scenario: 字根生成
- **WHEN** 游戏开始且当前活跃字根数小于最大值
- **THEN** 系统在顶部随机位置生成新字根，字根内容从练习数据池中随机选取

#### Scenario: 字根下落
- **WHEN** 字根处于活跃状态
- **THEN** 字根以固定速度垂直向下移动

#### Scenario: 限制同时掉落数量
- **WHEN** 当前活跃字根数达到最大值（5 个）
- **THEN** 系统暂停生成新字根，直到有字根被消除

### Requirement: 键盘输入判定
系统 SHALL 实时监听键盘输入，判定输入键位是否与当前活跃字根的键位匹配。

#### Scenario: 正确输入
- **WHEN** 用户按下与某个活跃字根匹配的键位
- **THEN** 系统消除该字根，增加正确计数，播放消除动画

#### Scenario: 错误输入
- **WHEN** 用户按下的键位不匹配任何活跃字根
- **THEN** 系统记录错误事件，包含错误时间和当前活跃字根信息

#### Scenario: 无目标时输入
- **WHEN** 没有活跃字根时用户输入
- **THEN** 系统忽略输入，不记录错误

### Requirement: 游戏配置参数
系统 SHALL 提供可配置的游戏参数，包括下落速度、生成延迟、最大同时掉落字根数、游戏时长。

#### Scenario: 下落速度配置
- **WHEN** 游戏初始化时
- **THEN** 系统使用配置的 `fallSpeed` 值（默认 2 像素/帧）控制字根下落速度

#### Scenario: 生成延迟配置
- **WHEN** 字根生成间隔到达
- **THEN** 系统根据配置的 `spawnDelay` 值（默认 1000 毫秒）生成新字根

#### Scenario: 游戏时长配置
- **WHEN** 游戏开始时
- **THEN** 系统使用配置的 `duration` 值（默认 180000 毫秒）作为游戏总时长

#### Scenario: 参数验证
- **WHEN** 配置参数超出有效范围
- **THEN** 系统使用默认值并记录警告

#### Scenario: 配置持久化
- **WHEN** 用户修改配置并开始游戏
- **THEN** 系统将配置保存到 localStorage，下次打开时自动加载

### Requirement: 游戏时间控制
系统 SHALL 在固定时长（默认 3 分钟）内运行游戏，时间结束后自动停止。

#### Scenario: 游戏开始计时
- **WHEN** 用户点击开始按钮
- **THEN** 系统记录开始时间，启动倒计时显示

#### Scenario: 时间结束
- **WHEN** 游戏运行时长达到设定值（180 秒）
- **THEN** 系统停止字根掉落，清除所有活跃字根，触发游戏结束流程

#### Scenario: 暂停/继续
- **WHEN** 用户点击暂停按钮
- **THEN** 系统暂停计时和动画，再次点击继续时恢复
