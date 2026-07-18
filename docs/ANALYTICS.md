# 匿名使用统计

线上站点是 GitHub Pages 静态导出，因此统计事件直接写入 Supabase。浏览器使用的 anon key 只能插入 `quiz_events`，不能读取、修改或删除数据；统计视图只在 Supabase 后台可见。

## 首次配置

1. 创建一个 Supabase 项目。
2. 在 SQL Editor 运行 [`../supabase/analytics.sql`](../supabase/analytics.sql)。
3. 在本地复制 `.env.example` 为 `.env.local`，填写 Project URL 和 anon/public key。
4. 在 GitHub 仓库的 Actions secrets 中添加 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
5. 重新部署 GitHub Pages。

公开 anon key 是前端项目的正常配置，不要把 `service_role` key 放进环境变量或 GitHub Pages。

## 查看数据

在 Supabase 的 Table Editor 查看原始 `quiz_events`，或在 SQL Editor 查询：

```sql
select * from analytics_daily_usage;
select * from analytics_persona_distribution;
select * from analytics_answer_distribution;
select * from analytics_joker_answers;
```

`analytics_persona_distribution` 会直接显示九种人格的真实完成比例。`analytics_answer_distribution` 以完成时的最终答案路径统计，不会因为用户返回修改答案而重复计算。`analytics_joker_answers` 会并排显示 JOKER 用户和全体用户的选项比例，用于定位哪些题目最容易把结果推向 JOKER。

## 隐私与计数规则

- 随机匿名 session ID 只保存在当前浏览器；应用事件表不记录姓名、邮箱、完整 URL、User-Agent 或原始 IP。
- 每次点击“开始”都会创建新的 attempt ID；开始次数与完成人数都按 attempt 去重。
- 浏览器启用 Do Not Track 时不上报。
- 未配置两个环境变量时，统计函数静默停用，测试和页面功能不受影响。
- 公开写入口仍可能收到机器人流量；分析异常峰值时应结合每日趋势检查。
