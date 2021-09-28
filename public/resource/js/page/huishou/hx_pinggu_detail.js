// 以旧换新
Dom.ready(function(){
    if (!window._CACHE['hx_flag']) {
        return ;
    }
    // 事件绑定
    tcb.bindEvent(document.body, {
        // 修改需要换新的机器
        '.js-change-newproduct': function(e) {
            e.preventDefault();

            var NewProductList = window.NewProductList;

            if ( !(NewProductList && NewProductList.length) ) {
                return ;
            }

            var product_list = [];

            NewProductList.forEach(function(item){
                product_list.push({
                    'pid': item['show_info']['product_id'],
                    'name': item['show_info']['title'],
                    'img': item['show_info']['img_url_pc'],
                    'price': item['price_diff']
                });
            });

            var html_str = W('#JsHuishouHuanxinNewproductListTpl').html().trim().tmpl()({
                'product_list': product_list
            });

            var config = {
                //width:710,
                //height:510,
                withMask: true,
                //dragable: true,
                className: 'dialog-wrap dialog-wrap-newproduct'// border8-panel pngfix
            };
            ObjPanel = tcb.panel('', html_str, config);
        },
        // 立即换新
        '.js-liji-huanxin': function(e){
            e.preventDefault();

            var $me = W(this);

            var pid = $me.attr('data-id'),
                url_hash = $me.attr('href'),
                product_title = $me.attr('data-title'),
                img_name = $me.attr('data-img');

            if (!pid) {
                return ;
            }
            var request_url = tcb.setUrl('/youpin/product', {
                'product_id': pid,
                'ajax': '1'
            });
            QW.Ajax.get(request_url, function(res){
                res = QW.JSON.parse(res);

                var selectedAttr = res['result']['product_attr'],
                    AttrGroup = [],
                    AttrList = [],
                    show_price, real_price;

                var product_attr_hash = res['result']['attr_combine'],
                    product_attr_price_hash = res['result']['attr_combine_price'];
                QW.ObjectH.map(product_attr_hash, function(v, k){
                    product_attr_hash[k] = {
                        'product_id': v.split('product_id=')[1],
                        'show_price': product_attr_price_hash[k]['show_price'],
                        'real_price': product_attr_price_hash[k]['real_price']
                    };

                    AttrGroup.push(k.split(','));
                });
                CurProductAttrHash = product_attr_hash;
                show_price = product_attr_price_hash[selectedAttr.join(',')]['show_price'];
                real_price = product_attr_price_hash[selectedAttr.join(',')]['real_price'];

                var product_attr_storage,product_attr_color,
                    product_attr_net, product_attr_channel;
                res['result']['model_attr'].forEach(function(v, k){
                    var AttrList_sub = [];
                    if(v['name'].indexOf('网络')>-1){
                        v['name'] = '网络';
                    }
                    switch (v['name']){
                        // 颜色
                        case '颜色':
                            product_attr_color = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            var color_hash = {
                                '灰色': ['https://p.ssl.qhimg.com/t01ac5eb2a592100755.jpg', '深空灰'],
                                '黑色': ['https://p.ssl.qhimg.com/t01a02895aa5f484340.jpg', '黑色'],
                                '金色': ['https://p.ssl.qhimg.com/t01e09d5b06bf3e5b23.jpg', '金色'],
                                '银色': ['https://p.ssl.qhimg.com/t01ffbf2f745362ed37.jpg', '银色'],
                                '白色': ['https://p.ssl.qhimg.com/t01f87f5a81cf2c7cb6.jpg', '白色'],
                                '蓝色': ['https://p.ssl.qhimg.com/t0117c6bb967cc3c870.png', '蓝色'],
                                '绿色': ['https://p.ssl.qhimg.com/t01902e76cea14ead02.png', '绿色']
                            };
                            QW.ObjectH.map(v['attr'], function(vv, kk){
                                var color_img  = 'https://p.ssl.qhimg.com/t01ac5eb2a592100755.jpg',
                                    color_name = vv;

                                var color = color_hash[vv];
                                if (color) {
                                    color_img  = color[0];
                                    color_name = color[1];
                                }

                                product_attr_color['attr'].push({
                                    'val':kk,
                                    'txt': color_name,
                                    'color_img': color_img
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                        // 容量
                        case '容量':
                            product_attr_storage = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            QW.ObjectH.map(v['attr'], function(vv, kk){
                                vv = $.trim(vv.split('G')[0]);
                                product_attr_storage['attr'].push({
                                    'val':kk,
                                    'txt': vv
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                        // 网络
                        case '网络':
                            product_attr_net = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            QW.ObjectH.map(v['attr'], function(vv, kk){
                                product_attr_net['attr'].push({
                                    'val':kk,
                                    'txt': vv
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                        // 渠道
                        case '渠道':
                            product_attr_channel = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            QW.ObjectH.map(v['attr'], function(vv, kk){
                                product_attr_channel['attr'].push({
                                    'val':kk,
                                    'txt': vv
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                    }

                    AttrList.push(AttrList_sub);
                });

                var img = img_name ? img_name : 'https://p.ssl.qhimg.com/t01e90b98b2cb5640c3.jpg';

                var param_data = {
                    'img': img,
                    'url_hash': url_hash,
                    'product_id': pid,
                    'show_price': show_price,
                    'real_price': real_price,
                    'product_title': product_title,
                    'product_attr_storage':product_attr_storage,
                    'product_attr_color':product_attr_color,
                    'product_attr_net':product_attr_net,
                    'product_attr_channel':product_attr_channel
                };

                var content_html = W('#JsHuishouHuanxinProductSelectTpl').html().trim().tmpl()(param_data);

                var config = {
                    //width:710,
                    //height:510,
                    withMask: true,
                    //dragable: true,
                    className: 'dialog-wrap'// border8-panel pngfix
                };
                ObjPanel2 = tcb.panel('', content_html, config);

                //tcb.showDialog(content_html);
                //showPanel(param_data);

                setProductAttrUi(selectedAttr, AttrGroup, AttrList);
            });
        },
        // 选择商品属性
        '.product-attr .item a': function(e){
            e.preventDefault();

            var $me = W(this),
                $cnt = $me.ancestorNode('.cnt');

            //if ($me.hasClass('disabled')) {
            //    return ;
            //}

            $cnt.query('.item a').removeClass('cur');
            $me.addClass('cur');

            // 设置属性组合商品id
            setProductId();
        },
        // 去回收页面评估旧机，换新机
        '.goto-huanxinji-btn': function(e){
            e.preventDefault();

            var $me = W(this),
                pid = $me.attr('data-pid');

            if (!pid){
                tcb.errorBlink(W('.product-attr .item a'));
                return;
            }

            var redirect_url = tcb.setUrl(window.location.href, {
                'newproductid': pid
            }).replace(/%2C/ig, ',');

            window.location.href = redirect_url;
        },
        // 关闭弹层
        '.dialog-close': function(e){
            e.preventDefault();

            var wMe = W(this),
                wWrap = wMe.ancestorNode('.dialog-wrap-newproduct');
            // 关闭新机列表
            if (wWrap.length) {
                if (ObjPanel && ObjPanel.hide) {
                    ObjPanel.hide();
                }
                if (ObjPanel2 && ObjPanel2.hide) {
                    ObjPanel2.hide();
                }
            }
            else {
                if (ObjPanel2 && ObjPanel2.hide) {
                    ObjPanel2.hide();
                }
                if (ObjPanel3 && ObjPanel3.hide) {
                    ObjPanel3.hide();
                }
            }
        },
        // 换新重新填写手机号
        '.huanxin-no-right-tip-wrap .btn-change-mobile': function(e){
            e.preventDefault();

            if (ObjPanel2 && ObjPanel2.hide) {
                ObjPanel2.hide();
            }
            if (ObjPanel3 && ObjPanel3.hide) {
                ObjPanel3.hide();
            }
        },
        // 激活换新订单提交表单
        '.btn-active-huanxin-form': function(e){
            e.preventDefault();

            window.location.hash = '#suborder';

            tcb.gotoTop.goPlace(W('#doc-topbar').getRect()['height'])

            window._CACHE['cityPanel'].options.onConfirm(
                window._CACHE['cityPanel'].getSelectedData(),
                window._CACHE['cityPanel']
            )

            W('.hx-type-wrap').slideDown(200, function(){
                try{
                    setTimeout(function(){
                        W(document).fire('myresize');
                    }, 0);
                }catch(ex){}
            });
            W('.hx-detail-wrap').addClass('block-freeze-up');
            W('.change-newproduct').hide();
            W('.confirm-btn-line').hide();

        },
        // 换新旧机列表的鼠标事件
        '.hx-detail-wrap .item': {
            'mouseenter': function (e) {
                var wMe = W(this);

                if (wMe.hasClass('item-first')) {
                    return ;
                }
                wMe.addClass('item-cur');
            },
            'mouseleave': function (e) {
                var wMe = W(this);

                wMe.removeClass('item-cur');
            }
        },
        // 删除旧机
        '.hx-detail-wrap .btn-delete-item': function(e){
            e.preventDefault();

            var wMe = W(this),
                assess_key = wMe.attr('assess_key'),
                wItem = wMe.ancestorNode('.item');

            QW.Ajax.post('/huishou/doDelCart', {"assess_key" : assess_key}, function(res){
                res = QW.JSON.parse(res);

                if (!res['errno']) {
                    var wSib = wItem.siblings('.item');
                    if (wSib.length > 1) {
                        //动态计算新机 、旧机差额
                        var res_obj = res['result'];

                        var final_price = res_obj['new_machine_price'], // 新机最终价格（为正表示用户还需要支付的金额，负表示用户还可以额外得到的金额）
                            butie_price_samsung = W('.samsung-butie-line').attr('data-butie-price') || 0; // 三星活动商品补贴价格

                        final_price = final_price - butie_price_samsung;
                        var final_price_abs = Math.abs(final_price);

                        var str = '除了全新'
                                + res_obj['model_name']
                                + '外您还能获得：<span class="final-price" data-price="'
                                + final_price_abs + '">' + final_price_abs + '元</span>';
                        if (window.__HD_ID=='8'){
                            str = '除了'
                                + res_obj['model_name']
                                + '外您还能获得：<span class="final-price" data-price="'
                                + final_price_abs + '">' + final_price_abs + '元</span>';
                        }
                        if (final_price > 0) {
                            str = '换个新'
                                + res_obj['model_name'] + '仅需：<span class="final-price" data-price="'
                                + final_price_abs + '">' + final_price_abs + '元</span>';
                            if (window.__HD_ID=='8'){
                                str = '换个'
                                    + res_obj['model_name'] + '仅需：<span class="final-price" data-price="'
                                    + final_price_abs + '">' + final_price_abs + '元</span>';
                            }
                        }

                        window._CACHE['show_offline'] = res_obj['show_offline'];

                        // 判断当前是否显示允许上门，如果是的话，将上门form remove掉，同时选中下一tab
                        var type_data = W('.tab-selected').attr('data-type');
                        if (window._CACHE['show_offline'] == false && type_data == '0') {
                            W('#shangmenSaleForm1').removeNode();
                            W('.type-select-tab .tab').item(1).click();
                        }

                        W('.final-price-line .final-price-desc').html(str);
                        wItem.fadeOut(400, function () {
                            wItem.removeNode();
                            W('.btn-add-more').show();

                            try {
                                W(document).fire('myresize');
                            } catch (ex) {}
                        });
                    } else {
                        var url_query = tcb.queryUrl(window.location.search);
                        // 删除购物车无商品
                        if (window._CACHE['no_product']) {
                            window.location.href = tcb.setUrl('/huishou', {
                                'iframe': url_query['iframe']
                            });
                        } else {
                            window.location.href = tcb.setUrl('/youpin/product', {
                                'product_id': tcb.queryUrl(window.location.href, 'newproductid'),
                                'iframe': url_query['iframe']
                            });
                        }
                    }
                }

            });

        }

    });

    function init(){
        var hash = tcb.parseHash(window.location.hash);
        if (typeof hash['suborder'] !== 'undefined') {
            // 触发显示换新提交表单
            W('.btn-active-huanxin-form').fire('click');
        }

        // 预约上门回收时间
        if( W('#shangmenSaleForm1 [name="server_time"]').length ){
            new PlaceHolder('#shangmenSaleForm1 [name="server_time"]');

            window.__ShangmenDateTime = new DateTime('#shangmenSaleForm1 [name="server_time"]', {
                remote: '/aj/doGetValidDateByRecovery',

                onSelect : function(e){ }
            });
        }
    }
    init();


    // 上门维修表单
    W('#shangmenSaleForm1, #daodianSaleForm1, #youjiSaleForm1').on('submit', function(e){
        e.preventDefault();
        var wForm = W(this);

        var mobile = wForm.one('[name="tel"]'), // 手机号
            mcode  = wForm.one('[name="code"]'),// 验证码
            server_time   = wForm.one('[name="server_time"]'), // 上门时间
            addr   = wForm.one('[name="user_addr"]'), // 用户地址
            uname  = wForm.one('[name="user_name"]'), // 用户姓名（邮寄换新）
            id_card= wForm.one('[name="id_card"]'),
            agree_protocol = wForm.one('[name="agree_protocol"]'); // 用户协议

        mobile.attr('data-novalid', '');

        // 用户姓名
        if (uname && uname.length) {
            if( uname.val().trim().length == 0 ){
                uname.shine4Error().focus();
                return;
            }
        }

        //手机号
        if( mobile && mobile.length && !tcb.validMobile(mobile.val().trim()) ){
            mobile.shine4Error().focus();
            return;
        }

        // 手机验证码
        if (mcode && mcode.length) {
            if( mcode.val().trim().length == 0 ){
                mcode.shine4Error().focus();
                return;
            }
        }

        // 上门时间
        if (server_time && server_time.length) {
            if( server_time.val().trim().length == 0 ){
                server_time.shine4Error().focus();
                return;
            }
        }

        // 地址
        if( addr && addr.length && addr.val().trim().length == 0 ){
            addr.shine4Error().focus();
            return;
        }

        // 身份证（部分活动需要）
        if (id_card && id_card.length) {
            if( !tcb.validIDCard(id_card.val().trim()) ){
                id_card.shine4Error().focus();
                return;
            }
        }

        // 回收常见问题
        if(agree_protocol&&agree_protocol.length){
            if(!agree_protocol.attr('checked')){
                agree_protocol.ancestorNode('label').shine4Error();
                return;
            }
        }

        // 验证是否换新活动手机号
        validHuanxin10086Mobile(mobile, function () {

            if(wForm.attr('submiting')=='1'){
                return;
            }
            wForm.attr('submiting', '1');

            QW.Ajax.post('/huishou/doSubmitOrder', wForm[0], function(rs){
                rs = QW.JSON.parse(rs);
                //成功
                if(rs.errno == 0){
                    var parent_id   = rs.result.parent_id;
                    var url_query = tcb.queryUrl(window.location.search),
                        data_params = {
                            'order_id': parent_id,
                            'from':url_query['from'],
                            '_from': url_query['_from'],
                            'sale_type':url_query['sale_type'],
                            'inclient':url_query['inclient'],
                            'iframe'  : url_query['iframe']
                        };


                    // 换新活动专享，跳到发票信息页面
                    // if (wForm.query('[name="newproductid"]').val()) {
                    //     // 输入发票信息
                    //     var redireact_url = tcb.setUrl('/huishou/order_invoice', data_params);
                    // } else {
                    //     var redireact_url = tcb.setUrl('/huishou/order_succ', data_params);
                    // }
                    var redireact_url = tcb.setUrl('/huishou/order_succ', data_params);


                    //如果是邮寄订单帮叫快递  否则直接跳转
                    var type_data = W('.tab-selected').attr('data-type');

                    if(type_data == '3'){
                        var order_id = parent_id;
                        var redirect_url = redireact_url;
                        YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

                            var
                                html_fn = $('#JsHSSchedulePickupPanelTpl').html().trim().tmpl(),
                                html_st = html_fn ({
                                    data : {
                                        province : '',
                                        city     : res['city_name'] || window.__CITY_NAME,
                                        area_list : res['area_list']||[],
                                        mobile   : res['default_mobile'],
                                        order_id : order_id,
                                        url : redirect_url
                                    }
                                })

                            var
                                DialogObj = tcb.showDialog (html_st, {
                                    className : 'schedule-pickup-panel',
                                    withClose : false,
                                    middle    : true,
                                    // onClose:function () {
                                    //     window.location.href = redirect_url
                                    // }
                                })

                            // 绑定预约取件相关事件
                            YuyueKuaidi.bindEventSchedulePickup (DialogObj.wrap, redirect_url)

                        })
                    }else {
                        window.location.href = redireact_url
                    }
                }else{
                    alert("抱歉，出错了。" + rs.errmsg);
                }
                wForm.attr('submiting', '');
            });
        });
    });

    var ObjPanel3;
    // 验证是否活动内手机号
    function validHuanxin10086Mobile($mobile, callback) {
        var mobile = $mobile.val().trim();

        // 回收换新
        if (W('body').hasClass('page-hs-hx-10086')) {
            // 输入数字位数为11+，开始验证手机号
            if (mobile.length==11) {
                if (!tcb.validMobile(mobile)) {

                    $mobile.shine4Error();

                    typeof callback==='function' && callback();
                } else {
                    if (window.__HD_ID!='1') {
                        typeof callback==='function' && callback();

                    }
                }
            } else {
                $mobile.attr('data-not2g3g', '');
                $mobile.attr('data-novalid', '');

                typeof callback==='function' && callback();
            }
        } else {
            typeof callback==='function' && callback();
        }
    }


    var CurProductAttrHash,
        ObjPanel, ObjPanel2, typeTipPanel;
    /**
     * 设置商品属性的ui状态
     * @param selectedAttr 当前选择商品属性
     * @param AttrGroup 所有可用属性组
     * @param AttrList 属性列表
     */
    function setProductAttrUi(selectedAttr, AttrGroup, AttrList){
        var SelectableAttr = [],
            AttrGroup_itemstr = AttrGroup.map(function(item){return item.join('');});

        var selectedAttr2 = arrCombinedSequence(selectedAttr);
        AttrList.forEach(function(item, i){
            SelectableAttr[i] = [];

            item.forEach(function(item2, i2){
                selectedAttr2.forEach(function(sitem){
                    var temp_arr = [];

                    temp_arr = temp_arr.concat(sitem.slice(0, i), item2, sitem.slice(i+1));

                    if (AttrGroup_itemstr.contains(temp_arr.join('')) && !SelectableAttr[i].contains(item2)) {
                        SelectableAttr[i].push(item2);
                    }
                });
            });
        });

        var wPCate = W('.product-attr-line');
        wPCate.forEach(function(el, i){
            var $line = $(el),
                pos = parseInt($line.attr('data-pos'), 10);
            W(el).query('.item a').forEach(function(el){
                var wItem = W(el),
                    attr_id = wItem.attr('data-attrid');
                wItem.removeClass('cur').removeClass('disabled').removeClass('disabled-hover');// 移除状态
                // 设置那些不能被选择的属性
                if (!SelectableAttr[pos].contains(attr_id)) {
                    wItem.addClass('disabled');
                } else {
                    wItem.removeClass('disabled');
                }

                if(attr_id === selectedAttr[pos]){
                    wItem.addClass('cur');
                }
            });
        });
    }
    /**
     * 将数组转换成组合序列
     * @param  {[type]} TwoDimArr [description]
     * @return {[type]}              [description]
     */
    function arrCombinedSequence(TwoDimArr){
        var ConvertedArr = [], // 转换后的二维数组
            cc = 1; // 转换后的二维数组的数组长度

        var TwoDimArr_safe = TwoDimArr.map(function(arr){
            return (arr instanceof Array) ? arr : [arr];
        });
        TwoDimArr_safe.forEach(function(arr){
            cc = cc*arr.length;
        });

        var kk = 1;
        TwoDimArr_safe.forEach(function(arr, i){
            var len = arr.length;
            cc = cc/len;
            if (i==0) {
                arr.forEach(function(item){
                    for(var j=0; j<cc; j++){
                        ConvertedArr.push([item]);
                    }
                });
            } else {
                var pos = 0;
                for(var k=0; k<kk; k++){
                    arr.forEach(function(item){
                        for(var j=0; j<cc; j++){
                            ConvertedArr[pos].push(item);
                            pos++;
                        }
                    });
                }
            }
            kk = kk*len;
        });

        return ConvertedArr;
    }

    // 设置商品id
    function setProductId(){
        var pid = '', attr = ['', '', '', ''];
        W('.product-attr-line').forEach(function(el, i){
            var $me = W(el),
                pos = parseInt($me.attr('data-pos'), 10),
                attrid = $me.query('.cur').attr('data-attrid');

            attr[pos] = attrid;
        });

        var $btn = W('.goto-huanxinji-btn'),
            attr_key = attr.join(','), show_price, real_price;
        show_price = CurProductAttrHash[attr_key]['show_price'];
        real_price = CurProductAttrHash[attr_key]['real_price'];

        W('.dialog-wrap .show-price').html('￥'+show_price);
        W('.dialog-wrap .real-price').html('京东价￥'+real_price);

        pid = CurProductAttrHash[attr_key]['product_id'];
        pid = pid?pid:'';
        $btn.attr('data-pid', pid);
    }

    // 激活城市区县选择
    function activeAreaSelect (OptDefault) {
        OptDefault = OptDefault || []
        var
            options = {
                // 实例化的时候自动执行init函数
                flagAutoInit     : true,
                selectorProvince : '[name="province"]',
                selectorCity     : '[name="city"]',
                selectorArea     : '[name="area"]',
                province         : OptDefault[ 0 ],
                city             : OptDefault[ 1 ],
                area             : OptDefault[ 2 ]
            }

        Bang.AddressSelect (options)
    }
    activeAreaSelect ()

});
