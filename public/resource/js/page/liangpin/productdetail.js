// 商品详情页交互
(function(){
    var Bang = window.Bang = window.Bang || {};

    var attr_combine = window.attr_combine; // 有产品的属性组合
    var model_attr = window.model_attr;     // 当前型号下已有商品的属性
    var product_attr = window.product_attr; // 当前商品的属性

    var cur_login_mobile = window.cur_login_mobile; // 是否登录

    // 所有存在的 属性组合
    var AttrGroup = QW.ObjectH.keys(attr_combine).map(function(item){
        return item.split(',');
    });
    var AttrList = [];
    model_attr.map(function(item){
        AttrList.push(QW.ObjectH.keys(item['attr']));
    });
    // QW.ObjectH.map(model_attr, function(item){
    //     AttrList.push(QW.ObjectH.keys(item['attr']));
    // });

    // AttrGroup.splice(0,1)
    //console.log(AttrGroup)
    //console.log(AttrList)

    setProductAttrUi(product_attr, AttrGroup, AttrList);
    /**
     * 设置商品属性的ui状态
     * @param {[type]} selectedAttr [description]
     */
    function setProductAttrUi(selectedAttr, AttrGroup, AttrList){
        var SelectableAttr = [],
            AttrGroup_itemstr = AttrGroup.map(function(item){return item.join('');});

        var selectedAttr2 = arrCombinedSequence(selectedAttr);
        AttrList.forEach(function(item, i){
            SelectableAttr[i] = [];

            item.forEach(function(item2, i2){
                selectedAttr2.forEach(function(sitem){
                    var temp_arr = [];

                    temp_arr = temp_arr.concat(sitem.slice(0, i), item2, sitem.slice(i+1));

                    if (AttrGroup_itemstr.contains(temp_arr.join('')) && !SelectableAttr[i].contains(item2)) {
                        SelectableAttr[i].push(item2);
                    }
                });
            });
        });
        // console.log(AttrGroup);

        var wPCate = W('.prd-price-attr');
        wPCate.forEach(function(el, i){
            W(el).query('.p-c-item').forEach(function(el){
                var wItem = W(el),
                    attr_id = wItem.attr('data-id');
                wItem.removeClass('p-c-curr').removeClass('p-c-disabled').removeClass('p-c-disabled-hover');// 移除状态
                // 设置那些不能被选择的属性
                if (!SelectableAttr[i].contains(attr_id)) {
                    wItem.addClass('p-c-disabled');
                } else {
                    wItem.removeClass('p-c-disabled');
                }

                if(attr_id === selectedAttr[i]){
                    wItem.addClass('p-c-curr');
                }
            });
        });
    }
    /**
     * 将数组转换成组合序列
     * @param  {[type]} TwoDimArr [description]
     * @return {[type]}              [description]
     */
    function arrCombinedSequence(TwoDimArr){
        var ConvertedArr = [], // 转换后的二维数组
            cc = 1; // 转换后的二维数组的数组长度

        var TwoDimArr_safe = TwoDimArr.map(function(arr){
            return (arr instanceof Array) ? arr : [arr];
        });
        TwoDimArr_safe.forEach(function(arr){
            cc = cc*arr.length;
        });

        var kk = 1;
        TwoDimArr_safe.forEach(function(arr, i){
            var len = arr.length;
            cc = cc/len;
            if (i==0) {
                arr.forEach(function(item){
                    for(var j=0; j<cc; j++){
                        ConvertedArr.push([item]);
                    }
                });
            } else {
                var pos = 0;
                for(var k=0; k<kk; k++){
                    arr.forEach(function(item){
                        for(var j=0; j<cc; j++){
                            ConvertedArr[pos].push(item);
                            pos++;
                        }
                    });
                }
            }
            kk = kk*len;
        });

        return ConvertedArr;
    }
    // 获取评论
    function getComment(product_id, pn, is_img){
        pn = pn || 0;
        pn = parseInt(pn, 10) ? parseInt(pn, 0) : 0;

        is_img = is_img || 0;
        var comment_flag = is_img? 'only_img': 'all'

        window._CommentCache = window._CommentCache || {};

        var comment_datas = window._CommentCache[pn+comment_flag];
        if (comment_datas) {
            var datas = {
                'comment_list': comment_datas['list']||[]
            };
            var tmpl_fn  = W('#JsLiangpinProductCommentTpl').html().trim().tmpl(),
                tmpl_str = tmpl_fn(datas);

            W('#LiangpinProductComment .cmt-list').html(tmpl_str);

            if(is_img){
                commentPagerOnlyImg(comment_datas['count'], pn)
            }else {
                commentPager(comment_datas['count'], pn);
            }
        }
        else {
            if(is_img){
                var request_url ='/youpin/aj_get_comments?product_id='+product_id+'&pn='+pn+'&is_img='+is_img
            }else {
                var request_url ='/youpin/aj_get_comments?product_id='+product_id+'&pn='+pn
            }

            QW.Ajax.get(request_url, function(res){
                res = JSON.parse(res);

                if (!res['errno']) {
                    var datas = {
                        'comment_list': res['result']['list']||[]
                    };
                    window._CommentCache[pn+comment_flag] = res['result'];

                    var tmpl_fn  = W('#JsLiangpinProductCommentTpl').html().trim().tmpl(),
                        tmpl_str = tmpl_fn(datas);

                    W('#LiangpinProductComment .cmt-list').html(tmpl_str);

                    tcb.setImgElSize(W('#LiangpinProductComment .cmt-list').query('.shaitu-pic img'), 80, 80, true);

                    if(is_img){
                        commentPagerOnlyImg(res['result']['count'], pn)
                    }else {
                        commentPager(res['result']['count'], pn);
                    }
                }
            });
        }
    }


    /**
     * 商家好评分页
     * @return {[type]} [description]
     */
    function commentPager(total, pn, pagesize){
        pagesize = pagesize || 12;
        var pagenum = Math.ceil(total/pagesize);

        var wPages = W('#LiangpinProductComment .pages');
        if(pagenum==1){
            wPages.html('');
            return;
        }

        pn = pn || parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
        var pager = new Pager(wPages, pagenum, pn);

        pager.on('pageChange', function(e) {
            getComment(wPages.attr('data-pid'), e.pn);

            window.scrollTo(0, W('.comment-classify').getXY()[1]-70);
        });
    }

    /**
     * 商家好评分页 有图
     * @return {[type]} [description]
     */
    function commentPagerOnlyImg(total, pn, pagesize){
        pagesize = pagesize || 12;
        var pagenum = Math.ceil(total/pagesize);

        var wPages = W('#LiangpinProductComment .pages');
        if(pagenum==1){
            wPages.html('');
            return;
        }

        pn = pn || parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
        var pager = new Pager(wPages, pagenum, pn);

        pager.on('pageChange', function(e) {
            getComment(wPages.attr('data-pid'), e.pn, 1);

            window.scrollTo(0, W('.comment-classify').getXY()[1]-70);
        });
    }

    function setProductBuyUrl(url){
        if (!url) {
            return;
        }
        W('.prd-buy').attr('href', tcb.setUrl2(url, {"from": tcb.queryUrl(location.href,'from')}));
    }
    // 设置加减符号状态
    function setPlusMinusStatus(val, stock, wNum){
        if (val==1) {
            wNum.siblings('.num-s').addClass('num-s-disabled');
        }
        if (val>1) {
            wNum.siblings('.num-s-disabled').removeClass('num-s-disabled');
        }
        if (val<stock) {
            wNum.siblings('.num-b-disabled').removeClass('num-b-disabled');
        } else {
            wNum.siblings('.num-b').addClass('num-b-disabled');
        }
    }
    // 验证属性选择是否正确
    function validAttrSelected(wAttrLine){
        var flag = true;

        if (wAttrLine && wAttrLine.length) {
            wAttrLine.forEach(function(el){
                var wEl = W(el),
                    wCur = wEl.query('.p-c-curr');

                if (!wCur.length) {
                    flag = false;

                    errorBlink(wEl.query('.p-c-item'));
                }
            });
        }

        return flag;
    }
    tcb.bindEvent(document.body, {
        // 属性点击的交互事件
        '.prd-price-attr .p-c-item': function(e){
            e.preventDefault();
            var wMe = W(this);

            // 当前已经选中的属性 点击无效
            if (wMe.hasClass('p-c-curr')) {
                return;
            }

            var cur_attr = wMe.attr('data-id'),
                cur_attr_line = wMe.ancestorNode('.prd-price-attr')[0],
                cur_line_pos = 0;

            var wAttrLine = W('.prd-price-attr');

            // 获取当前点击行的位置
            wAttrLine.forEach(function(el, i){
                if (cur_attr_line==el) {
                    cur_line_pos = i;
                }
            });

            var filtered_attrgroup = [], // 筛选出包含当前点击属性的那部分数组
                attrgroup_counter = [];  // 相同重合次数统计数组
            AttrGroup.forEach(function(item, i){
                // 在所有已有的属性组中，筛选出包含当前点击属性的那部分数组
                if (item[cur_line_pos]==cur_attr) {
                    var counter = 0;
                    wAttrLine.forEach(function(el, ii){
                        var wAttrItem = W(el).query('.p-c-item');
                        // 遍历到当前行，直接跳过不用处理
                        if (ii==cur_line_pos) {
                            return;
                        }
                        if (wAttrItem.filter('.p-c-curr').attr('data-id') == item[ii]) {
                            counter++;
                        }
                    });
                    attrgroup_counter.push(counter);
                    filtered_attrgroup.push(item);
                }
            });

            var max_counter = Math.max.apply(Math, attrgroup_counter),
                max_counter_pos = attrgroup_counter.indexOf(max_counter); // 取最大数字的第一个位置

            var best_match_attrgroup = filtered_attrgroup[max_counter_pos], // 最佳匹配组
                selected_attrgroup = [];
            wAttrLine.forEach(function(el, i){
                var wCur = W(el).query('.p-c-curr');
                if (wCur.attr('data-id')!=best_match_attrgroup[i] && cur_line_pos!=i) {
                    selected_attrgroup[i] = W(el).query('.p-c-item').map(function(el){
                        return W(el).attr('data-id');
                    });
                } else {
                    selected_attrgroup[i] = best_match_attrgroup[i];
                }
            })

            // console.log(selected_attrgroup)
            setProductAttrUi(selected_attrgroup, AttrGroup, AttrList)

            var attr_arr = wAttrLine.query('.p-c-curr').map(function(el, i){
                return W(el).attr('data-id');
            });

            var url = attr_combine[ attr_arr.join (',') ];
            if (url) {
                var url_query = tcb.queryUrl (window.location.href);

                window.location.href = tcb.setUrl2 (url, {
                    "from"      : url_query[ 'from' ],
                    "page"      : url_query[ 'page' ],
                    "from_page" : url_query[ 'from_page' ],
                    "from_hdhx" : url_query[ 'from_hdhx' ],
                    "iframe"    : url_query[ 'iframe' ],
                    "_from"     : url_query[ '_from' ],
                    "_hash"     : url_query[ '_hash' ]
                });
            }
        },
        // 不可选属性的mouse交互
        '.prd-price-attr .p-c-disabled': {
            'mouseenter': function(e){
                W(this).addClass('p-c-disabled-hover');
            },
            'mouseleave': function(e){
                W(this).removeClass('p-c-disabled-hover');
            }
        },
        // 点击立即购买..
        '.prd-choices .prd-buy': function(e){
            var wAttrLine = W('.prd-choices .prd-price-attr');
            if (!validAttrSelected(wAttrLine)) {
                e.preventDefault();

                return ;
            }
        },
        // 不能购买的时候
        '.prd-choices .prd-buy-disabled': function(e){
            e.preventDefault();
        },
        // 切换商品tab
        '.product-tab .p-tab-item': function(e){
            e.preventDefault();

            var
                wMe = W(this),
                txt = wMe.html()

            wMe.addClass('p-tab-curr')
                .siblings('.p-tab-curr').removeClass('p-tab-curr');

            var
                rel = wMe.attr('data-rel'),
                wShow = W('.product-content .p-cnt-item').hide().filter('[data-for="'+rel+'"]')
            wShow.show()

            W('.product-detail [data-rel="'+rel+'"]').addClass('p-tab-curr')
                .siblings('.p-tab-curr').removeClass('p-tab-curr');



            if (rel=='comment' || rel=='reality') {
                var
                    product_id = wMe.attr('data-pid')
                getCommentBlock( rel)
                getComment(product_id, 0, 1)
            }
        },
        //浮层中的tab
        '#JsBuyTpl .buy-left .p-tab-item': function (e) {
            e.preventDefault();

            var
                wMe = W(this),
                txt = wMe.html()
            var body = W(Browser.webkit?document.body:document.documentElement);
            body.animate({'scrollTop' : W('.product-tab').getXY()[1]}, 150, null, Easing.easeOutStrong);

            wMe.addClass('p-tab-curr')
                .siblings('.p-tab-curr').removeClass('p-tab-curr');

            var
                rel = wMe.attr('data-rel'),
                wShow = W('.product-content .p-cnt-item').hide().filter('[data-for="'+rel+'"]')
            wShow.show()

            W('.product-detail [data-rel="'+rel+'"]').addClass('p-tab-curr')
                .siblings('.p-tab-curr').removeClass('p-tab-curr');

            if (rel=='comment' || rel=='reality') {
                var
                    product_id = wMe.attr('data-pid')
                getCommentBlock( rel)
                getComment(product_id, 0, 1)
            }
        },
        '.p-detail-cnt .comment-classify .cmt-cl-item': function () {
            var  wMe = W(this),
                comment_cl = parseInt(wMe.attr('data-cmt-cl'))
            wMe.addClass('cmt-cl-item-cur')
                .siblings('.cmt-cl-item-cur').removeClass('cmt-cl-item-cur');
            var
                product_id = wMe.attr('data-pid');
            if(comment_cl){

                getComment(product_id, 0, 1)
            }else{

                getComment(product_id, 0)
            }
        },
        // 数量输入框
        '.component-num .num-show':{
            'keyup': function(e){
                var wMe = W(this),
                    val = wMe.val(),
                    int_val = parseInt(val, 10),
                    stock   = parseInt(wMe.attr('data-stock'), 10);

                if (val!=int_val) {
                    val = int_val ? int_val : 1;

                    val = val>stock ? stock : val;

                    wMe.val(val);
                    wMe.shine4Error().focus();
                } else {
                    val = int_val;
                    if (val>stock) {
                        wMe.val(stock);
                        wMe.shine4Error().focus();
                    }
                }
                setProductBuyUrl(wMe.attr('data-url')+'&num='+val);
                setPlusMinusStatus(val, stock, wMe);
            },
            'blur': function(e){
                var wMe = W(this),
                    val = wMe.val(),
                    int_val = parseInt(val, 10),
                    stock   = parseInt(wMe.attr('data-stock'), 10);

                if (val!=int_val) {
                    val = int_val ? int_val : 1;

                    val = val>stock ? stock : val;

                    wMe.val(val);
                    wMe.shine4Error().focus();
                } else {
                    val = int_val;
                    if (val>stock) {
                        wMe.val(stock);
                        wMe.shine4Error().focus();
                    }
                }
                setProductBuyUrl(wMe.attr('data-url')+'&num='+val);
                setPlusMinusStatus(val, stock, wMe);
            }
        },
        // 减少数量
        '.component-num .num-s': function(e){
            e.preventDefault();

            var wMe = W(this),
                wIpt = wMe.siblings('input'),
                count = parseInt(wIpt.val(), 10),
                stock = parseInt(wIpt.val(), 10);
            if (!(count>1)) {
                return;
            }
            count = count-1;

            wIpt.val(count);
            setProductBuyUrl(wIpt.attr('data-url')+'&num='+count);

            setPlusMinusStatus(count, stock, wIpt);
        },
        // 增加数量
        '.component-num .num-b': function(e){
            e.preventDefault();

            var wMe = W(this),
                wIpt = wMe.siblings('input'),
                count = parseInt(wIpt.val(), 10),
                stock = parseInt(wIpt.attr('data-stock'), 10);
            if (count<stock) {
                count = count+1;
                if (count>1) {
                    wMe.siblings('.num-s-disabled').removeClass('num-s-disabled');
                }

                wIpt.val(count);
                setProductBuyUrl(wIpt.attr('data-url')+'&num='+(count));
            }

            setPlusMinusStatus(count, stock, wIpt);
        },
        // 显示IMEI提示
        '.imei-tips-icon': {
            'mouseenter': function(e){
                var wMe = W(this),
                    rect = wMe.getRect();

                var wTips = W('#LiangpinImeiTips');
                wTips.show();

                wTips.css({
                    'top': rect['top']-wTips.getSize()['height']+rect['height']+5,
                    'left': rect['left']-0+rect['width']+8
                });
            },
            'mouseleave': function(e){

                W('#LiangpinImeiTips').hide();
            }
        },

        // 点击优惠券立即领券按钮
        '.btn-coupon': function (e) {
            e.preventDefault();
            var
                $me = $(this),
                $inner_wrap = $('#SmCouponTpl .inner-wrap'),
                product_id = $me.attr('data-product-id'),
                category_id = $me.attr('data-category-id');
            if(!$me.hasClass('btn-conpon-disable')) {
                getImmedYouhuiCode(product_id,category_id,function (res) {
                    res = JSON.parse(res);
                    if (res.errno == 0) {
                        $me.text('已领取').addClass('btn-conpon-disable');
                        $('.coupon-desc').css('display', 'block')
                    }else if(res.errno == 738){
                        $inner_wrap.html(res.errmsg)
                    }else {
                        $inner_wrap.html('系统错误，请刷新页面')
                    }
                });
            }
        },
        //优惠券关闭按钮
        '.i-close': function (e) {
            e.preventDefault();
            $('#SmCouponTpl').css('display','none')
        },
        //登录模态框关闭按钮
        '.close-JsLoginTpl': function (e) {
            e.preventDefault();
            $(this).closest('#JsLoginTpl').css('display','none')
        },
        //浮层 的 优惠券按钮
        '.getCode': function (e) {
            e.preventDefault();
            $('html,body').animate({'scrollTop': 0}, 500,'swing',function (e) {
                $('.p-c-coupon').trigger('click')
            })
        },
        //浮层 的 立即购买按钮
        '.buy-now': function (e) {
            e.preventDefault();
        },

        // 选择花呗分期
        '.prd-c-line-huabei .p-c-item' : function (e) {
            e.preventDefault ()

            var $me = W (this),
                $btn = W ('.prd-buy'),
                btn_url = $btn.attr ('href')

            if ($me.hasClass ('p-c-curr')) {
                $me.removeClass ('p-c-curr')

                if ($btn.attr ('data-default-text')) {
                    $btn
                        .html ($btn.attr ('data-default-text'))
                        .attr ('data-default-text', '')
                }
                $btn
                    .removeClass('prd-buy-huabei')
                    .attr ('href', tcb.setUrl2 (btn_url, { 'huabei_stage' : '' }))
            } else {
                $me.addClass ('p-c-curr').siblings ('.p-c-curr').removeClass ('p-c-curr')

                if (!$btn.attr ('data-default-text')) {
                    $btn.attr ('data-default-text', $btn.html ())
                }
                $btn
                    .addClass('prd-buy-huabei')
                    .attr ('href', tcb.setUrl2 (btn_url, { 'huabei_stage' : $me.attr ('data-stage') }))
                    .html ('分期购买')
            }
        }
    })

    //点击优惠券
    $('.p-c-coupon').on('click',function (e) {
        e.preventDefault();
        //判断是否登录  登录弹出优惠券  未登录要求登录
        if(!cur_login_mobile){
            $(' #JsLoginTpl').css('display','block')
        }else{
            $(' #JsLoginTpl').css('display','none')
            $(' #SmCouponTpl').css('display','block')
        }
    });

    ;(function () {

        var
            $prd_choices = $('.prd-choices .prd-buy');//购买的悬浮栏
        if(!__isYJHX){
            if($prd_choices && $prd_choices.length>0){
                $('.prd-choices div:last a').clone(true).prependTo('#JsBuyTpl .buy-right');
                $(window).on('scroll resize',function (e) {
                    var _top = $('.main-content').offset().top,
                        _scrollTop = $(this).scrollTop();
                    if(_scrollTop>_top){
                        $('#JsBuyTpl').show(300,function () {

                        })
                    }else{
                        $('#JsBuyTpl').hide(300)
                    }
                })
            }
        }
    })()

    //累计评论部分
    function getCommentBlock(rel) {
        $('.comment-position').html('')
        var str = $('#commentBlock').html()
        $('[data-for='+rel+'] [data-position='+rel+']').html(str)
    }
    //页面加载时把 评论部分加到 商品详情下面
    ;(function addCommentToDetail() {
        getCommentBlock('reality')
        var product_id = $('.cmt-cl-item-cur').attr('data-pid')
        //console.log(product_id)
        getComment(product_id, 0, 1)
    })()


    //进入页面如果用户已经登录  判断时候领取过优惠券 此方法需要进入详情页就执行
    ;(function hasImmedYouhuiCode(){
        var
            $coupon_btn = $('#SmCouponTpl .btn-coupon'),
            category_id = $coupon_btn.attr('data-category-id');

        $.post('/youpin/doIsReceivedJyjlYouhuiCode',{
            'category_id': category_id
        },function (res) {
            res= JSON.parse(res);
            if(res.errno){
                $coupon_btn.text('已领取').addClass('btn-conpon-disable');
                $('.coupon-desc').css('display', 'block')
            }
        })
    })()

    //领取即领即用优惠券
    function getImmedYouhuiCode(product_id,category_id,callback) {
        $.post('/youpin/doReceiveJyjlYouhuiCode',{
            'product_id': product_id,
            'category_id':category_id
        },function (res) {
            typeof callback == 'function' && callback(res)
        })
    }

    /**
     * 错误提示闪烁
     * @param  {[type]} wEl [description]
     * @param  {[type]} th  [description]
     * @return {[type]}     [description]
     */
    function errorBlink(wEl, th){
        if (!(wEl&&wEl.length)) {
            return ;
        }
        window.ThList = window.ThList ? window.ThList : {};

        if (th) {
            clearInterval(th);
        }

        wEl.addClass('errorblink');

        var c = 0, k = Math.random();
        ThList[k] = setInterval(function(){
            if (c % 2) {
                wEl.removeClass('errorblink');
            } else {
                wEl.addClass('errorblink');
            }
            c = c +1;
            if(c > 9){
                clearInterval(ThList[k]);
                c = 0;
            }
        }, 180);

        return ThList[k];
    }
    /**
     * 清除错误闪烁
     * @return {[type]} [description]
     */
    function clearErrorBlink(){
        window.ThList = window.ThList ? window.ThList : {};

        QW.ObjectH.map(window.ThList, function(v){
            clearInterval(v);
        });

        window.ThList = {};
    }

    // 获取商品质检报告
    function getProductQualityReport(){
        var product_id = tcb.queryUrl(window.location.search, 'product_id')
        if (!product_id){
            product_id = window.location.pathname
                .replace('/youpin/product/', '')
                .replace('.html', '')
        }

        var request_url = '/youpin/aj_get_quality_check?product_id='+product_id;
        QW.loadJsonp(request_url, function(res){
            //try{

            //res = JSON.parse(res);

            if (!res['errno']){
                var info_basic = res['result']['basic'] || [], // 基本信息
                    info_exterior = res['result']['exterior'] || [], // 外观检测
                    info_demolished = res['result']['demolishedList'] || [], // 拆修情况
                    info_function = res['result']['function_option'] || [], // 功能检测
                    info_reporter = res['result']['report_info'] || {}, // 报告人信息
                    info_str = res['result']['str'] || '';

                var html_str = '';
                if ( (info_basic && info_basic.length)
                    || (info_exterior && info_exterior.length)
                    || (info_demolished && info_demolished.length)
                    || (info_function && info_function.length)
                    || info_str ){

                    if (info_exterior.length){
                        var info_exterior_del = [
                                //'屏幕划痕', '后盖划痕','边框磕碰'
                            ],
                            info_exterior_tmp = [];
                        info_exterior.forEach(function(item){
                            if ( !info_exterior_del.contains(item['option_name']) ){
                                info_exterior_tmp.push(item);
                            }
                        });
                        info_exterior = info_exterior_tmp;
                    }

                    if (info_function.length){
                        var info_function_del = [
                                'GPS', 'NFC','红外','陀螺仪','指纹','电池是否更换'
                            ],
                            info_function_tmp = [];
                        info_function.forEach(function(item){
                            if ( !info_function_del.contains(item['option_name']) ){
                                info_function_tmp.push(item);
                            }
                        });
                        info_function = info_function_tmp;
                    }

                    var html_fn = W('#JsProductQualityReportTpl').html().trim().tmpl();

                    html_str = html_fn({
                        'info_basic': info_basic,
                        'info_exterior': info_exterior,
                        'info_function': info_function,
                        'info_demolished': info_demolished,
                        'info_reporter': info_reporter,
                        'info_str': info_str
                    });
                }

                W('.p-detail-cnt-quality-report').html(html_str);
            } else {
                //alert(res['errmsg']);
            }

            //} catch (ex){}

        });

    }
    Dom.ready(function () {
        //window.flash_saling = 2;

        var flash_saling = window.flash_saling, // 商品的出售状态
            flash_saling_last = window.flash_saling;// 最近一次的商品出售状态

        var curtime   = window.curtime, // 进入页面时间
            starttime = window.flash_start_time,//'2015-11-09 16:20:40',//
            endtime   = window.flash_end_time;//'2015-11-10 16:22:40';//

        //window.remain_time = 18;

        // 服务器当前时间(精确到毫秒)
        curtime = Date.parse(curtime.replace(/-/g, '/')) || (new Date()).getTime();

        starttime = Date.parse(starttime.replace(/-/g, '/')) || 0;
        endtime   = Date.parse(endtime.replace(/-/g, '/')) || 0;

        // 限时抢购倒计时
        (function(){
            var wCountdown = W('.js-countdown');
            if ( !(wCountdown && wCountdown.length) ) {
                return;
            }

            var count = 0,
                wFlashBtnLine = W('.prd-c-line-flash'),
                r_url = wFlashBtnLine.attr('data-href');

            // 按钮行
            var html_fn = W('#JsProductFlashSalingBtnLineTpl').html().trim().tmpl();

            var product_id = tcb.queryUrl(window.location.search, 'product_id'),
                first_lock_flag = false;
            if (!product_id){
                product_id = window.location.pathname
                    .replace('/youpin/product/', '')
                    .replace('.html', '')
            }

            // 开始前倒计时
            if (flash_saling==1 && curtime<starttime) {

                Bang.countdown_desc = '距离抢购';
                wCountdown.addClass('countdown-start-prev');
                Bang.startCountdown(starttime, curtime, wCountdown, {
                    'end': function(){
                        Bang.countdown_desc = '剩余';
                        wCountdown.removeClass('countdown-start-prev');

                        // 活动剩余时间倒计时
                        Bang.startCountdown(endtime, starttime, wCountdown, {
                            'process': function(curtime){
                                if (!(count%10)) {
                                    QW.Ajax.get('/youpin/aj_get_flash_saling?product_id='+product_id, function(res){
                                        res = JSON.parse(res);

                                        if (!res['errno']) {
                                            flash_saling = res['result'];
                                        }
                                    });
                                }
                                count++;

                                // 当前flash_saling和上次flash_saling_last不相同，说明商品状态已经更新，那么按钮状态
                                if (flash_saling_last != flash_saling) {
                                    wFlashBtnLine.html(html_fn({
                                        'flash_saling': flash_saling,
                                        'url': r_url
                                    }));
                                    if (flash_saling==3){
                                        var remain_time = window.remain_time || window.locked_time; // 倒计时剩余时间
                                        lockedCountdown(curtime, remain_time);
                                    } else if (flash_saling==4) {
                                        wCountdown.insertAdjacentHTML('afterend', '<div class="countdown countdown-end-next"><span>商品已售出</span></div>');
                                        wCountdown.removeNode();
                                    }
                                    flash_saling_last = flash_saling;
                                } else {
                                    if (flash_saling==3 && !first_lock_flag){
                                        first_lock_flag = true;
                                        var remain_time = window.remain_time || window.locked_time; // 倒计时剩余时间
                                        lockedCountdown(curtime, remain_time);
                                    }
                                }
                            },
                            'end': function(){
                                QW.Ajax.get('/youpin/aj_get_flash_saling?product_id='+product_id, function(res){
                                    res = JSON.parse(res);

                                    if (!res['errno']) {
                                        flash_saling = res['result'];
                                    }
                                });

                                wCountdown.html('<span>活动结束</span>').addClass('countdown-end-next');
                            }
                        });
                    }
                });

            }
            // 抢购进行中&商品未被拍下
            else if (curtime<endtime) {

                if (flash_saling==2 || flash_saling==3) {
                    Bang.countdown_desc = '剩余';
                    wCountdown.removeClass('countdown-start-prev');

                    Bang.startCountdown(endtime, curtime, wCountdown, {
                        'process': function(curtime){
                            if (!(count%10)) {
                                QW.Ajax.get('/youpin/aj_get_flash_saling?product_id='+product_id, function(res){
                                    res = JSON.parse(res);

                                    if (!res['errno']) {
                                        flash_saling = res['result'];
                                    }
                                });
                            }
                            count++;

                            // 当前flash_saling和上次flash_saling_last不相同，说明商品状态已经更新，那么按钮状态
                            if (flash_saling_last != flash_saling) {
                                wFlashBtnLine.html(html_fn({
                                    'flash_saling': flash_saling,
                                    'url': r_url
                                }));
                                if (flash_saling==3){
                                    var remain_time = window.remain_time || window.locked_time; // 倒计时剩余时间
                                    lockedCountdown(curtime, remain_time);
                                } else if (flash_saling==4) {
                                    wCountdown.insertAdjacentHTML('afterend', '<div class="countdown countdown-end-next"><span>商品已售出</span></div>');
                                    wCountdown.removeNode();
                                }
                                flash_saling_last = flash_saling;
                            } else {
                                if (flash_saling==3 && !first_lock_flag){
                                    first_lock_flag = true;
                                    var remain_time = window.remain_time || window.locked_time; // 倒计时剩余时间
                                    lockedCountdown(curtime, remain_time);
                                }
                            }
                        },
                        'end': function(){
                            QW.Ajax.get('/youpin/aj_get_flash_saling?product_id='+product_id, function(res){
                                res = JSON.parse(res);

                                if (!res['errno']) {
                                    flash_saling = res['result'];
                                }
                            });

                            wCountdown.html('<span>活动结束</span>').addClass('countdown-end-next');
                        }
                    });

                }
                else if (flash_saling==4) {
                    wCountdown.html('<span>商品已售出</span>').addClass('countdown-end-next');
                }

            } else {
                wCountdown.html('<span>活动结束</span>').addClass('countdown-end-next');
            }

        }());

        /**
         * 购买锁定倒计时
         *
         * @param starttime
         */
        function lockedCountdown(starttime, remain_time){
            var wCountdown = W('.js-countdown2');
            if ( !(wCountdown && wCountdown.length) && remain_time<0 ) {
                return;
            }

            var lock_endtime = starttime + remain_time*1000;

            Bang.startCountdown(lock_endtime, starttime, wCountdown);

        }


        // 获取商品质检报告
        getProductQualityReport();


        // *下单当天发货倒计时**下单当天发货倒计时**下单当天发货倒计时*
        (function(){
            var wTodayDispatchCountdown = W('.js-today-dispatch-countdown');
            if ( !(wTodayDispatchCountdown && wTodayDispatchCountdown.length) ) {
                return;
            }

            var
                target_time = Date.parse(window.curdate+' 18:00:00') || 0

            if (curtime>target_time){
                // 当前时间大于目标时间，直接明天发货的文案
                wTodayDispatchCountdown.parentNode('.product-price-desc' ).html('(现在下单，预计明日上午发货)')

                return
            }
            Bang.startCountdown(target_time, curtime, wTodayDispatchCountdown, {
                'process': function(curtime){},
                'end': function(){
                    wTodayDispatchCountdown.parentNode('.product-price-desc' ).html('(现在下单，预计明日上午发货)')
                }
            });

        }());


    });



    // 商品图片交互效果（图片宽高自适应、放大镜、切换大小图等）
    Dom.ready(function () {

        var wImgShower  = W('.p-pic-shower'),
            mouse_pointer = {'left':0, 'top':0},
            zoom_ratio = 2,// 放大倍数
            cover_size = (wImgShower.getSize()['width']-wImgShower.borderWidth()[1]-wImgShower.borderWidth()[3])/zoom_ratio, // 图片容器的宽度减去左右边框（默认无padding，不做减去padding的处理）
            cover_size_half = cover_size/2; // cover宽高半数

        tcb.bindEvent(document.body, {
            //详情页照片切换
            '.product-pics .p-pic-item': {
                'mouseenter': function(e){
                    e.preventDefault();

                    var wMe = W(this),
                        wMeImg = wMe.query('img'),
                        wMeImg_size = wMeImg.getSize(),
                        img_big_src  = wMe.attr('data-big'),
                        img_orig_src = wMe.attr('data-origsrc');

                    wMe.addClass('p-pic-curr').siblings('.p-pic-curr').removeClass('p-pic-curr');

                    var wImgShower = W('.p-pic-shower'),
                        wImgbig = wImgShower.query('img');
                    wImgbig.attr('src', img_big_src);
                    wImgShower.attr('data-origsrc', img_orig_src);

                    var w, h;
                    if (wMeImg_size['width']>wMeImg_size['height']) {
                        w = 435;
                        h = 'auto';
                    } else {
                        w = 'auto';
                        h = 435;
                    }

                    wImgbig.css({
                        'width' : w,
                        'height': h
                    });

                    // 图片加载完成后。。。
                    tcb.imageOnload(img_big_src, function(){
                        // 使用setTimeout来保证低版本ie，无法及时获取图片新的高宽
                        setTimeout(function(){

                            // 切换大图的时候，重新获取图片高宽位置信息
                            resetBigimgRect();

                        }, 1);
                    });
                }
            },
            // 大图的放大镜效果
            '.p-pic-shower': {
                'mouseenter': imgZoom,
                'mouseleave': function(e){
                    imgZoomCoverHide();
                    imgZoomBiggerHide();
                },
                'mousemove' : imgZoom
            }
        });
        W(window).on('resize', autoFixedElementRect);
        // 自动修复元素rect的变化
        function autoFixedElementRect(){
            // 设置商品大图容器在文档中的位置
            resetShowerRect();
            // 设置商品大图在文档中的位置
            resetBigimgRect();
        }


        // 图片放大镜
        function imgZoom(e){
            // 当前的鼠标位置
            mouse_pointer = {'left':e.pageX, 'top':e.pageY};

            var shower_rect = getShowerRect(),
                bigimg_rect = getBigimgRect();

            // 鼠标超出图片的范围
            if ( (mouse_pointer['left']<bigimg_rect['left'])
                || (mouse_pointer['top']<bigimg_rect['top'])
                || ( mouse_pointer['left']>(bigimg_rect['left']+bigimg_rect['width']) )
                || ( mouse_pointer['top']>(bigimg_rect['top']+bigimg_rect['height']) ) ){

                imgZoomCoverHide();
                imgZoomBiggerHide();
                return ;
            }

            var bigimg_left_offset = bigimg_rect['left']-shower_rect['left']-shower_rect['borderwidth'][3],
                bigimg_top_offset  = bigimg_rect['top'] -shower_rect['top'] -shower_rect['borderwidth'][0];

            // 鼠标距离图片边界的偏移量值
            var left_offset = mouse_pointer['left'] - bigimg_rect['left'],
                top_offset  = mouse_pointer['top'] - bigimg_rect['top'];

            // cover图片的绝对定位位置
            var cover_left = bigimg_left_offset,
                cover_top  = bigimg_top_offset;
            // 左偏移量
            if (left_offset>cover_size_half) {
                cover_left += left_offset - cover_size_half;
            }
            // 上偏移量
            if (top_offset>cover_size_half) {
                cover_top += top_offset - cover_size_half;
            }

            var cover_left_critical = bigimg_rect['left']-shower_rect['left']+bigimg_rect['width']-cover_size,
                cover_top_critical  = bigimg_rect['top']-shower_rect['top']+bigimg_rect['height']-cover_size;
            if (cover_left>cover_left_critical){
                cover_left = cover_left_critical;
            }
            if (cover_top>cover_top_critical){
                cover_top = cover_top_critical;
            }

            imgZoomCoverShow(cover_top, cover_left);

            //imgZoomBiggerShow(W(this).query('img').attr('src'));
            imgZoomBiggerShow(W(this).attr('data-origsrc'));
        }

        // 展示放大镜大图
        function imgZoomBiggerShow(big_src){
            var wImgZoomBigger = W('#ImgZoomBigger');

            // 商品大图相关尺寸信息
            var bigimg_rect = getBigimgRect(),
                bigger_show_size = bigimg_rect['width'];
            if (bigimg_rect['width']<bigimg_rect['height']) {
                bigger_show_size = bigimg_rect['height'];
            }

            if (!wImgZoomBigger.length) {

                var bigger_show_html = '<div class="img-zoom-bigger" id="ImgZoomBigger" style="'
                    +'width: '+bigger_show_size+'px;height: '+bigger_show_size+'px; overflow: hidden;">'
                    +'<img src="'+big_src+'" alt="" style="'
                    +'width:'+(bigimg_rect['width']*zoom_ratio)+'px;height:'+(bigimg_rect['height']*zoom_ratio)+'px;"/></div>';
                wImgZoomBigger = W(bigger_show_html);
                wImgZoomBigger.appendTo(W('.product-pics')[0]);
            }
            wImgZoomBigger.show();

            var zoomcover_rect = getZoomCoverRect();

            var scroll_top  = (zoomcover_rect['top']-bigimg_rect['top'])*zoom_ratio,
                scroll_left = (zoomcover_rect['left']-bigimg_rect['left'])*zoom_ratio;

            // 设置大图对应放大镜的位置
            wImgZoomBigger[0].scrollTop  = scroll_top;
            wImgZoomBigger[0].scrollLeft = scroll_left;
        }
        // 隐藏放大镜大图
        function imgZoomBiggerHide(){
            var wImgZoomBigger = W('#ImgZoomBigger');
            if (wImgZoomBigger.length) {

                wImgZoomBigger.removeNode();
            }
        }

        // 放大镜位置标识块显示
        function imgZoomCoverShow(top, left){
            var wImgZoomCover = W('#ImgZoomCover');
            if (!wImgZoomCover.length) {
                wImgZoomCover = W('<div class="img-zoom-cover" id="ImgZoomCover"></div>');
                wImgZoomCover.appendTo(W('.p-pic-shower')[0]);
            }
            wImgZoomCover.show();

            var rect = wImgZoomCover.getRect();
            wImgZoomCover.css({
                'position': 'absolute',
                'width' : cover_size,
                'height': cover_size,
                'top': top,
                'left': left
            });
        }
        // 放大镜位置标识块隐藏
        function imgZoomCoverHide(){
            var wImgZoomCover = W('#ImgZoomCover');
            if (wImgZoomCover.length) {

                wImgZoomCover.removeNode();
            }
        }
        // 获取放大镜在文档中的位置
        function getZoomCoverRect(){
            var wImgZoomCover = W('#ImgZoomCover');
            if (!wImgZoomCover.length) {
                return ;
            }

            return wImgZoomCover.getRect();
        }


        // 设置商品大图容器在文档中的位置
        function resetShowerRect(){
            var shower_rect = window.shower_rect = window.shower_rect || {
                'borderwidth': 0,
                'width': 0,
                'height': 0,
                'left': 0,
                'top': 0
            };

            var wImgShower = W('.p-pic-shower'),
                wImgShower_rect = wImgShower.getRect();

            shower_rect['borderwidth'] = wImgShower.borderWidth();

            shower_rect['left'] = wImgShower_rect['left'];
            shower_rect['top']  = wImgShower_rect['top'];

            shower_rect['width']  = wImgShower_rect['width'];
            shower_rect['height'] = wImgShower_rect['height'];

            return shower_rect;
        }
        // 获取商品大图容器在文档中的位置
        function getShowerRect(){
            var shower_rect = window.shower_rect;
            if (typeof shower_rect=='undefined') {
                shower_rect = resetShowerRect();
            }

            return shower_rect;
        }

        // 设置商品大图在文档中的位置
        function resetBigimgRect(){
            var bigimg_rect = window.bigimg_rect = window.bigimg_rect || {
                'width': 0,
                'height': 0,
                'left': 0,
                'top': 0
            };

            var wImg = W('.p-pic-shower img'),
                wImg_rect = wImg.getRect();

            bigimg_rect['left'] = wImg_rect['left'];
            bigimg_rect['top']  = wImg_rect['top'];

            bigimg_rect['width']  = wImg_rect['width'];
            bigimg_rect['height'] = wImg_rect['height'];

            return bigimg_rect;
        }
        // 获取商品大图容器在文档中的位置
        function getBigimgRect(){
            var bigimg_rect = window.bigimg_rect;
            if (typeof bigimg_rect=='undefined') {
                bigimg_rect = resetBigimgRect();
            }

            return bigimg_rect;
        }

        tcb.setImgElSize(W('.p-pic-item img'), 54, 54);
        tcb.setImgElSize(W('.p-pic-shower img'), 435, 435);

        // 预加载图片
        function preLoadImg(img_arr, delay) {
            img_arr = img_arr || [];
            if (typeof img_arr === 'string') {
                img_arr = [img_arr];
            }
            if ( !(img_arr instanceof Array) ) {
                img_arr = [img_arr.toString()];
            }

            delay = delay || 1; // 毫秒

            // 加载图片
            setTimeout(function(){

                img_arr.forEach(function(val, i){

                    var img = new Image();
                    img.src = val;

                });
            }, delay);

        }

        // 加载商品图片
        function loadProductImg(){
            var product_id = tcb.queryUrl(window.location.search, 'product_id')
            if (!product_id){
                product_id = window.location.pathname
                    .replace('/youpin/product/', '')
                    .replace('.html', '')
            }

            var request_url = '/youpin/aj_get_realityimg?product_id='+product_id;
            QW.loadJsonp(request_url, function(res){

                if (!res['errno']) {
                    var result = res['result'];
                    if ( !(result && result['min'] && result['min'].length) ) {
                        return ;
                    }
                    var html_str = []
                    var imgsBig = []
                    var imgsOriginal = []
                    result['min'].forEach(function(min_src, i){
                        // 遍历小图的时候处理原始图片,让其最大宽度为900px，大图为450
                        imgsBig[i] = result['original'][i].replace('.com/', ".com/dr/450__/")
                        imgsOriginal[i] = result['original'][i].replace('.com/', ".com/dr/900__/")

                        var class_right = '';
                        if ( (i+2)%6==0 ){
                            class_right = ' p-pic-last';
                        }

                        var t_width  = 54,
                            t_height = 54;
                        // 获取图片原始尺寸，然后根据原始宽高，设置元素等比宽高
                        tcb.getImageSize(min_src, function(orig_width, orig_height){
                            var w_ratio = t_width/orig_width,
                                h_ratio = t_height/orig_height;

                            var n_width, n_height;
                            // 预设尺寸和原始尺寸宽度比，大于 高度比，
                            // 则表示预设尺寸宽度被拉伸，那么宽度应该设置为auto，高度设置为预设高度；
                            // 反之亦然；
                            if (w_ratio>h_ratio) {
                                //n_width = 'auto';
                                n_width  = orig_width*h_ratio;
                                n_height = t_height;
                            } else {
                                n_width  = t_width;
                                //n_height = 'auto';
                                n_height = orig_height*w_ratio;
                            }

                            html_str[i] = '<div class="p-pic-item'+class_right+'" data-big="'+imgsBig[i]+'" data-origsrc="'+imgsOriginal[i]+'">'
                                +'<img src="'+min_src+'" alt="" style="width:'+n_width+'px;height:'+n_height+'px;"></div>';
                        })

                    })

                    var
                        waiting = 0,
                        waiting_max = 399
                    setTimeout(function(){
                        if (waiting > waiting_max || countArray(html_str)==result['min'].length) {
                            html_str = html_str.join('')
                            W('.p-pic-list').insertAdjacentHTML('beforeend', html_str)
                        } else {
                            waiting++

                            setTimeout(arguments.callee, 50)
                        }
                    }, 50)

                    preLoadImg(imgsBig, 800);
                    preLoadImg(imgsOriginal, 1500);

                    var wZhenjiDesc = W('.p-detail-cnt-zhenji'),
                        wZhenjiDescInner = wZhenjiDesc.query('.cnt-inner');
                    if (!(wZhenjiDescInner && wZhenjiDescInner.length && wZhenjiDescInner.html().trim())){
                        var zhenjiimg_str = '<div class="top-label"><h4>真机实拍</h4></div>' +
                            '<div class="cnt-inner clearfix">'
                        imgsOriginal.forEach(function(orig_src){
                            zhenjiimg_str += '<p class="zhenji-img"><img src="'+orig_src+'">';
                        })
                        zhenjiimg_str += '</div>'
                        wZhenjiDesc.html(zhenjiimg_str)
                    }
                } else {
                    // do nothing
                }
            });
        }
        loadProductImg()

        // 计算数组的真实长度
        function countArray (arr) {
            var
                count = 0
            if (arr instanceof Array) {
                for (var i = 0; i < arr.length; i++) {
                    if (typeof arr[ i ] !== 'undefined') {
                        count++
                    }
                }
            }

            return count
        }

    });

    // 换新回收相关（商品详情页内嵌功能）
    var HuanxinHuishou = (function () {
        var _inclient = false,
            _from = 'liangpin_huanxin';
        var _brandListCache = {"1000000":[[{"model_id":4,"model_alis":"\u82f9\u679ciPhone 5S","sub_arr":[20522,20250,19826,20503,20169,20450],"img_url":"https:\/\/p0.ssl.qhmsg.com\/t01d6cc12484802289f.jpg","rec_price":2550}, {"model_id":2,"model_alis":"\u82f9\u679ciPhone 4S","sub_arr":[20700,14515,20699,20701],"img_url":"https:\/\/p0.ssl.qhmsg.com\/t01e302dbcd00e7a799.jpg","rec_price":835}, {"model_id":3,"model_alis":"\u82f9\u679ciPhone 5","sub_arr":[17254,17596,20751],"img_url":"https:\/\/p0.ssl.qhmsg.com\/t011bc9e6b64f8339f5.jpg","rec_price":1650}, {"model_id":6,"model_alis":"\u82f9\u679ciPhone 6","sub_arr":[20694,20696,20771,20698],"img_url":"https:\/\/p0.ssl.qhmsg.com\/t01068fe5e76aa7e910.jpg", "rec_price":4500}, {"model_id":"20229","model_alis":"\u5c0f\u7c73M3","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0162abdc2a51334cf5.jpg","rec_price":600}, {"model_id":"19800","model_alis":"\u5c0f\u7c732S","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0121130af30d4c0f66.jpg","rec_price":500}, {"model_id":"17125","model_alis":"\u4e09\u661fGalaxy S3","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01c2395e39f110a70e.jpg","rec_price":500}, {"model_id":14,"model_alis":"\u82f9\u679ciPad mini","sub_arr":[17346,17343],"img_url":"https:\/\/p3.ssl.qhmsg.com\/t01811d160457b44994.jpg","rec_price":1000}],          [ {"model_id":"20522","model_alis":"\u82f9\u679ciPhone 5S \u6c34\u8d27","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01d6cc12484802289f.jpg","pid":4},{"model_id":"20250","model_alis":"\u82f9\u679ciPhone 5S \u79fb\u52a84G (A1530)","img_url":"https:\/\/p4.ssl.qhmsg.com\/t015f4b45d64208feb4.jpg","pid":4},{"model_id":"19826","model_alis":"\u82f9\u679ciPhone 5S \u8054\u901a\u7248 (A1528)","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01ddf19cbaa3a791b7.jpg","pid":4},{"model_id":"20503","model_alis":"\u82f9\u679ciPhone 5S \u79fb\u52a8\u7248 (A1518)","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01ddf19cbaa3a791b7.jpg","pid":4},{"model_id":"20169","model_alis":"\u82f9\u679ciPhone 5S \u7535\u4fe1\u7248 (A1533)","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0178461f7a5c781648.jpg","pid":4},{"model_id":"20450","model_alis":"\u82f9\u679ciPhone 5S \u6e2f\u7248 (A1530)","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01d6cc12484802289f.jpg","pid":4},{"model_id":"20700","model_alis":"\u82f9\u679ciphone 4s \u56fd\u884c","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01e302dbcd00e7a799.jpg","pid":2},{"model_id":"14515","model_alis":"\u82f9\u679ciPhone 4S \u7535\u4fe1\u7248","img_url":"https:\/\/p4.ssl.qhmsg.com\/t0139c407fee8d937ac.jpg","pid":2},{"model_id":"20699","model_alis":"\u82f9\u679ciPhone 4s \u6e2f\u884c","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01e302dbcd00e7a799.jpg","pid":2},{"model_id":"20701","model_alis":"\u82f9\u679ciPhone 4s \u6c34\u8d27 \u65e0\u9501\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01e302dbcd00e7a799.jpg","pid":2},{"model_id":"19827","model_alis":"\u82f9\u679ciPhone 5C","img_url":"https:\/\/p1.ssl.qhmsg.com\/t01cd4a2e326f55cd14.jpg","pid":5},{"model_id":"20752","model_alis":"\u82f9\u679ciPhone 5C \u6c34\u8d27","img_url":"https:\/\/p1.ssl.qhmsg.com\/t01cd4a2e326f55cd14.jpg","pid":5},{"model_id":"20205","model_alis":"\u82f9\u679ciPhone 5C \u7535\u4fe1\u7248","img_url":"https:\/\/p1.ssl.qhmsg.com\/t01278e41519ab0e0d8.jpg","pid":5},{"model_id":"20722","model_alis":"\u82f9\u679ciPhone 5C \u79fb\u52a84G\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01d3dc50c4a1455e78.jpg","pid":5},{"model_id":"17254","model_alis":"\u82f9\u679ciPhone 5 \u8054\u901a\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t011bc9e6b64f8339f5.jpg","pid":3},{"model_id":"17596","model_alis":"\u82f9\u679ciPhone 5 \u7535\u4fe1\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t011bc9e6b64f8339f5.jpg","pid":3},{"model_id":"20751","model_alis":"\u82f9\u679ciPhone 5 \u6c34\u8d27","img_url":"https:\/\/p0.ssl.qhmsg.com\/t011bc9e6b64f8339f5.jpg","pid":3},{"model_id":"17346","model_alis":"\u82f9\u679ciPad mini\uff084G\u7248\uff09","img_url":"https:\/\/p3.ssl.qhmsg.com\/t01811d160457b44994.jpg","pid":14},{"model_id":"17343","model_alis":"\u82f9\u679ciPad mini\uff08WiFi\u7248\uff09","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01811d160457b44994.jpg","pid":14},{"model_id":"20546","model_alis":"\u5c0f\u7c73\u7ea2\u7c73Note \u589e\u5f3a\u7248 \u79fb\u52a84G","img_url":"https:\/\/p0.ssl.qhmsg.com\/t016acb70aa1f0dbcb1.jpg","pid":20299},{"model_id":"20545","model_alis":"\u5c0f\u7c73\u7ea2\u7c73Note \u589e\u5f3a\u7248 \u8054\u901a4G","img_url":"https:\/\/p0.ssl.qhmsg.com\/t016acb70aa1f0dbcb1.jpg","pid":20299},{"model_id":"20544","model_alis":"\u5c0f\u7c73\u7ea2\u7c73Note \u589e\u5f3a\u7248 \u8054\u901a3G","img_url":"https:\/\/p0.ssl.qhmsg.com\/t016acb70aa1f0dbcb1.jpg","pid":20299},{"model_id":"20337","model_alis":"\u5c0f\u7c73\u7ea2\u7c73Note \u589e\u5f3a\u7248 \u79fb\u52a83G","img_url":"https:\/\/p0.ssl.qhmsg.com\/t017220e1e0cb37a279.jpg","pid":20299},{"model_id":"20299","model_alis":"\u5c0f\u7c73\u7ea2\u7c73NOTE \u6807\u51c6\u7248 \u79fb\u52a83G","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01533286d93c983245.jpg","pid":20299},{"model_id":"20442","model_alis":"\u5c0f\u7c73\u7ea2\u7c73Note \u7279\u522b\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01f5b51bef8ef20167.jpg","pid":20299},{"model_id":"17754","model_alis":"\u5c0f\u7c732S","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01a07a03eead122fa4.jpg","pid":19800},{"model_id":"19799","model_alis":"\u5c0f\u7c732S \u7535\u4fe1\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0164c055a8459f63d2.jpg","pid":19800},{"model_id":"19800","model_alis":"\u5c0f\u7c732S \u8054\u901a\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0121130af30d4c0f66.jpg","pid":19800},{"model_id":"19870","model_alis":"\u5c0f\u7c73M3 \u79fb\u52a8\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01d54915fc8064de57.jpg","pid":20229},{"model_id":"20267","model_alis":"\u5c0f\u7c73M3 \u7535\u4fe1\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01b383545fe5f849cf.jpg","pid":20229},{"model_id":"20229","model_alis":"\u5c0f\u7c73M3 \u8054\u901a\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0162abdc2a51334cf5.jpg","pid":20229},{"model_id":"20694","model_alis":"\u82f9\u679ciPhone 6 \u6c34\u8d27\uff08\u5168\u7f51\u901a\uff09","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01068fe5e76aa7e910.jpg","pid":6},{"model_id":"20698","model_alis":"\u82f9\u679ciPhone 6 \u56fd\u884c\uff08A1586\uff09\u4e09\u7f51\u901a","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01068fe5e76aa7e910.jpg","pid":6},{"model_id":"20696","model_alis":"\u82f9\u679ciPhone6 \u56fd\u884c(A1589)\u79fb\u52a8\u5b9a\u5236\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20771","model_alis":"\u82f9\u679ciPhone 6 \u6e2f\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20695","model_alis":"\u82f9\u679ciPhone 6 Plus \u6e2f\u884c","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20779","model_alis":"\u82f9\u679ciPhone 6 Plus (A1593)\u79fb\u52a8\u5b9a\u5236\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20693","model_alis":"\u82f9\u679ciPhone 6 Plus \u6c34\u8d27(\u5168\u7f51\u901a)","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20697","model_alis":"\u82f9\u679ciPhone 6 Plus \u56fd\u884c(A1524)\u5168\u7f51\u901a","img_url":"https:\/\/p0.ssl.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20277","model_alis":"\u4e09\u661fGalaxy S3 Neo+\/I9308i \u79fb\u52a8\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01964a491c17b21727.jpg","pid":17125},{"model_id":"17125","model_alis":"\u4e09\u661fGalaxy S3\/I9308 \u79fb\u52a8\u7248","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01c2395e39f110a70e.jpg","pid":17125},{"model_id":"15344","model_alis":"\u4e09\u661fGalaxy S3\/I9300","img_url":"https:\/\/p0.ssl.qhmsg.com\/t01c12262a0a21b0bbb.jpg","pid":17125} ]]};

        /**
         * 显示品牌列表
         * @param params  目前包含3个参数：bid，品牌id，pid，父分类id，step，当前步骤
         * @param showall 是否显示全部项，默认不显示
         */
        function showModelList( params, showall){
            var bid = params['bid'];

            if(_brandListCache[bid]){

                var models = _brandListCache[bid];
                renderModelList(models, params, showall);

            }else{
                QW.Ajax.get('/huishou/getModels/?id='+bid +( _inclient? '&inclient=1' : '' ) +( _from? '&from='+_from : '' ) , function(data){
                    data = QW.JSON.parse(data);

                    if(!data.errno){

                        var models = data.result.data;
                        _brandListCache[bid] = models;
                        renderModelList(models, params, showall);
                    }
                });
            }
        }
        /**
         * 输出型号列表
         * @param models_arr
         * @param params 目前包含3个参数：bid，品牌id，pid，父分类id，step，当前步骤
         * @param showall 是否显示全部项，默认不显示
         */
        function renderModelList(models_arr, params, showall){
            var bid = params['bid'],
                pid = +params['pid'] || 0,
                step = +params['step'] || 0,
                models = models_arr[step],
                max_step = models_arr.length-1;

            var str = '';
            var SHORT_SHOW_NUM = 15;
            var max = showall? 99999 : SHORT_SHOW_NUM;

            if(!models || models.length==0){
                W('#modelListBox').html('<p style="padding:50px; text-align:center; font-size:14px;">暂无结果。</p>');
            }else{

                var count = 0;
                for(var i=0,n=models.length; i<n; i++){
                    var item = models[i];
                    item.pid = item.pid || 0;

                    // 参数的pid和数据的pid相等
                    if(item.pid==pid){
                        count++;
                        if(count>max){
                            continue;
                        }
                        if(max_step==step){
                            str += '<a class="check-item" href="/huishou/pinggu/?model_id='+item.model_id+( _inclient? '&inclient=1' : '' ) +( _from? '&from='+_from : '' )+'" title="'+item.model_alis+'" target="_blank"><img src="'+item.img_url+'" height="60"><span class="phone-name">'+item.model_alis+'</span></a>';
                        } else {
                            str += '<a class="check-item" href="#" title="'+item.model_alis+'" data-bid="'+bid+'" data-step="'+(step+1)+'" data-id="'+item.model_id+'" data-name="'+item.model_alis+'">'
                                +'<img src="'+item.img_url+'" height="60"><span class="phone-name">'+item.model_alis+'</span>'+(item.rec_price?('<span class="phone-recprice">热收价 ￥'+item.rec_price+'</span>'):'')+'</a>';
                        }
                    }
                    //str += '<a class="check-item" href="/huishou/pinggu/?model_id='+item.model_id+( _inclient? '&inclient=1' : '' ) +( _from? '&from='+_from : '' )+'" title="'+item.model_alis+'"><img src="'+item.img_url+'" height="60"><span class="phone-name">'+item.model_alis+'</span></a>';
                }
                if(!showall && count>SHORT_SHOW_NUM){
                    str += '<a class="check-item c5b0 show-brand-all" href="#" data-bid="'+bid+'" data-step="'+step+'" data-pid="'+pid+'">全部&gt;</a>';
                }

                W('#modelListBox').html(str);
            }
        }

        tcb.bindEvent(document.body, {
            //展示某品牌前14型号
            '.brand-list .brand-item' : function(e){
                e.preventDefault();

                var wMe = W(this);
                wMe.addClass('brand-item-curr').siblings('.brand-item-curr').removeClass('brand-item-curr');

                var params = {
                    'bid': wMe.attr('data-bid'),
                    'pid': 0
                };
                showModelList(params,true);

            },
            // 选择机型（有评估地址，直接跳到评估地址，否则进入子分类）
            '#modelListBox .check-item': function(e){
                var wMe = W(this),
                    m_id = wMe.attr('data-id');

                if(wMe.attr('href')=='#'|| m_id){
                    e.preventDefault();

                    var params = {
                        'bid': wMe.attr('data-bid'),
                        'pid': +m_id || 0,
                        'step': +wMe.attr('data-step') || 0
                    };
                    showModelList(params,true);
                }
            }

        });

        return {

        };
    }());
    //显示大图切换按钮
    function showSwitchBtn(wCur){
        var wPrev = wCur.previousSibling('.shaitu-pic');
        var wNext = wCur.nextSibling('.shaitu-pic');
        var big_pic = wCur.ancestorNode('.shaitu-box').siblings('.pic-big');

        if(wCur.ancestorNode('.shaitu-box').query('.shaitu-pic').length>1){
            if(!(wPrev&&wPrev.length)){
                big_pic.query('.next').show();
                big_pic.query('.prev').hide();
            }else if(!(wNext&&wNext.length)){
                big_pic.query('.prev').show();
                big_pic.query('.next').hide();
            }else{
                big_pic.query('span').show();
            }
        }

    }
    //评价晒图
    tcb.bindEvent(W('.page-liangpin-product')[0],{
        // 点击小图
        '.shaitu-box .shaitu-pic': function(e){
            e.preventDefault();
            var wMe = W(this);
            var pic_big = wMe.ancestorNode('.shaitu-box').siblings('.pic-big');

            if(wMe.hasClass('shaitu-pic-cur')){
                wMe.removeClass('shaitu-pic-cur').css('cursor','zoom-in');
                pic_big.hide();
            } else {
                wMe.addClass('shaitu-pic-cur').css('cursor','zoom-out')
                    .siblings('.shaitu-pic-cur').removeClass('shaitu-pic-cur');

                pic_big.show();

                var pic_src = wMe.query('img').attr('data-big');
                pic_big.query('img').attr('src',pic_src);
                tcb.setImgElSize(W('.pic-big img'),270,270, true);
            }

        },
        // 移入、移出大图
        '.pic-big':{
            'mouseenter':function(e){
                e.preventDefault();
                var wMe = W(this);
                var wCur = wMe.siblings('.shaitu-box').query('.shaitu-pic-cur');
                showSwitchBtn(wCur);
                wMe.query('.clo').show();

            },
            'mouseleave':function(e){
                e.preventDefault();
                var wMe = W(this);
                wMe.query('.clo').hide();
                wMe.query('span').hide();
            }
        },
        // 关闭大图显示
        '.pic-big .clo':function(e){
            e.preventDefault();
            var wMe = W(this);
            wMe.ancestorNode('.pic-big').hide()
                .siblings('.shaitu-box').query('.shaitu-pic-cur').removeClass('shaitu-pic-cur').css('cursor','zoom-in');
        },
        // 左右切换大图
        '.pic-big span':function(e){
            e.preventDefault();
            var wMe = W(this);
            var wCur = wMe.ancestorNode('.pic-big').siblings('.shaitu-box').query('.shaitu-pic-cur');
            var wPrev = wCur.previousSibling('.shaitu-pic');
            var wNext = wCur.nextSibling('.shaitu-pic');
            var wTarg;

            if(wMe.hasClass('prev')){
                wTarg=wPrev;
            }
            else if(wMe.hasClass('next')){
                wTarg=wNext;
            }
            if( !(wTarg&&wTarg.length) ){
                return ;
            }
            wTarg.addClass('shaitu-pic-cur').siblings('.shaitu-pic').removeClass('shaitu-pic-cur');
            var pic_src = wTarg.query('img').attr('data-big');

            showSwitchBtn(wTarg);

            wMe.ancestorNode('.pic-big').query('img').attr('src',pic_src);
            tcb.setImgElSize(W('.pic-big img'),270,270, true);
        }
    });
}());
