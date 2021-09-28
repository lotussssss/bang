;
!function () {
    var // 是否分享
        has_share = false,
        // 抽奖次数
        roll_count = 1,
        wxData = {
            "title"   : '8月暑假痛快玩，没有一部好手机，怎么战天下？',
            "desc"    : '好手机！战天下！满减不断，优惠不断！领券最高再省108元！天天爆品，不止5折！',
            "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
            "imgUrl"  : 'https://p1.ssl.qhmsg.com/t018a3937f03984aab8.jpg',
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
            //分享到QZone
            wx.onMenuShareQZone ( wxData )
        })
    }
    // 已登录用户分享成功
    function shareSuccess(){
        if (!has_share && roll_count<2){
            roll_count++
            has_share = true

            window.Bang.ShareIntro.close()
        }
    }
    $(function () {
        //今日秒杀
        window.Bang.renderProductList({
            $target : $ (".js-flash-product-list"),
            $tpl : $('#JsMFlashProductListVer1720Tpl'),
            request_url : '/youpin/doGetFlashSaleGoods',
            request_params : {
               page_size : 4
            },
            list_key: 'flash_list',
            list_params: window.__PARAMS,
            col : 4,
            complete: function(result, $target){}
        })
        tcb.bindEvent(document.body,{
            '.tab-list .tab-item':function (e) {
                e.preventDefault()

                var $me = $(this)
                $me.addClass('cur').siblings('.cur').removeClass('cur')
                $me.closest('.block-inner').find('.tab-cont .ui-sp-product-list-1').eq($me.index()).show().siblings('.tab-cont .ui-sp-product-list-1').hide()
            }
        })


        //====================================
        // 处理抽奖转盘
        !function(){
            var
                $Lottery = $('.block-lottery'),
                $BonusCanvas = $Lottery.find('.canvas-lottery-bonus'),
                $BonusCellList = $Lottery.find('.lottery-cell-list'),
                $BonusCells = $BonusCellList.find('.cell'),
                $LuckBtn = $Lottery.find('.btn-get-my-luck'),

                cell_map = getCellMap(),
                bonus_show_handler = {
                    0 : __drawSingleLineText, // 单行文字输出（如：谢谢参与）
                    1 : __drawCoupon, // 优惠券
                    2 : __drawPrizeStaff, // 实物奖品
                    3 : __drawRedPackage, // 现金红包
                    4 : __drawMultiLineText // 现金红包
                },
                // 奖品集合
                bonus_set = [
                    {
                        'id' : '0',
                        'multiText': [
                            //'和产品经理',
                            //'共进晚餐'
                            '谢谢参与'
                        ],
                        'pos' : [],
                        'type' : 4
                    },
                    {
                        'id' : '1',
                        'name' : '蓝牙耳机',
                        'pos' : [0, 700, 164, 120],
                        'type' : 2
                    },
                    {
                        'id' : '2',
                        'name' : '满500减20元',
                        'discount': '20',
                        'pos' : [0, 0, 164, 120],
                        'type' : 1
                    },
                    {
                        'id' : '3',
                        'name' : '充电宝',
                        'pos' : [0, 270, 164, 120],
                        'type' : 2
                    },
                    {
                        'id' : '4',
                        'name' : '满3000减151元',
                        'discount': '151',
                        'pos' : [0, 0, 164, 120],
                        'type' : 1
                    },
                    {
                        'id' : '5',
                        'name' : '中国红 iPhone7',
                        'pos' : [0, 135, 164, 120],
                        'type' : 2
                    },
                    {
                        'id' : '6',
                        'name' : 'GO Pro 运动摄像机',
                        'pos' : [0, 410, 164, 120],
                        'type' : 2
                    },
                    {
                        'id' : '7',
                        'name' : '满1000减51元',
                        'discount': '51',
                        'pos' : [0, 0, 164, 120],
                        'type' : 1
                    },
                    {
                        'id' : '8',
                        'name' : '满4000减201元',
                        'discount': '201',
                        'pos' : [0, 0, 164, 120],
                        'type' : 1
                    },
                    {
                        'id' : '9',
                        'name' : '满2000减101元',
                        'discount': '101',
                        'pos' : [0, 0, 164, 120],
                        'type' : 1
                    }
                ],

                // roll选项
                roll_options = {
                    // 转动动画
                    easing : easeOutQuad,
                    // 转动周期
                    duration : 6000,
                    // 转动总圈数
                    turns: 8,

                    // 开始值（任意自然数，一般是开始的奖品id）
                    start: 0,

                    // 奖品数量
                    bonus_count : bonus_set.length
                }

            function init(){

                // 绘制奖励图
                drawBonusMap($BonusCanvas[0 ])
                // 绑定事件
                bindEvent()
            }
            init()

            var canvasData = {
                x: 0,
                y: 0,
                w: 650,
                h: 351,
                text_font_size : 18,
                text_font_family : 'sans-serif',//Microsoft YaHei
                text_width : '',
                fill_x : '',
                fill_y : ''
            }
            // 绘制奖励图
            function drawBonusMap(canvas_dom){
                if (!canvas_dom.getContext){
                    return
                }
                tcb.imageOnload ('https://p2.ssl.qhmsg.com/t0128e42be5dce5321f.png', function (img) {

                    var
                        ctx = canvas_dom.getContext ('2d')

                    //在给定矩形内清空一个矩形
                    ctx.clearRect (canvasData.x, canvasData.y, canvasData.w, canvasData.h)

                    //strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式
                    ctx.strokeStyle = "#666";

                    ctx.textBaseline = 'bottom'

                    for (var i = 0; i < bonus_set.length; i++) {
                        // 遍历奖励列表，绘制奖品图案

                        typeof bonus_show_handler[ bonus_set[ i ][ 'type' ] ] === 'function'
                        && bonus_show_handler[ bonus_set[ i ][ 'type' ] ] (ctx, img, bonus_set[ i ])
                    }

                })
            }

            // 单行文字
            function __drawSingleLineText(ctx, img, the_bonus){
                var the_bonus_rect = getBonusRect(the_bonus['id'])

                ctx.fillStyle = "#cf1e24"

                canvasData.text_font_size = 32
                ctx.font = canvasData.text_font_size+'px '+canvasData.text_font_family

                var text_width = ctx.measureText (the_bonus[ 'name' ])[ 'width' ],
                    fill_x = the_bonus_rect[ 'left' ] + (the_bonus_rect[ 'width' ] - text_width) / 2,
                    fill_y = the_bonus_rect[ 'top' ] + (the_bonus_rect[ 'height' ] + canvasData.text_font_size) / 2

                // 写文本内容
                ctx.fillText(the_bonus['name'], fill_x, fill_y)
            }
            // 多行文字
            function __drawMultiLineText(ctx, img, the_bonus){
                var multiText = the_bonus['multiText' ],
                    line = multiText.length,
                    the_bonus_rect = getBonusRect(the_bonus['id'])

                ctx.fillStyle = "#cf1e24"

                canvasData.text_font_size = 30
                ctx.font = canvasData.text_font_size+'px '+canvasData.text_font_family

                var text_width, fill_x, fill_y,
                    text_padding = 3,
                    y_start = 6+the_bonus_rect[ 'top' ] + (the_bonus_rect[ 'height' ]-line * (canvasData.text_font_size + text_padding) + text_padding)/2 + canvasData.text_font_size

                for (var i = 0; i < line; i++) {
                    text_width = ctx.measureText (multiText[i])[ 'width' ]
                    fill_x = the_bonus_rect[ 'left' ] + (the_bonus_rect[ 'width' ] - text_width) / 2
                    fill_y = y_start + i * (canvasData.text_font_size + text_padding)

                    // 写文本内容
                    ctx.fillText (multiText[i], fill_x, fill_y)
                }
            }
            // 优惠券
            function __drawCoupon(ctx, img, the_bonus){
                var the_bonus_rect = getBonusRect(the_bonus['id'])

                // 设置画布文字颜色
                ctx.fillStyle = "#666"

                //font 属性设置或返回画布上文本内容的当前字体属性
                canvasData.text_font_size = 18
                ctx.font = canvasData.text_font_size+'px '+canvasData.text_font_family

                var text_width = ctx.measureText (the_bonus[ 'name' ])[ 'width' ],
                    fill_x = the_bonus_rect[ 'left' ] + (the_bonus_rect[ 'width' ] - text_width) / 2,
                    fill_y = the_bonus_rect[ 'top' ] + the_bonus_rect[ 'height' ] - 5
                // 写奖品名称
                ctx.fillText(the_bonus['name'], fill_x, fill_y)

                // 画奖品图
                if (the_bonus['pos']&&the_bonus['pos' ].length){

                    ctx.drawImage (img,
                        the_bonus[ 'pos' ][ 0 ],
                        the_bonus[ 'pos' ][ 1 ],
                        the_bonus[ 'pos' ][ 2 ],
                        the_bonus[ 'pos' ][ 3 ],
                        the_bonus_rect[ 'left' ],
                        the_bonus_rect[ 'top' ]-5,
                        the_bonus_rect[ 'width' ],
                        the_bonus[ 'pos' ][ 3 ] * (the_bonus_rect[ 'width' ] / the_bonus[ 'pos' ][ 2 ])
                    )
                }

                // 绘奖券
                if (the_bonus['discount']){
                    ctx.fillStyle = "#cf1e24";

                    // 绘制钱币符号
                    ctx.font = '18px '+canvasData.text_font_family;
                    ctx.fillText('¥', the_bonus_rect[ 'left' ]+48, the_bonus_rect[ 'top' ]+35)

                    // 绘制优惠金额
                    ctx.font = '34px '+canvasData.text_font_family;
                    ctx.fillText(the_bonus['discount'], the_bonus_rect[ 'left' ]+60, the_bonus_rect[ 'top' ]+53)

                    // 绘制优惠券文案
                    ctx.font = '20px '+canvasData.text_font_family;
                    ctx.fillText('优惠券', the_bonus_rect[ 'left' ]+48, the_bonus_rect[ 'top' ]+72)
                }
            }
            // 实物奖品
            function __drawPrizeStaff(ctx, img, the_bonus){
                var the_bonus_rect = getBonusRect(the_bonus['id'])

                // 设置画布文字颜色
                ctx.fillStyle = "#666"

                //font 属性设置或返回画布上文本内容的当前字体属性
                canvasData.text_font_size = 18
                ctx.font = canvasData.text_font_size+'px '+canvasData.text_font_family

                var text_width = ctx.measureText (the_bonus[ 'name' ])[ 'width' ],
                    fill_x = the_bonus_rect[ 'left' ] + (the_bonus_rect[ 'width' ] - text_width) / 2,
                    fill_y = the_bonus_rect[ 'top' ] + the_bonus_rect[ 'height' ] - 5
                // 写奖品名称
                ctx.fillText(the_bonus['name'], fill_x, fill_y)

                // 画奖品图
                if (the_bonus['pos']&&the_bonus['pos' ].length){

                    ctx.drawImage (img,
                        the_bonus[ 'pos' ][ 0 ],
                        the_bonus[ 'pos' ][ 1 ],
                        the_bonus[ 'pos' ][ 2 ],
                        the_bonus[ 'pos' ][ 3 ],
                        the_bonus_rect[ 'left' ],
                        the_bonus_rect[ 'top' ]-5,
                        the_bonus_rect[ 'width' ],
                        the_bonus[ 'pos' ][ 3 ] * (the_bonus_rect[ 'width' ] / the_bonus[ 'pos' ][ 2 ])
                    )
                }
            }
            // 现金红包
            function __drawRedPackage(ctx, img, the_bonus){
                var the_bonus_rect = getBonusRect(the_bonus['id'])

                // 设置画布文字颜色
                ctx.fillStyle = "#666"

                //font 属性设置或返回画布上文本内容的当前字体属性
                canvasData.text_font_size = 18
                ctx.font = canvasData.text_font_size+'px '+canvasData.text_font_family

                var text_width = ctx.measureText (the_bonus[ 'name' ])[ 'width' ],
                    fill_x = the_bonus_rect[ 'left' ] + (the_bonus_rect[ 'width' ] - text_width) / 2,
                    fill_y = the_bonus_rect[ 'top' ] + the_bonus_rect[ 'height' ] - 5
                // 写奖品名称
                ctx.fillText(the_bonus['name'], fill_x, fill_y)

                // 画奖品图（红包没有奖品图）
                if (the_bonus['pos']&&the_bonus['pos' ].length){

                    ctx.drawImage (img,
                        the_bonus[ 'pos' ][ 0 ],
                        the_bonus[ 'pos' ][ 1 ],
                        the_bonus[ 'pos' ][ 2 ],
                        the_bonus[ 'pos' ][ 3 ],
                        the_bonus_rect[ 'left' ],
                        the_bonus_rect[ 'top' ]-5,
                        the_bonus_rect[ 'width' ],
                        the_bonus[ 'pos' ][ 3 ] * (the_bonus_rect[ 'width' ] / the_bonus[ 'pos' ][ 2 ])
                    )
                }

                // 绘制现金红包
                if (the_bonus['redPackage']){
                    ctx.fillStyle = "#cf1e24";

                    // 绘制钱币符号
                    ctx.font = '18px '+canvasData.text_font_family;
                    ctx.fillText('¥', the_bonus_rect[ 'left' ]+36, the_bonus_rect[ 'top' ]+36)

                    // 绘制优惠金额
                    ctx.font = '38px '+canvasData.text_font_family;
                    ctx.fillText(the_bonus['redPackage'], the_bonus_rect[ 'left' ]+48, the_bonus_rect[ 'top' ]+58)

                    // 绘制优惠券文案
                    ctx.font = '18px '+canvasData.text_font_family;
                    ctx.fillText('现金红包', the_bonus_rect[ 'left' ]+40, the_bonus_rect[ 'top' ]+78)
                }
            }

            // 获取奖励格映射
            function getCellMap(){
                var
                    cell_map = []

                tcb.each($BonusCells, function(i, el){
                    var
                        $el = $(el),
                        data_id = $el.attr('data-id')
                    if (data_id!==''){
                        cell_map [parseInt(data_id, 10)||0] = $el
                    }
                })

                return cell_map
            }

            // 根据奖励id,获取奖励在图上的位置
            function getBonusRect(bonus_id){
                var
                    $cell = $BonusCells.filter('[data-id="'+bonus_id+'"]'),
                    cells_offset = $BonusCellList.offset(),
                    cell_offset = $cell.offset()

                var
                    top = cell_offset['top'] - cells_offset['top' ],
                    left = cell_offset['left'] - cells_offset['left' ],
                    width = $cell.width(),
                    height = $cell.height(),
                    screen_w = $(window).width(),
                    ratio = 720/screen_w

                // 当ratio小于1时，表示当前屏幕尺寸大于720px，那么ratio当做1来算，无比例缩放
                ratio = ratio < 1 ? 1 : ratio

                return {
                    top    : top * ratio,
                    left   : left * ratio,
                    width  : width * ratio,
                    height : height * ratio
                }
            }

            // 绑定事件
            function bindEvent(){

                // 点击抽奖
                $LuckBtn.on('click', function(e){
                    e.preventDefault()

                    if ($LuckBtn.hasClass('disabled')){
                        return
                    }

                    if (roll_count<1){
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

                    $LuckBtn.addClass('disabled')

                    // 抽奖
                    rollBonusAtRemote(function(res){

                        var
                            bonus_id = parseInt(res['result']['prize_id'], 10) //parseInt(Math.random()*10, 10)

                        rollBonus(bonus_id, function(temp_bonus_id){

                            $BonusCells.removeClass ('cur')
                            cell_map[ temp_bonus_id ].addClass ('cur')

                        }, function(){
                            roll_count--

                            var
                                the_bonus = bonus_set[bonus_id],
                                the_bonus_name = the_bonus['name']

                            if (bonus_id){
                                // 中奖id大于0，表示有中奖

                                showBingoPanel(the_bonus_name, res['result']['desc'] || '')
                            }

                            $LuckBtn.removeClass('disabled')
                        })

                    }, function(res){

                        if (res['errno']){

                            $LuckBtn.removeClass('disabled')
                        }
                    })

                })
            }

            // 从服务器roll奖品
            function rollBonusAtRemote(success, done){
                var
                    params = {}

                if (has_share){
                    // 已分享朋友圈

                    params['share'] = 1
                }

                $.post('/youpin/doLotteryForErhuo', params, function (res) {

                    res = $.parseJSON(res)

                    if (!res['errno']){
                        typeof success==='function' && success(res)
                    } else {
                        if (res['errno']==10710){
                            // 未登录，弹出登录框，提示登录

                            showLoginPanel()

                        } else {

                            $.dialog.toast(res['errmsg'], 2000)
                        }
                    }
                    typeof done==='function' && done(res)
                })
            }

            // 转取奖品
            function rollBonus(bonus_id, callback, done){
                var
                    options = roll_options,

                    timer_start = 0,
                    // 时钟速度
                    timer_speed = 10,

                    // 奖品总数
                    bonus_count = options.bonus_count,

                    // 奖品总数
                    easing = typeof options.easing === 'function' ? options.easing : easeOutQuad,

                    // 转动开始位置
                    start = options.start,
                    // 转动周期
                    duration = options.duration,
                    // 总圈数
                    turns = options.turns,

                    // 基于start的增量值
                    increment = bonus_count*turns

                // 加上目标id，和起始位置奖品id的差值（可能正，也可能负），计算出最终位置
                increment = Math.round( increment + (bonus_id - start % bonus_count) )

                // 更新起始位置，为下一轮抽奖做准备。。
                options.start += increment

                setTimeout (function r_fn () {

                    var
                        current_value = easing (timer_start, start, increment, duration)

                    // 取整
                    current_value = Math.round (current_value)

                    // 取余，获取当前定位的bonus的id
                    var
                        temp_bonus_id = current_value % bonus_count

                    typeof callback === 'function' && callback(temp_bonus_id)

                    timer_start += timer_speed

                    if (timer_start < duration) {
                        setTimeout (r_fn, timer_speed)
                    } else {
                        typeof done === 'function' && done(temp_bonus_id)
                    }

                }, timer_speed)
            }

            // roll动画函数
            // t：currentIteration,
            // b：startValue,
            // c：changeInValue,
            // d：totalIterations
            function easeOutQuad(t, b, c, d) {
                return -c *(t/=d)*(t-2) + b;
            }

        }()


        //====================================
        // 显示登录面板
        function showLoginPanel () {

            var
                html_fn = $.tmpl (tcb.trim ($ ('#JsMSummerVacationLoginPanel').html ())),
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

                        $('.block-lottery .btn-get-my-luck').trigger('click')

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

                getSMSCode (
                    {
                        'user_mobile' : $.trim ($mobile.val ()),
                        'secode'      : $.trim ($secode.val ())
                    },
                    function (data) {
                        $me.addClass ('btn-get-sms-code-disabled').html ('发送成功')
                        setTimeout (function () {

                            $me.html ('60秒后再次发送')

                            tcb.distimeAnim (60, function (time) {
                                if (time <= 0) {
                                    $me.removeClass ('btn-get-sms-code-disabled').html ('发送验证码')
                                } else {
                                    $me.html (time + '秒后再次发送')
                                }
                            })

                        }, 1000)
                    },
                    function () {

                        $form.find ('.vcode-img').click ()
                    }
                )
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
                        typeof error === 'function' && error ()

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
                html_fn = $.tmpl (tcb.trim ($ ('#JsMSummerVacationBingoPanel').html ())),
                html_st = html_fn ({
                    bonus_name : bonus_name,
                    desc : desc,
                    show_btn: (has_share && roll_count<1) ? false : true
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
            $wrap.find('.btn').on('click', function(e){
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
                html_fn = $.tmpl (tcb.trim ($ ('#JsMSummerVacationRollEmptyPanel').html ())),
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
                        html_st += '<div class="item"><!--<span>●</span>-->'+res['result'][i]+'</div>'
                    }

                    var
                        $list = $('.block-lottery-bingo-list'),
                        $inner = $list.find('.inner')

                    $inner.html(html_st)

                    var
                        h = $inner.find('.item').eq(0).height()

                    setTimeout(function(){
                        var arg = arguments;
                        $inner.animate({'top': -h}, 300, function(){
                            $inner.find('.item').eq(0).appendTo($inner)

                            $inner.css({'top': 0})

                            setTimeout(arg.callee, 2000)
                        })
                    }, 2000)

                }
            })
        }
        getLotteryTopList()


    })

} ()