(function () {
    var product_id = $('[name="product_id"]').val(),
        product_price = $('.orderinfo-totalcount-desc-num').attr('data-origprice'),
        $hongbao_wrap = $('.block-hongbao'),
        $hongbao_cont = $hongbao_wrap.find('.block-hongbao-cont'),
        $hongbao_code = $('[name="redpacket_code"]')

    function bindEvent(options){
        tcb.bindEvent(document.body, {
            //点击"使用红包"
            '.need-hongbao-checkable':function (e){
                var $me = $(this),
                    checkbox = $me.find('.checkbox')

                if(!$.trim($hongbao_cont.html())){
                    return
                }

                // 红包列表展开收起交互
                var code = $hongbao_code.val ()
                $hongbao_cont.slideToggle('slow',function (){
                    if ($me.hasClass ('need-hongbao-checked') && !code) {
                        $me.removeClass ('need-hongbao-checked')
                    } else {
                        $me.addClass('need-hongbao-checked')
                        $hongbao_cont.find('.hongbao-item-able').filter(function () {
                            return $(this).attr('data-code') == code
                        }).addClass('hongbao-item-checked')
                                     .siblings('.hongbao-item').removeClass('hongbao-item-checked')
                    }
                })
            },
            //点击红包
            '.hongbao-item-able':function (e) {
                e.preventDefault()

                var $me = $(this),
                    code = $me.attr('data-code')

                if ($me.hasClass('hongbao-item-checked')) {
                    // 不使用红包
                    $me.removeClass('hongbao-item-checked')
                    $hongbao_code.val('')
                    getHongbaoCount()

                    typeof options.fail === 'function' && options.fail()
                } else {
                    // 使用红包，设置红包被选中
                    setHongbaoChecked({
                        $trigger: $me,
                        code: code,
                        succ: options.succ,
                        fail: options.fail
                    })
                }
            }
        })
    }

    // 设置红包被选中
    function setHongbaoChecked(options) {
        options = options || {}
        var $trigger = options.$trigger
        var code = options.code
        // 使用红包
        validHongbaoCode({
            'code': code,
            'succ': function (hongbao_amount) {
                if ($trigger && $trigger.length) {
                    $trigger.addClass('hongbao-item-checked')
                            .siblings('.hongbao-item').removeClass('hongbao-item-checked')
                }
                $hongbao_code.val(code)
                $('.hongbao-vaild-txt').html('已使用红包抵扣' + hongbao_amount + '元')
                $('.need-hongbao-checkable').addClass ('need-hongbao-checked')

                typeof options.succ === 'function' && options.succ(hongbao_amount)
            },
            'fail': function () {
                typeof options.fail === 'function' && options.fail()
            }
        })
    }

    // 获取红包列表数据
    function getHongbaoList(callback) {
        $.post ('/youpin/doGetRedPacketList',{
            product_id:product_id
        }, function (res) {
            try {
                res = $.parseJSON (res)

                if (!res[ 'errno' ]) {
                    var hongbao_list = res['result'] ||{}

                    typeof callback === 'function' && callback (hongbao_list)
                } else {

                }

            } catch (ex) {}
        })
    }

    // 输出红包列表
    function renderHongbaoList(hongbao_list) {
        var html_fn = $.tmpl($.trim($ ("#JsYoupinHongbaoListTpl").html())),
            html_str = html_fn ({
                'hongbaoList': hongbao_list
            })
        $hongbao_cont.html(html_str)
    }

    //显示可用红包数量
    function getHongbaoCount() {
        getHongbaoList(function (hongbao_list) {
            var hongbao_vaild_count = hongbao_list.youhui_list_valid && hongbao_list.youhui_list_valid.length

            uiSetHongbaoCount(hongbao_vaild_count)
        })
    }

    function uiSetHongbaoCount(hongbao_vaild_count) {
        var $hongbao_vaild_txt = $hongbao_wrap.find('.hongbao-vaild-txt')

        if (hongbao_vaild_count > 0) {
            $hongbao_vaild_txt.html(hongbao_vaild_count + '个红包可用')
        } else {
            $hongbao_vaild_txt.html('暂无可用红包')
        }
    }

    // 验证红包
    function validHongbaoCode(options){
        var params = {
            'code': options.code,
            'price': product_price,
            'product_id': product_id
        }

        $.post('/youpin/doGetRedPacketAmount', params, function(res){
            res = $.parseJSON(res)

            if(!res.errno){
                var hongbao_amount = res.result.promo_amount || 0
                typeof options.succ==='function' && options.succ(hongbao_amount)

                //红包验证成功，收起红包列表
                $hongbao_cont.slideUp()
            }else{
                alert(res.errmsg)

                typeof options.fail==='function' && options.fail()
            }
        })
    }

    function setupHongbaoDefaultChecked(hongbao_list, options) {
        var hongbao = null
        tcb.each(hongbao_list, function (i, item) {
            if (hongbao) {
                if (item.promo_amount > hongbao.promo_amount) {
                    hongbao = item
                }
            } else {
                hongbao = item
            }
        })
        if (hongbao && hongbao.code) {
            setHongbaoChecked({
                code: hongbao && hongbao.code,
                succ: options.succ,
                fail: options.fail
            })
        } else {
            uiSetHongbaoCount()
        }
    }

    window.Hongbao = function(options){
        //优先使用传入参数
        options = tcb.mix({
            'succ': function(){},
            'fail': function(){}
        }, options, true)

        bindEvent(options)
        getHongbaoList(function (hongbao_list) {
            renderHongbaoList(hongbao_list)
            setupHongbaoDefaultChecked(hongbao_list&&hongbao_list['youhui_list_valid'], options)
        })
        // getHongbaoCount()
    }
}())
