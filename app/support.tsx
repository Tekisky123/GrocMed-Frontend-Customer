import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SupportScreen() {

  const handleContact = (type: 'phone' | 'email' | 'whatsapp') => {
    switch (type) {
      case 'phone': Linking.openURL('tel:+919876543210'); break;
      case 'email': Linking.openURL('mailto:support@grocmed.com'); break;
      case 'whatsapp': Linking.openURL('whatsapp://send?phone=+919876543210'); break;
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Customer Support" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerContainer}>
          <View style={styles.iconBox}>
            <Icon name="help-circle" size={24} color={Colors.primary} library="feather" />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>Our team is available 24/7 to assist you with any questions or issues.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.card} onPress={() => handleContact('phone')}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="phone" library="material" size={24} color="#1565C0" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Call Us</Text>
              <Text style={styles.cardDesc}>Speak directly with an agent</Text>
            </View>
            <Icon name="chevron-right" library="material" size={20} color={Colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => handleContact('email')}>
            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="email" library="material" size={24} color="#2E7D32" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Email Support</Text>
              <Text style={styles.cardDesc}>Get response within 24hrs</Text>
            </View>
            <Icon name="chevron-right" library="material" size={20} color={Colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => handleContact('whatsapp')}>
            <View style={[styles.iconBox, { backgroundColor: '#E0F2F1' }]}>
              <Icon name="whatsapp" library="fontawesome" size={24} color="#00695C" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>WhatsApp</Text>
              <Text style={styles.cardDesc}>Chat with us instantly</Text>
            </View>
            <Icon name="chevron-right" library="material" size={20} color={Colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* FAQS Section Placeholder */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {['How do I track my order?', 'Change delivery address?', 'Return policy?'].map((q, i) => (
            <View key={i} style={styles.faqItem}>
              <Text style={styles.faqText}>{q}</Text>
              <Icon name="add" library="material" size={20} color={Colors.textSecondary} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8
  },
  heroSubtitle: {
    textAlign: 'center',
    fontSize: 15,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    lineHeight: 22
  },
  actions: {
    gap: 16,
    marginBottom: 32
  },
  card: {
    backgroundColor: Colors.textWhite,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    // elevation: 2
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  cardInfo: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  faqSection: {
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16
  },
  faqItem: {
    backgroundColor: Colors.textWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200
  },
  faqText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary
  }
});
