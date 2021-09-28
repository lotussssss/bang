!function () {
    if (window.__PAGE !== 'xxg-special-scan-shop-credit-hs') {
        return
    }

    // 判断是 小程序信用回收还是普通信用回收 标志,默认 false(非小程序信用回收)
    var aliapp_flag = false

    $ (function () {

        $('.btn-xxg-confirm').on('click', function(e){
            e.preventDefault()

            var $me = $(this)

            if ($me.hasClass('btn-disabled')){
                return
            }
            $me.addClass('btn-disabled')

            // 小程序信用回收还是普通信用回收,进行赋值
            aliapp_flag = $me.attr('data-aliapp-flag') === 'true' ? true : false
            var order_id = ''

            // 如果是 小程序
            if(aliapp_flag){

              order_id = $me.attr('data-pre-order-id')

            } else {    // 否则就是普通信用回收

              order_id = $me.attr('data-order-id')

            }

            __doConfirmShopCreditHs(order_id, function(){
                $me.addClass('btn-disabled').html('已确认以旧换新')

                $.dialog.toast('确认以旧换新成功~')

                setTimeout(function(){
                    window.location.href = window.location.href
                }, 600)
            }, function(errmsg){
                $.dialog.toast(errmsg)

                setTimeout(function(){
                    $me.removeClass('btn-disabled')
                }, 600)
            })
        })


        function __doConfirmShopCreditHs(order_id, callback, fail){

            // 如果是 小程序信用回收
            if(aliapp_flag){
              $.get('/m/doBindXxgForCreditPreOrder', {

                pre_orderid: order_id

              }, function(res){
                res = $.parseJSON(res)

                if (!res.errno){

                  'function' == typeof callback && callback()
                } else {
                  'function' == typeof fail && fail(res.errmsg)
                }
              })

            } else {    // 否则就是普通信用回收

              $.get('/m/doConfirmShopCreditHs', {

                order_id: order_id

              }, function(res){
                res = $.parseJSON(res)

                if (!res.errno){

                  'function' == typeof callback && callback()
                } else {
                  'function' == typeof fail && fail(res.errmsg)
                }
              })
            }
        }

    })

} ()