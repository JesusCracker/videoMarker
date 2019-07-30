// JavaScript source code
var bi_rads = "";           //BI-RADS分级
var searchs = "";           //标注内容、医生姓名
var markType = "";          //病灶类型
var markDateBegin = "";     //标注时间起
var markDateEnd = "";       //标注时间止

var count = 0;          //导出多少条数据

function IFrameResize() {
    var obj = parent.document.getElementById("external-frame"); //取得父页面IFrame对象
    obj.height = this.document.body.scrollHeight + 20;
}

layui.use(['element', 'table', 'layer', 'form', 'laydate'], function () {
    var $ = layui.jquery
        , element = layui.element //Tab的切换功能，切换事件监听等，需要依赖element模块
        , table = layui.table
        , layer = layui.layer
        , form = layui.form
        , laydate = layui.laydate;

    //时间戳转为时间
    function createTime(v) {
        var date = new Date(v);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? '0' + m : m;
        var d = date.getDate();
        d = d < 10 ? ("0" + d) : d;
        var h = date.getHours();
        h = h < 10 ? ("0" + h) : h;
        var M = date.getMinutes();
        M = M < 10 ? ("0" + M) : M;
        var s = date.getSeconds();
        if (s < 10)
            s = '0' + s;
        var str = y + "年" + m + "月" + d + "日 " + h + ":" + M + ':' + s;
        return str;
    }

    //初始化用户列表表格
    table.render({
        elem: '#test',
        headers: {
            'loginToken': loginToken
        },
        where: {
            bi_rads: bi_rads,
            searchs: searchs,
            markType: markType,
            markDateBegin: markDateBegin,
            markDateEnd: markDateEnd
        },
        id: 'user',
        page: true,
        method: 'post',
        url: publicUrl + '/markWarehouse/list.do',
        cols: [[
            { field: 'doctorName', unresize: true, align: "center", title: '标注医生', width: '10%' },
            { field: 'markType', unresize: true, align: "center", title: '病灶类型', width: '10%' },
            { field: 'bi_rads', unresize: true, align: "center", title: 'BI-RADS分级', width: '10%' },
            { field: 'markContent', unresize: true, align: "center", title: '标注内容', width: '25%' },
            { field: 'markInfo', unresize: true, align: "center", title: '病灶位置', width: '20%', templet: function (row) {
                    var str = "X：" + row.x + "；Y：" + row.y + "；W：" + row.w + "；H：" + row.h;
                    return str;
                }
            },
            {
                field: 'createDate', unresize: true, align: "center", title: '标注时间', width: '15%', templet: function (row) {
                    return createTime(row.createDate);
                }
            },
            { fixed: 'right', unresize: true, align: "center", title: '标注图片', toolbar: '#dongjie', width: '10%' }
        ]],
        parseData: function (res) {
            if(res.code == 2){
                parent_tuichu()
            }
            var num = res.data.length;
            var height = 54 * num + 6;
            console.log(height)
            $(".layui-table-body").css("height",height + "px");
            IFrameResize()
            var code = 0;
            res.code = code;
            count = res.count;
            return res;
        }
    });

    //重载用户列表表格
    function chongzai(param) {
        table.reload('user', {
            page: { curr: 1 },
            elem: '#test',
            headers: {
                'loginToken': loginToken
            },
            method: 'post',
            where: {
                bi_rads: bi_rads,
                searchs: searchs,
                markType: markType,
                markDateBegin: markDateBegin,
                markDateEnd: markDateEnd
            },
            url: publicUrl + '/markWarehouse/list.do',
            parseData: function (res) {
                if(res.code == 2){
                    parent_tuichu()
                }
                var num = res.data.length;
                var height = 54 * num + 6;
                console.log(height)
                $(".layui-table-body").css("height",height + "px");
                IFrameResize()
                var code = 0;
                res.code = code;

                count = res.count;
                return res;
            }
        });
    }

    //监听点击查看标注图片按钮
    table.on('tool(test)', function (obj) {
        var data = obj.data;
        if (obj.event === 'edit') {
            $("#biaozhu_img").empty();
            var str = '<img class="bz_img" src="' + file_url + data.imgsrc + '" />';
            $("#biaozhu_img").append(str);
        }
    });

    //初始化日期组件
    laydate.render({
        elem: '#min_time'
        , max: 0
        , theme: '#3B8DF8'
        , range: '至' //或 range: '~' 来自定义分割字符
    });
    laydate.render({
        elem: '#max_time'
        , max: 0
        , theme: '#3B8DF8'
    });

    //表格头下拉框选择
    $("#bingzao_xiala").change(function () {
        markType = $("#bingzao_xiala").val();
        $('#bingzao').val(markType);
        form.render();
        if (markType == "请选择") {
            markType = "";
        }
        chongzai();
    });
    $("#fenji_xiala").change(function () {
        bi_rads = $("#fenji_xiala").val();
        $('#fenji').val(bi_rads);
        form.render();
        if (bi_rads == "请选择") {
            bi_rads = "";
        }
        chongzai();
    });

    //清除数据
    $(".clear").on("click", function () {
        $("#bingzao_xiala").val("请选择");
        $("#fenji_xiala").val("请选择");

        $("#name").val("");
        $("#bingzao").val("请选择");
        $("#fenji").val("请选择");
        $("#min_time").val("");
        form.render();
        laydate.render();

        //清除数据后调用筛选接口
        shaixuan();
    });

    //导出数据
    $(".daochu").on("click", function () {
        $.ajax({
            type: "post",
            async: true,
            url: publicUrl + "/markWarehouse/list.do?page=1&limit=" + count + "&bi_rads=" + bi_rads + "&searchs=" + searchs + "&markType=" + markType + "&markDateBegin=" + markDateBegin + "&markDateEnd=" + markDateEnd,
            headers: { "loginToken": loginToken },
            dataType: "json",
            success: function (res) {
                if(res.status == 2){
                    parent_tuichu()
                }
                var data = res.data;
                var daochu_data = [];
                for (var i = 0; i < data.length; i++) {
                    var weizhi = "X：" + data[i].x + "；Y：" + data[i].y + "；W：" + data[i].w + "；H：" + data[i].h;
                    var time = createTime(data[i].createDate);
                    var img_url = file_url + data[i].imgsrc;
                    var hang = [data[i].doctorName, data[i].markType, data[i].bi_rads, data[i].markContent, weizhi, time, img_url];
                    daochu_data.push(hang);
                }
                console.log(daochu_data)
                table.exportFile(['标注医生', '病灶类型', 'BI-RADS分级', '标注内容', '病灶位置', '标注时间', '标注图片'], daochu_data, 'xls'); //默认导出 csv，也可以为：xls
            },
            error: function (res) {
                
            }
        });
    });

    //筛选条件筛选
    function shaixuan() {
        searchs = $("#name").val();
        markType = $("#bingzao option:selected").val();
        bi_rads = $("#fenji option:selected").val();
        if (markType == "请选择") {
            markType = "";
        }
        if (bi_rads == "请选择") {
            bi_rads = "";
        }
        var time = $("#min_time").val();
        var count = time.indexOf('至');
        markDateBegin = time.substr(0, count);
        markDateEnd = time.substr(count + 1, time.length);

        chongzai();
    }

    $("#shaixuan").on("click", function () {
        shaixuan();
    });
});

//获取echarts图标数据
$.ajax({
    type: "post",
    async: true,
    url: publicUrl + "/markWarehouse/general.do",
    headers: { "loginToken": loginToken },
    dataType: "json",
    success: function (res) {
        if(res.status == 2){
            parent_tuichu()
        }
        //筛查总量
        $("#shaicha_num").text(res.data.total);

        //各年龄阶段筛查
        var ageMap = res.data.ageMap;
        var age_num = 0;
        $.each(ageMap, function (i, val) {
            if (age_num < 5) {
                age.push(i);
                age_data.push({ "value": val, "name": i });
            }
            age_num++;
        });
        var age_echarts = echarts.init(document.getElementById('age_echarts'));
        age_echarts.setOption(age_echarts_option);

        //病灶类型占比
        var markTypeMap = res.data.markTypeMap;
        var markTypeMap_num = 0;
        $.each(markTypeMap, function (i, val) {
            if (markTypeMap_num < 5) {
                bingzao_type.push(i);
                bingzao_data.push({ "value": val, "name": i });
            }
            markTypeMap_num++;
        });
        bingzao_echarts = echarts.init(document.getElementById('bingzao_echarts'));
        bingzao_echarts.setOption(bingzao_echarts_option);

        //BI-RADS分级占比
        var biradsMap = res.data.biradsMap;
        var biradsMap_num = 0;
        $.each(biradsMap, function (i, val) {
            if (biradsMap_num < 5) {
                fenji.push(i);
                fenji_data.push(val);
            }
            biradsMap_num++;
        });

        // 指定图表的配置项和数据
        fenji_echarts_option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'none'
                },
                formatter: function (params) {
                    return params[0].name + ': ' + params[0].value;
                }
            },
            grid: {
                left: '40%',
                right: 35,
                bottom: 10,
                top: 50,
                containLabel: true
            },
            title: {
                show: true,
                text: "BI-RADS分级占比",
                x: 'left',
                textStyle: {
                    color: '#37474F',
                    fontSize: '14',
                    fontWeight: '400'
                },
                padding: [15, 10, 5, 10]
            },
            xAxis: {
                data: fenji,
                axisTick: { show: false },
                axisLine: { show: false },
                axisLabel: {
                    interval: 0,
                    textStyle: {
                        color: '#37474F',
                        fontSize: 10
                    }
                }
            },
            yAxis: {
                splitLine: { show: false },
                axisTick: { show: false },
                axisLine: { show: false },
                axisLabel: { show: false }

            },
            color: ['#e54035'],
            series: [
                {
                    name: 'BI-BRADS等级',
                    type: 'pictorialBar',
                    barCategoryGap: '-130%',
                    hoverAnimation: true,
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            formatter: '{c}',
                            textStyle: {
                                fontSize: 14,
                                color: ['#3B8DF8']
                            }
                        }
                    },
                    symbol: 'path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z',
                    itemStyle: {
                        normal: {
                            opacity: 0.5
                        },
                        emphasis: {
                            opacity: 1
                        }

                    },
                    data: [
                        {
                            "value": fenji_data[0],
                            "itemStyle": {
                                "normal": {
                                    "color": "#5CE6BD"
                                }
                            }
                        },
                        {
                            "value": fenji_data[1],
                            "itemStyle": {
                                "normal": {
                                    "color": "#3B8DF8"
                                }
                            }
                        },
                        {
                            "value": fenji_data[2],
                            "itemStyle": {
                                "normal": {
                                    "color": "#FF7794"
                                }
                            }
                        }
                    ],
                    z: 10
                }

            ]
        };
        var fenji_echarts = echarts.init(document.getElementById('fenji_echarts'));
        fenji_echarts.setOption(fenji_echarts_option);
    },
    error: function (res) {

    }
});


//各年龄阶段筛查
var colorList = ['#5CE6BD', '#3B8DF8', '#FFCE56', '#FF7794'];
var age = [];
var age_data = [];
var colorListSub = ['rgba(35,143,56,.5)', 'rgba(26,87,178,.5)', 'rgba(176,75,7,.5)', 'rgba(175,129,8,.5)'];
var age_echarts_option = {
    backgroundColor: 'white',
    title: {
        text: '各年龄段筛查量占比',
        x: 'left',
        textStyle: {
            color: '#37474F',
            fontSize: '14',
            fontWeight: '400'
        },
        padding: [15, 10, 5, 10]
    },
    tooltip: {
        trigger: 'item',
        formatter: "{b}: {c} ({d}%)"
    },
    legend: {
        orient: 'vertical',
        textStyle: {
            color: '#999999'
        },
        x: 'left',
        top: 50,
        left: 10,
        data: age
    },
    series: [
        {
            type: 'pie',
            title: '32123',
            radius: ['10%', '70%'],
            roseType: 'radius',
            clockwise: false,
            z: 10,
            left: 250,
            center: [210, '50%'],
            itemStyle: {
                normal: {
                    color: function (params) {
                        return colorList[params.dataIndex];
                    },
                    shadowBlur: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
            },
            label: {
                normal: {
                    formatter: function (params) {
                        return params.percent + '%';
                    }
                }
            },
            labelLine: {
                normal: {
                    length: 0,
                    length2: 10,
                    lineStyle: {
                        width: 1
                    }
                }
            },
            data: age_data
        }
    ]
};


//病灶类型占比图
var bingzao_data = [];            //病灶类型数据
var bingzao_type = [];      //病灶类型
var bingzao_color = ['#5CE6BD', '#3B8DF8', '#FFDB5C'];
bingzao_echarts_option = {
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    title: {
        text: '病灶类型占比',
        x: 'left',
        textStyle: {
            color: '#37474F',
            fontSize: '14',
            fontWeight: '400'
        },
        padding: [15, 10, 5, 10]
    },
    legend: {
        orient: 'vertical',
        textStyle: {
            color: '#999999'
        },
        x: 'left',
        top: 50,
        left: 10,
        data: bingzao_type
    },
    series: [
        {
            name: '病灶类型',
            type: 'pie',
            radius: ['50%', '70%'],
            center: [210, '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
                normal: {
                    color: function (params) {
                        return bingzao_color[params.dataIndex];
                    },
                    shadowBlur: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
            },
            label: {
                normal: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    show: true,
                    textStyle: {
                        fontSize: '30',
                        fontWeight: 'bold'
                    }
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: bingzao_data
        }
    ]
};


//BI-RADS分级占比
var fenji = [];
var fenji_data = [];