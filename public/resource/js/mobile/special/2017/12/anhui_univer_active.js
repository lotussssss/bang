!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "双旦福利合肥电信专享",
        "desc": "同城帮推出合肥电信双旦福利，先到先得、赶紧报名吧！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p0.ssl.qhmsg.com/t01aebd0816c1d78c97.png',
        "success": tcb.noop, // 用户确认分享的回调
        "cancel": tcb.noop // 用户取消分享
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
} ()

$(function(){
    var Bang = window.Bang || {}
    var _apply_panel=null

    lazyLoadBg ({
        delay    : 1,
        interval : 1
    })


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
                url      : $me.attr ('action') || '/huodong/doAhStoreSubInfo',
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
                            if(_apply_panel){
                                tcb.closeDialog(_apply_panel)
                            }
                            $.dialog.toast('申请成功',2000)
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

        // 服务项目选择
        initServerPicker ($Form)

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

    // 验证报名表单
    function validForm ($form) {
        var
            flag = true

        var
            $server_item = $form.find ('[name="server_item"]'),
            $mobile = $form.find ('[name="mobile"]'),
            $pic_secode = $form.find ('[name="pic_secode"]'),
            $secode = $form.find ('[name="secode"]')

        // 服务项目
        if ($server_item.length && !$server_item.val()) {
            $.errorAnimate (flag
                ? $server_item.focus ()
                : $server_item)
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

    // 获取短信验证码验证
    function validSecode ($form) {
        var
            flag = true
        var
            $mobile = $form.find ('[name="mobile"]'),
            $pic_secode = $form.find ('[name="pic_secode"]')

        // 电话
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
            st = $.tmpl ($ ('#JsAnhuiActiveApplyPanelTpl').html ()) (),
            theDialog = tcb.showDialog (st,{
                'className': 'anhui-active-apply-panel',
                'withClose': true,
                'middle': true
            }),
            $Form = theDialog.wrap.find ('form')

        _apply_panel=theDialog
        // 绑定事件
        bindApplyFormEvent ($Form)
    }

    function initServerPicker($Form){
        var
            $server_item = $Form.find ('[name="server_item"]')
        var
            pickerData = []
        $.each(window._serversArr||[], function(i, item){
            pickerData.push({
                id : i,
                name : item
            })
        })
        Bang.Picker({
            // 实例化的时候自动执行init函数
            flagAutoInit     : true,
            // 触发器
            selectorTrigger  : '.trigger-server-item',
            col: 1,
            data: [pickerData],
            dataPos: [0],

            // 回调函数(确认/取消)
            callbackConfirm : function(inst){
                var data = inst.options.data || [],
                    dataPos = inst.options.dataPos || [],
                    selectedData = data[ 0 ][ dataPos[ 0 ] ]
                $server_item
                    .prop('data-disabled-picker', '')
                    .prop ('readonly', true).prop ('placeholder', '请选择服务项目')
                    .val(selectedData['name'])
            },
            callbackCancel  : null
        })
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