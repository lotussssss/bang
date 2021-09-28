// 手机解锁提示
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }
    window.showPageLockedTips = showPageLockedTips
    window.showPageToUnlockedTips = showPageToUnlockedTips
    window.isNeedCheckUnlocked = isNeedCheckUnlocked
    window.addCheckUnlockQueue = addCheckUnlockQueue
    window.checkUnlocked = checkUnlocked
    // window.checkUnlockedSync = checkUnlockedSync

    var SwipeSection = window.Bang.SwipeSection
    var __is_need_unlock

    // ************
    // 处理函数
    // ************

    function showPageLockedTips() {
        __showPage(true)
    }

    function showPageToUnlockedTips() {
        __showPage(false)
    }

    function __showPage(is_locked) {
        var $swipe = SwipeSection.getSwipeSection('.swipe-page-locked-tips')
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderLockedTipsTpl').html())),
            html_st = html_fn({
                is_locked: is_locked
            })
        SwipeSection.fillSwipeSection(html_st)
        SwipeSection.doLeftSwipeSection()
        if (is_locked) {
            var $btn = $swipe.find('.js-trigger-locked-tips-show-service-complete')

            __startLockCountdown($btn)
        }
    }

    function __startLockCountdown($btn) {
        var startTime = Date.now(),
            endTime = startTime + 4 * 60 * 1000

        Bang.startCountdown(endTime, startTime, $btn.find('.check-lock-countdown'), {
            end: function () {
                $btn.attr('data-flag-block', '')
                    .html('已完成解锁')
            }
        })
    }

    // 判断是否需要接受，
    // 回调函数传入参数为true，表示需要查询解锁，
    // false表示不需要查询解锁
    function isNeedCheckUnlocked(callback) {
        if (typeof __is_need_unlock !== 'undefined') {
            callback(__is_need_unlock)
        } else {
            var order_id = window.__ORDER_INFO.order_id

            window.XXG.ajax({
                url: tcb.setUrl('/huishou/doCheckAppleNeedUnlock'),
                data: {'order_id': order_id},
                timeout: 5000,
                beforeSend: function () {},
                success: function (res) {
                    try {
                        if (!res.errno) {
                            __is_need_unlock = res.result && res.result.is_need_unlock
                        }
                    } catch (ex) {}

                    typeof callback == 'function' && callback(__is_need_unlock)
                },
                error: function () {
                    typeof callback == 'function' && callback(__is_need_unlock)
                }
            })
        }
    }

    // 同步检查是否已经解锁
    function checkUnlockedSync(callback, timeout) {
        __doSelectAppleUnlock(false, callback, timeout)
    }

    // 添加查询队列，用于异步检查
    function addCheckUnlockQueue(callback) {
        __doSelectAppleUnlock(true, callback)
    }

    function __doSelectAppleUnlock(is_async, callback, timeout) {
        timeout = (parseInt(timeout, 10) || 0) * 1000

        var order_id = window.__ORDER_INFO.order_id
        var imei = window.__ORDER_INFO.imei
        var sync = is_async ? 1 : 0

        var status = -1
        window.XXG.ajax({
            url: tcb.setUrl('/huishou/doSelectAppleUnlock'),
            data: {'order_id': order_id, 'imei': imei, 'sync': sync},
            timeout: timeout ? timeout : 5000,
            beforeSend: function () {},
            success: function (res) {
                var errmsg
                try {
                    if (!res.errno) {
                        status = res.result && res.result.status
                    } else {
                        errmsg = res.errmsg
                    }
                } catch (ex) {}

                typeof callback == 'function' && callback(status, errmsg)
            },
            error: function () {
                typeof callback == 'function' && callback(status)
            }
        })
    }

    // 异步检查是否已经解锁
    function checkUnlocked(unlocked_callback) {
        __checkUnlocked(function (status) {
            if (status < 0 || status == 0 || status == 30) {
                // 未执行查询 || 超时
                window.showPageToUnlockedTips && window.showPageToUnlockedTips()
            } else if (status == 10) {
                // 已解锁
                typeof unlocked_callback == 'function' && unlocked_callback()
            } else if (status == 20) {
                // 未解锁
                window.showPageLockedTips && window.showPageLockedTips()
            } else if (status == 50) {
                // 不是有效的IMEI
                window.showPageLockedTips && window.showPageLockedTips()
            }
        })
    }

    function __checkUnlocked(callback) {
        var order_id = window.__ORDER_INFO.order_id
        var status = -1
        window.XXG.ajax({
            url: tcb.setUrl('/huishou/doGetAppleUnlock'),
            data: {'order_id': order_id},
            timeout: 5000,
            beforeSend: function () {},
            success: function (res) {
                try {
                    if (!res.errno) {
                        status = res.result && res.result.status
                    }
                } catch (ex) {}

                typeof callback == 'function' && callback(status)
            },
            error: function () {
                typeof callback == 'function' && callback(status)
            }
        })
    }

    function __showCheckingInfo() {
        $('body').append('<div class="cover-locked-tips"><div class="cover-locked-tips-inner">查询中，请稍后...</div></div>')
    }

    function __hideCheckingInfo() {
        $('.cover-locked-tips').remove()
    }

    $(function () {
        tcb.bindEvent({
            '.js-trigger-locked-tips-show-service-complete': function (e) {
                e.preventDefault()

                var $me = $(this)
                if ($me.attr('data-flag-block')) {
                    return
                }
                var timeout = $me.attr('data-time-out')

                $me.attr('data-time-out', '')

                __showCheckingInfo()

                setTimeout(function () {
                    checkUnlockedSync(function (status, errmsg) {

                        __hideCheckingInfo()

                        if (status < 0) {
                            return $.dialog.toast(errmsg || '苹果服务器未返回ID已解锁，请稍等一分钟再查询。')
                        } else if (status == 10) {
                            // 已解锁
                            window.showPageCustomerSignature && window.showPageCustomerSignature()
                        } else if (status == 20) {
                            // 未解锁
                            $me.attr('data-flag-block', '1')
                               .html('账号未解锁，<div class="check-lock-countdown">04:00</div>后查询')
                            __startLockCountdown($me)
                            return $.dialog.toast('ID锁未解锁，请解锁后完成订单')
                        } else if (status == 30) {
                            // 超时
                            $me.attr('data-time-out', '40')
                            return $.dialog.toast('网络不好，请再试一次')
                        } else if (status == 40) {
                            // 超时2次
                            window.showPageCustomerSignature && window.showPageCustomerSignature()
                            // window.showPageCustomerServiceComplete && window.showPageCustomerServiceComplete()
                        } else if (status == 50){
                            return $.dialog.toast('不是有效的IMEI，请修改后再来')
                        }
                    }, timeout)
                }, 3000)

            }
        })
    })

}()
