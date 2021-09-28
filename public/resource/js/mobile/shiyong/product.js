// 试用商品详情
$(function(){
    // 商品页面
    var $PageProduct = $('.page-shiyong-product');
    if (!$PageProduct.length){
        return;
    }

    // 图片滑动+查看大图
    (function(){
        var $slideWrap = $('.slide-shower-wrap');
        if(!$slideWrap.length){
            return ;
        }

        // 图片滑动+查看大图
        function productImgSlideAndBigshow(){
            var $slideWrap = $('.slide-shower-wrap'),
                $sitem = $slideWrap.find('.s-item'),
                $nav = $slideWrap.find('.slide-nav'),
                $nitem;

            if(!$sitem.length){
                return;
            }

            if($nav.length){
                $nitem= $nav.children();

                if(!$nitem.length){
                    var nav_item_str = '';
                    for(var i=0; i<$sitem.length; i++){
                        nav_item_str += i==0?'<span class="cur"></span>':'<span></span>';
                    }
                    $nitem = $(nav_item_str).appendTo($nav);
                }
                //if ($nitem.length<2){
                //    $nav.hide();
                //}
                if (parseInt($slideWrap.attr('data-hidenav'), 10)){
                    $nav.hide();
                }
            }
            // 滑动item数大于1个才有滑动效果
            if($sitem.length>1){
                $sitem.removeClass('s-item-hide');
                // 初始化slide滑动
                var objSwipe = Swipe($slideWrap[0], {
                    startSlide: 0,
                    speed: 400,
                    auto: $slideWrap.attr('data-auto')||0,
                    continuous: true,
                    disableScroll: false,
                    stopPropagation: false,
                    callback: function(index, element) {
                        if($nitem && $nitem.length){
                            if($nitem.length<3&&this.continuous){
                                $nitem.removeClass('cur').eq(index%$nitem.length).addClass('cur');
                            } else {
                                $nitem.removeClass('cur').eq(index).addClass('cur');
                            }
                        }
                    },
                    transitionEnd: function(index, element) {   }
                });
            }

            // 事件绑定
            tcb.bindEvent({
                // 查看大图
                '.show-bigger-img img': function(e){
                    var $me = $(this),
                        $img = $me.closest('.slide-shower').find('img'),
                        bigger_url = $me.attr('data-big');

                    var $mask = $('.show-bigger-img-mask'),
                        $close = $('.show-bigger-img-close');
                    if(!$mask.length){
                        $mask = $('<div class="show-bigger-img-mask"></div>').appendTo($(document.body));
                        // 关闭大图查看
                        $mask.on('click', function(e){
                            e.preventDefault();

                            closeShowBiggerImg();
                        });
                    }
                    if(!$close.length){
                        $close = $('<span class="show-bigger-img-close iconfont icon-close"></span>').appendTo($(document.body));
                        // 关闭大图查看
                        $close.on('click', function(e){
                            e.preventDefault();

                            closeShowBiggerImg();
                        });
                    }

                    var $wrap = $('.show-bigger-img-wrap');
                    if(!$wrap.length){
                        $wrap = $('<div class="show-bigger-img-wrap"></div>').appendTo($(document.body));
                        // 关闭大图查看
                        $wrap.on('click', function(e){
                            e.preventDefault();

                            closeShowBiggerImg();
                        });
                    }
                    var pos = 0,
                        str = '<div class="big-img-shower clearfix">';
                    $img.each(function(i){
                        var url = $(this).attr('data-big');
                        if(url==bigger_url){
                            pos = i;
                        }
                        str += '<div class="s-item'+(url==bigger_url? '' : ' s-item-hide')+'"><img src="'+url+'" /></div>';
                    });
                    str += '</div>';
                    $wrap.html('<div class="show-bigger-img-wrap-inner">'+str+'</div>');

                    var $biggerSlideWrap = $wrap.find('.show-bigger-img-wrap-inner'),
                        $biggerSitem = $biggerSlideWrap.find('.s-item');
                    if($biggerSitem.length>1){
                        $biggerSitem.removeClass('s-item-hide');
                        // 初始化 大图 slide滑动
                        Swipe($biggerSlideWrap[0], {
                            startSlide: pos,
                            auto: 0,
                            continuous: true,
                            disableScroll: true,
                            stopPropagation: false,
                            callback: function(index, element) { },
                            transitionEnd: function(index, element) { }
                        });
                    }

                }
            });

            function closeShowBiggerImg(){
                $('.show-bigger-img-mask').off().remove();
                $('.show-bigger-img-close').off().remove();
                $('.show-bigger-img-wrap').off().remove();
            }

        }
        // 图片滑动+查看大图
        productImgSlideAndBigshow();

    }());

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

            var wPCate = $('.attr-line');
            wPCate.each(function(i){
                $(this).find('.attr-item').each(function(ii){
                    var wItem = $(this),
                        attr_id = wItem.attr('data-id');
                    wItem.removeClass('cur').removeClass('attr-item-disabled');// 移除状态
                    // 设置那些不能被选择的属性
                    if ($.inArray(attr_id, SelectableAttr[i])==-1) {
                        wItem.addClass('attr-item-disabled');
                    } else {
                        wItem.removeClass('attr-item-disabled');
                    }

                    if(attr_id === selectedAttr[i]){
                        wItem.addClass('cur');
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


        tcb.bindEvent({
            // 属性点击的交互事件
            '.attr-line .attr-item': function(e){
                e.preventDefault();
                var wMe = $(this);

                // 当前已经选中的属性 点击无效
                if (wMe.hasClass('cur')) {
                    return;
                }

                var cur_attr = wMe.attr('data-id'),
                    cur_attr_line = wMe.closest('.attr-line')[0],
                    cur_line_pos = 0;

                var wAttrLine = $('.attr-line');

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
                            var wAttrItem = $(el).find('.attr-item');
                            // 遍历到当前行，直接跳过不用处理
                            if (ii==cur_line_pos) {
                                return;
                            }
                            if (wAttrItem.filter('.cur').attr('data-id') == item[ii]) {
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
                    var wCur = $(el).find('.cur');
                    if (wCur.attr('data-id')!=best_match_attrgroup[i] && cur_line_pos!=i) {
                        selected_attrgroup[i] = [];
                        $(el).find('.attr-item').each(function(){
                            selected_attrgroup[i].push($(this).attr('data-id'));
                        });
                    } else {
                        selected_attrgroup[i] = best_match_attrgroup[i];
                    }
                });

                // console.log(selected_attrgroup)
                setProductAttrUi(selected_attrgroup, AttrGroup, AttrList);

                var attr_arr = [];
                wAttrLine.find('.cur').each(function(i){
                    attr_arr[i] = $(this).attr('data-id');
                });

                var product_id = ProductIdMap[attr_arr.join(',')];
                if (product_id) {
                    window.location.href = tcb.setUrl(window.location.href, {
                        "product_id": product_id
                    });
                }
            }
        });

    }());

    // 其他
    (function(){

        tcb.bindEvent(document.body, {
            // 切换商品介绍tab
            '.p-extend-info-tab a': function(e){
                e.preventDefault();

                var $me = $(this),
                    pos = $me.attr('data-pos');

                $me.addClass('cur').siblings('.cur').removeClass('cur');

                $('.p-extend-info-main').children().eq(pos).show().siblings('div').hide();

                $.scrollTo({
                    endY: $me.position()['top'],
                    duration: 100,
                    callback: function() {}
                });
            },
            // 切换使用时间
            '[name="treaty_day"]': {
                change: function(e){
                    var $me = $(this),
                        val = $me.val();

                    var $fee = $('.treaty-fee');

                    $fee.html( '￥'+$fee.attr('data-perday')*val );

                    var $buy = $('.btn-prd-buy'),
                        order_url = $buy.attr('href');
                    $buy.attr('href', tcb.setUrl(order_url, {
                        'treaty_day': val
                    }));
                }
            },
            // 商品不能购买
            '.btn-prd-buy-disabled': function(e){
                e.preventDefault();

            }
        });

    }());
});
// END