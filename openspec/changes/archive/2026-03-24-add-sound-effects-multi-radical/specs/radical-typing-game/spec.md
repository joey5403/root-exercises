## MODIFIED Requirements

### Requirement: 多字根同时掉落渲染
Canvas 画布 SHALL 同时渲染多个掉落字根，而非单字根轮流显示。每个字根独立下落，具有不同的位置和下落速度。

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
