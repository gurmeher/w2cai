'use client'

import Header from '@/components/Header';
import Polygon1 from '@/components/Polygon1';
import Polygon2 from '@/components/Polygon2';
import Footer from '@/components/Footer';

export default function TosPage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="relative isolate px-6 pt-12 lg:px-8">
        <Polygon1 />
        <Polygon2 />

        <div className="mx-auto max-w-4xl py-15 lg:py-25 text-left">
          <h1 className="text-center mb-5 text-4xl font-bold tracking-tight text-gray-900 font-sans">Terms of Service</h1>
          <p className="text-gray-700 text-center mb-4">Last Updated: August 05, 2025</p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using this website (“Service”), you agree to be bound by these Terms of Service (“Terms”) and all applicable laws. If you do not agree with these Terms, do not use this Service.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>2. Eligibility</h2>
          <p className="text-gray-700 mb-4">
            This website is intended for users who are at least 18 years old or the age of majority in their jurisdiction. By using the Service, you represent and warrant that you meet these eligibility requirements.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>3. Use of the Service</h2>
          <p className="text-gray-700 mb-4">
            You may use the Service for lawful personal or informational use only. You must not use the site to violate any laws, regulations, or the rights of others.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>4. Data Collection and Privacy</h2>
          <p className="text-gray-700 mb-4">
            No User Accounts: You do not need to create an account to use this Service.<br />
            Personal Data: We do not collect, store, or track personal data or use cookies or similar tracking technologies, except as described below regarding Vercel Analytics.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>5. Analytics and Tracking Technologies</h2>
          <p className="text-gray-700 mb-4">
            Use of Vercel Analytics: This website uses Vercel Analytics to collect aggregated, anonymized site usage data. Vercel Analytics does not use cookies or collect personally identifiable information (PII). It does not track users across websites or store any personal data.<br />
            Purpose: We use the aggregated analytics data solely to monitor and improve the website’s performance and user experience.<br />
            Privacy: Because Vercel Analytics does not use cookies or personal data, no cookie banner is required for its use.<br />
            Data Processing: Vercel acts as a processor of analytics data and processes it securely according to applicable privacy laws.
          </p>
          
          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>6. User-Generated and Third-Party Content</h2>
          <p className="text-gray-700 mb-4">
            The website displays content sourced from Reddit and other external platforms. We are not responsible for the accuracy, legality, or reliability of user-generated or third-party content presented on this website. Such content is provided for informational purposes only. If you encounter content that you believe infringes your rights or violates applicable law, please contact us for review and potential removal.<br />
            If you provide content or feedback (for example, through forms), you retain ownership but grant us a license to use it as needed to operate and improve the Service.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>7. Third-Party Links and Services</h2>
          <p className="text-gray-700 mb-4">
            The Service may contain links to third-party websites and services, which are governed by their own policies.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>8. Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
           All content, trademarks, and technology on this Service are owned by the operator or licensed to us and are protected by applicable copyright and intellectual property laws.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>9. Disclaimers</h2>
          <p className="text-gray-700 mb-4">
              This Service is provided “as is” without warranties of any kind. We are not responsible for any damages resulting from use or inability to use the Service.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>10. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            To the fullest extent permitted by law, the operators of the Service are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>11. Changes to the Terms</h2>
          <p className="text-gray-700 mb-4">
            We may update these Terms at any time by posting an updated version on this page. The revised Terms apply from the published effective date.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>12. Governing Law and Dispute Resolution</h2>
          <p className="text-gray-700 mb-4">
            These Terms are governed by the laws of the jurisdiction of the Service operator. Any dispute will be resolved according to the laws and courts of that jurisdiction unless otherwise required by law.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>13. Copyright & Takedown Requests</h2>
          <p className="text-gray-700 mb-4">
            If you believe any content on this website infringes your copyright or other legal rights, please contact us at w2cai.com@gmail.com with details and supporting information. We will investigate and, where appropriate, remove the content in accordance with applicable law.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>14. Contact</h2>
          <p className="text-gray-700 mb-4">
            For questions about these Terms or data practices, please contact us at: w2cai.com@gmail.com
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

