/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/chartFunnel/widget.config'),
    classLoader: ()=>import('corejs/components/chartFunnel/widget.class')
}