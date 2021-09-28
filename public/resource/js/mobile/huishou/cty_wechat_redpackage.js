// 传天羽修修哥领红包
;
$(function () {

    tcb.bindEvent(document.body, {
        '.trigger-btn-get-redpackage': function (e) {
            e.preventDefault()
            var data_order_id = $(this).attr('data-order-id'),
                params = {
                'order_id':data_order_id
            }
            getRedPackage($(this), params)
        }
    })

    function getRedPackage($btn, params) {
        $.post('/wechathuodong/doReceivedxxgRedpack', params, function (res) {
            res = JSON.parse(res)

            if (!res.errno) {
                var $btn_col = $btn.closest('.btn')
                $btn_col.html('<span class="btn-get-redpackage btn-disabled">领取</span>')
                $btn_col.siblings('.amount').html(res.result)

                var html_str = $.tmpl($.trim($('#JsRedPackageDialogTpl').html()))({
                    amount:res.result
                });
                var config = {
                    withMask: true,
                    className: 'dialog-redpackage-wrap',
                    middle: true
                }

                tcb.showDialog(html_str, config);


            } else {
                $.dialog.toast(res.errmsg)
            }
        })
    }

})