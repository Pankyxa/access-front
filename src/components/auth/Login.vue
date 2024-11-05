<template>
  <v-app>
    <v-main>
      <v-dialog v-model="dialog" :width="600">
        <v-card class="elevation-12">
          <v-card-text>Вы были заблокированы. Если вас заблокировали по ошибке, обратитесь к системному администратору
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" @click="dialog = false">Ок</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Вход</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form @submit.prevent="login">
                  <v-text-field
                    v-model="email"
                    label="Email"
                    prepend-icon="mdi-account"
                    type="email"
                    :rules="[rules.required, rules.email]"
                  ></v-text-field>
                  <v-text-field
                    v-model="password"
                    label="Пароль"
                    prepend-icon="mdi-lock"
                    type="password"
                    :rules="[rules.required]"
                  ></v-text-field>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="login">Войти</v-btn>
                  </v-card-actions>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';
import VueJwtDecode from 'vue-jwt-decode';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      userData: null,
      dialog: false,
      rules: {
        required: value => !!value || 'Поле обязательно для заполнения',
        email: value => {
          const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return pattern.test(value) || 'Введите корректный адрес электронной почты';
        }
      },
    };
  },
  methods: {
    async login() {
      if(this.email && this.password) {
        try {
          console.log('Attempting to log in with email:', this.email);
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
            email: this.email,
            password: this.password,
          });
          console.log('Login response:', response.data);
          localStorage.setItem('userToken', response.data.token);
          const userData = VueJwtDecode.decode(localStorage.getItem('userToken'));
          console.log('Decoded user data:', userData);
          this.userData = userData.extras;
          if (this.userData.status === 2) {
            console.log('User status is 2, navigating to /requests');
            this.$router.push('/requests');
          } else if (this.userData.status === 3) {
            console.log('User status is 3, showing dialog');
            this.dialog = true;
          }
        } catch (error) {
          console.error('Login failed', error);
          alert(`Ошибка входа: ${error.message}`);
        }
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
</style>
