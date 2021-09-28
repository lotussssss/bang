!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        apiActionBeforeArrive: apiActionBeforeArrive,
        apiDoScanRePinggu: apiDoScanRePinggu,
        apiAddNotebookAutoCheckResult: apiAddNotebookAutoCheckResult,
        apiBindingArcRecord: apiBindingArcRecord,
        apiAutoCheckModelNotMatchNotice: apiAutoCheckModelNotMatchNotice,
        apiUpdateOrder: apiUpdateOrder,
        apiCloseOrder: apiCloseOrder,
        apiFinishOrder: apiFinishOrder,
        apiUpdateServerTime: apiUpdateServerTime,
        apiGetFinalPriceStructure: apiGetFinalPriceStructure,
        apiGetOrderExpressInfo: apiGetOrderExpressInfo,
        apiGetMobileRestoreSituation: apiGetMobileRestoreSituation,
        apiOrderXxgTrace: apiOrderXxgTrace,
        apiGetCityManagerInfo: apiGetCityManagerInfo
    })

    // 修修哥开始服务前的操作：1、接单；2、出发；3、到达
    function apiActionBeforeArrive($btn, callback, fail) {
        var btn_text = $btn.html(),
            order_id = $btn.attr('data-order-id'),
            now_status = $btn.attr('data-now-status'),
            next_status = $btn.attr('data-next-status')

        window.XXG.ajax({
            url: tcb.setUrl('/m/aj_xxg_parent_status'),
            data: {
                'parent_id': order_id,
                'now_status': now_status,
                'next_status': next_status
            },
            beforeSend: function () {
                if ($btn.hasClass('btn-disabled')) {
                    return false
                }
                $btn.addClass('btn-disabled').html('处理中...')
            },
            success: function (res) {
                if (!res.errno) {
                    setTimeout(function () {
                        $btn.removeClass('btn-disabled').html(btn_text)
                    }, 1000)
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $btn.removeClass('btn-disabled').html(btn_text)
                    $.dialog.toast(res.errmsg)
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $btn.removeClass('btn-disabled').html(btn_text)
                $.dialog.toast('系统错误，请稍后重试')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 扫码评估（重新评估）
    function apiDoScanRePinggu(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/doScanRePinggu'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 添加笔记本自动评估结果（获取modelId和assessKey）
    function apiAddNotebookAutoCheckResult(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/addNotebookAutoCheckResult'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 笔记本自动验机绑定到订单（重新评估）
    function apiBindingArcRecord(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/bindingArcRecord'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    /**
     * 自动验机-机型映射不存在的通知
     * @param data
     *      {
     *          sequenceCode,
     *          [imageUrl]
     *      }
     * @param callback
     * @param fail
     */
    function apiAutoCheckModelNotMatchNotice(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl('/m/autoCheckModelNotMactchNotice'),
            type: 'POST',
            data: data,
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 更新订单信息
    function apiUpdateOrder(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/aj_up_order_info'),
            type: 'POST',
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 关闭订单
    function apiCloseOrder(data, callback, fail) {
        // var data = {
        //     order_id: order_id,
        //     xxg_memo: ''
        // }
        window.XXG.ajax({
            url: tcb.setUrl('/m/aj_close_order'),
            type: 'POST',
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 完成订单
    function apiFinishOrder($btn, callback, fail) {
        var btn_text = $btn.html(),
            order_id = $btn.attr('data-order-id'),
            now_status = $btn.attr('data-now-status')

        window.XXG.ajax({
            url: tcb.setUrl('/m/aj_wancheng_order'),
            data: {
                'order_id': order_id,
                'status': now_status
            },
            beforeSend: function () {
                if ($btn.hasClass('btn-disabled')) {
                    return false
                }
                $btn.addClass('btn-disabled').html('处理中...')
            },
            success: function (res) {
                if (!res.errno) {
                    setTimeout(function () {
                        $btn.removeClass('btn-disabled').html(btn_text)
                    }, 1000)
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $btn.removeClass('btn-disabled').html(btn_text)
                    $.dialog.toast(res.errmsg)
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $btn.removeClass('btn-disabled').html(btn_text)
                $.dialog.toast('系统错误，请稍后重试')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 更新上门服务时间
    function apiUpdateServerTime(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl2('/m/changeOrderToHomeDate'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    function apiGetFinalPriceStructure(data, success, fail, complete) {
        window.XXG.ajax({
            url: '/m/doGenFinalPriceStructure',
            data: data,
            success: function (res) {
                var add_price = -1
                var sum_price
                if (res && !res.errno) {
                    var result = res.result
                    add_price = result.add_price
                    sum_price = result.sum_price
                    typeof success === 'function' && success(add_price, sum_price)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误，请稍后重试')
                    typeof fail === 'function' && fail()
                }
                typeof complete === 'function' && complete(add_price, sum_price)
            },
            error: function (err) {
                $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                typeof fail === 'function' && fail()
                typeof complete === 'function' && complete(-1)
            }
        })
    }

    /**
     * 获取修修哥回寄的订单信息
     * @param data
     *      {
     *          order_id
     *      }
     * @param callback
     * @param fail
     */
    function apiGetOrderExpressInfo(data, callback, fail, options) {
        window.XXG.ajax({
            url: tcb.setUrl2('/m/getOrderExpressInfo'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    /**
     * 获取修修哥回传机器还原图片是否正确
     * @param data
     *      {
     *          order_id
     *          img_url
     *      }
     * @param callback
     * @param fail
     */
    function apiGetMobileRestoreSituation(data, callback, fail, options) {
        window.XXG.ajax({
            url: tcb.setUrl2('/m/getMobileRestoreSituation'),
            type: 'POST',
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res)
                } else {
                    !options.silent && $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                !options.silent && $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    /**
     *
     * @param data
     *      {
     *          order_id
     *          scene   10开始验机  20扫码验机结果
     *      }
     * @param callback
     * @param fail
     */
    function apiOrderXxgTrace(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl2('/orderXxgTrace'),
            data: data,
            beforeSend: function () {},
            complete: function () {
                typeof callback === 'function' && callback()
            }
        })
    }

    // 获取城市督导信息
    function apiGetCityManagerInfo(data, callback, fail) {
        window.XXG.ajax({
            type: 'POST',
            url: tcb.setUrl('/xxgHs/getMerchandiserInfo'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno && res.result && res.result.info && res.result.info.name) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                typeof fail === 'function' && fail()
            }
        })
    }

}()
