## 实验简介

本课程的实验对应《CPU设计实战：LoongArch版》（汪文祥、胡伟、王焕东 著，机械工业出版社）。本书电子版由龙芯中科赞助，可在 bookdown.org 上免费在线阅读：

[阅读本书在线版](https://bookdown.org/loongson/_book3/){: .md-button .md-button--primary }

实验进度可对照书中章节，本站各栏目已按 8 个阶段组织全部 23 个实验：

| 实验阶段 | 对应章节 | 本站讲义 |
| -------- | -------- | -------- |
| 数字电路基础 | [第 3 章](https://bookdown.org/loongson/_book3/chapter-digital-logic.html) | [labs/01-数字电路基础](labs/01-数字电路基础/index.md)（实验 2~4） |
| 单周期 CPU | [第 4 章](https://bookdown.org/loongson/_book3/chapter-single-cycle-cpu.html) | [labs/02-单周期CPU设计](labs/02-单周期CPU设计/index.md)（实验 5~6） |
| Chisel 入门 | —— | [Chisel入门](chisel/简介.md) |
| 流水线 CPU | [第 5 章](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html)、[第 6 章](https://bookdown.org/loongson/_book3/chapter-add-more-user-instr.html) | [labs/04-流水线CPU设计](labs/04-流水线CPU设计/index.md)（实验 7~11） |
| 异常与中断 | [第 7 章](https://bookdown.org/loongson/_book3/chapter-support-exception.html) | [labs/05-异常与中断](labs/05-异常与中断/index.md)（实验 12~13） |
| AXI 总线接口 | [第 8 章](https://bookdown.org/loongson/_book3/chapter-axi-bus.html) | [labs/06-AXI总线接口](labs/06-AXI总线接口/index.md)（实验 14~16） |
| 存储管理单元 | [第 9 章](https://bookdown.org/loongson/_book3/chapter-mmu-design.html) | [labs/07-存储管理单元TLB](labs/07-存储管理单元TLB/index.md)（实验 17~19） |
| 高速缓存 | [第 10 章](https://bookdown.org/loongson/_book3/chapter-cache-design.html) | [labs/08-高速缓存Cache](labs/08-高速缓存Cache/index.md)（实验 20~23） |

完整目录（含前言、[第 1 章 CPU 芯片研发过程概述](https://bookdown.org/loongson/_book3/chapter-cpu-chip-design-process.html)、[第 3 章 数字逻辑电路设计基础](https://bookdown.org/loongson/_book3/chapter-digital-logic.html)及附录）见[本书在线版](https://bookdown.org/loongson/_book3/)。

!!! note

    本课程单周期CPU使用Verilog开发，流水线CPU使用Chisel开发，书中示例以 Verilog 为主，但数据通路、冒险处理、异常机制等设计思路是相通的，可配合课程 Chisel 讲义对照阅读。
