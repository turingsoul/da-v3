/**
 * 数据绑定模块
 * 提供数据集、字段查询、获取数据绑定组件实例等操作
 * create time 2018/8/27
 */
import service,{createSource} from "dashboard/modules/common/Service";
import Config from "dashboard/modules/common/Config";
import Util from "dashboard/modules/common/Util";
import $ from "jquery";
import DATABIND_CALC_FN_LIST from "dashboard/modules/common/config/DATABIND_CALC_FN_LIST";

const [config, util] = [new Config(),  new Util()];
const URLS = config.URLS;
const _ = util._;
let datasetListSource = null;
let datasetComponents = null;

let convergeFns;//聚合函数名称集合
try {
    convergeFns = DATABIND_CALC_FN_LIST.filter(item=>item.value === 'converge')[0].children.map(item=>item.name);
} catch (error) {
    convergeFns = [];
}

/**
 * 组件绑定数据集时各单元格状态基本校验，基本校验只对数量进行校验。
 * @param {Number} len 当前格子包含的字段数量
 * @param {Array} lenArr 当前格子组的字段数集合
 * @return {Object} {result, errmsg, accept} result{Boolean}校验结果 errmsg{String}校验错误信息 accept{Boolean}是否还能接收新的字段拖入
 */
export const commonValid = function(len,lenArr){
    let result = {
        accept: true,
        result: true,
        errmsg: ""
    };
    let { min, max } = this;
    if (min && len < min) {
        result.result = false;
        result.errmsg = this.tip ? this.tip : "至少需要" + min + "个字段";
    }

    if (max && len > max) {
        result.result = false;
        result.errmsg = "字段数量超出，最多允许" + max + "个字段";
    }

    if (max && len >= max) {
        result.accept = false;
    }

    return result;
}

const databind = {
    /**
    * 获取可绑定数据集的组件列表
    * ====================================================================================================================
    * 数据绑定配置配置信息
    * components[n] 数据绑定配置页面各组件，其具体配置属性如下：
    * type {String} 组件类型
    * show {Boolean} 组件图标是否展示 默认true
    * switch {Boolean} 是否可以切换至其他组件 默认true
    * iconClass {String} 组件图标对应类名
    * cells {Array} 组件支持的字段框集合
    * cells[n] {Object} 单个字段框配置对象
    * cells[n].collectType: 0 不可汇总 1 必须汇总 2 可汇总
    * cells[n].min 格子最少字段数量
    * cells[n].max 格子最多字段数量
    * cells[n].valid(len,lenArr) 格子内字段情况验证 len{Number}: 当前格子包含的字段数量 lenArr{Aray}: 当前格子组的字段数集合
    * allowFieldTypes {Array} 格子可接收字段的类型集合，如果不设置该字段则表示该格子不限制拖入字段的类型
    * ====================================================================================================================
    */
    getDatasetComponents(){
        if(datasetComponents !== null){
            return datasetComponents;
        }

        let comTypes = [];
        let comGroupList = window.Dashboard.componentList;
        let cfgComponent = window.Dashboard.cfgComponent;
        datasetComponents = [];

        for(let i=0;i<comGroupList.length;i++){
            let group = comGroupList[i];
            let coms = group.children || [];
            let cTypes = coms.map(item=>item.type);
            comTypes = comTypes.concat(cTypes);
        }

        comTypes.forEach(type=>{
            if(!cfgComponent[type]){
                return;
            }
            try {
                let config = cfgComponent[type];
                let { base, databind } = config;
                let item;

                if(!databind.dataset){
                    return;
                }

                item = Object.assign({
                    name: base.name,
                    type: base.type,
                    show: null,
                    switch: null,
                    iconClass: null,
                    cells: []
                },databind.dataset);

                //如果没有指定单元格校验函数，默认指定一个
                item.cells.forEach(v=>{
                    if(!v.valid){
                        v.valid = commonValid;
                    }
                });

                datasetComponents.push(item);
            } catch (error) {
                // console.log(error);
            }
        });

        return datasetComponents;
    },

    /**
     * 判断计算字段的内容是否包含聚合函数
     * @param {String} formulaStr 公式字符串
     */
    isConvergeField(formulaStr){
        let reg;
        if(convergeFns.length === 0){
            return false;
        }
        reg = new RegExp(convergeFns.join('|'),'');
        return reg.test(formulaStr);
    },

    /**
     * 查询数据集列表
     */
    getDatasetList() {
        let source = createSource();
        if(datasetListSource && datasetListSource.cancel){
            datasetListSource.cancel("canceled");
        }
        datasetListSource = source;
        return service({
            url:URLS.GET_DATASET_LIST,
            method:"get",
            params:{},
            cancelToken:source.token
        });
    },

    /**
     * 根据数据集查询对应字段信息
     * @param {String} name 数据集名称
     */
    getFieldsByDataset(name) {
        return service({
            url:URLS.GET_FIELDS_BY_DATASET,
            method:"get",
            params:{
                id: name
            }
        }).then(rep=>{
            //字段信息加入分组常规信息
            rep.data.categories.forEach(group => {
                if (group.columns) {
                    group.columns.forEach(field => {
                        field.__group = { ...group };
                        delete field.__group.columns;
                    });
                }
            });
            return { modelId: rep.data.id || "", fields: rep.data.categories || [] };
        });
    },

    /**
     * 将公式字符串中的name替换成对应的id
     * @param {String} str 公式字符串
     * @param {Object} contrast 公式中字段的信息集合
     */
    _replaceNameToId(str, contrast) {
        for (let key in contrast) {
            let item = contrast[key];
            str = str
                .split(key)
                .join("[" + [item.__group.id, item.id].join(".") + "]");
        }
        return str;
    },

    /**
     * 在公式字符串中，参数间连接符为逗号，替换为分号
     * @param {String} formulaStr 公式字符串
     */
    _replaceToSemicolon(formulaStr) {
        return (
            formulaStr
                //eg: FN([a.b], 2)
                .replace(/(\[.+?\..+?]\s*),(?=\s*.+?)/g, "$1;")
                //eg:FN('str', 2)
                .replace(/('.*?'\s*),(?=\s*.+?)/g, "$1;")
                //eg:FN("str", 2)
                .replace(/(".*?"\s*),(?=\s*.+?)/g, "$1;")
                //eg:FN(-1.2, 2)
                .replace(/([0-9.-]+\s*),(?=\s*.+?)/g, "$1;")
                //eg:FN(FN(1,2), 2)
                .replace(/(.?\)\s*),(?=\s*.+?)/g, "$1;")
        );
    },

    /**
     * 去掉数据集名字中的后缀
     * @param {String} name 数据集名字
     */
    removeDatasetSuffix(name){
        if(!name || typeof name !== 'string'){
            return name;
        }
        return name.replace(/\.xmi$/,'');
    },

    /**
     * 查询单个字段值
     * @param {Object} field 字段信息
     * @param {Object} dataset 数据集信息
     * @param {String} modelId modelId
     */
    getFieldValues(field, dataset, modelId) {
        field = util.deepClone(field);

        for (let key in field) {
            //删除多余字段等
            ["calcs", "__group"].forEach(item => {
                if (field[item]) {
                    delete field[item];
                }
            });
        }

        let params = {
            columns: [],
            domainName: dataset.name,
            modelId: modelId,
            //是否禁用去重
            disableDistinct: false
        };
        let config = {
            header: {
                "content-type": "application/x-www-form-urlencoded"
            }
        };
        if (field.calc === true) {
            let { formulaStr, contrast } = field;
            formulaStr = this._replaceNameToId(formulaStr, contrast);

            //参数间连接符为逗号，修改为分号
            formulaStr = this._replaceToSemicolon(formulaStr);

            params.columns.push({
                id: field.id,
                selectedAggType: "NONE"
            });
            params.calcColumns = [
                {
                    id: field.id,
                    name: field.name,
                    formula: formulaStr
                }
            ];
        } else {
            params.columns.push(field);
        }
        
        let queryString = JSON.stringify(params);
        queryString = util.enCodeQueryString(queryString);

        return service({
            url:URLS.DATA_QUERY,
            method:"post",
            data:`query=${queryString}&type=mql`,
            header: {
                "content-type": "application/x-www-form-urlencoded"
            }
        }).then(rep => {
            return rep.data;
        });
    },

    /**
     * 获取数据绑定页面组件实例对象
     */
    getDatabindComIns() {
        if (!Dashboard) {
            return;
        }
        return Dashboard.compManager.getComponent(
            "databind_component_id",
            true
        );
    },

    /**
     * 调用组件实例方法
     * @param {String} method 方法名称
     * @param {Array} args 参数集合
     */
    callComIns(method, args) {
        let ins = this.getDatabindComIns();
        if (!ins) {
            return;
        }
        return ins[method].call(ins, ...args);
    },

    /**
     * 获取系统参数列表
     */
    getGlobalParams() {
        let params = [];
        if (window.Dashboard && window.Dashboard.globalParam) {
            return window.Dashboard.globalParam.globalParam.params.container;
        }
        return params;
    },

    /**
     * 计算数据绑定弹窗组件列表最多能展示的组件图标个数
     * @param {Number} visibleLen 当前最多需要展示的组件图标个数
     */
    countComShowMax(visibleLen) {
        let totalW = $(".databind-component-visible").width();
        let moreBtnW = 20;
        let itemW = 38 + 10; //width 38 + margin 10
        let needW;
        if (!totalW || !visibleLen) {
            return null;
        }
        needW = itemW * visibleLen;
        if (needW > totalW) {
            return Math.floor((totalW - moreBtnW) / itemW);
        }
    }
};
export default databind;
