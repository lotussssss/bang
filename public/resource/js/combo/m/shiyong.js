;/**import from `/resource/js/component/m/countdown.js` **/
// 倒计时
(function(){
    var Bang = window.Bang = window.Bang || {};

    Bang.countdown_desc = '剩余';
    Bang.startCountdown = startCountdown;

    /**
     * 拍卖倒计时（开始或者结束）
     * @param targettime 倒计时结束的目标时间（时间戳）
     * @param curtime 当前时间（时间戳）（会随着倒计时变化）
     * @param $target
     */
    function startCountdown(targettime, curtime, $target, callbacks){
        if(!targettime || !curtime || curtime>targettime){
            return ;
        }
        callbacks = callbacks || {};

        var duration = Math.floor( (targettime - curtime)/1000 ),// 时间间隔，精确到秒，用来计算倒计时
            client_duration = getClientDuration(targettime); // 当前客户端和结束时间的时间差（用来作为参考点修正倒计时误差）

        var fn_countdown = $.tmpl( $.trim( $('#JsMCountdownTpl').html() ) );

        // 倒计时ing
        typeof callbacks.start === 'function' && callbacks.start();

        function countdown(){
            if ( !($target&&$target.length) ) {
                return false
            }
            var d = Math.floor(duration/86400), // 天
                h = Math.floor((duration-d*86400)/3600), // 小时
                m = Math.floor((duration-d*86400-h*3600)/60), // 分钟
                s = duration - d*86400 - h*3600 - m*60; // 秒

            var desc_before = $target.attr('data-descbefore')||Bang.countdown_desc||'', // 前置文字说明
                desc_behind = $target.attr('data-descbehind')||'', // 后置文字说明
                day_txt    = $target.attr('data-daytxt') || '天 ',
                hour_txt   = $target.attr('data-hourtxt') || ':',
                minute_txt = $target.attr('data-minutetxt') || ':',
                second_txt = $target.attr('data-secondtxt') || '',
                hour_mode = !!$target.attr('data-hour-mode') // 小时模式

            if (hour_mode) {
                h = d * 24 + h
                d = 0
            }

            var html_str = fn_countdown({
                'day': fix2Length(d),
                'day_txt': day_txt,
                'hour': fix2Length(h),
                'hour_txt': hour_txt,
                'minute': fix2Length(m),
                'minute_txt': minute_txt,
                'second': fix2Length(s),
                'second_txt': second_txt,
                'desc_before': desc_before,
                'desc_behind': desc_behind
            });
            $target.html(html_str);

            // 倒计时ing
            typeof callbacks.process === 'function' && callbacks.process(curtime);

            duration = duration - 1;
            client_duration = client_duration - 1000;
            curtime = curtime + 1000;

            //duration = duration<1 ? 0 : duration;
            return true;
        }
        countdown();
        var timerId = setTimeout(function(){
            var flag = countdown();
            if (!flag) {
                return ;
            }
            if(duration>-1){
                var next_time = getClientDuration(targettime) - client_duration;
                if (next_time<0) {
                    next_time = 0;
                }
                timerId = setTimeout(arguments.callee, next_time);
            } else {
                // 倒计时结束
                typeof callbacks.end === 'function' && callbacks.end();
            }
        }, 1000);
        return function(){
            clearTimeout(timerId)
            timerId = null
        }
    }
    /**
     * 修复为2个字符长度，长度不足以前置0补齐;
     * @return {[type]} [description]
     */
    function fix2Length(str){
        str = str.toString();
        return str.length < 2 ? '0' + str : str;
    }
    /**
     * 获取当前客户端时间相对结束时间的时间间隔（精确到毫秒）
     * @returns {*|number}
     */
    function getClientDuration(targettime){
        return targettime - (new Date()).getTime();
    }

}());

;/**import from `/resource/js/component/m/swipesection.js` **/
// swipe section
(function () {
    window.Bang = window.Bang || {}

    var noop = function () {}

    window.QUEUE = window.QUEUE || {}
    window.QUEUE_MAP = window.QUEUE_MAP || {}
    var
        flag_animating = false,
        _MAX_Z_INDEX = 10000,
        _MASK_Z_INDEX = 9999

    function pushQueue (target, queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        Queue.push (target);

        return Queue.length - 1;
    }

    function popQueue (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue.pop ();
    }

    function shiftQueue (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue.shift ();
    }

    function getQueueTargetBy (pos, queue_name) {
        pos = parseInt (pos, 10);
        pos = pos
            ? pos
            : 0;
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }

        return Queue[ pos ];
    }

    function getQueueLast (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        var last = Queue.length - 1;

        return last > -1
            ? Queue[ last ]
            : null;
    }
    function getQueue(queue_name){
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue
    }

    function getSwipeSection (el) {
        var $el, class_str = '';
        if (el) {
            $el = $ (el);
            if (!($el && $el.length) && (typeof el === 'string')) {
                class_str = el.replace (/\./g, '');
            }
        }

        if (!($el && $el.length)) {
            var wrap_str = class_str
                ? '<section id="SwipeSection' + tcb.genRandomNum () + '" class="swipe-section pre-swipe-right-hide b-left ' + class_str + '"><a href="#" class="swipe-section-close iconfont icon-close"></a><div class="swipe-section-inner"></div></section>'
                : '<section id="SwipeSection' + tcb.genRandomNum () + '" class="swipe-section pre-swipe-right-hide b-left"><a href="#" class="swipe-section-close iconfont icon-close"></a><div class="swipe-section-inner"></div></section>';
            $el = $ (wrap_str).appendTo (document.body);

            // 关闭swipe secition
            $el.find ('.swipe-section-close').on ('click', function (e) {
                e.preventDefault ();

                backLeftSwipeSection ();
            });
        }

        // 将对象加入处理队列
        pushQueue ($el);

        return $el;
    }

    // 填充swipe section的内容
    function fillSwipeSection (html_str) {
        html_str = html_str
            ? html_str
            : '';
        var $swipe = getQueueLast ();
        if ($swipe && $swipe.length) {
            $swipe.find ('.swipe-section-inner').html (html_str);
        }
    }

    // 执行向左滑动
    function doLeftSwipeSection (percent, callback) {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }
        percent = parseFloat (percent)

        var // 内部元素的宽度
            inner_percent = percent
                ? 100 - percent
                : 100

        percent = percent
            ? percent + '%'
            : '0'
        inner_percent = inner_percent
            ? inner_percent + '%'
            : '100%'


        var $swipe = getQueueLast ();
        if ($swipe && $swipe.length) {
            var $body = $ (document.body);
            if (window.Bang.SwipeSection.ohidden && !$body.hasClass ('ohidden')) {
                $body.addClass ('ohidden');
            }

            showMask ()

            // 滑动之前将滑动标识设置为true,以用于表示在滑动ing,以方便其他的操作进行判断
            flag_animating = true

            $swipe.css ({
                'display' : 'block',
                'z-index' : _MAX_Z_INDEX++
            }).animate ({ 'translateX' : percent }, 500, 'ease', function () {

                // 滑动结束,释放滑动锁定标识
                flag_animating = false

                typeof callback === 'function' && callback ()
            })

            $swipe.find ('.swipe-section-inner').css ({
                'width' : inner_percent
            })
            $swipe.find ('.swipe-section-close').css ({
                'right' : percent
            })
            tcb.js2AndroidSetDialogState(true, function(){
                backLeftSwipeSection()
            })
        }
    }

    // 向左滑动的层，返回原处
    function backLeftSwipeSection (callback, flag_static) {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }

        var $swipe = popQueue ()
        if ($swipe && $swipe.length) {
            var $body = $ (document.body)
            if ($body.hasClass ('ohidden')) {
                $body.removeClass ('ohidden')
            }

            hideMask ()

            if (flag_static){
                typeof callback === 'function' && callback ()

                $swipe.remove ()
                $swipe = null
                return
            }
            $swipe.animate ({ 'translateX' : '100%' }, 300, 'ease', function () {
                typeof callback === 'function' && callback ()

                $swipe.remove ()
                $swipe = null
            })
            tcb.js2AndroidSetDialogState(false)
        }
    }

    // 除了最后一个，关闭其他显示的滑层
    function closeAllExceptLast () {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }
        var Queue = getQueue ()

        var $swipe
        while (Queue.length > 1) {
            $swipe = shiftQueue ()
            if ($swipe && $swipe.length) {
                $swipe.remove ()
                $swipe = null
                tcb.js2AndroidSetDialogState(false)
            }
        }
    }

    // 获取最后一个swipe section
    function getLastSwipeSection () {

        return getQueueLast ()
    }

    // 显示透明遮罩层
    function showMask () {
        var
            $Mask = $ ('#SwipeSectionMask')
        if (!($Mask && $Mask.length)) {
            var
                mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:' + _MASK_Z_INDEX + ';display: block;width: 100%;height: 100%;background:transparent;',
                mask_html = '<a id="SwipeSectionMask" href="#" style="' + mask_css + '"></a>'

            $Mask = $ (mask_html).appendTo (document.body);

            $Mask.on ('click', function (e) {
                e.preventDefault ()

                backLeftSwipeSection ()
            })
        }

        $Mask.show ()
    }

    // 隐藏透明遮罩层
    function hideMask () {
        var
            $Mask = $ ('#SwipeSectionMask')
        if ($Mask && $Mask.length) {

            $Mask.hide ()
        }
    }

    window.Bang.SwipeSection = {
        ohidden              : true,
        getSwipeSection      : getSwipeSection, /*获取swipe secition对象，加入队列queue*/
        fillSwipeSection     : fillSwipeSection, /*填充swipe section的内容*/
        doLeftSwipeSection   : doLeftSwipeSection, /*执行向左滑动*/
        backLeftSwipeSection : backLeftSwipeSection, /*向左滑动的层，返回原处*/
        closeAllExceptLast   : closeAllExceptLast,
        getLastSwipeSection  : getLastSwipeSection,
        getQueue : getQueue
    }

} ())


;/**import from `/resource/js/mobile/shiyong/common.js` **/
// 试用通用js
(function(){

    // 设置页面统计，
    // 统计规则：URL的pathname+query参数中的(product_id+from_page+partner_flag)
    function setStatistic(){
        var pathname = window.location.pathname,
            query = tcb.queryUrl(window.location.search),
            params = {}

        if (query['product_id']){
            params['product_id'] = query['product_id']
        }
        if (query['from_page']){
            params['from_page'] = query['from_page']
        }
        if (query['partner_flag']){
            params['partner_flag'] = query['partner_flag']
        }
        if (query['self_enterprise']){
            params['self_enterprise'] = query['self_enterprise']
        }

        var url = tcb.setUrl(pathname, params)

        tcb.statistic([ '_trackPageview', url])
    }
    setStatistic()
}());

;/**import from `/resource/js/mobile/shiyong/index/product_attr.js` **/
// 商品属性选择交互
;
(function () {
    var // 型号商品信息
        key_model_id_map_product = 'KEY_MODEL_ID_MAP_PRODUCT',
        // 当前选定的型号id
        key_model_id = 'KEY_MODEL_ID',
        // 当前已经选定的属性组
        key_current_selected_attr_group = 'KEY_CURRENT_SELECTED_ATTR_GROUP',
        // 商品ui状态数据信息
        key_product_ui_status_data = 'KEY_PRODUCT_UI_STATUS_DATA'

    // 异步获取型号下的商品\属性\租期等等数据...当数据已经cache后,直接从cache中获取,不再异步获取
    function getModelBucketDataAsync (callback) {
        var
            model_id = getModelId (),
            modelBucketData = getModelBucketData ()

        if (modelBucketData) {
            // 已经有cache

            $.isFunction (callback) && callback (modelBucketData)

        } else {

            var
                ajaxParams = {
                    url      : '/shiyong/doGetProductlist',
                    type     : 'POST',
                    dataType : 'json',
                    data     : {
                        model_id : model_id
                    },
                    error    : function (jqXHR, textStatus) {
                        alert (textStatus)
                    },
                    success  : function (res) {
                        if (!res[ 'errno' ]) {

                            modelBucketData = setModelBucketData (model_id, dealProductInfo (res[ 'result' ]))

                            $.isFunction (callback) && callback (modelBucketData)
                        } else {
                            alert (res[ 'errmsg' ])
                        }
                    }
                }

            $.ajax (ajaxParams)

        }
    }

    // 处理原始的商品信息
    // orig_info的key:
    //      attr_groups
    //      products
    //      sku_map_product
    //      treaty_days
    function dealProductInfo (orig_info) {
        var
            ret = {
                product_default    : {}, // 默认选中商品
                product_map        : {}, // 商品映射表
                attr_groups        : orig_info[ 'attr_groups' ], // 型号属性组[详细信息]
                attr_group_ids     : [], // 型号属性组[id组]
                attr_map_product   : orig_info[ 'sku_map_product' ],
                product_attr_group : [], // 商品的属性组[二维数组]
                product_map_attr   : {}, // 商品id和商品属性的映射表
                treaty_days        : [], // 租期时间
                treaty_days_promo  : []  // 推荐租期
            }

        // 遍历型号属性组,获取属性组纯id
        $.each (orig_info[ 'attr_groups' ], function (k, item) {
            var
                attr_value_list = item[ 'attr_value_list' ]

            ret[ 'attr_group_ids' ].push ([])

            $.each (attr_value_list, function (i, attr) {
                ret[ 'attr_group_ids' ][ ret[ 'attr_group_ids' ].length - 1 ].push (attr[ 'attr_value_id' ])
            })
        })

        var
            flag_has_set_default_product = false,
            // 无库存商品id
            noneStockProductId = []
        // 商品租期-价格
        $.each (orig_info[ 'products' ], function (k, item) {

            // 商品详细信息使用商品id映射
            ret[ 'product_map' ][ item[ 'product_id' ] ] = item

            if (item[ 'stock_nums' ] == 0) {
                // 无库存商品

                noneStockProductId.push (item[ 'product_id' ])
            }
            else if (item[ 'stock_nums' ] != 0 && !flag_has_set_default_product) {
                // 将第一个库存大于0的商品设置为默认选中的商品

                ret[ 'product_default' ] = item

                flag_has_set_default_product = true
            }

            var
                strategy_price = item[ 'strategy_price' ]
            $.each (strategy_price, function (day, total) {
                strategy_price[ day ] = {
                    total   : total,
                    per_day : tcb.formatMoney (total / day, 2, 0)
                }
            })

        })

        // 遍历sku和商品id的映射表[由于需要判断无库存商品id,需要放在商品遍历之后]
        $.each (orig_info[ 'sku_map_product' ], function (sku, pid) {

            if ($.inArray (pid, noneStockProductId) == -1) {

                sku = sku.split ('_')
                ret[ 'product_attr_group' ].push (sku)
                ret[ 'product_map_attr' ][ pid ] = sku
            }

            sku = null
        })

        // 租期数据
        var
            treaty_days = orig_info[ 'treaty_days' ]
        $.each (treaty_days, function (k, item) {
            // 完整租期时间
            ret[ 'treaty_days' ].push ({
                day  : k,
                text : item
            })
            // 推荐租期
            var
                promo_day_arr = [ '365',
                                  '180',
                                  '90' ]
            if (tcb.inArray (k, promo_day_arr) > -1) {
                ret[ 'treaty_days_promo' ].unshift ({
                    day  : k,
                    text : item
                })
            }
        })

        // 手动干掉,提前释放内存
        orig_info = null

        return ret
    }

    // 输出商品ui
    function renderProductUI (data) {
        data = data || {}

        // 关闭商品交互ui
        hideProductUI ()

        var
            html_fn = $.tmpl ($.trim ($ ('#JsMZuProductAttrSelectWrapTpl').html ())),
            html_st = html_fn (data)

        $ ('body').append (html_st)

        // 设置商品图片尺寸
        //tcb.setImgElSize ($ ('.product-pics .p-pic-shower img'), 350, 350)

        // 事件绑定
        bindProductEvent ()
    }

    // 显示商品ui
    function showProductUI (modelBucketData) {

        var
            productDefault = modelBucketData[ 'product_default' ],
            product_id = productDefault[ 'product_id' ],
            UIData = {
                // 商品基本信息[默认选中第一组]
                'product'             : productDefault,
                // 属性组
                'attr_groups'         : modelBucketData[ 'attr_groups' ],
                // 推荐租期
                'treaty_days_promo'   : modelBucketData[ 'treaty_days_promo' ],
                // 默认选中租期
                'treaty_days_default' : modelBucketData[ 'treaty_days_promo' ][ 0 ][ 'day' ],
                // 租期
                'treaty_days'         : modelBucketData[ 'treaty_days' ]
            }

        // 输出商品ui
        renderProductUI (UIData)

        var // 选中的属性组合
            selectedAttrGroup = modelBucketData[ 'product_map_attr' ][ product_id ],
            // 所有属性组合
            allAttrGroup = modelBucketData[ 'product_attr_group' ],
            // 所有属性列表
            allAttrList = modelBucketData[ 'attr_group_ids' ]

        // 设置商品属性ui状态
        setProductAttrUI (selectedAttrGroup, allAttrGroup, allAttrList)

        // 设置商品ui状态信息
        setProductUIStatusData ({
            // 选中的属性组合
            selectedAttrGroup : selectedAttrGroup,
            // 所有属性组合
            allAttrGroup      : allAttrGroup,
            // 所有属性列表
            allAttrList       : allAttrList,
            // 商品数据
            productData       : productDefault,
            // 选中的租期方案
            selectedTreatyDay : UIData[ 'treaty_days_default' ],
            // 商品有无库存
            productNoneStock  : productDefault[ 'stock_nums' ] > 0
                ? false
                : true
        })
    }

    // 关闭商品交互ui
    function hideProductUI () {
        var
            $mask = $ ('#AttrSelectMask'),
            $wrap = $ ('#AttrSelectWrap')

        if ($mask) {
            $mask.remove ()
        }
        if ($wrap) {
            $wrap.remove ()
        }
    }

    // 设置商品的ui状态
    function setProductUIStatus (productUIStatusData) {
        // 商品ui数据信息
        // 设置商品ui状态时,传入了相应数据,那么将数据存入cache,然后直接使用,否则直接从cache中取
        productUIStatusData = productUIStatusData
            // 设置商品ui状态数据
            ? setProductUIStatusData (productUIStatusData)
            : getProductUIStatusData ()

        var // 商品数据
            productData = productUIStatusData[ 'productData' ],
            // 选中的租期方案
            selectedTreatyDay = productUIStatusData[ 'selectedTreatyDay' ],
            // 选中的属性组合
            selectedAttrGroup = productUIStatusData[ 'selectedAttrGroup' ],
            // 所有属性组合
            allAttrGroup = productUIStatusData[ 'allAttrGroup' ],
            // 所有属性列表
            allAttrList = productUIStatusData[ 'allAttrList' ],
            // 商品有无库存
            productNoneStock = productUIStatusData[ 'productNoneStock' ]

        var
            $wrap = $ ('#AttrSelectWrap')


        // 设置商品图片
        var
            $img = $wrap.find ('.p-img img')
        $img.attr ('src', productData[ 'thum_img' ])
        // 设置商品图片尺寸
        //tcb.setImgElSize ($img, 350, 350)

        // 设置商品属性的ui状态
        setProductAttrUI (selectedAttrGroup, allAttrGroup, allAttrList)

        // 设置租期选中状态
        var
            $treatyItem = $wrap.find ('.prd-treaty-day .attr-item'),
            $treatyItemSelected = $treatyItem.filter (function () {
                return $ (this).attr ('data-val') == selectedTreatyDay
            }),
            $treatyItemOther = $treatyItem.filter (function () {
                return $ (this).attr ('data-other')
            })

        $treatyItem.removeClass ('cur')

        if ($treatyItemSelected && $treatyItemSelected.length) {

            $treatyItemSelected.addClass ('cur')

            $treatyItemOther.html ($treatyItemOther.attr ('data-default-text'))
        } else {

            $treatyItemSelected = $ ('.prd-treaty-day-completely').find ('[value="' + selectedTreatyDay + '"]')

            $treatyItemOther.addClass ('cur').html ($treatyItemSelected.html ())
        }
        //$treatyItemOther.removeClass('arrow-up').addClass('arrow-down')

        // 设置押金
        $wrap.find ('.prd-pledge-amount').html (productData[ 'pledge_amount' ])

        var // 商品的租用费用
            product_treaty_fee = productData[ 'strategy_price' ][ selectedTreatyDay ]
        // 设置服务费总额/每天
        $wrap.find ('.prd-treaty-fee-amount').html (product_treaty_fee[ 'total' ])
        $wrap.find ('.prd-treaty-fee-per-day-amount').html (product_treaty_fee[ 'per_day' ])

        var
            $Btn = $wrap.find ('#AttrSelectConfirm'),
            url_order = $Btn.attr('href') || '/shiyong/order'

        url_order = tcb.setUrl (url_order, {
            product_id : productData[ 'product_id' ],
            treaty_day : selectedTreatyDay
        })

        // 设置下单url
        $Btn.attr ('href', url_order)
        if (productNoneStock) {
            // 库存为0,按钮禁用

            $Btn.addClass ('btn-disabled')
        } else {
            $Btn.removeClass ('btn-disabled')
        }

    }

    /**
     * 设置商品属性的ui状态
     * @param selectedAttr 被设置的属性组
     * @param AttrGroup 所有存在的属性组合
     * @param AttrList 显示的属性列表
     */
    function setProductAttrUI (selectedAttr, AttrGroup, AttrList) {
        if (!(selectedAttr && selectedAttr.length)) {
            // 没有默认被选中的属性组，直接退出
            return;
        }
        var SelectableAttr = [],
            AttrGroup_itemstr = $.map (AttrGroup, function (item) {return item.join (',');});

        var selectedAttr2 = arrCombinedSequence (selectedAttr);
        for (var i = 0; i < AttrList.length; i++) {
            SelectableAttr[ i ] = [];

            var item = AttrList[ i ];
            for (var i2 = 0; i2 < item.length; i2++) {
                var item2 = item[ i2 ];

                for (var i3 = 0; i3 < selectedAttr2.length; i3++) {
                    var sitem = selectedAttr2[ i3 ];

                    var temp_arr = [];

                    temp_arr = temp_arr.concat (sitem.slice (0, i), item2, sitem.slice (i + 1));

                    if ($.inArray (temp_arr.join (','), AttrGroup_itemstr) > -1 && $.inArray (item2, SelectableAttr[ i ]) == -1) {
                        SelectableAttr[ i ].push (item2);
                    }
                }
            }
        }

        var wPCate = $ ('.attr-line');
        wPCate.each (function (i) {
            $ (this).find ('.attr-item').each (function (ii) {
                var wItem = $ (this),
                    attr_id = wItem.attr ('data-id');
                wItem.removeClass ('cur').removeClass ('disabled').removeClass ('disabled-hover');// 移除状态
                // 设置那些不能被选择的属性
                if ($.inArray (attr_id, SelectableAttr[ i ]) == -1) {
                    wItem.addClass ('disabled');
                } else {
                    wItem.removeClass ('disabled');
                }

                if (attr_id === selectedAttr[ i ]) {
                    wItem.addClass ('cur');
                }
            })
        })
    }

    /**
     * 将数组转换成组合序列
     *
     * @param TwoDimArr  二维数组
     * @returns {Array}
     */
    function arrCombinedSequence (TwoDimArr) {
        var ConvertedArr = [], // 转换后的二维数组
            cc = 1; // 转换后的二维数组的数组长度，默认设置为1

        // TwoDimArr不是数组，直接返回空数组
        if (!(TwoDimArr instanceof Array)) {
            return [];
        }
        var TwoDimArr_safe = []; // 拷贝一个新的安全数组，不破坏TwoDimArr原有结构
        for (var i = 0; i < TwoDimArr.length; i++) {
            if (!(TwoDimArr[ i ] instanceof Array)) {
                TwoDimArr_safe[ i ] = [ TwoDimArr[ i ].toString () ];
            } else {
                TwoDimArr_safe[ i ] = TwoDimArr[ i ];
            }

            cc = cc * TwoDimArr_safe[ i ].length; // 转换后的数组长度是子数组的长度之积
        }

        var kk = 1;
        $.each (TwoDimArr_safe, function (i, arr) {
            var len = arr.length;
            cc = cc / len;
            if (i == 0) {
                $.each (arr, function (ii, item) {
                    for (var j = 0; j < cc; j++) {
                        ConvertedArr.push ([ item ]);
                    }
                });
            } else {
                var pos = 0;
                for (var k = 0; k < kk; k++) {
                    $.each (arr, function (ii, item) {
                        for (var j = 0; j < cc; j++) {
                            ConvertedArr[ pos ].push (item);
                            pos++;
                        }
                    });
                }
            }
            kk = kk * len;
        });

        return ConvertedArr;
    }

    // 获取最佳匹配商品属性组
    function getBestAttrGroup (cur_attr, cur_attr_pos) {
        var
            best_match_attr_group = []
        var
            modelBucketData = getModelBucketData (),
            AttrGroup = modelBucketData[ 'product_attr_group' ],   // 商品的属性组[二维数组]

            cur_selected_attr = getCurrentSelectedAttrGroup (), // 获取选中的属性id组合
            filtered_attr_group = [], // 筛选出包含当前点击属性的那部分数组
            attr_group_counter = []   // 相同重合次数统计数组

        // 在所有已有的属性组中，筛选出包含当前点击属性的那部分数组
        $.each (AttrGroup, function (i, item) {

            if (item[ cur_attr_pos ] == cur_attr) {
                // 当前属性组对应位置的属性值和当前选中属性值相同,然后作如下处理,否则直接跳过

                var
                    counter = 0

                // 遍历当前选中的属性组
                $.each (cur_selected_attr, function (ii, attr_id) {
                    // 遍历到当前行，直接跳过不用处理
                    if (ii == cur_attr_pos) {
                        return
                    }

                    if (attr_id == item[ ii ]) {
                        // 每一属性行中选中的属性,和对应位置的属性一致时,计数器+1

                        counter++
                    }
                })

                attr_group_counter.push (counter)
                filtered_attr_group.push (item)
            }
        })

        var
            max_counter = Math.max.apply (Math, attr_group_counter), // 统计到的匹配最大值
            max_counter_pos = $.inArray (max_counter, attr_group_counter) // 取最大数字的第一个位置

        // 找到最佳匹配组
        best_match_attr_group = filtered_attr_group[ max_counter_pos ]

        return best_match_attr_group
    }

    // 获取当前选中的属性组合[某类属性没有被选中的项,那么属性类所在位置属性设置为空字符串]
    function getCurrentSelectedAttrGroup () {
        var
            $AttrLine = $ ('.attr-line'),
            cur_selected_attr = tcb.cache (key_current_selected_attr_group) || []

        if (!cur_selected_attr.length) {
            // 遍历商品属性行,获取选中的属性id组合
            $AttrLine.each (function (i, el) {
                var
                    $AttrItemSelected = $ (el).find ('.cur'),
                    data_id = ''

                if ($AttrItemSelected && $AttrItemSelected.length) {
                    data_id = $AttrItemSelected.attr ('data-id')
                }

                cur_selected_attr.push (data_id)
            })

        }

        return cur_selected_attr
    }

    // 生成新的选中的属性组合
    function genSelectedAttrGroup (cur_attr, cur_attr_pos) {
        var
            best_match_attr_group = getBestAttrGroup (cur_attr, cur_attr_pos), // 最佳匹配的属性组合
            cur_selected_attr = getCurrentSelectedAttrGroup (), // 获取选中的属性id组合
            selected_attr_group = [],
            modelBucketData = getModelBucketData (),
            attr_group_ids = modelBucketData[ 'attr_group_ids' ] // 型号属性组[id组]


        // 遍历当前选中的属性组合,
        // 每个位置的属性值和最佳匹配相同,那么继续选中此属性,
        // 否则此类属性全部不被选中(即将此类属性所有属性值全部push进被选中的属性数组之中)
        $.each (cur_selected_attr, function (i, attr_id) {
            if (attr_id != best_match_attr_group[ i ] && cur_attr_pos != i) {
                // 属性id不匹配,并且不是当前属性类

                selected_attr_group[ i ] = attr_group_ids[ i ]
            } else {

                selected_attr_group[ i ] = best_match_attr_group[ i ]
            }
        })

        return selected_attr_group
    }

    // 根据元素获取商品属性信息
    function getProductAttrItemInfoByElement ($el) {
        var
            cur_attr = $el.attr ('data-id'),
            cur_attr_line = $el.closest ('.attr-line')[ 0 ],
            cur_attr_line_pos = 0,
            $AttrLine = $ ('.attr-line')

        // 获取当前点击行的位置
        $AttrLine.each (function (i, el) {
            if (cur_attr_line == el) {
                cur_attr_line_pos = i
            }
        })

        return {
            cur_attr          : cur_attr,
            cur_attr_line_pos : cur_attr_line_pos
        }
    }

    // 设置商品ui状态信息
    function setProductUIStatusData (key, val) {
        var
            productUIStatusData = getProductUIStatusData ()

        if (typeof key == 'object') {

            $.each (key, function (k, v) {
                productUIStatusData[ k ] = v
            })
        } else {
            key = key === null
                ? 'null'
                : key.toString ()

            productUIStatusData[ key ] = val
        }

        tcb.cache (key_product_ui_status_data, productUIStatusData)

        return productUIStatusData
    }

    // 获取商品ui状态信息
    function getProductUIStatusData (k) {
        var
            ret = null,
            productUIStatusData = tcb.cache (key_product_ui_status_data) || {}

        if (typeof k == 'undefined') {
            ret = productUIStatusData
        } else {
            ret = typeof productUIStatusData[ k ] === 'undefined'
                ? productUIStatusData
                : productUIStatusData[ k ]
        }

        return ret
    }

    // 获取型号下大量数据
    function getModelBucketData () {
        var
            model_id = tcb.cache (key_model_id),
            modelMapProduct = tcb.cache (key_model_id_map_product) || {},
            // 型号下边商品相关信息
            modelBucketData = modelMapProduct[ model_id ]

        return modelBucketData
    }

    // 设置型号下的数据
    function setModelBucketData (model_id, bucket_data) {
        if (!model_id) {

            return
        }

        var
            modelMapProduct = tcb.cache (key_model_id_map_product) || {}

        modelMapProduct[ model_id ] = bucket_data

        tcb.cache (key_model_id_map_product, modelMapProduct)

        return bucket_data
    }

    // 获取型号id
    function getModelId () {

        return tcb.cache (key_model_id)
    }

    // 设置型号id
    function setModelId (model_id) {

        return tcb.cache (key_model_id, model_id)
    }

    // toggle更多可选租期
    function toggleMoreTreatyDay ($trigger) {
        if (!($trigger && $trigger.length)) {
            return
        }

        //if ($trigger.hasClass ('arrow-down')) {

        //$trigger.addClass ('arrow-up').removeClass ('arrow-down')

        triggerOpenSelectList ($ ('.prd-treaty-day-completely'))
        //} else {

        //$trigger.addClass ('arrow-down').removeClass ('arrow-up')
        //}

    }

    // js触发打开select选择列表
    function triggerOpenSelectList (elem) {
        if (document.createEvent) {
            var e = document.createEvent ("MouseEvents");
            e.initMouseEvent ("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            elem[ 0 ].dispatchEvent (e);
        } else if (elem[ 0 ].fireEvent) {
            elem[ 0 ].fireEvent ("onmousedown");
        }
    }


    // 绑定商品相关交互
    function bindProductEvent ($wrap, $mask) {
        // mask和wrap
        var
            $mask = $ ('#AttrSelectMask'),
            $wrap = $ ('#AttrSelectWrap')

        // 点击遮罩层关闭面板
        $mask.on ('click', function (e) {
            e.preventDefault ()

            hideProductUI ()
        })

        // 点击关闭按钮关闭面板
        $wrap.find ('#AttrSelectClose').on ('click', function (e) {
            e.preventDefault ()

            hideProductUI ()
        })

        // 属性点击的交互事件
        $wrap.find ('.attr-line .attr-item').on ('click', function (e) {
            e.preventDefault ()

            var
                $me = $ (this)

            // 当前已经选中的属性 点击无效
            if ($me.hasClass ('cur')) { return }

            var // 型号下边商品相关信息
                modelBucketData = getModelBucketData (),
                // 商品ui数据信息
                oriProductUIStatusData = getProductUIStatusData (),
                // 当前被点击元素,获取商品属性id,属性在属性组中的位置
                attrInfo = getProductAttrItemInfoByElement ($me),
                // 属性-商品映射表
                attrMapProduct = modelBucketData[ 'attr_map_product' ]

            var
                newProductUIStatusData = {
                    // 选中的属性组合
                    selectedAttrGroup : genSelectedAttrGroup (attrInfo[ 'cur_attr' ], attrInfo[ 'cur_attr_line_pos' ]),
                    // 所有属性组合
                    allAttrGroup      : modelBucketData[ 'product_attr_group' ],
                    // 所有属性列表
                    allAttrList       : modelBucketData[ 'attr_group_ids' ],
                    // 商品数据
                    productData       : oriProductUIStatusData[ 'productData' ],
                    // 商品有无库存(获取到商品id之前,默认设置为无库存状态)
                    productNoneStock  : true
                },
                // 商品id
                product_id = attrMapProduct[ newProductUIStatusData[ 'selectedAttrGroup' ].join ('_') ]

            if (product_id) {
                newProductUIStatusData[ 'productData' ] = modelBucketData[ 'product_map' ][ product_id ]
                newProductUIStatusData[ 'productNoneStock' ] = false
            }

            // 设置商品的ui信息,同时将状态数据存入cache
            setProductUIStatus (newProductUIStatusData)
        })

        // 不可选属性的mouse交互
        $wrap.find ('.attr-line .disabled').on ({
            'mouseenter' : function (e) {
                $ (this).addClass ('disabled-hover');
            },
            'mouseleave' : function (e) {
                $ (this).removeClass ('disabled-hover');
            }
        })

        // 选择租期
        $wrap.find ('.prd-treaty-day .attr-item').on ('click', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                treaty_day = $me.attr ('data-val'),
                flag_other = !!$me.attr ('data-other')

            if (!flag_other) {
                // 正常选择租期

                $wrap.find ('.prd-treaty-day-completely').val (treaty_day)

                // 设置选中租期
                setProductUIStatusData ('selectedTreatyDay', treaty_day)

                // 设置商品ui状态
                setProductUIStatus ()
            } else {
                // 选择其他更多租期

                toggleMoreTreatyDay ($me)
            }
        })

        // 切换其他租期
        $wrap.find ('.prd-treaty-day-completely').on ('change', function (e) {
            var
                $me = $ (this),
                treaty_day = $me.val ()

            // 设置选中租期
            setProductUIStatusData ('selectedTreatyDay', treaty_day)

            // 设置商品ui状态
            setProductUIStatus ()
        })

        // 点击我要租赁
        $wrap.find ('#AttrSelectConfirm').on ('click', function (e) {
            var
                $me = $ (this)

            if ($me.hasClass ('btn-disabled')) {
                e.preventDefault ()

                return
            }
        })
    }

    // 初始化
    function init () {
        var
            Zu = window.Zu = window.Zu || {}

        // 设置型号id
        Zu.setModelId = setModelId
        // 异步获取商品列表
        Zu.getModelBucketDataAsync = getModelBucketDataAsync
        // 输出商品ui
        Zu.renderProductUI = renderProductUI
        // 显示商品ui
        Zu.showProductUI = showProductUI
        // 设置商品属性ui状态
        Zu.setProductAttrUI = setProductAttrUI
        // 设置商品ui状态信息
        Zu.setProductUIStatusData = setProductUIStatusData

    }


    // 初始化
    init ()

} ())


;/**import from `/resource/js/mobile/shiyong/index/index.js` **/
$ (function () {
    var
        $PageIndex = $ ('.page-shiyong-index')
    if (!($PageIndex && $PageIndex.length)) {
        return
    }

    var
        Zu = window.Zu

    // 事件绑定
    tcb.bindEvent ('.page-shiyong-index', {
        // 属性选择弹层触发器
        '.js-attr-selected-trigger' : function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                model_id = $me.attr ('data-id')

            if($me.find('.btn-rent-disabled').length){
                return
            }

            // 设置型号id
            Zu.setModelId (model_id)
            // 异步获取商品列表
            Zu.getModelBucketDataAsync (function (modelBucketData) {


                Zu.showProductUI (modelBucketData, $me.attr ('data-title'))

            })

            //// 添加事件统计
            //var
            //    statistic_event_category = 'H5租赁',
            //    statistic_event_action = '',
            //    statistic_event_label = ''
            //if (model_id == '6') {
            //    statistic_event_action = '租6s'
            //    statistic_event_label = '点击“立即抢租”6s'
            //} else {
            //    statistic_event_action = '租6sp'
            //    statistic_event_label = '点击“立即抢租”6sP'
            //}
            //
            //var
            //    statistic_event = [ '_trackEvent',
            //                        statistic_event_category,
            //                        statistic_event_action,
            //                        statistic_event_label,
            //                        '',
            //                        '' ]
            //tcb.statistic (statistic_event)
        }

    })

    //// 提前获取商品信息....免得点击的时候才请求导致交互滞后
    //var
    //    PRODUCT_LIST = window._PRODUCT_LIST || []
    //$.each(PRODUCT_LIST, function(i, item){
    //    Zu.setModelId (item['model_id'])
    //
    //    Zu.getModelBucketDataAsync ()
    //})
    //
    //Zu.setModelId (6)
    //Zu.getModelBucketDataAsync (function () {
    //    Zu.setModelId (8)
    //
    //    Zu.getModelBucketDataAsync (function () {
    //
    //    })
    //})

})

;/**import from `/resource/js/mobile/shiyong/order.js` **/
// 下单页面
$(function(){
    var $PageOrder = $('.page-shiyong-order');
    if (!$PageOrder.length){
        return;
    }

    var _MAX_ZINDEX = 10000;
    function getSwipeSection(el){
        var $el, class_str='';
        if (el){
            $el = $(el);
            if ( !($el && $el.length) && (typeof el==='string') ){
                class_str = el.replace(/\./g, '');
            }
        }

        if ( !($el && $el.length) ) {
            var wrap_str = class_str
                    ? '<section id="SwipeSection'+tcb.genRandomNum()+'" class="swipe-section pre-swipe-right-hide '+class_str+'"></section>'
                    : '<section id="SwipeSection'+tcb.genRandomNum()+'" class="swipe-section pre-swipe-right-hide"></section>';
            $el = $(wrap_str).appendTo(document.body);
        }

        return $el;
    }
    function doLeftSwipeSection($swipe, percent){
        percent = parseFloat(percent);
        percent = percent ? percent+'%' : '0';

        //showSwipeSectionMask();

        $swipe.css({
            'display': 'block',
            'z-index': _MAX_ZINDEX++
        }).animate({'translateX': percent}, 300);
    }
    function showSwipeSectionMask(){
        var $mask = $('#SwipeSectionMask');
        if (!$mask.length) {
            $mask = $('<a class="swipe-section-mask" id="SwipeSectionMask"></a>');
            $mask.appendTo('body');

            $mask.on('click', function(e){
                e.preventDefault();

                hideSwipeSectionMask($mask);
            });
        }
        $mask.css({
            'display': 'block',
            'height': $('body').height()
        });
        return $mask;
    }
    function hideSwipeSectionMask($mask){
        var $mask = $mask || $('#SwipeSectionMask');
        if (!$mask.length) {
            return ;
        }
        $mask.hide();
    }

    // 省市地区切换
    (function(){
        var flag_getall = true;/*根据省一次性获取所有的城市和区县信息*/
        var CacheProvinceList = [],
            CacheCityList = {},
            CacheAreaList = {};
        var $ProviceSelect,// = $('[name="receiver_province_id"]'),
            $CityList,// = $('[name="receiver_city_id"]'),
            $AreaList;// = $('[name="receiver_area_id"]');
        // 获取省份列表
        function getProvinceList(callback){
            var province_list = CacheProvinceList;
            if (province_list && province_list.length) {
                if ($.isFunction(callback)){
                    callback(province_list);
                }
            } else {
                var request_url = '/aj/doGetProvinceList';

                $.get(request_url, function(res){
                    res = $.parseJSON(res);

                    if (!res['errno']){

                        var result = res['result'];
                        CacheProvinceList = result;

                        if ($.isFunction(callback)){
                            callback(result);
                        }
                    } else {
                        // do nothing
                    }
                });
            }
        }
        // 设置省份html
        function setProvinceHtml(data, selected_name){
            var html_str = [],
                selected_province_name = selected_name,
                selected_province_id='';

            // 传入的是省份id
            if (parseInt(selected_name, 10)){
                selected_province_name = '';
                selected_province_id = selected_name;
            }

            html_str.push('<div class="province-city-area-list" data-type="province"><div class="tit">选择省份</div>');
            $.each(data, function(i, item){
                html_str.push('<a href="#" ');
                if (selected_province_name && selected_province_name==item['province_name']){
                    html_str.push('class="selected" ');
                }
                if (selected_province_id && selected_province_id==item['province_id']){
                    html_str.push('class="selected" ');
                }
                html_str.push('data-id="', item['province_id'], '">', item['province_name'], '</a>');
            });
            html_str.push('</div>');

            html_str = html_str.join('');

            $ProviceSelect = getSwipeSection($ProviceSelect);
            $ProviceSelect.html(html_str);

            return $ProviceSelect;
        }
        // 获取城市、地区列表
        function getCityAreaList(province_id, callback){
            if (!province_id){
                return ;
            }
            var city_list = CacheCityList[province_id];
            if (city_list && city_list.length) {
                if ($.isFunction(callback)){
                    getAreaList(city_list[0]['city_id'], function(area_list){
                        callback(city_list, area_list);
                    });
                }
            } else {
                var request_url = '/aj/doGetProvinceLinkage?province_id='+province_id;

                city_list = [];
                $.get(request_url, function(res){
                    res = $.parseJSON(res);

                    if (!res['errno']){

                        var result = res['result'];

                        $.each(result['city_list'], function(i, item){
                            city_list.push({
                                city_id: item['city_id'],
                                city_name: item['city_name']
                            });

                            // 区县cache
                            CacheAreaList[item['city_id']] = (item['area_list']&&item['area_list'].length)
                                ? item['area_list']
                                : [];
                        });
                        // 城市cache
                        CacheCityList[province_id] = city_list;

                        if ($.isFunction(callback)){
                            var area_list = [];
                            if (city_list && city_list.length){
                                area_list = CacheAreaList[city_list[0]['city_id']];
                            }
                            callback(city_list, area_list);
                        }
                    } else {
                        callback([], []);
                        // do nothing
                    }
                });

            }
        }
        // 设置城市html
        function setCityHtml(data, selected_id){
            data = data || [];
            var html_str = [];

            html_str.push('<div class="province-city-area-list" data-type="city"><div class="tit">选择城市</div>');
            $.each(data, function(i, item){
                html_str.push('<a href="#" ');
                if (selected_id && selected_id==item['city_id']){
                    html_str.push('class="selected" ');
                }
                html_str.push('data-id="', item['city_id'], '">', item['city_name'], '</a>');
            });
            html_str.push('</div>');

            html_str = html_str.join('');

            $CityList = getSwipeSection($CityList);
            $CityList.html(html_str);

            return $CityList;
        }
        // 设置地区html
        function setAreaHtml(data, selected_id){
            data = data || [];
            var html_str = [];

            html_str.push('<div class="province-city-area-list" data-type="area"><div class="tit">选择区县</div>');
            $.each(data, function(i, item){
                html_str.push('<a href="#" ');
                if (selected_id && selected_id==item['area_id']){
                    html_str.push('class="selected" ');
                }
                html_str.push('data-id="', item['area_id'], '">', item['area_name'], '</a>');
            });
            html_str.push('</div>');

            html_str = html_str.join('');

            $AreaList = getSwipeSection($AreaList);
            $AreaList.html(html_str);

            return $AreaList;
        }

        // 获取城市列表
        function getCityList(province_id, callback){
            if (!province_id){
                return ;
            }
            var city_list = CacheCityList[province_id];
            if (city_list && city_list.length) {
                if ($.isFunction(callback)){
                    getAreaList(city_list[0]['city_id'], function(area_list){
                        callback(city_list, area_list);
                    });
                }
            } else {
                var request_url = '/aj/doGetCityList?province_id='+province_id;

                $.get(request_url, function(res){
                    res = $.parseJSON(res);

                    if (!res['errno']){
                        CacheCityList[province_id] = res['result'];

                        if ($.isFunction(callback)){
                            city_list = CacheCityList[province_id];

                            if (city_list && city_list.length) {
                                getAreaList(city_list[0]['city_id'], function(area_list){
                                    callback(city_list, area_list);
                                });
                            }
                        }
                    } else {
                        // do nothing
                    }
                });
            }
        }
        // 获取城市列表
        function getAreaList(city_id, callback){
            if (!city_id){
                return ;
            }
            var area_list = CacheAreaList[city_id];
            if (area_list && area_list.length) {
                if ($.isFunction(callback)){
                    callback(area_list);
                }
            } else {
                var request_url = '/aj/doGetAreaList?city_id='+city_id;

                $.get(request_url, function(res){
                    res = $.parseJSON(res);

                    if (!res['errno']){

                        CacheAreaList[city_id] = res['result'];

                        if ($.isFunction(callback)){
                            callback(CacheAreaList[city_id]);
                        }
                    } else {
                        // do nothing
                    }
                });
            }
        }
        // 根据省份名称，获取省份id
        function getProvinceIdByName(province_name, province_list){
            if ( !(province_name && $.isArray(province_list)) ) {
                return ;
            }
            var province_id;
            $.each(province_list, function(i, item){
                if (province_name==item['province_name']){
                    province_id = item['province_id'];

                    return false;
                }
            });

            return province_id;
        }


        var selected_province = null,
            selected_city = null,
            selected_area = null;
        // 选中省、市、区县
        function selectedProvinceCityArea(last_step){
            hideProvinceCityArea(last_step);

            var str = '';
            if (selected_province && selected_province.length){
                $('[name="receiver_province_id"]').val(selected_province[0]);
                str += selected_province[1]+' ';
            } else {
                $('[name="receiver_province_id"]').val('');
            }
            if (selected_city && selected_city.length){
                $('[name="receiver_city_id"]').val(selected_city[0]);
                str += selected_city[1]+' ';
            } else {
                $('[name="receiver_city_id"]').val('');
            }
            if (selected_area && selected_area.length){
                $('[name="receiver_area_id"]').val(selected_area[0]);
                str += selected_area[1]+' ';
            } else {
                $('[name="receiver_area_id"]').val('');
            }
            $('.receiver-province-city-area').removeClass('default').html(str);
        }
        // 隐藏省、市、区县选择面板
        function hideProvinceCityArea(last_step){
            switch (last_step) {
                case 'province':
                    hideProvince();
                    break;
                case 'city':
                    hideCity();
                    break;
                case 'area':
                    hideArea();
                    break;
                default :
                    if ($ProviceSelect && $ProviceSelect.length){
                        $ProviceSelect.animate({'translateX':'100%'}, 300, function(){
                            //$ProviceSelect.hide();
                            $ProviceSelect.remove();
                            $ProviceSelect = null;
                        });
                    }
                    if ($CityList && $CityList.length){
                        $CityList.animate({'translateX':'100%'}, 300, function(){
                            //$CityList.hide();
                            $CityList.remove();
                            $CityList = null;
                        });
                    }
                    if ($AreaList && $AreaList.length){
                        $AreaList.animate({'translateX':'100%'}, 300, function(){
                            //$AreaList.hide();
                            $AreaList.remove();
                            $AreaList = null;
                        });
                    }
                    break;
            }
        }
        function hideProvince(){
            if ($ProviceSelect && $ProviceSelect.length){
                $ProviceSelect.animate({'translateX':'100%'}, 300, function(){
                    //$ProviceSelect.hide();
                    $ProviceSelect.remove();
                    $ProviceSelect = null;
                });
            }
            if ($CityList && $CityList.length){
                $CityList.remove();
                $CityList = null;
                //$CityList.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
            if ($AreaList && $AreaList.length){
                $AreaList.remove();
                $AreaList = null;
                //$AreaList.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
        }
        function hideCity(){
            if ($ProviceSelect && $ProviceSelect.length){
                $ProviceSelect.remove();
                $ProviceSelect = null;
                //$ProviceSelect.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
            if ($CityList && $CityList.length){
                $CityList.animate({'translateX':'100%'}, 300, function(){
                    //$CityList.hide();
                    $CityList.remove();
                    $CityList = null;
                });
            }
            if ($AreaList && $AreaList.length){
                $AreaList.remove();
                $AreaList = null;
                //$AreaList.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
        }
        function hideArea(){
            if ($ProviceSelect && $ProviceSelect.length){
                $ProviceSelect.remove();
                $ProviceSelect = null;
                //$ProviceSelect.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
            if ($CityList && $CityList.length){
                $CityList.remove();
                $CityList = null;
                //$CityList.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
            if ($AreaList && $AreaList.length){
                $AreaList.animate({'translateX':'100%'}, 300, function(){
                    //$AreaList.hide();
                    $AreaList.remove();
                    $AreaList = null;
                });
            }
        }

        function init(){

            tcb.bindEvent({
                // 切换省、市、地区
                '.receiver-province-city-area': function(e){
                    e.preventDefault();

                    var $me = $(this),
                        province_id = $('[name="receiver_province_id"]').val();

                    selected_province = null;
                    selected_city = null;
                    selected_area = null;

                    getProvinceList(function(province_list){

                        var _default_city_name = window.city_name;

                        if (!province_id) {
                            province_id = getProvinceIdByName(_default_city_name, province_list);
                        }
                        // 设置城市html
                        var $Provice = setProvinceHtml(province_list, province_id);
                        doLeftSwipeSection($Provice, 30);
                    });

                },
                // 选择省、市、地区
                '.province-city-area-list a': function(e){
                    e.preventDefault();

                    var $me = $(this),
                        $list = $me.closest('.province-city-area-list'),
                        data_id = $me.attr('data-id'),
                        data_name = $.trim( $me.html() ),
                        data_type = $list.attr('data-type');

                    // 添加选中状态
                    $me.addClass('selected').siblings('.selected').removeClass('selected');

                    // 选择省
                    if (data_type==='province'){
                        selected_province = [data_id, data_name];
                        getCityAreaList(data_id, function(city_list, area_list){
                            // 有下级城市列表，显示列表，否则直接选中
                            if (city_list && city_list.length){
                                // 城市
                                var $City = setCityHtml(city_list);

                                doLeftSwipeSection($City, 30);
                            } else {
                                selectedProvinceCityArea(data_type);
                            }
                        });
                    }

                    // 选择市
                    if (data_type==='city'){
                        selected_city = [data_id, data_name];
                        getAreaList(data_id, function(area_list){
                            // 有下级区县列表，显示列表，否则直接选中
                            if (area_list && area_list.length) {
                                // 城市
                                var $Area = setAreaHtml(area_list);

                                doLeftSwipeSection($Area, 30);
                            } else {
                                selectedProvinceCityArea(data_type);
                            }
                        });

                    }

                    // 选择区县
                    if (data_type==='area'){
                        selected_area = [data_id, data_name];

                        selectedProvinceCityArea(data_type);
                    }
                }
            });

            $(document.body).on('click', function(e){
                var target = e.target,
                    $target = $(target);

                // 隐藏省市区县选择面板
                if ( !($target.hasClass('receiver-province-city-area') || $target.closest('.province-city-area-list').length) ){
                    hideProvinceCityArea();
                }
            });
        }
        init();
    }());

    // 订单提交
    (function(){
        var SwipeSection = window.Bang.SwipeSection;

        // 订单表单提交
        $('#SubmitOrderForm').on('submit', function(e){
            e.preventDefault();

            var $form = $(this);

            // 验证表单
            if (!validOrderForm($form)){
                return ;
            }

            $.post($form.attr('action'), $form.serialize(), function(res){
                res = $.parseJSON(res);

                if (!res['errno']){
                    var result = res['result'],
                        order_id = result['order_id'];

                    window.location.href = '/shiyong/cashier?order_id='+order_id;
                } else {
                    alert(res['errmsg']);
                    // do nothing
                }
            });

        });

        // 验证订单提交表单
        function validOrderForm($form){
            if ( !($form&&$form.length) ){
                return false;
            }
            var flag = true,
                $firt_error_el = null,
                delay = 120,
                delay_fix = -20;

            var $mobile = $form.find('[name="buyer_mobile"]'),
                $sms_code = $form.find('[name="sms_code"]'),
                $receiver_name = $form.find('[name="receiver_name"]'),
                $receiver_province_id = $form.find('[name="receiver_province_id"]'),
                $receiver_province_city_area = $form.find('.receiver-province-city-area'),
                $receiver_address = $form.find('[name="receiver_address"]'),
                $receiver_mobile = $form.find('[name="receiver_mobile"]'),
                $agreement = $form.find('.agreement-checkbox'),
                $btn = $('.btn-prd-buy')

            // 验证手机号
            if ( !($mobile&&$mobile.length&&tcb.validMobile($.trim($mobile.val()))) ) {
                if ($mobile&&$mobile.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $mobile;
                    setTimeout(function(){
                        $mobile.shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证短信验证码
            if ( !($sms_code&&$sms_code.length&&$.trim($sms_code.val())) ) {
                if ($sms_code&&$sms_code.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $sms_code;
                    setTimeout(function(){
                        $sms_code.shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证收货人姓名
            if ( !($receiver_name&&$receiver_name.length&&$.trim($receiver_name.val())) ) {
                if ($receiver_name&&$receiver_name.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $receiver_name;
                    setTimeout(function(){
                        $receiver_name.shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证收货人手机号
            if ( !($receiver_mobile&&$receiver_mobile.length&&tcb.validMobile($.trim($receiver_mobile.val()))) ) {
                if ($receiver_mobile&&$receiver_mobile.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $receiver_mobile;
                    setTimeout(function(){
                        $receiver_mobile.shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 所在地区
            if ( !($receiver_province_id&&$receiver_province_id.length&&$.trim($receiver_province_id.val())) ) {
                if ($receiver_province_id&&$receiver_province_id.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $receiver_province_city_area;
                    setTimeout(function(){
                        $receiver_province_city_area.shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证详细地址
            if ( !($receiver_address&&$receiver_address.length&&$.trim($receiver_address.val())) ) {
                if ($receiver_address&&$receiver_address.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $receiver_address;
                    setTimeout(function(){
                        $receiver_address.shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证是否选中服务协议
            if ( !($agreement&&$agreement.length&& $agreement.hasClass('sim-checkbox-checked') ) ) {
                if ($agreement&&$agreement.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $agreement;
                    setTimeout(function(){
                        $agreement.closest('.block').shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证提交按钮是否可用..
            if ( !($btn&&$btn.length&& !$btn.hasClass('btn-disabled') ) ) {
                if ($btn&&$btn.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $btn;
                }
                flag = false;
            }

            if (!flag) {
                var $row = $firt_error_el.closest('.row');
                var $inner = $('#mainbody .mainbody-inner');

                $('#mainbody').scrollTo({
                    endY: $row.offset()['top']-$inner.offset()['top']-10,
                    duration: delay+delay_fix,
                    callback: function(){
                        setTimeout(function(){
                            if ($receiver_province_city_area===$firt_error_el){
                                if ( !$('.swipe-section').length ){
                                    $firt_error_el.trigger('click');
                                }
                            } else {
                                $firt_error_el.focus();
                            }

                        }, delay);
                    }
                });
            }

            return flag;
        }

        // 显示租用协议
        function showAgreement(){
            var
                html_fn = $.tmpl( $.trim($('#JsMZuAgreementConfirmTpl').html())),
                html_st = html_fn()

            SwipeSection.getSwipeSection()
            SwipeSection.fillSwipeSection(html_st)

            var
                $swipe = SwipeSection.getLastSwipeSection()

            $swipe.show()
            setTimeout(function(){

                $swipe.find('.mobile-experience-agreement').css({
                    height: $swipe.height()
                });

                SwipeSection.doLeftSwipeSection(0, function(){
                    $swipe.find('.mobile-experience-agreement').css({
                        height: $swipe.height()
                    })
                })
            }, 1)
        }
        // 关闭租用协议
        function closeAgreement(){

            SwipeSection.backLeftSwipeSection()
        }

        tcb.bindEvent({
            // 显示租机服务协议
            '.trigger-show-zu-agreement': function(e){
                e.preventDefault()

                showAgreement()
            },
            // 提交表单
            '.btn-prd-buy': function(e){
                e.preventDefault()

                var
                    $form = $('#SubmitOrderForm')
                if (!validOrderForm($form)){
                    return ;
                }

                $form.submit()
            },
            // 不同意租用协议
            '.btn-prd-buy-cancel': function(e){
                e.preventDefault();

                $('.agreement-checkbox').removeClass('sim-checkbox-checked')
                $('.btn-prd-buy').addClass('btn-disabled')

                closeAgreement()
            },
            // 同意租用协议
            '.btn-prd-buy-confirm': function(e){
                e.preventDefault();

                $('.agreement-checkbox').addClass('sim-checkbox-checked')
                $('.btn-prd-buy').removeClass('btn-disabled')

                closeAgreement()
            }
        })

        // 点击服务协议
        $('.agreement-checkbox').on('click', function(e){
            var
                $me = $(this)

            if (!$me.hasClass('sim-checkbox-checked')){
                // 选中服务协议

                $me.addClass('sim-checkbox-checked')
                $('.btn-prd-buy').removeClass('btn-disabled')
            } else {

                $me.removeClass('sim-checkbox-checked')
                $('.btn-prd-buy').addClass('btn-disabled')
            }
        })

    }());
    // 其他
    (function(){

        tcb.bindEvent(document.body, {
            // 手机号输入
            '#MobileOrderMobile': {
                'blur': function(e){
                    var $me = $(this),
                        mobile = $.trim( $me.val() );

                    if (tcb.validMobile(mobile)){
                        var $receiver_mobile = $('[name="receiver_mobile"]'),
                            receiver_mobile = $.trim( $receiver_mobile.val() );
                        if ( !tcb.validMobile(receiver_mobile) ){

                            $receiver_mobile.val(mobile);
                        }
                    }
                }
            },
            // 切换支付方式
            '.pay-label': function(e){
                var $me = $(this);

                if ($me.hasClass('pay-label-checked')) {
                    return ;
                }

                $me.addClass('pay-label-checked').siblings('.pay-label-checked').removeClass('pay-label-checked');
                $me.find('[name="pay_type"]').trigger('click');
            },
            // 获取短信验证码
            '#SubmitOrderForm .get-mobile-order-secode': function(e){
                e.preventDefault ();

                var $BtnSeCode = $ (this)

                if ($BtnSeCode.hasClass ('get-mobile-order-secode-disabled')) {
                    return
                }

                var $LoginForm = $BtnSeCode.closest ('form'),
                    $BtnVCode = $LoginForm.find ('.vcode-img')

                if ($BtnVCode.attr ('data-out-date')) {
                    $BtnVCode.trigger ('click')
                }

                if (!validGetSmsCode ($LoginForm)) {
                    return
                }

                var
                    $mobile = $LoginForm.find ('[name="buyer_mobile"]'),
                    $pic_secode = $LoginForm.find ('[name="pic_secode"]'),
                    $sms_type = $LoginForm.find ('[name="sms_type"]')

                var request_url = '/aj/doSendSmsCode',
                    params = {
                        'mobile'     : $.trim ($mobile.val ()),
                        'pic_secode' : $.trim ($pic_secode.val ()),
                        'sms_type'   : $.trim ($sms_type.val ())
                    }
                $.post (request_url, params, function (res) {

                    res = $.parseJSON (res);
                    if (res[ 'errno' ]) {
                        alert (res[ 'errmsg' ])

                        $BtnSeCode.removeClass ('get-mobile-order-secode-disabled')
                        $BtnVCode.trigger ('click')

                    } else {

                        $BtnSeCode.addClass ('get-mobile-order-secode-disabled').html ('60秒后再次发送');
                        tcb.distimeAnim (60, function (time) {
                            if (time <= 0) {
                                $BtnSeCode.removeClass ('get-mobile-order-secode-disabled').html ('获取验证码');
                            } else {
                                $BtnSeCode.html (time + '秒后再次发送');
                            }
                        })
                    }

                })
            },
            // 刷新图形验证码
            '#SubmitOrderForm .vcode-img': function(e){
                e.preventDefault ()

                var $BtnVCode = $(this),
                    $LoginForm = $BtnVCode.closest('form')

                var src = '/secode/?rands=' + Math.random ()

                $BtnVCode.attr ('src', src)

                $BtnVCode.attr ('data-out-date', '')

                var $pic_secode = $LoginForm.find ('[name="pic_secode"]')
                $pic_secode.focus ().val ('')
            }
        })

        // 验证获取手机短信验证码表单
        function validGetSmsCode (wForm) {
            if (!(wForm && wForm.length)) {
                return false
            }
            var flag = true

            var wMobile = wForm.find ('[name="buyer_mobile"]'),
                mobile_val = $.trim (wMobile.val ())
            if (!tcb.validMobile (mobile_val)) {
                flag = false
                $.errorAnimate(wMobile.focus ())
            }

            var wPicSecode = wForm.find ('[name="pic_secode"]'),
                pic_secode_val = $.trim (wPicSecode.val ())
            if (!pic_secode_val) {
                $.errorAnimate(wPicSecode)
                if (flag) {
                    wPicSecode.focus ()
                }
                flag = false
            }

            return flag
        }

    }());
});

;/**import from `/resource/js/mobile/shiyong/order_pay/pay.js` **/
// 订单支付
$ (function () {
    var
        $PageOrderPay = $ ('.page-order-pay')
    if (!($PageOrderPay && $PageOrderPay.length)) {
        return
    }

    // 处理分期数据
    $.each (window.Installment, function (bank_code, item) {
        var
            install = [],
            hb_rate = item[ 'hb_rate' ],
            payment = item[ 'payment' ],
            rate = item[ 'rate' ],
            // 支付总金额(包含手续费)
            total_pay = item[ 'payAmount' ],
            // 总的手续费
            total_fee = item[ 'payRate' ],
            k = 0

        $.each (hb_rate, function (stage, rate_val) {
            var
                pay_params = {
                    order_id : window.ORDER_ID,
                    bank_code : bank_code,
                    hb_by_stages : stage
                }

            install.push ({
                'stage'     : stage,
                // 总额(包含手续费)
                'total_pay' : tcb.formatMoney(total_pay[k], 2, 0),
                // 每一期分期费用(包含手续费)
                'per_pay'   : tcb.formatMoney(payment[k], 2, 0),
                // 总手续费
                'total_fee' : tcb.formatMoney(total_fee[k], 2, 0),
                // 每一期手续费
                'per_fee'   : tcb.formatMoney(rate[k], 2, 0),
                // 支付url
                'pay_url': tcb.setUrl('/shiyong/subpay', pay_params)
            })

            k++
        })

        window.Installment[ bank_code ] = install
    })

    var
        Swipe = Bang.SwipeSection,
        // 支付方式列表
        pay_type_arr = [ 'WXPAY_JS',
                         'alipay',
                         'alipay_hb',
                         'hdfk' ],
        // 支付方式映射表
        pay_type_map = {
            'WXPAY_JS'  : {},
            'alipay'   : {},
            'alipay_hb' : {
                installment : true
            },
            'hdfk'      : {}
        },
        // 分期付款数据表
        installment_map = window.Installment

    tcb.bindEvent (document.body, {
        // 选择支付方式
        '.row-pay'                         : function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                pay_type = $me.attr ('data-pay-type')

            if (tcb.inArray (pay_type, pay_type_arr) == -1) {
                // 获取到的支付方式不在支付方式数组表中,将第一个支付方式当作默认支付方式

                pay_type = pay_type_arr[ 0 ]
            }

            var // 支付方式详细数据
                pay_type_data = pay_type_map[ pay_type ]

            // 支持分期
            if (pay_type_data[ 'installment' ]) {
                // 花呗分期

                window.location.hash = 'pay_type=' + pay_type
                return
            }

            var
                $other_rows = $me.siblings ('.row-pay')

            $me.find ('.iconfont').addClass ('icon-circle-tick')
            $other_rows.find ('.icon-circle-tick').removeClass ('icon-circle-tick')


            if (typeof pay_type_map[ pay_type ] !== 'undefined') {
                // 花呗以外的其他支付方式

                var
                    pay_params = {
                        order_id : window.ORDER_ID,
                        bank_code : pay_type
                    }
                // 支付地址
                $('.btn-pay').attr ('href', tcb.setUrl('/shiyong/subpay', pay_params))
            }

        },
        // 选择花呗分期方式
        '.block-hua-bei .row-radio-select' : function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $swipe = $me.closest ('.swipe-section'),
                // 分期数据位置
                pos = parseInt($me.attr('data-pos'), 10) || 0,
                // 支付方式
                pay_type = $me.attr('data-pay-type'),
                // 当前选择分期数据
                installment = installment_map[pay_type][pos]

            // 设置被选中状态
            $me.siblings ('.row-radio-select').find ('.icon-circle-tick').removeClass ('icon-circle-tick')
            $me.find ('.iconfont').addClass ('icon-circle-tick')

            // 分期总额
            $swipe.find ('.final-price-inner').html ('￥' + installment['total_pay'])
            // 手续费
            $swipe.find ('.final-price-service-fee').html ('含手续费：￥' + installment['total_fee'])
            // 支付地址
            $swipe.find ('.btn-pay').attr ('href', installment['pay_url'])
        },
        // 点击支付按钮
        '.btn-pay': function(e){

            if ($('body').hasClass('page-disabled')){
                // 页面禁用,支付按钮不让点啦

                e.preventDefault()

                return
            }
        }
    })

    $ (window).on ({
        'hashchange load' : function (e) {
            var
                hash = tcb.parseHash (),
                pay_type = hash
                    ? hash[ 'pay_type' ]
                    : ''

            if (tcb.inArray (pay_type, pay_type_arr) == -1) {
                // 获取到的支付方式不在支付方式数组表中,将第一个支付方式当作默认支付方式

                pay_type = pay_type_arr[ 0 ]
            }

            var // 支付方式详细数据
                pay_type_data = pay_type_map[ pay_type ]

            if (pay_type_data[ 'installment' ]) {

                // 打开花呗分期panel
                openHuaBeiPanel (pay_type)

            } else {

                // 关闭花呗分期panel
                closeHuaBeiPanel ()
            }
        }
    })

    // 打开花呗分期panel
    function openHuaBeiPanel (pay_type) {
        // 花呗

        var
            html_fn = $.tmpl ($.trim ($ ('#JsShiYongHuaBeiPanelTpl').html ())),
            html_st = html_fn ({
                pay_type: pay_type,
                installment_arr : installment_map[ pay_type ],
                total_pay       : installment_map[ pay_type ][ 0 ][ 'total_pay' ],
                total_fee       : installment_map[ pay_type ][ 0 ][ 'total_fee' ],
                pay_url         : installment_map[ pay_type ][ 0 ][ 'pay_url' ]
            })

        Swipe.getSwipeSection ('.hua-bei-panel')
        Swipe.fillSwipeSection (html_st)

        var
            $swipe = Swipe.getLastSwipeSection ()
        $swipe.show ();

        Swipe.doLeftSwipeSection (0)

        $swipe.find ('.bnt-close-swipe-section').on ('click', function (e) {
            e.preventDefault ()

            if (window.history.length > 1) {
                // history记录的长度大于1,那么直接回退

                window.history.go (-1)
            } else {
                // 否则就将hash强制设置为空字符串

                window.location.hash = ''
            }
        })

    }

    // 关闭花呗分期panel
    function closeHuaBeiPanel () {
        Swipe.backLeftSwipeSection ()
    }

    // 开启倒计时
    function startPayCountdown () {
        var wCountdown = $ ('.js-pay-countdown');
        if (wCountdown && wCountdown.length) {
            wCountdown.forEach (function (el, i) {
                var
                    $El = $ (el),
                    // 服务器当前时间(精确到毫秒)
                    current_time = window.current_time || (new Date ()).getTime (),
                    order_time = $El.attr ('data-order-time') || '', // 下单时间
                    locked_time = (window.locked_time || 900) * 1000; // 订单锁定时间段（即：从下单到关闭订单的时间段）

                // 下单时间
                order_time = Date.parse (order_time.replace (/-/g, '/')) || 0

                var // 订单关闭时间
                    lock_endtime = order_time + locked_time

                // 当前时间与下单时间的时间差，大于锁定时间，那么表示订单已经关闭，不再倒计时
                if (current_time > lock_endtime) {
                    // 给body上加disabled,用来禁止某些操作
                    $('body').addClass('page-disabled')

                    // 倒计时到期，关闭订单
                    $El.closest ('.row-pay-countdown').html ('交易关闭')

                    $ ('.btn-pay').addClass ('btn-disabled')

                    return
                }

                // 初始化倒计时
                Bang.startCountdown (lock_endtime, current_time, $El, {
                    'end' : function () {
                        // 给body上加disabled,用来禁止某些操作
                        $('body').addClass('page-disabled')

                        // 倒计时到期，关闭订单
                        $El.closest ('.row-pay-countdown').html ('交易关闭')

                        $ ('.btn-pay').addClass ('btn-disabled')
                    }
                })

            })
        }

    }



    // 开启倒计时
    startPayCountdown ()
})

;/**import from `/resource/js/mobile/shiyong/order_detail.js` **/
// 订单详情
$(function(){
    var $PageOrderDetail = $('.page-shiyong-order-detail');
    if (!$PageOrderDetail.length){
        return;
    }

    // 支付倒计时
    (function(){
        // 支付倒计时
        function payCountdown(){
            // 给订单倒计时支付时间
            var wCountdown = $('.js-pay-countdown');
            if ( !(wCountdown && wCountdown.length) ) {
                return;
            }
            wCountdown.each(function(i, el){
                var wEl = $(el);

                var curtime = window.curtime,
                    order_time = wEl.attr('data-otime'), // 下单时间
                    locked_time = (window.locked_time || 1800)*1000; // 订单锁定时间段（即：从下单到关闭订单的时间段）

                // 服务器当前时间(精确到毫秒)
                curtime = Date.parse(curtime.replace(/-/g, '/')) || (new Date()).getTime();

                // 下单时间
                order_time = Date.parse(order_time.replace(/-/g, '/')) || 0;

                var lock_endtime = order_time + locked_time; // 订单关闭时间

                // 当前时间与下单时间的时间差，大于锁定时间，那么表示订单已经关闭，不再倒计时
                if (curtime>lock_endtime) {
                    //window.location.href = window.location.href+'&status_close=1';
                    return;
                }

                Bang.startCountdown(lock_endtime, curtime, wEl, {
                    'end': function(){
                        window.location.reload();
                    }
                });

            });
        }
        payCountdown();

    }());

    // 其他
    (function(){
        var SwipeSection = window.Bang.SwipeSection;
        tcb.bindEvent(document.body, {
            // 申请退款
            '.btn-order-apply-refund': function(e){
                e.preventDefault();

                tcb.showDialog('请联系客服：<a href="tel:4000-399-360">4000-399-360</a>');
            },
            // 质检报告
            '.view-mobile-quality': function(e){
                //e.preventDefault();

            },
            // 试用协议
            '.view-mobile-experience-agreement': function(e){
                e.preventDefault();

                var html_str = $.tmpl( $.trim($('#JsMMobileExperienceAgreementTpl').html()) );

                SwipeSection.getSwipeSection();
                SwipeSection.fillSwipeSection(html_str);
                SwipeSection.doLeftSwipeSection(0);
            },
            '.btn-order-finish-experience': function(e){
                e.preventDefault();

                tcb.showDialog('<div class="p-vboth-010rem">如需还机，请联系客服：<a href="tel:4000-399-360">4000-399-360</a></div>');
            }

        });
    }());
});

;/**import from `/resource/js/mobile/shiyong/order_check_pay.js` **/
// 下单成功
$(function(){
    var $PageOrderCheckPay = $('.page-shiyong-order-check-pay');
    if (!$PageOrderCheckPay.length){
        return;
    }

    // 其他
    (function(){
        var $btn_pay_success = $('.btn-pay-success'),
            order_id = $btn_pay_success.attr('data-orderid');
        // 检查支付状态
        function checkPayStatus(order_id, callback){
            if (!order_id){
                return ;
            }
            var request_url = '/shiyong/doGetPayResult?order_id='+order_id;
            $.get(request_url, function(res){
                res = $.parseJSON(res);

                if (typeof callback==='function'){
                    callback(res);
                }
            });
        }
        var _MAXREQUEST = window._MAXREQUEST || 10;
        // 循环检查支付状态
        function recircleCheckPayStatus(){
            // 检查支付状态
            checkPayStatus(order_id, function(res){
                if (!res['errno']){
                    window.location.replace('/shiyong/paysuc?order_id='+order_id);
                }
            });

            if (_MAXREQUEST) {
                setTimeout(recircleCheckPayStatus, 5000);
            }
            _MAXREQUEST--;
        }
        setTimeout(recircleCheckPayStatus, 0);

        tcb.bindEvent(document.body, {
            // 点击完成支付
            '.btn-pay-success': function(e){
                e.preventDefault();

                var $me = $(this),
                    order_id = $me.attr('data-orderid');

                checkPayStatus(order_id, function(res){
                    if (res['errno']){
                        alert('您的支付状态还未更新，请稍后再试。');
                    } else {
                        window.location.replace('/shiyong/paysuc?order_id='+order_id);
                    }
                });
            }
        })
    }());
});

;/**import from `/resource/js/mobile/shiyong/rent_phone/sn_p_c_a_map.js` **/
;(function(){
    var R = tcb.getRoot()
    //苏宁小贷 提供的省市区字典值
    R.SN_P_C_A_MAP = [
        {"name":"北京市", "sub":[
            {"name":"北京市", "sub":[
                {"name":"东城区"},
                {"name":"西城区"},
                {"name":"朝阳区"},
                {"name":"丰台区"},
                {"name":"石景山区"},
                {"name":"海淀区"},
                {"name":"门头沟区"},
                {"name":"房山区"},
                {"name":"通州区"},
                {"name":"顺义区"},
                {"name":"昌平区"},
                {"name":"大兴区"},
                {"name":"怀柔区"},
                {"name":"平谷区"},
                {"name":"密云县"},
                {"name":"延庆县"}
            ]}
        ]},
        {"name":"天津市", "sub":[
            {"name":"天津市", "sub":[
                {"name":"和平区"},
                {"name":"河东区"},
                {"name":"河西区"},
                {"name":"南开区"},
                {"name":"河北区"},
                {"name":"红桥区"},
                {"name":"东丽区"},
                {"name":"西青区"},
                {"name":"津南区"},
                {"name":"北辰区"},
                {"name":"武清区"},
                {"name":"宝坻区"},
                {"name":"滨海新区"},
                {"name":"宁河县"},
                {"name":"静海县"},
                {"name":"蓟县"}
            ]}
        ]},
        {"name":"河北省", "sub":[
            {"name":"石家庄市", "sub":[
                {"name":"长安区"},
                {"name":"桥东区"},
                {"name":"桥西区"},
                {"name":"新华区"},
                {"name":"井陉矿区"},
                {"name":"裕华区"},
                {"name":"井陉县"},
                {"name":"正定县"},
                {"name":"栾城县"},
                {"name":"行唐县"},
                {"name":"灵寿县"},
                {"name":"高邑县"},
                {"name":"深泽县"},
                {"name":"赞皇县"},
                {"name":"无极县"},
                {"name":"平山县"},
                {"name":"元氏县"},
                {"name":"赵县"},
                {"name":"辛集市"},
                {"name":"藁城市"},
                {"name":"晋州市"},
                {"name":"新乐市"},
                {"name":"鹿泉市"}
            ]},
            {"name":"唐山市", "sub":[
                {"name":"路南区"},
                {"name":"路北区"},
                {"name":"古冶区"},
                {"name":"开平区"},
                {"name":"丰南区"},
                {"name":"丰润区"},
                {"name":"滦县"},
                {"name":"滦南县"},
                {"name":"乐亭县"},
                {"name":"迁西县"},
                {"name":"玉田县"},
                {"name":"唐海县"},
                {"name":"遵化市"},
                {"name":"迁安市"}
            ]},
            {"name":"秦皇岛市", "sub":[
                {"name":"海港区"},
                {"name":"山海关区"},
                {"name":"北戴河区"},
                {"name":"青龙满族自治县"},
                {"name":"昌黎县"},
                {"name":"抚宁县"},
                {"name":"卢龙县"}
            ]},
            {"name":"邯郸市", "sub":[
                {"name":"邯山区"},
                {"name":"丛台区"},
                {"name":"复兴区"},
                {"name":"峰峰矿区"},
                {"name":"邯郸县"},
                {"name":"临漳县"},
                {"name":"成安县"},
                {"name":"大名县"},
                {"name":"涉县"},
                {"name":"磁县"},
                {"name":"肥乡县"},
                {"name":"永年县"},
                {"name":"邱县"},
                {"name":"鸡泽县"},
                {"name":"广平县"},
                {"name":"馆陶县"},
                {"name":"魏县"},
                {"name":"曲周县"},
                {"name":"武安市"}
            ]},
            {"name":"邢台市", "sub":[
                {"name":"桥东区"},
                {"name":"桥西区"},
                {"name":"邢台县"},
                {"name":"临城县"},
                {"name":"内丘县"},
                {"name":"柏乡县"},
                {"name":"隆尧县"},
                {"name":"任县"},
                {"name":"南和县"},
                {"name":"宁晋县"},
                {"name":"巨鹿县"},
                {"name":"新河县"},
                {"name":"广宗县"},
                {"name":"平乡县"},
                {"name":"威县"},
                {"name":"清河县"},
                {"name":"临西县"},
                {"name":"南宫市"},
                {"name":"沙河市"}
            ]},
            {"name":"保定市", "sub":[
                {"name":"新市区"},
                {"name":"北市区"},
                {"name":"南市区"},
                {"name":"满城县"},
                {"name":"清苑县"},
                {"name":"涞水县"},
                {"name":"阜平县"},
                {"name":"徐水县"},
                {"name":"定兴县"},
                {"name":"唐县"},
                {"name":"高阳县"},
                {"name":"容城县"},
                {"name":"涞源县"},
                {"name":"望都县"},
                {"name":"安新县"},
                {"name":"易县"},
                {"name":"曲阳县"},
                {"name":"蠡县"},
                {"name":"顺平县"},
                {"name":"博野县"},
                {"name":"雄县"},
                {"name":"涿州市"},
                {"name":"定州市"},
                {"name":"安国市"},
                {"name":"高碑店市"}
            ]},
            {"name":"张家口市", "sub":[
                {"name":"桥东区"},
                {"name":"桥西区"},
                {"name":"宣化区"},
                {"name":"下花园区"},
                {"name":"宣化县"},
                {"name":"张北县"},
                {"name":"康保县"},
                {"name":"沽源县"},
                {"name":"尚义县"},
                {"name":"蔚县"},
                {"name":"阳原县"},
                {"name":"怀安县"},
                {"name":"万全县"},
                {"name":"怀来县"},
                {"name":"涿鹿县"},
                {"name":"赤城县"},
                {"name":"崇礼县"}
            ]},
            {"name":"承德市", "sub":[
                {"name":"双桥区"},
                {"name":"双滦区"},
                {"name":"鹰手营子矿区"},
                {"name":"承德县"},
                {"name":"兴隆县"},
                {"name":"平泉县"},
                {"name":"滦平县"},
                {"name":"隆化县"},
                {"name":"丰宁满族自治县"},
                {"name":"宽城满族自治县"},
                {"name":"围场满族蒙古族自治县"}
            ]},
            {"name":"沧州市", "sub":[
                {"name":"新华区"},
                {"name":"运河区"},
                {"name":"沧县"},
                {"name":"青县"},
                {"name":"东光县"},
                {"name":"海兴县"},
                {"name":"盐山县"},
                {"name":"肃宁县"},
                {"name":"南皮县"},
                {"name":"吴桥县"},
                {"name":"献县"},
                {"name":"孟村回族自治县"},
                {"name":"泊头市"},
                {"name":"任丘市"},
                {"name":"黄骅市"},
                {"name":"河间市"}
            ]},
            {"name":"廊坊市", "sub":[
                {"name":"安次区"},
                {"name":"广阳区"},
                {"name":"固安县"},
                {"name":"永清县"},
                {"name":"香河县"},
                {"name":"大城县"},
                {"name":"文安县"},
                {"name":"大厂回族自治县"},
                {"name":"霸州市"},
                {"name":"三河市"}
            ]},
            {"name":"衡水市", "sub":[
                {"name":"桃城区"},
                {"name":"枣强县"},
                {"name":"武邑县"},
                {"name":"武强县"},
                {"name":"饶阳县"},
                {"name":"安平县"},
                {"name":"故城县"},
                {"name":"景县"},
                {"name":"阜城县"},
                {"name":"冀州市"},
                {"name":"深州市"}
            ]}
        ]},
        {"name":"山西省", "sub":[
            {"name":"太原市", "sub":[
                {"name":"小店区"},
                {"name":"迎泽区"},
                {"name":"杏花岭区"},
                {"name":"尖草坪区"},
                {"name":"万柏林区"},
                {"name":"晋源区"},
                {"name":"清徐县"},
                {"name":"阳曲县"},
                {"name":"娄烦县"},
                {"name":"古交市"}
            ]},
            {"name":"大同市", "sub":[
                {"name":"城区"},
                {"name":"矿区"},
                {"name":"南郊区"},
                {"name":"新荣区"},
                {"name":"阳高县"},
                {"name":"天镇县"},
                {"name":"广灵县"},
                {"name":"灵丘县"},
                {"name":"浑源县"},
                {"name":"左云县"},
                {"name":"大同县"}
            ]},
            {"name":"阳泉市", "sub":[
                {"name":"城区"},
                {"name":"矿区"},
                {"name":"郊区"},
                {"name":"平定县"},
                {"name":"盂县"}
            ]},
            {"name":"长治市", "sub":[
                {"name":"城区"},
                {"name":"郊区"},
                {"name":"长治县"},
                {"name":"襄垣县"},
                {"name":"屯留县"},
                {"name":"平顺县"},
                {"name":"黎城县"},
                {"name":"壶关县"},
                {"name":"长子县"},
                {"name":"武乡县"},
                {"name":"沁县"},
                {"name":"沁源县"},
                {"name":"潞城市"}
            ]},
            {"name":"晋城市", "sub":[
                {"name":"城区"},
                {"name":"沁水县"},
                {"name":"阳城县"},
                {"name":"陵川县"},
                {"name":"泽州县"},
                {"name":"高平市"}
            ]},
            {"name":"朔州市", "sub":[
                {"name":"朔城区"},
                {"name":"平鲁区"},
                {"name":"山阴县"},
                {"name":"应县"},
                {"name":"右玉县"},
                {"name":"怀仁县"}
            ]},
            {"name":"晋中市", "sub":[
                {"name":"榆次区"},
                {"name":"榆社县"},
                {"name":"左权县"},
                {"name":"和顺县"},
                {"name":"昔阳县"},
                {"name":"寿阳县"},
                {"name":"太谷县"},
                {"name":"祁县"},
                {"name":"平遥县"},
                {"name":"灵石县"},
                {"name":"介休市"}
            ]},
            {"name":"运城市", "sub":[
                {"name":"盐湖区"},
                {"name":"临猗县"},
                {"name":"万荣县"},
                {"name":"闻喜县"},
                {"name":"稷山县"},
                {"name":"新绛县"},
                {"name":"绛县"},
                {"name":"垣曲县"},
                {"name":"夏县"},
                {"name":"平陆县"},
                {"name":"芮城县"},
                {"name":"永济市"},
                {"name":"河津市"}
            ]},
            {"name":"忻州市", "sub":[
                {"name":"忻府区"},
                {"name":"定襄县"},
                {"name":"五台县"},
                {"name":"代县"},
                {"name":"繁峙县"},
                {"name":"宁武县"},
                {"name":"静乐县"},
                {"name":"神池县"},
                {"name":"五寨县"},
                {"name":"岢岚县"},
                {"name":"河曲县"},
                {"name":"保德县"},
                {"name":"偏关县"},
                {"name":"原平市"}
            ]},
            {"name":"临汾市", "sub":[
                {"name":"尧都区"},
                {"name":"曲沃县"},
                {"name":"翼城县"},
                {"name":"襄汾县"},
                {"name":"洪洞县"},
                {"name":"古县"},
                {"name":"安泽县"},
                {"name":"浮山县"},
                {"name":"吉县"},
                {"name":"乡宁县"},
                {"name":"大宁县"},
                {"name":"隰县"},
                {"name":"永和县"},
                {"name":"蒲县"},
                {"name":"汾西县"},
                {"name":"侯马市"},
                {"name":"霍州市"}
            ]},
            {"name":"吕梁市", "sub":[
                {"name":"离石区"},
                {"name":"文水县"},
                {"name":"交城县"},
                {"name":"兴县"},
                {"name":"临县"},
                {"name":"柳林县"},
                {"name":"石楼县"},
                {"name":"岚县"},
                {"name":"方山县"},
                {"name":"中阳县"},
                {"name":"交口县"},
                {"name":"孝义市"},
                {"name":"汾阳市"}
            ]}
        ]},
        {"name":"内蒙古自治区", "sub":[
            {"name":"呼和浩特市", "sub":[
                {"name":"新城区"},
                {"name":"回民区"},
                {"name":"玉泉区"},
                {"name":"赛罕区"},
                {"name":"土默特左旗"},
                {"name":"托克托县"},
                {"name":"和林格尔县"},
                {"name":"清水河县"},
                {"name":"武川县"}
            ]},
            {"name":"包头市", "sub":[
                {"name":"东河区"},
                {"name":"昆都仑区"},
                {"name":"青山区"},
                {"name":"石拐区"},
                {"name":"白云鄂博矿区"},
                {"name":"九原区"},
                {"name":"土默特右旗"},
                {"name":"固阳县"},
                {"name":"达尔罕茂明安联合旗"}
            ]},
            {"name":"乌海市", "sub":[
                {"name":"海勃湾区"},
                {"name":"海南区"},
                {"name":"乌达区"}
            ]},
            {"name":"赤峰市", "sub":[
                {"name":"红山区"},
                {"name":"元宝山区"},
                {"name":"松山区"},
                {"name":"阿鲁科尔沁旗"},
                {"name":"巴林左旗"},
                {"name":"巴林右旗"},
                {"name":"林西县"},
                {"name":"克什克腾旗"},
                {"name":"翁牛特旗"},
                {"name":"喀喇沁旗"},
                {"name":"宁城县"},
                {"name":"敖汉旗"}
            ]},
            {"name":"通辽市", "sub":[
                {"name":"科尔沁区"},
                {"name":"科尔沁左翼中旗"},
                {"name":"科尔沁左翼后旗"},
                {"name":"开鲁县"},
                {"name":"库伦旗"},
                {"name":"奈曼旗"},
                {"name":"扎鲁特旗"},
                {"name":"霍林郭勒市"}
            ]},
            {"name":"鄂尔多斯市", "sub":[
                {"name":"东胜区"},
                {"name":"达拉特旗"},
                {"name":"准格尔旗"},
                {"name":"鄂托克前旗"},
                {"name":"鄂托克旗"},
                {"name":"杭锦旗"},
                {"name":"乌审旗"},
                {"name":"伊金霍洛旗"}
            ]},
            {"name":"呼伦贝尔市", "sub":[
                {"name":"海拉尔区"},
                {"name":"阿荣旗"},
                {"name":"莫力达瓦达斡尔族自治旗"},
                {"name":"鄂伦春自治旗"},
                {"name":"鄂温克族自治旗"},
                {"name":"陈巴尔虎旗"},
                {"name":"新巴尔虎左旗"},
                {"name":"新巴尔虎右旗"},
                {"name":"满洲里市"},
                {"name":"牙克石市"},
                {"name":"扎兰屯市"},
                {"name":"额尔古纳市"},
                {"name":"根河市"}
            ]},
            {"name":"巴彦淖尔市", "sub":[
                {"name":"临河区"},
                {"name":"五原县"},
                {"name":"磴口县"},
                {"name":"乌拉特前旗"},
                {"name":"乌拉特中旗"},
                {"name":"乌拉特后旗"},
                {"name":"杭锦后旗"}
            ]},
            {"name":"乌兰察布市", "sub":[
                {"name":"集宁区"},
                {"name":"卓资县"},
                {"name":"化德县"},
                {"name":"商都县"},
                {"name":"兴和县"},
                {"name":"凉城县"},
                {"name":"察哈尔右翼前旗"},
                {"name":"察哈尔右翼中旗"},
                {"name":"察哈尔右翼后旗"},
                {"name":"四子王旗"},
                {"name":"丰镇市"}
            ]},
            {"name":"兴安盟", "sub":[
                {"name":"乌兰浩特市"},
                {"name":"阿尔山市"},
                {"name":"科尔沁右翼前旗"},
                {"name":"科尔沁右翼中旗"},
                {"name":"扎赉特旗"},
                {"name":"突泉县"}
            ]},
            {"name":"锡林郭勒盟", "sub":[
                {"name":"二连浩特市"},
                {"name":"锡林浩特市"},
                {"name":"阿巴嘎旗"},
                {"name":"苏尼特左旗"},
                {"name":"苏尼特右旗"},
                {"name":"东乌珠穆沁旗"},
                {"name":"西乌珠穆沁旗"},
                {"name":"太仆寺旗"},
                {"name":"镶黄旗"},
                {"name":"正镶白旗"},
                {"name":"正蓝旗"},
                {"name":"多伦县"}
            ]},
            {"name":"阿拉善盟", "sub":[
                {"name":"阿拉善左旗"},
                {"name":"阿拉善右旗"},
                {"name":"额济纳旗"}
            ]}
        ]},
        {"name":"辽宁省", "sub":[
            {"name":"沈阳市", "sub":[
                {"name":"和平区"},
                {"name":"沈河区"},
                {"name":"大东区"},
                {"name":"皇姑区"},
                {"name":"铁西区"},
                {"name":"苏家屯区"},
                {"name":"东陵区"},
                {"name":"沈北新区"},
                {"name":"于洪区"},
                {"name":"辽中县"},
                {"name":"康平县"},
                {"name":"法库县"},
                {"name":"新民市"}
            ]},
            {"name":"大连市", "sub":[
                {"name":"中山区"},
                {"name":"西岗区"},
                {"name":"沙河口区"},
                {"name":"甘井子区"},
                {"name":"旅顺口区"},
                {"name":"金州区"},
                {"name":"长海县"},
                {"name":"瓦房店市"},
                {"name":"普兰店市"},
                {"name":"庄河市"}
            ]},
            {"name":"鞍山市", "sub":[
                {"name":"铁东区"},
                {"name":"铁西区"},
                {"name":"立山区"},
                {"name":"千山区"},
                {"name":"台安县"},
                {"name":"岫岩满族自治县"},
                {"name":"海城市"}
            ]},
            {"name":"抚顺市", "sub":[
                {"name":"新抚区"},
                {"name":"东洲区"},
                {"name":"望花区"},
                {"name":"顺城区"},
                {"name":"抚顺县"},
                {"name":"新宾满族自治县"},
                {"name":"清原满族自治县"}
            ]},
            {"name":"本溪市", "sub":[
                {"name":"平山区"},
                {"name":"溪湖区"},
                {"name":"明山区"},
                {"name":"南芬区"},
                {"name":"本溪满族自治县"},
                {"name":"桓仁满族自治县"}
            ]},
            {"name":"丹东市", "sub":[
                {"name":"元宝区"},
                {"name":"振兴区"},
                {"name":"振安区"},
                {"name":"宽甸满族自治县"},
                {"name":"东港市"},
                {"name":"凤城市"}
            ]},
            {"name":"锦州市", "sub":[
                {"name":"古塔区"},
                {"name":"凌河区"},
                {"name":"太和区"},
                {"name":"黑山县"},
                {"name":"义县"},
                {"name":"凌海市"},
                {"name":"北镇市"}
            ]},
            {"name":"营口市", "sub":[
                {"name":"站前区"},
                {"name":"西市区"},
                {"name":"鲅鱼圈区"},
                {"name":"老边区"},
                {"name":"盖州市"},
                {"name":"大石桥市"}
            ]},
            {"name":"阜新市", "sub":[
                {"name":"海州区"},
                {"name":"新邱区"},
                {"name":"太平区"},
                {"name":"清河门区"},
                {"name":"细河区"},
                {"name":"阜新蒙古族自治县"},
                {"name":"彰武县"}
            ]},
            {"name":"辽阳市", "sub":[
                {"name":"白塔区"},
                {"name":"文圣区"},
                {"name":"宏伟区"},
                {"name":"弓长岭区"},
                {"name":"太子河区"},
                {"name":"辽阳县"},
                {"name":"灯塔市"}
            ]},
            {"name":"盘锦市", "sub":[
                {"name":"双台子区"},
                {"name":"兴隆台区"},
                {"name":"大洼县"},
                {"name":"盘山县"}
            ]},
            {"name":"铁岭市", "sub":[
                {"name":"银州区"},
                {"name":"清河区"},
                {"name":"铁岭县"},
                {"name":"西丰县"},
                {"name":"昌图县"},
                {"name":"调兵山市"},
                {"name":"开原市"}
            ]},
            {"name":"朝阳市", "sub":[
                {"name":"双塔区"},
                {"name":"龙城区"},
                {"name":"朝阳县"},
                {"name":"建平县"},
                {"name":"喀喇沁左翼蒙古族自治县"},
                {"name":"北票市"},
                {"name":"凌源市"}
            ]},
            {"name":"葫芦岛市", "sub":[
                {"name":"连山区"},
                {"name":"龙港区"},
                {"name":"南票区"},
                {"name":"绥中县"},
                {"name":"建昌县"},
                {"name":"兴城市"}
            ]}
        ]},
        {"name":"吉林省", "sub":[
            {"name":"长春市", "sub":[
                {"name":"南关区"},
                {"name":"宽城区"},
                {"name":"朝阳区"},
                {"name":"二道区"},
                {"name":"绿园区"},
                {"name":"双阳区"},
                {"name":"农安县"},
                {"name":"九台市"},
                {"name":"榆树市"},
                {"name":"德惠市"}
            ]},
            {"name":"吉林市", "sub":[
                {"name":"昌邑区"},
                {"name":"龙潭区"},
                {"name":"船营区"},
                {"name":"丰满区"},
                {"name":"永吉县"},
                {"name":"蛟河市"},
                {"name":"桦甸市"},
                {"name":"舒兰市"},
                {"name":"磐石市"}
            ]},
            {"name":"四平市", "sub":[
                {"name":"铁西区"},
                {"name":"铁东区"},
                {"name":"梨树县"},
                {"name":"伊通满族自治县"},
                {"name":"公主岭市"},
                {"name":"双辽市"}
            ]},
            {"name":"辽源市", "sub":[
                {"name":"龙山区"},
                {"name":"西安区"},
                {"name":"东丰县"},
                {"name":"东辽县"}
            ]},
            {"name":"通化市", "sub":[
                {"name":"东昌区"},
                {"name":"二道江区"},
                {"name":"通化县"},
                {"name":"辉南县"},
                {"name":"柳河县"},
                {"name":"梅河口市"},
                {"name":"集安市"}
            ]},
            {"name":"白山市", "sub":[
                {"name":"八道江区"},
                {"name":"江源区"},
                {"name":"抚松县"},
                {"name":"靖宇县"},
                {"name":"长白朝鲜族自治县"},
                {"name":"临江市"}
            ]},
            {"name":"松原市", "sub":[
                {"name":"宁江区"},
                {"name":"前郭尔罗斯蒙古族自治县"},
                {"name":"长岭县"},
                {"name":"乾安县"},
                {"name":"扶余县"}
            ]},
            {"name":"白城市", "sub":[
                {"name":"洮北区"},
                {"name":"镇赉县"},
                {"name":"通榆县"},
                {"name":"洮南市"},
                {"name":"大安市"}
            ]},
            {"name":"延边朝鲜族自治州", "sub":[
                {"name":"延吉市"},
                {"name":"图们市"},
                {"name":"敦化市"},
                {"name":"珲春市"},
                {"name":"龙井市"},
                {"name":"和龙市"},
                {"name":"汪清县"},
                {"name":"安图县"}
            ]}
        ]},
        {"name":"黑龙江省", "sub":[
            {"name":"哈尔滨市", "sub":[
                {"name":"道里区"},
                {"name":"南岗区"},
                {"name":"道外区"},
                {"name":"平房区"},
                {"name":"松北区"},
                {"name":"香坊区"},
                {"name":"呼兰区"},
                {"name":"阿城区"},
                {"name":"依兰县"},
                {"name":"方正县"},
                {"name":"宾县"},
                {"name":"巴彦县"},
                {"name":"木兰县"},
                {"name":"通河县"},
                {"name":"延寿县"},
                {"name":"双城市"},
                {"name":"尚志市"},
                {"name":"五常市"}
            ]},
            {"name":"齐齐哈尔市", "sub":[
                {"name":"龙沙区"},
                {"name":"建华区"},
                {"name":"铁锋区"},
                {"name":"昂昂溪区"},
                {"name":"富拉尔基区"},
                {"name":"碾子山区"},
                {"name":"梅里斯达斡尔族区"},
                {"name":"龙江县"},
                {"name":"依安县"},
                {"name":"泰来县"},
                {"name":"甘南县"},
                {"name":"富裕县"},
                {"name":"克山县"},
                {"name":"克东县"},
                {"name":"拜泉县"},
                {"name":"讷河市"}
            ]},
            {"name":"鸡西市", "sub":[
                {"name":"鸡冠区"},
                {"name":"恒山区"},
                {"name":"滴道区"},
                {"name":"梨树区"},
                {"name":"城子河区"},
                {"name":"麻山区"},
                {"name":"鸡东县"},
                {"name":"虎林市"},
                {"name":"密山市"}
            ]},
            {"name":"鹤岗市", "sub":[
                {"name":"向阳区"},
                {"name":"工农区"},
                {"name":"南山区"},
                {"name":"兴安区"},
                {"name":"东山区"},
                {"name":"兴山区"},
                {"name":"萝北县"},
                {"name":"绥滨县"}
            ]},
            {"name":"双鸭山市", "sub":[
                {"name":"尖山区"},
                {"name":"岭东区"},
                {"name":"四方台区"},
                {"name":"宝山区"},
                {"name":"集贤县"},
                {"name":"友谊县"},
                {"name":"宝清县"},
                {"name":"饶河县"}
            ]},
            {"name":"大庆市", "sub":[
                {"name":"萨尔图区"},
                {"name":"龙凤区"},
                {"name":"让胡路区"},
                {"name":"红岗区"},
                {"name":"大同区"},
                {"name":"肇州县"},
                {"name":"肇源县"},
                {"name":"林甸县"},
                {"name":"杜尔伯特蒙古族自治县"}
            ]},
            {"name":"伊春市", "sub":[
                {"name":"伊春区"},
                {"name":"南岔区"},
                {"name":"友好区"},
                {"name":"西林区"},
                {"name":"翠峦区"},
                {"name":"新青区"},
                {"name":"美溪区"},
                {"name":"金山屯区"},
                {"name":"五营区"},
                {"name":"乌马河区"},
                {"name":"汤旺河区"},
                {"name":"带岭区"},
                {"name":"乌伊岭区"},
                {"name":"红星区"},
                {"name":"上甘岭区"},
                {"name":"嘉荫县"},
                {"name":"铁力市"}
            ]},
            {"name":"佳木斯市", "sub":[
                {"name":"向阳区"},
                {"name":"前进区"},
                {"name":"东风区"},
                {"name":"郊区"},
                {"name":"桦南县"},
                {"name":"桦川县"},
                {"name":"汤原县"},
                {"name":"抚远县"},
                {"name":"同江市"},
                {"name":"富锦市"}
            ]},
            {"name":"七台河市", "sub":[
                {"name":"新兴区"},
                {"name":"桃山区"},
                {"name":"茄子河区"},
                {"name":"勃利县"}
            ]},
            {"name":"牡丹江市", "sub":[
                {"name":"东安区"},
                {"name":"阳明区"},
                {"name":"爱民区"},
                {"name":"西安区"},
                {"name":"东宁县"},
                {"name":"林口县"},
                {"name":"绥芬河市"},
                {"name":"海林市"},
                {"name":"宁安市"},
                {"name":"穆棱市"}
            ]},
            {"name":"黑河市", "sub":[
                {"name":"爱辉区"},
                {"name":"嫩江县"},
                {"name":"逊克县"},
                {"name":"孙吴县"},
                {"name":"北安市"},
                {"name":"五大连池市"}
            ]},
            {"name":"绥化市", "sub":[
                {"name":"北林区"},
                {"name":"望奎县"},
                {"name":"兰西县"},
                {"name":"青冈县"},
                {"name":"庆安县"},
                {"name":"明水县"},
                {"name":"绥棱县"},
                {"name":"安达市"},
                {"name":"肇东市"},
                {"name":"海伦市"}
            ]},
            {"name":"大兴安岭地区", "sub":[
                {"name":"加格达奇区"},
                {"name":"松岭区"},
                {"name":"新林区"},
                {"name":"呼中区"},
                {"name":"呼玛县"},
                {"name":"塔河县"},
                {"name":"漠河县"}
            ]}
        ]},
        {"name":"上海市", "sub":[
            {"name":"上海市", "sub":[
                {"name":"黄浦区"},
                {"name":"卢湾区"},
                {"name":"徐汇区"},
                {"name":"长宁区"},
                {"name":"静安区"},
                {"name":"普陀区"},
                {"name":"闸北区"},
                {"name":"虹口区"},
                {"name":"杨浦区"},
                {"name":"闵行区"},
                {"name":"宝山区"},
                {"name":"嘉定区"},
                {"name":"浦东新区"},
                {"name":"金山区"},
                {"name":"松江区"},
                {"name":"青浦区"},
                {"name":"奉贤区"},
                {"name":"崇明区"}
            ]}
        ]},
        {"name":"江苏省", "sub":[
            {"name":"南京市", "sub":[
                {"name":"玄武区"},
                {"name":"白下区"},
                {"name":"秦淮区"},
                {"name":"建邺区"},
                {"name":"鼓楼区"},
                {"name":"下关区"},
                {"name":"浦口区"},
                {"name":"栖霞区"},
                {"name":"雨花台区"},
                {"name":"江宁区"},
                {"name":"六合区"},
                {"name":"溧水县"},
                {"name":"高淳县"}
            ]},
            {"name":"无锡市", "sub":[
                {"name":"崇安区"},
                {"name":"南长区"},
                {"name":"北塘区"},
                {"name":"锡山区"},
                {"name":"惠山区"},
                {"name":"滨湖区"},
                {"name":"江阴市"},
                {"name":"宜兴市"}
            ]},
            {"name":"徐州市", "sub":[
                {"name":"鼓楼区"},
                {"name":"云龙区"},
                {"name":"贾汪区"},
                {"name":"泉山区"},
                {"name":"铜山区"},
                {"name":"丰县"},
                {"name":"沛县"},
                {"name":"睢宁县"},
                {"name":"新沂市"},
                {"name":"邳州市"}
            ]},
            {"name":"常州市", "sub":[
                {"name":"天宁区"},
                {"name":"钟楼区"},
                {"name":"戚墅堰区"},
                {"name":"新北区"},
                {"name":"武进区"},
                {"name":"溧阳市"},
                {"name":"金坛市"}
            ]},
            {"name":"苏州市", "sub":[
                {"name":"沧浪区"},
                {"name":"平江区"},
                {"name":"金阊区"},
                {"name":"虎丘区"},
                {"name":"吴中区"},
                {"name":"相城区"},
                {"name":"常熟市"},
                {"name":"张家港市"},
                {"name":"昆山市"},
                {"name":"吴江市"},
                {"name":"太仓市"}
            ]},
            {"name":"南通市", "sub":[
                {"name":"崇川区"},
                {"name":"港闸区"},
                {"name":"通州区"},
                {"name":"海安县"},
                {"name":"如东县"},
                {"name":"启东市"},
                {"name":"如皋市"},
                {"name":"海门市"}
            ]},
            {"name":"连云港市", "sub":[
                {"name":"连云区"},
                {"name":"新浦区"},
                {"name":"海州区"},
                {"name":"赣榆县"},
                {"name":"东海县"},
                {"name":"灌云县"},
                {"name":"灌南县"}
            ]},
            {"name":"淮安市", "sub":[
                {"name":"清河区"},
                {"name":"楚州区"},
                {"name":"淮阴区"},
                {"name":"清浦区"},
                {"name":"涟水县"},
                {"name":"洪泽县"},
                {"name":"盱眙县"},
                {"name":"金湖县"}
            ]},
            {"name":"盐城市", "sub":[
                {"name":"亭湖区"},
                {"name":"盐都区"},
                {"name":"响水县"},
                {"name":"滨海县"},
                {"name":"阜宁县"},
                {"name":"射阳县"},
                {"name":"建湖县"},
                {"name":"东台市"},
                {"name":"大丰市"}
            ]},
            {"name":"扬州市", "sub":[
                {"name":"广陵区"},
                {"name":"邗江区"},
                {"name":"维扬区"},
                {"name":"宝应县"},
                {"name":"仪征市"},
                {"name":"高邮市"},
                {"name":"江都市"}
            ]},
            {"name":"镇江市", "sub":[
                {"name":"京口区"},
                {"name":"润州区"},
                {"name":"丹徒区"},
                {"name":"丹阳市"},
                {"name":"扬中市"},
                {"name":"句容市"}
            ]},
            {"name":"泰州市", "sub":[
                {"name":"海陵区"},
                {"name":"高港区"},
                {"name":"兴化市"},
                {"name":"靖江市"},
                {"name":"泰兴市"},
                {"name":"姜堰市"}
            ]},
            {"name":"宿迁市", "sub":[
                {"name":"宿城区"},
                {"name":"宿豫区"},
                {"name":"沭阳县"},
                {"name":"泗阳县"},
                {"name":"泗洪县"}
            ]}
        ]},
        {"name":"浙江省", "sub":[
            {"name":"杭州市", "sub":[
                {"name":"上城区"},
                {"name":"下城区"},
                {"name":"江干区"},
                {"name":"拱墅区"},
                {"name":"西湖区"},
                {"name":"滨江区"},
                {"name":"萧山区"},
                {"name":"余杭区"},
                {"name":"桐庐县"},
                {"name":"淳安县"},
                {"name":"建德市"},
                {"name":"富阳市"},
                {"name":"临安市"}
            ]},
            {"name":"宁波市", "sub":[
                {"name":"海曙区"},
                {"name":"江东区"},
                {"name":"江北区"},
                {"name":"北仑区"},
                {"name":"镇海区"},
                {"name":"鄞州区"},
                {"name":"象山县"},
                {"name":"宁海县"},
                {"name":"余姚市"},
                {"name":"慈溪市"},
                {"name":"奉化市"}
            ]},
            {"name":"温州市", "sub":[
                {"name":"鹿城区"},
                {"name":"龙湾区"},
                {"name":"瓯海区"},
                {"name":"洞头县"},
                {"name":"永嘉县"},
                {"name":"平阳县"},
                {"name":"苍南县"},
                {"name":"文成县"},
                {"name":"泰顺县"},
                {"name":"瑞安市"},
                {"name":"乐清市"}
            ]},
            {"name":"嘉兴市", "sub":[
                {"name":"南湖区"},
                {"name":"秀洲区"},
                {"name":"嘉善县"},
                {"name":"海盐县"},
                {"name":"海宁市"},
                {"name":"平湖市"},
                {"name":"桐乡市"}
            ]},
            {"name":"湖州市", "sub":[
                {"name":"吴兴区"},
                {"name":"南浔区"},
                {"name":"德清县"},
                {"name":"长兴县"},
                {"name":"安吉县"}
            ]},
            {"name":"绍兴市", "sub":[
                {"name":"越城区"},
                {"name":"绍兴县"},
                {"name":"新昌县"},
                {"name":"诸暨市"},
                {"name":"上虞市"},
                {"name":"嵊州市"}
            ]},
            {"name":"金华市", "sub":[
                {"name":"婺城区"},
                {"name":"金东区"},
                {"name":"武义县"},
                {"name":"浦江县"},
                {"name":"磐安县"},
                {"name":"兰溪市"},
                {"name":"义乌市"},
                {"name":"东阳市"},
                {"name":"永康市"}
            ]},
            {"name":"衢州市", "sub":[
                {"name":"柯城区"},
                {"name":"衢江区"},
                {"name":"常山县"},
                {"name":"开化县"},
                {"name":"龙游县"},
                {"name":"江山市"}
            ]},
            {"name":"舟山市", "sub":[
                {"name":"定海区"},
                {"name":"普陀区"},
                {"name":"岱山县"},
                {"name":"嵊泗县"}
            ]},
            {"name":"台州市", "sub":[
                {"name":"椒江区"},
                {"name":"黄岩区"},
                {"name":"路桥区"},
                {"name":"玉环县"},
                {"name":"三门县"},
                {"name":"天台县"},
                {"name":"仙居县"},
                {"name":"温岭市"},
                {"name":"临海市"}
            ]},
            {"name":"丽水市", "sub":[
                {"name":"莲都区"},
                {"name":"青田县"},
                {"name":"缙云县"},
                {"name":"遂昌县"},
                {"name":"松阳县"},
                {"name":"云和县"},
                {"name":"庆元县"},
                {"name":"景宁畲族自治县"},
                {"name":"龙泉市"}
            ]}
        ]},
        {"name":"安徽省", "sub":[
            {"name":"合肥市", "sub":[
                {"name":"瑶海区"},
                {"name":"庐阳区"},
                {"name":"蜀山区"},
                {"name":"包河区"},
                {"name":"长丰县"},
                {"name":"肥东县"},
                {"name":"肥西县"}
            ]},
            {"name":"芜湖市", "sub":[
                {"name":"镜湖区"},
                {"name":"弋江区"},
                {"name":"鸠江区"},
                {"name":"三山区"},
                {"name":"芜湖县"},
                {"name":"繁昌县"},
                {"name":"南陵县"}
            ]},
            {"name":"蚌埠市", "sub":[
                {"name":"龙子湖区"},
                {"name":"蚌山区"},
                {"name":"禹会区"},
                {"name":"淮上区"},
                {"name":"怀远县"},
                {"name":"五河县"},
                {"name":"固镇县"}
            ]},
            {"name":"淮南市", "sub":[
                {"name":"大通区"},
                {"name":"田家庵区"},
                {"name":"谢家集区"},
                {"name":"八公山区"},
                {"name":"潘集区"},
                {"name":"凤台县"}
            ]},
            {"name":"马鞍山市", "sub":[
                {"name":"金家庄区"},
                {"name":"花山区"},
                {"name":"雨山区"},
                {"name":"当涂县"}
            ]},
            {"name":"淮北市", "sub":[
                {"name":"杜集区"},
                {"name":"相山区"},
                {"name":"烈山区"},
                {"name":"濉溪县"}
            ]},
            {"name":"铜陵市", "sub":[
                {"name":"铜官山区"},
                {"name":"狮子山区"},
                {"name":"郊区"},
                {"name":"铜陵县"}
            ]},
            {"name":"安庆市", "sub":[
                {"name":"迎江区"},
                {"name":"大观区"},
                {"name":"宜秀区"},
                {"name":"怀宁县"},
                {"name":"枞阳县"},
                {"name":"潜山县"},
                {"name":"太湖县"},
                {"name":"宿松县"},
                {"name":"望江县"},
                {"name":"岳西县"},
                {"name":"桐城市"}
            ]},
            {"name":"黄山市", "sub":[
                {"name":"屯溪区"},
                {"name":"黄山区"},
                {"name":"徽州区"},
                {"name":"歙县"},
                {"name":"休宁县"},
                {"name":"黟县"},
                {"name":"祁门县"}
            ]},
            {"name":"滁州市", "sub":[
                {"name":"琅琊区"},
                {"name":"南谯区"},
                {"name":"来安县"},
                {"name":"全椒县"},
                {"name":"定远县"},
                {"name":"凤阳县"},
                {"name":"天长市"},
                {"name":"明光市"}
            ]},
            {"name":"阜阳市", "sub":[
                {"name":"颍州区"},
                {"name":"颍东区"},
                {"name":"颍泉区"},
                {"name":"临泉县"},
                {"name":"太和县"},
                {"name":"阜南县"},
                {"name":"颍上县"},
                {"name":"界首市"}
            ]},
            {"name":"宿州市", "sub":[
                {"name":"埇桥区"},
                {"name":"砀山县"},
                {"name":"萧县"},
                {"name":"灵璧县"},
                {"name":"泗县"}
            ]},
            {"name":"巢湖市", "sub":[
                {"name":"居巢区"},
                {"name":"庐江县"},
                {"name":"无为县"},
                {"name":"含山县"},
                {"name":"和县"}
            ]},
            {"name":"六安市", "sub":[
                {"name":"金安区"},
                {"name":"裕安区"},
                {"name":"寿县"},
                {"name":"霍邱县"},
                {"name":"舒城县"},
                {"name":"金寨县"},
                {"name":"霍山县"}
            ]},
            {"name":"亳州市", "sub":[
                {"name":"谯城区"},
                {"name":"涡阳县"},
                {"name":"蒙城县"},
                {"name":"利辛县"}
            ]},
            {"name":"池州市", "sub":[
                {"name":"贵池区"},
                {"name":"东至县"},
                {"name":"石台县"},
                {"name":"青阳县"}
            ]},
            {"name":"宣城市", "sub":[
                {"name":"宣州区"},
                {"name":"郎溪县"},
                {"name":"广德县"},
                {"name":"泾县"},
                {"name":"绩溪县"},
                {"name":"旌德县"},
                {"name":"宁国市"}
            ]}
        ]},
        {"name":"福建省", "sub":[
            {"name":"福州市", "sub":[
                {"name":"鼓楼区"},
                {"name":"台江区"},
                {"name":"仓山区"},
                {"name":"马尾区"},
                {"name":"晋安区"},
                {"name":"闽侯县"},
                {"name":"连江县"},
                {"name":"罗源县"},
                {"name":"闽清县"},
                {"name":"永泰县"},
                {"name":"平潭县"},
                {"name":"福清市"},
                {"name":"长乐市"}
            ]},
            {"name":"厦门市", "sub":[
                {"name":"思明区"},
                {"name":"海沧区"},
                {"name":"湖里区"},
                {"name":"集美区"},
                {"name":"同安区"},
                {"name":"翔安区"}
            ]},
            {"name":"莆田市", "sub":[
                {"name":"城厢区"},
                {"name":"涵江区"},
                {"name":"荔城区"},
                {"name":"秀屿区"},
                {"name":"仙游县"}
            ]},
            {"name":"三明市", "sub":[
                {"name":"梅列区"},
                {"name":"三元区"},
                {"name":"明溪县"},
                {"name":"清流县"},
                {"name":"宁化县"},
                {"name":"大田县"},
                {"name":"尤溪县"},
                {"name":"沙县"},
                {"name":"将乐县"},
                {"name":"泰宁县"},
                {"name":"建宁县"},
                {"name":"永安市"}
            ]},
            {"name":"泉州市", "sub":[
                {"name":"鲤城区"},
                {"name":"丰泽区"},
                {"name":"洛江区"},
                {"name":"泉港区"},
                {"name":"惠安县"},
                {"name":"安溪县"},
                {"name":"永春县"},
                {"name":"德化县"},
                {"name":"金门县"},
                {"name":"石狮市"},
                {"name":"晋江市"},
                {"name":"南安市"}
            ]},
            {"name":"漳州市", "sub":[
                {"name":"芗城区"},
                {"name":"龙文区"},
                {"name":"云霄县"},
                {"name":"漳浦县"},
                {"name":"诏安县"},
                {"name":"长泰县"},
                {"name":"东山县"},
                {"name":"南靖县"},
                {"name":"平和县"},
                {"name":"华安县"},
                {"name":"龙海市"}
            ]},
            {"name":"南平市", "sub":[
                {"name":"延平区"},
                {"name":"顺昌县"},
                {"name":"浦城县"},
                {"name":"光泽县"},
                {"name":"松溪县"},
                {"name":"政和县"},
                {"name":"邵武市"},
                {"name":"武夷山市"},
                {"name":"建瓯市"},
                {"name":"建阳市"}
            ]},
            {"name":"龙岩市", "sub":[
                {"name":"新罗区"},
                {"name":"长汀县"},
                {"name":"永定县"},
                {"name":"上杭县"},
                {"name":"武平县"},
                {"name":"连城县"},
                {"name":"漳平市"}
            ]},
            {"name":"宁德市", "sub":[
                {"name":"蕉城区"},
                {"name":"霞浦县"},
                {"name":"古田县"},
                {"name":"屏南县"},
                {"name":"寿宁县"},
                {"name":"周宁县"},
                {"name":"柘荣县"},
                {"name":"福安市"},
                {"name":"福鼎市"}
            ]}
        ]},
        {"name":"江西省", "sub":[
            {"name":"南昌市", "sub":[
                {"name":"东湖区"},
                {"name":"西湖区"},
                {"name":"青云谱区"},
                {"name":"湾里区"},
                {"name":"青山湖区"},
                {"name":"南昌县"},
                {"name":"新建县"},
                {"name":"安义县"},
                {"name":"进贤县"}
            ]},
            {"name":"景德镇市", "sub":[
                {"name":"昌江区"},
                {"name":"珠山区"},
                {"name":"浮梁县"},
                {"name":"乐平市"}
            ]},
            {"name":"萍乡市", "sub":[
                {"name":"安源区"},
                {"name":"湘东区"},
                {"name":"莲花县"},
                {"name":"上栗县"},
                {"name":"芦溪县"}
            ]},
            {"name":"九江市", "sub":[
                {"name":"庐山区"},
                {"name":"浔阳区"},
                {"name":"九江县"},
                {"name":"武宁县"},
                {"name":"修水县"},
                {"name":"永修县"},
                {"name":"德安县"},
                {"name":"星子县"},
                {"name":"都昌县"},
                {"name":"湖口县"},
                {"name":"彭泽县"},
                {"name":"瑞昌市"},
                {"name":"共青城市"}
            ]},
            {"name":"新余市", "sub":[
                {"name":"渝水区"},
                {"name":"分宜县"}
            ]},
            {"name":"鹰潭市", "sub":[
                {"name":"月湖区"},
                {"name":"余江县"},
                {"name":"贵溪市"}
            ]},
            {"name":"赣州市", "sub":[
                {"name":"章贡区"},
                {"name":"赣县"},
                {"name":"信丰县"},
                {"name":"大余县"},
                {"name":"上犹县"},
                {"name":"崇义县"},
                {"name":"安远县"},
                {"name":"龙南县"},
                {"name":"定南县"},
                {"name":"全南县"},
                {"name":"宁都县"},
                {"name":"于都县"},
                {"name":"兴国县"},
                {"name":"会昌县"},
                {"name":"寻乌县"},
                {"name":"石城县"},
                {"name":"瑞金市"},
                {"name":"南康市"}
            ]},
            {"name":"吉安市", "sub":[
                {"name":"吉州区"},
                {"name":"青原区"},
                {"name":"吉安县"},
                {"name":"吉水县"},
                {"name":"峡江县"},
                {"name":"新干县"},
                {"name":"永丰县"},
                {"name":"泰和县"},
                {"name":"遂川县"},
                {"name":"万安县"},
                {"name":"安福县"},
                {"name":"永新县"},
                {"name":"井冈山市"}
            ]},
            {"name":"宜春市", "sub":[
                {"name":"袁州区"},
                {"name":"奉新县"},
                {"name":"万载县"},
                {"name":"上高县"},
                {"name":"宜丰县"},
                {"name":"靖安县"},
                {"name":"铜鼓县"},
                {"name":"丰城市"},
                {"name":"樟树市"},
                {"name":"高安市"}
            ]},
            {"name":"抚州市", "sub":[
                {"name":"临川区"},
                {"name":"南城县"},
                {"name":"黎川县"},
                {"name":"南丰县"},
                {"name":"崇仁县"},
                {"name":"乐安县"},
                {"name":"宜黄县"},
                {"name":"金溪县"},
                {"name":"资溪县"},
                {"name":"东乡县"},
                {"name":"广昌县"}
            ]},
            {"name":"上饶市", "sub":[
                {"name":"信州区"},
                {"name":"上饶县"},
                {"name":"广丰县"},
                {"name":"玉山县"},
                {"name":"铅山县"},
                {"name":"横峰县"},
                {"name":"弋阳县"},
                {"name":"余干县"},
                {"name":"鄱阳县"},
                {"name":"万年县"},
                {"name":"婺源县"},
                {"name":"德兴市"}
            ]}
        ]},
        {"name":"山东省", "sub":[
            {"name":"济南市", "sub":[
                {"name":"历下区"},
                {"name":"市中区"},
                {"name":"槐荫区"},
                {"name":"天桥区"},
                {"name":"历城区"},
                {"name":"长清区"},
                {"name":"平阴县"},
                {"name":"济阳县"},
                {"name":"商河县"},
                {"name":"章丘市"}
            ]},
            {"name":"青岛市", "sub":[
                {"name":"市南区"},
                {"name":"市北区"},
                {"name":"四方区"},
                {"name":"黄岛区"},
                {"name":"崂山区"},
                {"name":"李沧区"},
                {"name":"城阳区"},
                {"name":"胶州市"},
                {"name":"即墨市"},
                {"name":"平度市"},
                {"name":"胶南市"},
                {"name":"莱西市"}
            ]},
            {"name":"淄博市", "sub":[
                {"name":"淄川区"},
                {"name":"张店区"},
                {"name":"博山区"},
                {"name":"临淄区"},
                {"name":"周村区"},
                {"name":"桓台县"},
                {"name":"高青县"},
                {"name":"沂源县"}
            ]},
            {"name":"枣庄市", "sub":[
                {"name":"市中区"},
                {"name":"薛城区"},
                {"name":"峄城区"},
                {"name":"台儿庄区"},
                {"name":"山亭区"},
                {"name":"滕州市"}
            ]},
            {"name":"东营市", "sub":[
                {"name":"东营区"},
                {"name":"河口区"},
                {"name":"垦利县"},
                {"name":"利津县"},
                {"name":"广饶县"}
            ]},
            {"name":"烟台市", "sub":[
                {"name":"芝罘区"},
                {"name":"福山区"},
                {"name":"牟平区"},
                {"name":"莱山区"},
                {"name":"长岛县"},
                {"name":"龙口市"},
                {"name":"莱阳市"},
                {"name":"莱州市"},
                {"name":"蓬莱市"},
                {"name":"招远市"},
                {"name":"栖霞市"},
                {"name":"海阳市"}
            ]},
            {"name":"潍坊市", "sub":[
                {"name":"潍城区"},
                {"name":"寒亭区"},
                {"name":"坊子区"},
                {"name":"奎文区"},
                {"name":"临朐县"},
                {"name":"昌乐县"},
                {"name":"青州市"},
                {"name":"诸城市"},
                {"name":"寿光市"},
                {"name":"安丘市"},
                {"name":"高密市"},
                {"name":"昌邑市"}
            ]},
            {"name":"济宁市", "sub":[
                {"name":"市中区"},
                {"name":"任城区"},
                {"name":"微山县"},
                {"name":"鱼台县"},
                {"name":"金乡县"},
                {"name":"嘉祥县"},
                {"name":"汶上县"},
                {"name":"泗水县"},
                {"name":"梁山县"},
                {"name":"曲阜市"},
                {"name":"兖州市"},
                {"name":"邹城市"}
            ]},
            {"name":"泰安市", "sub":[
                {"name":"泰山区"},
                {"name":"岱岳区"},
                {"name":"宁阳县"},
                {"name":"东平县"},
                {"name":"新泰市"},
                {"name":"肥城市"}
            ]},
            {"name":"威海市", "sub":[
                {"name":"环翠区"},
                {"name":"文登市"},
                {"name":"荣成市"},
                {"name":"乳山市"}
            ]},
            {"name":"日照市", "sub":[
                {"name":"东港区"},
                {"name":"岚山区"},
                {"name":"五莲县"},
                {"name":"莒县"}
            ]},
            {"name":"莱芜市", "sub":[
                {"name":"莱城区"},
                {"name":"钢城区"}
            ]},
            {"name":"临沂市", "sub":[
                {"name":"兰山区"},
                {"name":"罗庄区"},
                {"name":"河东区"},
                {"name":"沂南县"},
                {"name":"郯城县"},
                {"name":"沂水县"},
                {"name":"苍山县"},
                {"name":"费县"},
                {"name":"平邑县"},
                {"name":"莒南县"},
                {"name":"蒙阴县"},
                {"name":"临沭县"}
            ]},
            {"name":"德州市", "sub":[
                {"name":"德城区"},
                {"name":"陵县"},
                {"name":"宁津县"},
                {"name":"庆云县"},
                {"name":"临邑县"},
                {"name":"齐河县"},
                {"name":"平原县"},
                {"name":"夏津县"},
                {"name":"武城县"},
                {"name":"乐陵市"},
                {"name":"禹城市"}
            ]},
            {"name":"聊城市", "sub":[
                {"name":"东昌府区"},
                {"name":"阳谷县"},
                {"name":"莘县"},
                {"name":"茌平县"},
                {"name":"东阿县"},
                {"name":"冠县"},
                {"name":"高唐县"},
                {"name":"临清市"}
            ]},
            {"name":"滨州市", "sub":[
                {"name":"滨城区"},
                {"name":"惠民县"},
                {"name":"阳信县"},
                {"name":"无棣县"},
                {"name":"沾化县"},
                {"name":"博兴县"},
                {"name":"邹平县"}
            ]},
            {"name":"菏泽市", "sub":[
                {"name":"牡丹区"},
                {"name":"曹县"},
                {"name":"单县"},
                {"name":"成武县"},
                {"name":"巨野县"},
                {"name":"郓城县"},
                {"name":"鄄城县"},
                {"name":"定陶县"},
                {"name":"东明县"}
            ]}
        ]},
        {"name":"河南省", "sub":[
            {"name":"郑州市", "sub":[
                {"name":"中原区"},
                {"name":"二七区"},
                {"name":"管城回族区"},
                {"name":"金水区"},
                {"name":"上街区"},
                {"name":"惠济区"},
                {"name":"中牟县"},
                {"name":"巩义市"},
                {"name":"荥阳市"},
                {"name":"新密市"},
                {"name":"新郑市"},
                {"name":"登封市"}
            ]},
            {"name":"开封市", "sub":[
                {"name":"龙亭区"},
                {"name":"顺河回族区"},
                {"name":"鼓楼区"},
                {"name":"禹王台区"},
                {"name":"金明区"},
                {"name":"杞县"},
                {"name":"通许县"},
                {"name":"尉氏县"},
                {"name":"开封县"},
                {"name":"兰考县"}
            ]},
            {"name":"洛阳市", "sub":[
                {"name":"老城区"},
                {"name":"西工区"},
                {"name":"瀍河回族区"},
                {"name":"涧西区"},
                {"name":"吉利区"},
                {"name":"洛龙区"},
                {"name":"孟津县"},
                {"name":"新安县"},
                {"name":"栾川县"},
                {"name":"嵩县"},
                {"name":"汝阳县"},
                {"name":"宜阳县"},
                {"name":"洛宁县"},
                {"name":"伊川县"},
                {"name":"偃师市"}
            ]},
            {"name":"平顶山市", "sub":[
                {"name":"新华区"},
                {"name":"卫东区"},
                {"name":"石龙区"},
                {"name":"湛河区"},
                {"name":"宝丰县"},
                {"name":"叶县"},
                {"name":"鲁山县"},
                {"name":"郏县"},
                {"name":"舞钢市"},
                {"name":"汝州市"}
            ]},
            {"name":"安阳市", "sub":[
                {"name":"文峰区"},
                {"name":"北关区"},
                {"name":"殷都区"},
                {"name":"龙安区"},
                {"name":"安阳县"},
                {"name":"汤阴县"},
                {"name":"滑县"},
                {"name":"内黄县"},
                {"name":"林州市"}
            ]},
            {"name":"鹤壁市", "sub":[
                {"name":"鹤山区"},
                {"name":"山城区"},
                {"name":"淇滨区"},
                {"name":"浚县"},
                {"name":"淇县"}
            ]},
            {"name":"新乡市", "sub":[
                {"name":"红旗区"},
                {"name":"卫滨区"},
                {"name":"凤泉区"},
                {"name":"牧野区"},
                {"name":"新乡县"},
                {"name":"获嘉县"},
                {"name":"原阳县"},
                {"name":"延津县"},
                {"name":"封丘县"},
                {"name":"长垣县"},
                {"name":"卫辉市"},
                {"name":"辉县市"}
            ]},
            {"name":"焦作市", "sub":[
                {"name":"解放区"},
                {"name":"中站区"},
                {"name":"马村区"},
                {"name":"山阳区"},
                {"name":"修武县"},
                {"name":"博爱县"},
                {"name":"武陟县"},
                {"name":"温县"},
                {"name":"沁阳市"},
                {"name":"孟州市"}
            ]},
            {"name":"濮阳市", "sub":[
                {"name":"华龙区"},
                {"name":"清丰县"},
                {"name":"南乐县"},
                {"name":"范县"},
                {"name":"台前县"},
                {"name":"濮阳县"}
            ]},
            {"name":"许昌市", "sub":[
                {"name":"魏都区"},
                {"name":"许昌县"},
                {"name":"鄢陵县"},
                {"name":"襄城县"},
                {"name":"禹州市"},
                {"name":"长葛市"}
            ]},
            {"name":"漯河市", "sub":[
                {"name":"源汇区"},
                {"name":"郾城区"},
                {"name":"召陵区"},
                {"name":"舞阳县"},
                {"name":"临颍县"}
            ]},
            {"name":"三门峡市", "sub":[
                {"name":"湖滨区"},
                {"name":"渑池县"},
                {"name":"陕县"},
                {"name":"卢氏县"},
                {"name":"义马市"},
                {"name":"灵宝市"}
            ]},
            {"name":"南阳市", "sub":[
                {"name":"宛城区"},
                {"name":"卧龙区"},
                {"name":"南召县"},
                {"name":"方城县"},
                {"name":"西峡县"},
                {"name":"镇平县"},
                {"name":"内乡县"},
                {"name":"淅川县"},
                {"name":"社旗县"},
                {"name":"唐河县"},
                {"name":"新野县"},
                {"name":"桐柏县"},
                {"name":"邓州市"}
            ]},
            {"name":"商丘市", "sub":[
                {"name":"梁园区"},
                {"name":"睢阳区"},
                {"name":"民权县"},
                {"name":"睢县"},
                {"name":"宁陵县"},
                {"name":"柘城县"},
                {"name":"虞城县"},
                {"name":"夏邑县"},
                {"name":"永城市"}
            ]},
            {"name":"信阳市", "sub":[
                {"name":"浉河区"},
                {"name":"平桥区"},
                {"name":"罗山县"},
                {"name":"光山县"},
                {"name":"新县"},
                {"name":"商城县"},
                {"name":"固始县"},
                {"name":"潢川县"},
                {"name":"淮滨县"},
                {"name":"息县"}
            ]},
            {"name":"周口市", "sub":[
                {"name":"川汇区"},
                {"name":"扶沟县"},
                {"name":"西华县"},
                {"name":"商水县"},
                {"name":"沈丘县"},
                {"name":"郸城县"},
                {"name":"淮阳县"},
                {"name":"太康县"},
                {"name":"鹿邑县"},
                {"name":"项城市"}
            ]},
            {"name":"驻马店市", "sub":[
                {"name":"驿城区"},
                {"name":"西平县"},
                {"name":"上蔡县"},
                {"name":"平舆县"},
                {"name":"正阳县"},
                {"name":"确山县"},
                {"name":"泌阳县"},
                {"name":"汝南县"},
                {"name":"遂平县"},
                {"name":"新蔡县"}
            ]},
            {"name":"省直辖县级行政区划", "sub":[
                {"name":"济源市"}
            ]}
        ]},
        {"name":"湖北省", "sub":[
            {"name":"武汉市", "sub":[
                {"name":"江岸区"},
                {"name":"江汉区"},
                {"name":"硚口区"},
                {"name":"汉阳区"},
                {"name":"武昌区"},
                {"name":"青山区"},
                {"name":"洪山区"},
                {"name":"东西湖区"},
                {"name":"汉南区"},
                {"name":"蔡甸区"},
                {"name":"江夏区"},
                {"name":"黄陂区"},
                {"name":"新洲区"}
            ]},
            {"name":"黄石市", "sub":[
                {"name":"黄石港区"},
                {"name":"西塞山区"},
                {"name":"下陆区"},
                {"name":"铁山区"},
                {"name":"阳新县"},
                {"name":"大冶市"}
            ]},
            {"name":"十堰市", "sub":[
                {"name":"茅箭区"},
                {"name":"张湾区"},
                {"name":"郧县"},
                {"name":"郧西县"},
                {"name":"竹山县"},
                {"name":"竹溪县"},
                {"name":"房县"},
                {"name":"丹江口市"}
            ]},
            {"name":"宜昌市", "sub":[
                {"name":"西陵区"},
                {"name":"伍家岗区"},
                {"name":"点军区"},
                {"name":"猇亭区"},
                {"name":"夷陵区"},
                {"name":"远安县"},
                {"name":"兴山县"},
                {"name":"秭归县"},
                {"name":"长阳土家族自治县"},
                {"name":"五峰土家族自治县"},
                {"name":"宜都市"},
                {"name":"当阳市"},
                {"name":"枝江市"}
            ]},
            {"name":"襄樊市", "sub":[
                {"name":"襄城区"},
                {"name":"樊城区"},
                {"name":"襄阳区"},
                {"name":"南漳县"},
                {"name":"谷城县"},
                {"name":"保康县"},
                {"name":"老河口市"},
                {"name":"枣阳市"},
                {"name":"宜城市"}
            ]},
            {"name":"鄂州市", "sub":[
                {"name":"梁子湖区"},
                {"name":"华容区"},
                {"name":"鄂城区"}
            ]},
            {"name":"荆门市", "sub":[
                {"name":"东宝区"},
                {"name":"掇刀区"},
                {"name":"京山县"},
                {"name":"沙洋县"},
                {"name":"钟祥市"}
            ]},
            {"name":"孝感市", "sub":[
                {"name":"孝南区"},
                {"name":"孝昌县"},
                {"name":"大悟县"},
                {"name":"云梦县"},
                {"name":"应城市"},
                {"name":"安陆市"},
                {"name":"汉川市"}
            ]},
            {"name":"荆州市", "sub":[
                {"name":"沙市区"},
                {"name":"荆州区"},
                {"name":"公安县"},
                {"name":"监利县"},
                {"name":"江陵县"},
                {"name":"石首市"},
                {"name":"洪湖市"},
                {"name":"松滋市"}
            ]},
            {"name":"黄冈市", "sub":[
                {"name":"黄州区"},
                {"name":"团风县"},
                {"name":"红安县"},
                {"name":"罗田县"},
                {"name":"英山县"},
                {"name":"浠水县"},
                {"name":"蕲春县"},
                {"name":"黄梅县"},
                {"name":"麻城市"},
                {"name":"武穴市"}
            ]},
            {"name":"咸宁市", "sub":[
                {"name":"咸安区"},
                {"name":"嘉鱼县"},
                {"name":"通城县"},
                {"name":"崇阳县"},
                {"name":"通山县"},
                {"name":"赤壁市"}
            ]},
            {"name":"随州市", "sub":[
                {"name":"曾都区"},
                {"name":"随县"},
                {"name":"广水市"}
            ]},
            {"name":"恩施土家族苗族自治州", "sub":[
                {"name":"恩施市"},
                {"name":"利川市"},
                {"name":"建始县"},
                {"name":"巴东县"},
                {"name":"宣恩县"},
                {"name":"咸丰县"},
                {"name":"来凤县"},
                {"name":"鹤峰县"}
            ]},
            {"name":"省直辖县级行政区划", "sub":[
                {"name":"仙桃市"},
                {"name":"潜江市"},
                {"name":"天门市"},
                {"name":"神农架林区"}
            ]}
        ]},
        {"name":"湖南省", "sub":[
            {"name":"长沙市", "sub":[
                {"name":"芙蓉区"},
                {"name":"天心区"},
                {"name":"岳麓区"},
                {"name":"开福区"},
                {"name":"雨花区"},
                {"name":"长沙县"},
                {"name":"望城县"},
                {"name":"宁乡县"},
                {"name":"浏阳市"}
            ]},
            {"name":"株洲市", "sub":[
                {"name":"荷塘区"},
                {"name":"芦淞区"},
                {"name":"石峰区"},
                {"name":"天元区"},
                {"name":"株洲县"},
                {"name":"攸县"},
                {"name":"茶陵县"},
                {"name":"炎陵县"},
                {"name":"醴陵市"}
            ]},
            {"name":"湘潭市", "sub":[
                {"name":"雨湖区"},
                {"name":"岳塘区"},
                {"name":"湘潭县"},
                {"name":"湘乡市"},
                {"name":"韶山市"}
            ]},
            {"name":"衡阳市", "sub":[
                {"name":"珠晖区"},
                {"name":"雁峰区"},
                {"name":"石鼓区"},
                {"name":"蒸湘区"},
                {"name":"南岳区"},
                {"name":"衡阳县"},
                {"name":"衡南县"},
                {"name":"衡山县"},
                {"name":"衡东县"},
                {"name":"祁东县"},
                {"name":"耒阳市"},
                {"name":"常宁市"}
            ]},
            {"name":"邵阳市", "sub":[
                {"name":"双清区"},
                {"name":"大祥区"},
                {"name":"北塔区"},
                {"name":"邵东县"},
                {"name":"新邵县"},
                {"name":"邵阳县"},
                {"name":"隆回县"},
                {"name":"洞口县"},
                {"name":"绥宁县"},
                {"name":"新宁县"},
                {"name":"城步苗族自治县"},
                {"name":"武冈市"}
            ]},
            {"name":"岳阳市", "sub":[
                {"name":"岳阳楼区"},
                {"name":"云溪区"},
                {"name":"君山区"},
                {"name":"岳阳县"},
                {"name":"华容县"},
                {"name":"湘阴县"},
                {"name":"平江县"},
                {"name":"汨罗市"},
                {"name":"临湘市"}
            ]},
            {"name":"常德市", "sub":[
                {"name":"武陵区"},
                {"name":"鼎城区"},
                {"name":"安乡县"},
                {"name":"汉寿县"},
                {"name":"澧县"},
                {"name":"临澧县"},
                {"name":"桃源县"},
                {"name":"石门县"},
                {"name":"津市市"}
            ]},
            {"name":"张家界市", "sub":[
                {"name":"永定区"},
                {"name":"武陵源区"},
                {"name":"慈利县"},
                {"name":"桑植县"}
            ]},
            {"name":"益阳市", "sub":[
                {"name":"资阳区"},
                {"name":"赫山区"},
                {"name":"南县"},
                {"name":"桃江县"},
                {"name":"安化县"},
                {"name":"沅江市"}
            ]},
            {"name":"郴州市", "sub":[
                {"name":"北湖区"},
                {"name":"苏仙区"},
                {"name":"桂阳县"},
                {"name":"宜章县"},
                {"name":"永兴县"},
                {"name":"嘉禾县"},
                {"name":"临武县"},
                {"name":"汝城县"},
                {"name":"桂东县"},
                {"name":"安仁县"},
                {"name":"资兴市"}
            ]},
            {"name":"永州市", "sub":[
                {"name":"零陵区"},
                {"name":"冷水滩区"},
                {"name":"祁阳县"},
                {"name":"东安县"},
                {"name":"双牌县"},
                {"name":"道县"},
                {"name":"江永县"},
                {"name":"宁远县"},
                {"name":"蓝山县"},
                {"name":"新田县"},
                {"name":"江华瑶族自治县"}
            ]},
            {"name":"怀化市", "sub":[
                {"name":"鹤城区"},
                {"name":"中方县"},
                {"name":"沅陵县"},
                {"name":"辰溪县"},
                {"name":"溆浦县"},
                {"name":"会同县"},
                {"name":"麻阳苗族自治县"},
                {"name":"新晃侗族自治县"},
                {"name":"芷江侗族自治县"},
                {"name":"靖州苗族侗族自治县"},
                {"name":"通道侗族自治县"},
                {"name":"洪江市"}
            ]},
            {"name":"娄底市", "sub":[
                {"name":"娄星区"},
                {"name":"双峰县"},
                {"name":"新化县"},
                {"name":"冷水江市"},
                {"name":"涟源市"}
            ]},
            {"name":"湘西土家族苗族自治州", "sub":[
                {"name":"吉首市"},
                {"name":"泸溪县"},
                {"name":"凤凰县"},
                {"name":"花垣县"},
                {"name":"保靖县"},
                {"name":"古丈县"},
                {"name":"永顺县"},
                {"name":"龙山县"}
            ]}
        ]},
        {"name":"广东省", "sub":[
            {"name":"广州市", "sub":[
                {"name":"荔湾区"},
                {"name":"越秀区"},
                {"name":"海珠区"},
                {"name":"天河区"},
                {"name":"白云区"},
                {"name":"黄埔区"},
                {"name":"番禺区"},
                {"name":"花都区"},
                {"name":"南沙区"},
                {"name":"萝岗区"},
                {"name":"增城市"},
                {"name":"从化市"}
            ]},
            {"name":"韶关市", "sub":[
                {"name":"武江区"},
                {"name":"浈江区"},
                {"name":"曲江区"},
                {"name":"始兴县"},
                {"name":"仁化县"},
                {"name":"翁源县"},
                {"name":"乳源瑶族自治县"},
                {"name":"新丰县"},
                {"name":"乐昌市"},
                {"name":"南雄市"}
            ]},
            {"name":"深圳市", "sub":[
                {"name":"罗湖区"},
                {"name":"福田区"},
                {"name":"南山区"},
                {"name":"宝安区"},
                {"name":"龙岗区"},
                {"name":"盐田区"}
            ]},
            {"name":"珠海市", "sub":[
                {"name":"香洲区"},
                {"name":"斗门区"},
                {"name":"金湾区"}
            ]},
            {"name":"汕头市", "sub":[
                {"name":"龙湖区"},
                {"name":"金平区"},
                {"name":"濠江区"},
                {"name":"潮阳区"},
                {"name":"潮南区"},
                {"name":"澄海区"},
                {"name":"南澳县"}
            ]},
            {"name":"佛山市", "sub":[
                {"name":"禅城区"},
                {"name":"南海区"},
                {"name":"顺德区"},
                {"name":"三水区"},
                {"name":"高明区"}
            ]},
            {"name":"江门市", "sub":[
                {"name":"蓬江区"},
                {"name":"江海区"},
                {"name":"新会区"},
                {"name":"台山市"},
                {"name":"开平市"},
                {"name":"鹤山市"},
                {"name":"恩平市"}
            ]},
            {"name":"湛江市", "sub":[
                {"name":"赤坎区"},
                {"name":"霞山区"},
                {"name":"坡头区"},
                {"name":"麻章区"},
                {"name":"遂溪县"},
                {"name":"徐闻县"},
                {"name":"廉江市"},
                {"name":"雷州市"},
                {"name":"吴川市"}
            ]},
            {"name":"茂名市", "sub":[
                {"name":"茂南区"},
                {"name":"茂港区"},
                {"name":"电白县"},
                {"name":"高州市"},
                {"name":"化州市"},
                {"name":"信宜市"}
            ]},
            {"name":"肇庆市", "sub":[
                {"name":"端州区"},
                {"name":"鼎湖区"},
                {"name":"广宁县"},
                {"name":"怀集县"},
                {"name":"封开县"},
                {"name":"德庆县"},
                {"name":"高要市"},
                {"name":"四会市"}
            ]},
            {"name":"惠州市", "sub":[
                {"name":"惠城区"},
                {"name":"惠阳区"},
                {"name":"博罗县"},
                {"name":"惠东县"},
                {"name":"龙门县"}
            ]},
            {"name":"梅州市", "sub":[
                {"name":"梅江区"},
                {"name":"梅县"},
                {"name":"大埔县"},
                {"name":"丰顺县"},
                {"name":"五华县"},
                {"name":"平远县"},
                {"name":"蕉岭县"},
                {"name":"兴宁市"}
            ]},
            {"name":"汕尾市", "sub":[
                {"name":"城区"},
                {"name":"海丰县"},
                {"name":"陆河县"},
                {"name":"陆丰市"}
            ]},
            {"name":"河源市", "sub":[
                {"name":"源城区"},
                {"name":"紫金县"},
                {"name":"龙川县"},
                {"name":"连平县"},
                {"name":"和平县"},
                {"name":"东源县"}
            ]},
            {"name":"阳江市", "sub":[
                {"name":"江城区"},
                {"name":"阳西县"},
                {"name":"阳东县"},
                {"name":"阳春市"}
            ]},
            {"name":"清远市", "sub":[
                {"name":"清城区"},
                {"name":"佛冈县"},
                {"name":"阳山县"},
                {"name":"连山壮族瑶族自治县"},
                {"name":"连南瑶族自治县"},
                {"name":"清新县"},
                {"name":"英德市"},
                {"name":"连州市"}
            ]},
            {"name":"东莞市", "sub":[
                {"name":"市辖区"}
            ]},
            {"name":"中山市", "sub":[
                {"name":"市辖区"}
            ]},
            {"name":"潮州市", "sub":[
                {"name":"湘桥区"},
                {"name":"潮安县"},
                {"name":"饶平县"}
            ]},
            {"name":"揭阳市", "sub":[
                {"name":"榕城区"},
                {"name":"揭东县"},
                {"name":"揭西县"},
                {"name":"惠来县"},
                {"name":"普宁市"}
            ]},
            {"name":"云浮市", "sub":[
                {"name":"云城区"},
                {"name":"新兴县"},
                {"name":"郁南县"},
                {"name":"云安县"},
                {"name":"罗定市"}
            ]}
        ]},
        {"name":"广西壮族自治区", "sub":[
            {"name":"南宁市", "sub":[
                {"name":"兴宁区"},
                {"name":"青秀区"},
                {"name":"江南区"},
                {"name":"西乡塘区"},
                {"name":"良庆区"},
                {"name":"邕宁区"},
                {"name":"武鸣县"},
                {"name":"隆安县"},
                {"name":"马山县"},
                {"name":"上林县"},
                {"name":"宾阳县"},
                {"name":"横县"}
            ]},
            {"name":"柳州市", "sub":[
                {"name":"城中区"},
                {"name":"鱼峰区"},
                {"name":"柳南区"},
                {"name":"柳北区"},
                {"name":"柳江县"},
                {"name":"柳城县"},
                {"name":"鹿寨县"},
                {"name":"融安县"},
                {"name":"融水苗族自治县"},
                {"name":"三江侗族自治县"}
            ]},
            {"name":"桂林市", "sub":[
                {"name":"秀峰区"},
                {"name":"叠彩区"},
                {"name":"象山区"},
                {"name":"七星区"},
                {"name":"雁山区"},
                {"name":"阳朔县"},
                {"name":"临桂县"},
                {"name":"灵川县"},
                {"name":"全州县"},
                {"name":"兴安县"},
                {"name":"永福县"},
                {"name":"灌阳县"},
                {"name":"龙胜各族自治县"},
                {"name":"资源县"},
                {"name":"平乐县"},
                {"name":"荔蒲县"},
                {"name":"恭城瑶族自治县"}
            ]},
            {"name":"梧州市", "sub":[
                {"name":"万秀区"},
                {"name":"蝶山区"},
                {"name":"长洲区"},
                {"name":"苍梧县"},
                {"name":"藤县"},
                {"name":"蒙山县"},
                {"name":"岑溪市"}
            ]},
            {"name":"北海市", "sub":[
                {"name":"海城区"},
                {"name":"银海区"},
                {"name":"铁山港区"},
                {"name":"合浦县"}
            ]},
            {"name":"防城港市", "sub":[
                {"name":"港口区"},
                {"name":"防城区"},
                {"name":"上思县"},
                {"name":"东兴市"}
            ]},
            {"name":"钦州市", "sub":[
                {"name":"钦南区"},
                {"name":"钦北区"},
                {"name":"灵山县"},
                {"name":"浦北县"}
            ]},
            {"name":"贵港市", "sub":[
                {"name":"港北区"},
                {"name":"港南区"},
                {"name":"覃塘区"},
                {"name":"平南县"},
                {"name":"桂平市"}
            ]},
            {"name":"玉林市", "sub":[
                {"name":"玉州区"},
                {"name":"容县"},
                {"name":"陆川县"},
                {"name":"博白县"},
                {"name":"兴业县"},
                {"name":"北流市"}
            ]},
            {"name":"百色市", "sub":[
                {"name":"右江区"},
                {"name":"田阳县"},
                {"name":"田东县"},
                {"name":"平果县"},
                {"name":"德保县"},
                {"name":"靖西县"},
                {"name":"那坡县"},
                {"name":"凌云县"},
                {"name":"乐业县"},
                {"name":"田林县"},
                {"name":"西林县"},
                {"name":"隆林各族自治县"}
            ]},
            {"name":"贺州市", "sub":[
                {"name":"八步区"},
                {"name":"平桂管理区"},
                {"name":"昭平县"},
                {"name":"钟山县"},
                {"name":"富川瑶族自治县"}
            ]},
            {"name":"河池市", "sub":[
                {"name":"金城江区"},
                {"name":"南丹县"},
                {"name":"天峨县"},
                {"name":"凤山县"},
                {"name":"东兰县"},
                {"name":"罗城仫佬族自治县"},
                {"name":"环江毛南族自治县"},
                {"name":"巴马瑶族自治县"},
                {"name":"都安瑶族自治县"},
                {"name":"大化瑶族自治县"},
                {"name":"宜州市"}
            ]},
            {"name":"来宾市", "sub":[
                {"name":"兴宾区"},
                {"name":"忻城县"},
                {"name":"象州县"},
                {"name":"武宣县"},
                {"name":"金秀瑶族自治县"},
                {"name":"合山市"}
            ]},
            {"name":"崇左市", "sub":[
                {"name":"江洲区"},
                {"name":"扶绥县"},
                {"name":"宁明县"},
                {"name":"龙州县"},
                {"name":"大新县"},
                {"name":"天等县"},
                {"name":"凭祥市"}
            ]}
        ]},
        {"name":"海南省", "sub":[
            {"name":"海口市", "sub":[
                {"name":"秀英区"},
                {"name":"龙华区"},
                {"name":"琼山区"},
                {"name":"美兰区"}
            ]},
            {"name":"三亚市", "sub":[
                {"name":"市辖区"}
            ]},
            {"name":"省直辖县级行政区划", "sub":[
                {"name":"五指山市"},
                {"name":"琼海市"},
                {"name":"儋州市"},
                {"name":"文昌市"},
                {"name":"万宁市"},
                {"name":"东方市"},
                {"name":"定安县"},
                {"name":"屯昌县"},
                {"name":"澄迈县"},
                {"name":"临高县"},
                {"name":"白沙黎族自治县"},
                {"name":"昌江黎族自治县"},
                {"name":"乐东黎族自治县"},
                {"name":"陵水黎族自治县"},
                {"name":"保亭黎族苗族自治县"},
                {"name":"琼中黎族苗族自治县"},
                {"name":"西沙群岛"},
                {"name":"南沙群岛"},
                {"name":"中沙群岛的岛礁及其海域"}
            ]}
        ]},
        {"name":"重庆市", "sub":[
            {"name":"重庆市", "sub":[
                {"name":"万州区"},
                {"name":"涪陵区"},
                {"name":"渝中区"},
                {"name":"大渡口区"},
                {"name":"江北区"},
                {"name":"沙坪坝区"},
                {"name":"九龙坡区"},
                {"name":"南岸区"},
                {"name":"北碚区"},
                {"name":"万盛区"},
                {"name":"双桥区"},
                {"name":"渝北区"},
                {"name":"巴南区"},
                {"name":"黔江区"},
                {"name":"长寿区"},
                {"name":"江津区"},
                {"name":"合川区"},
                {"name":"永川区"},
                {"name":"南川区"},
                {"name":"綦江县"},
                {"name":"潼南县"},
                {"name":"铜梁县"},
                {"name":"大足县"},
                {"name":"荣昌县"},
                {"name":"璧山县"},
                {"name":"梁平县"},
                {"name":"城口县"},
                {"name":"丰都县"},
                {"name":"垫江县"},
                {"name":"武隆县"},
                {"name":"忠县"},
                {"name":"开县"},
                {"name":"云阳县"},
                {"name":"奉节县"},
                {"name":"巫山县"},
                {"name":"巫溪县"},
                {"name":"石柱土家族自治县"},
                {"name":"秀山土家族苗族自治县"},
                {"name":"酉阳土家族苗族自治县"},
                {"name":"彭水苗族土家族自治县"}
            ]}
        ]},
        {"name":"四川省", "sub":[
            {"name":"成都市", "sub":[
                {"name":"锦江区"},
                {"name":"青羊区"},
                {"name":"金牛区"},
                {"name":"武侯区"},
                {"name":"成华区"},
                {"name":"龙泉驿区"},
                {"name":"青白江区"},
                {"name":"新都区"},
                {"name":"温江区"},
                {"name":"金堂县"},
                {"name":"双流县"},
                {"name":"郫县"},
                {"name":"大邑县"},
                {"name":"蒲江县"},
                {"name":"新津县"},
                {"name":"都江堰市"},
                {"name":"彭州市"},
                {"name":"邛崃市"},
                {"name":"崇州市"}
            ]},
            {"name":"自贡市", "sub":[
                {"name":"自流井区"},
                {"name":"贡井区"},
                {"name":"大安区"},
                {"name":"沿滩区"},
                {"name":"荣县"},
                {"name":"富顺县"}
            ]},
            {"name":"攀枝花市", "sub":[
                {"name":"东区"},
                {"name":"西区"},
                {"name":"仁和区"},
                {"name":"米易县"},
                {"name":"盐边县"}
            ]},
            {"name":"泸州市", "sub":[
                {"name":"江阳区"},
                {"name":"纳溪区"},
                {"name":"龙马潭区"},
                {"name":"泸县"},
                {"name":"合江县"},
                {"name":"叙永县"},
                {"name":"古蔺县"}
            ]},
            {"name":"德阳市", "sub":[
                {"name":"旌阳区"},
                {"name":"中江县"},
                {"name":"罗江县"},
                {"name":"广汉市"},
                {"name":"什邡市"},
                {"name":"绵竹市"}
            ]},
            {"name":"绵阳市", "sub":[
                {"name":"涪城区"},
                {"name":"游仙区"},
                {"name":"三台县"},
                {"name":"盐亭县"},
                {"name":"安县"},
                {"name":"梓潼县"},
                {"name":"北川羌族自治县"},
                {"name":"平武县"},
                {"name":"江油市"}
            ]},
            {"name":"广元市", "sub":[
                {"name":"利州区"},
                {"name":"元坝区"},
                {"name":"朝天区"},
                {"name":"旺苍县"},
                {"name":"青川县"},
                {"name":"剑阁县"},
                {"name":"苍溪县"}
            ]},
            {"name":"遂宁市", "sub":[
                {"name":"船山区"},
                {"name":"安居区"},
                {"name":"蓬溪县"},
                {"name":"射洪县"},
                {"name":"大英县"}
            ]},
            {"name":"内江市", "sub":[
                {"name":"市中区"},
                {"name":"东兴区"},
                {"name":"威远县"},
                {"name":"资中县"},
                {"name":"隆昌县"}
            ]},
            {"name":"乐山市", "sub":[
                {"name":"市中区"},
                {"name":"沙湾区"},
                {"name":"五通桥区"},
                {"name":"金口河区"},
                {"name":"犍为县"},
                {"name":"井研县"},
                {"name":"夹江县"},
                {"name":"沐川县"},
                {"name":"峨边彝族自治县"},
                {"name":"马边彝族自治县"},
                {"name":"峨眉山市"}
            ]},
            {"name":"南充市", "sub":[
                {"name":"顺庆区"},
                {"name":"高坪区"},
                {"name":"嘉陵区"},
                {"name":"南部县"},
                {"name":"营山县"},
                {"name":"蓬安县"},
                {"name":"仪陇县"},
                {"name":"西充县"},
                {"name":"阆中市"}
            ]},
            {"name":"眉山市", "sub":[
                {"name":"东坡区"},
                {"name":"仁寿县"},
                {"name":"彭山县"},
                {"name":"洪雅县"},
                {"name":"丹棱县"},
                {"name":"青神县"}
            ]},
            {"name":"宜宾市", "sub":[
                {"name":"翠屏区"},
                {"name":"宜宾县"},
                {"name":"南溪县"},
                {"name":"江安县"},
                {"name":"长宁县"},
                {"name":"高县"},
                {"name":"珙县"},
                {"name":"筠连县"},
                {"name":"兴文县"},
                {"name":"屏山县"}
            ]},
            {"name":"广安市", "sub":[
                {"name":"广安区"},
                {"name":"岳池县"},
                {"name":"武胜县"},
                {"name":"邻水县"},
                {"name":"华蓥市"}
            ]},
            {"name":"达州市", "sub":[
                {"name":"通川区"},
                {"name":"达县"},
                {"name":"宣汉县"},
                {"name":"开江县"},
                {"name":"大竹县"},
                {"name":"渠县"},
                {"name":"万源市"}
            ]},
            {"name":"雅安市", "sub":[
                {"name":"雨城区"},
                {"name":"名山县"},
                {"name":"荥经县"},
                {"name":"汉源县"},
                {"name":"石棉县"},
                {"name":"天全县"},
                {"name":"芦山县"},
                {"name":"宝兴县"}
            ]},
            {"name":"巴中市", "sub":[
                {"name":"巴州区"},
                {"name":"通江县"},
                {"name":"南江县"},
                {"name":"平昌县"}
            ]},
            {"name":"资阳市", "sub":[
                {"name":"雁江区"},
                {"name":"安岳县"},
                {"name":"乐至县"},
                {"name":"简阳市"}
            ]},
            {"name":"阿坝藏族羌族自治州", "sub":[
                {"name":"汶川县"},
                {"name":"理县"},
                {"name":"茂县"},
                {"name":"松潘县"},
                {"name":"九寨沟县"},
                {"name":"金川县"},
                {"name":"小金县"},
                {"name":"黑水县"},
                {"name":"马尔康县"},
                {"name":"壤塘县"},
                {"name":"阿坝县"},
                {"name":"若尔盖县"},
                {"name":"红原县"}
            ]},
            {"name":"甘孜藏族自治州", "sub":[
                {"name":"康定县"},
                {"name":"泸定县"},
                {"name":"丹巴县"},
                {"name":"九龙县"},
                {"name":"雅江县"},
                {"name":"道孚县"},
                {"name":"炉霍县"},
                {"name":"甘孜县"},
                {"name":"新龙县"},
                {"name":"德格县"},
                {"name":"白玉县"},
                {"name":"石渠县"},
                {"name":"色达县"},
                {"name":"理塘县"},
                {"name":"巴塘县"},
                {"name":"乡城县"},
                {"name":"稻城县"},
                {"name":"得荣县"}
            ]},
            {"name":"凉山彝族自治州", "sub":[
                {"name":"西昌市"},
                {"name":"木里藏族自治县"},
                {"name":"盐源县"},
                {"name":"德昌县"},
                {"name":"会理县"},
                {"name":"会东县"},
                {"name":"宁南县"},
                {"name":"普格县"},
                {"name":"布拖县"},
                {"name":"金阳县"},
                {"name":"昭觉县"},
                {"name":"喜德县"},
                {"name":"冕宁县"},
                {"name":"越西县"},
                {"name":"甘洛县"},
                {"name":"美姑县"},
                {"name":"雷波县"}
            ]}
        ]},
        {"name":"贵州省", "sub":[
            {"name":"贵阳市", "sub":[
                {"name":"南明区"},
                {"name":"云岩区"},
                {"name":"花溪区"},
                {"name":"乌当区"},
                {"name":"白云区"},
                {"name":"小河区"},
                {"name":"开阳县"},
                {"name":"息烽县"},
                {"name":"修文县"},
                {"name":"清镇市"}
            ]},
            {"name":"六盘水市", "sub":[
                {"name":"钟山区"},
                {"name":"六枝特区"},
                {"name":"水城县"},
                {"name":"盘县"}
            ]},
            {"name":"遵义市", "sub":[
                {"name":"红花岗区"},
                {"name":"汇川区"},
                {"name":"遵义县"},
                {"name":"桐梓县"},
                {"name":"绥阳县"},
                {"name":"正安县"},
                {"name":"道真仡佬族苗族自治县"},
                {"name":"务川仡佬族苗族自治县"},
                {"name":"凤冈县"},
                {"name":"湄潭县"},
                {"name":"余庆县"},
                {"name":"习水县"},
                {"name":"赤水市"},
                {"name":"仁怀市"}
            ]},
            {"name":"安顺市", "sub":[
                {"name":"西秀区"},
                {"name":"平坝县"},
                {"name":"普定县"},
                {"name":"镇宁布依族苗族自治县"},
                {"name":"关岭布依族苗族自治县"},
                {"name":"紫云苗族布依族自治县"}
            ]},
            {"name":"铜仁地区", "sub":[
                {"name":"铜仁市"},
                {"name":"江口县"},
                {"name":"玉屏侗族自治县"},
                {"name":"石阡县"},
                {"name":"思南县"},
                {"name":"印江土家族苗族自治县"},
                {"name":"德江县"},
                {"name":"沿河土家族自治县"},
                {"name":"松桃苗族自治县"},
                {"name":"万山特区"}
            ]},
            {"name":"黔西南布依族苗族自治州", "sub":[
                {"name":"兴义市"},
                {"name":"兴仁县"},
                {"name":"普安县"},
                {"name":"晴隆县"},
                {"name":"贞丰县"},
                {"name":"望谟县"},
                {"name":"册亨县"},
                {"name":"安龙县"}
            ]},
            {"name":"毕节地区", "sub":[
                {"name":"毕节市"},
                {"name":"大方县"},
                {"name":"黔西县"},
                {"name":"金沙县"},
                {"name":"织金县"},
                {"name":"纳雍县"},
                {"name":"威宁彝族回族苗族自治县"},
                {"name":"赫章县"}
            ]},
            {"name":"黔东南苗族侗族自治州", "sub":[
                {"name":"凯里市"},
                {"name":"黄平县"},
                {"name":"施秉县"},
                {"name":"三穗县"},
                {"name":"镇远县"},
                {"name":"岑巩县"},
                {"name":"天柱县"},
                {"name":"锦屏县"},
                {"name":"剑河县"},
                {"name":"台江县"},
                {"name":"黎平县"},
                {"name":"榕江县"},
                {"name":"从江县"},
                {"name":"雷山县"},
                {"name":"麻江县"},
                {"name":"丹寨县"}
            ]},
            {"name":"黔南布依族苗族自治州", "sub":[
                {"name":"都匀市"},
                {"name":"福泉市"},
                {"name":"荔波县"},
                {"name":"贵定县"},
                {"name":"瓮安县"},
                {"name":"独山县"},
                {"name":"平塘县"},
                {"name":"罗甸县"},
                {"name":"长顺县"},
                {"name":"龙里县"},
                {"name":"惠水县"},
                {"name":"三都水族自治县"}
            ]}
        ]},
        {"name":"云南省", "sub":[
            {"name":"昆明市", "sub":[
                {"name":"五华区"},
                {"name":"盘龙区"},
                {"name":"官渡区"},
                {"name":"西山区"},
                {"name":"东川区"},
                {"name":"呈贡县"},
                {"name":"晋宁县"},
                {"name":"富民县"},
                {"name":"宜良县"},
                {"name":"石林彝族自治县"},
                {"name":"嵩明县"},
                {"name":"禄劝彝族苗族自治县"},
                {"name":"寻甸回族彝族自治县"},
                {"name":"安宁市"}
            ]},
            {"name":"曲靖市", "sub":[
                {"name":"麒麟区"},
                {"name":"马龙县"},
                {"name":"陆良县"},
                {"name":"师宗县"},
                {"name":"罗平县"},
                {"name":"富源县"},
                {"name":"会泽县"},
                {"name":"沾益县"},
                {"name":"宣威市"}
            ]},
            {"name":"玉溪市", "sub":[
                {"name":"红塔区"},
                {"name":"江川县"},
                {"name":"澄江县"},
                {"name":"通海县"},
                {"name":"华宁县"},
                {"name":"易门县"},
                {"name":"峨山彝族自治县"},
                {"name":"新平彝族傣族自治县"},
                {"name":"元江哈尼族彝族傣族自治县"}
            ]},
            {"name":"保山市", "sub":[
                {"name":"隆阳区"},
                {"name":"施甸县"},
                {"name":"腾冲县"},
                {"name":"龙陵县"},
                {"name":"昌宁县"}
            ]},
            {"name":"昭通市", "sub":[
                {"name":"昭阳区"},
                {"name":"鲁甸县"},
                {"name":"巧家县"},
                {"name":"盐津县"},
                {"name":"大关县"},
                {"name":"永善县"},
                {"name":"绥江县"},
                {"name":"镇雄县"},
                {"name":"彝良县"},
                {"name":"威信县"},
                {"name":"水富县"}
            ]},
            {"name":"丽江市", "sub":[
                {"name":"古城区"},
                {"name":"玉龙纳西族自治县"},
                {"name":"永胜县"},
                {"name":"华坪县"},
                {"name":"宁蒗彝族自治县"}
            ]},
            {"name":"普洱市", "sub":[
                {"name":"思茅区"},
                {"name":"宁洱哈尼族彝族自治县"},
                {"name":"墨江哈尼族自治县"},
                {"name":"景东彝族自治县"},
                {"name":"景谷傣族彝族自治县"},
                {"name":"镇沅彝族哈尼族拉祜族自治县"},
                {"name":"江城哈尼族彝族自治县"},
                {"name":"孟连傣族拉祜族佤族自治县"},
                {"name":"澜沧拉祜族自治县"},
                {"name":"西盟佤族自治县"}
            ]},
            {"name":"临沧市", "sub":[
                {"name":"临翔区"},
                {"name":"凤庆县"},
                {"name":"云县"},
                {"name":"永德县"},
                {"name":"镇康县"},
                {"name":"双江拉祜族佤族布朗族傣族自治县"},
                {"name":"耿马傣族佤族自治县"},
                {"name":"沧源佤族自治县"}
            ]},
            {"name":"楚雄彝族自治州", "sub":[
                {"name":"楚雄市"},
                {"name":"双柏县"},
                {"name":"牟定县"},
                {"name":"南华县"},
                {"name":"姚安县"},
                {"name":"大姚县"},
                {"name":"永仁县"},
                {"name":"元谋县"},
                {"name":"武定县"},
                {"name":"禄丰县"}
            ]},
            {"name":"红河哈尼族彝族自治州", "sub":[
                {"name":"个旧市"},
                {"name":"开远市"},
                {"name":"蒙自市"},
                {"name":"屏边苗族自治县"},
                {"name":"建水县"},
                {"name":"石屏县"},
                {"name":"弥勒县"},
                {"name":"泸西县"},
                {"name":"元阳县"},
                {"name":"红河县"},
                {"name":"金平苗族瑶族傣族自治县"},
                {"name":"绿春县"},
                {"name":"河口瑶族自治县"}
            ]},
            {"name":"文山壮族苗族自治州", "sub":[
                {"name":"文山县"},
                {"name":"砚山县"},
                {"name":"西畴县"},
                {"name":"麻栗坡县"},
                {"name":"马关县"},
                {"name":"丘北县"},
                {"name":"广南县"},
                {"name":"富宁县"}
            ]},
            {"name":"西双版纳傣族自治州", "sub":[
                {"name":"景洪市"},
                {"name":"勐海县"},
                {"name":"勐腊县"}
            ]},
            {"name":"大理白族自治州", "sub":[
                {"name":"大理市"},
                {"name":"漾濞彝族自治县"},
                {"name":"祥云县"},
                {"name":"宾川县"},
                {"name":"弥渡县"},
                {"name":"南涧彝族自治县"},
                {"name":"巍山彝族回族自治县"},
                {"name":"永平县"},
                {"name":"云龙县"},
                {"name":"洱源县"},
                {"name":"剑川县"},
                {"name":"鹤庆县"}
            ]},
            {"name":"德宏傣族景颇族自治州", "sub":[
                {"name":"瑞丽市"},
                {"name":"芒市"},
                {"name":"梁河县"},
                {"name":"盈江县"},
                {"name":"陇川县"}
            ]},
            {"name":"怒江傈僳族自治州", "sub":[
                {"name":"泸水县"},
                {"name":"福贡县"},
                {"name":"贡山独龙族怒族自治县"},
                {"name":"兰坪白族普米族自治县"}
            ]},
            {"name":"迪庆藏族自治州", "sub":[
                {"name":"香格里拉县"},
                {"name":"德钦县"},
                {"name":"维西傈僳族自治县"}
            ]}
        ]},
        {"name":"西藏自治区", "sub":[
            {"name":"拉萨市", "sub":[
                {"name":"城关区"},
                {"name":"林周县"},
                {"name":"当雄县"},
                {"name":"尼木县"},
                {"name":"曲水县"},
                {"name":"堆龙德庆县"},
                {"name":"达孜县"},
                {"name":"墨竹工卡县"}
            ]},
            {"name":"昌都地区", "sub":[
                {"name":"昌都县"},
                {"name":"江达县"},
                {"name":"贡觉县"},
                {"name":"类乌齐县"},
                {"name":"丁青县"},
                {"name":"察雅县"},
                {"name":"八宿县"},
                {"name":"左贡县"},
                {"name":"芒康县"},
                {"name":"洛隆县"},
                {"name":"边坝县"}
            ]},
            {"name":"山南地区", "sub":[
                {"name":"乃东县"},
                {"name":"扎囊县"},
                {"name":"贡嘎县"},
                {"name":"桑日县"},
                {"name":"琼结县"},
                {"name":"曲松县"},
                {"name":"措美县"},
                {"name":"洛扎县"},
                {"name":"加查县"},
                {"name":"隆子县"},
                {"name":"错那县"},
                {"name":"浪卡子县"}
            ]},
            {"name":"日喀则地区", "sub":[
                {"name":"日喀则市"},
                {"name":"南木林县"},
                {"name":"江孜县"},
                {"name":"定日县"},
                {"name":"萨迦县"},
                {"name":"拉孜县"},
                {"name":"昂仁县"},
                {"name":"谢通门县"},
                {"name":"白朗县"},
                {"name":"仁布县"},
                {"name":"康马县"},
                {"name":"定结县"},
                {"name":"仲巴县"},
                {"name":"亚东县"},
                {"name":"吉隆县"},
                {"name":"聂拉木县"},
                {"name":"萨嘎县"},
                {"name":"岗巴县"}
            ]},
            {"name":"那曲地区", "sub":[
                {"name":"那曲县"},
                {"name":"嘉黎县"},
                {"name":"比如县"},
                {"name":"聂荣县"},
                {"name":"安多县"},
                {"name":"申扎县"},
                {"name":"索县"},
                {"name":"班戈县"},
                {"name":"巴青县"},
                {"name":"尼玛县"}
            ]},
            {"name":"阿里地区", "sub":[
                {"name":"普兰县"},
                {"name":"札达县"},
                {"name":"噶尔县"},
                {"name":"日土县"},
                {"name":"革吉县"},
                {"name":"改则县"},
                {"name":"措勤县"}
            ]},
            {"name":"林芝地区", "sub":[
                {"name":"林芝县"},
                {"name":"工布江达县"},
                {"name":"米林县"},
                {"name":"墨脱县"},
                {"name":"波密县"},
                {"name":"察隅县"},
                {"name":"朗县"}
            ]}
        ]},
        {"name":"陕西省", "sub":[
            {"name":"西安市", "sub":[
                {"name":"新城区"},
                {"name":"碑林区"},
                {"name":"莲湖区"},
                {"name":"灞桥区"},
                {"name":"未央区"},
                {"name":"雁塔区"},
                {"name":"阎良区"},
                {"name":"临潼区"},
                {"name":"长安区"},
                {"name":"蓝田县"},
                {"name":"周至县"},
                {"name":"户县"},
                {"name":"高陵县"}
            ]},
            {"name":"铜川市", "sub":[
                {"name":"王益区"},
                {"name":"印台区"},
                {"name":"耀州区"},
                {"name":"宜君县"}
            ]},
            {"name":"宝鸡市", "sub":[
                {"name":"渭滨区"},
                {"name":"金台区"},
                {"name":"陈仓区"},
                {"name":"凤翔县"},
                {"name":"岐山县"},
                {"name":"扶风县"},
                {"name":"眉县"},
                {"name":"陇县"},
                {"name":"千阳县"},
                {"name":"麟游县"},
                {"name":"凤县"},
                {"name":"太白县"}
            ]},
            {"name":"咸阳市", "sub":[
                {"name":"秦都区"},
                {"name":"杨陵区"},
                {"name":"渭城区"},
                {"name":"三原县"},
                {"name":"泾阳县"},
                {"name":"乾县"},
                {"name":"礼泉县"},
                {"name":"永寿县"},
                {"name":"彬县"},
                {"name":"长武县"},
                {"name":"旬邑县"},
                {"name":"淳化县"},
                {"name":"武功县"},
                {"name":"兴平市"}
            ]},
            {"name":"渭南市", "sub":[
                {"name":"临渭区"},
                {"name":"华县"},
                {"name":"潼关县"},
                {"name":"大荔县"},
                {"name":"合阳县"},
                {"name":"澄城县"},
                {"name":"蒲城县"},
                {"name":"白水县"},
                {"name":"富平县"},
                {"name":"韩城市"},
                {"name":"华阴市"}
            ]},
            {"name":"延安市", "sub":[
                {"name":"宝塔区"},
                {"name":"延长县"},
                {"name":"延川县"},
                {"name":"子长县"},
                {"name":"安塞县"},
                {"name":"志丹县"},
                {"name":"吴起县"},
                {"name":"甘泉县"},
                {"name":"富县"},
                {"name":"洛川县"},
                {"name":"宜川县"},
                {"name":"黄龙县"},
                {"name":"黄陵县"}
            ]},
            {"name":"汉中市", "sub":[
                {"name":"汉台区"},
                {"name":"南郑县"},
                {"name":"城固县"},
                {"name":"洋县"},
                {"name":"西乡县"},
                {"name":"勉县"},
                {"name":"宁强县"},
                {"name":"略阳县"},
                {"name":"镇巴县"},
                {"name":"留坝县"},
                {"name":"佛坪县"}
            ]},
            {"name":"榆林市", "sub":[
                {"name":"榆阳区"},
                {"name":"神木县"},
                {"name":"府谷县"},
                {"name":"横山县"},
                {"name":"靖边县"},
                {"name":"定边县"},
                {"name":"绥德县"},
                {"name":"米脂县"},
                {"name":"佳县"},
                {"name":"吴堡县"},
                {"name":"清涧县"},
                {"name":"子洲县"}
            ]},
            {"name":"安康市", "sub":[
                {"name":"汉滨区"},
                {"name":"汉阴县"},
                {"name":"石泉县"},
                {"name":"宁陕县"},
                {"name":"紫阳县"},
                {"name":"岚皋县"},
                {"name":"平利县"},
                {"name":"镇坪县"},
                {"name":"旬阳县"},
                {"name":"白河县"}
            ]},
            {"name":"商洛市", "sub":[
                {"name":"商州区"},
                {"name":"洛南县"},
                {"name":"丹凤县"},
                {"name":"商南县"},
                {"name":"山阳县"},
                {"name":"镇安县"},
                {"name":"柞水县"}
            ]}
        ]},
        {"name":"甘肃省", "sub":[
            {"name":"兰州市", "sub":[
                {"name":"城关区"},
                {"name":"七里河区"},
                {"name":"西固区"},
                {"name":"安宁区"},
                {"name":"红古区"},
                {"name":"永登县"},
                {"name":"皋兰县"},
                {"name":"榆中县"}
            ]},
            {"name":"嘉峪关市", "sub":[
                {"name":"市辖区"}
            ]},
            {"name":"金昌市", "sub":[
                {"name":"金川区"},
                {"name":"永昌县"}
            ]},
            {"name":"白银市", "sub":[
                {"name":"白银区"},
                {"name":"平川区"},
                {"name":"靖远县"},
                {"name":"会宁县"},
                {"name":"景泰县"}
            ]},
            {"name":"天水市", "sub":[
                {"name":"秦州区"},
                {"name":"麦积区"},
                {"name":"清水县"},
                {"name":"秦安县"},
                {"name":"甘谷县"},
                {"name":"武山县"},
                {"name":"张家川回族自治县"}
            ]},
            {"name":"武威市", "sub":[
                {"name":"凉州区"},
                {"name":"民勤县"},
                {"name":"古浪县"},
                {"name":"天祝藏族自治县"}
            ]},
            {"name":"张掖市", "sub":[
                {"name":"甘州区"},
                {"name":"肃南裕固族自治县"},
                {"name":"民乐县"},
                {"name":"临泽县"},
                {"name":"高台县"},
                {"name":"山丹县"}
            ]},
            {"name":"平凉市", "sub":[
                {"name":"崆峒区"},
                {"name":"泾川县"},
                {"name":"灵台县"},
                {"name":"崇信县"},
                {"name":"华亭县"},
                {"name":"庄浪县"},
                {"name":"静宁县"}
            ]},
            {"name":"酒泉市", "sub":[
                {"name":"肃州区"},
                {"name":"金塔县"},
                {"name":"瓜州县"},
                {"name":"肃北蒙古族自治县"},
                {"name":"阿克塞哈萨克族自治县"},
                {"name":"玉门市"},
                {"name":"敦煌市"}
            ]},
            {"name":"庆阳市", "sub":[
                {"name":"西峰区"},
                {"name":"庆城县"},
                {"name":"环县"},
                {"name":"华池县"},
                {"name":"合水县"},
                {"name":"正宁县"},
                {"name":"宁县"},
                {"name":"镇原县"}
            ]},
            {"name":"定西市", "sub":[
                {"name":"安定区"},
                {"name":"通渭县"},
                {"name":"陇西县"},
                {"name":"渭源县"},
                {"name":"临洮县"},
                {"name":"漳县"},
                {"name":"岷县"}
            ]},
            {"name":"陇南市", "sub":[
                {"name":"武都区"},
                {"name":"成县"},
                {"name":"文县"},
                {"name":"宕昌县"},
                {"name":"康县"},
                {"name":"西和县"},
                {"name":"礼县"},
                {"name":"徽县"},
                {"name":"两当县"}
            ]},
            {"name":"临夏回族自治州", "sub":[
                {"name":"临夏市"},
                {"name":"临夏县"},
                {"name":"康乐县"},
                {"name":"永靖县"},
                {"name":"广河县"},
                {"name":"和政县"},
                {"name":"东乡族自治县"},
                {"name":"积石山保安族东乡族撒拉族自治县"}
            ]},
            {"name":"甘南藏族自治州", "sub":[
                {"name":"合作市"},
                {"name":"临潭县"},
                {"name":"卓尼县"},
                {"name":"舟曲县"},
                {"name":"迭部县"},
                {"name":"玛曲县"},
                {"name":"碌曲县"},
                {"name":"夏河县"}
            ]}
        ]},
        {"name":"青海省", "sub":[
            {"name":"西宁市", "sub":[
                {"name":"城东区"},
                {"name":"城中区"},
                {"name":"城西区"},
                {"name":"城北区"},
                {"name":"大通回族土族自治县"},
                {"name":"湟中县"},
                {"name":"湟源县"}
            ]},
            {"name":"海东地区", "sub":[
                {"name":"平安县"},
                {"name":"民和回族土族自治县"},
                {"name":"乐都县"},
                {"name":"互助土族自治县"},
                {"name":"化隆回族自治县"},
                {"name":"循化撒拉族自治县"}
            ]},
            {"name":"海北藏族自治州", "sub":[
                {"name":"门源回族自治县"},
                {"name":"祁连县"},
                {"name":"海晏县"},
                {"name":"刚察县"}
            ]},
            {"name":"黄南藏族自治州", "sub":[
                {"name":"同仁县"},
                {"name":"尖扎县"},
                {"name":"泽库县"},
                {"name":"河南蒙古族自治县"}
            ]},
            {"name":"海南藏族自治州", "sub":[
                {"name":"共和县"},
                {"name":"同德县"},
                {"name":"贵德县"},
                {"name":"兴海县"},
                {"name":"贵南县"}
            ]},
            {"name":"果洛藏族自治州", "sub":[
                {"name":"玛沁县"},
                {"name":"班玛县"},
                {"name":"甘德县"},
                {"name":"达日县"},
                {"name":"久治县"},
                {"name":"玛多县"}
            ]},
            {"name":"玉树藏族自治州", "sub":[
                {"name":"玉树县"},
                {"name":"杂多县"},
                {"name":"称多县"},
                {"name":"治多县"},
                {"name":"囊谦县"},
                {"name":"曲麻莱县"}
            ]},
            {"name":"海西蒙古族藏族自治州", "sub":[
                {"name":"格尔木市"},
                {"name":"德令哈市"},
                {"name":"乌兰县"},
                {"name":"都兰县"},
                {"name":"天峻县"}
            ]}
        ]},
        {"name":"宁夏回族自治区", "sub":[
            {"name":"银川市", "sub":[
                {"name":"兴庆区"},
                {"name":"西夏区"},
                {"name":"金凤区"},
                {"name":"永宁县"},
                {"name":"贺兰县"},
                {"name":"灵武市"}
            ]},
            {"name":"石嘴山市", "sub":[
                {"name":"大武口区"},
                {"name":"惠农区"},
                {"name":"平罗县"}
            ]},
            {"name":"吴忠市", "sub":[
                {"name":"利通区"},
                {"name":"红寺堡区"},
                {"name":"盐池县"},
                {"name":"同心县"},
                {"name":"青铜峡市"}
            ]},
            {"name":"固原市", "sub":[
                {"name":"原州区"},
                {"name":"西吉县"},
                {"name":"隆德县"},
                {"name":"泾源县"},
                {"name":"彭阳县"}
            ]},
            {"name":"中卫市", "sub":[
                {"name":"沙坡头区"},
                {"name":"中宁县"},
                {"name":"海原县"}
            ]}
        ]},
        {"name":"新疆维吾尔自治区", "sub":[
            {"name":"乌鲁木齐市", "sub":[
                {"name":"天山区"},
                {"name":"沙依巴克区"},
                {"name":"新市区"},
                {"name":"水磨沟区"},
                {"name":"头屯河区"},
                {"name":"达坂城区"},
                {"name":"米东区"},
                {"name":"乌鲁木齐县"}
            ]},
            {"name":"克拉玛依市", "sub":[
                {"name":"独山子区"},
                {"name":"克拉玛依区"},
                {"name":"白碱滩区"},
                {"name":"乌尔禾区"}
            ]},
            {"name":"吐鲁番地区", "sub":[
                {"name":"吐鲁番市"},
                {"name":"鄯善县"},
                {"name":"托克逊县"}
            ]},
            {"name":"哈密地区", "sub":[
                {"name":"哈密市"},
                {"name":"巴里坤哈萨克自治县"},
                {"name":"伊吾县"}
            ]},
            {"name":"昌吉回族自治州", "sub":[
                {"name":"昌吉市"},
                {"name":"阜康市"},
                {"name":"呼图壁县"},
                {"name":"玛纳斯县"},
                {"name":"奇台县"},
                {"name":"吉木萨尔县"},
                {"name":"木垒哈萨克自治县"}
            ]},
            {"name":"博尔塔拉蒙古自治州", "sub":[
                {"name":"博乐市"},
                {"name":"精河县"},
                {"name":"温泉县"}
            ]},
            {"name":"巴音郭楞蒙古自治州", "sub":[
                {"name":"库尔勒市"},
                {"name":"轮台县"},
                {"name":"尉犁县"},
                {"name":"若羌县"},
                {"name":"且末县"},
                {"name":"焉耆回族自治县"},
                {"name":"和静县"},
                {"name":"和硕县"},
                {"name":"博湖县"}
            ]},
            {"name":"阿克苏地区", "sub":[
                {"name":"阿克苏市"},
                {"name":"温宿县"},
                {"name":"库车县"},
                {"name":"沙雅县"},
                {"name":"新和县"},
                {"name":"拜城县"},
                {"name":"乌什县"},
                {"name":"阿瓦提县"},
                {"name":"柯坪县"}
            ]},
            {"name":"克孜勒苏柯尔克孜自治州", "sub":[
                {"name":"阿图什市"},
                {"name":"阿克陶县"},
                {"name":"阿合奇县"},
                {"name":"乌恰县"}
            ]},
            {"name":"喀什地区", "sub":[
                {"name":"喀什市"},
                {"name":"疏附县"},
                {"name":"疏勒县"},
                {"name":"英吉沙县"},
                {"name":"泽普县"},
                {"name":"莎车县"},
                {"name":"叶城县"},
                {"name":"麦盖提县"},
                {"name":"岳普湖县"},
                {"name":"伽师县"},
                {"name":"巴楚县"},
                {"name":"塔什库尔干塔吉克自治县"}
            ]},
            {"name":"和田地区", "sub":[
                {"name":"和田市"},
                {"name":"和田县"},
                {"name":"墨玉县"},
                {"name":"皮山县"},
                {"name":"洛浦县"},
                {"name":"策勒县"},
                {"name":"于田县"},
                {"name":"民丰县"}
            ]},
            {"name":"伊犁哈萨克自治州", "sub":[
                {"name":"伊宁市"},
                {"name":"奎屯市"},
                {"name":"伊宁县"},
                {"name":"察布查尔锡伯自治县"},
                {"name":"霍城县"},
                {"name":"巩留县"},
                {"name":"新源县"},
                {"name":"昭苏县"},
                {"name":"特克斯县"},
                {"name":"尼勒克县"}
            ]},
            {"name":"塔城地区", "sub":[
                {"name":"塔城市"},
                {"name":"乌苏市"},
                {"name":"额敏县"},
                {"name":"沙湾县"},
                {"name":"托里县"},
                {"name":"裕民县"},
                {"name":"和布克赛尔蒙古自治县"}
            ]},
            {"name":"阿勒泰地区", "sub":[
                {"name":"阿勒泰市"},
                {"name":"布尔津县"},
                {"name":"富蕴县"},
                {"name":"福海县"},
                {"name":"哈巴河县"},
                {"name":"青河县"},
                {"name":"吉木乃县"}
            ]},
            {"name":"自治区直辖县级行政区划", "sub":[
                {"name":"石河子市"},
                {"name":"阿拉尔市"},
                {"name":"图木舒克市"},
                {"name":"五家渠市"}
            ]}
        ]}
    ];
})()

;/**import from `/resource/js/mobile/shiyong/rent_phone/order_confirm.js` **/
;(function () {
    $(function () {
        // 订单确认页
        if(!$('.page-order-confirm') || !$('.page-order-confirm').length){ return}

        var __Data = {
            sn: {
                item_desc: '送价值188意外保险，保障您的爱机安全无忧'
            },
            lbf: {
                item_desc: '无需押金，快速办理'
            }
        }

        var SwipeSection = window.Bang.SwipeSection;

        // 显示租用协议
        function showAgreement(){
            var
                html_fn = $.tmpl( $.trim($('#JsMZuAgreementConfirmTpl').html())),
                html_st = html_fn()

            SwipeSection.getSwipeSection()
            SwipeSection.fillSwipeSection(html_st)

            var
                $swipe = SwipeSection.getLastSwipeSection()

            $swipe.show()
            setTimeout(function(){

                $swipe.find('.mobile-experience-agreement').css({
                    height: $swipe.height()
                });

                SwipeSection.doLeftSwipeSection(0, function(){
                    $swipe.find('.mobile-experience-agreement').css({
                        height: $swipe.height()
                    })
                })
            }, 1)
        }
        // 关闭租用协议
        function closeAgreement(){

            SwipeSection.backLeftSwipeSection()
        }

        tcb.bindEvent({
            '.js-trigger-show-service-content': function (e) {
                e.preventDefault()

                showAgreement()
            },
            // 不同意租用协议
            '.btn-prd-buy-cancel': function(e){
                e.preventDefault();

                $('.js-trigger-show-service-content').find('i').removeClass('checked')
                $('.js-btn-confirm-order').addClass('btn-disabled')

                closeAgreement()
            },
            // 同意租用协议
            '.btn-prd-buy-confirm': function(e){
                e.preventDefault();

                $('.js-trigger-show-service-content').find('i').addClass('checked')
                $('.js-btn-confirm-order').removeClass('btn-disabled')

                closeAgreement()
            },
            '.js-btn-confirm-order': function (e) {
                e.preventDefault()
                var $this = $(this)
                if($this.hasClass('btn-disabled')){
                    $.errorAnimate($('.service-agree'))
                    return
                }

                var url = '/rent/rentWait'


                url = tcb.setUrl(url, {
                    product_id: $.queryUrl(window.location.href)['product_id'],
                    treaty_day: $.queryUrl(window.location.href)['treaty_day']
                })
                window.location.href = url
            },
            '.js-pay-method .method-item': function (e) {
                e.preventDefault()
                var $me = $(this)
                var flag_name = $me.attr('data-flag')
                var $desc = $me.parent().siblings('.desc')

                $me.addClass('active').siblings().removeClass('active')
                $desc.text(__Data[flag_name]['item_desc'])
                $('.txt-per').hide();
                $('#per_price_'+flag_name).show();
            }
        })


    })
})()

;/**import from `/resource/js/mobile/shiyong/rent_phone/order_user_info.js` **/
//验证表单
;(function () {
    //验证规则
    var ValidateRule = {
        //不能为空
        isRequired: function ($el) {
            var val = $.trim($el.val())
            if(!val){
                $.errorAnimate ($el)
                return false
            }
            return true
        },
        //身份证号
        isCardNo: function ($el) {
            var val = $el.val()
            var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            if(reg.test(val) === false) {
                $.errorAnimate ($el)
                return false;
            }
            return true
        },
        //纯数字
        isPureNum: function ($el) {
            var val = $.trim($el.val())
            var reg = /^[0-9]+$/
            if(reg.test(val) === false){
                $.errorAnimate ($el)
                return false;
            }
            return true
        },
        //手机号
        isPhoneNum: function ($el) {
            var val = $.trim($el.val())
            var reg = /^1[3456789]\d{9}$/
            if(reg.test(val) === false){
                $.errorAnimate ($el)
                return false;
            }
            return true
        }
    }
    //验证方法
    var Validator = function(){
        this.cacheFn=[]
        this.flag = true
    }
    Validator.prototype.add = function ($el, rule) {
        if(!rule) return;
        this.cacheFn.push(function () {
           return ValidateRule[rule]($el)
        })
    }
    Validator.prototype.validate = function () {
        var self = this
        if(this.cacheFn.length == 0) return

        this.cacheFn.forEach(function (fn) {
            if(!fn.apply(self)){
                self.flag = false
            }
        })

        return this.flag
    }

    var Rent = window.Rent = window.Rent || {}

    Rent.Validator = Validator

})()

//苏宁 用户填写信息页面
;(function(){

    // 获取用户信息页
    if(!$('.page-order-user-info') || !$('.page-order-user-info').length){ return}

    var $win = tcb.getWin(),
        R = tcb.getRoot(),
        Rent = window.Rent || {}

    var $name = $('[name="real_name"]'),//姓名
        $id_no = $('[name="id_no"]'),//身份证号
        $buyer_mobile = $('[name="buyer_mobile"]'),//手机号
        $vcode = $('[name="vcode"]'),//图片验证码
        $bank_card = $('[name="bank_card_num"]'),//银行卡号
        $bank_name = $('[name="bank_name"]'),//银行名称
        $pcode = $('[name="pcode"]'),//手机验证码
        $address = $('[name="receiver_address"]'),//收货地址
        $buyer_province = $('[name="province"]'),//省
        $buyer_city = $('[name="city"]'),//市
        $buyer_area = $('[name="area"]'),//区
        $buyer_address = $('[name="address"]')//详细地址

    var
        __Product_id = $.queryUrl(window.location.href)['product_id'],
        __Treaty_day = $.queryUrl(window.location.href)['treaty_day'],
        __MAX_STEP = 3,//最大步数
        __CashData = {
            cur_hash_step: 1,//当前页的步数
            post_data:{
                product_id: __Product_id,
                treaty_day:__Treaty_day
            },
            user_addr_data : {
                province: [],
                province_sub:{},
                city: [],
                city_sub:{},
                area: []
            }
        },
        __REND_ORDER = '/rent/doSubRentOrder',//提交订单接口
        __REND_ADDRESS = '/rent/doMakeAddress'//补全收货地址信息


    init()
    function init() {
        __setHashStep(1)
        bindEvent()
    }

    //绑定事件
    function bindEvent(){
        var addrSelect = new MobileSelect({
            trigger: '.user-address',
            title: '家庭住址',
            wheels: [
                {data:R.SN_P_C_A_MAP}
            ],
            keyMap: {
                value: 'name',
                childs :'sub'
            },
            position:[0], //Initialize positioning
            callback: function(index, data){
                $buyer_province.val(data[0]['name'])
                $buyer_city.val(data[1]['name'])
                $buyer_area.val(data[2]['name'])
                console.log($buyer_province.val())
            }
        });
        $win.on('hashchange load',function () {

            var from_hash_step = __CashData['cur_hash_step'],
                to_hash_step = __getHashStep()

            getCurStepHeight(to_hash_step)

            handleHashChange(from_hash_step, to_hash_step)

            //改变当前hash_step值
            __CashData['cur_hash_step'] = to_hash_step
        })

        tcb.bindEvent('#mainbody',{
            //点击下一步
            '.js-trigger-next-step': function (e) {
                e.preventDefault()
                var $this = $(this)

                var cur_hash_step = __CashData['cur_hash_step']

                if($this.hasClass('disabled')) { return }

                if(cur_hash_step == 1){//储存信息，改变hash_step
                    var can_render = valide1()
                    if($buyer_province.val() == '' ||$buyer_city.val() == '' ||$buyer_area.val() ==''){
                        can_render = false
                        $.errorAnimate($('.user-address'))
                    }
                    if(can_render){
                        __add1Data()

                        //改变hash_step
                        __setHashStep(++cur_hash_step)
                    }

                }else if(cur_hash_step == 2){//提交信息，改变hash_step

                    if(valide2()){
                        __add2Data()

                        var params = __getPostData()

                        renderUserInfo(params, __REND_ORDER, function (res) {
                            if(res.errno){
                                $.dialog.toast(res.errmsg, 2000)
                                $this.addClass('disabled')
                                setTimeout(function () {
                                    $this.removeClass('disabled')
                                },2000)
                            }else {
                                //改变hash_step
                                __setHashStep(++cur_hash_step)
                                //自动填充收货地址
                                var province = $('[name="province"]').val(),//省
                                    city = $('[name="city"]').val(),//市
                                    area = $('[name="area"]').val(),//区
                                    address = $('[name="address"]').val()//详细地址
                                var add_arr = [province,city,area,address]
                                $address.val(add_arr.join(' '))
                            }
                        })
                    }
                }else if(cur_hash_step == 3){//补充地址，结束
                    //验证地址不为空
                    if(valide3()){
                        __add3Data()
                        var address = __getPostData('receiver_address')
                        var params = {receiver_address:address}
                        renderUserInfo(params, __REND_ADDRESS, function (res) {

                            if(res.errno){
                                $.dialog.toast(res.errmsg, 2000)
                                $this.addClass('disabled')
                                setTimeout(function () {
                                    $this.removeClass('disabled')
                                },2000)
                            }else {
                                var url = '/rent/rentSuc'
                                url = tcb.setUrl(url, {
                                    product_id: $.queryUrl(window.location.href)['product_id'],
                                })

                                window.location.href = url
                            }
                        })
                    }
                }

            },
            //刷新图片验证码
            '.vcode-img': function (e) {
                var $this = $(this),
                    $vcode_item = $this.closest('.vcode-item'),
                    $vcode_input = $vcode_item.find('.input-vcode'),
                    src = '/secode/?rands=' + Math.random ()

                $this.attr('src', src)
                $vcode_input.focus()
            },
            //获取手机验证码
            '.js-trigger-get-pcode':function (e) {
                e.preventDefault()

                var $this = $(this)
                if($this.hasClass('disabled')) return;

                var validInst = new Rent.Validator
                    validInst.add($buyer_mobile, 'isPhoneNum')
                    validInst.add($vcode, 'isRequired')
                var valid_res = validInst.validate()

                if(valid_res){

                    var params = {
                        mobile: $buyer_mobile.val(),
                        pic_secode: $vcode.val(),
                        sms_type: 40
                    }
                    getPhoneCode(params,function () {
                        $this.addClass ('disabled').html ('发送成功')
                        setTimeout(function(){

                            $this.html ('60秒后再次发送')

                            tcb.distimeAnim (60, function (time) {
                                if (time <= 0) {
                                    $this.removeClass ('disabled').html ('发送验证码')
                                } else {
                                    $this.html (time + '秒后再次发送')
                                }
                            })

                        }, 1000)
                    })
                }

            }
        })
    }

    //获取当前hash_step高度  赋值给#mainbody
    function getCurStepHeight(hash_step) {
        var hg = $('#step'+hash_step).height()
        $('#mainbody').height(hg)
    }

    //根据hash_step显示掩藏
    function handleHashChange(from, to) {
       //大于0从左向右出现，小余0从左向右隐藏
        if(to-from>0){
            $('#step'+to).addClass('show')
        }else if(to-from<0){
            $('#step'+from).removeClass('show')
        }
    }

    //获取短信验证码
    function getPhoneCode (params, callback, error) {
        $.ajax ({
            type     : 'POST',
            url      : '/aj/doSendSmscode/',
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

    //提交用户信息
    function renderUserInfo(params, url, callback, error) {
        $.ajax({
            type: 'POST',
            url: url,
            data: params,
            dataType: 'json',
            success: function (res) {

                typeof callback == 'function' && callback(res)
            },
            error: function () {
                typeof error == 'function'  && error()
            }
        })
    }
// ---------------------------------------------------------
    //验证第一步数据
    function valide1() {

        //验证数据
        var validInst = new Rent.Validator
            validInst.add($id_no, 'isCardNo')
            validInst.add($name, 'isRequired')
            validInst.add($buyer_province , 'isRequired')
            validInst.add($buyer_city , 'isRequired')
            validInst.add($buyer_area , 'isRequired')
            validInst.add($buyer_address , 'isRequired')
        return validInst.validate()
    }
    //添加第一步数据
    function __add1Data() {
        //将姓名和身份证号放入cache
        __setPostData('real_name',$name.val())
        __setPostData('id_no',$id_no.val())
        __setPostData('province',$buyer_province.val())
        __setPostData('city',$buyer_city.val())
        __setPostData('area',$buyer_area.val())
        __setPostData('address',$buyer_address.val())
    }
    //验证第二步数据
    function valide2() {
        //验证数据
        var validInst = new Rent.Validator
        validInst.add($bank_card, 'isPureNum')
        validInst.add($bank_name, 'isRequired')
        validInst.add($buyer_mobile, 'isPhoneNum')
        validInst.add($pcode, 'isRequired')
        return validInst.validate()
    }
    //添加第二步数据
    function __add2Data() {
         //放入数据
         __setPostData('bank_card_num',$bank_card.val())
         __setPostData('bank_name',$bank_name.val())
         __setPostData('buyer_mobile',$buyer_mobile.val())
         __setPostData('sms_code',$pcode.val())

    }
    //验证第三步数据
    function valide3() {
        //验证数据
        var validInst = new Rent.Validator
        validInst.add($address, 'isRequired')
        return  validInst.validate()
    }
    //添加第三步数据
    function __add3Data() {
        //放入数据
        __setPostData('receiver_address',$address.val())
    }

    // ------------------------------------------- //

    //设置step
    function __setHashStep(val) {
        if(!val) return
        window.location.hash = 'step=' + val
    }
    function __getHashStep() {
        return tcb.parseHash(window.location.hash)['step'];
    }

    //设置post_data
    function __setPostData(key,val) {
        return __CashData['post_data'][key] = val
    }
    function __getPostData(key) {
        if(key == undefined) {
            return __CashData['post_data']
        }else {
            return __CashData['post_data'][key]
        }
    }

    //删除/添加disabled类名
    function __handleDisabledClass($el, bloo) {
        if(!$el || !$el.length) return ;
        if(bloo){
            if($el.hasClass('disabled')){
                $el.removeClass('disabled')
            }
        }else {
            if(!$el.hasClass('disabled')){
                $el.addClass('disabled')
            }
        }
    }

}());


//乐百分 用户填写信息页面
;(function(){

    // 获取用户信息页
    if(!$('.page-order-user-info-lbf') || !$('.page-order-user-info-lbf').length){ return}

    var
        R = tcb.getRoot(),
        Rent = window.Rent || {}

    var $name = $('[name="real_name"]'),//姓名
        $buyer_mobile = $('[name="buyer_mobile"]'),//手机号
        $buyer_province = $('[name="province"]'),//省
        $buyer_city = $('[name="city"]'),//市
        $buyer_area = $('[name="area"]'),//区
        $buyer_address = $('[name="address"]')//详细地址
        $product_id = $('[name="product_id"]'),
        $treaty_day = $('[name="treaty_day"]')

    var
        __Product_id = $.queryUrl(window.location.href)['product_id'],
        __Treaty_day = $.queryUrl(window.location.href)['treaty_day'],

        __REND_ORDER = '/rent/placeorderLebaifen'//提交订单接口

    $product_id.val(__Product_id);
    $treaty_day.val(__Treaty_day);


    init()
    function init() {
        bindEvent()
    }

    //绑定事件
    function bindEvent(){
        var addrSelect = new MobileSelect({
            trigger: '.user-address',
            title: '家庭住址',
            wheels: [
                {data:R.SN_P_C_A_MAP}
            ],
            keyMap: {
                value: 'name',
                childs :'sub'
            },
            position:[0], //Initialize positioning
            callback: function(index, data){
                $buyer_province.val(data[0]['name'])
                $buyer_city.val(data[1]['name'])
                $buyer_area.val(data[2]['name'])
            }
        });
        tcb.bindEvent('#mainbody',{
            //提交
            '.js-trigger-render': function (e) {
                e.preventDefault()
                var $this = $(this)
                if($this.hasClass('disabled')) { return }

                var can_render = valideForm()
                if($buyer_province.val() == '' ||$buyer_city.val() == '' ||$buyer_area.val() ==''){
                    can_render = false
                    $.errorAnimate($('.user-address'))
                }
                if(can_render){
                    var params = $('#user-info').serialize()
                    console.log(params)
                    renderUserInfo(params, __REND_ORDER ,function (res) {
                        if(!res.errno){
                            window.location.href = res.result.lebaifen_url;
                        }else {
                            $.dialog.toast(res.errmsg, 3000)
                        }
                    })
                }
            }
        })
    }

    //提交用户信息
    function renderUserInfo(params, url, callback, error) {
        $.ajax({
            type: 'POST',
            url: url,
            data: params,
            dataType: 'json',
            success: function (res) {

                typeof callback == 'function' && callback(res)
            },
            error: function () {
                typeof error == 'function'  && error()
            }
        })
    }
    //验证第一步数据

    function valideForm() {
        //验证数据
        var validInst = new Rent.Validator
        validInst.add($buyer_mobile, 'isPhoneNum')
        validInst.add($name, 'isRequired')
        validInst.add($buyer_province , 'isRequired')
        validInst.add($buyer_city , 'isRequired')
        validInst.add($buyer_area , 'isRequired')
        validInst.add($buyer_address , 'isRequired')
        return validInst.validate()
    }

}());


;/**import from `/resource/js/mobile/shiyong/rent_phone/product_attr.js` **/
// 商品属性选择交互
;
(function () {

    // 详情页
    if(!$('.page-product-detail') || !$('.page-product-detail').length){ return}

    var // 型号商品信息
        key_model_id_map_product = 'KEY_MODEL_ID_MAP_PRODUCT',
        // 当前选定的型号id
        key_model_id = 'KEY_MODEL_ID',
        // 当前已经选定的属性组
        key_current_selected_attr_group = 'KEY_CURRENT_SELECTED_ATTR_GROUP',
        // 商品ui状态数据信息
        key_product_ui_status_data = 'KEY_PRODUCT_UI_STATUS_DATA'

    // 异步获取型号下的商品\属性\租期等等数据...当数据已经cache后,直接从cache中获取,不再异步获取
    function getModelBucketDataAsync (callback) {
        var
            model_id = getModelId (),
            modelBucketData = getModelBucketData ()

        if (modelBucketData) {
            // 已经有cache

            $.isFunction (callback) && callback (modelBucketData)

        } else {

            var
                ajaxParams = {
                    url      : '/rent/getProductList',
                    type     : 'POST',
                    dataType : 'json',
                    data     : {
                        model_id : model_id
                    },
                    error    : function (jqXHR, textStatus) {
                        alert (textStatus)
                    },
                    success  : function (res) {
                        if (!res[ 'errno' ]) {

                            modelBucketData = setModelBucketData (model_id, dealProductInfo (res[ 'result' ]))

                            $.isFunction (callback) && callback (modelBucketData)
                        } else {
                            alert (res[ 'errmsg' ])
                        }
                    }
                }

            $.ajax (ajaxParams)

        }
    }

    // 处理原始的商品信息
    // orig_info的key:
    //      attr_groups
    //      products
    //      sku_map_product
    //      treaty_days
    function dealProductInfo (orig_info) {
        var
            ret = {
                product_default    : {}, // 默认选中商品
                product_map        : {}, // 商品映射表
                attr_groups        : orig_info[ 'attr_groups' ], // 型号属性组[详细信息]
                attr_group_ids     : [], // 型号属性组[id组]
                attr_map_product   : orig_info[ 'sku_map_product' ],
                product_attr_group : [], // 商品的属性组[二维数组]
                product_map_attr   : {}, // 商品id和商品属性的映射表
                treaty_days        : [{'day':'365','text': '一年'}], // 租期时间
                treaty_days_promo  : [{'day':'365','text': '一年'}] // 推荐租期
            }

        // 遍历型号属性组,获取属性组纯id
        $.each (orig_info[ 'attr_groups' ], function (k, item) {
            var
                attr_value_list = item[ 'attr_value_list' ]

            ret[ 'attr_group_ids' ].push ([])

            $.each (attr_value_list, function (i, attr) {
                ret[ 'attr_group_ids' ][ ret[ 'attr_group_ids' ].length - 1 ].push (attr[ 'attr_value_id' ])
            })
        })

        var
            flag_has_set_default_product = false,
            // 无库存商品id
            noneStockProductId = []
        // 商品租期-价格
        $.each (orig_info[ 'products' ], function (k, item) {

            // 商品详细信息使用商品id映射
            ret[ 'product_map' ][ item[ 'product_id' ] ] = item

            if (item[ 'stock_nums' ] == 0) {
                // 无库存商品

                noneStockProductId.push (item[ 'product_id' ])
            }
            else if (item[ 'stock_nums' ] != 0 && !flag_has_set_default_product && item[ 'product_id' ] == window.__Product_id) {
                // 将peoduct_id符合的商品设置为默认选中的商品

                ret[ 'product_default' ] = item

                flag_has_set_default_product = true
            }

            // var
            //     strategy_price = item[ 'strategy_price' ]
            // $.each (strategy_price, function (day, total) {
            //     strategy_price[ day ] = {
            //         total   : total,
            //         per_day : tcb.formatMoney (total / day, 2, 0)
            //     }
            // })

        })

        // 遍历sku和商品id的映射表[由于需要判断无库存商品id,需要放在商品遍历之后]
        $.each (orig_info[ 'sku_map_product' ], function (sku, pid) {

            if ($.inArray (pid, noneStockProductId) == -1) {

                sku = sku.split ('_')
                ret[ 'product_attr_group' ].push (sku)
                ret[ 'product_map_attr' ][ pid ] = sku
            }

            sku = null
        })

        // 手动干掉,提前释放内存
        orig_info = null

        return ret
    }

    // 输出商品ui
    function renderProductUI (data) {
        data = data || {}

        // 关闭商品交互ui
        hideProductUI ()

        var
            html_fn = $.tmpl ($.trim ($ ('#JsMZuProductAttrSelectWrapTpl').html ())),
            html_st = html_fn (data)

        $ ('body').append (html_st)

        // 设置商品图片尺寸
        //tcb.setImgElSize ($ ('.product-pics .p-pic-shower img'), 350, 350)

        // 事件绑定
        bindProductEvent ()
    }

    // 显示商品ui
    function showProductUI (modelBucketData) {

        var
            productDefault = modelBucketData[ 'product_default' ],
            product_id = productDefault[ 'product_id' ],
            UIData = {
                // 商品基本信息[默认选中第一组]
                'product'             : productDefault,
                // 属性组
                'attr_groups'         : modelBucketData[ 'attr_groups' ],
                // 推荐租期
                'treaty_days_promo'   : modelBucketData[ 'treaty_days_promo' ],
                // 默认选中租期
                'treaty_days_default' : modelBucketData[ 'treaty_days_promo' ][ 0 ][ 'day' ],
                // 租期
                'treaty_days'         : modelBucketData[ 'treaty_days' ]
            }
        console.log(UIData)
        // 输出商品ui
        renderProductUI (UIData)

        var // 选中的属性组合
            selectedAttrGroup = modelBucketData[ 'product_map_attr' ][ product_id ],
            // 所有属性组合
            allAttrGroup = modelBucketData[ 'product_attr_group' ],
            // 所有属性列表
            allAttrList = modelBucketData[ 'attr_group_ids' ]

        // 设置商品属性ui状态
        setProductAttrUI (selectedAttrGroup, allAttrGroup, allAttrList)

        // 设置商品ui状态信息
        setProductUIStatusData ({
            // 选中的属性组合
            selectedAttrGroup : selectedAttrGroup,
            // 所有属性组合
            allAttrGroup      : allAttrGroup,
            // 所有属性列表
            allAttrList       : allAttrList,
            // 商品数据
            productData       : productDefault,
            // 选中的租期方案
            selectedTreatyDay : UIData[ 'treaty_days_default' ],
            // 商品有无库存
            productNoneStock  : productDefault[ 'stock_nums' ] > 0
                ? false
                : true
        })
    }

    // 关闭商品交互ui
    function hideProductUI () {
        var
            $mask = $ ('#AttrSelectMask'),
            $wrap = $ ('#AttrSelectWrap')

        if ($mask) {
            $mask.remove ()
        }
        if ($wrap) {
            $wrap.remove ()
        }
    }

    // 设置商品的ui状态
    function setProductUIStatus (productUIStatusData) {
        // 商品ui数据信息
        // 设置商品ui状态时,传入了相应数据,那么将数据存入cache,然后直接使用,否则直接从cache中取
        productUIStatusData = productUIStatusData
            // 设置商品ui状态数据
            ? setProductUIStatusData (productUIStatusData)
            : getProductUIStatusData ()

        var // 商品数据
            productData = productUIStatusData[ 'productData' ],
            // 选中的租期方案
            selectedTreatyDay = productUIStatusData[ 'selectedTreatyDay' ],
            // 选中的属性组合
            selectedAttrGroup = productUIStatusData[ 'selectedAttrGroup' ],
            // 所有属性组合
            allAttrGroup = productUIStatusData[ 'allAttrGroup' ],
            // 所有属性列表
            allAttrList = productUIStatusData[ 'allAttrList' ],
            // 商品有无库存
            productNoneStock = productUIStatusData[ 'productNoneStock' ]

        var
            $wrap = $ ('#AttrSelectWrap')


        // 设置商品图片
        var
            $img = $wrap.find ('.p-img img')
        $img.attr ('src', productData[ 'thum_img' ])
        // 设置商品图片尺寸
        //tcb.setImgElSize ($img, 350, 350)

        // 设置商品属性的ui状态
        setProductAttrUI (selectedAttrGroup, allAttrGroup, allAttrList)

        // 设置租期选中状态
        var
            $treatyItem = $wrap.find ('.prd-treaty-day .attr-item'),
            $treatyItemSelected = $treatyItem.filter (function () {
                return $ (this).attr ('data-val') == selectedTreatyDay
            }),
            $treatyItemOther = $treatyItem.filter (function () {
                return $ (this).attr ('data-other')
            })

        $treatyItem.removeClass ('cur')

        if ($treatyItemSelected && $treatyItemSelected.length) {

            $treatyItemSelected.addClass ('cur')

            $treatyItemOther.html ($treatyItemOther.attr ('data-default-text'))
        } else {

            $treatyItemSelected = $ ('.prd-treaty-day-completely').find ('[value="' + selectedTreatyDay + '"]')

            $treatyItemOther.addClass ('cur').html ($treatyItemSelected.html ())
        }

        var
            $Btn = $wrap.find ('#AttrSelectConfirm'),
            url_order = $Btn.attr('data-url') || '/rent/productConfirm'

        var url_order_new = tcb.setUrl (url_order, {
            product_id : productData[ 'product_id' ],
            treaty_day : selectedTreatyDay
        })

        if(url_order_new !== url_order){
            var redirect_url = tcb.setUrl (window.location.pathname, {
                product_id : productData[ 'product_id' ],
                treaty_day : selectedTreatyDay
            })
            $Btn.attr('href', redirect_url)
        }else{
            $Btn.attr('href', '#')
        }

        // 设置下单url
        $Btn.attr ('data-url', url_order)
        if (productNoneStock) {
            // 库存为0,按钮禁用

            $Btn.addClass ('btn-disabled')
        } else {
            $Btn.removeClass ('btn-disabled')
        }

    }

    /**
     * 设置商品属性的ui状态
     * @param selectedAttr 被设置的属性组
     * @param AttrGroup 所有存在的属性组合
     * @param AttrList 显示的属性列表
     */
    function setProductAttrUI (selectedAttr, AttrGroup, AttrList) {
        if (!(selectedAttr && selectedAttr.length)) {
            // 没有默认被选中的属性组，直接退出
            return;
        }
        var SelectableAttr = [],
            AttrGroup_itemstr = $.map (AttrGroup, function (item) {return item.join (',');});

        var selectedAttr2 = arrCombinedSequence (selectedAttr);
        for (var i = 0; i < AttrList.length; i++) {
            SelectableAttr[ i ] = [];

            var item = AttrList[ i ];
            for (var i2 = 0; i2 < item.length; i2++) {
                var item2 = item[ i2 ];

                for (var i3 = 0; i3 < selectedAttr2.length; i3++) {
                    var sitem = selectedAttr2[ i3 ];

                    var temp_arr = [];

                    temp_arr = temp_arr.concat (sitem.slice (0, i), item2, sitem.slice (i + 1));

                    if ($.inArray (temp_arr.join (','), AttrGroup_itemstr) > -1 && $.inArray (item2, SelectableAttr[ i ]) == -1) {
                        SelectableAttr[ i ].push (item2);
                    }
                }
            }
        }

        var wPCate = $ ('.attr-line');
        wPCate.each (function (i) {
            $ (this).find ('.attr-item').each (function (ii) {
                var wItem = $ (this),
                    attr_id = wItem.attr ('data-id');
                wItem.removeClass ('cur').removeClass ('disabled').removeClass ('disabled-hover');// 移除状态
                // 设置那些不能被选择的属性
                if ($.inArray (attr_id, SelectableAttr[ i ]) == -1) {
                    wItem.addClass ('disabled');
                } else {
                    wItem.removeClass ('disabled');
                }

                if (attr_id === selectedAttr[ i ]) {
                    wItem.addClass ('cur');
                }
            })
        })
    }

    /**
     * 将数组转换成组合序列
     *
     * @param TwoDimArr  二维数组
     * @returns {Array}
     */
    function arrCombinedSequence (TwoDimArr) {
        var ConvertedArr = [], // 转换后的二维数组
            cc = 1; // 转换后的二维数组的数组长度，默认设置为1

        // TwoDimArr不是数组，直接返回空数组
        if (!(TwoDimArr instanceof Array)) {
            return [];
        }
        var TwoDimArr_safe = []; // 拷贝一个新的安全数组，不破坏TwoDimArr原有结构
        for (var i = 0; i < TwoDimArr.length; i++) {
            if (!(TwoDimArr[ i ] instanceof Array)) {
                TwoDimArr_safe[ i ] = [ TwoDimArr[ i ].toString () ];
            } else {
                TwoDimArr_safe[ i ] = TwoDimArr[ i ];
            }

            cc = cc * TwoDimArr_safe[ i ].length; // 转换后的数组长度是子数组的长度之积
        }

        var kk = 1;
        $.each (TwoDimArr_safe, function (i, arr) {
            var len = arr.length;
            cc = cc / len;
            if (i == 0) {
                $.each (arr, function (ii, item) {
                    for (var j = 0; j < cc; j++) {
                        ConvertedArr.push ([ item ]);
                    }
                });
            } else {
                var pos = 0;
                for (var k = 0; k < kk; k++) {
                    $.each (arr, function (ii, item) {
                        for (var j = 0; j < cc; j++) {
                            ConvertedArr[ pos ].push (item);
                            pos++;
                        }
                    });
                }
            }
            kk = kk * len;
        });

        return ConvertedArr;
    }

    // 获取最佳匹配商品属性组
    function getBestAttrGroup (cur_attr, cur_attr_pos) {
        var
            best_match_attr_group = []
        var
            modelBucketData = getModelBucketData (),
            AttrGroup = modelBucketData[ 'product_attr_group' ],   // 商品的属性组[二维数组]

            cur_selected_attr = getCurrentSelectedAttrGroup (), // 获取选中的属性id组合
            filtered_attr_group = [], // 筛选出包含当前点击属性的那部分数组
            attr_group_counter = []   // 相同重合次数统计数组

        // 在所有已有的属性组中，筛选出包含当前点击属性的那部分数组
        $.each (AttrGroup, function (i, item) {

            if (item[ cur_attr_pos ] == cur_attr) {
                // 当前属性组对应位置的属性值和当前选中属性值相同,然后作如下处理,否则直接跳过

                var
                    counter = 0

                // 遍历当前选中的属性组
                $.each (cur_selected_attr, function (ii, attr_id) {
                    // 遍历到当前行，直接跳过不用处理
                    if (ii == cur_attr_pos) {
                        return
                    }

                    if (attr_id == item[ ii ]) {
                        // 每一属性行中选中的属性,和对应位置的属性一致时,计数器+1

                        counter++
                    }
                })

                attr_group_counter.push (counter)
                filtered_attr_group.push (item)
            }
        })

        var
            max_counter = Math.max.apply (Math, attr_group_counter), // 统计到的匹配最大值
            max_counter_pos = $.inArray (max_counter, attr_group_counter) // 取最大数字的第一个位置

        // 找到最佳匹配组
        best_match_attr_group = filtered_attr_group[ max_counter_pos ]

        return best_match_attr_group
    }

    // 获取当前选中的属性组合[某类属性没有被选中的项,那么属性类所在位置属性设置为空字符串]
    function getCurrentSelectedAttrGroup () {
        var
            $AttrLine = $ ('.attr-line'),
            cur_selected_attr = tcb.cache (key_current_selected_attr_group) || []

        if (!cur_selected_attr.length) {
            // 遍历商品属性行,获取选中的属性id组合
            $AttrLine.each (function (i, el) {
                var
                    $AttrItemSelected = $ (el).find ('.cur'),
                    data_id = ''

                if ($AttrItemSelected && $AttrItemSelected.length) {
                    data_id = $AttrItemSelected.attr ('data-id')
                }

                cur_selected_attr.push (data_id)
            })

        }

        return cur_selected_attr
    }

    // 生成新的选中的属性组合
    function genSelectedAttrGroup (cur_attr, cur_attr_pos) {
        var
            best_match_attr_group = getBestAttrGroup (cur_attr, cur_attr_pos), // 最佳匹配的属性组合
            cur_selected_attr = getCurrentSelectedAttrGroup (), // 获取选中的属性id组合
            selected_attr_group = [],
            modelBucketData = getModelBucketData (),
            attr_group_ids = modelBucketData[ 'attr_group_ids' ] // 型号属性组[id组]


        // 遍历当前选中的属性组合,
        // 每个位置的属性值和最佳匹配相同,那么继续选中此属性,
        // 否则此类属性全部不被选中(即将此类属性所有属性值全部push进被选中的属性数组之中)
        $.each (cur_selected_attr, function (i, attr_id) {
            if (attr_id != best_match_attr_group[ i ] && cur_attr_pos != i) {
                // 属性id不匹配,并且不是当前属性类

                selected_attr_group[ i ] = attr_group_ids[ i ]
            } else {

                selected_attr_group[ i ] = best_match_attr_group[ i ]
            }
        })

        return selected_attr_group
    }

    // 根据元素获取商品属性信息
    function getProductAttrItemInfoByElement ($el) {
        var
            cur_attr = $el.attr ('data-id'),
            cur_attr_line = $el.closest ('.attr-line')[ 0 ],
            cur_attr_line_pos = 0,
            $AttrLine = $ ('.attr-line')

        // 获取当前点击行的位置
        $AttrLine.each (function (i, el) {
            if (cur_attr_line == el) {
                cur_attr_line_pos = i
            }
        })

        return {
            cur_attr          : cur_attr,
            cur_attr_line_pos : cur_attr_line_pos
        }
    }

    // 设置商品ui状态信息
    function setProductUIStatusData (key, val) {
        var
            productUIStatusData = getProductUIStatusData ()

        if (typeof key == 'object') {

            $.each (key, function (k, v) {
                productUIStatusData[ k ] = v
            })
        } else {
            key = key === null
                ? 'null'
                : key.toString ()

            productUIStatusData[ key ] = val
        }

        tcb.cache (key_product_ui_status_data, productUIStatusData)

        return productUIStatusData
    }

    // 获取商品ui状态信息
    function getProductUIStatusData (k) {
        var
            ret = null,
            productUIStatusData = tcb.cache (key_product_ui_status_data) || {}

        if (typeof k == 'undefined') {
            ret = productUIStatusData
        } else {
            ret = typeof productUIStatusData[ k ] === 'undefined'
                ? productUIStatusData
                : productUIStatusData[ k ]
        }

        return ret
    }

    // 获取型号下大量数据
    function getModelBucketData () {
        var
            model_id = tcb.cache (key_model_id),
            modelMapProduct = tcb.cache (key_model_id_map_product) || {},
            // 型号下边商品相关信息
            modelBucketData = modelMapProduct[ model_id ]

        return modelBucketData
    }

    // 设置型号下的数据
    function setModelBucketData (model_id, bucket_data) {
        if (!model_id) {

            return
        }

        var
            modelMapProduct = tcb.cache (key_model_id_map_product) || {}

        modelMapProduct[ model_id ] = bucket_data

        tcb.cache (key_model_id_map_product, modelMapProduct)

        return bucket_data
    }

    // 获取型号id
    function getModelId () {

        return tcb.cache (key_model_id)
    }

    // 设置型号id
    function setModelId (model_id) {

        return tcb.cache (key_model_id, model_id)
    }

    // toggle更多可选租期
    function toggleMoreTreatyDay ($trigger) {
        if (!($trigger && $trigger.length)) {
            return
        }

        //if ($trigger.hasClass ('arrow-down')) {

        //$trigger.addClass ('arrow-up').removeClass ('arrow-down')

        triggerOpenSelectList ($ ('.prd-treaty-day-completely'))
        //} else {

        //$trigger.addClass ('arrow-down').removeClass ('arrow-up')
        //}

    }

    // js触发打开select选择列表
    function triggerOpenSelectList (elem) {
        if (document.createEvent) {
            var e = document.createEvent ("MouseEvents");
            e.initMouseEvent ("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            elem[ 0 ].dispatchEvent (e);
        } else if (elem[ 0 ].fireEvent) {
            elem[ 0 ].fireEvent ("onmousedown");
        }
    }


    // 绑定商品相关交互
    function bindProductEvent ($wrap, $mask) {
        // mask和wrap
        var
            $mask = $ ('#AttrSelectMask'),
            $wrap = $ ('#AttrSelectWrap')

        // 点击遮罩层关闭面板
        $mask.on ('click', function (e) {
            e.preventDefault ()

            hideProductUI ()
        })

        // 点击关闭按钮关闭面板
        $wrap.find ('#AttrSelectClose').on ('click', function (e) {
            e.preventDefault ()

            hideProductUI ()
        })

        // 属性点击的交互事件
        $wrap.find ('.attr-line .attr-item').on ('click', function (e) {
            e.preventDefault ()

            var
                $me = $ (this)

            // 当前已经选中的属性 点击无效
            if ($me.hasClass ('cur')) { return }

            var // 型号下边商品相关信息
                modelBucketData = getModelBucketData (),
                // 商品ui数据信息
                oriProductUIStatusData = getProductUIStatusData (),
                // 当前被点击元素,获取商品属性id,属性在属性组中的位置
                attrInfo = getProductAttrItemInfoByElement ($me),
                // 属性-商品映射表
                attrMapProduct = modelBucketData[ 'attr_map_product' ]

            var
                newProductUIStatusData = {
                    // 选中的属性组合
                    selectedAttrGroup : genSelectedAttrGroup (attrInfo[ 'cur_attr' ], attrInfo[ 'cur_attr_line_pos' ]),
                    // 所有属性组合
                    allAttrGroup      : modelBucketData[ 'product_attr_group' ],
                    // 所有属性列表
                    allAttrList       : modelBucketData[ 'attr_group_ids' ],
                    // 商品数据
                    productData       : oriProductUIStatusData[ 'productData' ],
                    // 商品有无库存(获取到商品id之前,默认设置为无库存状态)
                    productNoneStock  : true
                },
                // 商品id
                product_id = attrMapProduct[ newProductUIStatusData[ 'selectedAttrGroup' ].join ('_') ]

            if (product_id) {
                newProductUIStatusData[ 'productData' ] = modelBucketData[ 'product_map' ][ product_id ]
                newProductUIStatusData[ 'productNoneStock' ] = false
            }

            // 设置商品的ui信息,同时将状态数据存入cache
            setProductUIStatus (newProductUIStatusData)
        })

        // 不可选属性的mouse交互
        $wrap.find ('.attr-line .disabled').on ({
            'mouseenter' : function (e) {
                $ (this).addClass ('disabled-hover');
            },
            'mouseleave' : function (e) {
                $ (this).removeClass ('disabled-hover');
            }
        })

        // 选择租期
        // $wrap.find ('.prd-treaty-day .attr-item').on ('click', function (e) {
        //     e.preventDefault ()
        //
        //     var
        //         $me = $ (this),
        //         treaty_day = $me.attr ('data-val'),
        //         flag_other = !!$me.attr ('data-other')
        //
        //     if (!flag_other) {
        //         // 正常选择租期
        //
        //         $wrap.find ('.prd-treaty-day-completely').val (treaty_day)
        //
        //         // 设置选中租期
        //         setProductUIStatusData ('selectedTreatyDay', treaty_day)
        //
        //         // 设置商品ui状态
        //         setProductUIStatus ()
        //     } else {
        //         // 选择其他更多租期
        //
        //         toggleMoreTreatyDay ($me)
        //     }
        // })

        // 切换其他租期
        // $wrap.find ('.prd-treaty-day-completely').on ('change', function (e) {
        //     var
        //         $me = $ (this),
        //         treaty_day = $me.val ()
        //
        //     // 设置选中租期
        //     setProductUIStatusData ('selectedTreatyDay', treaty_day)
        //
        //     // 设置商品ui状态
        //     setProductUIStatus ()
        // })

        // 点击我要租赁
        $wrap.find ('#AttrSelectConfirm').on ('click', function (e) {
            var
                $me = $ (this),
                data_url = $me.attr('data-url')

            if ($me.hasClass ('btn-disabled')) {
                e.preventDefault ()

                return
            }else{
                $('#confirm-product').attr('href',data_url)

                hideProductUI ()
            }
        })
    }

    // 初始化
    function init () {
        var
            Rent = window.Rent = window.Rent || {}

        // 设置型号id
        Rent.setModelId = setModelId
        // 异步获取商品列表
        Rent.getModelBucketDataAsync = getModelBucketDataAsync
        // 输出商品ui
        Rent.renderProductUI = renderProductUI
        // 显示商品ui
        Rent.showProductUI = showProductUI
        // 设置商品属性ui状态
        Rent.setProductAttrUI = setProductAttrUI
        // 设置商品ui状态信息
        Rent.setProductUIStatusData = setProductUIStatusData

    }


    // 初始化
    init ()

} ())


;/**import from `/resource/js/mobile/shiyong/rent_phone/order_product_detail.js` **/
// 滑动slide
(function () {

    window.mRent = window.mRent || {}

    var
        selector_wrap = '.slide-shower-wrap',
        selector_item = '.s-item',
        selector_nav = '.slide-nav',
        selector_nav_num = '.slide-nav-num',
        class_nav_cur = 'cur',
        class_item_hide = 's-item-hide',

        data_hide_nav = 'data-hidenav',
        data_hide_nav_num = 'data-hidenav-num',
        data_auto = 'data-auto'

    /**
     * 开启滑动功能
     * @param $slideWrap
     */
    function slide ($slideWrap) {

        $slideWrap = $slideWrap || $ (selector_wrap);

        if (!$slideWrap.length) {
            return;
        }

        var $sitem = $slideWrap.find (selector_item)
        if (!$sitem.length) {
            return;
        }

        // 普通导航点
        var $nav = $slideWrap.find (selector_nav),
            $nitem;
        if ($nav.length) {
            $nitem = $nav.children ();

            if (!$nitem.length) {
                var nav_item_str = '';
                for (var i = 0; i < $sitem.length; i++) {
                    nav_item_str += i == 0
                        ? '<span class="' + class_nav_cur + '"></span>'
                        : '<span></span>';
                }
                $nitem = $ (nav_item_str).appendTo ($nav);
            }

            if (parseInt ($slideWrap.attr (data_hide_nav), 10)) {
                $nav.hide ();
            }
        }
        // 数字导航点
        var $nav_num = $slideWrap.find (selector_nav_num);
        if ($nav_num.length) {
            $nav_num.attr('data-total-num', $sitem.length).html('<i>1</i>/'+$sitem.length)
            if (parseInt ($slideWrap.attr (data_hide_nav_num), 10)) {
                $nav_num.hide ();
            }
        }
        // 滑动item数大于1个才有滑动效果
        if ($sitem.length > 1) {
            $sitem.removeClass (class_item_hide);
            // 初始化slide滑动
            var objSwipe = Swipe ($slideWrap[ 0 ], {
                startSlide      : 0,
                speed           : 400,
                auto            : $slideWrap.attr (data_auto) || 0,
                continuous      : true,
                disableScroll   : false,
                stopPropagation : false,
                callback        : function (index, element) {
                    // 加载图片
                    loadItemImg ()

                    if ($nitem && $nitem.length) {
                        if ($nitem.length < 3 && this.continuous) {
                            $nitem.removeClass (class_nav_cur).eq (index % $nitem.length).addClass (class_nav_cur);
                        } else {
                            $nitem.removeClass (class_nav_cur).eq (index).addClass (class_nav_cur);
                        }
                    }
                    if ($nav_num && $nav_num.length){
                        var html_nav_num = ''
                        if ($nitem.length < 3 && this.continuous) {
                            html_nav_num += (index % $nitem.length+1)
                        } else {
                            html_nav_num += (index + 1)
                        }
                        html_nav_num = '<i>'+html_nav_num+'</i>'
                        html_nav_num += '/'+$nav_num.attr('data-total-num')
                        $nav_num.html(html_nav_num)
                    }
                },
                transitionEnd   : function (index, element) { }
            })

            // 重新获取sitem,当item数量小于3,并且可以循环滑动的时候,$sitem数量会变化
            $sitem = $slideWrap.find (selector_item)

            var
                flag_all_img_loaded = false

            $slideWrap.on ({
                // 实现lazy加载图片的功能
                'touchstart' : function (e) {

                    loadItemImg ()
                }
            })

            // 加载图片
            function loadItemImg () {
                if (flag_all_img_loaded) {
                    // 所有图片都已经加载完成,那么不再执行下边操作
                    return
                }

                var
                    cur_pos = objSwipe.getPos (),
                    len = $sitem.length,
                    next_pos = cur_pos + 1,
                    prev_pos = cur_pos - 1

                if (next_pos == len) {
                    next_pos = 0
                }
                if (prev_pos == -1) {
                    prev_pos = len - 1
                }

                var
                    $next = $sitem.eq (next_pos),
                    $prev = $sitem.eq (prev_pos)

                $next = $($next.concat ($prev))

                tcb.lazyLoadImg (1, $next)

                // 遍历所有图片,判断是不是都已经加载完成了
                $sitem.find ('img').each (function (i, el) {
                    var
                        $el = $ (el),
                        src_img = $el.attr ('src'),
                        data_img = $el.attr ('data-lazysrc')

                    if (data_img) {
                        if (data_img == src_img) {
                            flag_all_img_loaded = true
                        } else {
                            flag_all_img_loaded = false

                            // 还有没加载完的,将flag设置为false,然后退出遍历
                            return false
                        }
                    } else {
                        flag_all_img_loaded = true
                    }
                })

            }

            // 加载图片
            loadItemImg ()
        }
    }


    //====================== Export ========================
    window.mRent.slide = slide

} ())

;(function () {
    $(function () {

        // 详情页
        if(!$('.page-product-detail') || !$('.page-product-detail').length){ return}

        //轮播图
        var $slideWrap = $('.slide-shower-wrap')

        window.mRent.slide($slideWrap)

        //固定写死的两个长图
        var long_img_map = {
            '10138' : 'https://p0.ssl.qhmsg.com/t01a3dfa5e6ee8f999a.jpg',//iphone7
            '10139' : 'https://p0.ssl.qhmsg.com/t013eb6d9585508cfb8.jpg'//iphone6
        }
        var product_id = $.queryUrl(window.location.href)['product_id']
        var load_long_img = loadProductExtendImg(long_img_map[product_id])
        // var load_long_img = loadProductExtendImg('https://p0.ssl.qhmsg.com/t01a3dfa5e6ee8f999a.jpg')
        load_long_img(function (url) {
            var product_detail_img = $('<img src="'+url+'">')
            $('.block-product-extend .product-detail').html(product_detail_img)
        })

        // 事件绑定
        tcb.bindEvent ('.page-product-detail', {

            // 属性选择弹层触发器
            '.js-trigger-attr-selected-panel' : function (e) {
                e.preventDefault ()

                var
                    $me = $ (this),
                    model_id = $me.attr ('data-id')

                if($me.find('.btn-rent-disabled').length){
                    return
                }

                // 设置型号id
                Rent.setModelId (model_id)
                // 异步获取商品列表
                Rent.getModelBucketDataAsync (function (modelBucketData) {

                    Rent.showProductUI (modelBucketData, $me.attr ('data-title'))

                })
            },
            //商品附加信息tab
            '.block-product-extend .extend-item':function (e) {
                e.preventDefault()
                var $me = $(this)
                var $block_product_extend = $me.closest('.block-product-extend')
                var flag_item = $me.attr('data-flag')
                var $active_item = $block_product_extend.find('.'+flag_item)

                $me.addClass('active').siblings().removeClass('active')
                $active_item.show().siblings().hide()

            }

        })

        function loadProductExtendImg(img_url) {
            var is_load
            return function (callback) {
                if(is_load){
                    typeof callback == 'function' && callback(img_url)
                }else{
                    var img = new Image()
                    img.onload = function(){
                        is_load = true
                        typeof callback == 'function' && callback(img_url)
                    }
                    img.onerror = function () {
                        console.log('error')
                    }
                    img.src = img_url
                }
            }
        }
    })
})()

