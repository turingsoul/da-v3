/**
 * 数据集
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { Popover, Icon, Tooltip } from "antd";
import { connect } from "react-redux";
import DatasetSelectPop from "./pop/DatasetSelectPop";
import $ from "jquery";
import databindM from "dashboard/modules/business/databind";

const DEFAULT_PROPS = {};

class Dataset extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectPopVisible: false
        };
    }

    componentDidMount() {
        //点击除popover外区域，关闭popover
        $(document)
            .off("click.DATASET_SELECT_POP")
            .on("click.DATASET_SELECT_POP", e => {
                let $target = $(e.target);
                if (
                    $target.closest(".databind-dataset-switch,.ant-popover")
                        .length === 0
                ) {
                    this.closeSelectPop();
                }
            });
    }

    componentWillUnmount(){
        $(document).off("click.DATASET_SELECT_POP");
    }

    //关闭数据集选择弹框
    closeSelectPop() {
        this.setState({
            selectPopVisible: false
        });
    }

    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let { datasetFold, className } = props;
        let { selectPopVisible } = this.state;
        let { name } = props.dataset;
        let showName = '';

        if(name){
            showName = databindM.removeDatasetSuffix(name);
        }

        return (
            <div ref="dataset" className={"databind-dataset " + (className || "")}>
                <div className="databind-dataset-title">业务数据集</div>
                <Tooltip 
                    className="databind-dataset-tooltip"
                    placement="right" 
                    title="请添加业务数据集" 
                    getPopupContainer={(triggerNode)=>{
                        return triggerNode;
                    }}
                    visible={name === '' && !selectPopVisible && !datasetFold}
                    >
                </Tooltip>
                {name ? (
                    <div
                        title={name}
                        className="databind-dataset-selected text-ellipsis"
                    >
                        <i />
                        {showName}
                        <i
                            className="ds-icon ds-icon-edit"
                            title="编辑数据集"
                            style={{
                                position: "absolute",
                                right: "2px",
                                cursor: "pointer",
                                top: "8px"
                            }}
                            onClick={() => {
                                if (window.parent) {
                                    let data = {
                                        type: "EDIT_DATASET",
                                        data: {
                                            name: name
                                        }
                                    };
                                    data = JSON.stringify(data);
                                    window.parent.postMessage(data, "*");
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="nodata">请添加业务数据集</div>
                )}
                {
                    <Popover
                        placement="rightTop"
                        title=""
                        visible={selectPopVisible}
                        className="databind-datasetSelect-pop"
                        content={
                            selectPopVisible ? (
                                <DatasetSelectPop
                                    closeFn={this.closeSelectPop.bind(this)}
                                />
                            ) : (
                                ""
                            )
                        }
                    >
                        <Icon
                            className="databind-dataset-switch"
                            title={name ? "切换数据集" : "选择数据集"}
                            type={name ? "swap" : "plus"}
                            onClick={() => {
                                this.setState({
                                    selectPopVisible: !selectPopVisible
                                });
                            }}
                        >
                        </Icon>
                    </Popover>
                }
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        dataset: state.databind.dataset
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Dataset);
