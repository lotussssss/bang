Dom.ready(function(){
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



    // 限时特价
    function getXSTHProduct(date_key){
        var flash_sale_product;
        if (window._Cache && window._Cache['flash_sale_product']) {
            flash_sale_product = window._Cache['flash_sale_product']
        }

        if (flash_sale_product) {
            if (!date_key) {
                var wLi = W('.xsth-product-list-tit .date-tab li'),
                    wCurLi = wLi.filter(function(el){ return W(el).hasClass('cur'); });
                if ( !(wCurLi && wCurLi.length) ){
                    wCurLi = wLi.first().addClass('cur');
                }
                date_key = wCurLi.attr('data-date');
            }

            var product_list = flash_sale_product[date_key];

            var is_today = false;
            var today_date_obj = new Date(),
                today_date = today_date_obj.getFullYear()+'-'+fix2Length(today_date_obj.getMonth()+1)+'-'+fix2Length(today_date_obj.getDate());
            if (today_date === date_key){
                is_today = true;
            }

            var html_str = getProductHtml(product_list, true, is_today);

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

                        if (!date_key) {
                            var wLi = W('.xsth-product-list-tit .date-tab li'),
                                wCurLi = wLi.filter(function(el){ return W(el).hasClass('cur'); });
                            if ( !(wCurLi && wCurLi.length) ){
                                wCurLi = wLi.first().addClass('cur');
                            }
                            date_key = wCurLi.attr('data-date');
                        }

                        var product_list = flash_sale_product[date_key];

                        var is_today = false;
                        var today_date_obj = new Date(),
                            today_date = today_date_obj.getFullYear()+'-'+fix2Length(today_date_obj.getMonth()+1)+'-'+fix2Length(today_date_obj.getDate());
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
    // 九成新五折价
    function getWZJProduct(){
        var request_url = '/youpin/ehj_get_half_off_product?pn=0&num=8';
        QW.Ajax.get(request_url, function(res){
            try{
                res = JSON.parse(res);

                if (!res['errno']) {
                    var list_arr = res['result']['product_list'];

                    var len = list_arr.length,
                        col = 4,
                        row_max = 4;
                    if (len>col) {
                        var row = Math.floor(len/col);
                        row = row>row_max ? row_max : row;

                        list_arr.splice(parseInt(row*col, 10), 9999);
                    }

                    var html_str = getProductHtml(list_arr, false);

                    renderProductList(W('.js-wzj-product-list'), html_str);

                } else {

                }

            } catch (ex){}

        });

    }

    // 苹果专区
    function getAppleProduct(){
        var request_url = '/youpin/aj_get_goods?pn=0&brand_id=2&num=8';
        QW.Ajax.get(request_url, function(res){
            try{
                res = JSON.parse(res);

                if (!res['errno']) {
                    var list_arr = res['result']['good_list'];

                    var len = list_arr.length,
                        col = 4,
                        row_max = 2;
                    if (len>col) {
                        var row = Math.floor(len/col);
                        row = row>row_max ? row_max : row;

                        list_arr.splice(parseInt(row*col, 10), 9999);
                    }

                    var html_str = getProductHtml(list_arr, false);

                    renderProductList(W('.js-apple-product-list'), html_str);

                } else {

                }

            } catch (ex){}

        });
    }

    // 三星专区
    function getSamsungProduct(){
        var request_url = '/youpin/aj_get_goods?pn=0&brand_id=1&num=8';
        QW.Ajax.get(request_url, function(res){
            try{
                res = JSON.parse(res);

                if (!res['errno']) {
                    var list_arr = res['result']['good_list'];

                    var len = list_arr.length,
                        col = 4,
                        row_max = 2;
                    if (len>col) {
                        var row = Math.floor(len/col);
                        row = row>row_max ? row_max : row;

                        list_arr.splice(parseInt(row*col, 10), 9999);
                    }

                    var html_str = getProductHtml(list_arr, false);

                    renderProductList(W('.js-samsung-product-list'), html_str);

                } else {

                }

            } catch (ex){}

        });
    }

    // 小米专区
    function getXiaomiProduct(){
        var request_url = '/youpin/aj_get_goods?pn=0&brand_id=3&num=8';
        QW.Ajax.get(request_url, function(res){
            try{
                res = JSON.parse(res);

                if (!res['errno']) {
                    var list_arr = res['result']['good_list'];

                    var len = list_arr.length,
                        col = 4,
                        row_max = 2;
                    if (len>col) {
                        var row = Math.floor(len/col);
                        row = row>row_max ? row_max : row;

                        list_arr.splice(parseInt(row*col, 10), 9999);
                    }

                    var html_str = getProductHtml(list_arr, false);

                    renderProductList(W('.js-xiaomi-product-list'), html_str);

                } else {

                }

            } catch (ex){}

        });
    }

    // 华为专区
    function getHuaweiProduct(){
        var request_url = '/youpin/aj_get_goods?pn=0&brand_id=4&num=8';
        QW.Ajax.get(request_url, function(res){
            try{
                res = JSON.parse(res);

                if (!res['errno']) {
                    var list_arr = res['result']['good_list'];

                    var len = list_arr.length,
                        col = 4,
                        row_max = 2;
                    if (len>col) {
                        var row = Math.floor(len/col);
                        row = row>row_max ? row_max : row;

                        list_arr.splice(parseInt(row*col, 10), 9999);
                    }

                    var html_str = getProductHtml(list_arr, false);

                    renderProductList(W('.js-huawei-product-list'), html_str);

                } else {

                }

            } catch (ex){}

        });
    }


    // 获取商品列表的html字符串
    function getProductHtml(product_list, is_flash, is_today){
        is_today = is_today || false;
        var html_fn  = W('#JsCommonErhuojieProductListTpl').html().trim().tmpl(),
            html_str = html_fn({
                'list': product_list,
                'is_flash': is_flash,
                'is_today': is_today
            });

        if (product_list && product_list.length) {
            product_list.forEach(function (item, i) {
                var img = item['thum_img'];
                if ( (typeof img=='object') && img['old']) {
                    img = img['old'];
                }
                img = tcb.imgThumbUrl2(img, 180, 180);
                preLoadImg(img);
            });
        }

        return html_str;
    }
    // 输出商品列表
    function renderProductList($target, html_str){
        if (!html_str){
            return ;
        }
        $target.html(html_str);

        setTimeout(function(){
            lazyLoadImg({
                'delay': 0,
                'interval': 100 // 0:同时显示，其他时间表示实际时间间隔
            }, $target);
        }, 100);
    }

    setTimeout(getXSTHProduct, 0);
    setTimeout(getWZJProduct, 100);
    setTimeout(getAppleProduct, 200);
    setTimeout(getSamsungProduct, 300);
    setTimeout(getXiaomiProduct, 350);
    setTimeout(getHuaweiProduct, 400);

    // 事件绑定
    tcb.bindEvent(document.body, {
        // 切换限时特价商品日期
        '.date-tab a': function(e){
            e.preventDefault();

            var $me = W(this),
                $li = $me.ancestorNode('li'),
                date_key = $li.attr('data-date');

            //date_key = '2016-03-20';

            $li.addClass('cur').siblings('.cur').removeClass('cur');

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
        }

    });

});
