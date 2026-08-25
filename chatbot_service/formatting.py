def _money(v):
    return "n/d" if v is None else f"${v:,.2f} €".replace(",", " ")

def _pct(v):
    return "n/d" if v is None else f"{v * 100:.1f}%"