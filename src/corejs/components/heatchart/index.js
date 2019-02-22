/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/heatchart/widget.config'),
    classLoader: ()=>import('corejs/components/heatchart/widget.class')
}