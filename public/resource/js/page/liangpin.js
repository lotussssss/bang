Dom.ready(function(){

    var CancelPanel = null;

    tcb.bindEvent(document.body, {
        // 商品item
        '.search-result .prd-item, .model-relation .prd-item': {
            'mouseenter': function(e){
                W(this).addClass('prd-item-hover');
            },
            'mouseleave': function(e){
                W(this).removeClass('prd-item-hover');
            }
        },
        // 商品许愿
        '.search-result .prd-item .prd-wish': function(e){
            e.preventDefault();
            var wMe = W(this),
                wItem = wMe.ancestorNode('.prd-item');

            var req_url = '/aj_lp/sub_xinyuan',
                params = {
                    'amount': wItem.attr('data-amount'),
                    'model_id': wItem.attr('data-mid'),
                    'xy_postkey': getXYPostkey()
                };

            QW.Ajax.post(req_url, params, function(rs){
                rs = QW.JSON.parse(rs);
                if(rs.errno){
                    alert(rs.errmsg+'，请刷新页面重试');
                }else{
                    setXYPostkey(rs.result.xy_postkey);
                    var str_wrap = '<div class="wish-qrcode-wrap">'
                        +'<div class="row tcenter"><img src="'+rs.result.qrcode+'" alt=""/><div class="tip">扫码，同步至微信</div></div>'
                        +'<div class="row tcenter">心仪手机一旦出现，我们第一时间通知您</div>'
                        +'</div>';
                    var rect = wItem.getRect();
                    var wStr_wrap = W(str_wrap);
                    wStr_wrap.css({
                        'position': 'absolute',
                        'top': 0,
                        'right': 0,
                        'left': 0,
                        'bottom': 0
                    });

                    wStr_wrap.appendTo(wItem);
                    setTimeout(function(){
                        if(wStr_wrap && wStr_wrap.length){
                            wStr_wrap.removeNode();
                        }
                    }, 60000);
                }
            });

        },

        // 取消订单
        '.cancel-order': function(e){
            e.preventDefault();

            var wMe = W(this);
            var re_type = wMe.attr('data-type');
            if( re_type == 3 ){
                // 退货
                var tmpl_fn = W('#LiangpinCancelOrderReturnPanelTpl').html().trim().tmpl(),
                    tmpl_st = tmpl_fn({
                        'cancel_tip': wMe.attr('data-tip'),
                        'cancel_type': wMe.attr('data-type'),
                        'orderid': wMe.attr('data-orderid')
                    });
            }else{
                var tmpl_fn = W('#LiangpinCancelOrderPanelTpl').html().trim().tmpl(),
                    tmpl_st = tmpl_fn({
                        'cancel_tip': wMe.attr('data-tip'),
                        'cancel_type': wMe.attr('data-type'),
                        'orderid': wMe.attr('data-orderid')
                    });
            }



            CancelPanel = tcb.panel('', tmpl_st, {'className': 'liangpin-cancel-order-panel-wrap'});
        },
        // 确认[取消订单/申请退款/申请退货]
        '.liangpin-cancel-order-panel .btn-confirm': function(e){
            e.preventDefault();

            var wMe = $(this);
            var wMe_wrap = wMe.closest('.liangpin-cancel-order-panel')

            var url_obj = {
                '1': '/liangpin_my/aj_close_order', // 取消订单
                '2': '/liangpin_my/applyrefund', // 申请退款
                '3': '/liangpin_my/doAfterSales' // 申请退货
            };
            var url = url_obj[wMe.attr('data-type')],
                order_id = wMe.attr('data-orderid');
            if (!url) {
                alert('非法操作！');
            }
            var request_data = {'order_id':order_id}
            if(wMe.attr('data-type') == '3'){
                request_data['user_apply_handle'] = wMe_wrap.find('[name="user_apply_handle"]').val()
                request_data['user_apply_reason'] = wMe_wrap.find('[name="user_apply_reason"]').val()
                request_data['user_apply_memo'] = wMe_wrap.find('[name="user_apply_memo"]').val()
            }
            $.getJSON(url,request_data, function(res){
                if(CancelPanel && CancelPanel.hide){
                    CancelPanel.hide();
                }
                if (wMe.attr('data-type') == '3') {
                    if (res.errno!=0) {
                        alert('抱歉，申请失败。')
                    } else {
                        alert('申请成功。')
                    }
                    window.location.reload();
                    return;
                }
                var query = tcb.queryUrl(window.location.href);
                window.location.href = tcb.setUrl('/liangpin_my/order_detail?order_id='+order_id, '"from":"'+(query['from']?query['from']:'')+'"');
                //window.location.reload();
            });
        },
        //售后表单中改变原因组
        '[name="user_apply_handle"]': {
            'change': function () {
                var group_id = $(this).val()
                $('[name="user_apply_reason"] option').each(function (index,item) {
                    var sig_group_id = $(item).attr('data-reason_group')
                    if(sig_group_id == group_id){
                        $(item).addClass('show').removeClass('hide')
                    }else{
                        $(item).removeClass('show').addClass('hide')
                    }
                })
                $('[name="user_apply_reason"] option.show').eq(0).prop('selected',true)
            }
        },
        // 不取消
        '.liangpin-cancel-order-panel .btn-cancel': function(e){
            e.preventDefault();

            if(CancelPanel && CancelPanel.hide){
                CancelPanel.hide();
            }
        }
    });

    // 优品许愿
    tcb.lpWishFormSubmit(W('.block-wish .wish-form'))

	//订单详情页内支付
	W('#payOrderOnline').on('click', function(){
        var wMe = W(this);

        if (wMe.hasClass('btn-disabled')){
            return ;
        }
        var orderid = W(this).attr('data-orderid'),
            //bankcode = W(this).attr('data-bankcode'),
            //url = '/youpin/subpay?order_id=' + orderid;
			url = "/youpin/cashier?order_id=" + orderid;

        //如果是微信支付，不跳转
		/*
        if(bankcode == 'WXPAY_JS'){
            var qrCodeSrc = '/youpin/qrcode/?order_id=' + orderid + '&weixin_pay=1';
            tcb.alert("微信支付",'<div style="padding:10px;"><h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2><div style="text-align:center"><img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="'+qrCodeSrc+'"></div></div>', {
                width:300,
                height:350
            }, function(){
                window.location.reload();
                return true;
            });

            return;
        }

        if(bankcode){
            url += '&bank_code='+bankcode;
        }
		*/
		window.open(url);
		tcb.panel('订单支付', '<div style="padding:20px;font-size:14px; text-align:center">请在新窗口中完成支付。</div>', {
			width: 300,
			height: 150,
			btn: [{
                txt: "支付成功",
                fn: function(){window.location.reload();},
                cls: "ok"
            }, {
                txt: "支付遇到问题",
                fn: function(){window.location.reload();}
            }]
		});
	});

	//买家确认收货
	W('#confirmDeal').on('submit', function(e){
		e.preventDefault();

		if( confirm('您要确认收货吗？确认后将自动打款给商家。') ){
			QW.Ajax.post( '/liangpin_my/buyerconfirm', this, function(rs){
				rs = QW.JSON.parse(rs);
				if(rs.errno){
					alert('抱歉，确认收货失败。' + rs.errmsg);
				}else{
					window.location.reload();
				}
			} );
		}
	});

});
