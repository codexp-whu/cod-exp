# Computer Organization and Architecture Labs

The goal of the labs in this course is to design a CPU from scratch: starting from basic digital logic components, you will progressively build a five-stage pipelined LoongArch32 CPU that supports more than 20 instructions and provides exception handling, a bus interface, address translation, and a cache — ultimately enabling it to run real C programs and even boot Linux.

## About the Labs

The instruction set used in this course is the LoongArch32r reduced instruction set. It differs from the RISC-V instruction set taught in the theory lectures, but the two have much in common. If you already understand RISC-V well, learning LoongArch32r will not be difficult.

For the full instruction set reference, see: [LoongArch 32-Bit Reduced Instruction Set Reference Manual](https://www.loongson.cn/uploads/images/2025032109211238668.%E9%BE%99%E6%9E%B6%E6%9E%8432%E4%BD%8D%E7%B2%BE%E7%AE%80%E7%89%88%E5%8F%82%E8%80%83%E6%89%8B%E5%86%8C_r1p04.pdf)

The labs in this course accompany *CPU Design in Practice: LoongArch Edition* (《CPU设计实战：LoongArch版》, by Wang Wenxiang, Hu Wei, and Wang Huandong; China Machine Press).

![](./pre/images/1.avif)

The electronic edition of this book is sponsored by Loongson Technology and can be read online for free on bookdown.org:

[Read the book online](https://bookdown.org/loongson/_book3/){: .md-button .md-button--primary }

All 23 labs are organized as 8 progressive stages, each building on the results of the previous one:

| Stage | Book chapter | Notes on this site |
| -------- | -------- | -------- |
| Digital logic fundamentals | [Chapter 3](https://bookdown.org/loongson/_book3/chapter-digital-logic.html) | [labs/01-数字电路基础](labs/01-数字电路基础/index.md) (Labs 1–4) |
| Single-cycle CPU | [Chapter 4](https://bookdown.org/loongson/_book3/chapter-single-cycle-cpu.html) | [labs/02-单周期CPU设计](labs/02-单周期CPU设计/index.md) (Labs 5–6) |
| Getting started with Chisel | —— | [Getting Started with Chisel](chisel/简介.md) |
| Pipelined CPU | [Chapter 5](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html), [Chapter 6](https://bookdown.org/loongson/_book3/chapter-add-more-user-instr.html) | [labs/04-流水线CPU设计](labs/04-流水线CPU设计/index.md) (Labs 7–11) |
| Exceptions and interrupts | [Chapter 7](https://bookdown.org/loongson/_book3/chapter-support-exception.html) | [labs/05-异常与中断](labs/05-异常与中断/index.md) (Labs 12–13) |
| AXI bus interface | [Chapter 8](https://bookdown.org/loongson/_book3/chapter-axi-bus.html) | [labs/06-AXI总线接口](labs/06-AXI总线接口/index.md) (Labs 14–16) |
| Memory management unit | [Chapter 9](https://bookdown.org/loongson/_book3/chapter-mmu-design.html) | [labs/07-存储管理单元TLB](labs/07-存储管理单元TLB/index.md) (Labs 17–19) |
| Cache | [Chapter 10](https://bookdown.org/loongson/_book3/chapter-cache-design.html) | [labs/08-高速缓存Cache](labs/08-高速缓存Cache/index.md) (Labs 20–23) |

The complete table of contents (including the preface, [Chapter 1: Overview of the CPU Chip Development Process](https://bookdown.org/loongson/_book3/chapter-cpu-chip-design-process.html), [Chapter 3: Fundamentals of Digital Logic Circuit Design](https://bookdown.org/loongson/_book3/chapter-digital-logic.html), and the appendices) is available in [the online edition of the book](https://bookdown.org/loongson/_book3/).

## Lab Roadmap

The 23 labs build on one another, culminating in a fully functional pipelined CPU:

- **Digital logic fundamentals (Labs 1–4)**: learn the Vivado simulation, synthesis, and board-programming flow, and independently design and debug basic components such as register files and RAM.
- **Single-cycle CPU (Labs 5–6)**: implement a single-cycle CPU in Verilog that can execute 20 instructions — the first time a program runs on a processor of your own making.
- **Pipelined CPU (Labs 7–11)**: switch to **Chisel** to develop a five-stage pipelined CPU, and resolve data hazards and control hazards in turn (stalling, then forwarding), then extend it with arithmetic/logic, multiply/divide, branch, and memory access instructions.
- **Exceptions, interrupts, the AXI bus, and the TLB (Labs 12–19)**: add system calls and exception handling to the CPU, upgrade its memory interface to an SRAM-like bus and then an AXI bus, and implement a TLB to perform virtual-to-physical address translation.
- **Adding the cache (Labs 20–23)**: design a cache module and integrate the ICache and DCache to bridge the speed gap between the processor and main memory. At this point a complete microprocessor is finished.

## How to Use These Notes

1. **Set up your environment before you start**: the labs depend on Vivado, a WSL2/Linux environment, and the LoongArch32 cross-compilation toolchain. Read [Lab Setup](pre/介绍.md) first and complete the installation.
2. **Read the book, then do the lab**: before each lab, read the explanatory section of the corresponding chapter of *CPU Design in Practice: LoongArch Edition*. Once you understand the underlying principles, come back to the lab requirements in these notes.

    !!! warning
        **All lab requirements are governed by the lab notes on this site. Do not follow the lab requirements given in *CPU Design in Practice: LoongArch Edition*!**

3. **Make good use of the appendices**: if Chisel is new to you, work through [Appendix A: Getting Started with Chisel](chisel/简介.md) alongside the labs. Before starting the pipeline labs, we recommend reading [Appendix B: A Guide to the Five-Stage Pipelined CPU](chisel/五级流水线导读.md) in full to build an overall picture first.

!!! note

    In this course the single-cycle CPU is developed in Verilog and the pipelined CPU in Chisel. The examples in the book are mostly in Verilog, but the design ideas behind the datapath, hazard handling, and exception mechanisms carry over directly, so you can read the book alongside the Chisel notes from this course.

## Learning Resources

Designing a CPU for the first time can feel daunting. The books and existing open-source processor cores below are useful references:

1. [openLA500 (LoongArch32r, single-issue in-order five-stage pipeline)](https://gitee.com/loongson-edu/open-la500)
2. [openLA1000 (LoongArch32r, three-issue in-order)](https://gitee.com/loongson-edu/open-la1000)
3. [NutShell processor (RISC-V, single-issue in-order / multi-issue out-of-order)](https://github.com/OSCPU/NutShell)


## Contributors

These notes were written jointly by the course teaching team and students Huang Zhihao, Zhang Zhihao, and Sha Zhi'ao.

## Copyright Notice

All lab materials in this course are ported and adapted from the book *CPU Design in Practice: LoongArch Edition* and its accompanying lab materials. The copyright and all other intellectual property rights in the lab materials belong to the original rights holders.

Without the prior written permission of the original rights holders, no organization or individual may reproduce, modify, distribute, publicly publish, commercially exploit, or otherwise use the lab materials of this course. Use for teaching purposes must comply with the relevant laws and regulations and with the licensing requirements of the original rights holders.

This notice does not constitute any change to the ownership or the scope of authorization of the relevant intellectual property rights.
