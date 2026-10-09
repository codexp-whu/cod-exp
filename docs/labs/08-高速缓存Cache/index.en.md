# Cache

**Read the explanatory part of the corresponding chapter of *CPU Design in Practice: LoongArch Edition* first, then come back to these notes for the lab requirements and complete them.**

!!! warning
    **The lab notes on this site are the authoritative statement of all lab requirements — do not refer to the lab requirements given in *CPU Design in Practice: LoongArch Edition*!**

!!! info "Reference in the Book"
    The labs in this section correspond to [Chapter 10, Cache Design](https://bookdown.org/loongson/_book3/chapter-cache-design.html) of *CPU Design in Practice: LoongArch Edition*.

The speed gap between the CPU and main memory is measured in orders of magnitude. A cache exploits the principle of locality to make the CPU faster, shortening the time the CPU spends stalled while it waits for data from main memory.

In this section you will first implement a standalone cache module (with an AXI bus interface and a miss-handling state machine), then integrate an ICache and a DCache into the CPU, and finally add the CACOP instruction for cache maintenance.

## Lab List

| Lab | Topic | Reference in the Book |
| ---- | ---- | ---- |
| [Lab 20: Cache Module Design](./实验20-Cache模块设计.md) | Standalone cache: set associativity, miss state machine, AXI interface | [10.1 / 10.2.1](https://bookdown.org/loongson/_book3/chapter-cache-design.html) |
| [Lab 21: Integrating the ICache into the CPU](./实验21-集成ICache.md) | Hooking an ICache into the instruction fetch path | [10.2.2 Practical Task 21](https://bookdown.org/loongson/_book3/chapter-cache-design.html) |
| [Lab 22: Integrating the DCache into the CPU](./实验22-集成DCache.md) | Hooking a DCache into the memory access path and handling the store buffer | [10.2.3 Practical Task 22](https://bookdown.org/loongson/_book3/chapter-cache-design.html) |
| [Lab 23: Adding the CACOP Instruction to the CPU](./实验23-CACOP指令.md) | Cache maintenance instructions: query and clean | [10.2.4 Practical Task 23](https://bookdown.org/loongson/_book3/chapter-cache-design.html) |
