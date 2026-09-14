# 流水线CPU设计

本栏实验对应《CPU设计实战：LoongArch版》[第 5 章 简单流水线CPU设计](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html)和[第 6 章 在流水线中添加普通用户态指令](https://bookdown.org/loongson/_book3/chapter-add-more-user-instr.html)。

从本栏开始，CPU 改用 **Chisel** 开发，请配合 [Chisel入门](../../chisel/简介.md) 讲义学习语法。

五级流水线把单周期数据通路切分为 IF / ID / EX / MEM / WB 五级，用流水级寄存器衔接。指令在各级并行执行，吞吐率提升数倍，但**相关与冲突**也随之而来——本栏实验的主线，就是先直面冲突，再用阻塞和前递解决它，最后扩展指令系统。

## 实验列表

| 实验 | 主题 | 原书参考 |
| ---- | ---- | ---- |
| [实验7：不考虑相关冲突处理的简单流水线CPU](./实验7-简单流水线CPU.md) | 把单周期 CPU 切成五级流水线 | [5.1.1 实践任务7](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html) |
| [实验8：阻塞技术解决相关引发的冲突](./实验8-阻塞解决冲突.md) | 检测相关，插入流水线气泡 | [5.1.2 实践任务8](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html) |
| [实验9：前递技术解决相关引发的冲突](./实验9-前递解决冲突.md) | 用前递网络消除部分阻塞 | [5.1.3 实践任务9](https://bookdown.org/loongson/_book3/chapter-simple-pipeline-cpu.html) |
| [实验10：算术逻辑运算指令和乘除法运算指令添加](./实验10-算术逻辑与乘除法指令.md) | 扩展 ALU 类指令与乘除法单元 | [6.1.1 实践任务10](https://bookdown.org/loongson/_book3/chapter-add-more-user-instr.html) |
| [实验11：转移指令和访存指令添加](./实验11-转移和访存指令.md) | 扩展分支跳转与 load/store 指令 | [6.1.2 实践任务11](https://bookdown.org/loongson/_book3/chapter-add-more-user-instr.html) |
