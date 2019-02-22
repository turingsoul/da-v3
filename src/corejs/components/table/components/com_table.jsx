/**
 * 表格组件
 */
import React, { Component } from "react";
import { LocaleProvider, Table } from "antd";
import $ from "jquery";

export default class ComTable extends Component {
  constructor(props) {
    super(props);
    let state = {
      size: "small",
      bordered: false,
      columns: [],
      dataSource: [],
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: ["10", "20", "30", "40"],
        showQuickJumper: true,
        showSizeChanger: true
      },
      scroll: { x: 600, y: 200 },
      footer: null
    };
    this.state = $.extend(state, props.options || {});
  }
  shouldComponentUpdate() {
    return true;
  }
  componentDidMount() {}
  render() {
    return (
        <Table {...this.state} />
    );
  }
}
