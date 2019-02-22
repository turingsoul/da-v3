import React, { Component } from "react";
import Widget from "../widgetComponent";
import canvasHandle from "page/canvas/canvasHandle";
import { Modal } from "antd";
import ReactGridLayout from "util/react-grid-layout/index";
import { Scrollbars } from "react-custom-scrollbars";
import "util/react-grid-layout/layout.css";
import "util/react-grid-layout/resizable.css";
import Immutable from "immutable";
import asyncComponent from "util/asyncComponent";

let DataBindPop = asyncComponent(()=>import('page/canvas/dataBind'));

class Container extends canvasHandle {
    constructor(props) {
        super(props);
        this.state = {
            width: "",
            components: this.props.data.children || [],
            cols: 12, //栅格  十份
            rowHeight: 10, //栅格  每份高度
            paddding: this.props.editeMode
                ? {}
                : { paddingTop: 10, paddingBottom: 10 },
            dataBind: {
                visible: false,
                component: null
            }
        };
        this._cScrollBarIns = null;
    }
    menuDrop(e) {
        e.stopPropagation();
        if (window.dashboardType === "container" || window.dashboardType === "carousel") {
            window.dashboardType = false;
            return;
        }
        //设置第二个值 表示  组件在容器中
        this.menuDroper(e, "widgetIncontainer");
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
            this.resizeChild.resize && this.resizeChild.resize();
        }, 100);
    }

    resize() {
        this._cScrollBarIns && this._cScrollBarIns.update();
    }
    handleChick(e) {
        e.stopPropagation();
    }
    onLayoutChange() {
        var layouts = arguments[0];
        this.setActionState(layouts);
    }
    render() {
        return (
            <Widget {...this.props}>
                {/* <Scrollbars
                    style={{ height: "100%" }}
                    ref={e => {
                        e && (this._cScrollBarIns = e);
                        window._cScrollBarIns = e;
                    }}
                > */}
                <div
                    className="container"
                    ref={e => (this.rootDom = e)}
                    onDrop={e => this.menuDrop(e)}
                    onDragOver={e => e.preventDefault()}
                    style={{
                        width: "100%",
                        height: "100%"
                    }}
                >
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
                    {this.state.components.length ? (
                        <ReactGridLayout
                            width={this.props.myWidth - 24}
                            cols={this.state.cols}
                            margin={[0, 0]}
                            containerPadding={[
                                0,
                                this.props.editeMode ? 0 : 10
                            ]}
                            rowHeight={this.state.rowHeight}
                            onLayoutChange={this.onLayoutChange.bind(this)}
                            onDragStop={this.onDragStop.bind(this)}
                            onResizeStop={this.onResizeStop.bind(this)}
                            layout={this.state.components.map(
                                item => item.layout
                            )}
                        >
                            {this.state.components.map((item, key) => {
                                let Item = window.Dashboard.reactComponent[item.type];
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
                                            ref={e => (this.resizeChild = e)}
                                            parentId={this.props.data.id}
                                        />
                                    </div>
                                );
                            })}
                        </ReactGridLayout>
                    ) : null}
                </div>
                {/* </Scrollbars> */}
            </Widget>
        );
    }
}

export default Container;
