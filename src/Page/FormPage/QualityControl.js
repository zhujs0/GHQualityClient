import React, { Component } from 'react';
import {
    Spin, Input, Select, Button, DatePicker, Radio, Table, message, Pagination, Popconfirm, Icon, Cascader,
    Modal, Layout, Breadcrumb, Affix,Tabs
} from 'antd';
import 'antd/dist/antd.min.css';
import 'whatwg-fetch';
import { QualityHost } from '../config';
import $ from 'jquery';
//import PrintPage from './printPage'
import QualityControlDetails from './QualityControlDetails'
//import { connect } from 'react-redux'
//import { SetValue, SetMessageList, SetControlNo } from '../Actions'
//import { Store } from '../Reducers';


const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
const PageSize = 10;

class QualityControl extends Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            panes:[{ title: '质量控制表', content: <Main ParentFun={(OrderNo)=>{this.ShowDetails(OrderNo)}} NewControl={()=>{this.NewControl()}} />, key: "ControlList" }],
            activeKey: "ControlList"
        }
    }

    ShowDetails(OrderNo) {
        var panes = this.state.panes;
        for (var i = 0; i < panes.length; i++) {
            if (panes[i].key.trim() === OrderNo.trim()) {
                this.setState({ activeKey: OrderNo });
                return;
            }
        }
        sessionStorage.setItem("ControlNo",OrderNo);
        panes.push(
            { title: OrderNo + '控制表详情', content: <QualityControlDetails  ControlNo={OrderNo} />, key: OrderNo.trim() }
        );
        this.setState({ panes: panes, activeKey: OrderNo });
    }

    NewControl()
    {
        var panes = this.state.panes;
        panes.push(
            { title: '新建', content: <QualityControlDetails NewControl="True" />, key: 'NewTabs' }
        );
        this.setState({ panes: panes, activeKey: "NewTabs" });
    }

    render() {
        console.log(this.state.panes)
        return (

                        <div style={{ minHeight: "90vh", margin: "10px", backgroundColor: "white", borderRadius: "5px" }}>
                            <Tabs
                            hideAdd
                            onChange={(activeKey)=>{this.setState({activeKey:activeKey})}}
                            activeKey={this.state.activeKey}
                            type="editable-card"
                            onEdit={(targetKey, action)=>{
                                console.log(targetKey, action)
                                if (action === "remove") {
                                    if (targetKey != "ControlList") {
                                        let activeKey = this.state.activeKey;
                                        let lastIndex;
                                        this.state.panes.forEach((pane, i) => {
                                            if (pane.key === targetKey) {
                                                lastIndex = i - 1;
                                            }
                                        });
                                        var panes = this.state.panes.filter(pane => (pane.key).trim() != targetKey.trim());
                                        if (lastIndex >= 0 && activeKey === targetKey) {
                                            activeKey = panes[lastIndex].key;
                                        }
                                        this.setState({panes:panes, activeKey:activeKey });
                                    }
                                }
                                
                            }}>
                            {this.state.panes.map(pane => <Tabs.TabPane tab={pane.title} key={pane.key}>{pane.content}</Tabs.TabPane>)}
                            </Tabs>
                        
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

class Main extends Component {
    constructor() {
        super();
        this.state = {
            loading: true, Data: [], pagination: {}, Select_WorkProduct: "", ProductList: [], StartTime: "",
            EndTime: "", OrderStatus: ""
        }
    }

    componentDidMount() {
        this.GetProduct();
        this.OnSearch(1, PageSize, {});
    }

    OrderColumns = [
        { title: "单号", dataIndex: "orderNo", key: "orderNo" },
        { title: "批号", dataIndex: "batchNo", key: "batchNo" },
        { title: "工序", dataIndex: "workProcedure", key: "workProcedure" },
        { title: "型号规格", dataIndex: "model", key: "model" },
        { title: "数量", dataIndex: "qty", key: "qty" },
        { title: "设备号", dataIndex: "equipmentNo", key: "equipmentNo" },
        { title: "设备名", dataIndex: "equipmentName", key: "equipmentName" },
        { title: "反馈人", dataIndex: "feedbackMan", key: "feedbackMan" },
        { title: "反馈时间", dataIndex: "feedbackTime", key: "feedbackTime" },
        {
            title: "审批状态", dataIndex: "status", key: "status", render: (value, record, index) => {
                switch (value) {
                    case "0": case "1":
                        if (sessionStorage.getItem("ConfirmStepID") === record.stepID) {
                            return (<spec style={{ color: "blue" }}>已完成，待确认<Icon type="star-o" /></spec>);
                        }
                        if (record.stepID === sessionStorage.getItem("EditStepID") && record.prevStatus === 3) {
                            return (<spec style={{ color: "red" }}>已退单，请确认<Icon type="star-o" /></spec>);
                        }
                        if (record.stepID === sessionStorage.getItem("EditStepID")) {
                            return (<spec style={{ color: "blue" }}>待处理<Icon type="edit" /></spec>);
                        }
                        else {
                            return (<spec style={{ color: "#108ee9" }}>待{record.stepName}处理<Icon type="hourglass" /></spec>);
                        }
                        break;
                    case "2":
                        return (<spec style={{ color: "#00ba00" }}>已完成<Icon type="smile-o" /></spec>)
                        break;
                    case "3":
                        return (<spec style={{ color: "red" }}>已退单<Icon type="meh-o" /></spec>)
                        break;
                    default:
                        return (<spec style={{ color: "red" }}>异常<Icon type="exception" /></spec>)
                        break;
                }
            }
        },
        {
            title: "操作", dataIndex: "orderNo", key: "Opt", render: (value, record, index) => {
                var WFOrderStatus = record.status;
                switch (WFOrderStatus) {
                    case "0": case "1":
                        //完成/生成控制表待确认
                        if (sessionStorage.getItem("ConfirmStepID") === record.stepID) {
                            return (<Button icon="file-text"
                                onClick={() => {
                                    this.props.ParentFun(record.orderNo);
                                }}
                            >确定/详情</Button>);
                        }
                        //退单待确认
                        else if (record.stepID === sessionStorage.getItem("EditStepID") && record.prevStatus === 3) {
                            return (<Button
                                icon="edit" type="primary"
                                onClick={() => {
                                    this.props.ParentFun(record.orderNo);
                                }}
                            >确定/编辑</Button>)

                        }
                        //可编辑，待处理
                        else if (record.stepID === sessionStorage.getItem("WaitStepID")) {
                            return (<Button icon="edit" type="primary"
                                onClick={() => {
                                    this.props.ParentFun(record.orderNo);
                                }}
                            >编辑</Button>);
                        }
                        //处理中
                        else {
                            return (<Button icon="file-text"
                                onClick={() => {
                                    this.props.ParentFun(record.orderNo);
                                }}
                            >详情</Button>);
                        }
                        break;
                    case "2":
                        return (<Button icon="file-text"
                            onClick={() => {
                                this.props.ParentFun(record.orderNo);
                            }}
                        >详情</Button>);
                        break;
                    case "3":
                        return (<Button icon="file-text"
                            onClick={() => {
                                this.props.ParentFun(record.orderNo);
                            }}
                        >详情</Button>);
                        break;
                    default:
                        return (<spec style={{ color: "red" }}>异常<Icon type="exception" /></spec>);
                        break;
                }
            }
        }
    ]


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

    //查询
    OnSearch(PageIndex, PageSize, pagination) {
        this.setState({ PageIndex: PageIndex });
        this.setState({ loading: true })
        var OrderNo = $("#OrderNo").val();
        var BatchNo = $("#BatchNo").val();
        var EquipmentNo = $("#EquipmentNo").val();
        var WorkProcedure = this.state.Select_WorkProduct;
        var StartTime = this.state.StartTime;
        var EndTime = this.state.EndTime;
        var Model = $("#Model").val();
        var FeedbackMan = $("#FeedbackMan").val();
        var OrderStatus = this.state.OrderStatus;
        this.GetSelect(OrderNo, BatchNo, WorkProcedure, StartTime, EndTime, EquipmentNo, Model, FeedbackMan, OrderStatus, PageIndex, PageSize, pagination);

    }

    //获取列表数据
    GetSelect(OrderNo, BatchNo, WorkProcedure, StartTime, EndTime, EquipmentNo, Model, FeedbackMan, Status, PageIndex, intPageSize, pagination) {
        fetch(QualityHost + "/api/Order?OrderNo=" + OrderNo + "&BatchNo=" + BatchNo + "&WorkProcedure=" + WorkProcedure + "&StartTime=" + StartTime + "&EndTime=" + EndTime
            + "&EquipmentNo=" + EquipmentNo + "&Model=" + Model + "&FeedbackMan=" + FeedbackMan + "&Status="
            + Status + "&PageIndex=" + PageIndex + "&PageSize=" + intPageSize + "&ActionType=GetOrderInfo&OrderType=1"
        ).then(res => {
            if (res.status === 200) {
                return res.json();
            }
        }).then(json => {
            console.log(json);
            this.setState({ loading: false });
            this.setState(Object.assign({}, this.state, { ...this.state, Data: json }));
            const pager = { ...this.state.pagination };
            pager.pageSize = intPageSize;
            pager.current = pagination.current;
            if (json.length > 0) {
                pager.total = json[0].rowCount;
            }
            this.setState({
                pagination: pager,
            });
        }).catch(err => {
            message.error(err);
            this.setState({ loading: false });
        })
    }

    render() {
        var ProductItem = [];
        for (var i = 0; i < this.state.ProductList.length; i++) {
            ProductItem.push(<Select.Option value={this.state.ProductList[i].roomName}>{this.state.ProductList[i].roomName}</Select.Option>)
        }
        return (
            <Spin tip="loading" spinning={this.state.loading}>
            <div style={{ minHeight: "90vh", margin: "5px",  }}>
                {/* 查询 */}
                <div style={{fontSize:"9pt"}}>
                    <table style={{ lineHeight: "35px", height: "70px", fontWeight: "600" }}>
                        <tbody>
                            <tr>
                                <td style={{ width: "50px", textAlign: "right" }}>单号：</td>
                                <td style={{ width: "160px" }}><Input id="OrderNo" style={{ width: "150px", marginLeft: "5px" }}></Input></td>
                                <td style={{ width: "70px", textAlign: "right" }}>设备号：</td>
                                <td><Input id="EquipmentNo" style={{ width: "150px", marginLeft: "5px" }}></Input></td>
                                <td style={{ width: "50px", textAlign: "right" }}>工序：</td>
                                <td>
                                    <Select showSearch id="WorkProcedure" style={{ width: "130px", marginLeft: "5px" }}
                                        onChange={(value) => { this.setState({ Select_WorkProduct: value }) }}>
                                        {ProductItem}
                                    </Select>
                                </td>
                                <td style={{ textAlign: "right", width: "80px" }}>型号规格：</td>
                                <td><Input id="Model" style={{ width: "150px", marginLeft: "5px" }}></Input></td>
                                <td style={{ width: "80px", textAlign: "right", display: "" }}>反馈时间：</td>
                                <td colSpan="4" style={{ display: "" }}>
                                    <RangePicker style={{ marginLeft: "5px" }} format={dateFormat}
                                        onChange={(value, dateString) => {
                                            this.setState({ StartTime: dateString[0] });
                                            this.setState({ EndTime: dateString[1] });
                                        }}
                                    ></RangePicker>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "right" }}>批号：</td>
                                <td style={{ width: "160px" }}> <Input id="BatchNo" style={{ width: "150px", marginLeft: "5px" }}></Input></td>
                                <td style={{ textAlign: "right", width: "50px" }}>反馈人：</td>
                                <td><Input id="FeedbackMan" style={{ width: "150px", marginLeft: "5px" }}></Input></td>
                                <td style={{ textAlign: "right" }}>状态：</td>
                                <td ><Select id="Status" style={{ width: "130px", marginLeft: "5px" }}
                                    onChange={(value) => { this.setState({ OrderStatus: value }) }}
                                >
                                    <Select.Option value="">全部</Select.Option>
                                    <Select.Option value="E">待处理</Select.Option>
                                    <Select.Option value="W">待确认</Select.Option>
                                    <Select.Option value="T" >处理中</Select.Option>
                                    <Select.Option value="P" selected="selected">已完成</Select.Option>
                                    <Select.Option value="B">已退单</Select.Option>
                                </Select>
                                </td>
                                <td style={{ textAlign: "right", display: "none" }} colSpan="2">
                                    <Radio.Group value={this.state.Print} onChange={(e) => { this.setState({ Print: e.target.value }) }}>
                                        <Radio value="2">全部</Radio>
                                        <Radio value="0">未打印</Radio>
                                        <Radio value="1">已打印</Radio>
                                    </Radio.Group>
                                </td>
                                <td colSpan="2">
                                    <Button icon="search" style={{ marginLeft: "10px" }}
                                        onClick={() => { this.OnSearch(1, PageSize, {}) }}
                                    >查询</Button>
                                    <Button type="primary" icon="file-add" style={{ marginLeft: "10px" }}
                                        onClick={() => {
                                           this.props.NewControl();
                                        }}
                                    >新建</Button>
                                </td>

                            </tr>
                        </tbody>
                    </table>

                </div>
                {/* 数据列表 */}
                <div style={{ margin: "10px" }}>
                    <Table size="small" loading={this.state.loading} columns={this.OrderColumns} dataSource={this.state.Data} onChange={(pagination) => {
                        this.OnSearch(pagination.current, PageSize, pagination)
                    }} pagination={this.state.pagination}></Table>
                </div>
            </div>
            </Spin>
        )
    }
}
//const ControlCom = connect(mapStateToProps)(Control);
//const HeaderCom=Header
export default QualityControl;