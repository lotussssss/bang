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

