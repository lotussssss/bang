;
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "双12全场抄底，抽新款iPhone",
        "desc": "双12抄底狂欢，3期免息，抽新款iPhone，一次购尽兴！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p5.ssl.qhimg.com/t01e1f2e53c4e18f64b.png',
        "success": tcb.noop, // 用户确认分享的回调
        "cancel": tcb.noop // 用户取消分享
    }

    if (typeof wx !== 'undefined') {
        wx.ready(function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage && wx.onMenuShareAppMessage(wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline && wx.onMenuShareTimeline(wxData)
            //分享到QQ
            wx.onMenuShareQQ && wx.onMenuShareQQ(wxData)
            //分享到QZone
            wx.onMenuShareQZone && wx.onMenuShareQZone(wxData)

            wx.updateAppMessageShareData && wx.updateAppMessageShareData(wxData)
            wx.updateTimelineShareData && wx.updateTimelineShareData(wxData)
        })
    }

    $(function () {
        var __reload = false
        var $goldenEggsWrap = $('.lottery-golden-eggs')

        tcb.bindEvent(document.body, {
            // 领取红包
            '.js-trigger-get-hongbao ':function (e) {
                e.preventDefault()

                var $me = $(this),
                    category_id = $me.attr('data-id')

                if($me.hasClass('hongbao-item-received')){
                    return
                }

                $.get('/ypDouble12/doReceivePacket?category_id='+category_id, function (res) {
                    if (!res['errno']) {
                        // 提示领取成功
                        $.dialog.toast('恭喜您，领取成功！', 2000)

                        $me.addClass('hongbao-item-received')

                        if (__reload){
                            setTimeout(function () {
                                window.location.reload()
                            }, 2000)
                        }
                    }else if (res['errno'] == 108) {
                        // 未登录
                        showCommonLoginPanel(function () {
                            setTimeout(function () {
                                __reload = true

                                tcb.closeDialog()
                                $me.trigger('click')
                            }, 10)
                        })
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)

                        setTimeout(function () {
                            window.location.reload()
                        }, 2000)
                    }
                })
            },
            // 领取优惠券
            '.js-trigger-get-coupon ':function (e) {
                e.preventDefault()

                var $me = $(this),
                    category_id = $me.attr('data-id')

                if($me.hasClass('coupon-item-received')){
                    return
                }

                $.get('/ypDouble12/doReceiveYouhui?category_id='+category_id, function (res) {
                    if (!res['errno']) {
                        // 提示领取成功
                        $.dialog.toast('恭喜您，领取成功！', 2000)

                        $me.addClass('coupon-item-received')
                        $me.find('.coupon-btn').html('已领取')

                        if (__reload){
                            setTimeout(function () {
                                window.location.reload()
                            }, 2000)
                        }
                    }else if (res['errno'] == 108) {
                        // 未登录
                        showCommonLoginPanel(function () {
                            setTimeout(function () {
                                __reload = true

                                tcb.closeDialog()
                                $me.trigger('click')
                            }, 10)
                        })
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)

                        setTimeout(function () {
                            window.location.reload()
                        }, 2000)
                    }
                })
            },
            // 点击金蛋
            '.lottery-golden-eggs .item-egg': function (e) {
                e.preventDefault()

                var $me = $(this)
                $.get('/ypDouble12/doSmashEgg', function (res) {
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

                $.get('/ypDouble12/doGetSmashEggHistory',function (res) {
                    if (!res['errno']) {
                        showGoldenEggsMyPrizePanel(res.result)
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
            $tpl : $('#JsM2019Shuang12ProductListTpl'),
            $target : $('.block-flash-product .ui-sp-product-list-1'),
            request_url : '/youpin/doGetFlashSaleGoods',
            request_params : {
                pn : 0,
                page_size : 4
            },
            list_key: 'flash_list',
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })
        // 输出商品列表
        window.Bang.renderProductList({
            $tpl : $('#JsM2019Shuang12ProductListTpl'),
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
        // 输出商品列表
        window.Bang.renderProductList({
            $tpl : $('#JsM2019Shuang12HotProductListTpl'),
            $target : $('.block-baokuan .ui-sp-product-list-1'),
            request_url : '/ypDouble12/doGetHot',
            request_params : {
                pn : 0,
                page_size: 4
            },
            // list_key: 'bao',
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })
        // 输出商品列表
        window.Bang.renderProductList({
            $tpl : $('#JsM2019Shuang12HotProductListTpl'),
            $target : $('.block-erji .ui-sp-product-list-1'),
            request_url : '/ypDouble12/doGetHeadset',
            request_params : {
                pn : 0,
                page_size: 4
            },
            // list_key: 'bao',
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })

        // 显示砸金蛋中奖面板
        function showGoldenEggsBingoPanel() {
            var html_str = $.tmpl($.trim($('#JsM2019Shuang12GoldenEggsBingoPanel').html()))({})
            var config = {
                middle    : true,
                className: 'panel-golden-eggs'
            }
            tcb.showDialog(html_str, config)
        }

        // 显示查看我的奖品面板
        function showGoldenEggsMyPrizePanel(txt) {
            var html_str = $.tmpl($.trim($('#JsM2019Shuang12GoldenEggsMyPrizePanel').html()))({
                txt:txt
            })
            var config = {
                middle    : true,
                className: 'panel-golden-eggs'
            }
            tcb.showDialog(html_str, config)
        }

        // 输出中奖用户的数据
        function renderLotteryUserList() {
            $.get('/ypDouble12/doGetSmashGiftList',function (res) {
                if (!res[ 'errno' ] && res['result'] && res['result' ].length){
                    var $list_inner = $('.lottery-user-list-inner'),
                        list_arr = res['result'],
                        html_str = ''

                    if ($list_inner && $list_inner.length) {
                        for(var i=0;i<res['result'].length;i++){
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
            })
        }

        renderLotteryUserList()
    })
} ()
