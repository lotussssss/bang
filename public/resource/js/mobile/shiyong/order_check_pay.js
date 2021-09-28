// 下单成功
$(function(){
    var $PageOrderCheckPay = $('.page-shiyong-order-check-pay');
    if (!$PageOrderCheckPay.length){
        return;
    }

    // 其他
    (function(){
        var $btn_pay_success = $('.btn-pay-success'),
            order_id = $btn_pay_success.attr('data-orderid');
        // 检查支付状态
        function checkPayStatus(order_id, callback){
            if (!order_id){
                return ;
            }
            var request_url = '/shiyong/doGetPayResult?order_id='+order_id;
            $.get(request_url, function(res){
                res = $.parseJSON(res);

                if (typeof callback==='function'){
                    callback(res);
                }
            });
        }
        var _MAXREQUEST = window._MAXREQUEST || 10;
        // 循环检查支付状态
        function recircleCheckPayStatus(){
            // 检查支付状态
            checkPayStatus(order_id, function(res){
                if (!res['errno']){
                    window.location.replace('/shiyong/paysuc?order_id='+order_id);
                }
            });

            if (_MAXREQUEST) {
                setTimeout(recircleCheckPayStatus, 5000);
            }
            _MAXREQUEST--;
        }
        setTimeout(recircleCheckPayStatus, 0);

        tcb.bindEvent(document.body, {
            // 点击完成支付
            '.btn-pay-success': function(e){
                e.preventDefault();

                var $me = $(this),
                    order_id = $me.attr('data-orderid');

                checkPayStatus(order_id, function(res){
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