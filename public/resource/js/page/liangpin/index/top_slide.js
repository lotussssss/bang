;!function(){
    window.Bang = window.Bang || {}

    var
        //============ 选择器 ============
        // 滑动模块最外层容器
        selector_wrap = '.slide-shower-wrap',
        selector_inner = '.slide-inner',
        selector_list = '.slide-list',
        // 滑动单元块
        selector_item = '.slide-item',
        // 滑动导航标识点容器
        selector_nav = '.slide-ctrl',
        // 滑动导航标识点
        selector_nav_item = '.ctrl-item',
        // 向左
        selector_go_left = '.slide-go-left',
        // 向右
        selector_go_right = '.slide-go-right',


        //============ 元素类class ============
        class_nav_item = 'ctrl-item',
        class_nav_cur = 'ctrl-curr'

    // 简单的轮播
    function SimpleSlider(options){
        var
            defaults = {
                // 最外层容器
                container : '.block-slide',
                // 自动滑动的时间间隔，false or 数字
                auto      : false,
                // 开始位置
                start     : 0,
                // 滑动速度
                speed     : 300,
                // 显示nav
                nav_show  : true
            },
            me = this

        me.options = tcb.mix(defaults, options, true)
        me.options.auto = parseInt(me.options.auto, 10) || 0
        me.options.start = parseInt(me.options.start, 10) || 0
        me.options.speed = parseInt(me.options.speed, 10) || 300

        // item的宽度
        me.itemWidth = 0
        // item的数量
        me.itemCount = 0
        // 当前item的位置，从0开始
        me.itemPos = me.options.start
        // 滑动模块的最外层容器
        me.$container = W(me.options.container)

        me.autoHandler = null

        if (!(me.$container && me.$container.length)){
            return tcb.warn('找不到轮播容器：'+me.options.container)
        }

        me.init()
    }

    tcb.mix(SimpleSlider.prototype, {
        // 初始化
        init: function(){
            var
                me = this,
                options = me.options

            me.createNav()

            me.resize()

            me.bindEvent()

            if (options.auto){

                me.runAuto()
            }
        },
        // 执行滑动到指定的位置
        run : function(target_pos, run_force){
            var
                me = this,
                options = me.options

            clearTimeout(me.autoHandler)

            var
                $container = me.$container

            target_pos = typeof target_pos === 'undefined' ? +me.itemPos+1 : target_pos
            target_pos = (me.itemCount - target_pos < 1) ? 0 : target_pos

            if (target_pos==me.itemPos && !run_force){
                // 目标位置和当前位置相同，并且不强制滑动位置，那么不做任何处理
                return
            }

            $container.query (selector_inner).animate (
                { 'scrollLeft' : target_pos * me.itemWidth },
                options.speed,
                function () {
                    $container
                        .query(selector_nav_item)
                        .removeClass(class_nav_cur)
                        .item (target_pos).addClass (class_nav_cur)

                    me.itemPos = target_pos
                },
                QW.Easing.easeBoth)
        },
        // @ToDo 上翻下翻
        runNext: function(){},
        runPrev: function(){},
        // 自动滚动
        runAuto: function(){
            var
                me = this,
                options = me.options,
                auto = options.auto

            me.autoHandler = setTimeout(function runAuto(){

                me.run()

                me.autoHandler = setTimeout(runAuto, auto)
            }, auto)
        },
        // 设置适应的滑动尺寸
        resize: function(){
            var
                me = this,
                $container = me.$container,
                $inner = $container.query(selector_inner),
                $list = $container.query(selector_list),
                $items = $container.query(selector_item)

            me.itemWidth = $container.query(selector_inner).getSize().width
            me.itemCount = $items.length

            $list.css('width', me.itemWidth * me.itemCount)

            $items.css('width', me.itemWidth)

            $inner[0].scrollLeft = me.itemPos*me.itemWidth
        },
        // 创建nav，如果有必要的话
        createNav: function(){
            var
                me = this,
                $container = me.$container,
                $item = $container.query(selector_item),
                $nav = $container.query(selector_nav),
                $nav_item = $nav.query(selector_nav_item)

            if ($item && $nav_item && $item.length==$nav_item.length){
                // nav的数量和item一致，那么直接返回不作处理，
                // 否则重新生成nav让其和item数量保持一致

                return
            }

            var
                nav_item_html = ''
            for (var i = 0; i < $item.length; i++) {
                nav_item_html += i == this.options.start
                    ? '<span class="' + class_nav_item + ' ' + class_nav_cur + '" data-sn="' + i + '"></span>'
                    : '<span class="' + class_nav_item + '" data-sn="' + i + '"></span>';
            }
            $nav.html (nav_item_html)

            if (me.options.nav_show) {
                $nav.show ()
            } else {
                $nav.hide ()
            }
        },
        // 绑定相关事件
        bindEvent: function(){
            var
                me = this,
                $container = me.$container,
                options = me.options

            // 绑定nav item的点击事件
            $container.query(selector_nav_item).on('click', function(e){
                e.preventDefault()

                var
                    $me = W(this),
                    pos = +$me.attr('data-sn')

                me.run(pos)
            })

            // 移入停止自动滑动
            $container.on('mouseenter', function(e){

                clearTimeout(me.autoHandler)
            })
            // 移出后重新开始自动滑动
            $container.on('mouseleave', function(e){
                if(options.auto){
                    me.runAuto()
                }
            })
            // 页面尺寸变化
            W(window).on('resize', function(){
                me.resize()

                clearTimeout(me.autoHandler)

                if (options.auto){

                    me.runAuto()
                }
            })
        }

    })


    //====================== Export ========================
    window.Bang.SimpleSlider = SimpleSlider
}()