var MyOrderList = MyOrderList || (function(){
	var __pn = 0;
	var __box = $('.my-order-content-main');
	var __url = '/m/my_order?ajax=1';
	var __isLoad = false; //是否正则加载
	var __hasMore = true; //是否还有更多

	function init(){
		bindEvent();
		fetch();
	}

	function bindEvent(){
		//下拉加载
		var LOAD_OFFSET = 200;

		$(window).on('scroll load', function(e){
			var st = $(window).scrollTop(), wh = $(window).height(), dh=$(document).height();
			
			if( st + wh + LOAD_OFFSET >= dh ){
				nextPage();				
			}

			if(dh > wh){
				if( !$('body').hasClass('more1screen') ){ $('body').addClass('more1screen') }
			}
		});

		$('.my-order-content-head .selector').on('change', function(){
			resetParam();
			fetch();
		});
	}

	function nextPage(){
		__pn ++ ;
		fetch();
	}

	function getFilterParams(){
		var time = $('#order_time').val(),
			status = $('#order_status').val();

		return 'time=' + time + '&status=' + status + '&pn=' + __pn;
	}

	function resetParam(){
		__pn = 0;
		__hasMore = true;
		__isLoad = false;
		__box.html('');
	}

	function fetch(){
		if(__isLoad || !__hasMore){
			return;
		}
		
		__isLoad = true;
		showLoading(__isLoad);

		var url = __url + '&' + getFilterParams();

		$.getJSON(url, function(data){
			__isLoad = false;
			showLoading(__isLoad);
			dealData(data);
		});
	}

	function dealData(data){
		if(data.errno){
			alert(data.errmsg);
			return;
		}

		if(!data.result || data.result.length==0){
			__hasMore = false;
			__box.append('<div class="no-order">没有更多订单了~</div>');
			return ;
		}

		var list = data.result;
		var html = [];

		for(var i=0, n= list.length; i<n; i++){
			var $order_info = list[i];

            switch(parseInt($order_info.status, 10)){
                case 1:
                    $order_info.status_cls = 'order-status-wait-pay';
                    $order_info.status_txt = '等待付款';
                    break;
                case 10:
                    $order_info.status_cls = 'order-status-wait-repair';
                    $order_info.status_txt = '等待维修';
                    break;
                case 20:
                    $order_info.status_cls = 'order-status-wait-repair';
                    $order_info.status_txt = '等待确认';
                    break;
                case 30:
                    $order_info.status_cls = 'order-status-wait-repair';
                    $order_info.status_txt = '等待评价';
                    break;
                case 100:
                case 101:
                    $order_info.status_cls = 'order-status-wait-repair';
                    $order_info.status_txt = '交易完成';
                    break;
                case 105:
                    $order_info.status_cls = 'order-status-done';
                    $order_info.status_txt = '订单关闭';
                    break;
                case 110:
                    $order_info.status_cls = 'order-status-wait-repair';
                    $order_info.status_txt = '订单冻结';
                    break;
                case 120:
                    $order_info.status_cls = 'order-status-wait-repair';
                    $order_info.status_txt = '订单退款';
                    break;
            }

			html.push('<div class="order-item">');			
			html.push('<div class="line line-top  clearfix">');
			html.push('<div class="left"><span class="',$order_info.status_cls,'">',$order_info.status_txt,'</span></div>');
			html.push('<div class="left"><span class="order-date">',$order_info.create_time,'</span></div>');
			html.push('<div class="right"><span class="money-symbol">￥</span><span class="money">',$order_info.s_real_price,'</span></div>');
			html.push('</div>');
			html.push('<div class="line"><div class=""><a class="shop-name" href="/m/shop/?shopid=',$order_info.shop_id,'">',$order_info.shop_name,'</a></div></div>');
			html.push('<div class="line"><div class=""><a class="address" href="http://mo.amap.com/?q=',$order_info.map_latitude,',',$order_info.map_longitude,'&name=',$order_info.shop_name,'&dev=0">',$order_info.addr_detail,'</a></div></div>');
			html.push('<div class="line"><div class=""><span class="code-title">订单号：</span><span class="code">',$order_info.order_id,'</span></div></div>');
			if($order_info.status!=1 &&  $order_info.status!=105 && $order_info.order_checkcode){
				html.push('<div class="line"><div class=""><span class="code-title">维修验证码码：</span><span class="code">',$order_info.order_checkcode,' </span></div></div>');            
            }
            if($order_info.status==1){
            	html.push('<div class="line"><a href="/m/subpay/?order_id=',$order_info.order_id,'" target="_blank" class="shop-content-paybutton-s">支付</a></div>');            
            }		
			html.push('</div>');    
		}

		html = html.join('');

		__box.append(html);
	}

	function showLoading(show){
		var loadding = $('<div class="loadding">加载中，请稍后...</div>');
		if(show){
			__box.append(loadding);
		}else{
			$('.my-order-content-main .loadding').remove();
		}
	}

	return {
		'init' : init
	}
})();