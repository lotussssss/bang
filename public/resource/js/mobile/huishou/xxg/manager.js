// 修修哥店员管理
!function(){
    if (window.__PAGE!=='xxg-manager'){
        return
    }

    $(function () {
        // 绑定事件
        tcb.bindEvent(document.body, {
            // 点击弹出在职/离职状态弹窗
            '.js-trigger-edit-job-status': function(e){
                e.preventDefault()

                var $me = $(this),
                    xxg_qid = $me.attr('data-xxg-qid')

                var html_str = $.tmpl($.trim($('#JsXxgEditJobStatusPanelTpl').html()))({
                    'xxg_qid': xxg_qid
                    }),
                    config = {
                        middle: true,
                        className: 'xxg-edit-job-status-panel'
                    }
                tcb.showDialog(html_str, config)
            },
            // 设置在职/离职状态
            '.btn-panel-edit': function(e){
                e.preventDefault()

                var $me = $(this),
                    xxg_qid = $me.attr('data-xxg-qid'),
                    status = $me.attr('data-status')

                $.get('/m/jobTagTrans',{
                    xxg_qid : xxg_qid,
                    status : status
                },function (res) {
                    res = $.parseJSON(res)

                    if(!res['errno']){
                        $.dialog.toast('设置成功!', 2000)

                        setTimeout(function () {
                            window.location.reload()
                        },1000)
                    } else {
                        $.dialog.toast(res.errmsg, 2000)
                    }
                })
            },
            // 添加店员
            '.js-trigger-add-staff': function(e){
                e.preventDefault()

                var html_str = $.tmpl($.trim($('#JsXxgAddStaffPanelTpl').html()))({}),
                    config = {
                        middle: true,
                        className: 'xxg-add-staff-panel'
                    }
                tcb.showDialog(html_str, config)
                bindEventSubmitForm($('#AddStaffForm'))
            }
        })

        function bindEventSubmitForm($Form) {
            $Form.on('submit',function (e) {
                e.preventDefault()

                var
                    $form = $(this)
                if (!validSubmitForm($form)){
                    return
                }

                $.post ($form.attr ('action'), $form.serialize(), function (res) {
                    try {
                        res = $.parseJSON (res)

                        if (!res[ 'errno' ]) {
                            $.dialog.toast('添加成功!', 2000)

                            setTimeout(function () {
                                window.location.reload()
                            },1000)
                        }else{
                            $.dialog.toast(res.errmsg, 2000)
                        }
                    } catch (ex){
                        $.dialog.toast('系统错误，请刷新页面重试', 2000)
                    }
                })
            })

        }
        function validSubmitForm ($Form) {
            var
                flag = true

            if (!($Form && $Form.length)) {
                flag = false
            } else {

                var
                    $user_name = $Form.find ('[name="user_name"]'),
                    $mobile = $Form.find ('[name="mobile"]'),

                    user_name = $.trim ($user_name.val ()),
                    mobile = $.trim ($mobile.val ())
                var
                    $focus_el = null,
                    err_msg = ''

                // 验证姓名
                if (!user_name) {
                    $.errorAnimate ($user_name)
                    $focus_el = $focus_el || $user_name
                    err_msg = '姓名不能为空'
                }
                // 验证手机号
                if (!mobile) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = err_msg || '手机号码不能为空'
                }
                else if (!tcb.validMobile (mobile)) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = err_msg || '手机号码格式错误'
                }

                if (err_msg) {
                    flag = false

                    setTimeout (function () {
                        $focus_el && $focus_el.focus ()
                    }, 500)

                    $.dialog.toast (err_msg)
                }
            }

            return flag
        }
    })

}()