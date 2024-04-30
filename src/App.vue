<template>
  <v-app>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup>
  import Login from "@/components/auth/Login.vue";
  import Requests from "@/components/requests/Requests.vue";
</script>
