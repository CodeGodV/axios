import axios from "axios";
import router from "../router";
import store from "../store/index";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.VUE_APP_BASE_URL;

// 请求拦截器
axios.interceptors.request.use(
  config => {
    // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求头header都加上token，不用每次手动添加
    // 即使本地存在token，也有可能是token过期的，所以在响应拦截器中要对返回状态进行判断
    const token = store.state.token;
    token && (config.headers.Authorization = token);
    return config;
  },
  error => {
    return Promise.error(error);
  }
);

// 相应拦截器
axios.interceptors.response.use(
  response => {
    if (response.status === 200) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  },
  // 服务器状态码不是200的
  error => {
    if (error.response.status) {
      switch (error.response.status) {
        // 401未登录，未登录则跳转登录页面，并携带当前页面的路径，在登录成功后返回当前页面，这一步需要在登录页操作
        case 401:
          router.replace({
            path: "/login",
            query: {
              redirect: router.currentRoute.fullPath
            }
          });
          break;
        // 403token过期，登录过期对用户进行提示，清除本定token和清空vuex中token对象，跳转登录页面
        case 403:
          Toast({
            message: "登录过期，请重新登录",
            duration: 1000,
            forbidClick: true
          });
          // 清除token
          localStorage.removeItem("token");
          store.commit("loginSuccess", null);
          // 跳转登录页面，并将要浏览d的页面fullPath传过去，登录成功后跳转需要访问的页面
          setTimeout(() => {
            router.replace({
              path: "login",
              query: {
                redirect: router.currentRoute.fullPath
              }
            });
          }, 1000);
          break;
        case 404:
          Toast({
            message: "网络请求不存在",
            duration: 1500,
            forbidClick: true
          });
          break;
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

export function get(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params: params
      })
      .then(response => {
        resolve(response);
      })
      .catch(err => {
        reject(err);
      });
  });
}
export function post(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios
      .post(url, data)
      .then(response => {
        resolve(response);
      })
      .catch(err => {
        reject(err);
      });
  });
}
export function patch(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios
      .patch(url, data)
      .then(response => {
        resolve(response);
      })
      .catch(err => {
        reject(err);
      });
  });
}
export function put(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios
      .put(url, data)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}
export function del(url) {
  return new Promise((resolve, reject) => {
    axios
      .delete(url)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}
