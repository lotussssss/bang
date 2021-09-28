Dom.ready(function(){
    var dataListCache = {};
    var bigMarkerList = [];

    function bindEvent(){
        tcb.bindEvent(document.body, {
            '#mode_list .figure-h' : function(e){
                W(this).addClass('shop-selected').siblings('.shop-selected').removeClass('shop-selected');
            }
        });

        W('#searchForm').on('submit', function(e){
            e.preventDefault();
            var kw = W('#searchKeyWord');

            if(kw.val().trim()==''){
                kw.shine4Error().focus();
                return false;
            }

            this.submit();
        });
    }
    
    /**
     * 显示地图
     */
    var map;
    function getBigMap(){
        //reset
        if( map ){
            return map;
        }

        document.getElementById("mode_map_container").innerHTML = "";

        map = new AMap.Map("mode_map_container",{
            view: new AMap.View2D({//创建地图二维视口
               zoom:11,
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

        W(document.body).delegate('.mode-map a.close', 'click', function(e){    
            e.preventDefault();
            map.clearInfoWindow();

        })
        

        //点击在线聊天时关闭弹出层
        W(document.body).delegate('.qim-go-talk', 'click', function(){
            panel.hide();
            map = null;
        });

        return map;
    }

    /**
     * 显示大地图，仅在网站首页生效，一次显示300数据
     */
    function showBigMap(pn){
        
        var param = getMerSelectParam();
        var pageSize = 100; 
            param.pagesize = pageSize;
            param['pn'] = pn | 0;

        QW.Ajax.get('/at/shop?'+ Object.encodeURIJson(param),function(e){
            var ret = e.evalExp(),
                data = ret.shop_data;
            if(parseInt(ret.errno)!==0){
                
            }else{
                addMarker(data);
            }
            
        });
    }

    /**
     * 添加marker到地图
     * @param {[type]} data [description]
     */
    function addMarker(data, showbig){
        var map = getBigMap();
        //删除掉原来的大点
        if(showbig && bigMarkerList.length){
            bigMarkerList.forEach(function(el){
                el.setMap(null);
            });
        }

        try{ map.clearInfoWindow(); }catch(ex){}

        data.forEach(function(item, i){
            if( !item.map_longitude || !item.map_latitude){ return false; }
            var marker = new AMap.Marker({
                id:"mapMarker"+ (item.s_shop_id || ''),
                position:new AMap.LngLat(item.map_longitude, item.map_latitude), 
                icon: showbig? 'https://p.ssl.qhimg.com/t01647448c59c844934.png' : 'https://p.ssl.qhimg.com/t017ed4dfe99b1b3225.png',
                content : showbig? '<div class="map-big-icon">'+String.fromCharCode(65+i)+'</div>' : '',
                zIndex : showbig? 100 : 10,
                offset: showbig? {x:-13,y:-36} : {x:-7,y:-36}
            });
            marker.setMap(map);

            if(showbig){ bigMarkerList.push(marker); }

            var infoWindow = new AMap.InfoWindow({
                isCustom: true,
                autoMove: true,
                offset:new AMap.Pixel(70,-250),
                content:W('#ramMapInfoTpl').html().tmpl({
                    shop_name: item.shop_name,
                    addr: item.addr_detail,
                    service_tags: item.main.subByte(40, '...'), //item.service_tags.subByte(40,'...'),
                    qid: item.qid,
                    shop_addr: item.shop_addr,
                    online_txt: item.is_online == "on" ? "立即咨询" : "离线留言",
                    mobile : item.mobile
                }),
                size: new AMap.Size(349, 204)
            });
            if(item.recommend==1){
                //W("#maprecommendTips").show();
            }
            AMap.event.addListener(marker, "click", function(){                
                infoWindow.open(map, marker.getPosition());

                try{ W('#mode_list .figure-h[data-shopid="'+item.s_shop_id+'"]').fire('click'); }catch(ex){}

                //try{ tcbMonitor.__log({cid:'map-marker-click',ch:''}); }catch(ex){}
            })
        });

        showbig && setMapCenter(data);
    }

    function setMapCenter(data){
        var sumX = [], sumY = [], offset = 0.0038;

        for(var i=0,n=data.length; i<n; i++){
            var item = data[i];

            if(item.map_longitude && item.map_latitude){
                sumX.push( item.map_longitude-0 );
                sumY.push( item.map_latitude-0 );
            }
        }

        var swLL = new AMap.LngLat( Math.min.apply(null, sumX) - offset, Math.min.apply(null, sumY) - offset );
        var neLL = new AMap.LngLat(  Math.max.apply(null, sumX) + offset, Math.max.apply(null, sumY) + offset );

        map.setBounds(new AMap.Bounds( swLL , neLL ));
    }

    /**
     * 获得商家进行过滤的参数
     */
    function getMerSelectParam(){

        var cur_citycode = W('#ramCitySelector .sel-city').attr('code') || 'bei_jing';
            area_id = W('#ramCitySelector .sel-quxian').attr('code') || 0;       

        return {
            'city_id':cur_citycode,
            'area_id':area_id,
            'pagesize':10
        }

    }

    /**
     * 商家维修信息
     * @param  {[type]} pn   [description]
     * @param  {[type]} flag [description]
     * @return {[type]}      [description]
     */
    function asynMerRepair(pn,flag,gdata){
        var html = '',
            pageSize =10 ;
        var param = getMerSelectParam();
            param['pn'] = pn;
            
        if(dataListCache[Object.encodeURIJson(param)]||gdata){
            var _data = dataListCache[Object.encodeURIJson(param)]||gdata;
            _data['shop_data'].forEach(function(el){
                if (el['shop_ico'].indexOf('pinpailogo')==-1) {
                    el['shop_ico'] = tcb.imgThumbUrl(el['shop_ico'], 140, 140);
                }
            });
            var func = W("#ramMerRepairTplIndex").html().trim().tmpl();
            html = func(_data);
            W('#merRepairWrap').html(html);

            if(flag){
                merRepairPager(Math.ceil(_data.page_count/pageSize));
                W('#searchRsNum').html(_data.page_count);
            }

            addMarker(_data['shop_data'], true);

        }else{
            QW.Ajax.get('/at/shop?'+ Object.encodeURIJson(param),function(e){
                var ret = e.evalExp();
                if(parseInt(ret.errno)!==0){
                    html =  '<li class="no-data-merrepair">抱歉，暂时没有找到符合您要求的店铺</li>';
                }else{
                    if(ret.shop_data.length==0){
                        html =  '<li class="no-data-merrepair">抱歉，暂时没有找到符合您要求的店铺</li>';
                    }else{
                        ret['shop_data'].forEach(function(el){
                            if (el['shop_ico'].indexOf('pinpailogo')==-1) {
                                el['shop_ico'] = tcb.imgThumbUrl(el['shop_ico'], 140, 140);
                            }
                        });
                        dataListCache[Object.encodeURIJson(param)] = ret;
                        var func = W("#ramMerRepairTplIndex").html().trim().tmpl();
                        html = func(ret);
                    }
                }
                

                W('#merRepairWrap').html(html);
                
                if(flag){
                    merRepairPager(Math.ceil(ret.page_count/pageSize));
                    W('#searchRsNum').html(ret.page_count);
                }

                addMarker(ret['shop_data'], true);
            });
        }
        
    }

    /**
     * 商家维修分页
     * @return {[type]} [description]
     */
    function merRepairPager(pagenum, id, callback){



        var id = id || 'merRepairPager';
        if(pagenum==1){
            W('#'+id+' .pages').hide().html('');
            return;
        }

        W('#'+id+' .pages').show();

        var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
        var pager = new Pager(W('#'+id+' .pages'), pagenum, pn);

        pager.on('pageChange', function(e) {
            callback = callback || asynMerRepair;
            callback(e.pn,false,false);
            if(id != "merRepairMapPager"){
                window.scrollTo(0, W('.doc-bd').getRect().top);
            }
            
        });
    }

    /**
     * 浮动菜单
     * @return {[type]} [description]
     */
    function fixedFloatMenu(){
        var menu = W('#modeQuestion');
        if(!menu.length){return;}
        var oTop = menu.getRect().top;
        
        function _fixMenu(){                        

            if( Dom.getDocRect().scrollY > oTop ){
                !menu.hasClass('menu-fixed') && menu.addClass('menu-fixed');
            }else{
                menu.hasClass('menu-fixed') && menu.removeClass('menu-fixed');
            }

        }

        W(window).on('scroll', _fixMenu);
        W(window).on('laod', _fixMenu);
        W(window).on('resize', _fixMenu);

    }

    //初始化地址选择器
    function initAddrComp(boxObj){
        // 激活面板选择
        new bang.AreaSelect({
            'wrap': boxObj,
            'hasquan' : false,          
            // 城市选择时触发
            'onCitySelect': function(data){
                 getNewDataByArea();
                 new Image().src = "/aj/qiehuan_city/?citycode=" + data.citycode;  //Do this make the browser city cookie change.
            },
            // 区县选择时触发
            'onAreaSelect': function(data){
                getNewDataByArea();
            },
            // 商圈选择时触发
            'onQuanSelect': function(data){

            }
        }); 
    }

    /**
     * 城市区域修改后获取数据
     * @return {[type]} [description]
     */
    function getNewDataByArea(){
        showBigMap();  
        asynMerRepair(0, true);
    }

    function init(){
        initAddrComp( '#ramCitySelector' );    
        fixedFloatMenu();
        new PlaceHolder('#searchKeyWord');
        bindEvent();

        getNewDataByArea();
    }

    init();
});

/**
 * 统一处理显示页面等级星星
 * @param  {[type]} grade [description]
 * @return {[type]}       [description]
 */
function showShopGrade( grade ){
    var icon = Math.min(Math.ceil(grade/5), 4);
    var icon_num = (grade-1)%5 + 1;
    var str = '';
    for(var i=0; i<icon_num; i++){
        str +='<span class="icon icon-dj icon-dj-'+icon+'"></span>';
    }
    return str;
}