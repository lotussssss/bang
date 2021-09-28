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

;/**import from `/resource/js/include/AreaSelect.js` **/
(function(){
window.bang = window.bang || {};
/**
 * 区域选择
 * @param {[type]} options [description]
 */
function AreaSelect(options){
    var defaults = {
        'wrap': '#citySelector',
        'data': {
            'cityid': '',
            'citycode': '',
            'cityname': '',
            'areacode': '',
            'areaname': '',
            'quancode': '',
            'quanname': ''
        },
        'hasarea': true,  // 是否显示区县
        'hasquan': true,  // 是否显示商圈
        'autoinit': true, // 是否自动初始化
        'urlhost': '',    // 请求的url
        // new后init的回调
        'onInit': function(){},
        // 城市选择时触发
        'onCitySelect': function(data){},
        // 区县选择时触发
        'onAreaSelect': function(data){},
        // 商圈选择时触发
        'onQuanSelect': function(data){}
    }
    options = options || {};
    var data = options.data || {}
    QW.ObjectH.map(data, function (val, key) {
        if (val && typeof val === 'string') {
            data[key] = tcb.html_encode(val)
        }
    })
    options.data = data
    options = QW.ObjectH.mix(defaults, options, true);
    options.urlhost = options.urlhost || 'http://' + location.host +'/';

    var me = this;
    me.options = options; // 配置项
    me.data = {}; // 用于回调中的参数

    var fn = AreaSelect.prototype;
    if (typeof fn.eventBind === 'undefined') {

        /**
         * 设置data
         * @param {[type]} key  [description]
         * @param {[type]} val  [description]
         * @param {[type]} flag [description]
         */
        fn.setData = function(key, val, flag){
            var me = this;

            if (QW.ObjectH.isObject(key)) {
                flag = val;
                val = null;
            }
            else if (QW.ObjectH.isString(key)) {
                key = {
                    key:val
                };
            } else {
                return;
            }

            if (flag) {
                me.data = key;
            } else{
                me.data = QW.ObjectH.mix(me.data, key, true);
            }
        }
        /**
         * 返回城市、区县、商圈相关数据
         * @return {[type]} [description]
         */
        fn.getData = function(){
            var me = this;

            return me.data;
        }
        /**
         * 根据key删除data中的数据
         */
        fn.deleteData = function(key){
            var me = this;

            var data = me.data;
            if (QW.ObjectH.isArray(key)) {
                QW.ObjectH.map(key, function(v){
                    if(typeof data[v] !== 'undefined'){
                        delete data[v];
                    }
                });
            }
            if (QW.ObjectH.isString(key)) {
                if (typeof data[key] !== 'undefined') {
                    delete data[key];
                }
            }
        }
        /**
         * 获取区县信息
         * @param  {[type]} citycode [description]
         * @return {[type]}          [description]
         */
        fn.getArea = function(citycode){
            var me = this;
            var url = me.options['urlhost'] + 'aj/get_area/?citycode='+citycode;

            // 移除商圈选择
            me._removeAreaTrigger();
            me._removeQuanTrigger();
            // QW.Ajax.get(url, function(responseText){
            //     try{
            //         var area_list = QW.JSON.parse(responseText)['result'];

            //         var options_str = '';
            //         if (QW.ObjectH.isObject(area_list)) {
            //             QW.ObjectH.map(area_list, function(v, k){
            //                 options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
            //             });
            //         }

            //         if (options_str) {
            //             options_str = '<a href="javascript:;">全部区县</a>' + options_str;

            //             var wAreaTrigger = me._getAreaTrigger();
            //             wAreaTrigger.show();
            //             wAreaTrigger.query('.select-list').html(options_str);
            //         }
            //     } catch (e){}
            // });
            setTimeout(function(){
                QW.loadJsonp(url, function(data){
                    // try{
                        var area_list = data['result'];

                        var options_str = '';
                        if (QW.ObjectH.isObject(area_list)) {
                            QW.ObjectH.map(area_list, function(v, k){
                                options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
                            });
                        }

                        if (options_str) {
                            options_str = '<a href="javascript:;">全部区县</a>' + options_str;

                            var wAreaTrigger = me._getAreaTrigger();
                            wAreaTrigger.show();
                            wAreaTrigger.query('.select-list').html(options_str);
                        }
                    // } catch (e){}
                });
            }, 160);

        }
        /**
         * 获取商圈信息
         * @param  {[type]} citycode [description]
         * @param  {[type]} areacode [description]
         * @return {[type]}          [description]
         */
        fn.getQuan = function(citycode, areacode){
            var me = this;
            var url = me.options['urlhost'] +'aj/get_areaquan/?citycode='+citycode+'&areacode='+areacode;

            // 移除商圈选择
            me._removeQuanTrigger();
            // QW.Ajax.get(url, function(responseText){
            //     try{
            //         var area_list = QW.JSON.parse(responseText)['result'];

            //         var options_str = '';
            //         if (QW.ObjectH.isObject(area_list)) {
            //             QW.ObjectH.map(area_list, function(v, k){
            //                 options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
            //             });
            //         }

            //         if (options_str) {
            //             options_str = '<a href="javascript:;">全部商圈</a>' + options_str;

            //             var wQuanTrigger = me._getQuanTrigger();
            //             wQuanTrigger.show();
            //             wQuanTrigger.query('.select-list').html(options_str);
            //         }
            //     } catch (e){}
            // });
            setTimeout(function(){
                QW.loadJsonp(url, function(data){
                    // try{
                        var area_list = data['result'];

                        var options_str = '';
                        if (QW.ObjectH.isObject(area_list)) {
                            QW.ObjectH.map(area_list, function(v, k){
                                options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
                            });
                        }

                        if (options_str) {
                            options_str = '<a href="javascript:;">全部商圈</a>' + options_str;

                            var wQuanTrigger = me._getQuanTrigger();
                            wQuanTrigger.show();
                            wQuanTrigger.query('.select-list').html(options_str);
                        }
                    // } catch (e){}
                });
            }, 160);
        }
        /**
         * 获取组件的最外层的对象；
         * @return {[type]} [description]
         */
        fn.getWrap = function(){
            var me = this;
            if (me.wWrap) {
                return me.wWrap;
            }
            var wWrap = QW.ObjectH.isObject(me.options['wrap']) ? me.options['wrap'] : W(me.options['wrap']);

            return me.wWrap = wWrap;
        }
        /**
         * 获取城市触发器
         * @return {[type]} [description]
         */
        fn._getCityTrigger = function(){
            var me = this;
            if (me.wCityTrigger) {
                return me.wCityTrigger;
            }
            var wWrap = me.getWrap(),
                wCityTrigger = wWrap.query('.sel-city');

            return me.wCityTrigger = wCityTrigger;
        }
        /**
         * 设置城市触发器上边的相关数据
         * @param {[type]} cityid   [description]
         * @param {[type]} citycode [description]
         * @param {[type]} cityname [description]
         */
        fn._setCityData = function(cityid, citycode, cityname){
            var me = this;

            var wCityTrigger = me._getCityTrigger();
            wCityTrigger.attr('code', citycode);
            wCityTrigger.one('.sel-txt').html(cityname);

            // 设置data
            me.setData({
                'cityid': cityid,
                'citycode': citycode,
                'cityname': cityname
            }, true);
        }
        /**
         * 获取区县触发器
         * @return {[type]} [description]
         */
        fn._getAreaTrigger = function(){
            var me = this;
            if (me.wAreaTrigger) {
                return me.wAreaTrigger;
            }
            var wWrap = me.getWrap(),
                wAreaTrigger = wWrap.query('.sel-quxian');
            if (!wAreaTrigger.length) {
                // var tpl = W('#ClientAreaTpl').html().trim();
                var tpl = '<div class="area-sel sel-quxian mr-10" style="display:none;"><span class="sel-txt">选择区县</span><span class="icon icon-arrow pngfix"></span><div class="sel-quxian-pannel select-pannel" style="display:none;"><h3>区县列表<span class="close city_close" title="关闭"></span></h3><div class="select-list"></div></div></div>';
                wAreaTrigger = W(tpl);
                me.getWrap().appendChild(wAreaTrigger);
            }

            return me.wAreaTrigger = wAreaTrigger;
        }
        /**
         * 设置区县触发器上边的相关数据
         * @param {[type]} citycode [description]
         * @param {[type]} cityname [description]
         */
        fn._setAreaData = function(areacode, areaname){
            var me = this;

            var wAreaTrigger = me._getAreaTrigger();
            wAreaTrigger.attr('code', areacode);
            wAreaTrigger.query('.sel-txt').html(areaname);

            // 设置data
            me.setData({
                'areacode': areacode,
                'areaname': areaname
            });
        }
        /**
         * 移除区县
         * @return {[type]} [description]
         */
        fn._removeAreaTrigger = function(){
            var me = this;

            var wAreaTrigger = me._getAreaTrigger();

            wAreaTrigger.removeNode();
            delete me.wAreaTrigger;
        }
        /**
         * 获取商圈触发器
         * @return {[type]} [description]
         */
        fn._getQuanTrigger = function(){
            var me = this;
            if (me.wQuanTrigger) {
                return me.wQuanTrigger;
            }
            var wWrap = me.getWrap(),
                wQuanTrigger = wWrap.query('.sel-shangquan');
            if (!wQuanTrigger.length) {
                // var tpl = W('#ClientQuanTpl').html().trim();
                var tpl = '<div class="area-sel sel-shangquan mr-10" style="display:none;"><span class="sel-txt">选择商圈</span><span class="icon icon-arrow pngfix"></span><div class="sel-shangquan-pannel select-pannel" style="display:none;"><h3>商圈列表<span class="close city_close" title="关闭"></span></h3><div class="select-list"></div></div></div>';
                wQuanTrigger = W(tpl);
                me.getWrap().appendChild(wQuanTrigger);
            }

            return me.wQuanTrigger = wQuanTrigger;
        }
        /**
         * 设置商圈触发器上边的相关数据
         * @param {[type]} citycode [description]
         * @param {[type]} cityname [description]
         */
        fn._setQuanData = function(quancode, quanname){
            var me = this;

            var wQuanTrigger = me._getQuanTrigger();
            wQuanTrigger.attr('code', quancode);
            wQuanTrigger.query('.sel-txt').html(quanname);
            // 设置data
            me.setData({
                'quancode': quancode,
                'quanname': quanname
            });
        }
        /**
         * 移除商圈
         * @return {[type]} [description]
         */
        fn._removeQuanTrigger = function(){
            var me = this;

            var wQuanTrigger = me._getQuanTrigger();

            wQuanTrigger.removeNode();
            delete me.wQuanTrigger;
        }
        /**
         * 选择城市
         * @return {[type]} [description]
         */
        fn._selectCity = function(){
            var me = this;

            var wCityTrigger = me._getCityTrigger(),
                cityPanel = new CityPanel(wCityTrigger);

            cityPanel.on('selectCity', function(e) {
                var code = e.city.trim(),
                    name = e.name.trim(),
                    cityid = e.cityid.trim();

                // 设置城市触发器上的属性数据
                me._setCityData(cityid, code, name);

                // 选择城市的时候获取区县
                if (me.options['hasarea']) {
                    me.getArea(code);
                }

                var data = me.data;
                // 选择城市的时候调用此回调
                if(typeof me.options.onCitySelect === 'function'){
                    me.options.onCitySelect(data);
                }
            });
        }
        /**
         * 绑定事件
         * @return {[type]} [description]
         */
        fn.eventBind = function(){
            var me = this;
            var wWrap = me.getWrap();

            // 激活城市选择
            me._selectCity();
            // 外层对象上绑定事件
            wWrap.on('click', function(e){
                var wMe = W(this),
                    target = e.target,
                    wTarget = W(target);

                var wAreaTrigger = me._getAreaTrigger(),
                    wQuanTrigger = me._getQuanTrigger();
                // 激活区县选择
                if (wAreaTrigger.contains(target)||wAreaTrigger[0]===target) {
                    var wPanel = wAreaTrigger.query('.select-pannel');
                    wPanel.fadeIn(100);

                    // 关闭区县选择列表
                    if (wTarget.hasClass('close')) {
                        wPanel.hide();
                    }
                    // 选择区县
                    if (wTarget[0].nodeName.toLowerCase()==='a') {
                        var code = wTarget.attr('code'),
                            name = wTarget.html();
                        if (code) {
                            me._setAreaData(code, name);
                        } else {
                            wAreaTrigger.attr('code', '');
                            wAreaTrigger.query('.sel-txt').html('选择区县');
                            me.deleteData(['areacode', 'areaname']);
                        }

                        wPanel.hide();

                        // 删除商圈data
                        me.deleteData(['quancode', 'quanname']);
                        var data = me.data;
                        // 选择区县的时候获取商圈
                        if(me.options['hasquan']){
                            me.getQuan(data['citycode'], code);
                        }
                        // 选择区县的时候调用此回调
                        if (typeof me.options.onAreaSelect === 'function') {
                            me.options.onAreaSelect(data);
                        }
                    }
                }
                // 激活商圈选择
                else if(wQuanTrigger.contains(target)||wQuanTrigger[0]===target){
                    var wPanel = wQuanTrigger.query('.select-pannel');
                    wPanel.fadeIn(100);

                    // 关闭商圈选择列表
                    if (wTarget.hasClass('close')) {
                        wPanel.hide();
                    }
                    // 选择商圈
                    if (wTarget[0].nodeName.toLowerCase()==='a') {
                        var code = wTarget.attr('code'),
                            name = wTarget.html();
                        if (code) {
                            me._setQuanData(code, name);
                        } else {
                            wQuanTrigger.attr('code', '');
                            wQuanTrigger.query('.sel-txt').html('选择商圈');
                            me.deleteData(['quancode', 'quanname']);
                        }

                        wPanel.hide();

                        var data = me.data;
                        // console.log(data)
                        // 选择商圈的时候调用此回调
                        if (typeof me.options.onQuanSelect === 'function') {
                            me.options.onQuanSelect(data);
                        }
                    }
                }
            });
            // body上的绑定事件，面板失去焦点的时候关闭面板
            W(document.body).on('click', function(e){
                var target = e.target,
                    wTarget = W(target);

                var wAreaTrigger = me._getAreaTrigger();
                if (!(wAreaTrigger.contains(target)||wAreaTrigger[0]===target)) {
                    wAreaTrigger.query('.select-pannel').hide();
                }

                var wQuanTrigger = me._getQuanTrigger();
                if (!(wQuanTrigger.contains(target)||wQuanTrigger[0]===target)) {
                    wQuanTrigger.query('.select-pannel').hide();
                }
            });
        }
        /**
         * 初始化调用
         * @return {[type]} [description]
         */
        fn.init = function(){
            var me = this;

            me.eventBind();

            var data = me.options.data;

            var wCityTrigger = me._getCityTrigger(),
                citycode = data['citycode'] ? data['citycode'] : wCityTrigger.attr('code'),
                cityname = data['cityname'] ? data['cityname'] : wCityTrigger.query('.sel-txt').html();
            me.setData({
                'citycode': citycode,
                'cityname': cityname
            });

            if (me.options['hasarea']) {
                me.getArea(citycode);
            }

            // 区县有初始化数据
            if (data['areacode'] && data['areaname']) {
                me._setAreaData(data['areacode'], data['areaname']);

                if (me.options['hasquan']) {
                    me.getQuan(citycode, data['areacode']);
                }
            }
            // 商圈初始化数据
            if (data['quancode'] && data['quanname']) {
                me._setQuanData(data['quancode'], data['quanname']);
            }

            if(typeof me.options.onInit === 'function'){
                me.options.onInit(me.getData());
            }
        }

    }
    // 初始化
    me.options.autoinit && me.init();
}

bang.AreaSelect = AreaSelect

}());


;/**import from `/resource/js/component/inner_login.js` **/
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

;/**import from `/resource/js/component/pager.js` **/
(function() {
	function Pager() {
		this.init.apply(this, arguments);
	};

	Pager.prototype = (function() {
		var getHtml = function(totalPages, currentPage) {
			totalPages = Math.min(99, totalPages);

			currentPage = parseInt(currentPage, 10) || 0;
			currentPage++;

			currentPage = Math.min(Math.max(1, currentPage), totalPages);

			var html = [];
			if(currentPage > 5 && totalPages > 10) {
				html.push('<a data-pn="0" href="#" class="first">首页</a>&nbsp;');
			}

			if(currentPage > 1) {
				html.push('<a data-pn="',currentPage - 2,'" href="#" class="pre">&#171;上一页</span></a>&nbsp;');
			}

			var min, max;
			if(currentPage > 5) {
				min = currentPage - 4;
				if(currentPage > totalPages - 5) {
					min = totalPages - 9;
				}
			} else {
				min = 1;
			}

			max = min + 9;
			min = Math.max(min, 1);
			max = Math.min(max, totalPages);


			for(var i = min; i <= max; i++) {
				if(i == currentPage) {
					html.push('<span>', i ,'</span>&nbsp;');
				} else {
					html.push('<a data-pn="', i - 1, '" href="#">', i, '</a>&nbsp;');
				}
			}

			if(currentPage < totalPages) {
				html.push('<a data-pn="', currentPage ,'" href="#" class="next">下一页&#187;</a>&nbsp;');
			}

			if(currentPage < totalPages - 5 && currentPage > 10) {
				html.push('<a data-pn="',totalPages - 1,'" href="#" class="last">尾页</a>');
			}

		    return html.join("");
		}; 

		return {
			init : function(el, totalPages, currentPage) {
				var instance = this;

				CustEvent.createEvents(this);

				W(el).undelegate('a', 'click');

				W(el).html(getHtml(totalPages, currentPage))
					.delegate('a', 'click', function(e) {
						e.preventDefault();
						var pn = this.getAttribute('data-pn') || 0;
						setTimeout(function(){W(el).html(getHtml(totalPages, pn));},50);  //some error while happen if no settimeout

						instance.fire('pageChange', {'pn' : pn-0});
					});
			}
		}
	})();

	QW.provide({'Pager' : Pager});
})();

;/**import from `/resource/js/component/valid.js` **/
/**	
 * @class Valid Valid form验证
 * @namespace QW
 * @singleton 
 */


(function() {
	var QW = window.QW,
		loadJs = QW.loadJs,
		mix = QW.ObjectH.mix,
		StringH = QW.StringH,
		trim = StringH.trim,
		tmpl = StringH.tmpl,
		dbc2sbc = StringH.dbc2sbc,
		byteLen = StringH.byteLen,
		evalExp = StringH.evalExp,
		formatDate = QW.DateH.format,
		NodeH = QW.NodeH,
		g = NodeH.g,
		query = NodeH.query,
		getValue = NodeH.getValue,
		getAttr2 = function(el, attr) {
			if(!el || !el.getAttribute) return '';
			return el[attr] || el.getAttribute(attr) || getJsAttr(el, attr);
		},
		createElement = QW.DomU.create,
		CustEvent = QW.CustEvent;

	var Valid = {
		VERSION: '0.0.1',
		EVENTS: 'hint,blur,pass,fail,beforecheckall,checkall,initall'.split(','),
		validPath: QW.PATH + 'components/valid/',
		REQ_ATTR: 'reqMsg',
		//默认的必须输入属性名称
		_curReqAttr: 'reqMsg' //当前必须输入属性名称(例如,对于"保存订单草稿"和"下订单"两个按钮,必须输入属性值可能不一样)
	};

	/* 
	* 从JsData中获取element对象的属性
	* @method	getJsAttr
	* @param	{HTMLElement} el 目标对象
	* @param	{string} attribute 属性名称
	* @return	{any}
	*/
	var getJsAttr = function(el, attribute) {
		var CheckRules = Valid.CheckRules;
		if (!CheckRules) return null;
		attribute = attribute.toLowerCase();
		el = g(el);
		var keys = []; //优先度:id>name>className>tagName
		if (el.id) keys.push('#' + el.id); //id
		if (el.name) keys.push('@' + el.name); //name
		keys = keys.concat(el.className.match(/\.[\w\-]+/g) || [], (el.tagName + '').toLowerCase()); //className>tagName
		for (var i = 0, len = keys.length; i < len; i++) {
			var key = keys[i];
			if ((key in CheckRules) && (attribute in CheckRules[key])) return CheckRules[key][attribute];
		}
		return null;
	};
	/**
	 * CheckRules 一个命名空间，用来存贮跟元素对应变量.
	 * @property	{Json} CheckRules 用来存贮跟元素对应的某些变量。
	 Valid.CheckRules={
	 'input':{datatype:'d'},
	 '#myid':{minValue:'2010-01-01'},
	 '@myname':{maxValue:'2011-01-01'},
	 '.myclass':{minValue:'2010-01-01'}
	 };
	 */
	CustEvent.createEvents(Valid, Valid.EVENTS);

	mix(Valid, {
		/** 
		 * 点亮元素
		 * @method hint
		 * @static
		 * @param {Element} el 表单元素 
		 * @return {void}
		 */
		hint: function(el) {
			Valid.fire(new CustEvent(el, 'hint')); //onhint
		},
		/** 
		 * 离开元素
		 * @method blur
		 * @static
		 * @param {Element} el 表单元素 
		 * @return {void}
		 */
		blur: function(el) {
			Valid.fire(new CustEvent(el, 'blur')); //onblur
		},
		/** 
		 * 元素通过验证
		 * @method pass
		 * @static
		 * @param {Element} el 表单元素 
		 * @return {void}
		 */
		pass: function(el) {
			Valid.fire(new CustEvent(el, 'pass')); //onpass
		},
		/** 
		 * 元素未通过验证
		 * @method fail
		 * @static
		 * @param {Element} el 表单元素 
		 * @param {string} errMsg 未通过提示信息 
		 * @param {boolean} needFocus 是否需要focus 
		 * @return {void}
		 */
		fail: function(el, errMsg, needFocus) {
			if (needFocus) Valid.focusFailEl(el);
			var ce = new CustEvent(el, 'fail');
			ce.errMsg = errMsg;

			//Jerry Qu修改。因为IE9下的focus触发是异步的
			setTimeout(function() {
				Valid.fire(ce); //onfail
			}, 0);
		},

		checkAll_stamp: 1,
		//checkAll的次数
		isChecking: false,
		//是否正在checkAll中
		/** 
		 * 验证一个表单的所有元素
		 * @method checkAll
		 * @static
		 * @param {Element} oForm 表单 
		 * @param {boolean} needFocus 是否需要focus 
		 * @param {json} opts其它参数，止前支持以下参数。
		 reqAttr: String,非空标识属性，默认值是Valid.REQATTR,即"reqMsg".
		 myValidator: Function,自己的验证函数，以处理非空验证与dataType验证无法处理的其它特殊验证。checkAll会对元素进行遍历，每个都会调用下myValidator(el)，如果该函数返回false，则表示该元素未通过验证 
		 * @return {boolean} 
		 */
		checkAll: function(oForm, needFocus, opts) {
			needFocus = (needFocus != false);
			var ce = new CustEvent(oForm, 'beforecheckall');
			ce.opts = opts || {};
			Valid.fire(ce); //onbeforecheckall
			Valid.isChecking = true;
			var els = oForm.elements,
				failEls = [];
			for (var i = 0, el; el = els[i++];) {
				if (el) {
					var nd_name = el.nodeName.toLowerCase();
					if (nd_name=='input' || nd_name=='textarea') {
						if (!getAttr2(el, "forceVld") && (el.disabled || el.readOnly || !el.offsetWidth)) continue;
						if (!Valid.check(el, false, opts)) failEls.push(el);
					}
				}
			}
			var isOk = !failEls.length;
			var ce2 = new CustEvent(oForm, 'checkall');
			ce2.result = isOk;
			ce2.failEls = failEls;
			Valid.fire(ce2); //oncheckall
			Valid.isChecking = false;
			Valid.checkAll_stamp++;
			if (!isOk && needFocus){
				window.setTimeout(function() {
					var el = null;
					for(var i=0,length=failEls.length;i<length;i++){
						if (W(failEls[i]).attr('type')!='hidden') {
							el = failEls[i];
							break;
						};
					}
					el && Valid.check(el, true, opts);
				}, 10);
			}
			return isOk;
		},

		/** 
		 * 验证一个表单元素
		 * @method check
		 * @static
		 * @param {Element} el 表单元素 
		 * @param {boolean} needFocus 是否需要focus 
		 * @param {json} opts其它参数，止前支持以下参数。
		 myValidator: Function,自己的验证函数，以处理非空验证与dataType验证无法处理的其它特殊验证。checkAll会对元素进行遍历，每个都会调用下myValidator(el)，如果该函数返回false，则表示该元素未通过验证 
		 * @return {boolean} 
		 */
		check: function(el, needFocus, opts) {
			if (!Validators.required(el) //非空验证
					|| getAttr2(el, "datatype") && !Validators.datatype(el) || (opts && opts.myValidator && !opts.myValidator(el)) //用户自定义验证
					) {
				if (needFocus) {
					Valid.focusFailEl(el);
					Valid.check(el, false, opts);
				}
				return false;
			}
			return true;
		},

		/** 
		 * 将验证结果渲染到页面
		 * @method renderResult
		 * @static
		 * @param {Element} el 表单元素 
		 * @param {boolean} result 是否通过验证 
		 * @param {string} errMsg 未通过验证时的提示信息 
		 * @param {boolean} needFocus 是否需要focus 
		 * @return {void} 
		 */
		renderResult: function(el, result, errMsg, needFocus) {
			if (result) Valid.pass(el);
			else Valid.fail(el, errMsg, needFocus);
		},

		/** 
		 * 焦点集中到未通过验证的Element上
		 * @static
		 * @method focusFailEl
		 * @param {Element} el 表单元素 
		 * @return {void} 
		 */
		focusFailEl: function(el) {
			var fEl = getAttr2(el, "focusEl");
			fEl = fEl && g(fEl) || el;
			try {
				fEl.focus();
				if (!fEl.tagName) return;
				if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(fEl);
				fEl.select();
			} catch (e) {}
		},

		/** 
		 * 初始化验证，包括：监控元素的onfocus/onblur，以及日期后面添加日历按钮
		 * @method initAll
		 * @static
		 * @param {Element} container 容器HTMLElement 
		 * @return {void} 
		 */
		initAll: function(container) {
			if (!Valid._isInitialized) {
				Valid._isInitialized = true;
				if (document.addEventListener) { //非ie
					document.addEventListener('focus', function(e) {
						var el = e.target;
						if (el && ',INPUT,SELECT,TEXTAREA'.indexOf(',' + el.tagName) > -1) {
							Valid.hint(el);
						}
					}, true);
					document.addEventListener('blur', function(e) {
						var el = e.target;
						if (el && ',INPUT,SELECT,TEXTAREA'.indexOf(',' + el.tagName) > -1) {
							Valid.blur(el);
						}
					}, true);
					document.addEventListener('click', function(e) {
						var el = e.target;
						if (el.type == 'checkbox' || el.type == 'radio') {
							Valid.blur(el);
						}
					});
				} else {
					document.attachEvent('onfocusin', function(e) {
						Valid.hint(e.srcElement);
					});
					document.attachEvent('onfocusout', function(e) {
						Valid.blur(e.srcElement);
					});
				}
			}
			var els = query(container, "input");
			for (var i = 0; i < els.length; i++) {
				Valid.initEl(els[i]);
			}
			var ce = new CustEvent(container, 'initall');
			Valid.fire(ce); //oninitall

		},
		/** 
		 * 初始化验证，包括：监控元素的onfocus/onblur，以及日期后面添加日历按钮
		 * @method initEl
		 * @static
		 * @param {Element} container 容器HTMLElement 
		 * @return {void} 
		 */
		initEl: function(el) {
			var dataType = getAttr2(el, "datatype");
			if (dataType == "d" || dataType == "daterange") {//Date日期的后面会有日期按钮
				el.onclick = function(e) {
					Utils.pickDate(el);
				};
				el.autocomplete = 'off';
				//同城帮项目不要日历图标，点文本框就出日期选择浮层
				/*
				var nextEl = el.nextSibling;
				if (nextEl && nextEl.tagName == "IMG") return;
				var img = Utils.getCalendarImg().cloneNode(true);
				img.onclick = function(e) {
					Utils.pickDate(el);
				};
				el.parentNode.insertBefore(img, nextEl);
				*/
			}
		},

		/** 
		 * 将所有的错误验证信息清空。
		 * @method resetAll
		 * @static
		 * @param {Element} oForm FormHTMLElement 
		 * @return {void} 
		 */
		resetAll: function(oForm) {
			var els = oForm.elements;
			for (var i = 0, el; el = els[i++];) {
				Valid.pass(el);
			}
		}
	});


	/**
	 * @class Msgs 提示信息集合,另外提供一个得到提示信息的方法(即getMsg).
	 * @singleton
	 * @namespace QW.Valid
	 */

	var Msgs = Valid.Msgs = {
		n_integer: '请输入小于{$0}的正整数',
		n_format: '数字输入格式为"{$0}"',
		n_upper: '输入值太大，最大允许<strong>{$0}</strong>', //注意：{$0}表示允许值，{$1}表示实际值
		n_lower: '输入值太小，最小允许<strong>{$0}</strong>',
		nrange_from: '您输入的范围不合理',
		nrange_to: '您输入的范围不合理',
		n_useless_zero: '数字前面好像有多余的"0"',
		d_format: '日期输入格式为"YYYY-MM-DD"',
		d_upper: '日期太晚，最晚允许<strong>{$0}</strong>',
		d_lower: '日期太早，最早允许<strong>{$0}</strong>',
		daterange_from: '起始日期不能大于截止日期',
		daterange_to: '截止日期不能小于起始日期',
		daterange_larger_span: "时间跨度不得超过<strong>{$0}</strong>天",
		text_longer: '字数太多，最多允许<strong>{$0}</strong>字', //'{$1}字太多，最多允许<strong>{$0}</strong>字'
		text_shorter: '字数太少，最少允许<strong>{$0}</strong>字', //'{$1}字太少，最少允许<strong>{$0}</strong>字'
		bytetext_longer: '字数太多，最多允许<strong>{$0}</strong>字节', //'{$1}字节太多，最多允许<strong>{$0}</strong>字节'
		bytetext_shorter: '字数太少，最少允许<strong>{$0}</strong>字节', //'{$1}字节太少，最少允许<strong>{$0}</strong>字节'
		richtext_longer: '字数太多，最多允许<strong>{$0}</strong>字',
		richtext_shorter: '字数太少，最少允许<strong>{$0}</strong>字',
		_reconfirm: '两次输入不一致',
		_time: '请检查您输入的时间格式',
		_minute: '请检查您输入的时间格式',
		_email: '请检查您输入的Email格式',
		_mobilecode: '请检查您输入的手机号码',
		_phone: '请检查您输入的电话号码',
		_phonewithext: '请检查您输入的电话号码',
		_phonezone: '请检查您输入的电话区号',
		_phonecode: '请检查您输入的电话号码',
		_phoneext: '请检查您输入的电话分机号码',
		_zipcode: '请检查您输入的邮政编码',
		_idnumber: '请检查您输入的身份证号码，目前只支持15位或者18位',
		_bankcard: '请检查您输入的银行账号',
		_cnname: '请检查您输入的姓名',
		_vcode: '请检查您输入的验证码',
		_imgfile: '请检查您选择的图片文件路径，只支持jpg、jpeg、png、gif、tif、bmp格式',
		_regexp: '请检查您的输入',
		_magic: '请检查您的输入',
		_req_text: '请填写{$0}',
		_req_select: '请选择{$0}',
		_req_file: '请上传{$0}',
		_logicrequired: '{$0}输入不完整',
		/** 
		 * 根据msgKey获取提示信息。
		 * @method getMsg
		 * @static
		 * @param {Element} el 表单元素
		 * @param {string} msgKey msgKey.
		 * @return {string}  
		 */
		getMsg: function(el, msgKey) {
			return getAttr2(el, msgKey) || getAttr2(el, 'errmsg') || Msgs[msgKey] || msgKey;
		}
	};

	/**
	 * @class Utils 一些跟valid相关的函数.
	 * @class singleton
	 * @namespace QW.Valid
	 */

	var Utils = Valid.Utils = {
		/** 
		 * 获取日历按钮小图片。
		 * @method getCalendarImg
		 * @static
		 * @return {Element}  
		 */
		getCalendarImg: (function() {
			var calendarImg = null;
			return function() {
				return calendarImg = calendarImg || createElement('<img src="https://p.ssl.qhimg.com/t01afe970af5f13ae93.gif" align="absMiddle" class="calendar-hdl-img" style="cursor:pointer">');
			};
		}()),
		/** 
		 * 用日历浮动层来输入一个日期。
		 * @method pickDate
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		pickDate: function(el) {
			if (QW.Calendar) {
				QW.Calendar.pickDate(el);
			} else {
				var calendarJsUrl = Valid.validPath + "calendar.js?v={version}"; //to get the calendarUrl Url.
				loadJs(calendarJsUrl, function() {
					QW.Calendar.pickDate(el);
				});
			}
		},
		/** 
		 * 对一个输入框设值。For IE: To keep Undo after change value.
		 * @method setTextValue
		 * @static
		 * @param {Element} el 表单元素
		 * @param {string} value value
		 * @return {void}  
		 */
		setTextValue: function(el, value) {// For IE: To keep Undo after change value.
			if (el.createTextRange) el.createTextRange().text = value;
			else el.value = value;
		},
		/** 
		 * trim一个输入框里的值.
		 * @method trimTextValue
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		trimTextValue: function(el) {
			var s = trim(el.value);
			if (s != el.value) Utils.setTextValue(el, s);
		},
		/** 
		 * 把一个text的值里的全码字符转成半码字符
		 * @method dbc2sbcValue
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		dbc2sbcValue: function(el) {
			var s = dbc2sbc(getValue(el));
			if (s != getValue(el)) Utils.setTextValue(el, s);
		},
		/** 
		 * datatype验证之,做的准备工作
		 * @method prepare4Vld
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		prepare4Vld: function(el) {
			if (getAttr2(el,"ignoredbc")) Utils.dbc2sbcValue(el);
			if (el.type == "text" || el.type == "textarea") Utils.trimTextValue(el); //这个会导致如果用户想用空格排版的话，第一行的排版有误
		}
	};

	/**
	 * @class Validators 校验函数的集合.
	 * @singleton
	 * @namespace QW.Valid
	 */
	var Validators = Valid.Validators = {};
	mix(Validators, [{
		/** 
		 * 非空校验
		 * @method required
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		required: function(el, renderResult) {
			Utils.prepare4Vld(el);
			var reqAttr = Valid._curReqAttr || Valid.REQ_ATTR;
			var sReq = getAttr2(el, reqAttr);
			if (sReq) {//如果有reqMsg属性，则表示为非空
				var reqlogic = getAttr2(el, "reqlogic");
				if (reqlogic) {//非空逻辑验证
					return Validators.logicrequired(el, renderResult, reqlogic);
				} else {
					var isOk = false;
					var msgKey = "_req_text";
					if (el.tagName == "SELECT") {
						isOk = (el.value != "" || el.length < 2 || (el.length == 2 && el.options[1].value == ""));
						msgKey = "_req_select";
					} else if (el.type == "checkbox" || el.type == "radio") {
						var els = document.getElementsByName(el.name);
						for (var i = 0; i < els.length; i++) {
							if (isOk = els[i].checked) break;
						}
						msgKey = "_req_select";
					} else {
						isOk = (getValue(el) != "");
						if (el.type == "file") msgKey = "_req_file";
					}
					if (renderResult != false) Valid.renderResult(el, isOk, !isOk && sReq.indexOf(" ") == 0 ? sReq.substr(1) : tmpl(Msgs[msgKey], [sReq])); //潜规则：如果reqmsg是以空格开头，则尊重其内容
					return isOk;
				}

			}
			return true;
		},
		/** 
		 * 类型校验，校验一个元素的输入是否合法
		 * @method datatype
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} datatype 数据类型
		 * @return {boolean}  
		 */
		datatype: function(el, renderResult, datatype) {
			datatype = datatype || getAttr2(el, 'datatype');
			if (!datatype) {
				Valid.pass(el, renderResult);
				return true;
			}
			var dt = datatype.split('-')[0].toLowerCase(),
				pattern = datatype.substr(dt.length + 1),
				cb = Validators[dt];
			if (!cb) throw 'Unknown datatype: ' + datatype; //找不到对应的datatype，则抛异常
			return pattern ? cb(el, renderResult, pattern) : cb(el, renderResult);
		},
		/** 
		 * 数值校验
		 * @method n
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} pattern 数值格式，如'7','7.2'
		 * @return {boolean}  
		 */
		n: function(el, renderResult, pattern) {
			Utils.prepare4Vld(el);
			Utils.dbc2sbcValue(el);
			var val = getValue(el);
			var isOk = (val == "");
			var msg = null;

			if (!isOk) {
				var patternArr = (pattern || getAttr2(el, 'n-pattern') || '10').split('.');
				var len = patternArr[0] | 0 || 10,
					precision = patternArr[1] | 0;
				if (precision < 1) {
					if ((/\D/).test(val) || val.length > len) msg = tmpl(Msgs.getMsg(el, "n_integer"), [1 + new Array(len + 1).join("0")]);
				} else {
					var s = "^\\d{1,100}(\\.\\d{1," + precision + "})?$";
					if (!(new RegExp(s)).test(val)) msg = tmpl(Msgs.getMsg(el, "n_format"), [(new Array(len - precision + 1)).join("X") + "." + (new Array(precision + 1)).join("X")]);
				}
				if ((/^0\d/).test(val)) {
					val = val.replace(/^0+/g, '');
					W(el).val(val);
					//msg = Msgs.getMsg(el, "n_useless_zero");
				}
				if (!msg) {
					var maxV = getAttr2(el, "maxValue") || Math.pow(10, len-precision)-Math.pow(10, -precision);
					if (maxV && (parseFloat(val, 10) > maxV - 0)) {
						msg = tmpl(Msgs.getMsg(el, "n_upper"), [maxV, val]);
					}
					var minV = getAttr2(el, "minValue");
					if (minV && parseFloat(val, 10) < minV - 0) {
						msg = tmpl(Msgs.getMsg(el, "n_lower"), [minV, val]);
					}
				}
				if (msg) isOk = false;
				else isOk = true;
			}
			if (renderResult != false) Valid.renderResult(el, isOk, msg);
			return isOk;
		},

		/** 
		 * 数值范围校验
		 * @method nrange
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} pattern 数值格式，如'7','7.2'
		 * @return {boolean}  
		 */
		nrange: function(el, renderResult, pattern) {
			var isOk = Validators.n(el, renderResult, pattern);
			if (isOk) {
				var fromNEl = g(getAttr2(el, 'fromNEl'));
				var toNEl = g(getAttr2(el, 'toNEl'));
				if (fromNEl) {
					toNEl = el;
				} else if (toNEl) {
					fromNEl = el;
				} else { //默认在同一个容器里的两个input为一组起止时间
					var els = el.parentNode.getElementsByTagName("input");
					if (els[0] == el) {
						fromNEl = el;
						toNEl = els[1];
					} else {
						fromNEl = els[0];
						toNEl = el;
					}
				}
				var relEl = el == fromNEl ? toNEl : fromNEl;
				var isOk2 = Validators.n(relEl, renderResult, pattern);
				if (isOk2) {
					if (getValue(relEl) && getValue(el)) {
						if (getValue(fromNEl) * 1 > getValue(toNEl) * 1) {
							isOk = false;
							if (el == fromNEl) Valid.fail(fromNEl, Msgs.getMsg(fromNEl, "nrange_from"));
							if (el == toNEl) Valid.fail(toNEl, Msgs.getMsg(toNEl, "nrange_to"));
						}
					}
				}
			}
			return isOk;
		},


		/** 
		 * 日期校验
		 * @method d
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		d: function(el, renderResult) {
			Utils.prepare4Vld(el);
			Utils.dbc2sbcValue(el);
			var val = getValue(el);
			var isOk = (val == "");
			var msg = null;
			if (!isOk) {
				val = val.replace(/(^\D+)|(\D+$)/g, "").replace(/\D+/g, "/");
				if (!(/\D/).test(val)) {
					if (val.length == 8) val = val.substr(0, 4) + "/" + val.substr(4, 2) + "/" + val.substr(6, 2);
				}
				var tempD = new Date(val);
				if (!isNaN(tempD)) {
					var nStrs = val.split(/\D+/ig);
					if (nStrs.length == 3 && nStrs[0].length == 4 && nStrs[2].length < 3) { //日期格式只限制为YYYY/MM/DD,以下格式不合法：MM/DD/YYYY
						isOk = true;
						if (formatDate(tempD) != getValue(el)) {
							Utils.setTextValue(el, formatDate(tempD));
							val = getValue(el);
						}
					}
				}
				if (!isOk) {
					msg = Msgs.getMsg(el, "d_format");
				} else {
					var maxV = getAttr2(el,"maxValue") || "2049-12-31";
					if (tempD > new Date(maxV.replace(/\D+/g, "/"))) {
						isOk = false;
						msg = tmpl(Msgs.getMsg(el, "d_upper"), [maxV, val]);
					}
					var minV = getAttr2(el,"minValue") || "1900-01-01";
					if (tempD < new Date(minV.replace(/\D+/g, "/"))) {
						isOk = false;
						msg = tmpl(Msgs.getMsg(el, "d_lower"), [minV, val]);
					}
				}
			}
			if (renderResult != false) Valid.renderResult(el, isOk, msg);
			return isOk;
		},
		/** 
		 * 日期范围校验
		 * @method daterange
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		daterange: function(el, renderResult) {
			var isOk = Validators.d(el, renderResult);
			if (isOk) {
				var fromDateEl = g(getAttr2(el, 'fromDateEl'));
				var toDateEl = g(getAttr2(el, 'toDateEl'));
				if (fromDateEl) {
					toDateEl = el;
				} else if (toDateEl) {
					fromDateEl = el;
				} else { //默认在同一个容器里的两个input为一组起止时间
					var els = el.parentNode.getElementsByTagName("input");
					if (els[0] == el) {
						fromDateEl = el;
						toDateEl = els[1];
					} else {
						fromDateEl = els[0];
						toDateEl = el;
					}
				}
				var relEl = el == fromDateEl ? toDateEl : fromDateEl;
				var isOk2 = Validators.d(relEl, renderResult);
				if (isOk2) {
					if (getValue(relEl) && getValue(el)) {
						if (getValue(fromDateEl) > getValue(toDateEl)) {
							isOk = false;
							if (el == fromDateEl) Valid.fail(fromDateEl, Msgs.getMsg(fromDateEl, "daterange_from"));
							if (el == toDateEl) Valid.fail(toDateEl, Msgs.getMsg(toDateEl, "daterange_to"));
						}
						if (getValue(fromDateEl) && getValue(toDateEl)) {
							var maxDateSpan = getAttr2(fromDateEl, 'maxDateSpan') || getAttr2(toDateEl, 'maxDateSpan'); //时间跨度
							if (maxDateSpan && (new Date(getValue(toDateEl).replace(/-/g, '/')) - new Date(getValue(fromDateEl).replace(/-/g, '/'))) > (maxDateSpan - 1) * 24 * 3600000) {
								Valid.fail(el, tmpl(Msgs.getMsg(el, "daterange_larger_span"), [maxDateSpan]));
								isOk = false;
							}
						}

					}
				}
			}
			return isOk;
		},

		/** 
		 * 字符串长度校验
		 * @method _checkLength
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {function} getLengthFun 字符串长度计算函数
		 * @param {string} dataType 数据类型，如：text/bytetext/richtext
		 * @return {boolean}  
		 */
		_checkLength: function(el, renderResult, getLengthFun, dataType) {
			Utils.prepare4Vld(el);
			var val = getValue(el);
			var isOk = (val == "");
			var msg = null;
			if (!isOk) {
				var maxLen = (getAttr2(el, "maxLength") || 1024) | 0;
				var minLen = getAttr2(el, "minLength")  | 0;
				var curLen = getLengthFun(el);
				if (curLen > maxLen) {
					msg = tmpl(Msgs.getMsg(el, "text_longer") || Msgs[dataType + "_longer"], [maxLen, curLen]);
				} else if (curLen < minLen) {
					msg = tmpl(Msgs.getMsg(el, "text_shorter") || Msgs[dataType + "_shorter"], [minLen, curLen]);
				} else {
					isOk = true;
				}
			}
			if (renderResult != false) Valid.renderResult(el, isOk, msg);
			return isOk;
		},

		/** 
		 * 文本长度验证
		 * @method text
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		text: function(el, renderResult) {
			return Validators._checkLength(el || this, renderResult, function(a) {
				return getValue(a).length;
			}, "text");
		},

		/** 
		 * 字节长度验证
		 * @method bytetext
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		bytetext: function(el, renderResult) {
			return Validators._checkLength(el || this, renderResult, function(a) {
				return byteLen(getValue(a));
			}, "text");
		},

		/** 
		 * 富文本长度验证
		 * @method richtext
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		richtext: function(el, renderResult) {
			return Validators._checkLength(el || this, renderResult, function(a) {
				var s = getValue(a);
				if (getAttr2(a,"ignoreTag")) return s.replace(/<img[^>]*>/g, "a").replace(/<[^>]*>/g, "").length;
				else return s.length;
			}, "richtext");
		},
		/** 
		 * 身份证号码验证
		 * @method idnumber
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		idnumber: function(el, renderResult) {
			Utils.prepare4Vld(el);
			Utils.dbc2sbcValue(el);
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				if ((/^\d{15}$/).test(val)) {
					isOk = true; 
				} else if ((/^\d{17}[0-9xX]$/).test(val)) {
					var vs = "1,0,x,9,8,7,6,5,4,3,2".split(","),
						ps = "7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2".split(","),
						ss = val.toLowerCase().split(""),
						r = 0;
					for (var i = 0; i < 17; i++) {
						r += ps[i] * ss[i];
					}
					isOk = (vs[r % 11] == ss[17]);
				}
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_idnumber"));
			return isOk;
		},
		/** 
		 * 中文姓名验证
		 * @method cnname
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		cnname: function(el, renderResult) {
			Utils.prepare4Vld(el);
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				isOk = byteLen(val) <= 32 && /^[\u4e00-\u9fa5a-zA-Z.\u3002\u2022]{2,32}$/.test(val);

			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_cnname"));
			return isOk;
		},

		/** 
		 * “再次输入”验证
		 * @method reconfirm
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		reconfirm: function(el, renderResult) {
			Utils.prepare4Vld(el);
			var oriEl = g(getAttr2(el, "reconfirmFor"));
			var isOk = (getValue(el) == getValue(oriEl));
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_reconfirm"));
			return isOk;
		},

		/** 
		 * 图片文件验证
		 * @method imgfile
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		imgfile: function(el, renderResult) {
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				var fExt = val.substring(val.lastIndexOf(".") + 1);
				isOk = (/^(jpg|jpeg|png|gif|tif|bmp)$/i).test(fExt);
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_imgfile"));
			return isOk;
		},

		/** 
		 * 正则表达式验证
		 * @method reg
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		reg: function(el, renderResult, pattern, msg, ignoreDBC) {
			if (ignoreDBC) Utils.dbc2sbcValue(el);
			Utils.prepare4Vld(el);
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				msg = msg || "_regexp";
				pattern = pattern || getAttr2(el, "reg-pattern");
				if ('string' == typeof pattern) {
					pattern.replace(/^\/(.*)\/([mig]*)$/g, function(a, b, c) {
						pattern = new RegExp(b, c || '');
					});
				}
				isOk = pattern.test(val);
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, msg));
			return isOk;
		},

		/** 
		 * 复合datatype验证
		 * @method magic
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} pattern 复合datatype表达式，如 "mobile || phone"
		 * @return {boolean}  
		 */
		magic: function(el, renderResult, pattern) {
			Utils.prepare4Vld(el);
			pattern = pattern || getAttr2(el, 'magic-pattern');
			var isOk = (getValue(el) == "" || !pattern);
			if (!isOk) {
				var opts = {
					el: el,
					Validators: Validators
				};
				var sJs = pattern.replace(/(\w+)/ig, 'opts.Validators.datatype(opts.el,false,"$1")'); //注意：如果是用户输入的dataType，这里有可能会注入。----to be fixed
				isOk = evalExp(sJs, opts);
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, '_magic'));
			return isOk;
		},

		/** 
		 * 自定义datatype验证
		 * @method uv
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		uv: function(el, renderResult) {
			if (el.onblur && !el.onblur()) return false;
			return true;
		},
		/** 
		 * 简单非空验证
		 * @method notempty
		 * @static
		 * @param {Element} el 表单元素
		 * @return {boolean}  
		 */
		notempty: function(el) {
			Utils.prepare4Vld(el);
			return !!getValue(el);
		},
		/** 
		 * 复合required验证
		 * @method magic
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} reqlogic 复合required表达式
		 * @return {boolean}  
		 */
		logicrequired: function(el, renderResult, reqlogic) {
			el = el || this;
			reqlogic = reqlogic || getAttr2(el, "reqlogic");
			var reqAttr = Valid._curReqAttr || Valid.REQATTR,
				sReq = getAttr2(el, reqAttr),
				opts = {
					el: el,
					Validators: Validators
				},
				sJs = reqlogic.replace(/\$([\w\-]+)/ig, 'opts.Validators.notempty(NodeH.g("$1"))').replace(/this/ig, "opts.Validators.notempty(opts.el)"); //注意：如果是用户输入的dataType，这里有可能会注入。----to be fixed
			var isOk = evalExp(sJs, opts);
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && sReq.indexOf(" ") == 0 ? sReq.substr(1) : tmpl(Msgs["_logicrequired"], [sReq]));
			return !!isOk;
		}
	}, {
		/** 
		 * 时间验证
		 * @method magic
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		time: function(el, renderResult) {
			return Validators.reg(el, renderResult, /^(([0-1]\d)|(2[0-3])):[0-5]\d:[0-5]\d$/, "_time", true);
		},
		//时间
		/** 
		 * 时间验证
		 * @method minute
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		minute: function(el, renderResult) {
			return Validators.reg(el, renderResult, /^(([0-1]\d)|(2[0-3])):[0-5]\d$/, "_minute", true);
		},
		//分钟
		/** 
		 * 电子邮件
		 * @method email
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		email: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, "_email", true);
		},
		/** 
		 * 手机号
		 * @method mobilecode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		mobilecode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^(13|15|18|14)\d{9}$/, "_mobilecode", true);
		},
		/** 
		 * 含区号电话号码
		 * @method phone
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phone: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)[1-9]\d{6,7}$/, "_phone", true);
		},
		//不带分机的电话号
		/** 
		 * 含区号电话号码
		 * @method phone
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phonewithext: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)[1-9]\d{6,7}(-\d{1,7})?$/, "_phonewithext", true);
		},
		//带分机的电话号
		/** 
		 * 电话区号
		 * @method phonezone
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phonezone: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)$/, "_phonezone", true);
		},
		/** 
		 * 电话号码
		 * @method phonecode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phonecode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^[1-9]\d{6,7}$/, "_phonecode", true);
		},
		/** 
		 * 分机号
		 * @method phoneext
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phoneext: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^\d{1,6}$/, "_phoneext", true);
		},
		/** 
		 * 邮编
		 * @method zipcode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		zipcode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^\d{6}$/, "_zipcode", true);
		},
		/** 
		 * 邮编
		 * @method vcode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		vcode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^\w{4}$/, "_vcode", true);
		}
	}]);

	QW.provide('Valid', Valid);

}());




//----valid_youa.js
/**	
 * @class Valid Valid form验证
 * @namespace QW
 * @singleton 
 */
(function() {
	var Valid = QW.Valid,
		Validators = Valid.Validators,
		NodeH = QW.NodeH,
		g = NodeH.g,
		getAttr2 = function(el, attr) {
			if(!el || !el.getAttribute) return '';
			return el[attr] || el.getAttribute(attr);
		},
		addClass = NodeH.addClass,
		removeClass = NodeH.removeClass,
		replaceClass = NodeH.replaceClass,
		show = NodeH.show,
		hide = NodeH.hide,
		getValue = NodeH.getValue,
		createElement = function(tag, opts) {
			opts = opts || {};
			var el = document.createElement(tag);
			for (var i in opts) el[i] = opts[i];
			return el;
		};
	/*
	 * _getHintEl: 得到hintEl。焦点进入/离开时，toggleClass('hint-dark', 'hint'); 
	 */
	Valid._getHintEl = function(el) {
		var hintEl = getAttr2(el, "hintEl");
		return hintEl && g(hintEl);
	};
	/*
	 * _getPlaceHolderEl: 得到placeHolderEl，即placeHolder效果元素
	 */
	Valid._getPlaceHolderEl = function(el) {
		var hintEl = getAttr2(el, "placeHolderEl");
		return hintEl && g(hintEl);
	};
	/*
	 * _getEmEl: 得到提示em。查找规则：优先查找emEl属性，再次之查找四个nextSibling以内的em，再次之查找parentNode的四个nextSibling以内的em
	 */
	Valid._getEmEl = function(el) {
		var em = getAttr2(el, "emEl");
		if (em) return g(em);
		var refEls = [el, el.parentNode];
		for (var i = 0; i < 2; i++) {
			var tempEl = refEls[i];
			for (var j = 0; j < 5; j++) {
				tempEl = tempEl.nextSibling;
				if (!tempEl) break;
				if (tempEl.tagName == "EM") return tempEl;
			}
		}
		return null;
	};
	/*
	 * _getErrEmEl: 根据正确em,找到错误em,找不到就返回null.
	 */
	Valid._getErrEmEl = function(okEm, autoCreate) {
		var errEm = okEm.nextSibling;
		if (errEm) {
			if (errEm.tagName == "EM" || !errEm.tagName && (errEm = errEm.nextSibling) && errEm.tagName == "EM") return errEm;
		}
		if (!autoCreate) return null;
		errEm = createElement('em', {
			className: 'error'
		});
		okEm.parentNode.insertBefore(errEm, okEm.nextSibling);
		return errEm;
	};


	Valid.onhint = function(ce) {
		var el = ce.target;
		if (!el || 'INPUT,TEXTAREA,SELECT,BUTTON'.indexOf(el.tagName) == -1) return; //IE下，onfocusin会在div等元素触发 
		var hintEl = Valid._getHintEl(el),
			placeHolderEl = Valid._getPlaceHolderEl(el);
		hintEl && replaceClass(hintEl, 'hint-dark', 'hint');
		if (placeHolderEl) {
			clearTimeout(el.__placeholderTimer || 0);
			addClass(placeHolderEl, 'placeholder-dark');
		}
		if (!Validators.required(el, false) && !getValue(el)) return; //如果存在空提示，则进入焦点时不隐藏提示
		if (!Validators.datatype(el, false)) Validators.datatype(el, true); //只有不通过datatype验证时，才需要在焦点进入时验证
	};
	Valid.onblur = function(ce) {
		var el = ce.target;
		if (!el || 'INPUT,TEXTAREA,SELECT,BUTTON'.indexOf(el.tagName) == -1) return; //IE下，onfocusin会在div等元素触发 
		var hintEl = Valid._getHintEl(el),
			placeHolderEl = Valid._getPlaceHolderEl(el);
		hintEl && replaceClass(hintEl, 'hint', 'hint-dark');
		Validators.datatype(el, true); //离开时只作datatype校验
		if (placeHolderEl) {
			(getValue(el) ? addClass : removeClass)(placeHolderEl, 'placeholder-dark');
			clearTimeout(el.__placeholderTimer || 0);
			el.__placeholderTimer = setTimeout(function() { //在360浏览器下，autocomplete会先blur之后N百毫秒之后再change
				(getValue(el) ? addClass : removeClass)(placeHolderEl, 'placeholder-dark');
			}, 600);
		}
	};
	Valid.onpass = function(ce) {
		var el = ce.target,
			okEm = Valid._getEmEl(el);
		removeClass(el, "error");
		if (okEm) {
			if ((okEm.__vld_fail_stamp | 0) != Valid.checkAll_stamp)  {//需要render
				show(okEm);
				var errEmEl = Valid._getErrEmEl(okEm);
				errEmEl && hide(errEmEl);
			}
		}
	};
	Valid.onfail = function(ce) {
		var el = ce.target,
			errMsg = ce.errMsg;
		addClass(el, "error");
		el.__vld_errMsg = errMsg;
		var okEm = Valid._getEmEl(el);
		if (okEm) {
			if ((okEm.__vld_fail_stamp | 0) != Valid.checkAll_stamp) { //需要render
				hide(okEm);
				var errEm = Valid._getErrEmEl(okEm, true);
				errEm.innerHTML = errMsg;
				show(errEm);
			}
			if (Valid.isChecking) {
				okEm.__vld_fail_stamp = Valid.checkAll_stamp;
			}
		}
	};

	var placeHolder_idx = 10000;
	Valid.oninitall = function(ce) {
		setTimeout(function() { //稍稍延时一下
			if('placeholder' in document.createElement('input')){ //如果浏览器原生支持placeholder
				return ;
			}
			QW.NodeW('input,textarea', ce.target).forEach(function(el) {
				var placeholder = getAttr2(el,'placeholder'),
					placeHolderEl = Valid._getPlaceHolderEl(el);
				if (placeholder && !placeHolderEl) {
					var placeHolderElId = 'placeHolder-' + placeHolder_idx++;
					placeHolderEl = createElement('span', {
						id: placeHolderElId,
						innerHTML: placeholder,
						className: 'placeholder'
					});
					placeHolderEl.onclick = function() {
						try {
							el.focus();
						} catch (ex) {}
					};
					el.parentNode.insertBefore(placeHolderEl, el);
					el.setAttribute('placeHolderEl', placeHolderElId);
				}
				if (placeHolderEl) {
					if ((getValue(el) || '').trim() || el==document.activeElement) {
						addClass(placeHolderEl, 'placeholder-dark');
					} else {
						removeClass(placeHolderEl, 'placeholder-dark');
					}
				}
			});
		}, 10);
	};
	/**
	 *绑定电话区号/电话号码/分机号/手机号
	 * @method bindPhoneEls
	 * @param {Json} opts - 绑定group Json.目前支持以下属性
	 ids:['telN1','telN2','telN3']	//数组id，依次为:电话区号／电话号码／分机号，也可以有四个元素，第四个元素为手机号
	 reqMsgs:[' 请输入电话区号。','请输入电话号码。','',' 电话号码与手机至少填写一项。']		//----必须输入时的提示信息
	 * @return {void} 
	 */
	Valid.bindPhoneEls = function(opts) {
		var dataTypes = ['phonezone', 'phonecode', 'phoneext', 'mobilecode'],
			maxLengths = [4, 8, 4, 11],
			defaultReqMsgs = [' 请输入电话区号。', ' 请输入电话号码。', '', ' 电话号码与手机至少填写一项。'],
			reqMsgs = opts.reqMsgs || defaultReqMsgs,
			ids = opts.ids;
		for (var i = 0; i < ids.length; i++) {
			QW.NodeW.g(ids[i]).attr('reqMsg', reqMsgs[i] || defaultReqMsgs[i]).attr('dataType', dataTypes[i]).set('maxLength', maxLengths[i]);
		}
		g(ids[0]).setAttribute('reqlogic', '(!$' + ids[1] + ' && !$' + ids[2] + ') || $' + ids[0]);
		g(ids[1]).setAttribute('reqlogic', '(!$' + ids[0] + ' && !$' + ids[2] + ') || $' + ids[1]);
		if (ids.length == 4) {
			g(ids[3]).setAttribute('reqlogic', '$' + ids[0] + ' || $' + ids[1] + '|| $' + ids[2] + '|| $' + ids[3]);
		}
	};

	QW.DomU.ready(function() {
		Valid.initAll();
	});
}());


;/**import from `/resource/js/component/placeholder.js` **/
(function(){

	function PlaceHolder(){

		this.init.apply(this,arguments);
	}

	PlaceHolder.prototype = (function(){

		return {

			init:function(element){

				var instance = this;
				CustEvent.createEvents(this);

				var _placeholder = '';
					this.element = W(element);

				if(instance.element && !("placeholder" in document.createElement("input")) && 
					(_placeholder = instance.element.attr("placeholder"))){

			        var eleLabel = W('<label for="'+this.element.attr('id')+'"></label>').addClass('ele4phtips')[0];
			        
			        //插入创建的label元素节点
			        instance.element.parentNode().insertBefore(eleLabel, instance.element[0]);
			        
			        //方法
			        var funOpacity = function(ele, opacity) {
				            if (ele.style.opacity) {
				                ele.style.opacity = opacity / 100;
				            } else {
				                ele.style.filter = "Alpha(opacity="+ opacity +")";    
				            }
				        }, 
				        opacityLabel = function() {
				            if (!instance.element.val()) {
				                funOpacity(eleLabel, 0);
				                eleLabel.innerHTML = _placeholder;
				            } else {
				                eleLabel.innerHTML = "";    
				            }
				        };
			        
			        instance.element
			        	.on('keyup',function(){
			        		opacityLabel(); 
			        	})
			        	.on('focus',function(){
			        		opacityLabel();
			        	})
			        	.on('blur',function(){
			        		if (!instance.element.val()) {
			                funOpacity(eleLabel, 100);
			                eleLabel.innerHTML = _placeholder;  
			            }
			        	})
			        
			        //样式初始化
			        if (!instance.element.val()) { eleLabel.innerHTML = _placeholder; }

				}

			}
		}

	}());

	QW.provide({'PlaceHolder':PlaceHolder});

}())

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




;/**import from `/resource/js/page/client.firm.js` **/
var firmOrder = firmOrder || (function(){
	var dataListCache = {};

	function init(){
		bindEvent();

		initDoIt();
	}

	/**
	 * 购买结果确认弹窗
	 * @return {[type]} [description]
	 */
	function buyRsConfirm( params, callback ){
		var html = '<dl class="pay-tip clearfix"><dt><span class="tipsico"></span></dt><dd>请您在新打开的网上银行页面进行付款，付款完成前不要关闭该窗口。</dd><dd class="tip-error"></dd></dl>';
		var panel = tcb.panel("360安全支付", html, {
                wrapId: "payLayer",
                width: 400,
                btn: [{
                    txt: "已完成支付",
                    fn: function(){
                    	if(params){
	                        QW.Ajax.post('/aj/get_firmorder_status/', params, function(data){
	                        	var errBox = W(panel.oBody).one('.tip-error');
	                        	data = QW.JSON.parse(data);
	                        	if(data.errno == 0){ //支付成功
	                        		errBox.html('');
	                        		callback && typeof(callback)=='function' && callback();
	                        	}else{ // 支付失败
	                        		errBox.html('暂未收到您的款项，请确认付款后再点击。');
	                        	}
	                        });
		                }else{
		                	callback && typeof(callback)=='function' && callback();
		                }
                    }
                },{
                    txt: "支付遇到问题",
                    fn: function(){
                        location.reload();
                    }
                }]
            });
	}

	/**
	 * 选择城市
	 * @return {[type]} [description]
	 */
	function selectCity(selector){

		if(!W(selector).length) return false;

	    var cityPanel = new CityPanel(selector);

	    cityPanel.on('close', function(e) {

	    });

	    cityPanel.on('selectCity', function(e) {
	        city = e.city.trim();

	        var city_name = e.name.trim();

	        W(selector).attr('data-citycode', city);
	        W(selector).one('.city-name').html( city_name );

	        try{ W('#saleComboForm [name="citycode"]').val(city); }catch(ex){}

	        //location.href ="http://" +location.host +"/at/?" + city;
	    });
	}

	//url='/mer_info/jifenmingxi/?flag=1&tab=0&pagesize=10&pn=#{pn}';
	function getAjaxData(showBox, url, pn, isCreatePager, isFamily){
		pn = pn || 0;
		var pagesize = 20;
		var reqUrl = url.replace(/(#\{pn\})/, pn).replace(/(#\{pagesize\})/, pagesize),
			reqParams = reqUrl.split('?')[1];
		showBox = W(showBox);

		if( dataListCache && dataListCache[ encodeURIComponent(reqParams) ] ){
			var c_data = dataListCache[ encodeURIComponent(reqParams) ];

			var func = isFamily ? W('#fmServiceCodeTpl').html().trim().tmpl() : W('#serviceCodeTpl').html().trim().tmpl();
			var html = func( c_data );
			showBox.html( html );

		}else{
			QW.Ajax.get(reqUrl, function(data){
				data = JSON.parse(data);

				var c_data = data.result;

				if(c_data.total == 0){
					showBox.html('<div style="text-align:center; font-size:14px; padding:10px;">暂无记录</div>');
				}else{
					var func = isFamily ? W('#fmServiceCodeTpl').html().trim().tmpl() : W('#serviceCodeTpl').html().trim().tmpl();
					var html = func( c_data );
					showBox.html( html );

					isCreatePager && showPager( Math.ceil( c_data.total/pagesize), W(showBox).siblings('.pagination') , function(c_pn){
						getAjaxData(showBox, url, c_pn);
					});

					dataListCache[ encodeURIComponent(reqParams) ] = c_data;
				}
			});
		}
	}

	/**
	 * 分页
	 * @return {[type]} [description]
	 */
	function showPager(pagenum, box, callback){

		box = W(box);

		if(pagenum==1){
			box.one('.pages').hide().html('');
			return;
		}

		box.one('.pages').show();

		var pn = 0;
	    var pager = new Pager(box.one('.pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
 			callback && callback(e.pn);
	    });
	}

	//申请上门服务
	function requestShangmenService(code){
		tcbShangmenService.show(code);
	}

	//客户端版本比较
	function campareVersion(dest, src){
		if( dest == src ){return true;}

		var destarr = dest.split(/\./g),
			srcarr = src.split(/\./g);

		var rs;

		for(var i=0, n=destarr.length; i<n; i++){
			if( destarr[i] - srcarr[i] > 0 ){
				return true;
			}else if( destarr[i] - srcarr[i] < 0 ){
				return false;
			}else{
				continue;
			}
		}

	}


	function bindEvent(){
		//申请远程服务
		W('body').delegate('.remote-service-trigger', 'click', function(e){
			e.preventDefault();
			var code = W(this).attr('data-code')||'';
			try{
				window.external.request_remote_service( code );
			}catch(ex){
				try{
					var jsobj;

				    if(QW.Browser.ie){
				        jsobj = W('#jishiieplugin')[0];
				    }else{
				        jsobj = W('#jishichromeplugin')[0];
				    }

				    try{
				    	var v = jsobj.GetVersion();
				    	var rs = campareVersion(v, "1.0.0.2");

				    	if(!rs){
				    		alert('请先安装专业工具。\n如已安装，请重启浏览器，重新打开本页面再点击。');
				        	window.open('http://jishi.360.cn/360ExpertPlugin.exe');
				    	}else if(jsobj.IsNeedUpdate()){
				    		alert('您需要下载最新版本的360安全卫士才能使用此功能。');
				    		window.open('http://down.360safe.com/inst.exe');
				    	}else{
				        	jsobj.RunClient('/locatefirm='+(code||'yes'));
				        }
				    }catch(ex){
				        alert('请先安装专业工具。\n如已安装，请重启浏览器，重新打开本页面再点击。');
				        window.open('http://jishi.360.cn/360ExpertPlugin.exe');

				    }
				}catch(ex){

				}
			}

		});

		//申请上门服务
		W('body').delegate('.shangmen-service-trigger', 'click', function(e){
			e.preventDefault();
			var code = W(this).attr('data-code')||'';
			try{
				requestShangmenService( code );
			}catch(ex){

			}

		});

		//tab1
		W('#taocanTypes').delegate('li', 'click', function(e) {
			if(W(this).hasClass('on')){return false;}
			W(this).siblings('.on').removeClass('on');
			W(this).addClass('on');
			var rel = W(this).attr('data-rel');
			W('.c-packet-item').hide();
			W('.c-packet-item[data-for="'+rel+'"]').show();
		});

		//tab2
		W('#introTab').delegate('li', 'click', function(e) {
			if(W(this).hasClass('on')){return false;}
			W(this).siblings('.on').removeClass('on');
			W(this).addClass('on');
			var rel = W(this).attr('data-rel');
			W('.i-packet-item').hide();
			W('.i-packet-item[data-for="'+rel+'"]').show();
			W('#introTab')[0].scrollIntoView();
		});

		//企业规模
		W('.comp-size-item').on('click', function(e){
			W(this).siblings('.prd-selected').removeClass('prd-selected');
			W(this).addClass('prd-selected');
			var rel = W(this).attr('data-rel');
			W('.taocan-item').hide();
			W('.taocan-item[data-for="'+rel+'"]').show();
		});

		//套餐单选
		W('.taocan-radio').on('click', function(e){
			var prices = W(this).attr('data-prices').split(/\|/g);
			W('.price-detail .sel-price-info').show();
			W('.price-detail .buy-error').hide();
			W('.price-detail .sel-price-info .price-orig').html( prices[0] );
			W('.price-detail .sel-price-info .price-real').html( prices[1] );
			W('.price-detail .sel-price-info .price-off').html( prices[2] );
		});

		//服务包选择
		W('.fuwubao-item').on('click', function(e){
			W(this).siblings('.prd-selected').removeClass('prd-selected');
			W(this).addClass('prd-selected');
			var rel = W(this).attr('data-rel');
			W('.buy-num-item').hide();
			W('.buy-num-item[data-for="'+rel+'"]').show();

			if( rel == 5){
				W('.shangmen-city').show();
			}else{
				W('.shangmen-city').hide();
			}
		});

		//服务包次数选择
		W('.buy-num-item').on('click', function(e){
			W(this).siblings('.prd-selected').removeClass('prd-selected');
			W(this).addClass('prd-selected');

			var prices = W(this).attr('data-prices').split(/\|/g);
			W('.price-detail-f .sel-price-info').show();
			W('.price-detail-f .buy-error').hide();
			W('.price-detail-f .sel-price-info .price-orig').html( prices[0] );
			W('.price-detail-f .sel-price-info .price-real').html( prices[1] );
			W('.price-detail-f .sel-price-info .price-off').html( prices[2] );
		});


		//第一步套餐购买
		W('#buySelTaocan').on('click', function(e){
			var checkedTaocan = W('.taocan-radio:checked');

			if( checkedTaocan.length==0 ){
				W('.price-detail .buy-error').show();
			}else{
				var url = '/firm/taocan_info/?';
				var params = checkedTaocan.attr('data-taocan');

				window.location.href = url  + 'tctype=1&' + params + (window.__inclient? '&inclient=1' : '');
			}
		});

		//第一步服务包购买
		W('#buySelFuwubao').on('click', function(e){
			var checkedFuwubao = W('.buy-num-item.prd-selected');

			if( checkedFuwubao.length==0 ){
				W('.price-detail-f .buy-error').show();
			}else{
				var url = '/firm/taocan_info/?';
				var params = checkedFuwubao.attr('data-taocan');

				window.location.href = url  + 'tctype=2&' + params + '&citycode=' + W('.city-trigger').attr('data-citycode') + (window.__inclient? '&inclient=1' : '');
			}
		});


		//选择城市
		selectCity( '.city-trigger' );

		//支付方式
		W('#saleComboForm').delegate('.pay-method', 'click', function(e){
			if(W(this).val() == 'wangyin'){
				W('#saleComboForm .bank-box').show();
			}else{
				W('#saleComboForm .bank-box').hide();
			}
		});

		//手机号码输入限制
		W('.wg3-tc-detail-sale-form [name="buyer_mobile"]').on('keyup', function(e){
			if( !/^\d+$/.test(W(this).val()) ){
				W(this).val( W(this).val().replace(/\D+/g, '') );
			}
		});

		//选择服务时长
		W('#taocanTimeSelector').on('change', function(e){
			var month = W(this).val(),
				unitPrice = W('#saleComboForm [name="unit_price"]').val(),
				totalPrice = (unitPrice * month).toFixed(2);

			W('#saleComboForm [name="taocan_price"]').val( totalPrice );
		});

		//提交订单
		W('#saleComboForm').on('submit', function(e){
			e.preventDefault();
			var tel = W(this).one('[name="buyer_mobile"]');
			if( tel.val().trim() == ''){
				tel.shine4Error();
				tel.focus();
				return false;
			}

			if( W('#firmSPCheck:checked').length ==0 ){
				var panel = tcb.alert('提示','<div style="padding:10px">您同意《奇虎360企业IT服务协议》后才能购买该产品</div>',{ width:320, height:120}, function(){ panel.hide();});
				return false;
			}

			var payMethod = W('#saleComboForm .pay-method:checked').val();

			W(this).one('[name="bank_code"]').val( (payMethod == 'wangyin'? W('#backSelector').val() : payMethod) );

			QW.Ajax.post(this, function(data){
				data = QW.JSON.parse(data);
				if(data.errno == 0){
					var orderId = data.result.order_id;

					var payUrl = BASE_ROOT + 'firm/subpay/?torder_id=' + orderId;
					var indexUrl = BASE_ROOT + (window.__inclient? 'firm/client':'firm/taocan');
					var detailUrl = BASE_ROOT + 'firm/detail/?torder_id=' + orderId;
					QW.Cookie.set('otel', tel.val(), {'path':'/', 'domain' : '.bang.360.cn'});

					if(window.__inclient){
						//打款支付页面
						window.open( payUrl );

						buyRsConfirm({'torder_id' : orderId} , function(){
							//打开订单完成详情页
							window.open( detailUrl );
							//回到首页
							window.location.replace(indexUrl);
						} );
					}else{//网页中，跳转到支付页，否则会被拦截
						window.location.href = payUrl;
					}

				}else{
					alert("抱歉，订单提交失败。" + data.errmsg);
				}
			});


			return false;
		});

		//修改企业信息
		W('.modify-com-info').on('click', function(e){
			e.preventDefault();
			W('#companyInfoSpan').hide();
			W('#companyInfoForm').show();
		});

		//取消修改企业信息
		W('.cancle-modify-com').on('click', function(e){
			e.preventDefault();
			W('#companyInfoSpan').show();
			W('#companyInfoForm').hide();
		});

		//修改商家信息
		W('#companyInfoForm').on('submit', function(e){
			e.preventDefault();
			var cname = W(this).one('[name="qiye_name"]'),
				caddr = W(this).one('[name="qiye_addr"]');

			if( cname.val().trim()=='' ){
				cname.shine4Error();
				cname.focus();
				return false;
			}

			if(caddr.val().trim()==''){
				caddr.shine4Error();
				caddr.focus();
				return false;
			}

			QW.Ajax.post(this, function(data){
				data = QW.JSON.parse(data);
				if(data.errno == 0){
					W('#companyInfoSpan .company-name-span').html( cname.val().encode4Html() );
					W('#companyInfoSpan .company-addr-span').html( caddr.val().encode4Html() );

					W('#companyInfoSpan').show();
					W('#companyInfoForm').hide();

					window.location.reload();
				}else{
					alert('抱歉，出错了。' + data.errmsg);
				}
			});
		});

		//同意企业服务协议。
		W('#firmServeProtocol').on('click', function(e){
			e.preventDefault();
			var panel = tcb.alert("奇虎360企业IT服务协议",
				'<iframe frameborder="0" style="width:680px;height:420px;" src="/resource/html/firmserviceprotocal.html"></iframe>',
				{'width':680, 'height':510},
				function(){ panel.hide(); }
            );
		});

		//领吗
		W('.torder-detail .get-new-code').on('click', function(e){
			e.preventDefault();
			var tid = W(this).attr('data-tid');
			QW.Ajax.post('/firm/aj_addservice_code/', { 'torder_id': tid}, function(data){
				data = QW.JSON.parse(data);
				if(data.errno){
					alert("抱歉，出错了。" + data.errmsg);
				}else{
					var wh = window.location.href;
					window.location.href = wh + ( wh.indexOf('?')>-1? '&seeorder=1':'?seeorder=1' ) + '#tokenshangmenlist';
				}
			});
		});

		/*===================家庭码================*/
		//发送家庭码给亲友
		W(document).delegate('.send-fm-service-code','click', function(e){
			e.preventDefault();
			var code = W(this).attr('data-code');
			var url = BASE_ROOT + "family?code=" + code;
			var panel = tcb.alert("发送服务码", '<div class="ui-send-fcode"><p>将下面的链接复制发送给您的家人，点击立享服务</p><textarea>'+url+'</textarea></div>', {
				width:360, height:200, btn_name:'关闭'  }, function(){return true;});

			var textarea = W(panel.oBody).one('textarea');
			textarea.on('mouseover', function(){
				setSelectRange( this, 0, this.value.length );
			});
		});

		//使用服务
		W(document).delegate('.remote-fm-service-trigger','click', function(e){
			e.preventDefault();

			var wMe = W(this);

			var eid = wMe.attr('data-eid'),
				mobile = wMe.attr('data-mobile');
			mobile = mobile ? mobile : '';

			var panel = tcb.alert('使用服务', '<div style="padding:10px;font-size:14px;text-align:center;color:#f60"><img src="https://p.ssl.qhimg.com/t01d621a8109b7524b5.gif" width="24"> 服务启动中，请稍后...</div>', {width:300, height:126,btn_name:'知道啦'}, function(){return true;});

			var consultdefwords = '用户为家庭卡VIP用户，手机号'+mobile;
			ExpertChat.checkAndStartFamily(eid, consultdefwords);

			//fater 5s, close the PANEL.
			setTimeout(function(){panel.hide();}, 5000);
		});

		// 调起客户端免费咨询
		W('.qy-mianfeizixun-btn').on('click', function(e){
			e.preventDefault();

			var eid = W(this).attr('data-eid');

			var panel = tcb.alert('使用服务', '<div style="padding:10px;font-size:14px;text-align:center;color:#f60"><img src="https://p.ssl.qhimg.com/t01d621a8109b7524b5.gif" width="24"> 服务启动中，请稍后...</div>', {width:300, height:126,btn_name:'知道啦'}, function(){return true;});
			//fater 5s, close the PANEL.
			setTimeout(function(){panel.hide();}, 5000);

			ExpertChat.checkAndStart(eid);
		});

		//启动购买定制服务
		W('.buy-diy-service').on('click', function(e){
			e.preventDefault();

			var content = W('#buyDiyTpl').html();
			var panel = tcb.panel("购买服务", content, { width:420, height:270 });

			// 提交定制服务
	        W(panel.oBody).one('.wg3-tc-detail-dingzhi-form').on('submit', function(e){
	            e.preventDefault();

	            var wMe = W(this);

	            // 支付代码
	            var wPCode = wMe.one('[name="buyer_paycode"]'),
	                pcode = wPCode.val().trim();
	            if(pcode==wPCode.attr('placeholder') || pcode == ''){
	                wPCode.shine4Error();
	                wPCode.focus();
	                return false;
	            }
	            var request_url = '/firm/aj_gettaocanid_bycode/?zkcode='+pcode;
	            QW.Ajax.post(request_url, function(data){
	                data = QW.JSON.parse(data);
	                // console.log(data);
	                if(data.errno == 0){
	                    var redirect_url = data.result;

	                    if(window.__inclient){
	                        redirect_url += '&inclient=1'
	                    }
	                    window.location.href = redirect_url;

	                }else{
	                    alert("抱歉，订单提交失败。" + data.errmsg);
	                }
	            });

	        });
		});
	}

	//设置textarea的选中区域
	function setSelectRange( textarea, start, end ) {
		if ( typeof textarea.createTextRange != 'undefined' )// IE
		{
			var range = textarea.createTextRange();
			// 先把相对起点移动到0处
			range.moveStart( "character", 0)
			range.moveEnd( "character", 0);
			range.collapse( true); // 移动插入光标到start处
			range.moveEnd( "character", end);
			range.moveStart( "character", start);
			range.select();
		}else if ( typeof textarea.setSelectionRange != 'undefined' ){
			textarea.setSelectionRange(start, end);
			textarea.focus();
		}
	}

	function initDoIt(){
		try{//首页自动触发
			W('#taocanTypes').query('li').first().fire('click');
			if( W('.comp-size-item.prd-selected').length==0 ){ W('.comp-size-item').first().fire('click'); }

			W('#introTab').query('li').first().fire('click');
			if( W('.fuwubao-item.prd-selected').length==0 ){ W('.fuwubao-item').first().fire('click'); }
		}catch(ex){}

		//是否不需要登录提交，出现登陆框
	    try{
	        if( W('#orderUserLR').length > 0){
	        	var goUrl = W('#orderUserLR').attr('data-next');
	            InnerLogin.show('orderUserLR', 'orderUserLogin', 'orderUserReg', {
	                'loginSucc' : function(){ window.location.href= goUrl; },
	                'regSucc' : function(){ window.location.href= goUrl; }
	            }, true);
	        }
	    }catch(ex){}


	    var torder_id = window.location.search.queryUrl('torder_id')||'';
	    torder_id = torder_id? ('&torder_id='+encodeURIComponent(torder_id)) : '';
	    //企业订单
	    if( W('#tokenRemoteList').length>0 ){
	    	var box = '#tokenRemoteList .tokens',
	    		url = '/firm/taocan_order?isajax=json&type=3&pagesize=#{pagesize}&pn=#{pn}' + torder_id;
	    	getAjaxData( box,  url, 0 , true );
	    }

	    if( W('#tokenShangmenList').length>0 ){
	    	var box = '#tokenShangmenList .tokens',
	    		url = '/firm/taocan_order?isajax=json&type=1&pagesize=#{pagesize}&pn=#{pn}' + torder_id;
	    	getAjaxData( box,  url, 0 , true );
	    }

	    //家庭订单
	    if( W('#fmTokenRemoteList').length>0 ){
	    	var box = '#fmTokenRemoteList .tokens',
	    		url = '/family/order?isajax=json&type=3&pagesize=#{pagesize}&pn=#{pn}' + torder_id;
	    	getAjaxData( box,  url, 0 , true , 'family');
	    }

	}

	return{
		init : init,
		buyRsConfirm : buyRsConfirm
	}
})();


var tcbShangmenService = tcbShangmenService || (function(){

	var yyPanel;

	function show( code ){

		createBox(code);

		initAddrComp();

		bindEvent();

	}

	function bindEvent(){
		W('#shangmenForm').on('submit', function(e){
			e.preventDefault();
			if( !checkForm(W('#shangmenForm')[0])){
				return false;
			}

			W('#fsyAddr_full').val( W('#fsyAddr_cityname').val() + ' ' + W('#fsyAddr_areaname').val() + ' ' +  W('#fsyAddr_detail').val());

			QW.Ajax.post( W('#shangmenForm')[0], function(data){
				data = QW.JSON.parse(data);
				if(data.errno == 0){
					alert('申请上门服务提交成功，客服会尽快联系您处理。');
					hide();
				}else{
					alert('抱歉，出错了。'+ data.errmsg);
				}
			} );

			return false;
		});


	}

	function checkForm(form){
		var ele = form.elements;
		for(var i=0, n=ele.length; i<n; i++){
			var el = ele[i];
			if(el.tagName.toLowerCase()=='input' || el.tagName.toLowerCase()=='textarea'){
				var datatype = el.getAttribute('datatype');
				if(!datatype){
					continue;
				}else{
					var pattern = datatype.replace('reg-','');
					var val = el.value;

					if ('string' == typeof pattern) {

						pattern.replace(/^\/(.*)\/([mig]*)$/g, function(a, b, c) {
							pattern = new RegExp(b, c || '');
						});
					}
					isOk = pattern.test(val);

					if(isOk){
						continue;
					}else{
						W(el).shine4Error().focus();
						return false;
					}
				}
			}
		}

		return true;
	}

	function createBox(code){
		var str = W('#firmShangmenYuyueTpl').html() || '';
		yyPanel = tcb.panel("企业服务-上门维修", str, {
			'width' : 354 ,
			'height' : 420 ,
			"withShadow": true,
			"wrapId" : "firmShangmenPanel",
			"className" : "panel panel-tom01 border8-panel pngfix"
		});

		try{ new PlaceHolder('#fsyCode');		}catch(ex){}
		try{ new PlaceHolder('#fsyTel');	}catch(ex){}
		try{ new PlaceHolder('#fsyAddr_detail'); }catch(ex){}
		try{ new PlaceHolder('#fsyProblem');	 }catch(ex){}

		if( code ){
			W('#fsyCode').val(code).focus();
		}
	}

	//初始化地址选择器
	function initAddrComp(){
		// 激活面板选择
        new bang.AreaSelect({
        	'wrap': '#shmCitySelector',
        	'hasquan' : false,
        	//when initial, set the default addr.
        	'data':{
	        	'areacode': window.location.search.queryUrl('area_id')||'',
	            'areaname': window.location.search.queryUrl('areaname')||''
            },
        	// 城市选择时触发
	        'onCitySelect': function(data){
	        	W('#fsyAddr_citycode').val(data.citycode);
	        	W('#fsyAddr_areaid').val('');

	        	W('#fsyAddr_cityname').val(data.cityname);
	        	W('#fsyAddr_areaname').val('');
	        },
	        // 区县选择时触发
	        'onAreaSelect': function(data){//console.log(data)
	        	W('#fsyAddr_citycode').val(data.citycode);
        		W('#fsyAddr_areaid').val(data.areacode);

        		W('#fsyAddr_cityname').val(data.cityname);
	        	W('#fsyAddr_areaname').val(data.areaname);
	        },
	        // 商圈选择时触发
	        'onQuanSelect': function(data){

	        }
        });
	}

	function hide(){
		yyPanel && yyPanel.hide();
	}

	return {
    	show : show
    }
})();

Dom.ready(function(){
	firmOrder.init();

        // 立即购买套餐
        W('.wg3-tc-detail-sale-form').on('submit', function(e){
            e.preventDefault();

            var wMe = W(this);

            // 手机
            var wTel = wMe.one('[name="buyer_mobile"]');
            if(wTel.val().trim()==wTel.attr('placeholder') || wTel.val().trim() == ''){
                wTel.shine4Error();
                wTel.focus();
                return false;
            }
            // 协议
            var wXieYi = wMe.one('.wg3-tc-detail-xieyi-checkbox:checked');
            if( wXieYi.length ==0 ){
            	var panel_tit  = '提示',
            		panel_cont = '<div style="padding:10px">您同意《奇虎360企业IT服务协议》后才能购买该产品</div>';
                var panel = tcb.alert(panel_tit, panel_cont, { width:320, height:120}, function(){ panel.hide();});
                return false;
            }

            var payMethod = wMe.one('.pay-method:checked').val();

            wMe.one('[name="bank_code"]').val( (payMethod == 'wangyin'? wMe.one('.bank-selector').val() : payMethod) );

            QW.Ajax.post(this, function(data){
                data = QW.JSON.parse(data);
                if(data.errno == 0){
                    var orderId = data.result.order_id;

                    var payUrl = BASE_ROOT + 'firm/subpay/?torder_id=' + orderId;
                    var indexUrl = BASE_ROOT + (window.__inclient? 'firm/client':'firm/taocan');
                    var detailUrl = BASE_ROOT + 'firm/detail/?torder_id=' + orderId;
                    QW.Cookie.set('otel', wTel.val(), {'path':'/', 'domain' : '.bang.360.cn'});

                    if(window.__inclient){
                        //打款支付页面
                        window.open( payUrl );

                        buyRsConfirm({'torder_id' : orderId} , function(){
                            //打开订单完成详情页
                            window.open( detailUrl );
                            //回到首页
                            window.location.replace(indexUrl);
                        } );
                    }else{//网页中，跳转到支付页，否则会被拦截
                        window.location.href = payUrl;
                    }

                }else{
                    alert("抱歉，订单提交失败。" + data.errmsg);
                }
            });

            return false;
        });
        // 定制服务（提交支付码）
        W('.wg3-tc-detail-dingzhi-form').on('submit', function(e){
            e.preventDefault();

            var wMe = W(this);

            // 支付代码
            var wPCode = wMe.one('[name="buyer_paycode"]'),
                pcode = wPCode.val().trim();
            if(pcode==wPCode.attr('placeholder') || pcode == ''){
                wPCode.shine4Error();
                wPCode.focus();
                return false;
            }
            var request_url = '/firm/aj_gettaocanid_bycode/?zkcode='+pcode;
            QW.Ajax.post(request_url, function(data){
                data = QW.JSON.parse(data);
                // console.log(data);return;
                if(data.errno == 0){
                    var redirect_url = data.result;

                    if(window.__inclient){
                        redirect_url += '&inclient=1'
                    }
                    window.location.href = redirect_url;

                }else{
                    alert("抱歉，订单提交失败。" + data.errmsg);
                }
            });

        });

		//新定制服务
		W('.wg3-dingzhi-form2').on('submit', function(e){
			e.preventDefault();

            var wMe = W(this);

            // 支付代码
            var wMobile = wMe.one('[name="buyer_mobile"]'),
            	wCode = wMe.one('[name="secode"]'),
                mobile = wMobile.val().trim(),
                secode = wCode.val().trim();
            if( !/^1\d{10}$/.test(mobile) ){
                wMobile.shine4Error();
                wMobile.focus();
                return false;
            }
            if( !secode || secode == wCode.attr('placeholder') ){
                wCode.shine4Error();
                wCode.focus();
                return false;
            }
            var request_url = '/firm/yuyue_sub/';
            QW.Ajax.post(request_url, this, function(data){
                data = QW.JSON.parse(data);
                // console.log(data);return;
                if(data.errno == 0){
                    W('.wg3-dz-cnt').hide();
                    W('.wg3-dz-succ').show();

                }else{
                    alert("抱歉，订单提交失败。" + data.errmsg);
                }
            });
		});

		//发送验证码
		W('#wg3DZSendCode').on('click', function(e){
			var wMe = W(this);

			if( wMe.hasClass('wg3-tc-btndisabled') ){return;}

			var wMobile = wMe.parentNode('form').one('[name="buyer_mobile"]'),
                mobile = wMobile.val().trim();

            if( !/^1\d{10}$/.test(mobile) ){
                wMobile.shine4Error();
                wMobile.focus();
                return false;
            }

            //QW.Ajax.post( '/aj/sendsecode/', {'mobile': mobile}, function(data){// [接口废弃]此处js已无处使用
            //	data = QW.JSON.parse(data);
            //	if(data.errcode == '1000'){
            //		wMe.addClass('wg3-tc-btndisabled').val('发送成功');
            //		setTimeout(function(){ wMe.removeClass('wg3-tc-btndisabled'); }, 60*1000);
            //	}else{
            //		alert('抱歉，发送失败，请稍后再试');
            //	}
            //
            //});
		});

		//使用服务码
		W('.user-service-code').on('click', function(e){
			e.preventDefault();
			var panel = tcb.confirm('服务代码', '<div style="padding:10px 20px"><h3 style="font-size:14px;line-height:2.2">请输入服务代码：</h3><input type="text" class="prompt-txt" style="width:98%; height:30px;line-height:30px;" /></div>', {
				width: 300,
				height:180
			}, function(){
				pcode = W(panel.oBody).one('.prompt-txt').val();
				panel.hide();
				if(pcode){
					var request_url = '/firm/aj_gettaocanid_bycode/?zkcode='+pcode;
					QW.Ajax.post(request_url, function(data){
			            data = QW.JSON.parse(data);
			            // console.log(data);return;
			            if(data.errno == 0){
			                var redirect_url = data.result;

			                if(window.__inclient){
			                    redirect_url += '&inclient=1'
			                }
			                window.location.href = redirect_url;

			            }else{
			                alert("抱歉，服务代码提交失败。" + data.errmsg);
			            }
			        });
				}
			});
		});


        tcb.bindEvent(document.body, {
            '.wg3-tc-detail-ipt': {
                'focus': function(e){
                    var wMe = W(this),
                        val = wMe.val().trim(),
                        def_text = wMe.attr('placeholder');

                    wMe.removeClass('default-text');

                    if (val==def_text) {
                        wMe.val('');
                    }
                },
                'blur': function(e){
                    var wMe = W(this),
                        val = wMe.val().trim(),
                        def_text = wMe.attr('placeholder');

                    if (!val || val==def_text) {
                        wMe.addClass('default-text').val(def_text);
                    }
                }
            },
            // 选择付费方式
            '.wg3-tc-detail-pay .pay-method': function(e){
                var wMe = W(this);

                if (wMe.val()=='wangyin') {
                    W('.bank-selector-wrap').show();
                } else {
                    W('.bank-selector-wrap').hide();
                }
            },
            //同意企业服务协议。
            '.wg3-tc-detail-xieyi-cont': function(e){
                e.preventDefault();

                var panel = tcb.alert("奇虎360企业IT服务协议",
                    '<iframe frameborder="0" style="width:680px;height:420px;" src="/resource/html/firmserviceprotocal.html"></iframe>',
                    {'width':680, 'height':510},
                    function(){ panel.hide(); }
                );
            },
            // 选择套餐
            '.wg3-tc-detail-service-type .wg3-taocan-service-type': function(e){
            	e.preventDefault();

            	var wMe = W(this);
            	if (wMe.hasClass('selected')) {
            		return;
            	}

                changeServiceType(wMe);

            	wMe.addClass('selected').siblings().removeClass('selected');
            }
        });

    function changeServiceType(wObj){
        var id = wObj.attr('data-id'),
            price = wObj.attr('data-price'),
            c_price = wObj.attr('data-cprice');

        W('.wg3-tc-detail-price').html(price+'元');
        W('.wg3-tc-detail-cprice').html('原价：'+c_price+'元');

        W('[name="taocan_id"]').val(id);
        W('[name="unit_price"]').val(price);
        W('[name="taocan_price"]').val(price);
    }

    /**
     * 购买结果确认弹窗
     * @return {[type]} [description]
     */
    function buyRsConfirm( params, callback ){
        var html = '<dl class="pay-tip clearfix"><dt><span class="tipsico"></span></dt><dd>请您在新打开的网上银行页面进行付款，付款完成前不要关闭该窗口。</dd><dd class="tip-error"></dd></dl>';
        var panel = tcb.panel("360安全支付", html, {
                wrapId: "payLayer",
                width: 400,
                btn: [{
                    txt: "已完成支付",
                    fn: function(){
                        if(params){
                            QW.Ajax.post('/aj/get_firmorder_status/', params, function(data){
                                var errBox = W(panel.oBody).one('.tip-error');
                                data = QW.JSON.parse(data);
                                if(data.errno == 0){ //支付成功
                                    errBox.html('');
                                    callback && typeof(callback)=='function' && callback();
                                }else{ // 支付失败
                                    errBox.html('暂未收到您的款项，请确认付款后再点击。');
                                }
                            });
                        }else{
                            callback && typeof(callback)=='function' && callback();
                        }
                    }
                },{
                    txt: "支付遇到问题",
                    fn: function(){
                        location.reload();
                    }
                }]
            });
        panel.on('afterhide', function(){
            location.reload();
        });
    }
});


;/**import from `/resource/js/component/freeyuyue.js` **/
var FreeYuyue = FreeYuyue || (function(){
	var orderUrl = BASE_ROOT + "my_center/yuyueorder" + ( typeof(_inclient)!='undefined' && _inclient ? '?inclient=1' : '' );
	var fyPanel;

	function show(shopid, productid){
		var str =  W('#freeYuyueTpl').html() || '';
		fyPanel = tcb.panel("申请免费体验", str, {
			'width' : 470 ,
			'height' : 300 ,
			"withShadow": true,			
			"wrapId" : "freeServicePanel",
			"className" : "panel panel-tom01 border8-panel pngfix"	
		});

		try{ new PlaceHolder('#firmName');	}catch(ex){}
		try{ new PlaceHolder('#csrTel');	}catch(ex){}	

		initAddrComp();		

		bindEvent();	
	}


	function bindEvent(){

		W('#freeServicePanel .free-srv-yy-form').on('submit', function(e){
			e.preventDefault();
			checkFormAndSubmit( W(this) );
		});
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
	        	 W('#freeServicePanel .free-srv-yy-form .user-city').val(data.cityname);
	        	 W('#freeServicePanel .free-srv-yy-form .user-quxian').val('');
	        	 W('#freeServicePanel .free-srv-yy-form .city-code').val(data.citycode);
	        },
	        // 区县选择时触发
	        'onAreaSelect': function(data){
	        	W('#freeServicePanel .free-srv-yy-form .user-city').val(data.cityname);
        		W('#freeServicePanel .free-srv-yy-form .user-quxian').val(data.areaname);
        		W('#freeServicePanel .free-srv-yy-form .city-code').val(data.citycode);
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
				try{ fyPanel.hide(); }catch(ex){}
				tcb.alert("提交成功","<div style='padding:10px 30px;font-size:14px;font-family:微软雅黑;'><h2 style='font-size:22px; color:#367c3c;line-height:50px'><img src='https://p.ssl.qhimg.com/t019032b989ba615f57.png'>&nbsp;&nbsp;提交成功！</h2><div style='padding-left:60px'>稍后会有专人与您电话联系或短信通知，请您耐心等候</div></div>", { width:470, height:190} , function(){
					return true;
				});
			}
		});
	}


	return { 
		show : show
	}
})();

