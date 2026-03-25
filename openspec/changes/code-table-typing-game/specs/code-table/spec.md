## ADDED Requirements

### Requirement: 默认码表加载
系统 SHALL 在启动时从 `docs/assets/code/wb98.txt` 加载默认五笔 98 码表，文件使用 UTF-16 编码格式。

#### Scenario: 游戏启动时加载默认码表
- **WHEN** 游戏初始化
- **THEN** 系统自动从 `docs/assets/code/wb98.txt` 加载所有码表数据到内存

#### Scenario: 码表文件格式解析
- **WHEN** 读取码表文件
- **THEN** 系统正确解析 UTF-16 编码格式，建立字根码到汉字的映射

#### Scenario: 码表加载失败处理
- **WHEN** 默认码表文件不存在或无法读取
- **THEN** 系统显示错误提示并提供默认空码表

### Requirement: 自定义码表上传
系统 SHALL 允许用户上传自定义码表文件，格式与默认码表相同（UTF-16 编码）。

#### Scenario: 用户上传自定义码表
- **WHEN** 用户选择上传码表文件
- **THEN** 系统验证文件格式并加载自定义码表

#### Scenario: 自定义码表格式验证
- **WHEN** 用户上传的文件格式不正确
- **THEN** 系统显示错误提示并拒绝加载

#### Scenario: 切换回默认码表
- **WHEN** 用户选择使用默认码表
- **THEN** 系统重新加载 `docs/assets/code/wb98.txt` 并替换当前码表
