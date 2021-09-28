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