;/**import from `/resource/js/lib/jquery/jquery.color.js` **/
/*!
 * jQuery Color Animations v2.1.2
 * https://github.com/jquery/jquery-color
 *
 * Copyright 2013 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: Wed Jan 16 08:47:09 2013 -0600
 */
(function( jQuery, undefined ) {

	var stepHooks = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",

	// plusequals test for += 100 -= 100
	rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
	// a set of RE's that can match strings and generate color tuples.
	stringParsers = [{
			re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ],
					execResult[ 3 ],
					execResult[ 4 ]
				];
			}
		}, {
			re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ] * 2.55,
					execResult[ 2 ] * 2.55,
					execResult[ 3 ] * 2.55,
					execResult[ 4 ]
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ], 16 )
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ] + execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ] + execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ] + execResult[ 3 ], 16 )
				];
			}
		}, {
			re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			space: "hsla",
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ] / 100,
					execResult[ 3 ] / 100,
					execResult[ 4 ]
				];
			}
		}],

	// jQuery.Color( )
	color = jQuery.Color = function( color, green, blue, alpha ) {
		return new jQuery.Color.fn.parse( color, green, blue, alpha );
	},
	spaces = {
		rgba: {
			props: {
				red: {
					idx: 0,
					type: "byte"
				},
				green: {
					idx: 1,
					type: "byte"
				},
				blue: {
					idx: 2,
					type: "byte"
				}
			}
		},

		hsla: {
			props: {
				hue: {
					idx: 0,
					type: "degrees"
				},
				saturation: {
					idx: 1,
					type: "percent"
				},
				lightness: {
					idx: 2,
					type: "percent"
				}
			}
		}
	},
	propTypes = {
		"byte": {
			floor: true,
			max: 255
		},
		"percent": {
			max: 1
		},
		"degrees": {
			mod: 360,
			floor: true
		}
	},
	support = color.support = {},

	// element for support tests
	supportElem = jQuery( "<p>" )[ 0 ],

	// colors = jQuery.Color.names
	colors,

	// local aliases of functions called often
	each = jQuery.each;

// determine rgba support immediately
supportElem.style.cssText = "background-color:rgba(1,1,1,.5)";
support.rgba = supportElem.style.backgroundColor.indexOf( "rgba" ) > -1;

// define cache name and alpha properties
// for rgba and hsla spaces
each( spaces, function( spaceName, space ) {
	space.cache = "_" + spaceName;
	space.props.alpha = {
		idx: 3,
		type: "percent",
		def: 1
	};
});

function clamp( value, prop, allowEmpty ) {
	var type = propTypes[ prop.type ] || {};

	if ( value == null ) {
		return (allowEmpty || !prop.def) ? null : prop.def;
	}

	// ~~ is an short way of doing floor for positive numbers
	value = type.floor ? ~~value : parseFloat( value );

	// IE will pass in empty strings as value for alpha,
	// which will hit this case
	if ( isNaN( value ) ) {
		return prop.def;
	}

	if ( type.mod ) {
		// we add mod before modding to make sure that negatives values
		// get converted properly: -10 -> 350
		return (value + type.mod) % type.mod;
	}

	// for now all property types without mod have min and max
	return 0 > value ? 0 : type.max < value ? type.max : value;
}

function stringParse( string ) {
	var inst = color(),
		rgba = inst._rgba = [];

	string = string.toLowerCase();

	each( stringParsers, function( i, parser ) {
		var parsed,
			match = parser.re.exec( string ),
			values = match && parser.parse( match ),
			spaceName = parser.space || "rgba";

		if ( values ) {
			parsed = inst[ spaceName ]( values );

			// if this was an rgba parse the assignment might happen twice
			// oh well....
			inst[ spaces[ spaceName ].cache ] = parsed[ spaces[ spaceName ].cache ];
			rgba = inst._rgba = parsed._rgba;

			// exit each( stringParsers ) here because we matched
			return false;
		}
	});

	// Found a stringParser that handled it
	if ( rgba.length ) {

		// if this came from a parsed string, force "transparent" when alpha is 0
		// chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
		if ( rgba.join() === "0,0,0,0" ) {
			jQuery.extend( rgba, colors.transparent );
		}
		return inst;
	}

	// named colors
	return colors[ string ];
}

color.fn = jQuery.extend( color.prototype, {
	parse: function( red, green, blue, alpha ) {
		if ( red === undefined ) {
			this._rgba = [ null, null, null, null ];
			return this;
		}
		if ( red.jquery || red.nodeType ) {
			red = jQuery( red ).css( green );
			green = undefined;
		}

		var inst = this,
			type = jQuery.type( red ),
			rgba = this._rgba = [];

		// more than 1 argument specified - assume ( red, green, blue, alpha )
		if ( green !== undefined ) {
			red = [ red, green, blue, alpha ];
			type = "array";
		}

		if ( type === "string" ) {
			return this.parse( stringParse( red ) || colors._default );
		}

		if ( type === "array" ) {
			each( spaces.rgba.props, function( key, prop ) {
				rgba[ prop.idx ] = clamp( red[ prop.idx ], prop );
			});
			return this;
		}

		if ( type === "object" ) {
			if ( red instanceof color ) {
				each( spaces, function( spaceName, space ) {
					if ( red[ space.cache ] ) {
						inst[ space.cache ] = red[ space.cache ].slice();
					}
				});
			} else {
				each( spaces, function( spaceName, space ) {
					var cache = space.cache;
					each( space.props, function( key, prop ) {

						// if the cache doesn't exist, and we know how to convert
						if ( !inst[ cache ] && space.to ) {

							// if the value was null, we don't need to copy it
							// if the key was alpha, we don't need to copy it either
							if ( key === "alpha" || red[ key ] == null ) {
								return;
							}
							inst[ cache ] = space.to( inst._rgba );
						}

						// this is the only case where we allow nulls for ALL properties.
						// call clamp with alwaysAllowEmpty
						inst[ cache ][ prop.idx ] = clamp( red[ key ], prop, true );
					});

					// everything defined but alpha?
					if ( inst[ cache ] && jQuery.inArray( null, inst[ cache ].slice( 0, 3 ) ) < 0 ) {
						// use the default of 1
						inst[ cache ][ 3 ] = 1;
						if ( space.from ) {
							inst._rgba = space.from( inst[ cache ] );
						}
					}
				});
			}
			return this;
		}
	},
	is: function( compare ) {
		var is = color( compare ),
			same = true,
			inst = this;

		each( spaces, function( _, space ) {
			var localCache,
				isCache = is[ space.cache ];
			if (isCache) {
				localCache = inst[ space.cache ] || space.to && space.to( inst._rgba ) || [];
				each( space.props, function( _, prop ) {
					if ( isCache[ prop.idx ] != null ) {
						same = ( isCache[ prop.idx ] === localCache[ prop.idx ] );
						return same;
					}
				});
			}
			return same;
		});
		return same;
	},
	_space: function() {
		var used = [],
			inst = this;
		each( spaces, function( spaceName, space ) {
			if ( inst[ space.cache ] ) {
				used.push( spaceName );
			}
		});
		return used.pop();
	},
	transition: function( other, distance ) {
		var end = color( other ),
			spaceName = end._space(),
			space = spaces[ spaceName ],
			startColor = this.alpha() === 0 ? color( "transparent" ) : this,
			start = startColor[ space.cache ] || space.to( startColor._rgba ),
			result = start.slice();

		end = end[ space.cache ];
		each( space.props, function( key, prop ) {
			var index = prop.idx,
				startValue = start[ index ],
				endValue = end[ index ],
				type = propTypes[ prop.type ] || {};

			// if null, don't override start value
			if ( endValue === null ) {
				return;
			}
			// if null - use end
			if ( startValue === null ) {
				result[ index ] = endValue;
			} else {
				if ( type.mod ) {
					if ( endValue - startValue > type.mod / 2 ) {
						startValue += type.mod;
					} else if ( startValue - endValue > type.mod / 2 ) {
						startValue -= type.mod;
					}
				}
				result[ index ] = clamp( ( endValue - startValue ) * distance + startValue, prop );
			}
		});
		return this[ spaceName ]( result );
	},
	blend: function( opaque ) {
		// if we are already opaque - return ourself
		if ( this._rgba[ 3 ] === 1 ) {
			return this;
		}

		var rgb = this._rgba.slice(),
			a = rgb.pop(),
			blend = color( opaque )._rgba;

		return color( jQuery.map( rgb, function( v, i ) {
			return ( 1 - a ) * blend[ i ] + a * v;
		}));
	},
	toRgbaString: function() {
		var prefix = "rgba(",
			rgba = jQuery.map( this._rgba, function( v, i ) {
				return v == null ? ( i > 2 ? 1 : 0 ) : v;
			});

		if ( rgba[ 3 ] === 1 ) {
			rgba.pop();
			prefix = "rgb(";
		}

		return prefix + rgba.join() + ")";
	},
	toHslaString: function() {
		var prefix = "hsla(",
			hsla = jQuery.map( this.hsla(), function( v, i ) {
				if ( v == null ) {
					v = i > 2 ? 1 : 0;
				}

				// catch 1 and 2
				if ( i && i < 3 ) {
					v = Math.round( v * 100 ) + "%";
				}
				return v;
			});

		if ( hsla[ 3 ] === 1 ) {
			hsla.pop();
			prefix = "hsl(";
		}
		return prefix + hsla.join() + ")";
	},
	toHexString: function( includeAlpha ) {
		var rgba = this._rgba.slice(),
			alpha = rgba.pop();

		if ( includeAlpha ) {
			rgba.push( ~~( alpha * 255 ) );
		}

		return "#" + jQuery.map( rgba, function( v ) {

			// default to 0 when nulls exist
			v = ( v || 0 ).toString( 16 );
			return v.length === 1 ? "0" + v : v;
		}).join("");
	},
	toString: function() {
		return this._rgba[ 3 ] === 0 ? "transparent" : this.toRgbaString();
	}
});
color.fn.parse.prototype = color.fn;

// hsla conversions adapted from:
// https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021

function hue2rgb( p, q, h ) {
	h = ( h + 1 ) % 1;
	if ( h * 6 < 1 ) {
		return p + (q - p) * h * 6;
	}
	if ( h * 2 < 1) {
		return q;
	}
	if ( h * 3 < 2 ) {
		return p + (q - p) * ((2/3) - h) * 6;
	}
	return p;
}

spaces.hsla.to = function ( rgba ) {
	if ( rgba[ 0 ] == null || rgba[ 1 ] == null || rgba[ 2 ] == null ) {
		return [ null, null, null, rgba[ 3 ] ];
	}
	var r = rgba[ 0 ] / 255,
		g = rgba[ 1 ] / 255,
		b = rgba[ 2 ] / 255,
		a = rgba[ 3 ],
		max = Math.max( r, g, b ),
		min = Math.min( r, g, b ),
		diff = max - min,
		add = max + min,
		l = add * 0.5,
		h, s;

	if ( min === max ) {
		h = 0;
	} else if ( r === max ) {
		h = ( 60 * ( g - b ) / diff ) + 360;
	} else if ( g === max ) {
		h = ( 60 * ( b - r ) / diff ) + 120;
	} else {
		h = ( 60 * ( r - g ) / diff ) + 240;
	}

	// chroma (diff) == 0 means greyscale which, by definition, saturation = 0%
	// otherwise, saturation is based on the ratio of chroma (diff) to lightness (add)
	if ( diff === 0 ) {
		s = 0;
	} else if ( l <= 0.5 ) {
		s = diff / add;
	} else {
		s = diff / ( 2 - add );
	}
	return [ Math.round(h) % 360, s, l, a == null ? 1 : a ];
};

spaces.hsla.from = function ( hsla ) {
	if ( hsla[ 0 ] == null || hsla[ 1 ] == null || hsla[ 2 ] == null ) {
		return [ null, null, null, hsla[ 3 ] ];
	}
	var h = hsla[ 0 ] / 360,
		s = hsla[ 1 ],
		l = hsla[ 2 ],
		a = hsla[ 3 ],
		q = l <= 0.5 ? l * ( 1 + s ) : l + s - l * s,
		p = 2 * l - q;

	return [
		Math.round( hue2rgb( p, q, h + ( 1 / 3 ) ) * 255 ),
		Math.round( hue2rgb( p, q, h ) * 255 ),
		Math.round( hue2rgb( p, q, h - ( 1 / 3 ) ) * 255 ),
		a
	];
};


each( spaces, function( spaceName, space ) {
	var props = space.props,
		cache = space.cache,
		to = space.to,
		from = space.from;

	// makes rgba() and hsla()
	color.fn[ spaceName ] = function( value ) {

		// generate a cache for this space if it doesn't exist
		if ( to && !this[ cache ] ) {
			this[ cache ] = to( this._rgba );
		}
		if ( value === undefined ) {
			return this[ cache ].slice();
		}

		var ret,
			type = jQuery.type( value ),
			arr = ( type === "array" || type === "object" ) ? value : arguments,
			local = this[ cache ].slice();

		each( props, function( key, prop ) {
			var val = arr[ type === "object" ? key : prop.idx ];
			if ( val == null ) {
				val = local[ prop.idx ];
			}
			local[ prop.idx ] = clamp( val, prop );
		});

		if ( from ) {
			ret = color( from( local ) );
			ret[ cache ] = local;
			return ret;
		} else {
			return color( local );
		}
	};

	// makes red() green() blue() alpha() hue() saturation() lightness()
	each( props, function( key, prop ) {
		// alpha is included in more than one space
		if ( color.fn[ key ] ) {
			return;
		}
		color.fn[ key ] = function( value ) {
			var vtype = jQuery.type( value ),
				fn = ( key === "alpha" ? ( this._hsla ? "hsla" : "rgba" ) : spaceName ),
				local = this[ fn ](),
				cur = local[ prop.idx ],
				match;

			if ( vtype === "undefined" ) {
				return cur;
			}

			if ( vtype === "function" ) {
				value = value.call( this, cur );
				vtype = jQuery.type( value );
			}
			if ( value == null && prop.empty ) {
				return this;
			}
			if ( vtype === "string" ) {
				match = rplusequals.exec( value );
				if ( match ) {
					value = cur + parseFloat( match[ 2 ] ) * ( match[ 1 ] === "+" ? 1 : -1 );
				}
			}
			local[ prop.idx ] = value;
			return this[ fn ]( local );
		};
	});
});

// add cssHook and .fx.step function for each named hook.
// accept a space separated string of properties
color.hook = function( hook ) {
	var hooks = hook.split( " " );
	each( hooks, function( i, hook ) {
		jQuery.cssHooks[ hook ] = {
			set: function( elem, value ) {
				var parsed, curElem,
					backgroundColor = "";

				if ( value !== "transparent" && ( jQuery.type( value ) !== "string" || ( parsed = stringParse( value ) ) ) ) {
					value = color( parsed || value );
					if ( !support.rgba && value._rgba[ 3 ] !== 1 ) {
						curElem = hook === "backgroundColor" ? elem.parentNode : elem;
						while (
							(backgroundColor === "" || backgroundColor === "transparent") &&
							curElem && curElem.style
						) {
							try {
								backgroundColor = jQuery.css( curElem, "backgroundColor" );
								curElem = curElem.parentNode;
							} catch ( e ) {
							}
						}

						value = value.blend( backgroundColor && backgroundColor !== "transparent" ?
							backgroundColor :
							"_default" );
					}

					value = value.toRgbaString();
				}
				try {
					elem.style[ hook ] = value;
				} catch( e ) {
					// wrapped to prevent IE from throwing errors on "invalid" values like 'auto' or 'inherit'
				}
			}
		};
		jQuery.fx.step[ hook ] = function( fx ) {
			if ( !fx.colorInit ) {
				fx.start = color( fx.elem, hook );
				fx.end = color( fx.end );
				fx.colorInit = true;
			}
			jQuery.cssHooks[ hook ].set( fx.elem, fx.start.transition( fx.end, fx.pos ) );
		};
	});

};

color.hook( stepHooks );

jQuery.cssHooks.borderColor = {
	expand: function( value ) {
		var expanded = {};

		each( [ "Top", "Right", "Bottom", "Left" ], function( i, part ) {
			expanded[ "border" + part + "Color" ] = value;
		});
		return expanded;
	}
};

// Basic color names only.
// Usage of any of the other color names requires adding yourself or including
// jquery.color.svg-names.js.
colors = jQuery.Color.names = {
	// 4.1. Basic color keywords
	aqua: "#00ffff",
	black: "#000000",
	blue: "#0000ff",
	fuchsia: "#ff00ff",
	gray: "#808080",
	green: "#008000",
	lime: "#00ff00",
	maroon: "#800000",
	navy: "#000080",
	olive: "#808000",
	purple: "#800080",
	red: "#ff0000",
	silver: "#c0c0c0",
	teal: "#008080",
	white: "#ffffff",
	yellow: "#ffff00",

	// 4.2.3. "transparent" color keyword
	transparent: [ null, null, null, 0 ],

	_default: "#ffffff"
};

})( jQuery );


;/**import from `/resource/js/lib/jquery/jquery.shine4error.js` **/
(function($){

    //$.fn.shine4Error = function(){
    //    var $me = $(this);
    //
    //    var obgc = $me.css('background-color');
    //
    //    $me.animate({'backgroundColor' : '#f00'}, 100, function(){
    //        $me.animate({'backgroundColor' : obgc}, 400);
    //    });
    //
    //    //$me.css('background-color', '#f00').animate({'backgroundColor' : '#fff'}, 400, function(){
    //    //    $me.css('background-color', obgc);
    //    //});
    //
    //    return $me;
    //}
    function errorAnimate (obj) {
        obj = $ (obj)

        obj.each (function () {
            var
                me = this,
                orig_background_color = me.style.backgroundColor

            $ (me).css ('background-color', '#f00').animate ({ 'background-color' : '#fff' }, 1200, /*'cubic-bezier(.28,.2,.51,1.15)', */function () {
                me.style.backgroundColor = orig_background_color || ''
            })
        })
    }

    $.errorAnimate = errorAnimate
    $.fn.shine4Error = function () {
        $.errorAnimate (this)

        return $ (this)
    }
})(jQuery);

;/**import from `/resource/js/component/addr_suggest.js` **/
function AddrSuggest( obj, conf){
	if(W( obj ).length==0){ return null; }
	conf = conf || {};

	this.obj = W( obj );
    this.curObj = null;
	this.data = null;
	this.suglist = null;
	this.defsug = null;
	this.showNum = conf.showNum || 10; //sug列表项数量
	this.onSelect = conf.onSelect || null; //选中某项时的回调
	this.requireCity = conf.requireCity || function() { return '';}  //当前城市获取回调
	this.noDefSug = conf.noDefSug || false;  //是否不显示默认提示？
	this.zIndex = conf.zIndex||999;

	this._cacheData = {};

	var mapObj;
	var _this = this;

	this.init = function(){
		var _this = this;
		if( !(AMap && AMap.Map) ){
			setTimeout(function(){ _this.init() }, 300);
			return false;
		}

		var _tmpdiv = "aMapContainer" + Math.ceil(Math.random()*10000);
		W('<div id="'+_tmpdiv+'"></div>').appendTo( W('body') ).hide();

		mapObj = new AMap.Map( _tmpdiv );

		this.createDropList();
		this.createDefSug();

		this.showDefaultTxt();

		this.bindEvent();
	}

	this.bindEvent = function(){
		var _obj = this.obj;

		_obj.on('focus', function(){
            var wMe = W(this),
                deftxt = wMe.attr('data-default')||'';

            _this.setCurObj(wMe);

			_this.resetSugListPos(_this.suglist);
			_this.resetSugListPos(_this.defsug);

			if( deftxt == wMe.val() ){
                wMe.val('');
				if(!_this.noDefSug){
					_this.defsug.show().css({
                        'z-index' : tcb.zIndex()
                    })
				}
			}else if(wMe.val().length>0){
				_this.fetchSug( wMe.val() );
				_this.defsug.hide()
			}
            wMe.removeClass('default');
		});

		_obj.on('blur', function(){
            var wMe = W(this),
                txt = wMe.val(),
                deftxt = wMe.attr('data-default')||'';

            if(txt =='' &&  deftxt){
                wMe.val( deftxt );
                txt = deftxt;
			}
			setTimeout(function(){ _this.suglist.hide(); } ,160);
            if (txt==deftxt) {
                wMe.addClass('default');
            }
            _this.defsug.hide();
		});

		_obj.on('keyup', function(e){
            var wMe = W(this),
                deftxt = wMe.attr('data-default')||'';

            _this.setCurObj(wMe);

            if(e.keyCode == 38){
				_this.selectItem(-1);
			}else if(e.keyCode == 40){
				_this.selectItem(1);
			}else if(e.keyCode == 13){				
				var nowsel = _this.suglist.one('.on');
				if( nowsel.length>0 ){
					nowsel.fire('click');
				}
			}else{
				if( wMe.val()!='' && wMe.val()!= deftxt ){
					_this.fetchSug( wMe.val() );
					_this.defsug.hide();
				}else{
					_this.suglist.hide();

					if(!_this.noDefSug){
						_this.defsug.show().css({
                            'z-index' : tcb.zIndex()
                        })
					}
				}
			}
		});	

		_obj.on('input', function(e){
            var wMe = W(this),
                deftxt = wMe.attr('data-default')||'';

            _this.setCurObj(wMe);

            if(e.keyCode == 38){
				_this.selectItem(-1);
			}else if(e.keyCode == 40){
				_this.selectItem(1);
			}else if(e.keyCode == 13){				
				var nowsel = _this.suglist.one('.on');
				if( nowsel.length>0 ){					
					nowsel.fire('click');
				}
			}else{
				if( wMe.val()!='' && wMe.val()!= deftxt ){
					_this.fetchSug( wMe.val() );
					_this.defsug.hide();
				}else{
					_this.suglist.hide();

					if(!_this.noDefSug){
						_this.defsug.show().css({
                            'z-index' : tcb.zIndex()
                        })
					}
				}
			}
		});	

		_obj.on('keypress', function(e){
			if(e.keyCode == 13){ //如果当前有选中项，就阻止默认表单提交事件。（在keyup事件中处理具体选中流程）
				var nowsel = _this.suglist.one('.on');
				if( nowsel.length>0 ){
					e.preventDefault();
				}
			}
		});		

		_this.suglist.delegate('.ui-addrsug-sugitem', 'click', function(e){
			var name = W(this).attr('data-name');
			var wholename = W(this).attr('data-whole');

            var _curObj = _this.getCurObj();

            _curObj.val( wholename );
			if(_this.suglist && _this.suglist.css('display')!='none'){
				_this.suglist.hide();
			}
			if(_this.onSelect){
				_this.onSelect(wholename);
			}
		});
	};

    // 显示默认文字
	this.showDefaultTxt = function(){
		var _obj = this.obj;
        if (_obj && _obj.length>0) {
            _obj.forEach(function(el, i){
                var wEl = W(el);
                var deftxt = wEl.attr('data-default')||'';
                if( wEl.val()=='' &&  deftxt){
                    wEl.val( deftxt );
                }
                wEl.addClass('default');
            });
        }
	};
    // 获取当前obj
    this.getCurObj = function() {
        return this.curObj || this.obj;
    };
    // 获取当前obj
    this.setCurObj = function(curObj) {
        this.curObj = curObj || this.obj;

        return this.curObj;
    };

	this.fetchSug = function(txt){
		try{
			var cData = _this._cacheData[ encodeURIComponent(_this.requireCity()+'-'+txt) ];
			if(cData){
				_this.gotData(cData);
			}else{
				//加载输入提示插件  
			    mapObj.plugin(["AMap.Autocomplete"], function() {  
			        var autoOptions = {
			            city: _this.requireCity() //城市，默认全国  
			        };
			        var auto = new AMap.Autocomplete(autoOptions);
			        //查询成功时返回查询结果  
			        AMap.event.addListener(auto,"complete", function(data){ 
			        	_this._cacheData[ encodeURIComponent(_this.requireCity()+'-'+txt) ]=data;
			        	_this.gotData(data);
			        });
			        auto.search(txt);
			    });
		    }
		}catch(ex){//Something wrong was here, but I can't find it out. So, Try-Catch it.

		}
	}

	this.gotData = function(data){		
		if(data && data.tips){
			_this.render( data.tips );
		}else{
			_this.suglist.hide();
		}
	}

	this.createDropList = function(){
		var suglist = W('<div class="ui-addrsug-suglist">').appendTo( W('body') ).hide()

		this.suglist = suglist;

		this.resetSugListPos(suglist);
	}

	this.resetSugListPos = function( suglist){
        var cur_obj = _this.getCurObj();

		var rect = cur_obj.getRect();
		var setWidth = cur_obj.attr('data-sugwidth')-0;

		suglist.css({
			'position' : 'absolute',
			'z-index' : tcb.zIndex(),
			'width' :  setWidth || rect.width,
			'left' : rect.left,
			'top' : rect.top + rect.height + 2
		});
	}

	this.render = function( data ){
		if(data.length > 0){
			var str = '';
			for( var i=0, n=Math.min( data.length, this.showNum ); i<n; i++ ){
				var item = data[i];
				str += '<div class="ui-addrsug-sugitem" data-name="'+item.name+'" data-whole="'+item.district+item.name+'"><b>'+item.name+'</b><span>'+item.district+'</span></div>';
			}
			this.suglist.show().html( str ).css({
                'z-index' : tcb.zIndex()
            })
		}else{
			this.suglist.hide();
		}
	}

	this.selectItem = function(direc){
		var now = this.suglist.one('.on');			
		if(!direc || direc==1){			
			if(now.length == 0){
				this.suglist.query('.ui-addrsug-sugitem:first-child').addClass('on');
			}else{
				now.removeClass('on');
				var next = now.nextSibling('.ui-addrsug-sugitem');				
				next.length > 0 ? next.addClass('on') : this.suglist.query('.ui-addrsug-sugitem:first-child').addClass('on');	
			}
		}else{
			if(now.length == 0){
				this.suglist.query('.ui-addrsug-sugitem:last-child').addClass('on');
			}else{
				now.removeClass('on');
				var prev = now.previousSibling('.ui-addrsug-sugitem');
				prev.length > 0 ? prev.addClass('on') : this.suglist.query('.ui-addrsug-sugitem:last-child').addClass('on');				
			}
		}
	}

	/**
	 * 默认提示
	 * @return {[type]} [description]
	 */
	this.createDefSug = function(){
		var txt = "可以搜索您所在的小区、写字楼或标志性建筑";
		var suglist = W('<div class="ui-addrsug-defsug">').appendTo( W('body') ).hide()

		W('<div class="ui-addrsug-defitem"></div>').html(txt).appendTo(suglist);

		this.defsug = suglist;

		this.resetSugListPos(suglist);
	}

	this.init();
}


;/**import from `/resource/js/include/AreaSelect.js` **/
(function(){
window.bang = window.bang || {};
/**
 * 区域选择
 * @param {[type]} options [description]
 */
function AreaSelect(options){
    var defaults = {
        'wrap': '#citySelector',
        'data': {
            'cityid': '',
            'citycode': '',
            'cityname': '',
            'areacode': '',
            'areaname': '',
            'quancode': '',
            'quanname': ''
        },
        'hasarea': true,  // 是否显示区县
        'hasquan': true,  // 是否显示商圈
        'autoinit': true, // 是否自动初始化
        'urlhost': '',    // 请求的url
        // new后init的回调
        'onInit': function(){},
        // 城市选择时触发
        'onCitySelect': function(data){},
        // 区县选择时触发
        'onAreaSelect': function(data){},
        // 商圈选择时触发
        'onQuanSelect': function(data){}
    }
    options = options || {};
    var data = options.data || {}
    QW.ObjectH.map(data, function (val, key) {
        if (val && typeof val === 'string') {
            data[key] = tcb.html_encode(val)
        }
    })
    options.data = data
    options = QW.ObjectH.mix(defaults, options, true);
    options.urlhost = options.urlhost || 'http://' + location.host +'/';

    var me = this;
    me.options = options; // 配置项
    me.data = {}; // 用于回调中的参数

    var fn = AreaSelect.prototype;
    if (typeof fn.eventBind === 'undefined') {

        /**
         * 设置data
         * @param {[type]} key  [description]
         * @param {[type]} val  [description]
         * @param {[type]} flag [description]
         */
        fn.setData = function(key, val, flag){
            var me = this;

            if (QW.ObjectH.isObject(key)) {
                flag = val;
                val = null;
            }
            else if (QW.ObjectH.isString(key)) {
                key = {
                    key:val
                };
            } else {
                return;
            }

            if (flag) {
                me.data = key;
            } else{
                me.data = QW.ObjectH.mix(me.data, key, true);
            }
        }
        /**
         * 返回城市、区县、商圈相关数据
         * @return {[type]} [description]
         */
        fn.getData = function(){
            var me = this;

            return me.data;
        }
        /**
         * 根据key删除data中的数据
         */
        fn.deleteData = function(key){
            var me = this;

            var data = me.data;
            if (QW.ObjectH.isArray(key)) {
                QW.ObjectH.map(key, function(v){
                    if(typeof data[v] !== 'undefined'){
                        delete data[v];
                    }
                });
            }
            if (QW.ObjectH.isString(key)) {
                if (typeof data[key] !== 'undefined') {
                    delete data[key];
                }
            }
        }
        /**
         * 获取区县信息
         * @param  {[type]} citycode [description]
         * @return {[type]}          [description]
         */
        fn.getArea = function(citycode){
            var me = this;
            var url = me.options['urlhost'] + 'aj/get_area/?citycode='+citycode;

            // 移除商圈选择
            me._removeAreaTrigger();
            me._removeQuanTrigger();
            // QW.Ajax.get(url, function(responseText){
            //     try{
            //         var area_list = QW.JSON.parse(responseText)['result'];

            //         var options_str = '';
            //         if (QW.ObjectH.isObject(area_list)) {
            //             QW.ObjectH.map(area_list, function(v, k){
            //                 options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
            //             });
            //         }

            //         if (options_str) {
            //             options_str = '<a href="javascript:;">全部区县</a>' + options_str;

            //             var wAreaTrigger = me._getAreaTrigger();
            //             wAreaTrigger.show();
            //             wAreaTrigger.query('.select-list').html(options_str);
            //         }
            //     } catch (e){}
            // });
            setTimeout(function(){
                QW.loadJsonp(url, function(data){
                    // try{
                        var area_list = data['result'];

                        var options_str = '';
                        if (QW.ObjectH.isObject(area_list)) {
                            QW.ObjectH.map(area_list, function(v, k){
                                options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
                            });
                        }

                        if (options_str) {
                            options_str = '<a href="javascript:;">全部区县</a>' + options_str;

                            var wAreaTrigger = me._getAreaTrigger();
                            wAreaTrigger.show();
                            wAreaTrigger.query('.select-list').html(options_str);
                        }
                    // } catch (e){}
                });
            }, 160);

        }
        /**
         * 获取商圈信息
         * @param  {[type]} citycode [description]
         * @param  {[type]} areacode [description]
         * @return {[type]}          [description]
         */
        fn.getQuan = function(citycode, areacode){
            var me = this;
            var url = me.options['urlhost'] +'aj/get_areaquan/?citycode='+citycode+'&areacode='+areacode;

            // 移除商圈选择
            me._removeQuanTrigger();
            // QW.Ajax.get(url, function(responseText){
            //     try{
            //         var area_list = QW.JSON.parse(responseText)['result'];

            //         var options_str = '';
            //         if (QW.ObjectH.isObject(area_list)) {
            //             QW.ObjectH.map(area_list, function(v, k){
            //                 options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
            //             });
            //         }

            //         if (options_str) {
            //             options_str = '<a href="javascript:;">全部商圈</a>' + options_str;

            //             var wQuanTrigger = me._getQuanTrigger();
            //             wQuanTrigger.show();
            //             wQuanTrigger.query('.select-list').html(options_str);
            //         }
            //     } catch (e){}
            // });
            setTimeout(function(){
                QW.loadJsonp(url, function(data){
                    // try{
                        var area_list = data['result'];

                        var options_str = '';
                        if (QW.ObjectH.isObject(area_list)) {
                            QW.ObjectH.map(area_list, function(v, k){
                                options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
                            });
                        }

                        if (options_str) {
                            options_str = '<a href="javascript:;">全部商圈</a>' + options_str;

                            var wQuanTrigger = me._getQuanTrigger();
                            wQuanTrigger.show();
                            wQuanTrigger.query('.select-list').html(options_str);
                        }
                    // } catch (e){}
                });
            }, 160);
        }
        /**
         * 获取组件的最外层的对象；
         * @return {[type]} [description]
         */
        fn.getWrap = function(){
            var me = this;
            if (me.wWrap) {
                return me.wWrap;
            }
            var wWrap = QW.ObjectH.isObject(me.options['wrap']) ? me.options['wrap'] : W(me.options['wrap']);

            return me.wWrap = wWrap;
        }
        /**
         * 获取城市触发器
         * @return {[type]} [description]
         */
        fn._getCityTrigger = function(){
            var me = this;
            if (me.wCityTrigger) {
                return me.wCityTrigger;
            }
            var wWrap = me.getWrap(),
                wCityTrigger = wWrap.query('.sel-city');

            return me.wCityTrigger = wCityTrigger;
        }
        /**
         * 设置城市触发器上边的相关数据
         * @param {[type]} cityid   [description]
         * @param {[type]} citycode [description]
         * @param {[type]} cityname [description]
         */
        fn._setCityData = function(cityid, citycode, cityname){
            var me = this;

            var wCityTrigger = me._getCityTrigger();
            wCityTrigger.attr('code', citycode);
            wCityTrigger.one('.sel-txt').html(cityname);

            // 设置data
            me.setData({
                'cityid': cityid,
                'citycode': citycode,
                'cityname': cityname
            }, true);
        }
        /**
         * 获取区县触发器
         * @return {[type]} [description]
         */
        fn._getAreaTrigger = function(){
            var me = this;
            if (me.wAreaTrigger) {
                return me.wAreaTrigger;
            }
            var wWrap = me.getWrap(),
                wAreaTrigger = wWrap.query('.sel-quxian');
            if (!wAreaTrigger.length) {
                // var tpl = W('#ClientAreaTpl').html().trim();
                var tpl = '<div class="area-sel sel-quxian mr-10" style="display:none;"><span class="sel-txt">选择区县</span><span class="icon icon-arrow pngfix"></span><div class="sel-quxian-pannel select-pannel" style="display:none;"><h3>区县列表<span class="close city_close" title="关闭"></span></h3><div class="select-list"></div></div></div>';
                wAreaTrigger = W(tpl);
                me.getWrap().appendChild(wAreaTrigger);
            }

            return me.wAreaTrigger = wAreaTrigger;
        }
        /**
         * 设置区县触发器上边的相关数据
         * @param {[type]} citycode [description]
         * @param {[type]} cityname [description]
         */
        fn._setAreaData = function(areacode, areaname){
            var me = this;

            var wAreaTrigger = me._getAreaTrigger();
            wAreaTrigger.attr('code', areacode);
            wAreaTrigger.query('.sel-txt').html(areaname);

            // 设置data
            me.setData({
                'areacode': areacode,
                'areaname': areaname
            });
        }
        /**
         * 移除区县
         * @return {[type]} [description]
         */
        fn._removeAreaTrigger = function(){
            var me = this;

            var wAreaTrigger = me._getAreaTrigger();

            wAreaTrigger.removeNode();
            delete me.wAreaTrigger;
        }
        /**
         * 获取商圈触发器
         * @return {[type]} [description]
         */
        fn._getQuanTrigger = function(){
            var me = this;
            if (me.wQuanTrigger) {
                return me.wQuanTrigger;
            }
            var wWrap = me.getWrap(),
                wQuanTrigger = wWrap.query('.sel-shangquan');
            if (!wQuanTrigger.length) {
                // var tpl = W('#ClientQuanTpl').html().trim();
                var tpl = '<div class="area-sel sel-shangquan mr-10" style="display:none;"><span class="sel-txt">选择商圈</span><span class="icon icon-arrow pngfix"></span><div class="sel-shangquan-pannel select-pannel" style="display:none;"><h3>商圈列表<span class="close city_close" title="关闭"></span></h3><div class="select-list"></div></div></div>';
                wQuanTrigger = W(tpl);
                me.getWrap().appendChild(wQuanTrigger);
            }

            return me.wQuanTrigger = wQuanTrigger;
        }
        /**
         * 设置商圈触发器上边的相关数据
         * @param {[type]} citycode [description]
         * @param {[type]} cityname [description]
         */
        fn._setQuanData = function(quancode, quanname){
            var me = this;

            var wQuanTrigger = me._getQuanTrigger();
            wQuanTrigger.attr('code', quancode);
            wQuanTrigger.query('.sel-txt').html(quanname);
            // 设置data
            me.setData({
                'quancode': quancode,
                'quanname': quanname
            });
        }
        /**
         * 移除商圈
         * @return {[type]} [description]
         */
        fn._removeQuanTrigger = function(){
            var me = this;

            var wQuanTrigger = me._getQuanTrigger();

            wQuanTrigger.removeNode();
            delete me.wQuanTrigger;
        }
        /**
         * 选择城市
         * @return {[type]} [description]
         */
        fn._selectCity = function(){
            var me = this;

            var wCityTrigger = me._getCityTrigger(),
                cityPanel = new CityPanel(wCityTrigger);

            cityPanel.on('selectCity', function(e) {
                var code = e.city.trim(),
                    name = e.name.trim(),
                    cityid = e.cityid.trim();

                // 设置城市触发器上的属性数据
                me._setCityData(cityid, code, name);

                // 选择城市的时候获取区县
                if (me.options['hasarea']) {
                    me.getArea(code);
                }

                var data = me.data;
                // 选择城市的时候调用此回调
                if(typeof me.options.onCitySelect === 'function'){
                    me.options.onCitySelect(data);
                }
            });
        }
        /**
         * 绑定事件
         * @return {[type]} [description]
         */
        fn.eventBind = function(){
            var me = this;
            var wWrap = me.getWrap();

            // 激活城市选择
            me._selectCity();
            // 外层对象上绑定事件
            wWrap.on('click', function(e){
                var wMe = W(this),
                    target = e.target,
                    wTarget = W(target);

                var wAreaTrigger = me._getAreaTrigger(),
                    wQuanTrigger = me._getQuanTrigger();
                // 激活区县选择
                if (wAreaTrigger.contains(target)||wAreaTrigger[0]===target) {
                    var wPanel = wAreaTrigger.query('.select-pannel');
                    wPanel.fadeIn(100);

                    // 关闭区县选择列表
                    if (wTarget.hasClass('close')) {
                        wPanel.hide();
                    }
                    // 选择区县
                    if (wTarget[0].nodeName.toLowerCase()==='a') {
                        var code = wTarget.attr('code'),
                            name = wTarget.html();
                        if (code) {
                            me._setAreaData(code, name);
                        } else {
                            wAreaTrigger.attr('code', '');
                            wAreaTrigger.query('.sel-txt').html('选择区县');
                            me.deleteData(['areacode', 'areaname']);
                        }

                        wPanel.hide();

                        // 删除商圈data
                        me.deleteData(['quancode', 'quanname']);
                        var data = me.data;
                        // 选择区县的时候获取商圈
                        if(me.options['hasquan']){
                            me.getQuan(data['citycode'], code);
                        }
                        // 选择区县的时候调用此回调
                        if (typeof me.options.onAreaSelect === 'function') {
                            me.options.onAreaSelect(data);
                        }
                    }
                }
                // 激活商圈选择
                else if(wQuanTrigger.contains(target)||wQuanTrigger[0]===target){
                    var wPanel = wQuanTrigger.query('.select-pannel');
                    wPanel.fadeIn(100);

                    // 关闭商圈选择列表
                    if (wTarget.hasClass('close')) {
                        wPanel.hide();
                    }
                    // 选择商圈
                    if (wTarget[0].nodeName.toLowerCase()==='a') {
                        var code = wTarget.attr('code'),
                            name = wTarget.html();
                        if (code) {
                            me._setQuanData(code, name);
                        } else {
                            wQuanTrigger.attr('code', '');
                            wQuanTrigger.query('.sel-txt').html('选择商圈');
                            me.deleteData(['quancode', 'quanname']);
                        }

                        wPanel.hide();

                        var data = me.data;
                        // console.log(data)
                        // 选择商圈的时候调用此回调
                        if (typeof me.options.onQuanSelect === 'function') {
                            me.options.onQuanSelect(data);
                        }
                    }
                }
            });
            // body上的绑定事件，面板失去焦点的时候关闭面板
            W(document.body).on('click', function(e){
                var target = e.target,
                    wTarget = W(target);

                var wAreaTrigger = me._getAreaTrigger();
                if (!(wAreaTrigger.contains(target)||wAreaTrigger[0]===target)) {
                    wAreaTrigger.query('.select-pannel').hide();
                }

                var wQuanTrigger = me._getQuanTrigger();
                if (!(wQuanTrigger.contains(target)||wQuanTrigger[0]===target)) {
                    wQuanTrigger.query('.select-pannel').hide();
                }
            });
        }
        /**
         * 初始化调用
         * @return {[type]} [description]
         */
        fn.init = function(){
            var me = this;

            me.eventBind();

            var data = me.options.data;

            var wCityTrigger = me._getCityTrigger(),
                citycode = data['citycode'] ? data['citycode'] : wCityTrigger.attr('code'),
                cityname = data['cityname'] ? data['cityname'] : wCityTrigger.query('.sel-txt').html();
            me.setData({
                'citycode': citycode,
                'cityname': cityname
            });

            if (me.options['hasarea']) {
                me.getArea(citycode);
            }

            // 区县有初始化数据
            if (data['areacode'] && data['areaname']) {
                me._setAreaData(data['areacode'], data['areaname']);

                if (me.options['hasquan']) {
                    me.getQuan(citycode, data['areacode']);
                }
            }
            // 商圈初始化数据
            if (data['quancode'] && data['quanname']) {
                me._setQuanData(data['quancode'], data['quanname']);
            }

            if(typeof me.options.onInit === 'function'){
                me.options.onInit(me.getData());
            }
        }

    }
    // 初始化
    me.options.autoinit && me.init();
}

bang.AreaSelect = AreaSelect

}());


;/**import from `/resource/js/component/placeholder.js` **/
(function(){

	function PlaceHolder(){

		this.init.apply(this,arguments);
	}

	PlaceHolder.prototype = (function(){

		return {

			init:function(element){

				var instance = this;
				CustEvent.createEvents(this);

				var _placeholder = '';
					this.element = W(element);

				if(instance.element && !("placeholder" in document.createElement("input")) && 
					(_placeholder = instance.element.attr("placeholder"))){

			        var eleLabel = W('<label for="'+this.element.attr('id')+'"></label>').addClass('ele4phtips')[0];
			        
			        //插入创建的label元素节点
			        instance.element.parentNode().insertBefore(eleLabel, instance.element[0]);
			        
			        //方法
			        var funOpacity = function(ele, opacity) {
				            if (ele.style.opacity) {
				                ele.style.opacity = opacity / 100;
				            } else {
				                ele.style.filter = "Alpha(opacity="+ opacity +")";    
				            }
				        }, 
				        opacityLabel = function() {
				            if (!instance.element.val()) {
				                funOpacity(eleLabel, 0);
				                eleLabel.innerHTML = _placeholder;
				            } else {
				                eleLabel.innerHTML = "";    
				            }
				        };
			        
			        instance.element
			        	.on('keyup',function(){
			        		opacityLabel(); 
			        	})
			        	.on('focus',function(){
			        		opacityLabel();
			        	})
			        	.on('blur',function(){
			        		if (!instance.element.val()) {
			                funOpacity(eleLabel, 100);
			                eleLabel.innerHTML = _placeholder;  
			            }
			        	})
			        
			        //样式初始化
			        if (!instance.element.val()) { eleLabel.innerHTML = _placeholder; }

				}

			}
		}

	}());

	QW.provide({'PlaceHolder':PlaceHolder});

}())

;/**import from `/resource/js/component/datetime.js` **/
var DateTime = function(el, config){
	var styleCss = '.ui-datetime{position:absolute;z-index:9000;left:0;top:0;width:260px;background:#fff;border:1px solid #ccc;}.ui-datetime .date-box{border-bottom:1px solid #bbb}.ui-datetime .time-box{}.ui-datetime .date-item,.ui-datetime .time-item{display:inline-block;_zoom:1;padding:5px;border:1px solid #ddd;white-space:nowrap;word-break:keep-all;cursor:pointer; margin:4px;}.ui-datetime .date-curr{border-color:#81C900;background-color:#FAF2DB}.ui-datetime .time-curr{border-color:#81C900;background-color:#FAF2DB}.ui-datetime .date-disabled,.ui-datetime .time-disabled{border-color:#eee;background:#f0f0f0; color:#aaa;cursor:not-allowed;}';

    var _this = this;
	this.box = null;
	this.el = null;
	this.conf = Object.mix({
        remote: '',
        remoteDateTime: [],
		dateList : [ {'text' : (new Date().getMonth()+1) +'-'+ (new Date().getDate()), 'value':(new Date().getMonth()+1) +'-'+ (new Date().getDate())} ],
		timeList : [{'text':'09:00', 'value':'09:00'}, 
					{'text':'10:00', 'value':'10:00'}, 
					{'text':'11:00', 'value':'11:00'}, 
					{'text':'12:00', 'value':'12:00'}, 
					{'text':'13:00', 'value':'13:00'}, 
					{'text':'14:00', 'value':'14:00'}, 
					{'text':'15:00', 'value':'15:00'}, 
					{'text':'16:00', 'value':'16:00'}, 
					{'text':'17:00', 'value':'17:00'}, 
					{'text':'18:00', 'value':'18:00'}],
		onSelect : function(){ }
	}, config, true);

	this.init = function(el, config){
		el = W(el);
		this.el = el;

		if(el.attr('type') != 'text'){
			return;
		}

		Dom.insertCssText(styleCss);

        var _this = this;
        this.__create(function(wBox){

            el.on('focus', function(){
                _this.show();
            });

            W(document.body).on('click', function(e){
                if( e.target != _this.el[0] && e.target != wBox[0] && !wBox.contains(e.target) ){
                    _this.hide();
                }
            });

            // 日期选择
            wBox.delegate('.date-item', 'click', function(){
                var wMe = W(this);
                if (wMe.hasClass('date-disabled')) {
                    return ;
                }

                wMe.addClass('date-curr').siblings('.date-curr').removeClass('date-curr');
                if (_this.conf.remote && _this.conf.remoteTime) {
                    // 远程获取的数据
                    var timelist = _this.conf.remoteTime[wMe.attr('data-value')];

                    wBox.query('.time-box').html( __genTimeHtml(timelist) );
                } else {

                    wBox.query('.time-item').removeClass('time-curr').removeClass('time-disabled');
                }
                var today = DateTime.getDateList(0, 1)[0],
                    now = (new Date().getHours());

                if( wMe.attr('data-value') == today.value ){//如果选的是今天，就要禁止掉已经过期的时间点
                    wBox.query('.time-item').forEach(function(el){
                        var w_this = W(el);
                        if( w_this.attr('data-value').split(':')[0]-0 <= now ){
                            w_this.addClass('time-disabled');
                        }
                    });
                }

            });

            // 时间选择
            wBox.delegate('.time-item', 'click', function(){
                if( W(this).hasClass('time-disabled') ){
                    return false;
                }

                W(this).addClass('time-curr').siblings('.time-curr').removeClass('time-curr');
                if( wBox.one('.date-curr').length>0 ){
                    _this.select();
                }
            });

        });

	}
    // 生成日期选择容器
	this.__create = function(callback){
        var me = this;
        var remote = me.conf.remote;
        if (remote) {

            me.getRemoteDateTime(function(remoteDateTime){
                remoteDateTime = remoteDateTime || [];
                var dateTimeHtml = __genDateTimeHtml(remoteDateTime, me.conf.remoteTime);
                var date_str = dateTimeHtml[0],
                    time_str = dateTimeHtml[1];

                var wBox = W('<div class="ui-datetime"><div class="date-box">'+date_str+'</div><div class="time-box">'+time_str+'</div></div>').appendTo(W('body')).hide();
                me.box = wBox;
                if (typeof callback === 'function') {
                    callback(wBox)
                }
            });

        } else {
            var dstr = '';
            var tstr = '';
            var dlist = me.conf.dateList;
            for(var i=0, n=dlist.length; i<n; i++){
                dstr += '<span class="date-item '+(n===1? 'date-curr' : '')+'" data-value="'+dlist[i].value+'">'+dlist[i].text+'</span>';
            }

            var tlist = me.conf.timeList;
            for(var i=0, n=tlist.length; i<n; i++){
                tstr += '<span class="time-item" data-value="'+tlist[i].value+'">'+tlist[i].text+'</span>';
            }

            var wBox = W('<div class="ui-datetime"><div class="date-box">'+dstr+'</div><div class="time-box">'+tstr+'</div></div>').appendTo(W('body')).hide();
            me.box = wBox;
            if (typeof callback === 'function') {
                callback(wBox)
            }
        }
	}

    // 生成date和time的html
    function __genDateTimeHtml(remoteDateTime, remoteTime) {
        remoteDateTime = remoteDateTime || [];
        var len = remoteDateTime.length;

        var date_str = '',
            time_str = '';
        remoteDateTime.forEach(function(item, i){
            // 日期
            var date = item['date'];
            date_str += '<span class="date-item'+(len===1? ' date-curr' : '')+(date['is_able'] ? '' : ' date-disabled')+'" data-value="'+date['value']+'">'+date['text']+'</span>';

            remoteTime[date['value']] = item['time'];

            if (!i) {
                // 时间
                time_str = __genTimeHtml(item['time']);
            }
        });

        return [date_str, time_str];
    }
    // 产生时间html
    function __genTimeHtml(timelist) {
        var time_html = '';
        if (timelist.length){
            timelist.forEach(function(item, i){
                time_html += '<span class="time-item'+(item['is_able'] ? '' : ' time-disabled')+'" data-value="'+item['value']+'">'+item['text']+'</span>';
            });
        }

        return time_html;
    }
    // 重置远程请求url
    this.resetRemote = function(remote, reset_succ_callback){
        remote = remote || '';

        this.conf.remote = remote;

        this.resetBoxHtml(reset_succ_callback);
    }
    // 重置box内的日期选择
    this.resetBoxHtml = function(reset_succ_callback){
        var me = this;

        me.getRemoteDateTime(function(remoteDateTime){
            remoteDateTime = remoteDateTime || [];
            var dateTimeHtml = __genDateTimeHtml(remoteDateTime, me.conf.remoteTime);
            var date_str = dateTimeHtml[0],
                time_str = dateTimeHtml[1];

            var wBox = me.box;
            if (wBox && wBox.length) {
                wBox.query('.date-box').html(date_str);
                wBox.query('.time-box').html(time_str);

                typeof reset_succ_callback==='function' && reset_succ_callback(wBox, remoteDateTime);
            }

        });
    };
    // 获取远程日期、时间数据
    this.getRemoteDateTime = function(callback) {
        var me = this;
        var remote = me.conf.remote;

        QW.Ajax.get(remote, function(res){
            res = JSON.parse(res);

            if (!res['errno']) {
                me.conf.remoteTime = {};
                me.conf.remoteDateTime = res['result'];

                if (typeof callback === 'function') {

                    callback(me.conf.remoteDateTime);
                }
            } else {
                // @do nothing
            }
        });
    };

	this.select = function(){
		var val = this.box.query('.date-curr').attr('data-value') +' '+ this.box.query('.time-curr').attr('data-value');
		this.el.val( val );
		this.hide();
		if(typeof(this.conf.onSelect)=='function') this.conf.onSelect(val);
	};

	this.show = function(){
		var elRect= this.el.getRect();
        var sugwidth = this.el.attr('data-sugwidth')-0;

		this.box.css({
			'left' : elRect.left,
			'top' : elRect.top + elRect.height-1,
			'width' : sugwidth || elRect.width-2,
            'z-index' : tcb.zIndex ()
		}).show();
	};

	this.hide = function(){
		this.box.hide();
	};

	this.init(el, config);
};

/**
 * 获取日期列表
 * @param  {int} from    从哪天开始，0为今天，1为明天，以此类推。
 * @param  {int} dateNum 要返回的天数
 * @return {[type]}         [description]
 */
DateTime.getDateList = function(from, dateNum){
	var DAY_ARR = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
	from = from || 0;
	dateNum = dateNum || 1;
	var dateArr = [];
	for(var i=0; i<dateNum; i++){
		var nextDay = new Date( new Date().getTime() + 1000*60*60*24*(from+i) );
		var month = nextDay.getMonth() + 1;
		var date = nextDay.getDate(); 
		var day = nextDay.getDay();
		var year = nextDay.getFullYear();
		var dtxt = year + '-' + (month<10 ? ('0'+month) : month)+'-'+( date<10? ('0' + date): date );
		var dayTxt = DAY_ARR[day];
		if( from+i  == 0 ){ 
			dayTxt = '今天';
		}else if(from+i==1){
			dayTxt = '明天';
		}else if(from+i==2){
			dayTxt = '后天';
		}

		dateArr.push(  { 'text': dayTxt+'　'+dtxt, 'value' : dtxt } );
	}

	return dateArr;				
};

;/**import from `/resource/js/component/pager.js` **/
(function() {
	function Pager() {
		this.init.apply(this, arguments);
	};

	Pager.prototype = (function() {
		var getHtml = function(totalPages, currentPage) {
			totalPages = Math.min(99, totalPages);

			currentPage = parseInt(currentPage, 10) || 0;
			currentPage++;

			currentPage = Math.min(Math.max(1, currentPage), totalPages);

			var html = [];
			if(currentPage > 5 && totalPages > 10) {
				html.push('<a data-pn="0" href="#" class="first">首页</a>&nbsp;');
			}

			if(currentPage > 1) {
				html.push('<a data-pn="',currentPage - 2,'" href="#" class="pre">&#171;上一页</span></a>&nbsp;');
			}

			var min, max;
			if(currentPage > 5) {
				min = currentPage - 4;
				if(currentPage > totalPages - 5) {
					min = totalPages - 9;
				}
			} else {
				min = 1;
			}

			max = min + 9;
			min = Math.max(min, 1);
			max = Math.min(max, totalPages);


			for(var i = min; i <= max; i++) {
				if(i == currentPage) {
					html.push('<span>', i ,'</span>&nbsp;');
				} else {
					html.push('<a data-pn="', i - 1, '" href="#">', i, '</a>&nbsp;');
				}
			}

			if(currentPage < totalPages) {
				html.push('<a data-pn="', currentPage ,'" href="#" class="next">下一页&#187;</a>&nbsp;');
			}

			if(currentPage < totalPages - 5 && currentPage > 10) {
				html.push('<a data-pn="',totalPages - 1,'" href="#" class="last">尾页</a>');
			}

		    return html.join("");
		}; 

		return {
			init : function(el, totalPages, currentPage) {
				var instance = this;

				CustEvent.createEvents(this);

				W(el).undelegate('a', 'click');

				W(el).html(getHtml(totalPages, currentPage))
					.delegate('a', 'click', function(e) {
						e.preventDefault();
						var pn = this.getAttribute('data-pn') || 0;
						setTimeout(function(){W(el).html(getHtml(totalPages, pn));},50);  //some error while happen if no settimeout

						instance.fire('pageChange', {'pn' : pn-0});
					});
			}
		}
	})();

	QW.provide({'Pager' : Pager});
})();

;/**import from `/resource/js/component/countdown.js` **/
// 倒计时
(function(){
    var Bang = window.Bang = window.Bang || {};

    Bang.countdown_desc = '剩余';
    Bang.startCountdown = startCountdown;

    /**
     * 拍卖倒计时（开始或者结束）
     * @param targettime 倒计时结束的目标时间（时间戳）
     * @param curtime 当前时间（时间戳）（会随着倒计时变化）
     * @param $target
     */
    function startCountdown(targettime, curtime, $target, callbacks){
        if(!targettime || !curtime || curtime>targettime){
            return ;
        }
        callbacks = callbacks || {};

        var duration = Math.floor( (targettime - curtime)/1000 ),// 时间间隔，精确到秒，用来计算倒计时
            client_duration = getClientDuration(targettime); // 当前客户端和结束时间的时间差（用来作为参考点修正倒计时误差）

        var fn_countdown = W('#JsCountdownTpl').html().trim().tmpl();

        // 倒计时ing
        typeof callbacks.start === 'function' && callbacks.start();

        function countdown(){
            if ( !($target&&$target.length) ) {
                return false
            }
            var d = Math.floor(duration/86400), // 天
                h = Math.floor((duration-d*86400)/3600), // 小时
                m = Math.floor((duration-d*86400-h*3600)/60), // 分钟
                s = duration - d*86400 - h*3600 - m*60; // 秒

            var desc_before = $target.attr('data-descbefore')||Bang.countdown_desc||'', // 前置文字说明
                desc_behind = $target.attr('data-descbehind')||'', // 后置文字说明
                day_txt    = $target.attr('data-daytxt') || '天 ',
                hour_txt   = $target.attr('data-hourtxt') || ':',
                minute_txt = $target.attr('data-minutetxt') || ':',
                second_txt = $target.attr('data-secondtxt') || '',
                hour_mode = !!$target.attr('data-hour-mode') // 小时模式

            if (hour_mode) {
                h = d * 24 + h
                d = 0
            }

            var html_str = fn_countdown({
                'day': d,
                'day_txt': day_txt,
                'hour': fix2Length(h),
                'hour_txt': hour_txt,
                'minute': fix2Length(m),
                'minute_txt': minute_txt,
                'second': fix2Length(s),
                'second_txt': second_txt,
                'desc_before': desc_before,
                'desc_behind': desc_behind
            });
            $target.html(html_str);

            // 倒计时ing
            typeof callbacks.process === 'function' && callbacks.process(curtime);

            duration = duration - 1;
            client_duration = client_duration - 1000;
            curtime = curtime - 1000;

            //duration = duration<1 ? 0 : duration;
            return true;
        }
        countdown();
        setTimeout(function(){
            var flag = countdown();
            if (!flag) {
                return ;
            }
            if(duration>-1){
                var next_time = getClientDuration(targettime) - client_duration;
                if (next_time<0) {
                    next_time = 0;
                }
                setTimeout(arguments.callee, next_time);
            } else {
                // 倒计时结束
                typeof callbacks.end === 'function' && callbacks.end();
            }
        }, 1000);
    }
    /**
     * 修复为2个字符长度，长度不足以前置0补齐;
     * @return {[type]} [description]
     */
    function fix2Length(str){
        str = str.toString();
        return str.length < 2 ? '0' + str : str;
    }
    /**
     * 获取当前客户端时间相对结束时间的时间间隔（精确到毫秒）
     * @returns {*|number}
     */
    function getClientDuration(targettime){
        return targettime - (new Date()).getTime();
    }

}());

;/**import from `/resource/js/component/tuiguang_slide.js` **/
!function(){
    var Bang = window.Bang = window.Bang || {};

    Bang.TuiguangSlide = TuiguangSlide

    /**
     * 推广slide类
     * 使用 new TuiguangSlide('.slide-box');
     * @param {selector} box  [description]
     * @param {[type]} conf [description]
     */
    function TuiguangSlide(box, conf){
        var me = this;

        this.meBox = W(box);
        // 找不到需要处理的容器，直接返回
        if(!this.meBox.length){
            return ;
        }
        this.config = conf || {};
        this.btnPrev = this.meBox.query('.slide-go-left');
        this.btnNext = this.meBox.query('.slide-go-right');
        this.innerBox = this.meBox.query('.slide-inner');
        this.items = this.meBox.query('.slide-item');
        this.listBox = this.meBox.query('.slide-list');
        this.itemNum = this.meBox.query('.slide-item').length;
        this.ctrlBox = this.meBox.query('.slide-ctrl');
        this.innerBoxWidth = this.innerBox.getRect().width;

        this.autoRunTimer = null;

        this.init = function(){
            var me = this;

            var wItems = me.items;
            if (wItems && wItems.length) {
                me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

                me.listBox.css({'width' : me.itemWidth * wItems.length});

                if(me.config.showCtrl){ me.createCtrl(); }

                if(me.config.autoRun){ me.autoRun( ); }
            }

            this.bindEvent();
        };
        this.resetBoxSize = function(){
            var me = this;
            me.items = me.meBox.query('.slide-item');
            var wItems = me.items;

            if (wItems && wItems.length) {
                me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

                me.listBox.css({'width' : me.itemWidth * wItems.length});

                if(me.config.showCtrl){ me.createCtrl(); }

                if(me.config.autoRun){ me.autoRun( ); }
            }

        };
        this.bindEvent = function(){

            var me = this;
            var config = this.config;

            me.btnPrev.on('click', function(e){
                e.preventDefault();
                var wMe = W(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft - me.innerBoxWidth }, config.animTime||300, function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                }, QW.Easing.easeOut);
            });
            me.btnNext.on('click', function(e){
                e.preventDefault();
                var wMe = W(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft + me.innerBoxWidth }, config.animTime||300, function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                }, QW.Easing.easeOut);
            });

            me.meBox.delegate('.ctrl-item', 'click', function(e) {
                e.preventDefault();
                W(this).addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                var sn = W(this).attr('data-sn') || 0;
                me.go(sn);
            });

            me.meBox.on('mouseenter', function(e){

                clearInterval(me.autoRunTimer);
            });
            me.meBox.on('mouseleave', function(e){
                if(config.autoRun){ me.autoRun(); }
            });
        };

        this.go = function(step){
            var config = this.config;
            step = step || 0;
            this.innerBox.animate({'scrollLeft' : 0 + this.innerBoxWidth*step }, config.animTime||300, function(){}, QW.Easing.easeOut);
        };

        this.autoRun = function(){
            var me = this;
            var config = this.config;

            me.autoRunTimer = setInterval(function(){
                var currSn = me.meBox.query('.ctrl-curr').attr('data-sn')|| 0,
                    nextSn = currSn - 0 + 1;
                if( nextSn > me.itemNum-1 ){
                    nextSn = 0;
                }
                me.meBox.query('.ctrl-item[data-sn="'+nextSn+'"]').addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                me.go(nextSn);
            }, typeof(config.autoRun)=='number'? config.autoRun : 5000);
        };

        this.createCtrl = function(e){

            if(this.ctrlBox.query('.ctrl-item').length||this.items.length<2){
                return ;
            }

            str = '';
            for(var i=0, n=this.items.length; i<n; i++){
                str += '<span class="ctrl-item '+(i==0?'ctrl-curr':'')+'" data-sn="'+i+'"></span>';
            }
            this.ctrlBox.html(str);
        };

        this.init();
    }
}()


;/**import from `/resource/js/component/block_promoting/block_promoting_lp_flash_product_list.js` **/
Dom.ready(function(){
    var wBlock=  W('.block-promoting-lp-flash-product-list')
    if (!(wBlock&& wBlock.length)){
        return
    }

    var HotProductListSlide = new window.Bang.TuiguangSlide(wBlock.query('.tg-small'), { animTime : 500 })

    // 输出商品
    function renderHotProductList(){

        var wListInner = wBlock.query('#HotProductList')
        if(wListInner && wListInner.length){

            getData4HotProductList(function(result){

                var list_arr;
                var curtime = result['time'],
                    flash_list   = result['flash_list'],   // 闪购
                    jingpin_list = result['jingpin_list']; // 精品

                if ( !(flash_list && jingpin_list && flash_list.length + jingpin_list.length>3) ){
                    // 限时抢 和 精品商品总数不大于3个，那么左右滑动按钮不可点

                    var
                        $Wrap = wListInner.ancestorNode('.tg-small')
                    $Wrap.query('.slide-go-left').addClass('disabled')
                    $Wrap.query('.slide-go-right').addClass('disabled')
                }

                // 闪购
                if(flash_list && flash_list.length) {
                    _forHotFlash(flash_list, curtime, wListInner);
                    if(flash_list.length<4 && jingpin_list && jingpin_list.length){
                        _forHotJingpin(jingpin_list, wListInner, true);
                    }
                }
                // 精品
                else if (jingpin_list && jingpin_list.length) {
                    _forHotJingpin(jingpin_list, wListInner);
                }

            });

        }
    }
    // 精品
    function _forHotJingpin(jingpin_list, wListInner, flag){
        var list_arr = jingpin_list;

        var html_str = W('#JsHotProductListTpl').html().trim().tmpl()({
            'list': list_arr
        });

        if(flag){
            wListInner.insertAdjacentHTML('beforeend', html_str);
        } else {
            wListInner.html(html_str);
        }

        HotProductListSlide.resetBoxSize()
    }
    // 限时抢
    function _forHotFlash(flash_list, curtime, wListInner){
        var list_arr = flash_list;
        var html_str = W('#JsFlashProductListTpl').html().trim().tmpl()({
            'list': list_arr
        });

        wListInner.html(html_str);

        HotProductListSlide.resetBoxSize();

        // 服务器当前时间(精确到毫秒)
        curtime = Date.parse(curtime.replace(/-/g, '/')) || (new Date()).getTime();
        // 遍历倒计时
        wListInner.query('.countdown').forEach(function(el, i){
            var wEl = W(el),
                curproduct = list_arr[i], // 和当前计时器对应的商品信息
                starttime = curproduct['flash_start_time'].replace(/-/g, '/'),//'2015-11-09 18:00:40',//
                endtime   = curproduct['flash_end_time'].replace(/-/g, '/');//'2015-11-09 16:22:40';//
            starttime = Date.parse(starttime) || 0;
            endtime   = Date.parse(endtime) || 0;
            var $skill = $(el).parent().find(".seckill");

            // 开始前倒计时
            if (!curproduct['flash_saling'] && curtime<starttime) {
                wEl.addClass('countdown-start-prev')
                    .attr('data-descbefore', '距开始')

                Bang.startCountdown(starttime, curtime, wEl, {
                    'end': function(){
                        wEl.ancestorNode('.slide-item').query('.p-buy-disabled').removeClass('p-buy-disabled').html('立即抢购');

                        wEl.removeClass('countdown-start-prev')
                            .attr('data-descbefore', ' ')
                        Bang.startCountdown(endtime, starttime, wEl, {
                            'end': function(){
                                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                                wEl.html('已售出').addClass('countdown-end-next');
                                $skill.hide();
                            }
                        });
                    }
                });

            }
            // 抢购进行中&商品未被拍下
            else if (curproduct['flash_saling']==1 && curproduct['flash_status']=='saling' && curtime<endtime) {

                wEl.removeClass('countdown-start-prev')
                    .attr('data-descbefore', ' ')
                Bang.startCountdown(endtime, curtime, wEl, {
                    'end': function(){
                        wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');
                        wEl.html('已售出').addClass('countdown-end-next');
                        $skill.hide();
                    }
                });

            }
            else {
                wEl.ancestorNode('.slide-item').query('.p-buy').addClass('p-buy-disabled').html('已售出');

                wEl.html('已售出').addClass('countdown-end-next');
                $skill.hide();
            }

        })
    }
    // 获取商品数据
    function getData4HotProductList(callback){
        var request_url = '/youpin/doGetFlashSaleGoods',
            request_params = {};
        QW.Ajax.get(request_url, request_params, function(res){
            var result = [];
            res = JSON.parse(res);
            if (!res['errno']) {
                result = res['result'];
            }

            typeof callback==='function' && callback(result);
        })
    }
    renderHotProductList();

    tcb.bindEvent(wBlock[0], {
        // 秒杀商品
        '#HotProductList .slide-item': {
            'click': function (e) {
                var wMe = W(this),
                    wTarget = W(e.target);

                if (!(wTarget.ancestorNode('a').length || wTarget[0].nodeName.toLowerCase() == 'a')) {
                    wMe.query('.slide-img a').click();
                }
            },
            'mouseenter': function (e) {
                var
                    wMe = W(this)

                wMe.addClass('slide-item-hover')

            },
            'mouseleave': function (e) {
                var
                    wMe = W(this)

                wMe.removeClass('slide-item-hover')

            }
        },
        // 商品列表
        '.product-list .p-item': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('p-item-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.removeClass('p-item-hover');
            }
        }
    })
})

;/**import from `/resource/js/component/block_promoting/block_promoting_lp_hot_notice_faker.js` **/
Dom.ready(function(){
    var wBlock=  W('.block-promoting-lp-hot-notice-faker')
    if (!(wBlock&& wBlock.length)){
        return
    }

    wBlock.show()

    var wInner = wBlock.query('.block-promoting-lp-hot-notice-faker-inner')

    function __show(){
        wInner.animate({
            'top': '-340px'
        }, 500)
    }

    function __close(){
        wInner.animate({
            'top': '0'
        }, 500, function(){

            wBlock.removeNode()
        })
    }

    __show()

    tcb.bindEvent(wBlock[0], {
        '.btn-close': function(e){
            e.preventDefault()

            __close()
        },
        '.item-figure': {
            'mouseenter': function(e){
                var wMe = W(this)

                wMe.css({
                    'background-size': '120%'
                })
            },
            'mouseleave': function(e){
                var wMe = W(this)

                wMe.css({
                    'background-size': '100%'
                })
            }
        }
    })

})

;/**import from `/resource/js/include/shop_list.js` **/
// 商家列表信息
(function(){
    var Bang = window.Bang = window.Bang || {};

    /**
     * 获取商家列表数据
     *
     * @param callback 获取到商家数据后的回调函数
     */
    function getShopListData(callback){
        var me = this;

        var	param = me.getFilterParams();

        var key = Object.encodeURIJson(param),
            ListData = me._Cache[key];

        if(ListData){

            if (typeof callback === 'function') {

                callback(ListData);
            }
        }
        else{
            var request_url = '/at/shop?'+ key;
            QW.Ajax.get(request_url, function(res){
                res = res.evalExp();

                if (!parseInt(res['errno'], 10) && res['shop_data'] && res['shop_data'].length) {
                    res['shop_data'].forEach(function(el){
                        if (el['shop_ico'].indexOf('pinpailogo')==-1) {
                            el['shop_ico'] = tcb.imgThumbUrl(el['shop_ico'], 140, 140);
                        }
                    });

                    ListData = res;

                    me.setCache(key, ListData);
                }

                if (typeof callback === 'function') {

                    callback(ListData);
                }

            });
        }

    }
    /**
     * 输出商家列表
     *
     * @param reset_pn 是否重置pn参数，true：重置；false：不重置；
     */
    function renderShopList(reset_pn){
        var me = this;

        // 重置pn参数为0
        if (reset_pn) {
            me.setFilterParams('pn', 0);
        }

        var	html = '';

        // 获取商家列表数据，输出商家列表
        me.getShopListData(function(ListData){

            if (ListData) {
                // 店铺列表htm
                html = _getShopListHtml(ListData, me.options['tpl']['shop_list']);
            } else {
                html = '<div class="no-data-merrepair">抱歉，暂时没有找到符合您要求的店铺</div>';
            }

            if (html === null) {
                return ;
            }

            me.wList.html(html);

            if (typeof me.options['onAfter']==='function') {

                me.options['onAfter'](me);
            }

            // 输出分页
            me.renderShopListPager(function(pn){

                me.setFilterParams('pn', pn);

                me.renderShopList();
            });

        });

    }
    /**
     * 输出商家列表分页
     * @param callback
     */
    function renderShopListPager(wPageNav, callback, flag_ignore_pn){
        var me = this;

        if (typeof wPageNav==='function') {
            callback = wPageNav;
            wPageNav = null;
        }
        wPageNav = wPageNav || me.wPageNav;

        if (!wPageNav.length) {
            return ;
        }

        var filter_params = me.getFilterParams(),
            pn = parseInt(filter_params['pn'], 10);
        if (!flag_ignore_pn && pn) {
            return;
        }

        var cache_key = Object.encodeURIJson(filter_params),
            list_data = me.getCache(cache_key);
        if (!list_data) {
            return ;
        }

        var total_page = Math.ceil(list_data['page_count']/filter_params['pagesize']);

        var wPages = wPageNav.query('.pages');
        if (total_page==1) {
            wPages.hide().html('');

            return;
        }

        wPages.show();

        var pager = new Pager(wPages, total_page, pn);

        pager.on('pageChange', function(e) {
            callback = callback || noop;

            typeof callback === 'function' && callback(e.pn);
        });
    }

    // 设置cache
    function setCache(key, val){
        var me = this;

        if (key) {
            me._Cache[key] = val;
        }
    }
    // 获取cache
    function getCache(key){
        var me = this;

        if (key) {
            return me._Cache[key];
        } else {
            return me._Cache;
        }
    }
    // 获取商家列表html
    function _getShopListHtml(ListData, tpl_id) {
        var html = null;
        var _data = ListData;
        _data['shop_data'].forEach(function(el){
            if (el['shop_ico'].indexOf('pinpailogo')==-1) {
                el['shop_ico'] = tcb.imgThumbUrl(el['shop_ico'], 140, 140);
            }
        });

        var wShopListTpl = W(tpl_id || '');
        if (wShopListTpl && wShopListTpl.length) {
            var func = wShopListTpl.html().trim().tmpl();

            html = func(_data);
        }

        return html;
    }
    // 获得商家进行过滤的参数
    function getFilterParams(key){
        var me = this;

        var FilterParams = me.FilterParams || {};

        if (key) {
            return FilterParams[key];
        }

        return FilterParams;
    }
    // 设置商家过滤参数
    function setFilterParams(key, val) {
        var me = this;

        me.FilterParams = me.FilterParams || {};

        me.FilterParams[key] = val;
    }

    /**
     * 显示商家列表地图模式
     * @param pagechange_flag 地图翻页表示，true表示翻页，false表示第一次打开不翻页
     */
    function showMap(pagechange_flag){
        var me = this;

        var map_panel_id = "panel-modeMapindex";

        var mapObj = me.createBigMap(map_panel_id, pagechange_flag);

        // 获取商家列表数据，输出商家列表
        me.getShopListData(function(ListData) {
            if (!ListData){
                return;
            }
            var ShopListArr = ListData['shop_data'] || [];
            ShopListArr.forEach(function(item, i){
                if( !item.map_longitude || !item.map_latitude){
                    return false;
                }
                // 为每个商家店铺地址创建一个地图标识点图标
                var marker = new AMap.Marker({
                    id: "MapMarker"+i,
                    position: new AMap.LngLat(item.map_longitude, item.map_latitude),
                    icon: {stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
                    offset: {x:-13,y:-36}
                });
                marker.setMap(mapObj);

                var infoWindow = new AMap.InfoWindow({
                    isCustom: true,
                    autoMove: true,
                    offset: new AMap.Pixel(72,-245),
                    content:W('#JsShopListMapModeShopCardTpl').html().tmpl({
                        shop_name: item.shop_name,
                        addr: item.addr_detail,
                        service_tags: item.main.subByte(40, '...'), //item.service_tags.subByte(40,'...'),
                        qid: item.qid,
                        shop_addr: item.shop_addr,
                        online_txt: item.is_online == "on" ? "立即咨询" : "离线留言"
                    }),
                    size: new AMap.Size(349, 166) // isCustom为true，此参数被忽略
                });
                AMap.event.addListener(marker, "click", function(){
                    // 打点记录
                    //try{ tcbMonitor.__log({cid:'map-marker-click',ch:''}); }catch(ex){}

                    // 打开商家店铺卡片的小窗口
                    infoWindow.open(mapObj, marker.getPosition());
                });

                if(i == 0){
                    //infoWindow.open(map, marker.getPosition());
                    // 设置第一个商家位置为中心点
                    mapObj.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude));
                }
            });

            // 输出分页
            me.renderShopListPager(W('#'+map_panel_id), function(pn){

                me.setFilterParams('pn', pn);

                me.showMap(true);
            }, true);

        });

    }
    /**
     * 创建大地图
     * @returns {AMap.Map|*}
     * @private
     */
    function createBigMap(map_panel_id, pagechange_flag){
        var me = this;

        // 大地图弹窗容器id
        map_panel_id = map_panel_id || "panel-modeMapindex";

        // 地图翻页，直接清空所有覆盖物，返回地图对象
        if(pagechange_flag){
            if (me.Map && me.Map.clearMap) {

                me.Map.clearMap();
            }
            return me.Map;
        }

        // 非翻页，首次打开地图面板
        var panel_conf = {
            //'width':688,
            'className': 'panel panel-tom01 map-container-wrap',
            'btn_name': '关闭',
            'wrapId': map_panel_id
        };
        // 打开地图窗口时候备份当前的页码pn，在关闭地图时候重新恢复此pn
        var pn_bak = me.getFilterParams('pn');
        var cont_str = W("#JsShopListMapModeTpl").html().trim().tmpl()();
        var panel = tcb.alert("地图模式", cont_str, panel_conf, function(){
            if (me.Map && me.Map.destroy) {

                me.Map.destroy();
            }
            me.Map = null;

            me.MapPanel = null;

            me.setFilterParams('pn', pn_bak);
            return true;
        });

        // 初始化赋值地图
        me.Map = new AMap.Map("mode_map_container", {
            "view": new AMap.View2D({//创建地图二维视口
                zoom:11,
                rotation:0
            })
        });
        // 添加地图控件
        me.Map.plugin(["AMap.ToolBar","AMap.OverView","AMap.Scale"], function(){
            var overview = new AMap.OverView();
            me.Map.addControl(overview);

            var toolbar = new AMap.ToolBar(-100,0);
            toolbar.autoPosition=false;
            me.Map.addControl(toolbar);

            var scale = new AMap.Scale();
            me.Map.addControl(scale);
        });

        // 绑定地图面板上的相关事件
        var wMapPanel = W('#'+map_panel_id);
        tcb.bindEvent(wMapPanel, {
            // 关闭地图面板
            '.close': function(e){
                try{
                    e.preventDefault();

                    // 关闭商家卡片
                    me.Map.clearInfoWindow();

                    me.Map.destroy();
                    me.Map = null;
                }catch(e){}
            },
            // 关闭商家卡片
            '.shop-card-close': function(e){
                e.preventDefault();

                try{
                    // 关闭商家卡片
                    me.Map.clearInfoWindow();
                } catch(ex){}
            },
            //点击在线聊天时关闭弹出层
            '.qim-go-talk': function(e){
                try{
                    panel.hide();

                    // 关闭商家卡片
                    me.Map.clearInfoWindow();

                    me.Map.destroy();
                    me.Map = null;
                } catch (ex){}
            }
        });

        return me.Map;
    }

    // 绑定事件
    function eventBind(){
        var me = this;

        tcb.bindEvent(me.wWrap[0], {
            // 排序
            '.sort-type li a': function(e){
                e.preventDefault();

                var wMe = W(this);

                wMe.ancestorNode('li').addClass('active').siblings('.active').removeClass('active');

                me.setFilterParams('type_id', wMe.attr('data-type'));

                me.renderShopList(true);
            },
            // 筛选
            '.filter-check .chkbox': function(e){
                var wMe = W(this);
                
                var k = wMe.attr('name');

                if (wMe.attr('checked')) {
                    // 保证金
                    if (k==='is_bzj'){
                        me.setFilterParams(k, '1');
                    } else {
                        me.setFilterParams(k, 'on');
                    }
                } else {
                    if (k==='is_bzj'){
                        me.setFilterParams(k, '0');
                    } else {
                        me.setFilterParams(k, 'off');
                    }
                }

                me.renderShopList(true);
            },
            // 显示商家列表地图模式
            '.btn-mode-map': function(e){
                e.preventDefault();

                me.showMap();
            }
        });
    }
    // 空function
    function noop(){}

    // 商家列表相关js
    Bang.ShopList = function(options) {
        var defaults = {
            // 选择器
            'selector': {
                'wrap' : '.shop-list-wrap',
                'extend_filter_wrap' : '' //.shop-list-extend-filter // 默认无扩展过滤条件
            },
            // 模板
            'tpl': {
                'shop_list' : '#JsShopListTpl'
            },
            // 商家列表默认的请求参数
            'data': {},
            // 输出商家列表前
            'onBefore': noop,
            // 输出商家列表后
            'onAfter': noop
        };
        options = options || {};
        options = QW.ObjectH.mix(defaults, options, true);

        var me = this;

        // 商家列表筛选参数
        me.FilterParams = {
            'city_id': options['data']['city_id'] || '', // 城市id
            'area_id': options['data']['area_id'] || '', // 区县id
            'quan_id': options['data']['quan_id'] || '', // 商圈id
            'service_id': options['data']['service_id'] || '', // 服务id
            'type_id': options['data']['type_id'] || '',  // 排序规则，空为默认排序，1：成交量排序，2：好评排序；3：按人气排序
            'online': options['data']['online'] || 'on', // 是否在线
            'cuxiao': options['data']['cuxiao'] || 'off',// 是否促销
            'is_bzj': options['data']['is_bzj'] || '0', // 是否“先行赔付”，0：不是，1：是
            'tag': options['data']['tag'] || '',
            'pagesize': options['data']['pagesize'] || 15, // 每页数量
            'pn'  : options['data']['pn'] || 0, // 当前分页
            'lng' : options['data']['lng'] || '', // 经度
            'lat' : options['data']['lat'] || ''  // 纬度
        };
        // 数据cache
        me._Cache = {};
        // 配置项
        me.options = options;
        // 用于回调中的参数
        me.data = {};

        var fn = Bang.ShopList.prototype;

        if (typeof fn.eventBind === 'undefined') {

            // 绑定事件
            fn.eventBind = eventBind;

            // 获取商家列表数据
            fn.getShopListData = getShopListData;
            // 输出商家列表
            fn.renderShopList  = renderShopList;
            // 输出分页
            fn.renderShopListPager = renderShopListPager;
            // 获得商家进行过滤的参数
            fn.getFilterParams = getFilterParams;
            // 设置商家过滤参数
            fn.setFilterParams = setFilterParams;

            // 显示大地图，展示商家地图位置
            fn.showMap = showMap;

            fn.createBigMap = createBigMap;

            // 设置、获取cache内容
            fn.setCache = setCache;
            fn.getCache = getCache;
        }

        function init() {
            var wWrap = me.wWrap = W(me.options['selector']['wrap']);

            // 商家列表
            me.wList = wWrap.query(me.options['selector']['list'] || '.shop-list');

            // 排序
            me.wSort = wWrap.query('.sort-type a');
            // 过滤
            me.wFilter = wWrap.query('.filter-check [type="checkbox"]');


            // 地图模式
            me.wMapMode = wWrap.query('.btn-mode-map');
            // 地图对象
            me.Map = null;

            // 分页
            me.wPageNav = wWrap.query('.shop-list-pagination');


            // 过滤（扩展）
            me.wFilterExtend = W(me.options['selector']['extend_filter_wrap']);

            //绑定事件
            me.eventBind();
        }
        init();
    };
}());

;/**import from `/resource/js/page/shangmen/inc/common.js` **/
// 公共功能
;(function(){

    window.Shangmen = window.Shangmen || {};

    QW.ObjectH.mix(window.Shangmen, {

        // 首页滑动
        IndexPicSlider : (function(){

            var picCombs ,
                itemWidth,
                unitNum,
                picCombShowNum = 0,
                animTime = 500,
                animTimer = null;

            function runPicAnim(){
                var nowPic = picCombShowNum % picCombs.length;

                W('.btn-list li').removeClass('cur');
                W('.slide-box').animate({'scrollLeft' : nowPic * itemWidth}, animTime, function(){
                    W('.btn-list li').item(nowPic).addClass('cur');
                }, QW.Easing.easeBoth);
            }


            function start( stop ){
                picCombShowNum = window.location.href.queryUrl("start") || 0;

                picCombs = W('.section-0 .top-pic');
                unitNum = picCombs.length;

                _setCombSize();

                W('.btn-list li').on('click', function(){
                    picCombShowNum=W(this).attr('data-sn')-0;

                    clearInterval(animTimer);

                    runPicAnim();

                    if(!stop) {

                        animTimer = setInterval(function () {
                            picCombShowNum++;
                            runPicAnim()
                        }, 5000);
                    }
                });

                //启动
                picCombs.show();
                W('.slide-box')[0].scrollLeft = picCombShowNum * itemWidth;
                if(!stop){
                    animTimer = setInterval(function(){ picCombShowNum ++; runPicAnim()}, 5000);
                }


                /*W('.section-0').on('mouseenter', function(){
                 clearInterval(animTimer);
                 });
                 W('.section-0').on('mouseleave', function(){
                 animTimer = setInterval(function(){ picCombShowNum ++; runPicAnim()}, 5000);
                 });*/

                W(window).on('resize', function(){
                    _setCombSize();
                    runPicAnim();
                });

                function _setCombSize(){
                    itemWidth = W('.slide-box').getSize().width;
                    W('.slide-box .slide-list').css('width',  itemWidth * unitNum);
                    picCombs.css('width', itemWidth);
                }
            }

            return{
                start : start,
                runPicAnim : runPicAnim
            };

        })()



    })


    // 验证表单是否可提交
    function isFormDisabled($form){
        var flag = false;

        if(!$form.length){
            return true;
        }
        if( $form.hasClass('form-disabled') ){
            flag = true;
        }

        return flag;
    }
    tcb.isFormDisabled = tcb.isFormDisabled || isFormDisabled;

    // 设置表单不可提交
    function setFormDisabled($form){
        if(!$form.length){
            return ;
        }
        $form.addClass('form-disabled');
    }
    tcb.setFormDisabled = tcb.setFormDisabled || setFormDisabled;

    // 设置表单可提交
    function releaseFormDisabled($form){
        if(!$form.length){
            return ;
        }
        $form.removeClass('form-disabled');
    }
    tcb.releaseFormDisabled = tcb.releaseFormDisabled || releaseFormDisabled;

}())

Dom.ready(function(){
    var
        Shangmen = window.Shangmen;

    // 上门首页滑动
    if( W('.slide-box').length > 0 ) {
        Shangmen.IndexPicSlider.start(window.location.href.queryUrl('stop') == 'true');
    }

    $('.wx-img-show .slide-go-left').on('click', function(e){
        $('.wx-img-show .tit').html('邮寄维修很安心');
    });

    $('.wx-img-show .slide-go-right').on('click', function(e){
        $('.wx-img-show .tit').html('上门维修很快捷');
    });

    new TuiguangSlide('.wx-img-show .slide-wrap', { animTime : 500 });

    /**
     * 推广slide类
     * 使用 new TuiguangSlide('.slide-box');
     * @param {selector} box  [description]
     * @param {[type]} conf [description]
     */
    function TuiguangSlide(box, conf){
        var me = this;

        this.meBox = W(box);
        // 找不到需要处理的容器，直接返回
        if(!this.meBox.length){
            return ;
        }
        this.config = conf || {};
        this.btnPrev = this.meBox.query('.slide-go-left');
        this.btnNext = this.meBox.query('.slide-go-right');
        this.innerBox = this.meBox.query('.slide-inner');
        this.items = this.meBox.query('.slide-item');
        this.listBox = this.meBox.query('.slide-list');
        this.itemNum = this.meBox.query('.slide-item').length;
        this.ctrlBox = this.meBox.query('.slide-ctrl');
        this.innerBoxWidth = this.innerBox.getRect().width;

        this.autoRunTimer = null;

        this.init = function(){
            var me = this;

            var wItems = me.items;
            if (wItems && wItems.length) {
                me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

                me.listBox.css({'width' : me.itemWidth * wItems.length});

                if(me.config.showCtrl){ me.creatCtrl(); }

                if(me.config.autoRun){ me.autoRun( ); }
            }

            this.bindEvent();
        };
        this.resetBoxSize = function(){
            var me = this;
            me.items = me.meBox.query('.slide-item');
            var wItems = me.items;

            if (wItems && wItems.length) {
                me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

                me.listBox.css({'width' : me.itemWidth * wItems.length});

                if(me.config.showCtrl){ me.creatCtrl(); }

                if(me.config.autoRun){ me.autoRun( ); }
            }

        };
        this.bindEvent = function(){

            var me = this;
            var config = this.config;

            me.btnPrev.on('click', function(e){
                e.preventDefault();
                var wMe = W(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft - me.innerBoxWidth }, config.animTime||300, function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                }, QW.Easing.easeOut);
            });
            me.btnNext.on('click', function(e){
                e.preventDefault();
                var wMe = W(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft + me.innerBoxWidth }, config.animTime||300, function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                }, QW.Easing.easeOut);
            });

            me.meBox.delegate('.ctrl-item', 'click', function(e) {
                e.preventDefault();
                W(this).addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                var sn = W(this).attr('data-sn') || 0;
                me.go(sn);
            });

            me.meBox.on('mouseenter', function(e){

                clearInterval(me.autoRunTimer);
            });
            me.meBox.on('mouseleave', function(e){
                if(config.autoRun){ me.autoRun(); }
            });
        };

        this.go = function(step){
            var config = this.config;
            step = step || 0;
            this.innerBox.animate({'scrollLeft' : 0 + this.innerBoxWidth*step }, config.animTime||300, function(){}, QW.Easing.easeOut);
        };

        this.autoRun = function(){
            var me = this;
            var config = this.config;

            me.autoRunTimer = setInterval(function(){
                var currSn = me.meBox.query('.ctrl-curr').attr('data-sn')||0;
                nextSn = currSn - 0 + 1;
                if( nextSn > me.itemNum-1 ){
                    nextSn = 0;
                }
                me.meBox.query('.ctrl-item[data-sn="'+nextSn+'"]').addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                me.go(nextSn);
            }, typeof(config.autoRun)=='number'? config.autoRun : 5000);
        };

        this.creatCtrl = function(e){

            if(this.ctrlBox.query('.ctrl-item').length||this.items.length<2){
                return ;
            }

            str = '';
            for(var i=0, n=this.items.length; i<n; i++){
                str += '<span class="ctrl-item '+(i==0?'ctrl-curr':'')+'" data-sn="'+i+'"></span>';
            }
            this.ctrlBox.html(str);
        };

        this.init();
    }

})


;/**import from `/resource/js/page/shangmen/inc/yuyue_kuaidi_panel.js` **/
// 预约快递面板
(function(){



    // 获取果果相关信息
    function getGuoGuoForm (order_id, redirect_url, callback) {
        if (!order_id) {
            return alert ('订单号不能为空')
        }

        $.get ('/shangmen/getOrderExpressInfo/', { order_id : order_id }, function (rs) {
            rs = QW.JSON.parse (rs);

            if (!rs.errno) {
                typeof callback === 'function' && callback (rs[ 'result' ])
            } else {
                // window.location.href = redirect_url
                alert ("抱歉，出错了。" + rs.errmsg);
            }
        })
    }
    // 绑定预约取件相关事件
    function bindEventSchedulePickup ($Target, redirect_url) {
        if (!($Target && $Target.length)) {
            return
        }
        var
            $time_trigger = $Target.query('[name="express_time_alias"]'),
            $address_trigger = $Target.query('[name="express_useraddr"]'),
            $form = $Target.query('form'),
            $btn = $Target.query('.btn-submit')

        // 选择上门取件时间
        new DateTime($time_trigger, {
            remote: '/huishou/doGetAbleExpressTimeTable',
            onSelect : function(e){ }
        })

        if(AddrSuggest && typeof AddrSuggest=='function'){
            // 地址联想
            new AddrSuggest($address_trigger, {
                'showNum' : 6,
                'requireCity' : function(){ return W('.city-sel').html().trim(); }
            })
        }

        // 预约上门取件表单
        $form.on('submit', function(e){
            e.preventDefault()

            if (formSchedulePickupBefore($form)===false){
                return
            }

            if (!formSchedulePickupValid($form)){
                return
            }

            var
                default_btn_text = $btn.val()

            $btn.addClass ('btn-disabled').val ('提交中...')

            if($form.attr('submiting')=='1'){
                return
            }
            $form.attr('submiting', '1')
            var params = {
                express_yuyue_time:$form.query('[name="express_time"]').val(),
                express_mobile:$form.query('[name="express_tel"]').val(),
                express_username:$form.query('[name="express_username"]').val(),
                express_useraddr:$form.query('[name="express_useraddr"]').val(),
                order_id:$form.query('[name="parent_id"]').val(),
                express_cityname:$form.query('[name="express_cityname"]').val(),
                express_area:$form.query('[name="express_area"]').val(),
            }

            $.post($form.attr('action'), params, function(rs){
                try{
                    $form.attr('submiting', '')

                    rs = QW.JSON.parse(rs)

                    //成功
                    if(rs.errno == 0){

                        if (!rs.result) {
                            $btn.removeClass ('btn-disabled').val (default_btn_text)
                        }

                        // 预约成功
                        __showSchedulePickupSuccess (redirect_url)

                    }else{
                        $btn.removeClass ('btn-disabled').val (default_btn_text)

                        // 预约失败
                        __showSchedulePickupFail (redirect_url)
                    }
                } catch (ex){

                    $btn.removeClass ('btn-disabled').val (default_btn_text)

                    // 预约失败
                    __showSchedulePickupFail (redirect_url)

                    $form.attr('submiting', '')
                }
            })
        })
    }

    function formSchedulePickupBefore($Form){
        var
            $express_time_alias = $Form.query ('[name="express_time_alias"]'),
            $express_time = $Form.query('[name="express_time"]')

        $express_time.val ($express_time_alias.val ())
        // if ($express_time_alias && $express_time_alias.val ()) {
        //     var
        //         date_time = $express_time_alias.val ()
        //
        //     date_time = date_time.split ('-')
        //     if (date_time.length > 1) {
        //         date_time.pop ()
        //     }
        //     date_time = date_time.join ('-')
        //
        //     $express_time.val (date_time)
        // }
    }
    function formSchedulePickupValid($Form){
        var
            flag = true,
            $express_username = $Form.query ('[name="express_username"]'),
            $express_tel = $Form.query('[name="express_tel"]'),
            $express_area = $Form.query('[name="express_area"]'),
            $express_useraddr = $Form.query('[name="express_useraddr"]'),
            $express_time_alias = $Form.query('[name="express_time_alias"]')

        var
            $focus_el = null

        // 寄件人姓名
        if ($express_username && $express_username.length) {
            if (tcb.trim ($express_username.val ()).length == 0) {
                $express_username.shine4Error()
                $focus_el = $focus_el || $express_username
                flag = false
            }
        }

        // 手机号
        if (!tcb.validMobile ($express_tel.val ())) {
            $express_tel.shine4Error()
            $focus_el = $focus_el || $express_tel
            flag = false
        }

        // 区县
        if ($express_area && $express_area.length) {
            if (tcb.trim ($express_area.val ()).length == 0) {
                $express_area.shine4Error()
                $focus_el = $focus_el || $express_area
                flag = false
            }
        }

        // 详细地址
        if ($express_useraddr && $express_useraddr.length) {
            if (tcb.trim ($express_useraddr.val ()).length == 0) {
                $express_useraddr.shine4Error()
                $focus_el = $focus_el || $express_useraddr
                flag = false
            }
        }

        // 取件时间
        if ($express_time_alias && $express_time_alias.length) {
            if (tcb.trim ($express_time_alias.val ()).length == 0) {
                $express_time_alias.shine4Error()
                $focus_el = $focus_el || $express_time_alias
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }
    function formSchedulePickupAfter(data, redirect_url){
        if (!data) {
            return
        }

        __showSchedulePickupSuccess (redirect_url)
    }
    // 显示预约取件成功
    function __showSchedulePickupSuccess (redirect_url) {

        var
            html_fn = W('#JsSMSchedulePickupSuccessPanelTpl').html ().trim().tmpl(),
            html_st = html_fn ({
                data : {
                    url : redirect_url
                }
            })

        tcb.closeDialog()

        tcb.showDialog (html_st, {
            className : 'schedule-pickup-success-panel',
            withClose : false,
            middle    : true
        })

    }
    // 显示预约取件失败
    function __showSchedulePickupFail (redirect_url) {

        var
            html_fn = W('#JsSMSchedulePickupFailPanelTpl').html ().trim().tmpl(),
            html_st = html_fn ({
                data : {
                    url : redirect_url
                }
            })

        tcb.closeDialog()

        tcb.showDialog (html_st, {
            className : 'schedule-pickup-fail-panel',
            withClose : false,
            middle    : true
        })

    }


    window.YuyueKuaidi = window.YuyueKuaidi || {}

    tcb.mix(window.YuyueKuaidi, {
        getGuoGuoForm: getGuoGuoForm,
        bindEventSchedulePickup:bindEventSchedulePickup
    })

}())

;/**import from `/resource/js/page/shangmen/diannao.js` **/
// 电脑维修
Dom.ready(function(){
    var wPageDiannao = W('.page-shangmen-diannao');
    // 电脑维修页
    if (!(wPageDiannao && wPageDiannao.length) ){
        return ;
    }

    tcb.bindEvent(wPageDiannao[0], {
        // 商家列表
        '.shop-list .list-item': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('list-item-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.removeClass('list-item-hover');
            }
        }
    });


    var first_load_flag = true;

    // ===== 商家列表 =====
    function getShopListObj() {
        var options = {
            // 选择器
            selector: {
                'wrap' : '.shop-list-wrap',
                'extend_filter_wrap' : '' //.shop-list-extend-filter // 默认无扩展过滤条件
            },
            // 模板
            tpl: {
                'shop_list' : '#JsShopList2Tpl'
            },
            // 商家列表默认的请求参数
            data: {
                'city_id': 'bei_jing',
                'area_id': 0,
                'quan_id': 0,
                'service_id': '',
                'type_id': '',
                'online': 'off',
                'cuxiao': 'off',
                'is_bzj': 0,
                'tag': '',
                'pagesize': 10,
                'pn': 0,
                'lng': '',
                'lat': ''
            },
            // 输出商家列表前
            onBefore: function(){

            },
            // 输出商家列表后
            onAfter: function(obj){

                if (!first_load_flag) {
                    // 对齐
                    var scroll_val = W('.sm-shop-block-left').getRect()['top'];

                    tcb.gotoTop.goPlace(scroll_val-3);
                }

                first_load_flag = false;
            }
        };

        return new window.Bang.ShopList(options);
    }

    var oShopList = getShopListObj();

    // 初始化城市区县选择
    var oAreaSelect = new bang.AreaSelect({
        'wrap': '#JsAreaSelectWrap',
        'hasquan': false,
        'autoinit': true,                             // 是否自动初始化
        'urlhost': 'http://' + location.host +'/',    // 请求的url
        // new后init的回调
        'onInit': function(data){
            oShopList.setFilterParams('city_id', data['citycode']);
            oShopList.setFilterParams('area_id', data['areacode']);
            oShopList.setFilterParams('quan_id', data['quancode']);

            oShopList.setFilterParams('lng', '');
            oShopList.setFilterParams('lat', '');

            var wAddr = W('#addrSearchForm [name="addr"]');
            wAddr.val(wAddr.attr('data-default')).addClass('default');

            // **此处初始化输出商家列表**
            oShopList.renderShopList(true);
        },
        // 城市选择时触发
        'onCitySelect': function(data){
            oShopList.setFilterParams('city_id', data['citycode']);
            oShopList.setFilterParams('area_id', '');
            oShopList.setFilterParams('quan_id', '');

            oShopList.setFilterParams('lng', '');
            oShopList.setFilterParams('lat', '');

            var wAddr = W('#addrSearchForm [name="addr"]');
            wAddr.val(wAddr.attr('data-default')).addClass('default');

            oShopList.renderShopList(true);
        },
        // 区县选择时触发
        'onAreaSelect': function(data){
            oShopList.setFilterParams('city_id', data['citycode']);
            oShopList.setFilterParams('area_id', data['areacode']);
            oShopList.setFilterParams('quan_id', '');

            oShopList.setFilterParams('lng', '');
            oShopList.setFilterParams('lat', '');

            var wAddr = W('#addrSearchForm [name="addr"]');
            wAddr.val(wAddr.attr('data-default')).addClass('default');

            oShopList.renderShopList(true);
        },
        // 商圈选择时触发
        'onQuanSelect': function(data){
            oShopList.setFilterParams('city_id', data['citycode']);
            oShopList.setFilterParams('area_id', data['areacode']);
            oShopList.setFilterParams('quan_id', data['quancode']);

            oShopList.setFilterParams('lng', '');
            oShopList.setFilterParams('lat', '');

            var wAddr = W('#addrSearchForm [name="addr"]');
            wAddr.val(wAddr.attr('data-default')).addClass('default');

            oShopList.renderShopList(true);
        }
    });


    // 绑定位置搜索框
    function initAddrSearch(){
        // 地址搜索表单
        var wSearchForm = W('#addrSearchForm'),
            wAddr = wSearchForm.one('[name="addr"]');

        wSearchForm.bind('submit', function(e){
            e.preventDefault();

            var txt = wAddr.val();

            if( txt =='' || txt == wAddr.attr('data-default') ){
                wAddr.focus();
                if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(wAddr);
            }else{
                getGeoPoi(txt, searchByPoi);
            }
        });

        wAddr.on('focus', function(){
            W('.addr-search-err').hide();
        });

        window.aaaaa = new AddrSuggest(wAddr, {
            'showNum' : 6,
            'onSelect' : function(txt){ getGeoPoi(txt, searchByPoi); },
            'requireCity' : function(){ return W('#JsAreaSelectWrap .sel-city .sel-txt').html() || '' }
        });


        // 根据经纬度搜索
        function searchByPoi(poi){
            if(poi == null){
                W('.addr-search-err').show();
            }else{
                W('.addr-search-err').hide();

                oShopList.setFilterParams('lng', poi['lng']);
                oShopList.setFilterParams('lat', poi['lat']);

                oShopList.setFilterParams('area_id', '');
                oAreaSelect._setAreaData('', '选择区县');

                oShopList.renderShopList(true);
            }
        }

        //获取poi
        function getGeoPoi(addr, callback){

            W('<div id="geoMapBox"></div>').appendTo( W('body') ).hide();

            var _map = new AMap.Map("geoMapBox");
            // 加载地理编码插件 
            _map.plugin(["AMap.Geocoder"], function() {
                MGeocoder = new AMap.Geocoder({
                    city : W('#JsAreaSelectWrap .sel-city .sel-txt').html() || '',
                    radius: 1000,
                    extensions: "all"
                });
                //返回地理编码结果
                AMap.event.addListener(MGeocoder, "complete", function(datas){
                    var pos = null;
                    if(datas && datas['resultNum'] > 0 ){
                        pos = {
                            'lng': datas['geocodes'][0]['location']['lng'],
                            'lat': datas['geocodes'][0]['location']['lat']
                        }
                    }

                    callback(pos);
                });
                //逆地理编码
                MGeocoder.getLocation(addr);
            });
        }

    }

    //位置搜索过滤
    initAddrSearch();

});

;/**import from `/resource/js/page/shangmen/shouji.js` **/
// 手机维修
Dom.ready(function(){

    if (!W('.page-shangmen-shouji').length) {
        return ;
    }

    tcb.bindEvent(document.body, {
        // 切换维修设备类型
        '.type-tab a': function(e){
            e.preventDefault();

            var wMe = W(this),
                pos = wMe.attr('data-pos');

            wMe.addClass('tab-selected').siblings('.tab-selected').removeClass('tab-selected');

            // 滑动切换手机、平板服务项
            runBoxItemAnim(pos);
        },
        // 展开更多可选维修内容
        '.fault-list .item-more': function(e){
            e.preventDefault();

            var box = W('.fault-more-list');
            if( !box.attr('data-oheight') ){
                var oH = box.getRect().height;
                if (oH){
                    box.attr('data-oheight', oH);
                } else {
                    oH = box.show().getRect().height;
                    box.attr('data-oheight', oH).hide();
                }
            }

            var oHeight = box.attr('data-oheight');
            if( box.css('display')=='none' ){
                box.show().css('height', 0).addClass('anim-box').animate({height: oHeight}, 300, function(){
                    box.removeClass('anim-box');
                });
            }else{
                box.addClass('anim-box').animate({height: 0}, 300 , function(){
                    box.removeClass('anim-box').hide();
                });
            }
        },
        //切换二级分类故障
        '.main-fault-list .item' :{
            'mouseenter':function(e){
                e.preventDefault();
                $(this).addClass('item-cur').siblings().removeClass('item-cur');
                $('.sub-fault-list .sub-fault-box').eq($(this).index()).addClass('sub-fault-box-cur').siblings().removeClass('sub-fault-box-cur');
            }
        }
    });

    // 滑动切换手机、平板服务项
    function runBoxItemAnim(pos){
        var wBox = W('.slide-box2'),
            w = wBox.getRect().width;
        wBox.animate({
            'scrollLeft' : pos * w
        }, 800, function(){}, QW.Easing.easeBoth);
    }

    // 设置维修列表的基本宽度样式
    function setBoxSize(){
        var wBox = W('.slide-box2'),
            wList = wBox.query('.slide-list'),
            wItem = wBox.query('.slide-item'),
            w = wBox.getSize().width,
            i_count = wItem.length;

        wList.css('width',  w * i_count);
        wItem.css('width', w);
        wItem.removeClass('slide-item-hide');
    }
    setBoxSize();

    W(window).on('resize', function(){
        setBoxSize();
    });

    // 顶部banner小动画
    function topBannerAnim(){
        var wBanner = W('.top-banner'),
            wItem = wBanner.query('.item');

        wItem.item(0).css({
            'display': 'block',
            'z-index': 9
        }).siblings('.item').hide();

        if (wItem.length<2){
            return
        }
        setTimeout(function(){
            var arg = arguments;

            wItem = wBanner.query('.item');

            var wFirst  = wItem.item(0),
                wSecond = wItem.item(1);
            wSecond.css({
                'display': 'block',
                'z-index': 8,
                'opacity': 1
            });

            wFirst.animate({
                'opacity':{'from':1, 'to':0}
            }, 1000, function(){

                wFirst.css({
                    'display': 'none',
                    'z-index': 0
                }).appendTo(wBanner);

                wSecond.css({
                    'z-index': 9
                });

                setTimeout(arg.callee, 4000);
            });

        }, 4000);
    }
    topBannerAnim();

    //手机故障分两级
    function getFaultList(){
        var request_url = '/shangmen/aj_get_fault_group';
        $.get(request_url,{
            //group_type 1、手机; 2、Pad; 3、PC; 默认不传或不合法时，返回所有故障
            'group_type':1
        }, function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {
                    var fault_list = res['result'];
                    var html_fn = W('#JsFaultListTpl').html().trim().tmpl();
                    var html_str = html_fn({
                            'list': fault_list
                        });
                    $('.js-fault-list').html(html_str);

                    var sub_fault_arr = [];
                    for(var i=0; i<fault_list.length; i++){
                        sub_fault_arr.push(fault_list[i].list);
                    }
                    var sub_html_fn = W('#JsSubFaultListTpl').html().trim().tmpl();
                    var sub_html_str = sub_html_fn({
                        'list': sub_fault_arr
                    });
                    $('.js-sub-fault-list').html(sub_html_str);

                } else {

                }

            } catch (ex){
                //console.log(ex);
            }

        });
    }
    //getFaultList();


    $('.wx-img-show .slide-go-left').on('click', function(e){
        $('.wx-img-show .tit').html('邮寄维修很安心');
    });

    $('.wx-img-show .slide-go-right').on('click', function(e){
        $('.wx-img-show .tit').html('上门维修很快捷');
    });

    new TuiguangSlide('.wx-img-show .slide-wrap', { animTime : 500 });

    /**
     * 推广slide类
     * 使用 new TuiguangSlide('.slide-box');
     * @param {selector} box  [description]
     * @param {[type]} conf [description]
     */
    function TuiguangSlide(box, conf){
        var me = this;

        this.meBox = W(box);
        // 找不到需要处理的容器，直接返回
        if(!this.meBox.length){
            return ;
        }
        this.config = conf || {};
        this.btnPrev = this.meBox.query('.slide-go-left');
        this.btnNext = this.meBox.query('.slide-go-right');
        this.innerBox = this.meBox.query('.slide-inner');
        this.items = this.meBox.query('.slide-item');
        this.listBox = this.meBox.query('.slide-list');
        this.itemNum = this.meBox.query('.slide-item').length;
        this.ctrlBox = this.meBox.query('.slide-ctrl');
        this.innerBoxWidth = this.innerBox.getRect().width;

        this.autoRunTimer = null;

        this.init = function(){
            var me = this;

            var wItems = me.items;
            if (wItems && wItems.length) {
                me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

                me.listBox.css({'width' : me.itemWidth * wItems.length});

                if(me.config.showCtrl){ me.creatCtrl(); }

                if(me.config.autoRun){ me.autoRun( ); }
            }

            this.bindEvent();
        };
        this.resetBoxSize = function(){
            var me = this;
            me.items = me.meBox.query('.slide-item');
            var wItems = me.items;

            if (wItems && wItems.length) {
                me.itemWidth = wItems.getRect().width + parseInt(wItems.css('margin-left'), 10) + parseInt(wItems.css('margin-right'), 10);

                me.listBox.css({'width' : me.itemWidth * wItems.length});

                if(me.config.showCtrl){ me.creatCtrl(); }

                if(me.config.autoRun){ me.autoRun( ); }
            }

        };
        this.bindEvent = function(){

            var me = this;
            var config = this.config;

            me.btnPrev.on('click', function(e){
                e.preventDefault();
                var wMe = W(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft - me.innerBoxWidth }, config.animTime||300, function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                }, QW.Easing.easeOut);
            });
            me.btnNext.on('click', function(e){
                e.preventDefault();
                var wMe = W(this);
                if (wMe.attr('data-animating')) {
                    return ;
                }
                wMe.attr('data-animating', '1');

                me.innerBox.animate({'scrollLeft' : me.innerBox[0].scrollLeft + me.innerBoxWidth }, config.animTime||300, function(){
                    setTimeout(function(){
                        wMe.attr('data-animating', '');
                    }, 200);
                }, QW.Easing.easeOut);
            });

            me.meBox.delegate('.ctrl-item', 'click', function(e) {
                e.preventDefault();
                W(this).addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                var sn = W(this).attr('data-sn') || 0;
                me.go(sn);
            });

            me.meBox.on('mouseenter', function(e){

                clearInterval(me.autoRunTimer);
            });
            me.meBox.on('mouseleave', function(e){
                if(config.autoRun){ me.autoRun(); }
            });
        };

        this.go = function(step){
            var config = this.config;
            step = step || 0;
            this.innerBox.animate({'scrollLeft' : 0 + this.innerBoxWidth*step }, config.animTime||300, function(){}, QW.Easing.easeOut);
        };

        this.autoRun = function(){
            var me = this;
            var config = this.config;

            me.autoRunTimer = setInterval(function(){
                var currSn = me.meBox.query('.ctrl-curr').attr('data-sn')||0;
                nextSn = currSn - 0 + 1;
                if( nextSn > me.itemNum-1 ){
                    nextSn = 0;
                }
                me.meBox.query('.ctrl-item[data-sn="'+nextSn+'"]').addClass('ctrl-curr').siblings('.ctrl-curr').removeClass('ctrl-curr');
                me.go(nextSn);
            }, typeof(config.autoRun)=='number'? config.autoRun : 5000);
        };

        this.creatCtrl = function(e){

            if(this.ctrlBox.query('.ctrl-item').length||this.items.length<2){
                return ;
            }

            str = '';
            for(var i=0, n=this.items.length; i<n; i++){
                str += '<span class="ctrl-item '+(i==0?'ctrl-curr':'')+'" data-sn="'+i+'"></span>';
            }
            this.ctrlBox.html(str);
        };

        this.init();
    }

});

;/**import from `/resource/js/page/shangmen/order_pre.js` **/
Dom.ready(function(){
    // 提交自营订单
    if (!W('.page-shangmen-order').length) {
        return ;
    }

    // 到店商家列表
    (function(){
        var pageSize = 10;

        //根据关键字搜索到店商家列表
        var dataListCache = {},
            __currListData = {};
        function getDaodianShopList(pn, flag){
            var param = getDaodianSearchParams();
            param['pn'] = pn || 0;
            param['async']=1;

            //console.log(dataListCache)

            //有缓存
            if(dataListCache[Object.encodeURIJson(param)]){
                var rs = dataListCache[Object.encodeURIJson(param)];
                var func = W("#smDaodianShopTpl").html().trim().tmpl();
                html = func(rs);
                W('.search-mod-rs').html(html);

                flag && smRepairPager(Math.ceil(rs.page_count/pageSize));

                //赋值给全局变量，给地图使用
                window.__currListData = rs;
                updateMinMap();
            }else{//Ajax请求
                QW.Ajax.get('/client/search/', param, function(rs){
                    rs = QW.JSON.parse(rs);
                    rs.shop_data = rs.data;

                    if(!rs.shop_data && param['pn']==0){
                        W('.no-result').show();
                    }else{
                        if(rs.shop_data.length==0 && param['pn']==0){
                            W('.no-result').show();
                        }else{
                            W('.no-result').hide();
                            dataListCache[Object.encodeURIJson(param)] = rs;

                            var func = W("#smDaodianShopTpl").html().trim().tmpl();
                            html = func(rs);
                            W('.search-mod-rs').html(html);

                            flag && smRepairPager(Math.ceil(rs.page_count/param['pagesize']));
                            flag && ( W('.search-rs-num').html(rs.page_count) );

                            //赋值给全局变量，给地图使用
                            window.__currListData = rs;
                            updateMinMap();
                        }
                    }
                });
            }
        }

        function getDaodianSearchParams(){

            return{
                keyword : W('.daodian-shop-kw').html() || '',
                city_id : W('.area-select-wrap .sel-city').attr('code')||'',
                area_id : W('.area-select-wrap .sel-quxian').attr('code')||'',
                type_id : W('.search-mod-hd li.curr').attr('data-type')||0,
                pagesize : 10,
                show_mode : 'product'
            }
        }

        /**
         * 商家维修分页
         * @return {[type]} [description]
         */
        function smRepairPager(pagenum, id, callback){

            var id = id || 'smRepairPager';
            if(pagenum==1){
                W('#'+id+' .pages').hide().html('');
                return;
            }

            W('#'+id+' .pages').show();

            var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
            var pager = new Pager(W('#'+id+' .pages'), pagenum, pn);

            pager.on('pageChange', function(e) {
                callback = callback || getDaodianShopList;
                callback(e.pn,false,false);
                W('.detail-cnt[data-for="daodian"]')[0].scrollIntoView(true);
            });
        }

        var rightMinMap = null;
        function initMinMap(){
            rightMinMap = new AMap.Map("smMapWrap",{
                view: new AMap.View2D({//创建地图二维视口
                    zoom:8,
                    rotation:0
                })
            });
        }

        function updateMinMap(){
            if(!rightMinMap){
                initMinMap();
            }

            rightMinMap.clearMap();
            //直接从页面中获取变量显示结果
            var data = __currListData.shop_data || [];
//console.log(__currListData);
            data.forEach(function(item, i){
                if(i == 0){
                    rightMinMap.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude))
                }

                var marker = new AMap.Marker({
                    id:"mapMarker"+i,
                    position:new AMap.LngLat(item.map_longitude, item.map_latitude),
                    icon:{stc:"https://p.ssl.qhimg.com/t01a55fed81341959b4.png"}.stc,
                    offset:{x:-13,y:-36}
                });
                marker.setMap(rightMinMap);
            });
        }

        function showBigMap(){
            var map = null;

            var panel = tcb.alert("地图模式", '<div id="mode_map" ><div id="mode_map_container" style="width:700px;height:480px"></div></div>', {'width':700, btn_name: '关闭',wrapId:"panel-modeMapindex"}, function(){
                map = null;
                return true;
            });
            //reset
            document.getElementById("mode_map_container").innerHTML = "";

            map = new AMap.Map("mode_map_container",{
                view: new AMap.View2D({//创建地图二维视口
                    zoom:10,
                    rotation:0
                })
            });
            map.plugin(["AMap.ToolBar","AMap.OverView","AMap.Scale"],function(){
                var overview = new AMap.OverView();
                map.addControl(overview);
                var toolbar = new AMap.ToolBar(-100,0);
                toolbar.autoPosition=false;
                map.addControl(toolbar);
                var scale = new AMap.Scale();
                map.addControl(scale);
            });
            W(document.body).delegate('#panel-modeMapindex span.close', 'click', function(e){
                try{
                    e.preventDefault();
                    map.clearInfoWindow();
                    map = null;
                }catch(e){

                }

            })

            W(document.body).delegate('.mode-map a.close', 'click', function(e){
                e.preventDefault();
                map.clearInfoWindow();

            });


            //点击在线聊天时关闭弹出层
            W(document.body).delegate('.qim-go-talk', 'click', function(){
                panel.hide();
                map = null;
            });

            //直接从页面中获取变量显示结果
            var data = __currListData.shop_data || {};

            data.forEach(function(item, i){
                if(i == 0){
                    map.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude))
                }

                var marker = new AMap.Marker({
                    id:"mapMarker"+i,
                    position:new AMap.LngLat(item.map_longitude, item.map_latitude),
                    icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
                    offset:{x:-13,y:-36}
                });
                marker.setMap(map);

                var infoWindow = new AMap.InfoWindow({
                    isCustom: true,
                    autoMove: true,
                    offset:new AMap.Pixel(70,-290),
                    content:W('#indexMapInfoTpl_sm').html().tmpl({
                        shop_name: item.shop_name,
                        addr: item.addr_detail || item.s_addr_detail,
                        service_tags: item.main.subByte(40, '...'), //item.service_tags.subByte(40,'...'),
                        qid: item.qid,
                        shop_addr: item.shop_addr
                    }),
                    size: new AMap.Size(349, 204)
                });

                AMap.event.addListener(marker, "click", function(){
                    //try{ tcbMonitor.__log({cid:'map-marker-click',ch:''}); }catch(ex){}
                    infoWindow.open(map, marker.getPosition())
                })
            });
        }

        // 获取选择服务内容的相关详情
        function getServiceData(service_id, callback){
            var ServiceData = window._ServiceData || {};

            var ServiceDataItem = ServiceData[service_id];
            if (ServiceDataItem) {
                callback(ServiceDataItem);
            } else {
                QW.Ajax.get('/shangmen/aj_get_zydata', {
                    'fault_id': service_id
                }, function(res){
                    res = QW.JSON.parse(res);

                    if (!res['errno']) {
                        var InfoData = res['result'];
                        ServiceDataItem = {
                            'youji_city': [],// @我只是提前占位，现在没有任何作用
                            'shangmen_city': InfoData['shangmen_data'],
                            'daodian_city': InfoData['daodian_data'],
                            'select_list': InfoData['zy_data']['select_list'],
                            'service_list': InfoData['zy_data']['info_kv_list'],
                            //'express_shanghai': InfoData['show_shanghai_express_flags']
                            'express_not_support': {
                                '2':InfoData['show_beijing_express_flags']||{},
                                '3':InfoData['show_chengdu_express_flags']||{},
                                '4':InfoData['show_shanghai_express_flags']||{},
                                '5':InfoData['show_guangzhou_express_flags']||{}
                            }
                        };

                        window._ServiceData[service_id] = ServiceDataItem;

                        callback(ServiceDataItem);
                    } else {
                        // @do nothing
                    }
                });
            }
        }

        function init(){
            // 换屏活动中，内容详情页城市选择器
            if( W('#citySelector').length ){
                // 解析当前url的query
                var url_query = window.location.href.queryUrl();

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
                        getDaodianShopList(0, true);
                    },
                    // 区县选择时触发
                    'onAreaSelect': function(data){
                        getDaodianShopList(0, true);

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

                //排序修改
                W('.search-mod-hd li').on('click', function(){
                    if( W(this).hasClass('curr') ){
                        return;
                    }else{
                        W(this).addClass('curr').siblings().removeClass('curr');

                        getDaodianShopList(0, true);
                    }
                });

                //显示大地图
                W('.see-big-map').on('click', function(e){
                    e.preventDefault();
                    showBigMap()
                });

                //切换tab
                W('.detail-tab-item').on('click', function(e){
                    W(this).addClass('curr').siblings().removeClass('curr');
                    var rel = W(this).attr('data-rel');
                    W('.detail-cnt').hide();
                    W('.detail-cnt[data-for="'+rel+'"]').show();
                    try{ rel == 'daodian' && updateMinMap() }catch(ex){}
                });

                //查看专家生活照
                W('.sm-zj-item').on('mouseenter', function(e){
                    W(this).addClass('hover');
                });
                W('.sm-zj-item').on('mouseleave', function(e){
                    W(this).removeClass('hover');
                });

                //加载到店商家
                getDaodianShopList(0, true);
                initMinMap();

                W('.detail-tab').show();

                getServiceData(url_query['fault_id'], function(ServiceDataItem){
                    if (ServiceDataItem
                        && ServiceDataItem['shangmen_city']
                        && ServiceDataItem['shangmen_city'][window.__CurCityCode]) {

                        W('.detail-tab-item[data-rel="shangmen"]').show().fire('click');
                        W('.detail-tab-item[data-rel="youji"]').hide();
                    }
                    else {
                        W('.detail-tab-item[data-rel="shangmen"]').hide();
                        W('.detail-tab-item[data-rel="youji"]').show().fire('click');
                    }
                });

            }

        }

        init();
    }());
});

;/**import from `/resource/js/page/shangmen/order/order.js` **/
Dom.ready(function(){
    // 提交自营订单
    if (!W('.page-shangmen-order').length) {
        return ;
    }
    var SM = window.Shangmen,
        queryParams = tcb.queryUrl(window.location.search)

    window.__ServiceId = queryParams['fault_id'];
    window.__ShangmenDateTime;
    window.__DaodianDateTime;
    window._ServiceData = window._ServiceData || {};

    // 基本处理
    (function(){
        // 处理扩展服务数据，变成k-v形式
        function dealExtendService(){
            var __ExtendService = window.__ExtendService || '';
            if (__ExtendService) {
                __ExtendService = JSON.parse(__ExtendService);
            }
            window.__ExtendService = {};
            __ExtendService.forEach(function(item){
                window.__ExtendService[item['id']] = item;
            });
        }
        dealExtendService();

    }());

    // 服务的选择
    (function(){

        tcb.bindEvent(document.body, {
            // 选择修改其他服务内容
            '.sel-other-issue' : function(e){
                e.preventDefault();

                W('.product-list').slideDown();
            },
            '.addr-stations li' : function(){
                var me = $(this),
                    active = "active";
                me.siblings().removeClass(active);
                me.addClass(active);
                W(".show-stations-address").show();
                W(".stations-to").html(me.attr("data-station") + " " + me.attr("data-consignee"));
                W(".express_station_id").val(me.attr("data-id"));
            },
            // 选择维修产品
            '.product-list .product-item' : function(e){
                e.preventDefault();
                var wMe = W(this);

                var data_type = wMe.attr('data-type'),  // 当前分类标识
                    service_id = wMe.attr('data-id'),   // 服务大类id
                    price = wMe.attr('data-price'),     // 默认大类价格
                    oprice = wMe.attr('data-oprice'),   // 默认原始价格
                    prd = wMe.html(), // 服务名称
                    extInfo = wMe.attr('data-extinfo'); // 服务扩展描述

                window.__ServiceId = service_id

                // 添加被选中class
                W('.fault-row .product-select').removeClass('product-select');
                wMe.addClass('product-select')/*.siblings('.product-select').removeClass('product-select')*/;

                // 点击的是父分类，筛选出子分类
                if (data_type) {
                    W('.product-list .sub-list').show();

                    W('.product-list .sub-list .product-item').hide();
                    W('.product-list .sub-list .product-item[data-for="'+data_type+'"]').show();

                    return ;
                }

                if (wMe.ancestorNode('.top-list').length) {
                    W('.product-list .sub-list').hide();
                }

                // 选中一个服务大类后，先设定该服务的默认价格
                setCurProductInfo({
                    'price': price,
                    'original_price': oprice,
                    'id': ''
                });
                // 设置商品基本信息
                setProductInfo();
                // 设置商品价格相关
                setProductPirce();

                // 设置服务方式状态
                setServiceTypeStatus();

                W('#currFault').html( prd );       // 设置服务名称
                W('#extInfo').html( extInfo||'' ); // 设置服务扩展描述
                W('.product-list').hide();         // 隐藏服务列表
                W('.curr-prd-box').show();

                if (window.__ShangmenDateTime && window.__ShangmenDateTime.resetRemote) {
                    window.__ShangmenDateTime.resetRemote (tcb.setUrl ('/shangmen/doGetValidDate', {
                        type       : '1',
                        valid      : '7',
                        fault_type : window.__ServiceId,
                        city_name  : W ('#currCity').html ().trim ()
                    }))
                }
                if (window.__DaodianDateTime && window.__DaodianDateTime.resetRemote) {
                    window.__DaodianDateTime.resetRemote (tcb.setUrl ('/shangmen/doGetValidDate', {
                        type       : '3',
                        valid      : '7',
                        fault_type : window.__ServiceId,
                        city_name  : W ('#currCity').html ().trim ()
                    }))
                }

                // 获取服务内容大类数据
                getServiceData(service_id, function(ServiceDataItem){
                    // 输出属性选择html
                    renderProductAttrHtml(service_id);

                    // 显示输入优惠码
                    W('#promoContainer').css({
                        'visibility': 'hidden'
                    });

                    var wSelectedExtendinfo = W('#ServiceExtendInfo'),
                        wSelect = wSelectedExtendinfo.query('select');
                    //如果选项1只有一个选项，则直接选中（触发select的change事件）
                    wSelect.forEach(function(el){
                        // 只有一个选项
                        if (el.options.length==2) {
                            el.options.item(1).selected=true;

                            // 为了避免在ie7/8下qwrap的fire change不能正确执行，试用jquery来写change事件，并且使用trigger触发
                            //W(el).fire('change');
                            $(el).trigger('change');
                        }
                    });
                    // 只有一个select，并且select只有一个选项（默认选项除外），隐藏选项框
                    if (wSelect.length==1 && wSelect[0].options.length == 2) {
                        wSelectedExtendinfo.query('.curr-prd-box-extendinfo').hide();
                    }
                });
            }

        });

    }());

    // 价格的计算
    (function(){

    }());

    // 其他
    (function(){
        var _G_PANEL;
        tcb.bindEvent(document.body, {
            // 自动填充其他服务方式下的手机号 和 验证码
            '.inpt-secode-mobile, .inpt-secode, .ipt-pic-secode': {
                blur: function(){
                    var wMe = W(this),
                        val = wMe.val().trim();

                    if (wMe.hasClass('inpt-secode-mobile')) {
                        // 手机号
                        if (tcb.validMobile(val)){
                            W('.inpt-secode-mobile').val(val);
                        }
                    }else if(wMe.hasClass('ipt-pic-secode')){
                        // 图片验证码
                        if (val){
                            W('.ipt-pic-secode').val(val);
                        }
                    } else {
                        // 验证码
                        if (val){
                            W('.inpt-secode').val(val);
                        }
                    }
                }
            },
            // 获取验证码短信
            '.btn-get-secode': function(e){
                e.preventDefault();

                var $me = W(this);
                if ($me.hasClass('btn-get-secode-disabled')){
                    return ;
                }

                var $mobile = $me.siblings('.inpt-secode-mobile'),
                    mobile = $mobile.val().trim();

                var $secode = W('.ipt-pic-secode'),
                    secode = $secode.val().trim();

                if (!tcb.validMobile(mobile)) {
                    $mobile.shine4Error().focus();
                    return ;
                }

                if (!secode) {
                    $secode.shine4Error().focus();
                    return ;
                }

                var request_url = '/shangmen/doSendSmscode',
                    params = {
                        mobile: mobile,
                        secode: secode
                    };
                QW.Ajax.post(request_url, params, function(res){
                    res = JSON.parse(res);
                    if (res['errno'] == '205') {
                        alert(res['errmsg']);
                        $(".secode_img").attr('src', '/secode/?rands=' + Math.random())
                    } else if (res['errno']) {
                        alert(res['errmsg']);
                    } else {
                        // 当前页面[所有]发送手机验证码的按钮都禁止点击，加入倒计时
                        W('.btn-get-secode').addClass('btn-get-secode-disabled').html('60秒后再次发送');
                        tcb.distimeAnim(60, function(time){
                            if(time<=0){
                                W('.btn-get-secode').removeClass('btn-get-secode-disabled').html('获取验证码');
                            }else{
                                W('.btn-get-secode').html( time + '秒后再次发送');
                            }
                        });

                    }
                });
            },
            // 点击选择额外服务
            '.extend-service-label': function(e){
                e.preventDefault();

                var wMe = W(this),
                    wServ = wMe.query('input'),
                    serv_val = wServ.val();

                if(wMe.hasClass('extend-service-label-checked')){
                    wMe.removeClass('extend-service-label-checked');
                    wServ.attr('checked', false);

                    // 重新设置总价
                    setProductPirce();

                } else {
                    _G_PANEL = tcb.panel('', W('#ZiYingExtendServiceConfirmPanelTpl').html().tmpl()({
                        'service_cnt': '<img src="'+window.__ExtendService[serv_val]['server_img_pc']+'" alt=""/>',
                        'service_id': serv_val
                    }), {className:'extend-service-confirm-panel-wrap'});
                }

                try{
                    var params = {
                        cId : wMe.text()
                    };

                    //tcbMonitor.__log(params); //发送点击统计
                }catch(ex){}

            },
            // 确认选择服务
            '.extend-service-confirm-panel .btn-confirm': function(e){
                e.preventDefault();

                var wMe = W(this),
                    extend_service_id = wMe.attr('data-serviceid');

                W('.extend-service-label').forEach(function(el){
                    var wLabel = W(el),
                        wInput = wLabel.query('input');
                    if (wInput.val()==extend_service_id) {
                        wLabel.addClass('extend-service-label-checked');
                        wInput.attr('checked', true);
                    }
                });
                // 重新设置总价
                setProductPirce();

                // 选中后隐藏面板
                if(_G_PANEL && _G_PANEL.hide){
                    _G_PANEL.hide();
                }
            },
            // 取消不选择服务
            '.extend-service-confirm-panel .btn-cancel': function(e){
                e.preventDefault();

                if(_G_PANEL && _G_PANEL.hide){
                    _G_PANEL.hide();
                }
            }

        });
    }());

    function bindEvent(){
        var _quesPop;

        // 首页上门
        tcb.bindEvent('.page-shangmen', {
            // 上门首页-常见问题
            '.right-question' : function(e){
                e.preventDefault();

                _quesPop = tcb.panel('', W('#questionContent').html(), {
                    "width":670,
                    "height":580,
                    "withShadow": true,
                    "className" : "panel panel-tom01 border8-panel pngfix q-pop-panel"
                });
            },
            '.q-pop-panel' : function(e){
                _quesPop && _quesPop.hide();
            },
            '.mask' : function(e){
                _quesPop && _quesPop.hide();
            },
            // 上门首页-用户评价左右翻页
            '.cmt-p-prev' : function(e){
                W('.u-cmt-box').animate({'scrollLeft' : W('.u-cmt-box')[0].scrollLeft - 0 - 226}, 300);
            },
            '.cmt-p-next' : function(e){
                W('.u-cmt-box').animate({'scrollLeft' : W('.u-cmt-box')[0].scrollLeft - 0 + 226}, 300);
            },

            // 右边浮层，给客服小妹子发信息
            '.kf-xiaomeizi': function(e){
                e.preventDefault();

                _quesPop = tcb.panel('', '<div class="question-pop"><p style="padding: 10px">在线客服正忙，<br/>如需咨询请您致电 <em>4000-399-360</em> <br>（工作时间9:00-19:00）</p></div>', {
                    //"width":350,
                    //"height":80,
                    "withShadow": true,
                    "className" : "panel panel-tom01 border8-panel pngfix q-pop-panel"
                });
            }

        });

        // 选择品牌、型号、服务名称等
        // 为了避免在ie7/8下qwrap的fire change不能正确执行，试用jquery来写change事件，并且使用trigger触发
        $('#ServiceExtendInfo').on('change', 'select', function(e){
            var wMe = W(this),
                wExtendinfo = wMe.ancestorNode('.curr-prd-box-extendinfo'),
                name = wMe.attr('name'),
                service_id = wExtendinfo.attr('data-for');

            var last_flag = true;
            if(wMe.nextSibling('select').length){
                last_flag = false;
            }
            var pos = 0;
            if(wMe.previousSiblings('select').length){
                pos += wMe.previousSiblings('select').length;
            }

            // 获取服务内容大类数据
            getServiceData(service_id, function(ServiceDataItem){

                var attr_arr = [];
                wExtendinfo.query('select').map(function(el){
                    attr_arr.push(W(el).val());
                });
                var SelectedService = ServiceDataItem['service_list'][attr_arr.join('|')];
                // 设置当前被选中产品的信息
                setCurProductInfo(SelectedService);

                // 更换最后一组属性，直接更新对应的价格
                if(last_flag){

                    if(SelectedService){
                        // 设置具体服务商品属性
                        setProductInfo();

                        // 设置服务方式状态
                        setServiceTypeStatus(SelectedService['id']);

                        // 设置商品价格
                        setProductPirce();

                        // 显示输入优惠码
                        W('#promoContainer').css({
                            'visibility': 'visible'
                        });
                    }
                }
                // 切换属性，下级属性联动切换
                else {
                    var SelectList = ServiceDataItem['select_list'],
                        SelectNext = SelectList[pos+1],
                        SelectNextList = SelectNext['list'];

                    var str = '<option value="">'+SelectNext['option']+'</option>';

                    // 判断是否为数组
                    SelectNextList.map(function (v) {
                        if(wMe.val()==v['pid']){
                            str += '<option value="'+v['id']+'">'+v['name']+'</option>';
                        }
                    });
                    wMe.nextSibling('select').html(str);

                    // 设置服务方式状态
                    setServiceTypeStatus();
                }

            });
        });



        // 自营上门服务
        tcb.bindEvent('.page-shangmen-order', {
            // 触发优惠码输入框
            '.use-promo' : function(e){
                e.preventDefault();

                W(this).hide()
                    .siblings('.use-promo-txt').hide()
                    .siblings('.promo-box').show();
            },
            // 验证优惠码有效性
            '#promoCode' : {
                'change' : function(e){

                    // 验证优惠码，刷新商品价格
                    setProductPirce();
                }
            },

            // 选择服务方式
            '[name="service_type"]': function(e){
                var ckVal = W(".service-type:checked").val();

                // 设置商品基本信息
                setProductInfo();

                // 激活目标服务方式
                activeTargetServiceType(ckVal);

                // 设置商品价格
                setProductPirce();
            },

            //onebox落地页-点击评价
            '.zy-ld-item' : function(e){
                var isrc= W(this).attr('src');
                var nsrc = isrc.replace(/cmt(\d+)\.jpg/ig, 'cmt$1_b.jpg');

                tcb.panel('评论详情', '<img src="'+nsrc+'" alt="" width="320" />', {
                    width:320,
                    height:598
                })
            },

            // onebox数据恢复-额外补差价
            '#showSJExtPrice': function(e){
                e.preventDefault();

                tcb.panel('', W('#ZiyingSJExtPriceTpl').html().trim().tmpl()(), {
                    //'width': 889,
                    //'height' : 426
                });
            },
            // onebox，立即预约
            '.sm-sub-pre': function(e){
                e.preventDefault();

                var mp = W(this).attr('data-mp');
                if( mp == 1){
                    var url_query = tcb.queryUrl(window.location.search);
                    url_query['showdetail'] = '';
                    window.location.href = tcb.setUrl(window.location.pathname, url_query);
                }else{
                    W('.section-pre').slideUp(500);
                    W('.section-o-1').show();
                }

            },
            // 显示iphone手机内存升级协议
            '.js-show-ncsj-protocol': function(e){
                e.preventDefault();

                var html_str = W('#ZiyingNeicunshengjiProtocolTpl').html().trim().tmpl()();

                // ip手机内存升级协议
                tcb.panel('', html_str, {
                    "width":800,
                    "height":600,
                    "withShadow": true,
                    "className" : "panel panel-tom01 border8-panel pngfix ncsj-protocol-wrap-dialog"
                });
            },
            '.js-show-fwsm-protocol': function(e){
                e.preventDefault();

                var html_str = W('#ZiYingFuWuShengMingTpl').html().trim().tmpl()();

                // ip手机内存升级协议
                tcb.panel('', html_str, {
                    "width":800,
                    "height":600,
                    "withShadow": true,
                    "className" : "panel panel-tom01 border8-panel pngfix ncsj-protocol-wrap-dialog"
                });
            }
        });
    }

    // 输出当前服务内容大类的可选选项构成的html
    function renderProductAttrHtml(service_id){
        var ServiceData = window._ServiceData || {};

        var ServiceDataItem = ServiceData[service_id];

        var html_str = '';
        if (ServiceDataItem) {
            // 刷新可选择服务属性组合的html
            var SelectList = ServiceDataItem['select_list'];
            // 获取自营服务具体属性的选择
            html_str = W('#ZiyingServiceExtendInfoTpl').html().trim().tmpl()({
                'select_list': SelectList,
                'fault_id': service_id // 此处的fault_id是指大类的fault_id
            });
        }

        var wSelectedExtendinfo = W('#ServiceExtendInfo');
        wSelectedExtendinfo.html(html_str);
    }

    // 设置服务方式的状态（可用/不可用）
    function setServiceTypeStatus(service_product_id){
        var service_id = W('#ServiceExtendInfo .curr-prd-box-extendinfo').attr('data-for');
        var shangmen_info = !service_product_id ? '' : getShangmenData(service_id, service_product_id),
            daodian_info  = !service_product_id ? '' : getDaodianData(service_id, service_product_id),
            youji_info    = !service_product_id ? '' : getYoujiData(service_id);

        // 判断上门服务是否可用
        var wShangmenRadio = W('#service_type_1');
        if (!shangmen_info || checkServiceTypeClosed('shangmen')) {
            wShangmenRadio.attr("disabled",true);
            wShangmenRadio.attr("checked",false);
            wShangmenRadio.ancestorNode('label').addClass('disabled');
        } else {
            wShangmenRadio.setAttr("disabled", false);
            wShangmenRadio.ancestorNode('label').removeClass('disabled');
            // 等于-1表示支持上门，但是没有文字描述支持区域
            if (shangmen_info !== -1) {
                W('#smSptArea').html('（'+shangmen_info+'）');
            }
        }

        //判断到店服务是否可用
        var wDaodianRadio = W('#service_type_3');
        if (!daodian_info || checkServiceTypeClosed('daodian')) {
            wDaodianRadio.attr("disabled",true);
            wDaodianRadio.attr("checked",false);
            wDaodianRadio.ancestorNode('label').addClass('disabled');
        } else {
            wDaodianRadio.attr("disabled", false);
            wDaodianRadio.ancestorNode('label').removeClass('disabled');
            setDaodianSelectList(daodian_info);
        }

        //判断邮寄服务是否可用
        var wYoujiRadio = W('#service_type_2');
        if (!youji_info || checkServiceTypeClosed('youji')) {
            wYoujiRadio.attr("disabled",true);
            wYoujiRadio.attr("checked",false);
            wYoujiRadio.ancestorNode('label').addClass('disabled');
        } else {
            wYoujiRadio.attr("disabled", false);
            wYoujiRadio.ancestorNode('label').removeClass('disabled');
        }
        //激活第一个可用服务的输入表单
        activeTargetServiceType();
    }
    // 验证优惠码
    function validPromoCode(price, callback){
        price = price ? parseFloat(price) : 0;
        price = price ? price : 0;

        var wPromoCode = W('[name="youhui_code"]'),
            promo_code = wPromoCode.val().trim(),
            youhuiPrice = 0;

        var wPromoYZ = W('#promoYZ');
        // 没有优惠码
        if(!promo_code){
            wPromoYZ.html(wPromoYZ.attr('data-placeholder')).removeClass('promo-succ').removeClass('promo-fail');

            typeof callback==='function' && callback(price,youhuiPrice);
            return;
        }
        // 优惠码输入框中有优惠码，先验证优惠码
        QW.Ajax.post('/aj/doGetYouhuiAmount', {
            'youhui_code' : promo_code,
            'service_type': 1,
            'price': price,
            'product_id': W('[name="fault_id"]').val(),
            'fuwu_type': W('[name="service_type"]').filter(function(el){return W(el).attr('checked');}).val() /*服务方式：1：上门，2：邮寄，3：到店*/
        }, function(rs){
            try{
                rs = QW.JSON.parse(rs);

                if( rs.errno ){
                    W('#promoYZ').html('抱歉，优惠码验证失败。').removeClass('promo-succ').addClass('promo-fail');
                }
                else{

                    youhuiPrice = rs.result['promo_amount'] || 0

                    var
                        promo_per  = rs.result['promo_per'] || 0;
                    if (promo_per) {
                        youhuiPrice = {
                            'promo_per': promo_per
                        };
                    }

                    // 为对象表示为折扣优惠，否则是优惠金额
                    if (typeof youhuiPrice == 'object') {
                        promo_per = youhuiPrice['promo_per'];

                        youhuiPrice = tcb.formatMoney(price*(100-promo_per)/100, 0, 1);
                    } else {
                        youhuiPrice = tcb.formatMoney(youhuiPrice, 0, 1);
                    }

                    var promoYZ_str = '优惠码有效，已优惠'+youhuiPrice+'元~';
                    if (promo_per) {
                        promoYZ_str = '优惠码有效，服务可享受'+promo_per+'折优惠<span class="red">（不包含加享服务）</span>';
                    }
                    price = price - youhuiPrice;
                    price = price<0 ? 0 : price;
                    W('#promoYZ').html(promoYZ_str).removeClass('promo-fail').addClass('promo-succ');
                }

                typeof callback==='function' && callback(price,youhuiPrice);

            } catch (ex){
                typeof callback==='function' && callback(price,youhuiPrice);
            }
        });
    }

    // 设置商品基本信息，服务支持等 //pinfo格式{'id':'', 'price':'', 'original_price':'', 'description':''}
    function setProductInfo(pinfo){
        pinfo = pinfo || getCurProductInfo();

        if (!pinfo) {
            return ;
        }
        // 手机存储空间升级
        if (pinfo['fault_type'] && pinfo['fault_type']=='43') {
            W('.ncsj-protocol-line').show();

            W('#formOrder [type="submit"]').val('下单支付').attr('data-type', '2');
        } else {
            W('.ncsj-protocol-line').hide();
            W('#formOrder [type="submit"]').val('立即预约').attr('data-type', '1');
        }

        W('[name="fault_id"]').val(pinfo['id']); // 服务商品id

        var fwbz_str = pinfo['description'] ? '（'+pinfo['description']+'）' : '';
        W('.fw-bz').html(fwbz_str);// 价格后边的服务保障

        // 商品的附加服务
        setProductExtendService(pinfo);

        // 初始设置属性时，将预约输表单隐藏
        W('.yyinfo-box').hide();
    }
    /**
     * 设置商品的附加服务
     * @param pinfo
     */
    function setProductExtendService(pinfo){
        var extend_service = pinfo['value_added_server']||[];
        var html_str = '';
        if (extend_service && extend_service.length){
            extend_service.forEach(function(item){
                var cur_extend_service = window.__ExtendService[item];
                if (!cur_extend_service) {
                    return ;
                }

                html_str += '<div class="extend-service-label" data-plusprice="'+cur_extend_service['server_price']+'" data-id="'+cur_extend_service['id']+'">'+
                    '<span class="checkbox"><input type="checkbox" name="value_added_selected[]" value="'+cur_extend_service['id']+'"/></span>'+
                    '<span class="txt">+'+cur_extend_service['server_name']+'</span>'+
                    '</div>';
            });
        }
        W('.product-extend-service').html(html_str);
    }
    // 设置商品价格
    function setProductPirce(pInfo){
        // 获取当前当前服务商品信息
        pInfo = pInfo || getCurProductInfo();
        if (!pInfo) {
            return ;
        }

        var price;
        var checked_type = W('.service-type:checked').val();
        // 对于不同的服务方式，设置相应的服务价格
        switch (checked_type) {
            case '1':
                price = pInfo['price'];
                break;
            case '2':
                price = pInfo['youji_price'];
                break;
            case '3':
                price = pInfo['daodian_price'];
                break;
        }
        price = parseFloat( price || pInfo['price'] );

        W('#showOrgPirce').html(pInfo['original_price']); // 显示原始价格
        W('[name="total_amount"]').val(pInfo['price']);   // 实际基础价

        // 校验优惠码，更新最终价格
        validPromoCode(price, function (final_product_price,youhuiPrice) {
            W('#showPrice').html(final_product_price); // 商品最终价格（原价-优惠价）

            var final_total_price = final_product_price; // 最终实际价格

            // 计算附加服务价格
            W('.extend-service-label').forEach(function(el){
                var wLabel = W(el);
                // 被选中的附加服务
                if (wLabel.hasClass('extend-service-label-checked')) {
                    var plus_price = parseFloat(wLabel.attr('data-plusprice'));

                    final_total_price += plus_price;
                }
            });

            W('.total-price').html('￥'+final_total_price);
            W('[name="real_amount"]').val(final_total_price); // 最终价格

            setProductPriceList(price,youhuiPrice);// 设置价格列表
        });
    }

    // 设置价格列表
    function setProductPriceList(origin_price, promo_price_sum){
        promo_price_sum = promo_price_sum ? promo_price_sum : 0

        var
            extend_service_price_sum = 0,
            color = promo_price_sum>0 ? '#fe4b00' : '#333'

        // 价格列表-商品价格
        W('.product-price').html('￥'+origin_price.toFixed(2))

        // 价格列表-优惠折扣
        W('.discount-price').html('-￥'+promo_price_sum.toFixed(2))

        // 价格列表-附加服务
        W('.product-extend-service .extend-service-label-checked').forEach (function (el) {
            var
                plus_price = parseFloat (W (el).attr ('data-plusprice'))

            extend_service_price_sum += plus_price - 0
        })
        W('.extend-service-price').html('￥'+extend_service_price_sum.toFixed(2))

    }

    // 获取选择服务内容的相关详情
    function getServiceData(service_id, callback){
        var ServiceData = window._ServiceData || {};

        var ServiceDataItem = ServiceData[service_id];
        if (ServiceDataItem) {
            callback(ServiceDataItem);
        } else {
            QW.Ajax.get('/shangmen/aj_get_zydata', {
                'fault_id': service_id
            }, function(res){
                res = QW.JSON.parse(res);

                if (!res['errno']) {
                    var InfoData = res['result'];
                    ServiceDataItem = {
                        'youji_city': [],// @我只是提前占位，现在没有任何作用
                        'shangmen_city': InfoData['shangmen_data'],
                        'daodian_city': InfoData['daodian_data'],
                        'select_list': InfoData['zy_data']['select_list'],
                        'service_list': InfoData['zy_data']['info_kv_list'],
                        //'express_shanghai': InfoData['show_shanghai_express_flags']
                        'express_not_support': {
                            '2':InfoData['show_beijing_express_flags']||{},
                            '3':InfoData['show_chengdu_express_flags']||{},
                            '4':InfoData['show_shanghai_express_flags']||{},
                            '5':InfoData['show_guangzhou_express_flags']||{}
                        }
                    };

                    window._ServiceData[service_id] = ServiceDataItem;
                    callback(ServiceDataItem);
                } else {
                    // @do nothing
                }
            });
        }
    }

    // 获取上门相关数据
    // service_id：服务大类id；
    // service_product_id：服务小类id；
    // 不支持上门返回false
    // 支持上门，但是没有文案，返回-1
    // 支持上门，并且有具体区域，返回区域文字
    function getShangmenData(service_id, service_product_id){
        var ret = false;

        var ServiceData = window._ServiceData || {};

        var CurServiceData = ServiceData[service_id];
        if (CurServiceData) {
            var city = W('[name="sm_city"]').val(),
                CurCityData = CurServiceData['shangmen_city'][city];

            // 此城市支持上门
            if (CurCityData) {
                // 此具体服务不支持上门
                if (typeof CurCityData[service_product_id]==='undefined'){
                    ret = false;
                } else {
                    ret = CurCityData[service_product_id];
                    ret = ret ? ret : -1;
                }
            }
        }

        return ret;
    }
    // 获取到店相关数据
    // service_id：服务大类id；
    // service_product_id：服务小类id；
    function getDaodianData(service_id, service_product_id){
        var ret = false;

        var ServiceData = window._ServiceData || {};

        var CurServiceData = ServiceData[service_id];
        if (CurServiceData) {
            var city = W('[name="sm_city"]').val();

            // 支持到店的城市
            if (CurServiceData['daodian_city']
                && CurServiceData['daodian_city']['city']
                && CurServiceData['daodian_city']['city'][city]){

                var CurCityData = CurServiceData['daodian_city']['city'][city];
                if (CurCityData[service_product_id] && CurCityData[service_product_id].length) {
                    var StoreIdArr = CurCityData[service_product_id],// 当前服务支持的到店地址id
                        StoreList  = CurServiceData['daodian_city']['store']; // 到店地址列表

                    var CurStoreList = [];
                    for(var i=0; i<StoreIdArr.length; i++){
                        if (StoreList[StoreIdArr[i]]){
                            CurStoreList.push(StoreList[StoreIdArr[i]]);
                        }
                    }

                    if (CurStoreList.length) {
                        ret = CurStoreList;
                    }
                }
            }
        }

        return ret;
    }
    // 获取邮寄相关数据
    // service_id：服务大类id；
    function getYoujiData(service_id){
        var ret = false;

        var ServiceData = window._ServiceData || {};

        var CurServiceData = ServiceData[service_id];
        if (CurServiceData) {
            var wSelect = W('#ServiceExtendInfo select');
            var attr_arr = [];
            wSelect.map(function(el){
                attr_arr.push(W(el).val());
            });

            var SelectedService = CurServiceData['service_list'][attr_arr.join('|')];
            if (SelectedService) {
                ret = true;
            }
        }

        return ret;
    }

    // 设置到店的地址列表
    function setDaodianSelectList(daodian_info){
        var wDaodianAddr = W('.yyinfo-box .daodian-addr');

        var html_str = '';
        if (daodian_info && daodian_info.length) {
            for(var i=0; i<daodian_info.length;i++) {
                html_str += '<label><input type="radio" name="dd_addr" value="'
                +daodian_info[i]['store_id']+'"/>'
                +daodian_info[i]['store_area']+' '+daodian_info[i]['store_address']+' '+daodian_info[i]['store_name']
                +'，联系人：'+daodian_info[i]['manager_name']+' '+daodian_info[i]['store_tel']+'</label>';
            }
        }
        wDaodianAddr.html(html_str);

        // 到店地址只有一个，默认选中
        if (daodian_info.length===1) {
            wDaodianAddr.query('[name="dd_addr"]').first().attr('checked', 'checked');
        }
    }
    // 设置当前被选中的具体服务产品信息
    function setCurProductInfo(info){
        if (info) {
            window.CurProductInfoData = info;
        }

        return window.CurProductInfoData;
    }
    // 获取当前被选中具体服务产品信息
    function getCurProductInfo(){

        return window.CurProductInfoData;
    }
    // 激活指定的服务方式（前提为此服务方式当前可用）
    function activeTargetServiceType(type) {
        var wServiceTypeRadio = W('[name="service_type"]'),
            type_arr = wServiceTypeRadio.map(function(el,i){
                return W(el).val();
            }),
            flag_fired = false

        // type在当前服务方式内
        if (type_arr.contains(type)) {
            W('.yyinfo-box').hide();
            wServiceTypeRadio.forEach(function (el) {
                var wEl = W(el),
                    val = wEl.val();
                if (type == val && !wEl.attr('disabled')){
                    flag_fired = true;
                    wEl.attr('checked', 'checked');
                    W('.yyinfo-box[data-for="' + val + '"]').show();
                    // 邮寄
                    if(val == '2'){
                        W('[name="bank_code"]').val('online');

                        resetServiceStation(true)

                    }
                    // 到店、上门
                    else {
                        W('[name="bank_code"]').val('offline')

                        resetServiceStation()

                    }
                } else {
                    wEl.removeAttr('checked');
                }
            })
        }
        if (!flag_fired) {
            W('.yyinfo-box').hide();
            wServiceTypeRadio.forEach(function (el) {
                var wEl = W(el),
                    val = wEl.val();
                // 触发第一个可用radio的click事件
                if (!flag_fired && !wEl.attr('disabled')){
                    flag_fired = true;
                    wEl.attr('checked', 'checked');
                    W('.yyinfo-box').hide();
                    W('.yyinfo-box[data-for="' + val + '"]').show();
                    // 邮寄
                    if(val == '2'){
                        W('[name="bank_code"]').val('online');

                        resetServiceStation(true)

                    }
                    // 到店、上门
                    else {
                        W('[name="bank_code"]').val('offline')
                        resetServiceStation()

                    }
                }
                else {
                    wEl.removeAttr('checked');
                }
            })

            if(!flag_fired){
                //清空邮寄地地址
                resetServiceStation()
            }
        }
    }

    // 重置服务站信息
    function resetServiceStation (flag_show) {
        flag_show = flag_show || false

        var
            service_id = W ('#ServiceExtendInfo .curr-prd-box-extendinfo').attr ('data-for'),
            fault_id = W ('[name="fault_id"]').val (),
            ServiceData = window._ServiceData || {}

        ServiceData = ServiceData[ service_id ]

        var
            express_not_support = ServiceData
                ? ServiceData[ 'express_not_support' ]
                : {}

        var
            $ServiceStation = W (".choose-stations-service"),
            $ServiceStationDetail = W (".show-stations-address")

        tcb.each(express_not_support, function(k, item){
            // 维修服务站点
            var
                $ServiceStationItem = $ServiceStation.query ('[data-id="'+k+'"]')

            if (typeof item[fault_id]!== 'undefined'&& !item[fault_id]){
                // item[fault_id]已经有数据,并且为false表示不支持,否则表示无条件支持~~[即,显示表示不支持,才不支持,否则就认定为支持]
                // 此项服务,在此维修站点不支持邮寄维修

                $ServiceStationItem.hide ()
            } else {
                $ServiceStationItem.show ()
            }
        })

        //清空邮寄地地址
        $ServiceStation.hide ()
        $ServiceStation.query (".active").removeClass ("active")
        $ServiceStationDetail.hide ()
        $ServiceStationDetail.query (".stations-to").html ("")
        W ('[name="express_station_id"]').val ("");

        if (flag_show) {
            // 是否显示

            $ServiceStation.show ()
        }
    }

    // 切换选择城市
    function selectCity(selector){

        if(!W(selector).length) return false;

        var cityPanel = new CityPanel(selector);

        cityPanel.on('close', function(e) {});

        cityPanel.on('selectCity', function(e) {


            var city = e.city.trim();

            var city_name = e.name.trim();


            W('#currCity').html( city_name ).attr('data-city', city);
            W('[name="sm_city"]').val(city);


            QW.loadJsonp('/aj/getcookiecity?citycode='+city+'&cityname='+city_name, function(data){
                //console.log(data);
            });

            // 切换城市后刷新商品信息状态
            setProductInfo();

            var cur_service_product = getCurProductInfo(),
                service_product_id = cur_service_product ? cur_service_product['id'] : '';
            // 设置服务方式状态
            setServiceTypeStatus(service_product_id);

            // 设置商品价格
            setProductPirce();

            if (window.__ShangmenDateTime && window.__ShangmenDateTime.resetRemote) {
                window.__ShangmenDateTime.resetRemote (tcb.setUrl ('/shangmen/doGetValidDate', {
                    type       : '1',
                    valid      : '7',
                    fault_type : window.__ServiceId,
                    city_name  : city_name
                }))
            }
            if (window.__DaodianDateTime && window.__DaodianDateTime.resetRemote) {
                window.__DaodianDateTime.resetRemote (tcb.setUrl ('/shangmen/doGetValidDate', {
                    type       : '3',
                    valid      : '7',
                    fault_type : window.__ServiceId,
                    city_name  : city_name
                }))
            }
        });
    }

    // 上门信息输入框初始化（设置兼容性placeholder、地址联想和时间选择组件）
    function initShangmenInfoInput(){
        // 上门地址
        if( W('.yyinfo-box-sm [name="sm_addr"]').length ){
            new PlaceHolder('.yyinfo-box-sm [name="sm_addr"]');

            new AddrSuggest('.yyinfo-box-sm [name="sm_addr"]', {
                'showNum' : 8,
                'requireCity' : function(){return W('#currCity').html().trim()||'北京';}
            });
        }
        // 上门时间
        if( W('.yyinfo-box-sm [name="sm_time"]').length ){
            new PlaceHolder('.yyinfo-box-sm [name="sm_time"]')

            window.__ShangmenDateTime = new DateTime('.yyinfo-box-sm [name="sm_time"]', {
                remote: tcb.setUrl ('/shangmen/doGetValidDate', {
                    type       : '1',
                    valid      : '7',
                    fault_type : tcb.queryUrl (window.location.search, 'fault_id'),
                    city_name : W('#currCity').html().trim()
                }),
                onSelect : function(e){ }
            });
        }
        // 上门电话
        if( W('.yyinfo-box-sm [name="buyer_mobile"]').length ){
            new PlaceHolder('.yyinfo-box-sm [name="buyer_mobile"]');
        }
        // 短信验证码
        if( W('.yyinfo-box-sm [name="sms_code"]').length ){
            new PlaceHolder('.yyinfo-box-sm [name="sms_code"]');
        }

    }
    // 到店信息输入框初始化（设置兼容性placeholder、地址联想和时间选择组件）
    function initDaodianInfoInput(){
        // 到店时间
        if( W('.yyinfo-box-dd [name="sm_time"]').length ){
            new PlaceHolder('.yyinfo-box-dd [name="sm_time"]')

            window.__DaodianDateTime = new DateTime('.yyinfo-box-dd [name="sm_time"]', {
                remote: tcb.setUrl ('/shangmen/doGetValidDate', {
                    type       : '3',
                    valid      : '7',
                    fault_type : tcb.queryUrl (window.location.search, 'fault_id'),
                    city_name : W('#currCity').html().trim()
                }),
                onSelect : function(e){ }
            })
        }
        // 到店手机
        if( W('.yyinfo-box-dd [name="buyer_mobile"]').length ){
            new PlaceHolder('.yyinfo-box-dd [name="buyer_mobile"]');
        }
        // 短信验证码
        if( W('.yyinfo-box-dd [name="sms_code"]').length ){
            new PlaceHolder('.yyinfo-box-dd [name="sms_code"]');
        }

    }
    // 邮寄信息输入框初始化（设置兼容性placeholder、地址联想和时间选择组件）
    function initYoujiInfoInput(){
        //邮寄地址
        if( W('.yyinfo-box-yj [name="sm_addr"]').length ){
            new PlaceHolder('.yyinfo-box-yj [name="sm_addr"]');

            new AddrSuggest('.yyinfo-box-yj [name="sm_addr"]', {
                'showNum' : 8,
                'requireCity' : function(){return W('#currCity').html().trim()||'北京';}
            });

            W('.yyinfo-box-yj [name="sm_addr"]').on('change', function(e){
                var $me = W(this),
                    val = $me.val();

                var
                    $tip = W('.yyinfo-box-yj .sm-addr-tip')
                if ($tip&&$tip.length){
                    if (val) {
                        $tip.show();
                    } else {
                        $tip.hide();
                    }
                }

            });
        }
        // 邮寄用户
        if( W('.yyinfo-box-yj [name="sm_receiver"]').length ){
            new PlaceHolder('.yyinfo-box-yj [name="sm_receiver"]');
        }
        // 邮寄手机
        if( W('.yyinfo-box-yj [name="buyer_mobile"]').length ){
            new PlaceHolder('.yyinfo-box-yj [name="buyer_mobile"]');
        }
        // 短信验证码
        if( W('.yyinfo-box-yj [name="sms_code"]').length ){
            new PlaceHolder('.yyinfo-box-yj [name="sms_code"]');
        }
    }

    /**
     * 检查 服务方式 是否关闭
     */
    function checkServiceTypeClosed(type){
        var CloseService = window.__CloseService || {};

        CloseService['shangmen'] = CloseService['shangmen'] || false;
        CloseService['youji']    = CloseService['youji'] || false;
        CloseService['daodian']  = CloseService['daodian'] || false;

        return CloseService[type];
    }

    function init(){

        bindEvent();

        // 解析当前url的query
        var url_query = window.location.href.queryUrl();

        if( W('.slide-box').length > 0 ){//页面1=========================
            SM.IndexPicSlider.start( url_query['stop']=='true' );

        }else if( W('#formOrder').length ){//页面2========================
            //var faultId = url_query['fault_id'];
            //var selFaulty = W('.product-list .product-item[data-id="'+faultId+'"]');
            //
            //try{
            //    if(selFaulty.length){
            //        // 检查是否有父分类
            //        var data_for = selFaulty.attr('data-for');
            //        if (data_for) {
            //            W('.product-list .product-item[data-type="'+data_for+'"]').fire('click');
            //        }
            //        selFaulty.fire('click');
            //    }else{
            //        W('.product-list .product-item').item(0).fire('click');
            //    }
            //}catch(ex){}

            initShangmenInfoInput();
            initDaodianInfoInput();
            initYoujiInfoInput();
        }

        // 选择城市
        if( W('.citypanel_trigger').length ){
            selectCity('.citypanel_trigger');
        }
    }

    init();

    function addSubCate(){

        // 获取手机回收自营数据：分热门问题、其余问题
        // '/shangmen/doGetMobileFaultList'
        QW.Ajax.get('/shangmen/aj_get_fault_group', function(res){
            res = JSON.parse(res);

            if (!res['errno']) {

                var result = res['result']

                var html_str = W('#JsOrderCate2Tpl').html().trim().tmpl()({
                    'list': result
                });

                W('.page-shangmen-order .cate-list-sub-inner').html(html_str);


                // 解析当前url的query
                var url_query = window.location.href.queryUrl();
                var faultId = url_query['fault_id'];
                var selFaulty = W('.product-list .product-item[data-id="'+tcb.html_encode(faultId)+'"]');

                try{
                    if(selFaulty.length){
                        // 检查是否有父分类
                        var data_for = selFaulty.attr('data-for');
                        if (data_for) {
                            W('.product-list .product-item[data-type="'+data_for+'"]').fire('click');
                        }
                        selFaulty.first().fire('click');
                    }else{
                        W('.product-list .product-item').item(0).fire('click');
                    }
                }catch(ex){}

            } else {
                console.log(res['errmsg']);
            }

        });

    }
    addSubCate();

});


;/**import from `/resource/js/page/shangmen/order/submit.js` **/
// 订单提交
Dom.ready (function () {
    // 提交自营订单
    if (!W('.page-shangmen-order').length) {

        return
    }

    // 下单表单
    W ('#formOrder').on ('submit', function (e) {
        e.preventDefault ();

        var wForm = W (this);

        // 表单处于不可用状态
        if (tcb.isFormDisabled(wForm)){

            return false
        }
        // 将表单置于不可用状态
        tcb.setFormDisabled(wForm)

        //var bank_code = W(this).one('.bank-code');
        //var selPay = W(this).one('[name="pay_method"]:checked').val();
        var serviceType = wForm.query ('[name="service_type"]:checked').val()
        // 验证订单表单
        if (!validOrderForm (wForm)) {

            // 释放表单的不可用状态
            tcb.releaseFormDisabled(wForm)

            return false
        }

        // 防止另外两个信息同时提交，找出其他两个隐藏的预约信息框，input框均置为disabled
        wForm.query ('.yyinfo-box').filter (function (el) {
            return !W (el).isVisible ();
        }).query ('input').attr ('disabled', true);

        // 提交预约表单
        QW.Ajax.post (this.action, this, function (rs) {
            try {
                rs = JSON.parse (rs);

                if (!rs.errno) {
                    var
                        result = rs.result,
                        url = '/shangmen/pay_succ',
                        need_pay = result[ 'need_pay' ] == '1'
                            ? true
                            : false;

                    if (need_pay) {
                        url = '/shangmen/needPay'
                    }

                    // window.location.href = url+'?order_id=' + rs.result.order_id;
                    if(serviceType == 2){
                        var
                            order_id = rs.result.order_id,

                            redirect_url = url+'?order_id=' + rs.result.order_id;
                        YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {
                            var
                                html_fn = $('#JsSMSchedulePickupPanelTpl').html().trim().tmpl(),
                                html_st = html_fn ({
                                    data : {
                                        province : '',
                                        city     : res['city_name'] || window.__CITY_NAME,
                                        area_list : res['area_list']||[],
                                        user_name   : res['user_name'],
                                        mobile   : res['default_mobile'],
                                        express_addr   : res['express_addr'],
                                        order_id : order_id,
                                        url : redirect_url
                                    }
                                })

                            var
                                DialogObj = tcb.showDialog (html_st, {
                                    className : 'schedule-pickup-panel',
                                    withClose : false,
                                    middle    : true,
                                    // onClose:function () {
                                    //     window.location.href = redirect_url
                                    // }
                                })

                            // 绑定预约取件相关事件
                            YuyueKuaidi.bindEventSchedulePickup (DialogObj.wrap, redirect_url)

                        })
                    }else{
                        window.location.href = url+'?order_id=' + rs.result.order_id;
                    }

                } else {
                    alert ("抱歉，出错了。" + rs.errmsg);

                    // 释放表单的不可用状态
                    tcb.releaseFormDisabled(wForm)
                }

                W ('.yyinfo-box input').attr ('disabled', false);
            } catch (ex) {
                W ('.yyinfo-box input').attr ('disabled', false);

                alert ("系统错误请刷新重试");

                // 释放表单的不可用状态
                tcb.releaseFormDisabled(wForm)

            }
        })

    })

    $ (function () {
        $ ('.reload_secode').on ('click', function (e) {
            $ (".secode_img").attr ('src', '/secode/?rands=' + Math.random ())
        });
    });

    // 验证订单表单数据
    function validOrderForm (wForm) {
        wForm = wForm || W ('#formOrder');

        var flag = true;
        // 服务内容扩展信息验证（服务名称/品牌/型号等）
        var wExtendinfo = wForm.query ('.curr-prd-box-extendinfo');
        if (wExtendinfo && wExtendinfo.length) {
            var wSelect = wExtendinfo.query ('select');
            wSelect.forEach (function (el) {
                var wCur = W (el);
                if (!wCur.val ()) {
                    wCur.shine4Error ();
                    flag = false;
                }
            });
        }

        // 验证服务
        var wServiceType = wForm.query ('[name="service_type"]'),
            disabled_count = 0;
        wServiceType.forEach (function (el) {
            if (W (el).attr ('disabled')) {
                disabled_count++;
            }
        });
        if (disabled_count >= wServiceType.length) {
            flag = false;

            wServiceType.ancestorNode ('label').shine4Error ();
        }

        // 验证选定的服务方式的预约信息表单
        var wServiceTypeChecked = W ('.service-type:checked');
        // 没有选中任何服务方式
        if (!wServiceTypeChecked.length) {
            if (flag) {
                wServiceType.ancestorNode ('label').shine4Error ();
            }
            flag = false;
        }
        // 上门维修
        else if (wServiceTypeChecked.val () == 1) {
            flag = validShangmenInfo (flag, wForm);
        }
        // 邮寄维修
        else if (wServiceTypeChecked.val () == 2) {
            flag = validYoujiInfo (flag, wForm);
        }
        // 到店维修
        else if (wServiceTypeChecked.val () == 3) {
            flag = validDaodianInfo (flag, wForm);
        }

        // 服务声明，显示、并且没有勾选
        var wFwsmProtocol = wForm.one ('[name="fwsm"]');
        var wFwsmProtocolLine = wFwsmProtocol.ancestorNode ('.service-agreement');
        if (wFwsmProtocolLine.isVisible () && !wFwsmProtocol.attr ('checked')) {
            wFwsmProtocolLine.shine4Error ();
            flag = false;
        }

        return flag;
    }

    // 验证上门信息
    function validShangmenInfo (flag, wForm) {
        var wAddr = wForm.one ('.yyinfo-box-sm [name="sm_addr"]'), // 上门地址
            wTime = wForm.one ('.yyinfo-box-sm [name="sm_time"]'), // 上门时间
            wMobile = wForm.one ('.yyinfo-box-sm [name="buyer_mobile"]'),// 联系电话
            wCode = wForm.one ('.yyinfo-box-sm [name="sms_code"]');// 短信验证码

        // 上门地址
        if (wAddr.val ().trim () == '') {
            wAddr.shine4Error ();
            flag = false;
        }
        // 上门时间
        if (wTime.val ().trim () == '') {
            wTime.shine4Error ();
            flag = false;
        }
        // 预约手机号
        if (!tcb.validMobile (wMobile.val ())) {
            wMobile.shine4Error ();
            flag = false;
        }
        // 短信验证码
        if (wCode.val ().trim () == '') {
            wCode.shine4Error ();
            flag = false;
        }

        return flag;
    }

    // 验证到店信息
    function validDaodianInfo (flag, wForm) {
        var wAddr = wForm.query ('.yyinfo-box-dd [name="dd_addr"]'), // 到店地址
            wTime = wForm.one ('.yyinfo-box-dd [name="sm_time"]'), // 到店时间
            wMobile = wForm.one ('.yyinfo-box-dd [name="buyer_mobile"]'), // 预约手机号
            wCode = wForm.one ('.yyinfo-box-dd [name="sms_code"]');// 短信验证码

        // 到店地址
        var wAddrSelected = wAddr.filter (function (el) {
            return W (el).attr ('checked');
        });
        if (!wAddrSelected.length) {
            wAddr.ancestorNode ('label').shine4Error ();
            flag = false;
        }
        // 到店时间
        if (wTime.val ().trim () == '') {
            wTime.shine4Error ();
            flag = false;
        }
        // 预约手机号
        if (!tcb.validMobile (wMobile.val ().trim ())) {
            wMobile.shine4Error ();
            flag = false;
        }
        // 短信验证码
        if (wCode.val ().trim () == '') {
            wCode.shine4Error ();
            flag = false;
        }

        return flag;
    }

    // 验证邮寄信息
    function validYoujiInfo (flag, wForm) {
        var wStat = wForm.one(".addr-stations"),    //维修站点
            wAddr = wForm.one ('.yyinfo-box-yj [name="sm_addr"]'), // 回寄地址
            wName = wForm.one ('.yyinfo-box-yj [name="sm_receiver"]'), // 收件人姓名
            wMobile = wForm.one ('.yyinfo-box-yj [name="buyer_mobile"]'), // 预约手机号
            wCode = wForm.one ('.yyinfo-box-yj [name="sms_code"]');// 短信验证码
        //维修站点
        if(wStat.query(".active").length === 0){
            wStat.query("li").shine4Error ();
            flag = false;
        }
        // 回寄地址
        if (wAddr.val ().trim () == '') {
            wAddr.shine4Error ();
            flag = false;
        }
        // 收件人姓名
        if (wName.val ().trim () == '') {
            wName.shine4Error ();
            flag = false;
        }
        // 预约手机号
        if (!tcb.validMobile (wMobile.val ())) {
            wMobile.shine4Error ();
            flag = false;
        }
        // 短信验证码
        if (wCode.val ().trim () == '') {
            wCode.shine4Error ();
            flag = false;
        }

        return flag;
    }

})


;/**import from `/resource/js/page/shangmen/order/succ.js` **/

!(function () {
    $(function () {

        if(!$('.page-shangmen-succ')){return}

        //下单成功页 预约快递
        $('.show-yuyue-btn').on('click',function () {

            var
                order_id = tcb.queryUrl(window.location.href)['order_id'],

                redirect_url = window.location.href
            console.log(order_id)
            YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {
                var
                    html_fn = $('#JsSMSchedulePickupPanelTpl').html().trim().tmpl(),
                    html_st = html_fn ({
                        data : {
                            province : '',
                            city     : res['city_name'] || window.__CITY_NAME,
                            area_list : res['area_list']||[],
                            user_name   : res['user_name'],
                            mobile   : res['default_mobile'],
                            express_addr   : res['express_addr'],
                            order_id : order_id,
                            url : redirect_url
                        }
                    })

                var
                    DialogObj = tcb.showDialog (html_st, {
                        className : 'schedule-pickup-panel',
                        withClose : false,
                        middle    : true,
                        // onClose:function () {
                        //     window.location.href = redirect_url
                        // }
                    })

                // 绑定预约取件相关事件
                YuyueKuaidi.bindEventSchedulePickup (DialogObj.wrap, redirect_url)

            })
        })
    })


})()

