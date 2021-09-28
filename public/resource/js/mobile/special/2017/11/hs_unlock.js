$(function () {
    tcb.bindEvent(document.body,{
        // 点击切换页面
        '.trigger-btn-switch':function (e) {
            e.preventDefault()

            var $me = $(this),
                hash = $me.attr('data-hash')

            // 判断按钮能否点击跳转
            if($me.hasClass('js-trigger-btn-valid')&&(!$me.hasClass('ok'))){
                return
            }

            if (hash=='complete'){
                // 填写完成,提交表单
                return submitForm(function () {
                    setTimeout(function () {
                        window.location.href = '#'+hash
                    },300)
                })
            }

            setTimeout(function () {
                window.location.href = '#'+hash
            },300)
        },
        // 补充说明,内容非空,点击确认跳回上一页
        '.js-trigger-back':function (e) {
            e.preventDefault()

            var $me = $(this)
            if($me.hasClass('ok')){
                window.history.go(-1)
            }
        },
        // 填表单
        'input,textarea':{
            'focus':function (e) {
               $(this).closest('label').addClass('focus')
            },
            'blur':function (e) {
                $(this).closest('label').removeClass('focus')
            },
            // 按钮状态
            'change input':function (e) {
                var $me = $(this),
                    $cur_block = $me.closest('.block'),
                    $btn = $cur_block.find('.js-trigger-btn-valid')

                // 系统页,两个输入框都需填写
                if ($me.attr('name')=='system_account' || $me.attr('name')=='system_pwd'){
                    getVal('[name="system_account"]') && getVal('[name="system_pwd"]')
                        ? $btn.addClass('ok')
                        : $btn.removeClass('ok')
                } else {
                    getVal($me) ? $btn.addClass('ok') : $btn.removeClass('ok')
                }
            }
        }
    })

    // 表单提交
    var __flag_submit_success = false
    function bindFormSubmit() {
        var $form = $('form')
        $form.on('submit', function(e){
            e.preventDefault()

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
                        return __flag_submit_success = true
                    }
                },
                error    : function () {
                    $.dialog.toast('系统错误，请刷新页面重试', 2000)
                }
            })
        })
    }
    bindFormSubmit()
    function submitForm(cb) {
        var $form = $('form')

        $form.submit()

        setTimeout(function loop () {
            if (__flag_submit_success){
                typeof cb==='function' && cb()
            } else {
                setTimeout(loop, 50)
            }
        }, 50)
    }

    // hash控制页面切换
    $(window).on('hashchange load', function(e) {
        var hashs = tcb.parseHash(),
            hash_name = '',
            $head_back = $('.block-head .head-left')

        $head_back.show()

        for (hash_name in hashs){
            $('.block-page-'+hash_name).show().siblings('.block').hide()
        }

        if (!hash_name){
            $head_back.hide()

            if(window.__LOCK_TYPE==1){
                $('.block-page-index').show().siblings('.block').hide()
            }else{
                $('.block-page-system').show().siblings('.block').hide()
            }
        }

    })

    function getVal(el) {
        return $.trim($(el).val())
    }

})