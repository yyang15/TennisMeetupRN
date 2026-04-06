# TennisMeetup – Change Log

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Real Map** — Discover 页面 MapView 替换为 WebView + Leaflet.js + CartoDB dark tiles，显示真实 Seattle 地图，session pins 按类型颜色编码，点击 pin 弹出球场名称
- **Distance 计算** — SessionCard 显示基于用户实际位置计算的真实距离（如 "2.3 mi"），使用 expo-location + haversine 公式
- **Nearby Courts** — Create Session 球场选择器添加 "Find Nearby" 按钮，使用 expo-location + Overpass API 搜索附近网球场，支持反向地理编码 + 聚类去重
- **Notifications 系统** — Supabase `notifications` 表，join/leave 自动写入通知记录，Discover bell 显示未读数，NotificationsScreen 列表页（actor name + session title + 相对时间），点击标记已读
- **Profile 页面** — ProfileScreen 查看/编辑用户信息（name, skill level, location, contact），保存到 Supabase + 更新 Context + Toast 反馈
- **Preferred Locations** — Supabase `user_preferred_locations` 表，创建 session 后自动保存球场，下次创建时显示 "Recent" 快速选择
- **Toast 组件** — 轻量级动画 Toast banner，用于 join/leave/create/profile 操作反馈
- **FAB 标签** — "+" 图标按钮改为 "+ Create Session" 药丸按钮
- **Quick Pick 时间** — Create Session 添加快速时间预设（Today 6 PM, Tomorrow 9 AM 等），一键设置日期+时间
- **Discard 确认** — Create Session 表单有数据时点返回弹出 "Discard Changes?" 确认
- **Skill/Notes 警告** — Notes 内容与选择的 Skill Level 矛盾时显示 inline ⚠️ 警告
- **dangerOutline 按钮变体** — 新增红色边框+红色文字按钮样式，用于 "Leave Session"
- **Agent Loop 系统** — `.claude/commands/` PM/Engineer/QA prompts + `agent-loop/` orchestrator, backlog, state, logs

### Changed
- **Session Card** — 时间格式改为 "TODAY 6:00 PM"，底部显示 "Kevin + 2 others" 玩家摘要
- **Chip 对比度** — 未选中 chips 改为 surface 背景 + 更亮边框 + textPrimary 文字，选中 chips 加粗 700
- **Skill Level 统一** — Profile/Onboarding/CreateSession 统一使用 Beginner/Intermediate/Advanced 标签（原 Profile 用 NTRP 数值）
- **Create Session 表单** — "When" 合并 Quick Pick + Date + Time 为一个区块，Court 区改为单选模式
- **Notes 字段** — 标签从 "Notes / Contact Info" 简化为 "Notes"，placeholder 更实用
- **MapView** — 高度 180→160px，legend 移除
- **outline 按钮** — 恢复为中性样式（白色边框），Leave Session 改用 dangerOutline
- **Bell 导航** — 点击铃铛导航到 NotificationsScreen（原为 inline banner toggle）

### Fixed
- **CRITICAL: Discard 弹窗 bug** — 成功发布 session 后 `navigation.replace` 不再触发 "Discard Changes?" 弹窗（`published` ref 守卫）
- **Toast 计时器重置** — `onDismiss` 改用 `useRef` 存储稳定引用，避免 context 更新导致的计时器循环重置
- **Android 表单锁死** — `submitting.current` 在成功路径重置 + Alert 设置 `cancelable: false`
- **Quick Pick 标签错误** — "Today 8 PM" 改为 "Today 7 PM"（实际时间是 7:00 PM）
- **通知 fire-and-forget** — join/leave 的通知插入从静默 `.then()` 改为带 `console.warn` 的错误日志
- **markNotificationAsRead** — 添加错误检查和日志
- **UpdateUserInput 类型** — `Partial<Omit<T, never>>` 简化为 `Partial<T>`

### Removed
- **Dead notification system** — SessionContext 中的本地 player-diff 通知系统（55 行死代码），已被 DB-backed 通知替代
- **Debug console.log** — NotificationsScreen 中泄露 user ID 的日志
- **Unused Button import** — SessionCard 中未使用的 Button 导入
- **Dead "View Profile" 按钮** — HostRow 中无 onPress 的假按钮
- **Hardcoded reliability score** — 从 SessionCard 和 HostRow 移除硬编码 95% 显示（数据模型保留，等真实数据再加回）
- **Inline notification banner** — DiscoverScreen 中已废弃的 showNotifications + banner JSX + 相关样式

---

## [0.3.0] – 2026-04-05

PM → Programmer → QA 开发循环两轮改进。

### Added
- **Pull-to-refresh** — `DiscoverScreen.tsx` 加 `RefreshControl`，下拉触发 `refreshSessions()` 从 Supabase 重新加载，带 `try/finally` 保证菊花不卡住
- **"Mine" 筛选** — `filterOptions` 新增 `'Mine'`，筛选 `s.players.some(p => p.id === user.id) || s.hostId === user.id`，有专属空状态文案
- **Host 取消 Session** — `supabaseApi.ts` 新增 `deleteSession()`（cascade 删除 participants），`SessionContext` 新增 `cancelSession()` 带房主权限校验，`StickyJoinButton` 新增 `'host'` 状态渲染红色 "Cancel Session" 按钮
- **Join/Leave Loading** — `SessionDetailScreen` 新增 `loading` state，按钮显示 spinner，Leave 触发前弹确认 Alert
- **Session 标题** — `Session` 类型新增 `title: string`，`SessionCard` 在时间上方显示标题，`InfoBlock` 用标题替代类型名作为主标题
- **预设球场** — `CreateSessionScreen` 新增 `COURTS` 数组（7 个西雅图球场含地址），chips 选择 + "Other" 自定义输入，选预设时自动填入地址
- **真实日期** — `generateDateOptions()` 生成未来 7 天 ISO 日期（`2026-04-05` 格式），替代硬编码 "Today/Tomorrow" 时间槽，日期和时间拆分为两个独立选择器
- **日期工具** — 新增 `src/data/dateUtils.ts`，`formatDate()` 将 ISO 日期转为 "Today" / "Tomorrow" / "Wed Apr 8" 可读格式，`SessionCard` 和 `InfoBlock` 共用

### Changed
- `TopBar` location 从硬编码 `"Seattle, WA"` 改为 `user?.location ?? 'Seattle, WA'`
- `notificationCount` 从装饰性 `3` 改为 `0`
- `StickyJoinButton` 从 4 状态扩展为 5 状态（join / loading / joined / full / host）
- `InfoBlock` 接收 `title?: string` prop，有标题时显示标题 + 类型副标题，无标题时用类型名作主标题
- `CreateSessionScreen` 日期存储从 `"Today"` 字符串改为 `"2026-04-05"` ISO 格式

### Fixed
- **BUG-03（高）**：`cancelSession` 内部吃掉错误不重新抛出 → 删除失败后仍导航返回。修复：错误 rethrow + 调用方 catch 后 return 不导航
- **BUG-04（中）**：`cancelSession` 无房主校验 → 任何用户可删除任意 session。修复：加 `session.hostId !== user.id` 检查
- **BUG-01（中）**：`toISOString()` 返回 UTC 时间 → 西雅图晚间创建的日期偏移一天。修复：改用 `getFullYear()/getMonth()/getDate()` 本地日期
- **BUG-07（中）**：`SessionCard` 直接渲染 ISO 字符串 `"2026-04-05"`。修复：调用 `formatDate()` 显示 "Today" 等可读文本
- **BUG-08（中）**：创建页面初始状态自定义输入框就显示。修复：新增 `showCustomCourt` 状态，仅点击 "Other" 后显示

---

## [0.2.0] – 2026-04-05

Supabase 后端迁移 + Onboarding + Host 身份 bug 修复。

### Added
- **Supabase 后端** — 3 张表：`users`（UUID PK, name, skill_level, location, contact_method, contact_value）、`sessions`（host_id FK, title, session_type, date, time, skill_range, court_name, total_spots, description, cost JSONB）、`session_participants`（session_id FK cascade, user_id FK, unique constraint）
- **`src/data/supabase.ts`** — Supabase client 初始化，读取 `EXPO_PUBLIC_SUPABASE_URL` 和 `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **`src/data/supabaseApi.ts`** — 完整 CRUD：`createUser()`, `fetchUser()`, `fetchSessions()`（含 `host:users!host_id(*)` JOIN + `session_participants(user_id, users(*))` 嵌套 JOIN）, `createSession()`（插入 session + host 作为首个 participant）, `joinSession()`（唯一约束去重）, `leaveSession()`, `transformSession()`（DB 行 → UI `Session` 类型）
- **Onboarding 页面** — `OnboardingScreen.tsx`：姓名、技能等级（NTRP chips）、位置、联系方式（Phone/WeChat/WhatsApp）、联系信息输入，提交调用 `supabaseApi.createUser()`，返回 UUID 存入 AsyncStorage
- **Contact Host** — `ContactHostRow.tsx`：显示联系方式类型 + 值，点击用 `expo-clipboard` 复制到剪贴板并弹 Alert 确认
- **条件导航** — `AppNavigator.tsx` 根据 `user` 是否存在切换 Onboarding 栈和主栈
- **App hydration** — `App.tsx` 在 `isReady` 前显示 loading spinner，从 AsyncStorage 加载 userId → Supabase 加载 user → 加载 sessions

### Changed
- **`src/data/storage.ts`** — 从存储完整 user + sessions 简化为只存 `userId`（sessions 由 Supabase 管理）
- **`src/data/mockSessions.ts`** — 删除 6 条 mock 数据，只保留类型定义（`Session`, `Player`, `ContactMethod`, `CostType`, `SessionType`, `FilterOption`）
- **`SessionContext.tsx`** — `user` 从硬编码 `currentUser` 常量改为动态 state；`addSession/joinSession/leaveSession` 从同步改为 async（调 Supabase API + `refreshSessions()`）；新增 `setUser()`, `refreshSessions()`, `isReady`
- **`Session` 类型** — 新增 `hostId: string`（UUID FK），`hostContactMethod?`, `hostContactValue?`
- **`CreateSessionScreen`** — 不再构建完整 `Session` 对象，改为发送 `CreateSessionInput`（host_id, title, session_type 等），host 信息由 Supabase JOIN 自动填充
- **`SessionCard`** — `currentUser` 导入改为从 `useSessions()` context 读取 `user`
- **`SessionDetailScreen`** — `currentUser` 导入移除，join/leave 改为 async

### Fixed
- **Host 身份 bug（关键）**：Session 之前用 `hostName: currentUser.name` 存储 → 显示错误的 host 名字。修复：`sessions` 表存 `host_id` FK，`fetchSessions` 通过 `host:users!host_id(*)` JOIN 获取真实 host 信息
- `fetchUser` 区分 PGRST116（用户不存在）和网络错误 → 网络错误不再误导用户重新 onboarding
- `spotsLeft` 用 `Math.max(0, total_spots - players.length)` 防止负数
- `OnboardingScreen` WhatsApp placeholder 从 "Phone number" 改为 "+1 (206) 555-1234"
- 删除 `ContactHostRow` 未使用的 `hostName` prop

---

## [0.1.0] – 2026-04-05

初始 MVP 搭建。

### Added
- **Discover 页面** — `DiscoverScreen.tsx`：深色主题，`FlatList` 渲染 session 卡片，`TopBar`（位置 pill + 通知铃铛），`FilterChips`（All/Singles/Doubles/Hitting/Coaching 横向滚动），`MapView` 占位（按 session 类型颜色编码 pin），`FloatingActionButton`
- **Session 卡片** — `SessionCard.tsx`：时间突出（20px bold），技能等级 Badge，球场名 + 距离，剩余名额（dot + 文字），host 头像 + 可靠度评分（绿/黄/红），按类型颜色编码的 pip，"Joined" 标记 / chevron 箭头
- **Session 详情** — `SessionDetailScreen.tsx` 全屏页面：`HeaderImage`（类型标签 + 距离 badge），`InfoBlock`（球场、地址、日期时间、NTRP 技能），`HostRow`（头像 + 姓名 + 可靠度 badge + View Profile），`PlayerAvatarList`（头像行 + 空位 `?` 占位），`CostRow`（free/split/paid 三态），`DescriptionBlock`（可折叠 + Show more/less），`StickyJoinButton`（底部固定 + Share 入口）
- **创建 Session** — `CreateSessionScreen.tsx`：标题输入、类型 chips（Singles/Doubles/Hitting）、时间选择、地点输入、技能等级 chips（2.5/3.0/3.5/4.0/4.5+）、人数 chips（2/4）、备注多行输入（maxLength 500），防双击提交（`useRef`），`KeyboardAvoidingView` 适配 iOS/Android
- **Join/Leave** — `SessionContext` `joinSession()`：检查已加入 + 已满保护；`leaveSession()`：host 不可离开（弹 Alert）；已加入 session 在 Discover 排到列表顶部（`sortSessionsForUser()`）
- **设计系统** — `theme/colors.ts`（bg #0E1116, surface #1A1F2E, accent #A6FF4D, 语义色 reliability/sessionType），`spacing.ts`（8pt grid, 10 级 xxs~xxxxl + 5 级 radius），`typography.ts`（11 种文字样式含 timeLarge），`shadows.ts`（sm/md/lg/accent 4 级阴影）
- **可复用组件** — `Button`（5 variant × 3 size, loading/disabled 状态, press 动画），`Chip`（active/inactive + press 动画），`Card`（surface + border + elevation），`Avatar`（initials 生成 + 基于名字的颜色 hash + 3 size），`Badge`（5 variant 语义色）+ `DotBadge`（通知数字）
- **动画** — `useAnimatedPress` hook：`Animated.spring` + `Animated.View` 包裹，`activeAnimation` ref 管理生命周期，`useEffect` 清理防止内存泄漏
- **导航** — React Navigation Native Stack，`RootStackParamList` 类型安全，slide_from_right 默认动画，CreateSession 用 slide_from_bottom
- **状态** — `SessionContext`（React Context）：`sessions`, `user`, `sortedSessions`, CRUD 方法
- **持久化** — AsyncStorage 存储 user + sessions，app 启动时 hydrate，`try/catch/finally` 错误处理
- **工程** — TypeScript 全量类型检查零错误，`.watchmanconfig`，Git 仓库 + GitHub remote（yyang15/TennisMeetupRN）

### Notes
- 初始 MVP 面向西雅图 ~20 名网球玩家
- iOS 模拟器测试，Xcode 26.2（Meta 内部版本）
- 开发工作流：Xcode + Claude Code CLI 并排使用
- 每次代码变更后运行双 Agent review（架构 + bug），修复所有中等及以上问题
