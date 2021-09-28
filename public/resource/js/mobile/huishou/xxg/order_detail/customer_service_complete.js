// 一些基本操作
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    $(function () {
        window.showPageCustomerServiceComplete = showPageCustomerServiceComplete

        var SwipeSection = window.Bang.SwipeSection

        tcb.bindEvent(document.body, {
            // 关闭弹层
            '.js-trigger-close-service-complete-swipe': function (e) {
                e.preventDefault()
                __closeAndReload()
            },
            // in河南移动app--关闭弹层
            '.js-trigger-hnyd-close-service-complete-swipe': function (e) {
                e.preventDefault()
                tcb.js2AppHNYDOpenPage('IntelligentTerminal')
            }
        })

        // ************
        // 处理函数
        // ************


        function showPageCustomerServiceComplete() {
            SwipeSection.getSwipeSection('.swipe-page-customer-service-complete')

            var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderCustomerServiceCompleteTpl').html())),
                html_st = html_fn({
                    show_cash_flag: window.__SHOW_CASH_FLAG,
                    zj_mobile_call_url: window.__ZJ_MOBILE_CALL_URL
                })
            SwipeSection.fillSwipeSection(html_st)
            if (window.__APPLE_CES_ORDER_FLAG) {
                var order_id = tcb.queryUrl(window.location.search, 'order_id')
                window.getAppleCesOrderInfo && window.getAppleCesOrderInfo(order_id, function (appleCesOrderInfo) {
                    var bonus = parseInt(appleCesOrderInfo.subsidy_price, 10) || 0
                    var realPrice = parseInt(appleCesOrderInfo.new_product_price * 100 - appleCesOrderInfo.hs_model_price * 100 - bonus * 100, 10) / 100
                    var instalmentName = appleCesOrderInfo.loan_name || 'JD白条分期付款'
                    var instalmentRate = appleCesOrderInfo.loan_rate || 0
                    var instalmentPeriod = parseInt(appleCesOrderInfo.loan_rate_number, 10) || 0
                    var instalmentPaymentPerPeriod = (instalmentPeriod
                        ? parseInt(realPrice / instalmentPeriod * 100 + realPrice * instalmentRate * 100, 10) / 100
                        : realPrice).toFixed(2)
                    var html_st = '<div style="margin: .2rem .2rem 0;text-align: left;">'
                    html_st += '<div class="row"><div class="col-12-4">新机编码</div><div class="col-12-8">' + appleCesOrderInfo.new_product_id + '</div></div>'
                    html_st += '<div class="row"><div class="col-12-4">新机型号</div><div class="col-12-8">' + appleCesOrderInfo.new_product_name + '</div></div>'
                    html_st += '<div class="row"><div class="col-12-4">新机价格</div><div class="col-12-8">¥ ' + appleCesOrderInfo.new_product_price + '</div></div>'
                    if (appleCesOrderInfo.coupon_code) {
                        html_st += '<div class="row"><div class="col-12-4">促销码</div><div class="col-12-8">' + appleCesOrderInfo.coupon_code + '</div></div>'
                    }
                    html_st += '<div class="row"><div class="col-12-4">回收机型</div><div class="col-12-8">' + appleCesOrderInfo.hs_model_name + '</div></div>'
                    html_st += '<div class="row"><div class="col-12-4">回收价格</div><div class="col-12-8">¥ ' + appleCesOrderInfo.hs_model_price + '</div></div>'
                    if (bonus) {
                        html_st += '<div class="row"><div class="col-12-4">换新补贴</div><div class="col-12-8">￥ ' + bonus + '</div></div>'
                    }
                    html_st += '<div class="row"><div class="col-12-4">换购价格</div><div class="col-12-8 c5">' + (realPrice > 0 ? '¥ ' + realPrice : '- ¥ ' + Math.abs(realPrice)) + '</div></div>'
                    if (instalmentPeriod && realPrice > 0) {
                        html_st += '<div class="row"><div class="col-12-4">' + instalmentName + '</div><div class="col-12-8">￥ ' + instalmentPaymentPerPeriod + ' x ' + instalmentPeriod + '期</div></div>'
                    }
                    html_st += '<div class="row row-order-id-barcode" style="margin-top: .2rem;text-align: center"><svg id="XxgOrderDetailOrderIdBarcode2"></svg></div>'
                    html_st += '</div>'
                    var $blockServiceComplete = $('.swipe-page-customer-service-complete .block-service-complete')
                    $blockServiceComplete.find('.icon-circle-tick').css('margin', '.2rem 0 0')
                    $blockServiceComplete.append(html_st)
                    JsBarcode('#XxgOrderDetailOrderIdBarcode2', order_id, {
                        height: 80
                    })
                })
            }
            SwipeSection.doLeftSwipeSection(0, function () {
                var queue = SwipeSection.getQueue(),
                    queue_length = queue.length
                while (queue_length > 0) {
                    queue_length--
                    tcb.js2AndroidPopDialogStateCloseFn()
                }
                SwipeSection.closeAllExceptLast()
                // 先干掉最后一个弹层的关闭标识，然后再加一个新的标识和新的关闭方法
                tcb.js2AndroidSetDialogState(false)
                tcb.js2AndroidSetDialogState(true, __closeAndReload)
            })
        }

        function __closeAndReload() {
            SwipeSection.backLeftSwipeSection()

            tcb.loadingStart()

            setTimeout(function () {
                window.location.reload()
            }, 400)
        }

    })
}()
