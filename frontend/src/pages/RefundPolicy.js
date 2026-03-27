/**
 * ManoProtect - Política de Reembolsos y Cancelaciones
 * Documento legal profesional conforme a la normativa europea
 */
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, RefreshCcw, CheckCircle, XCircle, AlertTriangle, 
  Shield, Scale, Clock, CreditCard, Mail, Phone, FileText,
  Users, Building2, Calendar, Euro, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Helmet>
        <title>Política de Reembolsos y Cancelaciones | ManoProtect</title>
        <meta name="description" content="Política de reembolsos, cancelaciones y derecho de desistimiento de ManoProtect. Garantía de devolución de 14 días conforme a la normativa europea." />
      </Helmet>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <RefreshCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Política de Reembolsos</h1>
              <p className="text-xs text-slate-500">ManoProtect S.L.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Cabecera del documento */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
          
          {/* Banner superior */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-10 text-white">
            <div className="flex items-center gap-2 text-emerald-100 text-sm mb-3">
              <Scale className="w-4 h-4" />
              <span>Documento Legal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Política de Reembolsos, Cancelaciones y Derecho de Desistimiento
            </h1>
            <p className="text-emerald-100 max-w-2xl">
              Conforme al Real Decreto Legislativo 1/2007 y la Directiva 2011/83/UE sobre derechos de los consumidores
            </p>
            <div className="flex flex-wrap gap-4 mt-6 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">Versión 2.0</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Última actualización: Febrero 2026</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Vigencia: Indefinida</span>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            
            {/* Resumen ejecutivo visual */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 p-5 rounded-2xl text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-emerald-700">14 días</p>
                <p className="text-sm text-emerald-600">Derecho de desistimiento</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 p-5 rounded-2xl text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Euro className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-blue-700">100%</p>
                <p className="text-sm text-blue-600">Reembolso garantizado</p>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200 p-5 rounded-2xl text-center">
                <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-violet-700">5-10 días</p>
                <p className="text-sm text-violet-600">Plazo de devolución</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 p-5 rounded-2xl text-center">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-amber-700">7 días</p>
                <p className="text-sm text-amber-600">Prueba gratuita</p>
              </div>
            </div>

            {/* Índice */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                Índice de Contenidos
              </h2>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <a href="#preambulo" className="text-slate-600 hover:text-emerald-600 py-1">1. Preámbulo y Objeto</a>
                <a href="#definiciones" className="text-slate-600 hover:text-emerald-600 py-1">2. Definiciones</a>
                <a href="#prueba-gratuita" className="text-slate-600 hover:text-emerald-600 py-1">3. Período de Prueba Gratuita</a>
                <a href="#desistimiento" className="text-slate-600 hover:text-emerald-600 py-1">4. Derecho de Desistimiento</a>
                <a href="#procedimiento" className="text-slate-600 hover:text-emerald-600 py-1">5. Procedimiento de Reembolso</a>
                <a href="#condiciones" className="text-slate-600 hover:text-emerald-600 py-1">6. Condiciones por Tipo de Plan</a>
                <a href="#exclusiones" className="text-slate-600 hover:text-emerald-600 py-1">7. Exclusiones y Limitaciones</a>
                <a href="#cancelacion" className="text-slate-600 hover:text-emerald-600 py-1">8. Cancelación de Suscripción</a>
                <a href="#plazos" className="text-slate-600 hover:text-emerald-600 py-1">9. Plazos de Procesamiento</a>
                <a href="#contacto" className="text-slate-600 hover:text-emerald-600 py-1">10. Información de Contacto</a>
              </div>
            </div>

            {/* Sección 1: Preámbulo */}
            <section id="preambulo" className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">1</span>
                <h2 className="text-2xl font-bold text-slate-900">Preámbulo y Objeto</h2>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed">
                  La presente Política de Reembolsos y Cancelaciones (en adelante, "la Política") establece los términos 
                  y condiciones aplicables a las solicitudes de reembolso, cancelación de servicios y ejercicio del derecho 
                  de desistimiento por parte de los usuarios de los servicios prestados por <strong>ManoProtect S.L.</strong> 
                  (en adelante, "ManoProtect" o "la Empresa"), con domicilio social en España.
                </p>
                
                <p className="text-slate-600 leading-relaxed">
                  Esta Política se establece de conformidad con:
                </p>
                
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Real Decreto Legislativo 1/2007</strong>, de 16 de noviembre, por el que se aprueba el texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Directiva 2011/83/UE</strong> del Parlamento Europeo y del Consejo sobre los derechos de los consumidores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Ley 34/2002</strong>, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Reglamento (UE) 2016/679</strong> General de Protección de Datos (RGPD)</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Sección 2: Definiciones */}
            <section id="definiciones" className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">2</span>
                <h2 className="text-2xl font-bold text-slate-900">Definiciones</h2>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <div className="border-b border-slate-200 pb-4">
                  <p className="font-semibold text-slate-900">"Usuario" o "Cliente"</p>
                  <p className="text-slate-600 text-sm">Toda persona física o jurídica que contrate cualquier servicio o plan de suscripción ofrecido por ManoProtect.</p>
                </div>
                <div className="border-b border-slate-200 pb-4">
                  <p className="font-semibold text-slate-900">"Servicios"</p>
                  <p className="text-slate-600 text-sm">Conjunto de funcionalidades de protección digital, análisis de amenazas, alertas de seguridad, localización familiar y asistencia SOS proporcionados a través de la plataforma ManoProtect.</p>
                </div>
                <div className="border-b border-slate-200 pb-4">
                  <p className="font-semibold text-slate-900">"Suscripción"</p>
                  <p className="text-slate-600 text-sm">Modalidad de contratación mediante pago recurrente (mensual, trimestral o anual) que otorga acceso a los Servicios durante el período contratado.</p>
                </div>
                <div className="border-b border-slate-200 pb-4">
                  <p className="font-semibold text-slate-900">"Período de Prueba"</p>
                  <p className="text-slate-600 text-sm">Lapso de siete (7) días naturales durante el cual el Usuario puede acceder a los Servicios sin cargo alguno.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">"Derecho de Desistimiento"</p>
                  <p className="text-slate-600 text-sm">Facultad del consumidor de resolver el contrato en el plazo legalmente establecido, sin necesidad de justificación y sin penalización alguna.</p>
                </div>
              </div>
            </section>

            {/* Sección 3: Período de Prueba */}
            <section id="prueba-gratuita" className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">3</span>
                <h2 className="text-2xl font-bold text-slate-900">Período de Prueba Gratuita</h2>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-lg mb-2">3.1. Condiciones Generales del Período de Prueba</h3>
                    <p className="text-amber-800">
                      ManoProtect ofrece un período de prueba gratuita de <strong>siete (7) días naturales</strong> para 
                      los planes Individual y Familiar, tanto en su modalidad mensual como anual.
                    </p>
                  </div>
                </div>

                <div className="bg-white/70 rounded-xl p-5 border border-amber-200">
                  <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    3.2. Requisitos de Registro
                  </h4>
                  <ul className="space-y-2 text-amber-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                      <span>Para activar el período de prueba, el Usuario deberá proporcionar un método de pago válido (tarjeta de crédito o débito)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                      <span>La tarjeta será verificada mediante el protocolo <strong>3D Secure</strong> para garantizar la titularidad legítima</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                      <span>No se realizará ningún cargo durante los primeros 7 días</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/70 rounded-xl p-5 border border-amber-200">
                  <h4 className="font-bold text-amber-900 mb-3">3.3. Finalización del Período de Prueba</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-800">Si el Usuario cancela dentro del período de prueba:</p>
                        <p className="text-emerald-700 text-sm">No se efectuará cargo alguno. La cuenta revertirá automáticamente al plan Básico gratuito, conservando el acceso a las funcionalidades esenciales.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-orange-800">Si el Usuario no cancela dentro del período de prueba:</p>
                        <p className="text-orange-700 text-sm">Al octavo día se procederá al cargo automático del importe correspondiente al plan seleccionado en el método de pago registrado.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 rounded-xl p-5 border border-amber-200">
                  <h4 className="font-bold text-amber-900 mb-3">3.4. Tarifas Aplicables tras el Período de Prueba</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-amber-300">
                          <th className="text-left py-3 text-amber-900 font-bold">Plan de Suscripción</th>
                          <th className="text-right py-3 text-amber-900 font-bold">Importe (IVA incluido)</th>
                        </tr>
                      </thead>
                      <tbody className="text-amber-800">
                        <tr className="border-b border-amber-200">
                          <td className="py-3">Individual Mensual</td>
                          <td className="text-right font-semibold">29,99 €/mes</td>
                        </tr>
                        <tr className="border-b border-amber-200">
                          <td className="py-3">Individual Trimestral</td>
                          <td className="text-right font-semibold">74,99 €/trimestre</td>
                        </tr>
                        <tr className="border-b border-amber-200">
                          <td className="py-3">Individual Anual</td>
                          <td className="text-right font-semibold">249,99 €/año</td>
                        </tr>
                        <tr className="border-b border-amber-200">
                          <td className="py-3">Familiar Mensual</td>
                          <td className="text-right font-semibold">49,99 €/mes</td>
                        </tr>
                        <tr className="border-b border-amber-200">
                          <td className="py-3">Familiar Trimestral</td>
                          <td className="text-right font-semibold">129,99 €/trimestre</td>
                        </tr>
                        <tr>
                          <td className="py-3">Familiar Anual</td>
                          <td className="text-right font-semibold">399,99 €/año</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-800 text-sm">
                    <strong>Aviso importante:</strong> ManoProtect enviará un correo electrónico recordatorio 48 horas antes 
                    de la finalización del período de prueba, informando de la fecha de cargo y el importe correspondiente.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 4: Derecho de Desistimiento */}
            <section id="desistimiento" className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">4</span>
                <h2 className="text-2xl font-bold text-slate-900">Derecho de Desistimiento</h2>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Scale className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 text-lg mb-2">4.1. Fundamento Legal</h3>
                    <p className="text-emerald-800">
                      De conformidad con el artículo 102 del Real Decreto Legislativo 1/2007 y el artículo 9 de la Directiva 2011/83/UE, 
                      el Usuario tiene derecho a desistir del contrato en un plazo de <strong>catorce (14) días naturales</strong> sin 
                      necesidad de indicar el motivo y sin incurrir en coste alguno.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/70 rounded-xl p-5 border border-emerald-200">
                    <h4 className="font-bold text-emerald-900 mb-3">4.2. Cómputo del Plazo</h4>
                    <p className="text-emerald-800 text-sm">
                      El plazo de desistimiento expirará a los 14 días naturales contados desde:
                    </p>
                    <ul className="mt-3 space-y-2 text-emerald-700 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">a</span>
                        <span>La fecha de celebración del contrato, en caso de prestación de servicios</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">b</span>
                        <span>La fecha de recepción del bien, en caso de adquisición de dispositivos físicos</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white/70 rounded-xl p-5 border border-emerald-200">
                    <h4 className="font-bold text-emerald-900 mb-3">4.3. Ejercicio del Derecho</h4>
                    <p className="text-emerald-800 text-sm">
                      Para ejercer el derecho de desistimiento, el Usuario deberá notificar a ManoProtect su decisión de 
                      desistir del contrato mediante una declaración inequívoca, pudiendo utilizar:
                    </p>
                    <ul className="mt-3 space-y-2 text-emerald-700 text-sm">
                      <li>• El formulario de desistimiento disponible en la plataforma</li>
                      <li>• Correo electrónico a: reembolsos@manoprotectt.com</li>
                      <li>• Comunicación postal a la dirección de la empresa</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border-2 border-emerald-300">
                  <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    4.4. Efectos del Desistimiento
                  </h4>
                  <p className="text-emerald-800 mb-4">
                    En caso de desistimiento válido, ManoProtect reembolsará al Usuario todos los pagos recibidos, 
                    incluidos los gastos de entrega si los hubiere, sin demoras indebidas y, en cualquier caso, 
                    en un plazo máximo de <strong>14 días naturales</strong> desde la fecha de notificación.
                  </p>
                  <div className="bg-emerald-100 rounded-lg p-4">
                    <p className="text-emerald-900 font-semibold text-center text-lg">
                      Garantía de Reembolso del 100%
                    </p>
                    <p className="text-emerald-700 text-center text-sm mt-1">
                      Sin preguntas, sin condiciones, sin retenciones
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 5: Procedimiento */}
            <section id="procedimiento" className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">5</span>
                <h2 className="text-2xl font-bold text-slate-900">Procedimiento de Solicitud de Reembolso</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Acceso a la Plataforma</h4>
                    <p className="text-slate-600 text-sm">
                      Inicie sesión en su cuenta de ManoProtect y navegue a <strong>Perfil → Mi Suscripción → Solicitar Reembolso</strong>. 
                      Complete el formulario indicando el motivo de la solicitud (opcional).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Solicitud por Correo Electrónico</h4>
                    <p className="text-slate-600 text-sm">
                      Alternativamente, envíe un correo a <strong>reembolsos@manoprotectt.com</strong> incluyendo: 
                      nombre completo, correo electrónico de registro, fecha de contratación y número de referencia de pago.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Confirmación de Recepción</h4>
                    <p className="text-slate-600 text-sm">
                      Recibirá un correo de confirmación en un plazo máximo de <strong>24 horas laborables</strong> 
                      con el número de expediente asignado a su solicitud.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Procesamiento y Abono</h4>
                    <p className="text-slate-600 text-sm">
                      Una vez verificada la solicitud, el reembolso se efectuará mediante el mismo método de pago 
                      utilizado en la transacción original en un plazo de <strong>5 a 10 días laborables</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 6: Condiciones por Plan */}
            <section id="condiciones" className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">6</span>
                <h2 className="text-2xl font-bold text-slate-900">Condiciones de Reembolso por Tipo de Plan</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                      <th className="text-left p-4 font-semibold">Plan</th>
                      <th className="text-left p-4 font-semibold">Primeros 14 días</th>
                      <th className="text-left p-4 font-semibold">15-30 días</th>
                      <th className="text-left p-4 font-semibold">Posterior</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr className="border-b border-slate-100">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        Individual Mensual
                      </td>
                      <td className="p-4"><span className="text-emerald-600 font-semibold">100% reembolso</span></td>
                      <td className="p-4">75% proporcional</td>
                      <td className="p-4">Sin reembolso</td>
                    </tr>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        Individual Anual
                      </td>
                      <td className="p-4"><span className="text-emerald-600 font-semibold">100% reembolso</span></td>
                      <td className="p-4">Proporcional (meses no usados)</td>
                      <td className="p-4">Proporcional -10%</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        Familiar Mensual
                      </td>
                      <td className="p-4"><span className="text-emerald-600 font-semibold">100% reembolso</span></td>
                      <td className="p-4">75% proporcional</td>
                      <td className="p-4">Sin reembolso</td>
                    </tr>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        Familiar Anual
                      </td>
                      <td className="p-4"><span className="text-emerald-600 font-semibold">100% reembolso</span></td>
                      <td className="p-4">Proporcional (meses no usados)</td>
                      <td className="p-4">Proporcional -10%</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        Empresas
                      </td>
                      <td className="p-4"><span className="text-emerald-600 font-semibold">100% reembolso</span></td>
                      <td className="p-4" colSpan="2">Según términos del contrato empresarial</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Sección 7: Exclusiones */}
            <section id="exclusiones" className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">7</span>
                <h2 className="text-2xl font-bold text-slate-900">Exclusiones y Limitaciones</h2>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  7.1. Supuestos de Exclusión del Reembolso
                </h3>
                <p className="text-red-800 mb-4">
                  No procederá el reembolso en los siguientes supuestos:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-red-800">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Cuentas suspendidas:</strong> Cuando la cuenta haya sido suspendida o cancelada por incumplimiento de los Términos y Condiciones de uso.</span>
                  </li>
                  <li className="flex items-start gap-3 text-red-800">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Prescripción:</strong> Solicitudes presentadas transcurridos más de seis (6) meses desde la fecha del cargo.</span>
                  </li>
                  <li className="flex items-start gap-3 text-red-800">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Uso fraudulento:</strong> Cuando se detecte un patrón de solicitudes de reembolso reiteradas con indicios de abuso del sistema.</span>
                  </li>
                  <li className="flex items-start gap-3 text-red-800">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Servicios consumidos:</strong> Cuando el Usuario haya utilizado de forma sustancial los servicios (más del 50% de análisis disponibles, alertas SOS activadas, etc.).</span>
                  </li>
                  <li className="flex items-start gap-3 text-red-800">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Dispositivos físicos usados:</strong> Dispositivos SOS que hayan sido activados, desprecintados o presenten signos de uso.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  7.2. Excepciones al Derecho de Desistimiento
                </h3>
                <p className="text-amber-800 mb-4">
                  Conforme al artículo 103 del RDL 1/2007, el derecho de desistimiento no será aplicable a:
                </p>
                <ul className="space-y-2 text-amber-800 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Servicios que hayan sido completamente ejecutados cuando la ejecución haya comenzado con el consentimiento previo y expreso del consumidor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Contenido digital que no se suministre en soporte material cuando la ejecución haya comenzado con el consentimiento del consumidor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Bienes precintados que no sean aptos para ser devueltos por razones de protección de la salud o de higiene y que hayan sido desprecintados</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Sección 8: Cancelación */}
            <section id="cancelacion" className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">8</span>
                <h2 className="text-2xl font-bold text-slate-900">Cancelación de Suscripción</h2>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600">
                  El Usuario podrá cancelar su suscripción en cualquier momento, sin penalización alguna, 
                  a través de su panel de control o comunicándolo por escrito a ManoProtect.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h4 className="font-bold text-blue-900 mb-3">Efectos de la Cancelación</h4>
                  <ul className="space-y-2 text-blue-800 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>La cancelación se hace efectiva al final del período de facturación en curso</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>El Usuario mantiene acceso completo hasta la fecha de expiración</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>No se realizarán cargos adicionales tras la cancelación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Los datos del Usuario se conservarán según la política de privacidad</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
                  <h4 className="font-bold text-violet-900 mb-3">Reactivación de Cuenta</h4>
                  <ul className="space-y-2 text-violet-800 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                      <span>El Usuario puede reactivar su suscripción en cualquier momento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                      <span>Historial y configuraciones se mantienen durante 12 meses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                      <span>Nuevos períodos de prueba no disponibles para cuentas previas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sección 9: Plazos */}
            <section id="plazos" className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">9</span>
                <h2 className="text-2xl font-bold text-slate-900">Plazos de Procesamiento</h2>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">24-48h</p>
                    <p className="text-slate-600 text-sm">Confirmación de solicitud</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3">
                      <RefreshCcw className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">3-5 días</p>
                    <p className="text-slate-600 text-sm">Procesamiento interno</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-8 h-8 text-violet-600" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">5-10 días</p>
                    <p className="text-slate-600 text-sm">Abono en cuenta bancaria</p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm text-center mt-6">
                  * Los plazos indicados son en días laborables y pueden variar según la entidad bancaria del Usuario
                </p>
              </div>
            </section>

            {/* Sección 10: Contacto */}
            <section id="contacto" className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">10</span>
                <h2 className="text-2xl font-bold text-slate-900">Información de Contacto</h2>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6">Departamento de Atención al Cliente y Reembolsos</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-emerald-100 text-xs">Correo electrónico</p>
                        <a href="mailto:reembolsos@manoprotectt.com" className="font-semibold hover:underline">
                          reembolsos@manoprotectt.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-emerald-100 text-xs">Teléfono de atención</p>
                        <a href="tel:+34601510950" className="font-semibold hover:underline">
                          +34 601 510 950
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-emerald-100 text-xs">Horario de atención</p>
                        <p className="font-semibold">Lunes a Viernes: 9:00 - 18:00 (CET)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-emerald-100 text-xs">Razón social</p>
                        <p className="font-semibold">ManoProtect S.L.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 rounded-xl p-5 text-center">
                <p className="text-slate-600 text-sm">
                  Para consultas generales no relacionadas con reembolsos, puede contactar con 
                  <a href="mailto:info@manoprotectt.com" className="text-emerald-600 font-medium ml-1 hover:underline">
                    info@manoprotectt.com
                  </a>
                </p>
              </div>
            </section>

            {/* Disposiciones Finales */}
            <section className="border-t border-slate-200 pt-8 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Disposiciones Finales</h2>
              <div className="prose prose-slate prose-sm max-w-none text-slate-600">
                <p>
                  La presente Política de Reembolsos forma parte integrante de los Términos y Condiciones de uso de ManoProtect. 
                  En caso de conflicto entre las disposiciones de este documento y los Términos y Condiciones, prevalecerán 
                  estos últimos, salvo que la normativa de protección al consumidor establezca lo contrario.
                </p>
                <p>
                  ManoProtect se reserva el derecho de modificar la presente Política en cualquier momento, notificando 
                  a los Usuarios las modificaciones sustanciales con una antelación mínima de treinta (30) días. Las 
                  modificaciones serán de aplicación a las contrataciones realizadas con posterioridad a su entrada en vigor.
                </p>
                <p>
                  Para la resolución de cualquier controversia derivada de la presente Política, las partes se someten 
                  a la jurisdicción de los Juzgados y Tribunales del domicilio del consumidor, de conformidad con la 
                  normativa vigente en materia de protección de consumidores y usuarios.
                </p>
              </div>
            </section>

            {/* Pie del documento */}
            <div className="text-center pt-8 border-t border-slate-200">
              <p className="text-slate-500 text-sm">
                © 2026 ManoProtect S.L. - Todos los derechos reservados
              </p>
              <p className="text-slate-400 text-xs mt-2">
                Documento generado conforme a la normativa española y europea de protección al consumidor
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;
