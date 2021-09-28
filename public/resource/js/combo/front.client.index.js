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


;/**import from `/resource/js/component/addr_suggest.js` **/
function AddrSuggest( obj, conf){
	if(W( obj ).length==0){ return null; }
	conf = conf || {};

	this.obj = W( obj );
    this.curObj = null;
	this.data = null;
	this.suglist = null;
	this.defsug = null;
	this.showNum = conf.showNum || 10; //sug列表项数量
	this.onSelect = conf.onSelect || null; //选中某项时的回调
	this.requireCity = conf.requireCity || function() { return '';}  //当前城市获取回调
	this.noDefSug = conf.noDefSug || false;  //是否不显示默认提示？
	this.zIndex = conf.zIndex||999;

	this._cacheData = {};

	var mapObj;
	var _this = this;

	this.init = function(){
		var _this = this;
		if( !(AMap && AMap.Map) ){
			setTimeout(function(){ _this.init() }, 300);
			return false;
		}

		var _tmpdiv = "aMapContainer" + Math.ceil(Math.random()*10000);
		W('<div id="'+_tmpdiv+'"></div>').appendTo( W('body') ).hide();

		mapObj = new AMap.Map( _tmpdiv );

		this.createDropList();
		this.createDefSug();

		this.showDefaultTxt();

		this.bindEvent();
	}

	this.bindEvent = function(){
		var _obj = this.obj;

		_obj.on('focus', function(){
            var wMe = W(this),
                deftxt = wMe.attr('data-default')||'';

            _this.setCurObj(wMe);

			_this.resetSugListPos(_this.suglist);
			_this.resetSugListPos(_this.defsug);

			if( deftxt == wMe.val() ){
                wMe.val('');
				if(!_this.noDefSug){
					_this.defsug.show().css({
                        'z-index' : tcb.zIndex()
                    })
				}
			}else if(wMe.val().length>0){
				_this.fetchSug( wMe.val() );
				_this.defsug.hide()
			}
            wMe.removeClass('default');
		});

		_obj.on('blur', function(){
            var wMe = W(this),
                txt = wMe.val(),
                deftxt = wMe.attr('data-default')||'';

            if(txt =='' &&  deftxt){
                wMe.val( deftxt );
                txt = deftxt;
			}
			setTimeout(function(){ _this.suglist.hide(); } ,160);
            if (txt==deftxt) {
                wMe.addClass('default');
            }
            _this.defsug.hide();
		});

		_obj.on('keyup', function(e){
            var wMe = W(this),
                deftxt = wMe.attr('data-default')||'';

            _this.setCurObj(wMe);

            if(e.keyCode == 38){
				_this.selectItem(-1);
			}else if(e.keyCode == 40){
				_this.selectItem(1);
			}else if(e.keyCode == 13){				
				var nowsel = _this.suglist.one('.on');
				if( nowsel.length>0 ){
					nowsel.fire('click');
				}
			}else{
				if( wMe.val()!='' && wMe.val()!= deftxt ){
					_this.fetchSug( wMe.val() );
					_this.defsug.hide();
				}else{
					_this.suglist.hide();

					if(!_this.noDefSug){
						_this.defsug.show().css({
                            'z-index' : tcb.zIndex()
                        })
					}
				}
			}
		});	

		_obj.on('input', function(e){
            var wMe = W(this),
                deftxt = wMe.attr('data-default')||'';

            _this.setCurObj(wMe);

            if(e.keyCode == 38){
				_this.selectItem(-1);
			}else if(e.keyCode == 40){
				_this.selectItem(1);
			}else if(e.keyCode == 13){				
				var nowsel = _this.suglist.one('.on');
				if( nowsel.length>0 ){					
					nowsel.fire('click');
				}
			}else{
				if( wMe.val()!='' && wMe.val()!= deftxt ){
					_this.fetchSug( wMe.val() );
					_this.defsug.hide();
				}else{
					_this.suglist.hide();

					if(!_this.noDefSug){
						_this.defsug.show().css({
                            'z-index' : tcb.zIndex()
                        })
					}
				}
			}
		});	

		_obj.on('keypress', function(e){
			if(e.keyCode == 13){ //如果当前有选中项，就阻止默认表单提交事件。（在keyup事件中处理具体选中流程）
				var nowsel = _this.suglist.one('.on');
				if( nowsel.length>0 ){
					e.preventDefault();
				}
			}
		});		

		_this.suglist.delegate('.ui-addrsug-sugitem', 'click', function(e){
			var name = W(this).attr('data-name');
			var wholename = W(this).attr('data-whole');

            var _curObj = _this.getCurObj();

            _curObj.val( wholename );
			if(_this.suglist && _this.suglist.css('display')!='none'){
				_this.suglist.hide();
			}
			if(_this.onSelect){
				_this.onSelect(wholename);
			}
		});
	};

    // 显示默认文字
	this.showDefaultTxt = function(){
		var _obj = this.obj;
        if (_obj && _obj.length>0) {
            _obj.forEach(function(el, i){
                var wEl = W(el);
                var deftxt = wEl.attr('data-default')||'';
                if( wEl.val()=='' &&  deftxt){
                    wEl.val( deftxt );
                }
                wEl.addClass('default');
            });
        }
	};
    // 获取当前obj
    this.getCurObj = function() {
        return this.curObj || this.obj;
    };
    // 获取当前obj
    this.setCurObj = function(curObj) {
        this.curObj = curObj || this.obj;

        return this.curObj;
    };

	this.fetchSug = function(txt){
		try{
			var cData = _this._cacheData[ encodeURIComponent(_this.requireCity()+'-'+txt) ];
			if(cData){
				_this.gotData(cData);
			}else{
				//加载输入提示插件  
			    mapObj.plugin(["AMap.Autocomplete"], function() {  
			        var autoOptions = {
			            city: _this.requireCity() //城市，默认全国  
			        };
			        var auto = new AMap.Autocomplete(autoOptions);
			        //查询成功时返回查询结果  
			        AMap.event.addListener(auto,"complete", function(data){ 
			        	_this._cacheData[ encodeURIComponent(_this.requireCity()+'-'+txt) ]=data;
			        	_this.gotData(data);
			        });
			        auto.search(txt);
			    });
		    }
		}catch(ex){//Something wrong was here, but I can't find it out. So, Try-Catch it.

		}
	}

	this.gotData = function(data){		
		if(data && data.tips){
			_this.render( data.tips );
		}else{
			_this.suglist.hide();
		}
	}

	this.createDropList = function(){
		var suglist = W('<div class="ui-addrsug-suglist">').appendTo( W('body') ).hide()

		this.suglist = suglist;

		this.resetSugListPos(suglist);
	}

	this.resetSugListPos = function( suglist){
        var cur_obj = _this.getCurObj();

		var rect = cur_obj.getRect();
		var setWidth = cur_obj.attr('data-sugwidth')-0;

		suglist.css({
			'position' : 'absolute',
			'z-index' : tcb.zIndex(),
			'width' :  setWidth || rect.width,
			'left' : rect.left,
			'top' : rect.top + rect.height + 2
		});
	}

	this.render = function( data ){
		if(data.length > 0){
			var str = '';
			for( var i=0, n=Math.min( data.length, this.showNum ); i<n; i++ ){
				var item = data[i];
				str += '<div class="ui-addrsug-sugitem" data-name="'+item.name+'" data-whole="'+item.district+item.name+'"><b>'+item.name+'</b><span>'+item.district+'</span></div>';
			}
			this.suglist.show().html( str ).css({
                'z-index' : tcb.zIndex()
            })
		}else{
			this.suglist.hide();
		}
	}

	this.selectItem = function(direc){
		var now = this.suglist.one('.on');			
		if(!direc || direc==1){			
			if(now.length == 0){
				this.suglist.query('.ui-addrsug-sugitem:first-child').addClass('on');
			}else{
				now.removeClass('on');
				var next = now.nextSibling('.ui-addrsug-sugitem');				
				next.length > 0 ? next.addClass('on') : this.suglist.query('.ui-addrsug-sugitem:first-child').addClass('on');	
			}
		}else{
			if(now.length == 0){
				this.suglist.query('.ui-addrsug-sugitem:last-child').addClass('on');
			}else{
				now.removeClass('on');
				var prev = now.previousSibling('.ui-addrsug-sugitem');
				prev.length > 0 ? prev.addClass('on') : this.suglist.query('.ui-addrsug-sugitem:last-child').addClass('on');				
			}
		}
	}

	/**
	 * 默认提示
	 * @return {[type]} [description]
	 */
	this.createDefSug = function(){
		var txt = "可以搜索您所在的小区、写字楼或标志性建筑";
		var suglist = W('<div class="ui-addrsug-defsug">').appendTo( W('body') ).hide()

		W('<div class="ui-addrsug-defitem"></div>').html(txt).appendTo(suglist);

		this.defsug = suglist;

		this.resetSugListPos(suglist);
	}

	this.init();
}


;/**import from `/resource/js/component/suggest.js` **/
/**!
搜索
*/
(function(){
	var loadJs = function(url) {
		var head = document.getElementsByTagName('head')[0] || document.documentElement,
			script = document.createElement('script'),
			done = false;
		script.src = url;
		script.charset = 'utf-8';
		script.onerror = script.onload = script.onreadystatechange = function() {
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				head.removeChild(script);
			}
		};
		head.insertBefore(script, head.firstChild);
	},

	mix=function(des, src){
		for(var i in src){
			des[i] = src[i];
		}
		return des;
	},
	//DomU=QW.DomU,
	createElement=function (tagName, property) {
		return mix(document.createElement(tagName),property);
	},
	//EventH=QW.EventH,
	target=function(e) {
		e=e||window.event;
		return e.target || e.srcElement;
	},
	keyCode=function(e) {
		e=e||window.event;
		return e.which || e.keyCode || e.charCode;
	},
	preventDefault=function(e) {
		e=e||window.event;
		e.preventDefault && e.preventDefault() || (e.returnValue = false); 
	},
	//CustEvent=QW.CustEvent,
	//NodeH=QW.NodeH,
	hasClass=function(el, cn) {
		return new RegExp('(?:^|\\s)' +cn+ '(?:\\s|$)','i').test(el.className);
	},
	addClass=function  (el, cn) {
		if (!hasClass(el, cn)) {
			el.className = (el.className + ' '+cn).replace(/^\s+|\s+$/g,'');
		}
	},
	removeClass=function  (el, cn) {
		if (hasClass(el, cn)) {
			el.className = el.className.replace(new RegExp('(?:\\s|^)' +cn+ '(?:\\s|$)','i'),' ').replace(/^\s+|\s+$/g,"");
		}
	},
	//setStyle=NodeH.setStyle,
	//getXY=NodeH.getXY, 由于getXY的兼容代码很长，所以无依赖化时，稍稍调整下，不用位置，而改用dom结构来定位
	ancestorNode=function(el,tagName,topEl){
		do{
			if(el.tagName==tagName) return el;
		}while(el!=topEl && (el=el.parentNode))
		return null;
	},
	on=function (element, name, handler) {
		element.addEventListener ? element.addEventListener(name, handler, false) : element.attachEvent('on' + name, handler);
	},
	isIe=(/msie/i).test(navigator.userAgent);



	/**
	 *@class ComboBox 可输入下拉框 
	*/
	function ComboBox(opts){
		mix(this,opts);
		this.render();
	}

	ComboBox.prototype={
		/*
		*参数
		*/
		width:0,
		oText: null,//text-input对象
		itemsData:null,//items数据，array，需要在refreshData方法里进行设值
		/*
		*开放的变量，readOnly的
		*/
		oMenu:null,
		oWrap:null,
		selectedIndex:-1,//当前选中项
		filteredValue:"",//过滤值。过滤动作已完成
		filteringValue:"",//过滤值。过滤动作正在进行（因为有时过滤是异步的）
		acValue:"",//通过自动完成得到的值 
		closed:false,//suggest是否处于关闭状态。－－由suggest自身决定
		/*
		*方法
		*/
		show: function(){
			if( this.oMenu.childNodes.length){
				this.oWrap.style.display="";
			}
		},
		hide: function(){
			this.oWrap.style.display="none";
		},
		ishide : function(){
			return this.oWrap.style.display==="none";
		},
		refreshItems: function(rtype){
			var me=this;
			var data=me.itemsData;
			if(data && !data.__isItemsDataRendered){ //加上属性“__isItemsDataRendered”以标志data是否已经render成html
				var html=[];
				for(var i=0;i<data.length;i++){
					if(rtype=="hot"){
						var num = i+1;
						if(i<3){
							html.push('<li acValue="'+data[i][0].replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"><em>'+num+'</em>'+data[i][1]+'</li>');
						}else{
							html.push('<li acValue="'+data[i][0].replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"><em class="gray">'+num+'</em>'+data[i][1]+'</li>');	
						}
						
						
					}else{
						html.push('<li acValue="'+data[i][0].replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">'+data[i][1]+'</li>');	
					}
					
				}
				me.oMenu.innerHTML = (html.join("").replace(/(<\w+)/g,'$1 unselectable="on"'));
				if(data.length) me.show();
				else me.hide();
				me.filteredValue=me.filteringValue;
				me.acValue="";
				me.selectedIndex=-1;
				data.__isItemsDataRendered=true;
			}
		},
		/*
		refreshData:function(){
			this.itemsData=["refreshData一定要重写！"];
		},
		*/
		setSelectedIndex:function(idx,needBlur){
			var me=this;
			var rows=me.oMenu.childNodes;
			if(rows.length){
				if(me.selectedIndex>-1) removeClass(rows[me.selectedIndex],"selected");
				idx=(idx+rows.length+1)%(rows.length+1);
				if(idx==rows.length){
					me.acValue=me.oText.value=me.filteringValue;//这里用filteringValue，而不用filteredValue，是因为有时itemsData是静态的（例如，不用过滤功能的单纯ComboBox）
					idx=-1;
				}
				else {
					me.acValue=me.oText.value=rows[idx].getAttribute("acValue");
					addClass(rows[idx],"selected");
				}
			}
			else{
				idx=-1;
			}
			me.selectedIndex=idx;
		},
		refreshPos : function(oWrap, oPos){
			oWrap.style.top=oPos.offsetHeight + 4 + 'px';
			oWrap.style.left=oPos.offsetLeft - 3 +'px';
		},
		render: function(){
			var me=this;
			if(me._rendered) return ;
			me._rendered=true;
			var innerHtml = '<div class=ac_wrap_inner><div class=ac_menu_ctn><ul class=ac_menu></ul></div></div>';

			if((/msie[ \/os]*6\./ig).test(navigator.userAgent)) innerHtml = '<iframe class="ac_bgIframe"></iframe>' + innerHtml;
			var oWrap=createElement("div",{className:"ac_wrap",innerHTML:innerHtml.replace(/(<\w+)/g,'$1 unselectable="on"')});
			//var b=document.body;
			//b.insertBefore(oWrap,b.firstChild);
			var oText=me.oText,
				oPos = me.oPos || oText;
			oPos.parentNode.insertBefore(oWrap,oPos);//为了减少定位麻烦，改用dom位置来定位
			var oMenu=me.oMenu=oWrap.getElementsByTagName("ul")[0];
			oText.setAttribute("autoComplete","off");//一定要用setAttrubute，否则会导致在firefox里半输入状态下执行oText.blur()时会抛出无法捕捉的异常。
			var w=(me.oText.getAttribute('suggestWidth')-0 || oPos.offsetWidth) + 4 +"px"; //支持suggestWidth属性来设置suggest的宽度
			if(isIe) oWrap.style.width=w;
			else oWrap.style.minWidth=w;
			me.refreshPos(oWrap, oPos);
			me.oWrap=oWrap;
			me.hide();
			on(me.oText,"dblclick",function(e){//监控oText的事件
				//if(!oText.value) return;
				//if(me.closed=!me.closed) me.hide();
				//me.show();
			});
			on(me.oText,"keydown",function(e){//监控oText的事件
				clearInterval(me._refreshTimer);
				me._refreshTimer=setInterval(function(){
					if(isMouseDown) return false;
					var val=oText.value;
					if(!val){
						me.acValue=me.filteringValue=me.filteredValue="";
						me.hide();
						me.closed=false;//吸收google suggest的策略：如果suggest被关闭，用户将oText清空，这时会将suggest打开。
					}
					else if(!me.closed){
						if(val != me.filteredValue && val != me.filteringValue && val != me.acValue){
							me.filteringValue=val;
							me.refreshData();
						}
						if(me.itemsData){
							me.refreshItems();
						}
					}
				},100);

				var kCode=keyCode(e);
				var dir=0;
				switch(kCode){
					case 40 : dir=1;break;
					case 38 : dir=-1;break;
					case 27 : if(!me.closed){me.hide();me.closed=true;preventDefault(e)} break;//隐藏suggest
					//case 13 : me.hide();me.onenter && me.onenter(); break;//隐藏suggest
				}
				if(dir && oText.value){
					preventDefault(e);
					if(oWrap.style.display=="none"){
						me.show();
						me.closed=false;
					}
					else{
						me.setSelectedIndex(me.selectedIndex+dir);
					}
				}
			});
			on(me.oText,"focus",function(e){//监控oText的事件
				//if(!me.closed) me.show();
				me.refreshPos(oWrap, oPos);
				var CLEAR_DEFAULT_SEARCH = window.location.href.indexOf('/search')>-1?false : true;
				var _val = me.oText.getAttribute('data-default');
				if(_val == me.oText.value && CLEAR_DEFAULT_SEARCH)me.oText.value = '';
				me.oText.className = me.oText.className.replace(/\s?default\s?/g, '');
				//拥有已输入内容时，开启suggest
				if(me.oText.value.length > 0){
					me.show();
					clearInterval(me._refreshTimer);
					me._refreshTimer=setInterval(function(){
						if(isMouseDown) return false;
						var val=oText.value;
						if(!val){
							me.acValue=me.filteringValue=me.filteredValue="";
							me.hide();
							me.closed=false;//吸收google suggest的策略：如果suggest被关闭，用户将oText清空，这时会将suggest打开。
						}
						else if(!me.closed){
							if(val != me.filteredValue && val != me.filteringValue && val != me.acValue){
								me.filteringValue=val;
								me.refreshData();
							}
							if(me.itemsData){
								me.refreshItems();
							}
						}
					},100);
				}
				
			});
			on(me.oText,"blur",function(e){//监控oText的事件
				me.hide();
				var _default = me.oText.getAttribute('data-default');
				if(!me.oText.value && _default){
					me.oText.value = _default;
					me.oText.className += ' default';
				}
				clearInterval(me._refreshTimer);
			});
			var isMouseDown ,
				mouseDownTimer;
			oWrap.onmousedown=function(e){//监控oWrap的事件
				preventDefault(e); // 阻止输入框失焦
				//if(isIe){oText.setCapture();setTimeout(function(){oText.releaseCapture();},10);} //解决“IE下，半输入状态时不能点击选项”的问题
				clearTimeout(mouseDownTimer);//以下三句解决“半输入状态时不能点击选项”的问题
				isMouseDown = true;
				mouseDownTimer = setTimeout(function(){isMouseDown=false;},2000);
			};
			oMenu.onclick=function(e){//监控oMenu的事件
				var el=target(e);
				var li=ancestorNode(el,"LI",oMenu);
				if(li) {
					oText.blur();//Firefox下半输入法输入时，选择item，console有错，无法catch，并且不影响运行。
					setTimeout(function(){oText.focus();},10);//解决“半输入状态时不能点击选项”的问题
					var rowIndex=0,
						preLi=li;
					while(preLi = preLi.previousSibling) rowIndex++;
					me.setSelectedIndex(rowIndex,true);
					me.hide();
					me.onselectitem && me.onselectitem();
				}
			};
			oMenu.onmouseover=function(e){//监控oMenu的事件
				var el=target(e);
				var li=ancestorNode(el,"LI",oMenu);
				if(li) addClass(li,"hover");
			};
			oMenu.onmouseout=function(e){//监控oMenu的事件
				var el=target(e);
				var li=ancestorNode(el,"LI",oMenu);
				if(li) removeClass(li,"hover");
			};
			/**
			oWrap.getElementsByTagName("a")[0].onclick=function(e){//监控close按钮的事件
				me.closed=true;
				me.hide();
				preventDefault(e);
			};
			**/
		}
	}

	window.suggest = function (data){
		var ar=[],
			menuData=data.result||[],
			kw=oText.value;
		for(var i=0;i<menuData.length;i++){
			var key=menuData[i].word|| menuData[i],
				val=key;
			if(kw && val.indexOf(kw)==0){
				val=kw+'<b>'+val.substr(kw.length)+'</b>';
			}
			if(key)	ar.push([key,val]);
		}
		cb.itemsData=ar;

		if(data.query){
			dataCache[data.query] = data;
		}
	};

	window.hotSuggest = function (data){
		var ar=[],
			menuData=data.result||[],
			kw=oText.value;
		for(var i=0;i<menuData.length;i++){
			var key=menuData[i].word|| menuData[i],
				val=key;
			if(kw && val.indexOf(kw)==0){
				val=kw+'<b>'+val.substr(kw.length)+'</b>';
			}
			if(key)	ar.push([key,val]);
		}
		cb.itemsData=ar;
		cb.refreshItems('hot');
		W(".search-click-here").hide();
		
	};
	var oText = document.getElementById('360tcb_so'),
		dataCache={};
	//oText.offsetParent.style.position = 'relative';
	var cb=new ComboBox({oText:oText,
		onselectitem:function(){
			var els = oText.form.elements;
			for(var i =0;i<els.length;i++){
				if(els[i].type=='submit') {
					els[i].click();

					return;
				}
			}
		},
		refreshData:function(){
			var data = dataCache[oText.value];
			if (data){
				suggest(data);
			}else {
				loadJs('http://suggest.bang.360.cn/suggest?word='+encodeURIComponent(this.oText.value)+'&category='+cid+'&encodein=utf-8&encodeout=utf-8&format=json&callback=window.suggest&t='+Math.random())

			}
		}

	});

	//点击搜索框右边箭头出搜索
	function __hotSearch(){
		var _type = W('.search-hot-word a.curr').attr('data-type')||0;
		
		loadJs(BASE_ROOT + '/aj/get_skeylist/?id='+_type +'&callback=window.hotSuggest')
	}

	W(".hd-search-wrap").delegate('.icon_clickhere','click',function(e){
		e.preventDefault();
		if( cb.ishide() ){
			W(this).addClass('selected');
			__hotSearch();
		}else{
			W(this).removeClass('selected');
			cb.hide();
		}
	})

	W('body').click(function(e){
		var tar = e.target;
		if(W(tar).ancestorNode(".ac_wrap") && W(tar).attr('id')!='360tcb_so' && !W(tar).hasClass('icon_clickhere')){
			W('.hd-search-wrap .icon_clickhere').removeClass('selected');
			cb.hide();
			//if( W('#doc-menubar-fixed').css('display')=="none" ) W(".search-click-here").show();
		}
	})

	W('#360tcb_so').on('focus', function(){
		var _this = this;
		setTimeout(function(){
			if(W(_this).val().length==0  ){			
				//W(".hd-search-wrap .icon_clickhere").fire('click');
				__hotSearch();			
			}
		}, 10);
	});
})();

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

;/**import from `/resource/js/include/client.inc.js` **/
/**
 * 搜索类型选择下拉列表
 * @return {[type]} [description]
 */
function searchTypeSelect(){
	var sel = W('.tcb-top-search .search-type');
	var selList = sel.one('.search-type-list');		
	var defaultType = selList.one('.curr');

	if(defaultType.attr('data-type') != "0"){
		sel.one('.now-search-type').html( defaultType.html() );
	}

	sel.on('mouseenter', function(e){
		W('.tcb-top-search .ac_wrap').hide();
		W('#dianpuSort').hide();
		W(this).addClass('search-type-hover');
		selList.show();
		W('.tcb-top-search .search-input').blur();
	}).on('mouseleave', function(e){
		W('#dianpuSort').show();
		W(this).removeClass('search-type-hover');
		selList.hide();
	});

	selList.query('.search-type-i').on('click', function(e){
		selList.query('.search-type-i').removeClass('curr');
		W(this).addClass('curr');
		e.preventDefault();
		sel.one('.now-search-type').html( W(this).html() );
		W('.tcb-top-search [name="stype"]').val( W(this).attr('data-type') - 0 );
		selList.hide();
	});
}
/**
 * 区域选择
 * @param {[type]} options [description]
 */
function AreaSelect(options){
    var defaults = {
        'wrap': '#citySelector',
        'autoinit': true,
        'onInit': function(){},
        // 城市选择时触发
        'onCitySelect': function(data){},
        // 区县选择时触发
        'onAreaSelect': function(data){},
        // 商圈选择时触发
        'onQuanSelect': function(data){}
    }
    options = options || {};
    options = QW.ObjectH.mix(defaults, options, true);

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
            var url = 'http://' + location.host +'/aj/get_area/?citycode='+citycode;

            // 移除商圈选择
            me._removeAreaTrigger();
            me._removeQuanTrigger();
            QW.Ajax.get(url, function(responseText){
                try{
                    var area_list = QW.JSON.parse(responseText)['result'];

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
                } catch (e){}
            });
        }
        /**
         * 获取商圈信息
         * @param  {[type]} citycode [description]
         * @param  {[type]} areacode [description]
         * @return {[type]}          [description]
         */
        fn.getQuan = function(citycode, areacode){
            var me = this;
            var url = 'http://' + location.host +'/aj/get_areaquan/?citycode='+citycode+'&areacode='+areacode;

            // 移除商圈选择
            me._removeQuanTrigger();
            QW.Ajax.get(url, function(responseText){
                try{
                    var area_list = QW.JSON.parse(responseText)['result'];

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
                } catch (e){}
            });
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
                var tpl = W('#ClientAreaTpl').html().trim();
                wAreaTrigger = W(tpl);
                me.getWrap().appendChild(wAreaTrigger);
            }

            return me.wAreaTrigger = wAreaTrigger;
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
                var tpl = W('#ClientQuanTpl').html().trim();
                wQuanTrigger = W(tpl);
                me.getWrap().appendChild(wQuanTrigger);
            }

            return me.wQuanTrigger = wQuanTrigger;
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

                wCityTrigger.attr('code', code);
                wCityTrigger.one('.sel-txt').html(name);

                // 选择城市的时候获取区县
                me.getArea(code);

                // 设置data
                me.setData({
                    'cityid': cityid,
                    'citycode': code,
                    'cityname': name
                }, true);
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
                            wAreaTrigger.attr('code', code);
                            wAreaTrigger.query('.sel-txt').html(name);
                            // 设置data
                            me.setData({
                                'areacode': code,
                                'areaname': name
                            });
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
                        me.getQuan(data['citycode'], code);
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
                            wQuanTrigger.attr('code', code);
                            wQuanTrigger.query('.sel-txt').html(name);
                            // 设置data
                            me.setData({
                                'quancode': code,
                                'quanname': name
                            });
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

            var wCityTrigger = me._getCityTrigger(),
                code = wCityTrigger.attr('code'),
                name = wCityTrigger.query('.sel-txt').html();
            me.setData({
                'citycode': code,
                'cityname': name
            });
            me.getArea(code);
            if(typeof me.options.onInit === 'function'){
                me.options.onInit();
            }
        }
    }
    // 初始化
    me.options.autoinit && me.init();
}

tcb.bindEvent(document.body, {
    // 最小化底部导航
    '.client-bottom-nav .close': function(e){
        e.preventDefault();

        QW.Cookie.set('CLIENT_BOTTOM_NAV_HIDDEN', '1', {'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });

        W('.client-bottom-nav').slideUp(400, function(){
            if (!QW.Cookie.get('CLIENT_BOTTOM_TIP_HIDE')) {
                W('.client-bottom-nav-zhidao-tip').show();
            }
            W('.client-bottom-nav-upbutton').show();
        });
    },
    // 联系我们
    '.client-bottom-nav .lianxiwomen': function(e){
        e.preventDefault();

        tcb.alert("联系我们", '<div style="padding:10px 20px;line-height:2; "><h3 style="font-size:14px; font-weight:bold;margin-bottom:8px">您可以通过以下方式联系我们：</h3><p>1. <a target="_blank" href=" http://bang.360.cn/resource/html/client_jump.html?link='+encodeURI('http://chat.5251.net/jsp_admin/client/chat_green.jsp?companyId=19024&style=41044&locate=cn')+'">在线咨询</a></p><p>2. <a target="_blank" href=" http://bang.360.cn/resource/html/client_jump.html?link='+encodeURI('http://chat.5251.net/jsp_admin/client/chat_green.jsp?companyId=19024&style=41044&locate=cn')+'">投诉及建议</a></p><p>3. 致电<strong style="color:#FF6A07; font-weight:bold">4000-399-360</strong></p><p>能为您服务是我们最大的幸福！</p></div>', { width: 400, height: 230 }, function(){ return true;});
    },
    // 恢复底部导航状态
    '.client-bottom-nav-upbutton': function(e){
        e.preventDefault();
        
        QW.Cookie.set('CLIENT_BOTTOM_NAV_HIDDEN', '', {'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });

        W('.client-bottom-nav-upbutton').hide();
        W('.client-bottom-nav-zhidao-tip').hide();
        W('.client-bottom-nav').slideDown();
    },
    '.real-tel-num' : function(e){
        e.preventDefault();
        var tel = W(this).attr('data-tel');
        if(tel.trim()==''){
            return;
        }

        var shop_id = W(this).attr('data-dpid');
        W(this).hide().siblings('.tel-num').html(tel);
        new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu_list&inclient=1" ;
    },
    // 关闭“我知道了”提示
    '.client-bottom-nav-zhidao-tip a': function(e){
        e.preventDefault();

        W(this).parentNode('div').hide();

        QW.Cookie.set('CLIENT_BOTTOM_TIP_HIDE', '1', {'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });
    },
    //认证tip
    '.dp-item .show-yzlist' : {
        'mouseenter' : function(e){
            var isbot = W(this).attr('data-pos') == 'bottom'?1 : 0;
            showYZList(W(this).getRect(), W(this).parentNode('.dp-item').one('.cert') , 1, isbot);
        }
    },
    '.dp-item .cert' : {
        'mouseleave' : function(e){
            showYZList(W(this).getRect(), W(this) , 0);
        }
    },
    '.dp-item .srv-area' : {
        'mouseenter' : function(e){
            showMoreArea( W(this), 1);
        },
        'mouseleave' : function(e){
            showMoreArea( W(this), 0);
        }
    }
});
Dom.ready(function(){
    // cookie控制客户端底部导航的显示
    if (QW.Cookie.get('CLIENT_BOTTOM_NAV_HIDDEN')) {
        W('.client-bottom-nav-upbutton').show();
        // cookie控制客户端底部导航提示的显示
        if (QW.Cookie.get('CLIENT_BOTTOM_TIP_HIDE')) {
            W('.client-bottom-nav-zhidao-tip').hide();
        } else {
            W('.client-bottom-nav-zhidao-tip').show();
        }
    } else {
        W('.client-bottom-nav').show();
    }

    if(W('#formSwitchBtn').length>0) { switchSearchForm(); }
});
function hideMobile(tel){
    if(!tel) return '';
    return tel.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3").replace(/(\d+\-)?(\d+)\d{4}/, "$1$2****");
}
//显示距离处理
function dealDistance(distance){
    distance = Math.ceil(distance);
    return distance >= 1000 ? (distance/1000).toFixed(2) +'公里': distance+'米';
}
//切换搜索框
function switchSearchForm(){
    var switcher = W('#formSwitchBtn');
    var slist = W('#formSwitchBtn .form-type-list');
    switcher.delegate('.switch-handle', 'click', function(){
        if( slist.css('display')=='none' ){
            slist.show();
        }else{
            slist.hide();
        }
    })
    .delegate('.form-item', 'click', function(){
        var form = W(this).attr('data-form');
        var txt = W(this).html();
        switcher.attr('data-curform', form);
        switcher.one('.sel-form').html( txt );
        W('#'+form).show().siblings('form').hide();
        slist.hide();
    });

    W('body').on('click', function(e){
        if( !switcher.contains(e.target) ){
            slist.hide();
        }
    });

    var initSerchForm = switcher.attr('data-curform');
    if( initSerchForm ){
        try{ switcher.one('[data-form="'+initSerchForm+'"]').fire('click'); }catch(ex){}
    }
}

//从数组arr中随机返回num个不同的结果
function getRandArray(arr, num){
    if(num > arr.length){
        return arr;
    }

    arr.sort(function(a, b){
        return 0.5 - Math.random();
    });

    return arr.slice(0, num);
}

//显示认证图标
function showYZList(rect, cert, show, isbot){
    if(show){
        if(!isbot){
            cert.css({
                'left' : rect.left - 25,
                'top' : 13
            }).show();
        }else{
            cert.css({
                'left' : rect.left - 25,
                'bottom' : -31,
                'top' : 'auto'
            }).show();
        }
        
    }else{
        cert.hide();
    }

}

//显示更多商圈
function showMoreArea(obj, show){    
    var dpitem = obj.parentNode('.dp-item');
    if(show){
        var orzIndex = dpitem.css('z-index')||0;
        dpitem.css('z-index', orzIndex-0+10).attr('data-orzIndex', orzIndex);
        obj.addClass('srv-area-hover');
    }else{
        dpitem.css('z-index', dpitem.attr('data-orzIndex'));
        obj.removeClass('srv-area-hover');
    }
}
//规格化区域
function renderMoreArea(areas){
    if( areas.indexOf(',') == -1){
        return areas;
    }
    var aa = areas.split(/,/ig);

    var base = aa[0].replace('-','：');

    var html = '<span class="dp-area-base">'+base+'<span class="icon icon-infoarrow2 more-area"></span></span>';
    html += '<span class="dp-area-list">';
    for(var i=1, n=Math.min( aa.length, 5); i<n; i++){
        html += '<span class="dp-area-item">'+aa[i]+'</span>';
    }
    html += '</span>';

    return html;
}

;/**import from `/resource/js/include/yuyue.js` **/
tcb.Yuyue = (function(){
    var subscribe_obj = null; // 预约维修面板对象；

    tcb.bindEvent(document.body, { 

        // 激活区县的选择
        '#SubscribeWrap .select-area': function(e){
            e.preventDefault();
            var wMe = W(this);
            wMe.siblings('.area-select-pannel').fadeIn();
        },
        // 区县选择面板的相关点击操作
        '#SubscribeWrap .area-select-pannel': function(e){
            e.preventDefault();
            var wMe = W(this),
                target = e.target,
                wTarget = W(target);
            // 关闭区县选择列表
            if (wTarget.hasClass('close')) {
                wMe.hide();
            }
            // 选择区县
            if (wTarget[0].nodeName.toLowerCase()==='a') {
                var area_name = wTarget.html();
                W('#SubscribeWrap .select-area b').html(area_name);
                W('#SubscribeWrap [name="addr_area"]').val(area_name);
                wMe.hide();
                wMe.parentNode('div').siblings('.errmsg').css({'visibility':'hidden'});
            }
        },
        // 提交维修预约单
        '#SubscribeWrap .btnsubmit': {
            // 'click': function(e){
            //     e.preventDefault();
            // },
            'click': function(e){
                e.preventDefault();                
                var oSubscribeWrap = W('#SubscribeWrap'),
                    oCityCode = oSubscribeWrap.query('[name="sub_city_code"]'),  // 城市id
                    oAddrCity = oSubscribeWrap.query('[name="addr_city"]'),      // 城市
                    oAddrArea = oSubscribeWrap.query('[name="addr_area"]'),      // 区县
                    oAddrDetail = oSubscribeWrap.query('[name="addr_detail"]'),  // 详细地址
                    oDetail = oSubscribeWrap.query('[name="detail"]'),  // 问题描述
                    oDate = oSubscribeWrap.query('[name="date"]'),      // 期望服务日期
                    oType = oSubscribeWrap.query('[name="type"]'),      // 服务方式
                    //oPrice = oSubscribeWrap.query('[name="price"]'),    // 期望服务价格
                    oMobile = oSubscribeWrap.query('[name="mobile"]'),  // 手机
                    wCaptcha = oSubscribeWrap.query('[name="mobile_captcha"]'),  // 手机验证码
                    oAutoSms = oSubscribeWrap.query('[name="auto_sms"]'), // 自动发送到商家
                    error_flag = false,
                    date = oDate.val(),
                    type = oType.filter(':checked').val(),
                    price, addr_city, addr_area, addr_detail, detail, mobile,
                    wErrmsg_temp;

                wErrmsg_temp = oAddrCity.parentNode('div').siblings('.errmsg')
                if(!(addr_city = oAddrCity.val())){
                    wErrmsg_temp.html('请选择您的方位');
                    wErrmsg_temp.css({'visibility':'visible'});
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                    error_flag = false;
                }
                wErrmsg_temp = oAddrArea.parentNode('div').siblings('.errmsg');
                // 没有选择区县
                // if((addr_area=oAddrArea.val())==='选择区县'){
                if(!(addr_area=oAddrArea.val())){
                    if(!error_flag && oAddrArea.siblings('.sel-quxian').isVisible()){
                        wErrmsg_temp.html('请选择您的方位');
                        wErrmsg_temp.css({'visibility':'visible'});
                        error_flag = true;
                    }
                } else {
                    if(!error_flag){
                        wErrmsg_temp.css({'visibility':'hidden'});
                    }
                }
                // 没有选择商圈
                if(!(addr_detail=oAddrDetail.val())){
                    if(!error_flag && oAddrArea.siblings('.sel-shangquan').isVisible()){
                        wErrmsg_temp.html('请选择您的方位');
                        wErrmsg_temp.css({'visibility':'visible'});
                        error_flag = true;
                    }
                } else {
                    if(!error_flag){
                        wErrmsg_temp.css({'visibility':'hidden'});
                    }
                }
                /*if(!(addr_detail = oAddrDetail.val())){
                    if(!error_flag){
                        oAddrDetail.siblings('.errmsg').show().html('请填写您的方位信息');
                        error_flag = true;
                    }
                    oAddrDetail.focus();
                } else {
                    if(getLength(addr_detail)>22){
                        if(!error_flag){
                            oAddrDetail.siblings('.errmsg').show().html('详细地址要小于22个字符');
                            error_flag = true;
                        }
                        oAddrDetail.focus();
                    }
                    if(!error_flag){
                        oAddrDetail.siblings('.errmsg').hide().html('');
                    }
                }*/
                wErrmsg_temp = oDetail.siblings('.errmsg');
                detail = oDetail.val();
                if(!detail||detail==='请简要描述您的问题，如“我的电脑使用过程中频繁死机”'){
                    wErrmsg_temp.html('请填写您遇到的问题');
                    wErrmsg_temp.css({'visibility':'visible'});
                    if(!error_flag){
                        oDetail.val('');
                        oDetail.focus();
                    }
                    error_flag = true;
                } else {
                    if(getLength(detail)>150){
                        wErrmsg_temp.html('问题描述要小于150个字符');
                        wErrmsg_temp.css({'visibility':'visible'});
                        if(!error_flag){
                            oDetail.focus();
                        }
                        error_flag = true;
                    } else {
                        wErrmsg_temp.css({'visibility':'hidden'});
                    }
                }
                // 期望时间
                /*wErrmsg_temp = oDate.siblings('.errmsg');
                date = oDate.val();
                if (!date) {
                    wErrmsg_temp.html('请选择预约时间');
                    wErrmsg_temp.css({'visibility':'visible'});
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                }*/
                // 期望价格
                /*wErrmsg_temp = oPrice.siblings('.errmsg');
                price = oPrice.val();
                if (!price) {
                    wErrmsg_temp.html('请选择期望价格');
                    wErrmsg_temp.css({'visibility':'visible'});
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                }*/
                // 手机
                wErrmsg_temp = oMobile.siblings('.errmsg');
                mobile = oMobile.val();
                if (!mobile||mobile==='请正确填写您的号码') {
                    wErrmsg_temp.html('请填写您的号码');
                    wErrmsg_temp.css({'visibility':'visible'});
                    if(!error_flag){
                        oMobile.val('');
                        oMobile.focus();
                    }
                    error_flag = true;
                }
                else if(!tcb.validMobile(mobile)){
                    wErrmsg_temp.html('您输入的号码有误，请重新输入');
                    wErrmsg_temp.css({'visibility':'visible'});
                    if(!error_flag){
                        oMobile.focus();
                        oMobile[0].select();
                    }
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                }
                // 手机验证码(// 暂时忽略异步的回调)
                validCaptcha(wCaptcha, function(flag){
                    if (!error_flag) {
                        if (!flag) {
                            wCaptcha.focus();
                            wCaptcha[0].select();
                            error_flag = true;
                        }
                    }
                    if(error_flag){
                        return false;
                    }

                    var userAddress = addr_city+addr_area+addr_detail;
                    //逆地理编码查询回调
                    getLocationRange(userAddress, function(poi){
                        var auto_sms = oAutoSms.attr('checked') ? oAutoSms.val() : 0;

                        var request_url = '/yuyue/sub/',
                            postData = {
                                'sub_city_code': oCityCode.val()||'7',
                                'city': addr_city||"",
                                'area': addr_area||"",
                                'addr_detail': addr_detail||"",
                                'weixiu_desc': detail,
                                'qiwan_weixiu_date': date||"",
                                'server_method': type||"",
                                'qiwan_amount': price||"",
                                'mobile': mobile,
                                'secode': wCaptcha.val(),
                                'user_poi' : poi||'',
                                'auto_sms': auto_sms
                            };
                        QW.Ajax.post(request_url, postData, function(responseText){
                            try{
                                var response = QW.JSON.parse(responseText);
                                if(response['errno']){
                                    alert(response['errmsg']);
                                } else {
                                    W('#SubscribeWrap .mod-sucess-cont').show();
                                    if (auto_sms) {
                                        W('#SubscribeWrap .mod-sucess-cont').query('.auto_sms').show();
                                    } else {
                                        W('#SubscribeWrap .mod-sucess-cont').query('.not_auto_sms').show();
                                    }
                                    
                                    W('#SubscribeWrap .mod-sucess-cont').siblings('.mod-form-area').hide();
                                }
                            } catch (e){}
                        });
                    });
                    
                });
            }
        },
        // 故障描述框相关事件
        '#SubscribeWrap [name="detail"]': {
            'focus': function(e){
                var wMe = W(this),
                    detail = wMe.val();
                if (wMe.hasClass('color1')&&detail==='请简要描述您的问题，如“我的电脑使用过程中频繁死机”') {
                    wMe.val('');
                }
                wMe.removeClass('color1');
            },
            'blur': function(e){
                var oDetail = W(this),
                    detail = '',
                    wErrmsg = oDetail.siblings('.errmsg');

                if(!(detail = oDetail.val())){
                    oDetail.val('请简要描述您的问题，如“我的电脑使用过程中频繁死机”');
                    oDetail.addClass('color1');
                    wErrmsg.html('请填写您遇到的问题').css({'visibility':'visible'});
                } else {
                    if(getLength(detail)>150){
                        wErrmsg.html('故障描述要小于150个字符');
                        wErrmsg.css({'visibility':'visible'});
                    } else {
                        wErrmsg.css({'visibility':'hidden'});
                    }
                }
            }
        },
        // 验证手机号
        '#SubscribeWrap [name="mobile"]': {
            'focus': function(){
                var oMobile = W(this),
                    mobile = oMobile.val();
                if (oMobile.hasClass('color1')&&mobile==='请正确填写您的号码') {
                    oMobile.val('');
                }
                oMobile.removeClass('color1');
                oMobile.siblings('.errmsg').addClass('normalmsg').css('visibility', 'visible').html('验证码将以短信的形式发送到您的手机');
            },
            'blur': function(e){
                var oMobile = W(this);
                oMobile.siblings('.errmsg').removeClass('normalmsg');
                validMobile(oMobile);
            }
        },
        // 选择服务价格
        '#SubscribeWrap .price-list': function(e){
            var wMe = W(this),
                target = e.target,
                wTarget = W(target);
            if (target.nodeName.toLowerCase() === 'li') {
                wTarget.siblings().removeClass('actived');
                wTarget.addClass('actived');
                wMe.siblings('[name="price"]').val(wTarget.attr('value'));
                wMe.siblings('.errmsg').css({'visibility':'hidden'});
            }
        },
        // 选择日期
        '#SubscribeWrap .date-list': function(e){
            var wMe = W(this),
                target = e.target,
                wTarget = W(target);
            if (target.nodeName.toLowerCase() === 'li') {
                wTarget.siblings().removeClass('actived');
                wTarget.addClass('actived');
                wMe.siblings('[name="date"]').val( wTarget[0].getAttribute('value') );
                wMe.siblings('.errmsg').css({'visibility':'hidden'});
            }
        },
        // 验证码校验
        '#SubscribeWrap [name="mobile_captcha"]': {
            'focus': function(e){
                var wMe = W(this),
                    captcha = wMe.val();
                if (captcha==='请填写验证码') {
                    wMe.removeClass('color1').val('');
                    wMe.siblings('.errmsg').addClass('normalmsg').html('请查看手机短信').css('visibility', 'visible');
                }
            },
            'blur': function(e){
                var wMe = W(this);
                wMe.siblings('.errmsg').removeClass('normalmsg');
                validCaptcha(wMe);
            }
        },
        // 点击获取验证码
        '#SubscribeWrap .get-mobile_captcha': {
            'click': function(e){
                var wMe = W(this),
                    oMobile = wMe.siblings('[name="mobile"]'),
                    mobile = oMobile.val();
                
                if (validMobile(oMobile)) {
                    // 验证手机号格式的合法性&&可以发送
                    if (!wMe.hasClass('disabled')) {
                        wMe.addClass('disabled');
                        var txt = wMe.html(),
                            s = 60, h1, h2;
                        h1 = setTimeout(function(){
                            var arg = arguments;
                            wMe.html('剩余 '+s+' 秒');
                            if (s) {
                                s--;
                                h2 = setTimeout(function(){
                                    arg.callee();
                                }, 1000);
                            } else {
                                wMe.removeClass('disabled').html('重发验证码');
                            }
                        }, 10);
                        //var request_url = '/aj/sendsecode/',// [接口废弃]此处js是用的tpl已无Action引用
                        //    params = {
                        //        'mobile': mobile
                        //    };
                        //QW.Ajax.post(request_url, params, function(responseText){
                        //    try{
                        //        var response = QW.JSON.parse(responseText);
                        //        if (response['errcode']=='1000') {
                        //
                        //        } else {
                        //            clearTimeout(h1);
                        //            clearTimeout(h2);
                        //            wMe.removeClass('disabled').html('重发验证码');
                        //            wMe.siblings('.errmsg').removeClass('normalmsg').html(response['errmsg']).css('visibility','visible');
                        //        }
                        //    } catch(ex){}
                        //});
                    }
                } else {
                    oMobile.focus();
                }
            }
        },
        // 收不到验证码文字提示
        '#SubscribeWrap .mobile_captcha-tip': {
            'mouseenter': function(e){
                var wMe = W(this);
                wMe.siblings('.mobile_captcha-tip-block').show();
            },
            'mouseleave': function(e){
                var wMe = W(this);
                wMe.siblings('.mobile_captcha-tip-block').hide();
            }
        }
    });
    
    //初始化
    function init(){
        //直接在页面中显示，不需要处理浮层窗口等。
        var date_str = '',
            timestamp = (new Date()).getTime(),
            i = 0;
        while(i<3){
            if(i){
                timestamp += 86400000;
            }
            var oDate = new Date(timestamp);

            date_str += '<li value="'+(oDate.getFullYear())+'-'+(oDate.getMonth()+1)+'-'+oDate.getDate()+'">'+(oDate.getMonth()+1)+'月'+oDate.getDate()+'日</li>';

            i++;
        }
        var subscribe_func = W('#subscribeTpl').html().trim().tmpl(),
            subscribe_str = subscribe_func({"date":date_str});

        W('#SubscribeWrap').html( subscribe_str );
        // cur_cityname 为全局变量
        var city_name = cur_cityname;
        // W('#SubscribeWrap .select-city b').html(city_name);
        // W('#SubscribeWrap [name="addr_city"]').val(city_name);

        var city_code = cur_citycode,
            city_id = cur_cityid;
        W('#citySelector110 .sel-city').attr('code', city_code);
        W('#citySelector110 .sel-city .sel-txt').html(city_name).attr('data-code', city_code);
        W('#SubscribeWrap [name="addr_city"]').val(city_name);
        W('#SubscribeWrap [name="sub_city_code"]').val(city_id);
        // 激活面板选择
        new AreaSelect({
            'wrap': '#citySelector110',
            // 城市选择时触发
            'onCitySelect': function(data){
                W('#citySelector110 .sel-city').attr('code', data.citycode);
                W('#citySelector110 .sel-city .sel-txt').html(data.cityname).attr('data-code', data.citycode);
                W('#SubscribeWrap [name="sub_city_code"]').val(data.cityid);
                W('#SubscribeWrap [name="addr_city"]').val(data.cityname);
                W('#SubscribeWrap [name="addr_area"]').val('');
                W('#SubscribeWrap [name="addr_detail"]').val('');
            },
            // 区县选择时触发
            'onAreaSelect': function(data){
                if (typeof data.areaname!=='undefined') {
                    W('#SubscribeWrap [name="addr_area"]').val(data.areaname);
                } else {
                    W('#SubscribeWrap [name="addr_area"]').val('');
                }
                // 存在商圈
                if(W('#citySelector110 .sel-shangquan').isVisible()){
                    W('#SubscribeWrap [name="addr_detail"]').removeAttr('disabled').val('');
                } 
                else {//  不存在商圈
                    W('#SubscribeWrap [name="addr_detail"]').attr('disabled', 'disabled').val('');
                }
                
            },
            // 商圈选择时触发
            'onQuanSelect': function(data){
                if (typeof data.quanname!=='undefined') {
                    W('#SubscribeWrap [name="addr_detail"]').val(data.quanname);
                } else {
                    W('#SubscribeWrap [name="addr_detail"]').val('');
                }
            }
        });

        // // 根据当前的城市，获取当前的区县
        // // cur_citycode 为全局变量
        // getArea(cur_citycode);
        // // 选择城市
        // var cityPanel = new CityPanel('#SubscribeWrap .select-city');
        // cityPanel.on('selectCity', function(e) {
        //     var city = e.city.trim(),
        //         name = e.name.trim();

        //     var trigger = this.trigger;
        //     trigger.query('b').html(name);
        //     trigger.siblings('[name="addr_city"]').val(name);

        //     getArea(city, function(){
        //         trigger.siblings('[name="addr_area"]').val('');
        //         trigger.siblings('.select-area').query('b').html('选择区县')
        //     });
        // });
    }
    
    /**
     * 验证手机号的合法性
     * @param  {[type]} wMobile [description]
     * @return {[type]}         [description]
     */
    function validMobile(wMobile){
        var mobile  = wMobile.val(),
            wErrmsg = wMobile.siblings('.errmsg'),
            flag = false;
        if (!mobile||mobile==='请正确填写您的号码') {
            wErrmsg.html('请填写您的号码');
            wErrmsg.css({'visibility':'visible'});
            wMobile.val('请正确填写您的号码').addClass('color1');
            // wMobile.focus();
        }
        else if(!tcb.validMobile(mobile)){
            wErrmsg.html('您输入的号码有误，请重新输入');
            wErrmsg.css({'visibility':'visible'});
            wMobile.focus();
            wMobile[0].select();
        } else {
            flag = true;
            wErrmsg.css({'visibility':'hidden'});
        }
        return flag;
    }
    /**
     * 验证手机验证码
     * @param  {[type]} wCaptcha [description]
     * @return {[type]}          [description]
     */
    function validCaptcha(wCaptcha, callback){
        var captcha = wCaptcha.val(),
            captcha_reg = /^\d{6}$/,
            wErrmsg = wCaptcha.siblings('.errmsg');
        // 验证码为空
        if (!captcha) {
            wCaptcha.addClass('color1').val('请填写验证码');
            wErrmsg.html('验证码填写错误').css('visibility', 'visible');
            typeof callback === 'function' && callback(false);
        }
        // 验证码格式不对
        else if (!captcha_reg.test(captcha)){
            // wCaptcha.focus();
            // wCaptcha[0].select();
            wErrmsg.html('验证码填写错误').css('visibility', 'visible');
            typeof callback === 'function' && callback(false);
        }
        // 格式对了，校验是不是真实的..
        else {
            // 基本格式通过验证（请求服务器验证）
            var request_url = '/aj/cksecode/',
                params = {
                    'mobile': W('#SubscribeWrap [name="mobile"]').val(),
                    'secode': wCaptcha.val()
                };
            if (params.mobile==='请正确填写您的号码') {
                params.mobile = '';
            }
            wErrmsg.css('visibility', 'hidden');
            QW.Ajax.post(request_url, params, function(responseText){
                try{
                    var response = QW.JSON.parse(responseText);
                    if (response['errcode']=='1000') {
                        // do nothing
                        typeof callback === 'function' && callback(true);
                    } else {
                        wErrmsg.html(response['errmsg']||'&nbsp;').css('visibility', 'visible');
                        typeof callback === 'function' && callback(false);
                    }
                } catch(ex){typeof callback === 'function' && callback(false)}
            });
        }
    }

    /**
     * 获取城市的区县
     * @param  {[type]}   city     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function getArea(city, callback){

        var request_url = '/aj/get_area/?citycode='+city;
        QW.Ajax.get(request_url, function(responseText){
            try{
                var area_list = QW.JSON.parse(responseText)['result'];

                var options_str = '';
                QW.ObjectH.map(area_list, function(v, k){
                    options_str += '<a href="javascript:;">'+v+'</a>';
                });
                W('#SubscribeWrap .area-select-pannel .area-select-list').html(options_str);

                var wArea= W('#SubscribeWrap .select-area');
                if (options_str) {
                    // W('#SubscribeWrap .area-select-pannel').fadeIn();
                    wArea.show();
                } else {
                    // W('#SubscribeWrap .area-select-pannel').hide();
                    wArea.hide();
                }

                typeof callback === 'function' && callback();
            } catch (e){typeof callback === 'function' && callback();}
        });
    }

    /**
     * 获取字符串长度;
     * @param str
     * @returns {number}
     */
    function  getLength(str) {
        var len = str.length; 
        var reLen = 0; 
        for (var i = 0; i<len; i++) {        
            if (str.charCodeAt(i)<27 || str.charCodeAt(i)>126){ 
                // 全角    
                reLen += 2; 
            }
            else {
                reLen++; 
            }
        }
        return Math.ceil(reLen/2);
    }

    /**
     * 根据用户的填写的位置，转换为坐标。
     * @param  {[type]} adrr [description]
     * @return {[type]}      [description]
     */
    function getLocationRange(addr, callback){

        var mapBox = W('<div id="geoMapBox"></div>').appendTo( W('body') ).hide();
        var _map = new AMap.Map("geoMapBox"); 
        // 加载地理编码插件 
        _map.plugin(["AMap.Geocoder"], function() {
            MGeocoder = new AMap.Geocoder({
                city : W('.area-box-sel').html() || '',
                radius: 1000,
                extensions: "all"
            });
            //返回地理编码结果
            AMap.event.addListener(MGeocoder, "complete", function(datas){
                var pos = null;
                if(datas && datas['resultNum'] > 0 ){
                    pos = {
                        'lng': datas['geocodes'][0]['location']['lng'],
                        'lat': datas['geocodes'][0]['location']['lat']
                    }                    
                }

                callback(pos ? getBounds(pos, 5000) : '');
            });
            //逆地理编码
            MGeocoder.getLocation(addr);
        });
    }

    /**
     * 根据中心点和半径换算查询范围
     * @param  {[type]} latLng 坐标对象{lng:经度,  lat:纬度 } //如北京， 116经度，38纬度
     * @param  {[type]} radius 半径，单位米
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
 * 区域选择
 * @param {[type]} options [description]
 */
function AreaSelect(options){
    var defaults = {
        'wrap': '#citySelector110',
        'autoinit': true,
        'onInit': function(){},
        // 城市选择时触发
        'onCitySelect': function(data){},
        // 区县选择时触发
        'onAreaSelect': function(data){},
        // 商圈选择时触发
        'onQuanSelect': function(data){}
    }
    options = options || {};
    options = QW.ObjectH.mix(defaults, options, true);

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
            var url = 'http://' + location.host +'/aj/get_area/?citycode='+citycode;

            // 移除商圈选择
            me._removeAreaTrigger();
            me._removeQuanTrigger();
            QW.Ajax.get(url, function(responseText){
                try{
                    var area_list = QW.JSON.parse(responseText)['result'];

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
                } catch (e){}
            });
        }
        /**
         * 获取商圈信息
         * @param  {[type]} citycode [description]
         * @param  {[type]} areacode [description]
         * @return {[type]}          [description]
         */
        fn.getQuan = function(citycode, areacode){
            var me = this;
            var url = 'http://' + location.host +'/aj/get_areaquan/?citycode='+citycode+'&areacode='+areacode;

            // 移除商圈选择
            me._removeQuanTrigger();
            QW.Ajax.get(url, function(responseText){
                try{
                    var area_list = QW.JSON.parse(responseText)['result'];

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
                } catch (e){}
            });
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
                var tpl = W('#ClientAreaTpl').html().trim();
                wAreaTrigger = W(tpl);
                me.getWrap().appendChild(wAreaTrigger);
            }

            return me.wAreaTrigger = wAreaTrigger;
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
                var tpl = W('#ClientQuanTpl').html().trim();
                wQuanTrigger = W(tpl);
                me.getWrap().appendChild(wQuanTrigger);
            }

            return me.wQuanTrigger = wQuanTrigger;
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

                wCityTrigger.attr('code', code);
                wCityTrigger.one('.sel-txt').html(name);

                // 选择城市的时候获取区县
                me.getArea(code);

                // 设置data
                me.setData({
                    'cityid': cityid,
                    'citycode': code,
                    'cityname': name
                }, true);
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
                            wAreaTrigger.attr('code', code);
                            wAreaTrigger.query('.sel-txt').html(name);
                            // 设置data
                            me.setData({
                                'areacode': code,
                                'areaname': name
                            });
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
                        me.getQuan(data['citycode'], code);
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
                            wQuanTrigger.attr('code', code);
                            wQuanTrigger.query('.sel-txt').html(name);
                            // 设置data
                            me.setData({
                                'quancode': code,
                                'quanname': name
                            });
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

            var wCityTrigger = me._getCityTrigger(),
                code = wCityTrigger.attr('code'),
                name = wCityTrigger.query('.sel-txt').html();
            me.setData({
                'citycode': code,
                'cityname': name
            });
            me.getArea(code);
            if(typeof me.options.onInit === 'function'){
                me.options.onInit();
            }
        }
    }
    // 初始化
    me.options.autoinit && me.init();
}

    //入口
    return{
        init : init
    }
})();

//为其他页面提供调用接口
(function(){
    var subTip;
    var subscribe_obj = null;

    var appTip;

    var erweimaTip;

    //在主体内容右侧显示预约功能
    function showRightSubscribe(){

        subTip = W('.subscribe-service');
        if( subTip.length == 0 ){
            subTip = W('<div class="right-subscribe-service"><a href="#" bk="yuyue-float" class="ss-clickplace subscribe-service"></a><a href="#" class="ss-close"></a></div>').appendTo( W('body') );

            
            subTip.query('.ss-close').on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                subTip.hide();            
            });
            // 二维码
            erweimaTip = W('<div class="right-erweima"></div>').appendTo( W('body') );

            //FML，very bad...
            appTip =  W('<div class="right-phoneapp-tip"><a target="_blank" href="http://hr.bang.360.cn/" bk="app-float" class="phoneapp-tip"></a></div>').appendTo( W('body') );       
            appTip.hide(); //！！！隐藏，暂时不要了。
            _autoRightYuyuePos();
        }

        try{
            subTip.bind('click', function(e){
                e.preventDefault();
                _showYuyue();
            });
        }catch(ex){}

        W('body').delegate('#SubscribeWrap .close-pop-btn', 'click', function(){
            if(subscribe_obj != null){
                subscribe_obj.close();
            }
        });

    }

    function _autoRightYuyuePos(){
            
        W(window).on('load', _autoPos);
        W(window).on('resize', _autoPos);

        _autoPos();
    }  

    function _autoPos(){
        try{ subTip.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 10);}catch(ex){}

        try{ appTip.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 10);}catch(ex){}

        try{ erweimaTip.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 10);}catch(ex){}
    }  

    
    var PanelManager = QW.PanelManager;
    /**
     * 预约维修服务面板
     * @constructor
     */
    function SubscribePanel(options){
        var me = this;

        me.wrapId = 'SubscribeWrap'; // 包裹器的id
        me.content = '';
        me._rendered = false;   // 自动输出
        me.withMask = true;     // 遮罩
        me.posCenter = true;    // 显示在中间
        me.posAdjust = true;
        me.keyEsc = true;
        me._reopen = false;     // 重新打开
        me.oWrap = null;

        QW.ObjectH.mix(me, options, 1);

        var fn = SubscribePanel.prototype;
        if(typeof me.open==='undefined'){

            fn.render = function(){
                var me = this;

                if(!W('#'+me.wrapId).length) {
                    var oWrap = QW.DomU.createElement("div");
                    oWrap.style.display = 'none';
                    oWrap.style.position = 'absolute';
                    me.oWrap = oWrap;
                    if (me.wrapId) oWrap.id = me.wrapId;

                    oWrap.innerHTML = me.content;

                    document.body.insertBefore(oWrap, document.body.firstChild);
                } else {
                    if(me._reopen){
                        me.oWrap.innerHTML = me.content;
                    }
                }
            }

            /**
             * 打开面板
             */
            fn.open = function(){
                var me = this;

                me._rendered = true;
                me._reopen = false;
                PanelManager.showPanel(me);
            }
            /**
             * 重新打开面板
             */
            fn.reopen = function(){
                var me = this;

                me._rendered = true;
                me._reopen = true;
                PanelManager.showPanel(me);
            }
            /**
             * 关闭面板
             */
            fn.close = function(){
                var me = this;

                PanelManager.hidePanel(me);
            }
            /**
             * 关闭面板,close的别名
             */
            fn.hide = function(){
                this.close();
            }
        }
    }

    window.showRightSubscribe = showRightSubscribe;

    //显示预约窗口
    function _showYuyue(){
        if(subscribe_obj === null){
            subscribe_obj = new SubscribePanel({
                content : '<div class="close-pop-btn pngfix" style="width:30px; height:30px;background:url(https://p.ssl.qhimg.com/t0192f1144bb7a81086.png) no-repeat scroll -1px 0;position:absolute;top:-3px; right:-8px;cursor:pointer;"></div><iframe src="'+BASE_ROOT+'yuyue?win=PanelManager" allowtransparency="true" frameborder="0" scrolling="no" width=585 height=508></iframe>'
            });

            subscribe_obj.open();
        }else{
            subscribe_obj.reopen();
        }
    }

    window.openYuyueWindow = _showYuyue;

})();

Dom.ready(function(){
    if(typeof(__inYuyuePage)=="undefined" || !__inYuyuePage){//不在预约frame中时触发。
        showRightSubscribe();
    }
});

;/**import from `/resource/js/page/front.client.index.js` **/
(function(){
	var dataListCache = {};
	var __pn = 0;
	var __totalPn = 0;
	var __isLoading = false;

	var contentBox = W('#merRepairWrap');

	/**
	 * 商家维修信息
	 * @param  {[type]} pn   [description]
	 * @param  {[type]} flag [description]
	 * @return {[type]}      [description]
	 */
	function asynMerRepair(pn,flag,gdata, initData){
		var	html = '';
		var param = getMerSelectParam();
			Object.mix(param, initData, true);
			param['pn'] = pn;				
			pageSize =param.pagesize;

		if(dataListCache[Object.encodeURIJson(param)]||gdata){
			W('.no-result').hide();
			var _data = dataListCache[Object.encodeURIJson(param)]||gdata;
			_data.tplHasShowWarn = W('.no-valid-warn').length==0? false : true; //是否已经加入了未认证警告
			var func = W("#merRepairTpl").html().trim().tmpl();
			html = func(_data);

			contentBox.insertAdjacentHTML( 'beforeend', html);

			flag && merRepairPager(Math.ceil(_data.page_count/pageSize));

		}else{
			showLoading(true);
			__isLoading =true;

			QW.Ajax.get('/at/shop?from=client&'+ Object.encodeURIJson(param),function(e){
				showLoading(false);
				__isLoading = false;

				var ret = e.evalExp();
				ret.tplHasShowWarn = W('.no-valid-warn').length==0? false : true; //是否已经加入了未认证警告

				if(parseInt(ret.errno)!==0 && __pn==0){
					W('.no-result').show();
				}else{
					if(ret.shop_data.length==0 && __pn==0){
						W('.no-result').show();
					}else{
						W('.no-result').hide();
						dataListCache[Object.encodeURIJson(param)] = ret;
						var func = W("#merRepairTpl").html().trim().tmpl();
						html = func(ret);
					}
				}

				contentBox.insertAdjacentHTML( 'beforeend', html);
				
				flag && merRepairPager(Math.ceil(ret.page_count/pageSize));

			});
		}


	}

	/**
	 * 商家维修分页
	 * @return {[type]} [description]
	 */
	function merRepairPager(pagenum){
		__totalPn = pagenum;
	}

	/**
	 * 获得商家进行过滤的参数
	 */
	function getMerSelectParam(){
		var cityselector = W('#citySelector');
		var srid = location.href.queryUrl('service_id') || 0;		
		return {
			'city_id': cityselector.one('.sel-city').attr('code')||'',
			'area_id': cityselector.one('.sel-quxian').attr('code') || '',
			'quan_id': cityselector.one('.sel-shangquan').attr('code')||'',
			'service_id': srid,
			'type_id':W("#dianpuSort").attr('data-type'),						
			'pagesize':18
		}

	}

	function bindEvent(){
		tcb.bindEvent(document.body, { 						
			'.sort-type-list' : {
				'click' : function(e){

					if( W(this).one('.dianpu-sort').css('display')=='none' ){
						W(this).one('.dianpu-sort').show();
					}else{
						W(this).one('.dianpu-sort').hide();
					}
				}
			},
			'.dianpu-sort li' : function(e){				
				if( W(this).hasClass('active') ){
					//do nothing..					
				}else{
					W(this).addClass('active').siblings('.active').removeClass('active');
					//W('.dianpu-sort').hide();
					W('#dianpuSort').html( W(this).html().trim() ).attr('data-type', W(this).attr('data-type') );

					resetParam();
					asynMerRepair(0,true);	
				}			
			}
		});

		W('body').bind('click', function(e){			
			if( W('.sort-type-list .dianpu-sort').css('display')!='none' && !(W('.sort-type-list').contains(e.target) ||   W('.sort-type-l')[0] == e.target) ){
				W('.sort-type-list .dianpu-sort').hide();
			}
		});

		W('.page-client .client-body').bind('scroll', function(e){
			var dpArea = W(this).one('.dianpu-area');
			var boxST = W(this).attr('scrollTop');
			var boxCH = W(this).getRect().height;

			if( !__isLoading && (__pn < __totalPn-1) && (boxCH + boxST +50 >= dpArea.getRect().height) ){
				__pn++;				
				asynMerRepair(__pn, true);

			}
		});

		W('#addrSearchForm').bind('submit', function(e){
			e.preventDefault();
			var _this = this;
			var ipt = W(this).one('[name="addr"]');
			var txt = ipt.val();
			if( txt =='' || txt == ipt.attr('data-default') ){
				/*ipt.focus();
				if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(ipt);*/
				ipt.val('');
				W(this).attr('action', '/client/findshop'); //没有输入地址时跳转到区县筛选	
				setTimeout( function(){ W(_this)[0].submit(); },100);
			}else{
				W(this).attr('action', '/client/distance');
				setTimeout( function(){ W(_this)[0].submit(); },100);
			}
		});
	}

	function showLoading(isshow){
		var loadHTML = W("#loadingTpl").html();
		if(isshow){
			W('.dianpu-area').one('.loading-content').show();
		}else{
			W('.dianpu-area').one('.loading-content').hide();
		}
	}

	function resetParam(){		
		__pn = 0;
		__totalPn = 0;
		__isLoading = false;
		contentBox.html('');

	}

	function initAddrSearch(obj){
		new AddrSuggest(obj, {
			'showNum' : 6,
			'onSelect' : doAddrSearch,
			'requireCity' : function(){ return W('#citySelector .sel-city .sel-txt').html() || '' }
		});
	}

	function doAddrSearch(txt){		
		W('#addrSearchForm').fire('submit');
	}

	//尝试获取位置并搜索
	function getLocationAndSearch(){
		resetParam();
		var addr = W('#addrSearchForm [name="cityname"]').val() + W('#addrSearchForm [name="areaname"]').val() + W('#addrSearchForm [name="addr"]').val()||search_addr; //模板中赋值
		getGeoPoi(addr, function(poi){
			__lngLat = poi;
			asynMerRepair(0,true);
		});
	}

	function init(){
		var urlarea = window.location.search.queryUrl('area_id');
		if(urlarea){
			asynMerRepair(0,true, null, {'area_id':urlarea});
		}else{
			asynMerRepair(0,true);
		}		

		//选择城市，刷新页面
		// selectCity('.citypanel_trigger');

		bindEvent();

        // 激活面板选择
        new bang.AreaSelect({
        	//when initial, set the default addr.
        	'data':{
	        	'areacode': window.location.search.queryUrl('area_id')||'',
	            'areaname': window.location.search.queryUrl('areaname')||''
            },
        	// 城市选择时触发
	        'onCitySelect': function(data){
	        	//reset form data
	        	W('#addrSearchForm [name="cityname"]').val( data.cityname );
	        	W('#addrSearchForm [name="city"]').val( data.citycode );	        	
	        	W('#addrSearchForm [name="areaname"]').val( '' );
	        	W('#addrSearchForm [name="area_id"]').val( '' );
	        	
	        	//set cookie.
	        	QW.Cookie.set('CITY_NAME', data.cityid+'|'+data.citycode+'|'+data.cityname,{'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });
	        	new Image().src = "/aj/qiehuan_city/?citycode=" + data.citycode;  //Do this make the browser city cookie change.

	        	//change the BREAD txt
	        	W('.search-tit .bread-city').html( data.cityname  );

	        	//get shop data.
	        	resetParam();
	        	asynMerRepair(0,true);	 
	        },
	        // 区县选择时触发
	        'onAreaSelect': function(data){
	        	//reset form data
	        	W('#addrSearchForm [name="cityname"]').val( data.cityname ||'' );
	        	W('#addrSearchForm [name="areaname"]').val( data.areaname ||'' );
	        	W('#addrSearchForm [name="area_id"]').val( data.areacode ||'' );

	        	resetParam();
	        	asynMerRepair(0,true);	        	
	        },
	        // 商圈选择时触发
	        'onQuanSelect': function(data){
	        	resetParam();
	        	asynMerRepair(0,true);
	        	W('.search-tit .bread-city').html( data.cityname + "-" + data.areaname + (data.quanname? "-" + data.quanname : '') );
	        }
        }); 

        initAddrSearch('#addrSearchForm .addr-ipt');     
	}

	init();
})();
