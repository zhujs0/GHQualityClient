import React, { Component, Children } from 'react';
//import { Router, Route,IndexRoute} from 'react-router'; 
import { Route, BrowserRouter, Switch, Redirect } from 'react-router-dom';
import LoginJS from './Login';
import SiderBar from './Index';
import Code_Main from './CodeMaintenance';
import Index from './Index';
import Rate from './AnalysisPage/MonthRate';
import QualityFeedBack from './FormPage/QualityFeedBack';
import QualityControl from './FormPage/QualityControl';
import QualityAnalyisi from './AnalysisPage/QualityAnalyisi';
import MaterialInspection from  "./FormPage/MaterialInspection"
import {Provider, connect} from 'react-redux';
import {Redecers,Store, mapStateToProps} from './Reducers';
import { createStore } from 'redux';





class NavRouter extends Component {
    

    constructor(props)
    {
        super(props);
        this.state={
            auth:false
        }
    }

    componentWillMount()
    {
        if(sessionStorage.getItem("token")!=undefined&&sessionStorage.getItem("token")!=null&&sessionStorage.getItem("token")!="")
        {
            this.setState({auth:true});
        }
        // else
        // {
        //     window.location="/";
        // }
    }

//routerWillLeave
    //<Route path="/" exact  component={LoginJS} />
    render() {
        return (
            this.state.auth != true ? (<BrowserRouter><Route  path="/"   component={LoginJS} /></BrowserRouter>)
            : (
                <BrowserRouter>
                    <div>
                        <Index>
                            <Switch >
                                <Route path="/Index" component={QualityAnalyisi} />
                                <Route path="/CodeMaintenance" component={Code_Main} />
                                <Route path="/AnalysisPage/MonthRate" component={Rate} />
                                <Route path="/FormPage/QualityFeedBack" component={QualityFeedBack} />
                                <Route path="/FormPage/QualityControl" component={QualityControl} />
                                <Route path="/FormPage/MaterialInspection" component={MaterialInspection} />
                            </Switch>

                        </Index>
                    </div>
                </BrowserRouter>
            )
        )
    }
}




export default   NavRouter;
