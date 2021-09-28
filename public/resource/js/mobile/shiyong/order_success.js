// 下单成功
$(function(){
    var $PageOrderSuccess = $('.page-shiyong-order-success');
    if (!$PageOrderSuccess.length){
        return;
    }

    // 支付倒计时
    (function(){
        // 支付倒计时
        function payCountdown(){
            // 给订单倒计时支付时间
            var wCountdown = $('.js-pay-countdown');
            if ( !(wCountdown && wCountdown.length) ) {
                return;
            }
            wCountdown.each(function(i, el){
                var wEl = $(el);

                var curtime = window.curtime,
                    order_time = wEl.attr('data-otime'), // 下单时间
                    locked_time = (window.locked_time || 1800)*1000; // 订单锁定时间段（即：从下单到关闭订单的时间段）

                // 服务器当前时间(精确到毫秒)
                curtime = Date.parse(curtime.replace(/-/g, '/')) || (new Date()).getTime();

                // 下单时间
                order_time = Date.parse(order_time.replace(/-/g, '/')) || 0;

                var lock_endtime = order_time + locked_time; // 订单关闭时间

                // 当前时间与下单时间的时间差，大于锁定时间，那么表示订单已经关闭，不再倒计时
                if (curtime>lock_endtime) {
                    window.location.href = window.location.href+'&status_close=1';
                    return;
                }

                Bang.startCountdown(lock_endtime, curtime, wEl, {
                    'end': function(){
                        window.location.reload();
                    }
                });

            });
        }
        payCountdown();

    }());

    // 其他
    (function(){
        tcb.bindEvent(document.body, {
            // 点击完成支付
            '.btn-pay-success': function(e){
                e.preventDefault();

                var $me = $(this),
                    order_id = $me.attr('data-orderid');
                var request_url = '/shiyong/doGetPayResult?order_id='+order_id;
                $.get(request_url, function(res){
                    res = $.parseJSON(res);

                    if (res['errno']){
                        alert('您的支付状态还未更新，请稍后再试。');
                    } else {
                        window.location.replace('/shiyong/paysuc?order_id='+order_id);
                    }
                });
            }
        })
    }());
});