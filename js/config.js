// JavaScript source code
const publicUrl = "http://www.aisono.cn/videoAnal";
const imgUrl='http://www.aisono.cn/fileupload';
// const filePath=Cookies.getJSON('pathInfo');


var loginToken = localStorage.getItem("loginToken");

var name = localStorage.getItem("name");

function tuichu() {
    layer.msg('登录状态失效', {icon: 5,time:2000},function () {
        localStorage.clear();
        window.location.href = './login.html';
    });

    //window.history.back(-1);
}

function parent_tuichu() {
    layer.msg('登录状态失效', {icon: 5,time:2000},function () {
        localStorage.clear();
        top.location.href='../login.html';
    });

    // top.location.href = '../login.html';
    // localStorage.clear();
    // window.parent.location.replace('../../readmk_changting/' + index + '.html');
}