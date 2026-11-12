// Akcja Turnstile publicznej wyceny (MIX-1383, B1). Jedno źródło dla frontu (widget kalkulatora
// nadaje ją przy renderze) i serwera (siteverify musi ją zwrócić, inaczej 403 `captcha: action`).
// Czysty TS bez zależności: front importuje go bez silnika wyceny.
export const PUBLIC_QUOTE_TURNSTILE_ACTION = 'public_quote';
