Dom.ready(function(){

    /**
     * 点击统计
     * @param  {string} type 点击的类型
     * @return {[type]}      [description]
     */
    function clickLog(type){
        new Image().src="/aj/gshopzixun/?ctype="+type+"&from=" + (window.location.pathname);
    }
    // 打点
    function initClickLogUV(params){
        var defaults = {
            'f': window.location.href
        };
        params = params || {};
        params = QW.ObjectH.mix(defaults, params);

        tcb.bindEvent(document.body, {
            'a, .js-log-click': {
                'mousedown': function(e){
                    var me = e.target,
                        wMe = W(me),
                        val = wMe.val(),
                        str = wMe.html();
                    // class名称
                    params['cn'] = me.className;
                    // a标签的href值
                    params['ah'] = wMe.attr('href');
                    // 点击区域的内容
                    params['c'] = wMe.attr('title');
                    if (!params['c']) {
                        params['c'] = val ? val : (str ? str : '');
                    }
                    // 唯一logid
                    params['i'] = wMe.attr('id');
                    if (!params['i']) {
                        params['i'] = wMe.attr('logid') ? wMe.attr('logid') : '';
                    }

                    var encode_params = typeof params=='string' ? params : Object.encodeURIJson(params);

                    var request_url = BASE_ROOT+'aj/gshopmo/?'+encode_params;
                    QW.Ajax.get(request_url,function(){});
                }
            }
        });
    }
    initClickLogUV();

    function getMendianList(){
        var citycode = W('.site-shuju-mendian-city').attr('data-code'),
            keyword = window.g_keyword,
            pagesize = 12;

        var request_url = BASE_ROOT + 'client/search/?async=1&city_id='+citycode+'&area_id=&quan_id=&service_id=0&type_id=0&keyword='+keyword+'&pagesize='+pagesize+'&show_mode=product&tag_id=0&pn=0';
        QW.Ajax.get(request_url, function(responceText){
            // try{
                var res = QW.JSON.parse(responceText);
                if (res['errno']==0) {
                    t_html = '';
                    if (res['data']&&res['data'].length) {
                        var data_params = {
                            'shop_data' : res['data']
                        };
                        var t_fn = W('#MendianItemTpl').html().trim().tmpl();
                        
                        t_html = t_fn(data_params);
                    }

                    var wMendianMore = W('.site-shuju-mendian-more, .site-shuju-mendian-more2'),
                        more_url = wMendianMore.attr('href').replace(/city_id=[^&]*/, 'city_id='+citycode);
                    wMendianMore.attr('href', more_url);

                    // t_html = '';
                    if (!t_html) {
                        t_html = '<div class="site-list-noitem"><span>抱歉，当前地区没找到解决<em>“'+keyword+'”</em>问题的门店，请点击<a href="'+more_url+'">更多</a>查找</span></div>';
                    }

                    W('.site-shuju-mendian-list').html(t_html);
                    W('.site-shuju-mendian-total-count').html(res['countnum'] ? '门店('+res['countnum']+'个)' : '门店');

                } else {}
            // }catch(ex){}
        });
    }
    getMendianList();


    var playerPanel;

    tcb.bindEvent(document.body, {
        // 搜索框操作
        '.address-search-form-ipt': {
            'focus': function(e){
                var wMe = W(this);

                if(wMe.hasClass('inactived')){
                    wMe.removeClass('inactived').val('');
                }
            },
            'blur': function(e){
                var wMe = W(this),
                    default_val = wMe.attr('default-value');

                if (wMe.val().trim()===''||default_val===wMe.val()) {
                    wMe.addClass('inactived').val(default_val);
                }
            }
        },
        //查看地图
        '.see-map': function(e){
            e.preventDefault();
            var el = W(this);

            new bigMap().show( el.attr('data-shopid') );
            
        },
        // 专家咨询/电话咨询
        '.zj-go-talk' : function(e){
            e.preventDefault();
            var wMe = W(this),
                qid = wMe.attr('data-id'),
                tel = wMe.attr('data-tel');

            // 在线且有专家
            if (qid && qid!=0) {
                if (ExpertChat&&ExpertChat.startChatByAjax) {
                    ExpertChat.startChatByAjax(qid, tel);

                    wMe.hasClass('zj-go-t2')? clickLog('zj_talk_expert') : clickLog('zj_talk_shop');
                }
            } else {
                tcb.panel('', '<div class="shop-phone-view-pannel"><div class="line"><span>店铺名称：</span><span>'+wMe.attr('data-shopname')+'</span></div><div class="line"><span>联系电话：</span><span class="lc1">'+wMe.attr('data-tel')+'</span></div><div style="height:30px;"></div><div class="line"><span class="lc2">联系我时，请说是在360同城帮看到的，谢谢！</span></div></div>', { 'width':380, 'height':180}, function(){return true;});

                var request_url = BASE_ROOT+'aj/gshopmo/?from='+W('#FromPageName').val()+'&shopid='+wMe.attr('data-shopid')+'&PT=zixun&mobile='+wMe.attr('data-tel');
                QW.Ajax.get(request_url,function(){});

                clickLog('zj_tel');

            }

        },
        '.play-video' : function(e){
            e.preventDefault();
            var config = {
                width:640,
                height:432,
                withMask: false,
                dragable: true
            }

            if(playerPanel && playerPanel.show){
                playerPanel.show();
            }else{
                playerPanel = tcb.panel(W('.play-video-text').html(), '<embed src="http://player.youku.com/player.php/sid/XNjkzODk0NDQw/v.swf" allowFullScreen="true" quality="high" width="640" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" flashvars="isAutoPlay=true"></embed>', config);
            }
        },
        '.site-left-nav a': function(e){
            e.preventDefault();

            // var target = e.target;
            // if (target.nodeName.toLowerCase()!=='a') {
            //     return false;
            // }

            var wT = W(this),
                pos = wT.attr('data-pos'),
                top_val = 0;

            var jieshao_top = W('.site-shuju-jieshao-left .site-h2').getRect()['top'],
                // gonglue_top = W('.site-shuju-gonglue .site-h2').getRect()['top'],
                // zhuanjia_top = W('.site-shuju-zhuanjia .site-h2').getRect()['top'],
                // mendian_top = W('.site-shuju-mendian .site-h2').getRect()['top'],
                footer_top = W('#doc-footer').getRect()['top'];
            var wGonglue  = W('.site-shuju-gonglue .site-h2'),
                wZhuanjia = W('.site-shuju-zhuanjia .site-h2'),
                wMendian  = W('.site-shuju-mendian .site-h2'),
                gonglue_top, zhuanjia_top, mendian_top;
            if (wGonglue.length) {
                gonglue_top  = wGonglue.getRect()['top'];
            }
            if (wZhuanjia.length) {
                zhuanjia_top = wZhuanjia.getRect()['top'];
            }
            if (wMendian.length) {
                mendian_top = wMendian.getRect()['top'];
            }
            switch(pos){
                case '1':
                    top_val = jieshao_top;
                    break;
                case '2':
                    top_val = gonglue_top;
                    break;
                case '3':
                    top_val = zhuanjia_top;
                    break;
                case '4':
                    top_val = mendian_top;
                    break;
                case '5':
                    top_val = footer_top;
                    break;
            }
            setScrollTop(top_val);
        },
        '.site-shuju-gonglue-kuaisujiejue-btn': function(e){
            e.preventDefault();

            var zhuanjia_top = W('.site-shuju-zhuanjia .site-h2').getRect()['top'];

            setScrollTop(zhuanjia_top);
        }

    });

    // 附近位置搜素
    W('#AddressSearchForm').on('submit', function(e){
        e.preventDefault();

        var wMe = W(this),
            wQueryInput = wMe.query('.address-search-form-ipt')
            search_query = wQueryInput.val().trim();
        
        new bigMap().getGeoPoi(search_query, function(d){

            if (!d) {
                alert('没有查找到您搜索的位置！');
                wQueryInput.val('').focus();
                return;
            }
            var request_url = window.location.pathname + '?isajax=json&lng='+d.lng+'&lat='+d.lat;
            QW.Ajax.post(request_url, function(resData){
                resData = typeof resData==='string' ? QW.JSON.parse(resData) : resData;
                if (!resData['errno']) {

                    var shop_lists = resData['result'];
                    if (shop_lists.length) {
                        var pos = 0,
                            dividend = 2,
                            item_len = shop_lists.length;

                        pos = item_len%dividend ? (item_len-item_len%dividend) : (item_len-dividend);

                        var item_fn   = W('#UserCardItem4').html().trim().tmpl(),
                            item_html = item_fn({
                                'card_items': shop_lists,
                                'pos': pos,
                                'dividend': dividend
                            });
                        var wList = W('.mb-right-a .card-list');
                        item_html = item_html+'<div class="card-item-nomore"><a href="'+BASE_ROOT+'search/?_isfix=0&ie=utf-8&f=tcb&stype=0&keyword=数据恢复&lng='+d.lng+'&lat='+d.lat+'&addr='+search_query+'" target="_blank">更多实体店铺&gt;&gt;</a></div>';
                        wList.html(item_html);
                    }

                } else {
                    alert(resData['msg']);
                }
            });

        });

    });
    
    //poi suggestion
    new AddrSuggest(W('#AddressSearchForm [name="address_search"]'), {
        'showNum' : 8,
        'onSelect' : function(txt){ setTimeout( function(){ W('#AddressSearchForm').fire('submit') }, 100); },
        'requireCity' : function(){ return W('.area-box-sel').html() || '' }
    });

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
            // console.log(e)
            W('.site-shuju-mendian-city').html(e.name.trim()).attr('data-code', e.city.trim());
            getMendianList();
            // location.href ="http://" +location.host + location.pathname + '?citycode='+e.city.trim();
        });
    }
    selectCity('.site-shuju-mendian-city-changebtn');


    /**
     * 获取滚动条的高度
     * @return {[type]} [description]
     */
    function getScrollTop(){
        var scrolltop = 0;
        if(window.pageYOffset){//这一条滤去了大部分， 只留了IE678
            scrolltop = window.pageYOffset;
        }else if(document.documentElement.scrollTop ){//IE678 的非quirk模式
            scrolltop = document.documentElement.scrollTop;
        }else if(document.body.scrollTop){//IE678 的quirk模式
            scrolltop = document.body.scrollTop;
        }

        return scrolltop;
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
    var wSiteLeftNav = W('.site-left-nav'),
        wSiteLeftNavA = wSiteLeftNav.query('a'),
        s_val = 30,
        c_val = W('.site-shuju-jieshao .site-h2').getRect()['top'];
    var wGonglue  = W('.site-shuju-gonglue .site-h2'),
        wZhuanjia = W('.site-shuju-zhuanjia .site-h2'),
        wMendian  = W('.site-shuju-mendian .site-h2'),
        gonglue_top, zhuanjia_top, mendian_top;
    if (wGonglue.length) {
        gonglue_top  = wGonglue.getRect()['top'];
    }
    if (wZhuanjia.length) {
        zhuanjia_top = wZhuanjia.getRect()['top'];
    }
    if (wMendian.length) {
        mendian_top = wMendian.getRect()['top'];
    }
    /**
     * 设置顶部tab的位置
     */
    function setBodyMenuPos(){
        var s_top = getScrollTop();
        
        if (s_top>c_val) {
            wSiteLeftNav.css({
                'top': s_top-c_val+s_val
            });
            if (s_top<gonglue_top) {
                wSiteLeftNavA.removeClass('cur').item(0).addClass('cur');
            } else if (s_top<zhuanjia_top) {
                wSiteLeftNavA.removeClass('cur').item(1).addClass('cur');
            } else if (s_top<mendian_top) {
                wSiteLeftNavA.removeClass('cur').item(2).addClass('cur');
            } else {
                wSiteLeftNavA.removeClass('cur').item(3).addClass('cur');
            }
        } else {
            wSiteLeftNav.css({
                'top': s_val
            });
            wSiteLeftNavA.removeClass('cur').item(0).addClass('cur');
        }
    }
    if (wSiteLeftNav.length) {
        W(window).on('scroll', setBodyMenuPos);
        setBodyMenuPos();
    }

});