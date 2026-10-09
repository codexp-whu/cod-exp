# Lab 18: Adding TLB Instructions and CSRs

!!! info "Reference in the Book"

    [*CPU Design in Practice: LoongArch Edition*, 9.2.2 Practical Task 18: Adding TLB-Related Instructions and CSRs](https://bookdown.org/loongson/_book3/chapter-mmu-design.html#subsec-exp18)

## Objectives

- Integrate the TLB module built in Lab 17 into the CPU, and add the TLB-related instructions and CSRs.

## Tasks

This practical task builds on Labs 16 and 17 and asks you to:

- Integrate the TLB module from Practical Task 17 into the CPU from Practical Task 16.
- Add the TLB operation instructions to the CPU: **TLBSRCH, TLBRD, TLBWR, TLBFILL, INVTLB**.
- Add the CSRs to the CPU: **TLBIDX, TLBEHI, TLBELO0, TLBELO1, ASID, TLBRENTRY**.


!!! info "Select EXP18 for the test program"

## Steps

1. Update your CPU code in the `mycpu_env/myCPU/` directory.
2. Edit the func configuration file, `mycpu_env/func/include/test_config.h`, to select the exp18 configuration, and compile. (`make EXP=18`)
3. Open the `gettrace` project, `mycpu_env/gettrace/gettrace.xpr`. Run its simulation (once the simulation window opens, just click run all and wait for it to finish) to generate a new reference trace file, `golden_trace.txt` (`mycpu_env/gettrace/golden_trace.txt`). `golden_trace.txt` only contains the complete contents once the simulation has finished.
4. Go to `mycpu_env/soc_verify/soc_axi/run_vivado/` and open the project that verifies myCPU. If no project has been created there yet, use the `create_project.tcl` file in that directory to create one. If a project from the previous practical task already exists there, you can open it and then update its list of CPU implementation files.
5. Re-customize `axi_ram` in the project.
6. Run the simulation in the myCPU verification project (once the simulation window opens, just click run all) and debug until the simulation passes.
7. Synthesize and implement the myCPU verification project, generate the bitstream, and run the board verification.

## Acceptance Criteria

- [ ] The Lab 18 test program (n1~n70, 70 function points in total) passes in simulation.
- [ ] On the board both bicolor LEDs are green, and the seven-segment displays read "4600 0046".

!!! tip "Implementation hints"

    - All five TLB instructions pass their operands and results through CSRs (TLBEHI holds the VPPN to be looked up, TLBELO0/1 hold the entry contents, and TLBIDX holds the entry number and the lookup result). Both paths, CSR→TLB and TLB→CSR, must be wired up correctly;
    - This lab does **not** yet require virtual-to-physical address translation — the CPU still runs in direct-mapped mode, and the func tests only check that the instructions and the CSRs themselves are correct.
