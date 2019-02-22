/**
 * 配置模块
 */
import DATABIND_CALC_FN_LIST from "./config/DATABIND_CALC_FN_LIST";

const URLS = {
    //获取业务数据集列表
    GET_DATASET_LIST: "/xdatainsight/plugin/xdf/api/metadata/list",
    //查询业务数据集下字段分组信息
    GET_FIELDS_BY_DATASET: "/xdatainsight/plugin/xdf/api/metadata/modelInfo",
    //sql、数据集等类型数据查询
    DATA_QUERY: "/xdatainsight/plugin/cda/api/query"
};

/**
 * 数据绑定相关配置信息
 */
const DATA_BIND = {
    CALC_FN: DATABIND_CALC_FN_LIST
};

export default class Config {
    constructor() {
        this.URLS = URLS;
        this.DATA_BIND = DATA_BIND;
    }

    getDatabindComponents(){
        
    }
}
