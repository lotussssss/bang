// 电子保修卡
$(function () {
    $('.js-trigger-add-card').on('click', function (e) {
        e.preventDefault()

        var $panel_add_guarantee_card = Bang.SwipeSection.getSwipeSection ('.panel-add-guarantee-card')
        var html_fn = $.tmpl($.trim($('#JsAddGuaranteeCardPanelTpl').html())),
            html_str = html_fn()

        Bang.SwipeSection.fillSwipeSection (html_str)

        Bang.SwipeSection.doLeftSwipeSection ()

        var $Form = $panel_add_guarantee_card.find('form')
        bindFormEvent($Form)

        $panel_add_guarantee_card.find('.js-trigger-back').on ('click', function (e) {
            e.preventDefault ()

            Bang.SwipeSection.backLeftSwipeSection ()
        })
    })

    function bindFormEvent($Form) {
        $Form = $ ($Form)
        if (!($Form && $Form.length)) {
            return
        }

        $Form.on('submit',function (e) {
            e.preventDefault()

            var $me = $(this)

            // 判断是否处于可提交状态
            if (tcb.isFormDisabled ($me)) {
                return
            }

            // 验证表单
            if (!validForm ($me)) {
                return
            }

            // 以上验证全部通过，锁定表单，设置为不可再提交的锁定状态
            tcb.setFormDisabled ($me)

            $.ajax({
                type : 'POST',
                url : $me.attr('action') || '/youpinBaoxiu/doAdd',
                data : $me.serialize(),
                dataType : 'json',
                timeout  : 5000,
                success:function (res) {
                    try{
                        if(!res.errno){
                            $.dialog.toast('添加成功！', 3000)

                            setTimeout(function () {
                                window.location.reload()
                            }, 300)
                        }else{
                            $.dialog.toast(res.errmsg, 3000)
                        }
                    }catch (e) {
                        $.dialog.toast ('返回异常，请刷新页面重试', 3000)
                    }
                    tcb.releaseFormDisabled ($me)
                },
                error : function () {
                    $.dialog.toast ('返回异常，请刷新页面重试', 3000)
                    tcb.releaseFormDisabled ($me)
                }
            })
        })
    }

    // 验证表单
    function validForm ($form) {
        var
            flag = true,
            $imei = $form.find ('[name="imei"]')

        // imei
        if ($imei.length && !$imei.val ()) {
            $.errorAnimate ($imei.focus ())
            flag = false
        }

        return flag
    }

    // 验证表单是否可提交
    function isFormDisabled ($form) {
        var flag = false

        if (!$form.length) {
            return true
        }
        if ($form.hasClass ('form-disabled')) {
            flag = true
        }

        return flag
    }

    tcb.isFormDisabled = tcb.isFormDisabled || isFormDisabled

    // 设置表单不可提交
    function setFormDisabled ($form) {
        if (!$form.length) {
            return
        }
        $form.addClass ('form-disabled')
    }

    tcb.setFormDisabled = tcb.setFormDisabled || setFormDisabled

    // 设置表单可提交
    function releaseFormDisabled ($form) {
        if (!$form.length) {
            return
        }
        $form.removeClass ('form-disabled')
    }

    tcb.releaseFormDisabled = tcb.releaseFormDisabled || releaseFormDisabled
})
