#!/usr/bin/env bash
# MIX-1815 mutants (wzór .bieg/m1791/mut.sh): green baseline first; then apply one mutant, confirm the
# text was present, run the affected tests, restore THAT file. Killed = at least one named test
# failed (rc != 0 alone is not enough).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1815/mut
mkdir -p "$OUT"
T="components/features/calculator/ResultContact.resumed.test.tsx components/features/calculator/calculatorHandoff.test.ts components/features/calculator/ResultContact.switch.test.tsx tests/components/InlineContactForm.test.tsx tests/hooks/useContactForm.test.tsx tests/scripts/ciWorkflow.test.ts components/features/calculator/ResultContact.combos.test.tsx components/features/calculator/flagInherit.mix1898.test.ts components/features/calculator/BookingTimeline.combos.test.tsx components/features/calculator/CalculatorContrast.test.tsx components/features/calculator/CalculatorNewUi.test.tsx"
echo "MUT HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
npx vitest run $T --maxWorkers=2 > "$OUT/baseline.log" 2>&1; brc=$?
echo "MUT baseline rc=$brc $(clean "$OUT/baseline.log" | grep -aE '^\s+Tests ' | tr -s ' ')"
if [ "$brc" -ne 0 ]; then echo "MUT ABORT: baseline red, mutants not run"; exit 1; fi
run() { # name file from to
  local name="$1" f="$2" from="$3" to="$4"
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");const a=process.env.FROM,b=process.env.TO;if(!s.includes(a)){process.exit(3)}fs.writeFileSync(f,s.replace(a,b))' "$f" || { echo "$name NOMATCH"; return; }
  local changed; changed=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  # shellcheck disable=SC2086
  npx vitest run $T --maxWorkers=2 > "$OUT/$name.log" 2>&1; local rc=$?
  local nf; nf=$(clean "$OUT/$name.log" | grep -aE '^\s+Tests ' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo 0)
  local first; first=$(clean "$OUT/$name.log" | grep -aE '^\s*(×|FAIL) ' | head -1 | cut -c1-90)
  if [ "$rc" -ne 0 ] && [ "${nf:-0}" -gt 0 ]; then echo "$name rc=$rc zabity ($nf failed: $first) diff=$changed"
  elif [ "$rc" -ne 0 ]; then echo "$name rc=$rc NIEJASNY (0 named failures: $first) diff=$changed"
  else echo "$name rc=0 PRZEZYL diff=$changed"; fi
  git checkout -- "$f"
  git diff --quiet -- "$f" || echo "WARN $f dirty after $name"
}
L=components/features/calculator/configLink.ts
H=components/features/calculator/calculatorHandoff.ts
R=components/features/calculator/CalculatorResult.tsx
P=components/features/calculator/PublicCalculator.tsx
C=components/pages/ContactPage.tsx
I=components/features/contact/InlineContactForm.tsx

# K-allowlista odczytu stanu (formy ataku)
run M1-no-version-gate $H "  if (v !== HANDOFF_VERSION) return null;" "  void v;"
run M2-no-text-cap $H "text.trim() === '' || text.length > HANDOFF_TEXT_MAX) return null;" "text.trim() === '') return null;"
run M3-text-cap-off-by-one $H "text.length > HANDOFF_TEXT_MAX) return null;" "text.length >= HANDOFF_TEXT_MAX) return null;"
run M4-no-email-type $H "  if (typeof email !== 'string' || email.length > HANDOFF_EMAIL_MAX) return null;" "  void email;"
run M5-inherited-key-ok $H "  if (!Object.prototype.hasOwnProperty.call(state, HANDOFF_KEY)) return null;" "  void 0;"
run M6-array-state-ok $H "  if (!h || typeof h !== 'object' || Array.isArray(h)) return null;" "  if (!h || typeof h !== 'object') return null;"
run M7-extra-fields-pass $H "  return { v: HANDOFF_VERSION, text, email };
}" "  return h as CalculatorHandoff;
}"
# K-tekst konfiguracji (etykiety, netto, limit)
run M8-codes-not-labels $H "    case 'select':
      return typeof val === 'string' ? label(val) : null;" "    case 'select':
      return typeof val === 'string' ? val : null;"
run M9-no-netto $H "zł netto\`," "zł\`,"
run M10-link-kept-when-long $H "  text = join(lines, false);
  while" "  text = join(lines, true);
  while"
run M12-email-cap-off $H "email: e.length <= HANDOFF_EMAIL_MAX ? e : ''," "email: e,"
run M13-p4-text-wrong $H "views_count: 'Ile mniej więcej podstron? (Start, O nas, Oferta, Kontakt = 4)'," "views_count: 'Ile podstron?',"
# K-ekran wyniku
run M14-result-btn-no-44 $R "const BTN = 'inline-flex min-h-11 " "const BTN = 'inline-flex "
run M15-no-state-on-link $R "          state={handoffState(handoff)}
" ""
run M16-cookie-hook-off $R "  useHideCookieOver(boxRef, true, 'resultCookie');" "  useHideCookieOver(boxRef, false, 'resultCookie');"
# K-przełącznik
run M17-switch-ignored-calc $P "  const resultOn = isResultContactEnabled();" "  const resultOn = true;"
run M18-switch-ignored-contact $C "isResultContactEnabled() ? readHandoff(location.state) : null;" "readHandoff(location.state);"
run M19-p4-not-applied $P "visible={resultOn ? withP4Texts(c.visible) : c.visible}" "visible={c.visible}"
# K-formularz kontaktu ma konfigurację
run M20-no-prefill-message $I "    setValue('message', preMsg);" "    void preMsg;"
run M21-no-prefill-email $I "    if (preEmail) setValue('email', preEmail);" "    void preEmail;"
run M22-prefill-inverted $I "additionalData?.resumedLead || !preMsg) return;" "additionalData?.resumedLead || preMsg) return;"
run M23-no-config-box $I "      {calculatorConfig && (" "      {false && calculatorConfig && ("
run M24-ci-flag-on-prod .github/workflows/ci.yml "          VITE_MM_RESULT_CONTACT: \${{ steps.target.outputs.target == 'preview' && '1' || '' }}" "          VITE_MM_RESULT_CONTACT: '1'"
run M25-css-rule-missing index.css "body[data-result-cookie='true'] .cookie-floating-btn," ""
# r2 (NIE weryfikatora r1): przycisk ciasteczek nad opcjami formularza + mutanty V4/V6/V8/V9 weryfikatora
U=components/features/calculator/useHideCookieOver.ts
run R1-form-hook-off $P "useHideCookieOver(formRef, filling, 'formCookie', FORM_CONTROLS);" "useHideCookieOver(formRef, false, 'formCookie', FORM_CONTROLS);"
run R2-form-hook-whole-box $P "useHideCookieOver(formRef, filling, 'formCookie', FORM_CONTROLS);" "useHideCookieOver(formRef, filling, 'formCookie');"
run R3-selector-ignored $U "const targets = selector ? Array.from(box.querySelectorAll(selector)) : [box];" "const targets = [box];"
run R4-form-hook-always-active $P "useHideCookieOver(formRef, filling, 'formCookie', FORM_CONTROLS);" "useHideCookieOver(formRef, true, 'formCookie', FORM_CONTROLS);"
run R11-form-box-always $P "        (resultOn ? (" "        (true ? ("
run R5-css-form-rule-missing index.css "body[data-form-cookie='true'] .cookie-floating-btn," ""
run R6-controls-without-button $U "'label, input, select, textarea, button, a[href]'" "'label, input, select, textarea, a[href]'"
run R7-V4-html-in-box $I "          <p className=\"whitespace-pre-line break-words text-sm text-gray-800\">
            {calculatorConfig.text}
          </p>" "          <p className=\"whitespace-pre-line break-words text-sm text-gray-800\" dangerouslySetInnerHTML={{ __html: calculatorConfig.text }} />"
run R8-V6-resumed-no-priority $I "if (prefilled.current || additionalData?.resumedLead || !preMsg) return;" "if (prefilled.current || !preMsg) return;"
run R9-V8-email-in-url $R '          to="/contact/"
          state=' '          to={`/contact/?e=${encodeURIComponent(handoff?.email ?? "")}`}
          state='
LP=components/features/calculator/livePrice.ts
run R10-V9-flag-default-on $LP "domyślny parametr, czyli wartość VITE_MM_LIVE_PRICE_BAR.
  return raw === '1';" "domyślny parametr, czyli wartość VITE_MM_LIVE_PRICE_BAR.
  return raw === undefined ? true : raw === '1';"
# r3 (przeniesienie na integracja 21a5ca4): miejsca konfliktów z MIX-1937/1867/1814/1816/1898
run X0-flag-inherits-live-bar $LP "domyślny parametr, czyli wartość VITE_MM_LIVE_PRICE_BAR.
  return raw === '1';" "domyślny parametr, czyli wartość VITE_MM_LIVE_PRICE_BAR.
  return isLivePriceBarEnabled(raw);"
run X1-z11-off-in-new-ui $R "  if (handoff)
    return (" "  if (handoff && !newUi)
    return ("
run X2-z11-new-ui-old-btn $R "newUi ? ui.btnPrimary : " "false ? ui.btnPrimary : "
run X3-z11-no-svg-arrow $R "          {newUi && <ArrowRight size={18} aria-hidden=\"true\" />}" ""
run X4-z11-no-booking $R "      {booking}
      {timeline}" "      {timeline}"
run X5-no-handoff-passed $P "          handoff={handoff}
" ""
run X6-form-no-lead-config $P "      leadConfig={isLeadConfigEnabled()}
" ""
run X7-ci-portfolio-flag-lost .github/workflows/ci.yml "          VITE_MM_PORTFOLIO_VIDEO: \${{ steps.target.outputs.target == 'preview' && '1' || '' }}
" ""
run X8-z11-no-heading-focus $R "    if (newUi) headRef.current?.focus();" "    void headRef;"
run X9-z11-new-ui-gray-text $R "'leading-relaxed text-white/75' : 'text-gray-300'" "'text-gray-300' : 'text-gray-300'"
run X10-z11-no-timeline $R "      {booking}
      {timeline}" "      {booking}"
echo "git status after: $(git status --porcelain | grep -v '^??' | wc -l) modified"
