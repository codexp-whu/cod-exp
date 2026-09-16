# 实验17：TLB模块设计

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》9.1 TLB模块设计分析 / 9.2.1 实践任务17：TLB模块设计](https://bookdown.org/loongson/_book3/chapter-mmu-design.html#subsec-exp17)

## 实验目标

- 设计并实现独立的 TLB 模块，完成模块级验证。

## 环境介绍

!!! warning

    本实验的验证环境与之前的SoC环境不同，是**针对TLB模块的单独验证环境**，位于 `mycpu_env/module_verify/tlb_verify/` 目录下，**不使用 func 测试**。

```
|--module_verify/            模块级验证环境
   |--tlb_verify/            TLB模块级验证环境。
      |--rtl/                包含TLB模块以及验证顶层的设计源码。
      |  |--tlb_top.v        TLB模块级验证的顶层文件。
      |--testbench/          功能仿真验证源码。
      |  |--testbench.v      仿真顶层。
      |--run_vivado/         Vivado工程的运行目录。
         |--constraints/     Vivado工程的设计约束。
         |--tlb_prj/         Vivado工程文件所在目录。
```

## 实验内容

本实践任务要求如下：

- 设计TLB模块，RTL文件记为 **`tlb.v`**，模块名必须命名为 **`tlb`**，输入/输出端口参考原书 9.1 节的接口定义（两套查找端口、TLBSRCH 查找、TLBWR/TLBFILL 写端口、TLBRD 读端口、INVTLB 操作）。
- 利用TLB模块级验证环境对所设计的TLB进行验证，通过仿真和上板验证。

!!! tip "设计要点"

    - 查找采用**全相联并行比较**：所有表项同时与输入的 VPPN/ASID 比较，生成 match 向量；命中项的信息经多路选择输出；
    - 比较条件要兼顾 **G 位**（全局项忽略 ASID）与**页大小**（4MB 页只比较高 10 位 VPPN，4KB 页比较全部 19 位）；
    - 表项数建议 16 项（`parameter TLBNUM = 16`）。

!!! tips "使用 Chisel BlackBox 对齐顶层"
    用 BlackBox 引用 tlb.v，端口名与 module tlb 逐字对齐，clk/rst 显式声明并连接；必要时用 HasBlackBoxResource 引入 Verilog 源文件。


## 实验步骤

1. 完成TLB模块的设计和RTL编写，记为`tlb.v`，将`tlb.v`文件放入`mycpu_env/myCPU/` 目录下。
2. 进入 `mycpu_env/module_verify/tlb_verify/run_vivado/tlb_prj/` 目录下启动验证tlb的工程。如果该目录下尚未创建工程，请利用该目录下的 `create_project.tcl` 文件创建工程。
3. 在验证tlb模块的工程中运行仿真（进入仿真界面后，直接点击run all），进行功能验证与调试，直至仿真测试通过。
4. 在验证tlb模块的工程中综合实现后生成bit流文件，进行上板验证。

## 验收标准

- [ ] TLB模块级仿真PASS（共 16 次写、16 次读以及 26 次查找操作，全部正确后打印 `PASS!!!`）。
- [ ] TLB模块上板正确。

??? tips "仿真验证结果判断"
    在仿真时，会有16次写，16次读以及26次查操作，所有操作都完成后会打印PASS，如下所示：
```
    [   2705 ns] OK!!!write
    …………
    =========================================================
    Test end!
    ----PASS!!!
```
    如果仿真中发现错误，请进行调试。这时需要观察TLB接口的访问，了解该次请求的效果，然后查看TLB的读出数据是否与预期效果相同。

??? tips "上板验证结果判断"

    上板运行时数码管会依次反映各阶段进度：

    1. **写操作（W）**：最右侧数码管从 0x00 累加到 0x0f，完成后最右侧单色 LED 亮起；
    2. **读（R）与查找（S0/S1）同时进行**：次右侧数码管（R）从 0x00 加到 0x0f；次左侧数码管（S0，偶数次请求）以步长 2 从 0x00 加到 0x18；最左侧数码管（S1，奇数次请求）以步长 2 从 0x01 加到 0x19；
    3. 全部完成后 LED 右侧三个灯亮起，正确结束时数码管显示 **0x19180f0f**。停在其它数值表示上板失败。
