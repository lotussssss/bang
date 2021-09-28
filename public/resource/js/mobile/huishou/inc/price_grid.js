/**
 * 简单价格统计图表
 * @return {[type]} [description]
 */
var priceGird = (function(){
    var context;
    var canvas;
    var g_conf;
    var xTxtPoi = [];
    var yTxtPoi = [];
    var y1pxValue;
    var LINE_COLOR = "#6ca9dc";

    /**
     * [init description]
     * @param  {[type]} box    [description]
     * @param  {JSON}
     *      config {
				x : ['5月', '6月', '7月', '8月'],
				y : ['3000', '3020', '3040', '3060', '3080', '3100'],
				data : [3096, 3073, 3064, 3050]
			}
     * @return {[type]}        [description]
     */
    function init(box, config){
        if(!$(box) || !config){
            try{console.error('arguments error');}catch(ex){}
            return;
        }

        canvas = $(box)[0];
        g_conf = config;

        context =canvas.getContext("2d");

        context.scale(2, 2); //缩放坐标系，使高分辨率手机能够看到更清晰的图片。canvas大小为实际大小的2倍

        clean();

        drawXY();
        drawMonth();
        drawGrade();
        drawTxt();
        drawData();

        //fixed a bug of canvas on Samsung S4.
        canvas.style.opacity=0.999;
        setTimeout(function(){ canvas.style.opacity=1 }, 1);
    }

    function drawXY(){
        context.strokeStyle = LINE_COLOR;
        context.moveTo(10, 0);
        context.lineTo(10, 150);
        context.lineTo(310, 150);
        context.stroke();
    }

    function drawMonth(){
        context.strokeStyle = LINE_COLOR;

        var startX = 10;
        var startY = 150;
        var endY = 0;
        var step = g_conf.x.length -1 ;

        var xStep = Math.floor(300/step) -10;

        xTxtPoi.push([startX, startY]);
        while(step>0){
            step --;
            startX += xStep;
            context.moveTo(startX, startY);
            context.lineTo(startX, endY);

            xTxtPoi.push([startX, startY]);
        }
        context.stroke();
    }

    function drawGrade(){
        context.strokeStyle = LINE_COLOR;

        var startY = 150;
        var startX = 10;
        var endX = 310;
        var step= g_conf.y.length;
        var stepDy = 22;

        y1pxValue = (g_conf.y[1] - g_conf.y[0])/22;

        yTxtPoi.push([ startX, startY ]);
        while( step>0 ){
            step--;
            startY -= stepDy;
            context.moveTo(startX, startY);
            context.lineTo(endX, startY);

            yTxtPoi.push([ startX, startY ]);
        }

        context.stroke();
    }

    function drawTxt(){
        if(!g_conf.x){ return; }

        for(var i=0, n=yTxtPoi.length; i<n; i++){
            if(i%2==1)
                context.clearRect(yTxtPoi[i][0]-6, yTxtPoi[i][1]-6, 24, 14);
        }

        context.fillStyle = "#FEFEFC";
        context.font = "normal 12px sans-serif";

        for(var i=0, n=xTxtPoi.length; i<n; i++){
            context.fillText( g_conf.x[i], xTxtPoi[i][0]-6, xTxtPoi[i][1]+14);
        }

        for(var i=0, n=yTxtPoi.length; i<n; i++){
            if(i%2==1)
                context.fillText( g_conf.y[i], yTxtPoi[i][0]-8, yTxtPoi[i][1]+5);
        }

    }

    function drawData(){
        if(!g_conf.data){return;}
        var dataPoi = [];

        for(var i=0, n=g_conf.data.length; i<n; i++){
            context.beginPath();
            var x=xTxtPoi[i][0], y=150- ( (g_conf.data[i]-g_conf.y[0]) /y1pxValue);

            dataPoi.push( [x ,y] );

            context.arc(x, y, 4, 0, Math.PI * 2);

            context.closePath();
            context.fillStyle = '#38D5F6';
            context.fill();
        }

        context.strokeStyle = "#38D5F6";
        context.lineWidth = 2;
        context.moveTo(dataPoi[0][0], dataPoi[0][1]);
        for(var i=1, n=dataPoi.length; i<n; i++){
            context.lineTo(dataPoi[i][0], dataPoi[i][1]);
        }
        context.stroke();
    }

    function clean(){
        context.clearRect(0, 0, canvas.width, canvas.height);
        xTxtPoi = [];
        yTxtPoi = [];
        y1pxValue = 0;
    }

    return {
        init : init
    }
})();