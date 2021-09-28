// 省市地区切换
;
(function () {
    var
        Bang
            = window.Bang
            = window.Bang || {}

    var
        defaults = {
            // 根据省一次性获取所有的城市和区县信息
            //flagGetAll       : false,
            // 实例化的时候自动执行init函数
            flagAutoInit     : true,
            selectorProvince : '[name="receiver_province_id"]',
            selectorCity     : '[name="receiver_city_id"]',
            selectorArea     : '[name="receiver_area_id"]',
            province         : '',
            city             : '',
            area             : ''
        },
        // cache省列表
        CacheProvinceList = [],
        // cache市列表
        CacheCityList = {},
        // cache区县列表
        CacheAreaList = {}

    function AddressSelect ( options ) {
        var
            me = this

        options = $.extend ( {}, defaults, options )

        me.options = options

        if ( me.options.flagAutoInit ) {

            me.init ()
        }
    }

    // 设置原型方法
    AddressSelect.prototype = {

        constructor : AddressSelect,

        getProvinceSelect : getProvinceSelect,
        getCitySelect     : getCitySelect,
        getAreaSelect     : getAreaSelect,

        setProvinceHtml : setProvinceHtml,
        setCityHtml     : setCityHtml,
        setAreaHtml     : setAreaHtml,
        addSelectInner  : addSelectInner,

        getProvinceList : getProvinceList,
        getCityList     : getCityList,
        getAreaList     : getAreaList,
        getCityAreaList : getCityAreaList,

        setSelect : setSelect,

        init : init
    }

    // 获取省选择器
    function getProvinceSelect () {
        var
            me = this,
            selectorProvince = me.options.selectorProvince

        return $ ( selectorProvince )
    }

    // 获取城市选择器
    function getCitySelect () {
        var
            me = this,
            selectorProvince = me.options.selectorCity

        return $ ( selectorProvince )
    }

    // 获取地区选择器
    function getAreaSelect () {
        var
            me = this,
            selectorProvince = me.options.selectorArea

        return $ ( selectorProvince )
    }

    // 设置省份html
    function setProvinceHtml ( data, selected_id ) {
        data = data || []
        var
            me = this,
            html_str = []

        $.each ( data, function ( i, item ) {
            html_str.push ( '<option value="', item[ 'province_id' ], '"' );
            if ( selected_id === item[ 'province_id' ] ) {
                html_str.push ( ' selected' );
            }
            html_str.push ( '>', item[ 'province_name' ], '</option>' );
        } );

        html_str = html_str.join ( '' );

        var
            $ProvinceSelect = me.getProvinceSelect ()

        me.addSelectInner ( $ProvinceSelect, html_str )
    }

    // 设置城市html
    function setCityHtml ( data, selected_id ) {
        data = data || []
        var
            me = this,
            html_str = []

        $.each ( data, function ( i, item ) {
            html_str.push ( '<option value="', item[ 'city_id' ], '"' );
            if ( selected_id === item[ 'city_id' ] ) {
                html_str.push ( ' selected' );
            }
            html_str.push ( '>', item[ 'city_name' ], '</option>' );
        } );

        html_str = html_str.join ( '' );

        var
            $CitySelect = me.getCitySelect ()

        me.addSelectInner ( $CitySelect, html_str )
    }

    // 设置地区html
    function setAreaHtml ( data, selected_id ) {
        data = data || []
        var
            me = this,
            html_str = []

        $.each ( data, function ( i, item ) {
            html_str.push ( '<option value="', item[ 'area_id' ], '"' );
            if ( selected_id === item[ 'area_id' ] ) {
                html_str.push ( ' selected' );
            }
            html_str.push ( '>', item[ 'area_name' ], '</option>' );
        } );

        html_str = html_str.join ( '' );

        var
            $AreaSelect = me.getAreaSelect ()

        me.addSelectInner ( $AreaSelect, html_str )
    }

    // 添加省市地区select的内部html
    function addSelectInner ( $select, inner_html_str ) {
        if ( !($select && $select.length) ) {

            return
        }

        $select.html ( inner_html_str );
        if ( inner_html_str ) {
            $select.show ()
        }
        else {
            $select.hide ()
        }
    }

    // 获取省份列表
    function getProvinceList ( callback ) {
        var
            province_list = CacheProvinceList
        if ( province_list && province_list.length ) {
            $.isFunction ( callback ) && callback ()
        }
        else {
            var
                request_url = '/aj/doGetProvinceList'

            $.get ( request_url, function ( res ) {
                res = $.parseJSON ( res );

                if ( !res[ 'errno' ] ) {

                    var result = res[ 'result' ];
                    CacheProvinceList = result;

                    $.isFunction ( callback ) && callback ()
                }
                else {
                    // do nothing
                }
            } );
        }
    }

    // 获取城市列表
    function getCityList ( province_id, callback ) {
        if ( !province_id ) {
            return;
        }
        var
            me = this,
            city_list = CacheCityList[ province_id ]
        if ( city_list && city_list.length ) {
            if ( $.isFunction ( callback ) ) {
                // 获取区县列表
                if(city_list[ 0 ].length){
                    me.getAreaList ( city_list[ 0 ][ 'city_id' ], function ( area_list ) {
                        callback ( city_list, area_list );
                    } )
                }
            }
        }
        else {
            var
                request_url = '/aj/doGetCityList?province_id=' + province_id

            $.get ( request_url, function ( res ) {
                res = $.parseJSON ( res )

                if ( !res[ 'errno' ] ) {
                    CacheCityList[ province_id ] = res[ 'result' ]

                    if ( $.isFunction ( callback ) ) {
                        city_list = CacheCityList[ province_id ];

                        if ( city_list && city_list.length ) {

                            // 获取区县列表
                            if(city_list[ 0 ].length){
                                me.getAreaList ( city_list[ 0 ][ 'city_id' ], function ( area_list ) {
                                    callback ( city_list, area_list );
                                } )
                            }

                        }
                    }
                }
                else {
                    // do nothing
                }
            } );
        }
    }

    // 获取城市列表
    function getAreaList ( city_id, callback ) {
        if ( !city_id ) {
            return;
        }
        var
            me = this,
            area_list = CacheAreaList[ city_id ]
        if ( area_list && area_list.length ) {
            if ( $.isFunction ( callback ) ) {
                callback ( area_list );
            }
        }
        else {
            var
                request_url = '/aj/doGetAreaList?city_id=' + city_id

            $.get ( request_url, function ( res ) {
                res = $.parseJSON ( res );

                if ( !res[ 'errno' ] ) {

                    CacheAreaList[ city_id ] = res[ 'result' ];

                    if ( $.isFunction ( callback ) ) {
                        callback ( CacheAreaList[ city_id ] );
                    }
                }
                else {
                    // do nothing
                }
            } );
        }
    }

    // 获取城市、地区列表
    function getCityAreaList ( province_id, callback ) {
        if ( !province_id ) {
            return;
        }
        var
            me = this,
            city_list = CacheCityList[ province_id ]
        if ( city_list && city_list.length ) {

            if ( $.isFunction ( callback ) ) {
                callback ()
            }
        }
        else {
            var
                request_url = '/aj/doGetProvinceLinkage?province_id=' + province_id

            city_list = [];
            $.get ( request_url, function ( res ) {
                res = $.parseJSON ( res )

                if ( !res[ 'errno' ] ) {

                    var
                        result = res[ 'result' ]

                    $.each ( result[ 'city_list' ], function ( i, item ) {
                        city_list.push ( {
                            city_id   : item[ 'city_id' ],
                            city_name : item[ 'city_name' ]
                        } );

                        // 区县cache
                        CacheAreaList[ item[ 'city_id' ] ]
                            = (item[ 'area_list' ] && item[ 'area_list' ].length)
                            ? item[ 'area_list' ]
                            : []
                    } )
                    // 城市cache
                    CacheCityList[ province_id ] = city_list

                    if ( $.isFunction ( callback ) ) {
                        callback ()
                    }
                }
                else {
                    if ( $.isFunction ( callback ) ) {
                        callback ()
                    }
                }
            } )

        }
    }

    // 设置选中的省市区县
    function setSelect ( province, city, area ) {
        var
            me = this

        // 初始化获取省市区县列表数据
        me.getProvinceList ( function () {
            // 获取省份信息

            var
                province_list = getProvinceListByCache (),
                province_id = getProvinceIdByName ( province, province_list )

            // 根据默认省份获取不到省份id,那么将第一个省份当作默认省
            province_id = province_id || province_list[ 0 ][ 'province_id' ]

            // 设置省份html
            me.setProvinceHtml ( province_list, province_id )

            // 获取区县数据
            me.getCityAreaList ( province_id, function () {
                var
                    city_list = getCityListByCache ( province_id ),
                    // 默认选中的城市id
                    city_id = getCityIdByName ( city, city_list )

                city_id = city_id || city_list[ 0 ][ 'city_id' ]
                // 城市
                me.setCityHtml ( city_list, city_id )

                var area_list = getAreaListByCache ( city_id )

                if(area_list.length){
                    // 默认选中的区县id
                   var area_id = getAreaIdByName ( area, area_list )

                    area_id = area_id || area_list[ 0 ][ 'area_id' ]
                    // 区县
                    me.setAreaHtml ( area_list, area_id )
                }


            } )

        } )
    }

    function init () {
        var
            me = this,
            default_province = me.options.province || window.city_name || '北京',
            default_city = me.options.city || '',
            default_area = me.options.area || ''

        // 设置默认选中省份城市区县
        me.setSelect ( default_province, default_city, default_area )

        // 事件绑定

        // 切换省
        $ ( me.options.selectorProvince ).on ( 'change', function ( e ) {
            var
                $me = $ ( this ),
                province_id = $me.val ()

            me.getCityAreaList ( province_id, function () {

                var
                    city_list = getCityListByCache ( province_id ),
                    city_id = city_list[ 0 ][ 'city_id' ]
                // 城市
                me.setCityHtml ( city_list, city_id )

                var area_list = getAreaListByCache ( city_id )
                if(area_list.length){
                    var area_id = area_list[ 0 ][ 'area_id' ]
                    // 区县
                    me.setAreaHtml ( area_list, area_id )
                }else {
                    var
                        $AreaSelect = me.getAreaSelect ()
                    $AreaSelect.css('display','none')
                    $AreaSelect.children('option').remove()
                }

            } )

        } )

        // 切换城市
        $ ( me.options.selectorCity ).on ( 'change', function ( e ) {
            var
                $me = $ ( this ),
                city_id = $me.val ()

            me.getAreaList ( city_id, function ( area_list ) {

                var
                    area_list = getAreaListByCache ( city_id )
                if(area_list.length ){
                    var area_id = area_list[ 0 ][ 'area_id' ]
                    // 区县
                    me.setAreaHtml ( area_list, area_id )
                }else {
                    var
                        $AreaSelect = me.getAreaSelect ()
                    $AreaSelect.css('display','none')
                    $AreaSelect.children('option').remove()
                }

            } )

        } )

    }


    Bang.AddressSelect = function ( options ) {

        return new AddressSelect ( options )
    }


    //================= private ===================

    // cache中获取省份列表
    function getProvinceListByCache () {

        return CacheProvinceList
    }

    // cache中获取城市列表
    function getCityListByCache ( province_id ) {

        return CacheCityList[ province_id ]
    }

    // cache中获取区县列表
    function getAreaListByCache ( city_id ) {

        return CacheAreaList[ city_id ]
    }

    // 根据省份名称，获取省份id
    function getProvinceIdByName ( province_name, province_list ) {
        if ( !(province_name && $.isArray ( province_list )) ) {
            return
        }
        var
            province_id
        $.each ( province_list, function ( i, item ) {
            if ( province_name == item[ 'province_name' ] ) {
                province_id = item[ 'province_id' ]

                return false
            }
        } )

        return province_id
    }

    // 根据城市名称，获取城市id
    function getCityIdByName ( city_name, city_list ) {
        if ( !(city_name && $.isArray ( city_list )) ) {
            return;
        }
        var
            city_id
        $.each ( city_list, function ( i, item ) {
            if ( city_name == item[ 'city_name' ] ) {
                city_id = item[ 'city_id' ]

                return false
            }
        } )

        return city_id
    }

    // 根据城市名称，获取城市id
    function getAreaIdByName ( area_name, area_list ) {
        if ( !(area_name && $.isArray ( area_list )) ) {
            return;
        }
        var
            area_id
        $.each ( area_list, function ( i, item ) {
            if ( area_name == item[ 'area_name' ] ) {
                area_id = item[ 'area_id' ]

                return false
            }
        } )

        return area_id
    }


} ())
