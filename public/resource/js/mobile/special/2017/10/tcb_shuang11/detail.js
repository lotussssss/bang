!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title"   : '有人哭着要原价买我用了两年的手机！',
        "desc"    : '是不是疯了！',
        "link"    : window.location.protocol + '//' + window.location.host + '/wechathuodong/tcbshuang11' +'?from_page=tcb_fenxiang&op_id='+(window.__OPEN_ID || tcb.queryUrl(window.location.search, 'op_id')),
        "imgUrl"  : 'https://p4.ssl.qhmsg.com/t012c2549fb5cd6ac85.jpg',
        "success" : tcb.noop, // 用户确认分享的回调
        "cancel"  : tcb.noop // 用户取消分享
    }
    if (typeof wx !== 'undefined') {
        wx.ready (function () {
            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage (wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline (wxData)
            //分享到QQ
            wx.onMenuShareQQ (wxData)
            //分享到QZone
            wx.onMenuShareQZone (wxData)
        })
    }

    // DOM Ready
    $ (function () {
        var __show_my_all_friends_flag = false


        // 点击抽奖
        $ ('.trigger-btn-rolling').on ('click', function (e) {
            e.preventDefault ()

            var $box

            if (window.__DRAW_COUNT < 1) {
                if (window.__DREW_COUNT == 3) {
                    $box = $.dialog.toast ('您已达到今日抽奖上限<br>明天再来吧！<br/><br/>在“我的奖品”中可以查看和使用奖品哦！', 3000)
                    return $box.css ({
                        'bottom'    : '50%',
                        'marginTop' : $box.height () / 2
                    })
                }
                else if (window.__DREW_COUNT > 0) {
                    return window.Bang.ShareIntro.active({
                        img : 'https://p.ssl.qhimg.com/t01c5d992454e4a99d1.png',
                        ext_html: '<div style="padding-top:.1rem;font-size: .16rem;text-align: center;color: #fff;">您的抽奖次数已经用光了<br>分享后每有3个好友点开即可获得额外抽奖机会！</div>'
                    })
                }

                return window.Bang.ShareIntro.active({
                    img : 'https://p.ssl.qhimg.com/t01c5d992454e4a99d1.png',
                    ext_html: '<div style="padding-top:.1rem;font-size: .16rem;text-align: center;color: #fff;">您的抽奖次数已经用光啦<br/>找更多小伙伴帮忙吧<br/>人气越高，奖励越多！</div>'
                })
            }

            var dialogInst = showRollingDialog ()

            // 处理抽奖转盘
            var rollingInst = window.Bang.RollingBonus ({
                $wrap               : dialogInst.wrap.find ('.block-lottery-2'),
                canvasData          : {
                    x : 0,
                    y : 0,
                    w : 574,
                    h : 482
                },
                rollUrl             : '/wechathuodong/doGetPrizeOfTcbDoubleOne',
                // roll选项
                rollOptions         : {
                    // 转动周期
                    duration : 6000,
                    // 转动总圈数
                    turns    : 8,
                    // 开始值（任意自然数，一般是开始的奖品id）
                    start    : 0
                },
                sourceImg           : 'https://p3.ssl.qhmsg.com/t017ba433b50c30b2d5.png',
                // 奖品集合
                bonusSet            : __getBonusSet (),
                rollCount           : 99,
                // 抽奖完成
                rollingDone         : rollingDone,
                // 远程摇奖失败
                rollingAtRemoteFail : rollingAtRemoteFail,
                //远程摇奖成功
                rollingAtRemoteSuccess: rollingAtRemoteSuccess
            })

            rollingInst.drawBonusMap (function () {
                setTimeout (function () {
                    rollingInst.start ()
                    //rollingInst.rollBonus(1)
                }, 400)

            })
        })

        var body_h = $(document.body).height()
        var $block_arrow_down = $('.block-arrow-down')
        var $doc = $(document.body)
        var $win = $(window)
        var _origin_height
        var __prize_list_dialog = false

        $(window).on('scroll',function () {
            var $me = $(this)
            var s_t = $me.scrollTop()
            if(s_t > body_h/2){
                $block_arrow_down.hide()
            }else{
                $block_arrow_down.show()
            }
        })


        tcb.bindEvent(document.body,{
            '#DialogMask':function (e) {
                e.preventDefault()
                if(__prize_list_dialog){
                    resolveScroll()
                }
            }
        })

        $ ('.js-show-my-prize').on ('click', function (e) {
            e.preventDefault ()

            showPrizeListDialog ()
        })

        $ ('.js-show-all-friends').on ('click', function (e) {
            e.preventDefault ()
            if(!__show_my_all_friends_flag){
                getHelperHeadImgs()
                __show_my_all_friends_flag = true
            }else {
                $.dialog.toast('已经展示了所有为您助力的朋友',2000)
            }

        })

        $ ( '.js-refresh' ).on('click',function (e) {
            e.preventDefault()
            window.location.reload()
        })

        //====================================
        function forbidScroll() {
            _origin_height = $doc.height()
            $doc.height($win.height())
            $doc.css({'overflow':'hidden'})
            // $('#DialogMask').css({'height':$win.height(),'overflow':'hidden'})
            __prize_list_dialog = true
        }

        function resolveScroll(){
            $doc.height(_origin_height)
            $doc.css({'overflow':'auto'})
        }

        // 获取全部好友头像
        function getHelperHeadImgs() {
            $.get('/wechathuodong/doGetTcbHelperHeadImgs',function (res) {
                res = JSON.parse(res)
                if(!res.errno){
                    var html_str = ''
                    for(var i =0; i< res['helper_head_imgs'].length; i++){
                        var img_url = res['helper_head_imgs'][i]
                        html_str+= '<img class="avanter-img" src="'+img_url+'" alt="">'
                    }
                    $('.avanter-list').html(html_str)
                }else{
                    $.dialog.toast(res.errmsg, 2000)
                }
            })
        }

        // 获取中奖列表信息
        function getLotteryTopList(){

            $.get ('/wechathuodong/doGetTopPrizeList', function (res) {
                res = $.parseJSON (res)
                if (!res[ 'errno' ] && res['result'] && res['result' ].length) {

                    var
                        html_st = ''

                    for(var i=0;i<res['result' ].length;i++){
                        html_st += '<div class="item"><p>'+res['result'][i]['show_time']+'</p><p>用户'+res['result'][i]['user_mobile']+'原价回收一部'+res['result'][i]['name']+'，'+res['result'][i]['price']+'元进入钱包</p></div>'
                    }

                    var
                        $list = $('.block-lottery-bingo-list'),
                        $inner = $list.find('.inner')

                    $inner.html(html_st)

                    var
                        h = $inner.find('.item').eq(0).height()

                    setTimeout(function(){
                        var arg = arguments;
                        $inner.animate({'bottom': -h}, 300, function(){
                            $inner.find('.item').eq($inner.find('.item').length-1).prependTo($inner)

                            $inner.css({'bottom': 0})

                            setTimeout(arg.callee, 2000)
                        })
                    }, 2000)

                }
            })
        }
        getLotteryTopList()

        // 显示摇奖面板
        function showRollingDialog () {
            var html_fn = $.tmpl ($.trim ($ ('#JsTcbShuang11RollingDialogTpl').html ())),
                html_st = html_fn ()

            return tcb.showDialog (html_st, {
                className : 'rolling-bonus-dialog',
                withClose : true,
                middle    : true
            })
        }

        function showRollingSuccessDialog (params) {
            console.log(params)
            params = params || {}
            var html_fn = $.tmpl ($.trim ($ ('#JsTcbShuang11RollingSuccessDialogTpl').html ())),
                html_st = html_fn ({
                    code: params['code'],
                    img_url: params['prize_img'],
                    prize_name:params['prize_name']
                })

            var dialogInst = tcb.showDialog (html_st, {
                className : 'rolling-success-dialog',
                withClose : true,
                top:1
            })

            // 接着抽
            dialogInst.wrap.find ('.btn-continue-roll').on ('click', function (e) {
                e.preventDefault ()

                tcb.closeDialog()

                $ ('.trigger-btn-rolling').trigger('click')
            })

            //复制code
            copyCode({
                btn:'.btn-copy',
                success:function (e) {
                    console.log(e)
                    $.dialog.toast('优惠码复制成功！')
                },
                error:function (e) {
                    $.dialog.toast('优惠码复制失败！')
                }
            })

            // 我的奖品
            var $js_trigger_show_my_prize = dialogInst.wrap.find ('.js-trigger-show-my-prize')
            // 优惠码
            var $youhui_code = dialogInst.wrap.find ('.youhui-code')

            if(window.__DREW_COUNT > 1){
                $js_trigger_show_my_prize.removeClass('hide')
                $youhui_code.removeClass('hide')
            }
            $js_trigger_show_my_prize.on('click',function (e) {
                e.preventDefault()
                tcb.closeDialog()
                $ ('.js-show-my-prize').trigger('click')
            })
        }

        // 从服务器上摇奖成功
        function rollingAtRemoteSuccess(res, rollingObj){
            var bonus_id = parseInt(res['result']['prize_id'], 10) //parseInt(Math.random()*10, 10)

            window.__DRAW_COUNT = res['result']['rest_choujiang_num']
            window.__DREW_COUNT = res['result']['already_choujiang_num']
            window.__PRIZE_IMG_URL = window.__PRIZR_IMGS[res['result']['prize_id']]['prize_img']
            window.__USE_IT_URL = window.__PRIZR_IMGS[res['result']['prize_id']]['prize_link']

            rollingObj.rollBonus(bonus_id, res)
        }

        function showPrizeListDialog () {
            $.get ('/wechathuodong/doGetTcbUserPrizeList', function (res) {

                res = $.parseJSON (res)

                if (res.errno) {
                    return $.dialog.toast (res.errmsg, 2000)
                }

                if (!(res.result && res.result.length)) {
                    return $.dialog.toast ('您还没有奖品，快分享抽奖吧！', 2000)
                }

                var html_fn = $.tmpl ($.trim ($ ('#JsTcbShuang11PrizeListDialogTpl').html ())),
                    html_st = html_fn ({
                        PrizeList : res.result,
                    })

                tcb.showDialog (html_st, {
                    className : 'prize-list-dialog',
                    withClose : true,
                    middle    : true
                })
                //复制code
                copyCode({
                    btn:'.btn-copy',
                    success:function (e) {
                        console.log(e)
                        $.dialog.toast('优惠码复制成功！')
                    },
                    error:function (e) {
                        $.dialog.toast('优惠码复制失败！')
                    }
                })
                forbidScroll()
            })
        }

        // 摇奖完成
        function rollingDone (temp_bonus_id, bonus_id, res, rollingObj) {
            $('#DrawCount').html(window.__DRAW_COUNT)
            $('#DrewCount').html(window.__DREW_COUNT)

            $('.block-luck-detail').show()
            $('.block-lucky-list').show()

            var options = rollingObj.options,
                theBonus = options.bonusSet[bonus_id]
// console.log(res)
            // options.rollCount--
            showRollingSuccessDialog (res['result'])
            // $('#prize-img').attr('src',window.__PRIZE_IMG_URL)
            // 中奖id大于0，表示有中奖
            if (bonus_id){
                $('#use-it').attr('href',window.__USE_IT_URL)
            }else {
                $('#use-it').hide()
            }
        }
        // 远程摇奖失败
        function rollingAtRemoteFail (res, rollingObj) {
            if (res[ 'errno' ]) {
                $.dialog.toast (res[ 'errmsg' ], 2000)
            }
        }

    })

    function copyCode(options) {
        if(options.btn == ''){return}
        var clipboard = new Clipboard(options.btn);

        clipboard.on('success', function(e) {
            typeof options.success == 'function' && options.success(e)
        });

        clipboard.on('error', function(e) {
            typeof options.error == 'function' && options.error(e)
        });
        return clipboard
    }

    // 奖励集合
    function __getBonusSet () {
        return [
            {
                'id'       : '0',
                'name'     : '谢谢参与',
                'pos'      : [],
                'drawData' : {
                    // 文字显示补偿位移坐标
                    nameOffsetX : 0,
                    nameOffsetY : 5,

                    nameFillStyle : '#f00',
                    nameFontSize  : 34,
                    fontFamily    : 'sans-serif'
                },
                'handler'  : 'handlerDrawSingleLineText'
            },
            {
                'id'       : '1',
                'name'     : '手环',
                'pos'      : [ -15, 240, 181, 114 ],
                'drawData' : {
                    // 文字显示补偿位移坐标
                    nameOffsetX : 0,
                    nameOffsetY : -15,
                    // 图片显示补偿位移坐标
                    imgOffsetX  : 0,
                    imgOffsetY  : 3,

                    nameFillStyle : '#000',
                    nameFontSize  : 22,
                    fontFamily    : 'sans-serif'
                },
                // 绘制实物奖品
                'handler'  : 'handlerDrawPrizeStaff'
            },
            {
                'id' : '2',
                'name' : '原价回收券',
                'discount': '原价',
                'discountText':'回收券',
                'pos' : [ -15, 5, 181, 114 ],
                'drawData' : {
                    nameFillStyle : '#000',
                    nameFontSize : 20,
                    couponFillStyle : '#ffea00',
                    couponFontSize : 34,
                    fontFamily : 'sans-serif',

                    // 文字显示补偿位移坐标
                    nameOffsetX : 0,
                    nameOffsetY : -10,
                    // 图片显示补偿位移坐标
                    imgOffsetX : 0,
                    imgOffsetY : 10,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX : 52,
                    symbolOffsetY : 70,
                    // 优惠金额显示补偿位移坐标
                    discountOffsetX : 64,
                    discountOffsetY : 78,
                    // 优惠金额文案显示补偿位移坐标
                    discountTextOffsetX : 62,
                    discountTextOffsetY : 97
                },
                // 绘制优惠券
                'handler' : 'handlerDrawCoupon'
            },
            {
                'id' : '3',
                'name' : '100元回收券',
                'discount': '100',
                'discountText':'回收券',
                'pos' : [ -15, 5, 181, 114 ],
                'drawData' : {
                    nameFillStyle : '#000',
                    nameFontSize : 20,
                    couponFillStyle : '#ffea00',
                    couponFontSize : 34,
                    fontFamily : 'sans-serif',

                    // 文字显示补偿位移坐标
                    nameOffsetX : 0,
                    nameOffsetY : -10,
                    // 图片显示补偿位移坐标
                    imgOffsetX : 0,
                    imgOffsetY : 10,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX : 52,
                    symbolOffsetY : 70,
                    // 优惠金额显示补偿位移坐标
                    discountOffsetX : 64,
                    discountOffsetY : 78,
                    // 优惠金额文案显示补偿位移坐标
                    discountTextOffsetX : 62,
                    discountTextOffsetY : 97
                },
                // 绘制优惠券
                'handler' : 'handlerDrawCoupon'
            },
            {
                'id' : '4',
                'name' : '150元回收券',
                'discount': '150',
                'discountText':'回收券',
                'pos' : [ -15, 5, 181, 114 ],
                'drawData' : {
                    nameFillStyle : '#000',
                    nameFontSize : 20,
                    couponFillStyle : '#ffea00',
                    couponFontSize : 34,
                    fontFamily : 'sans-serif',

                    // 文字显示补偿位移坐标
                    nameOffsetX : 0,
                    nameOffsetY : -10,
                    // 图片显示补偿位移坐标
                    imgOffsetX : 0,
                    imgOffsetY : 10,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX : 52,
                    symbolOffsetY : 70,
                    // 优惠金额显示补偿位移坐标
                    discountOffsetX : 64,
                    discountOffsetY : 78,
                    // 优惠金额文案显示补偿位移坐标
                    discountTextOffsetX : 62,
                    discountTextOffsetY : 97
                },
                // 绘制优惠券
                'handler' : 'handlerDrawCoupon'
            },
            {
                'id'       : '5',
                'name'     : '蓝牙音箱',
                'pos'      : [ -15, 366, 181, 114 ],
                'drawData' : {
                    // 文字显示补偿位移坐标
                    nameOffsetX : 0,
                    nameOffsetY : -15,
                    // 图片显示补偿位移坐标
                    imgOffsetX  : 0,
                    imgOffsetY  : 3,

                    nameFillStyle : '#000',
                    nameFontSize  : 22,
                    fontFamily    : 'sans-serif'
                },
                // 绘制实物奖品
                'handler'  : 'handlerDrawPrizeStaff'
            },
            {
                'id' : '6',
                'name' : '200元回收券',
                'discount': '200',
                'discountText':'回收券',
                'pos' : [ -15, 5, 181, 114 ],
                'drawData' : {
                    nameFillStyle : '#000',
                    nameFontSize : 20,
                    couponFillStyle : '#ffea00',
                    couponFontSize : 34,
                    fontFamily : 'sans-serif',

                    // 文字显示补偿位移坐标
                    nameOffsetX : 0,
                    nameOffsetY : -10,
                    // 图片显示补偿位移坐标
                    imgOffsetX : 0,
                    imgOffsetY : 10,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX : 52,
                    symbolOffsetY : 70,
                    // 优惠金额显示补偿位移坐标
                    discountOffsetX : 64,
                    discountOffsetY : 78,
                    // 优惠金额文案显示补偿位移坐标
                    discountTextOffsetX : 62,
                    discountTextOffsetY : 97
                },
                // 绘制优惠券
                'handler' : 'handlerDrawCoupon'
            },
            {
                'id' : '7',
                'name' : '100元回收券',
                'discount': '100',
                'discountText':'回收券',
                'pos' : [ -15, 5, 181, 114 ],
                'drawData' : {
                    nameFillStyle : '#000',
                    nameFontSize : 20,
                    couponFillStyle : '#ffea00',
                    couponFontSize : 34,
                    fontFamily : 'sans-serif',

                    // 文字显示补偿位移坐标
                    nameOffsetX : 0,
                    nameOffsetY : -10,
                    // 图片显示补偿位移坐标
                    imgOffsetX : 0,
                    imgOffsetY : 10,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX : 52,
                    symbolOffsetY : 70,
                    // 优惠金额显示补偿位移坐标
                    discountOffsetX : 64,
                    discountOffsetY : 78,
                    // 优惠金额文案显示补偿位移坐标
                    discountTextOffsetX : 62,
                    discountTextOffsetY : 97
                },
                // 绘制优惠券
                'handler' : 'handlerDrawCoupon'
            },
        ]
    }

} ()