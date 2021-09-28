Dom.ready(function(){
    tcb.bindEvent(document.body, {
        // 搜索框操作
        '.address-search-form-ipt': {
            'focus': function(e){
                var wMe = W(this);

                if(wMe.hasClass('inactived')){
                    wMe.removeClass('inactived').val('');
                }
            },
            'blur': function(e){
                var wMe = W(this),
                    default_val = wMe.attr('default-value');

                if (wMe.val().trim()===''||default_val===wMe.val()) {
                    wMe.addClass('inactived').val(default_val);
                }
            }
        },
        //查看地图
        '.see-map': function(e){
            e.preventDefault();
            var el = W(this);

            new bigMap().show( el.attr('data-shopid'), true);
            
        },
        '.zj-go-talk' : function(e){
            e.preventDefault();
            var wMe = W(this);
            var qid = W(this).attr('data-id');
            if(!qid){
                tcb.panel('', '<div class="shop-phone-view-pannel"><div class="line"><span>店铺名称：</span><span>'+wMe.attr('data-shopname')+'</span></div><div class="line"><span>联系电话：</span><span class="lc1">'+wMe.attr('data-tel')+'</span></div><div style="height:30px;"></div><div class="line"><span class="lc2">联系我时，请说是在360同城帮看到的，谢谢！</span></div></div>', { 'width':380, 'height':180}, function(){return true;});
                //tcbMonitor.__log({cId:'expert_tel'});
            }else{
                ExpertChat.startChatByAjax(qid, wMe.attr('data-tel')||'');     
                //tcbMonitor.__log({cId:'expert_chat'});
            }
            
        },
        '#questionList a' : function(e){
            if( W(this).attr('href').replace(/#/g, '').length==0 ){   
                e.preventDefault();
                W(this).addClass('curr').siblings('.curr').removeClass('curr');
                W('#brandList .curr').removeClass('curr');
                doSearch();
            }
        },
        '#brandList a' : function(e){
            e.preventDefault();  
            W(this).addClass('curr').siblings('.curr').removeClass('curr');
            W('#questionList .curr').removeClass('curr');
            doSearch();          
        },
        '.card-item-shop' : function(e){
            var prdUrl = W(this).attr('data-purl');

            if(e.target.tagName.toLowerCase() != 'a' && e.target.parentNode.tagName.toLowerCase() !='a' ){
                
                window.location.href = prdUrl;
            }
        },
        '.card-item-expert' : function(e){
            var eid = W(this).attr('data-id');

            if( !W(e.target).hasClass('zj-go-talk') ){
                try{
                    window.external.show_folk_detail(eid);
                }catch(ex){}
            }
        },
        '#repairTypes li' : function(e){
            W(this).addClass('curr').siblings('.curr').removeClass('curr');
            doSearch(); 
        }
    });

    function getParams(){
        var cityselector = W('#citySelector');

        return{
            'kw' : W('#questionList .curr').attr('data-kw') || W('#brandList .curr').attr('data-kw') || W('#360tcb_so').val() || '',
            'city_code': cityselector.one('.sel-city').attr('code')||'',
            'area_id': cityselector.one('.sel-quxian').attr('code')||'',
            'quan_id': cityselector.one('.sel-shangquan').attr('code')||'',
            'isajax' : 'json',
            'type' : W('#repairTypes .curr').attr('data-type')
        }
    }

    var __hasMoreData = true;
    var __pn = 0;
    var __isLoadding = false;

    function doSearch(){
        __hasMoreData = true;
        __pn = 0;
        __isLoadding = false;

        W('#shangmenProList').html('');
        W('#remoteProList').html('');

        getAjaxData(0);
    }

    /**
     * 异步获取数据
     * @return {[type]} [description]
     */
    function getAjaxData(pn){
        var param = getParams();      
        param.pn = typeof(pn)!='undefined' ? pn : (__pn || 0);  
        
        var url = BASE_ROOT+'client/phone?' + Object.encodeURIJson(param);

        __isLoadding = true;
        W('.content-box .loading-content').show();
        QW.Ajax.get(url, function(data){
            __isLoadding = false;
            W('.content-box .loading-content').hide();

            data = QW.JSON.parse(data);

            if(data.errno == 0 && data.result ){
                if( data.result && data.result.data && data.result.data.length>0  ){
                    __hasMoreData = true;
                }else{
                    __hasMoreData = false;
                }

                showDataList( data.result );
            }else{
                 __hasMoreData = false;
            }

        });
    }

    //显示结果
    function showDataList(data){
        var shList = W('#shangmenProList');

        var shNum = data.total;

        var shData = data.data;

        if(shNum > 0){
            var tmpFuncSh = W('#phoneExpertTpl').html().trim().tmpl();
            var html = tmpFuncSh({ 'datalist':shData}) ;
            shList.insertAdjacentHTML( 'beforeend', html);
        }else{            
            shList.html('<div  style="padding:20px; position:relative; z-index:1; left:-1px; background:#fff; text-align:center; font-size:14px;">抱歉，没找到相关结果，您可以换个词试试。</div>');
        }

    }

    // 附近位置搜素
    /*W('#AddressSearchForm').on('submit', function(e){
        e.preventDefault();

        var wMe = W(this),
            wQueryInput = wMe.query('.address-search-form-ipt')
            search_query = wQueryInput.val().trim();
        
        new bigMap().getGeoPoi(search_query, function(d){

            if (!d) {
                alert('没有查找到您搜索的位置！');
                wQueryInput.val('').focus();
                return;
            }
            var request_url = BASE_ROOT+'site/zt_shuju?isajax=json&lng='+d.lng+'&lat='+d.lat;
            QW.Ajax.post(request_url, function(resData){
                resData = typeof resData==='string' ? QW.JSON.parse(resData) : resData;
                if (!resData['errno']) {

                    var shop_lists = resData['result'];
                    if (shop_lists.length) {
                        var pos = 0,
                            dividend = 2,
                            item_len = shop_lists.length;

                        pos = item_len%dividend ? (item_len-item_len%dividend) : (item_len-dividend);

                        var item_fn   = W('#UserCardItem4').html().trim().tmpl(),
                            item_html = item_fn({
                                'card_items': shop_lists,
                                'pos': pos,
                                'dividend': dividend
                            });
                        var wList = W('.mb-right-a .card-list');
                        item_html = item_html+'<div class="card-item-nomore"><a href="'+BASE_ROOT+'search/?_isfix=0&ie=utf-8&f=tcb&stype=0&keyword=数据恢复&lng='+d.lng+'&lat='+d.lat+'&addr='+search_query+'" target="_blank">更多实体店铺&gt;&gt;</a></div>';
                        wList.html(item_html);
                    }

                } else {
                    alert(resData['msg']);
                }
            });

        });

    });*/
    
    //加载更多
    function loadMoreData(){
        var dpArea = W(this).one('.mainbody');
        var boxST = W(this).attr('scrollTop');
        var boxCH = W(this).getRect().height;

        if(!__isLoadding && __hasMoreData && (boxCH + boxST +50 >= dpArea.getRect().height) ){
            __pn ++;
            getAjaxData(__pn);
        }
    }
    
    function bindEvent(){
        W('#tcbTopSearch').on('submit', function(e){
            e.preventDefault();
            W('#questionList .curr').removeClass('curr');
            W('#brandList .curr').removeClass('curr');

            doSearch();
            setTimeout(function(){ W('#360tcb_so').blur(); } , 50);            
        });

        W('.page-client-phone .content-box').on('scroll', loadMoreData);
        W('.page-client-phone .content-box').on('init', loadMoreData);
    }
    
    function init(){
        // 激活面板选择
        new bang.AreaSelect({
            'wrap': '#citySelector',

            //when initial, set the default addr.
            'data':{
                'areacode': window.location.search.queryUrl('area_id')||'',
                'areaname': window.location.search.queryUrl('areaname')||''
            },
            // 城市选择时触发
            'onCitySelect': function(data){
                 doSearch();
            },
            // 区县选择时触发
            'onAreaSelect': function(data){
                doSearch();
            },
            // 商圈选择时触发
            'onQuanSelect': function(data){
                doSearch();
            }
        }); 

        bindEvent();
        doSearch();
    }

    init();
});