/**
 * 字段管理
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Tree, Icon, Input, Modal, message } from "antd";
import Util from "dashboard/modules/common/Util";
import CalcFieldPop from "./pop/CalcFieldPop";
import colTypeCfg from "dashboard/modules/common/colTypeCfg";
import databindM, { commonValid } from "dashboard/modules/business/databind";
import $ from "jquery";

const util = new Util();
const DEFAULT_PROPS = {
    fields: []
};
const TreeNode = Tree.TreeNode;
const Search = Input.Search;

//日期字段需要追加的计算字段列表
const DATE_CALC_LIST = [
    {
        id: "year",
        name: "年",
        type: "date",
        formulaStr: "DATE_YEAR($date)"
    },
    {
        id: "quarter",
        name: "季度",
        type: "date",
        formulaStr: "DATE_QUARTER($date)"
    },
    {
        id: "month",
        name: "月",
        type: "date",
        formulaStr: "DATE_MONTH($date)"
    },
    {
        id: "week",
        name: "周",
        type: "date",
        formulaStr: "DATE_WEEK($date)"
    },
    {
        id: "day",
        name: "日",
        type: "date",
        formulaStr: "DATE_DAY($date)"
    },
    {
        id: "hour",
        name: "时",
        type: "date",
        formulaStr: "DATE_HOUR($date)"
    },
    {
        id: "minute",
        name: "分",
        type: "date",
        formulaStr: "DATE_MINUTE($date)"
    },
    {
        id: "second",
        name: "秒",
        type: "date",
        formulaStr: "DATE_SECOND($date)"
    }
];

//用对象缓存所有字段信息
let loopObj = {};
let dragObj = {};

/**
 * 判断字段类型
 * @param {String} type 原始类型
 */
function getFieldType(type) {
    return util.getRelFieldType(type);
}

/**
 * loop生成字段节点
 * @param {Object} instance Fields实例
 * @param {Array} data 字段集合列表
 * @param {Object} _data 父节点信息
 */
const loop = (instance, data, _data) =>
    data.map(item => {
        var str = _data ? "__" + _data.id : "";
        //将节点缓存进loopObj，key为 [字段id__父级ID]
        loopObj[item.id + str] = item;
        if (item.columns && item.columns.length) {
            return (
                <TreeNode
                    key={item.id}
                    title={
                        <span
                            title={item.name}
                            className="databind-fields-item__title"
                        >
                            <i className="databind-icon-folder" />
                            {item.name}
                        </span>
                    }
                >
                    {loop(instance, item.columns, item)}
                </TreeNode>
            );
        } else {
            let fieldType = getFieldType(item.type);
            return (
                <TreeNode
                    key={item.id}
                    title={
                        <span
                            className="databind-fields-item__title databind-fields-item__field"
                            title={item.name}
                            dataname={item.id + str}
                        >
                            <i className={"databind-icon-" + fieldType} />
                            {item.name}
                            {item.calc && item.__group.id === "calc_field" && (
                                <div className="databind-fields-item__btns">
                                    <i
                                        className="ds-icon ds-icon-edit"
                                        title="修改"
                                        onClick={() => {
                                            instance.editCalcField(item);
                                        }}
                                    />
                                    <i
                                        className="ds-icon ds-icon-delete"
                                        title="删除"
                                        type="delete"
                                        onClick={() => {
                                            instance.deleteCalcField(item);
                                        }}
                                    />
                                </div>
                            )}
                        </span>
                    }
                >
                    {fieldType === "date" && item.calcs && item.calcs.length
                        ? loop(instance, item.calcs, item)
                        : ""}
                </TreeNode>
            );
        }
    });

class Fields extends Component {
    constructor() {
        super();
        this.state = {
            //字段搜索关键字
            keyword: "",
            //是否显示字段搜索框
            showSearchInput: false,
            //计算字段弹框信息对象
            calcFieldPop: {
                show: false,
                field: null
            },
            //计算字段
            calcFields: Dashboard.dataBind.calcField
        };
    }

    // componentDidMount() {
    //     let { setState, setFields } = this.props;
    //     Dashboard.event.unsubscribe("DATASET_UPDATED");
    //     //当业务数据集更新时对该数据集字段进行更新
    //     Dashboard.event.subscribe("DATASET_UPDATED", function(data) {
    //         let name = data.name;
    //         if (!name) {
    //             return;
    //         }
    //         databindM.getFieldsByDataset(name).then(rep => {
    //             let { modelId, fields } = rep;
    //             setState({
    //                 modelId
    //             });
    //             setFields(fields);
    //         });
    //     });
    // }

    /**
     * 向日期字段下追加年、季度、月、周、日、时、分、秒等计算字段
     * @param {Array} field 日期字段
     */
    _appendDateCalc(field) {
        let fieldId = field.id;
        let pId = field.__group.id;
        field.calcs = [];
        DATE_CALC_LIST.forEach(item => {
            let id = [pId, fieldId, item.id].join("__");

            field.calcs.push({
                id: id,
                name: item.name,
                calc: true,
                type: item.type,
                contrast: {},
                formulaStr: item.formulaStr.replace(
                    "$date",
                    "[" + [pId, fieldId].join(".") + "]"
                ),
                __group: {
                    id: [pId, fieldId].join("__"),
                    name: field.name
                }
            });
        });
    }

    /**
     * 追加计算字段
     * @param {Array} fields 原始表字段列表
     */
    appendCalcFields(fields) {
        let { dataset } = this.props;
        let { calcFields } = this.state;

        //未选择计算集
        if (!dataset || !dataset.name || !dataset.type) {
            return fields;
        }

        //还未查询出该数据集的字段
        if (fields.length === 0) {
            return fields;
        }

        //向日期字段下追加年、季度、月、周、日、时、分、秒等计算字段
        fields.forEach(group => {
            if (group.columns && group.columns.length) {
                group.columns.forEach(field => {
                    let type = getFieldType(field.type);
                    if (type === "date") {
                        this._appendDateCalc(field);
                    }
                });
            }
        });

        //不存在计算字段
        if (!calcFields || calcFields.length === 0) {
            return fields;
        }

        let curCalcFields = Dashboard.dataBind.getCalcFieldList(dataset);
        if (curCalcFields) {
            let calcObj = {
                id: "calc_field",
                name: "计算字段",
                columns: curCalcFields.map(v => ({
                    id: v.id,
                    name: v.calcName,
                    calc: true,
                    type: v.type,
                    contrast: v.contrast,
                    formulaStr: v.formulaStr,
                    __group: {
                        id: "calc_field",
                        name: "计算字段"
                    }
                }))
            };
            fields = [...fields, calcObj];
        }

        return fields;
    }

    /**
     * 编辑计算字段
     * @param {Object} field 计算字段对象
     */
    editCalcField(field) {
        this.openCalcFieldPop(field);
    }

    /**
     * 删除计算字段
     * @param {Object} field 计算字段对象
     */
    deleteCalcField(field) {
        let { dataset } = this.props;
        const _this = this;
        Modal.confirm({
            zIndex: 2000,
            title: "提示",
            okText: "确定",
            content: "删除后所有使用该字段的图表将无法工作，确定要删除吗？",
            onCancel() {},
            onOk() {
                let { id, name, type } = field;
                Dashboard.dataBind.delCalcField(dataset, field.id);

                //刷新配置中使用的计算字段
                _this.props.updateCalcField({
                    id: id,
                    name: name,
                    formulaStr: "",
                    type: type,
                    contrast: {}
                });

                _this.setState({
                    calcFields: Dashboard.dataBind.calcField
                });
            }
        });
    }

    /**
     * 判断字段是否存在
     * @param {Object} field 要判断的字段对象
     */
    isExist(field) {
        let { filterConfig } = this.props;

        //列表找到groupId和fieldId都相同，视为同一个字段
        return !!filterConfig.fields.find(
            v =>
                v.field.__group.id === field.field.__group.id &&
                v.field.id === field.field.id
        );
    }

    checkFilter(field, idx) {
        let { filterConfig, filterPop } = this.props;
        let isExist;

        if (!field) {
            return;
        }

        isExist = this.isExist(field);

        if (isExist) {
            message.error("已经添加过该字段的筛选条件。");
            return false;
        }

        //自动弹出配置框
        filterPop(idx, field, true);
        return true;
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
        let _coloctionName;
        cfg = cfg[getFieldType(fields.type)] || cfg["string"];
        if (collectType.selectValue != 0) {
            _coloctionName = cfg[0][0].name;
            cfg = cfg[0][0].value.split("-"); //聚合方式
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
                : { [cfg[0]]: cfg[1], _coloctionName, higsum: "nonee" };
        }
    }

    /**
     * 打开计算字段配置弹窗
     * @param {Object} field 计算字段信息，修改计算字段需要传入
     */
    openCalcFieldPop(field) {
        this.setState({
            calcFieldPop: {
                show: true,
                field: field || null
            }
        });
    }

    /**
     * 关闭计算字段配置弹窗
     */
    closeCalcFieldPop() {
        this.setState({
            calcFieldPop: {
                show: false,
                field: null
            }
        });
    }
    onExpand(expandedKeys, event) {
        if (event.expanded) {
            setTimeout(() => {
                this.bindDrag();
            }, 500);
        }
    }
    bindDrag() {
        let _this = this;
        let { addField, addFilterField, updateComponent } = this.props;

        $(".databind-fields-item__field").draggable({
            connectToSortable: ".databind-cell-accept",
            helper: "clone",
            revert: "invalid",
            placeholder: "ui-state-highlight",
            start(event, ui) {
                let Ele = ui.helper[0];
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
                    cursor: "all-scroll"
                });
                dragObj = {
                    dataType: Ele.getAttribute("dataname")
                };
            },
            stop(event, ui) {
                let parentEle = ui.helper[0].parentElement;
                let parentType = parentEle.getAttribute("datatype");
                let subObj = $(parentEle).find(".databind-cell-field"),
                    subLen = subObj.length,
                    subind;
                let { cells } = _this.props;
                let cell = cells.find(e => e.valueKey === parentType);
                let dataGroup = true;
                if (parentType === "filter") {
                    let _field = loopObj[dragObj.dataType];
                    [...parentEle.children].forEach((e, i) => {
                        e === ui.helper[0] && (subind = i);
                    });
                    let field = {
                        field: _field,
                        config: {},
                        group: _field.__group
                    };
                    var result = _this.checkFilter(field, subind);
                    result && addFilterField(loopObj[dragObj.dataType], subind);
                }
                if (cell) {
                    [...parentEle.children].forEach((e, i) => {
                        e === ui.helper[0] && (subind = i);
                    });
                    var _oo = _this.checkCell(
                        parentType,
                        loopObj[dragObj.dataType]
                    );
                    _oo &&
                        addField(
                            parentType,
                            _oo,
                            loopObj[dragObj.dataType],
                            subind,
                            cell.collectType.selectValue !== 1
                        );
                    if (cell.collectType.selectValue !== 1) {
                        if (
                            getFieldType(loopObj[dragObj.dataType].type) ===
                            "number"
                        ) {
                            window.dataSetGroupObj =
                                window.dataSetGroupObj || {};
                            window.dataSetGroupObj[dragObj.dataType] ||
                                (window.dataSetGroupObj[
                                    dragObj.dataType
                                ] = databindM.getFieldValues(
                                    loopObj[dragObj.dataType],
                                    _this.props.dataset,
                                    _this.props.modelId
                                ));
                            window.dataSetGroupObj[dragObj.dataType].then(
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
                                        updateComponent(dragObj.dataType, {
                                            max,
                                            min,
                                            length: Array.from(
                                                new Set(resultArr)
                                            ).length
                                        });
                                    } else {
                                        updateComponent(dragObj.dataType);
                                    }
                                },
                                () => {
                                    updateComponent(dragObj.dataType);
                                }
                            );
                        }
                    }
                }

                $(ui.helper[0]).remove();
                return true;
            }
        });
    }
    componentDidUpdate() {
        this.bindDrag();
    }
    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let { className, dataset, updateCalcField, fields } = props;
        let { keyword, showSearchInput, calcFieldPop } = this.state;
        let defaultExpandedKeys = [];
        let visibleFields = [];
        let msg = "暂无数据";
        //是否选择了数据集
        let hasBindDataset = !!dataset.name;

        fields = this.appendCalcFields(fields);

        fields.forEach(item => {
            let columns = [];
            if (item.columns && item.columns.length) {
                let reg = new RegExp(keyword, "i");
                columns = item.columns.filter(column => reg.test(column.name));
            }
            if (columns.length) {
                defaultExpandedKeys.push(item.id);
                visibleFields.push({
                    ...item,
                    columns
                });
            }
        });

        if (keyword && visibleFields.length === 0 && fields.length !== 0) {
            msg = "没有符合的搜索结果";
        }

        return (
            <div
                className={
                    "databind-fields " +
                    (showSearchInput ? "hasSearchInput" : "")
                }
            >
                <div className="databind-fields-title ">
                    <span>字段</span>
                    <span className="databind-fields-operate">
                        <i
                            className="ds-icon ds-icon-search"
                            title="搜索"
                            onClick={() => {
                                this.setState({
                                    showSearchInput: !showSearchInput
                                });
                            }}
                        />
                        {hasBindDataset && (
                            <i
                                className="ds-icon ds-icon-plus"
                                title="新增计算字段"
                                onClick={() => {
                                    this.openCalcFieldPop();
                                }}
                            />
                        )}
                    </span>
                </div>
                <div
                    className="databind-fields-search"
                    style={{
                        display: showSearchInput ? "block" : "none"
                    }}
                >
                    <Input
                        placeholder="输入搜索关键字"
                        value={keyword}
                        onChange={e => {
                            this.setState({
                                keyword: e.target.value
                            });
                        }}
                        size="small"
                    />
                </div>
                {visibleFields.length ? (
                    <Tree
                        className="databind-fields-list"
                        defaultExpandAll={true}
                        onExpand={this.onExpand.bind(this)}
                        defaultExpandedKeys={defaultExpandedKeys}
                    >
                        {loop(this, visibleFields)}
                    </Tree>
                ) : (
                    <div
                        className="nodata"
                        style={{
                            textAlign: "center",
                            color: "#999",
                            padding: "10px 0"
                        }}
                    >
                        {msg}
                    </div>
                )}
                <Modal
                    visible={calcFieldPop.show}
                    wrapClassName="databind-calc-config-wrap"
                    title={
                        calcFieldPop.field && calcFieldPop.field.id
                            ? "修改计算字段"
                            : "新增计算字段"
                    }
                    width="690px"
                    keyboard={false}
                    footer={false}
                    maskClosable={false}
                    getContainer={() => document.body}
                    onCancel={e => {
                        this.closeCalcFieldPop();
                    }}
                >
                    {calcFieldPop.show && (
                        <CalcFieldPop
                            field={calcFieldPop.field}
                            onSave={config => {
                                let method = config.id
                                    ? "updateCalcField"
                                    : "addCalcField";
                                //保存计算字段
                                let result = Dashboard.dataBind[method](
                                    dataset,
                                    config
                                );

                                if (result && result.result === false) {
                                    message.error(result.msg);
                                } else {
                                    this.closeCalcFieldPop();

                                    //如果是修改计算字段，需要更新已使用的计算字段
                                    if (config.id) {
                                        let calcField = Dashboard.dataBind.findFieldById(
                                            config.id
                                        );

                                        updateCalcField({
                                            id: calcField.id,
                                            name: calcField.calcName,
                                            formulaStr: calcField.formulaStr,
                                            type: calcField.type,
                                            contrast: calcField.contrast
                                        });
                                    }

                                    this.setState({
                                        calcFields: Dashboard.dataBind.calcField
                                    });
                                }
                            }}
                            closePop={() => {
                                this.closeCalcFieldPop();
                            }}
                        />
                    )}
                </Modal>
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        dataset: state.databind.dataset,
        fields: state.databind.fields,
        cells: state.databind.cells,
        cellsConfig: state.databind.cellsConfig,
        filterConfig: state.databind.filterConfig,
        modelId: state.databind.modelId
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        addField: (valueKey, defCfg, fields, ind, isDataGroup) => {
            dispatch({
                type: "ADD_FIELD_TO_CELL",
                valueKey,
                defCfg,
                ind,
                fields,
                isDataGroup
            });
        },
        addFilterField: (fields, ind) => {
            dispatch({
                type: "ADD_FIELD_TO_FILTER",
                fields,
                ind
            });
        },
        filterPop: (idx, field, show) => {
            dispatch({
                type: "FILTER_POP",
                idx,
                field,
                show
            });
        },
        setState: newState => {
            dispatch({
                type: "SET_STATE",
                newState
            });
        },
        //设置字段列表
        setFields: fields => {
            dispatch({
                type: "SET_FIELDS",
                payload: fields
            });
        },
        //更新计算字段
        updateCalcField: config => {
            dispatch({
                type: "UPDATE_CALC_FIELD",
                id: config.id,
                field: {
                    name: config.name || "",
                    formulaStr: config.formulaStr || "",
                    type: config.type || "",
                    contrast: config.contrast || {}
                }
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
)(Fields);
