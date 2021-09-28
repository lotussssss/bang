;(function () {
    $(function () {
        // 订单确认页
        if(!$('.page-order-confirm') || !$('.page-order-confirm').length){ return}

        var __Data = {
            sn: {
                item_desc: '送价值188意外保险，保障您的爱机安全无忧'
            },
            lbf: {
                item_desc: '无需押金，快速办理'
            }
        }

        var SwipeSection = window.Bang.SwipeSection;

        // 显示租用协议
        function showAgreement(){
            var
                html_fn = $.tmpl( $.trim($('#JsMZuAgreementConfirmTpl').html())),
                html_st = html_fn()

            SwipeSection.getSwipeSection()
            SwipeSection.fillSwipeSection(html_st)

            var
                $swipe = SwipeSection.getLastSwipeSection()

            $swipe.show()
            setTimeout(function(){

                $swipe.find('.mobile-experience-agreement').css({
                    height: $swipe.height()
                });

                SwipeSection.doLeftSwipeSection(0, function(){
                    $swipe.find('.mobile-experience-agreement').css({
                        height: $swipe.height()
                    })
                })
            }, 1)
        }
        // 关闭租用协议
        function closeAgreement(){

            SwipeSection.backLeftSwipeSection()
        }

        tcb.bindEvent({
            '.js-trigger-show-service-content': function (e) {
                e.preventDefault()

                showAgreement()
            },
            // 不同意租用协议
            '.btn-prd-buy-cancel': function(e){
                e.preventDefault();

                $('.js-trigger-show-service-content').find('i').removeClass('checked')
                $('.js-btn-confirm-order').addClass('btn-disabled')

                closeAgreement()
            },
            // 同意租用协议
            '.btn-prd-buy-confirm': function(e){
                e.preventDefault();

                $('.js-trigger-show-service-content').find('i').addClass('checked')
                $('.js-btn-confirm-order').removeClass('btn-disabled')

                closeAgreement()
            },
            '.js-btn-confirm-order': function (e) {
                e.preventDefault()
                var $this = $(this)
                if($this.hasClass('btn-disabled')){
                    $.errorAnimate($('.service-agree'))
                    return
                }

                var url = '/rent/rentWait'


                url = tcb.setUrl(url, {
                    product_id: $.queryUrl(window.location.href)['product_id'],
                    treaty_day: $.queryUrl(window.location.href)['treaty_day']
                })
                window.location.href = url
            },
            '.js-pay-method .method-item': function (e) {
                e.preventDefault()
                var $me = $(this)
                var flag_name = $me.attr('data-flag')
                var $desc = $me.parent().siblings('.desc')

                $me.addClass('active').siblings().removeClass('active')
                $desc.text(__Data[flag_name]['item_desc'])
                $('.txt-per').hide();
                $('#per_price_'+flag_name).show();
            }
        })


    })
})()