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
		types: ['quick', 'normal'],  //和 优品不一样，无手机登录
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

	tcb.bindEvent('.topbar', {
		'.user-login' : function(e) {
			e.preventDefault();

            var wMe = W(this);
            var redirect = wMe.attr('data-url');

		    QHPass.when.signIn( redirect? function(){ window.location.href=redirect; } : QHPass.__loginDefaultFun );
		},
		'.user-logout' : function(e) {
			QHPass.signOut( QHPass.__loginDefaultFun );
		},
		'.user-reg' : function(e) {
			e.preventDefault();

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
		}
	});

	var showAuditSuccessPanel = function() {
		var panel = tcb.alert('提示', '<div class="clearfix" style="height:120px"><div class="desc"><p>您好，您的开店申请已经通过审核，请不要重复申请。<br /><br /><a href="'+MER_BASE_INFO.shop_url+'">进入我的店铺</a></p></div></div>',
		    	{
		        	'width' : 410,
		        	'wrapId' : 'panelAuditFail'
		    	}, function() {
		    		panel.hide();
		    	});

		return panel;
	};

	var showAuditWaitPanel = function() {
		//var panel = tcb.alert('审核通知', '<div class="clearfix" style="height:120px"><div class="desc"><p>您的申请已经提交，我们将在10日内完成审核工作。<br /><br />审核结果将发送至您的手机：<span class="phone">' + MER_BASE_INFO.mobile + '</span><br /><a href="http://i.360.cn/security/modifyboundmobile" target="_blank">修改号码</a></p></div></div>',
		var panel = tcb.alert('审核通知', '<div class="clearfix" style="height:120px"><div class="desc"><p>我们正在加紧改进同城帮的网站和机制，商家申请临时停止。申请恢复后，我们将会在网页上公告。感谢您一如既往地关心同城帮。</p></div></div>',
			    {
			        'width' : 410,
			        'wrapId' : 'panelAuditInfo'
			    }, function() {
			    	panel.hide();
			    });

		return panel;
	};

	var showAuditFailPanel = function() {
		var panel = tcb.alert('审核通知', '<div class="clearfix" style="height:120px"><div class="desc"><p>您好，您的开店申请未通过审核，请及时查看并重新申请。</p></div></div>',
		    	{
		        	'width' : 410,
		        	'wrapId' : 'panelAuditFail'
		    	}, function() {
		    		location.href = BASE_ROOT + 'applyshop/';
		    		panel.hide();
		    	});

		return panel;
	};
	//go to top
	(function() {

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

	})();

	tcb.bindEvent('body', {
        //点击申请商家button，提示对应状态
        '.btn-apply-shop' : function(e) {
        	e.preventDefault();

        	var run = function() {
				if(!MER_BASE_INFO.user_type) {
					location.hash = 'applyshop';
					location.reload();
				}

				//普通用户，未申请过商家
				if(MER_BASE_INFO.user_type == 1 && !MER_BASE_INFO.status) {
					location.href = BASE_ROOT+ 'applyshop/';
				}

				//已经是商家
				if(MER_BASE_INFO.user_type == 2) {
					showAuditSuccessPanel();
					return;
				}

				var status = (MER_BASE_INFO.status||'').trim();

				if(status == 'wait') { //等待审核
					showAuditWaitPanel();
				} else if(status == 'unconfirmed') { //未通过
					showAuditFailPanel();
				}
        	};

        	QHPass.when.username( run );
		},
		'.icon-zan511' : function(e){
			e.preventDefault();
			var shopid = W(this).attr('data-shopid')||'';

			QW.Ajax.post('/aj/shop_zan/',{ 'enshopid' : shopid, 'act':'zan'  },function(){});

			DomU.insertCssText('#zan511Panel .panel-content{ background: url(https://p.ssl.qhimg.com/t01775c928c808b230b.png) no-repeat scroll 0 0; position: relative; } #zan511Panel .mobile-box{ position: absolute; width: 276px; height:32px;line-height:32px; left:100px; top:206px;  } #zan511Panel .mobile{width: 256px; height:32px;line-height:32px; padding:0 10px; border:0; background: transparent; position:absolute;} #zan511Panel .mobile-box .ele4phtips{position:absolute; left:0; top:0; margin-left:10px; color:#999;} #zan511Panel .submit{ position: absolute; background: url(https://p.ssl.qhimg.com/t01775c928c808b230b.png) no-repeat scroll 0 -331px; width: 127px; height:39px;  left:184px; top:262px; border:0;cursor: pointer;} #zan511Panel .submit:hover{opacity: :0.8;filter:alpha(opacity=80);} #zan511Panel .submit:active{opacity: :0.9;filter:alpha(opacity=90); }');
			var zanPanel = tcb.panel("企业服务-上门维修", '<form action="/aj/shop_zan/" method="post" class="zan-511-form"><input type="hidden" name="enshopid" value="'+shopid+'"><input type="hidden" name="act" value="mobile"><div class="mobile-box"><input class="mobile" maxlength="11" name="mobile" placeholder="请输入11位常用手机号码"></div><input type="submit" class="submit" value=""></form>', {
				'width' : 493 ,
				'height' : 327 ,
				"withShadow": true,
				"wrapId" : "zan511Panel",
				"className" : "panel panel-tom01 border8-panel pngfix"
			});

			try{
				new PlaceHolder('#zan511Panel .mobile');
			}catch(ex){}

			W('#zan511Panel .mobile').on('keyup', function(e){
				W(this).val( W(this).val().replace(/\D/g, '') );
			});

			W('#zan511Panel .zan-511-form').on('submit', function(e){
				var _form = this;
				e.preventDefault();
				var mo = W('#zan511Panel .mobile');
				if( mo.val().trim().length!=11 ){
					mo.shine4Error().focus();
					return false;
				}

				QW.Ajax.post(_form, function(data){
					data = QW.JSON.parse(data);
					if(data.errno==0){
						alert('提交成功，感谢您的参与');
						zanPanel.hide();
					}else{
						alert('抱歉，出错了。'+data.errmsg);
					}
				});
				return false;
			});
		},
        // 投诉建议
        '.doc-topbar-tousujianyi': function(e){
            e.preventDefault();

            var alert = tcb.alert('投诉建议', '<div style="padding:20px;">您好，如对我们的服务意见或建议，请发邮件至：<a href="mailto:kefu@bang.360.cn">kefu@bang.360.cn</a>（请留下您的订单号及电话，便于工作人员与您联系）详细说明。<br/>温馨提示：您也可以点”在线客服“会有工作人员在线为您服务。（点击在线客服弹出聊天窗口）</div>', {}, function(){alert.hide();});
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
	});

	(function() {
		//首页未登录，点申请后会刷新页面，hash == '#apply'，这时候，帮用户点一下申请按钮
		if(location.hash == '#applyshop') {
			W('.btn-apply-shop').click();
			return;
		}

		var locationHref;
		try {
			locationHref = location.href;
		} catch(e) {
			locationHref = document.createElement( "a" );
			locationHref.href = "";
			locationHref = locationHref.href;
		}

		if(locationHref.indexOf('/applyshop') > -1 && locationHref.indexOf('/applyverify') == -1) {
			/*如果在审核页，判断下审核状态;
			*如果已经是商家或者等待审核中，出对应浮层。
			*/

			//已经是商家
			if(MER_BASE_INFO.user_type == 2) {
				var panel = showAuditSuccessPanel();
				panel.onbeforehide = function() {
					location.href = MER_BASE_INFO.shop_url || '/';
				};
				return;
			}

			var status = (MER_BASE_INFO.status||'').trim();

			if(status == 'wait') { //等待审核
				var panel = showAuditWaitPanel();
				panel.onbeforehide = function() {
					location.href = '/';
				};
			}
		} else {
			/*如果是未审核通过和审核中两种状态，出提示浮层。
			*关闭后记cookie，浏览器关闭前不再出浮层。
			*/
			if(MER_BASE_INFO.user_type == 2 || !MER_BASE_INFO.status) {
				return;
			}

			if(QW.Cookie.get('show_audit_panel')) {
				return;
			}

			if( window.location.href.indexOf('/client')>-1 || window.location.href.indexOf('inclient')>-1 ){ //如果是在客户端里，不出提示
				return;
			}

			var status = (MER_BASE_INFO.status||'').trim(),
				panel;

			if(status == 'wait') { //等待审核
				panel = showAuditWaitPanel();
			} else if(status == 'unconfirmed') { //未通过
				panel = showAuditFailPanel();
			}

			if(panel) {
				panel.onafterhide = function() {
					QW.Cookie.set('show_audit_panel', '1', {'path' : '/'});
				}
			}
		}
	})();

	/**
	 * 顶部搜索框处理
	 * @return {[type]} [description]
	 */
	function topSearchBox(){
		var CAN_DEFAULT_SEARCH = false;  //在点击搜索按钮时，是否允许进行默认填写的关键字的搜索。

		if(W('.tcb-top-search').length > 0){
			W('.tcb-top-search').on('submit', function(e){
				e.preventDefault();
				var keyword = W(this).one('input[name="keyword"]');

				if(!CAN_DEFAULT_SEARCH && ( keyword.val().trim().length == 0 || keyword.val().trim() == keyword.attr('data-default')) ){
					keyword.shine4Error().focus();
					return false;
				}else{
					W(this).submit();
					return true;
				}
			});
		}
	}

	//冻结搜索框完整版
    function fixedTopSubmenu(){
    	if( W('#docSubMenu').length>0 ){

	    	if( W('#docSubMenu-fixed').length==0 ){
	    		W('<div id="docSubMenu-fixed" class="doc-sub-menu-fixed"></div>').prependTo( W('body') );
	    		W('#docSubMenu').cloneNode(true).attr('id','').appendTo( W('#docSubMenu-fixed') );
	    	}

			function autoFixedTopMenu(){
				var tbH = W('#doc-topbar').getSize().height - 0 + W('#doc-menubar').getSize().height;
				var dST = document.documentElement.scrollTop || document.body.scrollTop;
				var dmH = W('#docSubMenu .menu-list').getSize().height;

				W('#docSubMenu-fixed').css('height', dmH);
				if( dST>= tbH ){//显示浮动菜单
					if( W('#docSubMenu-fixed').css('display') == 'none' ){
			            W('#docSubMenu-fixed').show();
			            W('#docSubMenu').css('visibility', 'hidden');
			        }
				}else{//隐藏浮动菜单
					if( W('#docSubMenu-fixed').css('display') != 'none' ){
			            W('#docSubMenu').css('visibility', 'visible');
			            W('#docSubMenu-fixed').hide();
	    			}
				}
			}

			W(window).on('scroll', autoFixedTopMenu);
			W(window).on('load', autoFixedTopMenu);
			W(window).on('resize', autoFixedTopMenu);
		}
    }

	topSearchBox();

	fixedTopSubmenu();
})();

Dom.ready(function() {
	try {
		if(typeof(QIM) !== 'undefined' && QIM && QIM.initialize){
			QIM.initialize();
		}
	} catch(e) {}

    /**
     * topbar选择切换城市
     * @return {[type]} [description]
     */
    function topbarSelectCity(selector){

        var wSelector = W(selector);

        if( !(wSelector &&wSelector.length) ) return false;

        var cityPanel = new CityPanel(selector);

        cityPanel.on('close', function(e) {});

        cityPanel.on('selectCity', function(e) {
            var city_code = e.city.trim(),
                city_id   = e.cityid.trim(),
                city_name = e.name.trim();

            wSelector.siblings('.topbar-city')
                .html(city_name)
                .attr('data-citycode', city_code)
                .attr('data-cityid', city_id);

            // 将选择城市写入cookie

            var request_url = tcb.setUrl('/aj/getcookiecity', {
                'citycode': city_code,
                'cityname': city_name
            });
            QW.loadJsonp(request_url, function(){
                window.location.reload();
            });
        });
    }
    topbarSelectCity(".topbar-citychange-trigger");

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

    tcb.bindEvent(document.body, {
        // 底部加入同城帮
        '.js-btn-join-tcb': function(e){
            e.preventDefault();

            var html_str = W('#JSJoinTCBIntroTpl').html().trim().tmpl()();

            tcb.panel('加盟同城帮', html_str, {
                className: 'join-tcb-wrap-panel panel-tom01'
            });
        },
		// 新闻采访/跨界合作
		'.js-btn-interview': function(e){
			e.preventDefault();

			tcb.panel('新闻采访/跨界合作', '新闻采访/跨界合作及其他方面的商务合作，请将相关信息及联系人发到hanjuntao@bang.360.cn，我们会在三个工作日内与您联系，期待与您的合作！', {
				className: 'interview-wrap-panel panel-tom01'
			});
		},
		// 二手竞拍平台合作
		'.js-btn-b2b': function (e) {
			e.preventDefault()

			tcb.panel('同城帮B2B商家竞拍平台', '<p>同城帮B2B商家竞拍平台致力于为商家提供优质的二手机货源点击链接入驻，开启财富之旅<a href="http://business.bang.360.cn/" target="_blank">http://business.bang.360.cn/</a></p><p>关注【同城帮B2B平台】公众号实时了解平台动向，详询：13301122005（微信同号）</p><p style="text-align: center;"><img src="https://p1.ssl.qhimg.com/t015bef0a0cf9a3e2b4.png" alt=""></p>', {
				className: 'b2b-wrap-panel panel-tom01'
			})
		}
    })

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

function showShopGrade( grade ){
    var icon = Math.min(Math.ceil(grade/5), 4);
    var icon_num = (grade-1)%5 + 1;
    var str = '';
    for(var i=0; i<icon_num; i++){
        str +='<span class="icon icon-dj icon-dj-'+icon+'"></span>';
    }
    return str;
}
