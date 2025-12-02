import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardScreen from "@/screens/DashboardScreen";
import CameraCaptureScreen from "@/screens/CameraCaptureScreen";
import UploadScreen from "@/screens/UploadScreen";
import ReconstructionStatusScreen from "@/screens/ReconstructionStatusScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import CreateOrderScreen from "@/screens/CreateOrderScreen";
import OrderHistoryScreen from "@/screens/OrderHistoryScreen";
import OrderDetailScreen from "@/screens/OrderDetailScreen";
import AdminDashboardScreen from "@/screens/AdminDashboardScreen";
import ModelViewerScreen from "@/screens/ModelViewerScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { BrandColors } from "@/constants/theme";

export type MainStackParamList = {
  Dashboard: undefined;
  CameraCapture: undefined;
  Upload: undefined;
  ReconstructionStatus: undefined;
  Settings: undefined;
  CreateOrder: { jobId: string };
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
  AdminDashboard: undefined;
  ModelViewer: { jobId: string };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: () => <HeaderTitle title="FitMyEar" />,
        }}
      />
      <Stack.Screen
        name="CameraCapture"
        component={CameraCaptureScreen}
        options={{
          headerTitle: "Capture Photos",
          headerTransparent: false,
          headerStyle: {
            backgroundColor: BrandColors.darkText,
          },
          headerTintColor: BrandColors.white,
        }}
      />
      <Stack.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          headerTitle: "Upload Photos",
        }}
      />
      <Stack.Screen
        name="ReconstructionStatus"
        component={ReconstructionStatusScreen}
        options={{
          headerTitle: "Status",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="CreateOrder"
        component={CreateOrderScreen}
        options={{
          headerTitle: "New Order",
        }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{
          headerTitle: "My Orders",
        }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{
          headerTitle: "Order Details",
        }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          headerTitle: "Admin",
        }}
      />
      <Stack.Screen
        name="ModelViewer"
        component={ModelViewerScreen}
        options={{
          headerTitle: "3D Model",
        }}
      />
    </Stack.Navigator>
  );
}
