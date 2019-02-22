/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/chartDot/widget.config'),
    classLoader: ()=>import('corejs/components/chartDot/widget.class')
}