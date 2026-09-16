# 实验3：同步RAM和异步RAM

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》3.1.2 实践任务3：同步RAM和异步RAM仿真、综合与实现](https://bookdown.org/loongson/_book3/chapter-digital-logic.html#subsec-exp3)

## 实验目标

- 调用Xilinx库IP实例化一个同步RAM，进行仿真以观察行为，进行综合和实现后查看时序结果和资源利用率。
- 调用Xilinx库IP实例化一个异步RAM，进行仿真以观察行为，进行综合和实现后查看时序结果和资源利用率。
- 对观察到的现象进行对比分析

## 知识背景

CPU 取指和访存都要用到 RAM。FPGA 上的 RAM 有两种常见风格：

| 特性 | 异步 RAM | 同步 RAM |
| ---- | -------- | -------- |
| 读数据输出 | 地址有效后组合逻辑直接输出 | 地址在时钟沿被采样，数据在下一个沿（或后一拍）输出 |
| 对应 FPGA 资源 | 会被综合成分布式 RAM（LUT） | 可映射为 Block RAM（BRAM） |
| 时序特性 | 大容量时时序差 | 时序好，适合大容量、高频设计 |

关键区别在**读时序**：异步 RAM 的读数据与地址同拍出现；同步 RAM 读地址打一拍后数据才出现。

综合实现后，对比两者在 Vivado 资源报告中占用 LUT / BRAM 的差异，你会直观看到综合器如何将不同代码风格映射到不同硬件资源。

## 实验内容

具体的实验环境位于 `dc_env/exp3/` 目录下，其目录结构如下：
```
|--block_ram_top.v       同步RAM（Block RAM）的源码顶层文件。
|--distributed_ram_top.v 异步RAM（Distributed RAM）的源码顶层文件。
|--ram.xdc               两种RAM的仿真约束文件，用于综合和实现。
|--ram_tb.v              两种RAM的仿真文件，用于仿真。
```

实验环境提供的设计顶层文件用于将两种类型的RAM封装成相同的模块名和接口。封装后的RAM顶层接口信号如下所示。
### 模块接口（两种 RAM 相同）

| 信号 | 方向 | 位宽 | 说明 |
| ---- | ---- | ---- | ---- |
| `clk` | 输入 | 1 | 时钟 |
| `ram_wen` | 输入 | 1 | RAM的写使能信号：为1表示写入操作，为0表示读取操作 |
| `ram_addr` | 输入 | 10 | 	RAM的地址信号，读和写的地址都由该信号指示 |
| `ram_wdata` | 输入 | 32 | RAM写入的数据 |
| `ram_rdata` | 输出 | 32 | RAM读出的数据 |

注意：包封后的RAM接口没有片选信号，即片选使能始终有效（其内部实例化的具体RAM的片选使能信号恒为1）。

## 实验步骤
### 建立同步RAM工程

1. 使用Vivado新建一个工程。
2. 点击“Add Sources”，选择添加设计源码（design sources），加入block_ram_top.v。
3. 点击“Add Sources”，选择添加约束文件（constraints），加入ram.xdc。
4. 点击“Add Sources”，选择添加仿真源码（simulation sources），加入ram_tb.v。
5. 调用Xilinx库IP生成同步RAM（Block RAM，深度为65536，宽度为32，片选使能信号设为一直有效）。
!!! tips "定制同步RAM IP核"
    若不会生成同步RAM IP核，请访问：[定制同步RAM IP核](https://bookdown.org/loongson/_book3/appendix-vivado-advanced-usage.html#%E5%AE%9A%E5%88%B6%E5%90%8C%E6%AD%A5ram-ip%E6%A0%B8)


### 建立异步RAM工程

1. 使用Vivado新建一个工程。
2. 点击“Add Sources”，选择添加设计源码（design sources），加入distributed_ram_top.v。
3. 点击“Add Sources”，选择添加约束文件（constraints），加入ram.xdc。
4. 点击“Add Sources”，选择添加仿真源码（simulation sources），加入ram_tb.v。
5. 调用Xilinx库IP生成异步RAM（Distributed RAM，深度为65536，宽度为32

!!! tips "定制异步RAM IP核"
    若不会生成异步RAM IP核，请访问：[定制异步RAM IP核](https://bookdown.org/loongson/_book3/appendix-vivado-advanced-usage.html#%E5%AE%9A%E5%88%B6%E5%BC%82%E6%AD%A5ram-ip%E6%A0%B8)

在完成工程的创建后，对它们进行仿真，对比读写行为的异同。在完成工程的仿真后，对它们进行综合和实现，查看时序结果和资源利用率，并结合读写时序进行分析。

!!! tips "查看时序结果和资源利用率"
    若查看时序结果和资源利用率，请访问：[查看时序结果和资源利用率](https://bookdown.org/loongson/_book3/appendix-vivado-advanced-usage.html#%E6%9F%A5%E7%9C%8B%E6%97%B6%E5%BA%8F%E7%BB%93%E6%9E%9C%E5%92%8C%E8%B5%84%E6%BA%90%E5%88%A9%E7%94%A8%E7%8E%87)

在实践过程中，应特别注意以下几点：

- 生成IP时，请将对应IP命名为block_ram和distributed_ram，如命名错误，IP将会报错。若遇到已生成IP无法改名的情况，可以删除该IP，重新生成。
- 生成IP时，可以点击窗口左侧的图查看接口信息。当参数正确时，端口名和宽度应与指定的顶层文件中的调用相对应。
- 有兴趣的读者可以自行调研、参考同步/异步RAM定制的资料，并根据仿真波形对比参数的作用。
- 对程序进行综合之前请确保已正确加载约束文件（ram.xdc）。
- 添加testbench时请注意选择add simulation source，否则会导致顶层文件错误，综合结果不正确。
- 对程序进行综合时，所用的计算机不同，综合时间会有一定的差异，有可能会耗费大量时间，所以应提前计划，安排好时间。
- 时序报告和资源报告的生成需要查看综合、实现完成后的结果。

## 验收标准

- [ ] 仿真结合波形观察同步RAM和异步RAM的读写时序
- [ ] 比较同步RAM和异步RAM的时序结果和资源利用率
