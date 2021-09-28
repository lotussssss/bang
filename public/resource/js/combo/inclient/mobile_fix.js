;/**import from `/resource/js/component/countdown.js` **/
// 倒计时
(function(){
    var Bang = window.Bang = window.Bang || {};

    Bang.countdown_desc = '剩余';
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

        var fn_countdown = W('#JsCountdownTpl').html().trim().tmpl();

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

            var desc_before = $target.attr('data-descbefore')||Bang.countdown_desc||'', // 前置文字说明
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

;/**import from `/resource/js/component/tuiguang_slide.js` **/
!function(){
    var Bang = window.Bang = window.Bang || {};

    Bang.TuiguangSlide = TuiguangSlide

    /**
     * 推广slide类
     * 使用 new TuiguangSlide('.slide-box');
     * @param {selector} box  [description]
     * @param {[type]} conf [description]
     */
    function TuiguangSlide(box, conf){
        var me = this;

        this.meBox = W(box);
        // 找不到需要处理的容器，直接返回
        if(!this.meBox.length){
            return ;
        }
        this.config = conf || {};
        this.btnPrev = this.meBox.query('.slide-go-left');
        this.btnNext = this.meBox.query('.slide-go-right');
        this.innerBox = this.meBox.query('.slide-inner');
        this.items = this.meBox.query('.slide-item');
        this.listBox = this.meBox.query('.slide-list');
        this.itemNum = this.meBox.query('.slide-item').length;
        this.ctrlBox = this.meBox.query('.slide-ctrl');
        this.innerBoxWidth = this.innerBox.getRect().width;

        this.autoRunTimer = null;

        this.init = function(){
            var me = this;

            var wItems = me.items;
            if (wItems && wItems.length) {
                me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

                me.listBox.css({'width' : me.itemWidth * wItems.length});

                if(me.config.showCtrl){ me.createCtrl(); }

                if(me.config.autoRun){ me.autoRun( ); }
            }

            this.bindEvent();
        };
        this.resetBoxSize = function(){
            var me = this;
            me.items = me.meBox.query('.slide-item');
            var wItems = me.items;

            if (wItems && wItems.length) {
                me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

                me.listBox.css({'width' : me.itemWidth * wItems.length});

                if(me.config.showCtrl){ me.createCtrl(); }

                if(me.config.autoRun){ me.autoRun( ); }
            }

        };
        this.bindEvent = function(){

            var me = this;
            var config = this.config;

            me.btnPrev.on('click', function(e){
                e.preventDefault();
                var wMe = W(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft - me.innerBoxWidth }, config.animTime||300, function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                }, QW.Easing.easeOut);
            });
            me.btnNext.on('click', function(e){
                e.preventDefault();
                var wMe = W(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft + me.innerBoxWidth }, config.animTime||300, function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                }, QW.Easing.easeOut);
            });

            me.meBox.delegate('.ctrl-item', 'click', function(e) {
                e.preventDefault();
                W(this).addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                var sn = W(this).attr('data-sn') || 0;
                me.go(sn);
            });

            me.meBox.on('mouseenter', function(e){

                clearInterval(me.autoRunTimer);
            });
            me.meBox.on('mouseleave', function(e){
                if(config.autoRun){ me.autoRun(); }
            });
        };

        this.go = function(step){
            var config = this.config;
            step = step || 0;
            this.innerBox.animate({'scrollLeft' : 0 + this.innerBoxWidth*step }, config.animTime||300, function(){}, QW.Easing.easeOut);
        };

        this.autoRun = function(){
            var me = this;
            var config = this.config;

            me.autoRunTimer = setInterval(function(){
                var currSn = me.meBox.query('.ctrl-curr').attr('data-sn')|| 0,
                    nextSn = currSn - 0 + 1;
                if( nextSn > me.itemNum-1 ){
                    nextSn = 0;
                }
                me.meBox.query('.ctrl-item[data-sn="'+nextSn+'"]').addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                me.go(nextSn);
            }, typeof(config.autoRun)=='number'? config.autoRun : 5000);
        };

        this.createCtrl = function(e){

            if(this.ctrlBox.query('.ctrl-item').length||this.items.length<2){
                return ;
            }

            str = '';
            for(var i=0, n=this.items.length; i<n; i++){
                str += '<span class="ctrl-item '+(i==0?'ctrl-curr':'')+'" data-sn="'+i+'"></span>';
            }
            this.ctrlBox.html(str);
        };

        this.init();
    }
}()


;/**import from `/resource/js/component/block_promoting/block_promoting_inclient_lp_flash_product_list.js` **/
Dom.ready(function(){
    var wBlock=  W('.block-promoting-inclient-lp-flash-product-list')
    if (!(wBlock&& wBlock.length)){
        return
    }

    var HotProductListSlide = new window.Bang.TuiguangSlide(wBlock.query('.tg-small'), { animTime : 500 })

    // 输出商品
    function renderHotProductList(){

        var wListInner = wBlock.query('#HotProductList')
        if(wListInner && wListInner.length){

            getData4HotProductList(function(result){

                var list_arr;
                var curtime = result['time'],
                    flash_list   = result['flash_list'],   // 闪购
                    jingpin_list = result['jingpin_list']; // 精品

                if ( !(flash_list && jingpin_list && flash_list.length + jingpin_list.length>3) ){
                    // 限时抢 和 精品商品总数不大于3个，那么左右滑动按钮不可点

                    var
                        $Wrap = wListInner.ancestorNode('.tg-small')
                    $Wrap.query('.slide-go-left').addClass('disabled')
                    $Wrap.query('.slide-go-right').addClass('disabled')
                }

                // 闪购
                if(flash_list && flash_list.length) {
                    _forHotFlash(flash_list, curtime, wListInner);
                    if(flash_list.length<4 && jingpin_list && jingpin_list.length){
                        _forHotJingpin(jingpin_list, wListInner, true);
                    }
                }
                // 精品
                else if (jingpin_list && jingpin_list.length) {
                    _forHotJingpin(jingpin_list, wListInner);
                }

            });

        }
    }
    // 精品
    function _forHotJingpin(jingpin_list, wListInner, flag){
        var list_arr = jingpin_list;

        var html_str = W('#JsHotProductListTpl').html().trim().tmpl()({
            'list': list_arr
        });

        if(flag){
            wListInner.insertAdjacentHTML('beforeend', html_str);
        } else {
            wListInner.html(html_str);
        }

        HotProductListSlide.resetBoxSize()
    }
    // 限时抢
    function _forHotFlash(flash_list, curtime, wListInner){
        var list_arr = flash_list;
        var html_str = W('#JsFlashProductListTpl').html().trim().tmpl()({
            'list': list_arr
        });

        wListInner.html(html_str);

        HotProductListSlide.resetBoxSize();

        // 服务器当前时间(精确到毫秒)
        curtime = Date.parse(curtime.replace(/-/g, '/')) || (new Date()).getTime();
        // 遍历倒计时
        wListInner.query('.countdown').forEach(function(el, i){
            var wEl = W(el),
                curproduct = list_arr[i], // 和当前计时器对应的商品信息
                starttime = curproduct['flash_start_time'].replace(/-/g, '/'),//'2015-11-09 18:00:40',//
                endtime   = curproduct['flash_end_time'].replace(/-/g, '/');//'2015-11-09 16:22:40';//
            starttime = Date.parse(starttime) || 0;
            endtime   = Date.parse(endtime) || 0;
            var $skill = $(el).parent().find(".seckill");

            // 开始前倒计时
            if (!curproduct['flash_saling'] && curtime<starttime) {
                wEl.addClass('countdown-start-prev')
                    .attr('data-descbefore', '距开始')

                Bang.startCountdown(starttime, curtime, wEl, {
                    'end': function(){
                        wEl.ancestorNode('.slide-item').query('.p-buy-disabled').removeClass('p-buy-disabled').html('立即抢购');

                        wEl.removeClass('countdown-start-prev')
                            .attr('data-descbefore', ' ')
                        Bang.startCountdown(endtime, starttime, wEl, {
                            'end': function(){
                                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                                wEl.html('已售出').addClass('countdown-end-next');
                                $skill.hide();
                            }
                        });
                    }
                });

            }
            // 抢购进行中&商品未被拍下
            else if (curproduct['flash_saling']==1 && curproduct['flash_status']=='saling' && curtime<endtime) {

                wEl.removeClass('countdown-start-prev')
                    .attr('data-descbefore', ' ')
                Bang.startCountdown(endtime, curtime, wEl, {
                    'end': function(){
                        wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');
                        wEl.html('已售出').addClass('countdown-end-next');
                        $skill.hide();
                    }
                });

            }
            else {
                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                wEl.html('已售出').addClass('countdown-end-next');
                $skill.hide();
            }

        })
    }
    // 获取商品数据
    function getData4HotProductList(callback){
        var request_url = '/youpin/doGetFlashSaleGoods',
            request_params = {};
        QW.Ajax.get(request_url, request_params, function(res){
            var result = [];
            res = JSON.parse(res);
            if (!res['errno']) {
                result = res['result'];
            }

            typeof callback==='function' && callback(result);
        })
    }
    renderHotProductList();

    tcb.bindEvent(wBlock[0], {
        // 秒杀商品
        '#HotProductList .slide-item': {
            'click': function (e) {
                var wMe = W(this),
                    wTarget = W(e.target);

                if (!(wTarget.ancestorNode('a').length || wTarget[0].nodeName.toLowerCase() == 'a')) {
                    wMe.query('.slide-img a').click();
                }
            },
            'mouseenter': function (e) {
                var
                    wMe = W(this)

                wMe.addClass('slide-item-hover')

            },
            'mouseleave': function (e) {
                var
                    wMe = W(this)

                wMe.removeClass('slide-item-hover')

            }
        },
        // 商品列表
        '.product-list .p-item': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('p-item-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.removeClass('p-item-hover');
            }
        }
    })
})

;/**import from `/resource/js/inclient/mobile_fix/index.js` **/
Dom.ready(function(){

    $('.touble-sup li').on('mouseenter',function () {
        var $me = $(this)
        $me.addClass('cur').siblings('.cur').removeClass('cur')
        var $index = $me.index()
        var $touble_subs = $('.touble-sub li')
        $touble_subs.removeClass('cur')
        $touble_subs.eq($index).addClass('cur')
    })
    $('.touble-sub  a').on('mouseenter',function (e) {
        e.preventDefault()
        $(this).addClass('hover')
    }).on('mouseleave',function (e) {
        $(this).removeClass('hover')
    })

})
