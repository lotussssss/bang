/**
 * 店铺首页
 * @return {[type]} [description]
 */
(function(){	
    var JuBaoPanel = null;
	tcb.bindEvent(document.body, {
		//切换搜索tab
		'.search-hot-word a':function(e){
			e.preventDefault();
			W(".search-hot-word").query('a').removeClass('curr');
			W(this).addClass('curr');
			W('.tcb-top-search input[name="stype"]').val( W(this).attr('data-type') );
			W('.ac_wrap').hide();

            var typeid = W(this).attr('data-type')||0;
            var defKeyword = ['上门安装调试路由器', '系统安装', '笔记本除尘清灰', '手机刷机', '打印机维修', '服务器检测' ];
            var ckey = defKeyword[typeid];
            W('#360tcb_so').val(ckey).attr('data-default', ckey);
		},
		//查看电话
		'a.see-phone':function(e){
			e.preventDefault();
			var box = W(this).parentNode('.telnum');
			W(".xd-baozhang").show();
			W(this).hide();
			var tel = W(this).attr('data-tel');
			box.one('strong').html(tel);
			box.one('.connect-tip').css('visibility','visible');
			new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu_noauth"  +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
		},
		'a.see-phone2':function(e){
			e.preventDefault();
			var box = W(this).parentNode('.telnum');
			W(this).hide();
			var tel = W(this).attr('data-tel');
			box.one('strong').html(tel);
			box.one('.connect-tip').css('visibility','visible');
			new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu_noauth" +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=2' : '' );
		},
        //客户端查看电话
        'strong.see-phone':function(e){
            e.preventDefault();         
            var tel = W(this).attr('data-tel');
            W(this).html(tel);
            new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu_noauth" +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
        },
        //分享
        '#shareShop' : function(e){
            e.preventDefault(); 
            var _this = W(this);
            shopFunc.shareLink(_this, 'shop');
        },
        //发送到手机
        '#sendToPhone' : function(e){
            e.preventDefault(); 
            var _this = W(this);
            shopFunc.sendToPhone(_this, 'shop');
        },
		//关闭电话提示
		'.xd-baozhang .xdbz-close' : function(e){
			W(".xd-baozhang").hide();
		},
		// 激活举报表单
		'#JuBaoButton': function(e){
			e.preventDefault();

            var jubao_func = W('#JuBaoPanelTpl').html().trim().tmpl(),
                jubao_str = jubao_func();

            JuBaoPanel = tcb.panel('举报该信息', jubao_str, {
            	'wrapId': 'JuBaoPanel',
                'width': 577
            });
		},
		// 提交举报表单
		'.sub_jubao': function(e){
			var wJubaoid = W('[name="jubaoid"]').filter(':checked'),
				wProgram_desc = W('[name="program_desc"]'),
				wLink_phone = W('[name="link_phone"]');

            var program_desc = wProgram_desc.val(),
                link_phone = wLink_phone.val();
            // 验证jubaoid
            // 验证问题描述
            // 验证联系电话
			if (!validJubaoId(wJubaoid) || !validProgramDesc(wProgram_desc) || !validLinkPhone(wLink_phone)) {
                return ;
			}

			var params = {
				'jubaoid': wJubaoid.val(),
				'shopid': shop_id,
				'qid': host_qid,
				'program_desc': program_desc,
				'link_phone': link_phone
			};
			var request_url = base_url+'aj/jubaoshop/?'+QW.ObjectH.encodeURIJson(params);
			QW.loadJsonp(request_url, function(response){
                if (response['errno']==0) {
                    // JuBaoPanel.hide();

                    var jubao_func2 = W('#JuBaoPanel2Tpl').html().trim().tmpl(),
                    jubao_str2 = jubao_func2();

                    var JuBaoPanel2 = tcb.panel('举报该信息', jubao_str2, {
                        'wrapId': 'JuBaoPanel2',
                        'width': 268
                    });
                    JuBaoPanel2.on('beforehide', function(){
                        JuBaoPanel.hide();
                    });
               }
			});
		},
        // 举报描述
		'.program_desc': {
			'focus': function(e){
				var wMe = W(this);

                if (wMe.hasClass('unactived')) {
                    wMe.removeClass('unactived').val('');
                }
			},
            'blur': function(e){
                var wMe = W(this);

                if (wMe.val().trim()==='') {
                    wMe.addClass('unactived').val(wMe.attr('textholder'));
                }
            }
		},
        // 联系电话
        '.link_phone': {
            'focus': function(e){
                var wMe = W(this);

                if (wMe.hasClass('unactived')) {
                    wMe.removeClass('unactived').val('');
                }
            },
            'blur': function(e){
                var wMe = W(this);

                if (wMe.val().trim()==='') {
                    wMe.addClass('unactived').val(wMe.attr('textholder'));
                }
            }            
        }
	});
    function validJubaoId(wObj){
        var flag = true;
        if (!wObj.length) {
            alert('请选择举报内容');
            flag = false;
        }
        return flag;
    }
    function validProgramDesc(wObj){
        var flag = true;
        if (wObj.hasClass('unactived')) {
            alert('请填写问题描述');
            flag = false;
        }
        return flag;
    }
    function validLinkPhone(wObj){
        var flag = true;
        if (wObj.hasClass('unactived')) {
            alert('请填写问题联系电话');
            flag = false;
        }
        else if (!tcb.validMobile(wObj.val())) {
            alert('手机号码填写不正确');
            flag = false;
        }
        return flag;
    }

	/**
	 * 入口
	 * @return {[type]} [description]
	 */
	function init(){

	}

	init();


tcb.bindEvent(document.body, {
    // 最小化底部导航
    '.client-bottom-nav .close': function(e){
        e.preventDefault();

        QW.Cookie.set('CLIENT_BOTTOM_NAV_HIDDEN', '1', {'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });


        W('.client-bottom-nav').slideUp(400, function(){
            W('.client-bottom-nav-upbutton').show();
        });
    },
    // 联系我们
    '.client-bottom-nav .lianxiwomen': function(e){
        e.preventDefault();
        
        tcb.alert("联系我们", '<div style="padding:10px 20px;line-height:2; "><h3 style="font-size:14px; font-weight:bold;margin-bottom:8px">您可以通过以下方式联系我们：</h3><p>1. <a target="_blank" href=" http://bang.360.cn/resource/html/client_jump.html?link='+encodeURI('http://chat.5251.net/jsp_admin/client/chat_green.jsp?companyId=19024&style=41044&locate=cn')+'">在线咨询</a></p><p>2. <a target="_blank" href=" http://bang.360.cn/resource/html/client_jump.html?link='+encodeURI('http://chat.5251.net/jsp_admin/client/chat_green.jsp?companyId=19024&style=41044&locate=cn')+'">投诉及建议</a></p><p>3. 致电<strong style="color:#FF6A07; font-weight:bold">4000-399-360</strong></p><p>能为您服务是我们最大的幸福！</p></div>', { width: 400, height: 230 }, function(){ return true;});
    },
    // 恢复底部导航状态
    '.client-bottom-nav-upbutton': function(e){
        e.preventDefault();

        QW.Cookie.set('CLIENT_BOTTOM_NAV_HIDDEN', '', {'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });
        
        W('.client-bottom-nav-upbutton').hide();
        W('.client-bottom-nav').slideDown();
    }
});

function bindEvent(){
    W('#addrSearchForm').bind('submit', function(e){
        e.preventDefault();
        var _this = this;
        var ipt = W(this).one('[name="addr"]');
        var txt = ipt.val();
        if( txt =='' || txt == ipt.attr('data-default') ){
            /*ipt.focus();
            if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(ipt);*/
            ipt.val('');
            W(this).attr('action', base_url+'client/findshop'); //没有输入地址时跳转到区县筛选    
            setTimeout( function(){ W(_this)[0].submit(); },100);
        }else{
            W(this).attr('action', base_url+'client/distance');
            setTimeout( function(){ W(_this)[0].submit(); },100);
        }
    });
}

function initAddrSearch(obj){
    new AddrSuggest(obj, {
        'showNum' : 6,
        'onSelect' : doAddrSearch,
        'requireCity' : function(){ return W('#citySelector .sel-city .sel-txt').html() || '' }
    });
}

function doAddrSearch(txt){     
    W('#addrSearchForm').fire('submit');
}


Dom.ready(function(){
    // cookie控制客户端底部导航的显示
    if (QW.Cookie.get('CLIENT_BOTTOM_NAV_HIDDEN')) {
        W('.client-bottom-nav-upbutton').show();
    } else {
        W('.client-bottom-nav').show();
    }

    if(W('#addrSearchForm').length>0){ //只在有相关搜索框时才触发相应逻辑
        bindEvent();
        initAddrSearch('#addrSearchForm .addr-ipt');
        // 激活面板选择
        new bang.AreaSelect({
            //when initial, set the default addr.
            'data':{
                'areacode': window.location.search.queryUrl('area_id')||'',
                'areaname': window.location.search.queryUrl('areaname')||''
            },
            'urlhost' : 'http://bang.360.cn/',
            // 城市选择时触发
            'onCitySelect': function(data){
                //reset form data
                W('#addrSearchForm [name="cityname"]').val( data.cityname );
                W('#addrSearchForm [name="city"]').val( data.citycode );                
                W('#addrSearchForm [name="areaname"]').val( '' );
                W('#addrSearchForm [name="area_id"]').val( '' );
                
                //set cookie.
                QW.Cookie.set('CITY_NAME', data.cityid+'|'+data.citycode+'|'+data.cityname,{'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });
                new Image().src = "/aj/qiehuan_city/?citycode=" + data.citycode;  //Do this make the browser city cookie change.

                //清空当前搜索项
                W('#addrSearchForm [name="addr"]').val(''); 
                //切换区县
                doAddrSearch();
            },
            // 区县选择时触发
            'onAreaSelect': function(data){
                //reset form data
                W('#addrSearchForm [name="cityname"]').val( data.cityname ||'' );
                W('#addrSearchForm [name="areaname"]').val( data.areaname ||'' );
                W('#addrSearchForm [name="area_id"]').val( data.areacode ||'' );

                //清空当前搜索项
                W('#addrSearchForm [name="addr"]').val(''); 
                //切换区县
                doAddrSearch();             
            },
            // 商圈选择时触发
            'onQuanSelect': function(data){
                
            }
        }); 
    }
});
})();