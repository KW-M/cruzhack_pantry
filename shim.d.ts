// shims-vue.d.ts
// more about https://github.com/vuejs/vue-next-webpack-preview/issues/5
declare module '*.vue' {
    import { ComponentOptions } from 'vue'
    var component: ComponentOptions
    export default component
}
