/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/heatMap/widget.config'),
    classLoader: ()=>import('corejs/components/heatMap/widget.class')
}