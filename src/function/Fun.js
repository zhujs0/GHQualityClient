import 'whatwg-fetch';
/**添加设置cookie**/
export function addCookie(name, value, days, path) {
    //escape(name)对特殊字符在进行转码
    //可以使用 unescape() 对 escape() 编码的字符串进行解码
    //应用使用 decodeURI() 和 decodeURIComponent() 替代unescape() 
    var name = name;
    var value = value;
    var expires = new Date();
    expires.setTime(expires.getTime() + days * 3600000 * 24);
    //path=/，表示cookie能在整个网站下使用，path=/temp，表示cookie只能在temp目录下使用   
    path = path == "" ? "" : ";path=" + path;
    //GMT(Greenwich Mean Time)是格林尼治平时，现在的标准时间，协调世界时是UTC  
    //参数days只能是数字型  
    var _expires = (typeof days) == "string" ? "" : ";expires=" + expires.toUTCString();
    document.cookie = name + "=" + value + _expires + path;
}

/**获取cookie的值，根据cookie的键获取值**/
export function getCookieValue(name) {
    //用处理字符串的方式查找到key对应value  
    var name = name;
    //读cookie属性，这将返回文档的所有cookie  
    var allcookies = document.cookie;
    //查找名为name的cookie的开始位置  
    name += "=";
    var pos = allcookies.indexOf(name);
    //如果找到了具有该名字的cookie，那么提取并使用它的值  
    if (pos != -1) {                                             //如果pos值为-1则说明搜索"version="失败  
        var start = pos + name.length;                  //cookie值开始的位置  
        var end = allcookies.indexOf(";", start);        //从cookie值开始的位置起搜索第一个";"的位置,即cookie值结尾的位置  
        if (end == -1) end = allcookies.length;        //如果end值为-1说明cookie列表里只有一个cookie  
        var value = allcookies.substring(start, end); //提取cookie的值  
        return (value);                           //对它解码        
    } else {  //搜索失败，返回空字符串  
        return "";
    }
}

/**根据cookie的键，删除cookie，其实就是设置其失效**/
export function deleteCookie(name, path) {
    var name = name;
    var expires = new Date(0);
    path = path == "" ? "" : ";path=" + path;
    document.cookie = name + "=" + ";expires=" + expires.toUTCString() + path;
}

/**根据字段名称去获取url对应的字段值**/
export function GetQueryString(name) {
    //window.location.search.substr(1)//获取Url问号之后的字符
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]); return null;
}

/*根基Parm字符串参数查找name字段对应的值*/
export function GetParmValue(Parm, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = Parm.match(reg);
    if (r != null) return decodeURI(r[2]); return null;
}

export function LoginPromise(FetchUrl, userName, userPass, ClientId) {
    return new Promise((resolve, reject) => {
        var details = {
            'client_id': ClientId,
            'grant_type': 'password',
            'username': userName,
            'password': userPass
        };
        var formBody = [];
        for (var item in details) {
            var encodedKey = encodeURIComponent(item);
            var encodedValue = encodeURIComponent(details[item]);
            formBody.push(encodedKey + '=' + encodedValue);
        }
        formBody = formBody.join("&");
        fetch(FetchUrl,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: formBody
            }
        ).then(result => {
            if (result.ok === true) {
                return result.json();
            }
            else {
                return null;
            }
        }).then(
            json => {
                if (json != null) {
                    var values = (json['access_token']).split(',');
                    var token = {
                        token_type: json['token_type'],
                        token: values[0],
                        userName: values[1],
                        userId: values[2],
                    };
                    resolve(token);
                }
                else {
                    reject(null);
                }
            }
            )
            .catch(err => {
                reject("服务器出错！");
            })
    })
}

export function GetUserInfoPromise(FetchUrl,userId)
{
    return new Promise((resolve, reject) => {
        fetch(FetchUrl + "/api/Employee?EmployeeNo=" + userId)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                }
            })
            .then(json => {
                if (json != null) {
                    resolve(json);
                }
                else {
                    reject(null);
                }
            }).catch(err => {
                reject(err);
            })
    })
    
}

/**
 * 时间格式转换
 * @param {*} fmt 
 */
Date.prototype.format = function(fmt) { 
    var o = { 
       "M+" : this.getMonth()+1,                 //月份 
       "d+" : this.getDate(),                    //日 
       "h+" : this.getHours(),                   //小时 
       "m+" : this.getMinutes(),                 //分 
       "s+" : this.getSeconds(),                 //秒 
       "q+" : Math.floor((this.getMonth()+3)/3), //季度 
       "S"  : this.getMilliseconds()             //毫秒 
   }; 
   if(/(y+)/.test(fmt)) {
           fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
   }
    for(var k in o) {
       if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
   return fmt; 
}    




