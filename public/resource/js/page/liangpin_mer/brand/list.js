$(function () {
    // 编辑品牌排序
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
                brand_id: rowData.brand_id,
                brand_name: rowData.brand_name,
                show_sort: params.value
            }
        },
        url: '/liangpin_mer/ajBrandEdit',
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
    // 添加品牌
    $('#FormAddBrand').on('submit', function (e) {
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