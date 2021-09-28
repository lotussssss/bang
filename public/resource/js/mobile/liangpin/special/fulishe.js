;
!function () {
    var
        rollingInst,

        wxData = {
            "title": "同城帮发福利啦，快来看看手机究竟能多便宜！",
            "desc": "iPhone百元起，特价手机低至1折！",
            "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
            "imgUrl"  : 'https://p2.ssl.qhmsg.com/t0179101024c0f13a2e.png',
            "success" : shareSuccess, // 用户确认分享的回调
            "cancel"  : tcb.noop // 用户取消分享
        }

    if (typeof wx !== 'undefined'){
        // 微信分享
        wx.ready ( function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage ( wxData )
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline ( wxData )
            //分享到QQ
            wx.onMenuShareQQ ( wxData )
        })
    }
    // 设置支持App分享
    function __appSetShareSupport(){
        // 设置分享的数据
        tcb.js2AppSetShareData(wxData)

        // 设置支持的分享方式，不传任何参数，那么表示支持默认的分享方式
        tcb.js2AppSetShareSupport ({
            'onMenuCopyUrl' : 0
        })
    }
    __appSetShareSupport()

    // 已登录用户分享成功
    function shareSuccess(){
        tcb.js2AppTest()

        $.get('/youpinfulishe/doWechatSharedNotify',function (res) {
            res = $.parseJSON(res)
            var available_roll_count = res['result']['Roulette_cnt']['available_draw_cnt']

            if(!res['errno']){
                updateAvailableRollCount(available_roll_count)
            }
        })
        
        window.Bang.ShareIntro.close()
    }
    // 更新页面今日可抽奖次数
    function updateAvailableRollCount(count) {
        $('.btn-get-my-luck .available-roll-count').html(count)
    }

    $(function () {
        tcb.bindEvent(document.body, {
            // 登录
            '.js-trigger-login':function (e) {
                e.preventDefault()

                showCommonLoginPanel(function () {
                    setTimeout(function () {
                        window.location.reload()
                    },100)
                })
            },
            // 点击开启神秘好礼
            '.js-trigger-get-gift':function (e) {
                e.preventDefault()

                var $me = $(this),
                    gift_id = $me.attr('data-gift-id')

                $.get('/youpinfulishe/doLuckdrawFuliGift?gift_id='+gift_id,function (res) {
                    res = $.parseJSON(res)

                    if(res['errno']==0||res['errno']==1523){
                        var html_str = $.tmpl($.trim($('#JsMFulisheGiftPanel').html()))({
                            'gift':res['result']['descPerty']
                        })
                        var config = {
                            middle: true,
                            className: 'fulishe-gift-panel'
                        }
                        tcb.showDialog(html_str, config)

                        $me.html('查看礼品')
                    }else if(res['errno']==10710){
                        showCommonLoginPanel(function () {
                            tcb.closeDialog()

                            $me.trigger('click')
                        })
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                })
            },
            // 大转盘抽奖我的奖品
            '.js-trigger-lottery-my-prize':function (e) {
                e.preventDefault()

                var $me = $(this)

                $.get('/youpinfulishe/doGetRoulettePrizeList',function (res) {
                    res = $.parseJSON(res)

                    if(!res['errno']){
                        var html_str = $.tmpl($.trim($('#JsMFulisheMyPrizePanel').html()))({
                                prize_list:res['result']
                            }),
                            config = {
                                middle: true,
                                className: 'fulishe-lottery-my-prize-panel'
                            }
                        tcb.showDialog(html_str, config)
                    }else if(res['errno']==10710){
                        showCommonLoginPanel(function () {
                            tcb.closeDialog()

                            $me.trigger('click')
                        })
                    }else {
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                })
            },
            // 大转盘抽奖规则
            '.js-trigger-lottery-desc':function (e) {
                e.preventDefault()

                var html_str = $.tmpl($.trim($('#JsMFulisheLotteryDescPanel').html()))({}),
                    config = {
                    middle: true,
                    className: 'fulishe-lottery-desc-panel'
                }
                tcb.showDialog(html_str, config)
            },
            // 领取优惠券
            '.js-trigger-get-coupon':function (e) {
                e.preventDefault()

                var $me = $(this),
                    data_coupon_id = $me.attr('data-coupon-id')

                if($me.hasClass('btn-to-use')){
                    return
                }
                $.get('/youpinfulishe/doLuckdrawFuli?fuli_id='+data_coupon_id, function (res) {
                    res = $.parseJSON(res)
                    if (!res['errno']) {
                        // 领券成功
                        $.dialog.toast('恭喜您，领取成功！', 2000)

                        $me.attr('href',tcb.setUrl(window.__MHOST+'youpin', window.__PARAMS))
                            .addClass('btn-to-use').removeClass('js-trigger-get-coupon')
                            .html('去使用')
                        $me.closest('.coupon-item').append('<span class="label-got"></span>')
                    }else if (res['errno'] == 10710) {
                        // 未登录
                        showCommonLoginPanel(function () {
                            setTimeout(function () {
                                window.location.reload()
                            },10)
                        })
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                })
            }
        })

        // 为你推荐
        window.Bang.renderProductList({
            $tpl : $('#JsMRecommendProductListTpl'),
            $target : $('.js-recommend-product-list'),
            request_url : '/youpin/doGetSuggestProductList',
            request_params : {
                pn : 0,
                page_size: 3
            },
            list_params: {
                'from_page':'fulishe_tuijian'
            },
            col : 1,
            complete: function(result, $target){}
        })
        // 尾货清仓
        window.Bang.renderProductList({
            $tpl : $('#JsMClearanceSaleProductListTpl'),
            $target : $('.js-clearance-sale-product-list'),
            request_url : '/youpin/doGetDaShuaiMaiProductList',
            request_params : {
                pn : 0,
                page_size: 3,
            },
            list_params:{
                'from_page':'dashuaimai'
            },
            col : 3,
            complete: function(result, $target){}
        })

        // 登录
        function showCommonLoginPanel(success_cb) {
            tcb.showCommonLoginPanel({
                action_url : '/youpin/aj_my_login',
                withClose : true,
                success_cb : function (res) {
                    // 登录后的公共操作
                    var mobile = $('.ui-common-login-dialog [name="mobile"]').val()
                    mobile = mobile.substring(0,3)+'****'+mobile.substring(7)
                    $('.js-trigger-login').html(mobile)

                    success_cb(res)
                }
            })
        }

        // 优惠券倒计时
        function startCouponCountdown(){
            var $jsBlockFlashGoodsCountdown = $('.block-coupon .js-coupon-countdown'),
                currentTime = Date.parse (window.curtime ? window.curtime.replace ( /-/g, '/' ) : '') || Date.now(),
                NextDate = new Date(currentTime+86400000),
                targetTime  = (new Date(NextDate.getFullYear(), NextDate.getMonth(), NextDate.getDate())).getTime()

            function loopCountdown (tTime, cTime, $el) {
                Bang.startCountdown (tTime, cTime, $el, {
                    'end' : function () {
                        cTime = tTime
                        tTime  = cTime + 86400000

                        loopCountdown (tTime, cTime, $el)
                    }
                })
            }

            loopCountdown(targetTime, currentTime, $jsBlockFlashGoodsCountdown)
        }
        startCouponCountdown()

        //====================================
        // 处理抽奖转盘
        var $Lottery = $('.block-lottery-2')
        if($Lottery.length){
            rollingInst = window.Bang.RollingBonus({
                $wrap: $Lottery,
                canvasData: {
                    x: 0,
                    y: 0,
                    w: 658,
                    h: 550
                },
                rollUrl: '/youpinfulishe/doLuckdrawRoulette',
                sourceImg: 'https://p3.ssl.qhmsg.com/t01c1d7da3b6eca05e0.png',
                // 奖品集合
                bonusSet: __getBonusSet(),
                // rollCount: 1,
                rollingDone: rollingDone,
                rollingAtRemoteSuccess: rollingAtRemoteSuccess,
                rollingAtRemoteFail: rollingAtRemoteFail
            })

            rollingInst.drawBonusMap(function(){
                // rollingInst.start()
                // rollingInst.rollBonus(1)
            })
            rollingInst.$LuckBtn.on('click', function (e) {
                e.preventDefault()

                if (rollingInst.$LuckBtn.hasClass('disabled')){
                    return
                }
                rollingInst.start()
            })

            // 奖励集合
            function __getBonusSet(){
                return [
                    {
                        'id' : '0',
                        'name' : '谢谢参与',
                        'pos' : [],
                        'drawData' : {
                            // 文字显示补偿位移坐标
                            nameOffsetX : 15,
                            nameOffsetY : 15,

                            nameFillStyle       : '#666',
                            nameFontSize        : 32,
                            fontFamily          : 'sans-serif'
                        },
                        'handler' : 'handlerDrawSingleLineText'
                    },
                    {
                        'id' : '1',
                        'name' : '满300可用',
                        'discount': '20',
                        'pos' : [0, 0, 216, 130],
                        'discountText':'优惠券',//优惠金额文案
                        'drawData' : {
                            nameFillStyle : '#666',
                            nameFontSize : 26,
                            couponFillStyle : '#fff',
                            couponFontSize : 32,
                            fontFamily : 'sans-serif',

                            // 文字显示补偿位移坐标
                            nameOffsetX : 15,
                            nameOffsetY : 15,
                            // 图片显示补偿位移坐标
                            imgOffsetX : 20,
                            imgOffsetY : 10,
                            // 钱币符号显示补偿位移坐标
                            symbolOffsetX : 85,
                            symbolOffsetY : 70,
                            // 优惠金额显示补偿位移坐标
                            discountOffsetX : 100,
                            discountOffsetY : 85,
                            // 优惠金额文案显示补偿位移坐标
                            discountTextOffsetX : 90,
                            discountTextOffsetY : 100
                        },
                        // 绘制优惠券
                        'handler' : 'handlerDrawCoupon'
                    },
                    {
                        'id' : '2',
                        'name' : 'emoji充电宝',
                        'pos' : [0, 296, 216, 130],
                        'drawData' : {
                            // 文字显示补偿位移坐标
                            nameOffsetX : 10,
                            nameOffsetY : 10,
                            // 图片显示补偿位移坐标
                            imgOffsetX : 10,
                            imgOffsetY : 0,

                            nameFillStyle : '#666',
                            nameFontSize : 26,
                            fontFamily : 'sans-serif'
                        },
                        'handler' : 'handlerDrawPrizeStaff'
                    },
                    {
                        'id' : '3',
                        'name' : '满1000可用',
                        'discount': '80',
                        'pos' : [0, 0, 216, 130],
                        'discountText':'优惠券',//优惠金额文案
                        'drawData' : {
                            nameFillStyle : '#666',
                            nameFontSize : 26,
                            couponFillStyle : '#fff',
                            couponFontSize : 32,
                            fontFamily : 'sans-serif',

                            // 文字显示补偿位移坐标
                            nameOffsetX : 10,
                            nameOffsetY : 15,
                            // 图片显示补偿位移坐标
                            imgOffsetX : 15,
                            imgOffsetY : 10,
                            // 钱币符号显示补偿位移坐标
                            symbolOffsetX : 85,
                            symbolOffsetY : 70,
                            // 优惠金额显示补偿位移坐标
                            discountOffsetX : 100,
                            discountOffsetY : 85,
                            // 优惠金额文案显示补偿位移坐标
                            discountTextOffsetX : 90,
                            discountTextOffsetY : 100
                        },
                        // 绘制优惠券
                        'handler' : 'handlerDrawCoupon'
                    },
                    {
                        'id' : '4',
                        'name' : '碎屏险',
                        'pos' : [0, 452, 216, 130],
                        'drawData' : {
                            // 文字显示补偿位移坐标
                            nameOffsetX : 5,
                            nameOffsetY : 0,
                            // 图片显示补偿位移坐标
                            imgOffsetX : 10,
                            imgOffsetY : 0,

                            nameFillStyle : '#666',
                            nameFontSize : 26,
                            fontFamily : 'sans-serif'
                        },
                        'handler' : 'handlerDrawRedPackage'
                    },
                    {
                        'id' : '5',
                        'name' : 'beats耳机',
                        'pos' : [0, 145, 216, 130],
                        'drawData' : {
                            // 文字显示补偿位移坐标
                            nameOffsetX : 5,
                            nameOffsetY : 0,
                            // 图片显示补偿位移坐标
                            imgOffsetX : 5,
                            imgOffsetY : 0,

                            nameFillStyle : '#666',
                            nameFontSize : 26,
                            fontFamily : 'sans-serif'
                        },
                        // 绘制实物奖品
                        'handler' : 'handlerDrawPrizeStaff'
                    },
                    {
                        'id' : '6',
                        'name' : '满3000可用',
                        'discount': '150',
                        'pos' : [0, 0, 216, 130],
                        'discountText':'优惠券',//优惠金额文案
                        'drawData' : {
                            nameFillStyle : '#666',
                            nameFontSize : 26,
                            couponFillStyle : '#fff',
                            couponFontSize : 32,
                            fontFamily : 'sans-serif',

                            // 文字显示补偿位移坐标
                            nameOffsetX : 10,
                            nameOffsetY : 5,
                            // 图片显示补偿位移坐标
                            imgOffsetX : 15,
                            imgOffsetY : 10,
                            // 钱币符号显示补偿位移坐标
                            symbolOffsetX : 85,
                            symbolOffsetY : 70,
                            // 优惠金额显示补偿位移坐标
                            discountOffsetX : 100,
                            discountOffsetY : 85,
                            // 优惠金额文案显示补偿位移坐标
                            discountTextOffsetX : 95,
                            discountTextOffsetY : 100
                        },
                        // 绘制优惠券
                        'handler' : 'handlerDrawCoupon'
                    },
                    {
                        'id' : '7',
                        'name' : '顺丰包邮',
                        'pos' : [0, 620, 216, 130],
                        'drawData' : {
                            // 文字显示补偿位移坐标
                            nameOffsetX : 15,
                            nameOffsetY : 0,
                            // 图片显示补偿位移坐标
                            imgOffsetX : 15,
                            imgOffsetY : 0,

                            nameFillStyle : '#666',
                            nameFontSize : 26,
                            fontFamily : 'sans-serif'
                        },
                        // 绘制实物奖品
                        'handler' : 'handlerDrawPrizeStaff'
                    }
                ]
            }
            function rollingDone(temp_bonus_id, bonus_id, res, rollingObj) {
                var options = rollingObj.options

                var the_bonus = options.bonusSet[bonus_id],
                    the_bonus_name = '¥'+the_bonus['discount']+the_bonus['discountText'],
                    available_roll_count = res['result']['Roulette_cnt']['available_draw_cnt']

                if (bonus_id){
                    // 中奖id大于0，表示有中奖
                    showBingoPanel(the_bonus_name, res['result'])
                }

                rollingObj.$LuckBtn.removeClass('disabled')
                updateAvailableRollCount(available_roll_count)
            }
            // 从服务器上摇奖成功
            function rollingAtRemoteSuccess(res, rollingObj){
                var bonus_id = parseInt(res['result']['prize_info']['prize_id'], 10) //parseInt(Math.random()*10, 10)

                rollingObj.rollBonus(bonus_id, res)
            }
            // 从服务器上摇奖失败
            function rollingAtRemoteFail(res, rollingObj) {
                if (res['errno']) {
                    if (res['errno'] == 10710) {
                        // 未登录，弹出登录框
                        showCommonLoginPanel(function () {
                            // 登录成功关闭弹窗
                            closeLoginPanel()
                            // 点击抽奖按钮
                            $Lottery.find('.btn-get-my-luck').trigger('click')
                        })
                    }else if(res['errno'] == 1520||res['errno'] == 1521){
                        // 抽奖次数为0
                        rollingObj.$LuckBtn.find('.available-roll-count').html('0')
                        $.dialog.toast(res['errmsg'], 2000)
                    }else {
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                    rollingObj.$LuckBtn.removeClass('disabled')
                }
            }
            //====================================
            // 关闭登录面板
            function closeLoginPanel(){

                tcb.closeDialog()
            }
            //====================================
            // 显示中奖面板
            function showBingoPanel(bonus_name, options){
                var
                    html_fn = $.tmpl (tcb.trim ($ ('#JsMFulisheBingoPanel').html ())),
                    html_st = html_fn ({
                        bonus_name : bonus_name,
                        desc : options['prize_info']['desc'],
                        show_btn: options['Roulette_cnt']['can_share_cnt'] > 0 ? true : false
                    })

                var
                    dialog = tcb.showDialog (html_st, {
                        className : 'fulishe-bingo-panel',
                        withClose : true,
                        middle    : true
                    })

                bindEventBingo (dialog.wrap)
            }
            // 关闭中奖面板
            function closeBingoPanel(){

                tcb.closeDialog()
            }
            // 绑定中奖界面事件
            function bindEventBingo($wrap){
                $wrap.find('.btn-share-and-roll').on('click', function(e){
                    e.preventDefault()

                    closeBingoPanel()

                    showShareIntro()
                })
            }
            // 触发显示分享引导
            function showShareIntro(){
                // 触发显示分享引导
                window.Bang.ShareIntro.active({
                    img : 'https://p.ssl.qhimg.com/t01c5d992454e4a99d1.png',
                    ext_html: '<div style="padding-top:.1rem;font-size: .14rem;text-align: center;color: #fff;">分享至好友群或朋友圈<br/>立即再抽一次</div>'
                })
            }
            //====================================

            // 获取中奖列表信息
            function renderLotteryUserList(){
                $.get ('/youpinfulishe/doGetRouletteLuckyList', function (res) {
                    res = $.parseJSON (res)

                    if (!res[ 'errno' ] && res['result'] && res['result' ].length) {

                        var
                            html_st = ''

                        for(var i=0;i<res['result' ].length;i++){
                            html_st += '<div class="item"><span>●</span>'+res['result'][i]+'</div>'
                        }

                        var
                            $list = $('.lottery-user-list'),
                            $inner = $list.find('.lottery-user-list-inner')

                        $inner.html(html_st)

                        var
                            h = $inner.find('.item').eq(0).height()

                        setTimeout(function(){
                            var arg = arguments;
                            $inner.animate({'top': -h}, 800, function(){
                                $inner.find('.item').eq(0).appendTo($inner)

                                $inner.css({'top': 0})

                                setTimeout(arg.callee, 3500)
                            })
                        }, 3500)

                    }
                })
            }

            renderLotteryUserList()
        }

    })

} ()