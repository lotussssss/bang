// 修修哥店员管理
!function () {
    if (window.__PAGE !== 'xxg-order-check') {
        return
    }

    $ (function () {
        // 绑定事件
        tcb.bindEvent (document.body, {
            // 点击tab
            //'.block-tab-list .item':function (e) {
            //    e.preventDefault()
            //
            //    $me = $(this)
            //
            //    $me.addClass('cur').siblings('.item').removeClass('cur')
            //},
            // 触发审核、驳回弹窗
            '.js-trigger-check' : function (e) {
                e.preventDefault ()

                var $me = $ (this)
                var order_id = $me.attr ('data-order-id'),
                    flag = $me.attr ('data-flag'),
                    confirm_text = '确定驳回订单么？'
                if (flag == 'success') {
                    confirm_text = '确定订单通过审核么？'
                }
                $.dialog.confirm (confirm_text, function () {
                    // 点击确定
                    $.get ('/m/subShopManagerCheck', {
                        order_id : order_id,
                        type : flag
                    }, function (res) {
                        res = $.parseJSON (res)

                        if (!res[ 'errno' ]) {
                            $.dialog.toast ('操作成功!', 2000)

                            var $item = $me.closest ('.item')
                            $item.one ('transitionend', function () {
                                var $siblings = $item.siblings ()
                                if (!($siblings && $siblings.length)) {
                                    $item.after('<div style="margin: .3rem 0;text-align: center;font-size: .24rem;">暂无订单</div>')
                                }
                                $item.remove ()
                            }).css ({
                                opacity : 0,
                                padding : '0 .12rem',
                                height : 0
                            })
                        } else {
                            $.dialog.toast (res.errmsg, 2000)
                        }
                    })
                }, function () {
                    // 点击取消
                })
            }
        })

    })

} ()