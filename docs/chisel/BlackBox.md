# BlackBox：对接已有的 Verilog 模块

前面几章都在用 Chisel 从零描述硬件。但有两类东西不适合重写：

- 已经写好并在 Vivado 里验证过的 Verilog 模块，例如本课程实验 17 的 `tlb.v`、实验 20 的 `cache.v`；
- 厂商提供的 IP 核，或实验 1~4 里用 Vivado 定制出来的 RAM。

BlackBox 把这些模块**原样**接进 Chisel 的模块层次：Chisel 不翻译、也不检查它内部的逻辑，只按你声明的端口生成一句例化。

!!! warning "BlackBox 不是翻译器"
    BlackBox 的内部对 Chisel 完全不可见。你声明的端口就是全部信息——端口对不上，Chisel 不会替你想办法，只会在生成 Verilog 或综合时报错。

## 什么时候需要 BlackBox

先划清它和"用 Chisel 重写"的边界：

| 场景 | 做法 |
| ---- | ---- |
| 逻辑不复杂，还要用 Chisel 的组合/时序设施继续加工 | 直接用 Chisel 写 |
| 已有固定接口的 Verilog 模块，接口不能改 | **BlackBox** |
| 厂商 IP（RAM、PLL、AXI 互连等） | **BlackBox** |
| 想把 Chisel 模块交给 Verilog 用 | 不需要 BlackBox，正常生成即可 |

关键在"**接口固定**"四个字。实验 17 的 `tlb.v` 和实验 20 的 `cache.v` 都要求模块名、端口名、位宽按原书定义逐一命名（两页的"实验内容"里都写死了这一点），这种情况下用 BlackBox 封装是唯一选择。

## 最小例子

先看一个 Verilog 模块：

```verilog
module mul_unsigned #(
    parameter WIDTH = 32
) (
    input                    clk,
    input                    resetn,
    input                    start,
    input      [WIDTH-1:0]   a,
    input      [WIDTH-1:0]   b,
    output reg               done,
    output reg [2*WIDTH-1:0] product
);
    // ... 多周期乘法器实现 ...
endmodule
```

在 Chisel 里为它写一个 BlackBox：

```scala
import chisel3._
import chisel3.util.HasBlackBoxPath

class MulUnsigned(width: Int = 32)
    extends BlackBox(Map("WIDTH" -> width))
    with HasBlackBoxPath {

  override def desiredName: String = "mul_unsigned"

  val io = IO(new Bundle {
    val clk     = Input(Clock())
    val resetn  = Input(Bool())
    val start   = Input(Bool())
    val a       = Input(UInt(width.W))
    val b       = Input(UInt(width.W))
    val done    = Output(Bool())
    val product = Output(UInt((2 * width).W))
  })

  addPath("src/main/scala/blackbox/mul_unsigned.v")
}
```

逐项对照：

| Chisel 里的写法 | 对应 Verilog 的什么 | 要求 |
| --- | --- | --- |
| `desiredName` | `module` 的名字 | **必须逐字一致** |
| `val clk = Input(Clock())` | `input clk` | 名字、方向逐字一致 |
| `val resetn = Input(Bool())` | `input resetn` | 同上 |
| `UInt(width.W)` | `[WIDTH-1:0]` | 位宽一致 |
| `Map("WIDTH" -> width)` | `parameter WIDTH` | 参数名逐字一致 |
| `addPath(...)` | —— | 告诉 Chisel 源文件在哪 |

!!! note "`Map(...)` 里的值是生成阶段的值"
    `Map` 的值只能是 Scala 的 `Int`、`String`，不能是 Chisel 的 `UInt`。这和 `log2Ceil` 一样，必须在**生成电路时**就确定下来。

!!! warning "端口名照抄，不要"整理""
    Verilog 端口叫 `clk` 就写 `clk`，叫 `resetn` 就写 `resetn`。本课程约定 Verilog 侧统一使用 `clk` / `resetn` 命名，正好与 Chisel 的隐式 `clock` / `reset` 区分开。

## 时钟和复位要自己接

BlackBox **不会**被自动插入时钟复位——声明了什么端口，就得自己连什么：

```scala
val mul = Module(new MulUnsigned(32))

mul.io.clk    := clock
mul.io.resetn := !reset.asBool    // Chisel 的 reset 是高有效，resetn 是低有效

mul.io.start := start
mul.io.a     := operandA
mul.io.b     := operandB
```

`reset.asBool` 把 Chisel 的 `Reset` 转成 `Bool`；因为 Verilog 侧是低有效，所以再取反。

!!! warning "复位极性"
    接反了不会报错，但复位永远不生效，仿真波形里会出现大面积的 `x`。看到 `x` 先查这一条。

!!! tip "为什么要显式连，而不是靠工具自动接"
    端口如果命名为 `clock` / `reset`，容易与 Chisel 的隐式时钟复位混在一起；而 Verilog 侧的名又常常是 `clk` / `resetn`。**统一按 Verilog 的实际端口名声明、再显式连接**，两边都不产生歧义，也省去记规则的成本。

## 端口是扁平的：用 FlatIO

Verilog 的端口是一个扁平列表。如果按 Chisel 的习惯写成嵌套 Bundle：

```scala
// 不推荐：嵌套 Bundle 会生成带下划线拼接的端口名
val io = IO(new Bundle {
  val s0 = new Bundle {              // 会生成 s0_vppn、s0_asid 这样的名字
    val vppn = Input(UInt(19.W))
    val asid = Input(UInt(10.W))
  }
})
```

拼出来的名字**恰好**可能对上 Verilog 的命名，也可能对不上——取决于字段名怎么拼。端口一多（`tlb.v`、`cache.v` 都是几十个端口），这种"碰运气"很容易出错。

更稳妥的是用 `FlatIO`：它不给端口名加任何前缀，名字完全由你写死。

```scala
class TlbBlackBox extends BlackBox with HasBlackBoxPath {
  override def desiredName: String = "tlb"

  val io = FlatIO(new Bundle {
    val clk    = Input(Clock())
    val resetn = Input(Bool())

    // 查找端口 0（取指）
    val s0_vppn_en  = Input(Bool())
    val s0_vppn     = Input(UInt(19.W))
    val s0_va_bit12 = Input(Bool())
    val s0_asid     = Input(UInt(10.W))
    val s0_found    = Output(Bool())
    val s0_index    = Output(UInt(4.W))
    val s0_ppn      = Output(UInt(20.W))
    // ... 其余端口照抄 tlb.v 逐一写平 ...
  })

  addPath("src/main/scala/blackbox/tlb.v")
}
```

## 把源文件交给 Chisel

上面的 `addPath` 要配合 `HasBlackBoxPath` 使用，路径**相对于 Chisel 工程根目录**：

```scala
class AxiBridgeBlackBox extends BlackBox with HasBlackBoxPath {
  override def desiredName: String = "axi_bridge"
  val io = FlatIO(new Bundle { /* ... */ })

  addPath("src/main/scala/blackbox/axi_bridge.v")
  addPath("src/main/scala/blackbox/definition.vh")   // 被 include 的头文件也要加
}
```

另一种方式是把文件放在 `src/main/resources/` 下，用 `HasBlackBoxResource` + `addResource`：

```scala
import chisel3.util.HasBlackBoxResource

class TlbBlackBox extends BlackBox with HasBlackBoxResource {
  override def desiredName: String = "tlb"
  val io = FlatIO(new Bundle { /* ... */ })

  addResource("tlb.v")        // 对应 src/main/resources/tlb.v
}
```

两种方式的区别只在文件放在哪、路径以谁为基准：

| 方式 | 文件放哪 | 路径基准 |
| ---- | ---- | ---- |
| `HasBlackBoxPath` + `addPath` | 源码树里任意位置 | **工程根目录** |
| `HasBlackBoxResource` + `addResource` | `src/main/resources/` 下 | **resources 根目录** |

!!! warning "被 `include` 的文件别忘了加"
    如果 `axi_bridge.v` 里有 `include "definition.vh"`，那 `definition.vh` 也必须一起 `addPath`。工具会把收集到的文件放到同一目录，`include` 才找得到。漏掉时表现为编译 Verilog 时报宏定义未找到。

!!! tip "报找不到文件时"
    `addPath` 的相对路径以 Chisel 认定的工程根目录为基准。若报找不到文件，可在编译选项里显式指定：
    ```
    -Dchisel.project.root=/你的/工程/根目录
    ```

## BlackBox 之外，还要写胶水逻辑

BlackBox 只做**端口对齐**，不产生任何时序或协议逻辑。把 `tlb.v` 接进流水线，中间通常还要自己补一批东西：

```scala
class TlbAdapter extends Module {
  val io = IO(new Bundle {
    val req  = Flipped(Decoupled(new TlbReq))
    val resp = Decoupled(new TlbResp)
  })

  val tlb = Module(new TlbBlackBox)
  tlb.io.clk    := clock
  tlb.io.resetn := !reset.asBool

  // 请求要打拍、要排队，返回还要按顺序配回原请求 ——
  // 这些逻辑都不在 BlackBox 里，得自己写
  val reqQueue = Module(new Queue(new TlbReq, 4))
  // ...
}
```

常见需要自己补的几件事：

- **时钟复位**：见上一节；
- **请求/响应的寄存与排队**：BlackBox 内部往往要几拍才返回，而 Chisel 侧的组合逻辑是当拍算的；
- **协议转换**：Verilog 侧可能是脉冲握手，Chisel 侧习惯用 `Decoupled`；
- **暂时不用的端口**：要显式接 `0.U` / `false.B`，不能悬空。

!!! tip "先单独验证 Verilog，再 BlackBox 集成"
    这正是本课程实验 17 与实验 20 的安排：先在模块级验证环境（`module_verify/tlb_verify/`、`module_verify/cache_verify/`）里用 Vivado 把 Verilog 模块单独跑通，确认端口语义无误；实验 18、21 再用 BlackBox 集成进 CPU。

    如果一上来就集成，端口名写错、复位极性接反、握手理解偏差这三类问题会混在一起，很难定位。

## 常见报错与排查

| 现象 | 常见原因 |
| ---- | ---- |
| 编译 Verilog 时报未知模块 | `desiredName` 与 `module` 名不一致；或源文件没用 `addPath` / `addResource` 加进来 |
| 例化时报端口不存在 | Chisel 里的端口名与 Verilog 不一致（大小写、少写 `_i` / `_o` 后缀） |
| 能编译，但功能全错 | 位宽不一致导致隐式截断；或方向写反 |
| 仿真大面积 `x` | 时钟没接、复位极性反了、或某个输入端口悬空 |
| 宏/参数未定义 | 被 `include` 的头文件漏加；或 `Map(...)` 的参数名与 Verilog `parameter` 名不一致 |

!!! warning "位宽不符不会报错"
    把 Verilog 的 `[31:0]` 声明成 `UInt(16.W)`，Verilog 编译照样通过，但高位被直接丢掉。这类错误只体现在功能上，要对着波形排查。

    封装 `tlb.v`、`cache.v` 这种几十个端口的模块时，请**照抄实验 17、实验 20 接口表里的位宽**，不要凭印象写。

## 什么时候不该用 BlackBox

BlackBox 内部对 Chisel 不可见，代价是：

- 跨模块优化做不了——常量传播、无用逻辑消除都不会进到 BlackBox 内部；
- 端口名写错、位宽写错，Chisel **不检查**，要到生成 Verilog 或综合时才暴露；
- 综合工具看不到内部结构，时序要自己保证。

所以能用 Chisel 直接写清楚的逻辑，就直接写。只有"**接口已固定、且已经验证过的 Verilog**"才值得包一层。本课程的 `tlb.v`、`cache.v` 属于这种情况（实验讲义要求端口按原书定义命名）；实验 1~4 里自己写的寄存器堆、RAM 如果要在 Chisel 里复用，也同样适合。

## 本节小结

- BlackBox 把已有的 Verilog 模块原样接进 Chisel：Chisel 不翻译、不检查它的内部逻辑。
- `desiredName`、端口名、端口方向、位宽、参数名都必须与 Verilog **逐字一致**。
- 时钟复位不会被自动插入，要显式声明、显式连接，并注意 `resetn` 的极性。
- 端口是扁平的，用 `FlatIO` 避免意外的名字前缀。
- 引入源文件有两种方式：`HasBlackBoxPath` + `addPath`（相对工程根目录）、`HasBlackBoxResource` + `addResource`（放 `src/main/resources/`）；被 `include` 的头文件也要一起加。
- BlackBox 只对齐端口，排队、协议转换、常量连接这些胶水逻辑仍要自己写。
- 先用模块级验证环境把 Verilog 跑通，再用 BlackBox 集成。
