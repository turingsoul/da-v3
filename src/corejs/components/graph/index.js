/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/graph/widget.config'),
    classLoader: ()=>import('corejs/components/graph/widget.class')
}