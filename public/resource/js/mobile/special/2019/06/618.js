;
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "618砸免单、抢神卷",
        "desc": "618年中狂欢,砸免单、抢神券，疯赔到底！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p1.ssl.qhimg.com/t0144b1ed6a12a065ab.png',
        "success": tcb.noop, // 用户确认分享的回调
        "cancel": tcb.noop // 用户取消分享
    }

    if (typeof wx !== 'undefined') {
        wx.ready(function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage(wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline(wxData)
            //分享到QQ
            wx.onMenuShareQQ(wxData)
            //分享到QZone
            wx.onMenuShareQZone(wxData)
        })
    }

    $(function () {
        var __reload = false
        var $goldenEggsWrap = $('.lottery-golden-eggs')

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
            },
            // 点击金蛋
            '.lottery-golden-eggs .item-egg': function (e) {
                e.preventDefault()

                var $me = $(this)
                $.get('/youpin/doZaJinDan', function (res) {
                    if (!res['errno']) {
                        // 中奖

                        // 蛋停止摇晃
                        $goldenEggsWrap.find('.egg-pic').removeClass('egg-shake')
                        // 锤子显示一会后隐藏
                        $me.find('.hammer').show()
                        setTimeout(function () {
                            $me.find('.hammer').hide()
                            // 被点击的蛋碎掉
                            // $me.find('.egg-pic').attr('src', 'https://p1.ssl.qhmsg.com/t01b463d104cccdeb91.png')
                        }, 2500)

                        // 显示中奖面板
                        setTimeout(function () {
                            showGoldenEggsBingoPanel()
                        }, 3300)
                    } else if (res['errno'] == 108) {
                        // 未登录
                        showCommonLoginPanel(function () {
                            setTimeout(function () {

                                tcb.closeDialog()
                                $me.trigger('click')
                            }, 10)
                        })
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                })
            },
            //查看我的奖品
            '.js-trigger-show-my-prize':function (e) {
                e.preventDefault()

                var $me = $(this)

                $.get('/youpin/zaJinDanGiftList',function (res) {
                    if (!res['errno']) {
                        showGoldenEggsMyPrizePanel(res)
                    }else if(res['errno'] == 108){
                        // 未登录
                        showCommonLoginPanel(function () {
                            setTimeout(function () {

                                tcb.closeDialog()
                                $me.trigger('click')
                            }, 10)
                        })
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                })
            },
            // 关闭弹窗
            '.js-trigger-close':function (e) {
                e.preventDefault()

                tcb.closeDialog()
            }
        })

        // 登录
        function showCommonLoginPanel(success_cb) {
            tcb.showCommonLoginPanel({
                // action_url : '/youpin/aj_my_login',
                withClose : true,
                success_cb:success_cb
            })
        }

        // 输出商品列表
        window.Bang.renderProductList({
            $tpl : $('#JsM618ProductListTpl'),
            $target : $('.block-new-product .ui-sp-product-list-1'),
            request_url : '/youpin/aj_get_goods',
            request_params : {
                pn : 0,
                page_size: 12
            },
            // list_key: 'bao',
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })

        // 显示砸金蛋中奖面板
        function showGoldenEggsBingoPanel() {
            var html_str = $.tmpl($.trim($('#JsM618GoldenEggsBingoPanel').html()))({})
            var config = {
                middle    : true,
                className: 'panel-618-golden-eggs'
            }
            tcb.showDialog(html_str, config)
        }

        // 显示查看我的奖品面板
        function showGoldenEggsMyPrizePanel(num) {
            var html_str = $.tmpl($.trim($('#JsM618GoldenEggsMyPrizePanel').html()))({
                num:num
            })
            var config = {
                middle    : true,
                className: 'panel-618-golden-eggs'
            }
            tcb.showDialog(html_str, config)
        }

        // 输出中奖用户的数据
        function renderLotteryUserList() {
            var $list_inner = $('.lottery-user-list-inner'),
                list_arr = window.__LOTTERY_USER_LIST,
                html_str = ''

            if ($list_inner && $list_inner.length) {
                for(var i=0;i<list_arr.length;i++){
                    html_str += '<div class="lottery-item">'+list_arr[i]+'</div>'
                }
                $list_inner.html(html_str)

                var $list_lottery_item = $list_inner.find('.lottery-item'),
                    list_inner_row_height = $list_lottery_item.first().height()

                // 大于5条中奖信息才滚滚滚
                if ($list_lottery_item.length > 5) {
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
} ()
