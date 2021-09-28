!function () {
    if (window.__PAGE !== 'xxg-promotion-cps-promotion') {
        return
    }

    $ (function () {

        var $Form = $ ('#FormBindXxgPromotionCps'),
            $UserMobile = $Form.find ('[name="user_mobile"]')

        $Form.on ('submit', function (e) {
            e.preventDefault ()

            var $form = $ (this)
            if (!validBindForm ()) {
                return
            }
            var $BtnSubmit = $form.find ('[type="submit"]')
            if ($BtnSubmit.hasClass ('btn-disabled')) {
                return
            }
            $BtnSubmit.addClass ('btn-disabled')

            $.ajax ({
                type     : 'POST',
                url      : $form.attr ('action'),
                data     : $form.serialize (),
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    if (!res[ 'errno' ]) {
                        window.location.href = tcb.setUrl2 (window.location.href, {
                            bind_success : '1'
                        })
                    } else {
                        $.dialog.toast (res[ 'errmsg' ])
                    }
                    $BtnSubmit.removeClass ('btn-disabled')
                },
                error    : function () {
                    $.dialog.toast ('网络/系统异常，请刷新页面重试')
                    $BtnSubmit.removeClass ('btn-disabled')
                }
            })

        })

        // 验证绑定表单
        function validBindForm () {
            var flag = true,
                $errorTarget = null

            // 用户电话
            if (!tcb.validMobile (tcb.trim ($UserMobile.val ()))) {
                flag = false
                $errorTarget = $errorTarget || $UserMobile
                $UserMobile.shine4Error ()
            }

            if ($errorTarget && $errorTarget.length) {
                setTimeout (function () {
                    $errorTarget.focus ()
                }, 300)
            }

            return flag
        }

    })

} ()