/*简单前端模板，改写自QWrap*/
/**
 * 字符串模板
 * @method tmpl
 * @static
 * @param {String} sTmpl 字符串模板，其中变量以{$aaa}表示。模板语法：
 分隔符为{xxx}，"}"之前没有空格字符。
 js表达式/js语句里的'}', 需使用' }'，即前面有空格字符
 模板里的字符{用##7b表示
		 模板里的实体}用##7d表示
 模板里的实体#可以用##23表示。例如（模板真的需要输出"##7d"，则需要这么写“##23#7d”）
 {strip}...{/strip}里的所有\r\n打头的空白都会被清除掉
 {=xxx} 输出经HTML转码的xxx
 {xxx} 输出xxx，xxx只能是表达式，不能使用语句，除非使用以下标签
 {js ...}		－－任意js语句, 里面如果需要输出到模板，用print("aaa");
 {if(...)}		－－if语句，写法为{if($a>1)},需要自带括号
 {elseif(...)}	－－elseif语句，写法为{elseif($a>1)},需要自带括号
 {else}			－－else语句，写法为{else}
 {/if}			－－endif语句，写法为{/if}
 {for(...)}		－－for语句，写法为{for(var i=0;i<1;i++)}，需要自带括号
 {/for}			－－endfor语句，写法为{/for}
 {while(...)}	－－while语句,写法为{while(i-->0)},需要自带括号
 {/while}		－－endwhile语句, 写法为{/while}
 * @param {Object} opts (Optional) 模板参数
 * @return {String|Function}  如果调用时传了opts参数，则返回字符串；如果没传，则返回一个function（相当于把sTmpl转化成一个函数）

 * @example alert(tmpl("{$a} love {$b}.",{a:"I",b:"you"}));
 * @example alert(tmpl("{js print('I')} love {$b}.",{b:"you"}));
 */
(function($) {
	var StringH = {
		tmpl: (function() {
			var tmplFuns={};
			var sArrName = "sArrCMX",
				sLeft = sArrName + '.push("';
			var tags = {
				'=': {
					tagG: '=',
					isBgn: 1,
					isEnd: 1,
					sBgn: '",$.StringH.encode4HtmlValue(',
					sEnd: '),"'
				},
				'js': {
					tagG: 'js',
					isBgn: 1,
					isEnd: 1,
					sBgn: '");',
					sEnd: ';' + sLeft
				},
				'js': {
					tagG: 'js',
					isBgn: 1,
					isEnd: 1,
					sBgn: '");',
					sEnd: ';' + sLeft
				},
				//任意js语句, 里面如果需要输出到模板，用print("aaa");
				'if': {
					tagG: 'if',
					isBgn: 1,
					rlt: 1,
					sBgn: '");if',
					sEnd: '{' + sLeft
				},
				//if语句，写法为{if($a>1)},需要自带括号
				'elseif': {
					tagG: 'if',
					cond: 1,
					rlt: 1,
					sBgn: '");} else if',
					sEnd: '{' + sLeft
				},
				//if语句，写法为{elseif($a>1)},需要自带括号
				'else': {
					tagG: 'if',
					cond: 1,
					rlt: 2,
					sEnd: '");}else{' + sLeft
				},
				//else语句，写法为{else}
				'/if': {
					tagG: 'if',
					isEnd: 1,
					sEnd: '");}' + sLeft
				},
				//endif语句，写法为{/if}
				'for': {
					tagG: 'for',
					isBgn: 1,
					rlt: 1,
					sBgn: '");for',
					sEnd: '{' + sLeft
				},
				//for语句，写法为{for(var i=0;i<1;i++)},需要自带括号
				'/for': {
					tagG: 'for',
					isEnd: 1,
					sEnd: '");}' + sLeft
				},
				//endfor语句，写法为{/for}
				'while': {
					tagG: 'while',
					isBgn: 1,
					rlt: 1,
					sBgn: '");while',
					sEnd: '{' + sLeft
				},
				//while语句,写法为{while(i-->0)},需要自带括号
				'/while': {
					tagG: 'while',
					isEnd: 1,
					sEnd: '");}' + sLeft
				} //endwhile语句, 写法为{/while}
			};
			return function(sTmpl, opts) {
				var fun  = tmplFuns[sTmpl];
				if (!fun) {
					var N = -1,
						NStat = []; //语句堆栈;
					var ss = [
						[/\{strip\}([\s\S]*?)\{\/strip\}/g, function(a, b) {
							return b.replace(/[\r\n]\s*\}/g, " }").replace(/[\r\n]\s*/g, "");
						}],
						[/\\/g, '\\\\'],
						[/"/g, '\\"'],
						[/\r/g, '\\r'],
						[/\n/g, '\\n'], //为js作转码.
						[
							/\{[\s\S]*?\S\}/g, //js里使用}时，前面要加空格。
							function(a) {
								a = a.substr(1, a.length - 2);
								for (var i = 0; i < ss2.length; i++) {a = a.replace(ss2[i][0], ss2[i][1]); }
								var tagName = a;
								if (/^(=|.\w+)/.test(tagName)) {tagName = RegExp.$1; }
								var tag = tags[tagName];
								if (tag) {
									if (tag.isBgn) {
										var stat = NStat[++N] = {
											tagG: tag.tagG,
											rlt: tag.rlt
										};
									}
									if (tag.isEnd) {
										if (N < 0) {throw new Error("Unexpected Tag: " + a); }
										stat = NStat[N--];
										if (stat.tagG != tag.tagG) {throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName); }
									} else if (!tag.isBgn) {
										if (N < 0) {throw new Error("Unexpected Tag:" + a); }
										stat = NStat[N];
										if (stat.tagG != tag.tagG) {throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName); }
										if (tag.cond && !(tag.cond & stat.rlt)) {throw new Error("Unexpected Tag: " + tagName); }
										stat.rlt = tag.rlt;
									}
									return (tag.sBgn || '') + a.substr(tagName.length) + (tag.sEnd || '');
								} else {
									return '",(' + a + '),"';
								}
							}
						]
					];
					var ss2 = [
						[/\\n/g, '\n'],
						[/\\r/g, '\r'],
						[/\\"/g, '"'],
						[/\\\\/g, '\\'],
						[/\$(\w+)/g, 'opts["$1"]'],
						[/print\(/g, sArrName + '.push(']
					];
					for (var i = 0; i < ss.length; i++) {
						sTmpl = sTmpl.replace(ss[i][0], ss[i][1]);
					}
					if (N >= 0) {throw new Error("Lose end Tag: " + NStat[N].tagG); }
					sTmpl = sTmpl.replace(/##7b/g,'{').replace(/##7d/g,'}').replace(/##23/g,'#'); //替换特殊符号{}#
					sTmpl = 'var ' + sArrName + '=[];' + sLeft + sTmpl + '");return ' + sArrName + '.join("");';
					//alert('转化结果\n'+sTmpl);
					tmplFuns[sTmpl] = fun = new Function('opts', sTmpl);
				}
				if (arguments.length > 1) {return fun(opts); }
				return fun;
			};
		}()),
		encode4Html: function(s) {
			var el = document.createElement('pre'); //这里要用pre，用div有时会丢失换行，例如：'a\r\n\r\nb'
			var text = document.createTextNode(s);
			el.appendChild(text);
			return el.innerHTML;
		},
		encode4HtmlValue: function(s) {
     		return StringH.encode4Html(s).replace(/"/g, "&quot;").replace(/'/g, "&#039;");
		}
	};

	$.StringH = StringH;
	$.tmpl = $.StringH.tmpl;
})(jQuery);
