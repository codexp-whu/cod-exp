# 单周期CPU设计

!!! info "原书参考"
    本栏实验对应《CPU设计实战：LoongArch版》[第 4 章 单周期CPU设计](https://bookdown.org/loongson/_book3/chapter-single-cycle-cpu.html)。

单周期 CPU 是你的第一个完整处理器：一条指令在一个时钟周期内完成取指、译码、执行、访存、写回全部动作。

本栏先从 5 条指令的最小系统起步，再扩展到 20 条指令，并建立基于 trace 比对的自动化调试框架。

!!! note "开发语言"

    按课程安排，单周期 CPU 使用 **Verilog** 开发，流水线 CPU 起使用 **Chisel**开发。书中示例以 Verilog 为主，可直接对照。

!!! tips "理解设计思路"
    无论是采用Verilog还是Chisel开发，前期CPU设计时间都是无法省略的！一定要理清CPU的架构和运行原理，若感到困难可以手绘模块图并画出几条常见指令的执行路径。

## 实验列表

| 实验 | 主题 | 原书参考 |
| ---- | ---- | ---- |
| [实验5：5条指令单周期CPU](./实验5-5条指令单周期CPU.md) | 用最少的指令集搭出能跑程序的单周期 CPU | [4.1 / 4.3.1](https://bookdown.org/loongson/_book3/chapter-single-cycle-cpu.html) |
| [实验6：20条指令单周期CPU](./实验6-20条指令单周期CPU.md) | 扩展指令集，引入 trace 比对调试框架与功能测试 | [4.2 / 4.3.2](https://bookdown.org/loongson/_book3/chapter-single-cycle-cpu.html) |
