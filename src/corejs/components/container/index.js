/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/container/widget.config'),
    classLoader: ()=>import('corejs/components/container/widget.class')
}