!function () {
    setupAppFullScreenStyle()

    // 装载APP通屏模式下的样式
    function setupAppFullScreenStyle() {
        if (window.__IS_APP_FULL_SCREEN_VERSION) {
            tcb.js2AppGetBarHeight(function (statusBarHeight, navBarHeight) {
                var doc = document,
                    head = doc.getElementsByTagName('head')[0],
                    style = doc.createElement('style'),
                    cssText = ''
                if (statusBarHeight) {
                    window.__HEADER_STATUS_BAR = statusBarHeight
                    cssText += 'header.header .header-status-bar,.header-placeholder .header-status-bar-placeholder{height:' + statusBarHeight + 'px;}'
                }
                if (navBarHeight) {
                    window.__HEADER_NAV_BAR = navBarHeight
                    cssText += 'header.header .header-nav-bar,.header-placeholder .header-nav-bar-placeholder{height:' + navBarHeight + 'px;}'
                } else {
                    window.__HEADER_NAV_BAR = $('header.header .header-nav-bar').height()
                }
                style.type = 'text/css'

                if (!cssText) {
                    return
                }
                try {
                    style.appendChild(doc.createTextNode(cssText))
                } catch (e) {
                    style.styleSheet.cssText = cssText
                }
                head.appendChild(style)
            })
        }
    }
}()
