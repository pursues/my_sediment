import { ref, onMounted, nextTick } from 'vue'
// 处理输入框
export default function userInputHook(emitgetValueFun:Function) {
  // 容器
  const promptInput = ref<HTMLElement | null>(null);
  // 显示容器
  const inputShowRef = ref<HTMLElement | null>(null);
  // 输入容器
  const inputContainer = ref<HTMLElement | null>(null); 
  // const currentDropdown = ref(null);
  // 输入内容
  const contentHtml = ref('');
  // 是否有内容
  const hasContent = ref<boolean>(false);
  // 展示最大长度限制
  const isShowMaxLength = ref<boolean>(false)
  // 下拉菜单相关
  const dropdownVisible = ref<boolean>(false);
  // 用于标识下拉菜单类型
  const dropdownType = ref(''); 
  // 下拉菜单定位样式
  const dropdownStyle = ref({ top: '0', left: '0' });
  // 下拉菜单选项
  const dropdownItems = ref<string[]>([]);
  // 当前选中的标签
  const currentTag = ref<HTMLSpanElement | null>(null);
  // const gradeVisible = ref(false);
  const motiveVisible = ref(false);
  const targetVisible = ref(false);
  // 选择的年级、学习动机和学习目标
  // const selectGrade = ref('');
  const selectMotive = ref([]);
  const selectTarget = ref([]);
  // 年级、学习动机和学习目标选项列表
  // const gradeList = [
  //   '大一',
  //   '大二',
  //   '大三',
  //   '大四以上',
  // ]
  const motiveList = [
    '跟随技术趋势/拓宽视野',
    '为将来就业或实习/科研做准备',
    '希望跨学科应用AI 知识',
    '对算法或编程非常感兴趣，想深度研究',
  ]
  const targetList = [
    '熟练使用现有的智能工具',
    '能够独立完成小型AI项目',
    '希望用AI做好研究生或学术方向的储备',
    '深入学习算法、模型原理',
  ]
  const currentUser = ref({
    collegeName: '人工智能学院',
    trainLevel: '人工智能博士',
  })

  onMounted(() => {
    initializeContent();
  });


  // 初始化内容
  const initializeContent = () => {
    contentHtml.value = `<span class="first">&nbsp;</span>`;
    hasContent.value = false;
  };

  // 处理提示框点击
  // 处理点击事件
  const handleClick = (e: MouseEvent) => {
    // 如果点击了标签
    if (e.target && e.target instanceof HTMLElement && ((e.target as HTMLElement).closest('.tag') || (e.target as HTMLElement).classList.contains('tag'))) {
      // 获取点击时最近的类名为tag的高亮元素
      const tag = (e.target as HTMLElement).closest('.tag') ?? e.target;
      const type = (tag as HTMLElement).dataset.type as string;
      // 保存当前tag
      currentTag.value = tag as HTMLSpanElement;
      showDropdown(type ,e.clientX, e.clientY);
      e.preventDefault();
      e.stopPropagation();
    }else{
      // 如果点击了输入区域其他地方
      closeDropdown();
    }
    // 如果当前没有输入元素，则设置为最后一个
    if(!inputContainer.value){
      inputContainer.value = inputShowRef.value?.lastElementChild as HTMLElement || null;
      if(e.target !== inputContainer.value){
        placeCursorAfter(inputContainer.value);
      }
    }
  };
  // 显示下拉
  const showDropdown = async (type: string,x: number,y: number) => {
    const box = document.getElementsByClassName('ai-interface')[0];
    const rect = box.getBoundingClientRect();
    dropdownStyle.value = {
      top: `${y - rect.top + 10 }px`,
      left: `${x - rect.left + 10}px`
    };
    
    // if (type === 'grade') {
    //   dropdownItems.value = gradeList;
    // } else 
    if (type === 'motive') {
      dropdownItems.value = motiveList;
    } else if (type === 'target') {
      dropdownItems.value = targetList;
    }
    await nextTick();
    if(type === 'motive' || type === 'target'){
      dropdownType.value = type; // 设置下拉类型
      dropdownVisible.value = true;
    }
  };
  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent) => {
    // 删除
    if (e.key === 'Backspace' || e.keyCode === 8 || e.keyCode === 46) {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const startContainer = range.startContainer;
      // 获取可能被删除的元素
      const elementToDelete = getElementToDelete(range, e.keyCode);
      console.log('elementToDelete', elementToDelete);

      console.log('是否全选',isSelectionAllContent(inputShowRef.value as HTMLElement));
      // debugger
      // 判断是否为全选删除
      if (isSelectionAllContent(inputShowRef.value as HTMLElement)) {
        e.preventDefault();
        // 遍历清空显示容器内容
        if (inputShowRef.value) {
          while (inputShowRef.value.firstChild) {
            inputShowRef.value.removeChild(inputShowRef.value.firstChild);
          }
          // 初始化显示容器的内容
          const spanHTML = '<span class="first">&nbsp;</span>';
          inputShowRef.value.insertAdjacentHTML('afterbegin', spanHTML);

          inputContainer.value = inputShowRef.value?.lastElementChild as HTMLSpanElement || null;
          placeCursorAfter(inputContainer.value);
        }
        // 清空内容
        initializeContent();
        return;
      }
      // 判断是否是高亮元素
      if (elementToDelete && elementToDelete.classList.contains('tag')) {
        e.preventDefault(); // 阻止默认删除行为
        // 将选择的数据清除掉
        clearSelectedData(elementToDelete);
        // 获取高亮元素的前一个兄弟元素
        const prevElement = elementToDelete.previousElementSibling;
        // 创建事务以批量处理DOM更改
        document.execCommand('beginUndoUnit');
        // 先删除高亮元素
        elementToDelete.remove();
        // 
          //删完还得将光标定位到删除元素的前面一个元素的输入容器的最后
        if (prevElement) {
          inputContainer.value = prevElement;
          placeCursorAfter(prevElement);
        } else {
          inputContainer.value = inputShowRef.value?.lastElementChild as HTMLSpanElement || null;
          placeCursorAfter(inputContainer.value);
        }
      
        document.execCommand('endUndoUnit');
        // 更新内容显示
        updateContent();
      }else if (elementToDelete && elementToDelete.nodeType === 1) {
        // 此判断为删除元素节点的情况同时删除前面的高亮元素
        if (elementToDelete.textContent.trim() === '' //删除时判断判断并且元素内没有内容了，
            && elementToDelete.previousSibling // 有前一个兄弟节点
            && elementToDelete.previousSibling.nodeType === 3 // 前一个兄弟节点是文本节点
            &&elementToDelete.previousElementSibling.classList.contains('tag') // 并且前一个元素是否为高亮元素
            && elementToDelete.previousSibling.textContent.trim() === '' // 前一个兄弟节点的文本内容也是空的
          ) {
          // 阻止默认删除行为
          e.preventDefault();
          // 将光标定位到删除元素的前一个元素的输入容器的最后
          if (elementToDelete.previousElementSibling.previousElementSibling) {
            // 光标容器
            inputContainer.value = elementToDelete.previousElementSibling.previousElementSibling;
            // 光标定位
            placeCursorAfter(inputContainer.value);
          }
          // 清除要去掉高亮元素中选择的数据
          clearSelectedData(elementToDelete.previousElementSibling);
          // 删除高亮元素
          elementToDelete.previousElementSibling?.remove();
          // 删除当前元素
          elementToDelete.remove();
          // 更新内容显示
          updateContent();
        }else if (!elementToDelete.previousElementSibling // 没有前一个元素
          && (elementToDelete.nodeType === 1 && elementToDelete.textContent.trim() === '') // 当前元素是一个元素节点并且内容为空
          && isLastEmptyElement(inputShowRef.value as HTMLElement) // 当前显示容器内只有一个元素且此元素是空的
        ) {
          // debugger
          // 判断是否为最前面的一个元素，如果是的话，则不能删除
          hasContent.value = false;
          e.preventDefault();
          return false
        }else if(
          !elementToDelete.previousElementSibling // 没有前一个元素
          && elementToDelete.nodeType === 1 // 当前元素是一个元素节点
          && elementToDelete.textContent.length == 2 // 当前元素的内容长度为2，只有一个空格和一个即将要删除的节点
          && inputShowRef.value?.children.length === 1 // 当前显示容器内只有一个元素
        ) {
          // 删除到最前面一个first元素，并且显示容器内只有此元素，元素内只有默认的空格和即将要删除的元素
          // debugger
          // 写定时器的原因是在执行默认删除操作后才需要执行复原，因为在删除元素时，Vue可能还没有更新DOM，所以需要延迟执行
          setTimeout(() => {
            hasContent.value = false;
          }, 0); 

        }else if(elementToDelete.textContent.length === 1 && elementToDelete.previousElementSibling) {  
          // 当前情况删除是否为元素的的最后一个文本节点，并且判断是否有前一个元素，如果是的话，此元素删除，并且定位到前一个元素

          // 将光标定位到删除元素的前一个元素的输入容器的最后
          inputContainer.value = elementToDelete.previousElementSibling as HTMLElement || null;
          // 光标定位
          placeCursorAfter(inputContainer.value);
          // 阻止默认删除行为
          e.preventDefault();
          // 删除当前元素
          elementToDelete.remove();
          // 更新内容显示
          updateContent();
          // 还有种情况，如果当前元素时第一个元素first ,并且first元素的内容是空的（如果直接选择按钮信息填，那么第一个元素就是空的）
          if (inputContainer.value.classList.contains('first') 
            && isLastEmptyElement(inputShowRef.value as HTMLElement) 
            && (inputContainer.value?.textContent?.trim() == '') 
          ) {
            hasContent.value = false;
            return false
          }
        }
        
      }
      
      // 检查是否在标签前面
      // if (
      //   startContainer.previousSibling &&
      //   startContainer.previousSibling.nodeType === 1 &&
      //   (startContainer.previousSibling as Element).classList &&
      //   (startContainer.previousSibling as Element).classList.contains('tag')
      // ) {
      //   const tag = startContainer.previousSibling as Element;
      //   tag.remove();
      //   e.preventDefault();
      //   updateContent();
      // }

    }else if(e.key === 'Enter' || e.keyCode === 13) {
      // 回车确认
      e.preventDefault();
      emitgetValueFun()
    }
  };
  /**
   * 判断选区是否选择了整个内容
   */
  const isSelectionAllContent = (element: HTMLElement) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const clone = range.cloneContents();
    
    // 创建临时容器并插入克隆内容
    const tempContainer = document.createElement('div');
    tempContainer.appendChild(clone);
    
    // 比较内容是否与原元素一致（去除空白差异）
    const originalText = (element.textContent ?? '').trim();
    const selectedText = (tempContainer.textContent ?? '').trim();
    
    return originalText === selectedText;
  };
  /**
   * 检查是否只剩下一个空元素
   */
  const isLastEmptyElement = (editor:HTMLElement) => {
    // 获取编辑器的直接子节点
    const children = Array.from(editor.children);
    console.log('children', children);
    // 如果只有一个子节点
    if (children.length === 1) {
      const lastChild = children[0];
      
      // 检查该节点是否为空
      return isElementEmpty(lastChild as HTMLElement);
    }
    
    return false;
  };

  /**
   * 检查元素是否为空（没有可见内容）
   */
  const isElementEmpty = (element: HTMLElement) => {
    // 检查文本内容是否为空
    if (element.textContent && element.textContent.trim() !== '') {
      return false;
    }
    
    // 检查是否有非空的子元素
    const hasNonEmptyChild = Array.from(element.children).some(child => 
      !isElementEmpty(child as HTMLElement)
    );
    
    return !hasNonEmptyChild;
  };
  // 根据删除的高亮元素清除选择的数据
  const clearSelectedData = (element: { classList: { contains: (arg0: string) => any; }; }) => {
    // if (element.classList.contains('grade')) {
    //   selectGrade.value = '';
    // } else 
    if (element.classList.contains('motive')) {
      selectMotive.value = [];
    } else if (element.classList.contains('target')) {
      selectTarget.value = [];
    }
  }
  /**
   * 判断即将被删除的元素
   */
  const getElementToDelete = (range: Range, keyCode: number) => {
  // 非折叠选区（选中了内容）
    if (!range.collapsed) {
      const commonAncestor = range.commonAncestorContainer as Element;
      
      // 如果公共祖先节点是元素节点
      if (commonAncestor.nodeType === 1) {
        // 检查选区是否完全包含该元素
        if (isElementFullySelected(commonAncestor, range)) {
          return commonAncestor;
        }
        
        // 否则查找被部分选中的最深层元素
        return findDeepestPartiallySelectedElement(commonAncestor, range);
      }
      
      // 如果公共祖先节点是文本节点，返回其父元素
      return commonAncestor.parentElement;
    }
    
    // 折叠选区（光标） - 根据按键方向判断
    if (keyCode === 8) { // Backspace
      return getPreviousElement(range.startContainer, range.startOffset);
    } else { // Delete
      return getNextElement(range.endContainer, range.endOffset);
    }
  };

  /**
   * 检查元素是否被完全选中
   */
  const isElementFullySelected = (element: Node, range: { compareBoundaryPoints: (arg0: number, arg1: Range) => number; }) => {
    const elementRange = document.createRange();
    elementRange.selectNodeContents(element);
    return range.compareBoundaryPoints(Range.START_TO_START, elementRange) === 0 &&
          range.compareBoundaryPoints(Range.END_TO_END, elementRange) === 0;
  };

  /**
   * 查找被部分选中的最深层元素
   */
  const findDeepestPartiallySelectedElement = (parent: Element, range: Range) => {
    let deepestElement = parent;
    const children = Array.from(parent.children);
    
    for (const child of children) {
      if (range.intersectsNode(child)) {
        const nestedElement = findDeepestPartiallySelectedElement(child, range);
        if (nestedElement) {
          deepestElement = nestedElement;
        }
      }
    }
    
    return deepestElement;
  };

  /**
   * 获取光标前一个元素（用于Backspace）
   */
  const getPreviousElement = (node: Node, offset: number) => {
    // 处理文本节点
    if (node.nodeType === 3) {
      // 光标不在文本开头
      if (offset > 0) {
        return (node as ChildNode).parentElement;
      }
      
      // 光标在文本开头，查找前一个兄弟元素
      const prevSibling = (node as ChildNode).previousSibling;
      if (prevSibling) {
        return prevSibling.nodeType === 1 
          ? prevSibling 
          : (prevSibling as ChildNode).parentElement;
      }
      
      // 没有前一个兄弟，查找父元素的前一个兄弟
      return (node as ChildNode).parentElement?.previousElementSibling;
    }
    
    // 处理元素节点
    if (node.nodeType === 1 && offset > 0) {
      const child = (node as Element).childNodes[offset - 1];
      return child?.nodeType === 1 
        ? child 
        : (child as Element)?.previousElementSibling || node;
    }
    
    return (node as Element).previousElementSibling || (node as ChildNode).parentElement?.previousElementSibling;
  };

  /**
   * 获取光标后一个元素（用于Delete）
   */
  const getNextElement = (node: Node, offset: number) => {
      // 处理文本节点
      if (node.nodeType === 3) {
        // 光标不在文本末尾
        const textNode = node as Text;
        if (offset < textNode.length) {
          return node.parentElement;
        }
        // 光标在文本末尾，查找下一个兄弟元素
        const nextSibling = node.nextSibling;
        if (nextSibling) {
          return nextSibling.nodeType === 1 
            ? nextSibling 
            : (nextSibling as any).parentElement;
        }
        // 没有下一个兄弟，查找父元素的下一个兄弟
        return (node.parentElement as HTMLElement)?.nextElementSibling;
      }
      
      // 处理元素节点
      if (node.nodeType === 1 && offset < (node as Element).childNodes.length) {
        const child = (node as Element).childNodes[offset];
        return child?.nodeType === 1 
          ? child 
          : (child as any)?.parentElement || node;
      }
      return (node as any).nextElementSibling || (node.parentElement as HTMLElement)?.nextElementSibling;
    };
  // 关闭下拉菜单 所有的，包括年级、学习动机和学习目标
  const closeDropdown = () => {
    dropdownVisible.value = false;
    // gradeVisible.value = false;
    motiveVisible.value = false;
    targetVisible.value = false;
  };
  // 如果有高亮元素，但是在删除的时候通过全选或部分选择的方式删掉，那么需要清掉已选择的内容
  const initSelect = (type:string) => {
    // 判断显示容器中是否 不存在高亮元素
    const isNoTag = !(inputShowRef.value && inputShowRef.value.querySelector(`.${type}`))
    switch (type) {
      // case 'grade':
      //   // 打开年级下拉菜单
      //   gradeVisible.value = true;
      //   motiveVisible.value = false;
      //   targetVisible.value = false;
      //   // 如果没有高亮元素，则清空选择的年级
      //   isNoTag && (selectGrade.value = '');
      //   break;
      case 'motive':
        // 打开学习动机下拉菜单
        motiveVisible.value = true;
        // gradeVisible.value = false;
        targetVisible.value = false;
        // 如果没有高亮元素，则清空选择的学习动机
        isNoTag && (selectMotive.value = []);
        break;
      case 'target':
        // 打开学习目标下拉菜单
        targetVisible.value = true;
        motiveVisible.value = false;
        // gradeVisible.value = false;
        // 如果没有高亮元素，则清空选择的学习目标
        isNoTag && (selectTarget.value = []);
        break;
    }
  }
  // 显示某个下拉菜单
  // 选择年级
  const gradeChange = () => {
    // gradeVisible.value = false;
    // 判断是否已有个人信息
    currentTag.value = document.getElementsByClassName('grade')[0] as HTMLSpanElement || null;
    if (currentTag.value && currentTag.value.dataset.type === 'grade') {
      return false
      // 更新已有标签内容
      // const contentSpan = currentTag.value.querySelector('.tag-content');
      // if (contentSpan) {
      //   contentSpan.textContent = `${currentUser.value?.collegeName || ''}${currentUser.value?.trainLevel || ''}`;
      // }
      // placeCursorAfter(currentTag.value);
    } else {
      // 创建新的年级标签
      const tagHtml = `
        <span>我是来自</span>
        <span class="tag grade" contenteditable="false" data-type="grade">
          <span class="tag-content">${(currentUser.value?.collegeName || '') + '的' + (currentUser.value?.trainLevel || '')}</span>
        </span>
        <span contenteditable="true">&nbsp;</span>
      `;
      insertAtCursor(tagHtml,'grade');
    }
  };
  // 选择学习动机
  const motiveChange = () => {
    motiveVisible.value = false; // 关闭学习动机下拉菜单
    // 判断是否已有学习动机标签
    currentTag.value = document.getElementsByClassName('motive')[0] as HTMLSpanElement || null;
    if (currentTag.value && currentTag.value.dataset.type === 'motive') {
      // 更新已有标签内容
      const contentSpan = currentTag.value.querySelector('.tag-content');
      if(contentSpan){
        contentSpan.innerHTML = `${selectMotive.value.join(', ')}<span class="tag-icon"></span>`;
      }
      placeCursorAfter(currentTag.value);
    } else {
      // 创建新的学习动机标签
      const tagHtml = `
        <span>，我的学习动机是</span>
        <span class="tag motive" contenteditable="false" data-type="motive">
          <span class="tag-content">${selectMotive.value.join(', ')}<span class="tag-icon"></span></span>
        </span>
        <span contenteditable="true">&nbsp;</span>
      `;
      insertAtCursor(tagHtml,'motive');
    }
  };
  // 学习目标
  const targetChange = () => {
    targetVisible.value = false; // 关闭学习目标下拉菜单
    // 判断是否已有学习目标标签
    currentTag.value = document.getElementsByClassName('target')[0] as HTMLSpanElement || null;
    if (currentTag.value && currentTag.value.dataset.type === 'target') {
      // 更新已有标签内容
      const contentSpan = currentTag.value.querySelector('.tag-content');
      if(contentSpan){
        contentSpan.innerHTML = `${selectTarget.value.join(', ')}<span class="tag-icon"></span>`;
      }
      placeCursorAfter(currentTag.value);
    } else {
      // 创建新的学习目标标签
      const tagHtml = `
        <span>，我的学习目标是</span>
        <span class="tag target" contenteditable="false" data-type="target">
          <span class="tag-content">${selectTarget.value.join(', ')}<span class="tag-icon"></span></span>
        </span>
        <span contenteditable="true">&nbsp;</span>
      `;
      insertAtCursor(tagHtml,'target');
    }
  };
  // 输入框内点击高亮的下拉框确认
  const dropdownChange = (type:string) => {
    dropdownVisible.value = false;
    switch (type) {
      // case 'grade':
      //   gradeChange()
      //   break;
      case 'motive':
        motiveChange()
        break;
      case 'target':
        targetChange()
        break;
    }
  }
  /**
   * 在光标处插入HTML
   * * @param {string} html - 要插入的HTML内容
   * * @param {string} eleClassName - 插入元素的类名
   * */ 
  const insertAtCursor = async (html:string,eleClassName:string) => {
    // 如果没有，则设置为当前输入容器，并且将光标放在最后
    if(!inputContainer.value){
      inputContainer.value = inputShowRef.value?.lastElementChild as HTMLElement|| null;
      placeCursorAfter(inputContainer.value);
    }
    await nextTick();
    // 获取当前选区（光标/选中内容）
    // const sel = window.getSelection();
    // // 无选区则退出
    // if (sel.rangeCount === 0) return;
    // // 获取当前光标所在的 Range（范围）
    // const range = sel.getRangeAt(0);
    // // 清空当前 Range 内的内容（若有选中文字则删除）
    // range.deleteContents();
    // 构建要插入的 DOM 结构
    const div = document.createElement('div');
    // 将传入的 html 转为 DOM
    div.innerHTML = html;
    // 创建文档片段（提升插入性能）
    const frag = document.createDocumentFragment();
    
    while (div.firstChild) {
      // 把 div 内的节点转移到片段
      frag.appendChild(div.firstChild);
    }
    // 插入新元素
    // range.insertNode(frag);
    // 关键：因为是插入高亮模块，用 after 插入到兄弟位置，inputContainer.value 是光标所在的元素
    inputContainer.value?.after(frag); 
    // 获取插入的元素
    currentTag.value = document.getElementsByClassName(eleClassName)[0] as HTMLSpanElement || null;
    console.log('currentTag', currentTag.value);
    // 将光标定位到插入的高亮元素的下一个元素
    const nextElement = currentTag.value?.nextElementSibling;
    // 如果没有下一个元素，则设置为 null 正常情况下是必须有此元素的
    inputContainer.value = nextElement as HTMLSpanElement || null;
    if (nextElement) {
      placeCursorAfter(nextElement);
    }
    // 更新内容显示
    updateContent();
  };

  // 将光标放置在元素后面
  const placeCursorAfter = (element: Node | null,atEnd = true) => {
    if (!element) {
      console.warn('元素为null，无法放置光标');
      return;
    }

    const sel = window.getSelection();
    const range = document.createRange();
    
    // 处理空元素的特殊情况
    if (element.textContent === '' || element.childNodes.length === 0) {
      range.setStartAfter(element); // 定位到元素开始
      range.setEnd(element, 0);
    } else if (atEnd) {
      // 定位到元素末尾
      range.selectNodeContents(element);
      range.collapse(false); // false 表示定位到末尾
    } else {
      // 定位到元素开始
      range.setStartAfter(element);
      range.collapse(true);
    }
    // 清除当前选区
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
    // 设置焦点到元素上element.focus();
    (element as HTMLElement).focus();
  };

  // 更新内容显示
  const updateContent = () => {
    // wrapUserInputInSpan()
    const html = promptInput.value ? promptInput.value.innerHTML : '';
    if (html.trim() === '<br>' || html.trim() === '') {
      hasContent.value = false;
    } else {
      hasContent.value = true;
    }
    // 包含span元素的长度大于3000再来判断实际需要的内容长度，减少拼接方法的调用
    if(html.length > 3000){
      const texts = concatenateChildTexts(inputShowRef.value as HTMLElement);
      isShowMaxLength.value = texts.length > 3000;
    }else{
      isShowMaxLength.value = false;
    }

  };
  // 将子元素的文本内容连接起来
  const concatenateChildTexts = (element: HTMLElement) => {
    let text = '';
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent?.replace(/\s+/g, ' ').trim() || ''; 
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        text += concatenateChildTexts(child as HTMLElement);
      }
    });
    return text;
  };
  // 处理粘贴事件，去掉所有格式
  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault()
    
    // 获取剪贴板中的纯文本内容
    const text = event.clipboardData?.getData('text/plain') || ''
    
    // 如果有选中的文本，先删除选中内容
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
    }
    
    // 在光标位置插入纯文本
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const textNode = document.createTextNode(text)
      range.insertNode(textNode)
      
      // 将光标移动到插入文本的末尾
      range.setStartAfter(textNode)
      range.setEndAfter(textNode)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    
    // 触发内容更新
    updateContent()
  };     


  return {
    promptInput,
    inputShowRef,
    updateContent,
    handleClick,
    handleKeyDown,
    hasContent,
    contentHtml,
    dropdownVisible,
    dropdownType,
    dropdownStyle,
    // gradeVisible,
    motiveVisible,
    targetVisible,
    // selectGrade,
    selectMotive,
    selectTarget,
    // gradeList,
    motiveList,
    targetList,
    gradeChange,
    motiveChange,
    targetChange,
    dropdownChange,
    initSelect,
    isShowMaxLength,
    concatenateChildTexts,
    handlePaste,
  }
}