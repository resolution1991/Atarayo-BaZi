# 封包前检查清单

## 1. 当前结论

当前项目已生成并完成本机静态校验与 Android 模拟器回归的 `0.4.0` 调试 APK。

APK 路径：

```text
dist/apk/bazi-mvp-0.4.0-debug.apk
```

该包为本机 WebView 壳调试包，内置 H5 静态资源，使用 debug keystore 签名。APK 启动后通过 `https://appassets.androidplatform.net/index.html` 读取包内资源，由 WebView 本地拦截提供文件，不依赖外部服务器。

建议顺序：

1. Android 真机验证。
2. 准备 Android 正式签名包。
3. 再推进 iOS。

## 2. 已具备条件

- uni-app / Vue 3 / TypeScript 工程已建立。
- H5 构建通过。
- App 端前置构建通过，输出目录为 `dist/build/app`。
- Android 调试 APK 已生成并通过签名验证。
- 核心基准测试通过。
- 全量农历数据已内置。
- 历史记录使用本机存储。
- 页面不依赖网络服务。
- Android 壳未声明网络权限。

## 3. App 基础配置

当前 `src/manifest.json` 已配置：

- 应用名：`夜琛八字`
- 版本名：`0.4.0`
- 版本号：`4`
- AppID：`__UNI__BAZI_OFFLINE`
- Android 权限：空权限列表
- Android 自适应图标：金色狼月图

封正式包前仍需确认：

- DCloud 平台正式 AppID。
- Android 包名，例如 `com.example.bazi`。
- 启动图。
- Android 签名证书。
- iOS Bundle ID。
- iOS 证书和描述文件。

## 4. Android 调试包验证项

生成调试 APK：

```bash
pnpm run build:apk:debug
```

当前命令已通过。

静态验证结果：

- 包名：`com.algernon.bazi`
- 应用名：`夜琛八字`
- 版本名：`0.4.0`
- 版本号：`4`
- minSdk：`23`
- targetSdk：`36`
- 签名：v1/v2/v3 均验证通过
- 权限：无声明权限
- SHA-256：`ae60071d116e401703f865ab8ecde4032b944cbc97f599df6f8f10b5866b0fdb`

本机 `Medium_Phone`（Android API 37）回归结果：

- 最终包覆盖安装成功，`firstInstallTime` 保持为 `2026-06-25 13:19:10`，既有 5 条历史记录仍可读取。
- 最终包冷启动成功，实测 `TotalTime: 183 ms`，crash buffer 为空。
- 历史页姓名搜索、性别筛选、属相筛选和“显示全部”清除筛选通过；出生年份筛选控件及候选年份正常加载。
- 历史记录中的“子”应用 `wx-water`，计算色值为 `rgb(31, 120, 209)`。
- 命盘导出 Toast 正确；复制内容不含姓名，且包含公历/农历、性别、两派身强身弱、格局、四柱明细、神煞和干支关系。
- 未来十年流运导出 Toast 正确；复制内容覆盖 `2026—2035` 共 10 年，包含原局四柱及逐年大运、流年的主星、辅星和藏干。
- 流年导出按钮使用 flex 居中，`align-items: center`、`justify-content: center`。
- 最终 APK 未声明 `INTERNET` 或其他 Android 权限，且已关闭回归期间临时使用的 WebView 调试接口。

安装后逐项检查：

- App 可正常启动。
- 首页默认加载正常。
- 公历排盘可生成命盘。
- 农历排盘可换算并生成命盘。
- 五行颜色正确。
- 命盘详情页可滚动。
- 姓名编辑后刷新仍保留。
- 历史记录可查看。
- 历史记录可搜索。
- 历史记录可按性别、出生年份和属相筛选。
- 历史记录干支五行颜色正确。
- 命盘详情信息可复制到剪贴板且不含姓名。
- 未来十年流年大运信息可复制到剪贴板。
- 单条删除只弹确认，不跳转命盘页。
- 清空全部正常。
- 关闭 App 后重新打开，历史记录仍存在。
- 全程断网可用。

## 5. Android 正式包准备项

- 生成并妥善保存签名证书。
- 记录 keystore 路径、alias、密码保管方式。
- 固定包名，后续不要随意变更。
- 确认版本号递增策略：
  - `versionName`: 面向用户，例如 `0.1.0`
  - `versionCode`: 面向系统，每次发包递增

## 6. iOS 准备项

iOS 暂不建议作为第一步。Android 跑通后再处理：

- Apple Developer 账号。
- Bundle ID。
- 开发/发布证书。
- Provisioning Profile。
- 真机安装或 TestFlight。
- 隐私权限说明。

## 7. 风险点

- 当前 APK 已完成本机包内资源验证和 Android API 37 模拟器回归，仍需 Android 真机复测安装、启动、剪贴板和持久化存储。
- 当前 APK 是 WebView 壳调试包，不是 HBuilderX 原生运行时包。
- 当前 App 端本机存储尚未在真机验证。
- 自定义 UI 在不同屏幕宽度上仍需真机检查。
- 农历闰月输入目前通过同一农历日期多公历匹配处理，后续可优化为显式“闰月”选择。
- `__UNI__BAZI_OFFLINE` 是临时 AppID，正式云打包前应替换为 DCloud 平台生成的 AppID。
- 当前仅生成 debug APK，尚未生成正式签名 APK 或 `.ipa`。
