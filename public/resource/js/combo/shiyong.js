;/**import from `/resource/js/component/jquery/countdown.js` **/
// 倒计时
(function(){
    var Bang = window.Bang = window.Bang || {};

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

        var fn_countdown = $.tmpl( $.trim( $('#JsCountdownTpl').html() ) );

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

            var desc_before = $target.attr('data-descbefore')||'', // 前置文字说明
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
                'day': d,
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
            curtime = curtime - 1000;

            //duration = duration<1 ? 0 : duration;
            return true;
        }
        countdown();
        setTimeout(function(){
            var flag = countdown();
            if (!flag) {
                return ;
            }
            if(duration>-1){
                var next_time = getClientDuration(targettime) - client_duration;
                if (next_time<0) {
                    next_time = 0;
                }
                setTimeout(arguments.callee, next_time);
            } else {
                // 倒计时结束
                typeof callbacks.end === 'function' && callbacks.end();
            }
        }, 1000);
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

;/**import from `/resource/js/page/shiyong/common.js` **/
// 试用通用js
(function(){


}());

;/**import from `/resource/js/page/shiyong/index/product_attr.js` **/
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
                    timeout: 5000,
                    error    : function (jqXHR, textStatus) {
                        //alert (textStatus)
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

        var
            html_fn = $.tmpl ($.trim ($ ('#JsShiYongProductInfoTpl').html ())),
            html_st = html_fn (data)

        $ ('.block1 .block-inner').html (html_st)

        // 设置商品图片尺寸
        tcb.setImgElSize ($ ('.product-pics .p-pic-shower img'), 350, 350)
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

        // 设置商品图片
        var
            $img = $ ('.product-pics .p-pic-shower img')
        $img.attr ('src', productData[ 'thum_img' ])
        // 设置商品图片尺寸
        tcb.setImgElSize ($img, 350, 350)

        // 设置商品属性的ui状态
        setProductAttrUI (selectedAttrGroup, allAttrGroup, allAttrList)

        // 设置租期选中状态
        var
            $treatyItem = $ ('.prd-treaty-day .p-c-item'),
            $treatyItemSelected = $treatyItem.filter (function () {
                return $ (this).attr ('data-val') == selectedTreatyDay
            }),
            $treatyItemOther = $treatyItem.filter (function () {
                return $ (this).attr ('data-other')
            })

        $treatyItem.removeClass ('p-c-curr')

        if ($treatyItemSelected && $treatyItemSelected.length == 2) {

            $treatyItemSelected.addClass ('p-c-curr')

            $treatyItemOther.find ('.p-c-item-text').html ($treatyItemOther.attr ('data-default-text'))
        } else {

            $treatyItemSelected = $ ('.prd-treaty-day-completely').find ('[data-val="' + selectedTreatyDay + '"]').addClass ('p-c-curr')

            $treatyItemOther.addClass ('p-c-curr')
                .find ('.p-c-item-text').html ($treatyItemSelected.html ())
        }

        // 设置押金
        $ ('.prd-pledge-amount').html (productData[ 'pledge_amount' ])

        var // 商品的租用费用
            product_treaty_fee = productData[ 'strategy_price' ][ selectedTreatyDay ]
        // 设置服务费总额/每天
        $ ('.prd-treaty-fee-amount').html (product_treaty_fee[ 'total' ])
        $ ('.prd-treaty-fee-per-day-amount').html (product_treaty_fee[ 'per_day' ])

        var
            $BtnBuy = $ ('.prd-buy'),
            url_order = $BtnBuy.attr('href') || '/shiyong/order'

        url_order = tcb.setUrl (url_order, {
            product_id : productData[ 'product_id' ],
            treaty_day : selectedTreatyDay
        })

        // 设置下单url
        $BtnBuy.attr ('href', url_order)
        if (productNoneStock) {
            // 库存为0,按钮禁用

            $BtnBuy.addClass ('prd-buy-disabled')
        } else {
            $BtnBuy.removeClass ('prd-buy-disabled')
        }

        // 隐藏更多可选租期
        hideMoreTreatyDay ()
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

        var wPCate = $ ('.prd-price-attr');
        wPCate.each (function (i) {
            $ (this).find ('.p-c-item').each (function (ii) {
                var wItem = $ (this),
                    attr_id = wItem.attr ('data-id');
                wItem.removeClass ('p-c-curr').removeClass ('p-c-disabled').removeClass ('p-c-disabled-hover');// 移除状态
                // 设置那些不能被选择的属性
                if ($.inArray (attr_id, SelectableAttr[ i ]) == -1) {
                    wItem.addClass ('p-c-disabled');
                } else {
                    wItem.removeClass ('p-c-disabled');
                }

                if (attr_id === selectedAttr[ i ]) {
                    wItem.addClass ('p-c-curr');
                }
            });
        });
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
            $AttrLine = $ ('.prd-price-attr'),
            cur_selected_attr = tcb.cache (key_current_selected_attr_group) || []

        if (!cur_selected_attr.length) {
            // 遍历商品属性行,获取选中的属性id组合
            $AttrLine.each (function (i, el) {
                var
                    $AttrItemSelected = $ (el).find ('.p-c-curr'),
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
            cur_attr_line = $el.closest ('.prd-price-attr')[ 0 ],
            cur_attr_line_pos = 0,
            $AttrLine = $ ('.prd-price-attr')

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
        var
            $arrowDown = $trigger.find ('.arrow-down')
        if ($arrowDown && $arrowDown.length) {

            $arrowDown.addClass ('arrow-up').removeClass ('arrow-down')
            $ ('.prd-treaty-day-completely').show ()
        } else {
            var
                $arrowUp = $trigger.find ('.arrow-up')
            $arrowUp.addClass ('arrow-down').removeClass ('arrow-up')
            $ ('.prd-treaty-day-completely').hide ()
        }
    }

    // 隐藏更多可选租期
    function hideMoreTreatyDay () {
        var
            $arrowUp = $ ('.prd-treaty-day .p-c-item .arrow-up')
        if ($arrowUp && $arrowUp.length) {
            $arrowUp.addClass ('arrow-down').removeClass ('arrow-up')
        }
        $ ('.prd-treaty-day-completely').hide ()
    }

    // 绑定商品相关交互
    function bindProductEvent () {
        // 事件绑定
        tcb.bindEvent (document.body, {
            // 属性点击的交互事件
            '.prd-price-attr .p-c-item'     : function (e) {
                e.preventDefault ()

                var
                    $me = $ (this)

                // 当前已经选中的属性 点击无效
                if ($me.hasClass ('p-c-curr')) { return }

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

            },
            // 不可选属性的mouse交互
            '.prd-price-attr .p-c-disabled' : {
                'mouseenter' : function (e) {
                    $ (this).addClass ('p-c-disabled-hover');
                },
                'mouseleave' : function (e) {
                    $ (this).removeClass ('p-c-disabled-hover');
                }
            },
            // 选择租期
            '.prd-treaty-day .p-c-item'     : function (e) {
                e.preventDefault ()

                var
                    $me = $ (this),
                    treaty_day = $me.attr ('data-val'),
                    flag_other = !!$me.attr ('data-other')

                if (!flag_other) {
                    // 正常选择租期

                    // 设置选中租期
                    setProductUIStatusData ('selectedTreatyDay', treaty_day)

                    // 设置商品ui状态
                    setProductUIStatus ()
                } else {
                    // 选择其他更多租期

                    toggleMoreTreatyDay ($me)
                }
            },
            // 点击禁止按钮
            '.prd-buy-disabled'             : function (e) {
                e.preventDefault ()
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
        // 设置商品属性ui状态
        Zu.setProductAttrUI = setProductAttrUI
        // 设置商品ui状态信息
        Zu.setProductUIStatusData = setProductUIStatusData
        // 绑定商品相关交互
        Zu.bindProductEvent = bindProductEvent

    }


    // 初始化
    init ()

} ())

;/**import from `/resource/js/page/shiyong/index/index.js` **/
$ (function () {
    var
        $PageIndex = $ ('.page-shiyong-index')
    if (!($PageIndex && $PageIndex.length)) {
        return
    }

    var
        Zu = window.Zu

    // 展示商品选择UI界面
    function showProductUI (modelBucketData, product_title_short) {
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
                'treaty_days'         : modelBucketData[ 'treaty_days' ],
                // 商品短名称
                'product_title_short' : product_title_short
            }

        // 输出商品ui
        Zu.renderProductUI (UIData)

        var // 选中的属性组合
            selectedAttrGroup = modelBucketData[ 'product_map_attr' ][ product_id ],
            // 所有属性组合
            allAttrGroup = modelBucketData[ 'product_attr_group' ],
            // 所有属性列表
            allAttrList = modelBucketData[ 'attr_group_ids' ]

        // 设置商品属性ui状态
        Zu.setProductAttrUI (selectedAttrGroup, allAttrGroup, allAttrList)

        // 设置商品ui状态信息
        Zu.setProductUIStatusData ({
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

    // 绑定首页事件
    tcb.bindEvent (document.body, {
        // 抢租指定型号手机
        '.liji-qiangzu'      : function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                model_id = $me.attr ('data-id')

            if ($me.hasClass('liji-qiangzu-disabled')){

                return
            }

            // 设置型号id
            Zu.setModelId (model_id)
            // 异步获取商品列表
            Zu.getModelBucketDataAsync (function (modelBucketData) {

                showProductUI (modelBucketData, $me.attr ('data-title'))

                $me.closest ('.block').fadeOut ()
            })

            //// 添加事件统计
            //var
            //    statistic_event_category = 'pc租赁',
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

        },
        // 返回重选型号
        '.btn-go-back-model' : function (e) {
            e.preventDefault ()

            $ ('.block0').fadeIn ()
            //$('.block1 .block-inner').html('')
        }
    })

    // 绑定商品相关交互
    Zu.bindProductEvent ()

    //// 提前获取商品信息....免得点击的时候才请求导致交互滞后
    //var
    //    PRODUCT_LIST = window._PRODUCT_LIST || []
    //$.each(PRODUCT_LIST, function(i, item){
    //    Zu.setModelId (item['model_id'])
    //
    //    Zu.getModelBucketDataAsync ()
    //})
    //Zu.setModelId (6)
    //Zu.getModelBucketDataAsync (function () {
    //    Zu.setModelId (8)
    //
    //    Zu.getModelBucketDataAsync (function () {
    //
    //    })
    //})

})

;/**import from `/resource/js/page/shiyong/order.js` **/
// 下单页面
$(function(){
    var $PageOrder = $('.page-shiyong-order');
    if (!$PageOrder.length){
        return;
    }

    // 省市地区切换
    (function(){
        var flag_getall = true;/*根据省一次性获取所有的城市和区县信息*/
        var CacheProvinceList = [],
            CacheCityList = {},
            CacheAreaList = {};
        var $ProviceSelect = $('[name="receiver_province_id"]'),
            $CityList = $('[name="receiver_city_id"]'),
            $AreaList = $('[name="receiver_area_id"]');
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
            var html_str = [];

            $.each(data, function(i, item){
                html_str.push('<option value="', item['province_id'], '"');
                if (selected_name===item['province_name']){
                    html_str.push(' selected');
                }
                html_str.push('>', item['province_name'], '</option>');
            });

            html_str = html_str.join('');
            $ProviceSelect.html(html_str);
            if (html_str){
                $ProviceSelect.show();
            } else {
                $ProviceSelect.hide()
            }
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
        function setCityHtml(data, selected_name){
            data = data || [];
            var html_str = [];

            $.each(data, function(i, item){
                html_str.push('<option value="', item['city_id'], '"');
                if (selected_name===item['city_name']){
                    html_str.push(' selected');
                }
                html_str.push('>', item['city_name'], '</option>');
            });

            html_str = html_str.join('');
            $CityList.html(html_str);
            if (html_str){
                $CityList.show();
            } else {
                $CityList.hide()
            }
        }
        // 设置地区html
        function setAreaHtml(data, selected_name){
            data = data || [];
            var html_str = [];

            $.each(data, function(i, item){
                html_str.push('<option value="', item['area_id'], '"');
                if (selected_name===item['area_name']){
                    html_str.push(' selected');
                }
                html_str.push('>', item['area_name'], '</option>');
            });

            html_str = html_str.join('');
            $AreaList.html(html_str);
            if (html_str){
                $AreaList.show();
            } else {
                $AreaList.hide()
            }
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

        function init(){

            getProvinceList(function(province_list){
                // 获取省份信息
                // 设置初始化省

                var _default_city_name = window.city_name;

                setProvinceHtml(province_list, _default_city_name);

                var province_id = getProvinceIdByName(_default_city_name, province_list);
                if (province_id) {
                    getCityAreaList(province_id, function(city_list, area_list){
                        // 城市
                        setCityHtml(city_list);

                        // 区县
                        setAreaHtml(area_list);
                    });
                }
            });

            tcb.bindEvent(document.body, {
                // 切换省
                '[name="receiver_province_id"]': {
                    change: function(e){
                        var $me = $(this),
                            province_id = $me.val();

                        getCityAreaList(province_id, function(city_list, area_list){
                            // 城市
                            setCityHtml(city_list);

                            // 区县
                            setAreaHtml(area_list);
                        });
                    }
                },
                // 切换城市
                '[name="receiver_city_id"]': {
                    change: function(e){
                        var $me = $(this),
                            city_id = $me.val();

                        getAreaList(city_id, function(area_list){
                            // 区县
                            setAreaHtml(area_list);
                        });
                    }
                }
            });
        }
        init();
    }());

    // 订单提交
    (function(){
        // 订单表单提交
        var
            $SubmitOrderForm = $('#SubmitOrderForm')

        $SubmitOrderForm.on('submit', function(e){
            e.preventDefault();

            var $form = $(this);

            // 验证表单
            if (!validOrderForm($form)){
                return ;
            }

            $.post($form.attr('action'), $form.serialize(), function(res){
                res = $.parseJSON(res);

                if (!res['errno']){
                    var
                        result = res['result'],
                        order_id = result['order_id']

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
                $receiver_address = $form.find('[name="receiver_address"]'),
                $receiver_mobile = $form.find('[name="receiver_mobile"]'),
                $agreement = $form.find('[name="agreement"]'),
                $btn = $form.find('.btn-submit')

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
            // 验证是否选中服务协议
            if ( !($agreement&&$agreement.length&& $agreement.prop('checked') ) ) {
                if ($agreement&&$agreement.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $agreement;
                    setTimeout(function(){
                        $agreement.closest('.agreement-row').shine4Error();
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
                var $step_block = $firt_error_el.closest('.step-block');

                $(document.body).animate({
                    'scrollTop': $step_block.offset()['top']
                }, delay+delay_fix, function(){
                    $firt_error_el.focus();
                });
            }

            return flag;
        }

        // 显示租用协议
        function showAgreement(){
            var
                html_fn = $.tmpl( $.trim($('#JsMZuAgreementConfirmTpl').html())),
                html_st = html_fn()

            tcb.showDialog(html_st, 'mobile-experience-agreement-wrap')
        }

        tcb.bindEvent(document.body, {
            // 点击服务协议
            '[name="agreement"]': function(e){
                var
                    $me = $(this)

                if ($me.prop('checked')){
                    // 选中服务协议

                    $('.btn-submit').removeClass('btn-disabled')
                } else {

                    $('.btn-submit').addClass('btn-disabled')
                }
            },
            // 显示租机服务协议
            '.trigger-show-zu-agreement': function(e){
                e.preventDefault()

                showAgreement()
            },
            //// 提交订单
            //'.submit-order-form .btn-submit': function(e){
            //    e.preventDefault();
            //
            //    var $form = $('#SubmitOrderForm');
            //    if (!validOrderForm($form)){
            //        return ;
            //    }
            //
            //    var html_str = $.tmpl( $.trim($('#JsMZuAgreementConfirmTpl').html()) );
            //
            //    tcb.showDialog(html_str, 'mobile-experience-agreement-wrap');
            //},
            // 不同意租用协议
            '.btn-prd-buy-cancel': function(e){
                e.preventDefault();

                $('[name="agreement"]').removeAttr('checked')
                $('.btn-submit').addClass('btn-disabled')

                tcb.closeDialog()
            },
            // 同意租用协议
            '.btn-prd-buy-confirm': function(e){
                e.preventDefault();

                $('[name="agreement"]').prop('checked', 'checked')
                $('.btn-submit').removeClass('btn-disabled')

                tcb.closeDialog()
            }
        });

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

;/**import from `/resource/js/page/shiyong/order_pay/order_pay.js` **/
// 订单支付
;
(function () {
    var
        Bang = window.Bang = window.Bang || {}

    //事件
    function initEvent () {
        var
            hidden = "hidden",
            active = "active",
            disabled = "disabled"

        var
            $cashier = $ (".cashier-bd"),
            $opt = $ (".ca-opt-info"),
            $mod = $ (".cashier-mod"),
            $tab = $ (".cashier-tab"),
            $form = $ ("#pay_form"),
            $bank = $ ("#bank_code"),
            $period = $ (".pay-period-list"),
            $stages = $ ("#hb_by_stages"),
            $payrate = $ ("#payrate"),
            $button = $ (".pay-button"),
            $button_wx = $ (".pay-button-wx")

        // 切换支付方式tab
        $tab.on ("click", "li", function () {
            var
                me = $ (this)

            var
                type = me.attr ("data-type"),
                mod = me.attr ("data-mod")

            $tab.find ("li").removeClass (active);
            $mod.addClass (hidden);
            $ ("." + mod + "-block").removeClass (hidden);
            $tab.find ("li[data-mod='" + mod + "']").addClass (active);
            $bank.val (type)

            if (type == "alipay_hb") {
                // 花呗分期

                var sel = $period.find ("." + active);
                var period = sel.attr ("period") * 1; //付款分期数
                var amount = sel.attr ("amount") * 1;//分期总额
                var payrate = sel.attr ("payrate") * 1;//含手续费
                $ ("#amount").html ("¥" + amount);
                $payrate.html ("¥" + payrate);
                $stages.val (period)

            } else {

                $stages.val ("");
                $payrate.html ("");
            }
        })

        // 切换分期方案 hbfq
        $period.on ("click", "li", function () {
            var
                $me = $ (this)

            $me.siblings ().removeClass (active)
            $me.addClass (active)

            var
                amount = $me.attr ("amount") * 1,     //分期总额
                pay_rate = $me.attr ("payrate") * 1,  //含手续费
                period = $me.attr ("period") * 1      //付款分期数

            $ ("#amount").html ("¥" + amount)
            $payrate.html ("¥" + pay_rate)
            $stages.val (period)
        })

        // 查看订单详情
        $opt.on ("click", function () {
            $cashier.slideToggle (500);
        })

        // 微信已完成支付
        $button_wx.on ("click", function () {
            var
                $me = $ (this)
            if ($me.hasClass (disabled)) {
                window.alert ('因超时未支付，该订单已关闭');
                return
            }

            var
                order_id = $ ("#order_id").val ()

            getOrderStatus (order_id, function (errno, errmsg) {
                var
                    $error = $me.parent ().find (".error")
                if (errno == "0") {

                    window.location.replace ('/shiyong/paysuc?order_id=' + order_id);
                } else {
                    $error.html (errmsg);
                }
            });
        })

        // 立即支付
        $button.on ("click", function () {
            var
                $me = $ (this)

            if ($me.hasClass (disabled)) {
                window.alert ('因超时未支付，该订单已关闭');
                return;
            }
            //花呗分期付款
            if ($.trim ($ ("#bank_code").val ()) == "alipay_hb" && $period.find ("." + active).length == 0) {
                window.alert ('请选择一种分期方式');
                return;
            }
            var
                channel = $bank.val ()
            if (channel != "hdfk") {
                var
                    payPanel = tcb.showDialog($.trim( $ ("#JsPaymentConfirmPanelTpl").html () ), {
                        className: 'common-payment-confirm-panel-wrap',
                        withClose: false
                    })

                payPanel.wrap.off ("click").on ("click", "span", function (e) {
                    var
                        pay = $ (e.target).attr ("data-hoom"),
                        order_id = $ ("#order_id").val ()

                    var
                        $error = payPanel.wrap.find (".error");

                    switch (pay) {
                        case "close" :

                            tcb.closeDialog()

                            break
                        case "finish" :

                            getOrderStatus (order_id, function (errno, errmsg) {
                                if (errno == "0") {

                                    window.location.replace ('/shiyong/paysuc?order_id=' + order_id)
                                } else {
                                    $error.html (errmsg)
                                }
                            })

                            break
                        case "reset" :
                            getOrderStatus (order_id, function (errno, errmsg) {
                                if (errno == "0") {

                                    window.location.replace ('/shiyong/paysuc?order_id=' + order_id)
                                } else {
                                    tcb.closeDialog()
                                }
                            })

                            break
                    }

                })

            }
            $form.submit ()
        })
    }

    //订单倒计时
    function initCountDown () {
        var
            $status = $ (".ca-status-mod")
        if ( !($status && $status.length)){
            return
        }

        var
            now = $status.attr ("now").replace (/-/g, "/"),   //当前服务器时间
            begin = $status.attr ("begin").replace (/-/g, "/"), //订单创建时间
            pid = $status.attr ("pid"),                      //商品ID
            cur_time = (new Date (now).getTime () || new Date ().getTime ()) * 1,
            lock_time = (new Date (begin).getTime ()) * 1 + (window.locked_time || 900)*1000

        if (lock_time > cur_time) {
            Bang.startCountdown (lock_time, cur_time, $ ("#countdown"), {
                //倒计时结束
                "end" : function () {
                    window.location.reload ();
                }
            })
        }
    }

    //初始数据
    function initData () {
        var
            bank = $ ("#bank_code").val ()

        var
            $period = $ (".pay-period-list")

        if (bank == "alipay_hb") {
            // 默认支付为 花呗分期

            var
                sel = $period.find (".active")

            var
                amount = sel.attr ("amount") * 1,  //分期总额:
                pay_rate = sel.attr ("payrate") * 1 //含手续费

            $ ("#amount").html ("¥" + amount)
            $ ("#payrate").html ("¥" + pay_rate)
        }
    }

    // 获取订单状态
    function getOrderStatus (order_id, callback) {
        $.ajax ({
            url      : "/shiyong/getOrderStatus?order_id=" + order_id,
            dataType : 'json',
            error    : function () {
                setTimeout (function () {

                    getOrderStatus (order_id, callback);
                }, 5000);
            },
            success  : function (data) {
                callback && callback (data.errno, data.errmsg)
            }
        });
    }

    $ (function () {

        var
            $PageOrderPay = $ ('.page-order-pay')
        if (!($PageOrderPay && $PageOrderPay.length)) {
            return
        }

        initCountDown ()
        initEvent ()
        initData ()

    })

} ())



;/**import from `/resource/js/page/shiyong/order_success.js` **/
// 下单成功
$(function(){
    var $PageOrderSuccess = $('.page-shiyong-order-success');
    if (!$PageOrderSuccess.length){
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
                    window.location.href = window.location.href+'&status_close=1';
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
        tcb.bindEvent(document.body, {
            // 点击完成支付
            '.btn-pay-success': function(e){
                e.preventDefault();

                var $me = $(this),
                    order_id = $me.attr('data-orderid');
                var request_url = '/shiyong/doGetPayResult?order_id='+order_id;
                $.get(request_url, function(res){
                    res = $.parseJSON(res);

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
