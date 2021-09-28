;/**import from `/resource/js/component/m/scroll.js` **/
!function (global) {
    var
        Root = tcb.getRoot (),
        noop = tcb.noop,
        scroll = {}
    var
        s = {
            inst                : null,
            callback            : noop,
            // 设置元素的translate和zoom，若不支持translate，使用margin替代
            setTranslateAndZoom : tcb.setTranslateAndZoom
        }

    // 添加到根作用域
    tcb.addToRoot ('scroll', scroll)

    tcb.mix (scroll, {
        getDoc : tcb.getDoc,
        getWin : tcb.getWin,
        $Win   : null,
        $Doc   : null,

        $Container : null,
        $Inner     : null,

        getContainer : function () {return this.$Container},

        getInner : function () {
            if (!(this.$Inner && this.$Inner.length)) {
                return console.error ('请先设置scroll的inner页面')
            }
            return this.$Inner
        },
        setInner : function ($Inner) {return this.$Inner = $Inner},

        getInst    : getInst,
        setRunning : setRunning,

        setPosition   : setPosition,
        setDimensions : setDimensions,

        init : init

    })
    // 获取实例
    function getInst (options) {
        var inst = s.inst

        if (inst) { return inst }

        // 生成一个scroll实例
        inst = new Scroll (function (left, top, zoom) {
            // 此函数在滚动过程中实时执行，需要注意处理效率

            typeof s.callback === 'function' && s.callback (left, top, zoom)
        }, options)

        return s.inst = inst
    }

    function setRunning (callback) {
        var
            $Inner = scroll.getInner ()

        s.callback = function (left, top, zoom) {

            if (typeof callback === 'function') {

                callback (left, top, zoom, $Inner, s.setTranslateAndZoom)
            }
        }
    }

    function setPosition (left, top) {
        var
            inst = scroll.getInst ()

        left = left || 0
        top = top || 0

        inst.setPosition (left, top)
    }

    function setDimensions (main_width, main_height, inner_width, inner_height) {
        var
            $Container = scroll.getContainer (),
            $Inner = scroll.getInner (),
            inst = scroll.getInst ()

        main_width = main_width || $Container.width ()
        main_height = main_height || $Container.height ()
        inner_width = inner_width || Math.max ($Inner.width (), main_width)
        inner_height = inner_height || Math.max ($Inner.height (), main_height)

        // 设置容器尺寸
        inst.setDimensions (main_width, main_height, inner_width, inner_height)
    }

    function init ($Container, options) {
        if (!($Container && $Container.length)) {

            return
        }

        scroll.$Doc = scroll.getDoc ()
        scroll.$Win = scroll.getWin ()
        scroll.$Container = $Container

        options = options || {
            // 禁止横向滚动
            scrollingX : true,
            // 不要回弹
            bouncing   : false
        }

        var inst = scroll.getInst (options)

        __bindEvent ()

        return inst
    }

    // =================================================================
    // 私有接口 private
    // =================================================================

    // 绑定事件
    function __bindEvent () {
        var
            $Doc = scroll.getDoc (),
            $Container = scroll.getContainer (),
            inst = scroll.getInst (),
            // 用来标识在Container中的滑动
            flag = false

        if ('ontouchstart' in window) {
            // 绑定滚动事件
            $Container.on ('touchstart', function (e) {
                //// 滑动开始点位在表单元素上，直接返回，不执行滑动操作
                //if (e.target.tagName.match (/input|textarea|select/i)) {
                //    return
                //}

                // flag设置为true表示滑动开始
                flag = true

                // 滑动开始
                inst.doTouchStart (e.touches, e.timeStamp)

            })

            $Doc.on ('touchmove', function (e) {
                if (flag){
                    e.preventDefault ()

                    // 滑动ing
                    inst.doTouchMove (e.touches, e.timeStamp)
                }
            }, {passive : false})

            $Doc.on ('touchend', function (e) {
                if (flag){
                    // 滑动完成
                    inst.doTouchEnd (e.timeStamp)
                    // flag重置为false，表示滑动结束
                    flag = false
                }
            })
            $Doc.on ('touchcancel', function (e) {
                if (flag){
                    // 滑动完成
                    inst.doTouchEnd (e.timeStamp)
                    // flag重置为false，表示滑动结束
                    flag = false
                }
            })
        } else {
            function __clickPreventDefault(e){
                e.preventDefault()
            }
            var flag_mousemoveing = false,
                start_time = 0,
                start_y = 0,
                counter_mousemoveing = 0,
                $targetItem = null
            // 绑定滚动事件
            $Container.on ('mousedown', function (e) {

                // flag设置为true表示滑动开始
                flag = true

                // 滑动开始
                inst.doTouchStart ([ { pageX : e.pageX, pageY : e.pageY } ], e.timeStamp)
                // 设置滑动起始时间、点
                start_time = e.timeStamp
                start_y = e.pageY
                $targetItem = $(e.target).closest('a')
            })

            $Doc.on ('mousemove', function (e) {
                if (flag) {
                    e.preventDefault ()

                    // 滑动ing
                    inst.doTouchMove ([ { pageX : e.pageX, pageY : e.pageY } ], e.timeStamp)

                    if (!flag_mousemoveing && !counter_mousemoveing) {
                        $Container.on ('click', __clickPreventDefault)
                    }

                    if (counter_mousemoveing > 2) {
                        if ((e.timeStamp - start_time) > 6 && Math.abs (e.pageY - start_y) > 2) {
                            flag_mousemoveing = true
                        } else {
                            $Container.off ('click', __clickPreventDefault)
                            $targetItem && $targetItem.length && $targetItem.trigger('click')
                        }
                    } else {
                        // counter_mousemoveing还是0的时候执行timeout
                        !counter_mousemoveing && setTimeout (function () {
                            if (counter_mousemoveing < 3) {// 移动事件执行次数小于3次，那么表示没移动！
                                $Container.off ('click', __clickPreventDefault)
                                $targetItem && $targetItem.length && $targetItem.trigger('click')
                            }
                        }, 200)
                    }

                    counter_mousemoveing++
                    if (counter_mousemoveing>99){
                        counter_mousemoveing = 3
                    }
                }
            })

            $Doc.on ('mouseup', function (e) {
                if (flag){
                    // 滑动完成
                    inst.doTouchEnd (e.timeStamp)
                    // flag重置为false，表示滑动结束
                    flag = false
                    flag_mousemoveing = false
                    start_time = 0
                    start_y = 0
                    counter_mousemoveing = 0

                    setTimeout(function(){
                        $Container.off('click', __clickPreventDefault)
                    }, 500)
                }

            })
        }
    }


} (this)

;/**import from `/resource/js/mobile/special/2017/06/618.js` **/
;
!function () {
    var // 是否分享
        has_share = false,
        // 抽奖次数
        roll_count = 1,

        wxData = {
            "title"   : '618尖叫狂欢开始，手快者得！',
            "desc"    : '尖叫大促，领券再省150元！苹果/三星/华为/小米/oppo/vivo/魅族/美图爆品专场，天天爆品，不止5折！',
            "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
            "imgUrl"  : 'https://p2.ssl.qhmsg.com/t01c33e522b3e4e8332.png',
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

    $ (function () {
        // 设置滚动
        function setDateScroll() {
            var inst = new Scroll(function (left, top, zoom) {
                    // 此函数在滚动过程中实时执行，需要注意处理效率

                    __defaultAnimate(left, top, zoom, $BlockTabListInner, tcb.setTranslateAndZoom)
                }, {
                    scrollingY: false,
                    bouncing: false,
                    snapping: false
                }),
                $BlockTabList = $('.block-date-line'),
                $BlockTabListInner = $BlockTabList.find('.block-date-line-inner'),
                $SelectedItem = $BlockTabList.find('.date-item-cur'),
                blockTabList_offset = $BlockTabList.offset(),
                blockTabListInner_offset = $BlockTabListInner.offset(),
                selectedItem_offset = $SelectedItem.offset(),
                $Doc = tcb.getDoc(),
                // 用来标识在Container中的滑动
                flag = false

            inst.setDimensions ($BlockTabList.width(), $BlockTabList.height(), $BlockTabListInner.width(), $BlockTabListInner.height())

            inst.scrollTo(selectedItem_offset.left-blockTabListInner_offset.left - (blockTabList_offset.width - selectedItem_offset.width)/2, 0, true)

            // 绑定滚动事件
            $BlockTabList.on('touchstart', function (e) {

                // flag设置为true表示滑动开始
                flag = true
                // 滑动开始
                inst.doTouchStart(e.touches, e.timeStamp)
            })

            $Doc.on('touchmove', function (e) {
                if (flag) {
                    e.preventDefault()

                    // 滑动ing
                    inst.doTouchMove(e.touches, e.timeStamp)
                }
            }, {passive : false})

            $Doc.on('touchend', function (e) {

                // 滑动ing
                inst.doTouchEnd(e.timeStamp)
                // flag重置为false，表示滑动结束
                flag = false
            })

            return inst
        }

        // 默认滚动函数
        function __defaultAnimate(left, top, zoom, $el, setTranslateAndZoom) {
            setTranslateAndZoom($el[0], left, top, zoom)
        }

        var dateScrollInst = setDateScroll()

        tcb.bindEvent({
            // 切换活动日期
            '.date-item': function(e){
                e.preventDefault()

                var $me = $(this),
                    index = $me.index()

                $me.addClass('date-item-cur').siblings('.date-item-cur').removeClass('date-item-cur')

                var $BlockTabList = $('.block-date-line'),
                    $BlockTabListInner = $BlockTabList.find('.block-date-line-inner'),
                    $SelectedItem = $me,
                    blockTabList_offset = $BlockTabList.offset(),
                    blockTabListInner_offset = $BlockTabListInner.offset(),
                    selectedItem_offset = $SelectedItem.offset()

                dateScrollInst.scrollTo(selectedItem_offset.left-blockTabListInner_offset.left - (blockTabList_offset.width - selectedItem_offset.width)/2, 0, true)

                // 输出品牌疯抢
                renderCrazySale(index)
            },
            // 点击商品
            '.js-crazy-sale-product-list .p-item a': function(e){
                var $me = $(this),
                    $disabled = $me.closest('.product-list-disabled')

                if ($disabled.length){
                    return e.preventDefault()
                }
            }
        })

        // 输出品牌疯抢
        function renderCrazySale (index) {

            var $CrazySaleList = $ (".js-crazy-sale-product-list"),
                $tpl = $ ('#JsMHD618CrazySale'),
                model_list = window.__MODEL_LIST

            // 选中的是最后一天
            if (index === model_list.length) {
                if (index == window.__ACTIVE_INDEX) {
                    var $FlashList = $ (".js-flash-product-list")
                    $FlashList.show ()
                    $CrazySaleList.hide ()

                    //今日秒杀
                    window.Bang.renderProductList ({
                        $target        : $FlashList,
                        $tpl           : $ ('#JsMFlashProductListVer1720Tpl'),
                        request_url    : '/youpin/doGetFlashSaleGoods',
                        request_params : {
                            page_size : 4
                        },
                        list_key       : 'flash_list',
                        list_params    : window.__PARAMS,
                        col            : 2,
                        complete       : function (result, $target) {}
                    })
                } else {
                    $CrazySaleList.hide ()
                    $ ('.block-crazy-sale-notice').show ()
                }
            } else {
                model_list = model_list[ index ] || model_list[ 0 ]

                var html_fn = $.tmpl ($.trim ($tpl.html ())),
                    html_st = html_fn ({
                        good_list : model_list
                    })

                $ ('.block-crazy-sale-notice').hide ()
                $ (".js-flash-product-list").hide ()
                $CrazySaleList.show ()
                $CrazySaleList.removeClass ('product-list-disabled').html (html_st)

                if (index > window.__ACTIVE_INDEX) {
                    $CrazySaleList.addClass ('product-list-disabled')
                } else if (index == window.__ACTIVE_INDEX) {
                    countDown ($CrazySaleList.find ('.countdown'), model_list)
                }
            }
        }

        renderCrazySale(window.__ACTIVE_INDEX)

        //倒计时
        function countDown ($countdown) {

            $countdown.each(function(){
                var $me = $(this)

                var start_time= Date.now () + window.__TIME_PADDING,

                    nextDayObj = new Date(start_time+24*60*60*1000),
                    next_day_year = nextDayObj.getFullYear(),
                    next_day_month = nextDayObj.getMonth()+1,
                    next_day_day = nextDayObj.getDate(),
                    end_time = new Date (next_day_year+'/'+next_day_month+'/'+next_day_day).getTime ()

                Bang.startCountdown (end_time, start_time, $me, {
                    'end' : function () {}
                })
            })
        }

        ////今日秒杀
        //window.Bang.renderProductList({
        //    $target : $ (".js-flash-product-list"),
        //    $tpl : $('#JsMFlashProductListVer1720Tpl'),
        //    request_url : '/youpin/doGetFlashSaleGoods',
        //    request_params : {
        //        page_size : 4
        //    },
        //    list_key: 'flash_list',
        //    list_params: {
        //        from : 'duanwujie'
        //    },
        //    col : 4,
        //    complete: function(result, $target){}
        //})

        //苹果专区
        window.Bang.renderProductList({
            $target : $ (".js-ios-product-list"),
            $tpl : $('#JsMProductListVer1720Tpl'),
            request_url : '/youpin/doGetProductListByBrand?brand_id=2',
            request_params : {
                page_size : 8
            },
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })

        //安卓专区
        window.Bang.renderProductList({
            $target : $ (".js-android-product-list"),
            $tpl : $('#JsMProductListVer1720Tpl'),
            request_url : '/youpin/doGetAndroidList',
            request_params : {
                page_size : 8
            },
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })

        //分期免息
        window.Bang.renderProductList({
            $target : $ (".js-mianxi-product-list"),
            $tpl : $('#JsMProductListVer1720Tpl'),
            request_url : '/youpin/doGetMianxiList',
            request_params : {
                page_size : 8
            },
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })

        // 视频
        window.Bang.playVideo($('.trigger-play-video'))


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
                        'name' : '6.18元现金红包',
                        'redPackage': '6.18',
                        'pos' : [],
                        'type' : 3
                    },
                    {
                        'id' : '2',
                        'name' : '满500减30元',
                        'discount': '30',
                        'pos' : [0, 0, 164, 120],
                        'type' : 1
                    },
                    {
                        'id' : '3',
                        'name' : '苹果电脑 iMac',
                        'pos' : [0, 548, 164, 130],
                        'type' : 2
                    },
                    {
                        'id' : '4',
                        'name' : '蓝牙耳机',
                        'pos' : [0, 700, 164, 120],
                        'type' : 2
                    },
                    {
                        'id' : '5',
                        'name' : '61.8元现金红包',
                        'redPackage': '61.8',
                        'pos' : [],
                        'type' : 3
                    },
                    {
                        'id' : '6',
                        'name' : '1618元现金红包',
                        'redPackage': '1618',
                        'pos' : [],
                        'type' : 3
                    },
                    {
                        'id' : '7',
                        'name' : '满2000减150元',
                        'discount': '150',
                        'pos' : [0, 0, 164, 120],
                        'type' : 1
                    },
                    {
                        'id' : '8',
                        'name' : '中国红 iPhone7',
                        'pos' : [0, 135, 164, 120],
                        'type' : 2
                    },
                    {
                        'id' : '9',
                        'name' : '618元现金红包',
                        'redPackage': '618',
                        'pos' : [],
                        'type' : 3
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
                html_fn = $.tmpl (tcb.trim ($ ('#JsMErhuojie20170418LoginPanel').html ())),
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
                html_fn = $.tmpl (tcb.trim ($ ('#JsMErhuojie20170418BingoPanel').html ())),
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
                html_fn = $.tmpl (tcb.trim ($ ('#JsMErhuojie20170418RollEmptyPanel').html ())),
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
