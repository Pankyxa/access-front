<script>
import VueJwtDecode from 'vue-jwt-decode'

export default {
  name: 'NavMenu',
  data() {
    return {
      drawer: false,
      userData: null,
      enumRoles: [
        {key: 1, value: "Сотрудник"},
        {key: 2, value: "Охранник"},
        {key: 3, value: "Начальник охраны"},
        {key: 4, value: "Админ"},
      ],
    };
  },
  methods: {
    redirectToRequests() {
      this.drawer = false;
      this.$router.push("/requests");
    },
    redirectToCreate() {
      this.$router.push("/create");
    },
    getUserData() {
      const userData = VueJwtDecode.decode(localStorage.getItem("userToken")).extras;
      this.userData = userData
    },
    exit() {
      localStorage.removeItem('userToken')
      sessionStorage.removeItem('currentPage')
      sessionStorage.removeItem('filterState')
      this.$router.push('/')
    }
  },
  mounted() {
    this.getUserData()
  }
};
</script>

<template>
  <v-app-bar :style="{ backgroundColor: 'rgba(25, 118, 210, 0.5)' }">
    <v-app-bar-nav-icon v-if="userData.roles.includes(4)" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-app-bar-title>
      <slot name="title"></slot>
    </v-app-bar-title>
    <v-app-bar-title>
      <slot></slot>
    </v-app-bar-title>
    <v-spacer></v-spacer>
    <slot name="actions"></slot>
    <v-menu
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      min-width="290px"
      class="pa-4"
    >
      <template v-slot:activator="{props: menuActivator}">
        <v-btn v-if="userData" v-bind="menuActivator">
          <v-icon left>mdi-account</v-icon>
          {{ userData.full_name.split(' ')[0]+ ' ' + userData.full_name.split(' ')[1][0] + '.' + userData.full_name.split(' ')[2][0] + '.' }}
        </v-btn>
      </template>

      <template v-slot:default="{isActive}">
        <v-card
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-height="320px"
          class="pa-4"
          style="line-height: 1.5; position: relative;"
        >
          <div>
            <strong>ФИО</strong>: {{ userData.full_name }}
          </div>
          <div>
            <strong>Почта</strong>: {{ userData.email }}
          </div>
          <div>
            <strong>Роли</strong>:
            <v-chip v-for="(item, index) in userData.roles" :key="index" class="role-chip">{{ enumRoles.find((enumItem) => enumItem.key === item).value }}</v-chip>
          </div>
          <div style="position: absolute; bottom: 8px; right: 8px;">
            <v-btn color="red" @click="exit">
              <v-icon left>mdi-logout</v-icon>
              Выйти
            </v-btn>
          </div>
        </v-card>
      </template>
    </v-menu>

  </v-app-bar>

  <v-navigation-drawer v-model="drawer" app temporary>
    <v-list>
      <v-list-item link @click="redirectToRequests">
        <v-list-item-icon>
          <v-icon>mdi-format-list-bulleted</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Список заявок</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="userData.roles.includes(4)" link @click="redirectToCreate">
        <v-list-item-icon>
          <v-icon>mdi-account-plus</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Создание пользователя</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="userData.roles.includes(4)" link>
        <v-list-item-icon>
          <v-icon>mdi-account-edit</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Изменение ролей пользователя</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.role-chip {
  margin-bottom: 5px;
  margin-right: 5px;
}
</style>
