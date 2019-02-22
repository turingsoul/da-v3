/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/sankey/widget.config'),
    classLoader: ()=>import('corejs/components/sankey/widget.class')
}