<template>
  <div class="mouse-copy-container">
    <div
      class="markdown-content"
      ref="markdownContentRef"
      v-html="processedMarkdown"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    ></div>


    <!-- markdown鼠标移入的弹窗操作 -->
    <el-popover
      ref="tablePopoverRef"
      :virtual-ref="virtualElement"
      placement="bottom-start"
      virtual-triggering
      v-model:visible="showPopover"
      popper-class="markdown-popover"
      :offset="2"
      >
      <div 
        class="action-buttons"
        @mouseenter="handlePopoverMouseEnter"
        @mouseleave="handlePopoverMouseLeave"
      >
        <!-- 表格操作 -->
        <template v-if="currentTargetType === 'table'">
          <div class="button-group">
            <span class="group-label">复制格式:</span>
            <el-button size="small" @click="handlePopoverEvent('table','latex')">LaTeX</el-button>
            <el-button size="small" style="margin-left: 0px;" @click="handlePopoverEvent('table','html')">HTML</el-button>
            <el-button size="small" style="margin-left: 0px;" @click="handlePopoverEvent('table','markdown')">Markdown</el-button>
            <el-button size="small" style="margin-left: 0px;" @click="handlePopoverEvent('table','tsv')">TSV</el-button>
          </div>
          <div class="button-group">
            <span class="group-label">下载:</span>
            <el-button size="small" @click="handlePopoverEvent('download','csv')">
              <el-icon><Download /></el-icon>
              CSV
            </el-button>
            <el-button size="small" style="margin-left: 0px;" @click="handlePopoverEvent('download','png')">
              <el-icon><Download /></el-icon>
              PNG
            </el-button>
          </div>
        </template>
        <!-- 图片操作 -->
        <template v-else-if="currentTargetType === 'image'">
          <el-button size="small" @click="handlePopoverEvent('image')">
            <el-icon><CopyDocument /></el-icon>
            复制图片
          </el-button>
        </template>
        <!-- 文本操作 -->
        <template v-else-if="currentTargetType === 'text'">
          <el-button size="small" @click="handlePopoverEvent('text')">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </template>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref,computed } from 'vue'
import MarkdownIt from 'markdown-it'
import { CopyDocument, Download } from '@element-plus/icons-vue'
import useMarkdown from './useCopy'

const {
  handleMouseMove,
  handleMouseLeave,
  handlePopoverMouseEnter,
  handlePopoverMouseLeave,
  handlePopoverEvent,
  virtualElement,
  showPopover,
  currentTargetType,
} = useMarkdown()



const markdownData = ref(`
# 2020 Pedagogicon Proceedings

## Teaching Students Effective Learning Strategies

**Authors:** Hung-Tao M. Chen, Megan Thomas, and Katelyn McClure  
**Affiliation:** Eastern Kentucky University

---

### Abstract

Much research has focused on the effect of learning strategies such as note-taking practice testing and highlighting. Previous research has found that practice tests and distributed practice are the most effective while elaborate interrogative, self-explanation, and summarization are moderately effective (Dunlosky et al., 2013). 

Other common strategies, such as summarization, are found to be ineffective. Many college students use these ineffective learning strategies, and it is therefore important to teach students to use good learning strategies. 

The current study compared a **video-based teaching method** on effective learning strategies versus a **text-based method**. Undergraduate students (n=109) were taught effective learning strategies via video or text instructions. 

Our results indicated that a text-based instruction method was more effective in conveying learning strategy information. Students' enhanced understanding of learning strategies, however, did not translate into behavior-students still elected to utilize less-effective learning strategies likely because they required less effort. 

Implications for pedagogical practices are described in the discussion section.

![alt text](https://fastly.picsum.photos/id/374/200/300.jpg?hmac=O7_6jZztETgk8S2eFcdlCNlqe50qS5u-OW5hs-EoNMo)

---

### College students utilize a variety of learning strategies

College students utilize a variety of learning strategies such as:
- Re-reading the textbook
- Highlighting 
- Engaging in practice testing

Much research has been conducted to determine the effectiveness of these methods (Bjork et al., 2013; Weinstein et al., 2018). Many instructors have attempted to teach students effective learning strategies using videos from sources such as the Learning Scientists. 

The effectiveness of conveying good learning strategies through a video teaching method is yet to be determined. The current study compared a video-based teaching method versus a text-based teaching methodology and their effectiveness on promoting good learning strategies among college students.

### Learning Strategies Examined

Students utilize a variety of learning strategies. A study by Dunlosky and colleagues (2013) examined **10 of the most common learning strategies**. These 10 strategies include:

1. **Elaborative interrogation** — generating an explanation for a concept
2. **Self-explanation** — linking new information to pre-existing information  
3. **Summarization** — writing summaries of to-be-learned texts
4. **Highlighting/underlining** — marking potentially important portions of text
5. **Keyword mnemonic** — using keywords and mental imagery 
6. **Imagery use for text learning** — forming mental images 
7. **Rereading** — restudying text material again
8. **Practice testing** — self-testing or taking practice tests
9. **Distributed practice** — implementing a schedule of practice 
10. **Interleaved practice** — mixing different kinds of problems

### Research Methodology

The research was conducted with undergraduate students (n=109) who were randomly assigned to two groups:

| Group | Method | Sample Size |
|-------|--------|-------------|
| Group A | Video-based instruction | 54 students |
| Group B | Text-based instruction | 55 students |

### Key Findings

> "Students' enhanced understanding of learning strategies did not translate into behavior—students still elected to utilize less-effective learning strategies likely because they required less effort."

This finding highlights the gap between **knowledge** and **application** in educational contexts.

### Implications for Practice

The results suggest that:

1. Text-based instruction may be more effective than video-based instruction for teaching learning strategies
2. Understanding learning strategies does not automatically lead to their implementation
3. Students tend to choose easier methods over more effective ones
4. Additional interventions may be needed to bridge the knowledge-behavior gap

### References

- Bjork, R. A., Dunlosky, J., & Kornell, N. (2013). Self-regulated learning: Beliefs, techniques, and illusions. *Annual Review of Psychology*, 64, 417-444.
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest*, 14(1), 4-58.
- Weinstein, Y., Madan, C. R., & Sumeracki, M. A. (2018). Teaching the science of learning. *Cognitive Research: Principles and Implications*, 3(1), 2.
`)

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})
// 处理后的markdown
const processedMarkdown = computed(() => {
  return md.render(markdownData.value)
})




</script>

<style scoped lang="scss">
.mouse-copy-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  .markdown-content {
    padding: 24px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    line-height: 1.6;
    color: #333;


    
    // 标题样式
    :deep(h1) {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #e1e4e8;
      color: #24292e;
    }
    
    :deep(h2) {
      font-size: 22px;
      font-weight: 600;
      margin: 24px 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #e1e4e8;
      color: #24292e;
    }
    
    :deep(h3) {
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0 12px 0;
      color: #24292e;
    }
    
    // 段落样式
    :deep(p) {
      margin: 0 0 16px 0;
      font-size: 14px;
      padding: 4px;
      line-height: 1.7;
    }
    
    // 列表样式
    :deep(ul), :deep(ol) {
      margin: 0 0 16px 0;
      padding-left: 24px;
      
      li {
        margin: 8px 0;
        font-size: 14px;
        line-height: 1.6;
      }
    }
    
    // 表格样式
    :deep(table) {
      width: 100%;
      margin: 16px 0;
      border-collapse: collapse;
      border-spacing: 0;
      
      th, td {
        padding: 8px 12px;
        border: 1px solid #d0d7de;
        text-align: left;
        font-size: 14px;
      }
      
      th {
        background-color: #f6f8fa;
        font-weight: 600;
      }
      
      tr:nth-child(even) {
        background-color: #f6f8fa;
      }
    }
    
    // 引用样式
    :deep(blockquote) {
      margin: 16px 0;
      padding: 0 16px;
      border-left: 4px solid #d0d7de;
      background-color: #f6f8fa;
      color: #656d76;
      
      p {
        margin: 8px 0;
        font-style: italic;
      }
    }
    
    // 代码样式
    :deep(code) {
      padding: 2px 4px;
      background-color: #f6f8fa;
      border-radius: 3px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 12px;
      color: #24292e;
    }
    
    :deep(pre) {
      padding: 16px;
      background-color: #f6f8fa;
      border-radius: 6px;
      overflow-x: auto;
      margin: 16px 0;
      
      code {
        padding: 0;
        background-color: transparent;
        border-radius: 0;
        font-size: 12px;
      }
    }
    
    // 水平分割线
    :deep(hr) {
      height: 0;
      margin: 24px 0;
      background-color: #e1e4e8;
      border: 0;
      border-bottom: 1px solid #e1e4e8;
    }
    
    // 强调样式
    :deep(strong) {
      font-weight: 600;
      color: #24292e;
    }
    
    :deep(em) {
      font-style: italic;
    }
    
    // 链接样式
    :deep(a) {
      color: #0969da;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
// 操作按钮样式
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .button-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    :deep(.el-button){
      margin-top: 0px !important;
    }
    .group-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }
    
    .el-button {
      justify-content: flex-start;
      
      .el-icon {
        margin-right: 4px;
      }
    }
  }
}
// 弹窗样式优化
:global(.markdown-popover) {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 8px !important;
  padding: 12px !important;
  margin-top: 2px !important;
  
  .el-popper__arrow::before {
    border-bottom-color: #ffffff !important;
  }
}
</style>