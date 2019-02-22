/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/chartNestpie/widget.config'),
    classLoader: ()=>import('corejs/components/chartNestpie/widget.class')
}