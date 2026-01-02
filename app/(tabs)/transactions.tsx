import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransactionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-8">
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          Transaction History
        </Text>
        <Text className="text-gray-600 text-center">
          Your fuel purchase and payment history will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}