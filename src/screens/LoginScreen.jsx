import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Checkbox,
  HelperText,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../context/AuthContext";

export function LoginScreen() {
  const { login } = useAuthContext();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = () => {
    setErrorMessage("");
    if (!username || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const result = login(username, password);
    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Top Accent Stripe */}
      <View style={styles.accentBarContainer}>
        <View style={[styles.accentBar, { backgroundColor: "#F39C12" }]} />
        <View style={[styles.accentBar, { backgroundColor: "#27AE60" }]} />
        <View style={[styles.accentBar, { backgroundColor: "#2980B9" }]} />
        <View style={[styles.accentBar, { backgroundColor: "#114B70" }]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.mainContent}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Image
                source={require("../../assets/pm.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Welcome to Project Monitoring</Text>
              {/* <Text style={styles.subtitle}>
                Sign in to your Project Monitoring workspace
              </Text> */}
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>USERNAME</Text>
                <TextInput
                  placeholder="Enter your username"
                  placeholderTextColor="#A0AEC0"
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  autoCapitalize="none"
                  outlineColor="#E2E8F0"
                  activeOutlineColor="#114B70"
                  left={<TextInput.Icon icon="account" color="#A0AEC0" />}
                  style={styles.input}
                  contentStyle={styles.inputText}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  outlineColor="#E2E8F0"
                  activeOutlineColor="#114B70"
                  left={<TextInput.Icon icon="lock" color="#A0AEC0" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      color="#A0AEC0"
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                  contentStyle={styles.inputText}
                />
              </View>

              {/* Options Row */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  activeOpacity={0.7}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <Checkbox.Android
                    status={rememberMe ? "checked" : "unchecked"}
                    onPress={() => setRememberMe(!rememberMe)}
                    color="#114B70"
                    uncheckedColor="#CBD5E1"
                  />
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
                labelStyle={styles.submitButtonLabel}
                icon="login"
              >
                Sign In
              </Button>
            </View>
            {errorMessage ? (
              <HelperText type="error" visible={true} style={styles.errorText}>
                {errorMessage}
              </HelperText>
            ) : null}
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <View style={styles.divider} />
            <Text style={styles.footerText}>
              Need access?{" "}
              <Text style={styles.adminLink}>Contact your administrator</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  accentBarContainer: {
    flexDirection: "row",
    height: 4,
    width: "100%",
  },
  accentBar: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  mainContent: {
    marginTop: 60,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 330,
    height: 70,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34A2C3",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
  },
  errorText: {
    textAlign: "center",
    marginTop: 8,
  },
  formSection: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  inputText: {
    fontSize: 14,
    color: "#0F172A",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -8,
  },
  rememberMeText: {
    fontSize: 14,
    color: "#64748B",
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#114B70",
  },
  submitButton: {
    borderRadius: 8,
    backgroundColor: "#114B70",
    elevation: 0,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  footerSection: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    marginTop: 32,
    alignItems: "center",
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#F1F5F9",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: "#64748B",
  },
  adminLink: {
    fontWeight: "600",
    color: "#114B70",
  },
});
