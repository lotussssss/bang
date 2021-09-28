$(function () {
    var __reload = false

    tcb.bindEvent(document.body, {
        // 领取神券
        '.js-trigger-get-shenquan': function (e) {
            e.preventDefault()

            var $me = $(this),
                shenquan_code = $me.attr('data-shenquan-code')

            if ($me.hasClass('shenquan-item-disabled')) {
                return
            }

            $.get('/youpin/doGet618Coupon?activity_id=6&id=' + shenquan_code, function (res) {
                if (!res['errno']) {
                    // 提示领券成功
                    alert('恭喜您，领取成功！')

                    $me.addClass('shenquan-item-disabled').find('.shenquan-btn').html('已领取')

                    if (__reload) {
                        setTimeout(function () {
                            window.location.reload()
                        }, 300)
                    }
                } else if (res['errno'] == 108) {
                    // 未登录
                    showCommonLoginPanel(function () {
                        setTimeout(function () {
                            __reload = true

                            tcb.closeDialog()
                            $me.trigger('click')
                        }, 10)
                    })
                } else {
                    alert(res['errmsg'])

                    setTimeout(function () {
                        window.location.reload()
                    }, 300)
                }
            })
        }
    })

    // 登录
    function showCommonLoginPanel(success_cb) {
        tcb.showCommonLoginPanel({
            // action_url : '/youpin/aj_my_login',
            withClose: true,
            success_cb: success_cb
        })
    }

    // 输出商品列表
    window.Bang.renderProductList({
        $tpl: $('#Js618ProductListTpl'),
        $target: $('.block-new-product .ui-sp-product-list-1'),
        request_url: '/youpin/aj_get_goods',
        request_params: {
            pn: 0,
            page_size: 12
        },
        // list_key: 'bao',
        list_params: window.__PARAMS,
        col: 4,
        complete: function (result, $target) {}
    })

    // 输出中奖用户的数据
    function renderLotteryUserList() {
        var $list_inner = $('.lottery-user-list-inner'),
            list_arr = window.__LOTTERY_USER_LIST,
            col = 3,
            html_str = ''

        if ($list_inner && $list_inner.length) {
            for (var i = 0; i < list_arr.length; i++) {
                if (i === 0) {
                    html_str += '<div class="lottery-item col-1-1">'

                }
                html_str += '<div class="item-sub">' + list_arr[i] + '</div>'
                if (i !== 0 && (i + 1) % col === 0 && i !== (list_arr.length - 1)) {
                    html_str += '</div><div class="lottery-item col">'

                }
                if (i === (list_arr.length - 1)) {
                    html_str += '</div>'
                }
                // html_str += '<div class="lottery-item col-3-1"><span>●</span>'+list_arr[i]+'</div>'
            }
            $list_inner.html(html_str)

            var $list_lottery_item = $list_inner.find('.lottery-item'),
                list_inner_row_height = $list_lottery_item.first().height()

            // 大于一行中奖信息才滚滚滚
            if ($list_lottery_item.length > 0) {
                (function () {
                    var arg = arguments
                    $list_inner.animate({'top': -list_inner_row_height}, 800, function () {
                        $list_inner.find('.lottery-item').first().appendTo($list_inner)
                        $list_inner.css({'top': 0})

                        setTimeout(arg.callee, 5000)
                    })
                }())
            }

        }
    }

    renderLotteryUserList()
})
