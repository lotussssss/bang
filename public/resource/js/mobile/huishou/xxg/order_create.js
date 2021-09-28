!function () {
    if (window.__PAGE != 'xxg-order-create') {
        return
    }
    $ (function () {
        tcb.bindEvent (document.body, {
            // 切换tab
            '.block-tab .tab-item':function (e) {
                e.preventDefault()

                var $me = $(this),
                    pos = $me.attr('data-for-pos'),
                    $qrcode_item = $('.block-cont').find('.qrcode-item')

                $me.addClass('cur').siblings('.cur').removeClass('cur')
                $qrcode_item.hide().filter('[data-pos="'+pos+'"]').show()

                if(window.__SHOW_SHALOU_TIP_FLAG){
                    if(pos == '2'){
                        $('.block-cont .shalou-tips').show()
                        $('.block-cont .qrcode-tit').css({
                            'padding':'0',
                            'font-size': '.14rem'
                        })
                    }else{
                        $('.block-cont .shalou-tips').hide()
                        $('.block-cont .qrcode-tit').css({
                            'padding':'.12rem 0 .08rem'
                        })
                    }
                }
            },
            // 不可扫码原因弹窗
            '.js-trigger-unscannable-dialog':function (e) {
                e.preventDefault()

                var html_fn = $.tmpl($.trim($('#JsXxgUnscannableReasonDialogTpl').html())),
                    html_str = html_fn()

                var config = {
                    className: 'xxg-unscannable-reason-panel',
                    withClose: true,
                    middle: true
                }

                tcb.showDialog(html_str, config)
            },
            // 选择不可扫码原因
            '.js-trigger-option':function (e) {
                e.preventDefault()

                tcb.closeDialog()

                var $me = $(this)
                    data_id = $me.attr('data-id')

                setTimeout(function () {
                    window.XXG.redirect (tcb.setUrl2 ($me.attr ('href'), { _global_data : JSON.stringify ({ force_checked : data_id ,not_show_tab: 'notebook'}) }))
                }, 1)
            },
            // 笔记本回收
            '.js-trigger-create-notebook-order':function (e) {
                e.preventDefault()

                var $me = $(this)
                window.XXG.redirect (tcb.setUrl2 ($me.attr ('href'), { _global_data : JSON.stringify ({ not_show_tab: 'phone'}) }))
            },
            // 智能手表回收
            '.js-trigger-create-pad-order':function (e) {
                e.preventDefault()

                var $me = $(this)
                window.XXG.redirect (tcb.setUrl2 ($me.attr ('href'), { _global_data : JSON.stringify ({ not_show_tab: 'notebook', show_brands:['10'], pad: 1}) })+'#!/brand/10')
            }
        })

        $('.block-tab .tab-item').first().trigger('click')


        function startHeartBeat(){

            function heartBeat(){
                setTimeout(heartBeat, 3500)

                window.XXG.ajax({
                    url : tcb.setUrl ('/m/doGetAssessKeyByTokenForXXGInMiniapp'),
                    beforeSend : function () {},
                    success : function (res) {
                        if (!res.errno) {
                            if(res.result.imei){
                                window.XXG.redirect (tcb.setUrl2 ('/m/officialDiff/', {
                                    assess_key : res.result.assess_key,
                                    detect_token : res.result.detect_token,
                                    imei : res.result.imei,
                                    scene : res.result.scene
                                }))
                            }else{
                                window.XXG.redirect (tcb.setUrl2 ('/m/pinggu_shop/', {
                                    assess_key : res.result.assess_key,
                                    detect_token : res.result.detect_token,
                                    scene : res.result.scene
                                }))
                            }

                        }
                    },
                    error : function (err) {}
                })
            }
            heartBeat()
        }

        window.__PAGE == 'xxg-order-create' && startHeartBeat()

    })
} ()
