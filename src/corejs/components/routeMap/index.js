/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/routeMap/widget.config'),
    classLoader: ()=>import('corejs/components/routeMap/widget.class')
}