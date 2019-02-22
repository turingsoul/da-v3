/**
 * 字段框集合
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import { message } from "antd";
import Cell from "./Cell";
import Util from "dashboard/modules/common/Util";
import colTypeCfg from "dashboard/modules/common/colTypeCfg";
import $ from "jquery";
import databindM, { commonValid } from "dashboard/modules/business/databind";

const util = new Util();
const _ = util._;
const DEFAULT_PROPS = {
    cells: []
};
// const $ = Dashboard.lib.$;
let bingDragObj = {},
    dragObj = {};
/**
 * 判断字段类型
 * @param {String} type 原始类型
 */
function getFieldType(type) {
    return util.getRelFieldType(type);
}

class Cells extends Component {
    constructor(props) {
        super(props);
        //缓存每个单元格验证情况
        this.cellsValid = null;
    }
    /**
     * 验证格子内字段数量是否符合约束
     * @param {Array} cells 当前类型图标对应格子列表
     * @param {Object} cellsConfig 对应类型格子config对象
     */
    valid(cells, cellsConfig) {
        let lenArr = cells.map(
            item => cellsConfig[item.valueKey].fields.length
        );
        return cells.map((item, idx) =>
            item.valid.call(item, lenArr[idx], lenArr, commonValid)
        );
    }
    /**
     * 判断字段是否允许放入
     */
    isAllowed(cell, fields) {
        let allowFieldTypes = cell.allowFieldTypes;
        let type = getFieldType(fields.type);
        if (allowFieldTypes && allowFieldTypes.indexOf(type) === -1) {
            return false;
        }
        return true;
    }
    checkCell(type, fields) {
        let { cells, cellsConfig } = this.props;
        let validResult = this.valid(cells, cellsConfig);
        let index = cells.findIndex(e => e.valueKey === type);
        let valid = validResult[index],
            cell = cells[index];
        let { valueKey, collectType } = cell;
        let isAllowed = this.isAllowed(cell, fields);
        let cfg = colTypeCfg[collectType.selectValue];
        let _coloctionName,
            noShowJh = databindM.isConvergeField(fields.formulaStr);
        cfg = cfg[getFieldType(fields.type)] || cfg["string"];
        if (collectType.selectValue != 0) {
            _coloctionName = cfg[0][0].name;
            cfg = cfg[0][0].value.split("-");
        }
        if (noShowJh) {
            _coloctionName = "无";
            cfg = ["collect", "NONE"];
        }
        if (!isAllowed) {
            message.error("字段类型不匹配，不能放入。");
            return false;
        } else if (valid.accept === false) {
            message.error("已达到可接收字段最大限制！");
            return false;
        } else {
            return collectType.selectValue == 0
                ? {}
                : {
                      [cfg[0]]: cfg[1],
                      _coloctionName,
                      higsum: "nonee",
                      noShowJh
                  };
        }
    }
    bindDrag() {
        let _this = this;
        let { reverseCell, updateComponent } = this.props;
        $(".databind-cells .databind-cell-field").draggable({
            connectToSortable: ".databind-cell-accept",
            helper: "clone",
            revert: "invalid",
            placeholder: "ui-state-highlight",
            stack: ".databind-cell-accept",
            start(event, ui) {
                let Ele = ui.helper[0];
                $(Ele)
                    .parent()
                    .find("[dataind=" + Ele.getAttribute("dataind") + "]")
                    .hide();
                $(Ele).css({
                    width: 182,
                    height: 30,
                    boxSizing: "border-box",
                    borderRadius: 5,
                    color: "#03a9f4",
                    backgroundColor: "#fff",
                    padding: "0 10px",
                    border: "1px #03a9f4 solid",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    cursor: "all-scroll",
                    zIndex: 9999
                });
                bingDragObj = {
                    startType: Ele.parentElement.getAttribute("datatype"),
                    startInd: Ele.getAttribute("dataind")
                };
                dragObj = { ...bingDragObj };
            },
            stop(event, ui) {
                let Ele = ui.helper[0];
                $(".databind-cells")
                    .find("div[datatype=" + dragObj.startType + "]")
                    .find("div[dataind=" + Ele.getAttribute("dataind") + "]")
                    .show();
                $(Ele).remove();
                dragObj = {};
            }
        });
        $(".databind-cells .databind-cell-accept").sortable({
            connectWith: "div",
            placeholder: "ui-state-highlight",
            helper: "clone",
            start(event, ui) {},
            stop(event, ui) {
                let _thisDragObj = {};
                bingDragObj = _thisDragObj;
                let Ele = ui.item[0];
                let eleType = Ele.getAttribute("datatype"),
                    eleInd = Ele.getAttribute("dataind");
                let parentEle = Ele.parentElement;
                let parentType = parentEle.getAttribute("datatype");
                let subObj = $(parentEle).find(".databind-cell-field"),
                    subLen = subObj.length - 1;
                Object.assign(bingDragObj, {
                    startType: eleType,
                    startInd: eleInd,
                    stopType: parentType
                });
                let { cells, cellsConfig, filterConfig } = _this.props,
                    cell,
                    _oo,
                    _cellcfg,
                    _dataGroupCell,
                    typeId,
                    filter;
                //通过筛选拖拽过来的字段
                if (eleType === "filter") {
                    bingDragObj.startType = "filter";
                    bingDragObj.startInd = eleInd;
                    filter = filterConfig.fields.find((e, i) => i == eleInd)
                        .field;
                    _oo = _this.checkCell(parentType, filter);
                    if (!_oo) {
                        return false;
                    }
                }

                //不同字段之间的拖拽判断
                if (eleType && parentType !== bingDragObj.startType) {
                    cell = cells.find(e => e.valueKey === parentType);
                    if (eleType !== "filter") {
                        _cellcfg = cellsConfig[eleType].fields[eleInd].field;
                    } else {
                        _cellcfg = filter;
                    }

                    _oo = _this.checkCell(parentType, _cellcfg);
                    [...subObj].forEach((e, i) => {
                        e === ui.item[0] && (bingDragObj.stopInd = i);
                    });
                    _oo && reverseCell(bingDragObj, _oo);
                    if (cell.collectType.selectValue === 0) {
                        _dataGroupCell =
                            cellsConfig[parentType].fields[bingDragObj.stopInd];
                        if (
                            getFieldType(_dataGroupCell.field.type) ===
                                "number" &&
                            (!_dataGroupCell.config.dataGroup ||
                                JSON.stringify(
                                    _dataGroupCell.config.dataGroup
                                ) == "{}")
                        ) {
                            typeId =
                                _dataGroupCell.field.id +
                                "__" +
                                _dataGroupCell.group.id;
                            window.dataSetGroupObj =
                                window.dataSetGroupObj || {};
                            window.dataSetGroupObj[typeId] ||
                                (window.dataSetGroupObj[
                                    typeId
                                ] = databindM.getFieldValues(
                                    _dataGroupCell.field,
                                    _this.props.dataset,
                                    _this.props.modelId
                                ));
                            window.dataSetGroupObj[typeId].then(
                                data => {
                                    var resultset = data.resultset,
                                        resultArr = [],
                                        max,
                                        min;
                                    if (resultset && resultset.length) {
                                        resultArr = resultset.map(
                                            e => e[0] || 0
                                        );
                                        max = Math.max.apply(
                                            resultArr,
                                            resultArr
                                        );
                                        min = Math.min.apply(
                                            resultArr,
                                            resultArr
                                        );
                                        updateComponent(typeId, {
                                            max,
                                            min,
                                            length: Array.from(
                                                new Set(resultArr)
                                            ).length
                                        });
                                    } else {
                                        updateComponent(typeId);
                                    }
                                },
                                () => {
                                    updateComponent(typeId);
                                }
                            );
                        }
                    }
                } else if (eleType) {
                    [...subObj].forEach((e, i) => {
                        e === ui.item[0] && (bingDragObj.stopInd = i);
                    });
                    reverseCell(bingDragObj);
                }
                bingDragObj = {};
            }
        });
    }
    updateCellsValid() {
        let { setState } = this.props;

        if (this.cellsValid) {
            //将最新cells字段验证结果写入状态中
            setState({
                cellsValid: _.isUndefined(
                    this.cellsValid.find(v => v.result === false)
                )
            });
        }
    }
    componentDidUpdate() {
        // this.updateCellsValid();
        this.bindDrag();
    }
    componentDidMount() {
        // this.updateCellsValid();
        this.bindDrag();
    }
    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let { className, setState, cells, cellsConfig } = props;
        let validResult = this.valid(cells, cellsConfig);

        this.cellsValid = validResult;

        return (
            <div className={className}>
                {cells.map((item, idx) => (
                    <Cell
                        cell={item}
                        idx={idx}
                        key={idx}
                        valid={validResult[idx]}
                    />
                ))}
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        cells: state.databind.cells,
        cellsConfig: state.databind.cellsConfig,
        filterConfig: state.databind.filterConfig,
        dataset: state.databind.dataset,
        modelId: state.databind.modelId
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        setState: newState => {
            dispatch({
                type: "SET_STATE",
                newState
            });
        },
        reverseCell(reverseObj, cellCfg) {
            dispatch({
                type: "REPLACE_FIELD_TO_CELL",
                reverseObj,
                cellCfg
            });
        },
        //更新字段数据分组
        updateComponent: (id, dataGroupObj) => {
            dispatch({
                type: "UPDATE_COMPONENT",
                id,
                dataGroupObj
            });
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Cells);
