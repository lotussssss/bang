!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFix = tcb.mix(window.XXG.BusinessSfFix || {}, {
        render: render,
        renderBusinessSfFixStatus: renderBusinessSfFixStatus,
        renderBusinessSfFixProduct: renderBusinessSfFixProduct,
        renderBusinessSfFixBtn: renderBusinessSfFixBtn,

        htmlBusinessSfFixStatusRecycle: htmlBusinessSfFixStatusRecycle,
        htmlBusinessSfFixStatusReNew: htmlBusinessSfFixStatusReNew,

        htmlBusinessSfFixProductNew: htmlBusinessSfFixProductNew,
        htmlBusinessSfFixProductOld: htmlBusinessSfFixProductOld,
        htmlBusinessSfFixProductPriceInfoReNew: htmlBusinessSfFixProductPriceInfoReNew,
        htmlBusinessSfFixProductPriceInfoRecycle: htmlBusinessSfFixProductPriceInfoRecycle,

        htmlBusinessSfFixBtnReNew: htmlBusinessSfFixBtnReNew,
        htmlBusinessSfFixBtnRecycle: htmlBusinessSfFixBtnRecycle
    })
    var renderHtml = window.XXG.BusinessCommon.renderHtml
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl

    //=========== render到页面 =============
    // 输出html到页面，并且绑定相关事件
    function render(data) {
        var $target = window.XXG.BusinessSfFix.$Wrap
        if (!($target && $target.length)) {
            $target = $('#mainbody .mainbody-inner')
        }
        var order = data.order
        /********** 模板输出 **********/
        // 订单状态
        window.XXG.BusinessSfFix.renderBusinessSfFixStatus(data, $target)
        // 物品信息
        window.XXG.BusinessSfFix.renderBusinessSfFixProduct(data, $target, 'append')
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
        window.XXG.BusinessSfFix.renderBusinessSfFixBtn(data, $target, 'append')
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
    function renderBusinessSfFixStatus(data, $target, addType) {
        var $Status = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatus(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusTitle(data), $Status)
        if (data.order.status == 13 && data.isDeviceResetAndUploadPhoto) {
            // 服务完成 && 需要上传设备还原后的照片（确认还原后再）
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusDeviceResetAndUploadPhoto(data), $Status)
        } else if (data.sfFixData.__recycle) {
            // 丰修--纯回收
            renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixStatusRecycle(data), $Status)
        } else if (data.sfFixData.__re_new) {
            // 丰修--以旧换新
            renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixStatusReNew(data), $Status)
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
    function renderBusinessSfFixProduct(data, $target, addType) {
        var $Product = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProduct(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProductTitle(data), $Product)
        if (data.sfFixData.new_device) {
            renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixProductNew(data), $Product)
        }
        renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixProductOld(data), $Product)
        if (!data.serviceRemoteCheck.remote_check_flag ||
            (data.serviceRemoteCheck.remote_check_flag && data.serviceRemoteCheck.remote_check_flag_process == 3)) {
            // 非远程验机 || 远程验机并且已经验机完成
            if (data.sfFixData.__re_new) {
                renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixProductPriceInfoReNew(data), $Product)
            } else if (data.sfFixData.__recycle) {
                renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixProductPriceInfoRecycle(data), $Product)
            }
        }

        return $Product
    }

    // 输出订单操作按钮
    function renderBusinessSfFixBtn(data, $target, addType) {
        var $Btn = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonBtn(data), $target, addType || 'html')

        if (data.sfFixData.__re_new) {
            renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixBtnReNew(data), $Btn)
        } else if (data.sfFixData.__recycle) {
            renderHtml(window.XXG.BusinessSfFix.htmlBusinessSfFixBtnRecycle(data), $Btn)
        }

        return $Btn
    }


    //=========== HTML输出 =============
    // 订单状态---丰修纯回收
    function htmlBusinessSfFixStatusRecycle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixStatusRecycleTpl', data)
    }

    // 订单状态---丰修换新
    function htmlBusinessSfFixStatusReNew(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixStatusReNewTpl', data)
    }

    // 物品信息---丰修新机信息
    function htmlBusinessSfFixProductNew(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixProductNewTpl', data)
    }

    // 物品信息---丰修旧机信息
    function htmlBusinessSfFixProductOld(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixProductOldTpl', data)
    }

    // 物品信息---丰修换新价格、优惠信息等
    function htmlBusinessSfFixProductPriceInfoReNew(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixProductPriceInfoReNewTpl', data)
    }

    // 物品信息---丰修新机信息
    function htmlBusinessSfFixProductPriceInfoRecycle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixProductPriceInfoRecycleTpl', data)
    }

    // 按钮操作---丰修换新
    function htmlBusinessSfFixBtnReNew(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixBtnReNewTpl', data)
    }

    // 按钮操作---丰修纯回收
    function htmlBusinessSfFixBtnRecycle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixBtnRecycleTpl', data)
    }
}()
