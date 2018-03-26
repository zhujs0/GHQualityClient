import React, { Component } from 'react';
import 'whatwg-fetch';
class QualityPrint extends Component {

    constructor() {
        super();
    }

    modules = {
        toolbar: [
  
        ],
    }
    formats = [

    ]


    render() {
        var data = this.props.data;
        var ProblemItem = [];
        var ReasonItem=[];
        var ApprovalItem=[];
        var CustomerItem=[];
        var ControlItem=[];
        var control=this.props.control;
        var OrderStatus=data.status;
        if (OrderStatus === "2") {
            document.getElementById("AffixDiv").style.display="block";
            document.getElementById("AffixDivText").innerText="已审批";
        }
        else if(OrderStatus === "3") {
            document.getElementById("AffixDiv").style.display="block";
            document.getElementById("AffixDivText").innerText="已退单";
        }
        if(data.report!=null)
            {
                document.getElementById("ReportHtml").innerHTML=data.report;
            }
        if (data.reasonData != null && data.reasonData.length != 0) {
            for (var i = 0; i < data.reasonData.length; i++) {
                ReasonItem.push(
                    <tr style={{ height: "30px" }}>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "20%" }}>{data.reasonData[i].reasonType}</td>
                        <td style={{ borderTop: "1px solid black", width: "80%" }}>{data.reasonData[i].reasonDetails}</td>
                    </tr>
                )
            }

        }
        if (data.problemData != null && data.problemData.length != 0) {
            for (var i = 0; i < data.problemData.length; i++) {
                ProblemItem.push(
                    <tr style={{ height: "30px" }}>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black",  }}>{data.problemData[i].topClass}</td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black",}}>{data.problemData[i].roomName}</td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black",  }}>{data.problemData[i].typeName}</td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black",  }}>{data.problemData[i].problem}</td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", }}>{data.problemData[i].present}</td>
                        <td style={{ borderTop: "1px solid black",  }}>{data.problemData[i].problemDetails}</td>
                        
                    </tr>
                )
            }
        }
        if (data.approvalStream != null && data.approvalStream.length != 0) {
            for (var i = 0; i < data.approvalStream.length; i++) {
                ApprovalItem.push(
                    <tr style={{ height: "25px" }}>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}>{data.approvalStream[i].manPosition}</td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}>{data.approvalStream[i].man}</td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}>{(data.approvalStream[i].approvalDate).replace("T", " ").substring(0, data.approvalStream[i].approvalDate.lastIndexOf('.'))}</td>
                        <td style={{ borderTop: "1px solid black", width: "45%" }}>{data.approvalStream[i].handlingSuggestion + ";" + data.approvalStream[i].toClass}</td>
                    </tr>
                )
            }
        }
        else {
            ApprovalItem.push(
                (<tr style={{ height: "25px" }}>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}></td>
                    <td style={{ borderTop: "1px solid black", width: "45%" }}></td>
                </tr>),
                (<tr style={{ height: "25px" }}>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}></td>
                    <td style={{ borderTop: "1px solid black", width: "45%" }}></td>
                </tr>),
                (<tr style={{ height: "25px" }}>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}></td>
                    <td style={{ borderTop: "1px solid black", width: "45%" }}></td>
                </tr>),
                (<tr style={{ height: "25px" }}>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}></td>
                    <td style={{ borderTop: "1px solid black", width: "45%" }}></td>
                </tr>),
                (<tr style={{ height: "25px" }}>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}></td>
                    <td style={{ borderTop: "1px solid black", width: "45%" }}></td>
                </tr>)
            )
        }
        if (data.cardList != null) {
            for (var i = 0; i < data.cardList.length; i++) {
                CustomerItem.push(
                    <tr style={{ height: "25px" }}>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "20%" }}>{data.cardList[i].orderNo}</td>
                        <td style={{ borderTop: "1px solid black", width: "30%", borderRight: "1px solid black", }}>{data.cardList[i].customer}</td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}>{data.cardList[i].productClass}</td>
                        <td style={{ borderTop: "1px solid black", width: "20%", borderRight: "1px solid black", }}>{data.cardList[i].productModel}</td>
                        <td style={{ borderTop: "1px solid black", width: "15%" }}>{data.cardList[i].tempAmount}</td>
                    </tr>
                )
            }
        }
        if (control === 1) {
            var controlData=data.controlStream;
            if (controlData != null) {
                for (var i = 0; i < controlData.length; i++) {
                    ControlItem.push(
                    <tr style={{ height: "30px" }}>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}>{data.controlStream[i].manPosition}</td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}>{data.controlStream[i].man}</td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}>{((data.controlStream[i].approvalDate).replace("T", " ")).substring(0, (data.controlStream[i].approvalDate).lastIndexOf('.'))}</td>
                        <td style={{ borderTop: "1px solid black", width: "45%" }}>{data.controlStream[i].handlingSuggestion + ";" + data.controlStream[i].toClass}</td>
                    </tr>)
                }
            }
            if (ControlItem.length === 0) {
                ControlItem.push(
                    (<tr style={{ height: "25px" }}>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}></td>
                        <td style={{ borderTop: "1px solid black", width: "45%" }}></td>
                    </tr>),
                    (<tr style={{ height: "25px" }}>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}></td>
                        <td style={{ borderTop: "1px solid black", width: "45%" }}></td>
                    </tr>),
                    (<tr style={{ height: "25px" }}>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}></td>
                        <td style={{ borderTop: "1px solid black", width: "45%" }}></td>
                    </tr>),
                    (<tr style={{ height: "25px" }}>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}></td>
                        <td style={{ borderTop: "1px solid black", width: "45%" }}></td>
                    </tr>),
                    (<tr style={{ height: "25px" }}>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                        <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%" }}></td>
                        <td style={{ borderTop: "1px solid black", width: "45%" }}></td>
                    </tr>)
                )
            }
        }
        return (
            <div style={{fontSize:"10pt"}}>
                <div style={{ fontWeight: "400", fontSize: "10pt" }}>编号：GH-ZD4023A<label style={{ marginLeft: "30px" }}>版本号：10</label></div>
                <div style={{ textAlign: "center", fontWeight: "bold", marginTop: "20px", fontSize: "13pt" }}>质量信息反馈单</div>
                <div style={{ marginTop: "20px" }}>
                    <p>反馈单号：{data.orderNo}</p>
                    <table style={{ border: "1px solid black", textAlign: "center", lineHeight: "25px" }} cellPadding="0" cellSpacing="0" width="100%">
                        <tbody>
                            <tr>
                                <td colSpan="2" style={{ borderRight: "1px solid black", width: "20%", fontWeight: "600" }}>反馈工序</td>
                                <td colSpan="2" style={{ borderRight: "1px solid black", width: "35%" }}>{data.workProcedure}</td>
                                <td style={{ borderRight: "1px solid black", width: "20%", fontWeight: "600" }}>反馈人</td>
                                <td style={{ width: "25%" }}>{data.feedbackMan}</td>
                            </tr>
                            <tr>
                                <td colSpan="2" style={{ borderTop: "1px solid black", borderRight: "1px solid black", fontWeight: "600" }}>型号规格</td>
                                <td colSpan="2" style={{ borderTop: "1px solid black", borderRight: "1px solid black" }}>{data.model}</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", fontWeight: "600" }}>批号</td>
                                <td style={{ borderTop: "1px solid black" }}>{data.batchNo}</td>
                            </tr>
                            <tr>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", fontWeight: "600" }}>产品类别</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black",width:"30px"}}>{data.productClass}</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", fontWeight: "600" }}>数量</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black" }}>{data.qty}</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", fontWeight: "600" }}>反馈时间</td>
                                <td style={{ borderTop: "1px solid black" }}>{data.feedbackTime}</td>
                            </tr>
                            <tr>
                                <td colSpan="2" style={{ borderTop: "1px solid black", borderRight: "1px solid black", fontWeight: "600" }}>机台号设备名称</td>
                                <td  colSpan="2" style={{ borderTop: "1px solid black", borderRight: "1px solid black" }}>{data.equipmentName}</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", fontWeight: "600" }}>机台号</td>
                                <td style={{ borderTop: "1px solid black" }}>{data.equipmentNo}</td>
                            </tr>

                        </tbody>
                    </table>

                    <table style={{ borderRight: "1px solid black",borderLeft:"1px solid black",borderBottom:"1px solid black", 
                    textAlign: "center", lineHeight: "25px", borderTop: "none" }} cellPadding="0" cellSpacing="0" width="100%">
                        <tbody>
                             <tr style={{ height: "25px" }}>
                                <td style={{  borderRight: "1px solid black", width: "20%" }}>订单号</td>
                                <td style={{  width: "30%",borderRight: "1px solid black", }}>客户名称</td>
                                <td style={{  borderRight: "1px solid black", width: "15%" }}>客户类别/备货类别</td>
                                <td style={{  width: "20%",borderRight: "1px solid black", }}>订单型号规格</td>
                                <td style={{  width: "15%" }}>数量</td>
                            </tr>
                            {CustomerItem}
                             <tr style={{ height: "25px" }}>
                                 <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "20%" }}></td>
                                 <td style={{ borderTop: "1px solid black", width: "30%", borderRight: "1px solid black", }}></td>
                                 <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%" }}></td>
                                 <td style={{ borderTop: "1px solid black", width: "20%", borderRight: "1px solid black", }}></td>
                                 <td style={{ borderTop: "1px solid black", width: "15%" }}></td>
                             </tr>
                        </tbody>
                    </table>

                    <table width="100%" style={{ height: "25px", borderRight: "1px solid black", borderLeft: "1px solid black", textAlign: "center", paddingTop: "0px", paddingRight: "0px" }} cellPadding="0" cellSpacing="0">
                        <tbody><tr><td style={{ backgroundColor: "#949393",fontWeight:"600" }}>质量问题</td></tr></tbody>
                    </table>
                    <table style={{ border: "1px solid black", textAlign: "center", lineHeight: "25px", borderTop: "none" }} cellPadding="0" cellSpacing="0" width="100%">
                        <tbody>
                            <tr style={{ lineHeight: "25px" }}>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%", fontWeight: "600" }}>质量大类</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "10%", fontWeight: "600" }}>工序</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%", fontWeight: "600" }}>质量分类</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%", fontWeight: "600" }}>质量问题</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "10%", fontWeight: "600" }}>质量比例</td>
                                <td style={{ borderTop: "1px solid black", width: "25%", fontWeight: "600" }}>详细描述</td>
                            </tr>
                           {ProblemItem}
                            <tr style={{ height: "25px" }}>
                            <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%", fontWeight: "600" }}></td>
                            <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "10%", fontWeight: "600" }}></td>
                            <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%", fontWeight: "600" }}></td>
                            <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%", fontWeight: "600" }}></td>
                            <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "10%", fontWeight: "600" }}></td>
                            <td style={{ borderTop: "1px solid black", width: "25%", fontWeight: "600" }}></td>
                            </tr> 
                        </tbody>
                    </table>
                    <table width="100%" style={{ height: "25px", borderRight: "1px solid black", borderLeft: "1px solid black",
                     textAlign: "center", paddingTop: "0px", paddingRight: "0px",borderTop:"1px solid black" }} cellPadding="0" cellSpacing="0">
                        <tbody><tr><td style={{ backgroundColor: "#949393" ,fontWeight:"600"}}>原因分析</td></tr></tbody>
                    </table>
                    <table style={{ border: "1px solid black", textAlign: "center", lineHeight: "25px", borderTop: "none" }} cellPadding="0" cellSpacing="0" width="100%">
                        <tbody>
                             <tr style={{ height: "25px" }}>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "20%" }}>原因类型</td>
                                <td style={{ borderTop: "1px solid black", width: "80%" }}>具体原因</td>
                            </tr>
                           {ReasonItem}
                            <tr style={{ height: "25px" }}>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "20%" }}></td>
                                <td style={{ borderTop: "1px solid black", width: "80%" }}></td>
                            </tr>
                        </tbody>
                    </table>
                    <table width="100%" style={{height: "25px", borderRight: "1px solid black", borderLeft: "1px solid black",
                     textAlign: "center", paddingTop: "0px", paddingRight: "0px" ,display:control!=1?"none":""}} cellPadding="0" cellSpacing="0">
                        <tbody><tr><td style={{ backgroundColor: "#949393",fontWeight:"600" }}>预防纠正措施</td></tr></tbody>
                    </table>
                    <table style={{ border: "1px solid black", textAlign: "center", lineHeight: "25px", borderTop: "none" ,display:control!=1?"none":""}} cellPadding="0" cellSpacing="0" width="100%">
                        <tbody>
                            <tr style={{ lineHeight: "25px" }}>
                                <td style={{ borderTop: "1px solid black",  width: "100%",  }}>{data.measure}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table width="100%" style={{ height: "25px", borderRight: "1px solid black", borderLeft: "1px solid black", 
                    display:control!=1?"":"none",textAlign: "center", paddingTop: "0px", paddingRight: "0px" }} cellPadding="0" cellSpacing="0">
                        <tbody><tr><td style={{ backgroundColor: "#949393" ,fontWeight:"600"}}>质量反馈单处理意见</td></tr></tbody>
                    </table>
                    <table style={{ border: "1px solid black", textAlign: "center", lineHeight: "30px",
                    display:control!=1?"":"none", borderTop: "none" }} cellPadding="0" cellSpacing="0" width="100%">
                        <tbody>
                            <tr style={{ lineHeight: "25px" }}>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%", fontWeight: "600" }}>职务</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%", fontWeight: "600" }}>处理人</td>
                                <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%", fontWeight: "600" }}>时间</td>
                                <td style={{ borderTop: "1px solid black", width: "45%", fontWeight: "600" }}>处理意见</td>
                            </tr>
                            {ApprovalItem}
                        </tbody>
                    </table>
                    <div style={{display:control!=1?"none":""}}>
                        <table width="100%" style={{ height: "25px", borderRight: "1px solid black", borderLeft: "1px solid black", textAlign: "center", paddingTop: "0px", paddingRight: "0px" }} cellPadding="0" cellSpacing="0">
                            <tbody><tr><td style={{ backgroundColor: "#949393",fontWeight:"600" }}>控制表处理意见</td></tr></tbody>
                        </table>
                        <table style={{ border: "1px solid black", textAlign: "center", lineHeight: "25px", borderTop: "none" }} cellPadding="0" cellSpacing="0" width="100%">
                            <tbody>
                                <tr style={{ lineHeight: "25px" }}>
                                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%", fontWeight: "600" }}>职务</td>
                                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "15%", fontWeight: "600" }}>处理人</td>
                                    <td style={{ borderTop: "1px solid black", borderRight: "1px solid black", width: "25%", fontWeight: "600" }}>时间</td>
                                    <td style={{ borderTop: "1px solid black", width: "45%", fontWeight: "600" }}>处理意见</td>
                                </tr>
                                {ControlItem}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="AffixDiv" style={{
                    display: "none", right: "50px", position: "absolute", top: "100px", transform: "rotate(-30deg)",
                    border: "5px solid rgba(11, 234, 90, 0.6)", borderRadius: "80px", height: "80px", width: "80px", textAlign: "center"
                }}>
                    <span id="AffixDivText" style={{ lineHeight: "80px", width: "80px", textAlign: "center", color: "rgba(82, 206, 87, 0.6)", fontSize: "15pt" }}>已审批</span>
                </div>

                <div style={{display:control!=1?"none":"",pageBreakBefore: "always",textAlign:"center"}}>
                    <h1>质量控制表质量报告</h1>
                    <div style={{textAlign:"left"}}>
                        <div style={{textAlign:"center",fontWeight:"600"}}>
                            <span>单号：{data.orderNo}</span>
                            <span style={{marginLeft:"30px"}}>反馈人：{data.feedbackMan}</span>
                            <span style={{marginLeft:"30px"}}>反馈时间：{data.feedbackTime}</span>
                        </div>
                        <div id="ReportHtml">
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default QualityPrint;