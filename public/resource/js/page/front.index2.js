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
