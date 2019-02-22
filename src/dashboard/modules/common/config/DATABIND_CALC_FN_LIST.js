/**
 * 数据绑定配置页面计算字段所支持的函数列表及配置
 * author:twy
 * create time:2018/9/21
 * ==========================================================
 * fn[n]单个函数
 * fn[n].name {String} 函数名
 * fn[n].usage {String} 用法
 * fn[n].explain {String} 说明
 * fn[n].example {Array} 示例
 * fn[n].rule {Object} 函数参数规则
 * fn[n].rule.paramMin {Number} 函数参数最少数量
 * fn[n].rule.paramMax {Number} 函数参数最大数量
 * fn[n].rule.paramType {String} 函数参数类型
 * fn[n].rule.returnType {String|Function} 函数返回值类型
 * fn[n].ruleValid {Function} 函数验证函数 返回值:{result,message,dataType}
 * ==========================================================
 */
import _ from "underscore";

/**
 * 验证参数个数及类型[只用于验证所有参数为固定类型]
 * @param {Array} params 参数对象列表
 */
const ruleValid = function(params = []) {
    let result = true;
    let message = "";
    let rule = this.rule || {};
    let { paramMin, paramMax, paramType } = rule;
    let dataType = rule.returnType;
    let len = params.length;

    //不需要参数
    if (paramMax === 0 && len > paramMax) {
        result = false;
        message = "函数[" + this.name + "]不需要传入参数";
        return { result, message, dataType };
    }

    //少于最少参数个数
    if (paramMin && len < paramMin) {
        result = false;
        message = "函数[" + this.name + "]参数数量错误，" + (paramMin === paramMax ? "需要" : "最少") + paramMin + "个参数。";
        return { result, message, dataType };
    }

    //多于最大参数个数
    if (paramMax && len > paramMax) {
        result = false;
        message = "函数[" + this.name + "]参数数量错误，" + (paramMax === paramMin ? "需要" : "最多") + paramMax + "个参数。";
        return { result, message, dataType };
    }

    /**
     * 参数类型校验
     * @type {Array|String} paramType 如果为字符串，则所有参数都要为该类型，如果为数组，数组下标和参数顺序对应关系一致。
     * 如果一个参数支持多种类型，则可以"typeA||typeB||typeC"表示
     */
    if (paramType) {
        for (let i = 0; i < len; i++) {
            let itemParamType = _.isArray(paramType) ? paramType[i] : paramType;

            if (itemParamType.indexOf(params[i].dataType) == -1) {
                result = false;
                message = "函数[" + this.name + "]参数[" + (i + 1) + "]类型错误。";
                return { result, message, dataType };
            }
        }
    }

    /**
     * 如果dataType为function，执行函数取返回值作为数据类型
     */
    if(typeof dataType === 'function'){
        dataType = dataType(params);
    }

    return { result, message, dataType };
};

export default [
    {
        name: "数值函数",
        value: "number",
        children: [
            {
                name: "ABS",
                usage: "ABS(数值)",
                explain: "返回指定数字的绝对值。绝对值是指没有正负符号的数值",
                example: [
                    "ABS(-1.5),返回1.5",
                    "ABS(0),返回0",
                    "ABS(2.5),返回2.5"
                ],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "number",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "CEIL",
                usage: "CEIL(数值)",
                explain: "返回不小于指定数值的最小整数",
                example: ["CEIL(4.12),返回5"],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "number",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "FLOOR",
                usage: "FLOOR(数值)",
                explain: "返回不大于指定数值的最大整数",
                example: ["CEIL(4.12),返回4"],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "number",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "LN",
                usage: "LN(数值)",
                explain: "求指定数值的对数",
                example: ["LN(10),返回2.3025"],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "number",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "LOG",
                usage: "LOG(数值A,数值B)",
                explain: "以A为底，求B的对数",
                example: ["LOG(2,4),返回2"],
                rule: {
                    paramMin: 2,
                    paramMax: 2,
                    paramType: "number",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "POW",
                usage: "POW(数值A,数值B)",
                explain: "求数值A的数值B次方",
                example: ["POW(4,2),返回16"],
                rule: {
                    paramMin: 2,
                    paramMax: 2,
                    paramType: "number",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "RAND",
                usage: "RAND()",
                explain: "返回大于0小于1的随机小数",
                example: ["RAND(),返回随机小数"],
                rule: {
                    paramMax: 0,
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "ROUND",
                usage: "ROUND(数值A,整数D])",
                explain: "返回数值A四舍五入到小数点后D位，不填时为0",
                example: ["ROUND(4.12,1),返回4.1"],
                rule: {
                    paramMin: 1,
                    paramMax: 2,
                    paramType: "number",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "SQRT",
                usage: "SQRT(数值)",
                explain: "求指定数值的平方根，数值应大于等于0",
                example: ["SQRT(4),返回2"],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "number",
                    returnType: "number"
                },
                ruleValid: ruleValid
            }
        ]
    },
    {
        name: "字符串函数",
        value: "string",
        children: [
            {
                name: "CONCAT",
                usage: "CONCAT(数字/日期/字符串,数字/日期/字符串...)",
                explain: "将多个字符串按顺序合并成一个字符串",
                example: [
                    "CONCAT([货品编号],[类型编号]),返回货品编号和类型编号合并后的字符串"
                ],
                rule: {
                    paramMin: 1,
                    paramType: "string||date||number",
                    returnType: "string"
                },
                ruleValid: ruleValid
            },
            {
                name: "FORMAT",
                usage: "FORMAT(数字/日期,格式代号)",
                explain: [
                    "对数值或日期进行格式化，返回值是按指定方式格式化的字符串。格式代号定义如下：",
                    "0~9 保留小数位数0~9",
                    "10  千分位分隔符，保留两位小数",
                    "11  百分数，保留一位小数",
                    "12  yyyy/mm/dd hh:mi:ss",
                    "13  yyyy-mm-dd hh:mi:ss",
                    "14  yyyy.mm.dd hh:mi:ss",
                    "15  yyyy年mm月dd日 hh:mi:ss",
                    "16  yyyy/mm/dd",
                    "17  yyyy-mm-dd ",
                    "18  yyyy.mm.dd ",
                    "19  yyyy年mm月dd日",
                    "20  hh:mi",
                    "21  hh:mi:ss",
                    "22  yyyymmdd",
                    "23  yyyymmddhhmiss"
                ],
                example: [
                    "FORMAT(1234.5,2),返回1234.50",
                    "FORMAT(1234.5,10),返回1,234.50",
                    "FORMAT(1.5,11),返回150.0%",
                    "FORMAT([订单日期],19),返回2017年11月10日",
                    "FORMAT([订单日期],21),返回04:23:56"
                ],
                rule: {
                    paramMin: 2,
                    paramMax: 2,
                    paramType: ["number||date", "number"],
                    returnType: "string"
                },
                ruleValid: ruleValid
            },
            {
                name: "INSTR",
                usage: "INSTR(字符串1,字符串2)",
                explain: "返回在字符串1中包含字符串2的位置",
                example: ['INSTR("abcdef","cd")，返回3'],
                rule: {
                    paramMin: 2,
                    paramMax: 2,
                    paramType: "string",
                    returnType: "string"
                },
                ruleValid: ruleValid
            },
            {
                name: "INDEXOF",
                usage: "INDEXOF(字符串,指定位置)",
                explain: "返回字符串在指定位置上的字符",
                example: [
                    'INDEXOF("UserReport",1),返回"U"',
                    'INDEXOF("UserReport",3),返回"e"'
                ],
                rule: {
                    paramMin: 2,
                    paramMax: 2,
                    paramType: ["string", "number"],
                    returnType: "string"
                },
                ruleValid: ruleValid
            },
            {
                name: "LEFT",
                usage: "LEFT(字符串,字符数)",
                explain: "根据指定的字符数从左开始返回字符串中的第一个或前几个字符。字符数为指定返回的字符串长度。备注：字符数的值必须等于或大于0；如果字符数大于整个文本的长度，LEFT函数将返回所有的文本；如果省略字符数，则默认值为1",
                example: [
                    'LEFT("UserReport",8),返回"User"',
                    'LEFT("UserReport"),返回"U"'
                ],
                rule: {
                    paramMin: 1,
                    paramMax: 2,
                    paramType: ["string", "number"],
                    returnType: "string"
                },
                ruleValid: ruleValid
            },
            {
                name: "LENGTH",
                usage: "LENGTH(字符串)",
                explain: "返回字符串的长度",
                example: ["LENGTH([货品名]),返回货品名的长度"],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "string",
                    returnType: "string"
                },
                ruleValid: ruleValid
            },
            {
                name: "LOWER",
                usage: "LOWER(字符串)",
                explain: "将指定字符串中所有的字符转化为小写",
                example: ['LOWER("ABC"),返回"abc"'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "string",
                    returnType: "string"
                },
                ruleValid: ruleValid
            },
            {
                name: "REPLACE",
                usage: "REPLACE(字符串1,字符串2,字符串3)",
                explain: "用字符串3替换字符串1中出现的所有字符串2的内容，返回新的字符串",
                example: [
                    'REPLACE("abcd","a","re"),返回"rebcd"',
                    'REPLACE("a**d","**d","rose"),返回"arose"'
                ],
                rule: {
                    paramMin: 3,
                    paramMax: 3,
                    paramType: "string",
                    returnType: "string"
                },
                ruleValid: ruleValid
            },
            {
                name: "RIGHT",
                usage: "RIGHT(字符串,字符数)",
                explain: "根据指定的字符数从右开始返回字符串中的最后一个或几个字符。字符数为指定返回的字符串长度。备注：字符数的值必须等于或大于0；如果字符数大于整个文本的长度，RIGHT函数将返回所有的文本；如果省略字符数，则默认值为1",
                example: [
                    'RIGHT("It is interesting",6),返回"esting"',
                    'RIGHT("Share Holder"),返回"r"'
                ],
                rule: {
                    paramMin: 1,
                    paramMax: 2,
                    paramType: ["string", "number"],
                    returnType: "string"
                },
                ruleValid: ruleValid
            },
            {
                name: "SUBSTR",
                usage: "SUBSTR(字符串,起始位置,[长度])",
                explain: "返回从起始位置起对应长度的字符串的子字符串，长度为可选项",
                example: [
                    'SUBSTR("UserReport",5,3), 返回"Rep"',
                    "SUBSTR([商品类型],4),返回商品类型第4个字符起至末尾的子字符串"
                ],
                rule: {
                    paramMin: 2,
                    paramMax: 3,
                    paramType: ["string", "number", "number"],
                    returnType: "string"
                },
                ruleValid: ruleValid
            },
            {
                name: "TRIM",
                usage: "TRIM(字符串)",
                explain: "去除表达式或字段中数据两边的空格",
                example: ['TRIM(" ABC"),返回"ABC"'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "string",
                    returnType: "string"
                },
                ruleValid: ruleValid
            },
            {
                name: "UPPER",
                usage: "UPPER(字符串)",
                explain: "将指定字符串中所有的字符转化为大写",
                example: ['UPPER("notes"),返回"NOTES"'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "string",
                    returnType: "string"
                },
                ruleValid: ruleValid
            }
        ]
    },
    {
        name: "日期函数",
        value: "date",
        children: [
            {
                name: "DATE_ADD",
                usage: "DATE_ADD(起始日期, 数值字段)",
                explain: "返回从起始日期算起，数值字段对应天数之后的日期",
                example: ["DATE_ADD([入库日期],1),返回货品入库第二天的日期"],
                rule: {
                    paramMin: 2,
                    paramMax: 2,
                    paramType: ["date", "number"],
                    returnType: "date"
                },
                ruleValid: ruleValid
            },
            {
                name: "DATE_DIFF",
                usage: "DAY_DIFF(日期字段1,日期字段2)",
                explain: "返回两个日期相差的天数，只允许传入日期型字段",
                example: [ 'DAY_DIFF([入职日期],[离职日期]),返回同一行上"离职日期"至"入职日期"间隔天数' ],
                rule: {
                    paramMin: 2,
                    paramMax: 2,
                    paramType: "date",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "DAY",
                usage: "DAY(日期字段)",
                explain: "返回该日期对应的日的值。只允许传入日期型字段",
                example: ['DAY([下单时间]),返回该行"下单时间"字段对应的日的值'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "date",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "HOUR",
                usage: "HOUR(日期字段)",
                explain: "返回该日期对应的小时的值。只允许传入日期型字段",
                example: [ 'HOUR([下单时间]),返回该行"下单时间"字段对应的小时的值' ],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "date",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "MINUTE",
                usage: "MINUTE(日期字段)",
                explain: "返回该日期对应的分钟的值。只允许传入日期型字段",
                example: [ 'MINUTE([下单时间]),返回该行"下单时间"字段对应的分钟的值' ],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "date",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "MONTH",
                usage: "MONTH(日期字段)",
                explain: "返回该日期对应的月份。只允许传入日期型字段",
                example: ['MONTH([下单时间]),返回该行"下单时间"字段对应的月份'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "date",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "NOW",
                usage: "NOW()",
                explain: "返回当前系统时间，无需参数",
                example: ["NOW(),返回当前系统时间"],
                rule: {
                    paramMax: 0,
                    returnType: "date"
                },
                ruleValid: ruleValid
            },
            {
                name: "QUARTER",
                usage: "QUARTER(日期字段)",
                explain: "返回该日期在当年的第几个季度，只允许传入日期型字段",
                example: ["QUARTER([入职日期]),返回入职日期为该年的第几个季度"],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "date",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "SECOND",
                usage: "SECOND(日期字段)",
                explain: "返回该日期对应的秒数。只允许传入日期型字段",
                example: [ 'SECOND([下单时间]),返回该行"下单时间"字段对应的秒数的值' ],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "date",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "TO_DATE",
                usage: "TO_DATE(字符串,格式代号)",
                explain: [
                    "将字符串转换为日期，字符串的格式应为下列格式中的一种，格式定义如下：",
                    "1  yyyy/mm/dd hh:mi:ss",
                    "2  yyyy-mm-dd hh:mi:ss",
                    "3  yyyy.mm.dd hh:mi:ss",
                    "4  mm/dd/yyyy hh:mi:ss",
                    "5  mm-dd/yyyy hh:mi:ss",
                    "6  mm.dd.yyyy hh:mi:ss",
                    "7  dd/mm/yyyy hh:mi:s",
                    "8  dd-mm-yyyy hh:mi:ss",
                    "9  dd.mm.yyyy hh:mi:ss",
                    "10 yyyy/mm/dd",
                    "11 yyyy-mm-dd",
                    "12 yyyy.mm.dd",
                    "13 mm/dd/yyyy",
                    "14 mm-dd/yyyy",
                    "15 mm.dd.yyyy",
                    "16 dd/mm/yyyy",
                    "17 dd-mm-yyyy",
                    "18 dd.mm.yyyy",
                    "19 yyyymmdd",
                    "20 yyyymmddhhmiss"
                ],
                example: [
                    'TO_DATE("2012/03/05 16:23:56",1)',
                    'TO_DATE("2012-03-05",11)',
                    'TO_DATE("20120305",19)'
                ],
                rule: {
                    paramMin: 2,
                    paramMax: 2,
                    paramType: ["string", "number"],
                    returnType: "date"
                },
                ruleValid: ruleValid
            },
            {
                name: "WEEK",
                usage: "WEEK(日期字段)",
                explain: "返回该日期在当年的第几周，只允许传入日期型字段",
                example: ["WEEK([入职日期]),返回入职日期为该年的第几周"],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "date",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "YEAR",
                usage: "YEAR(日期字段)",
                explain: "返回该日期对应的年份。只允许传入日期型字段",
                example: ['YEAR([下单时间]),返回该行"下单时间"字段对应的年份'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "date",
                    returnType: "number"
                },
                ruleValid: ruleValid
            }
        ]
    },
    {
        name: "逻辑函数",
        value: "logic",
        children: [
            {
                name: "COALESCE",
                usage: "COALESCE(字段1,字段2,字段3...)",
                explain: "返回参数中的第一个非空值；如果所有值都为NULL，那么返回NULL。参数个数必须大于等于2。",
                example: [ 'COALESCE([名字1],[名字2],"佚名"),返回参数中的第一个非空名字' ],
                rule: {
                    paramMin: 2,
                    returnType: function(params) {
                        return params[0].dataType;
                    }
                },
                ruleValid: function(params) {
                    let result = ruleValid.call(this, params);

                    if (result.result !== false) {
                        let arr = [];
                        let len = params.length;

                        for (let i = 0; i < len; i++) {
                            if (arr.indexOf(params[i].dataType) === -1) {
                                arr.push(params[i].dataType);
                            }
                            if (arr.length > 1) {
                                result.result = false;
                                result.message = "函数[" + this.name + "]请保持参数类型一致";
                                return result;
                            }
                        }

                        return result;
                    }

                    return result;
                }
            },
            {
                name: "IF",
                usage: "IF(表达式,结果1,结果2)",
                explain: 'IF为判断函数，表达式为比较型或计算型语句。若表达式的计算结果正确，则返回"结果1"，否则，返回"结果2"',
                example: [ 'IF([订单数]>500,"合格","不合格")。结果为若该行"订单数"字段对应值大于500,则返回"合格",否则返回"不合格"' ],
                rule: {
                    paramMin: 3,
                    paramMax: 3
                },
                ruleValid: function(params) {
                    let result = ruleValid.call(this, params);

                    if (result.result !== false) {
                        if (params[1].dataType !== params[2].dataType) {
                            result.result = false;
                            result.message = "函数[" + this.name + "]请保持参数[2]和参数[3]类型一致";
                            return result;
                        }

                        result.dataType = params[1].dataType;
                        return result;
                    }

                    result.dataType = "";

                    return result;
                }
            },
            {
                name: "AND",
                usage: "AND(表达式1,表达式2)",
                explain: '两个表达式都返回TRUE时，AND函数才返回TRUE,否则返回FALSE。通常在IF函数中使用',
                example: [ 'AND([订单数]>500,[地区] = "东北")，表示若订单数>500且属于东北地区时，返回TRUE,否则为False' ],
                rule: {
                    paramMin: 2,
                    paramMax: 2,
                    paramType: 'boolean',
                    returnType:'boolean'
                },
                ruleValid:ruleValid
            },
            {
                name: "OR",
                usage: "OR(表达式1,表达式2)",
                explain: '任一表达式返回TRUE时，OR函数就返回TRUE,否则返回FALSE。通常在IF函数中使用',
                example: [ 'OR([订单数]>500,[地区] = "东北")，表示若订单数>500或者属于东北地区时，返回TRUE,否则为False' ],
                rule: {
                    paramMin: 2,
                    paramMax: 2,
                    paramType: 'boolean',
                    returnType:'boolean'
                },
                ruleValid:ruleValid
            },
            {
                name: "LIKE",
                usage: "LIKE(字段,字符串)",
                explain: [
                    '将字段的内容与字符串比较，若成功匹配返回TRUE,否则返回FALSE。字符串中可使用以下通配符：',
                    '%  匹配0个或多个字符',
                    '_  匹配1个字符'
                ],
                example: [ 'LIKE([名称],"成都%")，表示若名称以成都开头时，返回TRUE,否则为False' ],
                rule: {
                    paramMin: 2,
                    paramMax: 2,
                    paramType: ['string|number|date','string'],
                    returnType:'boolean'
                },
                ruleValid:ruleValid
            }
        ]
    },
    {
        name:"转换函数",
        value:"convert",
        children:[
            {
                name: "CONVERT",
                usage: "CONVERT(字段,类型,[小数位数])",
                explain:[
                    "将字段的内容转换为指定的类型，类型可以是：",
                    "char：文本",
                    "decimal：小数，使用第3个参数指定小数位数，默认2位小数",
                    "integer：整数"
                ],
                example: [
                    'CONVERT(销售额, "char")将销售额转换为字符串；',
                    'CONVERT(字符串, "decimal",3)将字符串转换为浮点数，保留三位小数。'
                ],
                rule: {
                    paramMin: 2,
                    paramMax: 3,
                    paramType: ["number|string|date",'string','number'],
                    returnType: function(params) {
                        let type = params[1].value;
                        switch (type) {
                            case "char":
                                return "string";
                            case "decimal":
                                return "number";
                            case "integer":
                                return "number";
                            default:
                                return '';
                        }
                    }
                },
                ruleValid: function(params) {
                    let result = ruleValid.call(this, params);

                    if (result.result !== false) {
                        let type = params[1].value;
                        if(['char','decimal','integer'].indexOf(type) === -1){
                            result.result = false;
                            result.message = "函数[" + this.name + "]参数[2]值错误。";
                            return result;
                        }

                        return result;
                    }

                    return result;
                }
            }
        ]
    },
    {
        name: "聚合函数",
        value: "converge",
        children: [
            {
                name: "AVG",
                usage: "AVG(数值字段)",
                explain: "返回数值字段所有值的平均值，只适用于数值字段，空值不会计算",
                example: ['AVG(销售额) ,返回"销售额"字段对应的所有非空值的平均值'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "number",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "COUNT",
                usage: "COUNT(字段)",
                explain: "返回所有有效字段的数据条目数，空值不会计算",
                example: ['COUNT(销售额)，返回"销售额"字段对应的所有非空值的数据条目数'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "number|date|string",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "COUNT_DISTINCT",
                usage: "COUNT_DISTINCT(字段)",
                explain: "去重计数，返回所有有效字段的不同数据条目数，空值不会计算",
                example: ['COUNT_DISTINCT(销售额)，返回"销售额"字段对应的所有非空值的不同数据条目数'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "number|date|string",
                    returnType: "number"
                },
                ruleValid: ruleValid
            },
            {
                name: "MAX",
                usage: "MAX(数值字段/日期字段)",
                explain: "返回数值字段或日期字段中的最大值",
                example: ['MAX(销售额)，返回"销售额"字段对应值的最大值','MAX([登陆时间])，返回该字段中最大的日期'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "number|date",
                    returnType: function(params) {
                        return params[0].dataType;
                    }
                },
                ruleValid: ruleValid
            },
            {
                name: "MIN",
                usage: "MIN(数值字段/日期字段)",
                explain: "返回数值字段或日期字段中的最小值",
                example: ['MIN(销售额)，返回"销售额"字段对应值的最小值','MIN([登陆时间])，返回该字段中离当前时间最远的日期'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "number|date",
                    returnType: function(params) {
                        return params[0].dataType;
                    }
                },
                ruleValid: ruleValid
            },
            {
                name: "SUM",
                usage: "SUM(数值字段)",
                explain: "返回数值字段所有值的合计，只适用于数值字段，空值不会计算",
                example: ['SUM(销售额) ,返回“销售额”字段对应的所有非空值的总和'],
                rule: {
                    paramMin: 1,
                    paramMax: 1,
                    paramType: "number",
                    returnType: "number"
                },
                ruleValid: ruleValid
            }
        ]
    }
];
