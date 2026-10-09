# Lab 20: Cache Module Design

!!! info "Reference in the Book"

    [*CPU Design in Practice: LoongArch Edition*, 10.1 Cache Module Design / 10.2.1 Practical Task 20: Cache Module Design](https://bookdown.org/loongson/_book3/chapter-cache-design.html#subsec-exp20)

## Objectives

- Design and implement a standalone cache module, and complete module-level verification.

## Environment

!!! warning

    The verification environment for this lab is not the SoC environment. It is a **dedicated verification environment for the cache module**, located under `mycpu_env/module_verify/cache_verify/`, and it **does not use the func tests**.

```
|--module_verify/            module-level verification environment
   |--cache_verify/          cache module-level verification environment.
      |--rtl/                design sources, including the cache module and the verification top level.
      |  |--cache_top.v      top-level file for cache module-level verification.
      |--testbench/          functional simulation sources.
      |  |--testbench.v      simulation top level.
      |--run_vivado/         run directory for the Vivado project
         |--constraints/     design constraints for the Vivado project.
         |--cache_prj/       directory holding the Vivado project files.
```

## Tasks

The requirements for this practical task are as follows:

- Design the cache module. The RTL file must be named **`cache.v`** and the module must be named **`cache`**. Apart from the clock input clk and the active-low reset input resetn, the input and output ports follow the definitions in Table 10.2 (interaction with the CPU pipeline over the SRAM-like bus) and Table 10.3 (read and write interaction with the AXI bus interface module) in Section 10.1 of the book.
- Design specifications: **2-way set associative, 4 KB per way, 16-byte cache lines, LRU or pseudo-random replacement policy, hardware initialization recommended**.
- Verify your cache with the cache module-level verification environment, passing both simulation and board verification.

!!! tip "Key Design Points"

    - Address split: virtual address bits `[11:4]` form the index (8 bits), physical address bits `[31:12]` form the tag (20 bits), and the in-line offset is 4 bits — that is, **virtually indexed, physically tagged** (VIPT) access;
    - The cache RAM must be **customized by you**: 2 blocks of TAGV RAM, 256×21 each; 8 blocks of DATA Bank RAM, 256×32 each (with **byte write enable** turned on; when customizing, **do not tick** "Primitives Output Register", so that data is returned in a single cycle);
    - Internally the module is organized around four kinds of access: **Look Up, Hit Write, Replace, Refill**, managed by a main state machine (IDLE/LOOKUP/MISS/REPLACE/REFILL) together with a write buffer state machine;
    - The data cache uses a **write-back plus write-allocate** policy; when a dirty line is replaced, it is written back to memory over AXI before the new line is filled in.

## Steps

1. Complete the design and the RTL implementation of the cache module, save it as `cache.v`, and put `cache.v` in the `mycpu_env/myCPU/` directory.
2. Go to the `mycpu_env/module_verify/cache_verify/run_vivado/cache_prj/` directory and open the project for verifying the cache. If no project has been created in that directory yet, create one using the `create_project.tcl` file there.
3. Run the simulation in the cache module verification project (once the simulation window opens, just click run all) and debug until the simulation tests pass.
4. Synthesize and implement the cache module verification project, generate the bitstream, and run the board verification.

## Acceptance Criteria

- [ ] The cache module-level simulation passes.

??? tips "Interpreting the simulation results"
    Module-level verification starts at index=0. For each index it generates four random tag/data pairs. It first issues write requests to put those four values into the cache, and then issues read requests to read them back. If no error occurs in between, the index is incremented and a new set of tag/data pairs is generated for the same test, until the test for index==ff is complete.

    For a write-to-cache request, the result the verification environment expects to see is this: after the write request is issued a Cache miss occurs, the cache module issues an rd request, and the verification environment returns all ones (0xFFFFFFFF). A write request may also trigger a replacement, in which case the verification environment compares wr_addr and wr_data against the tag/data combination described above, and the test aborts if the replaced value is wrong.

    Once all the write operations are done, read operations follow, and the verification environment performs the same checks. After the cache returns the result of a read operation, the verification environment checks whether what it read is the same as what was written earlier.

    During simulation, a write followed by a read is generated for four cache lines per index; when all the operations are complete, PASS is printed, as shown below:
```
    [   2705 ns] index 00 finishd
    …………
    =========================================================
    Test end!
    ----PASS!!!
```
    If you find an error during simulation, debug it; the console prints the reason for the error. The verification environment only checks for data errors during replacement and for Cache read data errors.
    

??? tips "Interpreting the board verification results"

    When running on the board, the **leftmost two digits of the seven-segment display show the index of the test currently running**, which increases step by step until it reaches 0xff, at which point the test stops.

!!! tip "Hardware Initialization"

    Because the CACOP instruction is not implemented until Lab 23, the cache must be initialized by hardware at this stage: when customizing the TAGV RAM, tick "Fill Remaining Memory Locations" and set the initial value to 0 (V=0 means every line is invalid), and implement the D table with registers so that it is simply cleared by the reset.
