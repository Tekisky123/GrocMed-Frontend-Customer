import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PrivacyScreen() {
    return (
        <View style={styles.container}>
            <PageHeader title="Privacy Policy" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.paragraph}>Last Updated: January 2026</Text>

                <Text style={styles.heading}>1. Information We Collect</Text>
                <Text style={styles.paragraph}>
                    We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support. This includes your name, email, phone number, and address.
                </Text>

                <Text style={styles.heading}>2. How We Use Your Information</Text>
                <Text style={styles.paragraph}>
                    We use your information to provide, maintain, and improve our services, process transactions, and communicate with you.
                </Text>

                <Text style={styles.heading}>3. Data Security</Text>
                <Text style={styles.paragraph}>
                    We implement reasonable security measures to maintain the safety of your personal information.
                </Text>

                <Text style={styles.heading}>4. Sharing of Information</Text>
                <Text style={styles.paragraph}>
                    We do not sell your personal data. We may share information with third-party service providers (like delivery partners/payment processors) solely for the purpose of fulfilling your orders.
                </Text>

                <View style={{ height: 40 }} />
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
    heading: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 20,
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 10,
    }
});
