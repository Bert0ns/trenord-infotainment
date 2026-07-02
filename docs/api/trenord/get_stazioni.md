# Trenord API - Stazioni V2

This endpoint retrieves rich geographic and metadata information about train stations based on the provided geographic station name.

## Endpoint

- **Method:** `GET`
- **URL:** `https://cloud.mp.trenord.it/stazioni_v2`

## Query Parameters

| Parameter         | Type     | Required | Description                 | Example          |
| :---------------- | :------- | :------- | :-------------------------- | :--------------- |
| `NomeGeoStazioni` | `string` | Yes      | The geographic station name | `MILANO CADORNA` |

## Response

Upon a successful request, the server will respond with a status code of `200` and a JSON array of station objects.

### Station Object Schema

- `id` (string): The unique identifier of the station
- `creatorId` (string): The identifier of the creator
- `createdAt` (number): Timestamp of creation
- `updaterId` (string): The identifier of the updater
- `updatedAt` (number): Timestamp of update
- `Cap` (number): Postal code
- `CodiceMIR` (string): MIR code
- `Comune` (string): Municipality (Highly useful for geo-searches)
- `Direttrici` (array): List of directions
- `Indirizzo` (string): Address
- `NomeGeoStazioni` (string): Station name
- `Note` (string): Additional notes
- `Prov` (string): Province (e.g. MI, BG)
- `Location` (object): Geographic location information
  - `coordinates` (array): Geographic coordinates [longitude, latitude]
  - `type` (string): Type of location (e.g. "Point")
- `locIdSbme` (number): Location ID
- `MetaStazione` (boolean): Indicates if it's a meta station
- `country` (string): Country
- `tariff_zone` (string): Tariff zone
- `Regione` (string): Region (e.g. Lombardia)
- `hafasCodes` (array): List of HAFAS codes
- `soglia` (number): Threshold
- `ignore_during_search` (boolean): Indicates if it should be ignored during search
- `sync` (number): Synchronization status
- `trash` (number): Trash status

## Example Request

```bash
curl "https://cloud.mp.trenord.it/stazioni_v2?NomeGeoStazioni=MILANO%20CADORNA"
```

## Example Response

```json
[
  {
    "id": "abc123xyz",
    "Comune": "Milano",
    "Prov": "MI",
    "NomeGeoStazioni": "MILANO CADORNA",
    "Regione": "Lombardia",
    "Location": {
      "type": "Point",
      "coordinates": [9.176, 45.468]
    },
    ...
  }
]
```
