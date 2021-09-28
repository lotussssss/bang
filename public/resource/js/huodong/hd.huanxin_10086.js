Dom.ready(function(){
    var CurProductAttrHash,
        ObjPanel;

    tcb.bindEvent(document.body, {
        // 立即换新
        '.js-liji-huanxin': function(e){

            var $me = W(this);
            if ($me.attr('data-redirect')){
                return;
            } else {

                e.preventDefault();
            }

            var pid = $me.attr('data-id'),
                url_hash = $me.attr('href'),
                product_title = $me.attr('data-title'),
                img_name = $me.attr('data-img');

            if (!pid) {
                return ;
            }

            var from = window.FROM || '10086';

            var url_query = tcb.queryUrl(window.location.search);
            var redirect_url = tcb.setUrl('/youpin/product', {
                'product_id': pid,
                'from_hdhx': from,
                '_from': url_query['_from'],
                '_hash': QW.ObjectH.encodeURIJson(tcb.parseHash(url_hash))
            });

            //console.log(redirect_url);return;
            window.location.href = redirect_url;

            return;


            var request_url = tcb.setUrl('/youpin/product', {
                'product_id': pid,
                'ajax': '1'
            });
            QW.Ajax.get(request_url, function(res){
                res = QW.JSON.parse(res);
                //console.log(res);

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

                    switch (v['name']){
                        // 颜色
                        case '颜色':
                            product_attr_color = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            QW.ObjectH.map(v['attr'], function(vv, kk){
                                var color_img = 'https://p.ssl.qhimg.com/t01e09d5b06bf3e5b23.jpg';
                                if (vv=='灰色') {
                                    vv = '深空灰';
                                    color_img = 'https://p.ssl.qhimg.com/t01ac5eb2a592100755.jpg';
                                }
                                if (vv=='黑色') {
                                    color_img = 'https://p.ssl.qhimg.com/t01a02895aa5f484340.jpg';
                                }
                                if (vv=='金色') {
                                    color_img = 'https://p.ssl.qhimg.com/t01a02895aa5f484340.jpg';
                                }
                                if (vv=='银色') {
                                    color_img = 'https://p.ssl.qhimg.com/t01ffbf2f745362ed37.jpg';
                                }
                                if (vv=='白色') {
                                    color_img = 'https://p.ssl.qhimg.com/t01f87f5a81cf2c7cb6.jpg';
                                }
                                if (vv=='粉色') {
                                    color_img = 'https://p.ssl.qhimg.com/t014340d2d2333af144.jpg';
                                }

                                product_attr_color['attr'].push({
                                    'val':kk,
                                    'txt': vv,
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

                var content_html = W('#JsHuanxinProductSelectTpl').html().trim().tmpl()(param_data);

                var config = {
                    //width:710,
                    //height:510,
                    withMask: true,
                    //dragable: true,
                    className: 'dialog-wrap'// border8-panel pngfix
                };
                ObjPanel = tcb.panel('', content_html, config);

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
                url_hash = $me.attr('href'),
                pid = $me.attr('data-pid');

            if (!pid){
                tcb.errorBlink(W('.product-attr .item a'));
                return;
            }

            var from = window.FROM||'10086';

            var url_query = tcb.queryUrl(window.location.search);
            var redirect_url = tcb.setUrl('/huishou', {
                    'newproductid': pid,
                    'from': from,
                    '_from': url_query['_from']
                }),
                hash_query = QW.ObjectH.encodeURIJson(tcb.parseHash(url_hash));

            if (hash_query) {
                redirect_url = redirect_url+'#'+hash_query;
            }
            window.location.href = redirect_url;
        },
        '.dialog-close': function(e){
            e.preventDefault();

            ObjPanel.hide();
        }
    });

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
        // console.log(AttrGroup);

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

});
