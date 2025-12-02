import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { OrderAPI, Order } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { MainStackParamList } from "@/navigation/MainNavigator";

type CreateOrderScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, "CreateOrder">;
  route: RouteProp<MainStackParamList, "CreateOrder">;
};

type EarPieceType = Order["earPieceType"];

const EAR_PIECE_OPTIONS: { type: EarPieceType; name: string; price: number; description: string }[] = [
  {
    type: "standard",
    name: "Standard",
    price: 49.99,
    description: "Basic custom-fit ear piece for everyday use",
  },
  {
    type: "premium",
    name: "Premium",
    price: 99.99,
    description: "Enhanced comfort with noise isolation features",
  },
  {
    type: "medical",
    name: "Medical Grade",
    price: 199.99,
    description: "Medical-grade materials for professional use",
  },
];

export default function CreateOrderScreen({
  navigation,
  route,
}: CreateOrderScreenProps) {
  const { user } = useAuth();
  const { jobId } = route.params;

  const [selectedType, setSelectedType] = useState<EarPieceType>("standard");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingName, setShippingName] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingCountry, setShippingCountry] = useState("United States");

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const selectedOption = EAR_PIECE_OPTIONS.find((o) => o.type === selectedType);
  const totalPrice = (selectedOption?.price || 0) * quantity;

  const validateForm = () => {
    if (!shippingName.trim()) {
      Alert.alert("Missing Information", "Please enter your name");
      return false;
    }
    if (!shippingStreet.trim()) {
      Alert.alert("Missing Information", "Please enter your street address");
      return false;
    }
    if (!shippingCity.trim()) {
      Alert.alert("Missing Information", "Please enter your city");
      return false;
    }
    if (!shippingState.trim()) {
      Alert.alert("Missing Information", "Please enter your state");
      return false;
    }
    if (!shippingZip.trim()) {
      Alert.alert("Missing Information", "Please enter your ZIP code");
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      Alert.alert("Error", "Please sign in to place an order");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const order = await OrderAPI.createOrder(
        user.id,
        jobId,
        selectedType,
        quantity
      );

      await OrderAPI.confirmOrder(order.id, {
        name: shippingName.trim(),
        street: shippingStreet.trim(),
        city: shippingCity.trim(),
        state: shippingState.trim(),
        zipCode: shippingZip.trim(),
        country: shippingCountry.trim(),
      });

      setIsSubmitting(false);

      Alert.alert(
        "Order Placed",
        `Your order ${order.id} has been placed successfully! Estimated delivery: 2-3 weeks.`,
        [
          {
            text: "View Orders",
            onPress: () => navigation.navigate("OrderHistory"),
          },
          {
            text: "Go Home",
            onPress: () => navigation.navigate("Dashboard"),
          },
        ]
      );
    } catch (error) {
      setIsSubmitting(false);
      const message = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      Alert.alert("Order Failed", message);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <ThemedText type="h3" style={styles.title}>
          Order Custom Ear Piece
        </ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          Select your ear piece type and shipping details
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Ear Piece Type
        </ThemedText>
        <View style={styles.optionsContainer}>
          {EAR_PIECE_OPTIONS.map((option) => (
            <Pressable
              key={option.type}
              style={[
                styles.optionCard,
                selectedType === option.type && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedType(option.type)}
            >
              <View style={styles.optionHeader}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedType === option.type && styles.radioOuterSelected,
                  ]}
                >
                  {selectedType === option.type && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View style={styles.optionInfo}>
                  <ThemedText type="body" style={styles.optionName}>
                    {option.name}
                  </ThemedText>
                  <ThemedText type="small" style={styles.optionDescription}>
                    {option.description}
                  </ThemedText>
                </View>
                <ThemedText type="body" style={styles.optionPrice}>
                  ${option.price.toFixed(2)}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Quantity
        </ThemedText>
        <View style={styles.quantityContainer}>
          <Pressable
            style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Feather name="minus" size={20} color={quantity <= 1 ? "#CCC" : BrandColors.primaryBlue} />
          </Pressable>
          <View style={styles.quantityValue}>
            <ThemedText type="h4" style={styles.quantityText}>
              {quantity}
            </ThemedText>
          </View>
          <Pressable
            style={styles.quantityButton}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Feather name="plus" size={20} color={BrandColors.primaryBlue} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Shipping Address
        </ThemedText>
        <View style={styles.formContainer}>
          <View
            style={[
              styles.inputContainer,
              focusedField === "name" && styles.inputFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={shippingName}
              onChangeText={setShippingName}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              focusedField === "street" && styles.inputFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              placeholderTextColor="#999"
              value={shippingStreet}
              onChangeText={setShippingStreet}
              onFocus={() => setFocusedField("street")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.inputRow}>
            <View
              style={[
                styles.inputContainer,
                styles.inputHalf,
                focusedField === "city" && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#999"
                value={shippingCity}
                onChangeText={setShippingCity}
                onFocus={() => setFocusedField("city")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View
              style={[
                styles.inputContainer,
                styles.inputHalf,
                focusedField === "state" && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#999"
                value={shippingState}
                onChangeText={setShippingState}
                onFocus={() => setFocusedField("state")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View
              style={[
                styles.inputContainer,
                styles.inputHalf,
                focusedField === "zip" && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="ZIP Code"
                placeholderTextColor="#999"
                value={shippingZip}
                onChangeText={setShippingZip}
                keyboardType="number-pad"
                onFocus={() => setFocusedField("zip")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View
              style={[
                styles.inputContainer,
                styles.inputHalf,
                focusedField === "country" && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Country"
                placeholderTextColor="#999"
                value={shippingCountry}
                onChangeText={setShippingCountry}
                onFocus={() => setFocusedField("country")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <ThemedText type="body" style={styles.summaryLabel}>
            {selectedOption?.name} x {quantity}
          </ThemedText>
          <ThemedText type="body" style={styles.summaryValue}>
            ${totalPrice.toFixed(2)}
          </ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText type="body" style={styles.summaryLabel}>
            Shipping
          </ThemedText>
          <ThemedText type="body" style={styles.summaryValue}>
            Free
          </ThemedText>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <ThemedText type="h4" style={styles.totalLabel}>
            Total
          </ThemedText>
          <ThemedText type="h4" style={styles.totalValue}>
            ${totalPrice.toFixed(2)}
          </ThemedText>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.buttonPressed,
          isSubmitting && styles.buttonDisabled,
        ]}
        onPress={handleSubmitOrder}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={BrandColors.white} />
        ) : (
          <>
            <Feather name="check-circle" size={20} color={BrandColors.white} />
            <ThemedText
              type="body"
              style={styles.submitButtonText}
              lightColor={BrandColors.white}
              darkColor={BrandColors.white}
            >
              Place Order
            </ThemedText>
          </>
        )}
      </Pressable>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing["2xl"],
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  title: {
    color: BrandColors.darkText,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: "#666",
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    color: BrandColors.darkText,
    marginBottom: Spacing.lg,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    padding: Spacing.lg,
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  optionCardSelected: {
    borderColor: BrandColors.primaryBlue,
    backgroundColor: "rgba(26, 92, 255, 0.05)",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CCC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  radioOuterSelected: {
    borderColor: BrandColors.primaryBlue,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BrandColors.primaryBlue,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    color: BrandColors.darkText,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionDescription: {
    color: "#666",
  },
  optionPrice: {
    color: BrandColors.primaryBlue,
    fontWeight: "700",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityValue: {
    width: 60,
    alignItems: "center",
  },
  quantityText: {
    color: BrandColors.darkText,
  },
  formContainer: {
    gap: Spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  inputContainer: {
    backgroundColor: BrandColors.lightBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputHalf: {
    flex: 1,
  },
  inputFocused: {
    borderColor: BrandColors.highlightYellow,
  },
  input: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: BrandColors.darkText,
  },
  summarySection: {
    backgroundColor: BrandColors.lightBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    color: "#666",
  },
  summaryValue: {
    color: BrandColors.darkText,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Spacing.md,
  },
  totalLabel: {
    color: BrandColors.darkText,
  },
  totalValue: {
    color: BrandColors.primaryBlue,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    backgroundColor: BrandColors.primaryBlue,
    borderRadius: BorderRadius.md,
  },
  submitButtonText: {
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
