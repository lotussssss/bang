$ (function () {
    tcb.bindEvent(document.body,{
        // 点击左侧导航栏
        '.left-fixed-tab-list a':function (e) {
            e.preventDefault()

            var $me = $(this),
                data_pos = $me.attr('data-pos'),
                $target_floor = $('.block').filter('[data-floor="'+data_pos+'"]')

            $ ("html,body").animate ({ scrollTop : $target_floor.offset()['top'] }, '500')
        },
        // 回到顶部
        '.trigger-btn-back-top':function (e) {
            e.preventDefault()

            $ ("html,body").animate ({ scrollTop : 0}, '500')
        },
        // 11.11必买清单 点击加载更多
        '.trigger-btn-get-more':function (e) {
            e.preventDefault()

            var me = $(this),
                tr = me.closest('.block-buy-list').find('tr')

            tr.show()
            me.css({'background-color':'#ddd','cursor':'default','color':'#fff'})
        }
    })

    // 输出商品列表
    function renderProductList (price) {
        window.Bang.renderProductList({
            $tpl : $('#JsProductListVer1720Tpl'),
            $target : $('.block-price-'+price+' .ui-sp-product-list-1'),
            request_url : '/youpin/aj_get_goods',
            request_params : {
                pn : 0,
                price : price,
                page_size: 8,
                not_brand:57
            },
            list_params: window.__PARAMS,
            col : 4,
            complete: function(result, $target){}
        })
    }

    renderProductList (1)
    renderProductList (500)
    renderProductList (1000)
    renderProductList (1500)
    renderProductList (2001)

    // 处理左边浮层导航在小窗口中的显示效果
    function floatCardFixed(){
        var $FloatWrap = $('.js-float-card-fixed');
        if ( !($FloatWrap && $FloatWrap.length) ) {
            return ;
        }

        function setFloatCardFixed(e){
            var client_x = 0;
            if (window.innerWidth){
                client_x = window.innerWidth;
            }
            else if ((document.body) && (document.body.clientWidth)){
                client_x = document.body.clientWidth;
            }
            var $Float = $FloatWrap.find('.block-left-fixed-tab');
            if ($Float && $Float.length) {
                var $Float_width = 150||$Float.width()

                if (client_x<(1200+$Float_width*2+2)){
                    $Float.css({
                        'position': 'fixed',
                        'left': '0px'
                    });
                }else {
                    $Float.css({
                        'position': '',
                        'left': ''
                    });
                }
            }
        }

        $(window).on('load', setFloatCardFixed);
        $(window).on('resize', setFloatCardFixed);
        setTimeout(setFloatCardFixed, 2000)
    }
    floatCardFixed()

});