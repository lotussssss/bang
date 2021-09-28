!function () {
    if (!(window.__PAGE == 'index' || window.__PAGE == 'order')) {
        return
    }

    $(function(){
        // 回收首页热门回收机型
        var Root = tcb.getRoot (),
            ScrollFactory = Root.ScrollFactory

        //var $Container = $('.block-crazy-coupon')
        //if($Container && $Container.length>0) {
        //    var $Inner = $Container.find('.crazy-coupon-inner')
        //
        //    var instBlockCrazyCouponScroll = new ScrollFactory({
        //        $Container: $Container,
        //        $Inner: $Inner,
        //        options: {
        //            scrollingX: true,
        //            scrollingY: false
        //        }
        //    })
        //
        //    tcb.cache('INST_BLOCK_CRAZY_COUPON_SCROLL', instBlockCrazyCouponScroll)
        //}

        tcb.bindEvent({
            '.js-trigger-show-crazy-coupon-dialog' : function(e){
                e.preventDefault()

                if (!window.__IS_LOGIN){
                    return showLogin()
                }

                tcb.showDialog('', {
                    middle: true,
                    className: 'ui-dialog-crazy-coupon'
                })

                var statisticParams = [ '_trackEvent', 'm回收', '点击', 'index现金加价券限时疯抢', '1', '' ]

                if (window.__PAGE == 'order'){
                    statisticParams[3] = 'order现金加价券限时疯抢'
                }
                tcb.statistic(statisticParams)
            }
        })

        // 显示登录面板
        function showLogin () {
            var html_str = $.tmpl($.trim($('#JsMLoginFormByMobilePanelTpl').html()))({})
            var dialogInst = tcb.showDialog(html_str, {
                middle: true,
                className: 'm-hs-login-panel'
            })

            // 登录表单相关功能
            window.Bang.LoginFormByMobile({
                form_action: tcb.setUrl2('/user/dologin'),
                selector_form: dialogInst.wrap.find('form'),
                selector_get_secode: '.btn-get-sms-code',
                selector_vcode_img: '.vcode-img',
                class_get_secode_disabled: 'btn-get-sms-code-disabled'
            }, function (res) {
                window.__IS_LOGIN = true

                var assess_key = tcb.queryUrl(window.location.search, 'assess_key')

                if (assess_key){
                    $.ajax({
                        type     : 'post',
                        url      : tcb.setUrl2('/huishou/doUpUserMobile'),
                        data     : {
                            assess_key : assess_key
                        },
                        dataType : 'json',
                        timeout  : 5000,
                        success  : function (res) {},
                        error    : function () {}
                    })
                }

                tcb.closeDialog()
                $('.js-trigger-show-crazy-coupon-dialog').click()
            })

            var statisticParams = [ '_trackEvent', 'm回收', '点击', 'index-login现金加价券限时疯抢', '1', '' ]

            if (window.__PAGE == 'order'){
                statisticParams[3] = 'order-login现金加价券限时疯抢'
            }
            tcb.statistic(statisticParams)
        }

    })
}()