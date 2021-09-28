Dom.ready(function() {

    function getOneType(grade,id){
       
        var domTpl =W("#productClass, #productClass_edit, #productClass_1, #productClass_2, #productClass_3, #productClass_4, #productClass_5");//有哪个用哪个
        QW.Ajax.get('/mer_product/classify/?grade='+grade+'&rid='+ id,function(e){
            var ret = e.evalExp();
            if(parseInt(ret.errno, 10) == 0) {
                var func = domTpl.html().trim().tmpl();     
            }else{
                return alert(ret.errmsg);
            }
            W("#secondClass").query('.cate').removeClass('cate-arrow');
            if(ret.data.length!=0){
                html = func(ret);
                if(grade == 2 ){
                    W("#secondClass").html(html).show();
                    var me = W("#secondClass .cate li.curl"),
                        _id = me.attr('data-id'),
                        _grade = ~~me.attr('data-grade')+1;

                    getOneType(_grade,_id);

                }else if(grade==3){
                    W("#thirdClass").html(html).show();
                    W("#secondClass").query('.cate').replaceClass('cate-noarrow','cate-arrow');
                    W("#thirdClass").query('.cate').addClass('cate-noarrow');
                    W('.select_type').html(W(".select-bg .cate li.curl").getHtmlAll().join(' > '))
                    // W("#addProductType").val(W(".select-bg .cate li.curl").getAttrAll('data-id').join('_'))
                }
            }else{
                if(grade == 2 ){
                    W("#thirdClass").html('').hide();
                    W("#secondClass").html('').hide();
                }else if(grade==3){
                    W("#secondClass").query('.cate').replaceClass('cate-arrow','cate-noarrow');
                    W("#thirdClass").html('').hide();
                }

                W('.select_type').html(W(".select-bg .cate li.curl").getHtmlAll().join(' > '))
                // W("#addProductType").val(W(".select-bg .cate li.curl").getAttrAll('data-id').join('_'))
            }

            
        })
    }

    /**
     * 设置addProductType
     */
    function setProductType(){
        var wNavSelected = W('.bod-nav-selected'),
            wItem = wNavSelected.query('.bod-nav-selected-item'),
            selecttype = '';
        if (wItem.length) {
            selecttype = wItem.first().attr('selecttype');
        }
        if (selecttype) {
            W('#addProductType').val(selecttype);
            W('.select_type2').html(wNavSelected.query('.bod-nav-selected-item').first().query('.bod-nav-selected-item-txt').html());
            return true;
        } else {
            alert('请至少添加一个商品类目');
            return false;
        }
    }
    /**
     * 设置产品分类相关逻辑
     *     主要用于有分类和没有分类两种情况对价格的不同处理
     */
    function setProductAttr(){
        var data = null,
            dataCache = oProductAttrDataCache[W('#addProductType').val()];

        if(product_attr_content && product_class_ids){
            data = [];
            var selected_ids = [];

            var selecttype = W('.bod-nav-selected').query('.bod-nav-selected-item').first().attr('selecttype');
            selecttype.split('_').forEach(function(el){
                selected_ids.push(parseInt(el, 10));
            });

            var attr_id = false;
            // 遍历有分类的id，检测当前选中的分类是否在其中
            // console.log(product_class_ids)
            product_class_ids.forEach(function(el){
                if (selected_ids.contains(el)) {
                    attr_id = el;

                    return true;
                }
            });
            var selected_product_attr = null;
            // 包含分类
            if (attr_id) {
                var product_attr_content_info = product_attr_content[attr_id];
                // 只有一个属性
                if (QW.ObjectH.keys(product_attr_content_info).length==1) {
                    selected_product_attr = product_attr_content_info[1]['attr'];
                    if (dataCache && dataCache['cate']) {
                        var oCate = dataCache['cate'],
                            oPrice = dataCache['price'];
                        QW.ObjectH.map(selected_product_attr, function(v, k){
                            var checked = oCate.contains(k) ? true : false;
                            data.push({
                                'k': k,
                                'name': v,
                                'checked': checked,
                                'price': checked ? oPrice[k] : ''
                            });
                        });
                    } else {
                        QW.ObjectH.map(selected_product_attr, function(v, k){
                            data.push({
                                'k': k,
                                'name': v,
                                'checked': false,
                                'price': ''
                            });
                        });
                        data[0]['checked'] = true;
                    }

                    // 设置分类相关的html模板
                    setProductAttrTpl(data);
                }
                // 多个属性相互组合
                else if(QW.ObjectH.keys(product_attr_content_info).length>1) {
                    var dataList = [], ii=0;
                    QW.ObjectH.map(product_attr_content_info, function(v, k){
                        var attr_name = v['name'],
                            attr_cont = v['attr'];
                        dataList[ii] = {
                            'lkey': k,
                            'name': attr_name,
                            'attr': []
                        };
                        if (dataCache && dataCache['cate']) {
                            var selectedAttr = dataCache['cate'][k];
                        }
                        QW.ObjectH.map(attr_cont, function(vv, kk){
                            if (typeof selectedAttr!='undefined' && selectedAttr) {
                                if (selectedAttr[kk]) {
                                    dataList[ii]['attr'].push({
                                        'k': kk,
                                        'name': vv,
                                        'checked': true
                                    });
                                } else {
                                    dataList[ii]['attr'].push({
                                        'k': kk,
                                        'name': vv,
                                        'checked': false
                                    });
                                }
                            } else {
                                dataList[ii]['attr'].push({
                                    'k': kk,
                                    'name': vv,
                                    'checked': false
                                });
                            }
                        });
                        ii++;
                    });

                    setProductMultiAttrTpl(dataList);
                    return;
                }

            }
            // 不包含分类
            else {
                data = {
                    'price': dataCache ? dataCache['price'] : ''
                };
                setNonProductAttrTpl(data, selecttype);
            }
        } else {
            data = {
                'price': dataCache ? dataCache['price'] : ''
            };
            setNonProductAttrTpl(data, selecttype);
        }
    }
    /**
     * 设置产品属性数据缓存
     */
    var oProductAttrDataCache = {};
    function setProductAttrDataCache(){
        var wProductAttr = W('#ProductAttr');

        var classify = W('#addProductType').val();
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
                                    'sel': sel,
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
            // 单属性
            else {
                oProductAttrDataCache[classify] = {
                    'cate': [],
                    'price': {}
                };
                var oClassify = oProductAttrDataCache[classify];
                // 选中的分类
                var wChecked = wProductAttr.query('[checked]');
                wChecked.forEach(function(el, i){
                    oClassify['cate'].push(W(el).val());
                });
                // 分类的价格
                var wPrice = wProductAttr.query('[name="product_price[]"]');
                wPrice.forEach(function(el, i){
                    oClassify['price'][W(el).parentNode('tr').attr('data-id')] = W(el).val();
                });                
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
     * 设置产品有分类时候的模板
     */
    function setProductAttrTpl(data){
        var params = {
            'product_attr': data
        };
        var pa_tpl_fun = W('#ProductAttrTpl').html().trim().tmpl(),
            pa_tpl_str = pa_tpl_fun(params);

        W('#ProductAttr').html(pa_tpl_str).show();
        W('#NonProductAttr').html('').hide();
    }

    /**
     * 设置产品多个分类
     * @param {[type]} dataList [description]
     */
    function setProductMultiAttrTpl(dataList){
        var params = {
            'dataList': dataList
        };

        var tpl_fun = W('#ProductMultiAttrTpl').html().trim().tmpl(),
            tpl_str = tpl_fun(params);

        W('#ProductAttr').html(tpl_str).show();
        W('#NonProductAttr').html('').hide();
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

        var tpl_fun = W('#ProductMultiAttrPriceTpl').html().trim().tmpl(),
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
                var wPrice = wPriceBlock.query('[name="product_price[]"]');
                wPrice.forEach(function(el){
                    var wMe = W(el),
                        val = wMe.val();
                    val = val ? parseFloat(val) : 0;
                    wMe.siblings('[name="product_category[]"]').removeNode();
                    if (val>0) {
                        var attr_str = wMe.ancestorNode('td').siblings('td').map(function(el){
                            return W(el).attr('data-id');
                        }).join(',');

                        wMe.insertAdjacentHTML('afterend', '<input type="hidden" name="product_category[]" value="'+attr_str+'">');
                        flag = true;
                    } else {
                        wMe.val('').attr('disabled', 'disabled');
                    }
                });
            } else {
                var wProductAttr = W('#ProductAttr');
                if (wProductAttr.length) {
                    setScrollTop(wProductAttr.getRect()['top']);
                }
                tcb.alert('', '请确认选择并填写报价后，再提交', {'width':300, btn_name: '关闭',wrapId:"ErrorAlertPannel"}, function(){return true;});

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


    /**
     * 设置产品没有分类时候的模板
     */
    function setNonProductAttrTpl(data, selecttype){
        var params = {
            'product_attr': data,
            'is_eservice': selecttype=='285'? '1' : ''
        };
        var npa_tpl_fun = W('#NonProductAttrTpl').html().trim().tmpl(),
            npa_tpl_str = npa_tpl_fun(params);

        W('#ProductAttr').html('').hide();
        W('#NonProductAttr').html(npa_tpl_str).show();
        if (params['is_eservice']) {
            var wShangmenfei = W('#shangmenfei_wrap');
            if (wShangmenfei && wShangmenfei.length) {
                wShangmenfei.hide().query('input').val('');
            }
        }
    }
    /**
     * 设置上门维修费的显示状态
     */
    function setShangmenFeeStatus(){
        if(W('.shangmen_weixiu').attr('checked') && ( W('[name^="product_price"]').length ) ){
            W('#shangmenfei_wrap').show();
        }
    }
    
    tcb.bindEvent(document.body, {
        // 确认属性的选择
        '.product-multiattr-select-confirm-btn': function(e){
            e.preventDefault();

            var SelectedAttrName = [];
                SelectedAttr = [];

            var wAttrLine = W('.product-multiattr-line');

            var break_each_flag = false;
            wAttrLine.forEach(function(el){
                if (break_each_flag) {
                    return;
                }
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
                    break_each_flag = true;
                    tcb.alert('', '请选择 ' + attrname, {'width':300, btn_name: '关闭',wrapId:"ErrorAlertPannel"}, function(){return true;});
                    return;
                }
            });
            if (break_each_flag) { return false;}

            var AttrGroup = [],
                CountArr = [],
                CountArr2 = [];
            SelectedAttr.reverse();
            var recommend_title = [];
            SelectedAttr.forEach(function(aAttr){
                var num = aAttr.length;
                if (CountArr[0]) {
                    num = num*CountArr[0];
                }
                CountArr.unshift(num);
                CountArr2.unshift(aAttr.length);

                recommend_title.push(aAttr.map(function(item){return item['name'];}).join('/'))
            });
            // recommend_title = recommend_title.join('、')+'内存';
            // tcb.alert('', '根据您选择的商品属性为您推荐以下商品名称：<br>' + recommend_title, {'width':300, btn_name: '确认',wrapId:"ErrorAlertPannel"}, function(){
            //     var wPName = W('[name="product_name"]');
            //     wPName.val(recommend_title);
            //     return true;
            // });

            SelectedAttr.reverse();
            CountArr.push(1);
            CountArr.shift();

            var i = 0,
                kk = 1;
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

            // 价格cache
            var SelectedAttrPirceCache = null;
            var dataCache = oProductAttrDataCache[W('#addProductType').val()];
            if (dataCache && dataCache['price']) {
                SelectedAttrPirceCache = dataCache['price'];
            }
            // 属性组合白名单
            var whitelist = null;
            if (typeof product_attr_whitelist!=='undefined' && QW.ObjectH.isPlainObject(product_attr_whitelist)) {
                whitelist = product_attr_whitelist[W('#addProductType').val().split('_').pop()]
            }
            var White_AttrGroup = [];
            AttrGroup.forEach(function(item){
                // 遍历白名单，验证属性组合是否在白名单之中
                var in_white_flag = false;
                whitelist.forEach(function(witem){
                    // 当前属性组在白名单之内，则终止遍历
                    if (in_white_flag) {
                        return;
                    }
                    var attr_pos = 0;
                    var match_flag = true;
                    witem.split(',').forEach(function(attr_id){
                        if (!(item[attr_pos]['id'] == attr_id || attr_id==='*')) {
                            match_flag = false;
                        }
                        attr_pos++;
                    });
                    if (match_flag) {
                        in_white_flag = true;
                    }
                });
                // 若经上述验证，不在白名单之内，放弃当前item的处理，不加入White_AttrGroup
                if (!in_white_flag) {
                    return;
                }

                var combine_id = item.map(function(iSub){
                    return iSub['id'];
                }).join('');
                var ccc = false;
                if (SelectedAttrPirceCache) {
                    SelectedAttrPirceCache.forEach(function(pInfo){
                        if(pInfo['attr_id']==combine_id){
                            item.push(pInfo['price']);
                            ccc = true;
                        }
                    });                        
                }
                if (!ccc) {
                    item.push('');
                }
                White_AttrGroup.push(item);
            });

            // console.log(whitelist, AttrGroup, White_AttrGroup);

            setProductMultiAttrPriceTpl({
                'attrName': SelectedAttrName,
                'attrGroup': White_AttrGroup
            });
            W('.product-multiattr-block').slideUp();

        },
        // 重新选择属性组合
        '.product-multiattr-reselect-btn': function(e){
            e.preventDefault();

            setProductAttrDataCache();

            W('.product-multiattr-block').slideDown();
            W('.product-multiattr-price-block').removeNode();
        },
        // 选择商品分类
        'input[name="product_category[]"]': function(e){
            var wMe = W(this);

            var pos = wMe.previousSiblings(':checked').length;

            var p_k = wMe.val();
            var wTable = W('.product-attr-price');

            if (wMe.attr('checked')) {
                var p_name = wMe.nextSibling('span').html().trim();

                var wTr = wTable.query('tr'),
                    wLastTr = wTr.last(),
                    wLastTrClone = wLastTr.cloneNode(true),
                    wLastTrCloneTd = wLastTrClone.query('td');

                var params = {
                    'tr_data':{
                        'id': p_k,
                        'name': p_name
                    }
                };
                var tr_fn = W('#ProductAttrPriceTpl').html().trim().tmpl(),
                    tr_str = tr_fn(params);

                wTr.item(pos).insertSiblingAfter(tr_str);
            } else {
                if (wMe.siblings(':checked').length) {
                    wTable.query('tr[data-id="'+p_k+'"]').removeNode();
                } else {
                    alert('最少要选择1个分类');
                    e.preventDefault();
                }
            }
        },
        'div.btn-step':function(e){
            e.preventDefault();

            if (!setProductType()) {
                return ;
            }

            // 设置产品分类相关逻辑
            setProductAttr();

            setShangmenFeeStatus();

            W("#new_product_step1").hide();
            W("#new_product_step2").show();
            W('.new-product-step1').hide();
            W('.new-product-step2').show();
            W("#product_step").val(2);
        },
        'a.go-first':function(e){
        		e.preventDefault();
            setProductAttrDataCache();
            W("#new_product_step2").hide();
            W("#new_product_step1").show();
            W('.new-product-step2').hide();
            W('.new-product-step1').show();
        },
        'input.shangmen_weixiu':function(e){
            if(W(this).attr("checked")){
                // 如果可以书写商品价格才有价格面议项，否则隐藏
                if (W('[name^="product_price"]').length||W('.product-multiattr-block').length) {
                    W("#shangmenfei_wrap input").val('');
                    W("#shangmenfei_wrap").show();
                }
            }else{
                W("#shangmenfei_wrap").hide();
                W("#shangmenfei_wrap input").val(0);
            }
        },
        // 选择分类
        '.cate li':function(e){
            e.preventDefault();
            var me = W(this),
                id = me.attr('data-id'),
                grade = ~~me.attr('data-grade')+1;

            var html= '';

            me.ancestorNode('.cate').query('li').removeClass('curl');
            me.addClass('curl');

            if(grade>3){
                W('.select_type').html(W(".select-bg .cate li.curl").getHtmlAll().join(' > '));
                // W("#addProductType").val(W(".select-bg .cate li.curl").getAttrAll('data-id').join('_'))
                return;
            }
            getOneType(grade,id);
            
        },
        // 添加类目
        '.bod-nav-add': function(e){
            e.preventDefault();

            var wNavSelected = W('.bod-nav-selected');
            var wCurl = W(".select-bg .cate li.curl");
            var data_id = wCurl.getAttrAll('data-id').join('_');
            if (wNavSelected.isVisible()) {
                // 已经添加的类目数小于4个
                var wItem = wNavSelected.query('.bod-nav-selected-item');
                if(wItem.length<4){
                    if(!wItem.filter('[selecttype="'+data_id+'"]').length){
                        var selected_html = '<li class="bod-nav-selected-item" selecttype="'
                                + data_id + '">'
                                + '<span class="bod-nav-selected-item-txt">'
                                + wCurl.getHtmlAll().join(' > ')
                                + '</span><span class="bod-nav-selected-item-del">删除</span><span class="bod-nav-selected-item-top" style="display:none;">置顶</span></li>';
                        W('.bod-nav-selected-list').insertAdjacentHTML('beforeend', selected_html);
                        if (!W('.data-id-'+data_id).length) {
                            var inp_str = '<input type="hidden" name="classify_tag[]" class="data-id-'+data_id+'" value="'+data_id+'" >'
                                    + '<input type="hidden" name="classify_name[]" class="data-id-'+data_id+'" value="'+wCurl.getHtmlAll().join('_')+'" >';
                            W('#addProduct').insertAdjacentHTML('beforeend', inp_str);
                            W('#editProduct').insertAdjacentHTML('beforeend', inp_str);
                        }
                    }
                } else {
                    alert('最多只能添加4个类目！');
                }
            } else {
                wNavSelected.show();

                var selected_html = '<li class="bod-nav-selected-item" selecttype="'
                        + data_id + '">'
                        + '<span class="bod-nav-selected-item-txt">'
                        + wCurl.getHtmlAll().join(' > ')
                        + '</span><span class="bod-nav-selected-item-del">删除</span><span class="bod-nav-selected-item-top" style="display:none;">置顶</span></li>';
                W('.bod-nav-selected-list').insertAdjacentHTML('beforeend', selected_html);
                if (!W('.data-id-'+data_id).length) {
                    var inp_str = '<input type="hidden" name="classify_tag[]" class="data-id-'+data_id+'" value="'+data_id+'" >'
                            + '<input type="hidden" name="classify_name[]" class="data-id-'+data_id+'" value="'+wCurl.getHtmlAll().join('_')+'" >';
                    W('#addProduct').insertAdjacentHTML('beforeend', inp_str);
                    W('#editProduct').insertAdjacentHTML('beforeend', inp_str);
                }
            }
        },
        // 显示/隐藏“置顶”
        '.bod-nav-selected-item': {
            'mouseenter': function(e){
                var wMe = W(this);

                if (wMe.previousSibling('.bod-nav-selected-item').length) {
                    wMe.query('.bod-nav-selected-item-top').show();
                }
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.query('.bod-nav-selected-item-top').hide();
            }
        },
        // 删除类目
        '.bod-nav-selected-item-del': function(e){
            e.preventDefault();

            var wMe = W(this),
                wItem = wMe.parentNode('.bod-nav-selected-item');
            if (!wItem.siblings('.bod-nav-selected-item').length) {
                W('.bod-nav-selected').hide();
            }
            wItem.removeNode();
            W('.data-id-'+wItem.attr('selecttype')).removeNode();
        },
        // 置顶类目
        '.bod-nav-selected-item-top': function(e){
            e.preventDefault();

            var wMe = W(this),
                wItem = wMe.parentNode('.bod-nav-selected-item');

            wItem.previousSiblings('li').first().insertSiblingAfter(wItem);
            wItem.query('.bod-nav-selected-item-top').hide();
        },
        'input[type="text"]': {
            change: function(){
                window.onbeforeunload = function(){
                    return '离开后，填写的内容将会丢失';
                }
            }
        },
        '#addProduct a.btn-save1':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#addProduct')[0])){
                return false;
            }
            // 验证多属性组合价格填写的合法性
            if (!validMultiAttrPrice()) {
                return false;
            }

            W("#addProduct").attr("target","_self");
            document.addProduct.status.value = "display";
            W("#addProduct").attr("action","/mer_product/add");
            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }

            Ajax.post(W('#addProduct')[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
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
                         location.reload(true);
                    },3000);

                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            })
        },
        '#addProduct a.btn-save2':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#addProduct')[0])){
                return false;
            }

            // 验证多属性组合价格填写的合法性
            if (!validMultiAttrPrice()) {
                return false;
            }

            W("#addProduct").attr("target","_self");
            W("#addProduct").attr("action","/mer_product/add");
            
            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }
            document.addProduct.status.value = "off";
            Ajax.post(W('#addProduct')[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
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
                         location.reload(true);
                    },3000);
                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            })
        },
         '#addProduct a.btn-prew':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#addProduct')[0])){
                return false;
            }

            W("#addProduct").attr("target","_blank");
            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }

            document.addProduct.status.value = "display";
            W("#addProduct").attr("action","/mer_product/preview");
            document.addProduct.submit();
            
        },
         '#editProduct a.btn-prew':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#editProduct')[0])){
                return false;
            }
            
            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }

            W("#editProduct").attr("target","_blank");

            document.editProduct.status.value = "display";
            W("#editProduct").attr("action","/mer_product/preview");
            document.editProduct.submit();
            
        },
        '#editProduct a.btn-save1':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#editProduct')[0])){
                return false;
            }

            // 验证多属性组合价格填写的合法性
            if (!validMultiAttrPrice()) {
                return false;
            }

            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }
            W("#editProduct").attr("action","/mer_product/edit");
            document.editProduct.status.value = "display";
            Ajax.post(W('#editProduct')[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        return alert(ret.errmsg);
                    };
                    window.onbeforeunload = null;
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">修改商品成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410, 
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                            location.href="/mer_product/search";
                    });
                    setTimeout(function(){
                          location.href="/mer_product/search";
                    },3000);
                   
                    
                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            })
        },
        '#editProduct a.btn-save2':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#editProduct')[0])){
                return false;
            }
            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }
            W("#editProduct").attr("action","/mer_product/edit");
            document.editProduct.status.value = "display";
            Ajax.post(W('#editProduct')[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        return alert(ret.errmsg);
                    };
                    window.onbeforeunload = null;
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">修改商品成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410, 
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                            location.href="/mer_product/search";
                    });
                    setTimeout(function(){
                          location.href="/mer_product/search";
                    },3000);
                   
                    
                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            })
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
        }
    });    

    (function(){
        // 多商品属性，默认选择
        if (product_attr_list&&QW.ObjectH.isPlainObject(product_attr_list)) {
            var classify = W('#addProductType').val();
            oProductAttrDataCache[classify] = {
                'cate': product_attr_list,
                'price':product_attr_info
            };

            setProductAttr();
            W('.product-multiattr-select-confirm-btn').click();
        }
    }());

});