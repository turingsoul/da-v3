/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/chartWordCloud/widget.config'),
    classLoader: ()=>import('corejs/components/chartWordCloud/widget.class')
}