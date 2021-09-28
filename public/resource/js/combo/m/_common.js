;/**import from `/resource/js/lib/fix_parse_json.js` **/
!function () {
    if (typeof $ !== 'undefined') {
        var __parseJSON = $.parseJSON
        $.parseJSON = function (params) {
            if (typeof params === 'string') {
                return __parseJSON(params)
            }
            return params
        }
    }
}()

!function () {
    if (typeof jQuery !== 'undefined') {
        var __parseJSON = jQuery.parseJSON
        jQuery.parseJSON = function (params) {
            if (typeof params === 'string') {
                return __parseJSON(params)
            }
            return params
        }
    }
}()

!function () {
    if (typeof QW !== 'undefined') {
        var __parseJSON = QW.JSON.parse
        QW.JSON.parse = function (params) {
            if (typeof params === 'string') {
                return __parseJSON(params)
            }
            return params
        }
    }
}()

!function () {
    if (typeof JSON !== 'undefined') {
        var __parseJSON = JSON.parse
        JSON.parse = function (params) {
            if (typeof params === 'string') {
                return __parseJSON(params)
            }
            return params
        }
    }
}()



;/**import from `/resource/js/mobile/global.js` **/
var tcb = tcb || {
    noop   : function () {},
    log : function () {
        if (window.console && typeof window.console.log=='function'){

            window.console.log.apply(console, Array.prototype.slice.call(arguments, 0))
        }
    },
    error : function () {
        if (window.console && typeof window.console.error=='function'){

            window.console.error.apply(console, Array.prototype.slice.call(arguments, 0))
        }
    },
    warn : function () {
        if (window.console && typeof window.console.warn=='function'){

            window.console.warn.apply(console, Array.prototype.slice.call(arguments, 0))
        }
    },
    $Win   : null,
    $Doc   : null,
    getWin : function () {
        this.$Win = this.$Win || $ (window)

        return this.$Win
    },
    getDoc : function () {
        this.$Doc = this.$Doc || $ (document)

        return this.$Doc
    },
    // 获取root作用域
    getRoot   : function () {
        window.Bang = window.Bang || {}

        return window.Bang
    },
    // 将k-v对添加进root作用域
    addToRoot : function (k, v) {
        var
            flag = false,
            Bang = window.Bang = window.Bang || {}

        if (typeof Bang[ k ] === 'undefined') {

            Bang[ k ] = v
            flag = true
        }

        return flag
    },
    is_android:(function(){
        var u = navigator.userAgent,
            //isiOS = !!u.match (/\(i[^;]+;( U;)? CPU.+Mac OS X/),
            isAndroid = u.indexOf ('Android') > -1 || u.indexOf ('Adr') > -1

        return isAndroid
    }()),
    // 全局的z-index
    zIndex:function(base_index){
        var
            key = 'KEY_GLOBAL_Z_INDEX',
            val = parseInt(base_index, 10) || parseInt(tcb.cache(key), 10) || 100001

        val++

        return tcb.cache(key, val)
    },
    // mix合并对象
    mix: function(dest, src, deep){
        if (tcb.isArray (src)) {
            src.unshift (dest)
            src.unshift (!!deep)
            return $.extend.apply (this, src)
        }
        return $.extend (!!deep, dest, src)
    },
    inArray: function(val, arr){
        return $.inArray(val, arr);
    },
    isArray: function(arr){
        return $.isArray(arr)
    },
    each: function(arr, fn){
        return $.each(arr, fn)
    },
    imgThumbUrl: function(url, width, height, ctype){
        width = width ||100;
        height = height || 100;
        ctype = ctype || 'dm';

        if(!url){
            return '';
        }

        if (!(url.indexOf('http://') == 0 || url.indexOf('https://') == 0)) {
            return '';
        }

        if(url.indexOf('/resource/')>-1){
            return url;
        }

        if(url.indexOf('/ss/30_105/')>-1){
            return url;
        }

        var a = document.createElement('a');
        a.href = url;

        if( !/^\/\w+\.\w+$/.test( a.pathname) ){
            return url;
        }

        try{
            return a.protocol + '//' + a.host + '/'+ctype+'/' + width + '_' + height + '_/ss/30_105/' + a.pathname.replace('/', '');
        }finally{
            a = null;
        }
    },
    // imgThumbUrl的别名
    imgThumbUrl2: function(url, width, height, ctype){
        return this.imgThumbUrl(url, width, height, ctype)
    },
    goPlace: function(dis_pos){
        window._is_anim = false;

        if (window._is_anim) {
            return ;
        }
        window._is_anim = true;
        $(window).animate({
            'scrollTop': dis_pos
        }, 300, function(){
            window._is_anim = false;
        });

    },
    showGoTop : function(){
    	var goTopBtn = $('<div class="ui-go-top">↑</div>').appendTo('body').css({
    		'position' : 'fixed',
    		'right' : '10px',
    		'bottom' : '10px',
    		'width' : '36px',
    		'height' : '36px',
    		'z-index' : '65535',
    		'background-color' : '#fff',
    		'background-clip' : 'padding-box',
    		'border-radius' : '50%',
    		'border' : '1px solid #ddd',
    		'opacity' : '0',
    		'font-size' : '20px',
    		'color' : '#999',
    		'line-height' : '30px',
    		'text-align' : 'center',
    		'box-shadow' : '1px 1px 3px #ccc',
            'display' : 'none'
    	});

    	goTopBtn.on('click', function(){
    		$('body').scrollTop(0);
    		goTopBtn.css({'opacity' : 0, 'display':'none'});
    	});

    	$(window).on('scroll load', function(){
    		if( $('body').scrollTop() > $('body').height() * 2 ){

    			if( goTopBtn.css('opacity') <= 0 ){
    				goTopBtn.css({'display':'block'}).animate({'opacity' : 1}, 300);
    			}
    		}else{
    			if( goTopBtn.css('opacity') > 0 ){
    				goTopBtn.animate({'opacity' : 0}, 300, function(){
                        goTopBtn.css({'display':'none'});
                    });
    			}
    		}
    	});
    },
    // 绑定事件，
    // [delegate]为被代理的元素，可选，为空的话直接代理在document上，
    // configs为被代理元素内的元素选择器和需要被绑定的事件的k-v映射；
    bindEvent: function(delegate, configs){
        if(arguments.length==1 && $.isPlainObject(delegate)){
            configs = delegate;
            delegate = document;
        }
        var $el = $(delegate);

        $.each(configs, function(selector, e_fn){
            if (typeof e_fn=='function') {
                var e_fn_temp = e_fn;
                e_fn = {'click': e_fn_temp};
            }
            $el.on(e_fn, selector);
        });
    },
    // 验证邮箱
    validEmail: function(m){
        m = m || '';
        var flag = false;

        // aaaa@aaa.aa.555.com.cn
        // aaaa@555.com
        // a.a@555.com
        //var r_email = /^([a-zA-Z0-9][a-zA-Z0-9_\.\-]*)+@([a-zA-Z0-9][a-zA-Z0-9\-]*)(\.[a-zA-Z0-9][a-zA-Z0-9\-]*)*(\.[a-zA-Z]{2,4})+$/; // 判断是否为邮箱
        var r_email = /^\w+([-+.]\w+)*@\w+([-.]\w+)+$/i;
        m = $.trim(m);

        if (m&&r_email.test(m)) {
            flag = true;
        }

        return flag;
    },

    // 验证手机号
    validMobile: function(m){
        m = m || '';
        var flag = false;

        var r_mobile = /^1[3456789]\d{9}$/; // 判断是否为手机号
        m = $.trim(m);

        if (m&&r_mobile.test(m)) {
            flag = true;
        }

        return flag;
    },
    // 验证是否为手机号输入格式
    validMobileInput: function(m){
        m = m || '';
        var flag = false;

        var r_mobile = /^1[3456789]\d{0,9}$/; // 判断是否为手机号
        m = $.trim(m);

        if (m&&r_mobile.test(m)) {
            flag = true;
        }

        return flag;
    },
    // 错误闪烁
    errorBlink: function($el, th){
        if (!($el&&$el.length)) {
            return ;
        }
        window.ThList = window.ThList ? window.ThList : {};

        if (th) {
            clearInterval(th);
        }

        $el.addClass('errorblink');

        var c = 0, k = Math.random();
        ThList[k] = setInterval(function(){
            if (c % 2) {
                $el.removeClass('errorblink');
            } else {
                $el.addClass('errorblink');
            }
            c = c +1;
            if(c > 9){
                clearInterval(ThList[k]);
                c = 0;
            }
        }, 180);

        return ThList[k];
    },
    // 清除错误闪烁
    clearErrorBlink: function(){
        window.ThList = window.ThList ? window.ThList : {};

        $.each(window.ThList, function(k, v){
            clearInterval(v);
        });

        window.ThList = {};
    },
    queryUrl: function(url, key){
        return $.queryUrl(url, key);
    },
    // 根据url和参数params，重组URL
    setUrl: function (url, params) {
        var rs = '',
            args = Array.prototype.slice.apply(arguments)

        url = args.shift()

        // 处理params
        tcb.each(args, function(i, param){
            if(typeof param==='string'){
                try{
                    param = param.charAt(0)=='{' ? param : '{'+param+'}'
                    param = $.parseJSON(param)
                }catch (ex){
                    param = {}
                }
                args[i] = param
            }
        })
        params = tcb.mix({}, args, true)

        if (typeof url == 'string' && url) {
            //if (typeof params === 'string') {
            //    try {
            //        params = params.charAt(0) == '{' ? params : '{' + params + '}';
            //        params = $.parseJSON(params);
            //    } catch (ex) {
            //    }
            //}

            if ($.isPlainObject(params)) {
                var parse_url = $.queryUrl(url.split('#')[0]);

                $.each(params, function (k, v) {
                    if (v) {
                        if (typeof v == 'object') {
                            // 数组，直接取最后一个作为参数值
                            if ($.isArray(v)) {
                                parse_url[k] = v[v.length-1];
                            } else {
                                $.each(v, function (kk, vv) {
                                    parse_url[k][kk] = vv;
                                });
                            }
                        } else {
                            parse_url[k] = v;
                        }
                    } else {
                        if (typeof parse_url[k] !== 'undefined')
                            delete parse_url[k];
                    }
                });

                parse_url = $.param(parse_url);
                var query_pos = url.indexOf('?'),
                    hash_pos = url.indexOf('#');

                var urlArr = ['', '', '']
                if (parse_url) {
                    urlArr[1] = '?' + parse_url
                }
                if (query_pos > -1) {
                    if (hash_pos > -1) {
                        urlArr[2] = url.substring(hash_pos)
                        if (query_pos < hash_pos) {
                            urlArr[0] = url.substring(0, query_pos)
                        } else {
                            urlArr[0] = url.substring(0, hash_pos)
                        }
                    } else {
                        urlArr[0] = url.substring(0, query_pos)
                    }
                } else if (hash_pos > -1) {
                    urlArr[0] = url.substring(0, hash_pos)
                    urlArr[2] = url.substring(hash_pos)
                } else {
                    urlArr[0] = url
                }
                rs = urlArr.join('')
            } else {
                rs = url;
            }
        }

        return rs;
    },
    // 根据url和参数params，重组URL
    // 若有window.__MUST_PASS_PARAMS参数，将此参数也加入URL之中
    // except表示要被干掉的参数，格式为 string 或者 array
    setUrl2 : function (url, params, except) {
        var rs = url

        if ($.isPlainObject (window.__MUST_PASS_PARAMS)) {
            rs = tcb.setUrl (rs, window.__MUST_PASS_PARAMS)
        }
        rs = tcb.setUrl (rs, params)

        if (except){
            var except_map = {}
            except = typeof except==='string' ? [except] : except
            if (except instanceof Array){
                for (var i=0;i<except.length;i++){
                    if (typeof except[i]==='string'){
                        except_map [ except[i] ] = ''
                    }
                }
            }
            rs = tcb.setUrl(rs, except_map)
        }

        return rs
    },
    // 获取一个开头不带#号的hash串
    getPureHash: function(hash){
        hash = hash || window.location.hash;
        // 过滤掉左边所有的#号
        for(var i= 0; i<hash.length;i++){
            if(hash.charAt(0)=='#'){
                hash = hash.substring(1);
            } else {
                break;
            }
        }
        return hash;
    },
    // 解析query串格式的hash串
    parseHash: function(pure_hash){
        var params = {};
        pure_hash = pure_hash ? this.getPureHash(pure_hash) : this.getPureHash(window.location.hash);

        // 选择服务
        pure_hash = pure_hash.split('&');
        if(pure_hash&&pure_hash.length){
            $.each(pure_hash, function(i,v){
                v = v.split('=');
                if(v[0]){
                    params[v[0]] = typeof v[1]==='undefined' ? '' : v[1];
                }
            });
        }
        return params;
    },
    // 使用优惠码，相关事件和方法
    // options的参数：
    //      url,          验证URL
    //      service_type, 优惠码类型：
    //                        1：自营 ，
    //                        2：回收，
    //                        3：优品，
    //      price,        商品价格
    //      product_id,   商品id
    //      wWrap,        优惠码wrap
    //      succ,         验证优惠码成功后回调
    //      fail,         优惠码验证失败
    usePromo: function(input_options){
        var options = tcb.mix({
            'url': '/aj/doGetYouhuiAmount',
            'service_type': '',
            'price': 0,
            'product_id': '',
            'request_params': {},
            'wWrap': '.use-promo-wrap',
            'succ': function(){},
            'fail': function(){},
            'onActive': function(){}
        }, input_options, true);

        options.request_params = options.request_params || {}

        var $wrap = $(options['wWrap'] || '.use-promo-wrap');
        if( !($wrap&&$wrap.length) ){
            return;
        }

        var $UsePromoTrigger = $wrap.find('.use-promo'),
            $YouhuiCode      = $wrap.find('[name="youhui_code"]'),
            $YouhuiCodeSelect= $wrap.find('.promo-sel-list');

        if($YouhuiCode && $YouhuiCode.length){
            $YouhuiCode.each(function(i, el){
                var $el = $(el);

                var params = {
                    request_params : {
                        service_type : options['service_type'],
                        price: options['price']||0,
                        product_id: options['product_id']
                    },
                    wWrap : options['wWrap'] || '.use-promo-wrap',
                    succ: options['succ'],
                    fail: options['fail']
                }
                tcb.mix(params.request_params, options.request_params, true)
                validPromoCode($el, params);
            });
        }

        //使用优惠码
        $UsePromoTrigger.on('click', function(e){
            e.preventDefault();
            $(this).hide().siblings('.promo-box').show();

            if(typeof options['onActive']==='function') {
                options['onActive']($wrap);
            }
        });
        // 验证优惠码有效性
        $YouhuiCode.on('change input', function(e){
            var $me = $(this)

            var params = {
                request_params : {
                    service_type : options['service_type'],
                    price: options['price']||0,
                    product_id: options['product_id']
                },
                wWrap : options['wWrap'] || '.use-promo-wrap',
                succ: options['succ'],
                fail: options['fail']
            }
            tcb.mix(params.request_params, options.request_params, true)
            validPromoCode($me, params);
        });
        // 选择优惠码
        $YouhuiCodeSelect.on('change', function(e){
            var $me = $(this),
                $YouhuiCode = $me.siblings('[name="youhui_code"]'),
                proCode = $me.val();
            if(proCode&&$YouhuiCode.val()!=proCode){
                $YouhuiCode.val( proCode ).trigger('change');
            }
        });
        /**
         * 验证优惠码
         *
         * @param $obj      优惠码的input
         * @param options
         *          service_type : options['service_type'] // 使用优惠码的产品类型，1：自营 ，2：回收，3：优品
         *          price: options['price']||0,
         *          product_id: options['product_id'],
         *          succ: options['succ'],
         *          fail: options['fail']
         */
        function validPromoCode($obj, options){
            var code      = $obj.val(),/*优惠码*/
                $cur_wrap = $obj.closest(options['wWrap'] || '.use-promo-wrap');

            if(!code){
                if(typeof options['fail']==='function') {
                    options['fail']($cur_wrap);
                }
                var default_text = $cur_wrap.find('.promoYZ').attr('data-default-text') || ''
                $cur_wrap.find('.promoYZ').html(default_text).removeClass('promo-fail').removeClass('promo-succ');
                return;
            }

            // service_type：1：自营 ，2：回收，3：优品
            var params = {
                'youhui_code': code
            }
            tcb.mix(params, options.request_params, true)
            $.post(options['url']||'/aj/doGetYouhuiAmount', params, function(rs){
                try{
                    rs = $.parseJSON(rs);
                }catch(ex){ rs = {errno: 'error'}; }

                if( rs.errno ){
                    var errmsg = '抱歉，'+(rs.errmsg?rs.errmsg+'，':'')+'优惠码验证失败。';//rs.errmsg? '抱歉，'+rs.errmsg : '抱歉，优惠码验证失败。';
                    if (params.service_type=='2'){
                        errmsg = '抱歉，'+(rs.errmsg?rs.errmsg.replace('优惠码', '增值码')+'，':'')+'增值码验证失败。'
                    }
                    $cur_wrap.find('.promoYZ').html(errmsg).removeClass('promo-succ').addClass('promo-fail');

                    if(typeof options['fail']==='function') {
                        options['fail']($cur_wrap);
                    }
                }else{
                    var promo_amount = rs.result['promo_amount'] || 0, // 优惠价格
                        promo_per    = rs.result['promo_per'] || 0;    // 折扣量
                    // 折扣优先
                    if (promo_per) {
                        promo_amount = {
                            'promo_per': promo_per
                        }
                    }

                    var
                        min_sale_price = parseFloat(rs.result['full_cut']) || 0 // 最小折扣价

                    if(typeof options['succ']==='function'){
                        options['succ'](promo_amount, min_sale_price, $cur_wrap);
                    }
                }
            });
        }

        // 刷新优惠码验证
        function refreshPromoCode(){
            $YouhuiCode.trigger('change');
        }
        // 设置商品价格
        function setPrice(price){
            options['price'] = price;
        }
        // 设置商品id
        function setProductId(product_id){
            options['product_id'] = product_id;
        }

        return {
            oWrap: $wrap,
            setPrice: setPrice,                // 设置商品价格
            setProductId: setProductId,        // 设置商品id
            refreshPromoCode: refreshPromoCode // 刷新优惠码验证
        };
    },
    //去除str结尾的char字符
    stripLastCharAt: function (char, str){
        (function(){
            if(str[str.length-1]===char){
                str = str.substring(0, str.length-1);

                arguments.callee(char, str);
            }
        }());

        return str;
    },
    // 去除str首尾所有的char字符,char若被省略或为空,则去除空格
    trim: function(str, char){
        str = str == null ? '' : ( str + '' );

        if (!char) {
            // 确保去除 BOM 和 NBSP
            var reg_trim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
            return str.replace( reg_trim, '' );
        }

        var reg_trim_char = new RegExp('^['+char+']+|['+char+']+$', 'g');
        return str.replace( reg_trim_char, '' );
    },
    // 判断arr是不是包含item
    arrContains: function(arr, item) {
        var i = arr.length;
        while(i--){
            if(arr[i]===item){
                return true;
            }
        }
        return false;
    },
    showDialogTimeHandler: null,
    // 显示dialog弹窗
    showDialog: function(content, options){
        if (this.showDialogTimeHandler) {
            clearTimeout(this.showDialogTimeHandler)
            this.showDialogTimeHandler = null
            $('#DialogWrap').remove()
        }
        var classes = '',
            withClose = true,
            flag_middle = false,
            fromBottom = false,
            top = 20,
            left = 10,
            onClose = function(){}
        if (typeof options==='string') {
            classes = options;
            options = {
                'className': classes,
                'withClose': withClose,
                'middle': flag_middle,
                'fromBottom': fromBottom,
                'top': top,
                'left': left,
                'onClose': function(){}
            };
        } else {
            options = options || {};
            classes = (typeof options['className'] != 'undefined' && options['className']) ? options['className'] : classes;
            withClose = (typeof options['withClose'] != 'undefined') ? options['withClose'] : withClose;
            flag_middle = (typeof options['middle'] != 'undefined') ? options['middle'] : flag_middle;
            fromBottom = (typeof options['fromBottom'] != 'undefined') ? options['fromBottom'] : fromBottom;
            top = (typeof options['top'] != 'undefined') ? parseFloat(options['top']) : top;
            left = (typeof options['left'] != 'undefined') ? parseFloat(options['left']) : left;
            onClose = (typeof options['onClose'] == 'function') ? options['onClose'] : onClose;
        }
        var $mask = $('#DialogMask');
        if (!$mask.length) {
            $mask = $('<a class="dialog-mask" id="DialogMask"></a>');
            $mask.appendTo('body');

            if (withClose) {
                $mask.on('click', function(e){
                    e.preventDefault();

                    tcb.closeDialog();

                    typeof onClose=='function' && onClose()
                });
            }
        }
        var mask_h = $('body').height(),
            $win = tcb.getWin(),
            win_h = $win.height()
        $mask.css({
            'height': mask_h<win_h ? win_h : mask_h
        });
        var $wrap = $('#DialogWrap');
        if (!$wrap.length) {
            var class_str = '';
            var close_str = '';
            if (withClose) {
                close_str += '<a href="#" class="iconfont dialog-close"></a>';
            }
            if (fromBottom) {
                class_str += ' dialog-wrap-from-bottom'
            }
            if (classes) {
                class_str += ' ' + classes
            }
            var wrap_str = '<div class="dialog-wrap'+class_str+'" id="DialogWrap">'+close_str+'<div class="dialog-inner"></div></div>';
            $wrap = $(wrap_str);
            $wrap.appendTo('body');

            $wrap.find('.dialog-close').on('click', function(e){
                e.preventDefault();

                tcb.closeDialog();

                typeof onClose=='function' && onClose()
            });
        }
        $wrap.find('.dialog-inner').html(content);

        if (fromBottom) {
            $wrap.css('bottom', -$wrap.height())
            setTimeout(function () {
                $wrap.addClass('dialog-wrap-from-bottom-transition')
                setTimeout(function () {
                    $wrap.css({
                        'opacity': 1,
                        'bottom': ''
                    })
                }, 0)
            }, 0)
        }else if (flag_middle){
            // 垂直居中显示

            tcb.setElementMiddleScreen($wrap, left, top)
        } else {
            $wrap.css({
                'top': $(window).scrollTop() + top,
                'left': left
            })
        }

        tcb.js2AndroidSetDialogState(true, function(){
            tcb.closeDialog()
        })

        return {
            mask: $mask,
            wrap: $wrap
        }
    },
    // 关闭dialog弹窗
    closeDialog: function (dialogInst) {
        if (!(dialogInst
            && dialogInst.mask && dialogInst.mask.length
            && dialogInst.wrap && dialogInst.wrap.length)) {
            dialogInst = {
                mask: $('#DialogMask'),
                wrap: $('.dialog-wrap')
            }
        }
        if (!(dialogInst.mask.length && dialogInst.wrap.length)) {
            return
        }

        tcb.js2AndroidSetDialogState(false)

        if (dialogInst.wrap.length === $('.dialog-wrap').length) {
            dialogInst.mask.remove()
        }
        if (dialogInst.wrap.hasClass('dialog-wrap-from-bottom')) {
            dialogInst.wrap.css({
                'bottom': -dialogInst.wrap.height() * .6,
                'opacity': 0
            })
            this.showDialogTimeHandler = setTimeout(function () {
                dialogInst.wrap.remove()
                this.showDialogTimeHandler = null
            }, 200)
        } else {
            dialogInst.wrap.remove()
        }
    },
    setElementMiddleScreen: function(el, padding_x, padding_y){
        padding_x = padding_x||0
        padding_y = padding_y||0

        var $el = $ (el),
            $win = $ (window),
            h = $el.height (),
            w = $el.width (),
            win_h = $win.height (),
            win_w = $win.width (),
            s_top = $win.scrollTop ()

        if ((padding_x*2+w)>win_w){
            w = win_w-padding_x*2
        }

        if ((padding_y*2+h)>win_h){
            h = win_h-padding_y*2
        }

        var top = (win_h - h) / 2 + s_top,
            left = (win_w - w) / 2
        //top = top > 25 ? top : 25
        left = left ? left : 0

        $el.css ({
            top  : top,
            //bottom  : top,
            left : left,
            right : left,
            width: w,
            height: h
        })

    },
    // 模拟alert弹层
    alert: function(content, callback){

        tcb.showDialog(content);
    },
    // 格式化钱
    formatMoney: function(money, place, flag) {
        var ret = money;
        money = parseFloat(money)||0;
        flag = typeof flag==='undefined' ? 0 : flag;

        if (place!==0&&place!=='0') {
            place = parseInt(place, 10) || 2;
        }
        var num = Math.pow(10, place);

        if (!place && flag>0) {
            // 向上舍入
            ret = Math.ceil(money*num)/num;
        }
        else if (!place && flag<0) {
            //向下舍入
            ret = Math.floor(money*num)/num;
        }
        else {
            // 四舍五入
            ret = Math.round(money*num)/num;
        }

        return ret;
    },
    // 校验身份证号码
    validIDCard : function(card) {
        var flag = true;

        //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
        var reg = /(^\d{15}$)|(^\d{17}(\d|X)$)/;
        if(reg.test(card) === false) {
            flag = false;
        }

        return flag;
    },
    /**
     * 简易判断是否真实跳转的页面URL
     * @param url
     * @returns {boolean}
     */
    isRealUrl: function(url){

        // 空URL
        if(!url){
            return false;
        }
        // javascript:协议开头的URL
        if(url.indexOf('javascript:')==0){
            return false;
        }
        // tel:协议开头的URL
        if(url.indexOf('tel:')==0){
            return false;
        }
        // #开头的URL
        if(!url.split('#')[0]){
            return false;
        }

        return true;
    },
    // 倒计时数秒
    distimeAnim: function(time, callback){
        if(time<=0 ){  return ;}
        var distimeAnimTimerHandler = tcb.cache('distimeAnimTimerHandler') || []

        distimeAnimTimerHandler[distimeAnimTimerHandler.length] = setInterval( function(){
            time --;
            callback && callback(time)
            if(time <=0 ){
                var timerHandler = tcb.cache('distimeAnimTimerHandler').pop()
                clearInterval(timerHandler)
            }
        }, 1000)

        tcb.cache('distimeAnimTimerHandler', distimeAnimTimerHandler)

        return distimeAnimTimerHandler[distimeAnimTimerHandler.length-1]
    },
    // 清除倒计时数秒
    clearDistimeAnim: function(timerHandler){
        if (!timerHandler){
            var distimeAnimTimerHandler = tcb.cache('distimeAnimTimerHandler')
            if (distimeAnimTimerHandler && distimeAnimTimerHandler.length){
                timerHandler = distimeAnimTimerHandler.pop()

                tcb.cache('distimeAnimTimerHandler', distimeAnimTimerHandler)
            }
        }

        timerHandler && clearInterval(timerHandler)
    },
    // 生成随机数
    genRandomNum: function(len) {
        len = len ? len : 6;

        var num = "";
        for (var i = 0; i < len; i++) {
            num += Math.floor(Math.random() * 10);
        }

        return num;
    },
    // 通用cache方法
    cache: function(key, val){
        window.__Cache = window.__Cache || {};

        if (typeof val !== 'undefined') {
            window.__Cache[key] = val;
        }

        return window.__Cache[key];
    },
    // 预加载图片
    preLoadImg: function(img_arr, delay) {
        img_arr = img_arr || [];
        if (typeof img_arr === 'string') {
            img_arr = [img_arr];
        }
        if ( !(img_arr instanceof Array) ) {
            img_arr = [img_arr.toString()];
        }

        delay = delay || 1; // 毫秒

        // 加载图片
        setTimeout(function(){

            $.each(img_arr, function(i, val){

                var img = new Image();
                img.src = val;

            });
        }, delay);

    },
    // 懒加载图片
    lazyLoadImg: function(options, $target) {
        if (typeof options==='number') {
            options = {
                'delay': options
            }
        }
        options = options || {};

        options = $.extend({
            'delay': 1,
            'interval': 0 // 0:同时显示，其他时间表示实际时间间隔
        }, options);

        var delay = options['delay'] || 1, // 毫秒
            interval = options['interval'] || 0; // 图片加载顺序间隔

        var _time = 0;
        setTimeout(function(){

            var $img;
            if ($target && $target.length){
                var $target_img = $target.filter(function(i){
                    return this.nodeType==1 && this.tagName.toLowerCase() === 'img';
                });
                if ($target_img && $target_img.length){
                    if ($target_img.length===$target.length){
                        $img = $target_img;
                    } else {
                        $img = $target.find('img').concat($target_img);
                    }
                } else {
                    $img = $target.find('img');
                }
            } else {
                $img = $('img');
            }

            $img.each(function(i, el){
                var $el = $(el),
                    src_holder = $el.attr('src'),
                    src = $el.attr('data-lazysrc');

                if (tcb.isRealUrl(src) && src_holder!==src) {
                    if (interval) {
                        setTimeout(function(){

                            $el.css({
                                'opacity': 0
                            });
                            $el.attr('src', src).removeAttr('data-lazysrc');
                            $el.animate({
                                'opacity': 1
                            }, interval);

                        }, _time);

                        _time += interval;
                    } else {

                        $el.css({
                            'opacity': 0
                        });
                        $el.attr('src', src).removeAttr('data-lazysrc');
                        $el.animate({
                            'opacity': 1
                        }, 300);

                    }
                }
            });

        }, delay);
    },
    // 懒加载指定元素内,进入viewport中的图片
    lazyLoadImgInViewPort: function($wrap, diff){
        if (!($wrap && $wrap.length)) {
            return
        }
        // 上下差值
        diff = Math.abs (parseInt (diff, 10) || 10)

        var
            $img = $wrap.find ('[data-lazysrc]'),
            screenHeight = window.innerHeight,
            scrollY = window.scrollY

        if (!($img && $img.length)) {
            return
        }

        $img.each (function (i, el) {
            var
                $el = $ (this),
                lazy_src = $el.attr ('data-lazysrc'),
                offset = $el.offset (),
                el_top = offset.top,
                el_bot = offset.top + offset.height

            if (!lazy_src){
                // lazy load的地址为空，不做后续处理
                return
            }
            var // 在屏幕之内,包括diff的差值
                isInViewPort = !(el_top > screenHeight + scrollY + diff || el_bot < scrollY - diff)
            if (isInViewPort) {
                $el.attr ('src', lazy_src).removeAttr ('data-lazysrc')
            }
        })

    },

    // 图片加载完成回调
    imageOnload :function (img_src, callback, crossOrigin){
        var
            flag = false,
            _imgObj = new Image()
        if (crossOrigin){
            _imgObj.setAttribute('crossOrigin', 'anonymous')
        }

        // 图片加载完成，获取图片宽高
        _imgObj.onload = function(){
            if (flag){
                return
            }

            flag = true

            typeof callback === 'function' && callback(_imgObj);
        }
        //_imgObj.src = img_src

        // 此处补充加上setTimeout循环获取图片高宽，
        // 是为了避免有些图片比较大onload完成时间较长（或者某些当图片加载过了cache后不再onload），
        // 而图片的尺寸信息，在图片加载完成之前的某个时间点就可以获取到，这样就可以提前获取到图片的尺寸
        setTimeout(function(){
            if (flag){
                return
            }
            //console.log(_imgObj.complete)
            //console.log(_imgObj.width)
            // 获取到图片宽度～即认为图片已经加载完成
            //if (_imgObj.width) {
            if (_imgObj.complete) {/* && _imgObj.naturalWidth && _imgObj.naturalHeight*/
                flag = true

                typeof callback === 'function' && callback(_imgObj);
            }
            else {
                setTimeout(arguments.callee, 50);
            }
        }, 50)

        _imgObj.src = img_src

    },

    // 根据图片地址，获取其宽高尺寸，然后执行回调函数;
    getImageSize: function(img_src, callback) {
        var has_got_size = false;
        var orig_width, orig_height;

        var _imgObj = new Image();
        // 图片加载完成，获取图片宽高
        _imgObj.onload = function(){
            if (has_got_size) {
                return ;
            }
            // 获取图片的原始高宽;
            orig_width  = _imgObj.width;
            orig_height = _imgObj.height;
            if (orig_width) {
                has_got_size = true;
                typeof callback === 'function' && callback(orig_width, orig_height);
            }
        };
        _imgObj.src = img_src;

        // 此处补充加上setTimeout循环获取图片高宽，
        // 是为了避免有些图片比较大onload完成时间较长（或者某些当图片加载过了cache后不再onload），
        // 而图片的尺寸信息，在图片加载完成之前的某个时间点就可以获取到，这样就可以提前获取到图片的尺寸
        setTimeout(function(){
            if (has_got_size) {
                return ;
            }
            // 获取图片的原始高宽;
            orig_width  = _imgObj.width;
            orig_height = _imgObj.height;
            if (orig_width) {
                has_got_size = true;
                typeof callback === 'function' && callback(orig_width, orig_height);
            }
            else {
                setTimeout(arguments.callee, 50);
            }
        }, 50);
    },
    // 设置img元素到合适的尺寸
    setImgElSize: function(wImg, width, height, no_force) {
        if ( !(wImg && wImg.length)) {
            return ;
        }

        wImg.forEach(function(el, i){
            var wEl = $(el),
                src = wEl.attr('src');

            // 获取图片原始尺寸，然后根据原始宽高，设置元素等比宽高
            tcb.getImageSize(src, function(orig_width, orig_height){
                var w_ratio = width/orig_width,
                    h_ratio = height/orig_height;

                var n_width, n_height;

                if (w_ratio>1 && h_ratio>1 && no_force) { /*no_force 图片原始尺寸的宽高均小于目标尺寸的宽高，并且非强制缩放标识为true*/
                    n_width = orig_width;
                    n_height = orig_height;
                } else {
                    // 预设尺寸和原始尺寸宽度比，大于 高度比，
                    // 则表示预设尺寸宽度被拉伸，那么宽度应该设置为auto，高度设置为预设高度；
                    // 反之亦然；
                    if (w_ratio>h_ratio) {
                        //n_width = 'auto';
                        n_width  = orig_width*h_ratio;
                        n_height = height;
                    } else {
                        n_width  = width;
                        //n_height = 'auto';
                        n_height = orig_height*w_ratio;
                    }
                }

                wEl.css({
                    'width' : n_width,
                    'height': n_height
                });

            });
        });
    },
    // 读取本地文件，转化成base64文件
    // 【此方法只有在特定情况下，客户端开启来读取权限，才能正常读取并转化本地文件】
    getLocalFileToBase64: function (options) {
        options = options || {}
        // alert(JSON.stringify(options))
        var filePath = options.path
        // alert(JSON.stringify(filePath))
        if (!filePath) {
            return
        }
        var xhr = new XMLHttpRequest()
        // xhr.open('GET', filePath, true)
        xhr.open('GET', filePath, false)
        xhr.overrideMimeType('text/plain; charset=x-user-defined')
        xhr.onreadystatechange = function (e) {
            // alert('onreadystatechange')
            // alert(xhr.readyState)
            // alert(xhr.status)
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status == 0)) {
                var binStr = xhr.responseText
                // alert(binStr)
                // alert(xhr.response)
                // alert(JSON.stringify(xhr))
                // for (var i = 0, len = binStr.length; i < len; ++i) {
                //     var c = binStr.charCodeAt(i)
                //     //String.fromCharCode(c & 0xff);
                //     var byte = c & 0xff  // byte at offset i
                // }
            }
        }
        // xhr.responseType = 'blob'
        // xhr.onload = function (e) {
        //     alert(JSON.stringify(this.status))
        //     if (this.status == 200 || this.status == 0) {
        //         alert(JSON.stringify(this.response))
        //
        //         var reader = new FileReader()
        //         reader.onload = function (event) {
        //             alert('success')
        //             var res = event.target.result
        //             typeof options.success === 'function' && options.success(res)
        //         }
        //         reader.onerror = function (err) {
        //             alert('err')
        //             alert(JSON.stringify(err))
        //             typeof options.fail === 'function' && options.fail(err)
        //         }
        //         var file = this.response
        //         reader.readAsDataURL(file)
        //     }
        // }
        xhr.onerror = function (err) {
            // alert('xhr-err')
            // alert(JSON.stringify(err))
            // for (var k in err) {
            //     alert(JSON.stringify(err[k]))
            // }
        }
        xhr.send()
    },
    // 向左滑动
    swipeLeft: function($el){

    },
    // 向右滑动
    swipeRight: function($el){

    },
    // 统计api使用
    statistic: function(params){
        var
            api_list = [
                '_trackPageview',
                '_trackEvent',
                '_setCustomVar',
                '_setAccount',
                '_setAutoPageView',
                '_deleteCustomVar'
            ]

        params = params || []
        _czc = typeof _czc==='undefined' ? [] : _czc

        if ( tcb.inArray ( params[ 0 ], api_list ) > -1 ) {
            _czc.push ( params )
        }

    },
    // 是否微信
    isWeChat: (function (){
        var ua = window.navigator.userAgent.toLowerCase()
        if(ua.match(/MicroMessenger/i) == 'micromessenger'){
            return true
        } else {
            return false
        }
    }()),
    setTranslateAndZoom : (function (global) {

        var docStyle = document.documentElement.style;

        var
            engine
        if (global.opera && Object.prototype.toString.call (opera) === '[object Opera]') {
            engine = 'presto';
        } else if ('MozAppearance' in docStyle) {
            engine = 'gecko';
        } else if ('WebkitAppearance' in docStyle) {
            engine = 'webkit';
        } else if (typeof navigator.cpuClass === 'string') {
            engine = 'trident';
        }

        var vendorPrefix = {
            trident : 'ms',
            gecko   : 'Moz',
            webkit  : 'Webkit',
            presto  : 'O'
        }[ engine ];

        var helperElem = document.createElement ("div");
        var undef;

        var perspectiveProperty = vendorPrefix + "Perspective";
        var transformProperty = vendorPrefix + "Transform";

        if (helperElem.style[ perspectiveProperty ] !== undef) {

            return function (el, left, top, zoom) {
                el.style[ transformProperty ] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
            };

        } else if (helperElem.style[ transformProperty ] !== undef) {

            return function (el, left, top, zoom) {
                el.style[ transformProperty ] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';
            };

        } else {

            return function (el, left, top, zoom) {
                el.style.marginLeft = left
                    ? (-left / zoom) + 'px'
                    : '';
                el.style.marginTop = top
                    ? (-top / zoom) + 'px'
                    : '';
                el.style.zoom = zoom || '';
            }

        }
    } (this)),
    isAutoOrientated: undefined,
    isCheckingAutoOrientated: false,
    checkAutoOrientatedCallbackQueue: [],
    checkAutoOrientated: function (callback) {
        if (typeof tcb.isAutoOrientated !== 'undefined') {
            return callback(tcb.isAutoOrientated)
        }
        tcb.checkAutoOrientatedCallbackQueue.push(callback)
        if (tcb.isCheckingAutoOrientated) {
            // 因为结果是异步获取的过程，
            // 此逻辑避免可能出现的多次同时请求
            return
        }
        tcb.isCheckingAutoOrientated = true
        var testImageURL =
            'data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAA' +
            'AAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA' +
            'QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE' +
            'BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAIAAwMBEQACEQEDEQH/x' +
            'ABRAAEAAAAAAAAAAAAAAAAAAAAKEAEBAQADAQEAAAAAAAAAAAAGBQQDCAkCBwEBAAAAAAA' +
            'AAAAAAAAAAAAAABEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AG8T9NfSMEVMhQ' +
            'voP3fFiRZ+MTHDifa/95OFSZU5OzRzxkyejv8ciEfhSceSXGjS8eSdLnZc2HDm4M3BxcXw' +
            'H/9k='
        var img = document.createElement('img')
        img.onload = function () {
            tcb.isCheckingAutoOrientated = false
            tcb.isAutoOrientated = img.width === 2 && img.height === 3
            console.log('是否已经自动校正旋转：' + JSON.stringify(tcb.isAutoOrientated))
            while (tcb.checkAutoOrientatedCallbackQueue.length) {
                var shiftCallback = tcb.checkAutoOrientatedCallbackQueue.shift()
                shiftCallback(tcb.isAutoOrientated)
            }
        }
        img.onerror = function () {
            tcb.isCheckingAutoOrientated = false
        }
        img.src = testImageURL
    },
    // 开始加载
    loadingStart: function(){
        var loading = $ ('.loading-anim')

        if (loading.length == 0) {

            loading = $ ('<div class="loading-anim"></div>').appendTo (document.body).css ({
                'position'        : 'absolute',
                'z-index'         : '999999',
                'width'           : '.24rem',
                'height'          : '.24rem',
                'background'      : 'url(https://p.ssl.qhimg.com/t015f3d5ddf0e5a1b71.png) no-repeat center',
                'background-size' : '.24rem'
            })
        }

        loading.find ('.loading-anim').css ({
            '-webkit-transform' : 'rotate(0)',
            'transform'         : 'rotate(0)'
        })

        tcb.setElementMiddleScreen (loading)

        setTimeout (function () { loading.animate ({ 'rotate' : '360000deg' }, 1000 * 1400) }, 100);

        return loading
    },
    // 加载完成
    loadingDone: function(){
        var loading = $ ('.loading-anim')

        if(loading&&loading.length){
            loading.remove()
        }
    },
    closeRestNoticeBlock: function(e){
        e.preventDefault()

        $('.block-big-rest-notice').hide()
        $('.trigger-show-big-rest-notice').show()

        $.fn.cookie('hide-block-big-rest-notice', '1',{path:'/', expires: 30})
    },
    showRestNoticeBlock: function(e){
        e.preventDefault()

        $('.block-big-rest-notice').show()
        $('.trigger-show-big-rest-notice').hide()

        $.fn.cookie('hide-block-big-rest-notice', '',{path:'/', expires: 30})
    },
    // html编码
    html_encode: function(str){
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&/g, "&amp;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/ /g, "&nbsp;");
        s = s.replace(/\'/g, "&#39;");
        s = s.replace(/\"/g, "&quot;");
        s = s.replace(/\n/g, "<br>");
        return s;
    },
    // html解码
    html_decode: function(str){
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&amp;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#39;/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        s = s.replace(/<br>/g, "\n");
        return s;
    },
    // 检查当前浏览器是否支持指定的css属性
    supportCss: (function() {
        var
            div = document.createElement('div'),
            vendors = 'Ms O Moz Webkit'.split(' '),
            len = vendors.length

        return function(prop) {
            if ( prop in div.style ) return true

            prop = prop.replace(/^[a-z]/, function(val) {
                return val.toUpperCase();
            })

            while(len--) {
                if ( vendors[len] + prop in div.style ) {
                    return true
                }
            }
            return false
        }
    })(),
    // 检查是否支持sessionStorage
    supportSessionStorage : function () {
        var testKey = 'test',
            storage = window.sessionStorage;
        try {
            storage.setItem (testKey, 'testValue')
            storage.removeItem (testKey)
            return true
        } catch (error) {
            return false
        }
    },
    // 检查是否支持localStorage
    supportLocalStorage : function () {
        var testKey = 'test',
            storage = window.localStorage;
        try {
            storage.setItem (testKey, 'testValue')
            storage.removeItem (testKey)
            return true
        } catch (error) {
            return false
        }
    },
    runDelay: function(callback, wait, mustRun){
        var timeout,
            startTime = new Date()
        return function () {
            var context = this,
                args = arguments,
                curTime = new Date()

            clearTimeout(timeout)
            if (curTime - startTime >= mustRun) {
                callback.apply(context, args)
                startTime = curTime
            } else {
                timeout = setTimeout(function(){
                    callback.apply(context, args)
                }, wait)
            }
        }
    },
    isXxgApp: function () {
        var userAgent = navigator.userAgent || navigator.appVersion || ''
        return (/XXGApp/gi).test(userAgent)
    },
    isXxgAppIos: function () {
        var userAgent = navigator.userAgent || navigator.appVersion || ''
        return (/XXGApp=iOS/gi).test(userAgent)
    },
    isXxgAppAndroid: function () {
        return tcb.isXxgApp() && !tcb.isXxgAppIos()
    },
    isXxgAppAndroidSupportCustomCamera: function () {
        var userAgent = navigator.userAgent || navigator.appVersion || ''
        var matchArr = userAgent.match(/^.*XXGVersionCode=(\d+).*$/i) || []
        return matchArr[1] >= 10
    },
    // 判断xxg的iOS APP是否过期
    isXxgAppIosOutdated: function(){
        var flag = false
        if (window.__IS_XXG_APP_IOS) {
            var version_critical = [1, 0, 8]
            var version = (window.__XXG_APP_IOS_VERSION || '').split('.')
            tcb.each(version_critical, function (i, val) {
                if (flag) return false
                if (version[i] > val) return false
                if (version[i] < val) {
                    flag = true
                }
            })
        }
        return flag
    },
    // 通知用户去更新APP
    xxgAppIosNoticeUserUpdate: function () {
        if (tcb.isXxgAppIosOutdated()) {
            tcb.showDialog('<div>您的应用已过期，请到AppStore更新APP。</div>'/* +
                '<div class="grid align-center justify-center">' +
                '<a class="btn" href="https://itunes.apple.com/us/app/xxg/id1323990652?mt=8" target="_blank">下载</a></div>'*/,
                {
                    className: 'dialog-notice-user-update-ios',
                    withClose: false,
                    middle: true
                })
            return true
        }
    },


    // 和安卓交互的函数

    // 是否在android app内
    inTcbAndroidApp : (function () {
        var flag = false
        if (window.androidMethod && window.androidMethod.setDialogState) {
            flag = true
        }
        return flag
    } ()),
    // 调用客户端test接口
    js2AppTest: function(){
        if (window.androidMethod&&window.androidMethod.test){
            window.androidMethod.test()
        }
        if (window.webkit
            &&window.webkit.messageHandlers
            &&window.webkit.messageHandlers.test
            &&window.webkit.messageHandlers.test.postMessage){
            window.webkit.messageHandlers.test.postMessage(null)
        }
    },
    // 设置状态--登陆成功
    js2AppSetLoginSuccess: function(mobile){
        if (window.androidMethod
            &&window.androidMethod.loginSuccess){

            return window.androidMethod.loginSuccess()
        }
        if (window.webkit
            &&window.webkit.messageHandlers
            &&window.webkit.messageHandlers.loginSuccess
            &&window.webkit.messageHandlers.loginSuccess.postMessage){

            return window.webkit.messageHandlers.loginSuccess.postMessage(mobile||null)
        }
    },
    // 设置状态--退出成功
    js2AppSetLogout: function(){
        if (window.androidMethod
            &&window.androidMethod.logout){

            return window.androidMethod.logout()
        }
        if (window.webkit
            &&window.webkit.messageHandlers
            &&window.webkit.messageHandlers.logout
            &&window.webkit.messageHandlers.logout.postMessage){

            return window.webkit.messageHandlers.logout.postMessage(null)
        }
    },
    // 设置状态--打开/关闭弹层
    js2AndroidSetDialogState: function(flag, cb){
        if (window.androidMethod&&window.androidMethod.setDialogState){
            var closeFnQueue = tcb.cache ('js4AndroidFnCloseDialog') || []
            if (flag && cb){
                closeFnQueue.push(cb)
                tcb.cache ('js4AndroidFnCloseDialog', closeFnQueue)
            }

            window.androidMethod.setDialogState(flag)
        }
    },
    // 将给客户端的关闭弹层的函数队列的最后一个函数从队列中弹出，并且返回此函数
    js2AndroidPopDialogStateCloseFn: function(){
            var closeFnQueue = tcb.cache ('js4AndroidFnCloseDialog') || [],
                closeFn = closeFnQueue.pop()
            tcb.cache ('js4AndroidFnCloseDialog', closeFnQueue)
        return closeFn
    },
    // 调起二维码扫描
    js2AppInvokeQrScanner: function (is_return, scanner_success) {
        var isTestSupport = (is_return === 'test')
        tcb.cache('js4AppFnQrScannerSuccess', scanner_success)
        is_return = is_return ? true : false
        if (window.androidMethod
            && window.androidMethod.startQrScanner) {
            if (isTestSupport) {
                return true
            }
            window.androidMethod.startQrScanner(is_return)
            return true
        } else if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.startQrScanner
            && window.webkit.messageHandlers.startQrScanner.postMessage) {
            if (isTestSupport) {
                return true
            }
            window.webkit.messageHandlers.startQrScanner.postMessage(is_return)
            return true
        } else if (window.dialing
            && window.dialing.scanCode) {
            if (isTestSupport) {
                return true
            }
            window.dialing.scanCode('js4AppFnQrScannerSuccess')
            return true
        } else if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.app
            && window.webkit.messageHandlers.app.postMessage) {
            if (isTestSupport) {
                return true
            }
            window.webkit.messageHandlers.app.postMessage({
                methodName: 'scanCode',
                parameters: {
                    functionName: 'js4AppFnQrScannerSuccess'
                }
            })
            return true
        } else if (window.o2o
            && window.o2o.scanCode) {
            if (isTestSupport) {
                return true
            }
            window.o2o.scanCode({
                success: function (data) {
                    // try {
                    //     alert(JSON.stringify(data))
                    // }catch (e) {}
                    var code = (data && data.code) || ''
                    window.js4AppFnQrScannerSuccess(code)
                }
            })
            return true
        } else if (window.mcrm
            && window.mcrm.biz
            && window.mcrm.biz.scan) {
            if (isTestSupport) {
                return true
            }
            // 浙江移动APP生意宝--调起扫码
            window.mcrm.biz.scan({
                type: 'all',
                onSuccess: function (res) {
                    var text = (res && res.text) || ''
                    window.js4AppFnQrScannerSuccess(text)
                }
            })
            return true
        } else if (window.__IS_XXG_IN_SF_FIX_APP && window.postMessage) {
            if (isTestSupport) {
                return true
            }
            window.postMessage('scan:js4AppFnQrScannerSuccess')
            return true
        } else if (window.__IS_HENAN_YIDONG_APP
            && window.WadeMobile
            && window.WadeMobile.scanQrCode) {
            if (isTestSupport) {
                return true
            }
            window.WadeMobile.scanQrCode(function (res) {
                try {
                    res = typeof res === 'string' ? $.parseJSON(res) : res
                } catch (e) {}
                window.js4AppFnQrScannerSuccess((res && res.qrCode) || '')
            })
            return true
        } else if (typeof wx !== 'undefined' && wx.scanQRCode) {
            if (isTestSupport) {
                return true
            }
            // 微信内
            wx.scanQRCode({
                needResult: is_return ? 1 : 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                // scanType: ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有
                success: function (res) {
                    try {
                        if (typeof res === 'string') {
                            res = $.parseJSON(res)
                        }
                    } catch (e) {}
                    window.js4AppFnQrScannerSuccess(res.resultStr) // 当needResult 为 1 时，扫码返回的结果
                }
            })
            return true
        }
    },
    isSupportScan: function () {
        return tcb.js2AppInvokeQrScanner('test')
            || tcb.isWeChat
            || window.__IS_XXG_APP
            || window.__IS_XXG_IN_SUNING
            || window.__IS_XXG_IN_SF_FIX_APP
            || window.__IS_ZHEJIANG_YIDONG_APP
            || window.__IS_HENAN_YIDONG_APP
    },
    // 回传处理后的扫码数据
    js2AppReturnHandledQrScannerResult: function(handled_result){
        if (window.androidMethod
            &&window.androidMethod.receiveQrScannerResult){

            return window.androidMethod.receiveQrScannerResult(handled_result)
        }
        if (window.webkit
            &&window.webkit.messageHandlers
            &&window.webkit.messageHandlers.receiveQrScannerResult
            &&window.webkit.messageHandlers.receiveQrScannerResult.postMessage){

            return window.webkit.messageHandlers.receiveQrScannerResult.postMessage(handled_result)
        }
    },
    // 调起二维码扫描
    js2AppInvokeTakePicture: function(take_picture_success, mode){
        var success_cb_name = 'js4AppFnTakePictureSuccess' + tcb.genRandomNum()
        window[success_cb_name] = take_picture_success

        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.showCustomCamera
            && window.webkit.messageHandlers.showCustomCamera.postMessage && mode) {

            window.webkit.messageHandlers.showCustomCamera.postMessage({
                'direction': mode,
                'callbackMethod': success_cb_name
            })
            return true
        } else if (window.dialing
            && window.dialing.takePicture) {

            window.dialing.takePicture(success_cb_name)
            return true
        } else if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.app
            && window.webkit.messageHandlers.app.postMessage) {

            window.webkit.messageHandlers.app.postMessage({
                methodName: 'takePicture',
                parameters: {
                    functionName: success_cb_name
                }
            })
            return true
        } else if (window.o2o
            && window.o2o.takePicture) {
            // alert('111111111111')
            window.o2o.takePicture({
                success: function (data) {
                    var filePath = (data && data.path) || ''
                    // alert(filePath)
                    if (filePath && filePath.indexOf('file:') === 0) {
                        tcb.getLocalFileToBase64({
                            path: filePath,
                            success: function (base64) {
                                // alert('xxx')
                                // alert(typeof base64)
                                window[success_cb_name](base64)
                            }
                        })
                        // var reader = new FileReader()
                        // reader.onload = function (ev) {
                        //     // alert(reader.result)
                        //     // alert(this.result)
                        //     // alert(window[success_cb_name])
                        //     window[success_cb_name](this.result)
                        // }
                        // reader.readAsDataURL(filePath)
                    }
                }
            })
            return true
        } else if (window.mcrm
            && window.mcrm.biz
            && window.mcrm.biz.facePhoto) {
            // 浙江移动APP生意宝--调起拍照
            window.mcrm.biz.facePhoto({
                isBorder: '0',
                onSuccess: function (res) {
                    var base64 = (res && res.localId) || ''
                    if (base64) {
                        base64 = base64.replace(/\n/g,'')
                        window[success_cb_name](base64)
                    }
                },
                onFail: function (res) {}
            })
            return true
        } else if (window.__IS_XXG_IN_SF_FIX_APP && window.postMessage) {

            window.postMessage('camera:' + success_cb_name)
            return true
        } else if (window.__IS_HENAN_YIDONG_APP
            && window.WadeMobile
            && window.WadeMobile.callCamera) {
            window.WadeMobile.callCamera(function (res) {
                try {
                    res = typeof res === 'string' ? $.parseJSON(res) : res
                } catch (e) {}
                var base64 = (res && res.photoBase) || ''
                if (base64) {
                    base64 = base64.replace(/\n/g, '')
                    window[success_cb_name](base64)
                }
            })
            return true
        }
    },
    js2AppInvokeGoHome: function () {
        if (window.dialing
            && window.dialing.goHome) {

            return window.dialing.goHome()
        } else if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.app
            && window.webkit.messageHandlers.app.postMessage) {

            return window.webkit.messageHandlers.app.postMessage({
                methodName: 'goHome'
            })
        } else if (window.o2o
            && window.o2o.goHome) {

            return window.o2o.goHome()
        }
    },
    js2AppInvokeGoBack: function () {
        if (window.__IS_XXG_IN_SF_FIX_APP && window.postMessage) {
            window.postMessage('goBack')
        } else if (window.__IS_HENAN_YIDONG_APP
            && window.WadeMobile
            && window.WadeMobile.back) {
            window.WadeMobile.back()
        }
    },
    // 请求App调起--意见反馈
    js2AppInvokeFeedback : function () {
        if (window.androidMethod
            && window.androidMethod.feedBack) {
            return window.androidMethod.feedBack ()
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.feedback
            && window.webkit.messageHandlers.feedback.postMessage) {
            return window.webkit.messageHandlers.feedback.postMessage (null)
        }
    },
    // 请求App调起--支付
    js2AppInvokePayMethod : function (data) {
        if (window.androidMethod
            && window.androidMethod.wxPay) {
            return window.androidMethod.wxPay (JSON.stringify (data))
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.wxPay
            && window.webkit.messageHandlers.wxPay.postMessage) {
            return window.webkit.messageHandlers.wxPay.postMessage (data)
        }
    },
    // 请求App调起--支付
    js2AppInvokeSuningPayMethod : function (data) {
        if (window.androidMethod
            && window.androidMethod.snPay) {
            return window.androidMethod.snPay (data)
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.snPay
            && window.webkit.messageHandlers.snPay.postMessage) {
            return window.webkit.messageHandlers.snPay.postMessage (data)
        }
    },
    // 通知App，js加载完成
    js2AppNoticeLoadDown: function(){
        if (window.androidMethod
            &&window.androidMethod.jsReady){

            return window.androidMethod.jsReady()
        }
        if (window.webkit
            &&window.webkit.messageHandlers
            &&window.webkit.messageHandlers.jsReady
            &&window.webkit.messageHandlers.jsReady.postMessage){

            return window.webkit.messageHandlers.jsReady.postMessage(null)
        }
    },
    // 是否支持tcb app的分享
    isSupportTcbAppShare: function (data) {
        if (window.androidMethod
            && window.androidMethod.shareSupport) {
            return true
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.shareSupport
            && window.webkit.messageHandlers.shareSupport.postMessage) {
            return true
        }
        return false
    },
    // 设置当前支持的分享方式
    js2AppSetShareSupport : function (data) {
        var supportType = {
            'onMenuShareTimeline'   : 1,
            'onMenuShareAppMessage' : 1,
            'onMenuShareQQ'         : 1,
            'onMenuShareQZone'      : 1,
            'onMenuCopyUrl'         : 1,
            'onMenuShareWeibo'      : 0
        }
        data = tcb.mix (supportType, data || {}, true)

        if (window.androidMethod
            && window.androidMethod.shareSupport) {
            return window.androidMethod.shareSupport (JSON.stringify (data))
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.shareSupport
            && window.webkit.messageHandlers.shareSupport.postMessage) {
            return window.webkit.messageHandlers.shareSupport.postMessage (data || null)
        }
    },
    // 设置当前分享的数据
    js2AppSetShareData : function (options) {
        options = options || {}
        tcb.cache ('js4AppFnGetShareData', {
            imgUrl : options.imgUrl || '',
            link   : options.link || '',
            title  : options.title || '',
            desc   : options.desc || ''
        })

        if ($.isFunction (options.success)) {
            tcb.cache ('js4AppFnNoticeShareSuccess', options.success)
        }
        if ($.isFunction (options.cancel)) {
            tcb.cache ('js4AppFnNoticeShareCancel', options.cancel)
        }
    },
    // 请求App调起--分享
    js2AppInvokeShare : function (data) {
        // 如果传入data数据，那么设置分享的数据
        if (data) {
            tcb.js2AppSetShareData(data)
        }
        if (window.androidMethod
            && window.androidMethod.callShare) {

            return window.androidMethod.callShare()
        } else if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.callShare
            && window.webkit.messageHandlers.callShare.postMessage) {

            return window.webkit.messageHandlers.callShare.postMessage(null)
        } else if (window.dialing
            && window.dialing.showWechatShare) {

            return window.dialing.showWechatShare(true, data.title, data.desc, data.imgUrl, data.link)
        } else if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.app
            && window.webkit.messageHandlers.app.postMessage) {

            return window.webkit.messageHandlers.app.postMessage({
                methodName: 'showWechatShare',
                parameters: {
                    isShare: true,
                    title: data.title,
                    description: data.desc,
                    imageUrl: data.imgUrl,
                    shareUrl: data.link
                }
            })
        } else if (window.o2o
            && window.o2o.showWechatShare) {

            return window.o2o.showWechatShare({
                isShare: 1,
                title: data.title,
                description: data.desc,
                imageUrl: data.imgUrl,
                shareUrl: data.link
            })
        }
    },
    // 设置当前支持的点击文本内容和点击调起事件
    js2AppSetTextSupport : function (data) {
        data = data || {}

        if (!$.isFunction(data.method)){
            return tcb.error('method必须定义为一个function')
        }
        window.js4AppFnTextSupportCallback = data.method

        data.method = 'js4AppFnTextSupportCallback()'
        if (window.androidMethod
            && window.androidMethod.textSupport) {
            return window.androidMethod.textSupport (JSON.stringify (data))
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.textSupport
            && window.webkit.messageHandlers.textSupport.postMessage) {
            return window.webkit.messageHandlers.textSupport.postMessage (data || null)
        }
    },
    // 设置客户端返回中断信息
    js2AppSetBackInterceptInfo: function (data) {
        data = data || {}

        var pathname = tcb.trim(window.location.pathname, '/')

        if (window.androidMethod
            && window.androidMethod.setBackInterceptInfo) {
            return window.androidMethod.setBackInterceptInfo (pathname, JSON.stringify (data))
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.setBackInterceptInfo
            && window.webkit.messageHandlers.setBackInterceptInfo.postMessage) {
            return window.webkit.messageHandlers.setBackInterceptInfo.postMessage ({
                pathname: pathname,
                data: data
            })
        }
    },
    // 设置客户端订单详情和列表相关的返回中断信息
    js2AppSetInterceptOrderDetailsInfo: function (orderListLink, checkoutCounterMatch) {
        if (!orderListLink || !checkoutCounterMatch) {
            return console.warn('参数不能为空')
        }
        var data = {
            'orderListLink': orderListLink,
            'checkoutCounterMatch': checkoutCounterMatch
        }
        if (window.androidMethod
            && window.androidMethod.setInterceptOrderDetailsInfo) {
            return window.androidMethod.setInterceptOrderDetailsInfo(JSON.stringify(data))
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.setInterceptOrderDetailsInfo
            && window.webkit.messageHandlers.setInterceptOrderDetailsInfo.postMessage) {
            return window.webkit.messageHandlers.setInterceptOrderDetailsInfo.postMessage(data)
        }
    },
    // 设置客户端统计的URL映射
    js2AppSetStatisticsInfo: function (data) {
        data = data || {
            product:'/youpin/product',//商品页
            orders:'/youpin/tinfo',//订单页
            pay:'/youpin/cashier'//支付页
        }

        if (window.androidMethod
            && window.androidMethod.setStatisticsInfo) {
            return window.androidMethod.setStatisticsInfo (JSON.stringify (data))
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.setStatisticsInfo
            && window.webkit.messageHandlers.setStatisticsInfo.postMessage) {
            return window.webkit.messageHandlers.setStatisticsInfo.postMessage (data||null)
        }
    },
    // 刷新优品我的页面
    js2AppYoupinRefreshMeView: function () {
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.refreshMeView
            && window.webkit.messageHandlers.refreshMeView.postMessage) {
            window.webkit.messageHandlers.refreshMeView.postMessage(null)
        }
    },
    // 获取页面历史栈
    js2AppGetHistoryStack: function (callback) {
        window.js4AppFnGetHistoryStackCallback = callback
        var is_invoke = false
        var fn_name = 'js4AppFnGetHistoryStackCallback'
        if (window.androidMethod
            && window.androidMethod.getHistory) {
            is_invoke = true
            window.androidMethod.getHistory(fn_name)
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.getHistory
            && window.webkit.messageHandlers.getHistory.postMessage) {
            is_invoke = true
            window.webkit.messageHandlers.getHistory.postMessage(fn_name)
        }
        if (!is_invoke) {
            $.isFunction(callback) && callback()
        }
    },
    // 设置当前webview是否支持下拉刷新
    js2AppSetPullDownRefresh: function (refresh) {
        refresh = typeof refresh === 'undefined' ? true : !!refresh
        if (window.androidMethod
            && window.androidMethod.setRefreshEnable) {
            window.androidMethod.setRefreshEnable(refresh)
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.setRefreshState
            && window.webkit.messageHandlers.setRefreshState.postMessage) {
            window.webkit.messageHandlers.setRefreshState.postMessage(refresh)
        }
    },
    // 获取客户端状态栏高度
    js2AppGetStatusBarHeight: function (callback) {
        window.js4AppFnGetStatusBarHeightCallback = function (statusBarHeight) {
            callback(statusBarHeight)
        }
        if (window.__IS_XXG_IN_SF_FIX_APP && window.postMessage) {
            window.postMessage('statusBarHeight')
        }
    },
    // 获取客户端状态栏和导航栏高度
    js2AppGetBarHeight: function (callback) {
        window.js4AppFnGetBarHeightCallback = function (data) {
            try {
                data = typeof data === 'string' ? JSON.parse(data) : data
            } catch (e) {}
            var statusBarHeight = data.statusBarHeight,
                navBarHeight = data.navBarHeight || data.toolBarHeight
            callback(statusBarHeight, navBarHeight)
        }
        var is_invoke = false
        var fn_name = 'js4AppFnGetBarHeightCallback'
        if (window.androidMethod
            && window.androidMethod.getBarHeightV39) {
            is_invoke = true
            var barHeight = window.androidMethod.getBarHeightV39()
            window[fn_name](barHeight)
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.getBarHeightV39
            && window.webkit.messageHandlers.getBarHeightV39.postMessage) {
            is_invoke = true
            window.webkit.messageHandlers.getBarHeightV39.postMessage(fn_name)
        }
        if (!is_invoke) {
            if (window.__IS_APP_FULL_SCREEN_VERSION) {
                $.isFunction(callback) && callback(20, 64)
            } else {
                $.isFunction(callback) && callback()
            }
            // $.isFunction(callback) && callback()
        }
    },
    // 通知客户端已退出登录
    js2AppNoticeLogout: function () {
        if (window.androidMethod
            && window.androidMethod.logoutV39) {
            window.androidMethod.logoutV39()
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.logoutSuccess
            && window.webkit.messageHandlers.logoutSuccess.postMessage) {
            window.webkit.messageHandlers.logoutSuccess.postMessage(null)
        }
    },
    // 呼起客户端登录
    // options :
    //      loginType : 0 全屏， 1 弹窗
    //      cancelActionType: -1 不作处理，0 回退页面
    //      successActionType: -1 不作处理，0 刷新页面
    js2AppLogin: function (callback, options) {
        window.js4AppFnLoginCallback = callback || this.noop
        var fn_name = callback ? 'js4AppFnLoginCallback' : ''
        var params = {
            loginType: 0,
            notifyWebCallback: fn_name,
            cancelActionType: -1,
            successActionType: -1
        }
        params = tcb.mix (params, options || {}, true)
        if (window.androidMethod
            && window.androidMethod.loginV39) {
            window.androidMethod.loginV39(JSON.stringify(params))
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.showLoginVC
            && window.webkit.messageHandlers.showLoginVC.postMessage) {
            window.webkit.messageHandlers.showLoginVC.postMessage(params)
        }
    },
    js2AppWebViewBack: function () {
        if (window.androidMethod
            && window.androidMethod.goBackWebActivity) {
            window.androidMethod.goBackWebActivity()
        } else if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.backButtonClicked
            && window.webkit.messageHandlers.backButtonClicked.postMessage) {
            window.webkit.messageHandlers.backButtonClicked.postMessage(null)
        } else {
            window.history.go(-1)
        }
    },
    // xxgAPP首页是否显示扫码
    js2AppNeedQrScanner: function (is_need) {
        is_need = !!is_need
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.needQrScanner
            && window.webkit.messageHandlers.needQrScanner.postMessage) {
            window.webkit.messageHandlers.needQrScanner.postMessage(is_need)
        }
    },
//    修修哥代卖列表呼起天机汇 app
    js2AppShelvesTjh: function (quality_id,callback) {
        var is_shelves = false
        if (window.androidMethod
            && window.androidMethod.showB2BApp) {
            is_shelves = true
            var shelvesResult = window.androidMethod.showB2BApp(JSON.stringify(quality_id))
            // shelvesResult true 表示呼起成功   false 呼起失败
            if(!shelvesResult){
                if(window.androidMethod && window.androidMethod.showExternalBrowser){
                    window.androidMethod.showExternalBrowser('https://bang.360.cn/huodong/tjh')
                }
            }
        }
        if (window.webkit
            && window.webkit.messageHandlers
            && window.webkit.messageHandlers.openTjh
            && window.webkit.messageHandlers.openTjh.postMessage) {
            is_shelves = true
            var parameter ={
                'scheme':'tcbb2b://order?quality_id='+quality_id,
                'appDownloadUrl':'https://bang.360.cn/huodong/tjh'
            }
            window.webkit.messageHandlers.openTjh.postMessage(parameter)
        }
        if (!is_shelves) {
            $.isFunction(callback) && callback()
        }
    },
    js2AppHNYDOpenPage: function (action) {
        if (window.__IS_HENAN_YIDONG_APP
            && window.WadeMobile
            && window.WadeMobile.openPage) {
            window.WadeMobile.openPage(action)
        }
    }
}

// 一些公共的基本操作
!function(){
    //******************************
    //********和app交互的函数*********
    //******************************
    // 返回分享的数据
    window.js4AppFnGetShareData = function(){
        var shareData = tcb.cache('js4AppFnGetShareData')
        return shareData || null
    }

    // 通知分享成功
    // type : 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareQZone', 'onMenuShareWeibo'
    window.js4AppFnNoticeShareSuccess = function (type) {
        var success = tcb.cache('js4AppFnNoticeShareSuccess')
        $.isFunction(success) && success(type)
    }
    // 取消分享
    window.js4AppFnNoticeShareCancel = function (type) {
        var cancel = tcb.cache('js4AppFnNoticeShareCancel')
        $.isFunction(cancel) && cancel(type)
    }

    tcb.bindEvent(document.body, {
        'a': {
            // 修改url，加上那些每个页面都要携带的参数
            'mousedown': function(e){
                var $me = $(this),
                    data_href = $me.attr('data-href')||'',
                    data_url = $me.attr('data-url')||'',
                    href = $me.attr('href')||'',
                    except = $me.attr('data-url-except'),
                    params = {}

                except = except ? except.split('|') :[]

                tcb.each(window.__MUST_PASS_PARAMS||{}, function (k, val) {
                    if (tcb.inArray(k, except)>-1){
                        return true
                    }
                    params[k] = val
                })

                if ( tcb.isRealUrl(data_href) ) {
                    $me.attr('data-href', tcb.setUrl(data_href, params))
                }

                if ( tcb.isRealUrl(data_url) ) {
                    $me.attr('data-url', tcb.setUrl(data_url, params))
                }

                if ( tcb.isRealUrl(href) ) {
                    $me.attr('href', tcb.setUrl(href, params))
                }
            }
        }
    })

    $(function(){

        // 在丰修APP内，跟APP交互的回调
        if (window.__IS_XXG_IN_SF_FIX_APP) {
            document.addEventListener('message', function (evt) {
                var data = (evt && evt.data) || {}
                try {
                    if (typeof data === 'string') {
                        data = JSON.parse(data)
                    }
                } catch (e) {
                    data = {}
                }
                // alert(JSON.stringify(data))
                // alert(JSON.stringify(evt))
                var action_map = {
                    // 获取扫码值
                    'scan': 1,
                    // 拍照获取照片
                    'camera': 1,
                    // 获取状态栏高度
                    'statusBarHeight': window.js4AppFnGetStatusBarHeightCallback
                }
                var action_set = Object.keys(action_map)
                tcb.each(data, function (key, val) {
                    var keys = key.split(':')
                    if (action_set.indexOf(keys[0]) > -1) {
                        var fn
                        if (keys[1] && typeof window[keys[1]] === 'function') {
                            fn = window[keys[1]]
                        } else if (typeof action_map[keys[0]] === 'function') {
                            fn = action_map[keys[0]]
                        }
                        fn && fn(val)
                    }
                })
            }, false)
        }

        if ($.fn.cookie('hide-block-big-rest-notice')){
            $('.block-big-rest-notice').hide()
            $('.trigger-show-big-rest-notice').show()
        } else {
            $('.block-big-rest-notice').show()
            $('.trigger-show-big-rest-notice').hide()
        }
    })
}()


;/**import from `/resource/js/component/m/countdown.js` **/
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

        var fn_countdown = $.tmpl( $.trim( $('#JsMCountdownTpl').html() ) );

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
                'day': fix2Length(d),
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
            curtime = curtime + 1000;

            //duration = duration<1 ? 0 : duration;
            return true;
        }
        countdown();
        var timerId = setTimeout(function(){
            var flag = countdown();
            if (!flag) {
                return ;
            }
            if(duration>-1){
                var next_time = getClientDuration(targettime) - client_duration;
                if (next_time<0) {
                    next_time = 0;
                }
                timerId = setTimeout(arguments.callee, next_time);
            } else {
                // 倒计时结束
                typeof callbacks.end === 'function' && callbacks.end();
            }
        }, 1000);
        return function(){
            clearTimeout(timerId)
            timerId = null
        }
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

;/**import from `/resource/js/component/m/shareintro.js` **/
(function(){
    window.Bang = window.Bang || {};

    var __options = {
        hash: '',
        img: '',
        ext_html: ''
    };
    /**
     * 分享引导
     */
    function activeShareIntro(options){
        __options = options || {};

        var $share_intro = $('.m-fenxiang-intro-wrap');
        if (!$share_intro.length) {
            var html_str = '<div class="m-fenxiang-intro-wrap">'
                +'<a class="m-fenxiang-intro-bg" href="#"></a>'
                +'<div class="m-fenxiang-intro-inner">' +
                '<a class="m-fenxiang-intro" href="#">' +
                '<img class="w100" src="'+(__options.img ? __options.img : 'https://p.ssl.qhimg.com/t010deb0787edd39c10.png')+'" alt=""/>';

            if (__options&&__options['ext_html']){
                html_str += __options['ext_html'];
            }
            html_str += '</a> </div> </div>';

            var mask_h = $('body').height(),
                window_h = $(window).height();
            if (mask_h<window_h){
                mask_h = window_h;
            }

            var $html_str = $(html_str);
            $html_str.appendTo('body').css({
                'height': mask_h
            });

            setTimeout(function(){
                var mask_h = $('body').height(),
                    window_h = $(window).height();
                if (mask_h<window_h){
                    mask_h = window_h;
                }
                $html_str.css({
                    'height': mask_h
                });
            }, 1000);

            $share_intro = $('.m-fenxiang-intro-wrap');
        }

        $(window).scrollTop(0);


        var $mainbody = $('.mainbody');
        if( $mainbody && $mainbody.length ){
            $mainbody.addClass('blur');
        }

        $share_intro.show();
    }
    /**
     * 关闭分享弹层
     */
    function closeShareIntro(){
        var $intro = $('.m-fenxiang-intro-wrap');
        if ($intro.length) {
            $intro.remove();
        }

        var hash = __options['hash'] || '';
        if (hash) {
            var hashs = tcb.parseHash(window.location.hash);
            // hashs的kv对象中拥有此hash
            if ( typeof hashs[hash]!=='undefined' ) {
                delete hashs[hash];
            }

            window.location.hash = $.param(hashs)
        }

        var $mainbody = $('.mainbody');
        if( $mainbody && $mainbody.length ){
            $mainbody.removeClass('blur');
        }
    }

    function init(){

        tcb.bindEvent({
            // 关闭分享引导
            '.m-fenxiang-intro-bg, .m-fenxiang-intro': function(e){
                e.preventDefault();
                closeShareIntro();
            }

        });

    }
    init();

    window.Bang.ShareIntro = {
        active: activeShareIntro,
        close: closeShareIntro
    };
}());

;/**import from `/resource/js/component/m/swipesection.js` **/
// swipe section
(function () {
    window.Bang = window.Bang || {}

    var noop = function () {}

    window.QUEUE = window.QUEUE || {}
    window.QUEUE_MAP = window.QUEUE_MAP || {}
    var
        flag_animating = false,
        _MAX_Z_INDEX = 10000,
        _MASK_Z_INDEX = 9999

    function pushQueue (target, queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        Queue.push (target);

        return Queue.length - 1;
    }

    function popQueue (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue.pop ();
    }

    function shiftQueue (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue.shift ();
    }

    function getQueueTargetBy (pos, queue_name) {
        pos = parseInt (pos, 10);
        pos = pos
            ? pos
            : 0;
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }

        return Queue[ pos ];
    }

    function getQueueLast (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        var last = Queue.length - 1;

        return last > -1
            ? Queue[ last ]
            : null;
    }
    function getQueue(queue_name){
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue
    }

    function getSwipeSection (el) {
        var $el, class_str = '';
        if (el) {
            $el = $ (el);
            if (!($el && $el.length) && (typeof el === 'string')) {
                class_str = el.replace (/\./g, '');
            }
        }

        if (!($el && $el.length)) {
            var wrap_str = class_str
                ? '<section id="SwipeSection' + tcb.genRandomNum () + '" class="swipe-section pre-swipe-right-hide b-left ' + class_str + '"><a href="#" class="swipe-section-close iconfont icon-close"></a><div class="swipe-section-inner"></div></section>'
                : '<section id="SwipeSection' + tcb.genRandomNum () + '" class="swipe-section pre-swipe-right-hide b-left"><a href="#" class="swipe-section-close iconfont icon-close"></a><div class="swipe-section-inner"></div></section>';
            $el = $ (wrap_str).appendTo (document.body);

            // 关闭swipe secition
            $el.find ('.swipe-section-close').on ('click', function (e) {
                e.preventDefault ();

                backLeftSwipeSection ();
            });
        }

        // 将对象加入处理队列
        pushQueue ($el);

        return $el;
    }

    // 填充swipe section的内容
    function fillSwipeSection (html_str) {
        html_str = html_str
            ? html_str
            : '';
        var $swipe = getQueueLast ();
        if ($swipe && $swipe.length) {
            $swipe.find ('.swipe-section-inner').html (html_str);
        }
    }

    // 执行向左滑动
    function doLeftSwipeSection (percent, callback) {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }
        percent = parseFloat (percent)

        var // 内部元素的宽度
            inner_percent = percent
                ? 100 - percent
                : 100

        percent = percent
            ? percent + '%'
            : '0'
        inner_percent = inner_percent
            ? inner_percent + '%'
            : '100%'


        var $swipe = getQueueLast ();
        if ($swipe && $swipe.length) {
            var $body = $ (document.body);
            if (window.Bang.SwipeSection.ohidden && !$body.hasClass ('ohidden')) {
                $body.addClass ('ohidden');
            }

            showMask ()

            // 滑动之前将滑动标识设置为true,以用于表示在滑动ing,以方便其他的操作进行判断
            flag_animating = true

            $swipe.css ({
                'display' : 'block',
                'z-index' : _MAX_Z_INDEX++
            }).animate ({ 'translateX' : percent }, 500, 'ease', function () {

                // 滑动结束,释放滑动锁定标识
                flag_animating = false

                typeof callback === 'function' && callback ()
            })

            $swipe.find ('.swipe-section-inner').css ({
                'width' : inner_percent
            })
            $swipe.find ('.swipe-section-close').css ({
                'right' : percent
            })
            tcb.js2AndroidSetDialogState(true, function(){
                backLeftSwipeSection()
            })
        }
    }

    // 向左滑动的层，返回原处
    function backLeftSwipeSection (callback, flag_static) {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }

        var $swipe = popQueue ()
        if ($swipe && $swipe.length) {
            var $body = $ (document.body)
            if ($body.hasClass ('ohidden')) {
                $body.removeClass ('ohidden')
            }

            hideMask ()

            if (flag_static){
                typeof callback === 'function' && callback ()

                $swipe.remove ()
                $swipe = null
                return
            }
            $swipe.animate ({ 'translateX' : '100%' }, 300, 'ease', function () {
                typeof callback === 'function' && callback ()

                $swipe.remove ()
                $swipe = null
            })
            tcb.js2AndroidSetDialogState(false)
        }
    }

    // 除了最后一个，关闭其他显示的滑层
    function closeAllExceptLast () {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }
        var Queue = getQueue ()

        var $swipe
        while (Queue.length > 1) {
            $swipe = shiftQueue ()
            if ($swipe && $swipe.length) {
                $swipe.remove ()
                $swipe = null
                tcb.js2AndroidSetDialogState(false)
            }
        }
    }

    // 获取最后一个swipe section
    function getLastSwipeSection () {

        return getQueueLast ()
    }

    // 显示透明遮罩层
    function showMask () {
        var
            $Mask = $ ('#SwipeSectionMask')
        if (!($Mask && $Mask.length)) {
            var
                mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:' + _MASK_Z_INDEX + ';display: block;width: 100%;height: 100%;background:transparent;',
                mask_html = '<a id="SwipeSectionMask" href="#" style="' + mask_css + '"></a>'

            $Mask = $ (mask_html).appendTo (document.body);

            $Mask.on ('click', function (e) {
                e.preventDefault ()

                backLeftSwipeSection ()
            })
        }

        $Mask.show ()
    }

    // 隐藏透明遮罩层
    function hideMask () {
        var
            $Mask = $ ('#SwipeSectionMask')
        if ($Mask && $Mask.length) {

            $Mask.hide ()
        }
    }

    window.Bang.SwipeSection = {
        ohidden              : true,
        getSwipeSection      : getSwipeSection, /*获取swipe secition对象，加入队列queue*/
        fillSwipeSection     : fillSwipeSection, /*填充swipe section的内容*/
        doLeftSwipeSection   : doLeftSwipeSection, /*执行向左滑动*/
        backLeftSwipeSection : backLeftSwipeSection, /*向左滑动的层，返回原处*/
        closeAllExceptLast   : closeAllExceptLast,
        getLastSwipeSection  : getLastSwipeSection,
        getQueue : getQueue
    }

} ())


;/**import from `/resource/js/component/m/address_select.js` **/
;
(function () {
    var Bang
            = window.Bang
            = window.Bang || {}

    var defaults = {
            // 根据省一次性获取所有的城市和区县信息
            //flagGetAll       : false,
            // 实例化的时候自动执行init函数
            flagAutoInit     : true,
            flagStorage      : true,
            // 触发器
            selectorTrigger  : '.province-city-area',
            // 省、市、区县的选择器
            selectorProvince : '[name="receiver_province_id"]',
            selectorCity     : '[name="receiver_city_id"]',
            selectorArea     : '[name="receiver_area_id"]',

            url_province     : '/aj/doGetProvinceList',
            url_city_area    : '/aj/doGetProvinceLinkage',
            url_city         : '/aj/doGetCityList',
            url_area         : '/aj/doGetAreaList',

            // 默认的省、市、区县
            province         : '',
            city             : '',
            area             : '',
            province_id      : '',
            city_id          : '',
            area_id          : '',

            // 是否显示城市\区县
            show_city        : true,
            show_area        : true,
            // 默认输出选择的省市区县
            not_render       : false,
            // 回调函数(确认/取消)
            callback_confirm : null,
            callback_cancel  : null
        },
        // cache省列表
        CacheProvinceList = [],
        // cache市列表
        CacheCityList = {},
        // cache区县列表
        CacheAreaList = {},

        selected_province = null,
        selected_city = null,
        selected_area = null,
        isSupportLocalStorage = tcb.supportLocalStorage(),
        isSupportJSON = (typeof JSON !='undefined') && (typeof JSON.stringify =='function') && (typeof JSON.parse =='function') ? true : false

    function AddressSelect (options) {
        var
            me = this

        options = $.extend ({}, defaults, options)

        me.options = options

        if (!me.options.flagStorage) {
            me.CacheProvinceList = []
            me.CacheCityList = {}
            me.CacheAreaList = {}
        }

        if (me.options.flagAutoInit) {

            me.init ()
        }
    }

    // 设置原型方法
    AddressSelect.prototype = {

        constructor : AddressSelect,

        getWrap : getWrap,

        getTrigger        : getTrigger,
        getProvinceSelect : getProvinceSelect,
        getCitySelect     : getCitySelect,
        getAreaSelect     : getAreaSelect,

        setProvinceHtml : setProvinceHtml,
        setCityHtml     : setCityHtml,
        setAreaHtml     : setAreaHtml,

        getProvinceList : getProvinceList,
        getCityList     : getCityList,
        getAreaList     : getAreaList,
        getCityAreaList : getCityAreaList,

        //getProvinceListByCache : getProvinceListByCache,
        //getCityListByCache     : getCityListByCache,
        //getAreaListByCache     : getAreaListByCache,

        //getProvinceIdByName : getProvinceIdByName,
        //getCityIdByName     : getCityIdByName,
        //getAreaIdByName     : getAreaIdByName,

        bindEvent     : bindEvent,
        bindMoveEvent : bindMoveEvent,

        setSelect         : setSelect,
        setSelectCityArea : setSelectCityArea,
        setSelectArea     : setSelectArea,

        doSelect : doSelect,
        doShow   : doShow,
        doHide   : doHide,

        init : init
    }

    // 获取触发器
    function getTrigger () {
        var
            me = this,
            selectorTrigger = me.options.selectorTrigger

        return $ (selectorTrigger)
    }

    // 获取省选择器
    function getProvinceSelect () {
        var
            me = this,
            selectorProvince = me.options.selectorProvince

        return $ (selectorProvince)
    }

    // 获取城市选择器
    function getCitySelect () {
        var
            me = this,
            selectorCity = me.options.selectorCity

        return $ (selectorCity)
    }

    // 获取地区选择器
    function getAreaSelect () {
        var
            me = this,
            selectorArea = me.options.selectorArea

        return $ (selectorArea)
    }


    // 获取省份列表
    function getProvinceList (callback) {
        var me = this
        var options = me.options
        var url_province = options.url_province
        var
            province_list = __getProvinceListByCache (me)

        if (province_list && province_list.length) {

            $.isFunction (callback) && callback ()
        } else {
            if (isLoading ('KEY_GLOBAL_LOADING_PROVINCE')) {
                return
            }
            setLoading (true, 'KEY_GLOBAL_LOADING_PROVINCE')

            var request_url = tcb.setUrl2(url_province || '/aj/doGetProvinceList')

            $.get (request_url, function (res) {
                res = $.parseJSON (res)

                setLoading (false, 'KEY_GLOBAL_LOADING_PROVINCE')

                if (!res[ 'errno' ]) {
                    __storeProvinceList(res[ 'result' ], me)

                    $.isFunction (callback) && callback ()
                } else {
                    // do nothing
                }

            })
        }
    }

    // 获取城市、地区列表
    function getCityAreaList (province_id, callback) {
        if (!province_id) {
            return;
        }
        var me = this
        var options = me.options
        var url_city_area = options.url_city_area
        var
            city_list = __getCityListByCache (province_id, me)

        if (city_list && city_list.length) {

            $.isFunction (callback) && callback ()
        } else {
            if (isLoading ('KEY_GLOBAL_LOADING_CITY_AREA')) {
                return
            }
            setLoading (true, 'KEY_GLOBAL_LOADING_CITY_AREA')

            var request_url = tcb.setUrl2((url_city_area || '/aj/doGetProvinceLinkage') + '?province_id=' + province_id)

            city_list = []
            $.get (request_url, function (res) {
                res = $.parseJSON (res)

                setLoading (false, 'KEY_GLOBAL_LOADING_CITY_AREA')

                if (!res[ 'errno' ]) {

                    var
                        result = res[ 'result' ]

                    $.each (result[ 'city_list' ], function (i, item) {
                        city_list.push ({
                            city_id   : item[ 'city_id' ],
                            city_name : item[ 'city_name' ]
                        })

                        // 区县cache
                        __storeAreaList(item[ 'city_id' ], (item[ 'area_list' ] && item[ 'area_list' ].length)
                            ? item[ 'area_list' ]
                            : [], me)
                    });
                    // 城市cache
                    __storeCityList (province_id, city_list, me)

                    $.isFunction (callback) && callback ()

                } else {
                    $.isFunction (callback) && callback ()
                    // do nothing
                }
            });

        }
    }

    // 获取城市列表
    function getCityList (province_id, callback) {
        if (!province_id) {
            return;
        }
        var me = this
        var options = me.options
        var url_city = options.url_city
        var city_list = __getCityListByCache(province_id, me)
        if (city_list && city_list.length) {
            if ($.isFunction (callback)) {
                getAreaList (city_list[ 0 ][ 'city_id' ], function (area_list) {
                    callback (city_list, area_list)
                })
            }
        } else {
            var request_url = tcb.setUrl2((url_city || '/aj/doGetCityList') + '?province_id=' + province_id)

            $.get (request_url, function (res) {
                res = $.parseJSON (res);

                if (!res[ 'errno' ]) {
                    city_list = res[ 'result' ]

                    __storeCityList (province_id, city_list, me)

                    if ($.isFunction (callback)) {
                        if (city_list && city_list.length) {
                            getAreaList (city_list[ 0 ][ 'city_id' ], function (area_list) {
                                callback (city_list, area_list);
                            });
                        }
                    }
                } else {
                    // do nothing
                }
            });
        }
    }

    // 获取城市列表
    function getAreaList (city_id, callback) {
        if (!city_id) {
            return;
        }
        var me = this
        var options = me.options
        var url_area = options.url_area
        var area_list = __getAreaListByCache (city_id, me)

        if (area_list && area_list.length) {

            $.isFunction (callback) && callback ()
        } else {
            var
                request_url = tcb.setUrl2((url_area || '/aj/doGetAreaList') + '?city_id=' + city_id)

            $.get (request_url, function (res) {
                res = $.parseJSON (res);

                if (!res[ 'errno' ]) {

                    __storeAreaList(city_id, (res[ 'result' ] && res[ 'result' ].length) ? res[ 'result' ] : [], me)

                    $.isFunction (callback) && callback ()
                } else {
                    // do nothing
                }
            });
        }
    }

    // 设置省份html
    function setProvinceHtml (data, selected_id) {
        var
            me = this

        var
            html_str = genHtml ('province', data, selected_id),
            $wrap = me.getWrap (),
            $col = $wrap.find ('.col').eq (0)

        $col.find ('.item-list').html (html_str)

        return $col
    }

    // 设置城市html
    function setCityHtml (data, selected_id) {
        var
            me = this

        var
            html_str = genHtml ('city', data, selected_id),
            $wrap = me.getWrap (),
            $col = $wrap.find ('.col').eq (1)

        $col.find ('.item-list').html (html_str)
        return $col
    }

    // 设置地区html
    function setAreaHtml (data, selected_id) {
        var
            me = this

        var
            html_str = genHtml ('area', data, selected_id),
            $wrap = me.getWrap (),
            $col = $wrap.find ('.col').eq (2)

        $col.find ('.item-list').html (html_str)
        return $col
    }

    // 根据type生成省/市/区县的html
    function genHtml (type, data, selected_id) {
        data = data || []
        var
            type_arr = [ 'province',
                         'city',
                         'area' ],
            type_map = {
                province : {
                    field_id   : 'province_id',
                    field_name : 'province_name'
                },
                city     : {
                    field_id   : 'city_id',
                    field_name : 'city_name'
                },
                area     : {
                    field_id   : 'area_id',
                    field_name : 'area_name'
                }
            },
            html_str = []

        if ($.inArray (type, type_arr) == -1) {
            type = type_arr[ 0 ]
        }

        $.each (data, function (i, item) {
            html_str.push ('<span class="i-item')
            if (selected_id === item[ type_map[ type ][ 'field_id' ] ]) {
                html_str.push (' selected');
            }
            html_str.push ('" data-value="', item[ type_map[ type ][ 'field_id' ] ], '">', item[ type_map[ type ][ 'field_name' ] ], '</span>');
        })

        return html_str.join ('')
    }

    // 选中省、市、区县
    function doSelect () {
        var
            me = this,
            str = '',

            $wrap = me.getWrap (),
            $selected = $wrap.find ('.selected'),
            $selected_province = $selected.eq (0),
            $selected_city = $selected.eq (1),
            $selected_area = $selected.eq (2),

            // 获取选择器
            $trigger = me.getTrigger (),
            $province = me.getProvinceSelect (),
            $city = me.getCitySelect (),
            $area = me.getAreaSelect ()

        var
            province = $selected_province.html () || '',
            province_id = $selected_province.attr ('data-value') || '',
            city = $selected_city.html () || '',
            city_id = $selected_city.attr ('data-value') || '',
            area = $selected_area.html () || '',
            area_id = $selected_area.attr ('data-value') || ''

        me.options.province = province
        me.options.city = city
        me.options.area = area
        me.options.province_id = province_id
        me.options.city_id = city_id
        me.options.area_id = area_id

        // 设置省
        $province.val (province_id)
        str += '<span class="i-shipping-province">' + province + '</span>'

        // 设置城市
        $city.val (city_id)
        str += ' <span class="i-shipping-city">' + city + '</span>'

        // 设置区县
        $area.val (area_id)
        str += ' <span class="i-shipping-area">' + area + '</span>'

        if(!me.options.not_render){

            $trigger.removeClass ('default').html (str)
        }
    }

    // 设置选中的省市区县
    function setSelect (province, city, area, callback) {
        var
            me = this

        // 初始化获取省市区县列表数据
        me.getProvinceList (function () {
            // 获取省份信息

            var
                province_list = __getProvinceListByCache (me),
                province_id = __getProvinceIdByName (province, province_list)

            // 根据默认省份获取不到省份id,那么将第一个省份当作默认省
            province_id = province_id || province_list[ 0 ][ 'province_id' ]

            // 设置省份html
            var
                $col_province = me.setProvinceHtml (province_list, province_id)
            // 根据选中的item,将列表移动到选中的位置
            setSelectTransYBySelectedItem ($col_province)

            // 设置市/区县
            me.setSelectCityArea (province_id, city, area, callback)

        })
    }

    // 设置市/区县
    function setSelectCityArea (province_id, city, area, callback) {
        if (!province_id) {

            return
        }

        var
            me = this

        // 获取区县数据
        me.getCityAreaList (province_id, function () {
            var
                city_list = __getCityListByCache (province_id, me),
                // 默认选中的城市id
                city_id = __getCityIdByName (city, city_list)

            if (!city_id && city_list && city_list[ 0 ] && city_list[ 0 ][ 'city_id' ]) {
                city_id = city_list[ 0 ][ 'city_id' ]
            }

            // 城市
            var
                $col_city = me.setCityHtml (city_list, city_id)
            // 根据选中的item,将列表移动到选中的位置
            setSelectTransYBySelectedItem ($col_city)

            // 设置区县
            me.setSelectArea (city_id, area, callback)

        })

    }

    // 设置区县
    function setSelectArea (city_id, area, callback) {
        var me = this

        var
            area_list = __getAreaListByCache (city_id, me),
            // 默认选中的区县id
            area_id = __getAreaIdByName (area, area_list)

        if (!area_id && area_list && area_list[ 0 ] && area_list[ 0 ][ 'area_id' ]) {
            area_id = area_list[ 0 ][ 'area_id' ]
        }

        // 区县
        var
            $col_area = me.setAreaHtml (area_list, area_id)
        // 根据选中的item,将列表移动到选中的位置
        setSelectTransYBySelectedItem ($col_area)

        // 执行回调
        $.isFunction (callback) && callback ()
    }

    // 根据选中的item,将列表移动到选中的位置
    function setSelectTransYBySelectedItem ($col) {
        if (!($col && $col.length)) {

            return
        }
        $col.each (function (i, el) {
            var
                $el = $ (el),
                $cover = $el.find ('.item-window'),
                $selected = $el.find ('.selected'),
                el_index = $selected.index (),
                d = -($selected.height () * el_index)

            _moveList ($cover[ 0 ], d)
        })
    }

    // 显示
    function doShow () {
        var
            me = this,
            $wrap = me.getWrap ()

        // 显示遮罩层
        showMask ()

        $wrap.css ({
            'position' : 'fixed',
            'left'     : '0',
            'top'      : '100%',
            'z-index'  : tcb.zIndex (),
            'width'    : '100%'
        })//.show ();

        //如果为android4.0以下系统，由于不支持部分CSS动画，需要特别处理
        if ($.os.android && !compareVersion ($.os.version, "4.0")) {
            $wrap.css ({
                'top'    : 'auto',
                'bottom' : 0
            });
            $.dialog.toast ("抱歉，您的手机系统版本不支持选择", 1600);
        } else {
            $wrap.animate ({ 'translateY' : '1px' }, 10, function () {
                $wrap.hide ()
                setTimeout (function () {
                    $wrap.show ().animate ({ 'translateY' : 0 - $wrap.height () + 'px' }, 200, 'linear')//
                }, 30);
            });
        }

    }

    function doHide () {
        var
            me = this,
            $wrap = me.getWrap ()

        $wrap.animate ({ 'translateY' : 0 }, 200, 'linear', function () {

            $ (this).hide ();

            removeWrap ()

            hideMask ()
        });
    }

    // 初始化
    function init () {
        var me = this,
            options = me.options || {},
            $trigger = me.getTrigger()

        options.flagStorage && __restoreData()

        // 触发切换省、市、地区
        $trigger.on ('click', function (e) {
            e.preventDefault ()

            // shining
            shineClick (this)

            var
                default_province = me.options.province || window.city_name || '北京',
                default_city = me.options.city || '',
                default_area = me.options.area || ''

            // 设置默认选中省份城市区县
            me.setSelect (default_province, default_city, default_area, function () {

                // 绑定基本事件
                me.bindEvent ()

                // 移动事件
                me.bindMoveEvent ()

                // 显示
                me.doShow ()

                //var
                //    $wrap = getWrap(),
                //    $col = $wrap.find('.col')
                //
                //$col.each(function(i, el){
                //    var
                //        $el = $(el),
                //        $cover = $el.find('.item-window'),
                //        $selected = $el.find('.selected'),
                //        el_index = $selected.index()+1,
                //        d = -($selected.height()*el_index)
                //
                //    _moveList($cover[0], d)
                //})
            })

        })

    }

    // 绑定基本事件
    function bindEvent () {
        var
            me = this,
            $wrap = me.getWrap (),
            $item = $wrap.find ('.i-item'),
            $ctrl = $wrap.find ('.ctrl-item')

        // 选择item
        $wrap.on ('click', '.i-item', function (e) {
            e.preventDefault ()

            var
                $me = $ (this)

            $me.addClass ('selected')
                .siblings ('.selected').removeClass ('selected')

            var
                $col = $me.closest ('.col'),
                col_index = $col.index (),
                col_arr = [ 'province',
                            'city',
                            'area' ],
                province,
                city,
                area,
                province_id,
                province_list,
                city_id,
                city_list

            switch (col_arr[ col_index ]) {
                case 'province':
                    province = $me.html ()
                    city = ''
                    area = ''

                    // 获取省份列表
                    province_list = __getProvinceListByCache (me)
                    // 根据省名称,获取省份id
                    province_id = __getProvinceIdByName (province, province_list)

                    me.setSelectCityArea (province_id, city, area)
                    break
                case 'city':
                    province = $col.prev ().find ('.selected').html ()
                    city = $me.html ()
                    area = ''

                    province_list = __getProvinceListByCache (me)
                    province_id = __getProvinceIdByName (province, province_list)
                    city_list = __getCityListByCache (province_id, me)
                    // 默认选中的城市id
                    city_id = __getCityIdByName (city, city_list)

                    me.setSelectArea (city_id, area)
                    break
                case 'area':
                    // do nothing
                    break
            }
        })
        // 点击控制按钮
        $wrap.on ('click', '.ctrl-item', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                action_name = $me.attr ('data-action'),
                action_map = {
                    cancel  : actionCancel,
                    confirm : actionConfirm
                },
                action_fn = action_map[ action_name ]

            if (typeof action_fn !== 'function') {
                // 没有相应的操作，直接返回不做任何处理

                return
            }

            // 执行操作
            action_fn ($me)
        })

        //取消关闭
        function actionCancel ($el) {

            // 关闭wrap层
            me.doHide ()

            if ($.isFunction (me.options.callback_cancel)) {
                var
                    region = {
                        province         : me.options.province,
                        city             : me.options.city,
                        area             : me.options.area,
                        province_id      : me.options.province_id,
                        city_id          : me.options.city_id,
                        area_id          : me.options.area_id
                    }
                me.options.callback_cancel (region)
            }
        }

        //确认选择
        function actionConfirm ($el) {

            // 选择确定的省/市/区县
            me.doSelect ()
            // 关闭wrap层
            me.doHide ()

            if ($.isFunction (me.options.callback_confirm)) {
                var
                    region = {
                        province         : me.options.province,
                        city             : me.options.city,
                        area             : me.options.area,
                        province_id      : me.options.province_id,
                        city_id          : me.options.city_id,
                        area_id          : me.options.area_id
                    }
                me.options.callback_confirm (region, me.getTrigger())
            }
        }
    }



    Bang.AddressSelect = function (options) {

        return new AddressSelect (options)
    }



    //================= private ===================

    function __restoreData(){
        if (isSupportLocalStorage && isSupportJSON){
            var storage = window.localStorage

            CacheProvinceList = JSON.parse (storage.getItem ('TCB_HS_ProvinceList') || '[]')
            CacheCityList = JSON.parse (storage.getItem ('TCB_HS_CityList') || '{}')
            CacheAreaList = JSON.parse (storage.getItem ('TCB_HS_AreaList') || '{}')
        }
    }

    // 存储省份列表
    function __storeProvinceList(ProvinceList, inst) {
        if (!(ProvinceList && ProvinceList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheProvinceList = ProvinceList
        }
        CacheProvinceList = ProvinceList
        if (isSupportLocalStorage && isSupportJSON){
            var storage = window.localStorage
            storage.setItem('TCB_HS_ProvinceList', JSON.stringify(CacheProvinceList))
        }
        return CacheProvinceList
    }

    // 存储城市列表
    function __storeCityList (province_id, CityList, inst) {
        if (!(CityList && CityList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheCityList[ province_id ] = CityList
        }
        CacheCityList[ province_id ] = CityList
        if (isSupportLocalStorage && isSupportJSON){
            var storage = window.localStorage
            storage.setItem('TCB_HS_CityList', JSON.stringify(CacheCityList))
        }

        return CacheCityList[ province_id ]
    }

    // 存储区县列表
    function __storeAreaList(city_id, AreaList, inst) {
        if (!(AreaList && AreaList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheAreaList[ city_id ] = AreaList
        }
        CacheAreaList[ city_id ] = AreaList
        if (isSupportLocalStorage && isSupportJSON){
            var storage = window.localStorage
            storage.setItem('TCB_HS_AreaList', JSON.stringify(CacheAreaList))
        }
        return CacheAreaList[ city_id ]
    }

    // cache中获取省份列表
    function __getProvinceListByCache (inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheProvinceList
        }
        return CacheProvinceList
    }

    // cache中获取城市列表
    function __getCityListByCache (province_id, inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheCityList[province_id]
        }
        return CacheCityList[province_id]
    }

    // cache中获取区县列表
    function __getAreaListByCache (city_id, inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheAreaList[city_id]
        }
        return CacheAreaList[city_id]
    }

    // 根据省份名称，获取省份id
    function __getProvinceIdByName (province_name, province_list) {
        if (!(province_name && $.isArray (province_list))) {
            return
        }
        var
            province_id
        $.each (province_list, function (i, item) {
            if (province_name == item[ 'province_name' ]) {
                province_id = item[ 'province_id' ]

                return false
            }
        })

        return province_id
    }

    // 根据城市名称，获取城市id
    function __getCityIdByName (city_name, city_list) {
        if (!(city_name && $.isArray (city_list))) {
            return;
        }
        var
            city_id
        $.each (city_list, function (i, item) {
            if (city_name == item[ 'city_name' ]) {
                city_id = item[ 'city_id' ]

                return false
            }
        })

        return city_id
    }

    // 根据城市名称，获取城市id
    function __getAreaIdByName (area_name, area_list) {
        if (!(area_name && $.isArray (area_list))) {
            return;
        }
        var
            area_id
        $.each (area_list, function (i, item) {
            if (area_name == item[ 'area_name' ]) {
                area_id = item[ 'area_id' ]

                return false
            }
        })

        return area_id
    }

    // 获取地区选择器
    function getWrap () {
        var
            me = this,
            $wrap = $ ('#BottomSelectWrap')

        if (!($wrap && $wrap.length)) {

            var
                col = 3,
                tit = [ '',
                        '',
                        '' ],
                html_st = [],
                col_show = col

            if (!me.options.show_area) {
                // 不展示区县

                col_show = col - 1
            }
            if (!me.options.show_city) {
                // 不展示城市+区县

                col_show = col - 2
            }

            // 外框
            html_st.push ('<div class="shipping-address-select-block" id="BottomSelectWrap">')

            // 主体列表
            html_st.push ('<div class="dt-table dt-table-', col_show, '-col">')
            //for (var i = 0; i < col; i++) {
            for (var i = 0; i < col_show; i++) {
                html_st.push ('<div class="col">') // col-', col, '-1
                html_st.push ('<div class="tit">', tit[ i ], '</div>')

                html_st.push ('<div class="item-select">',
                    '<div class="item-window">',
                    '<span class="i-w-line"></span>',
                    '<span class="i-w-line"></span>',
                    '</div>',
                    '<div class="item-list">',

                    '</div>',
                    '</div>');

                html_st.push ('</div>');
            }
            html_st.push ('</div>');

            // 控制行
            html_st.push ('<div class="ctrl-box">',
                '<span class="ctrl-item ctrl-cancel" data-action="cancel">取消</span>',
                '<span class="ctrl-item ctrl-ok" data-action="confirm">确定</span>',
                '</div>');

            html_st.push ('</div>');

            html_st = html_st.join ('')

            $wrap = $ (html_st).appendTo ($ ('body'))//.hide ()
        }

        return $wrap
    }

    // 删除地区选择器
    function removeWrap () {
        var
            $wrap = $ ('#BottomSelectWrap')

        if ($wrap && $wrap.length) {

            $wrap.remove ()
        }
    }

    function showMask () {
        var
            $mask = $ ('#BottomSelectWrapMask')

        if (!($mask && $mask.length)) {

            var
                mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;display: block;width: 100%;height: 100%;background:rgba(0, 0, 0, 0.2);',
                mask_html = '<a id="BottomSelectWrapMask" href="#" style="' + mask_css + '"></a>'

            $mask = $ (mask_html).appendTo (document.body);

            $mask.on ('click', function (e) {
                e.preventDefault ()

            })
        }

        $mask.css ({
            'z-index' : tcb.zIndex (),
            'display' : 'block'
        })
    }

    function hideMask () {
        var
            $mask = $ ('#BottomSelectWrapMask')

        if ($mask && $mask.length) {

            $mask.hide ()
        }
    }


    // 绑定滑动事件
    function bindMoveEvent () {
        var
            me = this,
            $wrap = me.getWrap (),
            $cover = $wrap.find ('.item-window')

        //touch start
        $cover.on ('touchstart', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $list = $me.parents ('.item-select').find ('.item-list'),
                startY = e.touches[ 0 ].clientY

            $list.data ('scrollY', parseInt (_getTransY ($list)))
                .data ('startY', startY)
                .data ('isMove', 'yes')
                .data ('startTime', new Date ().getTime ());
        })

        //touch move
        $cover.on ('touchmove', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $list = $me.parents ('.item-select').find ('.item-list');

            if ($list.data ('isMove') != 'yes') {

                return false
            }

            var
                startY = $list.data ('startY'),
                endY = e.touches[ 0 ].clientY,
                detY = endY - startY;

            // 移动选择列表
            _moveList (this, detY);
        }, {passive : false})

        //touch end
        $cover.on ('touchend', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $list = $me.parents ('.item-select').find ('.item-list')

            if ($list.data ('isMove') != 'yes') {

                return false
            }

            var // 垂直移动距离
                detY = _getTransY ($list) - $list.data ('scrollY'),
                // 滑动时间
                detT = new Date ().getTime () - $list.data ('startTime')
            // 移动结束
            _moveEnd (this, detY, detT)

            // 移动结束,重置数据
            $list.data ('scrollY', 0)
                .data ('startY', 0)
                .data ('isMove', '')
                .data ('startTime', 0)

        })
    }

    // 移动列表
    function _moveList (el, detY) {
        var
            $el = $ (el),
            $node = $el.parents ('.item-select'),
            $list = $node.find ('.item-list'),
            $item = $list.find ('.i-item').filter (function () {
                return !$ (this).hasClass ('disabled')
            }),
            unit_height = $node.height () / 3,
            transY_max = ($item.length - 1) * unit_height,
            scrollY = parseInt ($list.data ('scrollY'), 10) || 0

        scrollY += detY - 0

        if (scrollY > 0 || scrollY < (0 - transY_max)) {

            return
        }

        //$list.animate({'translateY': scrollY + 'px'}, 0);
        $list.css ('-webkit-transform', 'translateY(' + scrollY + 'px)')

        //$item.eq (Math.round (Math.abs (scrollY / unit_height))).trigger ('click')
    }

    // 移动结束
    function _moveEnd (el, detY, detT) {
        var
            $el = $ (el),
            $node = $el.parents ('.item-select'),
            $list = $node.find ('.item-list'),
            $item = $list.find ('.i-item').filter (function () {
                return !$ (this).hasClass ('disabled')
            }),
            unit_height = $node.height () / 3,
            transY_max = ($item.length - 1) * unit_height,
            endTop = parseInt (_getTransY ($list)),
            lastTop = (  Math.round (endTop / unit_height) ) * unit_height;

        var
            ZN_NUM = 0.25
        if (Math.abs (detY / detT) > ZN_NUM) {//惯性
            var
                pastNum = ((detY / detT) / ZN_NUM),
                morePastY = Math.floor (pastNum * unit_height)

            lastTop += morePastY

            lastTop = Math.min (Math.max (0 - transY_max, lastTop), 0)

            lastTop = (  Math.round (lastTop / unit_height) ) * unit_height

            $list.animate ({ 'translateY' : lastTop + 'px' }, 300 - 0 + Math.ceil (Math.abs (pastNum)) * 100, 'ease-out')
        } else {
            $list.animate ({ 'translateY' : lastTop + 'px' }, 160, 'linear')
        }

        //$item.eq (Math.floor (Math.abs (lastTop / unit_height))).trigger ('click');
        var
            item_pos = Math.floor (Math.round (Math.abs (lastTop * 100 / unit_height)) / 100)
        $item.eq (item_pos).trigger ('click')
    }

    // 获取元素垂直方向变形位移
    function _getTransY (el) {
        var
            $el = $ (el),
            trans = $el.css ('transform')
                || $el.css ('-webkit-transform')
                || $el[ 0 ].style.webkitTransform,
            transY = 0

        if (trans.indexOf ('translateY') > -1) {
            transY = trans.replace (/translateY\((\-?[\d\.]+)px\)/, function (m, n) { return n || 0})
        }
        if (trans.indexOf ('matrix') > -1) {
            transY = trans.replace (/matrix\(\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*(\-?[\d\.]+)\)/, function (m, n) { return n || 0})
        }

        return transY
    }

    // 比较版本
    function compareVersion (src, dest) {
        return _version2Num (src) >= _version2Num (dest);
    }

    // 版本变成数字
    function _version2Num (v) {
        var arr = v.split (/\./);
        if (arr.length > 2) {
            arr.length = 2;
        } else if (arr.length == 1) {
            arr[ 1 ] = "0";
        }
        var vn = arr.join (".");
        vn -= 0;
        return vn;
    }

    // shine click action
    function shineClick (el, duration) {

        el = $ (el)
        duration = parseInt (duration, 10) || 500

        el.each (function () {
            var
                me = this,
                orig_background_color = me.style.backgroundColor

            me.style.backgroundColor = '#f0f0f0'

            setTimeout(function(){

                $ (me).animate ({ 'background-color' : orig_background_color }, duration, 'cubic-bezier(.28,.2,.51,1.15)', function () {
                    me.style.backgroundColor = orig_background_color || ''
                })

            }, 300)
        })
    }

    /**
     * 加载中
     * @returns {boolean}
     */
    function isLoading (key) {
        key = key || 'KEY_GLOBAL_LOADING'
        return tcb.cache (key)
            ? true
            : false
    }

    /**
     * 设置加载状态
     * @param flag
     * @returns {boolean}
     */
    function setLoading (flag, key) {
        flag = flag
            ? true
            : false
        key = key || 'KEY_GLOBAL_LOADING'

        return tcb.cache (key, flag)
    }


} ())


;/**import from `/resource/js/component/m/address_select2.js` **/
;
(function () {
    var Bang
        = window.Bang
        = window.Bang || {}

    var defaults = {
            className: '',
            // 根据省一次性获取所有的城市和区县信息
            //flagGetAll       : false,
            // 实例化的时候自动执行init函数
            flagAutoInit: true,
            flagStorage: true,
            // 触发器
            selectorTrigger: '.province-city-area',
            // 省、市、区县的选择器
            selectorProvince: '[name="receiver_province_id"]',
            selectorCity: '[name="receiver_city_id"]',
            selectorArea: '[name="receiver_area_id"]',

            url_province: '/api/BasicServer/AdministrativeDivisions/province',
            url_city_area: '/aj/doGetProvinceLinkage',
            url_city: '/api/BasicServer/AdministrativeDivisions/city',
            url_area: '/api/BasicServer/AdministrativeDivisions/area',

            // 默认的省、市、区县
            province: '',
            city: '',
            area: '',
            provinceCode: '',
            cityCode: '',
            areaCode: '',

            // 是否显示城市\区县
            show_city: true,
            show_area: true,
            // 默认输出选择的省市区县
            not_render: false,
            // 初始化后的回调函数
            callback_init: null,
            // 显示时
            callback_on_show: null,
            // 回调函数(确认/取消)
            callback_confirm: null,
            callback_cancel: null
        },
        // cache省列表
        CacheProvinceList = [],
        // cache市列表
        CacheCityList = {},
        // cache区县列表
        CacheAreaList = {},

        selected_province = null,
        selected_city = null,
        selected_area = null,
        isSupportLocalStorage = tcb.supportLocalStorage(),
        isSupportJSON = (typeof JSON != 'undefined') && (typeof JSON.stringify == 'function') && (typeof JSON.parse == 'function') ? true : false

    function AddressSelect2(options) {
        var me = this

        options = $.extend({}, defaults, options)

        me.options = options

        if (!me.options.flagStorage) {
            me.CacheProvinceList = []
            me.CacheCityList = {}
            me.CacheAreaList = {}
        }

        if (me.options.flagAutoInit) {

            me.init()
        }
    }

    // 设置原型方法
    AddressSelect2.prototype = {

        constructor: AddressSelect2,

        getWrap: getWrap,

        getTrigger: getTrigger,
        getProvinceSelect: getProvinceSelect,
        getCitySelect: getCitySelect,
        getAreaSelect: getAreaSelect,

        setProvinceHtml: setProvinceHtml,
        setCityHtml: setCityHtml,
        setAreaHtml: setAreaHtml,

        getProvinceList: getProvinceList,
        getCityList: getCityList,
        getAreaList: getAreaList,
        getProvinceCityAreaListByName: getProvinceCityAreaListByName,

        bindEvent: bindEvent,
        bindMoveEvent: bindMoveEvent,

        setSelect: setSelect,
        setConfirmSelectedData: setConfirmSelectedData,

        doShow: doShow,
        doHide: doHide,

        initTriggerData: initTriggerData,
        init: init
    }

    // 获取触发器
    function getTrigger() {
        var
            me = this,
            selectorTrigger = me.options.selectorTrigger

        return $(selectorTrigger)
    }

    // 获取省选择器
    function getProvinceSelect() {
        var
            me = this,
            selectorProvince = me.options.selectorProvince

        return $(selectorProvince)
    }

    // 获取城市选择器
    function getCitySelect() {
        var
            me = this,
            selectorCity = me.options.selectorCity

        return $(selectorCity)
    }

    // 获取地区选择器
    function getAreaSelect() {
        var
            me = this,
            selectorArea = me.options.selectorArea

        return $(selectorArea)
    }

    // 设置确认选中的数据
    function setConfirmSelectedData(region) {
        var me = this,
            // 获取选择器
            $trigger = me.getTrigger(),
            $province = me.getProvinceSelect(),
            $city = me.getCitySelect(),
            $area = me.getAreaSelect(),
            str = ''

        me.options.province = region.province
        me.options.provinceCode = region.provinceCode
        me.options.city = region.city
        me.options.cityCode = region.cityCode
        me.options.area = region.area
        me.options.areaCode = region.areaCode

        // 设置省
        $province.val(region.provinceCode)
        str += '<span class="i-shipping-province">' + region.province + '</span>'

        // 设置城市
        $city.val(region.cityCode)
        str += ' <span class="i-shipping-city">' + region.city + '</span>'

        // 设置区县
        $area.val(region.areaCode)
        str += ' <span class="i-shipping-area">' + region.area + '</span>'

        if (!me.options.not_render) {
            $trigger.removeClass('default').html(str)
        }
    }

    // 获取省份列表
    function getProvinceList(callback) {
        var me = this
        var options = me.options
        var url_province = options.url_province
        var province_list = __getProvinceListByCache(me)

        if (province_list && province_list.length) {
            $.isFunction(callback) && callback()
        } else {
            if (isLoading('KEY_GLOBAL_LOADING_PROVINCE')) {
                return
            }
            setLoading(true, 'KEY_GLOBAL_LOADING_PROVINCE')

            $.ajax({
                url: tcb.setUrl2(url_province),
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    if (!res['errCode']) {
                        var data = res['data']
                        if (!tcb.isArray(data)) {
                            var _data = []
                            tcb.each(data, function (code, name) {
                                _data.push({
                                    code: code,
                                    name: name
                                })
                            })
                            data = _data
                        }
                        __storeProvinceList(data, me)

                        $.isFunction(callback) && callback()
                    } else {
                        // do nothing
                    }
                },
                complete: function () {
                    setLoading(false, 'KEY_GLOBAL_LOADING_PROVINCE')
                }
            })
        }
    }

    // 获取城市列表
    function getCityList(provinceCode, callback) {
        if (!provinceCode) {
            return
        }
        var me = this
        var options = me.options
        var url_city = options.url_city
        var city_list = __getCityListByCache(provinceCode, me)
        if (city_list && city_list.length) {
            $.isFunction(callback) && callback()
        } else {
            if (isLoading('KEY_GLOBAL_LOADING_CITY')) {
                return
            }
            setLoading(true, 'KEY_GLOBAL_LOADING_CITY')

            $.ajax({
                url: tcb.setUrl2(url_city),
                type: 'GET',
                data: {
                    provinceCode: provinceCode
                },
                dataType: 'json',
                success: function (res) {
                    if (!res['errCode']) {
                        var data = res['data']
                        if (!tcb.isArray(data)) {
                            var _data = []
                            tcb.each(data, function (code, name) {
                                _data.push({
                                    code: code,
                                    name: name
                                })
                            })
                            data = _data
                        }
                        __storeCityList(provinceCode, data, me)

                        $.isFunction(callback) && callback()
                    } else {
                        // do nothing
                    }
                },
                complete: function () {
                    setLoading(false, 'KEY_GLOBAL_LOADING_CITY')
                }
            })
        }
    }

    // 获取区县列表
    function getAreaList(cityCode, callback) {
        if (!cityCode) {
            return
        }
        var me = this
        var options = me.options
        var url_area = options.url_area
        var area_list = __getAreaListByCache(cityCode, me)

        if (area_list && area_list.length) {
            $.isFunction(callback) && callback()
        } else {
            if (isLoading('KEY_GLOBAL_LOADING_AREA')) {
                return
            }
            setLoading(true, 'KEY_GLOBAL_LOADING_AREA')

            $.ajax({
                url: tcb.setUrl2(url_area),
                type: 'GET',
                data: {cityCode: cityCode},
                dataType: 'json',
                success: function (res) {
                    if (!res['errCode']) {
                        var data = res['data']
                        if (!tcb.isArray(data)) {
                            var _data = []
                            tcb.each(data, function (code, name) {
                                _data.push({
                                    code: code,
                                    name: name
                                })
                            })
                            data = _data
                        }
                        __storeAreaList(cityCode, data, me)

                        $.isFunction(callback) && callback()
                    } else {
                        // do nothing
                    }
                },
                complete: function () {
                    setLoading(false, 'KEY_GLOBAL_LOADING_AREA')
                }
            })
        }
    }

    // 根据省市区县名称获取省市区县列表
    function getProvinceCityAreaListByName(province, city, area, callback) {
        var me = this
        var options = me.options
        var region = {}
        var provinceCityArea = {}
        // 获取省份列表
        me.getProvinceList(function () {
            // 获取省份信息
            var provinceList = __getProvinceListByCache(me),
                // 根据默认省份获取不到省份id,那么将第一个省份当作默认省
                provinceCode = __getProvinceCodeByName(province, provinceList) || provinceList[0]['code']
            if (!provinceCode && provinceList && provinceList[0] && provinceList[0]['code']) {
                provinceCode = provinceList[0]['code']
                province = provinceList[0]['name']
            }
            provinceCityArea.provinceList = provinceList
            region.province = province
            region.provinceCode = provinceCode
            if (options.show_city && provinceCode) {
                // 获取城市列表
                me.getCityList(provinceCode, function () {
                    var cityList = __getCityListByCache(provinceCode, me),
                        // 默认选中的城市code
                        cityCode = __getCityCodeByName(city, cityList)

                    if (!cityCode && cityList && cityList[0] && cityList[0]['code']) {
                        cityCode = cityList[0]['code']
                        city = cityList[0]['name']
                    }
                    provinceCityArea.cityList = cityList
                    region.city = city
                    region.cityCode = cityCode

                    if (options.show_area && cityCode) {
                        // 获取区县列表
                        me.getAreaList(cityCode, function () {
                            var areaList = __getAreaListByCache(cityCode, me),
                                // 默认选中的区县id
                                areaCode = __getAreaCodeByName(area, areaList)

                            if (!areaCode && areaList && areaList[0] && areaList[0]['code']) {
                                areaCode = areaList[0]['code']
                                area = areaList[0]['name']
                            }
                            provinceCityArea.areaList = areaList
                            region.area = area
                            region.areaCode = areaCode

                            // 执行回调
                            $.isFunction(callback) && callback(region, provinceCityArea)
                        })
                    } else {
                        // 执行回调
                        $.isFunction(callback) && callback(region, provinceCityArea)
                    }
                })
            } else {
                // 执行回调
                $.isFunction(callback) && callback(region, provinceCityArea)
            }
        })
    }

    // 设置省份html
    function setProvinceHtml(data, selected_id) {
        var me = this
        var html_st = genHtml('province', data, selected_id),
            $wrap = me.getWrap(),
            $col = $wrap.find('.col').eq(0)

        $col.find('.item-list').html(html_st)

        return $col
    }

    // 设置城市html
    function setCityHtml(data, selected_id) {
        var me = this
        var html_st = genHtml('city', data, selected_id),
            $wrap = me.getWrap(),
            $col = $wrap.find('.col').eq(1)

        $col.find('.item-list').html(html_st)
        return $col
    }

    // 设置地区html
    function setAreaHtml(data, selected_id) {
        var me = this
        var html_st = genHtml('area', data, selected_id),
            $wrap = me.getWrap(),
            $col = $wrap.find('.col').eq(2)

        $col.find('.item-list').html(html_st)
        return $col
    }

    // 根据type生成省/市/区县的html
    function genHtml(type, data, selected_id) {
        data = data || []
        var type_arr = ['province', 'city', 'area'],
            type_map = {
                province: {
                    field_id: 'code',
                    field_name: 'name'
                },
                city: {
                    field_id: 'code',
                    field_name: 'name'
                },
                area: {
                    field_id: 'code',
                    field_name: 'name'
                }
            },
            html_str = []

        if ($.inArray(type, type_arr) == -1) {
            type = type_arr[0]
        }

        $.each(data, function (i, item) {
            html_str.push('<span class="i-item')
            if (selected_id === item[type_map[type]['field_id']]) {
                html_str.push(' selected')
            }
            html_str.push('" data-value="', item[type_map[type]['field_id']], '">', item[type_map[type]['field_name']], '</span>')
        })

        return html_str.join('')
    }

    // 设置选中的省市区县
    function setSelect(province, city, area, callback, options) {
        var me = this
        options = options || {}

        // 初始化获取省市区县列表数据
        me.getProvinceCityAreaListByName(province, city, area,
            function (region, provinceCityArea) {
                if (region.provinceCode && !options.not_render_province) {
                    // 设置省份html
                    var $col_province = me.setProvinceHtml(provinceCityArea.provinceList, region.provinceCode)
                    // 根据选中的item,将列表移动到选中的位置
                    setSelectTransYBySelectedItem($col_province)
                }
                if (region.cityCode && !options.not_render_city) {
                    // 城市
                    var $col_city = me.setCityHtml(provinceCityArea.cityList, region.cityCode)
                    // 根据选中的item,将列表移动到选中的位置
                    setSelectTransYBySelectedItem($col_city)
                }
                if (region.areaCode && !options.not_render_area) {
                    // 区县
                    var $col_area = me.setAreaHtml(provinceCityArea.areaList, region.areaCode)
                    // 根据选中的item,将列表移动到选中的位置
                    setSelectTransYBySelectedItem($col_area)
                }
                // 执行回调
                $.isFunction(callback) && callback(region, provinceCityArea)
            }
        )
    }

    // 根据选中的item,将列表移动到选中的位置
    function setSelectTransYBySelectedItem($col) {
        if (!($col && $col.length)) {
            return
        }
        $col.each(function (i, el) {
            var $el = $(el),
                $cover = $el.find('.item-window'),
                $selected = $el.find('.selected'),
                el_index = $selected.index(),
                d = -($selected.height() * el_index)

            _moveList($cover[0], d)
        })
    }

    // 显示
    function doShow() {
        var me = this,
            $wrap = me.getWrap(),
            options = me.options || {}

        me.options.className && $wrap.addClass(me.options.className)

        typeof options.callback_on_show === 'function' && options.callback_on_show(me)

        // 显示遮罩层
        showMask()

        $wrap.css({
            'position': 'fixed',
            'left': '0',
            'top': '100%',
            'z-index': tcb.zIndex(),
            'width': '100%'
        })//.show ();

        //如果为android4.0以下系统，由于不支持部分CSS动画，需要特别处理
        if ($.os.android && !compareVersion($.os.version, '4.0')) {
            $wrap.css({
                'top': 'auto',
                'bottom': 0
            })
            $.dialog.toast('抱歉，您的手机系统版本不支持选择', 1600)
        } else {
            $wrap.animate({'translateY': '1px'}, 10, function () {
                $wrap.hide()
                setTimeout(function () {
                    $wrap.show().animate({'translateY': 0 - $wrap.height() + 'px'}, 200, 'linear')//
                }, 30)
            })
        }

    }

    function doHide() {
        var
            me = this,
            $wrap = me.getWrap()

        $wrap.animate({'translateY': 0}, 200, 'linear', function () {

            $(this).hide()

            removeWrap()

            hideMask()
        })
    }

    // 初始化
    function init() {
        var me = this,
            options = me.options || {},
            $trigger = me.getTrigger()

        options.flagStorage && __restoreData()

        // 触发切换省、市、地区
        $trigger.on('click', function (e) {
            e.preventDefault()

            // shining
            shineClick(this)

            var default_province = me.options.province || window.city_name,
                default_city = me.options.city || '',
                default_area = me.options.area || ''

            // 设置默认选中省份城市区县
            me.setSelect(default_province, default_city, default_area, function () {

                // 绑定基本事件
                me.bindEvent()

                // 移动事件
                me.bindMoveEvent()

                // 显示
                me.doShow()
            })
        })

        me.initTriggerData(function (region) {
            $.isFunction(me.options.callback_init) && me.options.callback_init(region, $trigger)
        })
    }

    // 绑定基本事件
    function bindEvent() {
        var me = this,
            $wrap = me.getWrap()

        // 选择item
        $wrap.on('click', '.i-item', function (e) {
            e.preventDefault()

            var $me = $(this)

            $me.addClass('selected')
               .siblings('.selected').removeClass('selected')

            var $col = $me.closest('.col'),
                col_index = $col.index(),
                col_arr = ['province', 'city', 'area'],
                province, city, area,
                options = {}

            switch (col_arr[col_index]) {
                case 'province':
                    province = $me.html()
                    city = ''
                    area = ''
                    options.not_render_province = true
                    break
                case 'city':
                    province = $col.prev().find('.selected').html()
                    city = $me.html()
                    area = ''
                    options.not_render_province = true
                    options.not_render_city = true
                    break
                case 'area':
                    // do nothing
                    break
            }

            province &&
            me.setSelect(province, city, area, null, options)
        })
        // 点击控制按钮
        $wrap.on('click', '.ctrl-item', function (e) {
            e.preventDefault()

            var $me = $(this),
                action_name = $me.attr('data-action'),
                action_map = {
                    cancel: actionCancel,
                    confirm: actionConfirm
                },
                action_fn = action_map[action_name]

            if (typeof action_fn !== 'function') {
                // 没有相应的操作，直接返回不做任何处理

                return
            }

            // 执行操作
            action_fn($me)
        })

        //取消关闭
        function actionCancel($el) {
            // 关闭wrap层
            me.doHide()

            if ($.isFunction(me.options.callback_cancel)) {
                var region = {
                    province: me.options.province,
                    city: me.options.city,
                    area: me.options.area,
                    provinceCode: me.options.provinceCode,
                    cityCode: me.options.cityCode,
                    areaCode: me.options.areaCode
                }
                me.options.callback_cancel(region)
            }
        }

        //确认选择
        function actionConfirm($el) {
            var $selected = $wrap.find('.selected'),
                $selected_province = $selected.eq(0),
                $selected_city = $selected.eq(1),
                $selected_area = $selected.eq(2)
            var region = {
                province: $selected_province.html() || '',
                provinceCode: $selected_province.attr('data-value') || '',
                city: $selected_city.html() || '',
                cityCode: $selected_city.attr('data-value') || '',
                area: $selected_area.html() || '',
                areaCode: $selected_area.attr('data-value') || ''
            }

            // 设置选中数据
            me.setConfirmSelectedData(region)

            // 关闭wrap层
            me.doHide()

            if ($.isFunction(me.options.callback_confirm)) {
                me.options.callback_confirm(region, me.getTrigger())
            }
        }
    }

    Bang.AddressSelect2 = function (options) {
        return new AddressSelect2(options)
    }


    //================= private ===================

    function __restoreData() {
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage

            CacheProvinceList = JSON.parse(storage.getItem('TCB_HS_ProvinceList2') || '[]')
            CacheCityList = JSON.parse(storage.getItem('TCB_HS_CityList2') || '{}')
            CacheAreaList = JSON.parse(storage.getItem('TCB_HS_AreaList2') || '{}')
        }
    }

    // 存储省份列表
    function __storeProvinceList(ProvinceList, inst) {
        if (!(ProvinceList && ProvinceList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheProvinceList = ProvinceList
        }
        CacheProvinceList = ProvinceList
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage
            storage.setItem('TCB_HS_ProvinceList2', JSON.stringify(CacheProvinceList))
        }
        return CacheProvinceList
    }

    // 存储城市列表
    function __storeCityList(provinceCode, CityList, inst) {
        if (!(CityList && CityList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheCityList[provinceCode] = CityList
        }
        CacheCityList[provinceCode] = CityList
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage
            storage.setItem('TCB_HS_CityList2', JSON.stringify(CacheCityList))
        }

        return CacheCityList[provinceCode]
    }

    // 存储区县列表
    function __storeAreaList(cityCode, AreaList, inst) {
        if (!(AreaList && AreaList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheAreaList[cityCode] = AreaList
        }
        CacheAreaList[cityCode] = AreaList
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage
            storage.setItem('TCB_HS_AreaList2', JSON.stringify(CacheAreaList))
        }
        return CacheAreaList[cityCode]
    }

    function initTriggerData(callback) {
        var me = this
        var default_province = me.options.province || '',
            default_city = me.options.city || '',
            default_area = me.options.area || ''

        // 设置默认选中省份城市区县
        me.getProvinceCityAreaListByName(default_province, default_city, default_area,
            function (region, provinceCityArea) {/*console.log(region)*/
                // 设置选中数据
                me.setConfirmSelectedData(region)

                $.isFunction(callback) && callback(region, me.getTrigger())
            }
        )
    }

    // cache中获取省份列表
    function __getProvinceListByCache(inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheProvinceList
        }
        return CacheProvinceList
    }

    // cache中获取城市列表
    function __getCityListByCache(provinceCode, inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheCityList[provinceCode]
        }
        return CacheCityList[provinceCode]
    }

    // cache中获取区县列表
    function __getAreaListByCache(cityCode, inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheAreaList[cityCode]
        }
        return CacheAreaList[cityCode]
    }

    // 根据省份名称，获取省份code
    function __getProvinceCodeByName(province_name, province_list) {
        if (!(province_name && $.isArray(province_list))) {
            return
        }
        var provinceCode
        $.each(province_list, function (i, item) {
            if (province_name == item['name']) {
                provinceCode = item['code']

                return false
            }
        })

        return provinceCode
    }

    // 根据城市名称，获取城市code
    function __getCityCodeByName(city_name, city_list) {
        if (!(city_name && $.isArray(city_list))) {
            return
        }
        var cityCode
        $.each(city_list, function (i, item) {
            if (city_name == item['name']) {
                cityCode = item['code']

                return false
            }
        })

        return cityCode
    }

    // 根据城市名称，获取区县code
    function __getAreaCodeByName(area_name, area_list) {
        if (!(area_name && $.isArray(area_list))) {
            return
        }
        var areaCode
        $.each(area_list, function (i, item) {
            if (area_name == item['name']) {
                areaCode = item['code']

                return false
            }
        })

        return areaCode
    }

    // 获取地区选择器
    function getWrap() {
        var
            me = this,
            $wrap = $('#BottomSelectWrap')

        if (!($wrap && $wrap.length)) {

            var
                col = 3,
                tit = ['',
                    '',
                    ''],
                html_st = [],
                col_show = col

            if (!me.options.show_area) {
                // 不展示区县

                col_show = col - 1
            }
            if (!me.options.show_city) {
                // 不展示城市+区县

                col_show = col - 2
            }

            // 外框
            html_st.push('<div class="shipping-address-select-block" id="BottomSelectWrap">')

            // 主体列表
            html_st.push('<div class="dt-table dt-table-', col_show, '-col">')
            //for (var i = 0; i < col; i++) {
            for (var i = 0; i < col_show; i++) {
                html_st.push('<div class="col">') // col-', col, '-1
                html_st.push('<div class="tit">', tit[i], '</div>')

                html_st.push('<div class="item-select">',
                    '<div class="item-window">',
                    '<span class="i-w-line"></span>',
                    '<span class="i-w-line"></span>',
                    '</div>',
                    '<div class="item-list">',

                    '</div>',
                    '</div>')

                html_st.push('</div>')
            }
            html_st.push('</div>')

            // 控制行
            html_st.push('<div class="ctrl-box">',
                '<span class="ctrl-item ctrl-cancel" data-action="cancel">取消</span>',
                '<span class="ctrl-item ctrl-ok" data-action="confirm">确定</span>',
                '</div>')

            html_st.push('</div>')

            html_st = html_st.join('')

            $wrap = $(html_st).appendTo($('body'))//.hide ()
        }
        return $wrap
    }

    // 删除地区选择器
    function removeWrap() {
        var
            $wrap = $('#BottomSelectWrap')

        if ($wrap && $wrap.length) {

            $wrap.remove()
        }
    }

    function showMask() {
        var
            $mask = $('#BottomSelectWrapMask')

        if (!($mask && $mask.length)) {

            var
                mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;display: block;width: 100%;height: 100%;background:rgba(0, 0, 0, 0.2);',
                mask_html = '<a id="BottomSelectWrapMask" href="#" style="' + mask_css + '"></a>'

            $mask = $(mask_html).appendTo(document.body)

            $mask.on('click', function (e) {
                e.preventDefault()

            })
        }

        $mask.css({
            'z-index': tcb.zIndex(),
            'display': 'block'
        })
    }

    function hideMask() {
        var
            $mask = $('#BottomSelectWrapMask')

        if ($mask && $mask.length) {

            $mask.hide()
        }
    }


    // 绑定滑动事件
    function bindMoveEvent() {
        var
            me = this,
            $wrap = me.getWrap(),
            $cover = $wrap.find('.item-window')

        //touch start
        $cover.on('touchstart', function (e) {
            e.preventDefault()

            var
                $me = $(this),
                $list = $me.parents('.item-select').find('.item-list'),
                startY = e.touches[0].clientY

            $list.data('scrollY', parseInt(_getTransY($list)))
                 .data('startY', startY)
                 .data('isMove', 'yes')
                 .data('startTime', new Date().getTime())
        })

        //touch move
        $cover.on('touchmove', function (e) {
            e.preventDefault()

            var
                $me = $(this),
                $list = $me.parents('.item-select').find('.item-list')

            if ($list.data('isMove') != 'yes') {

                return false
            }

            var
                startY = $list.data('startY'),
                endY = e.touches[0].clientY,
                detY = endY - startY

            // 移动选择列表
            _moveList(this, detY)
        }, {passive: false})

        //touch end
        $cover.on('touchend', function (e) {
            e.preventDefault()

            var
                $me = $(this),
                $list = $me.parents('.item-select').find('.item-list')

            if ($list.data('isMove') != 'yes') {

                return false
            }

            var // 垂直移动距离
                detY = _getTransY($list) - $list.data('scrollY'),
                // 滑动时间
                detT = new Date().getTime() - $list.data('startTime')
            // 移动结束
            _moveEnd(this, detY, detT)

            // 移动结束,重置数据
            $list.data('scrollY', 0)
                 .data('startY', 0)
                 .data('isMove', '')
                 .data('startTime', 0)

        })
    }

    // 移动列表
    function _moveList(el, detY) {
        var
            $el = $(el),
            $node = $el.parents('.item-select'),
            $list = $node.find('.item-list'),
            $item = $list.find('.i-item').filter(function () {
                return !$(this).hasClass('disabled')
            }),
            unit_height = $node.height() / 3,
            transY_max = ($item.length - 1) * unit_height,
            scrollY = parseInt($list.data('scrollY'), 10) || 0

        scrollY += detY - 0

        if (scrollY > 0 || scrollY < (0 - transY_max)) {

            return
        }

        //$list.animate({'translateY': scrollY + 'px'}, 0);
        $list.css('-webkit-transform', 'translateY(' + scrollY + 'px)')

        //$item.eq (Math.round (Math.abs (scrollY / unit_height))).trigger ('click')
    }

    // 移动结束
    function _moveEnd(el, detY, detT) {
        var
            $el = $(el),
            $node = $el.parents('.item-select'),
            $list = $node.find('.item-list'),
            $item = $list.find('.i-item').filter(function () {
                return !$(this).hasClass('disabled')
            }),
            unit_height = $node.height() / 3,
            transY_max = ($item.length - 1) * unit_height,
            endTop = parseInt(_getTransY($list)),
            lastTop = (Math.round(endTop / unit_height)) * unit_height

        var
            ZN_NUM = 0.25
        if (Math.abs(detY / detT) > ZN_NUM) {//惯性
            var
                pastNum = ((detY / detT) / ZN_NUM),
                morePastY = Math.floor(pastNum * unit_height)

            lastTop += morePastY

            lastTop = Math.min(Math.max(0 - transY_max, lastTop), 0)

            lastTop = (Math.round(lastTop / unit_height)) * unit_height

            $list.animate({'translateY': lastTop + 'px'}, 300 - 0 + Math.ceil(Math.abs(pastNum)) * 100, 'ease-out')
        } else {
            $list.animate({'translateY': lastTop + 'px'}, 160, 'linear')
        }

        //$item.eq (Math.floor (Math.abs (lastTop / unit_height))).trigger ('click');
        var
            item_pos = Math.floor(Math.round(Math.abs(lastTop * 100 / unit_height)) / 100)
        $item.eq(item_pos).trigger('click')
    }

    // 获取元素垂直方向变形位移
    function _getTransY(el) {
        var
            $el = $(el),
            trans = $el.css('transform')
                || $el.css('-webkit-transform')
                || $el[0].style.webkitTransform,
            transY = 0

        if (trans.indexOf('translateY') > -1) {
            transY = trans.replace(/translateY\((\-?[\d\.]+)px\)/, function (m, n) { return n || 0})
        }
        if (trans.indexOf('matrix') > -1) {
            transY = trans.replace(/matrix\(\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*(\-?[\d\.]+)\)/, function (m, n) { return n || 0})
        }

        return transY
    }

    // 比较版本
    function compareVersion(src, dest) {
        return _version2Num(src) >= _version2Num(dest)
    }

    // 版本变成数字
    function _version2Num(v) {
        var arr = v.split(/\./)
        if (arr.length > 2) {
            arr.length = 2
        } else if (arr.length == 1) {
            arr[1] = '0'
        }
        var vn = arr.join('.')
        vn -= 0
        return vn
    }

    // shine click action
    function shineClick(el, duration) {

        el = $(el)
        duration = parseInt(duration, 10) || 500

        el.each(function () {
            var
                me = this,
                orig_background_color = me.style.backgroundColor

            me.style.backgroundColor = '#f0f0f0'

            setTimeout(function () {

                $(me).animate({'background-color': orig_background_color}, duration, 'cubic-bezier(.28,.2,.51,1.15)', function () {
                    me.style.backgroundColor = orig_background_color || ''
                })

            }, 300)
        })
    }

    /**
     * 加载中
     * @returns {boolean}
     */
    function isLoading(key) {
        key = key || 'KEY_GLOBAL_LOADING'
        return tcb.cache(key)
            ? true
            : false
    }

    /**
     * 设置加载状态
     * @param flag
     * @returns {boolean}
     */
    function setLoading(flag, key) {
        flag = flag
            ? true
            : false
        key = key || 'KEY_GLOBAL_LOADING'

        return tcb.cache(key, flag)
    }


}())


;/**import from `/resource/js/component/m/picker.js` **/
;(function () {
    var
        Bang = window.Bang = window.Bang || {}

    var
        defaults = {
            // 实例化的时候自动执行init函数
            flagAutoInit     : true,
            // 是否需要搜索筛选
            flagFilter       : false,
            // 触发器
            selectorTrigger  : '.picker-trigger',

            col: 1,
            // 渲染数据
            data: [],
            // 渲染数据标题，默认为空
            dataTitle: [],
            // 被选中的位置（默认都是0）
            dataPos: [],

            callbackTriggerBefore : null,
            // 回调函数(确认/取消)
            callbackConfirm : null,
            callbackCancel  : null
        }

    function Picker (options) {
        var me = this

        options = $.extend ({}, defaults, options)

        me.options = options

        if (!tcb.isArray (me.options.dataFilter)) {
            me.options.dataFilter = []
        }

        me.__uniqueId = tcb.genRandomNum()
        me.__wrapId = 'UIComponentPicker'+me.__uniqueId
        me.__maskId = 'UIComponentPickerMask'+me.__uniqueId

        if (me.options.flagAutoInit) {

            me.init ()
        }
    }

    // 设置原型方法
    Picker.prototype = {

        constructor : Picker,

        getTrigger : getTrigger,

        bindEvent     : bindEvent,

        doSelect : doSelect,
        doShow   : doShow,
        doHide   : doHide,

        render: render,

        init : init
    }

    // 获取触发器
    function getTrigger () {
        var
            me = this,
            selectorTrigger = me.options.selectorTrigger

        me.__Trigger = me.__Trigger || $ (selectorTrigger)

        return me.__Trigger
    }

    // 设置被选中的item位置
    function doSelect () {
        var me = this,
            options = me.options,
            data = options.data,
            $selected = __getWrap.apply (me).find ('.selected')

        $selected.each (function (i, el) {
            var $el = $(el),
                name = $el.attr('data-name')

            $.each(data[i], function(ii, item){
                if (item['name']==name){
                    options.dataPos[i] = ii
                }
            })
        })
    }

    // 显示
    function doShow () {
        var me = this,
            $wrap = me.render()

        // 显示遮罩层
        __showMask.apply(me)

        $wrap.css ({
            'position' : 'fixed',
            'left'     : '0',
            'top'      : '100%',
            'z-index'  : tcb.zIndex (),
            'width'    : '100%'
        })

        //如果为android4.0以下系统，由于不支持部分CSS动画，需要特别处理
        if ($.os.android && !__compareVersion ($.os.version, "4.0")) {
            $wrap.css ({
                'top'    : 'auto',
                'bottom' : 0
            })
            $.dialog.toast ("抱歉，您的手机系统版本不支持选择", 1600)
        } else {
            $wrap.animate ({ 'translateY' : '1px' }, 10, function () {
                $wrap.hide ()
                setTimeout (function () {
                    $wrap.show ().animate ({ 'translateY' : 0 - $wrap.height () + 'px' }, 200, 'linear')//

                    //var $FilterInput = $wrap.find ('.item-filter input')
                    //if ($FilterInput && $FilterInput.length) {
                    //    $FilterInput.trigger ('change')
                    //}
                    __setSelectTransYBySelectedItem($wrap.find('.col'))

                }, 30)
            })
        }

        tcb.js2AndroidSetDialogState(true, function(){
            me.doHide()
        })
    }

    // 关闭picker
    function doHide () {
        var me = this,
            $wrap = __getWrap.apply (me)

        $wrap.animate ({ 'translateY' : 0 }, 200, 'linear', function () {

            $ (this).hide ()

            __hideWrap.apply (me)

            __hideMask.apply (me)
        })
        tcb.js2AndroidSetDialogState(false)
    }

    // 绑定基本事件
    function bindEvent () {
        var
            me = this,
            $wrap = __getWrap.apply(me),
            $trigger = me.getTrigger ()

        // 移动事件
        __bindMoveEvent ($wrap)

        // 触发picker展示
        $trigger.on ('click', function (e) {
            e.preventDefault ()

            var $me = $(this)

            if ($me.attr ('data-disabled-picker')) {
                return
            }

            // 有trigger before 函数，先调用，如果返回false（绝等于false），那么直接返回
            if ($.isFunction (me.options.callbackTriggerBefore) && me.options.callbackTriggerBefore (me) === false) {
                return
            }

            // shining
            __shineClick ($me[0])

            $trigger.blur()

            me.doShow()
        })

        // 选择item
        $wrap.on ('click', '.i-item', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $col = $me.closest ('.col')

            $me.addClass ('selected')
                .siblings ('.selected').removeClass ('selected')
        })
        // 点击控制按钮
        $wrap.on ('click', '.ctrl-item', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                action_name = $me.attr ('data-action'),
                action_map = {
                    cancel  : actionCancel,
                    confirm : actionConfirm
                },
                action_fn = action_map[ action_name ]

            if (typeof action_fn !== 'function') {
                // 没有相应的操作，直接返回不做任何处理

                return
            }

            // 执行操作
            action_fn ($me)
        })
        // 输入文字筛选
        $wrap.on('input change', '.item-filter input', function(e){
            var $me = $(this),
                val = tcb.trim ($me.val ()),
                $col = $me.closest('.col'),
                $itemList = $col.find('.item-list'),
                $items = $itemList.find('.i-item')

            val = val.match(/(\S+)/ig) || []

            me.options.dataFilter[ $col.index () ] = val

            tcb.each($items, function(i, itemEl){
                var $item = $(itemEl),
                    dataName = $item.attr('data-name')

                if (! __validMatch(val, dataName)){
                    $item.addClass('disabled')
                } else {
                    $item.removeClass('disabled')
                }
            })
            __resetListMove($itemList)
        })

        //取消关闭
        function actionCancel ($el) {

            // 关闭wrap层
            me.doHide ()

            if ($.isFunction (me.options.callbackCancel)) {

                me.options.callbackCancel (me)
            }
        }

        //确认选择
        function actionConfirm ($el) {

            // 选择确定的省/市/区县
            me.doSelect ()
            // 关闭wrap层
            me.doHide ()

            if ($.isFunction (me.options.callbackConfirm)) {

                me.options.callbackConfirm (me)
            }
        }
    }

    // 输出picker
    function render(){

        // 初始化将数
        var me = this,
            options = me.options,
            $wrap = __getWrap.apply(me),
            colHtml = __genHtml (options.data, options.dataPos, options.dataFilter)

        $wrap.find('.item-list').each(function(i, el){
            $(el).html(colHtml[i]||'')
        })

        return $wrap
    }

    // 初始化
    function init () {
        var me = this

        // 输出picker
        me.render()

        // 绑定基本事件
        me.bindEvent ()
    }

    Bang.Picker = function (options) {

        return new Picker (options)
    }



    //================= private ===================

    // 生成滑动列表
    function __genHtml (data, dataPos, dataFilter) {
        data = data || []
        dataPos = dataPos || []
        dataFilter = dataFilter || []

        var ret = []

        tcb.each (data, function (i, col_list) {
            var html_str = [],
                col_list_pos = dataPos[i] || 0,
                col_list_filter = dataFilter[i] || []

            tcb.each (col_list, function (ii, item) {
                html_str.push ('<span class="i-item')

                if (col_list_filter.length && !__validMatch (col_list_filter, item[ 'name' ])) {
                    html_str.push (' disabled')
                }
                if (col_list_pos === ii) {
                    html_str.push (' selected')
                }
                html_str.push ('" data-id="', item[ 'id' ], '" data-name="',item[ 'name' ],'">', item[ 'name' ], '</span>')
            })


            ret.push (html_str.join (''))
        })

        return ret
    }

    // 获取picker
    function __getWrap () {
        var me = this,
            $wrap = $ ('#'+me.__wrapId)

        if (!($wrap && $wrap.length)) {

            var flagFilter = me.options.flagFilter || false,
                col = me.options.col || 1,
                tit = me.options.dataTitle||[],
                html_st = []

            // 外框
            html_st.push ('<div class="ui-component-picker" id="',me.__wrapId,'">')

            // 主体列表
            html_st.push ('<div class="dt-table dt-table-', col, '-col">')
            for (var i = 0; i < col; i++) {
                html_st.push ('<div class="col">')
                html_st.push ('<div class="item-title">', (tit[ i ]||''), '</div>')
                if (flagFilter) {
                    html_st.push ('<div class="item-filter"><label class="input"><input type="text" placeholder="多词搜索使用空格分开"/></label></div>')
                }

                html_st.push ('<div class="item-select">',
                    '<div class="item-window">',
                        '<span class="i-w-line"></span>',
                        '<span class="i-w-line"></span>',
                    '</div>',
                    '<div class="item-list">',

                    '</div>',
                    '</div>');

                html_st.push ('</div>');
            }
            html_st.push ('</div>');

            // 控制行
            html_st.push ('<div class="ctrl-box">',
                '<span class="ctrl-item ctrl-cancel" data-action="cancel">取消</span>',
                '<span class="ctrl-item ctrl-ok" data-action="confirm">确定</span>',
                '</div>');

            html_st.push ('</div>');

            html_st = html_st.join ('')

            $wrap = $ (html_st).appendTo ($ ('body'))
        }

        return $wrap
    }
    // 隐藏picker
    function __hideWrap () {
        var
            me = this,
            $wrap = $ ('#'+me.__wrapId)

        if ($wrap && $wrap.length) {

            $wrap.hide()
        }
    }
    // 展示mask
    function __showMask () {
        var
            me = this,
            $mask = $ ('#'+me.__maskId)

        if (!($mask && $mask.length)) {

            var
                mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;display: block;width: 100%;height: 100%;background:rgba(0, 0, 0, 0.2);',
                mask_html = '<a id="'+me.__maskId+'" href="#" style="' + mask_css + '"></a>'

            $mask = $ (mask_html).appendTo (document.body);

            $mask.on ('click', function (e) {
                e.preventDefault ()

            })
        }

        $mask.css ({
            'z-index' : tcb.zIndex (),
            'display' : 'block'
        })
    }
    // 隐藏mask
    function __hideMask () {
        var
            me = this,
            $mask = $ ('#'+me.__maskId)

        if ($mask && $mask.length) {

            $mask.hide ()
        }
    }

    // 绑定滑动事件
    function __bindMoveEvent ($wrap) {
        if (!($wrap && $wrap.length)) {
            return
        }

        var $cover = $wrap.find ('.item-window')

        //touch start
        $cover.on ('touchstart', function (e) {
            e.preventDefault ()

            var $me = $ (this),
                $list = $me.parents ('.item-select').find ('.item-list'),
                startY = e.touches[ 0 ].clientY

            $list.data ('scrollY', parseInt (__getTransY ($list)))
                .data ('startY', startY)
                .data ('isMove', 'yes')
                .data ('startTime', new Date ().getTime ())

            var $FilterInput = $wrap.find ('.item-filter input')
            if ($FilterInput && $FilterInput.length) {
                $FilterInput.blur()
            }
        })

        //touch move
        $cover.on ('touchmove', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $list = $me.parents ('.item-select').find ('.item-list');

            if ($list.data ('isMove') != 'yes') {

                return false
            }

            var
                startY = $list.data ('startY'),
                endY = e.touches[ 0 ].clientY,
                detY = endY - startY;

            // 移动选择列表
            __moveList (this, detY)
        }, {passive : false})

        //touch end
        $cover.on ('touchend', function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $list = $me.parents ('.item-select').find ('.item-list')

            if ($list.data ('isMove') != 'yes') {

                return false
            }

            var // 垂直移动距离
                detY = __getTransY ($list) - $list.data ('scrollY'),
                // 滑动时间
                detT = new Date ().getTime () - $list.data ('startTime')
            // 移动结束
            __moveEnd (this, detY, detT)

            // 移动结束,重置数据
            $list.data ('scrollY', 0)
                .data ('startY', 0)
                .data ('isMove', '')
                .data ('startTime', 0)

        })
    }

    // 移动列表
    function __moveList (el, detY) {
        var $el = $ (el),
            $node = $el.parents ('.item-select'),
            $list = $node.find ('.item-list'),
            $item = $list.find ('.i-item').filter (function () {
                return !$ (this).hasClass ('disabled')
            }),
            unit_height = $node.height () / 3,
            transY_max = ($item.length - 1) * unit_height,
            scrollY = parseInt ($list.data ('scrollY'), 10) || 0

        scrollY += detY - 0

        if (scrollY > 0 || scrollY < (0 - transY_max)) {

            return
        }

        //$list.animate({'translateY': scrollY + 'px'}, 0);
        $list.css ('-webkit-transform', 'translateY(' + scrollY + 'px)')

        $item.eq (Math.round (Math.abs (scrollY / unit_height))).trigger ('click')
    }

    // 移动结束
    function __moveEnd (el, detY, detT) {
        var
            $el = $ (el),
            $node = $el.parents ('.item-select'),
            $list = $node.find ('.item-list'),
            $item = $list.find ('.i-item').filter (function () {
                return !$ (this).hasClass ('disabled')
            }),
            unit_height = $node.height () / 3,
            transY_max = ($item.length - 1) * unit_height,
            endTop = parseInt (__getTransY ($list)),
            lastTop = (  Math.round (endTop / unit_height) ) * unit_height;

        var
            ZN_NUM = 0.25
        if (Math.abs (detY / detT) > ZN_NUM) {//惯性
            var
                pastNum = ((detY / detT) / ZN_NUM),
                morePastY = Math.floor (pastNum * unit_height)

            lastTop += morePastY

            lastTop = Math.min (Math.max (0 - transY_max, lastTop), 0)

            lastTop = (  Math.round (lastTop / unit_height) ) * unit_height

            $list.animate ({ 'translateY' : lastTop + 'px' }, 300 - 0 + Math.ceil (Math.abs (pastNum)) * 100, 'ease-out')
        } else {
            $list.animate ({ 'translateY' : lastTop + 'px' }, 160, 'linear')
        }

        //$item.eq (Math.floor (Math.abs (lastTop / unit_height))).trigger ('click');
        var
            item_pos = Math.floor (Math.round (Math.abs (lastTop * 100 / unit_height)) / 100)
        $item.eq (item_pos).trigger ('click')
    }

    function __resetListMove(el){
        var $el = $ (el),
            $node = $el.parents ('.item-select'),
            $list = $node.find ('.item-list'),
            $item = $list.find ('.i-item').filter (function () {
                return !$ (this).hasClass ('disabled')
            }),
            unit_height = $node.height () / 3,
            scrollY = 0

        $list.attr ('data-scrollY', scrollY)

        $list.css ('-webkit-transform', 'translateY(' + scrollY + 'px)')

        $item.eq (0).trigger ('click')
    }

    // 获取元素垂直方向变形位移
    function __getTransY (el) {
        var
            $el = $ (el),
            trans = $el.css ('transform')
                || $el.css ('-webkit-transform')
                || $el[ 0 ].style.webkitTransform,
            transY = 0

        if (trans.indexOf ('translateY') > -1) {
            transY = trans.replace (/translateY\((\-?[\d\.]+)px\)/, function (m, n) { return n || 0})
        }
        if (trans.indexOf ('matrix') > -1) {
            transY = trans.replace (/matrix\(\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*(\-?[\d\.]+)\)/, function (m, n) { return n || 0})
        }

        return transY
    }

    // 根据选中的item,将列表移动到选中的位置
    function __setSelectTransYBySelectedItem ($col) {
        if (!($col && $col.length)) {

            return
        }
        $col.each (function (i, el) {
            var $el = $ (el),
                $cover = $el.find ('.item-window'),
                $selected = $el.find ('.selected'),
                $items = $el.find ('.i-item').filter(function(){
                    return !$(this).hasClass('disabled')
                }),
                el_index = $items.indexOf($selected[0]),
                d = -($selected.height () * el_index)

            __moveList ($cover[ 0 ], d)
        })
    }

    // 比较版本
    function __compareVersion (src, dest) {
        return __version2Num (src) >= __version2Num (dest)
    }

    // 匹配matchs数组内的字符串是否能在str中找到，都能找到，返回true，否则false
    function __validMatch(matchs, str){
        str = str || ''
        var flagMatch = true

        tcb.each(matchs, function(i, v){
            str.indexOf(v)==-1 && (flagMatch = false)
        })

        return flagMatch
    }

    // 版本变成数字
    function __version2Num (v) {
        var arr = v.split (/\./);
        if (arr.length > 2) {
            arr.length = 2;
        } else if (arr.length == 1) {
            arr[ 1 ] = "0";
        }
        var vn = arr.join (".");
        vn -= 0;
        return vn;
    }

    // shine click action
    function __shineClick (el, duration) {

        el = $ (el)
        duration = parseInt (duration, 10) || 500

        el.each (function () {
            var
                me = this,
                orig_background_color = me.style.backgroundColor

            me.style.backgroundColor = '#f0f0f0'

            setTimeout(function(){

                $ (me).animate ({ 'background-color' : orig_background_color }, duration, 'cubic-bezier(.28,.2,.51,1.15)', function () {
                    me.style.backgroundColor = orig_background_color || ''
                })

            }, 300)
        })
    }

} ())


;/**import from `/resource/js/component/m/product_list_render.js` **/
;
!function () {
    window.Bang = window.Bang || {}

    function renderProductList (options) {
        var
            defaults = {
                // 输出目标位置
                $target        : '',
                // 输出模板
                $tpl           : '',
                // 商品请求地址
                request_url    : '',
                // 请求的参数，页码和也没数量是基本参数，还可以包括任何其他参数
                request_params : {
                    // 页码
                    pn        : 0,
                    // 每页数量
                    page_size : 20
                },
                // 开启图片懒加载
                lazy_load      : true,
                // 显示列数
                col            : 5,
                // 指定的商品列表的key（用于处理不同接口返回的列表数据的key不一样的情况）
                list_key       : '',
                // 列表的url参数
                list_params    : {},
                // 是否以append的形式添加内容
                is_append : false,
                // 失败回调函数
                fail           : tcb.noop,
                // 输出完成执行
                complete       : tcb.noop,
                // 秒杀倒计时
                countdown      : countDown
            }

        options = tcb.mix (defaults, options, true)

        var
            $target = $ (options.$target),
            $tpl = $ (options.$tpl)

        if (!($target && $target.length && $tpl && $tpl.length)) {
            return tcb.warn ('$target：' + options.$target + '，或者$tpl：' + options.$tpl + '，不存在，无法正确执行')
        }

        options.col = parseInt (options.col, 10) || 5

        options.request_params = options.request_params || {}
        options.request_params[ 'pn' ] = parseInt (options.request_params[ 'pn' ], 10) || 0
        options.request_params[ 'page_size' ] = parseInt (options.request_params[ 'page_size' ], 10) || 20

        // 获取商品数据
        getProductData (options.request_url, options.request_params, function (result) {
            var
                product_list = null

            if (options.list_key) {
                // 根据指定的key在商品中获取商品列表

                product_list = result[ options.list_key ]
            }
            product_list = product_list ? product_list : result[ 'product_list' ] || result[ 'good_list' ] || result

            // 如果返回的数据超过限定的每页数量，那么干掉多余的
            product_list.splice (options.request_params[ 'page_size' ], 9999)

            var
                product_list_html = getProductHtml ($tpl, {
                    good_list : product_list,
                    params    : options.list_params || {},
                    col       : options.col
                })

            renderProductListHtml ($target, product_list_html, options.lazy_load, options.is_append)

            // 倒计时
            if (options.countdown && typeof options.countdown == 'function') {
                var $countdown = $target.find ('.countdown')
                $countdown.length && options.countdown ($countdown, product_list)
            }

            // 输出完成
            typeof options.complete === 'function' && options.complete (result, $target)

        }, options.fail)
    }

    // 获取商品列表的html字符串
    function getProductHtml ($tpl, data) {
        data = data || {}
        // 商品列表
        data[ 'good_list' ] = data[ 'good_list' ] || []
        // 商品列
        data[ 'col' ] = data[ 'col' ] || 2

        tcb.each (data[ 'good_list' ], function (i, item) {
            // 如果返回的商品图片是字符串格式，那么做个特殊处理
            if (typeof item[ 'thum_img' ] === 'string') {

                var thum_img = tcb.imgThumbUrl2 (item[ 'thum_img' ], 300, 300, 'edr')
                item[ 'thum_img' ] = {
                    'big' : thum_img,
                    'mid' : thum_img,
                    'min' : thum_img,
                    'old' : thum_img
                }
                tcb.preLoadImg (thum_img)
            }
        })

        var html_fn = $.tmpl ($.trim ($tpl.html ()))

        return html_fn (data)
    }

    // 输出商品列表的html
    function renderProductListHtml ($target, html_str, lazy_load, is_append) {
        var $html_str
        if (is_append){
            $html_str = $(html_str)
            $html_str.appendTo($target)
        } else {
            $target.html (html_str)
        }

        if (lazy_load) {
            setTimeout (function () {
                tcb.lazyLoadImg (0, $html_str || $target)
            }, 300)
        }
    }

    // 获取热销机型列表
    function getProductData (url, params, success, fail) {
        if (!url) {
            return tcb.error ('这里有个商品列表异步请求没有传入url')
        }

        // 请求商品数据
        $.get (url, params, function (res) {
            try {
                res = $.parseJSON (res)
            }catch (e) {}

            if (!res[ 'errno' ]) {

                typeof success === 'function' && success (res[ 'result' ])

            } else {
                typeof fail === 'function' && fail (res)
            }
        })

    }

    //倒计时
    function countDown ($countdown, product_list) {
        // 遍历商品列表，处理倒计时
        $.each (product_list, function (i, product) {
            var product_id = product[ 'product_id' ],
                $me = $countdown.filter ('[data-pid="' + product_id + '"]')

            if (!($me && $me.length)) {
                return true
            }
            var current_time = window.CURRENT_TIME || Date.now (),
                flash_start_time = new Date (product[ 'flash_start_time' ].replace (/-/g, '/')).getTime (),
                flash_end_time = new Date (product[ 'flash_end_time' ].replace (/-/g, '/')).getTime ()

            //抢购未开始
            if (!product[ 'flash_saling' ] && current_time < flash_start_time) {
                $me.addClass ('countdown-start-prev')
                    .attr ('data-descbefore', '距开始')

                Bang.startCountdown (flash_start_time, current_time, $me, {
                    'end' : function () {
                        $me.removeClass ('countdown-start-prev')
                            .attr ('data-descbefore', '距结束')

                        Bang.startCountdown (flash_end_time, flash_start_time, $me, {
                            'end' : function () {
                                $me.hide ().closest ('.p-item').find ('.p-label-soldout').show ()
                            }
                        })
                    }
                })
            }
            // 抢购进行中
            else if (product[ 'flash_saling' ] == 1 && product[ 'flash_status' ] == 'saling' && current_time < flash_end_time) {
                $me.removeClass ('countdown-start-prev')
                    .attr ('data-descbefore', '距结束')
                Bang.startCountdown (flash_end_time, current_time, $me, {
                    'end' : function () {
                        $me.hide ().closest ('.p-item').find ('.p-label-soldout').show ()
                    }
                })
            }
            // 已抢光
            else {
                $me.hide ().closest ('.p-item').find ('.p-label-soldout').show ()
            }
        })
    }

    //====================== Export ========================
    window.Bang.renderProductList = renderProductList

} ()


;/**import from `/resource/js/component/m/play_video.js` **/
!function(){
    window.Bang = window.Bang || {}

    function playVideo($trigger){
        var $TriggerShowVideo = $trigger || $('.trigger-play-video')

        if ($TriggerShowVideo && $TriggerShowVideo.length){
            $TriggerShowVideo.on('click', function(e){
                e.preventDefault()

                var html_fn = $.tmpl($.trim($('#JsMCommonVideoPlayerPanelTpl').html())),
                    html_st = html_fn()

                tcb.showDialog(html_st, {
                    className : 'video-player-panel',
                    withClose : true,
                    middle : true
                })
            })
        }
    }

    window.Bang.playVideo = playVideo
}()

;/**import from `/resource/js/component/m/login_form_by_mobile.js` **/
!function () {
    var Bang = window.Bang = window.Bang || {};

    Bang.LoginFormByMobile = LoginFormByMobile

    function LoginFormByMobile (options, callback) {
        options = options || {}
        var
            form_action = options.form_action || '',
            selector_form = options.selector_form,
            selector_get_secode = options.selector_get_secode,
            selector_vcode_img = options.selector_vcode_img,
            class_get_secode_disabled = options.class_get_secode_disabled || 'getsecode-disabled',
            status_loading = options.status_loading || false

        var $LoginForm = $ (selector_form),
            $BtnSeCode = $LoginForm.find (selector_get_secode),
            $BtnVCode = $LoginForm.find (selector_vcode_img),

            $mobile = $LoginForm.find ('[name="mobile"]'),
            $pic_secode = $LoginForm.find ('[name="pic_secode"]'),
            $sms_type = $LoginForm.find ('[name="sms_type"]')

        if (!($LoginForm.length && $BtnSeCode.length && $BtnVCode.length && $mobile.length && $pic_secode.length)) {
            return
        }

        // 提交登录表单
        $LoginForm.on ('submit', function (e) {
            e.preventDefault ()

            if (!validMobileCheckOrderForm ($LoginForm)) {
                return
            }

            var __loading = false
            if (status_loading){
                tcb.loadingStart()
                __loading = true
            }
            $.post (form_action || $LoginForm.attr('action'), $LoginForm.serialize(), function (res) {
                tcb.loadingDone()
                __loading = false

                try{
                    res = $.parseJSON(res)

                    if (!res[ 'errno' ]) {
                        typeof callback === 'function' && callback(res)
                    } else {
                        alert (res.errmsg)
                    }
                } catch (ex){
                    alert ("抱歉，数据错误，请稍后再试")
                }
            })
            setTimeout(function () {
                if (__loading){
                    tcb.loadingDone()
                    __loading = false
                }
            }, 6000)
        })

        // 获取短信验证码
        $BtnSeCode.on ('click', function (e) {
            e.preventDefault ()

            if ($BtnSeCode.hasClass (class_get_secode_disabled)) {
                return false
            }

            if ($BtnVCode.attr ('data-out-date')) {
                $BtnVCode.trigger ('click')
            }

            // 验证登陆表单
            if (!validGetSmsCode ($LoginForm)) {
                return
            }

            var params = {
                'mobile'     : $.trim ($mobile.val ()),
                'pic_secode' : $.trim ($pic_secode.val ()),
                'sms_type'   : $.trim ($sms_type.val ())
            }

            $.post ('/aj/doSendSmsCode/', params, function (res) {
                try {

                    res = $.parseJSON(res)
                    if (res.errno) {

                        alert (res.errmsg)

                        $BtnSeCode.removeClass (class_get_secode_disabled)
                        $BtnVCode.trigger ('click')

                    } else {
                        var
                            tagName = $BtnSeCode[ 0 ].tagName.toLowerCase (),
                            btnText = tagName == 'input' ? $BtnSeCode.val () : $BtnSeCode.html ()

                        $BtnSeCode.addClass (class_get_secode_disabled)
                        $BtnVCode.attr ('data-out-date', '1')

                        tcb.distimeAnim (60, function (time) {
                            if (time <= 0) {
                                $BtnSeCode.removeClass (class_get_secode_disabled)
                                tagName == 'input' ? $BtnSeCode.val (btnText) : $BtnSeCode.html (btnText)
                            } else {
                                tagName == 'input' ? $BtnSeCode.val (time + '秒后再次发送') : $BtnSeCode.html (time + '秒后再次发送')
                            }
                        })
                    }
                } catch (ex) {
                    $BtnSeCode.removeClass (class_get_secode_disabled)
                    alert ("抱歉，数据错误，请稍后再试")
                }
            })
        })

        // 刷新图形验证码
        $BtnVCode.on ('click', function (e) {
            e.preventDefault ()

            var src = '/secode/?rands=' + Math.random ()

            $BtnVCode.attr ('src', src)

            $BtnVCode.attr ('data-out-date', '')

            var $pic_secode = $LoginForm.find ('[name="pic_secode"]')
            $pic_secode.focus ().val ('')
        })
    }


    // 验证获取手机短信验证码表单
    function validGetSmsCode ($Form) {
        if (!($Form && $Form.length)) {
            return false
        }
        var flag = true

        var $Mobile = $Form.find ('[name="mobile"]'),
            mobile_val = $.trim ($Mobile.val ())
        if (!tcb.validMobile (mobile_val)) {
            flag = false
            $.errorAnimate($Mobile.focus ())
        }

        var $PicSecode = $Form.find ('[name="pic_secode"]'),
            pic_secode_val = $.trim ($PicSecode.val ())
        if (!pic_secode_val) {
            $.errorAnimate($PicSecode)
            if (flag) {
                $PicSecode.focus ()
            }
            flag = false
        }

        return flag
    }

    // 验证手机号登录表单
    function validMobileCheckOrderForm ($Form) {
        if (!($Form && $Form.length)) {
            return false
        }
        var flag = true

        var $Mobile = $Form.find ('[name="mobile"]'),
            mobile_val = $.trim ($Mobile.val ())
        if (!tcb.validMobile (mobile_val)) {
            flag = false
            $.errorAnimate($Mobile.focus ())
        }

        var $PicSecode = $Form.find ('[name="pic_secode"]'),
            pic_secode_val = $.trim ($PicSecode.val ())
        if (!pic_secode_val) {
            $.errorAnimate($PicSecode)
            if (flag) {
                $PicSecode.focus ()
            }
            flag = false
        }

        var $Secode = $Form.find ('[name="secode"]'),
            secode_val = $.trim ($Secode.val ())
        if (!secode_val) {
            $.errorAnimate($Secode)
            if (flag) {
                $Secode.focus ()
            }
            flag = false
        }

        var $AgreeProtocol = $Form.find ('[name="agree_protocol"]')
        if ($AgreeProtocol.length) {
            var $AgreeProtocolLabel = $AgreeProtocol.closest('label'),
                agree_protocol_checked = $AgreeProtocol.prop('checked')
            if (!agree_protocol_checked) {
                $.errorAnimate($AgreeProtocolLabel)
                if (flag) {
                    $AgreeProtocolLabel.focus ()
                }
                $.dialog.toast('请勾选并阅读协议再登录/注册~')
                flag = false
            }
        }

        return flag
    }

} ()


;/**import from `/resource/js/component/m/ui_common_login_dialog.js` **/
// m端全业务通用登陆框
!function () {
    function showCommonLoginPanel(options) {
        options = options || {}
        var success_cb = typeof options.success_cb == 'function' ? options.success_cb : tcb.noop

        var html_fn = $.tmpl($.trim($('#JsMUiCommonLoginDialogTpl').html())),
            html_str = html_fn({
                action_url: options.action_url || '/youpin/aj_my_login',
                tit_txt: options.tit_txt || '短信快捷登录',
                btn_txt: options.btn_txt || '下一步',
                tips: options.tips || '', //下单时手要快，否则很快会被抢走哦！
                sms_type: options.sms_type || 13,
                name_mobile: options.name_mobile || 'mobile',
                name_pic_secode: options.name_pic_secode || 'pic_secode',
                name_secode: options.name_secode || 'secode',
                name_sms_type: options.name_sms_type || 'sms_type',
                name_agree_protocol: options.name_agree_protocol || 'agree_protocol'
            }),
            dialogInst = tcb.showDialog(html_str, {
                className: 'ui-common-login-dialog',
                withClose: options.withClose || false,
                middle: true
            })
        // 登录表单相关功能
        window.Bang.LoginFormByMobile({
            form_action: dialogInst.wrap.find('form').attr('action'),
            selector_form: dialogInst.wrap.find('form'),
            selector_get_secode: '.ui-btn-get-secode',
            selector_vcode_img: '.ui-vcode-img',
            class_get_secode_disabled: 'ui-btn-get-secode-disabled',

            name_mobile: options.name_mobile || 'mobile',
            name_pic_secode: options.name_pic_secode || 'pic_secode',
            name_secode: options.name_secode || 'secode',
            name_sms_type: options.name_sms_type || 'sms_type',
            name_agree_protocol: options.name_agree_protocol || 'agree_protocol'
        }, success_cb)
    }

    function closeCommonLoginPanel() {
        tcb.closeDialog()
    }

    tcb.showCommonLoginPanel = showCommonLoginPanel
    tcb.closeCommonLoginPanel = closeCommonLoginPanel
}()


;/**import from `/resource/js/include/shalou.js` **/
!function () {
    window.TCBAPI = window.TCBAPI || {}

    window.TCBAPI.shalouTest = function(){
        //alert('shalou invoke success!')
    }

    window.TCBAPI.shalouHotPlug = function(params){
        // do nothing
        alert(params?JSON.stringify(params):'没有传入任何参数')
    }
}()
