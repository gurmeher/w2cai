'use client'

import Header from '@/components/Header';
import Polygon1 from '@/components/Polygon1';
import Polygon2 from '@/components/Polygon2';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="relative isolate px-6 pt-12 lg:px-8">
        <Polygon1 />
        <Polygon2 />

        <div className="mx-auto max-w-4xl py-15 lg:py-25 text-left">
          <h1 className="text-center mb-5 text-4xl font-bold tracking-tight text-gray-900 font-sans">Privacy Policy</h1>
          <p className="text-gray-700 text-center mb-4">Last Updated: August 05, 2025</p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            This Privacy Policy explains how we collect, use, disclose, and protect your information when you visit or use our website.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>2. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            No Personal Data Collection: We do not collect, store, or track any personal information about you. We do not use cookies or other tracking technologies that collect personal data.<br />
            Anonymous Analytics: We use Vercel Analytics to collect aggregated, anonymized information about website usage, such as page views and referrers. This data cannot identify any individual user.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>3. Use of Information</h2>
          <p className="text-gray-700 mb-4">
            The anonymous data collected by Vercel Analytics is used solely to understand website traffic and improve the Service.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>4. User-Generated Content and Third-Party Sources</h2>
          <p className="text-gray-700 mb-4">
            Some of the information displayed on this website is aggregated from user-generated content posted on Reddit or other third-party platforms. We do not create, endorse, or verify the accuracy of this content. All views and information expressed in such content are solely those of the original sources and do not necessarily reflect our opinions or values.<br />
            The information presented on this website is for general informational purposes only. We do not warrant the accuracy, completeness, or timeliness of any content, especially user-generated or third-party sources.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>5. Hosting Provider</h2>
          <p className="text-gray-700 mb-4">
            This website is hosted on Vercel (vercel.com), a cloud platform provider. As part of hosting services, Vercel may process limited technical data such as your IP address, browser type, and request information temporarily to ensure proper delivery of the website.Please note that Vercel does not access or process any personal data beyond this technical hosting data, and our website itself does not collect or store personal data from visitors. You can review Vercel’s privacy practices at their Privacy Policy.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>6. Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 mb-4">
            We do not use cookies or any tracking technologies on this website, except for the automatic data collection by Vercel Analytics, which does not set cookies or use personal data.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>7. Data Sharing and Disclosure</h2>
          <p className="text-gray-700 mb-4">
            We do not sell, trade, or otherwise share any personal data because we do not collect any. The only data processing is done by Vercel as a service provider for analytics, under their strict privacy and security measures.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>8. Data Security</h2>
          <p className="text-gray-700 mb-4">
            Although we do not collect personal data, we follow reasonable industry standards to protect the website and any data you submit (such as feedback).
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>9. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            Since we do not collect personal data, rights such as access, correction, or deletion do not apply. However, if you submit any content or feedback, you have rights regarding that content as described in the Terms of Service.
          </p>
          
          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>10. Children’s Privacy</h2>
          <p className="text-gray-700 mb-4">
            This website is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will promptly remove it.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>11. Links to Other Sites</h2>
          <p className="text-gray-700 mb-4">
            Our website may contain links to third-party sites. We are not responsible for their privacy practices. Please review their policies before providing any information.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>12. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time by posting a new version on this page. Please check back periodically.
          </p>

          <h2 className='text-gray-900 text-2xl font-semibold mb-4'>13. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions or concerns about this Privacy Policy, please contact us at: w2cai.com@gmail.com
          </p>
          
        </div>
      </div>
      <Footer />
    </div>
  );
}
