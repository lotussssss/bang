// 拍照上传
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceUploadPicture = tcb.mix(window.XXG.ServiceUploadPicture || {}, {
        actionShow: actionShow,
        actionClose: actionClose,
        actionDelPicture: actionDelPicture,
        actionShowProcessBar: actionShowProcessBar,
        actionShowProcessBar100: actionShowProcessBar100,
        actionHideProcessBar: actionHideProcessBar,
        actionSetUploadingPicture: actionSetUploadingPicture,
        actionSetUploadedPicture: actionSetUploadedPicture
    })
    var SwipeSection = window.Bang.SwipeSection

    function actionShow() {
        var rootData = window.XXG.ServiceUploadPicture.rootData || {}
        var order = rootData.order || {}
        window.XXG.ServiceUploadPicture.apiGetUploadPictureShootRule({
            categoryId: order.category_id
        }, function (res) {
            var uploadList = res.result || []
            var $swipe = window.XXG.ServiceUploadPicture.renderSwipe({
                order_id: order.order_id,
                dealPrice: order.price,
                uploadList: uploadList
            })
            var $trigger = $swipe.find('.js-trigger-upload-picture')

            window.XXG.ServiceUploadPicture.apiGetPicture(order.order_id, function (res) {
                tcb.each(res.result || [], function (i) {
                    var $triggerCurrent = $trigger.eq(i)
                    $triggerCurrent.removeClass('icon-close').css({
                        'border': '1px solid #ddd',
                        'background-image': 'url(' + tcb.imgThumbUrl(res.result[i], 300, 300, 'edr') + ')'
                    })
                    window.XXG.ServiceUploadPicture.actionSetUploadedPicture($triggerCurrent, res.result[i])
                })
            })

            window.XXG.ServiceUploadPicture.eventBind($swipe)
            window.XXG.ServiceUploadPicture.eventBindTakePhotoUpload($trigger)
            window.XXG.ServiceUploadPicture.eventBindFormXxgOrderSubmitPicture($swipe.find('#FormXxgOrderUploadPicture'))

            SwipeSection.doLeftSwipeSection()
        })
    }

    function actionClose() {
        SwipeSection.backLeftSwipeSection()
    }

    function actionDelPicture($delTrigger) {
        $delTrigger.hide()

        var $TriggerUploadPicture = $delTrigger.siblings('.js-trigger-upload-picture'),
            $TriggerInvokeCamera = $delTrigger.siblings('.trigger-invoke-camera')

        $TriggerInvokeCamera.val('')

        $TriggerUploadPicture
        //.addClass ('icon-close')
            .css({
                'border': '0',
                'background-image': ''
            })
        $('[name="' + $TriggerUploadPicture.attr('data-for') + '"]').val('')

        window.XXG.ServiceUploadPicture.actionHideProcessBar($delTrigger.siblings('.fake-upload-progress'))
    }

    function actionShowProcessBar($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.show()

        var percent_val = 25
        $processBarInner.css({'width': percent_val + '%'})

        setTimeout(function h() {
            percent_val += 12
            if (percent_val > 100) {
                return
            }
            if ($processBarInner.css('width') == '100%') {
                return
            }
            $processBarInner.css({'width': percent_val + '%'})

            if (percent_val < 100) {
                setTimeout(h, 500)
            }
        }, 500)
    }

    function actionShowProcessBar100($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.show()
        $processBarInner.css({'width': '100%'})
    }

    function actionHideProcessBar($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.hide()
        $processBarInner.css({'width': '0'})
    }

    function actionSetUploadingPicture($trigger, img) {
        if (!img) {
            return
        }
        $trigger
            .css({
                'border': '1px solid #ddd',
                'background-image': 'url(' + img + ')' // tcb.imgThumbUrl(img, 300, 300, 'edr')
            })
    }

    function actionSetUploadedPicture($trigger, img) {
        if (!img) {
            return
        }
        var $DelPicture = $trigger.siblings('.js-trigger-del-picture')

        $DelPicture.show()
        //$trigger.removeClass ('icon-close').css ({
        //    'border': '1px solid #ddd',
        //    'background-image' : 'url(' + img + ')' // tcb.imgThumbUrl(img, 300, 300, 'edr')
        //})
        $('[name="' + $trigger.attr('data-for') + '"]').val(img)
    }

}()
