{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
<div class="am-cf am-padding">
    <div class="am-fl am-cf">
        <strong class="am-text-primary am-text-lg">{%$modelName%}</strong>
    </div>
</div>

<hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
<div class="am-g">
    <div class="am-u-sm-12 am-scrollable-horizontal">
        <div class="am-u-sm-6">
            <div id="main1" style="width: 600px;height:400px;"></div>
        </div>
        <div class="am-u-sm-6">
            <div id="main2" style="width: 600px;height:400px;"></div>
        </div>
    </div>
    <div class="am-u-sm-12 am-scrollable-horizontal">
        <div id="main3" style="width: 600px;height:400px;"></div>
    </div>
</div>
{%/block%}

{%block name="block_js" append%}
    <script src="/resource/js/component/echarts.js"></script>
    <script type="text/javascript">
        {%for $i = 1; $i <= 3; $i++ %}
            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('main' + {%$i%}));

            // 指定图表的配置项和数据
            var option = {
                title: {
                    text: '{%$tableTitle[$i]%}回收价格对比'
                },
                tooltip: {default: 'axis'},
                legend: {
                    data: ['同城帮', '爱回收']
                },
                xAxis: {
                    data: '{%$xDate%}'.split(',')
                },
                yAxis: {
                    splitNumber: [5],
                    min: [{%$min[$i]%}],
                    max: [{%$max[$i]%}]
                },
                series: [{
                    name: '爱回收',
                    type: 'line',
                    itemStyle: {
                        normal: {
                            label: {show: true, position: 'top'}
                        }
                    },
                    data: [{%$thirdPartyPrice[$i]%}]
                },
                    {
                        name: '同城帮',
                        type: 'line',
                        itemStyle: {
                            normal: {
                                label: {show: true, position: 'top'}
                            }
                        },
                        data: [{%$tcbPrice[$i]%}]
                    }]
            };

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        {%/for%}
    </script>
{%/block%}
