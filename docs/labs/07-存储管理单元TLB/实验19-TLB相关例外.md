# 实验19：添加TLB相关例外支持

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》9.2.3 实践任务19：添加TLB相关例外支持](https://bookdown.org/loongson/_book3/chapter-mmu-design.html#subsec-exp19)

## 实验目标

- 为 CPU 添加 TLB 相关例外与虚实地址映射功能，完成 MMU 的全部功能。

## 实验内容

本实践任务要求在实验十八所实现CPU的基础上完成以下工作：

- 为CPU增加TLB相关异常：**TLB重填例外、load/store/取指操作页无效例外、页修改例外、页特权等级不合规例外**。
- 在CPU中增加**DMW** CSR寄存器。
- 为CPU增加**虚实地址映射**的功能。

!!! warning "地址翻译模式"

    CRMD 的 DA/PG 域决定翻译模式：直接映射（DA=1）时按 DMW 寄存器配置直接映射；页映射（PG=1）时虚地址先查 TLB 得到 PPN 再拼物理地址。TLB 例外的检测位置在**取指（IF）和访存（MEM）**，比 syscall 等更靠前也更频繁，要把它们纳入实验十二/十三建立的精确异常仲裁框架。

!!! info "测试程序请选择EXP19"

## 实验步骤

1. 将所实现CPU的代码更新至`mycpu_env/myCPU/`目录中。
2. 修改func配置文件——`mycpu_env/func/include/test_config.h`，选择exp19的配置，编译。（`make EXP=19`）
3. 打开`gettrace` 工程——`mycpu_env/gettrace/gettrace.xpr`。运行`gettrace` 工程的仿真（进入仿真界面后，直接点击run all等待仿真运行完成），生成新的参考trace文件`golden_trace.txt`（`mycpu_env/gettrace/golden_trace.txt`）。要等仿真运行完成，`golden_trace.txt`才有完整的内容。
4. 进入 `mycpu_env/soc_verify/soc_axi/run_vivado/` 目录下启动验证myCPU的工程。如果该目录下尚未创建工程，请利用该目录下的 `create_project.tcl` 文件创建工程。如果该目录下已有前一实践任务创建过的工程，可以在打开工程后，更新项目中CPU实现文件的列表。
5. 对工程中的`axi_ram`重新定制。
6. 在验证myCPU的工程中运行仿真（进入仿真界面后，直接点击run all），进行功能验证与调试，直至仿真测试通过。
7. 在验证myCPU的工程中综合实现后生成bit流文件，进行上板验证。

## 验收标准

- [ ] 实验19 测试程序（n1~n72，共72个功能点）仿真PASS。
- [ ] 上板两个双色LED全为绿色，数码管显示"4800 0048"。

!!! tip "实现提示"

    - 各例外的区分：TLB 查找 miss → 重填例外；命中但 V=0 → 页无效例外（还要区分取指/取数来源）；store 命中但 D=0 → 页修改例外；当前 PLV 低于表项 PLV → 特权等级不合规例外；
    - 触发例外的虚地址记入 **TLBRBADV**（区别于通用的 BADV）；
    - 例外的入口地址（EENTRY 或专设的 TLB 重填入口）与 `ertn` 恢复 DA/PG 的行为，请对照[LoongArch32R指令集手册](https://www.loongson.cn/uploads/images/2023041918122813624.%E9%BE%99%E8%8A%AF%E6%9E%B6%E6%9E%8432%E4%BD%8D%E7%B2%BE%E7%AE%80%E7%89%88%E5%8F%82%E8%80%83%E6%89%8B%E5%86%8C_r1p03.pdf)实现。
