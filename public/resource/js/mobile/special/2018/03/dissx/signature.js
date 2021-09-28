// 客户签字
!function () {


    $ (function () {
        window.showPageCustomerSignature = showPageCustomerSignature
        window.signatureFunc= {
            openCustomerSignaturePad:__openCustomerSignaturePad,
            closeCustomerSignaturePad:__closeCustomerSignaturePad,
            clearSignature:__clearSignature,
            confirmSignature:__confirmSignature,
            createImgByPointGroup:__createImgByPointGroup
        }

        var SwipeSection = window.Bang.SwipeSection




        // ************
        // 处理函数
        // ************


        function showPageCustomerSignature () {
            var $swipe = SwipeSection.getSwipeSection ('.swipe-page-customer-signature')
            var html_fn = $.tmpl (tcb.trim ($ ('#JsMXxgOrderCustomerSignatureTpl').html ())),
                html_st = html_fn ()
            SwipeSection.fillSwipeSection (html_st)
            SwipeSection.doLeftSwipeSection ()
        }

        function __openCustomerSignaturePad () {
            var $PadWrap = $ ('#CustomerSignaturePadWrap'),
                $BtnRow = $PadWrap.find ('.customer-signature-pad-btn'),
                $Pad = $PadWrap.find ('.customer-signature-pad'),
                $win = tcb.getWin (),
                w_width = $win.width (),
                w_height = $win.height ()

            $PadWrap.css ({
                display : 'block',
                width   : w_width + 'px',
                height  : w_height + 'px'
            })
            $Pad.css ({
                width  : (w_width - $BtnRow.height ()) + 'px',
                height : w_height + 'px'
            })
            $BtnRow.css ({
                width : w_height + 'px',
                right : '-' + (w_height - $BtnRow.height ()) / 2 + 'px'
            })

            if (!window.instSignaturePad) {
                window.instSignaturePad = window.Bang.SignaturePad ({
                    canvas       : $ ('#CustomerSignaturePadCanvas'),
                    canvasConfig : {
                        penColor        : '#000',
                        penSize         : 3,
                        // backgroundColor : '#cbcbcb'
                    },
                    flagAutoInit : true
                })
            }

            $BtnRow.css ({
                transform : 'rotate(-90deg)'
            })
        }

        function __closeCustomerSignaturePad (callback) {
            var $PadWrap = $ ('#CustomerSignaturePadWrap'),
                $BtnRow = $PadWrap.find ('.customer-signature-pad-btn')

            $PadWrap.hide ()
            $BtnRow.css ({
                transform : 'none'
            })
            typeof callback==='function' && callback()
        }

        function __rotateImg (img, deg, fn) {

            tcb.imageOnload (img, function (imgObj) {

                var w = imgObj.naturalHeight/2,
                    h = imgObj.naturalWidth/2

                var canvas = __createCanvas (w, h),
                    ctx = canvas.getContext ('2d')

                ctx.save ()
                ctx.translate (w, 0)
                ctx.rotate (deg * Math.PI / 180)
                ctx.drawImage (imgObj, 0, 0, h, w)
                ctx.restore ()

                var newImg = ctx.canvas.toDataURL ('image/jpeg')

                typeof fn === 'function' && fn (newImg)
            })
        }

        function __createCanvas (w, h) {
            var canvas = document.createElement ('canvas')

            canvas.width = w
            canvas.height = h
            return canvas
        }

        function __clearSignature(){
            if (window.instSignaturePad && window.instSignaturePad.clearAll) {
                window.instSignaturePad.clearAll ()

                var $trigger = $ ('.swipe-page-customer-signature .js-trigger-active-customer-signature')
                $trigger.css ({
                    fontSize        : '',
                    backgroundImage : ''
                })
            }
        }

        function __confirmSignature(callback){
            if (!window.instSignaturePad) {
                return
            }
            var pointGroups = window.instSignaturePad.getPointGroups ()
            if (!(pointGroups && pointGroups[ 0 ] && pointGroups[ 0 ][ 0 ])) {
                return $.dialog.toast ('请先签名').css ({
                    transform : 'rotate(-90deg)'
                })
            }

            var dataUrl = window.instSignaturePad.toDataUrl ('image/jpeg')
            __rotateImg (dataUrl, 90, function (img) {
                typeof callback==='function' && callback(img,pointGroups)
            })
            __closeCustomerSignaturePad ()
        }
        function __createImgByPointGroup(pointGroups){
            var instSignaturePad = window.Bang.SignaturePad ({
                canvas       : $ ('#CustomerSignaturePadCanvas'),
                canvasConfig : {
                    penColor        : '#000',
                    penSize         : 3,
                },
                flagAutoInit : true
            })
            instSignaturePad.__pointGroups = pointGroups
            return instSignaturePad.toDataUrl ('image/jpeg')
        }
    })
} ()