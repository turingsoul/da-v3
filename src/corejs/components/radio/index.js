/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/radio/widget.config'),
    classLoader: ()=>import('corejs/components/radio/widget.class')
}