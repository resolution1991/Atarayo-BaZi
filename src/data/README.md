# 本地数据说明

`lunar-calendar.generated.ts` 是从原项目 `knowledge_base/lunar_calendar.csv` 生成的全量离线数据，覆盖 `1900-01-01` 至 `2100-02-08`。

运行时通过 `lunar-calendar.ts` 暴露的 `LUNAR_CALENDAR.get(dateKey)` 查表，不解析 CSV，也不访问远程接口。

`lunar-calendar.fixture.ts` 只覆盖当前基准样例需要的少量日期，用于核心逻辑迁移测试。

`solar-terms.generated.ts` 内置分钟级二十四节气数据，用于 `v0.5.0` 的月柱和起运计算。生成来源、哈希、范围与重建方式见根目录 `SOLAR_TERMS_DATA.md`。

重新生成全量数据：

```bash
python3 tools/generate_lunar_data.py
```
