import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// Vite 库模式：输出 ESM + UMD 双产物
// Vue / ElementPlus / 图标库外置（peerDependencies，与宿主共享实例）
// axios 打包进产物

/** 样式统一汇总为单一 style.css（ESM/UMD 输出必须引用同一函数引用） */
const assetFileNames = (assetInfo: { name?: string }) => {
  if (assetInfo.name && assetInfo.name.endsWith('.css')) {
    return 'style.css'
  }
  return 'assets/[name]-[hash][extname]'
}

const externalGlobals = {
  vue: 'Vue',
  'element-plus': 'ElementPlus',
  '@element-plus/icons-vue': 'ElementPlusIconsVue'
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WorkDesktop'
    },
    rollupOptions: {
      external: ['vue', 'element-plus', '@element-plus/icons-vue'],
      output: [
        {
          format: 'es',
          entryFileNames: 'index.esm.js',
          exports: 'named',
          assetFileNames,
          globals: externalGlobals
        },
        {
          format: 'umd',
          name: 'WorkDesktop',
          entryFileNames: 'index.umd.js',
          exports: 'named',
          assetFileNames,
          globals: externalGlobals
        }
      ]
    }
  }
})
