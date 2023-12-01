const app = Vue.createApp({
  data() {
    return {
      searchText: '',
      guesthouses: [],
      currentGuesthouse: null,
      showingDetails: false,
      selectedRoom: null,
      availabilityData: {
        startDate: '',
        endDate: '',
        guestsNumber: 1
      }
    };
  },
  computed: {
    filteredGuesthouses() {
      if (this.searchText) {
        return this.guesthouses.filter(guesthouse =>
          guesthouse.brand_name.toLowerCase().includes(this.searchText.toLowerCase())
        );
      } else {
        return this.guesthouses;
      }
    }
  },
  async mounted() {
    await this.fetchGuesthouses();
  },
  methods: {
    async fetchGuesthouses() {
      try {
        const response = await fetch('http://localhost:3000/api/v1/guesthouses');
        if (response.ok) {
          this.guesthouses = await response.json();
        } else {
          console.error('Error searching for inns');
        }
      } catch (error) {
        console.error('Request error:', error);
      }
    },
    async displayDetails(guesthouseId) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/guesthouses/${guesthouseId}`);
        if (response.ok) {
          this.currentGuesthouse = await response.json();
          await this.fetchRoomsForGuesthouse(guesthouseId);
          this.showingDetails = true;
        } else {
          console.error('Error fetching inn details');
        }
      } catch (error) {
        console.error('Request error:', error);
      }
    },
    async fetchRoomsForGuesthouse(guesthouseId) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/guesthouses/${guesthouseId}/rooms`);
        if (response.ok) {
          const rooms = await response.json();
          this.currentGuesthouse.rooms = rooms;
        } else {
          console.error('Error fetching rooms for the inn');
        }
      } catch (error) {
        console.error('Request error:', error);
      }
    },
    prepareAvailabilityForm(room) {
      this.selectedRoom = room;
      this.availabilityData = { startDate: '', endDate: '', guestsNumber: 1 };
      this.$nextTick(() => {
        this.$refs.availabilityFormSection.scrollIntoView({ behavior: 'smooth' });
      });
    },
    async checkRoomAvailability(roomId) {
      if (this.availabilityData.startDate && this.availabilityData.endDate && this.availabilityData.guestsNumber) {
        try {
          const response = await fetch(`http://localhost:3000/api/v1/rooms/${roomId}/availability`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              start_date: this.availabilityData.startDate,
              end_date: this.availabilityData.endDate,
              guests_number: this.availabilityData.guestsNumber
            })
          });
          const availability = await response.json();
          if (response.ok && availability.total_price) {
            alert(`Preço Total: R$ ${availability.total_price}`);
          } else {
            alert(availability.error || 'O quarto não está disponível para as datas selecionadas');
          }
        } catch (error) {
          console.error('Erro na requisição:', error);
        }
      } else {
        alert('Por favor, preencha todos os campos.');
      }
    },
    formatTime(dateTime) {
      const options = { hour: '2-digit', minute: '2-digit' };
      return new Date(dateTime).toLocaleTimeString('pt-BR', options);
    },
    goBackToList() {
      this.showingDetails = false;
      this.currentGuesthouse = null;
      this.selectedRoom = null;
    }
  }
});

app.mount('#app');
