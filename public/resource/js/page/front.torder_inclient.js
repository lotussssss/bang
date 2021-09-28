/**
 * 用户看到的订单流程
 * @return {[type]} [description]
 */
Dom.ready(function(){
    var timer = 0;

    //允许未登录提交订单
    var allowUnloginSubmit = true;

    function getExpenses(){
        var number = W(".mod-buy-number #buy_number").val()*1,
            metfee = service_fee * 100,
            way =W("#serviceMethod").val(),
            price  =  W("#product_price").html()*100;
        if(way!=1 || !way){
            metfee=0;

        }
        if(metfee > 0){
            W('#shmMoneyShow').show();
        }else{
            W('#shmMoneyShow').hide();
        }

        if(number && /^\d*$/.test(number)){
            var real_momey = ((number*price+metfee)/100).toFixed(2);
            if(/^\d*\.\d$/.test(real_momey)){
                real_momey = real_momey +"0";
            }else if(/^\d*$/.test(real_momey)){
                real_momey = real_momey +".00";
            }
            W('#buyNumShow').html( number );
            W("#metfee_all").html(real_momey);
            W("#met_summoney").val(real_momey);
            W("#real_met_summoney").html("￥"+real_momey)
        }

    }
    //计算费用总和
    try{
        getExpenses();
    }catch(e){}


    tcb.bindEvent(document.body, {
        '.cur-ques-list li':function(e){
            var that = W(this),
                question = W("#questionWrap input"),
                expect   = W("#expectWrap input");
            W('.cur-ques-list').query('li').removeClass('curr');
            W("#tagFlag").val('ok');
            W("#shebeiTips").hide();
            that.addClass('curr');
            if(that.attr('data-tag')=="other"){
                W("#questionWrap").show();
                question.val("")
                expect.val("");
                W("#order_show").val("");
            }else{
                W("#questionWrap").hide();
                question.val(that.attr('data-ques'));
                expect.focus().val(that.attr('data-expect')).blur();
                W("#order_show").val(that.attr('data-order'));
            }
        },
        '.cur-ques-icon a.up':function(e){
            e.preventDefault();
            W("#innerTags").animate({'margin-top':'0px'});
            W(this).replaceClass('aup-active','aup')
            W('.cur-ques-icon a.down').replaceClass('adown','adown-active')
        },
        '.cur-ques-icon a.down':function(e){
            e.preventDefault();
            W("#innerTags").animate({'margin-top':'-76px'});
            W(this).replaceClass('adown-active','adown')
            W('.cur-ques-icon a.up').replaceClass('aup','aup-active')
        },
        '#btnSaveMobilePhone': function(e){
            e.preventDefault();
            /*if(!Valid.check(W('#demand_get')[0], true)){
                return false;
            }
            if(!Valid.check(W('#demand_desc')[0], true)){
                return false;
            }*/
        },
        '#btnSaveTorder': function(e){
            e.preventDefault();

            if(!W("#tagFlag").val()){
                W("#shebeiTips").show();
            }
            var serviceMethod_flag = true,
                wServiceMethod = W('.mod-step-fixtype');
            if(!wServiceMethod.query('li.curr').length){
                serviceMethod_flag = false;
                wServiceMethod.siblings('.service-type-err').show();
            } else {
                wServiceMethod.siblings('.service-type-err').hide();
            }
            if(!QW.Valid.checkAll(QW.g('torderForm'))){
                return false;
            } else {
                if (!serviceMethod_flag) {
                    return false;
                }
            }
            if(allowUnloginSubmit){
                //存储电话到cookie中，登录注册用
                QW.Cookie.set('otel', W('#buyer_mobile').val(), {'path':'/', 'domain' : '.bang.360.cn'});
                afterBindPhone(true);
            }else{
                try{
                    if( QW.Cookie.get("Q") ){//已登录
                        afterBindPhone(true);
                    }else{//未登录
                        QHPass.when.signIn(function(){
                            getNewPKey(function(){ //登录成功之后，必须先刷新新的第二postkey.                            
                                afterBindPhone(true);
                            });                        
                        });
                    }
                }catch(ex){
                   ;
                }
            }
            
           
        },
        '.modify-mobile':function(e){
            e.preventDefault();
            W("#phoneWrap").hide();
            W("#newPhoneWrap input").val('');
            W("#newPhoneWrap").show();

        },
        '.cancel-mobile':function(e){
            e.preventDefault();
            W("#phoneWrap").css('display','inline-block');
            W("#newPhoneWrap").hide();
            W("#newPhoneWrap input").val(buyer_mobile);
        },
        '#safePayBtn': function(e){
            e.preventDefault();

            showWaitPayDialog();
            
            var payForm = W('#payForm')[0];
            var url =BASE_ROOT + 'pay/submitorder' + '?' + 'order_id=' + payForm.order_id.value;
            window.open(url);

            //Ajax.post(W('#payForm')[0], function(data){
                //console.log(data)
            //})
        },
        //订单列表页点击支付
        '.pay-in-ordlist' : function(e){
            e.preventDefault();
            showWaitPayDialog();

            var order_id = W(this).attr('data-oid');
            var url =BASE_ROOT + 'pay/submitorder' + '?' + 'order_id=' + order_id;
            window.open(url);
        },
        '#buyerConfirmBtn': function(){
            clearTimeout(timer);
            if(!Valid.check(W('#password')[0], true)){
                return false;
            }
            var html = W('#buyerConfirmTpl').html();
            var panel = tcb.confirm("确认维修服务", html, {
                wrapId: "panelBuyerConfirm",
                width: 352
            }, function(){
                var pwd = W('#password').val();
                W('#pass').val(hex_md5(pwd));
                Ajax.post(W('#buyerConfirmForm')[0], function(data){
                    data = data.evalExp();
                    if (data.errno) {
                        panel.hide();
                        Valid.fail(W('#password')[0], data.errmsg, true);
                        return false;
                    };
                    location.reload();
                })
            })
        },
        '#applyArbitration': function(e){
            e.preventDefault();
            W('#buyerConfirmLayer').hide();
            W('#applyArbitrationLayer').show();
        },
        '#cancelArbitrationBtn': function(e){
            e.preventDefault();
            W('#buyerConfirmLayer').show();
            W('#applyArbitrationLayer').hide();
        },
        '#upPhotoList li span.close': function(){
            var li = W(this).parentNode('li');
            li.removeNode();
        },
        '#arbitrationReasonBtn': function(){
            if(!QW.Valid.checkAll(W('#arbitrationReasonForm')[0])){
                return false;
            }
            W('input.up-imgs').removeNode();
            var html = W('#upPhotoList li img').map(function(item){
                var src = W(item).attr('src');
                return '<input type="hidden" name="upimg_pingzheng[]" class="up-imgs" value="'+src+'" />';
            })
            W(html).appendTo(W('#arbitrationReasonForm'));
            Ajax.post(W('#arbitrationReasonForm')[0], function(data){
                try{
                    data = data.evalExp();
                    if (data.errno) {
                        return alert(data.errmsg)
                    };
                    location.reload();
                }catch(e){
                    alert('数据异常')
                }
            })
        },
        '.le-rating':{
            mouseenter: function(){
                W('.le-rating a').removeClass('active');
            },
            mouseleave: function(){
                if (W('.le-rating a.active').length == 0) {
                    W('.le-rating .desc').html('')
                };
            }
        },
        '.le-rating a': {
            click: function(e){
                e.preventDefault();
                W('.le-rating a').removeClass('active');
                W(this).addClass('active');
                var value = W(this).attr('data-value');
                W('#level').val(value);
                var html = W(this).html();
                QW.Valid.check(W('#level')[0]);
                W('.le-rating .desc').html(html);
                W(this).attr('data-status', 1);
            },
            mouseenter: function(e){
                W('#level_span').nextSibling('em.error').hide();
                W('.le-rating a').removeClass('active');
                var html = W(this).html();
                W('.le-rating .desc').html(html)
            },
            mouseleave: function(e){
                var value = W('#level').val();
                var el = W('.le-rating a[data-value="'+value+'"]');
                W('.le-rating .desc').html(el.html() || "");
                el.addClass('active');
            }
        },
        '.mod-step-zhifutype li':function(){
            W(".mod-step-zhifutype").query('li').removeClass('curr');
            W(this).addClass('curr');
            W("#payMethod").val( W(".mod-step-zhifutype .curr").attr('data-type') );
            if(W(this).attr('data-type')==1){
                W('#buyMethod')[0].className = "safePayStepbg safePayStep1";
                W('#buySuggestion .sug-buy-online').show().siblings('table').hide();

                W('#payRoadBox').show();
            }else{
                W('#buyMethod')[0].className = "daodianstep1";
                W('#buySuggestion .sug-buy-offline').show().siblings('table').hide();

                W('#payRoadBox').hide();
            }
        },
        '#payRoadBox .pay-method':function(e){
            if( W('#payRoadBox .pay-method:checked').val() == 'wangyin' ){
                W('#payRoadBox .bank-box').show();
            }else{
                W('#payRoadBox .bank-box').hide();
            }
        },
        //提交评价
        '#pinjiaBtn': function(){
            if(!QW.Valid.check(W('#level')[0])){
                return false;
            }
            if(!QW.Valid.checkAll(W('#buyerRateForm')[0])){
                return false;
            }
            Ajax.post(W('#buyerRateForm')[0], function(data){
                data = data.evalExp();
                if (data.errno) {
                    return alert(data.errmsg);
                };
                location.reload();
            })
        },
        //追加评价
        '#zhuijiapingjia': function(){
            if(!W('#zhuijiaContainer').isVisible()){
                W('#zhuijiaContainer').show();
                return;
            }
            var form = QW.g('zhuijiapingjiaForm');
            if(!QW.Valid.checkAll(form)){
                return false;
            }
            Ajax.post(form, function(data){
                data = data.evalExp();
                if (data.errno) {
                    return alert(data.errmsg);
                };
                location.reload();
            })
        },
        '.editphone': function(e){
            var panel = tcb.alert("修改手机号码", "<p style='padding:20px;width:300px;text-align:center'>请点击确定更新手机号码</p>", {
                wrapId: "editPhonePanel",
                width: 340
            }, function(){
                Ajax.get('/mobile/getmobile', function(data){
                    try{
                        data = data.evalExp();
                        var phone = data.result;
                        W('#mobile').html(phone);
                        panel.hide();
                    }catch(e){}
                })
            });
        },
        '.mod-buy-number .ico_add':function(e){
            e.preventDefault(); 
            if(W("#buy_number").val()>999){
            	  W("#numberTips").show().fadeOut(2000);
                W("#buy_number").val(1000)
            }else{
                W("#buy_number").val(~~W("#buy_number").val()+1);
            }
            
            getExpenses();
        },
        '.mod-buy-number .ico_sub':function(e){
            e.preventDefault();
            if(W("#buy_number").val()>1){
                W("#buy_number").val(~~W("#buy_number").val()-1);
            }else{
                W("#numberTips").show().fadeOut(2000);
            }
            getExpenses();
            
        },
        '.mod-step-fixtype li' : function(e){
            W(".mod-step-fixtype").query('li').removeClass('curr');
            W(this).addClass('curr');
            W("#serviceMethod").val( W(this).attr('data-type') );

            W(".mod-step-fixtype").siblings('.service-type-err').hide();

            getExpenses();
        },
        '#buy_number':{
            'keyup':function(){
                var val = W("#buy_number").val();
                if(val&& /^[0-9]*[1-9][0-9]*$/.test(val)){
                    val = val.substr(0,4);
                    if(val<1){
                    	  W("#numberTips").show().fadeOut(2000);
                          W("#buy_number").val(1)
                    }else if(val>1000){
                    	  W("#numberTips").show().fadeOut(2000);
                        W("#buy_number").val(1000)
                    }
                }else{
                    if(val){
                    	W("#numberTips").show().fadeOut(2000);
                        W("#buy_number").val(1)
                    }

                }
                getExpenses(); 
                
            }
        },
        '#promiseLink':function(e){
            e.preventDefault();
            var panel = tcb.alert("360同城帮声明", W('#showUserProtocalTpl_1').html(), {'width':695}, function(){
                panel.hide();
            });
        },
        '.right-box .r-item' : {
            'mouseenter' : function(e){
                W('.right-box .r-item>p').hide();
                W(this).one('>p').show();
            },
            'mouseleave' : function(e){
                W(this).one('>p').hide();
            }
        }
    });
    
    //支付中对话框
    function showWaitPayDialog(){
        var html = W('#payLayerTpl').html();
        var panel = tcb.panel("360安全支付", html, {
            wrapId: "payLayer",
            width: 400,
            btn: [{
                txt: "已完成支付",
                fn: function(){
                    location.reload();
                }
            },{
                txt: "支付遇到问题",
                fn: function(){
                    window.open('http://chat.5251.net/jsp_admin/client/chat_blue.jsp?companyId=19024&style=41044&locate=cn');
                }
            }]
        });
    }
    
    window.afterBindPhone = function(e){
        if (e !== true) {
            W('#btnSaveTorder').show();
            W('#btnSaveMobilePhone').removeNode();
            W('#mobileContainer').show();
            W('#mobileValidContainer').hide();
            W('#mobile').html(W('#txtMobilePhone').val());
        };
        /*if(!Valid.check(W('#demand_get')[0], true) || !Valid.check(W('#demand_desc')[0], true)){
            return false;
        }*/
        
        if(W('#payRoadBox').css('display')!='none'){
            var payMethod = W('#torderForm .pay-method:checked').val();
            W('#torderForm').one('[name="bank_code"]').val( (payMethod == 'wangyin'? W('#backSelector').val() : payMethod) );
        }else{
            W('#torderForm').one('[name="bank_code"]').val('');
        }

        Ajax.post(W('#torderForm')[0], function(data){
            data = data.evalExp();
            if (data.errno) {
                return alert(data.errmsg);
            };

            //如果是手机支付，不跳转
            if(payMethod == 'mobile'){
                var qrCodeSrc = BASE_ROOT + 'torder/qrcode/?order_id=' + data.result;
                tcb.alert("手机支付",'<div style="padding:10px;"><h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2><div style="text-align:center"><img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="'+qrCodeSrc+'"></div></div>', {
                    width:300,
                    height:350
                }, function(){return true});
                
                return; 
            }
            //如果是手机支付，不跳转
            if(payMethod == 'WXPAY_JS'){
                var qrCodeSrc = BASE_ROOT + 'torder/qrcode/?order_id=' + data.result;
                tcb.alert("微信支付",'<div style="padding:10px;"><h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2><div style="text-align:center"><img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="'+qrCodeSrc+'"></div></div>', {
                    width:300,
                    height:350
                }, function(){return true});

                return;
            }
           
            var payForm = W('#payForm')[0];
            var order_id = data.result;
            
            //payForm.order_id.value = order_id;            
            //payForm.submit();
            var orderUrl = BASE_ROOT  + '/torder/detail/?order_id=' + order_id + '&inclient=1';

            if( W('#payMethod').val() == 1 ){
                var baseUrl = payForm.action;            
                var url = baseUrl + '?order_id=' + order_id;
                window.open( url );

                //弹开付款页面，打开未付款订单页
                window.location.href = orderUrl  + '#waitpay';
            }else{
                window.location.href = orderUrl ;
            }
        })
    }
    window.getNewPKey = function(callback){
        Ajax.get('/aj/get_postkey/?fr=oinfo', function(rs){
            W('#torderForm [name="postkey"]').val(rs);            
            W('#torderForm [name="is_ckpostkey"]').val(1);              

            callback && callback();
        });
    }
    if (W('#uploadArbitrationImgs').length) {
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
                    W(html).appendTo(W('#upPhotoList'));
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
            flash_url : {stc:"/resource/swf/swfupload2.2.fix.swf"}.stc,

            // Debug Settings
            debug: false
        });
    };

    //如果没有默认的问题，就选中第一项
    try{ 
        var defques = W('.cur-ques-list').attr('data-defques');
        if( !defques ){
            W('.cur-ques-list li').item(0).fire('click'); 
        }else{
            W('.cur-ques-list li[data-ques="'+defques+'"]').item(0).fire('click'); 
        }
    }catch(ex){}

    //如果强制只能进行某一项付款，就选中它，否则选中传递来的项，否则选中在线
    try{ 
        var pmode = window.location.href.queryUrl('paymode') || 1;
        var payMode = W('.mod-step-zhifutype').attr('data-onlypay');
        if( ( payMode=='online' || !payMode ) && pmode ==1 ){ 
            W('.mod-step-zhifutype li').item(0).fire('click'); 
        }else{
            W('.mod-step-zhifutype li').item(1).fire('click'); 
        }
    }catch(ex){}

    //默认选择第一个维修方式
    try{ 
        var defType = W('.mod-step-fixtype').attr('data-type');
        W('.mod-step-fixtype li[data-type='+defType+']').fire('click'); 
    }catch(ex){}

    //如果是客户端中，在线支付中的中间状态页，就判断是否要触发显示提示框
    try{
        if(window.location.search.indexOf('inclient')>-1 && W('#payLayerTpl').length>0 && window.location.hash.indexOf('waitpay')>-1){ 
            showWaitPayDialog(); 
            window.location.hash = '';
        }
    }catch(ex){
        
    }

    //是否不需要登录提交，出现登陆框
    try{
        if(allowUnloginSubmit && W('#orderUserLR').length > 0){
            InnerLogin.show('orderUserLR', 'orderUserLogin', 'orderUserReg', {
                'loginSucc' : function(){ window.location.reload(); },
                'regSucc' : function(){ window.location.reload(); }
            });
        }
    }catch(ex){}
})
