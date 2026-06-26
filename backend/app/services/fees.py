from app.core.config import settings


def calculate_fees(agreed_price: int, fee_percent: int | None = None) -> dict[str, int]:
    percent = fee_percent if fee_percent is not None else settings.platform_fee_percent
    platform_fee = round(agreed_price * percent / 100)
    return {
        "agreed_price": agreed_price,
        "platform_fee": platform_fee,
        "total_charge": agreed_price + platform_fee,
        "worker_payout": agreed_price,
    }