"""
Single source for the display currency.

SystemSettings.default_currency holds a label like "USD ($)". The UI needs just the
symbol, and hardcoding it in each page is how the Reports screen ended up showing ¥
while Quotation History showed $. Endpoints return the symbol so the frontend never
has to guess.
"""

import re

from uniformAdmin.models import SystemSettings

# Fallback used only when the label can't be parsed.
DEFAULT_SYMBOL = "$"

_SYMBOL_IN_BRACKETS = re.compile(r"\(([^)]+)\)")

# Common labels that carry no bracketed symbol.
KNOWN_SYMBOLS = {
    "USD": "$",
    "JPY": "¥",
    "EUR": "€",
    "GBP": "£",
    "INR": "₹",
}


def get_currency():
    """Return {'code': 'USD', 'symbol': '$', 'label': 'USD ($)'}."""
    try:
        label = (SystemSettings.load().default_currency or "").strip()
    except Exception:
        label = ""

    if not label:
        return {"code": "USD", "symbol": DEFAULT_SYMBOL, "label": "USD ($)"}

    match = _SYMBOL_IN_BRACKETS.search(label)
    code = label.split("(")[0].strip().upper() or "USD"
    symbol = match.group(1).strip() if match else KNOWN_SYMBOLS.get(code, DEFAULT_SYMBOL)

    return {"code": code, "symbol": symbol, "label": label}
