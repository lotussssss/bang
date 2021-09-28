(function(){
    document.domain = "360.cn";
    var Pwin = window.parent.parent,
        Pdoc = window.parent.parent.document;

    // 解析URL（去除hash）
    var query_params = parseUrlQuery();
    // 设置iframe宽高
    if (query_params['h']) {
        query_params['w'] = query_params['w'] || '100%';
        setIframeSize(query_params['w'], query_params['h']);
    }
    // 设置页面scrolltop
    if (query_params['st']) {
        query_params['st'] = parseInt(query_params['st'], 10);
        setScrollTop(query_params['st']);
    }
    // 获取页面scrolltop
    if (query_params['getst'] && parseInt(query_params['getst'], 10)>0) {
        var st = getScrollTop();
        document.location.href = document.location.href.split('#')[0]+'#st='+st;
    }

    /**
     * 设置iframe宽高
     * @param {[type]} w [description]
     * @param {[type]} h [description]
     */
    function setIframeSize(w, h){
        var I = Pdoc.getElementById("AutoIframe");

        I.style.width = w.charAt(w.length-1)=='%' ? w : w+"px";
        I.style.height = h.charAt(h.length-1)=='%' ? h : (parseInt(h, 10)+5)+"px";
    }
    /**
     * 获取滚动条的高度
     * @return {[type]} [description]
     */
    function getScrollTop(){
        var scrolltop = 0;
        if(Pwin.pageYOffset){//这一条滤去了大部分， 只留了IE678
            scrolltop = Pwin.pageYOffset;
        }else if(Pdoc.documentElement.scrollTop){//IE678 的非quirk模式
            scrolltop = Pdoc.documentElement.scrollTop;
        }else if(Pdoc.body.scrollTop){//IE678 的quirk模式
            scrolltop = Pdoc.body.scrollTop;
        }

        return scrolltop;
    }
    /**
     * 设置滚动条高度
     * @param {[type]} top_val [description]
     */
    function setScrollTop(top_val){
        top_val = top_val ? top_val : 0;
        if (typeof Pwin.pageYOffset!=='undefined') {
            Pwin.pageYOffset = top_val;
        }
        Pdoc.documentElement.scrollTop = top_val;
        Pdoc.body.scrollTop = top_val;
    }
    /**
     * 将url的query串解析成json（去除hash串）
     * @return {[type]} [description]
     */
    function parseUrlQuery(url_str){
        url_str = url_str ? url_str : document.location.search;
        var ret = {},
            pos = url_str.indexOf('?');
        if (pos>-1) {
            url_str = url_str.substring(pos+1);
        }
        var query_arr = url_str.split('#')[0].split('&'),
            i_arr;

        for(var i=0; i<query_arr.length; i++){
            i_arr = query_arr[i].split('=');
            ret[i_arr[0].toLowerCase()] = i_arr[1] ? decodeURIComponent(i_arr[1].toLowerCase()) : '';
        }

        return ret;
    }
}());