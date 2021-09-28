(function(){
    window.Bang = window.Bang || {};

    var __options = {
        hash: '',
        img: '',
        ext_html: ''
    };
    /**
     * 分享引导
     */
    function activeShareIntro(options){
        __options = options || {};

        var $share_intro = $('.m-fenxiang-intro-wrap');
        if (!$share_intro.length) {
            var html_str = '<div class="m-fenxiang-intro-wrap">'
                +'<a class="m-fenxiang-intro-bg" href="#"></a>'
                +'<div class="m-fenxiang-intro-inner">' +
                '<a class="m-fenxiang-intro" href="#">' +
                '<img class="w100" src="'+(__options.img ? __options.img : 'https://p.ssl.qhimg.com/t010deb0787edd39c10.png')+'" alt=""/>';

            if (__options&&__options['ext_html']){
                html_str += __options['ext_html'];
            }
            html_str += '</a> </div> </div>';

            var mask_h = $('body').height(),
                window_h = $(window).height();
            if (mask_h<window_h){
                mask_h = window_h;
            }

            var $html_str = $(html_str);
            $html_str.appendTo('body').css({
                'height': mask_h
            });

            setTimeout(function(){
                var mask_h = $('body').height(),
                    window_h = $(window).height();
                if (mask_h<window_h){
                    mask_h = window_h;
                }
                $html_str.css({
                    'height': mask_h
                });
            }, 1000);

            $share_intro = $('.m-fenxiang-intro-wrap');
        }

        $(window).scrollTop(0);


        var $mainbody = $('.mainbody');
        if( $mainbody && $mainbody.length ){
            $mainbody.addClass('blur');
        }

        $share_intro.show();
    }
    /**
     * 关闭分享弹层
     */
    function closeShareIntro(){
        var $intro = $('.m-fenxiang-intro-wrap');
        if ($intro.length) {
            $intro.remove();
        }

        var hash = __options['hash'] || '';
        if (hash) {
            var hashs = tcb.parseHash(window.location.hash);
            // hashs的kv对象中拥有此hash
            if ( typeof hashs[hash]!=='undefined' ) {
                delete hashs[hash];
            }

            window.location.hash = $.param(hashs)
        }

        var $mainbody = $('.mainbody');
        if( $mainbody && $mainbody.length ){
            $mainbody.removeClass('blur');
        }
    }

    function init(){

        tcb.bindEvent({
            // 关闭分享引导
            '.m-fenxiang-intro-bg, .m-fenxiang-intro': function(e){
                e.preventDefault();
                closeShareIntro();
            }

        });

    }
    init();

    window.Bang.ShareIntro = {
        active: activeShareIntro,
        close: closeShareIntro
    };
}());