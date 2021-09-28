$(function(){
    /**
     * 修复为2个字符长度，长度不足以前置0补齐;
     * @return {[type]} [description]
     */
    function fix2Length(str){
        str = str.toString();
        return str.length < 2 ? '0' + str : str;
    }

    // 限时特价
    function getXSTHProduct(date_key){
        var flash_sale_product;
        if (window._Cache && window._Cache['flash_sale_product']) {
            flash_sale_product = window._Cache['flash_sale_product']
        }
        if (flash_sale_product) {
            if (!date_key) {
                var $li = $('.date-tab li'),
                    $cur_li = $li.filter(function(el){ return $(el).hasClass('cur'); });
                if ( !($cur_li && $cur_li.length) ){
                    $cur_li = $li.first().addClass('cur');
                }
                date_key = $cur_li.attr('data-date');
            }

            var product_list = flash_sale_product[date_key];

            var is_today = false;
            var today_date_obj = new Date(),
                today_date = today_date_obj.getFullYear()+'-'+fix2Length(today_date_obj.getMonth()+1)+'-'+fix2Length(today_date_obj.getDate());
            if (today_date === date_key){
                is_today = true;
            }

            var html_str = getProductHtml(product_list, true, is_today);

            renderProductList($('.product-list-flash'), html_str);

        } else {
            var request_url = '/youpin/ehj_get_flash_sale_product';
            $.get(request_url, function(res){
                try{
                    res = $.parseJSON(res);

                    if (!res['errno']) {
                        if (typeof window._Cache==='undefined') {
                            window._Cache = {};
                        }
                        flash_sale_product = window._Cache['flash_sale_product'] = res['result']['product_list'];

                        if (!date_key) {
                            var $li = $('.date-tab li'),
                                $cur_li = $li.filter(function(){
                                    return $(this).hasClass('cur');
                                });
                            if ( !($cur_li && $cur_li.length) ){
                                $cur_li = $li.first().addClass('cur');
                            }
                            date_key = $cur_li.attr('data-date');
                        }

                        //date_key = '2015-11-06';
                        var product_list = flash_sale_product[date_key];

                        var is_today = false;
                        var today_date_obj = new Date(),
                            today_date = today_date_obj.getFullYear()+'-'+fix2Length(today_date_obj.getMonth()+1)+'-'+fix2Length(today_date_obj.getDate());
                        if (today_date === date_key){
                            is_today = true;
                        }

                        var html_str = getProductHtml(product_list, true, is_today);

                        renderProductList($('.product-list-flash'), html_str);

                    } else {

                    }

                } catch (ex){console.error(ex)}

            });
        }
    }

    // 九成新五折价
    function getWZJProduct(){
        var request_url = '/youpin/ehj_get_half_off_product?pn=0&num=8';
        $.get(request_url, function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {
                    var product_list = res['result']['product_list'];
                    var list_arr = product_list;

                    var len = list_arr.length,
                        col = 2,
                        row_max = 4;
                    if (len>col) {
                        var row = Math.floor(len/col);
                        row = row>row_max ? row_max : row;

                        list_arr.splice(parseInt(row*col, 10), 9999);
                    }

                    var html_str = getProductHtml(list_arr, false);

                    renderProductList($('.product-list-wzj'), html_str);

                } else {

                }

            } catch (ex){}

        });

    }

    // 苹果专区
    function getAppleProduct(){
        var request_url = '/youpin/aj_get_goods?keyword=&pn=0&sort=sale_down&brand_id=2&num=8';
        $.get(request_url, function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {
                    var list_arr = res['result']['good_list'];

                    var len = list_arr.length,
                        col = 2,
                        row_max = 4;
                    if (len>col) {
                        var row = Math.floor(len/col);
                        row = row>row_max ? row_max : row;

                        list_arr.splice(parseInt(row*col, 10), 9999);
                    }

                    var html_str = getProductHtml(list_arr, false);

                    renderProductList($('.product-list-apple'), html_str);

                } else {

                }

            } catch (ex){}

        });

    }
    // 三星专区
    function getSamsungProduct(){
        var request_url = '/youpin/aj_get_goods?keyword=&pn=0&sort=sale_down&brand_id=1&num=8';
        $.get(request_url, function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {
                    var list_arr = res['result']['good_list'];

                    var len = list_arr.length,
                        col = 2,
                        row_max = 4;
                    if (len>col) {
                        var row = Math.floor(len/col);
                        row = row>row_max ? row_max : row;

                        list_arr.splice(parseInt(row*col, 10), 9999);
                    }

                    var html_str = getProductHtml(list_arr, false);

                    renderProductList($('.product-list-samsung'), html_str);

                } else {

                }

            } catch (ex){}

        });

    }
    // 小米专区
    function getXiaomiProduct(){
        var request_url = '/youpin/aj_get_goods?keyword=&pn=0&sort=sale_down&brand_id=3&num=8';
        $.get(request_url, function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {
                    var list_arr = res['result']['good_list'];

                    var len = list_arr.length,
                        col = 2,
                        row_max = 4;
                    if (len>col) {
                        var row = Math.floor(len/col);
                        row = row>row_max ? row_max : row;

                        list_arr.splice(parseInt(row*col, 10), 9999);
                    }

                    var html_str = getProductHtml(list_arr, false);

                    renderProductList($('.product-list-xiaomi'), html_str);

                } else {

                }

            } catch (ex){}

        });

    }
    // 华为专区
    function getHuaweiProduct(){
        var request_url = '/youpin/aj_get_goods?keyword=&pn=0&sort=sale_down&brand_id=4&num=8';
        $.get(request_url, function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {
                    var list_arr = res['result']['good_list'];

                    var len = list_arr.length,
                        col = 2,
                        row_max = 4;
                    if (len>col) {
                        var row = Math.floor(len/col);
                        row = row>row_max ? row_max : row;

                        list_arr.splice(parseInt(row*col, 10), 9999);
                    }

                    var html_str = getProductHtml(list_arr, false);

                    renderProductList($('.product-list-huawei'), html_str);

                } else {

                }

            } catch (ex){}

        });

    }


    // 获取商品列表的html字符串
    function getProductHtml(product_list, is_flash, is_today){
        is_today = is_today || false;
        var html_fn  = $.tmpl( $.trim($('#JsMCommonErhuojieProductListTpl').html())),
            html_str = html_fn({
                'list': product_list,
                'is_flash': is_flash,
                'is_today': is_today,
                'coupon_code': window._coupon_code
            });

        if (product_list && product_list.length) {
            $.each(product_list, function (item, i) {
                tcb.preLoadImg(item['thum_img']);
            });
        }

        return html_str;
    }

    function renderProductList($target, html_str){
        $target.html(html_str);

        setTimeout(function(){
            tcb.lazyLoadImg({
                'delay': 0,
                'interval': 100 // 0:同时显示，其他时间表示实际时间间隔
            }, $target);
        }, 100);
    }

    // 分享成功
    function activeShareSuc(){
        var fn = $.tmpl( $.trim( $('#JsErhuojieShareSucTpl').html() ) ),
            str = fn();

        $('body').append(str);
        $('.mainbody').addClass('blur');

        var $ShareSuc = $('#ShareSuc');

        var mask_h = $('body').height(),
            window_h = $(window).height();
        if (mask_h<window_h){
            mask_h = window_h;
        }
        $ShareSuc.css({
            'height': mask_h
        });
    }
    // 关闭分享成功
    function closeShareSuc(){
        var $ShareSuc = $('#ShareSuc');

        if ($ShareSuc && $ShareSuc.length){
            $ShareSuc.remove();
        }

        $('.mainbody').removeClass('blur');
    }


    function init(){
        setTimeout(getXSTHProduct, 0);
        setTimeout(getWZJProduct, 100);
        setTimeout(getAppleProduct, 200);
        setTimeout(getSamsungProduct, 300);
        setTimeout(getXiaomiProduct, 350);
        setTimeout(getHuaweiProduct, 400);

        // 获取优惠券
        $('.btn-get-coupon').on('click', function(e){
            e.preventDefault();

            window.location.hash = 'share';
        });
        $(window).on('hashchange load', function(e){
            var hashs = tcb.parseHash();

            if (typeof hashs['share']!=='undefined' && !window._coupon_code){
                // 关闭分享成功
                closeShareSuc();

                // 分享引导
                window.Bang.ShareIntro.active({
                    hash: 'share',
                    ext_html: '<div class="share-cont"><div class="tit">即得180元优惠券</div><p class="num">已有'+window._join_count+'人领取优惠券</p></div>'
                });
            }
            else if (typeof hashs['share_suc']!=='undefined') {
                // 关闭分享引导
                window.Bang.ShareIntro.close();

                // 分享成功
                activeShareSuc();

            }
            else {
                // 关闭分享引导
                window.Bang.ShareIntro.close();
                // 关闭分享成功
                closeShareSuc();
            }
        });

        tcb.bindEvent(document.body, {
            // 立即使用优惠码
            '.btn-lijishiyong': function(e){
                e.preventDefault();

                var hashs = tcb.parseHash(window.location.hash);
                // hashs的kv对象中拥有此hash
                if ( typeof hashs['share_suc']!=='undefined' ) {
                    delete hashs['share_suc'];
                }

                window.location.hash = $.param(hashs)
            },
            // 切换限时特价商品日期
            '.date-tab a': function(e){
                e.preventDefault();

                var $me = $(this),
                    $li = $me.closest('li'),
                    date_key = $li.attr('data-date');

                $li.addClass('cur').siblings('.cur').removeClass('cur');

                getXSTHProduct(date_key);
            },
            // 点击商品
            '.product-list a': function(e){
                var $me = $(this);

                // 商品按钮有disabled的class，那么不让跳转
                if ($me.find('.btn-disabled').length && !($me.find('.btn-today').length || $me.find('.btn-sold').length)) {
                    e.preventDefault();

                    return;
                }
            }

        });

    }

    init();
});

wx.ready(function(){
    var noop = function(){};
    var wxData = {};

    // 微信分享成功
    function wxShareSuccess(){
        window.location.href = 'http://m.bang.360.cn/promo/erhuoPromoCode';
    }
    // 微信分享的数据
    wxData = {
        "title" : '4月天，放肆2！4.20-4.24靠谱二手机底价抢！',
        "desc" : '分享即得180元优惠券，领券再买省省省！',
        "link" :  window.location.protocol+'//'+window.location.host+window.location.pathname,
        "imgUrl" : 'https://p.ssl.qhimg.com/t0175973f57a5859785.jpg',
        "success": wxShareSuccess, // 用户确认分享的回调
        "cancel": noop // 用户取消分享
    };

    // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
    wx.onMenuShareAppMessage(wxData);
    // 点击分享到朋友圈，会执行下面这个代码
    wx.onMenuShareTimeline(wxData);
    //分享到QQ
    wx.onMenuShareQQ(wxData);
});
