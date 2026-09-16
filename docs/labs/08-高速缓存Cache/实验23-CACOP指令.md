# 实验23：CPU中添加CACOP指令

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》10.2.4 实践任务23：CPU中添加CACOP指令](https://bookdown.org/loongson/_book3/chapter-cache-design.html#subsec-exp23)

## 实验目标

- 在CPU中实现 **CACOP** 指令（Cache 维护操作），完成 Cache 实验的最后一环。

## 实验内容

本实践任务要求在实践任务22完成的基础上完成以下工作：

- 在实践任务22完成的CPU中增加**CACOP指令**实现。

!!! warning "CACOP 的语义"

    `cacop op, rj, si12` 按 op 值对 `rj + sext(si12)` 对应 Cache 行（对齐到行边界）执行维护操作：查询（读 Tag 到 CSR）、置无效（清 V，数据丢弃）、写回（脏行写回内存）、冲刷（写回+置无效）。CACOP 是**特权指令**，非 PLV0 执行触发特权指令例外。

!!! info "测试程序请选择EXP23"

## 实验步骤

1. 将所实现CPU的代码更新至`mycpu_env/myCPU/`目录中。
2. 修改func配置文件——`mycpu_env/func/include/test_config.h`，选择exp23的配置，编译。（`make EXP=23`）
3. 打开`gettrace` 工程——`mycpu_env/gettrace/gettrace.xpr`。运行`gettrace` 工程的仿真（进入仿真界面后，直接点击run all等待仿真运行完成），生成新的参考trace文件`golden_trace.txt`（`mycpu_env/gettrace/golden_trace.txt`）。要等仿真运行完成，`golden_trace.txt`才有完整的内容。
4. 进入 `mycpu_env/soc_verify/soc_axi/run_vivado/` 目录下启动验证myCPU的工程。如果该目录下尚未创建工程，请利用该目录下的 `create_project.tcl` 文件创建工程。如果该目录下已有前一实践任务创建过的工程，可以在打开工程后，更新项目中CPU实现文件的列表。
5. 对工程中的`axi_ram`重新定制。
6. 在验证myCPU的工程中运行仿真（进入仿真界面后，直接点击run all），进行功能验证与调试，直至仿真测试通过。
7. 在验证myCPU的工程中综合实现后生成bit流文件，进行上板验证。

## 验收标准

- [ ] 实验23 测试程序（n1~n79，共79个功能点）仿真PASS。
- [ ] 上板两个双色LED全为绿色，数码管显示"4F00 004F"。

!!! tip "实现提示"

    - 实现了 CACOP 后，Cache 便可以**软件初始化**：软件用 CACOP 将所有 Tag 置 0 即完成初始化，硬件初始化电路成为备用手段；
    - CACOP 执行期间可能发起总线写回（冲刷脏行），需要像多周期乘除一样冻结流水线等待完成。
