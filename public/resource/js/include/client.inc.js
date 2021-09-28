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