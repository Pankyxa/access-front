<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Завершение регистрации</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="register">
              <v-text-field
                v-model="password"
                label="Пароль"
                prepend-icon="mdi-lock"
                type="password"
              ></v-text-field>
              <v-text-field
                v-model="proof_password"
                label="Подтвердите пароль"
                prepend-icon="mdi-lock"
                type="password"
              ></v-text-field>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" type="submit">Войти</v-btn>
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
import login from '@/components/auth/Login.vue';

export default {

  name: 'Register',
  computed: {
    login() {
      return login;
    }
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      password: '',
      proof_password: ''
    };
  },

  methods: {
    async register() {
      try {
        const response = await axios.post(import.meta.env.VITE_API_URL + '/register/' + this.id, {
          password: this.password,
        });
        console.log('Proof successful', response);
        localStorage.setItem('userToken', response.data.token);
        this.$router.push('/requests');
      } catch (error) {
        console.error('Proof failed', error);
        alert("Ошибка входа: " + error.message);
      }
    }
  }
};
</script>


<style scoped>
.fill-height {
  height: 100vh;
  background: url('login.png') right top no-repeat fixed, linear-gradient(to right, #211c84, #4684e8) no-repeat;
  background-size: auto 100vh;
}
</style>



