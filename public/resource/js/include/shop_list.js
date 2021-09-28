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