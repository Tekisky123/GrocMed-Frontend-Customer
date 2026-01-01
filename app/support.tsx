import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon, Icons } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';

const CARD_PADDING = 20;
const SECTION_PADDING = 20;

const faqItems = [
  {
    question: 'How do I place an order?',
    answer: 'Browse products, add them to cart, and proceed to checkout. Enter your delivery address and payment details to complete the order.',
  },
  {
    question: 'What are the delivery charges?',
    answer: 'Delivery charges are ₹40 for orders below ₹500. Orders above ₹500 qualify for free delivery.',
  },
  {
    question: 'How can I track my order?',
    answer: 'Go to the Orders tab and select your order to view real-time tracking information.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept Cash on Delivery (COD), UPI, Credit/Debit Cards, and Digital Wallets.',
  },
  {
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order before it is shipped. Go to your order details and click Cancel Order.',
  },
];

export default function SupportScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title="Customer Support" variant="primary" />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Contact Options - Consistent Alignment */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, marginBottom: 32, opacity: fadeAnim }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
              Get in Touch
            </Text>
            <View style={{
              width: 60,
              height: 4,
              backgroundColor: Colors.primary,
              borderRadius: 2,
              marginTop: 8,
            }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity activeOpacity={0.8} style={{ flex: 1 }}>
              <GlassCard
                variant="elevated"
                style={{
                  backgroundColor: Colors.glassHeavy,
                  alignItems: 'center',
                  padding: 0,
                }}
                padding={20}
              >
                <View style={{
                  backgroundColor: `${Colors.info}15`,
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 12,
                }}>
                  <Icon name={Icons.phone.name} size={32} color={Colors.info} library={Icons.phone.library} />
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4, letterSpacing: -0.2 }}>
                  Call Us
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, fontWeight: '600' }}>
                  +91 1800-123-4567
                </Text>
              </GlassCard>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={{ flex: 1 }}>
              <GlassCard
                variant="elevated"
                style={{
                  backgroundColor: Colors.glassHeavy,
                  alignItems: 'center',
                  padding: 0,
                }}
                padding={20}
              >
                <View style={{
                  backgroundColor: `${Colors.success}15`,
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 12,
                }}>
                  <Icon name={Icons.chat.name} size={32} color={Colors.success} library={Icons.chat.library} />
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4, letterSpacing: -0.2 }}>
                  Chat
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, fontWeight: '600' }}>
                  Available 24/7
                </Text>
              </GlassCard>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={{ flex: 1 }}>
              <GlassCard
                variant="elevated"
                style={{
                  backgroundColor: Colors.glassHeavy,
                  alignItems: 'center',
                  padding: 0,
                }}
                padding={20}
              >
                <View style={{
                  backgroundColor: `${Colors.accent}15`,
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 12,
                }}>
                  <Icon name={Icons.email.name} size={32} color={Colors.accent} library={Icons.email.library} />
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4, letterSpacing: -0.2 }}>
                  Email
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, fontWeight: '600' }}>
                  support@example.com
                </Text>
              </GlassCard>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* FAQ - Consistent Alignment */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, marginBottom: 32, opacity: fadeAnim }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
              Frequently Asked Questions
            </Text>
            <View style={{
              width: 60,
              height: 4,
              backgroundColor: Colors.warning,
              borderRadius: 2,
              marginTop: 8,
            }} />
          </View>
          {faqItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
              activeOpacity={0.8}
              style={{ marginBottom: 14 }}
            >
              <GlassCard
                variant="elevated"
                style={{
                  backgroundColor: Colors.glassHeavy,
                  padding: 0,
                }}
                padding={20}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.textPrimary, flex: 1, letterSpacing: -0.2 }}>
                    {item.question}
                  </Text>
                  <Icon 
                    name={expandedIndex === index ? Icons.remove.name : Icons.add.name} 
                    size={24} 
                    color={Colors.textPrimary} 
                    library="material" 
                  />
                </View>
                {expandedIndex === index && (
                  <Text style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 16, lineHeight: 24, fontWeight: '500' }}>
                    {item.answer}
                  </Text>
                )}
              </GlassCard>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Contact Form - Consistent Alignment */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, marginBottom: 32, opacity: fadeAnim }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>
              Send us a Message
            </Text>
            <View style={{
              width: 60,
              height: 4,
              backgroundColor: Colors.primary,
              borderRadius: 2,
              marginTop: 8,
            }} />
          </View>
          <GlassCard
            variant="elevated"
            style={{
              backgroundColor: Colors.glassHeavy,
              padding: 0,
            }}
            padding={24}
          >
            <TextInput
              placeholder="Type your message here..."
              placeholderTextColor={Colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              style={{
                backgroundColor: Colors.gray50,
                borderWidth: 1.5,
                borderColor: Colors.gray200,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: Colors.textPrimary,
                fontSize: 16,
                fontWeight: '500',
                minHeight: 120,
                textAlignVertical: 'top',
              }}
            />
            <Button
              title="Send Message"
              onPress={() => {
                setMessage('');
                // Handle send message
              }}
              fullWidth
              style={{ marginTop: 20 }}
            />
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
