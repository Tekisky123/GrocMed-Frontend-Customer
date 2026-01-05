import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TermsScreen() {
    return (
        <View style={styles.container}>
            <PageHeader title="Terms & Conditions" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.paragraph}>Last Updated: January 2026</Text>

                <Text style={styles.heading}>1. Introduction</Text>
                <Text style={styles.paragraph}>
                    Welcome to GrocMed. By accessing or using our mobile application and services, you agree to be bound by these Terms and Conditions.
                </Text>

                <Text style={styles.heading}>2. Use of Service</Text>
                <Text style={styles.paragraph}>
                    You agree to use the service only for lawful purposes. You are responsible for maintaining the confidentiality of your account credentials.
                </Text>

                <Text style={styles.heading}>3. Orders and Payments</Text>
                <Text style={styles.paragraph}>
                    All orders are subject to availability. Prices are subject to change without notice. We reserve the right to refuse details to anyone for any reason at any time.
                </Text>

                <Text style={styles.heading}>4. Delivery</Text>
                <Text style={styles.paragraph}>
                    Delivery times are estimates and start from the date of shipping, rather than the date of order.
                </Text>

                <Text style={styles.heading}>5. Changes to Terms</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to modify these terms at any time. Your continued use of the app constitutes acceptance of those changes.
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
