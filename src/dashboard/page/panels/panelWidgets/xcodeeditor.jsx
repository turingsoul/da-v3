import React, { Component } from "react";
import { Row, Col, Icon, Button } from "antd";
import $ from 'jquery'

// import CodeMirror from 'react-codemirror'

import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/css/css";
import CodeMirror from "../panelComponents/codeMirror";
import CssAndJsPopup from "../panelComponents/cssAndJsPopup";
// name, icons, defaultValue, value, onChange
class Xcodeeditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            popUpEditor: false
        };
    }

    componentWillReceiveProps(nextProps) {
        this.onChange(nextProps.value);
    }
    onChange(e,cb) {
        this.setState(
            {
                value: e
            },
            () => {
                cb && cb();
            }
        );
    }
    showPopUpEditor() {
        this.setState({
            popUpEditor: true
        });
    }
    hidePopUpEditor() {
        this.setState({
            popUpEditor: false
        });
    }
    runCode() {
        this.props.onChange && this.props.onChange(this.state.value);
    }
    componentDidMount() {
        this.codeMirrorInstance = this.code.codeMirror;
    }

    /**
     * 代码编辑自适应高度
     */
    getCodeMirrorStyle(){
        let totalH = $(window).height();

        return {
            height:totalH-344+'px'
        };
    }
    render() {
        let jsCodeEditor = {
            title: "JS代码编辑器",
            type: "javascript",
            onOK: val => {
                this.hidePopUpEditor();
                this.onChange(val,()=>{
                    this.runCode()
                });
            },
            onCancel: this.hidePopUpEditor.bind(this),
            show: this.state.popUpEditor,
            value: this.state.value,
            onChange: e => console.log(e),
            hasSelect: true
        };
        
        return (
            <div>
                <Row type="flex" align="middle" justify="space-between">
                    <Col span={10}>自定义代码</Col>
                    <Col span={2}>
                        <Icon
                            type="arrows-alt"
                            className="senior-code-btn openEditer"
                            title={"窗口放大"}
                            onClick={e => this.showPopUpEditor("javascript")}
                        />
                    </Col>
                </Row>
                <Row type="flex" align="middle" justify="space-between" style={this.getCodeMirrorStyle()}>
                    <CodeMirror
                        style={{ width: "100%" }}
                        ref={code => (this.code = code)}
                        onChange={val => this.onChange(val)}
                        value={this.state.value}
                        options={{
                            mode: this.props.options[0].type || "css",
                            lineNumbers: true
                        }}
                    />
                </Row>
                <Row type="flex" align="middle">
                    <Button type="primary" onClick={e => this.runCode(e)}>
                        立即执行
                    </Button>
                </Row>
                {/* this.state.popUpEditor ? <CssAndJsPopup {...jsCodeEditor} /> : null */
                Dashboard.event.dispatch(
                    "CssAndJsPop",
                    this.state.popUpEditor
                        ? {
                              ...jsCodeEditor,
                              
                          }
                        : null
                )}
            </div>
        );
    }
}

export default Xcodeeditor;
