import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Loading user data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Safe number conversion for financial data
  const creditLimit = user.fuelAccount?.creditLimit ? Number(user.fuelAccount.creditLimit) : 0;
  const balance = user.fuelAccount?.balance ? Number(user.fuelAccount.balance) : 0;
  const availableCredit = creditLimit - balance;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-600 px-6 py-8">
          <Text className="text-white text-2xl font-bold mb-1">
            Welcome back, {user.firstName}!
          </Text>
          <Text className="text-blue-100 text-base">
            Ready to fuel up your journey
          </Text>
        </View>

        {/* Credit Overview Card */}
        <View className="mx-6 -mt-4 bg-white rounded-xl shadow-lg p-6 mb-6">
          <Text className="text-gray-800 text-lg font-semibold mb-4">
            Your Credit Account
          </Text>
          
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-gray-500 text-sm">Available Credit</Text>
              <Text className="text-green-600 text-3xl font-bold">
                GHS {availableCredit.toFixed(2)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-500 text-sm">Credit Limit</Text>
              <Text className="text-gray-800 text-lg font-semibold">
                GHS {creditLimit.toFixed(2)}
              </Text>
            </View>
          </View>

          <View className="bg-gray-100 rounded-lg p-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600 text-sm">Outstanding Balance</Text>
              <Text className="text-orange-600 font-semibold">
                GHS {balance.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-6 mb-6">
          <Text className="text-gray-800 text-lg font-semibold mb-4">
            Quick Actions
          </Text>
          
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-white rounded-lg p-4 flex-1 mr-2 items-center shadow-sm">
              <Ionicons name="qr-code-outline" size={32} color="#3B82F6" />
              <Text className="text-gray-800 font-medium mt-2">Scan QR</Text>
              <Text className="text-gray-500 text-xs text-center">Buy Fuel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white rounded-lg p-4 flex-1 mx-1 items-center shadow-sm">
              <Ionicons name="card-outline" size={32} color="#10B981" />
              <Text className="text-gray-800 font-medium mt-2">Pay Bill</Text>
              <Text className="text-gray-500 text-xs text-center">Repayment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white rounded-lg p-4 flex-1 ml-2 items-center shadow-sm">
              <Ionicons name="gift-outline" size={32} color="#F59E0B" />
              <Text className="text-gray-800 font-medium mt-2">Rewards</Text>
              <Text className="text-gray-500 text-xs text-center">120 Points</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="mx-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-800 text-lg font-semibold">
              Recent Transactions
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-lg shadow-sm">
            {/* Mock transactions */}
            {[
              { date: '2026-01-01', station: 'Shell Station', amount: -45.00, status: 'Completed' },
              { date: '2025-12-30', station: 'Total Station', amount: -32.50, status: 'Completed' },
              { date: '2025-12-28', station: 'Payment', amount: +100.00, status: 'Payment' },
            ].map((transaction, index) => (
              <View
                key={index}
                className={`flex-row justify-between items-center p-4 ${
                  index !== 2 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">
                    {transaction.station}
                  </Text>
                  <Text className="text-gray-500 text-sm">{transaction.date}</Text>
                </View>
                <View className="items-end">
                  <Text
                    className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}GHS {Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                  <Text className="text-gray-500 text-sm">{transaction.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}