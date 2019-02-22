import React, { Component } from "react";
import Widget from "../widgetComponent";
import Immutable, { Map, is } from "immutable";
import { connect } from "react-redux";

class Olap extends Widget {
    constructor(props) {
        super(props);
    }
    /* componentDidUpdate() {
        // debugger;
        if (!this.cmpIntance) {
            return;
        }
        // window.Dashboard.util.delayChange(this.resize,500,this);
        if (this.cmpIntance.resizeState === "resizing" || this.upResize) {
            this.resize();
            this.cmpIntance.resizeState = "resized";
        }
    } */
    resize() {
        if (!this.cmpIntance) {
            return;
        }
        if (this.cmpIntance.resizeState === "resizing" || this.upResize) {
            this.cmpIntance.resize(
                () => (this.cmpIntance.resizeState = "resized")
            );
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        let preLayout = this.props.data.layout,
            lastLayout = nextProps.data.layout;
        this.upResize = false;
        if (!is(Map(preLayout), Map(lastLayout))) {
            this.upResize = true;
        }
        return true;
    }
}

export default Olap;
