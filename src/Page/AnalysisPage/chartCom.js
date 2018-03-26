import { Line } from 'react-chartjs-2'
import React, { Component } from 'react';
class ChartCom extends Component
{
    constructor() {
        super();
        this.state={
            Data:[]
        }
    }

    componentWillReceiveProps(nextProps)
    {
        console.log(nextProps)
        this.state={
            DataSource:nextProps.DataSource,
            ChartType:nextProps.ChartType
        }
    }

    mainChartOpts = {
        maintainAspectRatio: false,
        legend: {
            display: true
        },
        title: {
            display: true,
            title: "t1"
        },
        scales: {
            xAxes: [{
                gridLines: {
                    drawOnChartArea: false,
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                }
            }]
        },
        elements: {
            point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 4,
                hoverBorderWidth: 3,
            }
        }
    }

    render() {
        //var DataSource = this.props.DataSource;
        var DataSource=this.state.DataSource;
        var labels=[];
        var DataForY=[];
        var DataForB=[];
        var DataForN=[];
        var DataForTotal=[];
        if (DataSource != null && DataSource != undefined) {
            console.log(DataSource.length);
            for (var i = 0; i < DataSource.length; i++) {
                
                for (var j = 0; j < DataSource[i].length; j++) {
                    if (labels.indexOf(DataSource[i][j].date) === -1) {
                        
                        labels.push(DataSource[i][j].date);
                    }
                    var feedingAmount = DataSource[i][j].feedingAmount;
                    var lastMonthCheck = DataSource[i][j].lastMonthCheck;
                    var monthCheck = DataSource[i][j].monthCheck;
                    var notHitThing = DataSource[i][j].notHitThing;
                    var outInOfStorage = DataSource[i][j].outInDefective + DataSource[i][j].outInNotHit;
                    var realThing = DataSource[i][j].realThing;
                    var ChrClass = DataSource[i][j].chrClass.toUpperCase();
                    var rate = 0;
                    var TotalRate = 0;
                    if (this.state.ChartType === "1") {
                        rate = (realThing + notHitThing) / (lastMonthCheck + feedingAmount - monthCheck);
                        var Total_Feeding=0;
                        var Total_lastMonthCheck=0;
                        var Total_monthCheck=0;
                        var Total_notHitThing=0;
                        var Total_outInOfStorage=0;
                        var Total_realThing=0;
                        for (var k = 0; k < DataSource.length; k++) {
                            Total_Feeding += DataSource[k][j].feedingAmount;
                            Total_lastMonthCheck += DataSource[k][j].lastMonthCheck;
                            Total_monthCheck += DataSource[k][j].monthCheck;
                            Total_notHitThing += DataSource[k][j].notHitThing;
                            Total_outInOfStorage += DataSource[k][j].outInDefective + DataSource[k][j].outInNotHit;
                            Total_realThing += DataSource[k][j].realThing;
                        }
                        TotalRate=(Total_realThing + Total_notHitThing) / (Total_lastMonthCheck + Total_Feeding - Total_monthCheck);

                    }
                    else if (this.state.ChartType === "2") {
                        rate = (realThing) / (lastMonthCheck + feedingAmount - monthCheck);
                        var Total_Feeding=0;
                        var Total_lastMonthCheck=0;
                        var Total_monthCheck=0;
                        var Total_notHitThing=0;
                        var Total_outInOfStorage=0;
                        var Total_realThing=0;
                        for (var k = 0; k < DataSource.length; k++) {
                            Total_Feeding += DataSource[k][j].feedingAmount;
                            Total_lastMonthCheck += DataSource[k][j].lastMonthCheck;
                            Total_monthCheck += DataSource[k][j].monthCheck;
                            Total_notHitThing += DataSource[k][j].notHitThing;
                            Total_outInOfStorage += DataSource[k][j].outInDefective + DataSource[k][j].outInNotHit;
                            Total_realThing += DataSource[k][j].realThing;
                        }
                        TotalRate=(Total_realThing ) / (Total_lastMonthCheck + Total_Feeding - Total_monthCheck);

                    }
                    else if (this.state.ChartType === "3") {
                        rate = (realThing + outInOfStorage) / (lastMonthCheck + feedingAmount - monthCheck);
                        var Total_Feeding=0;
                        var Total_lastMonthCheck=0;
                        var Total_monthCheck=0;
                        var Total_notHitThing=0;
                        var Total_outInOfStorage=0;
                        var Total_realThing=0;
                        for (var k = 0; k < DataSource.length; k++) {
                            Total_Feeding += DataSource[k][j].feedingAmount;
                            Total_lastMonthCheck += DataSource[k][j].lastMonthCheck;
                            Total_monthCheck += DataSource[k][j].monthCheck;
                            Total_notHitThing += DataSource[k][j].notHitThing;
                            Total_outInOfStorage += DataSource[k][j].outInDefective + DataSource[k][j].outInNotHit;
                            Total_realThing += DataSource[k][j].realThing;
                        }
                        TotalRate=(Total_realThing + Total_outInOfStorage) / (Total_lastMonthCheck + Total_Feeding - Total_monthCheck);

                    }
                    TotalRate=(Math.round(parseFloat(TotalRate) * 10000) / 100);
                    rate = (Math.round(parseFloat(rate) * 10000) / 100);
                    if (ChrClass === "Y") {
                        DataForY.push(rate);
                    }
                    else if (ChrClass === "B") {
                        DataForB.push(rate);
                    }
                    else if (ChrClass === "N") {
                        DataForN.push(rate);
                    }
                    DataForTotal.push(TotalRate);
                }
                
            }
        }
        var thChart = {
            labels: labels,
            datasets: [
                {
                    label: 'Y',
                    backgroundColor: 'transparent',
                    borderColor: "blue",
                    pointHoverBackgroundColor: 'blue',
                    pointRadius: 1,
                    pointHitRadius: 1,
                    borderWidth: 1,
                    data: DataForY
                },

                {
                    label: 'B',
                    backgroundColor: 'transparent',
                    borderColor:"#00ba00",
                    pointHoverBackgroundColor: '#00ba00',
                    borderWidth: 1,
                    pointRadius: 1,
                    pointHitRadius: 1,
                    //borderDash: [10],
                    data: DataForB
                },
                {
                    label: 'N',
                    backgroundColor: 'transparent',
                    borderColor: "red",
                    pointHoverBackgroundColor: 'red',
                    borderWidth: 1,
                    pointRadius: 1,
                    pointHitRadius: 1,
                    //borderDash: [10],
                    data: DataForN
                },
                {
                    label: '合计',
                    backgroundColor: 'transparent',
                    borderColor: "black",
                    pointHoverBackgroundColor: 'black',
                    borderWidth: 1,
                    pointRadius: 1,
                    pointHitRadius: 1,
                    //borderDash: [10],
                    data: DataForTotal
                },
            ]
        }

        return (
            <div className="chart-wrapper" style={{ height: 380 + 'px', marginTop: 1 + 'px' }}>
                <Line data={thChart} options={this.mainChartOpts} />
            </div>
        )
    }
}

export default ChartCom;