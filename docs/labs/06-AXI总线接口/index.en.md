# AXI Bus Interface

**Read the explanatory part of the corresponding chapter of *CPU Design in Practice: LoongArch Edition* first, then come back to these lab notes for the lab requirements and work through them.**

!!! warning
    **All lab requirements are governed by the lab notes on this site. Do not follow the lab requirements given in *CPU Design in Practice: LoongArch Edition*!**

!!! info "Reference in the Book"
    The labs in this section correspond to [Chapter 8, AXI Bus Interface Design](https://bookdown.org/loongson/_book3/chapter-axi-bus.html) in *CPU Design in Practice: LoongArch Edition*.

In a real system the CPU is not wired directly to memory; it interacts with the outside world through a bus protocol. The labs in this section move from a custom SRAM-like bus to the **AXI protocol**, and introduce random-delay verification.

## Lab List

| Lab | Topic | Reference in the Book |
| ---- | ---- | ---- |
| [Lab 14: Adding SRAM-Like Bus Support](./实验14-类SRAM总线.md) | Turn instruction-fetch and memory-access requests into handshake-based bus requests | [8.1.1 Practical Task 14](https://bookdown.org/loongson/_book3/chapter-axi-bus.html) |
| [Lab 15: Adding AXI Bus Support](./实验15-AXI总线.md) | Implement the AXI channel protocol and an SRAM-like-to-AXI conversion bridge | [8.1.2 Practical Task 15](https://bookdown.org/loongson/_book3/chapter-axi-bus.html) |
| [Lab 16: Completing AXI Random-Delay Verification](./实验16-AXI随机延迟验证.md) | Verify functionality and freedom from deadlock under random bus delays | [8.1.3 Practical Task 16](https://bookdown.org/loongson/_book3/chapter-axi-bus.html) |
