<template>
  <v-app>
    <nav-menu>
      <template v-slot:title>Заявки</template>
      <template v-slot:actions>
        <v-dialog max-width="1000">
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" color="green" class="pr-1 pl-1" min-width="0">
              <v-icon left>mdi-plus</v-icon>
              <span v-if="!isMobile">Создать заявку</span>
            </v-btn>
          </template>

          <template v-slot:default="{ isActive }">
            <v-snackbar
              v-model="snackbarDownload"
              timeout="3000"
            >Шаблон успешно скачан
            </v-snackbar>
            <v-card title="Новая заявка">
              <v-card-text>
                <v-text-field
                  label="Место визита"
                  v-model="placeOfVisit"
                  :rules="[rules.required]"
                ></v-text-field>

                <v-text-field
                  label="Цель визита"
                  v-model="visitPurpose"
                  :rules="[rules.required]"
                ></v-text-field>

                <v-menu :close-on-content-click="false" v-model="menu">
                  <template v-slot:activator="{ props: menuDate }">
                    <v-text-field
                      label="Дата визита"
                      v-bind="menuDate"
                      v-model="datetimeStr"
                      :rules="[rules.required]"
                      readonly
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
                      format="24hr"
                      title="Выберите время"
                    ></v-time-picker>
                  </v-card>
                </v-menu>

                <v-card v-if="guestCard">
                  <v-card-title>
                    <div style="display: flex; align-items: center; width: 100%;">
                      <div>
                        Гости
                        <v-tooltip v-if="!isMobile" right>
                          <template v-slot:activator="{ props: tooltip }">
                            <v-icon v-bind="tooltip">mdi-information</v-icon>
                          </template>
                          <span>Если количество гостей больше 10, воспользуйтесь загрузкой файла</span>
                        </v-tooltip>
                      </div>
                      <v-btn v-if="!isMobile" color="primary" style="margin-left: auto;" @click="guestCard=false">
                        <v-icon size="small">mdi-upload</v-icon>
                        Загрузка файлом
                      </v-btn>
                    </div>
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col
                          v-for="(guest, index) in guests"
                          :key="guest.id"
                          cols="12"
                          :sm="guests.length > 1 && index === guests.length - 1 ? 5 : 6"
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
                          </div>
                        </v-col>
                        <v-col
                          cols="12"
                          sm="1"
                          v-if="guests.length > 1"
                        >
                          <v-btn
                            min-width="51px"
                            max-width="51px"
                            @click="removeGuest(guest.length - 1)"
                            color="red"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
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
                          <v-text-field v-model="guests[selectedGuest].full_name" label="ФИО"
                                        :rules="[rules.required]"></v-text-field>
                          <v-text-field
                            v-model="guests[selectedGuest].phone_number"
                            label="Телефон"
                            :rules="[rules.required]"
                          ></v-text-field>
                          <v-text-field v-model="guests[selectedGuest].email" label="Почта"
                                        :rules="[rules.required, rules.email]"></v-text-field>
                          <v-checkbox v-model="guests[selectedGuest].is_foreign" label="Иностранец"></v-checkbox>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                </v-card>

                <v-card v-if="!guestCard">
                  <v-card-title>
                    <div style="display: flex; align-items: center; width: 100%;">
                      <div>
                        Загрузите файл
                      </div>
                      <v-btn color="green darken-1" class="me-2" style="margin-left: auto;" @click="downloadExample">
                        <v-icon size="small">mdi-upload</v-icon>
                        Скачать шаблон
                      </v-btn>
                      <v-btn color="primary" @click="guestCard=true">
                        <v-icon size="small">mdi-pencil</v-icon>
                        Заполнить вручную
                      </v-btn>
                    </div>
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-container>
                        <v-list>
                          <v-list-item-title>
                            Интрукция
                          </v-list-item-title>
                          <v-list-item>
                            В колонке "Телефон" не указывайте добавочный код страны, он указывается автоматически
                          </v-list-item>
                          <v-list-item>
                            В колонке "Иностранец" напишите "Да" или "Нет" в зависимости от гражданства гостя
                          </v-list-item>
                          <v-list-item>
                            Сохраните файл в формате .csv
                            <v-list-item-subtitle>Файл -> Сохранить как -> CSV UTF-8 (разделитель запятая) (.csv)
                            </v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                      </v-container>
                      <v-file-input
                        v-model="file"
                        accept="file/csv"
                        :rules="[rules.required, rules.download]"
                        required
                      ></v-file-input>
                      Загрузите ваш файл в формате .csv utf-8 (разделитель - запятая)
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
                  @click="isActive.value = false; guests = [{full_name: 'Гость 1', email: '', phone_number: '', is_foreign: false}]"
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
          <template v-slot:activator="{ props: menuActivator }">
            <v-btn v-bind="menuActivator" class="pr-1 pl-1" min-width="0">
              <v-icon left>mdi-filter</v-icon>
              <span v-if="!isMobile">Фильтры</span>
            </v-btn>
          </template>

          <template v-slot:default="{ isActive }">
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

              <v-select v-model="status" label="Статус заявок"
                        :items="['Все', 'В ожидании', 'Одобренные', 'Отклонённые', 'Завершённые', 'Удалённые']">
              </v-select>

              <v-btn @click="fetchRequests(isActive)">
                Применить фильтры
              </v-btn>
            </v-card>
          </template>
        </v-menu>
      </template>
    </nav-menu>

    <v-main class="fill-height">
      <v-snackbar
        v-model="snackbar"
        :timeout="3000"
        class="text-center"
      >Ваша заявка успешно отправлена на рассмотрение
      </v-snackbar>

      <v-data-table
        v-if="!isMobile"
        :headers="headers"
        :items="requests"
        class="fill-height"
        :loading="loading"
        @update:page="updatePage"
        :page="page"
      >
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

        <template v-slot:item="{ item, index }">
          <tr
            :style="index === rowIndex ? { backgroundColor: '#313131' } : {}"
            @click="goToRequestPage($event, item)"
            @mouseover="rowIndex = index"
            @mouseleave="rowIndex = null"
            class="v-data-table__tr v-data-table__tr--clickable"
          >
            <td>{{ item.appellant.full_name }}</td>
            <td>{{ item.place_of_visit }}</td>
            <td>{{ item.visit_purpose }}</td>
            <td>{{ formatDate(item.datetime_of_visit) }}</td>
            <td>{{ item.guests.length }}</td>
            <td>{{ getStatusName(item) }}</td>
            <td v-if="item.confirming">{{ item.confirming.full_name }}</td>
            <td v-else-if="headers.some(header => header.title === 'Рассмотрел')"></td>
          </tr>
        </template>
      </v-data-table>

      <v-card v-if="isMobile" class="fill-height">
        <v-card-title class="d-flex justify-center align-center" style="height: 56px;">
          <v-pagination
            v-model="page"
            :length="numberOfPages"
            class="pagination-styled"
            :total-visible="1"
          ></v-pagination>
        </v-card-title>
        <v-card-text class="fill-height" style="max-height: calc(100% - 56px); overflow-y: auto;">
          <template v-if="loading">
            <v-skeleton-loader
              type="card"
              v-for="n in itemsPerPage"
              :key="n"
              class="mb-2"
            />
          </template>
          <template v-else>
            <v-carousel
              hide-delimiter-background
              delimiter-icon="mdi-circle"
              :cycle="false"
              :show-arrows="false"
              class="fill-height"
              :continuous="false"
            >
              <v-carousel-item
                v-for="(item, index) in paginatedRequests"
                :key="index"
              >
                <v-card class="pa-2" @click="goToRequestPage($event, item)">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>ФИО: {{ item.appellant.full_name }}</v-list-item-title>
                      <v-list-item-subtitle>Место визита: {{ item.place_of_visit }}</v-list-item-subtitle>
                      <v-list-item-subtitle>Цель визита: {{ item.visit_purpose }}</v-list-item-subtitle>
                      <v-list-item-subtitle>Дата визита: {{ formatDate(item.datetime_of_visit) }}</v-list-item-subtitle>
                      <v-list-item-subtitle>Количество гостей: {{ item.guests.length }}</v-list-item-subtitle>
                      <v-list-item-subtitle>Статус: {{ getStatusName(item) }}</v-list-item-subtitle>
                      <v-list-item-subtitle v-if="item.confirming">Рассмотрел: {{
                          item.confirming.full_name
                        }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-card>
              </v-carousel-item>
            </v-carousel>
          </template>
        </v-card-text>
      </v-card>

      <v-btn
        color="primary"
        dark
        fab
        class="v-btn--fab-bottom-right"
        v-if="isMobile"
        @click="openQrScanner"
      >
        <v-icon>mdi-qrcode-scan</v-icon>
      </v-btn>

      <v-dialog v-model="showQrScanner" max-width="600px">
        <v-card>
          <v-card-title>
            <span>Сканировать QR-код</span>
            <v-spacer></v-spacer>
            <v-btn icon @click="showQrScanner = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <qrcode-stream @detect="onDecode" />
            <v-alert v-if="cameraError" type="error">
              {{ cameraError }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-dialog>

    </v-main>
  </v-app>
</template>


<script>
import axios from "axios";
import { format, parseISO } from "date-fns";
import { VTimePicker } from 'vuetify/labs/VTimePicker';
import moment from "moment";
import VueJwtDecode from 'vue-jwt-decode';
import NavMenu from "@/components/NavMenu.vue";
import { useDisplay } from "vuetify";
import { QrcodeStream } from "vue-qrcode-reader";

export default {
  name: 'Requests',
  data() {
    return {
      requests: [],
      headers: [],
      appellant: '',
      guest: '',
      status: 'В ожидании',
      reversedStatuses: [
        { key: 'В ожидании', value: 1 },
        { key: 'Одобренные', value: 2 },
        { key: 'Отклонённые', value: 3 },
        { key: 'Удалённые', value: 4 },
        { key: 'Завершённые', value: 5 },
        { key: 'Все', value: null }
      ],
      statuses: [
        { key: 1, value: 'В ожидании' },
        { key: 2, value: 'Одобрена' },
        { key: 3, value: 'Отклонена' },
        { key: 4, value: 'Удалена' },
        { key: 5, value: 'Завершена' },
      ],
      dateTimeString: '',
      menu: false,
      date: null,
      placeOfVisit: '',
      visitPurpose: '',
      guests: [{ full_name: 'Гость 1', email: '', phone_number: '', is_foreign: false }],
      selectedGuest: null,
      datePicker: true,
      timePicker: false,
      timeStr: '',
      dateStr: '',
      datetimeStr: '',
      snackbar: false,
      filterMenu: false,
      loading: true,
      rowIndex: null,
      page: 1,
      firstLoad: true,
      guestCard: true,
      file: null,
      rules: {
        required: value => !!value || 'Поле обязательно для заполнения',
        download: value => !!value || 'Загрузите файл',
        email: value => {
          const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return pattern.test(value) || 'Введите корректный адрес электронной почты';
        },
      },
      snackbarDownload: false,
      isMobile: false,
      itemsPerPage: 5,
      itemsPerPageOptions: [5, 10, 15],
      showQrScanner: false, // Новое состояние для диалога сканера QR-кода
      cameraError: '' // Состояние для ошибок камеры
    };
  },
  methods: {
    async fetchRequests(isActive = null) {
      sessionStorage.setItem('filterState', JSON.stringify({
        status: this.status,
        appellant: this.appellant,
        guest: this.guest,
        currentPage: this.currentPage
      }));
      this.loading = true;
      try {
        const token = localStorage.getItem("userToken");
        const config = {
          headers: { "Authorization": `Bearer ${token}` },
          params: {
            status: this.reversedStatuses.find(status => status.key === this.status).value,
            full_name: this.guest,
            appellant: this.appellant,
          }
        };
        const response = await axios.get(import.meta.env.VITE_API_URL + "/requests", config);
        this.requests = response.data;
        this.loading = false;
        if (isActive) {
          isActive.value = false;
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
        { title: 'Заявитель', key: 'appellant.full_name' },
        { title: 'Место визита', key: 'place_of_visit' },
        { title: 'Причина визита', key: 'visit_purpose' },
        { title: 'Дата визита', key: 'datetime_of_visit' },
        { title: 'Количество гостей', key: 'guests' },
        { title: 'Статус', key: 'status' },
      ];

      // Добавляем колонку "Рассмотрел", если нужно
      if (hasConfirmingColumn) {
        newHeaders.push({ title: 'Рассмотрел', key: 'confirming.full_name' });
      }

      // Присваиваем новый массив заголовков таблицы
      this.headers = newHeaders;
    },
    formatDate(datetime) {
      return format(parseISO(datetime), 'd.MM.y H:mm');
    },
    addGuest() {
      const newId = this.guests.length + 1;
      this.guests.push({ full_name: 'Гость ' + newId, email: '', phone_number: '', is_foreign: false });
      this.selectedGuest = newId
    },
    removeGuest(index) {
      this.guests.splice(index, 1);
      this.selectedGuest = null; // Reset the selection after deletion
    },
    selectGuest(index) {
      this.selectedGuest = index;
    },
    dateButton() {
      this.datePicker = true;
      this.timePicker = false;
    },
    timeButton() {
      this.datePicker = false;
      this.timePicker = true;
    },
    timeChange(value) {
      this.timeStr = value;
    },
    dateChange(value) {
      const formattedDate = format(new Date(value), 'yyyy-MM-dd');
      this.dateStr = formattedDate;
      this.datePicker = false;
      this.timePicker = true;
    },
    datetimeSave() {
      if (this.dateStr && this.timeStr) {
        this.datetimeStr = this.dateStr + ' ' + this.timeStr;
        this.menu = false;
      }
    },
    getStatusName(value) {
      const status = this.statuses.find(status => status.key === value.status);
      return status.value;
    },
    async createRequest(isActive) {
      const token = localStorage.getItem("userToken");
      let response = null;

      try {
        if (this.visitPurpose && this.placeOfVisit && this.datetimeStr) {
          if (this.guestCard) {
            if (this.guests) {
              const config = {
                headers: { "Authorization": `Bearer ${token}` },
              };
              response = await axios.post(import.meta.env.VITE_API_URL + '/requests/create', {
                guests: this.guests,
                visit_purpose: this.visitPurpose,
                place_of_visit: this.placeOfVisit,
                datetime_of_visit: moment(this.datetimeStr).toISOString()
              }, config);
            }
          } else if (!this.guestCard) {
            if (this.file) {
              const config = {
                headers: {
                  "Authorization": `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data',
                },
              };
              const formData = new FormData();
              formData.append('file', this.file);
              formData.append('visit_purpose', this.visitPurpose);
              formData.append('place_of_visit', this.placeOfVisit);
              formData.append('datetime_of_visit', moment(this.datetimeStr).toISOString());
              response = await axios.post(import.meta.env.VITE_API_URL + '/requests/create/file', formData, config);
            }
          }
        }

        if (response) {
          await this.fetchRequests();
          this.selectedGuest = null;
          this.visitPurpose = '';
          this.placeOfVisit = '';
          this.datetimeStr = '';
          this.guests = [{ full_name: 'Гость 1', email: '', phone_number: '', is_foreign: false }];
          isActive.value = false;
          this.snackbar = true;
        }
      } catch (error) {
        console.error("Error", error);
        alert(error.message);
      }
    },
    goToRequestPage(event, item) {
      this.$router.push('requests/' + item.id);
    },
    selfRoles() {
      const userData = VueJwtDecode.decode(localStorage.getItem("userToken"));
      return userData.extras.roles;
    },
    restoreFilterState() {
      const state = sessionStorage.getItem('filterState');
      if (state) {
        const { status, appellant, guest, currentPage } = JSON.parse(state);
        this.status = status;
        this.appellant = appellant;
        this.guest = guest;
        this.currentPage = currentPage;
      }
    },
    updatePage(page) {
      if (!this.firstLoad || this.page === 1) {
        this.page = page;
        sessionStorage.setItem('currentPage', page.toString());
      }
      this.firstLoad = false;
    },
    restorePage() {
      const savedPage = sessionStorage.getItem('currentPage');
      if (savedPage) {
        this.page = parseInt(savedPage);
      }
    },
    async downloadExample() {
      try {
        const token = localStorage.getItem("userToken");
        const config = {
          headers: { "Authorization": `Bearer ${token}` },
        };
        await axios.get(import.meta.env.VITE_API_URL + "/example/Users.xlsx", config);
        this.snackbarDownload = true
      } catch (error) {
        console.error('Error', error);
      }
    },
    onDecode(result) {
      console.log('QR Code decoded:', result);
      this.showQrScanner = false;
      if (result) {
        // Извлекаем UUID из URL
        const idMatch = result[0].rawValue.match(/\/requests\/([0-9a-fA-F-]{36})/);
        if (idMatch && idMatch[1]) {
          const id = idMatch[1];
          this.$router.push(`/requests/${id}`);
        } else {
          console.error('Invalid QR code URL');
        }
      }
    },
    onInit(promise) {
      promise.catch(error => {
        if (error.name === 'NotAllowedError') {
          this.cameraError = 'Доступ к камере запрещен. Пожалуйста, предоставьте разрешение на использование камеры.';
        } else if (error.name === 'NotFoundError') {
          this.cameraError = 'Камера не найдена. Пожалуйста, подключите камеру и попробуйте снова.';
        } else {
          this.cameraError = 'Ошибка доступа к камере: ' + error.message;
        }
      });
    },
    openQrScanner() {
      this.cameraError = '';
      this.showQrScanner = true;
    }
  },
  mounted() {
    this.isMobile = useDisplay().mobile.value;
    this.restoreFilterState();
    this.restorePage();
    this.fetchRequests();
  },
  computed: {
    numberOfPages() {
      return Math.ceil(this.requests.length / this.itemsPerPage);
    },
    paginatedRequests() {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.requests.slice(start, end);
    }
  },
  components: {
    VTimePicker,
    NavMenu,
    QrcodeStream
  }
};
</script>


<style scoped>
.v-btn--fab-bottom-right {
  position: fixed;
  right: 16px;
  bottom: 16px;
}

.v-carousel .v-window__controls__item--active {
  background-color: white;
}

.v-carousel .v-window__controls__item {
  background-color: #a3a3a3;
}

.pagination-styled {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.v-card-title {
  padding: 0;
}

.v-pagination {
  flex: 1;
  justify-content: center;
}
</style>
