# TennisMeetup RN

## 技术栈
- React Native (Expo), TypeScript
- 函数式组件 + Hooks
- 深色主题
- Supabase 后端（users, sessions, session_participants）
- React Context 状态管理
- AsyncStorage 存储本地用户 ID

## 工作流规则

### PM → Programmer → QA 开发循环
每轮开发必须按以下流程执行：

**1. PM Agent（产品经理）**
- 审查当前所有功能和代码
- 从真实用户视角找出 UX 问题
- 提出功能改进建议，按 Impact × Effort 排优先级
- 给出一个 "Quick Win"（最小改动、最大收益）
- 输出中文

**2. Programmer（我来实现）**
- 用户从 PM 建议中选择要实现的功能
- 按优先级实现选定的功能
- TypeScript type-check 必须通过

**3. QA Agent（质量保证）**
- 逐行审查新实现的代码
- 编写测试计划，验证功能正确性
- 检查边界情况、竞态条件、错误处理
- 报告 bug 并按严重程度分级
- 输出中文

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
- 使用中文交流
- TypeScript type-check 命令：`cd /Users/yuekunyang/TennisMeetupRN && /usr/local/bin/claude_code/node ./node_modules/.bin/tsc --noEmit`
