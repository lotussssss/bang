var ComServiceYuyue = ComServiceYuyue || (function(){
	var orderUrl = BASE_ROOT + "my_center/yuyueorder" + ( typeof(_inclient)!='undefined' && _inclient ? '?inclient=1' : '' );

	function show(shopid, productid){
		var str = W('#comServiceYuyueTpl').html() || '';
		tcb.panel("企业服务预约", str, {
			'width' : 600 ,
			'height' : 488 ,
			"withShadow": true,			
			"wrapId" : "comServicePanel",
			"className" : "panel panel-tom01 border8-panel pngfix"	
		});

		new PlaceHolder('#csrRequire');
		new PlaceHolder('#csrAddr');
		new PlaceHolder('#csrTel');	

		fillPrdId(shopid, productid);

		initAddrComp();

		checkResForms();

		bindEvent();	
	}

	function fillPrdId(shopid, productid){
		W('#comServicePanel .shop-id').val(shopid);
		W('#comServicePanel .product-id').val(productid);
	}

	function bindEvent(){
		W('#comServicePanel').delegate('.user-cer-tab li', 'click', function(){
			if(W(this).hasClass('on')){
				return;
			}else{
				W(this).addClass('on').siblings('.on').removeClass('on');
				var rel = W(this).attr('data-rel');
				W('.user-certify .user-res-box').hide();
				W('.user-certify .user-res-box[data-for="'+rel+'"]').show();				
			}
		});

		W('#comServicePanel .com-srv-yy-form').on('submit', function(e){
			e.preventDefault();
			checkFormAndSubmit( W(this) );
		});

		W('#comServicePanel').delegate('.btn-submit', 'click', function(e){
			e.preventDefault();
			checkFormAndSubmit( W('#comServicePanel .com-srv-yy-form') );
		});
		

		//选中登陆模式
		W('#comServicePanel .user-cer-tab li').item(0).fire('click');
	}

	/**
	 * 检测是否显示登陆注册
	 * @return {[type]} [description]
	 */
	function checkResForms(){
		if( !QW.Cookie.get('Q') ){//未登录
			showLoginForm();
			showRegForm();
			W('#comServicePanel .ok-tip3').hide();
		}else{			

			W('#comServicePanel .ok-tip3').show().html( '<a href="'+orderUrl+'">点击查看我的订单</a>' );
			W('#comServicePanel .user-certify').hide();
			W('#comServicePanel .ok-tip2').hide();			
		}
	}

	function showLoginForm(){

		QHPass.setConfig("signIn", {
			types: [ 'normal']
	    });		

		QHPass.events.one('afterShow.signIn', function(){
			W('.quc-mod-sign-in .quc-field-third-part').removeNode();
			W('.quc-mod-sign-in .quc-footer').removeNode();
			customPassport();
		});

		QHPass.signIn( document.getElementById('yyLoginWrap'),  function(){ userCertifyDone('login') });

	}

	function showRegForm(){

		QHPass.events.one('afterShow.signUp', function(){
			W('.quc-mod-sign-up .quc-left-bar').removeNode();
			W('.quc-mod-sign-up .quc-login').removeNode();
			W('#'+regWrap).find('.quc-mod-sign-up .quc-main').css({'border-left':0, 'box-shadow':'none'});
			customPassport();
		});


		QHPass.signUp( document.getElementById('yyRegWrap'),  function(){ userCertifyDone('reg') });

	}

	/**
	 * 用户登录、注册成功后的处理
	 * @return {[type]} [description]
	 */
	function userCertifyDone(stype){
		alert( (stype=='login'? '登录':'注册') + '成功，浏览器将跳转到您的订单页。');
		window.location.href = orderUrl;
	}

	//初始化地址选择器
	function initAddrComp(){
		// 激活面板选择
        new bang.AreaSelect({
        	'wrap': '#yyCitySelector',
        	'hasquan' : false,
        	//when initial, set the default addr.
        	'data':{
	        	'areacode': window.location.search.queryUrl('area_id')||'',
	            'areaname': window.location.search.queryUrl('areaname')||''
            },
        	// 城市选择时触发
	        'onCitySelect': function(data){
	        	 W('#comServicePanel .com-srv-yy-form .user-city').val(data.cityname);
	        	 W('#comServicePanel .com-srv-yy-form .user-quxian').val('');
	        },
	        // 区县选择时触发
	        'onAreaSelect': function(data){
	        	W('#comServicePanel .com-srv-yy-form .user-city').val(data.cityname);
        		W('#comServicePanel .com-srv-yy-form .user-quxian').val(data.areaname);
	        },
	        // 商圈选择时触发
	        'onQuanSelect': function(data){

	        }
        }); 
	}

	/**
	 * 验证表单并提交
	 * @param  {w} F form
	 * @return {[type]}   [description]
	 */
	function checkFormAndSubmit(F){
		var fls = F.query('textarea, input[type="text"]');
		for(var i=0, n=fls.length; i<n; i++){
			var item = fls.item(i);
			if( item.val().trim()=='' ){
				item.focus();
				item.shine4Error();
				return false;
			}
		}

		var tel = F.one('#csrTel');
		if( ! /^1\d{10}$/.test( tel.val().trim() ) ){
			tel.focus();
			tel.shine4Error();
			return false;
		}

		QW.Ajax.post(F.attr('action'), F[0], function(res){
			var data = JSON.parse(res);
			if(data.errno){
				alert('抱歉，出错了。'+data.errmsg);
			}else{//提交成功
				goNextStep();
			}
		});
	}

	/**
	 * 进行下一步
	 * @return {[type]} [description]
	 */
	function goNextStep(){
		W('#comServicePanel .yuyue-step-1').fadeOut(300, function(){
			W('#comServicePanel .yuyue-step-2').fadeIn(300);
		});
		
		setTimeout( fillTelNum, 500);
	}

	//将第一步中的电话自动填写到后面
	function fillTelNum(){
		var tel = W('#csrTel').val();
		W('#yyLoginWrap #loginAccount').val(tel).focus();
		W('#yyRegWrap #phoneReg').val(tel);
	}

	//解决IE6提交问题和重复输入密码问题
    function customPassport(){
            //ie6主页面设置了domain之后，表单往iframe提交，需要修改iframe的domain与主页面一致
            if(QW.Browser.ie6) {
                setTimeout(function() {
                    try {
                        if(W('#comServicePanel .mod-qiuser-pop iframe').length) {
                            var ifr = W('#comServicePanel .mod-qiuser-pop iframe')[0];
                            ifr.src = "javascript:void(function(d){d.open();d.domain='360.cn';d.close();}(document));"
                        }
                    } catch(e){}
                }, 10);
            }
    }

	return { 
		show : show,
		goNextStep : goNextStep 
	}
})();