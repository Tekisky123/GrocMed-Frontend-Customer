import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RefundScreen() {
    return (
        <View style={styles.container}>
            <PageHeader title="Pricing & Refund Policy" />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.dateText}>Effective Date: 25 May 2026</Text>

                <Text style={styles.paragraph}>
                    This Pricing, Delivery, Return & Refund Policy forms part of the Terms & Conditions governing the use of the GrocMed Services.
                </Text>

                <Text style={styles.heading}>1. Pricing & Availability</Text>
                <Text style={styles.bullet}>• All prices displayed on the Services are inclusive of applicable GST unless stated otherwise.</Text>
                <Text style={styles.bullet}>• Prices applicable at the time of delivery shall be final.</Text>
                <Text style={styles.bullet}>• Product availability displayed on the Services is subject to change without notice.</Text>
                <Text style={styles.bullet}>• In case a product becomes unavailable after placing the order, users will be informed through SMS, email, or phone communication.</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to modify prices, offers, discounts, and availability at our sole discretion.
                </Text>

                <Text style={styles.heading}>2. Delivery of Products</Text>
                <Text style={styles.subHeading}>Home Delivery</Text>
                <Text style={styles.paragraph}>
                    A delivery fee may be charged depending on the order value, delivery location, or promotional offers. Users are required to make full payment at or before delivery.
                </Text>
                <Text style={styles.paragraph}>
                    Delivery timelines displayed on the Services are estimates only and may vary due to operational, logistical, weather-related, or force majeure circumstances.
                </Text>

                <Text style={styles.heading}>3. Payment Terms</Text>
                <Text style={styles.paragraph}>
                    We accept:
                </Text>
                <Text style={styles.bullet}>• UPI</Text>
                <Text style={styles.bullet}>• Debit Cards</Text>
                <Text style={styles.bullet}>• Credit Cards</Text>
                <Text style={styles.bullet}>• Net Banking</Text>
                <Text style={styles.bullet}>• Wallets</Text>
                <Text style={styles.bullet}>• Cash on Delivery (where available)</Text>
                <Text style={styles.paragraph}>
                    Apky Dark Stores Private Limited shall not be liable for:
                </Text>
                <Text style={styles.numberedBullet}>1. Payment authorization failures</Text>
                <Text style={styles.numberedBullet}>2. Bank processing issues</Text>
                <Text style={styles.numberedBullet}>3. Transaction declines</Text>
                <Text style={styles.numberedBullet}>4. Technical failures of payment gateways</Text>

                <Text style={styles.heading}>4. Return Policy</Text>
                <Text style={styles.paragraph}>
                    Customers are requested to inspect products at the time of delivery. Eligible products may be returned within 7 days from the invoice date subject to:
                </Text>
                <Text style={styles.bullet}>• Product remaining unused</Text>
                <Text style={styles.bullet}>• Product being in original condition</Text>
                <Text style={styles.bullet}>• Product packaging remaining intact</Text>
                <Text style={styles.bullet}>• Original invoice being available</Text>

                <Text style={styles.heading}>5. Non-Returnable Products</Text>
                <Text style={styles.paragraph}>
                    The following products are non-returnable:
                </Text>
                <Text style={styles.bullet}>• Perishable food items</Text>
                <Text style={styles.bullet}>• Fruits and vegetables</Text>
                <Text style={styles.bullet}>• Dairy products</Text>
                <Text style={styles.bullet}>• Frozen products</Text>
                <Text style={styles.bullet}>• Flowers</Text>
                <Text style={styles.bullet}>• Personal hygiene products</Text>
                <Text style={styles.bullet}>• Innerwear and personal utility items</Text>
                <Text style={styles.bullet}>• Cosmetics</Text>
                <Text style={styles.bullet}>• Seasonal or festive products</Text>
                <Text style={styles.bullet}>• Bulk purchase items</Text>

                <Text style={styles.heading}>6. Refund Policy</Text>
                <Text style={styles.paragraph}>
                    Approved refunds shall be processed within 7 business days. Refunds shall be made through the original payment method used during purchase.
                </Text>
                <Text style={styles.paragraph}>
                    For Cash on Delivery orders, refunds may be processed through UPI or bank transfer after verification of customer details.
                </Text>

                <Text style={styles.heading}>7. Customer Support</Text>
                <Text style={styles.paragraph}>
                    Complaints related to:
                </Text>
                <Text style={styles.bullet}>• Product quality</Text>
                <Text style={styles.bullet}>• Delivery</Text>
                <Text style={styles.bullet}>• Payments</Text>
                <Text style={styles.bullet}>• Refunds</Text>
                <Text style={styles.bullet}>• Service issues</Text>
                <Text style={styles.paragraph}>
                    may be raised through the Help section available on the GrocMed app or website.
                </Text>

                <Text style={styles.heading}>8. Limitation of Liability</Text>
                <Text style={styles.paragraph}>
                    Products covered under manufacturer warranty shall be governed by the warranty terms of the respective manufacturer. Apky Dark Stores Private Limited shall not be liable for indirect or consequential damages arising from product usage. Nothing in this policy limits consumer rights available under applicable laws.
                </Text>

                <Text style={styles.heading}>9. Force Majeure</Text>
                <Text style={styles.paragraph}>
                    We shall not be liable for delays or failures caused due to circumstances beyond our reasonable control including:
                </Text>
                <Text style={styles.bullet}>• Natural disasters</Text>
                <Text style={styles.bullet}>• Government restrictions</Text>
                <Text style={styles.bullet}>• Internet failures</Text>
                <Text style={styles.bullet}>• Transport disruptions</Text>
                <Text style={styles.bullet}>• Pandemic situations</Text>
                <Text style={styles.bullet}>• Labor disputes</Text>

                <Text style={styles.heading}>10. Jurisdiction</Text>
                <Text style={styles.paragraph}>
                    All disputes shall be subject to the exclusive jurisdiction of courts located in Hyderabad, Telangana.
                </Text>

                <View style={{ height: 60 }} />
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
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 16,
        fontStyle: 'italic',
    },
    heading: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 24,
        marginBottom: 12,
    },
    subHeading: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 14,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: 12,
    },
    bullet: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginLeft: 12,
        marginBottom: 6,
    },
    numberedBullet: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginLeft: 24,
        marginBottom: 6,
    }
});
