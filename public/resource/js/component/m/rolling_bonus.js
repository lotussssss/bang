// 摇奖
!function () {
    var Bang = window.Bang = window.Bang || {}

    var defaults = {
        $wrap : null,
        rollUrl : '/youpin/doLotteryForErhuo',
        sourceImg: 'https://p2.ssl.qhmsg.com/t0128e42be5dce5321f.png',
        canvasData: {
            x: 0,
            y: 0,
            w: 650,
            h: 351
        },
        // 奖品集合
        bonusSet : __getBonusSet(),
        rollCount : 99,
        // roll选项
        rollOptions : {
            // 转动动画
            easing : easeOutQuad,
            // 转动周期
            duration : 6000,
            // 转动总圈数
            turns: 8,

            // 开始值（任意自然数，一般是开始的奖品id）
            start: 0
        },
        rollingCallback : __rollingCallback,
        rollingDone : __rollingDone,
        rollingAtRemoteSuccess : __rollingAtRemoteSuccess,
        rollingAtRemoteFail : __rollingAtRemoteFail,
        handlerDrawSingleLineText : __drawSingleLineText,
        handlerDrawMultiLineText : __drawMultiLineText,
        handlerDrawCoupon : __drawCoupon,
        handlerDrawPrizeStaff : __drawPrizeStaff,
        handlerDrawRedPackage : __drawRedPackage
    }

    // 摇奖
    function RollingBonus(options){
        var me = this

        options = $.extend ({}, defaults, options)

        me.options = options || {}
        me.options.$wrap = $(me.options.$wrap)

        if (!(me.options.$wrap && me.options.$wrap.length)) {
            return tcb.log('options.$wrap不是有效的dom节点')
        }

        me.init ()
    }

    // 设置原型方法
    RollingBonus.prototype = {
        constructor : RollingBonus,
        drawBonusMap : drawBonusMap,
        rollBonus : rollBonus,
        rollBonusAtRemote : rollBonusAtRemote,
        start: start,
        init : init
    }

    function init(){
        var me = this,
            options = me.options,
            $wrap = options.$wrap

        me.$wrap = $wrap
        me.$BonusCanvas = $wrap.find ('.canvas-lottery-bonus')
        me.$BonusCellList = $wrap.find ('.lottery-cell-list')
        me.$BonusCells = me.$BonusCellList.find ('.cell')
        me.$LuckBtn = $wrap.find ('.btn-get-my-luck')
        me.$CellMap = __getCellMap (me.$BonusCells)

        if (!(me.$BonusCanvas && me.$BonusCanvas.length)) {
            return tcb.warn ('$BonusCanvas不是有效的dom节点')
        }
        if (!(me.$BonusCellList && me.$BonusCellList.length)) {
            return tcb.warn ('$BonusCellList不是有效的dom节点')
        }
        if (!(me.$BonusCells && me.$BonusCells.length)) {
            return tcb.warn ('$BonusCells不是有效的dom节点')
        }
    }

    // 开始抽奖
    function start(params){
        var me = this,
            options = me.options

        if (options.rollCount < 1) {
            $.dialog.toast ('您已经没有抽奖次数了', 2000)
        }

        me.$LuckBtn.addClass('disabled')

        params = params || {}

        // 从服务器上获取抽奖结果，
        // 然后通过摇奖动画显示摇奖过程
        me.rollBonusAtRemote(params)
    }

    // 绘制奖励图
    function drawBonusMap(done){
        var me = this,
            options = me.options,
            bonusSet = options.bonusSet || [],
            canvasDom = me.$BonusCanvas[0]

        if (!canvasDom.getContext){
            return tcb.warn('您的浏览器可能不支持canvas')
        }
        tcb.imageOnload (options.sourceImg, function (img) {

            var ctx = canvasDom.getContext ('2d')

            me.CanvasContext = ctx
            me.ImgDom = img

            //在给定矩形内清空一个矩形
            ctx.clearRect (options.canvasData.x, options.canvasData.y, options.canvasData.w, options.canvasData.h)

            //strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式
            ctx.strokeStyle = "#666";

            ctx.textBaseline = 'bottom'

            for (var i = 0; i < bonusSet.length; i++) {
                // 遍历奖励列表，绘制奖品图案

                typeof options[ bonusSet[ i ][ 'handler' ] ] === 'function'
                    && options[ bonusSet[ i ][ 'handler' ] ] (me, bonusSet[ i ])
            }

            typeof done==='function' && done()
        })
    }

    // 转取奖品
    function rollBonus(bonus_id, res){
        var me = this,
            options = me.options,
            bonusSet = options.bonusSet || [],
            rollOptions = options.rollOptions || {},

            timer_start = 0,
            // 时钟速度
            timer_speed = 10,

            // 奖品总数
            bonus_count = bonusSet.length,

            // 奖品总数
            easing = typeof rollOptions.easing === 'function' ? rollOptions.easing : easeOutQuad,

            // 转动开始位置
            start = rollOptions.start,
            // 转动周期
            duration = rollOptions.duration,
            // 总圈数
            turns = rollOptions.turns,

            // 基于start的增量值
            increment = bonus_count*turns

        // 加上目标id，和起始位置奖品id的差值（可能正，也可能负），计算出最终位置
        increment = Math.round( increment + (bonus_id - start % bonus_count) )

        // 更新起始位置，为下一轮抽奖做准备。。
        rollOptions.start += increment

        setTimeout (function r_fn () {
            var current_value = easing (timer_start, start, increment, duration)

            // 取整
            current_value = Math.round (current_value)

            // 取余，获取当前定位的bonus的id
            var temp_bonus_id = current_value % bonus_count

            typeof options.rollingCallback === 'function' && options.rollingCallback(temp_bonus_id, me)

            timer_start += timer_speed

            if (timer_start < duration) {
                setTimeout (r_fn, timer_speed)
            } else {
                typeof options.rollingDone === 'function' && options.rollingDone (temp_bonus_id, bonus_id, res, me)
            }
        }, timer_speed)
    }

    // 从服务器roll奖品
    function rollBonusAtRemote(params){
        var me = this,
            options = me.options

        params = params || {}

        $.post (options.rollUrl, params, function (res) {

            res = $.parseJSON (res)

            if (!res[ 'errno' ]) {
                typeof options.rollingAtRemoteSuccess === 'function' && options.rollingAtRemoteSuccess (res, me)
            } else {
                typeof options.rollingAtRemoteFail === 'function' && options.rollingAtRemoteFail (res, me)
            }
        })
    }

    Bang.RollingBonus = function (options) {

        return new RollingBonus (options)
    }

    //================= private ===================

    // roll动画函数
    // t：currentIteration,
    // b：startValue,
    // c：changeInValue,
    // d：totalIterations
    function easeOutQuad(t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    }

    // 单行文字
    function __drawSingleLineText (rollingObj, the_bonus) {
        var ctx = rollingObj.CanvasContext,
            $BonusCells = rollingObj.$BonusCells,
            $BonusCellList = rollingObj.$BonusCellList,
            drawData = the_bonus.drawData || {}

        var the_bonus_rect = __getBonusRect (the_bonus[ 'id' ], $BonusCells, $BonusCellList)

        ctx.fillStyle = drawData.nameFillStyle
        ctx.font = drawData.nameFontSize + 'px ' + drawData.fontFamily

        var text_width = ctx.measureText (the_bonus[ 'name' ])[ 'width' ],
            fill_x = the_bonus_rect[ 'left' ] + (the_bonus_rect[ 'width' ] - text_width) / 2 + (drawData.nameOffsetX||0),
            fill_y = the_bonus_rect[ 'top' ] + (the_bonus_rect[ 'height' ] + drawData.nameFontSize) / 2 + (drawData.nameOffsetY||0)

        // 写文本内容
        ctx.fillText (the_bonus[ 'name' ], fill_x, fill_y)
    }
    // 多行文字
    function __drawMultiLineText (rollingObj, the_bonus) {
        var ctx = rollingObj.CanvasContext,
            $BonusCells = rollingObj.$BonusCells,
            $BonusCellList = rollingObj.$BonusCellList,
            drawData = the_bonus.drawData || {}

        var multiText = the_bonus[ 'multiText' ],
            line = multiText.length,
            the_bonus_rect = __getBonusRect (the_bonus[ 'id' ], $BonusCells, $BonusCellList)

        ctx.fillStyle = drawData.nameFillStyle

        ctx.font = drawData.nameFontSize + 'px ' + drawData.fontFamily

        var text_width, fill_x, fill_y,
            text_padding = 3,
            y_start = 6 + the_bonus_rect[ 'top' ] + (the_bonus_rect[ 'height' ] - line * (drawData.nameFontSize + text_padding) + text_padding) / 2 + drawData.nameFontSize

        for (var i = 0; i < line; i++) {
            text_width = ctx.measureText (multiText[ i ])[ 'width' ]
            fill_x = the_bonus_rect[ 'left' ] + (the_bonus_rect[ 'width' ] - text_width) / 2 + (drawData.nameOffsetX||0)
            fill_y = y_start + i * (drawData.nameFontSize + text_padding) + (drawData.nameOffsetY||0)

            // 写文本内容
            ctx.fillText (multiText[ i ], fill_x, fill_y)
        }
    }
    // 优惠券
    function __drawCoupon (rollingObj, the_bonus) {
        var ctx = rollingObj.CanvasContext,
            img = rollingObj.ImgDom,
            $BonusCells = rollingObj.$BonusCells,
            $BonusCellList = rollingObj.$BonusCellList,
            drawData = the_bonus.drawData || {}

        var the_bonus_rect = __getBonusRect (the_bonus[ 'id' ], $BonusCells, $BonusCellList)

        // 设置画布文字颜色
        ctx.fillStyle = drawData.nameFillStyle
        //font 属性设置或返回画布上文本内容的当前字体属性
        ctx.font = drawData.nameFontSize + 'px ' + drawData.fontFamily

        var text_width = ctx.measureText (the_bonus[ 'name' ])[ 'width' ],
            fill_x = the_bonus_rect[ 'left' ] + (the_bonus_rect[ 'width' ] - text_width) / 2 + (drawData.nameOffsetX||0),
            fill_y = the_bonus_rect[ 'top' ] + the_bonus_rect[ 'height' ] - 5 + (drawData.nameOffsetY||0)
        // 写奖品名称
        ctx.fillText (the_bonus[ 'name' ], fill_x, fill_y)

        // 画奖品图
        if (the_bonus[ 'pos' ] && the_bonus[ 'pos' ].length) {
            ctx.drawImage (img,
                the_bonus[ 'pos' ][ 0 ],
                the_bonus[ 'pos' ][ 1 ],
                the_bonus[ 'pos' ][ 2 ],
                the_bonus[ 'pos' ][ 3 ],
                the_bonus_rect[ 'left' ] + (drawData.imgOffsetX||0),
                the_bonus_rect[ 'top' ] + (drawData.imgOffsetY||0),
                the_bonus_rect[ 'width' ],
                the_bonus[ 'pos' ][ 3 ] * (the_bonus_rect[ 'width' ] / the_bonus[ 'pos' ][ 2 ])
            )
        }

        // 绘奖券
        if (the_bonus[ 'discount' ]) {
            ctx.fillStyle = drawData.couponFillStyle

            // 绘制钱币符号
            ctx.font = (drawData.couponFontSize-16)+'px ' + drawData.fontFamily
            ctx.fillText ('¥',
                the_bonus_rect[ 'left' ] + (drawData.symbolOffsetX||0),
                the_bonus_rect[ 'top' ] + (drawData.symbolOffsetY||0))

            // 绘制优惠金额
            ctx.font = drawData.couponFontSize+'px ' + drawData.fontFamily
            ctx.fillText (the_bonus[ 'discount' ],
                the_bonus_rect[ 'left' ] + (drawData.discountOffsetX||0),
                the_bonus_rect[ 'top' ] + (drawData.discountOffsetY||0))

            // 绘制优惠券文案
            ctx.font = (drawData.couponFontSize-14)+'px ' + drawData.fontFamily
            the_bonus[ 'discountText' ] = the_bonus[ 'discountText' ] || '优惠券'
            ctx.fillText (the_bonus[ 'discountText' ],
                the_bonus_rect[ 'left' ] + (drawData.discountTextOffsetX||0),
                the_bonus_rect[ 'top' ] + (drawData.discountTextOffsetY||0))
        }
    }
    // 实物奖品
    function __drawPrizeStaff(rollingObj, the_bonus){
        var ctx = rollingObj.CanvasContext,
            img = rollingObj.ImgDom,
            $BonusCells = rollingObj.$BonusCells,
            $BonusCellList = rollingObj.$BonusCellList,
            drawData = the_bonus.drawData || {}

        var the_bonus_rect = __getBonusRect (the_bonus[ 'id' ], $BonusCells, $BonusCellList)

        // 设置画布文字颜色
        ctx.fillStyle = drawData.nameFillStyle
        //font 属性设置或返回画布上文本内容的当前字体属性
        ctx.font = drawData.nameFontSize +'px '+ drawData.fontFamily

        var text_width = ctx.measureText (the_bonus[ 'name' ])[ 'width' ],
            fill_x = the_bonus_rect[ 'left' ] + (the_bonus_rect[ 'width' ] - text_width) / 2 + (drawData.nameOffsetX||0),
            fill_y = the_bonus_rect[ 'top' ] + the_bonus_rect[ 'height' ] + (drawData.nameOffsetY||0)
        // 写奖品名称
        ctx.fillText(the_bonus['name'], fill_x, fill_y)

        // 画奖品图
        if (the_bonus[ 'pos' ] && the_bonus[ 'pos' ].length) {
            ctx.drawImage (img,
                the_bonus[ 'pos' ][ 0 ],
                the_bonus[ 'pos' ][ 1 ],
                the_bonus[ 'pos' ][ 2 ],
                the_bonus[ 'pos' ][ 3 ],
                the_bonus_rect[ 'left' ] + (drawData.imgOffsetX||0),
                the_bonus_rect[ 'top' ] + (drawData.imgOffsetY||0),
                the_bonus_rect[ 'width' ],
                the_bonus[ 'pos' ][ 3 ] * (the_bonus_rect[ 'width' ] / the_bonus[ 'pos' ][ 2 ])
            )
        }
    }
    // 现金红包
    function __drawRedPackage(rollingObj, the_bonus){
        var ctx = rollingObj.CanvasContext,
            img = rollingObj.ImgDom,
            $BonusCells = rollingObj.$BonusCells,
            $BonusCellList = rollingObj.$BonusCellList,
            drawData = the_bonus.drawData || {}

        var the_bonus_rect = __getBonusRect (the_bonus[ 'id' ], $BonusCells, $BonusCellList)

        // 设置画布文字颜色
        ctx.fillStyle = drawData.nameFillStyle
        //font 属性设置或返回画布上文本内容的当前字体属性
        ctx.font = drawData.nameFontSize + 'px ' + drawData.fontFamily

        var text_width = ctx.measureText (the_bonus[ 'name' ])[ 'width' ],
            fill_x = the_bonus_rect[ 'left' ] + (the_bonus_rect[ 'width' ] - text_width) / 2 + (drawData.nameOffsetX||0),
            fill_y = the_bonus_rect[ 'top' ] + the_bonus_rect[ 'height' ] + (drawData.nameOffsetY||0)
        // 写奖品名称
        ctx.fillText(the_bonus['name'], fill_x, fill_y)

        // 画奖品图（红包没有奖品图）
        if (the_bonus[ 'pos' ] && the_bonus[ 'pos' ].length){

            ctx.drawImage (img,
                the_bonus[ 'pos' ][ 0 ],
                the_bonus[ 'pos' ][ 1 ],
                the_bonus[ 'pos' ][ 2 ],
                the_bonus[ 'pos' ][ 3 ],
                the_bonus_rect[ 'left' ] + (drawData.imgOffsetX||0),
                the_bonus_rect[ 'top' ] + (drawData.imgOffsetY||0),
                the_bonus_rect[ 'width' ],
                the_bonus[ 'pos' ][ 3 ] * (the_bonus_rect[ 'width' ] / the_bonus[ 'pos' ][ 2 ])
            )
        }

        // 绘制现金红包
        if (the_bonus['redPackageMoney']){
            ctx.fillStyle = drawData.redPackageFillStyle

            // 绘制钱币符号
            if (the_bonus['redPackageSymbol']){
                ctx.font = drawData.redPackageSymbolFontSize + 'px ' + drawData.fontFamily
                ctx.fillText (the_bonus[ 'redPackageSymbol' ],
                    the_bonus_rect[ 'left' ] + (drawData.symbolOffsetX || 0),
                    the_bonus_rect[ 'top' ] + (drawData.symbolOffsetY || 0))
            }

            // 绘制现金红包金额
            if (the_bonus['redPackageMoney']) {
                ctx.font = drawData.redPackageFontSize + 'px ' + drawData.fontFamily
                ctx.fillText (the_bonus[ 'redPackageMoney' ],
                    the_bonus_rect[ 'left' ] + (drawData.redPackageOffsetX || 0),
                    the_bonus_rect[ 'top' ] + (drawData.redPackageOffsetY || 0))
            }

            // 绘制优惠券文案
            if (the_bonus[ 'redPackageText' ]) {
                ctx.font = (drawData.redPackageFontSize - 20) + 'px ' + drawData.fontFamily
                ctx.fillText (the_bonus[ 'redPackageText' ],
                    the_bonus_rect[ 'left' ] + (drawData.redPackageTextOffsetX || 0),
                    the_bonus_rect[ 'top' ] + (drawData.redPackageTextOffsetY || 0)) // '现金红包' +40+78
            }
        }
    }

    // 根据奖励id,获取奖励在图上的位置
    function __getBonusRect(bonus_id, $BonusCells, $BonusCellList){
        var $cell = $BonusCells.filter('[data-id="'+bonus_id+'"]'),
            cells_offset = $BonusCellList.offset(),
            cell_offset = $cell.offset()

        var top = cell_offset['top'] - cells_offset['top' ],
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

    // 获取奖励格映射
    function __getCellMap($BonusCells){
        var cellMap = []

        tcb.each($BonusCells, function(i, el){
            var $el = $(el),
                data_id = $el.attr('data-id')
            if (data_id!==''){
                cellMap [parseInt(data_id, 10)||0] = $el
            }
        })

        return cellMap
    }

    // 摇奖ing
    function __rollingCallback(temp_bonus_id, rollingObj){
        rollingObj.$BonusCells.removeClass ('cur')
        rollingObj.$CellMap[ temp_bonus_id ].addClass ('cur')
    }
    // 摇奖结束
    function __rollingDone(temp_bonus_id, bonus_id, res, rollingObj){
        var options = rollingObj.options

        options.rollCount--

        var the_bonus = options.bonusSet[bonus_id],
            the_bonus_name = the_bonus['name']

        if (bonus_id){
            // 中奖id大于0，表示有中奖

            alert ('hehe，恭喜你中了' + the_bonus_name)
        }

        rollingObj.$LuckBtn.removeClass('disabled')
    }
    // 从服务器上摇奖成功
    function __rollingAtRemoteSuccess(res, rollingObj){
        var bonus_id = parseInt(res['result']['prize_id'], 10) //parseInt(Math.random()*10, 10)

        rollingObj.rollBonus(bonus_id, res)
    }
    // 从服务器上摇奖失败
    function __rollingAtRemoteFail(res, rollingObj){
        if (res['errno']){

            if (res['errno']==10710){
                // 未登录，弹出登录框，提示登录

                alert('未登录，弹出登录框，提示登录')
            } else {

                $.dialog.toast(res['errmsg'], 2000)
            }

            rollingObj.$LuckBtn.removeClass('disabled')
        }
    }

    function __getBonusSet(){
        return [
            //{
            //    'id' : '0',
            //    'name': '谢谢参与',
            //    'pos' : [],// 图案定位坐标
            //    // 绘制信息，handler对于的处理函数将会用到
            //    'drawData' : {
            //        nameFillStyle : '#cf1e24',
            //        nameFontSize : 32,
            //        fontFamily : 'sans-serif'
            //    },
            //    // 绘制单行文字
            //    'handler' : 'handlerDrawSingleLineText'
            //},
            {
                'id' : '0',
                'multiText': [ '谢谢参与' ],
                'pos' : [],// 图案定位坐标
                // 绘制信息，handler对于的处理函数将会用到
                'drawData' : {
                    nameFillStyle : '#cf1e24',
                    nameFontSize : 30,
                    fontFamily : 'sans-serif'
                },
                // 绘制多行文字
                'handler' : 'handlerDrawMultiLineText'
            },
            {
                'id' : '1',
                'name' : '蓝牙耳机',
                'pos' : [0, 700, 164, 120],
                'drawData' : {
                    nameFillStyle : '#666',
                    nameFontSize : 18,
                    fontFamily : 'sans-serif',

                    // 文字显示补偿位移坐标
                    nameOffsetX : 0,
                    nameOffsetY : -5,
                    // 图片显示补偿位移坐标
                    imgOffsetX : 0,
                    imgOffsetY : -5
                },
                // 绘制实物奖品
                'handler' : 'handlerDrawPrizeStaff'
            },
            //{
            //    'id' : '1',
            //    'name' : '6.18元现金红包',
            //    'redPackageSymbol': '￥',
            //    'redPackageMoney': '6.18',
            //    'redPackageText': '现金红包',
            //    'pos' : [],
            //    'drawData' : {
            //        nameFillStyle : '#666',
            //        nameFontSize : 18,
            //
            //        // 文字显示补偿位移坐标
            //        nameOffsetX : 0,
            //        nameOffsetY : -5,
            //        // 图片显示补偿位移坐标
            //        imgOffsetX : 0,
            //        imgOffsetY : -5,
            //        // 钱币符号显示补偿位移坐标
            //        symbolOffsetX : 36,
            //        symbolOffsetY : 36,
            //        // 红包金额显示补偿位移坐标
            //        redPackageOffsetX : 48,
            //        redPackageOffsetY : 58,
            //        // 红包金额文案显示补偿位移坐标
            //        redPackageTextOffsetX : 48,
            //        redPackageTextOffsetY : 58,
            //
            //        redPackageFillStyle : '#cf1e24',
            //        redPackageFontSize : 38,
            //        fontFamily : 'sans-serif'
            //    },
            //    // 现金红包
            //    'handler': 'handlerDrawRedPackage'
            //},
            {
                'id' : '2',
                'name' : '满500减20元',
                'discount': '20',
                'pos' : [0, 0, 164, 120],
                'discountText':'优惠券',//优惠金额文案
                'drawData' : {
                    nameFillStyle : '#666',
                    nameFontSize : 18,
                    couponFillStyle : '#cf1e24',
                    couponFontSize : 34,
                    fontFamily : 'sans-serif',

                    // 文字显示补偿位移坐标
                    nameOffsetX : 0,
                    nameOffsetY : -5,
                    // 图片显示补偿位移坐标
                    imgOffsetX : 0,
                    imgOffsetY : -5,
                    // 钱币符号显示补偿位移坐标
                    symbolOffsetX : 48,
                    symbolOffsetY : 35,
                    // 优惠金额显示补偿位移坐标
                    discountOffsetX : 60,
                    discountOffsetY : 53,
                    // 优惠金额文案显示补偿位移坐标
                    discountTextOffsetX : 48,
                    discountTextOffsetY : 72
                },
                // 绘制优惠券
                'handler' : 'handlerDrawCoupon'
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
        ]
    }

} ()