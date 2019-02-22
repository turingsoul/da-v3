/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/olap/widget.config'),
    classLoader: ()=>import('corejs/components/olap/widget.class')
}