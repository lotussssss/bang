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

