$(() => {

  const $reservationForm = $(`
  <form id="reservation-form" class="reservation-form">
      <p>Reservation</p>
      <div class="reservation-form__field-wrapper">
        <input type="date" name="date" placeholder="Start Date">
      </div>

      <div class="reservation-form__field-wrapper">
          <input type="date" name="date" placeholder="End Date">
        </div>

      <div class="reservation-form__field-wrapper">
          <button type="submit">Reservation</button>
      </div>
    </form>
  `);

  
  $reservationForm.on('submit', function(event) {
    event.preventDefault();

    const data = $(this).serialize();
    submitReservation(data)
    .then(() => {
      views_manager.show('reservations');
    })
    .catch(error => {
      console.error(error);
      views_manager.show('reservations');
    });
  });
  
  window.$reservationForm = $reservationForm;
});