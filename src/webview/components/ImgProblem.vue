<template lang="pug">
    div.img-problem-list
        div.img-warn(v-if="!props.imgInfo")
            p 未选择图片
        template(v-else)
            div.img-warn(v-if="extErr && newNameConflict")
                p 目标格式的文件已存在

            div.img-problem(v-if="sizeErr || extErr")
                p.img-problem-item(v-if="sizeErr") 尺寸错误：{{props.imgInfo?.width}}x{{props.imgInfo?.height}}
                p.img-problem-item(v-if="extErr") 格式错误：{{props.imgInfo?.ext}}
                button.danger(v-if="!newNameConflict" @click="backupAndFixSizeAndExt") 备份并修正

            div.img-problem(v-if="tagErr")
                p.img-problem-item(v-if="!props.imgInfo?.tag") 未打标
                p.img-problem-item(v-else) 缺少关键字：{{props.settings.tagKeyword}}

            div.img-no-problem(v-if="!sizeErr && !extErr && !tagErr")
                p 没有问题

</template>

<script setup>
import { defineProps, computed } from 'vue';
import { getVscode } from '../utils';

// 定义组件接收的 props
const props = defineProps({
    settings: {
        type: Object, // 假设 settings 是一个对象
        required: true // 表示该属性是必需的
    },
    imgInfo: {
        type: Object, // 假设 imgInfo 是一个对象
        required: true // 表示该属性是必需的
    },
    imgList: {
        type: Array, // 假设 imgList 是一个数组
        required: true // 表示该属性是必需的
    }
});

// 定义计算属性 sizeErr
const sizeErr = computed(() => props.imgInfo && (props.settings.targetHeight != props.imgInfo.height || props.settings.targetWidth != props.imgInfo.width));
const extErr = computed(() => props.imgInfo && (props.settings.targetExt != props.imgInfo.ext));
const tagErr = computed(() => props.imgInfo && props.settings.tagKeyword && !props.imgInfo.tag.includes(props.settings.tagKeyword));

const newNameConflict = computed(() => {
    // 校验输入
    if (typeof props.imgInfo?.name!== 'string' || typeof props.settings?.targetExt!== 'string' || !Array.isArray(props.imgList)) {
        return false;
    }
    const newFileName = props.imgInfo?.name.replace(/\.\w+$/, props.settings.targetExt);
    return props.imgList.some(img => img.name === newFileName);
});

function backupAndFixSizeAndExt() {
    getVscode().postMessage({
        command: 'backupImageAndFixSizeAndExt',
        imgPath: props.imgInfo?.imgPath, // 图片路径
        targetHeight: props.settings.targetHeight, // 目标高度
        targetWidth: props.settings.targetWidth, // 目标宽度
        targetExt: props.settings.targetExt // 目标格式
    });
}

</script>

<style lang="scss" scoped>
p {
    margin: 0;
    padding: 0;
    // 统一行高为 24px
    line-height: 24px; 
}

.img-problem {
    border: 1px solid #e74c3c; /* 使用更好看的红色 */
    color: #e74c3c; /* 使用更好看的红色 */
    background-color: rgba(231, 76, 60, 0.1); 
    border-radius: 4px;
    padding: 8px;
    position: relative;
    padding-left: 30px; /* 为角标留出空间 */
    margin-bottom: 10px;
}

.img-problem::before {
    content: '!';
    display: inline-block;
    width: 20px;
    // 统一高度为 24px
    height: 20px; 
    // 统一行高为 24px
    line-height: 24px; 
    line-height: 20px;
    text-align: center;
    background-color: #e74c3c; /* 使用更好看的红色 */
    color: white;
    border-radius: 50%;
    position: absolute;
    left: 8px;
    top: 8px;
}

.img-no-problem {
    border: 1px solid #2ecc71; /* 绿框 */
    color: #2ecc71; /* 绿字 */
    background-color: rgba(46, 204, 113, 0.1); 
    border-radius: 4px;
    padding: 8px;
    position: relative;
    padding-left: 30px; /* 为角标留出空间 */
    margin-bottom: 10px;
}

.img-no-problem::before {
    content: '✓';
    display: inline-block;
    width: 20px;
    // 统一高度为 24px
    height: 20px; 
    // 统一行高为 24px
    line-height: 24px; 
    text-align: center;
    background-color: #2ecc71; /* 绿色背景 */
    color: white;
    border-radius: 50%;
    position: absolute;
    left: 8px;
    top: 8px;
}

.img-warn {
    border: 1px solid #f39c12; /* 使用黄色 */
    color: #f39c12; /* 使用黄色 */
    background-color: rgba(243, 156, 18, 0.1); 
    border-radius: 4px;
    padding: 8px;
    position: relative;
    padding-left: 30px; /* 为角标留出空间 */
    margin-bottom: 10px;
}

.img-warn::before {
    content: '!';
    display: inline-block;
    width: 20px;
    height: 20px; 
    line-height: 24px;
    text-align: center;
    background-color: #f39c12; /* 使用黄色 */
    color: white;
    border-radius: 50%;
    position: absolute;
    left: 8px;
    top: 8px;
}
</style>