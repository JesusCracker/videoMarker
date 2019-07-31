
if( localStorage.getItem("name")=='admin'){

    var leftList = [{name: "工作台", title: "视频分析记录平台", url: "./workbench.html"},
        {name: "播放视频", title: "视频分析记录平台", url: "./videoPlay.html"},
        {name: "标注图像", title: "视频分析记录平台", url: "./annotatedImage.html"},
        {name: "查看结果", title: "视频分析记录平台", url: "./viewResults.html"},
        {name: "新增用户", title: "视频分析记录平台", url: "./addUser.html"},
        // {name: "更改密码", title: "视频分析记录平台", url: "./changePWD.html"},
        {name: "用户管理", title: "视频分析记录平台", url: "./userList.html"}];

}
else{

    var leftList = [{name: "工作台", title: "视频分析记录平台", url: "./workbench.html"},
        {name: "播放视频", title: "视频分析记录平台", url: "./videoPlay.html"},
        {name: "标注图像", title: "视频分析记录平台", url: "./annotatedImage.html"},
        {name: "查看结果", title: "视频分析记录平台", url: "./viewResults.html"},
        {name: "更改密码", title: "视频分析记录平台", url: "./changePWD.html"}]


}

for (var i = 0; i < leftList.length; i++) {
    var li = "";
    if (i === 0) {
        li = "<li class='left_li active'><span>" + leftList[i].name + "</span></li>";
        $("#title").text(leftList[i].title);
        $(".layui-body").load(leftList[i].url);
    } else {
        li = "<li class='left_li'><span>" + leftList[i].name + "</span></li>";
    }
    $("#left_ul").append(li);
}

$(".left_li").on("click", function () {
    $(".left_li").removeClass("active");
    $(this).addClass("active");
    $("#title").text(leftList[$(".left_li").index(this)].title);

    $(".layui-body").empty();
    $(".layui-body").load(leftList[$(".left_li").index(this)].url);
});

//设置登录后右上角的信息

if (name == 'null') {
    location.href = 'login.html';
}

$("#n-names").text(name);


