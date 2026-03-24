## MODIFIED Requirements

### Requirement: 多字根同时掉落渲染
Canvas 画布 SHALL 同时渲染多个掉落字根，每个字根根据 `enableKeyHint` 配置决定是否在其下方显示键位提示。当 `enableKeyHint` 为 true 时，每个字根独立下落并显示对应的键位提示；当 `enableKeyHint` 为 false 时，字根正常下落但不显示键位提示元素。

#### Scenario: 启用键位提示时的渲染
- **WHEN** `enableKeyHint` 配置为 true
- **THEN** Canvas 上每个掉落字根下方显示对应的键位提示文字

#### Scenario: 禁用键位提示时的渲染
- **WHEN** `enableKeyHint` 配置为 false
- **THEN** Canvas 上只渲染字根图片，不显示任何键位提示文字

#### Scenario: 配置切换时的实时渲染更新
- **WHEN** 游戏进行中用户切换 `enableKeyHint` 配置
- **THEN** 所有当前活跃字根立即根据新配置显示或隐藏键位提示，无需重新开始游戏
