Dom.ready(function(){
    var map, marker;
    //在地图上添加一个点
    function addMarker(item){
        if (!marker) {
            marker = new AMap.Marker({
                id:"mapMarker",
                position:new AMap.LngLat(item.lng, item.lat), 
                icon:"https://p.ssl.qhimg.com/t01c04d11f81e314a56.png",
                offset:{x:-13,y:-36} 
            });
            marker.setMap(map);
        }else{
            marker.setPosition(new AMap.LngLat(item.lng, item.lat));
        }
    }
    /**
     * 图片上传
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    function initUploadImgs(id){
        var el = W('#'+id);
        var input = el.parentNode('.picshow').query('input.url');
        var utype = input.attr('data-utype');
        var type = input.val() ? '' : 'new';
        var name = input.attr('data-name');
        var imgUrl = type == 'new' ? {stc:'https://p.ssl.qhimg.com/t01dac132dcaf7bf1fb.jpg'}.stc : {stc:'https://p.ssl.qhimg.com/t01cb94cbac466d9885.jpg'}.stc
        var parentNode = el.parentNode();
        var parentNodeHtml = parentNode.html();

        function upload_error(){
            var p = input.parentNode('.picshow');
            p.query('input.url').val('');
            var img = p.query('img.img');
            var dataType = img.attr('data-type');
            if (dataType == 1) {
                img.attr('src', {stc:"https://p.ssl.qhimg.com/t01d7c93bcecf68d50a.png"}.stc);
            }else{
                img.attr('src', {stc:"https://p.ssl.qhimg.com/t017424afd9987681ef.png"}.stc);
            }
            instance.destroy();
            parentNode.html(parentNodeHtml);
            initUploadImgs(id);
        }
        var timeoutTimer = 0;
        var instance = new SWFUpload({
            // Backend Settings
            upload_url: 'http://'+location.host+"/aj/applyupload/",
            post_params: {"uptype": utype, "upname": name},
            file_post_name: name,

            // File Upload Settings
            file_size_limit : "5 MB",   // 5MB
            file_types : "*.jpg;*.jpeg;*.png;*.gif",
            file_types_description : "图片文件",
            file_upload_limit : "1",
            file_queue_limit: "1",

            file_queue_error_handler: function(file, errorCode, message){
                try {
                    var errorName = "";
                    switch (errorCode) {
                        case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                            errorName = "上传图片不能超过1张";
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
                        alert(errorName);
                        return;
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            file_dialog_complete_handler : function (numFilesSelected, numFilesQueued) {
                try {
                    if (numFilesQueued > 0) {
                        this.startUpload();
                        var img = input.parentNode('.picshow').query('img.img');
                        var dataType = img.attr('data-type');
                        if (dataType == 1) {
                            img.attr('src', {stc: "https://p.ssl.qhimg.com/t0148aad7929e04449b.gif"}.stc);
                        }else{
                            img.attr('src', {stc: "https://p.ssl.qhimg.com/t017ee3be501e423c98.gif"}.stc);
                        }
                        input.parentNode('.picshow').query('.viewgaoqingpic').hide();
                        timeoutTimer = setTimeout(function(){
                            upload_error();
                            alert("上传失败，请重试");
                        }, 300000);
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            upload_error_handler : function(file, errorCode, message) {
                upload_error();
                clearTimeout(timeoutTimer);
                alert(message);
            },
            upload_success_handler : function(file, serverData){
                clearTimeout(timeoutTimer);
                try{
                    serverData = JSON.parse(serverData) || {};
                }catch(e){
                    upload_error();
                    return alert("上传失败，请重试");
                }
                if (serverData.errno) {
                    upload_error();
                    return alert(serverData.errmsg);
                }else{
                    var p = input.parentNode('.picshow');
                    var inp = p.query('input.url');
                    inp.val(serverData.result);
                    QW.Valid.check(inp[0]);
                    var img = p.query('img.img');
                    img.attr('src', serverData.result);
                    var a = p.query('.viewgaoqingpic').show().query('a');
                    a.attr('href', serverData.result);
                    instance.destroy();
                    parentNode.html(parentNodeHtml);
                    initUploadImgs(id);
                }
            },

            // Button Settings
            button_image_url : imgUrl,
            button_placeholder_id : id,
            button_width: 103,
            button_height: 31,
           
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_cursor: SWFUpload.CURSOR.HAND,
            
            // Flash Settings
            flash_url : "/resource/"+"swf/swfupload2.2.fix.swf", //特别处理，保证使用的是bang域的swf文件

            // Debug Settings
            debug: false
        });
    }

    /**
     * 获取城市的options
     * @param  {[type]} result [description]
     * @return {[type]}        [description]
     */
    function getOptionsHtml(result, initValue){
        if (typeof result == 'string') {
            result = result.evalExp();
            if (result.errno) {
                alert(result.errmsg);
                return W('#emptyOptionTpl').html();
            };
            result = result.result || [];
        };
        var html = [W('#emptyOptionTpl').html()];
        result.forEach(function(item, i){
            html.push('<option value="'+item+'" '+(initValue == item ? "selected" : "")+' data-index="'+i+'">'+item+'</option>')
        })
        return html.join('');
    }
    

    function initCom1(){
        tcb.bindEvent('#comInfoContainer', {
            '.map-point': function(e){
                e.preventDefault();
                var mapPointLink = this;
                var content = W('#mapPointTpl').html();
                //var panel = tcb.panel();
                var panel = tcb.alert("标注地图", content, {'width':695}, function(){
                    if (!marker) {
                        return alert("请标注地图");
                    };
                    var pos = marker.getPosition();
                    var addrPoi = W(mapPointLink).attr('data-poi');
                    if(addrPoi){
                        addrPoi = addrPoi.split(',');
                        var lnglat = new AMap.LngLat(pos.lng, pos.lat);
                        var distance = lnglat.distance( new AMap.LngLat(addrPoi[0], addrPoi[1]) );

                        if(distance > 1000){
                            if(!confirm("您标注的坐标和店铺地址距离差异较大，建议您重新标注或者修改店铺地址。\n\n确认当前标注请点击“确定”，重新标注请点击“取消”") ){
                                return false;
                            }
                        }
                    }

                    W('#map_longitude').val(pos.lng);
                    W('#map_latitude').val(pos.lat);
                    W('#latitude_span').html('标注成功');
                    QW.Valid.check(W('#map_longitude')[0]);
                    marker = null;
                    return true;
                });
                panel.on('afterhide', function(){
                    marker = null;
                });
                //初始化地图
                var center=new AMap.LngLat(116.397120,39.916520);
                var lat =  W('#map_latitude').val();
                var lng =  W('#map_longitude').val();
                if (lat && lng) {
                    center=new AMap.LngLat(lng,lat)
                };
                map = new AMap.Map("mapPointContainer",{
                    view: new AMap.View2D({//创建地图二维视口
                       center:center,
                       zoom:12,
                       rotation:0
                    })                    
                }); 
                map.plugin(["AMap.ToolBar","AMap.OverView","AMap.Scale"],function(){
                    var overview = new AMap.OverView();
                     map.addControl(overview);
                    var toolbar = new AMap.ToolBar();
                    toolbar.autoPosition=false;
                    map.addControl(toolbar);
                    var scale = new AMap.Scale();
                    map.addControl(scale);
                });
                map.scrollWheel = true;
                map.keyboardEnable = true;
                map.dragEnable = true;
                map.doubleClickZoom = true;
                var infoWin = new AMap.InfoWindow({ offset: new AMap.Pixel(45,-34), content:""});
                map.setFitView();
                AMap.event.addListener(map, 'click', function(e){
                    addMarker(e.lnglat);
                })
                if (lng && lat) {
                    
                    setTimeout(function(){
                        addMarker({
                            lat: lat,
                            lng: lng
                        })
                    }, 100)
                }else{
                    var address = [W('#city').val(), W('#area').val(), W('#addr_detail').val()].join(' ');
                    var MGeocoder;
                    // 加载地理编码插件 
                    map.plugin(["AMap.Geocoder"], function() {
                        MGeocoder = new AMap.Geocoder({
                            radius: 1000,
                            extensions: "all"
                        });
                        //返回地理编码结果
                        AMap.event.addListener(MGeocoder, "complete", function(datas){
                            if(datas && datas['resultNum'] > 0 ){
                                var pos = {
                                    'lng': datas['geocodes'][0]['location']['lng'],
                                    'lat': datas['geocodes'][0]['location']['lat']
                                }
                                addMarker(pos);
                                map.setCenter(new AMap.LngLat(pos.lng, pos.lat));
                                //把检测到的地址的poi的数据存储起来
                                W(mapPointLink).attr('data-poi', [pos.lng, pos.lat].join(','));
                            }
                        });
                        //逆地理编码
                        MGeocoder.getLocation(address);
                    });
                }
            },
            'a.next': function(e){
                if(!QW.Valid.checkAll(W('#comInfoForm1')[0], true, {
                    myValidator: function(el){
                        // if (el.id != "lice_no") {
                        //     return true;
                        // };
                        // if(W(el).attr('data-errno') | 0){
                        //     setTimeout(function(){
                        //         Valid.fail(el, '该注册号已申请', false);
                        //     }, 100)
                        //     return false;
                        // }
                        // 没有绑定手机号
                        var wDivBindPhone2 = W('#divBindPhone2');
                        var moinput = W('#nobindmobile');
                        var showMobileErr = false;
                        if (wDivBindPhone2.length) {
                            var wError = wDivBindPhone2.query('.error');
                            if (wError.length) {
                                wError.show();
                            } else {
                                wDivBindPhone2.insertAdjacentHTML('beforeend', '<em class="error">请绑定手机号码</em>');
                            }
                            QW.NodeW.shine4Error( moinput );
                            moinput.select();
                            moinput[0].scrollIntoView(false);
                            //showMobileErr = true;
                        }
                        //目前强制返回true。手机号的验证过程，其实手机号的表单字段并没有进入这里进行验证，所以，在验证其他字段时，对号码字段顺便进行的验证。而其他表单字段的验证逻辑其实并不在这里，所以默认返回tue.
                        return true;
                    }
                })){
                    return false;
                }
                var href = W(this).attr('href');
                var phoneValue = W('#phonezone').val();
                if (W('#phonecode').val()) {
                    phoneValue += '-' + W('#phonecode').val();
                };
                if (W('#phoneext').val()) {
                    phoneValue += '-' + W('#phoneext').val();
                }
                W('#fixed_phone').val(phoneValue);
                Ajax.post(W('#comInfoForm1')[0], function(result){
                    try{
                        result = (result || "").evalExp();
                        // console.log(result);return;
                        if (result.errno) {
                            return alert(result.errmsg);
                        };
                        window.onbeforeunload = null;
                        QW.Cookie.set('show_audit_panel', '1', {'path' : '/'});
                        location.href = href;
                    }catch(e){
                        alert("提交失败，请稍后重试");
                    }
                })
            },
            '.editphone': function(){
                var panel = tcb.alert("修改手机号码", "<p style='padding:20px;width:300px;text-align:center'>请点击确定更新手机号码</p>", {
                    wrapId: "editPhonePanel",
                    width: 340
                }, function(){
                    Ajax.get('/mobile/getmobile', function(data){
                        try{
                            data = data.evalExp();
                            var phone = data.result;
                            W('#mobile').val(phone);
                            panel.hide();
                        }catch(e){}
                    })
                });
            },
            // 去绑定手机号
            '#btnBindPhone2': function(e){
                var panel = tcb.alert("绑定手机号码", "<p style='padding:20px;width:300px;text-align:center'>请点击确定更新手机号码</p>", {
                    wrapId: "bindPhonePanel",
                    width: 340
                }, function(){
                    Ajax.get('/mobile/getmobile', function(data){
                        try{
                            data = data.evalExp();
                            var phone = data.result;
                            if (phone) {
                                W('#mobile').val(phone);

                                W('#divPhone').show();
                                W('#divBindPhone2').removeNode();
                            }
                            panel.hide();
                        }catch(e){}
                    });
                });
            },
            '#nobindmobile': {
                'blur': function(e){
                    var wMe = W(this);

                    if( tcb.validMobile(wMe.val()) ){
                        var r_url = '/aj/shop_reg_log/?mobile='+wMe.val()+'&name='+W('#linkman').val();
                        Ajax.get(r_url, function(){});
                    }
                }
            },
            'input[type="text"]': {
                change: function(){
                    window.onbeforeunload = function(){
                        return '离开后，填写的内容将会丢失';
                    }
                }
            },
            //如果选择上门服务，在需要显示上门范围。
            '#service_modes_box input[type="checkbox"]' : function(e){
                if( W('#service_mode_0').attr('checked') ){
                    W('#sm_range_box').show();
                }else{
                    W('#sm_range_box').hide();
                }
            },
            //全选某tag分组
            '.tag-group-check' : function(e){
                var ckList = W(this).parentNode('.weixiuneirong').query('.tag-list[data-rel="'+W(this).attr('data-for')+'"] input[type="checkbox"]');
                if( W(this).attr('checked') ){
                    ckList.attr('checked', true);
                }else{
                    ckList.attr('checked', false);
                }
            }
        });
        ['qiyelogo'].forEach(function(item){
            if (W('#'+item).length == 0) {
                return false;
            };
            initUploadImgs(item);
        });

        //绑定手机号码
        if(W('#btnBindPhone').length) {
            var panelBindPhone;
            window['afterBindPhone'] = function() {
                W('#mobile').val(W('#txtMobilePhone').val());
                W('#divPhone').show();
                W('#divBindPhone').hide();

                panelBindPhone.hide();
            };

            W('#btnBindPhone').click(function(e) {
                e.preventDefault();
                
                panelBindPhone = tcb.panel('绑定手机号码', W('#bindPhoneTpl').html(),
                    {
                        'width' : 410, 
                        'wrapId' : 'panelBindPhone', 
                        'btn': [{
                                txt: "确定",
                                id : "btnSaveMobilePhone"
                            }]
                    });
            });
        }

        //显示协议
        if(W('#showProtocal').length) {
            W('#showProtocal').click(function(e) {
                e.preventDefault();
                var panel = tcb.alert("360同城帮商户服务协议", W('#showProtocalTpl').html(), {'width':695}, function(){
                    panel.hide();
                });
            });
        }
    }
    function initCom2(){
        tcb.bindEvent('#blankInfoContainer', {
            'a.next': function(){
                if(!QW.Valid.checkAll(W('#comInfoForm2')[0], true, {
                    myValidator: function(el){
                        if (el.id != "lice_no") {
                            return true;
                        };
                        if(W(el).attr('data-errno') | 0){
                            setTimeout(function(){
                                if(W('#mer_type').val()=='person'){
                                    Valid.fail(el, '该身份证号已存在', false);
                                }else{
                                    Valid.fail(el, '该注册号已申请', false);
                                }
                            }, 100)
                            return false;
                        }
                        return true;
                    }
                })){
                    return false;
                }
                var href = W(this).attr('href');
                Ajax.post(W('#comInfoForm2')[0], function(result){
                    try{
                        result = result.evalExp() || {};
                        if (result.errno) {
                            return alert(result.errmsg);
                        };
                        window.onbeforeunload = null;
                        location.href = href;
                    }catch(e){
                        alert("提交失败，请稍后重试");
                    }
                })
            },
            '#bank_province': {
                change: province_change
            },
            'input[type="text"]': {
                change: function(){
                    window.onbeforeunload = function(){
                        return '离开后，填写的内容将会丢失';
                    }
                }
            },
            // 验证注册号
            '#lice_no': {
                blur: function(){
                    var value = this.value;
                    if (value.length != 15 && value.length != 18) {
                        return false;
                    };
                    var self = this;
                    Ajax.post('/applyshop/cklice', {
                        lice_no: value,
                        mer_type : W('#mer_type').val()
                    }, function(data){
                        try{
                            data = data.evalExp();
                            W(self).attr('data-errno', data.errno);
                            if (data.errno) {
                                Valid.fail(self, data.errmsg, false);
                            }else{
                                Valid.fass(self);
                            }
                        }catch(e){}
                    })
                }
            },
            //复制个人信息到银行卡填写处
            '.copy-personal-info' : function(e){
                e.preventDefault();
                W('#comInfoForm2 [name="bankcard_name"]').val( W('#comInfoForm2 [name="mer_name"]').val()||'' );
                W('#comInfoForm2 [name="id_card"]').val( W('#comInfoForm2 [name="lice_no"]').val()||'' );
            }          
        });
        // 初始化图片上传
        ['yingyezhizhao','idcard_img_b', 'idcard_back_img_b', 'idcard_person_img_b'].forEach(function(item){
            if (W('#'+item).length == 0) {
                return false;
            };
            initUploadImgs(item);
        });
        function province_change(){
            var el = W(this);
            var value = this.value + '';
            if (value.length == 0) {
                W('#bank_city').html(W('#emptyOptionTpl').html());
            }else{
                var index = W(this.options[this.selectedIndex]).attr('data-index');
                var data = area.cities[index];
                var initValue = W('#bank_city').attr('data-value');
                W('#bank_city').attr('data-value', '');
                var html = getOptionsHtml(data, initValue);
                W('#bank_city').html(html);
            }
        }
        var initValue = W('#bank_province').attr('data-value');
        var html = getOptionsHtml(area.provinces, initValue);
        W('#bank_province').html(html);
        if (initValue) {
            //这里用fire在se6.1下不能触发
            province_change.call(W('#bank_province')[0]);
        };
    }
    window.initCom1 = initCom1;
    window.initCom2 = initCom2;

    //强制用户补全用户名
    if(W('.user-info').html() && W('.user-info').html().trim().indexOf('360U') == 0) {
        QHPass.when.username( QHPass.__loginDefaultFun );
    }
})