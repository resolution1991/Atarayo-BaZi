# 封包前检查清单

## 1. 当前结论

当前项目已生成 Android 调试 APK。

APK 路径：

```text
dist/apk/bazi-mvp-0.3.0-debug.apk
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
- 版本名：`0.3.0`
- 版本号：`3`
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
- 版本名：`0.3.0`
- 版本号：`3`
- minSdk：`23`
- targetSdk：`36`
- 签名：v1/v2/v3 均验证通过
- 权限：无声明权限
- SHA-256：`2ad1615d3a70bfb7e35a07dcf490689d7addfbdc3ba9779a808e6eaa0b84d271`

本机打包资源冒烟验证：

- 首页可加载，无“服务器未连接/无法使用”提示。
- 首页输入姓名后可生成命盘。
- 命盘详情可渲染命局摘要、四柱、五行分布。
- 历史记录可读取刚生成的本地记录。
- 单条删除直接弹确认框，不跳转命盘页。
- 控制台无 error / warning。
- Android 模拟器 API 37 冷启动、排盘、记录页验证通过。

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

- 当前 APK 已完成本机包内资源冒烟验证，仍需 Android 真机复测安装、启动和持久化存储。
- 当前 APK 是 WebView 壳调试包，不是 HBuilderX 原生运行时包。
- 当前 App 端本机存储尚未在真机验证。
- 自定义 UI 在不同屏幕宽度上仍需真机检查。
- 农历闰月输入目前通过同一农历日期多公历匹配处理，后续可优化为显式“闰月”选择。
- `__UNI__BAZI_OFFLINE` 是临时 AppID，正式云打包前应替换为 DCloud 平台生成的 AppID。
- 当前仅生成 debug APK，尚未生成正式签名 APK 或 `.ipa`。
