/**
 * 数据集绑定
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Icon, Modal } from "antd";
import Dataset from "./Dataset";
import Fields from "./Fields";
import Cells from "./Cells";
import Filter from "./Filter";
import ComponentList from "./ComponentList";
import Limit from "./Limit";
import Stage from "./Stage";
import databindM from "dashboard/modules/business/databind";

const DEFAULT_PROPS = {};

class PageDataset extends Component {
    constructor() {
        super();
        this.state = {
            datasetFold: false
        };

        this.onAddNewDataset = this.onAddNewDataset.bind(this);
    }

    onAddNewDataset(eventData){
        try {
            let dataset = this.props.dataset;
            let name = eventData.name;

            name = name.replace(/\.xmi$/,'');

            //如果未选择数据集，自动切换
            if(!dataset.name){
                this.switchSelectedDataset({
                    name: name + '.xmi',
                    type:'metadata'
                });
            }
        } catch (error) {
            console.log(error);
        }
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
    }

    /**
     * 根据数据集查询对应字段信息
     * @param {String} name 业务数据集名称
     */
    getFieldsByDataset(name) {
        return databindM.getFieldsByDataset(name);
    }

    componentWillUnmount(){
        Dashboard.event.unsubscribe('DATASET_ADDED',this.onAddNewDataset);
    }

    componentWillMount() {
        let datasetName = this.props.dataset.name;
        let newState = {};

        //获取能绑定数据集的组件列表
        let components = databindM.getDatasetComponents();
        this.props.setState({ components });

        //如果没有绑定数据集，并且之前有选过数据集，将最后一次选择过的数据集作为当前数据集
        if (!datasetName && window._databind_last_dataset) {
            datasetName = window._databind_last_dataset.name;
            newState.dataset = window._databind_last_dataset;
        }

        //如果绑定了具体业务数据集，查询该数据集下字段并返填
        if (datasetName) {
            databindM.getFieldsByDataset(datasetName).then(rep => {
                let { modelId, fields } = rep;
                Object.assign(newState, {
                    modelId: modelId,
                    fields: fields
                });
                this.props.setState(newState);
            });
        }

        Dashboard.event.subscribe('DATASET_ADDED',this.onAddNewDataset);
    }

    /**
     * 处理展开收起
     */
    changeFold() {
        let comIns = Dashboard.compManager.getComponent(
            "databind_component_id"
        );
        this.setState(
            {
                datasetFold: !this.state.datasetFold
            },
            () => {
                this.props.updateComponentShowMax();

                if (comIns && comIns.resize) {
                    comIns.resize();
                }
            }
        );
    }

    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let { switchMode, component } = props;
        let { datasetFold } = this.state;
        let componentType = component.type || "";
        let _this = this;

        return (
            <div
                className={
                    "databind-pop-dataset " +
                    (datasetFold ? "datasetFold" : "")
                }
            >
                <div className="databind-pop-dataset-left">
                    <Dataset datasetFold={datasetFold}/>
                    <Fields />
                    <div
                        onClick={() => {
                            this.changeFold();
                        }}
                        className="databind-fold"
                    >
                        <Icon
                            type={datasetFold ? "right" : "left"}
                        />
                    </div>
                </div>
                <div className="databind-pop-dataset-center">
                    {componentType && <Cells className="databind-cells" />}
                    {componentType && <Filter className="databind-filter" />}
                </div>
                <div className="databind-pop-dataset-right">
                    <ComponentList className="databind-components" />
                    <Stage className="databind-stage" />
                    <Limit className="databind-limit" />
                </div>
                <div
                    className="databind-pop-switch"
                    onClick={() => {
                        switchMode("sql");
                    }}
                >
                    &#60; SQL自定义分析模式
                </div>
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        mode: state.mode,
        dataset: state.databind.dataset,
        component: state.databind.component
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
        switchMode: mode => {
            dispatch({
                type: "SWITCH_MODE",
                mode
            });
        },
        updateComponentShowMax: () => {
            dispatch({
                type: "UPDATE_COM_SHOW_MAX"
            });
        },
        //设置数据集
        setSelectedDataset: selected => {
            dispatch({
                type: "SWITCH_SELECTED_DATASET",
                payload: selected
            });
        },
        //设置字段列表
        setFields: fields => {
            dispatch({
                type: "SET_FIELDS",
                payload: fields
            });
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PageDataset);
