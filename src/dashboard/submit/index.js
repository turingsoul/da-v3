import _ from "lodash";
let dash;

export default class Submit {
    constructor(isKeep) {
        this.isKeep = isKeep;
        this.components = [];
        this.datasources = [];
        this.globalParam = {
            params: [],
            theme: {},
            saveInfo: {},
            globelProps: {},
            freshPeriod: {}
        };
        //数据绑定中业务数据集创建的计算字段是组件间通用的，所以需要存储
        this.databind = {};
        this.filename = "";
        dash = window.Dashboard;
    }
    init() {
        try {
            this.getCfgFromCmpManager();
        } catch (error) {
            console.warn("收集组件配置信息发生错误");
        }

        try {
            this.getQueryFromManager();
        } catch (error) {
            console.warn("收集数据源信息发生错误");
        }

        try {
            this.getGlobalParam();
        } catch (error) {
            console.warn("收集全局信息发生错误");
        }

        try {
            this.getDatabind();
        } catch (error) {
            console.warn("收集数据绑定信息发生错误");
        }
    }

    getCfgFromCmpManager() {
        const _this = this;
        dash.compManager.components.forEach(instance => {
            let cfg = _.cloneDeep(instance.getCfg());
            //擦除htmlObj
            cfg.htmlObj = null;
            //擦除里面data
            if (!_this.isKeep) {
                cfg.chartDefinition.data = {};
                cfg.chartDefinition.query && (cfg.chartDefinition.query.isNoQuery = false);
            } else {
                cfg.chartDefinition.query.isNoQuery = true;
            }
            this.components.push(cfg);
        });
    }

    getQueryFromManager() {
        Object.values(dash.queryManager.dataSource.container).forEach(
            queryInstance => {
                this.datasources.push(_.cloneDeep(queryInstance.getAllCfg()));
            }
        );
    }

    getGlobalParam() {
        // debugger;
        dash.globalParam.params.container.forEach(paramInstance => {
            this.globalParam.params.push(paramInstance.getAllCfg());
        });
        this.globalParam.theme = _.cloneDeep(
            dash.globalParam.globalParam.theme
        );
        this.globalParam.cssAndJs = _.cloneDeep(
            dash.globalParam.globalParam.cssAndJs
        );
        this.globalParam.saveInfo = _.cloneDeep(
            dash.globalParam.globalParam.saveInfo
        );
        this.globalParam.globelProps = _.cloneDeep(
            dash.globalParam.globalParam.globelProps
        );
        this.globalParam.freshPeriod = _.cloneDeep(
            dash.globalParam.globalParam.freshPeriod
        );
    }

    /**
     * 获取数据绑定中业务数据集创建的计算字段
     */
    getDatabind() {
        let calcField = dash.dataBind.calcField;
        this.databind = { calcField };
    }

    getCfg() {
        return {
            components: this.components,
            datasources: this.datasources,
            globalParam: this.globalParam,
            filename: this.filename,
            databind: this.databind
        };
    }
}
