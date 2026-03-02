<template>
  <div class="effect">
    <div class="effect-item-block">
      <div class="title">
        <h2>展开文本块...</h2>
      </div>
      <div class="content"> 
      <div class="flex flex-col gap-[10px]">
        <div class="text1">
          浮动元素是如何定位的
        正如我们前面提到的那样，当一个元素浮动之后，它会被移出正常的文档流，然后向左或者向右平移，一直平移直到碰到了所处的容器的边框，或者碰到另外一个浮动的元素。
        </div>
        <div class="text2">
          浮动元素是如何定位的
        正如我们前面提到的那样，当一个元素浮动之后，它会被移出正常的文档流，然后向左或者向右平移，一直平移直到碰到了所处的容器的边框，或者碰到另外一个浮动的元素。
        </div>
        <div class="text3">
          <button class="btn">展开</button>
          浮动元素是如何定位的
        正如我们前面提到的那样，当一个元素浮动之后，它会被移出正常的文档流，然后向左或者向右平移，一直平移直到碰到了所处的容器的边框，或者碰到另外一个浮动的元素。
        </div>
        <div class="text4 w-[400px]">
          <div class="text-[14px] text-second-gray leading-6 line-clamp-4">
            使用postcss css 布局 主要使用line-clamp-4属性，该用户没有参与OpenMem和MemOS。用户在最近的交互中表现出了对技术文档和架构设计的浓厚兴趣，特别是在记忆张量核心组件的技术说明方面。用户不仅关注现有的功能，还对未来的扩展性和集成性提出了具体的疑问。用户在最近的交互中表现出了对技术文档和架构设计的浓厚兴趣，特别是在记忆张量核心组件的技术说明方面。用户不仅关注现有的功能，还对未来的扩展性和集成性提出了具体的疑问。
          </div>
        </div>

      </div>
      </div>
    </div>
    <el-divider />
    <div class="effect-item-white-block">
      <div class="title">
        <h2>根据宽度自适应高度</h2>
      </div>
      <div class="content">
        <div class="white-block">
          <div>宽度动态设置：width: 40%;</div>
          <div>高度设置为宽度的4/5：aspect-ratio: 5/4;</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

</script>

<style scoped lang="scss">
.common-text {
  border: 1px solid #1677FF;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  border-radius: 6px;
}
.effect-item-block{
  .title{
    h2{
      font-size: 16px;
      font-weight: 600;
    }
  }
  .content{
    .text1 {
      width: 400px;
      @extend .common-text;
    }
    .text2 {
      width: 350px;
      @extend .common-text;
    }
    .text3 {
      width: 350px;
      @extend .common-text;
      .btn {
        float: right;
        clear: both;
        margin-top: -16px;
        margin-right: 8px;
        border-radius: 6px;
        width: 32px;
        background-color: #1677FF;
        /*其他装饰样式*/
      }
    }
    .text3::before{
      content: '';
      float: right;
      width: 0px;
      height: 50px;
      background: red;
    }
    .text4{
      width: 400px;
      @extend .common-text;
    }
  }
}
.effect-item-white-block{
  .title{
    h2{
      font-size: 16px;
      font-weight: 600;
    }
  }
  .content{
    .white-block{
      width: 40%;
      aspect-ratio: 5/4;
      background-color: #f5f7fa;
      padding: 20px;
    }
  }
}
</style>