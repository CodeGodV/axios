import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import store from "../store";

Vue.use(VueRouter);

const routes = [
  {
    path: "/home",
    name: "home",
    component: Home
  },
  {
    path: "/about",
    name: "about",
    meta: {
      // 添加该字段，表示进入这个路由需要登录
      requireAuth: true
    },
    component: () => import("../views/About.vue")
  }
];

// 定义完路由，利用vue-router提供的钩子函数beforeEach()对路由进行判断

router.beforeEach((to, from, next) => {
  if (to.meta.requireAuth) {
    if (store.state.token) {
      next();
    } else {
      next({
        path: "/login",
        query: {
          redirect: to.fullPath
        }
      });
    }
  } else {
    next();
  }
})

const router = new VueRouter({
  mode: "history",
  routes
});

export default router;
