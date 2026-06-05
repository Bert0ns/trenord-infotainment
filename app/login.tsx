import DropDownSelector from "@/components/ui/dropDownSelector";
import { Fonts } from "@/constants/theme";
import { createStyleHook, useTheme } from "@/hooks/use-theme-color";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRScanner from "@/components/ui/qr-scanner";
import { useLogin } from "@/hooks/use-login";

const BACKGROUND_IMAGE = {
  uri: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1400&q=80",
};

export default function LoginScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    ticketCode,
    destination,
    isLoading,
    trainData,
    stations,
    errorMsg,
    canSearch,
    canStart,
    setDestination,
    handleCodeChange,
    handleSearch,
    handleQRScan,
    handleStart,
  } = useLogin();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={BACKGROUND_IMAGE}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              {
                paddingTop: insets.top + 32,
                paddingBottom: insets.bottom + 24,
              },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.heroBlock}>
              <View style={styles.hero}>
                <View style={styles.logoBadge}>
                  <MaterialIcons name="train" size={34} color="#ffffff" />
                </View>
                <Text style={styles.title}>Trenord</Text>
                <Text style={styles.subtitle}>Your journey starts here</Text>
              </View>

              <View style={styles.card}>
                {!trainData && (
                  <>
                    <View style={styles.scannerWrapper}>
                      <QRScanner onScan={handleQRScan} style={styles.scanner} />
                    </View>
                    <View style={styles.dividerContainer}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>OR</Text>
                      <View style={styles.dividerLine} />
                    </View>
                  </>
                )}

                <View style={styles.field}>
                  <Text style={styles.label}>Ticket code</Text>
                  <View style={styles.inputRow}>
                    <MaterialIcons
                      name="confirmation-number"
                      size={22}
                      color={theme.colors.mutedForeground}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Enter 4-7 digit code"
                      placeholderTextColor={theme.colors.mutedForeground}
                      keyboardType="number-pad"
                      maxLength={7}
                      value={ticketCode}
                      onChangeText={handleCodeChange}
                      style={styles.textInput}
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {errorMsg && (
                  <View style={styles.errorContainer}>
                    <MaterialIcons
                      name="error-outline"
                      size={20}
                      color="#ef4444"
                    />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                )}

                {trainData && stations.length > 0 && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Destination station</Text>
                    <DropDownSelector
                      options={stations.map((s) => s.station_ori_name)}
                      selectedValue={destination}
                      onSelect={setDestination}
                      placeholder="Select destination"
                      leadingIconName="place"
                      leadingIconColor={theme.colors.mutedForeground}
                      placeholderTextColor={theme.colors.mutedForeground}
                    />
                  </View>
                )}

                {!trainData ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.startButton,
                      !canSearch && styles.startButtonDisabled,
                    ]}
                    onPress={handleSearch}
                    disabled={!canSearch || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator
                        color={theme.colors.primaryForeground}
                      />
                    ) : (
                      <>
                        <Text style={styles.startButtonText}>Search Train</Text>
                        <MaterialIcons
                          name="search"
                          size={20}
                          color={theme.colors.primaryForeground}
                        />
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.startButton,
                      !canStart && styles.startButtonDisabled,
                    ]}
                    onPress={handleStart}
                    disabled={!canStart}
                  >
                    <Text style={styles.startButtonText}>Start Journey</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color={theme.colors.primaryForeground}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.footerAction}
                onPress={() => router.push("/(tabs)/settings")}
              >
                <MaterialIcons
                  name="settings"
                  size={18}
                  color={theme.colors.mutedForeground}
                />
                <Text style={styles.footerText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    opacity: 0.55,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroBlock: {
    width: "100%",
    alignItems: "center",
    gap: 24,
  },
  hero: {
    alignItems: "center",
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: theme.colors.foreground,
    letterSpacing: 0.4,
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: theme.colors.mutedForeground,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    backgroundColor: theme.colors.backgroundTransparent,
    borderWidth: 1,
    borderColor: theme.colors.borderTransparent,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  scannerWrapper: {
    width: "100%",
    alignItems: "center",
  },
  scanner: {
    width: "100%",
    height: 280,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderTransparent,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: theme.colors.mutedForeground,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderTransparent,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.foreground,
    padding: 0,
  },
  startButton: {
    marginTop: 4,
    paddingVertical: 16,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.primaryForeground,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
  },
  footerDivider: {
    width: 1,
    height: 16,
    backgroundColor: theme.colors.borderTransparent,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: -4,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#ef4444",
    lineHeight: 20,
    fontWeight: "500",
  },
}));
