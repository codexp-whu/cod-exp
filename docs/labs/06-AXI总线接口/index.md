# AXI总线接口

**请先阅读《CPU设计实战：LoongArch版》相关章节的讲解部分，再返回当前实验讲义阅读实验要求并完成。**

!!! warning
    **所有实验要求请以当前实验讲义为准，请不要参考《CPU设计实战：LoongArch版》中的实验要求！**

!!! info "原书参考"
    本栏实验对应《CPU设计实战：LoongArch版》[第 8 章 AXI总线接口设计](https://bookdown.org/loongson/_book3/chapter-axi-bus.html)。

真实系统中，CPU 并不直接连着存储器，而是通过总线协议与外界交互。本栏从自定义的类 SRAM 总线过渡到 **AXI 协议**，并引入随机延迟验证。

## 实验列表

| 实验 | 主题 | 原书参考 |
| ---- | ---- | ---- |
| [实验14：添加类SRAM总线支持](./实验14-类SRAM总线.md) | 把取指/访存请求改造成握手式总线请求 | [8.1.1 实践任务14](https://bookdown.org/loongson/_book3/chapter-axi-bus.html) |
| [实验15：添加AXI总线支持](./实验15-AXI总线.md) | 实现 AXI 通道协议与类 SRAM→AXI 转换桥 | [8.1.2 实践任务15](https://bookdown.org/loongson/_book3/chapter-axi-bus.html) |
| [实验16：完成AXI随机延迟验证](./实验16-AXI随机延迟验证.md) | 在随机总线延迟下验证功能与死锁自由 | [8.1.3 实践任务16](https://bookdown.org/loongson/_book3/chapter-axi-bus.html) |
