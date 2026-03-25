## ADDED Requirements

### Requirement: 文档文件存储
系统 SHALL 复用 `docs/assets/document/` 目录下现有的 4 个文档文件（前 500.txt, 中 500.txt, 后 500.txt, 前 1500.txt），纯文本格式存储汉字列表。

#### Scenario: 文档目录初始化
- **WHEN** 游戏启动
- **THEN** 系统检查 `docs/assets/document/` 目录是否存在

#### Scenario: 4 个文档文件存在
- **WHEN** 游戏初始化完成
- **THEN** `docs/assets/document/` 目录下存在 4 个文档文件：前 500.txt, 中 500.txt, 后 500.txt, 前 1500.txt

### Requirement: 文档切换功能
系统 SHALL 允许用户在 4 个文档文件之间切换查看。

#### Scenario: 默认显示前 500 文档
- **WHEN** 用户打开文档查看界面
- **THEN** 默认显示 前 500.txt 内容

#### Scenario: 切换到中 500 文档
- **WHEN** 用户选择查看中 500
- **THEN** 系统加载并显示 中 500.txt 内容

#### Scenario: 切换到后 500 文档
- **WHEN** 用户选择查看后 500
- **THEN** 系统加载并显示 后 500.txt 内容

#### Scenario: 切换到前 1500 文档
- **WHEN** 用户选择查看前 1500
- **THEN** 系统加载并显示 前 1500.txt 内容

#### Scenario: 文档切换无刷新
- **WHEN** 用户在文档间切换
- **THEN** 界面立即更新显示新文档内容，无需重新加载页面
