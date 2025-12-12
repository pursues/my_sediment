<template>
  <div class="markdown-preview">
    <EditMarkDown
      ref="editMarkdownRef"
      :markdown-content="markdownData"
    />
    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EditMarkDown from './EditMarkdown.vue'


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

const markdownPreview = ref('')


</script>

<style scoped lang="scss">
.markdown-preview {
  width: 100%;
  height: 100%;
}
</style>