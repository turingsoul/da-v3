/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/date/widget.config'),
    classLoader: ()=>import('corejs/components/date/widget.class')
}