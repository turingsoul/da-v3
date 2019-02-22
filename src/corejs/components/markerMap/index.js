/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/markerMap/widget.config'),
    classLoader: ()=>import('corejs/components/markerMap/widget.class')
}