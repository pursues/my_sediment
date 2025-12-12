import { createApp } from 'vue'
import type { App as AppInstance } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// @ts-ignore
import zhCn from 'element-plus/es/locale/lang/zh-cn' // 引入中文语言包

import './assets/main.scss'

const app: AppInstance = createApp(App)
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.use(ElementPlus, { locale: zhCn });

// 挂载应用
app.mount('#app')
