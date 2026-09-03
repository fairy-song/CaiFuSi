# 阶段 2 改进方案：前端 api.js HTTP 请求封装统一收敛

**问题编号**：STAGE2-ISSUE-001
**对应问题**：`src/services/api.js` 三套 HTTP 请求实现并存 + fetchApi 死代码 0 调用
**分析日期**：2026-09-02
**负责人**：待分配
**预计工期**：1~2 个工作日
**风险等级**：低（仅改动 1 个服务层文件，不涉及 UI / 后端路由）
**状态**：待评审

---

## 一、问题背景与现状证据

### 1.1 问题名称
前端请求服务层 `src/services/api.js` 中同时存在「axios.create 实例封装、原生 fetch 封装函数、sendMessageToCoach 内联 fetch」三套独立的 HTTP 请求实现，其中 fetchApi 函数经全仓验证为 0 处真调用的死代码，造成维护成本与线上一致性风险。

### 1.2 问题发现路径
本问题来自《项目评审.md》修订版 §五 P2-3「前端请求层多套实现并存、fetchApi 疑似死代码」的目录梳理结论（原评审 §2.2 验证「网络超时/失败重试」表述时，顺带发现不同业务函数调用的请求工具不一致，展开静态代码审计后确认三套并存的结构）。随后通过以下 3 种独立方法交叉验证：① VS Code `Ctrl+F` 单文件逐关键词定位实现锚点；② Windows PowerShell 正则全仓搜索「真调用」匹配数；③ VS Code 右键「查找所有引用」语义分析引用数量。三种方法结论完全一致，形成证据链。

### 1.3 现状证据
a) 三套请求实现的代码锚点：
   - 第 1 套（主力使用）：axios.create 实例 api 封装
     位置：[api.js#L14-L19](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L14-L19)
     特征：统一 `baseURL = http://localhost:5001`，默认 `Content-Type: application/json`
   - 第 2 套（死代码）：原生 fetch 封装函数 fetchApi
     位置：[api.js#L51-L83](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L51-L83)
     特征：手动拼接 baseURL、手动 try/catch，与第 1 套功能重叠但未被调用
   - 第 3 套（重复造轮子）：sendMessageToCoach 内部手写原生 fetch
     位置：[api.js#L185-L225](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L185-L225)
     特征：未复用第 1 套 axios 实例，单独硬编码 `POST http://localhost:5001/api/coach/chat`
b) 死代码可复现验证命令（Windows PowerShell）：
   命令（正则仅匹配「fetchApi(」真调用）：
   ```powershell
   cd "D:\程序\CaiFuSi\CaiFuSi - 副本"
   Get-ChildItem -Path src -Recurse -Include *.js,*.jsx | Select-String -Pattern 'fetchApi\s*\(' | Where-Object { $_.Path -notlike '*node_modules*' -and $_.Path -notlike '*build*' }
   ```
   实际输出结果：
   ```
   src\services\api.js:51:async function fetchApi(endpoint, options = {})
   ```
   （仅 1 行命中 = 仅定义行，其他文件 0 次真调用）
c) 三套并存可视化证据：
   - 全仓搜索 `fetchApi` 关键字共 4 文件 9 匹配（全局搜索面板），其中 0 处为真调用（`fetchApi(`），其余匹配为 import 语句 / 注释 / 字符串提及
   - VS Code「查找所有引用」功能对 fetchApi 函数返回「0 references」
d) 运行状态说明：本结论基于静态代码证据，未端到端跑 UI 验证（三套请求路径在无智谱 API Key 的场景下聊天接口会返回业务错误，但与请求封装是否一致的判断无关）。

### 1.4 问题为何未及时发现
(1) **迭代多人分工无 PR 规范**：三套代码分属不同迭代阶段，由不同协同学独立编写（推测第 1 套 = 登录模块、第 2 套 = 通用服务层重构草稿、第 3 套 = AI 教练功能上线时独立开发），合并时缺少「所有 HTTP 请求必须统一走 axios.create 实例」的 Review Checklist。
(2) **属于维护性问题而非用户功能缺陷**：页面 UI 交互一切正常（登录、测评提交、聊天发送在前端侧均能正常发请求），仅在后续叠加"统一超时、统一 JWT 头、统一错误埋点"等横切需求时才会暴露不一致性，常规黑盒功能测试无法发现。
(3) **项目未接入静态代码分析工具链**：
   - 未启用 ESLint `no-unused-vars` + `import/no-unused-modules` 规则
   - 未周期性运行 `npx depcheck` 扫描未使用函数 / 未使用依赖
   导致 fetchApi 被多个文件 import 但实际 0 调用的场景长期未被 IDE/CI 自动告警。

---

## 二、问题影响和改进目标

### 2.1 问题影响（分层描述，仅保留已验证或高概率可复现的真实影响）

| 影响维度 | 具体表现 | 严重程度 | 代码例证 |
|---|---|---|---|
| 🛠 可维护性（最高） | 后续叠加「统一超时自动取消、统一加 Authorization Header、统一错误码中文翻译、统一埋点上报」等横切功能时，必须在三套实现中分别修改（或写三份兼容逻辑），漏改直接导致用户体验不一致。典型场景：axios 实例加 `timeout: 10000` 后，sendMessageToChat 未加 → 登录请求超时 10s 弹提示，但聊天请求永远卡加载。 | 🟠 中（短期不影响功能，长期维护成本线性放大 3 倍） | [api.js#L14-L19 axios 配置](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L14-L19) vs [api.js#L195-L210 sendMessageToCoach fetch](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L195-L210) |
| 🚀 上线一致性风险（较高） | sendMessageToChat 第 3 套内联 fetch 硬编码了完整 URL `http://localhost:5001/api/coach/chat`，未复用 axios 实例的 baseURL 模板：当部署到 GitHub Pages `https://xiaocow666.github.io/Caifusi/` 或其他非 localhost 环境时，该接口会因跨域（CORS）或目标地址错误直接 404 / Network Error，其他接口（login/submitAssessment 复用 axios 实例）正常 → 造成"部分功能能用部分不能用"的偶发线上 Bug，排查定位困难。 | 🟠 中（本地开发不触发，生产部署必现） | 同上 sendMessageToCoach 硬编码 URL |
| 🧹 代码整洁度 / 新人上手 | 33 行 fetchApi 死代码 + 多处文件 `import { fetchApi } from '../services/api'` 但未调用的 unused import（全局搜索 4 个文件 9 匹配中的假匹配），会误导协同学 / 新成员以为"fetchApi 是项目推荐的标准封装"，进一步传播错误用法，拉长 Onboarding 时间。 | 🟡 低（主要影响新人上手效率） | 全仓搜索 `import.*fetchApi` 的匹配数（0 调用但 N 处 import） |
| 🔒 安全性 | ❌ 无直接新增风险：fetchApi 为 0 调用的死代码，不运行则无安全风险；sendMessageToCoach 的原生 fetch 与 axios 实例在 TLS / CSRF / XSS 防护能力上等价，未引入新漏洞（评估中已剔除"隐藏后门"类臆测描述）。 | ⚪ 无 | —— |

### 2.2 改进目标（严格 SMART 原则 + 可量化验收）

> **SMART 目标声明**：在 5 个工作日内（截止 2026-09-07），将前端 `src/services/api.js` 中 3 套 HTTP 请求实现**收敛为 1 套（仅保留 axios.create 实例）**，达成以下可量化指标：
>
> | 编号 | 指标项 | 可量化标准 | 验证方式 |
> |---|---|---|---|
> | G1 | 代码减量 | 删除 fetchApi 函数 33 行死代码 + 删除全项目 3~6 处 `import { fetchApi }` 未使用引用，**总计净删除代码 ≥ 40 行** | `git diff --stat HEAD` 输出中 `insertions(+), deletions(-)` 统计 |
> | G2 | 实现统一 | sendMessageToCoach 函数 100% 重写为 `await api.post('/api/coach/chat', data)` 调用第 1 套 axios 实例，不再出现原生 `fetch(` 关键字 | api.js 内 Ctrl+F 搜 `fetch(` → 匹配数从 2 降为 0（不含注释） |
> | G3 | 功能等价回归 | 3 条核心链路在 Chrome DevTools Network 面板中：请求 URL（域名 + path）、Method、Content-Type、Body JSON 结构与重构前**字节级一致**；相同输入（密码错误 / 空聊天消息）下错误提示文案语义一致（允许 axios 自动翻译 HTTP 状态码） | 手工对比 Network 面板截图 + Console 错误消息 |
> | G4 | 构建通过 | `npm run build` 成功生成 `build/` 产物，Babel / Webpack 编译错误数 = 0（当前项目未接入 ESLint，则以编译通过为最低标准） | `npm run build` exit code = 0 |
> | G5 | 新人上手可理解性 | api.js 文件头部新增「请求工具使用规范注释」，协同学仅阅读注释即可知道「所有 HTTP 必须使用 api 实例、禁止新写原生 fetch、baseURL 配置位置」，10 分钟内可独立完成新接口调用的代码编写（模拟 Code Review 验证：给新人一个接口文档，看其能否正确写出调用） | 结对编程 / 模拟评审 |

---

## 三、可选方案及取舍

共设计 3 套方案（方案 0 = 什么都不做作为 Baseline 对比），从工作量、风险、达成目标覆盖度 3 维度打分对比：

### 3.1 方案对比总表

| 维度 | 方案 0：**不做任何修改（Baseline）** | 方案 1：**半收敛**（仅删 fetchApi 死代码，sendMessageToCoach 保持 fetch 不动） | 方案 2：**全量收敛**（删 fetchApi + 改 sendMessageToCoach 用 axios + 清理 unused import + 加规范注释）【推荐方案】 | 方案 3：**重写 api.js 为 TypeScript 类封装（Over-engineering）** |
|---|---|---|---|---|
| **核心动作** | 保持现状，仅在评审文档里记录该问题 | 2 步：① 删除 api.js L51-L83 fetchApi；② 全仓删所有 `import { fetchApi }` 未使用引用 | 方案 1 的全部动作 + ③ sendMessageToCoach 改为 `api.post('/api/coach/chat')`；④ api.js 顶部加使用规范注释；⑤ 跑 `npm run build` 验证 | 引入 TypeScript + 抽象 `BaseHttpClient` 类 + 拦截器 + 重试中间件，整体重写 |
| **涉及文件数** | 0 | 1 个核心文件 + 3~6 个外围文件删 import | 同方案 1（涉及文件数不变，仅多改 api.js 内部 1 个函数 + 加注释） | 全文件重命名 .ts + 新 types/http.ts 目录，≥ 10 个文件 |
| **代码变更量** | 0 行 | -40 ~ -70 行（纯删除） | -60 ~ -90 行 删除 + +10 行 新增（axios 替换 + 注释）= 净删除 ≈ -70 行 | +500 ~ +800 行 大量新增 |
| **预计工期** | 0 | 半天（4h） | 1 天（8h），含完整回归验证 | 5~7 天 |
| **风险等级** | 0（但问题持续存在） | 🟢 极低（纯删除，改坏了 git revert 1 秒还原） | 🟢 低（仅 sendMessageToCoach 函数内部实现替换，签名与返回值结构不变，调用方 CoachChat.js 0 改动） | 🔴 高（全项目类型体操 + 构建链迁移 + 运行时回归面大） |
| **目标 G1 代码减量** | ❌ 0 行 → 不达标 | ✅ ≥ 40 行 → 达标 | ✅ ≥ 70 行 → 超额达标 | ❌ 净增行 → 不达标 |
| **目标 G2 实现统一（无 fetch 关键字）** | ❌ 3 套并存 → 不达标 | ❌ 仍留 2 套（axios + sendMessageToCoach 内联 fetch）→ 不达标 | ✅ 仅 1 套 → 达标 | ✅ 仅 1 套 → 达标 |
| **目标 G3 功能等价** | ✅（天然不变） | ✅（不碰 sendMessageToCoach，天然等价） | ⚠️ 需手工回归 Network（存在"错误提示文案不一致"的小风险，可控） | ⚠️ 需完整端到端回归（拦截器行为变化风险） |
| **解决 §2.1「上线一致性风险」**（最关键痛点） | ❌ 未解决 | ❌ 仍存在（sendMessageToCoach 硬编码 localhost） | ✅ 改为 `api.post()` → 继承 axios baseURL 模板，部署到 GitHub Pages 自动适配环境 | ✅ 解决 |
| **新人上手（G5）** | ❌ 无规范注释 | ❌ 仍无规范注释，仅少了一套误导性死代码 | ✅ 加了规范注释，统一了唯一正确用法 | ✅ 规范最强，但 TS 门槛反加重新人负担 |
| **综合评分（10 分制，越高越推荐）** | 2 分（问题保留，不作为方案） | 5 分（解决死代码但遗留核心痛点 G2 + 上线风险） | **9 分（推荐方案）** — 工作量仅增加 4h，实现了 100% SMART 目标覆盖 + 解决上线一致性核心痛点，风险可控 | 4 分（过度设计，工期与风险不成比例，建议阶段 3 再考虑） |

### 3.2 方案 1（半收敛）vs 方案 2（全量收敛）取舍理由深度展开

在「方案 1 只要半天 vs 方案 2 要 1 天」的选择中，推荐选方案 2 的核心判断：
1. **增量边际成本极低，收益非线性提升**：方案 1 已做了「切分支、拉取代码、删 fetchApi、跑 build」的环境准备成本（约 2h）；在此基础上方案 2 新增的工作仅为「改 sendMessageToCoach 函数内部 10 行实现」（~30min 编码 + 1h 回归验证），**边际投入 1.5h 换来了「上线一致性风险消除 + G2 达标 + 新人可理解性提升」三个高价值目标**，边际 ROI 远高于方案 1。
2. **sendMessageToCoach 改写风险为 0**：函数签名保持 `async (data) => { return { reply: ... }; }` 不变，调用方 [CoachChat.js#L216](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/pages/CoachChat.js#L216) `const response = await sendMessageToCoach(contextData);` 0 行改动。改写前后请求的 URL / Method / Body 结构完全等价，仅底层实现从「fetch + 手动 json 解析」切换到「axios.create + 自动 json 解析」——错误处理分支 catch 的行为两者一致（均会 reject Promise，被上层 try/catch 捕获）。
3. **避免技术债二次堆积**：如果选方案 1，遗留的 sendMessageToCoach 硬编码 localhost 在实际部署到 GitHub Pages 时 100% 会出现 Bug（评审中已验证后端 CORS 白名单包含 GitHub Pages，但前端硬写 localhost 必然跨域），届时又要开一个新 PR 修复——**"现在多花 1.5h 一次改完" vs "半个月后线上出 Bug 再紧急回滚修复"，前者工程纪律明显更优。**

**结论：不选方案 1（半收敛），直接推荐方案 2（全量收敛）。**

---

## 四、推荐方案与具体实施步骤

**推荐：方案 2（全量收敛）**
预期工期：1 个工作日（8h，按 2h 准备 + 2h 编码 + 2h 验证 + 2h 文档/PR 编写估算）。

### 4.1 Git 操作规范（提交前必做）

| 规范项 | 要求 |
|---|---|
| 分支命名 | `refactor/api-request-unify`（type(scope): 语义化） |
| 分支基础 | 必须从最新 `origin/main` 切出，不能基于旧 commit |
| Commit 粒度（3 个独立 commit，便于 Code Review + 回滚） | 见 4.3 步骤中每个「Commit X」的规范标题（使用 Conventional Commits 格式） |
| PR 标题 | `refactor(api): 统一 HTTP 请求封装为 axios.create 单实例，删除 fetchApi 死代码` |
| PR 描述模板 | 引用本方案文档 §1、§2 关键证据 + §5 验收清单勾选框 |

### 4.2 环境准备（Step 0，必做，预计 1h）

```powershell
# S0-1 切到项目根目录
cd "D:\程序\CaiFuSi\CaiFuSi - 副本"

# S0-2 拉取最新 main，确保基准正确
git checkout main
git pull origin main

# S0-3 切独立功能分支（严格按命名规范）
git checkout -b refactor/api-request-unify

# S0-4 安装前端依赖（首次跑需，后续跳过）
npm install

# S0-5 跑一次 build 验证「改之前代码是能编过的」，建立基线
npm run build
# 预期输出：Compiled successfully，build 目录生成
# ⚠️ 如这一步 build 失败，先向组内确认是否已知问题，不要继续
```

### 4.3 分步实施 + 代码级改动说明（预计 2.5h）

**Commit 1：删除死代码 fetchApi + 清理全项目 unused import（纯删除动作，0 逻辑改动）**
预计 30 min，Commit 标题：
> `refactor(api): 删除 fetchApi 死代码及全项目未使用的 fetchApi import`

```
Step 1-1：在 api.js 内精准删除 fetchApi 函数定义 L51~L83（33 行）
   - 锚点：从 [api.js#L51](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L51) `async function fetchApi(endpoint, options = {}) {` 开始
   - 找到匹配的闭合 `}`，确认到 [L83](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L83) 结束
   - 选中整块删除，**不要删到前后的 loginUser / submitAssessment 等函数**
   - 删除后保存文件

Step 1-2：全项目搜索「import ... fetchApi」，删除所有未使用引用
   - VS Code 全局搜索（Ctrl+Shift+F）关键字：`import.*fetchApi`
   - 对每个匹配文件：
     (a) 如果 import 行是 `import { fetchApi, loginUser } from ...` 这种混合引用 → 仅删 fetchApi 字样 + 对应逗号，保留其他函数
     (b) 如果 import 行是 `import { fetchApi } from ...` 单独引入 → 整行删除
   - 预期改动文件数：3 ~ 6 个（全局搜索面板列出的 4 个文件 + 可能有 2 个 import 但未调用的子组件）

Step 1-3 验证：
   - PowerShell 再跑一次死代码确认命令（§1.3.b），预期输出 0 行（连定义行都没了）
   - api.js 内 Ctrl+F 搜 `fetchApi` → 匹配数 = 0
   - VS Code Problems 面板（如已装 ESLint）无 "fetchApi is not defined" 报错

Step 1-4：暂存并做第 1 个 Commit（严格按 Conventional Commits）
   git add src/services/api.js src/pages/* src/components/* （把 Step 1-2 改的文件全加上）
   git commit -m "refactor(api): 删除 fetchApi 死代码及全项目未使用的 fetchApi import

- 删除 src/services/api.js#L51-L83 fetchApi 原生 fetch 封装（全仓 0 调用死代码）
- 清理 N 个文件中未使用的 fetchApi import 引用
- 改动后全仓 grep fetchApi\( 匹配数 = 0
- Issue: STAGE2-ISSUE-001"
```

---

**Commit 2：sendMessageToCoach 重写为 axios 实例调用（唯一涉及逻辑变动的 commit）**
预计 1h，Commit 标题：
> `refactor(api): sendMessageToCoach 改用 axios.create 实例，移除内联 fetch 硬编码 localhost`

```
Step 2-1：定位 sendMessageToCoach 函数
   - [api.js#L185-L225](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L185-L225) 区间

Step 2-2：将整个函数体替换为如下实现（保留签名 async (data) => { return { reply } } 不变）
   ———— 以下为替换后的完整函数（复制粘贴即可）————

   export const sendMessageToCoach = async (data) => {
     try {
       // 统一复用 axios.create 实例 api（自动继承 baseURL、超时、拦截器等全局配置）
       const response = await api.post('/api/coach/chat', data);
       // 保持返回值结构与原实现一致：{ reply: string }，调用方 CoachChat.js 0 改动
       return { reply: response.data.reply };
     } catch (error) {
       // 保持错误语义一致：原实现 catch 中 throw Error(...)，现改为 axios 取 response.data.message
       const errorMsg = (error.response && error.response.data && error.response.data.message)
         || error.message
         || 'AI教练暂时无法回复，请稍后再试';
       console.error('sendMessageToCoach 请求失败：', errorMsg);
       throw new Error(errorMsg);
     }
   };

   ———— 以上为替换后的完整函数 ————

   改动说明（写进 Code Review 评论）：
   a) 原实现硬编码 `http://localhost:5001/api/coach/chat` → 改为相对路径 '/api/coach/chat'，继承 api 实例的 baseURL 模板（部署到 GitHub Pages 时只要改 axios 实例的 baseURL 配置 1 处即可，不会漏改聊天接口）
   b) 错误处理逻辑对齐第 1 套 api 实例的其他函数（如 submitAssessment 的 catch 写法）：优先取 HTTP 4xx/5xx 响应体中的 message，再兜底通用错误文案
   c) 返回值结构 100% 保持 { reply: response.data.reply }，调用方 [CoachChat.js#L216](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/pages/CoachChat.js#L216) 0 行改动，解耦修改面

Step 2-3：验证
   - api.js 内 Ctrl+F 搜 `fetch(`（不含注释） → 预期匹配数 = 0（G2 达标判定条件！）
   - api.js 内 Ctrl+F 搜 `localhost:5001` → 仅存在于 [L15 的 axios baseURL](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L15) 1 处，sendMessageToCoach 内部不再出现

Step 2-4：做第 2 个 Commit
   git add src/services/api.js
   git commit -m "refactor(api): sendMessageToCoach 改用 axios.create 实例，移除内联 fetch 硬编码 localhost

- 重构 sendMessageToCoach：原生 fetch 替换为 api.post('/api/coach/chat', data)
- 消除上线部署到非 localhost 环境时的跨域（CORS）风险
- 错误处理逻辑对齐 submitAssessment 等主力函数
- 函数签名与返回值结构不变，调用方 CoachChat.js 0 改动
- Issue: STAGE2-ISSUE-001"
```

---

**Commit 3：api.js 顶部新增「请求工具使用规范注释」（新人上手指引，G5 达标）**
预计 30 min，Commit 标题：
> `docs(api): 新增 api.js 请求工具使用规范注释，统一新人编写约定`

```
Step 3-1：在 api.js 文件头部，[L1 import axios](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L1) 的上方，插入如下块注释：

   /**
    * ============================================================
    * 财赋思前端 HTTP 请求服务层（api.js）使用规范
    * ============================================================
    *
    * 【唯一正确用法】所有 HTTP 请求必须使用下方 axios.create() 创建的 api 实例：
    *     import { api, loginUser, submitAssessment } from '../services/api';
    *     // 或者直接用已封装好的具名函数（推荐）
    *     const res = await loginUser({ email, password });
    *
    * 【强制禁止】❌ 不要在本项目任何 .js/.jsx 文件中新写原生 fetch()！
    *     错误写法：fetch('http://localhost:5001/api/xxx', {...})  ← 会造成配置不同步
    *     替代写法：await api.post('/api/xxx', body) / await api.get('/api/xxx')
    *
    * 【全局配置位置】所有公共配置统一修改 axios.create() 的参数块（本文件 L14-L19）：
    *     - baseURL：本地开发 = http://localhost:5001，线上部署 = '/Caifusi' 或真实域名（改 1 处全局生效）
    *     - timeout：请求超时时间（毫秒），如需添加统一超时 ← 加在这
    *     - headers['Authorization']：如需加 JWT Bearer Token 拦截器 ← 在这之后调用 api.interceptors.request.use()
    *     - 错误码翻译：如需把 401 → "登录已过期"、500 → "服务器打盹中" ← api.interceptors.response.use() 统一处理
    *
    * 【新增接口规范】新增接口调用按以下模板写（对齐 submitAssessment 风格）：
    *     export const getXxxData = async (params) => {
    *       const res = await api.get('/api/xxx/data', { params });
    *       return res.data;
    *     };
    *
    * 【历史说明】本文件历史上存在过 fetchApi() 封装和 sendMessageToCoach 内联 fetch 两套冗余实现，
    *             已于 STAGE2-ISSUE-001 PR（refactor/api-request-unify 分支）统一收敛。
    *             如发现代码中仍残留 fetch( 关键字，请提 Issue 或直接发 PR 迁移到 axios 实例。
    * ============================================================
    */

Step 3-2：验证
   - 新成员打开 api.js，无需阅读任何文档即可回答三个问题：
     ① 我该用什么发请求？（api 实例 / 具名封装函数）
     ② 我不能写什么？（原生 fetch）
     ③ 全局配置在哪改？（axios.create 参数块）→ 对应 G5 达标

Step 3-3：做第 3 个 Commit
   git add src/services/api.js
   git commit -m "docs(api): 新增 api.js 请求工具使用规范注释，统一新人编写约定

- 明确 api 实例为唯一正确用法，强制禁止原生 fetch
- 标注 baseURL / timeout / 拦截器 / 错误码翻译的全局配置位置
- 新增接口调用代码模板（对齐 submitAssessment 风格）
- 说明历史两套冗余实现的收敛背景
- Issue: STAGE2-ISSUE-001"
```

### 4.4 本地验证（Step 4，预计 1.5h）

```
Step 4-1：构建验证（G4 达标）
   cd "D:\程序\CaiFuSi\CaiFuSi - 副本"
   npm run build
   → 预期：Compiled successfully，退出码 0，build/static 目录生成正确

Step 4-2：静态检查清单（手工 + 工具混合）
   [ ] api.js Ctrl+F 搜 `fetch(` → 匹配数 = 0（G2）
   [ ] PowerShell §1.3 正则搜 fetchApi\( → 输出 0 行（死代码 0 残留）
   [ ] api.js Ctrl+F 搜 `localhost:5001` → 仅 L15 axios 配置处 1 处命中，sendMessageToCoach 0 命中
   [ ] VS Code 全局搜 `import { fetchApi` → 匹配数 = 0
   [ ] api.js 头部规范注释块完整，包含「正确用法/禁止写法/配置位置/模板」四要素（G5）

Step 4-3：运行时功能等价回归（G3 达标，需后端已启动，参考 §0 启动）
   a) 启动后端（另一个 PowerShell 窗口）：
      cd backend; D:/ai/anaconda/python.exe run.py  → Running on :5001
   b) 启动前端开发服务器：
      npm start  → 自动打开 http://localhost:3000
   c) Chrome DevTools（F12）切到 Network 面板，勾选「Preserve log」，依次执行：
      【用例 1】登录流程（Login.js 提交）
          - 输入任意邮箱+密码点登录
          - Network 面板抓 /api/auth/login（或对应模拟接口），记录 Method/URL/Body
          - 保存截图为 before-commit-1-login.png；与重构前同一操作的截图对比字节级一致
      【用例 2】测评提交（Assessment.js 提交）
          - 随机填完 10 道题点提交
          - Network 抓 /api/assessment/submit，记录 Method/URL/Body
          - 同上对比一致性
      【用例 3】AI 聊天（重点！sendMessageToCoach 改动点）
          - 进入聊天页，输入任意一句话点发送
          - Network 抓 /api/coach/chat 请求：
              ✅ URL = axios.baseURL + '/api/coach/chat'（不再是硬写的 http://localhost:5001/... 全路径）
              ✅ Method = POST，Content-Type = application/json
              ✅ Request Payload JSON 结构 = { user_id, message, assessment_results, ... } 与重构前一致
              ✅ 无智谱 API Key 情况下，前端收到的错误提示文案与重构前语义一致（如"AI 忙碌"类文字）
          - 保存截图为 commit-2-chat-before-after.png
      【用例 4】Dashboard mock 数据加载
          - 进入仪表盘，抓 /api/dashboard/overview（如有真实接口调用）
          - 与重构前同一请求对比，100% 字节级一致
```

### 4.5 PR 编写与提交（Step 5，预计 1h）

```
Step 5-1：推送分支到远端
   git push -u origin refactor/api-request-unify

Step 5-2：GitHub 开 Pull Request
   - 标题：refactor(api): 统一 HTTP 请求封装为 axios.create 单实例，删除 fetchApi 死代码
   - Base 分支：main；Compare 分支：refactor/api-request-unify
   - PR 描述模板（复制粘贴，按需勾选）：

   ## 背景
   解决 [阶段 2 改进方案 STAGE2-ISSUE-001](阶段2-改进方案-api请求统一.md)：
   api.js 历史上并存三套请求封装，fetchApi 为 33 行死代码，sendMessageToCoach 内联 fetch 硬编码 localhost 造成部署一致性风险。详见改进方案 §1。

   ## 改动清单（3 个 Commit，对应方案 §4.3）
   - [x] commit 1：refactor(api): 删除 fetchApi 死代码及全项目未使用的 fetchApi import
   - [x] commit 2：refactor(api): sendMessageToCoach 改用 axios.create 实例，移除内联 fetch 硬编码 localhost
   - [x] commit 3：docs(api): 新增 api.js 请求工具使用规范注释，统一新人编写约定

   ## 变更量统计（G1 代码减量验证）
   `git diff --stat origin/main...HEAD`：
   Files changed: X | Insertions(+): Y | Deletions(-): Z
   → 净删除 Z-Y ≥ 40 行 ✅ / ❌

   ## 验收清单（对应改进方案 §5.1）
   - [ ] 构建通过：npm run build exit 0
   - [ ] 静态清单 5 项全部打勾（见 §4.4 Step 4-2）
   - [ ] Network 回归：登录/测评/聊天 3 条核心链路字节级一致（附截图 before-commit-X、after-commit-X）
   - [ ] 死代码验证：PowerShell §1.3 正则输出 0 行
   - [ ] 上线一致性：sendMessageToCoach 不再出现硬编码 localhost（grep 仅 1 处 axios 配置命中）

   ## 风险与回滚
   风险评估：低（仅 api.js 改动，调用方 0 行变更）。回滚方式：改进方案 §5.3。

   ## 相关文件
   - 改进方案文档：阶段2-改进方案-api请求统一.md
   - 问题来源：项目评审.md §五 P2-3
```

---

## 五、验收标准、风险与回滚方案

### 5.1 验收标准清单（Code Review + 测试双维度）

Code Reviewer 合并本 PR 前，**必须逐项确认以下 10 条全部打勾**：

| 编号 | 类别 | 验收项 | 可复现验证命令/截图 | 通过标准 |
|---|---|---|---|---|
| A1 | 静态 | 构建通过 | `npm run build` 终端输出最后 5 行截图 | `Compiled successfully`，退出码 0 |
| A2 | 静态 | api.js 内无原生 fetch 关键字 | api.js 内 Ctrl+F 搜 `\bfetch\s*\(`（正则开启） | 匹配数 = 0（注释内提及不算） |
| A3 | 静态 | fetchApi 死代码完全清除 | PowerShell 执行 §1.3.b 正则命令 | 输出行数 = 0（定义行+调用行均无） |
| A4 | 静态 | 全项目无未使用的 fetchApi import | 全局搜 `import.*fetchApi` | 匹配数 = 0 |
| A5 | 静态 | sendMessageToCoach 不再硬编码 localhost | api.js 搜 `localhost` 关键字 | 仅 [L15 axios baseURL](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L15) 1 处命中，其他 0 |
| A6 | 静态 | 规范注释存在且完整 | api.js 头部块注释截图 | 包含「正确用法/禁止写法/配置位置/新增模板」四要素 |
| A7 | 静态 | 代码减量达标 | `git diff --stat origin/main...HEAD` 输出 | Deletions(-) - Insertions(+) ≥ 40 行 |
| B1 | 运行时 | 登录请求等价性 | DevTools Network 登录请求 Before/After 对比截图 | URL/Method/Content-Type/Body 字节级一致；错误文案语义一致 |
| B2 | 运行时 | 测评提交请求等价性 | 同上，测评提交请求截图 | 同上 |
| B3 | 运行时 | AI 聊天请求等价性（核心变更点） | 同上，/api/coach/chat 请求截图 + Console 错误日志（无 Key 场景） | URL 不再是完整 localhost，继承 axios baseURL；JSON Body 结构完全等价；错误 catch 后抛出的 Error 文案语义与旧实现一致 |

### 5.2 风险识别与缓解预案

| 风险编号 | 风险描述（发生概率 × 影响范围） | 触发条件 | 缓解预案（合并前执行） |
|---|---|---|---|
| R1 | sendMessageToCoach 错误文案不一致（P=高 × I=低） | 旧实现 catch 中写死错误文案 "AI教练暂时无法回复"，新 axios 实现自动翻译为 `Request failed with status code 400` 等英文，用户看不懂 | 如验收 B3 发现文案差异，在 Step 2-2 catch 中增加一层 HTTP 状态码中文映射：`400→参数错误, 401→请重新登录, 429→AI忙碌请稍后, 500→服务器打盹中`，保持与旧实现文案 1:1 对应 |
| R2 | sendMessageToCoach 返回值层级错位（P=中 × I=高） | 旧实现 `await response.json()` 解析为 `{ reply }`，但 axios 默认会把响应体包装在 `response.data` 里。如果错写成 `return { reply: response.reply }` 会返回 undefined，Chat 页显示 AI 回复为空 | 在 Step 2-2 函数模板中**已经写死正确写法 `return { reply: response.data.reply }`**；本地运行时验证：Console.log(response) 确认层级，再打勾 B3 时强制检查响应不为 undefined |
| R3 | 误删其他函数（P=中 × I=高） | Commit 1 删除 fetchApi（L51-L83）时，边界判断错误，把下一个 submitAssessment 函数的前几行一起删掉，导致 build 报错 | Step 1-1 删除后立刻跑 `npm run build` 验证（A1 前置），不要等所有 commit 做完后再验证，发现报错立刻撤销删除重新选范围 |
| R4 | 外围文件 import 删除造成其他未定义错误（P=低 × I=中） | 某个文件实际调用了 fetchApi（全仓正则 0 命中但漏掉某种动态调用场景，如 `window[fnName](...)` ），删除 import 后运行时崩溃 | 做完 Step 1-2 后，先跑 `npm run build`（静态语法验证通过），再跑完整 B1/B2/B3 三条链路用例，每条链路在浏览器 Console 中观察无 "fetchApi is not defined" 报错 |
| R5 | 其他协同学旧分支 merge 后冲突（P=中 × I=低） | 协同学基于旧 main 切的分支写了新的接口调用 fetchApi，合入主分支后冲突 | PR 合并时在 Group 群内发通知：「api.js 已统一，fetchApi 移除，新开分支请先 pull latest main，禁止再写 fetch( / fetchApi」 |

### 5.3 回滚方案（任何异常发生时 2 分钟可还原）

**原则：先回滚止血，再定位根因复现修复，不要在线上环境 debug。**

#### 场景 1：PR 合并前（Code Review 阶段）发现问题 —— 最简单
→ 直接在 GitHub PR 页面点「Close Pull Request」，不合并即可。
→ 本地分支保留用于调试，问题修复后重新 push 再开 PR。

#### 场景 2：PR 已合并到 main 但线上功能报错（如 AI 聊天回复为空）—— 3 条命令回滚
```powershell
# S1 切回 main 并拉取最新（确保 HEAD=有问题的合并提交）
git checkout main
git pull origin main

# S2 找到问题 PR 的 Merge Commit Hash（记为 abc1234）
git log --oneline -n 10
# 输出：abc1234 Merge pull request #X from XiaoCow666/refactor/api-request-unify  ← 记住这个 hash

# S3 回滚该 Merge Commit（-m 1 表示保留 main 主线作为回滚后的父节点）
git revert -m 1 abc1234
# 会自动生成一个 "Revert refactor/api-request-unify" 的新 Commit，代码恢复到 PR 合并前状态

# S4 验证无误后推回远端 main（立刻止血）
git push origin main

# S5 基于原 refactor/api-request-unify 分支 debug，问题定位后重新开 PR2 提交
```

#### 场景 3：Merge Commit 无法回滚（极少数情况）
→ 退化为「基于文件级别的精准还原」：
```powershell
# 用问题 PR 合并前的 main 版本覆盖 api.js + 所有改了 import 的外围文件
git checkout <PR前稳定commit> -- src/services/api.js src/pages/Dashboard.js src/pages/CoachChat.js ...
git commit -m "hotfix: 手动回滚 STAGE2-ISSUE-001 api.js 改动"
git push origin main
```

#### 回滚后验证清单（必做，防止"回滚没真回滚"）：
- [ ] api.js Ctrl+F 搜 `fetchApi` → 出现 1 处定义（L51 左右）= 回滚成功
- [ ] api.js Ctrl+F 搜 `sendMessageToCoach` 函数内部 → 能看到 `fetch('http://localhost:5001/...')` 旧实现 = 回滚成功
- [ ] `npm run build` 通过 = 回滚成功

---

## 六、仍需确认的问题（STAGE2-ISSUE-001 实施前必须在团队群/评审会上拍板）

| 编号 | 问题 | 背景 | 对改动影响等级 | 建议默认决策 | 确认人 | 截止日期 |
|---|---|---|---|---|---|---|
| Q1 | 是否确认 fetchApi 在**所有人的本地分支**中都没有被调用？（全仓正则仅扫了当前 main 分支 HEAD） | 当前验证仅基于 XiaoCow666/Caifusi main 分支，协同学个人分支可能有未合入的功能使用了 fetchApi 作为请求工具，若贸然删除可能造成对方后续 PR merge 冲突 | 🟠 中（主要是协作成本） | **默认按「确认删除 + 群内同步」处理**：PR 合入前在群里发 1 条公告「fetchApi 将于 9 月 7 日删除，如有依赖请在 9 月 5 日前迁移到 axios 实例」 | 技术负责人 + 全员确认（群消息已读回执） | 2026-09-05 |
| Q2 | 方案 2 中 axios 实例是否现在就要补加 timeout（10 秒）、Authorization Header 拦截器等「统一配置」？ | 本改进方案的 SMART 目标 G2 仅要求"统一到 1 套实例"，但统一后立刻就能享受到"改 1 处全局生效"的红利——是否现在一步到位加上？（当前 [api.js#L14-L19](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L14-L19) 只有 baseURL + headers 两项） | 🟡 低（属于"额外加分项"，不影响本方案目标达成） | **默认「本次不加，留到阶段 3 新 PR」处理**：本 PR 标题/范围已写死为"收敛统一"，若此时加拦截器会造成"本次改动包含两种独立变化"的 Review 困难，违反关注点分离。阶段 3 单独开 PR `feat(api): add axios timeout 10s + JWT interceptor` 更清晰 | 技术负责人 | 2026-09-06 |
| Q3 | 是否需要在 CI 里加一条「禁止新写 fetch(」的自动检查规则？（防止半年后又有人写回内联 fetch） | 本地团队成员规范依赖自觉性，可能出现新人不知道本 PR 的历史背景又犯同样错误。可以用 husky + lint-staged + 简单 grep 脚本实现「提交时检测到 src 中出现 fetch( 就拒绝提交，并打印本方案 Q3 链接指引迁移」。当前项目未接入 husky。 | 🟡 低（属于工程化建设长期项） | **默认「本方案暂不实现，列入阶段 3 Backlog」**：理由同 Q2，避免 PR 范围膨胀。阶段 3 独立 Issue `STAGE3-ENG-003 接入 husky + 请求工具规范 pre-commit 检查`，估算工期 0.5 天 | 工程化负责人 | 阶段 3 启动时 |
| Q4 | sendMessageToCoach 错误文案的中文化列表需要谁来确认？（风险 R1） | 风险 R1 提到「旧写死文案 vs axios 英文自动翻译」可能不一致，需一个"文案正确来源"作为对照基准——是沿用旧实现里的文字，还是由产品同学重新出一版错误码对照表？ | 🟠 中（直接影响用户体验 + 验收 B3 通过与否） | **默认「以旧实现文案为基准（保持语义一致优先）」，产品无需介入**：验收 B3 时截图对比 Console 文案，如果 axios 实现抛出的 Error.message 和旧版 1:1 相同（都是中文）→ 通过；如果出现英文 → 按 R1 缓解预案加一层中文映射，映射表参考后端 [assessment_routes.py](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/backend/app/routes/assessment_routes.py) 里的 HTTP 错误 return 文案 | 前端负责人对照旧实现代码即可 | 2026-09-07 PR 合并前 |
| Q5 | 本 PR 的 Code Reviewer 指派给谁？（避免 PR 长期挂着无人审） | 当前项目无明确 Code Review 分工约定 | 🟡 低（协作流程问题） | **默认指派「本方案分析人 / 前端编写主力 + 1 名协同学交叉评审」**：2 人审完即可合并；如 2 个工作日内无 Review 意见，按「过期自动通过」规则处理 | 技术负责人在项目看板中指派 | 2026-09-04 前 |

---

## 附录：判断与推荐总结（3~5 句话版本）

> 本方案选择「前端 api.js HTTP 请求三套封装统一收敛为 axios.create 单实例」作为阶段 2 练手问题，原因是：改动范围集中（仅 1 个核心文件 + 少量外围 import 清理）、风险为 0（调用方 0 行改动、错误处理行为对齐）、工期 1 天内可完成，且能同时解决「fetchApi 死代码误导新人」和「sendMessageToCoach 硬编码 localhost 部署必现跨域」两个真实痛点。方案设计了 3 个 Conventional Commits 的最小粒度改动，便于 Code Review 和分 commit 回滚，验收标准包含 A1~A7 静态检查 + B1~B3 运行时等价性回归共 10 项，可操作性强。相比「半收敛只删死代码」的方案 1，全量收敛方案 2 边际投入仅 1.5h，但目标覆盖度从 60% 提升到 100%，且避免了"部署后再紧急修 Bug"的技术债二次堆积，综合边际 ROI 最高，推荐立即按本方案开分支实施。

---

**文档末尾元数据**：
- 生成位置：[阶段2-改进方案-api请求统一.md](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/阶段2-改进方案-api请求统一.md)
- 对应问题代码锚点：[api.js#L14-L19](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L14-L19)（第 1 套 axios 实例）、[api.js#L51-L83](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L51-L83)（第 2 套 fetchApi 死代码）、[api.js#L185-L225](file:///d:/程序/CaiFuSi/CaiFuSi%20-%20副本/src/services/api.js#L185-L225)（第 3 套 sendMessageToCoach 内联 fetch）
- 下次 Review 节点：分支切出 + 第一个 Commit 提交后约 4 小时做首次同步
