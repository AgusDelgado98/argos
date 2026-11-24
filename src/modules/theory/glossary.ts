export interface Concept {
  id: string;
  term: string;
  short: string;
  detail: string;
  lookFor: string[];
}

export const CONCEPTS: readonly Concept[] = [
  {
    id: 'phishing',
    term: 'Phishing',
    short: 'Un mensaje que se hace pasar por alguien de confianza para que entregues datos, dinero o acceso.',
    detail:
      'Puede llegar por correo, SMS, WhatsApp o redes. No siempre tiene errores de ortografía ni logos mal hechos: lo que lo delata es lo que te pide y cómo te lo pide.',
    lookFor: ['Pedidos de claves, códigos o datos de tarjeta', 'Presión para actuar ya', 'Remitentes o enlaces que no coinciden con la entidad'],
  },
  {
    id: 'remitente',
    term: 'Remitente',
    short: 'Quién dice enviar el mensaje: un nombre visible y una dirección de correo.',
    detail:
      'El nombre visible se puede escribir libremente; la dirección también puede falsificarse o venir de una cuenta comprometida. Mirá además el campo «Responder a»: si tu respuesta iría a otra casilla, es una señal importante.',
    lookFor: ['Nombre y dirección que no coinciden', '«Responder a» distinto del remitente', 'Cuentas genéricas para trámites delicados'],
  },
  {
    id: 'dominio',
    term: 'Dominio',
    short: 'La parte de la dirección que va después de la @ (o el nombre del sitio en un enlace).',
    detail:
      'Los estafadores registran dominios parecidos al real, agregando palabras como «validación», «seguro» o «soporte». Lo que importa es el dominio completo, leído de derecha a izquierda: «banco.ejemplo.verificacion.example» pertenece a «verificacion.example», no al banco.',
    lookFor: ['Palabras agregadas al nombre de la marca', 'Letras cambiadas (rn por m, 0 por o)', 'Dominios que no conocés para una entidad que sí conocés'],
  },
  {
    id: 'urgencia',
    term: 'Urgencia y presión',
    short: 'Plazos cortos, amenazas o premios que vencen para que actúes sin pensar.',
    detail:
      'La urgencia por sí sola no prueba un fraude: un turno o un vencimiento real también tienen fecha. La señal es la combinación de urgencia con un pedido sensible (claves, pagos, secreto).',
    lookFor: ['«En las próximas 2 horas»', 'Amenazas de bloqueo o multas', '«No se lo digas a nadie»'],
  },
  {
    id: 'adjunto',
    term: 'Adjunto',
    short: 'Un archivo que viene con el correo: facturas, comprobantes, documentos.',
    detail:
      'Un adjunto que no esperabas puede contener malware o llevarte a una página falsa. Antes de abrirlo, confirmá con quien lo envía por un canal que ya tengas. En ARGOS los adjuntos son solo texto: no se pueden descargar.',
    lookFor: ['Adjuntos inesperados', 'Nombres genéricos («Factura.pdf») sin contexto', 'Extensiones dobles o comprimidos con contraseña'],
  },
  {
    id: 'enlace',
    term: 'Enlace',
    short: 'Un botón o texto que lleva a una dirección web.',
    detail:
      'El texto del botón puede decir cualquier cosa; lo que importa es el destino real. En una computadora podés verlo pasando el cursor por encima; en el celular, manteniendo presionado. Ante la duda, no lo uses: escribí vos la dirección oficial. En ARGOS los enlaces son inertes: podés tocarlos para ver el destino sin riesgo.',
    lookFor: ['Destino distinto de la marca', 'Acortadores de enlaces', 'Formularios que piden claves'],
  },
  {
    id: 'verificacion',
    term: 'Verificación por otro canal',
    short: 'Confirmar un pedido usando un medio que ya conocés, no los datos del propio mensaje.',
    detail:
      'Llamar al número de tu tarjeta, entrar a la app oficial, escribir la dirección a mano o preguntarle en persona a un compañero. Es la herramienta más poderosa: sirve igual para mensajes legítimos, dudosos o falsos.',
    lookFor: ['¿Tengo un canal propio para confirmar?', '¿El mensaje me pide no verificar?', '¿Coincide con algo que yo hice?'],
  },
  {
    id: 'suplantacion',
    term: 'Suplantación de identidad',
    short: 'Hacerse pasar por una persona u organismo con autoridad: un jefe, un banco, un organismo público.',
    detail:
      'En el «fraude del CEO» alguien se hace pasar por un directivo para pedir transferencias urgentes y confidenciales. Los organismos y bancos reales no piden claves ni fotos de documentos por correo.',
    lookFor: ['Pedidos fuera del procedimiento habitual', 'Secreto y apuro', 'Autoridad usada como presión'],
  },
];

export function getConcept(id: string): Concept | undefined {
  return CONCEPTS.find((c) => c.id === id);
}
