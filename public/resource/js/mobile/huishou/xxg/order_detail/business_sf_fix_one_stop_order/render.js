!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFixOneStopOrder = tcb.mix(window.XXG.BusinessSfFixOneStopOrder || {}, {
        render: render,
        renderBusinessSfFixOneStopOrderStatus: renderBusinessSfFixOneStopOrderStatus,
        renderBusinessSfFixOneStopOrderProduct: renderBusinessSfFixOneStopOrderProduct,
        renderBusinessSfFixOneStopOrderBtn: renderBusinessSfFixOneStopOrderBtn,

        htmlBusinessSfFixOneStopOrderStatusTitle: htmlBusinessSfFixOneStopOrderStatusTitle,
        htmlBusinessSfFixOneStopOrderStatusVerificationCode: htmlBusinessSfFixOneStopOrderStatusVerificationCode,

        htmlBusinessSfFixOneStopOrderProductNew: htmlBusinessSfFixOneStopOrderProductNew,
        htmlBusinessSfFixOneStopOrderProductOld: htmlBusinessSfFixOneStopOrderProductOld,
        htmlBusinessSfFixOneStopOrderProductPriceInfo: htmlBusinessSfFixOneStopOrderProductPriceInfo,

        htmlBusinessSfFixOneStopOrderBtn: htmlBusinessSfFixOneStopOrderBtn
    })
    var renderHtml = window.XXG.BusinessCommon.renderHtml
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl

    //=========== render到页面 =============
    // 输出html到页面，并且绑定相关事件
    function render(data) {
        var $target = window.XXG.BusinessSfFixOneStopOrder.$Wrap
        if (!($target && $target.length)) {
            $target = $('#mainbody .mainbody-inner')
        }
        var order = data.order
        /********** 模板输出 **********/
        // 订单状态
        window.XXG.BusinessSfFixOneStopOrder.renderBusinessSfFixOneStopOrderStatus(data, $target)
        // 物品信息
        window.XXG.BusinessSfFixOneStopOrder.renderBusinessSfFixOneStopOrderProduct(data, $target, 'append')
        if (order.status >= 12 && order.status != 50) {
            // 旧机评估
            // 订单状态 大于等于12（到达之后），并且不为50（取消）的时候才输出旧机评估信息
            window.XXG.BusinessCommon.renderBusinessCommonDeal(data, $target, 'append')
        }
        // 订单信息
        window.XXG.BusinessCommon.renderBusinessCommonInfo(data, $target, 'append')
        // 订单扩展信息
        window.XXG.BusinessCommon.renderBusinessCommonExtend(data, $target, 'append')
        // 操作按钮
        window.XXG.BusinessSfFixOneStopOrder.renderBusinessSfFixOneStopOrderBtn(data, $target, 'append')
        // 输出核验码的条形码
        window.XXG.BusinessCommon.renderVerificationCodeBarcode()
        // 输出快递单号条形码
        window.XXG.BusinessCommon.renderLogisticsMailNoBarcode()
        $target.show()

        /********** 事件绑定 **********/
        // 绑定copy
        window.XXG.BusinessCommon.eventBindCopy($target.find('.js-trigger-copy-the-text'))
        // 选择上门或者到店时间
        window.XXG.BusinessCommon.eventBindPickupServerTime($target.find('.js-trigger-pickup-service-time'))
        // 绑定价格更新表单
        window.XXG.BusinessCommon.eventBindFormUpdateOrderInfo(
            $target.find('#FormUpdateOrderInfoByGoNext'),
            $target.find('.js-trigger-update-deal-price')
        )
        // 绑定丰修退回新机和寄回旧机的快递表单
        window.XXG.BusinessCommon.eventBindFormSfFixReturn(
            $target.find('#FormSfFixReturn'),
            $target.find('.btn-edit-express-confirm'),
            function () {
                window.XXG.redirect()
            }
        )
        if (order.status == 12 && !order.order_scan) {// 未扫码，展开更改评估和价格编辑
            $target.find('.js-trigger-expand-n-collapse').trigger('click')
        }
        window.XXG.BusinessCommon.eventTriggerRenderDone()
    }

    // 输出订单状态信息
    function renderBusinessSfFixOneStopOrderStatus(data, $target, addType) {
        var $Status = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatus(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderStatusTitle(data), $Status)
        if (data.oneStopData.__sf_fix) {
            // 丰修一站式
            if (data.order.status == 13 && data.isDeviceResetAndUploadPhoto) {
                // 服务完成 && 需要上传设备还原后的照片
                renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusDeviceResetAndUploadPhoto(data), $Status)
            } else {
                renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderStatusVerificationCode(data), $Status)
            }
        }
        if (data.order.status == 13) {
            // 旧机--服务完成
            // renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusShippingInfo(data), $Status)
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusShippingInfoAuto(data), $Status)
        }
        if (data.order.status != 13
            || (data.order.send_out && !data.order.send_out.logistics_mail_no && data.order.send_out.logistics_express_status_fail)) {
            // 非完成服务 || 完成服务 && 没有快递单号 && 自动预约寄件失败
            // 上门地址信息
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusAddressInfo(data), $Status)
        }
        if (data.isBeforeArrive) {
            // 上门回收--到达之前
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusPickupServiceTime(data), $Status)
        }
        if (data.order.status == 11) {
            // 确认收到新机后，扫码前
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusAddressInfoTips(data), $Status)
        }
        return $Status
    }

    // 输出订单商品信息
    function renderBusinessSfFixOneStopOrderProduct(data, $target, addType) {
        var $Product = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProduct(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProductTitle(data), $Product)
        renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderProductNew(data), $Product)
        renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderProductOld(data), $Product)
        var serviceRemoteCheck = data.serviceRemoteCheck
        var order = data.order
        if (order.status != 50
            && (!serviceRemoteCheck.remote_check_flag || (serviceRemoteCheck.remote_check_flag && serviceRemoteCheck.remote_check_flag_process == 3))
        ) {
            // 非远程验机 || 远程验机并且已经验机完成
            renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderProductPriceInfo(data), $Product)
        }

        return $Product
    }

    // 输出订单操作按钮
    function renderBusinessSfFixOneStopOrderBtn(data, $target, addType) {
        var $Btn = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonBtn(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessSfFixOneStopOrder.htmlBusinessSfFixOneStopOrderBtn(data), $Btn)

        return $Btn
    }

    //=========== HTML输出 =============
    // 订单状态---丰修一站式title
    function htmlBusinessSfFixOneStopOrderStatusTitle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderStatusTitleTpl', data)
    }

    // 订单状态---丰修一站式核验码
    function htmlBusinessSfFixOneStopOrderStatusVerificationCode(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderStatusVerificationCodeTpl', data)
    }

    // 物品信息---丰修一站式新机信息
    function htmlBusinessSfFixOneStopOrderProductNew(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderProductNewTpl', data)
    }

    // 物品信息---丰修一站式旧机信息
    function htmlBusinessSfFixOneStopOrderProductOld(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderProductOldTpl', data)
    }

    // 物品信息---丰修一站式价格、优惠信息等
    function htmlBusinessSfFixOneStopOrderProductPriceInfo(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderProductPriceInfoTpl', data)
    }

    // 按钮操作---丰修一站式
    function htmlBusinessSfFixOneStopOrderBtn(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixOneStopOrderBtnTpl', data)
    }

}()
