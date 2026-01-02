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

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showError, showConfirm } = useToast();

  const handleRegister = async () => {
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password,
      });

      if (result.success) {
        showConfirm(
          'Success', 
          'Account created successfully! You can now sign in.',
          () => router.replace('/auth/login')
        );
      } else {
        showError(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
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
              Create Account
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              textAlign: 'center'
            }}>
              Start your fuel credit journey
            </Text>
          </View>

          {/* Form */}
          <View>
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8
              }}>
                First Name
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
                placeholder="Enter your first name"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8
              }}>
                Last Name
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
                placeholder="Enter your last name"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
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

            <View style={{ marginBottom: 16 }}>
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
                placeholder="Create a password (min. 6 characters)"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={{ marginBottom: 30 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#374151',
                marginBottom: 8
              }}>
                Confirm Password
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
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={{
                width: '100%',
                paddingVertical: 16,
                backgroundColor: loading ? '#9CA3AF' : '#059669',
                borderRadius: 8,
                marginBottom: 20
              }}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={{
                color: 'white',
                textAlign: 'center',
                fontSize: 18,
                fontWeight: '600'
              }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Links */}
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: '#6B7280', marginBottom: 12 }}>
              Already have an account?
            </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                <Text style={{
                  color: '#2563EB',
                  fontWeight: '600',
                  fontSize: 16
                }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}