Dom.ready(function(){
    //window._END_FLAG = true;
    // 判断活动是否结束
    if (window._END_FLAG) {
        var html_str = W('#JsHDErHuoEndTipPanelTpl').html().trim().tmpl()({});

        tcb.panel('', html_str, {
            'withClose': false,
            'keyEsc': false,
            'className': 'panel-tom01 erhuo-end-tip-panel-wrap'
        });

    }

    var pre_load_img_arr = ['https://p.ssl.qhimg.com/t015ed67ca5c790c369.png'];
    preLoadImg(pre_load_img_arr, 1000);

    // 事件绑定
    tcb.bindEvent(document.body, {
        // 切换限时特价商品日期
        '.date-tab a': function(e){
            e.preventDefault();

            var $me = W(this),
                date_key = '2015-'+$me.html().trim().replace('.', '-');

            //date_key = '2015-11-09';

            $me.ancestorNode('li').addClass('cur').siblings('.cur').removeClass('cur');

            getXSTHProduct(date_key);
        },
        // 点击商品
        '.product-list a': function(e){
            var $me = W(this);

            // 商品按钮有disabled的class，那么不让跳转
            if ($me.query('.btn-disabled').length && !($me.query('.btn-today').length || $me.query('.btn-sold').length)) {
                e.preventDefault();

                return;
            }
        },
        // 许愿手机
        '.btn-to-wish': function(e){
            e.preventDefault();

            tcb.panel('', '<img src="https://p.ssl.qhimg.com/t015ed67ca5c790c369.png">', {
                'className': 'panel-tom01 for-wish-panel'
            });
        }
    });


    // 九成新五折价
    function getWZJProduct(){
        var request_url = '/youpin/ehj_get_half_off_product?pn=0&num=8';
        QW.Ajax.get(request_url, function(res){
            try{
                res = JSON.parse(res);

                if (!res['errno']) {
                    var product_list = res['result']['product_list'];

                    var html_str = getProductHtml(product_list, false);

                    renderProductList(W('.js-wzj-product-list'), html_str);

                } else {

                }

            } catch (ex){}

        });

    }

    // 低到离谱
    function getDDLPProduct(){
        var request_url = '/youpin/ehj_get_under_hundred_product?pn=0&num=8';
        QW.Ajax.get(request_url, function(res){
            try{
                res = JSON.parse(res);

                if (!res['errno']) {
                    var product_list = res['result']['product_list'];

                    var html_str = getProductHtml(product_list, false);

                    renderProductList(W('.js-ddlp-product-list'), html_str);

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
            date_key = date_key || '2015-'+W('.date-tab .cur a').html().trim().replace('.', '-');

            var product_list = flash_sale_product[date_key];

            var is_today = false;
            var today_date = '2015-'+fix2Length((new Date()).getMonth()+1)+'-'+fix2Length((new Date()).getDate());
            if (today_date === date_key){
                is_today = true;
            }

            var html_str = getProductHtml(product_list, true,is_today);

            renderProductList(W('.js-xsth-product-list'), html_str);

        } else {
            var request_url = '/youpin/ehj_get_flash_sale_product';
            QW.Ajax.get(request_url, function(res){
                try{
                    res = JSON.parse(res);

                    if (!res['errno']) {
                        if (typeof window._Cache==='undefined') {
                            window._Cache = {};
                        }
                        flash_sale_product = window._Cache['flash_sale_product'] = res['result']['product_list'];

                        date_key = date_key || '2015-'+W('.date-tab .cur a').html().trim().replace('.', '-');

                        //date_key = '2015-11-06';
                        var product_list = flash_sale_product[date_key];

                        var is_today = false;
                        var today_date = '2015-'+fix2Length((new Date()).getMonth()+1)+'-'+fix2Length((new Date()).getDate());
                        if (today_date === date_key){
                            is_today = true;
                        }

                        var html_str = getProductHtml(product_list, true, is_today);

                        renderProductList(W('.js-xsth-product-list'), html_str);

                    } else {

                    }

                } catch (ex){}

            });

        }

    }

    // 获取商品列表的html字符串
    function getProductHtml(product_list, is_flash, is_today){
        is_today = is_today || false;
        var html_fn  = W('#JsErHuoJieProductListTpl').html().trim().tmpl(),
            html_str = html_fn({
                'list': product_list,
                'is_flash': is_flash,
                'is_today': is_today
            });

        product_list.forEach(function (item, i) {
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
    // 懒加载图片
    function lazyLoadImg(options, $target) {
        if (typeof options==='number') {
            options = {
                'delay': options
            }
        }
        options = options || {};

        options = QW.ObjectH.mix({
            'delay': 1,
            'interval': 0 // 0:同时显示，其他时间表示实际时间间隔
        }, options, true);

        var delay = options['delay'] || 1, // 毫秒
            interval = options['interval'] || 0; // 图片加载顺序间隔

        var _time = 0;

        setTimeout(function(){

            var $img;
            if ($target && $target.length){
                $img = $target.query('img');
            } else {
                $img = W('img');
            }

            $img.forEach(function(el, i){
                var $el = W(el),
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

    /**
     * 修复为2个字符长度，长度不足以前置0补齐;
     * @return {[type]} [description]
     */
    function fix2Length(str){
        str = str.toString();
        return str.length < 2 ? '0' + str : str;
    }

});