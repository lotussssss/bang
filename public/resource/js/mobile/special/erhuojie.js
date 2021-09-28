(function () {
    $(function(){
        window._END_FLAG = false;
        // 判断活动是否结束
        if (window._END_FLAG) {
            var html_str = $.tmpl( $.trim($('#JsMHDErHuoEndTipPanelTpl').html()) )({});

            tcb.showDialog(html_str, {
                'withClose': false,
                'className': 'erhuo-end-tip-panel-wrap'
            });

        }
    });

    // 基本动画
    function baseAnimate() {
        setTimeout(function(){

            $('body').addClass('page-init-animate');

        }, 10);
    }
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
    // 通用初始化
    function commonInit(){
        baseAnimate();

        // 页面加载完成后懒加载部分图片
        lazyLoadImg({
            'delay': 1,
            'interval': 0 // 0:同时显示，其他时间表示实际时间间隔
        });
    }
    commonInit();

    (function(){
        tcb.bindEvent(document.body, {
            // 点击导航tab
            '.nav-tab a': function(e){
                e.preventDefault();

                var $me = $(this),
                    pos = parseInt($me.attr('data-pos'), 10) || 0;

                var $nav_tab = $('.nav-tab'),
                    nav_tab_top = $nav_tab.filter('[data-pos="'+pos+'"]').offset()['top'];

                $.scrollTo({
                    'endY': nav_tab_top,
                    'duration': 300
                });
            },
            // 切换限时特价商品日期
            '.date-tab a': function(e){
                e.preventDefault();

                var $me = $(this),
                    date_key = '2015-'+$.trim($me.html()).replace('.', '-');

                //date_key = '2015-11-09';

                $me.closest('li').addClass('cur').siblings('.cur').removeClass('cur');

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
        // 九成新五折价
        function getWZJProduct(){
            var request_url = '/youpin/ehj_get_half_off_product?pn=0&num=8';
            $.get(request_url, function(res){
                try{
                    res = $.parseJSON(res);

                    if (!res['errno']) {
                        var product_list = res['result']['product_list'];

                        var html_str = getProductHtml(product_list, false);

                        renderProductList($('.js-wzj-product-list'), html_str);

                    } else {

                    }

                } catch (ex){}

            });

        }

        // 低到离谱
        function getDDLPProduct(){
            var request_url = '/youpin/ehj_get_under_hundred_product?pn=0&num=8';
            $.get(request_url, function(res){
                try{
                    res = $.parseJSON(res);

                    if (!res['errno']) {
                        var product_list = res['result']['product_list'];

                        var html_str = getProductHtml(product_list, false);

                        renderProductList($('.js-ddlp-product-list'), html_str);

                    } else {

                    }

                } catch (ex){}

            });

        }

        // 限时特价
        function getXSTHProduct(date_key){
            var flash_sale_product;
            if (window._Cache && window._Cache['flash_sale_product']) {
                flash_sale_product = window._Cache['flash_sale_product']
            }
            if (flash_sale_product) {
                date_key = date_key || '2015-'+$.trim($('.date-tab .cur a').html()).replace('.', '-');

                var product_list = flash_sale_product[date_key];

                var is_today = false;
                var today_date = '2015-'+fix2Length((new Date()).getMonth()+1)+'-'+fix2Length((new Date()).getDate());
                if (today_date === date_key){
                    is_today = true;
                }

                var html_str = getProductHtml(product_list, true, is_today);

                renderProductList($('.js-xsth-product-list'), html_str);

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

                            date_key = date_key || '2015-'+$.trim($('.date-tab .cur a').html()).replace('.', '-');

                            //date_key = '2015-11-06';
                            var product_list = flash_sale_product[date_key];

                            var is_today = false;
                            var today_date = '2015-'+fix2Length((new Date()).getMonth()+1)+'-'+fix2Length((new Date()).getDate());
                            if (today_date === date_key){
                                is_today = true;
                            }

                            var html_str = getProductHtml(product_list, true, is_today);

                            renderProductList($('.js-xsth-product-list'), html_str);

                        } else {

                        }

                    } catch (ex){}

                });

            }

        }

        // 获取商品列表的html字符串
        function getProductHtml(product_list, is_flash, is_today){
            is_today = is_today || false;
            var html_fn  = $.tmpl( $.trim($('#JsMErHuoJieProductListTpl').html())),
                html_str = html_fn({
                    'list': product_list,
                    'is_flash': is_flash,
                    'is_today': is_today
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
        getDDLPProduct();
        getXSTHProduct();

        /**
         * 修复为2个字符长度，长度不足以前置0补齐;
         * @return {[type]} [description]
         */
        function fix2Length(str){
            str = str.toString();
            return str.length < 2 ? '0' + str : str;
        }


    }());

    wx.ready(function(){
        var noop = function(){};
        var wxData = {};

        // 微信分享的数据
        wxData = {
            "title" : '11.22！二货节，靠谱二手机手机，低价抢!【同城帮】',
            "desc" : '11.22！二货节，靠谱二手机手机，低价抢!【同城帮】',
            "link" :  window.location.href,
            "imgUrl" : 'https://p.ssl.qhimg.com/t01724f7ec491bf1fa6.jpg',
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

}());
