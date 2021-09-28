;
!function () {
    var
        wxData = {
            "title"   : '一份献给天下母亲的礼物',
            "desc"    : '母亲节到了，我们为她偷偷准备了一份礼物',
            "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
            "imgUrl"  : 'https://p3.ssl.qhmsg.com/t01e37132ed64d11dfe.png',
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
    

    $(function () {
        $('.trigger-play-video').on('click', function(e){
            e.preventDefault ()

            var html_fn = $.tmpl ($.trim ($ ('#JsMMothersDayVideoPlayerPanelTpl').html ())),
                html_st = html_fn ()

            tcb.showDialog (html_st, {
                className : 'video-player-panel',
                withClose : true,
                middle : true
            })
        })

        $(window).on('hashchange load', function(e) {
            var hashs = tcb.parseHash()

            if (typeof hashs['opt']!=='undefined') {
                pageTwoShow()
            } else if (typeof hashs['send_blessings']!=='undefined') {
                pageThreeShow()
            } else{
                pageOneShow()
            }
        })

        var $page = $('.page-hd-mothers-day-promotion')
        function pageOneShow() {
            $page.find('.page-one').show();
            $page.find('.page-two').hide();
            $page.find('.page-three').hide();
        }
        function pageTwoShow() {
            $page.find('.page-one').hide();
            $page.find('.page-two').show();
            $page.find('.page-three').hide();
        }
        function pageThreeShow() {
            $page.find('.page-one').hide();
            $page.find('.page-two').hide();
            $page.find('.page-three').show();
        }

        bindEventSubmitForm($('.page-three form'))

        // 绑定提交表单事件
        function bindEventSubmitForm($form){

            // 提交祝福语表单
            $form.on('submit', function(e){
                e.preventDefault()

                var
                    $form = $(this)
                if (!validFormSubmit($form)){
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
                        } else {
                            successAlert('祝福已发送')
                        }
                    },
                    error    : function () {
                        $.dialog.toast('系统错误，请刷新页面重试', 2000)
                    }
                })
            })


            // 刷新图像验证码
            $form.find('.vcode-img').on('click', function(e){
                var
                    $me = $(this),
                    $secode_img = $('.vcode-img'),
                    $secode = $('[name="pic_secode"]'),
                    src = '/secode/?rands=' + Math.random ()

                $secode_img.attr ('src', src)

                $secode.val('')

                $me.closest('.row').find('[name="pic_secode"]').focus()
            })
        }
        // 验证登录表单
        function validFormSubmit ($Form) {
            var
                flag = true

            if (!($Form && $Form.length)) {
                flag = false
            } else {

                var
                    //祝福语
                    $user_wishes = $Form.find ('[name="user_wishes"]'),
                    $mobile = $Form.find ('[name="user_mobile"]'),
                    // 图像验证码
                    $secode = $Form.find ('[name="pic_secode"]'),

                    user_wishes = $.trim ($user_wishes.val ()),
                    mobile = $.trim ($mobile.val ()),
                    secode = $.trim ($secode.val ())

                var
                    $focus_el = null,
                    err_msg = ''

                // 祝福语
                if (!user_wishes) {
                    $.errorAnimate ($user_wishes)
                    $focus_el = $focus_el || $user_wishes
                    err_msg = '请输入你的祝福'
                }

                // 验证手机号
                if (!mobile) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = err_msg ||'手机号码不能为空'
                }
                else if (!tcb.validMobile (mobile)) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = err_msg ||'手机号码格式错误'
                }

                // 验证图形验证码
                if (!secode) {
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

            return flag
        }

        function successAlert(txt, callback){

            var box = $.dialog.show('<div style="color: #e9213d;font-size: .16rem;text-align: center;">'+txt+'</div><div class="btn-box"><input class="ui-btn" type="button" value=" 好的 "  /></div>')

            box.find('.close').hide();

            box.find('.btn-box').css({
                'padding-top' : '.16rem',
                'text-align' : 'center'
            }).find('.ui-btn').css({
                'width' : '70%',
                'height' : '.40rem',
                'background' : '#fd6389',
                'background-clip' :'padding-box',
                'border' : '0',
                'border-radius' : '999px',
                'color' : '#fff',
                'font-size' : '.16rem;'
            }).on('click', function(){
                if( typeof(callback) == 'function' ){
                    (callback()!==false)  && (box.hide());
                }else{
                    box.hide();
                }
            });

            return box;
        }
    })
} ()