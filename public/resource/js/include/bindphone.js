(function() {
	window['getAuthCodeCallback'] = function(d) {
		var btn = W('#btnGetAuthCode'),
			el = W('#txtMobilePhone');


		if(parseInt(d.errno) !== 0) {
			btn.removeAttr('disabled');
			Valid.fail(el[0], decodeURIComponent(d.errmsg) || '获取校验码失败！', true);
			return;
		}

		btn.attr('disabled', 'disabled').html('(120) 重发');

		var count = 120,
			timer = setInterval(function() {
				if(count < 1) {
					clearInterval(timer);
					btn.removeAttr('disabled').html('发送校验码');
				} else {
					btn.html('(' + (count--) + ') 重发');
				}
			}, 1000);

	};

	window['saveMobilePhoneCallback'] = function(d) {
		var btn = W('#btnSaveMobilePhone');

		if(parseInt(d.errno) !== 0) {
			btn.removeAttr('disabled');
			alert(decodeURIComponent(d.errmsg) || '绑定手机号码失败！');
			return;
		}

		if(window['afterBindPhone']) {
			(window['afterBindPhone'])();
		}
	};

	W(document.body).delegate('#btnGetAuthCode', 'click', function(e) {
		e.preventDefault();

		var elMobilePhone = W('#txtMobilePhone');

		if(W(this).get('disabled')) {
			return false;
		}

		if(!Valid.check(elMobilePhone[0], true)) {
			return false;
		}

		QW.CrossDomainRequest('http://i.360.cn/smsApi/sendSmsCode', 
			{
				'account' : elMobilePhone.val(),
				'acctype' : 2,
				'condition' : 2,
				'src' : 'pcw_jishi'
			}, 'getAuthCodeCallback', 'post');

		W(this).attr('disabled', 'disabled');
	}).delegate('#btnSaveMobilePhone', 'click', function(e) {
		e.preventDefault();

		var elMobilePhone = W('#txtMobilePhone'),
			elAuthCode = W('#txtAuthCode'),
			elPassword = W('#txtPassword');

		if(W(this).get('disabled')) {
			return false;
		}

		if(!Valid.check(elMobilePhone[0], true) || !Valid.check(elAuthCode[0], true) || !Valid.check(elPassword[0], true)) {
			return false;
		}

		QW.CrossDomainRequest('http://i.360.cn/security/dobindMobile', 
			{
				'mobile' : elMobilePhone.val(),
				'smscode' : elAuthCode.val(),
				'password' : hex_md5(elPassword.val()),
				'crumb' : W('#txtCrumb').val(),
				'src' : 'pcw_jishi'
			}, 'saveMobilePhoneCallback', 'post');

		W(this).attr('disabled', 'disabled');
	});
})();