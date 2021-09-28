;
!function () {
    var
        // 是否分享
        has_share = false,

        // 抽奖次数
        rollingInst,

        roll_count = 1,

        wxData = {
            "title"   : 'kindle换新低至0元起，更有大礼相送',
            "desc"    : 'kindle换新低至0元起，下单即可参与抽奖赢取大礼',
            "link"    : 'http://bang.360.cn/huanxin/kindle',
            "imgUrl"  : 'https://p0.ssl.qhmsg.com/t016aa306e39b55a915.png',
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

    // 已登录用户分享成功
    function shareSuccess(){
        if (!has_share && rollingInst && rollingInst.options.rollCount<2){
            rollingInst.options.rollCount++
            has_share = true
        }

        window.Bang.ShareIntro.close()
    }

    $ (function () {

        //====================================
        // 处理抽奖转盘
        var $Lottery = $('.block-lottery-2')

        rollingInst = window.Bang.RollingBonus({
            $wrap: $Lottery,
            canvasData: {
                x: 0,
                y: 0,
                w: 562,
                h: 475
            },
            rollUrl: '/youpin/doLotteryForErhuo?lottery_id=9',
            //sourceImg: 'https://p2.ssl.qhmsg.com/t0128e42be5dce5321f.png',
            sourceImg: 'https://p3.ssl.qhmsg.com/t012f3cc511d92f1b54.png',
            // 奖品集合
            bonusSet: __getBonusSet(),
            rollCount: 1,
            rollingDone: rollingDone,
            rollingAtRemoteFail: rollingAtRemoteFail
        })

        rollingInst.drawBonusMap(function(){
           //rollingInst.start()
           // rollingInst.rollBonus(1)
        })
        rollingInst.$LuckBtn.on('click', function (e) {
            e.preventDefault()

            if (rollingInst.$LuckBtn.hasClass('disabled')){
                return
            }

            if (rollingInst.options.rollCount<1){
                // 没有抽奖次数，直接返回

                if (has_share){
                    // 已分享，并且抽奖次数为0，表示抽过了2次奖，
                    // 那么弹出抽过2次的提示框，其他情况弹出普通的toast提示

                    showRollEmptyPanel()
                } else {

                    $.dialog.toast('您今天已经抽过奖啦，明天再试试吧', 2000)
                }
                return
            }

            rollingInst.$LuckBtn.addClass('disabled')

            var params = {}

            if (has_share){
                // 已分享朋友圈

                params['share'] = 1
            }
            rollingInst.start(params)
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
                        nameOffsetX : 0,
                        nameOffsetY : 5,

                        nameFillStyle       : '#000',
                        nameFontSize        : 32,
                        fontFamily          : 'sans-serif'
                    },
                    'handler' : 'handlerDrawSingleLineText'
                },
                {
                    'id' : '1',
                    'name' : '20优惠券',
                    'redPackageSymbol': '￥',
                    'redPackageMoney': '20',
                    'redPackageText': '',
                    'pos' : [-15, 98, 181, 114],
                    'drawData' : {
                        // 文字显示补偿位移坐标
                        nameOffsetX : 0,
                        nameOffsetY : -15,
                        // 图片显示补偿位移坐标
                        imgOffsetX : 0,
                        imgOffsetY : 3,
                        // 钱币符号显示补偿位移坐标
                        symbolOffsetX : 62,
                        symbolOffsetY : 94,
                        // 红包金额显示补偿位移坐标
                        redPackageOffsetX : 80,
                        redPackageOffsetY : 96,
                        // 红包金额文案显示补偿位移坐标
                        redPackageTextOffsetX : 48,
                        redPackageTextOffsetY : 58,

                        nameFillStyle       : '#000',
                        nameFontSize        : 22,
                        redPackageFillStyle : '#ffea00',
                        redPackageFontSize  : 30,
                        redPackageSymbolFontSize  : 22,
                        fontFamily          : 'sans-serif'
                    },
                    'handler' : 'handlerDrawRedPackage'
                },
                {
                    'id' : '2',
                    'name' : '110优惠券',
                    'redPackageSymbol': '￥',
                    'redPackageMoney': '110',
                    'redPackageText': '',
                    'pos' : [-15, 98, 181, 114],
                    'drawData' : {
                        // 文字显示补偿位移坐标
                        nameOffsetX : 0,
                        nameOffsetY : -15,
                        // 图片显示补偿位移坐标
                        imgOffsetX : 0,
                        imgOffsetY : 3,
                        // 钱币符号显示补偿位移坐标
                        symbolOffsetX : 56,
                        symbolOffsetY : 94,
                        // 红包金额显示补偿位移坐标
                        redPackageOffsetX : 74,
                        redPackageOffsetY : 96,
                        // 红包金额文案显示补偿位移坐标
                        redPackageTextOffsetX : 48,
                        redPackageTextOffsetY : 58,

                        nameFillStyle       : '#000',
                        nameFontSize        : 22,
                        redPackageFillStyle : '#ffea00',
                        redPackageFontSize  : 30,
                        redPackageSymbolFontSize  : 22,
                        fontFamily          : 'sans-serif'
                    },
                    'handler' : 'handlerDrawRedPackage'
                },
                {
                    'id' : '3',
                    'name' : '品牌充电套装',
                    'pos' : [-15, 318, 181, 114],
                    'drawData' : {
                        // 文字显示补偿位移坐标
                        nameOffsetX : 0,
                        nameOffsetY : -15,
                        // 图片显示补偿位移坐标
                        imgOffsetX : 0,
                        imgOffsetY : 7,

                        nameFillStyle : '#000',
                        nameFontSize : 22,
                        fontFamily : 'sans-serif'
                    },
                    'handler' : 'handlerDrawPrizeStaff'
                },
                {
                    'id' : '4',
                    'name' : '200优惠券',
                    'redPackageSymbol': '￥',
                    'redPackageMoney': '200',
                    'redPackageText': '',
                    'pos' : [-15, 98, 181, 114],
                    'drawData' : {
                        // 文字显示补偿位移坐标
                        nameOffsetX : 0,
                        nameOffsetY : -15,
                        // 图片显示补偿位移坐标
                        imgOffsetX : 0,
                        imgOffsetY : 3,
                        // 钱币符号显示补偿位移坐标
                        symbolOffsetX : 54,
                        symbolOffsetY : 94,
                        // 红包金额显示补偿位移坐标
                        redPackageOffsetX : 72,
                        redPackageOffsetY : 96,
                        // 红包金额文案显示补偿位移坐标
                        redPackageTextOffsetX : 48,
                        redPackageTextOffsetY : 58,

                        nameFillStyle       : '#000',
                        nameFontSize        : 22,
                        redPackageFillStyle : '#ffea00',
                        redPackageFontSize  : 30,
                        redPackageSymbolFontSize  : 22,
                        fontFamily          : 'sans-serif'
                    },
                    'handler' : 'handlerDrawRedPackage'
                },
                {
                    'id' : '5',
                    'name' : '50优惠券',
                    'redPackageSymbol': '￥',
                    'redPackageMoney': '50',
                    'redPackageText': '',
                    'pos' : [-15, 98, 181, 114],
                    'drawData' : {
                        // 文字显示补偿位移坐标
                        nameOffsetX : 0,
                        nameOffsetY : -15,
                        // 图片显示补偿位移坐标
                        imgOffsetX : 0,
                        imgOffsetY : 3,
                        // 钱币符号显示补偿位移坐标
                        symbolOffsetX : 62,
                        symbolOffsetY : 94,
                        // 红包金额显示补偿位移坐标
                        redPackageOffsetX : 80,
                        redPackageOffsetY : 96,
                        // 红包金额文案显示补偿位移坐标
                        redPackageTextOffsetX : 48,
                        redPackageTextOffsetY : 58,

                        nameFillStyle       : '#000',
                        nameFontSize        : 22,
                        redPackageFillStyle : '#ffea00',
                        redPackageFontSize  : 30,
                        redPackageSymbolFontSize  : 22,
                        fontFamily          : 'sans-serif'
                    },
                    'handler' : 'handlerDrawRedPackage'
                },
                {
                    'id' : '6',
                    'name' : 'iPhone6s',
                    'pos' : [-15, 212, 181, 114],
                    'drawData' : {
                        // 文字显示补偿位移坐标
                        nameOffsetX : 0,
                        nameOffsetY : -15,
                        // 图片显示补偿位移坐标
                        imgOffsetX : 0,
                        imgOffsetY : 7,

                        nameFillStyle : '#000',
                        nameFontSize : 22,
                        fontFamily : 'sans-serif'
                    },
                    'handler' : 'handlerDrawRedPackage'
                },
                {
                    'id' : '7',
                    'name' : '苹果耳机',
                    'pos' : [-15, 0, 181, 110],
                    'drawData' : {
                        // 文字显示补偿位移坐标
                        nameOffsetX : 0,
                        nameOffsetY : -15,
                        // 图片显示补偿位移坐标
                        imgOffsetX : 0,
                        imgOffsetY : 7,

                        nameFillStyle : '#000',
                        nameFontSize : 22,
                        fontFamily : 'sans-serif'
                    },
                    // 绘制实物奖品
                    'handler' : 'handlerDrawPrizeStaff'
                }
            ]
        }

        function rollingDone(temp_bonus_id, bonus_id, res, rollingObj) {
            var options = rollingObj.options

            options.rollCount--

            var the_bonus = options.bonusSet[bonus_id],
                the_bonus_name = the_bonus['name']

            if (bonus_id){
                // 中奖id大于0，表示有中奖

                showBingoPanel(the_bonus_name, res['result']['desc'] || '')
            }

            rollingObj.$LuckBtn.removeClass('disabled')

        }
        function rollingAtRemoteFail(res, rollingObj) {
            if (res['errno']) {
                if (res['errno'] == 10710) {
                    // 未登录，弹出登录框，提示登录
                    showLoginPanel()
                } else {

                    $.dialog.toast(res['errmsg'], 2000)
                }
                rollingObj.$LuckBtn.removeClass('disabled')
            }
        }
        //====================================
        // 显示登录面板
        function showLoginPanel () {

            var
                html_fn = $.tmpl (tcb.trim ($ ('#JsMHuanxinKindleLoginPanel').html ())),
                html_st = html_fn ()

            var
                dialog = tcb.showDialog (html_st, {
                    className : 'erhuojie-panel erhuojie-login-panel',
                    withClose : true,
                    middle    : true
                }),
                $form = dialog.wrap.find ('form')

            dialog.wrap.prepend('<div class="erhuojie-panel-bottom"></div>')

            bindEventLoginForm ($form)

        }
        // 关闭登录面板
        function closeLoginPanel(){

            tcb.closeDialog()
        }
        // 绑定登录表单事件
        function bindEventLoginForm($form){

            // 提交获取优惠券表单
            $form.on('submit', function(e){
                e.preventDefault()

                var
                    $form = $(this)
                if (!validFormLogin($form)){
                    return
                }

                $.ajax ({
                    type     : $form.attr('method'),
                    url      : $form.attr('action'),
                    data     : $form.serialize(),
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {

                        if (res[ 'errno' ]) {
                            return $.dialog.toast (res[ 'errmsg' ], 2000)
                        }

                        closeLoginPanel()

                        $Lottery.find('.btn-get-my-luck').trigger('click')

                    },
                    error    : function () {
                        $.dialog.toast('系统错误，请刷新页面重试', 2000)
                    }
                })
            })
            // 获取手机验证码
            $form.find('.btn-get-sms-code').on('click', function(e){
                e.preventDefault()

                var
                    $me = $ (this),
                    $form = $me.closest ('form'),
                    $mobile = $form.find ('[name="user_mobile"]'),
                    $secode = $form.find ('[name="secode"]')

                if (!validSeCode($me)) {
                    return
                }

                getSMSCode ({
                    'user_mobile' : $.trim($mobile.val ()),
                    'secode' : $.trim($secode.val ())
                }, function (data) {
                    $me.addClass ('btn-get-sms-code-disabled').html ('发送成功')
                    setTimeout(function(){

                        $me.html ('60秒后再次发送')

                        tcb.distimeAnim (60, function (time) {
                            if (time <= 0) {
                                $me.removeClass ('btn-get-sms-code-disabled').html ('发送验证码')
                            } else {
                                $me.html (time + '秒后再次发送')
                            }
                        })

                    }, 1000)

                })
            })
            // 刷新图像验证码
            $form.find('.vcode-img').on('click', function(e){
                var
                    $me = $(this),
                    $secode_img = $('.vcode-img'),
                    $secode = $('[name="secode"]'),
                    src = '/secode/?rands=' + Math.random ()

                $secode_img.attr ('src', src)

                $secode.val('')

                $me.closest('.row').find('[name="secode"]').focus()
            })
        }
        // 验证登录表单
        function validFormLogin ($Form) {
            var
                flag = true

            if (!($Form && $Form.length)) {
                flag = false
            } else {

                var
                    $mobile = $Form.find ('[name="user_mobile"]'),
                    // 图像验证码
                    $secode = $Form.find ('[name="secode"]'),
                    // 短信验证码
                    $smscode = $Form.find ('[name="sms_code"]'),

                    mobile = $.trim ($mobile.val ()),
                    secode = $.trim ($secode.val ()),
                    smscode = $.trim ($smscode.val ())

                var
                    $focus_el = null,
                    err_msg = ''

                // 验证手机号
                if (!mobile) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = '手机号码不能为空'
                }
                else if (!tcb.validMobile (mobile)) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = '手机号码格式错误'
                }

                // 验证图形验证码
                if (!secode) {
                    $.errorAnimate ($secode)
                    $focus_el = $focus_el || $secode
                    err_msg = err_msg || '图片验证码不能为空'
                }

                // 验证短信验证码
                if (!smscode) {
                    $.errorAnimate ($smscode)
                    $focus_el = $focus_el || $smscode
                    err_msg = err_msg || '短信验证码不能为空'
                }

                if (err_msg) {
                    flag = false

                    setTimeout (function () {
                        $focus_el && $focus_el.focus ()
                    }, 500)

                    $.dialog.toast (err_msg)
                }
            }

            return flag
        }
        // 验证优惠码表单
        function validSeCode ($Target) {
            var
                flag = true

            if (!($Target && $Target.length)) {
                flag = false
            } else {

                var
                    $Form = $Target.closest ('form'),
                    $mobile = $Form.find ('[name="user_mobile"]'),
                    $secode = $Form.find ('[name="secode"]'),

                    mobile = $.trim ($mobile.val ()),
                    secode = $.trim ($secode.val ())

                if ($Target.hasClass ('btn-get-sms-code-disabled')) {
                    flag = false
                } else {
                    var
                        $focus_el = null,
                        err_msg = ''

                    // 验证手机号
                    if (!mobile) {
                        $.errorAnimate ($mobile)
                        $focus_el = $focus_el || $mobile
                        err_msg = '手机号码不能为空'
                    }
                    else if (!tcb.validMobile (mobile)) {
                        $.errorAnimate ($mobile)
                        $focus_el = $focus_el || $mobile
                        err_msg = '手机号码格式错误'
                    }

                    // 验证图形验证码
                    if (!secode){
                        $.errorAnimate ($secode)
                        $focus_el = $focus_el || $secode
                        err_msg = err_msg || '图片验证码不能为空'
                    }

                    if (err_msg) {
                        flag = false

                        setTimeout (function () {
                            $focus_el && $focus_el.focus ()
                        }, 500)

                        $.dialog.toast (err_msg)
                    }

                }
            }

            return flag
        }
        // 获取手机验证码
        function getSMSCode (params, callback, error) {
            $.ajax ({
                type     : 'POST',
                url      : '/m/doSendSmscode/',
                data     : params,
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {

                    if (res[ 'errno' ]) {
                        return $.dialog.toast (res[ 'errmsg' ], 2000)
                    }
                    typeof callback === 'function' && callback (res[ 'result' ])
                },
                error    : function () {
                    typeof error === 'function' && error ()
                }
            })
        }

        //====================================
        // 显示中奖面板
        function showBingoPanel(bonus_name, desc){
            var
                html_fn = $.tmpl (tcb.trim ($ ('#JsMHuanxinKindleBingoPanel').html ())),
                html_st = html_fn ({
                    bonus_name : bonus_name,
                    desc : desc,
                    show_btn: (has_share && rollingInst && rollingInst.options.rollCount<1) ? false : true
                })

            var
                dialog = tcb.showDialog (html_st, {
                    className : 'erhuojie-panel erhuojie-bingo-panel',
                    withClose : true,
                    middle    : true
                })

            dialog.wrap.prepend('<div class="erhuojie-panel-bottom"></div>')

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

                if (tcb.isWeChat){
                    // 微信中触发显示分享引导

                    showShareIntro()
                } else {
                    $.dialog.toast('请在微信中分享再抽奖', 2000)
                }
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
        // 显示抽奖次数用光
        function showRollEmptyPanel(){
            var
                html_fn = $.tmpl (tcb.trim ($ ('#JsMHuanxinKindleRollEmptyPanel').html ())),
                html_st = html_fn ()

            var
                dialog = tcb.showDialog (html_st, {
                    className : 'erhuojie-panel erhuojie-roll-empty-panel',
                    withClose : true,
                    middle    : true
                })

            dialog.wrap.prepend('<div class="erhuojie-panel-bottom"></div>')

            bindEventRollEmpty (dialog.wrap)
        }
        // 关闭中奖面板
        function closeRollEmptyPanel(){

            tcb.closeDialog()
        }
        // 绑定中奖界面事件
        function bindEventRollEmpty($wrap){
            $wrap.find('.btn').on('click', function(e){
                e.preventDefault()

                closeRollEmptyPanel()
            })
        }


        //====================================
        // 获取中奖列表信息
        function getLotteryTopList(){

            $.get ('/youpin/doGetLotteryTopList', function (res) {
                res = $.parseJSON (res)

                if (!res[ 'errno' ] && res['result'] && res['result' ].length) {

                    var
                        html_st = ''

                    for(var i=0;i<res['result' ].length;i++){
                        html_st += '<div class="item"><span>●</span>'+res['result'][i]+'</div>'
                    }

                    var
                        $list = $('.block-lottery-bingo-list'),
                        $inner = $list.find('.inner')

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
        getLotteryTopList()

    })
} ()
