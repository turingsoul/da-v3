import React, { Component } from "react";
import axios from "axios";
import {
    Col,
    Row,
    Input,
    Popover,
    Button,
    Icon,
    Popconfirm,
    Tree,
    message,
    Spin
} from "antd";
const TreeNode = Tree.TreeNode;
const imgSrc = require("resource/images/icon_dark2.png");
export default class PanelFileSource extends Component {
    constructor(props) {
        super(props);
        this.state = {
            treeData: [],
            iconLoading: false,
            spin: true,
            savePath: props.value || "",
            showFileList: false
        };
        this.folderTree = {};
        this.fileName = "";
        this.isAllowSubmit = true;

        this.showFileList = this.showFileList.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            savePath: nextProps.value || ""
        });
    }
    componentWillMount() {
        /*  this.setState({
            spin: true
        });
        this.fetchData(); */
    }

    fetchData() {
        axios({
            method: "get",
            url: this.props.options.src + "&_=" + +new Date(),
            responseType: "json",
            headers: {
                "content-type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
                Accept: "application/json"
            }
        }).then(
            response => {
                if (response.status == 200) {
                    this.handleData(response.data);
                }
            },
            rej => {
                this.handleData({});
            }
        );
    }
    handleData(data) {
        this.setState({
            treeData: data.children,
            spin: false
        });
    }
    loopTree(tree = [], ii) {
        // 递归创建tree的同时，将文件夹做key，文件做value，进行平行化
        return tree.map((el, i) => {
            //检查,去掉杂乱的数据
            if (el.file.folder == "false") {
                if (/^(?:\.cdfde|\.wcdf|\w+)$/.test(el.file.name)) {
                    return false;
                }
            }
            //文件夹
            if (el.file.folder == "true") {
                !this.folderTree[el.file.path] &&
                    (this.folderTree[el.file.path] = []);
            }
            //文件
            if (el.file.folder == "false") {
                //只记录.saiku的文件
                if (/.+\.(jpg|png|gif|bmp)$/.test(el.file.name)) {
                    let key = el.file.path.substring(
                        0,
                        el.file.path.indexOf(el.file.name) - 1
                    );
                    if (key) {
                        //保存文件名，不要后缀
                        this.folderTree[key].push(el.file.name);
                        //数组去重
                        this.folderTree[key] = [
                            ...new Set(this.folderTree[key])
                        ];
                    }
                }
            }
            return (
                <TreeNode title={el.file.title} key={el.file.path}>
                    {el.file.folder === "true" && el.children
                        ? this.loopTree(el.children, ii + "-" + i)
                        : null}
                </TreeNode>
            );
        });
    }
    onSelect(key, e) {
        if (!key[0]) return false;
        if (this.props.options.type === "image") {
            key[0] =
                "/xdatainsight/api/repos/" +
                key[0].replace(/\//g, ":") +
                "/content";
        }
        this.setState(
            {
                savePath: key[0]
            },
            () => {
                this.props.onChange(key[0]);
            }
        );
    }
    _onSelect(key) {
        this.setState(
            {
                savePath: key
            },
            () => {
                this.props.onChange(key);
            }
        );
    }

    showFileList() {
        const { showFileList } = this.state;

        this.setState(
            {
                showFileList: !showFileList
            },
            () => {
                if (this.state.showFileList) {
                    this.setState({
                        spin: true
                    });
                    this.fetchData();
                }
            }
        );
    }
    _loopTree(arr = [], ii) {
        console.log("arr", arr);
        var filterArr = arr.filter(el => {
            return !(
                el.file.folder !== "true" && !/.+(\..+)$/.test(el.file.name)
            );
        });
        return filterArr.map((el, i) => {
            return (
                <TreeNode
                    key={el.file.path + "_____" + el.file.folder}
                    title={this.setTitle(
                        el.file.folder === "true",
                        el.file.name,
                        el.file.title,
                        el.file.path
                    )}
                >
                    {el.file.folder === "true" && el.children
                        ? this._loopTree(el.children, ii + "-" + i)
                        : ""}
                </TreeNode>
            );
        });
    }
    setTitle(isfolder, type, title, path) {
        let imgPos = "337px -178px";
        isfolder && (imgPos = this.state[path] ? "337px -15px" : "337px 0px");
        /(\.wcdf|\.xdf)$/.test(type) && (imgPos = "337px -93px");
        /(\.saiku)$/.test(type) && (imgPos = "337px -135px");
        /(\.adhoc)$/.test(type) && (imgPos = "337px 0px");
        /(\.xwaqr)$/.test(type) && (imgPos = "337px 0px");
        /(\.html)$/.test(type) && (imgPos = "337px 0px");
        return (
            <span
                style={{ display: "flex", alignItems: "center" }}
                title={title}
            >
                <span
                    style={{
                        display: "inline-block",
                        width: 18,
                        height: 18,
                        marginRight: 5,
                        backgroundImage: "url(" + imgSrc + ")",
                        backgroundPosition: imgPos
                    }}
                />
                {title}
            </span>
        );
    }
    onSelecter(key, e) {
        if (!key.length) {
            return false;
        }
        var strArr = key[0].split("_____"),
            len = strArr.length,
            isFold = strArr.splice(len - 1, 1)[0] === "true",
            strPath = strArr.join("");

        if (/(\.saiku|\.wcdf|\.xdf|\.html|\.htm)$/.test(strPath)) {
            strPath =
                "/xdatainsight/api/repos/" +
                strPath.replace(/\//g, ":") +
                "/run";
        } else {
            strPath =
                "/xdatainsight/api/repos/" +
                strPath.replace(/\//g, ":") +
                "/content";
        }
        isFold ||
            this.setState(
                {
                    savePath: strPath
                },
                () => {
                    this.props.onChange(strPath);
                }
            );
    }
    onExpand(key, e) {
        var strArr = e.node.props.eventKey.split("_____"),
            len = strArr.length,
            isFold = strArr.splice(len - 1, 1)[0] === "true",
            strPath = strArr.join("");
        this.setState({
            [strPath]: e.expanded
        });
    }
    render() {
        const { showFileList } = this.state;
        let haha = this.loopTree(this.state.treeData, 0);
        let treeNode = haha.filter(el => {
            if (el) {
                return true;
            }
        });
        return (
            <div
                className="panel-row"
                style={{
                    overflowX: "hidden",
                    overflowY: "auto",
                    // height: showFileList ? "310px" : "50px"
                    height: 50
                }}
            >
                <Row
                    type="flex"
                    style={{ marginBottom: "15px" }}
                    align="middle"
                >
                    <Col span={6}>{this.props.name}</Col>
                    <Col span={12}>
                        <Input
                            value={this.state.savePath}
                            title={this.state.savePath}
                            onChange={e => this._onSelect(e.target.value, e)}
                        />
                    </Col>
                    {/*<Col span={6}>
                        <Button
                            type="primary"
                            style={{ float: "right", padding: "0px 6px" }}
                            onClick={this.showFileList}
                        >
                            浏览
                            <Icon
                                type={showFileList ? "down" : "right"}
                                style={{ marginLeft: "4px" }}
                            />
                        </Button>
            </Col>*/}
                    <Col span={6}>
                        <Popover
                            placement="bottomRight"
                            onVisibleChange={this.showFileList}
                            content={
                                <Spin tip="Loading" spinning={this.state.spin}>
                                    <div
                                        style={{
                                            width: 215,
                                            height: 300,
                                            overflow: "auto"
                                        }}
                                        className="xfilesrc-popup"
                                    >
                                        <Tree
                                            onSelect={(key, e) =>
                                                this.onSelecter(key, e)
                                            }
                                            onExpand={(key, e) =>
                                                this.onExpand(key, e)
                                            }
                                        >
                                            {this._loopTree(
                                                this.state.treeData,
                                                0
                                            )}
                                        </Tree>
                                    </div>
                                </Spin>
                            }
                            trigger="click"
                        >
                            <Button
                                type="primary"
                                style={{ float: "right", padding: "0px 6px" }}
                            >
                                浏览
                                <Icon
                                    type={showFileList ? "down" : "right"}
                                    style={{ marginLeft: "4px" }}
                                />
                            </Button>
                        </Popover>
                    </Col>
                </Row>
                {/*showFileList ? (
                    <Spin tip="Loading" spinning={this.state.spin}>
                        <div
                            style={{
                                border: "1px solid #d9d9d9",
                                padding: "8px",
                                height: "250px",
                                overflow: "auto",
                                borderRadius: "4px",
                                backgroundColor: "white"
                            }}
                        >
                            <Tree onSelect={(key, e) => this.onSelect(key, e)}>
                                {treeNode}
                            </Tree>
                        </div>
                    </Spin>
                        ) : null*/}
                {/*<Popover
                    placement="bottomRight"
                    content={
                        <div
                            style={{
                                width: 215,
                                height: 300,
                                overflow: "auto"
                            }}
                        >
                            <Tree
                                onSelect={(key, e) => this.onSelecter(key, e)}
                            >
                                {this._loopTree(this.state.treeData, 0)}
                            </Tree>
                        </div>
                    }
                    trigger="click"
                >
                    <Button
                        type="primary"
                        style={{ float: "right", padding: "0px 6px" }}
                    >
                        浏览
                        <Icon type={"right"} style={{ marginLeft: "4px" }} />
                    </Button>
                </Popover>*/}
            </div>
        );
    }
}
