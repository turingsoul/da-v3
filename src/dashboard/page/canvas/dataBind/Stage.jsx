/**
 * 组件展示区
 * create time: 2018/8/28
 */
import React, { Component, isEqual } from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import databindM,{ commonValid } from "dashboard/modules/business/databind";
import Util from "dashboard/modules/common/Util";
import $ from "jquery";

const DEFAULT_PROPS = {};
const util = new Util();

class Stage extends Component {
    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        $(window)
            .off("resize.DATABIND_STAGE")
            .on("resize.DATABIND_STAGE", () => {
                let comIns = Dashboard.compManager.getComponent(
                    "databind_component_id"
                );

                if (comIns && comIns.resize) {
                    comIns.resize();
                }
            });
            
        //组件为异步渲染，需要在组件渲染完成时执行一次更新
        window.Dashboard.event.one('databind_component_id_rendered', ins =>{
            this.update();
        })
    }

    componentWillUnmount(){
        window.Dashboard.event.unsubscribe('databind_component_id_rendered');
    }

    /**
     * 判断组件是否绑定了字段
     * @return {Boolean} true：已绑定 false:未绑定
     */
    isBindField() {
        let cellsConfig = this.props.cellsConfig;
        let result = false;

        for (let key in cellsConfig) {
            let cellConfig = cellsConfig[key];
            if (cellConfig.fields.length) {
                result = true;
                break;
            }
        }

        return result;
    }

    update(){
        let {
            component,
            updateCfg,
            // cellsValid,
            cellsConfig,
            cells,
            mode,
            sqlCfg,
            noQuery
        } = this.props;
        let updateAction = Object.assign({}, window.updateAction || {});
        let cellsValid = this._cellsValid(cells, cellsConfig);
        let query;
        let ins = databindM.getDatabindComIns();
        let needQuery = false; //是否需要重新请求数据

        if (ins) {
            //更新状态中component
            updateCfg();

            //深度比较两个对象，如果相同，组件不必重新请求数据
            ins.cfg.chartDefinition.query.isNoQuery =
                component.chartDefinition.query.isNoQuery;
            needQuery = !util.deepCompare(
                ins.cfg.chartDefinition.query,
                component.chartDefinition.query
            );

            //将最新query传递至组件
            ins.cfg.chartDefinition.query = util.deepClone(
                component.chartDefinition.query
            );
            let isCellReady = mode === "dataset" && cellsValid && !noQuery,
                isQuery = mode === "sql" && !!sqlCfg.jndi && !!sqlCfg.query;
            //嵌套环形图排序处理
            /* if (component.type === "chartNestpie" && isCellReady) {
                Object.assign(component.chartDefinition.option, {
                    sort: null
                });
                Object.assign(
                    Dashboard.compManager.temporaryComponents
                        .databind_component_id.cfg.chartDefinition.option,
                    {
                        sort: null
                    }
                );
                if (
                    updateAction.key === "sort" &&
                    updateAction.value !== "none"
                ) {
                    databindM.callComIns("update", [
                        {
                            option: {
                                sort: {
                                    key: updateAction.valueKey,
                                    value: updateAction.value
                                }
                            }
                        }
                    ]);
                    window.updateAction = undefined;
                    return false;
                }
            } */
            //如果组件字段验证通过，组件刷新
            if (isCellReady || isQuery) {
                ins.cfg.chartDefinition.query.isNoQuery = false;
                component.chartDefinition.query.isNoQuery = false;
                Dashboard.compManager.temporaryComponents.databind_component_id.cfg.chartDefinition.query.isNoQuery = false;
                needQuery && databindM.callComIns("doQuery", []);
            } else {
                databindM.callComIns("update", [{ data: {} }]);
            }
        }
    }

    componentDidUpdate() {
        this.update();
    }

    /**
     * 验证格子内字段数量是否符合约束
     * @param {Array} cells 当前类型图标对应格子列表
     * @param {Object} cellsConfig 对应类型格子config对象
     */
    _cellsValid(cells = [], cellsConfig = []) {
        var isFalse = false;
        try {
            let lenArr = cells.map(
                item => cellsConfig[item.valueKey].fields.length
            );
            let _cellsValidArr = cells.map((item, idx) =>
                item.valid.call(item, lenArr[idx], lenArr, commonValid)
            );
            isFalse = !_cellsValidArr.find(v => v.result === false);
        } catch (e) {}

        return isFalse;
    }

    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let {
            className,
            component,
            components,
            cellsConfig,
            cells,
            mode,
            sqlCfg
        } = props;
        let cellsValid = this._cellsValid(cells, cellsConfig);
        let Item = window.Dashboard.reactComponent[component.type] || (
            <div>
                未知组件或该组件未加载[
                {component.type}]
            </div>
        );
        let hasBindField = this.isBindField();
        let isCellReady = mode === "dataset" && hasBindField && cellsValid;
        let isQuery = mode === "sql" && !!sqlCfg.jndi && !!sqlCfg.query;
        let stageStyle = {},
            imgStyle = { height: "100%", width: "100%" };
        let themeBody =
            window.Dashboard.globalParam.globalParam.theme.body || {};
        let chartBody =
            window.Dashboard.globalParam.globalParam.theme.chart || {};
        let { backgroundColor } = themeBody;

        if (backgroundColor) {
            if (backgroundColor.indexOf("linear-gradient") > -1) {
                stageStyle.backgroundImage = backgroundColor;
            } else {
                stageStyle.backgroundColor = backgroundColor;
            }
        }
        if (chartBody) {
            imgStyle.backgroundColor = chartBody.backgroundColor;
        }
        return (
            <div className={className} id="databind-stage" style={stageStyle}>
                {components.map(
                    v =>{
                        if(v.type === component.type){
                            return (
                                <div
                                    className="flex-align-center"
                                    key={v.type}
                                    id="databind_component_id"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        justifyContent: "center"
                                    }}
                                >
                                    {(isCellReady || isQuery) ? (
                                        <Item
                                            editeMode={true}
                                            temporary={true}
                                            data={{
                                                ...component,
                                                ...{ id: "databind_component_id" }
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={imgStyle}
                                            className={classnames([
                                                "component-default-image",
                                                "component-default-" + v.type
                                            ])}
                                        />
                                    )}
                                </div>
                            )
                        }
                    }
                )}
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        limit: state.databind.limit,
        cellsConfig: state.databind.cellsConfig,
        cells: state.databind.cells,
        filterConfig: state.databind.filterConfig,
        // cellsValid: state.databind.cellsValid,
        component: state.databind.component,
        components: state.databind.components,
        mode: state.databind.mode,
        sqlCfg: state.databind.sqlCfg,
        noQuery: state.noQuery
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        updateCfg: () => {
            dispatch({
                type: "UPDATE_CFG"
            });
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Stage);
