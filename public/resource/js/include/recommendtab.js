(function(){

    if(window.location.search.indexOf('from=')<0){
        return;
    }

    var inclient = window.location.search.indexOf('from=tcbclient')>-1 ? true : false;

    var surl = 'http://bang.360.cn/client/search/';
    var cssurl = 'http://bang.360.cn/resource/css/lib/recommendtab.css';
    var kds = window.location.search.match(/keyword=([^&]+)/);
    var oBox = null;

    var keyword;
    if(kds && kds[1]){
        keyword = decodeURIComponent(kds[1]) || '';
    }

    if(!keyword){//没有关键字，不做处理。
        return;
    }

    function genTab(){
        var ret = ['<div id="RecommendTab" class="recommendtab">', 
                        '<h3 class="color1">如果您自己搞不定<br>就找商家上门解决</h3>',
                        '<ul class="tip-list">',                            
                            '<li><span class="icon icon-v"></span>360审核企业</li>',
                            '<li><span class="icon icon-refund"></span>无效100%退款</li>',
                        '</ul>',
                        '<div class="form-block">',
                            '<form action="" id="search-form">',
                                '<input type="text" name="keyword" class="search-ipt color2" value="电脑温度高">',
                                '<input type="submit" class="sub-btn" value="">',
                            '</form>',
                        '</div>',
                        '<p class="tipwords">解决您问题的商家：</p>',
                        '<ul class="shop-list"></ul>',
                        '<a href="#" class="more">查看更多>></a>',
                    '</div>'];

        oBox = $( ret.join('') ).appendTo('body');
    }

    function addStyle(){
        $('<link rel="stylesheet" href="'+cssurl+'" />').appendTo('head');
    }

    function fixPage(){
        $('.maincontainer').css({
            'margin-right': 150
        });

        $('.maincontainer img').css({
            'max-width' : 540
        });
        
        var formaction = inclient ? 'http://bang.360.cn/client/search' : 'http://bang.360.cn/search',
            linkurl = (inclient ? 'http://bang.360.cn/client/search' : 'http://bang.360.cn/search') + '?keyword=' + keyword;

        oBox.find('#search-form').attr('action', formaction).attr('target', inclient ? '_top' : '_blank');

        oBox.find('.more').attr('href', linkurl).attr('target', inclient ? '_top' : '_blank');
    }

    function getJsonData(){
        $.ajax(surl, {
            'dataType' : 'jsonp',
            'data' : {'keyword' : keyword, 'async' : 1},
            'success' : dealJsonData
        });
    }

    function dealJsonData(ret){
        var listBox = oBox.find('.shop-list');

        if(listBox && ret.errno==0 && ret.data){
            var list = ret.data;
            var html = [];
            for(var i=0, n=list.length; i<Math.min(4, n); i++){
                var item = list[i];

                html.push( '<li><a target="'+(inclient ? '_top' : '_blank')+'" href="'+ item.shop_addr + '&jytool=1' + (inclient ? '&inclient=1' : '') +'">'+item.shop_name+'</a><span class="addr">'+item.addr_detail.split(/,/g)[0]+'</span> <span class="score color1">'+item.shop_score +'分</span></li>' );
            }

            listBox.html( html.join('') );
        }
    }

    function init(){
        addStyle();
        genTab();
        fixPage();        
        getJsonData();
    }


    init();


}());