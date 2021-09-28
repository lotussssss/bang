(function() {
	//qwrap116中无bind方法，这个原来是在passport的js中的，需要补上
    NodeW.prototype.bind=NodeW.prototype.on;

    function customPassport (){
        //ie6主页面设置了domain之后，表单往iframe提交，需要修改iframe的domain与主页面一致
        if(QW.Browser.ie6) {
            setTimeout(function() {
                try {
                    if(W('.quc-ie6-iframe').length) {
                        var ifr = W('.quc-ie6-iframe')[0];
                        ifr.src = "javascript:void(function(d){d.open();d.domain='360.cn';d.close();}(document));"
                    }
                } catch(e){}
            }, 10);
        }

    }

    //注册
    QHPass.init('pcw_tcb');

    //登录配置
    QHPass.setConfig("signIn", {
        types: ['quick', 'mobile', 'normal'],
        panelTitle: '欢迎登录360同城帮'
    });

    //注册配置
    QHPass.setConfig("signUp", {
        panelTitle : "欢迎注册360同城帮",
        hideUsername : true,
        hideNickname : true,
        hidePasswordAgain : true
    });

    //处理IE6、重绘结构等
    QHPass.events.one('afterShow.signUp  afterShow.signIn', customPassport);

    //登录、注册后默认处理
    QHPass.__loginDefaultFun = function(){ setTimeout(function(){ window.location.reload(true); }, 300) };

    tcb.bindEvent(document.body, {
        // 登陆
        '.js-user-login' : function(e) {
            e.preventDefault();

            QHPass.when.signIn( QHPass.__loginDefaultFun );
        },
        // 退出
        '.js-user-logout' : function(e) {
            e.preventDefault();

            QHPass.signOut( QHPass.__loginDefaultFun );
        },
        // 注册
        '.js-user-reg' : function(e) {
            e.preventDefault();

            QHPass.signUp( QHPass.__loginDefaultFun );
        },
        // 手机号查询订单
        '.js-mobile-check-order': function(e){
            e.preventDefault();

            var tmpl_fn  = W('#JsMobileCheckOrderPanelTpl').html().trim().tmpl(),
                tmpl_str = tmpl_fn();
            window.wMobileCheckOrderPanel = tcb.panel('', tmpl_str, {
                'className': 'user-mobile-check-order-panel-wrap panel-tom01'
            })

            // 登录表单相关功能
            window.Bang.LoginFormByMobile({
                form_action: '/youpin/aj_my_login',
                selector_form: W('#MobileCheckOrderForm'),
                selector_get_secode: '.user-mobile-check-order-panel-getsecode',
                selector_vcode_img: '.vcode-img',
                class_get_secode_disabled: 'user-mobile-check-order-panel-getsecode-disabled'
            }, function(res){
                window.location.href = tcb.setUrl('/liangpin_my/order_list', {"from": tcb.queryUrl(location.href,'from')});
            })

        },
        // 退出手机号查询状态
        '.js-mobile-user-logout': function(e){
            e.preventDefault();

            QW.Ajax.get('/youpin/aj_my_logout', function(res){
                res = JSON.parse(res);

                if (!res['errno']) {
                    window.location.reload();
                }
            });
        },
        // 查询订单登陆框中激活登陆
        '.user-mobile-check-order-panel .user-login': function(e){
            e.preventDefault();

            if (window.wMobileCheckOrderPanel) {
                window.wMobileCheckOrderPanel.hide();
            }
            QHPass.when.signIn(function(){
                window.location.href = '/liangpin_my/order_list';
            });
        },
        '.user-mobile-check-order-panel .user-reg': function(e){
            e.preventDefault();

            if (window.wMobileCheckOrderPanel) {
                window.wMobileCheckOrderPanel.hide();
            }
            QHPass.signUp( QHPass.__loginDefaultFun );
        },
        '.has-sub' : {
            'mouseenter' : function() {
                var me = W(this);
                me.addClass('hover');
                if(QW.Browser.ie6){
                    me.query('.sub').css('width',me.getSize().width-2);
                }
            },
            'mouseleave' : function() {
                W(this).removeClass('hover');
            }
        },
        // 显示“我的订单”入口qrcode
        '.js-myorder-enter-qrcode-trigger': function(e){
            e.preventDefault();

            var html_fn  = W('#JsMyorderEnterQrcodeTpl').html().trim().tmpl(),
                html_str = html_fn({});

            tcb.panel('', html_str, {
                'className': 'panel-tom01 myorder-enter-qrcode-wrap'
            });
        }
    })

	//go to top
	!function() {

	    var width = document.body.clientWidth||document.documentElement.clientWidth;
	    if(width-960>0){
			var o = {
				headH: 50,
				right:10,
				bottom: 42
			};
			tcb.gotoTop.init(o);
		}

		W(window).on('resize', function(){

			var _width = document.body.clientWidth||document.documentElement.clientWidth;
			if(_width>1000){
				W('.returnToTop').show();
				W('.returnToTop a').css({'right':10});
			}else{
				W('.returnToTop').hide();
			}
		});

	}()

})();

Dom.ready(function() {
	try {
		if(typeof(QIM) !== 'undefined' && QIM && QIM.initialize){
			QIM.initialize();
		}
	} catch(e) {}

    // 处理右边浮层广告在小窗口中的显示效果
    function floatCardFixed(){
        var wFloatWrap2 = W('.js-float-card-fixed');
        if ( !(wFloatWrap2 && wFloatWrap2.length) ) {
            return ;
        }

        function setFloatCardFixed(e){
            var client_x = 0;
            if (window.innerWidth){
                client_x = window.innerWidth;
            }
            else if ((document.body) && (document.body.clientWidth)){
                client_x = document.body.clientWidth;
            }
            var wRightService = wFloatWrap2.query('.right-service');
            if (wRightService && wRightService.length) {
                var wRightService_width = wRightService.getRect()['width'];

                if (client_x<(1200+wRightService_width*2+2)){
                    wRightService.css({
                        'position': 'fixed',
                        'right': '1px'
                    });
                }else {
                    wRightService.css({
                        'position': '',
                        'right': ''
                    });
                }
            }
        }

        W(window).on('load', setFloatCardFixed);
        W(window).on('resize', setFloatCardFixed);
        setTimeout(setFloatCardFixed, 2000)
    }
    floatCardFixed();

    function loadSobotZhiChi(){
        if (window.NONE_ONLINE_SERVICE){
            return
        }
        setTimeout (function () {
            var
                protocol = 'https://',
                s = document.createElement ('script'),
                b = document.getElementsByTagName ('body')[0]

            s.type = 'text/javascript'
            s.async = true
            s.id = 'zhichiload'
            s.className = 'right-service-btn'
            s.src = protocol + 'www.sobot.com/chat/pc/pc.min.js?sysNum=741e6f02f6794194967e733576170632'

            b.appendChild (s)
        }, 0)
        tcb.bindEvent(document.body, {
            '.right-service-btn': function(e){
                e.preventDefault()
            }
        })
    }
    loadSobotZhiChi()
});
