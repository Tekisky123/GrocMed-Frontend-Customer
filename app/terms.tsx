import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TermsScreen() {
    return (
        <View style={styles.container}>
            <PageHeader title="Terms & Conditions" />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.dateText}>Effective Date: 25 May 2026</Text>

                <Text style={styles.paragraph}>
                    These Terms & Conditions (“Terms”) govern the access and use of the website www.grocmed.in, mobile application “GrocMed – Online Grocery Shopping”, and related Services operated by Apky Dark Stores Private Limited.
                </Text>

                <Text style={styles.paragraph}>
                    By accessing or using the Services, you agree to be bound by these Terms, Privacy Policy, and other applicable policies. If you do not agree with these Terms, please do not use the Services.
                </Text>

                <Text style={styles.heading}>1. User Registration</Text>
                <Text style={styles.paragraph}>
                    Users may be required to register and create an account to place orders. You are responsible for:
                </Text>
                <Text style={styles.bullet}>• Maintaining confidentiality of account credentials</Text>
                <Text style={styles.bullet}>• Restricting unauthorized access</Text>
                <Text style={styles.bullet}>• Providing accurate and updated information</Text>
                <Text style={styles.paragraph}>
                    You agree to receive transactional communications related to orders, deliveries, and account activity. Promotional communication may be sent subject to applicable laws.
                </Text>

                <Text style={styles.heading}>2. Eligibility</Text>
                <Text style={styles.paragraph}>
                    Users must be legally capable of entering into binding contracts under applicable laws. Users below 18 years may access the Services only under parental or guardian supervision.
                </Text>

                <Text style={styles.heading}>3. Product Information</Text>
                <Text style={styles.paragraph}>
                    We attempt to ensure accuracy of product descriptions, pricing, and availability. However, errors may occur. We reserve the right to:
                </Text>
                <Text style={styles.bullet}>• Correct errors</Text>
                <Text style={styles.bullet}>• Cancel orders</Text>
                <Text style={styles.bullet}>• Refuse service</Text>
                <Text style={styles.bullet}>• Limit quantities</Text>
                <Text style={styles.paragraph}>
                    without prior notice.
                </Text>

                <Text style={styles.heading}>4. Order Acceptance</Text>
                <Text style={styles.paragraph}>
                    An order placed by the user constitutes an offer to purchase products. Order confirmation does not guarantee acceptance. We reserve the right to reject or cancel orders at our discretion.
                </Text>

                <Text style={styles.heading}>5. User Obligations</Text>
                <Text style={styles.paragraph}>
                    Users shall not:
                </Text>
                <Text style={styles.bullet}>• Use the Services for unlawful purposes</Text>
                <Text style={styles.bullet}>• Attempt unauthorized access</Text>
                <Text style={styles.bullet}>• Interfere with system security</Text>
                <Text style={styles.bullet}>• Upload harmful content or malware</Text>
                <Text style={styles.bullet}>• Misuse promotional offers</Text>

                <Text style={styles.heading}>6. Intellectual Property</Text>
                <Text style={styles.paragraph}>
                    All trademarks, logos, text, graphics, software, and content available on the Services are owned by or licensed to Apky Dark Stores Private Limited. Unauthorized use is prohibited.
                </Text>

                <Text style={styles.heading}>7. Limitation of Liability</Text>
                <Text style={styles.paragraph}>
                    To the maximum extent permitted by law, Apky Dark Stores Private Limited shall not be liable for:
                </Text>
                <Text style={styles.bullet}>• Indirect or consequential damages</Text>
                <Text style={styles.bullet}>• Service interruptions</Text>
                <Text style={styles.bullet}>• Technical failures</Text>
                <Text style={styles.bullet}>• Loss of data</Text>
                <Text style={styles.bullet}>• Delays in delivery</Text>

                <Text style={styles.heading}>8. Termination</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to suspend or terminate user accounts without notice for:
                </Text>
                <Text style={styles.bullet}>• Violation of these Terms</Text>
                <Text style={styles.bullet}>• Fraudulent activity</Text>
                <Text style={styles.bullet}>• Abuse of Services</Text>
                <Text style={styles.bullet}>• Legal or security concerns</Text>

                <Text style={styles.heading}>9. Indemnity</Text>
                <Text style={styles.paragraph}>
                    Users agree to indemnify and hold harmless Apky Dark Stores Private Limited against claims, losses, damages, liabilities, and expenses arising from misuse of the Services or violation of these Terms.
                </Text>

                <Text style={styles.heading}>10. Governing Law</Text>
                <Text style={styles.paragraph}>
                    These Terms shall be governed by and construed in accordance with the laws of India. All disputes shall be subject to the exclusive jurisdiction of courts located in Hyderabad, Telangana.
                </Text>

                <Text style={styles.heading}>11. Modifications</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to modify these Terms at any time. Continued use of the Services after modifications constitutes acceptance of revised Terms.
                </Text>

                <Text style={styles.heading}>12. Contact Details</Text>
                <View style={styles.contactContainer}>
                    <Text style={styles.contactText}>Apky Dark Stores Private Limited</Text>
                    <Text style={styles.contactText}>Website: www.grocmed.in</Text>
                    <Text style={styles.contactText}>Email: support@grocmed.in</Text>
                    <Text style={styles.contactText}>Hyderabad, Telangana, India</Text>
                </View>

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
    contactContainer: {
        backgroundColor: Colors.gray100,
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    contactText: {
        fontSize: 14,
        color: Colors.textPrimary,
        lineHeight: 22,
    }
});
