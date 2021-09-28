// 试用通用js
(function(){

    $(function(){
        tcb.bindEvent(document.body, {
            // 显示“我的订单”入口qrcode
            '.js-myorder-enter-qrcode-trigger': function(e){
                e.preventDefault();

                var html_fn  = $.tmpl( $.trim($('#JsMyorderEnterQrcodeTpl').html()) ),
                    html_str = html_fn({});

                tcb.showDialog(html_str, 'myorder-enter-qrcode-wrap');
            }

        })

        // 处理右边浮层广告在小窗口中的显示效果
        function floatCardFixed(){
            var wFloatWrap2 = $('.js-float-card-fixed');
            if ( !(wFloatWrap2 && wFloatWrap2.length) ) {
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
                var wRightService = wFloatWrap2.find('.right-service');
                if (wRightService && wRightService.length) {
                    var wRightService_width = wRightService.width()

                    if (client_x<(1200+wRightService_width*2+2)){
                        wRightService.css({
                            'position': 'fixed',
                            'right': '1px'
                        });
                    }else {
                        wRightService.css({
                            'position': '',
                            'right': ''
                        });
                    }
                }
            }

            $(window).on('load', setFloatCardFixed);
            $(window).on('resize', setFloatCardFixed);
            setTimeout(setFloatCardFixed, 2000)
        }
        floatCardFixed()

        function loadSobotZhiChi(){
            if (window.NONE_ONLINE_SERVICE){
                return
            }
            setTimeout (function () {
                var
                    protocol = 'https://',
                    s = document.createElement ('script'),
                    b = document.getElementsByTagName ('body')[0]

                s.type = 'text/javascript'
                s.async = true
                s.id = 'zhichiload'
                s.className = 'right-service-btn'
                s.src = protocol + 'www.sobot.com/chat/pc/pc.min.js?sysNum=741e6f02f6794194967e733576170632'

                b.appendChild (s)
            }, 0)
            tcb.bindEvent(document.body, {
                '.right-service-btn': function(e){
                    e.preventDefault()
                }
            })
        }
        loadSobotZhiChi()

    })

}());
