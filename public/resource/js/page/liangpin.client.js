Dom.ready(function(){
    // 只在首页有效..
    var wIndexPage = W('.cpage-liangpin-index');
    if ( !(wIndexPage && wIndexPage.length) ){
        return;
    }

    var Bang = window.Bang = window.Bang || {};

    // 首页顶部轮播图
    new Bang.SimpleSlider ({
        container : '.head-slide',
        auto      : 5000,
        start     : 0,
        speed     : 300,
        nav_show  : true
    })
    //new TuiguangSlide('.head-slide', { showCtrl : true, autoRun:5000});

    //============== 推荐商品 ==============
    var HotProductListSlide = new TuiguangSlide('.tg-small', { animTime : 500 });

    // 输出商品
    function renderHotProductList(){

        var wListInner = W('#HotProductList');
        if(wListInner && wListInner.length){

            getData4HotProductList(function(result){

                var list_arr;
                var curtime = result['time'],
                    flash_list   = result['flash_list'],   // 闪购
                    jingpin_list = result['jingpin_list']; // 精品

                if ( !(flash_list && jingpin_list && flash_list.length + jingpin_list.length>3) ){
                    // 限时抢 和 精品商品总数不大于3个，那么左右滑动按钮不可点

                    var
                        $Wrap = wListInner.ancestorNode('.tg-small')
                    $Wrap.query('.slide-go-left').addClass('disabled')
                    $Wrap.query('.slide-go-right').addClass('disabled')
                }

                // 闪购
                if(flash_list && flash_list.length) {
                    _forHotFlash(flash_list, curtime, wListInner);
                    if(flash_list.length<5 && jingpin_list && jingpin_list.length){
                        _forHotJingpin(jingpin_list, wListInner, true);
                    }
                }
                // 精品
                else if (jingpin_list && jingpin_list.length) {
                    _forHotJingpin(jingpin_list, wListInner);
                }

            });

        }
    }
    // 精品
    function _forHotJingpin(jingpin_list, wListInner, flag){
        var list_arr = jingpin_list;

        var html_str = W('#JsHotProductListTpl').html().trim().tmpl()({
            'list': list_arr
        });

        if(flag){
            wListInner.insertAdjacentHTML('beforeend', html_str);
        } else {
            wListInner.html(html_str);
        }

        HotProductListSlide.resetBoxSize();

    }
    // 限时抢
    function _forHotFlash(flash_list, curtime, wListInner){
        var list_arr = flash_list;
        var html_str = W('#JsFlashProductListTpl').html().trim().tmpl()({
            'list': list_arr
        });

        wListInner.html(html_str);

        HotProductListSlide.resetBoxSize();

        // 服务器当前时间(精确到毫秒)
        curtime = Date.parse(curtime.replace(/-/g, '/')) || (new Date()).getTime();
        // 遍历倒计时
        wListInner.query('.countdown').forEach(function(el, i){
            var wEl = W(el),
                curproduct = list_arr[i], // 和当前计时器对应的商品信息
                starttime = curproduct['flash_start_time'].replace(/-/g, '/'),//'2015-11-09 18:00:40',//
                endtime   = curproduct['flash_end_time'].replace(/-/g, '/');//'2015-11-09 16:22:40';//
            starttime = Date.parse(starttime) || 0;
            endtime   = Date.parse(endtime) || 0;
            var $skill = $(el).parent().find(".seckill");

            // 开始前倒计时
            if (!curproduct['flash_saling'] && curtime<starttime) {
                wEl.addClass('countdown-start-prev')
                    .attr('data-descbefore', '距开始')

                Bang.startCountdown(starttime, curtime, wEl, {
                    'end': function(){
                        wEl.ancestorNode('.slide-item').query('.p-buy-disabled').removeClass('p-buy-disabled').html('立即抢购');

                        wEl.removeClass('countdown-start-prev')
                            .attr('data-descbefore', ' ')
                        Bang.startCountdown(endtime, starttime, wEl, {
                            'end': function(){
                                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                                wEl.html('已售出').addClass('countdown-end-next');
                                $skill.hide();
                            }
                        });
                    }
                });

            }
            // 抢购进行中&商品未被拍下
            else if (curproduct['flash_saling']==1 && curproduct['flash_status']=='saling' && curtime<endtime) {

                wEl.removeClass('countdown-start-prev')
                    .attr('data-descbefore', ' ')
                Bang.startCountdown(endtime, curtime, wEl, {
                    'end': function(){
                        wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');
                        wEl.html('已售出').addClass('countdown-end-next');
                        $skill.hide();
                    }
                });

            }
            else {
                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                wEl.html('已售出').addClass('countdown-end-next');
                $skill.hide();
            }

        });
    }
    // 获取商品数据
    function getData4HotProductList(callback){
        var request_url = '/youpin/doGetFlashSaleGoods',
            request_params = {};
        QW.Ajax.get(request_url, request_params, function(res){
            var result = [];
            res = JSON.parse(res);
            if (!res['errno']) {
                result = res['result'];
            }

            typeof callback==='function' && callback(result);
        });
    }
    renderHotProductList();

    tcb.bindEvent(document.body, {
        // 秒杀商品
        '#HotProductList .slide-item': {
            'click': function (e) {
                var wMe = W(this),
                    wTarget = W(e.target);

                if (!(wTarget.ancestorNode('a').length || wTarget[0].nodeName.toLowerCase() == 'a')) {
                    wMe.query('.slide-img a').click();
                }
            },
            'mouseenter': function (e) {
                var
                    wMe = W(this)

                wMe.addClass('slide-item-hover')

            },
            'mouseleave': function (e) {
                var
                    wMe = W(this)

                wMe.removeClass('slide-item-hover')

            }
        },
        // 商品列表
        '.product-list .p-item': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('p-item-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.removeClass('p-item-hover');
            }
        },
        //100元优惠券
        '.coupon-ewm':function (e) {
            e.preventDefault()

            tcb.panel('','<div><img class="coupon-ewm-img" src="https://p3.ssl.qhmsg.com/t01ffa9b3b51ada52f6.png" alt=""></div>',{
                "className": "panel-coupon-ewm panel-tom01"
            })
        }
    })
})

;(function(){
    // 只在首页和搜索页有效..
    if( !(W('.cpage-liangpin-index').length||W('.cpage-liangpin-search').length) ){
        return ;
    }

    var __nofilter = window.__nofilter || false;
    //var AttrList = window.attr_list||[];
    var AttrList = [];
    // 商品缓存
    var CacheProduct = {
        "pn": 0, // 当前页码
        "max_pn": 0, // 最大页码
        "loading": false // 是否正在加载商品
    };
    // [['keyword',''], ['pn','0'], ['brand_id',''], ['model_id',''], ['price',''], ['attr[]','容量'], ['attr[]','网络'], ['attr[]','颜色']]
    var DefaultParams = [['keyword',''], ['pn','0'], ['brand_id',''], ['model_id',''], ['price',''], ['attr[]',''], ['attr[]',''], ['attr[]','']];
    var DefaultParamsSplitLength = 2;
    //if(AttrList && AttrList.length){
    //    AttrList.forEach(function(item){
    //        DefaultParams.push([item['attr_var'],'']);
    //    });
    //}
    // 判断是否正在加载商品列表
    function isLoading(){
        return CacheProduct['loading'];
    }
    /**
     * 设置加载状态
     * @param status
     */
    function setLoadingStatus(status){
        CacheProduct['loading'] = false
        if (status){
            CacheProduct['loading'] = true

            W('.product-list').insertAdjacentHTML('beforeend', '<li id="ProductLoading" style="width: 100%;clear:both;text-align: center;line-height: 32px;">加载中...</li>');
        } else {
            W('#ProductLoading').removeNode()
        }
    }
    /**
     * 获取总页码数
     * @returns {*}
     */
    function getMaxPageNum(){
        return CacheProduct['max_pn'];
    }
    /**
     * 设置最大的页码
     * @param product_total
     */
    function setMaxPageNum(product_total, flag_pn){
        product_total = parseInt(product_total, 10) || 0;
        if(flag_pn){
            CacheProduct['max_pn'] = 4 // product_total;
        } else {
            CacheProduct['max_pn'] = 4 // product_total ? Math.ceil(product_total/12) : 0;
        }
    }
    /**
     * 获取当前页码
     * @returns {number}
     */
    function getPageNum(){
        return CacheProduct.pn || 0;
    }
    /**
     * 设置当前页码
     * @param num
     */
    function setPageNum(num){
        CacheProduct.pn = num || 0;

        setRequestParams(null, num, 'pn');
    }
    /**
     * 重置当前页码为0
     */
    function resetPageNum(){
        setPageNum(0);
    }
    /**
     * 获取AttrList
     * @returns {*|Array}
     */
    function getAttrList(){
        return AttrList||[];
    }
    /**
     * 获取请求参数
     * @param pos
     * @returns {*[]|Array} pos参数未传时，返回所有参数，pos为字符串时，返回对应key的val，pos为数字的时候返回对应的key的val，没有获取到值返回null
     */
    function getRequestParams(pos){
        var ret = DefaultParams || [];
        if(typeof pos !== 'undefined'){
            if(typeof pos === 'string'){
                var flag_none = true;
                ret.forEach(function(el){
                    if(el[0]===pos){
                        flag_none = false;
                        ret = el[1];
                    }
                });
                if(flag_none){
                    ret = null;
                }
            } else {
                ret = ret[pos] || null;
            }
        }

        return ret;
    }
    /**
     * 设置请求参数
     * @param pos   当pos为null的时候，只能用key来设置val
     * @param val
     * @returns {*[]}
     */
    function setRequestParams(pos, val, key){
        var params = DefaultParams;

        if(pos===null && key){
            var flag_add = true;
            params.forEach(function(el){
                if(el[0]==key){
                    flag_add = false;
                    el[1] = val.toString();
                }
            });
            if(flag_add){
                params.push([key, val.toString()]);
            }
        } else{
            if(!(params[pos] instanceof Array)){
                params[pos] = [];
            }
            if(params[pos].length<2){
                return false;
            }
            if(key){
                params[pos][0] = key;
            }
            params[pos][1] = val.toString();
        }

        return params;
    }
    /**
     * 删除请求参数
     * 没有设置key和val，将清除所有参数；
     * 设置了key没有设置val，直接清除等于key的参数值；
     * 设置了key和val，那么清除等于key以及val的参数值；
     * @param key
     * @param val
     */
    function delRequestParams(key, val){
        var params = DefaultParams;

        if(!arguments.length){
            params.forEach(function(el){
                el[1] = '';
            });
        }
        if(typeof key === 'number'){ // 数字索引，直接定位位置
            if(params[key]){
                params[key][1] = '';
            }
        } else {
            params.forEach(function(el){
                if(el[0] == key){
                    if(arguments.length>1){
                        if(el[1]==val){
                            el[1] = '';
                        }
                    } else {
                        el[1] = '';
                    }
                }
            });
        }
    }
    /**
     * 设置筛选器的html模板
     * @param filter_datas
     * @param $wrap
     */
    function setProductFilterHtml(filter_datas, $wrap){
        $wrap = $wrap || W('.search-filter');
        var tmpl_fn  = W('#LiangpinClientProductFilterTpl').html().trim().tmpl(),
            tmpl_str = tmpl_fn(filter_datas);

        $wrap.html(tmpl_str);
    }
    /**
     * 根据当前参数获取商品列表
     * @param params // params格式:[['keyword',''], ['pn','0'], ['brand_id','品牌id'], ['model_id','型号id'], ['price','价格'], ['attr[]','容量'], ['attr[]','颜色']]
     */
    function getProductList(){
        var params = getRequestParams(),
            params_key = params.toString();
        //console.log(params_key)

        setLoadingStatus(true);

        var Product = CacheProduct[params_key];
        if(Product){
            if(!Product['pn'] && !__nofilter){
                setProductFilterHtml(Product['filter']);
            }
            setMaxPageNum(Product['count']);

            renderProductListHtml(Product['product'], W('.product-list'), Product['pn']);

            //if (!(Product['count']>0)) {
            //    wishFormSubmit();
            //}

            setPageNum(Product['pn']+1);

            setLoadingStatus(false);
        } else {
            var params_obj = {};
            params.forEach(function(item, i){
                var key = item[0],
                    val = item[1];
                if(val){
                    val = encodeURIComponent(val);
                    if(params_obj[key]){
                        if(!(params_obj[key] instanceof Array)){
                            params_obj[key] = [params_obj[key]];
                        }
                        if(params_obj[key].indexOf(val)==-1){
                            params_obj[key].push(val);
                        }
                    } else {
                        params_obj[key] = val;
                    }
                }
            });
            //因为价格加密兼容不了ie低版本  所以增加参数区别
            params_obj.s = 'b'
            QW.Ajax.get('/youpin/aj_get_goods', params_obj, function(res){
                //try{
                    res = JSON.parse(res);

                    if(!res['errno']) {
                        var result = res['result'];

                        // 设置最大页码
                        setMaxPageNum(result['goods_count']);

                        var pn = 0;
                        if(params_obj['pn'] && parseInt(params_obj['pn'], 10)>0){
                            pn = parseInt(params_obj['pn'], 10);
                        }

                        var filter_datas = null;
                        // 页码pn为0的时候才刷新过滤选择
                        if(!pn && !__nofilter){
                            genAttrList({
                                'attr_list': result['attr_list']||[],
                                'brand_list': result['brand_list']||[],
                                'search_model_ids': result['search_model_ids']||[],
                                'price_list': result['price_list']||[]
                            }, DefaultParamsSplitLength);
                            var orig_attr_list = getAttrList();
                            var selected_attr_list = [],
                                attr_list = [];
                            params.forEach(function(item, i){
                                var key = item[0],
                                    val = item[1];
                                if(key==='keyword' && val){
                                    selected_attr_list.push({
                                        'pos': i,
                                        'val': val,
                                        'key': key,
                                        'attr': '关键词',
                                        'txt': val
                                    });
                                }
                                var pos = i-DefaultParamsSplitLength;
                                if(pos>-1 && orig_attr_list[pos]){
                                    var filter_item;
                                    if(val && (filter_item = orig_attr_list[pos]['list'].filter(function(el){return el['attr_val_id']==val;})[0]) && filter_item['attr_val_name']){
                                        selected_attr_list.push({
                                            'pos': i,
                                            'val': val,
                                            'key': key,
                                            'attr': orig_attr_list[pos]['attr_name'],
                                            'txt': filter_item['attr_val_name']
                                        });
                                    } else {
                                        attr_list.push(orig_attr_list[pos]);
                                    }
                                }
                            });

                            filter_datas = {
                                'count': result['goods_count'],
                                'selected_attr_list': selected_attr_list,
                                'attr_list': attr_list
                            };
                            //console.log(Object.stringify(filter_datas))
                            setProductFilterHtml(filter_datas);
                        }

                        var product_datas = {
                            'good_list': result['good_list'],
                            'col': 4
                        };
                        renderProductListHtml(product_datas, W('.product-list'), pn);

                        //if (!(result['goods_count']>0)) {
                        //    wishFormSubmit();
                        //}


                        if(filter_datas){
                            CacheProduct[params_key] = {
                                'pn': pn,
                                'count': result['goods_count'],
                                'filter': filter_datas,
                                'product': product_datas
                            };
                        } else {
                            CacheProduct[params_key] = {
                                'pn': pn,
                                'count': result['goods_count'],
                                'product': product_datas
                            };
                        }

                        setPageNum(pn+1);
                    }

                //} catch (ex){ }

                setLoadingStatus(false);
            });
        }
    }

    function renderFilterHtml(filter_datas, $wrap, pn){

    }

    /**
     * 获取组装后的产品列表html
     * @param product_datas
     * @returns {string}
     */
    function getProductListHtml(product_datas){
        var html = '';

        var tmpl_fn = W('#JsLiangpinClientProductItemTpl').html().trim().tmpl();

        html = tmpl_fn(product_datas);

        return html;
    }
    /**
     * 输出商品列表的html
     * @param product_datas
     * @param $wrap
     * @param pn
     */
    function renderProductListHtml(product_datas, $wrap, pn){
        if(typeof pn === 'undefined'){
            if(QW.ObjectH.isArrayLike($wrap)){
                pn = 0;
            } else {
                pn = parseInt($wrap);
                pn = pn ? pn : 0;
                $wrap = null;
            }
        }
        $wrap = $wrap || W('.product-list');

        product_datas['lastpage'] = false;

        // 最后一页
        if((getPageNum() == getMaxPageNum()-1)){
            product_datas['lastpage'] = true;
        }
        var html_str = getProductListHtml(product_datas);

        if(pn){
            $wrap.insertAdjacentHTML('beforeend', html_str);
        } else {
            $wrap.html(html_str);
        }
        // 绑定许愿事件（有没有商品都会有许愿框）
        // 优品许愿
        tcb.lpWishFormSubmit()
    }

    /**
     * 重新组装生成通用可用的AttrList
     * @param params
     * @returns {Array}
     */
    function genAttrList(params, pos){
        var attr_list = params['attr_list'],
            brand_list = params['brand_list'],
            search_model_ids = params['search_model_ids'],
            price_list = params['price_list'];

        pos = pos || 0;

        var new_attr_list = [];

        // 品牌
        var temp_brand_list = {
            'pos': pos,
            'attr_var': 'brand_id',
            'attr_name': '品牌',
            'list': []
        };
        if(QW.ObjectH.isArray(brand_list)){
            brand_list.forEach(function(item, i){
                temp_brand_list['list'].push({
                    'attr_val_id': item['key'],
                    'attr_val_name': item['name']
                });
            });
        } else {
            QW.ObjectH.map(brand_list, function(v, k){
                temp_brand_list['list'].push({
                    'attr_val_id': k,
                    'attr_val_name': v['name']
                });
            });
        }
        new_attr_list.push(temp_brand_list);

        // 型号
        var temp_model_list = {
            'pos': pos+1,
            'attr_var': 'model_id',
            'attr_name': '型号',
            'list': []
        };
        search_model_ids.forEach(function(item, i){
            temp_model_list['list'].push({
                'attr_val_id': item['model_id'],
                'attr_val_name': item['model_name']
            });
        });
        new_attr_list.push(temp_model_list);

        // 价格
        var temp_price_list = {
            'pos': pos+2,
            'attr_var': 'price',
            'attr_name': '价格',
            'list': []
        };
        if(QW.ObjectH.isArray(price_list)){
            price_list.forEach(function(item, i){
                temp_price_list['list'].push({
                    'attr_val_id': item['key'],
                    'attr_val_name': item['name']
                });
            });
        } else {
            QW.ObjectH.map(price_list, function(v, k){
                temp_price_list['list'].push({
                    'attr_val_id': k,
                    'attr_val_name': v
                });
            });
        }
        new_attr_list.push(temp_price_list);

        attr_list.forEach(function(item, i){
            new_attr_list.push({
                'pos': pos+new_attr_list.length,
                'attr_var': 'attr[]',
                'attr_name': item['attr_name'],
                'list': item['list']
            });
        });

        AttrList = new_attr_list;
        return new_attr_list;
    }

    //DOMReady
    Dom.ready(function(){
        /**
         * 页面初始化
         */
        function init(){
            var search_query = window.location.search.queryUrl();
            if(search_query){
                var params = getRequestParams();

                params.forEach(function(item, i){
                    if(search_query[item[0]]){
                        setRequestParams(i, search_query[item[0]]);
                    }
                });
            }
            //console.log(getRequestParams())
            // 初始化获取商品列表
            getProductList();

            var wProductList = W('.liangpin-main .product-list'),
                doc_h = W('body').getRect()['height' ],
                foot_h = W('.foot-line').getRect()['height'];
            // W('.liangpin-main').on('scroll', function(e){
            W('.cpage-liangpin-index .c-main').on('scroll', function(e){
                if( !isLoading() && (getPageNum() < getMaxPageNum()) && (doc_h-foot_h+80>wProductList.getRect()['bottom']) ){
                    // 获取商品列表
                    getProductList();
                }
            });
        }
        init();

        tcb.bindEvent(document.body, {
            // 搜索筛选项
            '.js-search-filter .filter-item': function(e){
                e.preventDefault();

                var wMe = W(this),
                    wParent = wMe.ancestorNode('.filter-choice');

                var pos = parseInt(wParent.attr('data-pos'))||0,
                    params_key = wParent.attr('data-var'),
                    params_val = wMe.attr('data-value');

                if(params_val){
                    // 设置指定位置参数值（此处用pos比key更优，因为key名称有可能重复）
                    setRequestParams(pos, params_val);
                    resetPageNum();

                    // 获取商品列表
                    getProductList();
                }
            },
            // 删除筛选项
            '.js-search-filter .del': function(e){
                e.preventDefault();

                var wMe = W(this),
                    wParent = wMe.ancestorNode('.selected-item');

                var pos = parseInt(wParent.attr('data-pos'))||0, // 由于有重名属性（数组类属性），所有使用pos有时候不准确，还是需要key和val来剔除
                    params_key = wParent.attr('data-var'),
                    params_val = wParent.attr('data-value');

                // 删除此过滤参数
                delRequestParams(params_key, params_val);
                resetPageNum();

                // 获取商品列表
                getProductList();
            },
            '.product-list .item': {
                'mouseenter': function(e){
                    var wMe = W(this);

                    wMe.addClass('cur');
                },
                'mouseleave': function(e){
                    var wMe = W(this);

                    wMe.removeClass('cur');
                }
            }
        });

    });

}());
