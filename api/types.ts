/**
 * API response for journey lookup.
 */
export type TrainInfoResponse = TrainInfo[]

/**
 * Top-level journey information returned for a train query.
 */
export interface TrainInfo {
  /** Unused field according to API notes. */
  services: any[];
  /** Next journey date in format YYYYMMDD. */
  date: string;
  /** Scheduled departure time in format HH:MM:SS. */
  dep_time: string;
  /** Origin station of the journey. */
  dep_station: Station;
  /** Scheduled arrival time in format HH:MM:SS. */
  arr_time: string;
  /** Destination station of the journey. */
  arr_station: Station;
  /** Scheduled journey duration in format HH:MM:SS. */
  duration: string;
  /** Segments describing the train and related journey data. */
  journey_list: JourneyList[];
  /** Total delay in minutes accumulated during the journey. */
  delay: number;
  /** Whether delay information is defined by the backend. */
  delay_defined: boolean;
  /** Indicates whether this journey contains walking segments. */
  walk: boolean;
  /** Indicates if carrying bicycles is allowed. */
  bicycle: boolean;
  /** Indicates if disabled-access places are available. */
  handicap: boolean;
  /** Indicates availability of first class seats. */
  class_1: boolean;
  /** Indicates availability of second class seats. */
  class_2: boolean;
  /** Indicates mixed first/second class availability. */
  class_1_and_2: boolean;
  /** Indicates a Malpensa Express train. */
  mxp: boolean;
  /** Indicates special Malpensa Express service. */
  mxp_special: boolean;
  /** Indicates whether the train/journey is cancelled. */
  cancelled: boolean;
}

/**
 * Journey segment details including train metadata and stop list.
 */
export interface JourneyList {
  /** Train information object for this segment. */
  train: Train;
  /** All stops for this journey segment. */
  pass_list: PassList[];
  /** Journey type value returned by the API. */
  journey_type: string;
}

/**
 * Train metadata and live operation data.
 */
export interface Train {
  /** Full ID of the queried train. */
  CodiceTrasporto1: string;
  /** Train category (for example, REG, MXP). */
  train_category: string;
  /** Train operator. API notes indicate value is TRENORD. */
  train_operator: string;
  /** Direction on the railway line, typically matching destination. */
  direction: string;
  /** Average crowding metric; exact scale is not documented. */
  average_crowding: number;
  /** Label for the average crowding metric. */
  average_crowding_label: string;
  /** Detailed crowding information. */
  crowding: Crowding;
  /** Total delay in minutes accumulated during the journey. */
  delay: number;
  /** Operational status value returned by the API. */
  status: string;
  /** Indicates if carrying bicycles is allowed. */
  bicycle: boolean;
  /** Indicates if disabled-access places are available. */
  handicap: boolean;
  /** Indicates availability of first class seats. */
  class_1: boolean;
  /** Indicates availability of second class seats. */
  class_2: boolean;
  /** Indicates mixed first/second class availability. */
  class_1_and_2: boolean;
  /** Indicates a Malpensa Express train. */
  mxp: boolean;
  /** Indicates special Malpensa Express service. */
  mxp_special: boolean;
  /** Name of the direttrice where the train operates. */
  direttrice: string;
  /** Journey date in format YYYYMMDD. */
  date: string;
  /** Unique MIR code of the origin station. */
  mir_origin: string;
  /** Unique MIR code of the destination station. */
  mir_destination: string;
  /** Unique HAFAS code of the origin station. */
  hafas_origin: string;
  /** Unique HAFAS code of the destination station. */
  hafas_destination: string;
  /** Actual journey timestamp in ISO 8601 format. */
  actual_time: string;
  /** Current or actual station name/code (as provided by API). */
  actual_station: string;
  /** MIR code of the current or actual station. */
  actual_station_mir: string;
  /** Last passed stop index for train progression. */
  pass_id: number;
  /** Scheduled dates on which this train operates. */
  schedule: string[];
  /** Code of the line on which the train operates. */
  line: string;
  /** Unique train ID. */
  train_id: string;
  /** Train code as represented in Trenord systems. */
  train_name: string;
  /** Indicates availability of live ground-system data. */
  has_live_info: boolean;
}

/**
 * Crowding details for a train.
 */
export interface Crowding {
  /** Crowding percentage value. */
  percentage: number;
  /** Crowding level label. */
  level: string;
  /** Source of crowding data. */
  source: string;
}

/**
 * Stop-level information for a train pass list.
 */
export interface PassList {
  /** Departure time from this station in format HH:MM:SS. */
  dep_time?: string;
  /** Station information for this stop. */
  station: Station;
  /** Station type: Origin (O), Stop (F), Destination (D). */
  type: string;
  /** Indicates whether this stop belongs to the active journey. */
  is_journey: boolean;
  /** Real-time information for this stop. */
  actual_data: ActualData;
  /** Indicates whether the train is cancelled. */
  cancelled: boolean;
  /** Stop index where origin station has pass_count = 1. */
  pass_count: number;
  /** Journey date in format YYYYMMDD. */
  date: string;
  /** Arrival time to this station in format HH:MM:SS. */
  arr_time?: string;
  /** Platform information, when available. */
  platform?: string;
}

/**
 * Station metadata.
 */
export interface Station {
  /** Unique MIR code of the station. */
  station_id: string;
  /** Extended station name. */
  station_ori_name: string;
}

/**
 * Real-time operational data for a stop.
 */
export interface ActualData {
  /** Unique MIR code of the station. */
  actual_station_mir: string;
  /** Extended station name. */
  actual_station_name: string;
  /** Unique train ID. */
  actual_train_id: string;
  /** Station type: Origin (O), Stop (F), Destination (D). */
  actual_type: string;
  /** Real-time departure in format HH:MM:SS. */
  dep_actual_time?: string;
  /** Departure delay in minutes. */
  dep_delay_actual?: number;
  /** Arrival delay in minutes. */
  arr_delay_actual?: number;
  /** Real-time arrival in format HH:MM:SS. */
  arr_actual_time?: string;
}
