# Single-Cycle CPU Design

!!! info "Reference in the Book"
    The labs in this section correspond to [Chapter 4, Single-Cycle CPU Design](https://bookdown.org/loongson/_book3/chapter-single-cycle-cpu.html) of *CPU Design in Practice: LoongArch Edition*.

A single-cycle CPU is your first complete processor: every instruction carries out instruction fetch, decode, execute, memory access, and write back within one clock cycle.

This section starts from the smallest possible system of 5 instructions, then extends it to 20 instructions and builds an automated debugging framework based on trace comparison.

!!! note "Development Language"

    As the course schedule specifies, the single-cycle CPU is developed in **Verilog**, while the pipelined CPU and everything after it use **Chisel**. The examples in the book are mostly Verilog, so you can follow along directly.

!!! tips "Understanding the Design Approach"
    Whether you develop in Verilog or in Chisel, the early CPU design work cannot be skipped! You must get the CPU's architecture and operating principles clear; if it feels hard, sketch the module diagram by hand and draw out the execution path of a few common instructions.

## Lab List

| Lab | Topic | Reference in the Book |
| ---- | ---- | ---- |
| [Lab 5: Single-Cycle CPU with Five Instructions](./实验5-5条指令单周期CPU.md) | Build a single-cycle CPU that can run a program with the smallest possible instruction set | [4.1 / 4.3.1](https://bookdown.org/loongson/_book3/chapter-single-cycle-cpu.html) |
| [Lab 6: Single-Cycle CPU with Twenty Instructions](./实验6-20条指令单周期CPU.md) | Extend the instruction set and bring in the trace-comparison debugging framework and functional tests | [4.2 / 4.3.2](https://bookdown.org/loongson/_book3/chapter-single-cycle-cpu.html) |
