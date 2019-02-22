/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/timeline/widget.config'),
    classLoader: ()=>import('corejs/components/timeline/widget.class')
}