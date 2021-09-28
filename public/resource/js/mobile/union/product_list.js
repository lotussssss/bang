;(function () {

    if (window.__PAGE != 'product-list') {
        return
    }

    var $productListWrap = $('.product-wrap')
    var _state = {
        page:1,
        is_loading: false,
        is_nomore: false
    }

    $(window).on('scroll load', function(e){
        if( $(window).scrollTop() + $(window).height() + 200 > $('body')[0].scrollHeight  ){
            getProductList(_state.page,function(res){
                renderProductList(res.data,$productListWrap)
            })
        }
    });

    tcb.bindEvent(document.body,{
        '.btn-show-bug-dialog': function(e){
            e.preventDefault ()

            var $me = $(this)

            var html_fn = $.tmpl (tcb.trim ($ ('#JsMUnionOrderConfirmShipTpl').html ())),
                html_st = html_fn ({
                    order_id : $me.attr('data-order-id') || ''
                })

            var dialogInst = tcb.showDialog(html_st, {
                className : 'dialog-order-confirm-ship',
                middle : true
            })

            bindFormConfirmShipSubmit(dialogInst['wrap'].find('form'))
        }
    })

    function bindFormConfirmShipSubmit($Form){
        if (!($Form && $Form.length)) {
            return tcb.error ('$Form不能少')
        }

        $Form.on ('submit', function (e) {
            e.preventDefault ()

            var $me = $ (this)
            if (!validFormConfirmShip ($me)) {
                return
            }

            $.ajax ({
                type     : $me.attr ('method'),
                url      : $me.attr ('action'),
                data     : $me.serialize (),
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    if (res[ 'errno' ]) {
                        return $.dialog.toast (res[ 'errmsg' ], 2000)
                    }

                    window.location.href = window.location.href
                },
                error    : function (err) {
                    $.dialog.toast (err, 2000)
                }
            })
        })
    }

    function validFormConfirmShip ($Form) {
        var flag = true,
            $focus = null

        var $imei = $Form.find ('[name="imei"]'),
            $customphone = $Form.find ('[name="customphone"]'),
            $price = $Form.find ('[name="price"]')

        if (!tcb.trim ($imei.val ())) {
            flag = false
            $focus = $focus || $imei
            $imei.shine4Error ()
        }
        if (!tcb.validMobile (tcb.trim ($customphone.val ()))) {
            flag = false
            $focus = $focus || $customphone
            $customphone.shine4Error ()
        }
        if ($price && $price.length && !tcb.trim ($price.val ())) {
            flag = false
            $focus = $focus || $price
            $price.shine4Error ()
        }

        if ($focus && $focus.length) {
            setTimeout (function () {
                $focus.focus ()
            }, 300)
        }

        return flag
    }

    function getProductList(page,callback){
        if(_state.is_loading || _state.is_nomore) { return }
        _state.is_loading = true
        doShowLoading()
        $.get('/union/getProductList',{page:page},function (res) {
            res = JSON.parse(res)
            if(!res.errno){
                if(res.result.last_page <= _state.page){
                    _state.is_nomore = true
                    doShowNomore()
                }
                typeof callback && callback(res.result)
                _state.page++
                _state.is_loading = false
                // removeLoading()
            }else{
                $.dialog.toast(res.errmsg,2000)
            }
        })
    }
    function renderProductList(source_data, $target){
        var html_fn = $.tmpl($.trim($('#JsProductItem').html()))
        var html_str = html_fn({
            list: source_data
        })
        $target.append(html_str)
    }

    //显示加载ing的html
    function doShowLoading($target) {
        var
            $Loading = $('#ProductLoading')

        if ($Loading && $Loading.length){

            return
        }
        var
            img_html = '<img class="product-loading-img" src="data:image/gif;base64,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">'
            ,loading_html = '<div class="product-loading" id="ProductLoading">'+img_html+'<span class="product-loading-txt">加载中...</span></div>'

        $target = $target || $('body')

        $target.append(loading_html)
    }

    // 移除商品加载ing的html
    function removeLoading(){
        var
            $Loading = $('#ProductLoading')

        if ($Loading && $Loading.length){

            $Loading.remove()
        }
    }


    function doShowNomore($target) {
        var
            $Loading = $('#ProductLoading')
        $Loading.html('没有更多商品了...')
    }

})()