/**
 * ManoProtect - Product Comparison Component
 * Comparativa de productos para SEO y conversión
 */
import React from 'react';
import { Check, X, Star, Trophy, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const COMPARISON_DATA = {
  products: [
    {
      name: "Sentinel X",
      brand: "ManoProtect",
      price: 149,
      isOurs: true,
      features: {
        gps: { value: true, detail: "Multi-banda alta precisión" },
        calls: { value: true, detail: "Bidireccionales ilimitadas" },
        fallDetection: { value: true, detail: "Automática con IA" },
        battery: { value: "5 días", detail: "Uso real probado" },
        waterResistant: { value: true, detail: "IP68 + 5ATM (buceo)" },
        sim: { value: "eSIM incluida", detail: "Sin contratos" },
        screen: { value: true, detail: "AMOLED 1.78\"" },
        heartRate: { value: true, detail: "24/7 + SpO2" },
        sosButton: { value: true, detail: "Físico + táctil" },
        monthlyFee: { value: "9,99€", detail: "Todo incluido" },
        warranty: { value: "2 años", detail: "España" },
        support: { value: "24/7", detail: "Español" }
      }
    },
    {
      name: "SaveFamily Senior",
      brand: "SaveFamily",
      price: 129,
      isOurs: false,
      features: {
        gps: { value: true, detail: "Básico" },
        calls: { value: true, detail: "Limitadas" },
        fallDetection: { value: false, detail: "No incluido" },
        battery: { value: "2 días", detail: "Según uso" },
        waterResistant: { value: true, detail: "IP67" },
        sim: { value: "SIM aparte", detail: "Coste extra" },
        screen: { value: true, detail: "LCD 1.4\"" },
        heartRate: { value: false, detail: "No incluido" },
        sosButton: { value: true, detail: "Solo físico" },
        monthlyFee: { value: "12,99€", detail: "+ SIM" },
        warranty: { value: "1 año", detail: "" },
        support: { value: "Horario", detail: "L-V" }
      }
    },
    {
      name: "Weenect Silver",
      brand: "Weenect",
      price: 79,
      isOurs: false,
      features: {
        gps: { value: true, detail: "Básico" },
        calls: { value: false, detail: "Solo alertas" },
        fallDetection: { value: false, detail: "No incluido" },
        battery: { value: "7 días", detail: "Sin funciones" },
        waterResistant: { value: true, detail: "IPX5" },
        sim: { value: "Incluida", detail: "2G limitado" },
        screen: { value: false, detail: "Sin pantalla" },
        heartRate: { value: false, detail: "No incluido" },
        sosButton: { value: true, detail: "Solo físico" },
        monthlyFee: { value: "7,90€", detail: "Funciones básicas" },
        warranty: { value: "2 años", detail: "" },
        support: { value: "Email", detail: "48h" }
      }
    }
  ],
  features: [
    { key: "gps", label: "GPS en tiempo real" },
    { key: "calls", label: "Llamadas de voz" },
    { key: "fallDetection", label: "Detección de caídas" },
    { key: "battery", label: "Duración batería" },
    { key: "waterResistant", label: "Resistente al agua" },
    { key: "sim", label: "Tarjeta SIM" },
    { key: "screen", label: "Pantalla táctil" },
    { key: "heartRate", label: "Monitor cardíaco" },
    { key: "sosButton", label: "Botón SOS" },
    { key: "monthlyFee", label: "Cuota mensual" },
    { key: "warranty", label: "Garantía" },
    { key: "support", label: "Soporte técnico" }
  ]
};

const FeatureCell = ({ feature, isOurs }) => {
  if (typeof feature.value === 'boolean') {
    return (
      <td className={`p-3 text-center ${isOurs ? 'bg-green-50' : ''}`}>
        {feature.value ? (
          <div className="flex flex-col items-center">
            <Check className="w-5 h-5 text-green-500" />
            {feature.detail && (
              <span className="text-xs text-gray-500 mt-1">{feature.detail}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <X className="w-5 h-5 text-red-400" />
            {feature.detail && (
              <span className="text-xs text-gray-400 mt-1">{feature.detail}</span>
            )}
          </div>
        )}
      </td>
    );
  }
  
  return (
    <td className={`p-3 text-center ${isOurs ? 'bg-green-50' : ''}`}>
      <span className={`font-medium ${isOurs ? 'text-green-700' : 'text-gray-700'}`}>
        {feature.value}
      </span>
      {feature.detail && (
        <span className="block text-xs text-gray-500 mt-1">{feature.detail}</span>
      )}
    </td>
  );
};

const ProductComparison = ({ showCTA = true }) => {
  // Schema for comparison
  const schemaComparison = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Comparativa Relojes SOS para Mayores 2026",
    "description": "Comparación de los mejores relojes con botón SOS para personas mayores en España",
    "itemListElement": COMPARISON_DATA.products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "brand": product.brand,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "EUR"
        }
      }
    }))
  };

  return (
    <section className="py-16 bg-white" id="comparativa">
      <script type="application/ld+json">
        {JSON.stringify(schemaComparison)}
      </script>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Comparativa 2026
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Sentinel X vs La Competencia
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Compara características y precios de los principales relojes SOS del mercado español
          </p>
        </div>
        
        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left font-medium text-gray-600 w-1/4">Característica</th>
                {COMPARISON_DATA.products.map((product, i) => (
                  <th 
                    key={i} 
                    className={`p-4 text-center ${product.isOurs ? 'bg-green-100' : ''}`}
                  >
                    <div className="flex flex-col items-center">
                      {product.isOurs && (
                        <span className="bg-[#4CAF50] text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                          RECOMENDADO
                        </span>
                      )}
                      <span className="font-bold text-gray-900">{product.name}</span>
                      <span className="text-sm text-gray-500">{product.brand}</span>
                      <span className={`text-2xl font-bold mt-2 ${product.isOurs ? 'text-[#4CAF50]' : 'text-gray-700'}`}>
                        {product.price}€
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {COMPARISON_DATA.features.map((feature, i) => (
                <tr key={feature.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="p-3 font-medium text-gray-700">{feature.label}</td>
                  {COMPARISON_DATA.products.map((product, j) => (
                    <FeatureCell 
                      key={j}
                      feature={product.features[feature.key]}
                      isOurs={product.isOurs}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* CTA */}
        {showCTA && (
          <div className="mt-8 text-center">
            <Link to="/sentinel-x">
              <Button size="lg" className="bg-[#4CAF50] hover:bg-[#45a049] text-lg px-8">
                <Shield className="w-5 h-5 mr-2" />
                Comprar Sentinel X - 149€
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              Envío gratis · 30 días de prueba · Garantía 2 años
            </p>
          </div>
        )}
        
        {/* Winner badge */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">
                ¿Por qué Sentinel X es el ganador?
              </h3>
              <ul className="text-gray-600 space-y-1">
                <li>• <strong>Único con detección de caídas por IA</strong> - Crucial para mayores que viven solos</li>
                <li>• <strong>eSIM incluida sin contratos</strong> - Ahorra más de 60€/año vs competencia</li>
                <li>• <strong>Batería real de 5 días</strong> - Probado en condiciones reales de uso</li>
                <li>• <strong>Soporte 24/7 en español</strong> - Siempre hay alguien para ayudarte</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductComparison;
