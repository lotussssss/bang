function runJishiService () {
    var cmd = '/folkproblem=4\\72 /tab=2';
    try{
        window.wdextcmd.CallDiagScanWithParam(cmd);

    }catch(ex){
        var jsobj;

        if(QW.Browser.ie){
            jsobj = W('#jishiieplugin')[0];
        }else{
            jsobj = W('#jishichromeplugin')[0];
        }

        try{
            var v = jsobj.GetVersion();
            var rs = campareVersion(v, "1.0.0.2");
            if(!rs){
                alert('请先安装专业工具。\n如已安装，请重启浏览器，重新打开本页面再点击。');
                window.open('http://jishi.360.cn/360ExpertPlugin.exe');                         
            }else{
                jsobj.RunClient(cmd);
            }        
        }catch(ex){
            alert('请先安装专业工具。\n如已安装，请重启浏览器，重新打开本页面再点击。');
            window.open('http://jishi.360.cn/360ExpertPlugin.exe');

        }
    }
}

//客户端版本比较
function campareVersion(dest, src){
    if( dest == src ){return true;}

    var destarr = dest.split(/\./g),
        srcarr = src.split(/\./g);

    var rs;

    for(var i=0, n=destarr.length; i<n; i++){
        if( destarr[i] - srcarr[i] > 0 ){
            return true;
        }else if( destarr[i] - srcarr[i] < 0 ){
            return false;
        }else{
            continue;
        }
    }   
    
}

//buy
function buyProduct(data ){
    var content_func = W('#getWXCodeTpl').html().tmpl();
    
    var content = content_func( data || {});

    var panel = tcb.panel("", content, { 
        width:300,
        height:280,
        "className" : "panel panel-tom01 border8-panel pngfix"
    });


    W(panel.oBody).one('.mobile').on('keyup', function(e){
        W(this).val( W(this).val().replace(/\D/g, '') );
    });

    W(panel.oBody).one('.wxcode-form').on('submit', function(e){
        
        e.preventDefault();

        var Wthis = W(this);
        var Wtel = Wthis.one('.mobile');

        if( Wtel.val().trim()==''  || Wtel.val().length != 11){
            Wtel.focus().shine4Error();
            return false;
        }

        var tel = Wtel.val().trim();

        var params = getQuanPostParams();
        params.buyer_mobile = tel;
        params.product_id = Wthis.one('.product_id').val().trim();
        params.postkey = Wthis.one('.postkey').val().trim();

        QW.Ajax.post( BASE_ROOT+'torder/confirm', params, function(data){
            data = JSON.parse( data ); 
            if(data.errno){
                alert("抱歉，出错了。" + data.errmsg);
            }else{
                panel.hide();

                buyDone( data.result );
            }

        });

        return false;

    });
}

function buyDone( data ){
    var content_func = W('#getWXCodeDoneTpl').html().tmpl();

    var content = content_func( data || {});

    var panel = tcb.panel("", content, { 
        width:320,
        height:330,
        "className" : "panel panel-tom01 border8-panel pngfix"
    });

    W('.remain-num .num').html( Math.max( W('.remain-num .num').html()-0 -1, 0)  );

    panel.on("afterhide", function(){
        window.location.reload();
    });
}

function showUseRemoteHelp(){
    var panel = tcb.panel("", '<img src="https://p.ssl.qhimg.com/t016d04f542556c5b1d.jpg" width="480">', {
        width:480,
        height:1320,
        "className" : "panel panel-tom01 border8-panel pngfix"
    });
}

/**
 * 获取领券的提交参数；
 * @return {[type]} [description]
 */
function getQuanPostParams(){
    var params = {
        'from_page': 'tg_shuaji',
        'details_product': '',
        'is_ckpostkey': 0,
        'liuyan': '',
        'o_product_num': 1,
        'o_server_method': 1,
        'o_summoney': 0,
        'pay_method': 2,
        'postkey': '',
        'product_id': '',
        'wapsub_th': 1
    };
    return params;
}


Dom.ready(function(){
    W(document).delegate('.start-remote', 'click', function(e){
        e.preventDefault();
        runJishiService();
    });

    W(document).delegate('.how-use-remote', 'click', function(e){
        e.preventDefault();
        showUseRemoteHelp();
    });


    W(document).delegate('.buy-btn, .buy-mini', 'click', function(e){
        e.preventDefault();

        if( W('.remain-num .num').html() - 0 <= 0  ){
            alert('抱歉，本次已经被抢光了，敬请关注下期。');
            return false;
        }

        buyProduct( );
    })
});