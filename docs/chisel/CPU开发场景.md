
前面两节的基础语法涵盖了 Chisel 的所有常用语法，已经足够支撑你完成一个五级流水线CPU的设计了。下面按照**你在开发五级流水线 CPU 时会实际遇到的问题**，将语法点重新组织为十个开发场景。你可以将这一节作为速查手册，边写边翻。

## 程序计数器（PC）

```scala
val pc = RegInit("h80000000".U(32.W))  // 复位后从 0x80000000 开始取指
pc := nextPC                            // 下一个周期更新
```

用到：`RegInit`、字面量、`:=`

## 指令存储器（取指）

```scala
class IMem extends Module {
    val io = IO(new Bundle {
        val addr = Input(UInt(32.W))
        val inst = Output(UInt(32.W))
    })
    val mem = SyncReadMem(4096, UInt(32.W))
    io.inst := mem.read(io.addr >> 2)
}
```

用到：`Module`、`IO`、`Bundle`、`Input`/`Output`、`SyncReadMem`

## 译码器（指令识别 + 控制信号生成）

译码有两种组织方式：

**方式 A（简单）：每个控制信号一个 MuxLookup**——信号少时够用。

```scala
val regWrite = MuxLookup(opcode, false.B)(Seq(
    OPC_R  -> true.B,
    OPC_I  -> true.B,
    OPC_LW -> true.B
))
```

**方式 B（推荐）：先识别指令类型，再查表生成控制信号。**

```scala
// 第一步：opcode + funct3 + funct7 —— 指令枚举
val instType = MuxCase(INST_ILLEGAL, Seq(
    (opcode === OPC_R  && funct3 === F3_ADD && funct7 === F7_NORMAL) -> INST_ADD,
    (opcode === OPC_R  && funct3 === F3_ADD && funct7 === F7_ALT)    -> INST_SUB,
    (opcode === OPC_I  && funct3 === F3_ADDI)                        -> INST_ADDI,
    (opcode === OPC_LW)                                               -> INST_LW,
    (opcode === OPC_SW)                                               -> INST_SW,
    (opcode === OPC_B  && funct3 === F3_BEQ)                         -> INST_BEQ,
    (opcode === OPC_JAL)                                              -> INST_JAL
))

// 第二步：instType —— 各控制信号
val regWrite = MuxLookup(instType, false.B)(Seq(
    INST_ADD  -> true.B,
    INST_SUB  -> true.B,
    INST_ADDI -> true.B,
    INST_LW   -> true.B,
    INST_JAL  -> true.B
))

val aluOp = MuxLookup(instType, ALU_NOP)(Seq(
    INST_ADD  -> ALU_ADD,
    INST_SUB  -> ALU_SUB,
    INST_ADDI -> ALU_ADD,
    INST_BEQ  -> ALU_SUB
))
```

!!! tip "两种方式的选择"
    五级流水线 CPU 约 40 条指令，**推荐方式 B**。它把"指令识别"和"控制信号生成"解耦：
    - 新增指令 —— 在 `MuxCase` 中加一行条件 + 在各 `MuxLookup` 中加一行输出
    - 修改某条指令的控制信号 —— 只需改对应 `MuxLookup` 的那一行
    
    方式 A 每新增一条指令都需逐个信号修改，容易在某个信号处遗漏。

用到：`MuxCase`（指令识别）+ `MuxLookup`（控制信号生成）、`===`、`&&`、`Bool`

## 立即数生成器

```scala
val imm = MuxLookup(instType, 0.U(32.W))(Seq(
    INST_I -> Cat(Fill(20, inst(31)), inst(31, 20)).asUInt,
    INST_S -> Cat(Fill(20, inst(31)), inst(31, 25), inst(11, 7)).asUInt,
    INST_B -> Cat(Fill(19, inst(31)), inst(31), inst(7), inst(30, 25), inst(11, 8), 0.U(1.W)).asUInt,
    INST_U -> Cat(inst(31, 12), Fill(12, 0.U)).asUInt,
    INST_J -> Cat(Fill(11, inst(31)), inst(31), inst(19, 12), inst(20), inst(30, 21), 0.U(1.W)).asUInt
))
```

用到：`MuxLookup`、`Cat`、`Fill`、`asUInt`、位提取 `inst(x, y)`

## ALU

```scala
val aluResult = MuxLookup(aluOp, 0.U(32.W))(Seq(
    ALU_ADD  -> (a + b),
    ALU_SUB  -> (a - b),
    ALU_AND  -> (a & b),
    ALU_OR   -> (a | b),
    ALU_XOR  -> (a ^ b),
    ALU_SLT  -> Mux(a.asSInt < b.asSInt, 1.U, 0.U),
    ALU_SLTU -> Mux(a < b, 1.U, 0.U),
    ALU_SLL  -> (a << b(4, 0)),
    ALU_SRL  -> (a >> b(4, 0)),
    ALU_SRA  -> (a.asSInt >> b(4, 0)).asUInt
))
```

用到：`MuxLookup`、算术/位运算、`asSInt` / `asUInt`、`Mux`

## 数据存储器（load / store 扩展）

```scala
class DMem extends Module {
    val io = IO(new Bundle {
        val addr   = Input(UInt(32.W))
        val wdata  = Input(UInt(32.W))
        val wen    = Input(Bool())
        val memExt = Input(UInt(3.W))       // lb / lh / lw / lbu / lhu
        val rdata  = Output(UInt(32.W))
    })
    val mem = SyncReadMem(4096, UInt(32.W))

    when(io.wen) { mem.write(io.addr >> 2, io.wdata) }
    val rawData = mem.read(io.addr >> 2)

    // 字节/半字扩展
    io.rdata := MuxLookup(io.memExt, rawData)(Seq(
        MEM_LB  -> Cat(Fill(24, rawData(7)),  rawData(7, 0)),
        MEM_LBU -> Cat(0.U(24.W),             rawData(7, 0)),
        MEM_LH  -> Cat(Fill(16, rawData(15)), rawData(15, 0)),
        MEM_LHU -> Cat(0.U(16.W),             rawData(15, 0)),
        MEM_LW  -> rawData
    ))
}
```

用到：`Module`、`SyncReadMem`、`when`、`MuxLookup`、`Cat`、`Fill`

## 流水线寄存器——五级流水线的骨架

这是整个 CPU 最核心的结构。四级流水线寄存器（IF——ID, ID——EX, EX——MEM, MEM——WB）统一定义为 Bundle：

```scala
// === 定义各级 Bundle ===
class IF2ID extends Bundle {
    val pc   = UInt(32.W)
    val inst = UInt(32.W)
}

class ID2EX extends Bundle {
    val pc       = UInt(32.W)
    val rs1Data  = UInt(32.W)
    val rs2Data  = UInt(32.W)
    val imm      = UInt(32.W)
    val rd       = UInt(5.W)
    val aluOp    = UInt(4.W)
    val regWrite = Bool()
    val memRead  = Bool()
    val memWrite = Bool()
    val memExt   = UInt(3.W)
    val rs1      = UInt(5.W)   // 保留 rs1/rs2 编号用于转发判断
    val rs2      = UInt(5.W)
}

class EX2MEM extends Bundle {
    val pcNext    = UInt(32.W)
    val aluResult = UInt(32.W)
    val storeData = UInt(32.W)
    val rd        = UInt(5.W)
    val regWrite  = Bool()
    val memRead   = Bool()
    val memWrite  = Bool()
    val memExt    = UInt(3.W)
}

class MEM2WB extends Bundle {
    val aluResult = UInt(32.W)
    val memData   = UInt(32.W)
    val rd        = UInt(5.W)
    val regWrite  = Bool()
}
```

```scala
// === 在顶层模块中实例化 ===
val if2id_wire  = Wire(new IF2ID)
val if2id_reg   = RegInit(0.U.asTypeOf(new IF2ID))

val id2ex_wire  = Wire(new ID2EX)
val id2ex_reg   = RegInit(0.U.asTypeOf(new ID2EX))

val ex2mem_wire = Wire(new EX2MEM)
val ex2mem_reg  = RegInit(0.U.asTypeOf(new EX2MEM))

val mem2wb_wire = Wire(new MEM2WB)
val mem2wb_reg  = RegInit(0.U.asTypeOf(new MEM2WB))

// === 流水线推进：wire —— reg ===
if2id_reg  := if2id_wire
id2ex_reg  := id2ex_wire
ex2mem_reg := ex2mem_wire
mem2wb_reg := mem2wb_wire
```

!!! success "从这里感受 Chisel 真正的优势"
    注意 `RegInit(0.U.asTypeOf(new ID2EX))` 这一行——它生成了一个包含 **十几个信号的流水线寄存器组**，推进时只需 `id2ex_reg := id2ex_wire` **一行**。
    
    Verilog 中需要：十几条 `reg` 声明 + 十几条 `always @(posedge clk)` 逐行赋值。
    
    日后需要新增一个传递信号（比如 CSR 异常码），Chisel 只需在 `ID2EX` Bundle 中加一行 `val excCode = UInt(4.W)`——**所有实例化、连线、推进全部自动生效，零遗漏、零连线成本。**

用到：`Bundle`、`Wire`、`RegInit`、`asTypeOf`、`:=`

## 转发单元（Forwarding Unit）

转发逻辑用 `when` 链检测冒险条件，用 `Mux` 选择转发源：

```scala
// 检测：前面指令的目标寄存器 == 当前指令的源寄存器
val forwardA = WireDefault(0.U(2.W))   // 00: 不转发, 01: EX级, 10: MEM级
val forwardB = WireDefault(0.U(2.W))

// 优先级：EX > MEM（最近的指令转发优先）
when(ex2mem_reg.regWrite && ex2mem_reg.rd === id2ex_reg.rs1 && ex2mem_reg.rd =/= 0.U) {
    forwardA := 1.U   // 从 EX/MEM 转发
} .elsewhen(mem2wb_reg.regWrite && mem2wb_reg.rd === id2ex_reg.rs1 && mem2wb_reg.rd =/= 0.U) {
    forwardA := 2.U   // 从 MEM/WB 转发
}
// rs2 同理...

// ALU 输入选择：转发数据 or 寄存器数据
val aluA = Mux(forwardA === 1.U, ex2mem_reg.aluResult,
           Mux(forwardA === 2.U, mem2wb_reg.aluResult,
           id2ex_reg.rs1Data))
val aluB = Mux(forwardB === 1.U, ex2mem_reg.aluResult,
           Mux(forwardB === 2.U, mem2wb_reg.aluResult,
           id2ex_reg.rs2Data))
```

用到：`WireDefault`、`when`/`elsewhen`、`Mux`、`===`、`=/=`

## 冒险检测与流水线控制（Stall & Flush）

```scala
// Load-use 冒险：上一条是 load，目标是当前指令的源寄存器 —— 需暂停
val loadStall = id2ex_reg.memRead &&
    (id2ex_reg.rd === if2id_reg.rs1 || id2ex_reg.rd === if2id_reg.rs2) &&
    (id2ex_reg.rd =/= 0.U)

// 分支预测失败 —— 需冲刷
val branchFlush = branchTaken && (branchTarget =/= predictedPC)

// 流水线控制
when(loadStall) {
    // IF——ID 保持，ID——EX 插入气泡（NOP）
    id2ex_reg := 0.U.asTypeOf(new ID2EX)
} .elsewhen(branchFlush) {
    // 冲刷 IF——ID 和 ID——EX
    if2id_reg := 0.U.asTypeOf(new IF2ID)
    id2ex_reg := 0.U.asTypeOf(new ID2EX)
} .otherwise {
    // 正常推进
    if2id_reg := if2id_wire
    id2ex_reg := id2ex_wire
}
```

!!! tip "插入气泡 = 写入全零 Bundle"
    `0.U.asTypeOf(new ID2EX)` 将 Bundle 的所有字段清零，等效于向流水线中插入一条 **NOP 指令**（regWrite=0, memRead=0, memWrite=0 —— 不产生任何副作用）。

用到：`when`/`elsewhen`/`otherwise`、`asTypeOf`、`&&`、`||`、`=/=`

## 参数化——一处定义，全局使用

```scala
object Config {
    val XLEN      = 32
    val REG_COUNT = 32
    val PC_INIT   = "h80000000"
    val IMEM_SIZE = 4096
    val DMEM_SIZE = 4096
}

// 使用
val a = UInt((Config.XLEN).W)
val rf = RegInit(VecInit(Seq.fill(Config.REG_COUNT)(0.U((Config.XLEN).W))))
val imem = SyncReadMem(Config.IMEM_SIZE, UInt((Config.XLEN).W))
```

之后如果要改为 64 位 CPU，只需把 `XLEN = 32` 改为 `XLEN = 64`，其余代码全部自动适配。

---

## 常见陷阱与排错

### `===` vs `==`

```scala
// 错误：== 比较 Scala 对象引用，不生成硬件，结果恒为 false
when(a == b) { ... }

// 正确
when(a === b) { ... }
```

### 位宽不匹配

Chisel 在编译/仿真时会报错——这是好事，帮你提前发现 Verilog 中会隐式截断的 bug：

```scala
val a = UInt(32.W)
val b = UInt(16.W)
val c = a + b                      // 编译报错：位宽不匹配
val c = a + Cat(Fill(16, 0.U), b)  // 显式扩展
```

### 把 Wire 放进 when 块内赋值

```scala
val x = Wire(UInt(32.W))
when(cond) {
    x := value    // 编译报错：Wire 不能放在 when 内
}

// 修正：
val x = RegInit(0.U(32.W))
when(cond) {
    x := value    // Reg 可以放在 when 内
}
```

**判据**：`when` 块内 `:=` —— 目标必须是 `Reg`；`when` 块外 `:=` —— 目标是 `Wire` 或 `IO`。

### 忘记 x0 硬连线为 0

```scala
// 错误：读 rf(0) 可能读到之前写入的非零值，违反 RISC-V 规范
val rdata1 = rf(rs1)

// 正确
val rdata1 = Mux(rs1 === 0.U, 0.U, rf(rs1))
```

### 用软件思维写硬件

```scala
// 错误：以为 for 循环是"串行累加"
var sum = 0.U
for (i <- 0 until 4) {
    sum = sum + data(i)   // 实际上是组合逻辑展开！
}

// 正确：用 reduce 明确表达树形加法
val sum = data.reduce(_ + _)
```

每次写 `for` / `while` 时，问自己：**展开后是什么电路？**

---

## 小结

| 你需要做的事 | 主要使用的 Chisel 语法 |
|-------------|----------------------|
| 声明信号 | `Wire`（组合）、`RegInit`（时序）、`IO`（端口） |
| 端口和级间打包 | `Bundle`、`Input`、`Output` |
| 纯组合逻辑（ALU、译码、转发 Mux） | `MuxLookup`、`MuxCase`、`Mux`、`===`、`=/=`、`Cat`、`Fill` |
| 时序逻辑（PC、寄存器堆、流水线寄存器） | `RegInit`、`RegNext`、`when` + `:=` |
| 信号阵列（寄存器堆、译码 ROM） | `VecInit`、`RegInit(VecInit(...))`、`Seq.fill` |
| 模块封装 | `class Xxx extends Module`、`IO(new Bundle{...})` |
| 参数化 | Scala `object` 常量 |

从语法层面看，你只需要掌握上面这张表的内容，就能独立写出一颗五级流水线 CPU。Chisel 的学习曲线前陡后缓——一开始要习惯 `===`、`.U`、`.W`、`:=` 这些与 Verilog 不同的写法，但一旦上手，你会发现自己的开发效率**成倍提升**，代码量**大幅减少**，而主要精力得以聚焦在旁路、冒险等真正的架构设计上。

接下来，让我们从一条一条指令开始，搭建属于你的流水线 CPU。