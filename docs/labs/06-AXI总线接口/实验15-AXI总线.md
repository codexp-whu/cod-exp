# 实验15：添加AXI总线支持

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》8.1.2 实践任务15：添加AXI总线支持](https://bookdown.org/loongson/_book3/chapter-axi-bus.html#subsec-exp15)

## 实验目标

- 将 CPU 顶层接口改造为 **AXI 总线接口**，实现类SRAM-AXI转接桥，在 AXI 总线的 SoC 验证环境中完成固定延迟功能验证。

## 环境介绍

!!! warning

    本实验的验证环境**不再使用 `soc_hs_bram/` 子目录，而应使用 `soc_axi/` 子目录**！

伴随着CPU对外访问接口由带握手机制的block RAM更换为**AXI总线接口**，验证环境进一步调整：`gettrace/`、`func/` 和 `myCPU/` 子目录的位置和用途依然维持不变，只是 `soc_verify/` 子目录下改用 `soc_axi/` 子目录：

```
|--mycpu_env/                实验环境根目录
|--gettrace/                 生成参考trace的部分。
|--func/                     实验任务所用的功能验证测试程序。
|--myCPU/                    自己实现的CPU的RTL代码。
|--soc_verify/               自己实现的CPU的SoC系统验证环境
   |--soc_axi/               CPU对外连接AXI接口时对应的验证环境。
      |--rtl/                SoC_Lite设计代码目录。
      |  |--soc_lite_top.v   SoC_Lite的顶层文件。
      |  |--CONFREG/         confreg模块，用于访问CPU与开发板上数码管、拨码开关等外设。
      |  |--ram_wrap/        以支持随机延迟访问封装的AXI RAM模块。
      |  |--axi_wrap/        AXI的1x1转接口，连接CPU和Crossbar，用于抹平仿真和上板的差异。
      |  |--xilinx_ip/       定制的Xilinx IP，包含clk_pll、axi_ram和axi_crossbar_1x2。
      |--testbench/          功能仿真验证平台。
      |  |--mycpu_tb.v       功能仿真顶层，该模块会抓取debug信息与golden_trace.txt进行比对。
      |--run_vivado/         Vivado工程的运行目录。
         |--constraints/     Vivado工程的设计约束。
         |--mycpu_axi_prj/   Vivado工程文件所在目录。
```

## 实验内容

本实践任务要求在实验十四实现的CPU基础上完成以下工作：

- 将CPU顶层接口修改为**AXI总线接口**。CPU对外只有一个AXI接口，需在内部完成**取指和数据访问的仲裁**。
- 推荐实现一个**类SRAM-AXI的2×1转接桥**：对内提供两个类SRAM端口（取指、访存）并完成仲裁，对外封装为AXI接口，与实验十四完成的类SRAM接口CPU拼接。

!!! tips
    可以参考OpenLA500处理器核的AXI总线实现！

!!! info "测试程序请选择EXP15"

## 实验步骤

1. 将所实现CPU的代码更新至`mycpu_env/myCPU/`目录中。
2. 修改func配置文件——`mycpu_env/func/include/test_config.h`，选择exp15的配置，编译。（`make EXP=15`）
3. 打开`gettrace` 工程——`mycpu_env/gettrace/gettrace.xpr`。运行`gettrace` 工程的仿真（进入仿真界面后，直接点击run all等待仿真运行完成），生成新的参考trace文件`golden_trace.txt`（`mycpu_env/gettrace/golden_trace.txt`）。要等仿真运行完成，`golden_trace.txt`才有完整的内容。
4. 进入 `mycpu_env/soc_verify/soc_axi/run_vivado/` 目录下启动验证myCPU的工程。如果该目录下尚未创建工程，请利用该目录下的 `create_project.tcl` 文件创建工程。
5. 对工程中的`axi_ram`重新定制。
6. 在验证myCPU的工程中运行仿真（进入仿真界面后，直接点击run all），进行功能验证与调试，直至仿真测试通过。
7. 在验证myCPU的工程中综合实现后生成bit流文件，进行上板验证。

## 验收标准

- [ ] 实验15 测试程序（n1~n58，共58个功能点）仿真PASS。
- [ ] 上板两个双色LED全为绿色，数码管显示"3A00 003A"。

??? tips "上板验证要求"

    上板验证时，要求低8个拨码开关处于**"高4个拨下，低4个拨上"**的状态（对应访存随机延迟类型为**无延迟**），能正确运行func。
