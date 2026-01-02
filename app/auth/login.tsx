import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showError } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(email.toLowerCase().trim(), password);

      if (result.success) {
        // Navigation will be handled automatically by auth state change
        router.replace('/(tabs)');
      } else {
        showError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ marginBottom: 40, alignItems: 'center' }}>
            <Text style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: 8,
              textAlign: 'center'
            }}>
              Welcome Back
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              textAlign: 'center'
            }}>
              Sign in to your fuel credit account
            </Text>
          </View>

          {/* Form */}
          <View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8
              }}>
                Email Address
              </Text>
              <TextInput
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  fontSize: 16,
                  backgroundColor: 'white'
                }}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={{ marginBottom: 30 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8
              }}>
                Password
              </Text>
              <TextInput
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  fontSize: 16,
                  backgroundColor: 'white'
                }}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={{
                width: '100%',
                paddingVertical: 16,
                backgroundColor: loading ? '#9CA3AF' : '#2563EB',
                borderRadius: 8,
                marginBottom: 20
              }}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={{
                color: 'white',
                textAlign: 'center',
                fontSize: 18,
                fontWeight: '600'
              }}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Links */}
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: '#6B7280', marginBottom: 12 }}>
              Don&apos;t have an account?
            </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                <Text style={{
                  color: '#2563EB',
                  fontWeight: '600',
                  fontSize: 16
                }}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}