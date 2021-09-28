// 用户隐私协议
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivacyProtocolSign = tcb.mix(window.XXG.ServicePrivacyProtocolSign || {}, {
        apiGetPrivacyProtocol: apiGetPrivacyProtocol,
        apiAgreePrivacyProtocol: apiAgreePrivacyProtocol
    })

    /**
     * 获取隐私协议数据
     * @param callback
     *      @return
     *          {
     *              version
     *              content
     *          }
     * @param fail
     * @param options
     */
    function apiGetPrivacyProtocol(callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Privacy/getAgreementInfo'),
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
     * 同意隐私协议
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *          version	版本号	Y	integer	1.1接口中返回的 version
     *          signature	签字内容	Y	string	签字坐标内容
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiAgreePrivacyProtocol(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/Recycle/Engineer/Privacy/doAgree'),
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

}()
