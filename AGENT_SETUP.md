# TennisMeetup — Agent System Setup

粘贴这段到新 session 作为 context。

---

## 项目

App: TennisMeetup
Path: /Users/yuekunyang/TennisMeetupRN
Stack: React Native (Expo SDK 52), TypeScript, Supabase, React Context, AsyncStorage, expo-location
GitHub: https://github.com/yyang15/TennisMeetupRN

## Agent Loop 系统

```
.claude/commands/
├── pm.md              # PM Agent — 选最高优先级 task，输出 JSON ticket
├── engineer.md        # Engineer Agent — 最多改 5 文件，跑 tsc
└── qa.md              # QA Agent — 验证 acceptance criteria，对比 metrics，PASS/FAIL

agent-loop/
├── orchestrator.py    # 主控脚本（PM → Engineer → QA，max 3 iterations）
├── backlog.json       # 任务队列
├── state.json         # 系统记忆（iteration count, metrics, 成功/失败记录）
└── logs/              # 每轮 PM ticket, QA report, metrics
```

## 已完成的 Iterations

| Iter | Task | QA |
|------|------|----|
| 1 | Add discard confirmation on Create Session back | ✅ |
| 2 | Remove dead local notification system from SessionContext | ✅ |
| 3 | Remove debug console.log + unused Button import | ✅ |
| 4 | Fix UpdateUserInput type + notification error logging | ✅ |

## Backlog（Open）

| ID | Task | Priority |
|----|------|----------|
| 5 | Unify skill level system (Profile NTRP vs CreateSession Beginner/Intermediate/Advanced) | high |
| 6 | Fix submitting pattern inconsistency (useRef vs useState in CreateSession) | medium |
| — | Add logout button to ProfileScreen | high |
| — | Remove dead "View Profile" button in HostRow | medium |
| — | Add coaching to SESSION_TYPES in CreateSession | low |
| — | Replace hardcoded reliabilityScore: 95 with real data or remove display | medium |
| — | Replace `any` in catch blocks with `unknown` | low |

## 已实现功能

- Onboarding（用户注册）
- Discover（发现球局 + 地图 + 筛选）
- Create Session（Quick Pick 时间、简化 Skill、Preferred Locations、Find Nearby Courts、Discard confirmation）
- Session Detail（加入/离开/取消 + Toast 反馈）
- Notifications（DB-backed，unread badge，mark-as-read，bell → 通知列表页）
- Profile（查看/编辑个人信息 + Toast 反馈）
- FAB "Create Session" pill 按钮
- Session Card（"TODAY 6:00 PM" + "Kevin + 2 others"）
- Chip 高对比度
- Nearby Courts（expo-location + Overpass API + 反向地理编码 + 聚类）

## Supabase 表

- users（name, skill_level, location, contact_method, contact_value）
- sessions（host_id, title, session_type, date, time, skill_range, court_name, court_address, total_spots, description）
- session_participants（session_id, user_id）ON DELETE CASCADE
- notifications（user_id, session_id, actor_user_id, type=join|leave, is_read）
- user_preferred_locations（user_id, location_name, UNIQUE）

## 常用命令

```bash
# TypeScript type-check
cd /Users/yuekunyang/TennisMeetupRN && /usr/local/bin/claude_code/node ./node_modules/.bin/tsc --noEmit

# 安装依赖
cd /Users/yuekunyang/TennisMeetupRN && PATH="/usr/local/bin/claude_code:$PATH" /opt/homebrew/bin/npm install <package>

# 启动 Expo
cd /Users/yuekunyang/TennisMeetupRN && /usr/local/bin/claude_code/node ./node_modules/.bin/expo start

# 启动 Expo（清缓存，新 native module 后用）
cd /Users/yuekunyang/TennisMeetupRN && /usr/local/bin/claude_code/node ./node_modules/.bin/expo start -c
```

## Metrics

- Baseline: 40 files, 4026 lines, tsc ✅
- Current: 40 files, 3969 lines, tsc ✅ (-57 lines dead code removed)

## 结束 Session 必做

1. `sl status` 确认无遗漏
2. `sl add` 新文件 → `sl commit -m "..."`
3. `sl push --to main` 推送 GitHub
4. 确认 push 成功

## 开发规则

- 增量改动，不要重写
- 每个 task 最多改 5 个文件
- TypeScript type-check 必须通过
- 保持深色主题一致
- 复用现有组件和模式
