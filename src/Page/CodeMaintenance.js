import React, { Component, Children } from 'react';
import {
    Icon, Button, Input, Table, Popconfirm, Modal, InputNumber,
    Menu, message, Select, Spin, Layout, Breadcrumb, Checkbox, Divider, Tabs,Steps ,Avatar,
    Popover,List ,Alert
} from 'antd'
import 'antd/dist/antd.min.css'
import 'whatwg-fetch'
import $ from  'jquery'
import { QualityHost, PermissionPath, QualityCodeAuthID } from './config';
import index from 'antd/lib/icon';


//主组件
class Code_Main extends Component{
    constructor()
    {
        super();
        this.state={
            TabsPanes: [{
                title: '编码列表',
                content: <Child_Select
                ParentFun={(ActionType,value)=>{this.Fun_CreateTabsPanes(ActionType,value)}} />,
                key: "Child_Select"
            }],
            activeKey:"Child_Select"
        }
    }

    Fun_CreateTabsPanes(ActionType,value) {
        var panes = this.state.TabsPanes;
        for (var i = 0; i < panes.length; i++) {
            if (panes[i].key.trim() === ActionType.trim()) {
                this.setState({ activeKey: ActionType });
                return;
            }
        }
        panes.push(
            { title: ActionType, content: <Child_Edit  codeString={value} />, key: ActionType.trim() }
        );
        this.setState({ TabsPanes: panes, activeKey: ActionType });
    }

    render()
    {
        return (
            <div>
                <Tabs
                    hideAdd
                    onChange={(activeKey) => { this.setState({ activeKey: activeKey }) }}
                    activeKey={this.state.activeKey}
                    type="editable-card"
                    onEdit={(targetKey, action) => {
                        if (action === "remove") {
                            if (targetKey != "Child_Select") {
                                let activeKey = this.state.activeKey;
                                let lastIndex;
                                this.state.TabsPanes.forEach((TabsPanes, i) => {
                                    if (TabsPanes.key === targetKey) {
                                        lastIndex = i - 1;
                                    }
                                });
                                var TabsPanes = this.state.TabsPanes.filter(TabsPanes => (TabsPanes.key).trim() != targetKey.trim());
                                if (lastIndex >= 0 && activeKey === targetKey) {
                                    activeKey = TabsPanes[lastIndex].key;
                                }
                                this.setState({ TabsPanes: TabsPanes, activeKey: activeKey });
                            }
                        }

                    }}>
                    {this.state.TabsPanes.map(TabsPanes => <Tabs.TabPane tab={TabsPanes.title} key={TabsPanes.key}>{TabsPanes.content}</Tabs.TabPane>)}
                </Tabs>
            </div>
        )
    }
}



//添加/编辑组件
class Child_Edit extends Component{
    constructor()
    {
        super();
        this.state = {
            loading: false,
            QualityTypeList: [],
            CodeInfo:{codeID:0,codeString:'',createTime:"",employee:"",employeeID:"",
            preCode:"0000",present:"",proCode:"",problem:"",problemLevel:"T1",qualityClass:"",roomCode:"",
            roomName:"",suggestion:"[{\"suggestion\":\"\"}]",topClass:"",topClassCode:"",typeCode:"",typeName:""},
            WorkList:[],TopClassList:[],SearchClassList:[],SearchProblemList:[],SearchPresentList:[],
            OldCodeString:"",Modal_Visible:false,Modal_Content:"",AlertType:""
        }
    }


    Fun_AddSuggestion()
    {
        var CodeInfo=this.state.CodeInfo;
        var suggestion=JSON.parse(CodeInfo.suggestion);
        suggestion.push({suggestion:""});
        CodeInfo.suggestion=JSON.stringify(suggestion);
        this.setState({CodeInfo:CodeInfo});
    }
    Fun_DelSuggestion(index)
    {
        var CodeInfo=this.state.CodeInfo;
        var suggestion=JSON.parse(CodeInfo.suggestion);
        suggestion.splice(index,1);
        if(suggestion.length===0)
        {
            suggestion.push({key:0,suggestion:""});
        }
        CodeInfo.suggestion=JSON.stringify(suggestion);
        this.setState({CodeInfo:CodeInfo});
    }


    SourceColumns=[
        {title:(<Button>添加</Button>),dataIndex:"suggestion",key:1,render:(value,record,index)=>{
            return(
            <Input placeholder="请输入处理意见"  value={value} 
            onChange={(e)=>{
                var CodeInfo=this.state.CodeInfo;
                var suggestion=JSON.parse(CodeInfo.suggestion);
                suggestion[index].suggestion=e.target.value;
                CodeInfo.suggestion=JSON.stringify(suggestion);
                this.setState({CodeInfo:CodeInfo});
            }}
            addonBefore={<div><a
                onClick={() => {
                    this.Fun_AddSuggestion();
                }}
            >添加</a><Divider type="vertical" /><a onClick={() => {
                this.Fun_DelSuggestion(index)
            }}>删除</a></div>} />)
        }}
    ]

    componentWillMount()
    {
        //console.log("codestring",this.props.codeString)
        this.Fun_GetCodeConfig();
        if(this.props.codeString!="")
        {
            this.Fun_GetCodeInfo(this.props.codeString);
            this.setState({OldCodeString:this.props.codeString});
        }
        
    }

    Fun_GetCodeInfo(codeString)
    {
        this.setState({loading:true});
        fetch(QualityHost+"/api/Code2Problem?CodeString="+codeString.trim())
        .then(res=>{
            if(res.status===200)
            {
                return res.json();
            }
        }).then(json=>{
            this.setState({loading:false,CodeInfo:json});
        }).catch(err=>
            {
                alert(err);
                this.setState({loading:false});
            }
        )
    }

    Fun_GetCodeConfig()
    {
        /*获取质量类别*/
         this.Fun_GetQualityTypeList();
        /*获取质量大类*/
        this.Fun_GetTopClass();
        /*获取质量工序*/
        this.Fun_GetWorkList();
    }

    
 /*①获取所有工序*/
 Fun_GetWorkList() {
    fetch(QualityHost + "/api/Room").then(
        res => {
            if (res.status === 200) {
                return res.json();
            }
        }
    ).then(
        json => {
            var WorkList=[];
            var Temp=[];
            if (json != null) {
                for (var i = 0; i < json.length; i++) {
                    if (Temp.indexOf(json[i].roomCode) === -1) {
                        WorkList.push(<Select.Option key={i} value={json[i].roomCode}>{json[i].roomName}</Select.Option>);
                        Temp.push(json[i].roomCode);
                    }
                }
            }
            this.setState({WorkList:WorkList});
            
        }
        ).catch(err => { console.error("Fun_GetWorkList:" + err) })
}

/*①获取所有质量大类*/
Fun_GetTopClass()
{
    fetch(QualityHost + "/api/TopClass")
    .then(res => {
        if (res.status === 200) {
            return res.json();
        }
    }).then(json => {
        var TopClassList=this.state.TopClassList;
        if(json!=null)
        {
            for(var i=0;i<json.length;i++)
            {
                var Temp=[];
                if(Temp.indexOf(json[i].topClassCode)===-1)
                {
                    TopClassList.push(<Select.Option key={i} value={json[i].topClassCode}>{json[i].topClass}</Select.Option>);
                }
            }
        }
        this.setState({ TopClassList: TopClassList });
    }).catch(err => { console.error("Fun_GetTopClass:" + err) });
}


Fun_FillCode(value,len)
{
    if(value.trim().length<len)
    {
        value='00000000'+value.trim();
        value=value.slice(-len);
    }
    return value;
}

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

    Fun_SetCodeInfo(Parm,Value)
    {
        var CodeInfo=this.state.CodeInfo;
        CodeInfo[Parm]=Value;
        var codeString=CodeInfo.topClassCode+CodeInfo.roomCode+CodeInfo.typeCode+CodeInfo.proCode+CodeInfo.preCode;
        CodeInfo.codeString=codeString;
        this.setState({CodeInfo:CodeInfo});
    }

    Fun_Save()
    {
        var CodeInfo=this.state.CodeInfo;
        if(CodeInfo.codeString.trim().length!=18)
        {
            this.setState({Modal_Visible:true,Modal_Content:"质量编码长度不为18位，保存编码失败",AlertType:"warning"});
            return;
        }
        this.setState({loading:true});
        var PostData = {
            TopClass:CodeInfo.topClass,TopClassCode:CodeInfo.topClassCode,
            RoomName: CodeInfo.roomName, RoomCode: CodeInfo.roomCode,
            TypeName:CodeInfo.typeName, TypeCode: CodeInfo.typeCode,
            Problem:  CodeInfo.problem, ProCode: CodeInfo.proCode,
            Present:CodeInfo.present, PreCode:CodeInfo.preCode,
            QualityClass: CodeInfo.qualityClass, Suggestion: CodeInfo.suggestion,
            ProblemLevel: CodeInfo.problemLevel,CodeID:CodeInfo.codeID,
            EmployeeID:sessionStorage.getItem("userId").toString(),
            Employee:sessionStorage.getItem("userName").toString()
        }
        fetch(QualityHost + "/api/Code", {
            method: "POST",
            mode: "cors",
            headers: { 'Content-Type': 'application/json' },
            body:
            JSON.stringify(PostData)
        }).then(result => {
            if (result.status == 200) {
                return result.json();
            }
        }).then(json => {
            if (json.result) {
                message.success("保存成功!");
                if(this.state.OldCodeString!="")
                {
                    this.Fun_GetCodeInfo(CodeInfo.codeString);  
                }
                else
                {
                    var NewCodeInfo={codeID:0,codeString:'',createTime:"",employee:"",employeeID:"",
                    preCode:"0000",present:"",proCode:"",problem:"",problemLevel:"T1",qualityClass:"",roomCode:"",
                    roomName:"",suggestion:"[{\"suggestion\":\"\"}]",topClass:"",topClassCode:"",typeCode:"",typeName:""}
                    this.setState({loading:false,CodeInfo:NewCodeInfo,OldCodeString:""});
                }
                this.setState({loading:false});
            }
            else {
                this.setState({Modal_Visible:true,Modal_Content:json.msg,AlertType:"error",loading:false});
            }
        }).catch(err => {
            this.setState({Modal_Visible:true,Modal_Content:"错误",AlertType:"error",loading:false});
            console.error("Fun_Save:", err);
        })

    }

    render()
    {
        var SuggestionData=[];
        if(this.state.CodeInfo.suggestion!="" &&this.state.CodeInfo.suggestion!=null)
        {
            var suggestion=JSON.parse(this.state.CodeInfo.suggestion);
            for(var i=0;i<suggestion.length;i++)
            {
                SuggestionData.push({key:i,suggestion:suggestion[i].suggestion});
            }
        }
        return(
            <Spin tip="loading" spinning={this.state.loading}>
                <Modal
                    title={<div><Icon type={this.state.AlertType} style={{ color: "#faad13", fontSize: "13pt" }}></Icon>警告</div>}
                    visible={this.state.Modal_Visible}
                    onOk={() => {
                        this.setState({ Modal_Visible: false });
                    }}
                    onCancel={() => {
                        this.setState({ Modal_Visible: false });
                    }}
                >
                    <p>{this.state.Modal_Content}</p>
                </Modal>


            <Button type="primary" icon="save" onClick={()=>{
                this.Fun_Save();
            }} >保存</Button>
            <Button style={{marginLeft:"10px",display:"none"}}>删除</Button>
            <spec style={{marginLeft:"20px",display:"none"}}>编码：{this.state.OldCodeString}</spec>
            <Divider>编码信息</Divider>
            <table style={{width:"100%",textAlign:"left:",lineHeight:"35px"}}> 
                <tbody>
                    <tr>
                        <td style={{width:"5%"}}>标题</td>
                        <td>内容</td>
                        <td>编码</td>
                    </tr>
                        <tr>
                            <td>质量大类</td>
                            <td style={{width:"40%"}}>
                                <Select value={{ key: this.state.CodeInfo.topClassCode, label: this.state.CodeInfo.topClass }} labelInValue={true} style={{ width: "100%" }}
                                    onSelect={(value) => {
                                        this.Fun_SetCodeInfo("topClass", value.label);
                                        this.Fun_SetCodeInfo("topClassCode", value.key);

                                    }}
                                >{this.state.TopClassList}</Select>

                            </td>
                            <td><Input value={this.state.CodeInfo.topClassCode} readOnly={true}/></td>
                        </tr>
                    <tr>
                        <td>工&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;序</td>
                            <td>
                                <Select value={{ key: this.state.CodeInfo.roomCode, label: this.state.CodeInfo.roomName }} labelInValue={true} style={{ width: "100%" }}
                                    onSelect={(value) => {
                                        this.Fun_SetCodeInfo("roomName", value.label);
                                        this.Fun_SetCodeInfo("roomCode", value.key);
                                    }}
                                >{this.state.WorkList}</Select>
                            </td>
                        <td><Input value={this.state.CodeInfo.roomCode} readOnly={true} /></td>
                    </tr>
                    <tr>
                        <td>质量分类</td>
                        <td>
                            <Select showSearch style={{width:"100%"}} mode="combobox" value={this.state.CodeInfo.typeName}
                            onChange={(value)=>{
                                this.Fun_SetCodeInfo("typeName", value);
                                fetch(QualityHost + "/api/QualityCode?ActionType=FuzzyByItem&TypeName=" + value).then(
                                    res => { if (res.status === 200) { return res.json() } }
                                ).then(json => {
                                    if (json != null) {
                                        var PreSelect=[];
                                        var temp=[];
                                        for (var i = 0; i < json.length; i++) {
                                            if (temp.indexOf(json[i].typeName) === -1) {
                                                temp.push(json[i].typeName);
                                                PreSelect.push(<Select.Option key={i} value={json[i].typeName}>{json[i].typeName}</Select.Option>);
                                            }
                                        }
                                        this.setState({SearchClassList:PreSelect});
                                    }
                                }).catch(err => { console.error(err) })
                            }}
                            onSelect={(value)=>{
                                fetch(QualityHost + "/api/QualityCode?ActionType=FuzzyByItem&TypeName=" + value).then(
                                    res => { if (res.status === 200) { return res.json() } }
                                ).then(json => {
                                    if (json != null) {
                                        if(json.length>0)
                                        {
                                            this.Fun_SetCodeInfo("typeCode", json[0].typeCode);
                                        }
                                    }
                                }).catch(err => { console.error(err) })
                            }}
                            >
                            {this.state.SearchClassList}
                            </Select>
                        </td> 
                        <td><Input value={this.state.CodeInfo.typeCode}  addonAfter={<Icon type="edit"/>} maxLength="4"
                        onChange={(e)=>{
                            this.Fun_SetCodeInfo("typeCode",e.target.value);
                        }}
                        onBlur={(e)=>{
                            var value=this.Fun_FillCode(e.target.value,4);
                            this.Fun_SetCodeInfo("typeCode",value);
                        }}
                        
                        /></td>
                    </tr>
                    <tr>
                        <td>质量问题</td>
                        <td>
                        <Select showSearch style={{width:"100%"}} mode="combobox" value={this.state.CodeInfo.problem} 
                            onChange={(value)=>{
                                this.Fun_SetCodeInfo("problem", value);
                                fetch(QualityHost + "/api/QualityCode?ActionType=FuzzyByItem&Problem=" + value).then(
                                    res => { if (res.status === 200) { return res.json() } }
                                ).then(json => {
                                    if (json != null) {
                                        var PreSelect=[];
                                        var temp=[];
                                        for (var i = 0; i < json.length; i++) {
                                            if (temp.indexOf(json[i].problem) === -1) {
                                                temp.push(json[i].problem);
                                                PreSelect.push(<Select.Option key={i} value={json[i].problem}>{json[i].problem}</Select.Option>);
                                            }
                                        }
                                        this.setState({SearchProblemList:PreSelect});
                                    }
                                }).catch(err => { console.error(err) })
                            }}
                            onSelect={(value)=>{
                                fetch(QualityHost + "/api/QualityCode?ActionType=FuzzyByItem&Problem=" + value).then(
                                    res => { if (res.status === 200) { return res.json() } }
                                ).then(json => {
                                    if (json != null) {
                                        if(json.length>0)
                                        {
                                            this.Fun_SetCodeInfo("proCode", json[0].proCode);
                                        }
                                    }
                                }).catch(err => { console.error(err) })
                            }}
                            >
                            {this.state.SearchProblemList}
                            </Select>
                        </td>
                        <td><Input value={this.state.CodeInfo.proCode} addonAfter={<Icon type="edit"/>} maxLength="4"
                        onChange={(e)=>{
                            this.Fun_SetCodeInfo("proCode", e.target.value);
                        }}
                        onBlur={(e)=>{
                            var value=this.Fun_FillCode(e.target.value,4);
                            this.Fun_SetCodeInfo("proCode",value);
                        }}
                        /></td>
                    </tr>
                    <tr>
                        <td>质量比例</td>
                        <td>
                        <Select showSearch style={{width:"100%"}} mode="combobox" value={this.state.CodeInfo.present} 
                            onChange={(value)=>{
                                this.Fun_SetCodeInfo("present", value);
                                fetch(QualityHost + "/api/QualityCode?ActionType=FuzzyByItem&Present=" + value).then(
                                    res => { if (res.status === 200) { return res.json() } }
                                ).then(json => {
                                    if (json != null) {
                                        var PreSelect=[];
                                        var temp=[];
                                        for (var i = 0; i < json.length; i++) {
                                            if (temp.indexOf(json[i].present) === -1) {
                                                temp.push(json[i].present);
                                                PreSelect.push(<Select.Option key={i} value={json[i].present}>{json[i].present}</Select.Option>);
                                            }
                                        }
                                        this.setState({SearchPresentList:PreSelect});
                                    }
                                }).catch(err => { console.error(err) })
                            }}
                            onSelect={(value)=>{
                                fetch(QualityHost + "/api/QualityCode?ActionType=FuzzyByItem&Present=" + value).then(
                                    res => { if (res.status === 200) { return res.json() } }
                                ).then(json => {
                                    if (json != null) {
                                        if(json.length>0)
                                        {
                                            this.Fun_SetCodeInfo("preCode", json[0].preCode);
                                        }
                                    }
                                }).catch(err => { console.error(err) })
                            }}
                            >
                            {this.state.SearchPresentList}
                            </Select>
                        </td>
                        <td><Input value={this.state.CodeInfo.preCode} addonAfter={<Icon type="edit"/>} maxLength="4"
                        onChange={(e)=>{
                            this.Fun_SetCodeInfo("preCode", e.target.value);
                        }} 
                        onBlur={(e)=>{
                            var value=this.Fun_FillCode(e.target.value,4);
                            this.Fun_SetCodeInfo("preCode",value);
                        }}
                        /></td>
                    </tr>
                </tbody>
            </table>

            <Alert message={<span>质量代号:<span style={{fontWeight:"600"}}>{this.state.CodeInfo.codeString}</span></span>} type="success" />
            <Divider>处理意见</Divider>
                
                <div style={{ marginTop: "5px" }}>
                    <span>质量类别：</span>
                    <Select showSearch  style={{ width: "200px", marginLeft: "10px" }}
                        value={this.state.CodeInfo.qualityClass}
                        onChange={(value) => {
                             this.Fun_SetCodeInfo("qualityClass",value);
                        }} >
                        {this.state.QualityTypeList}
                    </Select>
                    <div style={{ marginTop: "10px" }}><span style={{ float: "left" }}>审批过程：</span>
                        <Steps style={{ width: "80%", float: "left" }} size={"small"} 
                        current={parseInt(this.state.CodeInfo.problemLevel.replace("T",""))-1} >
                            <Steps.Step title="QC" onClick={() => {
                                this.Fun_SetCodeInfo("problemLevel","T1");
                                }} />
                            <Steps.Step title="工艺员" onClick={() => { this.Fun_SetCodeInfo("problemLevel","T2");}} />
                            <Steps.Step title="品管部部长" onClick={() => { this.Fun_SetCodeInfo("problemLevel","T3"); }} />
                            <Steps.Step title="技术部部长" onClick={() => { this.Fun_SetCodeInfo("problemLevel","T4"); }} />
                            <Steps.Step title="总经理" onClick={() => { this.Fun_SetCodeInfo("problemLevel","T5"); }} />
                        </Steps>
                    </div>
                    <div style={{clear:"both",height:"10px"}}></div>
                    <Table columns={this.SourceColumns} size="small"  showHeader={false} dataSource={SuggestionData} pagination={false} />
                    

                
                    
                    
                </div>
            </Spin>
        )
    }
}

//查询子组件
class Child_Select extends Component{
    constructor()
    {
        super();
        this.state={
            Author:true,//权限
            loading: false, //加载状态
            WorkList: [], //工序
            TopClassList: [], //质量大类
            QualityClassList: [],//质量分类
            ProblemList: [],//质量问题
            Work_Val:"",//选中的工序，空表示全部
            TopClass_Val:"",//选中的质量大类，空表示全部
            QualityClass_Val:"",//选中的质量分类，空表示全部
            Problem_Val:"",//选中的质量问题，空表示全部
            Code_Resource:[],//编码列表源
            selectedRows:[],//多选
            Modal_Visible:false,//弹出确认框
            Modal_Content:"",//弹出框内容
        }
    }

    /*①编码列表*/
    Code_Columns=[
        { title: '编码', dataIndex: 'codeString', key: 'codeString' },
        { title: '质量大类', dataIndex: 'topClass', key: 'TopClass' },
        { title: '工序', dataIndex: 'roomName', key: 'roomName' },
        { title: '质量分类', dataIndex: 'typeName', key: 'typeName' },
        { title: '质量问题', dataIndex: 'problem', key: 'problem' },
        { title: '质量比例', dataIndex: 'present', key: 'present' },
        { title: '产品判类', dataIndex: 'qualityClass', key: 'qualityClass' },
        {
            title: '审批流程', dataIndex: 'problemLevel', key: 'problemLevel',
            render: (value, record, index) => {
                var ContentData=[];
                for(var i=0;i<5;i++)
                {
                    ContentData.push({title:"T"+(i+1),content:<Steps style={{ marginTop:"5px",marginLeft:"10px"}} size={"small"} current={i} >
                    <Steps.Step title="QC" />
                    <Steps.Step title="工艺员" />
                    <Steps.Step title="品管部部长" />
                    <Steps.Step title="技术部部长" />
                    <Steps.Step title="总经理" />
                </Steps>});
                    
                }
             
                var content = (
                    <List
                        size="small"
                        header={null}
                        footer={null}
                        bordered
                        dataSource={ContentData}
                        itemLayout="horizontal"
                        split={true}
                        renderItem={item => (
                            <List.Item><Avatar style={{ backgroundColor:"#2674ca"}}>{item.title}</Avatar>{item.content}</List.Item>
                        )
                    }
                    />
                );
                return( <Popover content={content} title="含义">
                    <div >{value}</div>
                </Popover>)
            }
        },
        { title: '创建人', dataIndex: 'employee', key: 'employee' },
        { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
        {
            title: '操作', dataIndex: 'codeString', key: 'x', render: (value, record, index) => <div>
                <Popconfirm title="确定删除?" onConfirm={this.Fun_DeleteCode.bind(this, index,value)} >
                <Button type="danger" style={{display:this.state.Author==true?"":"none" }}>删除</Button>
                </Popconfirm>
                <Button style={{ marginLeft: "10px",display:this.state.Author==true?"":"none"  }} onClick={() => {
                   this.props.ParentFun("编辑:"+value,value);
                }}>编辑</Button>
            </div>
        }
    ]

    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ selectedRows: selectedRows })
        }
    }


    //多选删除编码
    DeleteCodes()
    {
        var Codes = this.state.selectedRows;
        var value = "";
        for (var i = 0; i < Codes.length; i++) {
            value += Codes[i].codeString + ",";
        }
        if (value != "") {
            value = value.substring(0, value.lastIndexOf(","));
        }
        fetch(QualityHost + "/api/Code?CodeString=" + value, {
            method: "DELETE",
            mode: "cors",
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            if (res.status == 200) {
                return res.json();
            }
        }).then(json => {
            if (json.result) {
                message.success("删除成功");
                this.Fun_SearchCode();
            }
            else {
                message.error(json.msg);
            }
        }).catch(err => {
            console.log("errMsg", err);
        })
    }



    componentWillMount()
    {
        this.Fun_GetWorkList();
        this.Fun_GetTopClass();
        this.Fun_GetClassAndProblemList();
    }

    /*①获取所有工序*/
    Fun_GetWorkList() {
        fetch(QualityHost + "/api/Room").then(
            res => {
                if (res.status === 200) {
                    return res.json();
                }
            }
        ).then(
            json => {
                var WorkList=[];
                var Temp=[];
                WorkList.push(<Select.Option key="" value="">全部</Select.Option>);
                if (json != null) {
                    for (var i = 0; i < json.length; i++) {
                        if (Temp.indexOf(json[i].roomCode) === -1) {
                            WorkList.push(<Select.Option key={i} value={json[i].roomCode}>{json[i].roomName}</Select.Option>);
                            Temp.push(json[i].roomCode);
                        }
                    }
                }
                this.setState({WorkList:WorkList});
                
            }
            ).catch(err => { console.error("Fun_GetWorkList:" + err) })
    }

    /*①获取所有质量大类*/
    Fun_GetTopClass()
    {
        fetch(QualityHost + "/api/TopClass")
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
        }).then(json => {
            var TopClassList=this.state.TopClassList;
            TopClassList.push(<Select.Option key="全部" value="">全部</Select.Option>);
            if(json!=null)
            {
                for(var i=0;i<json.length;i++)
                {
                    var Temp=[];
                    if(Temp.indexOf(json[i].topClassCode)===-1)
                    {
                        TopClassList.push(<Select.Option key={i} value={json[i].topClassCode}>{json[i].topClass}</Select.Option>);
                    }
                }
            }
            this.setState({ TopClassList: TopClassList });
        }).catch(err => { console.error("Fun_GetTopClass:" + err) });
    }

     /*①获取所有质量类别、质量问题*/
    Fun_GetClassAndProblemList() {
        fetch(QualityHost + "/api/Code").then(
            res => {
                if (res.status === 200) {
                    return res.json();  
                }
            }
        ).then(json => {
            var QualityClassList=[];
            var ProblemList=[];
            QualityClassList.push(<Select.Option key="全部" value="">全部</Select.Option>);
            ProblemList.push(<Select.Option key="全部" value="">全部</Select.Option>);
            if(json!=null)
            {
                var ClassTemp=[];
                var ProblemTemp=[];
                for(var i=0;i<json.length;i++)
                {
                    if(ClassTemp.indexOf((json[i].typeName).trim())===-1)
                    {
                        QualityClassList.push(<Select.Option key={i} value={json[i].typeCode}>{json[i].typeName}</Select.Option>);
                        ClassTemp.push(json[i].typeName.trim());
                    }
                    if(ProblemTemp.indexOf((json[i].problem).trim())===-1)
                    {
                        ProblemList.push(<Select.Option key={i} value={json[i].proCode}>{json[i].problem}</Select.Option>);
                        ProblemTemp.push(json[i].problem.trim());
                    }
                }
            }
            this.setState({QualityClassList:QualityClassList,ProblemList:ProblemList});
        })
    }

    /*①编码查询*/
    Fun_SearchCode() {
        this.setState({ loading: true });
        var Work_Val = this.state.Work_Val;
        var TopClass_Val = this.state.TopClass_Val;
        var QualityClass_Val = this.state.QualityClass_Val;
        var Problem_Val = this.state.Problem_Val;
        Work_Val=Work_Val.trim()==="全部"?"":Work_Val;
        TopClass_Val=TopClass_Val.trim()==="全部"?"":TopClass_Val;
        QualityClass_Val=QualityClass_Val.trim()==="全部"?"":QualityClass_Val;
        Problem_Val=Problem_Val.trim()==="全部"?"":Problem_Val;
        fetch(QualityHost + "/api/Code?RoomName=" + Work_Val + "&TypeName=" + QualityClass_Val + "&Problem=" 
        + Problem_Val + "&TopClass=" + TopClass_Val)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                }
            })
            .then(json => {
                this.setState({ Code_Resource: json, loading: false });
            }).catch(res => {
                console.error("Fun_SearchCode:", res);
                this.setState({ loading: false });
            });
    }

    /*①编码删除*/
    Fun_DeleteCode(index,value) {
        fetch(QualityHost + "/api/Code?CodeString=" + value, {
            method: "DELETE",
            mode: "cors",
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            if (res.status == 200) {
                return res.json();
            }
        }).then(json => {
            if (json.result) {
                message.success("删除成功");
                const Code_Resource = [...this.state.Code_Resource];
                Code_Resource.splice(index, 1);
                this.setState({ Code_Resource });
            }
            else {
                message.error(json.msg);
            }
        }).catch(err => {
            console.log("errMsg", err);
        })
    }


    render(){

        return(
            <Spin tip="loading" spinning={this.state.loading}>
                    <Divider style={{display:"none"}}>编码查询</Divider>
                <table style={{ fontFamily: "Arial, Helvetica, sans-serif", textAlign: "left"}} >
                    <tbody>
                        <tr>
                            <td style={{ width: "75px" }}>质量大类：</td>
                            <td style={{ width: "150px" }}>
                                <Select showSearch labelInValue={true} style={{ width: "100%" }} placeholder="请选择质量大类"
                                    onSelect={(value) => {
                                        this.setState({ TopClass_Val: value.label });
                                    }}
                                >
                                    {this.state.TopClassList}
                                </Select>
                            </td>
                            <td style={{ width: "70px", textAlign: "right" }}>工序：</td>
                            <td>
                                <Select showSearch labelInValue={true} style={{ width: "150px" }} placeholder="请选择工序"
                                    onSelect={(value) => {
                                        this.setState({ Work_Val: value.label });
                                    }} >
                                    {this.state.WorkList}
                                </Select>
                            </td>
                            <td style={{ width: "90px", textAlign: "right" }}>质量分类：</td>
                            <td>
                                <Select showSearch labelInValue={true} style={{ width: "150px" }} placeholder="请选择质量分类"
                                    onSelect={(value) => {
                                        this.setState({ QualityClass_Val: value.label });
                                    }} >
                                    {this.state.QualityClassList}
                                </Select>
                            </td>
                            <td style={{ width: "90px", textAlign: "right" }}>质量问题：</td>
                            <td>
                                <Select showSearch labelInValue={true} style={{ width: "150px" }} placeholder="请选择质量问题"
                                    onSelect={(value) => {
                                        this.setState({ Problem_Val: value.label });
                                    }} >
                                    {this.state.ProblemList}
                                </Select>
                            </td>

                        </tr>
                    </tbody>
                </table>
                <div style={{ clear:"both",textAlign: "left", marginTop: "10px" }}>
                    <span style={{}}>操&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;作：</span>
                    <Button style={{ marginLeft: "7px" }} type="primary" icon="search"
                        onClick={() => {
                            this.Fun_SearchCode();
                        }}>查询</Button>
                    <Button style={{ marginLeft: "20px", color: "#00ba00", display: this.state.Author == true ? "" : "none" }} icon="plus"
                        onClick={() => {
                            this.props.ParentFun("新建", "")
                        }}>新建</Button>
                    <Modal
                        title={<div><Icon type="warning" style={{ color: "#faad13", fontSize: "13pt" }}></Icon>警告</div>}
                        visible={this.state.Modal_Visible}
                        onOk={() => {
                            if (this.state.selectedRows.length <= 0) {
                                this.setState({ Modal_Visible: false });
                                return;
                            }
                            this.DeleteCodes();
                            this.setState({ Modal_Visible: false });
                        }}
                        onCancel={() => {
                            this.setState({ Modal_Visible: false });
                        }}
                    >
                        <p>{this.state.Modal_Content}</p>
                    </Modal>
                    <Button style={{ marginLeft: "20px", color: "red", display: this.state.Author == true ? "" : "none" }}
                        type="danger" icon="delete" ghost
                        onClick={() => {
                            if (this.state.selectedRows.length <= 0) {
                                this.setState({ Modal_Content: "你暂未选中编码" });
                            }
                            else {
                                this.setState({ Modal_Content: "确认删除" });
                            }
                            this.setState({ Modal_Visible: true });
                        }}
                    >批量删除</Button>
                </div>
                    <Divider>数据列表</Divider>
                    <div>
                    <Table bordered columns={this.Code_Columns} dataSource={this.state.Code_Resource}
                        pagination={{
                            showTotal: (val) => { return <div style={{ textAlign: "left", fontWeight: "600" }}>总数:<span style={{ color: "#00ba00" }}>{val}</span></div> },
                            pageSize: 10, showQuickJumper: true
                        }}
                        rowSelection={this.rowSelection}
                        expandedRowRender={record => {
                            var json = eval(record.suggestion);
                            var item = [];
                            if (json != null) {
                                for (var i = 0; i < json.length; i++) {
                                    item.push(
                                        <div>
                                            <span style={{ fontWeight: "600" }}>{i + 1}、</span>{json[i].suggestion}
                                        </div>
                                    )
                                }
                            }
                            return (<div><span style={{ fontWeight: "600", float: "left" }}>处理意见：</span><div style={{ float: "left" }}>{item}</div></div>)
                        }
                        }
                    />
                    </div>
            </Spin>
        )
    }
}

export default Code_Main
