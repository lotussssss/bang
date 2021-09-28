// 优品下单页，收货人信息编辑
Dom.ready (function () {

    var
        class_addrinfo_block_wrap = 'addrinfo-block-wrap',
        class_addrinfo_block_wrap_noborder = 'addrinfo-block-wrap-noborder',

        class_addrinfo_block = 'addrinfo-block',
        class_addrinfo_item = 'addrinfo-item'

    tcb.bindEvent (document.body, {

        // 收货人信息列表交互（包括添加送货地址信息）
        '.addrinfo-item'      : {
            'click'      : function (e) {
                var
                    wTarget = W(e.target)
                if (wTarget[0 ].nodeName.toLowerCase()=='input'){
                    e.stopPropagation()
                } else {
                    e.preventDefault ()
                }

                var
                    wMe = W (this),
                    wInpt = wMe.query ('input'),
                    shipping_address_id = wInpt.val ()

                wInpt.attr ('checked', 'checked');
                wMe.addClass ('selected').siblings ('.selected').removeClass ('selected');

                // 设置为当前信息
                // 设置送货地址id
                setShippingAddressId (shipping_address_id)

                if (wTarget.hasClass('addrinfo-item-edit')){
                    // 点击的编辑按钮,直接返回,不执行下边的其他判断和操作了

                    return
                }

                wMe.siblings ('.addrinfo-block').removeNode ()

                // 添加新地址
                if (wMe.hasClass ('addrinfo-item-add')) {

                    if (wMe.siblings ('.addrinfo-item').length == 3) {

                        alert ('抱歉，您最多只能添加三个收货地址')
                    } else {

                        // 显示送货地址添加块
                        showShippingAddressAddBlock (wMe[ 0 ])
                    }
                }
            },
            'mouseenter' : function (e) {
                var wMe = W (this);

                wMe.addClass ('hover');

                wMe.query ('.addrinfo-item-edit').show ();
            },
            'mouseleave' : function (e) {
                var wMe = W (this);

                wMe.removeClass ('hover');

                wMe.query ('.addrinfo-item-edit').hide ();
            }
        }, // 编辑收货人信息
        '.addrinfo-item-edit' : function (e) {
            e.preventDefault ();

            var wMe = W (this), wItem = wMe.ancestorNode ('.addrinfo-item')

            wItem.siblings ('.addrinfo-block').removeNode ();
            wItem.one ('.addrinfo-item-radio').attr ('checked', 'checked');

            var
                data = {
                    'shipping_address' : {
                        'id'              : wItem.one ('.addrinfo-item-radio').val (),
                        'receiver_name'   : wItem.one ('.addrinfo-item-receiver').html (),
                        'province'        : wItem.one ('.addrinfo-item-provincename').html (),
                        'city'            : wItem.one ('.addrinfo-item-cityname').html (),
                        'area'            : wItem.one ('.addrinfo-item-areaname').html (),
                        'address_detail'  : wItem.one ('.addrinfo-item-addr').html (),
                        'receiver_mobile' : wItem.one ('.addrinfo-item-mobile').html ()
                    },
                    'postkey'          : getPostkey ()
                }

            // 显示送货地址添加块
            showShippingAddressAddBlock (wItem[ 0 ], data)

        }

    })

    // 首次下单无收货信息
    var wAddAddrInfoForm = W ('#AddAddrInfoForm');
    if (wAddAddrInfoForm.length) {

        // 收货人信息表单事件
        bindEventAddAddrInfoForm (wAddAddrInfoForm);

        // 激活城市区县选择
        activeAreaSelect ();
    }


    // 验证添加地址表单
    function validAddAddrInfoForm (wForm) {
        if (!(wForm && wForm.length)) {
            return false;
        }
        var flag = true

        // 收货人
        var
            wReceiver = wForm.query ('[name="receiver_name"]')
        if (!(wReceiver && wReceiver.length && wReceiver.val ().trim ())) {
            flag = false;
            if (wReceiver && wReceiver.length) {
                wReceiver.shine4Error ().focus ();
            }
        }
        // 省
        var
            wProvincename = wForm.query ('[name="receiver_province_id"]')
        if (wProvincename && wProvincename.length && wProvincename.isVisible ()) {
            if (!(wProvincename.val ().trim () && wProvincename.val ().trim () != '省份')) {
                flag = false;
                //tcb.errorBlink ( wProvincename );
                wProvincename.shine4Error ()
            }
        }
        // 城市
        var
            wCityname = wForm.query ('[name="receiver_city_id"]')
        if (wCityname && wCityname.length && wCityname.isVisible ()) {
            if (!(wCityname.val ().trim () && wCityname.val ().trim () != '城市')) {
                flag = false;
                //tcb.errorBlink ( wCityname );
                wCityname.shine4Error ()
            }
        }
        // 区县
        var
            wAreaname = wForm.query ('[name="receiver_area_id"]')
        if (wAreaname && wAreaname.length && wAreaname.isVisible ()) {
            if (!(wAreaname.val ().trim () && wAreaname.val ().trim () != '区县')) {
                flag = false;
                //tcb.errorBlink ( wAreaname );
                wAreaname.shine4Error ()
            }
        }
        // 详细地址
        var
            wAddr = wForm.query ('[name="receiver_address"]')
        if (!(wAddr && wAddr.length && wAddr.val ().trim ())) {
            if (wAddr && wAddr.length) {
                wAddr.shine4Error ();
                if (flag) {
                    wAddr.focus ();
                }
            }
            flag = false;
        }
        // 手机号
        var
            wMobile = wForm.query ('[name="receiver_mobile"]'), mobile = wMobile.val ().trim ()
        if (!(wMobile && wMobile.length && tcb.validMobile (mobile))) {
            if (wMobile && wMobile.length) {
                wMobile.shine4Error ();
                if (flag) {
                    wMobile.focus ();
                }
            }
            flag = false;
        }

        return flag;
    }

    /**
     * 收货人信息表单事件
     * @param  {[type]} wForm [提交表单]
     * @return {[type]}       [description]
     */
    function bindEventAddAddrInfoForm (wForm) {

        wForm.on ('submit', function (e) {
            e.preventDefault ();

            var wMe = W (this)

            // 验证收货信息表单
            if (!validAddAddrInfoForm (wMe)) {
                return false
            }

            var // 发货地址id
                wId = wMe.query ('[name="addr_id"]'),
                shipping_address_id = ''
            if (wId && wId.length) {
                shipping_address_id = wId.val ()
            }

            // 设置异步请求接口地址
            wMe.attr ('action', '/aj/doEditUserAddr')
            // 提交收货信息表单
            QW.Ajax.post (wMe[ 0 ], function (res) {
                res = JSON.parse (res);

                if (!res.errno) {

                    // 边框样式之类class设置
                    var wNoboder = wMe.ancestorNode ('.' + class_addrinfo_block_wrap_noborder)
                    if (wNoboder.length) {
                        wNoboder
                            .addClass (class_addrinfo_block_wrap)
                            .removeClass (class_addrinfo_block_wrap_noborder);
                    }

                    var
                        wShippingAddressBlock = wMe.ancestorNode ('.addrinfo-block'),
                        result = res.result,
                        flag_edit = false

                    //result[ 'des' ] = result[ 'des' ].split (' ')

                    if (shipping_address_id) {
                        // 编辑

                        flag_edit = true
                    }

                    // 更新收货地址
                    updateShippingAddress (wShippingAddressBlock, {
                        shipping_address_id : result[ 'addr_id' ],
                        address             : {
                            shipping_name           : result[ 'address' ][ 'name' ],
                            shipping_province       : result[ 'address' ][ 'province' ],
                            shipping_city           : result[ 'address' ][ 'city' ],
                            shipping_area           : result[ 'address' ][ 'area' ],
                            shipping_address_detail : result[ 'address' ][ 'address_detail' ],
                            shipping_mobile         : result[ 'address' ][ 'mobile' ]
                            //shipping_name           : result[ 'des' ][ 0 ],
                            //shipping_province       : result[ 'des' ][ 1 ],
                            //shipping_city           : result[ 'des' ][ 2 ],
                            //shipping_area           : result[ 'des' ][ 3 ],
                            //shipping_address_detail : result[ 'des' ][ 4 ],
                            //shipping_mobile         : result[ 'des' ][ 5 ]
                        },
                        post_key            : result[ 'postkey' ]
                    }, flag_edit)

                } else {
                    alert (res.errmsg);
                    // location.href = location.href;
                }
            })

        })

    }

    // 激活城市区县选择
    function activeAreaSelect (OptDefault) {
        OptDefault = OptDefault || []
        var
            options = {
                // 实例化的时候自动执行init函数
                flagAutoInit     : true,
                selectorProvince : '[name="receiver_province_id"]',
                selectorCity     : '[name="receiver_city_id"]',
                selectorArea     : '[name="receiver_area_id"]',
                province         : OptDefault[ 0 ],
                city             : OptDefault[ 1 ],
                area             : OptDefault[ 2 ]
            }

        Bang.AddressSelect (options)
    }

    // 获取当前最新的postkey
    function getPostkey () {
        var ret = '';

        var wPostkey = W ('#ProductPostkey');
        if (wPostkey.length) {
            ret = wPostkey.val ();
        }
        return ret;
    }

    // 设置最新的postkey
    function setPostkey (postkey) {
        postkey = postkey || '';
        var wPostkey = W ('#ProductPostkey');

        if (wPostkey.length) {
            wPostkey.val (postkey);
        }
        return postkey;
    }

    // 设置送货地址id
    function setShippingAddressId (val_id) {
        W ('#ProductYJId').val (val_id);
    }

    // 显示送货地址添加块
    function showShippingAddressAddBlock (target_el, data) {
        data = data || {
            'shipping_address' : {
                'id'              : '',
                'receiver_name'   : '',
                'province'        : '省份',
                'city'            : '城市',
                'area'            : '区县',
                'address_detail'  : '',
                'receiver_mobile' : ''
            },
            'postkey'          : getPostkey ()
        }
        var
            tmpl_fn = W ('#JsLiangpinTinfoAddAddrTpl').html ().trim ().tmpl (),
            tmpl_st = tmpl_fn (data),
            wShippingAddressBlock = W (tmpl_st)

        W (target_el).insertAdjacentElement ('afterend', wShippingAddressBlock[ 0 ])

        // 送货地址表单
        var
            wShippingAddressForm = wShippingAddressBlock.query ('form')
        if (wShippingAddressForm.length) {
            var
                province = data[ 'shipping_address' ][ 'province' ],
                city = data[ 'shipping_address' ][ 'city' ],
                area = data[ 'shipping_address' ][ 'area' ]

            // 激活地址选择
            activeAreaSelect ([ province,
                                city,
                                area ]);

            // 收货人信息表单事件
            bindEventAddAddrInfoForm (wShippingAddressForm);
        }

    }

    // 更新收货地址
    function updateShippingAddress ($block, data, flag_edit) {

        var
            str = '<div class="addrinfo-item selected">' +
                '<input class="addrinfo-item-radio" type="radio" name="addr_id" value="' + data[ 'shipping_address_id' ] + '" checked>' +
                '<span class="mr8 addrinfo-item-receiver">' + data[ 'address' ][ 'shipping_name' ] + '</span>' +
                '<span class="addrinfo-item-provincename">' + data[ 'address' ][ 'shipping_province' ] + '</span>' +
                '<span class="addrinfo-item-cityname">' + data[ 'address' ][ 'shipping_city' ] + '</span>' +
                '<span class="mr8 addrinfo-item-areaname">' + data[ 'address' ][ 'shipping_area' ] + '</span>' +
                '<span class="mr8 addrinfo-item-addr">' + data[ 'address' ][ 'shipping_address_detail' ] + '</span>' +
                '<span class="addrinfo-item-mobile">' + data[ 'address' ][ 'shipping_mobile' ] + '</span>' +
                '<a href="#" class="addrinfo-item-edit">编辑</a>' +
                '</div>'

        if (!flag_edit && $block.siblings ('.addrinfo-item').length < 4) {
            // 新增地址 && 并且已经添加的地址数量小于2个

            str += '<div class="addrinfo-item addrinfo-item-add">' +
            '<input class="addrinfo-item-radio" type="radio" name="addr_id" value="">' +
            '<span>添加新地址</span>' +
            '</div>'
        }

        $block.previousSibling ('.addrinfo-item').removeNode ();
        $block.insertAdjacentHTML ('beforebegin', str)
        $block.removeNode ()

        // 更新收货地址id
        setShippingAddressId (data[ 'shipping_address_id' ])
        // 更新postkey
        setPostkey (data[ 'post_key' ])
    }

})