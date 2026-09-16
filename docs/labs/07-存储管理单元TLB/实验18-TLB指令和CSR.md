# 实验18：添加TLB相关指令和CSR寄存器

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》9.2.2 实践任务18：添加TLB相关指令和CSR寄存器](https://bookdown.org/loongson/_book3/chapter-mmu-design.html#subsec-exp18)

## 实验目标

- 将实验十七完成的TLB模块集成到CPU中，添加TLB相关指令和CSR寄存器。

## 实验内容

本实践任务要求在实验十六和实验十七的基础上完成以下工作：

- 将实践任务17完成的TLB模块集成到实践任务16完成的CPU中。
- 在CPU中增加TLB操作指令：**TLBSRCH、TLBRD、TLBWR、TLBFILL、INVTLB**。
- 在CPU中增加CSR寄存器：**TLBIDX、TLBEHI、TLBELO0、TLBELO1、ASID、TLBRENTRY**。


!!! info "测试程序请选择EXP18"

## 实验步骤

1. 将所实现CPU的代码更新至`mycpu_env/myCPU/`目录中。
2. 修改func配置文件——`mycpu_env/func/include/test_config.h`，选择exp18的配置，编译。（`make EXP=18`）
3. 打开`gettrace` 工程——`mycpu_env/gettrace/gettrace.xpr`。运行`gettrace` 工程的仿真（进入仿真界面后，直接点击run all等待仿真运行完成），生成新的参考trace文件`golden_trace.txt`（`mycpu_env/gettrace/golden_trace.txt`）。要等仿真运行完成，`golden_trace.txt`才有完整的内容。
4. 进入 `mycpu_env/soc_verify/soc_axi/run_vivado/` 目录下启动验证myCPU的工程。如果该目录下尚未创建工程，请利用该目录下的 `create_project.tcl` 文件创建工程。如果该目录下已有前一实践任务创建过的工程，可以在打开工程后，更新项目中CPU实现文件的列表。
5. 对工程中的`axi_ram`重新定制。
6. 在验证myCPU的工程中运行仿真（进入仿真界面后，直接点击run all），进行功能验证与调试，直至仿真测试通过。
7. 在验证myCPU的工程中综合实现后生成bit流文件，进行上板验证。

## 验收标准

- [ ] 实验18 测试程序（n1~n70，共70个功能点）仿真PASS。
- [ ] 上板两个双色LED全为绿色，数码管显示"4600 0046"。

!!! tip "实现提示"

    - 五条 TLB 指令的操作数与结果都通过 CSR 传递（TLBEHI 放待查 VPPN、TLBELO0/1 放表项内容、TLBIDX 放表项号与查询结果），CSR→TLB、TLB→CSR 两条通路都要接好；
    - 本实验还**不需要**实现虚实地址转换——CPU 仍工作在直接映射模式，func 测试验证的是指令与 CSR 本身的正确性。
