$(function () {

    var $ColorIphone = $('.page-hd-color-iphone');
    if ( !($ColorIphone && $ColorIphone.length) ) {
        return ;
    }

    // 维修介绍滑动图
    function initTopSlide(){
        var $slideWrap = $('#TopSlide');
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
                    nav_item_str += i==0?'<span class="nav-'+i+' cur"></span>':'<span class="nav-'+i+'"></span>';
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

        //setTimeout(function(){
        //    objSwipe.next();
        //}, 1000);
        //console.log(objSwipe)

        var $showcover = $('.slide-shower-cover');
        $showcover.on('swipeLeft', function(e){
            e.preventDefault();

            objSwipe.next();
        });
        $showcover.on('swipeRight', function(e){
            e.preventDefault();

            objSwipe.prev();
        });
    }
    initTopSlide();

    // 维修介绍滑动图
    function initWeiXiuIntroSlide(){
        var $slideWrap = $('#WeiXiuIntroSlide');
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

    }
    initWeiXiuIntroSlide();

    // 图片懒加载
    tcb.lazyLoadImg({
        delay: 400,
        interval: 100
    });
});

wx.ready(function(){
    var noop = function(){};
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title" : '连天才的乔布斯都无法想象到，iPhone可以如此惊艳！',
        "desc" : '我已经找到了属于我的颜色，你喜欢哪种呢？',
        "link" :  window.location.protocol+'//'+window.location.host+window.location.pathname,
        "imgUrl" : 'https://p.ssl.qhimg.com/t019f512e77b0ad900f.png',
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
