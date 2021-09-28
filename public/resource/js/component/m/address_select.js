;
(function () {
    var Bang
            = window.Bang
            = window.Bang || {}

    var defaults = {
            // 根据省一次性获取所有的城市和区县信息
            //flagGetAll       : false,
            // 实例化的时候自动执行init函数
            flagAutoInit     : true,
            flagStorage      : true,
            // 触发器
            selectorTrigger  : '.province-city-area',
            // 省、市、区县的选择器
            selectorProvince : '[name="receiver_province_id"]',
            selectorCity     : '[name="receiver_city_id"]',
            selectorArea     : '[name="receiver_area_id"]',

            url_province     : '/aj/doGetProvinceList',
            url_city_area    : '/aj/doGetProvinceLinkage',
            url_city         : '/aj/doGetCityList',
            url_area         : '/aj/doGetAreaList',

            // 默认的省、市、区县
            province         : '',
            city             : '',
            area             : '',
            province_id      : '',
            city_id          : '',
            area_id          : '',

            // 是否显示城市\区县
            show_city        : true,
            show_area        : true,
            // 默认输出选择的省市区县
            not_render       : false,
            // 回调函数(确认/取消)
            callback_confirm : null,
            callback_cancel  : null
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
        isSupportJSON = (typeof JSON !='undefined') && (typeof JSON.stringify =='function') && (typeof JSON.parse =='function') ? true : false

    function AddressSelect (options) {
        var
            me = this

        options = $.extend ({}, defaults, options)

        me.options = options

        if (!me.options.flagStorage) {
            me.CacheProvinceList = []
            me.CacheCityList = {}
            me.CacheAreaList = {}
        }

        if (me.options.flagAutoInit) {

            me.init ()
        }
    }

    // 设置原型方法
    AddressSelect.prototype = {

        constructor : AddressSelect,

        getWrap : getWrap,

        getTrigger        : getTrigger,
        getProvinceSelect : getProvinceSelect,
        getCitySelect     : getCitySelect,
        getAreaSelect     : getAreaSelect,

        setProvinceHtml : setProvinceHtml,
        setCityHtml     : setCityHtml,
        setAreaHtml     : setAreaHtml,

        getProvinceList : getProvinceList,
        getCityList     : getCityList,
        getAreaList     : getAreaList,
        getCityAreaList : getCityAreaList,

        //getProvinceListByCache : getProvinceListByCache,
        //getCityListByCache     : getCityListByCache,
        //getAreaListByCache     : getAreaListByCache,

        //getProvinceIdByName : getProvinceIdByName,
        //getCityIdByName     : getCityIdByName,
        //getAreaIdByName     : getAreaIdByName,

        bindEvent     : bindEvent,
        bindMoveEvent : bindMoveEvent,

        setSelect         : setSelect,
        setSelectCityArea : setSelectCityArea,
        setSelectArea     : setSelectArea,

        doSelect : doSelect,
        doShow   : doShow,
        doHide   : doHide,

        init : init
    }

    // 获取触发器
    function getTrigger () {
        var
            me = this,
            selectorTrigger = me.options.selectorTrigger

        return $ (selectorTrigger)
    }

    // 获取省选择器
    function getProvinceSelect () {
        var
            me = this,
            selectorProvince = me.options.selectorProvince

        return $ (selectorProvince)
    }

    // 获取城市选择器
    function getCitySelect () {
        var
            me = this,
            selectorCity = me.options.selectorCity

        return $ (selectorCity)
    }

    // 获取地区选择器
    function getAreaSelect () {
        var
            me = this,
            selectorArea = me.options.selectorArea

        return $ (selectorArea)
    }


    // 获取省份列表
    function getProvinceList (callback) {
        var me = this
        var options = me.options
        var url_province = options.url_province
        var
            province_list = __getProvinceListByCache (me)

        if (province_list && province_list.length) {

            $.isFunction (callback) && callback ()
        } else {
            if (isLoading ('KEY_GLOBAL_LOADING_PROVINCE')) {
                return
            }
            setLoading (true, 'KEY_GLOBAL_LOADING_PROVINCE')

            var request_url = tcb.setUrl2(url_province || '/aj/doGetProvinceList')

            $.get (request_url, function (res) {
                res = $.parseJSON (res)

                setLoading (false, 'KEY_GLOBAL_LOADING_PROVINCE')

                if (!res[ 'errno' ]) {
                    __storeProvinceList(res[ 'result' ], me)

                    $.isFunction (callback) && callback ()
                } else {
                    // do nothing
                }

            })
        }
    }

    // 获取城市、地区列表
    function getCityAreaList (province_id, callback) {
        if (!province_id) {
            return;
        }
        var me = this
        var options = me.options
        var url_city_area = options.url_city_area
        var
            city_list = __getCityListByCache (province_id, me)

        if (city_list && city_list.length) {

            $.isFunction (callback) && callback ()
        } else {
            if (isLoading ('KEY_GLOBAL_LOADING_CITY_AREA')) {
                return
            }
            setLoading (true, 'KEY_GLOBAL_LOADING_CITY_AREA')

            var request_url = tcb.setUrl2((url_city_area || '/aj/doGetProvinceLinkage') + '?province_id=' + province_id)

            city_list = []
            $.get (request_url, function (res) {
                res = $.parseJSON (res)

                setLoading (false, 'KEY_GLOBAL_LOADING_CITY_AREA')

                if (!res[ 'errno' ]) {

                    var
                        result = res[ 'result' ]

                    $.each (result[ 'city_list' ], function (i, item) {
                        city_list.push ({
                            city_id   : item[ 'city_id' ],
                            city_name : item[ 'city_name' ]
                        })

                        // 区县cache
                        __storeAreaList(item[ 'city_id' ], (item[ 'area_list' ] && item[ 'area_list' ].length)
                            ? item[ 'area_list' ]
                            : [], me)
                    });
                    // 城市cache
                    __storeCityList (province_id, city_list, me)

                    $.isFunction (callback) && callback ()

                } else {
                    $.isFunction (callback) && callback ()
                    // do nothing
                }
            });

        }
    }

    // 获取城市列表
    function getCityList (province_id, callback) {
        if (!province_id) {
            return;
        }
        var me = this
        var options = me.options
        var url_city = options.url_city
        var city_list = __getCityListByCache(province_id, me)
        if (city_list && city_list.length) {
            if ($.isFunction (callback)) {
                getAreaList (city_list[ 0 ][ 'city_id' ], function (area_list) {
                    callback (city_list, area_list)
                })
            }
        } else {
            var request_url = tcb.setUrl2((url_city || '/aj/doGetCityList') + '?province_id=' + province_id)

            $.get (request_url, function (res) {
                res = $.parseJSON (res);

                if (!res[ 'errno' ]) {
                    city_list = res[ 'result' ]

                    __storeCityList (province_id, city_list, me)

                    if ($.isFunction (callback)) {
                        if (city_list && city_list.length) {
                            getAreaList (city_list[ 0 ][ 'city_id' ], function (area_list) {
                                callback (city_list, area_list);
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
    function getAreaList (city_id, callback) {
        if (!city_id) {
            return;
        }
        var me = this
        var options = me.options
        var url_area = options.url_area
        var area_list = __getAreaListByCache (city_id, me)

        if (area_list && area_list.length) {

            $.isFunction (callback) && callback ()
        } else {
            var
                request_url = tcb.setUrl2((url_area || '/aj/doGetAreaList') + '?city_id=' + city_id)

            $.get (request_url, function (res) {
                res = $.parseJSON (res);

                if (!res[ 'errno' ]) {

                    __storeAreaList(city_id, (res[ 'result' ] && res[ 'result' ].length) ? res[ 'result' ] : [], me)

                    $.isFunction (callback) && callback ()
                } else {
                    // do nothing
                }
            });
        }
    }

    // 设置省份html
    function setProvinceHtml (data, selected_id) {
        var
            me = this

        var
            html_str = genHtml ('province', data, selected_id),
            $wrap = me.getWrap (),
            $col = $wrap.find ('.col').eq (0)

        $col.find ('.item-list').html (html_str)

        return $col
    }

    // 设置城市html
    function setCityHtml (data, selected_id) {
        var
            me = this

        var
            html_str = genHtml ('city', data, selected_id),
            $wrap = me.getWrap (),
            $col = $wrap.find ('.col').eq (1)

        $col.find ('.item-list').html (html_str)
        return $col
    }

    // 设置地区html
    function setAreaHtml (data, selected_id) {
        var
            me = this

        var
            html_str = genHtml ('area', data, selected_id),
            $wrap = me.getWrap (),
            $col = $wrap.find ('.col').eq (2)

        $col.find ('.item-list').html (html_str)
        return $col
    }

    // 根据type生成省/市/区县的html
    function genHtml (type, data, selected_id) {
        data = data || []
        var
            type_arr = [ 'province',
                         'city',
                         'area' ],
            type_map = {
                province : {
                    field_id   : 'province_id',
                    field_name : 'province_name'
                },
                city     : {
                    field_id   : 'city_id',
                    field_name : 'city_name'
                },
                area     : {
                    field_id   : 'area_id',
                    field_name : 'area_name'
                }
            },
            html_str = []

        if ($.inArray (type, type_arr) == -1) {
            type = type_arr[ 0 ]
        }

        $.each (data, function (i, item) {
            html_str.push ('<span class="i-item')
            if (selected_id === item[ type_map[ type ][ 'field_id' ] ]) {
                html_str.push (' selected');
            }
            html_str.push ('" data-value="', item[ type_map[ type ][ 'field_id' ] ], '">', item[ type_map[ type ][ 'field_name' ] ], '</span>');
        })

        return html_str.join ('')
    }

    // 选中省、市、区县
    function doSelect () {
        var
            me = this,
            str = '',

            $wrap = me.getWrap (),
            $selected = $wrap.find ('.selected'),
            $selected_province = $selected.eq (0),
            $selected_city = $selected.eq (1),
            $selected_area = $selected.eq (2),

            // 获取选择器
            $trigger = me.getTrigger (),
            $province = me.getProvinceSelect (),
            $city = me.getCitySelect (),
            $area = me.getAreaSelect ()

        var
            province = $selected_province.html () || '',
            province_id = $selected_province.attr ('data-value') || '',
            city = $selected_city.html () || '',
            city_id = $selected_city.attr ('data-value') || '',
            area = $selected_area.html () || '',
            area_id = $selected_area.attr ('data-value') || ''

        me.options.province = province
        me.options.city = city
        me.options.area = area
        me.options.province_id = province_id
        me.options.city_id = city_id
        me.options.area_id = area_id

        // 设置省
        $province.val (province_id)
        str += '<span class="i-shipping-province">' + province + '</span>'

        // 设置城市
        $city.val (city_id)
        str += ' <span class="i-shipping-city">' + city + '</span>'

        // 设置区县
        $area.val (area_id)
        str += ' <span class="i-shipping-area">' + area + '</span>'

        if(!me.options.not_render){

            $trigger.removeClass ('default').html (str)
        }
    }

    // 设置选中的省市区县
    function setSelect (province, city, area, callback) {
        var
            me = this

        // 初始化获取省市区县列表数据
        me.getProvinceList (function () {
            // 获取省份信息

            var
                province_list = __getProvinceListByCache (me),
                province_id = __getProvinceIdByName (province, province_list)

            // 根据默认省份获取不到省份id,那么将第一个省份当作默认省
            province_id = province_id || province_list[ 0 ][ 'province_id' ]

            // 设置省份html
            var
                $col_province = me.setProvinceHtml (province_list, province_id)
            // 根据选中的item,将列表移动到选中的位置
            setSelectTransYBySelectedItem ($col_province)

            // 设置市/区县
            me.setSelectCityArea (province_id, city, area, callback)

        })
    }

    // 设置市/区县
    function setSelectCityArea (province_id, city, area, callback) {
        if (!province_id) {

            return
        }

        var
            me = this

        // 获取区县数据
        me.getCityAreaList (province_id, function () {
            var
                city_list = __getCityListByCache (province_id, me),
                // 默认选中的城市id
                city_id = __getCityIdByName (city, city_list)

            if (!city_id && city_list && city_list[ 0 ] && city_list[ 0 ][ 'city_id' ]) {
                city_id = city_list[ 0 ][ 'city_id' ]
            }

            // 城市
            var
                $col_city = me.setCityHtml (city_list, city_id)
            // 根据选中的item,将列表移动到选中的位置
            setSelectTransYBySelectedItem ($col_city)

            // 设置区县
            me.setSelectArea (city_id, area, callback)

        })

    }

    // 设置区县
    function setSelectArea (city_id, area, callback) {
        var me = this

        var
            area_list = __getAreaListByCache (city_id, me),
            // 默认选中的区县id
            area_id = __getAreaIdByName (area, area_list)

        if (!area_id && area_list && area_list[ 0 ] && area_list[ 0 ][ 'area_id' ]) {
            area_id = area_list[ 0 ][ 'area_id' ]
        }

        // 区县
        var
            $col_area = me.setAreaHtml (area_list, area_id)
        // 根据选中的item,将列表移动到选中的位置
        setSelectTransYBySelectedItem ($col_area)

        // 执行回调
        $.isFunction (callback) && callback ()
    }

    // 根据选中的item,将列表移动到选中的位置
    function setSelectTransYBySelectedItem ($col) {
        if (!($col && $col.length)) {

            return
        }
        $col.each (function (i, el) {
            var
                $el = $ (el),
                $cover = $el.find ('.item-window'),
                $selected = $el.find ('.selected'),
                el_index = $selected.index (),
                d = -($selected.height () * el_index)

            _moveList ($cover[ 0 ], d)
        })
    }

    // 显示
    function doShow () {
        var
            me = this,
            $wrap = me.getWrap ()

        // 显示遮罩层
        showMask ()

        $wrap.css ({
            'position' : 'fixed',
            'left'     : '0',
            'top'      : '100%',
            'z-index'  : tcb.zIndex (),
            'width'    : '100%'
        })//.show ();

        //如果为android4.0以下系统，由于不支持部分CSS动画，需要特别处理
        if ($.os.android && !compareVersion ($.os.version, "4.0")) {
            $wrap.css ({
                'top'    : 'auto',
                'bottom' : 0
            });
            $.dialog.toast ("抱歉，您的手机系统版本不支持选择", 1600);
        } else {
            $wrap.animate ({ 'translateY' : '1px' }, 10, function () {
                $wrap.hide ()
                setTimeout (function () {
                    $wrap.show ().animate ({ 'translateY' : 0 - $wrap.height () + 'px' }, 200, 'linear')//
                }, 30);
            });
        }

    }

    function doHide () {
        var
            me = this,
            $wrap = me.getWrap ()

        $wrap.animate ({ 'translateY' : 0 }, 200, 'linear', function () {

            $ (this).hide ();

            removeWrap ()

            hideMask ()
        });
    }

    // 初始化
    function init () {
        var me = this,
            options = me.options || {},
            $trigger = me.getTrigger()

        options.flagStorage && __restoreData()

        // 触发切换省、市、地区
        $trigger.on ('click', function (e) {
            e.preventDefault ()

            // shining
            shineClick (this)

            var
                default_province = me.options.province || window.city_name || '北京',
                default_city = me.options.city || '',
                default_area = me.options.area || ''

            // 设置默认选中省份城市区县
            me.setSelect (default_province, default_city, default_area, function () {

                // 绑定基本事件
                me.bindEvent ()

                // 移动事件
                me.bindMoveEvent ()

                // 显示
                me.doShow ()

                //var
                //    $wrap = getWrap(),
                //    $col = $wrap.find('.col')
                //
                //$col.each(function(i, el){
                //    var
                //        $el = $(el),
                //        $cover = $el.find('.item-window'),
                //        $selected = $el.find('.selected'),
                //        el_index = $selected.index()+1,
                //        d = -($selected.height()*el_index)
                //
                //    _moveList($cover[0], d)
                //})
            })

        })

    }

    // 绑定基本事件
    function bindEvent () {
        var
            me = this,
            $wrap = me.getWrap (),
            $item = $wrap.find ('.i-item'),
            $ctrl = $wrap.find ('.ctrl-item')

        // 选择item
        $wrap.on ('click', '.i-item', function (e) {
            e.preventDefault ()

            var
                $me = $ (this)

            $me.addClass ('selected')
                .siblings ('.selected').removeClass ('selected')

            var
                $col = $me.closest ('.col'),
                col_index = $col.index (),
                col_arr = [ 'province',
                            'city',
                            'area' ],
                province,
                city,
                area,
                province_id,
                province_list,
                city_id,
                city_list

            switch (col_arr[ col_index ]) {
                case 'province':
                    province = $me.html ()
                    city = ''
                    area = ''

                    // 获取省份列表
                    province_list = __getProvinceListByCache (me)
                    // 根据省名称,获取省份id
                    province_id = __getProvinceIdByName (province, province_list)

                    me.setSelectCityArea (province_id, city, area)
                    break
                case 'city':
                    province = $col.prev ().find ('.selected').html ()
                    city = $me.html ()
                    area = ''

                    province_list = __getProvinceListByCache (me)
                    province_id = __getProvinceIdByName (province, province_list)
                    city_list = __getCityListByCache (province_id, me)
                    // 默认选中的城市id
                    city_id = __getCityIdByName (city, city_list)

                    me.setSelectArea (city_id, area)
                    break
                case 'area':
                    // do nothing
                    break
            }
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

        //取消关闭
        function actionCancel ($el) {

            // 关闭wrap层
            me.doHide ()

            if ($.isFunction (me.options.callback_cancel)) {
                var
                    region = {
                        province         : me.options.province,
                        city             : me.options.city,
                        area             : me.options.area,
                        province_id      : me.options.province_id,
                        city_id          : me.options.city_id,
                        area_id          : me.options.area_id
                    }
                me.options.callback_cancel (region)
            }
        }

        //确认选择
        function actionConfirm ($el) {

            // 选择确定的省/市/区县
            me.doSelect ()
            // 关闭wrap层
            me.doHide ()

            if ($.isFunction (me.options.callback_confirm)) {
                var
                    region = {
                        province         : me.options.province,
                        city             : me.options.city,
                        area             : me.options.area,
                        province_id      : me.options.province_id,
                        city_id          : me.options.city_id,
                        area_id          : me.options.area_id
                    }
                me.options.callback_confirm (region, me.getTrigger())
            }
        }
    }



    Bang.AddressSelect = function (options) {

        return new AddressSelect (options)
    }



    //================= private ===================

    function __restoreData(){
        if (isSupportLocalStorage && isSupportJSON){
            var storage = window.localStorage

            CacheProvinceList = JSON.parse (storage.getItem ('TCB_HS_ProvinceList') || '[]')
            CacheCityList = JSON.parse (storage.getItem ('TCB_HS_CityList') || '{}')
            CacheAreaList = JSON.parse (storage.getItem ('TCB_HS_AreaList') || '{}')
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
        if (isSupportLocalStorage && isSupportJSON){
            var storage = window.localStorage
            storage.setItem('TCB_HS_ProvinceList', JSON.stringify(CacheProvinceList))
        }
        return CacheProvinceList
    }

    // 存储城市列表
    function __storeCityList (province_id, CityList, inst) {
        if (!(CityList && CityList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheCityList[ province_id ] = CityList
        }
        CacheCityList[ province_id ] = CityList
        if (isSupportLocalStorage && isSupportJSON){
            var storage = window.localStorage
            storage.setItem('TCB_HS_CityList', JSON.stringify(CacheCityList))
        }

        return CacheCityList[ province_id ]
    }

    // 存储区县列表
    function __storeAreaList(city_id, AreaList, inst) {
        if (!(AreaList && AreaList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheAreaList[ city_id ] = AreaList
        }
        CacheAreaList[ city_id ] = AreaList
        if (isSupportLocalStorage && isSupportJSON){
            var storage = window.localStorage
            storage.setItem('TCB_HS_AreaList', JSON.stringify(CacheAreaList))
        }
        return CacheAreaList[ city_id ]
    }

    // cache中获取省份列表
    function __getProvinceListByCache (inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheProvinceList
        }
        return CacheProvinceList
    }

    // cache中获取城市列表
    function __getCityListByCache (province_id, inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheCityList[province_id]
        }
        return CacheCityList[province_id]
    }

    // cache中获取区县列表
    function __getAreaListByCache (city_id, inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheAreaList[city_id]
        }
        return CacheAreaList[city_id]
    }

    // 根据省份名称，获取省份id
    function __getProvinceIdByName (province_name, province_list) {
        if (!(province_name && $.isArray (province_list))) {
            return
        }
        var
            province_id
        $.each (province_list, function (i, item) {
            if (province_name == item[ 'province_name' ]) {
                province_id = item[ 'province_id' ]

                return false
            }
        })

        return province_id
    }

    // 根据城市名称，获取城市id
    function __getCityIdByName (city_name, city_list) {
        if (!(city_name && $.isArray (city_list))) {
            return;
        }
        var
            city_id
        $.each (city_list, function (i, item) {
            if (city_name == item[ 'city_name' ]) {
                city_id = item[ 'city_id' ]

                return false
            }
        })

        return city_id
    }

    // 根据城市名称，获取城市id
    function __getAreaIdByName (area_name, area_list) {
        if (!(area_name && $.isArray (area_list))) {
            return;
        }
        var
            area_id
        $.each (area_list, function (i, item) {
            if (area_name == item[ 'area_name' ]) {
                area_id = item[ 'area_id' ]

                return false
            }
        })

        return area_id
    }

    // 获取地区选择器
    function getWrap () {
        var
            me = this,
            $wrap = $ ('#BottomSelectWrap')

        if (!($wrap && $wrap.length)) {

            var
                col = 3,
                tit = [ '',
                        '',
                        '' ],
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
            html_st.push ('<div class="shipping-address-select-block" id="BottomSelectWrap">')

            // 主体列表
            html_st.push ('<div class="dt-table dt-table-', col_show, '-col">')
            //for (var i = 0; i < col; i++) {
            for (var i = 0; i < col_show; i++) {
                html_st.push ('<div class="col">') // col-', col, '-1
                html_st.push ('<div class="tit">', tit[ i ], '</div>')

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

            $wrap = $ (html_st).appendTo ($ ('body'))//.hide ()
        }

        return $wrap
    }

    // 删除地区选择器
    function removeWrap () {
        var
            $wrap = $ ('#BottomSelectWrap')

        if ($wrap && $wrap.length) {

            $wrap.remove ()
        }
    }

    function showMask () {
        var
            $mask = $ ('#BottomSelectWrapMask')

        if (!($mask && $mask.length)) {

            var
                mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;display: block;width: 100%;height: 100%;background:rgba(0, 0, 0, 0.2);',
                mask_html = '<a id="BottomSelectWrapMask" href="#" style="' + mask_css + '"></a>'

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

    function hideMask () {
        var
            $mask = $ ('#BottomSelectWrapMask')

        if ($mask && $mask.length) {

            $mask.hide ()
        }
    }


    // 绑定滑动事件
    function bindMoveEvent () {
        var
            me = this,
            $wrap = me.getWrap (),
            $cover = $wrap.find ('.item-window')

        //touch start
        $cover.on ('touchstart', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $list = $me.parents ('.item-select').find ('.item-list'),
                startY = e.touches[ 0 ].clientY

            $list.data ('scrollY', parseInt (_getTransY ($list)))
                .data ('startY', startY)
                .data ('isMove', 'yes')
                .data ('startTime', new Date ().getTime ());
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
            _moveList (this, detY);
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
                detY = _getTransY ($list) - $list.data ('scrollY'),
                // 滑动时间
                detT = new Date ().getTime () - $list.data ('startTime')
            // 移动结束
            _moveEnd (this, detY, detT)

            // 移动结束,重置数据
            $list.data ('scrollY', 0)
                .data ('startY', 0)
                .data ('isMove', '')
                .data ('startTime', 0)

        })
    }

    // 移动列表
    function _moveList (el, detY) {
        var
            $el = $ (el),
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

        //$item.eq (Math.round (Math.abs (scrollY / unit_height))).trigger ('click')
    }

    // 移动结束
    function _moveEnd (el, detY, detT) {
        var
            $el = $ (el),
            $node = $el.parents ('.item-select'),
            $list = $node.find ('.item-list'),
            $item = $list.find ('.i-item').filter (function () {
                return !$ (this).hasClass ('disabled')
            }),
            unit_height = $node.height () / 3,
            transY_max = ($item.length - 1) * unit_height,
            endTop = parseInt (_getTransY ($list)),
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

    // 获取元素垂直方向变形位移
    function _getTransY (el) {
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

    // 比较版本
    function compareVersion (src, dest) {
        return _version2Num (src) >= _version2Num (dest);
    }

    // 版本变成数字
    function _version2Num (v) {
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
    function shineClick (el, duration) {

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

    /**
     * 加载中
     * @returns {boolean}
     */
    function isLoading (key) {
        key = key || 'KEY_GLOBAL_LOADING'
        return tcb.cache (key)
            ? true
            : false
    }

    /**
     * 设置加载状态
     * @param flag
     * @returns {boolean}
     */
    function setLoading (flag, key) {
        flag = flag
            ? true
            : false
        key = key || 'KEY_GLOBAL_LOADING'

        return tcb.cache (key, flag)
    }


} ())
