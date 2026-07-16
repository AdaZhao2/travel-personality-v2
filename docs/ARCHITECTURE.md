# V2 技术说明

## 数据流

```text
questions.json
  → 16 个选项答案
  → 六维原始分数
  → 按各维理论最大值归一化到 0–100
  → 与 9 个人格目标向量计算距离
  → 选出最近人格
  → 读取人格对应的虚构世界和三个现实目的地
  → 使用答案路径生成稳定 seed
  → 组合吐槽策略、行为证据、旅行建议和推荐解释
  → 结果页与分享链接
```

整个流程在浏览器本地完成，没有分析 API、模型调用或运行时环境变量。

## 计分与人格匹配

题目位于 [`../data/questions.json`](../data/questions.json)。每个选项通过 `weights` 同时影响一个或多个维度。

[`../lib/scoring.ts`](../lib/scoring.ts) 会先计算每个维度在全部题目中的理论最高分，再把用户原始分数归一化为 0–100：

```text
归一化分数 = 用户维度原始分数 ÷ 该维度理论最高分 × 100
```

9 种人格在 [`../data/catalog.ts`](../data/catalog.ts) 中各自拥有一个六维目标向量。直接使用欧氏距离时，中间型人格会吸收大部分普通答案，极端人格几乎无法获得；因此系统会用 [`../data/persona-calibration.json`](../data/persona-calibration.json) 中的距离均值、标准差和偏置计算相对接近度，再选出校准距离最小的人格。

校准以“每道题四个选项等概率”为产品基准，不代表真实用户分布。当前百万次固定种子模拟中，校准后命中率约为 10.15%–12.20%，理论平均值是 11.11%。六维答案仍决定人格，校准只修正不同目标向量天然占据区域大小不一致的问题。

修改题目权重、题目数量、人格向量或人格数量后，应运行：

```bash
npm run analyze:balance -- 1000000
```

同时更新校准数据，并确保人格概率测试继续通过。

## 多方案吐槽生成

[`../lib/analysis.ts`](../lib/analysis.ts) 使用答案路径和六维分数计算稳定 seed，再决定：

- 六套策略中的哪一套
- 最高、次高和最低维度对应的吐槽句
- 当前人格对应的长总结、重点句和代表台词
- 合并旅行方式、行程节奏和互补旅伴的旅行建议
- 虚构世界及三个现实目的地的解释角度

稳定 seed 保证相同答案得到相同文案，同时让不同答题路径产生多个方案。文案池是固定、可审查和可测试的，不存在模型输出漂移。

## 分享链接

结果链接使用 URL-safe Base64 编码一个紧凑对象，避免普通 Base64 中的 `+`、`/`、`=` 被聊天软件或浏览器改写：

```ts
{
  p: "chaos-traveller",             // 人格 ID
  s: { npc: 25, chaos: 100, ... },  // 六维分数
  a: "abcd..."                      // 按题目顺序压缩的选项路径
}
```

页面打开链接后，会从本地 catalog 读取人格和目的地，并用答案路径重新生成同一套吐槽。链接数据不会发送到项目后端。

解析器同时兼容早期版本生成的普通 Base64 链接。系统分享不可用或失败时，结果页会回退为复制链接；剪贴板 API 不可用时还会使用页面内复制方案。

早期分享链接会兼容映射：`airport-dad`、`airport-guardian`、`spreadsheet-pilot`、`maps-believer`、`culture-time-traveller` → `budget-alchemist`，`weekend-goblin`、`dopamine-nomad` → `fomo-rocketeer`，`aesthetic-smuggler` → `main-character`，`off-grid-oracle`、`hidden-gem-collector` → `planet-earth-expat`。

邀请链接只包含 `from=<persona-id>`，用于显示邀请方的人格身份并让朋友从头答题。

## 关键文件

| 文件 | 职责 |
| --- | --- |
| `data/questions.json` | 题目、选项、反馈文案和多维权重 |
| `data/catalog.ts` | 9 种人格、8 个世界、24 个目的地 |
| `data/persona-calibration.json` | 人格相对距离的均值、标准差与概率校准偏置 |
| `public/personas/` | 当前人格对应的 768 × 768 简约几何动物 2D 形象，以及早期版本候选素材 |
| `lib/scoring.ts` | 归一化、向量距离和 Skyscanner URL |
| `lib/analysis.ts` | 策略、文案池和稳定组合逻辑 |
| `lib/share.ts` | URL-safe 分享编码、旧链接兼容和剪贴板回退 |
| `lib/poster.ts` | 1080 × 1440 Canvas 海报及邀请二维码 |
| `components/travel-app.tsx` | 首页、问卷、等待态和结果状态机 |
| `components/result.tsx` | 结果展示、海报、结果链接和邀请分享 |
| `tests/` | 完整流程、静态架构、邀请入口和海报二维码测试 |
| `scripts/analyze-persona-balance.mjs` | 固定种子人格命中率模拟 |

## 扩展检查清单

### 添加或修改题目

1. 在 `data/questions.json` 中维护稳定且唯一的题目 ID。
2. 每个选项保持稳定且唯一的选项 ID。
3. `weights` 只能使用六个既有维度 key。
4. 避免直接询问旅行偏好，优先使用日常行为场景。
5. 修改题目顺序会影响分享链接中的答案路径；上线后应考虑兼容旧链接。

### 添加人格

1. 在 `data/catalog.ts` 添加唯一的 `id` 和 `code`。
2. 补齐代码解释、英文名、标签、优势、弱点、旅行方式与旅伴。
3. 为六个维度提供 0–100 的完整目标向量。
4. 引用一个已存在的 `worldId`。
5. 把新代码加入产品文档和人格代码浏览器测试断言。

### 修改吐槽方案

1. 在 `lib/analysis.ts` 维护策略或文案池。
2. 文案保持娱乐化，避免心理诊断、歧视和人身攻击。
3. 不要引入运行时随机数，否则分享链接无法稳定复现。
4. 确保所有分支都返回完整的 `Analysis` 类型。

### 添加目的地

1. 在对应世界下添加城市、国家或地区、emoji 和 IATA 代码。
2. 补齐推荐原因以及与虚构世界的联系。
3. 检查 Skyscanner 跳转是否使用正确 IATA 代码。

Skyscanner 链接统一使用 referral `flights/browse-view`：中文界面设置 `origin=CN&market=CN&locale=zh-CN&currency=CNY`，英文界面设置 `origin=UK&market=UK&locale=en-GB&currency=GBP`，两者都携带目的地 IATA。不要改回 `/transport/flights/?destination=...`，该旧格式目前会返回 404。

## 验证

```bash
npm run typecheck
npm run build
npm test
```

预期生产路由只有 `/` 和 `/_not-found`。如果构建结果出现 `/api/*`，说明项目重新引入了服务端路由，需要确认是否符合纯静态设计。

## 部署

在 Vercel 中将 Root Directory 设置为 `v2`，然后按 Next.js 项目直接部署。无需配置环境变量。

仓库根目录的 `docs/` 是原版 GitHub Pages 发布目录，不要把 V2 技术文档移动到那里。
