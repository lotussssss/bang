$(function () {
    // 确保回收首页才执行
    if (window.__PAGE !== 'index') {
        return
    }
    // 回收首页热门回收机型
    var Root = tcb.getRoot (),
        ScrollFactory = Root.ScrollFactory

    var $Container = $('.block-hot-model')
    if($Container && $Container.length>0) {
        var $Inner = $Container.find('.hot-model-inner'),
            $Items = $Container.find('.model-item')
        $Items.removeClass('hidden')
        var SCROLL = new ScrollFactory({
            $Container: $Container,
            $Inner: $Inner,
            options: {
                scrollingX: true,
                scrollingY: false
            }
        })
        // 尺寸重置
        function resizeMsBlock() {
            var inner_width = 0
            $Items.removeClass('hidden')
            tcb.each($Items, function (i, item) {
                var $item = $(item)
                inner_width += $item.width() + .03 * (window.innerWidth > 720 ? 720 : window.innerWidth) * 100 / 320
            })
            $Inner.css({
                width: inner_width + 'px'
            })
            SCROLL.setDimensions()
        }

        resizeMsBlock()
    }
    //限时回收倒计时
    Bang.startCountdown (_END_TIME, _NOW_TIME,$('.js-block-hot-model-countdown'))

    tcb.bindEvent(document.body,{
        '.js-show-hs-rules':function(e){
            e.preventDefault()

            if(tcb.queryUrl(window.location.href, 'self_enterprise')=='dianxin' || tcb.queryUrl(window.location.href, 'self_enterprise')=='suningV'){
                var html_str = '<p class="rule-ctn">限时加价期间，用户回收指定手机型号，回收方式选择邮寄回收，完成旧机回收且最终质检价格大于500元，即可享受不同金额的现金补贴（金额以页面显示为准），补贴款随旧机款一并发放至用户收款账户内，即最终回收价=旧机实际估价+现金补贴</p> <a href="#" class="js-close-btn close-btn">我知道了</a>'
            }else{
                var html_str = '<p class="rule-ctn">限时加价期间，用户回收指定手机型号，回收方式选择邮寄回收或信用回收，完成旧机回收且最终质检价格大于500元，即可享受不同金额的现金补贴（金额以页面显示为准），补贴款随旧机款一并发放至用户收款账户内，即最终回收价=旧机实际估价+现金补贴</p> <a href="#" class="js-close-btn close-btn">我知道了</a>'
            }

            var config = {
                'withClose': true,
                'className': 'dialog-hs-rules',
                'middle':true
            };
            var dialog = tcb.showDialog(html_str, config)
            $('.js-close-btn').click(function (e) {
                e.preventDefault()
                tcb.closeDialog(dialog)
            })
        }
    })
})
