// 优品下单页面，登陆
$ ( function () {

    // 登录表单相关功能
    window.Bang.LoginFormByMobile({
        form_action: '/youpin/aj_my_login',
        selector_form: W('#JsTInfoMobileLoginForm'),
        selector_get_secode: '.user-mobile-check-order-panel-getsecode',
        selector_vcode_img: '.vcode-img',
        class_get_secode_disabled: 'user-mobile-check-order-panel-getsecode-disabled'
    }, function(res){
        window.location.href = window.location.href
    })

    // 下单页面登录面板的关闭按钮
    var $BackClose = W('#JsTInfoMobileLoginForm').ancestorNodes('.tinfo-login-panel').query('.btn-go-back-close')
    if ($BackClose && $BackClose.length){
        $BackClose.on('click', function(e){
            e.preventDefault();

            window.history.back();

            setTimeout(function(){
                var query = tcb.queryUrl(window.location.search),
                    product_id = query['product_id'];

                window.location.href = tcb.setUrl2('/youpin/product/'+product_id+'.html', {})
            }, 1000);
        });
    }
} )