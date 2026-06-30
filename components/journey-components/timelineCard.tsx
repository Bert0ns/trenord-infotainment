import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Animated, Text, View } from "react-native";

type NodeStatus = "past" | "current" | "future";

interface TimelineCardProps {
  status: NodeStatus;
  stationName: string;
  scheduledTime: string;
  estimatedTime?: string;
  actualTime?: string;
  platform?: string;
  delayMinutes: number;
  isCancelled?: boolean;
  isLast?: boolean;
  isFirst?: boolean;
  isCompleted?: boolean;
  isAtStation?: boolean;
  isUserDestination?: boolean;
  isPastDestination?: boolean;
  lineFill?: "full" | "half" | "none";
}

export default function TimelineCard({
  status,
  stationName,
  scheduledTime,
  actualTime,
  estimatedTime,
  platform,
  delayMinutes,
  isCancelled,
  isLast,
  isFirst,
  isCompleted,
  isAtStation,
  isUserDestination,
  isPastDestination,
  lineFill = "none",
}: TimelineCardProps) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation("journey", { keyPrefix: "timelineCard" });

  const isPast = status === "past";
  const isCurrent = status === "current";
  const isFuture = status === "future";

  const getMinutes = (timeString: string) => {
    const [h, m] = timeString.split(":").map(Number);
    return h * 60 + m;
  };

  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    if (!isCurrent) return;

    // Update the 'now' reference every 15 seconds so the minutes countdown stays perfectly accurate
    const interval = setInterval(() => {
      setNow(new Date());
    }, 15000);

    return () => clearInterval(interval);
  }, [isCurrent]);

  const getCalculatedTime = () => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let diff = getMinutes(scheduledTime) - currentMinutes + delayMinutes;
    if (diff < -720) diff += 1440;
    if (diff > 720) diff -= 1440;
    return Math.max(0, diff);
  };

  const calculatedTime = getCalculatedTime();

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isCurrent, pulseAnim]);

  return (
    <View style={styles.container}>
      <TimelineColumn
        isLast={isLast}
        lineFill={lineFill}
        isCancelled={isCancelled}
        isCurrent={isCurrent}
        isUserDestination={isUserDestination}
        isFuture={isFuture}
        isPast={isPast}
        isPastDestination={isPastDestination}
        pulseAnim={pulseAnim}
        theme={theme}
        styles={styles}
      />

      <View
        style={[
          styles.contentColumn,
          (isPast || (isPastDestination && !isCurrent)) &&
            !isUserDestination && { opacity: 0.8 },
        ]}
      >
        <CardContent
          stationName={stationName}
          scheduledTime={scheduledTime}
          estimatedTime={estimatedTime}
          actualTime={actualTime}
          platform={platform}
          delayMinutes={delayMinutes}
          isCancelled={isCancelled}
          isFirst={isFirst}
          isCompleted={isCompleted}
          isAtStation={isAtStation}
          isUserDestination={isUserDestination}
          isPastDestination={isPastDestination}
          isCurrent={isCurrent}
          isFuture={isFuture}
          isPast={isPast}
          isLast={isLast}
          calculatedTime={calculatedTime}
          t={t}
          theme={theme}
          styles={styles}
        />
      </View>
    </View>
  );
}

// --- Extracted Components to reduce cognitive load ---

function TimelineColumn({
  isLast,
  lineFill,
  isCancelled,
  isCurrent,
  isUserDestination,
  isFuture,
  isPast,
  isPastDestination,
  pulseAnim,
  theme,
  styles,
}: {
  isLast?: boolean;
  lineFill: "full" | "half" | "none";
  isCancelled?: boolean;
  isCurrent?: boolean;
  isUserDestination?: boolean;
  isFuture?: boolean;
  isPast?: boolean;
  isPastDestination?: boolean;
  pulseAnim: Animated.Value;
  theme: any;
  styles: any;
}) {
  return (
    <View style={styles.timelineColumn}>
      {/* Vertical Line */}
      {!isLast && (
        <View style={styles.lineContainer}>
          <View
            style={[
              styles.lineHalf,
              {
                backgroundColor:
                  lineFill === "none"
                    ? theme.colors.border
                    : theme.colors.primary,
              },
            ]}
          />
          <View
            style={[
              styles.lineHalf,
              {
                backgroundColor:
                  lineFill === "full"
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
          />
        </View>
      )}
      {/* Dot */}
      {isCancelled === true && (
        <MaterialIcons
          name="cancel"
          size={14}
          color={theme.colors.destructive}
          style={{
            position: "absolute",
            zIndex: 3,
            marginTop: theme.spacing.sm + 4,
          }}
        />
      )}
      {!isCancelled && (
        <Animated.View
          style={[
            styles.dot,
            isCurrent && styles.dotCurrent,
            isUserDestination && styles.dotDestination,
            isFuture && {
              backgroundColor: theme.colors.border,
              borderColor: theme.colors.background,
            },
            (isPast || isCurrent) && {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.background,
            },
            (isPast || (isPastDestination && !isCurrent)) && {
              opacity: 0.8, // subtle dim instead of 0.4
            },
            isCurrent && {
              opacity: pulseAnim,
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}
        />
      )}
    </View>
  );
}

function CardContent({
  stationName,
  scheduledTime,
  estimatedTime,
  actualTime,
  platform,
  delayMinutes,
  isCancelled,
  isFirst,
  isCompleted,
  isAtStation,
  isUserDestination,
  isPastDestination,
  isCurrent,
  isFuture,
  isPast,
  isLast,
  calculatedTime,
  t,
  theme,
  styles,
}: {
  stationName: string;
  scheduledTime: string;
  estimatedTime?: string;
  actualTime?: string;
  platform?: string;
  delayMinutes: number;
  isCancelled?: boolean;
  isFirst?: boolean;
  isCompleted?: boolean;
  isAtStation?: boolean;
  isUserDestination?: boolean;
  isPastDestination?: boolean;
  isCurrent?: boolean;
  isFuture?: boolean;
  isPast?: boolean;
  isLast?: boolean;
  calculatedTime: number;
  t: any;
  theme: any;
  styles: any;
}) {
  return (
    <View
      style={[
        styles.card,
        isCurrent && styles.currentCard,
        isUserDestination && styles.destinationCard,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          {isUserDestination && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text
                style={[
                  styles.subInfoText,
                  {
                    color: theme.colors.homeSecondary,
                    fontWeight: "700",
                    fontSize: 11,
                    letterSpacing: 1,
                  },
                ]}
              >
                {t("destination").toUpperCase()}
              </Text>
            </View>
          )}
          <Text
            style={[
              styles.stationName,
              isCurrent && styles.currentStationName,
              isUserDestination && styles.destinationStationName,
              isFuture && styles.textMuted,
              (isPast || isPastDestination) &&
                !isCurrent &&
                !isUserDestination && { color: theme.colors.mutedForeground },
            ]}
          >
            {stationName}
          </Text>

          <SubInfoRow
            platform={platform}
            isCurrent={isCurrent}
            isCompleted={isCompleted}
            isFirst={isFirst}
            isUserDestination={isUserDestination}
            isAtStation={isAtStation}
            calculatedTime={calculatedTime}
            isCancelled={isCancelled}
            delayMinutes={delayMinutes}
            t={t}
            theme={theme}
            styles={styles}
          />
        </View>

        <TimeContainer
          scheduledTime={scheduledTime}
          actualTime={actualTime}
          estimatedTime={estimatedTime}
          isPast={isPast}
          isCurrent={isCurrent}
          isFuture={isFuture}
          isUserDestination={isUserDestination}
          isLast={isLast}
          t={t}
          theme={theme}
          styles={styles}
        />
      </View>
    </View>
  );
}

function SubInfoRow({
  platform,
  isCurrent,
  isCompleted,
  isFirst,
  isUserDestination,
  isAtStation,
  calculatedTime,
  isCancelled,
  delayMinutes,
  t,
  theme,
  styles,
}: {
  platform?: string;
  isCurrent?: boolean;
  isCompleted?: boolean;
  isFirst?: boolean;
  isUserDestination?: boolean;
  isAtStation?: boolean;
  calculatedTime: number;
  isCancelled?: boolean;
  delayMinutes: number;
  t: any;
  theme: any;
  styles: any;
}) {
  return (
    <>
      <View style={styles.subInfoRow}>
        {/* Platform */}
        {!!platform && !isCurrent && (
          <Text
            style={[
              styles.subInfoText,
              isUserDestination && { color: theme.colors.homeSecondary },
            ]}
          >
            {t("platform", { platform })}
          </Text>
        )}
        {/* Arriving / Departing + Platform */}
        {isCurrent && isCompleted && (
          <Text
            style={[
              styles.arrivingText,
              isUserDestination && { color: theme.colors.homeSecondary },
            ]}
          >
            {t("arrived")}
            {platform ? ` • ${t("platform", { platform })}` : ""}
          </Text>
        )}
        {isCurrent && !isCompleted && (isFirst || isAtStation) && (
          <Text
            style={[
              styles.arrivingText,
              isUserDestination && { color: theme.colors.homeSecondary },
            ]}
          >
            {t("departingIn", { minutes: calculatedTime })}
            {platform ? ` • ${t("platform", { platform })}` : ""}
          </Text>
        )}
        {isCurrent && !isCompleted && !isFirst && !isAtStation && (
          <Text
            style={[
              styles.arrivingText,
              isUserDestination && { color: theme.colors.homeSecondary },
            ]}
          >
            {t("arrivingIn", { minutes: calculatedTime })}
            {platform ? ` • ${t("platform", { platform })}` : ""}
          </Text>
        )}
        {/* Cancelled */}
        {isCancelled && (
          <View style={styles.onTimeRow}>
            <Text
              style={[styles.subInfoText, { color: theme.colors.destructive }]}
            >
              {t("cancelled")}
            </Text>
          </View>
        )}
      </View>

      {/* Delay Badge */}
      {isCurrent && delayMinutes > 0 && (
        <View style={styles.delayBadge}>
          <MaterialIcons
            name="warning"
            size={12}
            color={theme.colors.destructiveForeground}
          />
          <Text style={styles.delayText}>
            {t("minutesDelay", { minutes: delayMinutes })}
          </Text>
        </View>
      )}
    </>
  );
}

function TimeContainer({
  scheduledTime,
  actualTime,
  estimatedTime,
  isPast,
  isCurrent,
  isFuture,
  isUserDestination,
  isLast,
  t,
  theme,
  styles,
}: {
  scheduledTime: string;
  actualTime?: string;
  estimatedTime?: string;
  isPast?: boolean;
  isCurrent?: boolean;
  isFuture?: boolean;
  isUserDestination?: boolean;
  isLast?: boolean;
  t: any;
  theme: any;
  styles: any;
}) {
  return (
    <View style={styles.timeContainer}>
      {/* Scheduled Time */}
      <Text
        style={[
          styles.scheduledTime,
          isUserDestination && { color: theme.colors.homeSecondary },
          isPast && styles.timeStrikethrough,
          isCurrent && styles.timeCurrent,
          isCurrent &&
            isUserDestination && { color: theme.colors.homeSecondary },
        ]}
      >
        {scheduledTime}
      </Text>
      {/* Actual departed/arrived time */}
      {!!actualTime && isPast && (
        <Text
          style={[
            styles.statusText,
            {
              color: isUserDestination
                ? theme.colors.homeSecondary
                : theme.colors.primary,
            },
          ]}
        >
          {isUserDestination || isLast
            ? t("arrivedAt", { time: actualTime })
            : t("departedAt", { time: actualTime })}
        </Text>
      )}
      {/* Estimated time */}
      {isFuture && (
        <Text
          style={[
            styles.subInfoText,
            isUserDestination && { color: theme.colors.homeSecondary },
          ]}
        >
          {estimatedTime}
        </Text>
      )}
    </View>
  );
}
const useStyles = createStyleHook((theme) => ({
  container: {
    flexDirection: "row",
    minHeight: 80,
  },
  timelineColumn: {
    width: 30,
    alignItems: "center",
  },
  lineContainer: {
    position: "absolute",
    top: 24,
    bottom: -5,
    width: 2,
    zIndex: 1,
  },
  lineHalf: {
    flex: 1,
    width: "100%",
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    marginTop: theme.spacing.sm + 4,
    zIndex: 2,
  },
  dotCurrent: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    marginTop: theme.spacing.md + 4,
  },
  dotDestination: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    marginTop: theme.spacing.md,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  currentCard: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
  },
  destinationCard: {
    backgroundColor: theme.colors.homeLiveStatus,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.homeSecondary,
    borderRadius: theme.borderRadius.xl,
    marginTop: -4,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stationName: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  currentStationName: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  destinationStationName: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.destructiveForeground,
  },
  textMuted: {
    color: theme.colors.mutedForeground,
  },
  subInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  subInfoText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  onTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrivingText: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  destinationText: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  delayBadge: {
    backgroundColor: theme.colors.destructive,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  delayText: {
    color: theme.colors.destructiveForeground,
    fontSize: 12,
    fontWeight: "600",
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  scheduledTime: {
    fontSize: 15,
    color: theme.colors.mutedForeground,
  },
  timeStrikethrough: {
    textDecorationLine: "line-through",
    color: theme.colors.border,
  },
  timeCurrent: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  inMinsText: {
    fontSize: 13,
    color: theme.colors.foreground,
    marginTop: 2,
  },
}));
