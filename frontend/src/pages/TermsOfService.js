import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold">Términos y Condiciones</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          
          <div className="text-center border-b pb-8">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Términos y Condiciones de Uso</h1>
            <p className="text-zinc-500">Última actualización: Enero 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">1. Identificación</h2>
            <p className="text-zinc-600">
              El presente sitio web y aplicación móvil son propiedad de <strong>ManoProtect S.L.</strong>, 
              con domicilio en España, y CIF B19427723.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">2. Objeto</h2>
            <p className="text-zinc-600">
              ManoProtect es una plataforma de seguridad digital que ofrece servicios de:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Detección y prevención de fraudes digitales</li>
              <li>Protección familiar con localización y alertas SOS</li>
              <li>Análisis de amenazas mediante inteligencia artificial</li>
              <li>Gestión de contactos de emergencia</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">3. Condiciones de Uso</h2>
            <p className="text-zinc-600">Al utilizar ManoProtect, te comprometes a:</p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Proporcionar información veraz y actualizada</li>
              <li>No utilizar el servicio para fines ilícitos</li>
              <li>No intentar acceder a cuentas de otros usuarios</li>
              <li>No realizar ingeniería inversa del software</li>
              <li>Mantener la confidencialidad de tus credenciales</li>
              <li>Ser mayor de 18 años o contar con autorización parental</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">4. Planes y Precios</h2>
            <p className="text-zinc-600">ManoProtect ofrece los siguientes planes:</p>
            <div className="space-y-3">
              <div className="bg-zinc-50 p-4 rounded-lg">
                <p className="font-semibold">Plan Básico - Gratuito</p>
                <p className="text-sm text-zinc-500">Funciones limitadas de detección de fraudes</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="font-semibold">Plan Premium Individual - 9,99€/mes</p>
                <p className="text-sm text-zinc-500">Protección completa para un usuario</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="font-semibold">Plan Familiar - 89,99€/año</p>
                <p className="text-sm text-zinc-500">Protección para toda la familia + localización</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="font-semibold">Plan Empresa - Desde 49,99€/mes</p>
                <p className="text-sm text-zinc-500">Soluciones corporativas personalizadas</p>
              </div>
            </div>
            <p className="text-sm text-zinc-500">
              Los precios incluyen IVA. ManoProtect se reserva el derecho de modificar precios con 30 días de preaviso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">5. Facturación y Pagos</h2>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Los pagos se procesan de forma segura a través de Stripe</li>
              <li>Las suscripciones se renuevan automáticamente</li>
              <li>Puedes cancelar en cualquier momento desde tu perfil</li>
              <li>La cancelación es efectiva al final del período facturado</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">6. Limitación de Responsabilidad</h2>
            <p className="text-zinc-600">
              ManoProtect proporciona herramientas de protección, pero no puede garantizar la detección 
              del 100% de las amenazas. El usuario reconoce que:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>El servicio se proporciona "tal cual"</li>
              <li>No somos responsables de daños indirectos o consecuentes</li>
              <li>La responsabilidad máxima está limitada al importe pagado en los últimos 12 meses</li>
              <li>No sustituimos a las fuerzas de seguridad ni servicios de emergencia</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">7. Propiedad Intelectual</h2>
            <p className="text-zinc-600">
              Todos los contenidos de ManoProtect (diseños, logos, textos, código, algoritmos) son 
              propiedad de ManoProtect S.L. o sus licenciantes. Queda prohibida su reproducción 
              sin autorización expresa.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">8. Modificaciones</h2>
            <p className="text-zinc-600">
              ManoProtect puede modificar estos términos en cualquier momento. Los cambios serán 
              notificados por email con al menos 15 días de antelación. El uso continuado del 
              servicio implica la aceptación de los nuevos términos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">9. Suspensión y Cancelación</h2>
            <p className="text-zinc-600">ManoProtect puede suspender o cancelar cuentas que:</p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Incumplan estos términos de servicio</li>
              <li>Realicen actividades fraudulentas</li>
              <li>Abusen del servicio o de otros usuarios</li>
              <li>Tengan pagos pendientes por más de 30 días</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">10. Ley Aplicable</h2>
            <p className="text-zinc-600">
              Estos términos se rigen por la legislación española. Para cualquier controversia, 
              las partes se someten a los Juzgados y Tribunales de Valencia, renunciando a 
              cualquier otro fuero que pudiera corresponderles.
            </p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <h2 className="text-xl font-bold text-zinc-900">11. Contacto</h2>
            <p className="text-zinc-600">
              Para cualquier consulta sobre estos términos:<br />
              <strong>Email:</strong> legal@manoprotectt.com<br />
              <strong>Teléfono:</strong> +34 601 510 950
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
