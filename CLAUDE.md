# TennisMeetup RN

## 技术栈
- React Native (Expo SDK 52), TypeScript
- 函数式组件 + Hooks
- 深色主题
- Supabase 后端（users, sessions, session_participants, notifications, user_preferred_locations）
- React Context 状态管理
- AsyncStorage 存储本地用户 ID
- expo-location（附近球场搜索）

## 工作流规则

### PM → Programmer → QA 开发循环
每轮开发必须按以下流程执行：

**1. PM Agent（产品经理）**
- 审查当前所有功能和代码
- 从真实用户视角找出 UX 问题
- 提出功能改进建议，按 Impact × Effort 排优先级
- 给出一个 "Quick Win"（最小改动、最大收益）

**2. Programmer（我来实现）**
- 用户从 PM 建议中选择要实现的功能
- 按优先级实现选定的功能
- TypeScript type-check 必须通过

**3. QA Agent（质量保证）**
- 逐行审查新实现的代码
- 编写测试计划，验证功能正确性
- 检查边界情况、竞态条件、错误处理
- 报告 bug 并按严重程度分级

**4. 修复 QA 发现的问题**
- 修复所有中等及以上严重度的 bug
- 重新 type-check

### 代码审查流程（非 PM-QA 循环时使用）
每次生成或修改代码后，必须：
1. 并行启动两个 Agent 审查代码（一个关注架构/可维护性，一个关注 bug/性能）
2. 收集两个 Agent 的反馈
3. 逐条 address 所有反馈
4. 重复审查直到没有更多反馈为止

## 约定
- TypeScript type-check 命令：`cd /Users/yuekunyang/TennisMeetupRN && /usr/local/bin/claude_code/node ./node_modules/.bin/tsc --noEmit`
- npm 安装依赖：`cd /Users/yuekunyang/TennisMeetupRN && PATH="/usr/local/bin/claude_code:$PATH" /opt/homebrew/bin/npm install <package>`
- 启动 Expo：`cd /Users/yuekunyang/TennisMeetupRN && /usr/local/bin/claude_code/node ./node_modules/.bin/expo start`

## 本地测试流程

用户说"帮我测试"或"怎么测试"时，直接执行以下步骤：

```bash
# 1. 启动 Metro（加 -c 清缓存，适用于新增 native module 后）
cd /Users/yuekunyang/TennisMeetupRN && /usr/local/bin/claude_code/node ./node_modules/.bin/expo start -c

# 2. 普通启动（无新 native module 时）
cd /Users/yuekunyang/TennisMeetupRN && /usr/local/bin/claude_code/node ./node_modules/.bin/expo start
```

- 必须用 `interactive: true` 模式执行
- Metro 启动后，用户在手机上用 Expo Go 扫二维码测试
- 地址通常是 `exp://10.0.0.47:8081`
- 如果需要 reload：在 Metro 终端按 `r`，或手机摇一摇
- 如果加了新 native module（如 expo-location），必须用 `-c` 清缓存重启

## Maestro 自动化测试

**重要：必须使用 dev build，不能用 Expo Go。Maestro 看不到 Expo Go 内部的 RN 元素。**

### 构建 dev build
```bash
# 首次构建（约 5 分钟）
cd /Users/yuekunyang/TennisMeetupRN
PATH="/usr/local/bin/claude_code:/opt/homebrew/bin:/opt/homebrew/Cellar/cocoapods/1.16.2_2/bin:$PATH" \
  /usr/local/bin/claude_code/node ./node_modules/.bin/expo run:ios

# Pod install（如果需要）
cd ios && PATH="/usr/local/bin/claude_code:$PATH" /opt/homebrew/Cellar/cocoapods/1.16.2_2/bin/pod install
```

### 运行测试 + 录屏
```bash
# 全 app walkthrough + 录屏
/usr/local/bin/claude_code/node maestro/record.js

# 单个 flow
export PATH="$PATH:$HOME/.maestro/bin"
maestro test maestro/full_walkthrough.yaml

# 查看 Maestro 能看到的 UI 元素
maestro hierarchy
```

### 关键文件
- `maestro/full_walkthrough.yaml` — 完整 app 走查（onboarding → discover → join → create → profile）
- `maestro/record.js` — Node.js 录屏管理器（xcrun simctl + Maestro）
- `maestro/test_and_record.sh` — 一键录屏脚本
- App bundle ID: `com.tennismeetup.app`

### 待解决
- TextInput 定位问题：Maestro 的 accessibilityText 把整个页面内容扁平化，需要用 `accessibilityLabel` 区分输入框
- react-native-maps 已卸载（SDK 52 新架构不兼容），地图用 WebView + Leaflet

## Supabase 表
- `users` — 用户信息（name, skill_level, location, contact_method, contact_value）
- `sessions` — 球局（host_id, title, session_type, date, time, skill_range, court_name, court_address, total_spots, description）
- `session_participants` — 参加者（session_id, user_id），ON DELETE CASCADE
- `notifications` — 通知（user_id=收件人, session_id, actor_user_id=触发者, type=join|leave, is_read, created_at）
- `user_preferred_locations` — 常用球场（user_id, location_name, UNIQUE(user_id, location_name)）
- SQL migrations 在 `supabase_migrations/` 目录

## 已实现功能
- Onboarding（用户注册）
- Discover（发现球局 + 地图 + 筛选）
- Create Session（Quick Pick 时间、简化 Skill、Preferred Locations、Find Nearby Courts）
- Session Detail（加入/离开/取消 + Toast 反馈）
- Notifications（DB-backed，unread badge，mark-as-read，bell → 通知列表页）
- Profile（查看/编辑个人信息 + Toast 反馈）
- FAB 按钮 "+ Create Session"
- Session Card 优化（"TODAY 6:00 PM" 格式 + "Kevin + 2 others" 玩家摘要）
- Chip 高对比度（surface bg，accent active，700 bold）
- Nearby Courts 搜索（expo-location + Overpass API + 反向地理编码 + 聚类去重）

## 反循环规则（HARD RULE）

**同一个问题最多尝试 3 次。** 如果 3 次修复后问题仍未解决：
1. 停下来
2. 分析根因（不是症状）
3. 告知用户当前状态 + 根因 + 可选方案
4. 等用户决定方向后再行动

**绝对禁止**：在同一个问题上循环 5 次以上。

## 结束 Session 流程

每次 session 结束前必须执行：
1. `sl status` 确认无遗漏文件
2. `sl add` 新文件 → `sl commit -m "..."` 提交
3. `sl push --to main` 推送到 GitHub
4. 确认 push 成功后再告知用户 session 结束
- P0: 表单太长，关键按钮不可见 → 考虑折叠 All Courts 列表
- P1: Profile 和 Create Session 的 skill 体系不一致（NTRP vs Beginner/Intermediate/Advanced）
- P2: Player Limit 只有 2 和 4 → 加上 6、8 选项
- P2: 通知空状态引导 → "Host a session to get notified when players join"
- P2: Session Card 的 typePip 太小 → 换成文字标签
