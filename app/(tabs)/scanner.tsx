import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScannerScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-8">
        <Ionicons name="qr-code-outline" size={120} color="#3B82F6" />
        <Text className="text-2xl font-bold text-gray-800 mb-4 mt-8">
          QR Scanner
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Scan the QR code from the fuel attendant to start your purchase.
        </Text>
        <TouchableOpacity className="bg-blue-600 py-4 px-8 rounded-lg">
          <Text className="text-white text-lg font-semibold">
            Open Scanner
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}