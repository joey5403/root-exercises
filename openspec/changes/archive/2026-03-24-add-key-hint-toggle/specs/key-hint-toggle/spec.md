## ADDED Requirements

### Requirement: 键位提示显示/隐藏配置
系统 SHALL 提供 `enableKeyHint` 配置项，允许用户控制字根键位提示的显示与隐藏。

#### Scenario: 默认配置状态
- **WHEN** 用户首次访问游戏页面
- **THEN** `enableKeyHint` 配置项默认为 false，键位提示处于隐藏状态

#### Scenario: 用户启用键位提示
- **WHEN** 用户在配置面板中打开键位提示开关
- **THEN** `enableKeyHint` 设置为 true，所有字根下方显示对应的键位提示

#### Scenario: 用户禁用键位提示
- **WHEN** 用户在配置面板中关闭键位提示开关
- **THEN** `enableKeyHint` 设置为 false，所有字根下方的键位提示元素被隐藏

#### Scenario: 配置持久化保存
- **WHEN** 用户切换键位提示开关状态
- **THEN** 配置自动保存到 localStorage，页面刷新后配置保持不变
