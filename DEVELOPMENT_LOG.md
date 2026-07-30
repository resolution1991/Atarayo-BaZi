# Development Log / 开发日志

## 2026-07-30 - Version 0.4.0 / 版本 0.4.0

### English

- Added five-element coloring to the stems and branches shown in local history records.
- Replaced the history category shortcut with gender, birth-year, and zodiac filters plus a clear-filter action.
- Updated the history search placeholder to focus on the chart owner's name.
- Added structured clipboard export on the chart page, excluding the person's name while including calendar dates, gender, both strength-school results, pattern, four pillars, stars, hidden stems, Shen Sha, and Ganzhi relations.
- Added a second clipboard export on the Da Yun / Liu Nian page for the current year and the following nine years, including each year's active Da Yun and Liu Nian details.
- Added deterministic tests for both export formats, including cross-Da-Yun boundaries and name-exclusion checks.
- Added the internal offline-first version roadmap.
- Bumped Android and project version metadata to `0.4.0` (`versionCode` 4).
- Passed all core/rule/export tests and the H5 production build.
- Built and verified the `0.4.0` debug APK, including v1/v2/v3 signatures, no declared Android permissions, upgrade persistence, cold start, history filtering/coloring, both clipboard exports, and an empty crash buffer on Android API 37.

### 中文

- 历史记录中的天干地支增加五行颜色。
- 原历史分类快捷区替换为性别、出生年份、属相筛选及清除筛选操作。
- 历史搜索提示调整为按命主姓名搜索。
- 命盘页增加结构化剪贴板导出；不包含姓名，包含公历/农历、性别、两派身强身弱、格局、四柱、主辅星、藏干、神煞及干支关系。
- 流年大运页增加从当前年起连续十年的剪贴板导出，逐年匹配实际所处大运和流年信息。
- 为两类导出增加可复现测试，覆盖跨大运边界和姓名排除。
- 增加内部离线优先版本演进计划。
- 项目及 Android 版本升级为 `0.4.0`（`versionCode` 4）。
- 全部核心、规则与导出测试通过，H5 生产构建通过。
- 完成 `0.4.0` 调试 APK 构建与校验：v1/v2/v3 签名通过、无 Android 权限声明；并在 Android API 37 验证覆盖升级数据保留、冷启动、历史筛选与五行颜色、两项剪贴板导出，crash buffer 为空。

## 2026-07-28 - Version 0.3.0 / 版本 0.3.0

### English

- Added a switch between traditional and academic strength-analysis schools while keeping the traditional result as the default.
- Implemented the academic weighted scoring rules and regression cases where the two schools produce different conclusions.
- Added an in-app rule reference page covering both strength schools, Da Yun and Liu Nian calculation, pattern rules, and Shen Sha rules.
- Enlarged and respaced the home-page eight-character preview for mobile screens.
- Fixed five-element colors in the Da Yun / Liu Nian table.
- Replaced the document expand/collapse font glyph with a rounded two-line vector chevron.
- Bumped Android and project version metadata to `0.3.0` (`versionCode` 3).

### 中文

- 新增身强身弱“传统派 / 学术派”切换，默认继续使用传统派。
- 实现学术派权重量化规则，并补充两派结论不同的回归用例。
- 新增应用内“流派 / 规则说明”页，覆盖两种身强身弱规则、流年大运推算、格局与神煞规则。
- 放大首页八字预览字号并优化移动端横向间距。
- 修复流年大运表格干支的五行颜色。
- 将文档展开/收起字体字符替换为圆角双线矢量箭头。
- 项目及 Android 版本升级为 `0.3.0`（`versionCode` 3）。

## 2026-07-16 - Version 0.2.0 / 版本 0.2.0

### English

- Refreshed the mobile visual system across chart creation, chart detail, fortune, and history pages.
- Updated the home title to `夜琛排盘` and the default birth date to `2000-01-01`.
- Replaced the chart summary's day-master card with a centered `功能建设中` placeholder and reduced the strip height to about 70% of its previous size.
- Replaced the Android launcher icon with the supplied golden wolf-and-moon artwork.
- Bumped Android and project version metadata to `0.2.0` (`versionCode` 2).

### 中文

- 统一调整排盘、命盘详情、流年大运和历史记录页面的移动端视觉。
- 首页标题更新为“夜琛排盘”，默认出生日期更新为 `2000-01-01`。
- 命盘摘要右侧“日元”改为居中的“功能建设中”占位卡片，摘要条高度压缩至原先约 70%。
- Android 启动器图标替换为用户提供的金色狼月图。
- Android 应用显示名称更新为“夜琛八字”。
- 项目及 Android 版本升级为 `0.2.0`（`versionCode` 2）。

## 2026-07-06 - Baseline 0.1.0 / 基线版本 0.1.0

### English

This milestone establishes the first Git baseline for Atarayo-BaZi. The project now has a complete MVP loop: input birth data, calculate the BaZi chart, inspect the chart details, review relations, store local history, and package an offline Android debug APK.

Completed scope:

- Migrated the core BaZi logic to TypeScript pure functions.
- Added offline lunar calendar lookup and fixtures.
- Implemented calendar parsing, 23:00 day rollover, heavenly stem and earthly branch enrichment, hidden stems, ten gods, strength analysis, and pattern analysis.
- Added Da Yun and Liu Nian timeline support.
- Added Ganzhi relation analysis for heavenly stems and earthly branches.
- Built mobile pages for chart creation, chart details, fortune timeline, and local history.
- Added local history search, inline name editing, single-record deletion, and clear-all.
- Added Shen Sha calculation and UI display.
- Added a Shen Sha detail dialog with meaning, rule, current chart occurrence, and notes.
- Wrote `SHENSHA_RULES.md` to document implemented rules, variants, and deferred items.
- Built an Android WebView shell that embeds H5 assets and runs offline.
- Generated and verified a debug APK.
- Installed the APK on Android Studio emulator `Medium_Phone` and smoke-tested launch, chart generation, Shen Sha row, and Shen Sha dialog.

Validation performed:

```text
Core baseline tests passed: 12 cases
Ganzhi relation tests passed
Luck timeline tests passed
Full lunar data tests passed: 12 cases
Shen sha tests passed
uni build --platform h5: passed
APK signing verification: v1/v2/v3 passed
Android emulator smoke test: passed
```

Known limitations:

- The APK is debug-signed and not intended for production distribution.
- The Android package is a lightweight WebView shell, not a full HBuilderX native runtime package.
- Some Shen Sha items are intentionally deferred because their schools differ or because they require additional data such as Na Yin, Ming Gong, Da Yun, or Liu Nian.
- iOS packaging has not been started.
- Formal Android signing, release keystore management, app icon polish, and app-store metadata are not complete.
- Full cross-device responsive QA is still needed.

Next priorities:

1. Confirm Android real-device behavior.
2. Prepare a formal Android signing certificate and release build.
3. Continue refining Shen Sha variants and add user-configurable rule sets if needed.
4. Improve the profile and interpretation layers beyond the raw chart.
5. Start iOS packaging after Android is stable.

### 中文

本节点建立 Atarayo-BaZi 的首个 Git 基线版本。当前项目已经形成 MVP 闭环：录入出生信息、生成八字命盘、查看命盘明细、查看干支关系、保存本地历史记录，并可打包为离线 Android 调试 APK。

已完成范围：

- 将核心八字逻辑迁移为 TypeScript 纯函数。
- 增加离线农历数据查询与测试夹具。
- 实现日期解析、23 点换日、天干地支补全、藏干、十神、身强身弱与格局分析。
- 增加大运、流年时间线。
- 增加天干地支作用关系分析。
- 完成排盘首页、命盘详情、流年大运、本地历史记录等移动端页面。
- 历史记录支持搜索、姓名编辑、单条删除与清空全部。
- 增加神煞计算与 UI 展示。
- 增加神煞详情弹窗，展示释义、查法、本盘落点和说明。
- 编写 `SHENSHA_RULES.md`，记录已实现规则、口径差异与暂缓项。
- 构建 Android WebView 壳，将 H5 静态资源内置并离线运行。
- 生成并验证调试 APK。
- 在 Android Studio 模拟器 `Medium_Phone` 上完成安装和冒烟测试，覆盖启动、排盘、神煞行和神煞弹窗。

已执行验证：

```text
Core baseline tests passed: 12 cases
Ganzhi relation tests passed
Luck timeline tests passed
Full lunar data tests passed: 12 cases
Shen sha tests passed
uni build --platform h5: passed
APK signing verification: v1/v2/v3 passed
Android emulator smoke test: passed
```

已知限制：

- 当前 APK 使用 debug 签名，不适合正式分发。
- Android 包是轻量 WebView 壳，不是完整 HBuilderX 原生运行时包。
- 部分神煞因派别差异较大，或依赖纳音、命宫、大运、流年等额外数据，暂不纳入首版。
- iOS 打包尚未启动。
- Android 正式签名、发布证书管理、图标精修和应用商店资料尚未完成。
- 仍需做更多真机和不同屏幕尺寸下的响应式验证。

下一步优先级：

1. 确认 Android 真机表现。
2. 准备 Android 正式签名证书与 release 包。
3. 继续校验神煞派别口径，必要时增加可配置规则集。
4. 在原始命盘基础上补强解释层和性格/格局展示。
5. Android 稳定后启动 iOS 打包。

## 2026-06-25 - Shen Sha Feature / 神煞功能

### English

Added the Shen Sha row below the BaZi table on the chart page. Multiple Shen Sha entries under the same pillar are displayed as stacked lines. Tapping an entry opens a centered modal inspired by the reference app layout.

The implementation is intentionally split into:

- `SHENSHA_RULES.md` for product and rule documentation.
- `src/core/shen-sha.ts` for deterministic calculation.
- `tests/shen-sha.test.ts` for representative examples and regression checks.
- `src/pages/chart/chart.vue` for rendering and modal interaction.

### 中文

在命盘页八字表格下方新增“神煞”行。同一柱命中多个神煞时按行堆叠显示；点击神煞后打开居中弹窗，布局参考竞品样式。

实现上有意拆分为：

- `SHENSHA_RULES.md`：产品与规则文档。
- `src/core/shen-sha.ts`：确定性计算逻辑。
- `tests/shen-sha.test.ts`：代表性样例与回归测试。
- `src/pages/chart/chart.vue`：页面展示与弹窗交互。

## 2026-06-24 to 2026-06-25 - MVP Migration / MVP 迁移

### English

Initial MVP migration from the earlier local prototype into a uni-app workspace. The focus was to preserve calculation behavior through baseline tests while building a mobile-first interface.

### 中文

从早期本地原型迁移到 uni-app 工作区。重点是通过基准测试保持计算行为一致，同时构建移动端优先的页面体验。
