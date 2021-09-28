// 订单详情
$(function(){
    var $PageOrderDetail = $('.page-shiyong-order-detail');
    if (!$PageOrderDetail.length){
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
                    //window.location.href = window.location.href+'&status_close=1';
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
        var SwipeSection = window.Bang.SwipeSection;
        tcb.bindEvent(document.body, {
            // 申请退款
            '.btn-order-apply-refund': function(e){
                e.preventDefault();

                tcb.showDialog('请联系客服：<a href="tel:4000-399-360">4000-399-360</a>');
            },
            // 质检报告
            '.view-mobile-quality': function(e){
                //e.preventDefault();

            },
            // 试用协议
            '.view-mobile-experience-agreement': function(e){
                e.preventDefault();

                var html_str = $.tmpl( $.trim($('#JsMMobileExperienceAgreementTpl').html()) );

                SwipeSection.getSwipeSection();
                SwipeSection.fillSwipeSection(html_str);
                SwipeSection.doLeftSwipeSection(0);
            },
            '.btn-order-finish-experience': function(e){
                e.preventDefault();

                tcb.showDialog('<div class="p-vboth-010rem">如需还机，请联系客服：<a href="tel:4000-399-360">4000-399-360</a></div>');
            }

        });
    }());
});