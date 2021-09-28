// 电脑维修
Dom.ready(function(){
    var wPageDiannao = W('.page-shangmen-diannao');
    // 电脑维修页
    if (!(wPageDiannao && wPageDiannao.length) ){
        return ;
    }

    tcb.bindEvent(wPageDiannao[0], {
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
                'pagesize': 10,
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
                    var scroll_val = W('.sm-shop-block-left').getRect()['top'];

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

});