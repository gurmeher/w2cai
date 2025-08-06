'use client'

import Header from '@/components/Header';
import Polygon1 from '@/components/Polygon1';
import Polygon2 from '@/components/Polygon2';
import Footer from '@/components/Footer';
import { useState } from 'react';

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: 'What is W2Cai?',
    answer: 'W2Cai helps you find trending fashion product links from Reddit, organized by AI. Typically, shoppers have to rely on manually-inputted spreadsheets - which were often incomplete and out-of-date, or searching on Reddit itself, which is chaotic and disorganized. W2Cai automates both these processes to make finding products easy.',
  },
  {
    question: 'What does W2C stand for?',
    answer: '"Where to(2) Cop" - a slang term for "where to buy _______"?',
  },
  {
    question: 'How does it work?',
    answer: 'We read Reddit posts and scrape product links & names, then use AI to extract relevant information, then store it in a database for easy searching and sorting.',
  },
  {
    question: 'What subreddits do you track?',
    answer: 'Currently just r/fashionreps and r/qualityreps. Reach out on Reddit or email w2cai.com@gmail.com if you know a subreddit we should track!',
  },
  {
    question: 'Why do I see some products without images or prices?',
    answer: 'It’s probably from a platform like Taobao or 1688, which we can’t reliably scrape yet. For those links, check a Reddit post or paste the URL into an agent.',
  },
  {
    question: 'I found a bug / have feedback. How do I reach you?',
    answer: 'Reach out on Reddit or email us at w2cai.com@gmail.com!',
  },
];

export default function FaqsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="relative isolate px-6 pt-12 lg:px-8">
        <Polygon1 />
        <Polygon2 />

        <div className="mx-auto max-w-4xl py-15 lg:py-25 text-left">
          <h1 className="text-center mb-5 text-4xl font-bold tracking-tight text-gray-900 font-sans">
            FAQS
          </h1>
          
          <div className="space-y-4 max-w-4xl mx-auto px-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                onClick={() => toggle(index)}
                className="cursor-pointer border border-gray-200 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full text-left flex justify-between items-center font-bold text-black text-lg">
                  <span>{faq.question}</span>
                  <span
                    className={`text-gray-400 text-sm transform transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 mt-3' : 'max-h-0'
                  }`}
                >
                  <div className="text-gray-700 text-sm lg:text-base">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>


        </div>
      </div>
      <Footer />
    </div>
  );
}
