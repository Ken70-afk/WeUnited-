import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const Privacy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="legal-page animate-fade-in">
            <div className="legal-container">
                <div className="legal-header">
                    <h1 className="legal-title">Privacy Policy</h1>
                    <p className="legal-date">Last Updated: March 10, 2026</p>
                </div>

                <div className="legal-content">
                    <p>
                        Welcome to WeUnited ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website
                        and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2>1. Important Information and Who We Are</h2>
                    <p>
                        WeUnited Matrimony act as the data controller and are responsible for your personal data.
                        If you have any questions about this privacy policy, including any requests to exercise your legal rights,
                        please <Link to="/contact">contact us</Link>.
                    </p>

                    <h2>2. The Data We Collect About You</h2>
                    <p>
                        Personal data means any information about an individual from which that person can be identified.
                        We may collect, use, store, and transfer different kinds of personal data about you which we have grouped together as follows:
                    </p>
                    <ul>
                        <li><strong>Identity Data:</strong> includes first name, last name, username, marital status, title, date of birth, age, height, and gender.</li>
                        <li><strong>Contact Data:</strong> includes billing address, delivery address, email address, and telephone numbers.</li>
                        <li><strong>Profile Data:</strong> includes your photos, religion, community, education, career details, location, and matching preferences.</li>
                        <li><strong>Financial Data:</strong> includes payment card details (processed securely by our third-party payment providers).</li>
                        <li><strong>Usage Data:</strong> includes information about how you use our website, products, and services.</li>
                    </ul>

                    <h2>3. How We Use Your Personal Data</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul>
                        <li>To register you as a new user and create your matchmaking profile.</li>
                        <li>To provide our core matchmaking services, allowing other registered users to view your profile and contact you.</li>
                        <li>To process and deliver your membership subscriptions.</li>
                        <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
                        <li>To ensure the safety and security of our platform through profile verification and fraud prevention.</li>
                    </ul>

                    <h2>4. Data Security</h2>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost,
                        used, or accessed in an unauthorized way, altered, or disclosed. We use bank-level encryption to secure your sensitive information.
                    </p>

                    <h2>5. Your Legal Rights</h2>
                    <p>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data. You have the right to request access, correction, erasure (the "right to be forgotten"), restriction, or transfer of your personal data. You can exercise these rights within your Profile Settings, or by contacting our support team.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
