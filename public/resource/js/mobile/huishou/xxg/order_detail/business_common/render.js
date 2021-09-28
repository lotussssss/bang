!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        render: render,
        renderHtml: renderHtml,
        renderBusinessCommonStatus: renderBusinessCommonStatus,
        renderBusinessCommonProduct: renderBusinessCommonProduct,
        renderBusinessCommonDeal: renderBusinessCommonDeal,
        renderBusinessCommonInfo: renderBusinessCommonInfo,
        renderBusinessCommonExtend: renderBusinessCommonExtend,
        renderBusinessCommonBtn: renderBusinessCommonBtn,
        renderVerificationCodeBarcode: renderVerificationCodeBarcode,
        renderLogisticsMailNoBarcode: renderLogisticsMailNoBarcode,

        htmlTpl: htmlTpl,
        htmlBusinessCommonStatus: htmlBusinessCommonStatus,
        htmlBusinessCommonStatusTitle: htmlBusinessCommonStatusTitle,
        htmlBusinessCommonStatusShippingInfo: htmlBusinessCommonStatusShippingInfo,
        htmlBusinessCommonStatusShippingInfoAuto: htmlBusinessCommonStatusShippingInfoAuto,
        htmlBusinessCommonStatusPickupServiceTime: htmlBusinessCommonStatusPickupServiceTime,
        htmlBusinessCommonStatusAddressInfo: htmlBusinessCommonStatusAddressInfo,
        htmlBusinessCommonStatusAddressInfoTips: htmlBusinessCommonStatusAddressInfoTips,
        htmlBusinessCommonStatusDeviceResetAndUploadPhoto: htmlBusinessCommonStatusDeviceResetAndUploadPhoto,

        htmlBusinessCommonProduct: htmlBusinessCommonProduct,
        htmlBusinessCommonProductTitle: htmlBusinessCommonProductTitle,
        htmlBusinessCommonProductOld: htmlBusinessCommonProductOld,
        htmlBusinessCommonProductPriceInfo: htmlBusinessCommonProductPriceInfo,

        htmlBusinessCommonDeal: htmlBusinessCommonDeal,
        htmlBusinessCommonDealAssessDetail: htmlBusinessCommonDealAssessDetail,
        htmlBusinessCommonDealUpdateOrder: htmlBusinessCommonDealUpdateOrder,

        htmlBusinessCommonInfo: htmlBusinessCommonInfo,

        htmlBusinessCommonExtend: htmlBusinessCommonExtend,

        htmlBusinessCommonBtn: htmlBusinessCommonBtn,
        htmlBusinessCommonBtnShangMen: htmlBusinessCommonBtnShangMen,
        htmlBusinessCommonBtnDaoDian: htmlBusinessCommonBtnDaoDian,

        htmlBusinessCommonDialogCityManager: htmlBusinessCommonDialogCityManager
    })

    //=========== render到页面 =============
    // 输出html到页面，并且绑定相关事件
    function render(data, $target) {
        data = data || {}
        if (!($target && $target.length)) {
            $target = $('#mainbody .mainbody-inner')
        }
        var order = data.order
        /********** 模板输出 **********/
        // 订单状态
        window.XXG.BusinessCommon.renderBusinessCommonStatus(data, $target)
        // 物品信息
        window.XXG.BusinessCommon.renderBusinessCommonProduct(data, $target, 'append')
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
        window.XXG.BusinessCommon.renderBusinessCommonBtn(data, $target, 'append')
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
        if (order.status == 12 && !order.order_scan) {// 未扫码，展开更改评估和价格编辑
            $target.find('.js-trigger-expand-n-collapse').trigger('click')
        }

        window.XXG.BusinessCommon.eventTriggerRenderDone()
    }

    function renderHtml(html_st, $target, addType) {
        if (!($target && $target.length)) {
            console.warn('出错了，$target没有，看看代码是不是写错了！')
            return
        }
        var $html_st = $(html_st)
        var addTypeSet = ['append', 'prepend', 'after', 'before', 'html']
        // addType 默认值设置为 append
        addType = addTypeSet.indexOf(addType) > -1 ? addType : 'append'
        $target[addType]($html_st)

        return $html_st
    }

    // 输出订单状态信息
    function renderBusinessCommonStatus(data, $target, addType) {
        var $Status = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatus(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonStatusTitle(data), $Status)
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
    function renderBusinessCommonProduct(data, $target, addType) {
        var $Product = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProduct(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProductTitle(data), $Product)
        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProductOld(data), $Product)
        if (!data.serviceRemoteCheck.remote_check_flag ||
            (data.serviceRemoteCheck.remote_check_flag && data.serviceRemoteCheck.remote_check_flag_process == 3)) {
            // 非远程验机 || 远程验机并且已经验机完成
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonProductPriceInfo(data), $Product)
        }

        return $Product
    }

    // 输出旧机评估
    function renderBusinessCommonDeal(data, $target, addType) {
        var $Deal = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonDeal(data), $target, addType || 'html')

        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonDealAssessDetail(data), $Deal)
        renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonDealUpdateOrder(data), $Deal)

        return $Deal
    }

    // 输出订单基本信息
    function renderBusinessCommonInfo(data, $target, addType) {
        var $Info = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonInfo(data), $target, addType || 'html')
        return $Info
    }

    // 输出订单扩展信息
    function renderBusinessCommonExtend(data, $target, addType) {
        var $Extend = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonExtend(data), $target, addType || 'html')
        return $Extend
    }

    // 输出订单操作按钮
    function renderBusinessCommonBtn(data, $target, addType) {
        var $Btn = renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonBtn(data), $target, addType || 'html')

        if (order.sale_type == 2) {
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonBtnShangMen(data), $Btn)
        } else if (order.sale_type == 3) {
            renderHtml(window.XXG.BusinessCommon.htmlBusinessCommonBtnDaoDian(data), $Btn)
        }

        return $Btn
    }

    // 输出核验码的条形码
    function renderVerificationCodeBarcode() {
        var id = '#SfFixVerificationCodeBarcode'
        if (!$(id).length) {
            return
        }
        JsBarcode(id, $(id).attr('data-verification-code'), {
            width: 3,
            height: 40,
            margin: 0,
            displayValue: false
        })
    }

    // 输出快递单号条形码
    function renderLogisticsMailNoBarcode() {
        var id = '#SfFixLogisticsMailNo'
        if (!$(id).length) {
            return
        }
        var mail_no = $(id).attr('data-logistics-mail-no') || ''
        if (/[\u4e00-\u9fa5]+/.test(mail_no)) {
            return $(id).hide()
        }
        JsBarcode(id, mail_no, {
            width: 2.5,
            height: 60,
            margin: 0,
            displayValue: false
        })
    }


    //=========== HTML输出 =============
    function htmlTpl(selector, data) {
        var html_fn = $.tmpl($.trim($(selector).html())),
            html_st = html_fn(data || {})
        return html_st
    }

    /*订单状态*/
    function htmlBusinessCommonStatus(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusTpl', data)
    }

    // 订单状态---title
    function htmlBusinessCommonStatusTitle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusTitleTpl', data)
    }

    // 订单状态---旧机发货信息
    function htmlBusinessCommonStatusShippingInfo(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusShippingInfoTpl', data)
    }

    // 订单状态---旧机发货信息-自动分配寄回单号
    function htmlBusinessCommonStatusShippingInfoAuto(data) {
        var order = data.order || {}
        var newstatus_time = order.newstatus_time || ''
        var timeDurationAfterOrderFinish = window.XXG.BusinessCommon.helperNowTime() - Date.parse(newstatus_time.replace(/-/g, '/'))
        // data.timeDurationAfterOrderFinish = 1000
        data.timeDurationAfterOrderFinish = timeDurationAfterOrderFinish
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusShippingInfoAutoTpl', data)
    }

    // 订单状态---上门取件时间
    function htmlBusinessCommonStatusPickupServiceTime(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusPickupServiceTimeTpl', data)
    }

    // 订单状态---上门地址信息
    function htmlBusinessCommonStatusAddressInfo(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusAddressInfoTpl', data)
    }

    // 订单状态---提示确认上门时间
    function htmlBusinessCommonStatusAddressInfoTips(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusAddressInfoTipsTpl', data)
    }

    // 订单状态---是否展示妥投码（基于是否还原、拍照的逻辑）
    function htmlBusinessCommonStatusDeviceResetAndUploadPhoto(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonStatusDeviceResetAndUploadPhotoTpl', data)
    }

    /*物品信息*/
    function htmlBusinessCommonProduct(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonProductTpl', data)
    }

    // 物品信息---title
    function htmlBusinessCommonProductTitle(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonProductTitleTpl', data)
    }

    // 物品信息---旧机信息
    function htmlBusinessCommonProductOld(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonProductOldTpl', data)
    }

    // 物品信息---价格、优惠信息等
    function htmlBusinessCommonProductPriceInfo(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonProductPriceInfoTpl', data)
    }

    /*旧机评估*/
    function htmlBusinessCommonDeal(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonDealTpl', data)
    }

    // 旧机评估---评估结果信息
    function htmlBusinessCommonDealAssessDetail(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonDealAssessDetailTpl', data)
    }

    // 旧机评估---更新订单信息（评估结果、价格、imei、备注等）
    function htmlBusinessCommonDealUpdateOrder(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonDealUpdateOrderTpl', data)
    }

    // 订单信息
    function htmlBusinessCommonInfo(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonInfoTpl', data)
    }

    // 订单扩展信息
    function htmlBusinessCommonExtend(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonExtendTpl', data)
    }

    // 操作按钮
    function htmlBusinessCommonBtn(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonBtnTpl', data)
    }

    // 操作按钮---上门
    function htmlBusinessCommonBtnShangMen(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonBtnShangMenTpl', data)
    }

    // 操作按钮---到店
    function htmlBusinessCommonBtnDaoDian(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessCommonBtnDaodianTpl', data)
    }

    // 订单取消城市督导弹窗
    function htmlBusinessCommonDialogCityManager(data) {
        return htmlTpl('#JsMXxgOrderDetailBusinessSfFixDialogCityManagerTpl', data)
    }
}()
