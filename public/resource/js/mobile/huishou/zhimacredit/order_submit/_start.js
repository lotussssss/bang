!function (global) {
    // 非下单页,直接返回不做任何处理
    if (window.__PAGE !== 'zhimacredit-order-submit') {

        return
    }

    var Root = tcb.getRoot (),
        o = Root.Order
    var SwipeSection = window.Bang.SwipeSection

    // 初始化评估页面
    // DOM READY at callback
    o.init ({
        // 前置处理
        before : function () {
            o.data.url_query = tcb.queryUrl (window.location.search)
        },
        // DOM READY之后
        after  : function () {
            var $Target = $('.page-zhimacredit-order-submit')

            __init($Target)

            __bindEvent($Target)
        }
    })


    function __bindEvent($Target){

        __usePromo ($Target)

        o.event.youJiOrderSubmit($Target)
        o.event.shangMenOrderSubmit($Target)

        tcb.bindEvent({
            // 去回收
            '.btn-zhimacredit-cover-go': function(e){
                e.preventDefault()

                $(this).closest('.block-zhimacredit-cover-tip').remove()
            },
            // 切换回收方式
            '.block-zhimacredit-service-type-nav a': function(e){
                e.preventDefault()

                var $me = $(this)
                if ($me.hasClass('selected')){
                    return
                }

                $me.addClass('selected').siblings('.selected').removeClass('selected')

                var data_type = $me.attr('data-type'),
                    $block = $('.block-zhimacredit-service')
                if ($block && $block.length){
                    $block.hide()
                    $block.filter(function () {
                        return $(this).attr('data-type')==data_type
                    }).show()
                }
                if (data_type=='3' && $.trim($me.html())=='信用回收'){
                    $('.btn-show-zhimacredit-hs-protocol').attr('data-is-credit', '1').html('信用回收用户协议')
                } else {
                    $('.btn-show-zhimacredit-hs-protocol').removeAttr('data-is-credit').html('回收服务条款')
                }

                // 设置回收加价
                var hs_sale_id = $me.attr('data-hs-sale-id'),
                    price_add_info = window.__PRICE_ADD_INFO || {},
                    price_add = ''
                if (price_add_info && price_add_info[hs_sale_id] && price_add_info[hs_sale_id ].add_price){
                    price_add = price_add_info[hs_sale_id ].add_price
                }
                $('#ZhimacreditHsAddedPrice').html(' + '+price_add)
            },
            // 提交下单表单
            '.btn-order-submit': function(e){
                e.preventDefault()

                var $Form = $('.block-zhimacredit-service form').filter (function(){
                    return !!$(this).height()
                })

                if ($Form && $Form.length) {

                    window.__FLAG_SUBMIT_REDIRECT_URL_OFFLINE = false
                    if ($Form.find ('[name="sale_type"]').val () == 'offline') {
                        window.__FLAG_SUBMIT_REDIRECT_URL_OFFLINE = true
                    }

                    // 触发表单提交
                    $Form.trigger('submit')
                }
            },
            // 查看回收协议
            '.btn-show-zhimacredit-hs-protocol': function(e){
                e.preventDefault()

                var $me = $(this),
                    tmpl_st = $.trim($('#JsMZhimaCreditHSNotCreditProtocolTpl').html())
                if ($me.attr('data-is-credit')==1){
                    tmpl_st = $.trim($('#JsMZhimaCreditHSCreditProtocolTpl').html())
                }
                var html_fn = $.tmpl(tmpl_st ),
                    html_st = html_fn()

                SwipeSection.getSwipeSection('.swipe-section-block-long-text-help')
                SwipeSection.fillSwipeSection(html_st)
                setTimeout(function(){

                    SwipeSection.doLeftSwipeSection(0, function(){})

                }, 1)
            }
        })
    }
    // 使用优惠码
    function __usePromo ($Target) {
        var $UsePromo = $Target.find ('.use-promo-wrap')
        // 使用优惠码
        $UsePromo.forEach (function (el, i) {
            var wWrap = $ (el);
            // 使用优惠码
            tcb.usePromo ({
                'service_type' : 2,
                'product_id'   : '',
                'price'        : $ ('#ZhimacreditHsPrice').attr ('data-price'),
                'request_params': {
                    assess_key: tcb.queryUrl(window.location.search, 'assess_key')
                },
                'wWrap'        : wWrap,
                'succ'         : function (youhuiPrice, min_sale_price, wWrap) {
                    wWrap.find ('.promoYZ').html ('增值码有效，卖出可多收' + youhuiPrice + '元').removeClass ('promo-fail').addClass ('promo-succ');
                },
                'fail'         : function (wWrap) {}
            })
        })
    }

    function __setYoujiPickupType(){
        var pickerData = []
        if (window.__SUPPORT_CODE != '4') {
            pickerData.push ({
                id   : '1',
                name : '顺丰上门取件'
            })
        }
        pickerData.push ({
            id   : '2',
            name : '自行邮寄'
        })
        Bang.Picker({
            flagAutoInit     : true,
            selectorTrigger  : '.js-trigger-select-pickup-type',
            col: 1,
            data: [pickerData],
            dataPos: [0],

            // 回调函数(确认/取消)
            callbackConfirm : function(inst){
                var data = inst.options.data || [],
                    dataPos = inst.options.dataPos || [],
                    selectedData = data[ 0 ][ dataPos[ 0 ] ]

                window.__IS_SELECTED_SF_PICKUP = selectedData.id=='1' ? true : false

                inst.__Trigger.html(selectedData.name)
            },
            callbackCancel  : null
        })
    }

    function __setShangmenServiceTime(){
        // 选择服务时间
        var $server_time = $('[name="server_time"]')

        return new $.datetime ($server_time, {
            remote  : tcb.setUrl2('/aj/doGetValidDateByRecovery'),
            noStyle : true,
            onSelect : function(val){
                //$server_time.closest('.arrow-right').removeClass('arrow-right')
            }
        })
    }

    // 设置 上门 服务信息
    function __setShangmenServiceTypeInfo (datas) {
        // 设置上门范围区域
        var $ShangMenArea = $ ('#OrderShangMenArea')
        if ($ShangMenArea && $ShangMenArea.length) {
            var area = __getCityShangmenArea (datas[ 'city_name' ]),
                $row = $ShangMenArea.closest('.row')
            if (area) {
                $ShangMenArea.html (datas[ 'city_name' ] + '&nbsp;' + area)
                $row.show()
            } else {
                $ShangMenArea.html (datas[ 'city_name' ])
                $row.hide()
            }
        }
    }
    // 获取城市上门地区
    function __getCityShangmenArea (city_name) {
        var ret = '',
            shangmen_city_area = window.__ShangMenCityArea || []

        for (var i = 0; i < shangmen_city_area.length; i++) {
            if (shangmen_city_area[ i ][ 'city' ] == city_name) {
                ret = shangmen_city_area[ i ][ 'tip' ]
            }
        }

        return ret
    }

    // 设置当前城市可用服务
    function __setValidServiceType (huodong_show, show_offline) {
        var $ServiceType = $ ('.block-zhimacredit-service-type-nav a'),
            $blockZhimacreditService = $('.block-zhimacredit-service')

        $ServiceType.each (function () {
            var $me = $ (this),
                type = parseInt ($me.attr ('data-type'), 10)

            // type值为5表示扫码回收，不处理
            if (type!=5){

                if (tcb.inArray (type, huodong_show) > -1) {
                    if (type == 1 && !show_offline) {
                        $me.hide ()
                        $blockZhimacreditService.filter(function(){
                            return $(this).attr('data-attr')==type
                        }).hide()
                    } else {
                        $me.show ()
                        $blockZhimacreditService.filter(function(){
                            return $(this).attr('data-attr')==type
                        }).show()
                    }
                } else {
                    $me.hide ()
                    $blockZhimacreditService.filter(function(){
                        return $(this).attr('data-attr')==type
                    }).hide()
                }
            }

        })
        $ServiceType.removeClass('selected').filter(function(){
            return !!$(this).height()
        }).eq(0).addClass('selected')
    }

    function __setServiceType(){
        var params = {
            city_name : window.__CITY_NAME || '北京',
            assess_price : $ ('#ZhimacreditHsPrice').attr ('data-price')
        }
        // 获取服务方式信息
        // 并根据获取到的信息，设置支持的服务方式
        o.data.getServiceType (params, function (data, errno) {
            if (errno) {return}

            var huodong_show = data[ 'huodong_show' ], // 支持的服务方式
                show_offline = data[ 'show_offline' ]  // 是否支持上门服务（作为支持服务方式的补充判断条件）

            // 设置 上门 服务信息
            __setShangmenServiceTypeInfo ({
                'city_name' : params.city_name
            })

            // 设置可用服务方式
            __setValidServiceType (huodong_show, show_offline)

            __setYoujiPickupType()
            __setShangmenServiceTime()
        })
    }

    function __init($Target){

        __setServiceType()

    }

} (this)



