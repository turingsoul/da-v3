/**
 * 数据集
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { Input, Modal, Button, Icon } from "antd";
import { connect } from "react-redux";
import databindM from "dashboard/modules/business/databind";
import Config from "dashboard/modules/common/Config";
import DivLoading from "dashboard/components/common/DivLoading";
import classnames from "classnames";

const Search = Input.Search;

const DEFAULT_PROPS = {};

class DatasetSelectPop extends Component {
    constructor() {
        super();
        this.state = {
            loading: false,
            keyword: "",
            list: []
        };
    }

    /**
     * 根据数据集查询对应字段信息
     * @param {String} name 业务数据集名称
     */
    getFieldsByDataset(name) {
        return databindM.getFieldsByDataset(name);
    }

    /**
     * 判断组件是否绑定了字段或筛选
     * @return {Boolean} true：已绑定 false:未绑定
     */
    isBindField() {
        let { cellsConfig, filterConfig } = this.props;
        let result = false;

        for (let key in cellsConfig) {
            let cellConfig = cellsConfig[key];
            if (cellConfig.fields.length) {
                return true;
            }
        }

        if (filterConfig.fields.length > 0) {
            return true;
        }

        return result;
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
            //清楚数据分组数据
            window.dataSetGroupObj = {};
            let { modelId, fields } = rep;
            this.props.setState({
                modelId
            });
            setFields(fields);
        });

        this.props.closeFn && this.props.closeFn();
    }

    componentDidMount() {
        this.setState({
            loading: true
        });
        databindM.getDatasetList().then(
            rep => {
                let list = rep.data || [];
                this.setState({
                    list: list,
                    loading: false
                });
            },
            () => {
                this.setState({
                    loading: false
                });
            }
        );
    }

    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        const _this = this;
        let { selectedName, changeKeyword } = props;
        let { list, keyword, loading } = this.state;
        let visibleList;
        let msg = "",
            specialArr = [],
            numArr = [],
            letterArr = [],
            chinaArr = [];

        visibleList = list.filter(item => {
            let reg = new RegExp(keyword, "i");
            return reg.test(item.name);
        });
        if (visibleList.length) {
            visibleList = visibleList.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            numArr = visibleList.filter(e => /\d/.test(e.name.slice(0, 1)));
            letterArr = visibleList.filter(e =>
                /[a-zA-Z]/.test(e.name.slice(0, 1))
            );
            chinaArr = visibleList.filter(e => e.name.charCodeAt() >= 20000);
            specialArr = visibleList.filter(
                e =>
                    !/\d|[a-zA-Z]/.test(e.name.slice(0, 1)) &&
                    e.name.charCodeAt() < 20000
            );
            visibleList = [...specialArr, ...numArr, ...letterArr, ...chinaArr];
        }

        if (keyword && visibleList.length === 0 && list.length !== 0) {
            msg = "没有符合的搜索结果";
        }

        return (
            <div className="databind-dataset-select">
                <div
                    style={{
                        padding: "3px 0 10px 0",
                        color: "#444"
                    }}
                >
                    选择业务数据集
                </div>
                <Search
                    value={keyword}
                    placeholder="输入搜索关键字"
                    onChange={e => {
                        _this.setState({
                            keyword: e.target.value
                        });
                    }}
                    onSearch={value => {
                        _this.setState({
                            keyword: value
                        });
                    }}
                    style={{ marginBottom: "5px" }}
                />
                <div
                    style={{
                        height: "200px",
                        overflow: "auto",
                        marginTop: "5px"
                    }}
                >
                    <ul>
                        {visibleList.length ? (
                            visibleList.map((item, idx) => {
                                let showName = databindM.removeDatasetSuffix(
                                    item.name
                                );
                                return (
                                    <li
                                        className={classnames({
                                            "text-ellipsis": true,
                                            selected: item.name === selectedName
                                        })}
                                        onClick={() => {
                                            if (item.name === selectedName) {
                                                return;
                                            }
                                            //如果已经选择了数据集，并且绑定了数据集中的字段，提示用户,否则直接进行切换
                                            if (
                                                selectedName &&
                                                this.isBindField()
                                            ) {
                                                Modal.confirm({
                                                    zIndex: 2000,
                                                    title: "提示",
                                                    okText: "清除",
                                                    content:
                                                        "切换工作表后将清空当前图表的配置，是否继续？",
                                                    onCancel() {},
                                                    onOk() {
                                                        _this.switchSelectedDataset(
                                                            item
                                                        );
                                                    }
                                                });
                                            } else {
                                                _this.switchSelectedDataset(
                                                    item
                                                );
                                            }
                                        }}
                                        key={item.name}
                                        title={showName}
                                    >
                                        {showName}
                                        {item.name === selectedName && (
                                            <Icon type="check" />
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <div
                                className="nodata"
                                style={{
                                    textAlign: "center",
                                    color: "#999",
                                    padding: 0
                                }}
                            >
                                {msg}
                            </div>
                        )}
                    </ul>
                </div>
                <div
                    style={{
                        textAlign: "center"
                    }}
                >
                    <Button
                        icon="plus-circle"
                        style={{
                            cursor: "pointer",
                            border: "none",
                            color: "#1890ff",
                            padding: 0
                        }}
                        onClick={e => {
                            if (window.parent) {
                                let data = {
                                    type: "ADD_DATASOURCE_MODEL"
                                };
                                data = JSON.stringify(data);
                                window.parent.postMessage(data, "*");
                                this.props.closeFn && this.props.closeFn();
                            }
                        }}
                    >
                        新增业务数据集
                    </Button>
                </div>
                <DivLoading show={loading} />
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        cellsConfig: state.databind.cellsConfig,
        filterConfig: state.databind.filterConfig,
        selectedName: state.databind.dataset.name
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
)(DatasetSelectPop);
