import { createStore } from 'redux';
export function Redecers(action={}, state={auth:false}) {
    switch (action.type) {
        case "SetAuth_Action":
        let backup =state;
        backup["auth"]=action.value;
        return Object.assign({}, state,backup);
        default :
              return Object.assign({}, state);
    }
}

export function mapStateToProps(state, ownProps) {
    return { auth: state.auth!=undefined?state.auth:false }
}

export function mapDispatchToProps(dispatch, ownProps)
{
    return {
        
        ChangeAuth_Action:(auth)=>dispatch({type:"SetAuth_Action",auth:auth})
    }
}

export const Store=createStore(Redecers)
