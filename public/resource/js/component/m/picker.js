;(function () {
    var
        Bang = window.Bang = window.Bang || {}

    var
        defaults = {
            // 实例化的时候自动执行init函数
            flagAutoInit     : true,
            // 是否需要搜索筛选
            flagFilter       : false,
            // 触发器
            selectorTrigger  : '.picker-trigger',

            col: 1,
            // 渲染数据
            data: [],
            // 渲染数据标题，默认为空
            dataTitle: [],
            // 被选中的位置（默认都是0）
            dataPos: [],

            callbackTriggerBefore : null,
            // 回调函数(确认/取消)
            callbackConfirm : null,
            callbackCancel  : null
        }

    function Picker (options) {
        var me = this

        options = $.extend ({}, defaults, options)

        me.options = options

        if (!tcb.isArray (me.options.dataFilter)) {
            me.options.dataFilter = []
        }

        me.__uniqueId = tcb.genRandomNum()
        me.__wrapId = 'UIComponentPicker'+me.__uniqueId
        me.__maskId = 'UIComponentPickerMask'+me.__uniqueId

        if (me.options.flagAutoInit) {

            me.init ()
        }
    }

    // 设置原型方法
    Picker.prototype = {

        constructor : Picker,

        getTrigger : getTrigger,

        bindEvent     : bindEvent,

        doSelect : doSelect,
        doShow   : doShow,
        doHide   : doHide,

        render: render,

        init : init
    }

    // 获取触发器
    function getTrigger () {
        var
            me = this,
            selectorTrigger = me.options.selectorTrigger

        me.__Trigger = me.__Trigger || $ (selectorTrigger)

        return me.__Trigger
    }

    // 设置被选中的item位置
    function doSelect () {
        var me = this,
            options = me.options,
            data = options.data,
            $selected = __getWrap.apply (me).find ('.selected')

        $selected.each (function (i, el) {
            var $el = $(el),
                name = $el.attr('data-name')

            $.each(data[i], function(ii, item){
                if (item['name']==name){
                    options.dataPos[i] = ii
                }
            })
        })
    }

    // 显示
    function doShow () {
        var me = this,
            $wrap = me.render()

        // 显示遮罩层
        __showMask.apply(me)

        $wrap.css ({
            'position' : 'fixed',
            'left'     : '0',
            'top'      : '100%',
            'z-index'  : tcb.zIndex (),
            'width'    : '100%'
        })

        //如果为android4.0以下系统，由于不支持部分CSS动画，需要特别处理
        if ($.os.android && !__compareVersion ($.os.version, "4.0")) {
            $wrap.css ({
                'top'    : 'auto',
                'bottom' : 0
            })
            $.dialog.toast ("抱歉，您的手机系统版本不支持选择", 1600)
        } else {
            $wrap.animate ({ 'translateY' : '1px' }, 10, function () {
                $wrap.hide ()
                setTimeout (function () {
                    $wrap.show ().animate ({ 'translateY' : 0 - $wrap.height () + 'px' }, 200, 'linear')//

                    //var $FilterInput = $wrap.find ('.item-filter input')
                    //if ($FilterInput && $FilterInput.length) {
                    //    $FilterInput.trigger ('change')
                    //}
                    __setSelectTransYBySelectedItem($wrap.find('.col'))

                }, 30)
            })
        }

        tcb.js2AndroidSetDialogState(true, function(){
            me.doHide()
        })
    }

    // 关闭picker
    function doHide () {
        var me = this,
            $wrap = __getWrap.apply (me)

        $wrap.animate ({ 'translateY' : 0 }, 200, 'linear', function () {

            $ (this).hide ()

            __hideWrap.apply (me)

            __hideMask.apply (me)
        })
        tcb.js2AndroidSetDialogState(false)
    }

    // 绑定基本事件
    function bindEvent () {
        var
            me = this,
            $wrap = __getWrap.apply(me),
            $trigger = me.getTrigger ()

        // 移动事件
        __bindMoveEvent ($wrap)

        // 触发picker展示
        $trigger.on ('click', function (e) {
            e.preventDefault ()

            var $me = $(this)

            if ($me.attr ('data-disabled-picker')) {
                return
            }

            // 有trigger before 函数，先调用，如果返回false（绝等于false），那么直接返回
            if ($.isFunction (me.options.callbackTriggerBefore) && me.options.callbackTriggerBefore (me) === false) {
                return
            }

            // shining
            __shineClick ($me[0])

            $trigger.blur()

            me.doShow()
        })

        // 选择item
        $wrap.on ('click', '.i-item', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $col = $me.closest ('.col')

            $me.addClass ('selected')
                .siblings ('.selected').removeClass ('selected')
        })
        // 点击控制按钮
        $wrap.on ('click', '.ctrl-item', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                action_name = $me.attr ('data-action'),
                action_map = {
                    cancel  : actionCancel,
                    confirm : actionConfirm
                },
                action_fn = action_map[ action_name ]

            if (typeof action_fn !== 'function') {
                // 没有相应的操作，直接返回不做任何处理

                return
            }

            // 执行操作
            action_fn ($me)
        })
        // 输入文字筛选
        $wrap.on('input change', '.item-filter input', function(e){
            var $me = $(this),
                val = tcb.trim ($me.val ()),
                $col = $me.closest('.col'),
                $itemList = $col.find('.item-list'),
                $items = $itemList.find('.i-item')

            val = val.match(/(\S+)/ig) || []

            me.options.dataFilter[ $col.index () ] = val

            tcb.each($items, function(i, itemEl){
                var $item = $(itemEl),
                    dataName = $item.attr('data-name')

                if (! __validMatch(val, dataName)){
                    $item.addClass('disabled')
                } else {
                    $item.removeClass('disabled')
                }
            })
            __resetListMove($itemList)
        })

        //取消关闭
        function actionCancel ($el) {

            // 关闭wrap层
            me.doHide ()

            if ($.isFunction (me.options.callbackCancel)) {

                me.options.callbackCancel (me)
            }
        }

        //确认选择
        function actionConfirm ($el) {

            // 选择确定的省/市/区县
            me.doSelect ()
            // 关闭wrap层
            me.doHide ()

            if ($.isFunction (me.options.callbackConfirm)) {

                me.options.callbackConfirm (me)
            }
        }
    }

    // 输出picker
    function render(){

        // 初始化将数
        var me = this,
            options = me.options,
            $wrap = __getWrap.apply(me),
            colHtml = __genHtml (options.data, options.dataPos, options.dataFilter)

        $wrap.find('.item-list').each(function(i, el){
            $(el).html(colHtml[i]||'')
        })

        return $wrap
    }

    // 初始化
    function init () {
        var me = this

        // 输出picker
        me.render()

        // 绑定基本事件
        me.bindEvent ()
    }

    Bang.Picker = function (options) {

        return new Picker (options)
    }



    //================= private ===================

    // 生成滑动列表
    function __genHtml (data, dataPos, dataFilter) {
        data = data || []
        dataPos = dataPos || []
        dataFilter = dataFilter || []

        var ret = []

        tcb.each (data, function (i, col_list) {
            var html_str = [],
                col_list_pos = dataPos[i] || 0,
                col_list_filter = dataFilter[i] || []

            tcb.each (col_list, function (ii, item) {
                html_str.push ('<span class="i-item')

                if (col_list_filter.length && !__validMatch (col_list_filter, item[ 'name' ])) {
                    html_str.push (' disabled')
                }
                if (col_list_pos === ii) {
                    html_str.push (' selected')
                }
                html_str.push ('" data-id="', item[ 'id' ], '" data-name="',item[ 'name' ],'">', item[ 'name' ], '</span>')
            })


            ret.push (html_str.join (''))
        })

        return ret
    }

    // 获取picker
    function __getWrap () {
        var me = this,
            $wrap = $ ('#'+me.__wrapId)

        if (!($wrap && $wrap.length)) {

            var flagFilter = me.options.flagFilter || false,
                col = me.options.col || 1,
                tit = me.options.dataTitle||[],
                html_st = []

            // 外框
            html_st.push ('<div class="ui-component-picker" id="',me.__wrapId,'">')

            // 主体列表
            html_st.push ('<div class="dt-table dt-table-', col, '-col">')
            for (var i = 0; i < col; i++) {
                html_st.push ('<div class="col">')
                html_st.push ('<div class="item-title">', (tit[ i ]||''), '</div>')
                if (flagFilter) {
                    html_st.push ('<div class="item-filter"><label class="input"><input type="text" placeholder="多词搜索使用空格分开"/></label></div>')
                }

                html_st.push ('<div class="item-select">',
                    '<div class="item-window">',
                        '<span class="i-w-line"></span>',
                        '<span class="i-w-line"></span>',
                    '</div>',
                    '<div class="item-list">',

                    '</div>',
                    '</div>');

                html_st.push ('</div>');
            }
            html_st.push ('</div>');

            // 控制行
            html_st.push ('<div class="ctrl-box">',
                '<span class="ctrl-item ctrl-cancel" data-action="cancel">取消</span>',
                '<span class="ctrl-item ctrl-ok" data-action="confirm">确定</span>',
                '</div>');

            html_st.push ('</div>');

            html_st = html_st.join ('')

            $wrap = $ (html_st).appendTo ($ ('body'))
        }

        return $wrap
    }
    // 隐藏picker
    function __hideWrap () {
        var
            me = this,
            $wrap = $ ('#'+me.__wrapId)

        if ($wrap && $wrap.length) {

            $wrap.hide()
        }
    }
    // 展示mask
    function __showMask () {
        var
            me = this,
            $mask = $ ('#'+me.__maskId)

        if (!($mask && $mask.length)) {

            var
                mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;display: block;width: 100%;height: 100%;background:rgba(0, 0, 0, 0.2);',
                mask_html = '<a id="'+me.__maskId+'" href="#" style="' + mask_css + '"></a>'

            $mask = $ (mask_html).appendTo (document.body);

            $mask.on ('click', function (e) {
                e.preventDefault ()

            })
        }

        $mask.css ({
            'z-index' : tcb.zIndex (),
            'display' : 'block'
        })
    }
    // 隐藏mask
    function __hideMask () {
        var
            me = this,
            $mask = $ ('#'+me.__maskId)

        if ($mask && $mask.length) {

            $mask.hide ()
        }
    }

    // 绑定滑动事件
    function __bindMoveEvent ($wrap) {
        if (!($wrap && $wrap.length)) {
            return
        }

        var $cover = $wrap.find ('.item-window')

        //touch start
        $cover.on ('touchstart', function (e) {
            e.preventDefault ()

            var $me = $ (this),
                $list = $me.parents ('.item-select').find ('.item-list'),
                startY = e.touches[ 0 ].clientY

            $list.data ('scrollY', parseInt (__getTransY ($list)))
                .data ('startY', startY)
                .data ('isMove', 'yes')
                .data ('startTime', new Date ().getTime ())

            var $FilterInput = $wrap.find ('.item-filter input')
            if ($FilterInput && $FilterInput.length) {
                $FilterInput.blur()
            }
        })

        //touch move
        $cover.on ('touchmove', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $list = $me.parents ('.item-select').find ('.item-list');

            if ($list.data ('isMove') != 'yes') {

                return false
            }

            var
                startY = $list.data ('startY'),
                endY = e.touches[ 0 ].clientY,
                detY = endY - startY;

            // 移动选择列表
            __moveList (this, detY)
        }, {passive : false})

        //touch end
        $cover.on ('touchend', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $list = $me.parents ('.item-select').find ('.item-list')

            if ($list.data ('isMove') != 'yes') {

                return false
            }

            var // 垂直移动距离
                detY = __getTransY ($list) - $list.data ('scrollY'),
                // 滑动时间
                detT = new Date ().getTime () - $list.data ('startTime')
            // 移动结束
            __moveEnd (this, detY, detT)

            // 移动结束,重置数据
            $list.data ('scrollY', 0)
                .data ('startY', 0)
                .data ('isMove', '')
                .data ('startTime', 0)

        })
    }

    // 移动列表
    function __moveList (el, detY) {
        var $el = $ (el),
            $node = $el.parents ('.item-select'),
            $list = $node.find ('.item-list'),
            $item = $list.find ('.i-item').filter (function () {
                return !$ (this).hasClass ('disabled')
            }),
            unit_height = $node.height () / 3,
            transY_max = ($item.length - 1) * unit_height,
            scrollY = parseInt ($list.data ('scrollY'), 10) || 0

        scrollY += detY - 0

        if (scrollY > 0 || scrollY < (0 - transY_max)) {

            return
        }

        //$list.animate({'translateY': scrollY + 'px'}, 0);
        $list.css ('-webkit-transform', 'translateY(' + scrollY + 'px)')

        $item.eq (Math.round (Math.abs (scrollY / unit_height))).trigger ('click')
    }

    // 移动结束
    function __moveEnd (el, detY, detT) {
        var
            $el = $ (el),
            $node = $el.parents ('.item-select'),
            $list = $node.find ('.item-list'),
            $item = $list.find ('.i-item').filter (function () {
                return !$ (this).hasClass ('disabled')
            }),
            unit_height = $node.height () / 3,
            transY_max = ($item.length - 1) * unit_height,
            endTop = parseInt (__getTransY ($list)),
            lastTop = (  Math.round (endTop / unit_height) ) * unit_height;

        var
            ZN_NUM = 0.25
        if (Math.abs (detY / detT) > ZN_NUM) {//惯性
            var
                pastNum = ((detY / detT) / ZN_NUM),
                morePastY = Math.floor (pastNum * unit_height)

            lastTop += morePastY

            lastTop = Math.min (Math.max (0 - transY_max, lastTop), 0)

            lastTop = (  Math.round (lastTop / unit_height) ) * unit_height

            $list.animate ({ 'translateY' : lastTop + 'px' }, 300 - 0 + Math.ceil (Math.abs (pastNum)) * 100, 'ease-out')
        } else {
            $list.animate ({ 'translateY' : lastTop + 'px' }, 160, 'linear')
        }

        //$item.eq (Math.floor (Math.abs (lastTop / unit_height))).trigger ('click');
        var
            item_pos = Math.floor (Math.round (Math.abs (lastTop * 100 / unit_height)) / 100)
        $item.eq (item_pos).trigger ('click')
    }

    function __resetListMove(el){
        var $el = $ (el),
            $node = $el.parents ('.item-select'),
            $list = $node.find ('.item-list'),
            $item = $list.find ('.i-item').filter (function () {
                return !$ (this).hasClass ('disabled')
            }),
            unit_height = $node.height () / 3,
            scrollY = 0

        $list.attr ('data-scrollY', scrollY)

        $list.css ('-webkit-transform', 'translateY(' + scrollY + 'px)')

        $item.eq (0).trigger ('click')
    }

    // 获取元素垂直方向变形位移
    function __getTransY (el) {
        var
            $el = $ (el),
            trans = $el.css ('transform')
                || $el.css ('-webkit-transform')
                || $el[ 0 ].style.webkitTransform,
            transY = 0

        if (trans.indexOf ('translateY') > -1) {
            transY = trans.replace (/translateY\((\-?[\d\.]+)px\)/, function (m, n) { return n || 0})
        }
        if (trans.indexOf ('matrix') > -1) {
            transY = trans.replace (/matrix\(\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*(\-?[\d\.]+)\)/, function (m, n) { return n || 0})
        }

        return transY
    }

    // 根据选中的item,将列表移动到选中的位置
    function __setSelectTransYBySelectedItem ($col) {
        if (!($col && $col.length)) {

            return
        }
        $col.each (function (i, el) {
            var $el = $ (el),
                $cover = $el.find ('.item-window'),
                $selected = $el.find ('.selected'),
                $items = $el.find ('.i-item').filter(function(){
                    return !$(this).hasClass('disabled')
                }),
                el_index = $items.indexOf($selected[0]),
                d = -($selected.height () * el_index)

            __moveList ($cover[ 0 ], d)
        })
    }

    // 比较版本
    function __compareVersion (src, dest) {
        return __version2Num (src) >= __version2Num (dest)
    }

    // 匹配matchs数组内的字符串是否能在str中找到，都能找到，返回true，否则false
    function __validMatch(matchs, str){
        str = str || ''
        var flagMatch = true

        tcb.each(matchs, function(i, v){
            str.indexOf(v)==-1 && (flagMatch = false)
        })

        return flagMatch
    }

    // 版本变成数字
    function __version2Num (v) {
        var arr = v.split (/\./);
        if (arr.length > 2) {
            arr.length = 2;
        } else if (arr.length == 1) {
            arr[ 1 ] = "0";
        }
        var vn = arr.join (".");
        vn -= 0;
        return vn;
    }

    // shine click action
    function __shineClick (el, duration) {

        el = $ (el)
        duration = parseInt (duration, 10) || 500

        el.each (function () {
            var
                me = this,
                orig_background_color = me.style.backgroundColor

            me.style.backgroundColor = '#f0f0f0'

            setTimeout(function(){

                $ (me).animate ({ 'background-color' : orig_background_color }, duration, 'cubic-bezier(.28,.2,.51,1.15)', function () {
                    me.style.backgroundColor = orig_background_color || ''
                })

            }, 300)
        })
    }

} ())
