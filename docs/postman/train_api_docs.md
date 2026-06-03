# Train API Documentation

## Endpoint

- Base URL: `https://cloud.mp.trenord.it/train/`
- Method: `GET`
- Path parameter: `train_id` (required)

### Example Request

```http
GET https://cloud.mp.trenord.it/train/1900832
```

## Response Format

The endpoint returns a JSON array of journey candidates. In normal usage, the first element is the active/next journey for the requested train.

```json
[
  {
    "services": [],
    "date": "20240117",
    "dep_time": "10:23:00",
    "dep_station": {
      "station_id": "S01933",
      "station_ori_name": "SARONNO"
    },
    "arr_time": "10:58:30",
    "arr_station": {
      "station_id": "S01066",
      "station_ori_name": "MILANO CADORNA"
    },
    "duration": "00:35:30",
    "journey_list": [
      {
        "train": {
          "CodiceTrasporto1": "1900832",
          "train_category": "S3",
          "train_operator": "TRENORD",
          "direction": "Milano Cadorna",
          "average_crowding": 9,
          "average_crowding_label": "uncrowded",
          "crowding": {
            "percentage": 9.25,
            "level": "LOW",
            "source": "AVERAGE"
          },
          "delay": 7,
          "status": "A",
          "bicycle": false,
          "handicap": true,
          "class_1": false,
          "class_2": true,
          "class_1_and_2": false,
          "mxp": false,
          "mxp_special": false,
          "direttrice": "D031",
          "date": "20240117",
          "mir_origin": "S01933",
          "mir_destination": "S01066",
          "hafas_origin": "8301933",
          "hafas_destination": "8301066",
          "actual_time": "2024-01-17T10:05:35.000Z",
          "actual_station": "MILANO CADORNA",
          "actual_station_mir": "S01066",
          "pass_id": 12,
          "schedule": ["2024-01-17", "2024-01-18"],
          "line": "S3",
          "train_id": "832",
          "train_name": "832",
          "has_live_info": true
        },
        "pass_list": [
          {
            "dep_time": "10:23:00",
            "station": {
              "station_id": "S01933",
              "station_ori_name": "SARONNO"
            },
            "type": "O",
            "is_journey": true,
            "actual_data": {
              "actual_station_mir": "S01933",
              "actual_station_name": "SARONNO",
              "actual_train_id": "1900832",
              "actual_type": "O",
              "dep_actual_time": "10:23:08",
              "dep_delay_actual": 0
            },
            "cancelled": false,
            "platform": "1",
            "pass_count": 1,
            "date": "20240117"
          },
          {
            "arr_time": "10:58:30",
            "station": {
              "station_id": "S01066",
              "station_ori_name": "MILANO CADORNA"
            },
            "type": "D",
            "is_journey": true,
            "actual_data": {
              "actual_station_mir": "S01066",
              "actual_station_name": "MILANO CADORNA",
              "actual_train_id": "1900832",
              "actual_type": "D",
              "arr_actual_time": "11:05:35",
              "arr_delay_actual": 7
            },
            "cancelled": false,
            "pass_count": 13,
            "date": "20240117"
          }
        ],
        "journey_type": "train"
      }
    ],
    "delay": 7,
    "delay_defined": true,
    "walk": false,
    "bicycle": false,
    "handicap": true,
    "class_1": false,
    "class_2": true,
    "class_1_and_2": false,
    "mxp": false,
    "mxp_special": false,
    "cancelled": false
  }
]
```

## Response Fields

### Root Journey Object

| Field           | Type      | Description                                                         |
| --------------- | --------- | ------------------------------------------------------------------- |
| `services`      | `array`   | Currently unused in observed responses.                             |
| `date`          | `string`  | Journey date in `YYYYMMDD` format.                                  |
| `dep_time`      | `string`  | Scheduled departure time (`HH:MM:SS`).                              |
| `dep_station`   | `object`  | Origin station object.                                              |
| `arr_time`      | `string`  | Scheduled arrival time (`HH:MM:SS`).                                |
| `arr_station`   | `object`  | Destination station object.                                         |
| `duration`      | `string`  | Scheduled journey duration (`HH:MM:SS`).                            |
| `journey_list`  | `array`   | Journey segments (usually one for direct train rides).              |
| `delay`         | `number`  | Total delay in minutes for the journey.                             |
| `delay_defined` | `boolean` | `true` when delay information is available/confirmed.               |
| `walk`          | `boolean` | Indicates a walking segment (typically `false` for train endpoint). |
| `bicycle`       | `boolean` | Bicycle transport allowed for the journey.                          |
| `handicap`      | `boolean` | Accessibility support available.                                    |
| `class_1`       | `boolean` | 1st class available.                                                |
| `class_2`       | `boolean` | 2nd class available.                                                |
| `class_1_and_2` | `boolean` | Combined 1st/2nd class configuration.                               |
| `mxp`           | `boolean` | Malpensa Express train indicator.                                   |
| `mxp_special`   | `boolean` | Special Malpensa Express indicator.                                 |
| `cancelled`     | `boolean` | Journey/train cancellation status.                                  |

### Station Object (`dep_station`, `arr_station`, `pass_list[].station`)

| Field              | Type     | Description                       |
| ------------------ | -------- | --------------------------------- |
| `station_id`       | `string` | MIR station code (e.g. `S01933`). |
| `station_ori_name` | `string` | Station name.                     |

### Journey Segment Object (`journey_list[]`)

| Field          | Type     | Description                                                       |
| -------------- | -------- | ----------------------------------------------------------------- |
| `train`        | `object` | Main train metadata and live status.                              |
| `pass_list`    | `array`  | Ordered station passes (origin, intermediate stops, destination). |
| `journey_type` | `string` | Segment type, observed value: `train`.                            |

### Train Object (`journey_list[].train`)

| Field                    | Type            | Description                                                |
| ------------------------ | --------------- | ---------------------------------------------------------- |
| `CodiceTrasporto1`       | `string`        | Full train identifier used by Trenord backend.             |
| `train_category`         | `string`        | Service category (e.g. `REG`, `S3`, `MXP`).                |
| `train_operator`         | `string`        | Operator name, typically `TRENORD`.                        |
| `direction`              | `string`        | Service direction / terminal destination name.             |
| `average_crowding`       | `number`        | Average crowding value.                                    |
| `average_crowding_label` | `string`        | Human-readable crowding label.                             |
| `crowding`               | `object`        | Crowding details (`percentage`, `level`, `source`).        |
| `delay`                  | `number`        | Current train delay in minutes.                            |
| `status`                 | `string`        | Operational status code.                                   |
| `bicycle`                | `boolean`       | Bicycle transport allowed.                                 |
| `handicap`               | `boolean`       | Accessibility support available.                           |
| `class_1`                | `boolean`       | 1st class available.                                       |
| `class_2`                | `boolean`       | 2nd class available.                                       |
| `class_1_and_2`          | `boolean`       | Combined class configuration flag.                         |
| `mxp`                    | `boolean`       | Malpensa Express indicator.                                |
| `mxp_special`            | `boolean`       | Special Malpensa Express indicator.                        |
| `direttrice`             | `string`        | Operating line/direction code (network branch identifier). |
| `date`                   | `string`        | Journey date in `YYYYMMDD`.                                |
| `mir_origin`             | `string`        | MIR code for origin station.                               |
| `mir_destination`        | `string`        | MIR code for destination station.                          |
| `hafas_origin`           | `string`        | HAFAS code for origin station.                             |
| `hafas_destination`      | `string`        | HAFAS code for destination station.                        |
| `actual_time`            | `string`        | Last live update timestamp in ISO 8601 format.             |
| `actual_station`         | `string`        | Last reported station name.                                |
| `actual_station_mir`     | `string`        | Last reported station MIR code.                            |
| `pass_id`                | `number`        | Last passed stop index for the train progression.          |
| `schedule`               | `array<string>` | Service operation dates for the train.                     |
| `line`                   | `string`        | Commercial line code.                                      |
| `train_id`               | `string`        | Short train identifier.                                    |
| `train_name`             | `string`        | Display name/code used in Trenord systems.                 |
| `has_live_info`          | `boolean`       | Whether live telemetry is available.                       |

### Pass Object (`journey_list[].pass_list[]`)

| Field         | Type      | Description                                                    |
| ------------- | --------- | -------------------------------------------------------------- |
| `dep_time`    | `string`  | Scheduled departure time (`HH:MM:SS`), when present.           |
| `arr_time`    | `string`  | Scheduled arrival time (`HH:MM:SS`), when present.             |
| `station`     | `object`  | Station object for the pass event.                             |
| `type`        | `string`  | Pass type: `O` origin, `F` intermediate stop, `D` destination. |
| `is_journey`  | `boolean` | Indicates this pass belongs to the selected journey.           |
| `actual_data` | `object`  | Real-time data for this stop/pass.                             |
| `cancelled`   | `boolean` | Whether this stop is cancelled.                                |
| `platform`    | `string`  | Platform number, when provided.                                |
| `pass_count`  | `number`  | Stop sequence index starting from `1` at origin.               |
| `date`        | `string`  | Journey date in `YYYYMMDD`.                                    |

### Actual Data Object (`pass_list[].actual_data`)

| Field                 | Type     | Description                                       |
| --------------------- | -------- | ------------------------------------------------- |
| `actual_station_mir`  | `string` | MIR code for real-time station event.             |
| `actual_station_name` | `string` | Station name for real-time event.                 |
| `actual_train_id`     | `string` | Train ID linked to the event.                     |
| `actual_type`         | `string` | Event type: `O`, `F`, `D`.                        |
| `dep_actual_time`     | `string` | Real departure time (`HH:MM:SS`), when available. |
| `arr_actual_time`     | `string` | Real arrival time (`HH:MM:SS`), when available.   |
| `dep_delay_actual`    | `number` | Departure delay in minutes.                       |
| `arr_delay_actual`    | `number` | Arrival delay in minutes.                         |

## Notes

- Some fields are optional and appear only for specific stop types (`O`, `F`, `D`) or when live data is available.
- `schedule` can be very large; avoid rendering it fully in UI views unless needed.
- Field naming is preserved from the upstream API payload and may not follow a single naming convention.
