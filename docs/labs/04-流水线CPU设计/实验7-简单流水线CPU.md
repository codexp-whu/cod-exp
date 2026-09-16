# 实验7：不考虑相关冲突处理的简单流水线CPU

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》5.1.1 实践任务7：不考虑相关冲突处理的简单流水线CPU](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html#subsec-exp7)

## 实验目标

- 将单周期 CPU 的数据通路切分为 IF / ID / EX / MEM / WB 五级，插入流水级寄存器。
- 理解流水线对吞吐率的提升及其代价（冲突）。
- 本实验**故意不处理**相关冲突，直观感受错误现象。

## 环境介绍

!!! warning 
    在开始实验前，请确保你已经根据[Chisel入门讲义](../../chisel/简介.md)配置好了Chisel开发环境并对Chisel基本语法有一定的了解。

### Vivado工程环境
!!! warning
    具体的实验环境仍位于 `mycpu_env/` 目录下，不过验证时不再使用`soc_dram/`子目录，而应使用**soc_bram/子目录**!

伴随着CPU访问的指令RAM和数据RAM的实现形式从distributed RAM更换为block RAM，实验开发环境也需要有所调整：仍然是`mycpu_env`实验环境，`gettrace/`、`func/` 和 `myCPU/` 子目录的位置和用途依然维持不变，只是 `soc_verify/` 子目录下不再使用 `soc_dram/` 子目录而是改为使用 `soc_bram/` 子目录，`soc_bram/` 子目录中的文件组织结构和用途与 `soc_dram/` 子目录中的相似。调整后的实验开发环境的目录结构及各部分功能简介如下所示：
```
|--gettrace/                生成参考trace的部分。
|--func/                    实验任务所用的功能验证测试程序。
|--myCPU/                   自己实现的CPU的RTL代码。
|--soc_verify/              自己实现的CPU的SoC系统验证环境
   |--soc_bram/             CPU对外连接block RAM接口时对应的验证环境。
   |  |--rtl/               SoC_Lite设计代码目录。
   |  |  |--soc_lite_top.v  SoC_Lite的顶层文件。
   |  |  |--CONFREG/        confreg模块，用于访问CPU与开发板上数码管、拨码开关等外设。
   |  |  |--BRIDGE/         1×2的桥接模块， CPU的data sram接口同时访问confreg和data_ram。
   |  |  |--xilinx_ip/      定制的Xilinx IP，包含clk_pll、inst_ram、data_ram。
   |  |--testbench/         功能仿真验证平台。
   |  |  |--mycpu_tb.v      功能仿真顶层，该模块会抓取debug信息与golden_trace.txt进行比对。
   |  |--run_vivado/        Vivado工程的运行目录。
   |     |--constraints/    Vivado工程的设计约束。
   |     |--mycpu_bram_prj/ Vivado工程文件所在目录。
```

从实验7开始的 **指令RAM和数据RAM均采用block RAM实现** ，其访问时需要给出片选信号。为此myCPU 顶层接口中增加了指令RAM的片选信号 `inst_sram_en` 和数据RAM的片选信号 `data_sram_en`。两个信号均为1比特，均为高电平有效。

考虑到后续实践任务的需求，myCPU 顶层接口中的 `inst_sram_we` 和 `data_sram_we` 都从1比特改为4比特，其含义也**从RAM的写使能调整为RAM的字节写使能。**

### Chisel 开发环境
Chisel开发应在Linux环境下进行，在开发完成后，请参考其中的README文档生成Verilog文件，将Verilog文件移入`mycpu_env/myCPU`中即可在Vivado中仿真、上板。


## 实验内容
我们已经提供了一个Chisel版本的支持五条指令的五级流水线CPU，请先在Linux环境中克隆Chisel开发框架：
```
TODO:待补充
```

!!! warning
     在开始实验前请先确认你的Chisel开发环境能够正确生成Verilog文件并能够在`soc_bram`环境中仿真！（因为只有五条指令，仿真不能通过是正常的。）

!!! info "Chisel版本的支持五条指令的五级流水线CPU导读"
    请访问[Chisel五级流水线CPU导读](TODO:待补充) 了解我们提供的五级流水线CPU框架。

请你在此基础上扩展支持和实验六相同的20条指令（只是从单周期变成了流水线）：

- 算术运算：**add.w, sub.w, addi.w**
- 比较运算：**slt, sltu**
- 逻辑运算：**nor, and, or, xor**
- 移位运算：**slli.w, srli.w, srai.w**
- 访存指令：**ld.w, st.w**
- 分支跳转：**jirl, b, bl, beq, bne**
- 其他：**lu12i.w**

!!! info "测试程序请选择EXP7"


## 实验步骤

1. 将Chisel环境生成的CPU代码更新至`mycpu_env/myCPU/`目录中。
2. 修改func配置文件——`mycpu_env/func/include/test_config.h`，选择exp7的配置，编译。(`make EXP=7`)
3. 打开`gettrace` 工程——`mycpu_env/gettrace/gettrace.xpr`。（该Vivado工程中的IP核是使用Vivado2019.2创建的，如果使用更高版本的Vivado打开，进行IP核升级。）运行`gettrace` 工程的仿真（进入仿真界面后，直接点击run all等待仿真运行完成），生成新的参考trace文件`golden_trace.txt（`mycpu_env/gettrace/golden_trace.txt`）`。要等仿真运行完成，`golden_trace.txt`才有完整的内容。
4. 进入 `mycpu_env/soc_verify/soc_bram/run_vivado/` 目录下启动验证myCPU的工程。如果该目录下尚未创建工程，请利用该目录下的 `create_project.tcl` 文件创建工程。
5. 对工程中的`inst_ram`重新定制。
6. 在验证myCPU的工程中运行仿真（进入仿真界面后，直接点击run all），进行功能验证与调试，直至仿真测试通过。
7. 在验证myCPU的工程中综合实现后生成bit流文件，进行上板验证。


## 验收标准

- [ ]  实验7测试程序仿真PASS！
- [ ]  上板两个双色LED全为绿色，数码管显示`1400 0014`
