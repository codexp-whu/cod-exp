# 存储管理单元（TLB）

本栏实验对应《CPU设计实战：LoongArch版》[第 9 章 存储管理单元设计](https://bookdown.org/loongson/_book3/chapter-mmu-design.html)。

操作系统需要虚拟地址：进程隔离、按需调页、共享内存都靠它。MMU 负责虚实地址转换，核心部件是 **TLB**（Translation Lookaside Buffer，转址后备缓冲）。本栏先做出独立的 TLB 模块，再把 TLB 指令、CSR、例外接入 CPU。

## 实验列表

| 实验 | 主题 | 原书参考 |
| ---- | ---- | ---- |
| [实验17：TLB模块设计](./实验17-TLB模块设计.md) | 实现独立的 TLB：查找、替换、维护指令 | [9.2.1 实践任务17](https://bookdown.org/loongson/_book3/chapter-mmu-design.html) |
| [实验18：添加TLB相关指令和CSR寄存器](./实验18-TLB指令和CSR.md) | `tlbsrch`/`tlbwr`/`tlbfill` 及 ASID、TLBIDX 等 CSR | [9.2.2 实践任务18](https://bookdown.org/loongson/_book3/chapter-mmu-design.html) |
| [实验19：添加TLB相关例外支持](./实验19-TLB相关例外.md) | TLB 重填/无效/修改例外，支撑内核启动 | [9.2.3 实践任务19](https://bookdown.org/loongson/_book3/chapter-mmu-design.html) |
