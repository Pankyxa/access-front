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
                  v-model="surname"
                  :error-messages="surnameErrors"
                  label="Фамилия"
                  type="text"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="name"
                  :error-messages="nameErrors"
                  label="Имя"
                  type="text"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="secondname"
                  :error-messages="secondnameErrors"
                  label="Отчество"
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
      surname: "",
      secondname: "",
      email: "",
      role: ["Охранник", "Начальник охраны", "Админ"],
      select: [],
      nameErrors: [],
      surnameErrors: [],
      secondnameErrors: [],
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
      this.surnameErrors = [];
      this.secondnameErrors = [];
      this.emailErrors = [];
      this.roleErrors = [];

      if (!this.surname) {
        this.surnameErrors.push('Поле Фамилия обязательно для заполнения');
      }
      if (!this.name) {
        this.nameErrors.push('Поле Имя обязательно для заполнения');
      }
      if (!this.secondname) {
        this.secondnameErrors.push('Поле Отчество обязательно для заполнения');
      }
      if (!this.email) {
        this.emailErrors.push('Поле Почта обязательно для заполнения');
      }

      if (this.nameErrors.length === 0 && this.surnameErrors.length === 0 && this.secondnameErrors.length === 0 && this.emailErrors.length === 0) {
        const token = localStorage.getItem("userToken");
        const config = {headers: {authorization: `Bearer ${token}`}};
        const data = {
          full_name: this.surname + " " + this.name + " " + this.secondname,
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
