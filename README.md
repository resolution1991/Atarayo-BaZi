# Atarayo-BaZi / 夜琛八字

Atarayo-BaZi is an offline-first BaZi charting app built with uni-app, Vue 3, and TypeScript. It focuses on a practical mobile workflow for creating a chart, reviewing the four pillars, saving local history, and packaging the app as an Android WebView APK.

Atarayo-BaZi 是一个离线优先的八字排盘应用，基于 uni-app、Vue 3 与 TypeScript 构建。当前版本聚焦移动端核心闭环：录入出生信息、生成四柱命盘、查看命局摘要、保存本地历史记录，并可打包为 Android WebView APK。

## Version / 版本

Current baseline: `0.5.0`

当前基线版本：`0.5.0`

GitHub Release: https://github.com/resolution1991/Atarayo-BaZi/releases/tag/v0.5.0

GitHub 发布页：https://github.com/resolution1991/Atarayo-BaZi/releases/tag/v0.5.0

This is the fifth development baseline. It is suitable for functional testing, rule verification, and Android emulator or device smoke testing. It is not a commercial release build.

这是第五个开发基线版本，适合功能测试、规则校验、Android 模拟器或真机冒烟测试；不是正式商业发布包。

## Features / 功能

- Offline BaZi calculation based on bundled lunar calendar data.
- 公历与农历生日输入，基于内置农历数据离线排盘。
- Four-pillar display with heavenly stems, earthly branches, hidden stems, ten gods, five-element colors, strength and pattern summary.
- 命盘页展示天干、地支、藏干、十神、五行颜色、身强身弱与格局摘要。
- Switchable traditional and academic strength-analysis schools.
- 身强身弱支持传统派与学术派切换显示。
- In-app rule documents covering strength, luck cycles, patterns, and Shen Sha.
- 内置流派与规则说明文档，涵盖身强身弱、流年大运、格局与神煞。
- Shen Sha row under the BaZi table, with multiple entries stacked per pillar and tappable detail dialogs.
- 八字表格下方新增“神煞”行，单柱多个神煞换行展示，点击可查看释义、查法与本盘落点。
- Ganzhi relation overview for stems and branches.
- 八字天干地支作用关系速览。
- Da Yun and Liu Nian timeline.
- 大运、流年时间线。
- Local history with name search, gender/year/zodiac filters, five-element colors, inline name editing, record deletion, and clear-all.
- 本地历史记录支持姓名搜索、性别/年份/属相筛选、干支五行颜色、姓名编辑、单条删除与清空。
- Clipboard export for chart details and the next ten years of Da Yun / Liu Nian information.
- 支持将命盘详情及未来十年大运流年信息复制到剪贴板。
- Versioned calculation settings for day rollover, Zi-hour handling, year/zodiac boundaries, display order, strength school, Shen Sha, and Ganzhi relations.
- 排盘口径支持换日、早晚子时、年柱/生肖边界、四柱顺序、身强流派、神煞及干支关系设置。
- Minute-level bundled solar terms drive month-pillar and luck-start calculations with a visible calculation trace.
- 内置分钟级二十四节气表，用于月柱和起运计算，并展示完整换算过程。
- History records preserve app/engine/data versions and a settings snapshot; legacy records are migrated without recalculation.
- 历史记录保存应用、引擎、数据版本和设置快照；旧记录无损迁移且不自动重算。
- Android debug APK packaging through a lightweight offline WebView shell.
- 通过轻量离线 WebView 壳生成 Android 调试 APK。

## Project Structure / 项目结构

```text
src/
  core/                       Core BaZi calculation modules / 八字核心计算模块
  data/                       Bundled lunar calendar data / 内置农历数据
  pages/                      uni-app pages / 页面
  services/                   Local storage services / 本地存储服务
tests/                        Node-based core tests / 核心测试
tools/                        Data generation and APK packaging scripts / 数据生成与打包脚本
android-webview-shell/        Native Android WebView shell / Android WebView 壳
baseline/                     Migration baseline cases / 迁移基准样例
```

Key documents / 关键文档：

- `MVP_BASELINE.md`: MVP baseline scope.
- `MVP_BASELINE.md`：MVP 基线范围。
- `SHENSHA_RULES.md`: implemented Shen Sha rules and deferred variants.
- `SHENSHA_RULES.md`：已实现神煞规则与暂缓口径。
- `GANZHI_RELATION_RULES.md`: Ganzhi relation rules.
- `GANZHI_RELATION_RULES.md`：干支关系规则。
- `DAYUN_LIUNIAN_RULES.md`: Da Yun and Liu Nian rules.
- `DAYUN_LIUNIAN_RULES.md`：大运流年规则。
- `PACKAGING_CHECKLIST.md`: Android packaging checklist.
- `PACKAGING_CHECKLIST.md`：Android 打包检查清单。
- `DEVELOPMENT_LOG.md`: bilingual development log.
- `DEVELOPMENT_LOG.md`：中英双语开发日志。
- `VERSION_ROADMAP.md`: internal offline-first version plan.
- `VERSION_ROADMAP.md`：内部离线优先版本演进计划。

## Requirements / 环境要求

- Node.js and pnpm.
- Java runtime from Android Studio for APK packaging.
- Android SDK build tools and platform jar.
- Optional: Android Studio emulator for APK validation.

- Node.js 与 pnpm。
- Android Studio 自带 Java 运行时，用于 APK 打包。
- Android SDK build-tools 与 platform jar。
- 可选：Android Studio 模拟器，用于 APK 验证。

On this development machine, the regular shell may not expose global `node`. If needed, prepend Codex's bundled runtime:

在当前开发机器上，普通终端可能没有全局 `node`。如需使用 Codex 内置运行时，可临时加入 PATH：

```bash
export PATH="/Users/algernon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/algernon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH"
```

## Install / 安装依赖

```bash
pnpm install
```

The repository includes `pnpm-lock.yaml`; keep dependency updates intentional.

仓库包含 `pnpm-lock.yaml`，依赖升级应显式管理。

## Development / 本地开发

Start H5 dev server:

启动 H5 开发服务：

```bash
pnpm run dev:h5
```

Build H5:

构建 H5：

```bash
pnpm run build:h5
```

Build Android debug APK:

构建 Android 调试 APK：

```bash
pnpm run build:apk:debug
```

Output:

输出路径：

```text
dist/apk/bazi-mvp-0.5.0-debug.apk
```

The APK is a debug-signed offline WebView package. H5 assets are embedded under `assets/www`, and the WebView loads `https://appassets.androidplatform.net/index.html` through local asset interception. It does not require an external server.

该 APK 是 debug 签名的离线 WebView 包。H5 资源内置到 `assets/www`，WebView 通过本地资源拦截加载 `https://appassets.androidplatform.net/index.html`，不依赖外部服务器。

## Tests / 测试

Core baseline:

核心基准：

```bash
pnpm run test:core
```

Ganzhi relations:

干支关系：

```bash
pnpm run test:relations
```

Da Yun and Liu Nian:

大运流年：

```bash
pnpm run test:luck
```

Full lunar data:

全量农历数据：

```bash
pnpm run test:full-data
```

Shen Sha:

神煞：

```bash
pnpm run test:shen-sha
```

Strength schools:

身强身弱流派：

```bash
pnpm run test:strength
```

Chart and future-luck exports:

命盘与未来流运导出：

```bash
pnpm run test:export
pnpm run test:fortune-export
```

## Shen Sha Scope / 神煞范围

Version `0.1.0` implements 35 Shen Sha definitions that can be determined from static four-pillar data, including Tian Yi Nobleman, Tai Ji Nobleman, Wen Chang Nobleman, Fu Xing Nobleman, Tian Chu Nobleman, Yi Ma, Hua Gai, Tao Hua, Kong Wang, Tian She, Kui Gang, and others.

`0.1.0` 实现了 35 个可由静态四柱直接判定的神煞，包括天乙贵人、太极贵人、文昌贵人、福星贵人、天厨贵人、驿马、华盖、桃花、空亡、天赦、魁罡等。

Some traditional items are intentionally deferred because their variants differ across schools or require additional data such as Na Yin, Ming Gong, Da Yun, or Liu Nian. See `SHENSHA_RULES.md`.

部分传统神煞因派别差异较大，或依赖纳音、命宫、大运、流年等额外数据，暂不纳入首版。详见 `SHENSHA_RULES.md`。

## Data / 数据

`src/data/lunar-calendar.generated.ts` is generated from the original lunar calendar source and covers `1900-01-01` to `2100-02-08`.

`src/data/lunar-calendar.generated.ts` 由原始农历数据生成，覆盖 `1900-01-01` 至 `2100-02-08`。

`src/data/solar-terms.generated.ts` contains 4,808 minute-level solar-term records generated offline with Skyfield 1.53 and JPL `de440s`, including boundary buffers from December 1899 through March 2100. See `SOLAR_TERMS_DATA.md`.

`src/data/solar-terms.generated.ts` 内置 4,808 条分钟级节气记录，由 Skyfield 1.53 与 JPL `de440s` 离线生成，缓冲范围覆盖 1899 年 12 月至 2100 年 3 月。详见 `SOLAR_TERMS_DATA.md`。

Generate full data:

生成全量数据：

```bash
python3 tools/generate_lunar_data.py
```

Generate test fixture:

生成测试夹具：

```bash
python3 tools/generate_lunar_fixture.py
```

## Android Validation / Android 验证

The `0.5.0` debug APK was installed as an upgrade and fully exercised on Android Studio AVD `Medium_Phone` (Android API 37). Verified:

`0.5.0` 调试 APK 已通过覆盖升级方式安装到 Android Studio AVD `Medium_Phone`（Android API 37）并完成端内验收。已确认：

- Five pre-upgrade records migrate to schema v2 without recalculation, retain their legacy-profile label, and have a v1 backup.
- 升级前 5 条记录无重算迁移至 schema v2，保留旧版口径标签，并生成 v1 备份。
- Calculation settings persist across reloads; standard-profile charting, reverse pillar display, minute-level luck-start trace, and linked manual re-charting all pass.
- 设置重载、标准口径排盘、四柱倒序、分钟级起运过程及关联式手动重排全部通过。
- The app cold-starts with Wi-Fi and mobile data disabled, and the final crash buffer is empty.
- Wi-Fi 与移动数据关闭时仍可冷启动，最终 crash buffer 为空。
- The final APK launches cold in `172 ms`, retains the original install time, and exposes no WebView debugging socket.
- 最终 APK 冷启动耗时 `172 ms`，保留原始安装时间，且未开放 WebView 调试接口。
- History name search, gender/zodiac filters, clear-filter action, and five-element colors work.
- 历史姓名搜索、性别/属相筛选、清除筛选及干支五行颜色正常。
- Chart export shows the expected toast, excludes the person's name, and includes every required section.
- 命盘导出 Toast 正确，复制内容不含姓名并包含全部约定字段。
- Future-luck export shows the expected toast and contains exactly ten years (`2026–2035`) of Da Yun / Liu Nian data.
- 未来流运导出 Toast 正确，并包含 `2026—2035` 恰好十年的大运与流年信息。
- The future-luck export button text is vertically and horizontally centered.
- 未来流运导出按钮文字已横向、纵向居中。
- The APK declares no Android permissions, including no network permission.
- APK 未声明任何 Android 权限，包括网络权限。

Final debug APK SHA-256 / 最终调试包 SHA-256：

```text
9484276d33ee6cd982c84b643b1cd2b38b652ca276b186e4dfb64068370917f8
```

## Release Notes / 发布说明

### 0.5.0

- Added versioned calculation profiles and a persistent calculation-settings page.
- 新增版本化排盘口径与持久化“排盘设置”页面。
- Added minute-level bundled solar terms for month-pillar and luck-start boundaries.
- 增加分钟级离线节气，用于月柱与起运边界计算。
- Added auditable calculation traces, settings snapshots, and non-destructive legacy history migration.
- 增加计算过程、设置快照和不重算旧结果的无损历史迁移。
- Added manual re-charting that creates a new linked record while preserving the source record.
- 手动按当前设置重排时创建关联的新记录，并保留来源记录。
- Added deterministic tests for settings, migration, 23:00/00:00, Li Chun, all twelve Jie boundaries, and minute-level luck start.
- 增加设置、迁移、23点/0点、立春、十二节边界和分钟级起运测试。

### 0.4.0

- Added five-element colors and gender, birth-year, and zodiac filters to the local history page.
- 历史记录页增加干支五行颜色以及性别、出生年份和属相筛选。
- Added structured clipboard export for chart details without including the person's name.
- 命盘详情增加结构化剪贴板导出，且不包含命主姓名。
- Added a ten-year Da Yun / Liu Nian export starting from the current year, including correct transitions between Da Yun periods.
- 流年大运页增加从当前年起连续十年的导出，并正确处理跨大运切换。
- Added deterministic export tests and retained the fully offline runtime.
- 增加可复现的导出测试，运行时继续保持完全离线。

### 0.3.0

- Added switchable traditional and academic schools for strength analysis, including deterministic academic scoring tests.
- 新增身强身弱“传统派 / 学术派”切换，并为学术派量化规则补充可复现测试。
- Added the in-app “Schools / Rule Reference” page with five user-facing rule documents.
- 新增“流派 / 规则说明”页面，内置五份面向普通用户的规则说明。
- Enlarged the home-page eight-character preview and refined spacing for mobile screens.
- 放大首页八字预览字号并优化横向间距。
- Fixed five-element colors in the Da Yun / Liu Nian table and replaced the document toggle glyph with a rounded vector chevron.
- 修复流年大运表格干支五行颜色，并将文档展开字符替换为圆角矢量箭头。

### 0.2.0

- Reworked the mobile UI, added the custom wolf-and-moon launcher icon, and updated the chart summary placeholder.
- 重构移动端视觉，替换金色狼月应用图标，并调整命盘摘要占位功能。
- Updated the default birth date to 2000-01-01 and refreshed the public title to 夜琛排盘.
- 默认出生日期调整为 2000-01-01，首页标题更新为“夜琛排盘”。

### 0.1.0

- First baseline version.
- 首个基线版本。
- Includes BaZi calculation, UI pages, local history, relation overview, Da Yun and Liu Nian, Shen Sha display, documentation, tests, and Android debug APK packaging.
- 包含八字计算、页面、本地历史、关系速览、大运流年、神煞展示、文档、测试与 Android 调试 APK 打包。

## Disclaimer / 免责声明

This project is for traditional culture study, product prototyping, and software engineering practice. BaZi and Shen Sha interpretations are not scientific conclusions and must not be used as medical, legal, financial, or life-critical advice.

本项目用于传统文化学习、产品原型与软件工程实践。八字和神煞解释不属于科学结论，不应作为医疗、法律、财务或重大人生决策依据。
