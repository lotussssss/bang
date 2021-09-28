Dom.ready(function(){
    var WxPrice = {};
    tcb.bindEvent(document.body, {
        '.xiu-brand-apple .point, .xiu-brand-samsung .point':{
            'mouseenter': function(e){
                var wMe = W(this),
                    rect = wMe.getRect(),
                    k = wMe.attr('data-key');

                var CurPos = WxPrice[k];
                if (!CurPos) {
                    return;
                }
                var wPointTip = W('#PointTip');
                if (!wPointTip.length) {
                    W('body').insertAdjacentHTML('beforeend', '<div class="point-tip" id="PointTip" style="display:block;top:'+rect['top']+'px;left:'+(rect['left']+rect['width']+2)+'px;">'+CurPos['class_desc']+'维修 '+CurPos['price_360']+'元</div>');
                } else {
                    wPointTip.html(CurPos['class_desc']+'维修 '+CurPos['price_360']+'元').css({
                        'display': 'block',
                        'top': rect['top'],
                        'left': rect['left']+rect['width']+2
                    });
                }
            },
            'mouseleave': function(e){
                var wMe = W(this);

                var wPointTip = W('#PointTip');
                if (wPointTip.length) {
                    wPointTip.removeNode();
                }
            }
        },
        // 选择手机型号
        '.model-list .check-item': function(e){
            e.preventDefault();

            clearErrorBlink();

            var wMe = W(this);

            wMe.addClass('check-item-curr').siblings('.check-item-curr').removeClass('check-item-curr');

            QW.Ajax.get('/aj_xiu/get_wx_price?pc_id='+wMe.attr('data-modelid'), function(res){
                try{
                    res = JSON.parse(res);

                    if (!res['errno']) {
                        var key_datas = {
                            'parts_list': []
                        };

                        QW.ObjectH.map(res['result'], function(el, k){
                            key_datas['parts_list'].push(k);
                        });
						var tmpl_str = "";
						if(! (Object.prototype.toString.call(res['result']) == '[object Array]') ){
						    for( var key in res['result'] ){
							    var price_des = "";

							    if( parseInt(res['result'][key].fault_classid)==18 && parseFloat(res['result'][key].price_min)>0 ){
								    price_des = "￥" + parseInt(res['result'][key].price_min) + "-" + "￥" + parseInt(res['result'][key].price_360);
							    }else{
								    price_des = "￥" + parseInt(res['result'][key].price_360);
							    }
						        tmpl_str = tmpl_str + "<div class=\"xiu-price-item\"><div class=\"xiu-price-item-desc\">" + res['result'][key].class_desc + "</div><div class=\"xiu-price-item-price\">" + price_des + "</div></div>";
						    }
						}
						W('.xiu-brand-all').html(tmpl_str);

                        WxPrice = res['result'];
                    } else {
                        //W('.xiu-brand-apple, .xiu-brand-samsung').query('a').hide();
                    }
                } catch(ex){
                    //W('.xiu-brand-apple, .xiu-brand-samsung').query('a').hide();
                }
            });
            // getRepairCost();
        },        
        // 选择故障现象
        '.issue-list .check-item': function(e){
            e.preventDefault();

            clearErrorBlink();

            var wMe = W(this);
            wMe.addClass('check-item-curr').siblings('.check-item-curr').removeClass('check-item-curr');

            if (wMe.attr('data-issueid')=='11') {
                W('.item-other-input-wrap').show().query('input').focus();
            } else {
                W('.item-other-input-wrap').hide();
            }
            // getRepairCost();
        },
        '#JiuxiuUserMobile, #JixiuSecode': {
            'keypress': function(e){
                if (e.keyCode==13) {
                    W('.xiu-btn-xiadan').click();
                }
            }
        },
        // 发送验证码
        '.xiu-btn-yanzheng': function(e){
            e.preventDefault();

            var wMobile = W('#JiuxiuUserMobile'),
                wMe = W(this);

            if(wMe.hasClass('btn-vcode-disabled')){
                return;
            }

            var mobile_val = wMobile.val();
            if( !/^\d{11}$/.test(mobile_val)){
                wMobile.shine4Error().focus();
                return;
            }

            QW.Ajax.post('/aj/send_jxsecode', {'mobile' : mobile_val}, function(res){
                var res = QW.JSON.parse(res);
                if(res.errno){
                    alert('抱歉，出错了。'+res.errmsg);                        
                }else{

                    setXiuOrderLatestMobile();

                    wMe.addClass('btn-vcode-disabled').html('60秒后再次发送');
                    distimeAnim(60, function(time){
                        if(time<=0){
                            wMe.removeClass('btn-vcode-disabled').html('发送验证码');
                        }else{
                            wMe.html( time + '秒后再次发送');
                        }
                    });
                }
            } );
        },
        // 立即下单
        '.xiu-btn-xiadan': function(e){
            e.preventDefault();

            clearErrorBlink();

            var params = getJixiuXiadanParams();
            if (!params) {
                return ;
            }

            var request_url = '/xiu/sub_torder';
            QW.Ajax.post(request_url, params, function(res){
                res = JSON.parse(res);

                if (!res['errno']) {
                    var tmpl_fn = W('#OrderSuccessPanel').html().tmpl();

                    var html_str = tmpl_fn({
                        'shoucang_script': "javascript:try{ window.external.AddFavorite('http://bang.360.cn/xiu','360安全维修'); } catch(e){ (window.sidebar)?window.sidebar.addPanel('360安全维修','http://bang.360.cn/xiu',''):alert('请使用按键 Ctrl+d，收藏360安全维修'); }",
                        'redirect_url': '/xiu_my/order_detail?order_id='+res['result']['order_id']
                    });
                    
                    tcb.panel('<span class="xiu-order-success-panel-logo"></span>', html_str, {
                        'className': 'xiu-order-success-panel'
                    });

                } else {
                    alert(res['errmsg']);
                    // location.href = location.href;
                }
            });
        }
    });


    //获取维修价格
    // function getRepairCost(){
    //     var wModel = W('#ModelList .check-item-curr'),
    //         wIssue = W('#IssueList .check-item-curr');

    //     if( wModel.length>0 && wIssue.length>0 ){
    //         if (wIssue.attr('data-issueid')) {
    //             var request_url = '/Aj_xiu/faultdetail?fault_id='+wIssue.attr('data-issueid')+'&pc_id='+wModel.attr('data-modelid');
    //             QW.Ajax.get(request_url, function(res){
    //                 var res = QW.JSON.parse(res);
    //                 if(res.errno){

    //                 }else{
    //                     var repairItems = res.result;
    //                     if(repairItems && repairItems.length>0){
    //                         var repairFun = W('#repairItemTpl110').html().tmpl();

    //                         var rHtml = repairFun({ 'repairItems' : repairItems });

    //                         W('#evaluateResult').html(rHtml);
    //                     }else{
    //                         var repairFun = W('#repairItemTpl110').html().tmpl();

    //                         var rHtml = repairFun({ 'repairItems' : [] });

    //                         W('#evaluateResult').html(rHtml);

    //                         // W('#evaluateResult').html('');
    //                     }
    //                 }
    //             });
    //         }
    //         // 其他故障
    //         else {
    //             var repairFun = W('#repairItemTpl110').html().tmpl();

    //             var rHtml = repairFun({ 'repairItems' : [] });

    //             W('#evaluateResult').html(rHtml);
    //         }
    //     }
    // }
    //倒计时动画
    function distimeAnim(time, callback){
        if(time<=0 ){  return ;}
        var timer = setInterval( function(){
            time --;
            callback && callback(time);
            if(time <=0 ){
                clearInterval(timer);
            }
        }, 1000);
    }

    /**
     * 获取寄修下单参数
     * @return {[type]} [description]
     */
    function getJixiuXiadanParams(){
        var params = {
            'postkey': '',
            'pc_id': '',
            'problem_id': '',
            'other_issue_desc': '',
            'login_mobile': '',
            'secode': ''
        };

        // 手机型号
        var wModel = W('#ModelList .check-item-curr');
        if (!wModel.length) {
            errorBlink(W('#ModelList .check-item'));
            return false;
        }
        params['pc_id'] = wModel.attr('data-modelid');
        // 问题故障
        var wIssue = W('#IssueList .check-item-curr');
        if (!wIssue.length) {
            errorBlink(W('#IssueList .check-item'));
            return false;
        }
        params['problem_id'] = wIssue.attr('data-issueid');
        if (params['problem_id']=='11') {
            params['other_issue_desc'] = W('[name="other_issue_desc"]').val();
        }
        // 手机号
        var wMobile = W('#JiuxiuUserMobile'),
            mobile_val = wMobile.val().trim();
        if( !/^\d{11}$/.test(mobile_val)){
            wMobile.shine4Error().focus();
            return false;
        }
        params['login_mobile'] = mobile_val;
        // 验证码
        var wSecode = W('#JixiuSecode'),
            secode_val = wSecode.val().trim();
        if (!secode_val) {
            wSecode.shine4Error().focus();
            return false;
        }
        params['secode'] = secode_val;

        var wPostkey = W('[name="postkey"]'),
            postkey_val = wPostkey.val();
        if(!postkey_val){
            alert('操作过期，请刷新页面重试')
            return false;
        }
        params['postkey'] = postkey_val;

        return params;
    }

    /**
     * 错误提示闪烁
     * @param  {[type]} wEl [description]
     * @param  {[type]} th  [description]
     * @return {[type]}     [description]
     */
    function errorBlink(wEl, th){
        if (!(wEl&&wEl.length)) {
            return ;
        }
        window.ThList = window.ThList ? window.ThList : {};

        if (th) {
            clearInterval(th);
        }

        wEl.addClass('errorblink');

        var c = 0, k = Math.random();
        ThList[k] = setInterval(function(){
            if (c % 2) {
                wEl.removeClass('errorblink');
            } else {
                wEl.addClass('errorblink');
            }
            c = c +1;
            if(c > 9){
                clearInterval(ThList[k]);
                c = 0;
            }
        }, 180);

        return ThList[k];
    }
    /**
     * 清除错误闪烁
     * @return {[type]} [description]
     */
    function clearErrorBlink(){
        window.ThList = window.ThList ? window.ThList : {};

        QW.ObjectH.map(window.ThList, function(v){
            clearInterval(v);
        });

        window.ThList = {};
    }

    function setXiuOrderLatestMobile(){
        var wMobile = W('#JiuxiuUserMobile');

        var b_url = BASE_ROOT.substring(7);
        if (b_url[b_url.length-1]=='/') {
            b_url = b_url.substring(0, b_url.length-1)
        }

        QW.Cookie.set('XIU_ORDER_LATEST_LOGIN_MOBILE', wMobile.val().trim(), {'expires':30*24*3600*1000, 'domain':'.'+b_url, 'path':'/' });
    }
    function getXiuOrderLatestMobile(){
        var mobile = QW.Cookie.get('XIU_ORDER_LATEST_LOGIN_MOBILE')

        return mobile ? mobile : '';
    }
    // 设置验证码按钮的状态
    function setYanzhengStatus(){
        var wMobile = W('#JiuxiuUserMobile'),
            mobile = wMobile.val();

        if (!mobile) {
            mobile = getXiuOrderLatestMobile();
            wMobile.val(mobile);
        }

        if (!mobile) {
            return ;
        }

        QW.Ajax.get('/aj_xiu/secode_ltime?mobile='+mobile+'&type=add_order', function(res){
            res = JSON.parse(res);

            if (!res['errno']) {
                if (res['result']==0) {
                    return ;
                }

                var wSecode = W('.xiu-btn-yanzheng');
                wSecode.addClass('btn-vcode-disabled').html(res['result']+'秒后再次发送');
                distimeAnim(res['result'], function(time){
                    if(time<=0){
                        wSecode.removeClass('btn-vcode-disabled').html('发送验证码');
                    }else{
                        wSecode.html( time + '秒后再次发送');
                    }
                });
            }
        });
    }
    
    //开始点击第一个手机型号
    function click_first_mobile(){
    	var model_con = document.getElementById('ModelList');
    	var childArr  = model_con.children || model_con.childNodes;
    	var f_node    = null;
    	for(var i = 0;i<childArr.length;i++){
    		if(childArr[i].nodeType==1){
        		f_node = childArr[i];
        		break;
    		}
    	}
    	//如果本品牌下无手机则返回
    	if( f_node==null ){
    		return;
    	}
        var wMe = W(f_node);

        wMe.addClass('check-item-curr').siblings('.check-item-curr').removeClass('check-item-curr');

        QW.Ajax.get('/aj_xiu/get_wx_price?pc_id='+wMe.attr('data-modelid'), function(res){
            try{
                res = JSON.parse(res);

                if (!res['errno']) {
                    var key_datas = {
                        'parts_list': []
                    };

                    QW.ObjectH.map(res['result'], function(el, k){
                        key_datas['parts_list'].push(k);
                    });
    				var tmpl_str = "";
    				if(! (Object.prototype.toString.call(res['result']) == '[object Array]') ){
    				    for( var key in res['result'] ){
    					    var price_des = "";

    					    if( parseInt(res['result'][key].fault_classid)==18 && parseFloat(res['result'][key].price_min)>0 ){
    						    price_des = "￥" + parseInt(res['result'][key].price_min) + "-" + "￥" + parseInt(res['result'][key].price_360);
    					    }else{
    						    price_des = "￥" + parseInt(res['result'][key].price_360);
    					    }
    				        tmpl_str = tmpl_str + "<div class=\"xiu-price-item\"><div class=\"xiu-price-item-desc\">" + res['result'][key].class_desc + "</div><div class=\"xiu-price-item-price\">" + price_des + "</div></div>";
    				    }
    				}
    				W('.xiu-brand-all').html(tmpl_str);

                    WxPrice = res['result'];
                } else {
                    //W('.xiu-brand-apple, .xiu-brand-samsung').query('a').hide();
                }
            } catch(ex){
                //W('.xiu-brand-apple, .xiu-brand-samsung').query('a').hide();
            }
        });
        // getRepairCost();
    }
    function _init(){

        setYanzhengStatus();
        click_first_mobile();
    }

    _init();
   
    
});
