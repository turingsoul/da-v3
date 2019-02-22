import React, { Component } from "react";
import { Row, Col, Radio } from "antd";
import _ from "lodash";
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

// name,value, onChange, options
class XRadioGroup extends Component {
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
            nextProps.name == this.props.name &&
            _.isEqual(nextProps.options, this.props.options)
        ) {
            return false;
        }
        return true;
    }

    onChange(e) {
        this.setState(
            {
                value: e
            },
            () => {
                this.props.onChange && this.props.onChange(e);
            }
        );
    }
    render() {
        return (
            <Row type="flex" align="middle">
                <Col span={6}>{this.props.name}</Col>
                <Col span={18}>
                    <RadioGroup
                        value={this.state.value}
                        onChange={e => this.onChange(e.target.value)}
                    >
                        {this.props.options.map((option, i) => (
                            <Radio key={i} value={option.value}>
                                {option.name}
                            </Radio>
                        ))}
                    </RadioGroup>
                </Col>
            </Row>
        );
    }
}

export default XRadioGroup;
