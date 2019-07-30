function IFrameResize() {
    var obj = parent.document.getElementById("external-frame"); //取得父页面IFrame对象
    obj.height = this.document.body.scrollHeight;
}










//获取echarts图标数据
$.ajax({
    type: "post",
    async: true,
    url: publicUrl + "/remoteReading/general.do",
    headers: { "loginToken": loginToken },
    dataType: "json",
    success: function (res) {
        if(res.status == 1){
            var data = res.data;
            //阅片时长
            var mianji_x = data.readingTimeList;
            var mianji_data = data.readingTimeList;
            var mianji_option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'none',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    },
                    formatter: '阅片时长：{c}'
                },
                grid: {
                    top: 15,
                    left: 0,
                    right: 10,
                    bottom: 15
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#F1F4F5',
                            width: 1,
                            type: 'solid'
                        }
                    },
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: '#F1F4F5'
                        }
                    },
                    data: mianji_x
                },
                yAxis: {
                    type: 'value',
                    show: true,
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#F1F4F5'
                        }
                    },
                    axisLabel: {
                        show: false
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#F1F4F5',
                            width: 1,
                            type: 'solid'
                        }
                    }
                },
                series: {
                    type: 'line',
                    symbol: 'none',
                    label: {
                        normal: {
                            show: false,
                            position: 'top'
                        }
                    },
                    itemStyle: {
                        color: 'rgba(92,230,189,0.5)'
                    },
                    lineStyle: {
                        color: "#0eaf8f"
                    },
                    areaStyle: { normal: {} },
                    data: mianji_data
                }
            };
            var mianji_echarts = echarts.init(document.getElementById('mianji_echarts'));
            mianji_echarts.setOption(mianji_option);

            //阅片成功占比图
            var color = ['#3E8EF7', '#FF7794'];
            var seriesData = [{ "name": "阅片成功", "value": data.reportTotal }, { "name": "阅片失败", "value": data.abnormalTotal }];
            var bili = data.reportTotal / (data.reportTotal + data.abnormalTotal) * 100;
            bili = Math.round(bili * Math.pow(10, 0)) / Math.pow(10, 0) + "%";
            var bingtu_option = {
                title: {
                    text: bili,
                    x: 'center',
                    y: 'center',
                    textStyle: {
                        fontWeight: 'normal',
                        color: '#0580f2',
                        fontSize: '30'
                    }
                },
                tooltip: {
                    trigger: 'item'
                },
                series: [{
                    type: 'pie',
                    radius: ['35%', '77%'],
                    color: color,
                    label: {
                        normal: {
                            position: 'inner',
                            formatter: function (param) {
                                return param.data.value;
                            },
                            textStyle: {
                                color: '#fff',
                                fontSize: 12
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: seriesData
                }]
            };
            var bingtu_echarts = echarts.init(document.getElementById('bingtu_echarts'));
            bingtu_echarts.setOption(bingtu_option);

            //环比图
            var bingzao_data = [];
            var huan = data.biradsMap;
            $.each(huan, function (i, val) {
                bingzao_data.push({ "value": val, "name": i });
            });
            var bingzao_color = ['#5CE6BD', '#FFDB5C', '#FF7794'];
            var huan_option = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}: {c} ({d}%)"
                },
                grid: {
                    top: 15,
                    left: 0,
                    right: 10,
                    bottom: 15
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['30%', '60%'],
                        center: ['60%', '60%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    return bingzao_color[params.dataIndex];
                                },
                                shadowBlur: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.3)'
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                fontSize: '20'
                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '30',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data: bingzao_data
                    }
                ]
            };
            var huan_echarts = echarts.init(document.getElementById('huan_echarts'));
            huan_echarts.setOption(huan_option);

            //数据汇总
            var zong_data = [data.imageTotal, data.waitingStartTotal, data.reportTotal, data.processingTotal, data.abnormalTotal, data.doctorTotal];        //数量
            var titlename = ["总筛查量", "待阅片", "已阅片", "阅片中", "异常数量", "超声医生数量"];
            zhu_option = {
                title: {
                    text: '筛查数据综合汇总表',
                    x: 'left',
                    textStyle: {
                        color: '#37474F',
                        fontSize: '18',
                        fontWeight: '400'
                    },
                    padding: [25, 10, 5, 10]
                },
                grid: {
                    left: 10,
                    right: 10,
                    bottom: 15,
                    top: 60,
                    containLabel: true
                },
                xAxis: {
                    show: true,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#F1F4F5'
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        color: '#999'
                    }
                },
                yAxis: [{
                    show: true,
                    data: titlename,
                    inverse: true,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#F1F4F5'
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        color: '#999'
                    }


                },
                {
                    show: true,
                    inverse: true,
                    data: zong_data,
                    axisLabel: {
                        textStyle: {
                            fontSize: 12,
                            color: '#999999'
                        }
                    },
                    axisLine: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    }

                }
                ],
                series: [
                    {
                        name: '条',
                        type: 'bar',
                        yAxisIndex: 0,
                        data: zong_data,
                        barWidth: 26,
                        barCategory: '100%',
                        z: 2,
                        itemStyle: {
                            normal: {
                                //barBorderRadius: 15,
                                color: '#3E8EF7'
                            }
                        }
                    }
                ]
            };
            var zhu_echarts = echarts.init(document.getElementById('zhu_echarts'));
            zhu_echarts.setOption(zhu_option);

            //占比
            var colorList = ['#3E8EF7', '#FFDB5C', '#5CE6BD', '#FF7794'];
            var age_data = [{ "name": "待阅片", "value": data.waitingStartTotal }, { "name": "阅片中", "value": data.processingTotal }, { "name": "已阅片", "value": data.reportTotal }, { "name": "异常", "value": data.abnormalTotal }];
            var yuan_option = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}: {c} ({d}%)"
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['0%', '70%'],
                        selectedMode: 'single',
                        z: 10,
                        left: 250,
                        center: ['50%', '50%'],
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    return colorList[params.dataIndex];
                                },
                                shadowBlur: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.3)'
                            }
                        },
                        label: {
                            normal: {
                                formatter: function (params) {
                                    return params.data.name;
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                length: 0,
                                length2: 20,
                                lineStyle: {
                                    width: 1
                                }
                            }
                        },
                        data: age_data
                    }
                ]
            };
            var yuan_echarts = echarts.init(document.getElementById('yuan_echarts'));
            yuan_echarts.setOption(yuan_option);

            //BI-RADS分级统计
            var fenji = [];
            var fenji_data = [];
            var fenjiMap = data.biradsDetailMap;
            $.each(fenjiMap, function (i, val) {
                fenji.push(i);
                fenji_data.push({ "value": val, "name": i });
            });
            fenji = fenji.sort();
            fenji_option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'none'
                    },
                    formatter: function (params) {
                        return params[0].name + ': ' + params[0].value;
                    }
                },
                grid: {
                    left: 100,
                    right: 100,
                    bottom: 10,
                    top: 50,
                    containLabel: true
                },
                title: {
                    text: 'BI-RADS分级统计',
                    x: 'left',
                    textStyle: {
                        color: '#37474F',
                        fontSize: '18',
                        fontWeight: '400'
                    },
                    padding: [25, 10, 5, 10]
                },
                xAxis: {
                    data: fenji,
                    axisTick: { show: false },
                    axisLine: { show: false },
                    axisLabel: {
                        interval: 0,
                        textStyle: {
                            color: '#37474F',
                            fontSize: 10
                        }
                    }
                },
                yAxis: {
                    splitLine: { show: false },
                    axisTick: { show: false },
                    axisLine: { show: false },
                    axisLabel: { show: false }

                },
                color: ['#e54035'],
                series: [
                    {
                        name: 'BI-BRADS等级',
                        type: 'pictorialBar',
                        barCategoryGap: '-130%',
                        hoverAnimation: true,
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                formatter: '{c}',
                                textStyle: {
                                    fontSize: 14,
                                    color: ['#3B8DF8']
                                }
                            }
                        },
                        symbol: 'path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z',
                        itemStyle: {
                            normal: {
                                opacity: 0.5
                            },
                            emphasis: {
                                opacity: 1
                            }

                        },
                        data: fenji_data,
                        z: 10
                    }

                ]
            };
            var fenji_echarts = echarts.init(document.getElementById('fenji_echarts'));
            fenji_echarts.setOption(fenji_option);
        }else if(res.status == 2){
            parent_tuichu()
        }
    },
    error: function (res) {

    }
});

$("#yanshi").on("click", function () {
    window.open('../readmk_yanshi/list.html', '_blank');
});