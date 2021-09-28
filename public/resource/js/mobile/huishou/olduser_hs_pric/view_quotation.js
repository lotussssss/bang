;
!function () {
    // var tipsArr = {
    //     1: '接近全薪的',
    //     2: '稍微有点小花'
    // }
    var $capacity = {}
    var __flag = false  // 是否修改了机型
    var showToast = false   // 是否显示了toast,默认false
    var skuMap = {  // 获取用户价格的参数
        model_id: '',
        sku_group_id: '',
        chengse_id: ''
    }
    var selObj = {  // 选中的参数
        capat_id: '',
        color_id: ''
    }

    var access_key_Params = {}  // 获取access_key的参数
    var accessKey = ''  //access_key


    // 页面数据处理
    var handelOptions = function ($ele, defaultText, data) {
        var $_this = $ele
      var $_html = '<option value="-1" selected>' + defaultText + '</option>'
        if(data){
          $.each(data, function (index, value) {
            $_html += '<option value="' + value.attr_valueid + '">' + value.attr_valuename + '</option>'
          })
        }
        $_this.html($_html)
        setSelectText($_this)
    }

    // 用来处理select组件选择的内容,显示在页面上
    var setSelectText = function (selEle) {
        if (!selEle) return
        var $_this = selEle
        var $text = $_this.prev('.sel-text')  // span元素,用来展示选中的option的内容
        var $selectedText = $_this.children('option').not(function () {
            return !this.selected
        }).text()  // 取到选中的option的文本
        $text.html($selectedText) // 修改span的内容
    }

    // 点击问号触发
    var tipsEvent = function (tipsEle) {
        if (!tipsEle) return
        var tipsArr = window.__CHENGSE_TIPS__ || ''
        var $_this = tipsEle
        var tipsIndex = $_this.attr('data-tipsIndex')
        var tipsText = tipsArr[tipsIndex] || ''
        if(tipsText){
          $.dialog.show(tipsText)
        }
    }

    // 禁用事件
    var disabledSelect = function ($selEle) {
        if (!$selEle) {
            var $selRow = $('div.olduser-sel-row')
            if ($selRow.hasClass('sel-disabled')) {
                $('.sel-disabled select').attr('disabled', 'disabled')
            }
        } else {
            $selEle.removeAttr('disabled').parent('.sel-disabled').removeClass('sel-disabled')
        }
    }

    // 重置select 数据
    var handelResetSelect = function () {
        var $_modelId = $('#modelId')
        var $_color = $('#color')
        var $_chengse = $('#chengse')
        var $_capacity = $('#capacity')
        $_capacity.val(-1)
        $_color.val(-1)
        $_chengse.val(-1)
        setSelectText($_capacity)
        setSelectText($_color)
        setSelectText($_chengse)
        if (!__flag) {
            $_modelId.val(-1)
            setSelectText($_modelId)
        }
    }

    // 校验是否选择数据
    var eventCheckSelect = function () {
        var _flag = true
        var $_modelId = $('#modelId')
        var $_color = $('#color')
        var $_chengse = $('#chengse')
        var $_capacity = $('#capacity')
        var err_msg = ''
        // 机型
        if ($_modelId.val() == -1) {
            err_msg = '请选择机型'
        } else if ($_capacity.val() == -1) {
            err_msg = '请选择容量'
        } else if ($_color.val() == -1) {
            err_msg = '请选择颜色'
        } else if ($_chengse.val() == -1) {
            err_msg = '请选择成色'
        }
        if (err_msg) {
            _flag = false
            if(!showToast){ // 节流阀
              showToast = true
              setTimeout(function () {
                showToast = false
              }, 1500)
              $.dialog.toast(err_msg)
            }
        }
        return _flag
    }

    // 处理机器容量颜色数据
    var eventCapacity = function (dataObj) {
        if (!dataObj) return
        var _capacity = {}
        _capacity.skuMap = {} // 初始skuMap
        // 遍历数据
      Object.keys(dataObj).forEach(function (skuGroupIndex) {
        var __skuInfo = dataObj[skuGroupIndex];
        _capacity.skuMap[skuGroupIndex] = ''; // 初始当前skuMap
        // 遍历每一项 skugroup
        Object.keys(__skuInfo).forEach(function (__skuId) {

          // 暂存id及valuename
          var __attr_id = __skuInfo[__skuId].attr_id;
          var __attr_valueid = __skuInfo[__skuId].attr_valueid;
          var __attr_valuename = __skuInfo[__skuId].attr_valuename;
          // sku存放
          _capacity.skuMap[skuGroupIndex] += __attr_valueid + '-';

          if (Array.isArray(_capacity[__attr_id]) && _capacity[__attr_id].length > 0) {

            for (var i in _capacity[__attr_id]) {
              // 判断,不存在,加入
              if (_capacity[__attr_id][i].attr_valueid === __attr_valueid) {
                return;
              }
            }
            _capacity[__attr_id].push({
              attr_valuename: __attr_valuename,
              attr_valueid: __attr_valueid
            });
          } else {
            _capacity[__attr_id] = []; // 数组,存放容量
            _capacity[__attr_id].push({
              attr_valuename: __attr_valuename,
              attr_valueid: __attr_valueid
            });
          }
        });
      });
        return _capacity
    }

    //根据已选容量 筛选出该容量下的颜色sku
    function getColorGroupByCapacity(capacity_id){
        if(!$capacity.list){
            $.dialog.toast('请先选择回收机型')
            return
        }
        var color_group = []
        Object.keys($capacity.list).forEach(function(_sku_group_id){
            var _sku_group = $capacity.list[_sku_group_id]
            if(!_sku_group || !_sku_group.length){ return }
            if(_sku_group[0]['attr_valueid'] == capacity_id){
                color_group.push({
                    attr_valueid:_sku_group[1]['attr_valueid'],
                    attr_valuename:_sku_group[1]['attr_valuename'],
                })
            }
        })
        return color_group
    }

    // 处理skuMap
    function eventSkuMap(capa, color, data) {
        var __skugroupid = ''
        var __channel_id = 16
        var __str = capa + '-' + color + '-' + __channel_id + '-'
        $.each(data, function (index, value) {
            if (__str === value) {
                __skugroupid = index
                return
            }
        })
        return __skugroupid
    }

    // 获取机型容量等
    var doGetSku = function (params, callback) {
        $.ajax({
            type: 'POST',
            url: '/huishou/doGetSkuOptions',
            data: params,
            dataType: 'json',
            timeout: 5000,
            success: function (res) {
                if (res['errno']) {
                    return $.dialog.toast(res['errmsg'], 2000)
                }
                typeof callback === 'function' && callback(res['result'])
            },
            error: function (err) {
                $.dialog.toast('系统错误,请刷新页面重试', 2000)
            }
        })
    }

    // 获取老用户价格
    var doGetOldUserPrice = function (params, callback) {
        $.ajax({
            type: 'POST',
            url: '/huishou/getOldUserPrice',
            data: params,
            dataType: 'json',
            timeout: 5000,
            success: function (res) {
                if (res['errno']) {
                    return $.dialog.toast(res['errmsg'], 2000)
                }
                typeof callback === 'function' && callback(res['result'])
            },
            error: function (err) {
                $.dialog.toast('系统错误,请刷新页面重试', 2000)
            }
        })
    }

    // 获取access_key
    var doGetAccessKey = function (params, callback) {
        $.ajax({
            type: 'POST',
            url: '/huishou/doPinggu',
            data: params,
            dataType: 'json',
            timeout: 5000,
            success: function (res) {
                if (res['errno']) {
                    return $.dialog.toast(res['errmsg'], 2000)
                }
                typeof callback === 'function' && callback(res['result'])
            },
            error: function (err) {
                $.dialog.toast('系统错误,请刷新页面重试', 2000)
            }
        })
    }

    // 设置报价
    var hadelRevoveryPric = function ($el, data) {
        var $_this = $el
        $_this.find('.del-price').html(data.show_price || '')
        $_this.find('.true-price').html(data.price || '')
    }

    // 隐藏回收价格及按钮,显示查看报价
    var handelHideReceryBtn = function () {
        $('#viewButton').parent('.olduser-button').show()
        $('.olduser-recovery').hide()
    }

    // 隐藏查看报价,显示立即回收
    var handelShowReceryBtn = function () {
        $('#viewButton').parent('.olduser-button').hide()
        $('.olduser-recovery').show()
    }

    // 有修改时,改变span内容
    $('#Main select').on('change', function () {
        setSelectText($(this))
    })

    // 查看报价
    $('#viewButton').on('click', function () {
        if (eventCheckSelect()) {
            var _skugroupid = eventSkuMap(selObj.capat_id, selObj.color_id, $capacity.skuMap)
            if (_skugroupid === '') {
                $.dialog.toast('暂无合适的容量及颜色匹配', 2000)
            }
            skuMap.sku_group_id = _skugroupid
            if (skuMap.model_id !== '' && skuMap.chengse_id !== '' && skuMap.sku_group_id !== '') {
                doGetOldUserPrice({
                    model_id: skuMap.model_id,
                    chengse_id: skuMap.chengse_id,
                    sku_group_id: skuMap.sku_group_id
                }, function (data) {
                    hadelRevoveryPric($('#revoveryPric'), data) // 设置页面的价格
                    handelShowReceryBtn() // 显示回收按钮
                    access_key_Params = data
                })
            }
        }

    })

    // 点击问号
    $('.icon-wenhao').on('click', function () {
        tipsEvent($(this))
    })

    // 选择机型
    $('#modelId').on('change', function () {
        var $_this = $(this)
        var $_capacity = $('#capacity')
        var _model_id = $_this.val()
        if (_model_id && (_model_id != -1)) {
            skuMap.model_id = _model_id
            doGetSku({
                model_id: _model_id,
                channel_id: 16  // 固定16,国行
            }, function (data) {
                $capacity = eventCapacity(data.list)
                $capacity.list = data.list
                __flag = true
                handelOptions($_capacity, '请选择容量', $capacity['2'])
                handelOptions($('#color'), '请选择颜色')
                disabledSelect($_capacity)
            })
            if (__flag) {
                handelResetSelect()
                handelHideReceryBtn()
            }
        }
    })

    // 选择容量
    $('#capacity').on('change', function () {
        var $_this = $(this)
        var $_color = $('#color')
        var $_id = $_this.val()
        if ($_id && ($_id != -1)) {
            selObj.capat_id = $_id
            //根据已选容量 筛选颜色
            var color_group = getColorGroupByCapacity($_id)
            handelOptions($_color, '请选择颜色', color_group)
            disabledSelect($_color)
            handelHideReceryBtn()
        }
    })

    // 选择颜色
    $('#color').on('change', function () {
        var $_this = $(this)
        var $_chengse = $('#chengse')
        var $_id = $_this.val()
        if ($_id && ($_id != -1)) {
            selObj.color_id = $_id
            disabledSelect($_chengse)
            handelHideReceryBtn()
        }
    })

    // 选择成色
    $('#chengse').on('change', function () {
        var $_this = $(this)
        var _chengse_id = $_this.val()
        if (_chengse_id != -1) {
            skuMap.chengse_id = _chengse_id
            handelHideReceryBtn()
        }
    })

    // 立即回收
    $('#recoveryButton').on('click', function () {
        if (eventCheckSelect()) {
            doGetAccessKey({
                from: '',
                model_id: access_key_Params.model_id || '',
                sku_group_id: access_key_Params.sku_group_id || '',
                sub_options: access_key_Params.sub_options || '',
                chengse_id: skuMap.chengse_id,
                baseinfo: ''
            }, function (resData) {
                if (resData.assess_key) {
                  window.location.href = '/m/pinggu_shop/?assess_key=' + resData.assess_key
                }
            })
        }
    })
    handelResetSelect()
    disabledSelect()
}()