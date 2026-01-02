import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import "./globals.css";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('Index page - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('Redirecting to tabs');
        // User is logged in, redirect to main app
        router.replace("/(tabs)");
      } else {
        console.log('User not authenticated - showing landing page');
        // If not authenticated, stay on this page to show login/register options
      }
    }
  }, [isAuthenticated, isLoading]);

  // Show loading screen while checking auth state
  if (isLoading) {
    console.log('Showing loading screen');
    return (
      <View className="flex-1 items-center justify-center bg-blue-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-blue-600 mt-4 text-lg">Loading...</Text>
      </View>
    );
  }

  console.log('Showing landing page');
  return (
    <View className="flex-1 items-center justify-center bg-blue-50 px-8">
      {/* Logo/Brand Section */}
      <View className="mb-12 items-center">
        <Text className="text-5xl font-bold text-blue-600 mb-4">
          FuelCredit
        </Text>
        <Text className="text-xl text-gray-700 text-center">
          Buy fuel now, pay later
        </Text>
        <Text className="text-base text-gray-500 text-center mt-2">
          Your trusted fuel credit partner
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="w-full max-w-sm">
        <TouchableOpacity
          className="bg-blue-600 py-4 px-8 rounded-lg mb-4 active:bg-blue-700"
          onPress={() => router.push('/auth/login')}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border-2 border-blue-600 py-4 px-8 rounded-lg active:bg-blue-50"
          onPress={() => router.push('/auth/register')}
        >
          <Text className="text-blue-600 text-center text-lg font-semibold">
            Create Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Features */}
      <View className="mt-12 items-center">
        <Text className="text-gray-600 text-sm text-center mb-2">
          • Instant fuel purchase on credit
        </Text>
        <Text className="text-gray-600 text-sm text-center mb-2">
          • Flexible repayment options
        </Text>
        <Text className="text-gray-600 text-sm text-center">
          • Earn rewards for timely payments
        </Text>
      </View>
    </View>
  );
}
