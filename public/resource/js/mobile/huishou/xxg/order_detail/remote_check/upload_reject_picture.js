!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }
    var uploadPictureMap = {}
    var keySet = ['pingzheng1', 'pingzheng2', 'pingzheng3', 'pingzheng4']
    var keyMap = {
        1: 'pingzheng1',
        2: 'pingzheng2',
        3: 'pingzheng3',
        4: 'pingzheng4'
    }
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
            // 启动上传
            '.js-trigger-upload-picture': function (e) {
                e.preventDefault()

                __triggerStartUpload($(this))
            },

            // 删图
            '.js-trigger-del-picture': function (e) {
                e.preventDefault()

                __delPicture($(this))
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

    function __delPicture($delTrigger) {
        $delTrigger.hide()

        var $TriggerUploadPicture = $delTrigger.siblings('.js-trigger-upload-picture'),
            $TriggerInvokeCamera = $delTrigger.siblings('.trigger-invoke-camera')

        $TriggerInvokeCamera.val('')

        $TriggerUploadPicture
        //.addClass ('icon-close')
            .css({
                'border': '0',
                'background-image': ''
            })
        uploadPictureMap[$TriggerUploadPicture.attr('data-for')] = ''
        // $('[name="' + $TriggerUploadPicture.attr('data-for') + '"]').val('')

        __hideProcessBar($delTrigger.siblings('.fake-upload-progress'))
    }

    function __showProcessBar($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.show()

        var percent_val = 25
        $processBarInner.css({'width': percent_val + '%'})

        setTimeout(function h() {
            percent_val += 12
            if (percent_val > 100) {
                return
            }
            if ($processBarInner.css('width') == '100%') {
                return
            }
            $processBarInner.css({'width': percent_val + '%'})

            if (percent_val < 100) {
                setTimeout(h, 500)
            }
        }, 500)
    }

    function __showProcessBar100($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.show()
        $processBarInner.css({'width': '100%'})
    }

    function __hideProcessBar($processBar) {
        var $processBarInner = $processBar.find('.fake-upload-progress-inner')
        $processBar.hide()
        $processBarInner.css({'width': '0'})
    }

    function __setUploadingPicture($trigger, img) {
        if (!img) {
            return
        }
        $trigger
            .css({
                'border': '1px solid #ddd',
                'background-image': 'url(' + img + ')' // tcb.imgThumbUrl(img, 300, 300, 'edr')
            })
    }

    function __setUploadedPicture($trigger, img) {
        if (!img) {
            return
        }
        var $DelPicture = $trigger.siblings('.js-trigger-del-picture')

        $DelPicture.show()
        uploadPictureMap[$trigger.attr('data-for')] = img
        // $('[name="' + $trigger.attr('data-for') + '"]').val(img)
    }

    function __triggerStartUpload($trigger) {
        var mode
        if ($trigger && $trigger.length) {
            mode = $trigger.attr('data-mode') || ''
        }
        if ((window.__IS_XXG_IN_SUNING && !window.__IS_XXG_IN_SUNING_ANDROID) || !tcb.js2AppInvokeTakePicture(function (imgBase64) {
            imgBase64 = imgBase64.indexOf('base64,') > -1
                ? imgBase64
                : 'data:image/png;base64,' + imgBase64
            __suningTakePictureSuccess(imgBase64, $trigger.siblings('.trigger-invoke-camera'))
        }, mode)) {
            var $triggerInvoke = $trigger.siblings('.trigger-invoke-camera')
            if (tcb.isXxgAppAndroidSupportCustomCamera() && mode) {
                $triggerInvoke.attr('accept', 'tcb-camera/' + mode)
            }
            $triggerInvoke.trigger('click')
        }
    }

    // 压缩、上传图片
    function __compressUpload(file, $trigger) {
        __doCompressImg(file, __generateHandlerCompressImgSuccess($trigger))
    }

    // 原图上传
    function __originalUpload(file, $trigger) {
        var $processBar = $trigger.siblings('.fake-upload-progress')

        __setUploadingPicture($trigger.siblings('.js-trigger-upload-picture'), window.URL.createObjectURL(file))
        __showProcessBar($processBar)

        var formData = new FormData()
        formData.append('pingzheng', file)
        __uploadImg(formData, function (data) {
            if (data.errno) {
                __delPicture($trigger.siblings('.js-trigger-del-picture'))

                return $.dialog.toast(data.errmsg)
            }
            __showProcessBar100($processBar)
            __setUploadedPicture($trigger.siblings('.js-trigger-upload-picture'), data.result)
        }, function (xhr, status, err) {
            $.dialog.toast('上传失败，请稍后再试')
            __delPicture($trigger.siblings('.js-trigger-del-picture'))
        })
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

    function __suningTakePictureSuccess(img_base64, $trigger) {
        __suningDoCompressImg(img_base64, __generateHandlerCompressImgSuccess($trigger))
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
        $.ajax({
            //url         : '/aj/uploadPic',
            //url         : '/m/doUpdateImgForBase64',
            url: url ? url : '/m/doUpdateImg',
            type: 'post',
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            data: formData,
            success: success,
            error: error
        })
    }

    function __uploadImgBase64(formData, success, error) {
        __uploadImg(formData, success, error, '/m/doUpdateImgForBase64')
    }

    var compress_width = 1080,
        compress_height = 1920,
        compress_quality = .7

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

    function __generateHandlerCompressImgSuccess($trigger) {
        return function (imgBase64) {
            var $processBar = $trigger.siblings('.fake-upload-progress')

            __setUploadingPicture($trigger.siblings('.js-trigger-upload-picture'), imgBase64)
            __showProcessBar($processBar)

            var formData = new FormData()
            formData.append('pingzheng', imgBase64)
            __uploadImgBase64(formData, function (data) {
                if (data.errno) {
                    __delPicture($trigger.siblings('.js-trigger-del-picture'))

                    return $.dialog.toast(data.errmsg)
                }
                __showProcessBar100($processBar)
                __setUploadedPicture($trigger.siblings('.js-trigger-upload-picture'), data.result)
            }, function (xhr, status, err) {
                $.dialog.toast('上传失败，请稍后再试')
                __delPicture($trigger.siblings('.js-trigger-del-picture'))
            })
        }
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

    function __getPicture(order_id, callback) {
        window.XXG.ajax({
            url: '/m/doGetPingzheng',
            data: {order_id: order_id},
            success: function (res) {
                if (!res.errno) {
                    $.isFunction(callback) && callback(true, res.result || [])
                } else {
                    $.dialog.toast(res.errmsg)
                    $.isFunction(callback) && callback(false)
                }
            },
            error: function (err) {
                $.dialog.toast('系统错误，请稍后重试')
                $.isFunction(callback) && callback(false)
            }
        })
    }

    // ************
    // export
    // ************

    function init($wrap, remote_check_tagging_imgs, uploadKeySet, uploadKeyMap) {
        if (uploadKeySet) {
            keySet = uploadKeySet
        }
        if (uploadKeyMap) {
            keyMap = uploadKeyMap
        }
        uploadPictureMap = {}
        tcb.each(remote_check_tagging_imgs, function (k) {
            uploadPictureMap[keyMap[k]] = ''
        })
        __bindEvent($wrap)
        __bindEventUploadPicture($wrap.find('.trigger-invoke-camera'))
    }

    function submitPicture() {
        if (!window.isRemoteCheckWorkTime()){
            return $.dialog.alert('服务时间为早9点至晚10点，请在此时间段内操作订单')
        }
        var order_id = window.__ORDER_ID
        var data = {
            order_id: order_id
        }
        var flag = true
        tcb.each(uploadPictureMap, function (k, v) {
            if (!v) {
                return flag = false
            }
            data[k] = v
        })
        if (!flag) {
            return $.dialog.toast('请重新上传所有的驳回照片')
        }
        tcb.loadingStart()

        __getPicture(order_id, function (isSucc, imgs) {
            if (!isSucc) {
                return tcb.loadingDone()
            }
            tcb.each(imgs, function (i, img) {
                if (!data[keySet[i]]) {
                    data[keySet[i]] = img
                }
            })
            window.XXG.ajax({
                url: '/m/doUpdatePingzheng',
                type: 'POST',
                data: data,
                success: function (res) {
                    if (!res.errno) {
                        setTimeout(function () {
                            window.remoteCheckListenStart(order_id, true)
                            tcb.loadingDone()
                        }, 1000)
                    } else {
                        $.dialog.toast(res.errmsg)
                        tcb.loadingDone()
                    }
                },
                error: function (err) {
                    $.dialog.toast('系统错误，请稍后重试')
                    tcb.loadingDone()
                }
            })
        })
    }

    window.remoteCheckUploadRejectPictureInit = init
    window.remoteCheckUploadRejectPicturesubmitPicture = submitPicture

}()
