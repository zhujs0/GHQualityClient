import React, { Component } from 'react';
import {
    Spin, Input, Select, Button, DatePicker, Radio, Table, message,
    Pagination, Popconfirm, Icon, Cascader, Modal, Layout, Breadcrumb, Affix, Upload,Alert
} from 'antd';
import 'antd/dist/antd.min.css';
import 'whatwg-fetch';
import { QualityHost } from '../config';
import $ from 'jquery';
import QualityPrint from './QualityPrint'
//import ReactQuill from 'react-quill'
//import 'react-quill/dist/quill.snow.css'
//import { connect } from 'react-redux'
//import { SetValue, SetMessageList, SetControlNo } from '../Actions'
//import { Store } from '../Reducers';


class QualityFeedBackDetails extends Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            ControlBaseInfo: [],
            CardList: [], CustomerData: [], CardType: "",
            ProblemList: [{
                codeString: "", topClass: "", roomName: "", typeName: "", problem: "", present: "", qualityClass: "",
                problemDetails: "", problemID: 0, orderNo: "", problemLevel: "", suggestion: ""
            }],
            ReasonList: [{ reasonID: 0, reasonType: "人", reasonDetails: "", orderNo: "" }],
            ProductList: [], Modal_Visible: false,
            ReportValue: "", CodeInputList: [], CodeColumns: "",
            CodeList: [],
            PrintData: [],
            Unenable: false, OrderStatus: 0, AffixVisible: "none", AffixText: "", AffixColor: "", AffixFontSize: "",
            previewVisible: false, previewImage: '', fileList: [],IsQC:false,QualityTypeList:[],QCToQualityClass:"",QCSuggestion:"",
            QCModal_Visible:false
        }
    }



    //步骤：获取action中的ControlNo，根据ControlNo查找数据
    GetControlInfo() {
        var ControlNo = "";
        if (this.props.NewControl != null && this.props.NewControl != undefined && this.props.NewControl === "True") {
            var ControlBaseInfo = this.state.ControlBaseInfo;
            fetch(QualityHost + "/api/Feedback", {
                method: "PUT",
                mode: "cors",
                headers: { 'Content-Type': 'application/json' }
            }).then(res => {
                if (res.status == 200) {
                    return res.json();
                }
            }).then(json => {
                if (json.result) {
                    ControlBaseInfo.orderNo = "FK" + json.errMsg;
                    ControlBaseInfo.feedbackMan = sessionStorage.getItem("userName");
                    this.setState({ ControlBaseInfo: ControlBaseInfo })
                }
                else {
                    message.error(json.errMsg + ",请刷新");
                }
            })
            return;
        }
        if (this.props.ControlNo != "" && this.props.ControlNo != null && (typeof (this.props.ControlNo)).toLowerCase() != "object") {
            ControlNo = this.props.ControlNo.trim();
        }
        // else if (sessionStorage.getItem("ControlNo") != "" && sessionStorage.getItem("ControlNo") != undefined && sessionStorage.getItem("ControlNo") != null) {
        //     ControlNo = sessionStorage.getItem("ControlNo");
        // }
        if (ControlNo === "") {
            alert("获取数据失败，请刷新");
            return;
        }
        this.setState({ loading: true });
        //②调用Api获取控制表数据
        fetch(QualityHost + "/api/Order?OrderNo=" + ControlNo + "&PageIndex=1&PageSize=1&ActionType=GetOrderInfo&OrderType=0"
        ).then(res => {
            if (res.status === 200) {
                return res.json();
            }
        }).then(json => {
            if (json != null && json.length > 0) {
                this.setState({ ControlBaseInfo: json[0], loading: false });
                if (json[0].problemData != null && json[0].problemData.length > 0) {
                    this.setState({ ProblemList: json[0].problemData });
                }
                if (json[0].reasonData != null && json[0].reasonData.length > 0) {
                    this.setState({ ReasonList: json[0].reasonData });
                }
                if (json[0].report != null) {
                    this.setState({ ReportValue: json[0].report })
                }
                if (json[0].imageList != null && json[0].imageList != "") {
                    console.log(JSON.parse(json[0].imageList))
                    this.setState({ fileList: JSON.parse(json[0].imageList) })

                }
                if (json[0].cardList != null) {
                    var temp=[{name:"1",status:"done",url:"",uid:"1"}]
                    //this.setState({ CustomerData: json[0].cardList })
                }
                if (json[0].status === "2") {
                    this.setState({ Unenable: true, OrderStatus: 2 });
                    this.setState({ AffixVisible: "" });
                    if (json[0].isControl != null && json[0].isControl === "1") {
                        this.setState({ AffixText: "已生成控制表", AffixFontSize: "9pt", AffixColor: "#00ba00" });
                    }
                    else {
                        this.setState({ AffixText: "已审批", AffixFontSize: "12pt", AffixColor: "#00ba00" });
                    }

                }
                else if (json[0].status === "3") {
                    this.setState({ Unenable: false, OrderStatus: 0 });
                    this.setState({ AffixVisible: "" });
                    this.setState({ AffixText: "已退单", AffixFontSize: "12pt", AffixColor: "red" });
                }
                else {

                    if (json[0].stepID === sessionStorage.getItem("WaitStepID")) {
                        this.setState({ AffixVisible: "" });
                        //this.setState({ Unenable:false,OrderStatus:0});
                        this.setState({ AffixText: "待处理", AffixFontSize: "12pt", AffixColor: "blue" });
                        //  document.getElementById("btnPrint").style.display="none";
                        //  document.getElementById("btnSave").style.display="";
                    }
                    else if (json[0].stepID === sessionStorage.getItem("ConfirmStepID")) {
                        if (json[0].prevStatus === 2) {
                            this.setState({ AffixVisible: "" });
                            if (json[0].isControl != null && json[0].isControl === "1") {
                                this.setState({ Unenable: true, OrderStatus: 3 });
                                this.setState({ AffixText: "已生成控制表,待确认", AffixFontSize: "9pt", AffixColor: "blue" });
                            }
                            else {
                                this.setState({ Unenable: true, OrderStatus: 1 });
                                this.setState({ AffixText: "待确认", AffixFontSize: "13pt", AffixColor: "blue" });
                            }
                        }
                        else if (json[0].prevStatus === 3) {
                            this.setState({ Unenable: true, OrderStatus: 1 });
                            this.setState({ AffixVisible: "" });
                            this.setState({ AffixText: "退单待确认", AffixFontSize: "9pt", AffixColor: "red" });
                        }
                    }
                    else {
                        if (json[0].prevStatus === 3) {
                            this.setState({ Unenable: true, OrderStatus: 1 });
                            this.setState({ AffixVisible: "" });
                            this.setState({ AffixText: "退单待确认", AffixFontSize: "9pt", AffixColor: "red" });
                        }
                        else {
                            this.setState({ AffixVisible: "" });
                            this.setState({ Unenable: true, OrderStatus: 0 });
                            this.setState({ AffixText: "待" + json[0].stepName + "审批", AffixFontSize: "9pt", AffixColor: "blue" });
                        }

                    }
                }

            }
            else {
                alert("获取数据失败，请刷新");
                this.setState({ loading: false });
            }
        }).catch(err => {
            message.error(err);
            this.setState({ loading: false });
        })
    }

    componentDidMount() {
        this.GetProduct();
        this.GetCode();
        this.GetControlInfo();
        if(sessionStorage.getItem("deptID").trim()==="QC")
        {
            this.setState({IsQC:true});
            this.Fun_GetQualityTypeList();
        }
    }

    //获取工序列表
    GetProduct() {
        fetch(QualityHost + "/api/Room"
        ).then(res => {
            if (res.status == 200) {
                return res.json();
            }
        }).then(json => {
            this.setState(Object.assign({}, this.state, { ...this.state, ProductList: json }));
            this.setState({ loading: false });
        }).catch(err => {
            message.error(err);
        })
    }


    //质量问题列表
    ProblemColumns = [
        {
            title: "质量编码", dataIndex: "codeString", key: "codeString",width:250, render: (value, record, index) => {
                var CodeInputList = this.state.CodeInputList;
                var CodeListItem = [];
                if (CodeInputList != null) {
                    for (var i = 0; i < CodeInputList.length; i++) {
                        CodeListItem.push(
                            <Select.Option key={i} value={CodeInputList[i].codeString}>{CodeInputList[i].codeString}</Select.Option>
                        )
                    }
                }
                return <div>
                    <Select disabled={this.state.Unenable}  showSearch style={{ width: "200px" }} value={record.codeString}
                        onSearch={(value) => {
                            //value=value.toUpperCase();
                            fetch(QualityHost + "/api/QualityCode?ActionType=SelectCode&CodeString=" + value.toUpperCase()).then(
                                res => {
                                    if (res.status === 200) {
                                        return res.json();
                                    }
                                }
                            ).then(json => { this.setState({ CodeInputList: json }) })
                        }}
                        onChange={(value) => {
                            value=value.toUpperCase();
                            this.GetCodeInfoByCode(value, index);
                            this.onCellChange(index, 'codeString', value)
                        }}
                    >
                        {CodeListItem}
                    </Select>
                    {/* <Input placeholder="请输入" style={{ width: "50%" }} value={record.codeString} onChange={(e) => {
                        var text = e.target.value;
                        this.GetCodeInfoByCode(text, index);
                        this.onCellChange(index, 'codeString', text)
                    }} /> */}
                    <Button icon="search" disabled={this.state.Unenable} onClick={() => {
                        this.setState({ Modal_Visible: true });
                        this.setState({ CodeColumns: index });
                    }}></Button>
                </div>
            }
        },
        { title: "质量大类", dataIndex: "topClass", key: "topClass" },
        { title: "质量工序", dataIndex: "roomName", key: "roomName" },
        { title: "质量分类", dataIndex: "typeName", key: "typeName" },
        { title: "质量问题", dataIndex: "problem", key: "problem" },
        { title: "质量比例", dataIndex: "present", key: "present" },
        { title: "质量判类", dataIndex: "qualityClass", key: "qualityClass" },
        {
            title: "详细问题", dataIndex: "problemDetails", key: "problemDetails", render: (value, record, index) => {
                return <div><Input readOnly={this.state.Unenable} placeholder="请输入" type="textarea" value={record.problemDetails}
                    onChange={(e) => {
                        var text = e.target.value;
                        this.onCellChange(index, 'problemDetails', text)
                    }}
                /></div>
            }
        },
        {
            title: "操作", dataIndex: "codeString", key: "Opt", render: (value, record, index) => {
                return (
                    <div>
                        <a href="javascript:void(0)" disabled={this.state.Unenable} onClick={() => {
                            var ProblemList = this.state.ProblemList;
                            ProblemList.splice(index, 1);
                            if (ProblemList.length == 0) {
                                var temp = [];
                                temp.push({
                                    codeString: "", topClass: "", roomName: "", typeName: "",
                                    problem: "", present: "", qualityClass: "", problemDetails: "", problemID: 0, orderNo: "",
                                    problemLevel: "", suggestion: ""
                                })
                                ProblemList = temp;
                            }
                            this.setState({ ProblemList: ProblemList });
                        }}>删除</a>
                        <a href="javascript:void(0)" disabled={this.state.Unenable} style={{ marginLeft: "10px" }}
                            onClick={() => {
                                var temp = this.state.ProblemList;
                                temp.push({
                                    codeString: "", topClass: "", roomName: "", typeName: "",
                                    problem: "", present: "", qualityClass: "", problemDetails: "", suggestion: ""
                                });
                                this.setState({ ProblemList: temp })
                            }}
                        >添加</a>
                    </div>
                )
            }
        },
    ]

    //原因分析列表
    ReasonColumns = [
        {
            title: "原因类型", dataIndex: "reasonType", key: "reasonType", render: (value, record, index) => {
                return (<div>
                    <Select disabled={this.state.Unenable} style={{ width: "100%" }} value={value} onChange={(value) => {
                        this.onCellChangeOfReason(index, "reasonType", value)
                    }}>
                        <Select.Option key="1" value="人">人</Select.Option>
                        <Select.Option key="2" value="机">机</Select.Option>
                        <Select.Option key="3" value="料">料</Select.Option>
                        <Select.Option key="4" value="法">法</Select.Option>
                        <Select.Option key="5" value="环">环</Select.Option>
                    </Select>
                </div>)
            }
        },
        {
            title: "详细描述", dataIndex: "reasonDetails", key: "reasonDetails", render: (value, record, index) => {
                return (<div>
                    <Input readOnly={this.state.Unenable} type="textarea" value={value} placeholder="请输入" onChange={(e) => {
                        this.onCellChangeOfReason(index, "reasonDetails", e.target.value)
                    }} />
                </div>)
            }
        },
        {
            title: "操作", dataIndex: "orderNo", key: "orderNo", render: (value, record, index) => {
                return (<div>
                    <a href="javascript:void(0)" disabled={this.state.Unenable} onClick={(e) => {
                        var ReasonList = this.state.ReasonList;
                        ReasonList.splice(index, 1);
                        if (ReasonList.length == 0) {
                            var temp = [];
                            temp.push({ reasonID: 0, reasonType: "人", reasonDetails: "", orderNo: "" })
                            ReasonList = temp;
                        }
                        this.setState({ ReasonList: ReasonList });
                    }}>删除</a>
                    <a href="javascript:void(0)" disabled={this.state.Unenable} style={{ marginLeft: "10px" }}
                        onClick={() => {
                            var temp = this.state.ReasonList;
                            temp.push({ reasonID: 0, reasonType: "人", reasonDetails: "", orderNo: "" });
                            this.setState({ ReasonList: temp })
                        }}
                    >添加</a>
                </div>)
            }
        }
    ]

    //处理意见列表
    StreamColumns = [
        { title: "职务", dataIndex: "manPosition", key: "manPosition" },
        { title: "姓名", dataIndex: "man", key: "man" },
        {
            title: "时间", dataIndex: "approvalDate", key: "approvalDate", render: (value, record, index) => {
                return <spec>{value.replace("T", " ").substring(0, value.lastIndexOf('.'))}</spec>
            }
        },
        { title: "处理意见", dataIndex: "handlingSuggestion", key: "handlingSuggestion" },
        { title: "判类", dataIndex: "toClass", key: "toClass" },
    ]

    //客户列表
    CustomerColumns = [
        { title: "卡号", dataIndex: "cardNo", key: "cardNo" },
        { title: "订单号", dataIndex: "orderNo", key: "orderNo" },
        { title: "客户名称", dataIndex: "customer", key: "customer" },
        { title: "客户类别/备货类别 ", dataIndex: "tempClass", key: "tempClass" },
        { title: "订单/备货型号规格", dataIndex: "tempmodel", key: "tempmodel" },
        { title: "产品型号规格", dataIndex: "productModel", key: "productModel" },
        { title: "产品类别", dataIndex: "productClass", key: "productClass" },
        { title: "数量", dataIndex: "amount", key: "amount" },
        { title: "备货数量", dataIndex: "tempAmount", key: "tempAmount" },
        { title: "产品批号", dataIndex: "batchNo", key: "batchNo" },
        {
            title: "操作", dataIndex: "opt", key: "opt", render: (value, record, index) => {
                return <a href="javascript:void(0)" disabled={this.state.Unenable} onClick={() => {
                    var CustomerData = this.state.CustomerData;
                    CustomerData.splice(index, 1);
                    var CardList = this.state.CardList;
                    CardList.splice(index, 1);
                    this.setState({ CustomerData: CustomerData, CardList: CardList });
                    var intChipAmount = 0;
                    for (var i = 0; i < CustomerData.length; i++) {
                        intChipAmount += CustomerData[i].tempAmount;
                    }
                    var ControlBaseInfo = this.state.ControlBaseInfo;
                    ControlBaseInfo.qty = intChipAmount;
                    this.setState({ ControlBaseInfo: ControlBaseInfo });
                }}>删除</a>
            }
        },
    ]


    //获取所有编码
    GetCode() {
        if (this.state.CodeList.length != 0) {
            return;
        }
        var All_Code = [];
        var CodeItem = [];
        var TopClassList = [];
        fetch(QualityHost + "/api/Code?RoomName=&TypeName=&Problem=").then(res => {
            if (res.ok) {
                return res.json();
            }
        }).then(json => {
            All_Code = json;
            var TopTemp = [];
            for (var i = 0; i < All_Code.length; i++) {
                if (TopTemp.indexOf(All_Code[i].topClass) === -1) {
                    TopTemp.push(All_Code[i].topClass);
                    TopClassList.push(All_Code[i]);
                }
            }
            for (var i = 0; i < TopClassList.length; i++) {
                var topClass = TopClassList[i].topClass;
                var ProductItem = [];
                var ProductTemp = [];
                for (var j = 0; j < All_Code.length; j++) {
                    var ProductName = All_Code[j].roomName;
                    var TypeClassItem = [];
                    var TypeClassTemp = [];
                    for (var n = 0; n < All_Code.length; n++) {
                        var TypeName = All_Code[n].typeName;
                        var ProblemItem = [];
                        var ProblemTemp = [];
                        for (var m = 0; m < All_Code.length; m++) {
                            var Problem = All_Code[m].problem;
                            var PresentItem = [];
                            var PresentTemp = [];
                            for (var k = 0; k < All_Code.length; k++) {
                                if (All_Code[k].problem === Problem && PresentTemp.indexOf(All_Code[k].present) === -1) {
                                    if (All_Code[k].present == null || All_Code[k].present.trim() === "") {
                                        PresentTemp.push(All_Code[k].present);
                                        PresentItem.push({ value: All_Code[k].codeString, label: "无" });
                                    }
                                    else {
                                        PresentTemp.push(All_Code[k].present);
                                        PresentItem.push({ value: All_Code[k].codeString, label: All_Code[k].present });
                                    }

                                }
                            }
                            if (TypeName === All_Code[m].typeName && ProblemTemp.indexOf(All_Code[m].problem) === -1) {
                                ProblemTemp.push(All_Code[m].problem);
                                ProblemItem.push({ value: "Pro_" + All_Code[m].problem, label: All_Code[m].problem, children: PresentItem });
                            }
                        }
                        if (ProductName === All_Code[n].roomName && TypeClassTemp.indexOf(All_Code[n].typeName) === -1) {
                            TypeClassTemp.push(All_Code[n].typeName);
                            TypeClassItem.push({ value: "Type_" + All_Code[n].typeName, label: All_Code[n].typeName, children: ProblemItem })
                        }
                    }
                    if (topClass === All_Code[j].topClass && ProductTemp.indexOf(All_Code[j].roomName) === -1) {
                        ProductTemp.push(All_Code[j].roomName);
                        ProductItem.push({ value: "Room_" + All_Code[j].roomName, label: All_Code[j].roomName, children: TypeClassItem })
                    }
                }
                CodeItem.push({ value: "Top_" + TopClassList[i].topClass, label: TopClassList[i].topClass, children: ProductItem })
            }
            this.setState({ CodeList: CodeItem })

        })
    }

    //根据编码获取编码详情
    GetCodeInfoByCode(Code, index) {
        fetch(QualityHost + "/api/Code2Problem?CodeString=" + Code).then(
            res => {
                if (res.status === 200) {
                    return res.json();
                }
            }
        ).then(json => {
            var temp = this.state.ProblemList;
            console.log(json)
            if (json != null && json != "undefined") {
                temp[index]["topClass"] = json.topClass;
                temp[index]["roomName"] = json.roomName;
                temp[index]["typeName"] = json.typeName;
                temp[index]["problem"] = json.problem;
                temp[index]["present"] = json.present != "" ? json.present : "无";
                temp[index]["qualityClass"] = json.qualityClass != "" ? json.qualityClass : "无";
                temp[index]["problemLevel"] = json.problemLevel;
                temp[index]["suggestion"] = json.suggestion;
            }
            else {
                temp[index]["topClass"] = "";
                temp[index]["roomName"] = "";
                temp[index]["typeName"] = "";
                temp[index]["problem"] = "";
                temp[index]["present"] = "";
                temp[index]["qualityClass"] = "";
                temp[index]["problemLevel"] = "";
                temp[index]["suggestion"] = "";
            }
            this.setState({ ProblemList: temp })
        }).catch(err => { message.warn(err) });
    }
    //质量问题单元格
    onCellChange(index, key, value) {
        const ProblemList = this.state.ProblemList;
        ProblemList[index][key] = value;
        this.setState({ ProblemList: ProblemList });
    }

    //原因分析单元格
    onCellChangeOfReason(index, key, value) {
        const ReasonList = this.state.ReasonList;
        ReasonList[index][key] = value;
        this.setState({ ReasonList: ReasonList });
    }

    //保存数据
    SaveData(OneKeyComplete) {
        var OrderNo = this.state.ControlBaseInfo.orderNo;
        var FeedbackMan = this.state.ControlBaseInfo.feedbackMan;
        var WorkProcedure = this.state.ControlBaseInfo.workProcedure;
        var chrBatchID = this.state.ControlBaseInfo.batchNo;
        var chrType = this.state.ControlBaseInfo.model;
        var intChipAmount = this.state.ControlBaseInfo.qty;
        var NewEquipmentNo = this.state.ControlBaseInfo.equipmentNo;
        var NewEquipment = this.state.ControlBaseInfo.equipmentName;
        var FeedBackTime = this.state.ControlBaseInfo.feedbackTime;
        var ProductClass = this.state.ControlBaseInfo.productClass;
        var Measure = this.state.ControlBaseInfo.measure;
        var ProblemList = this.state.ProblemList;
        var ReasonList = this.state.ReasonList;
        var CardList = this.state.CustomerData;
        var ImageList=[];
        var ImageHtml="";
        for (var i = 0; i < this.state.fileList.length; i++) {
            if (this.state.fileList[i].status === "done") {
                var url=this.state.fileList[i].response||this.state.fileList[i].url;
                ImageList.push({
                    uid: i,
                    name: this.state.fileList[i].name,
                    status: 'done',
                    url: url
                });
                ImageHtml+="<a href=\""+url+"\" target=\"_blank\">"+this.state.fileList[i].name+"</a>";
            }
        }
        var ProblemLevel = "1";
        if (ProblemList.length != 0) {
            if (ProblemList[0].codeString === "") {
                alert("质量代码不能为空");
                return;
            }
            for (var i = 0; i < ProblemList.length; i++) {
                if (ProblemLevel === "") {
                    ProblemLevel = (ProblemList[i].problemLevel).replace("T", "");
                }
                else {
                    var intNowLevel = parseInt(ProblemLevel.replace("T", ""));
                    var intNextLevel = parseInt((ProblemList[i].problemLevel.replace("T", "")));
                    if (intNextLevel > intNowLevel) {
                        ProblemLevel = intNextLevel;
                    }
                }
            }
        }
        else {
            alert("质量问题不能为空");
            return;
        }

        if(OneKeyComplete===1&&this.state.QCSuggestion.trim()==="")
        {
            alert("QC处理意见不能为空！");
            return;
        }
        this.setState({ loading: true });
        var PostData=JSON.stringify({
                    OrderNo: OrderNo, WorkProcedure: WorkProcedure, BatchNo: chrBatchID,
                    Model: chrType, Qty: intChipAmount, EquipmentName: NewEquipment, EquipmentNo: NewEquipmentNo,
                    FeedbackMan: FeedbackMan, ReasonData: ReasonList, ProblemData: ProblemList,
                    FeedbackTime: FeedBackTime, Status: "0", ProblemLevel: ProblemLevel,
                    CardList: CardList, ProductClass: ProductClass,ImageList:JSON.stringify(ImageList),
                    EmployeeID: sessionStorage.getItem("userId").toString(),ImageHtml:ImageHtml,
                    ChildEquipment:this.state.ControlBaseInfo.childEquipment,ChildEquipmentNo:this.state.ControlBaseInfo.childEquipmentNo,
                    OneKeyComplete:OneKeyComplete,
                    ToClass:this.state.QCToQualityClass,QCSuggestion:this.state.QCSuggestion
                });
        fetch(QualityHost + "/api/Order",
            {
                method: "POST",
                mode: "cors",
                headers: { 'Content-Type': 'application/json' },
                body: PostData
            }).then(res => {
                if (res.status === 200) {
                    return res.json();
                }
            }).then(json => {
                if (json.result) {
                    message.success("提交成功"); 
                    if (this.props.NewControl === "True") {
                        this.setState({
                            ControlBaseInfo: [],
                            CardList: [], CustomerData: [], CardType: "",
                            ProblemList: [{
                                codeString: "", topClass: "", roomName: "", typeName: "", problem: "", present: "", qualityClass: "",
                                problemDetails: "", problemID: 0, orderNo: "", problemLevel: "", suggestion: ""
                            }],
                            ReasonList: [{ reasonID: 0, reasonType: "人", reasonDetails: "", orderNo: "" }],
                            fileList:[],QCSuggestion:"",QCToQualityClass:""
                        })
                    }
                    this.GetControlInfo();
                    this.setState({ loading: false ,QCModal_Visible:false});
                }
                else {
                    this.setState({ loading: false });
                    message.error(json.errMsg);
                }
            }).catch(err => {
                this.setState({ loading: false });
                message.error(err);
                alert(err)
            });
    }


    //打印
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


    //流通备货卡、发货卡、售前备货卡
    CardValueChange(value) {
        if (value.trim() === "") {
            return;
        }
        if (this.state.CardList.indexOf(value) != -1) {
            alert("重复卡号");
            return;
        }
        var QueryString = "";
        if (this.state.CardType === "") {
            QueryString = "ActionType=First&CardNo=" + value;
        }
        else {
            if (value.substring(0, 2) === this.state.CardType) {
                if (this.state.CustomerData.length > 0) {
                    var productModel = this.state.CustomerData[0].productModel;
                    var productClass = this.state.CustomerData[0].productClass;
                    var batchNo = this.state.CustomerData[0].batchNo;
                    var customer = this.state.CustomerData[0].customer;
                    QueryString = "ActionType=Second&CardNo=" + value + "&ProductClass=" + productClass
                        + "&ProductModel=" + productModel + "&BatchNo=" + batchNo + "&Customer=" + customer;
                }
                else {
                    QueryString = "ActionType=First&CardNo=" + value;
                }
            }
            else {
                if (this.state.CustomerData.length > 0) {
                    alert("类型不一致");
                    return;
                }
                else {
                    QueryString = "ActionType=First&CardNo=" + value;
                }

            }
        }
        this.setState({ loading: true });
        fetch(QualityHost + "/api/ProductCard?" + QueryString)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                }
            })
            .then(json => {
                if (json.cardNo != null) {
                    this.setState({ CardType: value.substring(0, 2) });
                    var CardList = this.state.CardList;
                    CardList.push(value);
                    this.setState({ CardList: CardList })
                    var data = this.state.CustomerData;
                    if (data.length === 0) {
                        var ControlBaseInfo = this.state.ControlBaseInfo;
                        ControlBaseInfo.batchNo = json.batchNo;
                        ControlBaseInfo.model = json.productModel;
                        ControlBaseInfo.productClass = json.productClass;
                    }
                    data.push(json);
                    this.setState({ CustomerData: data });
                }
                else {
                    alert("发货卡信息不一致");
                }
                var intChipAmount = 0;
                for (var i = 0; i < this.state.CustomerData.length; i++) {
                    intChipAmount += this.state.CustomerData[i].tempAmount;
                }
                var ControlBaseInfo = this.state.ControlBaseInfo;
                ControlBaseInfo.qty = intChipAmount;
                this.setState({ ControlBaseInfo: ControlBaseInfo, loading: false });
            }).catch(err => { this.setState({ loading: false }); alert(err) });

        $("#Card").val("");
    }


    OnConfirm() {
        var OrderNo = this.state.orderNo;
        var ID = this.state.ControlBaseInfo.id;
        var PrevStatus = this.state.ControlBaseInfo.prevStatus;
        var StepID = this.state.ControlBaseInfo.stepID;
        fetch(QualityHost + "/api/WorkFlowTask",
            {
                method: "POST",
                mode: "cors",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ID: ID, Status: PrevStatus, StepID: StepID,ActionType:"confrim"
                })
            }).then(
            res => {
                if (res.status === 200) {
                    return res.json();
                }
            }
            ).then(result => {
                if (result) {
                    //window.location.reload();  
                    alert("确认成功!!!");
                    // this.props.dispatch(SetMessageList("1"));
                    this.GetControlInfo();
                }
                else {
                    alert("确认失败!!!");
                }

            })
    }

    handleChange = ({ fileList }) => this.setState({ fileList })

    Fun_GetQualityTypeList()
    {
        fetch(QualityHost + "/api/ToClass").then(res => {
            if (res.status == 200) {
                return res.json();
            }
        }).then(json => {
            var QualityTypeList = [];
            QualityTypeList.push(<Select.Option key="null" value="">&nbsp;</Select.Option>)
            if(json!=null)
            {
                for (var i = 0; i < json.length; i++) {
                    QualityTypeList.push(<Select.Option key={i} value={json[i].name}>{json[i].name}</Select.Option>)
                }
            }
            this.setState({ QualityTypeList: QualityTypeList });
        }).catch(err => { console.error(err) });
    }


    Fun_OneKeyCompletion()
    {
    }


    render() {
        var ProductItem = [];
        for (var i = 0; i < this.state.ProductList.length; i++) {
            ProductItem.push(<Select.Option value={this.state.ProductList[i].roomName}>{this.state.ProductList[i].roomName}</Select.Option>)
        }
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">图片上传</div>
            </div>

        );
        // var qualityClass="";
        // var ProblemList=this.state.ProblemList;
        // for(var i=0;i<ProblemList.length;i++)
        // {

        // }
        return (
            <div>
                {/* 固钉 */}
                <Affix style={{ zIndex: "1000", position: "absolute", left: "80%", top: "10%", display: this.state.AffixVisible }}>
                    <div style={{ height: "80px", width: "80px", borderRadius: "80px", border: "2px solid", borderColor: this.state.AffixColor, textAlign: "center", transform: "rotate(-30deg)" }}>
                        <span id="AffixText" style={{ color: this.state.AffixColor, fontSize: this.state.AffixFontSize, display: "inline", width: "80px", lineHeight: "80px", fontWeight: "600" }}>{this.state.AffixText}</span>
                    </div>
                </Affix>

                {/* 质量代码选择窗 */}
                <Modal
                    style={{ textAlign: "center" }}
                    title="编码选择"
                    visible={this.state.Modal_Visible}
                    onOk={(e) => {

                    }}
                    footer={null}
                    onCancel={(e) => { this.setState({ Modal_Visible: false }) }}>
                    <Cascader size="large" style={{ width: "300px" }} showSearch options={this.state.CodeList} onChange={(value) => {
                        if (value.length != null && value.length === 5) {
                            this.refs.CodeTxt.innerHTML = value[4];
                            this.onCellChange(this.state.CodeColumns, 'codeString', value[4]);
                            this.GetCodeInfoByCode(value[4], this.state.CodeColumns);
                            this.setState({ Modal_Visible: false });
                        }
                        else {
                            this.refs.CodeTxt.innerHTML = "";
                        }
                    }}></Cascader><label style={{ marginLeft: "20px" }}>编码：</label><label style={{ fontWeight: "600" }} ref="CodeTxt" />
                </Modal>

                {/*内容部分*/}
                <Spin tip="loading" spinning={this.state.loading}>
                            <div style={{fontSize:"10pt"}}>
                                <div>
                                    <div style={{ backgroundColor: "white", width: "100%", minHeight: "300px", float: "left", border: "1px solid #808080", borderRadius: "5px", padding: "10px" }}>
                                        <div>
                                            <p style={{ fontSize: "13pt", fontWeight: "800", marginBottom: "5px" }}>基本信息</p>
                                            <table cellPadding="0" cellSpacing="0" style={{ width: "100%", lineHeight: "35px", textAlign: "right", border: "1px solid #808080", borderRadius: "5px" }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ borderRight: "1px solid #808080" }}>
                                                            <span>单号：</span>
                                                        </td>
                                                        <td style={{ borderRight: "1px solid #808080" }}>
                                                            <Input readOnly="true" type='text' value={this.state.ControlBaseInfo.orderNo}
                                                            id="NewOrderNo" />
                                                        </td>
                                                        <td style={{ borderRight: "1px solid #808080" }}>
                                                            <span>批号：</span>
                                                        </td>
                                                        <td style={{ borderRight: "1px solid #808080" }}>
                                                            <Input id="chrBatchID" readOnly={this.state.Unenable} value={this.state.ControlBaseInfo.batchNo}
                                                                onPressEnter={(e) => {
                                                                    $("#ProductClass").focus();
                                                                    fetch(QualityHost + "/api/Feedback?WorkProcedure=" + this.state.ControlBaseInfo.workProcedure + "&chrBatchID=" + e.target.value).then(res => {
                                                                        if (res.status == 200) {
                                                                            return res.json();
                                                                        }
                                                                    }).then(json => {
                                                                        var chrType = "";
                                                                        var intChipAmount=0;
                                                                        if (json.length > 0) {
                                                                            chrType = json[0].chrType;
                                                                            intChipAmount=json[0].intChipAmount;
                                                                        }
                                                                        var ControlBaseInfo = this.state.ControlBaseInfo;
                                                                        ControlBaseInfo.model = chrType;
                                                                        ControlBaseInfo.qty = intChipAmount;
                                                                        this.setState({ ControlBaseInfo: ControlBaseInfo });

                                                                    })
                                                                }}

                                                                onChange={(e) => {
                                                                    var batchNo = e.target.value;
                                                                    if (batchNo.trim().length == 53) {
                                                                        batchNo = batchNo.substring(3, 20);
                                                                        $("#ProductClass").focus();
                                                                    }
                                                                    var ControlBaseInfo = this.state.ControlBaseInfo;
                                                                    ControlBaseInfo.batchNo = batchNo;
                                                                    this.setState({ ControlBaseInfo: ControlBaseInfo });
                                                                    if(batchNo.length==12)
                                                                    {
                                                                        fetch(QualityHost + "/api/Feedback?WorkProcedure=" + this.state.ControlBaseInfo.workProcedure + "&chrBatchID=" + e.target.value).then(res => {
                                                                        if (res.status == 200) {
                                                                            return res.json();
                                                                        }
                                                                    }).then(json => {
                                                                        var chrType = "";
                                                                        var intChipAmount=0;
                                                                        if (json.length > 0) {
                                                                            chrType = json[0].chrType;
                                                                            intChipAmount=json[0].intChipAmount;
                                                                        }
                                                                        var ControlBaseInfo = this.state.ControlBaseInfo;
                                                                        ControlBaseInfo.model = chrType;
                                                                        ControlBaseInfo.qty = intChipAmount;
                                                                        this.setState({ ControlBaseInfo: ControlBaseInfo });

                                                                    })
                                                                    }
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ borderRight: "1px solid #808080" }}>
                                                            <span>型号规格：</span>
                                                        </td>
                                                        <td style={{ borderRight: "1px solid #808080" }}>
                                                            <Input readOnly="true" id="chrType" value={this.state.ControlBaseInfo.model} />
                                                        </td>
                                                        <td style={{ borderRight: "1px solid #808080" }}>
                                                            <span>数量：</span>
                                                        </td>
                                                        <td>
                                                            <Input id="intChipAmount" readOnly={this.state.Unenable} value={this.state.ControlBaseInfo.qty}
                                                                onChange={(e) => {
                                                                    var ControlBaseInfo = this.state.ControlBaseInfo;
                                                                    ControlBaseInfo.qty = e.target.value;
                                                                    this.setState({ ControlBaseInfo: ControlBaseInfo });
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <span>产品类别：</span>
                                                        </td>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <Input id="ProductClass" readOnly={this.state.Unenable} value={this.state.ControlBaseInfo.productClass}
                                                                onChange={(e) => {
                                                                    var ControlBaseInfo = this.state.ControlBaseInfo;
                                                                    ControlBaseInfo.productClass = e.target.value;
                                                                    this.setState({ ControlBaseInfo: ControlBaseInfo });
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <span>工序：</span>
                                                        </td>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <Select style={{ width: "100%" }} disabled={this.state.Unenable} showSearch value={this.state.ControlBaseInfo.workProcedure}
                                                                onSelect={(value)=>{

                                                                    fetch(QualityHost + "/api/Order?ActionType=GetAmount&WorkProcedure=" + value + "&BatchNo=" + this.state.ControlBaseInfo.batchNo).then(res => {
                                                                        if (res.status == 200) {
                                                                            return res.json();
                                                                        }
                                                                    }).then(json => {
                                                                        var intChipAmount = "";
                                                                        if (json!=null) {
                                                                            intChipAmount = json.decSumQty;
                                                                        }
                                                                        var ControlBaseInfo = this.state.ControlBaseInfo;
                                                                        ControlBaseInfo.qty = intChipAmount;
                                                                        this.setState({ ControlBaseInfo: ControlBaseInfo });
                                                                    })
                                                                    var ControlBaseInfo = this.state.ControlBaseInfo;
                                                                    ControlBaseInfo.workProcedure = value;
                                                                    this.setState({ ControlBaseInfo: ControlBaseInfo });
                                                                }} >
                                                                {ProductItem}
                                                            </Select>
                                                        </td>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <span>设备号：</span>
                                                        </td>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                           <div>
                                                            <Input style={{width:"100px",float:"left"}} id="NewEquipmentNo" readOnly={this.state.Unenable} value={this.state.ControlBaseInfo.equipmentNo}
                                                                onChange={(e) => {
                                                                    var ControlBaseInfo = this.state.ControlBaseInfo;
                                                                    ControlBaseInfo.equipmentNo = e.target.value;
                                                                    this.setState({ ControlBaseInfo: ControlBaseInfo });
                                                                }}
                                                                onBlur={(e) => {
                                                                    fetch(QualityHost + "/api/Machine?chrMachineID=" + e.target.value).then(res => {
                                                                        if (res.status == 200) {
                                                                            return res.json();
                                                                        }
                                                                    }).then(json => {
                                                                        var equipmentName = "";
                                                                        if (json != null) {
                                                                            equipmentName = json.chrMachine;

                                                                        }
                                                                        var ControlBaseInfo = this.state.ControlBaseInfo;
                                                                        ControlBaseInfo.equipmentName = equipmentName;
                                                                        this.setState({ ControlBaseInfo: ControlBaseInfo });

                                                                    })
                                                                }}
                                                                onPressEnter={(event) => {
                                                                    $("#Card").focus();
                                                                }}
                                                            />
                                                            <span style={{float:"left"}}>-</span>
                                                            <Input style={{width:"100px",float:"left"}} value={this.state.ControlBaseInfo.childEquipmentNo}
                                                            onChange={(e)=>{
                                                                var ControlBaseInfo = this.state.ControlBaseInfo;
                                                                ControlBaseInfo.childEquipmentNo = e.target.value;
                                                                this.setState({ ControlBaseInfo: ControlBaseInfo });
                                                            }}
                                                            />
                                                            </div>
                                                        </td>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <span>设备名称：</span>
                                                        </td>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <div>
                                                                <Input style={{width:"150px",float:"left"}} id="NewEquipment" readOnly="true" value={this.state.ControlBaseInfo.equipmentName} />
                                                            <span style={{float:"left"}}>-</span>
                                                            <Input style={{width:"150px",float:"left"}}
                                                            value={this.state.ControlBaseInfo.childEquipment}
                                                            onChange={(e)=>{
                                                                var ControlBaseInfo = this.state.ControlBaseInfo;
                                                                ControlBaseInfo.childEquipment = e.target.value;
                                                                this.setState({ ControlBaseInfo: ControlBaseInfo });
                                                            }}
                                                            />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <span>反馈人：</span>
                                                        </td>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <Input style={{}} readOnly="true" value={this.state.ControlBaseInfo.feedbackMan} id="NewFeedbackMan" />
                                                        </td>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <span>反馈时间：</span>
                                                        </td>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <Input readOnly="true" id="FeedBackTime" value={this.state.ControlBaseInfo.feedbackTime} style={{}} />
                                                        </td>
                                                        <td style={{ borderTop: "1px solid #808080", borderRight: "1px solid #808080" }}>
                                                            <span>备货卡号：</span>
                                                        </td>
                                                        <td colSpan="3" style={{ borderTop: "1px solid #808080" }}>
                                                            <Input id="Card" onPressEnter={(event) => {
                                                                if (event.keyCode == 13) {
                                                                    this.CardValueChange(event.target.value);
                                                                }
                                                            }}
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "13pt", fontWeight: "800", marginBottom: "5px" }}>客户列表</p>
                                            <Table pagination={false} bordered size="middle" columns={this.CustomerColumns} dataSource={this.state.CustomerData}></Table>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "13pt", fontWeight: "800", marginBottom: "5px" }}>质量问题</p>
                                            <Table bordered size="middle" dataSource={this.state.ProblemList} columns={this.ProblemColumns} pagination={false}></Table>
                                        </div>
                                        <div style={{ width: "100%", clear: "both" }}>
                                            <div style={{ float: "left", width: "60%" }}>
                                                <p style={{ fontSize: "13pt", fontWeight: "800", marginBottom: "5px" }}>原因分析</p>
                                                <Table bordered size="middle" dataSource={this.state.ReasonList} columns={this.ReasonColumns} pagination={false}></Table>
                                            </div>
                                            <div style={{ float: "left", marginLeft: "3%", width: "35%" }}>
                                                <p style={{ fontSize: "13pt", fontWeight: "800", marginBottom: "5px" }} onClick={()=>{console.log(this.state.fileList)}}>质量问题图片</p>
                                                <div className="clearfix" style={{ border: "1px solid #43a8d6", borderRadius: "5px", }}>
                                                    <div style={{ margin: "5px" }}>
                                                        <Upload
                                                            method="post"
                                                           
                                                            action={QualityHost+"/api/Upload"}
                                                            listType="picture-card"
                                                            fileList={this.state.fileList}
                                                            style={{}}
                                                            onPreview={(file) => {
                                                                this.setState({
                                                                    previewImage: file.url || file.thumbUrl,
                                                                    previewVisible: true,
                                                                });
                                                            }}
                                                            onChange={this.handleChange}
                                                        >
                                                            {this.state.fileList.length >= 3 ? null : uploadButton}
                                                        </Upload>
                                                        <Modal visible={this.state.previewVisible} footer={null}
                                                            onCancel={() => { this.setState({ previewVisible: false }) }}
                                                        >
                                                            <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                                                        </Modal>
                                                      
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ clear: "both" }}>
                                            <p style={{ fontSize: "13pt", fontWeight: "800" }}>处理意见</p>
                                            <Table bordered dataSource={this.state.ControlBaseInfo.approvalStream} columns={this.StreamColumns} pagination={false} style={{ marginTop: "5px" }}></Table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                    <Modal
                        style={{ textAlign: "left" }}
                        title="QC一键完成"
                        visible={this.state.QCModal_Visible}
                        onOk={(e) => {
                            this.SaveData(1);
                        }}
                        okText="一键完成"
                        cancelText="取消"
                        //footer={<div><Button type="primary" style={{ marginTop: "10px" }}>QC确认</Button></div>}
                        onCancel={(e) => { this.setState({ QCModal_Visible: false }) }}>
                        <Alert message={<span>注意:<span style={{fontWeight:"600"}}>QC确认完成，直接忽略所有审批流程，QC一键完成审批</span></span>} type="warning" />
                        <div style={{ marginTop: "10px" }}>
                            <span>质量类别：</span>
                            <Select showSearch style={{ width: "150px", marginLeft: "10px" }}
                                value={this.state.QCToQualityClass}
                                onChange={(value) => {
                                    this.setState({QCToQualityClass:value})
                                }} >
                                {this.state.QualityTypeList}
                            </Select>

                            {/* <span style={{ marginLeft: "10px" }}>生成质量控制表：</span>    
                             <Select style={{ width: "70px", marginLeft: "10px" }} defaultValue="0" >
                                <Select.Option key="0" value="0">否</Select.Option>
                                <Select.Option key="1" value="1">是</Select.Option>
                            </Select> */}
                            <Input.TextArea style={{ marginTop: "10px" }}  placeholder="请输入处理意见" 
                            value={this.state.QCSuggestion} 
                            onChange={(e)=>{
                                this.setState({QCSuggestion:e.target.value})
                            }}
                            ></Input.TextArea>
                            <div style={{textAlign:"right",display:"none"}}>
                                 <Button type="primary" style={{ marginTop: "10px" }}
                                 onClick={()=>{
                                    this.SaveData(1);
                                 }}
                                 >确认完成</Button>
                            </div>
                        </div>
                    </Modal>

                          
                            <div style={{ textAlign: "center", clear: "both" }}>
                                <Button id="btnSave" style={{
                                    marginTop: "20px", marginBottom: "20px", width: "150px", backgroundColor: "#00ba00", color: "white",
                                    display: this.state.Unenable == true ? "none" : ""
                                }}
                                    onClick={() => { this.SaveData(0) }}
                                >提交</Button>
                                <Button icon="printer" id="btnPrint" style={{ display: this.state.OrderStatus != 2 || this.state.ControlBaseInfo.isControl == 1 ? "none" : "", marginTop: "20px", marginBottom: "20px", width: "150px" }} type="primary"
                                    onClick={() => { this.OnPrint("Print") }}
                                >打印</Button>
                                <Button icon="check" id="btnConfirm" style={{ display: this.state.OrderStatus === 1 || this.state.OrderStatus === 3 ? "" : "none", marginTop: "20px", marginBottom: "20px", width: "150px" }} type="primary"
                                    onClick={() => {
                                        this.OnConfirm();
                                    }}
                                >确认</Button>

                                <Button icon="check"  style={{display:(this.state.IsQC===true&&this.state.Unenable===false)?"":"none",marginLeft:"10px"}} type="primary"
                                    onClick={() => {
                                       this.setState({QCModal_Visible:true})
                                    }}
                                >QC一键完成</Button>

                                <Button icon="printer" id="btnConfirmAndPrint" style={{
                                    display: this.state.OrderStatus != 1 || this.state.OrderStatus == 3 ? "none" : "",
                                    marginTop: "20px",
                                    marginBottom: "20px", width: "150px", marginLeft: "20px"
                                }} type="primary"
                                    onClick={() => {
                                        this.OnConfirm();
                                        this.OnPrint("Print");
                                    }}
                                >确认并打印</Button>
                                <Button id="btnToControl" icon="link" type="primary" style={{
                                    display: this.state.OrderStatus === 3 ? "" : "none", marginLeft: "30px"
                                }}
                                    onClick={() => {
                                        var OrderNo = this.state.ControlBaseInfo.orderNo;
                                        var ID = this.state.ControlBaseInfo.id;
                                        var OrderStatus = 2;
                                        var StepID = this.state.ControlBaseInfo.stepID;
                                        fetch(QualityHost + "/api/WorkFlowTask",
                                            {
                                                method: "POST",
                                                mode: "cors",
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    ID: ID, Status: OrderStatus, StepID: StepID,ActionType:"confrim"
                                                })
                                            }).then(
                                            res => {
                                                if (res.status === 200) {
                                                    return res.json();
                                                }
                                            }
                                            ).then(result => {
                                                if (result) {
                                                    alert("确认成功");
                                                    // var KZ_OrderNo = OrderNo.replace("FK", "KZ");
                                                    // sessionStorage.setItem("DispatchValue", "DetailsCom");
                                                    // sessionStorage.setItem("ControlNo", KZ_OrderNo);
                                                    // this.props.dispatch(SetControlNo(KZ_OrderNo));
                                                    // this.props.dispatch(SetValue("DetailsCom"));
                                                    window.location="/FormPage/QualityControl";
                                                }
                                                else {
                                                    alert("确认失败!!!");
                                                }
                                            })

                                    }}
                                >确定并转向质量控制表</Button>
                            </div>
                </Spin>

                {/* 打印部分 */}
                <div id="Print" style={{ display: "none" }}>
                    <QualityPrint data={this.state.ControlBaseInfo} control={0}></QualityPrint>
                </div>
            </div>
        )
    }
}

// function mapStateToProps(state) {
//     return {
//         value: state.reducers.value != undefined ? state.reducers.value : "主页",
//         MessageList: state.reducers1.MessageList != undefined ? state.reducers1.MessageList : [],
//         ControlNo: state.reducers2.ControlNo != undefined ? state.reducers2.ControlNo : "",
//     }
// }
//const FeedDetailsCom = connect(mapStateToProps)(FeedDetails);
export default QualityFeedBackDetails;