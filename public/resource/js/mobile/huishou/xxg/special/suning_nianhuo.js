!function () {
    if (window.__PAGE !== 'xxg-special-suning-nianhuo') {
        return
    }


    $(function(){
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
                    url      : $me.attr ('action') || '/huodong/doSubForSuningNianhuojie',
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
                    src = tcb.setUrl2('/secode/?rands=' + Math.random ())

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


            $.post (tcb.setUrl2('/aj/doSendSmsCode'),params, function (res) {
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
                $oms_no = $form.find ('[name="oms_no"]'),
                $mobile = $form.find ('[name="mobile"]'),
                $pic_secode = $form.find ('[name="pic_secode"]'),
                $secode = $form.find ('[name="secode"]')

            // oms_no
            if ($oms_no.length && !(/^00\w{12}$/.test(tcb.trim($oms_no.val()))) ) {
                $.errorAnimate ($oms_no.focus ())
                $.dialog.toast ('请输入"00"开头的14位oms单号', 3000)
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

        // 验证图片验证码
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
                html_str = $.tmpl ($ ('#JsSuningNianHuoApplyPanelTpl').html ()) (),
                config = {
                middle: true,
                className: 'suning-nianhuo-apply-panel'
            }
            theDialog = tcb.showDialog (html_str, config),
            $Form = theDialog.wrap.find ('form')

            // 绑定事件
            bindApplyFormEvent ($Form)
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
} ()
