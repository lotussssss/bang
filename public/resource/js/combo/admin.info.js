;/**import from `/resource/js/component/calendar.js` **/
(function() {
	var Calendar = {
		VERSION: "0.0.1",
		calendarPath: '/resource/'
	};

	var mix = QW.ObjectH.mix,
		formatDate = QW.DateH.format,
		NodeH = QW.NodeH,
		g = NodeH.g;

	mix(Calendar, {
		monthMsg: ["\u4E00\u6708", "\u4E8C\u6708", "\u4E09\u6708", "\u56DB\u6708", "\u4E94\u6708", "\u516D\u6708", "\u4E03\u6708", "\u516B\u6708", "\u4E5D\u6708", "\u5341\u6708", "\u5341\u4E00\u6708", "\u5341\u4E8C\u6708"],
		dayMsg: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"],
		firstDay: 1,
		//first day of week. 1: Monday is the first day; 0: Sunday is the first day
		maxDate: (new Date().getFullYear() + 50) + "/12/31",
		minDate: "1980/01/01",
		_rendered: false,
		_render: function() {
			if (Calendar._rendered) return;

			var sStyle = '#cal_wrap{text-align:center;color:#555;background-color:#f2f2f2;border:1px solid #ccc;zoom:1}\
#cal_wrap button,#cal_wrap select {font-size:12px;}\
#cal_hd{padding:5px;}\
#cal_hd select{width:75px;vertical-align: middle;}\
#cal_hd map{float:left}\
#cal_bd{padding:0 5px;}\
#cal_bd table{border-collapse: collapse;width:100%;}\
#cal_bd thead th{padding:3px 0;font-weight:bold;}\
#cal_bd tbody{width:100%;}\
#cal_bd td,#cal_bd th{border:0;text-align: center;font-size: 12px;width:14%;padding:1px;}\
#cal_bd td{padding:0px;border: 1px #ccc solid;background-color:#fff;}\
#cal_bd td a,#cal_bd td span{text-decoration: none;color:#333;padding:2px;display:block;zoom:1;}\
#cal_bd td.othermonthdayTd a{color:#999;}\
#cal_bd td span{color:#B5B5B5;}\
#cal_bd td a:hover{color:#fff;background-color:#DDD;}\
#cal_bd .thisdayTd a{color:#fff;background-color:#999;}\
#cal_bd .sundayTd a{color:#60B10D;}\
#cal_bd .saturdayTd a{color:#60B10D;}\
#cal_bd .invaliddayTd span{text-decoration:line-through}\
#cal_ft {padding:5px 0;}';
			var oStyle = document.createElement("style");
			oStyle.type = "text/css";
			if (oStyle.styleSheet) {
				oStyle.styleSheet.cssText = sStyle;
			} else {
				oStyle.appendChild(document.createTextNode(sStyle));
			}
			document.getElementsByTagName("head")[0].appendChild(oStyle);
			var html = [];
			var sSelect = ['<select></select> ', '<img src="https://p.ssl.qhimg.com/t0184e77e33226ec7a6.gif" align="absMiddle" usemap="#year_change_map"/>', '<map name="year_change_map">', '<area shape="rect" coords="0,0,13,8" href="#"/>', '<area shape="rect" coords="0,10,13,17" href="#"/>', '</map>'].join("");
			html.push('<div id="cal_hd">' + sSelect + '&nbsp;&nbsp;' + sSelect.replace(/year/g, "month") + '</div>', '<div id="cal_bd" align=center width=100% ></div>', '<div id="cal_ft">', '<button>\u786E\u5B9A</button>&nbsp;&nbsp;', '<button>\u6E05\u7A7A</button>&nbsp;&nbsp;', '<button>\u53D6\u6D88</button>', '</div>');
			oWrap = g("cal_wrap");
			oWrap.innerHTML = html.join("");
			oBody = oWrap.childNodes[1];
			oBody.onclick = function(e) {
				var el = QW.EventH.getTarget(e);
				if (el.tagName != "A") return;
				var value = el.getAttribute("dateValue");
				if (value != null) {
					Calendar.backfill(value);
				}
			};
			var els = oWrap.getElementsByTagName("select");
			oYear = els[0];
			oMonth = els[1];
			oYear.onchange = oMonth.onchange = Calendar.redraw;
			els = oWrap.getElementsByTagName("area"); //上下翻年月
			els[0].onclick = function() {
				if (oYear[SI] > 0) {
					oYear[SI]--;
					Calendar.redraw();
				};
				return false;
			};
			els[1].onclick = function() {
				if (oYear[SI] < oYear.length - 1) {
					oYear[SI]++;
					Calendar.redraw();
				};
				return false
			};
			els[2].onclick = function() {
				if (oMonth[SI] == 0) {
					if (oYear[SI] > 0) {
						oYear[SI]--;
						oMonth[SI] = (oMonth[SI] + oMonth.length - 1) % oMonth.length;
					}
				} else {
					oMonth[SI] = (oMonth[SI] + oMonth.length - 1) % oMonth.length;
				}
				Calendar.redraw();
				return false;
			};
			els[3].onclick = function() {
				if (oMonth[SI] == oMonth.length - 1) {
					if (oYear[SI] < oYear.length - 1) {
						oYear[SI]++;
						oMonth[SI] = (oMonth[SI] + 1) % oMonth.length;
					}
				} else {
					oMonth[SI] = (oMonth[SI] + 1) % oMonth.length;
				}
				Calendar.redraw();
				return false;
			};
			els = oWrap.getElementsByTagName("button");
			els[0].onclick = function() {
				if (selectedDate) Calendar.backfill(formatDate(selectedDate));
			};
			els[1].onclick = function() {
				Calendar.backfill("");
			};
			els[2].onclick = function() {
				Calendar.backfill();
			};
			Calendar._rendered = true;
		},
		init: function() {
			if (!Calendar._rendered) Calendar._render();
			var el = window.latestDateInput || document.createElement("input");
			maxDate = new Date((el.getAttribute("maxValue") || Calendar.maxDate).replace(/\.|-/g, "/"));
			minDate = new Date((el.getAttribute("minValue") || Calendar.minDate).replace(/\.|-/g, "/"));
			var val = el.value;
			if (val) defaultDate = new Date(val.replace(/\.|-/g, "/"));
			if (isNaN(defaultDate) || !val) defaultDate = window.systemDate || new Date();
			var year = defaultDate.getFullYear();
			var minY = minDate.getFullYear();
			var maxY = maxDate.getFullYear();
			oYear.length = maxY - minY + 1;
			for (var i = 0; i <= maxY - minY; i++) {
				var oOption = oYear.options[i];
				oOption.value = oOption.text = i + minY;
			}
			if (year >= minY && year <= maxY) oYear.value = year;
			else oYear[SI] = 0;
			var month = defaultDate.getMonth(),
				minM = 0,
				maxM = 11;
			if (minY == maxY) {
				minM = minDate.getMonth();
				maxM = maxDate.getMonth();
			}
			oMonth.length = maxM - minM + 1;
			for (var i = 0; i <= maxM - minM; i++) {
				var oOption = oMonth.options[i];
				oOption.value = i + minM + 1;
				oOption.text = Calendar.monthMsg[i + minM];
			}
			if (month >= minM && month <= maxM) oMonth.value = month + 1;
			else oMonth[SI] = 0;
			Calendar.redraw();
		},
		redraw: function() {
			selectedDate = null;
			var html = ['<table><thead><tr>'];
			for (var i = 0; i < 7; i++) html.push('<th class="titleTd">' + Calendar.dayMsg[(i + Calendar.firstDay) % 7] + '</th>');
			html.push('</tr></thead><tbody>');
			var year = oYear.value | 0;
			var month = oMonth.value - 1;
			var date = Math.min(defaultDate.getDate(), new Date(year, month + 1, 0).getDate());
			var fromDate = -(new Date(year, month, 1).getDay() + 7 - Calendar.firstDay) % 7 + 1;
			for (var i = 0; i < 42; i++) {
				var d = new Date(year, month, fromDate + i);
				if (i % 7 == 0) html.push('<tr>');
				var tdClass = "commondayTd";
				if (d > maxDate || d < minDate) {
					html.push('<td class=invaliddayTd><span title="\u65E5\u671F\u8D85\u51FA\u53EF\u9009\u8303\u56F4">' + d.getDate() + '</span></td>');
				} else {
					if (d.getMonth() == month && d.getDate() == date) {
						tdClass = "thisdayTd";
						selectedDate = d;
					} else if (d.getDay() == 0) tdClass = "sundayTd";
					else if (d.getDay() == 6) tdClass = "saturdayTd";
					if (d.getMonth() != month) tdClass = "othermonthdayTd";
					html.push('<td class=' + tdClass + '><a href="#" onclick="return false;" dateValue="' + formatDate(d) + '" title="' + formatDate(d) + '" >' + d.getDate() + '</a></td>');
				}
				if (i % 7 == 6) {
					html.push('</tr>');
				}
			}
			html.push('</tbody></table>');
			oBody.innerHTML = html.join("");
		},
		backfill: function(d) {
			if (d != null) {
				var el = window.latestDateInput;
				try {
					if (el != null) {
						setTextValue(el, d);
						el.select();
						el.focus();
					}
				} catch (ex) {}
			}
			try {
				window.calendarPopup.hide();
			} catch (ex) {}
		}
	});
	var oWrap, oBody, oYear, oMonth;
	var maxDate, minDate, selectedDate, defaultDate; //分别是：输入框的最大日期、最小日期、临时选中日期、默认日期（如果有值就是本身，否则就是系统时间）。
	var SI = "selectedIndex"; //节约点资源

	function setTextValue(obj, value) {
		if (obj.createTextRange) obj.createTextRange().text = value;
		else obj.value = value;
	}

	QW.Calendar = Calendar;
}());

/*function LayerPopup(opts){
	var me=this;
	var div=document.createElement('div');
	div.style.position='absolute';
	div.style.width='200px';
	div.style.zIndex=100;
	div.style.backgroundColor='#fff';
	div.style.border='solid #cccccc 1px';
	document.body.insertBefore(div,document.body.firstChild);
	div.innerHTML='<div></div>';
	var bdDiv=div.getElementsByTagName('div')[0];
	me.oWrap=div;
	me.hide=function(){div.style.display='none';};
	me.show=function(x,y,w,h,el){
		var style=this.oWrap.style;
		//设宽/高
		if(w!=null){
			style.width=w+"px";
		}
		if(h!=null){
			style.height=h+"px";
		}
		//设位置
		{
			x=x||0;
			y=y||0;
			if(el){
				var xy=QW.NodeH.getXY(el);
				x+=xy[0];
				y+=xy[1];
			}
			style.left=x+"px";
			style.top=y+"px";
		}
		style.display="block";
	};
	me.setContent=function(innerHtml){
		bdDiv.innerHTML=innerHtml;
	};
	if(opts.body) me.setContent(opts.body);
}
*/

QW.Calendar.pickDate = function(el) {
	if (el.type != "text") el = el.previousSibling;
	window.latestDateInput = el;
	if (!window.calendarPopup) {
		window.calendarPopup = new LayerPopup({
			body: '<div id="cal_wrap">Calendar</div>'
		});
	}
	QW.Calendar.init();
	var posEl = el,
		calPosElId = posEl.getAttribute('calPosElId');
	if (calPosElId) {
		posEl = QW.NodeH.g(calPosElId);
	}
	window.calendarPopup.show(0, posEl.offsetHeight, 210, null, posEl);
};

;/**import from `/resource/js/component/valid.js` **/
/**	
 * @class Valid Valid form验证
 * @namespace QW
 * @singleton 
 */


(function() {
	var QW = window.QW,
		loadJs = QW.loadJs,
		mix = QW.ObjectH.mix,
		StringH = QW.StringH,
		trim = StringH.trim,
		tmpl = StringH.tmpl,
		dbc2sbc = StringH.dbc2sbc,
		byteLen = StringH.byteLen,
		evalExp = StringH.evalExp,
		formatDate = QW.DateH.format,
		NodeH = QW.NodeH,
		g = NodeH.g,
		query = NodeH.query,
		getValue = NodeH.getValue,
		getAttr2 = function(el, attr) {
			if(!el || !el.getAttribute) return '';
			return el[attr] || el.getAttribute(attr) || getJsAttr(el, attr);
		},
		createElement = QW.DomU.create,
		CustEvent = QW.CustEvent;

	var Valid = {
		VERSION: '0.0.1',
		EVENTS: 'hint,blur,pass,fail,beforecheckall,checkall,initall'.split(','),
		validPath: QW.PATH + 'components/valid/',
		REQ_ATTR: 'reqMsg',
		//默认的必须输入属性名称
		_curReqAttr: 'reqMsg' //当前必须输入属性名称(例如,对于"保存订单草稿"和"下订单"两个按钮,必须输入属性值可能不一样)
	};

	/* 
	* 从JsData中获取element对象的属性
	* @method	getJsAttr
	* @param	{HTMLElement} el 目标对象
	* @param	{string} attribute 属性名称
	* @return	{any}
	*/
	var getJsAttr = function(el, attribute) {
		var CheckRules = Valid.CheckRules;
		if (!CheckRules) return null;
		attribute = attribute.toLowerCase();
		el = g(el);
		var keys = []; //优先度:id>name>className>tagName
		if (el.id) keys.push('#' + el.id); //id
		if (el.name) keys.push('@' + el.name); //name
		keys = keys.concat(el.className.match(/\.[\w\-]+/g) || [], (el.tagName + '').toLowerCase()); //className>tagName
		for (var i = 0, len = keys.length; i < len; i++) {
			var key = keys[i];
			if ((key in CheckRules) && (attribute in CheckRules[key])) return CheckRules[key][attribute];
		}
		return null;
	};
	/**
	 * CheckRules 一个命名空间，用来存贮跟元素对应变量.
	 * @property	{Json} CheckRules 用来存贮跟元素对应的某些变量。
	 Valid.CheckRules={
	 'input':{datatype:'d'},
	 '#myid':{minValue:'2010-01-01'},
	 '@myname':{maxValue:'2011-01-01'},
	 '.myclass':{minValue:'2010-01-01'}
	 };
	 */
	CustEvent.createEvents(Valid, Valid.EVENTS);

	mix(Valid, {
		/** 
		 * 点亮元素
		 * @method hint
		 * @static
		 * @param {Element} el 表单元素 
		 * @return {void}
		 */
		hint: function(el) {
			Valid.fire(new CustEvent(el, 'hint')); //onhint
		},
		/** 
		 * 离开元素
		 * @method blur
		 * @static
		 * @param {Element} el 表单元素 
		 * @return {void}
		 */
		blur: function(el) {
			Valid.fire(new CustEvent(el, 'blur')); //onblur
		},
		/** 
		 * 元素通过验证
		 * @method pass
		 * @static
		 * @param {Element} el 表单元素 
		 * @return {void}
		 */
		pass: function(el) {
			Valid.fire(new CustEvent(el, 'pass')); //onpass
		},
		/** 
		 * 元素未通过验证
		 * @method fail
		 * @static
		 * @param {Element} el 表单元素 
		 * @param {string} errMsg 未通过提示信息 
		 * @param {boolean} needFocus 是否需要focus 
		 * @return {void}
		 */
		fail: function(el, errMsg, needFocus) {
			if (needFocus) Valid.focusFailEl(el);
			var ce = new CustEvent(el, 'fail');
			ce.errMsg = errMsg;

			//Jerry Qu修改。因为IE9下的focus触发是异步的
			setTimeout(function() {
				Valid.fire(ce); //onfail
			}, 0);
		},

		checkAll_stamp: 1,
		//checkAll的次数
		isChecking: false,
		//是否正在checkAll中
		/** 
		 * 验证一个表单的所有元素
		 * @method checkAll
		 * @static
		 * @param {Element} oForm 表单 
		 * @param {boolean} needFocus 是否需要focus 
		 * @param {json} opts其它参数，止前支持以下参数。
		 reqAttr: String,非空标识属性，默认值是Valid.REQATTR,即"reqMsg".
		 myValidator: Function,自己的验证函数，以处理非空验证与dataType验证无法处理的其它特殊验证。checkAll会对元素进行遍历，每个都会调用下myValidator(el)，如果该函数返回false，则表示该元素未通过验证 
		 * @return {boolean} 
		 */
		checkAll: function(oForm, needFocus, opts) {
			needFocus = (needFocus != false);
			var ce = new CustEvent(oForm, 'beforecheckall');
			ce.opts = opts || {};
			Valid.fire(ce); //onbeforecheckall
			Valid.isChecking = true;
			var els = oForm.elements,
				failEls = [];
			for (var i = 0, el; el = els[i++];) {
				if (el) {
					var nd_name = el.nodeName.toLowerCase();
					if (nd_name=='input' || nd_name=='textarea') {
						if (!getAttr2(el, "forceVld") && (el.disabled || el.readOnly || !el.offsetWidth)) continue;
						if (!Valid.check(el, false, opts)) failEls.push(el);
					}
				}
			}
			var isOk = !failEls.length;
			var ce2 = new CustEvent(oForm, 'checkall');
			ce2.result = isOk;
			ce2.failEls = failEls;
			Valid.fire(ce2); //oncheckall
			Valid.isChecking = false;
			Valid.checkAll_stamp++;
			if (!isOk && needFocus){
				window.setTimeout(function() {
					var el = null;
					for(var i=0,length=failEls.length;i<length;i++){
						if (W(failEls[i]).attr('type')!='hidden') {
							el = failEls[i];
							break;
						};
					}
					el && Valid.check(el, true, opts);
				}, 10);
			}
			return isOk;
		},

		/** 
		 * 验证一个表单元素
		 * @method check
		 * @static
		 * @param {Element} el 表单元素 
		 * @param {boolean} needFocus 是否需要focus 
		 * @param {json} opts其它参数，止前支持以下参数。
		 myValidator: Function,自己的验证函数，以处理非空验证与dataType验证无法处理的其它特殊验证。checkAll会对元素进行遍历，每个都会调用下myValidator(el)，如果该函数返回false，则表示该元素未通过验证 
		 * @return {boolean} 
		 */
		check: function(el, needFocus, opts) {
			if (!Validators.required(el) //非空验证
					|| getAttr2(el, "datatype") && !Validators.datatype(el) || (opts && opts.myValidator && !opts.myValidator(el)) //用户自定义验证
					) {
				if (needFocus) {
					Valid.focusFailEl(el);
					Valid.check(el, false, opts);
				}
				return false;
			}
			return true;
		},

		/** 
		 * 将验证结果渲染到页面
		 * @method renderResult
		 * @static
		 * @param {Element} el 表单元素 
		 * @param {boolean} result 是否通过验证 
		 * @param {string} errMsg 未通过验证时的提示信息 
		 * @param {boolean} needFocus 是否需要focus 
		 * @return {void} 
		 */
		renderResult: function(el, result, errMsg, needFocus) {
			if (result) Valid.pass(el);
			else Valid.fail(el, errMsg, needFocus);
		},

		/** 
		 * 焦点集中到未通过验证的Element上
		 * @static
		 * @method focusFailEl
		 * @param {Element} el 表单元素 
		 * @return {void} 
		 */
		focusFailEl: function(el) {
			var fEl = getAttr2(el, "focusEl");
			fEl = fEl && g(fEl) || el;
			try {
				fEl.focus();
				if (!fEl.tagName) return;
				if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(fEl);
				fEl.select();
			} catch (e) {}
		},

		/** 
		 * 初始化验证，包括：监控元素的onfocus/onblur，以及日期后面添加日历按钮
		 * @method initAll
		 * @static
		 * @param {Element} container 容器HTMLElement 
		 * @return {void} 
		 */
		initAll: function(container) {
			if (!Valid._isInitialized) {
				Valid._isInitialized = true;
				if (document.addEventListener) { //非ie
					document.addEventListener('focus', function(e) {
						var el = e.target;
						if (el && ',INPUT,SELECT,TEXTAREA'.indexOf(',' + el.tagName) > -1) {
							Valid.hint(el);
						}
					}, true);
					document.addEventListener('blur', function(e) {
						var el = e.target;
						if (el && ',INPUT,SELECT,TEXTAREA'.indexOf(',' + el.tagName) > -1) {
							Valid.blur(el);
						}
					}, true);
					document.addEventListener('click', function(e) {
						var el = e.target;
						if (el.type == 'checkbox' || el.type == 'radio') {
							Valid.blur(el);
						}
					});
				} else {
					document.attachEvent('onfocusin', function(e) {
						Valid.hint(e.srcElement);
					});
					document.attachEvent('onfocusout', function(e) {
						Valid.blur(e.srcElement);
					});
				}
			}
			var els = query(container, "input");
			for (var i = 0; i < els.length; i++) {
				Valid.initEl(els[i]);
			}
			var ce = new CustEvent(container, 'initall');
			Valid.fire(ce); //oninitall

		},
		/** 
		 * 初始化验证，包括：监控元素的onfocus/onblur，以及日期后面添加日历按钮
		 * @method initEl
		 * @static
		 * @param {Element} container 容器HTMLElement 
		 * @return {void} 
		 */
		initEl: function(el) {
			var dataType = getAttr2(el, "datatype");
			if (dataType == "d" || dataType == "daterange") {//Date日期的后面会有日期按钮
				el.onclick = function(e) {
					Utils.pickDate(el);
				};
				el.autocomplete = 'off';
				//同城帮项目不要日历图标，点文本框就出日期选择浮层
				/*
				var nextEl = el.nextSibling;
				if (nextEl && nextEl.tagName == "IMG") return;
				var img = Utils.getCalendarImg().cloneNode(true);
				img.onclick = function(e) {
					Utils.pickDate(el);
				};
				el.parentNode.insertBefore(img, nextEl);
				*/
			}
		},

		/** 
		 * 将所有的错误验证信息清空。
		 * @method resetAll
		 * @static
		 * @param {Element} oForm FormHTMLElement 
		 * @return {void} 
		 */
		resetAll: function(oForm) {
			var els = oForm.elements;
			for (var i = 0, el; el = els[i++];) {
				Valid.pass(el);
			}
		}
	});


	/**
	 * @class Msgs 提示信息集合,另外提供一个得到提示信息的方法(即getMsg).
	 * @singleton
	 * @namespace QW.Valid
	 */

	var Msgs = Valid.Msgs = {
		n_integer: '请输入小于{$0}的正整数',
		n_format: '数字输入格式为"{$0}"',
		n_upper: '输入值太大，最大允许<strong>{$0}</strong>', //注意：{$0}表示允许值，{$1}表示实际值
		n_lower: '输入值太小，最小允许<strong>{$0}</strong>',
		nrange_from: '您输入的范围不合理',
		nrange_to: '您输入的范围不合理',
		n_useless_zero: '数字前面好像有多余的"0"',
		d_format: '日期输入格式为"YYYY-MM-DD"',
		d_upper: '日期太晚，最晚允许<strong>{$0}</strong>',
		d_lower: '日期太早，最早允许<strong>{$0}</strong>',
		daterange_from: '起始日期不能大于截止日期',
		daterange_to: '截止日期不能小于起始日期',
		daterange_larger_span: "时间跨度不得超过<strong>{$0}</strong>天",
		text_longer: '字数太多，最多允许<strong>{$0}</strong>字', //'{$1}字太多，最多允许<strong>{$0}</strong>字'
		text_shorter: '字数太少，最少允许<strong>{$0}</strong>字', //'{$1}字太少，最少允许<strong>{$0}</strong>字'
		bytetext_longer: '字数太多，最多允许<strong>{$0}</strong>字节', //'{$1}字节太多，最多允许<strong>{$0}</strong>字节'
		bytetext_shorter: '字数太少，最少允许<strong>{$0}</strong>字节', //'{$1}字节太少，最少允许<strong>{$0}</strong>字节'
		richtext_longer: '字数太多，最多允许<strong>{$0}</strong>字',
		richtext_shorter: '字数太少，最少允许<strong>{$0}</strong>字',
		_reconfirm: '两次输入不一致',
		_time: '请检查您输入的时间格式',
		_minute: '请检查您输入的时间格式',
		_email: '请检查您输入的Email格式',
		_mobilecode: '请检查您输入的手机号码',
		_phone: '请检查您输入的电话号码',
		_phonewithext: '请检查您输入的电话号码',
		_phonezone: '请检查您输入的电话区号',
		_phonecode: '请检查您输入的电话号码',
		_phoneext: '请检查您输入的电话分机号码',
		_zipcode: '请检查您输入的邮政编码',
		_idnumber: '请检查您输入的身份证号码，目前只支持15位或者18位',
		_bankcard: '请检查您输入的银行账号',
		_cnname: '请检查您输入的姓名',
		_vcode: '请检查您输入的验证码',
		_imgfile: '请检查您选择的图片文件路径，只支持jpg、jpeg、png、gif、tif、bmp格式',
		_regexp: '请检查您的输入',
		_magic: '请检查您的输入',
		_req_text: '请填写{$0}',
		_req_select: '请选择{$0}',
		_req_file: '请上传{$0}',
		_logicrequired: '{$0}输入不完整',
		/** 
		 * 根据msgKey获取提示信息。
		 * @method getMsg
		 * @static
		 * @param {Element} el 表单元素
		 * @param {string} msgKey msgKey.
		 * @return {string}  
		 */
		getMsg: function(el, msgKey) {
			return getAttr2(el, msgKey) || getAttr2(el, 'errmsg') || Msgs[msgKey] || msgKey;
		}
	};

	/**
	 * @class Utils 一些跟valid相关的函数.
	 * @class singleton
	 * @namespace QW.Valid
	 */

	var Utils = Valid.Utils = {
		/** 
		 * 获取日历按钮小图片。
		 * @method getCalendarImg
		 * @static
		 * @return {Element}  
		 */
		getCalendarImg: (function() {
			var calendarImg = null;
			return function() {
				return calendarImg = calendarImg || createElement('<img src="https://p.ssl.qhimg.com/t01afe970af5f13ae93.gif" align="absMiddle" class="calendar-hdl-img" style="cursor:pointer">');
			};
		}()),
		/** 
		 * 用日历浮动层来输入一个日期。
		 * @method pickDate
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		pickDate: function(el) {
			if (QW.Calendar) {
				QW.Calendar.pickDate(el);
			} else {
				var calendarJsUrl = Valid.validPath + "calendar.js?v={version}"; //to get the calendarUrl Url.
				loadJs(calendarJsUrl, function() {
					QW.Calendar.pickDate(el);
				});
			}
		},
		/** 
		 * 对一个输入框设值。For IE: To keep Undo after change value.
		 * @method setTextValue
		 * @static
		 * @param {Element} el 表单元素
		 * @param {string} value value
		 * @return {void}  
		 */
		setTextValue: function(el, value) {// For IE: To keep Undo after change value.
			if (el.createTextRange) el.createTextRange().text = value;
			else el.value = value;
		},
		/** 
		 * trim一个输入框里的值.
		 * @method trimTextValue
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		trimTextValue: function(el) {
			var s = trim(el.value);
			if (s != el.value) Utils.setTextValue(el, s);
		},
		/** 
		 * 把一个text的值里的全码字符转成半码字符
		 * @method dbc2sbcValue
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		dbc2sbcValue: function(el) {
			var s = dbc2sbc(getValue(el));
			if (s != getValue(el)) Utils.setTextValue(el, s);
		},
		/** 
		 * datatype验证之,做的准备工作
		 * @method prepare4Vld
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		prepare4Vld: function(el) {
			if (getAttr2(el,"ignoredbc")) Utils.dbc2sbcValue(el);
			if (el.type == "text" || el.type == "textarea") Utils.trimTextValue(el); //这个会导致如果用户想用空格排版的话，第一行的排版有误
		}
	};

	/**
	 * @class Validators 校验函数的集合.
	 * @singleton
	 * @namespace QW.Valid
	 */
	var Validators = Valid.Validators = {};
	mix(Validators, [{
		/** 
		 * 非空校验
		 * @method required
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		required: function(el, renderResult) {
			Utils.prepare4Vld(el);
			var reqAttr = Valid._curReqAttr || Valid.REQ_ATTR;
			var sReq = getAttr2(el, reqAttr);
			if (sReq) {//如果有reqMsg属性，则表示为非空
				var reqlogic = getAttr2(el, "reqlogic");
				if (reqlogic) {//非空逻辑验证
					return Validators.logicrequired(el, renderResult, reqlogic);
				} else {
					var isOk = false;
					var msgKey = "_req_text";
					if (el.tagName == "SELECT") {
						isOk = (el.value != "" || el.length < 2 || (el.length == 2 && el.options[1].value == ""));
						msgKey = "_req_select";
					} else if (el.type == "checkbox" || el.type == "radio") {
						var els = document.getElementsByName(el.name);
						for (var i = 0; i < els.length; i++) {
							if (isOk = els[i].checked) break;
						}
						msgKey = "_req_select";
					} else {
						isOk = (getValue(el) != "");
						if (el.type == "file") msgKey = "_req_file";
					}
					if (renderResult != false) Valid.renderResult(el, isOk, !isOk && sReq.indexOf(" ") == 0 ? sReq.substr(1) : tmpl(Msgs[msgKey], [sReq])); //潜规则：如果reqmsg是以空格开头，则尊重其内容
					return isOk;
				}

			}
			return true;
		},
		/** 
		 * 类型校验，校验一个元素的输入是否合法
		 * @method datatype
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} datatype 数据类型
		 * @return {boolean}  
		 */
		datatype: function(el, renderResult, datatype) {
			datatype = datatype || getAttr2(el, 'datatype');
			if (!datatype) {
				Valid.pass(el, renderResult);
				return true;
			}
			var dt = datatype.split('-')[0].toLowerCase(),
				pattern = datatype.substr(dt.length + 1),
				cb = Validators[dt];
			if (!cb) throw 'Unknown datatype: ' + datatype; //找不到对应的datatype，则抛异常
			return pattern ? cb(el, renderResult, pattern) : cb(el, renderResult);
		},
		/** 
		 * 数值校验
		 * @method n
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} pattern 数值格式，如'7','7.2'
		 * @return {boolean}  
		 */
		n: function(el, renderResult, pattern) {
			Utils.prepare4Vld(el);
			Utils.dbc2sbcValue(el);
			var val = getValue(el);
			var isOk = (val == "");
			var msg = null;

			if (!isOk) {
				var patternArr = (pattern || getAttr2(el, 'n-pattern') || '10').split('.');
				var len = patternArr[0] | 0 || 10,
					precision = patternArr[1] | 0;
				if (precision < 1) {
					if ((/\D/).test(val) || val.length > len) msg = tmpl(Msgs.getMsg(el, "n_integer"), [1 + new Array(len + 1).join("0")]);
				} else {
					var s = "^\\d{1,100}(\\.\\d{1," + precision + "})?$";
					if (!(new RegExp(s)).test(val)) msg = tmpl(Msgs.getMsg(el, "n_format"), [(new Array(len - precision + 1)).join("X") + "." + (new Array(precision + 1)).join("X")]);
				}
				if ((/^0\d/).test(val)) {
					val = val.replace(/^0+/g, '');
					W(el).val(val);
					//msg = Msgs.getMsg(el, "n_useless_zero");
				}
				if (!msg) {
					var maxV = getAttr2(el, "maxValue") || Math.pow(10, len-precision)-Math.pow(10, -precision);
					if (maxV && (parseFloat(val, 10) > maxV - 0)) {
						msg = tmpl(Msgs.getMsg(el, "n_upper"), [maxV, val]);
					}
					var minV = getAttr2(el, "minValue");
					if (minV && parseFloat(val, 10) < minV - 0) {
						msg = tmpl(Msgs.getMsg(el, "n_lower"), [minV, val]);
					}
				}
				if (msg) isOk = false;
				else isOk = true;
			}
			if (renderResult != false) Valid.renderResult(el, isOk, msg);
			return isOk;
		},

		/** 
		 * 数值范围校验
		 * @method nrange
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} pattern 数值格式，如'7','7.2'
		 * @return {boolean}  
		 */
		nrange: function(el, renderResult, pattern) {
			var isOk = Validators.n(el, renderResult, pattern);
			if (isOk) {
				var fromNEl = g(getAttr2(el, 'fromNEl'));
				var toNEl = g(getAttr2(el, 'toNEl'));
				if (fromNEl) {
					toNEl = el;
				} else if (toNEl) {
					fromNEl = el;
				} else { //默认在同一个容器里的两个input为一组起止时间
					var els = el.parentNode.getElementsByTagName("input");
					if (els[0] == el) {
						fromNEl = el;
						toNEl = els[1];
					} else {
						fromNEl = els[0];
						toNEl = el;
					}
				}
				var relEl = el == fromNEl ? toNEl : fromNEl;
				var isOk2 = Validators.n(relEl, renderResult, pattern);
				if (isOk2) {
					if (getValue(relEl) && getValue(el)) {
						if (getValue(fromNEl) * 1 > getValue(toNEl) * 1) {
							isOk = false;
							if (el == fromNEl) Valid.fail(fromNEl, Msgs.getMsg(fromNEl, "nrange_from"));
							if (el == toNEl) Valid.fail(toNEl, Msgs.getMsg(toNEl, "nrange_to"));
						}
					}
				}
			}
			return isOk;
		},


		/** 
		 * 日期校验
		 * @method d
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		d: function(el, renderResult) {
			Utils.prepare4Vld(el);
			Utils.dbc2sbcValue(el);
			var val = getValue(el);
			var isOk = (val == "");
			var msg = null;
			if (!isOk) {
				val = val.replace(/(^\D+)|(\D+$)/g, "").replace(/\D+/g, "/");
				if (!(/\D/).test(val)) {
					if (val.length == 8) val = val.substr(0, 4) + "/" + val.substr(4, 2) + "/" + val.substr(6, 2);
				}
				var tempD = new Date(val);
				if (!isNaN(tempD)) {
					var nStrs = val.split(/\D+/ig);
					if (nStrs.length == 3 && nStrs[0].length == 4 && nStrs[2].length < 3) { //日期格式只限制为YYYY/MM/DD,以下格式不合法：MM/DD/YYYY
						isOk = true;
						if (formatDate(tempD) != getValue(el)) {
							Utils.setTextValue(el, formatDate(tempD));
							val = getValue(el);
						}
					}
				}
				if (!isOk) {
					msg = Msgs.getMsg(el, "d_format");
				} else {
					var maxV = getAttr2(el,"maxValue") || "2049-12-31";
					if (tempD > new Date(maxV.replace(/\D+/g, "/"))) {
						isOk = false;
						msg = tmpl(Msgs.getMsg(el, "d_upper"), [maxV, val]);
					}
					var minV = getAttr2(el,"minValue") || "1900-01-01";
					if (tempD < new Date(minV.replace(/\D+/g, "/"))) {
						isOk = false;
						msg = tmpl(Msgs.getMsg(el, "d_lower"), [minV, val]);
					}
				}
			}
			if (renderResult != false) Valid.renderResult(el, isOk, msg);
			return isOk;
		},
		/** 
		 * 日期范围校验
		 * @method daterange
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		daterange: function(el, renderResult) {
			var isOk = Validators.d(el, renderResult);
			if (isOk) {
				var fromDateEl = g(getAttr2(el, 'fromDateEl'));
				var toDateEl = g(getAttr2(el, 'toDateEl'));
				if (fromDateEl) {
					toDateEl = el;
				} else if (toDateEl) {
					fromDateEl = el;
				} else { //默认在同一个容器里的两个input为一组起止时间
					var els = el.parentNode.getElementsByTagName("input");
					if (els[0] == el) {
						fromDateEl = el;
						toDateEl = els[1];
					} else {
						fromDateEl = els[0];
						toDateEl = el;
					}
				}
				var relEl = el == fromDateEl ? toDateEl : fromDateEl;
				var isOk2 = Validators.d(relEl, renderResult);
				if (isOk2) {
					if (getValue(relEl) && getValue(el)) {
						if (getValue(fromDateEl) > getValue(toDateEl)) {
							isOk = false;
							if (el == fromDateEl) Valid.fail(fromDateEl, Msgs.getMsg(fromDateEl, "daterange_from"));
							if (el == toDateEl) Valid.fail(toDateEl, Msgs.getMsg(toDateEl, "daterange_to"));
						}
						if (getValue(fromDateEl) && getValue(toDateEl)) {
							var maxDateSpan = getAttr2(fromDateEl, 'maxDateSpan') || getAttr2(toDateEl, 'maxDateSpan'); //时间跨度
							if (maxDateSpan && (new Date(getValue(toDateEl).replace(/-/g, '/')) - new Date(getValue(fromDateEl).replace(/-/g, '/'))) > (maxDateSpan - 1) * 24 * 3600000) {
								Valid.fail(el, tmpl(Msgs.getMsg(el, "daterange_larger_span"), [maxDateSpan]));
								isOk = false;
							}
						}

					}
				}
			}
			return isOk;
		},

		/** 
		 * 字符串长度校验
		 * @method _checkLength
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {function} getLengthFun 字符串长度计算函数
		 * @param {string} dataType 数据类型，如：text/bytetext/richtext
		 * @return {boolean}  
		 */
		_checkLength: function(el, renderResult, getLengthFun, dataType) {
			Utils.prepare4Vld(el);
			var val = getValue(el);
			var isOk = (val == "");
			var msg = null;
			if (!isOk) {
				var maxLen = (getAttr2(el, "maxLength") || 1024) | 0;
				var minLen = getAttr2(el, "minLength")  | 0;
				var curLen = getLengthFun(el);
				if (curLen > maxLen) {
					msg = tmpl(Msgs.getMsg(el, "text_longer") || Msgs[dataType + "_longer"], [maxLen, curLen]);
				} else if (curLen < minLen) {
					msg = tmpl(Msgs.getMsg(el, "text_shorter") || Msgs[dataType + "_shorter"], [minLen, curLen]);
				} else {
					isOk = true;
				}
			}
			if (renderResult != false) Valid.renderResult(el, isOk, msg);
			return isOk;
		},

		/** 
		 * 文本长度验证
		 * @method text
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		text: function(el, renderResult) {
			return Validators._checkLength(el || this, renderResult, function(a) {
				return getValue(a).length;
			}, "text");
		},

		/** 
		 * 字节长度验证
		 * @method bytetext
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		bytetext: function(el, renderResult) {
			return Validators._checkLength(el || this, renderResult, function(a) {
				return byteLen(getValue(a));
			}, "text");
		},

		/** 
		 * 富文本长度验证
		 * @method richtext
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		richtext: function(el, renderResult) {
			return Validators._checkLength(el || this, renderResult, function(a) {
				var s = getValue(a);
				if (getAttr2(a,"ignoreTag")) return s.replace(/<img[^>]*>/g, "a").replace(/<[^>]*>/g, "").length;
				else return s.length;
			}, "richtext");
		},
		/** 
		 * 身份证号码验证
		 * @method idnumber
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		idnumber: function(el, renderResult) {
			Utils.prepare4Vld(el);
			Utils.dbc2sbcValue(el);
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				if ((/^\d{15}$/).test(val)) {
					isOk = true; 
				} else if ((/^\d{17}[0-9xX]$/).test(val)) {
					var vs = "1,0,x,9,8,7,6,5,4,3,2".split(","),
						ps = "7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2".split(","),
						ss = val.toLowerCase().split(""),
						r = 0;
					for (var i = 0; i < 17; i++) {
						r += ps[i] * ss[i];
					}
					isOk = (vs[r % 11] == ss[17]);
				}
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_idnumber"));
			return isOk;
		},
		/** 
		 * 中文姓名验证
		 * @method cnname
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		cnname: function(el, renderResult) {
			Utils.prepare4Vld(el);
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				isOk = byteLen(val) <= 32 && /^[\u4e00-\u9fa5a-zA-Z.\u3002\u2022]{2,32}$/.test(val);

			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_cnname"));
			return isOk;
		},

		/** 
		 * “再次输入”验证
		 * @method reconfirm
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		reconfirm: function(el, renderResult) {
			Utils.prepare4Vld(el);
			var oriEl = g(getAttr2(el, "reconfirmFor"));
			var isOk = (getValue(el) == getValue(oriEl));
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_reconfirm"));
			return isOk;
		},

		/** 
		 * 图片文件验证
		 * @method imgfile
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		imgfile: function(el, renderResult) {
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				var fExt = val.substring(val.lastIndexOf(".") + 1);
				isOk = (/^(jpg|jpeg|png|gif|tif|bmp)$/i).test(fExt);
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_imgfile"));
			return isOk;
		},

		/** 
		 * 正则表达式验证
		 * @method reg
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		reg: function(el, renderResult, pattern, msg, ignoreDBC) {
			if (ignoreDBC) Utils.dbc2sbcValue(el);
			Utils.prepare4Vld(el);
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				msg = msg || "_regexp";
				pattern = pattern || getAttr2(el, "reg-pattern");
				if ('string' == typeof pattern) {
					pattern.replace(/^\/(.*)\/([mig]*)$/g, function(a, b, c) {
						pattern = new RegExp(b, c || '');
					});
				}
				isOk = pattern.test(val);
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, msg));
			return isOk;
		},

		/** 
		 * 复合datatype验证
		 * @method magic
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} pattern 复合datatype表达式，如 "mobile || phone"
		 * @return {boolean}  
		 */
		magic: function(el, renderResult, pattern) {
			Utils.prepare4Vld(el);
			pattern = pattern || getAttr2(el, 'magic-pattern');
			var isOk = (getValue(el) == "" || !pattern);
			if (!isOk) {
				var opts = {
					el: el,
					Validators: Validators
				};
				var sJs = pattern.replace(/(\w+)/ig, 'opts.Validators.datatype(opts.el,false,"$1")'); //注意：如果是用户输入的dataType，这里有可能会注入。----to be fixed
				isOk = evalExp(sJs, opts);
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, '_magic'));
			return isOk;
		},

		/** 
		 * 自定义datatype验证
		 * @method uv
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		uv: function(el, renderResult) {
			if (el.onblur && !el.onblur()) return false;
			return true;
		},
		/** 
		 * 简单非空验证
		 * @method notempty
		 * @static
		 * @param {Element} el 表单元素
		 * @return {boolean}  
		 */
		notempty: function(el) {
			Utils.prepare4Vld(el);
			return !!getValue(el);
		},
		/** 
		 * 复合required验证
		 * @method magic
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} reqlogic 复合required表达式
		 * @return {boolean}  
		 */
		logicrequired: function(el, renderResult, reqlogic) {
			el = el || this;
			reqlogic = reqlogic || getAttr2(el, "reqlogic");
			var reqAttr = Valid._curReqAttr || Valid.REQATTR,
				sReq = getAttr2(el, reqAttr),
				opts = {
					el: el,
					Validators: Validators
				},
				sJs = reqlogic.replace(/\$([\w\-]+)/ig, 'opts.Validators.notempty(NodeH.g("$1"))').replace(/this/ig, "opts.Validators.notempty(opts.el)"); //注意：如果是用户输入的dataType，这里有可能会注入。----to be fixed
			var isOk = evalExp(sJs, opts);
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && sReq.indexOf(" ") == 0 ? sReq.substr(1) : tmpl(Msgs["_logicrequired"], [sReq]));
			return !!isOk;
		}
	}, {
		/** 
		 * 时间验证
		 * @method magic
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		time: function(el, renderResult) {
			return Validators.reg(el, renderResult, /^(([0-1]\d)|(2[0-3])):[0-5]\d:[0-5]\d$/, "_time", true);
		},
		//时间
		/** 
		 * 时间验证
		 * @method minute
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		minute: function(el, renderResult) {
			return Validators.reg(el, renderResult, /^(([0-1]\d)|(2[0-3])):[0-5]\d$/, "_minute", true);
		},
		//分钟
		/** 
		 * 电子邮件
		 * @method email
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		email: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, "_email", true);
		},
		/** 
		 * 手机号
		 * @method mobilecode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		mobilecode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^(13|15|18|14)\d{9}$/, "_mobilecode", true);
		},
		/** 
		 * 含区号电话号码
		 * @method phone
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phone: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)[1-9]\d{6,7}$/, "_phone", true);
		},
		//不带分机的电话号
		/** 
		 * 含区号电话号码
		 * @method phone
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phonewithext: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)[1-9]\d{6,7}(-\d{1,7})?$/, "_phonewithext", true);
		},
		//带分机的电话号
		/** 
		 * 电话区号
		 * @method phonezone
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phonezone: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)$/, "_phonezone", true);
		},
		/** 
		 * 电话号码
		 * @method phonecode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phonecode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^[1-9]\d{6,7}$/, "_phonecode", true);
		},
		/** 
		 * 分机号
		 * @method phoneext
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phoneext: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^\d{1,6}$/, "_phoneext", true);
		},
		/** 
		 * 邮编
		 * @method zipcode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		zipcode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^\d{6}$/, "_zipcode", true);
		},
		/** 
		 * 邮编
		 * @method vcode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		vcode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^\w{4}$/, "_vcode", true);
		}
	}]);

	QW.provide('Valid', Valid);

}());




//----valid_youa.js
/**	
 * @class Valid Valid form验证
 * @namespace QW
 * @singleton 
 */
(function() {
	var Valid = QW.Valid,
		Validators = Valid.Validators,
		NodeH = QW.NodeH,
		g = NodeH.g,
		getAttr2 = function(el, attr) {
			if(!el || !el.getAttribute) return '';
			return el[attr] || el.getAttribute(attr);
		},
		addClass = NodeH.addClass,
		removeClass = NodeH.removeClass,
		replaceClass = NodeH.replaceClass,
		show = NodeH.show,
		hide = NodeH.hide,
		getValue = NodeH.getValue,
		createElement = function(tag, opts) {
			opts = opts || {};
			var el = document.createElement(tag);
			for (var i in opts) el[i] = opts[i];
			return el;
		};
	/*
	 * _getHintEl: 得到hintEl。焦点进入/离开时，toggleClass('hint-dark', 'hint'); 
	 */
	Valid._getHintEl = function(el) {
		var hintEl = getAttr2(el, "hintEl");
		return hintEl && g(hintEl);
	};
	/*
	 * _getPlaceHolderEl: 得到placeHolderEl，即placeHolder效果元素
	 */
	Valid._getPlaceHolderEl = function(el) {
		var hintEl = getAttr2(el, "placeHolderEl");
		return hintEl && g(hintEl);
	};
	/*
	 * _getEmEl: 得到提示em。查找规则：优先查找emEl属性，再次之查找四个nextSibling以内的em，再次之查找parentNode的四个nextSibling以内的em
	 */
	Valid._getEmEl = function(el) {
		var em = getAttr2(el, "emEl");
		if (em) return g(em);
		var refEls = [el, el.parentNode];
		for (var i = 0; i < 2; i++) {
			var tempEl = refEls[i];
			for (var j = 0; j < 5; j++) {
				tempEl = tempEl.nextSibling;
				if (!tempEl) break;
				if (tempEl.tagName == "EM") return tempEl;
			}
		}
		return null;
	};
	/*
	 * _getErrEmEl: 根据正确em,找到错误em,找不到就返回null.
	 */
	Valid._getErrEmEl = function(okEm, autoCreate) {
		var errEm = okEm.nextSibling;
		if (errEm) {
			if (errEm.tagName == "EM" || !errEm.tagName && (errEm = errEm.nextSibling) && errEm.tagName == "EM") return errEm;
		}
		if (!autoCreate) return null;
		errEm = createElement('em', {
			className: 'error'
		});
		okEm.parentNode.insertBefore(errEm, okEm.nextSibling);
		return errEm;
	};


	Valid.onhint = function(ce) {
		var el = ce.target;
		if (!el || 'INPUT,TEXTAREA,SELECT,BUTTON'.indexOf(el.tagName) == -1) return; //IE下，onfocusin会在div等元素触发 
		var hintEl = Valid._getHintEl(el),
			placeHolderEl = Valid._getPlaceHolderEl(el);
		hintEl && replaceClass(hintEl, 'hint-dark', 'hint');
		if (placeHolderEl) {
			clearTimeout(el.__placeholderTimer || 0);
			addClass(placeHolderEl, 'placeholder-dark');
		}
		if (!Validators.required(el, false) && !getValue(el)) return; //如果存在空提示，则进入焦点时不隐藏提示
		if (!Validators.datatype(el, false)) Validators.datatype(el, true); //只有不通过datatype验证时，才需要在焦点进入时验证
	};
	Valid.onblur = function(ce) {
		var el = ce.target;
		if (!el || 'INPUT,TEXTAREA,SELECT,BUTTON'.indexOf(el.tagName) == -1) return; //IE下，onfocusin会在div等元素触发 
		var hintEl = Valid._getHintEl(el),
			placeHolderEl = Valid._getPlaceHolderEl(el);
		hintEl && replaceClass(hintEl, 'hint', 'hint-dark');
		Validators.datatype(el, true); //离开时只作datatype校验
		if (placeHolderEl) {
			(getValue(el) ? addClass : removeClass)(placeHolderEl, 'placeholder-dark');
			clearTimeout(el.__placeholderTimer || 0);
			el.__placeholderTimer = setTimeout(function() { //在360浏览器下，autocomplete会先blur之后N百毫秒之后再change
				(getValue(el) ? addClass : removeClass)(placeHolderEl, 'placeholder-dark');
			}, 600);
		}
	};
	Valid.onpass = function(ce) {
		var el = ce.target,
			okEm = Valid._getEmEl(el);
		removeClass(el, "error");
		if (okEm) {
			if ((okEm.__vld_fail_stamp | 0) != Valid.checkAll_stamp)  {//需要render
				show(okEm);
				var errEmEl = Valid._getErrEmEl(okEm);
				errEmEl && hide(errEmEl);
			}
		}
	};
	Valid.onfail = function(ce) {
		var el = ce.target,
			errMsg = ce.errMsg;
		addClass(el, "error");
		el.__vld_errMsg = errMsg;
		var okEm = Valid._getEmEl(el);
		if (okEm) {
			if ((okEm.__vld_fail_stamp | 0) != Valid.checkAll_stamp) { //需要render
				hide(okEm);
				var errEm = Valid._getErrEmEl(okEm, true);
				errEm.innerHTML = errMsg;
				show(errEm);
			}
			if (Valid.isChecking) {
				okEm.__vld_fail_stamp = Valid.checkAll_stamp;
			}
		}
	};

	var placeHolder_idx = 10000;
	Valid.oninitall = function(ce) {
		setTimeout(function() { //稍稍延时一下
			if('placeholder' in document.createElement('input')){ //如果浏览器原生支持placeholder
				return ;
			}
			QW.NodeW('input,textarea', ce.target).forEach(function(el) {
				var placeholder = getAttr2(el,'placeholder'),
					placeHolderEl = Valid._getPlaceHolderEl(el);
				if (placeholder && !placeHolderEl) {
					var placeHolderElId = 'placeHolder-' + placeHolder_idx++;
					placeHolderEl = createElement('span', {
						id: placeHolderElId,
						innerHTML: placeholder,
						className: 'placeholder'
					});
					placeHolderEl.onclick = function() {
						try {
							el.focus();
						} catch (ex) {}
					};
					el.parentNode.insertBefore(placeHolderEl, el);
					el.setAttribute('placeHolderEl', placeHolderElId);
				}
				if (placeHolderEl) {
					if ((getValue(el) || '').trim() || el==document.activeElement) {
						addClass(placeHolderEl, 'placeholder-dark');
					} else {
						removeClass(placeHolderEl, 'placeholder-dark');
					}
				}
			});
		}, 10);
	};
	/**
	 *绑定电话区号/电话号码/分机号/手机号
	 * @method bindPhoneEls
	 * @param {Json} opts - 绑定group Json.目前支持以下属性
	 ids:['telN1','telN2','telN3']	//数组id，依次为:电话区号／电话号码／分机号，也可以有四个元素，第四个元素为手机号
	 reqMsgs:[' 请输入电话区号。','请输入电话号码。','',' 电话号码与手机至少填写一项。']		//----必须输入时的提示信息
	 * @return {void} 
	 */
	Valid.bindPhoneEls = function(opts) {
		var dataTypes = ['phonezone', 'phonecode', 'phoneext', 'mobilecode'],
			maxLengths = [4, 8, 4, 11],
			defaultReqMsgs = [' 请输入电话区号。', ' 请输入电话号码。', '', ' 电话号码与手机至少填写一项。'],
			reqMsgs = opts.reqMsgs || defaultReqMsgs,
			ids = opts.ids;
		for (var i = 0; i < ids.length; i++) {
			QW.NodeW.g(ids[i]).attr('reqMsg', reqMsgs[i] || defaultReqMsgs[i]).attr('dataType', dataTypes[i]).set('maxLength', maxLengths[i]);
		}
		g(ids[0]).setAttribute('reqlogic', '(!$' + ids[1] + ' && !$' + ids[2] + ') || $' + ids[0]);
		g(ids[1]).setAttribute('reqlogic', '(!$' + ids[0] + ' && !$' + ids[2] + ') || $' + ids[1]);
		if (ids.length == 4) {
			g(ids[3]).setAttribute('reqlogic', '$' + ids[0] + ' || $' + ids[1] + '|| $' + ids[2] + '|| $' + ids[3]);
		}
	};

	QW.DomU.ready(function() {
		Valid.initAll();
	});
}());


;/**import from `/resource/js/component/citypanel.js` **/
(function() {
	function CityPanel() {
		this.init.apply(this, arguments);
	};

	CityPanel.prototype = (function() {
		return {
			init : function(trigger) {
				var instance = this;
				CustEvent.createEvents(this);

                if(!CityPanel.prototype._documentBind){
                	W(window).on('resize', function(e){
                		//窗口大小变化时重新触发
                		if(instance.container.css('display')!="none"){
	                		setTimeout(function(){
	                			try{ W(trigger).fire('click'); }catch(ex){}
	                		}, 100);
                		}
                	});
                    W(document).on('keydown', function(e) {
                        if(e.keyCode == 27) {
                            instance.container.hide();
                            instance.fire('close');
                        }
                    }).on('click', function(e) {
                            var flag = false;
                            CityPanel.prototype._triggerList.forEach(function(tri){
                                tri.forEach(function(el) {
                                    var trigger = W(el);

                                    if(trigger[0] == e.target || trigger.contains(e.target)) {
                                        flag = true;
                                    }
                                });
                            });

                            if( !flag && (!instance.container[0] == e.target || !instance.container.contains(e.target)) ) {

                                instance.container.fadeOut(150);
                                instance.fire('close');
                            }
                        });
                    CityPanel.prototype._documentBind = true;
                }

				this.container = W('#city_list')
					.delegate('.close', 'click', function(e) {
							e.preventDefault();

							instance.container.hide();
							instance.fire('close');
						})
					.delegate('.filter_bar a', 'click', function(e) {
							e.preventDefault();

							var el = W(this),
								letter = el.html().trim();

							if(el.hasClass('current')) return;

							instance.container.query('.filter_bar a').removeClass('current');
							instance.container.query('.city_wrap p').hide();
							el.addClass('current');
							instance.container.query('.city_wrap p.' + letter).show();
						});

				this.trigger = W(trigger).click(function(e) {
                    e.preventDefault();

                    var pos = W(this).getRect();
                    //是否关闭一直出现
                    if(W(this).attr('data-close')=='hide'){
                        W('#city_list .city_close').hide();
                    }else{
                        W('#city_list .city_close').show();
                    }
                    if (W(this).attr('x-offset')) {
                        instance.container
                        .css({'left' : pos.left - W(this).attr('x-offset'), 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }
                    else if( W(this).attr('data-floatright') ){
                        instance.container
                        .css({'left' : pos.left - 380, 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }else{
                        instance.container
                        .css({'left' : pos.left, 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }

                    //修正IE7下相关bug。IE7，360IE模式下，父级还有position:fixed, 上面的pos.top的值获取不正确，需要修正。需要把posisiton为fixed的父级点传到data-parentfixed参数里。如data-parentfixed="#doc-menubar-fixed"
                    if( W(this).attr('data-parentfixed') ){
                        var pf =W(this).ancestorNode( W(this).attr('data-parentfixed') );
                        var poffsettop =  W(this).attr('data-parenttop')-0 || 30;
                        var scrTop = document.documentElement.scrollTop || document.body.scrollTop;

                        if( pf.length>0 && pf.css('position')=='fixed' &&  scrTop > 0 && pos.top<scrTop+ poffsettop  ){
                            instance.container.css('top',   pos.height + pos.top + 5 + scrTop);
                        }
                    }

                    instance.fire('onShow');

                    instance.container
                        .undelegate('p a')
                        .delegate('p a', 'click', function(e) {
                            e.preventDefault();

                            var name = this.innerHTML,
                                city = this.getAttribute('data-city'),
                                cityid = this.getAttribute('cityid');
                            if(!name || !city) return;

                            instance.fire('selectCity', {'name' : name, 'city' : city, 'cityid': cityid});
                            instance.container.hide();
                        });
                });
                // 将trigger添加到所有的trigger列表里
                CityPanel.prototype._triggerList.push(this.trigger);
			},
            _triggerList: [],
            _documentBind: false // 是否已经写过了document的事件绑定
		}
	})();

	QW.provide({'CityPanel' : CityPanel});
})();

;/**import from `/resource/js/include/citypanel.js` **/
/**
 * 
 */
Dom.ready(function() {
    if(!W('#citypanel_trigger').length) return false;
    
    var cityPanel = new CityPanel('#citypanel_trigger');

    cityPanel.on('close', function(e) {
        //alert('close panel');
    });

    var selArea = W('#sel_area'),
        selAreaQuan = W('#sel_areaquan'),

        txtCity = W('#city'),
        txtCityCode = W('#city_code'),

        txtArea = W('#area'),
        txtAreaCode = W('#area_code'),

        txtAreaQuan = W('#areaquan'),
        txtAreaQuanCode = W('#areaquan_code');

    var city;

    var sortResult = function(result) {
        var results = [];
        for(var id in result) {
            var name = result[id];
            results.push({id : parseInt(id, 10), name : name});
        }

        results.sort(function(o1, o2) {
            if(o1.id > o2.id) {
                return 1;
            } else if(o1.id < o2.id) {
                return -1;
            } else {
                return 0;
            }
        });

        return results;
    };

    selAreaQuan.on('change', function(e) {
        var val = this.value.split(':'),
            city_name = val[0],
            city_id = val[1] | 0;

            txtAreaQuan.val(city_name);
            txtAreaQuanCode.val(city_id);
    });

    selArea.on('change', function(e) {
        var val = this.value.split(':'),
            city_name = val[0],
            city_id = val[1] | 0;

        txtArea.val(city_name);
        txtAreaCode.val(city_id);

        txtAreaQuan.val('');
        txtAreaQuanCode.val('');

        if(selAreaQuan.length == 0) { return;}  //后面的逻辑不要了

        selAreaQuan.hide();

        var default_name, default_id;
        if(selAreaQuan.attr('data-default')) {
            var arr = selAreaQuan.attr('data-default').split(':');
            default_name = arr[0];
            default_id = arr[1];
        }

        Ajax.get('/aj/get_areaquan/?citycode=' + city + '&areacode=' + city_id, function(e) {
            var ret = e.evalExp();
            if(parseInt(ret.errno, 10) != 0) {
                alert(ret.errmsg);
                return;
            }

            selAreaQuan[0].options.length = 0;

            if(ret.result) {
                var results = sortResult(ret.result);

                for(var i = 0; i < results.length; i++) {
                    var result = results[i],
                        id = result.id,
                        name = result.name,
                        option = new Option(name, name + ':' + id);

                    if(name == default_name && id == default_id) {
                        option.selected = true;
                    }

                    selAreaQuan[0].options.add(option);
                }
            }

            if(selAreaQuan.query('option').length > 0) {
                selAreaQuan.show().fire('change');
            } else {
                selAreaQuan.hide();
            }
        });
    });

    cityPanel.on('selectCity', function(e) {
        city = e.city.trim();

        var city_name = e.name.trim();

        W('#citypanel_trigger').html('<b>' + city_name + '</b>');

        txtCity.val(city_name);
        txtCityCode.val(city);

        Valid.check(txtCity[0]);

        txtArea.val('');
        txtAreaCode.val('');
        selArea.hide();

        txtAreaQuan.val('');
        txtAreaQuanCode.val('');
        selAreaQuan.hide();

        var default_name, default_id;
        if(selArea.attr('data-default')) {
            var arr = selArea.attr('data-default').split(':');
            default_name = arr[0];
            default_id = arr[1];
        }

        Ajax.get('/aj/get_area/?citycode=' + city, function(e) {
            var ret = e.evalExp();
            if(parseInt(ret.errno, 10) != 0) {
                alert(ret.errmsg);
                return;
            }

            selArea[0].options.length = 0;

            if(ret.result) {
                var results = sortResult(ret.result);

                for(var i = 0; i < results.length; i++) {
                    var result = results[i],
                        id = result.id,
                        name = result.name,
                        option = new Option(name, name + ':' + id);

                    if(name == default_name && id == default_id) {
                        option.selected = true;
                    }

                    selArea[0].options.add(option);
                }
            }

            if(selArea.query('option').length > 0) {
                selArea.show().fire('change');
            } else {
                selArea.hide();
            }
        });
    });

    if(txtAreaQuan.val() != '' && txtAreaQuanCode.val() != '') {
        if(selAreaQuan.length > 0) { 
            selAreaQuan.attr('data-default', txtAreaQuan.val() + ':' + txtAreaQuanCode.val());
        }
    }

    if(txtArea.val() != '' && txtAreaCode.val() != '') {
        selArea.attr('data-default', txtArea.val() + ':' + txtAreaCode.val());
    }

    if(txtCity.val() != '' && txtCityCode.val() != '') {
        cityPanel.fire('selectCity', {'name' : txtCity.val(), 'city' : txtCityCode.val()});
    }

    
    cityPanel.on('selectCity', function(e) {
        var city_name = e.name.trim() || "";    
        W('#citypanel_trigger').attr('data-city', city_name);  

        W('#cityAreaBox').html(  city_name + '&nbsp;' );  
    });

    selArea.on('change', function(e){
        var val = this.value.split(':'),
            city_name = val[0],
            prc = txtCity.val();

        W('#cityAreaBox').html(  prc + '&nbsp;' + city_name + '&nbsp;' );
    });
}); 


;/**import from `/resource/js/include/editorcrop.js` **/
Dom.ready(function(){
    var _click_id;
    var _cropPopup;
    W(".add-prd-face").bind('click', function(e){
    	_click_id = W(this).attr('id');
    	
        e.preventDefault();
        
        //弹框
        W('#prdfaceError').hide();
        var tpldom = W("#imageCropTpl, #imageCropTpl_edit, #imageCropTpl_apply, #imageCropTpl_applyedit, #imageCropTpl_1, #imageCropTpl_2, #imageCropTpl_3, #imageCropTpl_4, #imageCropTpl_5");
        _cropPopup = tcb.confirm("", tpldom.html(), { wrapId : "imgCropPop", width:750} , function(){  jsCropUI.submit(); } );  
        if(jQuery && !jQuery.fn.Jcrop){
                
            loadJs("/resource/other/jquery_plugin/jquery.Jcrop.min.js", function(){
            });
            loadCss("/resource/other/jquery_plugin/css/jquery.Jcrop.css");
        }

        return false;
    });
    //W(document).delegate("#cropOrgImg", "change", ); //IE not fire, so, use  onchage=xxx
    function __fileInputChange(){
        if( W(this).val() != "" ){
            W("#imgCropSubmitForm [name='callback']").val("parent.__cropOrigPicUpOk");
            W("#imgCropSubmitForm").submit();
            W('.img-crop-box .crop-img-loading').show();
        }
    }
    window.__fileInputChange = __fileInputChange;

    function __cropOrigPicUpOk(rs){
        if( rs.errno != 0 ){
            alert("抱歉，出错了。" + rs.errmsg);
        }else if( rs.errno == 0 ){
            var psrc = rs.picsrc;
            jsCropUI.init(rs);
            W('.img-crop-box .crop-img-loading').hide();
        }
    }

    window.__cropOrigPicUpOk = __cropOrigPicUpOk;    

    /**
     * 初始化编辑器
     * @return {[type]} [description]
     */
    function initEditor(){
        if( W('#ueditor').length > 0 ){
            var editor = new UE.ui.Editor();
            editor.render("ueditor");
            window.__descEditor = editor;  
        }      
    }

    /**
     * jquery裁剪插件使用
     * @return {[type]} [description]
     */
    window.jsCropUI = (function(){
        var __cropRange, __cropPic, __origWidth, __origHeight;
        var jcrop_api,
            boundx,
            boundy,
            previewBox,
            cropSizes = [300, 70 ,50];  

        function init(picdata){
            var src = picdata.picsrc;
            __cropPic = src;
            __origWidth = picdata.width;
            __origHeight = picdata.height;

            var smallsrc;
            if( __origWidth > __origHeight ){
                smallsrc = src.replace(/\/(\w+?)(\.\w+)$/i, "/edr/300__/$1$2");
            }else{
                smallsrc = src.replace(/\/(\w+?)(\.\w+)$/i, "/edr/_300_/$1$2");
            }

            var previewBox = $('.img-crop-box .crop-prevbox');

            $('.img-crop-box .crop-picbox').html("<img src='"+smallsrc+"'>");

            for(var i=0, n=cropSizes.length; i<n; i++){
                previewBox.find('.crop-prev-'+cropSizes[i]+' .img-preview').html('<img src="'+src+'">'); 
            }

            show($('.img-crop-box .crop-picbox img'),  previewBox);
        }            
        
        function show(target, pbox){
          previewBox = pbox;

          $(target).Jcrop({
            onChange: updatePreview,
            onSelect: updatePreview,
            aspectRatio: 1,
            keySupport: false /*如果设置为true，chrome下面会有页面跳动的bug*/
          },function(){
            
            jcrop_api = this;

            jcrop_api.animateTo([0,0,100,100]);

            // Use the API to get the real image size
            var bounds = this.getBounds();
            boundx = bounds[0];
            boundy = bounds[1];
            // Store the API in the jcrop_api variable
            jcrop_api = this;        
            
          });
        }

        function updatePreview(c)
        {
          if (parseInt(c.w) > 0)
          {  
            __cropRange = c;

            for(var i=0, n=cropSizes.length; i<n; i++){
              resizePreview( previewBox.find('.crop-prev-'+cropSizes[i]+' .img-preview') , c);  
            }
          }
        };

        function resizePreview(box , c){
          var $pcnt = box;
          $pimg = box.find('>img');
          var xsize = $pcnt.width();
          var ysize = $pcnt.height();
          var rx = xsize / c.w;
          var ry = ysize / c.h;

          $pimg.css({
            width: Math.round(rx * boundx) + 'px',
            height: Math.round(ry * boundy) + 'px',
            marginLeft: '-' + Math.round(rx * c.x) + 'px',
            marginTop: '-' + Math.round(ry * c.y) + 'px'
          });

        }

        function getCropResult(){
            try{
                var r_w = Math.round(__cropRange.w / boundx * __origWidth);
                var r_h = Math.round(__cropRange.h / boundy * __origHeight);
                var r_x = Math.round(__cropRange.x / boundx * __origWidth);
                var r_y = Math.round(__cropRange.y / boundy * __origHeight);

                return { 'pic' : __cropPic , 'crop':{ x:r_x ,y:r_y , w: r_w, h:r_h }};
            }catch(ex){
                return false;
            }
        }

        window.__cropDoneCallback = function(rs){
            $('#imgCropPop .panel-btn-ok').attr('disabled', false).html('确定');

            if(rs.errno == 0){
                _cropPopup.hide();
                var smallpic = rs.picsrc.replace(/(\w+\.\w+)$/i, 'edr/70__/$1');
                
                if( $('#'+_click_id).attr('data-previmg') ){

                    $($('#'+_click_id).attr('data-previmg')).attr('src', rs.picsrc);

                }else{
                    if($('#cropResultPic').length > 0){
                        $('#cropResultPic').attr('src', smallpic);
                    }else{
                        $('<img id="cropResultPic" width="70" height="70" class="crop-result-pic" src="'+smallpic+'">').insertAfter('#'+_click_id);
                    }
                }

                if( $('#'+_click_id).attr('data-input') ){
                    $(  $('#'+_click_id).attr('data-input') ).val( rs.picsrc );
                }else{
                    $('#productImgInput').val( rs.picsrc );
                }               
                
                $('#'+_click_id).html('重新编辑');
            }
        }
        function submit(){
            
            var rs = getCropResult();

            if(!rs){ return;}

            $('#cropCompleteForm [name="crop_pic"]').val( rs.pic );

            $('#cropCompleteForm [name="crop_x"]').val( rs.crop.x );
            $('#cropCompleteForm [name="crop_y"]').val( rs.crop.y );
            $('#cropCompleteForm [name="crop_width"]').val( rs.crop.w );
            $('#cropCompleteForm [name="crop_height"]').val( rs.crop.h );

            $('#cropCompleteForm [name="callback"]').val( "parent.__cropDoneCallback");

            $('#cropCompleteForm').submit();

            $('#imgCropPop .panel-btn-ok').attr('disabled', true).html('处理中...');
        }

        return { 
            init : init,
            getCropResult : getCropResult,
            submit : submit
        }
      })();

    initEditor();
});

;/**import from `/resource/js/page/admin.info.js` **/
Dom.ready(function(){
    try{
        var center = new AMap.LngLat(W('#mapContainer').attr('longitude'), W('#mapContainer').attr('latitude')),
            map = new AMap.Map("mapContainer",{
              view: new AMap.View2D({//创建地图二维视口
                   center: center,
                   zoom:11,
                   rotation:0
              })
            });
        var marker = new AMap.Marker({
            map : map,
            id:"mapMarker",
            position: center, 
            icon:"https://p.ssl.qhimg.com/t01c04d11f81e314a56.png",
            offset:{x:-13,y:-36} 
        });
    }catch(e){}

    // function 
    function doWithHash(){
        var hash = location.hash.replace('#','');
        W(".c-wrap").hide();
        W('.tabzhiliao ul li').removeClass('selcur');
        if(hash=="dianpu"){
            W('.tabzhiliao ul').query('li').item(1).addClass('selcur');
            W("#dianpu_info").show();
        }else if(hash=="jiesuan"){
            W('.tabzhiliao ul').query('li').item(2).addClass('selcur');
            W("#jiesuan_info").show();
        }else if(hash=="gonggao"){
            W('.tabzhiliao ul').query('li').item(3).addClass('selcur');
            W("#gonggao_info").show();
        }else{
            W('.tabzhiliao ul').firstChild('li').addClass('selcur');
            W("#shenqing_info").show();
        }
    }

    doWithHash();

    // 修改地图标注的marker和map对象
    var nMarker, nMap;
    //在地图上添加一个点
    function addMarker(item){
        nMarker = new AMap.Marker({
            id: "mapMarker2",
            position: new AMap.LngLat(item.lng, item.lat),
            icon: "https://p.ssl.qhimg.com/t01c04d11f81e314a56.png",
            offset: {x:-13,y:-36} 
        });
        nMap.addOverlays(nMarker);
    }

    tcb.bindEvent(document.body, {
        '.tabzhiliao ul li':function(e){
            W('.c-wrap').hide();
            W('.tabzhiliao ul li').removeClass('selcur');
            W(this).addClass('selcur');
            W('#'+W(this).attr('data-id')).show();
        },
        'a.modify-dianpu':function(e){
            e.preventDefault();
            W("#dianpuBaseInfo").hide();
            W("#editDianpuWrap").show();
        },
        'a.back-toinfo':function(e){
            e.preventDefault();
            W("#dianpuBaseInfo").show();
            W("#editDianpuWrap").hide();
        },
        'a.btn-continue':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#editDianpu')[0])){
                return false;
            }

            var phoneValue = W('#phonezone').val();
            if (W('#phonecode').val()) {
                phoneValue += '-' + W('#phonecode').val();
            };
            if (W('#phoneext').val()) {
                phoneValue += '-' + W('#phoneext').val();
            }
            W('#fixed_phone').val(phoneValue);

            Ajax.post(W('#editDianpu')[0], function(result){
                try{
                    result = (result || "").evalExp();
                    if (parseInt(result.errno,10) == 0) {
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">修改成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410, 
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                            location.hash = "dianpu";
                            location.reload(true);
                        });
                    }else{
                        return alert(result.errmsg);
                    };
                    setTimeout(function(){
                        panel.hide();
                        location.hash = "dianpu";
                        location.reload(true);  
                    },3000)
                    
                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            })
        },
        // 重新标注地图上的位置
        '#RemarkPos': function(e){
            e.preventDefault();

            var content = W('#mapPointTpl2').html();
            var panel = tcb.alert("标注地图", content, {'width':695}, function(){
                if (!nMarker) {
                    return alert("请标注地图")
                };
                var pos = nMarker.getPosition();
                W('#map_longitude').val(pos.lng);
                W('#map_latitude').val(pos.lat);
                W('#latitude_span').html('标注成功');
                QW.Valid.check(W('#map_longitude')[0]);
                nMarker = null;
                return true;
            });
            var map_longitude = W('#map_longitude').val(),
                map_latitude = W('#map_latitude').val();
            //初始化地图
            var center = map_longitude && map_latitude 
                    ? new AMap.LngLat(map_longitude, map_latitude)
                    : new AMap.LngLat(116.397120, 39.916520);

            nMap = new AMap.Map("mapPointContainer",{
                view: new AMap.View2D({//创建地图二维视口
                   center: center,
                   zoom:10,
                   rotation:0
              })
            }); 
            nMap.plugin(["AMap.ToolBar","AMap.OverView","AMap.Scale"], function(){
                var overview = new AMap.OverView();
                nMap.addControl(overview);
                var toolbar = new AMap.ToolBar();
                toolbar.autoPosition=false;
                nMap.addControl(toolbar);
                var scale = new AMap.Scale();
                nMap.addControl(scale);
            });
            nMap.scrollWheel = true;
            nMap.keyboardEnable = true;
            nMap.dragEnable = true;
            nMap.doubleClickZoom = true;
            var infoWin = new AMap.InfoWindow({ offset: new AMap.Pixel(45,-34), content:""});
            nMap.setFitView();
            nMap.bind(nMap, 'click', function(e){
                addMarker(e.lnglat);
            });
            if (map_longitude && map_latitude) {
                setTimeout(function(){
                    addMarker({
                        lat: map_latitude,
                        lng: map_longitude
                    });
                }, 100);
            }else{
                var address = [W('#city').val(), W('#area').val(), W('#areaquan').val()].join(' ');
                var GeocoderOption = {};
                var geo = new AMap.Geocoder(GeocoderOption); 
                geo.geocode(address, function(data){
                    if(data.status == "E0" ){
                        var pos = {
                            lng: parseFloat(data.list[0].x),
                            lat: parseFloat(data.list[0].y)
                        }
                        addMarker(pos);
                        nMap.setCenter(new AMap.LngLat(pos.lng, pos.lat))
                    }
                });
            }
        },
        '.editphone': function(){
            var panel = tcb.alert("修改手机号码", "<p style='padding:20px;width:300px;text-align:center'>修改完成，请点击确定更新手机号码</p>", {
                wrapId: "editPhonePanel",
                width: 340
            }, function(){
                Ajax.get('/mobile/getmobile', function(data){
                    try{
                        data = data.evalExp();
                        var phone = data.result;
                        W('#mobile').val(phone);
                        panel.hide();
                    }catch(e){}
                })
            });
        },
        // 添加公告
        '.gonggao-add-item': function(e){
            e.preventDefault();
            if(!(W('.gonggao-item').query('tr').length<5)){
                alert('最多发布3条商家公告，1条手机订单公告');
                return ;
            }
            var wEditarea = W('.gonggao-edit-area');
            wEditarea.show()
                .query('textarea').val('例：消费满200元免费上门').addClass('non-active').attr('gonggao-id', '');

            var wActiveline = W('.gonggao-active-line');
            wActiveline.hide();
            W('.gonggao-add-title').show();
            W('.gonggao-edit-title').hide();
        },
        // 编辑公告
        '.gonggao-edit-item': function(e){
            e.preventDefault();
            var wMe = W(this),
                wTr = wMe.parentNode('tr');
            
            var wEditarea = W('.gonggao-edit-area');
            var wSpan = wTr.query('td').one('span');
            var g_content;
            if (wSpan.length) {
                g_content = wSpan.html();
                wEditarea.query('[name="gcolor"]').attr('checked', true);
            } else {
                g_content = wTr.query('td').item(1).html();
                wEditarea.query('[name="gcolor"]').attr('checked', false);
            }

            wEditarea.show()
                .query('textarea').val(g_content).removeClass('non-active').attr('gonggao-id', wTr.attr('gonggao-id')).focus();
            var type_id = wTr.attr('type-id');
            
            wEditarea.query('select').val(type_id==2 ? type_id : '1');
            var wActiveline = W('.gonggao-active-line');
            wActiveline.hide();
            W('.gonggao-add-title').hide();
            W('.gonggao-edit-title').show();
        },
        // 删除公告
        '.gonggao-delete-item': function(e){
            e.preventDefault();

            var wMe = W(this),
                wTr = wMe.parentNode('tr'),
                params = {
                    'id': wTr.attr('gonggao-id')
                };

            // 删除公告
            QW.Ajax.post(URL_ROOT+'mer_info/del_gonggao', params, function(response){
                response = (response || "").evalExp();

                if (parseInt(response.errno, 10)===0) {
                    if(wTr.siblings('tr').length==1){
                        wTr.siblings('tr').item(0).insertSiblingAfter('<tr><td colspan="4">还没有公告~~</td></tr>');
                    } else {
                        wTr.nextSiblings('tr').forEach(function(el){
                            var wCurTr = W(el);
                                wCurTd = wCurTr.query('td').item(0);
                            wCurTd.html(parseInt(wCurTd.html(), 10)-1);
                        });
                    }
                    wTr.removeNode();
                } else {
                    alert(response.errmsg);
                }
            });
        },
        // 确认添加/编辑公告
        '.gonggao-edit-confirm': function(e){
            e.preventDefault();

            var wMe = W(this),
                wTextarea = wMe.siblings('textarea'),
                gonggao_id = wTextarea.attr('gonggao-id'),
                gonggao_content = wTextarea.val(),
                gtype = $('[name="gtype"]').val(),
                gcolor = $('[name="gcolor"]:checked').val(),
                gcolor = (gcolor == 1 ? 1 : 0),
                params = {
                    'gtype': gtype,
                    'content': gonggao_content,
                    'color': gcolor
                },
                request_url = URL_ROOT+'mer_info/add_gonggao';
            var wTr = W('.gonggao-item tr');
            var wType2 = wTr.filter('[type-id="2"]');
            // 手机订单公告
            if (gtype=='2') {
                if(wType2.length&&wType2.attr('gonggao-id')!=gonggao_id){
                    alert('只能发布1条手机订单公告');
                    return;
                }
            } else {
                if((wTr.length-wType2.length-1)>2){
                    var wGG = wTr.filter('[gonggao-id="'+gonggao_id+'"]');
                    // 增加
                    if (!wGG.length) {
                        alert('最多只能发布3条商家公告');
                        return;
                    }
                    // 编辑
                    else {
                        if(wGG.attr('type-id')=='2'){
                            alert('最多只能发布3条商家公告');
                            return;
                        }
                    }
                }
            }
            if (wTextarea.hasClass('non-active') || wTextarea.val()==='') {
                alert('请输入公告内容');
                return ;
            }
            if (gonggao_id) {
                request_url = URL_ROOT+'mer_info/edit_gonggao';
                params['id'] = gonggao_id;
            }

            // 添加/编辑 公告
            QW.Ajax.post(request_url, params, function(response){
                response = (response || "").evalExp();

                if (parseInt(response.errno, 10)===0) {
                    var result = response['result'];
                    if (gonggao_id) {
                        var wEdititem = wTr.filter('[gonggao-id="'+gonggao_id+'"]'),
                            wTd = wEdititem.query('td');

                        wEdititem.attr('type-id', result['type']);
                        wTd.item(1).html(result['content']);
                        wTd.item(2).html(result['type_name']);

                        closeGongGaoEdit();
                        return ;
                    }
                    var tr_index = wTr.length,
                        wLastitem = wTr.item(wTr.length-1);
                    if (wLastitem.query('td').length==1) {
                        wLastitem.removeNode();

                        wTr = W('.gonggao-item tr');
                        tr_index = wTr.length;
                        wLastitem = wTr.item(wTr.length-1);
                    }
                    var tr_str = '<tr gonggao-id="'+result['id']+'" type-id="'+result['type']+'"><td>'+tr_index+'</td><td class="align-left">'+result['content']+'</td><td>'+result['type_name']+'</td><td>'+result['create_time']+'</td><td><a href="#" class="gonggao-edit-item">修改</a><a href="#" class="gonggao-delete-item">删除</a></td></tr>';
                    wLastitem.insertSiblingAfter(tr_str);

                    closeGongGaoEdit();
                } else {
                    alert(response.errmsg);
                }
            });
        },
        // 关闭添加
        '.gonggao-close-add': function(e){
            e.preventDefault();

            closeGongGaoEdit();
        },
        // 关闭编辑
        '.gonggao-close-edit': function(e){
            e.preventDefault();

            closeGongGaoEdit();
        },
        // textarea框的基本事件
        '.gonggao-textarea': {
            'focus': function(e){
                var wMe = W(this);

                if (wMe.hasClass('non-active') && wMe.val()==='例：消费满200元免费上门') {
                    wMe.val('');
                }
                wMe.removeClass('non-active');
            },
            'blur': function(e){
                var wMe = W(this);

                if (wMe.val()==='') {
                    wMe.addClass('non-active').val('例：消费满200元免费上门');
                }
            }
        },
        // 添加暂停营业时间
        '.add-rest-time-btn': function(e){
            e.preventDefault();

            var panel = tcb.alert("添加暂停营业时间", '<div id="AddRestTimePannel" class="add-rest-time-pannel"></div>', {'width':300, btn_name: '确认'}, function(){
                var starttime = W('#PRestStarttime').val(),
                    endtime = W('#PRestEndtime').val();
                if (starttime>endtime) {
                    return false;
                }
                W('.rest-starttime-inpt').val(starttime);
                W('.rest-endtime-inpt').val(endtime);
                W('.rest-time-range').html(starttime+' 至 '+endtime+' 暂停营业');

                var request_url = URL_ROOT+'mer_info/edit_merinfo',
                    params = {
                        'close_sdate': starttime,
                        'close_edate': endtime
                    };
                QW.Ajax.post(request_url, params, function(response){
                    response = (response || "").evalExp();

                    if (parseInt(response.errno, 10)===0) {
                        W('.add-rest-time-btn').html('修改暂停营业时间')
                    } else {
                        alert(response.errmsg);
                    }
                });
                return true;
            });
            var starttime = W('.rest-starttime-inpt').val(),
                endtime = W('.rest-endtime-inpt').val(),
                data = {
                    'starttime': starttime,
                    'endtime': endtime
                };
            if (!starttime) {
                var todayDate = new Date;
                data['starttime'] = todayDate.getFullYear()+'-'+fixLength(todayDate.getMonth()+1)+'-'+fixLength(todayDate.getDate());
                data['endtime'] = data['starttime'];
            }

            var rest_fn = W('#AddRestTimeTpl').html().trim().tmpl(),
                rest_str = rest_fn(data);
            W('#AddRestTimePannel').html(rest_str);
        },
        // 选择暂停营业的起止时间
        '#PRestStarttime, #PRestEndtime':{
            'focus': function(e){
                var wMe = W(this);
                var attr_toDateEl = wMe.attr('toDateEl'),
                    attr_fromDateEl = wMe.attr('fromDateEl');
                // starttime input
                if (attr_toDateEl) {
                    var toDateEl = W('#'+attr_toDateEl);

                    if (toDateEl.val()<wMe.val()) {
                        W('#AddRestTimePannel .warn-tip').show();
                    } else{
                        W('#AddRestTimePannel .warn-tip').hide();
                    }
                }
                // endtime input
                else if(attr_fromDateEl){
                    var fromDateEl = W('#'+attr_fromDateEl);

                    if (fromDateEl.val()>wMe.val()) {
                        W('#AddRestTimePannel .warn-tip').show();
                    } else{
                        W('#AddRestTimePannel .warn-tip').hide();
                    }
                }                
            },
            'click': function(e){
                var me = this;

                QW.Calendar.pickDate(me);
            }
        },
        //如果选择上门服务，在需要显示上门范围。
        '#service_modes_box input[type="checkbox"]' : function(e){
            if( W('#service_mode_0').attr('checked') ){
                W('#sm_range_box').show();
            }else{
                W('#sm_range_box').hide();
            }
        },
        //全选某tag分组
        '.tag-group-check' : function(e){
            var ckList = W(this).parentNode('.weixiuneirong').query('.tag-list[data-rel="'+W(this).attr('data-for')+'"] input[type="checkbox"]');
            if( W(this).attr('checked') ){
                ckList.attr('checked', true);
            }else{
                ckList.attr('checked', false);
            }
        }

    });
    /**
     * 关闭公告编辑
     * @return {[type]} [description]
     */
    function closeGongGaoEdit(){
        W('.gonggao-add-title').hide();
        W('.gonggao-edit-title').hide();
        W('.gonggao-edit-area').hide();
        W('.gonggao-active-line').show();
    }
    /**
     * 用前置0补充字符串的长度
     * @param  {[type]} str [description]
     * @param  {[type]} len [description]
     * @return {[type]}     [description]
     */
    function fixLength(str, len){
        len = parseInt(len, 10) || 2;

        str = str.toString(),
        fixed_len = len - str.length;
        if (fixed_len>0) {
            for(var i=0;i<fixed_len;i++){
                str = '0'+str;
            }
        }

        return str;
    }
});
