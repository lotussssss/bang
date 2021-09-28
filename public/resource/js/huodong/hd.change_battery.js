$ (function () {
    //$(window).on('scroll resize',function(){
    //    var btn_huandianchi = $('.block-bottom'),
    //        btn_huandianchi_placeholder = $('.block-bottom-placeholder'),
    //        btn_huandianchi_top = btn_huandianchi_placeholder.offset().top + btn_huandianchi.height(),
    //        win_height = $(window).height(),
    //        min_scroll_h =  btn_huandianchi_top -win_height,
    //        scroll_h = $(window).scrollTop();
    //
    //    if(scroll_h<=min_scroll_h){
    //        btn_huandianchi.css({'position':'fixed','left':'0','bottom':'0'});
    //    }else{
    //        btn_huandianchi.css({'position':'static','margin-left':'0px'});
    //    }
    //});
    $(window).on('scroll resize',function(){
        var btn_huandianchi = $('.block-bottom'),
            btn_huandianchi_placeholder = $('.block-bottom-placeholder'),
            btn_huandianchi_top = btn_huandianchi_placeholder.offset().top + btn_huandianchi.height(),
            win_height = $(window).height(),
            min_scroll_h =  $('.block1').height(),
            scroll_h = $(window).scrollTop();

        if(scroll_h>=min_scroll_h){
            btn_huandianchi.show();
        }else{
            btn_huandianchi.hide();
        }
    });

});
