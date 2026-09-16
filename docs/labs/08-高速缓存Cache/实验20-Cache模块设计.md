# 实验20：Cache模块设计

!!! info "原书参考"

    [《CPU设计实战：LoongArch版》10.1 Cache模块的设计 / 10.2.1 实践任务20：Cache模块设计](https://bookdown.org/loongson/_book3/chapter-cache-design.html#subsec-exp20)

## 实验目标

- 设计并实现独立的 Cache 模块，完成模块级验证。

## 环境介绍

!!! warning

    本实验的验证环境与SoC环境不同，是**针对Cache模块的单独验证环境**，位于 `mycpu_env/module_verify/cache_verify/` 目录下，**不使用 func 测试**。

```
|--module_verify/            模块级验证环境
   |--cache_verify/          Cache模块级验证环境。
      |--rtl/                包含Cache模块以及验证顶层的设计源码。
      |  |--cache_top.v      Cache模块级验证的顶层文件。
      |--testbench/          功能仿真验证源码。
      |  |--testbench.v      仿真顶层。
      |--run_vivado/         Vivado工程的运行目录。
         |--constraints/     Vivado工程的设计约束。
         |--cache_prj/       Vivado工程文件所在目录。
```

## 实验内容

本实践任务的要求如下：

- 设计Cache模块，RTL文件记为 **`cache.v`**，模块名必须命名为 **`cache`**。除时钟输入 clk 和低电平有效复位输入 resetn 以外，输入/输出端口参考原书 10.1 节表 10.2（与CPU流水线的类SRAM交互）和表 10.3（与AXI总线接口模块的读写交互）中的定义。
- 设计规格要求：**2路组相联，每路大小4KB，Cache行16字节，LRU或伪随机替换算法，推荐硬件初始化**。
- 利用Cache模块级验证环境对所设计的Cache进行验证，通过仿真和上板验证。

!!! tip "设计要点"

    - 地址划分：虚地址 `[11:4]` 作 Index（8位），物理地址 `[31:12]` 作 Tag（20位），行内偏移 4 位——即"**虚Index实Tag**"（VIPT）访问方式；
    - Cache RAM 需要**自行定制**：TAGV RAM 256×21 共 2 块；DATA Bank RAM 256×32 共 8 块（需开启**字节写使能**；定制时**不要勾选** "Primitives Output Register"，保证单周期返回）；
    - 内部组织为 4 类访问：**Look Up、Hit Write、Replace、Refill**，配合主状态机（IDLE/LOOKUP/MISS/REPLACE/REFILL）与写缓冲状态机管理；
    - 数据Cache采用**写回+写分配**策略；替换出脏行时先经 AXI 写回内存再填入新行。

## 实验步骤

1. 完成Cache模块的设计和RTL编写，记为`cache.v`，将`cache.v`文件放入`mycpu_env/myCPU/` 目录下。
2. 进入 `mycpu_env/module_verify/cache_verify/run_vivado/cache_prj/` 目录下启动验证cache的工程。如果该目录下尚未创建工程，请利用该目录下的 `create_project.tcl` 文件创建工程。
3. 在验证Cache模块的工程中运行仿真（进入仿真界面后，直接点击run all），进行功能验证与调试，直至仿真测试通过。
4. 在验证Cache模块的工程中综合实现后生成bit流文件，进行上板验证。

## 验收标准

- [ ] Cache模块级仿真PASS。

??? tips "仿真验证结果判断"
    模块级验证会从index=0的时候开始验证，针对每个index，生成四组随机的tag和data对。首先生成写请求将这四组数写进cache，然后再生成读请求读它们。如果中间没有发生错误，index递增，重新生成tag和data对进行相同的测试，直到index==ff的测试完成为止。

    对于写cache请求。验证环境期望看到的结果是，写请求发出后会出现Cache miss，Cache模块会发出rd请求，验证环境返回全1值（0xFFFFFFFF）。写请求可能会引发替换操作，这时验证环境会拿wr_addr和wr_data和前述的tag/data组合做对比，如果replace的值有错，测试会中止。

    写操作全部进行完之后会有读操作，验证环境会做同样的检测。当cache返回读操作的结果之后，验证环境会检测读到的结果与之前写入的结果是否相同。

    在仿真时，会对每一个index生成四个cache行的先写再读的操作，所有操作都完成后会打印PASS，如下所示：
```
    [   2705 ns] index 00 finishd
    …………
    =========================================================
    Test end!
    ----PASS!!!
```
    如果在仿真中发现错误，请进行调试，控制台会打印出错误的原因。验证环境只会检查替换时的数据错误和Cache read的数据错误。
    

??? tips "上板验证结果判断"

    上板运行时，数码管的**左边两位显示当前测试的 index 值**，逐步递增至 0xff 后测试停止。

!!! tip "硬件初始化"

    由于 CACOP 指令在实验二十三才实现，本阶段的 Cache 初始化需要硬件手段：可在定制 TAGV RAM 时勾选 "Fill Remaining Memory Locations" 并置初始值为 0（V=0 即全无效），D 表用寄存器实现直接复位清零。
