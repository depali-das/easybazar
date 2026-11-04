export const CONTACT_INFO = {
  brandName: 'EasyBazar',

  phone: '01791974286',
  phoneLink: '+8801791974286',

  email: 'depali764@gmail.com',

  whatsapp: '8801791974286',
  whatsappLink: 'https://wa.me/8801791974286',

  address: 'Rajshahi, Bangladesh',

  supportHours: {
    start: '7:00 AM',
    end: '9:00 PM',
    display: 'সকাল ৭টা – রাত ৯টা',
  },

  deliveryArea: 'Rajshahi',

  deliveryCharge: 60,
  freeDeliveryMinimum: 500,
}

export const createWhatsAppLink = (message = '') => {
  const defaultMessage =
    'Hello EasyBazar Support, I need help with my order.'

  return `${CONTACT_INFO.whatsappLink}?text=${encodeURIComponent(
    message || defaultMessage,
  )}`
}
