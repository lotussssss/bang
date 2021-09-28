;/**import from `/resource/js/component/m/countdown.js` **/
// 倒计时
(function(){
    var Bang = window.Bang = window.Bang || {};

    Bang.countdown_desc = '剩余';
    Bang.startCountdown = startCountdown;

    /**
     * 拍卖倒计时（开始或者结束）
     * @param targettime 倒计时结束的目标时间（时间戳）
     * @param curtime 当前时间（时间戳）（会随着倒计时变化）
     * @param $target
     */
    function startCountdown(targettime, curtime, $target, callbacks){
        if(!targettime || !curtime || curtime>targettime){
            return ;
        }
        callbacks = callbacks || {};

        var duration = Math.floor( (targettime - curtime)/1000 ),// 时间间隔，精确到秒，用来计算倒计时
            client_duration = getClientDuration(targettime); // 当前客户端和结束时间的时间差（用来作为参考点修正倒计时误差）

        var fn_countdown = $.tmpl( $.trim( $('#JsMCountdownTpl').html() ) );

        // 倒计时ing
        typeof callbacks.start === 'function' && callbacks.start();

        function countdown(){
            if ( !($target&&$target.length) ) {
                return false
            }
            var d = Math.floor(duration/86400), // 天
                h = Math.floor((duration-d*86400)/3600), // 小时
                m = Math.floor((duration-d*86400-h*3600)/60), // 分钟
                s = duration - d*86400 - h*3600 - m*60; // 秒

            var desc_before = $target.attr('data-descbefore')||Bang.countdown_desc||'', // 前置文字说明
                desc_behind = $target.attr('data-descbehind')||'', // 后置文字说明
                day_txt    = $target.attr('data-daytxt') || '天 ',
                hour_txt   = $target.attr('data-hourtxt') || ':',
                minute_txt = $target.attr('data-minutetxt') || ':',
                second_txt = $target.attr('data-secondtxt') || '',
                hour_mode = !!$target.attr('data-hour-mode') // 小时模式

            if (hour_mode) {
                h = d * 24 + h
                d = 0
            }

            var html_str = fn_countdown({
                'day': fix2Length(d),
                'day_txt': day_txt,
                'hour': fix2Length(h),
                'hour_txt': hour_txt,
                'minute': fix2Length(m),
                'minute_txt': minute_txt,
                'second': fix2Length(s),
                'second_txt': second_txt,
                'desc_before': desc_before,
                'desc_behind': desc_behind
            });
            $target.html(html_str);

            // 倒计时ing
            typeof callbacks.process === 'function' && callbacks.process(curtime);

            duration = duration - 1;
            client_duration = client_duration - 1000;
            curtime = curtime + 1000;

            //duration = duration<1 ? 0 : duration;
            return true;
        }
        countdown();
        var timerId = setTimeout(function(){
            var flag = countdown();
            if (!flag) {
                return ;
            }
            if(duration>-1){
                var next_time = getClientDuration(targettime) - client_duration;
                if (next_time<0) {
                    next_time = 0;
                }
                timerId = setTimeout(arguments.callee, next_time);
            } else {
                // 倒计时结束
                typeof callbacks.end === 'function' && callbacks.end();
            }
        }, 1000);
        return function(){
            clearTimeout(timerId)
            timerId = null
        }
    }
    /**
     * 修复为2个字符长度，长度不足以前置0补齐;
     * @return {[type]} [description]
     */
    function fix2Length(str){
        str = str.toString();
        return str.length < 2 ? '0' + str : str;
    }
    /**
     * 获取当前客户端时间相对结束时间的时间间隔（精确到毫秒）
     * @returns {*|number}
     */
    function getClientDuration(targettime){
        return targettime - (new Date()).getTime();
    }

}());

;/**import from `/resource/js/component/m/swipesection.js` **/
// swipe section
(function () {
    window.Bang = window.Bang || {}

    var noop = function () {}

    window.QUEUE = window.QUEUE || {}
    window.QUEUE_MAP = window.QUEUE_MAP || {}
    var
        flag_animating = false,
        _MAX_Z_INDEX = 10000,
        _MASK_Z_INDEX = 9999

    function pushQueue (target, queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        Queue.push (target);

        return Queue.length - 1;
    }

    function popQueue (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue.pop ();
    }

    function shiftQueue (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue.shift ();
    }

    function getQueueTargetBy (pos, queue_name) {
        pos = parseInt (pos, 10);
        pos = pos
            ? pos
            : 0;
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }

        return Queue[ pos ];
    }

    function getQueueLast (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        var last = Queue.length - 1;

        return last > -1
            ? Queue[ last ]
            : null;
    }
    function getQueue(queue_name){
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue
    }

    function getSwipeSection (el) {
        var $el, class_str = '';
        if (el) {
            $el = $ (el);
            if (!($el && $el.length) && (typeof el === 'string')) {
                class_str = el.replace (/\./g, '');
            }
        }

        if (!($el && $el.length)) {
            var wrap_str = class_str
                ? '<section id="SwipeSection' + tcb.genRandomNum () + '" class="swipe-section pre-swipe-right-hide b-left ' + class_str + '"><a href="#" class="swipe-section-close iconfont icon-close"></a><div class="swipe-section-inner"></div></section>'
                : '<section id="SwipeSection' + tcb.genRandomNum () + '" class="swipe-section pre-swipe-right-hide b-left"><a href="#" class="swipe-section-close iconfont icon-close"></a><div class="swipe-section-inner"></div></section>';
            $el = $ (wrap_str).appendTo (document.body);

            // 关闭swipe secition
            $el.find ('.swipe-section-close').on ('click', function (e) {
                e.preventDefault ();

                backLeftSwipeSection ();
            });
        }

        // 将对象加入处理队列
        pushQueue ($el);

        return $el;
    }

    // 填充swipe section的内容
    function fillSwipeSection (html_str) {
        html_str = html_str
            ? html_str
            : '';
        var $swipe = getQueueLast ();
        if ($swipe && $swipe.length) {
            $swipe.find ('.swipe-section-inner').html (html_str);
        }
    }

    // 执行向左滑动
    function doLeftSwipeSection (percent, callback) {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }
        percent = parseFloat (percent)

        var // 内部元素的宽度
            inner_percent = percent
                ? 100 - percent
                : 100

        percent = percent
            ? percent + '%'
            : '0'
        inner_percent = inner_percent
            ? inner_percent + '%'
            : '100%'


        var $swipe = getQueueLast ();
        if ($swipe && $swipe.length) {
            var $body = $ (document.body);
            if (window.Bang.SwipeSection.ohidden && !$body.hasClass ('ohidden')) {
                $body.addClass ('ohidden');
            }

            showMask ()

            // 滑动之前将滑动标识设置为true,以用于表示在滑动ing,以方便其他的操作进行判断
            flag_animating = true

            $swipe.css ({
                'display' : 'block',
                'z-index' : _MAX_Z_INDEX++
            }).animate ({ 'translateX' : percent }, 500, 'ease', function () {

                // 滑动结束,释放滑动锁定标识
                flag_animating = false

                typeof callback === 'function' && callback ()
            })

            $swipe.find ('.swipe-section-inner').css ({
                'width' : inner_percent
            })
            $swipe.find ('.swipe-section-close').css ({
                'right' : percent
            })
            tcb.js2AndroidSetDialogState(true, function(){
                backLeftSwipeSection()
            })
        }
    }

    // 向左滑动的层，返回原处
    function backLeftSwipeSection (callback, flag_static) {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }

        var $swipe = popQueue ()
        if ($swipe && $swipe.length) {
            var $body = $ (document.body)
            if ($body.hasClass ('ohidden')) {
                $body.removeClass ('ohidden')
            }

            hideMask ()

            if (flag_static){
                typeof callback === 'function' && callback ()

                $swipe.remove ()
                $swipe = null
                return
            }
            $swipe.animate ({ 'translateX' : '100%' }, 300, 'ease', function () {
                typeof callback === 'function' && callback ()

                $swipe.remove ()
                $swipe = null
            })
            tcb.js2AndroidSetDialogState(false)
        }
    }

    // 除了最后一个，关闭其他显示的滑层
    function closeAllExceptLast () {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }
        var Queue = getQueue ()

        var $swipe
        while (Queue.length > 1) {
            $swipe = shiftQueue ()
            if ($swipe && $swipe.length) {
                $swipe.remove ()
                $swipe = null
                tcb.js2AndroidSetDialogState(false)
            }
        }
    }

    // 获取最后一个swipe section
    function getLastSwipeSection () {

        return getQueueLast ()
    }

    // 显示透明遮罩层
    function showMask () {
        var
            $Mask = $ ('#SwipeSectionMask')
        if (!($Mask && $Mask.length)) {
            var
                mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:' + _MASK_Z_INDEX + ';display: block;width: 100%;height: 100%;background:transparent;',
                mask_html = '<a id="SwipeSectionMask" href="#" style="' + mask_css + '"></a>'

            $Mask = $ (mask_html).appendTo (document.body);

            $Mask.on ('click', function (e) {
                e.preventDefault ()

                backLeftSwipeSection ()
            })
        }

        $Mask.show ()
    }

    // 隐藏透明遮罩层
    function hideMask () {
        var
            $Mask = $ ('#SwipeSectionMask')
        if ($Mask && $Mask.length) {

            $Mask.hide ()
        }
    }

    window.Bang.SwipeSection = {
        ohidden              : true,
        getSwipeSection      : getSwipeSection, /*获取swipe secition对象，加入队列queue*/
        fillSwipeSection     : fillSwipeSection, /*填充swipe section的内容*/
        doLeftSwipeSection   : doLeftSwipeSection, /*执行向左滑动*/
        backLeftSwipeSection : backLeftSwipeSection, /*向左滑动的层，返回原处*/
        closeAllExceptLast   : closeAllExceptLast,
        getLastSwipeSection  : getLastSwipeSection,
        getQueue : getQueue
    }

} ())


;/**import from `/resource/js/component/m/address_select.js` **/
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


;/**import from `/resource/js/component/m/picker.js` **/
;(function () {
    var
        Bang = window.Bang = window.Bang || {}

    var
        defaults = {
            // 实例化的时候自动执行init函数
            flagAutoInit     : true,
            // 是否需要搜索筛选
            flagFilter       : false,
            // 触发器
            selectorTrigger  : '.picker-trigger',

            col: 1,
            // 渲染数据
            data: [],
            // 渲染数据标题，默认为空
            dataTitle: [],
            // 被选中的位置（默认都是0）
            dataPos: [],

            callbackTriggerBefore : null,
            // 回调函数(确认/取消)
            callbackConfirm : null,
            callbackCancel  : null
        }

    function Picker (options) {
        var me = this

        options = $.extend ({}, defaults, options)

        me.options = options

        if (!tcb.isArray (me.options.dataFilter)) {
            me.options.dataFilter = []
        }

        me.__uniqueId = tcb.genRandomNum()
        me.__wrapId = 'UIComponentPicker'+me.__uniqueId
        me.__maskId = 'UIComponentPickerMask'+me.__uniqueId

        if (me.options.flagAutoInit) {

            me.init ()
        }
    }

    // 设置原型方法
    Picker.prototype = {

        constructor : Picker,

        getTrigger : getTrigger,

        bindEvent     : bindEvent,

        doSelect : doSelect,
        doShow   : doShow,
        doHide   : doHide,

        render: render,

        init : init
    }

    // 获取触发器
    function getTrigger () {
        var
            me = this,
            selectorTrigger = me.options.selectorTrigger

        me.__Trigger = me.__Trigger || $ (selectorTrigger)

        return me.__Trigger
    }

    // 设置被选中的item位置
    function doSelect () {
        var me = this,
            options = me.options,
            data = options.data,
            $selected = __getWrap.apply (me).find ('.selected')

        $selected.each (function (i, el) {
            var $el = $(el),
                name = $el.attr('data-name')

            $.each(data[i], function(ii, item){
                if (item['name']==name){
                    options.dataPos[i] = ii
                }
            })
        })
    }

    // 显示
    function doShow () {
        var me = this,
            $wrap = me.render()

        // 显示遮罩层
        __showMask.apply(me)

        $wrap.css ({
            'position' : 'fixed',
            'left'     : '0',
            'top'      : '100%',
            'z-index'  : tcb.zIndex (),
            'width'    : '100%'
        })

        //如果为android4.0以下系统，由于不支持部分CSS动画，需要特别处理
        if ($.os.android && !__compareVersion ($.os.version, "4.0")) {
            $wrap.css ({
                'top'    : 'auto',
                'bottom' : 0
            })
            $.dialog.toast ("抱歉，您的手机系统版本不支持选择", 1600)
        } else {
            $wrap.animate ({ 'translateY' : '1px' }, 10, function () {
                $wrap.hide ()
                setTimeout (function () {
                    $wrap.show ().animate ({ 'translateY' : 0 - $wrap.height () + 'px' }, 200, 'linear')//

                    //var $FilterInput = $wrap.find ('.item-filter input')
                    //if ($FilterInput && $FilterInput.length) {
                    //    $FilterInput.trigger ('change')
                    //}
                    __setSelectTransYBySelectedItem($wrap.find('.col'))

                }, 30)
            })
        }

        tcb.js2AndroidSetDialogState(true, function(){
            me.doHide()
        })
    }

    // 关闭picker
    function doHide () {
        var me = this,
            $wrap = __getWrap.apply (me)

        $wrap.animate ({ 'translateY' : 0 }, 200, 'linear', function () {

            $ (this).hide ()

            __hideWrap.apply (me)

            __hideMask.apply (me)
        })
        tcb.js2AndroidSetDialogState(false)
    }

    // 绑定基本事件
    function bindEvent () {
        var
            me = this,
            $wrap = __getWrap.apply(me),
            $trigger = me.getTrigger ()

        // 移动事件
        __bindMoveEvent ($wrap)

        // 触发picker展示
        $trigger.on ('click', function (e) {
            e.preventDefault ()

            var $me = $(this)

            if ($me.attr ('data-disabled-picker')) {
                return
            }

            // 有trigger before 函数，先调用，如果返回false（绝等于false），那么直接返回
            if ($.isFunction (me.options.callbackTriggerBefore) && me.options.callbackTriggerBefore (me) === false) {
                return
            }

            // shining
            __shineClick ($me[0])

            $trigger.blur()

            me.doShow()
        })

        // 选择item
        $wrap.on ('click', '.i-item', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $col = $me.closest ('.col')

            $me.addClass ('selected')
                .siblings ('.selected').removeClass ('selected')
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
        // 输入文字筛选
        $wrap.on('input change', '.item-filter input', function(e){
            var $me = $(this),
                val = tcb.trim ($me.val ()),
                $col = $me.closest('.col'),
                $itemList = $col.find('.item-list'),
                $items = $itemList.find('.i-item')

            val = val.match(/(\S+)/ig) || []

            me.options.dataFilter[ $col.index () ] = val

            tcb.each($items, function(i, itemEl){
                var $item = $(itemEl),
                    dataName = $item.attr('data-name')

                if (! __validMatch(val, dataName)){
                    $item.addClass('disabled')
                } else {
                    $item.removeClass('disabled')
                }
            })
            __resetListMove($itemList)
        })

        //取消关闭
        function actionCancel ($el) {

            // 关闭wrap层
            me.doHide ()

            if ($.isFunction (me.options.callbackCancel)) {

                me.options.callbackCancel (me)
            }
        }

        //确认选择
        function actionConfirm ($el) {

            // 选择确定的省/市/区县
            me.doSelect ()
            // 关闭wrap层
            me.doHide ()

            if ($.isFunction (me.options.callbackConfirm)) {

                me.options.callbackConfirm (me)
            }
        }
    }

    // 输出picker
    function render(){

        // 初始化将数
        var me = this,
            options = me.options,
            $wrap = __getWrap.apply(me),
            colHtml = __genHtml (options.data, options.dataPos, options.dataFilter)

        $wrap.find('.item-list').each(function(i, el){
            $(el).html(colHtml[i]||'')
        })

        return $wrap
    }

    // 初始化
    function init () {
        var me = this

        // 输出picker
        me.render()

        // 绑定基本事件
        me.bindEvent ()
    }

    Bang.Picker = function (options) {

        return new Picker (options)
    }



    //================= private ===================

    // 生成滑动列表
    function __genHtml (data, dataPos, dataFilter) {
        data = data || []
        dataPos = dataPos || []
        dataFilter = dataFilter || []

        var ret = []

        tcb.each (data, function (i, col_list) {
            var html_str = [],
                col_list_pos = dataPos[i] || 0,
                col_list_filter = dataFilter[i] || []

            tcb.each (col_list, function (ii, item) {
                html_str.push ('<span class="i-item')

                if (col_list_filter.length && !__validMatch (col_list_filter, item[ 'name' ])) {
                    html_str.push (' disabled')
                }
                if (col_list_pos === ii) {
                    html_str.push (' selected')
                }
                html_str.push ('" data-id="', item[ 'id' ], '" data-name="',item[ 'name' ],'">', item[ 'name' ], '</span>')
            })


            ret.push (html_str.join (''))
        })

        return ret
    }

    // 获取picker
    function __getWrap () {
        var me = this,
            $wrap = $ ('#'+me.__wrapId)

        if (!($wrap && $wrap.length)) {

            var flagFilter = me.options.flagFilter || false,
                col = me.options.col || 1,
                tit = me.options.dataTitle||[],
                html_st = []

            // 外框
            html_st.push ('<div class="ui-component-picker" id="',me.__wrapId,'">')

            // 主体列表
            html_st.push ('<div class="dt-table dt-table-', col, '-col">')
            for (var i = 0; i < col; i++) {
                html_st.push ('<div class="col">')
                html_st.push ('<div class="item-title">', (tit[ i ]||''), '</div>')
                if (flagFilter) {
                    html_st.push ('<div class="item-filter"><label class="input"><input type="text" placeholder="多词搜索使用空格分开"/></label></div>')
                }

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

            $wrap = $ (html_st).appendTo ($ ('body'))
        }

        return $wrap
    }
    // 隐藏picker
    function __hideWrap () {
        var
            me = this,
            $wrap = $ ('#'+me.__wrapId)

        if ($wrap && $wrap.length) {

            $wrap.hide()
        }
    }
    // 展示mask
    function __showMask () {
        var
            me = this,
            $mask = $ ('#'+me.__maskId)

        if (!($mask && $mask.length)) {

            var
                mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;display: block;width: 100%;height: 100%;background:rgba(0, 0, 0, 0.2);',
                mask_html = '<a id="'+me.__maskId+'" href="#" style="' + mask_css + '"></a>'

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
    // 隐藏mask
    function __hideMask () {
        var
            me = this,
            $mask = $ ('#'+me.__maskId)

        if ($mask && $mask.length) {

            $mask.hide ()
        }
    }

    // 绑定滑动事件
    function __bindMoveEvent ($wrap) {
        if (!($wrap && $wrap.length)) {
            return
        }

        var $cover = $wrap.find ('.item-window')

        //touch start
        $cover.on ('touchstart', function (e) {
            e.preventDefault ()

            var $me = $ (this),
                $list = $me.parents ('.item-select').find ('.item-list'),
                startY = e.touches[ 0 ].clientY

            $list.data ('scrollY', parseInt (__getTransY ($list)))
                .data ('startY', startY)
                .data ('isMove', 'yes')
                .data ('startTime', new Date ().getTime ())

            var $FilterInput = $wrap.find ('.item-filter input')
            if ($FilterInput && $FilterInput.length) {
                $FilterInput.blur()
            }
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
            __moveList (this, detY)
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
                detY = __getTransY ($list) - $list.data ('scrollY'),
                // 滑动时间
                detT = new Date ().getTime () - $list.data ('startTime')
            // 移动结束
            __moveEnd (this, detY, detT)

            // 移动结束,重置数据
            $list.data ('scrollY', 0)
                .data ('startY', 0)
                .data ('isMove', '')
                .data ('startTime', 0)

        })
    }

    // 移动列表
    function __moveList (el, detY) {
        var $el = $ (el),
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

        $item.eq (Math.round (Math.abs (scrollY / unit_height))).trigger ('click')
    }

    // 移动结束
    function __moveEnd (el, detY, detT) {
        var
            $el = $ (el),
            $node = $el.parents ('.item-select'),
            $list = $node.find ('.item-list'),
            $item = $list.find ('.i-item').filter (function () {
                return !$ (this).hasClass ('disabled')
            }),
            unit_height = $node.height () / 3,
            transY_max = ($item.length - 1) * unit_height,
            endTop = parseInt (__getTransY ($list)),
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

    function __resetListMove(el){
        var $el = $ (el),
            $node = $el.parents ('.item-select'),
            $list = $node.find ('.item-list'),
            $item = $list.find ('.i-item').filter (function () {
                return !$ (this).hasClass ('disabled')
            }),
            unit_height = $node.height () / 3,
            scrollY = 0

        $list.attr ('data-scrollY', scrollY)

        $list.css ('-webkit-transform', 'translateY(' + scrollY + 'px)')

        $item.eq (0).trigger ('click')
    }

    // 获取元素垂直方向变形位移
    function __getTransY (el) {
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

    // 根据选中的item,将列表移动到选中的位置
    function __setSelectTransYBySelectedItem ($col) {
        if (!($col && $col.length)) {

            return
        }
        $col.each (function (i, el) {
            var $el = $ (el),
                $cover = $el.find ('.item-window'),
                $selected = $el.find ('.selected'),
                $items = $el.find ('.i-item').filter(function(){
                    return !$(this).hasClass('disabled')
                }),
                el_index = $items.indexOf($selected[0]),
                d = -($selected.height () * el_index)

            __moveList ($cover[ 0 ], d)
        })
    }

    // 比较版本
    function __compareVersion (src, dest) {
        return __version2Num (src) >= __version2Num (dest)
    }

    // 匹配matchs数组内的字符串是否能在str中找到，都能找到，返回true，否则false
    function __validMatch(matchs, str){
        str = str || ''
        var flagMatch = true

        tcb.each(matchs, function(i, v){
            str.indexOf(v)==-1 && (flagMatch = false)
        })

        return flagMatch
    }

    // 版本变成数字
    function __version2Num (v) {
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
    function __shineClick (el, duration) {

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

} ())


;/**import from `/resource/js/mobile/special/2017/03/suning_honor_p10.js` **/
// 苏宁荣耀
$ (function () {
    var
        Bang = window.Bang || {}

    tcb.lazyLoadImg ({
        delay    : 1,
        interval : 1
    })

    var
        starttime = Date.parse ('2017/03/24 00:00:00'),
        curtime = window._now_time || (new Date ()).getTime ()
    Bang.startCountdown (starttime, curtime, $ ('.js-countdown-release-list'), {
        'end' : function () {

        }
    })

    // 申请补贴
    $ ('.trigger-btn-apply').on ('click', function (e) {
        e.preventDefault ()

        // 展示申请面板
        showApplyPanel ()
    })
    // 了解更多note7
    // $ ('.trigger-btn-get-more-about-note7').on ('click', function (e) {
    //     e.preventDefault ()
    //
    //     Bang.SwipeSection.getSwipeSection ()
    //
    //     var
    //         st = '<div class="block-intro">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01d403a62ade52b866.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01d8386bf9eb635afc.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01be167ca2e836083f.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01792e91d7a2760dc0.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01211a3afdce561620.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01969f239502dabb38.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t015947217b4c713057.jpg">' +
    //             '</div>' +
    //             '<div class="block-intro-btn">' +
    //             '<div class="row">' +
    //             '<div class="col-2-1"><a class="btn btn-apply" href="#">立即报名</a></div>' +
    //             '<div class="col-2-1"><a class="btn btn-go-back" href="#">返回</a></div>' +
    //             '</div>' +
    //             '</div>'
    //
    //     Bang.SwipeSection.fillSwipeSection (st)
    //
    //     Bang.SwipeSection.doLeftSwipeSection ()
    //
    //     // 申请补贴
    //     $ ('.block-intro-btn .btn-apply').on ('click', function (e) {
    //         e.preventDefault ()
    //
    //         // 展示申请面板
    //         showApplyPanel ()
    //     })
    //
    //
    //     $ ('.block-intro-btn .btn-go-back').on ('click', function (e) {
    //         e.preventDefault ()
    //
    //         Bang.SwipeSection.backLeftSwipeSection ()
    //     })
    // })

    // 绑定申请表单相关事件
    function bindApplyFormEvent ($Form) {
        $Form = $ ($Form)
        if (!($Form && $Form.length)) {
            return
        }

        var
            $OldModel = $Form.find ('[name="old_model"]'),
            $OldModelSelect = $Form.find ('.select-recycle-mobile'),
            $OldModelSelectTrigger = $Form.find ('.trigger-select-recycle-mobile'),
            $Mobile = $Form.find ('[name="mobile"]'),
            $BtnSeCode = $Form.find ('.btn-get-secode'),
            $BtnVCode = $Form.find ('.vcode-img')

        // 提交申请表单
        $Form.on ('submit', function (e) {
            e.preventDefault ()

            var
                $me = $ (this)

            // 判断是否处于可提交状态
            if (tcb.isFormDisabled ($me)) {
                return
            }

            // 验证表单
            if (!validForm ($me)) {
                return
            }

            // 以上验证全部通过，锁定表单，设置为不可再提交的锁定状态
            tcb.setFormDisabled ($me)

            $.ajax ({
                type     : 'POST',
                url      : $me.attr ('action') || '/huanxin/doSubSuningInfo',
                data     : $me.serialize (),
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    try {
                        res = typeof res == 'string'
                            ? $.parseJSON (res)
                            : res;

                        if (!res[ 'errno' ]) {

                            // 申请提交成功
                            showApplySuccessPanel ()

                            return
                        } else {
                            $.dialog.toast (res[ 'errmsg' ], 3000)
                        }
                    } catch (ex) {
                        $.dialog.toast ('返回异常，请刷新页面重试', 3000)
                    }

                    tcb.releaseFormDisabled ($me);
                },
                error    : function () {
                    $.dialog.toast ('返回异常，请刷新页面重试', 3000)
                    tcb.releaseFormDisabled ($me);
                }
            });

        })

        // 城市选择
        initCitySelect ($Form)

        // 机型选择
        initModelPicker($Form)
        //// 选择旧机型
        //$OldModel.on ('click', function () {
        //    var
        //        $me = $ (this)
        //
        //    if ($me.prop ('readonly')) {
        //
        //        triggerOpenSelectList ($ ('.select-recycle-mobile'))
        //    }
        //})
        //$OldModelSelectTrigger.on ('click', function (e) {
        //    e.preventDefault ()
        //
        //    triggerOpenSelectList ($ ('.select-recycle-mobile'))
        //})

        // 选中指定旧机机型型号
        //$OldModelSelect.on ('change', function (e) {
        //    var
        //        $me = $ (this),
        //        val = $me.val ()
        //
        //    if (val) {
        //        if(val=='other'){
        //            $OldModel.prop ('readonly', false).prop ('placeholder', '请手动输入旧机型号')
        //
        //            setTimeout (function () {
        //                $OldModel.focus ()
        //            }, 100)
        //
        //            val =''
        //        }else {
        //            $OldModel.prop ('readonly', true).prop ('placeholder', '选择旧机型号')
        //        }
        //
        //    } else {
        //        $OldModel.prop ('readonly', true).prop ('placeholder', '选择旧机型号')
        //    }
        //
        //    $OldModel.val (val)
        //})

        // 获取短信验证码
        $BtnSeCode.on ('click', function (e) {
            e.preventDefault ()

            var
                $mobile = $Mobile,
                mobile = $.trim ($mobile.val ())

            if (!tcb.validMobile (mobile)) {

                $.errorAnimate ($mobile.focus ());
                return
            }

            // 发送验证码
            //getSecode (mobile, $ (this), '/aj/send_lpsecode')// [接口废弃]此处js已无处使用

        })

        // 切换图形验证码
        $BtnVCode.on ('click', function (e) {
            e.preventDefault ()

            var
                src = '/secode/?rands=' + Math.random ()

            $ (this).attr ('src', src)
        })

    }


    // 向手机发送验证码
    function getSecode (mobile, $el, request_url) {
        if (!mobile) {
            return false;
        }
        if ($el && $el.length && $el.hasClass ('btn-get-secode-disabled')) {
            return false;
        }

        //request_url = (request_url || '/aj/sendsecode/') + '?mobile=' + encodeURIComponent (mobile) // [接口废弃]此处js已无处使用
        //
        //$.get (request_url, function (res) {
        //    res = $.parseJSON (res);
        //
        //    if (res[ 'errno' ]) {
        //        alert (res[ 'errmsg' ]);
        //    } else {
        //        if ($el && $el.length) {
        //            var txt = $el.html (),
        //                txt2 = '秒后再发送';
        //            $el.addClass ('btn-get-secode-disabled').html ('60' + txt2);
        //
        //            tcb.distimeAnim (60, function (time) {
        //                if (time <= 0) {
        //                    $el.removeClass ('btn-get-secode-disabled').html (txt);
        //                } else {
        //                    $el.html (time + txt2);
        //                }
        //            });
        //        }
        //    }
        //})

        return true
    }

    // 验证登陆表单
    function validForm ($form) {
        var
            flag = true

        var
            $city = $form.find ('[name="city"]'),
            $city_trigger = $form.find ('.trigger-select-province-city-area'),
            $old_model = $form.find ('[name="old_model"]'),
            $username = $form.find ('[name="username"]'),
            $mobile = $form.find ('[name="mobile"]'),
            $pic_secode = $form.find ('[name="pic_secode"]'),
            $secode = $form.find ('[name="secode"]')

        // 城市
        if ($city.length && !$city.val ()) {
            $.errorAnimate ($city_trigger.focus ())
            flag = false
        }
        // 旧机型
        if ($old_model.length && !$old_model.val ()) {
            $.errorAnimate (flag
                ? $old_model.focus ()
                : $old_model)
            flag = false
        }
        // 用户名
        if ($username.length && !$username.val ()) {
            $.errorAnimate (flag
                ? $username.focus ()
                : $username)
            flag = false
        }

        // 下单电话
        if ($mobile.length && !tcb.validMobile ($mobile.val ())) {
            $.errorAnimate (flag
                ? $mobile.focus ()
                : $mobile)
            flag = false
        }

        // 图片验证码
        if ($pic_secode.length && !$pic_secode.val ()) {
            $.errorAnimate (flag
                ? $pic_secode.focus ()
                : $pic_secode)
            flag = false
        }

        // 手机验证码
        if ($secode.length && !$secode.val ()) {
            $.errorAnimate (flag
                ? $secode.focus ()
                : $secode)
            flag = false
        }

        return flag
    }

    // 展示申请面板
    function showApplyPanel () {
        var
            st = $.tmpl ($ ('#JsSuningHonorp10ApplyPanelTpl').html ()) (),
            theDialog = tcb.showDialog (st, 'suning-honor-v9-apply-panel'),
            $Form = theDialog.wrap.find ('form')

        // 绑定事件
        bindApplyFormEvent ($Form)
    }

    // 展示申请成功面板
    function showApplySuccessPanel () {
        var
            st = $.tmpl ($ ('#JsSuningHonorp10ApplySuccessPanelTpl').html ()) ()

        tcb.showDialog (st, 'suning-honor-v9-apply-panel')
    }

    function initModelPicker($Form){
        var
            $OldModel = $Form.find ('[name="old_model"]')

        var
            pickerData = []
        $.each(window._modelArr||[], function(i, item){
            pickerData.push({
                id : i,
                name : item
            })
        })
        pickerData.push({
            id: 'other',
            name: '其他机型'
        })
        Bang.Picker({
            // 实例化的时候自动执行init函数
            flagAutoInit     : true,
            // 触发器
            selectorTrigger  : '.trigger-old-model-readonly, .trigger-select-recycle-mobile',

            col: 1,
            data: [pickerData],
            dataPos: [0],

            // 回调函数(确认/取消)
            callbackConfirm : function(inst){
                var data = inst.options.data || [],
                    dataPos = inst.options.dataPos || [],
                    selectedData = data[ 0 ][ dataPos[ 0 ] ]

                if (selectedData['id']=='other'){
                    $OldModel
                        .prop('data-disabled-picker', '1')
                        .prop ('readonly', false).prop ('placeholder', '请手动输入旧机型号')
                        .val('')

                    setTimeout (function () {
                        $OldModel.focus ()
                    }, 100)
                } else {
                    $OldModel
                        .prop('data-disabled-picker', '')
                        .prop ('readonly', true).prop ('placeholder', '选择旧机型号')
                        .val(selectedData['name'])
                }
            },
            callbackCancel  : null
        })
    }

    function initCitySelect ($Form) {

        var
            province = $Form.find ('.i-shipping-province').html () || '',
            city = $Form.find ('.i-shipping-city').html () || '',
            area = $Form.find ('.i-shipping-area').html () || '',
            options = {
                // 实例化的时候自动执行init函数
                flagAutoInit     : true,
                selectorTrigger  : '.trigger-select-province-city-area',
                //selectorProvince : '[name="receiver_province_id"]',
                //selectorCity     : '[name="receiver_city_id"]',
                //selectorArea     : '[name="receiver_area_id"]',
                province         : province,
                city             : city,
                area             : area,
                //show_city        : false,
                show_area        : false,
                callback_cancel  : null,
                callback_confirm : function (region) {
                    region = region || {}
                    //var
                    //    province_city_area = Array.prototype.join.call (arguments, ' ')

                    var
                        province_city_area = []
                    region[ 'province' ] && province_city_area.push (region[ 'province' ])
                    region[ 'city' ] && province_city_area.push (region[ 'city' ])
                    region[ 'area' ] && province_city_area.push (region[ 'area' ])

                    $Form.find ('[name="city"]').val (province_city_area.join(' '))
                }
            }

        // 初始化省/市/区县选择器
        Bang.AddressSelect (options)
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



    // 验证表单是否可提交
    function isFormDisabled ($form) {
        var flag = false;

        if (!$form.length) {
            return true;
        }
        if ($form.hasClass ('form-disabled')) {
            flag = true;
        }

        return flag;
    }

    tcb.isFormDisabled = tcb.isFormDisabled || isFormDisabled;

    // 设置表单不可提交
    function setFormDisabled ($form) {
        if (!$form.length) {
            return;
        }
        $form.addClass ('form-disabled');
    }

    tcb.setFormDisabled = tcb.setFormDisabled || setFormDisabled;

    // 设置表单可提交
    function releaseFormDisabled ($form) {
        if (!$form.length) {
            return;
        }
        $form.removeClass ('form-disabled');
    }

    tcb.releaseFormDisabled = tcb.releaseFormDisabled || releaseFormDisabled;

})

;
(function () {
    wx.ready (function () {
        var noop = function () {};
        var wxData = {};

        // 微信分享的数据
        wxData = {
            "title"   : "以旧换新购华为P10，抢照片打印机！",
            "desc"    : "报名预约以旧换新购华为P10，抢照片打印机，还享官价优先购买权！到店换新加送好礼！",
            "link"    : window.location.href,
            "imgUrl"  : 'https://p0.ssl.qhmsg.com/t017984342501a66b49.png',
            "success" : noop, // 用户确认分享的回调
            "cancel"  : noop // 用户取消分享
        };

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        wx.onMenuShareAppMessage (wxData);
        // 点击分享到朋友圈，会执行下面这个代码
        wx.onMenuShareTimeline (wxData);
        //分享到QQ
        wx.onMenuShareQQ (wxData);
    });

} ())

