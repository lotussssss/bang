!function () {
    var url_query = tcb.queryUrl(window.location.search)
    var wxData = {}
    var __addressAreaData = []

    function setupShare() {
        var share_param = {
            xxg_id: url_query.xxg_id,
            activity_id: url_query.activity_id
        }
        if (url_query.order_id) {
            share_param.order_id = url_query.order_id
        }
        wxData = {
            'title': '苏宁小店新添手机回收业务，开业酬宾加价20%！',
            'desc': '彩蛋在后面，有惊喜呦~',
            'link': tcb.setUrl(window.location.protocol + '//' + tcb.trim(window.location.host, '/') + '/pintuan/homepage', share_param),
            'imgUrl': 'https://p1.ssl.qhimg.com/t01d10da695209797b3.jpg',
            'success': tcb.noop, // 用户确认分享的回调
            'cancel': tcb.noop // 用户取消分享
        }
        if (typeof wx !== 'undefined') {
            wx.ready(function () {

                // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
                wx.onMenuShareAppMessage(wxData)
                // 点击分享到朋友圈，会执行下面这个代码
                wx.onMenuShareTimeline(wxData)
                //分享到QQ
                wx.onMenuShareQQ(wxData)
                //分享到QZone
                wx.onMenuShareQZone(wxData)
            })
        }
    }

    function bindEventDelegate() {
        tcb.bindEvent(document.body, {
            // 选择邮寄方式
            '.js-trigger-select-type-item': function (e) {
                e.preventDefault()
                var $me = $(this)
                var $block = $('#' + $me.attr('data-for'))

                $me.addClass('selected').siblings('.selected').removeClass('selected')
                $block.show().siblings('.block-youji-type').hide()
            },
            // 刷新图片验证码
            '.js-trigger-vcode-img': function () {
                var $me = $(this),
                    $secode_img = $('.js-trigger-vcode-img'),
                    $secode = $('[name="secode"]')

                $secode_img.attr('src', '/secode/?rands=' + Math.random())
                $secode.val('')
                $me.closest('.form-control').find('[name="secode"]').focus()
            },
            // 获取短信验证码
            '.js-trigger-get-sms-code': function (e) {
                e.preventDefault()
                var $me = $(this),
                    $form = $me.closest('form'),
                    $mobile = $form.find('[name="tel"]'),
                    $secode = $form.find('[name="secode"]'),
                    $sms_type = $form.find('[name="sms_type"]')

                if (!validSeCode($form)) {
                    return
                }

                getSeCode(
                    {
                        mobile: $.trim($mobile.val()),
                        pic_secode: $.trim($secode.val()),
                        sms_type: $.trim($sms_type.val())
                    },
                    function (res) {
                        if (res && res.errno) {
                            return $.dialog.toast((res && res.errmsg) || '系统错误', 2000)
                        }
                        $me.addClass('btn-get-sms-code-disabled').html('发送成功')
                        setTimeout(function () {
                            $me.html('请稍等60秒')
                            tcb.distimeAnim(60, function (time) {
                                if (time <= 0) {
                                    $me.removeClass('btn-get-sms-code-disabled').html('获取验证码')
                                } else {
                                    $me.html('请稍等' + time + '秒')
                                }
                            })
                        }, 1000)
                    },
                    function (err) {
                        return $.dialog.toast((err && err.statusText) || '系统错误', 2000)
                    }
                )
            },
            // 查看回收协议
            '.js-trigger-view-agree-protocol': function (e) {
                e.preventDefault()
                var html_fn = $.tmpl($.trim($('#HuishouProtocolTpl').html())),
                    html_st = html_fn()
                var inst = tcb.showDialog(html_st, {
                    className: 'dialog-agree-protocol',
                    withClose: false,
                    middle: true
                })
                inst.wrap.find('.close-btn').on('click', function (e) {
                    e.preventDefault()
                    tcb.closeDialog()
                })
            },
            // 提交订单
            '.js-trigger-confirm-submit': function (e) {
                e.preventDefault()
                var $Form = $('form').filter(function () {
                    return $(this).height()
                }).eq(0)
                $Form.trigger('submit')
            }
        })
    }

    function bindEvent() {
        var $FormYoujiPintuanSubmit = $('#FormYoujiPintuanSubmit')

        // 选择取件区域
        var $selectAddressAreaTrigger = $FormYoujiPintuanSubmit.find('.js-trigger-select-address-area')
        Bang.Picker({
            // 实例化的时候自动执行init函数
            flagAutoInit: true,
            // 触发器
            selectorTrigger: $selectAddressAreaTrigger,
            col: 1,
            data: [__addressAreaData],
            dataTitle: ['请选择取件区域'],
            dataPos: [0],
            // 回调函数(确认/取消)
            callbackConfirm: function (inst) {
                var data = inst.options.data || [],
                    dataPos = inst.options.dataPos || [],
                    selectedData = data[0][dataPos[0]],
                    $trigger = inst.getTrigger()

                $trigger.removeClass('placeholder').html(selectedData.name)
                $trigger.closest('form').find('[name="express_area"]').val(selectedData.id)
                // console.log(selectedData)
            },
            callbackCancel: null
        })
        // 选择上门取件时间
        var $timeTrigger = $FormYoujiPintuanSubmit.find('[name="express_time_alias"]')
        new $.datetime($timeTrigger, {
            remote: tcb.setUrl2('/huishou/doGetAbleExpressTimeTable'),
            noStyle: true
        })
        // 邮寄拼团表单
        __bindForm({
            $form: $FormYoujiPintuanSubmit,
            before: function ($form, callback) {
                validFormYoujiPintuanSubmit($form) && callback()
            },
            success: function (res, $Form) {
                var result = res.result
                var order_id = result.parent_id
                var redirect_url = tcb.setUrl2('/pintuan/homepage', {
                    order_id: order_id,
                    xxg_id: url_query.xxg_id,
                    activity_id: url_query.activity_id
                })

                var $blockYoujiSchedulePickup = $Form.find('.block-youji-schedule-pickup')
                if ($blockYoujiSchedulePickup && $blockYoujiSchedulePickup.length && $blockYoujiSchedulePickup.height()) {
                    var params = tcb.queryUrl($Form.serialize()) || {}
                    params.order_id = order_id
                    submitYuyueKuaid(params, function () {
                        window.location.href = redirect_url
                    })
                } else {
                    window.location.href = redirect_url
                }
            },
            error: function (err) {
                return $.dialog.toast(err && (err.statusText || err.errmsg || '系统错误，请稍后重试'), 2000)
            }
        })
    }

    function getData(callback) {
        var assess_key = url_query.assess_key
        var self_enterprise = url_query.self_enterprise

        tcb.loadingStart()
        __ajax({
            url: '/m/pinggu_shop_pintuan',
            data: {
                assess_key: assess_key,
                self_enterprise: self_enterprise
            },
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    var html_st = '<div class="grid align-center" style="flex-direction: column;justify-content: center;width: 100%;height: 100%;">' +
                        '<div style="width: 90%;text-align: center;font-size: .14rem">' + ((res && res.errmsg) || '系统错误') + '</div>' +
                        '<div style="width: 80%;"><br><br>' +
                        '<a class="btn btn-go-home" href="' +
                        tcb.setUrl('/pintuan/homepage', {
                            xxg_id: url_query.xxg_id,
                            activity_id: url_query.activity_id,
                            from_page: url_query.from_page
                        })
                        + '">返回首页</a></div></div>'
                    return tcb.showDialog(html_st, {
                        className: 'dialog-error',
                        withClose: false,
                        middle: true
                    })
                }
            },
            error: function (err) {
                var html_st = '<div class="grid align-center" style="flex-direction: column;justify-content: center;width: 100%;height: 100%;">' +
                    '<div style="width: 90%;text-align: center;font-size: .14rem">' + (err.statusText || '系统错误') + '</div>' +
                    '<div style="width: 80%;"><br><br>' +
                    '<a class="btn btn-go-home" href="' +
                    tcb.setUrl('/pintuan/homepage', {
                        xxg_id: url_query.xxg_id,
                        activity_id: url_query.activity_id,
                        from_page: url_query.from_page
                    })
                    + '">返回首页</a></div></div>'
                return tcb.showDialog(html_st, {
                    className: 'dialog-error',
                    withClose: false,
                    middle: true
                })
            },
            complete: function () {
                tcb.loadingDone()
            }
        })
    }

    function render(data) {
        // data = {
        //     'model_id': '123456', // 机型id
        //     'model_name': 'iPhone X', // 机型名称
        //     'pinggu_price_hightest': '1200', // 最高估价
        //     'pinggu_price_original': '1000', // 预估原价
        //     'can_shunfeng_sm': true,// 是否支持顺丰上门,true-支持,false-不支持
        //     'shunfeng_sm_address': { // 支持顺丰上门的话
        //         'province_id': '7',// 省份id
        //         'province_code': 'guang_dong',// 省份code
        //         'province_name': '广东',// 省份名称
        //         'city_id': '41',// 城市id
        //         'city_code': 'dong_guan',// 城市code
        //         'city_name': '东莞',// 城市名称
        //         'area_list': [// 区的信息
        //             {
        //                 'area_id': 11,
        //                 'area_name': 'XX区'
        //             },
        //             {
        //                 'area_id': 12,
        //                 'area_name': 'XX区'
        //             }
        //         ]
        //     },
        //     'hs_user_info': {
        //         'mobile': '13681122152',// 如果用户微信没有绑定手机，手机号可能为空
        //         'wx_open_id': 'wx12312312313123123',
        //         'wx_nick': '马冬梅',
        //         'wx_avatar': 'http://xxxxxxxxxxxxxxxx'
        //     }
        // }
        if (data.can_shunfeng_sm) {
            var area_list = []
            $.each((data.shunfeng_sm_address && data.shunfeng_sm_address.area_list) || [], function (i, item) {
                area_list.push({
                    id: item['area_name'],
                    name: item['area_name']
                })
            })
            __addressAreaData = area_list
        }
        if (!data.shunfeng_sm_address) {
            data.shunfeng_sm_address = {}
        }
        var assess_key = url_query.assess_key
        var self_enterprise = url_query.self_enterprise
        data.assess_key = assess_key
        data.self_enterprise = self_enterprise

        var $inner = $('.mainbody-inner')
        var html_fn = $.tmpl($.trim($('#JsSpecialPintuanSubmitTpl').html())),
            html_st = html_fn(data)
        $inner.html(html_st)

        var $form = $inner.find('form')
        var mobile_html_fn = $.tmpl($.trim($('#JsSpecialPintuanSubmitMobileTpl').html())),
            mobile_html_st = mobile_html_fn({
                mobile: (data && data.hs_user_info && data.hs_user_info.mobile) || ''
            })
        $form.find('.block-youji-mobile-info').html(mobile_html_st)
    }

    function getSeCode(params, callback, error, complete) {
        __ajax({
            type: 'POST',
            url: tcb.setUrl('/aj/doSendSmscode/'),
            data: params,
            success: callback,
            error: error,
            complete: complete
        })
    }

    function validFormYoujiPintuanSubmit($Form) {
        var flag = true
        var $blockYoujiSchedulePickup = $Form.find('.block-youji-schedule-pickup'),
            $express_area = $Form.find('[name="express_area"]'),
            $express_area_trigger = $Form.find('.js-trigger-select-address-area'),
            $express_useraddr = $Form.find('[name="express_useraddr"]'),
            $express_time_alias = $Form.find('[name="express_time_alias"]'),
            $express_username = $Form.find('[name="express_username"]'),
            $code = $Form.find('[name="code"]'),
            $agree_protocol = $Form.find('[name="agree_protocol"]'),
            express_area = $.trim($express_area.val()),
            express_useraddr = $.trim($express_useraddr.val()),
            express_time_alias = $.trim($express_time_alias.val()),
            express_username = $.trim($express_username.val()),
            code = $.trim($code.val())
        var $focus_el = null,
            err_msg = ''

        // 支持 或者 选择上门取件的时候，才校验上门取件的表单信息
        if ($blockYoujiSchedulePickup && $blockYoujiSchedulePickup.length && $blockYoujiSchedulePickup.height()) {
            // 请选择取件区域
            if (!express_area) {
                $.errorAnimate($express_area_trigger)
                $focus_el = $focus_el || $express_area_trigger
                err_msg = err_msg || '请选择取件区域'
            }
            // 请输入详细的取件地址
            if (!express_useraddr) {
                $.errorAnimate($express_useraddr)
                $focus_el = $focus_el || $express_useraddr
                err_msg = err_msg || '请输入详细的取件地址'
            }
            // 请选择上门取件时间
            if (!express_time_alias) {
                $.errorAnimate($express_time_alias)
                $focus_el = $focus_el || $express_time_alias
                err_msg = err_msg || '请选择上门取件时间'
            }
            // 请输入寄件人姓名
            if (!express_username) {
                $.errorAnimate($express_username)
                $focus_el = $focus_el || $express_username
                err_msg = err_msg || '请输入寄件人姓名'
            }
        }
        // 只有存在短信验证码的时候，才验证手机号和验证码
        if ($code && $code.length) {
            // 验证手机号和图片验证码
            var validData = validSeCode($Form, true)
            if (!validData.flag) {
                $focus_el = $focus_el || validData.$focus_el
                err_msg = err_msg || validData.err_msg
            }
            // 短信验证码
            if (!code) {
                $.errorAnimate($code)
                $focus_el = $focus_el || $code
                err_msg = err_msg || '短信验证码不能为空'
            }
        }
        // 是否勾选协议
        if (!$agree_protocol.prop('checked')) {
            $.errorAnimate($agree_protocol.closest('.block'))
            err_msg = err_msg || '请阅读并同意服务条款'
        }

        if (err_msg) {
            flag = false
            setTimeout(function () {
                $focus_el && $focus_el.focus()
            }, 500)
            $.dialog.toast(err_msg)
        }
        return flag
    }

    // 验证手机号和图片验证码
    function validSeCode($Form, silent) {
        var flag = true
        var $mobile = $Form.find('[name="tel"]'),
            $secode = $Form.find('[name="secode"]'),
            mobile = $.trim($mobile.val()),
            secode = $.trim($secode.val())
        var $focus_el = null,
            err_msg = ''

        // 验证手机号
        if (!mobile || !tcb.validMobile(mobile)) {
            $.errorAnimate($mobile)
            $focus_el = $focus_el || $mobile
            err_msg = !mobile ? '手机号码不能为空' : '手机号码格式错误'
        }
        // 验证图形验证码
        if (!secode) {
            $.errorAnimate($secode)
            $focus_el = $focus_el || $secode
            err_msg = err_msg || '图片验证码不能为空'
        }
        if (err_msg) {
            flag = false
            if (!silent) {
                setTimeout(function () {
                    $focus_el && $focus_el.focus()
                }, 500)
                $.dialog.toast(err_msg)
            }
        }
        return silent
            ? {
                flag: flag,
                $focus_el: $focus_el,
                err_msg: err_msg
            }
            : flag
    }

    function submitYuyueKuaid(params, callback) {
        __ajax({
            url: '/huishou/doUpdateExpressInfo',
            data: {
                express_area: params.express_area,
                express_username: params.express_username,
                express_tel: params.tel,
                express_useraddr: params.express_useraddr,
                express_time_alias: params.express_time_alias,
                parent_id: params.order_id
            },
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    return $.dialog.toast((res && res.errmsg) || '系统错误，请稍后重试', 2000)
                }
            },
            error: function (err) {
                return $.dialog.toast(err && (err.statusText || err.errmsg || '系统错误，请稍后重试'), 2000)
            }
        })
    }

    // 绑定表单
    function __bindForm(options) {
        options = options || {}

        if (!(options.$form && options.$form.length)) {
            return $.dialog.toast('$form参数必须')
        }
        // 表单提交前执行
        if (typeof options.before !== 'function') {
            options.before = function ($form, callback) {
                typeof callback === 'function' && callback()
            }
        }
        // 表单提交后执行
        if (typeof options.after !== 'function') {
            options.after = function (res) {
                return true
            }
        }
        options.$form.on('submit', function (e) {
            e.preventDefault()
            var $form = options.$form
            if ($form.hasClass('form-flag-submitting')) {
                return
            }
            options.before($form, function () {
                $form.addClass('form-flag-submitting')
                __ajax({
                    url: $form,
                    success: function (res) {
                        $form.removeClass('form-flag-submitting')
                        // 表单提交后执行，返回true继续执行默认行为，false不执行后续操作
                        if (options.after(res)) {
                            if (!res.errno) {
                                typeof options.success === 'function' && options.success(res, $form)
                            } else {
                                typeof options.error === 'function' && options.error(res)
                            }
                        }
                    },
                    error: function (err) {
                        $form.removeClass('form-flag-submitting')
                        typeof options.error === 'function' && options.error(err)
                    }
                })
            })
        })
    }

    // 异步请求
    function __ajax(options) {
        options = options || {}
        if (!options.url) {
            return $.dialog.toast('请求参数url必须')
        }
        // url是form表单元素
        if (typeof options.url !== 'string' && options.url.__proto__ !== $.fn) {
            options.url = $(options.url)
        }
        if (options.url[0].tagName == 'FORM') {
            options.method = options.method || options.url[0].method
            options.data = options.data || options.url.serialize()
            options.url = options.url[0].action
        }
        $.ajax({
            type: options.method || options.type || 'GET',
            url: options.url,
            data: options.data,
            dataType: options.dataType || 'json',
            xhrFields: options.xhrFields || null,
            timeout: options.timeout || 5000,
            beforeSend: options.beforeSend || function (xhr, settings) {
            },
            success: options.success || function (data, status, xhr) {
            },
            error: options.error || function (xhr, type, error) {
            },
            complete: options.complete || function (xhr, status) {
            }
        })
    }

    function init() {
        setupShare()
        // DOM Ready
        $(function () {
            getData(function (data) {
                render(data)
                // render()
                bindEventDelegate()
                bindEvent()
            })
        })
    }

    init()
}()
