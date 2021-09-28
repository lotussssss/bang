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



    // 精品
    function _forHotJingpin(jingpin_list){
        var list_arr = jingpin_list;

        if (list_arr.length>4){
            list_arr.splice(4);
        }

        //for(var i= 0;i<20;i++){
        //    list_arr.push(list_arr[0]);
        //}

        var html_str = getProductHtml(list_arr, false);

        renderProductList(W('.js-xsth-product-list'), html_str);
    }
    // 限时抢
    function _forHotFlash(flash_list, curtime){
        var wList = W('.js-xsth-product-list');
        var list_arr = flash_list;
        if (list_arr.length>4){
            list_arr.splice(4);
        }

        var html_str = getProductHtml(list_arr, true);

        renderProductList(wList, html_str);

        // 服务器当前时间(精确到毫秒)
        curtime = Date.parse(curtime.replace(/-/g, '/')) || (new Date()).getTime();
        // 遍历倒计时
        wList.query('.countdown').forEach(function(el, i){
            var wEl = W(el),
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
                        wEl.ancestorNode('.slide-item').query('.p-buy-disabled').removeClass('p-buy-disabled').html('立即抢购>');

                        Bang.countdown_desc = '距结束：';
                        wEl.removeClass('countdown-start-prev');

                        Bang.startCountdown(endtime, starttime, wEl, {
                            'end': function(){
                                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

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
                        wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                        wEl.html('已售出').addClass('countdown-end-next');
                    }
                });

            }
            // 抢购中&商品被拍下
            else if (curproduct['flash_saling']==1 && curproduct['flash_status']=='saling' && curtime<endtime) {
                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                wEl.html('已售出').addClass('countdown-end-next');
            } else {
                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                wEl.html('已售出').addClass('countdown-end-next');
            }

        });
    }

    // 限时特价
    function getXSTJProduct(){
        var request_url = '/youpin/aj_get_flash_sale_goods';
        QW.Ajax.get(request_url, function(res){
            //try{
                res = JSON.parse(res);

                if (!res['errno']) {
                    var result = res['result'],
                        curtime = result['time'],
                        flash_list   = result['flash_list'],   // 闪购
                        jingpin_list = result['jingpin_list']; // 精品

                    // 闪购
                    if(flash_list && flash_list.length) {
                        _forHotFlash(flash_list, curtime);
                    }
                    // 精品
                    else if (jingpin_list && jingpin_list.length) {
                        _forHotJingpin(jingpin_list);
                    }

                } else {
                    //
                }

            //} catch (ex){}

        });
    }
    // 九成新五折价
    function getWZJProduct(){
        var request_url = '/youpin/ehj_get_half_off_product?pn=0&num=4';
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
    // 获取商品列表的html字符串
    function getProductHtml(product_list, is_flash){
        var html_fn  = W('#JsErHuoJieHtcProductListTpl').html().trim().tmpl(),
            html_str = html_fn({
                'list': product_list,
                'is_flash': is_flash
            });

        product_list.forEach(function (item, i) {
            preLoadImg(item['thum_img']);
        });

        return html_str;
    }
    // 输出商品列表
    function renderProductList($target, html_str){
        $target.html(html_str);

        setTimeout(function(){
            lazyLoadImg({
                'delay': 0,
                'interval': 300 // 0:同时显示，其他时间表示实际时间间隔
            }, $target);
        }, 300);
    }
    getXSTJProduct();
    getWZJProduct();

});