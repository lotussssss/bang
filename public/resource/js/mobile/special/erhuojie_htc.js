$(function(){
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

            $.each(img_arr, function(i, val){

                var img = new Image();
                img.src = val;

            });
        }, delay);

    }
    // 懒加载图片
    function lazyLoadImg(options, $target) {
        if (typeof options==='number') {
            options = {
                'delay': options
            }
        }
        options = options || {};

        options = $.extend({
            'delay': 1,
            'interval': 0 // 0:同时显示，其他时间表示实际时间间隔
        }, options);

        var delay = options['delay'] || 1, // 毫秒
            interval = options['interval'] || 0; // 图片加载顺序间隔

        var _time = 0;
        setTimeout(function(){

            var $img;
            if ($target && $target.length){
                $img = $target.find('img');
            } else {
                $img = $('img');
            }

            $img.each(function(i, el){
                var $el = $(el),
                    src_holder = $el.attr('src'),
                    src = $el.attr('data-lazysrc');

                if (tcb.isRealUrl(src) && src_holder!==src) {
                    if (interval) {
                        setTimeout(function(){

                            $el.css({
                                'opacity': 0
                            });
                            $el.attr('src', src);
                            $el.animate({
                                'opacity': 1
                            }, interval);

                        }, _time);

                        _time += interval;
                    } else {

                        $el.css({
                            'opacity': 0
                        });
                        $el.attr('src', src);
                        $el.animate({
                            'opacity': 1
                        }, 300);

                    }
                }
            });

        }, delay);
    }




    // 精品
    function _forHotJingpin(jingpin_list){
        var list_arr = jingpin_list;

        list_arr.splice(4);

        var html_str = getProductHtml(list_arr, false);

        renderProductList($('.product_list_flash'), html_str);
    }
    // 限时特价
    function _forHotFlash(flash_list, curtime){
        var list_arr = flash_list;

        list_arr.splice(4);

        var html_str = getProductHtml(list_arr, true);

        renderProductList($('.product_list_flash'), html_str);

        // 服务器当前时间(精确到毫秒)
        curtime = Date.parse(curtime.replace(/-/g, '/')) || (new Date()).getTime();
        // 遍历倒计时
        $('.product_list_flash').find('.countdown').forEach(function(el, i){
            var wEl = $(el),
                curproduct = list_arr[i], // 和当前计时器对应的商品信息
                starttime = curproduct['flash_start_time'].replace(/-/g, '/'),//'2015-11-09 18:00:40',//
                endtime   = curproduct['flash_end_time'].replace(/-/g, '/');//'2015-11-09 16:22:40';//
            starttime = Date.parse(starttime) || 0;
            endtime   = Date.parse(endtime) || 0;

            // 开始前倒计时
            if (!curproduct['flash_saling'] && curtime<starttime) {

                Bang.countdown_desc = '距开始：';
                wEl.addClass('countdown-start-prev');
                Bang.startCountdown(starttime, curtime, wEl, {
                    'end': function(){
                        wEl.closest('.slide-item').find('.p-buy-disabled').removeClass('p-buy-disabled').html('立即抢购>');

                        Bang.countdown_desc = '距结束：';
                        wEl.removeClass('countdown-start-prev');

                        Bang.startCountdown(endtime, starttime, wEl, {
                            'end': function(){
                                wEl.closest('.slide-item').find('.p-buy').addClass('p-buy-disabled').html('已售出');

                                wEl.html('已售出').addClass('countdown-end-next');
                            }
                        });
                    }
                });

            }
            // 抢购进行中&商品未被拍下
            else if (curproduct['flash_saling']==1 && curproduct['flash_status']=='saling' && curtime<endtime) {

                Bang.countdown_desc = '距结束：';
                wEl.removeClass('countdown-start-prev');

                Bang.startCountdown(endtime, curtime, wEl, {
                    'end': function(){
                        wEl.closest('.slide-item').find('.p-buy').addClass('p-buy-disabled').html('已售出');

                        wEl.html('已售出').addClass('countdown-end-next');
                    }
                });

            }
            // 抢购中&商品被拍下
            else if (curproduct['flash_saling']==1 && curproduct['flash_status']=='saling' && curtime<endtime) {
                wEl.closest('.slide-item').find('.p-buy').addClass('p-buy-disabled').html('已售出');

                wEl.html('已售出').addClass('countdown-end-next');
            } else {
                wEl.closest('.slide-item').find('.p-buy').addClass('p-buy-disabled').html('已售出');

                wEl.html('已售出').addClass('countdown-end-next');
            }

        });
    }

    // 九成新五折价
    function getWZJProduct(){
        var request_url = '/youpin/ehj_get_half_off_product?pn=0&num=4';
        $.get(request_url, function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {
                    var product_list = res['result']['product_list'];

                    var html_str = getProductHtml(product_list, false);

                    renderProductList($('.product_list_wzj'), html_str);

                } else {

                }

            } catch (ex){}

        });

    }

    // 限时特价
    function getXSTHProduct(){
        var request_url = '/youpin/aj_get_flash_sale_goods';
        $.get(request_url, function(res){
            //try{
                res = $.parseJSON(res);

                if (!res['errno']) {
                    var result = res['result'],
                        curtime = result['time'],
                        flash_list   = result['flash_list'],   // 闪购
                        jingpin_list = result['jingpin_list']; // 精品

                    // 限时特价
                    if(flash_list && flash_list.length) {
                        _forHotFlash(flash_list, curtime);
                    }
                    // 精品
                    else if (jingpin_list && jingpin_list.length) {
                        _forHotJingpin(jingpin_list);
                    }
                } else {
                    //数据异常
                }

            //} catch (ex){}

        });

    }

    // 获取商品列表的html字符串
    function getProductHtml(product_list, is_flash){
        var html_fn  = $.tmpl( $.trim($('#JsMErHuoJieHtcProductListTpl').html())),
            html_str = html_fn({
                'list': product_list,
                'is_flash': is_flash
            });

        $.each(product_list, function (item, i) {
            preLoadImg(item['thum_img']);
        });

        return html_str;
    }

    function renderProductList($target, html_str){
        $target.html(html_str);

        setTimeout(function(){
            lazyLoadImg({
                'delay': 0,
                'interval': 300 // 0:同时显示，其他时间表示实际时间间隔
            }, $target);
        }, 300);
    }

    getWZJProduct();
    getXSTHProduct();
    
});

wx.ready(function(){
    var noop = function(){};
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title" : 'HTC经典来袭，不止5折！',
        "desc" : '同城帮优品携手HTC，高端旗舰仅950元起！还赠原装智能立显手机壳！',
        "link" :  window.location.href,
        "imgUrl" : 'https://p.ssl.qhimg.com/t01c2c073f5001adb98.png',
        "success": noop, // 用户确认分享的回调
        "cancel": noop // 用户取消分享
    };

    // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
    wx.onMenuShareAppMessage(wxData);
    // 点击分享到朋友圈，会执行下面这个代码
    wx.onMenuShareTimeline(wxData);
    //分享到QQ
    wx.onMenuShareQQ(wxData);
});
