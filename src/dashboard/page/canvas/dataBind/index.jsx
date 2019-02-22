/**
 * 数据绑定弹窗主界面
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Icon, Modal, message } from "antd";
import PageDataset from "./PageDataset";
import PageSql from "./PageSql";
import "util/jquery-ui/jquery-ui.min";
import "util/jquery-ui/jquery-ui.structure.min.css";
import "util/jquery-ui/jquery-ui.theme.min.css";
import $ from "jquery";
import databindM, { commonValid } from "dashboard/modules/business/databind";

const DEFAULT_PROPS = {
    title: "标题"
};

class DataBind extends Component {
    constructor() {
        super();
        this.state = {};
        this.flag = false;
    }

    /**
     * 切换数据集
     * @param {Object} dataset 要切换到的数据集对象
     */
    switchSelectedDataset(dataset) {
        let { setSelectedDataset, setFields } = this.props;

        //缓存最后一次选择的数据集
        window._databind_last_dataset = dataset;

        //更新数据集
        setSelectedDataset(dataset);

        this.props.setState({
            modelId: ""
        });

        //清空字段
        setFields([]);

        //更新数据集对应字段
        this.getFieldsByDataset(dataset.name).then(rep => {
            let { modelId, fields } = rep;
            this.props.setState({
                modelId
            });
            setFields(fields);
        });

        this.props.closeFn && this.props.closeFn();
    }

    componentDidMount() {
        let newState = {};
        let cfg = this.props.cfg;

        //初始化返填
        if (cfg) {
            let query = cfg.chartDefinition.query;
            //切换至组件对应的类型
            this.props.switchCom(cfg.type, cfg);
            //如果配置过数据绑定
            if (query) {
                let { type, datasetSetting } = query;
                newState.component = cfg;
                //如果绑定的是业务数据集，返填
                if (type === "dataset") {
                    Object.assign(newState, datasetSetting, {
                        mode: "dataset"
                    });
                } else if (type === "sql") {
                    Object.assign(newState, {
                        sqlCfg: {
                            query: query.query,
                            jndi: query.jndi,
                            param: query.param
                        },
                        isNoQuery: query.isNoQuery,
                        mode: "sql"
                    });
                }
            }
        }
        this.flag = true;
        this.props.setState(newState);
    }

    componentDidUpdate() {
        this.props.updateComponentShowMax();
    }

    componentWillUnmount() {
        let currentId = this.props.component.id;

        Dashboard.compManager.deleteComponent("databind_component_id");
        this.props.resetState();

        if (currentId) {
            let selectedCom = Dashboard.compManager.getComponent(currentId);
            window.Dashboard.event.dispatch("panelChange", {
                name: selectedCom.cfg.type,
                data: { id: currentId }
            });
        }
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
            mode,
            updateCfg,
            switchMode,
            cells,
            cellsConfig,
            component
        } = props;
        let cellsValid = this._cellsValid(cells, cellsConfig);
        let componentType = props.cfg.type || "";

        let _this = this;

        return (
            <div className="databind-pop">
                <div className="databind-pop-top">
                    <span
                        style={{
                            color: "#333",
                            fontSize: "14px",
                            fontWeight: "bold"
                        }}
                    >
                        <Icon
                            type="left"
                            title="返回"
                            style={{
                                cursor: "pointer",
                                marginRight: "3px",
                                color: "#666"
                            }}
                            onClick={() => {
                                Modal.confirm({
                                    zIndex: 2000,
                                    title: "提示",
                                    okText: "是",
                                    cancelText: "否",
                                    content: "是否确认离开数据绑定配置页面？",
                                    onCancel() {},
                                    onOk() {
                                        _this.props.closepop();
                                    }
                                });
                            }}
                        />
                        {props.title}
                    </span>
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                            let { databind } = this.props;
                            if (!component || !component.chartDefinition) {
                                props.closepop();
                                return;
                            }
                            let isdataset =
                                mode === "dataset" && cellsValid === false;
                            let query = component.chartDefinition.query,
                                isQueryed;
                            let issql =
                                mode === "sql" && (!query.jndi || !query.query);
                            isQueryed =
                                Dashboard.compManager.temporaryComponents
                                    .databind_component_id.cfg.chartDefinition
                                    .query.isQueryed; //是否是查询完成
                            if (isdataset || issql) {
                                message.error("配置不正确，请检查后保存！");
                                return;
                            }
                            if (props.onComplete) {
                                updateCfg();
                                if (isQueryed === false) {
                                    message.error("数据获取中，请稍候...");
                                } else {
                                    props.onComplete(component);
                                }
                            }
                        }}
                    >
                        完成
                    </Button>
                </div>
                {this.flag ? (
                    mode === "sql" ? (
                        <PageSql />
                    ) : (
                        <PageDataset />
                    )
                ) : (
                    ""
                )}
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        // cellsValid: state.databind.cellsValid,
        mode: state.databind.mode,
        cells: state.databind.cells,
        cellsConfig: state.databind.cellsConfig,
        component: state.databind.component
        // databind: state.databind
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        resetState: () => {
            dispatch({
                type: "RESET_STATE"
            });
        },
        setState: newState => {
            dispatch({
                type: "SET_STATE",
                newState
            });
        },
        switchMode: mode => {
            dispatch({
                type: "SWITCH_MODE",
                mode
            });
        },
        switchCom: (type, cfg) => {
            dispatch({
                type: "SWITCH_COMPONENT_TYPE",
                comType: type,
                cfg,
                isInit: true
            });
        },
        updateCfg: () => {
            dispatch({
                type: "UPDATE_CFG",
                isSave: true
            });
        },
        updateComponentShowMax: () => {
            dispatch({
                type: "UPDATE_COM_SHOW_MAX"
            });
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DataBind);
