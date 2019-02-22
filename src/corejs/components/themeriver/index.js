/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/themeriver/widget.config'),
    classLoader: ()=>import('corejs/components/themeriver/widget.class')
}