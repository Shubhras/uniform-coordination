'use client'
import React from 'react'

const PrivatePolicyHero = () => {
    return (
        <section className="relative w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-24 mt-15">
            <div className="max-w-7xl mx-auto text-[#374151] space-y-8">

                {/* HEADING */}
                <h1 className="text-3xl md:text-4xl font-semibold text-[#8B4513]">
                    Privacy Policy
                </h1>

                <p className="text-sm text-gray-500">
                    Last updated: December 2025
                </p>

                {/* INTRO */}
                <p>
                    At <span className="font-medium">Kireiz</span>, we value your privacy and are committed to
                    protecting your personal information. This Privacy Policy explains how we collect,
                    use, store, and protect your data when you use our website and services.
                </p>

                {/* SECTION 1 */}
                <div>
                    <h2 className="text-xl font-medium text-[#111827] mb-2">
                        1. Information We Collect
                    </h2>

                    <p className="mb-3">
                        We may collect the following types of information:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            <strong>Personal Information:</strong> Name, email address, phone number,
                            billing and delivery address.
                        </li>
                        <li>
                            <strong>Payment Information:</strong> Payment details are processed securely
                            through trusted third-party payment gateways.
                        </li>
                        <li>
                            <strong>Usage Data:</strong> IP address, browser type, pages visited, and device information.
                        </li>
                    </ul>
                </div>

                {/* SECTION 2 */}
                <div>
                    <h2 className="text-xl font-medium text-[#111827] mb-2">
                        2. How We Use Your Information
                    </h2>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>To process and manage orders and rentals</li>
                        <li>To deliver products and services</li>
                        <li>To communicate order updates and customer support</li>
                        <li>To improve website performance and user experience</li>
                        <li>To prevent fraud and unauthorized activity</li>
                    </ul>
                </div>

                {/* SECTION 3 */}
                <div>
                    <h2 className="text-xl font-medium text-[#111827] mb-2">
                        3. Cookies and Tracking
                    </h2>

                    <p>
                        We use cookies and similar technologies to enhance your browsing experience,
                        remember preferences, and analyze website traffic. You can disable cookies
                        in your browser settings, but some features may not function properly.
                    </p>
                </div>

                {/* SECTION 4 */}
                <div>
                    <h2 className="text-xl font-medium text-[#111827] mb-2">
                        4. Data Sharing and Disclosure
                    </h2>

                    <p>
                        We do not sell or rent your personal information. We may share data with trusted
                        partners such as payment processors, logistics providers, or legal authorities
                        when required by law.
                    </p>
                </div>

                {/* SECTION 5 */}
                <div>
                    <h2 className="text-xl font-medium text-[#111827] mb-2">
                        5. Data Security
                    </h2>

                    <p>
                        We implement industry-standard security measures to protect your personal data.
                        However, no online transmission or storage system is completely secure.
                    </p>
                </div>

                {/* SECTION 6 */}
                <div>
                    <h2 className="text-xl font-medium text-[#111827] mb-2">
                        6. Your Rights
                    </h2>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Access your personal data</li>
                        <li>Request corrections or updates</li>
                        <li>Request deletion of your data</li>
                        <li>Opt out of marketing communications</li>
                    </ul>
                </div>

                {/* SECTION 7 */}
                <div>
                    <h2 className="text-xl font-medium text-[#111827] mb-2">
                        7. Third-Party Links
                    </h2>

                    <p>
                        Our website may contain links to third-party websites. We are not responsible
                        for the privacy practices or content of those websites.
                    </p>
                </div>

                {/* SECTION 8 */}
                <div>
                    <h2 className="text-xl font-medium text-[#111827] mb-2">
                        8. Children’s Privacy
                    </h2>

                    <p>
                        Our services are not intended for children under the age of 13.
                        We do not knowingly collect personal data from children.
                    </p>
                </div>

                {/* SECTION 9 */}
                <div>
                    <h2 className="text-xl font-medium text-[#111827] mb-2">
                        9. Changes to This Policy
                    </h2>

                    <p>
                        We may update this Privacy Policy from time to time. Any changes will be
                        reflected on this page with an updated date.
                    </p>
                </div>

                {/* CONTACT */}
                <div>
                    <h2 className="text-xl font-medium text-[#111827] mb-2">
                        10. Contact Us
                    </h2>

                    <p>
                        If you have any questions about this Privacy Policy, please contact us at:
                    </p>

                    <p className="mt-2">
                        <strong>Email:</strong>{' '}
                        <span className="text-[#8B4513]">support@kireiz.com</span>
                    </p>
                </div>

            </div>
        </section>
    )
}

export default PrivatePolicyHero
