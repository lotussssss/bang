$(function(){
    // 顶部banner小动画
    function topBannerAnim(){
        var __C = tcb.cache('top_banner_nav_timeout_handle', {});
        // 设置nav的初始位置
        tcb.cache('top_banner_nav_pos', 0);

        var $nav = $('.banner-nav'),
            $nav_item = $nav.find('span');

        // 切换颜色
        $nav_item.on('click', function(e){
            e.preventDefault();

            var $me = $(this),
                pos = parseInt( $me.index(), 10);

            switchFade(pos, function(){

                autoSwitch();
            });
        });

        function switchFade(pos, callback){
            clearTimeout(__C['handle']);

            var cur_pos = tcb.cache('top_banner_nav_pos')||0,
                tar_pos;
            if (typeof pos!=='number') {
                callback = pos;
                pos = cur_pos+1;
            }
            tar_pos = tcb.cache('top_banner_nav_pos', pos);

            var $banner = $('.top-banner'),
                $items  = $banner.find('.item');

            var $nav = $('.banner-nav'),
                $nav_item = $nav.find('span');

            if ($items.length === tar_pos){
                tar_pos = tcb.cache('top_banner_nav_pos', 0);
            }

            var $current = $items.eq(cur_pos),
                $target  = $items.eq(tar_pos);

            $nav_item.eq(tar_pos).addClass('cur').siblings('.cur').removeClass('cur');

            $current.css({
                'display': 'block',
                'z-index': 9,
                'opacity': 1
            }).siblings('.item').hide();

            $target.css({
                'display': 'block',
                'z-index': 8,
                'opacity': 1
            });

            $current.animate({
                'opacity': 0
            }, 1200, function(){

                $current.css({
                    'display': 'none',
                    'z-index': 0
                });

                $target.css({
                    'z-index': 9
                });
                typeof callback === 'function' && callback();
            });
        }

        function autoSwitch(){
            __C['handle'] = setTimeout(function(){

                var args = arguments;

                switchFade(function(){

                    __C['handle'] = setTimeout(args.callee, 4000);

                });

            }, 4000);
        }
        autoSwitch();
    }
    topBannerAnim();


    tcb.bindEvent(document.body, {
        // 到店换新
        '.btn-ddhx': function(e){
            e.preventDefault();

            $(window).scrollTop($('#DaoDianHuanxinScrollPos').offset()['top']);
        },
        // 触发邮寄换新
        '.btn-yjhx': function(e){
            e.preventDefault();

            var $me = $(this),
                url = $me.attr('href');

            var html_fn  = $.tmpl( $.trim($('#JsSuning2SelectProductTpl').html()) ),
                html_str = html_fn({

                });

            tcb.showDialog(html_str, 'dialog-suning2-select-product-wrap');
        }
    });
});
