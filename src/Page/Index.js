import { Layout, Menu, Icon, Badge, Table,message,notification,Input,Tabs,Popover,List } from 'antd';
import React from 'react';
import NavLink from 'react-router-dom/NavLink';
import {deleteCookie} from '../function/Fun';
import { QualityHost } from './config';
import { Button } from 'antd/lib/radio';
import {mapStateToProps} from './Reducers';
import {connect} from 'react-redux'

const { Header, Sider, Content ,Footer} = Layout;

class SiderBar extends React.Component {

    constructor(props)
    {
        super(props);
        this.state={
            MessageData:[],MessageList:[],PopoverVisible:false,defaultSelectedKeys:""
        }
    }

    componentWillMount()
    {
        //console.log("sssss",sessionStorage.getItem("userId"))
        // if(sessionStorage.getItem("userId")===""||sessionStorage.getItem("userId")===undefined||sessionStorage.getItem("userId")===null)
        // {
        //     window.location="/";
            
        // }
        //获取配置文件
        this.GetServiceConfig();
        this.GetWaitMessage();
        setInterval(
          () => {
            this.GetWaitMessage();
          }, 60000
        )
    }

    GetWaitMessage() {
        fetch(QualityHost + "/api/Order?ActionType=GetWaitConfirm&EmployeeID=" + sessionStorage.getItem("userId")).then(
          res => {
            if (res.status == 200) {
              return res.json();
            }
          }
        ).then(json => {
          if (json != null) {
            if (json.length > 0) {
              var MessageData = [];
              for (var i = 0; i < json.length; i++) {
                var FeedTime = (json[i].feedbackTime).toString();
                var orderNo = json[i].orderNo;
                var title = "质量反馈单（" + orderNo + "）审批已完成，请确认";
                if (json[i].isControl != null && json[i].isControl === '1') {
                  title = "质量反馈单（" + orderNo + "）已生成质量控制表(" + orderNo.replace("FK", "KZ") + ")，请确认";
                }
                else {
                  if (json[i].orderType === 0) {
                    if (json[i].prevStatus === 3) {
                      title = "质量反馈单（" + orderNo + "）已退单，请确认";
                    }
                    else {
                      var title = "质量反馈单（" + orderNo + "）审批已完成，请确认";
                    }
                  }
                  else {
                    if (json[i].prevStatus === 3) {
                      title = "质量控制表（" + orderNo + "）已退单，请确认";
                    }
                    else {
                      var title = "质量控制表（" + orderNo + "）审批已完成，请确认";
                    }
                  }
                }
                MessageData.push({
                  title: title,
                  FeedTime: FeedTime.replace("T", " ").substring(0, FeedTime.lastIndexOf(':')),
                  key: orderNo, orderType: json[i].orderType
                });
              }
              this.setState({MessageData:MessageData,Message:true});
              //this.props.dispatch(SetMessageList("0"));
              notification.config({
              placement: 'bottomRight',
            });
              notification.open({
                message: '通知',
                description: '您还有未处理的通知，你处理！！！',
              });
            }
            else {
              //this.setState({ Message: false, MessageList: [],MessageData:[] });
            }
          }
          else {
            //this.setState({ Message: false, MessageList: [] ,MessageData:[]});
          }
        })
      }



    GetServiceConfig()
    {
        fetch(QualityHost + "/api/ConfigInfo"
        ).then(res => {
            if (res.status == 200) {
                return res.json();
            }
        }).then(json => {
           if(json!=null)
            {
                sessionStorage.setItem("ConfirmStepID",json.confirm_StepID);
                sessionStorage.setItem("WaitStepID",json.wait_StepID);
                sessionStorage.setItem("EditStepID",json.editStepID);
            }
        }).catch(err => {
            message.error("获取配置失败:"+err);
        })
    }

    state = {
        collapsed: false,
    };
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }
    
    render() {
    const MsgColumns=[{title:"标题",dataIndex:"title",key:"1"},{title:"时间",dataIndex:"FeedTime",key:"2",fontSize:"6pt"}]

        return (
            <Layout  >
                <Sider style={{ minHeight: '100vh',backgroundColor:"#101010"}}
                    trigger={null}
                    collapsible
                    collapsed={this.state.collapsed}
                    //theme="light" 
                >
                    <div className="logo" />
                    <div style={{ height: "60px", textAlign: "center", verticalAlign: "middle" }}>
                        <span ><img alt="" src="img/Office_Logo.png" style={{ height: "80%", verticalAlign: "middle", marginTop: "5%" }} />
                        <span style={{
                            color: "white", fontSize: "18pt", fontWeight: "600", fontFamily: "cursive", verticalAlign: "text-top",
                            display: this.state.collapsed !== true ? "" : "none"
                        }}>品质管理</span>
                        </span>
                    </div>
                    <Menu
                    theme="dark"  
                    style={{marginTop:"20px",backgroundColor:"#101010"}} mode="inline" defaultOpenKeys={['sub1','sub2','sub3']}
                    inlineCollapsed={this.state.collapsed}
                    >
                        <Menu.SubMenu key="sub1" title={<span><Icon type="tool"/><span>设置维护</span></span>}>
                        <Menu.Item key="CodeMaintenance">
                            <Icon type="form" />
                            <span><NavLink to='/CodeMaintenance' style={{color:"white"}}>编码维护</NavLink></span>
                        </Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu key="sub2" title={<span><Icon type="edit"/><span>质量表单</span></span>}>
                        <Menu.Item key="QualityFeedBack">
                            <Icon type="file-text" />
                            <span><NavLink to='/FormPage/QualityFeedBack' style={{color:"white"}}>质量反馈单</NavLink></span>
                        </Menu.Item>
                        <Menu.Item key="QualityControl">
                            <Icon type="file-text" />
                            <span><NavLink to='/FormPage/QualityControl' style={{color:"white"}}>质量控制表</NavLink></span>
                        </Menu.Item>
                        <Menu.Item key="MaterialInspection" style={{}}>
                            <Icon type="file-text" />
                            <span><NavLink to='/FormPage/MaterialInspection' style={{color:"white"}}>材料检验报告单</NavLink></span>
                        </Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu  key="sub3" title={<span><Icon type="pie-chart"/><span>统计分析</span></span>}>
                        <Menu.Item key="MonthRate">
                            <Icon type="area-chart" />
                            <span><NavLink to='/AnalysisPage/MonthRate' style={{color:"white"}}>合格率统计</NavLink></span>
                        </Menu.Item>
                        <Menu.Item key="Index" style={{}}>
                            <Icon type="area-chart" />
                            <span><NavLink to='/Index' style={{color:"white"}}>反馈单统计</NavLink></span>
                        </Menu.Item>
                        </Menu.SubMenu>
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{ background: '#fff', padding: 0 }}>
                        <div>
                            <div style={{ float: "left" }}><Icon
                                className="trigger"
                                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                onClick={this.toggle}
                            />
                            </div>
                            <div style={{ float: "right", marginRight: "5%" }}>
                                <Menu mode="horizontal" onSelect={(keys)=>{
                                      if (keys.key === "Exit") {
                                        window.location.href = '/'
                                        sessionStorage.clear();
                                        deleteCookie("userName",'/');
                                        deleteCookie("userPass",'/');
                                      }
                                      else if(keys.key=="connect")
                                      {
                                          window.open("http://192.168.1.31/Login");
                                      }
                                }}
                                onClick={(keys)=>{
                                    if(keys.key=="Note")
                                    {
                                      this.setState({ PopoverVisible: true })
                                    }
                                }}
                                >
                                    <Menu.Item key="Note" > 
                                        <Popover
                                            //visible={this.state.PopoverVisible}
                                            title="待办项"
                                            content={
                                             
                                                // <Table dataSource={this.state.MessageData} columns={MsgColumns}
                                                // showHeader={false}
                                                //     size="small" style={{  }} 
                                                //     pagination={{ pageSize: 5 }}>
                                                //     </Table>
                                                <List
                                                size="small"
                                                //header={<div>待办事项</div>}
                                                //footer={<div>Footer</div>}
                                                //bordered
                                                dataSource={this.state.MessageData}
                                                renderItem={item => (
                        
                                                    <List.Item.Meta
                                                    //avatar={}
                                                    title={<a href="javascript:void(0)" onClick={()=>{
                                                        if(item.orderType=="0")
                                                        {
                                                            window.location="/FormPage/QualityFeedBack";
                                                        }
                                                        else
                                                        {
                                                            window.location="/FormPage/QualityControl";
                                                        }
                                                        
                                                    }} >{item.title}</a>}
                                                    description={<div style={{width:"100%",textAlign:"right",borderBottom:"0px solid #808080"}}>{item.FeedTime}</div>}
                                                  />
                                                )}
                                              />

                                            }
                                            placement="bottomRight" 
                                            //trigger="click"
                                            //onVisibleChange={() => { this.setState({ PopoverVisible: !this.state.PopoverVisible }); }}
                                        >
                                            <Badge count={this.state.MessageData.length}>
                                                <Icon type="notification" style={{ fontSize: "15pt" }} />
                                            </Badge>
                                        </Popover>
                                    </Menu.Item>
                                    <Menu.SubMenu className="user" title={<div style={{ clear: "both" }} ><Icon type="user" style={{ fontSize: "15pt" }} />
                                        {sessionStorage.getItem("userName")}
                                    </div>}>
                                        <Menu.Item key="connect"><Icon type="link" />连接到OA系统</Menu.Item>
                                        <Menu.Item key="Exit"><Icon type="logout" />注销</Menu.Item>
                                    </Menu.SubMenu>
                                </Menu>
                            </div>
                        </div>
                    </Header>
                    <Content style={{ margin: '20px 16px', padding:10, background: '#fff', minHeight: 280 ,fontSize:"9pt"}}>

                       
                        {this.props.children}
                    </Content>
                    <Footer>
                        <div style={{fontSize:"8pt",textAlign:"center"}}>React-Admin <span style={{fontSize:"12pt"}}>©</span>Create By 冠华网络部 </div>
                    </Footer>

                </Layout>
            </Layout>
        );
    }
}


// const SiderBarJS=connect(mapStateToProps)(SiderBar)

export default SiderBar;