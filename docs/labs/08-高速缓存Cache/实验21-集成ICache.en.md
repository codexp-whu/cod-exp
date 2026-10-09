# Lab 21: Integrating the ICache into the CPU

!!! info "Reference in the Book"

    [*CPU Design in Practice: LoongArch Edition*, 10.2.2 Practical Task 21: Integrating the ICache into the CPU](https://bookdown.org/loongson/_book3/chapter-cache-design.html#subsec-exp21)

## Objectives

- Integrate the cache module you built in Lab 20 into the CPU's instruction fetch path as an **ICache**, and make the AXI conversion bridge support **burst transfers**.

## Tasks

Building on your work in Labs 19 and 20, this practical task asks you to do the following:

- Integrate the cache module from Practical Task 20 into the CPU from Practical Task 19 as an ICache.
- Modify the AXI conversion bridge in the CPU so that it supports **burst transfers**.

!!! info "For the test program, select EXP21"

## Steps

1. Copy the code of the CPU you have implemented into the `mycpu_env/myCPU/` directory.
2. Modify the func configuration file `mycpu_env/func/include/test_config.h` to select the exp21 configuration, and compile. (`make EXP=21`)
3. Open the `gettrace` project, `mycpu_env/gettrace/gettrace.xpr`. Run the simulation of the `gettrace` project (once the simulation window opens, just click run all and wait for the simulation to finish) to generate the new reference trace file `golden_trace.txt` (`mycpu_env/gettrace/golden_trace.txt`). `golden_trace.txt` only holds complete contents once the simulation has finished.
4. Go to the `mycpu_env/soc_verify/soc_axi/run_vivado/` directory and open the project for verifying myCPU. If no project has been created in that directory yet, create one using the `create_project.tcl` file there. If a project created by an earlier practical task already exists there, you can open it and then update the list of CPU implementation files in the project.
5. Re-customize the `axi_ram` in the project.
6. Run the simulation in the myCPU verification project (once the simulation window opens, just click run all) and debug until the simulation tests pass.
7. Synthesize and implement the myCPU verification project, generate the bitstream, and run the board verification.

## Acceptance Criteria

- [ ] The Lab 21 test program (n1~n72, 72 functional points in total) passes simulation.
- [ ] On the board both bicolor LEDs are green, and the seven-segment display shows "4800 0048".
