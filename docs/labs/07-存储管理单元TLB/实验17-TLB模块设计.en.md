# Lab 17: TLB Module Design

!!! info "Reference in the Book"

    [*CPU Design in Practice: LoongArch Edition*, 9.1 Analyzing the TLB Module Design / 9.2.1 Practical Task 17: TLB Module Design](https://bookdown.org/loongson/_book3/chapter-mmu-design.html#subsec-exp17)

## Objectives

- Design and implement a standalone TLB module, and complete module-level verification.

## Environment

!!! warning

    The verification environment for this lab is different from the SoC environments you have used so far. It is a **standalone verification environment for the TLB module**, located in the `mycpu_env/module_verify/tlb_verify/` directory, and it **does not use the func tests**.

```
|--module_verify/            Module-level verification environment
   |--tlb_verify/            TLB module-level verification environment.
      |--rtl/                Design sources: the TLB module and the verification top level.
      |  |--tlb_top.v        Top-level file for the TLB module-level verification.
      |--testbench/          Functional simulation sources.
      |  |--testbench.v      Simulation top level.
      |--run_vivado/         Run directory for the Vivado project.
         |--constraints/     Design constraints for the Vivado project.
         |--tlb_prj/         Directory holding the Vivado project files.
```

## Tasks

This practical task asks you to:

- Design the TLB module. The RTL file must be named **`tlb.v`** and the module must be named **`tlb`**. For the input and output ports, follow the interface defined in section 9.1 of the book (two lookup ports, a TLBSRCH lookup, the TLBWR/TLBFILL write ports, the TLBRD read port, and INVTLB operations).
- Verify your TLB using the TLB module-level verification environment, passing both the simulation and the board verification.

!!! tip "Design notes"

    - The lookup uses a **fully associative parallel comparison**: every entry is compared against the incoming VPPN/ASID at the same time to produce a match vector, and the information of the matching entry is selected onto the output by a multiplexer;
    - The comparison must account for both the **G bit** (global entries ignore ASID) and the **page size** (a 4MB page compares only the upper 10 bits of the VPPN, while a 4KB page compares all 19 bits);
    - 16 entries are recommended (`parameter TLBNUM = 16`).

!!! tips "Aligning the top level with a Chisel BlackBox"
    Use a BlackBox to reference tlb.v, matching the port names to module tlb word for word, declaring and connecting clk/rst explicitly, and use HasBlackBoxResource to pull in the Verilog source file where necessary.


## Steps

1. Finish the design and RTL of the TLB module and save it as `tlb.v`, then place `tlb.v` in the `mycpu_env/myCPU/` directory.
2. Go to `mycpu_env/module_verify/tlb_verify/run_vivado/tlb_prj/` and open the project that verifies the TLB. If no project has been created there yet, use the `create_project.tcl` file in that directory to create one.
3. Run the simulation in the TLB verification project (once the simulation window opens, just click run all) and debug until the simulation passes.
4. Synthesize and implement the TLB verification project, generate the bitstream, and run the board verification.

## Acceptance Criteria

- [ ] The TLB module-level simulation passes (16 writes, 16 reads and 26 lookups in total; `PASS!!!` is printed once all of them are correct).
- [ ] The TLB works correctly on the board.

??? tips "Judging the simulation result"
    The simulation performs 16 writes, 16 reads and 26 lookups, and prints PASS once all of them have completed, as shown below:
```
    [   2705 ns] OK!!!write
    …………
    =========================================================
    Test end!
    ----PASS!!!
```
    If the simulation reports an error, debug it. Inspect the accesses on the TLB interface to understand what the request is meant to do, then check whether the data read out of the TLB matches the expected result.

??? tips "Judging the board verification result"

    When you run it on the board, the seven-segment displays report the progress of each stage in turn:

    1. **Write (W)**: the rightmost seven-segment display counts up from 0x00 to 0x0f, and the rightmost single-color LED lights up when it finishes;
    2. **Read (R) and lookup (S0/S1) run at the same time**: the second display from the right (R) counts up from 0x00 to 0x0f; the second display from the left (S0, even-numbered requests) counts up from 0x00 to 0x18 in steps of 2; the leftmost display (S1, odd-numbered requests) counts up from 0x01 to 0x19 in steps of 2;
    3. When everything has finished, the three LEDs on the right light up, and a successful run reads **0x19180f0f** on the displays. Stopping at any other value means the board verification failed.
