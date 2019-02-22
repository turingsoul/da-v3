/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/custom/widget.config'),
    classLoader: ()=>import('corejs/components/custom/widget.class')
}