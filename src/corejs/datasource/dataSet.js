/**
 * 数据集数据源
 */
import _ from "underscore";
import _Config from "dashboard/modules/common/Config";
import Util from "dashboard/modules/common/Util";
import databindM,{ commonValid } from "dashboard/modules/business/databind";

const util = new Util();
const Config = new _Config();

/**
 * 生成公式字符串拼接，时需要对value值做转换
 * 1、为字符串类型值添加双引号
 * 2、为参数做转换
 * @param {Any} 值
 */
const changeFormulaValue = value => {
    if (_.isArray(value)) {
        return value.map(v => changeFormulaValue(v));
    }
    
    if( typeof value === "string" ){
        //如果是参数，${name} 需要替换为 [param:name]
        if(/^\${.+}$/.test(value)){
            return value.replace(/^\${(.+)}$/, "[param:$1]");
        }else if(!/^".*"$/.test(value) && !/\[param:.+\]/.test(value)){
            return '"' + value.replace(/"/, '\\"') + '"';
        }
    }
    return value;
};

/**
 * 构建单条条件公式
 * @param {String} fieldId 字段ID (groupId+fieldId)
 * @param {String} operator 运算符
 * @param {Any} value
 */
const buildSingleFormula = (fieldId, operator, value, fieldType) => {
    let str;
    fieldType = util.getRelFieldType(fieldType);

    value = changeFormulaValue(value);

    switch (operator) {
        case "IN":
            str = "IN([" + fieldId + "];" + value.join(";") + ")";
            break;
        case "NOT_IN":
            str =
                "NOT(" +
                buildSingleFormula(fieldId, "IN", value, fieldType) +
                ")";
            break;
        case "EQUAL":
            // str = "[" + fieldId + "]=" + value;
            str = "IN([" + fieldId + "];" + value + ")";
            break;
        case "NOT_EQUAL":
            str =
                "NOT(" +
                buildSingleFormula(fieldId, "EQUAL", value, fieldType) +
                ")";
            break;
        case "BEGINS_WITH":
            str = "BEGINSWITH([" + fieldId + "];" + value + ")";
            break;
        case "BEGIN_NOT":
            str =
                "NOT(" +
                buildSingleFormula(fieldId, "BEGINS_WITH", value, fieldType) +
                ")";
            break;
        case "ENDS_WITH":
            str = "ENDSWITH([" + fieldId + "];" + value + ")";
            break;
        case "END_NOT":
            str =
                "NOT(" +
                buildSingleFormula(fieldId, "ENDS_WITH", value, fieldType) +
                ")";
            break;
        case "LIKE":
            str = "CONTAINS([" + fieldId + "];" + value + ")";
            break;
            break;
        case "DOES_NOT_LIKE":
            str =
                "NOT(" +
                buildSingleFormula(fieldId, "LIKE", value, fieldType) +
                ")";
            break;
        case "IS_NULL":
            str = "ISNA([" + fieldId + "])";
            break;
        case "IS_NOT_NULL":
            str =
                "NOT(" +
                buildSingleFormula(fieldId, "IS_NULL", null, fieldType) +
                ")";
            break;
        case "GREATER_THAN":
            str = "[" + fieldId + "]>" + value;
            break;
        case "LESS_THAN":
            str = "[" + fieldId + "]<" + value;
            break;
        case "GREATOR_OR_EQUAL":
            str = "[" + fieldId + "]>=" + value;
            break;
        case "LESS_OR_EQUAL":
            str = "[" + fieldId + "]<=" + value;
            break;
        case "RANGE":
            str =
                "AND(" +
                buildSingleFormula(
                    fieldId,
                    "GREATOR_OR_EQUAL",
                    value[0],
                    fieldType
                ) +
                ";" +
                buildSingleFormula(
                    fieldId,
                    "LESS_OR_EQUAL",
                    value[1],
                    fieldType
                ) +
                ")";
            break;
    }
    return str;
};

class DataSet {
    constructor() {
        this.type = "mql"; //类型
        this.url = "/xdatainsight/plugin/cda/api/query";
        this.data = {
            columns: [],
            conditions: [],
            orders: [],
            domainName: "tyty.xmi",
            modelId: "MODEL_1",
            //是否禁用去重
            disableDistinct: true
        };
    }

    /**
     * 构建条件公式
     * @param {Object} config 数据集绑定配置对象
     */
    buildFormula(config, calcColumnsObj) {
        let { filterConfig } = config;
        let condArr = [];
        let str = "";

        if (!filterConfig.fields) {
            return;
        }

        filterConfig.fields.forEach(item => {
            let { config, field, group } = item;
            let filterType = config.filterType;
            let fieldId = [group.id, field.id].join(".");
            let fieldtype = field.type;

            if (field.calc === true) {
                this._cacheCalcColumn(calcColumnsObj, field);
                fieldId = ["calc_field", field.id].join(".");
            } else {
                fieldId = [group.id, field.id].join(".");
            }

            //0-基本筛选
            if (filterType === 0 && config.checked && config.checked.length) {
                condArr.push(
                    buildSingleFormula(
                        fieldId,
                        config.exclude ? "NOT_IN" : "IN",
                        config.checked,
                        fieldtype
                    )
                );
            }

            //1-条件筛选
            if (
                filterType === 1 &&
                config.condition &&
                config.condition.children &&
                config.condition.children.length
            ) {
                let _arr = config.condition.children.map(cond =>
                    buildSingleFormula(
                        fieldId,
                        cond.operator,
                        cond.value,
                        fieldtype
                    )
                );
                condArr.push(
                    config.condition.relation + "(" + _arr.join(";") + ")"
                );
            }
        });

        if (condArr.length === 1) {
            str = condArr[0];
        } else if (condArr.length > 1) {
            str = ["AND", "(", condArr.join(";"), ")"].join("");
        }

        return str;
    }

    //构造参数
    createParam() {
        let value,
            key,
            param = [];

        for (key in this.param) {
            value = this.param[key];
            if (Array.isArray(value)) {
                value.forEach(val => param.push(`${key}=${val}`));
            } else {
                param.push(`${key}=${value}`);
            }
        }

        return param.join("&");
    }

    /**
     * 判断字段数量是否符合要求
     */
    ifConfirm() {
        let _components = databindM.getDatasetComponents();
        const { cellsConfig } = this.config;
        let type = this.modelType;
        let cells = _components.find(e => e.type == type).cells;
        let lenArr = cells.map(
            item => cellsConfig[item.valueKey].fields.length
        );
        let aa = cells.map((item, idx) =>
            item.valid.call(item, lenArr[idx], lenArr, commonValid)
        );

        return aa.every(e => e.result);
    }

    //将该计算字段记录到缓存对象中
    _cacheCalcColumn(calcColumnsObj, field) {
        let { id } = field;
        let calcField = Dashboard.dataBind.findFieldById(id);

        //如果字段中存的公式和模块中存储的公式不一致，以模块中为准
        if (calcField && calcField.formulaStr !== formulaStr) {
            Object.assign(field, {
                name: calcField.calcName,
                formulaStr: calcField.formulaStr,
                contrast: calcField.contrast,
                type: calcField.type
            });
        }

        let { formulaStr, contrast } = field;

        formulaStr = databindM._replaceNameToId(formulaStr, contrast);
        formulaStr = databindM._replaceToSemicolon(formulaStr);

        //存在于计算字段分组或者日期类计算字段，缓存到calcColumnsObj中
        if (
            Dashboard.dataBind.findFieldById(field.id) ||
            /.+__.+/.test(field.id)
        ) {
            //将该计算字段记录到缓存对象中
            calcColumnsObj[field.id] = {
                id: field.id,
                name: field.name,
                formula: formulaStr
            };
        }
    }

    /**
     * 构建数据查询参数对象
     */
    buildParams() {
        //深度拷贝datasetSetting
        let config = JSON.parse(JSON.stringify(this.config));
        let _components = databindM.getDatasetComponents();
        //datasetSetting中详细配置
        const { cellsConfig, dataset, filterConfig, limit, modelId } = config;
        //从所有组件配置中获取当前类型组件字段分组配置信息
        let cells = _components.find(
            e => e.type == this.modelType
        ).cells;
        let cellsConfigKeys = Object.keys(cellsConfig) || [];
        //要查询字段集合
        let defaultArr = [];
        //查询字段index计数器
        let ind;
        //缓存分组类型对应查询字段columns中index
        let cellToInd = {};
        //条件公式，用于筛选条件构建
        let formula;
        //用到的计算字段缓存对象
        let calcColumnsObj = {};

        //写入参数modelId
        this.data.modelId = modelId;
        //写入参数domainName
        this.data.domainName = dataset.name;
        //写入计算字段
        this.data.calcColumns = [];

        //合并数组 生成对应下标
        cellsConfigKeys.forEach(e => {
            cellToInd[e] = [];
            defaultArr = defaultArr.concat(cellsConfig[e].fields);
            cellsConfig[e].fields.map((ee, ii) => {
                ind = ind === undefined ? 0 : ind + 1;
                cellToInd[e].push(ind);
            });
        });

        //将分组对应查询字段下表缓存，写入config中
        this.config.cellToInd = cellToInd;

        //构造查询字段，写入参数columns和sort
        defaultArr.forEach(e => {
            //普通聚合
            e.field.selectedAggType = e.config.collect || "NONE";
            ["calcs", "__group"].forEach(item => {
                if (e.field[item]) {
                    delete e.field[item];
                }
            });
            //高级计算
            e.field.advancedCalc = !e.config.higsum
                ? "NONE"
                : e.config.higsum !== "nonee"
                ? e.config.higsum
                : "NONE";
            //同环比添加日期字段
            var dataField = defaultArr.find(ee => ee.field.type === "date");
            let _fieldsArr = [],
                fieldsArr = [];
            fieldsArr = defaultArr.filter(
                item =>
                    item.field.type === "date" &&
                    (item.config.collect === undefined ||
                        item.config.collect === "NONE")
            );
            var fieldsArrLen = fieldsArr.length || 0;
            if (
                /YearOnYear|RingRatio/.test(e.config.higsum) &&
                fieldsArrLen === 1
            ) {
                var dataFieldIds = fieldsArr[0].field.id.split("__");
                Object.assign(e.field, {
                    granularity: dataFieldIds[2].toUpperCase(), //日期字段的粒度，为大写的YEAR,QUARTER,MONTH,WEEK,DAY
                    sourceDateColumnId: dataFieldIds[1], //"LC_Business1cn_datetime",  //原始的日期字段ID
                    targetDateColumnId: dataFieldIds.join("__") //"Business1cn__LC_Business1cn_datetime__quarter" //经过变换的日期字段ID,如选择季度等
                });
            }
            /* if (/YearOnYear|RingRatio/.test(e.config.higsum) && dataField) {
                var dataFieldIds = dataField.field.id.split("__");
                Object.assign(e.field, {
                    granularity: dataFieldIds[2].toUpperCase(), //日期字段的粒度，为大写的YEAR,QUARTER,MONTH,WEEK,DAY
                    sourceDateColumnId: dataFieldIds[1], //"LC_Business1cn_datetime",  //原始的日期字段ID
                    targetDateColumnId: dataFieldIds.join("__") //"Business1cn__LC_Business1cn_datetime__quarter" //经过变换的日期字段ID,如选择季度等
                });
            } */
            //计算字段和普通字段需要区别处理
            if (e.field.calc === true) {
                this._cacheCalcColumn(calcColumnsObj, e.field);
                this.data.columns.push({
                    id: e.field.id,
                    selectedAggType: e.field.selectedAggType
                });
            } else {
                this.data.columns.push(e.field);
            }
            e.config.sort != "none" &&
                this.data.orders.push({
                    column: e.field.id,
                    category: e.field.category,
                    orderType: { up: "ASC", down: "DESC" }[e.config.sort]
                });
        });

        //构造查询条件公式
        formula = this.buildFormula(config, calcColumnsObj);

        //如果存在条件公式，将条件公式写入参数查询条件
        if (formula) {
            this.data.conditions = [
                {
                    condition: formula,
                    combinationType: "AND"
                }
            ];
        } else {
            this.data.conditions = [];
        }

        //将用到的计算字段存入查询条件中
        for (let key in calcColumnsObj) {
            this.data.calcColumns.push(calcColumnsObj[key]);
        }

        return this.data;
    }

    getFetchCfg() {
        const { limit } = this.config;
        let str = "";
        let data;
        if (limit.top && limit.top !== -1) {
            str = `?paginateQuery=true&pageSize=${limit.top}&pageStart=0`;
        }
        data = `query=${JSON.stringify(this.buildParams())}&type=${this.type}`;
        data = util.enCodeQueryString(data);
        return {
            method: "post",
            url: this.url + str + (str ? "&" : "?") + this.createParam(),
            // params: this.createParam(),
            responseType: "json",
            headers: {
                "content-type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
                Accept: "application/json"
            },
            data: data
        };
    }
}

export default DataSet;
