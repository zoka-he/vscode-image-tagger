import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  root: 'src/webview', // 指定 Webview 前端代码的根目录
  define: {
    'process.env': {}
  },
  plugins: [
    vue()
  ],
  build: {
    outDir: path.resolve(__dirname, 'out', 'webview'), // 输出到 VS Code 插件的 out/webview 目录
    emptyOutDir: true, // 每次构建前清空输出目录
    lib: {
      entry: 'main.js', // 入口文件
      name: 'main', // 输出全局变量的名称
      fileName: 'main', // 输出的文件名
      formats: ['iife'], // 生成 IIFE（立即执行函数）格式的单文件
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // 让 Rollup 内联所有动态导入
      }
    }
  },
  server: {
    port: 5173, // 指定 Vite 开发服务器端口
    strictPort: true, // 如果端口被占用，则直接退出
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/webview') // 设置路径别名
    }
  },
  css: {
    preprocessorOptions: {
      // scss全局文件引入
      scss: {
        // additionalData: '@import "@/global.scss";'  //这行代码可能会导致报错
        // additionalData: '@use "@/global.scss" as *;' //建议使用这行代码
      },
    },
  },
});
