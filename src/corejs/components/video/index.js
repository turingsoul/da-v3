/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/video/widget.config'),
    classLoader: ()=>import('corejs/components/video/widget.class')
}