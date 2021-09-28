(function () {
    $ (function () {
        tcb.cache ('assess_key', '')

        // 初始化
        function init () {

            // 处理新机sku数据
            handleNewProductSkuData ()
            // 处理旧机机型数据
            handleOldProductData ()

            // 设置新机的select元素内容
            setNewProductSelectElement ()
            // 设置旧机的select元素内容
            setOldProductSelectElement ()
            // 获取、设置旧机机型下的评估数据项
            doGetAssessOptionsData (tcb.cache ('old_product_model_id'), function () {

                // 设置旧机评估项的select元素内容
                setOldProductAssessSelectElement ()
                // 设置换新信息
                setHuanXinInfo ()

            })

            // 绑定事件
            bindEvent ()

        }

        init ()


        // 绑定事件
        function bindEvent () {

            tcb.bindEvent (document.body, {
                // 出发select选择
                '.js-select-trigger' : function (e) {
                    e.preventDefault ()

                    var
                        $me = $ (this),
                        $select = $me.siblings ('select')

                    triggerOpenSelectList ($select)
                },

                // 立即换新
                '.btn-go-huanxin'    : function (e) {
                    e.preventDefault ()

                    var
                        $me = $ (this),
                        $mobile = $ ('#MobileAtEnter'),
                        mobile = $.trim ($mobile.val ())

                    if (!mobile) {
                        $.errorAnimate ($mobile)

                        setTimeout (function () {
                            $mobile.focus ()
                        }, 1000)

                        $.dialog.toast ('手机号码不能为空')

                        return
                    } else if (!tcb.validMobile (mobile)) {
                        $.errorAnimate ($mobile)

                        setTimeout (function () {
                            $mobile.focus ()
                        }, 1000)

                        $.dialog.toast ('请输入正确的手机号')

                        return
                    }

                    var
                        assess_key = tcb.cache ('assess_key')
                    if (!assess_key){

                        $.dialog.toast ('正在处理您的换新请求，不要心急~', 2000)
                        return
                    }

                    var
                        $Form = $ ('#ShangMenSaleForm'),
                        $block2 = $ ('.block2'),
                        $block2_2 = $ ('.block2-2'),
                        tips = '',
                        old_model = '',
                        new_model = ''

                    $ ('.select-product-new').each (function (i) {
                        var $s = $ (this)
                        new_model += getSelectedOption ($s).html () + ' '
                    })
                    $ ('.select-product-old').each (function (i) {
                        var $s = $ (this)
                        old_model += getSelectedOption ($s).html () + ' '
                    })
                    tips += '新机：' + new_model + '<br/>旧机：' + old_model + '<br/>预计仅需' + $ ('#DiffPrice').attr ('data-price') + '元即可换新'

                    $block2_2.find ('.tips').html (tips)
                    $ ('#MobileAtPreview').html (mobile)

                    $Form.find ('[name="tel"]').val (mobile)
                    $Form.find ('[name="assess_key"]').val (assess_key)
                    var
                        new_product = window.__SkuComboMap[ window.__SkuSelected.join ('||') ]
                    $Form.find ('[name="newproductid"]').val (new_product['product_id'])

                    // 记录手机号
                    $.ajax ({
                        type     : 'GET',
                        url      : '/huishou/doAddUserInfo',
                        data     : {
                            'mobile': mobile,
                            'old_model': old_model,
                            'new_model':new_model
                        },
                        dataType : 'json',
                        timeout  : 5000,
                        success  : function () {},
                        error    : function () {}
                    })
                    // 加入购物车
                    //$.ajax ({
                    //    type     : 'POST',
                    //    url      : '/huishou/doAddCartForOnce',
                    //    data     : {
                    //        'assess_key': assess_key,
                    //        'newproductid': new_product['product_id']
                    //    },
                    //    dataType : 'json',
                    //    timeout  : 5000,
                    //    success  : function (res) {
                    //        if (!res['errno']){
                                $block2.hide ()
                                $block2_2.show ()
                    //        } else {
                    //            $.dialog.toast (res[ 'errmsg' ], 2000)
                    //        }
                    //    },
                    //    error    : function () {
                    //        $.dialog.toast ('请求失败，请重试', 2000)
                    //    }
                    //})

                },

                // 发送验证码
                '.btn-send-vcode'    : function (e) {
                    e.preventDefault ()

                    var
                        $me = $ (this),
                        $form = $me.closest ('form'),
                        $mobile = $form.find ('[name="tel"]')

                    if (!validSeCode ($me)) {
                        return
                    }

                    getSeCode ({ 'mobile' : $mobile.val () }, function (data) {
                        $me.addClass ('hsbtn-vcode-dis').html ('60秒后再次发送')

                        tcb.distimeAnim (60, function (time) {
                            if (time <= 0) {
                                $me.removeClass ('hsbtn-vcode-dis').html ('发送验证码')
                            } else {
                                $me.html (time + '秒后再次发送')
                            }
                        })
                    })

                },

                // 更换下单手机号
                '.js-mod-mobile'     : function (e) {
                    e.preventDefault ()

                    var
                        $block2 = $ ('.block2'),
                        $block2_2 = $ ('.block2-2')

                    $block2.show ()
                    $block2_2.hide ()
                }

            })

            // 上门时间选择
            __timeSelect ()

            // 绑定换新表单提交事件
            bindFormSubmit ()

            // 切换新机信息
            $ ('.select-product-new').on ('change', function (e) {
                var
                    $me = $ (this),
                    name = $me.attr ('name'),
                    key = name.split ('_')[ 1 ],
                    pos = tcb.inArray (key, window.__SkuKeys),
                    data = {}

                data[ key ] = $me.val ()

                if (pos > -1) {
                    window.__SkuSelected.splice (pos + 1)
                }

                // 设置被选中的sku属性值
                setSkuSelected (data)

                // 设置选中的新机select的内容
                setNewProductSelectElement ()

                setHuanXinInfo ()
            })

            // 切换旧机信息
            $ ('.select-product-old').on ('change', function (e) {
                var
                    $me = $ (this),
                    name = $me.attr ('name')

                if (name == 'old_product') {

                    tcb.cache ('old_product_model_id', $me.val ())

                    // 获取、设置旧机机型下的评估数据项
                    doGetAssessOptionsData (tcb.cache ('old_product_model_id'), function () {

                        // 设置旧机评估项的select元素内容
                        setOldProductAssessSelectElement ()
                        // 设置换新信息
                        setHuanXinInfo ()

                    })

                } else if (name == 'old_product_storage') {

                    tcb.cache ('old_product_storage_id', $me.val ())
                    setHuanXinInfo ()

                } else if (name == 'old_product_support') {

                    tcb.cache ('old_product_support_id', $me.val ())
                    setHuanXinInfo ()
                }

                $me.siblings ('.js-select-trigger').html (getSelectedOption ($me).html ())

            })
        }

        // 处理sku属性数据，给以下数据设置初始值
        // window.__SkuGroup
        // window.__SkuCombos
        // window.__SkuComboMap
        // window.__SkuSelected
        function handleNewProductSkuData () {
            var
                ret = []

            $.each (window.__ProductList, function (i, item) {

                var
                    sku_combo = []

                $.each (window.__SkuKeys, function (ii, key) {
                    if (!ret[ ii ]) {
                        ret[ ii ] = []
                    }

                    if (tcb.inArray (item[ key ], ret[ ii ]) === -1) {
                        // 还没添加进ret[ii]，那么加入其中

                        ret[ ii ].push (item[ key ])
                    }
                    sku_combo.push (item[ key ])
                })

                sku_combo = sku_combo.join ('||')

                window.__SkuCombos.push (sku_combo)

                window.__SkuComboMap[ sku_combo ] = {
                    product_id : item[ 'product_id' ],
                    price      : item[ 'price' ]
                }
            })

            window.__SkuGroup = ret
        }

        // 设置被选中的sku属性值
        function setSkuSelected (params, force) {

            $.each (window.__SkuKeys, function (i, key) {

                if (force) {
                    window.__SkuSelected[ i ] = params[ key ] || ''
                } else {

                    window.__SkuSelected[ i ] = params[ key ] || window.__SkuSelected[ i ] || ''
                }
            })
        }

        // 根据默认被选中的sku属性值，过滤可用的sku属性组
        function getFilteredSkuGroupBySkuSelected () {
            var
                filterSkuGroup = []

            $.each (window.__SkuGroup, function (i, sku_set) {
                if (!i) {
                    // 第一个位置的sku属性输出时取全量集合，后续的属性根据前一级确定
                    filterSkuGroup[ i ] = sku_set

                    if (!window.__SkuSelected[ i ]) {

                        window.__SkuSelected[ i ] = filterSkuGroup[ i ][ 0 ]
                    }

                    return
                }

                if (!filterSkuGroup[ i ]) {
                    filterSkuGroup[ i ] = []
                }

                if (!window.__SkuSelected[ i ]) {

                    window.__SkuSelected.splice (i)
                }
                // 遍历sku属性组集合
                $.each (window.__SkuCombos, function (ii, sku_combo) {

                    $.each (sku_set, function (iii, sku) {
                        var
                            sku_selected = window.__SkuSelected.slice (0, i).join ('||') + '||' + sku

                        if (sku_combo === sku_selected || sku_combo.indexOf (sku_selected + '||') === 0) {

                            tcb.inArray (sku, filterSkuGroup[ i ]) === -1 && filterSkuGroup[ i ].push (sku)
                        }
                    })
                })

                if (!window.__SkuSelected[ i ]) {

                    window.__SkuSelected[ i ] = filterSkuGroup[ i ][ 0 ]
                }

            })

            return filterSkuGroup
        }

        // 设置选中的新机select的内容
        function setNewProductSelectElement () {
            var
                filtered_sku_group = getFilteredSkuGroupBySkuSelected ()

            $.each (filtered_sku_group, function (i, sku_set) {
                var
                    option_html = ''

                $.each (sku_set, function (ii, sku) {
                    option_html += '<option value="' + sku + '"'
                    if (sku == window.__SkuSelected[ i ]) {
                        option_html += ' selected'
                    }
                    option_html += '>' + sku + '</option>'
                })

                var
                    $select = $ ('[name="product_' + window.__SkuKeys[ i ] + '"]')

                $select.html (option_html)
                $select.siblings ('.js-select-trigger').html (window.__SkuSelected[ i ])

            })
        }

        // 设置旧机的select元素内容
        function setOldProductSelectElement () {
            var
                option_html = ''

            // 旧机型号
            var
                $select_old_product = $ ('[name="old_product"]')

            option_html = ''
            $.each (window.__OldProductList, function (i, item) {
                option_html += '<option value="' + item[ 'model_id' ] + '">' + item[ 'model_name' ] + '</option>'
            })

            $select_old_product.html (option_html)
            $select_old_product.siblings ('.js-select-trigger').html (getSelectedOption ($select_old_product).html ())
        }

        // 设置旧机评估项的select元素内容
        function setOldProductAssessSelectElement () {
            var
                option_html = '',
                model_id = tcb.cache ('old_product_model_id')

            // 旧机容量
            var
                $select_old_product_storage = $ ('[name="old_product_storage"]')

            option_html = ''
            $.each (tcb.cache ('key_sku_attr_storage_set_' + model_id), function (i, item) {
                option_html += '<option value="' + item[ 'option_id' ] + '">' + item[ 'option_name' ] + '</option>'
            })

            $select_old_product_storage.html (option_html)
            $select_old_product_storage.siblings ('.js-select-trigger').html (getSelectedOption ($select_old_product_storage).html ())

            // 旧机保修期
            var
                $select_old_product_support = $ ('[name="old_product_support"]')

            option_html = ''
            $.each (tcb.cache ('key_special_options_support_set_' + model_id), function (i, item) {
                if (item[ 'option_id' ]=='6'){
                    item[ 'option_name' ] = '在保'
                }
                if (item[ 'option_id' ]=='8'){
                    item[ 'option_name' ] = '过保'
                }
                option_html += '<option value="' + item[ 'option_id' ] + '">' + item[ 'option_name' ] + '</option>'
            })

            $select_old_product_support.html (option_html)
            $select_old_product_support.siblings ('.js-select-trigger').html (getSelectedOption ($select_old_product_support).html ())

            tcb.cache ('old_product_storage_id', $select_old_product_storage.val ())
            tcb.cache ('old_product_support_id', $select_old_product_support.val ())
        }

        // 设置换新信息
        function setHuanXinInfo () {
            var
                new_product = window.__SkuComboMap[ window.__SkuSelected.join ('||') ],
                old_product_model_id = tcb.cache ('old_product_model_id'),
                old_product_storage_id = tcb.cache ('old_product_storage_id'),
                old_product_support_id = tcb.cache ('old_product_support_id'),
                old_product = tcb.cache ('old_product_model_id_map')[ old_product_model_id ]

            var
                sku_group_id = tcb.cache ('key_sku_attr_map_' + old_product_model_id)[ [ old_product_storage_id, old_product[ 'default_color' ],
                                                                                         old_product[ 'default_channel' ] ].join (',') ],
                sub_options = [ old_product_support_id, old_product[ 'default_options' ] ].join (',')

            tcb.cache ('assess_key', '')
            // 评估，获取评估价格
            $.ajax ({
                type     : 'POST',
                url      : '/huishou/doPinggu',
                data     : {
                    model_id     : old_product_model_id,
                    sku_group_id : sku_group_id,
                    sub_options  : sub_options,
                    need_price   : '1',
                    newproductid : new_product['product_id'],
                    update_cart   : '1'
                },
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    if (!res[ 'errno' ]) {
                        var
                            assess_key = res[ 'result' ][ 'assess_key' ],
                            old_product_price = res[ 'result' ][ 'pinggu_price' ],
                            new_product_price = new_product[ 'price' ],
                            diff_price = tcb.formatMoney (new_product_price - old_product_price, 0)

                        $ ('#DiffPrice').html (diff_price + '元').attr ('data-price', diff_price)

                        tcb.cache ('assess_key', assess_key)

                    } else {

                        $.dialog.toast (res[ 'errmsg' ])
                    }

                },
                error    : function () {
                    $.dialog.toast ('旧机价格获取失败，请稍后再试')
                }

            })

            return
        }

        // 处理旧机数据
        function handleOldProductData () {
            var
                old_product_model_id_default = '',
                old_product_model_id_map = {}

            $.each (window.__OldProductList, function (i, item) {

                old_product_model_id_map[ item[ 'model_id' ] ] = {
                    default_channel : item[ 'default_channel' ],
                    default_color   : item[ 'default_color' ],
                    default_options : item[ 'default_options' ]
                }

                if (!i) {
                    // 使用第一个机型作为默认机型

                    old_product_model_id_default = item[ 'model_id' ]
                }
            })

            tcb.cache ('old_product_model_id', old_product_model_id_default)
            tcb.cache ('old_product_model_id_map', old_product_model_id_map)
        }

        // 获取被选中的option对象
        function getSelectedOption ($select) {
            if (!($select && $select.length)) {

                return
            }

            return $select.find ('option').filter (function () {
                return this.selected
            })
        }

        // 根据型号id,获取针对当前机型的评估项数据
        // (默认系统已经cache了app自动检测过的选项,以及机型的内存属性项)
        function doGetAssessOptionsData (model_id, callback) {
            var
                sku_ready = false,
                special_ready = false,
                countdown = 5000

            // 获取型号sku评估项
            getModelSkuOptions ({ model_id : model_id }, function () {
                sku_ready = true
            })

            // 获取型号特有评估项
            getModelSpecialOptions ({ model_id : model_id }, function () {
                special_ready = true
            })

            if (sku_ready && special_ready) {
                typeof callback === 'function' && callback ()
            } else {
                countdown -= 100
                setTimeout (__ensureDataReady, 100)
            }

            // 确保数据获取成功
            function __ensureDataReady () {

                if (countdown < 0) {
                    // 获取机型下数据失败了,那么先干掉cache的model_id,
                    // 否则由于model_id被cache,就默认当作model_id相关的选项数据已经获取成功
                    tcb.cache ('old_product_model_id', '')

                    $.dialog.toast ('评估项获取失败，请重新尝试或刷新页面', 2000)

                    return
                }

                if (sku_ready && special_ready) {

                    typeof callback === 'function' && callback ()

                } else {
                    countdown -= 10
                    setTimeout (__ensureDataReady, 10)
                }
            }
        }

        // 获取型号sku选项
        // params : 获取sku选项组的参数
        //          model_id -> 必选
        function getModelSkuOptions (params, callback, error) {
            var
                sku_attr_map = tcb.cache ('key_sku_attr_map_' + params[ 'model_id' ])

            if (sku_attr_map) {
                // 已经有了SKU评估项

                typeof callback === 'function' && callback ()
            } else {
                // 获取型号sku评估项
                __modelOptionsGetter ({
                    type     : 'sku',
                    params   : params,
                    callback : callback,
                    error    : error,
                    handle   : __handleModelSkuOptions
                })
            }

        }

        // 获取型号sku确定后的专有评估选项
        // params : 获取专有选项组的参数
        //          model_id -> 必选
        function getModelSpecialOptions (params, callback, error) {
            var
                special_options_support_set = tcb.cache ('key_special_options_support_set_' + params[ 'model_id' ])

            if (special_options_support_set) {
                // 已经有了保修期评估项

                typeof callback === 'function' && callback ()
            } else {
                __modelOptionsGetter ({
                    type     : 'special',
                    params   : params,
                    callback : callback,
                    error    : error,
                    handle   : __handleModelSpecialOptions
                })
            }
        }

        // 型号选项获取器(sku和special通用方法)
        function __modelOptionsGetter (options) {
            var
                type = options[ 'type' ],
                params = options[ 'params' ],
                callback = options[ 'callback' ],
                error = options[ 'error' ],
                handle = typeof options[ 'handle' ] === 'function'
                    ? options[ 'handle' ]
                    : function () {},
                model_id = params[ 'model_id' ],
                url_map = {
                    'sku'     : '/huishou/doGetSkuOptions',
                    'special' : '/huishou/doGetPingguGroup'
                }

            if (!model_id) {

                $.dialog.toast ('没有获取到手机型号')

                return
            }

            var
                paramsData = {
                    model_id : model_id
                }

            $.ajax ({
                type     : 'GET',
                url      : url_map[ type ],
                data     : paramsData,
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {

                    if (!res[ 'errno' ]) {

                        // 处理属性数据
                        handle (model_id, res[ 'result' ])

                        typeof callback === 'function' && callback ()

                    } else {

                        $.dialog.toast (res[ 'errmsg' ])
                    }

                },
                error    : function () {
                    typeof error === 'function' && error ()
                }
            })

        }

        // 处理型号的sku数据，成为可用的格式
        function __handleModelSkuOptions (model_id, sku_data) {
            var
                sku_attr_map = {} // sku属性组合到sku的唯一id的映射

            var
                model_info = tcb.cache ('old_product_model_id_map')[ model_id ],
                default_color = model_info[ 'default_color' ],
                default_channel = model_info[ 'default_channel' ],
                storage_cate_id = '',
                storage_set = [],
                pushed_in = []

            var
                sku_data_list = sku_data[ 'list' ],
                sku_data_map = sku_data[ 'map' ]

            // 遍历sku的id和属性组的k-v组合
            $.map (sku_data_list, function (item_group, key) {

                var attr_ids = []

                // sku id的属性组合
                item_group.forEach (function (item, i) {

                    attr_ids.push (item[ 'attr_valueid' ])

                    if (i == 0) {
                        // 第一个位置是容量，此需求只获取容量数据
                        storage_cate_id = item[ 'attr_id' ]

                        // 加到属性组内的属性，不再重复添加
                        if (tcb.inArray (item[ 'attr_valueid' ], pushed_in) == -1) {

                            pushed_in.push (item[ 'attr_valueid' ]);

                            storage_set.push ({
                                option_id   : item[ 'attr_valueid' ],
                                option_name : item[ 'attr_valuename' ]
                            })
                        }
                    }

                })

                // 剔除所有颜色和渠道的属性值跟默认选中值不等的组合
                if (attr_ids[ 1 ] == default_color && attr_ids[ 2 ] == default_channel) {
                    // sku属性组合到sku的唯一id的映射
                    var
                        sku_attr_map_key = attr_ids.join (','),
                        sku_attr_map_val = key

                    sku_attr_map[ sku_attr_map_key ] = sku_attr_map_val
                }

            })

            // 容量展示顺序排序
            var
                attr_sort = sku_data_map[ storage_cate_id ],
                ext_index = 999
            storage_set.sort (function (a, b) {
                var
                    a_index = tcb.inArray (+a[ 'option_id' ], attr_sort),
                    b_index = tcb.inArray (+b[ 'option_id' ], attr_sort)

                a_index = a_index === -1
                    ? ext_index
                    : a_index
                b_index = b_index === -1
                    ? ext_index
                    : b_index

                // 扩展索引每次比较完成之后都+1,这样可以实现不在排序数组中的值,按顺序依次加到最后
                ext_index++

                // 比较当前属性id在排序map中的顺序,map中靠前的提到前边(即相减小于0)(注意点:id需要化为整数,保持和map中的类型一致)
                return a_index - b_index
            })

            tcb.cache ('key_sku_attr_map_' + model_id, sku_attr_map)
            tcb.cache ('key_sku_attr_storage_set_' + model_id, storage_set)
        }

        // 处理型号的专有评估选项，成为可用的格式
        function __handleModelSpecialOptions (model_id, group_data) {
            var
                assessGroup = group_data, // 评估组
                support_set = [] // 评估组

            $.each (assessGroup, function (i, item) {

                if (item[ 'pinggu_group_id' ] == '4') {
                    // 评估组id为4表示保修情况

                    item[ 'pinggu_group_options' ].forEach (function (options_item) {

                        support_set.push ({
                            option_id   : options_item[ 'option_id' ],
                            option_name : options_item[ 'option_name' ]
                        })
                    })
                }

            })

            tcb.cache ('key_special_options_support_set_' + model_id, support_set)
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

        // 绑定表单提交事件
        function bindFormSubmit () {
            var
                $Form = $ ('#ShangMenSaleForm')

            if (!($Form && $Form.length)) {
                return
            }

            $Form.on ('submit', function (e) {
                e.preventDefault ()

                // 验证表单
                if (!validShangMenForm ($Form)) {

                    return console.warn ('表单验证失败了，检查检查呗～')
                }

                var
                    $SubmitBtn = $Form.find ('.btn-submit-huanxin'),
                    btn_val = $SubmitBtn.val ()

                $SubmitBtn.addClass ('btn-disabled').val ('提交中...')

                // 提交表单数据
                $.ajax ({
                    type     : $Form.attr ('method'),
                    url      : $Form.attr ('action'),
                    data     : $Form.serialize (),
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {

                        if (res[ 'errno' ]) {
                            $.dialog.toast (res[ 'errmsg' ], 2000)

                            $SubmitBtn.removeClass ('btn-disabled').val (btn_val)
                        } else {

                            if (!res[ 'result' ]) {
                                $SubmitBtn.removeClass ('btn-disabled').val (btn_val)

                                return
                            }
                            var
                                redirect_params = {
                                    'order_id' : res[ 'result' ][ 'parent_id' ]
                                }
                            window.location.href = tcb.setUrl2 ('/m/hs_user_invoice/', redirect_params)
                        }
                    },
                    error    : function () {
                        $.dialog.toast ('系统异常，请重试')

                        $SubmitBtn.removeClass ('btn-disabled').val (btn_val)
                    }
                })

            })
        }

        // 选择服务时间
        function __timeSelect () {
            // 选择服务时间
            new $.datetime ('[name="server_time"]', {
                remote : '/aj/doGetValidDateByRecovery'
            })
        }

        // 验证上门表单
        function validShangMenForm ($Form) {
            var
                flag = true,
                mobile = $Form.find ('[name="tel"]'),
                mcode = $Form.find ('[name="code"]'),
                addr = $Form.find ('[name="user_addr"]'),
                $server_time = $Form.find ('[name="server_time"]');

            var
                $focus_el = null

            if (!tcb.validMobile (mobile.val ())) {
                $.errorAnimate (mobile)
                $focus_el = $focus_el || mobile
                flag = false
            }

            if (mcode && mcode.length) {
                if ($.trim (mcode.val ()).length == 0) {
                    $.errorAnimate (mcode)
                    $focus_el = $focus_el || mcode
                    flag = false
                }
            }

            // 上门时间
            if ($server_time && $server_time.length && !$server_time.val ()) {
                $.errorAnimate ($server_time);
                $focus_el = $focus_el || $server_time;
                flag = false;
            }

            if (addr && addr.length) {
                if ($.trim (addr.val ()).length == 0) {
                    $.errorAnimate (addr)
                    $focus_el = $focus_el || addr
                    flag = false
                }
            }

            setTimeout (function () {
                $focus_el && $focus_el.focus ()
            }, 500)

            return flag
        }

        function validSeCode ($Target) {
            var
                flag = true
            if (!($Target && $Target.length)) {
                flag = false

            } else {
                var $form = $Target.closest ('form'),
                    mobile = $form.find ('[name="tel"]');

                if ($Target.hasClass ('hsbtn-vcode-dis')) {
                    flag = false
                }
                else if (!tcb.validMobile (mobile.val ())) {
                    flag = false
                    $.errorAnimate (mobile.focus ())
                    $.dialog.toast ('手机格式错误')
                }
            }

            return flag
        }

        function getSeCode (params, callback, error) {

            //__ajax ({
            //    type : 'POST',
            //    url  : '/aj/send_hssecode/',// [接口废弃]此处js已无处使用
            //    data : params
            //}, callback, error)
        }

        function __ajax (params, callback, error) {
            $.ajax ({
                type     : params[ 'type' ],
                url      : params[ 'url' ],
                data     : params[ 'data' ],
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {

                    if (res[ 'errno' ]) {
                        $.dialog.toast (res[ 'errmsg' ], 2000)
                    }
                    typeof callback === 'function' && callback (res[ 'result' ])
                },
                error    : function () {
                    typeof error === 'function' && error ()
                }
            })
        }

    })

    wx.ready (function () {
        var noop = function () {}
        var wxData

        // 微信分享的数据
        wxData = {
            "title"   : '2288元拿全新iPhone7！',
            "desc"    : '电信用户专享福利，苏宁携手360同城帮，以旧换新，iPhone7只要2288元起，给您送上门！',
            "link"    : window.location.href,
            "imgUrl"  : 'https://p.ssl.qhimg.com/t01f0aee1a4452d3e06.png',
            "success" : noop, // 用户确认分享的回调
            "cancel"  : noop // 用户取消分享
        }

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        wx.onMenuShareAppMessage (wxData)
        // 点击分享到朋友圈，会执行下面这个代码
        wx.onMenuShareTimeline (wxData)
        //分享到QQ
        wx.onMenuShareQQ (wxData)
    })

} ())