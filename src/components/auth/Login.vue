<template>
  <v-dialog v-bind="dialog">
    <v-card>
      <v-card-text>Вы были заблокированы. Если вас заблокировали по ошибке, обратитесь к системному администратору
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="green darken-1"
          @click="closeTab"
        >Ок
        </v-btn>
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
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Пароль"
                prepend-icon="mdi-lock"
                type="password"
              ></v-text-field>
              <v-card-actions>
                <v-btn color="primary" type="submit" text @click="forgotPasswordDialog = true">Забыли пароль?</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary" type="submit">Войти</v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="forgotPasswordDialog" persistent max-width="500px">
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Восстановление пароля</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="forgotPasswordDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model="forgotPasswordEmail"
            label="Email"
            prepend-icon="mdi-email"
            type="email"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="sendPasswordResetEmail">Готово</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<
<script>
import axios from 'axios';
import VueJwtDecode from 'vue-jwt-decode';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      forgotPasswordDialog: false,
      forgotPasswordEmail: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post(import.meta.env.VITE_API_URL + '/login', {
          email: this.email,
          password: this.password
        });
        console.log('Login successful', response);
        localStorage.setItem('userToken', response.data.token);
        this.$router.push('/requests');
      } catch (error) {
        console.error('Login failed', error);
        alert("Ошибка входа: " + error.message);
      }
    },
    async sendPasswordResetEmail() {
      try {
        console.log('Password reset email sent to:', this.forgotPasswordEmail);
        alert("Вам на почту пришло письмо для восстановления пароля");
        this.forgotPasswordDialog = false;
      } catch (error) {
        console.error('Failed to send password reset email', error);
        alert("Ошибка отправки письма для восстановления пароля: " + error.message);
      }
    },
    closeTab() {
      window.close();
    }
  }
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
  background: url('src/components/auth/login.png') right top no-repeat fixed, linear-gradient(to right, #211c84, #4684e8) no-repeat;
  background-size: auto 100vh;
}
</style>
