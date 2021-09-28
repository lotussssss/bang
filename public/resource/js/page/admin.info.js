Dom.ready(function(){
    try{
        var center = new AMap.LngLat(W('#mapContainer').attr('longitude'), W('#mapContainer').attr('latitude')),
            map = new AMap.Map("mapContainer",{
              view: new AMap.View2D({//创建地图二维视口
                   center: center,
                   zoom:11,
                   rotation:0
              })
            });
        var marker = new AMap.Marker({
            map : map,
            id:"mapMarker",
            position: center, 
            icon:"https://p.ssl.qhimg.com/t01c04d11f81e314a56.png",
            offset:{x:-13,y:-36} 
        });
    }catch(e){}

    // function 
    function doWithHash(){
        var hash = location.hash.replace('#','');
        W(".c-wrap").hide();
        W('.tabzhiliao ul li').removeClass('selcur');
        if(hash=="dianpu"){
            W('.tabzhiliao ul').query('li').item(1).addClass('selcur');
            W("#dianpu_info").show();
        }else if(hash=="jiesuan"){
            W('.tabzhiliao ul').query('li').item(2).addClass('selcur');
            W("#jiesuan_info").show();
        }else if(hash=="gonggao"){
            W('.tabzhiliao ul').query('li').item(3).addClass('selcur');
            W("#gonggao_info").show();
        }else{
            W('.tabzhiliao ul').firstChild('li').addClass('selcur');
            W("#shenqing_info").show();
        }
    }

    doWithHash();

    // 修改地图标注的marker和map对象
    var nMarker, nMap;
    //在地图上添加一个点
    function addMarker(item){
        nMarker = new AMap.Marker({
            id: "mapMarker2",
            position: new AMap.LngLat(item.lng, item.lat),
            icon: "https://p.ssl.qhimg.com/t01c04d11f81e314a56.png",
            offset: {x:-13,y:-36} 
        });
        nMap.addOverlays(nMarker);
    }

    tcb.bindEvent(document.body, {
        '.tabzhiliao ul li':function(e){
            W('.c-wrap').hide();
            W('.tabzhiliao ul li').removeClass('selcur');
            W(this).addClass('selcur');
            W('#'+W(this).attr('data-id')).show();
        },
        'a.modify-dianpu':function(e){
            e.preventDefault();
            W("#dianpuBaseInfo").hide();
            W("#editDianpuWrap").show();
        },
        'a.back-toinfo':function(e){
            e.preventDefault();
            W("#dianpuBaseInfo").show();
            W("#editDianpuWrap").hide();
        },
        'a.btn-continue':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#editDianpu')[0])){
                return false;
            }

            var phoneValue = W('#phonezone').val();
            if (W('#phonecode').val()) {
                phoneValue += '-' + W('#phonecode').val();
            };
            if (W('#phoneext').val()) {
                phoneValue += '-' + W('#phoneext').val();
            }
            W('#fixed_phone').val(phoneValue);

            Ajax.post(W('#editDianpu')[0], function(result){
                try{
                    result = (result || "").evalExp();
                    if (parseInt(result.errno,10) == 0) {
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">修改成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410, 
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                            location.hash = "dianpu";
                            location.reload(true);
                        });
                    }else{
                        return alert(result.errmsg);
                    };
                    setTimeout(function(){
                        panel.hide();
                        location.hash = "dianpu";
                        location.reload(true);  
                    },3000)
                    
                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            })
        },
        // 重新标注地图上的位置
        '#RemarkPos': function(e){
            e.preventDefault();

            var content = W('#mapPointTpl2').html();
            var panel = tcb.alert("标注地图", content, {'width':695}, function(){
                if (!nMarker) {
                    return alert("请标注地图")
                };
                var pos = nMarker.getPosition();
                W('#map_longitude').val(pos.lng);
                W('#map_latitude').val(pos.lat);
                W('#latitude_span').html('标注成功');
                QW.Valid.check(W('#map_longitude')[0]);
                nMarker = null;
                return true;
            });
            var map_longitude = W('#map_longitude').val(),
                map_latitude = W('#map_latitude').val();
            //初始化地图
            var center = map_longitude && map_latitude 
                    ? new AMap.LngLat(map_longitude, map_latitude)
                    : new AMap.LngLat(116.397120, 39.916520);

            nMap = new AMap.Map("mapPointContainer",{
                view: new AMap.View2D({//创建地图二维视口
                   center: center,
                   zoom:10,
                   rotation:0
              })
            }); 
            nMap.plugin(["AMap.ToolBar","AMap.OverView","AMap.Scale"], function(){
                var overview = new AMap.OverView();
                nMap.addControl(overview);
                var toolbar = new AMap.ToolBar();
                toolbar.autoPosition=false;
                nMap.addControl(toolbar);
                var scale = new AMap.Scale();
                nMap.addControl(scale);
            });
            nMap.scrollWheel = true;
            nMap.keyboardEnable = true;
            nMap.dragEnable = true;
            nMap.doubleClickZoom = true;
            var infoWin = new AMap.InfoWindow({ offset: new AMap.Pixel(45,-34), content:""});
            nMap.setFitView();
            nMap.bind(nMap, 'click', function(e){
                addMarker(e.lnglat);
            });
            if (map_longitude && map_latitude) {
                setTimeout(function(){
                    addMarker({
                        lat: map_latitude,
                        lng: map_longitude
                    });
                }, 100);
            }else{
                var address = [W('#city').val(), W('#area').val(), W('#areaquan').val()].join(' ');
                var GeocoderOption = {};
                var geo = new AMap.Geocoder(GeocoderOption); 
                geo.geocode(address, function(data){
                    if(data.status == "E0" ){
                        var pos = {
                            lng: parseFloat(data.list[0].x),
                            lat: parseFloat(data.list[0].y)
                        }
                        addMarker(pos);
                        nMap.setCenter(new AMap.LngLat(pos.lng, pos.lat))
                    }
                });
            }
        },
        '.editphone': function(){
            var panel = tcb.alert("修改手机号码", "<p style='padding:20px;width:300px;text-align:center'>修改完成，请点击确定更新手机号码</p>", {
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
        // 添加公告
        '.gonggao-add-item': function(e){
            e.preventDefault();
            if(!(W('.gonggao-item').query('tr').length<5)){
                alert('最多发布3条商家公告，1条手机订单公告');
                return ;
            }
            var wEditarea = W('.gonggao-edit-area');
            wEditarea.show()
                .query('textarea').val('例：消费满200元免费上门').addClass('non-active').attr('gonggao-id', '');

            var wActiveline = W('.gonggao-active-line');
            wActiveline.hide();
            W('.gonggao-add-title').show();
            W('.gonggao-edit-title').hide();
        },
        // 编辑公告
        '.gonggao-edit-item': function(e){
            e.preventDefault();
            var wMe = W(this),
                wTr = wMe.parentNode('tr');
            
            var wEditarea = W('.gonggao-edit-area');
            var wSpan = wTr.query('td').one('span');
            var g_content;
            if (wSpan.length) {
                g_content = wSpan.html();
                wEditarea.query('[name="gcolor"]').attr('checked', true);
            } else {
                g_content = wTr.query('td').item(1).html();
                wEditarea.query('[name="gcolor"]').attr('checked', false);
            }

            wEditarea.show()
                .query('textarea').val(g_content).removeClass('non-active').attr('gonggao-id', wTr.attr('gonggao-id')).focus();
            var type_id = wTr.attr('type-id');
            
            wEditarea.query('select').val(type_id==2 ? type_id : '1');
            var wActiveline = W('.gonggao-active-line');
            wActiveline.hide();
            W('.gonggao-add-title').hide();
            W('.gonggao-edit-title').show();
        },
        // 删除公告
        '.gonggao-delete-item': function(e){
            e.preventDefault();

            var wMe = W(this),
                wTr = wMe.parentNode('tr'),
                params = {
                    'id': wTr.attr('gonggao-id')
                };

            // 删除公告
            QW.Ajax.post(URL_ROOT+'mer_info/del_gonggao', params, function(response){
                response = (response || "").evalExp();

                if (parseInt(response.errno, 10)===0) {
                    if(wTr.siblings('tr').length==1){
                        wTr.siblings('tr').item(0).insertSiblingAfter('<tr><td colspan="4">还没有公告~~</td></tr>');
                    } else {
                        wTr.nextSiblings('tr').forEach(function(el){
                            var wCurTr = W(el);
                                wCurTd = wCurTr.query('td').item(0);
                            wCurTd.html(parseInt(wCurTd.html(), 10)-1);
                        });
                    }
                    wTr.removeNode();
                } else {
                    alert(response.errmsg);
                }
            });
        },
        // 确认添加/编辑公告
        '.gonggao-edit-confirm': function(e){
            e.preventDefault();

            var wMe = W(this),
                wTextarea = wMe.siblings('textarea'),
                gonggao_id = wTextarea.attr('gonggao-id'),
                gonggao_content = wTextarea.val(),
                gtype = $('[name="gtype"]').val(),
                gcolor = $('[name="gcolor"]:checked').val(),
                gcolor = (gcolor == 1 ? 1 : 0),
                params = {
                    'gtype': gtype,
                    'content': gonggao_content,
                    'color': gcolor
                },
                request_url = URL_ROOT+'mer_info/add_gonggao';
            var wTr = W('.gonggao-item tr');
            var wType2 = wTr.filter('[type-id="2"]');
            // 手机订单公告
            if (gtype=='2') {
                if(wType2.length&&wType2.attr('gonggao-id')!=gonggao_id){
                    alert('只能发布1条手机订单公告');
                    return;
                }
            } else {
                if((wTr.length-wType2.length-1)>2){
                    var wGG = wTr.filter('[gonggao-id="'+gonggao_id+'"]');
                    // 增加
                    if (!wGG.length) {
                        alert('最多只能发布3条商家公告');
                        return;
                    }
                    // 编辑
                    else {
                        if(wGG.attr('type-id')=='2'){
                            alert('最多只能发布3条商家公告');
                            return;
                        }
                    }
                }
            }
            if (wTextarea.hasClass('non-active') || wTextarea.val()==='') {
                alert('请输入公告内容');
                return ;
            }
            if (gonggao_id) {
                request_url = URL_ROOT+'mer_info/edit_gonggao';
                params['id'] = gonggao_id;
            }

            // 添加/编辑 公告
            QW.Ajax.post(request_url, params, function(response){
                response = (response || "").evalExp();

                if (parseInt(response.errno, 10)===0) {
                    var result = response['result'];
                    if (gonggao_id) {
                        var wEdititem = wTr.filter('[gonggao-id="'+gonggao_id+'"]'),
                            wTd = wEdititem.query('td');

                        wEdititem.attr('type-id', result['type']);
                        wTd.item(1).html(result['content']);
                        wTd.item(2).html(result['type_name']);

                        closeGongGaoEdit();
                        return ;
                    }
                    var tr_index = wTr.length,
                        wLastitem = wTr.item(wTr.length-1);
                    if (wLastitem.query('td').length==1) {
                        wLastitem.removeNode();

                        wTr = W('.gonggao-item tr');
                        tr_index = wTr.length;
                        wLastitem = wTr.item(wTr.length-1);
                    }
                    var tr_str = '<tr gonggao-id="'+result['id']+'" type-id="'+result['type']+'"><td>'+tr_index+'</td><td class="align-left">'+result['content']+'</td><td>'+result['type_name']+'</td><td>'+result['create_time']+'</td><td><a href="#" class="gonggao-edit-item">修改</a><a href="#" class="gonggao-delete-item">删除</a></td></tr>';
                    wLastitem.insertSiblingAfter(tr_str);

                    closeGongGaoEdit();
                } else {
                    alert(response.errmsg);
                }
            });
        },
        // 关闭添加
        '.gonggao-close-add': function(e){
            e.preventDefault();

            closeGongGaoEdit();
        },
        // 关闭编辑
        '.gonggao-close-edit': function(e){
            e.preventDefault();

            closeGongGaoEdit();
        },
        // textarea框的基本事件
        '.gonggao-textarea': {
            'focus': function(e){
                var wMe = W(this);

                if (wMe.hasClass('non-active') && wMe.val()==='例：消费满200元免费上门') {
                    wMe.val('');
                }
                wMe.removeClass('non-active');
            },
            'blur': function(e){
                var wMe = W(this);

                if (wMe.val()==='') {
                    wMe.addClass('non-active').val('例：消费满200元免费上门');
                }
            }
        },
        // 添加暂停营业时间
        '.add-rest-time-btn': function(e){
            e.preventDefault();

            var panel = tcb.alert("添加暂停营业时间", '<div id="AddRestTimePannel" class="add-rest-time-pannel"></div>', {'width':300, btn_name: '确认'}, function(){
                var starttime = W('#PRestStarttime').val(),
                    endtime = W('#PRestEndtime').val();
                if (starttime>endtime) {
                    return false;
                }
                W('.rest-starttime-inpt').val(starttime);
                W('.rest-endtime-inpt').val(endtime);
                W('.rest-time-range').html(starttime+' 至 '+endtime+' 暂停营业');

                var request_url = URL_ROOT+'mer_info/edit_merinfo',
                    params = {
                        'close_sdate': starttime,
                        'close_edate': endtime
                    };
                QW.Ajax.post(request_url, params, function(response){
                    response = (response || "").evalExp();

                    if (parseInt(response.errno, 10)===0) {
                        W('.add-rest-time-btn').html('修改暂停营业时间')
                    } else {
                        alert(response.errmsg);
                    }
                });
                return true;
            });
            var starttime = W('.rest-starttime-inpt').val(),
                endtime = W('.rest-endtime-inpt').val(),
                data = {
                    'starttime': starttime,
                    'endtime': endtime
                };
            if (!starttime) {
                var todayDate = new Date;
                data['starttime'] = todayDate.getFullYear()+'-'+fixLength(todayDate.getMonth()+1)+'-'+fixLength(todayDate.getDate());
                data['endtime'] = data['starttime'];
            }

            var rest_fn = W('#AddRestTimeTpl').html().trim().tmpl(),
                rest_str = rest_fn(data);
            W('#AddRestTimePannel').html(rest_str);
        },
        // 选择暂停营业的起止时间
        '#PRestStarttime, #PRestEndtime':{
            'focus': function(e){
                var wMe = W(this);
                var attr_toDateEl = wMe.attr('toDateEl'),
                    attr_fromDateEl = wMe.attr('fromDateEl');
                // starttime input
                if (attr_toDateEl) {
                    var toDateEl = W('#'+attr_toDateEl);

                    if (toDateEl.val()<wMe.val()) {
                        W('#AddRestTimePannel .warn-tip').show();
                    } else{
                        W('#AddRestTimePannel .warn-tip').hide();
                    }
                }
                // endtime input
                else if(attr_fromDateEl){
                    var fromDateEl = W('#'+attr_fromDateEl);

                    if (fromDateEl.val()>wMe.val()) {
                        W('#AddRestTimePannel .warn-tip').show();
                    } else{
                        W('#AddRestTimePannel .warn-tip').hide();
                    }
                }                
            },
            'click': function(e){
                var me = this;

                QW.Calendar.pickDate(me);
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
    /**
     * 关闭公告编辑
     * @return {[type]} [description]
     */
    function closeGongGaoEdit(){
        W('.gonggao-add-title').hide();
        W('.gonggao-edit-title').hide();
        W('.gonggao-edit-area').hide();
        W('.gonggao-active-line').show();
    }
    /**
     * 用前置0补充字符串的长度
     * @param  {[type]} str [description]
     * @param  {[type]} len [description]
     * @return {[type]}     [description]
     */
    function fixLength(str, len){
        len = parseInt(len, 10) || 2;

        str = str.toString(),
        fixed_len = len - str.length;
        if (fixed_len>0) {
            for(var i=0;i<fixed_len;i++){
                str = '0'+str;
            }
        }

        return str;
    }
});