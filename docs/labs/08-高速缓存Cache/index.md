# 高速缓存（Cache）

**请先阅读《CPU设计实战：LoongArch版》相关章节的讲解部分，再返回当前实验讲义阅读实验要求并完成。**

!!! warning
    **所有实验要求请以当前实验讲义为准，请不要参考《CPU设计实战：LoongArch版》中的实验要求！**

!!! info "原书参考"
    本栏实验对应《CPU设计实战：LoongArch版》[第 10 章 高速缓存设计](https://bookdown.org/loongson/_book3/chapter-cache-design.html)。

CPU 与主存的速度差距以数量级计，Cache 用局部性原理加速CPU速度，减少等待主存数据时CPU阻塞的时间。

本栏先实现独立的 Cache 模块（含 AXI 总线接口与未命中处理状态机），再把 ICache、DCache 集成进 CPU，并添加 CACOP 指令维护。

## 实验列表

| 实验 | 主题 | 原书参考 |
| ---- | ---- | ---- |
| [实验20：Cache模块设计](./实验20-Cache模块设计.md) | 独立 Cache：组相联、未命中状态机、AXI 接口 | [10.1 / 10.2.1](https://bookdown.org/loongson/_book3/chapter-cache-design.html) |
| [实验21：在CPU中集成ICache](./实验21-集成ICache.md) | 取指通路接入 ICache | [10.2.2 实践任务21](https://bookdown.org/loongson/_book3/chapter-cache-design.html) |
| [实验22：CPU中集成DCache](./实验22-集成DCache.md) | 访存通路接入 DCache，处理 store 缓冲 | [10.2.3 实践任务22](https://bookdown.org/loongson/_book3/chapter-cache-design.html) |
| [实验23：CPU中添加CACOP指令](./实验23-CACOP指令.md) | CACHE 维护指令：查询与清洗 | [10.2.4 实践任务23](https://bookdown.org/loongson/_book3/chapter-cache-design.html) |
