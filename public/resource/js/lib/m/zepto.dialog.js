;(function ($) {

    var Dialog = (function () {
        function showMask() {
            return setZIndex($('<div class="bang-ui-dialog"></div>').appendTo('body'))
        }

        function show(txt) {
            var $box = showMask()
            var $cntBox = $('<div class="dialog-content"><span class="close iconfont icon-close">x</span><div class="dialog-txt">' + txt + '</div></div>').appendTo($box)

            $cntBox.find('.close').on('click', function (e) {
                e.preventDefault()
                hide()
            })
            return $box
        }

        function showBox(cnt) {
            var $box = showMask()
            return $box.html(cnt)
        }

        function alert(txt, callback, options) {
            options = options || {}
            var $box = show('<div>' + txt + '</div>' +
                '<div class="btn-box btn-box-alert">' +
                '<input class="ui-btn" type="button" value="' + (options.btn || '确定') + '"/>' +
                '</div>')
            var $close = $box.find('.close')
            var $btn = $box.find('.btn-box .ui-btn')
            if (options.className) {
                $box.addClass(options.className)
            }
            if (options.lock) {
                $btn.addClass('ui-btn-disabled')
                var text = $btn.val()
                var duration = parseInt(options.lock, 10) || 3
                $btn.val(text + '（' + duration + 's）')
                setTimeout(function countdown() {
                    duration--
                    if (duration > 0) {
                        $btn.val(text + '（' + duration + 's）')
                        setTimeout(countdown, 1000)
                    } else {
                        $btn.removeClass('ui-btn-disabled').val(text)
                    }
                }, 1000)
            }
            $close.hide()
            $btn.on('click', function () {
                var $me = $(this)
                if ($me.hasClass('ui-btn-disabled')) {
                    return
                }
                if (typeof (callback) == 'function') {
                    (callback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            return $box
        }

        function confirm(txt, succCallback, failCallback, options) {
            options = options || {}
            var $box = show('<div>' + txt + '</div>' +
                '<div class="btn-box btn-box-confirm">' +
                '<input class="ui-btn ui-btn-fail" type="button" value="' + (options.textCancel || '取消') + '"/>' +
                '<input class="ui-btn ui-btn-succ" type="button" value="' + (options.textConfirm || '确定') + '"/></div>')
            var $close = $box.find('.close')
            var $btn = $box.find('.btn-box .ui-btn')
            var $btnCancel = $btn.filter('.ui-btn-fail')
            var $btnConfirm = $btn.filter('.ui-btn-succ')

            if (options.className) {
                $box.addClass(options.className)
            }
            if (options.lock) {
                $btnConfirm.addClass('ui-btn-disabled')
                var text = $btnConfirm.val()
                var duration = parseInt(options.lock, 10) || 3
                $btnConfirm.val(text + '（' + duration + 's）')
                setTimeout(function countdown() {
                    duration--
                    if (duration > 0) {
                        $btnConfirm.val(text + '（' + duration + 's）')
                        setTimeout(countdown, 1000)
                    } else {
                        $btnConfirm.removeClass('ui-btn-disabled').val(text)
                    }
                }, 1000)
            }
            $close.hide()

            $btnConfirm.on('click', function () {
                var $me = $(this)
                if ($me.hasClass('ui-btn-disabled')) {
                    return
                }

                if (typeof succCallback === 'function') {
                    (succCallback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            $btnCancel.on('click', function () {
                if (typeof failCallback === 'function') {
                    (failCallback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            return $box
        }

        function prompt(txt, succCallback, failCallback) {

            var $box = show('<div>' + txt + '</div><div class="ui-txt-input"><input type="text" /></div><div class="btn-box btn-box-prompt"><input class="ui-btn ui-btn-fail" type="button" value=" 取消 "  /><input class="ui-btn ui-btn-succ" type="button" value=" 确定 "  /></div>')
            $box.find('.close').hide()

            var btns = $box.find('.btn-box .ui-btn')

            var txtIpt = $box.find('.ui-txt-input input')

            btns.filter('.ui-btn-succ').on('click', function () {
                if (typeof (succCallback) == 'function') {
                    (succCallback(txtIpt.val() || '') !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            btns.filter('.ui-btn-fail').on('click', function () {
                if (typeof (failCallback) == 'function') {
                    (failCallback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            return $box
        }

        function toast(txt, time) {
            // 判断当前页面是否已存在 toast
            var $eleToast = $('body').find('.bang-ui-dialog-toast') || []
            if ($eleToast.length > 0) return

            var $box = setZIndex($('<div class="bang-ui-dialog-toast"><span>' + txt + '</span></div>').appendTo('body'))

            setTimeout(function () { $box.animate({'opacity': '0'}, 300, function () { $(this).remove() }) }, time || 1500)

            return $box
        }

        function popup(txt) {
            var $box = showMask()

            var popup = $('<div class="bang-ui-dialog-popup">' + txt + '</div>').appendTo($box)

            setTimeout(function () {
                popup.css({
                    '-webkit-transform': 'translateY(0)',
                    'transform': 'translateY(0)'
                })
            }, 50)

            $box.on('click', function (e) {
                popup.animate({'translateY': '100%'}, 300, function () {
                    try { $box.remove() } catch (ex) {}
                })
            })

            return $box
        }

        function hide($box) {
            if (!($box && $box.length)) {
                $box = $('.bang-ui-dialog')
            }
            $box.remove()
        }

        return {
            'show': show,
            'showBox': showBox,
            'hide': hide,
            'alert': alert,
            'confirm': confirm,
            'prompt': prompt,
            'toast': toast,
            'popup': popup
        }
    })()

    function setZIndex($el) {
        if (typeof tcb !== 'undefined' && tcb.zIndex) {
            $el.css({'z-index': tcb.zIndex()})
        }
        return $el
    }

    $.dialog = Dialog

})(Zepto)
