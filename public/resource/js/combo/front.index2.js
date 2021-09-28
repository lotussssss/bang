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

;/**import from `/resource/js/include/shop_list.js` **/
// 商家列表信息
(function(){
    var Bang = window.Bang = window.Bang || {};

    /**
     * 获取商家列表数据
     *
     * @param callback 获取到商家数据后的回调函数
     */
    function getShopListData(callback){
        var me = this;

        var	param = me.getFilterParams();

        var key = Object.encodeURIJson(param),
            ListData = me._Cache[key];

        if(ListData){

            if (typeof callback === 'function') {

                callback(ListData);
            }
        }
        else{
            var request_url = '/at/shop?'+ key;
            QW.Ajax.get(request_url, function(res){
                res = res.evalExp();

                if (!parseInt(res['errno'], 10) && res['shop_data'] && res['shop_data'].length) {
                    res['shop_data'].forEach(function(el){
                        if (el['shop_ico'].indexOf('pinpailogo')==-1) {
                            el['shop_ico'] = tcb.imgThumbUrl(el['shop_ico'], 140, 140);
                        }
                    });

                    ListData = res;

                    me.setCache(key, ListData);
                }

                if (typeof callback === 'function') {

                    callback(ListData);
                }

            });
        }

    }
    /**
     * 输出商家列表
     *
     * @param reset_pn 是否重置pn参数，true：重置；false：不重置；
     */
    function renderShopList(reset_pn){
        var me = this;

        // 重置pn参数为0
        if (reset_pn) {
            me.setFilterParams('pn', 0);
        }

        var	html = '';

        // 获取商家列表数据，输出商家列表
        me.getShopListData(function(ListData){

            if (ListData) {
                // 店铺列表htm
                html = _getShopListHtml(ListData, me.options['tpl']['shop_list']);
            } else {
                html = '<div class="no-data-merrepair">抱歉，暂时没有找到符合您要求的店铺</div>';
            }

            if (html === null) {
                return ;
            }

            me.wList.html(html);

            if (typeof me.options['onAfter']==='function') {

                me.options['onAfter'](me);
            }

            // 输出分页
            me.renderShopListPager(function(pn){

                me.setFilterParams('pn', pn);

                me.renderShopList();
            });

        });

    }
    /**
     * 输出商家列表分页
     * @param callback
     */
    function renderShopListPager(wPageNav, callback, flag_ignore_pn){
        var me = this;

        if (typeof wPageNav==='function') {
            callback = wPageNav;
            wPageNav = null;
        }
        wPageNav = wPageNav || me.wPageNav;

        if (!wPageNav.length) {
            return ;
        }

        var filter_params = me.getFilterParams(),
            pn = parseInt(filter_params['pn'], 10);
        if (!flag_ignore_pn && pn) {
            return;
        }

        var cache_key = Object.encodeURIJson(filter_params),
            list_data = me.getCache(cache_key);
        if (!list_data) {
            return ;
        }

        var total_page = Math.ceil(list_data['page_count']/filter_params['pagesize']);

        var wPages = wPageNav.query('.pages');
        if (total_page==1) {
            wPages.hide().html('');

            return;
        }

        wPages.show();

        var pager = new Pager(wPages, total_page, pn);

        pager.on('pageChange', function(e) {
            callback = callback || noop;

            typeof callback === 'function' && callback(e.pn);
        });
    }

    // 设置cache
    function setCache(key, val){
        var me = this;

        if (key) {
            me._Cache[key] = val;
        }
    }
    // 获取cache
    function getCache(key){
        var me = this;

        if (key) {
            return me._Cache[key];
        } else {
            return me._Cache;
        }
    }
    // 获取商家列表html
    function _getShopListHtml(ListData, tpl_id) {
        var html = null;
        var _data = ListData;
        _data['shop_data'].forEach(function(el){
            if (el['shop_ico'].indexOf('pinpailogo')==-1) {
                el['shop_ico'] = tcb.imgThumbUrl(el['shop_ico'], 140, 140);
            }
        });

        var wShopListTpl = W(tpl_id || '');
        if (wShopListTpl && wShopListTpl.length) {
            var func = wShopListTpl.html().trim().tmpl();

            html = func(_data);
        }

        return html;
    }
    // 获得商家进行过滤的参数
    function getFilterParams(key){
        var me = this;

        var FilterParams = me.FilterParams || {};

        if (key) {
            return FilterParams[key];
        }

        return FilterParams;
    }
    // 设置商家过滤参数
    function setFilterParams(key, val) {
        var me = this;

        me.FilterParams = me.FilterParams || {};

        me.FilterParams[key] = val;
    }

    /**
     * 显示商家列表地图模式
     * @param pagechange_flag 地图翻页表示，true表示翻页，false表示第一次打开不翻页
     */
    function showMap(pagechange_flag){
        var me = this;

        var map_panel_id = "panel-modeMapindex";

        var mapObj = me.createBigMap(map_panel_id, pagechange_flag);

        // 获取商家列表数据，输出商家列表
        me.getShopListData(function(ListData) {
            if (!ListData){
                return;
            }
            var ShopListArr = ListData['shop_data'] || [];
            ShopListArr.forEach(function(item, i){
                if( !item.map_longitude || !item.map_latitude){
                    return false;
                }
                // 为每个商家店铺地址创建一个地图标识点图标
                var marker = new AMap.Marker({
                    id: "MapMarker"+i,
                    position: new AMap.LngLat(item.map_longitude, item.map_latitude),
                    icon: {stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
                    offset: {x:-13,y:-36}
                });
                marker.setMap(mapObj);

                var infoWindow = new AMap.InfoWindow({
                    isCustom: true,
                    autoMove: true,
                    offset: new AMap.Pixel(72,-245),
                    content:W('#JsShopListMapModeShopCardTpl').html().tmpl({
                        shop_name: item.shop_name,
                        addr: item.addr_detail,
                        service_tags: item.main.subByte(40, '...'), //item.service_tags.subByte(40,'...'),
                        qid: item.qid,
                        shop_addr: item.shop_addr,
                        online_txt: item.is_online == "on" ? "立即咨询" : "离线留言"
                    }),
                    size: new AMap.Size(349, 166) // isCustom为true，此参数被忽略
                });
                AMap.event.addListener(marker, "click", function(){
                    // 打点记录
                    //try{ tcbMonitor.__log({cid:'map-marker-click',ch:''}); }catch(ex){}

                    // 打开商家店铺卡片的小窗口
                    infoWindow.open(mapObj, marker.getPosition());
                });

                if(i == 0){
                    //infoWindow.open(map, marker.getPosition());
                    // 设置第一个商家位置为中心点
                    mapObj.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude));
                }
            });

            // 输出分页
            me.renderShopListPager(W('#'+map_panel_id), function(pn){

                me.setFilterParams('pn', pn);

                me.showMap(true);
            }, true);

        });

    }
    /**
     * 创建大地图
     * @returns {AMap.Map|*}
     * @private
     */
    function createBigMap(map_panel_id, pagechange_flag){
        var me = this;

        // 大地图弹窗容器id
        map_panel_id = map_panel_id || "panel-modeMapindex";

        // 地图翻页，直接清空所有覆盖物，返回地图对象
        if(pagechange_flag){
            if (me.Map && me.Map.clearMap) {

                me.Map.clearMap();
            }
            return me.Map;
        }

        // 非翻页，首次打开地图面板
        var panel_conf = {
            //'width':688,
            'className': 'panel panel-tom01 map-container-wrap',
            'btn_name': '关闭',
            'wrapId': map_panel_id
        };
        // 打开地图窗口时候备份当前的页码pn，在关闭地图时候重新恢复此pn
        var pn_bak = me.getFilterParams('pn');
        var cont_str = W("#JsShopListMapModeTpl").html().trim().tmpl()();
        var panel = tcb.alert("地图模式", cont_str, panel_conf, function(){
            if (me.Map && me.Map.destroy) {

                me.Map.destroy();
            }
            me.Map = null;

            me.MapPanel = null;

            me.setFilterParams('pn', pn_bak);
            return true;
        });

        // 初始化赋值地图
        me.Map = new AMap.Map("mode_map_container", {
            "view": new AMap.View2D({//创建地图二维视口
                zoom:11,
                rotation:0
            })
        });
        // 添加地图控件
        me.Map.plugin(["AMap.ToolBar","AMap.OverView","AMap.Scale"], function(){
            var overview = new AMap.OverView();
            me.Map.addControl(overview);

            var toolbar = new AMap.ToolBar(-100,0);
            toolbar.autoPosition=false;
            me.Map.addControl(toolbar);

            var scale = new AMap.Scale();
            me.Map.addControl(scale);
        });

        // 绑定地图面板上的相关事件
        var wMapPanel = W('#'+map_panel_id);
        tcb.bindEvent(wMapPanel, {
            // 关闭地图面板
            '.close': function(e){
                try{
                    e.preventDefault();

                    // 关闭商家卡片
                    me.Map.clearInfoWindow();

                    me.Map.destroy();
                    me.Map = null;
                }catch(e){}
            },
            // 关闭商家卡片
            '.shop-card-close': function(e){
                e.preventDefault();

                try{
                    // 关闭商家卡片
                    me.Map.clearInfoWindow();
                } catch(ex){}
            },
            //点击在线聊天时关闭弹出层
            '.qim-go-talk': function(e){
                try{
                    panel.hide();

                    // 关闭商家卡片
                    me.Map.clearInfoWindow();

                    me.Map.destroy();
                    me.Map = null;
                } catch (ex){}
            }
        });

        return me.Map;
    }

    // 绑定事件
    function eventBind(){
        var me = this;

        tcb.bindEvent(me.wWrap[0], {
            // 排序
            '.sort-type li a': function(e){
                e.preventDefault();

                var wMe = W(this);

                wMe.ancestorNode('li').addClass('active').siblings('.active').removeClass('active');

                me.setFilterParams('type_id', wMe.attr('data-type'));

                me.renderShopList(true);
            },
            // 筛选
            '.filter-check .chkbox': function(e){
                var wMe = W(this);
                
                var k = wMe.attr('name');

                if (wMe.attr('checked')) {
                    // 保证金
                    if (k==='is_bzj'){
                        me.setFilterParams(k, '1');
                    } else {
                        me.setFilterParams(k, 'on');
                    }
                } else {
                    if (k==='is_bzj'){
                        me.setFilterParams(k, '0');
                    } else {
                        me.setFilterParams(k, 'off');
                    }
                }

                me.renderShopList(true);
            },
            // 显示商家列表地图模式
            '.btn-mode-map': function(e){
                e.preventDefault();

                me.showMap();
            }
        });
    }
    // 空function
    function noop(){}

    // 商家列表相关js
    Bang.ShopList = function(options) {
        var defaults = {
            // 选择器
            'selector': {
                'wrap' : '.shop-list-wrap',
                'extend_filter_wrap' : '' //.shop-list-extend-filter // 默认无扩展过滤条件
            },
            // 模板
            'tpl': {
                'shop_list' : '#JsShopListTpl'
            },
            // 商家列表默认的请求参数
            'data': {},
            // 输出商家列表前
            'onBefore': noop,
            // 输出商家列表后
            'onAfter': noop
        };
        options = options || {};
        options = QW.ObjectH.mix(defaults, options, true);

        var me = this;

        // 商家列表筛选参数
        me.FilterParams = {
            'city_id': options['data']['city_id'] || '', // 城市id
            'area_id': options['data']['area_id'] || '', // 区县id
            'quan_id': options['data']['quan_id'] || '', // 商圈id
            'service_id': options['data']['service_id'] || '', // 服务id
            'type_id': options['data']['type_id'] || '',  // 排序规则，空为默认排序，1：成交量排序，2：好评排序；3：按人气排序
            'online': options['data']['online'] || 'on', // 是否在线
            'cuxiao': options['data']['cuxiao'] || 'off',// 是否促销
            'is_bzj': options['data']['is_bzj'] || '0', // 是否“先行赔付”，0：不是，1：是
            'tag': options['data']['tag'] || '',
            'pagesize': options['data']['pagesize'] || 15, // 每页数量
            'pn'  : options['data']['pn'] || 0, // 当前分页
            'lng' : options['data']['lng'] || '', // 经度
            'lat' : options['data']['lat'] || ''  // 纬度
        };
        // 数据cache
        me._Cache = {};
        // 配置项
        me.options = options;
        // 用于回调中的参数
        me.data = {};

        var fn = Bang.ShopList.prototype;

        if (typeof fn.eventBind === 'undefined') {

            // 绑定事件
            fn.eventBind = eventBind;

            // 获取商家列表数据
            fn.getShopListData = getShopListData;
            // 输出商家列表
            fn.renderShopList  = renderShopList;
            // 输出分页
            fn.renderShopListPager = renderShopListPager;
            // 获得商家进行过滤的参数
            fn.getFilterParams = getFilterParams;
            // 设置商家过滤参数
            fn.setFilterParams = setFilterParams;

            // 显示大地图，展示商家地图位置
            fn.showMap = showMap;

            fn.createBigMap = createBigMap;

            // 设置、获取cache内容
            fn.setCache = setCache;
            fn.getCache = getCache;
        }

        function init() {
            var wWrap = me.wWrap = W(me.options['selector']['wrap']);

            // 商家列表
            me.wList = wWrap.query(me.options['selector']['list'] || '.shop-list');

            // 排序
            me.wSort = wWrap.query('.sort-type a');
            // 过滤
            me.wFilter = wWrap.query('.filter-check [type="checkbox"]');


            // 地图模式
            me.wMapMode = wWrap.query('.btn-mode-map');
            // 地图对象
            me.Map = null;

            // 分页
            me.wPageNav = wWrap.query('.shop-list-pagination');


            // 过滤（扩展）
            me.wFilterExtend = W(me.options['selector']['extend_filter_wrap']);

            //绑定事件
            me.eventBind();
        }
        init();
    };
}());

;/**import from `/resource/js/page/front.index2.js` **/
/**
 * 首页逻辑
 */
Dom.ready(function(){
    var wIndexPage = W('.page-index');
    if ( !(wIndexPage && wIndexPage.length) ){
        return ;
    }

    tcb.bindEvent(wIndexPage[0], {
        // 顶部banner菜单
        '.top-banner-cate .has-sub-select .item': {
            'mouseenter': function(e){
                var wMe = W(this),
                    wSelect = wMe.ancestorNode('.has-sub-select');

                wSelect.addClass('hover');
            },
            'mouseleave': function(e){
                var wMe = W(this),
                    wSelect = wMe.ancestorNode('.has-sub-select');

                wSelect.removeClass('hover');
            }
        },
        // 商家列表
        '.shop-list .list-item': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('list-item-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.removeClass('list-item-hover');
            }
        }
    });

    // 顶部分类列表相关交互
    (function(){
        var SubCateList = {
            'xsj': {},
            'xdn': {},
            'hs': [],
            'lp': []
        };
        var cur_point = [0, 0]; // 当前的鼠标点
        var critical_point = [0, 0]; // 临界位置鼠标点
        var cc = 0; // 用于mousemove的计数器
        var t111; // 延时handler

        // 分类列表
        var wCateList = W('.cate-list');

        //wCateList.on('mouseenter', function(e){
        //
        //});
        wCateList.on('mousemove', function(e){
            // 当前的鼠标位置
            cur_point = [e.pageX, e.pageY];

            var wMe = W(this);

            var target = e.target,
                wTarget = W(target);

            var wMain = wTarget.parentNode('.cate-list-main');
            // 鼠标放在顶级分类上边
            if(wMain.length){
                var wSub = wMain.nextSibling('.cate-list-sub'),
                    wItems = wMain.query('.item');

                // var is_in = true;
                var is_in = isInnerArea(critical_point, cur_point, wSub);
                if (!is_in) {

                    // 目标元素为item元素本身
                    var wItem = wTarget.hasClass('item')
                        ? wTarget
                        : wTarget.parentNode('li');

                    activeCateSelected(wItem, wItems, wSub, wMain, wMe);
                }

            }
        });
        wCateList.on('mouseover', function(e){
            // 移入元素的临界点
            critical_point = [e.pageX, e.pageY];
            var wMe = W(this);

            var target = e.target,
                wTarget = W(target);
            var wMain = wTarget.ancestorNode('.cate-list-main');

            clearTimeout(t111);
            // 鼠标放在顶级分类上边
            if(wMain.length){

                var wSub   = wMain.nextSibling('.cate-list-sub'),// 子分类
                    wItems = wMain.query('.item');

                t111 = setTimeout(function(){

                    // 目标元素为item元素本身
                    var wItem = wTarget.hasClass('item')
                        ? wTarget
                        : wTarget.parentNode('li');

                    activeCateSelected(wItem, wItems, wSub, wMain, wMe);
                }, 300);

            }
        });
        wCateList.on('mouseleave', function(e){
            var wMe = W(this),
                wSub = wMe.query('.cate-list-sub');

            clearTimeout(t111);

            wSub.animate({'width':'0px'}, 200, function(){
                wSub.hide();
            }, QW.Easing.easeInStrong);
        });

        /**
         * 判断是否在区域之中
         * @param  {[type]}  critical_point 临界点
         * @param  {[type]}  cur_point      当前鼠标位置
         * @param  {[type]}  wSub           [description]
         * @return {Boolean}                [description]
         */
        function isInnerArea(critical_point, cur_point, wSub){
            var flag = false;

            var rect = wSub.getRect(),
                sub_x = rect.left, // 子菜单框左顶点x
                sub_y = rect.top,  // 子菜单框左顶点y
                sub_h  = rect.height, // 子菜单框高度
                cr_x = critical_point[0], // 临界点x
                cr_y = critical_point[1], // 临界点y
                cu_x = cur_point[0], // 当前点x
                cu_y = cur_point[1]; // 当前点y

            var w = sub_x - cr_x; // 临界点到子菜单的距离

            // 鼠标在临界点的右边、或者重合 开始计算
            if (cr_x <= cu_x) {
                // 在临界点之上
                if (cr_y<cu_y) {
                    if( !((cu_x-cr_x)/(cu_y-cr_y) < w/(sub_y+sub_h-cr_y)) ){
                        flag = true;
                    }
                }
                // 在临界点之下
                else if(cr_y>cu_y) {
                    if ( !((cu_x-cr_x)/(cr_y-cu_y) < w/(cr_y-sub_y)) ) {
                        flag = true;
                    }
                }
                else {
                    flag = true;
                }
            }

            return flag;
        }
        /**
         * 激活分类条的选择
         */
        function activeCateSelected(wLi, wLis, wSub){


            // 鼠标放置的cate位置
            var pos = 0;
            wLis.forEach(function(el, i){
                // 获取鼠标放置的LI的位置
                if(el===W(wLi)[0]){
                    pos = i;
                }
            });

            var wSubItems = wSub.query('.sub-item'),
                wCurItem  = wSubItems.item(pos);

            // 当前item已经被选中激活，那么就不需要再处理了
            if (wCurItem.isVisible()) {
                return ;
            }

            wSubItems.hide();
            wSub.css({
                'width':0+'px',
                'height':0+'px'
            })
            if (wCurItem && wCurItem.length&&(wCurItem.html().trim()).length>0) {
                wCurItem.show();
                wSub.show();

                var li_h = wLi.getRect()['height'];
                var wSubArrow = wSub.query('.arrow-left'),
                    sub_arrow_h = wSubArrow.getRect()['height'];

                // 设置箭头位置
                wSubArrow.css({
                    'top': (li_h*pos + li_h/2-sub_arrow_h/2)+'px'
                });

                var sub_rect = wLis.ancestorNode('.cate-list-main').getRect(),
                    sub_h = sub_rect['height']-2;

                var item_rect = wCurItem.getRect(),
                    item_w = item_rect['width'],
                    item_h = item_rect['height'];

                item_h = item_h<sub_h ? sub_h : item_h;

                wSub.css({
                    'width': item_w+'px',
                    'height': item_h+'px'
                });
            }
        }

        /**
         * 添加顶部子分类
         */
        function addSubCate(){

            // 获取手机回收自营数据：分热门问题、其余问题
            // '/shangmen/doGetMobileFaultList'
            QW.Ajax.get('/shangmen/aj_get_fault_group', {'group_type': 1}, function(res){
                res = JSON.parse(res);

                if (!res['errno']) {

                    var result = res['result'];

                    //热门手机回收列表
                    var html_str = W('#JsIndexXsjCate2Tpl').html().trim().tmpl()({
                        'list': result
                    });
                    //暂时先不渲染第三个选项  20/11/10 国斌
                    // W('#ForCitemXSJ').html(html_str);

                    ////热门手机回收列表
                    //var html_str = W('#JsIndexXsjCateTpl').html().trim().tmpl()({
                    //    'hot': result['hot'],
                    //    'other': result['other']
                    //});
                    //
                    //W('#ForCitemXSJ').html(html_str);

                    //SubCateList['xsj'] = {
                    //    'hot': result['hot'],
                    //    'other': result['other']
                    //};

                } else {
                    //alert(res['errmsg']);
                }
            });
            // 获取PC回收自营数据：分热门问题、其余问题
            QW.Ajax.get('/shangmen/doGetPcFaultList', function(res){
                res = JSON.parse(res);

                if (!res['errno']) {

                    var result = res['result'];
                    //热门手机回收列表
                    var html_str = W('#JsIndexXdnCateTpl').html().trim().tmpl()({
                        'hot': result['hot'],
                        'other': result['other']
                    });

                    W('#ForCitemXDN').html(html_str);

                    //SubCateList['xdn'] = {
                    //    'hot': result['hot'],
                    //    'other': result['other']
                    //};

                } else {
                    //alert(res['errmsg']);
                }
            });
            // 获取回收机型的品牌列表
            QW.Ajax.get('/huishou/dogetpinpailist', function(res){
                res = JSON.parse(res);

                if (!res['errno']) {

                    var brand = res['result'];
                    //热门手机回收列表
                    var html_str = W('#JsIndexHsCateTpl').html().trim().tmpl()({
                        'brand': brand
                    });

                    W('#ForCitemHS').html(html_str);

                    //SubCateList['hs'] = {
                    //    'brand': brand
                    //};

                } else {
                    //alert(res['errmsg']);
                }
            });
            // 获取当前上架中的优品机型的品牌列表
            QW.Ajax.get('/youpin/dogetpinpailist', function(res){
                res = JSON.parse(res);

                if (!res['errno']) {

                    var brand = res['result'];
                    var brand_tmp = [];
                    if (brand && !QW.ObjectH.isArray(brand)){
                        QW.ObjectH.map(brand, function(v, k){
                            brand_tmp.push({
                                'id': k,
                                'name': v
                            });
                        });
                        brand = brand_tmp;
                    }
                    //热门手机回收列表
                    var html_str = W('#JsIndexLpCateTpl').html().trim().tmpl()({
                        'brand': brand
                    });

                    W('#ForCitemLP').html(html_str);

                    //SubCateList['lp'] = {
                    //    'brand': brand
                    //};

                } else {
                    //alert(res['errmsg']);
                }

            });

        }
        setTimeout(function(){
            addSubCate();
        }, 600);

    }());

    // 首页推广大广告
    (function(){
        new TuiguangSlide('.js-top-cate-slide-inner', {showCtrl : true, autoRun:5000, animTime : 500});

        /**
         * 推广slide类
         * 使用 new TuiguangSlide('.slide-box');
         * @param {selector} box  [description]
         * @param {[type]} conf [description]
         */
        function TuiguangSlide(box, conf){
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
            this.itemWidth = this.items.getRect().width + parseInt(this.items.css('margin-left')) + parseInt(this.items.css('margin-right'));
            this.ctrlBox = this.meBox.query('.slide-ctrl');
            this.innerBoxWidth = this.innerBox.getRect().width;

            this.autoRunTimer = null;

            this.init = function(){

                this.listBox.css({'width' : this.itemWidth * this.items.length});

                if(this.config.showCtrl){ this.creatCtrl(); }

                if(this.config.autoRun){ this.autoRun( ); }

                this.bindEvent();
            }
            this.bindEvent = function(){

                var me = this;
                var config = this.config;

                me.btnPrev.on('click', function(e){
                    e.preventDefault();
                    me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft - me.innerBoxWidth }, config.animTime||300, function(){}, QW.Easing.easeOut);
                });
                me.btnNext.on('click', function(e){
                    e.preventDefault();
                    me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft + me.innerBoxWidth }, config.animTime||300, function(){}, QW.Easing.easeOut);
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
            }

            this.go = function(step){
                var config = this.config;
                step = step || 0;
                this.innerBox.animate({'scrollLeft' : 0 + this.innerBoxWidth*step }, config.animTime||300, function(){}, QW.Easing.easeOut);
            }

            this.autoRun = function(){
                var me = this;
                var config = this.config;

                me.autoRunTimer = setInterval(function(){
                    var currSn = me.meBox.query('.ctrl-curr').attr('data-sn')||0;
                    nextSn = currSn - 0 + 1;
                    if( nextSn > me.itemNum-1 ){
                        nextSn = 0;
                    }
                    me.meBox.query('.ctrl-item[data-sn="'+nextSn+'"]').addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                    me.go(nextSn);
                }, typeof(config.autoRun)=='number'? config.autoRun : 5000);
            }

            this.creatCtrl = function(e){

                if(this.ctrlBox.query('.ctrl-item').length||this.items.length<2){
                    return ;
                }

                str = '';
                for(var i=0, n=this.items.length; i<n; i++){
                    str += '<span class="ctrl-item '+(i==0?'ctrl-curr':'')+'" data-sn="'+i+'"></span>';
                }
                this.ctrlBox.html(str);
            }

            this.init();
        }

    }());

    // 热门回收手机
    function getHuishouHotList() {
        QW.Ajax.get('/huishou/doGetHotHsList', {'num': 5}, function(res){
            res = JSON.parse(res);

            if (!res['errno']) {

                var product_list = res['result'];
                //热门手机回收列表
                var html_str = W('#JsIndexHuishouProductTpl').html().trim().tmpl()({
                    'product_list': product_list
                });

                W('#JsHotHsList').html(html_str);
            } else {
                //alert(res['errmsg']);
            }
        });
    }
    getHuishouHotList();

    // 优品精品手机
    function getLiangpinHotList() {
        QW.Ajax.get ('/youpin/dogethotlist', { 'num' : 5 }, function (res) {
            res = JSON.parse (res);

            if (!res[ 'errno' ]) {

                var
                    product_list = res[ 'result' ],
                    //优品精选列表
                    html_str = W ('#JsIndexLiangpinProductTpl').html ().trim ().tmpl () ({
                        'product_list' : product_list
                    })

                W ('#JsHotLpList').html (html_str);
            } else {
                //alert(res['errmsg']);
            }
        })
    }
    getLiangpinHotList();

    // 商家列表相关
    (function(){
        return
        var first_load_flag = true;

        // ===== 商家列表 =====
        function getShopListObj() {
            var options = {
                // 选择器
                selector: {
                    'wrap' : '.shop-list-wrap',
                    'extend_filter_wrap' : '' //.shop-list-extend-filter // 默认无扩展过滤条件
                },
                // 模板
                tpl: {
                    'shop_list' : '#JsShopList2Tpl'
                },
                // 商家列表默认的请求参数
                data: {
                    'city_id': 'bei_jing',
                    'area_id': 0,
                    'quan_id': 0,
                    'service_id': '',
                    'type_id': '',
                    'online': 'off',
                    'cuxiao': 'off',
                    'is_bzj': 0,
                    'tag': '',
                    'pagesize': 5,
                    'pn': 0,
                    'lng': '',
                    'lat': ''
                },
                // 输出商家列表前
                onBefore: function(){

                },
                // 输出商家列表后
                onAfter: function(obj){

                    if (!first_load_flag) {
                        // 对齐
                        var scroll_val = W('.index-shop-list .tit h2').getRect()['top'];

                        tcb.gotoTop.goPlace(scroll_val-3);
                    }

                    first_load_flag = false;
                }
            };

            return new window.Bang.ShopList(options);
        }

        var oShopList = getShopListObj();

        // 初始化城市区县选择
        var oAreaSelect = new bang.AreaSelect({
            'wrap': '#JsAreaSelectWrap',
            'hasquan': false,
            'autoinit': true,                             // 是否自动初始化
            'urlhost': 'http://' + location.host +'/',    // 请求的url
            // new后init的回调
            'onInit': function(data){
                oShopList.setFilterParams('city_id', data['citycode']);
                oShopList.setFilterParams('area_id', data['areacode']);
                oShopList.setFilterParams('quan_id', data['quancode']);

                oShopList.setFilterParams('lng', '');
                oShopList.setFilterParams('lat', '');

                var wAddr = W('#addrSearchForm [name="addr"]');
                wAddr.val(wAddr.attr('data-default')).addClass('default');

                // **此处初始化输出商家列表**
                oShopList.renderShopList(true);
            },
            // 城市选择时触发
            'onCitySelect': function(data){
                oShopList.setFilterParams('city_id', data['citycode']);
                oShopList.setFilterParams('area_id', '');
                oShopList.setFilterParams('quan_id', '');

                oShopList.setFilterParams('lng', '');
                oShopList.setFilterParams('lat', '');

                var wAddr = W('#addrSearchForm [name="addr"]');
                wAddr.val(wAddr.attr('data-default')).addClass('default');

                oShopList.renderShopList(true);
            },
            // 区县选择时触发
            'onAreaSelect': function(data){
                oShopList.setFilterParams('city_id', data['citycode']);
                oShopList.setFilterParams('area_id', data['areacode']);
                oShopList.setFilterParams('quan_id', '');

                oShopList.setFilterParams('lng', '');
                oShopList.setFilterParams('lat', '');

                var wAddr = W('#addrSearchForm [name="addr"]');
                wAddr.val(wAddr.attr('data-default')).addClass('default');

                oShopList.renderShopList(true);
            },
            // 商圈选择时触发
            'onQuanSelect': function(data){
                oShopList.setFilterParams('city_id', data['citycode']);
                oShopList.setFilterParams('area_id', data['areacode']);
                oShopList.setFilterParams('quan_id', data['quancode']);

                oShopList.setFilterParams('lng', '');
                oShopList.setFilterParams('lat', '');

                var wAddr = W('#addrSearchForm [name="addr"]');
                wAddr.val(wAddr.attr('data-default')).addClass('default');

                oShopList.renderShopList(true);
            }
        });


        // 绑定位置搜索框
        function initAddrSearch(){
            // 地址搜索表单
            var wSearchForm = W('#addrSearchForm'),
                wAddr = wSearchForm.one('[name="addr"]');

            wSearchForm.bind('submit', function(e){
                e.preventDefault();

                var txt = wAddr.val();

                if( txt =='' || txt == wAddr.attr('data-default') ){
                    wAddr.focus();
                    if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(wAddr);
                }else{
                    getGeoPoi(txt, searchByPoi);
                }
            });

            wAddr.on('focus', function(){
                W('.addr-search-err').hide();
            });

            window.aaaaa = new AddrSuggest(wAddr, {
                'showNum' : 6,
                'onSelect' : function(txt){ getGeoPoi(txt, searchByPoi); },
                'requireCity' : function(){ return W('#JsAreaSelectWrap .sel-city .sel-txt').html() || '' }
            });


            // 根据经纬度搜索
            function searchByPoi(poi){
                if(poi == null){
                    W('.addr-search-err').show();
                }else{
                    W('.addr-search-err').hide();

                    oShopList.setFilterParams('lng', poi['lng']);
                    oShopList.setFilterParams('lat', poi['lat']);

                    oShopList.setFilterParams('area_id', '');
                    oAreaSelect._setAreaData('', '选择区县');

                    oShopList.renderShopList(true);
                }
            }

            //获取poi
            function getGeoPoi(addr, callback){

                W('<div id="geoMapBox"></div>').appendTo( W('body') ).hide();

                var _map = new AMap.Map("geoMapBox");
                // 加载地理编码插件 
                _map.plugin(["AMap.Geocoder"], function() {
                    MGeocoder = new AMap.Geocoder({
                        city : W('#JsAreaSelectWrap .sel-city .sel-txt').html() || '',
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

                        callback(pos);
                    });
                    //逆地理编码
                    MGeocoder.getLocation(addr);
                });
            }

        }

        //位置搜索过滤
        initAddrSearch();

    }());

    // 媒体报道
    (function () {
        // 更多报道列表滚动展示
        function scollMediaReportMoreList() {
            var
                $list = $('.media-report-more-list'),
                $inner = $list.find('.media-report-more-list-inner'),
                h = $inner.find('.more-item').eq(0).height()

            setTimeout(function(){
                var arg = arguments;
                $inner.animate({'top': -h}, 800, function(){
                    $inner.find('.more-item').eq(0).appendTo($inner)

                    $inner.css({'top': 0})

                    setTimeout(arg.callee, 3500)
                })
            }, 3500)
        }
        scollMediaReportMoreList()

        // 关于我们
        function playVideo($trigger){
            var $TriggerShowVideo = $trigger || $('.trigger-play-video')

            if ($TriggerShowVideo && $TriggerShowVideo.length){
                $TriggerShowVideo.on('click', function(e){
                    e.preventDefault()

                    var html_fn = $.tmpl($.trim($('#JsAboutUsVideoPlayerPanelTpl').html())),
                        html_st = html_fn()

                    tcb.showDialog(html_st, {
                        className : 'video-player-panel',
                        withClose : true,
                        middle : true
                    })
                })
            }
        }
        playVideo($('.trigger-play-video'))
    }());
});

