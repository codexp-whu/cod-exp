# Pipelined CPU Design
!!! info "Reference in the Book"
    The labs in this section correspond to [Chapter 5, Simple Pipelined CPU Design](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html) and [Chapter 6, Adding Ordinary User-Mode Instructions to the Pipeline](https://bookdown.org/loongson/_book3/chapter-add-more-user-instr.html) of *CPU Design in Practice: LoongArch Edition*.
!!! warning "Getting Started with Chisel"
    From this section onward, the CPU is developed in **Chisel** instead of Verilog. Work through the [Getting Started with Chisel](../../chisel/简介.md) notes to set up your Chisel development environment and learn the basic syntax.

In Lab 6 we already used Verilog to build a single-cycle CPU supporting 20 instructions. Next we will implement a five-stage pipelined CPU.

A five-stage pipeline splits the single-cycle datapath into the five stages IF / ID / EX / MEM / WB, joined by pipeline registers. Instructions execute in parallel across the stages, raising throughput several-fold — but **dependencies and hazards** come with it.

The labs in this section build a five-stage pipeline framework first (Lab 7), then resolve hazards with stalling and forwarding (Labs 8 and 9), and finally extend the instruction set (Labs 10 and 11).

## Lab List

| Lab | Topic | Reference in the Book |
| ---- | ---- | ---- |
| [Lab 7: A Simple Pipelined CPU Without Hazard Handling](./实验7-简单流水线CPU.md) | Build the five-stage pipeline framework | [5.1.1 Practical Task 7](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html) |
| [Lab 8: Resolving Hazards with Stalls](./实验8-阻塞解决冲突.md) | Detect dependencies and insert pipeline bubbles | [5.1.2 Practical Task 8](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html) |
| [Lab 9: Resolving Hazards with Forwarding](./实验9-前递解决冲突.md) | Eliminate some stalls with a forwarding network | [5.1.3 Practical Task 9](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html) |
| [Lab 10: Arithmetic, Logic, Multiply and Divide Instructions](./实验10-算术逻辑与乘除法指令.md) | Extend the ALU instruction group and the multiply/divide unit | [6.1.1 Practical Task 10](https://bookdown.org/loongson/_book3/chapter-add-more-user-instr.html) |
| [Lab 11: Branch and Memory Access Instructions](./实验11-转移和访存指令.md) | Extend branch/jump and load/store instructions | [6.1.2 Practical Task 11](https://bookdown.org/loongson/_book3/chapter-add-more-user-instr.html) |
