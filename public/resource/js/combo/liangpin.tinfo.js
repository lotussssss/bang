;/**import from `/resource/js/component/jquery/address_select.js` **/
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


;/**import from `/resource/js/component/placeholder.js` **/
(function(){

	function PlaceHolder(){

		this.init.apply(this,arguments);
	}

	PlaceHolder.prototype = (function(){

		return {

			init:function(element){

				var instance = this;
				CustEvent.createEvents(this);

				var _placeholder = '';
					this.element = W(element);

				if(instance.element && !("placeholder" in document.createElement("input")) && 
					(_placeholder = instance.element.attr("placeholder"))){

			        var eleLabel = W('<label for="'+this.element.attr('id')+'"></label>').addClass('ele4phtips')[0];
			        
			        //插入创建的label元素节点
			        instance.element.parentNode().insertBefore(eleLabel, instance.element[0]);
			        
			        //方法
			        var funOpacity = function(ele, opacity) {
				            if (ele.style.opacity) {
				                ele.style.opacity = opacity / 100;
				            } else {
				                ele.style.filter = "Alpha(opacity="+ opacity +")";    
				            }
				        }, 
				        opacityLabel = function() {
				            if (!instance.element.val()) {
				                funOpacity(eleLabel, 0);
				                eleLabel.innerHTML = _placeholder;
				            } else {
				                eleLabel.innerHTML = "";    
				            }
				        };
			        
			        instance.element
			        	.on('keyup',function(){
			        		opacityLabel(); 
			        	})
			        	.on('focus',function(){
			        		opacityLabel();
			        	})
			        	.on('blur',function(){
			        		if (!instance.element.val()) {
			                funOpacity(eleLabel, 100);
			                eleLabel.innerHTML = _placeholder;  
			            }
			        	})
			        
			        //样式初始化
			        if (!instance.element.val()) { eleLabel.innerHTML = _placeholder; }

				}

			}
		}

	}());

	QW.provide({'PlaceHolder':PlaceHolder});

}())

;/**import from `/resource/js/page/liangpin/inc/promo.js` **/
(function () {
    function bindEvent($promo_wrap, options){
        var flag_click = true;

        tcb.bindEvent($promo_wrap.get(0), {
            //点击使用优惠码/券
            '.need-promo-checkable':function (e){
                var me = $(this),
                    checkbox = me.find('.checkbox'),
                    promo_cont = $('.block-promo-cont'),
                    youhui_code = $promo_wrap.find('[name="youhui_code"]');//hidden input

                //输出优惠券
                // if(flag_click){
                //     getCoupon({
                //         '$tpl':W("#JsPromoTpl"),
                //         '$target' : $promo_wrap.find('.block-promo-cont')
                //     });
                //     flag_click = false;
                // }

                //if (!youhui_code.val()){
                //    if (me.hasClass('need-promo-checked')){
                //        promo_cont.slideUp()
                //        me.removeClass('need-promo-checked')
                //    } else {
                //        promo_cont.slideDown()
                //        me.addClass('need-promo-checked');
                //    }
                //} else {
                //    me.addClass('need-promo-checked');
                //    promo_cont.slideToggle()
                //}

                //优惠码/券展开收起交互
                promo_cont.slideToggle('slow',function (){
                    if (me.hasClass ('need-promo-checked') && !youhui_code.val ()) {
                        me.removeClass ('need-promo-checked');
                    } else {
                        me.addClass ('need-promo-checked');
                    }
                })

            },
            //输入优惠码
            '.code-input':{
                'change':function (e){
                    var me = $(this),
                        btn_use_code = me.siblings('.btn-use-code'),
                        code_tips = $promo_wrap.find('.code-tips');
                    if(me.val().trim().length){
                        btn_use_code.removeClass('btn-disabled');
                    }else{
                        btn_use_code.addClass('btn-disabled');
                    }
                    code_tips.html('');
                },
                'keyup':function (e){
                    var me = $(this),
                        btn_use_code = me.siblings('.btn-use-code'),
                        code_tips = $promo_wrap.find('.code-tips');
                    if(me.val().trim().length){
                        btn_use_code.removeClass('btn-disabled');
                    }else{
                        btn_use_code.addClass('btn-disabled');
                    }
                    code_tips.html('');
                },
                //防止回车直接提交订单表单
                'keydown':function (e){
                    if(e.keyCode == 13){
                        e.preventDefault();
                    }
                }
            },
            //使用优惠码
            '.btn-use-code':function (e){
                e.preventDefault();
                var me = $(this),
                    code_input = me.siblings('.code-input'),
                    youhui_code = $promo_wrap.find('[name="youhui_code"]'),//hidden input
                    coupon_item = $promo_wrap.find('.coupon-able .coupon-item');

                coupon_item.removeClass('coupon-item-checked');
                if(!me.hasClass('btn-disabled')){
                    youhui_code.val(code_input.val()).trigger('change');
                }
            },
            //点击优惠券
            '.coupon-able .coupon-item':function (e){
                var me = $(this),
                    code_tips = $promo_wrap.find('.code-tips'),
                    code_input = $promo_wrap.find('.code-input'),
                    youhui_code = $promo_wrap.find('[name="youhui_code"]');//hidden input

                code_tips.html('');
                code_input.val('');
                if(me.hasClass('coupon-item-checked')){
                    me.removeClass('coupon-item-checked');
                    youhui_code.val('');
                }else{
                    me.addClass('coupon-item-checked').siblings('.coupon-item-checked').removeClass('coupon-item-checked');
                    youhui_code.val(me.attr('data-code'));
                }
                youhui_code.trigger('change');
            }

        })
        //hidden框值改变触发优惠码验证
        $promo_wrap.find('[name="youhui_code"]').on('change', function (){
            //alert('hidden改变啦')
            var me = $(this);
            validPromoCode(me,options);
        })
    }

    //添加优惠券信息
    function addUserPromoInfo($promo_wrap) {
        getCoupon({
            '$tpl':$("#JsPromoTpl"),
            '$target' : $promo_wrap.find('.block-promo-cont'),
            '$youhui_count_wrap': $promo_wrap.find('.youhui-count')
        })
    }

    //更新优惠券信息
    function refreshCoupon(callback) {
        var $promo_wrap = $('.promo-wrap')
        getCoupon({
            '$tpl':$("#JsPromoTpl"),
            '$target' : $promo_wrap.find('.block-promo-cont'),
            '$youhui_count_wrap': $promo_wrap.find('.youhui-count'),
            'callback': callback
        })
    }

    /**
     * 验证优惠码（优惠码优惠券都需验证）
     *
     * @param $obj      提交表单的hidden input框的优惠码
     * @param options
     *          promo_wrap : options['promo_wrap']
     *          service_type : options['service_type'] // 使用优惠码的产品类型，1：自营 ，2：回收，3：优品
     *          price: options['price']||0,
     *          product_id: options['product_id'],
     *          succ: options['succ'],
     *          fail: options['fail']
     */
    function validPromoCode($obj,options){
        var youhui_code_value = $obj.val(),
            $promo_wrap = $(options['promo_wrap']),
            code_tips = $promo_wrap.find('.code-tips'),
            params = {
            'youhui_code': youhui_code_value,
            'service_type': options['service_type'],
            'price': options['price'],
            'product_id': options['product_id']
        };


        $.post(options['url']||'/aj/doGetYouhuiAmount', params,function(res){
            try{
                res = $.parseJSON(res);
            }catch (ex){
                res = {'errno':'error'};
            }

            if(res.errno){
                var errmsg = '抱歉，'+(res.errmsg?res.errmsg+'，':'')+'优惠码验证失败。';
                //alert('错')
                //优惠码验证失败，hidden框清空，显示错误提示
                $obj.val('');
                if(youhui_code_value){
                    code_tips.html(errmsg);
                }

                if(typeof options['fail']==='function') {
                    options['fail']($promo_wrap);
                }
            }else{
                var promo_amount = res.result['promo_amount'] || 0, // 优惠价格
                    promo_per    = res.result['promo_per'] || 0;    // 折扣量
                // 折扣优先
                if (promo_per) {
                    promo_amount = {
                        'promo_per': promo_per
                    }
                }

                var min_sale_price = parseFloat(res.result['full_cut']) || 0; // 最小折扣价

                if(typeof options['succ']==='function'){
                    options['succ'](promo_amount, min_sale_price, $promo_wrap);
                }
                //优惠码验证成功，优惠码和优惠券收起
                $promo_wrap.find('.block-promo-cont').slideUp();
            }
        });
    }

    //获取、输出优惠券数据
    function getCoupon (options) {
        var product_id = tcb.queryUrl(window.location.search, 'product_id'),
            redpacket_code = $('[name="redpacket_code"]').val()

        if (!product_id){
            product_id = window.location.pathname
                .replace('/youpin/product/', '')
                .replace('.html', '')
        }

        $.post ('/youpin/doGetYouhuiCodeList',{
            product_id:product_id,
            redpacket_code:redpacket_code
        }, function (res) {
            try {
                res = $.parseJSON (res);

                if (!res[ 'errno' ]) {

                    var coupon_list_able = res['result']['youhui_list_valid' ],
                        coupon_list_disable = res['result']['youhui_list_invalid'],
                        coupon_list_able_count = coupon_list_able.length;

                    // 获取优惠券列表的html字符串
                    var html_fn = options.$tpl.html().trim().tmpl(),
                        html_str = html_fn ({
                            'list_able': coupon_list_able,
                            'list_disable': coupon_list_disable
                        });

                    // 输出数据
                    options.$target.html (html_str);

                    // //展示可用优惠券的文案
                    if(options.$youhui_count_wrap && options.$youhui_count_wrap.length>0){
                        if(coupon_list_able_count>0){
                            options.$youhui_count_wrap.html(coupon_list_able_count+'张优惠券可用')
                        }else {
                            options.$youhui_count_wrap.html('暂无优惠券可用')
                        }
                    }

                    typeof options.callback==='function' && options.callback(coupon_list_able)

                } else {

                }

            } catch (ex) {}

        });
    }

    window.Promo = function(options){
        //优先使用传入参数
        options = tcb.mix({
            'url': '/aj/doGetYouhuiAmount',
            'service_type': '',
            'price': 0,
            'product_id': '',
            'promo_wrap': '.promo-wrap',//调用未传值使用默认值
            'succ': function(){},
            'fail': function(){}
        }, options, true)

        var $promo_wrap = $(options['promo_wrap'] || '.promo-wrap'),//防止调用传空值覆盖默认值
            $youhui_code = $promo_wrap.find('[name="youhui_code"]');

        if( !($promo_wrap&&$promo_wrap.length) ){
            return;
        }

        // 绑定优惠码验证、操作等事件
        bindEvent($promo_wrap, options);

        //添加优惠券信息
        addUserPromoInfo($promo_wrap)

        // 刷新优惠码验证
        function refreshPromoCode(){
            $youhui_code.trigger('change');
        }
        // 设置商品价格
        function setPrice(price){
            options['price'] = price;
        }
        // 设置商品id
        function setProductId(product_id){
            options['product_id'] = product_id;
        }

        return {
            oWrap: $promo_wrap,
            setPrice: setPrice,                // 设置商品价格
            setProductId: setProductId,        // 设置商品id
            refreshPromoCode: refreshPromoCode, // 刷新优惠码验证
            refreshCoupon:refreshCoupon
        };
    }
}())


;/**import from `/resource/js/page/liangpin/inc/hongbao.js` **/
(function () {
    var product_id = $('[name="product_id"]').val(),
        product_price = $('.orderinfo-totalcount-desc-num').attr('data-origprice'),
        $hongbao_wrap = $('.block-hongbao'),
        $hongbao_cont = $hongbao_wrap.find('.block-hongbao-cont'),
        $hongbao_code = $('[name="redpacket_code"]')

    function bindEvent(options){
        tcb.bindEvent(document.body, {
            //点击"使用红包"
            '.need-hongbao-checkable':function (e){
                var $me = $(this),
                    checkbox = $me.find('.checkbox')

                if(!$.trim($hongbao_cont.html())){
                    return
                }

                // 红包列表展开收起交互
                var code = $hongbao_code.val ()
                $hongbao_cont.slideToggle('slow',function (){
                    if ($me.hasClass ('need-hongbao-checked') && !code) {
                        $me.removeClass ('need-hongbao-checked')
                    } else {
                        $me.addClass('need-hongbao-checked')
                        $hongbao_cont.find('.hongbao-item-able').filter(function () {
                            return $(this).attr('data-code') == code
                        }).addClass('hongbao-item-checked')
                                     .siblings('.hongbao-item').removeClass('hongbao-item-checked')
                    }
                })
            },
            //点击红包
            '.hongbao-item-able':function (e) {
                e.preventDefault()

                var $me = $(this),
                    code = $me.attr('data-code')

                if ($me.hasClass('hongbao-item-checked')) {
                    // 不使用红包
                    $me.removeClass('hongbao-item-checked')
                    $hongbao_code.val('')
                    getHongbaoCount()

                    typeof options.fail === 'function' && options.fail()
                } else {
                    // 使用红包，设置红包被选中
                    setHongbaoChecked({
                        $trigger: $me,
                        code: code,
                        succ: options.succ,
                        fail: options.fail
                    })
                }
            }
        })
    }

    // 设置红包被选中
    function setHongbaoChecked(options) {
        options = options || {}
        var $trigger = options.$trigger
        var code = options.code
        // 使用红包
        validHongbaoCode({
            'code': code,
            'succ': function (hongbao_amount) {
                if ($trigger && $trigger.length) {
                    $trigger.addClass('hongbao-item-checked')
                            .siblings('.hongbao-item').removeClass('hongbao-item-checked')
                }
                $hongbao_code.val(code)
                $('.hongbao-vaild-txt').html('已使用红包抵扣' + hongbao_amount + '元')
                $('.need-hongbao-checkable').addClass ('need-hongbao-checked')

                typeof options.succ === 'function' && options.succ(hongbao_amount)
            },
            'fail': function () {
                typeof options.fail === 'function' && options.fail()
            }
        })
    }

    // 获取红包列表数据
    function getHongbaoList(callback) {
        $.post ('/youpin/doGetRedPacketList',{
            product_id:product_id
        }, function (res) {
            try {
                res = $.parseJSON (res)

                if (!res[ 'errno' ]) {
                    var hongbao_list = res['result'] ||{}

                    typeof callback === 'function' && callback (hongbao_list)
                } else {

                }

            } catch (ex) {}
        })
    }

    // 输出红包列表
    function renderHongbaoList(hongbao_list) {
        var html_fn = $.tmpl($.trim($ ("#JsYoupinHongbaoListTpl").html())),
            html_str = html_fn ({
                'hongbaoList': hongbao_list
            })
        $hongbao_cont.html(html_str)
    }

    //显示可用红包数量
    function getHongbaoCount() {
        getHongbaoList(function (hongbao_list) {
            var hongbao_vaild_count = hongbao_list.youhui_list_valid && hongbao_list.youhui_list_valid.length

            uiSetHongbaoCount(hongbao_vaild_count)
        })
    }

    function uiSetHongbaoCount(hongbao_vaild_count) {
        var $hongbao_vaild_txt = $hongbao_wrap.find('.hongbao-vaild-txt')

        if (hongbao_vaild_count > 0) {
            $hongbao_vaild_txt.html(hongbao_vaild_count + '个红包可用')
        } else {
            $hongbao_vaild_txt.html('暂无可用红包')
        }
    }

    // 验证红包
    function validHongbaoCode(options){
        var params = {
            'code': options.code,
            'price': product_price,
            'product_id': product_id
        }

        $.post('/youpin/doGetRedPacketAmount', params, function(res){
            res = $.parseJSON(res)

            if(!res.errno){
                var hongbao_amount = res.result.promo_amount || 0
                typeof options.succ==='function' && options.succ(hongbao_amount)

                //红包验证成功，收起红包列表
                $hongbao_cont.slideUp()
            }else{
                alert(res.errmsg)

                typeof options.fail==='function' && options.fail()
            }
        })
    }

    function setupHongbaoDefaultChecked(hongbao_list, options) {
        var hongbao = null
        tcb.each(hongbao_list, function (i, item) {
            if (hongbao) {
                if (item.promo_amount > hongbao.promo_amount) {
                    hongbao = item
                }
            } else {
                hongbao = item
            }
        })
        if (hongbao && hongbao.code) {
            setHongbaoChecked({
                code: hongbao && hongbao.code,
                succ: options.succ,
                fail: options.fail
            })
        } else {
            uiSetHongbaoCount()
        }
    }

    window.Hongbao = function(options){
        //优先使用传入参数
        options = tcb.mix({
            'succ': function(){},
            'fail': function(){}
        }, options, true)

        bindEvent(options)
        getHongbaoList(function (hongbao_list) {
            renderHongbaoList(hongbao_list)
            setupHongbaoDefaultChecked(hongbao_list&&hongbao_list['youhui_list_valid'], options)
        })
        // getHongbaoCount()
    }
}())


;/**import from `/resource/js/page/liangpin/tinfo/login.js` **/
// 优品下单页面，登陆
$ ( function () {

    // 登录表单相关功能
    window.Bang.LoginFormByMobile({
        form_action: '/youpin/aj_my_login',
        selector_form: W('#JsTInfoMobileLoginForm'),
        selector_get_secode: '.user-mobile-check-order-panel-getsecode',
        selector_vcode_img: '.vcode-img',
        class_get_secode_disabled: 'user-mobile-check-order-panel-getsecode-disabled'
    }, function(res){
        window.location.href = window.location.href
    })

    // 下单页面登录面板的关闭按钮
    var $BackClose = W('#JsTInfoMobileLoginForm').ancestorNodes('.tinfo-login-panel').query('.btn-go-back-close')
    if ($BackClose && $BackClose.length){
        $BackClose.on('click', function(e){
            e.preventDefault();

            window.history.back();

            setTimeout(function(){
                var query = tcb.queryUrl(window.location.search),
                    product_id = query['product_id'];

                window.location.href = tcb.setUrl2('/youpin/product/'+product_id+'.html', {})
            }, 1000);
        });
    }
} )

;/**import from `/resource/js/page/liangpin/tinfo/addr.js` **/
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

;/**import from `/resource/js/page/liangpin/tinfo/submit.js` **/
// 提交订单
Dom.ready(function(){


    // 验证商品订单提交表单
    function validProductSubOrderForm(wForm){
        if (!(wForm&&wForm.length)) {
            return false;
        }
        var flag = true;

        var wMobileOrder = W('.mobile-order-block');
        if (wMobileOrder.length) {
            var wOrderMobile = W('#MobileOrderMobile'),
                mobile_val = wOrderMobile.val().trim();
            if(!tcb.validMobile(mobile_val)){
                flag = false;
                wOrderMobile.shine4Error().focus();
            }

            var wOrderSecode = W('#MobileOrderSecode'),
                secode_val = wOrderSecode.val().trim();
            if (!secode_val) {
                if (flag) {
                    wOrderSecode.shine4Error().focus();
                } else {
                    wOrderSecode.shine4Error();
                }
                flag = false;
            }
            if (!flag) {
                return flag;
            }
            W('[name="buyer_mobile"]').val(mobile_val);
            W('[name="secode"]').val(secode_val);
        }
        // 收货信息id
        var wYjid = wForm.query('#ProductYJId');
        if (!(wYjid&&wYjid.length&&wYjid.val().trim())) {
            flag = false;
            var wAddAddrInfoForm = W('#AddAddrInfoForm');
            if (wAddAddrInfoForm.length) {
                tcb.setScrollTop(wAddAddrInfoForm.getRect().top-50);
                wAddAddrInfoForm.query('.add-addr-submit').click();
            } else {
                alert('请选择收货人信息');
                tcb.setScrollTop(W('.addrinfo-block-wrap').getRect().top);
            }
            return flag;
        }

        // // 收货信息id
        // var wBankCode = wForm.query('[name="bank_code"]');
        // if (!(wBankCode&&wBankCode.length&&wBankCode.val().trim())) {
        //     flag = false;
        //     var wBankLine = W('.line-bank');
        //     if (wBankLine.length) {
        //         tcb.setScrollTop(wBankLine.getRect().top-42);
        //         tcb.errorBlink(wBankLine.query('li'));
        //     } else {
        //         alert('请选择支付方式');
        //         tcb.setScrollTop(wBankLine.getRect().top-42);
        //     }
        //     return flag;
        // }


        return flag;
    }
    // 提交订单
    var wProductSubOrderForm = W('#LiangpinProductSubOrderForm');
    if (wProductSubOrderForm.length) {

        wProductSubOrderForm.on('submit', function(e){
            e.preventDefault();

            var
                wMe = W(this)
            // 表单处于不可用状态
            if (tcb.isFormDisabled(wMe)){

                return false
            }
            // 将表单置于不可用状态
            tcb.setFormDisabled(wMe)

            if(!validProductSubOrderForm(wMe)){

                // 释放表单的不可用状态
                tcb.releaseFormDisabled(wMe)

                return false
            }

            // 提交异步表单
            tcb.ajax({
                url: wMe[0],
                method: 'post',
                onsucceed: function(res){
                    try {
                        res = JSON.parse (res)

                        if (!res.errno) {

                            var
                                result = res.result,
                                order_id = result.order_id

                            // var
                            //     bank_code_map = [
                            //         // 手机支付宝
                            //         'mobile',
                            //         // 微信扫码支付
                            //         'WXPAY_JS',
                            //         // 货到付款
                            //         'hdfk',
                            //         // 其他支付方式
                            //         'other'
                            //     ],
                            //     bank_code_map_handle = {
                            //         // 手机支付宝
                            //         'mobile'   : OrderSuccessAtMobile,
                            //         // 微信扫码支付
                            //         'WXPAY_JS' : OrderSuccessAtWXPay,
                            //         // 货到付款
                            //         'hdfk'     : OrderSuccessAtHDFK,
                            //         // 其他支付方式
                            //         'other'    : OrderSuccessAtDefault
                            //     },
                            //     // 支付方式代码
                            //     bank_code = wMe.query ('[name="bank_code"]').val ()
                            //
                            // if (tcb.inArray (bank_code, bank_code_map) == -1) {
                            //     bank_code = bank_code_map[ bank_code_map.length - 1 ]
                            // }
                            //
                            // // 执行指定支付方式的处理函数
                            // bank_code_map_handle[ bank_code ] (result)

                            var params = {
                                order_id : order_id
                                },
                                huabei_stage = tcb.queryUrl(window.location.search, 'huabei_stage')
                            if (huabei_stage){
                                params['huabei_stage'] = huabei_stage
                            }
                            window.location.href = tcb.setUrl('/youpin/cashier', params)

                            //location.href = tcb.setUrl('/youpin/subpay/?order_id='+res.result.order_id, {"from": tcb.queryUrl(location.href,'from')});
                        } else {
                            alert (res.errmsg)

                            tcb.releaseFormDisabled (wMe)
                        }
                    } catch (ex) {
                        alert ('系统异常，请刷新页面重试')

                        tcb.releaseFormDisabled (wMe)
                    }
                },
                ontimeout: function(){
                    alert ('系统超时，请刷新页面重试')

                    tcb.releaseFormDisabled (wMe)
                },
                onerror: function(){
                    alert ('系统异常，请刷新页面重试')

                    tcb.releaseFormDisabled (wMe)
                }
            })

        })

    }

    // 开始支付倒计时
    function startPayCountdown(wCountdown){
        var
            curtime = (new Date()).getTime(),
            remain_time = window.remain_time || window.locked_time || 1800; // 倒计时剩余时间

        var lock_endtime = curtime + remain_time*1000;

        Bang.startCountdown(lock_endtime, curtime, wCountdown, {
            'end': function(){
                window.location.reload();
            }
        })
    }
    // 验证支付是否成功
    function validPaySuccess ( order_id, callback ) {
        order_id = order_id || ''

        var
            request_url = '/youpin/doGetPaystatus?order_id='+order_id

        QW.Ajax.get ( request_url, function ( res ) {
            var
            // 支付成功标识
            success_flag = false

            try{
                res = JSON.parse ( res )

                if ( !res[ 'errno' ] ) {

                    var
                        result = res[ 'result' ]

                    if ( result['payStatus']=='1'){
                        success_flag = true
                    }

                    typeof callback === 'function' && callback ( success_flag )

                }
                else {
                    //typeof callback === 'function' && callback ( success_flag )

                    alert ( res[ 'errmsg' ] )
                }

            } catch (ex){

                //typeof callback === 'function' && callback ( success_flag )

            }

        } )
    }

    // 订单提交成功[微信支付]
    function OrderSuccessAtWXPay (result) {
        var
            order_id = result[ 'order_id' ],
            qrCodeSrc = '/youpin/qrcode/?order_id=' + order_id + '&weixin_pay=1'

        var
            html_str = '<div style="padding:10px 10px 0 10px;">'
                + '<div class="pay-countdown js-pay-countdown clearfix" '
                + 'data-descbefore="您只剩" '
                + 'data-descbehind="支付时间" '
                + 'data-daytxt="" '
                + 'data-hourtxt="小时" data-minutetxt="分" data-secondtxt="秒"></div>'
                + '<h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2>'
                + '<div style="text-align:center">'
                + '<img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="' + qrCodeSrc + '">'
                + '</div>'
                + '<div id="WXPayNotSuccessTip" style="display:none;text-align:center;color: #f30;">还未收到您的付款，请稍候再试</div>'
                + '</div>';

        var
            query = tcb.queryUrl (location.href),
            redirect_params = {
                order_id   : order_id,
                from       : query[ 'from' ],
                iframe     : query[ 'iframe' ]
            },
            alertObj = tcb.alert ("微信支付", html_str, {
                btn_name : '已完成支付',
                width    : 300//,
                //height:350
            }, function () {

                validPaySuccess (order_id, function (success) {

                    if (success) {
                        // 支付成功

                        redirect_params['paysuccess'] = 1

                        window.location.href = tcb.setUrl ('/liangpin_my/order_detail', redirect_params)
                    }
                    else {
                        // 未支付成功
                        W ('#WXPayNotSuccessTip').show ()
                    }

                })

                // return false取消关闭panel功能
                return false
            })

        // 关闭弹层跳转到订单详情页面
        alertObj.on ("afterhide", function () {

            window.location.href = tcb.setUrl ('/liangpin_my/order_detail', redirect_params)
        })

        var
            wCountdown = W ('.js-pay-countdown')

        // 开始支付倒计时
        startPayCountdown (wCountdown)

    }

    // 订单提交成功[手机支付]
    function OrderSuccessAtMobile (result) {
        var
            order_id = result[ 'order_id' ],
            qrCodeSrc = '/youpin/qrcode/?order_id=' + order_id

        var
            html_str = '<div style="padding:10px;">' +
                '<h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2>' +
                '<div style="text-align:center">' +
                '<img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="' + qrCodeSrc + '">' +
                '</div></div>'

        var
            query = tcb.queryUrl (location.href),
            redirect_params = {
                order_id   : order_id,
                from       : query[ 'from' ],
                iframe     : query[ 'iframe' ]
            },
            alertObj = tcb.alert ("手机支付宝", html_str, {
            width  : 300,
            height : 350
        }, function () {return true})

        // 关闭弹层跳转到订单详情页面
        alertObj.on ("afterhide", function () {

            window.location.href = tcb.setUrl ('/liangpin_my/order_detail', redirect_params)
        })

    }

    // 订单提交成功[货到付款]
    function OrderSuccessAtHDFK (result) {
        var
            order_id = result[ 'order_id' ],
            tmpl_fn = W ('#JsLiangpinOrderSuccessHDFKPanelTpl').html ().trim ().tmpl (),
            tmpl_st = tmpl_fn ({
                'order_id'         : order_id,
                'order_price'      : result[ 'real_amount' ],
                'customer_name'    : result[ 'yj_receiver' ],
                'customer_mobile'  : result[ 'yj_mobile' ],
                'customer_address' : result[ 'yj_addr' ],
                'url_redirect'     : tcb.setUrl ('/youpin')
            });

        var
            query = tcb.queryUrl (location.href),
            redirect_params = {
                order_id   : order_id,
                from       : query[ 'from' ],
                iframe     : query[ 'iframe' ]
            },
            alertObj = tcb.panel ('', tmpl_st, { 'className' : 'liangpin-pay-confirm-panel-wrap' });

        // 关闭弹层跳转到订单详情页面
        alertObj.on ("afterhide", function () {

            window.location.href = tcb.setUrl ('/liangpin_my/order_detail', redirect_params)
        })

    }

    // 订单提交成功[默认方式提交成功]
    function OrderSuccessAtDefault (result) {

        var
            order_id = result['order_id' ],
            query = tcb.queryUrl (location.href),
            redirect_params = {
                order_id   : order_id,
                from       : query[ 'from' ],
                iframe     : query[ 'iframe' ]
            },
            tmpl_data = {
                'order_id'         : result[ 'order_id' ],
                'order_price'      : result[ 'real_amount' ],
                'customer_name'    : result[ 'yj_receiver' ],
                'customer_mobile'  : result[ 'yj_mobile' ],
                'customer_address' : result[ 'yj_addr' ],
                'url_mod_order'    : tcb.setUrl ('/liangpin_my/order_detail', redirect_params),
                'url_pay_order'    : tcb.setUrl ('/youpin/subpay', redirect_params)
            },
            tmpl_fn = W ('#LiangpinPayConfirmPanelTpl').html ().trim ().tmpl (),
            tmpl_st = tmpl_fn (tmpl_data),
            alertObj = tcb.panel ('', tmpl_st, { 'className' : 'liangpin-pay-confirm-panel-wrap' })

        // 关闭弹层跳转到订单详情页面
        alertObj.on ("afterhide", function () {

            window.location.href = tmpl_data['url_mod_order']
        })

        var
            wCountdown = W ('.js-pay-countdown')

        // 开始支付倒计时
        startPayCountdown (wCountdown)

    }

    
})


;/**import from `/resource/js/page/liangpin/tinfo/invoice.js` **/
;
(function () {

    Dom.ready ( function () {

        var
            // 需要发票选项
            $Checkable = W ( '.need-fapiao-checkable' )

        if ( !($Checkable && $Checkable.length) ) {

            return
        }

        //修改发票信息弹出面板
        function showInvoicInfoePanel(){
            var
                invoice_flag = W ( '[name="invoice_flag"]' ).val () || 10,
                invoice_title_type = W ( '[name="invoice_title_type"]' ).val () || 1,
                invoice_title = W ( '[name="invoice_title"]' ).val () || '个人',
                // invoice_email = W ( '[name="invoice_email"]' ).val () || '',
                invoice_credit_code = W ( '[name="invoice_credit_code"]' ).val () || '',

                html_str = W ( '#JsChangeFapiaoInfoPanelTpl' ).html ().trim ().tmpl () ( {
                    invoice_flag       : invoice_flag,
                    invoice_title_type : invoice_title_type,
                    invoice_title      : invoice_title,
                    // invoice_email      : invoice_email,
                    invoice_credit_code : invoice_credit_code
                } )

            window.changeFapiaoInfoPanel = tcb.panel ( '发票信息', html_str, {
                className : 'change-fapiao-info-panel'
            } );

            new PlaceHolder ( '.fapiao-input-email' );
            new PlaceHolder ( '.fapiao-input-company' );
            new PlaceHolder ( '.fapiao-input-credit-code' );
        }

        tcb.bindEvent ( document.body, {

            /**** 发票发票 ****/
            // 下单页--[ 是否需要发票 ]
            '.need-fapiao-checkable .checkbox'                : function ( e ) {
                e.preventDefault ();

                var checkable = W ( '.need-fapiao-checkable' ),
                    fapiao_tip = W ( '.fapiao-block .block-fapiao-tip' );

                window.__FaPiao_Cache = window.__FaPiao_Cache || {}

                if ( checkable.hasClass ( 'need-fapiao-checked' ) ) {
                    checkable.removeClass ( 'need-fapiao-checked' );
                    fapiao_tip.slideUp()

                } else {
                    checkable.addClass ( 'need-fapiao-checked' );
                    fapiao_tip.slideDown()
                }
            },


            /*===============开具发票已经转移到 m端 订单列表中 以下方法已失效=========*/



            // 下单页--[ 修改发票信息 ]
            // '.fapiao-block .btn-change'                       : function ( e ) {
            //     e.preventDefault ();
            //
            //     showInvoicInfoePanel();
            //
            // },
            // // 发票信息弹窗--[ 切换tab ]
            // '.change-fapiao-info-panel .fapiao-info-tab'      : function ( e ) {
            //     e.preventDefault ();
            //
            //     var
            //         wMe = W ( this ),
            //         wCompany = W ( '.change-fapiao-info-panel .fapiao-input-company-wrap' ),
            //         wCreditCode = W ( '.change-fapiao-info-panel .fapiao-input-credit-code-wrap' ),
            //         wDianZi = W ( '.change-fapiao-info-panel .fapiao-info-dianzi' );
            //
            //     wMe.addClass ( 'fapiao-tab-checked' ).siblings ( '.fapiao-tab-checked' ).removeClass ( 'fapiao-tab-checked' );
            //
            //     //显示隐藏邮箱输入框，电子发票提示
            //     if ( W ( '.fapiao-type-tab-box .fapiao-tab-checked' ).attr ( 'data-val' ) == 10 ) {
            //         wDianZi.show ();
            //
            //     } else {
            //         wDianZi.hide ();
            //     }
            //
            //     //显示隐藏单位输入框
            //     if ( W ( '.fapiao-title-tab-box .fapiao-tab-checked' ).attr ( 'data-val' ) == 10 ) {
            //         wCompany.css ( 'visibility', 'visible' );
            //         wCompany.query ( 'input' ).val ( '' );
            //         wCreditCode.css ( 'visibility', 'visible' );
            //         wCreditCode.query ( 'input' ).val ( '' );
            //     } else {
            //         wCompany.css ( 'visibility', 'hidden' );
            //         wCompany.query ( 'input' ).val ( '个人' );
            //         wCreditCode.css ( 'visibility', 'hidden' );
            //         wCreditCode.query ( 'input' ).val ( '' );
            //     }
            // },
            // // 发票信息弹窗--[ 取消 ]
            // '.change-fapiao-info-panel .btn-cancel'           : function ( e ) {
            //     e.preventDefault ();
            //
            //     window.changeFapiaoInfoPanel.hide ();
            // },
            // // 发票信息弹窗--保存
            // '.change-fapiao-info-panel .btn-save'             : function ( e ) {
            //     e.preventDefault ();
            //
            //     //下单页发票信息
            //     var
            //         invoice_flag_tab = W ( '.change-fapiao-info-panel .fapiao-type-tab-box .fapiao-tab-checked' ),
            //         invoice_flag_txt = invoice_flag_tab.attr ( 'data-txt' ),
            //         invoice_flag_val = invoice_flag_tab.attr ( 'data-val' ); // 发票类型
            //
            //     var invoice_title_type_val = W ( '.fapiao-title-tab-box .fapiao-tab-checked' ).attr ( 'data-val' );
            //
            //     var
            //         invoice_email_txt = '' // 设置电子发票邮箱默认值
            //
            //     //data-val=1 普通发票（纸质） data-val=10 电子发票
            //     if ( invoice_flag_val == 1 ) {
            //         invoice_flag_txt = invoice_flag_txt + '（纸质）';
            //     }
            //     else {
            //         //invoice_flag_txt = invoice_flag_txt;
            //
            //         //邮箱   2018-1-23 需求：取消填写邮箱
            //         // var invoice_email = W ( '.change-fapiao-info-panel .fapiao-input-email' );
            //         // invoice_email_txt = invoice_email.val ().trim ();
            //         //
            //         // if ( !validEmail ( invoice_email_txt ) ) {
            //         //     invoice_email.shine4Error ();
            //         //     return;
            //         // }
            //     }
            //
            //     //公司抬头
            //     var invoice_title_tab = W ( '.change-fapiao-info-panel .fapiao-input-company' );
            //     var invoice_title_txt = invoice_title_tab.val ().trim ();
            //
            //     if ( !invoice_title_txt ) {
            //         invoice_title_tab.shine4Error ();
            //         return;
            //     }
            //
            //     // 信用代码
            //     if ( invoice_title_type_val == 10 ) {
            //         var invoice_credit_code_tab = W ( '.change-fapiao-info-panel .fapiao-input-credit-code' );
            //         var invoice_credit_code_txt = invoice_credit_code_tab.val ().trim ();
            //
            //         if ( !validCreditCode(invoice_credit_code_txt) ) {
            //             invoice_credit_code_tab.shine4Error ();
            //             return;
            //         }
            //     }
            //
            //     W ( '[name="invoice_flag"]' ).val ( tcb.html_encode ( invoice_flag_val ) );
            //     W ( '[name="invoice_title_type"]' ).val ( tcb.html_encode ( invoice_title_type_val ) );
            //     W ( '[name="invoice_title"]' ).val ( tcb.html_encode ( invoice_title_txt ) );
            //     // W ( '[name="invoice_email"]' ).val ( tcb.html_encode ( invoice_email_txt ) );
            //     W ( '[name="invoice_credit_code"]' ).val ( tcb.html_encode ( invoice_credit_code_txt||'' ) );
            //
            //     W ( '.fapiao-block .fapiao-type' ).html ( tcb.html_encode ( invoice_flag_txt ) );
            //     //W('.fapiao-block .fapiao-type').html( invoice_flag_txt );
            //     W ( '.fapiao-block .fapiao-title' ).html ( tcb.html_encode ( invoice_title_txt ) );
            //     window.changeFapiaoInfoPanel.hide ();
            //
            //     //点击确认后下单页显示发票信息
            //     W ( '.need-fapiao-checkable' ).addClass ( 'need-fapiao-checked' );
            //     W ( '.fapiao-block .fapiao-info' ).css ( 'visibility', 'visible' );
            //     W ( '[name="invoice_need"]' ).val ( '10' );
            // },
            // // 限制发票抬头单位填写字数
            // '.change-fapiao-info-panel .fapiao-input-company' : {
            //     'keyup'  : function ( e ) {
            //         var $me = W ( this ),
            //             invoice_title = $me.val ().trim ();
            //         if ( invoice_title.length > 50 ) {
            //             alert ( '请输入50字以内！' );
            //             $me.val ( invoice_title.substring ( 0, 50 ) );
            //         }
            //     },
            //     'change' : function ( e ) {
            //         var $me = W ( this ),
            //             invoice_title = $me.val ().trim ();
            //         if ( invoice_title.length > 50 ) {
            //             alert ( '请输入50字以内！' );
            //             $me.val ( invoice_title.substring ( 0, 50 ) );
            //         }
            //     }
            // }
            /**** 发票发票end ****/


        } )

    } )

    // 验证邮箱
    function validEmail(txt){
        var
            emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i

        return emailRegExp.test(txt) ? true : false
    }

    function validCreditCode(credit_code) {
        var flag = true

        if (credit_code.length!==15 && credit_code.length!==18){
            flag = false
            alert('纳税识别号或统一信用代码只能为15或18位')
        } else if (!(/^[\d\w]+$/.test(credit_code))){
            flag = false
            alert('纳税识别号或统一信用代码只能包含数字或字母')
        }

        return flag
    }

} ())

;/**import from `/resource/js/page/liangpin/tinfo/vip_user_sf_free.js` **/
!function () {
    if (window.__PageSymbol != 'tinfo') {
        return
    }

    Dom.ready (function () {
        var wCover = W ('.panel-cover-vip-user-sf-free')
        var wPanel = W ('.panel-vip-user-sf-free')

        function showPanelVipUserSFFree () {
            if (QW.Cookie.get ('tinfo_vip_user_sf_free_not_show_again')) {
                return
            }

            wCover.show ()
            wPanel.show ()
            resetPosition ()
        }

        function bindEvent () {
            tcb.bindEvent (document.body, {
                '.btn-confirm-vip-user-sf-free' : function (e) {
                    e.preventDefault ()

                    if (W ('[name="not_show_again"]').attr ('checked')) {
                        QW.Cookie.set ('tinfo_vip_user_sf_free_not_show_again', '1')
                    }
                    wCover.fadeOut ()
                    wPanel.fadeOut ()
                }
            })
        }

        // 重置登录框的位置
        function resetPosition () {
            var rect = wPanel.getRect (),
                width = rect[ 'width' ],
                win_rect = QW.DomU.getDocRect (),
                win_width = win_rect[ 'width' ],
                doc_width = win_rect[ 'scrollWidth' ],
                doc_height = win_rect[ 'scrollHeight' ],
                left = (win_width - width) / 2

            if (left > 0) {
                wPanel.css ({
                    'left' : left,
                    'margin' : '0'
                })
            }
            wCover.css ({
                'width' : doc_width,
                'height' : doc_height
            })
        }


        function init () {
            showPanelVipUserSFFree ()
            bindEvent ()
        }

        if (wPanel && wPanel.length) {
            init ()
        }

    })

} ()

;/**import from `/resource/js/page/liangpin/tinfo/tinfo.js` **/
// 提交订单页面交互
(function(){

    Dom.ready(function(){

        var Bang = window.Bang = window.Bang || {};

        // 价格计算对象
        var wProductPriceInfo = W('.orderinfo-totalcount-desc-num');
        var PriceCalculateObj = Bang.PriceCalculate({
            'origin_price': wProductPriceInfo.attr('data-origprice')
        });

        var wAddedServerConfirmPanel;   // 附加服务确认选择面板

        tcb.bindEvent(document.body, {
            // 手机直接下单，获取验证码
            //'.get-mobile-order-secode': function(e){
            //    e.preventDefault();
            //    var wMe = W(this),
            //        txt = wMe.html();
            //
            //    if(wMe.hasClass('get-mobile-order-secode-disabled')){
            //        return;
            //    }
            //
            //    var wMobile = W('#MobileOrderMobile');
            //    if (wMobile.length) {
            //        var mobile = wMobile.val();
            //
            //        if(!tcb.validMobile(mobile)){
            //            wMobile.shine4Error().focus();
            //            return;
            //        }
            //
            //        QW.Ajax.post('/aj/send_lpsecode/', {'mobile' : mobile}, function(res){// [接口废弃]此处js已无处使用
            //            res = QW.JSON.parse(res);
            //            if(res.errno){
            //                alert('抱歉，出错了。'+res.errmsg);
            //            }else{
            //
            //                wMe.addClass('get-mobile-order-secode-disabled').html('60秒后再次发送');
            //                tcb.distimeAnim(60, function(time){
            //                    if(time<=0){
            //                        wMe.removeClass('get-mobile-order-secode-disabled').html(txt);
            //                    }else{
            //                        wMe.html( time + '秒后再次发送');
            //                    }
            //                });
            //            }
            //        });
            //    }
            //},
            // 选择支付方式(方式一)
            '.payinfo-block .payinfo-bank-code': function(e){
                var wMe = W(this),
                    wBankLine = W('.line-bank'),
                    wBankCode = W('[name="bank_code"]');

                if (wMe.val()==='wangyin') {
                    wBankLine.slideDown();
                    var wSelected = wBankLine.query('.selected');
                    if (wSelected.length) {
                        wBankCode.val(wSelected.attr('data-code'));
                    } else {
                        wBankCode.val('')
                    }
                } else {
                    wBankLine.slideUp();
                    wBankCode.val(wMe.val());
                }
            },
            // 选择银行(方式一)
            '.payinfo-block .bank-list li': function(e){
                e.preventDefault();

                var wMe = W(this);

                wMe.addClass('selected').siblings('li').removeClass('selected');

                W('[name="bank_code"]').val(wMe.attr('data-code'));
            },
            // 选择支付方式(方式二)
            '.payinfo-block2 .payinfo-bank-code': function(e){
                var wMe = W(this),
                    wBankLine = W('.line-bank'),
                    wBankCode = W('[name="bank_code"]');

                if (wMe.val()==='wangyin') {
                    wBankLine.slideDown();
                    var wSelected = wBankLine.query('[name="banklist"]');
                    if (wSelected.length) {
                        wBankCode.val(wSelected.val());
                    } else {
                        wBankCode.val('')
                    }
                } else {
                    wBankLine.slideUp();
                    wBankCode.val(wMe.val());
                }

            },
            // 选择支付方式(方式三)
            '.payinfo-block3 .pay-label': function(e){
                var wMe = W(this),
                    wInput = wMe.query('input'),
                    wBankLine = W('.line-bank'),
                    wBankCode = W('[name="bank_code"]');

                if(wMe.query('span').hasClass('pay-daofu-disabled')){
                    return;
                }
                wInput.attr('checked', true);

                var
                    bank_code = wInput.val();

                if (bank_code==='wangyin') {
                    // 网银支付
                    wBankLine.slideDown();
                    var wSelected = wBankLine.query('[name="banklist"]');
                    if (wSelected.length) {
                        wBankCode.val(wSelected.val());
                    } else {
                        wBankCode.val('')
                    }
                } else {
                    // 其他支付[支付宝\微信\货到付款 等]
                    wBankLine.slideUp();
                    wBankCode.val(bank_code);
                }

                var
                    pay_tip_str = '<span style="color: #ff0000;">在线支付，全国包邮！</span>如遇问题，请加qq群：488049033，咨询“优品答疑”'

                if (bank_code==='hdfk'){
                    pay_tip_str = '<span style="color: #ff0000;">货到付款：不包邮，邮费到付！</span>（香港，澳门，台湾地区暂不支持货到付款）'
                }
                W('.zhifu-tips').html(pay_tip_str);

                wMe
                    .addClass('pay-label-checked')
                    .siblings('.pay-label-checked').removeClass('pay-label-checked');
            },
            // 选择银行(方式二)
            '.payinfo-block2 .line-bank [name="banklist"], .payinfo-block3 .line-bank [name="banklist"]': {
                'change': function(e){
                    var wMe = W(this);

                    W('[name="bank_code"]').val(wMe.val());

                }
            },

            // 选择附加服务
            '.added-server-list-checklable': function(e){
                e.preventDefault();

                var wMe = W(this),
                    added_title = wMe.query('.added-server-name').html().trim(),
                    added_img = wMe.attr('data-img'),
                    added_extend_img = wMe.attr('data-extend-img'),
                    added_extend_img_id = wMe.attr('data-extend-img-id'),
                    wServ = wMe.query('[name="value_added_server_list[]"]'),
                    added_id = wServ.val(),
                    added_info = wMe.ancestorNode('.added-server-list-checklable-wrap').siblings('.added-server-info');

                if(wMe.hasClass('added-server-list-checklable-checked')){
                    wMe.removeClass('added-server-list-checklable-checked');
                    wServ.attr('checked', false);

                    added_info.hide();

                    // 重新设置总价
                    setTotalPrice('price_added_server_'+added_id, 0, 0, Promo.oWrap);

                } else {
                    var str = W('#JsLiangPinAddedServerConfirmPanelTpl').html().tmpl()({
                        'added_id': added_id,
                        'added_title': added_title,
                        'added_img': added_img,
                        'added_extend_img': added_extend_img,
                        'added_extend_img_id': added_extend_img_id
                    });

                    wAddedServerConfirmPanel = tcb.panel('', str, {className:'extendservice-confirm-panel-wrap'});
                }

            },
            // 确认附加服务选择
            '.extendservice-confirm-panel-wrap .btn-confirm': function(e){
                e.preventDefault();

                var $me = W(this),
                    added_id = $me.attr('data-id');

                var wChecklable = W('.added-server-list-checklable').filter(function(el){
                        return W(el).attr('data-id')==$me.attr('data-id');
                    }),
                    wServ = wChecklable.query('[name="value_added_server_list[]"]'),
                    added_info = wChecklable.ancestorNode('.added-server-list-checklable-wrap').siblings('.added-server-info');

                wChecklable.addClass('added-server-list-checklable-checked');
                wServ.attr('checked', true );
                // 重新设置总价
                setTotalPrice('price_added_server_'+added_id, wChecklable.attr('data-plusprice'), 0, Promo.oWrap);

                if(wAddedServerConfirmPanel && wAddedServerConfirmPanel.hide){
                    wAddedServerConfirmPanel.hide();
                }
                added_info.show();
            },
            // 取消不选择附加服务
            '.extendservice-confirm-panel-wrap .btn-cancel': function(e){
                e.preventDefault();

                if(wAddedServerConfirmPanel && wAddedServerConfirmPanel.hide){
                    wAddedServerConfirmPanel.hide();
                }

            },
            // 显示扩展协议
            '.extendservice-confirm-panel-wrap .js-open-another-dialog': function(e){
                e.preventDefault();

                var $me = W(this),
                    extend_id = $me.attr('data-extend-id');

                var html_str = '';
                // 无忧换机服务协议
                if (extend_id=='JsWuYouHuanJiAgreementPanelTpl'){
                    html_str = W('#JsWuYouHuanJiAgreementPanelTpl').html().trim().tmpl()();
                }

                tcb.panel('', html_str, {
                    className:'extendservice-agreement-panel panel-tom01'
                });
            }

        });

        function clearCheckedCache(){
            setTimeout(function(){
                W('.added-server-list-checklable').forEach(function(el, i){
                    var wMe = W(el)
                    if (!wMe.hasClass('added-server-list-checklable-checked')){
                        wMe.query('input').attr('checked', false)
                    }
                })
            },10)
        }
        clearCheckedCache()

        // 使用优惠码
        var promo = Promo({
            'service_type': 3,
            'price': $('.orderinfo-totalcount-desc-num').attr('data-origprice'),
            'product_id': $('[name="product_id"]').val(),
            'promo_wrap': '.promo-wrap',
            'succ': function(youhuiPrice, min_sale_price, $promo_wrap){

                // 为对象表示为折扣优惠，否则是优惠金额
                if (typeof youhuiPrice == 'object') {

                    PriceCalculateObj.deleteProductPriceInfoByProp('price_promo');

                    setTotalPrice('origin_price_promo_per', youhuiPrice['promo_per'], min_sale_price, $promo_wrap);

                } else {

                    PriceCalculateObj.deleteProductPriceInfoByProp('origin_price_promo_per');

                    setTotalPrice('price_promo', -youhuiPrice, min_sale_price, $promo_wrap);
                }
            },
            'fail': function($promo_wrap){

                PriceCalculateObj.deleteProductPriceInfoByProp('origin_price_promo_per');

                setTotalPrice('price_promo', 0, 0);
            }
        })

        var hongbao = Hongbao({
            'succ': function(hongbao_amount){
                var $youhui_code = $('[name="youhui_code"]'),
                    youhui_code = $youhui_code.val()

                promo.setPrice(PriceCalculateObj.getProductOriginPrice() - hongbao_amount)

                promo.refreshCoupon(function(coupon_list_able){
                    var flag_has_code = false

                    tcb.each(coupon_list_able, function (i, item) {

                        if(youhui_code==item.code){
                            flag_has_code = true

                            $('[data-code='+youhui_code+']').addClass('coupon-item-checked')
                        }
                    })

                    if(!flag_has_code){
                        $youhui_code.val('')
                        $('.need-promo-checked').removeClass('need-promo-checked')

                        promo.refreshPromoCode()
                    }
                })

                setTotalPrice('price_hongbao', -hongbao_amount)
            },
            'fail': function(){
                var $youhui_code = $('[name="youhui_code"]'),
                    youhui_code = $youhui_code.val()

                promo.setPrice(PriceCalculateObj.getProductOriginPrice() - 0)

                promo.refreshCoupon(function(coupon_list_able){
                    tcb.each(coupon_list_able, function (i, item) {

                        if(youhui_code==item.code){
                            $('[data-code='+youhui_code+']').addClass('coupon-item-checked')
                        }
                    })
                })

                setTotalPrice('price_hongbao', 0)
            }
        })

        // 设置总价+优惠码文案(传入参数为价格增加的变量，当传入负值，表示减去价格)
        function setTotalPrice(prop, plus_price, min_sale_price, $usePromoWrap){

            var orig_price = PriceCalculateObj.getProductOriginPrice();

            PriceCalculateObj.setProductPriceInfo(prop, plus_price);

            var fina_price = PriceCalculateObj.calculateProductPrice();

            fina_price  = Math.max( 0, tcb.formatMoney( fina_price, 2, -1) );

            // 总价格设置
            var price_str = '￥'+ fina_price;
            //if(orig_price != fina_price){
            //    price_str = '<del>￥'+orig_price+'</del> ￥'+ fina_price;
            //}
            $('.orderinfo-totalcount-desc-num').html(price_str);

            // 设置商品价格列表
            setProductPriceList();

        }
        setProductPriceList();
        // 设置商品价格列表
        function setProductPriceList(){
            var
                p = PriceCalculateObj,

                origin_price = p.getProductOriginPrice(),
                price_hongbao = p.getProductPriceInfoByProp('price_hongbao') || 0,
                price_promo = p.getProductPriceInfoByProp('price_promo') || 0,
                origin_price_promo_per = p.getProductPriceInfoByProp('origin_price_promo_per') || 0

            price_hongbao = Math.abs(price_hongbao || 0)
            //价格列表-红包抵扣
            $('.hongbao-price').html('-￥'+price_hongbao.toFixed(2))

            // 有折扣的话优先计算折扣
            if(origin_price_promo_per){
                price_promo = tcb.formatMoney( origin_price*(100-origin_price_promo_per)/100, 0, 1)
            }

            price_promo = Math.abs(price_promo || 0)

            //价格列表-商品原价
            $('.product-price').html('￥'+origin_price)

            var
                color = price_promo > 0 ? '#FE4B00' : '#333'
            //价格列表-优惠折扣
            $('.discount-price').html('-￥'+price_promo.toFixed(2))

            //价格列表-附加服务
            var
                extend_service_price_sum = 0
            $('.added-server-list-checklable-checked').each(function(index,el){
                var
                    me = $(el)

                extend_service_price_sum += me.attr('data-plusprice') - 0
            })
            $('.extend-service-price').html('￥'+extend_service_price_sum.toFixed(2))
        }

        // 默认选中第一个支付方式
        var
            $PayLabel = W ( '.payinfo-block3 .pay-label' )
        if ( $PayLabel && $PayLabel.length ) {
            $PayLabel.first ().fire ( 'click' )
        }
        // 重置登录框的位置
        function resetLoginPanelPosition () {
            var
                $LoginPanel = W ('.tinfo-login-panel')
            if ($LoginPanel && $LoginPanel.length) {

                var
                    rect = $LoginPanel.getRect (),
                    width = rect[ 'width' ],
                    win_rect = QW.DomU.getDocRect (),
                    win_width = win_rect[ 'width' ],
                    doc_width = win_rect[ 'scrollWidth' ],
                    doc_height = win_rect[ 'scrollHeight' ],
                    left = (win_width - width) / 2

                if (left > 0) {
                    $LoginPanel.css ({
                        'left'   : left,
                        'margin' : '0'
                    })
                }

                var
                    $LoginPanelMask = W ('.tinfo-login-cover')

                $LoginPanelMask.css ({
                    'width'  : doc_width,
                    'height' : doc_height
                })
            }
        }

        resetLoginPanelPosition ()

    });

    // 设置下单按钮行浮动效果
    function setSubmitLineFloat(){
        var submit_btn = $('.line-submit'),
            submit_btn_placeholder = $('.line-submit-placeholder')

        if (submit_btn.length && submit_btn_placeholder.length){
            $(window).on('scroll resize',function(){
                var
                    submit_btn_top = submit_btn_placeholder.offset().top + submit_btn.height(),
                    win_height = $(window).height(),
                    min_scroll_h =  submit_btn_top -win_height,
                    scroll_h = $(window).scrollTop();

                if(scroll_h<=min_scroll_h){
                    submit_btn.css({'position':'fixed','left':'50%','margin-left':'-600px','bottom':'0'});
                }else{
                    submit_btn.css({'position':'static','margin-left':'0px'});
                }
            });
        }
    }
    setSubmitLineFloat()

}());


