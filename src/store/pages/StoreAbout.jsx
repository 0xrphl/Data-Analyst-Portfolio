import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const WHATSAPP_NUMBER = '573117170688';
const EMAILJS_SERVICE = 'service_pxnvv1y';
const EMAILJS_TEMPLATE = 'template_p7khd1j';
const EMAILJS_PUBLIC_KEY = 'C-lqF5So-fON-s2VF';

export default function StoreAbout() {
  const formRef = useRef();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Impresión 3D Personalizada',
    details: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorNotice, setErrorNotice] = useState(false);

  const handleDownloadVCard = () => {
    const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:3D Agora Lab\nORG:3D Agora Lab\nTITLE:Laboratorio de Impresión 3D & Ingeniería Mecatrónica\nTEL;TYPE=CELL,VOICE,WHATSAPP:+573117170688\nEMAIL:0xrphl@gmail.com\nURL:https://3dagoralab.com\nADR;TYPE=WORK:;;Pereira;Risaralda;;Colombia\nNOTE:Fabricación aditiva, escaneo 3D, ingeniería inversa CAD y sistemas embebidos IoT.\nEND:VCARD';

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '3D_Agora_Lab_Contacto.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorNotice(false);

    const fullMessage = `[SOLICITUD DESDE TARJETA DIGITAL - 3D AGORA LAB]
Servicio requerido: ${form.service}
Cliente / Contacto: ${form.name}
WhatsApp / Teléfono: ${form.phone}
Correo: ${form.email}

Detalles del proyecto:
${form.details}`;

    emailjs
      .send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          from_name: form.name,
          to_name: '3D Agora Lab / Raphael Sanchez',
          from_email: form.email,
          to_email: '0xrphl@gmail.com',
          message: fullMessage,
        },
        EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setLoading(false);
          setSubmitted(true);
          setForm({
            name: '',
            phone: '',
            email: '',
            service: 'Impresión 3D Personalizada',
            details: '',
          });
        },
        () => {
          setLoading(false);
          setErrorNotice(true);
        }
      );
  };

  const services = [
    {
      icon: '🖨️',
      title: 'Fabricación Aditiva & Pedidos Personalizados',
      subtitle: 'FDM Técnico y Resina SLA 8K de Alta Definición',
      desc: 'Fabricación a medida con polímeros de ingeniería: PLA+, PETG, ABS, ASA resistente a UV, TPU flexible, Nylon y resinas biocompatibles/rígidas. Ideal para prototipos mecánicos, repuestos funcionales, carcasas técnicas, lámparas y merchandising corporativo.',
      badge: 'FDM & SLA',
    },
    {
      icon: '📐',
      title: 'Escaneo 3D Óptico de Alta Precisión',
      subtitle: 'Captura Dimensional sin Contacto de Geometrías Físicas',
      desc: 'Digitalización tridimensional precisa de piezas mecánicas complejas, matrices y componentes descatalogados. Obtenemos mallas poligonales optimizadas listas para control dimensional, rediseño o fabricación.',
      badge: 'Precisión Submilimétrica',
    },
    {
      icon: '⚙️',
      title: 'Ingeniería Inversa & Reconstrucción CAD',
      subtitle: 'Modelado Paramétrico Profesional en SOLIDWORKS',
      desc: 'Transformamos mallas escaneadas o muestras físicas deterioradas en sólidos paramétricos totalmente editables. Aplicamos normas industriales ASME Y14.5 / ISO, tolerancias geométricas (GD&T) y preparación para mecanizado CNC o inyección.',
      badge: 'Estándar Industrial',
    },
    {
      icon: '📊',
      title: 'Cotizaciones Técnicas & Estimaciones',
      subtitle: 'Cálculo Transparente de Viabilidad y Costos',
      desc: 'Optimización de peso en gramos, densidad de relleno (infill), orientación de capas para máxima resistencia mecánica y cotización formal por volumen y tiempo de máquina en menos de 24 horas.',
      badge: 'Respuesta Rápida',
    },
    {
      icon: '⚡',
      title: 'Sistemas Embebidos, Hardware & IoT',
      subtitle: 'Electrónica, Firmware y Plataformas Conectadas',
      desc: 'Desarrollo integral de productos inteligentes: diseño de circuitos y PCBs, ensamble con insertos roscados de latón, firmware en C/C++ para microcontroladores ESP32/STM32, conectividad LoRa/4G y dashboards de control web.',
      badge: 'Hardware + Software',
    },
    {
      icon: '🏆',
      title: 'Experiencia y Respaldo Multidisciplinario',
      subtitle: 'Ingeniería Mecánica + Desarrollo de Software',
      desc: 'Acompañamos cada fase del ciclo de vida del producto: desde la formulación matemática y cálculo estructural hasta la pieza tangible lista para ensamble o producción.',
      badge: 'End-to-End',
    },
  ];

  const galleryImages = [
    { src: '/store/assets/products/1/mossglow-lamp-1.jpg', title: 'Lámpara Orgánica Mossglow' },
    { src: '/store/assets/products/38/stitch-personalizado-encendido.jpg', title: 'Lámpara Stitch LED Personalizada' },
    { src: '/store/assets/products/6/cathedral-organizer-makeup.jpg', title: 'Organizador Modular Técnico' },
    { src: '/store/assets/products/46/gold-dragon.jpg', title: 'Impresión Articulada de Alta Tolerancia' },
    { src: '/store/assets/products/28/wii-control-organizer.jpg', title: 'Soporte con Ajuste a Presión' },
    { src: '/store/assets/products/5/keychain-organizer.jpg', title: 'Exhibidor Giratorio Ensamblado' },
  ];

  const waQuoteUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    '¡Hola 3D Agora Lab! Escaneé su tarjeta de presentación física y me gustaría cotizar un proyecto / pedido personalizado.'
  )}`;

  return (
    <div className="min-h-screen bg-[#06070D] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-violet-600/15 via-fuchsia-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── 1. DIGITAL BUSINESS CARD HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-b from-[#111322] to-[#0A0C16] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-violet-950/30 overflow-hidden mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 opacity-50 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 relative z-10">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 shadow-xl shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/store/assets/agora-logo.png"
                  alt="3D Agora Lab"
                  className="w-full h-full object-cover rounded-xl bg-black"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-green-500/90 text-black text-[11px] font-bold rounded-full border border-green-300 shadow">
                EN VIVO
              </span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-3">
                <span>🇨🇴</span>
                <span>Pereira, Colombia · Envíos Nacionales</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                3D Agora<span className="text-violet-400">Lab</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300 font-medium mt-1">
                Laboratorio de Fabricación Aditiva, Escaneo 3D & Ingeniería Mecatrónica
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
                Tarjeta digital de presentación para clientes presenciales y aliados técnicos.
                Transformamos ideas, piezas físicas descatalogadas y modelos matemáticos en componentes
                funcionales de alta fidelidad con estándar industrial.
              </p>

              {/* Mobile Quick Action Buttons Bar */}
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2.5 sm:gap-3">
                <a
                  href={waQuoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs sm:text-sm shadow-lg shadow-green-500/20 transition-transform active:scale-95"
                >
                  <img src="/store/assets/whatsapp.svg" alt="WhatsApp" className="w-4 h-4" />
                  <span>WhatsApp Directo</span>
                </a>

                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/10 transition-transform active:scale-95"
                >
                  <span>📞</span>
                  <span>Llamar</span>
                </a>

                <button
                  onClick={handleDownloadVCard}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-violet-600/20 transition-transform active:scale-95"
                >
                  <span>📥</span>
                  <span>Guardar Contacto</span>
                </button>

                <Link
                  to="/store"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-xs sm:text-sm border border-white/10 transition-colors"
                >
                  <span>🛒</span>
                  <span>Ver Catálogo</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
        {/* ── 2. CAPABILITIES & SERVICES ── */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Servicios de Ingeniería & Manufactura
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl mx-auto">
              Equipamiento técnico avanzado y metodologías de precisión para resolver requerimientos industriales y particulares.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group relative bg-[#0D0F1C] hover:bg-[#121528] border border-white/10 hover:border-violet-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-violet-950/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl sm:text-3xl p-2.5 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                      {svc.icon}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {svc.badge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-xs font-medium text-violet-400/90 mt-1">
                    {svc.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2.5 leading-relaxed">
                    {svc.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                      `¡Hola 3D Agora Lab! Deseo consultar sobre el servicio de: ${svc.title}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Consultar por WhatsApp</span>
                    <span>→</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── 3. VISUAL SHOWCASE GALLERY ── */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Portafolio Visual & Muestras Tangibles
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Acabados superficiales reales, precisión dimensional y ensambles funcionales.
              </p>
            </div>
            <Link
              to="/store"
              className="mt-3 sm:mt-0 text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1"
            >
              <span>Explorar tienda completa</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {galleryImages.map((img, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.04 }}
                className="relative rounded-xl overflow-hidden border border-white/10 group aspect-square bg-black/50"
              >
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-[11px] font-semibold text-white leading-tight">
                    {img.title}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* ── 4. DIRECT WHATSAPP & EMAIL QUOTE FORM ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-gradient-to-b from-[#121626] to-[#0D101C] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
                <img src="/store/assets/whatsapp.svg" alt="WhatsApp" className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Atención Inmediata</h3>
                <p className="text-xs text-green-400 font-semibold">Respuesta técnica ágil</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
              Si estás en nuestro punto físico o necesitas enviar de inmediato archivos STL/STEP,
              planos o fotografías de una pieza a cotizar, escríbenos directamente por WhatsApp.
            </p>

            <a
              href={waQuoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 transition-transform active:scale-98 mb-5"
            >
              <img src="/store/assets/whatsapp.svg" alt="WhatsApp" className="w-5 h-5" />
              <span>Abrir Chat de WhatsApp (+57 311 717 0688)</span>
            </a>

            <div className="space-y-3 pt-5 border-t border-white/10 text-xs text-gray-300">
              <div className="flex items-center gap-2.5">
                <span className="text-violet-400">📍</span>
                <span>Pereira, Risaralda — Envíos a toda Colombia</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-violet-400">✉️</span>
                <span>0xrphl@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-violet-400">🌐</span>
                <span>3dagoralab.com · 0xraphael.com</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0B0D18] border border-white/10 rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
              Formulario de Cotización Formal
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Envíanos los detalles técnicos de tu requerimiento. Analizaremos viabilidad y tiempo de entrega.
            </p>

            {submitted ? (
              <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
                <div className="text-3xl mb-2">✅</div>
                <h4 className="text-base font-bold text-green-300">¡Mensaje Enviado con Éxito!</h4>
                <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto">
                  Hemos recibido tu solicitud técnica. Nos pondremos en contacto contigo a la brevedad por correo o WhatsApp.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/15"
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSendEmail} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Nombre o Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Restrepo"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      WhatsApp o Teléfono *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. +57 312 345 6789"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="cliente@correo.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Tipo de Requerimiento *
                    </label>
                    <select
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#111322] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 transition-colors"
                    >
                      <option value="Impresión 3D Personalizada">Impresión 3D Personalizada</option>
                      <option value="Escaneo 3D Óptico">Escaneo 3D Óptico</option>
                      <option value="Ingeniería Inversa / Modelado CAD">Ingeniería Inversa / Modelado CAD</option>
                      <option value="Sistemas Embebidos / IoT">Sistemas Embebidos / IoT</option>
                      <option value="Producción de Lote / Piezas Técnicas">Producción de Lote / Piezas Técnicas</option>
                      <option value="Otro Servicio">Otro Servicio</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Descripción del Proyecto o Dimensiones Aproximadas *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe material preferido, aplicación mecánica, dimensiones aproximadas o si cuentas con archivos 3D (.STL, .STEP, etc.)..."
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>

                {errorNotice && (
                  <p className="text-xs text-red-400 font-semibold">
                    Hubo un error al enviar el formulario. Por favor comunícate directamente por WhatsApp.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-violet-600/30 transition-all active:scale-98 disabled:opacity-50"
                >
                  {loading ? 'Enviando requerimiento...' : 'Enviar Solicitud de Cotización 🚀'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


