/**
 * 指标卡组件
 * author：twy
 * create time:2018/12/12
 */
import WidgetBase from "corejs/components/base";
import _ from "underscore";
import $ from "jquery";
import React, { Component } from "react";
import { Icon } from "antd";
import ReactDOM from "react-dom";
import Card from "./components/Card.jsx";
import "./css/style.less";
import CoreUtil from "corejs/util/util";

const DEFAULT_CONFIG = {};

/**
 * 表格类
 */
export default class IndexCard extends WidgetBase {
    static cname = "指标卡";
    constructor(htmlObj, cfg, parentId, isEditMode) {
        super(...arguments);
    }

    widgetWillCreated(cfg) {
        return super.widgetWillCreated(cfg);
    }

    widgetDidCreated(cfg) {
        super.widgetDidCreated(cfg);

        //绘制
        this._draw();
    }

    _draw() {
        let that = this;
        let option = this.cfg.chartDefinition.option;

        //构建props属性
        this.cardOptions = _buildCardOptions(this.cfg, this);

        //背景色特殊处理，需要修改htmlObj样式
        if(option.bgColor){
            $(this.htmlObj).css("backgroundColor", option.bgColor);
        }

        if (that.$$card) {
            this.setState(this.cardOptions);
        } else {
            //渲染表格主体
            ReactDOM.render(
                <Card options={this.cardOptions} />,
                this.htmlObj,
                function() {
                    //缓存组件实例
                    that.$$card = this;
                    that.layoutH();
                }
            );
        }
    }

    setState(newState) {
        this.$$card.setState(newState, () => {
            this.layoutH();
        });
    }

    preUpdate(nextCfg) {
        super.preUpdate(nextCfg);
        if (nextCfg.option) {
            for (let key in nextCfg.option) {
                let value = nextCfg.option[key];
                //处理主题，当主题切换时，nextCfg包含主题属性
                this.handleTheme(key, value);
            }
        } else if (nextCfg.data) {
            this.cfg.chartDefinition.data = nextCfg.data;
        }
    }

    /**
     * 处理主题
     * @param {String} key 主题属性，目前包含有backgroundColor-背景色 textColor-字体色 lineColor-线条色
     * @param {Any} value 主题属性对应的值
     */
    handleTheme(key, value) {
        let option = this.cfg.chartDefinition.option;

        //处理主题属性背景色、字体颜色、边框颜色
        if (key === "backgroundColor") {
            if (value) {
                $(this.htmlObj).css("backgroundColor", value);
                option.bgColor = value
            }
            if (this.cfg.parentId) {
                $(this.htmlObj).css("backgroundColor", "rgba(0, 0, 0, 0)");
            }
        } else if (key === "color") {
            option.mIndexColor = value[0];
            option.sIndexColor = value[1];
        } else if (key === "textColor") {
            option.typeColor = value[0];
            option.fontColor = value[1];
            option.titleColor = value[0];
        } else if (key === "lineColor") {
            option.widgetBorderColor = value[0];
        }
    }

    /**
     * 自适应高度
     */
    layoutH() {
        let $el = $(this.htmlObj);
        let $title = $(".indexcard-title", $el);
        let $list = $(".indexcard-list", $el);
        let totalH = $(".indexcard", $el).height();
        let extraH = 0;

        if ($list.length) {
            extraH = totalH - ($title.outerHeight() || 0) - $list.outerHeight();
        }

        if (extraH > 0) {
            $list.css("marginTop", extraH / 2 + "px");
        } else {
            $list.css("marginTop", 0);
        }
    }

    postUpdate(nextCfg) {
        super.postUpdate(nextCfg);
    }

    draw(nextCfg) {
        super.draw(...arguments);
        this._draw();
    }

    resize() {
        this.layoutH();
    }

    /**
     * 销毁
     */
    destroy() {}
}

/**
 * 构建指标卡样式
 * @param {Object} option
 */
function _buildStyle(option) {
    let { titleAlign, mIndexTitle, mIndexFontSize, mIndexColor } = option;
    let { sIndexTitle, sIndexFontSize, sIndexColor, typeShow } = option;
    let {
        typeAlign,
        typeFontSize,
        typeColor,
        bgColor,
        widgetBorderColor,
        fontColor,
        titleColor
    } = option;

    //主题属性
    let { lineColor, textColor } = option;
    let style = {
        indexcard: {
            borderColor: widgetBorderColor,
            color: fontColor
        },
        title: {
            textAlign: titleAlign,
            color: titleColor
        },
        name: {
            display: typeShow === false ? "none" : "block",
            fontSize: typeFontSize + "px",
            textAlign: typeAlign,
            color: typeColor
        },
        mIndexValue: {
            fontSize: mIndexFontSize + "px",
            color: mIndexColor
        },
        mIndexTitle: {
            display: mIndexTitle === false ? "none" : "block"
        },
        sIndexValue: {
            fontSize: sIndexFontSize + "px",
            color: sIndexColor
        },
        sIndexTitle: {
            display: sIndexTitle === false ? "none" : "block"
        },
        split: {
            borderColor: widgetBorderColor
        }
    };

    return style;
}

/**
 * 获取指标value，如果有条件设置，符合条件，赋予条件对应的图标和颜色
 */
function _getIndexValue(rowData, idx, option, formater) {
    let { condSetting } = option;
    let { open, config } = condSetting;
    let indexIcon, indexColor;
    let indexValue = rowData[idx];

    if (open === true) {
        config.forEach(item => {
            let { color, cond, icon, measure, value } = item;
            if (measure !== idx) {
                return;
            }
            if (!cond || _.isUndefined(value) || value === "") {
                return;
            }
            try {
                //条件拼接
                let exp = [indexValue, value].join(cond);
                //执行条件
                let result = eval(exp);
                //满足条件
                if (result === true) {
                    icon && (indexIcon = icon);
                    color && (indexColor = color);
                }
            } catch (error) {
                console.log(error);
            }
        });
    }

    if(formater){
        indexValue = formater(indexValue);
    }

    return (
        <div
            className="no-wrap"
            style={{ color: indexColor }}
            title={indexValue}
        >
            {indexIcon && <Icon size="mini" type={indexIcon} />}
            {indexValue}
        </div>
    );
}

/**
 * 获取类别、主指标、副指标在单行数据中的下标
 * @param {Object} data 组件数据对象
 * @param {Object} query 组件query配置对象
 */
function _getIdxs(data, query) {
    let nameIdx, mIdx, sIdx;
    let { type } = query;
    let { metadata, resultset } = data;

    if(!metadata || !resultset){
        return {};
    }

    switch (type) {
        case "dataset":
            {
                let { datasetSetting } = query;
                let { cellToInd, cellsConfig } = datasetSetting;
                nameIdx = cellToInd.type[0];
                mIdx = cellToInd.counter[0];
                sIdx = cellToInd.counter[1];
            }
            break;
        case "sql":
            let stringTypes = ["String", "Date"];
            let numberType = ["Integer", "Numeric"];
            let colTypes = metadata.map(item => {
                let colType = item.colType;
                if (stringTypes.indexOf(colType) > -1) {
                    return "string";
                } else if (numberType.indexOf(colType) > -1) {
                    return "number";
                }
            });

            /**
             * 支持的 [s,n] [s,n,n] [n] [n,n] s-string n-number
             */
            if (colTypes[0] === "string") {
                if (colTypes[1] === "number") {
                    nameIdx = 0;
                    mIdx = 1;
                    if (colTypes[2] === "number") {
                        sIdx = 2;
                    }
                }
            } else if (colTypes[0] === "number") {
                mIdx = 0;
                if (colTypes[1] === "number") {
                    sIdx = 1;
                }
            }
            break;
    }
    return { nameIdx, mIdx, sIdx };
}

/**
 * 构建子选项卡数据
 * @param {Object} cfg 组件cfg
 */
function _buildList(cfg) {
    let list = [];
    let { chartDefinition } = cfg;
    let { data, option, query } = chartDefinition;
    let { type } = query;

    if (!data || !type) {
        return list;
    }
    
    let { metadata, resultset } = data;
    let { num } = option;
    let { nameIdx, mIdx, sIdx } = _getIdxs(data, query);

    //没有主指标
    if (_.isUndefined(mIdx)) {
        return list;
    }

    if(!resultset || !metadata){
        return list;
    }

    resultset = resultset.slice(0, num);

    resultset.forEach(row => {
        let item = {
            name: "",
            mIndex: {},
            sIndex: {}
        };

        //如果配置了类别
        if (!_.isUndefined(nameIdx)) {
            item.name = row[nameIdx];
        }

        //如果配置有主指标-对应第一个指标
        if (!_.isUndefined(mIdx)) {
            let title = "";
            let value;
            let formater;
            switch (type) {
                case "dataset":
                    {
                        let { datasetSetting } = query;
                        let { cellToInd, cellsConfig } = datasetSetting;
                        let config = cellsConfig.counter.fields[0].config;
                        title = config.cellName;
                        //数据格式转换
                        formater = (v)=> {
                            let data = CoreUtil.formatData2Num(v,config)
                            return CoreUtil.formatData2Str(data, config);
                        }
                        break;
                    }
                case "sql":
                    {
                        title = metadata[mIdx].colName;
                    }
                    break;
            }
            value = _getIndexValue(row, mIdx, option,formater);
            item.mIndex = { title, value };
        }

        //如果配置有副指标-对应第二个指标
        if (!_.isUndefined(sIdx)) {
            let title = "";
            let value;
            let formater;
            switch (type) {
                case "dataset":
                    {
                        let { datasetSetting } = query;
                        let { cellToInd, cellsConfig } = datasetSetting;
                        let config = cellsConfig.counter.fields[1].config;
                        title = config.cellName;
                        //数据格式转换
                        formater = (v)=> {
                            let data = CoreUtil.formatData2Num(v,config);
                            return CoreUtil.formatData2Str(data, config)
                        };
                    }
                    break;
                case "sql":
                    title = metadata[sIdx].colName;
                    break;
            }
            value = _getIndexValue(row, sIdx, option,formater);
            item.sIndex = { title, value };
        }

        list.push(item);
    });

    return list;
}

/**
 * 指标卡参数构建
 * @param {Object} cfg 组件cfg
 * @param {Object} inst 组件实例对象
 */
function _buildCardOptions(cfg, inst) {
    let props = {};
    let { chartDefinition } = cfg;
    let { option } = chartDefinition;
    let { title, direction } = option;

    props.title = title;
    props.direction = direction;
    props.style = _buildStyle(option);
    props.list = _buildList(cfg);

    return props;
}
