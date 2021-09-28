/**
 * Created by DELL on-in-one on 2016/9/12.
 */
function quxiaotuisong(product_id){
    $.ajax({
        url: '/liangpin_mer/ajCancelTuiSong',
        type: 'POST',
        data: {product_id:product_id},
        success: function (data) {
            var ret = $.parseJSON(data);
            try{
                if (ret["errno"] == 0) {  //取消推送成功
                       window.location.reload();
                }else{
                    alert(ret["errormsg"]);
                }
            }catch(e){
                alert(ret["errormsg"]);
            }
        }
    });
}

function addtuisong() {

    var productId = document.forms["addForm"].product_id.value;
    var st_date = document.forms["addForm"].tuisong_start_time_date.value;
    var st_time = document.forms["addForm"].tuisong_start_time_time.value;
    var ed_date = document.forms["addForm"].tuisong_end_time_date.value;
    var ed_time = document.forms["addForm"].tuisong_end_time_time.value;

    if(productId==""){
        alert("商品号为空");return;
    }
    if(st_date==""){
        alert("开始日期为空");return;
    }
    if(st_time==""){
        alert("开始时间为空");return;
    }
    if(ed_date==""){
        alert("结束日期为空");return;
    }
    if(ed_time==""){
        alert("结束时间为空");return;
    }

    var st = st_date+st_time;
    var ed = ed_date+ed_time;
    if(st>=ed){
        alert("开始时间大于结束时间有误");
        return;
    }

    $.ajax({
        url:"/liangpin_mer/ajAddTuiSong",
        type: 'POST',
        data:$('#addForm').serialize(),
        success: function (data) {
            var ret = $.parseJSON(data);
            try{
                if (ret["errno"] == 0) {  //添加推送成功
                    window.location.reload();
                }else{
                    alert(ret["errmsg"]);
                }
            }catch(e){
                alert(ret["errmsg"]);
            }
        }
    });
}