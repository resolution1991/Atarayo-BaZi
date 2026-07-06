# 八字排盘软件重构计划

## 目标

将现有 Python + Flask + 静态前端原型，重构为可跨平台发布、可完全离线运行的 uni-app 应用。

目标平台优先级：

1. Android App 安装包
2. iOS App 安装包
3. H5 调试版本

## 基本约束

- 核心排盘逻辑默认保持不变。
- 只有明显、低级、可验证的错误才允许修正，并且必须记录在“低级错误修正清单”中。
- 前端交互和样式可以重新设计，移动端优先。
- 软件必须完全离线运行，不依赖 Flask 服务、远程 API、在线农历接口、uniCloud 或在线 AI 服务。
- 现有 Python 项目暂作为参考实现和基准样例来源，不在原目录上直接重构。

## 当前资产

原项目目录：`/Users/algernon/Documents/自制排盘软件`

现有主要模块：

- `stp1_bazi_core.py`：日期解析、农历查询、四柱基础计算。
- `stp2_bazi_enhancer.py`：补全阴阳、五行、藏干。
- `stp3_shi_shen_analyzer.py`：十神分析。
- `stp4_bazi_qiangruo.py`：身强身弱判断。
- `stp5_bazi_geju.py`：格局判断。
- `knowledge_base/lunar_calendar.csv`：本地农历/干支数据表。
- `knowledge_base/geju_character.json`：格局性格库。
- `front/`：原静态前端原型。

## 目标架构

建议使用：

- `uni-app`
- `Vue 3`
- `TypeScript`
- 本地静态数据文件
- `uni.setStorage` / `uni.getStorage` 作为首版历史记录存储

建议核心目录：

```text
src/
  core/
    calendar.ts
    rules.ts
    enhance.ts
    shi-shen.ts
    strength.ts
    geju.ts
    calculate.ts
  data/
    lunar-calendar.ts
    geju-character.json
  pages/
    index/
    chart/
    history/
```

## 迁移路线

### 阶段 1：基准冻结

已在当前工作区建立：

- `baseline/cases.json`：重构前对照输入样例。
- `tools/generate_baseline.py`：调用原 Python 逻辑生成基准结果。
- `baseline/results/current_python_baseline.json`：基准输出结果。

后续 TypeScript 版本必须用这些样例做结果对比。

### 阶段 2：低级错误确认

候选修正项：

1. Web 主流程第 4 步文件名断链：`server.py` 期望 `<timestamp>_4th_stp.json`，但 `stp4_bazi_qiangruo.py` 固定写入 `new_4th_stp.json`。
2. `stp5_bazi_geju.py` 中专旺格月支列表疑似误把天干 `戊` 写入地支列表，可能应确认是否为 `戌`。
3. `/history` 路由使用 `render_template`，但未导入且没有模板文件。
4. 前端存在 `style.css` 与 `styles.css` 两套样式残留，实际页面只引用 `style.css`。

暂不直接修正“身强身弱规则”或“格局判断规则”的主观命理争议，除非后续有明确规则依据。

### 阶段 3：核心逻辑移植

将 Python 逻辑逐模块移植为 TypeScript 纯函数：

1. 日期解析与农历数据查询。
2. 时辰干支计算，包括 23 点后换日逻辑。
3. 五行、阴阳、藏干补全。
4. 十神分析。
5. 身强身弱判断。
6. 格局判断。

每完成一个模块，都用基准样例对比输出。

当前进展：

- 已建立 uni-app / Vue 3 / TypeScript 工程骨架。
- 已移植 `calendar`、`rules`、`enhance`、`shi-shen`、`strength`、`geju`、`calculate` 核心模块。
- 已新增 `tests/core-baseline.test.ts`，用 Node 24 TypeScript 类型擦除能力直接运行核心测试。
- 已新增 `tools/generate_lunar_fixture.py`，从原 CSV 抽取基准测试所需的最小农历数据夹具。
- 当前 12 个基准样例已通过 TypeScript 对照测试，输出与原 Python 基准一致。

注意：`src/data/lunar-calendar.fixture.ts` 只是测试/原型夹具，不是最终全量离线数据。

### 阶段 4：离线数据优化

当前 `lunar_calendar.csv` 约 4.5MB，不建议在 App 运行时解析 CSV。

建议在构建前预处理为更适合前端读取的结构：

- 按日期 key 的压缩 JSON。
- 或生成 TypeScript 常量。
- 如体积仍偏大，再考虑按年份分片加载。

当前进展：

- 已新增 `tools/generate_lunar_data.py`。
- 已生成 `src/data/lunar-calendar.generated.ts`，覆盖 `1900-01-01` 至 `2100-02-08`。
- 已新增 `src/data/lunar-calendar.ts` 作为运行时读取入口。
- 页面已从测试夹具切换到全量离线数据。

### 阶段 5：uni-app 页面

首版页面只保留核心闭环：

1. 首页：姓名、性别、出生日期时间输入。
2. 命盘页：四柱、十神、藏干、身强身弱、格局。
3. 历史页：本地历史记录查看与删除。

当前进展：

- 首页已完成移动端 MVP UI。
- 首页已支持公历/农历生日输入。
- 农历输入已支持年份干支生肖、中文月份、中文日期展示。
- 命盘页已完成四柱、十神、藏干、五行分布、身强身弱、格局展示。
- 命盘页已支持直接编辑姓名并保存到本机历史记录。
- 历史页已支持搜索、单条删除、清空全部。
- 不支持或暂不稳定的竞品入口未纳入 MVP。

### 阶段 6：打包验证

顺序：

1. H5 本地调试。
2. Android 真机安装包。
3. iOS 真机或 TestFlight 分发。

当前进展：

- 已安装 uni-app / Vue / Vite 依赖，并生成 `pnpm-lock.yaml`。
- 已新增 `pnpm-workspace.yaml`，显式允许 `esbuild`、`core-js`、`core-js-pure` 的依赖构建脚本。
- 已将工程调整为 uni-app 标准 `src/` 目录结构。
- `pnpm run build:h5` 已通过。
- 浏览器冒烟验证已通过：
  - 首页可加载。
  - 点击“生成命盘”可进入命盘页。
  - 命盘页显示 `王大锤（男）`、四柱、身强身弱、格局。
  - 历史页可显示本地记录。
  - 桌面与移动视口均验证过主流程。

MVP 基线：

- 当前版本固化为 `MVP 0.1.0`。
- 基线说明见 `MVP_BASELINE.md`。
- 封包前检查项见 `PACKAGING_CHECKLIST.md`。

## 待确认问题

- iOS 是否只需要自用安装，还是计划上架 App Store。
- 历史记录是否需要导出、分享、备份。
- 格局性格库是否首版展示，还是先只展示格局名称。
- 是否要支持真太阳时、出生地、时区修正。当前原逻辑未支持，首版建议不加入。
