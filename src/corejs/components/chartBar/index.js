/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/chartBar/widget.config'),
    classLoader: ()=>import('corejs/components/chartBar/widget.class')
}