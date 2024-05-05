<template>
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
                <v-btn color="primary" @click="userCreate">Создать</v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import axios from 'axios';

export default {
  name: 'Create',
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
        {key: "Охранник", value: 2},
        {key: "Начальник охраны", value: 3},
        {key: "Админ", value: 4},
      ],
    };
  },
  methods: {
    async userCreate() {
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
</style>



