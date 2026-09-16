# 实验14：添加类SRAM总线支持

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》8.1.1 实践任务14：添加类SRAM总线支持](https://bookdown.org/loongson/_book3/chapter-axi-bus.html#subsec-exp14)

## 实验目标

- 将 CPU 对外的 SRAM 接口改造为**类SRAM总线接口**（带握手机制），使 CPU 能够容忍访存等待。

## 环境介绍

!!! warning

    本实验的验证环境**不再使用 `soc_bram/` 子目录，而应使用 `soc_hs_bram/` 子目录**！

伴随着CPU访问的指令RAM和数据RAM从普通的block RAM更换为**带握手机制的block RAM**，验证环境相应调整：`gettrace/`、`func/` 和 `myCPU/` 子目录的位置和用途依然维持不变，只是 `soc_verify/` 子目录下改用 `soc_hs_bram/` 子目录，其文件组织结构与 `soc_bram/` 相似：

```
|--mycpu_env/                实验环境根目录
|--gettrace/                 生成参考trace的部分。
|--func/                     实验任务所用的功能验证测试程序。
|--myCPU/                    自己实现的CPU的RTL代码。
|--soc_verify/               自己实现的CPU的SoC系统验证环境
   |--soc_hs_bram/           CPU对外连接handshaking block RAM接口时对应的验证环境。
      |--rtl/                SoC_Lite设计代码目录。
      |  |--soc_lite_top.v   SoC_Lite的顶层文件。
      |  |--CONFREG/         confreg模块，用于访问CPU与开发板上数码管、拨码开关等外设。
      |  |--BRIDGE/          1×2的桥接模块，CPU的data sram接口同时访问confreg和data_ram。
      |  |--ram_wrap/        以类SRAM接口封装的RAM模块。
      |  |--xilinx_ip/       定制的Xilinx IP，包含clk_pll、inst_ram、data_ram。
      |--testbench/          功能仿真验证平台。
      |  |--mycpu_tb.v       功能仿真顶层，该模块会抓取debug信息与golden_trace.txt进行比对。
      |--run_vivado/         Vivado工程的运行目录。
         |--constraints/     Vivado工程的设计约束。
         |--mycpu_hs_bram_prj/ Vivado工程文件所在目录。
```

## 实验内容

本实践任务要求在实验十三实现的CPU基础上完成以下工作：

- 将CPU对外接口修改为**类SRAM总线接口**：在原有 sram 接口信号的基础上增加 `inst_sram_addr_ok`、`inst_sram_data_ok`、`data_sram_addr_ok`、`data_sram_data_ok` 握手信号。请求发出后可能要等待多拍才能得到应答，CPU 流水线必须能在等待期间正确冻结。
- 在采用握手机制的block RAM的SoC验证环境中完成 **exp14 对应func的随机延迟功能验证**。

!!! warning "随机延迟"

    验证环境中的 RAM 访问延迟是**随机的**（由 `confreg.v` 中的伪随机数发生器生成）。仿真时初始随机种子由 `confreg.v` 里的宏 `RANDOM_SEED` 指定；上板时由复位期间采样到的拨码开关状态指定。请确认你的 CPU 在任意延迟下都能正确工作。

!!! info "测试程序请选择EXP14"

## 实验步骤

1. 将所实现CPU的代码更新至`mycpu_env/myCPU/`目录中。
2. 修改func配置文件——`mycpu_env/func/include/test_config.h`，选择exp14的配置，编译。（`make EXP=14`）
3. 打开`gettrace` 工程——`mycpu_env/gettrace/gettrace.xpr`。运行`gettrace` 工程的仿真（进入仿真界面后，直接点击run all等待仿真运行完成），生成新的参考trace文件`golden_trace.txt`（`mycpu_env/gettrace/golden_trace.txt`）。要等仿真运行完成，`golden_trace.txt`才有完整的内容。
4. 进入 `mycpu_env/soc_verify/soc_hs_bram/run_vivado/` 目录下启动验证myCPU的工程。如果该目录下尚未创建工程，请利用该目录下的 `create_project.tcl` 文件创建工程。
5. 对工程中的`inst_ram`重新定制。
6. 在验证myCPU的工程中运行仿真（进入仿真界面后，直接点击run all），进行功能验证与调试，直至仿真测试通过。
7. 在验证myCPU的工程中综合实现后生成bit流文件，进行上板验证。

??? tips "上板验证要求"

    上板验证时，要求**"随意切换拨码开关后按复位键"**，CPU能通过对应exp14的func中58个功能点的验证。

    复位期间的拨码开关状态作为初始随机种子，决定取指和访存的随机延迟拍数。不同种子下 CPU 执行状态差别很大，某个种子下出错是很常见的。若出现"仿真通过、上板不过"，可将 `confreg.v` 中的 `RANDOM_SEED` 改为出错的种子值再仿真复现调试。上板时应尽量覆盖**长延迟、短延迟、无延迟**三类延迟（种子与延迟类型的对应关系参见原书图8.1）。

    复位后拨码开关的第二个功能是控制数码管的累加速度（调整测试观察节奏）。

## 验收标准

- [ ] 实验14 测试程序（n1~n58，共58个功能点）仿真PASS。
- [ ] 上板两个双色LED全为绿色，数码管显示"3A00 003A"，且更换多个随机种子（多次切换拨码开关+复位）均能通过。
