!function () {
    if (window.__PAGE != 'xxg-order-create-middle' && window.__PAGE != 'xxg-order-create-dispatcher') {
        return
    }
    $ (function () {
        var Bang = window.Bang

        $('.js-trigger-create-notebook-order').on('click',function(e){
            e.preventDefault()
            var $me = $(this)
            window.XXG.redirect (tcb.setUrl2 ($me.attr ('href'), { _global_data : JSON.stringify ({ not_show_tab: 'phone'}) }))

        })

        //点击回收二维码 弹出二维码弹窗
        $('.js-trigger-show-tuijian-qrcode').on('click',function(e){
            e.preventDefault()

            doGetTuijianQrcode(function(res){
                var img_url = res.result
                tcb.imageOnload(img_url,function(img_obj){
                    var html_str = '<p class="redpack-tit"> <i class="icon-redpack"></i>请用户扫码领红包</p><image src="'+img_url+'"/><p style="color: #fff;width: 2rem;margin: .1rem auto;">注意：此二维码为动态二维码，如需二次扫码请关闭弹窗重新生成</p>'
                    tcb.showDialog(html_str, {
                        className : 'dialog-hs-redpack',
                        middle : true
                    })
                })
            })

        })
        // 切换tab
        $ ('.row-fragment-tab a').on ('click', function (e) {
            e.preventDefault ()

            var $me = $ (this),
                pos = $me.attr ('data-for-pos'),
                $BlockFragment = $ ('.block-fragment')

            $me.addClass('btn-selected').siblings('.btn-selected').removeClass('btn-selected')

            $BlockFragment.hide ().filter ('[data-pos="' + pos + '"]').show ()
        })

        function doGetTuijianQrcode(callback){
            $.ajax({
                url:'/m/doGetTuijianQrcode',
                type: 'GET',
                dataType:'json',
                success:function(res){
                    if(!res.errno){
                        typeof callback === 'function' && callback(res)
                    }else{
                        $.dialog.toast(res.errmsg)
                    }
                },
                fail: function(e){
                    $.dialog.toast('网络错误，请重试')
                }
            })
        }

        function initTriggerCreateOrder(){
            var pickerData = [
                { id : 12, name : '无法开机/屏幕不显示' },
                { id : 26, name : '触摸异常' },
                { id : 3, name : '环保机' },
                { id : 0, name : 'ipad/手表' }
            ],
                $trigger = $('.js-trigger-create-order')

            Bang.Picker({
                // 实例化的时候自动执行init函数
                flagAutoInit     : true,
                // 触发器
                selectorTrigger  : $trigger,

                col: 1,
                data: [pickerData],
                dataTitle: ['手机情况？'],
                dataPos: [0],

                // 回调函数(确认/取消)
                callbackConfirm : function(inst){
                    var data = inst.options.data || [],
                        dataPos = inst.options.dataPos || [],
                        selectedData = data[ 0 ][ dataPos[ 0 ] ]

                    tcb.js2AndroidSetDialogState(false)

                    if (selectedData.id==3){
                        // 跳转到环保机专属页面
                        return window.XXG.redirect(tcb.setUrl2 ('/m/pinggu_shop?assess_key=3551'))
                    }

                    return selectedData.id>0
                        ? window.XXG.redirect (tcb.setUrl2 ($trigger.attr ('href'), { _global_data : JSON.stringify ({ force_checked : selectedData.id ,not_show_tab: 'notebook'}) }))
                        : window.XXG.redirect (tcb.setUrl2 ($trigger.attr ('href'), { _global_data : JSON.stringify ({ not_show_tab: 'notebook', show_brands:['10']}) })+'#!/brand/10')

                },
                callbackCancel  : null
            })
        }
        initTriggerCreateOrder()

        function startHeartBeat(){
            if (window.__IS_XXG_GUEST) return

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

        window.__PAGE == 'xxg-order-create-middle' && startHeartBeat()

    })
} ()