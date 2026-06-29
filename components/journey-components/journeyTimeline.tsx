import React from "react";
import { View, StyleSheet } from "react-native";
import TimelineCard from "./timelineCard";
import { capitalizeWords } from "@/utils/string";

interface JourneyTimelineProps {
  passListArray: any[];
  destinationStation: any;
  nextStop: any;
  trainInfo: any;
}

export default function JourneyTimeline({
  passListArray,
  destinationStation,
  nextStop,
  trainInfo,
}: JourneyTimelineProps) {
  return (
    <View style={styles.timelineContainer}>
      {passListArray.map((pass: any, index: number) => {
        const isUserDestination =
          pass.station.station_id === destinationStation?.station_id;
        const destinationIndex = passListArray.findIndex(
          (p: any) => p.station.station_id === destinationStation?.station_id,
        );
        const isPastDestination =
          destinationIndex !== -1 && index > destinationIndex;

        let status: any = "future";
        if (pass === nextStop) {
          status = "current";
        } else if (
          (nextStop && pass.pass_count < nextStop.pass_count) ||
          (pass.type === "O" &&
            pass.actual_data?.dep_actual_time !== undefined) ||
          (pass.type === "D" &&
            pass.actual_data?.arr_actual_time !== undefined) ||
          (pass.actual_data?.arr_actual_time !== undefined &&
            pass.actual_data?.dep_actual_time !== undefined)
        ) {
          status = "past";
        }

        let lineFill: "full" | "half" | "none" = "none";
        if (index < passListArray.length - 1) {
          const nextPass = passListArray[index + 1];
          let nextStatus = "future";
          if (nextPass === nextStop) {
            nextStatus = "current";
          } else if (
            (nextStop && nextPass.pass_count < nextStop.pass_count) ||
            (nextPass.type === "O" &&
              nextPass.actual_data?.dep_actual_time !== undefined) ||
            (nextPass.type === "D" &&
              nextPass.actual_data?.arr_actual_time !== undefined) ||
            (nextPass.actual_data?.arr_actual_time !== undefined &&
              nextPass.actual_data?.dep_actual_time !== undefined)
          ) {
            nextStatus = "past";
          }

          if (nextStatus === "past") {
            lineFill = "full";
          } else if (nextStatus === "current") {
            const isNextAtStation =
              nextPass.actual_data?.arr_actual_time !== undefined &&
              nextPass.actual_data?.dep_actual_time === undefined &&
              nextPass.type !== "D";
            lineFill = isNextAtStation ? "full" : "half";
          } else {
            lineFill = "none";
          }
        }

        const scheduledTime = pass.type === "O" ? pass.dep_time : pass.arr_time;
        const actualTime =
          pass.type === "O"
            ? pass.actual_data?.dep_actual_time
            : pass.actual_data?.arr_actual_time;

        return (
          <TimelineCard
            key={pass.station.station_id}
            status={status}
            stationName={capitalizeWords(pass.station.station_ori_name)}
            scheduledTime={scheduledTime?.slice(0, 5) || "N/A"}
            actualTime={actualTime?.slice(0, 5) || "N/A"}
            platform={pass.platform ? String(pass.platform) : undefined}
            delayMinutes={trainInfo.delay ? trainInfo.delay : 0}
            isCancelled={pass.cancelled}
            isLast={index === passListArray.length - 1}
            isFirst={nextStop?.pass_count === 1}
            isCompleted={
              pass.type === "D" &&
              pass.actual_data?.arr_actual_time !== undefined
            }
            isAtStation={
              pass.actual_data?.arr_actual_time !== undefined &&
              pass.actual_data?.dep_actual_time === undefined &&
              pass.type !== "D"
            }
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
