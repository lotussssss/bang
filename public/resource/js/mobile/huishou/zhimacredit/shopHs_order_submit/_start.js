!function (global) {
    // 非下单页,直接返回不做任何处理
    if (window.__PAGE !== 'zhimacredit-shopHs-order-submit') {

        return
    }

    var Root = tcb.getRoot (),
        o = Root.Order
    var SwipeSection = window.Bang.SwipeSection

    // 初始化评估页面
    // DOM READY at callback
    o.init ({
        // 前置处理
        before : function () {
            o.data.url_query = tcb.queryUrl (window.location.search)
        },
        // DOM READY之后
        after  : function () {
            var $Target = $('.page-zhimacredit-shopHs-order-submit')

            __bindEvent($Target)
        }
    })


    function __bindEvent($Target){

        o.event.youJiOrderSubmit($Target)

        tcb.bindEvent({
            // （支付宝内）跳转到普通邮寄回收下单页面
            '.btn-zhimacredit-cover-go': function (e) {
                e.preventDefault()

                // 6.20注释掉,说明:不需要该字段,替换为 shop_hs_xxg_id 字段,暂时保留该字段注释,不需要在删掉
                // window.location.href = tcb.setUrl2(window.location.href, {}, 'shop_hs_new_price')
                window.location.href = tcb.setUrl2(window.location.href, {}, 'shop_hs_xxg_id')
            },
            // 提交下单表单
            '.btn-order-submit': function(e){
                e.preventDefault()

                var $Form = $Target.find('#YouJiSaleForm')

                if ($Form && $Form.length) {

                    if (!$Form.find('[name="agree_protocol"]').prop('checked')){

                        return $.errorAnimate($('.row-protocol'))
                    }

                    window.__FLAG_SUBMIT_REDIRECT_URL_OFFLINE = false
                    if ($Form.find ('[name="sale_type"]').val () == 'offline') {
                        window.__FLAG_SUBMIT_REDIRECT_URL_OFFLINE = true
                    }

                    // 触发表单提交
                    $Form.trigger('submit')
                }
            },
            '.js-trigger-agree-zhimacredit-shophs-protocol': function(e){
                e.preventDefault()

                var $me = $(this),
                    $iconfont = $me.find('.iconfont')
                if ($iconfont.hasClass('icon-circle-tick2')){
                    $iconfont.removeClass('icon-circle-tick2').addClass('icon-circle-tick')
                    $('#YouJiSaleForm [name="agree_protocol"]').prop('checked', 'checked')
                } else {
                    $iconfont.addClass('icon-circle-tick2').removeClass('icon-circle-tick')
                    $('#YouJiSaleForm [name="agree_protocol"]').prop('checked', '')
                }

            },
            // 查看回收协议
            '.btn-show-zhimacredit-shophs-protocol': function(e){
                e.preventDefault()

                var $me = $(this),
                    tmpl_st = $.trim($('#JsMZhimaCreditShopHSCreditProtocolTpl').html())

                var html_fn = $.tmpl(tmpl_st ),
                    html_st = html_fn()

                SwipeSection.getSwipeSection('.swipe-section-block-long-text-help')
                SwipeSection.fillSwipeSection(html_st)
                setTimeout(function(){

                    SwipeSection.doLeftSwipeSection(0, function(){})

                }, 1)
            }
        })
    }

} (this)



