!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }
    var compress_width = 1080,
        compress_height = 1920,
        compress_quality = .7

    var isAutoOrientated

    tcb.checkAutoOrientated &&
    tcb.checkAutoOrientated(function (res) {
        isAutoOrientated = res
    })

    // ************
    // 处理函数
    // ************
    function __bindEvent($wrap) {
        tcb.bindEvent($wrap[0], {
            '.js-trigger-take-photo-imei': function (e) {
                e.preventDefault()
                __triggerStartTakePhotoImei()
            }
        })
    }

    function __bindEventUploadPicture($trigger) {
        $trigger.on('change', function (e) {
            var $me = $(this)

            // 获取文件列表对象
            var files = e.target.files || e.dataTransfer.files,
                file = files[0]

            try {
                // 压缩、上传图片
                __compressUpload(file, $me)
            } catch (ex) {
                // 压缩上传报错失败了，再次尝试用普通方式上传
                tcb.warn(ex)
                __originalUpload(file, $me)
            }
        })
    }

    function __triggerStartTakePhotoImei() {
        if ((window.__IS_XXG_IN_SUNING && !window.__IS_XXG_IN_SUNING_ANDROID) || !tcb.js2AppInvokeTakePicture(function (imgBase64) {
            imgBase64 = imgBase64.indexOf('base64,') > -1
                ? imgBase64
                : 'data:image/png;base64,' + imgBase64
            __suningTakePictureSuccess(imgBase64, $('.js-trigger-take-photo-imei-invoke-camera'))
        })) {
            $('.js-trigger-take-photo-imei-invoke-camera').trigger('click')
        }
    }

    function __suningTakePictureSuccess(img_base64, $trigger) {
        __suningDoCompressImg(img_base64, __generateHandlerCompressImgSuccess($trigger))
    }

    function __suningDoCompressImg(img_base64, callback) {
        var maxSize = 500 * 1024 // 500KB
        var result = img_base64

        if (result.length < maxSize) {
            callback(result)
        } else {
            tcb.imageOnload(result, function (imgObj) {
                var file_type = (result.split(';')[0]).split(':')[1] || ''
                __getCompressedImg(imgObj, file_type, callback)
            })
        }
    }


    function __uploadImgBase64(formData, success, error) {
        __uploadImg(formData, success, error, '/m/doUpdateImgForBase64')
    }

    function __uploadImg(formData, success, error, url) {
        if (!formData) {
            return
        }
        success = $.isFunction(success) ? success : function (data) {
            console.log(data)
        }
        error = $.isFunction(error) ? error : function (xhr, status, err) {
            console.log(err)
        }
        tcb.loadingStart()
        $.ajax({
            url: url ? url : '/m/doUpdateImg',
            type: 'post',
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            data: formData,
            success: success,
            error: error,
            complete: function () {
                $('.js-trigger-take-photo-imei-invoke-camera').val('')
                setTimeout(function () {
                    tcb.loadingDone()
                }, 500)
            }
        })
    }

    function __uploadImgSuccess($trigger) {
        return function (data) {
            if (data && !data.errno) {
                __getImei({
                    imgUrl: data.result
                })
            } else {
                return $.dialog.toast((data && data.errmsg) || '系统错误')
            }
        }
    }

    function __uploadImgFail($trigger) {
        return function (xhr, status, err) {
            $.dialog.toast(xhr.statusText || '上传失败，请稍后再试')
        }
    }

    // 压缩、上传图片
    function __compressUpload(file, $trigger) {
        __doCompressImg(file, __generateHandlerCompressImgSuccess($trigger))
    }

    // 压缩图片
    function __doCompressImg(file, callback) {
        var reader = new FileReader(),
            maxSize = 500 * 1024 // 500KB

        reader.onload = function (e) {
            var result = this.result   //result为data url的形式

            if (result.length < maxSize) {
                callback(result)
            } else {
                tcb.imageOnload(result, function (imgObj) {
                    __getCompressedImg(imgObj, file.type, callback)
                })
            }
        }
        reader.readAsDataURL(file)
    }

    // 获取压缩后的图片
    function __getCompressedImg(img, file_type, callback) {
        EXIF.getData(img, function () {
            var imgObj = this
            var orientation = isAutoOrientated ? 0 : EXIF.getTag(imgObj, 'Orientation')
            var size = __getCompactCompressSize(imgObj.naturalWidth || imgObj.width, imgObj.naturalHeight || imgObj.height),
                w = size[0],
                h = size[1]
            if (orientation == 6 || orientation == 8) {
                w = size[1]
                h = size[0]
            }

            var deg = 0,
                canvas = __createCanvas(w, h),
                ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, w, h)

            switch (orientation) {
                // 正位竖着照
                case 6:
                    ctx.translate(w, 0)
                    deg = 90
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, h, w)
                    break
                // 倒位竖着照
                case 8:
                    ctx.translate(0, h)
                    deg = 270
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, h, w)
                    break
                // 反向横着照
                case 3:
                    ctx.translate(w, h)
                    deg = 180
                    ctx.rotate(deg * Math.PI / 180)
                    ctx.drawImage(imgObj, 0, 0, w, h)
                    break
                default :
                    ctx.drawImage(imgObj, 0, 0, w, h)
                    break
            }

            return callback(ctx.canvas.toDataURL('image/jpeg', compress_quality))
            //return callback(file_type === 'image/png'
            //    ? ctx.canvas.toDataURL (file_type)
            //    : ctx.canvas.toDataURL ('image/jpeg', compress_quality))
        })
    }

    function __createCanvas(w, h) {
        var canvas = tcb.cache('XXG_UPLOAD_PICTURE_CANVAS')
        if (!canvas) {
            canvas = document.createElement('canvas')
            tcb.cache('XXG_UPLOAD_PICTURE_CANVAS', canvas)
        }

        canvas.width = w
        canvas.height = h
        return canvas
    }

    function __getCompactCompressSize(width, height) {
        var w_ratio = Math.min(width, height) / compress_width,
            h_ratio = Math.max(width, height) / compress_height,
            ratio = Math.max(w_ratio, h_ratio)

        if (__isSupportMegaPixelImg()) {
            var ratio_log2 = Math.min(Math.floor(Math.log2(w_ratio)), Math.floor(Math.log2(h_ratio)))

            ratio = Math.pow(2, ratio_log2)
        }

        return [width / ratio, height / ratio]
    }

    function __isSupportMegaPixelImg() {
        var is_support = tcb.cache('IS_SUPPORT_MEGA_PIXEL_IMG')
        if (typeof is_support == 'undefined') {
            var canvas = __createCanvas(2500, 2500)
            is_support = !!(canvas.toDataURL('image/png').indexOf('data:image/png') == 0)
        }
        return is_support
    }

    function __generateHandlerCompressImgSuccess($trigger) {
        return function (imgBase64) {
            var formData = new FormData()
            formData.append('pingzheng', imgBase64)
            __uploadImgBase64(formData, __uploadImgSuccess($trigger), __uploadImgFail($trigger))
        }
    }

    // 原图上传
    function __originalUpload(file, $trigger) {
        var formData = new FormData()
        formData.append('pingzheng', file)
        __uploadImg(formData, __uploadImgSuccess($trigger), __uploadImgFail($trigger))
    }

    function __getImei(data) {
        $.ajax({
            url: '/m/ocr_imei',
            type: 'post',
            dataType: 'json',
            data: data,
            success: function (res) {
                if (res && !res.errno) {
                    var imeiList = res.result
                    var html_fn = $.tmpl($.trim($('#JsXxgDialogOcrImeiSelectTpl').html())),
                        html_st = html_fn({
                            imeiList: imeiList
                        })
                    var dialogInst = tcb.showDialog(html_st, {
                        className: 'dialog-orc-imei',
                        middle: true,
                        withClose: false
                    })
                    var $wrap = dialogInst.wrap
                    $wrap.find('.js-trigger-select-imei-option').on('click', function (e) {
                        e.preventDefault()
                        var $me = $(this)
                        $me.addClass('selected').siblings('.selected').removeClass('selected')
                    })
                    $wrap.find('.js-trigger-confirm').on('click', function (e) {
                        e.preventDefault()
                        tcb.closeDialog()
                        var $selected = $wrap.find('.imei-select-list .selected').eq(0)
                        var imei = $selected.attr('data-imei')
                        $('[name="imei"]').val(imei)
                    })
                    $wrap.find('.js-trigger-re-take-photo').on('click', function (e) {
                        e.preventDefault()
                        tcb.closeDialog()
                        __triggerStartTakePhotoImei()
                    })
                    $wrap.find('.js-trigger-input-manual').on('click', function (e) {
                        e.preventDefault()
                        tcb.closeDialog()
                        $('[name="imei"]').focus()
                    })
                } else {
                    return $.dialog.toast((res && res.errmsg) || '系统错误')
                }
            },
            error: function (xhr) {
                $.dialog.toast(xhr.statusText || '系统错误，请稍后再试')
            }
        })
    }

    // ************
    // export
    // ************
    function init($wrap) {
        __bindEvent($wrap)
        __bindEventUploadPicture($wrap.find('.js-trigger-take-photo-imei-invoke-camera'))
    }

    window.imeiOcrInit = init

}()
