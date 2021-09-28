
;(function () {
    //质检报告页
    $(function () {
        var
            $page_quality_detail = $('.page-quality_detail'),
            $info_item = $('.info-item')

        function bindEvent() {

            tcb.bindEvent({
                // 申诉
                '.js-trigger-appeal':function (e) {
                    e.preventDefault()
                    var $this = $(this)
                    if($this.hasClass('btn-disabled')){
                        $.dialog.toast('您已经申诉过，请等待结果',2000)
                        return
                    }

                    !$this.hasClass('btn-disabled') ? $this.addClass('btn-disabled'): ''
                    $.ajax({
                        type: 'POST',
                        url: '/m/doUserShenSu',
                        dateType: "json",
                        data: {
                            order_id : _order_id
                        },
                        success: function (res) {
                            res = JSON.parse(res)
                            if(!res.errno){
                                window.location.href= '/m/userShenSuSucc'+ location.search
                            }else {
                                $.dialog.toast(res.errmsg,2000)
                                $this.hasClass('btn-disabled')? $this.removeClass('btn-disabled'): ''
                            }
                        }
                    })
                },
                //大图
                '.js-trigger-show-big-img': function (e) {
                    e.preventDefault()
                    var $this = $(this),
                        img_url = $this.find('img').attr('src'),
                        dialog_str = '<div class="big-img-wrap"><img src='+img_url+'></div>'
                    var img_ele = new Image()
                    img_ele.src =img_url
                    img_ele.onload = function (e) {
                        tcb.showDialog ( dialog_str, {
                            className : 'big-img-panel',
                            withClose : true,
                            middle    : false
                        })
                    }
                }
            })
            //功能item
            Array.prototype.slice.call($info_item).forEach(function (item) {
                toggleSlide($(item))
            })
        }

        //质检项隐藏/显示
        function toggleSlide($container, callback) {
            if(!$container || $container.length === 0){console.log('没有container'); return }

            var $hanlde_bar = $container.find('.info-tit')

            $hanlde_bar.on('click',function (e) {
                var $this = $(this),
                    $toggle_content = $this.siblings('.info-detail'),
                    $toggle_content_items = $toggle_content.children(),
                    is_show = !!$toggle_content.height(),
                    $icon = $this.find('.gengduo')
                e.preventDefault()
                $toggle_content.css('transition','height '+$toggle_content_items.length*.1+'s liner')
                if(is_show){
                    $toggle_content.height(0)
                    $icon.removeClass('down')
                }else {
                    var content_height = 0
                    Array.prototype.slice.call($toggle_content_items).forEach(function (child) {
                        content_height += $(child).height()
                    })
                    $toggle_content.height(content_height)
                    $icon.addClass('down')
                }
                is_show = !is_show
            })
        }

        bindEvent()

    })

})()