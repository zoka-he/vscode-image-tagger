import './global.scss';  
import { createApp, ref } from 'vue'
import App from './App.vue'

const vscode = acquireVsCodeApi();

document.addEventListener('DOMContentLoaded', () => {
    const app = createApp(App);
    app.mount('#app');


    // const fileList = document.getElementById('file-list');
    // const imagePreview = document.getElementById('image-preview');
    // const textEditor = document.getElementById('text-editor');

    // const images = JSON.parse('{{imageList}}'); // 由 panel.ts 传递
    // images.forEach(file => {
    //     let btn = document.createElement('button');
    //     btn.innerText = file;
    //     btn.onclick = () => {
    //         imagePreview.innerHTML = `<img src="${file}" alt="${file}" width="100%">`;
    //         vscode.postMessage({ command: 'loadText', filePath: file.replace(/\.\w+$/, '.txt') });
    //     };
    //     fileList.appendChild(btn);
    // });

    // window.addEventListener('message', event => {
    //     if (event.data.command === 'displayText') {
    //         textEditor.value = event.data.text;
    //     }
    // });

    // textEditor.addEventListener('input', () => {
    //     vscode.postMessage({ command: 'saveText', filePath: currentImageTxt, text: textEditor.value });
    // });
});
