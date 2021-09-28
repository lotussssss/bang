// 订单列表
$(function(){
    var $TplOrderList = $ ('.tpl-order_list')
    if (!($TplOrderList && $TplOrderList.length)) {
        return
    }

    $.bindEvent(document.body, {
        // 确认支付
        '.tpl-order_list .confirm-order': function(e){
            e.preventDefault();

            var $me = $(this),
                order_id = $me.parent().attr('data-orderid');

            var url = '/hsuser/UserConfirmOrder';

            $.post(url, {'order_id':order_id}, function(res){
                res = $.parseJSON(res);

                if (!res['errno']) {
                    $me.parent().html('交易完成，正在打款');
                } else {
                    alert(res['msg']);
                }
            });
        },
        // 申诉
        '.tpl-order_list .appeal-order': function(e){
            e.preventDefault();

            var $me = $(this),
                order_id = $me.parent().attr('data-orderid');

            var $panel = $('#MHuishouAppealOrderPanel');
            if (!$panel.length) {
                var tmpl_str = $.tmpl($.trim($('#MHuishouAppealOrderPanelTpl').html()))({
                    'order_id': order_id
                });
                $panel = $(tmpl_str);
                $panel.css({
                    'top': $(window).scrollTop()+60
                });
                $panel.appendTo('body');

                var $panel_mask = $('<div class="m-huishou-appeal-order-mask"></div>');
                $panel_mask.appendTo('body');

                // 关闭申诉填写
                $panel
                    .find('.close')
                    .add($panel_mask)
                    .on('click', function(e){
                        e.preventDefault();

                        $panel_mask.remove();
                        $panel.remove();
                    });
                // 提交申诉信息
                $panel
                    .find('form')
                    .on('submit', function(e){
                        e.preventDefault();

                        var $form = $(this);

                        var $ap_cnt = $form.find('[name="appeal_content"]'),
                            flag = true;

                        if (!$ap_cnt.val()) {
                            $.errorAnimate($ap_cnt.focus());
                            flag = false;
                        }
                        if (!flag) {
                            return;
                        }

                        $.post($form.attr('action'), $form.serialize(), function(res){
                            res = $.parseJSON(res);

                            if (!res['errno']) {
                                $me.parent().html('申诉中');

                                $panel_mask.remove();
                                $panel.remove();
                            } else {
                                alert(res['msg']);
                            }
                        });
                    });
            }

            $panel.show();
            $panel_mask.show();
        },
        // 确认退货
        '.tpl-order_list .confirm-back': function(e){
            e.preventDefault();

        }
    })
    
})