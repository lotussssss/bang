$(function(){

    tcb.bindEvent(document.body, {
        // 我要竞猜
        '.btn-jingcai, .btn-full-season, .btn-rank': function(e){
            e.preventDefault()

            var
                html_cnt = '<div class="qrcode pngfix"></div>'

            tcb.showDialog(html_cnt)
        }
    })
});