<script>
import NavMenu from '/src/components/NavMenu.vue'
import axios from "axios";
import VueJwtDecode from 'vue-jwt-decode'

export default {
  name: 'Users',
  components: {
    NavMenu
  },
  data() {
    return {
      users: [],
      headers: [],
      role: null,
      enumRoles: [
        {key: 'employee', value: "Сотрудник"},
        {key: 'security', value: "Охранник"},
        {key: 'confirming', value: "Начальник охраны"},
        {key: 'admin', value: "Админ"},
      ],
      enumStatus: [
        {key: 1, value: 'В ожидании завершения регистрации'},
        {key: 2, value: 'Активен'},
        {key: 3, value: 'Заблокирован'},
      ],
      rowIndex: null,
      buttonIndex: null,
      userData: null,
      name: "",
      surname: "",
      secondName: "",
      email: "",
      roles: ["Охранник", "Начальник охраны", "Админ"],
      select: [],
      selectRoles: [],
      nameErrors: [],
      surnameErrors: [],
      secondNameErrors: [],
      emailErrors: [],
      roleErrors: [],
      reversedEnumRoles: [
        {key: "Охранник", value: 2},
        {key: "Начальник охраны", value: 3},
        {key: "Админ", value: 4},
      ],
      dialogChanges: false,
      selectUser: null,
      dialogBlock: false,
      dialogUnblock: false,
    }
  },
  methods: {
    async getUsers() {
      try {
        const token = localStorage.getItem('userToken');
        const config = {
          headers: {"Authorization": `Bearer ${token}`},
          params: {
            role: this.role
          }
        };
        const response = await axios.get(import.meta.env.VITE_API_URL + "users/", config);
        this.users = response.data;
        this.setupTableHeaders()
      } catch (error) {
        console.error('error', error)
      }
    },
    setupTableHeaders() {
      const newHeaders = [
        {title: 'ФИО', key: 'full_name'},
        {title: 'Email', key: 'email'},
        {title: 'Роли', key: 'roles'},
        {title: 'Статус', key: 'status'},
        {title: 'Действия', key: 'actions', sortable: false}
      ]
      this.headers = newHeaders
    },
    getStatusName(value) {
      const status = this.enumStatus.find(status => status.key === value.status)
      return status.value;
    },
    getUserData() {
      const userData = VueJwtDecode.decode(localStorage.getItem("userToken"));
      this.userData = userData.extras
    },
    async userCreate() {
      this.nameErrors = [];
      this.surnameErrors = [];
      this.secondNameErrors = [];
      this.emailErrors = [];
      this.roleErrors = [];

      if (!this.surname) {
        this.surnameErrors.push('Поле Фамилия обязательно для заполнения');
      }
      if (!this.name) {
        this.nameErrors.push('Поле Имя обязательно для заполнения');
      }
      if (!this.secondName) {
        this.secondNameErrors.push('Поле Отчество обязательно для заполнения');
      }
      if (!this.email) {
        this.emailErrors.push('Поле Почта обязательно для заполнения');
      }

      if (this.nameErrors.length === 0 && this.surnameErrors.length === 0 && this.secondNameErrors.length === 0 && this.emailErrors.length === 0) {
        const token = localStorage.getItem("userToken");
        const config = {headers: {authorization: `Bearer ${token}`}};
        const data = {
          full_name: this.surname + " " + this.name + " " + this.secondName,
          email: this.email,
          roles: [
            ...[1],
            ...this.select.map((key) => {
              const item = this.reversedEnumRoles.find(
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
      }
      await this.getUsers()
    },
    async changeRoles() {
      const token = localStorage.getItem("userToken");
      const config = {headers: {authorization: `Bearer ${token}`}};
      const data = {
        user_id: this.selectUser.id,
        roles_id: [
          ...[1],
          ...this.selectRoles.map((key) => {
            const item = this.reversedEnumRoles.find(
              (enumItem) => enumItem.key === key,
            );
            return item.value;
          }),
        ]
      }

      await axios.post(`${import.meta.env.VITE_API_URL}roles/update`, data, config)
      await this.getUsers()
    },
    async blockUser() {
      const token = localStorage.getItem("userToken");
      const config = {headers: {authorization: `Bearer ${token}`}};
      const data = {
        user_id: this.selectUser.id,
        roles_id: null,
      }

      await axios.post(`${import.meta.env.VITE_API_URL}roles/update`, data, config)
      await this.getUsers()
    }
  },
  mounted() {
    this.getUsers()
    this.getUserData()
  }
}
</script>

<template>
  <v-app>
    <nav-menu>
      <template v-slot:title>Пользователи</template>
      <template v-slot:actions>
        <v-dialog max-width="1000">
          <template v-slot:activator="{props: activatorProps}">
            <v-btn v-bind="activatorProps" color="green">
              <v-icon left>mdi-plus</v-icon>
              Создать пользователя
            </v-btn>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card class="elevation-12" style="margin-top: 100px">
              <v-card-title>
                Создание пользователя
              </v-card-title>
              <v-card-text>
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
                  v-model="secondName"
                  :error-messages="secondNameErrors"
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
                  :items="roles"
                  label="Роли"
                  chips
                  multiple
                  required
                ></v-combobox>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="green darken-1" @click="userCreate(); isActive.value = false">Создать</v-btn>
                  <v-btn @click="isActive.value = false">Отмена</v-btn>
                </v-card-actions>
              </v-card-text>
            </v-card>
          </template>
        </v-dialog>
      </template>
    </nav-menu>

    <v-main>
      <v-dialog
        v-model="dialogChanges"
        max-width="600"
      >
        <v-card>
          <v-card-title>
            Изменение ролей пользователя
            <strong>
              {{selectUser.full_name.split(' ')[0] + ' ' + selectUser.full_name.split(' ')[1][0] + '.' + selectUser.full_name.split(' ')[2][0] + '.'}}
            </strong>
            <v-tooltip right max-width="450">
              <template v-slot:activator="{ props: tooltip }">
                <v-icon v-bind="tooltip" color="#FFFFFF78" class="me-2" size="small">mdi-information</v-icon>
              </template>
              <span>Укажите какие роли должны быть у данного пользователя (Роль "Сотудник" выдается автоматически)</span>
            </v-tooltip>
          </v-card-title>

          <v-card-text>
            <v-combobox
              v-model="selectRoles"
              :items="roles"
              label="Роли"
              chips
              multiple
              required
            ></v-combobox>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" @click="dialogChanges = false; changeRoles()">Изменить</v-btn>
            <v-btn @click="dialogChanges = false">Отмена</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogBlock" max-width="600">
        <v-card>
          <v-card-title class="headline">Подтвердите действие</v-card-title>
          <v-card-text>Вы уверены, что хотите заблокировать пользовтеля? Он потеряет доступ к сайту.</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" @click="dialogBlock = false; blockUser()">Да</v-btn>
            <v-btn @click="dialogBlock = false">Отмена</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="dialogUnblock"
        max-width="600"
      >
        <v-card>
          <v-card-title>
            Восстановление доступа пользователю
            <strong>
              {{selectUser.full_name.split(' ')[0] + ' ' + selectUser.full_name.split(' ')[1][0] + '.' + selectUser.full_name.split(' ')[2][0] + '.'}}
            </strong>
            <v-tooltip right max-width="450">
              <template v-slot:activator="{ props: tooltip }">
                <v-icon v-bind="tooltip" color="#FFFFFF78" class="me-2" size="small">mdi-information</v-icon>
              </template>
              <span>Укажите какие роли должны быть у данного пользователя (Роль "Сотудник" выдается автоматически)</span>
            </v-tooltip>
          </v-card-title>

          <v-card-text>
            <v-combobox
              v-model="selectRoles"
              :items="roles"
              label="Роли"
              chips
              multiple
              required
            ></v-combobox>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" @click="dialogUnblock = false; changeRoles()">Разблокировать</v-btn>
            <v-btn @click="dialogUnblock = false">Отмена</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-data-table
        :headers="headers"
        :items="users"
        class="fill-height"
      >
        <template v-slot:item.roles="{item}">
          <v-chip v-for="(prop, index) in item.roles" :key="index" class="role-chip">
            {{ enumRoles.find((enumItem) => enumItem.key === prop.name).value }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{item, index}">
          <v-icon
            v-if="item.status === 2 && item.id !== userData?.id"
            size="small"
            class="me-2"
            :style="index === rowIndex && 1 === buttonIndex ? {backgroundColor: '#313131', borderRadius: '50%', width: '30px', height: '30px'}: {borderRadius: '50%', width: '30px', height: '30px'}"
            @click="dialogChanges = true; selectRoles=[]; selectUser=item"
            @mouseover="rowIndex = index; buttonIndex = 1"
            @mouseleave="rowIndex = null; buttonIndex = null"
          >mdi-pencil
          </v-icon>

          <v-icon
            v-if="item.status === 2 && item.id !== userData?.id"
            size="small"
            class="me-2"
            color="red darken-1"
            :style="index === rowIndex && 2 === buttonIndex ? {backgroundColor: '#313131', borderRadius: '50%', width: '30px', height: '30px'}: {borderRadius: '50%', width: '30px', height: '30px'}"
            @click="dialogBlock = true; selectUser=item"
            @mouseover="rowIndex = index; buttonIndex = 2"
            @mouseleave="rowIndex = null; buttonIndex = null"
          >mdi-account-remove
          </v-icon>
          <v-icon
            v-if="item.status === 3 && item.id !== userData?.id"
            size="small"
            class="me-2"
            color="green darken-1"
            :style="index === rowIndex && 2 === buttonIndex ? {backgroundColor: '#313131', borderRadius: '50%', width: '30px', height: '30px'}: {borderRadius: '50%', width: '30px', height: '30px'}"
            @click="dialogUnblock = true; selectUser = item"
            @mouseover="rowIndex = index; buttonIndex = 2"
            @mouseleave="rowIndex = null; buttonIndex = null"
          >mdi-account-remove
          </v-icon>
        </template>
        <template v-slot:item.status="{item}">
          {{ getStatusName(item) }}
        </template>
      </v-data-table>
    </v-main>
  </v-app>
</template>

<style scoped>

</style>
