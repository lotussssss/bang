// 获取数据的接口
!function (global) {
    var
        Root = tcb.getRoot(),
        o = Root.Order,
        // 1：上门，2：到店，3：邮寄
        serviceTypeMap = {
            '1': '',
            '2': '',
            '3': ''
        }
    o.data = {}

    tcb.mix(o.data, {
        getAssessDetectReport: getAssessDetectReport,
        getAssessReport: getAssessReport,
        getSeCode: getSeCode,

        getServiceType: getServiceType,

        postShangMenForm: postShangMenForm,
        postYouJiForm: postYouJiForm,
        postDaoDianForm: postDaoDianForm,
        postSchedulePickupForm: postSchedulePickupForm,
        postXxgApplyGoodPriceForm: postXxgApplyGoodPriceForm
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    // 获取评估检测报告
    function getAssessDetectReport(params, callback, error) {

        __ajax({
            type: 'GET',
            url: tcb.setUrl2('/huishou/doGetDetectReport'),
            data: params
        }, callback, error)
    }

    // 获取评估报告
    function getAssessReport(params, callback, error) {

        __ajax({
            type: 'GET',
            //url  : '/huishou/doGetDetectReport',
            url: tcb.setUrl2('/m/doshowpinggudetail'),
            data: params
        }, callback, error)
    }

    // 获取检测报告
    function getSeCode(params, callback, error) {

        __ajax({
            type: 'POST',
            url: tcb.setUrl2('/aj/doSendSmscode/'),
            data: params
        }, callback, error)
    }

    // 根据城市，机器价格，[hdid]，获取可用服务方式
    function getServiceType(params, callback, error) {
        //在 Android 下，需要通过 WeixinJSBridge 对象将网页的字体大小设置为默认大小，并且重写设置字体大小的方法，让用户不能在该网页下设置字体大小。
        (function() {
            if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                handleFontSize();
            } else {
                if (document.addEventListener) {
                    document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);
                } else if (document.attachEvent) {
                    document.attachEvent("WeixinJSBridgeReady", handleFontSize);
                    document.attachEvent("onWeixinJSBridgeReady", handleFontSize);
                }
            }
            function handleFontSize() {
                WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });
                WeixinJSBridge.on('menu:setfont', function() {
                    WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });
                });
            }
        })();
        __ajax({
            type: 'GET',
            url: tcb.setUrl2('/huishou/dogetshoppingtype/'),
            data: params
        }, callback, error)
    }


    function postShangMenForm($form, callback, error) {
        var
            request_url = tcb.setUrl2($form.attr('action'))

        __ajax({
            type: 'POST',
            url: request_url,
            data: $form.serialize()
        }, callback, error)

    }

    function postYouJiForm($form, callback, error) {
        var
            request_url = tcb.setUrl2($form.attr('action'))

        __ajax({
            type: 'POST',
            url: request_url,
            data: $form.serialize()
        }, callback, error)
    }

    // 提交到店表单
    function postDaoDianForm($form, callback, error) {
        if (window.isSuningShopPlusOutDate) {
            window.isSuningShopPlusOutDate(function (isOutDate) {
                if (isOutDate) {
                    window.showDialogSuningShopPlusOutDate(function () {
                        __postDaoDianForm($form, callback, error)
                    })
                } else {
                    __postDaoDianForm($form, callback, error)
                }
            })
        } else {
            __postDaoDianForm($form, callback, error)
        }
    }

    function __postDaoDianForm($form, callback, error) {
        var request_url = tcb.setUrl2($form.attr('action'))

        __ajax({
            type: 'POST',
            url: request_url,
            data: $form.serialize()
        }, callback, error)
    }

    // 提交预约上门取件表单
    function postSchedulePickupForm($form, callback, error) {
        var
            request_url = tcb.setUrl2($form.attr('action'))

        __ajax({
            type: 'POST',
            url: request_url,
            data: $form.serialize()
        }, callback, error)

    }

    function postXxgApplyGoodPriceForm($form, callback, error) {
        var
            request_url = tcb.setUrl2($form.attr('action'))

        __ajax({
            type: 'POST',
            url: request_url,
            data: $form.serialize()
        }, callback, error, true)

    }


    // =================================================================
    // 私有接口 private
    // =================================================================


    function __ajax(params, callback, error, no_error_toast) {
        $.ajax({
            type: params['type'],
            url: tcb.setUrl2(params['url']),
            data: params['data'],
            dataType: 'json',
            timeout: 15000,
            success: function (res) {

                if (res['errno']) {
                    !no_error_toast && $.dialog.toast(res['errmsg'], 2000)
                }
                typeof callback === 'function' && callback(res['result'], res['errno'])

            },
            error: function () {
                typeof error === 'function' && error()
            }
        })
    }

}(this)
