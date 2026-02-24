/**
 * ManoProtect - FAQ Schema Component
 * Componente de FAQ con Schema.org FAQPage
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSchema = ({ faqs, title = "Preguntas Frecuentes" }) => {
  const [openIndex, setOpenIndex] = useState(null);
  
  // Generate Schema.org FAQPage
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
  
  return (
    <>
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      
      {/* Visual FAQ Accordion */}
      <div className="space-y-4">
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        )}
        
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
              aria-expanded={openIndex === index}
            >
              <h3 className="font-medium text-gray-900 pr-4">{faq.question}</h3>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
            </button>
            
            {openIndex === index && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default FAQSchema;
