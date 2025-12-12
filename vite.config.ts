import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import viteCompression from 'vite-plugin-compression'
// import basicSsl from '@vitejs/plugin-basic-ssl'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { visualizer } from 'rollup-plugin-visualizer'
import legacy from '@vitejs/plugin-legacy'
// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  // 设置环境变量来抑制 Sass 弃用警告
  process.env.SASS_DEPRECATION_WARNINGS = 'false'

  return defineConfig({
    plugins: [
      vue(),
      vueJsx(),
      viteCompression({
        threshold: 40000
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      legacy({
        targets: ['defaults', 'not IE 11', 'firefox >= 55', 'chrome >= 52', 'Edge >= 50']
      }),
      visualizer({
        gzipSize: true,
        brotliSize: true,
        emitFile: false,
        filename: 'analysis.html', //分析图生成的文件名
        open: true //如果存在本地服务端口，将在打包后自动展示
      })
      // basicSsl() // 本地启用https时使用
    ],
    // ✅ 配置 Sass/SCSS 处理选项，避免警告
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api', 'import'],
          additionalData: `@use "sass:math";`
        },
        sass: {
          silenceDeprecations: ['legacy-js-api', 'import']
        }
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },

    esbuild: {
      pure: mode == 'production' ? ['console.log'] : [], // 生产环境删除 console.log
      drop: mode == 'production' ? ['debugger'] : [] // 生产环境删除 debugger
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
          // childPage: resolve(__dirname, 'childPage.html'),
        },
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // antv 相关依赖单独分包
              if (id.includes('@antv/g6')) {
                return 'antv-g6'
              }
              // element-plus 单独分包
              if (id.includes('element-plus')) {
                return 'element-plus'
              }
              // markdown-it 单独分包
              if (id.includes('markdown-it')) {
                return 'markdown-it'
              }
              // vue 核心库单独分包
              if (id.includes('/vue/') || id.includes('/vue-router/') || id.includes('/pinia/')) {
                return 'vue-core'
              }
              // 其余全部打到 vendor
              return 'vendor'
            }
          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      hmr: {
        overlay: false
      }
    }
  })
}
