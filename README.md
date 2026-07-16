# Travel Personality Indicator · V2

一个为分享而生的旅行人格测试。用户通过 16 道互联网行为题，得到旅行人格代码、几何动物形象、六维雷达图、固定多方案 AI 总结、异世界目的地和现实航班推荐。

![Travel Personality Indicator V2 Social Preview](public/social-preview.png)

> 不需要 OpenAI API，也不需要环境变量。计分、人格匹配、文案组合、海报和二维码全部在浏览器本地生成。

V2 是仓库中的独立 Next.js 应用，不会覆盖根目录的原版测试。

## 产品体验

```text
首页
  → 16 道互联网行为题
  → 六维隐藏计分
  → 9 种人格匹配
  → 本地固定多方案 AI 总结
  → 1 个虚构世界
  → 3 个现实目的地与 Skyscanner 航班入口
  → 结果链接 / 人格海报 / 邀请朋友
```

题目不会直接询问酒店、景点或旅行方式，而是从“突然放假”“群聊没人回复”“只剩最后两个名额”等日常场景推断旅行习惯。它不是心理测评，重点是有梗、好看、值得分享。

## 当前内容

### 九种旅行人格

| 代码 | 人格 | 一句话解释 |
| --- | --- | --- |
| `JOKER` | Chaos Traveller | 翻车也能变成段子 |
| `FOOD` | Food Hunter | Food First，干饭优先 |
| `RICH` | Luxury Escaper | 能花钱解决就不硬扛 |
| `C位` | Main Character Traveller | 镜头一开自动站到主角位 |
| `FOMO` | FOMO Rocketeer | 错过什么都不能错过限定 |
| `ZZZZ` | Soft Life Migrant | 自然醒才是旅行主线 |
| `NPC` | Social Compass | No Plan, Chill，跟队也快乐 |
| `GPS` | Budget Alchemist | Good Price System，省钱导航 |
| `404` | Planet Earth Expat | 信号未找到，人已离线 |

每种人格拥有独立的简约几何动物形象、长总结、代表台词、旅行建议和目标维度向量。

### 六个隐藏维度

- 🎭 NPC：跟随别人还是自己带节奏
- 🤡 整活：临场发挥、探索和随机支线
- 🔥 上头：冲动、FOMO 和被限定种草
- 💸 氪金：是否愿意花钱换体验和效率
- 📸 出片：拍照、分享和仪式感
- 🧠 拿捏：规划、控制和备选方案

### 目的地推荐

9 种人格映射到 8 个虚构世界和 24 个现实目的地，包括 Grand Line、Middle-earth、Pokémon World、Pandora 和 Bikini Bottom。

每次结果提供三个不同国家或地区的现实目的地。当前页面默认为中文并生成中国出发的天巡链接；底层链接工具同时保留英文版所需的 UK 出发配置。

## 分享能力

- 结果页展示稳定的 `#TPI-XXXXXXXX` Hash
- 分享 URL 可完整恢复人格、六维分数和总结方案
- Hash 直接显示在 URL 末尾，方便复制和保存
- 生成固定 `1080 × 1440` PNG 人格海报
- 海报包含人格形象、Travel DNA 四档等级、AI 总结、目的地和二维码
- 生成后先预览，再保存或打开系统社交分享
- 二维码只邀请朋友重新测试，不公开答题记录
- `1200 × 630` Social Preview 已接入 Open Graph 与 Twitter Card

这里的“AI 总结”是产品语气，不代表运行时模型调用。总结由本地规则和固定文案池按答题路径稳定组合，相同答案会得到相同结果。

## 本地运行

需要 Node.js 20 或更高版本：

```bash
node --version
```

进入 V2 目录并安装依赖：

```bash
cd v2
npm ci
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

如果终端提示 `env: node: No such file or directory`，说明当前系统尚未安装 Node.js，或 Node 没有加入 `PATH`。安装 Node.js 20+ 后重新打开终端，再运行以上命令。

## 常用命令

```bash
npm run dev                         # 启动本地开发服务器
npm run typecheck                   # TypeScript 静态检查
npm run build                       # 生产构建
npm test                            # 运行 Playwright 测试
npm run analyze:balance -- 1000000 # 运行人格概率模拟
```

首次运行浏览器测试前安装 Chromium：

```bash
npx playwright install chromium
```

当前测试覆盖完整 16 题流程、人格概率、无性别文案、目的地目录、分享链接、结果 Hash、人格海报、二维码和社交分享回退。

## 技术实现

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- QRCode
- Playwright

核心逻辑完全解耦：

- [`data/questions.json`](data/questions.json)：题目、答案和多维权重
- [`data/catalog.ts`](data/catalog.ts)：人格、世界和现实目的地
- [`data/persona-calibration.json`](data/persona-calibration.json)：人格概率校准
- [`lib/scoring.ts`](lib/scoring.ts)：归一化计分和人格匹配
- [`lib/analysis.ts`](lib/analysis.ts)：固定多方案总结生成器
- [`lib/share.ts`](lib/share.ts)：分享编码、Hash 和剪贴板回退
- [`lib/poster.ts`](lib/poster.ts)：人格海报和二维码
- [`components/result.tsx`](components/result.tsx)：结果展示与分享交互

## 目录结构

```text
v2/
├── app/                 # 页面、Metadata、Favicon 和全局样式
├── components/          # 首页、问卷、等待态、雷达图和结果页
├── data/                # 问题、人格、目的地和校准数据
├── docs/                # 产品与技术说明
├── lib/                 # 计分、分析、分享和海报逻辑
├── public/
│   ├── personas/        # 九种几何动物人格形象
│   └── social-preview.png
├── scripts/             # 概率审计与 Social Preview 工具
└── tests/               # Playwright 自动化测试
```

## 部署到 Vercel

1. 在 Vercel 导入本仓库。
2. 将 **Root Directory** 设置为 `v2`。
3. Framework Preset 选择 **Next.js**。
4. 直接部署，不需要配置 API Key 或其他环境变量。

生产版本不包含 `/api/analyze`。所有结果逻辑都随前端代码运行。

## 修改内容

修改题目、权重、人格数量或人格向量后，必须重新运行概率模拟与测试：

```bash
npm run analyze:balance -- 1000000
npm run typecheck
npm test
```

添加目的地时，需要提供城市、国家或地区、IATA 代码、推荐原因和虚构世界联系，并确认三个推荐不会来自同一国家。

详细规则：

- [产品说明](docs/PRODUCT.md)
- [技术说明](docs/ARCHITECTURE.md)
- [扩展检查清单](docs/ARCHITECTURE.md#扩展检查清单)

## 免责声明

- 本测试仅供娱乐，不是心理评估或旅行安全建议。
- 航班价格、航线和可用性以 Skyscanner 页面为准。
- 虚构世界名称只用于幽默表达，与相关权利方没有合作或背书关系。
