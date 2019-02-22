import React, { Component } from "react";
import { Row, Col, Input, message, InputNumber } from "antd";
import _ from "lodash";

// name, icons, defaultValue, value, onChange
class XNumberInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (
            _.isEqual(nextState, this.state) &&
            nextProps.value == this.state.value &&
            nextProps.name == this.props.name
        ) {
            return false;
        }
        return true;
    }

    vaid(value){
        let result = true;
        let { options } = this.props;

        if (options && options.rules) {
            result = options.rules(value);
        }

        return result;
    }

    onBlurInputNumber(e) {
        let value = e.target.value;
        let { onChange } = this.props;
        let result = this.vaid(value);

        if(!result){
            return;
        }

        this.setState(
            { value },
            () => {
                onChange && onChange(value);
            }
        );
    }

    onChange(value) {
        let result = this.vaid(value);
        let { options,onChange } = this.props;
        
        options = options || {};

        if(!result){
            let errorMessage = options.errorMessage;
            errorMessage && message.error(errorMessage);
            return;
        }

        this.setState(
            { value },
            () => {
                onChange && onChange(value);
            }
        );
    }
    render() {
        return (
            <Row type="flex" align="middle">
                <Col span={6}>{this.props.name}</Col>
                <Col span={8}>
                    <InputNumber
                        placeholder="请输入数值"
                        value={this.state.value}
                        onBlur={e => this.onBlurInputNumber(e)}
                        onChange={e => this.onChange(e)}
                    />
                </Col>
                {this.props.options && this.props.options.suffix ? (
                    <Col span={2} style={{ paddingLeft: "10px" }}>
                        {this.props.options.suffix}{" "}
                    </Col>
                ) : null}
            </Row>
        );
    }
}

export default XNumberInput;
