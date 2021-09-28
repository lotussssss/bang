// 隐私数据处理
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivateData = tcb.mix(window.XXG.ServicePrivateData || {}, {
        renderServicePrivateDataBtn: renderServicePrivateDataBtn,

        htmlServicePrivateDataBtn: htmlServicePrivateDataBtn,
        htmlServicePrivateDataDialogConfirmMigrate: htmlServicePrivateDataDialogConfirmMigrate,
        htmlServicePrivateDataDialogCleanPrivateData: htmlServicePrivateDataDialogCleanPrivateData,
        htmlServicePrivateDataDialogMigrateAndCleanPrivateData: htmlServicePrivateDataDialogMigrateAndCleanPrivateData,
        htmlServicePrivateDataDialogAlipayWithholding: htmlServicePrivateDataDialogAlipayWithholding,
        htmlServicePrivateDataDialogStartMigrate: htmlServicePrivateDataDialogStartMigrate
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml

    function renderServicePrivateDataBtn(data, $target, addType) {
        $target = $target || $('.block-order-bottom-btn')
        addType = addType || 'html'
        renderHtml(
            window.XXG.ServicePrivateData.htmlServicePrivateDataBtn(data),
            $target,
            addType
        )
    }

    //=========== HTML输出 =============

    // 隐私清除+数据迁移底部按钮
    function htmlServicePrivateDataBtn(data) {
        return htmlTpl('#JsMXxgOrderDetailServicePrivateDataBtnTpl', data)
    }

    // 弹窗--清除隐私数据---隐私数据操作
    function htmlServicePrivateDataDialogCleanPrivateData(data) {
        var rootData = window.XXG.ServicePrivateData.rootData
        rootData.servicePrivateData.confirmCleanedAct = data.confirmAct
        return htmlTpl('#JsXxgOrderDetailServicePrivateDataDialogCleanPrivateDataTpl', rootData)
    }

    // 弹窗--转移、清除隐私数据---隐私数据操作
    function htmlServicePrivateDataDialogMigrateAndCleanPrivateData(data) {
        var rootData = window.XXG.ServicePrivateData.rootData
        rootData.servicePrivateData.confirmCleanedAct = data.confirmAct
        return htmlTpl('#JsXxgOrderDetailServicePrivateDataDialogMigrateAndCleanPrivateDataTpl', rootData)
    }

    // 弹窗--转移隐私数据询问弹窗---隐私数据操作
    function htmlServicePrivateDataDialogConfirmMigrate() {
        var rootData = window.XXG.ServicePrivateData.rootData
        return htmlTpl('#JsXxgOrderDetailServicePrivateDataDialogConfirmMigrateTpl', rootData)
    }

    // 弹窗--支付宝代扣弹窗---隐私数据操作
    function htmlServicePrivateDataDialogAlipayWithholding(data) {
        var rootData = window.XXG.ServicePrivateData.rootData
        rootData.servicePrivateData.alipayWithholdingUrl = data.url || ''
        return htmlTpl('#JsXxgOrderDetailServicePrivateDataDialogAlipayWithholdingTpl', rootData)
    }

    // 弹窗--开始数据迁移---隐私数据操作
    function htmlServicePrivateDataDialogStartMigrate() {
        var rootData = window.XXG.ServicePrivateData.rootData
        return htmlTpl('#JsMXxgOrderDetailServicePrivateDataDialogStartMigrateTpl', rootData)
    }

}()
