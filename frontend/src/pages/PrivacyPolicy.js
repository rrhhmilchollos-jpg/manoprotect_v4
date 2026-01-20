import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold">Política de Privacidad</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          
          <div className="text-center border-b pb-8">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Política de Privacidad</h1>
            <p className="text-zinc-500">Última actualización: Enero 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">1. Responsable del Tratamiento</h2>
            <div className="bg-zinc-50 p-4 rounded-lg space-y-2">
              <p><strong>Empresa:</strong> ManoProtect S.L.</p>
              <p><strong>CIF:</strong> B-XXXXXXXX</p>
              <p><strong>Dirección:</strong> Xàtiva, Valencia, España</p>
              <p><strong>Email:</strong> privacidad@manoprotect.com</p>
              <p><strong>Teléfono:</strong> +34 601 510 950</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">2. Datos que Recopilamos</h2>
            <p className="text-zinc-600">Recopilamos los siguientes tipos de datos personales:</p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li><strong>Datos de identificación:</strong> nombre, apellidos, email, teléfono</li>
              <li><strong>Datos de acceso:</strong> credenciales de cuenta, historial de sesiones</li>
              <li><strong>Datos de uso:</strong> interacciones con la plataforma, preferencias</li>
              <li><strong>Datos de ubicación:</strong> solo cuando activas la función SOS (con tu consentimiento explícito)</li>
              <li><strong>Datos de pago:</strong> procesados de forma segura por Stripe (no almacenamos datos de tarjeta)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">3. Finalidad del Tratamiento</h2>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Prestación de los servicios contratados de protección contra fraudes</li>
              <li>Gestión de tu cuenta de usuario</li>
              <li>Envío de alertas de seguridad y notificaciones del servicio</li>
              <li>Comunicaciones comerciales (solo con tu consentimiento)</li>
              <li>Mejora de nuestros servicios mediante análisis anónimos</li>
              <li>Cumplimiento de obligaciones legales</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">4. Base Legal</h2>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li><strong>Ejecución del contrato:</strong> para prestarte los servicios contratados</li>
              <li><strong>Consentimiento:</strong> para comunicaciones comerciales y cookies opcionales</li>
              <li><strong>Interés legítimo:</strong> para mejorar nuestros servicios y prevenir fraudes</li>
              <li><strong>Obligación legal:</strong> para cumplir con la normativa aplicable</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">5. Conservación de Datos</h2>
            <p className="text-zinc-600">
              Conservamos tus datos mientras mantengas tu cuenta activa y durante los plazos legalmente establecidos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Datos de cuenta: mientras seas usuario + 5 años</li>
              <li>Datos de facturación: 6 años (obligación fiscal)</li>
              <li>Datos de ubicación SOS: 30 días desde su generación</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">6. Tus Derechos (RGPD)</h2>
            <p className="text-zinc-600">Puedes ejercer los siguientes derechos:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="font-semibold text-indigo-900">✓ Acceso</p>
                <p className="text-sm text-indigo-700">Conocer qué datos tenemos sobre ti</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="font-semibold text-indigo-900">✓ Rectificación</p>
                <p className="text-sm text-indigo-700">Corregir datos inexactos</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="font-semibold text-indigo-900">✓ Supresión</p>
                <p className="text-sm text-indigo-700">Eliminar tus datos ("derecho al olvido")</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="font-semibold text-indigo-900">✓ Portabilidad</p>
                <p className="text-sm text-indigo-700">Recibir tus datos en formato digital</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="font-semibold text-indigo-900">✓ Oposición</p>
                <p className="text-sm text-indigo-700">Oponerte a ciertos tratamientos</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="font-semibold text-indigo-900">✓ Limitación</p>
                <p className="text-sm text-indigo-700">Restringir el uso de tus datos</p>
              </div>
            </div>
            <p className="text-zinc-600 mt-4">
              Para ejercer tus derechos, contacta con: <strong>privacidad@manoprotect.com</strong>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">7. Seguridad</h2>
            <p className="text-zinc-600">
              Implementamos medidas técnicas y organizativas para proteger tus datos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Cifrado SSL/TLS en todas las comunicaciones</li>
              <li>Almacenamiento cifrado de datos sensibles</li>
              <li>Acceso restringido solo a personal autorizado</li>
              <li>Auditorías de seguridad periódicas</li>
              <li>Copias de seguridad encriptadas</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">8. Transferencias Internacionales</h2>
            <p className="text-zinc-600">
              Algunos de nuestros proveedores pueden estar ubicados fuera del EEE. En estos casos, 
              garantizamos que existen las salvaguardas adecuadas (cláusulas contractuales tipo, 
              decisiones de adecuación de la UE).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">9. Reclamaciones</h2>
            <p className="text-zinc-600">
              Si consideras que no hemos tratado tus datos correctamente, puedes presentar una reclamación ante:
            </p>
            <div className="bg-zinc-50 p-4 rounded-lg">
              <p><strong>Agencia Española de Protección de Datos (AEPD)</strong></p>
              <p>Web: <a href="https://www.aepd.es" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">www.aepd.es</a></p>
              <p>C/ Jorge Juan, 6 - 28001 Madrid</p>
            </div>
          </section>

          <section className="space-y-4 border-t pt-8">
            <h2 className="text-xl font-bold text-zinc-900">10. Contacto</h2>
            <div className="flex flex-wrap gap-4">
              <a href="mailto:privacidad@manoprotect.com" className="flex items-center gap-2 text-indigo-600 hover:underline">
                <Mail className="w-5 h-5" />
                privacidad@manoprotect.com
              </a>
              <a href="tel:+34601510950" className="flex items-center gap-2 text-indigo-600 hover:underline">
                <Phone className="w-5 h-5" />
                +34 601 510 950
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
