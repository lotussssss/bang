Dom.ready(function(){
    // 打点
    function clickmark(params){
        var encode_params = typeof params=='string' ? params : Object.encodeURIJson(params);

        var request_url = BASE_ROOT+'aj/gshopmo/?'+encode_params;
        QW.Ajax.get(request_url,function(){});
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

            var city_name = e.name.trim();

            location.href ="http://" +location.host + location.pathname + "?city=" + city;
        });
    }
    selectCity(".city_trigger");

    tcb.bindEvent(document.body, {
        // 显示区县选择面板
        '.shangquan-select': function(e){
            var wAreapanel = W(this).siblings('.area-select-pannel');
            wAreapanel.fadeIn(100);
        },
        // 区县选择面板
        '.area-select-pannel': function(e){
            e.preventDefault();
            var wMe = W(this),
                wTarget = W(e.target),
                _box = wMe.parentNode('.section-body');
            // 关闭区县选择列表
            if (wTarget.hasClass('close')) {
                wMe.hide();
            }
            // 选择区县
            if (wTarget[0].nodeName.toLowerCase()==='a') {
                var area_name = wTarget.html(),
                    area_id = wTarget.attr('areaid');
                wMe.hide();
                wMe.siblings('.shangquan-select').query('.now-shangquan').html(area_name).attr('data-areaid', area_id||'');

                // 加载商家列表
                _box.one('.addr-sug-place').val('').focus().blur();
                _box.attr('data-poi', ''); //清空坐标
                LoadShopList(_box, 0, true);
            }
        },
        // 立即升级
        '.hd-neicun-lijishengji-btn': function(e){
            e.preventDefault();

            var wHeaderContent3 = W('.header-content3'),
                rect = wHeaderContent3.getRect();

            setScrollTop(rect['top']);

            clickmark({
                'from': W('#FromPageName').val(),
                'cId': 'hd-neicun-lijishengji-btn'
            });
        },
        // 电话咨询
        '.phone-shop-n': function(e){
            e.preventDefault();

            var wMe = W(this);

            tcb.panel('', '<div class="shop-phone-view-pannel"><div class="line"><span>店铺名称：</span><span>'+wMe.attr('data-shopname')+'</span></div><div class="line"><span>联系电话：</span><span class="lc1">'+wMe.attr('data-tel')+'</span></div><div style="height:30px;"></div><div class="line"><span class="lc2">联系我时，请说是在360同城帮看到的，谢谢！</span></div></div>', { 'width':380, 'height':180}, function(){return true;});

            clickmark({
                'from': W('#FromPageName').val(),
                'shopid': wMe.attr('data-shopid'),
                'PT': 'zixun',
                'mobile': wMe.attr('data-tel')
            });
        },
        '.see-shop-map' : function(e){
            e.preventDefault();
            var el = W(this);

            new bigMap().show( el.attr('data-shopid') );
        },
        '.play-video' : function(e){
            e.preventDefault();
            var config = {
                width:640,
                height:432
            }

            if(window.playerPanel && playerPanel.show){
                playerPanel.show();
            }else{
                playerPanel = tcb.panel('电脑清灰过程&效果', '<embed src="http://player.youku.com/player.php/sid/XNjUyNDc0MTY0/v.swf" allowFullScreen="true" quality="high" width="640" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" flashvars="isAutoPlay=true"></embed>', config);                    
            }
        },
        '.dp-list .dp-item': function(e){
            if( e.target.tagName.toUpperCase()=='A'){
                return;
            }

            window.open( W(this).one('.btn-buy').attr('href') );                
        }
    });
    
    W(document.body).on('click', function(e){
        var target = e.target,
            wTarget = W(target);

        if (!(wTarget.ancestorNode('.area-select-pannel').length 
                || wTarget.hasClass('area-select-pannel')
                || wTarget.ancestorNode('.shangquan-select').length 
                || wTarget.hasClass('shangquan-select'))) {
            W('.area-select-pannel').hide();
        }
    });

    /**
     * 加载商家列表
     * @param {[type]} pn [description]
     */
    function LoadShopList(box, pn, flag){
        var _box = W(box);
        var page_size = 12;

        var prdType = _box.attr('data-prdtype');
        var dataUrl = '';
        switch(prdType){
            case "qinghui" : dataUrl='/huodong/ajluyouqi/?huodong_type=2&'; break;
            case "neicun" : dataUrl='/client_recommend/aj_memoryShop?datatype=neicun&'; break;
            case "yingpan" : dataUrl='/search/?async=1&service_id=0&type_id=0&tag_id=0&keyword='+encodeURI('固态硬盘')+'&from=memory&'; break;  //FML.从搜索获取数据。
        }

        var params = getShopListParam( _box );

        if( prdType=='yingpan' ){
            params.city_id = params.citycode;
            params.area_id = params.areaid;
        }

        var encode_params = Object.encodeURIJson( params );
        var request_url = dataUrl + encode_params;
        if (pn) {
            request_url += '&pn='+pn;
        }

        var _lngLat = _box.attr('data-poi');

        if( _lngLat ){

            try{
                _lngLat = QW.JSON.parse(_lngLat);

                request_url += '&lng='+ _lngLat.lng + '&lat=' + _lngLat.lat;
            }catch(ex){}
        }

        QW.Ajax.get(request_url, function(responceText){
            var responce = QW.JSON.parse(responceText);

            //转换搜索的数据格式
            if( prdType=='yingpan' && !responce.result ){
                responce.result = { 
                    'total' : responce.page_count,
                    'lists' : Object.isArray(responce.data)? responce.data : Object.values(responce.data)
                }
            }else if(prdType=='qinghui'){
                responce.result = { 
                    'total' : page_size,
                    'lists' : responce.result.slice(0, page_size)
                }
            }
            
            var shop_data = {'shop_data' : responce['result']['lists'], 'data_type' : prdType};

            var shop_fn = W('#ShopListTpl').html().trim().tmpl(),
                shop_html = shop_fn(shop_data);

            if( (shop_html.length==0 || shop_html.trim().length==0) ){
                if(responce.result.total == 0){
                    _box.one('.dp-list').html('<p style="padding:30px; text-align:center; font-size:14px; color:#fff">抱歉，此区域暂无商家。</p>');
                }else{
                    _box.one('.dp-list').html('<p style="padding:30px; text-align:center; font-size:14px; color:#fff">没有更多内容了。</p>');
                }
            }else{
                _box.one('.dp-list').html(shop_html);
            }            

            flag && ShopListPager(Math.ceil(responce['result']['total']/page_size), _box);

            _box.one('.rs-shop-num').html(responce.result.total);

        });
    }

    /**
     * 设置滚动条高度
     * @param {[type]} top_val [description]
     */
    function setScrollTop(top_val){
        top_val = top_val ? top_val : 0;
        if (typeof window.pageYOffset!=='undefined') {
            window.pageYOffset = top_val;
        }
        document.documentElement.scrollTop = top_val;
        document.body.scrollTop = top_val;
    }
    /**
     * 商家维修分页
     * @return {[type]} [description]
     */
    function ShopListPager(pagenum, box, callback, flag){
        var _box = W(box);
        if(pagenum==1){
            _box.one('.pagination .pages').hide().html('');
            return;
        }

        _box.one('.pagination .pages').show();

        var pager = new Pager(_box.one('.pagination .pages'), pagenum, 0);

        pager.on('pageChange', function(e) {
            callback = callback || LoadShopList;
            callback(_box, e.pn);

            !flag && setScrollTop( _box.one('.search-result').getRect()['top']- W('.float-menu').getRect().height );
        });
    }

    function createBigMap(p_flag){
        //如果是分页，那么就不用再去创建了。
        if(p_flag){
            var panel = tcb.alert("地图模式", W("#HdNeiCunShengJiModeMapTpl").html(), {'width':688, btn_name: '关闭',wrapId:"panel-modeMapindex"}, function(){
                map = null;
                return true;
            });
        }
        //reset
        try{map.destroy()}catch(ex){}
        document.getElementById("mode_map_container").innerHTML = "";

        map = new AMap.Map("mode_map_container",{
            view: new AMap.View2D({//创建地图二维视口               
               zoom:11               
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

        })
        

        //点击在线聊天时关闭弹出层
        W(document.body).delegate('.qim-go-talk', 'click', function(){
            panel.hide();
            map = null;
        });

        return map;
    }

    /**
     * 获取商店商品列表
     * @return {[type]} [description]
     */
    function getShopListParam(box){
        var _box = W(box);
        var ret = {
            'citycode': cur_citycode,
            'areaid': _box.one('.now-shangquan').attr('data-areaid') || 0,
            'pagesize' : 12
        }

        return ret;
    }

    //地址自动完成
    function initAddrSearch(){
        new AddrSuggest('.section-qinghui .addr-sug-place', {          
            'showNum' : 6,
            'onSelect' : function(txt){ getGeoPoi(txt, searchByPoi, '.section-qinghui'); },
            'requireCity' : function(){ return W('.city_trigger .now-city').html() ||'' }
        });

        new AddrSuggest('.section-neicun .addr-sug-place', {          
            'showNum' : 6,
            'onSelect' : function(txt){ getGeoPoi(txt, searchByPoi, '.section-neicun'); },
            'requireCity' : function(){ return W('.city_trigger .now-city').html() ||'' }
        });

        new AddrSuggest('.section-yingpan .addr-sug-place', {          
            'showNum' : 6,
            'onSelect' : function(txt){ getGeoPoi(txt, searchByPoi, '.section-yingpan'); },
            'requireCity' : function(){ return W('.city_trigger .now-city').html() ||'' }
        });

        W('.addr-search-form').bind('submit', function(e){
            e.preventDefault();
            var _this = W(this);
            var _box = _this.parentNode('.section-body');
            var ipt = W(this).one('[name="addr"]');
            var txt = ipt.val();
            if( txt =='' || txt == ipt.attr('data-default') ){
                ipt.focus();
                if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(ipt);              
            }else{
                getGeoPoi(txt, searchByPoi, _box);
                _this.one('.error').hide();
            }
        });

        function doSearch(box){
            LoadShopList(box, 0, true);
        }        

        //获取poi
        function getGeoPoi(addr, callback, box){
            var mapBox = W('<div id="geoMapBox"></div>').appendTo( W('body') ).hide();
            var _map = new AMap.Map("geoMapBox"); 
            // 加载地理编码插件 
            _map.plugin(["AMap.Geocoder"], function() {
                MGeocoder = new AMap.Geocoder({
                    city : _box.one('.now-city').html() || '',
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

                    callback(pos, box);
                });
                //逆地理编码
                MGeocoder.getLocation(addr);
            });
        }

        function searchByPoi(poi, box){
            var _box = W(box);
            if(poi == null){
                _box.one('.addr-search-form .error').show();
            }else{
                _box.one('.addr-search-form .error').hide();
                
                _box.attr('data-poi', QW.JSON.stringify(poi));
                doSearch(_box);
            }
        }
    }

    /**
     * 浮动菜单
     * @return {[type]} [description]
     */
    function fixedFloatMenu(){
        var menu = W('.float-menu');
        var timer;
        function _fixMenu(){            
            var oTop = W('.float-menu-place').getRect().top;

            if( Dom.getDocRect().scrollY > oTop ){
                !menu.hasClass('menu-fixed') && menu.addClass('menu-fixed');
            }else{
                menu.hasClass('menu-fixed') && menu.removeClass('menu-fixed');
            }

            var secList = W('.section-body');

            if(timer) clearTimeout(timer);

            timer = setTimeout( function(){
                for(var i=0, n=secList.length; i<n; i++){
                    var item = secList.item(i);
                    var itemMenu = W('.float-menu>li[data-for="'+item.attr('data-prdtype')+'"]');
                    var sTop = item.getRect().top;
                    if( Dom.getDocRect().scrollY > (sTop - W('.float-menu').getRect().height - 20) ){
                        itemMenu.addClass('on').siblings('.on').removeClass('on');
                    }
                }
            }, 100);
        }

        W(window).on('scroll', _fixMenu);
        W(window).on('laod', _fixMenu);
        W(window).on('resize', _fixMenu);

        menu.delegate('>li', 'click', function(){
            W(this).addClass('on').siblings('.on').removeClass('on');

            var go = W(this).attr('data-for');

            var disTop = W('.section-body[data-prdtype="'+go+'"]').getRect().top - W('.float-menu').getRect().height - 10;

            tcb.gotoTop.goPlace(disTop);
        });
    }
    

    // 加载商家列表
    LoadShopList('.section-qinghui', 0, true);
    setTimeout(function(){ LoadShopList('.section-neicun', 0, true); } , 1000);
    setTimeout(function(){ LoadShopList('.section-yingpan', 0, true);} , 2000);

    initAddrSearch();

    fixedFloatMenu();
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

function dealDistance(dis){
    if( dis< 1000){
        return dis + '米';
    }else{
        return (dis/1000).toFixed(2) + '公里';
    }
}