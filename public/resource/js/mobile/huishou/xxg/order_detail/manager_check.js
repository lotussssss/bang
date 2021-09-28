// 店长审核
(function () {
    if (!window.__IS_NEEDED_MANAGER_CHECK) {
        return
    }

    window.startShopManagerCheck = startShopManagerCheck

    var _countdownStopHandle,
        checkHandleMap = {
            10: checkWaiting,
            20: checkSuccess,
            30: checkReject,
            99: checkTimeout
        }

    // 开启店长审核
    function startShopManagerCheck() {
        getShopManagerCheckProcess(function (result) {
            if (!result) {
                return createShopManagerCheck(loopCheckProcess)
            }

            loopCheckProcess(result)
        })
    }

    function createShopManagerCheck(callback) {
        var url = tcb.setUrl2('/m/createShopManagerCheck', {
            order_id: tcb.queryUrl(window.location.search, 'order_id')
        })
        window.XXG.ajax({
            url: url,
            success: function (res) {
                if (!res || res.errno) {
                    return
                }
                res.result.flag = 10
                typeof callback == 'function' && callback(res.result)
            }
        })
    }

    function getShopManagerCheckProcess(callback) {
        var url = tcb.setUrl2('/m/getShopManagerCheckProcess', {
            order_id: tcb.queryUrl(window.location.search, 'order_id')
        })
        window.XXG.ajax({
            url: url,
            success: function (res) {
                if (!res || res.errno) {
                    return
                }
                typeof callback == 'function' && callback(res.result)
            },
            error: function () {
                typeof callback == 'function' && callback(false)
            }
        })
    }

    function loopCheckProcess(result) {
        $('.block-order-manager-check').show()
        window.__IS_MANAGER_CHECK_STARTED = true

        checkHandleMap[result.flag] && checkHandleMap[result.flag](result)

        if (!(result.flag == 10 || result.flag == 99)) {
            return
        }

        function loop() {

            getShopManagerCheckProcess(function (result) {
                if (result && !(result.flag == 10 || result.flag == 99)) {

                    return checkHandleMap[result.flag] && checkHandleMap[result.flag](result)
                }
                setTimeout(loop, 3000)
            })
        }

        setTimeout(loop, 3000)
    }

    function checkWaiting(result) {
        window.__IS_MANAGER_CHECK_SUCCESS = false

        var end_time = result.timeout_at ? new Date(result.timeout_at.replace(/-/g, '/')).getTime() : (window.__NOW + 3 * 60 * 1000)
        _countdownStopHandle = window.Bang.startCountdown(end_time, window.__NOW, $('.manager-check-countdown'), {
            end: function () {
                checkTimeout()
            }
        })

        //$ ('.js-btn-go-next').addClass ('btn-go-next-lock')
    }

    function checkSuccess(result) {
        window.__IS_MANAGER_CHECK_SUCCESS = true

        typeof _countdownStopHandle == 'function' && _countdownStopHandle()

        var $Block = $('.block-order-manager-check'),
            $CheckTip = $Block.find('.check-tip'),
            $CheckTipDesc = $Block.find('.check-tip-desc')

        $CheckTip.html('审核通过')
        $CheckTipDesc.html('快给用户下单吧')
        //$ ('.js-btn-go-next').removeClass ('btn-go-next-lock')
    }

    function checkReject(result) {
        window.__IS_MANAGER_CHECK_SUCCESS = false

        typeof _countdownStopHandle == 'function' && _countdownStopHandle()

        var $Block = $('.block-order-manager-check'),
            $CheckTip = $Block.find('.check-tip'),
            $CheckTipDesc = $Block.find('.check-tip-desc')

        $CheckTip.html('审核驳回')
        $CheckTipDesc.html('请及时与' + '<a href="tel:' + window.__MANAGER_CHECK_STAFF.mobile +'"> ' + window.__MANAGER_CHECK_STAFF.name + ' ☎️ </a>沟通订单驳回原因')

        var html_fn = $.tmpl(tcb.trim($('#JsMXxgManagerCheckRejectTpl').html())),
            html_st = html_fn({
                manager: result.uid_name,
                operate_time: result.updated_at
            }),
            $html_st = $(html_st)

        $html_st.appendTo('body')

        var mask_h = $('body').height(),
            $win = tcb.getWin(),
            win_h = $win.height()
        $html_st.filter('.dialog-xxg-manager-check-reject-mask').css({
            'height': mask_h < win_h ? win_h : mask_h
        })
        tcb.setElementMiddleScreen($html_st.filter('.dialog-xxg-manager-check-reject'), 10, 20)

        //tcb.showDialog (html_st, {
        //    className : 'dialog-xxg-manager-check-reject',
        //    withClose : false,
        //    middle : true
        //})
        //$ ('.js-btn-go-next').addClass ('btn-go-next-lock')
    }

    function checkTimeout(result) {
        window.__IS_MANAGER_CHECK_SUCCESS = false

        var $Block = $('.block-order-manager-check'),
            $CheckTip = $Block.find('.check-tip'),
            $CheckTipDesc = $Block.find('.check-tip-desc')

        $CheckTip.html('审核超时')
        $CheckTipDesc.html('请等待' + '<a href="tel:' + window.__MANAGER_CHECK_STAFF.mobile +'"> ' + window.__MANAGER_CHECK_STAFF.name + ' ☎️ </a>审核，总部正在辅助处理中')
        //$ ('.js-btn-go-next').addClass ('btn-go-next-lock')
    }

    function init() {
        getShopManagerCheckProcess(function (result) {
            if (result && checkHandleMap[result.flag]) {
                loopCheckProcess(result)
            }
        })

        // 绑定事件
        tcb.bindEvent({
            // 刷新状态
            '.js-trigger-refresh-check-status2': function (e) {
                e.preventDefault()

                var $me = $(this)

                if ($me.attr('data-refreshing')) {
                    return
                }
                $me.attr('data-refreshing', 1)

                tcb.loadingStart()
                $me.css({
                    opacity: .3,
                    filter: 'grayscale(100%)'
                })

                getShopManagerCheckProcess(function (result) {
                    if (result && !(result.flag == 10 || result.flag == 99)) {

                        return checkHandleMap[result.flag] && checkHandleMap[result.flag](result)
                    }
                })

                setTimeout(function () {
                    tcb.loadingDone()
                }, 2000)
                setTimeout(function () {
                    $me.css({
                        opacity: 1,
                        filter: ''
                    })
                    $me.attr('data-refreshing', '')
                }, 10000)
            }
        })
    }

    $(init)
}())
