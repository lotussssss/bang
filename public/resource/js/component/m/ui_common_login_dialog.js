// m端全业务通用登陆框
!function () {
    function showCommonLoginPanel(options) {
        options = options || {}
        var success_cb = typeof options.success_cb == 'function' ? options.success_cb : tcb.noop

        var html_fn = $.tmpl($.trim($('#JsMUiCommonLoginDialogTpl').html())),
            html_str = html_fn({
                action_url: options.action_url || '/youpin/aj_my_login',
                tit_txt: options.tit_txt || '短信快捷登录',
                btn_txt: options.btn_txt || '下一步',
                tips: options.tips || '', //下单时手要快，否则很快会被抢走哦！
                sms_type: options.sms_type || 13,
                name_mobile: options.name_mobile || 'mobile',
                name_pic_secode: options.name_pic_secode || 'pic_secode',
                name_secode: options.name_secode || 'secode',
                name_sms_type: options.name_sms_type || 'sms_type',
                name_agree_protocol: options.name_agree_protocol || 'agree_protocol'
            }),
            dialogInst = tcb.showDialog(html_str, {
                className: 'ui-common-login-dialog',
                withClose: options.withClose || false,
                middle: true
            })
        // 登录表单相关功能
        window.Bang.LoginFormByMobile({
            form_action: dialogInst.wrap.find('form').attr('action'),
            selector_form: dialogInst.wrap.find('form'),
            selector_get_secode: '.ui-btn-get-secode',
            selector_vcode_img: '.ui-vcode-img',
            class_get_secode_disabled: 'ui-btn-get-secode-disabled',

            name_mobile: options.name_mobile || 'mobile',
            name_pic_secode: options.name_pic_secode || 'pic_secode',
            name_secode: options.name_secode || 'secode',
            name_sms_type: options.name_sms_type || 'sms_type',
            name_agree_protocol: options.name_agree_protocol || 'agree_protocol'
        }, success_cb)
    }

    function closeCommonLoginPanel() {
        tcb.closeDialog()
    }

    tcb.showCommonLoginPanel = showCommonLoginPanel
    tcb.closeCommonLoginPanel = closeCommonLoginPanel
}()
