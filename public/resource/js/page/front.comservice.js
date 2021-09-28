
Dom.ready(function(){

    /**
     * 选择城市
     * @return {[type]} [description]
     */
    function selectCity(selector){

        if(!W(selector).length) return false;
        
        var cityPanel = new CityPanel(selector);

        cityPanel.on('close', function(e) {
            
        });

        cityPanel.on('selectCity', function(e) {
            city = e.city.trim();

            var city_name = e.name.trim();

            W(selector).ancestorNodes('.subtit').firstChild('strong').html( city_name );

            location.href ="/c/service/?city_id=" + city;
        });
    }

    /**
     * 获取URL中要传递的参数
     * @return {[type]} [description]
     */
    function getUrlParams() {
        var str = '';
        str += 'city_id=' + (cur_citycode || 'bei_jing');
        str += '&';
        str += 'area_id=' + ( W('.area-list .curr').attr('data-code') || 0 );
        str += '&';
        str += 'type_id=' + ( W('.tab-3 .active a').attr('data-type') || '');
        str += '&';
        str += 'online=' + ( W('#seeImOnline').attr('checked')? 'on':'off' );

        return str;
    }

    //根据筛选项跳转页面
    function clickChangeUrl(){
        var url = '/c/service/?' + getUrlParams();

        window.location.href = url;
     
    }

    function showPageData(data){
        if(data){
            var func = W('#comServiceListTpl').html().trim().tmpl(),
                html = func(data);
            W('#comResList').html(html);
        }else{
            W('#comResList').html('没有更多数据了~');
        }
    }

    function bindEvent(){
        tcb.bindEvent(document.body, {
            '.area-list .item-hd' : function(e){
                e.preventDefault();
                W('.area-list .curr').removeClass('curr');
                W(this).addClass('curr');

                clickChangeUrl();
            },

            '.tab-3 li.sort-type' : function(e){
                e.preventDefault();
                W('.tab-3 .active').removeClass('active');
                W(this).addClass('active');

                clickChangeUrl(); 
            },

            '#seeImOnline' : function(e){
                clickChangeUrl();
            },

            '.go-yuyue-buy' : function(e){
                e.preventDefault();
                var shopid = W(this).attr('data-shopid'),
                    productid = W(this).attr('data-productid');
                ( typeof(ComServiceYuyue)!='undefined') && ComServiceYuyue.show(shopid, productid);
            }
        });
    }

    function init(){
        //选择城市，刷新页面
        selectCity('.citypanel_trigger');  

        bindEvent();

        showPageData(__SHOP_DATA);
    }

    //入口
    init();
});