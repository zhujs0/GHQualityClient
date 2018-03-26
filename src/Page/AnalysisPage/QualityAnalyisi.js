import React, { Component } from 'react';
import { Spin,  DatePicker,Select,message,Button} from 'antd';
import 'antd/dist/antd.min.css';
import 'whatwg-fetch';
import { QualityHost } from './../config';
import $ from 'jquery';
import { Pie ,Bar,defaults, Line} from 'react-chartjs-2';


import moment from 'moment';
import Form from 'antd/lib/form/Form';
const { MonthPicker, RangePicker } = DatePicker;

const dateFormat = 'YYYY/MM/DD';
const monthFormat = 'YYYY/MM';
class QualityAnalyisi extends Component
{
    constructor()
    {
        super();
        //var Time= new Date().getFullYear() + "-" + (parseInt(new Date().getMonth()) + 1).toString()+"-"+new Date().getDate().toString();

        this.state={
            WorkProcedure:[],loading:false,Select_Procedure:"烧炉车间",
            StartTime:new Date(new Date().setDate(new Date().getDate()-7)).toLocaleDateString(),EndTime:new Date().toLocaleDateString(),
            dataSource:[],AllTopClass:[],BarData:{},PieData:{}
        }
    }

    componentWillMount()
    {
        this.Fun_GetWorkProcedure();
        this.Fun_Get("",this.state.Select_Procedure,this.state.StartTime, this.state.EndTime,"","");
    }
      //获取工序列表
      Fun_GetWorkProcedure() {
        fetch(QualityHost + "/api/Room"
        ).then(res => {
            if (res.status == 200) {
                return res.json();
            }
        }).then(json => {
            if(json!=null)
            {
                var WorkProcedure=[];
                for(var i=0;i<json.length;i++)
                {
                    WorkProcedure.push(
                        <Select.Option key={i} value={json[i].roomName} >{json[i].roomName}</Select.Option>
                    )
                }
                this.setState(Object.assign({}, this.state, { ...this.state, WorkProcedure: WorkProcedure }));
            }
            
        }).catch(err => {
            message.error("连接服务器错误");
            console.error(err);
        })
    }


    Fun_GetAllFeedBackTime(data)
    {
        var TimeList=[];
        var temp=[];
        data.forEach(element => {
            var feedbackTime=new Date(element.feedbackTime).format('yyyy-MM-dd');
            if(temp.indexOf(feedbackTime)===-1)
            {
                temp.push(feedbackTime);
                TimeList.push(feedbackTime);
            }
        });
        return TimeList;
    }
    Fun_GetAllTopClass(data)
    {
        var topClassArray=[];
        var temp=[];
        data.forEach(element => {
            var topClass=element.topClass;
            if(temp.indexOf(topClass)===-1)
            {
                temp.push(topClass);
                topClassArray.push(topClass);
            }
        });
        return topClassArray;
    }


    Fun_GetAccount(data,topClass,feedbackTime)
    {
        var account=0;
        for(var i=0;i<data.length;i++)
        {
            if(new Date(data[i].feedbackTime).format("yyyy-MM-dd")===feedbackTime)
            {
                if(data[i].topClass===topClass)
                {
                    account+=1;
                }
            }
        }
        return account;
    }

    Fun_Get(BatchNo,Select_Procedure,StartTime,EndTime,EquipmentNo,Model)
    {
        this.setState({ loading: true });
        let promise = new Promise((resolve, reject) => {
            fetch(QualityHost + "/api/QualityAnalyisi?BatchNo=" + BatchNo + "&WorkProcedure=" + Select_Procedure + "&StartTime=" + StartTime + "&EndTime=" + EndTime
                + "&EquipmentNo=" + EquipmentNo + "&Model=" + Model + "&Status=2&ActionType=GetQualityRate2Code&OrderType=0"
            ).then(res => {
                if (res.status === 200) {
                    return res.json();
                }
            }).then(json => {
                resolve(json);
            }).catch(err => {
                reject("数据异常!");
            })
        });
        promise.then(
            (data)=>{
                var result=[];
                if(data!=null)
                {
                    const TimeList=this.Fun_GetAllFeedBackTime(data);
                    const AllTopClass=this.Fun_GetAllTopClass(data);
                    this.setState({AllTopClass:AllTopClass});
                    for(var i=0;i<TimeList.length;i++)
                    {
                        var child=[];
                        for(var j=0;j<AllTopClass.length;j++)
                        {
                            var account=this.Fun_GetAccount(data,AllTopClass[j],TimeList[i]);
                            child.push({topClass:AllTopClass[j],account:account});
                        }
                        result.push({ feedbackTime: TimeList[i], data: child });
                    }
                    this.Fun_Set(result, AllTopClass);
                    this.setState({ dataSource: result, loading: false });
                }
            },
            (errMsg)=>{message.error(errMsg)}
        ).catch(err=>{
            this.setState({loading:false});
            message.error(err);
        })
     
    }

    Fun_RandomColor()
    {
        return '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6); 
    }

    

    Fun_Set(dataSource, AllTopClass) {
        var PieDatas = [];
        var BarDatasets = [];
        var colorList = [];
        var labels = [];
        var BarLabels = [];
        for (var i = 0; i < AllTopClass.length; i++) {
            labels.push(AllTopClass[i]);
            var color = this.Fun_RandomColor();
            colorList.push(color);
            var account = 0;
            var accountList = [];
            for (var j = 0; j < dataSource.length; j++) {
                if (BarLabels.indexOf(dataSource[j].feedbackTime) === -1) {
                    BarLabels.push(dataSource[j].feedbackTime);
                }
                for (var n = 0; n < dataSource[j].data.length; n++) {
                    if (AllTopClass[i] === dataSource[j].data[n].topClass) {
                        account += dataSource[j].data[n].account;
                        accountList.push(dataSource[j].data[n].account);
                    }
                }
            }
            BarDatasets.push(
                { label: AllTopClass[i], backgroundColor: color, data: accountList }
            )
            PieDatas.push(account);
        }

        var PieData = {
            datasets: [
                {
                    backgroundColor: colorList,
                    data: PieDatas
                }
            ],

            labels: labels
        }

        var BarData = {
            labels: BarLabels,
            datasets: BarDatasets
        }

        this.setState({ PieData: PieData, BarData: BarData });
    }


    render() {
        return (
            <Spin spinning={this.state.loading}>
                <div className="chart-wrapper" style={{margin:"5px"}}>
                    <div>
                        <table style={{lineHeight:"35px"}}>
                            <tbody>
                                <tr>
                                <td style={{ fontSize: "10pt" }}>
                                        请选择工序：
                                    </td>
                                    <td>
                                        <Select value={this.state.Select_Procedure}  style={{width:"150px"}}
                                        onSelect={(value)=>{
                                            this.setState({Select_Procedure:value});
                                        }}
                                        >

                                           {this.state.WorkProcedure}
                                        </Select>
                                    </td>
                                    <td style={{ fontSize: "10pt",paddingLeft:"10px" }}>
                                        请选择时间段：
                                    </td>
                                    <td>
                                        <RangePicker
                                            style={{ float: "left", width: "250px" }}
                                            //defaultValue={[moment(new Date(), dateFormat), moment(new Date(), dateFormat)]}
                                            value={[moment(this.state.StartTime, dateFormat), moment(this.state.EndTime, dateFormat)]}
                                            format={dateFormat}
                                            onChange={(prop,value)=>{
                                                this.setState({StartTime:value[0],EndTime:value[1]});
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <Button style={{ paddingLeft:"10px" }}
                                          onClick={()=>{
                                              this.Fun_Get("",this.state.Select_Procedure,this.state.StartTime,this.state.EndTime,"","")
                                          }}
                                        >查询</Button>
                                    </td>

                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <div style={{ width: "50%", float: "left",textAlign:"center" }}><Pie data={this.state.PieData} /></div>
                        <div style={{ width: "50%", float: "left"}}><Bar data={this.state.BarData} options={
                            {

                                scales: {

                                    xAxes: [{
                                        //stacked: false,

                                    }
                                    ],
                                    yAxes: [{
                                        //stacked: true,
                                        ticks: {
                                            beginAtZero: true
                                        }
                                    }],
                                    
                                }
                            }
                        } /></div>
                    </div>
                    <div>
                    </div>
                </div>
            </Spin>
           
        )
    }
}

export default QualityAnalyisi;