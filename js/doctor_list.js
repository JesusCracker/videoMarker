//var count = 0;


function IFrameResize() {
    var obj = parent.document.getElementById("external-frame"); //取得父页面IFrame对象
    obj.height = this.document.body.scrollHeight;
}

layui.use('laypage', function () {
    var $ = layui.jquery
        , laypage = layui.laypage;

    
    $.ajax({
        type: "post",
        async: false,
        url: publicUrl + "/doctorWarehouse/list.do?page=1&limit=12",
        headers: { "loginToken": loginToken },
        dataType: "json",
        success: function (res) {
            if(res.code == 2){
                parent_tuichu()
            }
            add(res.data);
            var count = res.count;
            fenye(count);
            $(".doctor_num").text(count);
        },
        error: function (res) {

        }
    });

    function fenye(count) {
        laypage.render({
            elem: 'fenye' //注意，这里的 test1 是 ID，不用加 # 号
            , count: count //数据总数，从服务端得到
            , layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
            , theme: "#3B8DF8"
            , limit: 12
            , limits: [12]
            , jump: function (obj, first) {
                //obj包含了当前分页的所有参数，比如：
                //console.log(obj.curr); 得到当前页，以便向服务端请求对应页的数据。
                //console.log(obj.limit); 得到每页显示的条数
                
                //首次不执行
                if (!first) {
                    $.ajax({
                        type: "post",
                        async: false,
                        url: publicUrl + "/doctorWarehouse/list.do?page=" + obj.curr + "&limit=" + obj.limit,
                        headers: { "loginToken": loginToken },
                        dataType: "json",
                        success: function (res) {
                            if(res.code == 2){
                                parent_tuichu()
                            }
                            add(res.data);
                        },
                        error: function (res) {

                        }
                    });
                }
            }
        });
    }

    function add(param) {
        $("#list").empty();
        for (var i = 0; i < param.length; i++) {
            var str = '<li class="doctor_li">' +
                '<div class="yisheng">' +
                '<div class="user clearfix">' +
                '<div class="img">' +
                '<img src="http://www.aisono.cn/fileupload/' + param[i].headicon + '" />' +
                '</div>' +
                '<div class="info">';
            if (param[i].name) {
                str += '<p>' + param[i].name + '</p>';
            }
            if (param[i].doctorTitle) {
                str += '<span>' + param[i].doctorTitle + '</span><span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>';
            }
            if (param[i].doctorDepartment) {
                str += '<span>' + param[i].doctorDepartment + '</span>';
            }
            str += '<div class="addr">';
            if (param[i].doctorlocation) {
                str += '<img src="../img/hospital_icon.png" /><span>' + param[i].doctorlocation + '</span>';
            }
            str += '</div></div></div><div class="paihang clearfix">';
            if (param[i].doctorOrder) {
                str += '<div class="lie lie1"><p>' + param[i].doctorOrder + '</p><span>当前排名</span></div>';
            }else{
                str += '<div class="lie lie1"><p>0</p><span>当前排名</span></div>';
            }
            if (param[i].totalCount) {
                str += '<div class="lie lie2"><p>' + param[i].totalCount + '</p><span>阅片量</span></div>';
            }else{
                str += '<div class="lie lie2"><p>0</p><span>阅片量</span></div>';
            }
            if (param[i].aveTime) {
                str += '<div class="lie lie3"><span class="time">' + param[i].aveTime + '</span><span>min</span><br /><span>平均阅片时长</span></div>';
            }else{
                str += '<div class="lie lie3"><span class="time">0</span><span>min</span><br /><span>平均阅片时长</span></div>';
            }
            str += '</div></div></li>';

            $("#list").append(str);
        }
        
    }
});