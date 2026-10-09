# Lab 7: A Simple Pipelined CPU Without Hazard Handling

!!! info "Reference in the Book"

    [*CPU Design in Practice: LoongArch Edition* 5.1.1 Practical Task 7: A Simple Pipelined CPU Without Hazard Handling](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html#subsec-exp7)

## Objectives

- Split the single-cycle CPU datapath into the five stages IF / ID / EX / MEM / WB, inserting pipeline registers between them.
- Understand the throughput gain a pipeline brings and the price it charges (hazards).
- This lab **deliberately does not handle** dependencies or hazards, so that you can see the resulting failures for yourself.

## Environment

!!! warning 
    Before you start, make sure you have set up your Chisel development environment as described in the [Getting Started with Chisel](../../chisel/简介.md) notes and that you have a basic grasp of Chisel syntax.

### Vivado Project Environment
!!! warning
    The lab environment still lives under `mycpu_env/`, but for verification you no longer use the `soc_dram/` subdirectory — use the **soc_bram/ subdirectory** instead!

Because the instruction RAM and data RAM the CPU accesses are now implemented as block RAM rather than distributed RAM, the lab environment has to be adjusted as well: it is still the `mycpu_env` environment, and the `gettrace/`, `func/`, and `myCPU/` subdirectories keep their locations and purposes unchanged. The only difference is that under `soc_verify/` you no longer use the `soc_dram/` subdirectory but the `soc_bram/` subdirectory instead; the files inside `soc_bram/` are organized along the same lines and serve the same purposes as those inside `soc_dram/`. The directory structure of the adjusted lab environment and a brief description of each part are shown below:
```
|--gettrace/                The part that generates the reference trace.
|--func/                    Functional verification test programs used by the lab tasks.
|--myCPU/                   The RTL code of your own CPU.
|--soc_verify/              The SoC system verification environment for your own CPU
   |--soc_bram/             The verification environment for when the CPU's external interface connects to block RAM.
   |  |--rtl/               SoC_Lite design source directory.
   |  |  |--soc_lite_top.v  Top-level file of SoC_Lite.
   |  |  |--CONFREG/        The confreg module, used to access the CPU and board peripherals such as the seven-segment display and the DIP switches.
   |  |  |--BRIDGE/         A 1×2 bridge module: the CPU's data sram interface accesses confreg and data_ram at the same time.
   |  |  |--xilinx_ip/      Customized Xilinx IP, including clk_pll, inst_ram, and data_ram.
   |  |--testbench/         Functional simulation verification platform.
   |  |  |--mycpu_tb.v      Functional simulation top level; this module captures debug information and compares it against golden_trace.txt.
   |  |--run_vivado/        The run directory of the Vivado project.
   |     |--constraints/    Design constraints for the Vivado project.
   |     |--mycpu_bram_prj/ Directory holding the Vivado project files.
```

From Lab 7 onward, **both the instruction RAM and the data RAM are implemented with block RAM**, so accesses to them have to be qualified with a chip-select signal. The myCPU top-level interface therefore gains a chip-select signal for the instruction RAM, `inst_sram_en`, and a chip-select signal for the data RAM, `data_sram_en`. Both are 1 bit wide and active high.

To meet the needs of the later practical tasks, `inst_sram_we` and `data_sram_we` in the myCPU top-level interface both change from 1 bit to 4 bits, and their meaning **changes from a RAM write enable to a RAM byte write enable.**

### Chisel Development Environment
Chisel development should be done in a Linux environment. Once you have finished developing, follow the README there to generate the Verilog files; move them into `mycpu_env/myCPU` and you can then simulate and program the board from Vivado.


## Tasks
We have already provided a Chisel version of a five-stage pipelined CPU supporting five instructions. Start by cloning the Chisel development framework in your Linux environment:
```
TODO: to be added
```

!!! warning
     Before you start, first confirm that your Chisel development environment can correctly generate Verilog files and simulate them in the `soc_bram` environment! (Since only five instructions are supported, it is normal for the simulation not to pass.)

!!! info "A Guide to the Chisel Five-Stage Pipelined CPU with Five Instructions"
    See [A Guide to the Chisel Five-Stage Pipelined CPU](TODO: to be added) to learn about the five-stage pipelined CPU framework we provide.

Building on that framework, extend it to support the same 20 instructions as in Lab 6 (the only change is that the CPU is now pipelined rather than single-cycle):

- Arithmetic: **add.w, sub.w, addi.w**
- Comparison: **slt, sltu**
- Logic: **nor, and, or, xor**
- Shift: **slli.w, srli.w, srai.w**
- Memory access: **ld.w, st.w**
- Branch and jump: **jirl, b, bl, beq, bne**
- Other: **lu12i.w**

!!! info "Select EXP7 as the test program"


## Steps

1. Copy the CPU code generated by your Chisel environment into the `mycpu_env/myCPU/` directory.
2. Edit the func configuration file, `mycpu_env/func/include/test_config.h`, to select the exp7 configuration, then compile it. (`make EXP=7`)
3. Open the `gettrace` project, `mycpu_env/gettrace/gettrace.xpr`. (The IP cores in this Vivado project were created with Vivado 2019.2; if you open it with a newer version of Vivado, upgrade the IP cores.) Run the `gettrace` project's simulation (once the simulation window is open, just click run all and wait for the simulation to finish) to generate a new reference trace file `golden_trace.txt` (`mycpu_env/gettrace/golden_trace.txt`). The simulation has to run to completion before `golden_trace.txt` holds its full contents.
4. Go into the `mycpu_env/soc_verify/soc_bram/run_vivado/` directory and start the project that verifies myCPU. If no project has been created in that directory yet, use the `create_project.tcl` file there to create one.
5. Re-customize the `inst_ram` IP in the project.
6. Run the simulation in the myCPU verification project (once the simulation window is open, just click run all), and verify and debug the design until the simulation test passes.
7. Synthesize and implement the design in the myCPU verification project, generate the bitstream, and verify it on the board.


## Acceptance Criteria

- [ ]  The Lab 7 test program passes simulation!
- [ ]  On the board, both bicolor LEDs are green and the seven-segment display shows `1400 0014`
