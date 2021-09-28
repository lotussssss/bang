// 纯回收上门转邮寄
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceShangmenToYouji = tcb.mix(window.XXG.ServiceShangmenToYouji || {}, {
        render: render,
        renderToYouji: renderToYouji,
        renderToYoujiStatus: renderToYoujiStatus,

        htmlReasonList: htmlReasonList,
        htmlServiceShangmenToYoujiStatus: htmlServiceShangmenToYoujiStatus
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml

    function render(data, $target, addType) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        var $Wrap = renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceShangmenToYoujiTpl', data),
            $target,
            addType || 'append'
        )
        return $Wrap
    }

    function renderToYouji(data, $target) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        data.order.status_name = '已到达'

        /********** 模板输出 **********/
        $.scrollTo({
            endY: 0
        })
        // 订单状态
        window.XXG.ServiceShangmenToYouji.renderToYoujiStatus(data, $target, 'html')
        // 物品信息
        window.XXG.BusinessSfFix.renderBusinessSfFixProduct(data, $target, 'append')
        // 订单信息
        window.XXG.BusinessCommon.renderBusinessCommonInfo(data, $target, 'append')
        // 输出核验码的条形码
        window.XXG.BusinessCommon.renderVerificationCodeBarcode()
        $target.show()

        /********** 事件绑定 **********/
        // 绑定copy
        window.XXG.BusinessCommon.eventBindCopy($target.find('.js-trigger-copy-the-text'))
    }

    function renderToYoujiStatus(data, $target, addType) {
        var $Status = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatus(data), $target, addType)

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusTitle(data), $Status)
        renderHtml(window.XXG.ServiceShangmenToYouji.htmlServiceShangmenToYoujiStatus(data), $Status)
        // 上门地址信息
        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusAddressInfo(data), $Status)

        return $Status
    }

    //=========== HTML输出 =============
    function htmlReasonList() {
        return htmlTpl('#JsXxgOrderDetailServiceShangmenToYoujiReasonListTpl')
    }

    // 订单状态---纯回收上门转邮寄
    function htmlServiceShangmenToYoujiStatus(data) {
        return htmlTpl('#JsXxgOrderDetailServiceShangmenToYoujiStatusTpl', data)
    }


}()
