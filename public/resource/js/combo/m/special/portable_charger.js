;/**import from `/resource/js/component/m/shareintro.js` **/
(function(){
    window.Bang = window.Bang || {};

    var __options = {
        hash: '',
        img: '',
        ext_html: ''
    };
    /**
     * 分享引导
     */
    function activeShareIntro(options){
        __options = options || {};

        var $share_intro = $('.m-fenxiang-intro-wrap');
        if (!$share_intro.length) {
            var html_str = '<div class="m-fenxiang-intro-wrap">'
                +'<a class="m-fenxiang-intro-bg" href="#"></a>'
                +'<div class="m-fenxiang-intro-inner">' +
                '<a class="m-fenxiang-intro" href="#">' +
                '<img class="w100" src="'+(__options.img ? __options.img : 'https://p.ssl.qhimg.com/t010deb0787edd39c10.png')+'" alt=""/>';

            if (__options&&__options['ext_html']){
                html_str += __options['ext_html'];
            }
            html_str += '</a> </div> </div>';

            var mask_h = $('body').height(),
                window_h = $(window).height();
            if (mask_h<window_h){
                mask_h = window_h;
            }

            var $html_str = $(html_str);
            $html_str.appendTo('body').css({
                'height': mask_h
            });

            setTimeout(function(){
                var mask_h = $('body').height(),
                    window_h = $(window).height();
                if (mask_h<window_h){
                    mask_h = window_h;
                }
                $html_str.css({
                    'height': mask_h
                });
            }, 1000);

            $share_intro = $('.m-fenxiang-intro-wrap');
        }

        $(window).scrollTop(0);


        var $mainbody = $('.mainbody');
        if( $mainbody && $mainbody.length ){
            $mainbody.addClass('blur');
        }

        $share_intro.show();
    }
    /**
     * 关闭分享弹层
     */
    function closeShareIntro(){
        var $intro = $('.m-fenxiang-intro-wrap');
        if ($intro.length) {
            $intro.remove();
        }

        var hash = __options['hash'] || '';
        if (hash) {
            var hashs = tcb.parseHash(window.location.hash);
            // hashs的kv对象中拥有此hash
            if ( typeof hashs[hash]!=='undefined' ) {
                delete hashs[hash];
            }

            window.location.hash = $.param(hashs)
        }

        var $mainbody = $('.mainbody');
        if( $mainbody && $mainbody.length ){
            $mainbody.removeClass('blur');
        }
    }

    function init(){

        tcb.bindEvent({
            // 关闭分享引导
            '.m-fenxiang-intro-bg, .m-fenxiang-intro': function(e){
                e.preventDefault();
                closeShareIntro();
            }

        });

    }
    init();

    window.Bang.ShareIntro = {
        active: activeShareIntro,
        close: closeShareIntro
    };
}());

;/**import from `/resource/js/mobile/special/201612/portable_charger.js` **/
// 充电宝活动
;
!function () {
    var
        wxData = {
            "title"   : '你选我就送，为新年充满电',
            "desc"    : '选你喜欢的STYLE，免费送充电宝！',
            "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
            "imgUrl"  : 'https://p0.ssl.qhmsg.com/t01fed5b0361505f6f5.png',
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
    }
    tcb.bindEvent(document.body,{
        //选我喜欢
        '.btn-choose-like-trigger':function (e) {
            e.preventDefault()
            var $me = $(this)

            if($me.hasClass('btn-voted')){
                showVotedPanel('已参加过活动')
            }else if($me.hasClass('btn-write-info')){
                showLoginPanel({
                    'title':'验证身份',
                    'btn_txt':'下一步'
                })
            }else{
                if(window.FLAG_LOGIN){
                    showSelectPanel()
                }else{
                    showLoginPanel({
                        'title':'填写领奖信息',
                        'btn_txt':'立即抽奖'
                    })
                }
            }
        },
        '.portable-charger-select-list .item':function (e) {
            e.preventDefault()

            var style_item_index = $(this).index()+1,
                params = {
                'style_item':style_item_index
            }
            $.post('/huodong/doLotteryPortableBattery2016',params,function (res) {
                res = $.parseJSON (res)
                tcb.closeDialog()

                if(res['errno']){
                    showVotedPanel('已参加过活动')
                }else{
                    $('.btn-choose-like-trigger').addClass('btn-voted')

                    if (tcb.isWeChat){
                        // 微信中触发显示分享引导
                        showShareIntro()
                    }else{
                        showVotedPanel('投票成功')
                    }
                }
            })
        }
    })

    // 显示选择充电宝弹窗
    function showSelectPanel () {
        var
            PortableChargerList = window.PORTABLE_CHARGER_LIST || []

        var
            html_fn = $.tmpl( tcb.trim( $('#JsMHdPortableChargerSelectProductDialogTpl').html() )),
            html_st = html_fn({
                list : PortableChargerList
            })
        tcb.showDialog(html_st, {
            'className': 'portable-charger-select-panel',
            'withClose': true,
            'middle': true
        })
    }
    // 选择成功/已参加提示弹窗
    function showVotedPanel (title) {
        var
            html_fn = $.tmpl( tcb.trim( $('#JsMHdPortableChargerVotedDialogTpl').html() )),
            html_st = html_fn({
                'title' : title
            })
        tcb.showDialog(html_st, {
            'className': 'portable-charger-voted-panel',
            'withClose': true,
            'middle': true
        })
    }

//====================================
    // 显示登录弹窗
    function showLoginPanel (options) {
        var
            html_fn = $.tmpl (tcb.trim ($ ('#JsMPortableChargerLoginPanel').html ())),
            html_st = html_fn ({
               'title':options['title'],
                'btn_txt':options['btn_txt']
            })

        var
            dialog = tcb.showDialog (html_st, {
                className : 'portable-charger-login-panel',
                withClose : true,
                middle    : true
            }),
            $form = dialog.wrap.find ('form')

        bindEventLoginForm ($form)
    }
    // 关闭登录弹窗
    function closeLoginPanel(){

        tcb.closeDialog()
    }
    // 绑定登录表单事件
    function bindEventLoginForm($form){

        // 提交登录表单
        $form.on('submit', function(e){
            e.preventDefault()

            var
                $form = $(this)
            if (!validFormLogin($form)){
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

                    //登陆成功登录标识改变
                    window.FLAG_LOGIN = true
                    closeLoginPanel()

                    if($('.btn-write-info').length){
                        //验证是否中奖用户、是否填过信息
                        validIsSubmmitInfo()
                    }else{
                        // 显示选择充电宝弹窗
                        showSelectPanel()
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
                $me.addClass ('btn-get-sms-code-disabled').html ('发送成功')
                setTimeout(function(){

                    $me.html ('60秒后再次发送')

                    tcb.distimeAnim (60, function (time) {
                        if (time <= 0) {
                            $me.removeClass ('btn-get-sms-code-disabled').html ('发送验证码')
                        } else {
                            $me.html (time + '秒后再次发送')
                        }
                    })

                }, 1000)

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
    // 验证登录表单
    function validFormLogin ($Form) {
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
    // 获取短信验证码表单验证
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
            ext_html: '<div style="padding-top:.1rem;font-size: .14rem;text-align: center;color: #fff;">投票成功!<br/>快分享给好友一起来拿新年定制充电宝吧!</div>'
        })
    }

    //验证是否中奖用户、是否填过信息
    function validIsSubmmitInfo() {
        $.get('/huodong/getPortableBatteryIsSubInfo',function (res) {
            res = $.parseJSON (res)
            if(res['errno']){

                if(res['errno'] == '10713'){
                    $.dialog.toast (res[ 'errmsg' ], 2500)
                    setTimeout(function(){
                        // 中奖了
                        window.location.href = tcb.setUrl(window.location.href, {
                            getprize : '1'
                        })

                    }, 2500)
                } else {
                    // 未中奖
                    window.location.href = tcb.setUrl(window.location.href, {
                        getprize : '2'
                    })
                }
            }else{
                // $.dialog.toast (res[ 'errmsg' ], 2000)
                showWinnerInfoPanel()
            }
        })
    }
    // 显示中奖用户补全信息弹窗
    function showWinnerInfoPanel () {
        var
            html_fn = $.tmpl (tcb.trim ($ ('#JsMPortableChargerWinnerInfoPanel').html ())),
            html_st = html_fn ({

            })

        var
            dialog = tcb.showDialog (html_st, {
                className : 'portable-charger-winner-info-panel',
                withClose : true,
                middle    : true
            }),
            $form = dialog.wrap.find ('form')

        submitWinnerInfoForm ($form)
    }
    // 绑定中奖用户表单事件
    function submitWinnerInfoForm($form){
        // 提交中奖用户表单
        $form.on('submit', function(e){
            e.preventDefault()

            var
                $form = $(this)
            if (!validFormWinnerInfo($form)){
                return
            }

            $.ajax ({
                type     : $form.attr('method'),
                url      : $form.attr('action'),
                data     : $form.serialize(),
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    tcb.closeDialog()

                    if (res[ 'errno' ]) {
                        return $.dialog.toast (res[ 'errmsg' ], 2000)
                    }else{
                        $.dialog.toast('填写成功，奖品将于5个工作日内寄出', 2500)

                        setTimeout(function(){

                            // 中奖了
                            window.location.href = tcb.setUrl(window.location.href, {
                                getprize : '1'
                            })

                        }, 2500)
                    }
                },
                error    : function () {
                    $.dialog.toast('系统错误，请刷新页面重试', 2000)
                }
            })
        })
    }
    // 验证中奖用户补全信息表单
    function validFormWinnerInfo ($Form) {
        var
            flag = true

        if (!($Form && $Form.length)) {
            flag = false
        } else {
            var
                $user_name = $Form.find ('[name="user_name"]'),
                $address = $Form.find ('[name="address"]'),

                user_name = $.trim ($user_name.val ()),
                address = $.trim ($address.val ())


            var
                $focus_el = null,
                err_msg = ''

            // 验证用户名
            if (!user_name) {
                $.errorAnimate ($user_name)
                $focus_el = $focus_el || $user_name
                err_msg = '收件人姓名不能为空'
            }

            // 验证地址
            if (!address) {
                $.errorAnimate ($address)
                $focus_el = $focus_el || $address
                err_msg = err_msg || '收件人地址不能为空'
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
} ()
