Dom.ready(function() {

    /**
     * 设置产品属性数据缓存
     */
    var oProductAttrDataCache = {};
    function setProductAttrDataCache(){
        var wProductAttr = W('#ProductAttr');

        var classify = W('[name="model_id"]').val();
        // 含有分类的商品
        if (wProductAttr.isVisible()) {

            var wMultiattrBlock = W('.product-multiattr-block');
            // 多属性组合
            if (wMultiattrBlock.length) {
                var oOld_ProductAttrDataCache = oProductAttrDataCache[classify];

                oProductAttrDataCache[classify] = {
                    'cate': {},
                    'price':[]
                };
                var oClassify = oProductAttrDataCache[classify]['cate'];

                var wMultiattrLine = W('.product-multiattr-line');
                wMultiattrLine.forEach(function(el){
                    var wMe = W(el);

                    oClassify[wMe.attr('data-lkey')] = {};

                    wMe.query('input').forEach(function(ipt){
                        var wIpt = W(ipt);
                        if (wIpt.attr('checked')) {
                            oClassify[wMe.attr('data-lkey')][wIpt.val()] = wIpt.attr('data-name');
                        }
                    });
                });

                var oPrice = oProductAttrDataCache[classify]['price'];
                var wPriceBlock = W('.product-multiattr-price-block');
                if (wPriceBlock.length) {
                    var wTr = wPriceBlock.query('tr');
                    wTr.forEach(function(r){
                        var wMe = W(r);

                        var wTd = wMe.query('td');
                        if (!wTd.length) {
                            return;
                        }
                        var attr_id = ''
                            group = [],
                            sel = {},
                            group_name = '';
                        var price = parseFloat(wTd.last().query('input').val());
                        if (price>0) {
                            wTd.forEach(function(d, i){
                                var wD = W(d);

                                if (!wD.hasClass('product-multiattr-price-td')) {
                                    group.push(wD.attr('data-id'));
                                    sel[i+1] = {
                                        'id': wD.attr('data-id'),
                                        'name': wD.html()
                                    };
                                    attr_id += wD.attr('data-id');
                                    group_name += wD.html()+' ';
                                }
                            });

                            oPrice.push({
                                'attr_id': attr_id,
                                'attr_name': '',
                                'checked ': 0,
                                'price': price,
                                'attr_info': {
                                    'group': group,
                                    'sel': sel
                                },
                                'group_name': group_name
                            })
                        }
                    });
                } else {
                    if (typeof oOld_ProductAttrDataCache!=='undefined') {
                        oProductAttrDataCache[classify]['price'] = oOld_ProductAttrDataCache['price'];
                    }
                }
            }

        } else {
            oProductAttrDataCache[classify] = {
                'price': ''
            };
            // 价格
            oProductAttrDataCache[classify]['price'] = W('#NonProductAttr input').val();
        }
    }

    /**
     * 设置商品属性组合的价格table
     * @param {[type]} data [description]
     */
    function setProductMultiAttrPriceTpl(data){
        var params = {
            'attrName': data['attrName'],
            'attrGroup': data['attrGroup']
        };
        var tpl_fun = W('#LiangpinProductMultiAttrPriceTpl'+tpl_sign).html().trim().tmpl(),
            tpl_str = tpl_fun(params);
        if (W('.product-multiattr-price-block').length) {
            W('.product-multiattr-price-block').removeNode();
        }
        W('#ProductAttr').insertAdjacentHTML('beforeend', tpl_str);
    }
    /**
     * 验证多属性组合的价格的合理性
     * @return {[type]} [description]
     */
    function validMultiAttrPrice(){
        var flag = false;
        var wAttrBlock = W('.product-multiattr-block'),
            wPriceBlock = W('.product-multiattr-price-block');
        if (wAttrBlock.length) {
            if (wPriceBlock.length) {
                var wPrice = wPriceBlock.query('[name="price[]"]');
                wPrice.forEach(function(el){
                    var wMe = W(el),
                        val = wMe.val();
                    val = val ? parseFloat(val) : 0;
                    wMe.siblings('[name="attr_val_id[]"]').removeNode();
                    if (val>=0) {
                        flag = true;
                    }
                    var attr_str = wMe.ancestorNode('td').siblings('.p-attr').map(function(el){
                        return W(el).attr('data-id');
                    }).join(',');
                    wMe.insertAdjacentHTML('afterend', '<input type="hidden" name="attr_val_id[]" value="'+attr_str+'">');
                });
            } else {
                var wProductAttr = W('#ProductAttr');
                if (wProductAttr.length) {
                    setScrollTop(wProductAttr.getRect()['top']);
                }
                tcb.alert('', '请确认选择商品属性并填写报价后，再提交', {'width':300, btn_name: '关闭',wrapId:"ErrorAlertPannel"}, function(){return true;});

                return flag;
            }
        } else {
            flag = true;
        }

        if (!flag) {
            var wProductAttr = W('#ProductAttr');
            if (wProductAttr.length) {
                setScrollTop(wProductAttr.getRect()['top']);
            }
            tcb.alert('', '请至少输入一组商品价格', {'width':300, btn_name: '关闭',wrapId:"ErrorAlertPannel"}, function(){
                if(wPrice && wPrice.length){
                    wPrice.forEach(function(el){
                        W(el).removeAttr('disabled');
                    });
                    wPrice.first().focus();
                }
                return true;
            });
        }

        return flag;
    }
    /**
     * 设置滚动条高度
     * @param {[type]} top_val [description]
     */
    function setScrollTop(top_val){
        top_val = top_val ? top_val : 0;
        if (typeof window.pageYOffset!=='undefined') {
            window.pageYOffset = top_val;
        }
        document.documentElement.scrollTop = top_val;
        document.body.scrollTop = top_val;
    }


    /**** 选择商品属性，并且填写报价 ****/
    // 遍历价格属性列表行，所有属性全部选择，返回选择后的数据，否则返回false；
    function eachPriceAttrLine(wAttrLine){
        if (!(wAttrLine && wAttrLine.length)) {
            return false;
        }
        var flag = true,
            SelectedAttrName = [],
            SelectedAttr = []; // SelectedAttrName 和 SelectedAttr 生成后是一一对应的关系；
        wAttrLine.forEach(function(el){
            if (!flag) {return; }
            var non_checked = true;

            var wLine = W(el),
                attrname = wLine.attr('data-attrname');
            SelectedAttrName.push(attrname);

            var SelectedAttrItem = [];
            wLine.query('input').forEach(function(inp){
                var wInp = W(inp);
                if(wInp.attr('checked')){
                    SelectedAttrItem.push({
                        'name': wInp.attr('data-name'),
                        'id': wInp.val()
                    });
                    non_checked = false;
                }
            });
            SelectedAttr.push(SelectedAttrItem);
            if (non_checked) {
                flag = false;
                tcb.alert('', '请选择 ' + attrname, {'width':300, btn_name: '关闭',wrapId:"ErrorAlertPannel"}, function(){return true;});
                return;
            }
        });

        return flag ? [SelectedAttrName, SelectedAttr] : flag;
    }
    // 生成已选择属性的组合，返回属性组，或者false
    function generateAttrGroup(SelectedAttr){
        if (!(SelectedAttr && SelectedAttr.length)) {
            return false;
        }
        var AttrGroup = [],
            CountArr  = [],
            CountArr2 = [];
        SelectedAttr.reverse();
        SelectedAttr.forEach(function(aAttr){
            var num = aAttr.length;
            if (CountArr[0]) {
                num = num*CountArr[0];
            }
            CountArr.unshift(num);
            CountArr2.unshift(aAttr.length);
        });
        SelectedAttr.reverse();
        CountArr.push(1);
        CountArr.shift();

        var i = 0, kk = 1;
        SelectedAttr.forEach(function(aAttr){
            if (i==0) {
                aAttr.forEach(function(item){
                    for(var j=0; j<CountArr[0]; j++){
                        AttrGroup.push([item]);
                    }
                });
                CountArr.shift();
            } else {
                var pos = 0;
                kk = kk*CountArr2.shift();
                for(var k=0; k<kk; k++){
                    aAttr.forEach(function(item){
                        for(var j=0; j<CountArr[0]; j++){
                            AttrGroup[pos].push(item);
                            pos++;
                        }
                    });
                }
                CountArr.shift();
            }
            i++;
        });

        return AttrGroup;
    }
    // 设置属性组的price stock cache
    function setAttrGroupCacheData(AttrGroup){
        // 价格cache
        var dataCache = oProductAttrDataCache[W('[name="model_id"]').val()];
        var SelectedAttrPirceCache = dataCache ? dataCache : null;

        AttrGroup.forEach(function(item){
            var flag = false;
            if (SelectedAttrPirceCache) {
                var combine_id = item.map(function(iSub){return iSub['id'];}).join(',');
                QW.ObjectH.map(SelectedAttrPirceCache, function(v, k){
                    if (combine_id===k) {
                        item.push(v['price']?v['price']:'');
                        if(add_type=='huanxin'){
                            item.push(v['real_price']?v['real_price']:'');
                        }
                        item.push(v['stock_nums']?v['stock_nums']:0);
                        item.push(v['online']?v['online']:'1');
                        if(add_type=='guanhuan'){
                            item.push(v['flash_price'] ? v['flash_price'] : '0');
                            item.push(v['flash_start_time_time']);
                            item.push(v['flash_end_time_time']);
                            item.push(v['huodong_type']);
                            item.push(v['imei']);
                        }
                        flag = true;
                    }
                });
            }
            if (!flag) {
                item.push('');
                if(add_type=='huanxin'){
                    item.push('');
                }
                item.push(0);
                item.push('1');
                if(add_type=='guanhuan'){
                    item.push(0);
                    item.push(0);
                    item.push(0);
                    item.push(0);
                    item.push('');
                }
            }
        });
    }
    // 验证产品表单
    function validProductForm(wForm){
        var flag = true;
        // 表单验证 start
        if(!QW.Valid.checkAll(wForm[0])){
            flag = false;
        }
        // 验证多属性组合价格填写的合法性
        if (!validMultiAttrPrice()) {
            flag = false;
        }
        // 售后服务
        if(window.__PService){
            if( window.__PService.getContent() == "" ){
                W('#PServiceError').show();
                window.__PService.focus();
                flag = false;
            }else{
                W('#PServiceError').hide();
            }
        }
        // 实拍描述
        /*
        if(window.__PDescribe){
            if( window.__PDescribe.getContent() == "" ){
                W('#PDescribeError').show();
                window.__PDescribe.focus();
                flag = false;
            }else{
                W('#PDescribeError').hide();
            }
        }
        */

        // 表单验证 end
        return flag;
    }
    // 异步获取型号下的属性(目前只用于添加商品时)
    function ajaxSetModelAttr(model_id, callback){
        if (!model_id) {
            return;
        }
        var request_url = '/liangpin_mer/aj_model_attr?model_id='+model_id;
        QW.Ajax.get(request_url, function(res){
            res = JSON.parse(res);

            if (!res['errno']) {
                var datas = {
                    'attr_price': res['result']['price']
                };
                var tmpl_fn  = W('#LiangpinProductMultiAttrTpl'+tpl_sign).html().tmpl(),
                    tmpl_str = tmpl_fn(datas);
                W('#ProductAttr').html(tmpl_str);

                if (res['result']['no_price']) {
                    datas = {
                        'attr_no_price': res['result']['no_price']
                    };
                    tmpl_fn  = W('#LiangpinProductScreenTpl'+tpl_sign).html().tmpl();
                    tmpl_str = tmpl_fn(datas);
                    if (W('#ProductScreen').length) {
                        W('#ProductScreen').html(tmpl_str);
                    }
                }
                if(QW.ObjectH.isFunction(callback)){
                    callback(res);
                }
            } else {

            }
        });
    }
    // 设置填写IMEI号或者SN号
    function setIMEIAndSNAttr(imei){
        var params = {
            'imei': imei
        };
        var tpl_fun = W('#IMEIAndSNAttrTpl').html().trim().tmpl(),
            tpl_str = tpl_fun(params);

        var wLine = W('#IMEIAndSNAttr');
        wLine.html(tpl_str);
    }
    // 设置填写商品描述(质检结论)
    function setProductDesc(chengse_desc){
        chengse_desc = chengse_desc.trim();
        if (chengse_desc) {
            chengse_desc = chengse_desc=='全新' ? chengse_desc : chengse_desc+'新';
        }
        var params  = {
            'chengse_desc' : chengse_desc
        };
        var tpl_fun = W('#ProductDescTpl').html().trim().tmpl(),
            tpl_str = tpl_fun(params);
        var wLine = W('#ProductDesc');
        wLine.html(tpl_str);
    }
    //默认填写商品描述(质检结论)
    setProductDesc('');

    /******* 事件绑定 *******/
    tcb.bindEvent(document.body, {
        // 确认属性的选择
        '.product-multiattr-select-confirm-btn': function(e){
            e.preventDefault();


            var wAttrLine = W('.product-multiattr-line'),
                AttrArr = eachPriceAttrLine(wAttrLine);

            if (!AttrArr) { return false;}

            var SelectedAttrName = AttrArr[0],
                SelectedAttr     = AttrArr[1];

            var AttrGroup = generateAttrGroup(SelectedAttr);

            setAttrGroupCacheData(AttrGroup);

            setProductMultiAttrPriceTpl({
                'attrName' : SelectedAttrName,
                'attrGroup': AttrGroup
            });
            W('.product-multiattr-block').slideUp();
        },
        // 重新选择属性组合
        '.product-multiattr-reselect-btn': function(e){
            e.preventDefault();

            // setProductAttrDataCache();

            W('.product-multiattr-block').slideDown();
            W('.product-multiattr-price-block').removeNode();
        },
        // 编辑商品 下一步
        'div.btn-step':function(e){
            e.preventDefault();

            // 设置产品分类相关逻辑
            // setProductAttr();
            // 设置型号相关信息
            var wCurBrand = W('#ProductBrand .curl'),
                wCurModel = W('#ProductModel .curl');

            var data_id = wCurModel.attr('data-id');
            //如果是优品
            if(add_type == 'liangpin')
            {
                 ret = confirm('即将添加优品机!');
                 if(ret == false)
                 {
                     return ret;
                 }
            	 ajaxSetModelAttr(data_id, function(){
                     // 默认设置填写IMEI号
                     setIMEIAndSNAttr(1);
                 });

                 W('#BrandModelNav').html(wCurBrand.html()+' > '+wCurModel.html());
                 W('#ProductTitlePrev').html(wCurBrand.html()+' '+wCurModel.html());
                 W('[name="model_id"]').val(data_id);

                 // 商品编辑 步骤状态
                 W("#new_product_step1").hide();
                 W("#new_product_step2").show();
                 W('.new-product-step1').hide();
                 W('.new-product-step2').show();
                 W("#product_step").val(2);
            }
            else
            {//如果是官换

                 if(add_type=='guanhuan')
                 {
                     wCurChengse = W('#ProductChengse .curl');

                     var chengse = wCurChengse.attr('data-id');
                     var chengseText = wCurChengse.html();
                     ret = confirm('即将添加官换机!');
                 }
                 else
                 {
                     ret = confirm('即将添加换新机!');
                 }

                 if(ret == false)
                 {
                     return ret;
                 }
                if(add_type=='guanhuan'){
                    gurl = '/liangpin_mer/aj_ck_add_model?model_id='+data_id+'&add_type='+add_type+'&chengse='+chengse;
                }else{
                    gurl = '/liangpin_mer/aj_ck_add_model?model_id='+data_id+'&add_type='+add_type;
                }

            	 Ajax.get(gurl, function(res){
                     res = JSON.parse(res);

                     if (!res['errno']) {
                         ajaxSetModelAttr(data_id);

                         W('#BrandModelNav').html(wCurBrand.html()+' > '+wCurModel.html());
                         W('#ProductTitlePrev').html(wCurBrand.html()+' '+wCurModel.html());
                         W('[name="model_id"]').val(data_id);

                         // 商品编辑 步骤状态
                         W("#new_product_step1").hide();
                         W("#new_product_step2").show();
                         W('.new-product-step1').hide();
                         W('.new-product-step2').show();
                         W("#product_step").val(2);
                         if(add_type=='guanhuan' && chengse>0){
                             $("#chengse").val(chengse);
                             $("#chengseSet").html(chengseText);
                             //$("#chengseSet").attr("disabled",true);
                         }

                     }
                     else if(res['errno']=='3') {
                         if(add_type=='guanhuan'){
                             eurl = '/liangpin_mer/edit_product?model_id='+data_id+'&add_type='+add_type+'&chengse='+chengse;
                         }else{
                             eurl = '/liangpin_mer/edit_product?model_id='+data_id+'&add_type='+add_type;
                         }
                         if (confirm('您已经发布过同型号商品，是否重新编辑？')) {
                             location.href = eurl;
                         }
                     } else {
                         alert(res['errmsg']);
                     }
                 });
            }
        },
        // 返回品牌型号的选择
        'a.go-first':function(e){
    		e.preventDefault();

            // setProductAttrDataCache();
            W("#new_product_step2").hide();
            W("#new_product_step1").show();
            W('.new-product-step2').hide();
            W('.new-product-step1').show();
        },
        // 选择分类
        '.cate li':function(e){
            e.preventDefault();

            var me = W(this);

            me.siblings('li').removeClass('curl');
            me.addClass('curl');

            var brand_model = window.brand_model;
            if (me.ancestorNode('#ProductBrand').length) {
                var model_str = '';
                brand_model[me.attr('data-id')].forEach(function(arr, i){
                    model_str += '<li data-id="'+arr.model_id+'" class="'+(i==0 ? 'curl' : '')+'">'+arr.model_name+'</li>';
                });
                W('#ProductModel').html(model_str);
            }
        },
        'input[type="text"]': {
            change: function(){
                window.onbeforeunload = function(){
                    return '离开后，填写的内容将会丢失';
                }
            }
        },
        // 添加商品，保存上架
        '#addProduct a.btn-save1':function(e){
            e.preventDefault();
            var wMe = W(this)
            if(wMe.attr('disabled')){
                alert('您已点击过一次,再忍忍,实在忍不了,请刷新页面!')
                return;
            } else {
                wMe.attr('disabled', 'disabled');
            }

            var wAddProduct = W("#addProduct");

            // 表单验证
            if (!validProductForm(wAddProduct)) {
                wMe.removeAttr('disabled');
                return false;
            }

            document.addProduct.onsale.value = "1"; // 设置上架发布
            wAddProduct.attr("target","_self");
            wAddProduct.attr("action","/liangpin_mer/aj_sub_product/");

            Ajax.post(document.addProduct, function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        wMe.removeAttr('disabled');
                        return alert(ret.errmsg);
                    };
                    window.onbeforeunload = null;
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">发布商品成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410,
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                    });
                    setTimeout(function(){
                        location.replace("/liangpin_mer/add_product/?add_type=guanhuan");
                    },3000);

                }catch(e){
                    W('#addProduct a.btn-save1').removeAttr('disabled');
                    alert("提交失败，请稍后重试");
                }
            });
        },
        // 添加商品，保存下架
        '#addProduct a.btn-save2':function(e){
            e.preventDefault();
            var wMe = W(this)
            if(wMe.attr('disabled')){
                alert('您已点击过一次,再忍忍,实在忍不了,请刷新页面!')
                return;
            } else {
                wMe.attr('disabled', 'disabled');
            }

            var wAddProduct = W("#addProduct");

            // 表单验证
            if (!validProductForm(wAddProduct)) {
                wMe.removeAttr('disabled');
                return false;
            }

            document.addProduct.onsale.value = "2"; // 设置下架发布
            wAddProduct.attr("target","_self");
            wAddProduct.attr("action","/liangpin_mer/aj_sub_product/");

            Ajax.post(W('#addProduct')[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        wMe.removeAttr('disabled');
                        return alert(ret.errmsg);
                    };
                    window.onbeforeunload = null;
                   if(add_type == 'liangpin'){
                       window.open('/liangpin_mer/printBarCode/?product_id=' + ret.result.product_id);
                   }
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">发布商品成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410,
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                    });
                    setTimeout(function(){
                        location.replace("/liangpin_mer/add_product/?add_type=liangpin");
                    },3000);
                }catch(e){
                    W('#addProduct a.btn-save2').removeAttr('disabled');
                    alert("提交失败，请稍后重试");
                }
            });
        },
        // 编辑商品，保存上架
        '#editProduct a.btn-save1':function(e){
            e.preventDefault();
            var wMe = W(this)
            if(wMe.attr('disabled')){
                alert('您已点击过一次,再忍忍,实在忍不了,请刷新页面!')
                return;
            } else {
                wMe.attr('disabled', 'disabled');
            }
            var wEditProduct = W("#editProduct");

            if(add_type == 'liangpin'){
                var user_input = $('.user_input_price').val(),
                    wh_id = $(this).attr('data-wh-id');
                function compareProductPrice(user_input,wh_id) {

                    $.get('/liangpin_mer/doGetPurchasePrice',{
                        'wh_id' : wh_id
                    },function (res) {
                        res = JSON.parse(res)
                        if(!res.errno){
                            if(user_input-0 < res.result){
                                var user_confirm = confirm('当前定价低于入库价，是否确定要修改价格？')
                                if(user_confirm){
                                    alreadyFunction()
                                }
                            }else{
                                alreadyFunction()
                            }
                        }else{
                            wMe.removeAttr('disabled');
                            alert(res.errmsg)
                        }
                    })
                }
                compareProductPrice(user_input,wh_id);
            } else {
                alreadyFunction();
            }

            function alreadyFunction() {
                // 表单验证
                if (!validProductForm(wEditProduct)) {
                    wMe.removeAttr('disabled');
                    return false;
                }

                document.editProduct.onsale.value = "1"; // 设置上架发布
                if( add_type == 'liangpin' ){
                    wEditProduct.attr("action","/liangpin_mer/aj_edit_product_liangpin/");
                }
                else{
                    wEditProduct.attr("action","/liangpin_mer/aj_edit_product/");
                }

                Ajax.post(wEditProduct[0], function(e){
                    try{
                        var ret = (e || "").evalExp();
                        if(parseInt(ret.errno, 10) != 0) {
                            wMe.removeAttr('disabled');
                            return alert(ret.errmsg);
                        }
                        window.onbeforeunload = null;
                        var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">修改商品成功,3秒钟后刷新页面。</div>',
                            {
                                'width' : 410,
                                'wrapId' : 'panelMessageTips'
                            }, function() {
                                panel.hide();

                                if(add_type == 'liangpin'){
                                    location.href="/liangpin_mer/product_list_liangpin";
                                }
                                else{
                                    location.href="/liangpin_mer/product_list";
                                }
                            });
                        setTimeout(function(){
                            if(add_type == 'liangpin'){
                                location.href="/liangpin_mer/product_list_liangpin";
                            }
                            else{
                                location.href="/liangpin_mer/product_list";
                            }
                        },3000);


                    }catch(e){
                        alert("提交失败，请稍后重试");
                    }
                });
            }


        },
        // 编辑商品，保存下架
        '#editProduct a.btn-save2':function(e){
            e.preventDefault();
            var wMe = W(this)
            if(wMe.attr('disabled')){
                alert('您已点击过一次,再忍忍,实在忍不了,请刷新页面!')
                return;
            } else {
                wMe.attr('disabled', 'disabled');
            }

            var wEditProduct = W("#editProduct");

            // 表单验证
            if (!validProductForm(wEditProduct)) {
                wMe.removeAttr('disabled');
                return false;
            }

            document.editProduct.onsale.value = "2"; // 设置下架发布
            if( add_type == 'liangpin' ){
            	wEditProduct.attr("action","/liangpin_mer/aj_edit_product_liangpin/");
            }
            else{
            	wEditProduct.attr("action","/liangpin_mer/aj_edit_product/");
            }
            Ajax.post(wEditProduct[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        wMe.removeAttr('disabled');
                        return alert(ret.errmsg);
                    };
                    window.onbeforeunload = null;
                    if(add_type == 'liangpin'){
                        window.open('/liangpin_mer/printBarCode/?product_id=' + ret.result.product_id);
                    }
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">修改商品成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410,
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                            if(add_type == 'liangpin'){
                            	location.href="/liangpin_mer/product_list_liangpin";
                            }
                            else{
                            	location.href="/liangpin_mer/product_list";
                            }
                    });
                    setTimeout(function(){
                          if(add_type == 'liangpin'){
                          	location.href="/liangpin_mer/product_list_liangpin";
                          }
                          else{
                          	location.href="/liangpin_mer/product_list";
                          }
                    },3000);


                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            });
        },
        '.buy-max-num':{
            keyup:function(){
                var val = W(".buy-max-num").val()||"";
                if(val&& /^[0-9]*[1-9][0-9]*$/.test(val)){
                    val = val.substr(0,4);
                    if(val<1){
                        W(".buy-max-num").val(1)
                    }else if(val>1000){
                        W(".buy-max-num").val(1000)
                    }
                }else{
                    if(val){
                        W(".buy-max-num").val(1)
                    }
                }
            }
        },
        // 删除上传图片
        '.mer-pack-imglist .del,.mer-head-imglist .del': function(e){
            e.preventDefault();

            var wMe = W(this);

            wMe.siblings('span').html('');
            wMe.siblings('input').val('');
            wMe.ancestorNode('li').addClass('no-img');
        },
        // 设置上下架状态
        '.set-product-multiattr-online': function(e){
            e.preventDefault();

            var wMe = W(this),
                wIpt = wMe.siblings('input');

            if(wIpt.val()=='1'){
                wIpt.val('2');
                wMe.html('下架');
            } else {
                wIpt.val('1');
                wMe.html('上架');
            }
        },
        //
        '.set-product-flash-status': function(e){
            e.preventDefault();
            var wMe = W(this),
                wIpt = wMe.siblings('input');

            if(wIpt.val()=='0'){
                wIpt.val('250');
                wMe.html('秒杀开启');
            } else {
                wIpt.val('0');
                wMe.html('秒杀关闭');
            }
        },
        // 价格交互
        '[name="price[]"], [name="stock_nums[]"]': {
            'blur': function(e){
                var wMe = W(this);

                var wTr = wMe.ancestorNode('tr'),
                    wPriceTd = wTr.query('.product-multiattr-price-td'),
                    wStockTd = wTr.query('.product-multiattr-stock-td'),
                    wOnlineTd = wTr.query('.product-multiattr-online-td');
                // 价格 和 库存 都大于零
                if (parseFloat(wPriceTd.query('input').val())>0 && parseFloat(wStockTd.query('input').val())>0) {
                    wOnlineTd.query('[name="online[]"]').val('1');
                    wOnlineTd.query('.set-product-multiattr-online').show().html('上架');
                } else {
                    wOnlineTd.query('.set-product-multiattr-online').hide();
                }
            }
        },
        // 为了实现，选择wifi或者3g，切换填写序列号和IMEI号
        '.product-multiattr-line [type="radio"]': function(e){
            var wMe = W(this);

            var wLine = wMe.ancestorNode('.product-multiattr-line'),
                wRadio = wLine.query('[type="radio"]');
            // 行内是否有wifi属性
            var wWifiRadio = wRadio.filter(function(el){
                return W(el).val()==='114'
            });
            if(wWifiRadio && wWifiRadio.length){
                var imei = 1;
                // 选wifi
                if(wMe.val()==='114'){
                    imei = '';
                }
                setIMEIAndSNAttr(imei);
            }
        },
        '#firstClass .search-box': {
            'keyup': function (e) {
                var target_txt = $(this).val()
                var item_all = $('#ProductBrand li')
                searchByKeyWord(item_all,target_txt)
            }
        },
        '#secondClass .search-box': {
            'keyup': function (e) {
                var target_txt = $(this).val()
                var item_all = $('#ProductModel li')
                searchByKeyWord(item_all,target_txt)
            }
        },
        '#chengseClass .search-box': {
            'keyup': function (e) {
                var target_txt = $(this).val()
                var item_all = $('#ProductChengse li')
                searchByKeyWord(item_all,target_txt)
            }
        }
    });
    
    //模糊搜索
    function searchByKeyWord(target_ele,target_word) {
        for(var i=0; i<target_ele.length; i++){
            var $item = $(target_ele[i])

            if(target_word.toUpperCase() == ''){
                $item.show()
            }else{
                if($item.text().toUpperCase().indexOf(target_word.toUpperCase())>-1){
                    $item.show()
                }else {
                    $item.hide()
                }
            }
        }
    }

    // 编辑商品时 默认选择属性和价格
    (function(){
        var attr_price = window.attr_price,
            attr_selected = [],
            attr_price_cache = {};

        if (attr_price&&QW.ObjectH.isPlainObject(attr_price)) {

            // 设置 attr_selected 和 attr_price_cache
            QW.ObjectH.map(attr_price, function(v, k){
                v['attr'].forEach(function(vv, kk){
                    vv = parseInt(vv, 10);

                    if (typeof attr_selected[kk]=='undefined') {
                        attr_selected[kk] = [];
                    }
                    if(attr_selected[kk].indexOf(vv)==-1){
                        attr_selected[kk].push(vv);
                    }
                });

                attr_price_cache[v['attr'].join(',')] = {
                    'price': v['price'],
                    'stock_nums': v['stock_nums'],
                    'online': v['online']
                };
                if(add_type=='huanxin')
                {
                    attr_price_cache[v['attr'].join(',')] = {
                        'price': v['price'],
                        'real_price': v['real_price'],
                        'stock_nums': v['stock_nums'],
                        'online': v['online']
                    };
                }

                if(v['flash_price']){
                    // 如果有秒杀价
                    attr_price_cache[v['attr'].join(',')]['flash_price'] = v['flash_price']
                }
                attr_price_cache[v['attr'].join(',')]['flash_start_time_time'] = v['flash_start_time_time'];
                attr_price_cache[v['attr'].join(',')]['flash_end_time_time']   = v['flash_end_time_time'];
                attr_price_cache[v['attr'].join(',')]['huodong_type']          = v['huodong_type'];
                attr_price_cache[v['attr'].join(',')]['imei']                  = v['imei'];

            });
            // 设置被选择的属性
            oProductAttrDataCache['attr_selected'] = attr_selected;
            // 设置属性价格cache
            oProductAttrDataCache[W('[name="model_id"]').val()] = attr_price_cache;

            // 遍历多属性行节点
            W('.product-multiattr-line').forEach(function(el, i){
                var wInp = W(el).query('input');

                wInp.forEach(function(inp){
                    var wMe = W(inp);

                    if(attr_selected[i].indexOf(parseInt(wMe.val(), 10))!==-1){
                        wMe.attr('checked', 'checked');
                    }
                });
            });

            W('.product-multiattr-select-confirm-btn').click();
        }
    }());

    // 上传包装图片
    (function(){
        var wCurImgItem = null;
        // 回调函数
        var upHandler = {
            // 上传文件加入队列
            fileQueued: function(file){
                // try {
                //     console.log('fileQueued');
                //     console.log(file);
                // } catch (ex) {
                //     this.debug(ex);
                // }
            },
            // 上传队列错误
            fileQueueError: function(file, errorCode, message){
                try {
                    // console.log('fileQueueError');
                    // console.log(file, errorCode, message);

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

                    wCurImgItem = W('.mer-pack-imglist .no-img').first();
                    if (wCurImgItem) {
                        wCurImgItem.query('span').html('<img src="https://p.ssl.qhimg.com/t012736d21e3607dab3.gif">');
                    } else {
                        // 没有上传位置了，那么清出队列，以免占了位置
                        var stats = this.getStats();
                        while (stats['files_queued'] > 0) {
                            this.cancelUpload();
                            stats = this.getStats();
                        }
                        alert('只能上传'+W('.mer-pack-imglist li').length+'张图片');
                        return false;
                    }
                }
                catch (ex) {}
            },
            // 上传中~
            uploadProgress: function(file, bytesLoaded, bytesTotal){
                // try {
                //     console.log('uploadProgress');
                //     console.log(file, bytesLoaded, bytesTotal);

                //     // var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
                // } catch (ex) {
                //     this.debug(ex);
                // }
            },
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

                    serverData = QW.JSON.parse(serverData);
                    if(serverData['errno'] == 0 && wCurImgItem){
                        wCurImgItem.removeClass('no-img')
                            .query('span').html('<img src="'+serverData['picsrc']+'" style="width:100%;height:100%;">');

                        wCurImgItem.query('input').val(serverData['picsrc']);
                    } else{
                        wCurImgItem.query('span').html('');
                        alert('上传失败，请重新尝试');
                    }
                    wCurImgItem = null;
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 上传完成
            uploadComplete: function(file){
                // console.log('uploadComplete');
                // console.log(file);
                var stats = this.getStats();
                if (stats['files_queued']>0){
                    this.startUpload();
                }
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
            upload_url: '/liangpin_mer/uploadimg/',
            file_post_name: "filedata",
            post_params: {
                'T': window.T||'',
                'Q': window.Q||''
            },
            file_size_limit : "20 MB",
            file_types : "*.jpg;*.jpeg;*.gif;*.png",
            file_types_description : "Image Files",
            file_upload_limit : 100,
            file_queue_limit : 5,
            // debug: true,
            // 上传按钮设置
            button_image_url: "http://",
            button_width: "103",
            button_height: "31",
            button_placeholder_id: "AddPackImgs",
            button_text: "<span class=\"textcolor\">立即上传</span>",
            button_text_style: ".textcolor{color:#666666;}",
            button_text_top_padding: 6,
            button_text_left_padding: 40,
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
        if (W('#AddPackImgs').length) {
            var SWFUploadInst  = new SWFUpload(upOptions);//构造一个上传实例；
        }
    }());

    (function(){
        var wCurImgItem = null;
        // 回调函数
        var upHandler = {
            // 上传文件加入队列
            fileQueued: function(file){
            },
            // 上传队列错误
            fileQueueError: function(file, errorCode, message){
                try {
                    // console.log('fileQueueError');
                    // console.log(file, errorCode, message);

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
                    wCurImgItem = W('.mer-content-imglist .no-img').first();
                    if (wCurImgItem) {
                        wCurImgItem.query('span').html('<img src="https://p.ssl.qhimg.com/t012736d21e3607dab3.gif">');
                    } else {
                        // 没有上传位置了，那么清出队列，以免占了位置
                        var stats = this.getStats();
                        while (stats['files_queued'] > 0) {
                            this.cancelUpload();
                            stats = this.getStats();
                        }
                        alert('只能上传'+W('.mer-content-imglist li').length+'张图片');
                        return false;
                    }
                }
                catch (ex) {}
            },
            // 上传中~
            uploadProgress: function(file, bytesLoaded, bytesTotal){
            },
            // 上传异常
            uploadError: function(file, errorCode, message){
                try {
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

                    serverData = QW.JSON.parse(serverData);
                    if(serverData['errno'] == 0 && wCurImgItem){
                        wCurImgItem.removeClass('no-img')
                            .query('span').html('<img src="'+serverData['picsrc']+'" style="width:100%;height:100%;">');

                        wCurImgItem.query('input').val(serverData['picsrc']);
                    } else{
                        wCurImgItem.query('span').html('');
                        alert('上传失败，请重新尝试');
                    }
                    wCurImgItem = null;
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 上传完成
            uploadComplete: function(file){
                // console.log('uploadComplete');
                // console.log(file);
                var stats = this.getStats();
                if (stats['files_queued']>0){
                    this.startUpload();
                }
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
            upload_url: '/liangpin_mer/uploadimg/',
            file_post_name: "filedata",
            post_params: {
                'T': window.T||'',
                'Q': window.Q||''
            },
            file_size_limit : "20 MB",
            file_types : "*.jpg;*.jpeg;*.gif;*.png",
            file_types_description : "Image Files",
            file_upload_limit : 100,
            file_queue_limit : 5,
            // debug: true,
            // 上传按钮设置
            button_image_url: "http://",
            button_width: "103",
            button_height: "31",
            button_placeholder_id: "AddContentImgs",
            button_text: "<span class=\"textcolor\">立即上传</span>",
            button_text_style: ".textcolor{color:#666666;}",
            button_text_top_padding: 6,
            button_text_left_padding: 40,
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
        if (W('#AddContentImgs').length) {
            var SWFUploadInst  = new SWFUpload(upOptions);//构造一个上传实例；
        }
    }());

    // 上传商品头图
    (function(){
        var wCurImgItem = null;
        // 回调函数
        var upHandler = {
            // 上传文件加入队列
            fileQueued: function(file){
                // try {
                //     console.log('fileQueued');
                //     console.log(file);
                // } catch (ex) {
                //     this.debug(ex);
                // }
            },
            // 上传队列错误
            fileQueueError: function(file, errorCode, message){
                try {
                //    console.log('fileQueueError');
                //    console.log(file, errorCode, message);

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
                    //console.log(numFilesSelected, numFilesQueued);

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

                    wCurImgItem = W('.mer-head-imglist .no-img').first();
                    if (wCurImgItem) {
                        wCurImgItem.query('span').html('<img src="https://p.ssl.qhimg.com/t012736d21e3607dab3.gif">');
                    } else {
                        // 没有上传位置了，那么清出队列，以免占了位置
                        var stats = this.getStats();
                        while (stats['files_queued'] > 0) {
                            this.cancelUpload();
                            stats = this.getStats();
                        }
                        alert('只能上传'+W('.mer-head-imglist li').length+'张图片');
                        return false;
                    }
                }
                catch (ex) {}
            },
            // 上传中~
            uploadProgress: function(file, bytesLoaded, bytesTotal){
                // try {
                //     console.log('uploadProgress');
                //     console.log(file, bytesLoaded, bytesTotal);

                //     // var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
                // } catch (ex) {
                //     this.debug(ex);
                // }
            },
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

                    serverData = QW.JSON.parse(serverData);
                    if(serverData['errno'] == 0 && wCurImgItem){
                        wCurImgItem.removeClass('no-img')
                            .query('span').html('<img src="'+serverData['picsrc']+'" style="width:100%;height:100%;">');

                        wCurImgItem.query('input').val(serverData['picsrc']);
                    } else{
                        wCurImgItem.query('span').html('');
                        alert('上传失败，请重新尝试');
                    }
                    wCurImgItem = null;
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 上传完成
            uploadComplete: function(file){
                //console.log('uploadComplete');
                //console.log(file);
                var stats = this.getStats();
                if (stats['files_queued']>0){
                    this.startUpload();
                }
            },
            // 队列完成
            queueComplete: function(numFilesUploaded){
                //console.log('queueComplete');
                //console.log(numFilesUploaded);
            }
        };
        // 上传配置
        var upOptions = {
            flash_url : '/resource/swf/swfupload2.5.fix.swf',
            upload_url: '/liangpin_mer/uploadimg/',
            file_post_name: "filedata",
            post_params: {
                'T': window.T||'',
                'Q': window.Q||''
            },
            file_size_limit : "20 MB",
            file_types : "*.jpg;*.jpeg;*.gif;*.png",
            file_types_description : "Image Files",
            file_upload_limit : 100,
            file_queue_limit : 9,
            //debug: true,
            // 上传按钮设置
            button_image_url: "http://",
            button_width: "103",
            button_height: "31",
            button_placeholder_id: "AddHeadImgs",
            button_text: "<span class=\"textcolor\">立即上传</span>",
            button_text_style: ".textcolor{color:#666666;}",
            button_text_top_padding: 6,
            button_text_left_padding: 40,
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
        if (W('#AddHeadImgs').length) {
            var SWFUploadInst  = new SWFUpload(upOptions);//构造一个上传实例；
        }
    }());

    /**
     * 初始化编辑器
     * @return {[type]} [description]
     */
    function initEditor(){
        if( W('#PService').length > 0 ){
            var editor1 = new UE.ui.Editor();
            editor1.render('PService');
            window.__PService = editor1;
        }
        /*//实拍描述计划于2015-11-24删除 yfl
        if( W('#PDescribe').length > 0 ){
            var editor2 = new UE.ui.Editor();
            editor2.render('PDescribe');
            window.__PDescribe = editor2;
        }
        */
    }
    initEditor();

    /**
     *添加类型页面切换器
     * @return {[type]} [description]
     */
    function initProductType(){
    	W('#product_type_guanhuan').on('click',function(e){
    		location.href = '/liangpin_mer/add_product/?add_type=guanhuan';
    	});

        W('#product_type_liangpin').on('click',function(e){
        	location.href = '/liangpin_mer/add_product/?add_type=liangpin';
    	});

        W('#product_type_huanxin').on('click',function(e){
            location.href = '/liangpin_mer/add_product/?add_type=huanxin';
        });
    }
    initProductType();


    //选择成色信息
    W('[name="chengse"]').on('change', function(e){
        var wMe = W(this),
            wOptions = wMe.query('option');

        var wOptionSelected = wOptions.filter(function(el){
            return W(el).attr('selected');
        });

        var chengse_desc = wOptionSelected.html();
        setProductDesc(chengse_desc);
        return;
    });

});