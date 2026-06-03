import { Redirect } from "expo-router";
import { useJourneyStore } from "@/store/journeyStore";
import React from "react";

export default function Index() {
  const trainId = useJourneyStore((s) => s.trainId);

  // Auth Guard: Direct to home if logged in, else login page
  if (trainId) {
    return <Redirect href="/(tabs)/home" />;
  }
  return <Redirect href="/login" />;
}
