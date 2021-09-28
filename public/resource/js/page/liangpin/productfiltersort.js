/**
 * 首页--商品的筛选和排序
 */
(function(){
    var wIndexPage = W('.page-liangpin-index');
    if ( !(wIndexPage && wIndexPage.length) ){
        return;
    }

    var __nofilter = window.__nofilter || false;
    var __nosort = window.__nosort || false;
    var __pager = window.__pager || false;
    // 当前条件下处理好的属性数据
    var AttrList = [];
    // 商品缓存
    var CacheProduct = {
        "pn": 0, // 当前页码
        "max_pn": 0, // 最大页码
        "loading": false // 是否正在加载商品
    };
    // 默认的排序参数格式（以及最多可能参数个数）：[['sort', '排序规则']]
    var DefaultParamsSort = [['sort', '']];
    // 默认的筛选参数格式（以及最多可能参数个数）：[['keyword',''], ['pn','0'], ['brand_id',''], ['model_id',''], ['price',''], ['attr[]','容量'], ['attr[]','网络'], ['attr[]','颜色']]
    var DefaultParams = [['keyword',''], ['pn','0'], ['brand_id',''], ['model_id',''], ['chengse',''], ['price',''], ['attr[]',''], ['attr[]',''], ['attr[]',''], ['attr[]',''], ['attr[]',''], ['attr[]',''], ['attr[]',''], ['attr[]','']];
    var DefaultParamsSplitLength = 2;

    /**
     * 获取当前的排序参数
     * @returns {*[]|Array}
     */
    function getSort(){
        return DefaultParamsSort || [];
    }
    /**
     * 设置指定key或者位置的排序规则
     * @param key
     * @param val
     */
    function setSort(key, val){
        var params = DefaultParamsSort || [];

        if(typeof key === 'number'){ // 数字索引，直接定位位置
            if(params[key]){
                params[key][1] = val;
            }
        } else {
            params.forEach(function(el){
                if(el[0] == key){
                    el[1] = val;
                }
            });
        }
    }
    /**
     * 判断是否正在加载商品列表
     * @returns {*}
     */
    function isLoading(){
        return CacheProduct['loading'];
    }
    /**
     * 设置加载状态
     * @param status
     */
    function setLoadingStatus(status){
        CacheProduct['loading'] = status ? true : false;
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
            CacheProduct['max_pn'] = product_total;
        } else {
            CacheProduct['max_pn'] =  product_total ? Math.ceil(product_total/12) : 0;
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

        // 额外设置page
        var page = tcb.queryUrl(window.location.search, 'page');
        if(page){
            setRequestParams(null, page, 'page')
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

        //return false;
        // 筛选方式改变，之前的模式不能使用
        $wrap = $wrap || W('.search-filter');
        var tmpl_fn  = W('#LiangpinSearchFilterTpl').html().trim().tmpl(),
            tmpl_str = tmpl_fn(filter_datas);

        $wrap.html(tmpl_str);
    }
    /**
     * 设置排序的html模板
     * @param sort_datas
     * @param $wrap
     */
    function setProductSortHtml(sort_datas, $wrap){
        $wrap = $wrap || W('.js-search-sort');
        var tmpl_fn  = W('#LiangpinSearchSortTpl').html().trim().tmpl(),
            tmpl_str = tmpl_fn(sort_datas);

        $wrap.html(tmpl_str);
    }
    /**
     * 根据当前参数获取商品列表
     * @param params // params格式:[['keyword',''], ['pn','0'], ['brand_id','品牌id'], ['model_id','型号id'], ['price','价格'], ['attr[]','容量'], ['attr[]','颜色']]
     */
    function getProductList(){
        var
            params = getRequestParams(),
            params_sort = getSort(),
            params_key = params.concat(params_sort).toString()
        //console.log(params_key)

        var params_obj = {};
        params.concat(params_sort).forEach(function(item, i){
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

        //var hash_str = QW.ObjectH.encodeURIJson(params_obj);
        //window.location.hash = hash_str;

        setLoadingStatus(true);

        var Product = CacheProduct[params_key];
        if(Product){
            if(Product['filter'] && !Product['pn'] && !__nofilter){
                setProductFilterHtml(Product['filter']);
            }

            if(Product['sort'] && !Product['pn'] && !__nosort){
                setProductSortHtml(Product['sort']);
            }

            renderProductListHtml(Product['product'], W('.search-result'), Product['pn']);

            if (!(Product['count']>0)) {
                // 优品许愿
                tcb.lpWishFormSubmit(W('.block-wish .wish-form'))
                //wishFormSubmit(W('.search-result .wish-form'));
            }

            setMaxPageNum(Product['count']);
            setPageNum(Product['pn']+1);

            productPager(Product['count'], Product['pn'], 12);

            setLoadingStatus(false);
        } else {
            QW.Ajax.get('/youpin/aj_get_goods', params_obj, function(res){
                //try{
                res = JSON.parse(res);

                if(!res['errno']) {
                    var result = res['result'];

                    var pn = 0;
                    if(params_obj['pn'] && parseInt(params_obj['pn'], 10)>0){
                        pn = parseInt(params_obj['pn'], 10);
                    }

                    var filter_datas = null;
                    var sort_datas = null;
                    // 页码pn为0的时候才刷新过滤选择
                    if(!pn && !__nofilter){
                        var
                            orig_attr_list = genAttrList ({
                                'attr_list'        : result[ 'attr_list' ] || [],
                                'brand_list'       : result[ 'brand_list' ] || [],
                                'search_model_ids' : result[ 'search_model_ids' ] || [],
                                'chengse_list'     : result[ 'chengse_list' ] || [],
                                'price_list'       : result[ 'price_list' ] || []
                            }, DefaultParamsSplitLength)

                        var // 被选中的属性
                            selected_attr_list = [],
                            attr_list = []
                        // 遍历请求参数列表
                        params.forEach(function(item, i){
                            var key = item[0],
                                val = item[1];
                            // 关键词
                            if(key==='keyword' && val){
                                selected_attr_list.push({
                                    'pos': i,
                                    'val': val,
                                    'key': key,
                                    'attr': '关键词',
                                    'txt': val
                                })
                            }
                            var
                                pos = i-DefaultParamsSplitLength
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
                    // 设置排序
                    if(!pn && !__nosort){
                        sort_datas = {
                            'sort': params_obj['sort'],
                            'count': result['goods_count']
                        };
                        setProductSortHtml(sort_datas);
                    }

                    var product_datas = {
                        'good_list': result['good_list'],
                        'col': 5 //3
                    };
                    renderProductListHtml(product_datas, W('.search-result'), pn);

                    if (!(result['goods_count']>0)) {
                        // 优品许愿
                        tcb.lpWishFormSubmit(W('.block-wish .wish-form'))
                        //wishFormSubmit(W('.search-result .wish-form'));
                    }

                    CacheProduct[params_key] = {
                        'pn': pn,
                        'count': result['goods_count'],
                        'filter': filter_datas,
                        'sort': sort_datas,
                        'product': product_datas
                    };

                    setMaxPageNum(result['goods_count']);
                    setPageNum(pn+1);

                    productPager(result['goods_count'], pn, 20);
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

        var tmpl_fn = W('#LiangpinProductItemTpl').html().trim().tmpl();

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
        $wrap = $wrap || W('.search-result');

        var html_str = getProductListHtml(product_datas);

        if(pn){
            if(__pager){
                $wrap.html(html_str);
            } else {
                $wrap.insertAdjacentHTML('beforeend', html_str);
            }
        } else {
            $wrap.html(html_str);
        }
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
            level_list = params['chengse_list'],
            price_list = params['price_list']

        pos = pos || 0;

        var
            new_attr_list = []

        // 品牌
        var
            temp_brand_list = genBrandList(brand_list, pos)
        new_attr_list.push(temp_brand_list)

        // 型号
        var
            temp_model_list = genModelList(search_model_ids, pos+1)
        new_attr_list.push(temp_model_list)

        // 成色
        var
            temp_level_list = genLevelList(level_list, pos+2)
        new_attr_list.push(temp_level_list)

        // 价格
        var
            temp_price_list = genPriceList(price_list, pos+3)
        new_attr_list.push(temp_price_list)

        attr_list.forEach(function(item, i){
            new_attr_list.push({
                'pos': pos+new_attr_list.length,
                'attr_var': 'attr[]',
                'attr_name': item['attr_name'],
                'list': item['list']
            })
        })

        AttrList = new_attr_list
        return new_attr_list
    }

    // 品牌列表
    function genBrandList(brand_list, pos){
        // 品牌
        var temp_brand_list = {
            'pos': pos,
            'attr_var': 'brand_id',
            'attr_name': '品牌',
            'list': []
        }

        if(QW.ObjectH.isArray(brand_list)){
            brand_list.forEach(function(item, i){
                temp_brand_list['list'].push({
                    'attr_val_id': item['key'],
                    'attr_val_name': item['name'],
                    'attr_val_num': item['sums']
                })
            })
        } else {
            QW.ObjectH.map(brand_list, function(v, k){
                temp_brand_list['list'].push({
                    'attr_val_id': k,
                    'attr_val_name': v['name'],
                    'attr_val_num': v['sums']
                })
            })
        }

        return temp_brand_list
    }
    // 型号列表
    function genModelList(model_list, pos){
        // 型号
        var temp_model_list = {
            'pos': pos,
            'attr_var': 'model_id',
            'attr_name': '型号',
            'list': []
        }
        model_list.forEach(function(item, i){
            temp_model_list['list'].push({
                'attr_val_id': item['model_id'],
                'attr_val_name': item['model_name']
            })
        })

        return temp_model_list
    }
    // 价格列表
    function genPriceList(price_list, pos){
        // 价格
        var temp_price_list = {
            'pos': pos,
            'attr_var': 'price',
            'attr_name': '价格',
            'list': []
        }

        if(QW.ObjectH.isArray(price_list)){
            price_list.forEach(function(item, i){
                temp_price_list['list'].push({
                    'attr_val_id': item['key'],
                    'attr_val_name': item['name']
                })
            })
        } else {
            QW.ObjectH.map(price_list, function(v, k){
                temp_price_list['list'].push({
                    'attr_val_id': k,
                    'attr_val_name': v
                })
            })
        }

        return temp_price_list
    }
    // 成色列表
    function genLevelList(level_list, pos){
        // 成色
        var temp_level_list = {
            'pos': pos,
            'attr_var': 'chengse',
            'attr_name': '成色',
            'list': []
        }

        if(QW.ObjectH.isArray(level_list)){
            level_list.forEach(function(item, i){
                temp_level_list['list'].push({
                    'attr_val_id': item['key'],
                    'attr_val_name': item['name']
                })
            })
        } else {
            QW.ObjectH.map(level_list, function(v, k){
                temp_level_list['list'].push({
                    'attr_val_id': k,
                    'attr_val_name': v
                })
            })
        }

        return temp_level_list
    }

    ///**
    // * 许愿表单
    // */
    //function wishFormSubmit2(){
    //    //许愿
    //    W('.wish-form').on('submit', function(e){
    //        e.preventDefault();
    //        var F = this;
    //        var content = W(F).query('.wish-content'),
    //            contacter = W(F).query('.wish-contacter');
    //
    //        if(content.val().trim().length == 0){
    //            content.shine4Error().focus();
    //            return false;
    //        }
    //        if(contacter.val().trim().length == 0){
    //            contacter.shine4Error().focus();
    //            return false;
    //        }
    //
    //        W(F).attr('action', '/youpin/sub_hope');
    //        QW.Ajax.post(F, function(rs){
    //            rs = QW.JSON.parse(rs);
    //            if(rs.errno){
    //                alert(rs.errmsg);
    //            }else{
    //                alert("许愿成功。如果有合适您的手机，我们会及时联系您");
    //                F.reset();
    //            }
    //        });
    //    });
    //}
    //function wishFormSubmit(wWishForm){
    //    var wWish = wWishForm||W('.wish-form');
    //    if(!wWish.length){
    //        return ;
    //    }
    //    //许愿
    //    wWish.on('submit', function(e){
    //        e.preventDefault();
    //        var F = this;
    //        var wAmount = W(F).query('[name="amount"]');
    //
    //        if(wAmount && wAmount.length){
    //            if( !(/^\d+\.?\d*$/).test(wAmount.val()) ){
    //                wAmount.shine4Error().focus();
    //                return false;
    //            }
    //        }
    //        if(wAmount.val()<50){
    //            var str_wrap = '<div class="wish-qrcode-wrap" id="WishQrcodeWrap">'
    //                +'<div class="row tcenter"><div class="tip mt50">亲，这个价格，<br/>臣妾真的做不到啊！</div></div>'
    //                +'<div class="row tcenter"><a href="#" class="wish-again">重新许愿</a></div>'
    //                +'</div>';
    //            var rect = wWish.ancestorNode('.wish-box').getRect();
    //            var wStr_wrap = W(str_wrap);
    //            wStr_wrap.css({
    //                'position': 'absolute',
    //                'top': +rect['top'],
    //                'left': rect['left'],
    //                'width': rect['width'],
    //                'height': +rect['height']+4
    //            });
    //
    //            wStr_wrap.appendTo(W('body'));
    //            wStr_wrap.query('.wish-again').on('click', function(e){
    //                e.preventDefault();
    //
    //                W(this).un();
    //                wStr_wrap.removeNode();
    //            });
    //            setTimeout(function(){
    //                if(wStr_wrap && wStr_wrap.length){
    //                    wStr_wrap.query('.wish-again').un();
    //                    wStr_wrap.removeNode();
    //                }
    //            }, 10000);
    //
    //            return ;
    //        }
    //
    //        W(F).attr('action', '/aj_lp/sub_xinyuan');
    //        // 设置最新的postkey
    //        W('[name="xy_postkey"]').val(getXYPostkey());
    //        QW.Ajax.post(F, function(rs){
    //            rs = QW.JSON.parse(rs);
    //            if(rs.errno){
    //                alert(rs.errmsg+'，请刷新页面重试');
    //            }else{
    //                setXYPostkey(rs.result.xy_postkey);
    //                var str_wrap = '<div class="wish-qrcode-wrap" id="WishQrcodeWrap">'
    //                    +'<div class="row tcenter"><img src="'+rs.result.qrcode+'" alt=""/><div class="tip">扫码，同步至微信</div></div>'
    //                    +'<div class="row tcenter">心仪手机一旦出现，我们第一时间通知您</div>'
    //                    +'</div>';
    //                var rect = wWish.ancestorNode('.wish-box').getRect();
    //                var wStr_wrap = W(str_wrap);
    //                wStr_wrap.css({
    //                    'position': 'absolute',
    //                    'top': +rect['top'],
    //                    'left': rect['left'],
    //                    'width': rect['width']
    //                });
    //
    //                wStr_wrap.appendTo(W('body'));
    //                setTimeout(function(){
    //                    if(wStr_wrap && wStr_wrap.length){
    //                        wStr_wrap.removeNode();
    //                    }
    //                }, 60000);
    //                //alert("许愿成功。如果有合适您的手机，我们会及时联系您");
    //                //F.reset();
    //            }
    //        });
    //    });
    //
    //    // 选择心仪的手机型号
    //    var wItem = wWish.query('.p-item');
    //    wItem.on('click', function(e){
    //        var wMe = W(this);
    //
    //        // 其他机型
    //        if(wMe.hasClass('p-item-other')){
    //            // 进入选择机型第一步
    //            selectModel(0);
    //        } else {
    //            wMe.addClass('p-item-cur').siblings('.p-item-cur').removeClass('p-item-cur');
    //            var model_id = wMe.attr('data-modelid');
    //            // 设置选择的型号
    //            wWish.query('[name="model_id"]').val(model_id);
    //            wWish.query('[name="amount"]').val(wMe.attr('data-wprice'));
    //        }
    //
    //    });
    //    // 设置心仪手机选项文本不能被选择
    //    tcb.setUnselect(wItem);
    //
    //    // 选择其他型号
    //    function selectModel(step, pid){
    //        step = +step || 0;
    //        pid = +pid || 0;
    //        var List = window.WishModelSelectList;
    //        if( !(List && List.length) ){
    //            return ;
    //        }
    //
    //        var Sub_List = List[step];
    //
    //        var wWrap = W('#WishModelSelectWrap');
    //        if( !(wWrap&&wWrap.length) ){
    //            wWrap = W('<ul id="WishModelSelectWrap" class="wish-model-select-wrap"></ul>');
    //            wWrap.appendTo(W('body'));
    //        }
    //        //wWrap.html('loading');
    //        var str = '', item, i, len;
    //        if(step==0){
    //            str += '<li class="tit">请选择品牌：</li>';
    //            for(i= 0, len=Sub_List.length; i<len; i++){
    //                item = Sub_List[i];
    //                str += '<li data-id="'+item['brand_id']+'" data-step="'+step+'">'+item['brand_name']+'</li>';
    //            }
    //        } else {
    //            str += '<li class="tit">请选择型号：</li>';
    //            Sub_List = Sub_List[pid];
    //            for(i= 0, len=Sub_List.length; i<len; i++){
    //                item = Sub_List[i];
    //                str += '<li data-id="'+item['model_id']+'" data-step="'+step+'">'+item['model_name']+'</li>';
    //            }
    //        }
    //
    //        setTimeout(function(){
    //            var rect = wWish.ancestorNode('.wish-box').getRect();
    //            wWrap.query('li').un();
    //            wWrap.html(str).css({
    //                'position': 'absolute',
    //                'top': +rect['top'],
    //                'left': rect['left'],
    //                'width': rect['width']
    //            });
    //            wWrap.query('li').on('click', function(e){
    //                e.preventDefault();
    //
    //                var wMe = W(this),
    //                    step = +wMe.attr('data-step')+1,
    //                    pid = +wMe.attr('data-id');
    //                if(wMe.hasClass('tit')){
    //                    return ;
    //                }
    //                // 选择型号最后一步
    //                if(step-List.length>-1){
    //                    wWish.query('[name="amount"]').val('');
    //                    wWish.query('[name="model_id"]').val(pid);
    //                    wWish.query('.p-item-other').html(wMe.html()).addClass('p-item-cur').siblings('.p-item-cur').removeClass('p-item-cur');
    //                    wWrap.query('li').un();
    //                    wWrap.removeNode();
    //                } else {
    //                    selectModel(step, pid);
    //                }
    //            });
    //        }, 0);
    //    }
    //
    //    W(document.body).on('mousedown', function(e){
    //        var target = e.target,
    //            wTarget = W(target);
    //        if( !(wTarget.attr('id')=='WishModelSelectWrap' || wTarget.ancestorNode('#WishModelSelectWrap').length) ){
    //            W('#WishModelSelectWrap li').un();
    //            W('#WishModelSelectWrap').removeNode();
    //        }
    //    });
    //}

    /**
     * 商品列表分页
     * @return {[type]} [description]
     */
    function productPager(total, pn, pagesize){
        pagesize = pagesize || 12;
        pn = pn || 0;
        var pagenum = Math.ceil(total/pagesize);

        var wPages = W('.pagination .pages');
        if(pagenum==1){
            wPages.html('');
            return;
        }
        var pager = new Pager(wPages, pagenum, pn);

        pager.on('pageChange', function(e) {
            setPageNum(e.pn);
            getProductList();

            window.scrollTo(0, W('.search-sort').getXY()[1]);
        });
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
                //console.log('1:'+JSON.stringify(params))

                params.forEach(function(item, i){
                    if(search_query[item[0]]){
                        setRequestParams(i, search_query[item[0]]);
                    }
                });

                //console.log('2:'+JSON.stringify(params))
            }
            // 初始化获取商品列表
            getProductList();

            // 事件绑定
            tcb.bindEvent(document.body, {
                // 搜索筛选项
                '.js-search-filter .filter-item': function(e){
                    e.preventDefault();

                    var wMe = W(this),
                        wParent = wMe.ancestorNode('.filter-choice');

                    if(wMe.hasClass('filter-curr')){
                        return;
                    }

                    var pos = parseInt(wParent.attr('data-pos'))||0,
                        params_key = wParent.attr('data-var'),
                        params_val = wMe.attr('data-value')||'';

                    //pos = 2;
                    // 设置指定位置参数值（此处用pos比key更优，因为key名称有可能重复）
                    setRequestParams(pos, params_val);
                    resetPageNum();

                    wMe.addClass('filter-curr').siblings('.filter-curr').removeClass('filter-curr');

                    // 获取商品列表
                    getProductList();
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
                // 排序
                '.js-search-sort .sort-item': function(e){
                    e.preventDefault();

                    var wMe = W(this);

                    wMe.addClass('sort-curr').siblings('.sort-curr').removeClass('sort-curr');
                    wMe.attr('data-cursort', wMe.attr('data-sort'));

                    setSort('sort', wMe.attr('data-sort'));
                    resetPageNum();

                    // 获取商品列表
                    getProductList();
                }
            });
        }

        init();
    });

}());