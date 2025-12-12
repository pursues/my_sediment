<script setup lang="ts">
import userInputHook from './userInputHook'

const {
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
  motiveVisible,
  targetVisible,
  selectMotive,
  selectTarget,
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
} = userInputHook(emitInputHtml)
// 返回给父级元素，当前输入的内容
const emit = defineEmits(['inputContent']);
// 调用此方法返回给父组件
function emitInputHtml() {
  // 有值，并且不超过3000
  if(hasContent.value && !isShowMaxLength.value){  
    emit('inputContent', concatenateChildTexts(inputShowRef.value as HTMLElement));
  }
}

</script>


<template>
  <main class="card">
      <div class="ai-interface">
        <div class="prompt-container">
          <div 
            ref="promptInput"
            class="prompt-input" 
            contenteditable="true"
            @input="updateContent"
            @click="handleClick"
            @keydown="handleKeyDown"
            @paste="handlePaste"
          >
            <span v-if="!hasContent" class="prompt-placeholder">点击下方按钮，输入个性化关键词，生成专属学习路径</span>
            <div ref="inputShowRef" class="input-show line-height-[25px] overflow-auto" v-html="contentHtml"></div>
          </div>
          <div class="operate flex justify-between items-center">
            <div class="btn-list">
              <el-button class="input-btn" @click="gradeChange()">个人信息</el-button>
              <el-popover
                placement="bottom"
                title="学习动机"
                :width="300"
                popper-class="questionnaire-input-popover"
                trigger="click"
                :visible="motiveVisible"
                @show="motiveVisible = true"
                @hide="motiveVisible = false"
              > 
                <template #default>
                  <el-checkbox-group class="line-grid" v-model="selectMotive" :min="1" >
                    <el-checkbox v-for="(it, i) in motiveList" :key="i" :label="it" :value="it" />
                  </el-checkbox-group>
                  <div class="popover-footer">
                    <el-button size="small" class="cancel-btn" @click="motiveVisible = false">取消</el-button>
                    <el-button size="small" class="highlight-btn" @click="motiveChange()">确定</el-button>
                  </div>
                </template>
                <template #reference>
                  <el-button :class="{ 'input-btn': true, 'input-btn-highlight': motiveVisible }"  @click="initSelect('motive')">学习动机</el-button>
                </template>
              </el-popover>
              <el-popover
                placement="bottom"
                title="学习目标"
                :width="300"
                popper-class="questionnaire-input-popover"
                trigger="click"
                :visible="targetVisible"
                @show="targetVisible = true"
                @hide="targetVisible = false"
              > 
                <template #default>
                  <el-checkbox-group class="line-grid" v-model="selectTarget" :min="1" >
                    <el-checkbox v-for="(it, i) in targetList" :key="i" :label="it" :value="it" />
                  </el-checkbox-group>
                  <div class="popover-footer">
                    <el-button size="small" class="cancel-btn" @click="targetVisible = false">取消</el-button>
                    <el-button size="small" class="highlight-btn" @click="targetChange()">确定</el-button>
                  </div>
                </template>
                <template #reference>
                  <el-button :class="{ 'input-btn': true, 'input-btn-highlight': targetVisible }" @click="initSelect('target')">学习目标</el-button>
                </template>
              </el-popover>
            </div>
            <div class="send-icon flex items-center">
                <span v-if="isShowMaxLength" class="color-[#F56C6C] font-size-[12px] mr-[8px]">最多输入3000字，请删减字数</span>
                <div
                  class="i-study-send send-icon w-[27px] h-[27px] cursor-pointer"
                  :style="{
                    background: hasContent && !isShowMaxLength ? '#00D382' : '#6C6E72',
                  }"
                  @click="emitInputHtml"
                />
            </div>
          </div>
        </div>
        <div v-if="dropdownVisible" class="dropdown questionnaire-input-popover" :style="dropdownStyle">
          <template v-if="dropdownType === 'motive'">
            <el-checkbox-group class="line-grid" v-model="selectMotive" :min="1" >
              <el-checkbox v-for="(it, i) in motiveList" :key="i" :label="it" :value="it" />
            </el-checkbox-group>
          </template>
          <template v-else-if="dropdownType === 'target'">
            <el-checkbox-group class="line-grid" v-model="selectTarget" :min="1" >
              <el-checkbox v-for="(it, i) in targetList" :key="i" :label="it" :value="it" />
            </el-checkbox-group>
          </template>
          <div class="popover-footer">
            <el-button size="small" class="cancel-btn" @click="dropdownVisible = false">取消</el-button>
            <el-button size="small" class="highlight-btn" @click="dropdownChange(dropdownType)">确定</el-button>
          </div>
        </div>
      </div>
    </main>
</template>


<style lang="scss" scoped>
.card {
      // background: rgba(25, 25, 45, 0.8);
      border-radius: 12px;
      width: 800px;
      // box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      // backdrop-filter: blur(10px);
      // border: 1px solid rgba(100, 100, 200, 0.2);
      // overflow: hidden;
    }
    .ai-interface {
      position: relative;
    }
    .prompt-container {
      position: relative;
    }
    .prompt-input {
      width: 100%;
      min-height: 110px;
      // background: rgba(20, 20, 40, 0.7);
      background: #39393A;
      // border: 2px solid rgba(100, 100, 200, 0.3);
      border: 1px dashed rgba(0, 0, 0, 0.06);
      border-radius: 12px;
      padding: 12px;
      padding-bottom: 58px;
      font-size: 1.1rem;
      color: #E5EAF3;
      line-height: 1.6;
      outline: none;
      transition: border-color 0.3s;
      max-height: 360px;
      .input-show{
        max-height: 288px;
      }
    }
    .prompt-placeholder {
      position: absolute;
      top: 11px;
      left: 16px;
      line-height: 28px;
      color: #6C6E72;
      pointer-events: none;
    }
    :deep(.tag) {
      display: inline;
      background: rgba(0, 136, 88, 0.3);
      color:#1DBE7A;;
      padding: 2px 6px;
      border-radius: 6px;
      // border: 1px solid rgba(99, 102, 241, 0.5);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
      transition: all 0.2s;
      user-select: none;
      cursor: pointer;
      /* 确保每行都有独立的背景 */
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
      /* 允许内容换行 */
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      .tag-content{
        line-height: 25px;
        .tag-icon{
          display: inline-block;
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 4px solid #1DBE7A; /* 三角颜色 */
          border-bottom: 2px solid transparent;//用来控制高低位置
          margin-left: 4px;
        }
      }
      
    }
    .tag:hover {
      background: rgba(99, 102, 241, 0.3);
      box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
    }
    .tag i {
      margin-left: 8px;
      font-size: 0.9rem;
      color: #818cf8;
    }
    
    
    .operate {
      position: absolute;
      bottom: 10px;
      left: 13px;
      right: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .input-btn{
        color: #E5EAF3;
        border: 1px solid #4C4D4F;
        background: none;
        padding:5px 16px;
        margin-right: 8px;
        margin-left: 0;
        font-family: PingFang SC;
      }
      .input-btn-highlight{
        color: #1DBE7A;
        border: 1px solid #1DBE7A;
      }
      
    }
    .questionnaire-input-popover{
      .popover-footer{
        text-align: right;
        margin-top: 12px;
        .cancel-btn{
          background: none;
          border: 1px solid #4C4D4F;
          color: #E5EAF3;
        }
        .highlight-btn{
          color: #fff;
          border: 1px solid #1DBE7A;
          background: #2DB079;
        }
      }
    }
    .dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      background: #202121 !important;
      border: 1px solid #414243 !important;
      border-radius: 6px;
      z-index: 100;
      // box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      overflow: hidden;
      padding: 15px;
      .line-grid{
        display: inline-grid;
      }
    }
   
</style>