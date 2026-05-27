import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PrivacyScreen() {
    return (
        <View style={styles.container}>
            <PageHeader title="Privacy Policy" />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.dateText}>Effective Date: 25 May 2026</Text>

                <Text style={styles.paragraph}>
                    This Privacy Policy describes how Apky Dark Stores Private Limited (“GrocMed”, “Company”, “We”, “Us”, or “Our”) collects, stores, uses, processes, transfers, and protects your information when you access or use our website www.grocmed.in, mobile application “GrocMed – Online Grocery Shopping”, and related services (collectively referred to as the “Services”).
                </Text>

                <Text style={styles.paragraph}>
                    By accessing or using our Services, you agree to the collection and use of information in accordance with this Privacy Policy, our Terms & Conditions, and other applicable policies.
                </Text>

                <Text style={styles.paragraph}>
                    We value your trust and are committed to protecting your privacy and handling your personal information responsibly and securely in accordance with applicable laws including the Information Technology Act, 2000 and applicable rules thereunder.
                </Text>

                <Text style={styles.heading}>1. Information We Collect</Text>
                <Text style={styles.paragraph}>
                    When you use our Services, we may collect the following information:
                </Text>
                
                <Text style={styles.subHeading}>Personal Information</Text>
                <Text style={styles.bullet}>• Full name</Text>
                <Text style={styles.bullet}>• Mobile number</Text>
                <Text style={styles.bullet}>• Email address</Text>
                <Text style={styles.bullet}>• Delivery address</Text>
                <Text style={styles.bullet}>• Billing address</Text>
                <Text style={styles.bullet}>• Login credentials</Text>
                <Text style={styles.bullet}>• Communication preferences</Text>

                <Text style={styles.subHeading}>Transaction Information</Text>
                <Text style={styles.paragraph}>
                    We may collect transaction-related information including:
                </Text>
                <Text style={styles.bullet}>• Order details</Text>
                <Text style={styles.bullet}>• Payment mode</Text>
                <Text style={styles.bullet}>• Delivery details</Text>
                <Text style={styles.bullet}>• Invoice information</Text>
                <Text style={styles.paragraph}>
                    However, we do not store your complete debit/credit card details or banking credentials. Payment transactions are processed through authorized third-party payment gateways and are governed by their respective privacy policies.
                </Text>

                <Text style={styles.subHeading}>Technical & Usage Information</Text>
                <Text style={styles.paragraph}>
                    We may automatically collect:
                </Text>
                <Text style={styles.bullet}>• IP address</Text>
                <Text style={styles.bullet}>• Device information</Text>
                <Text style={styles.bullet}>• Browser type</Text>
                <Text style={styles.bullet}>• Operating system</Text>
                <Text style={styles.bullet}>• App usage details</Text>
                <Text style={styles.bullet}>• Cookies and browsing information</Text>

                <Text style={styles.subHeading}>Information from Third Parties</Text>
                <Text style={styles.paragraph}>
                    We may receive updated delivery or address information from logistics partners or service providers to improve our Services.
                </Text>

                <Text style={styles.heading}>2. Cookies</Text>
                <Text style={styles.paragraph}>
                    A cookie is a small file stored on your device that helps improve user experience. We use cookies to:
                </Text>
                <Text style={styles.bullet}>• Remember items in your cart</Text>
                <Text style={styles.bullet}>• Save user preferences</Text>
                <Text style={styles.bullet}>• Understand website traffic</Text>
                <Text style={styles.bullet}>• Improve website functionality</Text>
                <Text style={styles.bullet}>• Provide personalized experiences</Text>
                <Text style={styles.paragraph}>
                    You may disable cookies through your browser settings; however, certain features of the Services may not function properly.
                </Text>

                <Text style={styles.heading}>3. How We Use Your Information</Text>
                <Text style={styles.paragraph}>
                    We use the collected information for:
                </Text>
                <Text style={styles.bullet}>• Processing and fulfilling orders</Text>
                <Text style={styles.bullet}>• Delivering products and services</Text>
                <Text style={styles.bullet}>• Processing payments and refunds</Text>
                <Text style={styles.bullet}>• Verifying deliveries</Text>
                <Text style={styles.bullet}>• Providing customer support</Text>
                <Text style={styles.bullet}>• Communicating regarding orders, offers, and promotions</Text>
                <Text style={styles.bullet}>• Improving user experience and platform functionality</Text>
                <Text style={styles.bullet}>• Preventing fraud and unauthorized activities</Text>
                <Text style={styles.bullet}>• Complying with legal obligations</Text>

                <Text style={styles.heading}>4. Sharing of Information</Text>
                <Text style={styles.paragraph}>
                    We may share your information with:
                </Text>
                <Text style={styles.bullet}>• Payment gateway providers</Text>
                <Text style={styles.bullet}>• Logistics and delivery partners</Text>
                <Text style={styles.bullet}>• Customer support providers</Text>
                <Text style={styles.bullet}>• Technology and analytics service providers</Text>
                <Text style={styles.bullet}>• Government or legal authorities when required under law</Text>
                <Text style={styles.paragraph}>
                    We do not sell or rent your personal information to third parties. We may share non-personal or aggregated information for analytics, marketing, or business purposes as permitted by law.
                </Text>

                <Text style={styles.heading}>5. Data Retention</Text>
                <Text style={styles.paragraph}>
                    We retain your information only for as long as necessary for:
                </Text>
                <Text style={styles.bullet}>• Providing Services</Text>
                <Text style={styles.bullet}>• Legal compliance</Text>
                <Text style={styles.bullet}>• Resolving disputes</Text>
                <Text style={styles.bullet}>• Preventing fraud</Text>
                <Text style={styles.bullet}>• Enforcing agreements and policies</Text>

                <Text style={styles.heading}>6. Security</Text>
                <Text style={styles.paragraph}>
                    We implement reasonable security practices and procedures to protect your personal information against unauthorized access, misuse, alteration, or disclosure. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.
                </Text>

                <Text style={styles.heading}>7. Third-Party Links</Text>
                <Text style={styles.paragraph}>
                    Our Services may contain links to third-party websites or services. We are not responsible for the privacy practices or content of such third-party platforms. Users are advised to review the privacy policies of third-party websites before sharing any information.
                </Text>

                <Text style={styles.heading}>8. Minors</Text>
                <Text style={styles.paragraph}>
                    Users below 18 years of age may use the Services only under the supervision of a parent or legal guardian. We do not knowingly collect personal information from minors without appropriate authorization.
                </Text>

                <Text style={styles.heading}>9. Your Rights</Text>
                <Text style={styles.paragraph}>
                    You may:
                </Text>
                <Text style={styles.bullet}>• Update or correct your account information</Text>
                <Text style={styles.bullet}>• Request deletion of your account subject to legal obligations</Text>
                <Text style={styles.bullet}>• Opt out of promotional communications</Text>

                <Text style={styles.heading}>10. Amendments</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to modify this Privacy Policy at any time. Updated versions shall become effective immediately upon posting on the Services. Users are encouraged to periodically review this Privacy Policy.
                </Text>

                <Text style={styles.heading}>11. Grievance Officer</Text>
                <Text style={styles.paragraph}>
                    For any concerns regarding privacy or data usage, you may contact:
                </Text>
                <View style={styles.officerContainer}>
                    <Text style={styles.officerText}>Grievance Officer</Text>
                    <Text style={styles.officerText}>Apky Dark Stores Private Limited</Text>
                    <Text style={styles.officerText}>Email: support@grocmed.in</Text>
                    <Text style={styles.officerText}>Website: www.grocmed.in</Text>
                    <Text style={styles.officerText}>Hyderabad, Telangana, India</Text>
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
    officerContainer: {
        backgroundColor: Colors.gray100,
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    officerText: {
        fontSize: 14,
        color: Colors.textPrimary,
        lineHeight: 22,
    }
});
