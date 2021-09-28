// 显示大图~
(function(){

    window.Bang = window.Bang || {}

    var
        selector_shower = '.slide-shower',

        class_bigger_wrap = 'show-bigger-img-wrap',
        class_bigger_wrap_inner = 'show-bigger-img-wrap-inner',
        class_bigger_shower = 'big-img-shower',
        class_bigger_item = 's-item',
        class_bigger_item_hide = 's-item-hide',
        class_bigger_mask = 'show-bigger-img-mask',
        class_bigger_close = 'show-bigger-img-close',

        data_big = 'data-big'

    function openBiggerShow($selector){

        $selector = $selector || $('.show-bigger-img img')

        // 绑定显示大图事件
        $selector.on('click', function(e){

            var
                $me = $(this),
                $img = $me.closest(selector_shower).find('img'),
                bigger_url = $me.attr(data_big);

            var
                $mask = $('.'+class_bigger_mask),
                $close = $('.'+class_bigger_close)

            // 遮罩层
            if(!$mask.length){
                $mask = $('<div class="'+class_bigger_mask+'"></div>').appendTo($(document.body));
                // 关闭大图查看
                $mask.on('click', function(e){
                    e.preventDefault();

                    closeShowBiggerImg();
                });
            }
            // 关闭按钮
            if(!$close.length){
                $close = $('<span class="'+class_bigger_close+' iconfont icon-close"></span>').appendTo($(document.body));
                // 关闭大图查看
                $close.on('click', function(e){
                    e.preventDefault();

                    closeShowBiggerImg();
                });
            }

            // 大图查看容器
            var
                $wrap = $('.'+class_bigger_wrap);
            if(!$wrap.length){
                $wrap = $('<div class="'+class_bigger_wrap+'"></div>').appendTo($(document.body));
                // 关闭大图查看
                $wrap.on('click', function(e){
                    e.preventDefault();

                    closeShowBiggerImg();
                });
            }

            var pos = 0,
                str = '<div class="'+class_bigger_shower+' clearfix">';
            $img.each(function(i){
                var url = $(this).attr(data_big);
                if(url==bigger_url){
                    pos = i;
                }
                str += '<div class="'+class_bigger_item+(url==bigger_url? '' : ' '+class_bigger_item_hide)+'"><img src="'+url+'" /></div>';
            });
            str += '</div>';
            $wrap.html('<div class="'+class_bigger_wrap_inner+'">'+str+'</div>');

            var
                $biggerSlideWrap = $wrap.find('.'+class_bigger_wrap_inner),
                $biggerSitem = $biggerSlideWrap.find('.'+class_bigger_item)

            if($biggerSitem.length>1){

                $biggerSitem.removeClass(class_bigger_item_hide)

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

        })

    }

    // 关闭大图显示
    function closeShowBiggerImg(){
        $('.'+class_bigger_mask).off().remove();
        $('.'+class_bigger_close).off().remove();
        $('.'+class_bigger_wrap).off().remove();
    }


    //====================== Export ========================
    window.Bang.openBiggerShow = openBiggerShow

}())
