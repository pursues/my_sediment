<template>
  <div class="latex-container">
    <Content :content="latexContent" speaker="ai" :reference="[]" :index="1" />
  </div>
</template>

<script setup lang="ts">

import Content from './content.vue'

const latexContent = `矩阵式公式可以表示为：

\n\n\\[\n\\mathbf{A} = \\begin{pmatrix}\na_{11} & a_{12} & \\cdots & a_{1n} \\\\\na_{21} & a_{22} & \\cdots & a_{2n} \\\\n\\vdots & \\vdots & \\ddots & \\vdots \\\\\na_{m1} & a_{m2} & \\cdots & a_{mn}
\\end{pmatrix}\\]

其中：
- \\(\\mathbf{A}\\) 为 \\(m \\times n\\) 矩阵  
- \\(a_{ij}\\) 表示第 \\(i\\) 行第 \\(j\\) 列的元素  
- 可根据需要替换字母或调整行列数（如方阵、向量等特殊情况）。一元二次方程的标准形式为：

\n\n\\[\nax^2 + bx + c = 0 \\quad (a \\neq 0)\\]

其中：
- \\(a, b, c\\) 为实数系数  
- \\(x\\) 为未知数  
- 解可通过求根公式计算：  
\n\n\\[\nx = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]`



</script>

<style lang="scss" scoped>
.latex-container {
  width: 100%;
  height: 100%;
  background-color: DimGray;
  color: #fff;
}
</style>