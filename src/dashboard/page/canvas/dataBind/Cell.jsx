/**
 * 字段框
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Popover, message, Tooltip } from "antd";
import CellSetSelectPop from "./pop/CellSetSelectPop";
import classnames from "classnames";
import Util from "dashboard/modules/common/Util";
import databindM from "dashboard/modules/business/databind";
import colTypeCfg from "dashboard/modules/common/colTypeCfg";
import $ from "jquery";
const util = new Util();
const DEFAULT_PROPS = {
    title: "标题",
    cellsConfig: {}
};

/**
 * 判断字段类型
 * @param {String} type 原始类型
 */
function getFieldType(type) {
    return util.getRelFieldType(type);
}

class Cell extends Component {
    constructor(props) {
        super(props);
        const _props = Object.assign({}, DEFAULT_PROPS, this.props);
        let { cellsConfig } = _props;
        let { valueKey } = props.cell;
        let cellConfig = cellsConfig[valueKey] || {};
        let fields = cellConfig.fields || [];
        this.state = {
            visible: false,
            isEditer: false
        };
        fields.length &&
            fields.forEach((item, ind) => {
                this.state[item.field.id + "_" + ind] =
                    item.config["editeName"] === undefined
                        ? item.field.name
                        : item.config["editeName"];
            });
    }
    componentWillReceiveProps(nextprops) {
        const props = Object.assign({}, DEFAULT_PROPS, nextprops);
        let { cellsConfig } = props;
        let { valueKey } = props.cell;
        let cellConfig = cellsConfig[valueKey] || {};
        let fields = cellConfig.fields || [];
        var obj = {};
        fields.length &&
            fields.forEach((item, ind) => {
                obj[item.field.id + "_" + ind] =
                    item.config["editeName"] === undefined
                        ? item.field.name
                        : item.config["editeName"];
            });
        this.setState({ ...obj });
    }
    hide(idx) {
        this.setState({
            ["visible" + idx]: false
        });
    }
    ifnameEditer(ind) {
        this.setState(
            {
                ["isEditer" + ind]: !this.state["isEditer" + ind]
            },
            () => {
                let input = this["input_" + ind];
                input.focus();
                $(input).select();
                /* let len = input.value.length;
                if (document.selection) {
                    var sel = input.createTextRange();
                    sel.moveStart("character", len); //设置开头的位置
                    sel.collapse();
                    sel.select();
                } else if (
                    typeof input.selectionStart == "number" &&
                    typeof input.selectionEnd == "number"
                ) {
                    input.selectionStart = input.selectionEnd = len;
                } */
            }
        );
    }
    handleVisibleChange(idx, visible) {
        this.setState({ ["visible" + idx]: visible });
    }
    /**
     * 判断字段是否允许放入
     */
    isAllowed() {
        let { cell, dragField } = this.props;
        let allowFieldTypes = cell.allowFieldTypes;
        let type = getFieldType(dragField.type);
        if (allowFieldTypes && allowFieldTypes.indexOf(type) === -1) {
            return false;
        }
        return true;
    }
    /**
     * 字段被放入
     * @param {Object} e eventObj
     */
    /* onDrop(e) {
        let { addField, dragField, valid } = this.props;
        let { valueKey, collectType } = this.props.cell;
        let isAllowed = this.isAllowed();
        e.preventDefault();
        let cfg = colTypeCfg[collectType.selectValue];
        let _coloctionName;
        cfg = cfg[getFieldType(dragField.type)] || cfg["string"];
        if (collectType.selectValue != 0) {
            _coloctionName = cfg[0][0].name;
            cfg = cfg[0][0].value.split("-");
        }
        if (!isAllowed) {
            message.error("字段类型不匹配，不能放入。");
        } else if (valid.accept === false) {
            message.error("已达到可接收字段最大限制！");
        } else {
            addField(
                valueKey,
                collectType.selectValue == 0
                    ? {}
                    : { [cfg[0]]: cfg[1], _coloctionName }
            );
        }
    } */
    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let { idx, onDrop, cellsConfig, removeItem, editeItem, valid } = props;
        let { title, valueKey, min, max, tip } = props.cell;
        let cellConfig = cellsConfig[valueKey] || {};
        let fields = cellConfig.fields || [];

        return (
            <div
                className={classnames({
                    "databind-cell": true,
                    "databind-cell-empty": fields.length === 0,
                    "databind-cell-full": valid.accept === false,
                    "databind-cell-error": valid.result === false
                })}
            >
                <div className="databind-cell-title">{title}</div>
                {this.state.modelShow ? (
                    <div className="databind-cell-model" />
                ) : null}
                <Tooltip placement="right" title={valid.errmsg}>
                    <div
                        className="databind-cell-accept"
                        /* onDragOver={e => {
                            e.preventDefault();
                        }}
                        onDrop={e => this.onDrop(e)} */
                        datatype={valueKey}
                    >
                        {fields.length ? (
                            fields.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="databind-cell-field"
                                    style={{ position: "relative" }}
                                    dataind={idx}
                                    datatype={valueKey}
                                >
                                    {["up", "down"].find(
                                        e =>
                                            item.config &&
                                            item.config.sort === e
                                    ) ? (
                                        <div
                                            className={
                                                "cell-sort-icon cell-sort-icon-" +
                                                item.config.sort
                                            }
                                        />
                                    ) : null}
                                    <span
                                        style={{
                                            width: "100%",
                                            display: this.state[
                                                "isEditer" + idx
                                            ]
                                                ? "none"
                                                : "block",
                                            paddingRight: item.field.calc
                                                ? 51
                                                : 34
                                        }}
                                        title={
                                            item.group.name +
                                            "." +
                                            item.field.name +
                                            (item.config._coloctionName &&
                                            item.config._coloctionName !== "无"
                                                ? "(" +
                                                  item.config._coloctionName +
                                                  ")"
                                                : "")
                                        }
                                        className="text-ellipsis"
                                    >
                                        {item.config["editeName"] === undefined
                                            ? item.field.name +
                                              (item.config._coloctionName
                                                  ? "(" +
                                                    item.config._coloctionName +
                                                    ")"
                                                  : "")
                                            : item.config["editeName"]}
                                    </span>
                                    <input
                                        style={{
                                            display: this.state[
                                                "isEditer" + idx
                                            ]
                                                ? "block"
                                                : "none"
                                        }}
                                        spellCheck="false"
                                        ref={e => (this["input_" + idx] = e)}
                                        value={
                                            this.state[
                                                item.field.id + "_" + idx
                                            ]
                                        }
                                        className="cellPop-inputName"
                                        onChange={e => {
                                            this.setState({
                                                [item.field.id + "_" + idx]: e
                                                    .target.value
                                            });
                                        }}
                                        onBlur={e => {
                                            editeItem(
                                                valueKey,
                                                idx,
                                                "editeName",
                                                e.target.value
                                                    ? e.target.value
                                                    : undefined
                                            );
                                            this.setState({
                                                ["isEditer" + idx]: false
                                            });
                                        }}
                                    />
                                    {item.field.calc ? (
                                        <span
                                            className="databind-cell-field-calc"
                                            style={{ right: "44px" }}
                                        />
                                    ) : null}
                                    <Popover
                                        placement="rightTop"
                                        onVisibleChange={this.handleVisibleChange.bind(
                                            this,
                                            idx
                                        )}
                                        visible={this.state["visible" + idx]}
                                        content={
                                            <CellSetSelectPop
                                                {...{
                                                    editeItem: editeItem.bind(
                                                        this,
                                                        valueKey,
                                                        idx
                                                    ),
                                                    valueKey: valueKey,
                                                    item: item,
                                                    hide: this.hide.bind(
                                                        this,
                                                        idx
                                                    ),
                                                    ifnameEditer: this.ifnameEditer.bind(
                                                        this,
                                                        idx
                                                    )
                                                }}
                                            />
                                        }
                                        trigger="click"
                                    >
                                        <span
                                            className="databind-cell-field-open"
                                            style={{ right: "23px" }}
                                        />
                                    </Popover>
                                    <span
                                        className="databind-cell-field-remove"
                                        onClick={e => removeItem(valueKey, idx)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="nodata">
                                {tip ||
                                    (() => {
                                        if (!min && !max) {
                                            return;
                                        }
                                        if (min === max) {
                                            return "需拖入" + min + "个字段";
                                        }
                                        if (max && max > 0) {
                                            min = min || 0;
                                            return ( ( min>0 ? "需拖入" : "可拖入" ) + min + "-" + max + "个字段" );
                                        }
                                    })() ||
                                    "请从左侧拖入字段"}
                            </div>
                        )}
                    </div>
                </Tooltip>
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        dragField: state.databind.dragField,
        cellsConfig: state.databind.cellsConfig
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        addField: (valueKey, defCfg) => {
            dispatch({
                type: "ADD_FIELD_TO_CELL",
                valueKey,
                defCfg
            });
        },
        removeItem: (valueKey, idx) => {
            dispatch({
                type: "DEL_FIELD_FROM_CELL",
                idx: idx,
                valueKey
            });
        },
        editeItem: (valueKey, idx, key, value, name) => {
            dispatch({
                type: "UPDATE_FIELD_FROM_CELL",
                valueKey,
                idx,
                key,
                value,
                name
            });
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Cell);
