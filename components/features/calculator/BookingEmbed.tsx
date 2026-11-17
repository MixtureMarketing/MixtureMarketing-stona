// MIX-1814 (Z9, wariant A): harmonogram rozmów z I14 pod wynikiem /wycena/. Ten sam adres ramki co
// po formularzu kontaktu (`CALENDAR_IFRAME_SRC`). Komponent montuje się dopiero na ekranie wyniku po
// udanym „Wyślij i umów rozmowę” (lead już zapisany), więc przed kliknięciem strona nie wysyła
// żadnego żądania do calendar.google.com.
import React from 'react';
import { CALENDAR_IFRAME_SRC } from '../contact/contactConfig';

const BookingEmbed: React.FC = () => (
  <section
    aria-labelledby="booking-embed-title"
    data-testid="booking-embed"
    className="mt-8 text-left"
  >
    <h3 id="booking-embed-title" className="text-xl font-bold text-white text-center">
      Wybierz termin rozmowy
    </h3>
    <p className="mt-2 mb-4 text-sm text-gray-300 text-center">
      Twoja konfiguracja jest już u nas. Kliknij wolny termin, a rozmowę dopiszemy do kalendarza.
    </p>
    <div className="w-full h-[600px] md:h-[640px] overflow-hidden rounded-2xl border border-white/10 bg-white">
      <iframe
        src={CALENDAR_IFRAME_SRC}
        title="Wolne terminy rozmowy (Kalendarz Google)"
        width="100%"
        height="100%"
        style={{ border: 0 }}
      />
    </div>
  </section>
);

export default BookingEmbed;
