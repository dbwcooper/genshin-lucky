原神抽卡年会抽奖应用 - 实施计划
现状分析
已有基础：
TanStack Router 路由配置 (/ 主页, /kiosk 抽奖页)
Providers: PoolProvider, HistoryProvider, DrawProvider
Dexie 数据库 + localStorage 配置
抽奖算法 drawRules.ts (规则基本正确)
shadcn/ui 组件库
基础 kiosk 页面占位动画
待完成任务
阶段 1: 核心修复与补全 (优先级高)
1.1 修复抽奖规则 bug
当前 drawRules.ts 第 31-34 行: 幸运奖判断逻辑错误
幸运奖应允许 1-4 等奖得主再中，只排除已中幸运奖的人
修正后：幸运奖 → 只排除 luckyWinners；1-4等奖 → 只排除 regularWinners
1.2 完善 DrawProvider 保存记录
completeDraw 应在结果展示后调用保存
添加 roundNumber 正确获取
1.3 添加主题色配置
index.css 添加 --primary: 160 100% 33% (#00a758)
阶段 2: 动画系统重构
2.1 添加 R3F 依赖
@react-three/fiber, @react-three/drei, three
2.2 创建动画 Provider + 视频层
features/gacha-animation/providers/AnimationProvider.tsx
视频播放器组件 (流星/穿越/落地)
跳过控制器
2.3 R3F 卡片翻牌组件
features/gacha-animation/components/GachaStage.tsx
features/gacha-animation/components/CardReveal.tsx
懒加载 R3F 模块
2.4 动画时序控制
流星 2s → 穿越 1.5s → 落地 1s → 逐张翻牌 0.6s/张
跳过：0.5s 内快进完成
reduced-motion 降级
阶段 3: 资源与音频系统
3.1 资源预加载工具
lib/preload.ts - 视频/音频预加载
应用启动时并行预加载关键资源
3.2 音频 Provider
providers/AudioProvider.tsx
BGM + 翻牌音效 + 结果音效
点击"开始抽奖"后才播放
3.3 资源目录结构
public/assets/
├── videos/  (meteor-gold.webm, transition.webm, landing.webm)
├── audio/   (bgm.mp3, reveal.mp3, result.mp3)
├── textures/ (card-back.webp, card-gold.webp)
└── images/  (bg.webp)
阶段 4: UI/UX 完善
4.1 主界面优化
奖池选择卡片样式 (PoolCard variant 组件)
触控命中尺寸 44x44px
4.2 历史页面增强
按奖池/轮次筛选
单轮导出 + 按奖池导出
4.3 重置确认强化
双步确认 Dialog
输入 "RESET" 确认
4.4 Kiosk 页面
结果保存按钮
返回主页确认
阶段 5: A11y 与 Focus 管理
5.1 Dialog Focus 管理
打开时 focus 首个可交互元素
关闭后 focus 返回触发按钮
5.2 键盘支持
Enter/Space 触发抽奖
Esc 退出 Kiosk
Space 跳过动画
5.3 reduced-motion
跳过视频阶段
翻牌动画 0.6s → 0.3s
阶段 6: 资源下载脚本
6.1 scripts/download-assets.mjs
从 manifest.json 下载资源
支持断点续传
实施顺序
阶段 1 (核心修复) → 2. 阶段 4.3 (重置确认) → 3. 阶段 5.1-5.2 (A11y)
阶段 2 (动画系统) → 5. 阶段 3 (资源/音频) → 6. 阶段 4.1-4.2 (UI)
阶段 6 (下载脚本)