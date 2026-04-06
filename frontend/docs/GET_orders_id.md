# GET /orders/{id}

Get a specific order by ID for a user.

**Path params:**
- `id` (integer, required)

**Query params:**
- `userid` (integer, required)

**Response 200:**
```json
{
  "order": {
    "id": 1,
    "user_id": 42,
    "games_id": 123,
    "key": "XXXX-YYYY-ZZZZ"
  }
}
```
