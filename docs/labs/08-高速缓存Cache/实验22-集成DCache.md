# 实验22：CPU中集成DCache

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》10.2.3 实践任务22：CPU中集成DCache](https://bookdown.org/loongson/_book3/chapter-cache-design.html#subsec-exp22)

## 实验目标

- 将实验二十完成的Cache模块作为 **DCache** 集成到CPU访存通路中。

## 实验内容

本实践任务要求在实验二十一完成的基础上完成以下工作：

- 将实践任务20完成的Cache模块作为DCache集成到实践任务21完成的CPU中。

!!! info "测试程序请选择EXP22"

## 实验步骤

1. 将所实现CPU的代码更新至`mycpu_env/myCPU/`目录中。
2. 修改func配置文件——`mycpu_env/func/include/test_config.h`，选择exp22的配置，编译。（`make EXP=22`）
3. 打开`gettrace` 工程——`mycpu_env/gettrace/gettrace.xpr`。运行`gettrace` 工程的仿真（进入仿真界面后，直接点击run all等待仿真运行完成），生成新的参考trace文件`golden_trace.txt`（`mycpu_env/gettrace/golden_trace.txt`）。要等仿真运行完成，`golden_trace.txt`才有完整的内容。
4. 进入 `mycpu_env/soc_verify/soc_axi/run_vivado/` 目录下启动验证myCPU的工程。如果该目录下尚未创建工程，请利用该目录下的 `create_project.tcl` 文件创建工程。如果该目录下已有前一实践任务创建过的工程，可以在打开工程后，更新项目中CPU实现文件的列表。
5. 对工程中的`axi_ram`重新定制。
6. 在验证myCPU的工程中运行仿真（进入仿真界面后，直接点击run all），进行功能验证与调试，直至仿真测试通过。
7. 在验证myCPU的工程中综合实现后生成bit流文件，进行上板验证。

## 验收标准

- [ ] 实验22 测试程序（n1~n72，共72个功能点）仿真PASS。
- [ ] 上板两个双色LED全为绿色，数码管显示"4800 0048"。

!!! tip "实现提示"

    集成 DCache 后，整 CPU 的访存路径变为：流水线 → DCache（类SRAM）→ AXI 转换桥（含 16 字节写缓存与 Burst 读）。建议再次对比运行时间，观察 DCache 的收益。
