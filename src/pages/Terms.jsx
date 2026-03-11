import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const Terms = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="legal-page animate-fade-in">
            <div className="legal-container">
                <div className="legal-header">
                    <h1 className="legal-title">Terms & Conditions</h1>
                    <p className="legal-date">Last Updated: March 10, 2026</p>
                </div>

                <div className="legal-content">
                    <p>
                        Welcome to WeUnited. These Terms & Conditions ("Terms") govern your use of the WeUnited website,
                        services, and applications (collectively, the "Service"). By accessing or using the Service,
                        you agree to be bound by these Terms.
                    </p>

                    <h2>1. Eligibility & Registration</h2>
                    <p>
                        To register as a member of WeUnited or use this Site, you must be legally competent and
                        of legal marriageable age as per the laws of your jurisdiction (e.g., at least 18 years for women and 21 years for men in India).
                        By registering on our platform, you represent and warrant that you have the right, authority, and legal capacity to enter into this Agreement.
                    </p>

                    <h2>2. Account Security</h2>
                    <p>
                        You are responsible for maintaining the confidentiality of your login credentials and for all activities
                        that occur under your account. You agree to immediately notify us of any unauthorized use of your account
                        or any other breach of security.
                    </p>

                    <h2>3. Code of Conduct</h2>
                    <p>
                        While using the Service, you agree not to:
                    </p>
                    <ul>
                        <li>Use the Service for any purpose other than finding a potential marriage partner.</li>
                        <li>Post any content that is offensive, defamatory, inaccurate, abusive, obscene, profane, or otherwise objectionable.</li>
                        <li>Harass, abuse, or harm another person.</li>
                        <li>Provide false or misleading information in your profile, including your photos, age, marital status, or profession.</li>
                        <li>Request money from, or otherwise defraud, other users.</li>
                    </ul>

                    <h2>4. Subscriptions and Payments</h2>
                    <p>
                        Certain features of the Service require a Premium Membership. By choosing a paid subscription, you agree to pay
                        the fees associated with the plan you select. All payments are securely processed by third-party payment gateways.
                        Subscriptions may automatically renew unless cancelled prior to the end of the current billing cycle.
                    </p>

                    <h2>5. Limitation of Liability</h2>
                    <p>
                        WeUnited acts as a platform to connect individuals seeking marriage. We do not guarantee the accuracy of any
                        information provided by users, nor do we guarantee successful matches.
                        In no event shall WeUnited be liable for any indirect, consequential, exemplary, incidental,
                        or punitive damages arising from your use of the Service.
                    </p>

                    <h2>6. Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate your account immediately, without prior notice or liability,
                        for any reason, including without limitation if you breach the Terms.
                        If you wish to terminate your account, you may simply discontinue using the Service or delete your account from your Profile Settings.
                    </p>

                    <h2>7. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please <Link to="/contact">contact us</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
