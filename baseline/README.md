# 基准样例说明

本目录用于冻结原 Python 实现的输出结果，作为 uni-app / TypeScript 重构期间的对照基准。

## 文件

- `cases.json`：输入样例清单。
- `results/current_python_baseline.json`：由原 Python 逻辑生成的完整输出。
- `../tools/generate_baseline.py`：基准生成脚本。

## 生成方式

在工作区根目录执行：

```bash
python3 tools/generate_baseline.py
```

脚本默认读取原项目：

```text
/Users/algernon/Documents/自制排盘软件
```

脚本只读原项目，不会修改原项目文件。

## 使用规则

- 重构核心逻辑时，先用 `cases.json` 的输入生成新实现结果。
- 对比 `results/current_python_baseline.json` 中的 `summary` 和完整 `bazi` 结构。
- 如果结果不同，先判断是否属于明确批准的低级错误修正；否则按回归处理。
- 新增规则或新增边界行为时，先追加 `cases.json`，再重新生成并评审基准。

## 当前覆盖点

- 常规日期排盘。
- 男女性别日主标记。
- 前端 `datetime-local` 格式归一化。
- 23 点后换日。
- 春节附近日期。
- 允许年份下限。
- 农历数据表上限。
- 无效日期错误。
