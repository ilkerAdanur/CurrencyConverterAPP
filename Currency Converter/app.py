import requests

def convertCurrency(amount, from_currency, to_currency):
    """
    Convert currency using exchangerate.host free API (no API key required)
    """
    url = "https://api.exchangerate.host/convert"
    params = {
        "from": from_currency.upper(),
        "to": to_currency.upper(),
        "amount": amount
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()  # Raise error for bad responses
        data = response.json()

        if "result" not in data:
            return {"error": "Conversion result not found"}

        return {
            "converted_amount": round(data["result"], 2),
            "exchange_rate": data.get("info", {}).get("rate"),
            "from_currency": from_currency,
            "to_currency": to_currency,
            "original_amount": amount
        }

    except requests.exceptions.RequestException as e:
        return {"error": f"Network error: {str(e)}"}
    except ValueError as e:
        return {"error": f"Invalid amount: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}
