## 1. 音频资源准备

- [x] 1.1 制作 correct.mp3 音效文件（< 100KB）
- [x] 1.2 制作 incorrect.mp3 音效文件（< 100KB）
- [x] 1.3 创建 assets/sounds/ 目录并放置音效文件

## 2. AudioManager 实现

- [x] 2.1 创建 src/audio/AudioManager.js 文件
- [x] 2.2 实现 AudioManager 单例类结构
- [x] 2.3 实现音效预加载功能
- [x] 2.4 实现 play(name) 播放方法，支持重叠播放
- [x] 2.5 实现 setVolume(level) 音量调节方法
- [x] 2.6 实现 mute/unmute 静音切换功能
- [x] 2.7 添加移动端音频上下文初始化逻辑
- [x] 2.8 添加音效加载错误处理

## 3. 多字根掉落逻辑改造

- [x] 3.1 修改 game.js 数据结构支持多字根数组
- [x] 3.2 实现字根独立下落速度计算
- [x] 3.3 实现字根底部重置逻辑
- [x] 3.4 实现动态字根数量控制（3-5 个，随分数递增）
- [x] 3.5 实现 requestAnimationFrame 统一渲染循环

## 4. Canvas 多目标渲染

- [x] 4.1 实现多字根 Canvas 绘制循环
- [x] 4.2 为每个字根计算 bounding box（x, y, width, height）
- [x] 4.3 实现字根视觉高亮动画（命中时）
- [x] 4.4 性能优化确保 60fps 帧率

## 5. 多目标输入判定

- [x] 5.1 实现 Canvas 坐标矩形碰撞检测算法
- [x] 5.2 实现拼音匹配逻辑遍历所有活跃字根
- [x] 5.3 实现多字根同拼音优先级判定（最先下落优先）
- [x] 5.4 绑定音效触发与输入判定同步

## 6. 游戏设置面板音量控制 UI

- [x] 6.1 添加音量调节滑块 UI 组件
- [x] 6.2 添加静音切换按钮 UI 组件
- [x] 6.3 实现滑块拖动事件绑定 AudioManager.setVolume
- [x] 6.4 实现静音按钮点击事件绑定 AudioManager.mute/unmute
- [x] 6.5 实现音量状态持久化（localStorage）

## 7. 测试验证

- [x] 7.1 编写 AudioManager 单元测试（红/绿 TDD）
- [x] 7.2 编写音效播放集成测试
- [x] 7.3 编写 Canvas 多字根渲染性能测试
- [x] 7.4 编写多目标输入判定测试
- [x] 7.5 移动端音频自动播放策略验证
- [x] 7.6 音量控制功能手动测试
- [x] 7.7 音效文件加载失败降级测试

## 8. 配置与发布

- [x] 8.1 添加 config.enableSoundEffects 功能开关
- [x] 8.2 添加 config.enableMultiRadical 功能开关
- [x] 8.3 验证生产环境音频资源 CDN 加载
- [x] 8.4 更新 README 文档说明新功能
