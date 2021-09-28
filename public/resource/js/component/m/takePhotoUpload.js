!function () {
    var defaults = {
        $trigger: null,
        file_post_name: 'pingzheng',
        upload_url: '/m/doUpdateImg',
        upload_url_base64: '/m/doUpdateImgForBase64',
        is_silent: false,
        capture: 'camera',
        supportCapture: true,
        supportCustomCamera: false,
        compress_width: 1080,
        compress_height: 1920,
        compress_quality: .7,
        callback_upload_before: null,
        callback_upload_process: null,
        callback_upload_success: null,
        callback_upload_fail: null,
        callback_upload_complete: function (me) {
            me.$triggerInvoke.val('')
        }
    }

    var isAutoOrientated

    tcb.checkAutoOrientated &&
    tcb.checkAutoOrientated(function (res) {
        isAutoOrientated = res
    })

    window.TakePhotoUpload = TakePhotoUpload

    function TakePhotoUpload(options) {
        options = options || {}
        options = tcb.mix({}, [defaults, options])
        var me = this
        if (!(options.$trigger && options.$trigger.length)) {
            return
        }
        me.$trigger = $(options.$trigger)
        me.$triggerCurrent = null
        me.options = options

        me.init()
    }

    // 设置原型方法
    TakePhotoUpload.prototype = {
        constructor: TakePhotoUpload,
        readUploadFile: readUploadFile,
        compressUpload: compressUpload,
        getCompressedImg: getCompressedImg,
        uploadImgBase64: uploadImgBase64,
        originalUpload: originalUpload,
        uploadImg: uploadImg,
        getCompactCompressSize: getCompactCompressSize,
        isSupportMegaPixelImg: isSupportMegaPixelImg,
        takePhoto: takePhoto,
        bindEventUploadPicture: bindEventUploadPicture,
        bindEvent: bindEvent,
        init: initTakePhotoUpload
    }

    function initTakePhotoUpload() {
        var me = this
        var options = me.options

        var trigger_invoke_wrap = '<div style="position:relative;width: 0;height: 0;overflow: hidden;">' +
            '<input type="file" accept="image/*"'
        if (options.supportCapture && options.capture) {
            trigger_invoke_wrap += ' capture="' + options.capture + '" '
        }
        trigger_invoke_wrap += 'style="position: absolute;left:-99999px;width: 1px;height: 1px;">' +
            '</div>'
        var $triggerInvokeWrap = $(trigger_invoke_wrap)
        $triggerInvokeWrap.appendTo('body')
        me.$triggerInvoke = $triggerInvokeWrap.find('input')

        me.bindEvent()
        me.bindEventUploadPicture()
    }

    function bindEvent() {
        var me = this
        me.$trigger.on('click', function (e) {
            e.preventDefault()
            me.$triggerCurrent = $(this)
            me.takePhoto()
        })
    }

    function bindEventUploadPicture() {
        var me = this
        me.$triggerInvoke.on('change', function (e) {
            // 获取文件列表对象
            var files = e.target.files || e.dataTransfer.files,
                file = files[0]

            try {
                // 压缩、上传图片
                me.readUploadFile(file, function () {
                    me.compressUpload(this.result)
                })
            } catch (ex) {
                // 压缩上传报错失败了，再次尝试用普通方式上传
                tcb.warn(ex)
                me.originalUpload(file)
            }
        })
    }


    function takePhoto() {
        var me = this
        var options = this.options
        var $triggerCurrent = this.$triggerCurrent
        var mode
        if ($triggerCurrent && $triggerCurrent.length) {
            mode = $triggerCurrent.attr('data-mode') || ''
        }
        if ((window.__IS_XXG_IN_SUNING && !window.__IS_XXG_IN_SUNING_ANDROID) || !tcb.js2AppInvokeTakePicture(function (imgBase64) {
            imgBase64 = imgBase64.indexOf('base64,') > -1
                ? imgBase64
                : 'data:image/png;base64,' + imgBase64
            me.compressUpload(imgBase64)
        }, mode)) {
            if (tcb.isXxgAppAndroidSupportCustomCamera() && options.supportCustomCamera && mode) {
                me.$triggerInvoke.attr('accept', 'tcb-camera/' + mode)
            }
            me.$triggerInvoke.trigger('click')
        }
    }

    function uploadImgBase64(imgBase64) {
        var me = this
        var options = me.options
        var formData = new FormData()
        formData.append(options.file_post_name, imgBase64)

        me.uploadImg(formData, options.upload_url_base64)
    }

    function uploadImg(formData, url) {
        if (!(formData && url)) {
            return
        }
        var me = this
        var options = me.options
        var callback_upload_before = $.isFunction(options.callback_upload_before)
            ? options.callback_upload_before
            : function (inst, img, next) {next()}
        callback_upload_before(me, formData.get(options.file_post_name), function () {
            !options.is_silent && tcb.loadingStart()
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                cache: false,
                processData: false,
                contentType: false,
                data: formData,
                success: function (data) {
                    $.isFunction(options.callback_upload_success) && options.callback_upload_success(me, data)
                },
                error: function (xhr, status, err) {
                    $.isFunction(options.callback_upload_fail) && options.callback_upload_fail(me, xhr, status, err)
                },
                complete: function () {
                    !options.is_silent && setTimeout(function () {
                        tcb.loadingDone()
                    }, 500)
                    $.isFunction(options.callback_upload_complete) && options.callback_upload_complete(me)
                }
            })
        })
    }

    // 读取文件，获取base64内容
    function readUploadFile(file, callback) {
        callback = $.isFunction(callback) ? callback : function () {}

        var reader = new FileReader()
        reader.onload = callback
        reader.readAsDataURL(file)
    }

    // 压缩、上传图片
    function compressUpload(imgBase64) {
        var me = this
        var maxSize = 500 * 1024 // 500KB

        if (imgBase64.length < maxSize) {
            me.uploadImgBase64(imgBase64)
        } else {
            tcb.imageOnload(imgBase64, function (imgObj) {
                var file_type = (imgBase64.split(';')[0]).split(':')[1] || ''
                me.getCompressedImg(imgObj, file_type, function (compressImgBase64) {
                    me.uploadImgBase64(compressImgBase64)
                })
            })
        }
    }

    // 获取压缩后的图片
    function getCompressedImg(img, file_type, callback) {
        var me = this
        var options = me.options
        EXIF.getData(img, function () {
            var imgObj = this
            var orientation = isAutoOrientated ? 0 : EXIF.getTag(imgObj, 'Orientation')
            var size = me.getCompactCompressSize(imgObj.naturalWidth || imgObj.width, imgObj.naturalHeight || imgObj.height),
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

            return callback(ctx.canvas.toDataURL('image/jpeg', options.compress_quality))
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

    function getCompactCompressSize(width, height) {
        var me = this
        var options = me.options
        var w_ratio = Math.min(width, height) / options.compress_width,
            h_ratio = Math.max(width, height) / options.compress_height,
            ratio = Math.max(w_ratio, h_ratio)

        if (me.isSupportMegaPixelImg()) {
            var ratio_log2 = Math.min(Math.floor(Math.log2(w_ratio)), Math.floor(Math.log2(h_ratio)))

            ratio = Math.pow(2, ratio_log2)
        }

        return [width / ratio, height / ratio]
    }

    function isSupportMegaPixelImg() {
        var is_support = tcb.cache('IS_SUPPORT_MEGA_PIXEL_IMG')
        if (typeof is_support == 'undefined') {
            var canvas = __createCanvas(2500, 2500)
            is_support = !!(canvas.toDataURL('image/png').indexOf('data:image/png') == 0)
        }
        return is_support
    }

    // 原图上传
    function originalUpload(file) {
        var me = this
        var options = me.options
        var formData = new FormData()
        formData.append(options.file_post_name, file)
        me.uploadImg(formData, options.upload_url)
    }

}()
