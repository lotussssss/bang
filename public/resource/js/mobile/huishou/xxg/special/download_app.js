// 企业版APP下载
!function () {
    if (window.__PAGE !== 'xxg-special-download-app') {
        return
    }
} ()

// 智能验机APP下载
!function () {
    if (window.__PAGE !== 'xxg-special-download-app-intelligent-assess') {
        return
    }

    $ (function () {
        function setCheckQRCodeTab(){
            var
                u = navigator.userAgent,
                is_iOS = !!u.match (/\(i[^;]+;( U;)? CPU.+Mac OS X/)

            // 基于平台设置不同的默认选中qrcode
            if (is_iOS){
                $('.qrcode-tit[data-type="ios"]').closest('li').addClass('cur').siblings().removeClass('cur')
                $('.qrcode-img').hide().filter('[data-type="ios"]').show()
            } else {
                $('.qrcode-tit[data-type="android"]').closest('li').addClass('cur').siblings().removeClass('cur')
                $('.qrcode-img').hide().filter('[data-type="android"]').show()
            }

            $('.qrcode-tit').on('click', function(e){
                e.preventDefault()

                var
                    $me = $(this),
                    type = $me.attr('data-type')

                $me.closest('li').addClass('cur').siblings().removeClass('cur')

                $('.qrcode-img').hide().filter('[data-type="'+type+'"]').show()

            })
        }
        setCheckQRCodeTab()

    })

} ()