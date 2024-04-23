import { createRouter, createWebHistory } from 'vue-router'
import Login from "@/components/auth/Login.vue";
import Requests from "@/components/Requests.vue";

const router = createRouter ({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Login},
    {path: '/requests', component: Requests}
  ]
})

export default router;
