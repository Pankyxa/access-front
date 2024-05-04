import { createRouter, createWebHistory } from 'vue-router'
import Login from "@/components/auth/Login.vue";
import Requests from "@/components/requests/Requests.vue";
import Request from "@/components/requests/RequestPage.vue";
import Confirm from "@/components/confirmation/Confirm.vue";
import AdminMenu from "@/components/admin_menu/AdminMenu.vue";

const router = createRouter ({
  history: createWebHistory(),
  routes: [
    {path: '/', component: Login},
    {path: '/requests', component: Requests},
    {path: '/requests/:id', name: 'requestPage', component: Request, props: true},
    {path: '/confirm/:id', component: Confirm, props: true},
    {path: '/admin_menu', component: AdminMenu}
  ]
})

export default router;
