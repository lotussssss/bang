// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServiceRemoteCheck = tcb.mix(window.XXG.ServiceRemoteCheck || {}, {
        render: render,
        renderSetUIButtonStatus: renderSetUIButtonStatus,
        renderRemoteCheckOptions: renderRemoteCheckOptions,
        renderRemoteCheckSuccessPerfect: renderRemoteCheckSuccessPerfect,
        renderRemoteCheckSuccessDiff: renderRemoteCheckSuccessDiff,
        renderRemoteCheckReject: renderRemoteCheckReject
    })
    var renderHtml = window.XXG.BusinessCommon.renderHtml
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var openBiggerShow = Bang.openBiggerShow

    // addType 只支持 append prepend after before 以及 html
    function render($target, addType) {
        var $OrderDetailServiceRemoteCheck = $('#OrderDetailServiceRemoteCheck')
        if ($OrderDetailServiceRemoteCheck && $OrderDetailServiceRemoteCheck.length) {
            $OrderDetailServiceRemoteCheck.remove()
        }
        window.XXG.ServiceRemoteCheck.$Wrap = renderHtml(htmlTpl('#JsXxgOrderDetailServiceRemoteCheckTpl'), $target, addType)
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus()
    }

    function renderSetUIButtonStatus(type) {
        var $trigger = $('.btn-go-next').eq(0)
        switch (type) {
            case 1:
                // 审核中
                $trigger
                    .addClass('btn-go-next-lock')
                    .html('审核中...')
                break
            case 2:
                // 远程验机成功/超时
                $trigger
                    .removeClass('btn-go-next-lock')
                    // .html('完成订单')
                    .html($trigger.attr('data-default-text'))
                break
            case 3:
                // 驳回
                $trigger
                    .removeClass('btn-go-next-lock')
                    .html('重新提交')
                break
            case 4:
                // 将按钮文案恢复到默认状态
                $trigger
                    .removeClass('btn-go-next-lock')
                    .html($trigger.attr('data-default-text'))
                break
            default:
                // 记录按钮的默认文案
                $trigger.attr('data-default-text', $trigger.html())
        }
        return $trigger
    }

    function renderRemoteCheckOptions(data) {
        return renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceRemoteCheckOptionsTpl', data),
            window.XXG.ServiceRemoteCheck.$Wrap
        )
    }

    function renderRemoteCheckSuccessPerfect(data) {
        return renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceRemoteCheckSuccessPerfectTpl', data),
            window.XXG.ServiceRemoteCheck.$Wrap
        )
    }

    function renderRemoteCheckSuccessDiff(data) {
        var remote_check_tagging_imgs = []
        tcb.each(data.remote_check_tagging_imgs || {}, function (k, v) {
            remote_check_tagging_imgs.push(v)
        })
        data.remote_check_tagging_imgs = remote_check_tagging_imgs

        var $Wrap = window.XXG.ServiceRemoteCheck.$Wrap
        var $Ret = renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceRemoteCheckSuccessDiffTpl', data),
            $Wrap
        )

        setTimeout(function () {
            var $imgs = $Wrap.find('.js-trigger-show-big-img')
            var $cols = $Wrap.find('.row-picture .col-2-1')
            var $pics = $Wrap.find('.row-picture .col-2-1 .pic')
            if ($imgs.length) {
                var s = $cols.eq(0).width() - 1
                openBiggerShow($imgs)
                $cols.css({
                    'width': s,
                    'height': s
                })
                $pics.css({
                    'line-height': (s * .96) + 'px'
                })
                tcb.setImgElSize($imgs, s * .96 * .9, s * .96 * .9)
            }
        }, 300)

        return $Ret
    }

    function renderRemoteCheckReject(data) {
        return renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceRemoteCheckRejectTpl', data),
            window.XXG.ServiceRemoteCheck.$Wrap
        )
    }

}()
