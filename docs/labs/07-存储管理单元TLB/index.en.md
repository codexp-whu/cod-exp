# Memory Management Unit (TLB)

**Read the explanatory part of the corresponding chapter of *CPU Design in Practice: LoongArch Edition* first, then come back to these notes for the lab requirements.**

!!! warning
    **The lab notes on this site are the authoritative statement of all lab requirements. Do not follow the lab requirements given in *CPU Design in Practice: LoongArch Edition*!**

!!! info "Reference in the Book"
    The labs in this section correspond to [Chapter 9, Memory Management Unit Design](https://bookdown.org/loongson/_book3/chapter-mmu-design.html) of *CPU Design in Practice: LoongArch Edition*.

Operating systems need virtual addresses: process isolation, demand paging and shared memory all depend on them. The MMU is responsible for virtual-to-physical address translation, and its core component is the **TLB** (Translation Lookaside Buffer).

In this section you will first build a standalone TLB module, then wire the TLB instructions, CSRs and exceptions into the CPU.

## Lab List

| Lab | Topic | Reference in the Book |
| ---- | ---- | ---- |
| [Lab 17: TLB Module Design](./实验17-TLB模块设计.md) | Build a standalone TLB: lookup, replacement and maintenance instructions | [9.2.1 Practical Task 17](https://bookdown.org/loongson/_book3/chapter-mmu-design.html) |
| [Lab 18: Adding TLB Instructions and CSRs](./实验18-TLB指令和CSR.md) | `tlbsrch`/`tlbwr`/`tlbfill` plus CSRs such as ASID and TLBIDX | [9.2.2 Practical Task 18](https://bookdown.org/loongson/_book3/chapter-mmu-design.html) |
| [Lab 19: Adding TLB-Related Exception Support](./实验19-TLB相关例外.md) | TLB refill/invalid/modified exceptions, supporting kernel startup | [9.2.3 Practical Task 19](https://bookdown.org/loongson/_book3/chapter-mmu-design.html) |
