<template>
  <v-app>
    <v-app-bar :style="{ backgroundColor: 'rgba(25, 118, 210, 0.5)' }">
      <v-app-bar-title>Заявки</v-app-bar-title>
      <v-spacer></v-spacer>

      <v-dialog max-width="1000">
        <template v-slot:activator="{props: activatorProps}">
          <v-btn v-bind="activatorProps" color="green">
            <v-icon left>mdi-plus</v-icon>
            Создать заявку
          </v-btn>
        </template>

        <template v-slot:default="{ isActive }">
          <v-card title="Новая заявка">
            <v-card-text>
              <v-text-field
                label="Место визита"
                v-model="placeOfVisit"
              ></v-text-field>

              <v-text-field
                label="Цель визита"
                v-model="visitPurpose"
              ></v-text-field>

              <v-menu :close-on-content-click="false" v-model="menu">
                <template v-slot:activator="{ props: menuDate }">
                  <v-text-field
                    label="Дата визита"
                    v-bind="menuDate"
                    v-model="datetimeStr"
                  ></v-text-field>
                </template>

                <v-card>
                  <v-card-title>
                    <v-btn icon="mdi-calendar" @click="dateButton"></v-btn>
                    <v-btn icon="mdi-clock" @click="timeButton"></v-btn>
                    <v-btn icon="mdi-check" @click="datetimeSave"></v-btn>
                  </v-card-title>
                  <v-date-picker
                    v-if="datePicker === true"
                    @update:modelValue="dateChange"
                  ></v-date-picker>
                  <v-time-picker
                    v-if="timePicker === true"
                    @update:model-value="timeChange"
                  ></v-time-picker>
                </v-card>
              </v-menu>

              <v-card>
                <v-card-title>
                  Гости
                  <v-tooltip right>
                    <template v-slot:activator="{ props: tooltip }">
                      <v-icon v-bind="tooltip">mdi-information</v-icon>
                    </template>
                    <span>Если количество гостей больше 10, воспользуйтесь загрузкой файла</span>
                  </v-tooltip>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col
                        v-for="(guest, index) in guests"
                        :key="guest.id"
                        cols="12"
                        sm="6"
                      >
                        <div class="d-flex align-center justify-space-between">
                          <v-btn
                            @click="selectGuest(index)"
                            width="flex"
                            :class="{
                              'flex-grow-1':
                                guests.length > 1 &&
                                index === guests.length - 1,
                            }"
                            block
                          >
                            {{ guest.full_name }}
                          </v-btn>
                          <v-btn
                            icon
                            v-if="
                              guests.length > 1 && index === guests.length - 1
                            "
                            @click="removeGuest(index)"
                            color="red"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </v-col>
                      <v-col v-if="guests.length < 10" cols="12" sm="6">
                        <v-btn @click="addGuest" block color="green">
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row v-if="selectedGuest !== null">
                      <v-col cols="12">
                        <h3>Заполните данные для гостя: {{ guests[selectedGuest].full_name }}</h3>
                        <v-text-field v-model="guests[selectedGuest].full_name" label="ФИО"></v-text-field>
                        <v-text-field v-model="guests[selectedGuest].phone_number" label="Телефон"></v-text-field>
                        <v-text-field v-model="guests[selectedGuest].email" label="Почта"></v-text-field>
                        <v-checkbox v-model="guests[selectedGuest].is_foreign" label="Иностранец"></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                text='Создать заявку'
                color="green"
                @click="createRequest(isActive)"
              ></v-btn>
              <v-btn
                text="Отмена"
                @click="isActive.value = false"
              ></v-btn>
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
          <v-btn v-bind="menuActivator">
            <v-icon left>mdi-filter</v-icon>
            Фильтры
          </v-btn>
        </template>

        <template v-slot:default="{isActive}">
          <v-card
            transition="scale-transition"
            offset-y
            min-width="290px"
            class="pa-4"
          >
            <v-text-field
              v-if="selfRoles().includes(2) || selfRoles().includes(3) || selfRoles().includes(4)"
              label="Заявляющий"
              v-model="appellant"
            ></v-text-field>
            <v-text-field
              v-if="selfRoles().includes(2) || selfRoles().includes(3) || selfRoles().includes(4)"
              label="Гость"
              v-model="guest"
            ></v-text-field>

            <v-select v-model="status" label="Статус заявки"
                      :items="['Все', 'В ожидании', 'Одобрена', 'Отклонена', 'Удалена']">
            </v-select>

            <v-btn @click="fetchRequests(isActive)">
              Применить фильтры
            </v-btn>
          </v-card>
        </template>
      </v-menu>
    </v-app-bar>

    <v-main class="fill-height">
      <v-snackbar
        v-model="snackbar"
        :timeout="3000"
      >Ваша заявка успешно отправлена на рассмотрение
      </v-snackbar>
      <v-data-table
        :headers="headers"
        :items="requests"
        class="fill-height"
        :loading="loading"
        @click:row="goToRequestPage"
      >
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

        <template v-slot:item.status="{ item }">
          {{ getStatusName(item) }}
        </template>
        <template v-slot:item.datetime_of_visit="{ item }">
          {{ formatDate(item.datetime_of_visit) }}
        </template>
        <template v-slot:item.guests="{item}">
          {{ item.guests.length }}
        </template>
      </v-data-table>
    </v-main>
  </v-app>
</template>


<script>
import axios from "axios";
import {format, formatISO, parseISO} from "date-fns";
import {VTimePicker} from 'vuetify/labs/VTimePicker'
import {useDate} from 'vuetify'
import moment from "moment";
import VueJwtDecode from 'vue-jwt-decode'

export default {
  name: 'Requests',
  data() {
    return {
      requests: [],
      headers: [],
      currentPage: 1,
      pageSize: 100,
      appellant: '',
      guest: '',
      status: 'В ожидании',
      reversedStatuses: [
        {key: 'В ожидании', value: 1},
        {key: 'Одобрена', value: 2},
        {key: 'Отклонена', value: 3},
        {key: 'Удалена', value: 4},
        {key: 'Все', value: null}
      ],
      statuses: [
        {key: 1, value: 'В ожидании'},
        {key: 2, value: 'Одобрена'},
        {key: 3, value: 'Отклонена'},
        {key: 4, value: 'Удалена'},
      ],
      dateTimeString: '',
      menu: false,
      date: null,
      placeOfVisit: '',
      visitPurpose: '',
      guests: [{full_name: 'Гость 1', email: '', phone_number: '', is_foreign: false}],
      selectedGuest: null,
      datePicker: true,
      timePicker: false,
      timeStr: '',
      dateStr: '',
      datetimeStr: '',
      snackbar: false,
      filterMenu: false,
      loading: true
    };
  },
  methods: {
    async fetchRequests(isActive = null) {
      this.loading = true
      try {
        const token = localStorage.getItem("userToken");
        const config = {
          headers: {"Authorization": `Bearer ${token}`},
          params: {
            status: this.reversedStatuses.find(status => status.key === this.status).value,
            full_name: this.guest,
            appellant: this.appellant,
          }
        };
        const response = await axios.get(import.meta.env.VITE_API_URL + "/requests", config);
        this.requests = response.data
        this.loading = false
        if (isActive) {
          isActive.value = false
        }

        // Динамическая настройка заголовков таблицы
        this.setupTableHeaders();
      } catch (error) {
        console.error("Error", error);
        alert(error.message);
      }
    },
    setupTableHeaders() {
      // Определяем, нужно ли добавить колонку "Рассмотрел"
      const hasConfirmingColumn = this.requests.some(request => request.confirming && request.confirming.full_name);

      // Создаем новый массив заголовков таблицы
      const newHeaders = [
        {title: 'Заявитель', key: 'appellant.full_name'},
        {title: 'Место визита', key: 'place_of_visit'},
        {title: 'Причина визита', key: 'visit_purpose'},
        {title: 'Дата визита', key: 'datetime_of_visit'},
        {title: 'Количество гостей', key: 'guests'},
        {title: 'Статус', key: 'status'},
      ];

      // Добавляем колонку "Рассмотрел", если нужно
      if (hasConfirmingColumn) {
        newHeaders.push({title: 'Рассмотрел', key: 'confirming.full_name'});
      }

      // Присваиваем новый массив заголовков таблицы
      this.headers = newHeaders;
    },
    formatDate(datetime) {
      return format(parseISO(datetime), 'd.MM.Y H:mm')
    },
    addGuest() {
      const newId = this.guests.length + 1;
      this.guests.push({full_name: 'Гость ' + newId, email: '', phone_number: '', is_foreign: false});
    },
    removeGuest(index) {
      this.guests.splice(index, 1);
      this.selectedGuest = null; // Reset the selection after deletion
    },
    selectGuest(index) {
      this.selectedGuest = index;
    },
    dateButton() {
      this.datePicker = true
      this.timePicker = false
    },
    timeButton() {
      this.datePicker = false
      this.timePicker = true
    },
    timeChange(value) {
      this.timeStr = value
    },
    dateChange(value) {
      const formattedDate = format(new Date(value), 'yyyy-MM-dd');
      this.dateStr = formattedDate
      this.datePicker = false
      this.timePicker = true
    },
    datetimeSave() {
      if (this.dateStr && this.timeStr) {
        this.datetimeStr = this.dateStr + ' ' + this.timeStr
        this.menu = false
      }
    },
    getStatusName(value) {
      const status = this.statuses.find(status => status.key === value.status)
      return status.value;
    },
    async createRequest(isActive) {
      const token = localStorage.getItem("userToken")
      const config = {
        headers: {"Authorization": `Bearer ${token}`},
      }
      try {
        const response = await axios.post(import.meta.env.VITE_API_URL + '/requests/create', {
          guests: this.guests,
          visit_purpose: this.visitPurpose,
          place_of_visit: this.placeOfVisit,
          datetime_of_visit: moment(this.datetimeStr).toISOString()
        }, config);
        if (response) {
          this.fetchRequests()
          this.selectedGuest = null
          this.visitPurpose = ''
          this.placeOfVisit = ''
          this.datetimeStr = ''
          this.guests = [{full_name: 'Гость 1', email: '', phone_number: '', is_foreign: false}]
          isActive.value = false
          this.snackbar = true
        }
      } catch (error) {
        console.error("Error", error);
        alert(error.message);
      }
    },
    goToRequestPage(event, item) {
      this.$router.push('requests/' + item.item.id);
    },
    selfRoles() {
      const userData = VueJwtDecode.decode(localStorage.getItem("userToken"));
      return userData.extras.roles
    }
  },
  mounted() {
    this.fetchRequests()
  },
  components: {
    VTimePicker,
  },
}
</script>


<style scoped>
.v-data-table__wrapper {
  padding-bottom: 0 !important; /* Удаляем нижний отступ */
}
</style>
