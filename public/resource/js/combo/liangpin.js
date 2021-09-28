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


;/**import from `/resource/js/include/PriceCalculate.js` **/
// 价格计算
(function(){
    var Bang = window.Bang = window.Bang || {};

    function getProductOriginPrice(){
        var me = this;

        var PriceObj = me.PriceObj;

        return PriceObj['origin_price'];
    }
    function setProductPriceInfo(prop, val, final_flag){
        var me = this;

        var PriceObj = me.PriceObj;

        if (val) {
            PriceObj[prop] = val;
        } else {
            if (typeof PriceObj[prop] !== 'undefined') {

                delete PriceObj[prop];
            }
        }

        return final_flag ? me.calculateProductPrice() : val;
    }
    function getProductPriceInfoByProp(prop){
        var me = this;

        var PriceObj = me.PriceObj;

        return PriceObj[prop] || 0;
    }
    function deleteProductPriceInfoByProp(prop){
        var me = this;

        me.setProductPriceInfo(prop);
    }
    function calculateProductPrice(){
        var me = this;

        var PriceObj = me.PriceObj,
            final_price = parseFloat(PriceObj['origin_price']) || 0;

        // 原价折扣
        if (PriceObj['origin_price_promo_per'] && PriceObj['origin_price_promo_per']>0 && PriceObj['origin_price_promo_per']<100) {
            final_price = tcb.formatMoney( final_price*PriceObj['origin_price_promo_per']/100, 0, -1);
        }

        // 累加计算价格，将原价和两个特殊折扣除开
        var except_prop = ['origin_price', 'origin_price_promo_per', 'final_price_promo_per'];
        for(var prop in PriceObj) {
            if (PriceObj.hasOwnProperty( prop )){
                // 累加except_prop以外的属性值
                if ( tcb.inArray(prop, except_prop) === -1 ){
                    final_price += parseFloat(PriceObj[prop]) || 0;
                }
            }
        }

        // 最终价格折扣
        if (PriceObj['final_price_promo_per'] && PriceObj['final_price_promo_per']>0 && PriceObj['final_price_promo_per']<100) {
            final_price = tcb.formatMoney( final_price*PriceObj['final_price_promo_per']/100, 1, -1);
        }

        return tcb.formatMoney(final_price, 2, 1);
    }


    function PriceCalculate(PriceObj){

        var me = this;

        me.PriceObj = PriceObj;

    }

    // 设置商品价格信息
    PriceCalculate.prototype.setProductPriceInfo = setProductPriceInfo;
    // 传入属性 获取 商品价格相关参数的值
    PriceCalculate.prototype.getProductPriceInfoByProp = getProductPriceInfoByProp;
    // 传入属性 删除 商品价格相关参数的值
    PriceCalculate.prototype.deleteProductPriceInfoByProp = deleteProductPriceInfoByProp;
    // 计算商品价格
    PriceCalculate.prototype.calculateProductPrice = calculateProductPrice;
    // 获取商品原始价格
    PriceCalculate.prototype.getProductOriginPrice = getProductOriginPrice;

    window.Bang.PriceCalculate = function(InputPriceObj){
        InputPriceObj = InputPriceObj || {};

        var PriceObj = tcb.mix({
            'origin_price': 0, // 原始价格
            'origin_price_promo_per': 0, // 原价折扣（88折等，不大于100，小于等于0则无效）
            'final_price_promo_per': 0 // 最终价格折扣（88折等，不大于100，小于等于0则无效）
        }, InputPriceObj, true);

        return new PriceCalculate(PriceObj);
    };
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

;/**import from `/resource/js/page/liangpin/inc/product_list_render.js` **/
;
!function () {
    window.Bang = window.Bang || {}

    function renderProductList (options) {
        var
            defaults = {
                // 输出目标位置
                $target        : '',
                // 输出模板
                $tpl           : '',
                // 商品请求地址
                request_url    : '',
                // 请求的参数，页码和也没数量是基本参数，还可以包括任何其他参数
                request_params : {
                    // 页码
                    pn        : 0,
                    // 每页数量
                    page_size : 20
                },
                // 开启图片懒加载
                lazy_load      : true,
                // 显示列数
                col            : 5,
                // 指定的商品列表的key（用于处理不同接口返回的列表数据的key不一样的情况）
                list_key       : '',
                // 失败回调函数
                fail           : tcb.noop,
                // 输出完成执行
                complete       : tcb.noop
            }

        options = tcb.mix (defaults, options, true)

        var
            $target = W (options.$target),
            $tpl = W (options.$tpl)

        if ( !($target && $target.length && $tpl && $tpl.length)){
            return tcb.warn('$target：'+options.$target+'，或者$tpl：'+options.$tpl+'，不存在，无法正确执行')
        }

        options.col = parseInt(options.col, 10) || 5

        options.request_params = options.request_params || {}
        options.request_params[ 'pn' ] = parseInt (options.request_params[ 'pn' ], 10) || 0
        options.request_params[ 'page_size' ] = parseInt (options.request_params[ 'page_size' ], 10) || 20

        // 获取商品数据
        getProductData (options.request_url, options.request_params, function (result) {
            var
                product_list = null

            if (options.list_key) {
                // 根据指定的key在商品中获取商品列表

                product_list = result[options.list_key]
            }
            product_list = product_list ? product_list : result[ 'product_list' ] || result[ 'good_list' ]

            // 如果返回的数据超过限定的每页数量，那么干掉多余的
            product_list.splice (options.request_params[ 'page_size' ], 9999)

            var
                product_list_html = getProductHtml ($tpl, {
                    good_list : product_list,
                    col       : options.col
                })

            renderProductListHtml ($target, product_list_html, options.lazy_load)

            // 输出完成
            typeof options.complete === 'function' && options.complete (result, $target)

        }, options.fail)
    }

    // 获取商品列表的html字符串
    function getProductHtml ($tpl, data) {
        data = data || {}
        // 商品列表
        data[ 'good_list' ] = data[ 'good_list' ] || []
        // 商品列
        data[ 'col' ] = data[ 'col' ] || 5

        tcb.each (data[ 'good_list' ], function (i, item) {
            // 如果返回的商品图片是字符串格式，那么做个特殊处理
            if (typeof item[ 'thum_img' ] === 'string') {

                var thum_img = tcb.imgThumbUrl2 (item[ 'thum_img' ], 300, 300, 'edr')
                item[ 'thum_img' ] = {
                    'big' : thum_img,
                    'mid' : thum_img,
                    'min' : thum_img,
                    'old' : thum_img
                }
                tcb.preLoadImg (thum_img)
            }
        })

        var html_fn = $tpl.html ().trim ().tmpl ()

        return html_fn (data)
    }

    // 输出商品列表的html
    function renderProductListHtml ($target, html_str, lazy_load) {
        $target.html (html_str);

        if (lazy_load) {
            setTimeout (function () {
                tcb.lazyLoadImg (0, $target)
            }, 300)
        }
    }

    // 获取热销机型列表
    function getProductData (url, params, success, fail) {
        if (!url) {
            return console.error ('这里有个商品列表异步请求没有传入url')
        }

        // 请求商品数据
        QW.Ajax.get (url, params, function (res) {
            res = JSON.parse (res)

            if (!res[ 'errno' ]) {

                typeof success === 'function' && success (res[ 'result' ])

            } else {
                typeof fail === 'function' && fail (res)
            }
        })

    }

    //====================== Export ========================
    window.Bang.renderProductList = renderProductList

} ()

;/**import from `/resource/js/page/liangpin/inc/search_suggest.js` **/
//关键词搜索/联想
(function () {
    var
        loadJs = function ( url ) {
            var head = document.getElementsByTagName ( 'head' )[ 0 ] || document.documentElement,
                script = document.createElement ( 'script' ),
                done = false;
            script.src = url;
            script.charset = 'utf-8';
            script.onerror = script.onload = script.onreadystatechange = function () {
                if ( !done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") ) {
                    done = true;
                    head.removeChild ( script );
                }
            };
            head.insertBefore ( script, head.firstChild );
        },

        mix = function ( des, src ) {
            for ( var i in src ) {
                des[ i ] = src[ i ];
            }
            return des;
        },
        //DomU=QW.DomU,
        createElement = function ( tagName, property ) {
            return mix ( document.createElement ( tagName ), property );
        },
        //EventH=QW.EventH,
        target = function ( e ) {
            e = e || window.event;
            return e.target || e.srcElement;
        },
        keyCode = function ( e ) {
            e = e || window.event;
            return e.which || e.keyCode || e.charCode;
        },
        preventDefault = function ( e ) {
            e = e || window.event;
            e.preventDefault && e.preventDefault () || (e.returnValue = false);
        },
        //CustEvent=QW.CustEvent,
        //NodeH=QW.NodeH,
        hasClass = function ( el, cn ) {
            return new RegExp ( '(?:^|\\s)' + cn + '(?:\\s|$)', 'i' ).test ( el.className );
        },
        addClass = function ( el, cn ) {
            if ( !hasClass ( el, cn ) ) {
                el.className = (el.className + ' ' + cn).replace ( /^\s+|\s+$/g, '' );
            }
        },
        removeClass = function ( el, cn ) {
            if ( hasClass ( el, cn ) ) {
                el.className = el.className.replace ( new RegExp ( '(?:\\s|^)' + cn + '(?:\\s|$)', 'i' ), ' ' ).replace ( /^\s+|\s+$/g, "" );
            }
        },
        //setStyle=NodeH.setStyle,
        //getXY=NodeH.getXY, 由于getXY的兼容代码很长，所以无依赖化时，稍稍调整下，不用位置，而改用dom结构来定位
        ancestorNode = function ( el, tagName, topEl ) {
            do {
                if ( el.tagName == tagName ) {
                    return el;
                }
            } while ( el != topEl && (el = el.parentNode) )
            return null;
        },
        on = function ( element, name, handler ) {
            element.addEventListener ? element.addEventListener ( name, handler, false ) : element.attachEvent ( 'on' + name, handler );
        },
        isIe = (/msie/i).test ( navigator.userAgent );


    /**
     *@class ComboBox 可输入下拉框
     */
    function ComboBox ( opts ) {
        mix ( this, opts );
        this.render ();
    }

    ComboBox.prototype = {
        /*
         *参数
         */
        width            : 0,
        oText            : null,//text-input对象
        itemsData        : null,//items数据，array，需要在refreshData方法里进行设值
        /*
         *开放的变量，readOnly的
         */
        oMenu            : null,
        oWrap            : null,
        selectedIndex    : -1,//当前选中项
        filteredValue    : "",//过滤值。过滤动作已完成
        filteringValue   : "",//过滤值。过滤动作正在进行（因为有时过滤是异步的）
        acValue          : "",//通过自动完成得到的值
        closed           : false,//suggest是否处于关闭状态。－－由suggest自身决定

        suggestUrl      : '', // 联想词的推荐url

        /*
         *方法
         */
        show             : function () {
            if ( this.oMenu.childNodes.length ) {
                this.oWrap.style.display = "";
            }
        },
        hide             : function () {
            this.oWrap.style.display = "none";
        },
        ishide           : function () {
            return this.oWrap.style.display === "none";
        },
        refreshItems     : function ( rtype ) {
            var me = this;
            var data = me.itemsData;
            if ( data && !data.__isItemsDataRendered ) { //加上属性“__isItemsDataRendered”以标志data是否已经render成html
                var html = [];
                for ( var i = 0; i < data.length; i++ ) {
                    var
                        //data_url = data[ i ][ 2 ] ? ' data-url="'+encodeURIComponent(data[ i ][ 2 ])+'"' : '' // 特别指定的url
                        data_url = data[ i ][ 2 ] ? ' data-url="'+(data[ i ][ 2 ])+'"' : '' // 特别指定的url

                    if ( rtype == "hot" ) {
                        var num = i + 1;
                        if ( i < 3 ) {
                            html.push ( '<li acValue="' + data[ i ][ 0 ].replace ( /&/g, '&amp;' ).replace ( /"/g, '&quot;' ) + '"'+data_url+'><em>' + num + '</em>' + data[ i ][ 1 ] + '</li>' );
                        }
                        else {
                            html.push ( '<li acValue="' + data[ i ][ 0 ].replace ( /&/g, '&amp;' ).replace ( /"/g, '&quot;' ) + '"'+data_url+'><em class="gray">' + num + '</em>' + data[ i ][ 1 ] + '</li>' );
                        }

                    }
                    else {
                        html.push ( '<li acValue="' + data[ i ][ 0 ].replace ( /&/g, '&amp;' ).replace ( /"/g, '&quot;' ) + '"'+data_url+'>' + data[ i ][ 1 ] + '</li>' );
                    }

                }
                me.oMenu.innerHTML = (html.join ( "" ).replace ( /(<\w+)/g, '$1 unselectable="on"' ));
                if ( data.length ) {
                    me.show ();
                }
                else {
                    me.hide ();
                }
                me.filteredValue = me.filteringValue;
                me.acValue = "";
                me.selectedIndex = -1;
                data.__isItemsDataRendered = true;
            }
        },
        /*
         refreshData:function(){
         this.itemsData=["refreshData一定要重写！"];
         },
         */
        setSelectedIndex : function ( idx, needBlur ) {
            var me = this
                ,suggestUrl = ''

            var rows = me.oMenu.childNodes;
            if ( rows.length ) {
                if ( me.selectedIndex > -1 ) {
                    removeClass ( rows[ me.selectedIndex ], "selected" );
                }
                idx = (idx + rows.length + 1) % (rows.length + 1);
                if ( idx == rows.length ) {
                    me.acValue = me.oText.value = me.filteringValue;//这里用filteringValue，而不用filteredValue，是因为有时itemsData是静态的（例如，不用过滤功能的单纯ComboBox）
                    idx = -1;
                }
                else {
                    me.acValue = me.oText.value = rows[ idx ].getAttribute ( "acValue" );
                    suggestUrl = rows[ idx ].getAttribute ( "data-url" );
                    addClass ( rows[ idx ], "selected" );
                }
            }
            else {
                idx = -1;
            }
            // 设置被选中索引
            me.selectedIndex = idx
            // 设置推荐的url
            me.suggestUrl = suggestUrl ? suggestUrl : ''
        },
        refreshPos       : function ( oWrap, oPos ) {
            oWrap.style.top = oPos.offsetHeight + 0 - 1 + 'px';
            oWrap.style.left = oPos.offsetLeft - 0 + 'px';
        },
        render           : function () {
            var me = this;
            if ( me._rendered ) {
                return;
            }
            me._rendered = true;
            var innerHtml = '<div class=ac_wrap_inner><div class=ac_menu_ctn><ul class=ac_menu></ul></div></div>';

            if ( (/msie[ \/os]*6\./ig).test ( navigator.userAgent ) ) {
                innerHtml = '<iframe class="ac_bgIframe"></iframe>' + innerHtml;
            }
            var oWrap = createElement ( "div", {
                className : "ac_wrap",
                innerHTML : innerHtml.replace ( /(<\w+)/g, '$1 unselectable="on"' )
            } );
            //var b=document.body;
            //b.insertBefore(oWrap,b.firstChild);
            var oText = me.oText,
                oPos = me.oPos || oText;
            oPos.parentNode.insertBefore ( oWrap, oPos );//为了减少定位麻烦，改用dom位置来定位
            var oMenu = me.oMenu = oWrap.getElementsByTagName ( "ul" )[ 0 ];
            oText.setAttribute ( "autoComplete", "off" );//一定要用setAttrubute，否则会导致在firefox里半输入状态下执行oText.blur()时会抛出无法捕捉的异常。
            var w = (me.oText.getAttribute ( 'suggestWidth' ) - 0 || oPos.offsetWidth) + 0 + "px"; //支持suggestWidth属性来设置suggest的宽度
            if ( isIe ) {
                oWrap.style.width = w;
            }
            else {
                oWrap.style.minWidth = w;
            }
            me.refreshPos ( oWrap, oPos );
            me.oWrap = oWrap;
            me.hide ();

            on ( me.oText, "keydown", function ( e ) {//监控oText的事件
                if ( isMouseDown ) {
                    return false;
                }

                var val = oText.value;

                if (val) {
                    me.acValue = me.filteringValue = me.filteredValue = "";
                    me.hide ();
                    me.closed = false;//吸收google suggest的策略：如果suggest被关闭，用户将oText清空，这时会将suggest打开。
                } else if ( !me.closed ) {
                    me.filteringValue = val;
                    me.refreshData ();
                    if ( me.itemsData ) {
                        me.refreshItems ();
                    }
                }

                var kCode = keyCode ( e );
                var dir = 0;
                switch ( kCode ) {
                    case 40 :
                        dir = 1;
                        break;
                    case 38 :
                        dir = -1;
                        break;
                    case 27 :
                        if ( !me.closed ) {
                            me.hide ();
                            me.closed = true;
                            preventDefault ( e )
                        }
                        break;//隐藏suggest
                    //case 13 : me.hide();me.onenter && me.onenter(); break;//隐藏suggest
                }
                if ( dir && oText.value ) {
                    preventDefault ( e );
                    if ( oWrap.style.display == "none" ) {
                        me.show ();
                        me.closed = false;
                    }
                    else {
                        me.setSelectedIndex ( me.selectedIndex + dir );
                    }
                }

            } );
            on ( me.oText, "focus", function ( e ) {//监控oText的事件
                W('.searchbox .suggest-word' ).hide();

                me.refreshPos ( oWrap, oPos );
                var CLEAR_DEFAULT_SEARCH = window.location.href.indexOf ( '/search' ) > -1 ? false : true;
                var _val = me.oText.getAttribute ( 'data-default' );
                if ( _val == me.oText.value && CLEAR_DEFAULT_SEARCH ) {
                    me.oText.value = '';
                }
                me.oText.className = me.oText.className.replace ( /\s?default\s?/g, '' );

                //拥有已输入内容时，开启suggest
                if ( me.oText.value.length == 0 ) {
                    me.show ();
                    if ( isMouseDown ) {
                        return false;
                    }
                    var val = oText.value;
                    if ( val ) {
                        me.acValue = me.filteringValue = me.filteredValue = "";
                        me.hide ();
                        me.closed = false;//吸收google suggest的策略：如果suggest被关闭，用户将oText清空，这时会将suggest打开。
                    }
                    else if ( !me.closed ) {
                        me.filteringValue = val;
                        me.refreshData ();
                        if ( me.itemsData ) {
                            me.refreshItems ();
                        }
                    }
                }

            } );
            on ( me.oText, "blur", function ( e ) {//监控oText的事件
                if (me.oText.value.length < 1){
                    W('.searchbox .suggest-word' ).show()
                }

                me.hide ();
                var _default = me.oText.getAttribute ( 'data-default' );
                if ( !me.oText.value && _default ) {
                    me.oText.value = _default;
                    me.oText.className += ' default';
                }
            } );
            var isMouseDown,
                mouseDownTimer;
            oWrap.onmousedown = function ( e ) {//监控oWrap的事件
                preventDefault ( e ); // 阻止输入框失焦
                //if(isIe){oText.setCapture();setTimeout(function(){oText.releaseCapture();},10);} //解决“IE下，半输入状态时不能点击选项”的问题
                clearTimeout ( mouseDownTimer );//以下三句解决“半输入状态时不能点击选项”的问题
                isMouseDown = true;
                mouseDownTimer = setTimeout ( function () {
                    isMouseDown = false;
                }, 2000 );
            };
            oMenu.onclick = function ( e ) {//监控oMenu的事件
                var el = target ( e );
                var li = ancestorNode ( el, "LI", oMenu );
                if ( li ) {
                    oText.blur ();//Firefox下半输入法输入时，选择item，console有错，无法catch，并且不影响运行。
                    setTimeout ( function () {
                        oText.focus ();
                    }, 10 );//解决“半输入状态时不能点击选项”的问题
                    var rowIndex = 0,
                        preLi = li;
                    while ( preLi = preLi.previousSibling ) {
                        rowIndex++;
                    }
                    me.setSelectedIndex ( rowIndex, true );
                    me.hide ();
                    me.onselectitem && me.onselectitem ();
                }
            };
            oMenu.onmouseover = function ( e ) {//监控oMenu的事件
                var el = target ( e );
                var li = ancestorNode ( el, "LI", oMenu );
                if ( li ) {
                    addClass ( li, "hover" );
                }
            };
            oMenu.onmouseout = function ( e ) {//监控oMenu的事件
                var el = target ( e );
                var li = ancestorNode ( el, "LI", oMenu );
                if ( li ) {
                    removeClass ( li, "hover" );
                }
            };
        }
    }


    Dom.ready ( function () {

        var
            $SearchTxt = W ( '.top-search .search-txt' )

        if ( $SearchTxt.length ) {

            //搜索suggest
            window.suggest = function ( data ) {
                var ar = [],
                    menuData = data.result || [],
                    kw = oText.value;
                for ( var i = 0; i < menuData.length; i++ ) {
                    var
                        key = menuData[ i ][ 'word' ] || menuData[ i ]
                        ,val = key
                        ,url = menuData[ i ][ 'url' ] || '' // keyword的指定url

                    if ( kw && val.indexOf ( kw ) == 0 ) {
                        val = kw + '<b>' + val.substr ( kw.length ) + '</b>';
                    }

                    if ( key ) {
                        ar.push ( [ key, val, url ] );
                    }
                }
                cb.itemsData = ar;

                if ( data.query ) {
                    dataCache[ data.query ] = data;
                }
            }


            var oText = W ( '.top-search .search-txt' )[ 0 ],
                dataCache = {};
            var cb = new ComboBox ( {
                oText        : oText,
                onselectitem : function () {
                    // 如果有推荐跳转url,直接跳转到指定url
                    if (this.suggestUrl){

                        //window.location.href = this.suggestUrl
                        window.location.href = decodeURIComponent(this.suggestUrl)
                        return
                    }

                    var els = oText.form.elements;
                    for ( var i = 0; i < els.length; i++ ) {
                        if ( els[ i ].type == 'submit' ) {
                            els[ i ].click ();

                            return;
                        }
                    }
                },
                refreshData  : function () {
                    //var data = dataCache[ oText.value ];
                    var
                        HotSuggests = window.HotSuggests || []
                        ,data = {
                            result : []
                        }
                    HotSuggests.forEach ( function ( el ) {
                        if (typeof el==='string'){
                            el = {
                                'suggest_name':el
                                ,'suggest_url':''
                            }
                        }
                        data[ 'result' ].push ( {
                            word : el['suggest_name'] || ''
                            ,url: el['suggest_url'] || ''
                        } )
                    } )

                    if ( data ) {
                        suggest ( data );
                    }
                    else {

                        //loadJs( BASE_ROOT +'/youpin/suggest?word='+encodeURIComponent(this.oText.value)+'&callback=window.suggest&t='+Math.random())
                        QW.Ajax.get ( '/youpin/suggest?word=' + encodeURIComponent ( this.oText.value ), function ( rs ) {
                            try {
                                suggest ( rs );
                            } catch ( ex ) {
                            }
                        } );

                    }
                }
            } );
            // 暂时注释，在分辨率低的显示器下，此处影响滚动条默认定位到顶部
            oText.focus ();
            oText.blur ();
        }

        //搜索验证
        W ( '.top-search' ).on ( 'submit', function ( e ) {
            e.preventDefault ();

            var kw = W ( this ).one ( '[name="keyword"]' ),
                kw_df = kw.attr ( 'data-default' ),
                kw_str = kw.val ().trim ();

            if ( kw_df == kw_str ) {
                kw.val ( kw.attr ( 'data-defaultsearch' ) );
            }
            if ( kw_str == '' ) {
                kw.shine4Error ().focus ();
                return;
            }

            this.submit ();
        } );

    } )

} ());


;/**import from `/resource/js/page/liangpin/inc/tuiguang_slide.js` **/
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

;/**import from `/resource/js/page/liangpin/index/top_slide.js` **/
;!function(){
    window.Bang = window.Bang || {}

    var
        //============ 选择器 ============
        // 滑动模块最外层容器
        selector_wrap = '.slide-shower-wrap',
        selector_inner = '.slide-inner',
        selector_list = '.slide-list',
        // 滑动单元块
        selector_item = '.slide-item',
        // 滑动导航标识点容器
        selector_nav = '.slide-ctrl',
        // 滑动导航标识点
        selector_nav_item = '.ctrl-item',
        // 向左
        selector_go_left = '.slide-go-left',
        // 向右
        selector_go_right = '.slide-go-right',


        //============ 元素类class ============
        class_nav_item = 'ctrl-item',
        class_nav_cur = 'ctrl-curr'

    // 简单的轮播
    function SimpleSlider(options){
        var
            defaults = {
                // 最外层容器
                container : '.block-slide',
                // 自动滑动的时间间隔，false or 数字
                auto      : false,
                // 开始位置
                start     : 0,
                // 滑动速度
                speed     : 300,
                // 显示nav
                nav_show  : true
            },
            me = this

        me.options = tcb.mix(defaults, options, true)
        me.options.auto = parseInt(me.options.auto, 10) || 0
        me.options.start = parseInt(me.options.start, 10) || 0
        me.options.speed = parseInt(me.options.speed, 10) || 300

        // item的宽度
        me.itemWidth = 0
        // item的数量
        me.itemCount = 0
        // 当前item的位置，从0开始
        me.itemPos = me.options.start
        // 滑动模块的最外层容器
        me.$container = W(me.options.container)

        me.autoHandler = null

        if (!(me.$container && me.$container.length)){
            return tcb.warn('找不到轮播容器：'+me.options.container)
        }

        me.init()
    }

    tcb.mix(SimpleSlider.prototype, {
        // 初始化
        init: function(){
            var
                me = this,
                options = me.options

            me.createNav()

            me.resize()

            me.bindEvent()

            if (options.auto){

                me.runAuto()
            }
        },
        // 执行滑动到指定的位置
        run : function(target_pos, run_force){
            var
                me = this,
                options = me.options

            clearTimeout(me.autoHandler)

            var
                $container = me.$container

            target_pos = typeof target_pos === 'undefined' ? +me.itemPos+1 : target_pos
            target_pos = (me.itemCount - target_pos < 1) ? 0 : target_pos

            if (target_pos==me.itemPos && !run_force){
                // 目标位置和当前位置相同，并且不强制滑动位置，那么不做任何处理
                return
            }

            $container.query (selector_inner).animate (
                { 'scrollLeft' : target_pos * me.itemWidth },
                options.speed,
                function () {
                    $container
                        .query(selector_nav_item)
                        .removeClass(class_nav_cur)
                        .item (target_pos).addClass (class_nav_cur)

                    me.itemPos = target_pos
                },
                QW.Easing.easeBoth)
        },
        // @ToDo 上翻下翻
        runNext: function(){},
        runPrev: function(){},
        // 自动滚动
        runAuto: function(){
            var
                me = this,
                options = me.options,
                auto = options.auto

            me.autoHandler = setTimeout(function runAuto(){

                me.run()

                me.autoHandler = setTimeout(runAuto, auto)
            }, auto)
        },
        // 设置适应的滑动尺寸
        resize: function(){
            var
                me = this,
                $container = me.$container,
                $inner = $container.query(selector_inner),
                $list = $container.query(selector_list),
                $items = $container.query(selector_item)

            me.itemWidth = $container.query(selector_inner).getSize().width
            me.itemCount = $items.length

            $list.css('width', me.itemWidth * me.itemCount)

            $items.css('width', me.itemWidth)

            $inner[0].scrollLeft = me.itemPos*me.itemWidth
        },
        // 创建nav，如果有必要的话
        createNav: function(){
            var
                me = this,
                $container = me.$container,
                $item = $container.query(selector_item),
                $nav = $container.query(selector_nav),
                $nav_item = $nav.query(selector_nav_item)

            if ($item && $nav_item && $item.length==$nav_item.length){
                // nav的数量和item一致，那么直接返回不作处理，
                // 否则重新生成nav让其和item数量保持一致

                return
            }

            var
                nav_item_html = ''
            for (var i = 0; i < $item.length; i++) {
                nav_item_html += i == this.options.start
                    ? '<span class="' + class_nav_item + ' ' + class_nav_cur + '" data-sn="' + i + '"></span>'
                    : '<span class="' + class_nav_item + '" data-sn="' + i + '"></span>';
            }
            $nav.html (nav_item_html)

            if (me.options.nav_show) {
                $nav.show ()
            } else {
                $nav.hide ()
            }
        },
        // 绑定相关事件
        bindEvent: function(){
            var
                me = this,
                $container = me.$container,
                options = me.options

            // 绑定nav item的点击事件
            $container.query(selector_nav_item).on('click', function(e){
                e.preventDefault()

                var
                    $me = W(this),
                    pos = +$me.attr('data-sn')

                me.run(pos)
            })

            // 移入停止自动滑动
            $container.on('mouseenter', function(e){

                clearTimeout(me.autoHandler)
            })
            // 移出后重新开始自动滑动
            $container.on('mouseleave', function(e){
                if(options.auto){
                    me.runAuto()
                }
            })
            // 页面尺寸变化
            W(window).on('resize', function(){
                me.resize()

                clearTimeout(me.autoHandler)

                if (options.auto){

                    me.runAuto()
                }
            })
        }

    })


    //====================== Export ========================
    window.Bang.SimpleSlider = SimpleSlider
}()

;/**import from `/resource/js/page/liangpin/inc/common.js` **/
// 公共功能
(function(){
    Dom.ready(function(){
        var statistic_page_class_map = {
            //首页
            'index'   : [ '_trackEvent', 'pc优品', '统计', '首页', '1', '' ],
            // 商品详情页
            'product' : [ '_trackEvent', 'pc优品', '统计', '商品详情页', '1', '' ],
            // 下单页
            'tinfo'   : [ '_trackEvent', 'pc优品', '统计', '下单页', '1', '' ],
            // 搜索页
            'search'  : [ '_trackEvent', 'pc优品', '统计', '搜索页', '1', '' ],
            // 收银台页
            'cashier'  : [ '_trackEvent', 'pc优品', '统计', '收银台页', '1', '' ],
            // 支付成功页
            'paysuccess'  : [ '_trackEvent', 'pc优品', '统计', '支付成功页', '1', '' ]
        }
        if (statistic_page_class_map[ window.__PageSymbol ]) {
            // 添加事件统计
            tcb.statistic (statistic_page_class_map[ window.__PageSymbol ])
        }

        tcb.bindEvent(document.body, {
            // 优品首页、搜索页商品交互
            '.search-result .p-item': {
                'mouseenter': function(e){
                    var wMe = W(this);

                    wMe.addClass('p-item-hover');
                },
                'mouseleave': function(e){
                    var wMe = W(this);

                    wMe.removeClass('p-item-hover');
                }
            },

            // 点击商品
            '.prd-item-awrap, .prd-item .prd-buy': {
                'mousedown': function(e){
                    var $me = $(this),
                        href = $me.attr('href');

                    $me.attr('href', tcb.setUrl(href, {"from": tcb.queryUrl(window.location.href, 'from')}));
                }
            },
            // 无忧换机大礼包
            '.product-detail-wuyouhuanji': function(e){
                e.preventDefault();

                tcb.panel('', W('#JsWuYouHuanJiTipPanelTpl').html().tmpl()(), {
                    className:'extendservice-confirm-panel-wrap wuyouhuanji-tip-panel-wrap'
                });

            },
            // 无忧换机大礼包协议
            '.show-wuyouhuanji-agreement': function(e){
                e.preventDefault();

                tcb.panel('', W('#JsWuYouHuanJiAgreementPanelTpl').html().tmpl()(), {
                    className:'wuyouhuanji-agreement-panel panel-tom01'
                });
            },
            // 新春大礼包
            '.trigger-new-year-customer-gift-shower': function(e){
                e.preventDefault()

                tcb.panel('', W('#JsNewYearCustomerGiftShowerPanelTpl').html().tmpl()(), {
                    className:'extendservice-confirm-panel-wrap new-year-customer-gift-shower-panel-wrap'
                })
            },
            // 年中大促
            '.btn-year-middle-promo': function(e){
                e.preventDefault()

                var
                    qrcode_img = 'https://p.ssl.qhimg.com/t01cd557789c534b36d.jpg',
                    html_st = '<h3>扫码领取618活动优惠码</h3>' +
                        '<div class="desc">仅限6月16～26日</div>' +
                        '<div class="img">' +
                        '<img src="https://p.ssl.qhimg.com/t017ee3be501e423c98.gif" alt="" />' +
                        '</div>'
                tcb.panel('  ', html_st, {
                    className: 'panel-tom01 year-middle-promo-panel'
                })

                setTimeout(function(){

                    tcb.imageOnload(qrcode_img, function(){

                        W('.year-middle-promo-panel .img img' ).attr('src', qrcode_img)
                    })
                }, 200)


                // 添加事件统计
                //tcb.statistic ( [ '_trackEvent', '优惠券促销', '点击领券', '618促销', '1', 'btn-year-middle-promo' ] )
            },

            //右侧新人二维码
            '.js-ewm-unexpand':function (e) {
                e.preventDefault()
                var wMe = W(this)
                W('.js-ewm-expand').css('display','block')
                W('.right-service-inner').hide()
            },
            '.js-ewm-expand':function (e) {
                e.preventDefault()
                var wMe = W(this)
                wMe.hide()
                W('.right-service-inner').show()
            },
            //回到顶部
            '.js-trigger-go-to-top': function (e) {
                e.preventDefault()
                $(window).scrollTop(0)
            },
            // 展示停服公告
            '.js-trigger-show-tingfu-notice': {
                'click': function (e) {
                    e.preventDefault()
                },
                'mouseenter': function (e) {
                    var $BlockNoticeWrap = $('.block-notice-wrap')
                    var $me = $(this)
                    var offset = $me.offset()
                    if (offset.top < 500) {
                        $BlockNoticeWrap.css({
                            bottom: '-485px'
                        })
                    }
                    console.log($me.offset())
                    $BlockNoticeWrap.show()
                },
                'mouseleave': function (e) {
                    $('.block-notice-wrap').hide()
                }
            }
        })

    })

    // 设置许愿postkey
    function setXYPostkey(postkey){
        window.XYPostkey = postkey;
    }
    // 获取许愿postkey
    function getXYPostkey(){
        return window.XYPostkey;
    }

    window.setXYPostkey = setXYPostkey;
    window.getXYPostkey = getXYPostkey;

    // 验证表单是否可提交
    function isFormDisabled($form){
        var flag = false;

        if(!$form.length){
            return true;
        }
        if( $form.hasClass('form-disabled') ){
            flag = true;
        }

        return flag;
    }
    tcb.isFormDisabled = tcb.isFormDisabled || isFormDisabled;

    // 设置表单不可提交
    function setFormDisabled($form){
        if(!$form.length){
            return ;
        }
        $form.addClass('form-disabled');
    }
    tcb.setFormDisabled = tcb.setFormDisabled || setFormDisabled;

    // 设置表单可提交
    function releaseFormDisabled($form){
        if(!$form.length){
            return ;
        }
        $form.removeClass('form-disabled');
    }
    tcb.releaseFormDisabled = tcb.releaseFormDisabled || releaseFormDisabled;

    //心愿 smarty模板变量变为异步取数据（hot_model、model、brand）
    function getXYData(callback) {

        QW.Ajax.get('/youpin/doGetXyModelList',function (res) {
            res = QW.JSON.parse(res)
            if(!res.errno){
                typeof callback == 'function' && callback(res.result)
            }
        })
    }
    tcb.getXYData =  getXYData;

    // 优品许愿
    function lpWishFormSubmit(wWishForm){
        var wWish = wWishForm||W('.wish-form');
        if(!wWish.length){
            return ;
        }
        var
            selector_container = '.wish-cont';

        tcb.getXYData(function (res) {
            // 发布许愿里的型号选择列表
            if(res['brand']&&res['model']){
                window.WishModelSelectList = [res['brand'],res['model']];
            }

            //设置xy_postkey
            W('[name="xy_postkey"]').val( res.xy_postkey);
            setXYPostkey(res.xy_postkey);

            // 设置host_model
            var html_str =  W('#JsXYHotModel').html().trim().tmpl()({
                'list': res['hot_model']
            });
            W('.wish-form .model-list').html(html_str);
            //设置第一个为默认选中
            W('.wish-form .model-list span:first-child').addClass('item-cur');
            var init_price = W('.wish-form .model-list span:first-child').attr('data-wprice'),
                init_model_id = W('.wish-form .model-list span:first-child').attr('data-modelid')
            W('.wish-form .ipt-text').val(init_price);
            wWish.query('[name="model_id"]').val(init_model_id);
        });

        //许愿
        wWish.on('submit', function(e){
            e.preventDefault();
            var F = this;
            var wAmount = W(F).query('[name="amount"]');

            // 金额输入框强制失去焦点，避免输入金额回车后浏览器自带联想内容下拉层不消失
            wAmount.blur();

            if(wAmount && wAmount.length){
                if( !(/^\d+\.?\d*$/).test(wAmount.val()) ){
                    wAmount.shine4Error().focus();
                    return false;
                }
            }
            if(wAmount.val()<50){
                var str_wrap = '<div class="wish-qrcode-wrap" id="WishQrcodeWrap">'
                    +'<div class="row tcenter"><div class="tip mt50">亲，这个价格，<br/>臣妾真的做不到啊！</div></div>'
                    +'<div class="row tcenter"><a href="#" class="wish-again">重新许愿</a></div>'
                    +'</div>';
                var rect = wWish.ancestorNode(selector_container).getRect();
                var wStr_wrap = W(str_wrap);
                wStr_wrap.css({
                    'position': 'absolute',
                    'top': +rect['top'],
                    'left': rect['left'],
                    'width': rect['width'],
                    'height': +rect['height'],
                    'z-index' : 10
                });

                wStr_wrap.appendTo(W('body'));
                wStr_wrap.query('.wish-again').on('click', function(e){
                    e.preventDefault();

                    W(this).un();
                    wStr_wrap.removeNode();
                });
                setTimeout(function(){
                    if(wStr_wrap && wStr_wrap.length){
                        wStr_wrap.query('.wish-again').un();
                        wStr_wrap.removeNode();
                    }
                }, 10000);

                return ;
            }

            W(F).attr('action', '/aj_lp/sub_xinyuan');
            // 设置最新的postkey
            W('[name="xy_postkey"]').val(getXYPostkey());
            QW.Ajax.post(F, function(rs){
                rs = QW.JSON.parse(rs);
                if(rs.errno){
                    alert(rs.errmsg+'，请刷新页面重试');
                }else{
                    setXYPostkey(rs.result.xy_postkey);
                    var str_wrap = '<div class="wish-qrcode-wrap" id="WishQrcodeWrap">'
                        +'<div class="row tcenter"><img src="'+rs.result.qrcode+'" alt=""/><div class="tip">扫码，同步至微信</div></div>'
                        +'<div class="row tcenter">心仪手机一旦出现，我们第一时间通知您</div>'
                        +'</div>';
                    var rect = wWish.ancestorNode(selector_container).getRect();
                    var wStr_wrap = W(str_wrap);
                    wStr_wrap.css({
                        'position': 'absolute',
                        'top': +rect['top'],
                        'left': rect['left'],
                        'width': rect['width'],
                        'height': +rect['height'],
                        'z-index' : 10
                    });

                    wStr_wrap.appendTo(W('body'));
                    setTimeout(function(){
                        if(wStr_wrap && wStr_wrap.length){
                            wStr_wrap.removeNode();
                        }
                    }, 60000);
                    //alert("许愿成功。如果有合适您的手机，我们会及时联系您");
                    //F.reset();
                }
            });
        });
        // 选择心仪的手机型号
        var wItem = wWish.query('.item');

        tcb.bindEvent(wWish,{
            '.item' : function (e) {
                var wMe = W(this);
                // 其他机型
                if(wMe.hasClass('item-other')){
                    // 进入选择机型第一步
                    selectModel(0);
                } else {
                    wMe.addClass('item-cur').siblings('.item-cur').removeClass('item-cur');
                    var model_id = wMe.attr('data-modelid');
                    // 设置选择的型号
                    wWish.query('[name="model_id"]').val(model_id);
                    wWish.query('[name="amount"]').val(wMe.attr('data-wprice'));
                }
            }
        })
        // 设置心仪手机选项文本不能被选择
        tcb.setUnselect(wItem);

        // 选择其他型号
        function selectModel(step, pid){
            step = +step || 0;
            pid = +pid || 0;
            var List = window.WishModelSelectList;
            if( !(List && List.length) ){
                return ;
            }

            var Sub_List = List[step];

            var wWrap = W('#WishModelSelectWrap');
            if( !(wWrap&&wWrap.length) ){
                wWrap = W('<ul id="WishModelSelectWrap" class="wish-model-select-wrap"></ul>');
                wWrap.appendTo(W('body'));
            }
            //wWrap.html('loading');
            var str = '', item, i, len;
            if(step==0){
                str += '<li class="tit">请选择品牌：</li>';
                for(i= 0, len=Sub_List.length; i<len; i++){
                    item = Sub_List[i];
                    str += '<li data-id="'+item['brand_id']+'" data-step="'+step+'">'+item['brand_name']+'</li>';
                }
            } else {
                str += '<li class="tit">请选择型号：</li>';
                Sub_List = Sub_List[pid];
                for(i= 0, len=Sub_List.length; i<len; i++){
                    item = Sub_List[i];
                    str += '<li data-id="'+item['model_id']+'" data-step="'+step+'">'+item['model_name']+'</li>';
                }
            }

            setTimeout(function(){
                var rect = wWish.ancestorNode(selector_container).getRect();
                wWrap.query('li').un();
                wWrap.html(str).css({
                    'position': 'absolute',
                    'top': +rect['top'],
                    'left': rect['left'],
                    'width': rect['width'],
                    'height': +rect['height'],
                    'z-index' : 10
                });
                wWrap.query('li').on('click', function(e){
                    e.preventDefault();

                    var wMe = W(this),
                        step = +wMe.attr('data-step')+1,
                        pid = +wMe.attr('data-id');
                    if(wMe.hasClass('tit')){
                        return ;
                    }
                    // 选择型号最后一步
                    if(step-List.length>-1){
                        wWish.query('[name="amount"]').val('');
                        wWish.query('[name="model_id"]').val(pid);
                        wWish.query('.item-other').html(wMe.html()).addClass('item-cur').siblings('.item-cur').removeClass('item-cur');
                        wWrap.query('li').un();
                        wWrap.removeNode();
                    } else {
                        selectModel(step, pid);
                    }
                });
            }, 0);
        }

        W(document.body).on('mousedown', function(e){
            var target = e.target,
                wTarget = W(target);
            if( !(wTarget.attr('id')=='WishModelSelectWrap' || wTarget.ancestorNode('#WishModelSelectWrap').length) ){
                W('#WishModelSelectWrap li').un();
                W('#WishModelSelectWrap').removeNode();
            }
        });
    }
    tcb.lpWishFormSubmit = tcb.lpWishFormSubmit || lpWishFormSubmit;

}());


;/**import from `/resource/js/page/liangpin.js` **/
Dom.ready(function(){

    var CancelPanel = null;

    tcb.bindEvent(document.body, {
        // 商品item
        '.search-result .prd-item, .model-relation .prd-item': {
            'mouseenter': function(e){
                W(this).addClass('prd-item-hover');
            },
            'mouseleave': function(e){
                W(this).removeClass('prd-item-hover');
            }
        },
        // 商品许愿
        '.search-result .prd-item .prd-wish': function(e){
            e.preventDefault();
            var wMe = W(this),
                wItem = wMe.ancestorNode('.prd-item');

            var req_url = '/aj_lp/sub_xinyuan',
                params = {
                    'amount': wItem.attr('data-amount'),
                    'model_id': wItem.attr('data-mid'),
                    'xy_postkey': getXYPostkey()
                };

            QW.Ajax.post(req_url, params, function(rs){
                rs = QW.JSON.parse(rs);
                if(rs.errno){
                    alert(rs.errmsg+'，请刷新页面重试');
                }else{
                    setXYPostkey(rs.result.xy_postkey);
                    var str_wrap = '<div class="wish-qrcode-wrap">'
                        +'<div class="row tcenter"><img src="'+rs.result.qrcode+'" alt=""/><div class="tip">扫码，同步至微信</div></div>'
                        +'<div class="row tcenter">心仪手机一旦出现，我们第一时间通知您</div>'
                        +'</div>';
                    var rect = wItem.getRect();
                    var wStr_wrap = W(str_wrap);
                    wStr_wrap.css({
                        'position': 'absolute',
                        'top': 0,
                        'right': 0,
                        'left': 0,
                        'bottom': 0
                    });

                    wStr_wrap.appendTo(wItem);
                    setTimeout(function(){
                        if(wStr_wrap && wStr_wrap.length){
                            wStr_wrap.removeNode();
                        }
                    }, 60000);
                }
            });

        },

        // 取消订单
        '.cancel-order': function(e){
            e.preventDefault();

            var wMe = W(this);
            var re_type = wMe.attr('data-type');
            if( re_type == 3 ){
                // 退货
                var tmpl_fn = W('#LiangpinCancelOrderReturnPanelTpl').html().trim().tmpl(),
                    tmpl_st = tmpl_fn({
                        'cancel_tip': wMe.attr('data-tip'),
                        'cancel_type': wMe.attr('data-type'),
                        'orderid': wMe.attr('data-orderid')
                    });
            }else{
                var tmpl_fn = W('#LiangpinCancelOrderPanelTpl').html().trim().tmpl(),
                    tmpl_st = tmpl_fn({
                        'cancel_tip': wMe.attr('data-tip'),
                        'cancel_type': wMe.attr('data-type'),
                        'orderid': wMe.attr('data-orderid')
                    });
            }



            CancelPanel = tcb.panel('', tmpl_st, {'className': 'liangpin-cancel-order-panel-wrap'});
        },
        // 确认[取消订单/申请退款/申请退货]
        '.liangpin-cancel-order-panel .btn-confirm': function(e){
            e.preventDefault();

            var wMe = $(this);
            var wMe_wrap = wMe.closest('.liangpin-cancel-order-panel')

            var url_obj = {
                '1': '/liangpin_my/aj_close_order', // 取消订单
                '2': '/liangpin_my/applyrefund', // 申请退款
                '3': '/liangpin_my/doAfterSales' // 申请退货
            };
            var url = url_obj[wMe.attr('data-type')],
                order_id = wMe.attr('data-orderid');
            if (!url) {
                alert('非法操作！');
            }
            var request_data = {'order_id':order_id}
            if(wMe.attr('data-type') == '3'){
                request_data['user_apply_handle'] = wMe_wrap.find('[name="user_apply_handle"]').val()
                request_data['user_apply_reason'] = wMe_wrap.find('[name="user_apply_reason"]').val()
                request_data['user_apply_memo'] = wMe_wrap.find('[name="user_apply_memo"]').val()
            }
            $.getJSON(url,request_data, function(res){
                if(CancelPanel && CancelPanel.hide){
                    CancelPanel.hide();
                }
                if (wMe.attr('data-type') == '3') {
                    if (res.errno!=0) {
                        alert('抱歉，申请失败。')
                    } else {
                        alert('申请成功。')
                    }
                    window.location.reload();
                    return;
                }
                var query = tcb.queryUrl(window.location.href);
                window.location.href = tcb.setUrl('/liangpin_my/order_detail?order_id='+order_id, '"from":"'+(query['from']?query['from']:'')+'"');
                //window.location.reload();
            });
        },
        //售后表单中改变原因组
        '[name="user_apply_handle"]': {
            'change': function () {
                var group_id = $(this).val()
                $('[name="user_apply_reason"] option').each(function (index,item) {
                    var sig_group_id = $(item).attr('data-reason_group')
                    if(sig_group_id == group_id){
                        $(item).addClass('show').removeClass('hide')
                    }else{
                        $(item).removeClass('show').addClass('hide')
                    }
                })
                $('[name="user_apply_reason"] option.show').eq(0).prop('selected',true)
            }
        },
        // 不取消
        '.liangpin-cancel-order-panel .btn-cancel': function(e){
            e.preventDefault();

            if(CancelPanel && CancelPanel.hide){
                CancelPanel.hide();
            }
        }
    });

    // 优品许愿
    tcb.lpWishFormSubmit(W('.block-wish .wish-form'))

	//订单详情页内支付
	W('#payOrderOnline').on('click', function(){
        var wMe = W(this);

        if (wMe.hasClass('btn-disabled')){
            return ;
        }
        var orderid = W(this).attr('data-orderid'),
            //bankcode = W(this).attr('data-bankcode'),
            //url = '/youpin/subpay?order_id=' + orderid;
			url = "/youpin/cashier?order_id=" + orderid;

        //如果是微信支付，不跳转
		/*
        if(bankcode == 'WXPAY_JS'){
            var qrCodeSrc = '/youpin/qrcode/?order_id=' + orderid + '&weixin_pay=1';
            tcb.alert("微信支付",'<div style="padding:10px;"><h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2><div style="text-align:center"><img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="'+qrCodeSrc+'"></div></div>', {
                width:300,
                height:350
            }, function(){
                window.location.reload();
                return true;
            });

            return;
        }

        if(bankcode){
            url += '&bank_code='+bankcode;
        }
		*/
		window.open(url);
		tcb.panel('订单支付', '<div style="padding:20px;font-size:14px; text-align:center">请在新窗口中完成支付。</div>', {
			width: 300,
			height: 150,
			btn: [{
                txt: "支付成功",
                fn: function(){window.location.reload();},
                cls: "ok"
            }, {
                txt: "支付遇到问题",
                fn: function(){window.location.reload();}
            }]
		});
	});

	//买家确认收货
	W('#confirmDeal').on('submit', function(e){
		e.preventDefault();

		if( confirm('您要确认收货吗？确认后将自动打款给商家。') ){
			QW.Ajax.post( '/liangpin_my/buyerconfirm', this, function(rs){
				rs = QW.JSON.parse(rs);
				if(rs.errno){
					alert('抱歉，确认收货失败。' + rs.errmsg);
				}else{
					window.location.reload();
				}
			} );
		}
	});

});


;/**import from `/resource/js/page/liangpin/productfiltersort.js` **/
/**
 * 首页--商品的筛选和排序
 */
(function(){
    var wIndexPage = W('.page-liangpin-index');
    if ( !(wIndexPage && wIndexPage.length) ){
        return;
    }

    var __nofilter = window.__nofilter || false;
    var __nosort = window.__nosort || false;
    var __pager = window.__pager || false;
    // 当前条件下处理好的属性数据
    var AttrList = [];
    // 商品缓存
    var CacheProduct = {
        "pn": 0, // 当前页码
        "max_pn": 0, // 最大页码
        "loading": false // 是否正在加载商品
    };
    // 默认的排序参数格式（以及最多可能参数个数）：[['sort', '排序规则']]
    var DefaultParamsSort = [['sort', '']];
    // 默认的筛选参数格式（以及最多可能参数个数）：[['keyword',''], ['pn','0'], ['brand_id',''], ['model_id',''], ['price',''], ['attr[]','容量'], ['attr[]','网络'], ['attr[]','颜色']]
    var DefaultParams = [['keyword',''], ['pn','0'], ['brand_id',''], ['model_id',''], ['chengse',''], ['price',''], ['attr[]',''], ['attr[]',''], ['attr[]',''], ['attr[]',''], ['attr[]',''], ['attr[]',''], ['attr[]',''], ['attr[]','']];
    var DefaultParamsSplitLength = 2;

    /**
     * 获取当前的排序参数
     * @returns {*[]|Array}
     */
    function getSort(){
        return DefaultParamsSort || [];
    }
    /**
     * 设置指定key或者位置的排序规则
     * @param key
     * @param val
     */
    function setSort(key, val){
        var params = DefaultParamsSort || [];

        if(typeof key === 'number'){ // 数字索引，直接定位位置
            if(params[key]){
                params[key][1] = val;
            }
        } else {
            params.forEach(function(el){
                if(el[0] == key){
                    el[1] = val;
                }
            });
        }
    }
    /**
     * 判断是否正在加载商品列表
     * @returns {*}
     */
    function isLoading(){
        return CacheProduct['loading'];
    }
    /**
     * 设置加载状态
     * @param status
     */
    function setLoadingStatus(status){
        CacheProduct['loading'] = status ? true : false;
    }
    /**
     * 获取总页码数
     * @returns {*}
     */
    function getMaxPageNum(){
        return CacheProduct['max_pn'];
    }
    /**
     * 设置最大的页码
     * @param product_total
     */
    function setMaxPageNum(product_total, flag_pn){
        product_total = parseInt(product_total, 10) || 0;
        if(flag_pn){
            CacheProduct['max_pn'] = product_total;
        } else {
            CacheProduct['max_pn'] =  product_total ? Math.ceil(product_total/12) : 0;
        }
    }
    /**
     * 获取当前页码
     * @returns {number}
     */
    function getPageNum(){
        return CacheProduct.pn || 0;
    }
    /**
     * 设置当前页码
     * @param num
     */
    function setPageNum(num){
        CacheProduct.pn = num || 0;

        setRequestParams(null, num, 'pn');
    }
    /**
     * 重置当前页码为0
     */
    function resetPageNum(){
        setPageNum(0);
    }
    /**
     * 获取AttrList
     * @returns {*|Array}
     */
    function getAttrList(){
        return AttrList||[];
    }
    /**
     * 获取请求参数
     * @param pos
     * @returns {*[]|Array} pos参数未传时，返回所有参数，pos为字符串时，返回对应key的val，pos为数字的时候返回对应的key的val，没有获取到值返回null
     */
    function getRequestParams(pos){
        var ret = DefaultParams || [];
        if(typeof pos !== 'undefined'){
            if(typeof pos === 'string'){
                var flag_none = true;
                ret.forEach(function(el){
                    if(el[0]===pos){
                        flag_none = false;
                        ret = el[1];
                    }
                });
                if(flag_none){
                    ret = null;
                }
            } else {
                ret = ret[pos] || null;
            }
        }

        // 额外设置page
        var page = tcb.queryUrl(window.location.search, 'page');
        if(page){
            setRequestParams(null, page, 'page')
        }

        return ret;
    }
    /**
     * 设置请求参数
     * @param pos   当pos为null的时候，只能用key来设置val
     * @param val
     * @returns {*[]}
     */
    function setRequestParams(pos, val, key){
        var params = DefaultParams;

        if(pos===null && key){
            var flag_add = true;
            params.forEach(function(el){
                if(el[0]==key){
                    flag_add = false;
                    el[1] = val.toString();
                }
            });
            if(flag_add){
                params.push([key, val.toString()]);
            }
        } else{
            if(!(params[pos] instanceof Array)){
                params[pos] = [];
            }
            if(params[pos].length<2){
                return false;
            }
            if(key){
                params[pos][0] = key;
            }
            params[pos][1] = val.toString();
        }

        return params;
    }
    /**
     * 删除请求参数
     * 没有设置key和val，将清除所有参数；
     * 设置了key没有设置val，直接清除等于key的参数值；
     * 设置了key和val，那么清除等于key以及val的参数值；
     * @param key
     * @param val
     */
    function delRequestParams(key, val){
        var params = DefaultParams;

        if(!arguments.length){
            params.forEach(function(el){
                el[1] = '';
            });
        }
        if(typeof key === 'number'){ // 数字索引，直接定位位置
            if(params[key]){
                params[key][1] = '';
            }
        } else {
            params.forEach(function(el){
                if(el[0] == key){
                    if(arguments.length>1){
                        if(el[1]==val){
                            el[1] = '';
                        }
                    } else {
                        el[1] = '';
                    }
                }
            });
        }
    }
    /**
     * 设置筛选器的html模板
     * @param filter_datas
     * @param $wrap
     */
    function setProductFilterHtml(filter_datas, $wrap){

        //return false;
        // 筛选方式改变，之前的模式不能使用
        $wrap = $wrap || W('.search-filter');
        var tmpl_fn  = W('#LiangpinSearchFilterTpl').html().trim().tmpl(),
            tmpl_str = tmpl_fn(filter_datas);

        $wrap.html(tmpl_str);
    }
    /**
     * 设置排序的html模板
     * @param sort_datas
     * @param $wrap
     */
    function setProductSortHtml(sort_datas, $wrap){
        $wrap = $wrap || W('.js-search-sort');
        var tmpl_fn  = W('#LiangpinSearchSortTpl').html().trim().tmpl(),
            tmpl_str = tmpl_fn(sort_datas);

        $wrap.html(tmpl_str);
    }
    /**
     * 根据当前参数获取商品列表
     * @param params // params格式:[['keyword',''], ['pn','0'], ['brand_id','品牌id'], ['model_id','型号id'], ['price','价格'], ['attr[]','容量'], ['attr[]','颜色']]
     */
    function getProductList(){
        var
            params = getRequestParams(),
            params_sort = getSort(),
            params_key = params.concat(params_sort).toString()
        //console.log(params_key)

        var params_obj = {};
        params.concat(params_sort).forEach(function(item, i){
            var key = item[0],
                val = item[1];
            if(val){
                val = encodeURIComponent(val);
                if(params_obj[key]){
                    if(!(params_obj[key] instanceof Array)){
                        params_obj[key] = [params_obj[key]];
                    }
                    if(params_obj[key].indexOf(val)==-1){
                        params_obj[key].push(val);
                    }
                } else {
                    params_obj[key] = val;
                }
            }
        });

        //var hash_str = QW.ObjectH.encodeURIJson(params_obj);
        //window.location.hash = hash_str;

        setLoadingStatus(true);

        var Product = CacheProduct[params_key];
        if(Product){
            if(Product['filter'] && !Product['pn'] && !__nofilter){
                setProductFilterHtml(Product['filter']);
            }

            if(Product['sort'] && !Product['pn'] && !__nosort){
                setProductSortHtml(Product['sort']);
            }

            renderProductListHtml(Product['product'], W('.search-result'), Product['pn']);

            if (!(Product['count']>0)) {
                // 优品许愿
                tcb.lpWishFormSubmit(W('.block-wish .wish-form'))
                //wishFormSubmit(W('.search-result .wish-form'));
            }

            setMaxPageNum(Product['count']);
            setPageNum(Product['pn']+1);

            productPager(Product['count'], Product['pn'], 12);

            setLoadingStatus(false);
        } else {
            QW.Ajax.get('/youpin/aj_get_goods', params_obj, function(res){
                //try{
                res = JSON.parse(res);

                if(!res['errno']) {
                    var result = res['result'];

                    var pn = 0;
                    if(params_obj['pn'] && parseInt(params_obj['pn'], 10)>0){
                        pn = parseInt(params_obj['pn'], 10);
                    }

                    var filter_datas = null;
                    var sort_datas = null;
                    // 页码pn为0的时候才刷新过滤选择
                    if(!pn && !__nofilter){
                        var
                            orig_attr_list = genAttrList ({
                                'attr_list'        : result[ 'attr_list' ] || [],
                                'brand_list'       : result[ 'brand_list' ] || [],
                                'search_model_ids' : result[ 'search_model_ids' ] || [],
                                'chengse_list'     : result[ 'chengse_list' ] || [],
                                'price_list'       : result[ 'price_list' ] || []
                            }, DefaultParamsSplitLength)

                        var // 被选中的属性
                            selected_attr_list = [],
                            attr_list = []
                        // 遍历请求参数列表
                        params.forEach(function(item, i){
                            var key = item[0],
                                val = item[1];
                            // 关键词
                            if(key==='keyword' && val){
                                selected_attr_list.push({
                                    'pos': i,
                                    'val': val,
                                    'key': key,
                                    'attr': '关键词',
                                    'txt': val
                                })
                            }
                            var
                                pos = i-DefaultParamsSplitLength
                            if(pos>-1 && orig_attr_list[pos]){
                                var filter_item;
                                if(val && (filter_item = orig_attr_list[pos]['list'].filter(function(el){return el['attr_val_id']==val;})[0]) && filter_item['attr_val_name']){
                                    selected_attr_list.push({
                                        'pos': i,
                                        'val': val,
                                        'key': key,
                                        'attr': orig_attr_list[pos]['attr_name'],
                                        'txt': filter_item['attr_val_name']
                                    });
                                } else {
                                    attr_list.push(orig_attr_list[pos]);
                                }
                            }
                        });

                        filter_datas = {
                            'count': result['goods_count'],
                            'selected_attr_list': selected_attr_list,
                            'attr_list': attr_list
                        };
                        //console.log(Object.stringify(filter_datas))
                        setProductFilterHtml(filter_datas);
                    }
                    // 设置排序
                    if(!pn && !__nosort){
                        sort_datas = {
                            'sort': params_obj['sort'],
                            'count': result['goods_count']
                        };
                        setProductSortHtml(sort_datas);
                    }

                    var product_datas = {
                        'good_list': result['good_list'],
                        'col': 5 //3
                    };
                    renderProductListHtml(product_datas, W('.search-result'), pn);

                    if (!(result['goods_count']>0)) {
                        // 优品许愿
                        tcb.lpWishFormSubmit(W('.block-wish .wish-form'))
                        //wishFormSubmit(W('.search-result .wish-form'));
                    }

                    CacheProduct[params_key] = {
                        'pn': pn,
                        'count': result['goods_count'],
                        'filter': filter_datas,
                        'sort': sort_datas,
                        'product': product_datas
                    };

                    setMaxPageNum(result['goods_count']);
                    setPageNum(pn+1);

                    productPager(result['goods_count'], pn, 20);
                }

                //} catch (ex){ }

                setLoadingStatus(false);
            });
        }
    }

    function renderFilterHtml(filter_datas, $wrap, pn){

    }

    /**
     * 获取组装后的产品列表html
     * @param product_datas
     * @returns {string}
     */
    function getProductListHtml(product_datas){
        var html = '';

        var tmpl_fn = W('#LiangpinProductItemTpl').html().trim().tmpl();

        html = tmpl_fn(product_datas);

        return html;
    }
    /**
     * 输出商品列表的html
     * @param product_datas
     * @param $wrap
     * @param pn
     */
    function renderProductListHtml(product_datas, $wrap, pn){
        if(typeof pn === 'undefined'){
            if(QW.ObjectH.isArrayLike($wrap)){
                pn = 0;
            } else {
                pn = parseInt($wrap);
                pn = pn ? pn : 0;
                $wrap = null;
            }
        }
        $wrap = $wrap || W('.search-result');

        var html_str = getProductListHtml(product_datas);

        if(pn){
            if(__pager){
                $wrap.html(html_str);
            } else {
                $wrap.insertAdjacentHTML('beforeend', html_str);
            }
        } else {
            $wrap.html(html_str);
        }
    }

    /**
     * 重新组装生成通用可用的AttrList
     * @param params
     * @returns {Array}
     */
    function genAttrList(params, pos){
        var attr_list = params['attr_list'],
            brand_list = params['brand_list'],
            search_model_ids = params['search_model_ids'],
            level_list = params['chengse_list'],
            price_list = params['price_list']

        pos = pos || 0;

        var
            new_attr_list = []

        // 品牌
        var
            temp_brand_list = genBrandList(brand_list, pos)
        new_attr_list.push(temp_brand_list)

        // 型号
        var
            temp_model_list = genModelList(search_model_ids, pos+1)
        new_attr_list.push(temp_model_list)

        // 成色
        var
            temp_level_list = genLevelList(level_list, pos+2)
        new_attr_list.push(temp_level_list)

        // 价格
        var
            temp_price_list = genPriceList(price_list, pos+3)
        new_attr_list.push(temp_price_list)

        attr_list.forEach(function(item, i){
            new_attr_list.push({
                'pos': pos+new_attr_list.length,
                'attr_var': 'attr[]',
                'attr_name': item['attr_name'],
                'list': item['list']
            })
        })

        AttrList = new_attr_list
        return new_attr_list
    }

    // 品牌列表
    function genBrandList(brand_list, pos){
        // 品牌
        var temp_brand_list = {
            'pos': pos,
            'attr_var': 'brand_id',
            'attr_name': '品牌',
            'list': []
        }

        if(QW.ObjectH.isArray(brand_list)){
            brand_list.forEach(function(item, i){
                temp_brand_list['list'].push({
                    'attr_val_id': item['key'],
                    'attr_val_name': item['name'],
                    'attr_val_num': item['sums']
                })
            })
        } else {
            QW.ObjectH.map(brand_list, function(v, k){
                temp_brand_list['list'].push({
                    'attr_val_id': k,
                    'attr_val_name': v['name'],
                    'attr_val_num': v['sums']
                })
            })
        }

        return temp_brand_list
    }
    // 型号列表
    function genModelList(model_list, pos){
        // 型号
        var temp_model_list = {
            'pos': pos,
            'attr_var': 'model_id',
            'attr_name': '型号',
            'list': []
        }
        model_list.forEach(function(item, i){
            temp_model_list['list'].push({
                'attr_val_id': item['model_id'],
                'attr_val_name': item['model_name']
            })
        })

        return temp_model_list
    }
    // 价格列表
    function genPriceList(price_list, pos){
        // 价格
        var temp_price_list = {
            'pos': pos,
            'attr_var': 'price',
            'attr_name': '价格',
            'list': []
        }

        if(QW.ObjectH.isArray(price_list)){
            price_list.forEach(function(item, i){
                temp_price_list['list'].push({
                    'attr_val_id': item['key'],
                    'attr_val_name': item['name']
                })
            })
        } else {
            QW.ObjectH.map(price_list, function(v, k){
                temp_price_list['list'].push({
                    'attr_val_id': k,
                    'attr_val_name': v
                })
            })
        }

        return temp_price_list
    }
    // 成色列表
    function genLevelList(level_list, pos){
        // 成色
        var temp_level_list = {
            'pos': pos,
            'attr_var': 'chengse',
            'attr_name': '成色',
            'list': []
        }

        if(QW.ObjectH.isArray(level_list)){
            level_list.forEach(function(item, i){
                temp_level_list['list'].push({
                    'attr_val_id': item['key'],
                    'attr_val_name': item['name']
                })
            })
        } else {
            QW.ObjectH.map(level_list, function(v, k){
                temp_level_list['list'].push({
                    'attr_val_id': k,
                    'attr_val_name': v
                })
            })
        }

        return temp_level_list
    }

    ///**
    // * 许愿表单
    // */
    //function wishFormSubmit2(){
    //    //许愿
    //    W('.wish-form').on('submit', function(e){
    //        e.preventDefault();
    //        var F = this;
    //        var content = W(F).query('.wish-content'),
    //            contacter = W(F).query('.wish-contacter');
    //
    //        if(content.val().trim().length == 0){
    //            content.shine4Error().focus();
    //            return false;
    //        }
    //        if(contacter.val().trim().length == 0){
    //            contacter.shine4Error().focus();
    //            return false;
    //        }
    //
    //        W(F).attr('action', '/youpin/sub_hope');
    //        QW.Ajax.post(F, function(rs){
    //            rs = QW.JSON.parse(rs);
    //            if(rs.errno){
    //                alert(rs.errmsg);
    //            }else{
    //                alert("许愿成功。如果有合适您的手机，我们会及时联系您");
    //                F.reset();
    //            }
    //        });
    //    });
    //}
    //function wishFormSubmit(wWishForm){
    //    var wWish = wWishForm||W('.wish-form');
    //    if(!wWish.length){
    //        return ;
    //    }
    //    //许愿
    //    wWish.on('submit', function(e){
    //        e.preventDefault();
    //        var F = this;
    //        var wAmount = W(F).query('[name="amount"]');
    //
    //        if(wAmount && wAmount.length){
    //            if( !(/^\d+\.?\d*$/).test(wAmount.val()) ){
    //                wAmount.shine4Error().focus();
    //                return false;
    //            }
    //        }
    //        if(wAmount.val()<50){
    //            var str_wrap = '<div class="wish-qrcode-wrap" id="WishQrcodeWrap">'
    //                +'<div class="row tcenter"><div class="tip mt50">亲，这个价格，<br/>臣妾真的做不到啊！</div></div>'
    //                +'<div class="row tcenter"><a href="#" class="wish-again">重新许愿</a></div>'
    //                +'</div>';
    //            var rect = wWish.ancestorNode('.wish-box').getRect();
    //            var wStr_wrap = W(str_wrap);
    //            wStr_wrap.css({
    //                'position': 'absolute',
    //                'top': +rect['top'],
    //                'left': rect['left'],
    //                'width': rect['width'],
    //                'height': +rect['height']+4
    //            });
    //
    //            wStr_wrap.appendTo(W('body'));
    //            wStr_wrap.query('.wish-again').on('click', function(e){
    //                e.preventDefault();
    //
    //                W(this).un();
    //                wStr_wrap.removeNode();
    //            });
    //            setTimeout(function(){
    //                if(wStr_wrap && wStr_wrap.length){
    //                    wStr_wrap.query('.wish-again').un();
    //                    wStr_wrap.removeNode();
    //                }
    //            }, 10000);
    //
    //            return ;
    //        }
    //
    //        W(F).attr('action', '/aj_lp/sub_xinyuan');
    //        // 设置最新的postkey
    //        W('[name="xy_postkey"]').val(getXYPostkey());
    //        QW.Ajax.post(F, function(rs){
    //            rs = QW.JSON.parse(rs);
    //            if(rs.errno){
    //                alert(rs.errmsg+'，请刷新页面重试');
    //            }else{
    //                setXYPostkey(rs.result.xy_postkey);
    //                var str_wrap = '<div class="wish-qrcode-wrap" id="WishQrcodeWrap">'
    //                    +'<div class="row tcenter"><img src="'+rs.result.qrcode+'" alt=""/><div class="tip">扫码，同步至微信</div></div>'
    //                    +'<div class="row tcenter">心仪手机一旦出现，我们第一时间通知您</div>'
    //                    +'</div>';
    //                var rect = wWish.ancestorNode('.wish-box').getRect();
    //                var wStr_wrap = W(str_wrap);
    //                wStr_wrap.css({
    //                    'position': 'absolute',
    //                    'top': +rect['top'],
    //                    'left': rect['left'],
    //                    'width': rect['width']
    //                });
    //
    //                wStr_wrap.appendTo(W('body'));
    //                setTimeout(function(){
    //                    if(wStr_wrap && wStr_wrap.length){
    //                        wStr_wrap.removeNode();
    //                    }
    //                }, 60000);
    //                //alert("许愿成功。如果有合适您的手机，我们会及时联系您");
    //                //F.reset();
    //            }
    //        });
    //    });
    //
    //    // 选择心仪的手机型号
    //    var wItem = wWish.query('.p-item');
    //    wItem.on('click', function(e){
    //        var wMe = W(this);
    //
    //        // 其他机型
    //        if(wMe.hasClass('p-item-other')){
    //            // 进入选择机型第一步
    //            selectModel(0);
    //        } else {
    //            wMe.addClass('p-item-cur').siblings('.p-item-cur').removeClass('p-item-cur');
    //            var model_id = wMe.attr('data-modelid');
    //            // 设置选择的型号
    //            wWish.query('[name="model_id"]').val(model_id);
    //            wWish.query('[name="amount"]').val(wMe.attr('data-wprice'));
    //        }
    //
    //    });
    //    // 设置心仪手机选项文本不能被选择
    //    tcb.setUnselect(wItem);
    //
    //    // 选择其他型号
    //    function selectModel(step, pid){
    //        step = +step || 0;
    //        pid = +pid || 0;
    //        var List = window.WishModelSelectList;
    //        if( !(List && List.length) ){
    //            return ;
    //        }
    //
    //        var Sub_List = List[step];
    //
    //        var wWrap = W('#WishModelSelectWrap');
    //        if( !(wWrap&&wWrap.length) ){
    //            wWrap = W('<ul id="WishModelSelectWrap" class="wish-model-select-wrap"></ul>');
    //            wWrap.appendTo(W('body'));
    //        }
    //        //wWrap.html('loading');
    //        var str = '', item, i, len;
    //        if(step==0){
    //            str += '<li class="tit">请选择品牌：</li>';
    //            for(i= 0, len=Sub_List.length; i<len; i++){
    //                item = Sub_List[i];
    //                str += '<li data-id="'+item['brand_id']+'" data-step="'+step+'">'+item['brand_name']+'</li>';
    //            }
    //        } else {
    //            str += '<li class="tit">请选择型号：</li>';
    //            Sub_List = Sub_List[pid];
    //            for(i= 0, len=Sub_List.length; i<len; i++){
    //                item = Sub_List[i];
    //                str += '<li data-id="'+item['model_id']+'" data-step="'+step+'">'+item['model_name']+'</li>';
    //            }
    //        }
    //
    //        setTimeout(function(){
    //            var rect = wWish.ancestorNode('.wish-box').getRect();
    //            wWrap.query('li').un();
    //            wWrap.html(str).css({
    //                'position': 'absolute',
    //                'top': +rect['top'],
    //                'left': rect['left'],
    //                'width': rect['width']
    //            });
    //            wWrap.query('li').on('click', function(e){
    //                e.preventDefault();
    //
    //                var wMe = W(this),
    //                    step = +wMe.attr('data-step')+1,
    //                    pid = +wMe.attr('data-id');
    //                if(wMe.hasClass('tit')){
    //                    return ;
    //                }
    //                // 选择型号最后一步
    //                if(step-List.length>-1){
    //                    wWish.query('[name="amount"]').val('');
    //                    wWish.query('[name="model_id"]').val(pid);
    //                    wWish.query('.p-item-other').html(wMe.html()).addClass('p-item-cur').siblings('.p-item-cur').removeClass('p-item-cur');
    //                    wWrap.query('li').un();
    //                    wWrap.removeNode();
    //                } else {
    //                    selectModel(step, pid);
    //                }
    //            });
    //        }, 0);
    //    }
    //
    //    W(document.body).on('mousedown', function(e){
    //        var target = e.target,
    //            wTarget = W(target);
    //        if( !(wTarget.attr('id')=='WishModelSelectWrap' || wTarget.ancestorNode('#WishModelSelectWrap').length) ){
    //            W('#WishModelSelectWrap li').un();
    //            W('#WishModelSelectWrap').removeNode();
    //        }
    //    });
    //}

    /**
     * 商品列表分页
     * @return {[type]} [description]
     */
    function productPager(total, pn, pagesize){
        pagesize = pagesize || 12;
        pn = pn || 0;
        var pagenum = Math.ceil(total/pagesize);

        var wPages = W('.pagination .pages');
        if(pagenum==1){
            wPages.html('');
            return;
        }
        var pager = new Pager(wPages, pagenum, pn);

        pager.on('pageChange', function(e) {
            setPageNum(e.pn);
            getProductList();

            window.scrollTo(0, W('.search-sort').getXY()[1]);
        });
    }

    //DOMReady
    Dom.ready(function(){
        /**
         * 页面初始化
         */
        function init(){
            var search_query = window.location.search.queryUrl();
            if(search_query){
                var params = getRequestParams();
                //console.log('1:'+JSON.stringify(params))

                params.forEach(function(item, i){
                    if(search_query[item[0]]){
                        setRequestParams(i, search_query[item[0]]);
                    }
                });

                //console.log('2:'+JSON.stringify(params))
            }
            // 初始化获取商品列表
            getProductList();

            // 事件绑定
            tcb.bindEvent(document.body, {
                // 搜索筛选项
                '.js-search-filter .filter-item': function(e){
                    e.preventDefault();

                    var wMe = W(this),
                        wParent = wMe.ancestorNode('.filter-choice');

                    if(wMe.hasClass('filter-curr')){
                        return;
                    }

                    var pos = parseInt(wParent.attr('data-pos'))||0,
                        params_key = wParent.attr('data-var'),
                        params_val = wMe.attr('data-value')||'';

                    //pos = 2;
                    // 设置指定位置参数值（此处用pos比key更优，因为key名称有可能重复）
                    setRequestParams(pos, params_val);
                    resetPageNum();

                    wMe.addClass('filter-curr').siblings('.filter-curr').removeClass('filter-curr');

                    // 获取商品列表
                    getProductList();
                },
                // 删除筛选项
                '.js-search-filter .del': function(e){
                    e.preventDefault();

                    var wMe = W(this),
                        wParent = wMe.ancestorNode('.selected-item');

                    var pos = parseInt(wParent.attr('data-pos'))||0, // 由于有重名属性（数组类属性），所有使用pos有时候不准确，还是需要key和val来剔除
                        params_key = wParent.attr('data-var'),
                        params_val = wParent.attr('data-value');

                    // 删除此过滤参数
                    delRequestParams(params_key, params_val);
                    resetPageNum();

                    // 获取商品列表
                    getProductList();
                },
                // 排序
                '.js-search-sort .sort-item': function(e){
                    e.preventDefault();

                    var wMe = W(this);

                    wMe.addClass('sort-curr').siblings('.sort-curr').removeClass('sort-curr');
                    wMe.attr('data-cursort', wMe.attr('data-sort'));

                    setSort('sort', wMe.attr('data-sort'));
                    resetPageNum();

                    // 获取商品列表
                    getProductList();
                }
            });
        }

        init();
    });

}());

;/**import from `/resource/js/page/liangpin/index.js` **/
// 优品首页js
Dom.ready(function(){
    var wIndexPage = W('.page-liangpin-index');
    if ( !(wIndexPage && wIndexPage.length) ){
        return;
    }

    var Bang = window.Bang = window.Bang || {};

    var wTriggerShowVideo = W('.trigger-show-video')
    if (wTriggerShowVideo && wTriggerShowVideo.length){
        wTriggerShowVideo.on('click', function(e){
            e.preventDefault()

            var html_fn = W('#JsVideoPlayerPanelTpl').html().trim().tmpl(),
                html_st = html_fn()

            tcb.panel('', html_st, {
                className: 'panel-tom01 video-player-panel'
            })
        })
    }

    // 首页顶部轮播图
    new Bang.SimpleSlider ({
        container : '.block-top-banner-slide',
        auto      : 5000,
        start     : 0,
        speed     : 300,
        nav_show  : true
    })

    var HotProductListSlide = new TuiguangSlide('.tg-small', { animTime : 500 });

    tcb.bindEvent(document.body, {
        // 轮播的热门商品
        '#HotProductList .slide-item' : {
            'click'      : function ( e ) {
                var wMe = W ( this ),
                    wTarget = W ( e.target );

                if ( !(wTarget.ancestorNode ( 'a' ).length || wTarget[ 0 ].nodeName.toLowerCase () == 'a') ) {
                    wMe.query ( '.slide-img a' ).click ();
                }
            },
            'mouseenter' : function ( e ) {
                var
                    wMe = W ( this )

                wMe.addClass('slide-item-hover')

            },
            'mouseleave' : function ( e ) {
                var
                    wMe = W ( this )

                wMe.removeClass('slide-item-hover')

            }
        },
        // 关闭
        '.liangpin-prevhead-close': function(e){
            e.preventDefault();

            // W('.liangpin-prevhead').slideUp();
            W('.liangpin-prevhead').slideUp(1000, function(){
                W(this).removeNode();
            });
        },
        // 分享微博
        '.liangpin-prevhead-shareweibo a, .liangpin-lpma-usepanel .share-weibo a': {
            'click': function(e){
                e.preventDefault();

                var url = 'http://bang.360.cn/youpin?f=weibo',
                    from_url = 'http://bang.360.cn/youpin?f=weibo',
                    title_text = '360优品双十一活动火爆进行中！乔布斯留下的经典限量抢购ing！iphone4只要598元！来晚就木有了！小伙伴快来抢吧！→→（'+url+'）关注 @360手机回收 ，还能获得更多机会！',
                    open_url = 'http://service.weibo.com/share/share.php?url='+encodeURIComponent(from_url)+'&type=button&ralateUid=3519606963&language=zh_cn&appkey=766e9&title='+encodeURIComponent(title_text)+'&pic='+encodeURIComponent('https://p.ssl.qhimg.com/t012d06dc09478f2449.png')+'&searchPic=false&style=simple';

                var width = 650,
                    height = 570,
                    left = (window.screen.width-width)/2,
                    top  = (window.screen.height-height)/2;
                window.open(open_url, '_blank');//, 'left='+left+',top='+top+',width='+width+',height='+height
            },
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.ancestorNode('.liangpin-prevhead-shareweibo').addClass('liangpin-prevhead-shareweibo-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.ancestorNode('.liangpin-prevhead-shareweibo').removeClass('liangpin-prevhead-shareweibo-hover');
            }
        },
        // 分享微信
        '.liangpin-prevhead-shareweixin a, .liangpin-lpma-usepanel .share-weixin a': {
            'click': function(e){
                e.preventDefault();
            },
            'mouseenter': function(e){
                var wMe = W(this),
                    rect = wMe.getRect();

                var wWXCode = W('#LPmaWXCode');
                if (!wWXCode.length) {
                    W('body').insertAdjacentHTML('beforeend', '<div class="lpma-wxcode" id="LPmaWXCode"></div>');
                    wWXCode = W('#LPmaWXCode');
                }
                wWXCode.css({
                    'display': 'block',
                    'left': rect['left']+rect['width'],
                    'top': rect['top']
                });
                wMe.ancestorNode('.liangpin-prevhead-shareweixin').addClass('liangpin-prevhead-shareweixin-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                var wWXCode = W('#LPmaWXCode');
                if (wWXCode.length) {
                    wWXCode.hide();
                }

                wMe.ancestorNode('.liangpin-prevhead-shareweixin').removeClass('liangpin-prevhead-shareweixin-hover');
            }
        },
        // 使用LP码优惠购~
        '.liangpin-prevhead-useLP a': {
            'click': function(e){
                e.preventDefault();

                var tmpl_fn  = W('#LPmaUsepanelTpl').html().trim().tmpl(),
                    tmpl_str = tmpl_fn();

                var config = {
                    width:770,
                    height:280,
                    withMask: true
                };

                tcb.panel('', tmpl_str, config);

                bindLPmaUseForm();
            },
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.ancestorNode('.liangpin-prevhead-useLP').addClass('liangpin-prevhead-useLP-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.ancestorNode('.liangpin-prevhead-useLP').removeClass('liangpin-prevhead-useLP-hover');
            }
        },
        // 显示隐藏包装清单
        '.show-baozhuangqingdan-btn': function(e){
            e.preventDefault();

            var wMe = W(this);

            // 收起
            if (wMe.hasClass('hide-baozhuangqingdan-btn')) {
                wMe.removeClass('hide-baozhuangqingdan-btn');

                // window.scrollTo(0, W('.liangpin-prevhead').getXY()[1]);

                wMe.siblings('.show-baozhuangqingdan').slideUp();
            }
            // 展开
            else {
                wMe.addClass('hide-baozhuangqingdan-btn');

                // window.scrollTo(0, wMe.getXY()[1]);

                wMe.siblings('.show-baozhuangqingdan').slideDown();
            }
        }
    });
    // 绑定优品码使用表单
    function bindLPmaUseForm(){
        var wForm = W('#LiangPinLPmaUseForm');
        if (wForm.length) {
            wForm.on('submit', function(e){
                e.preventDefault();

                if (isFormDisabled(wForm)) {
                    return ;
                }
                if (!validLPmaUseForm(wForm)) {
                    return false;
                }

                setFormDisabled(wForm);

                setTimeout(function(){
                    QW.Ajax.get('/youpin/aj_ch_youhui', wForm[0], function(res){
                        try{
                            res = JSON.parse(res);

                            if (!res['errno']) {
                                window.location.href = tcb.setUrl('/youpin/tinfo?product_id='+res['result']+'&num=1&youhui_code='+wForm.query('[name="youhui_code"]').val().trim(), {"from": tcb.queryUrl(location.href,'from')});
                            } else {
                                alert('当前LP码不可用。'+res['errmsg']);
                            }

                        } catch(ex){}

                        releaseFormDisabled(wForm);
                    });
                }, 200);

            });
        }
    }
    // 表单是否可用
    function isFormDisabled(wForm){
        var flag = true;
        if (wForm && wForm.length && !wForm.hasClass('form-disabled')) {
            flag = false;
        }
        return flag;
    }
    // 设置表单为不可用
    function setFormDisabled(wForm){
        if (wForm && wForm.length) {
            wForm.addClass('form-disabled');
        }
    }
    // 释放不可用状态，设置为可用
    function releaseFormDisabled(wForm){
        if (wForm && wForm.length) {
            wForm.removeClass('form-disabled');
        }
    }
    // 验证优品码使用表单
    function validLPmaUseForm(wForm){
        flag = true;

        if (!(wForm&&wForm.length)) {
            return ;
        }

        var wCode = wForm.query('[name="youhui_code"]');
        if (wCode&&wCode.length) {
            var code = wCode.val().trim();
            if (!code) {
                flag = false;
                wCode.shine4Error().focus();
                wCode.siblings('.err').css({
                    'visibility': 'visible'
                });
            }
        }

        if (flag) {
            wCode.siblings('.err').css({
                'visibility': 'hidden'
            });
        }
        return flag;
    }

    //============== 推荐商品 ==============
    // 输出商品
    function renderHotProductList(){

        var wListInner = W('#HotProductList');
        if(wListInner && wListInner.length){

            getData4HotProductList(function(result){

                var list_arr;
                var curtime = result['time'],
                    flash_list   = result['flash_list'],   // 闪购
                    jingpin_list = result['jingpin_list']; // 精品

                if ( !(flash_list && jingpin_list && flash_list.length + jingpin_list.length>4) ){
                    // 限时抢 和 精品商品总数不大于4个，那么左右滑动按钮不可点

                    var
                        $Wrap = wListInner.ancestorNode('.tg-small')
                    $Wrap.query('.slide-go-left').addClass('disabled')
                    $Wrap.query('.slide-go-right').addClass('disabled')
                }

                // 闪购
                if(flash_list && flash_list.length) {
                    _forHotFlash(flash_list, curtime, wListInner);
                    if(flash_list.length<5 && jingpin_list && jingpin_list.length){
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

        HotProductListSlide.resetBoxSize();

    }
    // 限时抢
    function _forHotFlash(flash_list, curtime, wListInner){
        var list_arr = flash_list;
        //list_arr[0]['flash_saling']=1;
        //list_arr[0]['flash_status']='saling';

        //for(var i= 0;i<20;i++){
        //    list_arr.push(list_arr[0]);
        //}
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
            //curproduct['flash_saling'] = 1;
            //curproduct['flash_status'] = 'saling';

            //alert('flash_saling:'+curproduct['flash_saling']);
            //alert('flash_status:'+curproduct['flash_status']);
            //alert('curtime:'+curtime);
            //alert('starttime:'+starttime);
            //alert('endtime:'+endtime);
            // 开始前倒计时
            if (!curproduct['flash_saling'] && curtime<starttime) {
                //Bang.countdown_desc = '距开始';
                wEl.addClass('countdown-start-prev')
                    .attr('data-descbefore', '距开始')

                Bang.startCountdown(starttime, curtime, wEl, {
                    'end': function(){
                        wEl.ancestorNode('.slide-item').query('.p-buy-disabled').removeClass('p-buy-disabled').html('立即抢购');

                        //Bang.countdown_desc = '距结束';
                        wEl.removeClass('countdown-start-prev')
                            //.attr('data-descbefore', '距结束')
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

                //Bang.countdown_desc = '距结束';
                wEl.removeClass('countdown-start-prev')
                    //.attr('data-descbefore', '距结束')
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

        });
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
        });
    }
    renderHotProductList();

    // 输出热销机型
    window.Bang.renderProductList({
        $target : W ('.recommend-model-cont-inner'),
        $tpl : W('#JsRecommendModelProductListTpl'),
        request_url : '/youpin/getRecommendProductModel',
        request_params : {
            pn : 0,
            page_size: 5
        },
        col : 5,
        list_key       : '',
        complete: function(result, $target){
            var
                $item = $target.query ('.p-item')

            $item.on('mouseenter',function (e) {
                var wMe = W (this);

                wMe.addClass ('p-item-hover');
            })
            $item.on('mouseleave', function (e) {
                var wMe = W (this);

                wMe.removeClass ('p-item-hover');
            })

        }
    })

});

;/**import from `/resource/js/page/liangpin/comment.js` **/
Dom.ready(function(){

    function setStarStatus(val, txt){
        var wForm = W('#cmtForm'),
            wItem = wForm.query('.star-item');
        val = parseInt(val, 10) ? parseInt(val, 10) : 0;
        wItem.removeClass('star-sel');
        wItem.filter(function(el, i){
            return i<val;
        }).addClass('star-sel');
        var txt = val>0 ? txt : '';
        wForm.query('.star-txt').html(txt);

        wForm.query('.level').val(val);
    }
    function clearStarStatus(){
        var wForm = W('#cmtForm'),
            wItem = wForm.query('.star-item');
        wItem.removeClass('star-sel');
        wForm.query('.star-txt').html('');
        wForm.query('.level').val('');
    }

    tcb.bindEvent(document.body, {
        // 订单评论选星
        '#cmtForm .star-item': {
            'click': function(e){
                var wMe = W(this),
                    val = wMe.attr('data-value'),
                    txt = wMe.attr('title');

                wMe.ancestorNode('.star-box').attr('data-value', val).attr('data-title', txt);
                setStarStatus(val, txt);
            },
            'mouseenter': function(e){
                var wMe = W(this),
                    val = wMe.attr('data-value'),
                    txt = wMe.attr('title');

                setStarStatus(val, txt);
            },
            'mouseleave': function(e){
                var wMe = W(this),
                    wBox = wMe.ancestorNode('.star-box')
                val = wBox.attr('data-value'),
                    txt = wBox.attr('data-title');

                if (val&&txt) {
                    setStarStatus(val, txt)
                } else {
                    clearStarStatus();
                }
            }
        }
    });


    //选择默认好评语句、限制评论字数
    tcb.bindEvent(document.body, {
        '.comment-label span':{
            'click':function(e){
                var el = W(this);
                var cmt_content = W('.cmt-content').val();
                if(cmt_content.indexOf(el.html())!=-1){
                    return;
                }

                cmt_content+=el.html()+' ';

                W('.cmt-content').val(cmt_content);

                W('.cmt-content').change();
            }
        },
        '.cmt-content':{
            'keyup':function(e){
                var $me = W(this);
                if($me.val().length>140){
                    alert('请输入140字以内！');
                    $me.val($me.val().substring(0,140));
                }
                if($me.val()){
                    W('#cmtForm .pic-tips').hide();
                }
            },
            'change':function(e){
                var $me = W(this);
                if($me.val().length>140){
                    alert('请输入140字以内！');
                    $me.val($me.val().substring(0,140));
                }
                if($me.val()){
                    W('#cmtForm .pic-tips').hide();
                }
            }
        }
    });


    /*提交评价*/
    W('#cmtForm').on('submit', function(e){
        e.preventDefault();
        if( W(this).query('.star-sel').length == 0 ){
            W(this).one('.star-box').shine4Error();
            return;
        }
        if( W(this).one('.cmt-content').val().trim()=='' ){
            W(this).one('.cmt-content').shine4Error().focus();
            W(this).query('.pic-tips').show();
            return;
        }

        QW.Ajax.post('/liangpin_my/aj_pingjia/', this, function(rs){
            rs = QW.JSON.parse(rs);
            if(rs.errno){
                alert('抱歉，评论失败。'+rs.errmsg);
            }else{
                window.location.reload();
            }
        });
    });

    /*晒图*/
    function initUploadPic() {
        if( typeof SWFUpload=='undefined' ){
            return;
        }
        var wCurImgItem = null;
        // 回调函数
        var upHandler = {
            // 上传文件加入队列
            fileQueued: function(file){},
            // 上传队列错误
            fileQueueError: function(file, errorCode, message){
                try {
                    switch (errorCode) {
                        case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                            alert("一次只能上传" + (message > 1 ? message : 1) + "个文件");
                            this.debug("一次只能上传" + (message > 1 ? message : 1) + "个文件");
                            break;
                        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                            alert("文件过大!，请上传小于"+ this.settings.file_size_limit+"的文件");
                            this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                            // alert('不能上传 0 字节的文件');
                            alert('您上传的文件太小，无法上传');
                            this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                            alert('非法的文件格式');
                            this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        default:
                            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 文件选择框
            fileDialogComplete: function(numFilesSelected, numFilesQueued){
                try {
                    // console.log('fileDialogComplete');
                    // console.log(numFilesSelected, numFilesQueued);

                    if (W('.shaitu-pic').length>=5){
                        alert('最多只能上传5张');

                        var stats = this.getStats();
                        while (stats.files_queued > 0) {
                            this.cancelUpload();
                            stats = this.getStats();
                        }
                        return;
                    }
                    // 加入队列中的文件数 大于0，才执行上传操作
                    if (numFilesQueued) {
                        // 自动开始上传;
                        this.startUpload();
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 开始上传
            uploadStart: function(file){
                try {
                    // console.log('uploadStart');
                    // console.log(file);
                }
                catch (ex) {}
            },
            // 上传中~
            uploadProgress: function(file, bytesLoaded, bytesTotal){},
            // 上传异常
            uploadError: function(file, errorCode, message){
                try {
                    // console.log('uploadError');
                    // console.log(file, errorCode, message);

                    switch (errorCode) {
                        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                            this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                            this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                            this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                            this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                            this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                            this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                            this.debug("Error Code: File Cancelled, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                            this.debug("Error Code: Upload Stopped, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        default:
                            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                    }
                } catch (ex) {
                    this.debug(ex);
                }
                return ;
            },
            // 上传成功
            uploadSuccess: function(file, serverData){
                try {
                    // console.log('uploadSuccess');
                    // console.log(file, serverData);
                    //console.log(serverData);

                    serverData = QW.JSON.parse(serverData);
                    if(serverData['errno'] == 0){
                        //W('.fapiao-upload-tips').show().html('图片上传成功');
                        W('[name="img"]').val(serverData['url']);

                        W('.page-liangpin-order .shaitu-pic').removeClass('shaitu-pic-cur');
                        var str = '<div class="shaitu-pic shaitu-pic-cur fl"><img style="width: 100%;" src="'+serverData['url']+'"><input type="hidden" name="comment_img_urls[]" value="'+serverData['url']+'"></div>';
                        W('.page-liangpin-order .shaitu-box .btn-shaitu').insertSiblingBefore(str);

                        W('.page-liangpin-order .pic-num b').html(W('.shaitu-box div').length-1);

                        W('.page-liangpin-order .pic-big').show().one('img').attr('src',serverData['url']);

                        tcb.setImgElSize(W('.page-liangpin-order .shaitu-pic img'),90,90);
                        tcb.setImgElSize(W('.page-liangpin-order .pic-big img'),270,270);

                    } else{
                        W('.fapiao-upload-tips').hide();
                        W('[name="img"]').val('');
                        alert('上传失败，请重新尝试');
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 上传完成
            uploadComplete: function(file){
                // console.log('uploadComplete');
                // console.log(file);
            },
            // 队列完成
            queueComplete: function(numFilesUploaded){
                // console.log('queueComplete');
                // console.log(numFilesUploaded);
            }
        };
        // 上传配置
        var upOptions = {
            flash_url : '/resource/swf/swfupload2.5.fix.swf',
            upload_url: '/aj/uploadPic',
            file_post_name: "filedata",
            post_params: {
                'T': window.T||'',
                'Q': window.Q||''
            },
            file_size_limit : "10 MB",
            file_types : "*.jpg;*.jpeg;*.png",
            file_types_description : "Image Files",
            file_upload_limit : 1000,
            file_queue_limit : 1,
            // debug: true,
            // 上传按钮设置
            button_image_url: "http://",
            button_width: "88",
            button_height: "88",
            button_placeholder_id: "BtnShaiTuUpload",
            button_text: "",
            button_text_style: "",
            button_text_top_padding: 0,
            button_text_left_padding: 0,
            button_cursor: SWFUpload.CURSOR.HAND,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            prevent_swf_caching: false,
            // 上传回调函数
            file_queued_handler          : upHandler.fileQueued,
            file_queue_error_handler     : upHandler.fileQueueError,
            file_dialog_complete_handler : upHandler.fileDialogComplete,
            upload_start_handler         : upHandler.uploadStart,
            upload_progress_handler      : upHandler.uploadProgress,
            upload_error_handler         : upHandler.uploadError,
            upload_success_handler       : upHandler.uploadSuccess,
            upload_complete_handler      : upHandler.uploadComplete,
            queue_complete_handler       : upHandler.queueComplete // Queue plugin event
        };
        if (W('#BtnShaiTuUpload').length) {
            new SWFUpload(upOptions);//构造一个上传实例；
        }
    }
    initUploadPic();


    tcb.bindEvent(W('.page-liangpin-order') , {
        //点击切换大图
        '.shaitu-box .shaitu-pic':{
            'click':function(e){
                var wMe = W(this);
                wMe.addClass('shaitu-pic-cur').siblings('.shaitu-pic-cur').removeClass('shaitu-pic-cur');
                var url = wMe.query('img').attr('src');
                W('.page-liangpin-order .pic-big').one('img').attr('src',url);
                tcb.setImgElSize(W('.page-liangpin-order .pic-big img'),270,270);
            }
        },
        // 删除
        '.pic-big .del-box':{
            'click':function(e){
                var wMe = W(this);
                var wTarg;
                var wCur = W('.page-liangpin-order .shaitu-pic-cur');
                var wPrev = wCur.previousSibling('.shaitu-pic');
                var wNext = wCur.nextSibling('.shaitu-pic');
                var re = confirm('确定删除图片吗？');
                if(re){
                    if (wCur && wCur.length) {
                        if(wPrev&&wPrev.length){
                            wTarg = wPrev;
                        }else{
                            wTarg = wNext;
                        }
                        wCur.removeNode();
                        if ( wTarg && wTarg.length){
                            wTarg.addClass('shaitu-pic-cur');
                            var src = wTarg.query('img').attr('src');

                            wMe.siblings('img').attr('src', src);
                        }else{
                            wMe.ancestorNode('.pic-big').hide();
                        }
                        W('.page-liangpin-order .pic-num b').html(W('.page-liangpin-order .shaitu-box div').length-1);
                    }
                }
                tcb.setImgElSize(W('.page-liangpin-order .shaitu-pic img'),90,90);
                tcb.setImgElSize(W('.page-liangpin-order .pic-big img'),270,270);
            }
        }
    });

})

;/**import from `/resource/js/page/liangpin/index/user_comments.js` **/
//优品首页用户晒单
Dom.ready(function(){
    // 输出用户晒单的html
    function renderUserComments(){
        var wListInner = W('.user-comments-list-inner');
        if(wListInner && wListInner.length){
            getData4UserComments(function(list_arr){
                var html_str = W('#JsUserCommentsTpl').html().trim().tmpl()({
                    'list': list_arr
                });
                wListInner.html(html_str);

                var wListInnerItem = wListInner.query('.row');
                // 大于3条才滚滚滚
                if(wListInnerItem.length>3){
                    var rect = wListInnerItem.first().getRect();
                    (function(){
                        var arg = arguments;
                        wListInner.animate({'top': -rect['height']}, 1200, function(){
                            wListInner.firstChild('.row').appendTo(wListInner);
                            wListInner.css({'top': 0});

                            setTimeout(arg.callee, 4000);
                        });
                    }());
                }
            });

        }
    }
    // 获取用户晒单的数据
    function getData4UserComments(callback){
        var request_url = '/youpin/aj_user_tan',
            request_params = {
                'starlevel': 5,
                'limit': 20
            };
        QW.Ajax.get(request_url, request_params, function(res){
            var list_arr = [];
            res = JSON.parse(res);

            if (!res['errno']) {
                list_arr = res['result'];
            }

            typeof callback==='function' && callback(list_arr);
        });
    }
    renderUserComments();
})

;/**import from `/resource/js/page/liangpin/index/roundabout.js` **/
// 轮播图
(function($) {
	"use strict";

	var defaults, internalData, methods;

	// add default shape
	$.extend({
		roundaboutShapes: {
			def: "lazySusan",
			lazySusan: function (r, a, t) {
				return {
					x: Math.sin(r + a),
					y: (Math.sin(r + 3 * Math.PI / 2 + a) / 8) * t,
					z: (Math.cos(r + a) + 1) / 2,
					scale: (Math.sin(r + Math.PI / 2 + a) / 2) + 0.5
				};
			}
		}
	});

	defaults = {
		bearing: 0.0,
		tilt: 0.0,
		minZ: 100,
		maxZ: 280,
		minOpacity: 0.4,
		maxOpacity: 1.0,
		minScale: 0.4,
		maxScale: 1.0,
		duration: 600,
		btnNext: null,
		btnNextCallback: function() {},
		btnPrev: null,
		btnPrevCallback: function() {},
		btnToggleAutoplay: null,
		btnStartAutoplay: null,
		btnStopAutoplay: null,
		easing: "swing",
		clickToFocus: true,
		clickToFocusCallback: function() {},
		focusBearing: 0.0,
		shape: "lazySusan",
		debug: false,
		childSelector: "li",
		startingChild: null,
		reflect: false,
		floatComparisonThreshold: 0.001,
		autoplay: false,
		autoplayDuration: 1000,
		autoplayPauseOnHover: false,
		autoplayCallback: function() {},
		autoplayInitialDelay: 0,
		enableDrag: false,
		dropDuration: 600,
		dropEasing: "swing",
		dropAnimateTo: "nearest",
		dropCallback: function() {},
		dragAxis: "x",
		dragFactor: 4,
		triggerFocusEvents: true,
		triggerBlurEvents: true,
		responsive: false
	};

	internalData = {
		autoplayInterval: null,
		autoplayIsRunning: false,
		autoplayStartTimeout: null,
		animating: false,
		childInFocus: -1,
		touchMoveStartPosition: null,
		stopAnimation: false,
		lastAnimationStep: false
	};

	methods = {

		// starters
		// -----------------------------------------------------------------------

		// init
		// starts up roundabout
		init: function(options, callback, relayout) {
			var settings,
				now = (new Date()).getTime();

			options   = (typeof options === "object") ? options : {};
			callback  = ($.isFunction(callback)) ? callback : function() {};
			callback  = ($.isFunction(options)) ? options : callback;
			settings  = $.extend({}, defaults, options, internalData);

			return this
				.each(function() {
					// make options
					var self = $(this),
						childCount = self.children(settings.childSelector).length,
						period = 360.0 / childCount,
						startingChild = (settings.startingChild && settings.startingChild > (childCount - 1)) ? (childCount - 1) : settings.startingChild,
						startBearing = (settings.startingChild === null) ? settings.bearing : 360 - (startingChild * period),
						holderCSSPosition = (self.css("position") !== "static") ? self.css("position") : "relative";

					self
						.css({  // starting styles
							padding:   0,
							position:  holderCSSPosition
						})
						.addClass("roundabout-holder")
						.data(  // starting options
							"roundabout",
							$.extend(
								{},
								settings,
								{
									startingChild: startingChild,
									bearing: startBearing,
									oppositeOfFocusBearing: methods.normalize.apply(null, [settings.focusBearing - 180]),
									dragBearing: startBearing,
									period: period
								}
							)
						);

					// unbind any events that we set if we're relaying out
					if (relayout) {
						self
							.unbind(".roundabout")
							.children(settings.childSelector)
							.unbind(".roundabout");
					} else {
						// bind responsive action
						if (settings.responsive) {
							$(window).bind("resize", function() {
								methods.stopAutoplay.apply(self);
								methods.relayoutChildren.apply(self);
							});
						}
					}

					// bind click-to-focus
					if (settings.clickToFocus) {
						self
							.children(settings.childSelector)
							.each(function(i) {
								$(this)
									.bind("click.roundabout", function() {
										var degrees = methods.getPlacement.apply(self, [i]);

										if (!methods.isInFocus.apply(self, [degrees])) {
											methods.stopAnimation.apply($(this));
											if (!self.data("roundabout").animating) {
												methods.animateBearingToFocus.apply(self, [degrees, self.data("roundabout").clickToFocusCallback]);
											}
											return false;
										}
									});
							});
					}

					// bind next buttons
					if (settings.btnNext) {
						$(settings.btnNext)
							.bind("click.roundabout", function() {
								if (!self.data("roundabout").animating) {
									methods.animateToNextChild.apply(self, [self.data("roundabout").btnNextCallback]);
								}
								return false;
							});
					}

					// bind previous buttons
					if (settings.btnPrev) {
						$(settings.btnPrev)
							.bind("click.roundabout", function() {
								methods.animateToPreviousChild.apply(self, [self.data("roundabout").btnPrevCallback]);
								return false;
							});
					}

					// bind toggle autoplay buttons
					if (settings.btnToggleAutoplay) {
						$(settings.btnToggleAutoplay)
							.bind("click.roundabout", function() {
								methods.toggleAutoplay.apply(self);
								return false;
							});
					}

					// bind start autoplay buttons
					if (settings.btnStartAutoplay) {
						$(settings.btnStartAutoplay)
							.bind("click.roundabout", function() {
								methods.startAutoplay.apply(self);
								return false;
							});
					}

					// bind stop autoplay buttons
					if (settings.btnStopAutoplay) {
						$(settings.btnStopAutoplay)
							.bind("click.roundabout", function() {
								methods.stopAutoplay.apply(self);
								return false;
							});
					}

					// autoplay pause on hover
					if (settings.autoplayPauseOnHover) {
						self
							.bind("mouseenter.roundabout.autoplay", function() {
								methods.stopAutoplay.apply(self, [true]);
							})
							.bind("mouseleave.roundabout.autoplay", function() {
								methods.startAutoplay.apply(self);
							});
					}

					// drag and drop
					if (settings.enableDrag) {
						// on screen
						if (!$.isFunction(self.drag)) {
							if (settings.debug) {
								alert("You do not have the drag plugin loaded.");
							}
						} else if (!$.isFunction(self.drop)) {
							if (settings.debug) {
								alert("You do not have the drop plugin loaded.");
							}
						} else {
							self
								.drag(function(e, properties) {
									var data = self.data("roundabout"),
										delta = (data.dragAxis.toLowerCase() === "x") ? "deltaX" : "deltaY";
									methods.stopAnimation.apply(self);
									methods.setBearing.apply(self, [data.dragBearing + properties[delta] / data.dragFactor]);
								})
								.drop(function(e) {
									var data = self.data("roundabout"),
										method = methods.getAnimateToMethod(data.dropAnimateTo);
									methods.allowAnimation.apply(self);
									methods[method].apply(self, [data.dropDuration, data.dropEasing, data.dropCallback]);
									data.dragBearing = data.period * methods.getNearestChild.apply(self);
								});
						}

						// on mobile
						self
							.each(function() {
								var element = $(this).get(0),
									data = $(this).data("roundabout"),
									page = (data.dragAxis.toLowerCase() === "x") ? "pageX" : "pageY",
									method = methods.getAnimateToMethod(data.dropAnimateTo);

								// some versions of IE don't like this
								if (element.addEventListener) {
									element.addEventListener("touchstart", function(e) {
										data.touchMoveStartPosition = e.touches[0][page];
									}, false);

									element.addEventListener("touchmove", function(e) {
										var delta = (e.touches[0][page] - data.touchMoveStartPosition) / data.dragFactor;
										e.preventDefault();
										methods.stopAnimation.apply($(this));
										methods.setBearing.apply($(this), [data.dragBearing + delta]);
									}, false);

									element.addEventListener("touchend", function(e) {
										e.preventDefault();
										methods.allowAnimation.apply($(this));
										method = methods.getAnimateToMethod(data.dropAnimateTo);
										methods[method].apply($(this), [data.dropDuration, data.dropEasing, data.dropCallback]);
										data.dragBearing = data.period * methods.getNearestChild.apply($(this));
									}, false);
								}
							});
					}

					// start children
					methods.initChildren.apply(self, [callback, relayout]);
				});
		},


		// initChildren
		// applys settings to child elements, starts roundabout
		initChildren: function(callback, relayout) {
			var self = $(this),
				data = self.data("roundabout");

			callback = callback || function() {};

			self.children(data.childSelector).each(function(i) {
				var startWidth, startHeight, startFontSize,
					degrees = methods.getPlacement.apply(self, [i]);

				// on relayout, grab these values from current data
				if (relayout && $(this).data("roundabout")) {
					startWidth = $(this).data("roundabout").startWidth;
					startHeight = $(this).data("roundabout").startHeight;
					startFontSize = $(this).data("roundabout").startFontSize;
				}

				// apply classes and css first
				$(this)
					.addClass("roundabout-moveable-item")
					.css("position", "absolute");

				// now measure
				$(this)
					.data(
						"roundabout",
						{
							startWidth: startWidth || $(this).width(),
							startHeight: startHeight || $(this).height(),
							startFontSize: startFontSize || parseInt($(this).css("font-size"), 10),
							degrees: degrees,
							backDegrees: methods.normalize.apply(null, [degrees - 180]),
							childNumber: i,
							currentScale: 1,
							parent: self
						}
					);
			});

			methods.updateChildren.apply(self);

			// start autoplay if necessary
			if (data.autoplay) {
				data.autoplayStartTimeout = setTimeout(function() {
					methods.startAutoplay.apply(self);
				}, data.autoplayInitialDelay);
			}

			self.trigger('ready');
			callback.apply(self);
			return self;
		},



		// positioning
		// -----------------------------------------------------------------------

		// updateChildren
		// move children elements into their proper locations
		updateChildren: function() {
			return this
				.each(function() {
					var self = $(this),
						data = self.data("roundabout"),
						inFocus = -1,
						info = {
							bearing: data.bearing,
							tilt: data.tilt,
							stage: {
								width: Math.floor($(this).width() * 0.9),
								height: Math.floor($(this).height() * 0.9)
							},
							animating: data.animating,
							inFocus: data.childInFocus,
							focusBearingRadian: methods.degToRad.apply(null, [data.focusBearing]),
							shape: $.roundaboutShapes[data.shape] || $.roundaboutShapes[$.roundaboutShapes.def]
						};

					// calculations
					info.midStage = {
						width: info.stage.width / 2,
						height: info.stage.height / 2
					};

					info.nudge = {
						width: info.midStage.width + (info.stage.width * 0.05),
						height: info.midStage.height + (info.stage.height * 0.05)
					};

					info.zValues = {
						min: data.minZ,
						max: data.maxZ,
						diff: data.maxZ - data.minZ
					};

					info.opacity = {
						min: data.minOpacity,
						max: data.maxOpacity,
						diff: data.maxOpacity - data.minOpacity
					};

					info.scale = {
						min: data.minScale,
						max: data.maxScale,
						diff: data.maxScale - data.minScale
					};

					// update child positions
					self.children(data.childSelector)
						.each(function(i) {
							if (methods.updateChild.apply(self, [$(this), info, i, function() { $(this).trigger('ready'); }]) && (!info.animating || data.lastAnimationStep)) {
								inFocus = i;
								$(this).addClass("roundabout-in-focus");
							} else {
								$(this).removeClass("roundabout-in-focus");
							}
						});

					if (inFocus !== info.inFocus) {
						// blur old child
						if (data.triggerBlurEvents) {
							self.children(data.childSelector)
								.eq(info.inFocus)
								.trigger("blur");
						}

						data.childInFocus = inFocus;

						if (data.triggerFocusEvents && inFocus !== -1) {
							// focus new child
							self.children(data.childSelector)
								.eq(inFocus)
								.trigger("focus");
						}
					}

					self.trigger("childrenUpdated");
				});
		},


		// updateChild
		// repositions a child element into its new position
		updateChild: function(childElement, info, childPos, callback) {
			var factors,
				self = this,
				child = $(childElement),
				data = child.data("roundabout"),
				out = [],
				rad = methods.degToRad.apply(null, [(360.0 - data.degrees) + info.bearing]);

			callback = callback || function() {};

			// adjust radians to be between 0 and Math.PI * 2
			rad = methods.normalizeRad.apply(null, [rad]);

			// get factors from shape
			factors = info.shape(rad, info.focusBearingRadian, info.tilt);

			// correct
			factors.scale = (factors.scale > 1) ? 1 : factors.scale;
			factors.adjustedScale = (info.scale.min + (info.scale.diff * factors.scale)).toFixed(4);
			factors.width = (factors.adjustedScale * data.startWidth).toFixed(4);
			factors.height = (factors.adjustedScale * data.startHeight).toFixed(4);

			// update item
			child
				.css({
					left: ((factors.x * info.midStage.width + info.nudge.width) - factors.width / 2.0).toFixed(0) + "px",
					top: ((factors.y * info.midStage.height + info.nudge.height) - factors.height / 2.0).toFixed(0) + "px",
					width: factors.width + "px",
					height: factors.height + "px",
					opacity: (info.opacity.min + (info.opacity.diff * factors.scale)).toFixed(2),
					zIndex: Math.round(info.zValues.min + (info.zValues.diff * factors.z)),
					fontSize: (factors.adjustedScale * data.startFontSize).toFixed(1) + "px"
				});
			data.currentScale = factors.adjustedScale;

			// for debugging purposes
			if (self.data("roundabout").debug) {
				out.push("<div style=\"font-weight: normal; font-size: 10px; padding: 2px; width: " + child.css("width") + "; background-color: #ffc;\">");
				out.push("<strong style=\"font-size: 12px; white-space: nowrap;\">Child " + childPos + "</strong><br />");
				out.push("<strong>left:</strong> " + child.css("left") + "<br />");
				out.push("<strong>top:</strong> " + child.css("top") + "<br />");
				out.push("<strong>width:</strong> " + child.css("width") + "<br />");
				out.push("<strong>opacity:</strong> " + child.css("opacity") + "<br />");
				out.push("<strong>height:</strong> " + child.css("height") + "<br />");
				out.push("<strong>z-index:</strong> " + child.css("z-index") + "<br />");
				out.push("<strong>font-size:</strong> " + child.css("font-size") + "<br />");
				out.push("<strong>scale:</strong> " + child.data("roundabout").currentScale);
				out.push("</div>");

				child.html(out.join(""));
			}

			// trigger event
			child.trigger("reposition");

			// callback
			callback.apply(self);

			return methods.isInFocus.apply(self, [data.degrees]);
		},



		// manipulation
		// -----------------------------------------------------------------------

		// setBearing
		// changes the bearing of the roundabout
		setBearing: function(bearing, callback) {
			callback = callback || function() {};
			bearing = methods.normalize.apply(null, [bearing]);

			this
				.each(function() {
					var diff, lowerValue, higherValue,
						self = $(this),
						data = self.data("roundabout"),
						oldBearing = data.bearing;

					// set bearing
					data.bearing = bearing;
					self.trigger("bearingSet");
					methods.updateChildren.apply(self);

					// not animating? we're done here
					diff = Math.abs(oldBearing - bearing);
					if (!data.animating || diff > 180) {
						return;
					}

					// check to see if any of the children went through the back
					diff = Math.abs(oldBearing - bearing);
					self.children(data.childSelector).each(function(i) {
						var eventType;

						if (methods.isChildBackDegreesBetween.apply($(this), [bearing, oldBearing])) {
							eventType = (oldBearing > bearing) ? "Clockwise" : "Counterclockwise";
							$(this).trigger("move" + eventType + "ThroughBack");
						}
					});
				});

			// call callback if one was given
			callback.apply(this);
			return this;
		},


		// adjustBearing
		// change the bearing of the roundabout by a given degree
		adjustBearing: function(delta, callback) {
			callback = callback || function() {};
			if (delta === 0) {
				return this;
			}

			this
				.each(function() {
					methods.setBearing.apply($(this), [$(this).data("roundabout").bearing + delta]);
				});

			callback.apply(this);
			return this;
		},


		// setTilt
		// changes the tilt of the roundabout
		setTilt: function(tilt, callback) {
			callback = callback || function() {};

			this
				.each(function() {
					$(this).data("roundabout").tilt = tilt;
					methods.updateChildren.apply($(this));
				});

			// call callback if one was given
			callback.apply(this);
			return this;
		},


		// adjustTilt
		// changes the tilt of the roundabout
		adjustTilt: function(delta, callback) {
			callback = callback || function() {};

			this
				.each(function() {
					methods.setTilt.apply($(this), [$(this).data("roundabout").tilt + delta]);
				});

			callback.apply(this);
			return this;
		},



		// animation
		// -----------------------------------------------------------------------

		// animateToBearing
		// animates the roundabout to a given bearing, all animations come through here
		animateToBearing: function(bearing, duration, easing, passedData, callback) {
			var now = (new Date()).getTime();

			callback = callback || function() {};

			// find callback function in arguments
			if ($.isFunction(passedData)) {
				callback = passedData;
				passedData = null;
			} else if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			this
				.each(function() {
					var timer, easingFn, newBearing,
						self = $(this),
						data = self.data("roundabout"),
						thisDuration = (!duration) ? data.duration : duration,
						thisEasingType = (easing) ? easing : data.easing || "swing";

					// is this your first time?
					if (!passedData) {
						passedData = {
							timerStart: now,
							start: data.bearing,
							totalTime: thisDuration
						};
					}

					// update the timer
					timer = now - passedData.timerStart;

					if (data.stopAnimation) {
						methods.allowAnimation.apply(self);
						data.animating = false;
						return;
					}

					// we need to animate more
					if (timer < thisDuration) {
						if (!data.animating) {
							self.trigger("animationStart");
						}

						data.animating = true;

						if (typeof $.easing.def === "string") {
							easingFn = $.easing[thisEasingType] || $.easing[$.easing.def];
							newBearing = easingFn(null, timer, passedData.start, bearing - passedData.start, passedData.totalTime);
						} else {
							newBearing = $.easing[thisEasingType]((timer / passedData.totalTime), timer, passedData.start, bearing - passedData.start, passedData.totalTime);
						}

						// fixes issue #24, animation changed as of jQuery 1.7.2
						// also addresses issue #29, using easing breaks "linear"
						if (methods.compareVersions.apply(null, [$().jquery, "1.7.2"]) >= 0 && !($.easing["easeOutBack"])) {
							newBearing = passedData.start + ((bearing - passedData.start) * newBearing);
						}

						newBearing = methods.normalize.apply(null, [newBearing]);
						data.dragBearing = newBearing;

						methods.setBearing.apply(self, [newBearing, function() {
							setTimeout(function() {  // done with a timeout so that each step is displayed
								methods.animateToBearing.apply(self, [bearing, thisDuration, thisEasingType, passedData, callback]);
							}, 0);
						}]);

						// we're done animating
					} else {
						data.lastAnimationStep = true;

						bearing = methods.normalize.apply(null, [bearing]);
						methods.setBearing.apply(self, [bearing, function() {
							self.trigger("animationEnd");
						}]);
						data.animating = false;
						data.lastAnimationStep = false;
						data.dragBearing = bearing;

						callback.apply(self);
					}
				});

			return this;
		},


		// animateToNearbyChild
		// animates roundabout to a nearby child
		animateToNearbyChild: function(passedArgs, which) {
			var duration = passedArgs[0],
				easing = passedArgs[1],
				callback = passedArgs[2] || function() {};

			// find callback
			if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			return this
				.each(function() {
					var j, range,
						self = $(this),
						data = self.data("roundabout"),
						bearing = (!data.reflect) ? data.bearing % 360 : data.bearing,
						length = self.children(data.childSelector).length;

					if (!data.animating) {
						// reflecting, not moving to previous || not reflecting, moving to next
						if ((data.reflect && which === "previous") || (!data.reflect && which === "next")) {
							// slightly adjust for rounding issues
							bearing = (Math.abs(bearing) < data.floatComparisonThreshold) ? 360 : bearing;

							// clockwise
							for (j = 0; j < length; j += 1) {
								range = {
									lower: (data.period * j),
									upper: (data.period * (j + 1))
								};
								range.upper = (j === length - 1) ? 360 : range.upper;

								if (bearing <= Math.ceil(range.upper) && bearing >= Math.floor(range.lower)) {
									if (length === 2 && bearing === 360) {
										methods.animateToDelta.apply(self, [-180, duration, easing, callback]);
									} else {
										methods.animateBearingToFocus.apply(self, [range.lower, duration, easing, callback]);
									}
									break;
								}
							}
						} else {
							// slightly adjust for rounding issues
							bearing = (Math.abs(bearing) < data.floatComparisonThreshold || 360 - Math.abs(bearing) < data.floatComparisonThreshold) ? 0 : bearing;

							// counterclockwise
							for (j = length - 1; j >= 0; j -= 1) {
								range = {
									lower: data.period * j,
									upper: data.period * (j + 1)
								};
								range.upper = (j === length - 1) ? 360 : range.upper;

								if (bearing >= Math.floor(range.lower) && bearing < Math.ceil(range.upper)) {
									if (length === 2 && bearing === 360) {
										methods.animateToDelta.apply(self, [180, duration, easing, callback]);
									} else {
										methods.animateBearingToFocus.apply(self, [range.upper, duration, easing, callback]);
									}
									break;
								}
							}
						}
					}
				});
		},


		// animateToNearestChild
		// animates roundabout to the nearest child
		animateToNearestChild: function(duration, easing, callback) {
			callback = callback || function() {};

			// find callback
			if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			return this
				.each(function() {
					var nearest = methods.getNearestChild.apply($(this));
					methods.animateToChild.apply($(this), [nearest, duration, easing, callback]);
				});
		},


		// animateToChild
		// animates roundabout to a given child position
		animateToChild: function(childPosition, duration, easing, callback) {
			callback = callback || function() {};

			// find callback
			if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			return this
				.each(function() {
					var child,
						self = $(this),
						data = self.data("roundabout");

					if (data.childInFocus !== childPosition && !data.animating) {
						child = self.children(data.childSelector).eq(childPosition);
						methods.animateBearingToFocus.apply(self, [child.data("roundabout").degrees, duration, easing, callback]);
					}
				});
		},


		// animateToNextChild
		// animates roundabout to the next child
		animateToNextChild: function(duration, easing, callback) {
			return methods.animateToNearbyChild.apply(this, [arguments, "next"]);
		},


		// animateToPreviousChild
		// animates roundabout to the preious child
		animateToPreviousChild: function(duration, easing, callback) {
			return methods.animateToNearbyChild.apply(this, [arguments, "previous"]);
		},


		// animateToDelta
		// animates roundabout to a given delta (in degrees)
		animateToDelta: function(degrees, duration, easing, callback) {
			callback = callback || function() {};

			// find callback
			if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			return this
				.each(function() {
					var delta = $(this).data("roundabout").bearing + degrees;
					methods.animateToBearing.apply($(this), [delta, duration, easing, callback]);
				});
		},


		// animateBearingToFocus
		// animates roundabout to bring a given angle into focus
		animateBearingToFocus: function(degrees, duration, easing, callback) {
			callback = callback || function() {};

			// find callback
			if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			return this
				.each(function() {
					var delta = $(this).data("roundabout").bearing - degrees;
					delta = (Math.abs(360 - delta) < Math.abs(delta)) ? 360 - delta : -delta;
					delta = (delta > 180) ? -(360 - delta) : delta;

					if (delta !== 0) {
						methods.animateToDelta.apply($(this), [delta, duration, easing, callback]);
					}
				});
		},


		// stopAnimation
		// if an animation is currently in progress, stop it
		stopAnimation: function() {
			return this
				.each(function() {
					$(this).data("roundabout").stopAnimation = true;
				});
		},


		// allowAnimation
		// clears the stop-animation hold placed by stopAnimation
		allowAnimation: function() {
			return this
				.each(function() {
					$(this).data("roundabout").stopAnimation = false;
				});
		},



		// autoplay
		// -----------------------------------------------------------------------

		// startAutoplay
		// starts autoplaying this roundabout
		startAutoplay: function(callback) {
			return this
				.each(function() {
					var self = $(this),
						data = self.data("roundabout");

					callback = callback || data.autoplayCallback || function() {};

					clearInterval(data.autoplayInterval);
					data.autoplayInterval = setInterval(function() {
						methods.animateToNextChild.apply(self, [callback]);
					}, data.autoplayDuration);
					data.autoplayIsRunning = true;

					self.trigger("autoplayStart");
				});
		},


		// stopAutoplay
		// stops autoplaying this roundabout
		stopAutoplay: function(keepAutoplayBindings) {
			return this
				.each(function() {
					clearInterval($(this).data("roundabout").autoplayInterval);
					$(this).data("roundabout").autoplayInterval = null;
					$(this).data("roundabout").autoplayIsRunning = false;

					// this will prevent autoplayPauseOnHover from restarting autoplay
					if (!keepAutoplayBindings) {
						$(this).unbind(".autoplay");
					}

					$(this).trigger("autoplayStop");
				});
		},


		// toggleAutoplay
		// toggles autoplay pause/resume
		toggleAutoplay: function(callback) {
			return this
				.each(function() {
					var self = $(this),
						data = self.data("roundabout");

					callback = callback || data.autoplayCallback || function() {};

					if (!methods.isAutoplaying.apply($(this))) {
						methods.startAutoplay.apply($(this), [callback]);
					} else {
						methods.stopAutoplay.apply($(this), [callback]);
					}
				});
		},


		// isAutoplaying
		// is this roundabout currently autoplaying?
		isAutoplaying: function() {
			return (this.data("roundabout").autoplayIsRunning);
		},


		// changeAutoplayDuration
		// stops the autoplay, changes the duration, restarts autoplay
		changeAutoplayDuration: function(duration) {
			return this
				.each(function() {
					var self = $(this),
						data = self.data("roundabout");

					data.autoplayDuration = duration;

					if (methods.isAutoplaying.apply(self)) {
						methods.stopAutoplay.apply(self);
						setTimeout(function() {
							methods.startAutoplay.apply(self);
						}, 10);
					}
				});
		},



		// helpers
		// -----------------------------------------------------------------------

		// normalize
		// regulates degrees to be >= 0.0 and < 360
		normalize: function(degrees) {
			var inRange = degrees % 360.0;
			return (inRange < 0) ? 360 + inRange : inRange;
		},


		// normalizeRad
		// regulates radians to be >= 0 and < Math.PI * 2
		normalizeRad: function(radians) {
			while (radians < 0) {
				radians += (Math.PI * 2);
			}

			while (radians > (Math.PI * 2)) {
				radians -= (Math.PI * 2);
			}

			return radians;
		},


		// isChildBackDegreesBetween
		// checks that a given child's backDegrees is between two values
		isChildBackDegreesBetween: function(value1, value2) {
			var backDegrees = $(this).data("roundabout").backDegrees;

			if (value1 > value2) {
				return (backDegrees >= value2 && backDegrees < value1);
			} else {
				return (backDegrees < value2 && backDegrees >= value1);
			}
		},


		// getAnimateToMethod
		// takes a user-entered option and maps it to an animation method
		getAnimateToMethod: function(effect) {
			effect = effect.toLowerCase();

			if (effect === "next") {
				return "animateToNextChild";
			} else if (effect === "previous") {
				return "animateToPreviousChild";
			}

			// default selection
			return "animateToNearestChild";
		},


		// relayoutChildren
		// lays out children again with new contextual information
		relayoutChildren: function() {
			return this
				.each(function() {
					var self = $(this),
						settings = $.extend({}, self.data("roundabout"));

					settings.startingChild = self.data("roundabout").childInFocus;
					methods.init.apply(self, [settings, null, true]);
				});
		},


		// getNearestChild
		// gets the nearest child from the current bearing
		getNearestChild: function() {
			var self = $(this),
				data = self.data("roundabout"),
				length = self.children(data.childSelector).length;

			if (!data.reflect) {
				return ((length) - (Math.round(data.bearing / data.period) % length)) % length;
			} else {
				return (Math.round(data.bearing / data.period) % length);
			}
		},


		// degToRad
		// converts degrees to radians
		degToRad: function(degrees) {
			return methods.normalize.apply(null, [degrees]) * Math.PI / 180.0;
		},


		// getPlacement
		// returns the starting degree for a given child
		getPlacement: function(child) {
			var data = this.data("roundabout");
			return (!data.reflect) ? 360.0 - (data.period * child) : data.period * child;
		},


		// isInFocus
		// is this roundabout currently in focus?
		isInFocus: function(degrees) {
			var diff,
				self = this,
				data = self.data("roundabout"),
				bearing = methods.normalize.apply(null, [data.bearing]);

			degrees = methods.normalize.apply(null, [degrees]);
			diff = Math.abs(bearing - degrees);

			// this calculation gives a bit of room for javascript float rounding
			// errors, it looks on both 0deg and 360deg ends of the spectrum
			return (diff <= data.floatComparisonThreshold || diff >= 360 - data.floatComparisonThreshold);
		},


		// getChildInFocus
		// returns the current child in focus, or false if none are in focus
		getChildInFocus: function() {
			var data = $(this).data("roundabout");

			return (data.childInFocus > -1) ? data.childInFocus : false;
		},


		// compareVersions
		// compares a given version string with another
		compareVersions: function(baseVersion, compareVersion) {
			var i,
				base = baseVersion.split(/\./i),
				compare = compareVersion.split(/\./i),
				maxVersionSegmentLength = (base.length > compare.length) ? base.length : compare.length;

			for (i = 0; i <= maxVersionSegmentLength; i++) {
				if (base[i] && !compare[i] && parseInt(base[i], 10) !== 0) {
					// base is higher
					return 1;
				} else if (compare[i] && !base[i] && parseInt(compare[i], 10) !== 0) {
					// compare is higher
					return -1;
				} else if (base[i] === compare[i]) {
					// these are the same, next
					continue;
				}

				if (base[i] && compare[i]) {
					if (parseInt(base[i], 10) > parseInt(compare[i], 10)) {
						// base is higher
						return 1;
					} else {
						// compare is higher
						return -1;
					}
				}
			}

			// nothing was triggered, versions are the same
			return 0;
		}
	};


	// start the plugin
	$.fn.roundabout = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === "object" || $.isFunction(method) || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("Method " + method + " does not exist for jQuery.roundabout.");
		}
	};
})(jQuery);

;/**import from `/resource/js/page/liangpin/index/promo_product.js` **/
$(function () {
    //轮播插件初始化
    $('.roundabout_box .roundabout-holder').roundabout({
        duration: 500,
        // minScale: 0.45,//6个
        minScale: 0.8,
        autoplay: true,
        //autoplay: false,
        autoplayDuration: 4000,
        minOpacity: 0,
        maxOpacity: 1,
        reflect: false,
        startingChild: 0,
        autoplayInitialDelay: 2000,
        autoplayPauseOnHover: true,
        //autoplayPauseOnHover: false,
        enableDrag: true,
        childSelector: ".roundabout-moveable-item",
        btnNext: ".btn-next",
        btnPrev: ".btn-prev",
        // 非必要情况，此参数必须设置为false，
        // 避免在IE下当轮播不在窗口内时，轮播的时候页面滚动条会自动弹到轮播的位置
        triggerFocusEvents: false
    })

    $('.roundabout_box').hover(
        function (e) {
            $('.btn-switch').show()
        },
        function () {
            $('.btn-switch').hide()
        })
    $('.roundabout_box .btn-prev').hover(
        function () {
            $(this).css('background-image','url(https://p3.ssl.qhmsg.com/t01086805a0b83a4018.png)')
        },
        function () {
            $(this).css('background-image','url(https://p0.ssl.qhmsg.com/t01624e42c2b5e4a1d6.png)')
        })
    $('.roundabout_box .btn-next').hover(
        function () {
            $(this).css('background-image','url(https://p0.ssl.qhmsg.com/t011f5a197568751f88.png)')
        },
        function () {
            $(this).css('background-image','url(https://p0.ssl.qhmsg.com/t0169c6ce3d7043d873.png)')
        })

})

;/**import from `/resource/js/page/liangpin/index/block_sale.js` **/
// 甩货专区
$(function () {
    var __Cache = {
        productList : null,
        price       : 500,
        pn          : 0,
        page_size   : 10
    }

    function bindEvent () {
        tcb.bindEvent (document, {
            // 切换价格tab
            '.block-sale .tab-list .tab-item' : function (e) {
                e.preventDefault ()

                var $me = $ (this),
                    price = $me.attr ('data-price')

                __Cache.price = price
                __Cache.pn = 0

                $me.addClass ('cur').siblings ('.cur').removeClass ('cur')

                renderProductList ()
            }
        })
    }

    // 获取商品列表
    function getProductList(callback) {
        if (__Cache.productList){
            typeof callback==='function' && callback(__Cache.productList)
        } else {
            $.get('/youpin/getActivityProductList', function (res) {
                res = $.parseJSON(res)

                if(!res['errno']){
                    __Cache.productList = res.result

                    typeof callback==='function' && callback(__Cache.productList)
                }
            })
        }
    }

    // 输出商品列表
    function renderProductList () {
        getProductList(function (productList) {
            productList = productList[__Cache.price]
            var pn = __Cache.pn,
                pageSize = __Cache.page_size,
                count = productList && productList.length,
                renderList = productList.slice (pn * pageSize, (pn + 1) * pageSize)

            var html_fn = $.tmpl ($.trim ($ ('#JsSaleProductListTpl').html ())),
                html_st = html_fn ({
                    col : 5,
                    params : {
                        from_page:'0-1000'
                    },
                    productList : renderList
                })

            $ ('.block-sale .js-sale-product-list').html (html_st)

            productPager (count, pn, pageSize)
        })
    }

    // 分页
    function productPager (total, pn, page_size) {
        page_size = page_size || 8
        pn = pn || 0

        var page_num = Math.ceil (total / page_size)

        var wPages =  W('.pagination .pages2')
        if (page_num == 1) {
            wPages.html ('')
            return
        }
        var pager = new Pager (wPages, page_num, pn)
        pager.on ('pageChange', function (e) {

            __Cache.pn = e.pn

            renderProductList ()

            window.scrollTo(0, $('.block-sale .tab-list').offset()['top']-10)
        })
    }

    function init () {
        bindEvent ()

        renderProductList ()
    }

    if ($ ('.block-sale .js-sale-product-list').length){
        init ()
    }
})
