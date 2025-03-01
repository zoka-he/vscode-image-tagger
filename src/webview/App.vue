<template>
  <div class="app-content">
    <div class="app-title">
      <h1>Image Tagger</h1>
      <div class="folder-ctl">
        <input type="text" v-model="filePath"></input>
        <button @click="selectFile">打开</button>
        <button>刷新</button>
      </div>
    </div>
    <hr>
    <div class="app-workspace">
      <div class="app-left">
        <h2>图片清单</h2>
      </div>
      <div class="app-right">
        <h2>图片预览</h2>
        <h2>图片描述</h2>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getVscode } from './utils';

const filePath = ref("");

// 发送消息到 VS Code 扩展
const selectFile = () => {
  getVscode().postMessage({ command: "openFileDialog" });
};

onMounted(() => {
  // 监听来自 VS Code 的消息
  window.addEventListener("message", (event) => {
    const { command, path } = event.data;

    if (command === "updateFilePath") {
      filePath.value = path; // 回填路径到输入框
    }
  });

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
  width: 200px;
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


</style>

