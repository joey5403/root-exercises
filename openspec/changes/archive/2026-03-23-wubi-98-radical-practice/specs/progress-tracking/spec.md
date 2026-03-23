## ADDED Requirements

### Requirement: 错误次数记录

系统应为每个字根记录用户的错误次数和正确次数。

#### Scenario: 记录错误答案
- **WHEN** 用户输入错误答案
- **THEN** 该字根的错误次数加 1

#### Scenario: 记录正确答案
- **WHEN** 用户输入正确答案
- **THEN** 该字根的正确次数加 1

#### Scenario: 记录练习时间
- **WHEN** 用户完成一次练习
- **THEN** 系统记录该字根的最后练习时间戳

#### Scenario: 数据持久化
- **WHEN** 用户关闭浏览器后重新打开
- **THEN** 系统从 localStorage 恢复之前的统计数据

### Requirement: 练习历史追踪

系统应记录用户的总体练习历史。

#### Scenario: 记录总练习次数
- **WHEN** 用户完成一次练习（无论对错）
- **THEN** 总练习次数加 1

#### Scenario: 记录会话时长
- **WHEN** 用户开始练习
- **THEN** 系统记录会话开始时间并计算持续时间
