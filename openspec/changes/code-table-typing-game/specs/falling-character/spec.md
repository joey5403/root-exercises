## ADDED Requirements

### Requirement: 单字下落机制
游戏 SHALL 使用随机单个汉字从屏幕上方下落，而不是随机字根选择。汉字从 docs/assets/document/ 目录下的 4 个文件中随机选取。每个下落汉字根据码表获取其对应的字根编码。

#### Scenario: 游戏启动时单字下落
- **WHEN** 游戏开始
- **THEN** 随机一个汉字从 Canvas 顶部开始下落

#### Scenario: 汉字从文档文件中随机选取
- **WHEN** 需要生成新汉字
- **THEN** 系统从 4 个文档文件（前 500.txt, 中 500.txt, 后 500.txt, 前 1500.txt）中随机选择一个汉字

#### Scenario: 汉字连续下落
- **WHEN** 当前汉字被正确输入或到达底部
- **THEN** 下一个随机汉字立即从顶部开始下落

#### Scenario: 汉字下落速度
- **WHEN** 游戏进行中
- **THEN** 汉字以恒定速度匀速下落，使用 requestAnimationFrame 保持 60fps 流畅动画

#### Scenario: 字根编码显示
- **WHEN** 汉字下落时
- **THEN** 在汉字下方显示该字对应的字根编码（根据 enableKeyHint 配置）

### Requirement: 单字输入判定
系统 SHALL 对下落的单个汉字进行输入判定，用户输入匹配该汉字拼音或字根编码均视为正确。

#### Scenario: 拼音输入正确
- **WHEN** 用户输入与下落汉字匹配的拼音
- **THEN** 系统判定为正确，播放正确音效，汉字重置到顶部

#### Scenario: 字根输入正确
- **WHEN** 用户输入与下落汉字匹配的字根编码
- **THEN** 系统判定为正确，播放正确音效，汉字重置到顶部

#### Scenario: 输入错误处理
- **WHEN** 用户输入的拼音或字根与下落汉字不匹配
- **THEN** 系统判定为错误，播放错误音效，汉字继续下落
