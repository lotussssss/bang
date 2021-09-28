/**
 * 同城帮相关的基础库
 * @return {[type]} [description]
 */
var tcb = function(){
    return {
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
        // 全局的z-index
        zIndex:function(base_index){
            var
                key = 'KEY_GLOBAL_Z_INDEX',
                val = parseInt(base_index, 10) || parseInt(tcb.cache(key), 10) || 100001

            val++

            return tcb.cache(key, val)
        },
        // 将源对象的属性合入目标对象
        mix: function(dest, src, override){
            return QW.ObjectH.mix(dest, src, override);
        },
        // 返回指定项首次出现的索引
        inArray: function(val, arr){
            return arr.indexOf(val);
        },
        // 遍历数组/对象
        each: function(obj, fn){

            if (obj instanceof Array){
                // 在数组中的每个项上运行一个函数，并将全部结果作为数组返回。
                return QW.ArrayH.map(obj, function(v, i, obj){
                    return fn(i, v, obj);
                });
            }
            else if (obj instanceof Object){
                // 针对对象的每一个属性运行一个函数，并按属性名与返回值组成新的对象返回
                return QW.ObjectH.map(obj, function(v, k, obj){
                    return fn(k, v, obj);
                });
            }

        },
        bindEvent: function(el, configs){
            el = W(el);
            for(var name in configs){
                var value = configs[name];
                if (typeof value == 'function') {
                    var obj = {};
                    obj.click = value;
                    value = obj;
                };
                for(var type in value){
                    el.delegate(name, type, value[type]);
                }
            }
        },
        confirm: function(title, content, options, callback){
            options = options || {};

            options['btn_submit_text'] = options['btn_submit_text']||'确认';
            options['btn_cancel_text'] = options['btn_cancel_text']||'取消';

            var options = ObjectH.mix(options, {
                    btn: [{
                        txt: options['btn_submit_text'],
                        fn: callback,
                        cls: "ok"
                    }, {
                        txt: options['btn_cancel_text'],
                        fn: function(){
                            return true;
                        }
                    }]
                }, true);
            return this.panel(title, content, options)
        },
        alert: function(title, content, options, callback){
            options = options || {};
            var options = ObjectH.mix(options, {
                    btn: [{
                        txt: options.btn_name || "确定",
                        fn: callback
                    }]
                }, true);
            return this.panel(title, content, options)
        },
        panel: function(title, content, options){
            options = options || {};
            var btn = options.btn || [];
            var div = W('<div class="btn-box"></div>');
            setTimeout(function(){div.addClass('btn-box-fixbug').css('width', div.parentNode('.ft').siblings('.bd').size().width )}, 10); //修正360兼容模式下的bug
            btn.forEach(function(item,i){
                var btn = W('<button class="panel-btn panel-btn-'+i+' panel-btn-'+(item.cls || "")+'" '+(item.id ? 'id="'+item.id+'"' : '' )+'>'+item.txt+'</button>').appendTo(div);
                btn.on('click', function(e){
                   var result = item.fn && item.fn.call(this, e);
                   if (result === true) {
                        panel.hide();
                   };
                })
            })
            var defaultOptions = {
                "wrapId": "BasePanel01",
                "className": "panel-tom01",
                "title": title,
                "header": "",
                "body": content,
                "footer": '',
                "withClose": true,
                "withCorner": true,
                "withCue": true,
                "withShadow": false,
                "withBgIframe": true,
                "keyEsc": true,
                "withMask": true,
                "dragable": false,
                "resizable": false,
                "posCenter": true,
                "posAdjust": true
            }
            options = ObjectH.mix(defaultOptions, options, true);
            var panel = new QW.BasePanel(options);
            panel.on("afterhide",function(){this.dispose();});
            panel.show(null, null, options.width, options.height);
            div.appendTo(W(panel.oFooter));
            if (options.event) {
                tcb.bindEvent(panel.oBody, options.event);
            };
            return panel;
        },
        //获取缩略图
        imgThumbUrl: function(url, width, height){
            url = url+'';
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
            try{
                return a.protocol + '//' + a.host + '/edr/' + width + '__' + height + '/ss/30_105/' + a.pathname.replace('/', '');
            }finally{
                a = null;
            }
        },
        imgThumbUrl2: function(url, width, height, ctype){
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

            //if( !/^\/\w+\.\w+$/.test( a.pathname) ){
            //    return url;
            //}

            try{
                return a.protocol + '//' + a.host + '/'+ctype+'/' + width + '_' + height + '_/ss/30_105/' + a.pathname.replace('/', '');
            }finally{
                a = null;
            }
        },
        //显示认证v标识
        showIconV : function(mer_type, show_text){
            var rs = '';
            /*if(mer_type=='person'){
                rs +='<span class="icon icon-v-p" title="该个人已经过360同城帮的严格审核，确保提供专业优质的维修服务"></span>';
                if(show_text){
                    rs+='个人认证';
                }
            }else if(mer_type == 'enterprise'){
                rs += '<span class="icon icon-v" title="该企业已经过360同城帮的严格审核，确保提供专业优质的维修服务"></span>';
                if(show_text){
                    rs+='企业认证';
                }
            }*/

            if(mer_type == 40){
                if(show_text){
                    rs = '<span class="icon icon-v-ub pngfix" title="同城帮认证"></span>';
                }else{
                    rs = '<span class="icon icon-v-us pngfix" title="同城帮认证"></span>';
                }
            }

            return rs;
        },
        showShopGrade: function( grade ){
            var icon = Math.min(Math.ceil(grade/5), 4);
            var icon_num = (grade-1)%5 + 1;
            var str = '';
            for(var i=0; i<icon_num; i++){
                str +='<span class="icon icon-dj icon-dj-'+icon+'"></span>';
            }
            return str;
        },
        gotoTop : (function(){
            var isAnim = false,
                ElAnim = QW.ElAnim,
                createElement = DomU.createElement;
            // var doc = (QW.Browser.firefox || QW.Browser.ie || /trident.*rv:/i.test(window.navigator.userAgent)) ? document.documentElement : document.body; //后面的正则为判断IE11及以上版本
            var doc =  document.documentElement
            var opt = {
                ch: Dom.getDocRect().height,
                cw: Dom.getDocRect().width,
                mw : 0,
                mh : 0,
                headH : 10,
                right : 0,
                bottom: 0,
                el : 0,
                toTop : function(e){
                        e.preventDefault();
                        isAnim = true;
                        var anim = new ElAnim(doc, {
                                "scrollTop" : {
                                    to : 0
                            }
                        }, 500, QW.Easing.easeBothStrong);
                        anim.on('beforeplay',function(){opt.el.setStyle('visibility','hidden');});
                        anim.play();
                        anim.on('end',function(){
                            isAnim = false;
                        });
                }
            };

            function rTop(){
                if(isAnim)return;
                var h,w,x,timer,
                    pos = Dom.getDocRect(),
                    y = pos.scrollY;
                    if(y > opt.headH){
                        if(QW.Browser.ie6){
                            opt.el.setStyle('visibility','hidden');
                            x = Dom.getDocRect().scrollX;
                            h = y+(pos.height - opt.bottom - opt.mh);
                            w = opt.cw + x - opt.mw - opt.right;
                            opt.el.setXY(w,h);
                            if(timer) {
                                clearTimeout(timer);
                                timer = null;
                            }
                            timer = setTimeout(function() {
                                opt.el.setStyle('visibility','visible');
                            },500);
                            opt.el.on('click',function(){window.scrollTo(0,0);});

                        }//针对ie6的处理
                        else{
                            opt.el.setStyle('visibility','visible');
                        }
                    }
                    if(y == 0){
                        opt.el.setStyle('visibility','hidden');
                    }
            }
            function createHtml(){
                /**
                 *
                 *  创建返回到顶部的图标
                */
                var el = createElement('div',{
                    className:"returnToTop"
                });
                el.innerHTML = '<a data-text="go_to_top" href="#"  style="visibility:hidden"></a>';
                document.body.insertBefore(el,document.body.firstChild);
                return el;
            }
            function init(o){
            	  W('.returnToTop').removeNode();
                var el = createHtml();
                var that = opt;
                that.el = W(el).firstChild('a');
                that.mw = that.el.getRect().width;
                that.mh = that.el.getRect().height;
                QW.ObjectH.mix(opt,o,true);
                opt.el.css({'bottom':opt.bottom+'px','right':opt.right+'px'},1);
                W(window).on('scroll', rTop);
                W(window).on('resize', rTop);

                opt.el.on('click',opt.toTop);
            }
            //到达指定位置
            function goPlace(disTop){
                isAnim = true;
                var anim = new ElAnim(doc, {
                        "scrollTop" : {
                            to : disTop
                    }
                }, 300, QW.Easing.easeBothStrong);

                anim.play();
                anim.on('end',function(){
                    isAnim = false;
                });
            }
            return{
                init : init,
                rTop : rTop,
                goPlace : goPlace
            }
        })(),
        // 验证手机号
        validMobile: function(m){
            m = m || '';
            var flag = false;

            var r_mobile = /^1[3456789]\d{9}$/; // 判断是否为手机号
            m = m.trim();

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
            m = m.trim();

            if (m&&r_mobile.test(m)) {
                flag = true;
            }

            return flag;
        },
        // 解析url中的query
        queryUrl: function(url, key){
            url = url.replace(/^[^?=]*\?/ig, '').split('#')[0];	//去除网址与hash信息
            var json = {};
            //考虑到key中可能有特殊符号如“[].”等，而[]却有是否被编码的可能，所以，牺牲效率以求严谨，就算传了key参数，也是全部解析url。
            url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
                //对url这样不可信的内容进行decode，可能会抛异常，try一下；另外为了得到最合适的结果，这里要分别try
                try {
                    key = decodeURIComponent(key);
                } catch(e) {}
                try {
                    value = decodeURIComponent(value);
                } catch(e) {}
                if (!(key in json)) {
                    json[key] = /\[\]$/.test(key) ? [value] : value; //如果参数名以[]结尾，则当作数组
                }
                else if (json[key] instanceof Array) {
                    json[key].push(value);
                }
                else {
                    json[key] = [json[key], value];
                }
            });
            return key ? json[key] : json;
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

            QW.ObjectH.map(window.ThList, function(v, k){
                clearInterval(v);
            });

            window.ThList = {};
        },
        // 设置url
        setUrl: function(url, params){
            var rs = '',
                args = Array.prototype.slice.apply(arguments)

            url = args.shift()

            // 处理params
            tcb.each(args, function(i, param){
                if(typeof param==='string'){
                    try{
                        param = param.charAt(0)=='{' ? param : '{'+param+'}'
                        param = JSON.parse(param)
                    }catch (ex){
                        param = {}
                    }
                    args[i] = param
                }
            })
            params = tcb.mix({}, args, true)

            if(typeof url=='string' && url){

                if(QW.ObjectH.isPlainObject(params)){
                    var parse_url = url.split('#')[0].queryUrl();
                    QW.ObjectH.map(params, function(v, k){
                        if(v){
                            if(typeof v == 'object'){
                                // 数组，直接取最后一个作为参数值
                                if (QW.ObjectH.isArray(v)) {
                                    parse_url[k] = v[v.length-1];
                                } else {
                                    QW.ObjectH.map(v, function(vv, kk){
                                        parse_url[k][kk] = vv;
                                    });
                                }
                            } else {
                                parse_url[k] = v;
                            }
                        } else {
                            if(typeof parse_url[k]!=='undefined')
                                delete parse_url[k];
                        }
                    });

                    parse_url = QW.ObjectH.encodeURIJson(parse_url);
                    var query_pos = url.indexOf('?'),
                        hash_pos  = url.indexOf('#');

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

            if (QW.ObjectH.isPlainObject (window.__MUST_PASS_PARAMS)) {
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
                var v;
                for(var i= 0, l=pure_hash.length; i<l; i++){
                    v = pure_hash[i];
                    v = v.split('=');
                    if(v[0]){
                        params[v[0]] = typeof v[1]==='undefined' ? '' : v[1];
                    }
                }
            }
            return params;
        },
        // 设置元素文本无法被选择
        setUnselect: function(wDom){
            wDom = wDom ? W(wDom) : W(document.body);
            wDom.css({
                '-moz-user-select': 'none', // ff下起作用
                '-ms-user-select': 'none', // ie10以后起作用
                'user-select': 'none'
            });
            // 禁止文本选择（ie&chrome起作用）
            wDom.on('selectstart', function(e){
                e.preventDefault();
                return;
            });
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
                'fail': function(){}
            }, input_options, true);

            options.request_params = options.request_params || {}

            var wWrap = W(options['wWrap'] || '.use-promo-wrap');
            if( !(wWrap&&wWrap.length) ){
                return;
            }

            var wUsePromoTrigger = wWrap.query('.use-promo'),
                wYouhuiCode      = wWrap.query('[name="youhui_code"]'),
                wYouhuiCodeSelect= wWrap.query('.promo-sel-list');

            if(wYouhuiCode && wYouhuiCode.length){
                wYouhuiCode.forEach(function(el, i){
                    var wEl = W(el);

                    var params = {
                        request_params : {
                            service_type : options['service_type'],
                            price: options['price']||0,
                            product_id: options['product_id']
                        },
                        succ: options['succ'],
                        fail: options['fail']
                    }
                    tcb.mix(params.request_params, options.request_params, true)
                    validPromoCode(wEl, params);
                });
            }

            // 使用优惠码
            wUsePromoTrigger.on('click', function(e){
                e.preventDefault();
                W(this).hide().siblings('.promo-box').show();
            });
            // 验证优惠码有效性
            wYouhuiCode.on('change', function(e){
                var wEl = W(this);

                var params = {
                    request_params : {
                        service_type : options['service_type'],
                        price: options['price']||0,
                        product_id: options['product_id']
                    },
                    succ: options['succ'],
                    fail: options['fail']
                }
                tcb.mix(params.request_params, options.request_params, true)
                validPromoCode(wEl, params);
            });
            // select选择优惠码
            wYouhuiCodeSelect.on('change', function(e){
                var wMe = W(this),
                    wYouhuiCode = wMe.siblings('[name="youhui_code"]'),
                    proCode = wMe.val();
                if(proCode && wYouhuiCode.val()!=proCode){
                    wYouhuiCode.val( proCode ).trigger('change');
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
                var code     = $obj.val(),/*优惠码*/
                    wCurWrap = $obj.ancestorNode('.use-promo-wrap');

                if(!code){
                    if(typeof options['fail']==='function') {
                        options['fail'](wCurWrap);
                    }
                    wCurWrap.query('.promoYZ').html('请输入优惠码').removeClass('promo-fail').removeClass('promo-succ');
                    return;
                }

                // service_type：1：自营 ，2：回收，3：优品
                var params = {
                    'youhui_code': code
                }
                tcb.mix(params, options.request_params, true)
                QW.Ajax.post(options['url']||'/aj/doGetYouhuiAmount', params, function(rs){
                    try{
                        rs = JSON.parse(rs);
                    }catch(ex){ rs = {errno: 'error'}; }

                    if( rs.errno ){
                        var errmsg = '抱歉，'+(rs.errmsg?rs.errmsg+'，':'')+'优惠码验证失败。';//rs.errmsg? '抱歉，'+rs.errmsg : '抱歉，优惠码验证失败。';
                        wCurWrap.query('.promoYZ').html(errmsg).removeClass('promo-succ').addClass('promo-fail');

                        if(typeof options['fail']==='function') {
                            options['fail'](wCurWrap);
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
                            options['succ'](promo_amount, min_sale_price, wCurWrap);
                        }
                    }
                });
            }

            // 刷新优惠码验证
            function refreshPromoCode(){
                wYouhuiCode.trigger('change');
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
                oWrap: wWrap,
                setPrice: setPrice,                // 设置商品价格
                setProductId: setProductId,        // 设置商品id
                refreshPromoCode: refreshPromoCode // 刷新优惠码验证
            };
        },
        /**
         * 获取滚动条的高度
         * @return {[type]} [description]
         */
        getScrollTop: function(){
            var scrolltop = 0;

            if (window.pageYOffset) { //这一条滤去了大部分， 只留了IE678
                scrolltop = window.pageYOffset;
            } else if (document.body&&document.body.scrollTop) { //IE678 的quirk模式
                scrolltop = document.body.scrollTop;
            } else if (document.documentElement&&document.documentElement.scrollTop) { //IE678 的非quirk模式
                scrolltop = document.documentElement.scrollTop;
            }

            return scrolltop;
        },
        /**
         * 设置滚动条高度
         * @param {[type]} top_val [description]
         */
        setScrollTop: function(top_val) {
            top_val = top_val ? top_val : 0;
            //if (typeof window.pageYOffset !== 'undefined') {
            //    window.pageYOffset = top_val;
            //}
            //document.documentElement.scrollTop = top_val;
            //document.body.scrollTop = top_val;

            window.scrollTo(0, top_val);
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
        // 显示dialog弹窗
        showDialog: function(content, options){
            var
                classes = '',
                withClose = true,
                flag_middle = false,
                onClose = function(){}
            if (typeof options==='string') {
                classes = options
                options = {
                    'className': classes,
                    'withClose': withClose,
                    'middle': flag_middle,
                    'onClose': function(){}
                };
            } else {
                options = options || {};
                classes = (typeof options['className'] != 'undefined' && options['className']) ? options['className'] : classes;
                withClose = (typeof options['withClose'] != 'undefined') ? options['withClose'] : withClose;
                flag_middle = (typeof options['middle'] != 'undefined') ? options['middle'] : flag_middle;
                onClose = (typeof options['onClose'] == 'function') ? options['onClose'] : onClose;
            }
            var
                $doc = W(document.body),
                doc_rect = QW.DomU.getDocRect()

            var $mask = W('#DialogMask');
            if (!$mask.length) {
                $mask = W('<a class="dialog-mask" id="DialogMask"></a>');
                $mask.appendTo($doc);

                if (withClose) {
                    $mask.on('click', function(e){
                        e.preventDefault();

                        tcb.closeDialog();

                        typeof onClose=='function' && onClose()
                    })
                }
            }
            $mask.css({
                'height': doc_rect.scrollHeight,
                'z-index' : tcb.zIndex ()
            });
            var $wrap = W('#DialogWrap');
            if (!$wrap.length) {
                var wrap_str = '';
                if (withClose) {
                    wrap_str = '<div class="dialog-wrap" id="DialogWrap"><a href="#" class="dialog-close">&nbsp;</a><div class="dialog-inner"></div></div>';
                } else {
                    wrap_str = '<div class="dialog-wrap" id="DialogWrap"><div class="dialog-inner"></div></div>';
                }
                $wrap = W(wrap_str);
                $wrap.appendTo($doc);

                var
                    $close = $wrap.query('.dialog-close')
                if ($close && $close.length){

                    $close.on('click', function(e){
                        e.preventDefault();

                        tcb.closeDialog();

                        typeof onClose=='function' && onClose()
                    })
                }
            }
            $wrap.query('.dialog-inner').html(content);
            if (classes) {
                $wrap.addClass(classes)
            }

            if (flag_middle){
                // 垂直居中显示

                tcb.setElementMiddleScreen($wrap)
            } else {
                var
                    top = doc_rect.scrollY + 40

                $wrap.css({
                    'top': top
                })
            }
            $wrap.css({
                'z-index' : tcb.zIndex ()
            })

            return {
                mask: $mask,
                wrap: $wrap
            }
        },
        // 关闭dialog弹窗
        closeDialog: function($dialog){

            if ($dialog
                && $dialog.mask && $dialog.mask.length
                && $dialog.wrap && $dialog.wrap.length) {
                $dialog.mask.removeNode();
                $dialog.wrap.removeNode();
                return ;
            }

            W('#DialogMask').removeNode();
            W('.dialog-wrap').removeNode();
        },
        // 设置元素居中显示
        setElementMiddleScreen: function(el){
            var
                $el = W(el),
                el_rect = $el.getRect(),
                h = el_rect.height,
                w = el_rect.width,

                doc_rect = QW.DomU.getDocRect(),
                win_h = doc_rect.height,
                win_w = doc_rect.width,
                s_top = doc_rect.scrollY

            var
                top = (win_h - h) / 2 + s_top,
                left = (win_w - w) / 2
            top = top > 10 ? top : 10
            left = left ? left : 0

            $el.css ({
                top  : top,
                //bottom  : top,
                left : left,
                right : left,
                height: h
            })

        },
        // 格式化钱
        // money被格式化的金额
        // place保留小数点位数
        // flag多余位的舍入方式。flag>0向上舍入，flag<0向下舍入，flag==0四舍五入
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
        // 加载地图
        loadMap: function(callback){

        },
        // 异步请求
        ajax: function(opts){

            var
                default_opts = {
                    "url"            : "",
                    "method"         : "get",
                    "async"          : true,
                    "user"           : "",
                    "pwd"            : "",
                    "data"           : {},
                    "useLock"        : false,
                    "timeout"        : "5000",
                    "requestHeaders" : {},
                    "onsucceed"      : function () {},
                    "ontimeout"      : function () {},
                    "onerror"        : function () {}
                }
            opts = tcb.mix (default_opts, opts, true)

            // url是form表单元素
            if (opts[ 'url' ] && opts[ 'url' ].tagName == 'FORM') {
                opts[ 'method' ] = opts[ 'method' ] || opts[ 'url' ].method
                opts[ 'data' ] = opts[ 'url' ]
                opts[ 'url' ] = opts[ 'url' ].action
            }
            var
                onsucceed = opts[ 'onsucceed' ],
                ontimeout = opts[ 'ontimeout' ],
                onerror = opts[ 'onerror' ]
            // 请求成功
            opts[ 'onsucceed' ] = function () {
                typeof onsucceed == 'function' && onsucceed.call (this, this.requester.responseText)
            }
            // 请求超时
            opts[ 'ontimeout' ] = function () {
                typeof ontimeout == 'function' && ontimeout.call (this)
            }
            // 请求失败
            opts[ 'onerror' ] = function () {
                typeof onerror == 'function' && onerror.call (this)
            }

            var
                ajaxObj = new QW.Ajax (opts)

            ajaxObj.send ()

            return ajaxObj
        },
        request: function(url, data, success_callback, error_callback, method){
            if (url.constructor == Object) {
                var
                    a = tcb.ajax(url)
            } else {
                if (typeof data == 'function') {
                    method = error_callback
                    error_callback = success_callback
                    success_callback = data

                    if (url && url.tagName == 'FORM') {
                        method = method || url.method
                        data = url
                        url = url.action
                    } else {
                        data = ''
                    }
                }

                a = tcb.ajax({
                    url: url,
                    method: method,
                    data: data,
                    onsucceed: function() {
                        success_callback.call(this, this.requester.responseText)
                    },
                    onerror: function(){

                        error_callback.call(this)
                    }
                })

            }

            return a;
        },
        // GET异步请求
        get: function(url, data, success_callback, error_callback){
            var
                args = [].slice.call(arguments, 0)
            args.push('get')

            return tcb.request.apply(null, args);
        },
        // POST异步请求
        post: function(url, data, success_callback, error_callback){
            var
                args = [].slice.call(arguments, 0)
            args.push('post')

            return tcb.request.apply(null, args)
        },
        // 通用cache方法
        cache: function(key, val){
            window.__Cache = window.__Cache || {};

            if (typeof val !== 'undefined') {
                window.__Cache[key] = val;
            }

            return window.__Cache[key];
        },

        // 图片加载完成回调
        imageOnload :function (img_src, callback){
            var
                flag = false,
                _imgObj = new Image()

            // 图片加载完成，获取图片宽高
            _imgObj.onload = function(){
                if (flag){
                    return
                }

                flag = true

                typeof callback === 'function' && callback(_imgObj);
            }
            _imgObj.src = img_src


            // 此处补充加上setTimeout循环获取图片高宽，
            // 是为了避免有些图片比较大onload完成时间较长（或者某些当图片加载过了cache后不再onload），
            // 而图片的尺寸信息，在图片加载完成之前的某个时间点就可以获取到，这样就可以提前获取到图片的尺寸
            setTimeout(function(){
                if (flag){
                    return
                }
                // 获取到图片宽度～即认为图片已经加载完成
                if (_imgObj.width) {
                    flag = true

                    typeof callback === 'function' && callback(_imgObj);
                }
                else {
                    setTimeout(arguments.callee, 50);
                }
            }, 50)
        },
        // 根据图片地址，获取其宽高尺寸，然后执行回调函数;
        getImageSize : function (img_src, callback) {
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
        // wImg, 被设置的img元素
        // width, 目标宽度
        // height, 目标高度
        // flag 当图片宽高均小于目标宽高时，非强制设置目标宽高，按照图片原始尺寸显示
        setImgElSize : function (wImg, width, height, flag) {
            if ( !(wImg && wImg.length)) {
                return ;
            }

            flag = flag ? true : false;

            var me = this;

            wImg.forEach(function(el, i){
                var wEl = W(el),
                    src = wEl.attr('src');

                // 获取图片原始尺寸，然后根据原始宽高，设置元素等比宽高
                me.getImageSize(src, function(orig_width, orig_height){
                    var w_ratio = width/orig_width,
                        h_ratio = height/orig_height;

                    var n_width, n_height;
                    // 当图片宽高均小于目标宽高时，非强制设置目标宽高，按照图片原始尺寸显示
                    if (flag && orig_width<width && orig_height<height) {
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
                for(var i=0; i<img_arr.length; i++) {
                    var img = new Image();
                    img.src = img_arr[i];
                }
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

            options = tcb.mix({
                'delay': 1,
                'interval': 0 // 0:同时显示，其他时间表示实际时间间隔
            }, options, true);

            var delay = options['delay'] || 1, // 毫秒
                interval = options['interval'] || 0; // 图片加载顺序间隔

            var _time = 0;
            setTimeout(function(){

                var $img;
                if ($target && $target.length){
                    var $target_img = $target.filter(function(el){
                        return el.nodeType==1 && el.tagName.toLowerCase() === 'img';
                    });
                    if ($target_img && $target_img.length){
                        if ($target_img.length===$target.length){
                            $img = $target_img;
                        } else {
                            $img = $target.query('img').concat($target_img);
                        }
                    } else {
                        $img = $target.query('img');
                    }
                } else {
                    $img = W('img');
                }

                $img.forEach(function(el, i){
                    var $el = W(el),
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

        }

    };
}();
