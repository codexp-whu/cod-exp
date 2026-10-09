# Lab 3: Synchronous and Asynchronous RAM

!!! info "Reference in the Book"

    [*CPU Design in Practice: LoongArch Edition*, 3.1.2 Practical Task 3: Simulation, Synthesis and Implementation of Synchronous and Asynchronous RAM](https://bookdown.org/loongson/_book3/chapter-digital-logic.html#subsec-exp3)

## Objectives

- Instantiate a synchronous RAM from the Xilinx IP library, simulate it to observe how it behaves, then synthesize and implement it and inspect the timing results and resource utilization.
- Instantiate an asynchronous RAM from the Xilinx IP library, simulate it to observe how it behaves, then synthesize and implement it and inspect the timing results and resource utilization.
- Compare and analyze what you observe.

## Background

Both instruction fetch and memory access need RAM. FPGAs offer two common styles of RAM:

| Property | Asynchronous RAM | Synchronous RAM |
| ---- | -------- | -------- |
| Read data output | Driven combinationally as soon as the address is valid | The address is sampled on a clock edge, and the data appears at the next edge (or one cycle later) |
| FPGA resource it maps to | Synthesized into distributed RAM (LUTs) | Can be mapped onto Block RAM (BRAM) |
| Timing | Poor timing at large capacities | Good timing; suits large, high-frequency designs |

The key difference is in the **read timing**: with an asynchronous RAM the read data appears in the same cycle as the address, whereas with a synchronous RAM the read address is registered first and the data appears one cycle later.

After synthesis and implementation, compare how much LUT and BRAM each design uses in Vivado's resource report, and you will see directly how the synthesizer maps different coding styles onto different hardware resources.

## Tasks

The lab environment is in the `dc_env/exp3/` directory, with the following structure:
```
|--block_ram_top.v       Top-level source file for the synchronous RAM (Block RAM).
|--distributed_ram_top.v Top-level source file for the asynchronous RAM (Distributed RAM).
|--ram.xdc               Constraints file for both RAMs, used for synthesis and implementation.
|--ram_tb.v              Simulation file for both RAMs, used for simulation.
```

The top-level design files provided in the environment wrap the two RAM styles so that they share the same module name and interface. The top-level interface of the wrapped RAM is as follows.
### Module Interface (identical for both RAM styles)

| Signal | Direction | Width | Description |
| ---- | ---- | ---- | ---- |
| `clk` | Input | 1 | Clock |
| `ram_wen` | Input | 1 | RAM write enable: 1 selects a write, 0 selects a read |
| `ram_addr` | Input | 10 | 	RAM address; this signal gives both the read and the write address |
| `ram_wdata` | Input | 32 | Data written to the RAM |
| `ram_rdata` | Output | 32 | Data read out of the RAM |

Note: the wrapped RAM interface has no chip-select signal, so the chip select is always active (the chip-select enable of the actual RAM instantiated inside it is tied to 1).

## Steps
### Create the synchronous RAM project

1. Create a new project in Vivado.
2. Click "Add Sources", choose design sources, and add block_ram_top.v.
3. Click "Add Sources", choose constraints, and add ram.xdc.
4. Click "Add Sources", choose simulation sources, and add ram_tb.v.
5. Use the Xilinx IP library to generate a synchronous RAM (Block RAM, depth 65536, width 32, with the chip-select enable tied permanently active).
!!! tips "Customizing the synchronous RAM IP core"
    If you are not sure how to generate the synchronous RAM IP core, see: [Customizing a synchronous RAM IP core](https://bookdown.org/loongson/_book3/appendix-vivado-advanced-usage.html#%E5%AE%9A%E5%88%B6%E5%90%8C%E6%AD%A5ram-ip%E6%A0%B8)


### Create the asynchronous RAM project

1. Create a new project in Vivado.
2. Click "Add Sources", choose design sources, and add distributed_ram_top.v.
3. Click "Add Sources", choose constraints, and add ram.xdc.
4. Click "Add Sources", choose simulation sources, and add ram_tb.v.
5. Use the Xilinx IP library to generate an asynchronous RAM (Distributed RAM, depth **32768**, width 32

!!! tips "Customizing the asynchronous RAM IP core"
    If you are not sure how to generate the asynchronous RAM IP core, see: [Customizing an asynchronous RAM IP core](https://bookdown.org/loongson/_book3/appendix-vivado-advanced-usage.html#%E5%AE%9A%E5%88%B6%E5%BC%82%E6%AD%A5ram-ip%E6%A0%B8)

Once both projects are set up, simulate them and compare how their read and write behavior differs. After the simulations, synthesize and implement both, inspect the timing results and resource utilization, and analyze them together with the read/write timing.

!!! tips "Viewing the timing results and resource utilization"
    To view the timing results and resource utilization, see: [Viewing the timing results and resource utilization](https://bookdown.org/loongson/_book3/appendix-vivado-advanced-usage.html#%E6%9F%A5%E7%9C%8B%E6%97%B6%E5%BA%8F%E7%BB%93%E6%9E%9C%E5%92%8C%E8%B5%84%E6%BA%90%E5%88%A9%E7%94%A8%E7%8E%87)

While working through this lab, pay particular attention to the following points:

- When you generate the IP, name it `block_ram` or `distributed_ram` as appropriate. A wrong name will make the IP report an error. If you find that an IP you have already generated cannot be renamed, delete it and generate it again.
- While generating the IP you can click the diagram on the left of the window to inspect the interface. When the parameters are correct, the port names and widths should match the instantiation in the top-level file.
- If you are interested, research the documentation on customizing synchronous and asynchronous RAM yourself, and use the simulation waveforms to compare what the parameters do.
- Before synthesizing, make sure the constraints file (`ram.xdc`) has been loaded correctly.
- When adding the testbench, be sure to choose "Add Simulation Source"; otherwise the top level will be wrong and the synthesis results will be incorrect.
- Synthesis time depends on the machine you use and can be considerable, so plan ahead and allow enough time.
- The timing report and the resource report are only meaningful once synthesis and implementation have finished.

## Acceptance Criteria

- [ ] Simulate both RAM styles and observe their read/write timing in the waveform
- [ ] Compare the timing results and resource utilization of the synchronous and asynchronous RAM
