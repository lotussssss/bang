Dom.ready(function(){
    // 提交自营订单
    if (!W('.page-shangmen-order').length) {
        return ;
    }
    var SM = window.Shangmen,
        queryParams = tcb.queryUrl(window.location.search)

    window.__ServiceId = queryParams['fault_id'];
    window.__ShangmenDateTime;
    window.__DaodianDateTime;
    window._ServiceData = window._ServiceData || {};

    // 基本处理
    (function(){
        // 处理扩展服务数据，变成k-v形式
        function dealExtendService(){
            var __ExtendService = window.__ExtendService || '';
            if (__ExtendService) {
                __ExtendService = JSON.parse(__ExtendService);
            }
            window.__ExtendService = {};
            __ExtendService.forEach(function(item){
                window.__ExtendService[item['id']] = item;
            });
        }
        dealExtendService();

    }());

    // 服务的选择
    (function(){

        tcb.bindEvent(document.body, {
            // 选择修改其他服务内容
            '.sel-other-issue' : function(e){
                e.preventDefault();

                W('.product-list').slideDown();
            },
            '.addr-stations li' : function(){
                var me = $(this),
                    active = "active";
                me.siblings().removeClass(active);
                me.addClass(active);
                W(".show-stations-address").show();
                W(".stations-to").html(me.attr("data-station") + " " + me.attr("data-consignee"));
                W(".express_station_id").val(me.attr("data-id"));
            },
            // 选择维修产品
            '.product-list .product-item' : function(e){
                e.preventDefault();
                var wMe = W(this);

                var data_type = wMe.attr('data-type'),  // 当前分类标识
                    service_id = wMe.attr('data-id'),   // 服务大类id
                    price = wMe.attr('data-price'),     // 默认大类价格
                    oprice = wMe.attr('data-oprice'),   // 默认原始价格
                    prd = wMe.html(), // 服务名称
                    extInfo = wMe.attr('data-extinfo'); // 服务扩展描述

                window.__ServiceId = service_id

                // 添加被选中class
                W('.fault-row .product-select').removeClass('product-select');
                wMe.addClass('product-select')/*.siblings('.product-select').removeClass('product-select')*/;

                // 点击的是父分类，筛选出子分类
                if (data_type) {
                    W('.product-list .sub-list').show();

                    W('.product-list .sub-list .product-item').hide();
                    W('.product-list .sub-list .product-item[data-for="'+data_type+'"]').show();

                    return ;
                }

                if (wMe.ancestorNode('.top-list').length) {
                    W('.product-list .sub-list').hide();
                }

                // 选中一个服务大类后，先设定该服务的默认价格
                setCurProductInfo({
                    'price': price,
                    'original_price': oprice,
                    'id': ''
                });
                // 设置商品基本信息
                setProductInfo();
                // 设置商品价格相关
                setProductPirce();

                // 设置服务方式状态
                setServiceTypeStatus();

                W('#currFault').html( prd );       // 设置服务名称
                W('#extInfo').html( extInfo||'' ); // 设置服务扩展描述
                W('.product-list').hide();         // 隐藏服务列表
                W('.curr-prd-box').show();

                if (window.__ShangmenDateTime && window.__ShangmenDateTime.resetRemote) {
                    window.__ShangmenDateTime.resetRemote (tcb.setUrl ('/shangmen/doGetValidDate', {
                        type       : '1',
                        valid      : '7',
                        fault_type : window.__ServiceId,
                        city_name  : W ('#currCity').html ().trim ()
                    }))
                }
                if (window.__DaodianDateTime && window.__DaodianDateTime.resetRemote) {
                    window.__DaodianDateTime.resetRemote (tcb.setUrl ('/shangmen/doGetValidDate', {
                        type       : '3',
                        valid      : '7',
                        fault_type : window.__ServiceId,
                        city_name  : W ('#currCity').html ().trim ()
                    }))
                }

                // 获取服务内容大类数据
                getServiceData(service_id, function(ServiceDataItem){
                    // 输出属性选择html
                    renderProductAttrHtml(service_id);

                    // 显示输入优惠码
                    W('#promoContainer').css({
                        'visibility': 'hidden'
                    });

                    var wSelectedExtendinfo = W('#ServiceExtendInfo'),
                        wSelect = wSelectedExtendinfo.query('select');
                    //如果选项1只有一个选项，则直接选中（触发select的change事件）
                    wSelect.forEach(function(el){
                        // 只有一个选项
                        if (el.options.length==2) {
                            el.options.item(1).selected=true;

                            // 为了避免在ie7/8下qwrap的fire change不能正确执行，试用jquery来写change事件，并且使用trigger触发
                            //W(el).fire('change');
                            $(el).trigger('change');
                        }
                    });
                    // 只有一个select，并且select只有一个选项（默认选项除外），隐藏选项框
                    if (wSelect.length==1 && wSelect[0].options.length == 2) {
                        wSelectedExtendinfo.query('.curr-prd-box-extendinfo').hide();
                    }
                });
            }

        });

    }());

    // 价格的计算
    (function(){

    }());

    // 其他
    (function(){
        var _G_PANEL;
        tcb.bindEvent(document.body, {
            // 自动填充其他服务方式下的手机号 和 验证码
            '.inpt-secode-mobile, .inpt-secode, .ipt-pic-secode': {
                blur: function(){
                    var wMe = W(this),
                        val = wMe.val().trim();

                    if (wMe.hasClass('inpt-secode-mobile')) {
                        // 手机号
                        if (tcb.validMobile(val)){
                            W('.inpt-secode-mobile').val(val);
                        }
                    }else if(wMe.hasClass('ipt-pic-secode')){
                        // 图片验证码
                        if (val){
                            W('.ipt-pic-secode').val(val);
                        }
                    } else {
                        // 验证码
                        if (val){
                            W('.inpt-secode').val(val);
                        }
                    }
                }
            },
            // 获取验证码短信
            '.btn-get-secode': function(e){
                e.preventDefault();

                var $me = W(this);
                if ($me.hasClass('btn-get-secode-disabled')){
                    return ;
                }

                var $mobile = $me.siblings('.inpt-secode-mobile'),
                    mobile = $mobile.val().trim();

                var $secode = W('.ipt-pic-secode'),
                    secode = $secode.val().trim();

                if (!tcb.validMobile(mobile)) {
                    $mobile.shine4Error().focus();
                    return ;
                }

                if (!secode) {
                    $secode.shine4Error().focus();
                    return ;
                }

                var request_url = '/shangmen/doSendSmscode',
                    params = {
                        mobile: mobile,
                        secode: secode
                    };
                QW.Ajax.post(request_url, params, function(res){
                    res = JSON.parse(res);
                    if (res['errno'] == '205') {
                        alert(res['errmsg']);
                        $(".secode_img").attr('src', '/secode/?rands=' + Math.random())
                    } else if (res['errno']) {
                        alert(res['errmsg']);
                    } else {
                        // 当前页面[所有]发送手机验证码的按钮都禁止点击，加入倒计时
                        W('.btn-get-secode').addClass('btn-get-secode-disabled').html('60秒后再次发送');
                        tcb.distimeAnim(60, function(time){
                            if(time<=0){
                                W('.btn-get-secode').removeClass('btn-get-secode-disabled').html('获取验证码');
                            }else{
                                W('.btn-get-secode').html( time + '秒后再次发送');
                            }
                        });

                    }
                });
            },
            // 点击选择额外服务
            '.extend-service-label': function(e){
                e.preventDefault();

                var wMe = W(this),
                    wServ = wMe.query('input'),
                    serv_val = wServ.val();

                if(wMe.hasClass('extend-service-label-checked')){
                    wMe.removeClass('extend-service-label-checked');
                    wServ.attr('checked', false);

                    // 重新设置总价
                    setProductPirce();

                } else {
                    _G_PANEL = tcb.panel('', W('#ZiYingExtendServiceConfirmPanelTpl').html().tmpl()({
                        'service_cnt': '<img src="'+window.__ExtendService[serv_val]['server_img_pc']+'" alt=""/>',
                        'service_id': serv_val
                    }), {className:'extend-service-confirm-panel-wrap'});
                }

                try{
                    var params = {
                        cId : wMe.text()
                    };

                    //tcbMonitor.__log(params); //发送点击统计
                }catch(ex){}

            },
            // 确认选择服务
            '.extend-service-confirm-panel .btn-confirm': function(e){
                e.preventDefault();

                var wMe = W(this),
                    extend_service_id = wMe.attr('data-serviceid');

                W('.extend-service-label').forEach(function(el){
                    var wLabel = W(el),
                        wInput = wLabel.query('input');
                    if (wInput.val()==extend_service_id) {
                        wLabel.addClass('extend-service-label-checked');
                        wInput.attr('checked', true);
                    }
                });
                // 重新设置总价
                setProductPirce();

                // 选中后隐藏面板
                if(_G_PANEL && _G_PANEL.hide){
                    _G_PANEL.hide();
                }
            },
            // 取消不选择服务
            '.extend-service-confirm-panel .btn-cancel': function(e){
                e.preventDefault();

                if(_G_PANEL && _G_PANEL.hide){
                    _G_PANEL.hide();
                }
            }

        });
    }());

    function bindEvent(){
        var _quesPop;

        // 首页上门
        tcb.bindEvent('.page-shangmen', {
            // 上门首页-常见问题
            '.right-question' : function(e){
                e.preventDefault();

                _quesPop = tcb.panel('', W('#questionContent').html(), {
                    "width":670,
                    "height":580,
                    "withShadow": true,
                    "className" : "panel panel-tom01 border8-panel pngfix q-pop-panel"
                });
            },
            '.q-pop-panel' : function(e){
                _quesPop && _quesPop.hide();
            },
            '.mask' : function(e){
                _quesPop && _quesPop.hide();
            },
            // 上门首页-用户评价左右翻页
            '.cmt-p-prev' : function(e){
                W('.u-cmt-box').animate({'scrollLeft' : W('.u-cmt-box')[0].scrollLeft - 0 - 226}, 300);
            },
            '.cmt-p-next' : function(e){
                W('.u-cmt-box').animate({'scrollLeft' : W('.u-cmt-box')[0].scrollLeft - 0 + 226}, 300);
            },

            // 右边浮层，给客服小妹子发信息
            '.kf-xiaomeizi': function(e){
                e.preventDefault();

                _quesPop = tcb.panel('', '<div class="question-pop"><p style="padding: 10px">在线客服正忙，<br/>如需咨询请您致电 <em>4000-399-360</em> <br>（工作时间9:00-19:00）</p></div>', {
                    //"width":350,
                    //"height":80,
                    "withShadow": true,
                    "className" : "panel panel-tom01 border8-panel pngfix q-pop-panel"
                });
            }

        });

        // 选择品牌、型号、服务名称等
        // 为了避免在ie7/8下qwrap的fire change不能正确执行，试用jquery来写change事件，并且使用trigger触发
        $('#ServiceExtendInfo').on('change', 'select', function(e){
            var wMe = W(this),
                wExtendinfo = wMe.ancestorNode('.curr-prd-box-extendinfo'),
                name = wMe.attr('name'),
                service_id = wExtendinfo.attr('data-for');

            var last_flag = true;
            if(wMe.nextSibling('select').length){
                last_flag = false;
            }
            var pos = 0;
            if(wMe.previousSiblings('select').length){
                pos += wMe.previousSiblings('select').length;
            }

            // 获取服务内容大类数据
            getServiceData(service_id, function(ServiceDataItem){

                var attr_arr = [];
                wExtendinfo.query('select').map(function(el){
                    attr_arr.push(W(el).val());
                });
                var SelectedService = ServiceDataItem['service_list'][attr_arr.join('|')];
                // 设置当前被选中产品的信息
                setCurProductInfo(SelectedService);

                // 更换最后一组属性，直接更新对应的价格
                if(last_flag){

                    if(SelectedService){
                        // 设置具体服务商品属性
                        setProductInfo();

                        // 设置服务方式状态
                        setServiceTypeStatus(SelectedService['id']);

                        // 设置商品价格
                        setProductPirce();

                        // 显示输入优惠码
                        W('#promoContainer').css({
                            'visibility': 'visible'
                        });
                    }
                }
                // 切换属性，下级属性联动切换
                else {
                    var SelectList = ServiceDataItem['select_list'],
                        SelectNext = SelectList[pos+1],
                        SelectNextList = SelectNext['list'];

                    var str = '<option value="">'+SelectNext['option']+'</option>';

                    // 判断是否为数组
                    SelectNextList.map(function (v) {
                        if(wMe.val()==v['pid']){
                            str += '<option value="'+v['id']+'">'+v['name']+'</option>';
                        }
                    });
                    wMe.nextSibling('select').html(str);

                    // 设置服务方式状态
                    setServiceTypeStatus();
                }

            });
        });



        // 自营上门服务
        tcb.bindEvent('.page-shangmen-order', {
            // 触发优惠码输入框
            '.use-promo' : function(e){
                e.preventDefault();

                W(this).hide()
                    .siblings('.use-promo-txt').hide()
                    .siblings('.promo-box').show();
            },
            // 验证优惠码有效性
            '#promoCode' : {
                'change' : function(e){

                    // 验证优惠码，刷新商品价格
                    setProductPirce();
                }
            },

            // 选择服务方式
            '[name="service_type"]': function(e){
                var ckVal = W(".service-type:checked").val();

                // 设置商品基本信息
                setProductInfo();

                // 激活目标服务方式
                activeTargetServiceType(ckVal);

                // 设置商品价格
                setProductPirce();
            },

            //onebox落地页-点击评价
            '.zy-ld-item' : function(e){
                var isrc= W(this).attr('src');
                var nsrc = isrc.replace(/cmt(\d+)\.jpg/ig, 'cmt$1_b.jpg');

                tcb.panel('评论详情', '<img src="'+nsrc+'" alt="" width="320" />', {
                    width:320,
                    height:598
                })
            },

            // onebox数据恢复-额外补差价
            '#showSJExtPrice': function(e){
                e.preventDefault();

                tcb.panel('', W('#ZiyingSJExtPriceTpl').html().trim().tmpl()(), {
                    //'width': 889,
                    //'height' : 426
                });
            },
            // onebox，立即预约
            '.sm-sub-pre': function(e){
                e.preventDefault();

                var mp = W(this).attr('data-mp');
                if( mp == 1){
                    var url_query = tcb.queryUrl(window.location.search);
                    url_query['showdetail'] = '';
                    window.location.href = tcb.setUrl(window.location.pathname, url_query);
                }else{
                    W('.section-pre').slideUp(500);
                    W('.section-o-1').show();
                }

            },
            // 显示iphone手机内存升级协议
            '.js-show-ncsj-protocol': function(e){
                e.preventDefault();

                var html_str = W('#ZiyingNeicunshengjiProtocolTpl').html().trim().tmpl()();

                // ip手机内存升级协议
                tcb.panel('', html_str, {
                    "width":800,
                    "height":600,
                    "withShadow": true,
                    "className" : "panel panel-tom01 border8-panel pngfix ncsj-protocol-wrap-dialog"
                });
            },
            '.js-show-fwsm-protocol': function(e){
                e.preventDefault();

                var html_str = W('#ZiYingFuWuShengMingTpl').html().trim().tmpl()();

                // ip手机内存升级协议
                tcb.panel('', html_str, {
                    "width":800,
                    "height":600,
                    "withShadow": true,
                    "className" : "panel panel-tom01 border8-panel pngfix ncsj-protocol-wrap-dialog"
                });
            }
        });
    }

    // 输出当前服务内容大类的可选选项构成的html
    function renderProductAttrHtml(service_id){
        var ServiceData = window._ServiceData || {};

        var ServiceDataItem = ServiceData[service_id];

        var html_str = '';
        if (ServiceDataItem) {
            // 刷新可选择服务属性组合的html
            var SelectList = ServiceDataItem['select_list'];
            // 获取自营服务具体属性的选择
            html_str = W('#ZiyingServiceExtendInfoTpl').html().trim().tmpl()({
                'select_list': SelectList,
                'fault_id': service_id // 此处的fault_id是指大类的fault_id
            });
        }

        var wSelectedExtendinfo = W('#ServiceExtendInfo');
        wSelectedExtendinfo.html(html_str);
    }

    // 设置服务方式的状态（可用/不可用）
    function setServiceTypeStatus(service_product_id){
        var service_id = W('#ServiceExtendInfo .curr-prd-box-extendinfo').attr('data-for');
        var shangmen_info = !service_product_id ? '' : getShangmenData(service_id, service_product_id),
            daodian_info  = !service_product_id ? '' : getDaodianData(service_id, service_product_id),
            youji_info    = !service_product_id ? '' : getYoujiData(service_id);

        // 判断上门服务是否可用
        var wShangmenRadio = W('#service_type_1');
        if (!shangmen_info || checkServiceTypeClosed('shangmen')) {
            wShangmenRadio.attr("disabled",true);
            wShangmenRadio.attr("checked",false);
            wShangmenRadio.ancestorNode('label').addClass('disabled');
        } else {
            wShangmenRadio.setAttr("disabled", false);
            wShangmenRadio.ancestorNode('label').removeClass('disabled');
            // 等于-1表示支持上门，但是没有文字描述支持区域
            if (shangmen_info !== -1) {
                W('#smSptArea').html('（'+shangmen_info+'）');
            }
        }

        //判断到店服务是否可用
        var wDaodianRadio = W('#service_type_3');
        if (!daodian_info || checkServiceTypeClosed('daodian')) {
            wDaodianRadio.attr("disabled",true);
            wDaodianRadio.attr("checked",false);
            wDaodianRadio.ancestorNode('label').addClass('disabled');
        } else {
            wDaodianRadio.attr("disabled", false);
            wDaodianRadio.ancestorNode('label').removeClass('disabled');
            setDaodianSelectList(daodian_info);
        }

        //判断邮寄服务是否可用
        var wYoujiRadio = W('#service_type_2');
        if (!youji_info || checkServiceTypeClosed('youji')) {
            wYoujiRadio.attr("disabled",true);
            wYoujiRadio.attr("checked",false);
            wYoujiRadio.ancestorNode('label').addClass('disabled');
        } else {
            wYoujiRadio.attr("disabled", false);
            wYoujiRadio.ancestorNode('label').removeClass('disabled');
        }
        //激活第一个可用服务的输入表单
        activeTargetServiceType();
    }
    // 验证优惠码
    function validPromoCode(price, callback){
        price = price ? parseFloat(price) : 0;
        price = price ? price : 0;

        var wPromoCode = W('[name="youhui_code"]'),
            promo_code = wPromoCode.val().trim(),
            youhuiPrice = 0;

        var wPromoYZ = W('#promoYZ');
        // 没有优惠码
        if(!promo_code){
            wPromoYZ.html(wPromoYZ.attr('data-placeholder')).removeClass('promo-succ').removeClass('promo-fail');

            typeof callback==='function' && callback(price,youhuiPrice);
            return;
        }
        // 优惠码输入框中有优惠码，先验证优惠码
        QW.Ajax.post('/aj/doGetYouhuiAmount', {
            'youhui_code' : promo_code,
            'service_type': 1,
            'price': price,
            'product_id': W('[name="fault_id"]').val(),
            'fuwu_type': W('[name="service_type"]').filter(function(el){return W(el).attr('checked');}).val() /*服务方式：1：上门，2：邮寄，3：到店*/
        }, function(rs){
            try{
                rs = QW.JSON.parse(rs);

                if( rs.errno ){
                    W('#promoYZ').html('抱歉，优惠码验证失败。').removeClass('promo-succ').addClass('promo-fail');
                }
                else{

                    youhuiPrice = rs.result['promo_amount'] || 0

                    var
                        promo_per  = rs.result['promo_per'] || 0;
                    if (promo_per) {
                        youhuiPrice = {
                            'promo_per': promo_per
                        };
                    }

                    // 为对象表示为折扣优惠，否则是优惠金额
                    if (typeof youhuiPrice == 'object') {
                        promo_per = youhuiPrice['promo_per'];

                        youhuiPrice = tcb.formatMoney(price*(100-promo_per)/100, 0, 1);
                    } else {
                        youhuiPrice = tcb.formatMoney(youhuiPrice, 0, 1);
                    }

                    var promoYZ_str = '优惠码有效，已优惠'+youhuiPrice+'元~';
                    if (promo_per) {
                        promoYZ_str = '优惠码有效，服务可享受'+promo_per+'折优惠<span class="red">（不包含加享服务）</span>';
                    }
                    price = price - youhuiPrice;
                    price = price<0 ? 0 : price;
                    W('#promoYZ').html(promoYZ_str).removeClass('promo-fail').addClass('promo-succ');
                }

                typeof callback==='function' && callback(price,youhuiPrice);

            } catch (ex){
                typeof callback==='function' && callback(price,youhuiPrice);
            }
        });
    }

    // 设置商品基本信息，服务支持等 //pinfo格式{'id':'', 'price':'', 'original_price':'', 'description':''}
    function setProductInfo(pinfo){
        pinfo = pinfo || getCurProductInfo();

        if (!pinfo) {
            return ;
        }
        // 手机存储空间升级
        if (pinfo['fault_type'] && pinfo['fault_type']=='43') {
            W('.ncsj-protocol-line').show();

            W('#formOrder [type="submit"]').val('下单支付').attr('data-type', '2');
        } else {
            W('.ncsj-protocol-line').hide();
            W('#formOrder [type="submit"]').val('立即预约').attr('data-type', '1');
        }

        W('[name="fault_id"]').val(pinfo['id']); // 服务商品id

        var fwbz_str = pinfo['description'] ? '（'+pinfo['description']+'）' : '';
        W('.fw-bz').html(fwbz_str);// 价格后边的服务保障

        // 商品的附加服务
        setProductExtendService(pinfo);

        // 初始设置属性时，将预约输表单隐藏
        W('.yyinfo-box').hide();
    }
    /**
     * 设置商品的附加服务
     * @param pinfo
     */
    function setProductExtendService(pinfo){
        var extend_service = pinfo['value_added_server']||[];
        var html_str = '';
        if (extend_service && extend_service.length){
            extend_service.forEach(function(item){
                var cur_extend_service = window.__ExtendService[item];
                if (!cur_extend_service) {
                    return ;
                }

                html_str += '<div class="extend-service-label" data-plusprice="'+cur_extend_service['server_price']+'" data-id="'+cur_extend_service['id']+'">'+
                    '<span class="checkbox"><input type="checkbox" name="value_added_selected[]" value="'+cur_extend_service['id']+'"/></span>'+
                    '<span class="txt">+'+cur_extend_service['server_name']+'</span>'+
                    '</div>';
            });
        }
        W('.product-extend-service').html(html_str);
    }
    // 设置商品价格
    function setProductPirce(pInfo){
        // 获取当前当前服务商品信息
        pInfo = pInfo || getCurProductInfo();
        if (!pInfo) {
            return ;
        }

        var price;
        var checked_type = W('.service-type:checked').val();
        // 对于不同的服务方式，设置相应的服务价格
        switch (checked_type) {
            case '1':
                price = pInfo['price'];
                break;
            case '2':
                price = pInfo['youji_price'];
                break;
            case '3':
                price = pInfo['daodian_price'];
                break;
        }
        price = parseFloat( price || pInfo['price'] );

        W('#showOrgPirce').html(pInfo['original_price']); // 显示原始价格
        W('[name="total_amount"]').val(pInfo['price']);   // 实际基础价

        // 校验优惠码，更新最终价格
        validPromoCode(price, function (final_product_price,youhuiPrice) {
            W('#showPrice').html(final_product_price); // 商品最终价格（原价-优惠价）

            var final_total_price = final_product_price; // 最终实际价格

            // 计算附加服务价格
            W('.extend-service-label').forEach(function(el){
                var wLabel = W(el);
                // 被选中的附加服务
                if (wLabel.hasClass('extend-service-label-checked')) {
                    var plus_price = parseFloat(wLabel.attr('data-plusprice'));

                    final_total_price += plus_price;
                }
            });

            W('.total-price').html('￥'+final_total_price);
            W('[name="real_amount"]').val(final_total_price); // 最终价格

            setProductPriceList(price,youhuiPrice);// 设置价格列表
        });
    }

    // 设置价格列表
    function setProductPriceList(origin_price, promo_price_sum){
        promo_price_sum = promo_price_sum ? promo_price_sum : 0

        var
            extend_service_price_sum = 0,
            color = promo_price_sum>0 ? '#fe4b00' : '#333'

        // 价格列表-商品价格
        W('.product-price').html('￥'+origin_price.toFixed(2))

        // 价格列表-优惠折扣
        W('.discount-price').html('-￥'+promo_price_sum.toFixed(2))

        // 价格列表-附加服务
        W('.product-extend-service .extend-service-label-checked').forEach (function (el) {
            var
                plus_price = parseFloat (W (el).attr ('data-plusprice'))

            extend_service_price_sum += plus_price - 0
        })
        W('.extend-service-price').html('￥'+extend_service_price_sum.toFixed(2))

    }

    // 获取选择服务内容的相关详情
    function getServiceData(service_id, callback){
        var ServiceData = window._ServiceData || {};

        var ServiceDataItem = ServiceData[service_id];
        if (ServiceDataItem) {
            callback(ServiceDataItem);
        } else {
            QW.Ajax.get('/shangmen/aj_get_zydata', {
                'fault_id': service_id
            }, function(res){
                res = QW.JSON.parse(res);

                if (!res['errno']) {
                    var InfoData = res['result'];
                    ServiceDataItem = {
                        'youji_city': [],// @我只是提前占位，现在没有任何作用
                        'shangmen_city': InfoData['shangmen_data'],
                        'daodian_city': InfoData['daodian_data'],
                        'select_list': InfoData['zy_data']['select_list'],
                        'service_list': InfoData['zy_data']['info_kv_list'],
                        //'express_shanghai': InfoData['show_shanghai_express_flags']
                        'express_not_support': {
                            '2':InfoData['show_beijing_express_flags']||{},
                            '3':InfoData['show_chengdu_express_flags']||{},
                            '4':InfoData['show_shanghai_express_flags']||{},
                            '5':InfoData['show_guangzhou_express_flags']||{}
                        }
                    };

                    window._ServiceData[service_id] = ServiceDataItem;
                    callback(ServiceDataItem);
                } else {
                    // @do nothing
                }
            });
        }
    }

    // 获取上门相关数据
    // service_id：服务大类id；
    // service_product_id：服务小类id；
    // 不支持上门返回false
    // 支持上门，但是没有文案，返回-1
    // 支持上门，并且有具体区域，返回区域文字
    function getShangmenData(service_id, service_product_id){
        var ret = false;

        var ServiceData = window._ServiceData || {};

        var CurServiceData = ServiceData[service_id];
        if (CurServiceData) {
            var city = W('[name="sm_city"]').val(),
                CurCityData = CurServiceData['shangmen_city'][city];

            // 此城市支持上门
            if (CurCityData) {
                // 此具体服务不支持上门
                if (typeof CurCityData[service_product_id]==='undefined'){
                    ret = false;
                } else {
                    ret = CurCityData[service_product_id];
                    ret = ret ? ret : -1;
                }
            }
        }

        return ret;
    }
    // 获取到店相关数据
    // service_id：服务大类id；
    // service_product_id：服务小类id；
    function getDaodianData(service_id, service_product_id){
        var ret = false;

        var ServiceData = window._ServiceData || {};

        var CurServiceData = ServiceData[service_id];
        if (CurServiceData) {
            var city = W('[name="sm_city"]').val();

            // 支持到店的城市
            if (CurServiceData['daodian_city']
                && CurServiceData['daodian_city']['city']
                && CurServiceData['daodian_city']['city'][city]){

                var CurCityData = CurServiceData['daodian_city']['city'][city];
                if (CurCityData[service_product_id] && CurCityData[service_product_id].length) {
                    var StoreIdArr = CurCityData[service_product_id],// 当前服务支持的到店地址id
                        StoreList  = CurServiceData['daodian_city']['store']; // 到店地址列表

                    var CurStoreList = [];
                    for(var i=0; i<StoreIdArr.length; i++){
                        if (StoreList[StoreIdArr[i]]){
                            CurStoreList.push(StoreList[StoreIdArr[i]]);
                        }
                    }

                    if (CurStoreList.length) {
                        ret = CurStoreList;
                    }
                }
            }
        }

        return ret;
    }
    // 获取邮寄相关数据
    // service_id：服务大类id；
    function getYoujiData(service_id){
        var ret = false;

        var ServiceData = window._ServiceData || {};

        var CurServiceData = ServiceData[service_id];
        if (CurServiceData) {
            var wSelect = W('#ServiceExtendInfo select');
            var attr_arr = [];
            wSelect.map(function(el){
                attr_arr.push(W(el).val());
            });

            var SelectedService = CurServiceData['service_list'][attr_arr.join('|')];
            if (SelectedService) {
                ret = true;
            }
        }

        return ret;
    }

    // 设置到店的地址列表
    function setDaodianSelectList(daodian_info){
        var wDaodianAddr = W('.yyinfo-box .daodian-addr');

        var html_str = '';
        if (daodian_info && daodian_info.length) {
            for(var i=0; i<daodian_info.length;i++) {
                html_str += '<label><input type="radio" name="dd_addr" value="'
                +daodian_info[i]['store_id']+'"/>'
                +daodian_info[i]['store_area']+' '+daodian_info[i]['store_address']+' '+daodian_info[i]['store_name']
                +'，联系人：'+daodian_info[i]['manager_name']+' '+daodian_info[i]['store_tel']+'</label>';
            }
        }
        wDaodianAddr.html(html_str);

        // 到店地址只有一个，默认选中
        if (daodian_info.length===1) {
            wDaodianAddr.query('[name="dd_addr"]').first().attr('checked', 'checked');
        }
    }
    // 设置当前被选中的具体服务产品信息
    function setCurProductInfo(info){
        if (info) {
            window.CurProductInfoData = info;
        }

        return window.CurProductInfoData;
    }
    // 获取当前被选中具体服务产品信息
    function getCurProductInfo(){

        return window.CurProductInfoData;
    }
    // 激活指定的服务方式（前提为此服务方式当前可用）
    function activeTargetServiceType(type) {
        var wServiceTypeRadio = W('[name="service_type"]'),
            type_arr = wServiceTypeRadio.map(function(el,i){
                return W(el).val();
            }),
            flag_fired = false

        // type在当前服务方式内
        if (type_arr.contains(type)) {
            W('.yyinfo-box').hide();
            wServiceTypeRadio.forEach(function (el) {
                var wEl = W(el),
                    val = wEl.val();
                if (type == val && !wEl.attr('disabled')){
                    flag_fired = true;
                    wEl.attr('checked', 'checked');
                    W('.yyinfo-box[data-for="' + val + '"]').show();
                    // 邮寄
                    if(val == '2'){
                        W('[name="bank_code"]').val('online');

                        resetServiceStation(true)

                    }
                    // 到店、上门
                    else {
                        W('[name="bank_code"]').val('offline')

                        resetServiceStation()

                    }
                } else {
                    wEl.removeAttr('checked');
                }
            })
        }
        if (!flag_fired) {
            W('.yyinfo-box').hide();
            wServiceTypeRadio.forEach(function (el) {
                var wEl = W(el),
                    val = wEl.val();
                // 触发第一个可用radio的click事件
                if (!flag_fired && !wEl.attr('disabled')){
                    flag_fired = true;
                    wEl.attr('checked', 'checked');
                    W('.yyinfo-box').hide();
                    W('.yyinfo-box[data-for="' + val + '"]').show();
                    // 邮寄
                    if(val == '2'){
                        W('[name="bank_code"]').val('online');

                        resetServiceStation(true)

                    }
                    // 到店、上门
                    else {
                        W('[name="bank_code"]').val('offline')
                        resetServiceStation()

                    }
                }
                else {
                    wEl.removeAttr('checked');
                }
            })

            if(!flag_fired){
                //清空邮寄地地址
                resetServiceStation()
            }
        }
    }

    // 重置服务站信息
    function resetServiceStation (flag_show) {
        flag_show = flag_show || false

        var
            service_id = W ('#ServiceExtendInfo .curr-prd-box-extendinfo').attr ('data-for'),
            fault_id = W ('[name="fault_id"]').val (),
            ServiceData = window._ServiceData || {}

        ServiceData = ServiceData[ service_id ]

        var
            express_not_support = ServiceData
                ? ServiceData[ 'express_not_support' ]
                : {}

        var
            $ServiceStation = W (".choose-stations-service"),
            $ServiceStationDetail = W (".show-stations-address")

        tcb.each(express_not_support, function(k, item){
            // 维修服务站点
            var
                $ServiceStationItem = $ServiceStation.query ('[data-id="'+k+'"]')

            if (typeof item[fault_id]!== 'undefined'&& !item[fault_id]){
                // item[fault_id]已经有数据,并且为false表示不支持,否则表示无条件支持~~[即,显示表示不支持,才不支持,否则就认定为支持]
                // 此项服务,在此维修站点不支持邮寄维修

                $ServiceStationItem.hide ()
            } else {
                $ServiceStationItem.show ()
            }
        })

        //清空邮寄地地址
        $ServiceStation.hide ()
        $ServiceStation.query (".active").removeClass ("active")
        $ServiceStationDetail.hide ()
        $ServiceStationDetail.query (".stations-to").html ("")
        W ('[name="express_station_id"]').val ("");

        if (flag_show) {
            // 是否显示

            $ServiceStation.show ()
        }
    }

    // 切换选择城市
    function selectCity(selector){

        if(!W(selector).length) return false;

        var cityPanel = new CityPanel(selector);

        cityPanel.on('close', function(e) {});

        cityPanel.on('selectCity', function(e) {


            var city = e.city.trim();

            var city_name = e.name.trim();


            W('#currCity').html( city_name ).attr('data-city', city);
            W('[name="sm_city"]').val(city);


            QW.loadJsonp('/aj/getcookiecity?citycode='+city+'&cityname='+city_name, function(data){
                //console.log(data);
            });

            // 切换城市后刷新商品信息状态
            setProductInfo();

            var cur_service_product = getCurProductInfo(),
                service_product_id = cur_service_product ? cur_service_product['id'] : '';
            // 设置服务方式状态
            setServiceTypeStatus(service_product_id);

            // 设置商品价格
            setProductPirce();

            if (window.__ShangmenDateTime && window.__ShangmenDateTime.resetRemote) {
                window.__ShangmenDateTime.resetRemote (tcb.setUrl ('/shangmen/doGetValidDate', {
                    type       : '1',
                    valid      : '7',
                    fault_type : window.__ServiceId,
                    city_name  : city_name
                }))
            }
            if (window.__DaodianDateTime && window.__DaodianDateTime.resetRemote) {
                window.__DaodianDateTime.resetRemote (tcb.setUrl ('/shangmen/doGetValidDate', {
                    type       : '3',
                    valid      : '7',
                    fault_type : window.__ServiceId,
                    city_name  : city_name
                }))
            }
        });
    }

    // 上门信息输入框初始化（设置兼容性placeholder、地址联想和时间选择组件）
    function initShangmenInfoInput(){
        // 上门地址
        if( W('.yyinfo-box-sm [name="sm_addr"]').length ){
            new PlaceHolder('.yyinfo-box-sm [name="sm_addr"]');

            new AddrSuggest('.yyinfo-box-sm [name="sm_addr"]', {
                'showNum' : 8,
                'requireCity' : function(){return W('#currCity').html().trim()||'北京';}
            });
        }
        // 上门时间
        if( W('.yyinfo-box-sm [name="sm_time"]').length ){
            new PlaceHolder('.yyinfo-box-sm [name="sm_time"]')

            window.__ShangmenDateTime = new DateTime('.yyinfo-box-sm [name="sm_time"]', {
                remote: tcb.setUrl ('/shangmen/doGetValidDate', {
                    type       : '1',
                    valid      : '7',
                    fault_type : tcb.queryUrl (window.location.search, 'fault_id'),
                    city_name : W('#currCity').html().trim()
                }),
                onSelect : function(e){ }
            });
        }
        // 上门电话
        if( W('.yyinfo-box-sm [name="buyer_mobile"]').length ){
            new PlaceHolder('.yyinfo-box-sm [name="buyer_mobile"]');
        }
        // 短信验证码
        if( W('.yyinfo-box-sm [name="sms_code"]').length ){
            new PlaceHolder('.yyinfo-box-sm [name="sms_code"]');
        }

    }
    // 到店信息输入框初始化（设置兼容性placeholder、地址联想和时间选择组件）
    function initDaodianInfoInput(){
        // 到店时间
        if( W('.yyinfo-box-dd [name="sm_time"]').length ){
            new PlaceHolder('.yyinfo-box-dd [name="sm_time"]')

            window.__DaodianDateTime = new DateTime('.yyinfo-box-dd [name="sm_time"]', {
                remote: tcb.setUrl ('/shangmen/doGetValidDate', {
                    type       : '3',
                    valid      : '7',
                    fault_type : tcb.queryUrl (window.location.search, 'fault_id'),
                    city_name : W('#currCity').html().trim()
                }),
                onSelect : function(e){ }
            })
        }
        // 到店手机
        if( W('.yyinfo-box-dd [name="buyer_mobile"]').length ){
            new PlaceHolder('.yyinfo-box-dd [name="buyer_mobile"]');
        }
        // 短信验证码
        if( W('.yyinfo-box-dd [name="sms_code"]').length ){
            new PlaceHolder('.yyinfo-box-dd [name="sms_code"]');
        }

    }
    // 邮寄信息输入框初始化（设置兼容性placeholder、地址联想和时间选择组件）
    function initYoujiInfoInput(){
        //邮寄地址
        if( W('.yyinfo-box-yj [name="sm_addr"]').length ){
            new PlaceHolder('.yyinfo-box-yj [name="sm_addr"]');

            new AddrSuggest('.yyinfo-box-yj [name="sm_addr"]', {
                'showNum' : 8,
                'requireCity' : function(){return W('#currCity').html().trim()||'北京';}
            });

            W('.yyinfo-box-yj [name="sm_addr"]').on('change', function(e){
                var $me = W(this),
                    val = $me.val();

                var
                    $tip = W('.yyinfo-box-yj .sm-addr-tip')
                if ($tip&&$tip.length){
                    if (val) {
                        $tip.show();
                    } else {
                        $tip.hide();
                    }
                }

            });
        }
        // 邮寄用户
        if( W('.yyinfo-box-yj [name="sm_receiver"]').length ){
            new PlaceHolder('.yyinfo-box-yj [name="sm_receiver"]');
        }
        // 邮寄手机
        if( W('.yyinfo-box-yj [name="buyer_mobile"]').length ){
            new PlaceHolder('.yyinfo-box-yj [name="buyer_mobile"]');
        }
        // 短信验证码
        if( W('.yyinfo-box-yj [name="sms_code"]').length ){
            new PlaceHolder('.yyinfo-box-yj [name="sms_code"]');
        }
    }

    /**
     * 检查 服务方式 是否关闭
     */
    function checkServiceTypeClosed(type){
        var CloseService = window.__CloseService || {};

        CloseService['shangmen'] = CloseService['shangmen'] || false;
        CloseService['youji']    = CloseService['youji'] || false;
        CloseService['daodian']  = CloseService['daodian'] || false;

        return CloseService[type];
    }

    function init(){

        bindEvent();

        // 解析当前url的query
        var url_query = window.location.href.queryUrl();

        if( W('.slide-box').length > 0 ){//页面1=========================
            SM.IndexPicSlider.start( url_query['stop']=='true' );

        }else if( W('#formOrder').length ){//页面2========================
            //var faultId = url_query['fault_id'];
            //var selFaulty = W('.product-list .product-item[data-id="'+faultId+'"]');
            //
            //try{
            //    if(selFaulty.length){
            //        // 检查是否有父分类
            //        var data_for = selFaulty.attr('data-for');
            //        if (data_for) {
            //            W('.product-list .product-item[data-type="'+data_for+'"]').fire('click');
            //        }
            //        selFaulty.fire('click');
            //    }else{
            //        W('.product-list .product-item').item(0).fire('click');
            //    }
            //}catch(ex){}

            initShangmenInfoInput();
            initDaodianInfoInput();
            initYoujiInfoInput();
        }

        // 选择城市
        if( W('.citypanel_trigger').length ){
            selectCity('.citypanel_trigger');
        }
    }

    init();

    function addSubCate(){

        // 获取手机回收自营数据：分热门问题、其余问题
        // '/shangmen/doGetMobileFaultList'
        QW.Ajax.get('/shangmen/aj_get_fault_group', function(res){
            res = JSON.parse(res);

            if (!res['errno']) {

                var result = res['result']

                var html_str = W('#JsOrderCate2Tpl').html().trim().tmpl()({
                    'list': result
                });

                W('.page-shangmen-order .cate-list-sub-inner').html(html_str);


                // 解析当前url的query
                var url_query = window.location.href.queryUrl();
                var faultId = url_query['fault_id'];
                var selFaulty = W('.product-list .product-item[data-id="'+tcb.html_encode(faultId)+'"]');

                try{
                    if(selFaulty.length){
                        // 检查是否有父分类
                        var data_for = selFaulty.attr('data-for');
                        if (data_for) {
                            W('.product-list .product-item[data-type="'+data_for+'"]').fire('click');
                        }
                        selFaulty.first().fire('click');
                    }else{
                        W('.product-list .product-item').item(0).fire('click');
                    }
                }catch(ex){}

            } else {
                console.log(res['errmsg']);
            }

        });

    }
    addSubCate();

});
