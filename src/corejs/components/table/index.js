/**
 * 组件主文件
 */

export default {
    configLoader: ()=>import('corejs/components/table/widget.config'),
    classLoader: ()=>import('corejs/components/table/widget.class')
}