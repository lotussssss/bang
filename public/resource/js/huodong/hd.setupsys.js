
    Dom.ready(function(){
        /**
         * 获取滚动条的高度
         * @return {[type]} [description]
         */
        function getScrollTop(){
            var scrolltop = 0;
            // console.log('window.pageYOffset:'+window.pageYOffset)
            // console.log('document.documentElement.scrollTop:'+document.documentElement.scrollTop)
            // console.log('document.body.scrollTop:'+document.body.scrollTop)
            if(window.pageYOffset){//这一条滤去了大部分， 只留了IE678
                scrolltop = window.pageYOffset;
            }else if(document.documentElement.scrollTop ){//IE678 的非quirk模式
                scrolltop = document.documentElement.scrollTop;
            }else if(document.body.scrollTop){//IE678 的quirk模式
                scrolltop = document.body.scrollTop;
            }

            return scrolltop;
        }
        /**
         * 设置滚动条高度
         * @param {[type]} top_val [description]
         */
        function setScrollTop(top_val){
            top_val = top_val ? top_val : 0;
            if (typeof window.pageYOffset!=='undefined') {
                window.pageYOffset = top_val;
            }
            document.documentElement.scrollTop = top_val;
            document.body.scrollTop = top_val;
        }
        var isIE6= !!window.ActiveXObject&&!window.XMLHttpRequest;
        // 滚动条事件
        // 冻结切换tab
        var wTop = W('.tuan-nav'),
            boundary = wTop.xy()[1];
        var top_val_1 = boundary,
            wNavItem = W('.tuan-nav li');
        /**
         * 设置顶部tab的位置
         */
        function setTopPos(){
            var s_top = getScrollTop();
            // 滚动条滚动到tab的临界位置以下
            if (s_top>boundary) {
                if (isIE6) {
                    wTop.css({
                        'position': 'absolute',
                        'top': s_top-boundary
                    });
                } else {
                    wTop.css({
                        'position': 'fixed'
                    });
                }
                var top_val_2 = W('.dp-list .tit3').xy()[1] - 45,
                    top_val_3 = W('.service-promise .tit4').xy()[1] - 45;
                if (s_top<top_val_2-1) {
                    switchTab(wNavItem.item(0));
                } 
                else if(s_top<top_val_3-1) {
                    switchTab(wNavItem.item(1));
                }
                else {
                    switchTab(wNavItem.item(2));
                }
                W('.buy-mini').show();
            } else {
                W('.buy-mini').hide();
                wTop.css({
                    'position': 'absolute'
                });
            }            
        }
        W(window).on('scroll', setTopPos);
        W(window).on('load', setTopPos);
        W(window).on('resize', setTopPos);

        var changecity = window.changecity;
        if (changecity) {
            var top_val_2 = W('.dp-list .tit3').xy()[1] - 45;
            setScrollTop(top_val_2);
        }
        setTopPos();
        

        // 初始化城市区县选择
        new bang.AreaSelect({
            'wrap': '#citySelector',
            'hasquan': false,
            'autoinit': true,                             // 是否自动初始化
            'urlhost': 'http://' + location.host +'/',    // 请求的url
            // new后init的回调
            'onInit': function(){},
            // 城市选择时触发
            'onCitySelect': function(data){
                location.href ="http://" +location.host + location.pathname + "?city=" + data.citycode + '&changecity=1';
            },
            // 区县选择时触发
            'onAreaSelect': function(data){
                var area_id = data.areacode;

                var request_url = area_id 
                        ? window.URL_ROOT+'t/aj_tuangou/?city='+window.cur_citycode+'&areaid='+area_id
                        : window.URL_ROOT+'t/aj_tuangou/?city='+window.cur_citycode;
                QW.Ajax.get(request_url, function(responceText){
                    try{
                        var responce = QW.JSON.parse(responceText),
                            shop_huodong = {'shop_huodong' : responce['result']};

                        var shop_fn = W('#t_SetupsysShopTpl').html().trim().tmpl(),
                            shop_html = shop_fn(shop_huodong);

                        W('.dp-list-box table tbody').html(shop_html);
                    } catch(ex){}
                });
                
            },
            // 商圈选择时触发
            'onQuanSelect': function(data){
                var area_id = data.areacode,
                    quan_id = data.quancode;

                var request_url = quan_id 
                        ? window.URL_ROOT+'t/aj_tuangou/?city='+window.cur_citycode+'&areaid='+area_id+'&quanid='+quan_id
                        : window.URL_ROOT+'t/aj_tuangou/?city='+window.cur_citycode+'&areaid='+area_id;
                QW.Ajax.get(request_url, function(responceText){
                    try{
                        var responce = QW.JSON.parse(responceText),
                            shop_huodong = {'shop_huodong' : responce['result']};

                        var shop_fn = W('#t_SetupsysShopTpl').html().trim().tmpl(),
                            shop_html = shop_fn(shop_huodong);

                        W('.dp-list-box table tbody').html(shop_html);
                    } catch(ex){}
                });
            }
        });
        tcb.bindEvent(document.body, {
            // 点击tab切换
            '.tuan-nav .menu-item': {
                'mousedown': function(e){
                    var wMe = W(this);

                    switchTab(wMe);
                    var pos = wMe.previousSiblings('li').length,
                        top_val = 0;
                    var top_val_2 = W('.dp-list .tit3').xy()[1] - 45,
                        top_val_3 = W('.service-promise .tit4').xy()[1] - 45;
                    switch(pos){
                        case 0:
                            top_val = top_val_1;
                            break;
                        case 1:
                            top_val = top_val_2;
                            break;
                        case 2:
                            top_val = top_val_3;
                            break;
                        default:
                            break;
                    }
                    setScrollTop(top_val);
                }
            },
            '.search-hot-word a':function(e){
                e.preventDefault();
                W(".search-hot-word").query('a').removeClass('curr');
                W(this).addClass('curr');
                W('.tcb-top-search input[name="stype"]').val( W(this).attr('data-type') );
                W('.ac_wrap').hide();
            }
        });

        W('.promise-logo').bind('mouseenter', function(e){
            var target = W(this).attr('data-to');
            W('.promise-cnt').hide();
            W('.promise-cnt[data-for="'+target+'"]').show();
        });

        /**
         * 切换tab
         * @param  {[type]} wItem [description]
         * @return {[type]}       [description]
         */
        function switchTab(wItem){
            if (!wItem.hasClass('on')) {
                wItem.addClass('on').siblings('li').removeClass('on');
            }
        }
    });