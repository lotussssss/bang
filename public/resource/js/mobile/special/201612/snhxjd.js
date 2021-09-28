;!function(){
    var
        wxData = {
            "title"   : '1209来苏宁，0元拿家电',
            "desc"    : '旧手机换新家电，来苏宁百款家电0元搬回家',
            "link"    : window.location.protocol + '//' + window.location.host + '/m/sn1209',
            "imgUrl"  : 'https://p.ssl.qhimg.com/t0199d2a2257e7a09b2.png',
            "success" : tcb.noop, // 用户确认分享的回调
            "cancel"  : tcb.noop // 用户取消分享
        }

    if (typeof wx !== 'undefined'){
        // 微信分享
        wx.ready ( function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage ( wxData )
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline ( wxData )
            //分享到QQ
            wx.onMenuShareQQ ( wxData )
        })

        if (tcb.validMobile(window.__mobile)){
            wxData.success = loginUserShareSuccess
        }
    }

    // 已登录用户分享成功
    function loginUserShareSuccess(){
        var
            mobile = window.__mobile

        window.location.href = window.location.protocol + '//' + window.location.host + '/m/luckDraw?user_mobile='+mobile
    }

    // dom ready
    $ (function () {
        var
            root = tcb.getRoot ()
            // 路由
            , Router = root.Router


        if ($ ('.page-hd-snhxjd').length) {
            // 活动首页

            // 生成路由实例
            window.router_inst = Router (window.route_map)
            // 初始化路由功能
            window.router_inst.init ()

        } else if ($ ('.page-hd-snhxjd-promo').length) {
            // 获取增值券的页面

            $('#FormCheckReceivePromo').on('submit', function(e){
                e.preventDefault()

                var
                    $form = $(this)

                if (!validFormCheckReceivePromo($form)){

                    return
                }

                //if (tcb.cache ('form-check-receive-promo-errmsg')) {
                //    if (tcb.cache('form-check-receive-promo-errno')=='10622'){
                //        // 已经领过优惠券，还未抽奖，显示引导提示分享
                //
                //        showShareIntro()
                //    } else {
                //        $.dialog.toast (tcb.cache ('form-check-receive-promo-errmsg'), 2000)
                //    }
                //    return
                //}

                $.ajax ({
                    type     : $form.attr('method'),
                    url      : $form.attr('action'),
                    data     : $form.serialize(),
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {
                        var
                            $mobile = $form.find('[name="user_mobile"]'),
                            mobile = tcb.trim ($mobile.val ())

                        if (res['errno']){
                            // cache返回的错误信息，避免下次重复发送请求
                            //tcb.cache('form-check-receive-promo-mobile', res[ 'errmsg' ])
                            //tcb.cache('form-check-receive-promo-errmsg', res[ 'errmsg' ])
                            //tcb.cache('form-check-receive-promo-errno', res[ 'errno' ])

                            if (res['errno']=='10622' && window.__is_weixin){
                                // 已经领过优惠券，还未抽奖，显示引导提示分享

                                showShareIntro()

                                // 获取增值码提交成功，设置分享成功回调函数
                                window.__mobile = mobile
                                wxData.success = loginUserShareSuccess

                            } else {

                                $.dialog.toast (res[ 'errmsg' ], 2000)
                            }

                        } else {

                            showSubReceivePromo(mobile)
                        }
                    },
                    error    : function () {
                        $.dialog.toast ('系统错误，请刷新页面重试', 2000)
                    }
                })
            })

            function validFormCheckReceivePromo($form){
                if (!($form && $form.length)){
                    console.log('找不到表单')
                    return false
                }
                var
                    flag = true,
                    $mobile = $form.find('[name="user_mobile"]')

                if ($mobile && $mobile.length){
                    var mobile = tcb.trim($mobile.val())
                    if (!mobile || !tcb.validMobile(mobile)){
                        flag = false

                        $.errorAnimate($mobile)
                        setTimeout(function () {
                            $mobile.focus()
                        }, 300)
                    }
                }

                return flag
            }

            // 打开提交获取优惠码弹层
            function showSubReceivePromo(mobile){

                var
                    html_fn = $.tmpl (tcb.trim ($ ('#JsMSuNingHuanXinJiaDianSubReceivePromoTpl').html ())),
                    html_st = html_fn ({
                        user_mobile : mobile
                    })

                var
                    dialog = tcb.showDialog (html_st, {
                        className : 'sub-receive-promo-wrap',
                        withClose : true,
                        middle    : true
                    }),
                    $form = dialog.wrap.find ('form')

                // 绑定相关事件
                bindEventSubReceivePromo ($form)
            }

            function bindEventSubReceivePromo($form){
                // 提交获取优惠券表单
                $form.on('submit', function(e){
                    e.preventDefault()

                    var
                        $form = $(this)
                    if (!validFormSubReceivePromo($form)){
                        return
                    }

                    $.ajax ({
                        type     : $form.attr('method'),
                        url      : $form.attr('action'),
                        data     : $form.serialize(),
                        dataType : 'json',
                        timeout  : 5000,
                        success  : function (res) {

                            if (res[ 'errno' ]) {
                                return $.dialog.toast (res[ 'errmsg' ], 2000)
                            }

                            tcb.closeDialog()

                            if (window.__is_weixin){
                                // 触发显示分享引导
                                showShareIntro()

                                // 获取增值码提交成功，设置分享成功回调函数
                                var
                                    mobile = $form.find('[name="user_mobile"]').val()
                                window.__mobile = mobile
                                wxData.success = loginUserShareSuccess
                            } else {
                                $.dialog.toast('恭喜您，回收增值券领取成功！', 2000)
                            }
                        },
                        error    : function () {
                            $.dialog.toast('系统错误，请刷新页面重试', 2000)
                        }
                    })

                })
                // 获取手机验证码
                $form.find('.btn-get-sms-code').on('click', function(e){
                    e.preventDefault()

                    var
                        $me = $ (this),
                        $form = $me.closest ('form'),
                        $mobile = $form.find ('[name="user_mobile"]'),
                        $secode = $form.find ('[name="secode"]')

                    if (!validSeCode($me)) {
                        return
                    }

                    getSMSCode ({
                        'user_mobile' : $.trim($mobile.val ()),
                        'secode' : $.trim($secode.val ())
                    }, function (data) {
                        $me.addClass ('btn-get-sms-code-disabled').html ('60秒后再次发送')

                        tcb.distimeAnim (60, function (time) {
                            if (time <= 0) {
                                $me.removeClass ('btn-get-sms-code-disabled').html ('发送验证码')
                            } else {
                                $me.html (time + '秒后再次发送')
                            }
                        })
                    })
                })
                // 刷新图像验证码
                $form.find('.vcode-img').on('click', function(e){
                    var
                        $me = $(this),
                        $secode_img = $('.vcode-img'),
                        $secode = $('[name="secode"]'),
                        src = '/secode/?rands=' + Math.random ()

                    $secode_img.attr ('src', src)

                    $secode.val('')

                    $me.closest('.row').find('[name="secode"]').focus()
                })
            }
            // 验证获取优惠券表单提交
            function validFormSubReceivePromo ($Form) {
                var
                    flag = true

                if (!($Form && $Form.length)) {
                    flag = false
                } else {

                    var
                        $mobile = $Form.find ('[name="user_mobile"]'),
                        // 图像验证码
                        $secode = $Form.find ('[name="secode"]'),
                        // 短信验证码
                        $smscode = $Form.find ('[name="sms_code"]'),

                        mobile = $.trim ($mobile.val ()),
                        secode = $.trim ($secode.val ()),
                        smscode = $.trim ($smscode.val ())

                    var
                        $focus_el = null,
                        err_msg = ''

                    // 验证手机号
                    if (!mobile) {
                        $.errorAnimate ($mobile)
                        $focus_el = $focus_el || $mobile
                        err_msg = '手机号码不能为空'
                    }
                    else if (!tcb.validMobile (mobile)) {
                        $.errorAnimate ($mobile)
                        $focus_el = $focus_el || $mobile
                        err_msg = '手机号码格式错误'
                    }

                    // 验证图形验证码
                    if (!secode) {
                        $.errorAnimate ($secode)
                        $focus_el = $focus_el || $secode
                        err_msg = err_msg || '图片验证码不能为空'
                    }

                    // 验证短信验证码
                    if (!smscode) {
                        $.errorAnimate ($smscode)
                        $focus_el = $focus_el || $smscode
                        err_msg = err_msg || '短信验证码不能为空'
                    }

                    if (err_msg) {
                        flag = false

                        setTimeout (function () {
                            $focus_el && $focus_el.focus ()
                        }, 500)

                        $.dialog.toast (err_msg)
                    }
                }

                return flag
            }
            // 验证优惠码表单
            function validSeCode ($Target) {
                var
                    flag = true

                if (!($Target && $Target.length)) {
                    flag = false
                } else {

                    var
                        $Form = $Target.closest ('form'),
                        $mobile = $Form.find ('[name="user_mobile"]'),
                        $secode = $Form.find ('[name="secode"]'),

                        mobile = $.trim ($mobile.val ()),
                        secode = $.trim ($secode.val ())

                    if ($Target.hasClass ('btn-get-sms-code-disabled')) {
                        flag = false
                    } else {
                        var
                            $focus_el = null,
                            err_msg = ''

                        // 验证手机号
                        if (!mobile) {
                            $.errorAnimate ($mobile)
                            $focus_el = $focus_el || $mobile
                            err_msg = '手机号码不能为空'
                        }
                        else if (!tcb.validMobile (mobile)) {
                            $.errorAnimate ($mobile)
                            $focus_el = $focus_el || $mobile
                            err_msg = '手机号码格式错误'
                        }

                        // 验证图形验证码
                        if (!secode){
                            $.errorAnimate ($secode)
                            $focus_el = $focus_el || $secode
                            err_msg = err_msg || '图片验证码不能为空'
                        }

                        if (err_msg) {
                            flag = false

                            setTimeout (function () {
                                $focus_el && $focus_el.focus ()
                            }, 500)

                            $.dialog.toast (err_msg)
                        }

                    }
                }

                return flag
            }
            // 获取手机验证码
            function getSMSCode (params, callback, error) {
                $.ajax ({
                    type     : 'POST',
                    url      : '/m/doSendSmscode/',
                    data     : params,
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {

                        if (res[ 'errno' ]) {
                            return $.dialog.toast (res[ 'errmsg' ], 2000)
                        }
                        typeof callback === 'function' && callback (res[ 'result' ])
                    },
                    error    : function () {
                        typeof error === 'function' && error ()
                    }
                })
            }

            // 触发显示分享引导
            function showShareIntro(){
                // 触发显示分享引导
                window.Bang.ShareIntro.active({
                    img : 'https://p.ssl.qhimg.com/t01c5d992454e4a99d1.png',
                    ext_html: '<div style="padding: .1rem 0;font-size:.22rem;line-height: 1.2;color: #fffc00;">恭喜您成功领取<br>20元回收增值券</div>' +
                    '<div style="padding-top:.1rem;font-size: .14rem;text-align: center;color: #fff;">分享至好友群或朋友圈<br/>立即参加免费抽奖</div>'
                })
            }

        } else if ($('.page-hd-snhxjd_lottery').length){
            // 抽奖页面

            // 点击抽奖
            $ ('.lottery-btn').on ('click', function (e) {
                e.preventDefault ()

                var
                    $me = $(this),
                    mobile = tcb.trim (tcb.queryUrl (window.location.href, 'user_mobile'))

                if ($me.hasClass('lottery-btn-disabled')){
                    return
                }

                if (!tcb.validMobile (mobile)) {
                    return $.dialog.toast ('抽奖凭证丢失，无法抽奖', 2000)
                }

                $.ajax ({
                    type     : 'POST',
                    url      : '/m/doSubLuckDraw/',
                    data     : {
                        user_mobile : mobile
                    },
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {

                        if (res[ 'errno' ]) {
                            $.dialog.toast (res[ 'errmsg' ], 2000)
                        } else {
                            window.location.href = window.location.href
                        }
                    },
                    error    : function () {
                        $.dialog.toast('系统错误，请刷新页面重试', 2000)
                    }
                })


            })

        }

    })

}()

// =================================================================
// 首页单页处理，选择品牌、机型等
// =================================================================
;!function () {
    var
        root = tcb.getRoot ()
        , Swipe = root.SwipeSection
        // 路由
        , Router = root.Router
        // 模拟的页面滑动
        , Scroll = root.scroll
        // 页面生成器
        , Page = root.page
        // 获取数据的方法
        , dataMap = {
            modelList : getModelList
        }
        // Page内容输出映射
        , renderMap = {
            modelList : renderModelList
        }
        // Page内容事件绑定映射表
        , eventMap = {}
        // 路由映射表
        , route_map = {
            /**
             * 首页
             * @param route_inst
             * @param route
             * @param direction
             * @param url
             * @param request
             */
            '!' : function (route_inst, route, direction, url, request) {

                // 清除品牌列表的滚动事件
                root.handle.cleanBrandScroll ()

                Swipe.backLeftSwipeSection ()
            },

            /**
             * 进入品牌页，获取品牌机型列表
             * @param route_inst
             * @param route
             * @param direction
             * @param url
             * @param request
             */
            '!/brand/:brand_id' : function (route_inst, route, direction, url, request) {
                Page.generateIds (url)

                var
                    $BrandContainer = getBrandContainer (), // 获取品牌容器
                    $ModelContainer = getModelContainer ()  // 获取型号容器

                if (!$BrandContainer.find ('.item').length) {
                    // 没有品牌输出，先输出品牌列表，然后再处理型号选择页面

                    getBrandList (function () {

                        setModelPage ({
                            url             : url,
                            // 数据（可以是页面输出数据，也可以是异步请求参数）
                            data            : {
                                step     : 0,
                                brand_id : request[ 'brand_id' ]
                            },
                            router_inst     : router_inst,
                            $BrandContainer : $BrandContainer,
                            $ModelContainer : $ModelContainer
                        })
                    })
                } else {

                    // 已经有品牌列表，直接处理型号页面
                    setModelPage ({
                        url             : url,
                        // 数据（可以是页面输出数据，也可以是异步请求参数）
                        data            : {
                            step     : 0,
                            brand_id : request[ 'brand_id' ]
                        },
                        router_inst     : router_inst,
                        $BrandContainer : $BrandContainer,
                        $ModelContainer : $ModelContainer
                    })

                }

            },

            /**
             * 选中机型大类，展示机型子类
             * @param route_inst
             * @param route
             * @param direction
             * @param url
             * @param request
             */
            '!/brand/:brand_id/pid/:model_id' : function (route_inst, route, direction, url, request) {
                Page.generateIds (url)

                var
                    $BrandContainer = getBrandContainer (), // 获取品牌容器
                    $ModelContainer = getModelContainer ()  // 获取型号容器

                if (!$BrandContainer.find ('.item').length) {
                    // 没有品牌输出，先输出品牌列表，然后再处理型号选择页面

                    getBrandList (function () {

                        setModelPage ({
                            url             : url,
                            // 数据（可以是页面输出数据，也可以是异步请求参数）
                            data            : {
                                step     : 1,
                                brand_id : request[ 'brand_id' ],
                                model_id : request[ 'model_id' ]
                            },
                            router_inst     : router_inst,
                            $BrandContainer : $BrandContainer,
                            $ModelContainer : $ModelContainer
                        })
                    })
                } else {

                    // 已经有品牌列表，直接处理型号页面
                    setModelPage ({
                        url             : url,
                        // 数据（可以是页面输出数据，也可以是异步请求参数）
                        data            : {
                            step     : 1,
                            brand_id : request[ 'brand_id' ],
                            model_id : request[ 'model_id' ]
                        },
                        router_inst     : router_inst,
                        $BrandContainer : $BrandContainer,
                        $ModelContainer : $ModelContainer
                    })
                }

            }

        }

    // 加载render函数表
    Page.addRender (renderMap)
    // 加载event函数表
    Page.addEvent (eventMap)

    window.route_map = route_map

    // =================================================================
    // 功能函数
    // =================================================================

    // 获取品牌容器
    function getBrandContainer (complete) {
        var
            $BrandContainer = $ ('#BlockBrandList'),
            $ModelContainer = null
        if (!($BrandContainer && $BrandContainer.length)) {
            var
                $swipe = __getSwipe(),
                brand_model_html = $.tmpl ($.trim ($ ('#JsMSuNingHuanXinJiaDianSectionBrandModelTpl').html ())) ()

            $swipe.find ('.swipe-section-inner').html (brand_model_html)

            Swipe.doLeftSwipeSection (0, function () {

                typeof complete === 'function' && complete ()
            })

            $BrandContainer = $ ('#BlockBrandList')
            $ModelContainer = $ ('#BlockModelList')

            // 初始化页面滚动功能
            Scroll.init ($ModelContainer, {
                snapping   : true,
                scrollingX : true,
                bouncing   : false
            })
        }

        return $BrandContainer
    }

    // 获取机型容器
    function getModelContainer (complete) {
        var
            $ModelContainer = $ ('#BlockModelList')
        if (!($ModelContainer && $ModelContainer.length)) {
            var
                $swipe = __getSwipe(),
                brand_model_html = $.tmpl ($.trim ($ ('#JsMSuNingHuanXinJiaDianSectionBrandModelTpl').html ())) ()

            $swipe.find ('.swipe-section-inner').html (brand_model_html)

            Swipe.doLeftSwipeSection (0, function () {

                typeof complete === 'function' && complete ()
            })

            $ModelContainer = $ ('#BlockModelList')

            // 初始化页面滚动功能
            Scroll.init ($ModelContainer, {
                snapping   : true,
                scrollingX : true,
                bouncing   : false
            })

        }

        return $ModelContainer
    }

    function __getSwipe(){
        var
            $swipe = Swipe.getSwipeSection ('.section-brand-model'),
            $close = $swipe.find('.icon-close')

        $close.off()
        $close.on('click', function(e){
            e.preventDefault()

            Swipe.backLeftSwipeSection (function(){
                window.location.replace(window.location.href.split('#')[0])
                //window.location.href = window.location.href.split('#')[0]
            })
        })

        return $swipe
    }

    // 获取品牌列表
    function getBrandList(callback){
        var
            brandList = tcb.cache ('i_am_brand_list') || null

        tcb.loadingStart ()

        if (brandList) {
            typeof getBrandListSuccess === 'function' && getBrandListSuccess (brandList, callback)
        } else {
            __ajax ({
                type : 'GET',
                url  : '/m/doGetHuishouBrand/'
            }, function (data) {
                // 加入cache
                tcb.cache ('i_am_brand_list', data)

                typeof getBrandListSuccess === 'function' && getBrandListSuccess (data, callback)

            }, getBrandListError)
        }
    }
    // 获取品牌列表成功
    function getBrandListSuccess(data, callback){
        var
            $Target = $ ('#BlockBrandList .block-brand-list-inner')

        __htmlRender ({
            id : '',

            data : {
                brandList : data
            },

            $T            : $ ('#JsMSuNingHuanXinJiaDianBrandList'),
            $Target       : $Target,
            $The          : null,
            flag_clean    : true,
            flag_fade_in  : true,
            flag_not_show : false
        })

        $Target.css({
            'visibility' : 'visible'
        })

        tcb.loadingDone ()

        // 初始化品牌的滚动事件
        root.handle.initBrandScroll ()

        typeof callback==='function' && callback()
    }
    // 获取品牌列表失败
    function getBrandListError(){
        tcb.loadingDone ()

        $.dialog.toast ('请求超时，请重试')
    }


    // 设置机型展示页
    function setModelPage(options){

        Page.generator ({
            // 页面id
            id     : Page.getId (options.url),
            // 数据（可以是页面输出数据，也可以是异步请求参数）
            data   : options.data,
            target : options.$ModelContainer,
            // 页面输出函数,
            // 并且含有同名绑定事件
            render : 'modelList',

            complete : function ($The) {
                __setBrandUIStatus (options.data['brand_id'])

                // 页面进入
                Page.comeIn ($The, options.router_inst, function ($Enter) {
                    var
                        $Item = $Enter.find ('.item').eq (0)

                    Scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())
                })
            }
        }, true)

    }
    // 获取/输出机型列表
    function renderModelList (options) {

        __commonModelListRender ({
            id          : options[ 'id' ],
            target      : options[ 'target' ],
            step        : options[ 'data' ][ 'step' ] || 0,
            data        : options[ 'data' ],
            data_method : 'modelList',
            request     : {
                id : options[ 'data' ][ 'brand_id' ]
            },
            complete    : options[ 'complete' ],
            event       : options[ 'event' ]

        })
    }

    // 获取机型列表
    function getModelList (params, callback, error) {
        var
            str_params = $.param (params),
            modelList = tcb.cache ('i_am_model_list_' + str_params) || null

        if (modelList) {
            typeof callback === 'function' && callback (modelList)
        } else {
            params[ 'mobile' ] = '1'
            params[ 'fromget' ] = 'm'
            __ajax ({
                type : 'GET',
                url  : '/huishou/getModels/',
                data : params
            }, function (data) {
                // 加入cache
                tcb.cache ('i_am_model_list_' + str_params, data)

                typeof callback === 'function' && callback (data)
            }, error)
        }

    }


    // 设置品牌ui状态
    function __setBrandUIStatus (brand_id) {
        var
            $BlockBrandList = $ ('#BlockBrandList'),
            $Items = $BlockBrandList.find ('.item'),
            $Item = $Items.filter ('[data-bid="' + brand_id + '"]')

        if (!($Item && $Item.length)) {
            $Item = $Items.first()
        }

        // 设置品牌被选中状态
        $Items.removeClass ('checked')
        $Item.addClass ('checked')
    }

    // =================================================================
    // 私有接口 private
    // =================================================================

    // 机型列表输出方法
    function __commonModelListRender (options) {
        var
            $Target = options[ 'target' ]
        if (!($Target && $Target.length)) {
            return
        }

        var step = parseInt (options[ 'step' ], 10) || 0

        tcb.loadingStart()

        dataMap[ options[ 'data_method' ] ] (options[ 'request' ], function (data) {
            if (!data) {

                return options[ 'complete' ] ()
            }
            var
                modelList = data[ 'data' ][ step ]

            if (step !== 0) {
                var
                    model_id = options[ 'data' ][ 'model_id' ],
                    modelListTemp = []
                for (var i = 0; i < modelList.length; i++) {
                    if (modelList[ i ][ 'pid' ] == model_id) {
                        modelListTemp.push (modelList[ i ])
                    }
                }
                modelList = modelListTemp
            }

            var
                $The = __htmlRender ({
                    id : options[ 'id' ],

                    data : {
                        modelList : modelList,
                        brand_id  : options[ 'data' ][ 'brand_id' ]
                    },

                    $T            : $ ('#JsMSuNingHuanXinJiaDianModelList'),
                    $Target       : $Target,
                    $The          : null,
                    flag_clean    : false,
                    flag_fade_in  : true,
                    flag_not_show : false
                })

            // 绑定事件
            options[ 'event' ] ($Target)
            // 完成回调
            options[ 'complete' ] ($The)

            tcb.loadingDone()

        }, function () {

            tcb.loadingDone()

            $.dialog.toast('请求超时，请双击重试')

            // 完成回调
            options[ 'complete' ] ()
        })
    }
    // 输出html
    function __htmlRender (options) {
        options = options || {}

        var
            id = options[ 'id' ] || '', // 页面id
            data = options[ 'data' ], // 模板数据
            $T = options[ '$T' ], // 模板对象
            $Target = options[ '$Target' ], // 输出目标元素
            $The = options[ '$The' ],// 指定要干掉的元素
            flag_clean = options[ 'flag_clean' ] || false,// 输出前,先清除$Target的内容
            flag_fade_in = options[ 'flag_fade_in' ] || false,// 渐变显示,flag_not_show为false的时候,此参数忽略
            flag_not_show = options[ 'flag_not_show' ] || false // 不显示

        if (!($Target && $Target.length)) {
            return
        }

        if ($The && $The.length) {
            $The.remove ()
        }

        var
            html_fn = $.tmpl ($.trim ($T.html ())),
            html_st = html_fn ({
                id   : id,
                data : data
            })

        $The = $ (html_st)
        // 干掉那些文本节点
        $The = $The.filter (function () {
            return this.nodeType == 1
        })

        // 先清除$Target的内容
        if (flag_clean) {
            $Target.html ('')
        }

        $Target.append ($The)

        if (flag_not_show) {
            // 隐藏输出

            $The.hide ()
        } else {
            if (flag_fade_in&&$The&&$The.length) {
                // 以fadein的方式显示出来

                $The
                    .css ({
                    'opacity' : 0
                })
                    .animate ({ 'opacity' : 1 }, 200)
            }
        }

        return $The
    }
    // 发起异步请求
    function __ajax (params, callback, error) {
        $.ajax ({
            type     : params[ 'type' ],
            url      : params[ 'url' ],
            data     : params[ 'data' ],
            dataType : 'json',
            timeout  : 5000,
            success  : function (res) {

                if (res[ 'errno' ]) {
                    $.dialog.toast (res[ 'errmsg' ], 2000)
                }
                typeof callback === 'function' && callback (res[ 'result' ])
            },
            error    : function () {
                typeof error === 'function' && error ()
            }
        })
    }

}()
// =================================================================
// 品牌列表滑动处理
// =================================================================
;!function (global) {
    var
        Root = tcb.getRoot ()

    Root.handle = Root.handle || {}

    tcb.mix (Root.handle, {

        initBrandScroll               : __initBrandScroll,
        cleanBrandScroll              : __cleanBrandScroll,
        getBrandScrollInst            : __getScrollInst,
        getBrandContainer             : __getContainer,
        getBrandInner                 : __getInner,
        resetBrandListScrollDimension : __setBrandListScrollDimension

    })


    // =================================================================
    // 公共接口 public
    // =================================================================


    // =================================================================
    // 私有接口 private
    // =================================================================

    var
        _Inst = null,
        _callback = null,
        $_Container = null,
        $_Inner = null

    function __cleanBrandScroll(){
        _Inst = null
        _callback = null
        $_Container = null
        $_Inner = null
    }

    // 初始化品牌列表的滚动
    function __initBrandScroll () {
        // 获取滚动实例
        __getScrollInst (__defaultAnimate, true)
        // 绑定品牌列表的事件
        __bindEvent ()
    }

    // 获取container
    function __getContainer () {

        if (!($_Container && $_Container.length)) {
            $_Container = $ ('#BlockBrandList')
        }

        return $_Container
    }

    // 获取inner
    function __getInner () {

        if (!($_Inner && $_Inner.length)) {
            $_Inner = __getContainer ().find ('.block-brand-list-inner')
        }

        return $_Inner
    }

    // 设置品牌列表的滚动尺寸
    function __setBrandListScrollDimension (clientWidth, clientHeight, contentWidth, contentHeight) {
        if ($ ('#BrandModelItemStyle').length){
            $ ('#BrandModelItemStyle').remove()
        }
        var
            inst = __getScrollInst (),

            $Container = __getContainer (),
            block_w = $Container.width (),
            block_h = $Container.height (),

            $Items = $Container.find ('.item'),
            $Item = $Items.eq (0),
            item_w = $Item.width (),
            item_h = $Item.height (),
            // item计算取整后的新高度
            item_new_h = item_h


        // 先根据默认设置的item高度，以及容器高度，
        // 获取跟默认高度最接近的显示的item数量的整数，
        // 由于新的item数量占满容器高度的时候，item的高度可能不为整数，
        // 为了避免非整数高度在某些浏览器不兼容，那么将新的item高度四舍五入成正整数，保持浏览器的兼容性，
        // 一切处理完成后再获取$Inner的高度，否则提前获取高度就会不准确
        if (!$ ('#BrandModelItemStyle').length) {
            var
                item_num_in_screen = block_h / item_h,
                item_num_in_screen_int = Math.round (item_num_in_screen)

            item_new_h = Math.round (block_h / item_num_in_screen_int)

            var
                style_css = '.page-index .block-model-list .item,.page-index .block-brand-list .item{height: ' + item_new_h + 'px;line-height: ' + item_new_h + 'px;}'
            $ ('<style id="BrandModelItemStyle" type="text/css"></style>').text (style_css).appendTo ('head');
        }

        var
            $Inner = __getInner (),
            inner_w = $Inner.width (),
            inner_h = $Inner.height ()

        clientWidth = typeof clientWidth != 'undefined' ? clientWidth : block_w
        clientHeight = typeof clientHeight != 'undefined' ? clientHeight : block_h
        contentWidth = typeof contentWidth != 'undefined' ? contentWidth : inner_w
        contentHeight = typeof contentHeight != 'undefined' ? contentHeight : inner_h

        inst.setSnapSize (item_w, item_new_h)
        inst.setDimensions (clientWidth, clientHeight, contentWidth, contentHeight)
    }

    // 获取滚动实例
    function __getScrollInst (animate_fn, flag_set_dimension) {

        if (_Inst) {

            if (typeof animate_fn === 'function') {
                // 设置滚动效果
                __setRunning (animate_fn)
            }

        } else {
            animate_fn = typeof animate_fn === 'function' ? animate_fn : __defaultAnimate

            _Inst = new Scroll (function (left, top, zoom) {
                // 此函数在滚动过程中实时执行，需要注意处理效率

                typeof _callback === 'function' && _callback (left, top, zoom)
            }, {
                snapping   : true,
                scrollingX : false,
                bouncing   : false
            })
            // 设置滚动效果
            __setRunning (animate_fn)
        }

        // 重置dimension
        if (flag_set_dimension) {
            __setBrandListScrollDimension ()
        }

        return _Inst
    }

    // 设置滚动的回调函数
    function __setRunning (callback) {
        var
            $Inner = __getInner ()

        _callback = function (left, top, zoom) {

            if (typeof callback === 'function') {

                callback (left, top, zoom, $Inner, tcb.setTranslateAndZoom)
            }
        }
    }

    // 默认滚动函数
    function __defaultAnimate (left, top, zoom, $el, setTranslateAndZoom) {

        setTranslateAndZoom ($el[ 0 ], left, top, zoom)
    }


    // 绑定事件
    function __bindEvent () {
        var
            $Doc = tcb.getDoc (),
            $Container = __getContainer (),

            inst = __getScrollInst (),
            // 用来标识在Container中的滑动
            flag = false

        // 绑定滚动事件
        $Container.on ('touchstart', function (e) {

            // flag设置为true表示滑动开始
            flag = true

            // 滑动开始
            inst.doTouchStart (e.touches, e.timeStamp)
        })

        $Doc.on ('touchmove', function (e) {
            if (flag) {
                e.preventDefault ()

                // 滑动ing
                inst.doTouchMove (e.touches, e.timeStamp)
            }
        }, {passive : false})

        $Doc.on ('touchend', function (e) {

            // 滑动ing
            inst.doTouchEnd (e.timeStamp)
            // flag重置为false，表示滑动结束
            flag = false
        })

        var
            double_tap_last_time = Date.now (),
            $Items = $Container.find ('.item')

        // 品牌列表绑定事件
        $Items.on ({
            // 双击品牌刷新
            'doubleTap' : function (e) {
                var
                    now_time = Date.now ()
                if (now_time - double_tap_last_time < 2000) {
                    return
                }
                double_tap_last_time = now_time

                window.router_inst.trigger (true)
            }
        })
    }

} (this)
