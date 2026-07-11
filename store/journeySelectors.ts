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

  // Find the last station that has ANY real-time data (arrived or departed)
  const lastKnownIndex = passList.findLastIndex(
    (pass: any) =>
      pass.actual_data?.arr_actual_time !== undefined ||
      pass.actual_data?.dep_actual_time !== undefined,
  );

  if (lastKnownIndex === -1) {
    // Train hasn't reached any station yet. Return the first non-cancelled station.
    return passList.find((pass: any) => pass.cancelled !== true);
  }

  const lastKnownPass = passList[lastKnownIndex];

  // If the last known station has an arrival time but NO departure time,
  // AND it is supposed to have a scheduled departure time, it means the train is currently AT this station.
  // Therefore, this station IS the 'nextStop' (and isAtStation will evaluate to true).
  const isCurrentlyAtLastKnown =
    lastKnownPass.actual_data?.arr_actual_time !== undefined &&
    lastKnownPass.actual_data?.dep_actual_time === undefined &&
    lastKnownPass.dep_time !== undefined;

  if (isCurrentlyAtLastKnown) {
    return lastKnownPass;
  }

  // Otherwise, the train has departed the last known station (or it was just a pass-through).
  // The 'nextStop' is the next non-cancelled station in the list.
  return passList
    .slice(lastKnownIndex + 1)
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

export const selectLiveDelay = (state: JourneyStore) => {
  const trainInfo = selectTrainInfo(state);
  if (!trainInfo) return 0;

  const baseDelay = trainInfo.delay || 0;

  if (selectIsJourneyCompleted(state)) {
    return baseDelay;
  }

  if (selectIsAtStation(state)) {
    const nextStop = selectNextStop(state);
    if (nextStop && nextStop.dep_time) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [h, m] = nextStop.dep_time.split(":").map(Number);
      const scheduledDepMinutes = h * 60 + m;

      let diff = currentMinutes - scheduledDepMinutes;
      if (diff < -720) diff += 1440;
      if (diff > 720) diff -= 1440;

      if (diff > baseDelay) {
        return diff;
      }
    }
  }

  return baseDelay;
};
