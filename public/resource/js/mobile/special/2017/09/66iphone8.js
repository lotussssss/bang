!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title"   : '聪明之选，在这里6.6折抢iPhone 8，你也来试试！',
        "desc"    : '聪明花钱就在同城帮',
        "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname+'?helpOpen_id='+(window.__OPEN_ID || tcb.queryUrl(window.location.search, 'open_id')),
        "imgUrl"  : 'https://p0.ssl.qhmsg.com/t01ce27b213de07137f.png',
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

        // 点击抽奖
        $ ('.trigger-btn-rolling').on ('click', function (e) {
            e.preventDefault ()

            var $box

            if (window.__DRAW_COUNT < 1) {
                if (window.__DREW_COUNT == 5) {
                    $box = $.dialog.toast ('您已达到今日抽奖上限<br>明天再来吧！<br/><br/>优惠券当日有效，请在“我的奖品”中查看', 2000)
                    return $box.css ({
                        'bottom'    : '50%',
                        'marginTop' : $box.height () / 2
                    })
                }
                else if (window.__DREW_COUNT > 0) {
                    $box = $.dialog.toast ('您的抽奖次数已经用光了<br>找更多小伙伴帮忙吧！', 2000)
                    return $box.css ({
                        'bottom'    : '50%',
                        'marginTop' : $box.height () / 2
                    })
                }

                return window.Bang.ShareIntro.active({
                    img : 'https://p.ssl.qhimg.com/t01c5d992454e4a99d1.png',
                    ext_html: '<div style="padding-top:.1rem;font-size: .16rem;text-align: center;color: #fff;">分享后，每有三个好友点开<br/>即可获得一次抽奖机会！</div>'
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
                rollUrl             : '/youpin/doLotteryForErhuo',
                // roll选项
                rollOptions         : {
                    // 转动周期
                    duration : 6000,
                    // 转动总圈数
                    turns    : 8,
                    // 开始值（任意自然数，一般是开始的奖品id）
                    start    : 0
                },
                sourceImg           : 'https://p3.ssl.qhmsg.com/t012f3cc511d92f1b54.png',
                // 奖品集合
                bonusSet            : __getBonusSet (),
                rollCount           : 99,
                // 抽奖完成
                rollingDone         : rollingDone,
                // 远程摇奖失败
                rollingAtRemoteFail : rollingAtRemoteFail
            })

            rollingInst.drawBonusMap (function () {
                setTimeout (function () {
                    rollingInst.start ()
                    //rollingInst.rollBonus(1)
                }, 400)

            })
        })

        $ ('.trigger-show-my-prize').on ('click', function (e) {
            e.preventDefault ()

            showPrizeListDialog ()
        })

        // 显示摇奖面板
        function showRollingDialog () {
            var html_fn = $.tmpl ($.trim ($ ('#JsM66Iphone8RollingDialogTpl').html ())),
                html_st = html_fn ()

            return tcb.showDialog (html_st, {
                className : 'rolling-bonus-dialog',
                withClose : true,
                middle    : true
            })
        }

        function showRollingSuccessDialog (params) {
            params = params || {}
            var html_fn = $.tmpl ($.trim ($ ('#JsM66Iphone8RollingSuccessDialogTpl').html ())),
                html_st = html_fn ({
                    discount : params.discount,
                    desc     : params.desc
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
        }

        function showPrizeListDialog () {
            $.get ('/youpin/getMyActivityLuckPrizeList', function (res) {

                res = $.parseJSON (res)

                if (res.errno) {
                    return $.dialog.toast (res.errmsg, 2000)
                }

                if (!(res.result && res.result.length)) {
                    return $.dialog.toast ('您还没有奖品，快分享抽奖吧！', 2000)
                }

                var html_fn = $.tmpl ($.trim ($ ('#JsM66Iphone8PrizeListDialogTpl').html ())),
                    html_st = html_fn ({
                        PrizeList : res.result
                    })

                tcb.showDialog (html_st, {
                    className : 'prize-list-dialog',
                    withClose : true,
                    middle    : true
                })
            })
        }

        // 摇奖完成
        function rollingDone (temp_bonus_id, bonus_id, res, rollingObj) {
            window.__DRAW_COUNT--
            window.__DREW_COUNT++

            $('#DrawCount').html(window.__DRAW_COUNT)

            var options = rollingObj.options,
                theBonus = options.bonusSet[bonus_id]

            options.rollCount--

            if (bonus_id){
                // 中奖id大于0，表示有中奖

                showRollingSuccessDialog ({
                    discount : theBonus['redPackageMoney'],
                    desc     : res['result']['desc']
                })
            }
        }
        // 远程摇奖失败
        function rollingAtRemoteFail (res, rollingObj) {
            if (res[ 'errno' ]) {
                $.dialog.toast (res[ 'errmsg' ] + 'xxx', 2000)
            }
        }

    })

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

                    nameFillStyle : '#000',
                    nameFontSize  : 34,
                    fontFamily    : 'sans-serif'
                },
                'handler'  : 'handlerDrawSingleLineText'
            },
            {
                'id'               : '1',
                'name'             : '30优惠券',
                'redPackageSymbol' : '￥',
                'redPackageMoney'  : '30',
                'redPackageText'   : '',
                'pos'              : [ -15, 98, 181, 114 ],
                'drawData'         : {
                    // 文字显示补偿位移坐标
                    nameOffsetX           : 0,
                    nameOffsetY           : -15,
                    // 图片显示补偿位移坐标
                    imgOffsetX            : 0,
                    imgOffsetY            : 3,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX         : 62,
                    symbolOffsetY         : 94,
                    // 红包金额显示补偿位移坐标
                    redPackageOffsetX     : 80,
                    redPackageOffsetY     : 96,
                    // 红包金额文案显示补偿位移坐标
                    redPackageTextOffsetX : 48,
                    redPackageTextOffsetY : 58,

                    nameFillStyle            : '#000',
                    nameFontSize             : 22,
                    redPackageFillStyle      : '#ffea00',
                    redPackageFontSize       : 30,
                    redPackageSymbolFontSize : 22,
                    fontFamily               : 'sans-serif'
                },
                'handler'          : 'handlerDrawRedPackage'
            },
            {
                'id'               : '2',
                'name'             : '50优惠券',
                'redPackageSymbol' : '￥',
                'redPackageMoney'  : '50',
                'redPackageText'   : '',
                'pos'              : [ -15, 98, 181, 114 ],
                'drawData'         : {
                    // 文字显示补偿位移坐标
                    nameOffsetX           : 0,
                    nameOffsetY           : -15,
                    // 图片显示补偿位移坐标
                    imgOffsetX            : 0,
                    imgOffsetY            : 3,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX         : 62,
                    symbolOffsetY         : 94,
                    // 红包金额显示补偿位移坐标
                    redPackageOffsetX     : 80,
                    redPackageOffsetY     : 96,
                    // 红包金额文案显示补偿位移坐标
                    redPackageTextOffsetX : 48,
                    redPackageTextOffsetY : 58,

                    nameFillStyle            : '#000',
                    nameFontSize             : 22,
                    redPackageFillStyle      : '#ffea00',
                    redPackageFontSize       : 30,
                    redPackageSymbolFontSize : 22,
                    fontFamily               : 'sans-serif'
                },
                'handler'          : 'handlerDrawRedPackage'
            },
            {
                'id'               : '3',
                'name'             : '30优惠券',
                'redPackageSymbol' : '￥',
                'redPackageMoney'  : '30',
                'redPackageText'   : '',
                'pos'              : [ -15, 98, 181, 114 ],
                'drawData'         : {
                    // 文字显示补偿位移坐标
                    nameOffsetX           : 0,
                    nameOffsetY           : -15,
                    // 图片显示补偿位移坐标
                    imgOffsetX            : 0,
                    imgOffsetY            : 3,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX         : 62,
                    symbolOffsetY         : 94,
                    // 红包金额显示补偿位移坐标
                    redPackageOffsetX     : 80,
                    redPackageOffsetY     : 96,
                    // 红包金额文案显示补偿位移坐标
                    redPackageTextOffsetX : 48,
                    redPackageTextOffsetY : 58,

                    nameFillStyle            : '#000',
                    nameFontSize             : 22,
                    redPackageFillStyle      : '#ffea00',
                    redPackageFontSize       : 30,
                    redPackageSymbolFontSize : 22,
                    fontFamily               : 'sans-serif'
                },
                'handler'          : 'handlerDrawRedPackage'
            },
            {
                'id'       : '4',
                'name'     : '6.6折购买码',
                'pos'      : [ -15, 445, 181, 114 ],
                'imgData'  : {
                    x : -15,
                    y : 445,
                    w : 181,
                    h : 114
                },
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
                'id'               : '5',
                'name'             : '80优惠券',
                'redPackageSymbol' : '￥',
                'redPackageMoney'  : '80',
                'redPackageText'   : '',
                'pos'              : [ -15, 98, 181, 114 ],
                'drawData'         : {
                    // 文字显示补偿位移坐标
                    nameOffsetX           : 0,
                    nameOffsetY           : -15,
                    // 图片显示补偿位移坐标
                    imgOffsetX            : 0,
                    imgOffsetY            : 3,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX         : 62,
                    symbolOffsetY         : 94,
                    // 红包金额显示补偿位移坐标
                    redPackageOffsetX     : 80,
                    redPackageOffsetY     : 96,
                    // 红包金额文案显示补偿位移坐标
                    redPackageTextOffsetX : 48,
                    redPackageTextOffsetY : 58,

                    nameFillStyle            : '#000',
                    nameFontSize             : 22,
                    redPackageFillStyle      : '#ffea00',
                    redPackageFontSize       : 30,
                    redPackageSymbolFontSize : 22,
                    fontFamily               : 'sans-serif'
                },
                'handler'          : 'handlerDrawRedPackage'
            },
            {
                'id'               : '6',
                'name'             : '50优惠券',
                'redPackageSymbol' : '￥',
                'redPackageMoney'  : '50',
                'redPackageText'   : '',
                'pos'              : [ -15, 98, 181, 114 ],
                'drawData'         : {
                    // 文字显示补偿位移坐标
                    nameOffsetX           : 0,
                    nameOffsetY           : -15,
                    // 图片显示补偿位移坐标
                    imgOffsetX            : 0,
                    imgOffsetY            : 3,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX         : 62,
                    symbolOffsetY         : 94,
                    // 红包金额显示补偿位移坐标
                    redPackageOffsetX     : 80,
                    redPackageOffsetY     : 96,
                    // 红包金额文案显示补偿位移坐标
                    redPackageTextOffsetX : 48,
                    redPackageTextOffsetY : 58,

                    nameFillStyle            : '#000',
                    nameFontSize             : 22,
                    redPackageFillStyle      : '#ffea00',
                    redPackageFontSize       : 30,
                    redPackageSymbolFontSize : 22,
                    fontFamily               : 'sans-serif'
                },
                'handler'          : 'handlerDrawRedPackage'
            },
            {
                'id'               : '7',
                'name'             : '100优惠券',
                'redPackageSymbol' : '￥',
                'redPackageMoney'  : '100',
                'redPackageText'   : '',
                'pos'              : [ -15, 98, 181, 114 ],
                'drawData'         : {
                    // 文字显示补偿位移坐标
                    nameOffsetX           : 0,
                    nameOffsetY           : -15,
                    // 图片显示补偿位移坐标
                    imgOffsetX            : 0,
                    imgOffsetY            : 3,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX         : 56,
                    symbolOffsetY         : 94,
                    // 红包金额显示补偿位移坐标
                    redPackageOffsetX     : 74,
                    redPackageOffsetY     : 96,
                    // 红包金额文案显示补偿位移坐标
                    redPackageTextOffsetX : 48,
                    redPackageTextOffsetY : 58,

                    nameFillStyle            : '#000',
                    nameFontSize             : 22,
                    redPackageFillStyle      : '#ffea00',
                    redPackageFontSize       : 30,
                    redPackageSymbolFontSize : 22,
                    fontFamily               : 'sans-serif'
                },
                'handler'          : 'handlerDrawRedPackage'
            }
        ]
    }

} ()