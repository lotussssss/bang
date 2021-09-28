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
                    alert(res['errmsg'])
                }
            })
        }
    })

    // 双旦登录
    function doubledanLogin($obj) {
        var html_str = $.tmpl($.trim($('#JsDoubledanLoginPanelTpl').html()))({})
        var config = {
            withMask: true,
            className: 'double-dan-panel-wrap'
        }
        tcb.showDialog(html_str, config)

        // 登录表单相关功能
        window.Bang.LoginFormByMobile({
            form_action: '/youpin/aj_my_login',
            selector_form: $('#DoubledanLoginForm'),
            selector_get_secode: '.double-dan-panel-getsecode',
            selector_vcode_img: '.vcode-img',
            class_get_secode_disabled: 'double-dan-login-panel-getsecode-disabled'
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
            withMask: true,
            className: 'double-dan-shenquan-panel'
        }
        tcb.showDialog(html_str, config)
    }
    // 显示已抢过神券面板
    function showShenquanJoinedPanel() {
        var html_str = $.tmpl($.trim($('#JsDoubleShenquanJoinedPanel').html()))({})
        var config = {
            withMask: true,
            className: 'double-dan-shenquan-panel'
        }
        tcb.showDialog(html_str, config)
    }
});