// 隐私数据处理
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServicePrivateData = tcb.mix(window.XXG.ServicePrivateData || {}, {
        apiSavePrivateDataNeedMigrate: apiSavePrivateDataNeedMigrate,
        apiGetPrivateDataUserPayStatus: apiGetPrivateDataUserPayStatus,
        apiGetPrivateDataAlipayWithholdingInfo: apiGetPrivateDataAlipayWithholdingInfo,
        apiSavePrivateDataMigrated: apiSavePrivateDataMigrated,
        apiSavePrivateDataCloseOneStopOrder: apiSavePrivateDataCloseOneStopOrder,
        apiSavePrivateDataVisitAgain: apiSavePrivateDataVisitAgain,
        apiGetSfFixSuningOneStopFullPaymentUrl: apiGetSfFixSuningOneStopFullPaymentUrl,
    })

    /**
     * 保存是否需要迁移隐私数据
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *          migrationFlag	转移标志	Y	string	枚举值：1-需要迁移 2-无需迁移
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiSavePrivateDataNeedMigrate(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Migration/doUserNeedMigration'),
            data: data,
            type: 'POST',
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
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 获取隐私数据迁移用户支付信息
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     *      @return
     *          {
     *              pay_flag	支付成功标志	N	int	1-支付成功
     *              pay_type	支付方式	N	int	枚举值：1-支付宝代扣 2-全款购新
     *          }
     * @param fail
     * @param options
     */
    function apiGetPrivateDataUserPayStatus(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Migration/getUserPayStatus'),
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
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 获取隐私数据支付宝代扣信息
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     *      @return
     *          {
     *              alipay_url	支付宝返回的url	Y	string	-
     *          }
     * @param fail
     * @param options
     */
    function apiGetPrivateDataAlipayWithholdingInfo(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Migration/getWithholdServiceUrl'),
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
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 保存已经迁移隐私数据
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiSavePrivateDataMigrated(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Migration/doStartMigration'),
            data: data,
            type: 'POST',
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
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 二次上门之前关闭一站式订单
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiSavePrivateDataCloseOneStopOrder(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/xxgHs/doCloseOneStopOrder'),
            data: data,
            type: 'POST',
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
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 保存已经二次上门
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiSavePrivateDataVisitAgain(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Migration/doSecondService'),
            data: data,
            type: 'POST',
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
                typeof fail === 'function' && fail(err)
            }
        })
    }

    /**
     * 获取一站式换新机，全款购新的url
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiGetSfFixSuningOneStopFullPaymentUrl(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/xxgHs/getOneStopFullAmountPayUrl'),
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
                typeof fail === 'function' && fail(err)
            }
        })
    }

}()
