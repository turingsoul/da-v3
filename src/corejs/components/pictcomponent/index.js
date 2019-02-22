/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/pictcomponent/widget.config'),
    classLoader: ()=>import('corejs/components/pictcomponent/widget.class')
}