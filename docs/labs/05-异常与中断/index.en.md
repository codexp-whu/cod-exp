# Exceptions and Interrupts

**Read the explanatory part of the corresponding chapter of *CPU Design in Practice: LoongArch Edition* first, then come back to these lab notes for the lab requirements and work through them.**

!!! warning
    **All lab requirements are governed by the lab notes on this site. Do not follow the lab requirements given in *CPU Design in Practice: LoongArch Edition*!**

!!! info "Reference in the Book"
    The labs in this section correspond to [Chapter 7, Support for Exceptions and Interrupts](https://bookdown.org/loongson/_book3/chapter-support-exception.html) in *CPU Design in Practice: LoongArch Edition*.

Exceptions and interrupts are the cornerstone of a CPU's support for an operating system: system calls, page faults and timer interrupts all reach the kernel through this one mechanism. The labs in this section add precise exceptions to your pipelined CPU: **capturing the processor state at the point of the exception accurately and handing control to the exception handler**.

## Lab List

| Lab | Topic | Reference in the Book |
| ---- | ---- | ---- |
| [Lab 12: Adding System Call Exception Support](./实验12-系统调用异常.md) | Implement `syscall`, the CSRs and `ertn`, and get the exception response loop working end to end | [7.1.1 Practical Task 12](https://bookdown.org/loongson/_book3/chapter-support-exception.html) |
| [Lab 13: Adding Support for Other Exceptions](./实验13-其它异常.md) | Generalize exception detection to cover the full set of exception types and interrupts | [7.1.2 Practical Task 13](https://bookdown.org/loongson/_book3/chapter-support-exception.html) |
