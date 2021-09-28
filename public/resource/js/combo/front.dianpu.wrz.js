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

;/**import from `/resource/js/include/shop.func.js` **/
var shopFunc = shopFunc || (function(){

	function getPrdText(obj){
		var _this = obj;
		var url = window.location.href.replace(/(&|\?)?inclient=\d/ig, '');
		var pname = _this.attr('data-pname');
		var sname = _this.attr('data-sname');
		var txt = pname +'-'+ sname +'-'+ '360同城帮电脑维修' + '，详情请访问： ' +url;

		return txt;
	}

	function getShopText(obj){
		var _this = obj;
		var url = window.location.href.replace(/(&|\?)?inclient=\d/ig, '');		
		var sname = _this.attr('data-sname');
		var txt = sname +'-'+ '360同城帮电脑维修' + '，详情请访问： ' +url;

		return txt;
	}

	function getText(obj, type){
		var txt;
		if(type == 'product'){
			txt = getPrdText(obj);
		}else{
			txt = getShopText(obj);
		}

		return txt;
	}

	function getMsgText(obj, type){
		return obj.attr('data-msgtxt');		
	}

	function getData(obj, type){
		var _this = obj;

		if(type == 'product'){
			var pid = _this.attr('data-pid');
			var sid = _this.attr('data-sid');

			return { 'product_id' : pid, 'shop_id' : sid }
		}else{						
			var sid = _this.attr('data-sid');

			return { 'shop_id' : sid }
		}		
	}
	
	function shareLink(obj, type){
		
		var txt = getText(obj, type);
		if( typeof(_inclient)!='undefined' && _inclient ){
			var btn = [
				{
					txt: "复制",
					fn: function(){
						try{
							textarea[0].select(); 
	 						document.execCommand("Copy");
	 						alert('复制成功~');
						}catch(ex){
							alert('抱歉，复制失败，请使用 Ctrl+C 进行复制');
						}
					},
					cls: "ok"
				}, {
					txt: "关闭",
					fn: function(){
						return true;
					}
				}
			];

		}else{
			var btn = [
				{
					txt: "关闭",
					fn: function(){
						return true;
					}
				}
			];
		}

		var panel = tcb.panel("分享",'<div style="padding:10px"><h3 style="font-size:14px;font-weight:bold;margin-bottom: 8px;">复制当前商品信息分享给好友：</h3><textarea style="width:350px; height:76px;padding:5px; border:1px solid #CCCCCC;">'+txt+'</textarea></div>', {'width':380, 'height':220, 'wrapId':"panel-shareLink", 'btn': btn });

		var textarea = W(panel.oBody).one('textarea');
		textarea.on('mouseover', function(){
			setSelectRange( this, 0, this.value.length );
		});
		
	}

	function _sendToPhone(obj, type){
		
		var data = getData(obj, type);
		var txt = getMsgText(obj, type);

		var panel = tcb.panel("发送到手机",'<div style="padding:10px 20px;" class="clearfix"><div style="float:left; width:190px;"><div style="color:#666;border:1px solid #ccc; background:#FCFADE; padding:5px;height: 112px; overflow-y:auto">'+txt+'</div></div><div style="float:right; width:140px;"><h3 style="font-size:14px;font-weight:bold;margin-bottom: 8px;color:#777;">请输入您的手机号码</h3><form><input name="user-tel" style="width:130px; height:20px;padding:5px; border:1px solid #CCCCCC;"><div style="line-height:30px; color:#999;">每个用户每日限发送3次</div><input class="btn-send2phone" type="submit" value="确定发送" ></form></div></div>', {'width':380, 'height':180, 'btn_name': '关闭','wrapId':"panel-sendLink"}, function(){return true;});

		var form = W(panel.oBody).one('form');
		form.on('submit', function(e){
			e.preventDefault();

			var tel = W(this).one('[name="user-tel"]');			

			if( tel.val() !='' && /\d{11}/.test(tel.val()) ){
				data.mobile = tel.val();

				var url = '/aj/fen_xiang';

				QW.Ajax.post( url, data, function(data){
					var rs = JSON.parse( data );
					if(rs.errno == 0){
						alert('发送成功~');
					}else{
						alert('抱歉，出错了，请稍后再试。'+ rs.errmsg);
					}
				});
			}else{
				tel.shine4Error().focus();
			}
		});
	}

	function sendToPhone(obj, type){
		//必须登录
		QHPass.when.signIn(function(){
			_sendToPhone(obj, type);
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

	return{
		'shareLink' : shareLink,
		'sendToPhone' : sendToPhone
	}
})();




;/**import from `/resource/js/page/front.dianpu.wrz.js` **/
/**
 * 店铺首页
 * @return {[type]} [description]
 */
(function(){	
    var JuBaoPanel = null;
	tcb.bindEvent(document.body, {
		//切换搜索tab
		'.search-hot-word a':function(e){
			e.preventDefault();
			W(".search-hot-word").query('a').removeClass('curr');
			W(this).addClass('curr');
			W('.tcb-top-search input[name="stype"]').val( W(this).attr('data-type') );
			W('.ac_wrap').hide();

            var typeid = W(this).attr('data-type')||0;
            var defKeyword = ['上门安装调试路由器', '系统安装', '笔记本除尘清灰', '手机刷机', '打印机维修', '服务器检测' ];
            var ckey = defKeyword[typeid];
            W('#360tcb_so').val(ckey).attr('data-default', ckey);
		},
		//查看电话
		'a.see-phone':function(e){
			e.preventDefault();
			var box = W(this).parentNode('.telnum');
			W(".xd-baozhang").show();
			W(this).hide();
			var tel = W(this).attr('data-tel');
			box.one('strong').html(tel);
			box.one('.connect-tip').css('visibility','visible');
			new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu_noauth"  +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
		},
		'a.see-phone2':function(e){
			e.preventDefault();
			var box = W(this).parentNode('.telnum');
			W(this).hide();
			var tel = W(this).attr('data-tel');
			box.one('strong').html(tel);
			box.one('.connect-tip').css('visibility','visible');
			new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu_noauth" +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=2' : '' );
		},
        //客户端查看电话
        'strong.see-phone':function(e){
            e.preventDefault();         
            var tel = W(this).attr('data-tel');
            W(this).html(tel);
            new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu_noauth" +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
        },
        //分享
        '#shareShop' : function(e){
            e.preventDefault(); 
            var _this = W(this);
            shopFunc.shareLink(_this, 'shop');
        },
        //发送到手机
        '#sendToPhone' : function(e){
            e.preventDefault(); 
            var _this = W(this);
            shopFunc.sendToPhone(_this, 'shop');
        },
		//关闭电话提示
		'.xd-baozhang .xdbz-close' : function(e){
			W(".xd-baozhang").hide();
		},
		// 激活举报表单
		'#JuBaoButton': function(e){
			e.preventDefault();

            var jubao_func = W('#JuBaoPanelTpl').html().trim().tmpl(),
                jubao_str = jubao_func();

            JuBaoPanel = tcb.panel('举报该信息', jubao_str, {
            	'wrapId': 'JuBaoPanel',
                'width': 577
            });
		},
		// 提交举报表单
		'.sub_jubao': function(e){
			var wJubaoid = W('[name="jubaoid"]').filter(':checked'),
				wProgram_desc = W('[name="program_desc"]'),
				wLink_phone = W('[name="link_phone"]');

            var program_desc = wProgram_desc.val(),
                link_phone = wLink_phone.val();
            // 验证jubaoid
            // 验证问题描述
            // 验证联系电话
			if (!validJubaoId(wJubaoid) || !validProgramDesc(wProgram_desc) || !validLinkPhone(wLink_phone)) {
                return ;
			}

			var params = {
				'jubaoid': wJubaoid.val(),
				'shopid': shop_id,
				'qid': host_qid,
				'program_desc': program_desc,
				'link_phone': link_phone
			};
			var request_url = base_url+'aj/jubaoshop/?'+QW.ObjectH.encodeURIJson(params);
			QW.loadJsonp(request_url, function(response){
                if (response['errno']==0) {
                    // JuBaoPanel.hide();

                    var jubao_func2 = W('#JuBaoPanel2Tpl').html().trim().tmpl(),
                    jubao_str2 = jubao_func2();

                    var JuBaoPanel2 = tcb.panel('举报该信息', jubao_str2, {
                        'wrapId': 'JuBaoPanel2',
                        'width': 268
                    });
                    JuBaoPanel2.on('beforehide', function(){
                        JuBaoPanel.hide();
                    });
               }
			});
		},
        // 举报描述
		'.program_desc': {
			'focus': function(e){
				var wMe = W(this);

                if (wMe.hasClass('unactived')) {
                    wMe.removeClass('unactived').val('');
                }
			},
            'blur': function(e){
                var wMe = W(this);

                if (wMe.val().trim()==='') {
                    wMe.addClass('unactived').val(wMe.attr('textholder'));
                }
            }
		},
        // 联系电话
        '.link_phone': {
            'focus': function(e){
                var wMe = W(this);

                if (wMe.hasClass('unactived')) {
                    wMe.removeClass('unactived').val('');
                }
            },
            'blur': function(e){
                var wMe = W(this);

                if (wMe.val().trim()==='') {
                    wMe.addClass('unactived').val(wMe.attr('textholder'));
                }
            }            
        }
	});
    function validJubaoId(wObj){
        var flag = true;
        if (!wObj.length) {
            alert('请选择举报内容');
            flag = false;
        }
        return flag;
    }
    function validProgramDesc(wObj){
        var flag = true;
        if (wObj.hasClass('unactived')) {
            alert('请填写问题描述');
            flag = false;
        }
        return flag;
    }
    function validLinkPhone(wObj){
        var flag = true;
        if (wObj.hasClass('unactived')) {
            alert('请填写问题联系电话');
            flag = false;
        }
        else if (!tcb.validMobile(wObj.val())) {
            alert('手机号码填写不正确');
            flag = false;
        }
        return flag;
    }

	/**
	 * 入口
	 * @return {[type]} [description]
	 */
	function init(){

	}

	init();


tcb.bindEvent(document.body, {
    // 最小化底部导航
    '.client-bottom-nav .close': function(e){
        e.preventDefault();

        QW.Cookie.set('CLIENT_BOTTOM_NAV_HIDDEN', '1', {'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });


        W('.client-bottom-nav').slideUp(400, function(){
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
        W('.client-bottom-nav').slideDown();
    }
});

function bindEvent(){
    W('#addrSearchForm').bind('submit', function(e){
        e.preventDefault();
        var _this = this;
        var ipt = W(this).one('[name="addr"]');
        var txt = ipt.val();
        if( txt =='' || txt == ipt.attr('data-default') ){
            /*ipt.focus();
            if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(ipt);*/
            ipt.val('');
            W(this).attr('action', base_url+'client/findshop'); //没有输入地址时跳转到区县筛选    
            setTimeout( function(){ W(_this)[0].submit(); },100);
        }else{
            W(this).attr('action', base_url+'client/distance');
            setTimeout( function(){ W(_this)[0].submit(); },100);
        }
    });
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


Dom.ready(function(){
    // cookie控制客户端底部导航的显示
    if (QW.Cookie.get('CLIENT_BOTTOM_NAV_HIDDEN')) {
        W('.client-bottom-nav-upbutton').show();
    } else {
        W('.client-bottom-nav').show();
    }

    if(W('#addrSearchForm').length>0){ //只在有相关搜索框时才触发相应逻辑
        bindEvent();
        initAddrSearch('#addrSearchForm .addr-ipt');
        // 激活面板选择
        new bang.AreaSelect({
            //when initial, set the default addr.
            'data':{
                'areacode': window.location.search.queryUrl('area_id')||'',
                'areaname': window.location.search.queryUrl('areaname')||''
            },
            'urlhost' : 'http://bang.360.cn/',
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

                //清空当前搜索项
                W('#addrSearchForm [name="addr"]').val(''); 
                //切换区县
                doAddrSearch();
            },
            // 区县选择时触发
            'onAreaSelect': function(data){
                //reset form data
                W('#addrSearchForm [name="cityname"]').val( data.cityname ||'' );
                W('#addrSearchForm [name="areaname"]').val( data.areaname ||'' );
                W('#addrSearchForm [name="area_id"]').val( data.areacode ||'' );

                //清空当前搜索项
                W('#addrSearchForm [name="addr"]').val(''); 
                //切换区县
                doAddrSearch();             
            },
            // 商圈选择时触发
            'onQuanSelect': function(data){
                
            }
        }); 
    }
});
})();
