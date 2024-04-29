import { createRouter, createWebHistory } from 'vue-router'
import Login from "@/components/auth/Login.vue";
import Requests from "@/components/Requests.vue";
import Confirm from "@/components/confirmation/Confirm.vue";
import UserCreate from "@/components/admin_menu/UserCreate.vue";
import AdminMenu from "@/components/admin_menu/AdminMenu.vue";

const router = createRouter ({
  history: createWebHistory(),
  routes: [
    {path: '/', component: Login},
    {path: '/requests', component: Requests},
    {path: '/confirm', component: Confirm},
    {path: '/admin_menu', component: AdminMenu}
  ]
})

export default router;
