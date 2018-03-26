import React, { Component } from 'react';
import { Spin, Input, Select, Button, DatePicker, Table, message, Radio, Modal, Checkbox, Layout ,Icon,Progress } from 'antd';
import 'antd/dist/antd.min.css';
import 'whatwg-fetch';
import { QualityHost } from './../config';
import $ from 'jquery';
import ChartCom from './chartCom'

import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

const Format = 'YYYY/MM';
const { MonthPicker } = DatePicker;
class Rate extends Component {
    constructor() {
        super();
        var Time = new Date().getFullYear() + "/" + (parseInt(new Date().getMonth()) + 1).toString();
        this.state = {
            loading: false, Size: true, Material: false, Porcelain: false, chrType: false,
            PorcelainList: [], MaterialValue: "", PorcelainValue: "", Time: Time,
            Data: [], TimeConsuming: 0, HitData: [], TableTitle: "",
            MaterialForY: null, MaterialForB: null, MaterialForN: null, MaterialForTotal: null,
            SizeType: "1", SizeKey: "",RateData:[],ExportExcelTime:Time,ExportSizeProcess:0,ExportMProcess:0,SizeStatus:"active",MStatus:"active",
            SizeDownload:""
        }
    }
    componentWillMount() {
        fetch(QualityHost + "/api/RateTotal?ActionType=GetPorcelain")
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                }
            }).then(json => {
                if (json != null) {
                    this.setState({ PorcelainList: json });
                }
            }).catch(err => { message.error(err) });
    }

    componentDidMount() {

      //  this.OnSearch();
    }

    //含非命中数
    HitColumns = [
        {
            title: "材料/项目", dataIndex: "material", key: "material", width: 80, render: (value) =>
            { return <spec>{value.trim()}</spec> }
        },
        {
            title: "上月半成品数", dataIndex: "monthCheckProd", width: 150, key: "monthCheckProd",
        },
        {
            title: "本月投料数", dataIndex: "feedCount", width: 150, key: "feedCount",
        },
        {
            title: "本月入库数", dataIndex: "putCount", width: 150, key: "putCount",
            render: (value, record, index) => {
                return <div>
                    <div><spec>{value}</spec></div>
                    <div><spec>({record.hitAmount})</spec></div>
                </div>
            }
        },
        {
            title: "本月半成品数", dataIndex: "dTempStoreBalance", width: 150, key: "dTempStoreBalance",
        },
        {
            title: "合格率", dataIndex: "HitRate", key: "HitRate", width: 150,
            //  render: (value, order, index) => {
            //     var rate = this.GetRate(order.putCount, order.monthCheckProd, order.feedCount, order.dTempStoreBalance);
            //     return <spec>{rate}</spec>
            //}
        }
    ]

    //不含非命中数
    Columns = [
        {
            title: "材料/项目", dataIndex: "material", key: "material", width: 80, render: (value) =>
            { return <spec>{value.trim()}</spec> }
        },
        {
            title: "上月半成品数", dataIndex: "monthCheckProd", width: 150, key: "monthCheckProd",
        },
        {
            title: "本月投料数", dataIndex: "feedCount", width: 150, key: "feedCount",
        },
        {
            title: "本月入库数", dataIndex: "stockAmount", width: 150, key: "stockAmount",
        },
        {
            title: "本月半成品数", dataIndex: "dTempStoreBalance", width: 150, key: "dTempStoreBalance",
        },
        {
            title: "合格率", dataIndex: "Rate", key: "Rate", width: 150,
            // render: (value, order, index) => {
            //     var rate = this.GetRate(order.stockAmount, order.monthCheckProd, order.feedCount, order.dTempStoreBalance);
            //     return <spec>{rate}</spec>
            // }
        }
    ]

    //总表
    ZhuanColumns = [
        {
            title: "材料/项目", dataIndex: "material", key: "material", width: 80, render: (value) =>
            { return <spec>{value.trim()}</spec> }
        },
        {
            title: "上月半成品数", dataIndex: "monthCheckProd", width: 150, key: "monthCheckProd",
        },
        {
            title: "本月投料数", dataIndex: "feedCount", width: 150, key: "feedCount",
        },
        {
            title: "本月入库数", dataIndex: "ZhuanAmount", width: 150, key: "ZhuanAmount",
        },
        {
            title: "本月半成品数", dataIndex: "dTempStoreBalance", width: 150, key: "dTempStoreBalance",
        },
        {
            title: "合格率", dataIndex: "ZhuanRate", key: "ZhuanRate", width: 150,
            // render: (value, order, index) => {
            //     var rate = this.GetRate(order.stockAmount, order.monthCheckProd, order.feedCount, order.dTempStoreBalance);
            //     return <spec>{rate}</spec>
            // }
        }
    ]

    GetRate(ReallyCount, LastMonth, PushCount, NowMonth) {
        var QuanityRate = parseFloat(ReallyCount) / ((parseFloat(LastMonth) + parseFloat(PushCount)) - parseFloat(NowMonth));
        var result = (Math.round(parseFloat(QuanityRate) * 10000) / 100).toString();
        if (result.indexOf('.') === -1) {
            result = result + ".00";
        }
        else {
            result = result + "00000";
        }
        result=result.substring(0,result.indexOf('.')+3);
        result = result + "%";
        return result;
    }


    OnSearch() {
        this.setState({RateData:[]})
        var Size = $("#Size").val();
        var chrType = $("#chrType").val();
        var PorcelainValue = this.state.PorcelainValue;
        var Time = this.state.Time;
        if (Time === "") {
            message.warn("请选择时间");
            return;
        }
        var SizeType = this.state.SizeType;
        if (SizeType === "0") {
            $("#SelectHtml").html("尺寸:" + (Size != "" ? ('>' + Size) : "全部") + "<span style=\"margin-left:10px\">瓷粉:"
                + (PorcelainValue != "" ? PorcelainValue : "全部") + "</span><span style=\"margin-left:10px\">型号规格:" + (chrType != "" ? chrType : "全部") + "</span><span style=\"margin-left:10px\">时间：" + Time + "</span>");
        }
        else if (SizeType === "1") {
            $("#SelectHtml").html("尺寸：" + (Size != "" ? ('=' + Size) : "全部") + "<span style=\"margin-left:10px\">瓷粉:"
                + (PorcelainValue != "" ? PorcelainValue : "全部") + "</span><span style=\"margin-left:10px\">型号规格:" + (chrType != "" ? chrType : "全部") + "</span><span style=\"margin-left:10px\">时间：" + Time + "</span>");
        }
        else if (SizeType === "2") {
            $("#SelectHtml").html("尺寸：" + (Size != "" ? ('<' + Size) : "全部") + "<span style=\"margin-left:10px\">瓷粉:"
                + (PorcelainValue != "" ? PorcelainValue : "全部") + "</span><span style=\"margin-left:10px\">型号规格:" + (chrType != "" ? chrType : "全部") + "</span><span style=\"margin-left:10px\">时间：" + Time + "</span>");
        }
        else if (SizeType === "3") {
            $("#SelectHtml").html("尺寸：" + Size != "" ? ('≥' + Size) : "全部" + "<span style=\"margin-left:10px\">瓷粉:"
                + PorcelainValue != "" ? PorcelainValue : "全部" + "</span><span style=\"margin-left:10px\">型号规格:" + (chrType != "" ? chrType : "全部") + "</span><span style=\"margin-left:10px\">时间：" + Time + "</span>");
        }
        else if (SizeType === "4") {
            $("#SelectHtml").html("尺寸：" + (Size != "" ? ('≤' + Size) : "全部") + "<span style=\"margin-left:10px\">瓷粉:"
                + (PorcelainValue != "" ? PorcelainValue : "全部") + "</span><span style=\"margin-left:10px\">型号规格:" + (chrType != "" ? chrType : "全部") + "</span><span style=\"margin-left:10px\">时间：" + Time + "</span>");
        }

        this.setState({ loading: true })
        var QueryString = "Time=" + Time + "&ProductSize=" + Size + "&Porcelain=" + PorcelainValue + "&chrType=" + chrType+"&SizeMark="+SizeType;
        var MaterialList = ["Y", "B", "N"];
        //var MaterialList =["N"];
        var Data = [];
        var MaterialForY = null;
        var MaterialForB = null;
        var MaterialForN = null;
        var MaterialForTotal = null;
        for (var i = 0; i < MaterialList.length; i++) {
            fetch(QualityHost + "/api/RateTotal?" + QueryString + "&ActionType=GetPut" + "&Material=" + MaterialList[i])
                .then(res => {
                    if (res.status === 200) {
                        return res.json();
                    }
                }).then(json => {
                    console.log(json)
                    if (json != null&&json.length>0) {
                        var RateData = this.state.RateData;
                        RateData.push(json);
                        this.setState({ RateData: RateData });
                        var MaxIndex=json.length-1;
                        var chrClass=json[MaxIndex].chrClass;
                        var monthCheckProd = this.FloatRound(json[MaxIndex].lastMonthCheck);
                        var feedCount = this.FloatRound(json[MaxIndex].feedingAmount);
                        var stockAmount = this.FloatRound(json[MaxIndex].realThing);
                        var dTempStoreBalance = this.FloatRound(json[MaxIndex].monthCheck);
                        var putCount = this.FloatRound(json[MaxIndex].realThing+json[MaxIndex].notHitThing);
                        var hitAmount = this.FloatRound(json[MaxIndex].notHitThing);
                        var hitZhuanAmount = this.FloatRound(json[MaxIndex].outInNotHit);
                        var ciPinZhuanAmount = this.FloatRound(json[MaxIndex].outInDefective);
                        var HitRate = this.GetRate(putCount, monthCheckProd, feedCount, dTempStoreBalance);
                        var Rate = this.GetRate(stockAmount, monthCheckProd, feedCount, dTempStoreBalance);
                        var ZhuanAmount = hitZhuanAmount + ciPinZhuanAmount + stockAmount;
                        var ZhuanRate = this.GetRate(ZhuanAmount, monthCheckProd, feedCount, dTempStoreBalance);
                        var item = {
                            material: chrClass, dTempStoreBalance: dTempStoreBalance, feedCount: feedCount,
                            monthCheckProd: monthCheckProd, putCount: putCount,
                            hitAmount: hitAmount, stockAmount: stockAmount, key: MaterialList[i],
                            HitRate: HitRate, Rate: Rate,
                            ciPinZhuanAmount: ciPinZhuanAmount, hitZhuanAmount: hitZhuanAmount,
                            ZhuanRate: ZhuanRate, ZhuanAmount: ZhuanAmount
                        }
                        if (chrClass=== 'Y') {
                            Data[0] = item
                        }
                        else if (chrClass === 'B') {
                            Data[1] = item
                        }
                        else if (chrClass=== 'N') {
                            Data[2] =item
                        }
                        if (Data.length === 3) {
                                var TotalmonthCheckProd = Data[0].monthCheckProd + Data[1].monthCheckProd + Data[2].monthCheckProd;
                                var TotalfeedCount = Data[0].feedCount + Data[1].feedCount + Data[2].feedCount;
                                var TotalstockAmount = Data[0].stockAmount + Data[1].stockAmount + Data[2].stockAmount;
                                var TotaldTempStoreBalance = Data[0].dTempStoreBalance + Data[1].dTempStoreBalance + Data[2].dTempStoreBalance;
                                var TotalputCount = Data[0].putCount + Data[1].putCount + Data[2].putCount;
                                var TotalhitAmount = Data[0].hitAmount + Data[1].hitAmount + Data[2].hitAmount;

                                var TotalCiZhuan = Data[0].ciPinZhuanAmount + Data[1].ciPinZhuanAmount + Data[2].ciPinZhuanAmount;
                                var TotalHitZhuanAmount = Data[0].hitZhuanAmount + Data[1].hitZhuanAmount + Data[2].hitZhuanAmount;

                                var TotalHitRate = this.GetRate(TotalputCount, TotalmonthCheckProd, TotalfeedCount, TotaldTempStoreBalance);
                                var TotalRate = this.GetRate(TotalstockAmount, TotalmonthCheckProd, TotalfeedCount, TotaldTempStoreBalance);


                                var TotalZhuanAmount = TotalHitZhuanAmount + TotalCiZhuan + TotalstockAmount;
                                var TotalZhuanRate = this.GetRate(TotalZhuanAmount, TotalmonthCheckProd, TotalfeedCount, TotaldTempStoreBalance);
                                MaterialForTotal = {
                                    material: "合计", monthCheckProd: TotalmonthCheckProd,
                                    feedCount: TotalfeedCount, stockAmount: TotalstockAmount, dTempStoreBalance: TotaldTempStoreBalance,
                                    putCount: TotalputCount, key: 6, hitAmount: TotalhitAmount, HitRate: TotalHitRate, Rate: TotalRate,
                                    ciPinZhuanAmount: TotalCiZhuan, hitZhuanAmount: TotalHitZhuanAmount, ZhuanAmount: TotalZhuanAmount,
                                    ZhuanRate: TotalZhuanRate
                                };
                                Data.push({
                                    material: "合计", monthCheckProd: TotalmonthCheckProd,
                                    feedCount: TotalfeedCount, stockAmount: TotalstockAmount, dTempStoreBalance: TotaldTempStoreBalance,
                                    putCount: TotalputCount, key: 6, hitAmount: TotalhitAmount, HitRate: TotalHitRate, Rate: TotalRate,
                                    ciPinZhuanAmount: TotalCiZhuan, hitZhuanAmount: TotalHitZhuanAmount, ZhuanAmount: TotalZhuanAmount,
                                    ZhuanRate: TotalZhuanRate
                                });
                                this.setState({ MaterialForTotal: MaterialForTotal });
                                this.setState({ TableTitle: this.state.Time+"   "+Size });
                                this.setState({ loading: false });
                                this.setState({ Data: Data });
                        }
                    }
                    else{
                        alert(json.errMsg);
                        this.setState({ loading: false });
                        return;
                    }
                }).catch(err => { 
                    console.error(err); 
                    this.setState({ loading: false });
                 });
        }
    }

    FloatRound(Num) {
        var strNum = Num.toString();
        var FloatNum = 0;
        if (strNum.length >= 4) {
            var Last4Num = parseFloat(strNum.substring(strNum.length - 4, strNum.length - 3));
            if (Last4Num > 4) {
                FloatNum = parseFloat(strNum.substring(0, strNum.length - 4)) + 1;
            }
            else {
                FloatNum = parseFloat(strNum.substring(0, strNum.length - 4))
            }
        }
        return FloatNum;
    }
    OnPrint(id) {
        var oPop = window.open('', 'oPop');
        var str = '<!DOCTYPE html>'
        str += '<html>'
        str += '<head>'
        str += '<meta charset="utf-8">'
        str += '<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">'
        str += '<style>';
        str += '';
        str += '</style>';
        str += '</head>'
        str += '<body>'
        str += "<div id='oDiv2'>" + $("#" + id).html() + "</div>";
        str += '</body>'
        str += '</html>'
        oPop.document.write(str);
        oPop.print();
        oPop.close();
    }




    render() {
        var PorcelainItem = [];
        var Temp = [];
        for (var i = 0; i < this.state.PorcelainList.length; i++) {
            if (Temp.indexOf(this.state.PorcelainList[i].chrspec) === -1) {
                Temp.push(this.state.PorcelainList[i].chrspec);
                PorcelainItem.push(<Select.Option value={this.state.PorcelainList[i].chrspec} key={i}>{this.state.PorcelainList[i].chrspec}</Select.Option>)
            }
        }
        var HitPrint = [];
        var ZhenpinPrint = [];
        var ZhuanPrint = [];
        var TableBottom = [];
        for (var i = 0; i < this.state.Data.length; i++) {
            HitPrint.push(
                <tr>
                    <td style={{ borderRight: "1px solid black", fontWeight: "600", borderTop: "1px solid black" }}>{this.state.Data[i].material}</td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>{this.state.Data[i].monthCheckProd}</td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>{this.state.Data[i].feedCount}</td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>
                        <div><div style={{ height: "20px" }}>{this.state.Data[i].putCount}</div>
                            <div >({this.state.Data[i].hitAmount})</div>
                        </div>
                    </td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>{this.state.Data[i].dTempStoreBalance}</td>
                    <td style={{ borderTop: "1px solid black" }}>
                        {this.state.Data[i].HitRate}
                        {/* {this.GetRate(this.state.Data[i].putCount, this.state.Data[i].monthCheckProd,
                                this.state.Data[i].feedCount, this.state.Data[i].dTempStoreBalance)} */}
                    </td>
                </tr>
            )
            ZhenpinPrint.push(
                <tr>
                    <td style={{ borderRight: "1px solid black", fontWeight: "600", borderTop: "1px solid black" }}>{this.state.Data[i].material}</td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>{this.state.Data[i].monthCheckProd}</td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>{this.state.Data[i].feedCount}</td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>
                        <div>{this.state.Data[i].stockAmount}</div>
                    </td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>{this.state.Data[i].dTempStoreBalance}</td>
                    <td style={{ borderTop: "1px solid black" }}>
                        {this.state.Data[i].Rate}
                    </td>
                </tr>
            )
            ZhuanPrint.push(
                <tr>
                    <td style={{ borderRight: "1px solid black", fontWeight: "600", borderTop: "1px solid black" }}>{this.state.Data[i].material}</td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>{this.state.Data[i].monthCheckProd}</td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>{this.state.Data[i].feedCount}</td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>
                        <div>{this.state.Data[i].ZhuanAmount}</div>
                    </td>
                    <td style={{ borderRight: "1px solid black", borderTop: "1px solid black" }}>{this.state.Data[i].dTempStoreBalance}</td>
                    <td style={{ borderTop: "1px solid black" }}>
                        {this.state.Data[i].ZhuanRate}
                    </td>
                </tr>
            )
            if (i === 3) {
                TableBottom.push(<div style={{ textAlign: "left", fontSize: "12pt", fontWeight: "600", marginBottom: "30px" }}>
                    合格率/命中率波动原因分析：上表合格率的“本月入库”中包含非命中仓出库转正品发货的
                        {this.state.Data[3].hitZhuanAmount}
                    万粒
                        （{this.state.Data[0].material}料：{this.state.Data[0].hitZhuanAmount}；
                        {this.state.Data[1].material}料：{this.state.Data[1].hitZhuanAmount}；
                        {this.state.Data[2].material}料：{this.state.Data[2].hitZhuanAmount}），
                        次品仓出库转正品发货的{this.state.Data[3].ciPinZhuanAmount}万粒（
                        （{this.state.Data[0].material}料：{this.state.Data[0].ciPinZhuanAmount}；
                        {this.state.Data[1].material}料：{this.state.Data[1].ciPinZhuanAmount}；
                        {this.state.Data[2].material}料：{this.state.Data[2].ciPinZhuanAmount}
                    ），
                        故当月正常流通命中入库的合格率为{this.state.Data[3].Rate}
                    （其中{this.state.Data[0].material}料：{this.state.Data[0].Rate}；
                        {this.state.Data[1].material}料：{this.state.Data[1].Rate}；
                        {this.state.Data[2].material}料：{this.state.Data[2].Rate}）。
                    </div>)
                ZhuanPrint.push(
                    <tr style={{ lineHeight: "30px" }}>
                        <td colSpan="6" style={{ borderTop: "1px solid black" }}>
                            合格率/命中率波动原因分析：上表合格率的“本月入库”中包含非命中仓出库转正品发货的
                                {this.state.Data[3].hitZhuanAmount}
                            万粒
                                （{this.state.Data[0].material}料：{this.state.Data[0].hitZhuanAmount}万粒；
                                {this.state.Data[1].material}料：{this.state.Data[1].hitZhuanAmount}万粒；
                                {this.state.Data[2].material}料：{this.state.Data[2].hitZhuanAmount}万粒），
                                次品仓出库转正品发货的{this.state.Data[3].ciPinZhuanAmount}万粒（
                                （{this.state.Data[0].material}料：{this.state.Data[0].ciPinZhuanAmount}万粒；
                                {this.state.Data[1].material}料：{this.state.Data[1].ciPinZhuanAmount}万粒；
                                {this.state.Data[2].material}料：{this.state.Data[2].ciPinZhuanAmount}万粒
                                ），
                                故当月正常流通命中入库的合格率为{this.state.Data[3].Rate}
                            （其中{this.state.Data[0].material}料：{this.state.Data[0].Rate}；
                                {this.state.Data[1].material}料：{this.state.Data[1].Rate}；
                                {this.state.Data[2].material}料：{this.state.Data[2].Rate}）。
                            </td>
                    </tr>
                )
            }
        }
        return (
            <Spin tip="loading" spinning={this.state.loading} >

                        <div style={{  background: '#fff'}}>
                            <div style={{ clear: "both" }}>
                                
                                <div style={{ color: "#808080", width:"60%",float:"left" }}>
                                    <div style={{float:"left",width:"300px"}}>
                                        <table style={{width:"100%",lineHeight:"30px"}}>
                                            <tr>
                                                <td style={{ width: "70px", fontWeight: "600", fontSize: "11pt", fontFamily: "cursive" }}>
                                                    产片尺寸:
                                                </td>
                                                <td style={{ width: "30px" }}>
                                                    <Select style={{ width: "100%", textAlign: "center" }} defaultValue="1" onSelect={(value) => {
                                                        this.setState({ SizeType: value });
                                                    }} >
                                                        <Select.Option key=">" value="0">＞</Select.Option>
                                                        <Select.Option key="=" value="1">＝</Select.Option>
                                                        <Select.Option key="<" value="2">＜</Select.Option>
                                                        <Select.Option key="≥" value="3">≥</Select.Option>
                                                        <Select.Option key="≤" value="4">≤</Select.Option>
                                                    </Select>
                                                </td>
                                                <td>
                                                    <Input id="Size" style={{ width: "150px" }} placeholder="产品尺寸"></Input>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ width: "70px", fontWeight: "600", fontSize: "11pt", fontFamily: "cursive" }}>
                                                    瓷粉类型:
                                                </td>
                                                <td colSpan="2">
                                                    <Select showSearch style={{ width: "195px", }} placeholder="请选择瓷粉"
                                                        onChange={(value) => { this.setState({ PorcelainValue: value }) }}>
                                                        <Select.Option key="null" value="">&nbsp;</Select.Option>
                                                        {PorcelainItem}
                                                    </Select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ width: "70px", fontWeight: "600", fontSize: "11pt", fontFamily: "cursive" }}>
                                                    型号规格:
                                                </td>
                                                <td colSpan="2">
                                                    <Input id="chrType" style={{ width: "195px" }} placeholder="请输入型号规格"></Input>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ width: "70px", fontWeight: "600", fontSize: "11pt", fontFamily: "cursive" }}>
                                                    统计时间:
                                                </td>
                                                <td colSpan="2">
                                                    <MonthPicker format={Format} placeholder="请选择统计月份" defaultValue={moment(this.state.Time, "YYYY-MM", false)}
                                                        style={{ width: "195px", }}
                                                        onChange={(value, dateString) => {
                                                            this.setState({ Time: dateString })
                                                        }} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{textAlign:"",width:"200px"}} colSpan="3">
                                                    <Button style={{marginLeft: "30px" }} type="primary" icon="search"  onClick={() => { this.OnSearch() }}>查询</Button>
                                                    <Button type="primary" icon="printer" style={{  marginLeft: "10%" }} ghost
                                                        onClick={() => { this.OnPrint("PrintPage") }}>打印</Button>
                                                </td>
                                            </tr>
                                        </table>


                                        
                                        
                                    </div>
                                    <div
                                    style={{float:"left"}}>
                                    <table style={{width:"300px"}}>
                                        <tr>
                                            <td style={{width: "100px", fontWeight: "600", fontSize: "11pt", fontFamily: "cursive",verticalAlign:"top"}}>
                                                导出到Execl:
                                            </td>
                                            <td>
                                            <MonthPicker format={Format} placeholder="请选择统计月份" 
                                            defaultValue={moment(this.state.ExportExcelTime, "YYYY-MM", false)}
                                                        style={{ width: "195px", }}
                                                        onChange={(value, dateString) => {
                                                            this.setState({ ExportExcelTime: dateString })
                                                        }} 
                                                        />
                                                <Button type="primary"  onClick={()=>{
                                                    this.setState({ExportSizeProcess:0});
                                                    this.setState({SizeStatus:"active"})
                                                    $("#SizeProcess").show();
                                                        var i= setInterval(
                                                            () => {
                                                                fetch(QualityHost + "/api/RateTotal?ActionType=GetSizeProcess").then(
                                                                    res => {
                                                                        if (res.status === 200) {
                                                                            return res.json();
                                                                        }
                                                                    }
                                                                ).then(json => {
                                                                    if(json.result)
                                                                    {
                                                                        this.setState({ExportSizeProcess:parseInt(json.errMsg)});
                                                                        if(parseInt(json.errMsg)===100)
                                                                        {
                                                                            clearInterval(i);
                                                                            this.setState({SizeStatus:"success"})
                                                                        }
                                                                    }
                                                                    else
                                                                    {
                                                                        clearInterval(i);
                                                                        this.setState({SizeStatus:"exception"})
                                                                        alert(json.errMsg)
                                                                    }
                                                                }).catch(err=>{
                                                                    alert(err)
                                                                    clearInterval(i);
                                                                    this.setState({SizeStatus:"exception"})
                                                                })
                                                            }, 5000
                                                        )
                                                    this.setState({loading:true});
                                                    fetch(QualityHost+"/api/RateTotal?ActionType=ToExcelBySize&Time="+this.state.ExportExcelTime).then(
                                                        res=>{
                                                            return res.blob()
                                                        }
                                                    ).then(blob=>{
                                                        var url=window.URL.createObjectURL(blob)
                                                        var a = document.createElement('a');
                                                        a.href = url;
                                                        a.download =this.state.ExportExcelTime.replace("/","")+".xlsx";
                                                        a.click();
                                                        window.URL.revokeObjectURL(url);
                                                        this.setState({loading:false});                  
                                                    }).catch(err=>{
                                                        alert(err);
                                                        this.setState({loading:false});
                                                    })
                                                    }} style={{width:"100%",marginTop:"5px"}}><Icon type="file" style={{float:"left"}}/>按尺寸汇总导出</Button>
                                                    <Progress id="SizeProcess" style={{display:"none"}} percent={this.state.ExportSizeProcess} size="small"  status={this.state.SizeStatus}/>
                                                <Button type="primary"  style={{width:"100%",marginTop:"5px"}}
                                                onClick={()=>{
                                                    this.setState({ExportMProcess:0});
                                                    this.setState({MStatus:"active"})
                                                    $("#MProcess").show();
                                                        var t= setInterval(
                                                            () => {
                                                                fetch(QualityHost + "/api/RateTotal?ActionType=GetMProcess").then(
                                                                    res => {
                                                                        if (res.status === 200) {
                                                                            return res.json();
                                                                        }
                                                                    }
                                                                ).then(json => {
                                                                    if(json.result)
                                                                    {
                                                                        this.setState({ExportMProcess:parseInt(json.errMsg)});
                                                                        if(parseInt(json.errMsg)===100)
                                                                        {
                                                                            clearInterval(t);
                                                                            this.setState({MStatus:"success"})
                                                                        }
                                                                    }
                                                                    else
                                                                    {
                                                                        clearInterval(t);
                                                                        this.setState({MStatus:"exception"})
                                                                        alert(json.errMsg)
                                                                    }
                                                                }).catch(err=>{
                                                                    alert(err)
                                                                    clearInterval(t);
                                                                    this.setState({MStatus:"exception"})
                                                                })
                                                            }, 5000
                                                        )

 
                                                    this.setState({loading:true});
                                                    fetch(QualityHost+"/api/RateTotal?ActionType=ExcelMProcess&Time="+this.state.ExportExcelTime).then(
                                                        res=>{
                                                            return res.blob()
                                                        }
                                                    ).then(blob=>{
                                                        var url=window.URL.createObjectURL(blob)
                                                        var a = document.createElement('a');
                                                        a.href = url;
                                                        a.download =this.state.ExportExcelTime.replace("/","")+".xlsx";
                                                        a.click();
                                                        window.URL.revokeObjectURL(url);
                                                        this.setState({loading:false});                  
                                                    }).catch(err=>{
                                                        alert(err);
                                                        this.setState({loading:false});
                                                    })
                                                }}
                                                
                                                ><Icon type="file" style={{float:"left"}}/>按瓷粉类型汇总导出</Button>
                                                <Progress  id="MProcess" style={{display:"none"}} percent={this.state.ExportMProcess} size="small" status={this.state.MStatus} />
                                                <Button type="primary"  style={{width:"100%",marginTop:"5px",display:"none"}}><Icon type="file" style={{float:"left"}}/>按盘点月份汇总导出</Button>
                                                <Progress percent={30} size="small"  style={{display:"none"}} status="exception"/>
                                                <iframe src={this.state.SizeDownload} style={{display:"none"}} id="hrong" name="hrong"/>
                                            </td>
                                        </tr>
                                    </table>
                                    </div>
                                </div>
                                <div style={{ fontWeight: "600", fontSize: "11pt", fontFamily: "cursive",float:"left",width:"35%" }}>
                                    <p>计算公式:</p>
                                    <p style={{color:""}}>合格率%=本月入库数（含非命中数）/（上月半成品数+本月投料数-本月半成品数）</p>
                                    <p>命中率%=本月入库正品数/（上月半成品数+本月投料数-本月半成品数）</p>
                                    <p>本月投料=丝印+新工艺的投料</p>
                                </div>
                                {/* <div id="SelectHtml" style={{ fontSize: "12pt", fontWeight: "600",float:"left" }}></div> */}
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{clear: "both"}}>
                                    <div style={{ float: "right", width: "50%" ,marginLeft: "5%"}}>
                                        <p style={{ textAlign: "center", fontSize: "15pt", fontWeight: "600", margin: "10px", marginTop: "30px" }}>{this.state.TableTitle}正常流通(含非命中入库)盘点合格率</p>
                                        <p style={{ textAlign: "right", fontSize: "12pt" }}>单位：万粒</p>
                                        <Table size="middle" bordered dataSource={this.state.Data} columns={this.HitColumns}
                                            //scroll={{ y: 600 }}
                                            pagination={false}></Table>
                                        <p>备注：上表“本月入库数”中括号内的数为本月的非命中入库数</p>
                                    </div>
                                    <div style={{ float: "left", width: "45%",  }}>
                                        <ChartCom DataSource={this.state.RateData} ChartType="1" />
                                    </div>
                                </div>
                                <div style={{clear: "both"}}>
                                    <div style={{ float: "left", width: "50%" }}>
                                        <p style={{ textAlign: "center", fontSize: "15pt", fontWeight: "600", margin: "10px", marginTop: "50px" }}>{this.state.TableTitle}正常流通(命中入库)盘点合格率</p>
                                        <p style={{ textAlign: "right", fontSize: "12pt" }}>单位：万粒</p>
                                        <Table size="middle" bordered dataSource={this.state.Data} columns={this.Columns}
                                            //scroll={{ y: 600 }}
                                            pagination={false}></Table>
                                    </div>
                                    <div style={{ float: "left", width: "45%", marginLeft: "5%" }}>
                                        <ChartCom DataSource={this.state.RateData}  ChartType="2"/>
                                    </div>
                                </div>
                                <div style={{clear: "both",height:"500px"}}>
                                    <div style={{ float: "right", width: "50%",marginLeft: "5%" }}>
                                        <p style={{ textAlign: "center", fontSize: "15pt", fontWeight: "600", margin: "10px", marginTop: "50px" }}>{this.state.TableTitle}冠华公司产品情况统计表</p>
                                        <p style={{ textAlign: "right", fontSize: "12pt" }}>单位：万粒</p>
                                        <Table size="middle" bordered dataSource={this.state.Data} columns={this.ZhuanColumns}
                                            //scroll={{ y: 600 }}
                                            pagination={false}></Table>
                                        {TableBottom}
                                    </div>
                                    <div style={{ float: "left", width: "45%",  }}>
                                        <ChartCom  DataSource={this.state.RateData} ChartType="3" />
                                    </div>
                                </div>
                            </div>
                        </div>


                {/* 打印部分 */}
                <div id="PrintPage" style={{ display: "none" }}>
                    <div style={{ verticalAlign: "middle", pageBreakBefore: "always", marginTop: "9%" }}>
                        <p style={{ textAlign: "center", fontSize: "15pt", fontWeight: "600", margin: "10px", marginTop: "30px" }}>{this.state.TableTitle}正常流通(含非命中入库)盘点合格率</p>
                        <p style={{ textAlign: "right", fontSize: "11pt" }}>单位：万粒</p>
                        <table style={{ border: "1px solid black", textAlign: "center", lineHeight: "60px" }} cellPadding="0" cellSpacing="0" width="100%">
                            <tbody>
                                <tr style={{ lineHeight: "30px" }}>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>材料/项目</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>上月半成品</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>本月投料数</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>本月入库数</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>本月半成品</td>
                                    <td style={{ fontWeight: "600" }}>合格率</td>
                                </tr>
                                {HitPrint}
                            </tbody>
                        </table>
                        <p>备注：上表“本月入库数”中括号内的数为本月的非命中入库数</p>
                        <div style={{ marginTop: "35px" }}>
                            <table style={{ width: "100%" }}>
                                <tbody>
                                    <tr>
                                        <td>总经理：</td>
                                        <td></td>
                                        <td>经理助理：</td>
                                        <td></td>
                                        <td>生产副经理：</td>
                                        <td></td>
                                        <td>品管部：</td>
                                        <td></td>
                                        <td>制表：</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div style={{ verticalAlign: "middle", pageBreakBefore: "always", marginTop: "10%" }}>
                        <p style={{ textAlign: "center", fontSize: "15pt", fontWeight: "600", margin: "10px", marginTop: "30px" }}>{this.state.TableTitle}正常流通(命中入库)盘点合格率</p>
                        <p style={{ textAlign: "right", fontSize: "11pt" }}>单位：万粒</p>
                        <table style={{ border: "1px solid black", textAlign: "center", lineHeight: "60px" }} cellPadding="0" cellSpacing="0" width="100%">
                            <tbody>
                                <tr style={{ lineHeight: "30px" }}>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>材料/项目</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>上月半成品</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>本月投料数</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>本月入库数</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>本月半成品</td>
                                    <td style={{ fontWeight: "600" }}>合格率</td>
                                </tr>
                                {ZhenpinPrint}
                            </tbody>
                        </table>
                        <div style={{ marginTop: "35px" }}>
                            <table style={{ width: "100%" }}>
                                <tbody>
                                    <tr>
                                        <td>总经理：</td>
                                        <td></td>
                                        <td>经理助理：</td>
                                        <td></td>
                                        <td>生产副经理：</td>
                                        <td></td>
                                        <td>品管部：</td>
                                        <td></td>
                                        <td>制表：</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div style={{ verticalAlign: "middle", pageBreakBefore: "always", marginTop: "10%" }}>
                        <p style={{ textAlign: "center", fontSize: "15pt", fontWeight: "600", margin: "10px", marginTop: "30px" }}>{this.state.TableTitle}冠华公司产品情况统计表</p>
                        <p style={{ textAlign: "right", fontSize: "11pt" }}>单位：万粒</p>
                        <table style={{ border: "1px solid black", textAlign: "center", lineHeight: "60px" }} cellPadding="0" cellSpacing="0" width="100%">
                            <tbody>
                                <tr style={{ lineHeight: "30px" }}>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>材料/项目</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>上月半成品</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>本月投料数</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>本月入库数</td>
                                    <td style={{ borderRight: "1px solid black", fontWeight: "600" }}>本月半成品</td>
                                    <td style={{ fontWeight: "600" }}>合格率</td>
                                </tr>
                                {ZhuanPrint}
                            </tbody>
                        </table>
                        <div style={{ marginTop: "35px" }}>
                            <table style={{ width: "100%" }}>
                                <tbody>
                                    <tr>
                                        <td>总经理：</td>
                                        <td></td>
                                        <td>经理助理：</td>
                                        <td></td>
                                        <td>生产副经理：</td>
                                        <td></td>
                                        <td>品管部：</td>
                                        <td></td>
                                        <td>制表：</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Spin>
        )
    }
}
export default Rate;