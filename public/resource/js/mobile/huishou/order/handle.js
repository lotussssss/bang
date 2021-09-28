// 获取数据的接口
!function (global) {
    var Root = tcb.getRoot (),
        o = Root.Order
    var TYPE_SHANGMEN = 1
    var TYPE_DAODIAN = 2
    var TYPE_YOUJI = 3

    o.handle = o.handle || {}

    tcb.mix (o.handle, {

        citySelectDone : citySelectDone,

        setServiceType : setServiceType,
        showXxgApplyGoodPriceCompletePanel : showXxgApplyGoodPriceCompletePanel
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    // 根据城市，机器价格，[hdid]，设置可用服务方式
    function setServiceType(params, callback) {
        params = params || {}

        var city = params['city_name']
        if (params['ad_city_code']) {
            delete params['city_name']
        }
        if (!city) {
            $.dialog.toast('请先选择城市！')
            return
        }

        if (window.__HDID) {
            params['hdid'] = window.__HDID
        }

        if (window.__MODEL_ID) {
            params['model_id'] = window.__MODEL_ID
        }

        // 获取服务方式信息
        // 并根据获取到的信息，设置支持的服务方式
        o.data.getServiceType(params, function (data) {
            var daodian_shop_list = data['daodian'], // 到店店铺信息
                tel = data['def_post_info']['tel']//res['result']['tel'];

            //上门是否展示支付方式
            window.M_SHOW_OFFLINE_PAYOUT = data['show_offline_payout']

            window.__IS_SUPPORT_SHANGMEN = false
            var serviceTypesAble = [] // 可用的回收方式
            var serviceTypesShow = [] // 显示出来的回收方式
            var serviceTypesDisabled = [] // 禁止使用的回收方式
            tcb.each(data['huodong_show'] || [], function (i, type) {
                if (type === TYPE_SHANGMEN) {
                    if (data['show_offline']) {
                        window.__IS_SUPPORT_SHANGMEN = true
                        serviceTypesAble.push(type)
                        serviceTypesShow.push(type)
                    }
                } else {
                    serviceTypesAble.push(type)
                    serviceTypesShow.push(type)
                }
            })

            if (window.__IS_PARTNER_FENGXIU) {
                // 丰修

                // 上门不再显示支付方式
                // window.M_SHOW_OFFLINE_PAYOUT = false
                if (tcb.inArray(TYPE_SHANGMEN, serviceTypesShow) === -1) {
                    serviceTypesShow.push(TYPE_SHANGMEN)
                    serviceTypesDisabled.push(TYPE_SHANGMEN)
                    window.__TPL_TYPE_DATA['order_server_type_default'] = TYPE_YOUJI
                } else {
                    window.__TPL_TYPE_DATA['order_server_type_default'] = TYPE_SHANGMEN
                }
            } else if (window.__IS_PARTNER_LIDIANHUISHOU) {
                //离店回收

                // window.M_SHOW_OFFLINE_PAYOUT = false
                if (tcb.inArray(TYPE_SHANGMEN, serviceTypesShow) === -1) {
                    serviceTypesShow.push(TYPE_SHANGMEN)
                    serviceTypesDisabled.push(TYPE_SHANGMEN)
                    window.__TPL_TYPE_DATA['order_server_type_default'] = TYPE_YOUJI
                } else {
                    window.__TPL_TYPE_DATA['order_server_type_default'] = TYPE_SHANGMEN
                }
            }

            //上门是否展示支付方式
            if (window.M_SHOW_OFFLINE_PAYOUT) {
                $('.m-show-offline-payout').show()
                $('.block-common-info').css('padding-top', '0')
            } else {
                $('.m-show-offline-payout').hide()
                $('.block-common-info').css('padding-top', '0.08rem')
            }

            // 设置 上门 服务信息
            __setShangmenServiceTypeInfo({
                'city_name': city,
                'tel': tel
            }, tcb.inArray(TYPE_SHANGMEN, serviceTypesDisabled) !== -1)
            // 设置 邮寄 服务信息
            __setYoujiServiceTypeInfo({
                'tel': tel
            })
            // 设置 到店 服务信息
            __setDaodianServiceTypeInfo({
                'shop_list': daodian_shop_list
            })

            // 判断默认选中的服务方式是否在Disabled里边，
            // 若在里边，那么就可用的回收方式第一个作为默认显示
            if (window.__TPL_TYPE_DATA['order_server_type_default'] &&
                tcb.inArray(window.__TPL_TYPE_DATA['order_server_type_default'], serviceTypesDisabled) !== -1) {
                window.__TPL_TYPE_DATA['order_server_type_default'] = serviceTypesAble[0]
            }

            // 设置可用服务方式
            __setValidServiceType(serviceTypesShow, serviceTypesDisabled)

            // 重置滚动高度
            o.interact.resizeScrollInnerHeight()

            typeof callback === 'function' && callback()
        })
    }

    /**
     * 完成选择城市
     * @param $trigger 选择城市触发器
     * @param region   选中的省、市、省id、市id
     * @param callback 选择成功后的回调
     */
    function citySelectDone ($trigger, region, callback) {
        region = region || {}
        if (region['provinceCode']) {
            __citySelectDone2($trigger, region, callback)
        } else {
            __citySelectDone1($trigger, region, callback)
        }
    }

    function __citySelectDone1($trigger, region, callback) {
        var city = region['city'] || '',
            city_id = region['city_id'] || '',
            province = region['province'] || '',
            province_id = region['province_id'] || ''

        $trigger
            .attr('data-city', city)
            .attr('data-city-id', city_id)
            .attr('data-province', province)
            .attr('data-province-id', province_id)
            .find('.city-name').html(city)

        $('[name="city_name"]').val(city)
        $('.row-hs-style-checked').removeClass('row-hs-style-checked')
                                  .find('.icon-circle')
                                  .addClass('b-radius-circle')
                                  .removeClass('icon-zhifuchenggong')
        $('.block-order-form').hide()

        var params = {
            city_name: city,
            assess_price: $('#AssessedModelPrice').attr('data-price')
        }
        // 切换城市，设置服务方式
        setServiceType(params, callback)
    }

    function __citySelectDone2($trigger, region, callback) {
        var province = region['province'] || '',
            provinceCode = region['provinceCode'] || '',
            city = region['city'] || '',
            cityCode = region['cityCode'] || '',
            area = region['area'] || '',
            areaCode = region['areaCode'] || ''

        $trigger
            .attr('data-province', province)
            .attr('data-province-code', provinceCode)
            .attr('data-city', city)
            .attr('data-city-code', cityCode)
            .attr('data-area', area)
            .attr('data-area-code', areaCode)
            .find('.city-name').html([province, city, area].join(' '))

        $('[name="city_name"]').val(city)
        $('.row-hs-style-checked').removeClass('row-hs-style-checked')
                                  .find('.icon-circle')
                                  .addClass('b-radius-circle')
                                  .removeClass('icon-zhifuchenggong')
        $('.block-order-form').hide()

        var params = {
            ad_province_code: provinceCode,
            ad_city_code: cityCode,
            ad_area_code: areaCode,
            city_name: city,
            assess_price: $('#AssessedModelPrice').attr('data-price')
        }
        // 切换城市，设置服务方式
        setServiceType(params, callback)
    }

    function showXxgApplyGoodPriceCompletePanel(data){
        var html_fn = $.tmpl($.trim($('#JsMXxgApplyGoodPriceCompleteTpl').html())),
            html_st = html_fn()
        tcb.showDialog(html_st, {
            middle: true,
            withClose: false,
            className : 'xxg-apply-good-price-complete-dialog'
        })

        var delay = Math.random() * 25
        if (delay<5){
            delay += Math.random() * 5
        }
        setTimeout(function(){
            showXxgApplyGoodPriceCheckedResultPanel(data)
        }, delay*1000)
    }

    function showXxgApplyGoodPriceCheckedResultPanel(data){
        tcb.closeDialog()

        var html_fn = $.tmpl($.trim($('#JsMXxgApplyGoodPriceCheckedResultTpl').html())),
            html_st = html_fn({
                target_price_remote: data.target_price_remote,
                target_price: data.target_price,
                assess_price: data.assess_price,
                url: tcb.setUrl2('/m/hsModeHub', {}, ['_global_data'])
            })
        var dialogInst = tcb.showDialog(html_st, {
            middle: true,
            withClose: false,
            className : 'xxg-apply-good-price-checked-result-dialog'
        })

        dialogInst.wrap.find('.btn').on('click', function (e) {
            e.preventDefault()

            tcb.closeDialog()
        })
    }

    // =================================================================
    // 私有接口 private
    // =================================================================


    // 设置 到店 服务信息
    function __setDaodianServiceTypeInfo (data) {
        var shop_list = data[ 'shop_list' ] || []

        // 更新到店地址列表
        window.__DaoDianShopList = shop_list
    }

    // 设置 上门 服务信息
    function __setShangmenServiceTypeInfo(data, disabled) {
        // 设置上门范围区域
        var $ShangMenArea = $('#OrderShangMenArea')
        if ($ShangMenArea && $ShangMenArea.length) {
            if (disabled) {
                return $ShangMenArea.show().html('当前地区尚未开通')
            }

            var area = __getCityShangmenArea(data['city_name'])

            if (area) {
                $ShangMenArea.show().html(
                    /*data['city_name'].indexOf('北京') > -1
                        ? '限北京东城/西城/朝阳/海淀/通州区'
                        : */data['city_name'] + '&nbsp;' + area
                )
            } else {
                $ShangMenArea.hide().html(data['city_name'])
            }
            if (window.__IS_PARTNER_FENGXIU) {
                // 特别处理，丰修下不显示上门区域
                $ShangMenArea.hide()
            }
        }
    }

    // 设置 邮寄 服务信息
    function __setYoujiServiceTypeInfo (data) {
        // 貌似没啥要做的，就先这样放着吧
    }

    // 设置当前城市可用服务
    function __setValidServiceType (serviceTypesShow, serviceTypesDisabled) {
        var $ServiceTypes = $ ('.block-order-style'),
            $BlockTitle = $ServiceTypes.closest('.block-order').find('.block-tit')

        if (!serviceTypesShow || !serviceTypesShow.length) {
            serviceTypesShow = [404]
            $BlockTitle.hide()
            $('.block-btn').hide()
        }
        if (serviceTypesShow && serviceTypesShow[0] !== 404) {
            $BlockTitle.show()
            $('.block-btn').show()
        }

        var disabledTexts = {}
        disabledTexts[TYPE_SHANGMEN] = '当前城市尚未开通上门回收'
        disabledTexts[TYPE_DAODIAN] = '当前城市尚未开通到店回收'
        disabledTexts[TYPE_YOUJI] = '当前城市尚未开通邮寄回收'

        $ServiceTypes.each(function () {
            var $me = $(this),
                type = parseInt($me.attr('data-type'), 10),
                $rowCheck = $me.find('.row-hs-style-check')

            // type值为5表示扫码回收，不处理
            if (type != 5) {
                if (tcb.inArray(type, serviceTypesDisabled) === -1) {
                    $rowCheck
                        .attr('data-no-click', '')
                        .attr('data-no-click-text', '')
                } else {
                    $rowCheck
                        .attr('data-no-click', '1')
                        .attr('data-no-click-text', disabledTexts[type])
                }

                if (type == 2) {
                    $me.find('[name="shop_id"]').val('')
                    $me.find('.daodian-addr-select-trigger').addClass('default').html('选择门店')
                    $me.find('#DaodianFare').html('')
                    $me.find('#DaodianAddrTips').html('')
                }

                if (tcb.inArray(type, serviceTypesShow) > -1) {
                    $me.show()
                } else {
                    $me.hide()
                }
            }
        })
    }

    // 获取城市上门地区
    function __getCityShangmenArea(city_name) {
        var ret = '',
            shangmen_city_area = window.__ShangMenCityArea || []

        for (var i = 0; i < shangmen_city_area.length; i++) {
            if (city_name.indexOf(shangmen_city_area[i]['city']) > -1) {
                ret = shangmen_city_area[i]['tip']
            }
        }

        return ret
    }



} (this)
