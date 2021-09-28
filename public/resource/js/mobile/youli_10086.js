$(function(){
    var noop = function(){};
    var wxData = {};
    var history_mobile = '';

    tcb.bindEvent(document.body, {
        // 显示活动规则
        '.page-hd-youli10086 .btn-show-huodongguize': function(e){
            e.preventDefault();

            var html_str = $.tmpl($('#JsMYouLiHuodongguizeDetailTpl').html())();

            tcb.showDialog(html_str, 'huodongguize-detail-wrap');
        },
        '.page-hd-youli1g .btn-show-huodongguize, .page-hd-youli1g .m-youli-fenxiang-intro-xize': function(e){
            e.preventDefault();

            var html_str = $.tmpl($('#JsMYouLiHuodongguizeDetail1GTpl').html())();

            tcb.showDialog(html_str, 'huodongguize-detail-wrap');
        },
        // 显示分享引导
        '.js-show-youli-fenxiang-intro': function(e){
            e.preventDefault();

            var $me = $(this);
            var html_str = $.tmpl($('#JsMYouLiFenxiangIntroTpl').html())({
                'mobile': $me.attr('data-mobile')||''
            });

            $(html_str).appendTo('body').css({
                'height': $('body').height()
            });

            $(window).scrollTop(0);
        },
        // 关闭分享引导
        '.page-hd-youli10086 .m-youli-fenxiang-intro': function(e){
            e.preventDefault();

            var $me = $(this);

            $me.remove();
        },
        '.page-hd-youli1g .m-youli-fenxiang-intro-bg, .page-hd-youli1g .m-youli-fenxiang-intro, .page-hd-youli1g .m-youli-fenxiang-intro-xize': function(e){
            e.preventDefault();

            var $me = $(this);

            $me.closest('.m-youli-fenxiang-intro-wrap').remove();
        },
        // 分享~
        '.shishouqi-result-kexi .btn': function(e){
            e.preventDefault();

            setTimeout(function(){
                tcb.closeDialog();
            }, 10);
        }
    });

    // 输入手机号，试试手气
    $('.page-hd-youli10086 #ShishouqiForm').on('submit', function(e){
        e.preventDefault();

        var $me = $(this),
            flag = $me.attr('data-submit');

        // 正在提交，锁定表单
        if (flag) {
            return false;
        }
        // 验证表单
        if (!validShishouqiForm($me)) {
            return false;
        }

        $me.attr('data-submit', '1');

        var $mobile = $me.find('[name="mobile"]'),
            mobile = $.trim($mobile.val());

        var url_hash = tcb.parseHash( window.location.hash),
            self = url_hash['self'],
            inviter = url_hash['inviter'];

        url_hash['self'] = mobile;
        if (self && self!=history_mobile && self!=mobile) {
            url_hash['inviter'] = self;
        }
        history_mobile = mobile;
        window.location.hash = $.param(url_hash);

        wxData['link'] = window.location.href;

        validHuanxin10086Mobile($mobile, function(res){
            var html_str = '';
            // 非移动号码，验证失败
            if (res['errno']) {

                html_str = $.tmpl($.trim( $('#JsMYouLiKexiNot10086Tpl').html() ))();
            }
            // 是移动号码
            else {
                if (res['result']) {
                    // 属于移动号码，但是非活动范围内号码
                    html_str = $.tmpl($.trim( $('#JsMYouLiKexiTpl').html() ))({
                        'mobile': mobile
                    });
                } else {
                    var url_hash = tcb.parseHash(window.location.hash);
                    // 属于活动范围内移动号码
                    html_str = $.tmpl($.trim( $('#JsMYouLiGongxiTpl').html() ))({
                        'inviter': url_hash['inviter']||''
                    });
                }
            }

            tcb.showDialog(html_str);

            $me.attr('data-submit', '');
        }, function(){

            $me.attr('data-submit', '');
        });
    });

    // 输入手机号，试试手气
    $('.page-hd-youli1g #ShishouqiForm').on('submit', function(e){
        e.preventDefault();

        var $me = $(this),
            flag = $me.attr('data-submit');

        // 正在提交，锁定表单
        if (flag) {
            return false;
        }
        // 验证表单
        if (!validShishouqiForm($me)) {
            return false;
        }

        $me.attr('data-submit', '1');

        var $mobile = $me.find('[name="mobile"]'),
            mobile = $.trim($mobile.val());

        var url_hash = tcb.parseHash( window.location.hash),
            self = url_hash['self'],
            inviter = url_hash['inviter'];

        url_hash['self'] = mobile;
        if (self && self!=history_mobile && self!=mobile) {
            url_hash['inviter'] = self;
        }
        history_mobile = mobile;
        window.location.hash = $.param(url_hash);

        wxData['link'] = window.location.href;

        validHuanxin10086Mobile($mobile, function(res){
            var html_str = '';

            wxData['success'] = noop;
            if (!res['errno']&&!res['result']) {
                // 移动2g/3g

                var url_hash = tcb.parseHash(window.location.hash);
                // 属于活动范围内移动号码
                html_str = $.tmpl($.trim( $('#JsMYouLiGongxi1GTpl').html() ))({
                    'inviter': url_hash['inviter']||''
                });

                tcb.showDialog(html_str);
            }
            else {
                // 非移动2g/3g，直接显示分享引导页面

                html_str = $.tmpl($.trim( $('#JsMYouLiFenxiangIntro1GTpl').html() ))();

                $(html_str).appendTo('body').css({
                    'height': $('body').height()
                });

                $(window).scrollTop(0);

                // 移动非2g/3g用户
                if (!res['errno']&&res['result']) {
                    wxData['success'] = function(){
                        var $intro_wrap = $('.m-youli-fenxiang-intro-wrap');
                        if ($intro_wrap && $intro_wrap.length) {
                            $intro_wrap.remove();
                        }

                        var $goto_huanxin = $('.m-goto-huanxin');
                        if ( !($goto_huanxin && $goto_huanxin.length) ){
                            var str = '以旧换新，0元拿新手机<br>你也能参加！<br><br>即将前往…';
                            $goto_huanxin = $('<div class="m-goto-huanxin"><div class="m-goto-huanxin-inner">'+str+'</div></div>');

                            $goto_huanxin.appendTo('body');
                        }
                        $goto_huanxin.show();

                        setTimeout(function(){
                            window.location.href = '/10086?from=youli1g';
                        }, 3000);
                    };

                    //setTimeout(function(){callback_fn.success()}, 2000);
                }
            }

            $me.attr('data-submit', '');
        }, function(){

            $me.attr('data-submit', '');
        });
    });


    // 验证试手气表单
    function validShishouqiForm($form){
        var flag = true;
        $form = $form || $('#ShishouqiForm');

        var $mobile = $form.find('[name="mobile"]'),
            mobile = $.trim($mobile.val());
        if (!tcb.validMobile(mobile)) {
            $.errorAnimate($mobile.focus());
            flag = false;
        }

        return flag;
    }

    // 验证是否活动内手机号
    function validHuanxin10086Mobile($mobile, callback, callback_fail) {
        var mobile = $.trim( $mobile.val() );

        // 输入数字位数为11+，开始验证手机号
        if (mobile.length==11) {
            if (!tcb.validMobile(mobile)) {
                $.errorAnimate($mobile.focus());

                typeof callback_fail==='function' && callback_fail();
            }
        } else {

            typeof callback_fail==='function' && callback_fail();
        }
    }

    wx.ready(function(){
        // 微信分享的数据
        wxData = {
            "title" : $('title').html(),
            "desc" : "据说比北京摇号的几率还低，你能享受吗？",
            "link" :  window.location.href,
            "imgUrl" : 'https://p.ssl.qhimg.com/t0167374bef4c266f62.jpg',
            "success": noop, // 用户确认分享的回调
            "cancel": noop // 用户取消分享
        };

        if ($('.page-hd-youli1g').length) {
            wxData['desc'] = '流量总是不够用？还不快来领！';
            wxData['imgUrl'] = 'https://p.ssl.qhimg.com/t01d6e8f90c8eacc789.jpg';
        }

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        wx.onMenuShareAppMessage(wxData);
        // 点击分享到朋友圈，会执行下面这个代码
        wx.onMenuShareTimeline(wxData);
        //分享到QQ
        wx.onMenuShareQQ(wxData);
    });

});