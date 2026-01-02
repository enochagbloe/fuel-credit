import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { showConfirm } = useToast();

  const handleLogout = () => {
    showConfirm(
      'Logout',
      'Are you sure you want to logout?',
      async () => {
        await logout();
        // Navigation will be handled automatically by auth state change
      }
    );
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-gray-800 mb-8">
          Profile
        </Text>

        {/* Profile Info */}
        <View className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <View className="items-center mb-6">
            <View className="bg-blue-100 rounded-full p-6 mb-4">
              <Ionicons name="person-outline" size={40} color="#3B82F6" />
            </View>
            <Text className="text-xl font-semibold text-gray-800">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-gray-600">{user.email}</Text>
            {user.fuelAccount && (
              <Text className="text-sm text-blue-600 mt-2">
                Account Status: {user.fuelAccount.status}
              </Text>
            )}
          </View>
        </View>

        {/* Menu Options */}
        <View className="bg-white rounded-lg shadow-sm">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="person-outline" size={24} color="#6B7280" />
            <Text className="ml-4 text-gray-800 font-medium flex-1">
              Personal Information
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="card-outline" size={24} color="#6B7280" />
            <Text className="ml-4 text-gray-800 font-medium flex-1">
              Payment Methods
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="notifications-outline" size={24} color="#6B7280" />
            <Text className="ml-4 text-gray-800 font-medium flex-1">
              Notifications
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
            <Text className="ml-4 text-gray-800 font-medium flex-1">
              Help & Support
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center p-4"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text className="ml-4 text-red-500 font-medium flex-1">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}