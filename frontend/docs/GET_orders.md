# GET /orders

Get all orders for a user.

**Query params:**
- `userid` (integer, required)

**Response 200:**
```json
{
  "orders": [
    {
      "id": 1,
      "user_id": 42,
      "games_id": 123,
      "key": "XXXX-YYYY-ZZZZ"
    }
  ]
}
```
