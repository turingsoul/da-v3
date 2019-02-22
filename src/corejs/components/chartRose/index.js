/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/chartRose/widget.config'),
    classLoader: ()=>import('corejs/components/chartRose/widget.class')
}