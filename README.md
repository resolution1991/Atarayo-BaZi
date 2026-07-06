# Atarayo-BaZi / 八字排盘

Atarayo-BaZi is an offline-first BaZi charting app built with uni-app, Vue 3, and TypeScript. It focuses on a practical mobile workflow for creating a chart, reviewing the four pillars, saving local history, and packaging the app as an Android WebView APK.

Atarayo-BaZi 是一个离线优先的八字排盘应用，基于 uni-app、Vue 3 与 TypeScript 构建。当前版本聚焦移动端核心闭环：录入出生信息、生成四柱命盘、查看命局摘要、保存本地历史记录，并可打包为 Android WebView APK。

## Version / 版本

Current baseline: `0.1.0`

当前基线版本：`0.1.0`

This is the first public baseline. It is suitable for functional testing, rule verification, and Android emulator or device smoke testing. It is not a commercial release build.

这是首个公开基线版本，适合功能测试、规则校验、Android 模拟器或真机冒烟测试；不是正式商业发布包。

## Features / 功能

- Offline BaZi calculation based on bundled lunar calendar data.
- 公历与农历生日输入，基于内置农历数据离线排盘。
- Four-pillar display with heavenly stems, earthly branches, hidden stems, ten gods, five-element colors, strength and pattern summary.
- 命盘页展示天干、地支、藏干、十神、五行颜色、身强身弱与格局摘要。
- Shen Sha row under the BaZi table, with multiple entries stacked per pillar and tappable detail dialogs.
- 八字表格下方新增“神煞”行，单柱多个神煞换行展示，点击可查看释义、查法与本盘落点。
- Ganzhi relation overview for stems and branches.
- 八字天干地支作用关系速览。
- Da Yun and Liu Nian timeline.
- 大运、流年时间线。
- Local history with search, inline name editing, record deletion, and clear-all.
- 本地历史记录，支持搜索、姓名编辑、单条删除与清空。
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
dist/apk/bazi-mvp-0.1.0-debug.apk
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

## Shen Sha Scope / 神煞范围

Version `0.1.0` implements 35 Shen Sha definitions that can be determined from static four-pillar data, including Tian Yi Nobleman, Tai Ji Nobleman, Wen Chang Nobleman, Fu Xing Nobleman, Tian Chu Nobleman, Yi Ma, Hua Gai, Tao Hua, Kong Wang, Tian She, Kui Gang, and others.

`0.1.0` 实现了 35 个可由静态四柱直接判定的神煞，包括天乙贵人、太极贵人、文昌贵人、福星贵人、天厨贵人、驿马、华盖、桃花、空亡、天赦、魁罡等。

Some traditional items are intentionally deferred because their variants differ across schools or require additional data such as Na Yin, Ming Gong, Da Yun, or Liu Nian. See `SHENSHA_RULES.md`.

部分传统神煞因派别差异较大，或依赖纳音、命宫、大运、流年等额外数据，暂不纳入首版。详见 `SHENSHA_RULES.md`。

## Data / 数据

`src/data/lunar-calendar.generated.ts` is generated from the original lunar calendar source and covers `1900-01-01` to `2100-02-08`.

`src/data/lunar-calendar.generated.ts` 由原始农历数据生成，覆盖 `1900-01-01` 至 `2100-02-08`。

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

The `0.1.0` debug APK was installed and smoke-tested on Android Studio AVD `Medium_Phone` (`emulator-5554`). Verified:

`0.1.0` 调试 APK 已在 Android Studio AVD `Medium_Phone`（`emulator-5554`）安装并冒烟测试。已确认：

- App launches.
- 应用可启动。
- Home page renders.
- 首页可渲染。
- A chart can be generated.
- 可生成命盘。
- Shen Sha row renders under the BaZi table.
- 八字表格下方可展示“神煞”行。
- Tapping a Shen Sha opens the detail dialog.
- 点击神煞可打开详情弹窗。
- No crash was found in the crash buffer during smoke testing.
- 冒烟测试期间 crash buffer 为空。

## Release Notes / 发布说明

### 0.1.0

- First baseline version.
- 首个基线版本。
- Includes BaZi calculation, UI pages, local history, relation overview, Da Yun and Liu Nian, Shen Sha display, documentation, tests, and Android debug APK packaging.
- 包含八字计算、页面、本地历史、关系速览、大运流年、神煞展示、文档、测试与 Android 调试 APK 打包。

## Disclaimer / 免责声明

This project is for traditional culture study, product prototyping, and software engineering practice. BaZi and Shen Sha interpretations are not scientific conclusions and must not be used as medical, legal, financial, or life-critical advice.

本项目用于传统文化学习、产品原型与软件工程实践。八字和神煞解释不属于科学结论，不应作为医疗、法律、财务或重大人生决策依据。

