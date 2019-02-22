
import corejs from "corejs/index";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Provider, connect } from "react-redux";
import { LocaleProvider } from "antd";

import store from "./dashboard/store";
import zhCN from "antd/lib/locale-provider/zh_CN";
import Main from './main'

let Dashboard = window.Dashboard;

Dashboard.bootstrap().then(e => {
    ReactDOM.render(
        <Provider store={store}>
            <LocaleProvider locale={zhCN}>
                <Main />
            </LocaleProvider>
        </Provider>,
        document.getElementById("app"),
        () => {
            Dashboard.loading(false);
        }
    );
    //重新编辑，预览
    // Reedite();
});