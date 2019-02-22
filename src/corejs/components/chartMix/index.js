/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/chartMix/widget.config'),
    classLoader: ()=>import('corejs/components/chartMix/widget.class')
}