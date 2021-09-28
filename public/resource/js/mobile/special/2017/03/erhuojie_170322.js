wx.ready(function(){
    var noop = function(){};
    var wxData = {};

    // 微信分享成功
    function wxShareSuccess(){
        window.location.href = 'http://m.bang.360.cn/promo/erhuoPromoCode';
    }
    // 微信分享的数据
    wxData = {
        "title": '3月花开来约“惠”，下单最高减150元！',
        "desc": '同城帮优品，3月约“惠”专场，领券立减最高150元，更有分期免息专区！',
        "link" :  window.location.protocol+'//'+window.location.host+window.location.pathname,
        "imgUrl" : 'https://p1.ssl.qhmsg.com/t01e3fb5011c26fc826.png',
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

;(function () {

    //通用输出模板变量
    function getProduct(obj) {
        $.get(obj.request_url,function (res) {
            try {
                res = $.parseJSON(res);

                if (!res['errno']) {

                    var product_list =res['result']['product_list'] || res['result']['good_list'] || res['result']['flash_list'] || res['result'];
                    // 限制显示商品数量
                    product_list.splice(parseInt(obj.num, 10), 9999);

                    // 获取商品列表的html字符串
                    obj.com_price_tit = obj.com_price_tit || '新机价：';
                    obj.price_tit = obj.price_tit || '优品价';

                    var html_fn = $.tmpl($.trim(obj.$tpl.html())),
                        html_str = html_fn({
                            'list': product_list,
                            'is_flash': obj.is_flash,
                            'huodong_name': 'erhuojie_1703',
                            'com_price_tit':obj.com_price_tit,
                            'price_tit':obj.price_tit
                        });

                    $.each(product_list, function (item, i) {
                        tcb.preLoadImg(item['thum_img']);
                    });
                    // 输出数据  判断是追加还是替换
                    if (obj.is_append) {
                        obj.$target.append(html_str);
                    } else {
                        obj.$target.html(html_str);
                    }


                    setTimeout(function () {
                        tcb.lazyLoadImg({
                            'delay': 0,
                            'interval': 300 // 0:同时显示，其他时间表示实际时间间隔
                        }, obj.$target);
                    }, 300);
                    typeof obj['callback'] === 'function' && obj['callback'](obj.$target, product_list)

                } else {

                }

            } catch (ex) {
            }

        });

    }
    //苹果专区
    getProduct ({
        'request_url' : '/youpin/doGetProductListByBrand?brand_id=2',
        '$tpl'        : $("#JsMProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 8,
        '$target'     : $ (".js-ios-product-list")
    });
    //安卓专区
    getProduct ({
        'request_url' : '/youpin/doGetAndroidList',
        '$tpl'        : $("#JsMProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 8,
        '$target'     : $ (".js-android-product-list")
    });
    //dell电脑
    getProduct ({
        'request_url' : '/youpin/doGetDellList',
        '$tpl'        : $("#JsMProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 8,
        '$target'     : $ (".js-dell-product-list")
    });
    //分期免息
    getProduct ({
        'request_url' : '/youpin/doGetMianxiList',
        '$tpl'        : $("#JsMProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 8,
        '$target'     : $ (".js-mianxi-product-list")
    });
    //限时秒杀
    getProduct ({
        'request_url' : '/youpin/doGetFlashSaleGoods',
        '$tpl'        : $ ("#JsMProductListVer17Tpl"),
        'is_flash'    : true,
        'num'         : 4,
        '$target'     : $ (".js-flash-product-list"),
        'price_tit':'秒杀价',
        callback:function ($target,product_list){
            countDown($target,product_list)
            $target.find('.item').append('<span class="p-label"><img class="w100" src="https://p.ssl.qhimg.com/t01ac01cbb60d95c7b9.png" alt=""/></span>');
        }
    });
    //倒计时
    function countDown($target,product_list){
        $target.find('.countdown').each(function (index){
            var me = $(this),
                product = product_list[index],
                current_time = window.CURRENT_TIME || Date.now(),
                flash_start_time = new Date(product['flash_start_time'].replace(/-/g, '/')).getTime(),
                flash_end_time = new Date(product['flash_end_time'].replace(/-/g, '/')).getTime();

            //抢购未开始
            if (!product['flash_saling'] && current_time<flash_start_time) {
                //Bang.countdown_desc = '距开始';
                me.addClass('countdown-start-prev')
                    .attr('data-descbefore', '距开始')

                Bang.startCountdown(flash_start_time, current_time, me, {
                    'end': function(){
                        //Bang.countdown_desc = '距结束';
                        me.removeClass('countdown-start-prev')
                            .attr('data-descbefore', '距结束')
                        Bang.startCountdown(flash_end_time, flash_start_time, me, {
                            'end': function(){
                                me.hide().parents('.item').find('.p-label-soldout').show();

                            }
                        });
                    }
                });

            }
            // 抢购进行中
            else if (product['flash_saling']==1 && product['flash_status']=='saling' && current_time<flash_end_time) {
                //Bang.countdown_desc = '距结束';
                me.removeClass('countdown-start-prev')
                    .attr('data-descbefore', '距结束');
                Bang.startCountdown(flash_end_time, current_time, me, {
                    'end': function(){
                        me.hide().parents('.item').find('.p-label-soldout').show();

                    }
                });

            }
            else {
                me.hide().parents('.item').find('.p-label-soldout').show();

            }
        });
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
        // 获取优惠券
        $('.btn-get-coupon').on('click', function(e){
            e.preventDefault();

            window.location.hash = 'share';
        });
        $(window).on('hashchange load', function(e){
            var hashs = tcb.parseHash();

            if (typeof hashs['share']!=='undefined'){
                // 关闭分享成功
                closeShareSuc();

                // 分享引导
                window.Bang.ShareIntro.active({
                    hash: 'share',
                    ext_html: '<div class="share-cont"><div class="tit">即得450元优惠券</div><p class="num">已有'+window._join_count+'人领取优惠券</p></div>'
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
            }
            // ,
            // // 点击商品
            // '.product-list a': function(e){
            //     var $me = $(this);
            //
            //     if ($me.find('.p-label-soldout').length) {
            //         e.preventDefault();
            //
            //         return;
            //     }
            // }

        });

    }

    init();

})()