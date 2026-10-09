# Lab 15: Adding AXI Bus Support

!!! info "Reference in the Book"

    [*CPU Design in Practice: LoongArch Edition*, 8.1.2 Practical Task 15: Adding AXI Bus Support](https://bookdown.org/loongson/_book3/chapter-axi-bus.html#subsec-exp15)

## Objectives

- Convert the CPU's top-level interface into an **AXI bus interface** and implement an SRAM-like-to-AXI bridge, then complete fixed-delay functional verification in the AXI-based SoC verification environment.

## Environment

!!! warning

    The verification environment for this lab **no longer uses the `soc_hs_bram/` subdirectory — use the `soc_axi/` subdirectory instead**!

Now that the CPU's external access interface has changed from handshaking block RAM to an **AXI bus interface**, the verification environment has been adjusted further: the `gettrace/`, `func/`, and `myCPU/` subdirectories keep their locations and purposes unchanged; the only difference is that under `soc_verify/` you now use the `soc_axi/` subdirectory:

```
|--mycpu_env/                Root directory of the lab environment.
|--gettrace/                 The part that generates the reference trace.
|--func/                     Functional verification test programs used by the lab tasks.
|--myCPU/                    The RTL code of your own CPU.
|--soc_verify/               The SoC system verification environment for your own CPU
   |--soc_axi/               The verification environment for when the CPU's external interface connects to the AXI interface.
      |--rtl/                SoC_Lite design source directory.
      |  |--soc_lite_top.v   Top-level file of SoC_Lite.
      |  |--CONFREG/         The confreg module, used to access the CPU and board peripherals such as the seven-segment display and the DIP switches.
      |  |--ram_wrap/        The AXI RAM module, wrapped to support random-delay accesses.
      |  |--axi_wrap/        A 1x1 AXI adapter connecting the CPU and the Crossbar, smoothing out the differences between simulation and the board.
      |  |--xilinx_ip/       Customized Xilinx IP, including clk_pll, axi_ram and axi_crossbar_1x2.
      |--testbench/          Functional simulation verification platform.
      |  |--mycpu_tb.v       Functional simulation top level; this module captures debug information and compares it against golden_trace.txt.
      |--run_vivado/         The run directory of the Vivado project.
         |--constraints/     Design constraints for the Vivado project.
         |--mycpu_axi_prj/   Directory holding the Vivado project files.
```

## Tasks

In this practical task you build on the CPU you completed in Lab 14 and do the following:

- Change the CPU's top-level interface to an **AXI bus interface**. The CPU exposes a single AXI interface to the outside, so it must **arbitrate between instruction fetch and data access** internally.
- We recommend implementing an **SRAM-like-to-AXI 2×1 bridge**: provide two SRAM-like ports internally (instruction fetch and memory access) and arbitrate between them, then package the outside as an AXI interface and connect it to the CPU with the SRAM-like interface that you completed in Lab 14.

!!! tips
    You may find the AXI bus implementation in the OpenLA500 processor core useful!

!!! info "Select EXP15 as the test program"

## Steps

1. Update the code of your CPU implementation into the `mycpu_env/myCPU/` directory.
2. Edit the func configuration file, `mycpu_env/func/include/test_config.h`: select the exp15 configuration and compile. (`make EXP=15`)
3. Open the `gettrace` project, `mycpu_env/gettrace/gettrace.xpr`. Run the simulation of the `gettrace` project (once the simulation window opens, just click run all and wait for it to finish) to generate a new reference trace file, `golden_trace.txt` (`mycpu_env/gettrace/golden_trace.txt`). The simulation has to run to completion before `golden_trace.txt` holds its full contents.
4. Go to the `mycpu_env/soc_verify/soc_axi/run_vivado/` directory and launch the project that verifies myCPU. If no project has been created in that directory yet, use the `create_project.tcl` file there to create one.
5. Re-customize `axi_ram` in the project.
6. Run the simulation in the myCPU verification project (once the simulation window opens, just click run all) and verify and debug the design until the simulation passes.
7. Run synthesis and implementation in the myCPU verification project, generate the bitstream file, and verify on the board.

## Acceptance Criteria

- [ ] The Lab 15 test program (n1~n58, 58 feature points in total) passes in simulation.
- [ ] On the board both bicolor LEDs are green, and the seven-segment display shows "3A00 003A".

??? tips "Board verification requirements"

    On the board the low 8 DIP switches must be set to **"the upper 4 switched down and the lower 4 switched up"** (which corresponds to a memory-access random delay type of **no delay**), and func must run correctly.
