;
(function () {
    var Bang
        = window.Bang
        = window.Bang || {}

    var defaults = {
            className: '',
            // 根据省一次性获取所有的城市和区县信息
            //flagGetAll       : false,
            // 实例化的时候自动执行init函数
            flagAutoInit: true,
            flagStorage: true,
            // 触发器
            selectorTrigger: '.province-city-area',
            // 省、市、区县的选择器
            selectorProvince: '[name="receiver_province_id"]',
            selectorCity: '[name="receiver_city_id"]',
            selectorArea: '[name="receiver_area_id"]',

            url_province: '/api/BasicServer/AdministrativeDivisions/province',
            url_city_area: '/aj/doGetProvinceLinkage',
            url_city: '/api/BasicServer/AdministrativeDivisions/city',
            url_area: '/api/BasicServer/AdministrativeDivisions/area',

            // 默认的省、市、区县
            province: '',
            city: '',
            area: '',
            provinceCode: '',
            cityCode: '',
            areaCode: '',

            // 是否显示城市\区县
            show_city: true,
            show_area: true,
            // 默认输出选择的省市区县
            not_render: false,
            // 初始化后的回调函数
            callback_init: null,
            // 显示时
            callback_on_show: null,
            // 回调函数(确认/取消)
            callback_confirm: null,
            callback_cancel: null
        },
        // cache省列表
        CacheProvinceList = [],
        // cache市列表
        CacheCityList = {},
        // cache区县列表
        CacheAreaList = {},

        selected_province = null,
        selected_city = null,
        selected_area = null,
        isSupportLocalStorage = tcb.supportLocalStorage(),
        isSupportJSON = (typeof JSON != 'undefined') && (typeof JSON.stringify == 'function') && (typeof JSON.parse == 'function') ? true : false

    function AddressSelect2(options) {
        var me = this

        options = $.extend({}, defaults, options)

        me.options = options

        if (!me.options.flagStorage) {
            me.CacheProvinceList = []
            me.CacheCityList = {}
            me.CacheAreaList = {}
        }

        if (me.options.flagAutoInit) {

            me.init()
        }
    }

    // 设置原型方法
    AddressSelect2.prototype = {

        constructor: AddressSelect2,

        getWrap: getWrap,

        getTrigger: getTrigger,
        getProvinceSelect: getProvinceSelect,
        getCitySelect: getCitySelect,
        getAreaSelect: getAreaSelect,

        setProvinceHtml: setProvinceHtml,
        setCityHtml: setCityHtml,
        setAreaHtml: setAreaHtml,

        getProvinceList: getProvinceList,
        getCityList: getCityList,
        getAreaList: getAreaList,
        getProvinceCityAreaListByName: getProvinceCityAreaListByName,

        bindEvent: bindEvent,
        bindMoveEvent: bindMoveEvent,

        setSelect: setSelect,
        setConfirmSelectedData: setConfirmSelectedData,

        doShow: doShow,
        doHide: doHide,

        initTriggerData: initTriggerData,
        init: init
    }

    // 获取触发器
    function getTrigger() {
        var
            me = this,
            selectorTrigger = me.options.selectorTrigger

        return $(selectorTrigger)
    }

    // 获取省选择器
    function getProvinceSelect() {
        var
            me = this,
            selectorProvince = me.options.selectorProvince

        return $(selectorProvince)
    }

    // 获取城市选择器
    function getCitySelect() {
        var
            me = this,
            selectorCity = me.options.selectorCity

        return $(selectorCity)
    }

    // 获取地区选择器
    function getAreaSelect() {
        var
            me = this,
            selectorArea = me.options.selectorArea

        return $(selectorArea)
    }

    // 设置确认选中的数据
    function setConfirmSelectedData(region) {
        var me = this,
            // 获取选择器
            $trigger = me.getTrigger(),
            $province = me.getProvinceSelect(),
            $city = me.getCitySelect(),
            $area = me.getAreaSelect(),
            str = ''

        me.options.province = region.province
        me.options.provinceCode = region.provinceCode
        me.options.city = region.city
        me.options.cityCode = region.cityCode
        me.options.area = region.area
        me.options.areaCode = region.areaCode

        // 设置省
        $province.val(region.provinceCode)
        str += '<span class="i-shipping-province">' + region.province + '</span>'

        // 设置城市
        $city.val(region.cityCode)
        str += ' <span class="i-shipping-city">' + region.city + '</span>'

        // 设置区县
        $area.val(region.areaCode)
        str += ' <span class="i-shipping-area">' + region.area + '</span>'

        if (!me.options.not_render) {
            $trigger.removeClass('default').html(str)
        }
    }

    // 获取省份列表
    function getProvinceList(callback) {
        var me = this
        var options = me.options
        var url_province = options.url_province
        var province_list = __getProvinceListByCache(me)

        if (province_list && province_list.length) {
            $.isFunction(callback) && callback()
        } else {
            if (isLoading('KEY_GLOBAL_LOADING_PROVINCE')) {
                return
            }
            setLoading(true, 'KEY_GLOBAL_LOADING_PROVINCE')

            $.ajax({
                url: tcb.setUrl2(url_province),
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    if (!res['errCode']) {
                        var data = res['data']
                        if (!tcb.isArray(data)) {
                            var _data = []
                            tcb.each(data, function (code, name) {
                                _data.push({
                                    code: code,
                                    name: name
                                })
                            })
                            data = _data
                        }
                        __storeProvinceList(data, me)

                        $.isFunction(callback) && callback()
                    } else {
                        // do nothing
                    }
                },
                complete: function () {
                    setLoading(false, 'KEY_GLOBAL_LOADING_PROVINCE')
                }
            })
        }
    }

    // 获取城市列表
    function getCityList(provinceCode, callback) {
        if (!provinceCode) {
            return
        }
        var me = this
        var options = me.options
        var url_city = options.url_city
        var city_list = __getCityListByCache(provinceCode, me)
        if (city_list && city_list.length) {
            $.isFunction(callback) && callback()
        } else {
            if (isLoading('KEY_GLOBAL_LOADING_CITY')) {
                return
            }
            setLoading(true, 'KEY_GLOBAL_LOADING_CITY')

            $.ajax({
                url: tcb.setUrl2(url_city),
                type: 'GET',
                data: {
                    provinceCode: provinceCode
                },
                dataType: 'json',
                success: function (res) {
                    if (!res['errCode']) {
                        var data = res['data']
                        if (!tcb.isArray(data)) {
                            var _data = []
                            tcb.each(data, function (code, name) {
                                _data.push({
                                    code: code,
                                    name: name
                                })
                            })
                            data = _data
                        }
                        __storeCityList(provinceCode, data, me)

                        $.isFunction(callback) && callback()
                    } else {
                        // do nothing
                    }
                },
                complete: function () {
                    setLoading(false, 'KEY_GLOBAL_LOADING_CITY')
                }
            })
        }
    }

    // 获取区县列表
    function getAreaList(cityCode, callback) {
        if (!cityCode) {
            return
        }
        var me = this
        var options = me.options
        var url_area = options.url_area
        var area_list = __getAreaListByCache(cityCode, me)

        if (area_list && area_list.length) {
            $.isFunction(callback) && callback()
        } else {
            if (isLoading('KEY_GLOBAL_LOADING_AREA')) {
                return
            }
            setLoading(true, 'KEY_GLOBAL_LOADING_AREA')

            $.ajax({
                url: tcb.setUrl2(url_area),
                type: 'GET',
                data: {cityCode: cityCode},
                dataType: 'json',
                success: function (res) {
                    if (!res['errCode']) {
                        var data = res['data']
                        if (!tcb.isArray(data)) {
                            var _data = []
                            tcb.each(data, function (code, name) {
                                _data.push({
                                    code: code,
                                    name: name
                                })
                            })
                            data = _data
                        }
                        __storeAreaList(cityCode, data, me)

                        $.isFunction(callback) && callback()
                    } else {
                        // do nothing
                    }
                },
                complete: function () {
                    setLoading(false, 'KEY_GLOBAL_LOADING_AREA')
                }
            })
        }
    }

    // 根据省市区县名称获取省市区县列表
    function getProvinceCityAreaListByName(province, city, area, callback) {
        var me = this
        var options = me.options
        var region = {}
        var provinceCityArea = {}
        // 获取省份列表
        me.getProvinceList(function () {
            // 获取省份信息
            var provinceList = __getProvinceListByCache(me),
                // 根据默认省份获取不到省份id,那么将第一个省份当作默认省
                provinceCode = __getProvinceCodeByName(province, provinceList) || provinceList[0]['code']
            if (!provinceCode && provinceList && provinceList[0] && provinceList[0]['code']) {
                provinceCode = provinceList[0]['code']
                province = provinceList[0]['name']
            }
            provinceCityArea.provinceList = provinceList
            region.province = province
            region.provinceCode = provinceCode
            if (options.show_city && provinceCode) {
                // 获取城市列表
                me.getCityList(provinceCode, function () {
                    var cityList = __getCityListByCache(provinceCode, me),
                        // 默认选中的城市code
                        cityCode = __getCityCodeByName(city, cityList)

                    if (!cityCode && cityList && cityList[0] && cityList[0]['code']) {
                        cityCode = cityList[0]['code']
                        city = cityList[0]['name']
                    }
                    provinceCityArea.cityList = cityList
                    region.city = city
                    region.cityCode = cityCode

                    if (options.show_area && cityCode) {
                        // 获取区县列表
                        me.getAreaList(cityCode, function () {
                            var areaList = __getAreaListByCache(cityCode, me),
                                // 默认选中的区县id
                                areaCode = __getAreaCodeByName(area, areaList)

                            if (!areaCode && areaList && areaList[0] && areaList[0]['code']) {
                                areaCode = areaList[0]['code']
                                area = areaList[0]['name']
                            }
                            provinceCityArea.areaList = areaList
                            region.area = area
                            region.areaCode = areaCode

                            // 执行回调
                            $.isFunction(callback) && callback(region, provinceCityArea)
                        })
                    } else {
                        // 执行回调
                        $.isFunction(callback) && callback(region, provinceCityArea)
                    }
                })
            } else {
                // 执行回调
                $.isFunction(callback) && callback(region, provinceCityArea)
            }
        })
    }

    // 设置省份html
    function setProvinceHtml(data, selected_id) {
        var me = this
        var html_st = genHtml('province', data, selected_id),
            $wrap = me.getWrap(),
            $col = $wrap.find('.col').eq(0)

        $col.find('.item-list').html(html_st)

        return $col
    }

    // 设置城市html
    function setCityHtml(data, selected_id) {
        var me = this
        var html_st = genHtml('city', data, selected_id),
            $wrap = me.getWrap(),
            $col = $wrap.find('.col').eq(1)

        $col.find('.item-list').html(html_st)
        return $col
    }

    // 设置地区html
    function setAreaHtml(data, selected_id) {
        var me = this
        var html_st = genHtml('area', data, selected_id),
            $wrap = me.getWrap(),
            $col = $wrap.find('.col').eq(2)

        $col.find('.item-list').html(html_st)
        return $col
    }

    // 根据type生成省/市/区县的html
    function genHtml(type, data, selected_id) {
        data = data || []
        var type_arr = ['province', 'city', 'area'],
            type_map = {
                province: {
                    field_id: 'code',
                    field_name: 'name'
                },
                city: {
                    field_id: 'code',
                    field_name: 'name'
                },
                area: {
                    field_id: 'code',
                    field_name: 'name'
                }
            },
            html_str = []

        if ($.inArray(type, type_arr) == -1) {
            type = type_arr[0]
        }

        $.each(data, function (i, item) {
            html_str.push('<span class="i-item')
            if (selected_id === item[type_map[type]['field_id']]) {
                html_str.push(' selected')
            }
            html_str.push('" data-value="', item[type_map[type]['field_id']], '">', item[type_map[type]['field_name']], '</span>')
        })

        return html_str.join('')
    }

    // 设置选中的省市区县
    function setSelect(province, city, area, callback, options) {
        var me = this
        options = options || {}

        // 初始化获取省市区县列表数据
        me.getProvinceCityAreaListByName(province, city, area,
            function (region, provinceCityArea) {
                if (region.provinceCode && !options.not_render_province) {
                    // 设置省份html
                    var $col_province = me.setProvinceHtml(provinceCityArea.provinceList, region.provinceCode)
                    // 根据选中的item,将列表移动到选中的位置
                    setSelectTransYBySelectedItem($col_province)
                }
                if (region.cityCode && !options.not_render_city) {
                    // 城市
                    var $col_city = me.setCityHtml(provinceCityArea.cityList, region.cityCode)
                    // 根据选中的item,将列表移动到选中的位置
                    setSelectTransYBySelectedItem($col_city)
                }
                if (region.areaCode && !options.not_render_area) {
                    // 区县
                    var $col_area = me.setAreaHtml(provinceCityArea.areaList, region.areaCode)
                    // 根据选中的item,将列表移动到选中的位置
                    setSelectTransYBySelectedItem($col_area)
                }
                // 执行回调
                $.isFunction(callback) && callback(region, provinceCityArea)
            }
        )
    }

    // 根据选中的item,将列表移动到选中的位置
    function setSelectTransYBySelectedItem($col) {
        if (!($col && $col.length)) {
            return
        }
        $col.each(function (i, el) {
            var $el = $(el),
                $cover = $el.find('.item-window'),
                $selected = $el.find('.selected'),
                el_index = $selected.index(),
                d = -($selected.height() * el_index)

            _moveList($cover[0], d)
        })
    }

    // 显示
    function doShow() {
        var me = this,
            $wrap = me.getWrap(),
            options = me.options || {}

        me.options.className && $wrap.addClass(me.options.className)

        typeof options.callback_on_show === 'function' && options.callback_on_show(me)

        // 显示遮罩层
        showMask()

        $wrap.css({
            'position': 'fixed',
            'left': '0',
            'top': '100%',
            'z-index': tcb.zIndex(),
            'width': '100%'
        })//.show ();

        //如果为android4.0以下系统，由于不支持部分CSS动画，需要特别处理
        if ($.os.android && !compareVersion($.os.version, '4.0')) {
            $wrap.css({
                'top': 'auto',
                'bottom': 0
            })
            $.dialog.toast('抱歉，您的手机系统版本不支持选择', 1600)
        } else {
            $wrap.animate({'translateY': '1px'}, 10, function () {
                $wrap.hide()
                setTimeout(function () {
                    $wrap.show().animate({'translateY': 0 - $wrap.height() + 'px'}, 200, 'linear')//
                }, 30)
            })
        }

    }

    function doHide() {
        var
            me = this,
            $wrap = me.getWrap()

        $wrap.animate({'translateY': 0}, 200, 'linear', function () {

            $(this).hide()

            removeWrap()

            hideMask()
        })
    }

    // 初始化
    function init() {
        var me = this,
            options = me.options || {},
            $trigger = me.getTrigger()

        options.flagStorage && __restoreData()

        // 触发切换省、市、地区
        $trigger.on('click', function (e) {
            e.preventDefault()

            // shining
            shineClick(this)

            var default_province = me.options.province || window.city_name,
                default_city = me.options.city || '',
                default_area = me.options.area || ''

            // 设置默认选中省份城市区县
            me.setSelect(default_province, default_city, default_area, function () {

                // 绑定基本事件
                me.bindEvent()

                // 移动事件
                me.bindMoveEvent()

                // 显示
                me.doShow()
            })
        })

        me.initTriggerData(function (region) {
            $.isFunction(me.options.callback_init) && me.options.callback_init(region, $trigger)
        })
    }

    // 绑定基本事件
    function bindEvent() {
        var me = this,
            $wrap = me.getWrap()

        // 选择item
        $wrap.on('click', '.i-item', function (e) {
            e.preventDefault()

            var $me = $(this)

            $me.addClass('selected')
               .siblings('.selected').removeClass('selected')

            var $col = $me.closest('.col'),
                col_index = $col.index(),
                col_arr = ['province', 'city', 'area'],
                province, city, area,
                options = {}

            switch (col_arr[col_index]) {
                case 'province':
                    province = $me.html()
                    city = ''
                    area = ''
                    options.not_render_province = true
                    break
                case 'city':
                    province = $col.prev().find('.selected').html()
                    city = $me.html()
                    area = ''
                    options.not_render_province = true
                    options.not_render_city = true
                    break
                case 'area':
                    // do nothing
                    break
            }

            province &&
            me.setSelect(province, city, area, null, options)
        })
        // 点击控制按钮
        $wrap.on('click', '.ctrl-item', function (e) {
            e.preventDefault()

            var $me = $(this),
                action_name = $me.attr('data-action'),
                action_map = {
                    cancel: actionCancel,
                    confirm: actionConfirm
                },
                action_fn = action_map[action_name]

            if (typeof action_fn !== 'function') {
                // 没有相应的操作，直接返回不做任何处理

                return
            }

            // 执行操作
            action_fn($me)
        })

        //取消关闭
        function actionCancel($el) {
            // 关闭wrap层
            me.doHide()

            if ($.isFunction(me.options.callback_cancel)) {
                var region = {
                    province: me.options.province,
                    city: me.options.city,
                    area: me.options.area,
                    provinceCode: me.options.provinceCode,
                    cityCode: me.options.cityCode,
                    areaCode: me.options.areaCode
                }
                me.options.callback_cancel(region)
            }
        }

        //确认选择
        function actionConfirm($el) {
            var $selected = $wrap.find('.selected'),
                $selected_province = $selected.eq(0),
                $selected_city = $selected.eq(1),
                $selected_area = $selected.eq(2)
            var region = {
                province: $selected_province.html() || '',
                provinceCode: $selected_province.attr('data-value') || '',
                city: $selected_city.html() || '',
                cityCode: $selected_city.attr('data-value') || '',
                area: $selected_area.html() || '',
                areaCode: $selected_area.attr('data-value') || ''
            }

            // 设置选中数据
            me.setConfirmSelectedData(region)

            // 关闭wrap层
            me.doHide()

            if ($.isFunction(me.options.callback_confirm)) {
                me.options.callback_confirm(region, me.getTrigger())
            }
        }
    }

    Bang.AddressSelect2 = function (options) {
        return new AddressSelect2(options)
    }


    //================= private ===================

    function __restoreData() {
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage

            CacheProvinceList = JSON.parse(storage.getItem('TCB_HS_ProvinceList2') || '[]')
            CacheCityList = JSON.parse(storage.getItem('TCB_HS_CityList2') || '{}')
            CacheAreaList = JSON.parse(storage.getItem('TCB_HS_AreaList2') || '{}')
        }
    }

    // 存储省份列表
    function __storeProvinceList(ProvinceList, inst) {
        if (!(ProvinceList && ProvinceList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheProvinceList = ProvinceList
        }
        CacheProvinceList = ProvinceList
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage
            storage.setItem('TCB_HS_ProvinceList2', JSON.stringify(CacheProvinceList))
        }
        return CacheProvinceList
    }

    // 存储城市列表
    function __storeCityList(provinceCode, CityList, inst) {
        if (!(CityList && CityList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheCityList[provinceCode] = CityList
        }
        CacheCityList[provinceCode] = CityList
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage
            storage.setItem('TCB_HS_CityList2', JSON.stringify(CacheCityList))
        }

        return CacheCityList[provinceCode]
    }

    // 存储区县列表
    function __storeAreaList(cityCode, AreaList, inst) {
        if (!(AreaList && AreaList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheAreaList[cityCode] = AreaList
        }
        CacheAreaList[cityCode] = AreaList
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage
            storage.setItem('TCB_HS_AreaList2', JSON.stringify(CacheAreaList))
        }
        return CacheAreaList[cityCode]
    }

    function initTriggerData(callback) {
        var me = this
        var default_province = me.options.province || '',
            default_city = me.options.city || '',
            default_area = me.options.area || ''

        // 设置默认选中省份城市区县
        me.getProvinceCityAreaListByName(default_province, default_city, default_area,
            function (region, provinceCityArea) {/*console.log(region)*/
                // 设置选中数据
                me.setConfirmSelectedData(region)

                $.isFunction(callback) && callback(region, me.getTrigger())
            }
        )
    }

    // cache中获取省份列表
    function __getProvinceListByCache(inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheProvinceList
        }
        return CacheProvinceList
    }

    // cache中获取城市列表
    function __getCityListByCache(provinceCode, inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheCityList[provinceCode]
        }
        return CacheCityList[provinceCode]
    }

    // cache中获取区县列表
    function __getAreaListByCache(cityCode, inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheAreaList[cityCode]
        }
        return CacheAreaList[cityCode]
    }

    // 根据省份名称，获取省份code
    function __getProvinceCodeByName(province_name, province_list) {
        if (!(province_name && $.isArray(province_list))) {
            return
        }
        var provinceCode
        $.each(province_list, function (i, item) {
            if (province_name == item['name']) {
                provinceCode = item['code']

                return false
            }
        })

        return provinceCode
    }

    // 根据城市名称，获取城市code
    function __getCityCodeByName(city_name, city_list) {
        if (!(city_name && $.isArray(city_list))) {
            return
        }
        var cityCode
        $.each(city_list, function (i, item) {
            if (city_name == item['name']) {
                cityCode = item['code']

                return false
            }
        })

        return cityCode
    }

    // 根据城市名称，获取区县code
    function __getAreaCodeByName(area_name, area_list) {
        if (!(area_name && $.isArray(area_list))) {
            return
        }
        var areaCode
        $.each(area_list, function (i, item) {
            if (area_name == item['name']) {
                areaCode = item['code']

                return false
            }
        })

        return areaCode
    }

    // 获取地区选择器
    function getWrap() {
        var
            me = this,
            $wrap = $('#BottomSelectWrap')

        if (!($wrap && $wrap.length)) {

            var
                col = 3,
                tit = ['',
                    '',
                    ''],
                html_st = [],
                col_show = col

            if (!me.options.show_area) {
                // 不展示区县

                col_show = col - 1
            }
            if (!me.options.show_city) {
                // 不展示城市+区县

                col_show = col - 2
            }

            // 外框
            html_st.push('<div class="shipping-address-select-block" id="BottomSelectWrap">')

            // 主体列表
            html_st.push('<div class="dt-table dt-table-', col_show, '-col">')
            //for (var i = 0; i < col; i++) {
            for (var i = 0; i < col_show; i++) {
                html_st.push('<div class="col">') // col-', col, '-1
                html_st.push('<div class="tit">', tit[i], '</div>')

                html_st.push('<div class="item-select">',
                    '<div class="item-window">',
                    '<span class="i-w-line"></span>',
                    '<span class="i-w-line"></span>',
                    '</div>',
                    '<div class="item-list">',

                    '</div>',
                    '</div>')

                html_st.push('</div>')
            }
            html_st.push('</div>')

            // 控制行
            html_st.push('<div class="ctrl-box">',
                '<span class="ctrl-item ctrl-cancel" data-action="cancel">取消</span>',
                '<span class="ctrl-item ctrl-ok" data-action="confirm">确定</span>',
                '</div>')

            html_st.push('</div>')

            html_st = html_st.join('')

            $wrap = $(html_st).appendTo($('body'))//.hide ()
        }
        return $wrap
    }

    // 删除地区选择器
    function removeWrap() {
        var
            $wrap = $('#BottomSelectWrap')

        if ($wrap && $wrap.length) {

            $wrap.remove()
        }
    }

    function showMask() {
        var
            $mask = $('#BottomSelectWrapMask')

        if (!($mask && $mask.length)) {

            var
                mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;display: block;width: 100%;height: 100%;background:rgba(0, 0, 0, 0.2);',
                mask_html = '<a id="BottomSelectWrapMask" href="#" style="' + mask_css + '"></a>'

            $mask = $(mask_html).appendTo(document.body)

            $mask.on('click', function (e) {
                e.preventDefault()

            })
        }

        $mask.css({
            'z-index': tcb.zIndex(),
            'display': 'block'
        })
    }

    function hideMask() {
        var
            $mask = $('#BottomSelectWrapMask')

        if ($mask && $mask.length) {

            $mask.hide()
        }
    }


    // 绑定滑动事件
    function bindMoveEvent() {
        var
            me = this,
            $wrap = me.getWrap(),
            $cover = $wrap.find('.item-window')

        //touch start
        $cover.on('touchstart', function (e) {
            e.preventDefault()

            var
                $me = $(this),
                $list = $me.parents('.item-select').find('.item-list'),
                startY = e.touches[0].clientY

            $list.data('scrollY', parseInt(_getTransY($list)))
                 .data('startY', startY)
                 .data('isMove', 'yes')
                 .data('startTime', new Date().getTime())
        })

        //touch move
        $cover.on('touchmove', function (e) {
            e.preventDefault()

            var
                $me = $(this),
                $list = $me.parents('.item-select').find('.item-list')

            if ($list.data('isMove') != 'yes') {

                return false
            }

            var
                startY = $list.data('startY'),
                endY = e.touches[0].clientY,
                detY = endY - startY

            // 移动选择列表
            _moveList(this, detY)
        }, {passive: false})

        //touch end
        $cover.on('touchend', function (e) {
            e.preventDefault()

            var
                $me = $(this),
                $list = $me.parents('.item-select').find('.item-list')

            if ($list.data('isMove') != 'yes') {

                return false
            }

            var // 垂直移动距离
                detY = _getTransY($list) - $list.data('scrollY'),
                // 滑动时间
                detT = new Date().getTime() - $list.data('startTime')
            // 移动结束
            _moveEnd(this, detY, detT)

            // 移动结束,重置数据
            $list.data('scrollY', 0)
                 .data('startY', 0)
                 .data('isMove', '')
                 .data('startTime', 0)

        })
    }

    // 移动列表
    function _moveList(el, detY) {
        var
            $el = $(el),
            $node = $el.parents('.item-select'),
            $list = $node.find('.item-list'),
            $item = $list.find('.i-item').filter(function () {
                return !$(this).hasClass('disabled')
            }),
            unit_height = $node.height() / 3,
            transY_max = ($item.length - 1) * unit_height,
            scrollY = parseInt($list.data('scrollY'), 10) || 0

        scrollY += detY - 0

        if (scrollY > 0 || scrollY < (0 - transY_max)) {

            return
        }

        //$list.animate({'translateY': scrollY + 'px'}, 0);
        $list.css('-webkit-transform', 'translateY(' + scrollY + 'px)')

        //$item.eq (Math.round (Math.abs (scrollY / unit_height))).trigger ('click')
    }

    // 移动结束
    function _moveEnd(el, detY, detT) {
        var
            $el = $(el),
            $node = $el.parents('.item-select'),
            $list = $node.find('.item-list'),
            $item = $list.find('.i-item').filter(function () {
                return !$(this).hasClass('disabled')
            }),
            unit_height = $node.height() / 3,
            transY_max = ($item.length - 1) * unit_height,
            endTop = parseInt(_getTransY($list)),
            lastTop = (Math.round(endTop / unit_height)) * unit_height

        var
            ZN_NUM = 0.25
        if (Math.abs(detY / detT) > ZN_NUM) {//惯性
            var
                pastNum = ((detY / detT) / ZN_NUM),
                morePastY = Math.floor(pastNum * unit_height)

            lastTop += morePastY

            lastTop = Math.min(Math.max(0 - transY_max, lastTop), 0)

            lastTop = (Math.round(lastTop / unit_height)) * unit_height

            $list.animate({'translateY': lastTop + 'px'}, 300 - 0 + Math.ceil(Math.abs(pastNum)) * 100, 'ease-out')
        } else {
            $list.animate({'translateY': lastTop + 'px'}, 160, 'linear')
        }

        //$item.eq (Math.floor (Math.abs (lastTop / unit_height))).trigger ('click');
        var
            item_pos = Math.floor(Math.round(Math.abs(lastTop * 100 / unit_height)) / 100)
        $item.eq(item_pos).trigger('click')
    }

    // 获取元素垂直方向变形位移
    function _getTransY(el) {
        var
            $el = $(el),
            trans = $el.css('transform')
                || $el.css('-webkit-transform')
                || $el[0].style.webkitTransform,
            transY = 0

        if (trans.indexOf('translateY') > -1) {
            transY = trans.replace(/translateY\((\-?[\d\.]+)px\)/, function (m, n) { return n || 0})
        }
        if (trans.indexOf('matrix') > -1) {
            transY = trans.replace(/matrix\(\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*(\-?[\d\.]+)\)/, function (m, n) { return n || 0})
        }

        return transY
    }

    // 比较版本
    function compareVersion(src, dest) {
        return _version2Num(src) >= _version2Num(dest)
    }

    // 版本变成数字
    function _version2Num(v) {
        var arr = v.split(/\./)
        if (arr.length > 2) {
            arr.length = 2
        } else if (arr.length == 1) {
            arr[1] = '0'
        }
        var vn = arr.join('.')
        vn -= 0
        return vn
    }

    // shine click action
    function shineClick(el, duration) {

        el = $(el)
        duration = parseInt(duration, 10) || 500

        el.each(function () {
            var
                me = this,
                orig_background_color = me.style.backgroundColor

            me.style.backgroundColor = '#f0f0f0'

            setTimeout(function () {

                $(me).animate({'background-color': orig_background_color}, duration, 'cubic-bezier(.28,.2,.51,1.15)', function () {
                    me.style.backgroundColor = orig_background_color || ''
                })

            }, 300)
        })
    }

    /**
     * 加载中
     * @returns {boolean}
     */
    function isLoading(key) {
        key = key || 'KEY_GLOBAL_LOADING'
        return tcb.cache(key)
            ? true
            : false
    }

    /**
     * 设置加载状态
     * @param flag
     * @returns {boolean}
     */
    function setLoading(flag, key) {
        flag = flag
            ? true
            : false
        key = key || 'KEY_GLOBAL_LOADING'

        return tcb.cache(key, flag)
    }


}())
