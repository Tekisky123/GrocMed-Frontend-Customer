import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Animated } from 'react-native';
import { router } from 'expo-router';
import { Icon, Icons } from '@/components/ui/Icon';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    title: 'Fresh Groceries Delivered',
    description: 'Get fresh fruits, vegetables, and groceries delivered to your doorstep',
    icon: { name: 'shopping-cart', library: 'material' as const },
    gradient: Colors.gradientPrimary,
  },
  {
    title: 'Best Prices & Offers',
    description: 'Enjoy amazing discounts and exclusive offers on all your favorite products',
    icon: { name: 'local-offer', library: 'material' as const },
    gradient: Colors.gradientSuccess,
  },
  {
    title: 'Fast & Reliable Delivery',
    description: 'Quick delivery with real-time tracking. Your order is just a tap away',
    icon: { name: 'local-shipping', library: 'material' as const },
    gradient: Colors.gradientAccent,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    } else {
      router.replace('/auth/register');
    }
  };

  const handleSkip = () => {
    router.replace('/auth/register');
  };

  const currentGradient = onboardingData[currentIndex].gradient;

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: currentGradient[0],
    }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 28 }}>
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <GlassCard
              variant="subtle"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                padding: 0,
              }}
              padding={14}
            >
              <Text style={{ color: Colors.textWhite, fontWeight: '800', fontSize: 15, letterSpacing: 0.5 }}>
                Skip
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {onboardingData.map((item, index) => (
            <View key={index} style={{ width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 }}>
              <View style={{ marginBottom: 48 }}>
                <GlassCard
                  variant="elevated"
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 48,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    padding: 0,
                  }}
                  padding={0}
                >
                  <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 50,
                    padding: 30,
                  }}>
                    <Icon name={item.icon.name} size={80} color={Colors.textWhite} library={item.icon.library} />
                  </View>
                </GlassCard>
                <GlassCard
                  variant="elevated"
                  style={{
                    backgroundColor: Colors.glassHeavy,
                    padding: 0,
                  }}
                  padding={32}
                >
                  <Text style={{ 
                    fontSize: 34, 
                    fontWeight: '800', 
                    textAlign: 'center', 
                    color: Colors.textPrimary,
                    marginBottom: 18,
                    letterSpacing: -1,
                  }}>
                    {item.title}
                  </Text>
                  <Text style={{ 
                    fontSize: 18, 
                    textAlign: 'center', 
                    color: Colors.textSecondary,
                    lineHeight: 28,
                    fontWeight: '500',
                  }}>
                    {item.description}
                  </Text>
                </GlassCard>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 48 }}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={{
                height: 12,
                borderRadius: 6,
                width: index === currentIndex ? 48 : 12,
                backgroundColor: index === currentIndex ? Colors.textWhite : 'rgba(255, 255, 255, 0.4)',
              }}
            />
          ))}
        </View>

        <View style={{ paddingHorizontal: 28, paddingBottom: 48 }}>
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <GlassCard
              variant="elevated"
              style={{
                backgroundColor: Colors.glassHeavy,
                padding: 0,
              }}
              padding={20}
            >
              <Text style={{ 
                color: currentGradient[0], 
                fontWeight: '800', 
                fontSize: 18,
                textAlign: 'center',
                letterSpacing: 1,
              }}>
                {currentIndex === onboardingData.length - 1 ? 'GET STARTED' : 'NEXT'}
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
