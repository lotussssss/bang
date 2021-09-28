// 品牌列表处理
!function (global) {
    var
        Root = tcb.getRoot (),
        i = Root.Index,
        __scrollY = true

    i.handle = i.handle || {}

    tcb.mix (i.handle, {

        initBrandScroll               : __initBrandScroll,
        getBrandScrollInst            : __getScrollInst,
        getBrandContainer             : __getContainer,
        getBrandInner                 : __getInner,
        setBrandScrollY               : setBrandScrollY,
        getBrandScrollY               : getBrandScrollY,
        resetBrandListScrollDimension : __setBrandListScrollDimension

    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    function setBrandScrollY(status) {
        __scrollY = !!status
    }
    function getBrandScrollY() {
        return !!__scrollY
    }

    // =================================================================
    // 私有接口 private
    // =================================================================

    var
        _Inst = null,
        _callback = null,
        $_Container = null,
        $_Inner = null

    // 初始化品牌列表的滚动
    function __initBrandScroll () {
        // 获取滚动实例
        __getScrollInst (__defaultAnimate, true)
        // 绑定品牌列表的事件
        __bindEvent ()
    }

    // 获取container
    function __getContainer () {

        if (!($_Container && $_Container.length)) {
            $_Container = $ ('#BlockBrandList')
        }

        return $_Container
    }

    // 获取inner
    function __getInner () {

        if (!($_Inner && $_Inner.length)) {
            $_Inner = __getContainer ().find ('.block-brand-list-inner')
        }

        return $_Inner
    }

    // 设置品牌列表的滚动尺寸
    function __setBrandListScrollDimension (clientWidth, clientHeight, contentWidth, contentHeight) {
        if ($ ('#BrandModelItemStyle').length){
            $ ('#BrandModelItemStyle').remove()
        }
        var
            inst = __getScrollInst (),

            $Container = __getContainer (),
            block_w = $Container.width (),
            block_h = $Container.height (),

            $Items = $Container.find ('.item'),
            $Item = $Items.eq (0),
            item_w = $Item.width (),
            item_h = $Item.height (),
            // item计算取整后的新高度
            item_new_h = item_h


        // 先根据默认设置的item高度，以及容器高度，
        // 获取跟默认高度最接近的显示的item数量的整数，
        // 由于新的item数量占满容器高度的时候，item的高度可能不为整数，
        // 为了避免非整数高度在某些浏览器不兼容，那么将新的item高度四舍五入成正整数，保持浏览器的兼容性，
        // 一切处理完成后再获取$Inner的高度，否则提前获取高度就会不准确
        if (!$ ('#BrandModelItemStyle').length) {
            var
                item_num_in_screen = block_h / item_h,
                item_num_in_screen_int = Math.round (item_num_in_screen)

            item_new_h = Math.round (block_h / item_num_in_screen_int)

            var
                style_css = '.block-model-list .item,.block-brand-list .item{height: ' + item_new_h + 'px;line-height: ' + item_new_h + 'px;}'
            $ ('<style id="BrandModelItemStyle" type="text/css"></style>').text (style_css).appendTo ('head');
        }

        var
            $Inner = __getInner (),
            inner_w = $Inner.width (),
            inner_h = $Inner.height ()

        clientWidth = typeof clientWidth != 'undefined' ? clientWidth : block_w
        clientHeight = typeof clientHeight != 'undefined' ? clientHeight : block_h
        contentWidth = typeof contentWidth != 'undefined' ? contentWidth : inner_w
        contentHeight = typeof contentHeight != 'undefined' ? contentHeight : inner_h

        inst.setSnapSize (item_w, item_new_h)
        inst.setDimensions (clientWidth, clientHeight, contentWidth, contentHeight)
    }

    // 获取滚动实例
    function __getScrollInst (animate_fn, flag_set_dimension) {

        if (_Inst) {

            if (typeof animate_fn === 'function') {
                // 设置滚动效果
                __setRunning (animate_fn)
            }

        } else {
            animate_fn = typeof animate_fn === 'function' ? animate_fn : __defaultAnimate

            _Inst = new Scroll (function (left, top, zoom) {
                // 此函数在滚动过程中实时执行，需要注意处理效率

                typeof _callback === 'function' && _callback (left, top, zoom)
            }, {
                snapping   : true,
                scrollingX : false,
                bouncing   : false
            })
            // 设置滚动效果
            __setRunning (animate_fn)
        }

        // 重置dimension
        if (flag_set_dimension) {
            __setBrandListScrollDimension ()
        }

        return _Inst
    }

    // 设置滚动的回调函数
    function __setRunning (callback) {
        var
            $Inner = __getInner ()

        _callback = function (left, top, zoom) {

            if (typeof callback === 'function') {

                callback (left, top, zoom, $Inner, tcb.setTranslateAndZoom)
            }
        }
    }

    // 默认滚动函数
    function __defaultAnimate (left, top, zoom, $el, setTranslateAndZoom) {

        setTranslateAndZoom ($el[ 0 ], left, top, zoom)
    }


    // 绑定事件
    function __bindEvent () {
        var
            $Doc = tcb.getDoc (),
            $Container = __getContainer (),

            inst = __getScrollInst (),
            // 用来标识在Container中的滑动
            flag = false

        if ('ontouchstart' in window) {
            // 绑定滚动事件
            $Container.on ('touchstart', function (e) {

                // flag设置为true表示滑动开始
                flag = true

                // 滑动开始
                inst.doTouchStart (e.touches, e.timeStamp)
            })

            $Doc.on ('touchmove', function (e) {
                if (!getBrandScrollY()){
                    return
                }
                if (flag) {
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
                if (!getBrandScrollY()){
                    return
                }
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

        var
            double_tap_last_time = Date.now (),
            $Items = $Container.find ('.item')

        // 品牌列表绑定事件
        $Items.on ({
            // 双击品牌刷新
            'doubleTap' : function (e) {
                var
                    now_time = Date.now ()
                if (now_time - double_tap_last_time < 2000) {
                    return
                }
                double_tap_last_time = now_time
                var
                    $me = $ (this),
                    url = $me.attr ('href')

                i.router_inst.trigger (true)
            }
        })
    }

} (this)