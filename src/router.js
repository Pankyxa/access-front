import {createRouter, createWebHistory} from 'vue-router';
import Login from "@/components/auth/Login.vue";
import Requests from "@/components/requests/Requests.vue";
import Request from "@/components/requests/RequestPage.vue";
import Register from "@/components/auth/Register.vue";
import AdminMenu from "@/components/admin_menu/AdminMenu.vue";
import UserCreate from '@/components/admin_menu/UserCreate.vue';
import VueJwtDecode from 'vue-jwt-decode';
import Users from "@/components/users/Users.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {path: '/', component: Login},
    {path: '/requests', component: Requests},
    {path: '/requests/:id', name: 'requestPage', component: Request, props: true},
    {path: '/register/:id', component: Register, props: true},
    {path: '/admin_menu', component: AdminMenu},
    {path: '/create', component: UserCreate},
    {path: '/users', component: Users},
  ]
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('userToken');
  let userData = null;

  if (token) {
    const decodeToken = VueJwtDecode.decode(token);
    userData = decodeToken.extras;
  }

  console.log('Navigating from:', from.path, 'to:', to.path);

  if (!token || isTokenExpired(token)) {
    console.log('Token is invalid or expired. Redirecting to login...');
    if (to.path !== '/') {
      localStorage.removeItem('userToken');
      sessionStorage.removeItem('currentPage');
      sessionStorage.removeItem('filterState');
      next({ path: '/' });
    } else {
      next();
    }
  } else {
    if (userData?.status === 3) {
      console.log('User is blocked. Redirecting to login...');
      if (to.path !== '/') {
        localStorage.removeItem('userToken');
        sessionStorage.removeItem('currentPage');
        sessionStorage.removeItem('filterState');
        next({ path: '/' });
      } else {
        next();
      }
    } else {
      console.log('Token is valid. Continuing navigation.');
      next();
    }
  }
});

function isTokenExpired(token) {
  const userData = VueJwtDecode.decode(token);
  return userData.exp < Math.floor(Date.now() / 1000);
}

export default router;
