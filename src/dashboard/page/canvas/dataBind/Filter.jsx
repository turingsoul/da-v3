/**
 * 筛选框
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { Icon, Modal, message } from "antd";
import { connect } from "react-redux";
import FilterConfigPop from "./pop/FilterConfigPop";
import $ from "jquery";

const DEFAULT_PROPS = {};
let bingDragObj = {},
    dragObj = {};
class Filter extends Component {
    constructor() {
        super();
        this.state = {
            //当前编辑的字段
            options: null,
            //当店编辑字段idx
            idx: null
        };
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
     * 判断字段是否存在
     * @param {Object} field 要判断的字段对象
     */
    isExist(field) {
        let { filterConfig } = this.props;

        /* //列表找到groupId和fieldId都相同，视为同一个字段
        return !!filterConfig.fields.find(
            v => v.group.id === field.__group.id && v.field.id === field.id
        ); */
        return !!filterConfig.fields.find(
            v =>
                v.field.__group.id === field.field.__group.id &&
                v.field.id === field.field.id
        );
    }
    bindDrag() {
        let _this = this;
        let { reverseFilter, listenerReverseFilter } = this.props;
        $(".databind-filter .databind-cell-field").draggable({
            connectToSortable: ".databind-cell-accept",
            helper: "clone",
            revert: "invalid",
            placeholder: "ui-state-highlight",
            stack: ".databind-cell-accept",
            start(event, ui) {
                let Ele = ui.helper[0];
                // event.currentTarget.display = "none";
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
                $(".databind-filter")
                    .find("div[datatype=" + dragObj.startType + "]")
                    .find("div[dataind=" + Ele.getAttribute("dataind") + "]")
                    .show();
                $(Ele).remove();
                dragObj = {};
            }
        });
        $(".databind-filter .databind-cell-accept").sortable({
            connectWith: "div",
            placeholder: "ui-state-highlight",
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
                let { cells, cellsConfig } = _this.props,
                    cell,
                    _cellcfg;
                if (eleType === "filter") {
                    [...subObj].forEach((e, i) => {
                        e === ui.item[0] && (bingDragObj.stopInd = i);
                    });
                    reverseFilter(bingDragObj);
                } else if (eleType && eleType != "filter") {
                    _cellcfg = cellsConfig[eleType].fields[eleInd];
                    let field = {
                        field: _cellcfg.field,
                        config: {},
                        group: _cellcfg.group
                    };
                    [...parentEle.children].forEach((e, i) => {
                        e === ui.item[0] && (bingDragObj.stopInd = i);
                    });
                    var result = _this.checkFilter(field, bingDragObj.stopInd);
                    result && listenerReverseFilter(bingDragObj, field);
                }
                bingDragObj = {};
            }
        });
    }

    /**
     * 打开筛选字段配置弹框
     * @param {Number} idx 字段在筛选框内index
     */
    openConfigPop(idx) {
        let { filterConfig, filterPop } = this.props;
        let field = filterConfig.fields[idx];
        filterPop(idx, field, true);
    }

    /**
     * 关闭筛选字段配置弹框
     */
    closeConfigPop() {
        let {
            filterConfig,
            delField,
            filterPop,
            triggerListenerReverseFilter
        } = this.props;
        let lastIdx = filterConfig.fields.length - 1;
        let theLast = filterConfig.fields[lastIdx];
        filterPop(null, null, false);
        let isSave = true;
        //在弹窗中点击“取消”或“关闭”按钮关闭弹窗，筛选中移除该字段。
        if (_.isEmpty(theLast.config)) {
            delField(lastIdx);
            isSave = false;
        }
        triggerListenerReverseFilter(isSave);
    }
    componentDidUpdate() {
        this.bindDrag();
    }
    componentDidMount() {
        this.bindDrag();
    }
    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let { className, filterConfig, filterConfigPop } = props;
        let fields = filterConfig.fields || [];
        return (
            <div className={props.className + " databind-cell"}>
                <div className="databind-cell-title">筛选</div>
                <div className="databind-cell-accept" datatype="filter">
                    {fields.length ? (
                        fields.map((item, idx) => {
                            return (
                                <div
                                    key={idx}
                                    className="databind-cell-field databind-filter-item"
                                    dataind={idx}
                                    datatype="filter"
                                >
                                    <div className="flex-align-center databind-filter-item__main">
                                        <div
                                            title={[
                                                item.group.name,
                                                item.field.name
                                            ].join(".")}
                                            style={{
                                                paddingRight: item.field.calc
                                                    ? "60px"
                                                    : "40px"
                                            }}
                                            className="databind-filter-item__left text-ellipsis"
                                        >
                                            {item.field.name}
                                        </div>
                                        <div className="databind-filter-item__right flex-align-center">
                                            {item.field.calc && (
                                                <i
                                                    title="计算字段"
                                                    className="databind-filter-field-calc"
                                                />
                                            )}
                                            <Icon
                                                className="databind-filter-btn__config"
                                                type="ellipsis"
                                                title="配置"
                                                style={{
                                                    marginRight: "5px"
                                                }}
                                                onClick={e => {
                                                    this.openConfigPop(idx);
                                                }}
                                            />
                                            <Icon
                                                className="databind-filter-btn__delete"
                                                title="删除"
                                                type="close"
                                                onClick={e => {
                                                    this.props.delField(idx);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="databind-filter-item__info text-ellipsis">
                                        {(() => {
                                            if (
                                                item.config.allCheckedStatu ===
                                                2
                                            ) {
                                                return item.config.exclude ===
                                                    true
                                                    ? "排除全部"
                                                    : "使用全部";
                                            }
                                            if (
                                                item.config.checked &&
                                                item.config.checked.length
                                            ) {
                                                return (
                                                    (item.config.exclude ===
                                                    true
                                                        ? "已排除"
                                                        : "已选择") +
                                                    item.config.checked.join(
                                                        ","
                                                    )
                                                );
                                            }
                                            return "";
                                        })()}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="nodata">请从左侧拖入字段</div>
                    )}
                </div>
                <Modal
                    visible={filterConfigPop.show}
                    wrapClassName="databind-filter-config-wrap"
                    title={
                        filterConfigPop.show
                            ? "筛选[" + filterConfigPop.field.field.name + "]"
                            : "筛选"
                    }
                    keyboard={false}
                    width="445px"
                    footer={false}
                    maskClosable={false}
                    destroyOnClose={true}
                    getContainer={() => document.body}
                    onCancel={e => {
                        this.closeConfigPop();
                    }}
                >
                    <FilterConfigPop
                        options={filterConfigPop.field}
                        onChangeFilterType={type => {
                            $(".databind-filter-config-wrap .ant-modal").width(
                                type === 1 ? 700 : 455
                            );
                        }}
                        onSave={config => {
                            this.props.updateFieldConfig(
                                filterConfigPop.idx,
                                config
                            );
                            setTimeout(() => this.closeConfigPop(), 100);
                        }}
                        closePop={() => {
                            this.closeConfigPop();
                        }}
                    />
                </Modal>
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        dragField: state.databind.dragField,
        filterConfig: state.databind.filterConfig,
        filterConfigPop: state.databind.filterConfigPop,
        cells: state.databind.cells,
        cellsConfig: state.databind.cellsConfig
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        addField: valueKey => {
            dispatch({
                type: "ADD_FIELD_TO_FILTER",
                valueKey
            });
        },
        reverseFilter: (filterObj, field) => {
            dispatch({
                type: "REVERSE_FIELD_TO_FILTER",
                filterObj,
                field
            });
        },
        delField: idx => {
            dispatch({
                type: "DEL_FIELD_FROM_FILTER",
                idx
            });
        },
        updateFieldConfig: (idx, config) => {
            dispatch({
                type: "UPDATE_FIELD_FROM_FILTER",
                idx,
                config
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
        listenerReverseFilter: (filterObj, field) => {
            dispatch({
                type: "LISTENER_REVERSE_FIELD_TO_FILTER",
                filterObj,
                field
            });
        },
        triggerListenerReverseFilter: isSave => {
            dispatch({
                type: "TRIGGER_LISTENER_REVERSE_FIELD_TO_FILTER",
                isSave
            });
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Filter);
