# Axios封装

```js
/**
 * http配置
 */
// 引入axios以及element ui中的loading和message组件
import axios from 'axios'
import { Loading, Message } from 'element-ui'
// 超时时间
axios.defaults.timeout = 5000
// http请求拦截器
var loadinginstace
axios.interceptors.request.use(config => {
 // element ui Loading方法
 loadinginstace = Loading.service({ fullscreen: true })
 return config
}, error => {
 loadinginstace.close()
 Message.error({
 message: '加载超时'
 })
 return Promise.reject(error)
})
// http响应拦截器
axios.interceptors.response.use(data => {// 响应成功关闭loading
 loadinginstace.close()
 return data
}, error => {
 loadinginstace.close()
 Message.error({
 message: '加载失败'
 })
 return Promise.reject(error)
})
 
export default axios
这样我们就统一处理了http请求和响应的拦截.当然我们可以根据具体的业务要求更改拦截中的处理.
```

```js
/**axios封装
 * 请求拦截、相应拦截、错误统一处理
 */
import axios from 'axios';import QS from 'qs';
import { Toast } from 'vant';
import store from '../store/index'

// 环境的切换
if (process.env.NODE_ENV == 'development') {    
    axios.defaults.baseURL = '/api';
} else if (process.env.NODE_ENV == 'debug') {    
    axios.defaults.baseURL = '';
} else if (process.env.NODE_ENV == 'production') {    
    axios.defaults.baseURL = 'http://api.123dailu.com/';
}

// 请求超时时间
axios.defaults.timeout = 10000;

// post请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

// 请求拦截器
axios.interceptors.request.use(    
    config => {
        // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
        // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
        const token = store.state.token;        
        token && (config.headers.Authorization = token);        
        return config;    
    },    
    error => {        
        return Promise.error(error);    
    })

// 响应拦截器
axios.interceptors.response.use(    
    response => {        
        if (response.status === 200) {            
            return Promise.resolve(response);        
        } else {            
            return Promise.reject(response);        
        }    
    },
    // 服务器状态码不是200的情况    
    error => {        
        if (error.response.status) {            
            switch (error.response.status) {                
                // 401: 未登录                
                // 未登录则跳转登录页面，并携带当前页面的路径                
                // 在登录成功后返回当前页面，这一步需要在登录页操作。                
                case 401:                    
                    router.replace({                        
                        path: '/login',                        
                        query: { redirect: router.currentRoute.fullPath } 
                    });
                    break;
                // 403 token过期                
                // 登录过期对用户进行提示                
                // 清除本地token和清空vuex中token对象                
                // 跳转登录页面                
                case 403:                     
                    Toast({                        
                        message: '登录过期，请重新登录',                        
                        duration: 1000,                        
                        forbidClick: true                    
                    });                    
                    // 清除token                    
                    localStorage.removeItem('token');                    
                    store.commit('loginSuccess', null);                    
                    // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
                    setTimeout(() => {                        
                        router.replace({                            
                            path: '/login',                            
                            query: { 
                                redirect: router.currentRoute.fullPath 
                            }                        
                        });                    
                    }, 1000);                    
                    break; 
                // 404请求不存在                
                case 404:                    
                    Toast({                        
                        message: '网络请求不存在',                        
                        duration: 1500,                        
                        forbidClick: true                    
                    });                    
                break;                
                // 其他错误，直接抛出错误提示                
                default:                    
                    Toast({                        
                        message: error.response.data.message,                        
                        duration: 1500,                        
                        forbidClick: true                    
                    });            
            }            
            return Promise.reject(error.response);        
        }       
    }
);
/** 
 * get方法，对应get请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export const get =(url, ...params)=>{    
    return new Promise((resolve, reject) =>{        
        axios.get(url, {            
            params: params        
        })        
        .then(res => {            
            resolve(res.data);        
        })        
        .catch(err => {            
            reject(err.data)        
        })    
    });
}
/** 
 * post方法，对应post请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export const post = (url,... params) =>{    
    return new Promise((resolve, reject) => {         
        axios.post(url, QS.stringify(...params))        
        .then(res => {            
            resolve(res.data);        
        })        
        .catch(err => {            
            reject(err.data)        
        })    
    });
}
```

```js
const routes = [
    {
        path: '/',
        name: '/',
        component: Index
    },
    {
        path: '/repository',
        name: 'repository',
        meta: {
            requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
        },
        component: Repository
    },
    {
        path: '/login',
        name: 'login',
        component: Login
    }
];
// 定义完路由后，我们主要是利用vue-router提供的钩子函数beforeEach()对路由进行判断。

router.beforeEach((to, from, next) => {
    if (to.meta.requireAuth) {  // 判断该路由是否需要登录权限
        if (store.state.token) {  // 通过vuex state获取当前的token是否存在
            next();
        }
        else {
            next({
                path: '/login',
                query: {redirect: to.fullPath}  // 将跳转的路由path作为参数，登录成功后跳转到该路由
            })
        }
    }
    else {
        next();
    }
})
　　
```

