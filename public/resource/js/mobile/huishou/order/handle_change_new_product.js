// 处理更换新机
!function (global) {
    var
        Root = tcb.getRoot (),
        o = Root.Order

    o.handle = o.handle || {}

    tcb.mix (o.handle, {

        initChangeNewProduct : initChangeNewProduct
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    function initChangeNewProduct(){

        __bindEvent()
    }


    // =================================================================
    // 私有接口 private
    // =================================================================


    function __bindEvent(){
        var
            $Target = o.getDoc ()

        tcb.bindEvent ($Target[ 0 ], {

            // 修改需要换新的机器
            '.js-change-newproduct': function(e) {
                e.preventDefault();

                var
                    NewProductList = window.__NewProductList

                if ( !(NewProductList && NewProductList.length) ) {
                    return
                }

                var
                    product_list = []
                $.each(NewProductList, function (i, item) {
                    product_list.push({
                        'pid': item['show_info']['product_id'],
                        'name': item['show_info']['title'],
                        'img': item['show_info']['img_url_m'],
                        'price': item['price_diff']
                    })
                })

                var
                    html_str = $.tmpl ($.trim ($ ('#JsMHuanXinNewProductListTpl').html ())) ({
                        'product_list' : product_list
                    })
                tcb.showDialog(html_str, {
                    className: 'm-huanxin-new-product-list-wrap',
                    middle : true
                })
            },
            // 立即换新
            '.js-liji-huanxin': function(e){
                e.preventDefault();

                var
                    $me = $(this)

                var
                    pid = $me.attr('data-id'),
                    url_hash = $me.attr('href'),
                    product_title = $me.attr('data-title'),
                    img_name = $me.attr('data-img')

                if (!pid) {
                    return
                }
                var
                    request_url = tcb.setUrl ('/youpin/product', {
                        'product_id' : pid,
                        'ajax'       : '1'
                    })
                $.getJSON(request_url, function(res){
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
                    })
                    CurProductAttrHash = product_attr_hash;
                    show_price = product_attr_price_hash[selectedAttr.join(',')]['show_price'];
                    real_price = product_attr_price_hash[selectedAttr.join(',')]['real_price'];

                    var
                        product_attr_storage,
                        product_attr_color,
                        product_attr_net,
                        product_attr_channel
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
                                var color_hash = {
                                    '灰色': ['https://p.ssl.qhimg.com/t01b7a462b8b1dd22a7.png', '深空灰'],
                                    '黑色': ['https://p.ssl.qhimg.com/t01cfdd766e6ad4ba75.png', '黑色'],
                                    '金色': ['https://p.ssl.qhimg.com/t015aff832d43be7134.png', '金色'],
                                    '银色': ['https://p.ssl.qhimg.com/t0182ce4f7ce773b011.png', '银色'],
                                    '白色': ['https://p.ssl.qhimg.com/t015e06ece9297f590a.png', '白色'],
                                    '粉色': ['https://p.ssl.qhimg.com/t014b734b4dbb07b1cc.png', '粉色'],
                                    '蓝色': ['https://p.ssl.qhimg.com/t0117c6bb967cc3c870.png', '蓝色'],
                                    '绿色': ['https://p.ssl.qhimg.com/t01902e76cea14ead02.png', '绿色']
                                };
                                $.each(v['attr'], function(kk, vv){
                                    var color_img  = 'https://p.ssl.qhimg.com/t015aff832d43be7134.png',
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
                    })

                    var img = img_name ? img_name : 'https://p.ssl.qhimg.com/t01e6226d691579c643.png';

                    var
                        param_data = {
                            'img'                  : img,
                            'url_hash'             : url_hash,
                            'product_id'           : pid,
                            'show_price'           : show_price,
                            'real_price'           : real_price,
                            'product_title'        : product_title,
                            'product_attr_storage' : product_attr_storage,
                            'product_attr_color'   : product_attr_color,
                            'product_attr_net'     : product_attr_net,
                            'product_attr_channel' : product_attr_channel
                        }
                    var
                        content_html = $.tmpl ($ ('#JsMHuanXinNewProductDetailTpl').html ()) (param_data)

                    tcb.closeDialog()

                    tcb.showDialog(content_html, {
                        className: 'm-huanxin-new-product-detail-wrap',
                        middle : true
                    })

                    __setProductAttrUi(selectedAttr, AttrGroup, AttrList)
                });
            },

            // 选择商品属性
            '.product-attr .item a': function(e){
                e.preventDefault();

                var
                    $me = $(this),
                    $cnt = $me.closest('.cnt')

                $cnt.find('.item a').removeClass('cur')
                $me.addClass('cur')

                // 设置属性组合商品id
                __setProductId()
            },

            // 去回收页面评估旧机，换新机
            '.goto-huanxinji-btn': function(e){
                e.preventDefault()

                var
                    $me = $(this),
                    url_hash = $me.attr('href'),
                    pid = $me.attr('data-pid')

                if (!pid){
                    tcb.errorBlink($('.product-attr .item a'))
                    return
                }

                // 根据当前URL和选中newproductid，修改URL地址，直接跳转到新的地址
                // 此处只能用tcb.setUrl，不能用tcb.setUrl2
                var
                    redirect_url = tcb.setUrl (window.location.href, {
                        'newproductid' : pid
                    })

                redirect_url = redirect_url.replace (/%2C/ig, ',')

                window.location.href = redirect_url
            }

        })

    }


    var CurProductAttrHash
    /**
     * 设置商品属性的ui状态
     * @param selectedAttr 当前选择商品属性
     * @param AttrGroup 所有可用属性组
     * @param AttrList 属性列表
     */
    function __setProductAttrUi(selectedAttr, AttrGroup, AttrList){
        var SelectableAttr = [],
            AttrGroup_itemstr = $.map(AttrGroup, function (item) {
                return item.join('')
            });

        var selectedAttr2 = __arrCombinedSequence(selectedAttr)
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
    function __arrCombinedSequence(TwoDimArr){
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
    function __setProductId(){
        var
            pid = '',
            attr = [ '', '', '', '' ]

        $ ('.product-attr-line').each (function (i, el) {
            var
                $me = $ (el),
                pos = parseInt ($me.attr ('data-pos'), 10),
                attr_id = $me.find ('.cur').attr ('data-attrid')

            attr[ pos ] = attr_id;
        })

        var
            $btn = $ ('.goto-huanxinji-btn'),
            attr_key = attr.join (','),
            show_price,
            real_price

        show_price = CurProductAttrHash[ attr_key ][ 'show_price' ]
        real_price = CurProductAttrHash[ attr_key ][ 'real_price' ]

        $ ('.dialog-wrap .show-price').html ('￥' + show_price)
        $ ('.dialog-wrap .real-price').html ('京东价￥' + real_price)

        pid = CurProductAttrHash[ attr_key ][ 'product_id' ]
        pid = pid ? pid : ''
        $btn.attr ('data-pid', pid)
    }


} (this)