
import { Layout, Menu, Icon, Badge, Table,message,notification,Input,Tabs,Popover,List } from 'antd';
import React,{Component} from 'react';

class MaterialInspection extends Component
{

    constructor() {
        super();
        this.state = {
        }
    }

    render(){
        return(
            <div class="imgEle___cXgra" style={{ textAlign: "center", verticalAlign: "middle" }} >
                <div style={{marginTop:"10%"}}>
                    <img class="imgBlock___2g-kj" src="../img/303.svg"  style={{marginLeft:"20%",float:"left",minWidth:"200px"}} />
                    <div  class="content___3PvOs" style={{float:"left",marginTop:"6%"}}>
                        <h1 style={{fontSize:"50pt",fontWeight:"600",fontFamily:"-webkit-body"}}>303</h1>
                        <div class="desc___3G5g3" style={{fontSize:"15pt",fontWeight:"600",fontFamily:"-webkit-body",color:"#808080"}} >抱歉，你访问的页面正在建设中</div>
                    </div>
                </div>
            </div>
        )
    }
}

export default MaterialInspection;
