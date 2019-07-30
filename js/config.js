// JavaScript source code
const publicUrl = "http://www.aisono.cn/videoAnal";
const imgUrl='http://www.aisono.cn/fileupload';



var loginToken = localStorage.getItem("loginToken");

var name = localStorage.getItem("name");

function tuichu() {
    localStorage.clear();
    window.location.href = './login.html';
    //window.history.back(-1);
}

function parent_tuichu() {
    localStorage.clear();
    window.location.href = '../login.html';
    // localStorage.clear();
    // window.parent.location.replace('../../readmk_changting/' + index + '.html');
}