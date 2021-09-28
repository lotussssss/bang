!function () {
    wx.ready (function () {
        var wxData = {}

        // 微信分享的数据
        wxData = {
            "title"   : "苏宁Vivo x20以旧换新",
            "desc"    : "参与苏宁Vivo x20以旧换即可获赠如蓝牙音箱等实物礼品",
            "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
            "imgUrl"  : 'https://p0.ssl.qhmsg.com/t01b5f78abcdc1da830.png',
            "success" : tcb.noop, // 用户确认分享的回调
            "cancel"  : tcb.noop // 用户取消分享
        }

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        wx.onMenuShareAppMessage (wxData)
        // 点击分享到朋友圈，会执行下面这个代码
        wx.onMenuShareTimeline (wxData)
        //分享到QQ
        wx.onMenuShareQQ (wxData)
        //分享到QZone
        wx.onMenuShareQZone (wxData)
    })
} ()

$(function(){
    var Bang = window.Bang || {}

    lazyLoadBg ({
        delay    : 1,
        interval : 1
    })

    setTimeout(function () {
        $('body').css({
            'background-color':'#000'
        })
    },200)
    // 触发申请
    $ ('.trigger-btn-apply').on ('click', function (e) {
        e.preventDefault ()

        // 展示申请面板
        showApplyPanel ()
    })

    // 绑定申请表单相关事件
    function bindApplyFormEvent ($Form) {
        $Form = $ ($Form)
        if (!($Form && $Form.length)) {
            return
        }

        var
            $mobile = $Form.find ('[name="mobile"]'),
            $BtnSeCode = $Form.find ('.btn-get-secode'),
            $BtnVCode = $Form.find ('.vcode-img'),
            $pic_secode = $Form.find ('[name="pic_secode"]'),
            $sms_type = $Form.find ('[name="sms_type"]')

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
                            $.dialog.toast ('报名成功', 3000)
                            tcb.closeDialog()

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

        // 获取短信验证码
        $BtnSeCode.on ('click', function (e) {
            e.preventDefault ()

            if (!validSecode ($Form)) {
                return
            }

            var params = {
                'mobile'     : $.trim ($mobile.val ()),
                'pic_secode' : $.trim ($pic_secode.val ()),
                'sms_type'   : $.trim ($sms_type.val ())
            }
            // 发送验证码
            getSecode (params, $ (this))
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
    function getSecode (params, $el) {
        if (!params) {
            return false;
        }
        if ($el && $el.length && $el.hasClass ('btn-get-secode-disabled')) {
            return false;
        }


        $.post ('/aj/doSendSmsCode',params, function (res) {
           res = $.parseJSON (res);

           if (res[ 'errno' ]) {
               alert (res[ 'errmsg' ]);
           } else {
               if ($el && $el.length) {
                   var txt = $el.html (),
                       txt2 = '秒后再发送';
                   $el.addClass ('btn-get-secode-disabled').html ('60' + txt2);

                   tcb.distimeAnim (60, function (time) {
                       if (time <= 0) {
                           $el.removeClass ('btn-get-secode-disabled').html (txt);
                       } else {
                           $el.html (time + txt2);
                       }
                   });
               }
           }
        })

        return true
    }

    // 验证登陆表单
    function validForm ($form) {
        var
            flag = true

        var
            $city = $form.find ('[name="city"]'),
            $city_trigger = $form.find ('.trigger-select-province-city-area'),
            $username = $form.find ('[name="username"]'),
            $address= $form.find ('[name="address"]'),
            $mobile = $form.find ('[name="mobile"]'),
            $pic_secode = $form.find ('[name="pic_secode"]'),
            $secode = $form.find ('[name="secode"]')

        // 城市
        if ($city.length && !$city.val ()) {
            $.errorAnimate ($city_trigger.focus ())
            flag = false
        }
        // 旧机型
        if ($address.length && !$address.val ()) {
            $.errorAnimate (flag
                ? $address.focus ()
                : $address)
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

    // 验证登陆表单
    function validSecode ($form) {
        var
            flag = true
        var
            $mobile = $form.find ('[name="mobile"]'),
            $pic_secode = $form.find ('[name="pic_secode"]')

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

        return flag
    }

    // 展示申请面板
    function showApplyPanel () {
        var
            st = $.tmpl ($ ('#JsSuningVivoX20ApplyPanelTpl').html ()) (),
            theDialog = tcb.showDialog (st, 'suning-vivo-x20-apply-panel'),
            $Form = theDialog.wrap.find ('form')

        // 绑定事件
        bindApplyFormEvent ($Form)
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


    function lazyLoadBg(options, $target) {
        if (typeof options==='number') {
            options = {
                'delay': options
            }
        }
        options = options || {}

        options = $.extend({
            'delay': 1,
            'interval': 0 // 0:同时显示，其他时间表示实际时间间隔
        }, options)

        var delay = options['delay'] || 1, // 毫秒
            interval = options['interval'] || 0 // 图片加载顺序间隔

        var _time = 0;
        setTimeout(function(){

            var $els
            if ($target && $target.length){
                var $target_el = $target.filter(function(i){
                    return $(this).attr('data-lazybg')
                })
                if ($target_el && $target_el.length){
                    if ($target_el.length===$target.length){
                        $els = $target_el;
                    } else {
                        $els = $target.find('[data-lazybg]').filter(function(i){
                            return $(this).attr('data-lazybg')
                        }).concat($target_el)
                    }
                } else {
                    $els = $target.find('[data-lazybg]').filter(function(i){
                        return $(this).attr('data-lazybg')
                    })
                }
            } else {
                $els = $('[data-lazybg]').filter(function(i){
                    return $(this).attr('data-lazybg')
                })
            }

            $els.each(function(i, el){
                var $el = $(el),
                    src = $el.attr('data-lazybg')

                if (tcb.isRealUrl(src)) {
                    if (interval) {
                        setTimeout(function(){

                            $el.css({
                                'opacity': 0,
                                'background': 'transparent url('+src+') no-repeat center 0',
                                'background-size' : 'cover'
                            })
                            $el.removeAttr('data-lazybg')
                            $el.animate({
                                'opacity': 1
                            }, interval)

                        }, _time)

                        _time += interval
                    } else {

                        $el.css({
                            'opacity': 0,
                            'background': 'transparent url('+src+') no-repeat center 0',
                            'background-size' : 'cover'
                        })
                        $el.removeAttr('data-lazybg')
                        $el.animate({
                            'opacity': 1
                        }, 300)
                    }
                }
            })

        }, delay)
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