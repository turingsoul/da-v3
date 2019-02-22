/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/chartPie/widget.config'),
    classLoader: ()=>import('corejs/components/chartPie/widget.class')
}