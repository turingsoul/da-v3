/**
 * 局部加载loading
 */
import React, { Component } from "react";

export default class DivLoading extends Component {
    constructor(props) {
        super();
    }

    render() {
        let { show,text,showText } = this.props;
        return (
            <div
                className="ds-div-loading"
                style={{
                    display: show ? "block" : "none"
                }}
            >
            </div>
        );
    }
}
