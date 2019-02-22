/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/select/widget.config'),
    classLoader: ()=>import('corejs/components/select/widget.class')
}