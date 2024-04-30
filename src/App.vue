<template>
  <v-app>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup>
import axios from "axios";

// axios.defaults.withCredentials = true;
import Login from "@/components/auth/Login.vue";
import Requests from "@/components/Requests.vue";
</script>
