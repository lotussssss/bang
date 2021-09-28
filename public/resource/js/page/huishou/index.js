(function(){
    // 热门机型
    if (window._HOT_MODELS && window._HOT_MODELS.length) {
        var HotModels = window._HOT_MODELS;

        var HotModelsCache = window._BrandListCache['999999'] = [[], []];
        HotModels.forEach(function(item, i){
            HotModelsCache[0].push({
                'img_url': item['img'],
                'model_alis': item['name'],
                'model_id': i,
                'sub_arr': ['placeholder'],// 随便加一个属性用来占位（这个属性木有其他用处），表示当前model还有子model
                'pid': 0,
                'rec_price': item['price']
            });

            var SubModels = item['sub_model'];
            if (SubModels && SubModels.length) {
                SubModels.forEach(function (sub_item) {
                    HotModelsCache[1].push({
                        'img_url': sub_item['img'],
                        'model_alis': sub_item['name'],
                        'model_id': sub_item['model_id'],
                        'pid': i
                    });
                });
            }
        });
    }
}());

// 回收--首页
Dom.ready(function(){
    // 绑定事件
    tcb.bindEvent(document.body, {
        // 空品牌，品牌占位块
        '.brand-box .brand-item-empty': function(e){
            e.preventDefault();
        },
        // 选择品牌
        '.brand-box .brand-item': {
            'click': function (e) {
                e.preventDefault();

                var wMe = W(this),
                    wBrandBox = wMe.ancestorNode ('.brand-box')
                // 收起更多
                if(wMe.hasClass('brand-item-up')) {
                    var wDefaultLast = wBrandBox.query('.brand-item-default-last');

                    wDefaultLast.nextSiblings('a').hide();
                    wDefaultLast.nextSiblings('.brand-item-more').show();
                    return
                }

                // 更多品牌
                if (wMe.hasClass('brand-item-more')) {
                    wMe.hide().siblings('a').show();
                }
                // 选择品牌
                else {
                    wMe.addClass('brand-item-curr').siblings('.brand-item-curr').removeClass('brand-item-curr');

                    var params = {
                        'bid': wMe.attr('data-bid'),
                        'pid': 0
                    };
                    var wModelWrap = wMe.ancestorNode('.hs-f-content-brand').one('.base-brand-model-box');
                    if(wBrandBox.hasClass('brand-box-mobile')){
                        params['category_id'] = '1'
                        showModelList(wModelWrap, params, false);
                    }else if(wBrandBox.hasClass('brand-box-notebook')){
                        params['category_id'] = '10'
                        getNotebookModelList(wModelWrap, params, false);
                    }
                }

                tcb.gotoTop.goPlace(W('.bd-content').getRect()['top']);

                try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
            }
        },
        //展示某品牌所有的型号
        '.brand-model-box .show-brand-all' : function(e){
            e.preventDefault();

            var wMe = W(this);
            var params = {
                'bid': wMe.attr('data-bid'),
                'pid': +wMe.attr('data-pid')||0,
                'step': +wMe.attr('data-step')||0,
                'category_id': +wMe.attr('data-category-id')||0
            };

            var wModelWrap = wMe.ancestorNode('.brand-model-box');
            if (params.category_id=='10'){
                getNotebookModelList(wModelWrap, params, true)
            } else {
                showModelList(wModelWrap, params, true);
            }

            try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
        },
        // 选择机型（有评估地址，直接跳到评估地址，否则进入子分类）
        '.brand-model-box .check-item': function(e){
            var wMe = W(this),
                m_id = wMe.attr('data-id');

            if(wMe.attr('href')=='#'|| m_id){
                e.preventDefault();

                //var hash = tcb.parseHash(window.location.hash);

                var params = {
                    'bid': wMe.attr('data-bid'),
                    'pid': +m_id || 0,
                    'step': +wMe.attr('data-step') || 0,
                    'category_id': +wMe.attr('data-category-id')||0
                };
                var wModelWrap = wMe.ancestorNode('.brand-model-box');
                if (params.category_id=='10'){
                    getNotebookModelList(wModelWrap, params, true)
                } else {
                    showModelList(wModelWrap, params, true);
                }

                // 热收机型
                if (wModelWrap.hasClass('hs-hot-model-list')){
                    wModelWrap.appendChild('<a class="check-item-back" data-bid="999999" href="#">返回</a>');
                } else {
                    tcb.gotoTop.goPlace(W('.bd-content').getRect()['top']);
                }
            }

            try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
        },
        // 热门机型返回
        '.hs-hot-model-list .check-item-back': function (e) {
            e.preventDefault();

            var wMe = W(this);

            var params = {
                'bid': wMe.attr('data-bid'),
                'pid': 0,
                'step': 0,
                'category_id' : '1'
            };
            var wModelWrap = wMe.ancestorNode('.brand-model-box');
            showModelList(wModelWrap, params, true);

            try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
        },
        // 搜索返回
        '.search-brand-model-box .check-item-back': function(e){
            e.preventDefault();

            var wMe = W(this),
                wRecycleCateTab = W ('.recycle-cate-tab')

            wMe.ancestorNode('.search-brand-model-box').hide();

            wRecycleCateTab.show();
            var wItemSelected = wRecycleCateTab.query('.item-selected'),
                cate_id = '1'
            if (wItemSelected&&wItemSelected.length){
                cate_id = wItemSelected.attr('data-cate-id')
            }

            if (cate_id=='1'){
                W('.brand-box-mobile').show()
            } else if(cate_id=='10'){
                W('.brand-box-notebook').show()
            }
            W ('.base-brand-model-box').show()

            tcb.gotoTop.goPlace(W('.bd-content').getRect()['top'])

            try{ W(document).fire('myresize');}catch(ex){}	//resize page happen

        },
        // 切换回收类别（1：手机；2：笔记本；3：家电；）
        '.recycle-cate-tab .item': function(e){
            e.preventDefault()

            var wMe = W(this)

            //if (wMe.hasClass('item-selected')){
            //    return
            //}
            wMe.addClass('item-selected').siblings('.item-selected').removeClass('item-selected')

            var cate_id = wMe.attr('data-cate-id')

            var
                // wModelWrap = wMe.ancestorNode ('.hs-f-content-brand').one ('.base-brand-model-box'),
                wBrandBox = W ('.brand-box'),
                wBrandBoxM = W ('.brand-box-mobile'),
                wBrandBoxPc = W ('.brand-box-notebook'),
                wBaseBrandModelBox = W ('.base-brand-model-box'),
                wSearchBrandModelBox = W ('.search-brand-model-box'),
                wBrandItemCurr, params

            wBrandBox.hide()
            wSearchBrandModelBox.hide()

            if(cate_id=='1'){
                // 手机
                wBrandBoxM.show()
                wBaseBrandModelBox.show()

                wBrandItemCurr = wBrandBoxM.query ('.brand-item-curr')
                if (wBrandItemCurr && wBrandItemCurr.length) {
                    params = {
                        'bid' : wBrandItemCurr.attr ('data-bid'),
                        'pid' : 0,
                        'step': 0,
                        'category_id': cate_id
                    }
                    showModelList (wBaseBrandModelBox, params, false)
                } else {
                    wBaseBrandModelBox.html('')

                    try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
                }
            } else if(cate_id=='10') {
                // 笔记本
                wBrandBoxPc.show ()
                wBaseBrandModelBox.show ()

                wBrandItemCurr = wBrandBoxPc.query ('.brand-item-curr')
                if (wBrandItemCurr && wBrandItemCurr.length) {
                    params = {
                        'bid' : wBrandItemCurr.attr ('data-bid'),
                        // 'bid' : 10,
                        'step': 0,
                        'category_id': cate_id
                    }
                    getNotebookModelList (wBaseBrandModelBox, params, false)
                } else {
                    wBaseBrandModelBox.html('')

                    try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
                }

            } else {
                // 白色家电
                wBrandBox.hide ()
                wBaseBrandModelBox.show ()

                getWhiteGoodsModelList(wBaseBrandModelBox)
            }
        }
    });

    // 手机型号搜索
    W('#brandSearchForm').on('submit', function(e){
        e.preventDefault();

        var wIpt = W('#phoneBrandIpt');

        var kw = wIpt.val().trim();
        if(kw.length>0){
            var models = window._SerachCache[kw];
            if (models) {
                var params = {
                    'bid': -1,
                    'pid': 0,
                    'step': 0
                };
                var wWrap = W('.search-brand-model-box');
                wWrap.show();
                renderModelList(wWrap, models, params, true);

                wWrap.appendChild('<a class="check-item-back" data-for="search" href="#">返回</a>');

                W('.brand-box').hide();
                W('.base-brand-model-box').hide();
                W('.recycle-cate-tab').hide();
                W('#phoneBrandIpt').blur();

                try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
            } else {
                QW.Ajax.get('/huishou/aj_get_sj_search/?keyword=' + encodeURI(kw) +( _inclient? '&inclient=1' : '' ) +( _from? '&from='+_from : '' ) , function(data){

                    data = QW.JSON.parse(data);

                    if(data.errno){
                        alert('抱歉，搜索失败，请稍后再试。'+data.errmsg);
                    }else{
                        models = data.result.data;
                        window._SerachCache[kw] = models;

                        var params = {
                            'bid': -1,
                            'pid': 0,
                            'step': 0
                        };
                        var wWrap = W('.search-brand-model-box');
                        wWrap.show();
                        renderModelList(wWrap, models, params, true);

                        wWrap.appendChild('<a class="check-item-back" data-for="search" href="#">返回</a>');

                        W('.brand-box').hide();
                        W('.base-brand-model-box').hide();
                        W('.recycle-cate-tab').hide();
                        W('#phoneBrandIpt').blur();
                    }

                    try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
                });
            }
        } else {
            wIpt.shine4Error();
        }

    });


    /**
     * @param params  目前包含3个参数：bid，品牌id，pid，父分类id，step，当前步骤
     * @param showall 是否显示全部项，默认不显示
     */
    /**
     * 显示手机型号列表
     *
     * @param wWrap   手机型号列表容器（必须参数）
     * @param params  目前包含3个参数：bid，品牌id，pid，父分类id，step，当前步骤
     * @param showall 是否显示全部项，默认不显示
     */
    function showModelList(wWrap, params, showall){
        var bid = params['bid'];

        if(window._BrandListCache[bid]){

            var models = window._BrandListCache[bid];
            renderModelList(wWrap, models, params, showall);
        }else{
            var request_url = tcb.setUrl2('/huishou/getModels', { 'id':bid })
            QW.Ajax.get(request_url , function(data){
                data = QW.JSON.parse(data);

                if(!data.errno){

                    var models = data.result.data;
                    window._BrandListCache[bid] = models;
                    renderModelList(wWrap, models, params, showall);
                }
            });
        }
    }
    /**
     * 输出型号列表
     *
     * @param wWrap 型号输出容器
     * @param models_arr 型号列表
     * @param params 目前包含3个参数：bid，品牌id，pid，父分类id，step，当前步骤
     * @param showall 是否显示全部项，默认不显示
     */
    function renderModelList(wWrap, models_arr, params, showall){
        wWrap = wWrap || W('.brand-model-box');
        var bid = params['bid'],
            pid = +params['pid'] || 0,
            step = +params['step'] || 0,
            category_id = +params['category_id'] || 0,
            models = models_arr[step],
            max_step = models_arr.length-1;

        var str = '';
        var SHORT_SHOW_NUM = 15;
        var max = showall? 99999 : SHORT_SHOW_NUM;

        if(!models || models.length==0){
            wWrap.html('<p style="padding:50px; text-align:center; font-size:14px;">暂无结果。</p>')
        }else{

            var count = 0
            for(var i=0; i<models.length; i++){
                var item = models[i];
                item.pid = item.pid || 0;

                // 参数的pid和数据的pid相等
                if(item.pid==pid){
                    count++
                    if (count > max) {
                        continue
                    }

                    if (step < max_step && (item.sub_arr && item.sub_arr.length)) {
                        // 非最后一步，并且拥有子项

                        str += '<a class="check-item" href="#" ' +
                        'title="' + item.model_alis + '" ' +
                        'data-bid="' + bid + '" ' +
                        'data-step="' + (step + 1) + '" ' +
                        'data-id="' + item.model_id + '" ' +
                        'data-name="' + item.model_alis + '" ' +
                        'data-category-id="' + item.category_id + '">' +
                        '<div class="img"><img src="' + item.img_url + '" height="60"></div>' +
                        '<span class="phone-name">' + item.model_alis + '</span>' +
                        (item.rec_price ? ('<span class="phone-recprice">热收价 ￥' + item.rec_price + '</span>') : '') + '</a>'
                    } else {

                        str += '<a class="check-item" href="'+tcb.setUrl2('/huishou/pinggu/', { 'model_id': item.model_id })+'" title="'+item.model_alis+'">' +
                        '<div class="img"><img src="'+item.img_url+'" height="60"></div>' +
                        '<span class="phone-name">'+item.model_alis+'</span></a>'
                    }
                }
            }

            if(!showall && count>SHORT_SHOW_NUM){
                str += '<a class="check-item c5b0 show-brand-all" href="#" data-bid="'+bid+'" data-step="'+step+'" data-pid="'+pid+'" data-category-id="'+category_id+'">全部&gt;</a>';
            }

            wWrap.html(str)
        }

        try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
    }

    // 触发默认的品牌型号选择
    function activeDefaultBrandModel(){
        var wBrandBox = W('.brand-box').filter(function(el){return W(el).isVisible()}).first(), // 品牌
            wModelBox;// 型号

        if( !(wBrandBox && wBrandBox.query('.brand-item').length) ){
            return false;
        }
        var wFireItem;

        var hashQuery = tcb.parseHash();
        if(hashQuery['brand']){
            wFireItem = wBrandBox.query('[data-bid="'+hashQuery['brand']+'"]');
        }
        wFireItem = wFireItem&&wFireItem.length ? wFireItem : null;//W('.brand-list .brand-item').first();

        // 有要触发的型号
        if (wFireItem) {
            if (!wFireItem.isVisible()) {
                wBrandBox.query('.brand-item').show();
                wBrandBox.query('.brand-item-more').hide();
            }

            wFireItem.fire('click');

            if(!hashQuery['pid']){
                return false;
            }
            wModelBox = W('.base-brand-model-box');

            var loop_count = 0;
            setTimeout(function(){
                loop_count++;
                var args = arguments;
                var wModelItem = wModelBox.query('[data-id="'+hashQuery['pid']+'"]');
                if(!wModelItem.length&&loop_count<500){
                    setTimeout(function(){
                        args.callee();
                    }, 10);
                } else {
                    wModelItem.length && wModelItem.fire('click');
                }
            }, 500);
        }
    }

    /**
     * 获取笔记本机型列表
     * @param wWrap
     * @param params
     * @param showall
     */
    function getNotebookModelList(wWrap, params, showall){
        var bid = params['bid' ],
            cache_key = 'notebook-'+bid

        if(window._BrandListCache[cache_key]){

            var models = window._BrandListCache[cache_key]

            renderModelList(wWrap, models, params, showall)

        }else{
            var request_url = tcb.setUrl2('/huishou/getModels', { category:10, 'id':bid })
            QW.Ajax.get(request_url , function(data){
                data = QW.JSON.parse(data)

                if(!data.errno){

                    var models = data.result.data

                    window._BrandListCache[cache_key] = models

                    renderModelList(wWrap, models, params, showall)
                }
            })
        }
    }
    // 获取家电机型列表
    function getWhiteGoodsModelList(wWrap) {
        var html_fn = W('#JsHSWhiteGoodsModelListTpl').html().trim().tmpl(),
            html_st = html_fn()
        wWrap.html(html_st)
    }

    function init() {
        if (W('#phoneBrandIpt').length){
            new PlaceHolder('#phoneBrandIpt');
        }
        // 触发默认的品牌型号选择
        var wBrandBox = W('.brand-box');
        if( wBrandBox && wBrandBox.query('.brand-item').length > 0 ){
            activeDefaultBrandModel();
        }

        //回收轮播图
        var $banners = $("#nav-banners");
        if($banners.find(".swiper-slide").length > 1) {
            new Swiper('.swiper-container', {
                speed: 500,
                autoplay: 5000,
                paginationClickable: true,
                pagination: '.swiper-pagination',
                autoplayDisableOnInteraction: false,
                simulateTouch: false,
                loop: true
            });
        }

        // 首页带有hsuser参数，弹出扫描二维码查看订单弹窗
        var
            pathname = window.location.pathname,
            url_query = window.location.search.queryUrl(),
            hsuser = url_query['hsuser'] || false;

            pathname = tcb.trim(pathname, '/');

        if (hsuser && pathname=='huishou'){
            W('.js-myorder-enter-qrcode-trigger').fire('click');
        }

        //限时回收倒计时
        if (window._END_TIME && window._NOW_TIME && $('#js-hot-model-countdown').length){
            Bang.startCountdown (window._END_TIME, window._NOW_TIME,$('#js-hot-model-countdown'))
        }

    }
    init();
});
