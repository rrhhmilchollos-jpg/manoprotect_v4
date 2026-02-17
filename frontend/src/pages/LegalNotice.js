import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale, Building, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LegalNotice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold">Aviso Legal</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          
          <div className="text-center border-b pb-8">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Aviso Legal</h1>
            <p className="text-zinc-500">Información legal conforme a la LSSI-CE</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              1. Datos Identificativos
            </h2>
            <div className="bg-indigo-50 p-6 rounded-xl space-y-3">
              <p><strong>Denominación Social:</strong> ManoProtect S.L.</p>
              <p><strong>CIF:</strong> B19427723</p>
              <p><strong>Domicilio Social:</strong> España</p>
              <p><strong>Email de contacto:</strong> info@manoprotect.com</p>
              <p><strong>Teléfono:</strong> +34 601 510 950</p>
              <p><strong>Inscripción:</strong> Inscrita en el Registro Mercantil de Valencia</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">2. Objeto</h2>
            <p className="text-zinc-600">
              El presente Aviso Legal regula el uso del sitio web <strong>www.manoprotect.com</strong> y 
              de la aplicación móvil ManoProtect (en adelante, conjuntamente, "la Plataforma"), 
              del que es titular ManoProtect S.L.
            </p>
            <p className="text-zinc-600">
              La navegación por la Plataforma atribuye la condición de Usuario e implica la aceptación 
              plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">3. Actividad</h2>
            <p className="text-zinc-600">
              ManoProtect S.L. ofrece servicios de:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Detección y prevención de fraudes digitales (vishing, smishing, phishing)</li>
              <li>Protección familiar con sistemas de localización y alertas de emergencia</li>
              <li>Análisis de amenazas mediante inteligencia artificial</li>
              <li>Soluciones de ciberseguridad para empresas</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">4. Condiciones de Uso</h2>
            <p className="text-zinc-600">El Usuario se compromete a:</p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Utilizar la Plataforma de conformidad con la ley, la moral y el orden público</li>
              <li>No utilizar la Plataforma con fines ilícitos o lesivos contra ManoProtect o terceros</li>
              <li>No realizar acciones que puedan dañar, inutilizar o sobrecargar la Plataforma</li>
              <li>No intentar acceder a áreas restringidas de los sistemas informáticos</li>
              <li>No introducir virus, troyanos u otro software malicioso</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              5. Propiedad Intelectual e Industrial
            </h2>
            <p className="text-zinc-600">
              Todos los contenidos de la Plataforma, incluyendo sin limitación: textos, fotografías, 
              gráficos, imágenes, iconos, tecnología, software, código fuente, diseños, marcas, 
              nombres comerciales, así como la estructura, selección, ordenación y presentación de 
              sus contenidos, están protegidos por derechos de propiedad intelectual e industrial 
              de ManoProtect S.L. o de terceros.
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <p className="text-orange-800">
                <strong>Queda prohibida</strong> la reproducción, distribución, comunicación pública, 
                transformación o cualquier otra forma de explotación de los contenidos sin autorización 
                expresa y por escrito de ManoProtect S.L.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">6. Exclusión de Responsabilidad</h2>
            <p className="text-zinc-600">ManoProtect S.L. no se hace responsable de:</p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Los daños que pudieran derivarse del uso indebido de la Plataforma</li>
              <li>Los fallos o errores técnicos de la red de telecomunicaciones</li>
              <li>La falta de disponibilidad o continuidad del servicio</li>
              <li>Los virus o programas maliciosos que pudieran afectar al equipo del Usuario</li>
              <li>Los contenidos de páginas web de terceros enlazadas desde la Plataforma</li>
              <li>La imposibilidad de detectar el 100% de las amenazas (el servicio se proporciona "tal cual")</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">7. Enlaces a Terceros</h2>
            <p className="text-zinc-600">
              La Plataforma puede contener enlaces a sitios web de terceros. STARTBOOKING SL no 
              tiene control sobre dichos sitios y no asume responsabilidad alguna por sus contenidos 
              ni por las políticas de privacidad de los mismos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">8. Protección de Datos</h2>
            <p className="text-zinc-600">
              El tratamiento de datos personales se rige por nuestra{' '}
              <a href="/privacy-policy" className="text-indigo-600 hover:underline font-medium">
                Política de Privacidad
              </a>
              , conforme al Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 
              3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">9. Legislación Aplicable</h2>
            <p className="text-zinc-600">
              El presente Aviso Legal se rige íntegramente por la legislación española. Para la 
              resolución de cualquier controversia que pudiera derivarse del acceso o uso de la 
              Plataforma, STARTBOOKING SL y el Usuario acuerdan someterse expresamente a los 
              Juzgados y Tribunales de la ciudad de Valencia, con renuncia a cualquier otro fuero 
              que pudiera corresponderles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">10. Modificaciones</h2>
            <p className="text-zinc-600">
              STARTBOOKING SL se reserva el derecho de modificar, en cualquier momento y sin 
              previo aviso, la presentación y configuración de la Plataforma, así como el presente 
              Aviso Legal. Por ello, el Usuario debe leer atentamente este Aviso Legal cada vez 
              que acceda a la Plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">11. Normativa de Consumidores</h2>
            <p className="text-zinc-600">
              De conformidad con el Real Decreto Legislativo 1/2007, de 16 de noviembre, por el 
              que se aprueba el texto refundido de la Ley General para la Defensa de los 
              Consumidores y Usuarios, informamos que:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Los precios mostrados incluyen IVA</li>
              <li>Dispone de un plazo de 14 días naturales para ejercer el derecho de desistimiento</li>
              <li>Puede presentar reclamaciones ante las Juntas Arbitrales de Consumo</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">12. Resolución de Litigios en Línea</h2>
            <p className="text-zinc-600">
              Conforme al Reglamento (UE) 524/2013, le informamos que puede acceder a la 
              plataforma de resolución de litigios en línea de la UE:
            </p>
            <a 
              href="https://ec.europa.eu/consumers/odr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-2 text-indigo-600 hover:underline font-medium"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </section>

          <section className="space-y-4 border-t pt-8">
            <h2 className="text-xl font-bold text-zinc-900">13. Contacto</h2>
            <div className="bg-zinc-50 p-4 rounded-lg space-y-2">
              <p><strong>Email general:</strong> info@manoprotect.com</p>
              <p><strong>Email legal:</strong> legal@manoprotect.com</p>
              <p><strong>Teléfono:</strong> +34 601 510 950</p>
              <p><strong>Dirección:</strong> España</p>
            </div>
          </section>

          <div className="text-center text-sm text-zinc-500 pt-4 border-t">
            Última actualización: Enero 2026
          </div>

        </div>
      </div>
    </div>
  );
};

export default LegalNotice;
