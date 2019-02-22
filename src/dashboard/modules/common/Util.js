/**
 * 工具集模块
 * author:twy
 * create time：2018/8/28
 */

import _ from "underscore";

let instance;

export default class Util {
    constructor() {
        if (!instance) {
            this._ = _;
            instance = this;
        }
        return instance;
    }

    /**
     * 生成32位uuid
     * @return {String} XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */
    guid() {
        let result = "";
        for (let i = 1; i <= 32; i++) {
            let n = Math.floor(Math.random() * 16.0).toString(16);
            result += n;
            if (i === 8 || i === 12 || i === 16 || i === 20) result += "-";
        }
        return result;
    }

    /**
     * 深拷贝
     * @param {Any} obj
     */
    deepClone(obj) {
        let cloneObj;

        if (!_.isObject(obj) || typeof obj === "function") {
            return obj;
        }

        cloneObj = _.isArray(obj) ? [] : {};

        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (!_.isObject(obj[i])) {
                    cloneObj[i] = obj[i];
                } else {
                    cloneObj[i] = this.deepClone(obj[i]);
                }
            }
        }
        return cloneObj;
    }

    /**
     * 深度比较两个对象
     * @param {Any} origin 对象1
     * @param {Any} target 对象2
     */
    deepCompare(origin, target) {
        if (target === null || origin === null) {
            return origin === target;
        } else if (typeof target === "object" && typeof origin === "object") {
            if (_.isArray(target) && target.length !== origin.length) {
                return false;
            }
            if (typeof origin !== "object") {
                return false;
            }
            for (let key of Object.keys(target)) {
                if (!this.deepCompare(origin[key], target[key])) {
                    return false;
                }
            }
            return true;
        } else {
            return origin === target;
        }
    }

    /**
     * 获取浏览器cookie
     * @param {String} name cookie的名字
     */
    getCookie(name) {
        let arr;
        let reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if ((arr = document.cookie.match(reg))) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    }

    /**
     * 设置cookie，包括添加、更新、删除cookie，如果在cookies不存在对应的name，则添加一个cookie，如果存在则更新。
     * @param {String} name cookie的名字
     * @param {String} value cookie的值
     * @param {Number} time 过期时间，以秒为单位
     */
    setCookie(name, value, time) {
        let expires;

        if (typeof time === "number") {
            let strsec = time * 1000;
            let exp = new Date();
            exp.setTime(exp.getTime() + strsec * 1);
            expires = exp.toUTCString();
        }

        document.cookie =
            name + "=" + escape(value) + (expires ? ";expires=" + expires : "");
    }

    /**
     * 删除指定的cookie。
     * @param {String} name cookie的名字
     */
    delCookie(name) {
        let exp = new Date();
        let cval;
        exp.setTime(exp.getTime() - 1);
        cval = this.getCookie(name);
        if (cval != null) {
            document.cookie =
                name + "=" + cval + ";expires=" + exp.toUTCString();
        }
    }

    /**
     * 清空所有cookie
     */
    clearCookie() {
        let keys = document.cookie.match(/[^ =;]+(?==)/g);
        if (keys) {
            for (let i = keys.length - 1; i >= 0; i--) {
                document.cookie =
                    keys[i] + "=0;expires=" + new Date(0).toUTCString();
            }
        }
    }

    /**
     * 获取指定或当前URL中的指定name的请求参数，如果不传name，则获取所有参数
     * @param {String} name 需要获取参数的key
     * @param {String} url url地址，不传或为空取window.location.search
     */
    queryString(name, url) {
        let result;
        url = url || window.location.search;
        if (name != null && name !== "" && name !== undefined) {
            let value = url.match(
                new RegExp("[?&]" + name + "=([^&]*)(&?)", "i")
            );
            return value ? value[1] : value;
        }
        result = url.match(new RegExp("[?&][^?&]+=[^?&]+", "g"));
        if (result == null) {
            return null;
        }
        for (let i = 0; i < result.length; i++) {
            result[i] = result[i].substring(1);
        }
        return result;
    }

    /**
     * 数组去重
     * @param {Array} array 要去重的数组
     * @return {Array} 去重后的数组
     */
    unique(array) {
        let r = [];
        for (let i = 0, l = array.length; i < l; i++) {
            for (let j = i + 1; j < l; j++) {
                if (array[i] === array[j]) {
                    j = ++i;
                }
            }
            r.push(array[i]);
        }
        return r;
    }

    /**
     * 获取字段对应的类型
     */
    getRelFieldType(type = "") {
        const numTypes = ["numeric", "integer"];
        type = type.toLowerCase();
        if (numTypes.indexOf(type) > -1) {
            return "number";
        }
        if (type === "string") {
            return "string";
        }
        if (type === "date") {
            return "date";
        }
        return type;
    }

    /**
     * 对数据绑定查询字符串进行编码
     * @param {String} str 查询字符串 
     */
    enCodeQueryString(str){
        return str.replace(/%/g, "%25").replace(/\+/g,"%2B");
    }
}
