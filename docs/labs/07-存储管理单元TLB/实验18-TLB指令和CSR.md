# 实验18：添加TLB相关指令和CSR寄存器

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》9.2.2 实践任务18：添加TLB相关指令和CSR寄存器](https://bookdown.org/loongson/_book3/chapter-mmu-design.html)

## 实验目标

- 实现 TLB 探查与读写指令：`tlbsrch`、`tlbwr`、`tlbfill`（以及 `invtlb`，视课程清单）。
- 实现配套 CSR：`TLBIDX`、`TLBEHI`、`TLBELO0/1`、`ASID`、`PGDL/PGDH/PGD`。
- 将 CSR 写→TLB 操作之间的数据通路与前递接好。

## 知识背景

### 软件如何管理 TLB

LoongArch 采用**软件管理 TLB**：硬件提供表项存储和基本指令，填表、换页、刷新全由内核程序完成。三件套配合的典型流程：

```text
tlbsrch   : 把 CSR.TLBEHI 中的虚页号拿去 TLB 里查，命中则把表项号写入 CSR.TLBIDX.Index
tlbwr     : 把 CSR.TLBEHI/TLBELO0/1 组装的表项，写到 CSR.TLBIDX.Index 指定的表项（覆盖）
tlbfill   : 同 tlbwr，但写入位置由替换算法（你实验 17 的 LRU）决定
```

### 涉及的 CSR

| CSR | 职责 |
| --- | ---- |
| `TLBIDX` | 表项号；`Ne` 位记录 tlbsrch 是否命中 |
| `TLBEHI` | 待查/待写的虚页号（VPN、VPPN） |
| `TLBELO0/1` | 奇偶两个页表项：PPN、权限、标志位 |
| `ASID` | 当前地址空间标识 |
| `PGDL/PGDH/PGD` | 页目录基址（供内核走页表用） |

### 流水线集成难点

- 这些指令都在 **EX/WB 级才真正动 TLB**，而取指、访存每拍都在查 TLB——**查与写的并发**需要仲裁（简单做法：TLB 写时冻结取指/访存一拍）；
- CSR→TLB 的操作数来自寄存器堆读出值，前递网络要覆盖"写 CSR 后紧跟 tlbwr"的序列。

## 任务要求

1. 实现上述全部指令与 CSR；
2. 编写仿真测试：软件填表（`csrwr`+`tlbfill`）→ 触发查找 → `tlbsrch` 命中/未命中 → `tlbwr` 定点更新；
3. 验证 TLB 写入与取指/访存查找并发时的行为正确性。

## 验收标准

- [ ] 全部 TLB 指令、CSR 的功能测试通过；
- [ ] 并发场景（TLB 写入的同时有访存请求）无冲突错误；
- [ ] 提交源码与实验报告。

!!! question "思考题"

    1. `tlbwr` 与 `tlbfill` 分别适用什么场景？为什么内核缺页处理常用 `tlbfill`？
    2. TLB 比较需要 ASID + G 位共同决定命中。全 0 的 ASID 会不会误命中所有表项？如何避免？
