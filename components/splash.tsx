import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Building2, Sparkles } from 'lucide-react-native';


const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

  },[]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Background Gradient Effect */}
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
        <View style={styles.gradientCircle3} />

        {/* Sparkle Effects */}
        <Animated.View 
          style={[
            styles.sparkle1,
            {
              opacity: sparkleAnim,
              transform: [{
                rotate: sparkleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }
          ]}
        >
          <Sparkles size={20} color="#FFD700" />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.sparkle2,
            {
              opacity: sparkleAnim,
              transform: [{
                rotate: sparkleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['360deg', '0deg'],
                })
              }]
            }
          ]}
        >
          <Sparkles size={16} color="#FF6B9D" />
        </Animated.View>

        <Animated.View 
          style={[
            styles.sparkle3,
            {
              opacity: sparkleAnim,
              transform: [{
                scale: sparkleAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1.2, 0.5],
                })
              }]
            }
          ]}
        >
          <Sparkles size={14} color="#4ECDC4" />
        </Animated.View>

        {/* Main Logo */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.logoBackground}>
            <View style={styles.logoInner}>
              <Building2 size={48} color="#ffffff" strokeWidth={2.5} />
            </View>
          </View>
          
          <View style={styles.logoShadow} />
        </Animated.View>

        {/* App Title */}
        <Animated.View 
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.mainTitle}>HAT Management</Text>
          <Text style={styles.subtitle}>Survey Application</Text>
          <View style={styles.tagline}>
            <Text style={styles.taglineText}>Professional • Efficient • Secure</Text>
          </View>
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View 
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.loadingBar}>
            <Animated.View 
              style={[
                styles.loadingProgress,
                {
                    scaleX: sparkleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
        </Animated.View>

        {/* Version */}
        <Animated.View 
          style={[
            styles.versionContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradientCircle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#2563EB',
    opacity: 0.1,
    top: height * 0.1,
    left: -width * 0.2,
  },
  gradientCircle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#7C3AED',
    opacity: 0.08,
    bottom: height * 0.2,
    right: -width * 0.1,
  },
  gradientCircle3: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: '#0891B2',
    opacity: 0.12,
    top: height * 0.3,
    right: width * 0.1,
  },
  sparkle1: {
    position: 'absolute',
    top: height * 0.25,
    left: width * 0.2,
  },
  sparkle2: {
    position: 'absolute',
    top: height * 0.4,
    right: width * 0.25,
  },
  sparkle3: {
    position: 'absolute',
    bottom: height * 0.35,
    left: width * 0.15,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoShadow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E40AF',
    opacity: 0.3,
    top: 8,
    zIndex: -1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  tagline: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  taglineText: {
    fontSize: 14,
    color: '#60A5FA',
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});