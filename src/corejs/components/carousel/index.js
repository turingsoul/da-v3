/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/carousel/widget.config'),
    classLoader: ()=>import('corejs/components/carousel/widget.class')
}