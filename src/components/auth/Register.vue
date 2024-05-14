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
                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[rules.matchPasswords, rules.required, rules.min]"
                :type="show1 ? 'text' : 'password'"
                @click:append="show1=!show1"
                label="Пароль"
                prepend-icon="mdi-lock"
                required
              ></v-text-field>
              <v-text-field
                v-model="proof_password"
                :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[rules.required, rules.min, rules.matchPasswords]"
                :type="show2 ? 'text' : 'password'"
                @click:append="show2=!show2"
                label="Подтвердите пароль"
                prepend-icon="mdi-lock"
                required
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

export default {
  name: 'Register',
  props: {
    id: {
      type: String,
      required: true
    }
  },


  data() {
    return {
      password: '',
      proof_password: '',
      show1: false,
      show2: false,
      rules: {
        required: value => !!value || 'Введите пароль',
        min: v => v.length >= 8 || 'Минимум 8 символов',
        matchPasswords: v => v === this.password || (`Пароли не совпадают`),

      },
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
