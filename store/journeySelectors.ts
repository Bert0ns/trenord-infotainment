import type { JourneyStore } from "./journeyStore";

export const selectOrigDestData = (state: JourneyStore) => state.trainData?.[0];

export const selectTrainInfo = (state: JourneyStore) =>
  selectOrigDestData(state)?.journey_list?.[0]?.train;

export const selectPassList = (state: JourneyStore) =>
  selectOrigDestData(state)?.journey_list?.[0]?.pass_list;

export const selectDestinationPass = (state: JourneyStore) => {
  const passList = selectPassList(state);
  const destId = state.destinationStation?.station_id;
  if (!passList || !destId) return undefined;
  return passList.find((pass) => pass.station.station_id === destId);
};

export const selectIsJourneyCompleted = (state: JourneyStore) => {
  const destPass = selectDestinationPass(state);
  if (!destPass) return false;
  return destPass.actual_data?.arr_actual_time !== undefined;
};

export const selectNextStop = (state: JourneyStore) => {
  if (selectIsJourneyCompleted(state)) return undefined;

  const passList = selectPassList(state);
  if (!passList) return undefined;

  const lastDepartedIndex = passList.findLastIndex(
    (pass: any) => pass.actual_data?.dep_actual_time !== undefined,
  );

  return passList
    .slice(lastDepartedIndex + 1)
    .find((pass: any) => pass.cancelled !== true);
};

export const selectIsAtStation = (state: JourneyStore) => {
  const nextStop = selectNextStop(state);
  if (!nextStop) return false;
  return (
    nextStop.actual_data?.arr_actual_time !== undefined &&
    nextStop.actual_data?.dep_actual_time === undefined &&
    !selectIsJourneyCompleted(state)
  );
};

export const selectStations = (state: JourneyStore) => state.stations;
