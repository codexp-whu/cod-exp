# CPU 开发场景速查

这一页把前面的语法放回五级流水线 CPU 中。代码是局部示例，重点是连接方式和时序关系，不是一份可以直接提交的完整 Core。

## 先约定存储器时序

下面采用课程中常见的经典五级流水线假设：指令存储器和数据存储器的读数据在本拍返回。CPU 通过外部接口访问存储器，例如：

```scala
val io = IO(new Bundle {
  val imemAddr = Output(UInt(32.W))
  val imemInst = Input(UInt(32.W))

  val dmemAddr  = Output(UInt(32.W))
  val dmemRdata = Input(UInt(32.W))
})
```

如果课程平台提供 ready/valid、SRAM 或 AXI 接口，应以平台接口为准。不要把示例中的存储器直接换成 `SyncReadMem`：同步读会增加一拍，需要同时延迟 PC、目的寄存器和控制信号。

## 程序计数器

PC 是寄存器。正常情况加 4，重定向时跳到目标地址，暂停时保持：

```scala
val pc = RegInit("h80000000".U(32.W))

when(redirect) {
  pc := redirectTarget
}.elsewhen(!stall) {
  pc := pc + 4.U
}
```

分支重定向来自更老的指令，通常应比针对年轻指令的暂停拥有更高优先级。

## 指令字段

```scala
val opcode = inst(6, 0)
val rd     = inst(11, 7)
val funct3 = inst(14, 12)
val rs1    = inst(19, 15)
val rs2    = inst(24, 20)
val funct7 = inst(31, 25)
```

这些表达式都是组合逻辑，不需要先声明 Wire。给表达式起一个 `val` 名字只是方便后面引用。

## 译码器

下面的控制 Bundle 只列出本页会用到的字段：

```scala
class ControlSignals extends Bundle {
  val regWrite = Bool()
  val memRead  = Bool()
  val memWrite = Bool()
  val usesRs1  = Bool()
  val usesRs2  = Bool()
  val aluOp    = UInt(4.W)
  val immType  = UInt(3.W)
  val memSize  = UInt(3.W)
}
```

指令较少时，可以直接写条件：

```scala
val isAdd = opcode === Opc.R &&
  funct3 === "b000".U && funct7 === "b0000000".U

val isSub = opcode === Opc.R &&
  funct3 === "b000".U && funct7 === "b0100000".U
```

控制信号先给安全默认值，再按指令覆盖：

```scala
val ctrl = WireDefault(0.U.asTypeOf(new ControlSignals))

when(isAdd || isSub) {
  ctrl.regWrite := true.B
  ctrl.usesRs1  := true.B
  ctrl.usesRs2  := true.B
}
```

`usesRs1`、`usesRs2` 很有用。冒险检测不能只比较指令字段，因为 U 型、J 型等指令中的同一比特位置未必真的是源寄存器。

指令较多时，建议使用 `BitPat` 和 `ListLookup` 组织译码表，见“进阶写法”。

## 立即数生成器

I 型立即数：

```scala
val immI = Cat(Fill(20, inst(31)), inst(31, 20))
```

S 型与 B 型立即数：

```scala
val immS = Cat(Fill(20, inst(31)), inst(31, 25), inst(11, 7))

val immB = Cat(
  Fill(19, inst(31)), inst(31), inst(7),
  inst(30, 25), inst(11, 8), 0.U(1.W)
)
```

U 型与 J 型立即数：

```scala
val immU = Cat(inst(31, 12), 0.U(12.W))

val immJ = Cat(
  Fill(11, inst(31)), inst(31), inst(19, 12),
  inst(20), inst(30, 21), 0.U(1.W)
)
```

最后根据译码结果选择：

```scala
val imm = MuxLookup(ctrl.immType, 0.U(32.W))(Seq(
  ImmType.I -> immI,
  ImmType.S -> immS,
  ImmType.B -> immB,
  ImmType.U -> immU,
  ImmType.J -> immJ
))
```

## ALU

```scala
val aluResult = MuxLookup(aluOp, 0.U(32.W))(Seq(
  AluOp.ADD  -> (a + b),
  AluOp.SUB  -> (a - b),
  AluOp.AND  -> (a & b),
  AluOp.OR   -> (a | b),
  AluOp.XOR  -> (a ^ b)
))
```

有符号比较与算术右移要显式转换：

```scala
val slt = (a.asSInt < b.asSInt).asUInt
val sra = (a.asSInt >> b(4, 0)).asUInt
```

ALU 输出若固定为 32 位，应测试加法回绕、负数比较和大移位量等边界情况。

## 寄存器堆

```scala
val regs = RegInit(VecInit(Seq.fill(32)(0.U(32.W))))

io.rdata1 := Mux(io.rs1 === 0.U, 0.U, regs(io.rs1))
io.rdata2 := Mux(io.rs2 === 0.U, 0.U, regs(io.rs2))
```

写 x0 时直接忽略：

```scala
when(io.wen && io.rd =/= 0.U) {
  regs(io.rd) := io.wdata
}
```

建议单独测试“同拍写回 x5、译码级读取 x5”的行为，确认它与你的转发设计一致。

## Load 的字节选择与扩展

若数据存储器返回包含目标地址的 32 位字，需要先根据地址低两位把目标字节移到最低位：

```scala
val byteShift = Cat(memAddr(1, 0), 0.U(3.W))
val shifted   = io.dmemRdata >> byteShift

val byte = shifted(7, 0)
val half = shifted(15, 0)
```

然后做符号扩展或零扩展：

```scala
val loadData = MuxLookup(memSize, io.dmemRdata)(Seq(
  MemSize.B  -> Cat(Fill(24, byte(7)), byte),
  MemSize.BU -> Cat(0.U(24.W), byte),
  MemSize.H  -> Cat(Fill(16, half(15)), half),
  MemSize.HU -> Cat(0.U(16.W), half)
))
```

原稿中直接使用 `rawData(7, 0)` 的写法只对字内偏移为 0 的地址正确。

## Store 的写掩码

字节写入要根据地址低两位产生 4 位掩码：

```scala
val byteMask = (1.U(4.W) << memAddr(1, 0))(3, 0)
val halfMask = (3.U(4.W) << memAddr(1, 0))(3, 0)

val wmask = MuxLookup(memSize, "b1111".U)(Seq(
  MemSize.B -> byteMask,
  MemSize.H -> halfMask
))
```

写数据也要移动到对应字节通道：

```scala
val storeShift = Cat(memAddr(1, 0), 0.U(3.W))
val storeData  = (rs2Data << storeShift)(31, 0)
```

半字和字访问通常要求地址对齐。课程若不处理非对齐访问，应使用 `assert` 检查，而不是静默地产生错误结果。

## 流水线 Bundle

每级流水线数据建议携带 `valid`。气泡就是 `valid = false` 的一拍，不必依赖控制信号的零编码。

```scala
class IF2ID extends Bundle {
  val valid = Bool()
  val pc    = UInt(32.W)
  val inst  = UInt(32.W)
}
```

ID/EX 需要保留源寄存器编号，供转发和冒险检测使用：

```scala
class ID2EX extends Bundle {
  val valid   = Bool()
  val pc      = UInt(32.W)
  val rs1     = UInt(5.W)
  val rs2     = UInt(5.W)
  val rd      = UInt(5.W)
  val rs1Data = UInt(32.W)
  val rs2Data = UInt(32.W)
  val imm     = UInt(32.W)
  val ctrl    = new ControlSignals
}
```

流水线寄存器可以整包更新：

```scala
val ifId = RegInit(0.U.asTypeOf(new IF2ID))
val ifIdNext = WireDefault(0.U.asTypeOf(new IF2ID))

ifId := ifIdNext
```

新增 Bundle 字段后，整包连接会自动携带该字段；产生 `ifIdNext` 的逻辑仍要为新字段提供正确值。

## 转发

EX/MEM 中的 ALU 结果可以前递，但 load 的数据此时通常还没有返回，所以不能把 load 当作普通 ALU 结果转发：

```scala
val exCanForward = exMem.valid && exMem.ctrl.regWrite &&
  !exMem.ctrl.memRead && exMem.rd =/= 0.U

val wbCanForward = memWb.valid && memWb.ctrl.regWrite &&
  memWb.rd =/= 0.U
```

对 rs1 选择数据源：

```scala
val hitEx1 = exCanForward && exMem.rd === idEx.rs1
val hitWb1 = wbCanForward && memWb.rd === idEx.rs1

val src1 = MuxCase(idEx.rs1Data, Seq(
  hitEx1 -> exMem.aluResult,
  hitWb1 -> wbData
))
```

rs2 使用同样逻辑。store 写入内存的数据来自 rs2，也必须使用转发后的 `src2`。

## Load-use 冒险

当前 EX 级是 load，ID 级马上要使用其目的寄存器时，需要暂停一拍：

```scala
val idRs1 = ifId.inst(19, 15)
val idRs2 = ifId.inst(24, 20)

val hitRs1 = idCtrl.usesRs1 && idRs1 === idEx.rd
val hitRs2 = idCtrl.usesRs2 && idRs2 === idEx.rd
```

```scala
val loadUse = idEx.valid && idEx.ctrl.memRead &&
  idEx.rd =/= 0.U && ifId.valid && (hitRs1 || hitRs2)
```

这里使用了真实存在的 `ifId.inst` 字段来提取 rs1/rs2，并用 `usesRs1` / `usesRs2` 排除不读取该源操作数的指令。

## Stall 与 Flush 的优先级

EX/MEM 和 MEM/WB 中都是更老的指令，应继续推进：

```scala
exMem := exMemNext
memWb := memWbNext
```

PC、IF/ID、ID/EX 按“重定向优先，其次 load-use 暂停，最后正常推进”控制：

```scala
when(redirect) {
  pc := redirectTarget
  ifId.valid := false.B
  idEx.valid := false.B
}.elsewhen(loadUse) {
  pc := pc
  ifId := ifId
  idEx.valid := false.B
}.otherwise {
  pc   := pc + 4.U
  ifId := ifIdNext
  idEx := idExNext
}
```

这段代码假定本节开头的“当拍返回指令”接口。若取指接口有请求/响应延迟，暂停和冲刷还要管理在途请求，不能直接照搬。

## 参数化

配置值可以放在 Scala `case class` 中，并通过模块构造参数传入：

```scala
case class CpuConfig(
  xlen: Int = 32,
  resetVector: BigInt = 0x80000000L
)

class Core(cfg: CpuConfig) extends Module {
  val pc = RegInit(cfg.resetVector.U(cfg.xlen.W))
}
```

参数化只能帮你统一位宽和结构。把 `xlen` 从 32 改为 64，并不会自动补齐 RV64 指令、立即数规则、访存宽度和测试。

## 常见排错点

### Wire 在 `when` 中未覆盖所有路径

```scala
val result = WireDefault(0.U(32.W))
when(valid) {
  result := data
}
```

Wire 可以在 `when` 中连接，关键是先给默认值或覆盖全部路径。

### 把位宽差异误当成编译错误

```scala
val a = Wire(UInt(32.W))
val b = Wire(UInt(16.W))
val sum = a + b
```

这类表达式通常可以生成硬件。应检查 `sum.getWidth` 对应的规则以及接收端位宽，确认扩展和截断是否符合设计。

### 只比较寄存器编号，不看指令是否使用该源

冒险检测应同时检查 `usesRs1` / `usesRs2`。否则立即数字段碰巧与前一条指令的 rd 相同，也可能造成无意义暂停。

### 把代码短等同于硬件小

`Vec` 的动态索引、动态移位、乘法和很长的 `MuxCase` 都可能生成较大的组合逻辑。完成仿真后还要查看生成 RTL、综合资源和关键路径。
