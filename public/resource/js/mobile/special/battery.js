$(function () {
    var __Cache = {
        'selected_options': []
    };
    var Bang = window.Bang || {},
        ShareIntro = Bang.ShareIntro;

    function setBodyMinHeight(){
        var $win  = $(window),
            $body = $('body');

        var win_height = $win.height();
        if ($body.height()<win_height){
            $body.css({
                'min-height': win_height
            });
        }
    }
    setBodyMinHeight();

    // 电池性能检测
    (function () {
        var $BatteryTesting = $('.page-hd-battery-testing');
        if ( !($BatteryTesting && $BatteryTesting.length) ) {
            return ;
        }

        var housailei = ['11', '12', '13', '21', '31'],
            houkeyi   = ['22', '32', '41', '42', '51', '52'],
            houbuzhu  = ['23', '33', '43', '53'];

        tcb.bindEvent({
            '.btn-share': function(e){
                e.preventDefault();

                ShareIntro.active();
            },
            // 显示如何保养弹窗
            '.btn-battery-care': function(e){
                e.preventDefault();

                var cont_str = $.tmpl( $.trim($('#JsBatteryTestingBaoyangTpl').html()) );
                tcb.showDialog(cont_str);
            },
            // 选择电池测评选项
            '.options-list .item': function(e){
                e.preventDefault();

                var $me = $(this),
                    data_id = $me.attr('data-id'),
                    $list = $me.closest('.options-list'),
                    data_step = $list.attr('data-step'),
                    $list_all = $('.options-list');

                if ($list.attr('data-step')==='1'){
                    __Cache['selected_options'] = [];
                } else {
                    __Cache['selected_options'].push(data_id);
                }

                var $list_next = $list_all.filter(function () {
                    return $(this).attr('data-step')==(data_step-0+1);
                });

                setTimeout(function(){

                    if ($list_next&&$list_next.length){
                        $list_all.hide();
                        $list_next.show();
                        $('.options-tit').html($list_next.attr('data-tit'));
                    } else {
                        var url_query = tcb.queryUrl(window.location.search);

                        url_query['_from'] = 'result';

                        var selected_options = __Cache['selected_options'].join('');

                        // 猴赛雷
                        if (tcb.inArray(selected_options, housailei)>-1){
                            url_query['result'] = '1';
                        }
                        // 猴可以
                        if (tcb.inArray(selected_options, houkeyi)>-1){
                            url_query['result'] = '2';
                        }
                        // 猴不住
                        if (tcb.inArray(selected_options, houbuzhu)>-1){
                            url_query['result'] = '3';
                        }

                        window.location.href = tcb.setUrl(window.location.href, url_query);
                    }

                }, 400);

            }
        });

        // 微信分享
        wx.ready(function(){
            var noop = function(){};
            var wxData = {},
                desc = {
                    1 : '我的手机电池测试结果是“猴赛雷”（不错哦），可以扛到iPhone8没问题，你的呢？',
                    2 : '我的手机电池测试结果是“猴可以”（一般般），带上充电宝出门无压力，还有比我差的吗？',
                    3 : '我的手机电池测试结果是“猴不住”（不行啦），还没爆炸已是万幸，你的能比我好到哪儿去？'
                };
            var url_query = tcb.queryUrl(window.location.search),
                result = url_query['result'] || 0;

            // 微信分享的数据
            wxData = {
                "title" : '你的电池还能扛多久？测测看吧！',
                "desc"  : desc[result]||'你的电池还能扛多久？测测看吧！',
                "link" :  window.location.href.split('?')[0],
                "imgUrl" : 'https://p.ssl.qhimg.com/t015cacc35ec01fc00b.png',
                "success": noop, // 用户确认分享的回调
                "cancel" : noop  // 用户取消分享
            };

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage(wxData);
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline(wxData);
            //分享到QQ
            wx.onMenuShareQQ(wxData);
        });


    }());


    // 活动页
    (function(){
        var $Battery = $('.page-hd-battery');
        if ( !($Battery && $Battery.length) ) {
            return ;
        }

        var $slideWrap = $('.slide-shower-wrap');
        var $nav = $slideWrap.find('.slide-nav'),
            $nitem;

        var $sitem = $slideWrap.find('.s-item');
        if(!$sitem.length){
            return;
        }

        if($nav.length){
            $nitem= $nav.children();

            if(!$nitem.length){
                var nav_item_str = '';
                for(var i=0; i<$sitem.length; i++){
                    nav_item_str += i==0?'<span class="cur"></span>':'<span></span>';
                }
                $nitem = $(nav_item_str).appendTo($nav);
            }
            if (parseInt($slideWrap.attr('data-hidenav'), 10)){
                $nav.hide();
            }
        }

        // 初始化slide滑动
        var objSwipe = Swipe($slideWrap[0], {
            startSlide: 0,
            speed: 400,
            auto: $slideWrap.attr('data-auto')||0,
            continuous: true,
            disableScroll: false,
            stopPropagation: false,
            callback: function(index, element) {
                if($nitem && $nitem.length){
                    if($nitem.length<3&&this.continuous){
                        $nitem.removeClass('cur').eq(index%$nitem.length).addClass('cur');
                    } else {
                        $nitem.removeClass('cur').eq(index).addClass('cur');
                    }
                }
            },
            transitionEnd: function(index, element) {   }
        });


        wx.ready(function(){
            var noop = function(){};
            var wxData = {};

            // 微信分享的数据
            wxData = {
                "title" : '98元，复活你的手机电池！',
                "desc" : '98元，复活你的手机电池！',
                "link" :  window.location.protocol+'//'+window.location.host+window.location.pathname,
                "imgUrl" : 'https://p.ssl.qhimg.com/t011c8af1fe6afe3ee7.png',
                "success": noop, // 用户确认分享的回调
                "cancel": noop // 用户取消分享
            };

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage(wxData);
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline(wxData);
            //分享到QQ
            wx.onMenuShareQQ(wxData);
        });

    }());
});



