/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/chartLine/widget.config'),
    classLoader: ()=>import('corejs/components/chartLine/widget.class')
}