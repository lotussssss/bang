!function () {
    if (window.__PageSymbol != 'tinfo') {
        return
    }

    Dom.ready (function () {
        var wCover = W ('.panel-cover-vip-user-sf-free')
        var wPanel = W ('.panel-vip-user-sf-free')

        function showPanelVipUserSFFree () {
            if (QW.Cookie.get ('tinfo_vip_user_sf_free_not_show_again')) {
                return
            }

            wCover.show ()
            wPanel.show ()
            resetPosition ()
        }

        function bindEvent () {
            tcb.bindEvent (document.body, {
                '.btn-confirm-vip-user-sf-free' : function (e) {
                    e.preventDefault ()

                    if (W ('[name="not_show_again"]').attr ('checked')) {
                        QW.Cookie.set ('tinfo_vip_user_sf_free_not_show_again', '1')
                    }
                    wCover.fadeOut ()
                    wPanel.fadeOut ()
                }
            })
        }

        // 重置登录框的位置
        function resetPosition () {
            var rect = wPanel.getRect (),
                width = rect[ 'width' ],
                win_rect = QW.DomU.getDocRect (),
                win_width = win_rect[ 'width' ],
                doc_width = win_rect[ 'scrollWidth' ],
                doc_height = win_rect[ 'scrollHeight' ],
                left = (win_width - width) / 2

            if (left > 0) {
                wPanel.css ({
                    'left' : left,
                    'margin' : '0'
                })
            }
            wCover.css ({
                'width' : doc_width,
                'height' : doc_height
            })
        }


        function init () {
            showPanelVipUserSFFree ()
            bindEvent ()
        }

        if (wPanel && wPanel.length) {
            init ()
        }

    })

} ()