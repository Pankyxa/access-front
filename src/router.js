import {createRouter, createWebHistory} from 'vue-router'
import Login from "@/components/auth/Login.vue";
import Requests from "@/components/requests/Requests.vue";
import Request from "@/components/requests/RequestPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {path: '/', component: Login},
    {path: '/requests', component: Requests},
    {path: '/requests/:id', name: 'requestPage', component: Request, props: true}
  ]
})

export default router;
