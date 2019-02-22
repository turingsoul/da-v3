/**
 * 组件主文件
 */
export default {
    configLoader: ()=>import('corejs/components/migrateMap/widget.config'),
    classLoader: ()=>import('corejs/components/migrateMap/widget.class')
}