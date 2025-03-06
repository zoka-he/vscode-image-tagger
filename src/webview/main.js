import './global.scss';  
import { createApp, ref } from 'vue'
import App from './App.vue'
import '@vscode/webview-ui-toolkit/dist/toolkit.js';
import { bindVscode, getVscode } from './utils';

document.addEventListener('DOMContentLoaded', () => {
    bindVscode();

    const app = createApp(App);
    app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('vscode-');
    app.mount('#app');


    // 发心跳
    setInterval(() => {
      getVscode().postMessage({ command: 'heartbeat' });
    }, 600);
});
