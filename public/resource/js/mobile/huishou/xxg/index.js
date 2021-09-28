// 修修哥首页
$(function () {
    if (window.__PAGE !== 'xxg-index' && window.__PAGE !== 'xxg-index-sf-fix') {
        return
    }

    function apiValidOrderOverdueDelivery(callback) {
        window.XXG.ajax({
            url: '/xxgHs/getWaitFahuoTimeoutList',
            success: function (res) {
                if (!(res && !res.errno)) {
                    return $.dialog.toast((res && res.errmsg) || '系统错误，请稍后重试')
                }
                if (res && res.result && res.result.cnt > 0) {
                    typeof callback == 'function' && callback()
                }
            },
            error: function (err) {
                $.dialog.toast(err.statusText || '系统错误，请稍后重试')
            }
        })
    }

    function validOrderOverdueDelivery() {
        var qid = window.__XXG_QID || ''
        if (!qid) {
            return
        }
        var hasShow = $.fn.cookie('HS_XXG_ORDER_OVERDUE_DELIVERY_' + qid)
        if (!hasShow) {
            apiValidOrderOverdueDelivery(function () {
                var dateObj = new Date()
                var todayStart = [
                    dateObj.getFullYear(),
                    dateObj.getMonth() + 1,
                    dateObj.getDate()
                ].join('/') + ' 00:00:00'
                var todayStartObj = new Date(todayStart)
                var tomorrowObj = new Date(todayStartObj.getTime() + 24 * 60 * 60 * 1000)

                $.fn.cookie('HS_XXG_ORDER_OVERDUE_DELIVERY_' + qid, 1, {
                    path: '/m/hsXxgOption',
                    expires: tomorrowObj
                })

                var html_fn = $.tmpl($.trim($('#JsXxgIndexDialogOrderOverdueDeliveryTpl').html())),
                    html_st = html_fn()
                var dialogInst = tcb.showDialog(html_st, {
                    className: 'dialog-order-overdue-delivery',
                    withClose: false,
                    middle: true
                })
                dialogInst.wrap.find('.js-trigger-goto-delivery-overdue-order').on('click', function (e) {
                    e.preventDefault()
                    tcb.closeDialog(dialogInst)
                    window.XXG.redirect(tcb.setUrl2('/m/hs_xxg_order_list?search_status=90'))
                })
                dialogInst.wrap.find('.js-trigger-hold-overdue-order').on('click', function (e) {
                    e.preventDefault()
                    tcb.closeDialog(dialogInst)
                })
            })
        }
    }

    function bindEvent() {
        tcb.bindEvent({
            '.js-trigger-show-remote-check-notice': function (e) {
                e.preventDefault()
                var html_fn = $.tmpl($.trim($('#JsXxgIndexDialogRemoteCheckNoticeTpl').html())),
                    html_st = html_fn()
                var dialogInst = tcb.showDialog(html_st, {
                    className: 'dialog-remote-check-notice',
                    withClose: false,
                    middle: true
                })
                dialogInst.wrap.find('.btn-confirm').on('click', function (e) {
                    e.preventDefault()
                    tcb.closeDialog(dialogInst)
                })
            },
            '.js-trigger-go-to-gold-assess': function (e) {
                e.preventDefault()
                window.__IS_NEEDED_REFRESH = true
                var $me = $(this)
                window.location.href = $me.attr('href')
            }
        })
    }

    function renderRewardSummary() {
        $.get('/xxgHs/doGetSfFixBonusAggregation', function (res) {
            if (!res.errno && res.result) {
                var tmpl_fn = $.tmpl($.trim($('#JsXxgSfFixIndexRewardSummaryTpl').html())),
                    tmpl_str = tmpl_fn({
                        data: res.result
                    })
                $('.block-top').html(tmpl_str)
            }
        })
    }

    // 弹幕
    function initDanmu() {
        var list1 = [
                '北京 郑XX 获30元回收成功奖励',
                '北京 王X 获120元回收成功奖励',
                '江苏 杨XX 获88元回收成功奖励',
                '上海 任X 获10元回收成功奖励',
                '浙江 李XX 获87元回收成功奖励',
                '上海 曹X 获32元回收成功奖励',
                '四川 胡XX 获69元回收成功奖励',
                '北京 刘X 获56元回收成功奖励',
                '上海 孙XX 获58元回收成功奖励',
                '上海 孟X 获120元回收成功奖励',
                '上海 毕X 获58元回收成功奖励',
                '上海 王XX 获80元回收成功奖励',
                '上海 黎XX 获47元回收成功奖励',
                '四川 江X 获85元回收成功奖励',
                '上海 何X 获40元回收成功奖励',
                '北京 武XX 获42元回收成功奖励',
                '广东 宋XX 获100元回收成功奖励',
                '广东 张XX 获119元回收成功奖励',
                '上海 王X 获37元回收成功奖励',
                '北京 李XX 获57元回收成功奖励',
                '北京 王X 获25元回收成功奖励',
                '浙江 刘X 获55元回收成功奖励',
                '上海 孙XX 获118元回收成功奖励',
                '北京 王X 获41元回收成功奖励',
                '北京 张XX 获81元回收成功奖励'
            ],
            list2 = [
                '江苏 王X 获183元回收成功奖励',
                '重庆 胡XX 获102元回收成功奖励',
                '江苏 毕X 获36元回收成功奖励',
                '湖北 宋XX 获24元回收成功奖励',
                '四川 孙XX 获117元回收成功奖励',
                '湖北 张XX 获31元回收成功奖励',
                '上海 政XX 获27元回收成功奖励',
                '上海 高XX 获113元回收成功奖励',
                '江苏 李XX 获197元回收成功奖励',
                '重庆 刘X 获120元回收成功奖励',
                '江苏 孙XX 获22元回收成功奖励',
                '江苏 王X 获71元回收成功奖励',
                '江苏 杨XX 获162元回收成功奖励',
                '北京 任X 获57元回收成功奖励',
                '广东 李XX 获28元回收成功奖励',
                '广东 何X 获17元回收推广奖励',
                '上海 陈XX 获28元回收成功奖励',
                '北京 李XX 获49元回收成功奖励',
                '江苏 王X 获41元回收成功奖励',
                '江苏 杨X 获132元回收成功奖励',
                '北京 黑XX 获99元回收成功奖励',
                '上海 姜X 获105元回收成功奖励',
                '北京 李XX 获10元回收成功奖励',
                '北京 孙XX 获59元回收成功奖励',
                '北京 张XX 获26元回收成功奖励'
            ],
            list3 = [
                '上海 政XX 获117元回收成功奖励',
                '北京 高XX 获162元回收成功奖励',
                '北京 李XX 获57元回收成功奖励',
                '江苏 刘X 获55元回收成功奖励',
                '北京 武XX 获89元回收成功奖励',
                '重庆 宋XX 获103元回收成功奖励',
                '北京 张XX 获60元回收成功奖励',
                '浙江 王X 获85元回收成功奖励',
                '江苏 李XX 获155元回收成功奖励',
                '浙江 王X 获93元回收成功奖励',
                '江苏 刘X 获59元回收成功奖励',
                '江苏 孙XX 获64元回收成功奖励',
                '北京 李XX 获94元回收成功奖励',
                '广东 刘X 获21元回收成功奖励',
                '北京 胡XX 获28元回收成功奖励',
                '江苏 刘X 获48元回收成功奖励',
                '上海 孙XX 获117元回收成功奖励',
                '北京 孟X 获82元回收成功奖励',
                '浙江 毕X 获28元回收成功奖励',
                '重庆 王XX 获49元回收成功奖励',
                '广东 刘X 获102元回收成功奖励',
                '江苏 江X 获37元回收成功奖励',
                '江苏 刘X 获66元回收成功奖励',
                '上海 李XX 获78元回收成功奖励',
                '江苏 李XX 获168元回收成功奖励'
            ]
        var html_str1 = '',
            html_str2 = '',
            html_str3 = ''
        var $itemWrap = $('.block-danmu').find('.item-wrap'),
            $itemWrap1 = $itemWrap.eq(0),
            $itemWrap2 = $itemWrap.eq(1),
            $itemWrap3 = $itemWrap.eq(2)

        tcb.each(list1, function (i, item) {
            html_str1 += '<div class="item">' + item + '</div>'
        })
        tcb.each(list2, function (i, item) {
            html_str2 += '<div class="item">' + item + '</div>'
        })
        tcb.each(list3, function (i, item) {
            html_str3 += '<div class="item">' + item + '</div>'
        })

        $itemWrap1.html(html_str1)
        $itemWrap2.html(html_str2)
        $itemWrap3.html(html_str3)

        var $items1 = $itemWrap1.find('.item'),
            $items2 = $itemWrap2.find('.item'),
            $items3 = $itemWrap3.find('.item')

        var stopDanmu1 = tcb.noop,
            stopDanmu2 = tcb.noop,
            stopDanmu3 = tcb.noop
        var t1, t2, t3
        var initFlag = true

        $(window).on('load visibilitychange', function (e) {
            if (initFlag || document.visibilityState === 'visible') {
                // 开始弹幕
                t1 = setTimeout(function () {
                    stopDanmu1 = startDanmu($items1)
                }, 1500)
                t2 = setTimeout(function () {
                    stopDanmu2 = startDanmu($items2)
                }, 0)
                t3 = setTimeout(function () {
                    stopDanmu3 = startDanmu($items3)
                }, 4000)
            } else {
                // 停止弹幕
                clearTimeout(t1)
                clearTimeout(t2)
                clearTimeout(t3)
                stopDanmu1()
                stopDanmu2()
                stopDanmu3()
            }
            initFlag = false
        })
    }

    function startDanmu($items) {
        var max = $items.length
        var pos = 0

        function _animationend() {
            var $me = $(this)
            $me.removeClass('item-slidein')
        }

        $items.on('animationend', _animationend)

        var t = null

        function loop() {
            if (pos >= max) {
                pos = 0
            }
            $items.eq(pos).addClass('item-slidein')
            pos++
            t = setTimeout(loop, 3000)
        }

        loop()
        return function () {
            clearTimeout(t)
            $items.removeClass('item-slidein')
            $items.off('animationend', _animationend)
        }
    }

    function init() {
        var isNeedQrScanner = false
        if (window.__PAGE === 'xxg-index') {
            isNeedQrScanner = true
            // 通知App，js加载完成
            tcb.js2AppNoticeLoadDown()/*非丰修修修哥首页才执行此函数*/

            bindEvent()
            validOrderOverdueDelivery()
        }
        tcb.js2AppNeedQrScanner(isNeedQrScanner)

        // 丰修修修哥首页
        if (window.__XXG_INDEX_SF_FIX) {
            renderRewardSummary()
            // initDanmu()
        }
    }

    init()
})
