;/**import from `/resource/js/component/countdown.js` **/
// 倒计时
(function(){
    var Bang = window.Bang = window.Bang || {};

    Bang.countdown_desc = '剩余';
    Bang.startCountdown = startCountdown;

    /**
     * 拍卖倒计时（开始或者结束）
     * @param targettime 倒计时结束的目标时间（时间戳）
     * @param curtime 当前时间（时间戳）（会随着倒计时变化）
     * @param $target
     */
    function startCountdown(targettime, curtime, $target, callbacks){
        if(!targettime || !curtime || curtime>targettime){
            return ;
        }
        callbacks = callbacks || {};

        var duration = Math.floor( (targettime - curtime)/1000 ),// 时间间隔，精确到秒，用来计算倒计时
            client_duration = getClientDuration(targettime); // 当前客户端和结束时间的时间差（用来作为参考点修正倒计时误差）

        var fn_countdown = W('#JsCountdownTpl').html().trim().tmpl();

        // 倒计时ing
        typeof callbacks.start === 'function' && callbacks.start();

        function countdown(){
            if ( !($target&&$target.length) ) {
                return false
            }
            var d = Math.floor(duration/86400), // 天
                h = Math.floor((duration-d*86400)/3600), // 小时
                m = Math.floor((duration-d*86400-h*3600)/60), // 分钟
                s = duration - d*86400 - h*3600 - m*60; // 秒

            var desc_before = $target.attr('data-descbefore')||Bang.countdown_desc||'', // 前置文字说明
                desc_behind = $target.attr('data-descbehind')||'', // 后置文字说明
                day_txt    = $target.attr('data-daytxt') || '天 ',
                hour_txt   = $target.attr('data-hourtxt') || ':',
                minute_txt = $target.attr('data-minutetxt') || ':',
                second_txt = $target.attr('data-secondtxt') || '',
                hour_mode = !!$target.attr('data-hour-mode') // 小时模式

            if (hour_mode) {
                h = d * 24 + h
                d = 0
            }

            var html_str = fn_countdown({
                'day': d,
                'day_txt': day_txt,
                'hour': fix2Length(h),
                'hour_txt': hour_txt,
                'minute': fix2Length(m),
                'minute_txt': minute_txt,
                'second': fix2Length(s),
                'second_txt': second_txt,
                'desc_before': desc_before,
                'desc_behind': desc_behind
            });
            $target.html(html_str);

            // 倒计时ing
            typeof callbacks.process === 'function' && callbacks.process(curtime);

            duration = duration - 1;
            client_duration = client_duration - 1000;
            curtime = curtime - 1000;

            //duration = duration<1 ? 0 : duration;
            return true;
        }
        countdown();
        setTimeout(function(){
            var flag = countdown();
            if (!flag) {
                return ;
            }
            if(duration>-1){
                var next_time = getClientDuration(targettime) - client_duration;
                if (next_time<0) {
                    next_time = 0;
                }
                setTimeout(arguments.callee, next_time);
            } else {
                // 倒计时结束
                typeof callbacks.end === 'function' && callbacks.end();
            }
        }, 1000);
    }
    /**
     * 修复为2个字符长度，长度不足以前置0补齐;
     * @return {[type]} [description]
     */
    function fix2Length(str){
        str = str.toString();
        return str.length < 2 ? '0' + str : str;
    }
    /**
     * 获取当前客户端时间相对结束时间的时间间隔（精确到毫秒）
     * @returns {*|number}
     */
    function getClientDuration(targettime){
        return targettime - (new Date()).getTime();
    }

}());

;/**import from `/resource/js/component/tuiguang_slide.js` **/
!function(){
    var Bang = window.Bang = window.Bang || {};

    Bang.TuiguangSlide = TuiguangSlide

    /**
     * 推广slide类
     * 使用 new TuiguangSlide('.slide-box');
     * @param {selector} box  [description]
     * @param {[type]} conf [description]
     */
    function TuiguangSlide(box, conf){
        var me = this;

        this.meBox = W(box);
        // 找不到需要处理的容器，直接返回
        if(!this.meBox.length){
            return ;
        }
        this.config = conf || {};
        this.btnPrev = this.meBox.query('.slide-go-left');
        this.btnNext = this.meBox.query('.slide-go-right');
        this.innerBox = this.meBox.query('.slide-inner');
        this.items = this.meBox.query('.slide-item');
        this.listBox = this.meBox.query('.slide-list');
        this.itemNum = this.meBox.query('.slide-item').length;
        this.ctrlBox = this.meBox.query('.slide-ctrl');
        this.innerBoxWidth = this.innerBox.getRect().width;

        this.autoRunTimer = null;

        this.init = function(){
            var me = this;

            var wItems = me.items;
            if (wItems && wItems.length) {
                me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

                me.listBox.css({'width' : me.itemWidth * wItems.length});

                if(me.config.showCtrl){ me.createCtrl(); }

                if(me.config.autoRun){ me.autoRun( ); }
            }

            this.bindEvent();
        };
        this.resetBoxSize = function(){
            var me = this;
            me.items = me.meBox.query('.slide-item');
            var wItems = me.items;

            if (wItems && wItems.length) {
                me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

                me.listBox.css({'width' : me.itemWidth * wItems.length});

                if(me.config.showCtrl){ me.createCtrl(); }

                if(me.config.autoRun){ me.autoRun( ); }
            }

        };
        this.bindEvent = function(){

            var me = this;
            var config = this.config;

            me.btnPrev.on('click', function(e){
                e.preventDefault();
                var wMe = W(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft - me.innerBoxWidth }, config.animTime||300, function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                }, QW.Easing.easeOut);
            });
            me.btnNext.on('click', function(e){
                e.preventDefault();
                var wMe = W(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft + me.innerBoxWidth }, config.animTime||300, function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                }, QW.Easing.easeOut);
            });

            me.meBox.delegate('.ctrl-item', 'click', function(e) {
                e.preventDefault();
                W(this).addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                var sn = W(this).attr('data-sn') || 0;
                me.go(sn);
            });

            me.meBox.on('mouseenter', function(e){

                clearInterval(me.autoRunTimer);
            });
            me.meBox.on('mouseleave', function(e){
                if(config.autoRun){ me.autoRun(); }
            });
        };

        this.go = function(step){
            var config = this.config;
            step = step || 0;
            this.innerBox.animate({'scrollLeft' : 0 + this.innerBoxWidth*step }, config.animTime||300, function(){}, QW.Easing.easeOut);
        };

        this.autoRun = function(){
            var me = this;
            var config = this.config;

            me.autoRunTimer = setInterval(function(){
                var currSn = me.meBox.query('.ctrl-curr').attr('data-sn')|| 0,
                    nextSn = currSn - 0 + 1;
                if( nextSn > me.itemNum-1 ){
                    nextSn = 0;
                }
                me.meBox.query('.ctrl-item[data-sn="'+nextSn+'"]').addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                me.go(nextSn);
            }, typeof(config.autoRun)=='number'? config.autoRun : 5000);
        };

        this.createCtrl = function(e){

            if(this.ctrlBox.query('.ctrl-item').length||this.items.length<2){
                return ;
            }

            str = '';
            for(var i=0, n=this.items.length; i<n; i++){
                str += '<span class="ctrl-item '+(i==0?'ctrl-curr':'')+'" data-sn="'+i+'"></span>';
            }
            this.ctrlBox.html(str);
        };

        this.init();
    }
}()


;/**import from `/resource/js/component/block_promoting/block_promoting_lp_flash_product_list.js` **/
Dom.ready(function(){
    var wBlock=  W('.block-promoting-lp-flash-product-list')
    if (!(wBlock&& wBlock.length)){
        return
    }

    var HotProductListSlide = new window.Bang.TuiguangSlide(wBlock.query('.tg-small'), { animTime : 500 })

    // 输出商品
    function renderHotProductList(){

        var wListInner = wBlock.query('#HotProductList')
        if(wListInner && wListInner.length){

            getData4HotProductList(function(result){

                var list_arr;
                var curtime = result['time'],
                    flash_list   = result['flash_list'],   // 闪购
                    jingpin_list = result['jingpin_list']; // 精品

                if ( !(flash_list && jingpin_list && flash_list.length + jingpin_list.length>3) ){
                    // 限时抢 和 精品商品总数不大于3个，那么左右滑动按钮不可点

                    var
                        $Wrap = wListInner.ancestorNode('.tg-small')
                    $Wrap.query('.slide-go-left').addClass('disabled')
                    $Wrap.query('.slide-go-right').addClass('disabled')
                }

                // 闪购
                if(flash_list && flash_list.length) {
                    _forHotFlash(flash_list, curtime, wListInner);
                    if(flash_list.length<4 && jingpin_list && jingpin_list.length){
                        _forHotJingpin(jingpin_list, wListInner, true);
                    }
                }
                // 精品
                else if (jingpin_list && jingpin_list.length) {
                    _forHotJingpin(jingpin_list, wListInner);
                }

            });

        }
    }
    // 精品
    function _forHotJingpin(jingpin_list, wListInner, flag){
        var list_arr = jingpin_list;

        var html_str = W('#JsHotProductListTpl').html().trim().tmpl()({
            'list': list_arr
        });

        if(flag){
            wListInner.insertAdjacentHTML('beforeend', html_str);
        } else {
            wListInner.html(html_str);
        }

        HotProductListSlide.resetBoxSize()
    }
    // 限时抢
    function _forHotFlash(flash_list, curtime, wListInner){
        var list_arr = flash_list;
        var html_str = W('#JsFlashProductListTpl').html().trim().tmpl()({
            'list': list_arr
        });

        wListInner.html(html_str);

        HotProductListSlide.resetBoxSize();

        // 服务器当前时间(精确到毫秒)
        curtime = Date.parse(curtime.replace(/-/g, '/')) || (new Date()).getTime();
        // 遍历倒计时
        wListInner.query('.countdown').forEach(function(el, i){
            var wEl = W(el),
                curproduct = list_arr[i], // 和当前计时器对应的商品信息
                starttime = curproduct['flash_start_time'].replace(/-/g, '/'),//'2015-11-09 18:00:40',//
                endtime   = curproduct['flash_end_time'].replace(/-/g, '/');//'2015-11-09 16:22:40';//
            starttime = Date.parse(starttime) || 0;
            endtime   = Date.parse(endtime) || 0;
            var $skill = $(el).parent().find(".seckill");

            // 开始前倒计时
            if (!curproduct['flash_saling'] && curtime<starttime) {
                wEl.addClass('countdown-start-prev')
                    .attr('data-descbefore', '距开始')

                Bang.startCountdown(starttime, curtime, wEl, {
                    'end': function(){
                        wEl.ancestorNode('.slide-item').query('.p-buy-disabled').removeClass('p-buy-disabled').html('立即抢购');

                        wEl.removeClass('countdown-start-prev')
                            .attr('data-descbefore', ' ')
                        Bang.startCountdown(endtime, starttime, wEl, {
                            'end': function(){
                                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                                wEl.html('已售出').addClass('countdown-end-next');
                                $skill.hide();
                            }
                        });
                    }
                });

            }
            // 抢购进行中&商品未被拍下
            else if (curproduct['flash_saling']==1 && curproduct['flash_status']=='saling' && curtime<endtime) {

                wEl.removeClass('countdown-start-prev')
                    .attr('data-descbefore', ' ')
                Bang.startCountdown(endtime, curtime, wEl, {
                    'end': function(){
                        wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');
                        wEl.html('已售出').addClass('countdown-end-next');
                        $skill.hide();
                    }
                });

            }
            else {
                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                wEl.html('已售出').addClass('countdown-end-next');
                $skill.hide();
            }

        })
    }
    // 获取商品数据
    function getData4HotProductList(callback){
        var request_url = '/youpin/doGetFlashSaleGoods',
            request_params = {};
        QW.Ajax.get(request_url, request_params, function(res){
            var result = [];
            res = JSON.parse(res);
            if (!res['errno']) {
                result = res['result'];
            }

            typeof callback==='function' && callback(result);
        })
    }
    renderHotProductList();

    tcb.bindEvent(wBlock[0], {
        // 秒杀商品
        '#HotProductList .slide-item': {
            'click': function (e) {
                var wMe = W(this),
                    wTarget = W(e.target);

                if (!(wTarget.ancestorNode('a').length || wTarget[0].nodeName.toLowerCase() == 'a')) {
                    wMe.query('.slide-img a').click();
                }
            },
            'mouseenter': function (e) {
                var
                    wMe = W(this)

                wMe.addClass('slide-item-hover')

            },
            'mouseleave': function (e) {
                var
                    wMe = W(this)

                wMe.removeClass('slide-item-hover')

            }
        },
        // 商品列表
        '.product-list .p-item': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('p-item-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.removeClass('p-item-hover');
            }
        }
    })
})

;/**import from `/resource/js/component/block_promoting/block_promoting_lp_hot_notice_faker.js` **/
Dom.ready(function(){
    var wBlock=  W('.block-promoting-lp-hot-notice-faker')
    if (!(wBlock&& wBlock.length)){
        return
    }

    wBlock.show()

    var wInner = wBlock.query('.block-promoting-lp-hot-notice-faker-inner')

    function __show(){
        wInner.animate({
            'top': '-340px'
        }, 500)
    }

    function __close(){
        wInner.animate({
            'top': '0'
        }, 500, function(){

            wBlock.removeNode()
        })
    }

    __show()

    tcb.bindEvent(wBlock[0], {
        '.btn-close': function(e){
            e.preventDefault()

            __close()
        },
        '.item-figure': {
            'mouseenter': function(e){
                var wMe = W(this)

                wMe.css({
                    'background-size': '120%'
                })
            },
            'mouseleave': function(e){
                var wMe = W(this)

                wMe.css({
                    'background-size': '100%'
                })
            }
        }
    })

})

;/**import from `/resource/js/component/citypanel.js` **/
(function() {
	function CityPanel() {
		this.init.apply(this, arguments);
	};

	CityPanel.prototype = (function() {
		return {
			init : function(trigger) {
				var instance = this;
				CustEvent.createEvents(this);

                if(!CityPanel.prototype._documentBind){
                	W(window).on('resize', function(e){
                		//窗口大小变化时重新触发
                		if(instance.container.css('display')!="none"){
	                		setTimeout(function(){
	                			try{ W(trigger).fire('click'); }catch(ex){}
	                		}, 100);
                		}
                	});
                    W(document).on('keydown', function(e) {
                        if(e.keyCode == 27) {
                            instance.container.hide();
                            instance.fire('close');
                        }
                    }).on('click', function(e) {
                            var flag = false;
                            CityPanel.prototype._triggerList.forEach(function(tri){
                                tri.forEach(function(el) {
                                    var trigger = W(el);

                                    if(trigger[0] == e.target || trigger.contains(e.target)) {
                                        flag = true;
                                    }
                                });
                            });

                            if( !flag && (!instance.container[0] == e.target || !instance.container.contains(e.target)) ) {

                                instance.container.fadeOut(150);
                                instance.fire('close');
                            }
                        });
                    CityPanel.prototype._documentBind = true;
                }

				this.container = W('#city_list')
					.delegate('.close', 'click', function(e) {
							e.preventDefault();

							instance.container.hide();
							instance.fire('close');
						})
					.delegate('.filter_bar a', 'click', function(e) {
							e.preventDefault();

							var el = W(this),
								letter = el.html().trim();

							if(el.hasClass('current')) return;

							instance.container.query('.filter_bar a').removeClass('current');
							instance.container.query('.city_wrap p').hide();
							el.addClass('current');
							instance.container.query('.city_wrap p.' + letter).show();
						});

				this.trigger = W(trigger).click(function(e) {
                    e.preventDefault();

                    var pos = W(this).getRect();
                    //是否关闭一直出现
                    if(W(this).attr('data-close')=='hide'){
                        W('#city_list .city_close').hide();
                    }else{
                        W('#city_list .city_close').show();
                    }
                    if (W(this).attr('x-offset')) {
                        instance.container
                        .css({'left' : pos.left - W(this).attr('x-offset'), 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }
                    else if( W(this).attr('data-floatright') ){
                        instance.container
                        .css({'left' : pos.left - 380, 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }else{
                        instance.container
                        .css({'left' : pos.left, 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }

                    //修正IE7下相关bug。IE7，360IE模式下，父级还有position:fixed, 上面的pos.top的值获取不正确，需要修正。需要把posisiton为fixed的父级点传到data-parentfixed参数里。如data-parentfixed="#doc-menubar-fixed"
                    if( W(this).attr('data-parentfixed') ){
                        var pf =W(this).ancestorNode( W(this).attr('data-parentfixed') );
                        var poffsettop =  W(this).attr('data-parenttop')-0 || 30;
                        var scrTop = document.documentElement.scrollTop || document.body.scrollTop;

                        if( pf.length>0 && pf.css('position')=='fixed' &&  scrTop > 0 && pos.top<scrTop+ poffsettop  ){
                            instance.container.css('top',   pos.height + pos.top + 5 + scrTop);
                        }
                    }

                    instance.fire('onShow');

                    instance.container
                        .undelegate('p a')
                        .delegate('p a', 'click', function(e) {
                            e.preventDefault();

                            var name = this.innerHTML,
                                city = this.getAttribute('data-city'),
                                cityid = this.getAttribute('cityid');
                            if(!name || !city) return;

                            instance.fire('selectCity', {'name' : name, 'city' : city, 'cityid': cityid});
                            instance.container.hide();
                        });
                });
                // 将trigger添加到所有的trigger列表里
                CityPanel.prototype._triggerList.push(this.trigger);
			},
            _triggerList: [],
            _documentBind: false // 是否已经写过了document的事件绑定
		}
	})();

	QW.provide({'CityPanel' : CityPanel});
})();

;/**import from `/resource/js/component/expertchat.js` **/
ExpertChat={
	ieobj:null,
	chromobj:null,
	version:0,
	isupdate:0,
	retval:0,
	pTime:0,
	pNum:0,
	wdExists:0,
	cmdparam : '',
	safetime : null,
	plugCheckTime : 1200,
	/**
	 * 把插件html注入的页面中。可以在页面onload前执行。
	 * @return {[type]} [description]
	 */
	initPulgin : function(){
		W('<div style="height:0;overflow:hidden" data-type="x-360-jishi-chat"><embed type="application/x-360-jishi" width="0" height="0" id="jishichromeplugin"></embed><object classid="CLSID:EB8FDC66-F8AB-4D4C-8D96-4E0458EF819D" id="jishiieplugin"></object></div>').appendTo( W('body') );
		ExpertChat.pluginTimer();	
	},
	/**
	 * 启动聊天
	 * @param  {[type]} eid   专家qid
	 * @param  {string} state 专家状态
	 * @param  {TEL} tel   电话号码，可以在专家不在线时，出现拨打电话提示
	 * @return {[type]}       [description]
	 */
	startChat : function(eid, state, tel){
		state = state || '';
		if(W('[data-type="x-360-jishi-chat"]').length == 0){						

			ExpertChat.initPulgin();
			setTimeout(function(){  ExpertChat.startChat(eid, state, tel); }, ExpertChat.plugCheckTime);
			return ;
		}

		if(state && state.toUpperCase()=='OFFLINE')
		{
			if(tel){
				ExpertChat.offlineDialog(tel);
			}else{
				alert("抱歉，当前专家不在线");
			}
			
		}else{
			try{
				window.external.folk_start_consult(""+eid+"");
			}catch(ex){
				if(ExpertChat.exists())
				{
					ExpertChat.cmdparam="/folkproblem=0 /searchfolkpage="+eid+" /consultfolk="+eid+"";	
					ExpertChat.CheckPluginFunc(eid)	
				}
				else
				{	
					ExpertChat.installDialog();
				}
			}
		}		
	},
	//先异步查询状态，在吊起聊天
	startChatByAjax : function(eid, tel){
		loadJsonp( (BASE_ROOT||'') + '/aj/expert_isonline/?qid=' + eid, function(rs){
			if(rs.errno == 0 && rs.result && rs.result.state){
				ExpertChat.startChat(eid);
			}else{
				ExpertChat.startChat(eid, 'OFFLINE', tel);
			}
		});	
	},
	offlineDialog : function(tel){
		if(W('[data-dig="360-jishi-offline"]').length>0 && W('[data-dig="360-jishi-offline"]').css('display')!='none'){
			return;
		}
		var telStr = tel? '你可以直接电话咨询，<br>联系电话：<span style="color:#62A52A">'+tel+'</span><br>或者向其他在线专家咨询。' : '您可以向其他在线专家咨询。';

		if( window.__inclient ){//暂无接口，先不出按钮。
			tcb.panel("提示", '<div style="padding:20px 20px 0 20px; font-size:14px;line-height:1.8;" data-dig="360-jishi-offline">该专家不在线，'+telStr+'</div>', { 'width':320, 'height':150, 'btn_name' : '找其他专家'});
		}else{
			tcb.alert("提示", '<div style="padding:20px 20px 0 20px; font-size:14px;line-height:1.8;" data-dig="360-jishi-offline">该专家不在线，'+telStr+'</div>', { 'width':320, 'height':180, 'btn_name' : '找其他专家'}, function(){
	            ExpertChat.cmdparam="/folkproblem=0 /searchfolkpage=电脑手机";
				ExpertChat.CheckPluginFunc("0");       
	            return true;
	        });
		}
		
	},
	installDialog : function(){
		if(W('[data-dig="360-jishi-install"]').length>0 && W('[data-dig="360-jishi-install"]').css('display')!='none'){
			return;
		}

		tcb.alert("提示", '<div style="padding:20px 20px 5px 20px; font-size:14px;" data-dig="360-jishi-install">您需要加载并安装最新的插件工具才能使用本功能。<br>安装完毕后请关闭本页面后重新打开。<br>如仍无法打开咨询窗口，请使用IE浏览器打开此网址。</div>', { 'width':380, 'height':180, 'btn_name' : '下载插件'}, function(){
            window.open('http://jishi.360.cn/360ExpertPlugin.exe');
            return true;
        });
	},
	installWD : function(){
		tcb.alert(
			"提示", 
			'<div style="padding:20px; font-size:14px;" data-dig="360-jishi-installwd">您需要安装最新版360安全卫士。<br>安装完毕后请关闭本页面后重新打开。</div>', { 
			'width':380, 'height':170, 'btn_name' : '点击下载'}, 
			function(){
	            window.open('http://down.360safe.com/instbeta.exe');
	            return true;
		    }
	    );
	},
	CheckPluginFunc : function(eid){
		if(ExpertChat.wdExists)
		{
			ExpertChat.startClient(eid);			
		}
		else if(ExpertChat.exists())
		{
			var version=ExpertChat.version.replace(/\./g,"");
			var update=ExpertChat.update();
			if(update)
			{
				ExpertChat.installDialog();
				ExpertChat.startClient(eid);
				if(ExpertChat.safetime) clearTimeout(ExpertChat.safetime);
				ExpertChat.safetime=setTimeout(function(){location.reload();},120000);
			}
			else if(version>=1002)
			{
				ExpertChat.startClient(eid);						
			}
			else
			{
				ExpertChat.installDialog();
			}
		}
		else 
		{
			ExpertChat.installDialog();
		}
	},
	pluginTimer:function()
	{
		if(ExpertChat.pTime) clearInterval(ExpertChat.pTime);
		ExpertChat.pTime=setInterval(function(){
			ExpertChat.pNum+=1;	
			if(ExpertChat.exists() || ExpertChat.pNum > 50)
			{
				clearInterval(ExpertChat.pTime);
				ExpertChat.pNum=0;	
			}
		},200);
	},
	exists:function()
	{
		var retval=false;
		if(window.wdextcmd && typeof wdextcmd.CallDiagScanWithParam != 'unknown' && wdextcmd.CallDiagScanWithParam) 
		{
			retval=true;
			ExpertChat.wdExists=1;
			
		}
		else if(typeof external == 'object')
		{
			try{
				external.AppCmd(external.GetSID(window),"","wdroute","hasapp","dsdlg",function(i1,s1){
					if (i1==1) 
					{
						ExpertChat.retval=true;
						ExpertChat.wdExists=1;
					}
					else
					{
						ExpertChat.retval=false;
						ExpertChat.wdExists=0;	
					}	
				});
				retval=ExpertChat.retval;
				
			}
			catch(e)
			{
				retval=ExpertChat.pluginExists();
					
			}
		}
		else
		{
			retval=ExpertChat.pluginExists();	
		}
		return 	retval;	
	},
	pluginExists:function()
	{
		var retval=false;			
		try{
			ExpertChat.ieobj=document.getElementById("jishiieplugin");
			ExpertChat.version=ExpertChat.ieobj.GetVersion();
			retval=true;		
		}catch(e)
		{
			
			try{
				ExpertChat.chromobj=document.getElementById("jishichromeplugin");
				ExpertChat.version=ExpertChat.chromobj.GetVersion();
				var a=ExpertChat.chromobj.GetVersion();
				if(a)
				{
					retval=true;
				}
				else
				{
					retval=false;	
				}
			}catch(e)
			{
				retval=false;	
			}		
		}	
		return retval;
	},
	startClient:function(eid)
	{		

		if(ExpertChat.cmdparam==0)
		{
			var extParam="/folkproblem=0 /searchfolkpage="+eid+" /consultfolk="+eid+"";;	
		}
		else if(eid==0)
		{
			var extParam=ExpertChat.cmdparam;	
		}
		else
		{
			var extParam=ExpertChat.cmdparam;	
		}
		if(window.wdextcmd && typeof wdextcmd.CallDiagScanWithParam != 'unknown' && wdextcmd.CallDiagScanWithParam) 
		{
			try
			{
				window.wdextcmd.CallDiagScanWithParam(""+extParam+"");
			}
			catch(e)
			{
				ExpertChat.pluginStart(extParam);	
			}
		}
		else if(typeof external == 'object')
		{
			try{
					external.AppCmd(external.GetSID(window),"","wdroute","hasapp","dsdlg",function(i1,s1)
					{
						if (i1 == 1) 
						{
							try{
									external.AppCmd(external.GetSID(window),"","wdroute","callapp->dsdlg",''+extParam+'', function(i1,s1){});
								}
								catch(ex)
								{
									ExpertChat.pluginStart(extParam);	
								}		
						}
						else
						{
							ExpertChat.pluginStart(extParam);	
						}	
					});
			}
			catch(e)
			{
				ExpertChat.pluginStart(extParam);	
			}	
		}
		else
		{
			ExpertChat.pluginStart(extParam);	
		}
	},
	pluginStart:function(eid)
	{
		try{
			if(!ExpertChat.ieobj)
				ExpertChat.ieobj=document.getElementById("jishiieplugin");
			ExpertChat.ieobj.RunClient(''+eid+'');			
		}catch(e)
		{
			try
			{
				ExpertChat.chromobj=document.getElementById("jishichromeplugin");
				ExpertChat.chromobj.RunClient(''+eid+'');	
			}catch(e)
			{
				
			}		
		}	
	},
	update:function()
	{
		try{
			if(!ExpertChat.ieobj)
				ExpertChat.ieobj=document.getElementById("jishiieplugin");
			ExpertChat.isupdate=ExpertChat.ieobj.IsNeedUpdate();		
		}catch(e)
		{
			try
			{
				ExpertChat.chromobj=document.getElementById("jishichromeplugin");
				ExpertChat.isupdate=ExpertChat.chromobj.IsNeedUpdate();		
			}catch(e)
			{
				ExpertChat.isupdate=0;	
			}		
		}
		return ExpertChat.isupdate;	
	},
    startClientByParams:function(params) {
        var extParam = '';
        if(ExpertChat.cmdparam==0) {
            extParam = " /folkproblem=0 /tab=3";
            extParam += params['query'] ?  " /searchfolkpage="+params['query'] : '';
            extParam += params['eid'] ?  " /consultfolk="+params['eid'] : '';
        }
        else {
            extParam = ExpertChat.cmdparam;   
        }
        if(window.wdextcmd && typeof wdextcmd.CallDiagScanWithParam != 'unknown' && wdextcmd.CallDiagScanWithParam) {
            try
            {
                window.wdextcmd.CallDiagScanWithParam(""+extParam+"");
            }
            catch(e)
            {
                ExpertChat.pluginStart(extParam);   
            }
        }
        else if(typeof external == 'object') {
            try{
                external.AppCmd(external.GetSID(window),"","wdroute","hasapp","dsdlg",function(i1,s1) {
                    if (i1 == 1) {
                        try{
                            external.AppCmd(external.GetSID(window),"","wdroute","callapp->dsdlg",''+extParam+'', function(i1,s1){});
                        }
                        catch(ex) {
                            ExpertChat.pluginStart(extParam);   
                        }
                    }
                    else {
                        ExpertChat.pluginStart(extParam);   
                    }
                });
            }
            catch(e) {
                ExpertChat.pluginStart(extParam);   
            }
        }
        else {
            ExpertChat.pluginStart(extParam);   
        }
    },
    /**
     * 先异步查询状态，在吊起聊天
     * @param  {[type]} params 可包含参数eid, query, tel等
     * @return {[type]}        [description]
     */
    startChatByAjax2 : function(params){
        params = params || {};
        var eid = params['eid'],
            tel = params['tel'];
        if (!eid) {
            return;
        }
        loadJsonp( (BASE_ROOT||'') + '/aj/expert_isonline/?qid=' + eid, function(rs){

            if(rs.errno == 0 && rs.result && rs.result.state){
                (function(){
                    if(W('[data-type="x-360-jishi-chat"]').length == 0){
                        ExpertChat.initPulgin();
                        setTimeout(arguments.callee, ExpertChat.plugCheckTime);
                        return ;
                    }
                    if(ExpertChat.exists()) {
                        ExpertChat.startClientByParams(params);
                    }
                    else {
                        ExpertChat.installDialog();
                    }
                }());

            }else{
                ExpertChat.offlineDialog(tel);
            }
        }); 
    },

    checkAndStart:function(eid)
	{
		try{
			//先试试看有木有window接口存在
			window.external.folk_start_consult(""+eid+"");
		}catch(ex){
			//如果没有控件，要先加载。如果想减少启动延时，可以使用  initPulgin 方法提前加载
			if(W('[data-type="x-360-jishi-chat"]').length == 0){						

				ExpertChat.initPulgin();
				setTimeout(function(){  ExpertChat.checkAndStart(eid); }, ExpertChat.plugCheckTime);
				return ;
			}

			ExpertChat.cmdparam=0;	
			if(ExpertChat.wdExists)
			{
				
				ExpertChat.startClient(eid);
			}
			else if(ExpertChat.exists())
			{
				var version=ExpertChat.version.replace(/\./g,"");
				var update=ExpertChat.update();
				if(update)
				{
					installWD();
			
				}
				else if(version==1002)
				{
					ExpertChat.startClient(eid);
				}
				else
				{
					ExpertChat.installDialog();
				}
			}
			else 
			{
				ExpertChat.installDialog();		
			}
		}
	},

    checkAndStartFamily:function(eid, consultdefwords) {

        try{
            //如果没有控件，要先加载。如果想减少启动延时，可以使用  initPulgin 方法提前加载
            if(W('[data-type="x-360-jishi-chat"]').length == 0){

                ExpertChat.initPulgin();
                setTimeout(function(){  ExpertChat.checkAndStartFamily(eid, consultdefwords); }, 1500);
                return ;
            }

            ExpertChat.cmdparam=0;
            var cmdparam = "/folkproblem=0 /searchfolkpage="+eid+" /consultfolk="+eid+" /consultdefwords="+consultdefwords+"";
            if(ExpertChat.wdExists) {
                ExpertChat.cmdparam=cmdparam;
                ExpertChat.startClient();
            }
            else if(ExpertChat.exists()) {
                var version=ExpertChat.version.replace(/\./g,"");
                var update=ExpertChat.update();
                if(update) {
                    installWD();
                }
                else if(version==1002) {
                    ExpertChat.cmdparam=cmdparam;
                    ExpertChat.startClient();
                }
                else {
                    ExpertChat.installDialog();
                }
            }
            else {
                ExpertChat.installDialog();
            }
        }catch(ex){}

    }


};	




;/**import from `/resource/js/include/bigmap.js` **/
//查看大地图
var bigMap = function(defaultCity){
	this.defCity = defaultCity;
	var tplStr = '<div class="mode-map"><div class="pop-window">	<div class="pop-hd">		<h2 class="tit">{$shop_name}</h2>		<a href="#" class="close" title="关闭"></a>	</div>	<div class="pop-bd">		{if($main)}<p title="{$main}">主营：{$main}</p>{/if}	<p title="{$addr}">地址：{$addr}</p>		<p>电话：<span class="tel-num">{$omit_tel}</span> <a class="show-full-tel" href="#" data-tel="{$mobile||$fixed_mobile}" shop-id="{$shop_id}">查看完整号码&gt;&gt;</a><span style="color: #4BAC20; display: none;margin:0 0 0 10px;" class="tel-tip">在线付款，360担保，更安全</span></p>		{if(typeof(QIM)!="undefined" && $seller_qid)}<p class="t-a-r" style="margin-top:10px;"><a href="#" class="btn btn-green qim-go-talk" data-id="{$seller_qid}">		{if($is_online=="on")}		立即咨询		{else}离线留言{/if}		</a></p>{/if}		<div class="arr"></div>	</div></div></div>';

	var currShopPoi = null;
	var isSmall = false;

	this.show = function(shopid, ismall){//只传入商家的店铺id，然后异步获取数据
		var mapPopId = "showBigMap_" + Math.ceil(Math.random()*100000);

		var panel = createShowPop(mapPopId, ismall);

        isSmall = ismall;
        
        var dataUrl =  ( BASE_ROOT ||'http://bang.360.cn/') + 'aj/get_shopinfo/?shopid='+shopid;

        loadJsonp(dataUrl, function(data){
        	var shopData = data.result;
        	currShopPoi = shopData.map_longitude +','+ shopData.map_latitude;

			try{
				shopData.omit_tel = hideTelNum( shopData.mobile || shopData.fixed_mobile );

		        var center = new AMap.LngLat(shopData.map_longitude, shopData.map_latitude);
		        var map = new AMap.Map(mapPopId,{
		            view: new AMap.View2D({//创建地图二维视口
                       center: center,
                       zoom:13,
                       rotation:0
                    })
		        }); 
		        map.plugin(["AMap.ToolBar","AMap.OverView","AMap.Scale"],function(){
		        	//加载鹰眼
		            var overview = new AMap.OverView();
		            map.addControl(overview);
		            //加载工具条
		            var toolbar = new AMap.ToolBar(-100,0);
		            toolbar.autoPosition=false;
		            map.addControl(toolbar);
		            //加载比例尺
		            var scale = new AMap.Scale();
		            map.addControl(scale);
		        });
		        //点标注
		        var marker = new AMap.Marker({
		            id:"mapMarker",
		            zIndex : 99,
		            position:new AMap.LngLat(shopData.map_longitude, shopData.map_latitude), 
		            icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
		            offset:{x:-13,y:-36} 
		        });
		        marker.setMap(map);
		        //信息显示
		        var fun_html = tplStr.tmpl();
		        var infoWindow = new AMap.InfoWindow({
					isCustom: true,
					autoMove: true,
					offset:new AMap.Pixel(70, isSmall?-220 : -286),
					content: fun_html(shopData)
				});
                AMap.event.addListener(marker,'click',function(){ //鼠标点击marker弹出自定义的信息窗体
                     infoWindow.open(map, marker.getPosition());	
                });
				infoWindow.open(map, marker.getPosition());
				W(document.body).delegate('.mode-map a.close', 'click', function(e){
					e.preventDefault();
					map.clearInfoWindow();
				});			

				//点击在线聊天时关闭弹出层
				W(document.body).delegate('.qim-go-talk', 'click', function(){
					try{ panel.hide(); }catch(ex){}
				});

				//获取周围的商家
				getAroundShop({'lng':shopData.map_longitude , 'lat':shopData.map_latitude}, map);

				W( '#'+mapPopId ).delegate('.show-full-tel', 'click', function(e){
					e.preventDefault();
					showFullTelNum( W(this) );
				});
			}catch(e){}
        });
		


		
	}

	function createShowPop(mapPopId, ismall){
		if(ismall){
			var panel = tcb.alert("商铺地图", '<div id="'+mapPopId+'" style="width:626px;height:375px"></div>', {'width':626, 'btn_name': '关闭'}, function(){
	            return true;
	        });
		}else{

	        var panel = tcb.alert("商铺地图", '<div id="'+mapPopId+'" style="width:695px;height:410px"></div>', {'width':695, 'btn_name': '关闭'}, function(){
	            return true;
	        });
		}

		return panel;
	}

	function getAroundShop(poi, map){
		var bounds = getBounds(poi, 5000);

		var params = Object.encodeURIJson({
			region : bounds,
			cityid : QW.Cookie.get('cid'),
			number : 10
		});

		QW.loadJsonp( (BASE_ROOT ||'http://bang.360.cn/') + 'ajmap/getdefshop/?jsoncallback=%callbackfun%&' + params, function(data){
			showAroundShop(data, map);
		} );
	}

	function showAroundShop(data, map){
		if(data.status=='E0' && data.poi && data.poi.length>0){
			for(var i=0, n=data.poi.length; i<n; i++){
				var shop = data.poi[i];

				if(currShopPoi == shop.x+','+shop.y){ continue; }

				(function(shop){					
					try{						
						var datainfo = {
							shop_name : shop.shop_name,
							main : shop.service_desc,
							addr : shop.addr_detail,
							mobile : shop.tel,
							omit_tel : hideTelNum(shop.tel)
						};
						//点标注
				        var marker = new AMap.Marker({
				            id:"mapMarker" + i,
				            position:new AMap.LngLat(shop.x, shop.y), 
				            icon:{stc:"https://p.ssl.qhimg.com/t01a55fed81341959b4.png"}.stc,
				            offset:{x:-13,y:-36} 
				        });
				        marker.setMap(map);

				        //信息显示
				        var fun_html = tplStr.tmpl();
				        var infoWindow = new AMap.InfoWindow({
							isCustom: true,
							autoMove: true,
							offset:new AMap.Pixel(70, isSmall?-220 : -286),
							content: fun_html(datainfo)
						});

					    AMap.event.addListener(marker,'click',function(){ //鼠标点击marker弹出自定义的信息窗体
                             infoWindow.open(map, marker.getPosition());	
                        });	
					}catch(ex){}
				})(shop);
			}
			
		}
	}

	/**
     * 根据中心点和半径换算查询范围
     * @param  {[type]} latLng [description]
     * @param  {[type]} radius [description]
     * @return {[type]}        [description]
     */
    function getBounds(latLng, radius){
        var latitude = latLng.lat-0;

        var longitude = latLng.lng-0;

        var degree = (24901 * 1609) / 360.0;

        var raidusMile = radius;

        var dpmLat = 1 / degree;

        var radiusLat = dpmLat * raidusMile;

        var minLat = latitude - radiusLat;

        var maxLat = latitude + radiusLat;

        var mpdLng = degree * Math.cos(latitude * (Math.PI / 180));

        var dpmLng = 1 / mpdLng;

        var radiusLng = dpmLng * raidusMile;

        var minLng = longitude - radiusLng;

        var maxLng = longitude + radiusLng;

        return [ [minLng, minLat ].join(',') , [maxLng, maxLat].join(',') ].join(';');       
    }

    /**
     * 隐藏部分电话号码
     * @param  {num} tel 电话号码
     * @return {[type]}     [description]
     */
    function hideTelNum(tel){
	    if(!tel) return '';
	    return tel.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3").replace(/(\d+\-)?(\d+)\d{4}/, "$1$2****");
	}


	function showFullTelNum(obj){
		var wMe = obj,
            tel = wMe.attr('data-tel');

        wMe.siblings('.tel-num').html(tel);
        wMe.hide();
        wMe.siblings('.tel-tip').show();

        var shop_id = wMe.attr('shop-id');
        new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=bigmap" + (typeof(_inclient)!='undefined' && _inclient ? '&inclient=1' : '');
	}

	//获取poi
	this.getGeoPoi = function(addr, callback){
		var defCity = this.defCity;
		
		var MGeocoder = new AMap.Geocoder({
			'city' : defCity || W('.area-box-sel').html() || ''
		});
		MGeocoder.geocode(addr, function(poi){
            var userPoi = null;

            if(poi.list && poi.list.length >0 ){//如果有多个结果，只care第一个。
                userPoi = { lng: poi.list[0].x , lat:poi.list[0].y };
            }

            callback(userPoi);
        }); 
	}

}
