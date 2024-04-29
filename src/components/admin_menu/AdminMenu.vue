<template>
  <v-app>
    <v-app-bar :style="{ backgroundColor: 'rgba(25, 118, 210, 0.5)' }">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Админ меню</v-app-bar-title>
      <v-spacer></v-spacer>
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

    <template v-if="showForm">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Создание пользователя</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <v-text-field
                    v-model="name"
                    label="ФИО"
                    type="text"
                  ></v-text-field>
                  <v-text-field
                    v-model="email"
                    label="Почта"
                    type="email"
                  ></v-text-field>
                  <v-combobox
                    v-model="select"
                    :items="role"
                    label="Роль"
                    chips
                    multiple
                  ></v-combobox>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="userCreate">Создать</v-btn>
                  </v-card-actions>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </v-app>
</template>

<script>
import axios from "axios";

export default {
  name: "Create",
  data() {
    return {
      name: "",
      email: "",
      role: ["Охранник", "Начальник охраны", "Админ"],
      select: [],
      drawer: false,
      isAdmin: true,
      showForm: false,
      enumRoles: [
        { key: "Охранник", value: 2 },
        { key: "Начальник охраны", value: 3 },
        { key: "Админ", value: 4 },
      ],
    };
  },
  methods: {
    redirectToRequests() {
      this.$router.push("/requests");
    },
    async userCreate() {
      const token = localStorage.getItem("userToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          full_name: this.name,
          email: this.email,
          roles: [
            ...[1],
            ...this.select.map((key) => {
              const item = this.enumRoles.find(
                (enumItem) => enumItem.key === key,
              );
              return item.value;
            }),
          ],
        },
      };
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "users/create",
        config,
      );
    },
  },
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
  background:
    url("src/components/auth/login.png") right top no-repeat fixed,
    linear-gradient(to right, #211c84, #4684e8) no-repeat;
  background-size: auto 100vh;
}
</style>
