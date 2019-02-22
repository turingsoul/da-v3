import React, { Component } from "react";
import { Provider, connect } from "react-redux";
import _ from "lodash";
import submit from "submit/index";
import Canvas from "page/canvas/canvas";
import AppHandle from "util/AppHandle";
import { Scrollbars } from "react-custom-scrollbars";
import Reedite from "reedite/index";
import {
    LocaleProvider,
    Layout,
    Menu,
    Breadcrumb,
    Icon,
    Button,
    Tabs,
    Dropdown,
    message
} from "antd";
import $ from "jquery";
import "resource/style/reset.css";
import "resource/style/global.css";
import "resource/style/app.css";
import "resource/font/unicode.css";
import "rc-trigger/assets/index.css";
import "babel-polyfill";
import asyncComponent from "util/asyncComponent";
// 需要时再放开mock启用模拟接口调试
// import "./dashboard/mock";

const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;
const TabPane = Tabs.TabPane;
let Menus = asyncComponent(() => import("page/menus/menus"));
let Panel = asyncComponent(() => import("page/panels/panels"));
let CssAndJsPop = asyncComponent(() => import("page/panels/cssAndJsPop"));

let isFirsteEddeit = false;

class App extends AppHandle {
    constructor(props) {
        super(props);
        this._init(); //初始化挂载监听
        Reedite();
    }

    //收起或展开组件菜单栏
    onCollapse(collapsed) {
        this.setState({
            collapsed
        });
        this.updateLeftScrollBar();
    }

    _init() {
        const { showNormal, showPrivate, showError } = this;

        this.state = {
            editeMode: this.checkMode(), //判断是会否是编辑状态
            collapsed: false, //判断是否是否可收起
            inputPassWord: "",
            canvasHeight: () =>
                this.checkMode() ? "100%" : "calc(100% - 76px)", //画布高度
            canvasWidth: () =>
                this.state.editeMode
                    ? document.body.clientWidth
                    : document.body.clientWidth - 183 - 362 - 24 - 12, //画布宽度
            width: "auto",
            iconLoading: false,
            previewLoading: false, //预览
            allMenuConfig: window.Dashboard.componentList //菜单配置   可通过外部注入更改
            /* panelRouter: {
                //操作面板的切换  默认为canvas
                name: "canvas",
                data: {}
            } */
        };

        window.Dashboard.event.subscribe("COM_LIST_CHANGED", data => {
            this.setState({
                allMenuConfig: window.Dashboard.componentList
            });
        });
    }

    //收起或展开组件菜单栏
    onCollapse(collapsed) {
        this.setState({ collapsed });
        this.updateLeftScrollBar();
    }

    //预览
    preview() {
        //取出数据存进localStorage里面
        let dsh = new submit();
        dsh.init();
        let newWindowPath = "dashboard_" + +new Date();
        sessionStorage.setItem(newWindowPath, JSON.stringify(dsh));
        // let newWindow = window.open(`../#path=${newWindowPath}&type=1`); //本地使用
        let _location = window.location;
        let newWindow = window.open(
            // `../dashboard-v3/index.html#path=${newWindowPath}&type=1`
            _location.origin +
                _location.pathname +
                `#path=${newWindowPath}&type=1`
        ); //打包提交
    }
    //添加面板切换
    setRouter(router) {
        let routerConfig = {
            0: "theme",
            1: "param",
            2: "save",
            3: "extends"
        }[router.key];
        $(".com-btns").hide();
        $(".component_container").css("borderColor", "transparent");
        window.Dashboard.event.dispatch("panelChange", {
            name: routerConfig,
            data: {}
        });
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                canvasWidth: () => {
                    let width = "",
                        clientWidth = document.body.clientWidth,
                        stateWidth = parseFloat(this.state.width),
                        isAuto =
                            this.state.width === "auto" || !this.state.width;
                    if (this.state.editeMode) {
                        return isAuto ? clientWidth : stateWidth;
                    } else {
                        if (this.state.collapsed) {
                            return isAuto
                                ? clientWidth - 200 - 361 + 120
                                : stateWidth;
                        }
                        return isAuto ? clientWidth - 200 - 362 : stateWidth;
                    }
                }
            });
        }, 100);
    }

    updateLeftScrollBar() {
        setTimeout(() => {
            if (this._scrollbarIns && this._scrollbarIns.update) {
                this._scrollbarIns.update();
            }
        }, 300);
    }

    // handleCancel() {
    //     const {isShowModel,isVisible} = this.state;
    //     this.setState(
    //       isVisible: !isVisible
    //     });
    // }

    onChange(value) {
        this.setState({
            inputPassWord: value
        });
    }

    render() {
        const menu = (
            <Menu onClick={e => this.setRouter(e)}>
                <Menu.Item key="3">页面扩展</Menu.Item>
                <Menu.Item key="0">主题设置</Menu.Item>
                <Menu.Item key="1">管理参数</Menu.Item>
            </Menu>
        );
        return (
            <div
                style={{ width: "100%", height: "100%", position: "relative" }}
            >
                <CssAndJsPop />
                <Layout
                    style={{
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0
                    }}
                >
                    {!this.state.editeMode ? (
                        <Sider
                            collapsible
                            collapsed={this.state.collapsed}
                            onCollapse={this.onCollapse.bind(this)}
                            style={{
                                width: 183,
                                height: "100%",
                                overflow: "auto",
                                borderRight: "1px #ccc solid"
                            }}
                            className="side-left"
                        >
                            <Scrollbars
                                autoHide
                                ref={node => (this._scrollbarIns = node)}
                            >
                                <Menus
                                    allMenuConfig={this.state.allMenuConfig}
                                    onOpenChange={() => {
                                        this.updateLeftScrollBar();
                                    }}
                                />
                            </Scrollbars>
                        </Sider>
                    ) : null}

                    <Layout style={{ overflow: "hidden", height: "100%" }}>
                        <Content
                            ref={ct => (this.ct = ct)}
                            className="layout-Contentbb"
                            style={{
                                height: this.state.canvasHeight(),
                                backgroundColor: "#DBE5EA"
                            }}
                        >
                            <Scrollbars
                                autoHide
                                style={{
                                    minHeight: "100%",
                                    height: "100%"
                                }}
                            >
                                <Canvas
                                    ref={ct => (this.ctt = ct)}
                                    canvasWidth={this.state.canvasWidth()}
                                    editeMode={this.state.editeMode}
                                />
                            </Scrollbars>
                        </Content>
                        {!this.state.editeMode ? (
                            <Footer
                                style={{
                                    textAlign: "right",
                                    height: 76,
                                    borderTop: "1px #ccc solid"
                                }}
                                className="layout-footer-btns"
                            >
                                <Dropdown overlay={menu} placement="topCenter">
                                    <Button icon="setting">设置</Button>
                                </Dropdown>

                                <Button
                                    icon="eye-o"
                                    loading={this.state.previewLoading}
                                    onClick={e => this.preview(e)}
                                >
                                    预览
                                </Button>
                                <Button
                                    icon="save"
                                    type="primary"
                                    onClick={e => this.setRouter({ key: 2 })}
                                >
                                    保存
                                </Button>
                            </Footer>
                        ) : null}
                    </Layout>
                    {!this.state.editeMode ? (
                        <Sider
                            className="side-right"
                            reverseArrow={true}
                            collapsed={false}
                            width={362}
                            style={{
                                backgroundColor: "#E9EFF2",
                                borderLeft: "1px #ccc solid"
                            }}
                        >
                            <Panel />
                        </Sider>
                    ) : null}
                </Layout>
            </div>
        );
    }
}

export default App;
