import { capitalizeWords } from "@/utils/string";
import React from "react";
import { StyleSheet, View } from "react-native";
import TimelineCard from "./timelineCard";

import { PassList, Station, Train } from "@/lib/api/trenord/trenord-types";

interface JourneyTimelineProps {
  passListArray: PassList[];
  destinationStation: Station | null;
  nextStop: PassList | undefined;
  trainInfo: Train;
  liveDelay: number;
}

// --- Helpers to reduce cognitive complexity ---

function getPassStatus(
  pass: PassList,
  nextStop: PassList | undefined,
): "future" | "current" | "past" {
  if (pass === nextStop) return "current";
  if (
    (nextStop && pass.pass_count < nextStop.pass_count) ||
    (pass.type === "O" && pass.actual_data?.dep_actual_time !== undefined) ||
    (pass.type === "D" && pass.actual_data?.arr_actual_time !== undefined) ||
    (pass.actual_data?.arr_actual_time !== undefined &&
      pass.actual_data?.dep_actual_time !== undefined)
  ) {
    return "past";
  }
  return "future";
}

function getIsAtStation(pass: PassList): boolean {
  return (
    pass.actual_data?.arr_actual_time !== undefined &&
    pass.actual_data?.dep_actual_time === undefined &&
    pass.type !== "D"
  );
}

function getLineFill(
  index: number,
  passListArray: PassList[],
  nextStop: PassList | undefined,
): "full" | "half" | "none" {
  if (index >= passListArray.length - 1) return "none";

  const nextPass = passListArray[index + 1];
  const nextStatus = getPassStatus(nextPass, nextStop);

  if (nextStatus === "past") return "full";
  if (nextStatus === "current") {
    return getIsAtStation(nextPass) ? "full" : "half";
  }
  return "none";
}

export default function JourneyTimeline({
  passListArray,
  destinationStation,
  nextStop,
  trainInfo,
  liveDelay,
}: JourneyTimelineProps) {
  const destinationIndex = destinationStation
    ? passListArray.findIndex(
        (p) => p.station.station_id === destinationStation.station_id,
      )
    : -1;

  return (
    <View style={styles.timelineContainer}>
      {passListArray.map((pass, index) => {
        const isUserDestination =
          pass.station.station_id === destinationStation?.station_id;
        const isPastDestination =
          destinationIndex !== -1 && index > destinationIndex;

        const status = getPassStatus(pass, nextStop);
        const lineFill = getLineFill(index, passListArray, nextStop);

        const scheduledTime =
          pass.type === "D" || isUserDestination
            ? pass.arr_time || pass.dep_time
            : pass.dep_time || pass.arr_time;
        const actualTime =
          pass.type === "D" || isUserDestination
            ? pass.actual_data?.arr_actual_time ||
              pass.actual_data?.dep_actual_time
            : pass.actual_data?.dep_actual_time ||
              pass.actual_data?.arr_actual_time;

        return (
          <TimelineCard
            key={pass.station.station_id}
            status={status}
            stationName={capitalizeWords(pass.station.station_ori_name)}
            scheduledTime={scheduledTime?.slice(0, 5) || "N/A"}
            actualTime={actualTime?.slice(0, 5) || "N/A"}
            platform={pass.platform ? String(pass.platform) : undefined}
            delayMinutes={liveDelay}
            isCancelled={pass.cancelled}
            isLast={index === passListArray.length - 1}
            isFirst={nextStop?.pass_count === 1}
            isCompleted={
              pass.type === "D" &&
              pass.actual_data?.arr_actual_time !== undefined
            }
            isAtStation={getIsAtStation(pass)}
            isUserDestination={isUserDestination}
            isPastDestination={isPastDestination}
            lineFill={lineFill}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timelineContainer: {
    marginTop: 8,
    paddingLeft: 8,
  },
});
