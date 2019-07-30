$(function () {
    getyzm();
});

document.onkeydown = function (e) { // 回车提交表单
    var theEvent = window.event || e;
    var code = theEvent.keyCode || theEvent.which;
    if (code == 13) {
        $("#LAY-user-login-submit").click(); // 提交按钮的ID
    }
}



//提交
layui.use(['form'], function () {
    var form=layui.form;

    // 首先判断有没有存储登陆用户信息
    if (Cookies.get('loginInfo') != null) {

        // 将存储的信息显示到输入框中
        var login_info = Cookies.getJSON('loginInfo');
        $(".inp-username").val(login_info.name);
        $(".inp-password").val(login_info.password);
        //设置“记住密码”为选中状态
        $(".remember-password").prop("checked", true);
        form.render()

    } else {
        $(".remember-password").prop("checked", false);
        $(".inp-username").val("");
        $(".inp-password").val("");
        form.render();
    }




    //保存密码
    form.on('checkbox(remember-password)', function(data){
        var isRemember = $(".remember-password").prop("checked");
        if (isRemember === true) {
            var us = $(".inp-username").val();
            var ps = $(".inp-password").val();
            var loginInfo = {
                name: us,
                password: ps
            };
            var loginInfoStr = JSON.stringify(loginInfo);
            Cookies.set('loginInfo', loginInfoStr);
        } else {
            Cookies.remove('loginInfo');

        }
    });


    //登录提交
    form.on('submit(LAY-user-login-submit)', function(obj){

        var usr_name = $("#LAY-user-login-username").val();
        var ps_word = $("#LAY-user-login-password").val();
        if (usr_name === "" || ps_word === "") {
            layer.msg("用户名或密码为空");
            return;
        }
        var yzm = $("#LAY-user-login-vercode").val();
        if (yzm === "") {
            layer.msg("验证码为空");
            return;
        }
        var data = {
            "phone": usr_name,
            "password": ps_word,
            "secCode": yzm
        };
        var headers = {
            "localIdentification": uuids
        };

        $.ajax({
            type: "POST",
            headers: headers,
            url: publicUrl + "/user/login.do",
            data: JSON.stringify(data),
            async: true,
            dataType: "json",
            cache: false,
            processData: false,
            contentType: false,
            crossDomain: true,
            success: function (resp) {
                if (resp.message === "成功") {
                    // layer.msg("登陆成功");
                    // 记录用户登录信息
                    localStorage.setItem("name", resp.data.name);
                    localStorage.setItem("loginToken", resp.data.loginToken);
                    //登入成功的提示与跳转
                     layer.msg('登入成功', {
                          offset: 'auto'
                         ,icon: 1
                         ,time: 1000
                     }, function(){
                         location.href = './index.html'; //后台主页
                     });


                } else {
                    layer.msg(resp.message);
                    getyzm();
                }
            },
            error: function (resp) {
                layer.msg("登陆失败");
            }
        });

    });


});



//生成32位uuid
function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        //uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 32; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 32;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    uuids = uuid.join('');
    return uuid.join('');
}

//获取验证码图片
function getyzm() {
    var uuid = this.uuid();
    var src = publicUrl + "/verificationCode.do?localIdentification=" + uuid;
    $("#yzmimg").attr("src", src);
}

//uuid
var uuids = "";
