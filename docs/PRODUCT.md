# V2 产品说明

## 产品定位

Travel Personality Indicator V2 是一个为社交传播设计的娱乐测试。题目借用群聊、FOMO、拍照、临时邀约和消费选择等日常场景，避免直接询问“喜欢酒店还是民宿”这类显性旅行偏好。

结果由四层组成：

1. 人格代码与人格名称
2. 对应人格的简约几何动物 2D 形象、不展示具体数字的六维雷达图，以及合并主吐槽和旅行建议的 AI 总结
3. 理论上最适合的虚构世界
4. 三个可以实际搜索航班的现实目的地

## 六个隐藏维度

| 维度 | 含义 | 高分倾向 |
| --- | --- | --- |
| 🎭 NPC | 跟随别人还是自己带节奏 | 愿意跟队、重视同行关系 |
| 🤡 整活 | 探索和临场发挥 | 接受随机路线、把翻车变成故事 |
| 🔥 上头 | 冲动和 FOMO | 容易被限定、热点和稀缺感推动 |
| 💸 氪金 | 为体验付费 | 愿意用预算换时间、舒适和效率 |
| 📸 出片 | 分享与仪式感 | 重视光线、穿搭、构图和记录 |
| 🧠 拿捏 | 规划和控制 | 擅长攻略、备选方案和时间管理 |

用户不会在答题过程中看到权重。每个选项可以同时影响多个维度。

## 9 种人格代码

结果首先展示人格代码，再用英文人格名和中文梗解释补充含义。

| 代码 | 人格 | 代码解释 |
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

每个人格还包含一句话介绍、三个标签、优势、弱点、旅行方式、理想旅伴、六维目标向量和虚构世界映射。

V2 曾包含独立的 Weekend Goblin、Airport Guardian、Spreadsheet Pilot、Google Maps Believer、Aesthetic Smuggler、Dopamine Nomad、Off-grid Oracle、Hidden Gem Collector 和 Culture Time Traveller。它们与现有人格的表达区域重叠，现已分别合并进 `FOMO`、`GPS`、`GPS`、`GPS`、`C位`、`FOMO`、`404`、`404` 和 `GPS`；早期分享链接仍可正常打开。

## 虚构世界与现实目的地

| 虚构世界 | 现实目的地 |
| --- | --- |
| Grand Line 伟大航路 | Okinawa、Palawan、Krabi |
| Middle-earth 中土世界 | Queenstown、Inverness、Calgary |
| 银河帝国边境 | Reykjavík、Tromsø、Rovaniemi |
| Atlantis 亚特兰蒂斯 | Santorini、Malé、Bali |
| Disney Castle 童话城堡 | Munich、Paris、Prague |
| Pokémon World 宝可梦世界 | Tokyo、Taipei、Singapore |
| Pandora 潘多拉星球 | Zhangjiajie、Kauai、San José |
| Bikini Bottom 比奇堡 | Honolulu、Cancún、Cebu |

现实目的地包含城市、国家或地区、IATA 代码、推荐原因和与虚构世界的联系。中文界面打开“中国 → 当地”的天巡机票搜索，英文界面打开“UK → destination”的 Skyscanner 机票搜索；当前 V2 UI 默认为中文。

## 六套吐槽策略

- 旅行人格扫描
- 上头行为审计
- 旅行事故复盘
- 朋友圈素材分析
- 同行风险评估
- 异世界安置计划

策略不是随机抽取。同一套答案会稳定命中同一方案；答案变化可能同时改变策略、具体吐槽、旅行建议和目的地解释。

每种人格还拥有独立的长总结和代表台词。长总结使用短段落与重点句组合，例如 `NPC` 强调“永远有人帮你做攻略”，`JOKER` 强调“计划基本没有生还可能”；这些内容同样是本地固定文案，不调用模型。

## 分享体验

- 生成固定 1080 × 1440 PNG 人格海报，不截图网页长页面
- 海报包含人格代码、稳定结果 Hash、对应的简约几何动物形象、六维等级、AI 总结、目的地和邀请二维码
- 海报中的 Travel DNA 不公开具体分数，按 `低调 / 在线 / 高能 / 爆表` 四档展示
- 生成后先显示海报预览，再提供保存图片、复制结果链接和系统社交分享
- 原生分享只传递一个海报文件，避免复制出重复图片；不支持文件分享时回退为复制结果链接
- 每份结果显示可一键复制的 `#TPI-XXXXXXXX` Hash；相同人格、分数和答案会得到相同值
- 复制可复现结果的分享链接，结果 Hash 直接显示在 URL 末尾，例如 `...?result=...#TPI-B93D216F`
- 通过系统分享面板邀请朋友重新测试
- 邀请链接只携带邀请方的人格 ID，不携带完整答案

分享结果链接包含人格 ID、六维分数和压缩后的选项路径，数据不上传到项目后端。
