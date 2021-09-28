/**
 * Created by DELL on-in-one on 2016/9/8.
 */
//物流信息
function getWuliu(textValue,expressCom,expressNum) {
    // alert(textValue+expressCom+expressNum);
    //如果已经含有物流详情，则直接显示
    if ($("#" + textValue).html().length > 0) {
        // $("#dj" + textValue).hide();
        $("#" + textValue).show();
    }
    else {
        $.ajax({
            url: '/aj/expressBang',
            type: 'POST',
            data: {expressCom:expressCom,expressNum:expressNum},
            success: function (data) {
                try {
                    var ret = $.parseJSON(data);
                    if (ret["errno"] == 0) {  //获取数据成功

                        $("#" + textValue).empty();
                        $("#" + textValue).show();
                        var result = ret["result"];
                        var rlength = result.length;
                        var myhtml = "";
                        for (var i = 0; i < rlength; i++) {
                            myhtml += "<p class='clearfix'>";
                                if(i==0){
                                    myhtml+= "<span class='lp_wl_title'></span>";
                                    myhtml+= "<span class='lp_first_wl_time'>"+getLocalTime(result[i]["time"])+"</span>";
                                    myhtml+= "<span class='lp_first_wl_content bl'>"+result[i]["desc"]+"</span>";
                                }else if(i==rlength-1){
                                    myhtml+= "<span class='lp_wl_title'></span>";
                                    myhtml+= "<span class='lp_last_wl_time'>"+getLocalTime(result[i]["time"])+"</span>";
                                    myhtml+= "<span class='lp_last_wl_content bl'>"+result[i]["desc"]+"</span>";
                                }else{
                                    myhtml+= "<span class='lp_wl_title'></span>";
                                    myhtml+= "<span class='lp_wl_time'>"+getLocalTime(result[i]["time"])+"</span>";
                                    myhtml+= "<span class='lp_wl_content bl'>"+result[i]["desc"]+"</span>";
                                }
                            myhtml += "</p>"
                        }

                        $("#" + textValue).append(myhtml);
                    } else {
                        alert(ret["errmsg"]);
                    }
                } catch (e) {
                    alert('操作失败，出错了！');
                }
            }
        });
    }

}

//将当前时间戳转换为日期
function getLocalTime(nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
}

//添加退货邮寄信息
function addExpress(orderId, expressCom, expressNum) {
    if (orderId == "" || expressCom == "" || expressNum == "") {
        alert("快递信息不完整");
        return;
    }
    $.ajax({
        url: '/liangpin_my/addAfterSalesExpressInfo',
        type: 'POST',
        data: {orderId: orderId, expressCom: expressCom, expressNum: expressNum},
        success: function (data) {
            var ret = $.parseJSON(data);
            if (ret["errno"] == 0) {
                window.location.reload();
            } else {
                alert(ret["errmsg"]);
            }
        }
    })
}