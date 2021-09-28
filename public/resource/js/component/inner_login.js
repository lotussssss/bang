var InnerLogin = InnerLogin || (function(){
	var boxWrap, loginWrap, regWrap, callback;
	/**
	 * 检测是否显示登录注册
	 * @param  {[type]}   boxwrap   [description]
	 * @param  {[type]}   loginwrap [description]
	 * @param  {[type]}   regwrap   [description]
	 * @param  {Function} cb        { initCallback，hasLogin,loginSucc,regSucc }
	 * @return {[type]}             [description]
	 */
	function show(boxwrap, loginwrap, regwrap, cb, forceLogin){
		boxWrap=boxwrap;
		loginWrap = loginwrap;
		regWrap = regwrap;
		callback = cb;

		if( !QW.Cookie.get('Q') || forceLogin ){//未登录或需要强制登陆
			if( W('#'+boxWrap).css('display')=='none' ){
				W('#'+boxWrap).show();
			}

			hideTopLogin();
			showSwipTab();
			showLoginForm();
			showRegForm();

			setTimeout(fillTelNum, 800);

			callback && callback.initCallback && callback.initCallback();

		}else{
			callback && callback.hasLogin && callback.hasLogin();
		}
	}

	/**
	 * 处理顶部登录条事件，否则会出现冲突
	 * @return {[type]} [description]
	 */
	function hideTopLogin(){
		W('#doc-topbar').one('.user-login').replaceClass('user-login', 'user-login-inner').on('click', function(e){
			e.preventDefault();
			W('#'+boxWrap).query('.user-cer-tab li').item(0).fire('click');

			W('#'+boxWrap)[0].scrollIntoView();
		});

		W('#doc-topbar').one('.user-reg').replaceClass('user-reg', 'user-reg-inner').on('click', function(e){
			e.preventDefault();
			W('#'+boxWrap).query('.user-cer-tab li').item(1).fire('click');

			W('#'+boxWrap)[0].scrollIntoView();
		});
	}

	function showSwipTab(){
		var box = W('#'+boxWrap);
		box.addClass('ui-inner-login');
		var tab = W('<ul class="user-cer-tab"><li data-rel="login">登录</li><li data-rel="reg" class="">注册</li></ul>').prependTo( box );
		W('<p class="login-tip">用您的手机号登录或注册，查看并评价您的订单</p>').prependTo( box );
		DomU.insertCssText('.ui-inner-login{width:480px;margin:10px auto;}.ui-inner-login .placeholder{text-indent:-9999px}.ui-inner-login .login-tip{color:#f00;padding:10px;}.ui-inner-login .user-cer-tab{width:480px;margin-bottom: 5px;font-size:14px;height:40px;line-height:40px;border-bottom:2px solid #CCCCCC;}.ui-inner-login .user-cer-tab li{width:50%;float:left;text-align:center;cursor:pointer;}.ui-inner-login .user-cer-tab .on{border-bottom:2px solid #27A827;position:relative;margin-bottom:-2px;z-index:10;color:#27A827;font-weight:bold;cursor:default;} .ui-inner-login .mod-qiuser-pop .tips-msg{left:0;display:inline-block;vertical-align:middle;width:140px;}');

		W('#'+loginWrap).addClass('user-res-box').attr('data-for', 'login');
		W('#'+regWrap).addClass('user-res-box').attr('data-for', 'reg');

		tab.delegate('li', 'click', function(){
			if(W(this).hasClass('on')){
				return;
			}else{
				W(this).addClass('on').siblings('.on').removeClass('on');
				var rel = W(this).attr('data-rel');
				box.query('.user-res-box').hide();
				box.query('.user-res-box[data-for="'+rel+'"]').show();				
			}
		});

		//显示登录
		tab.query('li').item(0).fire('click');
	}

	function showLoginForm(){
		QHPass.setConfig("signIn", {
			types: [ 'normal']
	    });		

		QHPass.events.one('afterShow.signIn', function(){
			W('.quc-mod-sign-in .quc-field-third-part').removeNode();
			W('.quc-mod-sign-in .quc-footer').removeNode();
		});

		QHPass.signIn( document.getElementById(loginWrap),  function(){ userCertifyDone('login') });
	}

	function showRegForm(){

		QHPass.events.one('afterShow.signUp', function(){
			W('.quc-mod-sign-up .quc-left-bar').removeNode();
			W('.quc-mod-sign-up .quc-login').removeNode();
			W('#'+regWrap).find('.quc-mod-sign-up .quc-main').css({'border-left':0, 'box-shadow':'none'});
		});


		QHPass.signUp( document.getElementById(regWrap),  function(){ userCertifyDone('reg') });
	}

	//将第一步中的电话自动填写到后面
	function fillTelNum(){
		var tel = QW.Cookie.get('otel')||'';
		var box = W('#'+boxWrap);
		box.one('#loginAccount').val(tel).focus();
		box.one('#lpassword').val('').focus();
		box.one('#phoneReg').val(tel);
	}

	//登录、注册成功处理
	function userCertifyDone(type){
		if(type =='login'){
			callback && callback.loginSucc && callback.loginSucc();
		}else{
			callback && callback.regSucc && callback.regSucc();
		}
	}

    return{
    	'show' : show
    }
})();