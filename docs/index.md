# 计算机组成与体系结构 实验

本课程实验以目标是从零开始设计一个CPU：从数字电路基础部件起步，逐步搭建一个支持 20 余条指令、具备异常处理、总线接口、地址翻译与缓存功能的五级流水线 LoongArch32 CPU，最终使其能够运行真实的 C 语言程序甚至能够运行Linux系统。

## 实验简介

本课程采用的指令集为loongarch32r 精简指令集，与理论课学习的RISC-V指令集不同，但也有相似之处。若对RISC-V指令集有较深理解，学习loongarch32r 指令集并不困难。

具体的指令集手册请参考：[龙架构32位精简指令集参考手册](https://www.loongson.cn/uploads/images/2025032109211238668.%E9%BE%99%E6%9E%B6%E6%9E%8432%E4%BD%8D%E7%B2%BE%E7%AE%80%E7%89%88%E5%8F%82%E8%80%83%E6%89%8B%E5%86%8C_r1p04.pdf)

本课程实验对应《CPU设计实战：LoongArch版》（汪文祥、胡伟、王焕东 著，机械工业出版社）。

![](./pre/images/1.avif)

本书电子版由龙芯中科赞助，可在 bookdown.org 上免费在线阅读：

[阅读本书在线版](https://bookdown.org/loongson/_book3/){: .md-button .md-button--primary }

全部 23 个实验按 8 个阶段递进组织，每个阶段都建立在前一阶段成果之上：

| 实验阶段 | 对应章节 | 本站讲义 |
| -------- | -------- | -------- |
| 数字电路基础 | [第 3 章](https://bookdown.org/loongson/_book3/chapter-digital-logic.html) | [labs/01-数字电路基础](labs/01-数字电路基础/index.md)（实验 1~4） |
| 单周期 CPU | [第 4 章](https://bookdown.org/loongson/_book3/chapter-single-cycle-cpu.html) | [labs/02-单周期CPU设计](labs/02-单周期CPU设计/index.md)（实验 5~6） |
| Chisel 入门 | —— | [Chisel入门](chisel/简介.md) |
| 流水线 CPU | [第 5 章](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html)、[第 6 章](https://bookdown.org/loongson/_book3/chapter-add-more-user-instr.html) | [labs/04-流水线CPU设计](labs/04-流水线CPU设计/index.md)（实验 7~11） |
| 异常与中断 | [第 7 章](https://bookdown.org/loongson/_book3/chapter-support-exception.html) | [labs/05-异常与中断](labs/05-异常与中断/index.md)（实验 12~13） |
| AXI 总线接口 | [第 8 章](https://bookdown.org/loongson/_book3/chapter-axi-bus.html) | [labs/06-AXI总线接口](labs/06-AXI总线接口/index.md)（实验 14~16） |
| 存储管理单元 | [第 9 章](https://bookdown.org/loongson/_book3/chapter-mmu-design.html) | [labs/07-存储管理单元TLB](labs/07-存储管理单元TLB/index.md)（实验 17~19） |
| 高速缓存 | [第 10 章](https://bookdown.org/loongson/_book3/chapter-cache-design.html) | [labs/08-高速缓存Cache](labs/08-高速缓存Cache/index.md)（实验 20~23） |

完整目录（含前言、[第 1 章 CPU 芯片研发过程概述](https://bookdown.org/loongson/_book3/chapter-cpu-chip-design-process.html)、[第 3 章 数字逻辑电路设计基础](https://bookdown.org/loongson/_book3/chapter-digital-logic.html)及附录）见[本书在线版](https://bookdown.org/loongson/_book3/)。

## 实验路线

23 个实验环环相扣，最终成果是一个功能完整的流水线 CPU：

- **数字电路基础（实验 1~4）**：掌握 Vivado 的仿真、综合与上板流程，独立完成寄存器堆、RAM 等基本部件的设计与调试。
- **单周期CPU（实验 5~6）**：用 Verilog 实现一个能执行 20 条指令的单周期 CPU，第一次让程序在自己的处理器上跑起来。
- **流水线CPU（实验 7~11）**：切换到 **Chisel** 开发五级流水线CPU，并依次解决数据冒险和控制冒险（阻塞、前递），扩充算术逻辑、乘除法、转移和访存指令。
- **异常、中断、AXI总线与TLB（实验 12~19）**：为 CPU 加入系统调用与异常处理，将其访存接口升级为类 SRAM 总线和 AXI 总线，再实现 TLB 完成虚实地址转换。
- **加入Cache（实验 20~23）**：设计 Cache 模块并集成 ICache / DCache，弥补处理器与主存之间的速度鸿沟，至此一个五脏俱全的微处理器宣告完成。

## 如何使用本讲义

1. **搭好环境再开工**：实验依赖 Vivado、WSL2/Linux 环境和 LoongArch32 交叉编译工具链，请先阅读[实验准备](pre/介绍.md)完成安装。
2. **先读书、再做实验**：每个实验前，请先阅读《CPU设计实战：LoongArch版》对应章节的讲解部分，理解原理后再看本站讲义的实验要求。

    !!! warning
        **所有实验要求请以本站实验讲义为准，请不要参考《CPU设计实战：LoongArch版》中的实验要求！**

3. **善用附录**：初次接触 Chisel 的同学请配合[附录A：Chisel入门](chisel/简介.md)学习；进行流水线实验前，建议通读[附录B：五级流水线CPU导读](chisel/五级流水线导读.md)建立整体认识。

!!! note

    本课程单周期CPU使用Verilog开发，流水线CPU使用Chisel开发，书中示例以 Verilog 为主，但数据通路、冒险处理、异常机制等设计思路是相通的，可配合课程 Chisel 讲义对照阅读。

## 学习资源

初次接触CPU设计肯定会感到难以下手，可以参考一些书籍和现有的开源处理器核。以下是可以参考的学习资源：

1. [openLA500 (loongarch32r 单发射顺序五级流水)](https://gitee.com/loongson-edu/open-la500)
2. [openLA1000 (loongarch32r 三发射顺序)](https://gitee.com/loongson-edu/open-la1000)
3. [Nutshell处理器 (RISC-V 单发射顺序/多发射乱序)](https://github.com/OSCPU/NutShell)


## 贡献者

本讲义由课程教学组与黄治豪、张智皓、沙之傲同学共同编写。

## 版权声明

本课程实验内容全部移植、改编自《CPU设计实战：LoongArch版》一书及其配套实验材料。相关实验内容的著作权及其他依法享有的知识产权归原权利人所有。

未经原权利人事先书面许可，任何单位或个人不得擅自复制、修改、传播、公开发布、商业使用或以其他方式使用本课程实验材料。因教学需要进行使用的，应遵守相关法律法规及原权利人的授权要求。

本声明不构成对相关知识产权权利归属或授权范围的任何改变。