Dom.ready(function(){

    function setStarStatus(val, txt){
        var wForm = W('#cmtForm'),
            wItem = wForm.query('.star-item');
        val = parseInt(val, 10) ? parseInt(val, 10) : 0;
        wItem.removeClass('star-sel');
        wItem.filter(function(el, i){
            return i<val;
        }).addClass('star-sel');
        var txt = val>0 ? txt : '';
        wForm.query('.star-txt').html(txt);

        wForm.query('.level').val(val);
    }
    function clearStarStatus(){
        var wForm = W('#cmtForm'),
            wItem = wForm.query('.star-item');
        wItem.removeClass('star-sel');
        wForm.query('.star-txt').html('');
        wForm.query('.level').val('');
    }

    tcb.bindEvent(document.body, {
        // 订单评论选星
        '#cmtForm .star-item': {
            'click': function(e){
                var wMe = W(this),
                    val = wMe.attr('data-value'),
                    txt = wMe.attr('title');

                wMe.ancestorNode('.star-box').attr('data-value', val).attr('data-title', txt);
                setStarStatus(val, txt);
            },
            'mouseenter': function(e){
                var wMe = W(this),
                    val = wMe.attr('data-value'),
                    txt = wMe.attr('title');

                setStarStatus(val, txt);
            },
            'mouseleave': function(e){
                var wMe = W(this),
                    wBox = wMe.ancestorNode('.star-box')
                val = wBox.attr('data-value'),
                    txt = wBox.attr('data-title');

                if (val&&txt) {
                    setStarStatus(val, txt)
                } else {
                    clearStarStatus();
                }
            }
        }
    });


    //选择默认好评语句、限制评论字数
    tcb.bindEvent(document.body, {
        '.comment-label span':{
            'click':function(e){
                var el = W(this);
                var cmt_content = W('.cmt-content').val();
                if(cmt_content.indexOf(el.html())!=-1){
                    return;
                }

                cmt_content+=el.html()+' ';

                W('.cmt-content').val(cmt_content);

                W('.cmt-content').change();
            }
        },
        '.cmt-content':{
            'keyup':function(e){
                var $me = W(this);
                if($me.val().length>140){
                    alert('请输入140字以内！');
                    $me.val($me.val().substring(0,140));
                }
                if($me.val()){
                    W('#cmtForm .pic-tips').hide();
                }
            },
            'change':function(e){
                var $me = W(this);
                if($me.val().length>140){
                    alert('请输入140字以内！');
                    $me.val($me.val().substring(0,140));
                }
                if($me.val()){
                    W('#cmtForm .pic-tips').hide();
                }
            }
        }
    });


    /*提交评价*/
    W('#cmtForm').on('submit', function(e){
        e.preventDefault();
        if( W(this).query('.star-sel').length == 0 ){
            W(this).one('.star-box').shine4Error();
            return;
        }
        if( W(this).one('.cmt-content').val().trim()=='' ){
            W(this).one('.cmt-content').shine4Error().focus();
            W(this).query('.pic-tips').show();
            return;
        }

        QW.Ajax.post('/liangpin_my/aj_pingjia/', this, function(rs){
            rs = QW.JSON.parse(rs);
            if(rs.errno){
                alert('抱歉，评论失败。'+rs.errmsg);
            }else{
                window.location.reload();
            }
        });
    });

    /*晒图*/
    function initUploadPic() {
        if( typeof SWFUpload=='undefined' ){
            return;
        }
        var wCurImgItem = null;
        // 回调函数
        var upHandler = {
            // 上传文件加入队列
            fileQueued: function(file){},
            // 上传队列错误
            fileQueueError: function(file, errorCode, message){
                try {
                    switch (errorCode) {
                        case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                            alert("一次只能上传" + (message > 1 ? message : 1) + "个文件");
                            this.debug("一次只能上传" + (message > 1 ? message : 1) + "个文件");
                            break;
                        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                            alert("文件过大!，请上传小于"+ this.settings.file_size_limit+"的文件");
                            this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                            // alert('不能上传 0 字节的文件');
                            alert('您上传的文件太小，无法上传');
                            this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                            alert('非法的文件格式');
                            this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        default:
                            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 文件选择框
            fileDialogComplete: function(numFilesSelected, numFilesQueued){
                try {
                    // console.log('fileDialogComplete');
                    // console.log(numFilesSelected, numFilesQueued);

                    if (W('.shaitu-pic').length>=5){
                        alert('最多只能上传5张');

                        var stats = this.getStats();
                        while (stats.files_queued > 0) {
                            this.cancelUpload();
                            stats = this.getStats();
                        }
                        return;
                    }
                    // 加入队列中的文件数 大于0，才执行上传操作
                    if (numFilesQueued) {
                        // 自动开始上传;
                        this.startUpload();
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 开始上传
            uploadStart: function(file){
                try {
                    // console.log('uploadStart');
                    // console.log(file);
                }
                catch (ex) {}
            },
            // 上传中~
            uploadProgress: function(file, bytesLoaded, bytesTotal){},
            // 上传异常
            uploadError: function(file, errorCode, message){
                try {
                    // console.log('uploadError');
                    // console.log(file, errorCode, message);

                    switch (errorCode) {
                        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                            this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                            this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                            this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                            this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                            this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                            this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                            this.debug("Error Code: File Cancelled, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                            this.debug("Error Code: Upload Stopped, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        default:
                            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                    }
                } catch (ex) {
                    this.debug(ex);
                }
                return ;
            },
            // 上传成功
            uploadSuccess: function(file, serverData){
                try {
                    // console.log('uploadSuccess');
                    // console.log(file, serverData);
                    //console.log(serverData);

                    serverData = QW.JSON.parse(serverData);
                    if(serverData['errno'] == 0){
                        //W('.fapiao-upload-tips').show().html('图片上传成功');
                        W('[name="img"]').val(serverData['url']);

                        W('.page-liangpin-order .shaitu-pic').removeClass('shaitu-pic-cur');
                        var str = '<div class="shaitu-pic shaitu-pic-cur fl"><img style="width: 100%;" src="'+serverData['url']+'"><input type="hidden" name="comment_img_urls[]" value="'+serverData['url']+'"></div>';
                        W('.page-liangpin-order .shaitu-box .btn-shaitu').insertSiblingBefore(str);

                        W('.page-liangpin-order .pic-num b').html(W('.shaitu-box div').length-1);

                        W('.page-liangpin-order .pic-big').show().one('img').attr('src',serverData['url']);

                        tcb.setImgElSize(W('.page-liangpin-order .shaitu-pic img'),90,90);
                        tcb.setImgElSize(W('.page-liangpin-order .pic-big img'),270,270);

                    } else{
                        W('.fapiao-upload-tips').hide();
                        W('[name="img"]').val('');
                        alert('上传失败，请重新尝试');
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 上传完成
            uploadComplete: function(file){
                // console.log('uploadComplete');
                // console.log(file);
            },
            // 队列完成
            queueComplete: function(numFilesUploaded){
                // console.log('queueComplete');
                // console.log(numFilesUploaded);
            }
        };
        // 上传配置
        var upOptions = {
            flash_url : '/resource/swf/swfupload2.5.fix.swf',
            upload_url: '/aj/uploadPic',
            file_post_name: "filedata",
            post_params: {
                'T': window.T||'',
                'Q': window.Q||''
            },
            file_size_limit : "10 MB",
            file_types : "*.jpg;*.jpeg;*.png",
            file_types_description : "Image Files",
            file_upload_limit : 1000,
            file_queue_limit : 1,
            // debug: true,
            // 上传按钮设置
            button_image_url: "http://",
            button_width: "88",
            button_height: "88",
            button_placeholder_id: "BtnShaiTuUpload",
            button_text: "",
            button_text_style: "",
            button_text_top_padding: 0,
            button_text_left_padding: 0,
            button_cursor: SWFUpload.CURSOR.HAND,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            prevent_swf_caching: false,
            // 上传回调函数
            file_queued_handler          : upHandler.fileQueued,
            file_queue_error_handler     : upHandler.fileQueueError,
            file_dialog_complete_handler : upHandler.fileDialogComplete,
            upload_start_handler         : upHandler.uploadStart,
            upload_progress_handler      : upHandler.uploadProgress,
            upload_error_handler         : upHandler.uploadError,
            upload_success_handler       : upHandler.uploadSuccess,
            upload_complete_handler      : upHandler.uploadComplete,
            queue_complete_handler       : upHandler.queueComplete // Queue plugin event
        };
        if (W('#BtnShaiTuUpload').length) {
            new SWFUpload(upOptions);//构造一个上传实例；
        }
    }
    initUploadPic();


    tcb.bindEvent(W('.page-liangpin-order') , {
        //点击切换大图
        '.shaitu-box .shaitu-pic':{
            'click':function(e){
                var wMe = W(this);
                wMe.addClass('shaitu-pic-cur').siblings('.shaitu-pic-cur').removeClass('shaitu-pic-cur');
                var url = wMe.query('img').attr('src');
                W('.page-liangpin-order .pic-big').one('img').attr('src',url);
                tcb.setImgElSize(W('.page-liangpin-order .pic-big img'),270,270);
            }
        },
        // 删除
        '.pic-big .del-box':{
            'click':function(e){
                var wMe = W(this);
                var wTarg;
                var wCur = W('.page-liangpin-order .shaitu-pic-cur');
                var wPrev = wCur.previousSibling('.shaitu-pic');
                var wNext = wCur.nextSibling('.shaitu-pic');
                var re = confirm('确定删除图片吗？');
                if(re){
                    if (wCur && wCur.length) {
                        if(wPrev&&wPrev.length){
                            wTarg = wPrev;
                        }else{
                            wTarg = wNext;
                        }
                        wCur.removeNode();
                        if ( wTarg && wTarg.length){
                            wTarg.addClass('shaitu-pic-cur');
                            var src = wTarg.query('img').attr('src');

                            wMe.siblings('img').attr('src', src);
                        }else{
                            wMe.ancestorNode('.pic-big').hide();
                        }
                        W('.page-liangpin-order .pic-num b').html(W('.page-liangpin-order .shaitu-box div').length-1);
                    }
                }
                tcb.setImgElSize(W('.page-liangpin-order .shaitu-pic img'),90,90);
                tcb.setImgElSize(W('.page-liangpin-order .pic-big img'),270,270);
            }
        }
    });

})