/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/chartGauge/widget.config'),
    classLoader: ()=>import('corejs/components/chartGauge/widget.class')
}