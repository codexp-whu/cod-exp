# 异常与中断

本栏实验对应《CPU设计实战：LoongArch版》[第 7 章 异常和中断的支持](https://bookdown.org/loongson/_book3/chapter-support-exception.html)。

异常与中断是 CPU 支持操作系统的基石：系统调用、缺页、时钟中断……都经由这一套机制进入内核。本栏将为你的流水线 CPU 补上精确异常——**准确记录异常现场，并把控制权交给异常处理程序**。

## 实验列表

| 实验 | 主题 | 原书参考 |
| ---- | ---- | ---- |
| [实验12：添加系统调用异常支持](./实验12-系统调用异常.md) | 实现 `syscall`、CSR 与 `ertn`，跑通异常响应闭环 | [7.1.1 实践任务12](https://bookdown.org/loongson/_book3/chapter-support-exception.html) |
| [实验13：添加其它异常支持](./实验13-其它异常.md) | 通用化异常检测，支持完整异常类型与中断 | [7.1.2 实践任务13](https://bookdown.org/loongson/_book3/chapter-support-exception.html) |
