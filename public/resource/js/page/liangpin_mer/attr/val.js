$(function () {
    // 编辑机型
    $('.js-trigger-edit-attr-val').editable({
        mode: 'popup',
        onblur: 'cancel',
        showbuttons: true,
        placement: 'top',
        pk: true,
        validate: function (v) {
            if (!(v && $.trim(v))) {
                toastr.error('属性值不能为空')
                return '属性值不能为空'
            }
        },
        params: function (params) {
            var $me = $(this),
                $row = $me.closest('tr'),
                rowData = html_decode($row.attr('data-row'))
            try {rowData = JSON.parse(rowData)} catch (e) {rowData = {}}
            return {
                attr_val_id: rowData.attr_val_id,
                attr_val_name: params.value
            }
        },
        url: '/liangpin_mer/ajAttrValEdit',
        success: function (res, v) {
            if (res && !res.errno) {
                toastr.success('编辑成功')
                var $me = $(this),
                    $row = $me.closest('tr'),
                    rowData = html_decode($row.attr('data-row'))
                try {rowData = JSON.parse(rowData)} catch (e) {rowData = {}}
                rowData.val = v
                $row.attr('data-row', html_encode(JSON.stringify(rowData)))
                return true
            } else {
                toastr.error((res && res.errmsg) || '系统错误')
            }
        },
        error: function (res) {
            toastr.error((res && res.statusText) || '系统错误') // res.responseText
        }
    })
    // 添加属性值
    $('#FormAddAttrVal').on('submit', function (e) {
        e.preventDefault()
        var $form = $(this)

        request({
            url: $form,
            success: function (res) {
                if (res && !res.errno) {
                    toastr.success('添加成功')
                    setTimeout(function () {
                        window.location.reload()
                    }, 1000)
                } else {
                    toastr.error((res && res.errmsg) || '系统错误')
                }
            },
            error: function (xhr) {
                toastr.error((xhr && xhr.statusText) || '系统错误')
            }
        })
    })
})
