# Lab 23: Adding the CACOP Instruction to the CPU

!!! info "Reference in the Book"

    [*CPU Design in Practice: LoongArch Edition*, 10.2.4 Practical Task 23: Adding the CACOP Instruction to the CPU](https://bookdown.org/loongson/_book3/chapter-cache-design.html#subsec-exp23)

## Objectives

- Implement the **CACOP** instruction (cache maintenance operations) in the CPU, the last piece of the Cache section.

## Tasks

Building on your work in Practical Task 22, this practical task asks you to do the following:

- Add an implementation of the **CACOP instruction** to the CPU from Practical Task 22.

!!! warning "The semantics of CACOP"

    `cacop op, rj, si12` performs a maintenance operation on the cache line (aligned to the line boundary) addressed by `rj + sext(si12)`, selected by the op value: query (read the tag into a CSR), invalidate (clear V, discarding the data), write-back (write a dirty line back to memory), and flush (write-back plus invalidate). CACOP is a **privileged instruction**; executing it at any privilege level other than PLV0 raises a privileged instruction exception.

!!! info "For the test program, select EXP23"

## Steps

1. Copy the code of the CPU you have implemented into the `mycpu_env/myCPU/` directory.
2. Modify the func configuration file `mycpu_env/func/include/test_config.h` to select the exp23 configuration, and compile. (`make EXP=23`)
3. Open the `gettrace` project, `mycpu_env/gettrace/gettrace.xpr`. Run the simulation of the `gettrace` project (once the simulation window opens, just click run all and wait for the simulation to finish) to generate the new reference trace file `golden_trace.txt` (`mycpu_env/gettrace/golden_trace.txt`). `golden_trace.txt` only holds complete contents once the simulation has finished.
4. Go to the `mycpu_env/soc_verify/soc_axi/run_vivado/` directory and open the project for verifying myCPU. If no project has been created in that directory yet, create one using the `create_project.tcl` file there. If a project created by an earlier practical task already exists there, you can open it and then update the list of CPU implementation files in the project.
5. Re-customize the `axi_ram` in the project.
6. Run the simulation in the myCPU verification project (once the simulation window opens, just click run all) and debug until the simulation tests pass.
7. Synthesize and implement the myCPU verification project, generate the bitstream, and run the board verification.

## Acceptance Criteria

- [ ] The Lab 23 test program (n1~n79, 79 functional points in total) passes simulation.
- [ ] On the board both bicolor LEDs are green, and the seven-segment display shows "4F00 004F".

!!! tip "Implementation Hints"

    - Once CACOP is implemented, the cache can be **initialized in software**: software initializes it simply by using CACOP to zero every tag, which makes the hardware initialization circuit a fallback;
    - While a CACOP is executing it may issue a bus write-back (flushing a dirty line), so the pipeline has to be frozen until it completes, just as it is for the multi-cycle multiplier and divider.
