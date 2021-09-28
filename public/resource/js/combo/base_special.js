;/**import from `/resource/js/component/jquery/countdown.js` **/
// 倒计时
(function(){
    var Bang = window.Bang = window.Bang || {};

    Bang.startCountdown = startCountdown;

    /**
     * 拍卖倒计时（开始或者结束）
     * @param targettime 倒计时结束的目标时间（时间戳）
     * @param curtime 当前时间（时间戳）（会随着倒计时变化）
     * @param $target
     */
    function startCountdown(targettime, curtime, $target, callbacks){
        if(!targettime || !curtime || curtime>targettime){
            return ;
        }
        callbacks = callbacks || {};

        var duration = Math.floor( (targettime - curtime)/1000 ),// 时间间隔，精确到秒，用来计算倒计时
            client_duration = getClientDuration(targettime); // 当前客户端和结束时间的时间差（用来作为参考点修正倒计时误差）

        var fn_countdown = $.tmpl( $.trim( $('#JsCountdownTpl').html() ) );

        // 倒计时ing
        typeof callbacks.start === 'function' && callbacks.start();

        function countdown(){
            if ( !($target&&$target.length) ) {
                return false
            }
            var d = Math.floor(duration/86400), // 天
                h = Math.floor((duration-d*86400)/3600), // 小时
                m = Math.floor((duration-d*86400-h*3600)/60), // 分钟
                s = duration - d*86400 - h*3600 - m*60; // 秒

            var desc_before = $target.attr('data-descbefore')||'', // 前置文字说明
                desc_behind = $target.attr('data-descbehind')||'', // 后置文字说明
                day_txt    = $target.attr('data-daytxt') || '天 ',
                hour_txt   = $target.attr('data-hourtxt') || ':',
                minute_txt = $target.attr('data-minutetxt') || ':',
                second_txt = $target.attr('data-secondtxt') || '',
                hour_mode = !!$target.attr('data-hour-mode') // 小时模式

            if (hour_mode) {
                h = d * 24 + h
                d = 0
            }

            var html_str = fn_countdown({
                'day': d,
                'day_txt': day_txt,
                'hour': fix2Length(h),
                'hour_txt': hour_txt,
                'minute': fix2Length(m),
                'minute_txt': minute_txt,
                'second': fix2Length(s),
                'second_txt': second_txt,
                'desc_before': desc_before,
                'desc_behind': desc_behind
            });
            $target.html(html_str);

            // 倒计时ing
            typeof callbacks.process === 'function' && callbacks.process(curtime);

            duration = duration - 1;
            client_duration = client_duration - 1000;
            curtime = curtime - 1000;

            //duration = duration<1 ? 0 : duration;
            return true;
        }
        countdown();
        setTimeout(function(){
            var flag = countdown();
            if (!flag) {
                return ;
            }
            if(duration>-1){
                var next_time = getClientDuration(targettime) - client_duration;
                if (next_time<0) {
                    next_time = 0;
                }
                setTimeout(arguments.callee, next_time);
            } else {
                // 倒计时结束
                typeof callbacks.end === 'function' && callbacks.end();
            }
        }, 1000);
    }
    /**
     * 修复为2个字符长度，长度不足以前置0补齐;
     * @return {[type]} [description]
     */
    function fix2Length(str){
        str = str.toString();
        return str.length < 2 ? '0' + str : str;
    }
    /**
     * 获取当前客户端时间相对结束时间的时间间隔（精确到毫秒）
     * @returns {*|number}
     */
    function getClientDuration(targettime){
        return targettime - (new Date()).getTime();
    }

}());

;/**import from `/resource/js/component/jquery/product_list_render.js` **/
;
!function () {
    window.Bang = window.Bang || {}

    function renderProductList (options) {
        var
            defaults = {
                // 输出目标位置
                $target        : '',
                // 输出模板
                $tpl           : '',
                // 商品请求地址
                request_url    : '',
                // 请求的参数，页码和也没数量是基本参数，还可以包括任何其他参数
                request_params : {
                    // 页码
                    pn        : 0,
                    // 每页数量
                    page_size : 20
                },
                // 开启图片懒加载
                lazy_load      : true,
                // 显示列数
                col            : 5,
                // 指定的商品列表的key（用于处理不同接口返回的列表数据的key不一样的情况）
                list_key       : '',
                // 列表的url参数
                list_params    : {},
                // 失败回调函数
                fail           : tcb.noop,
                // 输出完成执行
                complete       : tcb.noop,
                // 秒杀倒计时
                countdown      : countDown
            }

        options = tcb.mix (defaults, options, true)

        var
            $target = $ (options.$target),
            $tpl = $ (options.$tpl)

        if (!($target && $target.length && $tpl && $tpl.length)) {
            return tcb.warn ('$target：' + options.$target + '，或者$tpl：' + options.$tpl + '，不存在，无法正确执行')
        }

        options.col = parseInt (options.col, 10) || 5

        options.request_params = options.request_params || {}
        options.request_params[ 'pn' ] = parseInt (options.request_params[ 'pn' ], 10) || 0
        options.request_params[ 'page_size' ] = parseInt (options.request_params[ 'page_size' ], 10) || 20

        // 获取商品数据
        getProductData (options.request_url, options.request_params, function (result) {
            var
                product_list = null

            if (options.list_key) {
                // 根据指定的key在商品中获取商品列表

                product_list = result[ options.list_key ]
            }
            product_list = product_list ? product_list : result[ 'product_list' ] || result[ 'good_list' ] || result

            // 如果返回的数据超过限定的每页数量，那么干掉多余的
            product_list.splice (options.request_params[ 'page_size' ], 9999)

            var
                product_list_html = getProductHtml ($tpl, {
                    good_list : product_list,
                    params    : options.list_params || {},
                    col       : options.col
                })

            renderProductListHtml ($target, product_list_html, options.lazy_load)

            // 倒计时
            if (options.countdown && typeof options.countdown == 'function') {
                var $countdown = $target.find ('.countdown')
                $countdown.length && options.countdown ($countdown, product_list)
            }

            // 输出完成
            typeof options.complete === 'function' && options.complete (result, $target)

        }, options.fail)
    }

    // 获取商品列表的html字符串
    function getProductHtml ($tpl, data) {
        data = data || {}
        // 商品列表
        data[ 'good_list' ] = data[ 'good_list' ] || []
        // 商品列
        data[ 'col' ] = data[ 'col' ] || 5

        tcb.each (data[ 'good_list' ], function (i, item) {
            // 如果返回的商品图片是字符串格式，那么做个特殊处理
            if (typeof item[ 'thum_img' ] === 'string') {

                var thum_img = tcb.imgThumbUrl2 (item[ 'thum_img' ], 300, 300, 'edr')
                item[ 'thum_img' ] = {
                    'big' : thum_img,
                    'mid' : thum_img,
                    'min' : thum_img,
                    'old' : thum_img
                }
                tcb.preLoadImg (thum_img)
            }
        })

        var html_fn = $.tmpl ($.trim ($tpl.html ()))

        return html_fn (data)
    }

    // 输出商品列表的html
    function renderProductListHtml ($target, html_str, lazy_load) {
        $target.html (html_str)

        if (lazy_load) {
            setTimeout (function () {
                tcb.lazyLoadImg (0, $target)
            }, 300)
        }
    }

    // 获取热销机型列表
    function getProductData (url, params, success, fail) {
        if (!url) {
            return tcb.error ('这里有个商品列表异步请求没有传入url')
        }

        // 请求商品数据
        $.get (url, params, function (res) {
            // res = $.parseJSON (res)

            if (!res[ 'errno' ]) {

                typeof success === 'function' && success (res[ 'result' ])

            } else {
                typeof fail === 'function' && fail (res)
            }
        })

    }

    //倒计时
    function countDown ($countdown, product_list) {
        // 遍历商品列表，处理倒计时
        $.each (product_list, function (i, product) {
            var product_id = product[ 'product_id' ],
                $me = $countdown.filter ('[data-pid="' + product_id + '"]')

            if (!($me && $me.length)) {
                return true
            }
            var current_time = window.CURRENT_TIME || Date.now (),
                flash_start_time = new Date (product[ 'flash_start_time' ].replace (/-/g, '/')).getTime (),
                flash_end_time = new Date (product[ 'flash_end_time' ].replace (/-/g, '/')).getTime ()

            //抢购未开始
            if (!product[ 'flash_saling' ] && current_time < flash_start_time) {
                $me.addClass ('countdown-start-prev')
                    .attr ('data-descbefore', '距开始')

                Bang.startCountdown (flash_start_time, current_time, $me, {
                    'end' : function () {
                        $me.removeClass ('countdown-start-prev')
                            .attr ('data-descbefore', '距结束')

                        Bang.startCountdown (flash_end_time, flash_start_time, $me, {
                            'end' : function () {
                                $me.hide ().closest ('.p-item').find ('.p-label-soldout').show ()
                            }
                        })
                    }
                })
            }
            // 抢购进行中
            else if (product[ 'flash_saling' ] == 1 && product[ 'flash_status' ] == 'saling' && current_time < flash_end_time) {
                $me.removeClass ('countdown-start-prev')
                    .attr ('data-descbefore', '距结束')
                Bang.startCountdown (flash_end_time, current_time, $me, {
                    'end' : function () {
                        $me.hide ().closest ('.p-item').find ('.p-label-soldout').show ()
                    }
                })
            }
            // 已抢光
            else {
                $me.hide ().closest ('.p-item').find ('.p-label-soldout').show ()
            }
        })
    }

    //====================== Export ========================
    window.Bang.renderProductList = renderProductList

} ()

;/**import from `/resource/js/component/jquery/play_video.js` **/
!function(){
    window.Bang = window.Bang || {}

    function playVideo($trigger){
        var $TriggerShowVideo = $trigger || $('.trigger-play-video')

        if ($TriggerShowVideo && $TriggerShowVideo.length){
            $TriggerShowVideo.on('click', function(e){
                e.preventDefault()

                var html_fn = $.tmpl($.trim($('#JsCommonVideoPlayerPanelTpl').html())),
                    html_st = html_fn()

                tcb.showDialog(html_st, {
                    className : 'video-player-panel',
                    withClose : true,
                    middle : true
                })
            })
        }
    }

    window.Bang.playVideo = playVideo
}()
