(function() {
	var CrossDomainRequest = function(url, data, fun, method){
		var random = +new Date();
		var callbackName = '';
		
		if(typeof fun == 'string') {
			callbackName = fun;
		}else{
			callbackName = '_CrossDomainCallback' + random;
			window[callbackName] = function(){
				var arg = decodeURIComponent(arguments[0]);
				
				_div.parentNode.removeChild(_div);
				return fun(arg);
			}
		}
		
		var _div = document.createElement("div");
		_div.innerHTML = '<iframe style="display:none" id="' + '_CrossDomainiframe' + random + '" name="' + '_CrossDomainiframe' + random + '" src="javascript:void(function(d){d.open();d.domain=\'360.cn\';d.close();}(document));"></iframe>';

		document.body.appendChild(_div);
		
		var html = [];
		html.push('<input type="hidden" name="callback" value="' + callbackName + '" />');
		html.push('<input type="hidden" name="proxy" value="http://' + location.host + '/psp_jump.html" />');
		
		var xForm = document.createElement('FORM');
		xForm.style.display = "none";
		xForm.method = method || 'post';
		xForm.target = '_CrossDomainiframe' + random;
		xForm.action = url;
		xForm.innerHTML = html.join('');

		for(var item in data){
			var xInput = document.createElement("input");
				xInput.setAttribute("type","hidden");
				xInput.setAttribute("name",item);
				xInput.setAttribute("value",data[item]);
			 xForm.appendChild(xInput);
		}
		
		setTimeout(function() {
			document.body.appendChild(xForm); 
			xForm.submit();
			xForm.parentNode.removeChild(xForm);
		}, 50);
	};

	QW.provide('CrossDomainRequest', CrossDomainRequest);
})();