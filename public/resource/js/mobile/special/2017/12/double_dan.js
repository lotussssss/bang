;
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "同城帮双旦狂欢",
        "desc": "2017收官疯抢、同城帮双旦狂欢，抢神卷全场优惠、更有iphone手机免息购!",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p0.ssl.qhmsg.com/t013cd575acf585f4ee.png',
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

    $(function () {

        tcb.bindEvent(document.body, {
            // 抢神券
            '.js-trigger-get-shenquan':function (e) {
                e.preventDefault()

                var $me = $(this)
                if($me.hasClass('btn-disabled')){
                    return
                }
                $.get('/youpin/doGetShuangdanYouhuiCode', function (res) {
                    res = $.parseJSON(res)
                    if (!res['errno']) {
                        // 显示抢神券成功面板
                        showShenquanGotPanel()
                    }else if (res['errno'] == 734){
                        // 显示已抢过神券面板
                        showShenquanJoinedPanel()
                    }else if (res['errno'] == 108) {
                        // 未登录
                        doubledanLogin($me)
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                })
            }
        })

        // 登录
        function doubledanLogin($obj) {
            var html_str = $.tmpl($.trim($('#JsDoubledanLoginPanelTpl').html()))({})
            var config = {
                middle: true,
                className: 'double-dan-login-panel'
            }
            tcb.showDialog(html_str, config)

            // 登录表单相关功能
           window.Bang.LoginFormByMobile({
                form_action: '/youpin/aj_my_login',
                selector_form: $('#doubledanMLoginForm'),
                selector_get_secode: '.btn-get-sms-code',
                selector_vcode_img: '.vcode-img',
                class_get_secode_disabled: 'btn-get-sms-code-disabled'
            }, function (res) {
                tcb.closeDialog()
                setTimeout(function () {
                    $obj.trigger('click')
                }, 200)
            })
        }
        // 显示抢神券成功面板
        function showShenquanGotPanel() {
            var html_str = $.tmpl($.trim($('#JsDoubledanShenquanGotPanel').html()))({})
            var config = {
                middle: true,
                className: 'double-dan-shenquan-panel'
            }
            tcb.showDialog(html_str, config)
        }
        // 显示已抢过神券面板
        function showShenquanJoinedPanel() {
            var html_str = $.tmpl($.trim($('#JsDoubledanShenquanJoinedPanel').html()))({})
            var config = {
                middle: true,
                className: 'double-dan-shenquan-panel'
            }
            tcb.showDialog(html_str, config)
        }
    })

} ()