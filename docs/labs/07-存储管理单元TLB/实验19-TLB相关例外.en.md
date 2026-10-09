# Lab 19: Adding TLB-Related Exception Support

!!! info "Reference in the Book"

    [*CPU Design in Practice: LoongArch Edition*, 9.2.3 Practical Task 19: Adding TLB-Related Exception Support](https://bookdown.org/loongson/_book3/chapter-mmu-design.html#subsec-exp19)

## Objectives

- Add the TLB-related exceptions and virtual-to-physical address mapping to the CPU, completing the full functionality of the MMU.

## Tasks

This practical task builds on the CPU from Lab 18 and asks you to:

- Add the TLB-related exceptions to the CPU: **TLB refill exception, page invalid exception for load/store/fetch operations, page modified exception, and page privilege level violation exception**.
- Add the **DMW** CSRs to the CPU.
- Add **virtual-to-physical address mapping** to the CPU.

!!! warning "Address translation modes"

    The DA/PG fields of CRMD select the translation mode: in direct mapping (DA=1) the address is mapped directly according to the DMW register configuration; in page mapping (PG=1) the virtual address is first looked up in the TLB to obtain the PPN, which is then concatenated into the physical address. TLB exceptions are detected in **instruction fetch (IF) and memory access (MEM)** — earlier in the pipeline and far more frequent than syscall and the like — so they must be folded into the precise-exception arbitration framework you built in Labs 12 and 13.

!!! info "Select EXP19 for the test program"

## Steps

1. Update your CPU code in the `mycpu_env/myCPU/` directory.
2. Edit the func configuration file, `mycpu_env/func/include/test_config.h`, to select the exp19 configuration, and compile. (`make EXP=19`)
3. Open the `gettrace` project, `mycpu_env/gettrace/gettrace.xpr`. Run its simulation (once the simulation window opens, just click run all and wait for it to finish) to generate a new reference trace file, `golden_trace.txt` (`mycpu_env/gettrace/golden_trace.txt`). `golden_trace.txt` only contains the complete contents once the simulation has finished.
4. Go to `mycpu_env/soc_verify/soc_axi/run_vivado/` and open the project that verifies myCPU. If no project has been created there yet, use the `create_project.tcl` file in that directory to create one. If a project from the previous practical task already exists there, you can open it and then update its list of CPU implementation files.
5. Re-customize `axi_ram` in the project.
6. Run the simulation in the myCPU verification project (once the simulation window opens, just click run all) and debug until the simulation passes.
7. Synthesize and implement the myCPU verification project, generate the bitstream, and run the board verification.

## Acceptance Criteria

- [ ] The Lab 19 test program (n1~n72, 72 function points in total) passes in simulation.
- [ ] On the board both bicolor LEDs are green, and the seven-segment displays read "4800 0048".

!!! tip "Implementation hints"

    - Telling the exceptions apart: a TLB lookup miss → refill exception; a hit with V=0 → page invalid exception (you must also distinguish whether the access came from an instruction fetch or a data access); a store that hits with D=0 → page modified exception; the current PLV lower than the entry's PLV → page privilege level violation exception;
    - The virtual address that triggered the exception is recorded in **TLBRBADV** (which differs from the general-purpose BADV);
    - For the exception entry address (EENTRY, or the dedicated TLB refill entry) and the way `ertn` restores DA/PG, follow the [LoongArch32R instruction set manual](https://www.loongson.cn/uploads/images/2023041918122813624.%E9%BE%99%E8%8A%AF%E6%9E%B6%E6%9E%8432%E4%BD%8D%E7%B2%BE%E7%AE%80%E7%89%88%E5%8F%82%E8%80%83%E6%89%8B%E5%86%8C_r1p03.pdf).
