# 分钟级二十四节气数据说明

## 用途

`v0.5.0` 使用随包内置的分钟级节气表计算：

- 月柱的十二“节”边界。
- 出生时刻前后节气。
- 起运时间差与换算过程。
- 流月节令日期。

应用运行时不访问网络，也不执行天文计算。

## 生成来源

- 计算库：Skyfield `1.53`
- 星历：JPL `de440s.bsp`
- 星历 SHA-256：`c1c7feeab882263fc493a9d5a5b2ddd71b54826cdf65d8d17a76126b260a49f2`
- 生成脚本：`tools/generate_solar_terms.py`
- 校验脚本：`tools/verify_solar_terms.py`

参考资料：

- <https://rhodesmill.org/skyfield/almanac.html>
- <https://ssd.jpl.nasa.gov/doc/de440_de441.html>

## 数据范围与格式

- 记录数：4,808
- 首条：`1899-12-07 15:04`
- 末条：`2100-03-20 21:06`
- 时间口径：固定 `UTC+08:00`
- 取整口径：四舍五入到最近一分钟，30 秒进位
- 运行时文件：`src/data/solar-terms.generated.ts`
- 元数据：`src/data/solar-terms.metadata.json`

边界缓冲用于在应用允许范围的首尾日期查找前一个或后一个节气。实际排盘日期仍受农历表范围 `1900-01-01` 至 `2100-02-08` 限制。

## 重新生成

生成脚本要求调用方显式提供 JPL 星历文件，不会把星历下载或打进 APK：

```bash
python3 tools/generate_solar_terms.py --ephemeris /path/to/de440s.bsp
python3 tools/verify_solar_terms.py
```

每次生成都会在元数据中记录：

- Skyfield 版本。
- 星历文件名与 SHA-256。
- 输出文件 SHA-256。
- 记录数量、范围、时区和取整口径。

## 运行时限制

- `v0.5.0` 把出生时间理解为固定北京时间 `UTC+08:00`。
- 不处理出生地、真太阳时、海外时区和夏令时；这些属于 `v0.6.0`。
- 旧历史命盘继续展示保存结果，迁移时不会使用新节气表自动重算。
