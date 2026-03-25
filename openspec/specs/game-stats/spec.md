# Game Stats Specification

## Purpose

This specification defines the game statistics tracking and reporting features for the radical typing game.

## Requirements

### Requirement: 游戏过程统计
系统 SHALL 在游戏过程中实时记录统计数据。

#### Scenario: 正确计数
- **WHEN** 用户正确输入活跃字根的键位
- **THEN** 系统增加正确计数，记录该次正确输入的时间和字根信息

#### Scenario: 错误记录
- **WHEN** 用户输入错误键位或字根触底
- **THEN** 系统记录错误事件，包含错误类型、时间、相关字根和期望键位

#### Scenario: 会话追踪
- **WHEN** 游戏开始
- **THEN** 系统创建会话记录，包含开始时间、难度设置、字根池信息

### Requirement: 游戏结束报告
系统 SHALL 在游戏结束后展示详细的统计报告。

#### Scenario: 报告触发
- **WHEN** 游戏时间结束
- **THEN** 系统停止所有游戏逻辑，生成统计报告并显示在结果面板

#### Scenario: 正确率计算
- **WHEN** 生成报告时
- **THEN** 系统计算并显示正确率 = 正确数 / (正确数 + 错误数) × 100%

#### Scenario: 错误列表展示
- **WHEN** 存在错误记录
- **THEN** 系统以表格形式展示错误列表，包含字根、期望键位、错误类型、发生时间

#### Scenario: 评分计算
- **WHEN** 生成报告时
- **THEN** 系统根据正确率计算评分（A: ≥90%, B: ≥80%, C: ≥70%, D: ≥60%, F: <60%）

#### Scenario: 历史数据保存
- **WHEN** 游戏结束
- **THEN** 系统将本局统计数据保存到 localStorage，与现有统计数据合并

### Requirement: 统计分析
系统 SHALL 提供简单的数据分析功能。

#### Scenario: 最常错字根
- **WHEN** 生成报告且存在错误记录
- **THEN** 系统统计并显示错误次数最多的前 3 个字根

#### Scenario: 会话对比
- **WHEN** 用户有多局游戏记录
- **THEN** 系统显示最近 5 局的平均正确率趋势
