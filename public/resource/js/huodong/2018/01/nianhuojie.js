$(function () {
    tcb.bindEvent(document.body, {
        // 抢神券
        '.js-trigger-get-shenquan':function (e) {
            e.preventDefault()

            var $me = $(this)

            if($me.hasClass('btn-not-start')||$me.hasClass('btn-end')){
                return
            }
            $.get('/youpin/doGetFixedTimeCouponCode?fixed_coupon_id=1', function (res) {
                res = $.parseJSON(res)
                if (!res['errno']) {
                    // 显示抢神券成功面板
                    showShenquanGotPanel()
                }else if (res['errno'] == 734){
                    // 显示已抢过神券面板
                    showShenquanJoinedPanel()
                }else if (res['errno'] == 108) {
                    // 未登录
                    mobileLogin($me)
                }else{
                    alert(res['errmsg'])
                }
            })
        }
    })

    // 获取中奖用户的数据
    function getData4LotteryUserList(callback){
        var request_url = '/youpin/doGetLotteryTopList'
        $.get(request_url, function(res){
            var list_arr = []
            res = $.parseJSON(res)

            if (!res['errno']) {
                list_arr = res['result']
            }

            typeof callback==='function' && callback(list_arr)
        })
    }
    // 输出中奖用户的数据
    function renderLotteryUserList(){
        var $list_inner = $('.lottery-user-list-inner')
        if($list_inner && $list_inner.length){
            getData4LotteryUserList(function(list_arr){
                var html_str = $.tmpl($.trim($('#JsNianHuoJieLotteryUserList').html()))({
                    'list': list_arr
                })
                $list_inner.html(html_str)

                var $list_lottery_item = $list_inner.find('.lottery-item'),
                    list_inner_row_height = $list_lottery_item.first().height()

                // 大于8条中奖信息才滚滚滚
                if($list_lottery_item.length>8){
                    (function(){
                        var arg = arguments
                        $list_inner.animate({'top': -list_inner_row_height}, 1200, function(){
                            $list_inner.find('.lottery-item').first().appendTo($list_inner)
                            $list_inner.css({'top': 0})

                            setTimeout(arg.callee, 2000)
                        })
                    }())
                }
            })

        }
    }

    renderLotteryUserList()
    
    // 登录
    function mobileLogin($obj) {
        var html_str = $.tmpl($.trim($('#JsNianHuoJieLoginPanelTpl').html()))({})
        var config = {
            withMask: true,
            className: 'nianhuojie-login-panel'
        }
        tcb.showDialog(html_str, config)

        // 登录表单相关功能
        window.Bang.LoginFormByMobile({
            form_action: '/youpin/aj_my_login',
            selector_form: $('#NianHuoJieLoginForm'),
            selector_get_secode: '.btn-get-secode',
            selector_vcode_img: '.vcode-img',
            class_get_secode_disabled: 'btn-get-secode-disabled'
        }, function (res) {
            tcb.closeDialog()
            setTimeout(function () {
                $obj.trigger('click')
            }, 200)
        })
    }
    // 显示抢神券成功面板
    function showShenquanGotPanel() {
        var html_str = $.tmpl($.trim($('#JsNianHuoJieShenquanGotPanel').html()))({})
        var config = {
            withMask: true,
            className: 'nianhuojie-shenquan-panel'
        }
        tcb.showDialog(html_str, config)
    }
    // 显示已抢过神券面板
    function showShenquanJoinedPanel() {
        var html_str = $.tmpl($.trim($('#JsNianHuoJieShenquanJoinedPanel').html()))({})
        var config = {
            withMask: true,
            className: 'nianhuojie-shenquan-panel'
        }
        tcb.showDialog(html_str, config)
    }

});