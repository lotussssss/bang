$(function () {
    // 编辑属性排序
    $('.js-trigger-edit-sort').editable({
        mode: 'popup',
        onblur: 'cancel',
        showbuttons: true,
        placement: 'top',
        pk: true,
        validate: function (v) {
            if (!(v == '0' || isPositiveInt(v))) {
                toastr.error('请输入大于0的整数')
                return '请输入大于0的整数'
            }
        },
        params: function (params) {
            var $me = $(this),
                $row = $me.closest('tr'),
                rowData = html_decode($row.attr('data-row'))
            try {rowData = JSON.parse(rowData)} catch (e) {rowData = {}}
            return {
                attr_id: rowData.attr_id,
                attr_name: rowData.name,
                show_sort: params.value
            }
        },
        url: '/liangpin_mer/ajAttrEdit',
        success: function (res, v) {
            if (res && !res.errno) {
                toastr.success('编辑成功')
                var $me = $(this),
                    $row = $me.closest('tr'),
                    rowData = html_decode($row.attr('data-row'))
                try {rowData = JSON.parse(rowData)} catch (e) {rowData = {}}
                rowData.show_sort = v
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

    // 属性类型
    $('.js-trigger-edit-attr').editable({
        mode: 'popup',
        onblur: 'cancel',
        showbuttons: true,
        placement: 'top',
        pk: true,
        validate: function (v) {
            if (!(v && $.trim(v))) {
                toastr.error('属性类型不能为空')
                return '属性类型不能为空'
            }
        },
        params: function (params) {
            var $me = $(this),
                $row = $me.closest('tr'),
                rowData = html_decode($row.attr('data-row'))
            try {rowData = JSON.parse(rowData)} catch (e) {rowData = {}}
            return {
                attr_id: rowData.attr_id,
                attr_name: params.value,
                show_sort: rowData.show_sort
            }
        },
        url: '/liangpin_mer/ajAttrEdit',
        success: function (res, v) {
            if (res && !res.errno) {
                toastr.success('编辑成功')
                var $me = $(this),
                    $row = $me.closest('tr'),
                    rowData = html_decode($row.attr('data-row'))
                try {rowData = JSON.parse(rowData)} catch (e) {rowData = {}}
                rowData.name = v
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

    // 添加属性类型
    $('#FormAddAttr').on('submit', function (e) {
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
