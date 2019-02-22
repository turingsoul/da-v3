/**
 * 数据绑定弹窗 reducer
 * create time: 2018/8/28
 */
import Config from "dashboard/modules/common/Config";
import Util from "dashboard/modules/common/Util";
import dashboard from "../../../corejs";
import databindM from "dashboard/modules/business/databind";
import colTypeCfg from "dashboard/modules/common/colTypeCfg";
import { message } from "antd";
const [config, util] = [new Config(), new Util()];

/**
 * 判断字段类型
 * @param {String} type 原始类型
 */
function getFieldType(type) {
    return util.getRelFieldType(type);
}

//cell拖入filter
var dragCellToFilter = {};
//默认state配置
const DEFALT_STATE = {
    /**
     * @type {String} 模式，默认为数据集
     *  dataset-数据集 sql-自定义SQL查询
     */
    mode: "dataset",

    /**
     * @type {Object} 数据集信息
     * dataset.type {String} 选中的数据集type
     * dataset.name {String} 选中的数据集名称
     * dataset.list {Array} 数据集列表
     */
    dataset: {
        type: "",
        name: ""
    },
    sqlCfg: {
        query: "",
        jndi: "",
        param: {}
    },
    modelId: "",

    /**
     * @type {Object} 限制条件
     * limit.top {Number} 查询前多少条数据，默认100条
     */
    limit: {
        top: 100
    },

    /**
     * @type {Array} 当前选中数据集对应字段信息
     */
    fields: [],

    /**
     * @type {Array} 数据绑定支持的组件列表
     */
    components: [],

    /**
     * @type {Array} 组件对应可用字段集合框
     */
    cells: [],
    /**
     * @type {Array} 组件对应数据分组字段集合框
     */
    cloneCells: [],
    /**
     * @type {Boolean} 当前字段集合框验证结果
     */
    cellsValid: false,

    /**
     * @type {Object} 组件cfg
     */
    cellsConfig: {},

    /**
     * @type {Object} 组件筛选格子配置信息
     */
    filterConfig: {
        fields: []
    },

    /**
     * @type {Object} 筛选配置弹框
     * filterConfigPop.idx   {Number}   当前配置的筛选字段index
     * filterConfigPop.show  {Boolean}  是否显示配置弹框
     * filterConfigPop.field {Boolean}  当前配置筛选字段信息对象 {field,config,group}
     */
    filterConfigPop: {
        idx: null,
        show: false,
        field: null
    },
    /**
     * @type {Object} 组件cfg
     */
    component: {},

    /**
     * @type {Number} 数据绑定组件列表最多能显示的个数
     */
    componentShowMax: 5
};

function getDefaultComponent(type) {
    let theme = Dashboard.globalParam.globalParam.theme;
    return window.Dashboard.cfgComponent[type].cfg(theme);
}
/**
 * 将state中属性更新至于component属性中
 */
function updateComponent(state) {
    let { mode, component } = state;
    let { chartDefinition } = component;
    if (!chartDefinition) {
        return;
    }
    let { query } = chartDefinition;
    if (mode === "dataset") {
        query.type = "dataset";
        query.datasetSetting = {
            cellsConfig: state.cellsConfig,
            filterConfig: state.filterConfig,
            limit: state.limit,
            modelId: state.modelId,
            dataset: state.dataset
        };
    } else if (mode === "sql") {
        query.type = "sql";
        Object.assign(query, state.sqlCfg);
    }
}

export default (state = DEFALT_STATE, action = {}) => {
    const { type, payload } = action;
    state.noQuery = false;
    switch (type) {
        /**
         * 重置状态
         */
        case "RESET_STATE":
            {
                return {
                    ...state,
                    ...{
                        mode: "dataset",
                        dataset: {
                            type: "",
                            name: ""
                        },
                        sqlCfg: {
                            query: "",
                            jndi: "",
                            param: {}
                        },
                        modelId: "",
                        limit: {
                            top: 100
                        },
                        fields: [],
                        cells: [],
                        cellsConfig: {},
                        filterConfig: { fields: [] },
                        component: {}
                    }
                };
            }
            break;
        case "SET_STATE":
            {
                if (action.newState) {
                    return {
                        ...state,
                        ...action.newState
                    };
                }
                return { ...state };
            }
            break;
        case "SWITCH_MODE":
            {
                let { query } = state.component.chartDefinition;
                //数据模型切换 清空数据
                state.component.chartDefinition.data = {};
                let { mode } = state;
                if (action.mode === "dataset") {
                    query.type = "dataset";
                    query.datasetSetting = {
                        cellsConfig: state.cellsConfig,
                        filterConfig: state.filterConfig,
                        limit: state.limit,
                        modelId: state.modelId,
                        dataset: state.dataset
                    };
                } else if (action.mode === "sql") {
                    query.type = "sql";
                    Object.assign(query, state.sqlCfg);
                }

                return { ...state, mode: action.mode };
            }
            break;
        //更新计算字段
        case "UPDATE_CALC_FIELD":
            {
                let { id, field } = action;
                let { cellsConfig, filterConfig, cells } = state;
                let _isUpdate = false;
                let _update = function(fList, key) {
                    if (!fList || fList.length < 1) {
                        return;
                    }
                    fList.forEach(item => {
                        if (item.field.id === id) {
                            _isUpdate = true;
                            Object.assign(item.field, field);
                            item.config.editeName = item.config.cellName =
                                field.name;
                            let _cellCfg, cfg, _coloctionName;
                            //更新字段聚合
                            if (
                                databindM.isConvergeField(item.field.formulaStr)
                            ) {
                                Object.assign(item.config, {
                                    noShowJh: true,
                                    collect: "NONE"
                                });
                            } else {
                                _cellCfg = cells.find(e => e.valueKey === key);
                                cfg =
                                    colTypeCfg[
                                        _cellCfg.collectType.selectValue
                                    ];
                                cfg =
                                    cfg[getFieldType(item.field.type)] ||
                                    cfg["string"];
                                if (_cellCfg.collectType.selectValue != 0) {
                                    _coloctionName = cfg[0][0].name;
                                    cfg = cfg[0][0].value.split("-"); //聚合方式
                                    Object.assign(item.config, {
                                        [cfg[0]]: cfg[1],
                                        _coloctionName
                                    });
                                }
                                Object.assign(item.config, {
                                    noShowJh: false
                                });
                            }
                        }
                    });
                };

                for (let key in cellsConfig) {
                    let fields = cellsConfig[key].fields;
                    _update(fields, key);
                }

                _update(filterConfig.fields);

                if (_isUpdate) {
                    state.cellsConfig = { ...state.cellsConfig };
                    state.filterConfig = { ...state.filterConfig };
                    state = { ...state };
                }

                state.component = { ...state.component };

                return state;
            }
            break;
        //更新组件列表能显示的最大个数
        case "UPDATE_COM_SHOW_MAX":
            {
                let actived = state.component.type;
                let _components = databindM.getDatasetComponents();
                let visibleComponents = _components.filter(
                    item => item.show !== false
                );
                let visibleComponentsLen = visibleComponents.length;
                let comShowMax = databindM.countComShowMax(
                    visibleComponentsLen
                );
                if (comShowMax !== state.componentShowMax) {
                    return { ...state, componentShowMax: comShowMax };
                }
                return state;
            }
            break;
        /**
         * 更新组件cfg
         */
        case "UPDATE_CFG":
            {
                let { query } = state.component.chartDefinition;
                let ins = databindM.getDatabindComIns();
                let chartDefinition;
                let { mode } = state;
                if (ins) {
                    chartDefinition = ins.cfg.chartDefinition;
                    state.component.chartDefinition.data = chartDefinition.data;
                }
                let cellsConfigKeys = Object.keys(state.cellsConfig) || [];
                let cellToInd = {},
                    ind;
                cellsConfigKeys.forEach(e => {
                    cellToInd[e] = [];
                    state.cellsConfig[e].fields.map((ee, ii) => {
                        ind = ind === undefined ? 0 : ind + 1;
                        cellToInd[e].push(ind);
                    });
                });
                action.isSave && (query.isNoQuery = true);
                if (mode === "dataset") {
                    query.type = "dataset";
                    query.datasetSetting =
                        action.isSave && chartDefinition
                            ? chartDefinition.query.datasetSetting
                            : {
                                  cellsConfig: state.cellsConfig,
                                  filterConfig: state.filterConfig,
                                  limit: state.limit,
                                  modelId: state.modelId,
                                  dataset: state.dataset,
                                  cellToInd: cellToInd
                              };
                } else if (mode === "sql") {
                    query.type = "sql";
                    Object.assign(query, state.sqlCfg);
                }
                return { ...state };
            }
            break;
        /**
         * 改变数据TOPN
         * action.topN {Number} 新的TOPN
         */
        case "CHANGE_TOPN":
            {
                return Object.assign({}, state, {
                    limit: { top: action.topN }
                });
            }
            break;
        /**
         * 切换使用的图标类型
         * action.comType {String} 要切换成的图标类型
         */
        case "SWITCH_COMPONENT_TYPE":
            {
                let _components = databindM.getDatasetComponents();
                //根据类型匹配当前图标类型对应的单元格列表
                let _component = _components.filter(
                    item => item.type === action.comType
                )[0];
                if (!_component) {
                    return { ...state };
                }
                let cells = _component.cells, //新组件的cells
                    oldType = state.component.type, //旧组件类型
                    newType = _component.type; //新组件类型
                let newCellsConfig = {}; //新组件的配置
                var preCells = state.cells || []; //旧组件单元格
                var preCellsConfig = state.cellsConfig || {};
                cells.forEach(item => {
                    newCellsConfig[item.valueKey] = {
                        fields: []
                    };
                });
                var splitCells = { 0: [], 1: [], 2: [], jd: [], wd: [] };
                //其他切换到表格
                if (newType === "table") {
                    preCells.map(e => {
                        var _type = e.collectType.selectValue;
                        splitCells["2"] = splitCells["2"].concat(
                            preCellsConfig[e.valueKey].fields
                        );
                    });
                    splitCells["2"].map(e => {
                        !e.config.collect && (e.config.collect = "NONE");
                    });
                    cells.forEach(e => {
                        var _type = e.collectType.selectValue;
                        newCellsConfig[e.valueKey].fields = splitCells[
                            _type
                        ].splice(0, e.max || splitCells[_type].length);
                    });
                    //表格切换到其他
                } else if (oldType === "table") {
                    preCells.map(e => {
                        preCellsConfig[e.valueKey].fields.map(ee => {
                            var _ee = {};
                            if (ee.config.collect === "NONE") {
                                _ee.cellName = ee.config.cellName;
                                _ee.sort = ee.config.sort;
                                _ee.noShowJh = ee.config.noShowJh;
                                ee.config.editeName &&
                                    (_ee.config.editeName = ee.editeName);
                            } else {
                                Object.assign(_ee, ee.config);
                            }
                            _ee.isDataGroup = ee.config.isDataGroup;
                            _ee.dataGroup = ee.config.dataGroup;
                            splitCells[
                                ee.config.collect === "NONE" ? "0" : "1"
                            ].push(ee);
                            Object.keys(_ee).length && (ee.config = _ee);
                        });
                    });
                    //先满足allowFieldTypes的
                    cells.forEach(e => {
                        var _type = e.collectType.selectValue;
                        var arr = [],
                            max = e.max;
                        //取出数据
                        var _ceeels = splitCells["0"];
                        if (e.allowFieldTypes) {
                            _ceeels.map((item, ii) => {
                                e.allowFieldTypes.includes(
                                    getFieldType(item.field.type)
                                ) &&
                                    arr.length < max &&
                                    (arr = arr.concat(_ceeels.splice(ii, 1)));
                            });
                        }
                        newCellsConfig[e.valueKey].fields = arr;
                    });
                    cells.forEach(e => {
                        var _type = e.collectType.selectValue;
                        if (!e.allowFieldTypes) {
                            var _item = newCellsConfig[e.valueKey];
                            var _len = e.max || splitCells[_type].length;
                            if (_item.fields.length < _len) {
                                _item.fields = _item.fields.concat(
                                    splitCells[_type].splice(
                                        0,
                                        _len - _item.fields.length
                                    )
                                );
                            }
                        }
                    });
                    //地图之间相互切换
                } else if (/Map$/.test(oldType) && /Map$/.test(newType)) {
                    preCells.map(e => {
                        var _type = e.collectType.selectValue;
                        var pjd = /经度/.test(e.title),
                            pwd = /纬度/.test(e.title);
                        preCellsConfig[e.valueKey].fields.map(ee => {
                            _type = pjd ? "jd" : pwd ? "wd" : _type;
                            splitCells[_type] = splitCells[_type].concat(
                                preCellsConfig[e.valueKey].fields
                            );
                        });
                    });
                    cells.forEach(e => {
                        var _type = e.collectType.selectValue;
                        var pjd = /经度/.test(e.title),
                            pwd = /纬度/.test(e.title);
                        _type = pjd ? "jd" : pwd ? "wd" : _type;
                        newCellsConfig[e.valueKey].fields = splitCells[
                            _type
                        ].splice(0, e.max || splitCells[_type].length);
                    });
                    //地图切换到其他
                } else if (/Map$/.test(oldType)) {
                    preCells.map(e => {
                        preCellsConfig[e.valueKey].fields.map(ee => {
                            var _ee = {};
                            if (ee.config.collect === "NONE") {
                                _ee.cellName = ee.config.cellName;
                                _ee.sort = ee.config.sort;
                                ee.config.editeName &&
                                    (_ee.config.editeName = ee.editeName);
                            }
                            _ee.isDataGroup = ee.config.isDataGroup;
                            _ee.dataGroup = ee.config.dataGroup;
                            splitCells[
                                ee.config.collect === "NONE" ||
                                !ee.config.collect
                                    ? "0"
                                    : "1"
                            ].push(ee);
                            Object.keys(_ee).length && (ee.config = _ee);
                        });
                    });
                    cells.forEach(e => {
                        var _type = e.collectType.selectValue;
                        newCellsConfig[e.valueKey].fields = splitCells[
                            _type
                        ].splice(0, e.max || splitCells[_type].length);
                    });
                    //其他切换到地图
                } else if (/Map$/.test(newType)) {
                    preCells.map(e => {
                        preCellsConfig[e.valueKey].fields.map(ee => {
                            var _ee = {};
                            if (ee.config.collect === "NONE") {
                                _ee.cellName = ee.config.cellName;
                                _ee.sort = ee.config.sort;
                                ee.config.editeName &&
                                    (_ee.config.editeName = ee.editeName);
                            }
                            _ee.isDataGroup = ee.config.isDataGroup;
                            _ee.dataGroup = ee.config.dataGroup;
                            splitCells[
                                ee.config.collect === "NONE" ||
                                !ee.config.collect
                                    ? "0"
                                    : "1"
                            ].push(ee);
                            Object.keys(_ee).length && (ee.config = _ee);
                        });
                    });
                    //先满足allowFieldTypes的
                    cells.forEach(e => {
                        var _type = e.collectType.selectValue;
                        var arr = [],
                            max = e.max;
                        //取出数据
                        var _ceeels = splitCells["0"];
                        if (e.allowFieldTypes) {
                            _ceeels.map((item, ii) => {
                                e.allowFieldTypes.includes(
                                    getFieldType(item.field.type)
                                ) &&
                                    arr.length < max &&
                                    (arr = arr.concat(_ceeels.splice(ii, 1)));
                            });
                        }
                        newCellsConfig[e.valueKey].fields = arr;
                    });
                    cells.forEach(e => {
                        var _type = e.collectType.selectValue;
                        if (!e.allowFieldTypes) {
                            var _item = newCellsConfig[e.valueKey];
                            var _len = e.max || splitCells[_type].length;
                            if (_item.fields.length < _len) {
                                _item.fields = _item.fields.concat(
                                    splitCells[_type].splice(
                                        0,
                                        _len - _item.fields.length
                                    )
                                );
                            }
                        }
                    });
                } else {
                    preCells.map(e => {
                        var _type = e.collectType.selectValue;
                        splitCells[_type] = splitCells[_type].concat(
                            preCellsConfig[e.valueKey].fields
                        );
                    });
                    cells.forEach(e => {
                        var _type = e.collectType.selectValue;
                        newCellsConfig[e.valueKey].fields = splitCells[
                            _type
                        ].splice(0, e.max || splitCells[_type].length);
                    });
                }

                state.cellsValid = false;
                state.cells = cells;
                state.cellsConfig = newCellsConfig;

                if (action.cfg) {
                    state.component = action.cfg;
                } else {
                    let {
                        param,
                        rawParamsIds
                    } = state.component.chartDefinition.query;
                    //重置图表信息
                    state.component = {
                        ...getDefaultComponent(action.comType),
                        ...{
                            id: state.component.id,
                            layout: state.component.layout
                        }
                    };
                    state.component.chartDefinition.query.param = param;
                    state.component.chartDefinition.query.rawParamsIds = rawParamsIds;
                    updateComponent(state);
                }

                return Object.assign({
                    ...state
                });
            }
            break;
        //更新字段
        case "UPDATE_COMPONENT":
            {
                let _cells = [];
                for (let key in state.cellsConfig) {
                    _cells = _cells.concat(state.cellsConfig[key].fields);
                }
                _cells.forEach(e => {
                    if (e.field.id + "__" + e.group.id === action.id) {
                        Object.assign(e.config, {
                            dataGroup: action.dataGroupObj,
                            isDataGroup: true
                        });
                    }
                });
                state.cellsConfig = { ...state.cellsConfig };
                updateComponent(state);
                return { ...state };
            }
            break;
        //筛选字段自动弹窗
        case "FILTER_POP":
            {
                Object.assign(state.filterConfigPop, {
                    idx: action.idx,
                    show: action.show,
                    field: action.field
                });
                state.filterConfigPop = { ...state.filterConfigPop };
                return { ...state };
            }
            break;
        /**
         *字段之间的相互拖拽
         *
         */
        case "REPLACE_FIELD_TO_CELL":
            {
                var {
                    startType,
                    startInd,
                    stopType,
                    stopInd
                } = action.reverseObj;
                if (startInd !== undefined) {
                    if (startType === stopType) {
                        var _fields = state.cellsConfig[startType].fields;
                        if (startInd < stopInd) {
                            _fields.push(_fields[startInd]);
                            _fields.splice(startInd, 1);
                        } else {
                            var ttp = _fields.splice(startInd, 1)[0];
                            _fields.splice(stopInd, 0, ttp);
                        }
                    } else {
                        var spliceObj, _spliceObj;
                        if (startType !== "filter") {
                            spliceObj = state.cellsConfig[
                                startType
                            ].fields.splice(startInd, 1)[0];
                            _spliceObj = {
                                field: { ...spliceObj.field },
                                group: { ...spliceObj.group },
                                config: {
                                    sort: "none",
                                    ...action.cellCfg,
                                    dataGroup: {
                                        ...spliceObj.config.dataGroup
                                    },
                                    cellName:
                                        spliceObj.field.name +
                                        (action.cellCfg._coloctionName === "无"
                                            ? ""
                                            : "(" +
                                              action.cellCfg._coloctionName +
                                              ")")
                                }
                            };
                            action.cellCfg._coloctionName === "无" &&
                                (_spliceObj.config._coloctionName = "");
                        } else {
                            spliceObj = state.filterConfig.fields.splice(
                                startInd,
                                1
                            )[0];
                            _spliceObj = {
                                field: { ...spliceObj.field },
                                group: { ...spliceObj.group },
                                config: {
                                    sort: "none",
                                    ...action.cellCfg,
                                    cellName:
                                        spliceObj.field.name +
                                        (action.cellCfg._coloctionName === "无"
                                            ? ""
                                            : "(" +
                                              action.cellCfg._coloctionName +
                                              ")")
                                }
                            };
                            action.cellCfg._coloctionName === "无" &&
                                (_spliceObj.config._coloctionName = "");
                        }
                        state.cellsConfig[stopType].fields.splice(
                            stopInd,
                            0,
                            _spliceObj
                        );
                        //散点图添加逻辑 聚合方式
                        var _type = state.component.type;
                        var chartDotAsix, axis, axisCfg;
                        if (_type === "chartDot") {
                            if (["xAxis", "yAxis"].includes(stopType)) {
                                chartDotAsix =
                                    stopType === "yAxis" ? "xAxis" : "yAxis";
                                axis = state.cellsConfig[chartDotAsix];
                                axisCfg = axis.fields[0];
                                if (axisCfg) {
                                    axisCfg.config.collect !== "NONE" &&
                                        Object.assign(_spliceObj.config, {
                                            collect: "SUM",
                                            _coloctionName: "求和",
                                            cellName: _spliceObj.editeName
                                                ? _spliceObj.editeName
                                                : _spliceObj.field.name +
                                                  "(求和)"
                                        });
                                }
                            }
                        }
                        //----------------
                    }
                }
                state.cellsConfig = {
                    ...state.cellsConfig
                };
                state.filterConfig = {
                    ...state.filterConfig
                };
                //字段添加判断
                let _fieldsArr = [],
                    fieldsArr = [];
                Object.values(state.cellsConfig).forEach(e => {
                    _fieldsArr = _fieldsArr.concat(e.fields);
                });
                fieldsArr = _fieldsArr.filter(
                    item =>
                        item.field.type === "date" &&
                        (item.config.collect === undefined ||
                            item.config.collect === "NONE")
                );
                var fieldsArrLen = fieldsArr.length || 0;
                var hasTHB = Object.values(state.cellsConfig).find(
                    e =>
                        !!e.fields.find(item =>
                            /YearOnYear|RingRatio/.test(item.config.higsum)
                        )
                ); //是否有同环比
                if (hasTHB && fieldsArrLen > 1) {
                    message.error("同/环比计算只能使用1个日期数据!");
                }
                return { ...state };
            }
            break;
        /**
         * 将拖动字段添加至于字段框
         * action.valueKey {String} 接收字段框对应的valueKey
         * 做一次深度拷贝
         */
        case "ADD_FIELD_TO_CELL":
            {
                var selfcell = state.cells.find(
                    e => action.valueKey === e.valueKey
                );
                var { collectType } = selfcell;
                var selfselfConfig = { sort: "none" };
                var field;
                selfselfConfig = { ...selfselfConfig, ...action.defCfg };
                //计算字段添加
                if (
                    action.fields.calc &&
                    databindM.isConvergeField(action.fields.formulaStr)
                ) {
                    Object.assign(selfselfConfig, {
                        noShowJh: true,
                        collect: "NONE",
                        _coloctionName: "无"
                    });
                }
                selfselfConfig._coloctionName === "无" &&
                    (selfselfConfig._coloctionName = "");
                //配置名称--------
                if (selfselfConfig.editeName === undefined) {
                    selfselfConfig.cellName =
                        action.fields.name +
                        (selfselfConfig._coloctionName
                            ? "(" + selfselfConfig._coloctionName + ")"
                            : "");
                } else if (selfselfConfig.editeName !== undefined) {
                    selfselfConfig.cellName = selfselfConfig.editeName;
                }
                //表格单独处理
                if (state.component.type === "table") {
                    state.component.chartDefinition.query.isNoQuery = false;
                }

                //--------------
                field = {
                    config: {
                        ...selfselfConfig,
                        isDataGroup: action.isDataGroup
                    },
                    group: action.fields.__group,
                    field: { ...action.fields }
                };
                /* //添加最大最小值
                action.maxMin &&
                    Object.assign(selfselfConfig, {
                        dataGroup: {
                            max: action.maxMin.max,
                            min: action.maxMin.min,
                            length: action.maxMin.length
                        }
                    }); */
                // delete field.field.__group;
                state.cellsConfig[action.valueKey].fields.splice(
                    action.ind,
                    0,
                    field
                );
                state.cellsConfig = {
                    ...state.cellsConfig
                };
                //散点图添加逻辑 聚合方式
                var _type = state.component.type;
                var chartDotAsix, axis, axisCfg;
                if (_type === "chartDot") {
                    if (["xAxis", "yAxis"].includes(action.valueKey)) {
                        chartDotAsix =
                            action.valueKey === "yAxis" ? "xAxis" : "yAxis";
                        axis = state.cellsConfig[chartDotAsix];
                        axisCfg = axis.fields[0];
                        if (axisCfg) {
                            axisCfg.config.collect !== "NONE" &&
                                Object.assign(field.config, {
                                    collect: "SUM",
                                    _coloctionName: "求和",
                                    cellName: field.editeName
                                        ? field.editeName
                                        : field.field.name + "(求和)"
                                });
                        }
                    }
                }
                //----------------
                //字段添加判断
                let _fieldsArr = [],
                    fieldsArr = [];
                Object.values(state.cellsConfig).forEach(e => {
                    _fieldsArr = _fieldsArr.concat(e.fields);
                });
                fieldsArr = _fieldsArr.filter(
                    item =>
                        item.field.type === "date" &&
                        (item.config.collect === undefined ||
                            item.config.collect === "NONE")
                );
                var fieldsArrLen = fieldsArr.length || 0;
                var hasTHB = Object.values(state.cellsConfig).find(
                    e =>
                        !!e.fields.find(item =>
                            /YearOnYear|RingRatio/.test(item.config.higsum)
                        )
                ); //是否有同环比
                if (hasTHB && fieldsArrLen > 1) {
                    message.error("同/环比计算只能使用1个日期数据!");
                }
                return { ...state };
            }
            break;
        case "ADD_CLONE_CELLS": {
            state.cloneCells;
            return { ...state };
        }
        /**
         * 将拖动字段添加至于字段框
         */
        case "ADD_FIELD_TO_FILTER":
            {
                var field = {
                    config: {},
                    group: action.fields.__group,
                    field: { ...action.fields }
                };
                // delete field.field.__group;
                state.filterConfig.fields.splice(action.ind, 0, field);
                state.filterConfig = {
                    ...state.filterConfig
                };
                // }
                return { ...state };
            }
            break;
        /**
         * 切换数据集
         * action.payload.name {String} 选中的dataset
         */
        case "SWITCH_SELECTED_DATASET":
            {
                if (state.dataset.name !== payload.name) {
                    state.dataset = { ...state.dataset, ...payload };
                    for (let key in state.cellsConfig) {
                        state.cellsConfig[key].fields = [];
                    }
                    state.fields = [];
                    state.filterConfig.fields = [];

                    state.cellsConfig = { ...state.cellsConfig };
                    state.filterConfig = { ...state.filterConfig };
                }
                return { ...state };
            }
            break;
        /**
         * 设置数据集对应字段
         * action.payload {Array} 字段集合
         */
        case "SET_FIELDS":
            {
                state.fields = action.payload;
                return { ...state };
            }
            break;
        /**
         * 从字段框删除字段
         */
        case "DEL_FIELD_FROM_CELL":
            {
                if (action.idx !== undefined) {
                    var _item = state.cellsConfig[action.valueKey];
                    var removeItem = _item.fields.splice(action.idx, 1);
                    state.cellsConfig = {
                        ...state.cellsConfig
                    };
                    let _fieldsArr = [],
                        fieldsArr = [];
                    Object.values(state.cellsConfig).forEach(e => {
                        _fieldsArr = _fieldsArr.concat(e.fields);
                    });
                    fieldsArr = _fieldsArr.filter(
                        item =>
                            item.field.type === "date" &&
                            (item.config.collect === undefined ||
                                item.config.collect === "NONE")
                    );
                    var fieldsArrLen = fieldsArr.length || 0;

                    var hasTHB = Object.values(state.cellsConfig).find(
                        e =>
                            !!e.fields.find(item =>
                                /YearOnYear|RingRatio/.test(item.config.higsum)
                            )
                    ); //是否有同环比
                    if (hasTHB && !fieldsArrLen) {
                        message.error(
                            "同/环比计算必须使用日期数据，请拖入以下任意粒度的日期：年、季度、月、周、日!"
                        );
                    }
                }
                return { ...state };
            }
            break;
        /**
         * 编辑该字段
         */
        case "UPDATE_FIELD_FROM_CELL":
            {
                if (action.valueKey !== undefined) {
                    var _item = state.cellsConfig[action.valueKey].fields;
                    _item[action.idx].config[action.key] = action.value;
                    var _upffselfselfConfig = _item[action.idx].config;
                    let _fieldsArr = [],
                        fieldsArr = [],
                        fieldsArrLen;
                    Object.values(state.cellsConfig).forEach(e => {
                        _fieldsArr = _fieldsArr.concat(e.fields);
                    });
                    fieldsArr = _fieldsArr.filter(
                        item =>
                            item.field.type === "date" &&
                            (item.config.collect === undefined ||
                                item.config.collect === "NONE")
                    );
                    if (
                        action.key === "dataGroup" &&
                        action.value.model !== "none"
                    ) {
                        _upffselfselfConfig.collect = "NONE";
                        _upffselfselfConfig._coloctionName = "无";
                    }
                    fieldsArrLen = fieldsArr.length || 0;
                    if (
                        /YearOnYear|RingRatio/.test(action.value) &&
                        fieldsArrLen !== 1
                    ) {
                        fieldsArrLen < 1
                            ? message.error(
                                  "同/环比计算必须使用日期数据，请拖入以下任意粒度的日期：年、季度、月、周、日!"
                              )
                            : fieldsArrLen > 1
                            ? message.error("同/环比计算只能使用1个日期数据!")
                            : null;
                        _item[action.idx].config["higsum"] = "nonee";
                        return { ...state };
                    }
                    if (
                        /collect/.test(action.key) &&
                        action.value !== "NONE" &&
                        _fieldsArr.find(e =>
                            /YearOnYear|RingRatio/.test(e.config.higsum)
                        ) &&
                        fieldsArrLen < 1
                    ) {
                        message.error(
                            "同/环比计算必须使用日期数据，请拖入以下任意粒度的日期：年、季度、月、周、日!"
                        );
                    }
                    if (action.key === "collect") {
                        _item[action.idx].config["_coloctionName"] =
                            action.name;
                        action.value === "NONE" &&
                            (_item[action.idx].config["higsum"] = "nonee");
                        action.value !== "NONE" &&
                            _item[action.idx].config.dataGroup &&
                            Object.assign(_item[action.idx].config.dataGroup, {
                                model: "none"
                            });
                    }
                    //配置名称-------

                    _upffselfselfConfig._coloctionName === "无" &&
                        (_upffselfselfConfig._coloctionName = "");
                    if (_upffselfselfConfig.editeName === undefined) {
                        _upffselfselfConfig.cellName =
                            _item[action.idx].field.name +
                            (_upffselfselfConfig._coloctionName
                                ? "(" + _upffselfselfConfig._coloctionName + ")"
                                : "");
                    } else if (_upffselfselfConfig.editeName !== undefined) {
                        _upffselfselfConfig.cellName =
                            _upffselfselfConfig.editeName;
                    }
                    //------
                    //排序清除
                    if (action.key === "sort" && action.value !== "none") {
                        Object.keys(state.cellsConfig).map(e => {
                            e != action.valueKey &&
                                state.cellsConfig[e].fields.forEach(item => {
                                    item.config.sort = "none";
                                });
                        });
                    }
                    state.cellsConfig = {
                        ...state.cellsConfig
                    };
                    //散点图添加逻辑 聚合方式
                    var _type = state.component.type;
                    var chartDotAsix, axis, axisCfg;
                    if (_type === "chartDot") {
                        if (
                            ["xAxis", "yAxis"].includes(action.valueKey) &&
                            action.key === "collect"
                        ) {
                            chartDotAsix =
                                action.valueKey === "yAxis" ? "xAxis" : "yAxis";
                            axis = state.cellsConfig[chartDotAsix];
                            axisCfg = axis.fields[0];
                            if (action.value === "NONE" && axisCfg) {
                                Object.assign(axisCfg.config, {
                                    collect: "NONE",
                                    _coloctionName: "",
                                    cellName: axisCfg.config.editeName
                                        ? axisCfg.config.editeName
                                        : axisCfg.field.name
                                });
                            } else if (axisCfg) {
                                axisCfg.config.collect === "NONE" &&
                                    Object.assign(axisCfg.config, {
                                        collect: "SUM",
                                        _coloctionName: "求和",
                                        cellName: axisCfg.editeName
                                            ? axisCfg.editeName
                                            : axisCfg.field.name + "(求和)"
                                    });
                            }
                        }
                    }
                    //----------------
                }
                if (
                    state.component.type === "chartNestpie" &&
                    action.key === "sort" &&
                    action.value !== "none"
                ) {
                    window.updateAction = action;
                }

                return { ...state };
            }
            break;
        /**
         * 从筛选框删除字段
         */
        case "DEL_FIELD_FROM_FILTER":
            {
                if (action.idx !== undefined) {
                    state.filterConfig.fields.splice(action.idx, 1);
                    state.filterConfig = {
                        ...state.filterConfig
                    };
                }
                return { ...state };
            }
            break;
        case "REVERSE_FIELD_TO_FILTER":
            {
                var {
                    startType,
                    startInd,
                    stopType,
                    stopInd
                } = action.filterObj;
                if (startInd !== undefined) {
                    if (startType === stopType) {
                        var _fields = state.filterConfig.fields;
                        if (startInd < stopInd) {
                            _fields.push(_fields[startInd]);
                            _fields.splice(startInd, 1);
                        } else {
                            var ttp = _fields.splice(startInd, 1)[0];
                            _fields.splice(stopInd, 0, ttp);
                        }
                    } else {
                        var spliceObj = state.cellsConfig[
                            startType
                        ].fields.splice(startInd, 1);
                        state.filterConfig.fields.splice(
                            stopInd,
                            0,
                            action.field
                        );
                    }
                }
                state.filterConfig = {
                    ...state.filterConfig
                };
                state.cellsConfig = {
                    ...state.cellsConfig
                };
                return { ...state };
            }
            break;
        case "LISTENER_REVERSE_FIELD_TO_FILTER":
            {
                dragCellToFilter.filterObj = action.filterObj;
                dragCellToFilter.field = action.field;
                state.filterConfig.fields.splice(
                    action.filterObj.stopInd,
                    0,
                    action.field
                );
                state.noQuery = true;
                state.filterConfig = {
                    ...state.filterConfig
                };
                return { ...state };
            }
            break;
        case "TRIGGER_LISTENER_REVERSE_FIELD_TO_FILTER":
            {
                if (
                    action.isSave &&
                    dragCellToFilter.filterObj &&
                    dragCellToFilter.filterObj.startInd
                ) {
                    var {
                        startType,
                        startInd,
                        stopType,
                        stopInd
                    } = dragCellToFilter.filterObj;
                    var spliceObj = state.cellsConfig[startType].fields.splice(
                        startInd,
                        1
                    );
                } else if (
                    !action.isSave &&
                    dragCellToFilter.filterObj &&
                    dragCellToFilter.filterObj.startInd
                ) {
                    var {
                        startType,
                        startInd,
                        stopType,
                        stopInd
                    } = dragCellToFilter.filterObj;
                    state.filterConfig.fields.splice(stopInd, 0);
                }
                state.filterConfig = {
                    ...state.filterConfig
                };
                state.cellsConfig = {
                    ...state.cellsConfig
                };
                dragCellToFilter = {};
                return { ...state };
            }
            break;
        /**
         * 修改筛选框中字段的配置
         */
        case "UPDATE_FIELD_FROM_FILTER":
            {
                if (action.idx !== undefined) {
                    var _action = state.filterConfig.fields[action.idx];
                    _action ||
                        (_action = state.filterConfig.fields[action.idx - 1]);
                    _action.config = action.config;
                    state.filterConfig = {
                        ...state.filterConfig
                    };
                    //联动参数--------
                    var str = "",
                        param = {},
                        rawParamsIds = [];
                    state.filterConfig.fields.forEach(item => {
                        const { filterType, condition } = item.config;
                        if (
                            filterType === 1 &&
                            condition &&
                            condition.children
                        ) {
                            condition.children.forEach(ee => {
                                typeof ee.value === "string" &&
                                    /\${.+}/.test(ee.value) &&
                                    (str += ee.value);
                            });
                        }
                    });
                    Dashboard.globalParam.params.container.forEach(el => {
                        if (str.indexOf("${" + el.name + "}") > -1) {
                            param[`param${el.name}`] = el.getValue();
                            param[`type${el.name}`] = el.type || "String";
                            //做记录用
                            rawParamsIds.push(el.id);
                        }
                    });
                    Object.assign(state.component.chartDefinition.query, {
                        param,
                        rawParamsIds
                    });
                    //--------
                }
                return { ...state };
            }
            break;
        case "EDIT_SQL_CFG":
            {
                Object.assign(
                    state.sqlCfg,
                    {
                        ...action.sqlcfg
                    },
                    action.check ? { __time: +new Date() } : {}
                );
                state.sqlCfg = { ...state.sqlCfg };
                return { ...state };
            }
            break;
        default:
            return state;
    }
};
