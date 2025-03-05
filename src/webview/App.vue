<template>
  <div class="app-content">
    <div class="app-title">
      <h1>Image Tagger</h1>
      <div class="folder-ctl">
        <input class="fit-width" type="text" v-model="filePath"></input>
        <button @click="selectFile">打开</button>
        <button @click="batchGetImangeNames">刷新</button>
      </div>
    </div>
    <hr>
    <div class="app-workspace">
      <div class="app-left">
        <h2>图片清单（{{imgLoadCnt}}/{{imgTotalCnt}}）</h2>
        <div>
          <ul class="img-paths">
            <li v-for="(info, index) in imageList" :key="index">
              <button @click="setCurrentImage(info)">{{ info.name }}</button>
            </li>
          </ul>
        </div>  
      </div>
      <div class="app-right">
        <h2>图片预览</h2>
        <div>
          <img :src="currentImage.src" :alt="currentImage.name" />
        </div>
        <h2>图片描述</h2>
        <div>
          <textarea v-model="currentImage.tag" rows="10" cols="50"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { getVscode } from './utils';

const filePath = ref("");
const imageList = ref([]);
const currentImage = ref("");
const imgLoadCnt = ref(0);
const imgTotalCnt = ref(0);

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

const saveTag = (tagPath, tagContent) => {
  getVscode().postMessage({ command: "saveTag", path: tagPath, content: tagContent });
}


// 监听区

/**
 * 监听来自 VS Code 的消息
 */
function listenMessage() {
  window.addEventListener("message", (event) => {
    const { command } = event.data;
    console.debug('receive message:', command, event.data);

    // 目录路径变更通知
    if (command === "updateFilePath") {
      const path = event.data?.path || '';
      filePath.value = path; // 回填路径到输入框
    } 
    
    // 图片列表变更通知
    else if (command === "updateImgNames") {
      const imageNames = event.data?.imageNames || [];
      imageList.value = imageNames.map((name) => {
        return {
          name,
          src: '',
          tag: '',
          imgPath: '',
          tagPath: ''
        }
      });

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

    // 图片信息变更通知
    else if (command === "updateImgInfo") {
      const imgInfo = event.data?.info || {};
      const loadCnt = event.data?.loadCnt || 0;
      const totalCnt = event.data?.total || 0;

      const index = imageList.value.findIndex((item) => item.name === imgInfo.name);

      // 更新图片列表对应图片的src
      if (index !== -1) {
        imageList.value[index].src = imgInfo.src;
        imageList.value.splice(index, 1, imgInfo);

        // 更新加载进度
        imgLoadCnt.value = loadCnt;
        imgTotalCnt.value = totalCnt;
      }

      // 更新当前图片（如果匹配）
      if (currentImage.value.name === imgInfo.name) {
        currentImage.value = imgInfo;
      }
    }

    else {
      console.warn('command is ignored, because it is an unknown command:', command);
    }
  });
}

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
}

.app-title {
  width: 100%;
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
}

.app-left {
  min-width: 200px;
}

.app-right {
  flex: 1; 
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


</style>

