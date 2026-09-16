# 实验16：完成AXI随机延迟验证

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》8.1.3 实践任务16：完成AXI随机延迟验证](https://bookdown.org/loongson/_book3/chapter-axi-bus.html#subsec-exp16)

## 实验目标

- 完善AXI总线接口设计，在随机总线延迟下验证 CPU 功能与握手的健壮性。

## 实验内容

本实践任务要求在实验十五实现的CPU基础上完成以下工作：

完善AXI总线接口设计，使其在采用AXI总线的SoC验证环境里完成 **exp16 对应func的随机延迟功能验证**，要求成功通过仿真和上板验证。

!!! warning "为什么随机延迟能抓出 bug"

    固定延迟的应答掩盖了握手时序问题：`READY` 迟到、`VALID` 撤销时机错误、多拍等待中丢数据等 bug，只有延迟随机化后才会暴露。随机延迟由 `confreg.v` 中的伪随机数发生器生成，仿真时其初始种子由宏 `RANDOM_SEED` 控制。

## 实验步骤

1. 将所实现CPU的代码更新至`mycpu_env/myCPU/`目录中。
2. 修改func配置文件——`mycpu_env/func/include/test_config.h`，选择exp16的配置，编译。（`make EXP=16`）
3. 打开`gettrace` 工程——`mycpu_env/gettrace/gettrace.xpr`。运行`gettrace` 工程的仿真（进入仿真界面后，直接点击run all等待仿真运行完成），生成新的参考trace文件`golden_trace.txt`（`mycpu_env/gettrace/golden_trace.txt`）。要等仿真运行完成，`golden_trace.txt`才有完整的内容。
4. 进入 `mycpu_env/soc_verify/soc_axi/run_vivado/` 目录下启动验证myCPU的工程。如果该目录下尚未创建工程，请利用该目录下的 `create_project.tcl` 文件创建工程。
5. 对工程中的`axi_ram`重新定制。
6. **修改 `mycpu_env/soc_verify/soc_axi/rtl/CONFREG/confreg.v` 文件中宏 `RANDOM_SEED` 为不同值**，在验证myCPU的工程中运行仿真（进入仿真界面后，直接点击run all），进行功能验证与调试，直至仿真测试通过。
7. 重复上一步骤多次，要求宏 `RANDOM_SEED` 的修改值能覆盖**三种随机延迟类型**（长延迟、短延迟、无延迟）。
8. 在验证myCPU的工程中综合实现后生成bit流文件，进行上板验证。

## 验收标准

- [ ] 实验16 测试程序（n1~n58，共58个功能点）仿真PASS，且覆盖三种延迟类型的多组 `RANDOM_SEED` 均通过。
- [ ] 上板两个双色LED全为绿色，数码管显示"3A00 003A"。

??? tips "上板验证要求"

    上板验证时，要求**"随意切换拨码开关后按复位键"**均能正确运行func（复位期间的拨码开关状态作为初始随机种子）。如果出现"仿真通过，上板不过"的现象，请按照实验十四介绍的方法进行调试：将出错的种子写入 `confreg.v` 的 `RANDOM_SEED` 后仿真复现；无法复现时，排查代码规范性问题或使用 Vivado 逻辑分析仪在线调试。
