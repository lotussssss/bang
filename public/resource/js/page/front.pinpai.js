(function(){
    var __lngLat = { lng: tcb.html_encode(location.search.queryUrl('lng'))||0, lat:tcb.html_encode(location.search.queryUrl('lat'))||0 };



    // 初始化
    Dom.ready(function(){

    	var JuBaoPanel = null;

        // 事件绑定
        tcb.bindEvent(document.body, {
            // 切换顶部搜索tab
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
            // 选择维修类别
            '.pinpai-search-cate a':function(e){
                e.preventDefault();

                W(this).parentNode('li').addClass('actived').siblings('li').removeClass('actived');

                // 切换查询的函数
                doSearch(true);
            },
            // 选择城市区县
            '.pinpai-search-area a':function(e){
                e.preventDefault();

                W(this).parentNode('li').addClass('actived').siblings('li').removeClass('actived');

                // 选择区县后，清除位置搜索结果
                cleanAddrSearch();
                // 切换查询的函数
                doSearch(true);
            },
            // 显示更多区县
            '.pinpai-nearby-item .shop-area': {
                'mouseenter':function(e){
                    W(this).addClass('shop-area-hover');
                },
                'mouseleave' : function(e){
                    W(this).removeClass('shop-area-hover');
                }
            },
            // 显示商家大地图
            '.shop-map': function(e){
                e.preventDefault();

                var el = W(this);

                new bigMap().show( el.attr('data-shopid'), typeof(_inclient)!='undefined' && _inclient );
            },
            //显示官方商家列表的地图展示
            '.shop-ditu-viewbig' : function(e){
                e.preventDefault();
                showBigMap();
            },
            // 显示真实电话号码
            '.show-real-tel': function(e){
                e.preventDefault();

                var wMe = W(this),
                    wTel = wMe.siblings('.shop-short-tel');
                wTel.html(wTel.attr('real-tel'));
                wMe.hide();

                var tel = wTel.attr('real-tel');
                var shop_id = wTel.attr('data-shopid');
                new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=pinpai"+ ( location.href.indexOf('pinpai/shop')>-1? '_shop' : '' ) +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
            },
            //分享商家
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
            //举报
            '#JuBaoButton' : function(e){
                e.preventDefault();

                var jubao_func = W('#JuBaoPanelTpl_pinpai').html().trim().tmpl(),
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

                        var jubao_func2 = W('#JuBaoPanel2Tpl_pinpai').html().trim().tmpl(),
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

        // 初始化
        init();
    });
    /**
     * 入口
     * @return {[type]} [description]
     */
    function init(){
        //选择城市，刷新页面
        selectCity('.citypanel_trigger');

        setValue();
        //初始化小地图
        if (typeof weixiuDataJson!=='undefined') {
            initMiniMap();
        }
        initShopMinMap();
        //冻结搜索框
        // fixedToSearchBox();

        //位置搜索过滤
        initAddrSearch('#addrSearchForm .addr-ipt');
    }

    //展示商家列表的小地图
    function initMiniMap(wrap, isShowPop){
        var currQuxian = W('.pinpai-search-area ul li.actived');
        var isQuexian = !! currQuxian.attr('data-code');
        wrap = wrap || "ShopDituWrap";
        var wrapDom = document.getElementById(wrap);

        if(! wrapDom){return false;}

        var poiList = weixiuDataJson || [];

        //设置地图中心
        var selAddr = W('.top-hd-area .area-box-sel').html() + '市'  + (isQuexian ? currQuxian.one('a').html() : '');
        getGeoPoi( selAddr, function(poi){

            var map = new AMap.Map( wrap , {
                view: new AMap.View2D({//创建地图二维视口
                   center : new AMap.LngLat(poi.lng, poi.lat),
                   zoom:isQuexian? 10 : 9,
                   rotation:0
                })
            } );

            try{
                for(var i=0, n=poiList.length; i<n; i++){

                    (function(item){

                        var marker = new AMap.Marker({
                            id:"mapMarker_"+Math.ceil(Math.random()*10000),
                            position:new AMap.LngLat(item.map_longitude, item.map_latitude),
                            icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
                            offset:{x:-13,y:-36}
                        });
                        marker.setMap(map);

                        if(isShowPop){
                            var infoWindow = new AMap.InfoWindow({
                                isCustom: true,
                                autoMove: true,
                                offset:new AMap.Pixel(70,-280),
                                content:W('#pinpaiMapInfoTpl').html().tmpl({
                                    shop_name: item.shop_name,
                                    addr: item.addr_detail,
                                    service_tags: item.main.subByte(40,'...'),
                                    shop_addr: item.shop_addr
                                })
                            });

                            AMap.event.addListener(marker, "click", function(){
                                //try{ tcbMonitor.__log({cid:'pp-map-marker-click',ch:''}); }catch(ex){}
                                infoWindow.open(map, marker.getPosition())
                            });
                        }
                    })(poiList[i]);

                }

                W(document.body).delegate('.mode-map a.close', 'click', function(e){
                    e.preventDefault();
                    map.clearInfoWindow();
                });
            }catch(e){}

        });
    }
    //展示商家列表的大地图
    function showBigMap(){
        var wrap = "ShopDituBigWrap";
        var panel = tcb.alert("商铺地图", '<div id="'+wrap+'" style="width:695px;height:410px"></div>', {'width':695, 'btn_name': '关闭'}, function(){
                return true;
            });

        initMiniMap(wrap, true);
    }

    //展示单个商家小地图
    function initShopMinMap(){

        if(W('#ShopDituWrap2').length == 0){ return false;}

        var el = W('#ShopDituWrap2');

        var item = {
            lng : el.attr('data-lng'),
            lat : el.attr('data-lat')
        }
        try{
            var center = new AMap.LngLat(item.lng, item.lat);
            var map = new AMap.Map( "ShopDituWrap2" ,{
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

            var city_name = e.city.trim();

            var url = window.location.href.replace(/&city_code=[\w]/ig, '').replace(/&area_id=\w+/, '') + '&city_code=' + city_name;

            location.href = url;
        });
    }
    /**
     * 执行位置搜索
     * @param  {[type]} flag [description]
     * @param  {[type]} step [description]
     * @return {[type]}      [description]
     */
    function doSearch(flag,step){
        var params = getParam();

        flag && (params['pn'] = 0);

        location.href = "http://" +location.host +location.pathname + '?'+Object.encodeURIJson(params);
    }
    /**
     * 获得过滤的参数
     */
    function getParam(){
        var pagenum = location.href.queryUrl('pn');
        var classify_id = W('.pinpai-search-cate .actived').attr('data-code') || 0;
        var area_id = W('.pinpai-search-area .actived').attr('data-code') || 0;
        var wAddript = W('#addrSearchForm .addr-ipt'),
            addr = wAddript.val()==wAddript.attr('data-default') ? '' : wAddript.val();

        return {
            'name': location.href.queryUrl('name'), // 品牌名
            'pinpai_type': location.href.queryUrl('pinpai_type'),// 品牌类型（电脑or手机）
            'city_id': cur_citycode,    // 当前城市id
            'area_id': area_id,         // 当前区县id
            'classify_id': classify_id, // 维修类别id
            'pn': pagenum ? pagenum : 0,// 分页
            'keyword': keyword,         // 搜索关键词
            'pagesize': 15,             // 显示数量
            'lng' : __lngLat ? __lngLat.lng : '', // 经度
            'lat' : __lngLat ? __lngLat.lat : '', // 纬度
            'addr' : addr // 搜索地址
        }
    }
    /**
     * 设置搜索后的默认值
     */
    function setValue(){
        var _iptvalue = keyword||W("#360tcb_so").attr('data-default');
        if(!W("#360tcb_so").val()){
            W("#360tcb_so").val(decodeURIComponent(_iptvalue));
        }
    }
    // //控制表头
    // function fixedHead(){
    //     if(W("#modBoxHead").length==0|| W(".search-mod-hd").length==0) return;

    //     var scrollY=Dom.getDocRect().scrollY,
    //         obj = W("#modBoxHead"),
    //         tableY = W(".search-mod-hd").getXY()[1];

    //     if(scrollY>tableY){
    //          if(QW.Browser.ie6){
    //             obj.css({
    //                 'position':'absolute',
    //                 'top':scrollY,
    //                 'width':'960px'
    //             }).show();
    //          }else{
    //             obj.css({
    //                 'position':'fixed',
    //                 'top':0,
    //                 'width':'960px'
    //             }).show()
    //          }
    //     }else{
    //          obj.hide();
    //     }
    // }
    // W(window).on('scroll', fixedHead);
    // W(window).on('resize', fixedHead);

    // //冻结搜索框完整版
    // function fixedToSearchBox(){
    //     if( W('#doc-menubar .tcb-top-search').length>0 ){

    //         function autoFixedTopSearch(){
    //             var tbH = W('#doc-topbar').getSize().height;
    //             var dST = document.documentElement.scrollTop || document.body.scrollTop;
    //             var dmH = W('#doc-menubar').getSize().height;

    //             W('#doc-menubar-fixed').css('height', dmH);
    //             if( dST>= tbH ){
    //                 if( W('#doc-menubar-fixed').css('display') == 'none' ){
    //                     //把搜索框区域浮动条中
    //                     W('#doc-menubar').query('>.in').appendTo( W('#doc-menubar-fixed').html('') );
    //                     W('.hd-search-info form input[name="_isfix"]').val(1);
    //                     W('#doc-menubar-fixed').show();
    //                     W('#doc-menubar').css('visibility', 'hidden');
    //                     W(".search-click-here").hide();
    //                 }
    //             }else{
    //                 if( W('#doc-menubar-fixed').css('display') != 'none' ){
    //                     //将搜索框区域放回去
    //                     W('#doc-menubar').appendChild(W('#doc-menubar-fixed').query('>.in'));
    //                     W('.hd-search-info form input[name="_isfix"]').val(0);
    //                     W('#doc-menubar').css('visibility', 'visible');
    //                     W('#doc-menubar-fixed').hide();
    //                     W(".search-click-here").show();
    //                 }
    //             }
    //         }

    //         W(window).on('scroll', autoFixedTopSearch);
    //         W(window).on('onload', autoFixedTopSearch);
    //         W(window).on('resize', autoFixedTopSearch);
    //     }
    // }
    /**
     * 绑定位置搜索框
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    function initAddrSearch(obj){
        W('#addrSearchForm').bind('submit', function(e){
            e.preventDefault();
            var _this = this;
            var ipt = W(this).one('[name="addr"]');
            var txt = ipt.val();
            if( txt =='' || txt == ipt.attr('data-default') ){
                ipt.focus();
                if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(ipt);
            }else{
                getGeoPoi(txt, searchByPoi);
            }
        });

        W('#addrSearchForm').one('[name="addr"]').on('focus', function(){ W('.addr-search-err').hide(); });

        new AddrSuggest(obj, {
            'showNum' : 6,
            'onSelect' : function(txt){ getGeoPoi(txt, searchByPoi); },
            'requireCity' : function(){ return W('.area-box-sel').html() || '' }
        });
    }
    /**
     * 根据poi搜索
     * @param  {[type]} poi [description]
     * @return {[type]}     [description]
     */
    function searchByPoi(poi){
        if(poi == null){
            W('.addr-search-err').show();
        }else{
            W('.addr-search-err').hide();
            __lngLat = poi;
            cleanCitySel();
            doSearch(true);
        }
    }
    /**
     * 获取poi，执行回调
     * @param  {[type]}   addr     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function getGeoPoi(addr, callback){
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

                callback(pos);
            });
            //逆地理编码
            MGeocoder.getLocation(addr);
        });
	}
    /**
     * 清除位置搜索状态
     * @return {[type]} [description]
     */
    function cleanAddrSearch(){
        __lngLat = null;
        W('#addrSearchForm .addr-ipt').val('');
    }
    /**
     * 清除城市区县商圈选择状态
     * @return {[type]} [description]
     */
    function cleanCitySel(){
        W('.pinpai-search-area li').removeClass('actived').first().addClass('actived');
    }
}());
