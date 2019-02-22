/**
 * 提供数据绑定相关处理
 * 1、相同数据集创建的计算字段是同一仪表盘是通用的，仪表盘信息需要存储相关信息
 */
import Util from "dashboard/modules/common/Util";
const util = new Util();

export default class dataBind {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.calcField = [];
    }

    /**
     * 获取该数据集创建的所有计算字段
     * @param {Object} dataset 数据集 {name,type}
     */
    getCalcFieldList(dataset) {
        try {
            return this.calcField.filter(
                v =>
                    v.dataset.type === dataset.type &&
                    v.dataset.name === dataset.name
            )[0].fields;
        } catch (error) {
            return;
        }
    }

    /**
     * 添加计算字段
     * @param {Object} dataset 数据集 {name,type}
     * @param {Object} field 计算字段信息
     */
    addCalcField(dataset, field) {
        let { calcName, formulaStr, contrast, type } = field;
        let list = this.getCalcFieldList(dataset);

        if (list) {
            if (list.find(v => v.calcName === calcName)) {
                return {
                    result: false,
                    msg: calcName + "已经存在。"
                };
            }
            list.push({
                type,
                calcName,
                formulaStr,
                contrast,
                id: util.guid()
            });
        } else {
            this.calcField.push({
                dataset,
                fields: []
            });
            this.addCalcField(...arguments);
        }
    }

    /**
     * 添加计算字段
     * @param {Object} dataset 数据集 {name,type}
     * @param {Object} field 计算字段信息
     */
    updateCalcField(dataset, field) {
        let { id, calcName, formulaStr, contrast } = field;
        let list = this.getCalcFieldList(dataset);
        if (list) {
            let item = list.find(v => v.id === id);
            if (item) {
                Object.assign(item, field);
            } else {
                return {
                    result: false,
                    msg: "没有找到计算字段 " + calcName + "。"
                };
            }
        }
    }

    /**
     * 删除计算字段
     * @param {Object} dataset 数据集 {name,type}
     * @param {String} id 要删除的计算字段id
     */
    delCalcField(dataset, id) {
        let list = this.getCalcFieldList(dataset);
        let idx;
        if (list) {
            for (let i = 0, len = list.length; i < len; i++) {
                if (list[i].id === id) {
                    idx = i;
                    break;
                }
            }
            if (!_.isUndefined(idx)) {
                list.splice(idx, 1);
            }
        }
    }

    /**
     * 通过id查找计算字段
     * @param {String} id 计算字段ID
     */
    findFieldById(id) {
        let result = null;
        let calcField = this.calcField;
        let allFields = [];

        for (let i = 0, len = calcField.length; i < len; i++) {
            let fields = calcField[i].fields || [];
            let _fLen = fields.length;
            if (_fLen > 0) {
                allFields = allFields.concat(fields);
            }
        }

        return allFields.find(v => v.id === id);
    }
}
