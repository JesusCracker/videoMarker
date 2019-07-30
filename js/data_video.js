// JavaScript source code
var video_left = [];
var video_right = [];
var video_count_left = 0;
var video_count_right = 0;

var status = "";            //3待阅片；10阅片中；20已阅片;30反馈异常;40异常（关闭）
var searchs = "";           //姓名，用户地址，aibusId,aibus地址
var examOrg = "";           //检查机构
var sex = "";               //性别（传男、女）
var ageBegin = "";          //最小年龄
var ageEnd = "";            //最大年龄
var examDateBegin = "";     //筛查时间起
var examDateEnd = "";       //筛查时间止

var count = 0;


$('#video').on('hide.bs.modal', function () {
    IFrameResize();
});

function IFrameResize() {
    var obj = parent.document.getElementById("external-frame"); //取得父页面IFrame对象
    obj.height = this.document.body.scrollHeight + 20;
}

function getNowtime() {
    var myDate = new Date();
    var now_time = myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + '-' + myDate.getDate();
    return now_time;
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
        title: "影像数据仓",
        headers: {
            'loginToken': loginToken
        },
        id: 'user',
        page: true,
        method: 'post',

        url: publicUrl + '/imageWarehouse/list.do',
        cols: [[
            { field: 'name', unresize: true, align: "center", title: '姓名', width: '10%' },
            { field: 'sex', unresize: true, align: "center", title: '性别', width: '5%' },
            { field: 'age', unresize: true, align: "center", title: '年龄', width: '5%' },
            // { field: 'examOrg', unresize: true, align: "center", title: '筛查机构', width: '5%' },
            {
                field: 'status', unresize: true, align: "center", title: '状态', width: '10%', templet: function (row) {
                    if (row.status == 3) {
                        return "待阅片";
                    }
                    if (row.status == 10) {
                        return "阅片中";
                    }
                    if (row.status == 20) {
                        return "已阅片";
                    }
                    if (row.status == 30) {
                        return "反馈异常";
                    }
                    if (row.status == 40) {
                        return "异常";
                    }
                } },
            { field: 'location', unresize: true, align: "center", title: '用户地址', width: '25%' },
            // { field: 'device_no', unresize: true, align: "center", title: 'AiBUS ID', width: '5%' },
            // { field: 'aibus_address', unresize: true, align: "center", title: 'AiBUS所在地', width: '20%' },
            {
                field: 'examination_date', unresize: true, align: "center", title: '筛查时间', width: '20%', templet: function (row) {
                    return createTime(row.examination_date);
                }
            },
            { fixed: 'right', unresize: true, align: "center", title: '视频', toolbar: '#dongjie', width: '15%' }
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
            count = res.count;
            var code = 0;
            res.code = code;
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
                "searchs": searchs,
                "sex": sex,
                "examOrg": examOrg,
                "status": status,
                "ageBegin": ageBegin,
                "ageEnd": ageEnd,
                "examDateBegin": examDateBegin,
                "examDateEnd": examDateEnd
            },
            url: publicUrl + '/imageWarehouse/list.do',
            parseData: function (res) {
                if(res.code == 2){
                    parent_tuichu()
                }
                var num = res.data.length;
                var height = 54 * num + 6;
                console.log(height)
                $(".layui-table-body").css("height",height + "px");
                IFrameResize()
                count = res.count;
                var code = 0;
                res.code = code;
                return res;
            }
        });
    }

    //监听点击查看video按钮
    table.on('tool(test)', function (obj) {
        var data = obj.data;
        if (obj.event === 'edit') {
            parent.document.getElementById("external-frame").height = 1250;
            left_num = data.left_video_num;
            right_num = data.right_video_num;
            url = data.file_path;
            url=url.split('\/home')[1];
            for (var i = 0; i < left_num; i++) {
                $(".video_left1").eq(i).css("display", "block");
            }
            for (var i = 0; i < right_num; i++) {
                $(".video_right1").eq(i).css("display", "block");
            }
            var src_left = file_url1 + url + "/left/inner1.mp4";
            var src_right = file_url1 + url + "/right/inner1.mp4";



            player1.ready(function () {
                this.src(src_left);
                handleVideoOperate_left(this, "videoTag-left1");
            });

            player2.ready(function () {
                this.src(src_right);
                handleVideoOperate_right(this, "videoTag-right");
            });

            video_left.push(file_url1 + url + "/left/inner1.mp4");
            video_left.push(file_url1 + url + "/left/inner2.mp4");
            video_left.push(file_url1 + url + "/left/inner3.mp4");
            video_left.push(file_url1 + url + "/left/outer4.mp4");
            video_left.push(file_url1 + url + "/left/outer5.mp4");

            video_right.push(file_url1 + url + "/right/inner1.mp4");
            video_right.push(file_url1 + url + "/right/inner2.mp4");
            video_right.push(file_url1 + url + "/right/inner3.mp4");
            video_right.push(file_url1 + url + "/right/outer4.mp4");
            video_right.push(file_url1 + url + "/right/outer5.mp4");
        }
    });

    //初始化日期组件
    laydate.render({
        elem: '#min_time'
        , max: 0
        , theme: '#3B8DF8'
        , range: '至' //或 range: '~' 来自定义分割字符
    });

    //表格头下拉框选择
    $("#zhuangtai_xiala").change(function () {
        status = $("#zhuangtai_xiala").val();
        $('#zhuangtai').val(status);
        form.render();
        if (status == "请选择") {
            status = "";
        } else if (status == "待阅片") {
            status = "3";
        } else if (status == "阅片中") {
            status = "10";
        } else if (status == "已阅片") {
            status = "20";
        } else if (status == "反馈异常") {
            status = "30";
        } else if (status == "异常") {
            status = "40";
        }
        chongzai();
    });

    //清除数据
    $(".clear").on("click", function () {
        $("#zhuangtai_xiala").val("请选择");

        $("#name").val("");
        $("#sex").val("请选择");
        $("#jigou").val("请选择");
        $("#zhuangtai").val("请选择");
        $("#min_age").val("");
        $("#max_age").val("");
        $("#min_time").val("");
        $("#max_time").val("");
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
            url: publicUrl + "/imageWarehouse/list.do?page=1&limit=" + count + "&status=" + status + "&searchs=" + searchs + "&examOrg=" + examOrg + "&sex=" + sex + "&ageBegin=" + ageBegin + "&ageEnd=" + ageEnd + "&examDateBegin=" + examDateBegin + "&examDateEnd=" + examDateEnd,
            headers: { "loginToken": loginToken },
            dataType: "json",
            success: function (res) {
                if(res.status == 2){
                    parent_tuichu()
                }
                var data = res.data;
                var daochu_data = [];
                for (var i = 0; i < data.length; i++) {
                    var status = "";
                    if (data[i].status == "请选择") {
                        status = "";
                    } else if (data[i].status == "3") {
                        status = "待阅片";
                    } else if (data[i].status == "10") {
                        status = "阅片中";
                    } else if (data[i].status == "20") {
                        status = "已阅片";
                    } else if (data[i].status == "30") {
                        status = "反馈异常";
                    } else if (data[i].status == "40") {
                        status = "异常";
                    }
                    var time = createTime(data[i].examination_date);
                    var hang = [data[i].name, data[i].sex, data[i].age, status, data[i].location, time];
                    daochu_data.push(hang);
                }
                table.exportFile(['姓名', '性别', '年龄', '状态', '用户地址', '筛查时间'], daochu_data, 'xls'); //默认导出 csv，也可以为：xls
            },
            error: function (res) {

            }
        });
    });

    //筛选条件筛选
    function shaixuan() {
        searchs = $("#name").val();
        sex = $("#sex option:selected").val();
        if (sex == "请选择") {
            sex = "";
        }
        examOrg = $("#jigou option:selected").val();
        if (examOrg == "请选择") {
            examOrg = "";
        }
        status = $("#zhuangtai option:selected").val();
        if (status == "请选择") {
            status = "";
        } else if (status == "待阅片") {
            status = "3";
        } else if (status == "阅片中") {
            status = "10";
        } else if (status == "已阅片") {
            status = "20";
        } else if (status == "反馈异常") {
            status = "30";
        } else if (status == "异常") {
            status = "40";
        }
        ageBegin = $("#min_age").val();
        ageEnd = $("#max_age").val();
        var time = $("#min_time").val();
        if(time != ""){
            var time_arr = time.split('至');
            console.log(time_arr)
            console.log(time_arr[0])
            console.log(time_arr[1])
            examDateBegin = time_arr[0];
            examDateEnd = time_arr[1];
        }
        chongzai();
    }

    $("#shaixuan").on("click", function () {
        shaixuan();
    });
});

var options = {
    language: "zh-CN", // 默认是 en

    controls: true,
    muted: true, // 静音
    ControlBar: {},
    preload: "auto",

    playbackRates: [0.5, 1, 1.5, 1.75, 2] // 控制播放速度，视频中会出一个控件
};

// 同时控制视频的速率和当前播发到哪一个时间点
var videoOpt = {
    currentTime: "",
    volume: "", // 音量
    playbackRate: 1, // 视频播放速度
    aspectRatio: "4:3"
};

function handleVideoOperate_left(__this, className) {
    var _this = __this;

    var _player = videojs(className);

    // 当改变播放时间，拖动播放轴时--同时快进和后退
    _this.on("progress", function () {
        videoOpt.currentTime = _this.currentTime();
        _player.currentTime(videoOpt.currentTime);
    });
    _this.on("waiting", function () {
        //alert("视频正在缓冲！！！");
    });
    // 同步声音，这里可能没有必要，影像应该是没有声音的
    _this.on("volumechange", function () {
        videoOpt.volume = _this.volume();
        _player.volume(videoOpt.volume);
    });
    // 同步控制播放速度
    _this.on("ratechange", function () {
        videoOpt.playbackRate = _this.playbackRate();
        _player.playbackRate(videoOpt.playbackRate);
    });
    _this.on("timeupdate", function () {
        var bili = player1.currentTime() / this.duration();
        var img_count = bili * 100 / 4.54;
        img_count = Math.floor(img_count) + video_count_left * 22;
        if (img_count > 0) {
            $("#vide_img_left1").css("display", "block");
            $("#vide_img_left1").attr("src", "../img/right_round/right (" + img_count + ").png");
        } else {
            $("#vide_img_left1").css("display", "none");
        }
    });
    // 做事件监听
    _this.on("ended", function () {
        $(".playBtn").eq(0).text("播放");

        // 提示医生，切换病人信息吧，ajax
    });
    //
    _this.on("error", function (error) {
        //_this.
    });
}
function handleVideoOperate_right(__this, className) {
    var _this = __this;

    var _player = videojs(className);

    // 当改变播放时间，拖动播放轴时--同时快进和后退
    _this.on("progress", function () {
        videoOpt.currentTime = _this.currentTime();
        _player.currentTime(videoOpt.currentTime);
    });
    _this.on("waiting", function () {
        //alert("视频正在缓冲！！！");
    });
    // 同步声音，这里可能没有必要，影像应该是没有声音的
    _this.on("volumechange", function () {
        videoOpt.volume = _this.volume();
        _player.volume(videoOpt.volume);
    });
    // 同步控制播放速度
    _this.on("ratechange", function () {
        videoOpt.playbackRate = _this.playbackRate();
        _player.playbackRate(videoOpt.playbackRate);
    });
    _this.on("timeupdate", function () {
        var bili = player2.currentTime() / this.duration();
        var img_count = bili * 100 / 4.54;
        img_count = Math.floor(img_count) + video_count_right * 22;
        if (img_count > 0) {
            $("#vide_img_right1").css("display", "block");
            $("#vide_img_right1").attr("src", "../img/right_round/right (" + img_count + ").png");
        } else {
            $("#vide_img_right1").css("display", "none");
        }
    });
    // 做事件监听
    _this.on("ended", function () {
        //$(".playBtn").attr("disabled", true);

        $(".playBtn").eq(1).text("播放");
    });
    //
    _this.on("error", function (error) {
        //_this.
    });
}
var player1 = videojs("videoTag-left1", options);
var player2 = videojs("videoTag-right", options);

function getvideo(url, left_num, right_num) {
    left_num = 5;
    right_num = 5;
    url = "patientData2/result/2018-11-13_17_31_46";
    for (var i = 0; i < left_num; i++) {
        if(i<3){
            $(".video_left1").eq(i).css("display", "block");
        }
    }
    for (var i = 0; i < right_num; i++) {
        if(i<3){
            $(".video_right1").eq(i).css("display", "block");
        }
    }
    var src_left = file_url1 + url + "/left/inner1.mp4";
    var src_right = file_url1 + url + "/right/inner1.mp4";

    player1.ready(function () {
        this.src(src_left);
        handleVideoOperate_left(this, "videoTag-left1");
    });

    player2.ready(function () {
        this.src(src_right);
        handleVideoOperate_right(this, "videoTag-right");
    });

    video_left.push(file_url1 + url + "/left/inner1.mp4");
    video_left.push(file_url1 + url + "/left/inner2.mp4");
    video_left.push(file_url1 + url + "/left/inner3.mp4");
    video_left.push(file_url1 + url + "/left/outer4.mp4");
    video_left.push(file_url1 + url + "/left/outer5.mp4");

    video_right.push(file_url1 + url + "/right/inner1.mp4");
    video_right.push(file_url1 + url + "/right/inner2.mp4");
    video_right.push(file_url1 + url + "/right/inner3.mp4");
    video_right.push(file_url1 + url + "/right/outer4.mp4");
    video_right.push(file_url1 + url + "/right/outer5.mp4");
}

var lastTime = Date.now();

// 播放操作
$(".playBtn").click(function () {
    var currentTime = Date.now();
    var protectTime = 100; // 设置保护性延时，单位毫秒
    var btnText = $(this).text();
    //获取当点点击的那一个“播放”按钮
    var playBtnIndex = $(".playBtn").index($(this));
    /**
     *  防止用户点击过快，出现报错 1秒钟点40-50下
     * 报错信息 Uncaught (in promise) DOMException: The play() request was interrupted by a call to pause(). https://goo.gl/LdLk22
     * @param {https://www.cnblogs.com/zzsdream/p/6125223.html}
     * */
    if (currentTime - lastTime < protectTime) {
        return; // 直接退出
    }

    if (btnText === "播放") {
        $(this).text("暂停");
        if (playBtnIndex == 0) {
            player1.play();
        } else {
            player2.play();
        }
    } else if (btnText === "暂停") {
        $(this).text("播放");
        if (playBtnIndex == 0) {
            player1.pause();
        } else {
            player2.pause();
        }
    }
});

//点击切换左侧乳房视频
$(".video_left1").on('click', function () {
    var index = $(this).index();        //点击的第几个div
    video_count_left = index;
    $(this).siblings().removeClass("is_act");
    $(this).addClass("is_act");
    player1.ready(function () {
        this.src(video_left[index]);
        handleVideoOperate_left(this, "videoTag-right");
    });
    $(".playBtn").eq(0).text("播放");
});

//点击切换左侧乳房视频
$(".video_right1").on('click', function () {
    var index = $(this).index();        //点击的第几个div
    video_count_right = index;
    $(this).siblings().removeClass("is_act");
    $(this).addClass("is_act");
    player2.ready(function () {
        this.src(video_right[index]);
        handleVideoOperate_right(this, "videoTag-right");
    });
    $(".playBtn").eq(1).text("播放");
});

//获取echarts图标数据
// $.ajax({
//     type: "post",
//     async: true,
//     url: publicUrl + "/imageWarehouse/general.do",
//     headers: { "loginToken": loginToken },
//     dataType: "json",
//     success: function (res) {
//         if(res.status == 2){
//             parent_tuichu()
//         }
//         //筛查总量
//         $("#shaicha_num").text(res.data.total);

//         //各年龄阶段筛查
//         var ageMap = res.data.ageMap;
//         var age_num = 0;
//         $.each(ageMap, function (i, val) {
//             if (age_num < 5) {
//                 age_count.push(i);
//                 age_data.push({"value":val,"name":i});
//             }
//             age_num++;
//         });
//         var age_echarts = echarts.init(document.getElementById('age_echarts'));
//         age_echarts.setOption(age_echarts_option);

//         //筛查机构占比
//         var orgMap = res.data.orgMap;
//         var org_num = 0;
//         var zong_num = 0;
//         $.each(orgMap, function (i, val) {
//             zong_num += val;
//         });
//         $.each(orgMap, function (i, val) {
//             if (org_num < 5) {
//                 titlename.push(i);
//                 data.push(val);
//                 valdata.push(Math.round((val / zong_num * 100) * Math.pow(10, 1)) / Math.pow(10, 1));
//                 zongshu.push(zong_num);
//             }
//             org_num++;
//         });
//         var jigou_echarts = echarts.init(document.getElementById('jigou_echarts'));
//         jigou_echarts.setOption(jigou_echarts_option);

//         //区域筛查排行
//         var areaMap = res.data.areaMap;
//         var area_num = 0;
//         var area_zong_num = 0;
//         $.each(areaMap, function (i, val) {
//             area_zong_num += val;
//         });
//         $.each(areaMap, function (i, val) {
//             if (area_num < 5) {
//                 addr.push(i);
//                 addr_count_data.push(val);
//                 addr_baifenbi_data.push(Math.round((val / area_zong_num * 100) * Math.pow(10, 1)) / Math.pow(10, 1));
//             }
//             area_num++;
//         });
//         console.log(addr_baifenbi_data)
//         var addr_echarts = echarts.init(document.getElementById('addr_echarts'));
//         addr_echarts.setOption(addr_echarts_option);
//     },
//     error: function (res) {

//     }
// });


//各年龄阶段筛查
var colorList = ['#5CE6BD', '#3B8DF8', '#FFCE56', '#FF7794'];
var colorListSub = ['rgba(35,143,56,.5)', 'rgba(26,87,178,.5)', 'rgba(176,75,7,.5)', 'rgba(175,129,8,.5)'];
var age_data = [];
var age_count = [];
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
        left:10,
        data: age_count
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
            center:[210,'50%'],
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


//筛查机构占比
var data = [];        //数量
var titlename = [];
var valdata = [];        //百分比
var zongshu = [];
var myColor = ['#FF7794FF', '#5CE6BDFF', '#3B8DF8FF', '#FFCE56FF', 'red'];
jigou_echarts_option = {
    backgroundColor: 'white',
    title: {
        text: '参与筛查机构占比',
        x: 'left',
        textStyle: {
            color: '#37474F',
            fontSize: '14',
            fontWeight: '400'
        },
        padding: [15, 10, 5, 10]
    },
    grid: {
        left: 10,
        right: 10,
        bottom: -15,
        top: 40,
        containLabel: true
    }, 
    xAxis: {
        show: false
    },
    yAxis: [{
        show: true,
        data: titlename,
        inverse: true,
        axisLine: {
            show: false
        },
        splitLine: {
            show: false
        },
        axisTick: {
            show: false
        },
        axisLabel: {
            color: '#999'
        }


    }, {
        show: true,
        inverse: true,
        data: valdata,
        axisLabel: {
            formatter: function (value) {
                return value + '%';
            },
            textStyle: {
                fontSize: 12,
                color: '#999999'
            }
        },
        axisLine: {
            show: false
        },
        splitLine: {
            show: false
        },
        axisTick: {
            show: false
        }

    }],
    series: [
        {
            name: '条',
            type: 'bar',
            yAxisIndex: 0,
            data: data,
            barWidth: 6,
            barCategory: '100%',
            z: 2,
            itemStyle: {
                normal: {
                    barBorderRadius: 15,
                    color: function (params) {
                        var num = myColor.length;
                        return myColor[params.dataIndex % num];
                    }
                }
            }
        },
        {
            name: '框',
            type: 'bar',
            yAxisIndex: 1,
            barGap: '-100%',
            barCategory: '100%',
            data: zongshu,
                barWidth: 6,
            z:1,
            itemStyle: {
                normal: {
                    color: '#EAEDF0FF',
                    barBorderRadius: 15
                }
            }
        }
    ]
};


//区域筛查排行
var addr = [];
var addr_color = ['#FF7794', '#5CE6BD', '#3B8DF8', '#FFCE56', '#91C1FF'];
var addr_count_data = [];    //筛查数量
var addr_baifenbi_data = [];       //疑似率
var addr_echarts_option = {

    tooltip: {
        trigger: 'axis',
        formatter: '{b0}<br/>{a0}: {c0}<br />{a1}: {c1}%<br />'
    },
    grid: {
        left: 10,
        right: 10,
        bottom: 10,
        top: 40,
        containLabel: true
    }, 
    title: {
        show: true,
        text: "区域筛查排行榜",
        x: 'left',
        textStyle: {
            color: '#37474F',
            fontSize: '14',
            fontWeight: '400'
        },
        padding: [15, 10, 5, 10]
    },
    xAxis: [
        {
            type: 'category',
            data: addr,
            axisLine: {
                show: false
            },
            axisTick: false
        }
    ],
    yAxis: [
        {
            type: 'value',
            min: 0,
            axisLabel: {
                formatter: '{value}',
                show: false
            },
            splitLine: {
                show: false // 网格线是否显示
            },
            show: false
        },
        {
            type: 'value',
            min: 0,
            max: 100,
            position: 'right',
            axisLabel: {
                formatter: '{value}'
            },
            splitLine: {
                show: false // 网格线是否显示
            },
            show: false
        }
    ],
    series: [
        {
            name: '检查次数',
            type: 'bar',
            itemStyle: {
                normal: {
                    color: function (params) {
                        return addr_color[params.dataIndex];
                    },
                    label: {
                        show: true, //开启显示
                        position: 'top', //在上方显示
                        textStyle: { //数值样式
                            color: 'black',
                            fontSize: 14
                        }
                    }
                }
            },
            data: addr_count_data
        },
        {
            name: '区域筛查率',
            type: 'line',
            yAxisIndex: 1,
            itemStyle: {
                normal: { color: '#FF900D' },
                label: {
                    show: true,
                    textStyle: { //数值样式
                        color: 'black',
                        fontSize: 14
                    }
                }

            },
            data: addr_baifenbi_data
        }
    ]
};