import React, { Component } from "react";
import canvasHandle from "page/canvas/canvasHandle";
import Widget from "../widgetComponent";
import { Modal } from "antd";
import ReactGridLayout from "util/react-grid-layout/index";
import "util/react-grid-layout/layout.css";
import "util/react-grid-layout/resizable.css";
import asyncComponent from "util/asyncComponent";

let DataBindPop = asyncComponent(() => import("page/canvas/dataBind"));

class Carousel extends canvasHandle {
    constructor(props) {
        super(props);
        let {
            intervalTime,
            pageNumber,
            dotPosition
        } = props.data.chartDefinition.option;

        let defaultComponents =
            this.props.data.children.length === 0
                ? []
                : this.props.data.children;
        if (this.props.data.children.length === 0) {
            for (let i = 0; i < pageNumber; i++) {
                defaultComponents.push([]);
            }
        }

        this.state = {
            //轮播属性
            autoPlay: props.editeMode, //boolean
            activeIndex: 0, //number
            defaultActiveIndex: 0, //number
            activePosition: 0,
            timer: null, //定时器
            //轮播属性
            option: {
                intervalTime: intervalTime,
                pageNumber: pageNumber, //2-8
                dotPosition: dotPosition,
                unitWidth: props.myWidth,
                unitHeight: null
            },
            //面板
            components: defaultComponents,
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
    }

    componentWillMount() {
        let self = this;
        window.Dashboard.event.subscribe(
            "carouselSettingChange_" + self.props.data.id,
            d => {
                let option = self.state.option;
                switch (d.type) {
                    case "pageNumber":
                        let lastCount = self.state.components.length;
                        let thisCount = parseInt(d.value);
                        //components改变
                        if (lastCount < thisCount) {
                            for (let i = lastCount; i < thisCount; i++) {
                                self.state.components.push([]);
                            }
                        }
                        //pageNumber改变
                        self.state.option.pageNumber = thisCount;
                        option = { ...option, pageNumber: thisCount };
                        //setState
                        self.setState({
                            option: option,
                            components: self.state.components
                        });
                        //pageNumber减少的情况
                        if (self.state.activeIndex > thisCount - 1) {
                            self.play(thisCount - 1);
                        }
                        break;
                    case "intervalTime":
                        self.state.option.intervalTime = d.value;
                        clearInterval(self.state.timer);
                        self.autoPlay();
                        break;
                    case "dotPosition":
                        option = { ...option, dotPosition: d.value };
                        self.setState({
                            option: option
                        });
                        break;
                    default:
                }
            }
        );
    }

    componentDidMount() {
        this.resize();
        this.autoPlay();
    }

    componentWillUnmount() {
        window.Dashboard.event.unsubscribe(
            "carouselSettingChange_" + this.props.data.id
        );
        clearInterval(this.state.timer);
    }

    //自动轮播
    autoPlay() {
        if (this.state.autoPlay) {
            let self = this;
            clearInterval(this.state.timer);
            this.state.timer = setInterval(
                self.play.bind(self),
                this.state.option.intervalTime * 1000
            );
        }
    }

    //从当前页轮播
    play(indexIn) {
        let self = this;
        let index =
            indexIn || indexIn === 0 ? indexIn : self.state.activeIndex + 1;
        let position = 0;
        let option = self.state.option;
        let pageNumber = option.pageNumber;
        if (index > pageNumber - 1) {
            index = 0;
        }
        position =
            option.dotPosition === "top" || option.dotPosition === "bottom"
                ? index * option.unitWidth * -1 //dot在上下时，横向轮播
                : index * option.unitHeight * -1; //dot在左右时，纵向轮播
        self.setState({
            activeIndex: index,
            activePosition: position + "px"
        });
    }

    menuDrop(e) {
        e.stopPropagation();
        if (
            window.dashboardType === "container" ||
            window.dashboardType === "carousel"
        ) {
            window.dashboardType = false;
            return;
        }
        //设置第二个值 表示  组件在容器中
        this.menuDroper(e, "widgetIncontainer", this.state.activeIndex);
    }

    onResizeStop() {
        setTimeout(() => {
            this.resizeChild.resize && this.resizeChild.resize();
        }, 100);
    }

    resize() {
        let option = this.state.option;
        if (option.dotPosition === "bottom" || option.dotPosition === "top") {
            //dot在上下时，横向轮播，unitWidth改变
            option = {
                ...option,
                unitWidth: this.rootDom.parentElement.offsetWidth,
                unitHeight: this.rootDom.parentElement.offsetHeight
            };
        } else {
            //dot在左右时，纵向轮播，unitHeight改变
            option = {
                ...option,
                unitWidth: this.rootDom.parentElement.offsetWidth,
                unitHeight: this.rootDom.parentElement.offsetHeight
            };
        }
        this.setState({
            option: option
        });
        this._cScrollBarIns && this._cScrollBarIns.update();
    }

    handleChick(e) {
        e.stopPropagation();
    }

    onLayoutChange() {
        var layouts = arguments[1];
        this.setActionState(layouts, arguments[0]);
    }

    onDragStop() {}

    render() {
        let self = this;
        let option = self.state.option;
        let pageNumber = option.pageNumber;

        let panels = [];
        let dots = [];

        let carouselListStyle =
            option.dotPosition === "top" || option.dotPosition === "bottom"
                ? {
                      width: option.unitWidth * pageNumber + "px",
                      height: option.unitHeight,
                      left: self.state.activeIndex * option.unitWidth * -1
                  }
                : {
                      width: option.unitWidth,
                      height: option.unitHeight * pageNumber + "px",
                      top: self.state.activeIndex * option.unitHeight * -1
                  };

        for (let i = 0; i < pageNumber; i++) {
            panels.push(
                <li
                    key={"panel" + i}
                    style={{
                        width: option.unitWidth,
                        height: option.unitHeight
                    }}
                >
                    {self.state.components[i].length ? (
                        <ReactGridLayout
                            width={self.props.myWidth - 24}
                            cols={self.state.cols}
                            margin={[0, 0]}
                            containerPadding={[
                                self.props.editeMode ? 0 : 10,
                                self.props.editeMode ? 0 : 10
                            ]}
                            rowHeight={self.state.rowHeight}
                            onLayoutChange={self.onLayoutChange.bind(self, i)}
                            onDragStop={self.onDragStop.bind(self)}
                            onResizeStop={self.onResizeStop.bind(self)}
                            layout={self.state.components[i].map(
                                item => item.layout
                            )}
                        >
                            {self.state.components[i].map((item, key) => {
                                let Item =
                                    window.Dashboard.reactComponent[item.type];
                                return (
                                    <div
                                        key={item.id + (item.hash || "")}
                                        id={item.id}
                                    >
                                        <Item
                                            editeMode={self.props.editeMode}
                                            onEditBtnClick={e => {
                                                self.openDataBindPop(item.id);
                                            }}
                                            data={item}
                                            ref={e => (self.resizeChild = e)}
                                            parentId={self.props.data.id}
                                            serialNum={i}
                                        />
                                    </div>
                                );
                            })}
                        </ReactGridLayout>
                    ) : null}
                </li>
            );
        }
        for (let i = 0; i < pageNumber; i++) {
            dots.push(
                <li
                    key={"dot" + i}
                    className={self.state.activeIndex === i ? "activeDot" : ""}
                >
                    <button
                        onClick={e => {
                            self.play(i);
                        }}
                    />
                </li>
            );
        }
        return (
            <Widget {...self.props}>
                <div
                    className={"carouselBox " + option.dotPosition}
                    ref={e => e && (self.rootDom = e)}
                    onDrop={e => self.menuDrop(e)}
                    onDragOver={e => e.preventDefault()}
                    style={{
                        width: "100%",
                        height: "100%"
                    }}
                >
                    <Modal
                        visible={self.state.dataBind.visible}
                        closable={false}
                        wrapClassName="databind-pop-wrap"
                        footer={null}
                        maskClosable={false}
                        destroyOnClose={true}
                        getContainer={() => document.body}
                    >
                        <DataBindPop
                            title="统计图表"
                            cfg={self.state.dataBind.component}
                            closepop={() => {
                                self.closeDataBindPop();
                            }}
                            onComplete={data => {
                                self.saveDatabind(data, self.state.activeIndex);
                                self.closeDataBindPop(data);
                            }}
                        />
                    </Modal>
                    <ul className="carouselList" style={carouselListStyle}>
                        {panels}
                    </ul>
                    <ul className="carouselDot">{dots}</ul>
                </div>
            </Widget>
        );
    }
}

export default Carousel;
