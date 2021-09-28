(function() {
	/**
	 * 消息操作，包括批量，单条
	 * @param  {[type]} mid  [消息id]
	 * @param  {[type]} type [操作类型]
	 * @return {[type]}      [description]
	 */
	function operateMsg(mid,type,callback){
		var url = type=="delete"  ? "/mer_message/delete/" :"/mer_message/read/"
		QW.Ajax.post(url,{
				'mid[]':mid
			},function(e){
				var ret = e.evalExp();
                if(parseInt(ret.errno, 10) != 0) {
                    alert(ret.errmsg);
                    return;
                }
                if(typeof callback =="boolean"){
                	location.reload();
                }else{
                	callback&& callback();
                }
                
		})
	}

	tcb.bindEvent(document.body, {
		/**
		 * 查询
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'input.chaxunbtn':function(e){
			var form = QW.g('searchForm');

    		if(!Valid.checkAll(form)) {
    			return false;
    		}

    		form.submit();
		},
		/**
		 * 查看消息
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'a.msg' : function(e) {
			e.preventDefault();
			var that = W(this);
			var mid = that.attr('data-mid');
			if(that.attr('data-mstatus')=="unread"){
				//点击就设为已读
				operateMsg(mid,'read',function(){
					that.css('color','#999');
				});	
			}
			var content =  W('#messageTpl').html().tmpl({
				'msg_sender': that.parentNode('td').previousSibling('td').html(), 
				'msg_content': that.nextSibling('div').html()
			});

			var panel = tcb.panel('消息', content, {
				'width' : 565, 
				'wrapId' : 'panelMessage', 
				btn: [{
                    txt: "删除",
                    fn: function(){
                    	if(!confirm('您真的要删除这条消息吗？')) {
			                return false;
			            }
                    	operateMsg(mid,'delete',true);
                    }
            	},{
                    txt: "关闭",
                    fn: function(){
                    	return true;
                    }
            	}]
            });
		},
		/**
		 * 单选操作
		 * @return {[type]} [description]
		 */
		'input.selone':function(){
			var flag = true;
			W("[name=sel]").forEach(function(item,i){
				if(!W(item).attr("checked")){
					flag  = false;
					return;
				}; 
			})
			W('input.checkboxmar').attr("checked", flag); 
		},
		/**
		 * 多选操作
		 * @return {[type]} [description]
		 */
		'input.checkboxmar':function(){
			W("[name=sel]").attr("checked",W(this).attr("checked")); 
		},
		/**
		 * 删除单条
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'a.delete':function(e){
			e.preventDefault();
			if(!confirm('您真的要删除这条消息吗？')) {
                return false;
            }
            var mid = W(this).attr('data-mid');
            operateMsg(mid,'delete',true);
		},
		/**
		 * 批量删除消息
		 * @return {[type]} [description]
		 */
		'input.batchdelete':function(){
            var mid = [];
			W("[name=sel]").forEach(function(item,i){
				if(W(item).attr("checked")){
					mid.push(W(item).attr('data-mid'));
				}
			});
			if(mid.length==0){
				tcb.alert('提示','<div style="padding:20px">请选择一条消息</div>',{'width' : 280, 'wrapId' : 'panelMessage', },function(){return true;});
				return;
			}
			if(!confirm('您真的要删除这些消息吗？')) {
                return false;
            }
           operateMsg(mid,'delete',true);
		},
		/**
		 * 设为已读
		 * @return {[type]} [description]
		 */
		'input.hasread':function(){
			var mid = [];
			W("[name=sel]").forEach(function(item,i){
				if(W(item).attr("checked")){
					mid.push(W(item).attr('data-mid'));
				}
			});
			if(mid.length==0){
				tcb.alert('提示','<div style="padding:20px">请选择一条消息</div>',{'width' : 280, 'wrapId' : 'panelMessage', },function(){return true;});
				return;
			}
			operateMsg(mid,'read',true);
		}

	});
})();