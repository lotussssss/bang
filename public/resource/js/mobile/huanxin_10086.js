$(function(){
    var CurProductAttrHash;

    tcb.bindEvent(document.body, {
        // 立即换新
        '.js-liji-huanxin': function(e){

            var $me = $(this);
            if ($me.attr('data-redirect')){
                return ;
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

            var url_query = $.queryUrl(window.location.search);
            var redirect_url = tcb.setUrl( window.location.protocol+'//'+'m.'+window.location.hostname+'/youpin/product', {
                'product_id': pid,
                'from_hdhx': from,
                '_from': url_query['_from'],
                '_hash': $.param(tcb.parseHash(url_hash))
            });
            window.location.href = tcb.setUrl( redirect_url, window.__MUST_PASS_PARAMS||{} );
            return;

            var request_url = tcb.setUrl('/youpin/product', {
                'product_id': pid,
                'ajax': '1'
            });
            $.getJSON(request_url, function(res){
                //console.log(res);

                var selectedAttr = res['result']['product_attr'],
                    AttrGroup = [],
                    AttrList = [],
                    show_price, real_price;

                var product_attr_hash = res['result']['attr_combine'],
                    product_attr_price_hash = res['result']['attr_combine_price'];
                $.each(product_attr_hash, function(k,v){
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
                $.each(res['result']['model_attr'], function(k, v){
                    var AttrList_sub = [];
                    switch (v['name']){
                        // 颜色
                        case '颜色':
                            product_attr_color = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            $.each(v['attr'], function(kk, vv){
                                var color_img = 'https://p.ssl.qhimg.com/t015aff832d43be7134.png';
                                if (vv=='灰色') {
                                    vv = '深空灰';
                                    color_img = 'https://p.ssl.qhimg.com/t01b7a462b8b1dd22a7.png';
                                }
                                if (vv=='黑色') {
                                    color_img = 'https://p.ssl.qhimg.com/t01cfdd766e6ad4ba75.png';
                                }
                                if (vv=='金色') {
                                    color_img = 'https://p.ssl.qhimg.com/t015aff832d43be7134.png';
                                }
                                if (vv=='银色') {
                                    color_img = 'https://p.ssl.qhimg.com/t0182ce4f7ce773b011.png';
                                }
                                if (vv=='白色') {
                                    color_img = 'https://p.ssl.qhimg.com/t015e06ece9297f590a.png';
                                }
                                if (vv=='粉色') {
                                    color_img = 'https://p.ssl.qhimg.com/t014b734b4dbb07b1cc.png';
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
                            $.each(v['attr'], function(kk, vv){
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
                            $.each(v['attr'], function(kk, vv){
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
                            $.each(v['attr'], function(kk, vv){
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

                var img = img_name ? img_name : 'https://p.ssl.qhimg.com/t01e6226d691579c643.png';

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
                var content_html = $.tmpl($('#JsMHuanxinProductSelectTpl').html())(param_data);
                tcb.showDialog(content_html);
                //showPanel(param_data);

                setProductAttrUi(selectedAttr, AttrGroup, AttrList);
            });
        },
        // 选择商品属性
        '.product-attr .item a': function(e){
            e.preventDefault();

            var $me = $(this),
                $cnt = $me.closest('.cnt');

            //if ($me.hasClass('disabled')) {
            //    return ;
            //}

            $cnt.find('.item a').removeClass('cur');
            $me.addClass('cur');

            // 设置属性组合商品id
            setProductId();
        },
        // 去回收页面评估旧机，换新机
        '.goto-huanxinji-btn': function(e){
            e.preventDefault();

            var $me = $(this),
                url_hash = $me.attr('href'),
                pid = $me.attr('data-pid');

            if (!pid){
                tcb.errorBlink($('.product-attr .item a'));
                return;
            }

            var from = window.FROM || '10086';

            var url_query = $.queryUrl(window.location.search);
            var redirect_url = tcb.setUrl('/m/hs', {
                'newproductid': pid,
                'from': from,
                '_from': url_query['_from']
            }),
                hash_query = $.param(tcb.parseHash(url_hash));

            if (hash_query) {
                redirect_url = redirect_url+'#'+hash_query;
            }
            window.location.href = redirect_url;
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
            AttrGroup_itemstr = $.map(AttrGroup, function (item) {
                return item.join('');
            });

        var selectedAttr2 = arrCombinedSequence(selectedAttr);
        $.each(AttrList, function(i, item){
            SelectableAttr[i] = [];

            $.each(item, function(i2, item2){
                $.each(selectedAttr2, function(si, sitem){
                    var temp_arr = [];

                    temp_arr = temp_arr.concat(sitem.slice(0, i), item2, sitem.slice(i+1));

                    if (tcb.arrContains(AttrGroup_itemstr, temp_arr.join('')) && !tcb.arrContains(SelectableAttr[i],item2)) {
                        SelectableAttr[i].push(item2);
                    }
                });
            });
        });
        // console.log(AttrGroup);

        var wPCate = $('.product-attr-line');
        wPCate.forEach(function(el, i){
            var $line = $(el),
                pos = parseInt($line.attr('data-pos'), 10);
            $(el).find('.item a').forEach(function(el){
                var wItem = $(el),
                    attr_id = wItem.attr('data-attrid');
                wItem.removeClass('cur').removeClass('disabled').removeClass('disabled-hover');// 移除状态
                // 设置那些不能被选择的属性
                if (!tcb.arrContains(SelectableAttr[pos], attr_id)) {
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
            TwoDimArr_safe = [],
            cc = 1; // 转换后的二维数组的数组长度

        $.each(TwoDimArr, function(i, arr){
            TwoDimArr_safe.push((arr instanceof Array) ? arr : [arr]);
        });

        $.each(TwoDimArr_safe, function(i, arr){
            cc = cc*arr.length;
        });

        var kk = 1;
        $.each(TwoDimArr_safe, function(i, arr){
            var len = arr.length;
            cc = cc/len;
            if (i==0) {
                $.each(arr, function(x, item){
                    for(var j=0; j<cc; j++){
                        ConvertedArr.push([item]);
                    }
                });
            } else {
                var pos = 0;
                for(var k=0; k<kk; k++){
                    $.each(arr, function(x, item){
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
        $('.product-attr-line').each(function(i, el){
            var $me = $(el),
                pos = parseInt($me.attr('data-pos'), 10),
                attrid = $me.find('.cur').attr('data-attrid');

            attr[pos] = attrid;
        });

        var $btn = $('.goto-huanxinji-btn'),
            attr_key = attr.join(','), show_price, real_price;
        show_price = CurProductAttrHash[attr_key]['show_price'];
        real_price = CurProductAttrHash[attr_key]['real_price'];

        $('.dialog-wrap .show-price').html('￥'+show_price);
        $('.dialog-wrap .real-price').html('京东价￥'+real_price);

        pid = CurProductAttrHash[attr_key]['product_id'];
        pid = pid?pid:'';
        $btn.attr('data-pid', pid);
    }
});