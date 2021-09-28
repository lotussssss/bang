Dom.ready(function(){
    var isHideTousuEventBind = false;
    tcb.bindEvent(document.body, {
        '.weixiubtn': function(e){
            e.preventDefault();
            var content = W('#confirmOrderTpl').html();
            tcb.panel('确认维修', content, {event: {
                '.shangjiasubmit': function(){
                    if(!QW.Valid.checkAll(W('#confirmOrderForm')[0])){
                        return false;
                    }
                    Ajax.post(W('#confirmOrderForm')[0], function(result){
                        result = result.evalExp();
                        if (result.errno) {
                            return alert(result.errmsg);
                        };
                        location.reload();
                    })
                }
            }, wrapId: "confirmOrderPanel", width : 776});
        },
        '#tousuTipsLink': function(e){
            e.preventDefault();
            W('.tousuconent').show();
            if (isHideTousuEventBind) {
                return true;
            };
            isHideTousuEventBind = true;
            var self = this;
            W(document.body).on('click', function(e){
                var target = e.target;
                if (!W('.tousuconent').contains(target) && target != self) {
                     W('.tousuconent').hide();
                };
            })
        },
        '#upPhotoList li span.close': function(){
            var li = W(this).parentNode('li');
            li.removeNode();
        },
        /*'.btnjieshi': function(e){
            var html = W('#jieshiTpl').html();
            tcb.panel('商家解释', html, {event: {
                '#shangjiajieshi': function(){
                    if(!QW.Valid.checkAll(W('#shangjiajieshiForm')[0])){
                        return false;
                    }
                    W('input.up-imgs').removeNode();
                    var html = W('#upPhotoList li img').map(function(item){
                        var src = W(item).attr('src');
                        return '<input type="hidden" name="upimg_pingzheng[]" class="up-imgs" value="'+src+'" />';
                    })
                    W(html).appendTo(W('#shangjiajieshiForm'));
                    Ajax.post(W('#shangjiajieshiForm')[0], function(result){
                        result = result.evalExp();
                        if (result.errno) {
                            return alert(result.errmsg);
                        };
                        location.reload();
                    })
                }
            }, width: 778});
            var file_queue_error = false;
            var swfu = new SWFUpload({
                // Backend Settings
                upload_url: 'http://'+location.host+"/aj/applypingzheng/",
                post_params: {"uptype": "1", "upname": "pingzheng"},
                file_post_name: "pingzheng",

                // File Upload Settings
                file_size_limit : "5 MB",   // 5MB
                file_types : "*.jpg;*.jpeg;*.png;*.gif",
                file_types_description : "图片文件",
                file_upload_limit : "30",

                 file_queue_error_handler: function(file, errorCode, message){
                    try {
                        var errorName = "";
                        switch (errorCode) {
                            case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                                errorName = "上传图片不能超过3张";
                                break;
                            case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                                errorName = "图片大小不能为0";
                                break;
                            case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                                errorName = "图片大小不能超过5M";
                                break;
                            case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                            default:
                                errorName = "文件类型错误"
                                break;
                        }
                        if (errorName !== "") {
                            W('.img-loading-li').removeNode();
                            file_queue_error = true;
                            alert(errorName);
                            return;
                        }
                    } catch (ex) {
                        this.debug(ex);
                    }
                },
                file_dialog_complete_handler : function(umFilesSelected, numFilesQueued){
                    var nums = W('#upPhotoList li').length;
                    if (nums >= 3) {
                        if (file_queue_error) {
                            file_queue_error = false;
                            return false;
                        };
                        return alert('图片不能超过3张')
                    };
                     try {
                        if (numFilesQueued > 0) {
                            this.startUpload();
                            var html = W('#upImgsLoadingTpl').html().trim();
                            W(html).appendTo(W('#upPhotoList'));
                        }
                    } catch (ex) {
                        this.debug(ex);
                    }
                },
                upload_error_handler : function(file, errorCode, message) {
                    W('.img-loading-li').removeNode();
                    alert(message)
                },
                upload_success_handler : function(file, serverData){
                     serverData = JSON.parse(serverData) || {};
                    if (serverData.errno) {
                        W('.img-loading-li').removeNode();
                        return alert(serverData.errmsg);
                    }else{
                        var url = serverData.result;
                        var urls = W('#upPhotoList li img').map(function(item){
                            return W(item).attr('src');
                        })
                        if (urls.indexOf(url) != -1) {
                            W('.img-loading-li').removeNode();
                            return alert('该图片已经上传');
                        };
                        W('.img-loading-li').removeNode();
                        var html = W('#upImgsTpl').html().trim();
                        html = html.tmpl({
                            src: url
                        });
                        W(html).appendTo(W('#upPhotoList'))
                    }
                },

                // Button Settings
                button_image_url : 'https://p.ssl.qhimg.com/t01dac132dcaf7bf1fb.jpg',
                button_placeholder_id : 'uploadArbitrationImgs',
                button_width: 103,
                button_height: 31,
               
                button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                button_cursor: SWFUpload.CURSOR.HAND,
                
                // Flash Settings
                flash_url : {stc:"/resource/swf/swfupload.swf"}.stc,

                // Debug Settings
                debug: false
            });

        },*/
        '#shangjiajieshi': function(){
            if(!QW.Valid.checkAll(W('#shangjiajieshiForm')[0])){
                return false;
            }
            W('input.up-imgs').removeNode();
            var html = W('#upPhotoList li img').map(function(item){
                var src = W(item).attr('src');
                return '<input type="hidden" name="upimg_pingzheng[]" class="up-imgs" value="'+src+'" />';
            })
            W(html).appendTo(W('#shangjiajieshiForm'));
            Ajax.post(W('#shangjiajieshiForm')[0], function(result){
                result = result.evalExp();
                if (result.errno) {
                    return alert("抱歉，出错了。"+result.errmsg);
                };
                
                alert( "提交成功。" );
                location.reload();
            })
        },
        '.agreen-refund-item' : function(e){
            /*
            if( W(this).attr('checked') && W(this).val() == 1){
                W('#tdDisagreenReason').hide();
            }else{
                W('#tdDisagreenReason').show();
            }*/
        }
    });
    // 订单备注
    W('#remarkForm').on('submit', function(e){
        e.preventDefault();

        Ajax.post('/mer_order/sub_beizhu/', { 'order_id' : W(this).one('[name="order_id"]').val(), 'content': W(this).one('.remark-txt').val() }, function(data){
            try{
                var data = JSON.parse(data);
                if(data.errno == 0){
                    tcb.alert("提示",'<div style="padding:10px 60px">备注修改成功~</div>',{'width' : 300, 'wrapId' : 'panelBuyFail'},function(){return true;});
                }else{
                    tcb.alert("错误",'<div style="padding:10px 60px">抱歉出错了，请稍后再试...</div>',{'width' : 300, 'wrapId' : 'panelBuyFail'},function(){return true;});
                }
            }catch(ex){
                tcb.alert("错误",'<div style="padding:10px 60px">抱歉出错了，请稍后再试...</div>',{'width' : 300, 'wrapId' : 'panelBuyFail'},function(){return true;});
            }
        });
    });
    
    if (W('#leaveTime').length) {
        var timer = new Timer(
            W('#leaveTime'), 
           currentTime, 
            endTime,
            '剩余'
        );
        timer.on('timeout', function() {
            W('.icoclock').hide();
            W('#leaveTime').html('系统正在处理中，请稍等...');
            setTimeout(function(){
                location.reload();
            }, 3000);
        });
    };  

    if(W('.weixiubtn').length>0 && window.location.hash.indexOf('showwxbox')>-1){

        var mt = window.location.hash.match( /showwxbox=(\w+)/ );

        if( mt && mt[1]){            
            W('.weixiubtn').fire('click');
            W('.safecodebg [name="checkcode"]').val( mt[1] );
        }        
    }
})