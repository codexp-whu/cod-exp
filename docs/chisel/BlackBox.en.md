# BlackBox: Wrapping an Existing Verilog Module

The previous chapters all describe hardware from scratch in Chisel. But there are two kinds of things you should not rewrite:

- Verilog modules that are already written and verified in Vivado, such as `tlb.v` from Lab 17 and `cache.v` from Lab 20 of this course;
- Vendor-supplied IP cores, or the RAMs you customized with Vivado in Labs 1–4.

A BlackBox plugs these modules into the Chisel module hierarchy **as they are**: Chisel neither translates nor checks their internal logic — it simply emits one instantiation based on the ports you declare.

!!! warning "A BlackBox is not a translator"
    The inside of a BlackBox is completely invisible to Chisel. The ports you declare are the whole story — if they do not line up, Chisel will not find a way around it; it will simply fail when generating Verilog or during synthesis.

## When You Need a BlackBox

First, draw the line between a BlackBox and rewriting in Chisel:

| Situation | Approach |
| ---- | ---- |
| The logic is not complex, and you want to keep working on it with Chisel's combinational/sequential facilities | Write it directly in Chisel |
| An existing Verilog module with a fixed interface that cannot be changed | **BlackBox** |
| Vendor IP (RAM, PLL, AXI interconnect, and so on) | **BlackBox** |
| You want to hand a Chisel module to Verilog | No BlackBox needed — just generate it normally |

The key phrase is "**fixed interface**". Lab 17's `tlb.v` and Lab 20's `cache.v` both require the module name, port names, and bit widths to be named exactly as defined in the book (both pages state this outright under "Tasks"), and in that situation wrapping them in a BlackBox is the only option.

## A Minimal Example

Start with a Verilog module:

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

Now write a BlackBox for it in Chisel:

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

Item by item:

| What you write in Chisel | What it corresponds to in Verilog | Requirement |
| --- | --- | --- |
| `desiredName` | the name of the `module` | **must match exactly, character for character** |
| `val clk = Input(Clock())` | `input clk` | name and direction match exactly |
| `val resetn = Input(Bool())` | `input resetn` | as above |
| `UInt(width.W)` | `[WIDTH-1:0]` | bit width matches |
| `Map("WIDTH" -> width)` | `parameter WIDTH` | parameter name matches exactly |
| `addPath(...)` | —— | tells Chisel where the source file is |

!!! note "Values in `Map(...)` are elaboration-time values"
    The values in a `Map` can only be Scala `Int`s or `String`s, never a Chisel `UInt`. Like `log2Ceil`, they have to be settled **when the circuit is generated**.

!!! warning "Copy port names verbatim, do not 'tidy them up'"
    If the Verilog port is called `clk`, write `clk`; if it is called `resetn`, write `resetn`. This course standardizes on `clk` / `resetn` on the Verilog side, which conveniently keeps it distinct from Chisel's implicit `clock` / `reset`.

## You Must Wire Up the Clock and Reset Yourself

A BlackBox does **not** get its clock and reset inserted automatically — whatever ports you declare, you connect them yourself:

```scala
val mul = Module(new MulUnsigned(32))

mul.io.clk    := clock
mul.io.resetn := !reset.asBool    // Chisel 的 reset 是高有效，resetn 是低有效

mul.io.start := start
mul.io.a     := operandA
mul.io.b     := operandB
```

`reset.asBool` converts Chisel's `Reset` into a `Bool`; since the Verilog side is active-low, the result is then inverted.

!!! warning "Reset polarity"
    Wiring it the wrong way round raises no error, but the reset never takes effect and large stretches of `x` will appear in the simulation waveform. If you see `x`, check this first.

!!! tip "Why connect explicitly instead of relying on the tool"
    If you name the ports `clock` / `reset` they are easily confused with Chisel's implicit clock and reset, while the names on the Verilog side are usually `clk` / `resetn`. **Declare exactly the real Verilog port names and then connect them explicitly** — neither side is ambiguous, and you save yourself the cost of remembering the rules.

## Ports Are Flat: Use FlatIO

A Verilog port list is flat. If you follow Chisel convention and write a nested Bundle:

```scala
// 不推荐：嵌套 Bundle 会生成带下划线拼接的端口名
val io = IO(new Bundle {
  val s0 = new Bundle {              // 会生成 s0_vppn、s0_asid 这样的名字
    val vppn = Input(UInt(19.W))
    val asid = Input(UInt(10.W))
  }
})
```

The names it produces may **just happen** to match the Verilog naming, or they may not — it depends on how the field names are joined. Once there are many ports (`tlb.v` and `cache.v` both have dozens), this gamble goes wrong easily.

`FlatIO` is the safer choice: it adds no prefix to port names, so the names are exactly what you write.

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

## Handing the Source File to Chisel

The `addPath` above goes together with `HasBlackBoxPath`, and the path is **relative to the Chisel project root**:

```scala
class AxiBridgeBlackBox extends BlackBox with HasBlackBoxPath {
  override def desiredName: String = "axi_bridge"
  val io = FlatIO(new Bundle { /* ... */ })

  addPath("src/main/scala/blackbox/axi_bridge.v")
  addPath("src/main/scala/blackbox/definition.vh")   // 被 include 的头文件也要加
}
```

The other option is to put the file under `src/main/resources/` and use `HasBlackBoxResource` + `addResource`:

```scala
import chisel3.util.HasBlackBoxResource

class TlbBlackBox extends BlackBox with HasBlackBoxResource {
  override def desiredName: String = "tlb"
  val io = FlatIO(new Bundle { /* ... */ })

  addResource("tlb.v")        // 对应 src/main/resources/tlb.v
}
```

The two approaches differ only in where the file lives and what the path is relative to:

| Approach | Where the file lives | Path relative to |
| ---- | ---- | ---- |
| `HasBlackBoxPath` + `addPath` | anywhere in the source tree | **the project root** |
| `HasBlackBoxResource` + `addResource` | under `src/main/resources/` | **the resources root** |

!!! warning "Do not forget files that are `include`d"
    If `axi_bridge.v` contains `include "definition.vh"`, then `definition.vh` must be passed to `addPath` as well. The tool puts the files it collects into the same directory, which is how the `include` finds it. If you leave it out, the symptom is an undefined macro when the Verilog is compiled.

!!! tip "If it reports that a file cannot be found"
    The relative path in `addPath` is resolved against the project root as Chisel sees it. If it reports that the file cannot be found, specify it explicitly in the compilation options:
    ```
    -Dchisel.project.root=/你的/工程/根目录
    ```

## Beyond the BlackBox: You Still Need Glue Logic

A BlackBox only **lines up ports**; it produces no timing or protocol logic. Wiring `tlb.v` into the pipeline usually means writing a batch of extra logic in between:

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

The things you commonly have to add yourself:

- **Clock and reset**: see the previous section;
- **Registering and queueing requests/responses**: the BlackBox often takes several cycles to respond, whereas the combinational logic on the Chisel side is computed in the same cycle;
- **Protocol conversion**: the Verilog side may use a pulse handshake, while the Chisel side is used to `Decoupled`;
- **Ports you are not using yet**: connect them explicitly to `0.U` / `false.B` — they must not be left dangling.

!!! tip "Verify the Verilog on its own first, then integrate it with a BlackBox"
    This is exactly how Labs 17 and 20 of this course are arranged: first get the Verilog module passing on its own in the module-level verification environment (`module_verify/tlb_verify/`, `module_verify/cache_verify/`) under Vivado, confirming that the port semantics are right; then, in Labs 18 and 21, integrate it into the CPU with a BlackBox.

    If you integrate straight away, three classes of problem — a mistyped port name, reversed reset polarity, and a misreading of the handshake — all get mixed together and are very hard to pin down.

## Common Errors and How to Track Them Down

| Symptom | Usual cause |
| ---- | ---- |
| Unknown module when compiling the Verilog | `desiredName` does not match the `module` name; or the source file was never brought in with `addPath` / `addResource` |
| "Port does not exist" at instantiation | the port name in Chisel does not match Verilog (letter case, or a missing `_i` / `_o` suffix) |
| It compiles, but the function is completely wrong | a bit-width mismatch causing implicit truncation; or a direction written the wrong way round |
| Large amounts of `x` in simulation | the clock is not connected, the reset polarity is reversed, or an input port is left dangling |
| Macro/parameter undefined | an `include`d header was not added; or a `Map(...)` parameter name does not match the Verilog `parameter` name |

!!! warning "A bit-width mismatch raises no error"
    Declare a Verilog `[31:0]` as `UInt(16.W)` and the Verilog still compiles, but the upper bits are simply thrown away. Errors like this show up only in behavior, so you have to debug them against the waveform.

    When wrapping a module with dozens of ports such as `tlb.v` or `cache.v`, **copy the bit widths straight from the interface tables in Labs 17 and 20** — do not write them from memory.

## When Not to Use a BlackBox

The inside of a BlackBox is invisible to Chisel, and the price is:

- No cross-module optimization — constant propagation and dead-logic elimination never reach inside the BlackBox;
- A mistyped port name or bit width is **not checked** by Chisel; it surfaces only when Verilog is generated or at synthesis time;
- The synthesis tool cannot see the internal structure, so timing is your responsibility.

So if the logic can be written clearly in Chisel, write it in Chisel. Only **Verilog with a fixed interface that has already been verified** is worth wrapping. This course's `tlb.v` and `cache.v` fall into that category (the lab notes require the ports to be named as defined in the book); the register file and RAM you wrote yourself in Labs 1–4 are equally good candidates if you want to reuse them from Chisel.

## Summary

- A BlackBox plugs an existing Verilog module into Chisel as it is: Chisel neither translates nor checks its internal logic.
- `desiredName`, the port names, the port directions, the bit widths, and the parameter names must all **match the Verilog exactly**.
- The clock and reset are not inserted automatically: declare them explicitly, connect them explicitly, and mind the polarity of `resetn`.
- Ports are flat — use `FlatIO` to avoid unexpected name prefixes.
- There are two ways to bring in the source file: `HasBlackBoxPath` + `addPath` (relative to the project root) and `HasBlackBoxResource` + `addResource` (file under `src/main/resources/`); `include`d headers must be added too.
- A BlackBox only lines up ports; queueing, protocol conversion, and constant connections are glue logic you still have to write yourself.
- Get the Verilog passing in the module-level verification environment first, then integrate it with a BlackBox.
