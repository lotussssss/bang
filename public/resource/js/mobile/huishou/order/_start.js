!function (global) {
    // 非下单页,直接返回不做任何处理
    if (window.__PAGE !== 'order') {

        return
    }

    var
        Root = tcb.getRoot(),
        o = Root.Order

    // 初始化评估页面
    // DOM READY at callback
    o.init({
        // 前置处理
        before: function () {
            o.data.url_query = tcb.queryUrl(window.location.search) || {}
            if (o.data.url_query['_global_data']) {
                try {
                    o.data.url_query['_global_data'] = $.parseJSON(tcb.html_decode(o.data.url_query['_global_data']))
                } catch (ex) {
                    o.data.url_query['_global_data'] = {}
                }
            }
        },
        // DOM READY之后
        after: function () {
            __setViewLayout()

            // 初始化页面滚动功能
            __initPageScroll()

            if (window.__IS_IN_FUWUDAO) {
                // 服务岛内
                // 输出评估报告
                return o.render({
                    data: {
                        assess_key: o.data.url_query['assess_key']
                    },
                    render: 'assessReport',
                    target: $('.main-inner-fuwudao'),
                    complete: function () {
                        // 重置滚动高度
                        o.interact.resizeScrollInnerHeight()
                    }
                })
            } else if (o.data.url_query['_global_data'] && o.data.url_query['_global_data']['view_assess_price'] && !window.__IS_LOW_RISK_PRICE) {
                // 价格预览模式

                var gold_order_html = !!window.__IS_GOLD_ENGINEER ? '<div class="row">' +
                    '<div class="col-12-1 iconfont icon-qian" style="color: #f84;"></div>' +
                    '<div class="col-12-9">预估经验值</div>' +
                    '<div class="col-12-2" style="text-align: right;">' + window.__GOLD_ORDER_ADD_PRICE + '</div>' +
                    '</div>' : ''

                $('.block-btn').hide()
                // if(window.__IS_XXG_IN_SUNING == '0'){

                $('.page-order_submit').html(gold_order_html +
                    '<div style="font-size: .16rem;text-align: center;line-height: 4;">' +
                    '如果用户同意报价，请点击“去回收”下单' +
                    '<a class="btn btn-yellow" style="margin:0 auto;display:block;width: .8rem;height: .3rem;line-height: .3rem;font-size: .12rem;color: #fff;" href="' + tcb.setUrl2('/m/hsModeHub', {}, ['_global_data']) + '" data-url-except="_global_data">去回收</a></div>')

                // }else{

                //     $('.page-order_submit').html(gold_order_html+
                //         '<div style="font-size: .16rem;text-align: center;line-height: 4;">' +
                //         '如果用户同意报价，请点击“去回收”下单' +
                //         '<a class="btn btn-yellow" style="margin:0 auto;display:block;width: .8rem;height: .3rem;line-height: .3rem;font-size: .12rem;color: #fff;" href="'+tcb.setUrl2('/m/hsModeHub', {}, ['_global_data'])+'" data-url-except="_global_data">去回收</a></div>' +
                //         '<div class="hxbt_wrap" style=" padding: .2rem .3rem;\n' +
                //         '    width: 85%;transform: translateY(.8rem);\n' +
                //         '    height: 2.5rem;\n' +
                //         '    background-color: #fff;\n' +
                //         '    border-radius: .2rem;\n' +
                //         '    margin: 0 auto;\n' +
                //         '    display: flex;\n' +
                //         '    flex-direction: column;\n' +
                //         '    align-items: center;">\n' +
                //         '            <div class="hxbt_title" style="font-size: .13rem;\n' +
                //         '    font-weight: bold;">用户扫码领取购新补贴券</div>\n' +
                //         '            <div class="hxbt_img" style="background-image: url(\'https://p4.ssl.qhimg.com/t01005f94b1e4e0bf88.png\');\n' +
                //         '    background-repeat: no-repeat;\n' +
                //         '    background-size: contain ;\n' +
                //         '    width: 80%;\n' +
                //         '    height: 1.5rem;\n' +
                //         '    display: flex;\n' +
                //         '    align-items: center;\n' +
                //         '    justify-content: center;\n' +
                //         '    background-position:center;\n' +
                //         '    margin: .2rem 0;"></div>\n' )
                // }

                return o.interact.resizeScrollInnerHeight()
            } else if (o.data.url_query['partner_flag'] == 'suning_spread'
                && o.data.url_query['suning_spread_display'] != 'normal') {
                // 苏宁推广 && 非正常显示

                __renderSuningSpread()
            } else if (o.data.url_query['self_enterprise'] === 'suning_store_share') {
                // 蘇寧雲店推廣
                $('.block-btn').hide()
                $('.page-order_submit').html('<div class="block-suning-store-share"><div class="suning-store-share-img"></div>请联系苏宁小店店员回收</div>')
            } else if (window.__IS_ZHEJIANG_YIDONG_MINIAPP) {
                // 浙江移动小程序
                $('.page-order_submit').hide()
            } else if (window.__IS_CHAOQIANG_STORE) {
                // cps-四川超强
                $('.block-btn').hide()
                $('.page-order_submit').html('<div class="block-chaoqiang-store-info">以上价格为预估价，具体测评请到星睿星耀门店进行！' +
                    '<br><br>' +
                    '现在参加以旧换新，还有高额购机补贴等着您！' +
                    '<br><br>' +
                    '详情咨询门店，公众号回复“门店”查看与您最近的门店。</div>')
            } else if (o.data.url_query['detect_key']) {
                // 有检测报告

                // 输出检测报告
                o.render({
                    data: {
                        detect_key: o.data.url_query['detect_key'],
                        assess_key: o.data.url_query['assess_key']
                    },
                    render: 'assessDetectReport',
                    complete: function () {

                        // 输出回收下单表单，
                        // 并且做一些输出后的后续处理
                        __renderOrderSubmit()

                        //$('#Main .main-inner').append('<div style="width: 100%;height: 2.3552rem;background: transparent url(//p.ssl.qhimg.com/t01244cf173ecf5e82a.png) no-repeat center/contain;"></div>')
                    }
                })
            } else if (window.__IS_GOLD_ORDER && window.__GOLD_ENGINEER_RE_PAY_URL) {
                // 是否金牌订单 && 金牌修修哥重新付款链接
                $('.block-btn').hide()
                var html_st = '<div class="block-gold-engineer-cant-create-order-tips">\n' +
                    '                <i class="iconfont icon-gantanhao icon-style"></i>\n' +
                    '                <div class="title">暂时无法创建金牌订单</div>\n' +
                    '                <div class="content">您还有系统垫付的金牌订单未还款，还款后可继续。</div>\n' +
                    '                <div class="content">\n' +
                    '                    <a href="' + window.__GOLD_ENGINEER_RE_PAY_URL + '" class="btn btn-submit">去还款</a>\n' +
                    '                </div>\n' +
                    '            </div>'
                $('.page-order_submit').html(html_st)
            } else {
                // 无检测报告

                // 输出回收下单表单，
                // 并且做一些输出后的后续处理
                __renderOrderSubmit()
            }

            if (window.__HDID) {
                // 以旧换新

                o.handle.initChangeNewProduct()
            }

            if (window.__IS_GOLD_ORDER) {
                __setupGoldOrderStaffs()
            }
        }
    })

    // 初始化页面滚动功能
    function __initPageScroll() {
        var
            $Container = o.getContainer(),
            $Inner = o.$Inner,
            innerOffset = $Inner.offset(),

            // 滚动位置
            // 根据滚动位置设定新的内容虚拟高度(限定滚动的最大位置)
            inner_height = Math.max($Container.height(), innerOffset['height'])

        o.scroll.init($Container, {
            scrollingX: true,
            bouncing: false
        })
        o.scroll.setInner($Inner)
        o.scroll.setRunning(__defaultAnimate)
        o.scroll.setDimensions(0, 0, 0, inner_height)
    }

    // 输出回收下单表单，
    // 并且做一些输出后的后续处理
    function __renderOrderSubmit() {
        var render_name = 'orderSubmit'
        if (o.data.url_query['whereami'] == 'partner_detect') {
            render_name = 'detectPartnerOrderSubmit'
        }
        if (tcb.supportSessionStorage()) {
            var isPassiveness = sessionStorage.getItem('SUNING_YUNDIAN_MINIAPP_PASSIVENESS')
            if (isPassiveness) {
                render_name = 'suningYundianMiniQRCode'
                $('.block-btn').hide()
            }
        }

        // 输出下单表单
        o.render({
            data: {},
            render: render_name,
            complete: function () {
                if (render_name == 'orderSubmit') {
                    var citySelectInst = o.event.citySelectInst
                    var $cityTrigger = citySelectInst.getTrigger()
                    if ($cityTrigger && $cityTrigger.length) {
                        // 有城市选择触发器，目前表示非补单订单，
                        // 触发选中指定城市的操作

                        // 设置确认选中的回调函数
                        citySelectInst.options.callback_confirm = __addressSelectConfirmCallback
                        // 没有自动初始化
                        if (!citySelectInst.options.flagAutoInit) {
                            // 设置下初始化后的回调
                            citySelectInst.options.callback_init = __addressSelectInitCallback
                            citySelectInst.init()
                        } else {
                            __triggerAddressSelectDone($cityTrigger)
                        }
                    } else {
                        // 没有城市选择器，表示为补单

                        __handleDaoDianBuDan()
                    }
                } else {
                    // 重置滚动高度
                    o.interact.resizeScrollInnerHeight()
                }
            }
        })
    }

    // 地址选择--初始化完成回调
    function __addressSelectInitCallback(region, $trigger) {
        $trigger.find('.city-name')
                .attr('data-province', region.province)
                .attr('data-province-code', region.provinceCode)
                .attr('data-city', region.city)
                .attr('data-city-code', region.cityCode)
                .attr('data-area', region.area)
                .attr('data-area-code', region.areaCode)
                .html([region.province, region.city, region.area].join(' '))
        __triggerAddressSelectDone($trigger, region)
    }

    // 地址选择--确认选择回调
    function __addressSelectConfirmCallback(region, $trigger, force) {
        region = region || {}
        // 包含 cityCode 表示为新的省市区县选择，
        // 那么精确到区县，否则只精确到城市
        if (region['cityCode']) {
            // 区县切换没有任何变化，那么不做任何处理
            if (!force && $trigger.attr('data-area') === region['area']) {
                return
            }
            window.__Province['name'] = region['province']
            window.__Province['code'] = region['provinceCode']
            window.__City['name'] = region['city']
            window.__City['code'] = region['cityCode']
            window.__Area['name'] = region['area']
            window.__Area['code'] = region['areaCode']
        } else {
            // 城市切换没有任何变化，那么不做任何处理
            if (!force && $trigger.attr('data-city') === region['city']) {
                return
            }
            window.__Province['id'] = region['province_id']
            window.__Province['name'] = region['province']
            window.__City['id'] = region['city_id']
            window.__City['name'] = region['city']
        }

        o.handle.citySelectDone($trigger, region, function () {
            var $BlockYouji = $('.block-order-youji'),
                $payMethodItem = $BlockYouji.find('.payout-method-item') || [] // 获取当前的付款方式的数组,不存在默认为空数组

            if (window.__IS_SUNING_YUNDIAN_MINIAPP) {
                // 苏宁云店小程序
                __expandDefaultOrderServer()

            } else if (window.__IS_PARTNER_FENGXIU) {
                // 丰修
                // if (window.__IS_PARTNER_FENGXIU_FENGXIU) {
                //     //丰修（支持上门加邮寄）
                //     var $ShangMenRowHSStyleCheck = $('.block-order-shangmen .row-hs-style-check')
                //     var $adderssTips = $('#OrderShangMen')
                //     if (region['city'].indexOf('北京') === 0) {
                //         window.__TPL_TYPE_DATA['order_server_type_default'] = 1
                //         $ShangMenRowHSStyleCheck
                //             .attr('data-no-click', '0')
                //             .attr('data-no-click-text', '')
                //         $adderssTips.html('限北京东城/西城/朝阳/海淀/通州区')
                //     } else {
                //         window.__TPL_TYPE_DATA['order_server_type_default'] = 3
                //         $ShangMenRowHSStyleCheck
                //             .attr('data-no-click', '1')
                //             .attr('data-no-click-text', '当前城市尚未开通上门回收')
                //         $adderssTips.html('当前城市尚未开通')
                //     }
                // }
                if (window.__IS_SUPPORT_SHANGMEN) {
                    var $adderssTips = $('#OrderShangMenArea')
                    $adderssTips
                        .show()
                        .attr('data-no-alert', 1)
                        .css({
                            'text-decoration': 'none'
                        })
                        .html('现场验机 现场付款')
                }
                __expandDefaultOrderServer()

            } else if (window.__IS_PARTNER_LIDIANHUISHOU) {
                // 离店回收
                var $ShangMenRowHSStyleCheck = $('.block-order-shangmen .row-hs-style-check')
                var $adderssTips = $('#OrderShangMenArea')
                if (window.__IS_SUPPORT_SHANGMEN) {
                    window.__TPL_TYPE_DATA['order_server_type_default'] = 1
                    $ShangMenRowHSStyleCheck
                        .attr('data-no-click', '0')
                        .attr('data-no-click-text', '')
                } else {
                    window.__TPL_TYPE_DATA['order_server_type_default'] = 3
                    $ShangMenRowHSStyleCheck
                        .attr('data-no-click', '1')
                        .attr('data-no-click-text', '当前城市尚未开通上门回收')
                    $adderssTips
                        .show()
                        .html('当前城市尚未开通')
                }
                __expandDefaultOrderServer()

            } else if (window.__is_wechat_pay_default && $BlockYouji && $BlockYouji.length) {
                // window.__is_wechat_pay_default为true，
                // 那么默认选中邮寄回收，并且收款方式定位在微信收款

                $BlockYouji.find('.row-hs-style-check').trigger('click')
                $BlockYouji.find('.payout-method-wechat').trigger('click')

                setTimeout(function () {
                    __refreshSeCode()
                }, 3000)

            } else if (window.__is_sn_pay_default && $BlockYouji && $BlockYouji.length) {
                // 苏宁小店回收
                // window.__is_sn_pay_default为true，

                // 那么默认选中邮寄回收，并且收款方式定位在苏宁收款
                $BlockYouji.find('.row-hs-style-check').trigger('click')
                $BlockYouji.find('.payout-method-snpay').trigger('click')

                setTimeout(function () {
                    __refreshSeCode()
                }, 3000)

            } else if ($payMethodItem.length === 1 && $BlockYouji && $BlockYouji.length) {
                // 这一步进行一个默认判断,如果只存在一个付款方式,则默认展开,并进行选中
                $BlockYouji.find('.row-hs-style-check').trigger('click')
                $BlockYouji.find('.payout-method-item').trigger('click')

                setTimeout(function () {
                    __refreshSeCode()
                }, 3000)

            } else {
                __expandDefaultOrderServer()
            }
        })
    }

    // 地址选择--确认选择完成
    function __triggerAddressSelectDone($cityTrigger, region) {
        if (!region) {
            var province = $cityTrigger.attr('data-province'),
                city = $cityTrigger.attr('data-city'),
                province_id = $cityTrigger.attr('data-province-id'),
                city_id = $cityTrigger.attr('data-city-id'),
                region = {
                    province: province,
                    city: city,
                    province_id: province_id,
                    city_id: city_id
                }
        }
        __addressSelectConfirmCallback(region, $cityTrigger, true)
    }

    // 展开默认选中的订单服务方式
    function __expandDefaultOrderServer() {
        // 判断是否有需要默认被选中的服务方式，如若有，那么将其选中展开
        var order_server_type_default = window.__TPL_TYPE_DATA['order_server_type_default']
        if (order_server_type_default) {
            var $BlockOrderStyle = $('.block-order-style[data-type="' + order_server_type_default + '"]'),
                $RowHSStyleCheck = $BlockOrderStyle.find('.row-hs-style-check')

            if (!($RowHSStyleCheck && $RowHSStyleCheck.length && $RowHSStyleCheck.height())) {
                return
            }
            // 设置不将回收方式选择tab滚动到顶部
            $RowHSStyleCheck.attr('data-no-scroll-to-top', '1').trigger('click')

            setTimeout(function () {
                $RowHSStyleCheck.attr('data-no-scroll-to-top', '')
            }, 1500)
            setTimeout(function () {
                if ($BlockOrderStyle.find('.vcode-img').length) {
                    __refreshSeCode()
                }
            }, 3000)
        }
    }

    // 处理到店补单相关
    function __handleDaoDianBuDan() {
        var $ServiceType = $('.block-order-style')
        $ServiceType.filter(function () {
            return $(this).attr('data-type') != '404'
        }).show()

        var $BlockBuDan = $('.block-order-daodian-budan')
        if ($BlockBuDan && $BlockBuDan.length) {
            var $RowHSStyleCheck = $BlockBuDan.find('.row-hs-style-check')
            $RowHSStyleCheck.attr('data-no-scroll-to-top', '1').trigger('click')
            setTimeout(function () {
                $RowHSStyleCheck.attr('data-no-scroll-to-top', '')
            }, 1500)

        //    门店回收加入沙漏验机功能相关逻辑
            __isNeedShaLouYanJi()
        }
    }

    function __refreshSeCode() {
        if (window.__is_secode_refreshing) {
            return
        }
        window.__is_secode_refreshing = true
        setTimeout(function () {
            $('.vcode-img')
                .attr('src', tcb.setUrl2('/secode/?rands=' + Math.random()))
            window.__is_secode_refreshing = false
        }, 1)
    }

    function __defaultAnimate(left, top, zoom, $el, setTranslateAndZoom) {

        setTranslateAndZoom($el[0], left, top, zoom)
    }

    function __setViewLayout() {
        var $BlockHeader = $('#Header'),
            $BlockMain = $('#Main')

        $BlockHeader.show()

        var header_height = $BlockHeader.height() || 0

        $BlockMain.css({
            paddingTop: header_height
        })
    }

    function __renderSuningSpread() {}

//    门店回收加入沙漏验机
    function __isNeedShaLouYanJi() {
        //    判断是否开启了沙漏验机功能
        var $Form = $('#DaoDianBudanSaleForm'),
            $imei = $Form.find('[name="imei"]').val(),
            subMitBtn = $('#BtnSubmitOrderForm')

        if(window.__FORCE_SHALOU_FLAG){
            //先将按钮变为  不可点击
            subMitBtn.attr('id','showSnModelBtn')
            var showSnModelBtn = $('#showSnModelBtn')
            showSnModelBtn.css({
                'background':'grey'
            })
            initShowSnModelBtn()
            if($imei){
                __getShaLouRePinggu($imei)
            }else{
                //    沒有imei 弹窗让用户输入  之后再调用查询接口
                $('.fill-in-the-sn-model-mask').show()
            }
        }
    }
    //查询接口
    function __getShaLouRePinggu(imei,sn) {
        //    调用查询接口
        var parameter = {}
        parameter.model_id = window.__MODEL_ID
        parameter.assess_key = o.data.url_query['assess_key']
        if(imei){
            parameter.imei= imei
        }
        if(sn){
            parameter.sn= sn
        }
        $.ajax({
            url: '/Recycle/Engineer/shalouRePinggu',
            type: 'GET',
            // 设置的是请求参数
            data: parameter,
            // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
            dataType: 'json',
            success: function (res) {

                if(res && !res.errno){
                    console.log('----请求成功----',o.data.url_query['assess_key'],res.result.assess_key)
                    var showSnModelBtn = $('#showSnModelBtn')
                    showSnModelBtn.attr('id','BtnSubmitOrderForm').css({
                        'background':'#0b7'
                    }).unbind("click");
                    $('.fill-in-the-sn-model-mask').hide()
                    var $Form = $('#DaoDianBudanSaleForm')
                    $Form.find('input[name=assess_key]').val(res.result.assess_key)
                }else{

                    if(res.errno == 1990 && imei){
                        $('.fill-in-the-sn-model-mask').show()
                        $.dialog.toast('请使用序列号查询！', 3000)
                        return
                    }else if (res.errno == 1990 && sn){
                        $.dialog.toast('请更换序列号查询！', 3000)
                        return
                    }
                    $.dialog.toast(res['errmsg'], 3000)
                }

            },
            error:function (err) {
                $.dialog.toast(err['errmsg'], 3000)
            }
        })
    }

    function __setupGoldOrderStaffs() {
        if (window.__GOLD_ORDER_TIMEOUT_AT) {
            var now_time = (new Date).getTime() + (window.__NOW_PADDING || 0)
            var end_time = Date.parse((window.__GOLD_ORDER_TIMEOUT_AT || '').replace(/-/g, '/'))
            // var end_time = now_time + 5000
            var html_st = '<div class="block-gold-order-timeout-tile grid nowrap align-center justify-center">' +
                '<div class="col shrink">请15分钟内完成订单，过期价格失效</div>' +
                '<div class="col auto"><div class="countdown-gold-order-timeout"></div></div>' +
                '</div>'
            var $html_st = $(html_st).prependTo('.block-assess_report-product')
            var $countdown = $html_st.find('.countdown-gold-order-timeout')
            console.log(end_time > now_time, end_time, now_time, $countdown)
            Bang.startCountdown(end_time, now_time, $countdown, {
                end: function () {
                    // var html_st_timeout = '<div class="block-gold-order-timeout-alert">' +
                    //     '<div class="block-gold-order-timeout-alert-title"></div>' +
                    //     '<div class="block-gold-order-timeout-alert-content"></div>' +
                    //     '<div class="block-gold-order-timeout-alert-btn"><a class="btn" href="#">我知道了</a></div></div>'
                    // tcb.showDialog(html_st_timeout, {
                    //     withClose: false,
                    //     middle: true
                    // })
                }
            })
        }
    }

    $('.fill-in-the-sn-model-btn-confirm').on('click',function (e) {
        e.preventDefault();
        var serialNumber = $('.serial-number').val().trim()
        if(!serialNumber){
            $.dialog.toast('请输入设备序列号！', 3000)
            return
        }
        __getShaLouRePinggu('',serialNumber)
    })
    $('.fill-in-the-sn-model-wrap .icon-close').on('click',function (e) {
        e.preventDefault();
        $('.fill-in-the-sn-model-mask').hide()
    })
    function initShowSnModelBtn(){
        $('#showSnModelBtn').on('click',function (e) {
            e.preventDefault();
            $('.fill-in-the-sn-model-mask').show()
        })
    }

}(this)



