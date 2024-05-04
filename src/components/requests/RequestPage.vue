<template>
  <v-app id="inspire">
    <v-app-bar v-if="request" :style="{ backgroundColor: 'rgba(25, 118, 210, 0.5)' }">
      <v-app-bar-title>
        Заявка от {{ request.appellant.full_name }}
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn v-if="request.status === 1 & selfRoles().includes(3)" color="green" @click="sentRequestReview(2)">
        <v-icon left>mdi-check-all</v-icon>
        Подтвердить заявку
      </v-btn>
      <v-btn v-if="request.status === 1 & selfRoles().includes(3)" color="red" @click="sentRequestReview(3)">
        <v-icon left>mdi-close</v-icon>
        Отклонить заявку
      </v-btn>
      <v-btn v-if="selfRoles().includes(4) & request.status  !== 4" @click="deleteRequest">
        <v-icon left>mdi-delete</v-icon>
        Удалить заявку
      </v-btn>
    </v-app-bar>

    <v-main>

      <v-container class="fill-height">
        <v-row v-if="!isLoading && request" class="fill-height">
          <!-- Left column for applicant details -->
          <v-col cols="6">
            <v-card elevation="2" class="pa-3">
              <div><strong>Заявитель:</strong> {{ request.appellant.full_name }}</div>
              <div><strong>Причина визита:</strong> {{ request.visit_purpose }}</div>
              <div><strong>Место визита:</strong> {{ request.place_of_visit }}</div>
              <div><strong>Дата визита:</strong> {{ formatDate(request.datetime_of_visit) }}</div>
              <div><strong>Статус заявки:</strong> {{ getStatusName(request.status) }}</div>
            </v-card>
          </v-col>

          <!-- Right column for table that takes full height -->
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
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
import {format, parseISO} from "date-fns";
import VueJwtDecode from 'vue-jwt-decode'

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
        {key: 1, value: 'Еще не явился'},
        {key: 2, value: 'В здании'},
        {key: 3, value: 'Вышел'},
      ],
      statuses: [
        {key: 1, value: 'В ожидании'},
        {key: 2, value: 'Одобрена'},
        {key: 3, value: 'Отклонена'},
        {key: 4, value: 'Удалена'},
      ],
    }
  },
  methods: {
    async getRequest() {
      this.isLoading = true;
      const token = localStorage.getItem("userToken");
      const config = {
        headers: {"Authorization": `Bearer ${token}`},
        params: {
          request_id: this.id
        }
      };
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL + 'requests/' + this.id, config);
        this.request = response.data;
        this.setupTableHeaders();
      } catch (error) {
        console.error("Failed to fetch request:", error);
        // Handle the error appropriately here, e.g., show an error message to the user
      } finally {
        this.isLoading = false;
      }
    },
    setupTableHeaders() {
      const newHeaders = [
          {title: 'ФИО', key: 'full_name'},
          {title: 'Email', key: 'email'},
          {title: 'Номер телефона', key: 'phone_number'},
          {title: 'Иностранец', key: 'is_foreign'},
        ];
      if (this.request.status !== 4) {
        newHeaders.push({title: 'Статус', key: 'visit_status'},)
      }
      this.headers = newHeaders;
    },
    formatDate(datetime) {
      return format(parseISO(datetime), 'd.MM.yyyy H:mm')
    },
    formatBool(bool) {
      if (bool.is_foreign) {
        return 'Да'
      } else {
        return 'Нет'
      }
    },
    formatStatus(value) {
      const status = this.enumStatus.find(status => status.key === value.visit_status);
      if (status) {
        return status.value;
      } else {
        return 'Неизвестный статус'; // Handle unknown statuses
      }
    },
    async sentRequestReview(status) {
      const token = localStorage.getItem("userToken");
      const config = {
        headers: {"Authorization": `Bearer ${token}`},
      };
      try {
        const response = await axios.post(import.meta.env.VITE_API_URL + 'requests/review', {
          request_id: this.id,
          status: status,
        }, config);
        await this.getRequest();
      } catch (error) {
        console.error("Error:", error);
      }
    },
    getStatusName(value) {
      const status = this.statuses.find(status => status.key === value)
      return status.value;
    },
    async deleteRequest() {
      const token = localStorage.getItem("userToken");
      const config = {
        headers: {"Authorization": `Bearer ${token}`},
      };
      try {
        const response = await axios.post(import.meta.env.VITE_API_URL + 'requests/remove', {request_id: this.request.id}, config)
      } catch (error) {
        console.error('Error', error)
      }
      await this.getRequest()
    },
    selfRoles() {
      const userData = VueJwtDecode.decode(localStorage.getItem("userToken"));
      return userData.extras.roles
    }
  },
  mounted() {
    this.getRequest();
  }
}
</script>
