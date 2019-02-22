import React, { Component } from "react";
import { Layout, Menu, Breadcrumb, Icon, Button, Tabs, Modal } from "antd";
import canvasHandle from "./canvasHandle";
import Immutable from "immutable";
import $ from "jquery";
import "util/react-grid-layout/layout.css";
import "util/react-grid-layout/resizable.css";
import "resource/style/app.css";
import dot from "resource/images/dot.png";
import Util from "dashboard/modules/common/Util";
import ReactGridLayout from "util/react-grid-layout/index";
import widgetComponent from "componentsUi/widgetComponent";
import BigSmallChart from "./bigsmallchart";
import { connect } from "react-redux";
import asyncComponent from "util/asyncComponent";

const { Header, Content, Footer, Sider } = Layout;
const gridBack = `url(${dot})  0 0/13px 13px repeat`;
const util = new Util();
let DataBindPop = asyncComponent(() => import("page/canvas/dataBind"));

class Canvas extends canvasHandle {
    constructor(props) {
        super(props);

        this.state = {
            width: "",
            components: [],
            cols: 12, //栅格  十份
            rowHeight: 30, //栅格  每份高度
            dataBind: {
                visible: false,
                component: null
            }
        };

        this.activeGridItemId = null;
        this.resizeChildren = [];

        window.Dashboard &&
            window.Dashboard.event.subscribe("windowResize", () => {
                this.onResizeStop();
            });
    }

    menuDrop(e) {
        this.menuDroper(e);
    }

    onDragStop() {
        //layout, l, b, aa, e, node
        /*let argument = arguments;
        arguments[4].stopPropagation();
        let id = arguments[5].id;
        this.setActionState(id, arguments[2], arguments[4]);*/
        // this.state.components.find(e => e.id === id).layout = arguments[2];
    }
    onResizeStop() {
        /*arguments[4].stopPropagation();
        let id = arguments[5].parentElement.id;
        this.setActionState(id, arguments[2], arguments[4]);*/
        /*let selfCompoment = this.state.components.find(e => e.id === id);
            selfCompoment && (selfCompoment.layout = arguments[2]);*/
        //resize组件
        setTimeout(() => {
            this.resizeChildren.forEach(child => {
                child && child.resize();
            });
        }, 200);
    }
    componentDidMount() {
        let domWid = this.rootDom.clientWidth - 183 - 362 - 48;
        this.setState({
            width: domWid
        });
    }
    onLayoutChange() {
        var layouts = arguments[0];
        // this.setState({aaa: +new Date()});
        this.setActionState(layouts);
        /*setTimeout(()=>{
            this.setState({
                aa: +new Date()
            })
        },100)*/
    }
    handleChick(e) {
        let $target = $(e.target);
        e.stopPropagation();

        if ($target.closest("#background-container").length > 0) {
            $(".com-btns").hide();
            $(".component_container").css({
                borderColor: "transparent"
            });
            Dashboard.selectedIds = [];
            window.Dashboard.event.dispatch("panelChange", {
                name: "canvas",
                data: {}
            });
        }
    }
    outDivStype() {
        let width = this.props.canvasWidth;
        const editerStyle = {
                padding: "0px 0px 60px 0px",
                minHeight: "100%",
                margin: "auto",
                width: width
            },
            previewStyle = {
                minHeight: "100%",
                margin: "auto",
                width
            };
        return Object.assign(
            this.props.editeMode ? previewStyle : editerStyle,
            { backgroundColor: "#e6eef2", position: "relative" }
        );
    }

    setDroper() {
        let component = super.setDroper(...arguments);

        if (!component) {
            return;
        }

        let id = component.id;

        //默认选中该组件
        // Dashboard.selectedIds = [id];
    }

    componentDidUpdate() {
        let selectedIds = Dashboard.selectedIds;
        if (selectedIds.length === 1) {
            let com = Dashboard.compManager.getComponent(selectedIds[0]);
            if (com) {
                window.Dashboard.event.dispatch("panelChange", {
                    name: com.cfg.type,
                    data: {
                        id: com.cfg.id
                    }
                });
            }
        }
    }

    //高度变化重新计算宽高
    render() {
        this.resizeChildren = [];
        return (
            <div
                className="canvas"
                ref={e => (this.rootDom = e)}
                onDrop={e => this.menuDrop(e)}
                onDragOver={e => e.preventDefault()}
                onClick={e => this.handleChick(e)}
                id="background-container"
                style={this.outDivStype()}
            >
                {!this.props.editeMode ? (
                    this.state.components.length ? null : (
                        <div className="canvas-nocomponent-bg">
                            <span className="canvas-nocomponent-text">
                                请从左侧拖入任意图表或组件
                            </span>
                        </div>
                    )
                ) : null}
                <Modal
                    visible={this.state.dataBind.visible}
                    closable={false}
                    wrapClassName="databind-pop-wrap"
                    footer={null}
                    maskClosable={false}
                    destroyOnClose={true}
                    getContainer={() => document.body}
                >
                    <DataBindPop
                        title="统计图表"
                        cfg={this.state.dataBind.component}
                        closepop={() => {
                            this.closeDataBindPop();
                        }}
                        onComplete={data => {
                            this.saveDatabind(data);
                            this.closeDataBindPop(data);
                        }}
                    />
                </Modal>
                <BigSmallChart />
                {this.state.width && this.state.components.length ? (
                    <ReactGridLayout
                        width={this.props.canvasWidth}
                        cols={this.state.cols}
                        rowHeight={this.state.rowHeight}
                        onDragStop={this.onDragStop.bind(this)}
                        onResizeStop={this.onResizeStop.bind(this)}
                        onLayoutChange={this.onLayoutChange.bind(this)}
                        layout={this.state.components.map(item => item.layout)}
                    >
                        {this.state.components.map((item, key) => {
                            let Item =
                                window.Dashboard.reactComponent[item.type];
                            return (
                                <div
                                    key={item.id + (item.hash || "")}
                                    id={item.id}
                                >
                                    <Item
                                        editeMode={this.props.editeMode}
                                        onEditBtnClick={e => {
                                            this.openDataBindPop(item.id);
                                        }}
                                        data={item}
                                        myWidth={
                                            (this.props.canvasWidth *
                                                item.layout.w) /
                                            12
                                        }
                                        ref={e => {
                                            if (!e) {
                                                return;
                                            }
                                            this.resizeChildren.push(
                                                e.getWrappedInstance
                                                    ? e.getWrappedInstance()
                                                    : e
                                            );
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </ReactGridLayout>
                ) : null}
            </div>
        );
    }
}

export default Canvas;
