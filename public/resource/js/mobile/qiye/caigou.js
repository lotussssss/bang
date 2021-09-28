tcb.bindEvent(document.body,{
    '.submit-caigou-form .focus':{
        'focus':function(e){
            var me = $(this);
            me.css('border','1px solid #54bf8d');
        },
        'blur':function(e){
            var me = $(this);
            me.css('border','1px solid #ccc');
        }
    },
    '[name="remark"]':{
        'keydown keyup change':function(e){
            var me = $(this);
            if(me.val().length>200){
                me.val(me.val().substring(0,200));
                alert('请输入200字以内！');
            }
            if(me.val().length>0){
                me.css('background-image','none');
            }else{
                me.css('background-image','url("https://p.ssl.qhimg.com/t013ec9a5707b15aeda.png")');
            }
        }
    },
    '.secode-pic img':function(e){
        e.preventDefault();
        var pic_url = '/secode/?rands='+tcb.genRandomNum();
        $(this).attr('src',pic_url);
    },
    '.form-succ-btn':function(e){
        e.preventDefault();
        $('.form-succ-tip').hide();
    }
});
//提交表单
(function(){
    // 回收信息表单提交
    $('#SubmitCaigouForm').on('submit', function(e){
        e.preventDefault();

        var $form = $(this);

        // 验证表单
        if (!validCaigouForm($form)){
            return ;
        }

        $.post($form.attr('action'), $form.serialize(), function(res){
            res = $.parseJSON(res);
            var secode_pic = $('.secode-pic img');
            var pic_url = '/secode/?rands='+tcb.genRandomNum();
            if (!res['errno']){
                var result = res['result'];
                //刷新验证码
                secode_pic.attr('src',pic_url);
                //提交成功提示
                $('.form-succ-tip').show();
                $form[0].reset();
            } else {
                alert(res['errmsg']);
                // 刷新验证码
                secode_pic.attr('src',pic_url);
            }
        });

    });

    // 验证表单
    function validCaigouForm($form){
        if ( !($form&&$form.length) ){
            return false;
        }
        var flag = true,
            $firt_error_el = null,
            delay = 120,
            delay_fix = -20;

        var $email = $form.find('.email'),
            $contact_person = $form.find('.contact-person'),
            $tel = $form.find('.tel'),
            $secode = $form.find('.secode'),
            $re_info = $form.find('.re-info');

        // 验证联系人
        if ( !($contact_person&&$contact_person.length&&$.trim($contact_person.val())) ) {
            if ($contact_person&&$contact_person.length) {
                $firt_error_el = $firt_error_el ? $firt_error_el : $contact_person;
                setTimeout(function(){
                    $contact_person.shine4Error();
                }, delay);
            }
            flag = false;
        }
        // 验证邮箱
        if ( !($email&&$email.length&&tcb.validEmail($.trim($email.val()))) ) {
            if ($email&&$email.length) {
                $firt_error_el = $firt_error_el ? $firt_error_el : $email;
                setTimeout(function(){
                    $email.shine4Error();
                }, delay);
            }
            flag = false;
        }
        // 验证联系电话
        if ( !($tel&&$tel.length&&tcb.validMobile($.trim($tel.val()))) ) {
            if ($tel&&$tel.length) {
                $firt_error_el = $firt_error_el ? $firt_error_el : $tel;
                setTimeout(function(){
                    $tel.shine4Error();
                }, delay);
            }
            flag = false;
        }
        // 验证图片验证码
        if ( !($secode&&$secode.length&&$.trim($secode.val())) ) {
            if ($secode&&$secode.length) {
                $firt_error_el = $firt_error_el ? $firt_error_el : $secode;
                setTimeout(function(){
                    $secode.shine4Error();
                }, delay);
            }
            flag = false;
        }
        // 验证回复信息
        if ( !($re_info&&$re_info.length&&$.trim($re_info.val())) ) {
            if ($re_info&&$re_info.length) {
                $firt_error_el = $firt_error_el ? $firt_error_el : $re_info;
                setTimeout(function(){
                    $re_info.shine4Error();
                }, delay);
                if($re_info.val().length>200){

                    $re_info.val($re_info.val().substring(0,200));
                    $.dialog.toast('请输入200字以内！');
                }
            }
            flag = false;
        }
        if (!flag) {
            var $step_block = $firt_error_el.closest('div');

            $.scrollTo({
                endY: $step_block.offset()['top']-10,
                duration: delay+delay_fix,
                callback: function(){
                    $firt_error_el.focus();
                }
            });
        }

        return flag;
    }
    //轮播
    var $banner = $(".block1");
    var $commpany = $(".block-banner-tab");
    var $pages = $banner.find(".block_inner");
    var $controls = $commpany.find("span");
    var sliderTimer = null;
    var options = {
        max : $controls.length || 4,
        idx : 0,
        curP : 0,
        time : 3000,
        isCan : true
    };
    var bannerSwitch = function(idx){
        var active = "active";
        var show   = "show";
        if(idx >= -1 && idx < options.max && idx != options.curP && options.isCan){
            options.isCan = false;
            clearTimeout(sliderTimer);
            idx = idx == -1 ? options.max : idx;
            options.idx = idx;
            $controls.removeClass(active).eq(idx).addClass(active);
            $pages.removeClass(show).css("opacity",0);
            $pages.eq(idx).addClass(show).css({opacity:0}).animate({opacity:1},400,function(){
                options.isCan = true;
                options.curP = idx;
                sliderTimer = setTimeout(function(){
                    bannerSwitch((options.idx + 1) % options.max);
                },options.time);
            });
        }
    }
    sliderTimer = setTimeout(function(){
        bannerSwitch((options.idx + 1) % options.max);
    },options.time);
    $controls.on("click",function(){
        bannerSwitch($controls.index(this));
    });
    $(".jump-to-buy").on("click", function(){
        setTimeout(function(){
            $(window).scrollTop($('.to-write-info').offset()['top']);
        },100);
    });
    //触摸滚动
    /*
    var startX = 0,
        moveX = 0,
        tX = 0;
    $banner.on("touchstart", function (e) {
        startX = e.touches[0].pageX;
    }).on("touchmove", function (e) {
        e.preventDefault();
        moveX = e.touches[0].pageX - startX;
    }).on("touchend", function (e) {
        tX += moveX;
        if(tX < 0 && Math.abs(tX) > 30){
            bannerSwitch((options.idx + 1) % options.max);
        }
        if(tX > 0 && Math.abs(tX) > 30){
            bannerSwitch((options.idx - 1) % options.max);
        }
        tX = 0;
    });
    */
}());
if (typeof wx !== 'undefined') {
    wx.ready(function(){

        var noop = function(){};
        var wxData = {};

        // 微信分享的数据
        wxData = {
            "title" : '同城帮企业采购',
            "desc" : '同城帮新增企业采购业务，企业/大客户们赶紧享受vip待遇吧!',
            "link" :  window.location.protocol+'//'+window.location.host+window.location.pathname,
            "imgUrl" : 'https://p.ssl.qhimg.com/t01c4ed54419b5681a5.jpg',
            "success": noop, // 用户确认分享的回调
            "cancel": noop // 用户取消分享
        };

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        wx.onMenuShareAppMessage(wxData);
        // 点击分享到朋友圈，会执行下面这个代码
        wx.onMenuShareTimeline(wxData);
        //分享到QQ
        wx.onMenuShareQQ(wxData);

    })
}
