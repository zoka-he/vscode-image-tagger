<template lang="pug">
  div.app-content
    div.app-title
      h1 Image Tagger
      div.folder-ctl
        input.fit-width(type="text" v-model="filePath")
        button(@click="selectFile") 打开
        button(@click="batchGetImangeNames") 刷新
        //- button(@click="openExplorer") 召唤文件管理器

    div.app-cfg
      form
        label 目标图片格式：
        select(:style="{ width: '3rem' }" v-model="targetExt")
          option(v-for="option in extOptions" :value="option") {{ option }}
        
        label 目标图片尺寸：
        input(:style="{ width: '3rem' }" type="number" v-model="targetWidth")
        span x
        input(:style="{ width: '3rem' }" type="number" v-model="targetHeight")

        label 标签关键字：
        input(:style="{ width: '40rem' }" type="search" @input="debounceSetTagKeyword")

        button(@click="findInVscode") 在vscode中查找

    hr     

    div.app-workspace
      div.app-left
        h2 图片清单（{{imgLoadCnt}}/{{imgTotalCnt}}）
        div.list-wrap
          table
            tbody
              tr(v-for="(info, index) in imageList" :key="index" @click="setCurrentImage(info)"
              :class="{ 'is-current': info.name === currentImage?.name, 'is-err': checkImg(info).failCnt > 0 }" )
                td {{ index + 1 }}
                td {{ info.name }}
                td {{ info.ext }}
                td {{ info.width }} x {{ info.height }}
            
      div.app-middle
        div.app-middle-upper
          div.app-middle-upper-left
            div.img-ctl
              h2 图片预览
            div.img-wrap
              img(:src="currentImage?.src" :alt="currentImage?.name")
          div.app-middle-upper-right
            h2 图片问题
            ImgProblem(:settings="targetSettings" :imgInfo="currentImage" :imgList="imageList") // 传递所需的 props

        
        div.tag-ctl
          h2 图片描述
          button(:class="{ 'danger flash': mentionSaveTag }" @click="backupAndSaveTag") 备份并保存
        div.tag-wrap
          textarea.fit-width(v-model="currentTag" rows="6")
        
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { getVscode } from './utils';
import _ from 'lodash';
import ImgProblem from "./components/ImgProblem.vue";

const filePath = ref("");
const imageList = ref([]);
const currentImage = ref("");
const currentTag = ref("");

const imgLoadCnt = ref(0);
const imgTotalCnt = ref(0);

const targetExt = ref("jpg");
const targetWidth = ref(512);
const targetHeight = ref(512);
const tagKeyword = ref("");
const extOptions = ["jpg", "png", "bmp"];

const imgCheckMap = ref({});

// 基本动作区 

// 选择目录，“打开”按钮使用
const selectFile = () => {
  getVscode().postMessage({ command: "openFileDialog" });
};

/** 
 * 获取目录下的所有图片，“刷新”按钮以及目录变动时使用，并触发批量加载图片
 */ 
const batchGetImangeNames = () => {
  getVscode().postMessage({ command: "getImageNames", path: filePath.value });
};

/**
 * 加载图片内容
 * @param imgPath 图片路径
 */
const batchGetImangeInfo = () => {
  getVscode().postMessage({ command: "getImageInfos", path: filePath.value });
}

/**
 * 加载图片
 * @param imgPath 图片路径
 */
const setCurrentImage = (imgInfo) => {
  currentImage.value = imgInfo;
}

const loadTag = (tagPath) => {
  getVscode().postMessage({ command: "loadTag", path: tagPath });
}

const backupAndSaveTag = () => {
  getVscode().postMessage({ 
    command: "backupAndSaveTag", 
    imgPath: currentImage.value?.imgPath, 
    tagPath: currentImage.value?.tagPath,
    tag: currentTag.value 
  });
}

const openExplorer = () => {
  getVscode().postMessage({ command: "openExplorer", path: filePath.value });
}

const findInVscode = () => {
  getVscode().postMessage({ command: "findInVscode", dirPath: filePath.value, keyword: tagKeyword.value });
}

const checkImg = (imgInfo) => {
  // 检查图片是否符合要求
  const { ext, width, height, tag } = imgInfo;

  let checkState = {
    failCnt: 0,
    errExt: false,
    errSize: false,
    errTag: false,
  }

  if (ext !== targetExt.value) {
    checkState.failCnt++;
    checkState.errExt = true;
  }

  if (width!== targetWidth.value || height!== targetHeight.value) {
    checkState.failCnt++;
    checkState.errSize = true;
  }

  if (tagKeyword.value && !tag.includes(tagKeyword.value)) {
    checkState.failCnt++;
    checkState.errTag = true;
  }

  return checkState;
}

function debounceSetTagKeyword(event) {
  _.debounce(() => {
    tagKeyword.value = event.target.value;
  }, 200)();
}


// 监听区

/**
 * 处理根目录变更消息
 * @param event 消息事件
 */
function handleUpdateFilePath(event) {
  const path = event.data?.path || '';
  filePath.value = path; // 回填路径到输入框，触发整体更新
  getVscode().postMessage({ command: "setCurrentDir", path });
}

/**
 * 处理图片列表变更消息
 * @param event 消息事件
 */
function handleUpdateImgNames(event) {
  const imageNames = event.data?.imageNames || [];

  // 更新图片列表，仅更新name属性，其他属性置空
  imageList.value = imageNames.map((name) => {
    return {
      name,
      src: '',
      tag: '',
      imgPath: '',
      tagPath: ''
    }
  });

  // 重置加载进度
  imgLoadCnt.value = 0;
  imgTotalCnt.value = imageNames.length;

  // 清除掉tag过滤
  tagKeyword.value = '';

  // 重置img问题表
  imgCheckMap.value = {};

  // 顺带配置当前图片, 优先使用第一张图片, 否则置空，未补全的属性也置空
  let imgTemplate = {
    name: '',
    src: '',
    tag: '',
    imgPath: '',
    tagPath: ''
  }
  if (imageNames.length) {
    imgTemplate.name = imageNames[0];
  } 
  currentImage.value = imgTemplate;

  // 顺带加载图片信息
  batchGetImangeInfo();
}

/**
 * 处理图片信息变更消息
 * @param event 消息事件
 */ 
function handleUpdateImgInfo(event) {
  const imgInfo = event.data?.info || {};
  const loadCnt = event.data?.loadCnt;
  const totalCnt = event.data?.total;

  const indexName = imgInfo.oldName || imgInfo.name;
  const index = imageList.value.findIndex((item) => item.name === indexName);

  // 更新图片列表对应图片的src
  if (index !== -1) {
    imageList.value.splice(index, 1, imgInfo);
  }

  // 更新加载进度, 假如 event.data 真的有这两个值才更新，否则不更新
  if (loadCnt!== undefined) {
    imgLoadCnt.value = loadCnt;
  }

  if (totalCnt!== undefined) {
    imgTotalCnt.value = totalCnt;
  }

  // 更新当前图片（如果匹配）
  if (currentImage.value?.name === indexName) {
    currentImage.value = imgInfo;
  }
}

// 挂载消息处理函数
const handlerMap = {
  updateFilePath: handleUpdateFilePath,
  updateImgNames: handleUpdateImgNames,
  updateImgInfo: handleUpdateImgInfo
}

/**
 * 监听来自 VS Code 的消息
 */
function listenMessage() {
  window.addEventListener("message", (event) => {
    const { command } = event.data;
    console.debug('receive message:', command, event.data);

    let handler = handlerMap[command];
    if (handler) {
      handler(event);
    } else {
      console.warn('command is ignored, because it is an unknown command:', command);
    }
  });
}


// 计算属性区
const targetSettings = computed(() => {
  return {
    targetExt: targetExt.value,
    targetWidth: targetWidth.value,
    targetHeight: targetHeight.value,
    tagKeyword: tagKeyword.value,
  }
});

const mentionSaveTag = computed(() => {
  return currentTag.value !== currentImage.value?.tag;
});


// 更新链：
// 1. 初始化时，请求 VS Code 扩展的当前文件路径
// 2. 监听来自 VS Code 的消息，更新当前文件路径
// 3. 监听当前文件路径的变化，获取图片列表
// 4. 监听图片列表的变化，更新当前图片

// 监听 filePath 的变化,如有变化，则获取图片列表
watch(filePath, (newValue, oldValue) => {
  if (!newValue) {
    imageList.value = [];
  }

  batchGetImangeNames(newValue);
});

watch(currentImage, (newValue, oldValue) => {
  if (newValue) {
    currentTag.value = newValue.tag;
  }
});


// 生命周期区
onMounted(() => {
  // 监听来自 VS Code 的消息
  listenMessage();

  // 初始化时，请求 VS Code 扩展的当前文件路径
  getVscode().postMessage({ command: "getFilePath" });
});


</script>

<style lang="scss" scoped>
.app-content {
  display: flex;
  flex-direction: column;
  overflow: hidden auto;
  padding: 10px 20px;
  height: 100%;
  box-sizing: border-box;
}

.app-title {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;

  .folder-ctl {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    button, input {
      font-size: 1rem;
      padding: .6rem;
    }

    input {
      flex: 1;
    }
  }
}

.app-workspace {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: auto;
}

.app-left {
  min-width: 300px;
  padding: 0 10px 0 0;
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;

  div.list-wrap {
    flex: 1;
    overflow: auto; 
  }
}

.app-middle {
  flex: 1; 
  overflow: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-left: 20px;
}

.app-middle-upper {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: auto;
}

.app-middle-upper-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;

  .img-wrap {
    flex: 1; 
    overflow: hidden;
    text-align: center;

    img {
      height: 100%;
      margin: auto;
    }
  } 
}

.app-middle-upper-right {
  min-width: 300px;
  height: 100%;
  padding: 0 0 0 20px;
  overflow: auto; 
  box-sizing: border-box;
}

.app-cfg {
  form {
    display: flex;
    flex-direction: row;
    gap: 10px;

    label {
      font-size: 1.4rem;
    }
  }
}

.tag-ctl {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

h1 {
  font-size: 1.5rem;
}

hr {
  width: 100%; 
}

ul.img-paths {
  list-style-type: none;
  padding: 0;

  li {
    padding: 0;
    margin: 0;
  }
}

tr.is-current {
  background-color: #1E90FF;

  td {
    color: white;
  }
}

tr.is-err {
  td {
    color: red;
  }
}

</style>

