!function () {

    if (window.__PAGE !== 'zhimacredit-order-detail') {
        return
    }

    $ (function () {

        tcb.bindEvent (document.body, {
            // 添加运单号
            '.js-trigger-fill-express-info' : function (e) {
                e.preventDefault ()

                var $me = $ (this),
                    order_id = $me.attr ('data-order-id'),
                    html_st = $.tmpl ($.trim ($ ('#JsMZhimaCreditHuishouAddExpressNoPanelTpl').html ())) ({
                        'order_id' : order_id
                    })
                var panel = tcb.showDialog (html_st, {
                    className : 'dialog-add-express-no',
                    middle    : true
                })

                // 提交物流信息
                var $form = panel.wrap.find ('form')
                __bindFormEventForFillExpress ($form)
            }
        })

        function __bindFormEventForFillExpress ($form) {
            if (!($form && $form.length)) {
                return
            }
            $form.on ('submit', function (e) {
                e.preventDefault ()

                var $form = $ (this)

                if (!__validFormEventForFillExpress ($form)) {
                    return;
                }

                $.post ($form.attr ('action'), $form.serialize (), function (res) {
                    res = $.parseJSON (res)

                    if (!res[ 'errno' ]) {
                        window.location.href = window.location.href
                    } else {
                        $.dialog.toast (res[ 'errmsg' ])
                    }
                });
            })
        }

        // 验证提交快递信息表单
        function __validFormEventForFillExpress ($form) {
            var $ep_nm = $form.find ('[name="express_name"]'),
                $ep_id = $form.find ('[name="express_id"]'),
                flag = true

            if (!$ep_nm.val ()) {
                $.errorAnimate ($ep_nm.focus ())
                flag = false
            }
            if (!$ep_id.val ()) {
                $.errorAnimate ($ep_id)
                if (flag) {
                    $ep_id.focus ()
                }
                flag = false
            }

            return flag
        }
    })
} ()
