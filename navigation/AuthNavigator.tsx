import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthLandingScreen from "@/screens/AuthLandingScreen";
import SignInScreen from "@/screens/SignInScreen";
import SignUpScreen from "@/screens/SignUpScreen";
import PhoneSignInScreen from "@/screens/PhoneSignInScreen";
import OTPVerificationScreen from "@/screens/OTPVerificationScreen";
import { BrandColors } from "@/constants/theme";

export type AuthStackParamList = {
  AuthLanding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  PhoneSignIn: undefined;
  OTPVerification: {
    phoneNumber: string;
    isSignUp: boolean;
  };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AuthLanding"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: BrandColors.warmPeach },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="PhoneSignIn" component={PhoneSignInScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
}
