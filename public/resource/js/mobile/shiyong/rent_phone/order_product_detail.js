// 滑动slide
(function () {

    window.mRent = window.mRent || {}

    var
        selector_wrap = '.slide-shower-wrap',
        selector_item = '.s-item',
        selector_nav = '.slide-nav',
        selector_nav_num = '.slide-nav-num',
        class_nav_cur = 'cur',
        class_item_hide = 's-item-hide',

        data_hide_nav = 'data-hidenav',
        data_hide_nav_num = 'data-hidenav-num',
        data_auto = 'data-auto'

    /**
     * 开启滑动功能
     * @param $slideWrap
     */
    function slide ($slideWrap) {

        $slideWrap = $slideWrap || $ (selector_wrap);

        if (!$slideWrap.length) {
            return;
        }

        var $sitem = $slideWrap.find (selector_item)
        if (!$sitem.length) {
            return;
        }

        // 普通导航点
        var $nav = $slideWrap.find (selector_nav),
            $nitem;
        if ($nav.length) {
            $nitem = $nav.children ();

            if (!$nitem.length) {
                var nav_item_str = '';
                for (var i = 0; i < $sitem.length; i++) {
                    nav_item_str += i == 0
                        ? '<span class="' + class_nav_cur + '"></span>'
                        : '<span></span>';
                }
                $nitem = $ (nav_item_str).appendTo ($nav);
            }

            if (parseInt ($slideWrap.attr (data_hide_nav), 10)) {
                $nav.hide ();
            }
        }
        // 数字导航点
        var $nav_num = $slideWrap.find (selector_nav_num);
        if ($nav_num.length) {
            $nav_num.attr('data-total-num', $sitem.length).html('<i>1</i>/'+$sitem.length)
            if (parseInt ($slideWrap.attr (data_hide_nav_num), 10)) {
                $nav_num.hide ();
            }
        }
        // 滑动item数大于1个才有滑动效果
        if ($sitem.length > 1) {
            $sitem.removeClass (class_item_hide);
            // 初始化slide滑动
            var objSwipe = Swipe ($slideWrap[ 0 ], {
                startSlide      : 0,
                speed           : 400,
                auto            : $slideWrap.attr (data_auto) || 0,
                continuous      : true,
                disableScroll   : false,
                stopPropagation : false,
                callback        : function (index, element) {
                    // 加载图片
                    loadItemImg ()

                    if ($nitem && $nitem.length) {
                        if ($nitem.length < 3 && this.continuous) {
                            $nitem.removeClass (class_nav_cur).eq (index % $nitem.length).addClass (class_nav_cur);
                        } else {
                            $nitem.removeClass (class_nav_cur).eq (index).addClass (class_nav_cur);
                        }
                    }
                    if ($nav_num && $nav_num.length){
                        var html_nav_num = ''
                        if ($nitem.length < 3 && this.continuous) {
                            html_nav_num += (index % $nitem.length+1)
                        } else {
                            html_nav_num += (index + 1)
                        }
                        html_nav_num = '<i>'+html_nav_num+'</i>'
                        html_nav_num += '/'+$nav_num.attr('data-total-num')
                        $nav_num.html(html_nav_num)
                    }
                },
                transitionEnd   : function (index, element) { }
            })

            // 重新获取sitem,当item数量小于3,并且可以循环滑动的时候,$sitem数量会变化
            $sitem = $slideWrap.find (selector_item)

            var
                flag_all_img_loaded = false

            $slideWrap.on ({
                // 实现lazy加载图片的功能
                'touchstart' : function (e) {

                    loadItemImg ()
                }
            })

            // 加载图片
            function loadItemImg () {
                if (flag_all_img_loaded) {
                    // 所有图片都已经加载完成,那么不再执行下边操作
                    return
                }

                var
                    cur_pos = objSwipe.getPos (),
                    len = $sitem.length,
                    next_pos = cur_pos + 1,
                    prev_pos = cur_pos - 1

                if (next_pos == len) {
                    next_pos = 0
                }
                if (prev_pos == -1) {
                    prev_pos = len - 1
                }

                var
                    $next = $sitem.eq (next_pos),
                    $prev = $sitem.eq (prev_pos)

                $next = $($next.concat ($prev))

                tcb.lazyLoadImg (1, $next)

                // 遍历所有图片,判断是不是都已经加载完成了
                $sitem.find ('img').each (function (i, el) {
                    var
                        $el = $ (el),
                        src_img = $el.attr ('src'),
                        data_img = $el.attr ('data-lazysrc')

                    if (data_img) {
                        if (data_img == src_img) {
                            flag_all_img_loaded = true
                        } else {
                            flag_all_img_loaded = false

                            // 还有没加载完的,将flag设置为false,然后退出遍历
                            return false
                        }
                    } else {
                        flag_all_img_loaded = true
                    }
                })

            }

            // 加载图片
            loadItemImg ()
        }
    }


    //====================== Export ========================
    window.mRent.slide = slide

} ())

;(function () {
    $(function () {

        // 详情页
        if(!$('.page-product-detail') || !$('.page-product-detail').length){ return}

        //轮播图
        var $slideWrap = $('.slide-shower-wrap')

        window.mRent.slide($slideWrap)

        //固定写死的两个长图
        var long_img_map = {
            '10138' : 'https://p0.ssl.qhmsg.com/t01a3dfa5e6ee8f999a.jpg',//iphone7
            '10139' : 'https://p0.ssl.qhmsg.com/t013eb6d9585508cfb8.jpg'//iphone6
        }
        var product_id = $.queryUrl(window.location.href)['product_id']
        var load_long_img = loadProductExtendImg(long_img_map[product_id])
        // var load_long_img = loadProductExtendImg('https://p0.ssl.qhmsg.com/t01a3dfa5e6ee8f999a.jpg')
        load_long_img(function (url) {
            var product_detail_img = $('<img src="'+url+'">')
            $('.block-product-extend .product-detail').html(product_detail_img)
        })

        // 事件绑定
        tcb.bindEvent ('.page-product-detail', {

            // 属性选择弹层触发器
            '.js-trigger-attr-selected-panel' : function (e) {
                e.preventDefault ()

                var
                    $me = $ (this),
                    model_id = $me.attr ('data-id')

                if($me.find('.btn-rent-disabled').length){
                    return
                }

                // 设置型号id
                Rent.setModelId (model_id)
                // 异步获取商品列表
                Rent.getModelBucketDataAsync (function (modelBucketData) {

                    Rent.showProductUI (modelBucketData, $me.attr ('data-title'))

                })
            },
            //商品附加信息tab
            '.block-product-extend .extend-item':function (e) {
                e.preventDefault()
                var $me = $(this)
                var $block_product_extend = $me.closest('.block-product-extend')
                var flag_item = $me.attr('data-flag')
                var $active_item = $block_product_extend.find('.'+flag_item)

                $me.addClass('active').siblings().removeClass('active')
                $active_item.show().siblings().hide()

            }

        })

        function loadProductExtendImg(img_url) {
            var is_load
            return function (callback) {
                if(is_load){
                    typeof callback == 'function' && callback(img_url)
                }else{
                    var img = new Image()
                    img.onload = function(){
                        is_load = true
                        typeof callback == 'function' && callback(img_url)
                    }
                    img.onerror = function () {
                        console.log('error')
                    }
                    img.src = img_url
                }
            }
        }
    })
})()
