/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/multiselect/widget.config'),
    classLoader: ()=>import('corejs/components/multiselect/widget.class')
}