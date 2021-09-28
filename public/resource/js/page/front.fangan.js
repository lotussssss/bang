
Dom.ready(function(){

    function getJsonData(){
        if(W('#shopShowBox').length == 0){return;}
        var surl = '/client/search/';
        QW.Ajax.get(surl, {'keyword' : keyword, 'async' : 1}, function( text ){
            var data = JSON.parse(text);
            if(!data.data){
                W('#shopShowBox').html('抱歉，未找到符合条件的商家');
                return false;
            }
            data.shop_data = data.data;
            if(data.shop_data.length ==0){
                W('.dp-list-box').hide();
            }
            var tpl = W('#searchDPListTpl').html().tmpl();
            var dptxt = tpl(data);
            W('#shopShowBox').html( dptxt );
        });
    }

    W('.promise-logo').bind('mouseenter', function(e){
        var target = W(this).attr('data-to');
        W('.promise-cnt').hide();
        W('.promise-cnt[data-for="'+target+'"]').show();
    });

    //tab切换
    W('.ques-list-box .menu-item').on('click', function(e){
        e.preventDefault();
        var w_this = W(this);
        if(w_this.hasClass('curr')){
            return;
        }

        w_this.addClass('curr').siblings('.curr').removeClass('curr');
        var rel = w_this.attr('data-rel');
        W('.ques-list-box .ques-table').hide();
        W('.ques-list-box .ques-table[data-for="'+rel+'"]').show();
    });    

    W('body').delegate('.dp-info-tel', 'click', function(e){
        e.preventDefault();
        var wMe = W(this);

        tcb.panel('', '<div class="shop-phone-view-pannel"><div class="line"><span>店铺名称：</span><span>'+wMe.attr('data-shopname')+'</span></div><div class="line"><span>联系电话：</span><span class="lc1">'+wMe.attr('data-tel')+'</span></div><div style="height:30px;"></div><div class="line"><span class="lc2">联系我时，请说是在360同城帮看到的，谢谢！</span></div></div>', { 'width':380, 'height':180}, function(){return true;});
    });

    W('body').delegate('.dp-info-ept', 'click', function(e){
        e.preventDefault();
        var wMe = W(this);
        var eid = wMe.attr('data-eid');

        var panel = tcb.alert('使用服务', '<div style="padding:10px;font-size:14px;text-align:center;color:#f60"><img src="https://p.ssl.qhimg.com/t01d621a8109b7524b5.gif" width="24"> 服务启动中，请稍后...</div>', {width:300, height:126,btn_name:'知道啦'}, function(){return true;});
        //fater 5s, close the PANEL.
        setTimeout(function(){panel.hide();}, 5000);
        
        ExpertChat.checkAndStart(eid);
    });    
    
    getJsonData();
});
