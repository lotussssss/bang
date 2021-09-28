!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        scanQRCode: actionScan,
        scanGetReAssessDataByQRCode: __getReAssessDataByQRCode
    })

    function actionScan(callback, fail) {
        if (tcb.js2AppInvokeQrScanner(true, function (result) {
            typeof callback === 'function' && callback(result)
        })) {
            return true
        }
        typeof fail === 'function' && fail()
        return false
    }

    // 根据二维码信息，获取重新评估的参数数据
    function __getReAssessDataByQRCode(order_id, result) {
        result = result.join('|')
        result = (result || '').split('|') || []

        var data
        if (result[0] === 'ARM') {
            result.shift()
            try {
                data = $.parseJSON(result.join(''))
            } catch (e) {}
        } else if (result[0] === 'ARC') {
            result.shift()
            data = {
                encryptedStr: result.join('')
            }
        } else {
            data = {
                assess_key: result[0] || '',
                scene: result[1] || ''
            }
            if (result[1] === 'miniapp') {
                data['imei'] = result[2] || '' //imei
            }
            if (result[4]) {
                data['imei'] = result[2] //imei
                data['encrypt_xxg_qid'] = result[4] //Pad登录的xxg
            }
        }
        if (data) {
            data['order_id'] = order_id
        }
        return data
    }

}()

