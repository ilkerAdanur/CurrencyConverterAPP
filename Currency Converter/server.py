from mcp.server.fastmcp import FastMCP
from app import convertCurrency

mcp = FastMCP("currency-converter-mcp")

@mcp.tool()
async def convert_currency(amount: float, from_currency: str, to_currency: str) -> dict:
    return convertCurrency(amount, from_currency, to_currency)

if __name__ == "__main__":
    mcp.run(transport="stdio")
