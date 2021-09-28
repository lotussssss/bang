// 拍照上传
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceUploadPicture = tcb.mix(window.XXG.ServiceUploadPicture || {}, {
        render: render,
        renderSwipe: renderSwipe
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml
    var SwipeSection = window.Bang.SwipeSection

    function render(data, $target, addType) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        var $Wrap = renderHtml(
            htmlTpl('#JsMXxgOrderDetailServiceUploadPictureTpl', data),
            $target,
            addType || 'html'
        )
        var $blockModelInfo = $Wrap.find('.block-model-info'),
            $blockModelTakePicture = $Wrap.find('.block-model-take-picture'),
            $swipeBlockBtn = $Wrap.find('.swipe-block-btn')

        $blockModelTakePicture.css({
            height: $(window).height() - $Wrap.find('header').height() - $blockModelInfo.height() - $swipeBlockBtn.height()
        })
        return $Wrap
    }

    function renderSwipe(data) {
        var $swipe = SwipeSection.getSwipeSection('.swipe-page-service-upload-picture')
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailServiceUploadPictureTpl').html())),
            html_st = html_fn(data)
        SwipeSection.fillSwipeSection(html_st)

        var $swipeMainContent = $swipe.find('.swipe-main-content'),
            $blockModelInfo = $swipe.find('.block-model-info'),
            $blockModelTakePicture = $swipe.find('.block-model-take-picture'),
            $swipeBlockBtn = $swipe.find('.swipe-block-btn')

        $blockModelTakePicture.css({
            height: $(window).height() - $swipe.find('header').height() - $blockModelInfo.height() - $swipeBlockBtn.height()
        })
        return $swipe
    }

}()
