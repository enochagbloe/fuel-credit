import React from 'react';
import { Animated, Modal, Text, TouchableOpacity, View } from 'react-native';

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onHide: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  visible, 
  message, 
  type, 
  onHide, 
  duration = 3000 
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, onHide]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={{
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 60,
      }}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            backgroundColor: getBackgroundColor(),
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
            marginHorizontal: 20,
            maxWidth: '90%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <TouchableOpacity onPress={onHide} activeOpacity={0.8}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{
                color: 'white',
                fontSize: 18,
                marginRight: 8,
                fontWeight: 'bold'
              }}>
                {getIcon()}
              </Text>
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '500',
                flex: 1,
                textAlign: 'center'
              }}>
                {message}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel'
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 24,
          margin: 20,
          maxWidth: '85%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 12,
            textAlign: 'center'
          }}>
            {title}
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#6B7280',
            lineHeight: 24,
            marginBottom: 24,
            textAlign: 'center'
          }}>
            {message}
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            gap: 12 
          }}>
            {cancelText && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  backgroundColor: 'white'
                }}
                onPress={onCancel}
              >
                <Text style={{
                  color: '#6B7280',
                  fontSize: 16,
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: '#2563EB'
              }}
              onPress={onConfirm}
            >
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '500',
                textAlign: 'center'
              }}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};