/**
 * 测试模拟接口
 */
// import mock from "mockjs";
// import service from "@/modules/common/service";

// var arr = ["momo", "yanzi", "ziwei"];
// let obj = {
//     host: "www.baidu",
//     port: "12345",
//     node: "selector"
// };

// mock.mock("/test/data", {
//     "firstName|3": "fei", //重复fei这个字符串 3 次，打印出来就是'feifeifei'。
//     "lastName|2-5": "jiang", //重复jiang这个字符串 2-5 次。
//     "big|+1": 0, //属性值自动加 1，初始值为 0
//     "age|20-30": 25, //生成一个大于等于 20、小于等于 30 的整数，属性值 25 只是用来确定类型
//     "weight|100-120.2-5": 110.24, //生成一个浮点数,整数部分大于等于 100、小于等于 120，小数部分保留 2 到 5 位。
//     "likeMovie|1": Boolean, //随机生成一个布尔值，值为 true 的概率是 1/2，值为 false 的概率同样是 1/2。
//     "friend1|1": arr, //从数组 arr 中随机选取 1 个元素，作为最终值。
//     "friend2|+1": arr, //从属性值 arr 中顺序选取 1 个元素，作为最终值
//     "friend3|2-3": arr, //通过重复属性值 arr 生成一个新数组，重复次数大于等于 2，小于等于 3。
//     "life1|2": obj, //从属性值 obj 中随机选取 2 个属性
//     "life1|1-2": obj, //从属性值 obj 中随机选取 1 到 2 个属性。
//     regexp1: /^[a-z][A-Z][0-9]$/ //生成的符合正则表达式的字符串
// });

//查询数据集列表
// mock.mock("/xdatainsight/plugin/xdf/api/metadata/list", function() {
//     return [
//         { name: "bhbh", type: "metadata" },
//         { name: "bvb.xmi", type: "metadata" },
//         { name: "test.xmi", type: "metadata" }
//     ];
// });

//根据数据集查询数据集下字段
// mock.mock("/xdatainsight/plugin/xdf/api/metadata/modelInfo", function(options) {
//     return {
//         categories: [
//             {
//                 id: "Fact_inventory",
//                 name: "Fact inventory",
//                 columns: [
//                     {
//                         id: "LC_Fact_inventory_amount",
//                         name: "Amount",
//                         type: "NUMERIC",
//                         aggTypes: [
//                             "AVERAGE",
//                             "MAXIMUM",
//                             "COUNT_DISTINCT",
//                             "NONE",
//                             "SUM",
//                             "MINIMUM",
//                             "COUNT",
//                             "NONE"
//                         ],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "DIMENSION",
//                         category: "Fact_inventory",
//                         formatMask: "#",
//                         sourceTable: "Fact inventory",
//                         horizontalAlignment: "LEFT"
//                     },
//                     {
//                         id: "LC_Fact_inventory_brand_id",
//                         name: "Brand id",
//                         type: "NUMERIC",
//                         aggTypes: [
//                             "AVERAGE",
//                             "MAXIMUM",
//                             "COUNT_DISTINCT",
//                             "NONE",
//                             "SUM",
//                             "MINIMUM",
//                             "COUNT",
//                             "NONE"
//                         ],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "KEY",
//                         category: "Fact_inventory",
//                         formatMask: "#",
//                         sourceTable: "Fact inventory",
//                         horizontalAlignment: "LEFT"
//                     },
//                     {
//                         id: "LC_Fact_inventory_category_id",
//                         name: "Category id",
//                         type: "NUMERIC",
//                         aggTypes: [
//                             "AVERAGE",
//                             "MAXIMUM",
//                             "COUNT_DISTINCT",
//                             "NONE",
//                             "SUM",
//                             "MINIMUM",
//                             "COUNT",
//                             "NONE"
//                         ],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "KEY",
//                         category: "Fact_inventory",
//                         formatMask: "#",
//                         sourceTable: "Fact inventory",
//                         horizontalAlignment: "LEFT"
//                     },
//                     {
//                         id: "LC_Fact_inventory_num",
//                         name: "Num",
//                         type: "NUMERIC",
//                         aggTypes: [
//                             "AVERAGE",
//                             "MAXIMUM",
//                             "COUNT_DISTINCT",
//                             "NONE",
//                             "SUM",
//                             "MINIMUM",
//                             "COUNT",
//                             "NONE"
//                         ],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "DIMENSION",
//                         category: "Fact_inventory",
//                         formatMask: "#",
//                         sourceTable: "Fact inventory",
//                         horizontalAlignment: "LEFT"
//                     },
//                     {
//                         id: "LC_Fact_inventory_reckon_date",
//                         name: "Reckon date",
//                         type: "NUMERIC",
//                         aggTypes: [
//                             "AVERAGE",
//                             "MAXIMUM",
//                             "COUNT_DISTINCT",
//                             "NONE",
//                             "SUM",
//                             "MINIMUM",
//                             "COUNT",
//                             "NONE"
//                         ],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "DIMENSION",
//                         category: "Fact_inventory",
//                         formatMask: "#",
//                         sourceTable: "Fact inventory",
//                         horizontalAlignment: "LEFT"
//                     },
//                     {
//                         id: "LC_Fact_inventory_store_id",
//                         name: "Store id",
//                         type: "NUMERIC",
//                         aggTypes: [
//                             "AVERAGE",
//                             "MAXIMUM",
//                             "COUNT_DISTINCT",
//                             "NONE",
//                             "SUM",
//                             "MINIMUM",
//                             "COUNT",
//                             "NONE"
//                         ],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "KEY",
//                         category: "Fact_inventory",
//                         formatMask: "#",
//                         sourceTable: "Fact inventory",
//                         horizontalAlignment: "LEFT"
//                     }
//                 ]
//             },
//             {
//                 id: "Dim_brand",
//                 name: "Dim brand",
//                 columns: [
//                     {
//                         id: "LC_Dim_brand_brand_id",
//                         name: "Brand id",
//                         type: "NUMERIC",
//                         aggTypes: [
//                             "AVERAGE",
//                             "MAXIMUM",
//                             "COUNT_DISTINCT",
//                             "NONE",
//                             "SUM",
//                             "MINIMUM",
//                             "COUNT",
//                             "NONE"
//                         ],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "KEY",
//                         category: "Dim_brand",
//                         formatMask: "#",
//                         sourceTable: "Dim brand",
//                         horizontalAlignment: "LEFT"
//                     },
//                     {
//                         id: "LC_Dim_brand_brandname",
//                         name: "Brandname",
//                         type: "STRING",
//                         aggTypes: ["COUNT_DISTINCT", "NONE", "COUNT", "NONE"],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "DIMENSION",
//                         category: "Dim_brand",
//                         formatMask: null,
//                         sourceTable: "Dim brand",
//                         horizontalAlignment: "LEFT"
//                     }
//                 ]
//             },
//             {
//                 id: "Dim_district",
//                 name: "Dim district",
//                 columns: [
//                     {
//                         id: "LC_Dim_district_city",
//                         name: "City",
//                         type: "STRING",
//                         aggTypes: ["COUNT_DISTINCT", "NONE", "COUNT", "NONE"],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "DIMENSION",
//                         category: "Dim_district",
//                         formatMask: null,
//                         sourceTable: "Dim district",
//                         horizontalAlignment: "LEFT"
//                     },
//                     {
//                         id: "LC_Dim_district_country",
//                         name: "Country",
//                         type: "STRING",
//                         aggTypes: ["COUNT_DISTINCT", "NONE", "COUNT", "NONE"],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "DIMENSION",
//                         category: "Dim_district",
//                         formatMask: null,
//                         sourceTable: "Dim district",
//                         horizontalAlignment: "LEFT"
//                     },
//                     {
//                         id: "LC_Dim_district_county",
//                         name: "County",
//                         type: "STRING",
//                         aggTypes: ["COUNT_DISTINCT", "NONE", "COUNT", "NONE"],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "DIMENSION",
//                         category: "Dim_district",
//                         formatMask: null,
//                         sourceTable: "Dim district",
//                         horizontalAlignment: "LEFT"
//                     },
//                     {
//                         id: "LC_Dim_district_district_area",
//                         name: "District area",
//                         type: "STRING",
//                         aggTypes: ["COUNT_DISTINCT", "NONE", "COUNT", "NONE"],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "DIMENSION",
//                         category: "Dim_district",
//                         formatMask: null,
//                         sourceTable: "Dim district",
//                         horizontalAlignment: "LEFT"
//                     },
//                     {
//                         id: "LC_Dim_district_district_id",
//                         name: "District id",
//                         type: "NUMERIC",
//                         aggTypes: [
//                             "AVERAGE",
//                             "MAXIMUM",
//                             "COUNT_DISTINCT",
//                             "NONE",
//                             "SUM",
//                             "MINIMUM",
//                             "COUNT",
//                             "NONE"
//                         ],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "KEY",
//                         category: "Dim_district",
//                         formatMask: "#",
//                         sourceTable: "Dim district",
//                         horizontalAlignment: "LEFT"
//                     },
//                     {
//                         id: "LC_Dim_district_province",
//                         name: "Province",
//                         type: "STRING",
//                         aggTypes: ["COUNT_DISTINCT", "NONE", "COUNT", "NONE"],
//                         defaultAggType: "NONE",
//                         selectedAggType: "NONE",
//                         fieldType: "DIMENSION",
//                         category: "Dim_district",
//                         formatMask: null,
//                         sourceTable: "Dim district",
//                         horizontalAlignment: "LEFT"
//                     }
//                 ]
//             }
//         ],
//         id: "MODEL_1",
//         name: "test",
//         domainId: "test.xmi",
//         description: "This is the data model for test"
//     };
// });
