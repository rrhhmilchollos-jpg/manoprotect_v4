import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <RefreshCcw className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold">Política de Reembolsos</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          
          <div className="text-center border-b pb-8">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Política de Reembolsos y Cancelaciones</h1>
            <p className="text-zinc-500">Última actualización: Enero 2026</p>
          </div>

          {/* Resumen visual */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-emerald-800">14 días</p>
              <p className="text-sm text-emerald-600">Garantía de devolución</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-center">
              <RefreshCcw className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
              <p className="font-bold text-indigo-800">5-10 días</p>
              <p className="text-sm text-indigo-600">Tiempo de reembolso</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
              <AlertTriangle className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="font-bold text-orange-800">Sin compromiso</p>
              <p className="text-sm text-orange-600">Cancela cuando quieras</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">1. Período de Prueba Gratuito (7 días)</h2>
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
              <h3 className="font-bold text-amber-800 mb-3">🎁 Prueba gratuita de 7 días</h3>
              <p className="text-amber-700 mb-4">
                Los planes <strong>Individual</strong> y <strong>Familiar</strong> (tanto mensuales como anuales) 
                incluyen un período de prueba gratuito de 7 días. Para activar la prueba es obligatorio 
                registrar una tarjeta de débito o crédito válida.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-700">
                    <strong>Si cancelas dentro de los 7 días:</strong> No se realizará ningún cargo y tu cuenta 
                    pasará automáticamente al plan Básico gratuito.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-700">
                    <strong>Si no cancelas dentro de los 7 días:</strong> Se cobrará automáticamente el importe 
                    íntegro del plan seleccionado a la tarjeta registrada:
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-white rounded-lg p-4 border border-amber-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-amber-200">
                      <th className="text-left py-2 text-amber-800">Plan</th>
                      <th className="text-right py-2 text-amber-800">Importe tras período de prueba</th>
                    </tr>
                  </thead>
                  <tbody className="text-amber-700">
                    <tr className="border-b border-amber-100">
                      <td className="py-2">Individual Mensual</td>
                      <td className="text-right font-semibold">€29,99/mes</td>
                    </tr>
                    <tr className="border-b border-amber-100">
                      <td className="py-2">Individual Anual</td>
                      <td className="text-right font-semibold">€249,99/año</td>
                    </tr>
                    <tr className="border-b border-amber-100">
                      <td className="py-2">Familiar Mensual</td>
                      <td className="text-right font-semibold">€49,99/mes</td>
                    </tr>
                    <tr>
                      <td className="py-2">Familiar Anual</td>
                      <td className="text-right font-semibold">€399,99/año</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-amber-600 mt-4">
                * Te enviaremos un recordatorio por email 2 días antes de que finalice tu período de prueba.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">2. Derecho de Desistimiento (14 días)</h2>
            <p className="text-zinc-600">
              De conformidad con la normativa europea de consumidores, tienes derecho a desistir del 
              contrato en un plazo de <strong>14 días naturales</strong> desde la contratación, 
              sin necesidad de justificación.
            </p>
            <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
              <p className="font-semibold text-emerald-800">✓ Reembolso completo garantizado</p>
              <p className="text-sm text-emerald-700">
                Si solicitas el reembolso dentro de los primeros 14 días, te devolvemos el 100% del importe.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">3. Cómo Solicitar un Reembolso</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <div>
                  <p className="font-medium">Accede a tu cuenta</p>
                  <p className="text-sm text-zinc-500">Ve a Perfil → Suscripción → Solicitar reembolso</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <div>
                  <p className="font-medium">O envía un email</p>
                  <p className="text-sm text-zinc-500">Escribe a reembolsos@manoprotect.com con tu email de registro</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <div>
                  <p className="font-medium">Confirmación</p>
                  <p className="text-sm text-zinc-500">Recibirás confirmación en 24-48 horas</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">4. Reembolsos según el Plan</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-zinc-100">
                    <th className="text-left p-3 border">Plan</th>
                    <th className="text-left p-3 border">Primeros 14 días</th>
                    <th className="text-left p-3 border">Después de 14 días</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border font-medium">Premium Mensual</td>
                    <td className="p-3 border text-emerald-600">100% reembolso</td>
                    <td className="p-3 border text-zinc-500">Proporcional no usado</td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="p-3 border font-medium">Familiar Anual</td>
                    <td className="p-3 border text-emerald-600">100% reembolso</td>
                    <td className="p-3 border text-zinc-500">Proporcional (meses no usados)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-medium">Empresa</td>
                    <td className="p-3 border text-emerald-600">100% reembolso</td>
                    <td className="p-3 border text-zinc-500">Según contrato</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">5. Excepciones al Reembolso</h2>
            <p className="text-zinc-600">No procederá reembolso en los siguientes casos:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-zinc-600">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Cuentas suspendidas por incumplimiento de términos</span>
              </li>
              <li className="flex items-start gap-2 text-zinc-600">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Solicitudes después de 6 meses desde el pago</span>
              </li>
              <li className="flex items-start gap-2 text-zinc-600">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Abuso del sistema de reembolsos (múltiples solicitudes)</span>
              </li>
              <li className="flex items-start gap-2 text-zinc-600">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Servicios ya consumidos (análisis realizados, alertas enviadas)</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">6. Tiempo de Procesamiento</h2>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Procesamos tu solicitud en <strong>24-48 horas laborables</strong></li>
              <li>El reembolso aparecerá en tu cuenta en <strong>5-10 días laborables</strong></li>
              <li>El plazo puede variar según tu entidad bancaria</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">7. Cancelación de Suscripción</h2>
            <p className="text-zinc-600">
              Puedes cancelar tu suscripción en cualquier momento. La cancelación:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>Es efectiva al final del período de facturación actual</li>
              <li>Mantienes acceso hasta que expire el período pagado</li>
              <li>No genera reembolso automático (salvo solicitud expresa)</li>
              <li>No elimina tu cuenta ni tus datos (puedes solicitar eliminación aparte)</li>
              <li><strong>Durante el período de prueba:</strong> Si cancelas dentro de los 7 días, tu cuenta vuelve automáticamente al plan Básico gratuito sin ningún cargo</li>
            </ul>
          </section>

          <section className="space-y-4 bg-indigo-50 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-indigo-900">7. ¿Problemas Técnicos?</h2>
            <p className="text-indigo-700">
              Si experimentas problemas técnicos que afecten al servicio, contacta primero con 
              soporte. Muchas veces podemos resolver el problema sin necesidad de reembolso.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <a href="mailto:soporte@manoprotect.com" className="text-indigo-600 hover:underline font-medium">
                soporte@manoprotect.com
              </a>
              <span className="text-indigo-400">|</span>
              <a href="tel:+34601510950" className="text-indigo-600 hover:underline font-medium">
                +34 601 510 950
              </a>
            </div>
          </section>

          <section className="space-y-4 border-t pt-8">
            <h2 className="text-xl font-bold text-zinc-900">8. Contacto para Reembolsos</h2>
            <div className="bg-zinc-50 p-4 rounded-lg">
              <p><strong>Email:</strong> reembolsos@manoprotect.com</p>
              <p><strong>Teléfono:</strong> +34 601 510 950</p>
              <p><strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 (CET)</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
