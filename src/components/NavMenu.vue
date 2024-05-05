<script>
  export default {
    name: 'NavMenu',
    data() {
      return {
        drawer: false,
        isAdmin: true,
      }
    },
    methods: {
      redirectToRequests() {
        this.drawer=false
        this.$router.push("/requests");
      },
    },
  };
</script>

<template>
    <v-app-bar :style="{ backgroundColor: 'rgba(25, 118, 210, 0.5)' }">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title><slot name="title"></slot></v-app-bar-title>
      <v-spacer></v-spacer>
      <slot name="actions"></slot>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item v-if="isAdmin" link @click="redirectToRequests">
          <v-list-item-icon>
            <v-icon>mdi-format-list-bulleted</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Список всех заявок</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isAdmin" link @click="showForm = true">
          <v-list-item-icon>
            <v-icon>mdi-account-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Создание пользователя</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isAdmin" link>
          <v-list-item-icon>
            <v-icon>mdi-account-edit</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Изменение ролей пользователя</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
</template>

<style scoped>

</style>
