import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Building2,
  ArrowRight,
  Shield,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { authentication } from '../../api';
import { useAuth } from '@/context/auth-context';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');
  const auth = useAuth();
  const login = auth.login;
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

 

  const handleLogin = async () => {
    if (!username || !password) {
      // Add shake animation for validation
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    setIsLoading(true);
    // Animate button press
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
    }).start();
    try {
      const userData = await authentication(username, password);

      if (userData?.status === 0) {
        try {
          await login(userData?.data?.access_token);
        } catch (e) {
          setError('Login failed. Please try again.');
          setIsLoading(false);
          return;
        }
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          // Place router.replace after the animation completes
          router.replace('/(tabs)');
        });
      } else {
        // You can place Animated.timing here as well if you want to animate on failed login
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
        setError(userData?.message);
      }
    } catch (err) {
      setError('Please try again.');
    } finally {
      setIsLoading(false);
    }

    // setTimeout(() => {
    //   setIsLoading(false);
    //   Animated.timing(buttonScale, {
    //     toValue: 1,
    //     duration: 150,
    //     useNativeDriver: true,
    //   }).start();
    //   router.replace('/(tabs)');
    // }, 2000);
  };

  const getInputStyle = (fieldName: string) => [
    styles.input,
    focusedField === fieldName && styles.inputFocused,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.gradient}
      >
        {/* Background Elements */}
        <View style={styles.backgroundElements}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#2563EB', '#3B82F6', '#60A5FA']}
                  style={styles.logo}
                >
                  <Building2 size={32} color="#ffffff" strokeWidth={2.5} />
                </LinearGradient>
                <View style={styles.logoGlow} />
              </View>

              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to HAT Management System
              </Text>
            </View>

            {/* Login Form */}
            <BlurView intensity={20} tint="dark" style={styles.formContainer}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.form}>
                {/* Username Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === 'username' &&
                        styles.inputContainerFocused,
                    ]}
                  >
                    <View style={styles.inputIcon}>
                      <User
                        size={20}
                        color={
                          focusedField === 'username' ? '#60A5FA' : '#64748b'
                        }
                      />
                    </View>
                    <TextInput
                      style={getInputStyle('username')}
                      placeholder="Enter your username"
                      placeholderTextColor="#64748b"
                      value={username}
                      onChangeText={setUsername}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === 'password' &&
                        styles.inputContainerFocused,
                    ]}
                  >
                    <View style={styles.inputIcon}>
                      <Lock
                        size={20}
                        color={
                          focusedField === 'password' ? '#60A5FA' : '#64748b'
                        }
                      />
                    </View>
                    <TextInput
                      style={getInputStyle('password')}
                      placeholder="Enter your password"
                      placeholderTextColor="#64748b"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#64748b" />
                      ) : (
                        <Eye size={20} color="#64748b" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      isLoading && styles.loginButtonLoading,
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isLoading
                          ? ['#64748b', '#475569']
                          : ['#2563EB', '#3B82F6']
                      }
                      style={styles.loginButtonGradient}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <View style={styles.loadingSpinner} />
                          <Text style={styles.loginButtonText}>
                            Signing In...
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.loginButtonText}>Sign In</Text>
                          <ArrowRight size={20} color="#ffffff" />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>

            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <Shield size={16} color="#10B981" />
              <Text style={styles.securityText}>Secure Authentication</Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    overflow: 'hidden',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle1: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    bottom: height * 0.1,
    left: -width * 0.1,
  },
  circle3: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: 'rgba(8, 145, 178, 0.12)',
    top: height * 0.3,
    left: width * 0.7,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    opacity: 0.2,
    top: 4,
    zIndex: -1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },

  errorText: {
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
  form: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainerFocused: {
    borderColor: '#60A5FA',
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 16,
  },
  inputFocused: {
    color: '#ffffff',
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  loginButtonLoading: {
    opacity: 0.8,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    marginRight: 12,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '600',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignSelf: 'center',
  },
  securityText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});
