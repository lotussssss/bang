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

;/**import from `/resource/js/component/comservice_yuyue.js` **/
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

;/**import from `/resource/js/page/front.dianpu.js` **/
/**
 * 店铺首页
 * @return {[type]} [description]
 */
(function(){
    var JuBaoPanel = null;
	tcb.bindEvent(document.body, {
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
		/**
		 * 用户协议
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'.agreement img' : function(e) {
			e.preventDefault();
			var panel = tcb.alert("360同城帮声明", W('#showUserProtocalTpl_dp').html(), {'width':695}, function(){
	                panel.hide();
	            });
		},
		/**
		 * 服务类型
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'#itemServiceType a':function(e){
			e.preventDefault();
			var that = W(this);
			W("#itemServiceType li").forEach(function(item){
				W(item)[0].className = '';
			});
			that.parentNode('li').addClass('active');

			asynItemService(that.attr('data-type'),0,true);

		},
		/**
		 * 推荐商家
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'#itemServiceTypeRecom a':function(e){
			e.preventDefault();
			var that = W(this);
			W("#itemServiceTypeRecom li").forEach(function(item){
				W(item)[0].className = '';
			});
			that.parentNode('li').addClass('active');

			asynItemServiceRecom(that.attr('data-type'));

		},
		/**
		 * 用户评论
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'#userCommentType a':function(e){
			e.preventDefault();
			var that = W(this);
			W("#userCommentType li").forEach(function(item){
				W(item)[0].className = '';
			});
			that.parentNode('li').addClass('active');

			asynUserComment(that.attr('data-type'),0,true);

		},
		/**
		 * 搜索
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'input.service':function(e){
			if(!W("#itemSearchKey").val()){
				W("#itemSearchKey").shine4Error().focus();
				return;
			}

			W('#shopSubMenu [data-rel="prd-list"]').fire('click');

			searchItemService(encodeURIComponent(W("#itemSearchKey").val()),0,true);

		},
		'#itemService li':{
			'mouseenter':function(e){
				//处理ie8下就可以了
				if(QW.Browser.ie<8){
					var e = window.event||e,
						target =e&& e.target;
					if(target&&target.tagName.toLowerCase()=="li"){
						W(target).addClass('hover');
					}
				}



			},
			'mouseleave':function(e){
				if(QW.Browser.ie<8){
					W("#itemService li").removeClass('hover');
				}
			}
		},
		'.go-itemservice':function(e){

			W("#itemServiceType").show();
			W("#searchResult").html('').hide();
			W("#itemServiceType li").removeClass('active');
			W("#itemServiceType").firstChild('li').addClass('active');
			asynItemService(W("#itemServiceType .active a").attr('data-type'),0,true);
		},
		'a.see-phone':function(e){
			e.preventDefault();
			//W("#detail").addClass('detail show');
			W(".xd-baozhang").show();
			W(this).hide();
			var tel = W(this).attr('data-tel');
			W('.contact strong').html(tel);
			new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu" +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
		},
		//客户端查看电话
		'strong.see-phone':function(e){
			e.preventDefault();
			var tel = W(this).attr('data-tel');
			W(this).html(tel+ (typeof(_inclient)!='undefined'?'':'<span style="color:#4BAC20;margin-left:10px;">联系我时，请说是在360同城帮上看到的，谢谢！</span>'));
			new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu" +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
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
		'.tab .more-fenlei' : function(e){
			e.preventDefault();
			if(W(this).one('.icon-infoarrow2').length>0){
				W(this).one('.icon-infoarrow2').replaceClass('icon-infoarrow2', 'icon-infoarrow-up')
				W(this).parentNode('.tab').css({
					'height' : 'auto'
				});
			}else{
				W(this).one('.icon-infoarrow-up').replaceClass('icon-infoarrow-up', 'icon-infoarrow2')
				W(this).parentNode('.tab').css({
					'height' : 38
				});
			}
		},
        // 显示认证相关信息
        '.rz-360': {
            'mouseenter': function(e){
                var wMe = W(this);

                var xy = wMe.xy(),
                    h_xy = wMe.parentNode('h3').xy();

                wMe.siblings('.cert').css({
                    'display': 'block',
                    'left': (xy[0]-h_xy[0]-10)+'px',
                    'top': (xy[1]-h_xy[1]-7)+'px'
                });
            }
        },
        '.cert-top, .cert-list': {
            'mouseenter': function(e){
                var wMe = W(this);

                var wCert = wMe.parentNode('.cert'),
                    xy = wCert.siblings('.rz-360').xy(),
                    h_xy = wCert.parentNode('h3').xy();
                wCert.css({
                    'display': 'block',
                    'left': (xy[0]-h_xy[0]-10)+'px',
                    'top': (xy[1]-h_xy[1]-7)+'px'
                });
            },
            'mouseleave': function(e){
                var wMe = W(this);
                if (!(W(e.relatedTarget).hasClass('cert-list') || W(e.relatedTarget).hasClass('cert-top'))) {
                    wMe.parentNode('.cert').hide();
                }
            }
        },
		// '.show-yzlist' : function(e){
		// 	e.preventDefault();
		// 	var cert = W(this).parentNode('.rz-360');
		// 	if( cert.hasClass('show-cert') ){
		// 		cert.removeClass('show-cert');
		// 	}else{
		// 		cert.addClass('show-cert');
		// 	}

		// },
		'.see-big-map': function(e){
			e.preventDefault();

			var el = W(this);

			new bigMap().show(el.attr('data-shopid'));
		},
		'.xd-baozhang .xdbz-close' : function(e){
			W(".xd-baozhang").hide();
		},
		//展开商品介绍
		'.service-item-list .link-desc-more' : function(e){
			e.preventDefault();
			W(this).parentNode('p').hide().siblings('.desc-more').show();
		},
		//收起商品介绍
		'.service-item-list .link-desc-mini' : function(e){
			e.preventDefault();
			W(this).parentNode('p').hide().siblings('.desc-mini').show();
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
        },
        // 客户端显示详细地图
        '.client-show-map': function(e){
            e.preventDefault();

			var el = W(this);

			new bigMap().show(el.attr('data-shopid'), true);
        },
        // 显示完整号码
        '#ClientShowBigMap .pop-window .tel a': function(e){
            e.preventDefault();

            var wMe = W(this),
                tel = wMe.attr('data-tel');

            wMe.siblings('.tel-num').html(tel);
            wMe.hide();
            wMe.siblings('.tel-tip').show();

            new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu_map2&inclient=1";
        },
        // 显示完整的评论内容
        '.comment-content-more': function(e){
            e.preventDefault();

            var wMe = W(this),
                wP = wMe.parentNode('p');

            wP.html(wP.attr('title').encode4Html()).css({
                'height': 'auto'
            });
        },
        //快速预约表单
        '#fastYuyueForm' : {
        	'submit' : function(e){
        		e.preventDefault();
        		var w_this = W(this),
        			w_content = w_this.one('[name="content"]'),
        			w_mobile = w_this.one('[name="mobile"]');
        		if(w_content.val().trim()==''){
        			w_content.shine4Error();
        			return;
        		}

        		if(w_content.val().trim().length > 50){
        			w_content.shine4Error();
        			alert('您最多可以输入50个字');
        			return;
        		}

        		if(w_mobile.val().trim()=='' || w_mobile.val().length!=11){
        			w_mobile.shine4Error();
        			return;
        		}

        		QHPass.when.signIn(function(){
	        		QW.Ajax.post( '/aj/fen_xiang' , { 'mobile':w_mobile.val().trim(), 'msg' : w_content.val().trim(), 'shop_id': w_this.one('[name="shop_id"]').val(), 'act':'yuyue'}, function(data){
	        			data = JSON.parse(data);
	        			if( data.errno == 0 ){
	        				tcb.alert('提交成功', '<div style="padding:10px;font-size:13px;">您的预约已经提交成功~，稍后商家会联系您进行维修</div>', {width: 240, height:140}, function(){ return true});
	        			}else{
	        				tcb.alert('提交失败', '<div style="padding:10px;font-size:13px;">抱歉出错了，请您稍后再试。'+data.errmsg+'</div>', {width: 240, height:140}, function(){ return true});
	        			}
	        		});
        		});
        	}
        },
        '#fastYuyueForm [name="mobile"]' : {
        	'keyup' : function(e){
        		W(this).val( W(this).val().replace(/\D/g, '') );
        	}
        },

        '.go-yuyue-buy' : function(e){
            e.preventDefault();
            var shopid = W(this).attr('data-shopid'),
                productid = W(this).attr('data-productid');
            ( typeof(ComServiceYuyue)!='undefined') && ComServiceYuyue.show(shopid, productid);
        },
        '.js-talk-trigger' : function(e){
        	e.preventDefault();
        	try{
        		window.external.FolkStartConsult( W(this).attr('data-jid') );
        	}catch(ex){
        		alert("抱歉，出错了，请您更新或安装360安全卫士。");
        	}
        },
        '.js-service-trigger' : function(e){
        	e.preventDefault();
        	try{
        		window.external.FolkExpertDetail( W(this).attr('data-jid') );
        	}catch(ex){
        		alert("抱歉，出错了，请您更新或安装360安全卫士。");
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

    //是否显示维修分类后面的更多箭头
    function checkShowMoreFenlei(){
    	var box1 = W('#itemServiceType');
    	var list1 = box1.query('>li');
    	var moreBtn1 =  box1.siblings('.more-fenlei');
    	if( list1.last().getRect().top - list1.first().getRect().top > 10 ){
    		moreBtn1.show();
    	}else{
    		moreBtn1.hide();
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

	var dataListCache = {};
	/**
	 * 异步处理项目服务数据
	 * @param  {[type]} type [类型]
	 * @param  {[type]} pn   [分页]
	 * @return {[type]}      [description]
	 */
	function asynItemService(type,pn,flag,gdata){
		type = type|| "";
		pn = pn || 0;

		var html = "",
			item;

		var params = "pagesize=10&shop_id="+shop_id+"&service_id="+type+"&pn="+pn+"&_t=";

		if(dataListCache[params]||gdata){
			var _data = dataListCache[params]||gdata;
			flag && itemServicePager(Math.ceil(_data.page.page_count/10));
			var func = W('#itemServiceTpl').html().trim().tmpl();
			html = func(_data);
			W("#itemService").html(html);

			//缓存第一页数据
			if(gdata){ dataListCache[params] = gdata; }

			//滚动到列表内容顶部. 只在itemid参数传递时有效
			if(window.location.search.indexOf('itemid')>-1){
				try{
					W('a[name="dpsearch"]')[0].scrollIntoView(true);
					document.documentElement.scrollLeft=0;

						var firstDesc = W('.service-item-list .desc-mini').item(0);
						firstDesc.query('.link-desc-more').item(0).fire('click');

				}catch(ex){

				}
			}

			//显示搜索结果提示
			showSearchRsTip();
		}else{
			loadJsonp( BASE_ROOT +"dianpu/product?"+params,function(ret){
				if(ret.errno!==0){
					html = '<div class="li-nodata">暂无数据。</div>';
				}else{
					if(ret.page.page_count==0){
						html ='<div class="li-nodata">暂无数据。</div>';
					}else{
						dataListCache[params] = ret;
						flag && itemServicePager(Math.ceil(ret.page.page_count/10));
						var func = W('#itemServiceTpl').html().trim().tmpl();
						html = func(ret);
					}
				}

				W("#itemService").html(html);

				try{ W('a[name="dpsearch"]')[0].scrollIntoView(true); document.documentElement.scrollLeft=0;}catch(ex){}
			})
		}
	};

	/**
	 * 异步推荐商品
	 * @param  {[type]} type [类型]
	 * @param  {[type]} pn   [分页]
	 * @return {[type]}      [description]
	 */
	function asynItemServiceRecom(type,pn){
		type = type|| "";
		pn = pn || 0;

		var html = "",
			item,
			resShowBox = W("#itemServiceRecom");

		var params = "tuijian=1&pagesize=10&shop_id="+shop_id+"&service_id="+type+"&pn="+pn+"&_t=";

		if(dataListCache[params]){
			var _data = dataListCache[params]||gdata;

			var func = W('#itemServiceTpl').html().trim().tmpl();

			html = func(_data);

			resShowBox.html(html);

		}else{
			loadJsonp( BASE_ROOT +"dianpu/product?"+params,function(ret){
				if(ret.errno!==0){
					html = '<div class="li-nodata">暂无数据。</div>';
				}else{
					if(ret.page.page_count==0){
						html ='<div class="li-nodata">暂无数据。</div>';
					}else{
						dataListCache[params] = ret;

						var func = W('#itemServiceTpl').html().trim().tmpl();
						html = func(ret);
					}
				}

				resShowBox.html(html);

			})
		}
	};

	function searchItemService(word,pn,flag){
		// type = type|| "";
		pn = pn || 0;

		var html = "",
			item;

		loadJsonp(BASE_ROOT + "dianpu/search/?pagesize=4&shop_id="+shop_id+"&service_id=&keyword="+word+"&pn="+pn+"&_t="+Math.random(),function(ret){
			if(ret.errno!==0){
				html = '<div class="li-nodata">暂无数据。</div>';
			}else{

				if(flag){
					searchServicePager(Math.ceil(ret.page.page_count/10));
					W("#itemServiceType").hide();
					W("#searchResult").html('<li>共找到'+ret.page.page_count+'个与<span style="color:red;padding:0 3px">"'+W("#itemSearchKey").val().encode4Html()+'"</span>相关的产品 <span style="padding-left:10px;" class="go-itemservice">返回>></span></li>').show();
				}

				if(ret.length==0){
					html = '<div class="li-nodata">暂无数据。</div>';
				}else{
					var func = W('#itemServiceTpl').html().trim().tmpl();
					html = func(ret);

				}
			}

			W("#itemService").html(html);

		})



	};
	/**
	 * 异步处理用户评论数据
	 * @param  {[type]} type [服务类型]
	 * @param  {[type]} pn   [分页]
	 * @param  {[type]} flag [是否绘制分页组件]
	 * @return {[type]}      [description]
	 */
	function asynUserComment(type,pn,flag){
		type = type|| "";
		pn = pn || 0;
		flag = flag|| false;

		var html = "",
			item,
			pagesize = 10;

		var params =  "pagesize="+pagesize+"&shop_id="+shop_id+"&service_id="+type+"&pn="+pn+"&_s=";

		if(dataListCache[params]){

			var _data = dataListCache[params];
			flag&&userCommentPager(Math.ceil(_data.page.comm_total/_data.page.pagesize));
			var func = W('#userCommentTpl').html().trim().tmpl();
			html = func(_data);
			W("#userComment").html(html);

		}else{
			loadJsonp(BASE_ROOT +"dianpu/comments?"+ params,function(ret){
				var  data = ret.result;
				if(ret.errno!==0){
					html = '<div class="li-nodata">暂无数据。</div>';
				}else{

					!type && W("#comment_num").html(data.page.comm_total||'0');

					if(data.comm.length==0){
						html='<div class="li-nodata">暂无数据。</div>';
					}else{
                        // console.log(data)
                        if (data['comm'] && data['comm'].length) {
                            data['comm'].forEach(function(item){
                                item['order_id'] = item['order_id'].replace(/^(\d{9})\d+(\d{4})$/, '$1******$2');
                            });
                        }
						dataListCache[params] = data;
						flag&&userCommentPager(Math.ceil(data.page.comm_total/data.page.pagesize));
						var func = W('#userCommentTpl').html().trim().tmpl();
						html = func(data);
					}

				}

				W("#userComment").html(html);

			})

		}

	}

	/**
	 * 项目服务分页
	 * @return {[type]} [description]
	 */
	function itemServicePager(pagenum){
		if(pagenum==1){
			W('#itemServicePager .pages').html('');
			return;
		}
		var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
	    var pager = new Pager(W('#itemServicePager .pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
 			asynItemService(W("#itemServiceType .active a").attr('data-type'),e.pn);
	    });
	}
	/**
	 * 搜索结果分页
	 * @param  {[type]} pagenum [description]
	 * @return {[type]}         [description]
	 */
	function searchServicePager(pagenum){
		if(pagenum==1){
			W('#itemServicePager .pages').html('');
			return;
		}
		var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
	    var pager = new Pager(W('#itemServicePager .pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
 			searchItemService(encodeURIComponent(W("#itemSearchKey").val()),e.pn);
	    });
	}
	/**
	 * 用户评论分页
	 * @return {[type]} [description]
	 */
	function userCommentPager(pagenum){
		if(pagenum==1){
			W('#userCommentPager .pages').html('');
			return;
		}
		var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
	    var pager = new Pager(W('#userCommentPager .pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
	        asynUserComment(W("#userCommentType .active a").attr('data-type'),e.pn);
	    });
	}

	function showMiniMap(){
		//初始化地图
		var el = W('#shopMiniMap');
		var item = {
			lng : el.attr('data-lng'),
			lat : el.attr('data-lat')
		}
		try{
	        var center = new AMap.LngLat(item.lng, item.lat);
	        var map = new AMap.Map("shopMiniMap",{
	            view: new AMap.View2D({//创建地图二维视口
                   center : center,
                   zoom:11,
                   rotation:0
                })
	        });
	        var marker = new AMap.Marker({
	            id:"mapMarker",
	            position:new AMap.LngLat(item.lng, item.lat),
	            icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
	            offset:{x:-13,y:-36}
	        });
	        marker.setMap(map);
        }catch(e){}
	}

	/**
	 * 显示搜索结果提示
	 * @return {[type]} [description]
	 */
	function showSearchRsTip(){
		var retNum = W('#searchRsTipTpl').attr('data-retnum') -0 ;
		var nowpn = W('#itemServicePager span').length>0? W('#itemServicePager span').html()-1 : 0;
		if( retNum >0 && (!nowpn || nowpn==0) ){
			W('#itemService').insertAdjacentHTML( 'afterbegin', W('#searchRsTipTpl').html() );

			var wItem = W('#itemService li').item(retNum);
			if (wItem) {
				wItem.insertAdjacentHTML( 'beforebegin', W('#dianpuRsTipTpl').html() );
			}
		}
	}

    /**
     * 根据活动类型排序
     * @return {[type]} [description]
     */
    function sortProductByHuodongType(arr){
        var typeMap = {
            // 'huodong_luyouqi1': ['4', '3'],
            'huodong_qinghui': '2'
        };
        var from = tcb.html_encode(location.search.queryUrl('from')),
            type = typeMap[from];
        type = QW.ObjectH.isArray(type) ? type : [type];
        arr.forEach(function(o, i, me){
            if (type.contains(o.huodong_type)) {
                me.splice(i,1);
                me.unshift(o);
            }
        });
    }
	/**
	 * 入口
	 * @return {[type]} [description]
	 */
	function init(){
        sortProductByHuodongType(merdata['product']);
		//商品列表
		asynItemService('',0,true,merdata);
		//推荐的商品
		asynItemServiceRecom('');

		new PlaceHolder('#itemSearchKey');
		//itemServicePager(Math.ceil(service_count/4));
		asynUserComment('',0,true);
		showMiniMap();
		checkShowMoreFenlei();
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

function initSubMenu(){
	var offTop = W('#shopSubMenuHolder').getRect().top;
    //子菜单切换
    W('#shopSubMenu').delegate('.m-item', 'click', function(e){
    	e.preventDefault();
    	var w_this = W(this);
    	if(w_this.hasClass('curr')){
    		return false;
    	}

    	w_this.addClass('curr').siblings('.curr').removeClass('curr');
    	var rel = w_this.attr('data-rel');

    	if(rel == 'prd-list'){
    		W('.shop-section').show();
    		W('.shop-section[data-for="shop-recom"]').hide();
    	}else{
    		W('.shop-section').hide();
    		W('.shop-section[data-for="'+rel+'"]').show();

    		if(rel == 'shop-info'){
    			W('.shop-section[data-for="shop-recom"]').show();
    		}
    	}


    	var doc = (QW.Browser.firefox || QW.Browser.ie || /trident.*rv:/i.test(window.navigator.userAgent)) ? document.documentElement : document.body; //后面的正则为判断IE11及以上版本

    	doc.scrollTop = offTop;

    	try{
	    	var params = {
				cId : 'shop_sub_menu',
				c : monitor.util.getText( this ) //获取点击元素文本
			};

			//tcbMonitor.__log(params); //发送点击统计
		}catch(ex){}
    });

	W(window).on('load', function(e){
		fixedSubMenu();
	});
	W(window).on('resize', function(e){
		fixedSubMenu();
	});
	W(window).on('scroll', function(e){
		fixedSubMenu();
	});
}

function fixedSubMenu(){
	var subMenu = W('#shopSubMenu');
	var subMenuHolder = W('#shopSubMenuHolder');

	var y = Dom.getDocRect().scrollY;
	var offTop = subMenuHolder.getRect().top;

	if( !(QW.Browser.ie && QW.Browser.ie=="6.0") ){
		if( y < offTop ){
			if(subMenu.css('position') == 'fixed'){
				subMenu.css('position', 'absolute');
			}
		}else{
			if(subMenu.css('position') != 'fixed'){
				subMenu.css('position', 'fixed');
			}
		}
	}
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

//右侧IM聊天提示
var imHasLoadCheck;
function showTalkIMTip(){
	var talkOnIm = W('.talk-on-im');

	//如果在客户端中，或者商家不在线，就不进行处理直接返回。
	if( typeof(_inclient)!='undefined'&&_inclient || talkOnIm.length==0 ){
		return false;
	}

    W('body').delegate('.talk-on-im .ti-close', 'click', function(e){
    	e.preventDefault();
    	talkOnIm.hide();
    });
    W('body').delegate('.talk-on-im .ti-talk', 'click', function(e){
    	e.preventDefault();
    	talkOnIm.hide();
    });


    imHasLoadCheck = setInterval(function(){
    	if(QIM.tongbu){
    		var  qcookie = QIM.tongbu.getTongbuCookie();
    		var st = qcookie.st? qcookie.st.c | qcookie.st.t | qcookie.st.h : false;
    		if(!st){
    			talkOnIm.show();
    			W('.contacts-footer').on('click', function(e){
			    	e.preventDefault();
			    	talkOnIm.hide();
			    });
    		}
    		clearInterval(imHasLoadCheck);
    	}
    }, 500);
}

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

function showOnlineJishi(){
	var version = false,
		folkStartConsult = false,
		folkExpertDetail = false;

	try{
		version = window.external.GetDiagVersion(); //FUCK IT. I hate this API. It's so stupid and awful!
	}catch(ex){
		return false;
	}

	if( version ){
		if( campareVersion( version , '2.2.0.1033') ){ // THE FolkStartConsult starts at version 2.2.0.1033
			folkStartConsult = true;
		}

		if( campareVersion( version , '2.2.0.1034') ){ // THE FolkExpertDetail starts at version 2.2.0.1033
			folkExpertDetail = true;
		}
	}

	if( folkStartConsult && _inclient){

		loadJsonp( BASE_ROOT + 'aj/get_shop_shifu/?shop_id=' + W('#onlineJishi').attr('data-shopid'), function(data){

			if( !data || !data.result || !data.result.length){
				return;
			}

			var list = data.result;
			var str =[];
			str.push( '<table><tr>' );

			for(var i=0, n=list.length; i<n; i++){
				var item = list[i];

				str.push('<td class="online-js-item">');
				str.push('<div class="js-tx"><a href="#" class="js-talk-trigger" bk="jishi-talk1"  data-jid="',item.id,'"><img src="',item.avatar,'"></a></div>');
				str.push('<div class="js-info"><a class="js-name js-talk-trigger" bk="jishi-talk2" data-jid="',item.id,'" href="#">',item.name,'</a><p title="',item.dominant,'">擅长：',item.dominant.subByte(16,'...'),'</p><p>解决：',item.deal_count,'&nbsp;&nbsp;好评：',item.solve_rate,'%</p><p>',(item.new_state!='offline'?'<a href="#" class="js-online js-talk-trigger" data-jid="'+item.id+'">我要咨询</a>':''),(folkExpertDetail?'<a href="#" class="js-services js-service-trigger" data-jid="'+item.id+'">查看服务</a>':''),'</p></div>');
				str.push('</td>');

				if( i%3==2 ){
					str.push( '</tr><tr>' );
				}
			}
			str.push( '</tr></table>' );

			W('#onlineJishi').show().query('.js-list-box').html( str.join('') );
		} );
	}
}

Dom.ready(function(){
    // cookie控制客户端底部导航的显示
    if (QW.Cookie.get('CLIENT_BOTTOM_NAV_HIDDEN')) {
        W('.client-bottom-nav-upbutton').show();
    } else {
        W('.client-bottom-nav').show();
    }

    //im交谈提示
    showTalkIMTip();

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

    if(W('#shopSubMenu').length>0){
    	initSubMenu();
	}

	showOnlineJishi();

    if (document.location.hash==='#viewphone') {
        W('.see-phone').click();
    }
    if (document.location.hash==='#viewcomment') {
        W('#shopSubMenu li').item(1).click();
    }
});
})();

function appendComment(obj,tip){
	if(obj&&obj.comment_id){
		return '<div class="rate-append break">'+
			'<strong>追加评论：</strong>'+(obj.comment_content.encode4Html()||tip) +
			'<i></i>'+
		'</div>';
	}else{
		return '';
	}
}

function tranceString(str, len, more){
	var len = len || 50;
	var more = more || '... <a href="#" bk="pd-desc-more" class="link-desc-more">展开</a>';
	var str = str.replace(/&nbsp;/ig,' ');
	if(str.length > len){
		return str.substr(0, len) + more;
	}else{
		return str;
	}
}

//清灰活动，高亮标题
function prdNameSpecDeal(ptitle){
	return ptitle.replace('【29.9元清灰活动】', '<span style="color:#f00;font-family:arial" class="cuxiao">【29.9元清灰活动】</span>')
				.replace('【路由器上门安装调试活动】', '<span style="color:#f00;font-family:arial" class="cuxiao">【路由器上门安装调试活动】</span>')
				.replace('【购路由器+上门调试安装】', '<span style="color:#f00;font-family:arial" class="cuxiao">【购路由器+上门调试安装】</span>')
				.replace('【系统安装活动】', '<span style="color:#f00;font-family:arial" class="cuxiao">【系统安装大优惠】</span>')
                .replace('【513XP裸奔日】', '<span style="color:#f00;font-family:arial" class="cuxiao">【513XP裸奔日】</span>')
                .replace('【519手机健康日】', '<span style="color:#f00;font-family:arial" class="cuxiao">【519手机健康日】</span>');
}
function hideMobile(tel){
    if(!tel) return '';
    return tel.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3").replace(/(\d+\-)?(\d+)\d{4}/, "$1$2****");
}

