<template>
  <div class="html-edit"> 
    <EditHtml
      :htmlData="htmlData"
      class="markdown-content"
      ref="editHtmlRef"
    />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import EditHtml from './EditHtml.vue'

const editHtmlRef = ref<InstanceType<typeof EditHtml>>()


const htmlData = ref(`<div data-v-d3f63c61="" class="markdown-content"><h1 style="">2020 Pedagogicon Proceedings</h1>
      <h2 style="">Teaching Students Effective Learning Strategies</h2>
      <p style=""><strong>Authors:</strong> Hung-Tao M. Chen, Megan Thomas, and Katelyn McClure<br>
      <strong>Affiliation:</strong> Eastern Kentucky University</p>
      <hr>
      <h3 style="">Abstract</h3>
      <p>Much research has focused on the effect of learning strategies such as note-taking practice testing and highlighting. Previous research has found that practice tests and distributed practice are the most effective while elaborate interrogative, self-explanation, and summarization are moderately effective (Dunlosky et al., 2013).</p>
      <p>Other common strategies, such as summarization, are found to be ineffective. Many college students use these ineffective learning strategies, and it is therefore important to teach students to use good learning strategies.</p>
      <p>The current study compared a <strong>video-based teaching method</strong> on effective learning strategies versus a <strong>text-based method</strong>. Undergraduate students (n=109) were taught effective learning strategies via video or text instructions.</p>
      <p>Our results indicated that a text-based instruction method was more effective in conveying learning strategy information. Students’ enhanced understanding of learning strategies, however, did not translate into behavior-students still elected to utilize less-effective learning strategies likely because they required less effort.</p>
      <p>Implications for pedagogical practices are described in the discussion section.</p>
      <p><img src="https://fastly.picsum.photos/id/374/200/300.jpg?hmac=O7_6jZztETgk8S2eFcdlCNlqe50qS5u-OW5hs-EoNMo" alt="alt text" style=""></p>
      <hr>
      <h3>College students utilize a variety of learning strategies</h3>
      <p>College students utilize a variety of learning strategies such as:</p>
      <ul>
      <li>Re-reading the textbook</li>
      <li>Highlighting</li>
      <li>Engaging in practice testing</li>
      </ul>
      <p>Much research has been conducted to determine the effectiveness of these methods (Bjork et al., 2013; Weinstein et al., 2018). Many instructors have attempted to teach students effective learning strategies using videos from sources such as the Learning Scientists.</p>
      <p>The effectiveness of conveying good learning strategies through a video teaching method is yet to be determined. The current study compared a video-based teaching method versus a text-based teaching methodology and their effectiveness on promoting good learning strategies among college students.</p>
      <h3>Learning Strategies Examined</h3>
      <p>Students utilize a variety of learning strategies. A study by Dunlosky and colleagues (2013) examined <strong>10 of the most common learning strategies</strong>. These 10 strategies include:</p>
      <ol>
      <li><strong>Elaborative interrogation</strong> — generating an explanation for a concept</li>
      <li><strong>Self-explanation</strong> — linking new information to pre-existing information</li>
      <li><strong>Summarization</strong> — writing summaries of to-be-learned texts</li>
      <li><strong>Highlighting/underlining</strong> — marking potentially important portions of text</li>
      <li><strong>Keyword mnemonic</strong> — using keywords and mental imagery</li>
      <li><strong>Imagery use for text learning</strong> — forming mental images</li>
      <li><strong>Rereading</strong> — restudying text material again</li>
      <li><strong>Practice testing</strong> — self-testing or taking practice tests</li>
      <li><strong>Distributed practice</strong> — implementing a schedule of practice</li>
      <li><strong>Interleaved practice</strong> — mixing different kinds of problems</li>
      </ol>
      <h3>Research Methodology</h3>
      <p>The research was conducted with undergraduate students (n=109) who were randomly assigned to two groups:</p>
      <table>
      <thead>
      <tr>
      <th>Group</th>
      <th>Method</th>
      <th>Sample Size</th>
      </tr>
      </thead>
      <tbody>
      <tr>
      <td>Group A</td>
      <td>Video-based instruction</td>
      <td>54 students</td>
      </tr>
      <tr>
      <td>Group B</td>
      <td>Text-based instruction</td>
      <td>55 students</td>
      </tr>
      </tbody>
      </table>
      <h3>Key Findings</h3>
      <blockquote>
      <p>“Students’ enhanced understanding of learning strategies did not translate into behavior—students still elected to utilize less-effective learning strategies likely because they required less effort.”</p>
      </blockquote>
      <p>This finding highlights the gap between <strong>knowledge</strong> and <strong>application</strong> in educational contexts.</p>
      <h3>Implications for Practice</h3>
      <p>The results suggest that:</p>
      <ol>
      <li>Text-based instruction may be more effective than video-based instruction for teaching learning strategies</li>
      <li>Understanding learning strategies does not automatically lead to their implementation</li>
      <li>Students tend to choose easier methods over more effective ones</li>
      <li>Additional interventions may be needed to bridge the knowledge-behavior gap</li>
      </ol>
      <h3>References</h3>
      <ul>
      <li>Bjork, R. A., Dunlosky, J., &amp; Kornell, N. (2013). Self-regulated learning: Beliefs, techniques, and illusions. <em>Annual Review of Psychology</em>, 64, 417-444.</li>
      <li>Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., &amp; Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. <em>Psychological Science in the Public Interest</em>, 14(1), 4-58.</li>
      <li>Weinstein, Y., Madan, C. R., &amp; Sumeracki, M. A. (2018). Teaching the science of learning. <em>Cognitive Research: Principles and Implications</em>, 3(1), 2.</li>
      </ul>
      </div>`)



// 获取编辑后的html
const getHtmlContent = () => {
  return editHtmlRef.value?.getContent() || ''
}



</script>
<style scoped lang="scss">
.html-edit {
  width: 100%;
  height: 100%;
  // 由于上面的html是markdown格式拿过来的，所以需要在这里进行样式处理
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
</style>