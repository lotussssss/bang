// 试用商品详情
$(function(){
    // 商品页面
    var $PageProduct = $('.page-shiyong-product');
    if (!$PageProduct.length){
        return;
    }

    // 商品属性选择
    (function(){
        // 商品id
        var product_id = window.product_id;
        if (!product_id) {
            try{
                console.error('商品id为空，无能为力');
            } catch (ex){}
            return ;
        }
        var product_attr_list = window.product_attr_list||[]; // 所有商品的属性组合
        var product_attr; // 当前商品的属性
        var model_attr = window.model_attr||[]; // 当前型号下已有商品的属性

        var ProductIdMap,
            AttrGroup, // 所有存在的属性组合
            AttrList; // 显示的属性列表

        // 处理商品属性组合到合适的格式
        function dealProductAttrList(product_attr_list){
            var product_attr_list_temp = [],
                cur_product_attr,
                product_id_map = {};
            for(var i=0; i<product_attr_list.length; i++){
                // 处理属性组合为格式：[[1,2,3],[4,5,6],[]...]
                var _attr_val = [];
                for(var ii=0; ii<product_attr_list[i]['sku_group_detail'].length; ii++){
                    _attr_val.push(product_attr_list[i]['sku_group_detail'][ii]['attr_value']);
                }
                product_attr_list_temp.push(_attr_val);

                // 获取当前商品的属性组
                if (product_attr_list[i]['product_id']==product_id){
                    cur_product_attr = _attr_val;
                }

                product_id_map[_attr_val.join(',')] = product_attr_list[i]['product_id'];
            }

            return [product_attr_list_temp, cur_product_attr, product_id_map];
        }

        product_attr_list = dealProductAttrList(product_attr_list);
        product_attr = product_attr_list[1];
        AttrGroup = product_attr_list[0];
        ProductIdMap = product_attr_list[2];

        // 处理型号的属性到合适的格式
        function dealModelAttr(model_attr){
            var ret = [];
            for(var i=0; i<model_attr.length; i++){
                ret.push(model_attr[i]['attr_value']);
            }
            return ret;
        }
        AttrList = dealModelAttr(model_attr);

        setProductAttrUi(product_attr, AttrGroup, AttrList);
        /**
         * 设置商品属性的ui状态
         * @param selectedAttr 被设置的属性组
         * @param AttrGroup 所有存在的属性组合
         * @param AttrList 显示的属性列表
         */
        function setProductAttrUi(selectedAttr, AttrGroup, AttrList){
            if ( !(selectedAttr && selectedAttr.length) ){
                // 没有默认被选中的属性组，直接退出
                return ;
            }
            var SelectableAttr = [],
                AttrGroup_itemstr = $.map(AttrGroup, function(item){return item.join(',');});

            var selectedAttr2 = arrCombinedSequence(selectedAttr);
            for(var i=0;i<AttrList.length;i++) {
                SelectableAttr[i] = [];

                var item = AttrList[i];
                for(var i2=0; i2<item.length; i2++){
                    var item2 = item[i2];

                    for(var i3=0; i3<selectedAttr2.length; i3++) {
                        var sitem = selectedAttr2[i3];

                        var temp_arr = [];

                        temp_arr = temp_arr.concat(sitem.slice(0, i), item2, sitem.slice(i+1));

                        if ($.inArray(temp_arr.join(','), AttrGroup_itemstr)>-1 && $.inArray(item2, SelectableAttr[i])==-1) {
                            SelectableAttr[i].push(item2);
                        }
                    }
                }
            }

            var wPCate = $('.prd-price-attr');
            wPCate.each(function(i){
                $(this).find('.p-c-item').each(function(ii){
                    var wItem = $(this),
                        attr_id = wItem.attr('data-id');
                    wItem.removeClass('p-c-curr').removeClass('p-c-disabled').removeClass('p-c-disabled-hover');// 移除状态
                    // 设置那些不能被选择的属性
                    if ($.inArray(attr_id, SelectableAttr[i])==-1) {
                        wItem.addClass('p-c-disabled');
                    } else {
                        wItem.removeClass('p-c-disabled');
                    }

                    if(attr_id === selectedAttr[i]){
                        wItem.addClass('p-c-curr');
                    }
                });
            });
        }
        /**
         * 将数组转换成组合序列
         *
         * @param TwoDimArr  二维数组
         * @returns {Array}
         */
        function arrCombinedSequence(TwoDimArr){
            var ConvertedArr = [], // 转换后的二维数组
                cc = 1; // 转换后的二维数组的数组长度，默认设置为1

            // TwoDimArr不是数组，直接返回空数组
            if (!(TwoDimArr instanceof Array)){
                return [];
            }
            var TwoDimArr_safe = []; // 拷贝一个新的安全数组，不破坏TwoDimArr原有结构
            for(var i=0; i<TwoDimArr.length; i++){
                if ( !(TwoDimArr[i] instanceof Array) ) {
                    TwoDimArr_safe[i] = [TwoDimArr[i].toString()];
                } else {
                    TwoDimArr_safe[i] = TwoDimArr[i];
                }

                cc = cc*TwoDimArr_safe[i].length; // 转换后的数组长度是子数组的长度之积
            }

            var kk = 1;
            $.each(TwoDimArr_safe, function(i, arr){
                var len = arr.length;
                cc = cc/len;
                if (i==0) {
                    $.each(arr, function(ii, item){
                        for(var j=0; j<cc; j++){
                            ConvertedArr.push([item]);
                        }
                    });
                } else {
                    var pos = 0;
                    for(var k=0; k<kk; k++){
                        $.each(arr, function(ii, item){
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


        tcb.bindEvent(document.body, {
            // 属性点击的交互事件
            '.prd-price-attr .p-c-item': function(e){
                e.preventDefault();
                var wMe = $(this);

                // 当前已经选中的属性 点击无效
                if (wMe.hasClass('p-c-curr')) {
                    return;
                }

                var cur_attr = wMe.attr('data-id'),
                    cur_attr_line = wMe.closest('.prd-price-attr')[0],
                    cur_line_pos = 0;

                var wAttrLine = $('.prd-price-attr');

                // 获取当前点击行的位置
                wAttrLine.each(function(i, el){
                    if (cur_attr_line==el) {
                        cur_line_pos = i;
                    }
                });

                var filtered_attrgroup = [], // 筛选出包含当前点击属性的那部分数组
                    attrgroup_counter = [];  // 相同重合次数统计数组
                $.each(AttrGroup, function(i, item){
                    // 在所有已有的属性组中，筛选出包含当前点击属性的那部分数组
                    if (item[cur_line_pos]==cur_attr) {
                        var counter = 0;
                        wAttrLine.each(function(ii, el){
                            var wAttrItem = $(el).find('.p-c-item');
                            // 遍历到当前行，直接跳过不用处理
                            if (ii==cur_line_pos) {
                                return;
                            }
                            if (wAttrItem.filter('.p-c-curr').attr('data-id') == item[ii]) {
                                counter++;
                            }
                        });
                        attrgroup_counter.push(counter);
                        filtered_attrgroup.push(item);
                    }
                });

                var max_counter = Math.max.apply(Math, attrgroup_counter),
                    max_counter_pos = $.inArray(max_counter, attrgroup_counter); // 取最大数字的第一个位置

                var best_match_attrgroup = filtered_attrgroup[max_counter_pos], // 最佳匹配组
                    selected_attrgroup = [];
                wAttrLine.each(function(i, el){
                    var wCur = $(el).find('.p-c-curr');
                    if (wCur.attr('data-id')!=best_match_attrgroup[i] && cur_line_pos!=i) {
                        selected_attrgroup[i] = [];
                        $(el).find('.p-c-item').each(function(){
                            selected_attrgroup[i].push($(this).attr('data-id'));
                        });
                    } else {
                        selected_attrgroup[i] = best_match_attrgroup[i];
                    }
                });

                // console.log(selected_attrgroup)
                setProductAttrUi(selected_attrgroup, AttrGroup, AttrList);

                var attr_arr = [];
                wAttrLine.find('.p-c-curr').each(function(i){
                    attr_arr[i] = $(this).attr('data-id');
                });

                var product_id = ProductIdMap[attr_arr.join(',')];
                if (product_id) {
                    window.location.href = tcb.setUrl(window.location.href, {
                        "product_id": product_id
                    });
                }
            },
            // 不可选属性的mouse交互
            '.prd-price-attr .p-c-disabled': {
                'mouseenter': function(e){
                    $(this).addClass('p-c-disabled-hover');
                },
                'mouseleave': function(e){
                    $(this).removeClass('p-c-disabled-hover');
                }
            }

        });

    }());
    // 商品图片交互效果（图片宽高自适应、放大镜、切换大小图等）
    (function(){
        var wImgShower  = $('.p-pic-shower'),
            mouse_pointer = {'left':0, 'top':0},
            zoom_ratio = 2,// 放大倍数
            cover_size = wImgShower.innerWidth()/zoom_ratio, // 图片容器的宽度减去左右边框（默认无padding，不做减去padding的处理）
            cover_size_half = cover_size/2; // cover宽高半数

        tcb.bindEvent(document.body, {
            // 详情页照片切换
            '.product-pics .p-pic-item': {
                'mouseenter': function(e){
                    e.preventDefault();

                    var wMe = $(this),
                        wMeImg = wMe.find('img'),
                        wMeImg_size = {'width':wMeImg.width(), 'height': wMeImg.height()},
                        img_big_src  = wMe.attr('data-big'),
                        img_orig_src = wMe.attr('data-origsrc');

                    wMe.addClass('p-pic-curr').siblings('.p-pic-curr').removeClass('p-pic-curr');

                    var wImgShower = $('.p-pic-shower'),
                        wImgbig = wImgShower.find('img');
                    wImgbig.attr('src', img_big_src);
                    wImgShower.attr('data-origsrc', img_orig_src);

                    var w, h;
                    if (wMeImg_size['width']>wMeImg_size['height']) {
                        w = 350;
                        h = 'auto';
                    } else {
                        w = 'auto';
                        h = 350;
                    }

                    wImgbig.css({
                        'width' : w,
                        'height': h
                    });

                    // 图片加载完成后。。。
                    tcb.imageOnload(img_big_src, function(){
                        // 使用setTimeout来保证低版本ie，无法及时获取图片新的高宽
                        setTimeout(function(){

                            // 切换大图的时候，重新获取图片高宽位置信息
                            resetBigimgRect();

                        }, 1);
                    });
                }
            },
            // 大图的放大镜效果
            '.p-pic-shower': {
                'mouseenter': imgZoom,
                'mouseleave': function(e){
                    imgZoomCoverHide();
                    imgZoomBiggerHide();
                },
                'mousemove' : imgZoom
            }
        });
        $(window).on('resize', autoFixedElementRect);
        // 自动修复元素rect的变化
        function autoFixedElementRect(){
            // 设置商品大图容器在文档中的位置
            resetShowerRect();
            // 设置商品大图在文档中的位置
            resetBigimgRect();
        }


        // 图片放大镜
        function imgZoom(e){
            // 当前的鼠标位置
            mouse_pointer = {'left':e.pageX, 'top':e.pageY};

            var shower_rect = getShowerRect(),
                bigimg_rect = getBigimgRect();

            // 鼠标超出图片的范围
            if ( (mouse_pointer['left']<bigimg_rect['left'])
                || (mouse_pointer['top']<bigimg_rect['top'])
                || ( mouse_pointer['left']>(bigimg_rect['left']+bigimg_rect['width']) )
                || ( mouse_pointer['top']>(bigimg_rect['top']+bigimg_rect['height']) ) ){

                imgZoomCoverHide();
                imgZoomBiggerHide();
                return ;
            }

            var bigimg_left_offset = bigimg_rect['left']-shower_rect['left']-1,
                bigimg_top_offset  = bigimg_rect['top'] -shower_rect['top']-1;

            // 鼠标距离图片边界的偏移量值
            var left_offset = mouse_pointer['left'] - bigimg_rect['left'],
                top_offset  = mouse_pointer['top'] - bigimg_rect['top'];

            // cover图片的绝对定位位置
            var cover_left = bigimg_left_offset,
                cover_top  = bigimg_top_offset;
            // 左偏移量
            if (left_offset>cover_size_half) {
                cover_left += left_offset - cover_size_half;
            }
            // 上偏移量
            if (top_offset>cover_size_half) {
                cover_top += top_offset - cover_size_half;
            }

            var cover_left_critical = bigimg_rect['left']-shower_rect['left']+bigimg_rect['width']-cover_size,
                cover_top_critical  = bigimg_rect['top']-shower_rect['top']+bigimg_rect['height']-cover_size;
            if (cover_left>cover_left_critical){
                cover_left = cover_left_critical;
            }
            if (cover_top>cover_top_critical){
                cover_top = cover_top_critical;
            }

            imgZoomCoverShow(cover_size, cover_size, cover_top, cover_left);

            //imgZoomBiggerShow(W(this).query('img').attr('src'));
            imgZoomBiggerShow($(this).attr('data-origsrc'));
        }

        // 展示放大镜大图
        function imgZoomBiggerShow(big_src){
            var wImgZoomBigger = $('#ImgZoomBigger');

            // 商品大图相关尺寸信息
            var bigimg_rect = getBigimgRect(),
                bigger_show_size = bigimg_rect['width'];
            if (bigimg_rect['width']<bigimg_rect['height']) {
                bigger_show_size = bigimg_rect['height'];
            }

            if (!wImgZoomBigger.length) {

                var bigger_show_html = '<div class="img-zoom-bigger" id="ImgZoomBigger" style="'
                    +'width: '+bigger_show_size+'px;height: '+bigger_show_size+'px; overflow: hidden;">'
                    +'<img src="'+big_src+'" alt="" style="'
                    +'width:'+(bigimg_rect['width']*zoom_ratio)+'px;height:'+(bigimg_rect['height']*zoom_ratio)+'px;"/></div>';
                wImgZoomBigger = $(bigger_show_html);
                wImgZoomBigger.appendTo($('.product-pics')[0]);
            }
            wImgZoomBigger.show();

            var zoomcover_offset = getZoomCoverOffset();

            var scroll_top  = (zoomcover_offset['top']-bigimg_rect['top'])*zoom_ratio,
                scroll_left = (zoomcover_offset['left']-bigimg_rect['left'])*zoom_ratio;

            // 设置大图对应放大镜的位置
            wImgZoomBigger[0].scrollTop  = scroll_top;
            wImgZoomBigger[0].scrollLeft = scroll_left;
        }
        // 隐藏放大镜大图
        function imgZoomBiggerHide(){
            var wImgZoomBigger = $('#ImgZoomBigger');
            if (wImgZoomBigger.length) {

                wImgZoomBigger.remove();
            }
        }

        // 放大镜位置标识块显示
        function imgZoomCoverShow(width, height, top, left){
            var wImgZoomCover = $('#ImgZoomCover');
            if (!wImgZoomCover.length) {
                wImgZoomCover = $('<div class="img-zoom-cover" id="ImgZoomCover"></div>');
                wImgZoomCover.appendTo($('.p-pic-shower')[0]);
            }
            wImgZoomCover.show();

            wImgZoomCover.css({
                'position': 'absolute',
                'width' : width,
                'height': height,
                'top': top,
                'left': left
            });
        }
        // 放大镜位置标识块隐藏
        function imgZoomCoverHide(){
            var wImgZoomCover = $('#ImgZoomCover');
            if (wImgZoomCover.length) {

                wImgZoomCover.remove();
            }
        }
        // 获取放大镜在文档中的位置
        function getZoomCoverOffset(){
            var wImgZoomCover = $('#ImgZoomCover');
            if (!wImgZoomCover.length) {
                return ;
            }

            return wImgZoomCover.offset();
        }

        // 设置商品大图容器在文档中的位置
        function resetShowerRect(){
            var shower_rect = window.shower_rect = window.shower_rect || {
                'width': 0,
                'height': 0,
                'left': 0,
                'top': 0
            };

            var wImgShower = $('.p-pic-shower'),
                wImgShower_offset = wImgShower.offset();

            shower_rect['left'] = wImgShower_offset['left'];
            shower_rect['top']  = wImgShower_offset['top'];

            shower_rect['width']  = wImgShower.width();
            shower_rect['height'] = wImgShower.height();

            return shower_rect;
        }
        // 获取商品大图容器在文档中的位置
        function getShowerRect(){
            var shower_rect = window.shower_rect;
            if (typeof shower_rect=='undefined') {
                shower_rect = resetShowerRect();
            }

            return shower_rect;
        }

        // 设置商品大图在文档中的位置
        function resetBigimgRect(){
            var bigimg_rect = window.bigimg_rect = window.bigimg_rect || {
                'width': 0,
                'height': 0,
                'left': 0,
                'top': 0
            };

            var wImg = $('.p-pic-shower img'),
                wImg_offset = wImg.offset();

            bigimg_rect['left'] = wImg_offset['left'];
            bigimg_rect['top']  = wImg_offset['top'];

            bigimg_rect['width']  = wImg.width();
            bigimg_rect['height'] = wImg.height();

            return bigimg_rect;
        }
        // 获取商品大图容器在文档中的位置
        function getBigimgRect(){
            var bigimg_rect = window.bigimg_rect;
            if (typeof bigimg_rect=='undefined') {
                bigimg_rect = resetBigimgRect();
            }

            return bigimg_rect;
        }

        tcb.setImgElSize($('.p-pic-item img'), 54, 54); // 设置小图宽高
        tcb.setImgElSize($('.p-pic-shower img'), 350, 350); // 设置大图宽高

    }());

    // 其他
    (function(){

        // 设置相关商品图片尺寸
        tcb.setImgElSize($('.product-relation-list img'), 114, 114);

        tcb.bindEvent(document.body, {
            // 切换商品属性tab
            '.product-tab .p-tab-item': function(e){
                e.preventDefault();

                var wMe = $(this);

                wMe.addClass('p-tab-curr').siblings('.p-tab-curr').removeClass('p-tab-curr');
                var rel = wMe.attr('data-rel'),
                    wShow = $('.product-content .p-cnt-item').hide().filter('[data-for="'+rel+'"]');
                wShow.show();
            },
            // 切换使用时间
            '[name="treaty_day"]': {
                change: function(e){
                    var $me = $(this),
                        val = $me.val();

                    var $fee = $('.treaty-fee');

                    $fee.html( '￥'+$fee.attr('data-perday')*val );

                    var $buy = $('.prd-buy'),
                        order_url = $buy.attr('href');
                    $buy.attr('href', tcb.setUrl(order_url, {
                        'treaty_day': val
                    }));
                }
            }

        });

    }());
});
// END