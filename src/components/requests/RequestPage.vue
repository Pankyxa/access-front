<template>
  <v-app id="inspire">
    <v-app-bar :style="{ backgroundColor: 'rgba(25, 118, 210, 0.5)' }">
      <v-app-bar-title v-if="request">
        Заявка от {{ request.appellant.full_name }}
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn color="green">
        <v-icon left>mdi-check-all</v-icon>
        Подтвердить заявку
      </v-btn>
      <v-btn color="red">
        <v-icon left>mdi-close</v-icon>
        Отклонить заявку
      </v-btn>
      <v-btn>
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
            </v-card>
          </v-col>

          <!-- Right column for table that takes full height -->
          <v-col cols="6" class="d-flex fill-height">
            <v-card class="flex-grow-1 fill-height" title="Гости">
                <v-data-table
                  :headers="headers"
                  :items="request.guests"
                  class="elevation-1"
                  style="width: 100%; height: 80%"
                >
                  <template v-slot:loading>
                    <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
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
      headers: [
        {title: 'ФИО', key: 'full_name'},
        {title: 'Email', key: 'email'},
        {title: 'Номер телефона', key: 'phone_number'},
        {title: 'Иностранец', key: 'is_foreign'},
        {title: 'Статус', key: 'visit_status'},
      ],
    }
  },
  methods: {
    async getRequest() {
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
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(datetime) {
      return format(parseISO(datetime), 'd.MM.yyyy H:mm')
    },
  },
  mounted() {
    this.getRequest();
  }
}
</script>
