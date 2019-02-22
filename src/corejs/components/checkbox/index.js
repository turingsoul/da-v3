/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/checkbox/widget.config'),
    classLoader: ()=>import('corejs/components/checkbox/widget.class')
}