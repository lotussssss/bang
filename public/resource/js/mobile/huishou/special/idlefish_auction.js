!function () {
    $(function () {
        var currentTime = window.__CURRENT_TIME || Date.now(),
            startTime = Date.parse(window.__START_TIME.replace(/-/g, '/')),
            endTime = Date.parse(window.__END_TIME.replace(/-/g, '/')),
            flag = window.__FLAG

        tcb.bindEvent(document.body, {
            // 展示评估项
            '.js-trigger-show-quality-item-list': function (e) {
                e.preventDefault()

                var $me = $(this),
                    $iconFont = $me.find('.iconfont'),
                    $list = $me.find('.quality-item-list')

                $list.slideToggle(200)
                setTimeout(function () {
                    $list.height()
                        ? $iconFont.removeClass('icon-xia').addClass('icon-shang')
                        : $iconFont.removeClass('icon-shang').addClass('icon-xia')

                }, 250)
            },
            // 展示竞拍说明
            '.js-trigger-show-auction-desc': function (e) {
                e.preventDefault()

                var html_str = $.tmpl($.trim($('#JsIdlefishAuctionDescTpl').html()))()
                var config = {
                    middle: true,
                    className: 'panel-idlefish-auction-desc'
                }
                tcb.showDialog(html_str, config)
            }
        })

        startCountdown()

        // 倒计时
        function startCountdown() {
            var $target = $('.js-auction-countdown')

            if (flag == 90) {
                if (currentTime < startTime) {
                    $target.attr('data-descbefore', '离竞拍开始还有：')
                    Bang.startCountdown(startTime, currentTime, $target, {
                        'end': function () {
                            window.location.reload()
                        }
                    })
                } else if (currentTime >= startTime && currentTime < endTime) {
                    $target.attr('data-descbefore', '离竞拍结束仅剩：')
                    showPriceList()

                    Bang.startCountdown(endTime, currentTime, $target, {
                        'end': function () {
                            window.location.reload()
                        }
                    })
                }
            } else if (flag == 100) {
                $target.html('本次竞拍已结束')
                showPriceList()
            } else {
                $target.html('本次竞拍尚未开始')
            }
        }

        function showPriceList() {
            var $list = $('.auction-price-list'),
                $num = $('.auction-info .num')

            $.post('/IdleFish/getConsignmentAuction', {
                'biz_order_id': window.__BIZ_ORDER_ID
            }, function (res) {
                if (res && !res.errno) {
                    if (res.result || flag == 90) {
                        var offer = res.result.offer,
                                list = offer.detail,
                                total = offer.total,
                                max = offer.max
                        var tmpl_fn = $.tmpl($.trim($('#JsIdlefishAuctionPriceListTpl').html())),
                                tmpl_str = tmpl_fn({
                                    'list': list
                                })

                        $list.html(tmpl_str)

                        if (currentTime >= startTime && currentTime < endTime) {
                            // $num.first().html(max)
                            $num.last().html(total)
                            setTimeout(showPriceList, 30000)
                        }
                    } else {
                        $('.block-auction-price').hide()
                    }
                } else {
                    setTimeout(showPriceList, 30000)
                }
            })
        }
    })
}()
