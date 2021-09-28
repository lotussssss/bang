// 获取数据的接口
!function (global) {
    var
        Root = tcb.getRoot (),
        i = Root.Index

    i.data = {}

    tcb.mix (i.data, {
        modelList  : getModelList,
        searchList : getSearchList,
        notebookList : getNotebookList
    })


    // =================================================================
    // 公共接口 public
    // =================================================================


    function getModelList (params, callback, error) {
        var
            str_params = $.param (params),
            modelList = tcb.cache ('i_am_model_list_' + str_params) || null

        if (modelList) {
            typeof callback === 'function' && callback (modelList)
        } else {
            params[ 'mobile' ] = '1'
            params[ 'fromget' ] = 'm'
            __ajax ({
                type : 'GET',
                url  : '/huishou/getModels/',
                data : params
            }, function (data, errno) {
                if (errno==666){
                    return !tcb.queryUrl(window.location.search, '_random') && window.location.replace(tcb.setUrl(window.location.href, {
                        _random: Math.random()
                    }))
                }

                if (errno){
                    data = ''
                }

                // 加入cache
                tcb.cache ('i_am_model_list_' + str_params, data)

                typeof callback === 'function' && callback (data)
            }, error)
        }

    }

    function getSearchList (params, callback, error) {
        var
            str_params = $.param (params),
            modelList = tcb.cache ('i_am_model_list_' + str_params) || null

        if (modelList) {
            typeof callback === 'function' && callback (modelList)
        } else {
            params[ 'mobile' ] = '1'
            if(window.__IS_IN_YANJI_ANDROID){
                params['from_page'] = 'android_yanji'
            }
            __ajax ({
                type : 'GET',
                url  : '/huishou/aj_get_sj_search/',
                data : params
            }, function (data, errno) {
                if (errno){
                    data = ''
                }

                // 加入cache
                tcb.cache ('i_am_model_list_' + str_params, data)

                typeof callback === 'function' && callback (data)
            }, error)
        }

    }

    function getNotebookList (params, callback, error) {
        var
            str_params = $.param (params),
            modelList = tcb.cache ('i_am_notebook_list_' + str_params) || null

        if (modelList) {
            typeof callback === 'function' && callback (modelList)
        } else {
            params[ 'mobile' ] = '1'
            params[ 'category' ] = '10'
            __ajax ({
                type : 'GET',
                url  : '/huishou/getModels/',
                data : params
            }, function (data, errno) {
                if (errno){
                    data = ''
                }

                // 加入cache
                tcb.cache ('i_am_notebook_list_' + str_params, data)

                typeof callback === 'function' && callback (data)
            }, error)
        }
    }


    // =================================================================
    // 私有接口 private
    // =================================================================


    function __ajax (params, callback, error) {
        $.ajax ({
            type     : params[ 'type' ],
            url      : tcb.setUrl2(params[ 'url' ]),
            data     : params[ 'data' ],
            dataType : 'json',
            timeout  : 5000,
            success  : function (res) {

                if (res[ 'errno' ]) {
                    $.dialog.toast (res[ 'errmsg' ], 2000)
                }
                typeof callback === 'function' && callback (res[ 'result' ], res[ 'errno' ])
            },
            error    : function () {
                typeof error === 'function' && error ()
            }
        })
    }

} (this)