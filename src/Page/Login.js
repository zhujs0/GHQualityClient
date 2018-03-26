import React from 'react';
import { Layout, Icon, Input, Switch, Button, message } from 'antd';
import { addCookie, GetQueryString, getCookieValue, GetParmValue,LoginPromise, GetUserInfoPromise } from '../function/Fun';
import { ClientId, TokenPath, QualityHost } from './config';
import 'whatwg-fetch';
import { Base64 } from 'js-base64';
import $ from 'jquery';
import {mapDispatchToProps,mapStateToProps} from './Reducers';
import connect from 'react-redux/lib/connect/connect';
import {ChangeAuth_Action} from './ReduxAction';

const SessionKeepTime = 3600 //单位秒
const CookieKeepTime=7  //单位天
class LoginJS extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            UserName: "", PassWord: "", checked: false,
            iconLoading: false
        }
    }
    componentDidMount()
    {
        $("#UserName").focus();
        var userName=this.state.UserName;
        var userPass=this.state.PassWord;
        window.addEventListener('keydown', function(e){
            if(e.keyCode===13)
            {
                if(userPass.trim()==="")
                {
                    $("#PassWord").focus();
                    return;
                }

                if (userName !== "" && userPass !== "") {
                    this.setState({ iconLoading: true });
                    if (userName.length === 7) {
                        userName = userName.slice(2);
                    }
                    LoginPromise(TokenPath,userName,Base64.encode(userPass),ClientId).then(
                        (data)=>{
                            console.table(data);
                            GetUserInfoPromise(QualityHost,data.userId).then(
                                (info)=>{
                                    this.SetSession(data.userName, data.userId, JSON.stringify(data), SessionKeepTime);
                                    if (this.state.checked) {
                                        this.RemeberUser(userName, userPass)
                                    }
                                    var DeptID=info.deptID;
                                    sessionStorage.setItem("deptID",DeptID);
                                    window.location.href = '/Index';
                                }
                            ).catch(err=>{
                                message.error("连接服务器错误!");
                            })
                          
                        }
                    ).catch(err=>{
                        if(err===null)
                        {
                            message.warning("账号密码出错");
                        }
                        else
                        {
                            message.error("连接服务器错误!");
                        }
                        this.setState({ iconLoading: false });
                        console.error("err",err)
                    })
                }
                else
                {
                    message.warning("请输入账号密码");
                }
            }
        })
    }


    componentWillMount() {


        //验证是否保存了账号信息或者从其他链接跳转
        if (getCookieValue('userName') !== '' && getCookieValue('userPass') !== '') {
            //记住密码-自动登录
            var userName = getCookieValue('userName');
            var PassWord = getCookieValue('userPass');
            this.Login(userName,PassWord);
        }
        else if (GetQueryString("inf") !== null) {
            //免登陆
            var ParmString = encodeURIComponent(GetQueryString('inf'));
            var userName = GetParmValue(ParmString, 'userName');
            var userId = GetParmValue(ParmString, "userId");
            var token = GetParmValue(ParmString, "token");
            if(userId==null||token==null)
            {
                message.error("登录异常！,请输入账号密码登录");
                return;
            }
            GetUserInfoPromise(QualityHost, userId).then(
                (info) => {
                    this.SetSession(userName, userId, token, SessionKeepTime);
                    var DeptID = info.deptID;
                    sessionStorage.setItem("deptID", DeptID);
                    window.location.href = '/Index';
                }
            ).catch(err => {
                if (err != null) {
                    message.error("连接服务器出错！请联系管理员！");
                }
                else {
                    message.error("找不到该用户的相关信息！无法自动登录");
                }
            })
        }
        else {
            return;
        }

    }


    SetSession(userName, userId, token, KeepTime) {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("userName", userName);
    }




    Login(userName, userPass) {
        if (userName !== "" && userPass !== "") {
            this.setState({ iconLoading: true });
            if (userName.length === 7) {
                userName = userName.slice(2);
            }
            LoginPromise(TokenPath,userName,Base64.encode(userPass),ClientId).then(
                (data)=>{
                    console.table(data);
                    GetUserInfoPromise(QualityHost,data.userId).then(
                        (info)=>{
                            this.SetSession(data.userName, data.userId, JSON.stringify(data), SessionKeepTime);
                            if (this.state.checked) {
                                this.RemeberUser(userName, userPass)
                            }
                            var DeptID=info.deptID;
                            sessionStorage.setItem("deptID",DeptID);
                            window.location.href = '/Index';
                        }
                    ).catch(err=>{
                        message.error("连接服务器错误!");
                    })
                  
                }
            ).catch(err=>{
                if(err===null)
                {
                    message.warning("账号密码出错");
                }
                else
                {
                    message.error("连接服务器错误!");
                }
                this.setState({ iconLoading: false });
                console.error("err",err)
            })
        }
        else
        {
            message.warning("请输入账号密码");
        }
    }

    RemeberUser(userName, userPass) {
        addCookie("userName", userName, CookieKeepTime, "/");
        addCookie("userPass", userPass, CookieKeepTime, "/");
    }

    render() {
        var headImg = {
            marginTop: "5%",
            marginBottom: "44px",
            position: 'relative',
            marginLeft: "26%",
            //left:"50%",  
            //left:"56px"   
        }
        return (
            <Layout style={{ minHeight: '100vh', backgroundImage: "url(img/background.jpg)", backgroundRepeat: "round" }} >
                <Layout.Content >
                    <div style={{ textAlign: "center", width: "100%", marginTop: "10%", marginBottom: "25px" }}><img src="img/login.png" /></div>
                    <div style={{ textAlign: "center", width: "100%" }}>
                        <Input
                            id="UserName" placeholder="请输入账号"
                            value={this.state.UserName}
                            onChange={(e) => {
                                this.setState({ UserName: e.target.value })
                            }}
                            onPressEnter={() => {
                                $("#PassWord").focus();
                            }}
                            prefix={<Icon type="user" style={{ fontSize: "15pt", color: 'rgba(0,0,0,.25)' }} />}
                            style={{ width: "20%", minWidth: "200px", marginBottom: "15px", height: "40px" }} /></div>
                    <div style={{ textAlign: "center" }}>
                        <Input value={this.state.PassWord}
                            placeholder="请输入密码"
                            id="PassWord"
                            type="password"
                            onChange={(e) => {
                                this.setState({ PassWord: e.target.value })
                            }}
                            onPressEnter={() => { this.Login(this.state.UserName, this.state.PassWord); }}

                            style={{ width: "20%", minWidth: "200px", height: "40px", marginBottom: "15px" }}
                            prefix={<Icon type="lock" style={{ fontSize: "15pt", color: 'rgba(0,0,0,.25)' }} />} />
                    </div>
                    <div style={{ textAlign: "center", width: "100%" }}>
                        <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}
                            checked={this.state.checked}
                            onChange={(value) => {
                                this.setState({ checked: value })
                            }} /><span>  记住我</span>
                        <Button style={{ width: "13%", marginLeft: "20px" }} type="primary"
                            icon="login" loading={this.state.iconLoading}
                            onClick={() => {
                                this.Login(this.state.UserName, this.state.PassWord);
                            }}
                        >登录</Button>
                    </div>
                </Layout.Content>
                <Layout.Footer style={{ backgroundImage: "url(img/background.jpg)", backgroundRepeat: "round" }}>
                    <div style={{ fontSize: "8pt", textAlign: "center" }}>React-Admin <span style={{ fontSize: "12pt" }}>©</span>Create By 冠华网络部 </div>
                </Layout.Footer>
            </Layout>
        )
    }
}
const Login=connect(mapStateToProps)(LoginJS)
export default Login;