/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/indexCard/widget.config'),
    classLoader: ()=>import('corejs/components/indexCard/widget.class')
}