<template>
  <v-app id="inspire">
    <v-app-bar v-if="request" :style="{ backgroundColor: 'rgba(25, 118, 210, 0.5)' }">
      <v-btn @click="goBack">
        <v-icon>mdi-arrow-left-bold</v-icon>
      </v-btn>
      <v-app-bar-title>
        <span v-if="!isMobile">Заявка от {{ request.appellant.full_name }}</span>
        <span v-if="isMobile">Заявка</span>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn
        v-if="request.status === 1 && selfRoles().includes(3)"
        color="green"
        @click="confirmAndSendRequestReview(2)"
        class="pr-1 pl-1" min-width="0"
      >
        <v-icon left>mdi-check-all</v-icon>
        <span v-if="!isMobile">Подтвердить заявку</span>
      </v-btn>

      <v-dialog v-model="confirmDialog" max-width="600">
        <v-card>
          <v-card-title class="headline">Подтвердите действие</v-card-title>
          <v-card-text>Среди гостей есть иностранец. Вы уверены, что хотите подтвердить заявку?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" @click="confirmDialog = false; sentRequestReview(2)">Да</v-btn>
            <v-btn @click="confirmDialog = false">Отмена</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog max-width="1000">
        <template v-slot:activator="{props: activator}">
          <v-btn
            v-if="request.status === 1 & selfRoles().includes(3)"
            color="red"
            v-bind="activator"
            class="pr-1 pl-1" min-width="0"
          >
            <v-icon left>mdi-close</v-icon>
            <span v-if="!isMobile">Отклонить заявку</span>
          </v-btn>
        </template>

        <template v-slot:default="{isActive}">
          <v-card>
            <v-card-title>Подтвердите действие</v-card-title>

            <v-card-text>
              <v-textarea label="Опишите причину отказа" variant="outlined" v-model="comment"></v-textarea>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red darken-1" @click="sentRequestReview(3); isActive.value = false; snackbarReject= true">
                Отклонить заявку
              </v-btn>
              <v-btn @click="isActive.value = false">Отмена</v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>

      <v-dialog max-width="1000">
        <template v-slot:activator="{props: activator}">
          <v-btn
            v-if="selfRoles().includes(4) & (request.status === 1 || request.status === 2)"
            v-bind="activator"
            class="pr-1 pl-1" min-width="0"
          >
            <v-icon left>mdi-delete</v-icon>
            <span v-if="!isMobile">Удалить заявку</span>
          </v-btn>
        </template>

        <template v-slot:default="{isActive}">
          <v-card>
            <v-card-title>Подтвердите действие</v-card-title>

            <v-card-text>
              <v-textarea label="Опишите причину удаления" variant="outlined" v-model="comment"></v-textarea>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red darken-1" @click="sentRequestReview(4); isActive.value = false; snackbarDelete = true">
                Удалить заявку
              </v-btn>
              <v-btn @click="isActive.value = false">Отмена</v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>

      <v-menu
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="290px"
        class="pa-4"
      >
        <template v-slot:activator="{props: menuActivator}">
          <v-btn v-if="userData" v-bind="menuActivator" class="pr-1 pl-1" min-width="0">
            <v-icon left>mdi-account</v-icon>
            <span v-if="!isMobile">{{
                userData.full_name.split(' ')[0] + ' ' + userData.full_name.split(' ')[1][0] + '.' + userData.full_name.split(' ')[2][0] + '.'
              }}</span>
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
              <v-chip v-for="(item, index) in userData?.roles" :key="index" class="role-chip">
                {{ enumRoles.find((enumItem) => enumItem.key === item).value }}
              </v-chip>
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

    <v-main>
      <v-snackbar
        v-model="snackbarConfirm"
        timeout="3000"
        class="text-center"
      >Заявка рассмотрена
      </v-snackbar>
      <v-snackbar
        v-model="snackbarDelete"
        timeout="3000"
        class="text-center"
      >Заявка удалена
      </v-snackbar>
      <v-snackbar
        v-model="snackbarReject"
        timeout="3000"
        class="text-center"
      >Заявка отклонена
      </v-snackbar>
      <v-snackbar
        v-model="snackbarCompleted"
        timeout="3000"
        class="text-center"
      >Заявка завершена
      </v-snackbar>


      <v-container class="fill-height">
        <v-row v-if="!isLoading && request  && !isMobile" class="fill-height">
          <v-col cols="6">
            <v-card elevation="2" class="pa-3">
              <div><strong>Заявитель:</strong> {{ request.appellant.full_name }}</div>
              <div><strong>Причина визита:</strong> {{ request.visit_purpose }}</div>
              <div><strong>Место визита:</strong> {{ request.place_of_visit }}</div>
              <div><strong>Дата визита:</strong> {{ formatDate(request.datetime_of_visit) }}</div>
              <div><strong>Статус заявки:</strong> {{ getStatusName(request.status) }}</div>
              <div v-if="request.comment"><strong>Комментарий к заявке:</strong> {{ request.comment }}</div>
            </v-card>
          </v-col>

          <v-col cols="6" class="d-flex fill-height">
            <v-card class="flex-grow-1 fill-height" title="Гости">
              <v-data-table
                :headers="headers"
                :items="request.guests"
                class="elevation-1"
                style="width: 100%; height: 82vh"
              >
                <template v-slot:loading>
                  <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                </template>
                <template v-slot:item.is_foreign="{item}">
                  {{ formatBool(item) }}
                </template>
                <template v-slot:item.visit_status="{item}">
                  {{ formatStatus(item) }}
                </template>
                <template v-slot:item.actions="{item}">
                  <v-btn
                    v-if="item.visit_status === 1"
                    color="green"
                    @click="reviewStatusGuest($event, item, 2)"
                  >Вошел
                  </v-btn>
                  <v-btn
                    v-if="item.visit_status === 2"
                    color="red"
                    @click="reviewStatusGuest($event, item, 3); snackbarCompleted = true"
                  >Вышел
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>


        <template v-if="!isLoading && request  && isMobile" class="fill-height">
          <v-card elevation="2" class="pa-1 ma-1 justify-center" width="100%" height="24%" style="overflow: scroll">
            <div><strong>Заявитель:</strong> {{ request.appellant.full_name }}</div>
            <div><strong>Причина визита:</strong> {{ request.visit_purpose }}</div>
            <div><strong>Место визита:</strong> {{ request.place_of_visit }}</div>
            <div><strong>Дата визита:</strong> {{ formatDate(request.datetime_of_visit) }}</div>
            <div><strong>Статус заявки:</strong> {{ getStatusName(request.status) }}</div>
            <div v-if="request.comment"><strong>Комментарий к заявке:</strong> {{ request.comment }}</div>
          </v-card>

          <v-card class="fill-height ma-1" width="100%" style="max-height: calc(100% - 24%)">
            <v-card-title class="d-flex justify-center align-center" style="height: 56px;">
              <v-pagination
                v-model="page"
                :length="numberOfPages"
                class="pagination-styled"
                :total-visible="1"
              ></v-pagination>
            </v-card-title>
            <v-card-text class="fill-height pr-1 pl-1" style="max-height: calc(100% - 56px); overflow-y: auto;">
              <v-carousel
                hide-delimiter-background
                delimiter-icon="mdi-circle"
                :cycle="false"
                :show-arrows="false"
                class="fill-height"
                :continuous="false"
              >
                <v-carousel-item
                  v-for="(item, index) in paginatedGuests"
                  :key="index"
                >
                  <v-card class="pa-2">
                    <v-list-item class="pl-1 pr-1">
                      <v-list-item-content>
                        <v-list-item-title>ФИО: {{ item.full_name }}</v-list-item-title>
                        <v-list-item-subtitle>Email: {{ item.email }}</v-list-item-subtitle>
                        <v-list-item-subtitle>Номер телефона: {{ item.phone_number }}</v-list-item-subtitle>
                        <v-list-item-subtitle>Иностранец: {{ formatBool(item.is_foreign) }}</v-list-item-subtitle>
                        <v-list-item-subtitle v-if="headers.visit_status">Статус: {{
                            formatStatus(item.visit_status)
                          }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-card-actions v-if="request.status === 2 && item.visit_status !== 3">
                      <v-btn
                        v-if="item.visit_status === 1"
                        color="green"
                        @click="reviewStatusGuest($event, item, 2)"
                      >Вошел
                      </v-btn>
                      <v-btn
                        v-if="item.visit_status === 2"
                        color="red"
                        @click="reviewStatusGuest($event, item, 3); snackbarCompleted = true"
                      >Вышел
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-carousel-item>
              </v-carousel>
            </v-card-text>
          </v-card>
        </template>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
import {format, parseISO} from "date-fns";
import VueJwtDecode from 'vue-jwt-decode';
import {useDisplay} from 'vuetify';

export default {
  name: 'RequestPage',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      request: null,
      isLoading: true,
      headers: [],
      enumStatus: [
        { key: 1, value: 'Еще не явился' },
        { key: 2, value: 'В здании' },
        { key: 3, value: 'Вышел' },
      ],
      statuses: [
        { key: 1, value: 'В ожидании' },
        { key: 2, value: 'Одобрена' },
        { key: 3, value: 'Отклонена' },
        { key: 4, value: 'Удалена' },
        { key: 5, value: 'Завершена' },
      ],
      comment: '',
      confirmDialog: false,
      snackbarConfirm: false,
      snackbarDelete: false,
      snackbarReject: false,
      snackbarCompleted: false,
      isMobile: false,
      page: 1,
      userData: null,
      enumRoles: [
        { key: 1, value: "Сотрудник" },
        { key: 2, value: "Охранник" },
        { key: 3, value: "Начальник охраны" },
        { key: 4, value: "Админ" },
      ],
      itemsPerPage: 5,
    };
  },
  methods: {
    async getRequest() {
      this.isLoading = true;
      const token = localStorage.getItem("userToken");
      const config = {
        headers: { "Authorization": `Bearer ${token}` },
        params: {
          request_id: this.id
        }
      };
      const url = `${import.meta.env.VITE_API_URL}/requests/${this.id}`;
      console.log('Fetching request from URL:', url);
      try {
        const response = await axios.get(url, config);
        console.log('Response data:', response.data);
        this.request = response.data;
        this.setupTableHeaders();
      } catch (error) {
        console.error("Failed to fetch request:", error);
      } finally {
        this.isLoading = false;
      }
    },
    setupTableHeaders() {
      const newHeaders = [
        { title: 'ФИО', key: 'full_name' },
        { title: 'Email', key: 'email' },
        { title: 'Номер телефона', key: 'phone_number' },
        { title: 'Иностранец', key: 'is_foreign' },
      ];
      if (this.request.status === 2 || this.request.status === 5) {
        newHeaders.push({ title: 'Статус', key: 'visit_status' });
      }
      if (this.request.guests.some(guest => guest.visit_status !== 3) && this.request.status === 2 && this.userData?.roles.includes(2)) {
        newHeaders.push({ title: 'Действия', key: 'actions', sortable: false });
      }
      this.headers = newHeaders;
    },
    formatDate(datetime) {
      return format(parseISO(datetime), 'd.MM.yyyy H:mm');
    },
    formatBool(bool) {
      return bool ? 'Да' : 'Нет';
    },
    formatStatus(value) {
      const status = this.enumStatus.find(status => status.key === value.visit_status);
      return status.value;
    },
    async sentRequestReview(status) {
      this.request.status = status;
      this.request.comment = this.comment;
      this.setupTableHeaders();
      console.log('Sending request review with status:', status);
      const token = localStorage.getItem("userToken");
      const config = {
        headers: { "Authorization": `Bearer ${token}` },
      };
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/requests/review`, {
          request_id: this.id,
          status: status,
          comment: this.comment
        }, config);
      } catch (error) {
        console.error("Error:", error);
      }
    },
    async confirmAndSendRequestReview(status) {
      if (this.hasForeignGuests()) {
        this.confirmDialog = true;
      } else {
        await this.sentRequestReview(status);
      }
    },
    hasForeignGuests() {
      return this.request.guests.some(guest => guest.is_foreign);
    },
    getStatusName(value) {
      const status = this.statuses.find(status => status.key === value);
      return status.value;
    },
    selfRoles() {
      const userData = VueJwtDecode.decode(localStorage.getItem("userToken"));
      return userData.extras.roles;
    },
    async reviewStatusGuest(event, item, status) {
      item.visit_status = status;
      if (this.request.guests.every(guest => guest.visit_status === 3)) {
        this.request.status = 5;
      }
      this.setupTableHeaders();

      const token = localStorage.getItem("userToken");
      const config = {
        headers: { "Authorization": `Bearer ${token}` },
      };
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/requests/guests/actions`, {
          guest_id: item.id,
          status: status
        }, config);
      } catch (error) {
        console.error('Error', error);
      }
    },
    goBack() {
      this.$router.push('/requests');
    },
    getUserData() {
      const userData = VueJwtDecode.decode(localStorage.getItem("userToken"));
      this.userData = userData.extras;
    },
    exit() {
      localStorage.removeItem('userToken');
      sessionStorage.removeItem('currentPage');
      sessionStorage.removeItem('filterState');
      this.$router.push('/');
    }
  },
  mounted() {
    this.getUserData();
    this.isMobile = useDisplay().mobile.value;
    this.getRequest();
  },
  computed: {
    numberOfPages() {
      return Math.ceil(this.request?.guests.length / this.itemsPerPage);
    },
    paginatedGuests() {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.request.guests.slice(start, end);
    }
  },
};
</script>
