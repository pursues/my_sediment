<script setup lang="ts">
import markdownit from 'markdown-it'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { computed } from 'vue'

const props = defineProps<{
  content: any
  speaker?: string
  reference?: any
  index?: number
}>()

// 基础markdown-it配置
const md = markdownit({
  html: true,
  breaks: true,
  linkify: true,
})

// 在已渲染的HTML中查找并渲染LaTeX公式
function processLatexFormulas(htmlContent: string): {
  content: string
  formulaMap: Record<string, string>
} {
  let result = htmlContent
  const formulaMap: Record<string, string> = {}
  // 生成随机ID的函数
  const generateId = () => `LATEX_${Math.random().toString(36).substr(2, 9)}`

  try {
    // 先解码HTML实体，以便正确识别数学公式
    const unescapeHtml = (str: string) => {
      return str
        .replace(/<br\s*\/?>/gi, '\n') //将<br>标签转回换行符
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
    }

    result = unescapeHtml(result)

    // 直接处理各种格式的LaTeX公式
    // 重构格式返回
    if (/\$\$([^$]+?)\$\$/g.exec(result)) {
      // 处理 $$...$$（Markdown块级格式）
      result = result.replace(/\$\$([^$]+?)\$\$/g, (match, formula) => {
        try {
          const cleanFormula = formula.trim()
          console.log('渲染Markdown块级公式:', cleanFormula)
          const rendered = katex.renderToString(cleanFormula, {
            displayMode: true,
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false,
          })
          const id = generateId()
          formulaMap[id] = rendered
          return id
        } catch (error) {
          // console.warn('Markdown块级公式渲染失败:', formula, error)
          const errorHtml = `<div class="katex-error">公式错误: ${formula}</div>`
          const id = generateId()
          formulaMap[id] = errorHtml
          return id
        }
      })
    }
    if (/\$([^$]+?)\$/g.exec(result)) {
      // 处理$...$ (Markdown行内格式)
      result = result.replace(/\$([^$]+?)\$/g, (match, formula) => {
        try {
          const cleanFormula = formula.trim()
          // console.log('渲染Markdown行内公式:', cleanFormula)
          const rendered = katex.renderToString(cleanFormula, {
            displayMode: false,
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false,
          })
          const id = generateId()
          formulaMap[id] = rendered
          return id
        } catch (error) {
          console.warn('Markdown行内公式渲染失败:', formula, error)
          const errorHtml = `<span class="katex-error">公式错误: ${formula}</span>`
          const id = generateId()
          formulaMap[id] = errorHtml
          return id
        }
      })
    }

    if (/\\\[(.*?)\\\]/gs.exec(result)) {
      // 处理 \\[...\\]（LaTeX块级格式）\\无限加都可以
      // 引证也会进来，因为可能出现\\[[...\\]]这种情况
      // 引证格式[[...]]，就是要[[的前面禁止出现\
      if (/(?<!\\)\\\[\[(.*?)(?<!\\)\\\]\]/gs.exec(result)) {
        // 说明是深度阅读(引证) [[...]]
        // (?<!\\) - 负向后顾，确保前面没有反斜杠,防止匹配转义开括号 \[,\[\[ - 匹配开头的两个方括号,(.*?) 匹配任意字符，非贪婪模式,(?<!\\) 负向后顾，确保前面没有反斜杠,\]\] 匹配结尾的两个方括号
      } else {
        // console.log('result:', result)
        // debugger
        // 先清理\\[前面的空格
        result = result.replace(/(\n)(\s+)(\\\\\[)/g, '\n   ') //将换行符后面5个空格转为3个空格
        // result = result.replace(/\n {5}/g, '\n   ') //将换行符后面5个空格转为3个空格
        // console.log('result:', result)
        // debugger
        result = result.replace(/\\\[(.*?)\\\]/gs, (match, formula) => {
          try {
            // 更好地清理公式字符串
            let cleanFormula = formula.trim()
            const rendered = katex.renderToString(cleanFormula, {
              displayMode: true,
              throwOnError: false,
              errorColor: '#cc0000',
              strict: false,
              trust: true, // 允许更多LaTeX命令
              macros: {
                // 添加一些常用的宏定义
                '\\RR': '\\mathbb{R}',
                '\\NN': '\\mathbb{N}',
                '\\ZZ': '\\mathbb{Z}',
                '\\QQ': '\\mathbb{Q}',
                '\\CC': '\\mathbb{C}',
              },
            })
            const id = generateId()
            formulaMap[id] = rendered
            return id
          } catch (error) {
            console.warn('LaTeX块级公式渲染失败:', formula, error)
            const errorHtml = `<div class="katex-error">公式错误: ${formula}</div>`
            const id = generateId()
            formulaMap[id] = errorHtml
            return id
          }
        })
      }
    }
    if (/\\\((.+?)\\\)/g.exec(result)) {
      // 处理 \\(...\\)（LaTeX行内格式）\\无限加都可以
      result = result.replace(/\\\((.+?)\\\)/g, (match, formula) => {
        try {
          const cleanFormula = formula.trim()
          const rendered = katex.renderToString(cleanFormula, {
            displayMode: false,
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false,
          })
          const id = generateId()
          formulaMap[id] = rendered
          return id
        } catch (error) {
          // console.warn('LaTeX行内公式渲染失败:', formula, error)
          const errorHtml = `<span class="katex-error">公式错误(): ${formula}</span>`
          const id = generateId()
          formulaMap[id] = errorHtml
          return id
        }
      })
    }
    /***
     * 优化公式处理，
     * 原因是由于markdown-it处理公式时，会自动将公式中的反斜杠转义，
     * 导致公式无法正确渲染，进而多出了下面一堆处理单反斜杠的公式的方法，
     * 所以需要先处理公式，而因为优先处理公式，因为算法返回的公式是双反斜杠，所以在上面四个方法中处理，
     * 所以下面一堆处理单反斜杠的公式的方法则不需要了，删除掉
     * 而算法正常返回的公式为以下四种情况：
     * 1. $$...$$
     * 2. $...$
     * 3. \\[...\\]
     * 4. \\(...\\)
     * 所以使用上面四种处理公式的方法就够了
     * ****/
    // console.log('最终渲染结果:', result)
  } catch (error) {
    console.error('LaTeX处理错误:', error)
  }
  return { content: result, formulaMap }
}

const text2md = computed(() => {
  if (!props.content) return '<div></div>'

  const pattern = /\[\[(\d+)\]\]/g
  let _html = ''

  const patternPdf = /\[\[(\d+)(?:\]\[(\d+))*\]\]/g
  let _htmlPdf = ''

  if (props.content) {
    let content = props.content

    // markdown-it处理中文时的问题
    content = content.replaceAll('》**', '》** ')

    // 然后在HTML中处理LaTeX公式 （优化，先处理公式，再处理markdown-it）
    const latexResult = processLatexFormulas(content)
    // 使用markdown-it渲染，不处理公式
    _html = md.render(latexResult.content)

    // 将占位符替换为实际的LaTeX公式HTML
    Object.keys(latexResult.formulaMap).forEach((id) => {
      _html = _html.replace(new RegExp(id, 'g'), latexResult.formulaMap[id])
    })

    // console.log('html',_html)

    // 处理引用
    const reference = props.reference || []
    if (reference.length > 0) {
      if (reference[0].type === 'pdf' || reference[0].type === 'video') {
        _htmlPdf = _html.replace(patternPdf, (m, first, ...rest) =>
          [first, ...rest.slice(0, m.match(/\]\[/g)?.length || 0)]
            .map(
              (num) => `<span style="color:#00D382;cursor:pointer;margin-left:4px"
         data-msgindex="${
           props.index
         }" data-id="${num}" data-type="inner-ref">[*]</span>`,
            )
            .join(''),
        )
        return _htmlPdf
      } else {
        _html = _html.replace(
          pattern,
          `<span style="color:#00D382;cursor:pointer;margin-left: 4px" data-msgindex="${props.index}" data-id="$1" data-type="reference-ref">[*]</span>`,
        )
        return _html
      }
    }
  }
  return _html
})
</script>

<template>
  <div v-if="speaker === 'ai'" class="message-p markdown-container ai" v-html="text2md" />
  <div v-else class="message-p meMsg">
    {{ props.content }}
  </div>
</template>

<style scoped lang="scss">
.markdown-container {
  word-break: break-all;
}
// KaTeX样式配置
:deep(.katex) {
  color: #e5eaf3 !important;
  font-size: 1em !important;
  line-height: 1.4 !important;
}

:deep(.katex-display) {
  margin: 1em 0 !important;
  text-align: center !important;
  display: block !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
}

// 确保所有KaTeX内部元素使用正确颜色
:deep(.katex .katex-html) {
  color: #e5eaf3 !important;
}

:deep(.katex .base) {
  color: #e5eaf3 !important;
}

// 数学元素颜色
:deep(.katex .mord),
:deep(.katex .mbin),
:deep(.katex .mrel),
:deep(.katex .mop),
:deep(.katex .mopen),
:deep(.katex .mclose),
:deep(.katex .mpunct) {
  color: #e5eaf3 !important;
}

// 下标上标
:deep(.katex .msupsub) {
  color: #e5eaf3 !important;
}

:deep(.katex .msupsub .mord) {
  color: #e5eaf3 !important;
}

// 分数线
:deep(.katex .frac-line) {
  border-bottom-color: #e5eaf3 !important;
}

// 根号
:deep(.katex .sqrt .sqrt-line) {
  border-bottom-color: #e5eaf3 !important;
}

:deep(.katex .sqrt .sqrt-sign) {
  color: #e5eaf3 !important;
}

// 积分等大符号
:deep(.katex .mop.op-symbol) {
  color: #e5eaf3 !important;
}

// 错误样式
:deep(.katex-error) {
  color: #cc0000 !important;
  background-color: rgba(204, 0, 0, 0.1) !important;
  padding: 4px 8px !important;
  border-radius: 4px !important;
  border: 1px solid #cc0000 !important;
  display: inline-block !important;
  margin: 2px !important;
}

// 通用颜色覆盖
:deep(.katex *) {
  color: #e5eaf3 !important;
}

// 确保数学公式不被全局样式干扰
:deep(.katex) {
  font-family: KaTeX_Main, 'Times New Roman', serif !important;

  * {
    box-sizing: content-box !important;
  }
}

// 块级公式特别处理
:deep(.katex-display) {
  .katex {
    text-align: center !important;
  }
}
</style>
