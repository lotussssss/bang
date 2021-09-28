;(function () {
    var Bang = window.Bang = window.Bang || {}
    Bang.AddressSelect2 = function (trigger, options) {
        return new AddressSelect2(trigger, options)
    }

    function supportLocalStorage() {
        var testKey = 'test',
            storage = window.localStorage
        try {
            storage.setItem(testKey, 'testValue')
            storage.removeItem(testKey)
            return true
        } catch (error) {
            return false
        }
    }

    function __cache(key, val) {
        window.__Cache = window.__Cache || {}
        if (typeof val !== 'undefined') {
            window.__Cache[key] = val
        }
        return window.__Cache[key]
    }

    var isSupportLocalStorage = supportLocalStorage()
    var isSupportJSON = (typeof JSON != 'undefined') && (typeof JSON.stringify == 'function') && (typeof JSON.parse == 'function') ? true : false

    var defaults = {
        // 实例化的时候自动执行init函数
        flagAutoInit: true,
        flagStorage: true,

        container: 'body',
        width: 360,
        height: 'auto',

        url_province: '/api/BasicServer/AdministrativeDivisions/province',
        url_city: '/api/BasicServer/AdministrativeDivisions/city',
        url_district: '/api/BasicServer/AdministrativeDivisions/area',

        // 默认的省、市、区县
        province: '',
        city: '',
        district: '',
        provinceCode: '',
        cityCode: '',
        districtCode: '',

        // 显示级别
        level: 'district', // province表示显示到省，city表示显示到市，district表示显示到区县
        // 默认输出选择的省市区县
        not_render: false,

        onInit: null,
        onShow: null,
        onConfirm: null
    }
    var  // cache省列表
        CacheProvinceList = [],
        // cache市列表
        CacheCityList = {},
        // cache区县列表
        CacheDistrictList = {}

    function AddressSelect2(trigger, options) {
        this.$trigger = $(trigger)
        this.$dropdown = null
        this.options = $.extend({}, defaults, $.isPlainObject(options) && options)
        this.options.onInit = $.isFunction(this.options.onInit) ? this.options.onInit : function () {}
        this.options.onShow = $.isFunction(this.options.onShow) ? this.options.onShow : function () {}
        this.options.onConfirm = $.isFunction(this.options.onConfirm) ? this.options.onConfirm : function () {}
        this.active = false
        this.dems = []

        if (!this.options.flagStorage) {
            this.CacheProvinceList = []
            this.CacheCityList = {}
            this.CacheAreaList = {}
        }

        if (this.options.flagAutoInit) {
            this.init()
        }
    }

    AddressSelect2.prototype = {
        constructor: AddressSelect2,
        init: function () {
            var me = this
            this.options.flagStorage && __restoreData()
            this.defineDems()
            // 获取 $trigger 上的数据，如果有值那么设置到选中值中
            this.setSelectedData(this.getTriggerData())
            this.initData(function (region) {
                me.setSelectedData(region, true)
                me.setTriggerData()
                me.render(region)
                me.bind()
                me.options.onInit(region, me)
            })
            this.active = true
        },
        // 数据初始化
        initData: function (callback) {
            var me = this
            var default_province = me.options.province || '',
                default_city = me.options.city || '',
                default_district = me.options.district || ''

            // 设置默认选中省份城市区县
            me.getProvinceCityDistrictListByName(default_province, default_city, default_district,
                function (region) {
                    $.isFunction(callback) && callback(region, me.$trigger)
                }
            )
        },
        getTriggerData: function () {
            var $trigger = this.$trigger
            var region = {}
            $.each(this.dems, $.proxy(function (i, type) {
                region[type] = $trigger.data(type) || ''
                region[type + 'Code'] = $trigger.data(type + '-code') || ''
            }, this))

            return region
        },
        setTriggerData: function () {
            var $trigger = this.$trigger
            var region = this.getSelectedData()
            $.each(this.dems, $.proxy(function (i, type) {
                $trigger.data(type, region[type] || '')
                $trigger.data(type + '-code', region[type + 'Code'] || '')
            }, this))
        },
        // 设置选中数据
        setSelectedData: function (region, force) {
            var type
            if (typeof region === 'string') {
                type = region
                region = force
                force = false
            }
            if (type && region.name && region.code) {
                var pos = this.dems.indexOf(type)
                $.each(this.dems, $.proxy(function (i, type) {
                    if (i === pos) {
                        this.options[type] = region.name
                        this.options[type + 'Code'] = region.code
                    } else if (i > pos) {
                        this.options[type] = ''
                        this.options[type + 'Code'] = ''
                    }
                }, this))
            } else {
                $.each(this.dems, $.proxy(function (i, type) {
                    if (region[type]) {
                        this.options[type] = region[type]
                        this.options[type + 'Code'] = region[type + 'Code']
                    } else if (force) {
                        this.options[type] = ''
                        this.options[type + 'Code'] = ''
                    }
                }, this))
            }
        },
        getSelectedData: function () {
            var region = {}
            $.each(this.dems, $.proxy(function (i, type) {
                region[type] = this.options[type] || ''
                region[type + 'Code'] = this.options[type + 'Code'] || ''
            }, this))
            return region
        },
        // 输出省市区县选择面板
        render: function (region) {
            region = region || {}
            var html_dropdown = '<div class="city-picker-dropdown">' +
                '<div class="city-select-wrap">' +
                '<div class="city-select-tab">' +
                '<a class="active' + (region.province ? ' selected' : '') + '" data-count="province" data-default-text="省份">' + (region.province || '省份') + '</a>' +
                (this.includeDem('city') ? '<a data-count="city" ' + (region.city ? 'class="selected"' : '') + ' data-default-text="城市">' + (region.city || '城市') + '</a>' : '') +
                (this.includeDem('district') ? '<a data-count="district" ' + (region.district ? 'class="selected"' : '') + ' data-default-text="区县">' + (region.district || '区县') + '</a>' : '') +
                '</div>' +
                '<div class="city-select-content">' +
                '<div class="city-select province" data-count="province"></div>' +
                (this.includeDem('city') ? '<div class="city-select city" data-count="city">请先选择省份</div>' : '') +
                (this.includeDem('district') ? '<div class="city-select district" data-count="district">请先选择城市</div>' : '') +
                '</div></div>'

            this.$trigger.addClass('js-trigger-address-select')
            this.$dropdown = $(html_dropdown).appendTo(this.options.container)

            var $selects = this.$dropdown.find('.city-select')
            var $tabs = this.$dropdown.find('.city-select-tab > a')
            $.each(this.dems, $.proxy(function (i, type) {
                this['$' + type] = $selects.filter('.' + type + '')
                this['$' + type + 'Tab'] = $tabs.filter('[data-count="' + type + '"]')
            }, this))
        },

        defineDems: function () {
            var stop = false
            $.each(['province', 'city', 'district'], $.proxy(function (i, type) {
                if (!stop) {
                    this.dems.push(type)
                }
                if (type === this.options.level) {
                    stop = true
                }
            }, this))
        },

        includeDem: function (type) {
            return $.inArray(type, this.dems) !== -1
        },

        getPosition: function () {
            var offset = this.$trigger.offset()
            var size = this.getSize(this.$trigger)
            return {
                top: offset.top || 0,
                left: offset.left || 0,
                width: size.width,
                height: size.height
            }
        },

        getSize: function ($dom) {
            var $wrap, $clone, sizes
            if (!$dom.is(':visible')) {
                $wrap = $('<div />').appendTo($('body'))
                $wrap.css({
                    'position': 'absolute !important',
                    'visibility': 'hidden !important',
                    'display': 'block !important'
                })

                $clone = $dom.clone().appendTo($wrap)

                sizes = {
                    width: $clone.outerWidth(),
                    height: $clone.outerHeight()
                }

                $wrap.remove()
            } else {
                sizes = {
                    width: $dom.outerWidth(),
                    height: $dom.outerHeight()
                }
            }

            return sizes
        },

        bind: function () {
            var me = this

            $(document).on('click', (this._mouteclick = function (e) {
                var $target = $(e.target)
                var $dropdown, $trigger
                if ($target.is('.js-trigger-address-select')) {
                    $trigger = $target
                } else if ($target.is('.js-trigger-address-select *')) {
                    $trigger = $target.closest('.js-trigger-address-select')
                }
                if ($target.is('.city-picker-dropdown')) {
                    $dropdown = $target
                } else if ($target.is('.city-picker-dropdown *')) {
                    $dropdown = $target.parents('.city-picker-dropdown')
                }
                if ((!$trigger && !$dropdown) ||
                    ($trigger && $trigger.get(0) !== me.$trigger.get(0)) ||
                    ($dropdown && $dropdown.get(0) !== me.$dropdown.get(0))) {
                    me.close(true)
                }
            }))

            this.$trigger
                .on('click', function (e) {
                    e.preventDefault()

                    me.setSelectedData(me.getTriggerData())
                    if (me.$dropdown.is(':visible')) {
                        me.close()
                    } else {
                        me.open()
                    }
                })

            this.$dropdown
                .on('click', '.city-select a', function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var $select = $me.parents('.city-select')
                    var $active = $select.find('a.active')
                    var last = $select.next().length === 0

                    if ($active[0] !== $me[0]) {
                        $active.removeClass('active')
                        $me.addClass('active')
                        var selected = {
                            name: $me.attr('title'),
                            code: $me.data('code')
                        }
                        var type = $select.data('count')
                        me.setSelectedData(type, selected)

                        me['$' + type + 'Tab'].html(selected.name).addClass('selected')
                    }

                    $me.trigger('change.addressSelect2')
                    if (last) {
                        me.close()
                        me.setTriggerData()
                        me.options.onConfirm(me.getSelectedData(), me, $active[0] === $me[0])
                    }
                })
                .on('click', '.city-select-tab a', function (e) {
                    e.preventDefault()
                    if (!$(this).hasClass('active')) {
                        var type = $(this).data('count')
                        me.tab(type)
                    }
                })

            if (this.$province) {
                this.$province.on('change.addressSelect2', (this._changeProvince = $.proxy(function () {
                    this.output('city')
                    this.output('district')
                    this.tab('city')
                }, this)))
            }

            if (this.$city) {
                this.$city.on('change.addressSelect2', (this._changeCity = $.proxy(function () {
                    this.output('district')
                    this.tab('district')
                }, this)))
            }
        },

        unbind: function () {
            $(document).off('click', this._mouteclick)

            this.$trigger.off('click')
            this.$trigger.off('mousedown')

            this.$dropdown.off('click')
            this.$dropdown.off('mousedown')

            if (this.$province) {
                this.$province.off('change.addressSelect2', this._changeProvince)
            }

            if (this.$city) {
                this.$city.off('change.addressSelect2', this._changeCity)
            }
        },

        open: function (type) {
            type = type || 'province'

            var position = this.getPosition()
            this.$dropdown.css({
                width: this.options.width || '360',
                top: position.top + position.height,
                left: position.left
            })

            $.each(this.dems, $.proxy(function (i, type) {
                this.output(type)
            }, this))
            this.tab(type)
            this.$trigger.addClass('open').addClass('focus')
            this.$dropdown.show()
            this.options.onShow(this)
        },

        close: function (blur) {
            this.$dropdown.hide()
            this.$trigger.removeClass('open')
            if (blur) {
                this.$trigger.removeClass('focus')
            }
        },

        output: function (type) {
            var me = this
            var options = me.options
            var $select = me['$' + type]
            var $tab = me['$' + type + 'Tab']

            if (!$select || !$select.length) {
                return
            }

            var selected = {
                name: options[type] || '',
                code: options[type + 'Code'] || ''
            }
            if (selected.code && selected.name) {
                $tab.html(selected.name)
                    .addClass('selected')
            } else {
                $tab.html($tab.data('default-text'))
                    .removeClass('selected')
            }

            var region = me.getSelectedData()
            switch (type) {
                case 'district':
                    region.cityCode &&
                    me.getDistrictList(region.cityCode, function (data) {
                        $select.html(me.getListHtml(data, selected))
                    })
                    break
                case 'city':
                    region.provinceCode &&
                    me.getCityList(region.provinceCode, function (data) {
                        $select.html(me.getListHtml(data, selected))
                    })
                    break
                case 'province':
                default:
                    me.getProvinceList(function (data) {
                        $select.html(me.getListHtml(data, selected))
                    })
            }
        },

        getListHtml: function (data, selected) {
            selected = selected || {}
            var list = []
            list.push('<dl class="clearfix"><dd>')

            $.each(data, function (i, n) {
                list.push(
                    '<a href="#"' +
                    ' title="' + (n.name || '') + '"' +
                    ' data-code="' + (n.code || '') + '"' +
                    ' class="' +
                    (+n.code === +selected.code ? ' active' : '') +
                    '">' +
                    n.name +
                    '</a>')
            })
            list.push('</dd></dl>')

            return list.join('')
        },

        tab: function (type) {
            var $selects = this.$dropdown.find('.city-select')
            var $tabs = this.$dropdown.find('.city-select-tab > a')
            var $select = this['$' + type]
            var $tab = this.$dropdown.find('.city-select-tab > a[data-count="' + type + '"]')
            if ($select) {
                $selects.hide()
                $select.show()
                $tabs.removeClass('active')
                $tab.addClass('active')
            }
        },

        destroy: function () {
            this.unbind()
            this.$trigger.removeClass('js-trigger-address-select')
            this.$dropdown.remove()
        },

        // 省份列表
        getProvinceList: function (callback) {
            var me = this
            var options = me.options
            var url_province = options.url_province
            var province_list = __getProvinceListByCache(me)

            if (province_list && province_list.length) {
                $.isFunction(callback) && callback(province_list)
            } else {
                if (isLoading('KEY_GLOBAL_LOADING_PROVINCE')) {
                    return
                }
                setLoading(true, 'KEY_GLOBAL_LOADING_PROVINCE')

                $.ajax({
                    url: url_province,
                    type: 'GET',
                    dataType: 'json',
                    success: function (res) {
                        if (!res['errCode']) {
                            var data = res['data']
                            if (!$.isArray(data)) {
                                var _data = []
                                $.each(data, function (code, name) {
                                    _data.push({
                                        code: code,
                                        name: name
                                    })
                                })
                                data = _data
                            }
                            __storeProvinceList(data, me)

                            $.isFunction(callback) && callback(data)
                        } else {
                            // do nothing
                        }
                    },
                    complete: function () {
                        setLoading(false, 'KEY_GLOBAL_LOADING_PROVINCE')
                    }
                })
            }
        },
        // 城市列表
        getCityList: function (provinceCode, callback) {
            if (!provinceCode) {
                return
            }
            var me = this
            var options = me.options
            var url_city = options.url_city
            var city_list = __getCityListByCache(provinceCode, me)
            if (city_list && city_list.length) {
                $.isFunction(callback) && callback(city_list)
            } else {
                if (isLoading('KEY_GLOBAL_LOADING_CITY')) {
                    return
                }
                setLoading(true, 'KEY_GLOBAL_LOADING_CITY')

                $.ajax({
                    url: url_city,
                    type: 'GET',
                    data: {
                        provinceCode: provinceCode
                    },
                    dataType: 'json',
                    success: function (res) {
                        if (!res['errCode']) {
                            var data = res['data']
                            if (!$.isArray(data)) {
                                var _data = []
                                $.each(data, function (code, name) {
                                    _data.push({
                                        code: code,
                                        name: name
                                    })
                                })
                                data = _data
                            }
                            __storeCityList(provinceCode, data, me)

                            $.isFunction(callback) && callback(data)
                        } else {
                            // do nothing
                        }
                    },
                    complete: function () {
                        setLoading(false, 'KEY_GLOBAL_LOADING_CITY')
                    }
                })
            }
        },
        // 区县列表
        getDistrictList: function (cityCode, callback) {
            if (!cityCode) {
                return
            }
            var me = this
            var options = me.options
            var url_district = options.url_district
            var district_list = __getDistrictListByCache(cityCode, me)

            if (district_list && district_list.length) {
                $.isFunction(callback) && callback(district_list)
            } else {
                if (isLoading('KEY_GLOBAL_LOADING_DISTRICT')) {
                    return
                }
                setLoading(true, 'KEY_GLOBAL_LOADING_DISTRICT')

                $.ajax({
                    url: url_district,
                    type: 'GET',
                    data: {cityCode: cityCode},
                    dataType: 'json',
                    success: function (res) {
                        if (!res['errCode']) {
                            var data = res['data']
                            if (!$.isArray(data)) {
                                var _data = []
                                $.each(data, function (code, name) {
                                    _data.push({
                                        code: code,
                                        name: name
                                    })
                                })
                                data = _data
                            }
                            __storeDistrictList(cityCode, data, me)

                            $.isFunction(callback) && callback(data)
                        } else {
                            // do nothing
                        }
                    },
                    complete: function () {
                        setLoading(false, 'KEY_GLOBAL_LOADING_DISTRICT')
                    }
                })
            }
        },
        // 根据省市区县名称，获取省市区县信息（包括编码）以及列表
        getProvinceCityDistrictListByName: function (province, city, district, callback) {
            var me = this
            var region = {}
            var provinceCityDistrict = {}
            // 获取省份列表
            me.getProvinceList(function (provinceList) {
                var provinceCode = __getProvinceCodeByName(province, provinceList)
                provinceCityDistrict.provinceList = provinceList
                region.province = province
                region.provinceCode = provinceCode

                if (me.includeDem('city') && provinceCode) {
                    // 获取城市列表
                    me.getCityList(provinceCode, function (cityList) {
                        var cityCode = __getCityCodeByName(city, cityList)
                        provinceCityDistrict.cityList = cityList
                        region.city = city
                        region.cityCode = cityCode

                        if (me.includeDem('district') && cityCode) {
                            // 获取区县列表
                            me.getDistrictList(cityCode, function (districtList) {
                                var districtCode = __getDistrictCodeByName(district, districtList)
                                provinceCityDistrict.districtList = districtList
                                region.district = district
                                region.districtCode = districtCode

                                // 执行回调
                                $.isFunction(callback) && callback(region, provinceCityDistrict)
                            })
                        } else {
                            // 执行回调
                            $.isFunction(callback) && callback(region, provinceCityDistrict)
                        }
                    })
                } else {
                    // 执行回调
                    $.isFunction(callback) && callback(region, provinceCityDistrict)
                }
            })
        }
    }

    //================= private ===================

    function __restoreData() {
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage

            CacheProvinceList = JSON.parse(storage.getItem('TCB_HS_ProvinceList2') || '[]')
            CacheCityList = JSON.parse(storage.getItem('TCB_HS_CityList2') || '{}')
            CacheDistrictList = JSON.parse(storage.getItem('TCB_HS_DistrictList2') || '{}')
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
    function __storeDistrictList(cityCode, DistrictList, inst) {
        if (!(DistrictList && DistrictList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheDistrictList[cityCode] = DistrictList
        }
        CacheDistrictList[cityCode] = DistrictList
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage
            storage.setItem('TCB_HS_DistrictList2', JSON.stringify(CacheDistrictList))
        }
        return CacheDistrictList[cityCode]
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
    function __getDistrictListByCache(cityCode, inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheDistrictList[cityCode]
        }
        return CacheDistrictList[cityCode]
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
    function __getDistrictCodeByName(district_name, district_list) {
        if (!(district_name && $.isArray(district_list))) {
            return
        }
        var districtCode
        $.each(district_list, function (i, item) {
            if (district_name == item['name']) {
                districtCode = item['code']

                return false
            }
        })

        return districtCode
    }

    /**
     * 加载中
     * @returns {boolean}
     */
    function isLoading(key) {
        key = key || 'KEY_GLOBAL_LOADING'
        return __cache(key)
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

        return __cache(key, flag)
    }

}())
