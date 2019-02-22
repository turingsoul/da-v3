/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/text/widget.config'),
    classLoader: ()=>import('corejs/components/text/widget.class')
}