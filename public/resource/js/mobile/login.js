if($.fn.cookie("Q")){
    // 跳转到目标地址
    redirectDestUrl();
}
//--------------------------登录------------------------------------------
var loginHtml = [
    ' <div id="modLoginWrap">',
	'		<div id="errorTips"><span id="qt_global_text"></span></div>',
	'		<div class="mod-get-pwd">',
	'			<div class="cleaript">',
	'				<input type="text" value="" id="qt_account" class="ipt" placeholder="手机号/用户名/邮箱"/>',
	'			</div>',
	'			<div class="cleaript">',
	'				<input type="password" value="" id="qt_password" class="ipt" placeholder="请输入您的密码"/>',
	'			</div>',
	'			<div class="phrase" style="display:none">',
	'				<p class="uname">验证码：</p>',
	'				<div class="cleaript">',
	'					<input type="text" value="" id="qt_phrase" class="ipt" style="width:50%;"/>',
	'					<span class="phrase-code" style="cursor:pointer">',
    '                		<img title="点击换一张" id="qt_phrasecode" src="//captcha.360.cn/image.php?app=i360&random='+Math.random()+'" alt="验证码" height="35" width="99" style="vertical-align: middle;"/>',
    '                		<a>看不清换一张</a>',
    '           		</span>',
	'				</div>',
	'			</div>',
	'			<div id="iskeepalive" style="margin-bottom:1em;height:20px;">',
    '				<span style="float:left"><label for="qtis_autologin"><input type="checkbox" id="qtis_autologin" tabindex="5" checked="checked" value="1">下次自动登录</label></span>',
	'			</div>',
	'			<div class="btn btn-next-one">',
	'				<a id="qt_btn" href="javascript:void(0);">登录</a>',
	'			</div>',
    '           <div id="iskeepalive" style="margin-bottom:10px;height:20px;">',
    '               <span style="float:left"><a href="http://i.360.cn/findpwdwap/" target="_blank">忘记密码？</a></span>',    
    '               <span style="float:right;"><a href="javascript:void(0)" class="no-account">没有360账号，去注册&gt;</a></span>',
    '           </div>',    
	'		</div>',
	'	</div>'
].join('');
function initLogin() {
    $('#logRegWrap').html(loginHtml);
    $('#login').attr('class', 'login');        
    var errTimeout;
	
    QHPass.mShowLogin(function(data){//登陆成功会掉
        // 跳转到目标地址
        redirectDestUrl();
    },{
        doms:{
            account:'qt_account',
            password:'qt_password',
            phrase:'qt_phrase',
            isAutologin:'qtis_autologin',
            globalTips:'qt_global_text',
            phraseImg: 'qt_phrasecode'
        },
        extFun:{
            init: function(){
                var userName = $('#qt_account'),
                    pwd = $('#qt_password');

                //提交
                $("#qt_btn").on('click', function(){
                    QHPass.loginUtils.submit();
                });
                $("#qt_account").on('keydown', function(e){
                    if(e.keyCode == 13) {
                        $('#qt_password').focus();
                    }
                });
                $('#qt_password').on('keydown',function(e) {
                    if(e.keyCode == 13) {
                        //验证码可见的时候，自动定位到这个input 简单处理，之前用的是qwrap的isVisible
                        if($("#modLoginWrap .phrase").css('display') !== 'none') {
                            $('#qt_phrase').focus();
                        } else {
                            QHPass.loginUtils.submit();
                        }
                    }
                });
                 $('#qt_phrase').on('keydown',function(e) {
                    if(e.keyCode == 13) {
                        QHPass.loginUtils.submit();
                    }
                 });
                 //验证码刷新绑定
                $('#modLoginWrap .phrase-code').on('click',function() {
                    QHPass.loginUtils.setPhrase();
                });
              
               $('.no-account').on('click',function() {
                    hideLogin();
                    initPhoneReg();
                    document.location.hash = '#reg';
                    animRuner($('#logRegWrap'), 'anim-in-s', 'anim-in', 300);
                });
            },
            phrase:function(){
            //验证码的控制逻辑
                $("#modLoginWrap .phrase").show();
                $('#qt_phrase').focus();
                QHPass.loginUtils.setPhrase();
            },
            error:function(data){
                $('#errorTips').css('visibility','visible');
                QHPass.loginUtils.setPhrase();
                if(errTimeout) clearTimeout(errTimeout);
                errTimeout = setTimeout(function(){
                    $('#errorTips').css('visibility','hidden');
                }, 5000);
            },
            correct:function(data){
            },
            before: function(){showLoadding(true);},
            loading: function(){},
            after: function() {showLoadding(false);}
        },
        phraseTime:'center',
        src:'mpw_tcb'
    });
}
//----------------------------邮箱注册----------------------------
var regEmailHtml = [
	' <div id="modRegWrap">',
	'		<div id="errorTips"><span id="qt_global_text"></span></div>',
	'		<div class="mod-get-pwd">',	
	'			<div class="cleaript">',
	'				<input type="text" value="" id="qt_loginemail" class="ipt" placeholder="请输入您的邮箱"/>',
	'			</div>',	
	'			<div class="cleaript">',
	'				<input type="password" value="" id="qt_password" class="ipt" placeholder="请输入密码"/>',
	'			</div>',
	'			<div class="phrase">',
	'				<div class="cleaript">',
	'					<input type="text" id="qt_phrase" maxlength="4" class="ipt" style="width:50%;" placeholder="请输入验证码"/>',
	'					<span class="phrase-code" style="cursor:pointer">',
    '                		<img title="点击换一张" id="qt_phrasecode" src="//captcha.360.cn/image.php?app=i360&random='+Math.random()+'" alt="验证码" height="35" width="99" style="vertical-align: middle;"/>',
    '                		<a>看不清换一张</a>',
    '           		</span>',
	'				</div>',
	'			</div>',
	'			<div style="margin-bottom:10px;height:20px;">',
    '				<span style="float:left"><label for="qtis_agree"><input type="checkbox" id="qtis_agree" tabindex="5" checked="checked" value="1">已阅读并同意</label><a href="http://i.360.cn/pub/protocol.html" style="margin-left:10px;" target="_blank">360用户服务条款</a></span>',
	'			</div>',
	'			<div class="btn btn-next-one">',
	'				<a id="qt_btn" href="javascript:void(0);">注册</a>',
	'			</div>',
    '           <div style="margin-bottom:10px;height:20px;">',
    '               <span style="float:right"><a href="javascript:void(0)" class="has-account">已有360账号，去登录</a></span>',
    '               <span style="float:right"><a href="javascript:void(0)" class="reg-phone" style="margin-right:10px;">手机号注册</a></span>',
    '           </div>',    
	'		</div>',
	'	</div>'
].join('');

function initEmailReg() {
    $('#logRegWrap').html(regEmailHtml);
    var errTimeout;
    $('#login').attr('class', 'reg');

    QHPass.mShowReg(function(){
		alert("注册成功~");
		location.reload(true);
		/*var destUrl = '';	//自定义跳转地址
        if(destUrl){
            location.replace(destUrl)
        }else{
            location.replace("http://i.360.cn")
        }*/
    },{
        doms:{
            loginEmail:'qt_loginemail',
            password:'qt_password',
            phrase:'qt_phrase',
            isAgree:'qtis_agree',
            globalTips:'qt_global_text',
            phraseImg: 'qt_phrasecode'
        },
        extFun: {
            init: function(){
            //邮箱实时检测
                $("#qt_loginemail").blur(function(){
                    QHPass.regUtils.checkLoginEmail(true);
                });
                //提交
                $("#qt_btn").click(function(){
                    QHPass.regUtils.submit();
                });
                $("#qt_loginemail").on('keydown', function(e){
                    if(e.keyCode == 13) {
                        $('#qt_password').focus();
                    }
                });
                $('#qt_password').on('keydown',function(e) {
                    if(e.keyCode == 13) {
                        $('#qt_phrase').focus();
                    }
                });
                $("#qt_phrase").on('keydown', function(e) {
                    if(e.keyCode == 13) {
                        QHPass.regUtils.submit();
                    }
                });
                //验证码刷新绑定
               $('#modRegWrap .phrase-code').on('click',function() {
                    QHPass.regUtils.setPhrase();
                });
                $('.has-account').on('click',function() {
                    hideReg();
                    initLogin();
                    animRuner($('#logRegWrap'), 'anim-out-s', 'anim-out', 300);
                });
				$('.reg-phone').on('click',function(){
					hideReg();
                    initPhoneReg();
                    animRuner($('#logRegWrap'), 'anim-in-s', 'anim-in', 300);
				});
                $('#modRegWrap').delegate('#qt_global_text .clk-quc-login','click', function(e) {
                    e.preventDefault();
                    var em = $('#modRegWrap .email input').val();
                    hideReg();
                    initLogin(em);
                });
            },
            error:function(data){
                $('#errorTips').css('visibility','visible');
                if(data.type == 'loginEmail' && new RegExp(/立即登录/).test(data.msg)) {
                    if(errTimeout) clearTimeout(errTimeout);
                } else {
                    if(errTimeout) clearTimeout(errTimeout);
                    errTimeout = setTimeout(function(){
                        $('#errorTips').css('visibility','hidden');
                    }, 5000);
                }
                QHPass.regUtils.setPhrase();
            },
            correct:function(data){              
                $('#errorTips').css('visibility','hidden');
            },
			phrase:function(){
            //验证码的控制逻辑
                $("#modRegWrap .phrase").show();
                $('#qt_phrase').focus();
                QHPass.regUtils.setPhrase();
            },
            before: function(){showLoadding(true);},
            loading: function(){},
            after: function(){showLoadding(false);}
        },
        regway:'email',
        postCharset:'utf-8',
        src:'mpw_tcb',
		captFlag:true
    });
}
//----------------------------手机号注册----------------------------
var regPhoneHtml = [
	' <div id="modRegWrap">',
	'		<div id="errorTips"><span id="qt_global_text"></span></div>',
	'		<div class="mod-get-pwd">',
	'			<div class="cleaript">',
	'				<input type="tel" value="" maxlength="11" id="qt_phone_num" class="ipt" placeholder="请输入您的手机号"/>',
	'			</div>',
    '           <div class="cleaript">',
    '               <input type="password" value="" id="qt_password" class="ipt" placeholder="请输入密码"/>',
    '           </div>',    
	'			<div class="phrase">',
	'				<div class="cleaript">',
	'					<input type="number" id="qt_ac" maxlength="6" class="ipt" style="width:64%;" placeholder="请输入验证码"/>',
	'					<span class="qt_btn_gsc">',
	'						<a id="qt_btn_gsc" href="javascript:void(0);">获取验证码</a>',
    '           		</span>',
	'				</div>',
	'			</div>',	
	'			<div style="margin-bottom:10px;height:20px;">',
    '				<span style="float:left"><label for="qtis_agree"><input type="checkbox" id="qtis_agree" tabindex="5" checked="checked" value="1">已阅读并同意</label><a href="http://i.360.cn/pub/protocol.html" style="margin-left:10px;" target="_blank">360用户服务条款</a></span>',
	'			</div>',
	'			<div class="btn btn-next-one">',
	'				<a id="qt_btn" href="javascript:void(0);">注册</a>',
	'			</div>',
    '           <div style="margin-bottom:10px;height:20px;">',    
    '               <span style="float:right"><a href="javascript:void(0)" class="has-account">已有360账号，去登录</a></span>',
    '               <!-- <span style="float:right"><a href="javascript:void(0)" class="reg-email" style="margin-right:10px;">邮箱注册</a></span> -->',
    '           </div>',    
	'		</div>',
	'	</div>'
].join('');

function initPhoneReg() {
    $('#logRegWrap').html(regPhoneHtml);    
    var errTimeout;
    $('#login').attr('class', 'reg');

    QHPass.mShowReg(function(){
        if($.fn.cookie("Q")){
            // 跳转到目标地址
            redirectDestUrl();
        } else {
            alert('注册成功，请登录吧~');
            location.hash = '';
            location.reload(true);
        }
    },{
        /* DOM元素配置,供通用JS进行数据关系对应 */
		doms: {
			phone: "qt_phone_num", //手机号输入框
			password: "qt_password", //密码
			isAgree: "qtis_agree", //是否同意注册协议
			globalTips: "qt_global_text", //全局信息提示层
			smsCode:'qt_ac' //手机号确认码输入表单
		},
		extFun: {
			//初始化,业务方自定义事件处理等
			init: function() {
				var clickFlag = false;
				$("#qt_btn").click(function() {
					QHPass.regUtils.submit()
				});
				$("#qt_btn_gsc").click(function() {
					QHPass.regUtils.getSmsCode(function(data){
						if(data.errno == 0){
							alert("发送成功，请注意查看您的手机短信~");
						}else{
							QHPass.regUtils.showError('smsCode', data.errmsg);
						}
						//校验码错误相关操作
					});
					clickFlag = true;
				});
				$("#qt_ac").blur(function() {
					QHPass.regUtils.checkSmsCode()
				});
				$("#qt_phone_num").blur(function() {
					QHPass.regUtils.checkPhone(!0)
				}).on("keydown",function(e) {
					e.keyCode == 13 && $("#qt_phrase").focus()
				});
				$("#qt_password").on("keydown", function(e) {
					e.keyCode == 13 && QHPass.regUtils.submit()
				});
				$("#modRegWrap .phrase-code").on('click',function() {
					QHPass.regUtils.setPhrase()
				});
				$("#modRegWrap").delegate("#qt_global_text .clk-quc-login", "click",function(e) {
					e.preventDefault();
					var t = $("#modRegWrap .email input").val();
					hideReg()
				})
				$('.has-account').on('click',function() {
                    hideReg();
                    initLogin();
                    document.location.hash = '#login';
                    animRuner($('#logRegWrap'), 'anim-out-s', 'anim-out', 300);
                });
				$('.reg-email').on('click',function(){
					hideReg();
                    initEmailReg();
				});
			},
			//异常显示
			error: function(data) {
				$('#errorTips').css('visibility','visible');
                if(data.type == 'loginEmail' && new RegExp(/立即登录/).test(data.msg)) {
                    if(errTimeout) clearTimeout(errTimeout);
                } else {
                    if(errTimeout) clearTimeout(errTimeout);
                    errTimeout = setTimeout(function(){
                        $('#errorTips').css('visibility','hidden');
                    }, 5000);
                }
                QHPass.regUtils.setPhrase();
			},
			//验证通过隐藏异常
			correct: function(e) {
				$("#errorTips").css("visibility", "hidden")
			},
			before: function() {showLoadding(true);},
			loading: function() {},
			after: function() {showLoadding(false);}
		},
		regway: "phone", //注册方式
		postCharset: "utf-8",
		src: "mpw_tcb"
    });
}


function hideLogin() {$('#modLoginWrap').remove();}
function hideReg(){$('#modRegWrap').remove();}

function getQueryParam(key, url){
    url = url || window.location.href;
    url = url.replace(/^[^?=]*\?/ig, '').split('#')[0]; //去除网址与hash信息
    var json = {};
    //考虑到key中可能有特殊符号如“[].”等，而[]却有是否被编码的可能，所以，牺牲效率以求严谨，就算传了key参数，也是全部解析url。
    url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
        //对url这样不可信的内容进行decode，可能会抛异常，try一下；另外为了得到最合适的结果，这里要分别try
        try {
            key = decodeURIComponent(key);
        } catch(e) {}

        try {
            value = decodeURIComponent(value);
        } catch(e) {}

        if (!(key in json)) {
            json[key] = /\[\]$/.test(key) ? [value] : value; //如果参数名以[]结尾，则当作数组
        }
        else if (json[key] instanceof Array) {
            json[key].push(value);
        }
        else {
            json[key] = [json[key], value];
        }
    });
    return key ? json[key] : json;
}

function animRuner(obj, start, end, time){
    obj = $(obj);
    obj.addClass(start);
    setTimeout(function(){obj.addClass(end); }, 30);

    setTimeout(function(){obj.removeClass(start).removeClass(end); }, time+50);
}

function showLoadding(show){
    if(show){ 
        $('<div class="login-loadding">正在处理中，请稍后...</div>').appendTo('body');
    }else{
        $('.login-loadding').remove();
    }
}

function bindEvent(){
    //登陆页面向左滑动
    $(document).on('swipeLeft', function(){
        if( $('#modRegWrap').length==0 ){
            hideLogin();
            initPhoneReg();
            animRuner($('#logRegWrap'), 'anim-in-s', 'anim-in', 300);
        }
    });
    //注册页面向右滑动
    $(document).on('swipeRight', function(){
        if( $('#modLoginWrap').length==0 ){
            hideReg();
            initLogin();
            animRuner($('#logRegWrap'), 'anim-out-s', 'anim-out', 300);
        }
    });
}
/**
 * 重定向到目标地址
 * @return {[type]} [description]
 */
function redirectDestUrl(){
    var destUrl = getQueryParam('destUrl');   //自定义跳转地址
    if(destUrl){
        location.replace(destUrl)
    }else{
        history.back();
    }
}

// execute callback when the page is ready:
$(function(){
    if (document.location.hash!=='#reg') {
        hideReg();
        initLogin();
        // animRuner($('#logRegWrap'), 'anim-out-s', 'anim-out', 300);
    } else {
        hideLogin();
        initPhoneReg();
        // animRuner($('#logRegWrap'), 'anim-in-s', 'anim-in', 300);
    }
    bindEvent();
});