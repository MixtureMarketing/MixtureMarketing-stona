#!/usr/bin/env bash
# diagnostyka podwojnego cofniecia: tylko budowa ON, odstepy 20 i 40 ms
export PROBE_MODES=on PROBE_GAPS=20,40
exec bash .bieg/mix1675/probe3.sh
