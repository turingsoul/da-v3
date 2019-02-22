/**
 * 前后端交互层
 * author:twy
 * create time：2018/8/28
 */
import axios from "axios";

// 创建一个 axios 实例
const service = axios.create({
    baseURL: "" // api的base_url
});

window.aaaa = service;

// request 拦截
service.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        // Do something with request error
        console.log(error); // for debug
        Promise.reject(error);
    }
);

// respone 拦截
service.interceptors.response.use(
    response => response,
    error => {
        console.log("err" + error); // for debug
        return Promise.reject(error);
    }
);

export default service;

function createSource() {
    return axios.CancelToken.source();
}

export { createSource };
