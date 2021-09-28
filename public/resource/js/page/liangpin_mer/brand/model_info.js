$(function () {
    $('.js-trigger-del-com').on('click', function (e) {
        e.preventDefault()
        var $me = $(this),
            id = $me.attr('data-id')
        request({
            url: '/liangpin_mer/delComPrice',
            method: 'GET',
            data: {
                id: id
            },
            success: function (res) {
                if (res && !res.errno) {
                    toastr.success('更新成功')
                    $me.closest('tr').remove()
                    // setTimeout(function () {
                    //     window.location.reload()
                    // }, 1000)
                } else {
                    toastr.error((res && res.errmsg) || '系统错误')
                }
            },
            error: function (xhr) {
                toastr.error((xhr && xhr.statusText) || '系统错误')
            }
        })
    })
    // 比价信息
    $('#FormEditComPrice').on('submit', function (e) {
        e.preventDefault()

        var $form = $(this)

        // $form[0].submit()
        request({
            url: $form,
            success: function (res) {
                if (res && !res.errno) {
                    toastr.success('添加成功')
                    setTimeout(function () {
                        window.location.reload()
                    }, 1000)
                } else {
                    toastr.error((res && res.errmsg) || '系统错误')
                }
            },
            error: function (xhr) {
                toastr.error((xhr && xhr.statusText) || '系统错误')
            }
        })
    })
    // 其他服务
    $('#FormEditOtherServer').on('submit', function (e) {
        e.preventDefault()

        var $form = $(this)

        // $form[0].submit()
        request({
            url: $form,
            success: function (res) {
                if (res && !res.errno) {
                    toastr.success('编辑成功')
                } else {
                    toastr.error((res && res.errmsg) || '系统错误')
                }
            },
            error: function (xhr) {
                toastr.error((xhr && xhr.statusText) || '系统错误')
            }
        })
    })
    // 属性
    $('#FormEditAttr').on('submit', function (e) {
        e.preventDefault()

        var $form = $(this)

        // $form[0].submit()
        request({
            url: $form,
            success: function (res) {
                if (res && !res.errno) {
                    toastr.success('编辑成功')
                } else {
                    toastr.error((res && res.errmsg) || '系统错误')
                }
            },
            error: function (xhr) {
                toastr.error((xhr && xhr.statusText) || '系统错误')
            }
        })
    })
    // 描述信息-型号介绍
    $('#FormEditBasic').on('submit', function (e) {
        e.preventDefault()

        var $form = $(this)

        // $form[0].submit()
        request({
            url: $form,
            success: function (res) {
                if (res && !res.errno) {
                    toastr.success('编辑成功')
                } else {
                    toastr.error((res && res.errmsg) || '系统错误')
                }
            },
            error: function (xhr) {
                toastr.error((xhr && xhr.statusText) || '系统错误')
            }
        })
    })

    $('#FormEditAttr .attr-list-color [name="attr_list[]"]').on('click', function (e) {
        var $me = $(this)
        var $attrListColor = $me.closest('.attr-list-color')
        if ($attrListColor && $attrListColor.length) {
            var $attrChecked = $attrListColor.find('[name="attr_list[]"]').filter(function () {
                return $(this).prop('checked')
            })
            var attrChecked = $attrChecked.map(function () {
                var $_attr = $(this)
                return {
                    attr_val_id: $_attr.val(),
                    val: $.trim($_attr.closest('label').text())
                }
            }).get()
            window.__COLOR_LIST = attrChecked || []
            removeBrandModelInfoImgs()
            renderBrandModelInfoImgs()
        }
    })

    function removeBrandModelInfoImgs() {
        var $col = $('.grid-upload-img>.col').filter(function () {
            return $(this).attr('id') !== 'ColBtnUploadImg'
        })
        $col.remove()
    }

    function renderBrandModelInfoImgs() {
        var colorList = window.__COLOR_LIST || []
        var imgsInfo = window.__IMGS_INFO || []
        var imgList = []
        $.each(colorList, function (i, item) {
            var img
            $.each(imgsInfo, function (ii, imgItem) {
                if (imgItem.attr_val_id == item.attr_val_id) {
                    img = imgItem
                }
            })
            // var img = imgsInfo[i]
            var data = {
                pos: i,
                img: '',
                attr_val_id: ''
            }
            if (img) {
                data.img = img.img_url
                data.attr_val_id = img.attr_val_id
            }
            imgList.push(data)
        })
        // 再次遍历图片信息，以保证将没有绑定颜色属性的图片，也塞进空缺图片的位置里
        $.each(imgsInfo, function (i, imgItem) {
            if (!imgItem.attr_val_id) {
                $.each(colorList, function (i, item) {
                    if (!item.img) {
                        item.img = imgItem.img_url
                    }
                })
            }
        })
        var html_fn = $.tmpl($.trim($('#JsLpMerBrandModelInfoImgsTpl').html())),
            html_st = html_fn({
                colorList: colorList,
                imgList: imgList
            }),
            $ColBtnUploadImg = $('#ColBtnUploadImg')
        $ColBtnUploadImg.after(html_st)

        $('.grid-upload-img .js-trigger-del-img').on('click', function (e) {
            e.preventDefault()
            var $me = $(this)
            var img = $me.next().val()
            $me.prev().html('')
            $me.next().val('')
            $me.parent().addClass('no-img')
            if (img) {
                var imgsInfo = []
                $.each(window.__IMGS_INFO || [], function (i, item) {
                    if (item.img != img) {
                        imgsInfo.push(item)
                    }
                })
                window.__IMGS_INFO = imgsInfo
            }
        })
        $('.grid-upload-img select').on('change', function (e) {
            var $me = $(this)
            var $col = $me.closest('.col')
            var attr_val_id = $me.val() || ''
            var img = $col.find('input').val()
            if (img) {
                $.each(window.__IMGS_INFO || [], function (i, item) {
                    if (item.img == img) {
                        item.attr_val_id = attr_val_id
                    }
                })
            }
        })
    }

    // 图片上传
    !function () {
        if (!$('#BtnUploadModelImgs').length) {
            return
        }
        var $CurImgItem = null
        // 回调函数
        var upHandler = {
            // 上传文件加入队列
            fileQueued: function (file) {
                // try {
                //     console.log('fileQueued');
                //     console.log(file);
                // } catch (ex) {
                //     this.debug(ex);
                // }
            },
            // 上传队列错误
            fileQueueError: function (file, errorCode, message) {
                try {
                    // console.log('fileQueueError');
                    // console.log(file, errorCode, message);
                    switch (errorCode) {
                        case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                            alert('一次只能上传' + (message > 1 ? message : 1) + '个文件')
                            this.debug('一次只能上传' + (message > 1 ? message : 1) + '个文件')
                            break
                        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                            alert('文件过大!，请上传小于' + this.settings.file_size_limit + '的文件')
                            this.debug('Error Code: File too big, File name: ' + file.name + ', File size: ' + file.size + ', Message: ' + message)
                            break
                        case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                            // alert('不能上传 0 字节的文件');
                            alert('您上传的文件太小，无法上传')
                            this.debug('Error Code: Zero byte file, File name: ' + file.name + ', File size: ' + file.size + ', Message: ' + message)
                            break
                        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                            alert('非法的文件格式')
                            this.debug('Error Code: Invalid File Type, File name: ' + file.name + ', File size: ' + file.size + ', Message: ' + message)
                            break
                        default:
                            this.debug('Error Code: ' + errorCode + ', File name: ' + file.name + ', File size: ' + file.size + ', Message: ' + message)
                            break
                    }
                } catch (ex) {
                    this.debug(ex)
                }
            },
            // 文件选择框
            fileDialogComplete: function (numFilesSelected, numFilesQueued) {
                try {
                    // console.log('fileDialogComplete');
                    // console.log(numFilesSelected, numFilesQueued);
                    // 加入队列中的文件数 大于0，才执行上传操作
                    if (numFilesQueued) {
                        // 自动开始上传;
                        this.startUpload()
                    }
                } catch (ex) {
                    this.debug(ex)
                }
            },
            // 开始上传
            uploadStart: function (file) {
                try {
                    // console.log('uploadStart');
                    // console.log(file);
                    $CurImgItem = $('.grid-upload-img .no-img').first()
                    if ($CurImgItem && $CurImgItem.length) {
                        $CurImgItem.find('.img').html('<img style="margin-top: 18px;" src="//p2.ssl.qhimg.com/t0101eb562f5b336f88.gif">')
                    } else {
                        // 没有上传位置了，那么清出队列，以免占了位置
                        this.cancelUpload(file.id)
                        var count = $('.grid-upload-img .col').length - 1
                        alert(count ? '只能上传' + count + '张图片' : '请先选择机身颜色，再上传图片')
                        return false
                    }
                } catch (ex) {}
            },
            // 上传中~
            uploadProgress: function (file, bytesLoaded, bytesTotal) {
                // try {
                //     console.log('uploadProgress');
                //     console.log(file, bytesLoaded, bytesTotal);
                //     // var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
                // } catch (ex) {
                //     this.debug(ex);
                // }
            },
            // 上传异常
            uploadError: function (file, errorCode, message) {
                try {
                    // console.log('uploadError');
                    // console.log(file, errorCode, message);
                    switch (errorCode) {
                        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                            this.debug('Error Code: HTTP Error, File name: ' + file.name + ', Message: ' + message)
                            break
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                            this.debug('Error Code: Upload Failed, File name: ' + file.name + ', File size: ' + file.size + ', Message: ' + message)
                            break
                        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                            this.debug('Error Code: IO Error, File name: ' + file.name + ', Message: ' + message)
                            break
                        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                            this.debug('Error Code: Security Error, File name: ' + file.name + ', Message: ' + message)
                            break
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                            this.debug('Error Code: Upload Limit Exceeded, File name: ' + file.name + ', File size: ' + file.size + ', Message: ' + message)
                            break
                        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                            this.debug('Error Code: File Validation Failed, File name: ' + file.name + ', File size: ' + file.size + ', Message: ' + message)
                            break
                        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                            this.debug('Error Code: File Cancelled, File name: ' + file.name + ', File size: ' + file.size + ', Message: ' + message)
                            break
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                            this.debug('Error Code: Upload Stopped, File name: ' + file.name + ', File size: ' + file.size + ', Message: ' + message)
                            break
                        default:
                            this.debug('Error Code: ' + errorCode + ', File name: ' + file.name + ', File size: ' + file.size + ', Message: ' + message)
                            break
                    }
                } catch (ex) {
                    this.debug(ex)
                }
            },
            // 上传成功
            uploadSuccess: function (file, serverData) {
                try {
                    // console.log('uploadSuccess');
                    // console.log(file, serverData);
                    serverData = typeof serverData === 'string' ? $.parseJSON(serverData) : serverData
                    if (serverData['errno'] == 0 && $CurImgItem) {
                        $CurImgItem.removeClass('no-img')
                                   .find('.img').html('<img src="' + serverData['url'] + '" style="width:100%;height:100%;">')
                        $CurImgItem.find('input').val(serverData['url'])
                        var imgInfo = {
                            img_url: serverData['url']
                        }
                        var attr_val_id = $CurImgItem.find('select').val()
                        if (attr_val_id) {
                            imgInfo.attr_val_id = attr_val_id
                        }
                        window.__IMGS_INFO.push(imgInfo)
                    } else {
                        $CurImgItem.find('.img').html('')
                        alert('上传失败，请重新尝试')
                    }
                    $CurImgItem = null
                } catch (ex) {
                    this.debug(ex)
                }
            },
            // 上传完成
            uploadComplete: function (file) {
                // console.log('uploadComplete');
                // console.log(file);
            },
            // 队列完成
            queueComplete: function (numFilesUploaded) {
                // console.log('queueComplete');
                // console.log(numFilesUploaded);
            }
        }
        // 上传配置
        var upOptions = {
            flash_url: '/resource/swf/swfupload2.5.fix.swf',
             upload_url: '/liangpin_mer/upload_img/',
            //upload_url: '/aj/uploadPic',
            file_post_name: 'filedata',
            post_params: {
                'T': window.T || '',
                'Q': window.Q || ''
            },
            file_size_limit: '20 MB',
            file_types: '*.jpg;*.jpeg;*.gif;*.png',
            file_types_description: 'Image Files',
            file_upload_limit: 10,
            file_queue_limit: 1,
            // debug: true,
            // 上传按钮设置
            button_image_url: 'http://',
            button_width: '98',
            button_height: '98',
            button_placeholder_id: 'BtnUploadModelImgs',
            button_text: '<span class="textcolor">上传图片</span>',
            button_text_style: '.textcolor{color:#999999;}',
            button_text_top_padding: 40,
            button_text_left_padding: 20,
            button_cursor: SWFUpload.CURSOR.HAND,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            prevent_swf_caching: false,
            // 上传回调函数
            file_queued_handler: upHandler.fileQueued,
            file_queue_error_handler: upHandler.fileQueueError,
            file_dialog_complete_handler: upHandler.fileDialogComplete,
            upload_start_handler: upHandler.uploadStart,
            upload_progress_handler: upHandler.uploadProgress,
            upload_error_handler: upHandler.uploadError,
            upload_success_handler: upHandler.uploadSuccess,
            upload_complete_handler: upHandler.uploadComplete,
            queue_complete_handler: upHandler.queueComplete // Queue plugin event
        }

        try {
            new SWFUpload(upOptions)//构造一个上传实例；
        } catch (e) {}

        renderBrandModelInfoImgs()
    }()
})
