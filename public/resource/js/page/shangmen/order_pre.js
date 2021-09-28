Dom.ready(function(){
    // 提交自营订单
    if (!W('.page-shangmen-order').length) {
        return ;
    }

    // 到店商家列表
    (function(){
        var pageSize = 10;

        //根据关键字搜索到店商家列表
        var dataListCache = {},
            __currListData = {};
        function getDaodianShopList(pn, flag){
            var param = getDaodianSearchParams();
            param['pn'] = pn || 0;
            param['async']=1;

            //console.log(dataListCache)

            //有缓存
            if(dataListCache[Object.encodeURIJson(param)]){
                var rs = dataListCache[Object.encodeURIJson(param)];
                var func = W("#smDaodianShopTpl").html().trim().tmpl();
                html = func(rs);
                W('.search-mod-rs').html(html);

                flag && smRepairPager(Math.ceil(rs.page_count/pageSize));

                //赋值给全局变量，给地图使用
                window.__currListData = rs;
                updateMinMap();
            }else{//Ajax请求
                QW.Ajax.get('/client/search/', param, function(rs){
                    rs = QW.JSON.parse(rs);
                    rs.shop_data = rs.data;

                    if(!rs.shop_data && param['pn']==0){
                        W('.no-result').show();
                    }else{
                        if(rs.shop_data.length==0 && param['pn']==0){
                            W('.no-result').show();
                        }else{
                            W('.no-result').hide();
                            dataListCache[Object.encodeURIJson(param)] = rs;

                            var func = W("#smDaodianShopTpl").html().trim().tmpl();
                            html = func(rs);
                            W('.search-mod-rs').html(html);

                            flag && smRepairPager(Math.ceil(rs.page_count/param['pagesize']));
                            flag && ( W('.search-rs-num').html(rs.page_count) );

                            //赋值给全局变量，给地图使用
                            window.__currListData = rs;
                            updateMinMap();
                        }
                    }
                });
            }
        }

        function getDaodianSearchParams(){

            return{
                keyword : W('.daodian-shop-kw').html() || '',
                city_id : W('.area-select-wrap .sel-city').attr('code')||'',
                area_id : W('.area-select-wrap .sel-quxian').attr('code')||'',
                type_id : W('.search-mod-hd li.curr').attr('data-type')||0,
                pagesize : 10,
                show_mode : 'product'
            }
        }

        /**
         * 商家维修分页
         * @return {[type]} [description]
         */
        function smRepairPager(pagenum, id, callback){

            var id = id || 'smRepairPager';
            if(pagenum==1){
                W('#'+id+' .pages').hide().html('');
                return;
            }

            W('#'+id+' .pages').show();

            var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
            var pager = new Pager(W('#'+id+' .pages'), pagenum, pn);

            pager.on('pageChange', function(e) {
                callback = callback || getDaodianShopList;
                callback(e.pn,false,false);
                W('.detail-cnt[data-for="daodian"]')[0].scrollIntoView(true);
            });
        }

        var rightMinMap = null;
        function initMinMap(){
            rightMinMap = new AMap.Map("smMapWrap",{
                view: new AMap.View2D({//创建地图二维视口
                    zoom:8,
                    rotation:0
                })
            });
        }

        function updateMinMap(){
            if(!rightMinMap){
                initMinMap();
            }

            rightMinMap.clearMap();
            //直接从页面中获取变量显示结果
            var data = __currListData.shop_data || [];
//console.log(__currListData);
            data.forEach(function(item, i){
                if(i == 0){
                    rightMinMap.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude))
                }

                var marker = new AMap.Marker({
                    id:"mapMarker"+i,
                    position:new AMap.LngLat(item.map_longitude, item.map_latitude),
                    icon:{stc:"https://p.ssl.qhimg.com/t01a55fed81341959b4.png"}.stc,
                    offset:{x:-13,y:-36}
                });
                marker.setMap(rightMinMap);
            });
        }

        function showBigMap(){
            var map = null;

            var panel = tcb.alert("地图模式", '<div id="mode_map" ><div id="mode_map_container" style="width:700px;height:480px"></div></div>', {'width':700, btn_name: '关闭',wrapId:"panel-modeMapindex"}, function(){
                map = null;
                return true;
            });
            //reset
            document.getElementById("mode_map_container").innerHTML = "";

            map = new AMap.Map("mode_map_container",{
                view: new AMap.View2D({//创建地图二维视口
                    zoom:10,
                    rotation:0
                })
            });
            map.plugin(["AMap.ToolBar","AMap.OverView","AMap.Scale"],function(){
                var overview = new AMap.OverView();
                map.addControl(overview);
                var toolbar = new AMap.ToolBar(-100,0);
                toolbar.autoPosition=false;
                map.addControl(toolbar);
                var scale = new AMap.Scale();
                map.addControl(scale);
            });
            W(document.body).delegate('#panel-modeMapindex span.close', 'click', function(e){
                try{
                    e.preventDefault();
                    map.clearInfoWindow();
                    map = null;
                }catch(e){

                }

            })

            W(document.body).delegate('.mode-map a.close', 'click', function(e){
                e.preventDefault();
                map.clearInfoWindow();

            });


            //点击在线聊天时关闭弹出层
            W(document.body).delegate('.qim-go-talk', 'click', function(){
                panel.hide();
                map = null;
            });

            //直接从页面中获取变量显示结果
            var data = __currListData.shop_data || {};

            data.forEach(function(item, i){
                if(i == 0){
                    map.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude))
                }

                var marker = new AMap.Marker({
                    id:"mapMarker"+i,
                    position:new AMap.LngLat(item.map_longitude, item.map_latitude),
                    icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
                    offset:{x:-13,y:-36}
                });
                marker.setMap(map);

                var infoWindow = new AMap.InfoWindow({
                    isCustom: true,
                    autoMove: true,
                    offset:new AMap.Pixel(70,-290),
                    content:W('#indexMapInfoTpl_sm').html().tmpl({
                        shop_name: item.shop_name,
                        addr: item.addr_detail || item.s_addr_detail,
                        service_tags: item.main.subByte(40, '...'), //item.service_tags.subByte(40,'...'),
                        qid: item.qid,
                        shop_addr: item.shop_addr
                    }),
                    size: new AMap.Size(349, 204)
                });

                AMap.event.addListener(marker, "click", function(){
                    //try{ tcbMonitor.__log({cid:'map-marker-click',ch:''}); }catch(ex){}
                    infoWindow.open(map, marker.getPosition())
                })
            });
        }

        // 获取选择服务内容的相关详情
        function getServiceData(service_id, callback){
            var ServiceData = window._ServiceData || {};

            var ServiceDataItem = ServiceData[service_id];
            if (ServiceDataItem) {
                callback(ServiceDataItem);
            } else {
                QW.Ajax.get('/shangmen/aj_get_zydata', {
                    'fault_id': service_id
                }, function(res){
                    res = QW.JSON.parse(res);

                    if (!res['errno']) {
                        var InfoData = res['result'];
                        ServiceDataItem = {
                            'youji_city': [],// @我只是提前占位，现在没有任何作用
                            'shangmen_city': InfoData['shangmen_data'],
                            'daodian_city': InfoData['daodian_data'],
                            'select_list': InfoData['zy_data']['select_list'],
                            'service_list': InfoData['zy_data']['info_kv_list'],
                            //'express_shanghai': InfoData['show_shanghai_express_flags']
                            'express_not_support': {
                                '2':InfoData['show_beijing_express_flags']||{},
                                '3':InfoData['show_chengdu_express_flags']||{},
                                '4':InfoData['show_shanghai_express_flags']||{},
                                '5':InfoData['show_guangzhou_express_flags']||{}
                            }
                        };

                        window._ServiceData[service_id] = ServiceDataItem;

                        callback(ServiceDataItem);
                    } else {
                        // @do nothing
                    }
                });
            }
        }

        function init(){
            // 换屏活动中，内容详情页城市选择器
            if( W('#citySelector').length ){
                // 解析当前url的query
                var url_query = window.location.href.queryUrl();

                // 初始化城市区县选择
                new bang.AreaSelect({
                    'wrap': '#citySelector',
                    'hasquan': false,
                    'autoinit': true,                             // 是否自动初始化
                    'urlhost': 'http://' + location.host +'/',    // 请求的url
                    // new后init的回调
                    'onInit': function(){},
                    // 城市选择时触发
                    'onCitySelect': function(data){
                        getDaodianShopList(0, true);
                    },
                    // 区县选择时触发
                    'onAreaSelect': function(data){
                        getDaodianShopList(0, true);

                    },
                    // 商圈选择时触发
                    'onQuanSelect': function(data){
                        var area_id = data.areacode,
                            quan_id = data.quancode;

                        var request_url = quan_id
                            ? window.URL_ROOT+'t/aj_tuangou/?city='+window.cur_citycode+'&areaid='+area_id+'&quanid='+quan_id
                            : window.URL_ROOT+'t/aj_tuangou/?city='+window.cur_citycode+'&areaid='+area_id;
                        QW.Ajax.get(request_url, function(responceText){
                            try{
                                var responce = QW.JSON.parse(responceText),
                                    shop_huodong = {'shop_huodong' : responce['result']};

                                var shop_fn = W('#t_SetupsysShopTpl').html().trim().tmpl(),
                                    shop_html = shop_fn(shop_huodong);

                                W('.dp-list-box table tbody').html(shop_html);
                            } catch(ex){}
                        });
                    }
                });

                //排序修改
                W('.search-mod-hd li').on('click', function(){
                    if( W(this).hasClass('curr') ){
                        return;
                    }else{
                        W(this).addClass('curr').siblings().removeClass('curr');

                        getDaodianShopList(0, true);
                    }
                });

                //显示大地图
                W('.see-big-map').on('click', function(e){
                    e.preventDefault();
                    showBigMap()
                });

                //切换tab
                W('.detail-tab-item').on('click', function(e){
                    W(this).addClass('curr').siblings().removeClass('curr');
                    var rel = W(this).attr('data-rel');
                    W('.detail-cnt').hide();
                    W('.detail-cnt[data-for="'+rel+'"]').show();
                    try{ rel == 'daodian' && updateMinMap() }catch(ex){}
                });

                //查看专家生活照
                W('.sm-zj-item').on('mouseenter', function(e){
                    W(this).addClass('hover');
                });
                W('.sm-zj-item').on('mouseleave', function(e){
                    W(this).removeClass('hover');
                });

                //加载到店商家
                getDaodianShopList(0, true);
                initMinMap();

                W('.detail-tab').show();

                getServiceData(url_query['fault_id'], function(ServiceDataItem){
                    if (ServiceDataItem
                        && ServiceDataItem['shangmen_city']
                        && ServiceDataItem['shangmen_city'][window.__CurCityCode]) {

                        W('.detail-tab-item[data-rel="shangmen"]').show().fire('click');
                        W('.detail-tab-item[data-rel="youji"]').hide();
                    }
                    else {
                        W('.detail-tab-item[data-rel="shangmen"]').hide();
                        W('.detail-tab-item[data-rel="youji"]').show().fire('click');
                    }
                });

            }

        }

        init();
    }());
});