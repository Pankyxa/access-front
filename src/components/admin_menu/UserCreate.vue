<template>
  <v-app>
    <nav-menu>
      <template v-slot:title>Создание пользователя</template>
    </nav-menu>

    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12" style="margin-top: 100px">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Создание пользователя</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form @submit.prevent="userCreate">
                <v-text-field
                  v-model="name"
                  :error-messages="nameErrors"
                  label="ФИО"
                  type="text"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="email"
                  :error-messages="emailErrors"
                  label="Почта"
                  type="email"
                  required
                ></v-text-field>
                <v-combobox
                  v-model="select"
                  :items="role"
                  label="Роль"
                  chips
                  multiple
                  :error-messages="roleErrors"
                  required
                ></v-combobox>
                <v-card-actions>
                  <v-btn color="primary" type="submit">Создать</v-btn>
                </v-card-actions>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios';
import NavMenu from '@/components/NavMenu.vue';

export default {
  name: 'Create',
  components: {NavMenu},
  data() {
    return {
      name: "",
      email: "",
      role: ["Охранник", "Начальник охраны", "Админ"],
      select: [],
      nameErrors: [],
      emailErrors: [],
      roleErrors: [],
      enumRoles: [
        {key: "Охранник", value: 2},
        {key: "Начальник охраны", value: 3},
        {key: "Админ", value: 4},
      ],
    };
  },
  methods: {
    async userCreate() {
      this.nameErrors = [];
      this.emailErrors = [];
      this.roleErrors = [];

      if (!this.name) {
        this.nameErrors.push('Поле ФИО обязательно для заполнения');
      }
      if (!this.email) {
        this.emailErrors.push('Поле Почта обязательно для заполнения');
      }
      if (this.select.length === 0) {
        this.roleErrors.push('Выберите хотя бы одну роль');
      }

      if (this.nameErrors.length === 0 && this.emailErrors.length === 0 && this.roleErrors.length === 0) {
        const token = localStorage.getItem("userToken");
        const config = {headers: {authorization: `Bearer ${token}`}};
        const data = {
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
        };
        await axios.post(
          `${import.meta.env.VITE_API_URL}users/create`,
          data,
          config,
        );
        this.$router.push('/requests');
      }
    },
  },
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
  background: url('src/components/auth/login.png') right top no-repeat fixed, linear-gradient(to right, #211c84, #4684e8) no-repeat;
  background-size: auto 100vh;
}

.v-text-field.error--text {
  color: red;
}
</style>
