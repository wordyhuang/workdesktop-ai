import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Vue / ElementPlus / 图标库外置（peerDependencies，与宿主共享实例）
// axios 打包进产物

const externalGlobals = {
  vue: 'Vue',
  'element-plus': 'ElementPlus',
  '@element-plus/icons-vue': 'ElementPlusIconsVue'
}

const externalDeps = ['vue', 'element-plus', '@element-plus/icons-vue']

/**
 * 解析组件映射表，返回 { kebabName: entryFilePath }
 * 每个组件一个独立入口，支持子路径按需加载：
 *   import WdDataGrid from 'workdesktop-ai/data-grid'
 */
function getComponentEntries(): Record<string, string> {
  const mapPath = resolve(__dirname, 'src/entries/components-map.ts')
  const content = readFileSync(mapPath, 'utf-8')
  const entries: Record<string, string> = {}
  const re = /'([\w-]+)':\s*'([^']+)'/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    const name = m[1]
    entries[name] = resolve(__dirname, `src/entries/${name}.ts`)
  }
  return entries
}

/** ESM 输出文件名：主入口 index.esm.js；子入口 [name]/index.mjs */
function esmEntryFileNames(chunkInfo: { name: string }): string {
  if (chunkInfo.name === 'index') {
    return 'index.esm.js'
  }
  return `${chunkInfo.name}/index.mjs`
}

/** 组件 chunk 名（PascalCase）→ 子路径名（kebab-case），用于 CSS 按组件归档 */
const cssChunkToEntry: Record<string, string> = {
  DataGrid: 'data-grid',
  EditableGrid: 'editable-grid',
  DataForm: 'data-form',
  SearchPanel: 'search-panel',
  FormItem: 'form-item',
  SearchItem: 'search-item',
  AutoComplete: 'auto-complete',
  CheckboxList: 'checkbox-list',
  RadioList: 'radio-list',
  Switch: 'switch',
  Upload: 'upload',
  ImageUpload: 'image-upload',
  Panel: 'panel',
  Tips: 'tips',
  Drawer: 'drawer',
  Iframe: 'iframe',
  Viewer: 'viewer',
  Station: 'station'
}

/**
 * ESM CSS 输出：
 * - 基础样式（tokens + theme，被各入口共享引用）→ base.css
 * - 组件 scoped 样式 → [name]/style.css
 */
function esmAssetFileNames(assetInfo: { name?: string }): string {
  const name = assetInfo.name ?? ''
  if (name.endsWith('.css')) {
    const base = name.replace(/\.css$/, '')
    if (base === 'index' || base === 'style') return 'base.css'
    // chunk 名可能是 PascalCase（共享 chunk）或 kebab-case（直接打进入口）
    const pascal = base.charAt(0).toUpperCase() + base.slice(1)
    const kebab = cssChunkToEntry[base] || cssChunkToEntry[pascal]
    if (kebab) return `${kebab}/style.css`
  }
  return 'assets/[name]-[hash][extname]'
}

/**
 * 双产物构建：
 * - vite build              → ESM 多入口（主入口 + 27 个子入口，支持按需加载 + tree-shaking）
 * - vite build --mode umd   → UMD 单入口（script 标签全量引入）
 */
export default defineConfig(({ mode }) => {
  if (mode === 'umd') {
    return {
      plugins: [vue()],
      resolve: {
        alias: { '@': resolve(__dirname, 'src') }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: false, // 保留 ESM 产物
        sourcemap: true,
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'WorkDesktop'
        },
        rollupOptions: {
          external: externalDeps,
          output: {
            format: 'umd',
            name: 'WorkDesktop',
            entryFileNames: 'index.umd.js',
            assetFileNames: (assetInfo: { name?: string }) => {
              if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                return 'style.css'
              }
              return 'assets/[name]-[hash][extname]'
            },
            exports: 'named',
            globals: externalGlobals
          }
        }
      }
    }
  }

  // 默认：ESM 多入口
  return {
    plugins: [vue()],
    resolve: {
      alias: { '@': resolve(__dirname, 'src') }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      cssCodeSplit: true,
      lib: {
        entry: {
          index: resolve(__dirname, 'src/index.ts'),
          ...getComponentEntries()
        },
        name: 'WorkDesktop',
        formats: ['es']
      },
      rollupOptions: {
        external: externalDeps,
        output: {
          format: 'es',
          entryFileNames: esmEntryFileNames,
          chunkFileNames: 'chunks/[name]-[hash].mjs',
          assetFileNames: esmAssetFileNames,
          exports: 'named',
          globals: externalGlobals
        }
      }
    }
  }
})
