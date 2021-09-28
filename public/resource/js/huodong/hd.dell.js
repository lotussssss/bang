$(function(){
    var tab_box = $('.tab-box'),
        tab_placeholder = $('.tab-placeholder'),
        tab_top = tab_box.offset().top,
        tab_bottom = $('.block5').offset().top-130-33;

    $(window).on('scroll',function(){
        var scroll_top = $(window).scrollTop();
        if(scroll_top>tab_top && scroll_top<tab_bottom+33){
            tab_box.addClass('fixed');
            tab_placeholder.css('display','block');
            tab_box.css('top',0);
        }else if(scroll_top>=tab_bottom+33){
            tab_box.removeClass('fixed');
            tab_placeholder.css('display','none');
            tab_box.css('top',tab_bottom);
        }else{
            tab_box.removeClass('fixed');
            tab_placeholder.css('display','none');
            tab_box.css('top',372);
        }
    });
    // 九成新五折价
    function getWZJProduct(){
        var request_url = '/youpin/ehj_get_half_off_product?pn=0&num=4';
        $.get(request_url, function(res){
            try{
                res = $.parseJSON(res);
                if (res['errno'] == "0") {
                    var product_list = res['result']['product_list'];
                    var tpl_fn = $.tmpl($.trim($("#JsDellProductListTpl").html())),
                         tpl_st = tpl_fn({
                             "list" : product_list
                         });
                    $('.js-wzj-product-list').html(tpl_st);
                }

            } catch (ex){}

        });
    }
    getWZJProduct();
    $('.tab-list li').hover(function(){
        $(this).addClass('cur').siblings('.cur').removeClass('cur');
        $('.tab-tips li').eq($(this).index()).show().siblings().hide();
    });
    tcb.bindEvent(document.body,{
        '.tab-list li':function(){
            var me = $(this);
            var pos = me.attr("data-pos");
            var scrolls = $(".block" + pos).offset().top - 130;
            $("html,body").animate({scrollTop:scrolls}, '500');
        },
        '.to-area a':function(e){
            e.preventDefault();
            var me = $(this);
            var pos = me.attr("data-pos");
            var scrolls = $(".block" + pos).offset().top - 130;
            //if(pos == "2"){
            //    scrolls = scrolls - 22;
            //}
            $("html,body").animate({scrollTop:scrolls}, '500');
        }
    });
});
