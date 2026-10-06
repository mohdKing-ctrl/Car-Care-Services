/* ------------------------------------------------------------------
   Car Care Services – sample data
   All companies below are FICTIONAL examples for the college project.
   To change a contact number, edit the `wa` field (country code 968 +
   8-digit number, no "+" or spaces). The call and WhatsApp buttons
   both read from it.
------------------------------------------------------------------- */

const SERVICES = [
  { key: 'wash',     icon: '🚿', en: 'Exterior Wash',     ar: 'غسيل خارجي',        dEn: 'Foam wash, rinse and hand dry at your door.',       dAr: 'غسيل بالرغوة وتجفيف يدوي عند باب بيتك.' },
  { key: 'interior', icon: '🧽', en: 'Interior Cleaning', ar: 'تنظيف داخلي',       dEn: 'Vacuum, seats, dashboard and carpets.',             dAr: 'شفط، مقاعد، طبلون وسجاد.' },
  { key: 'detail',   icon: '✨', en: 'Polish & Detailing', ar: 'تلميع وتفصيل',     dEn: 'Deep polish, wax and paint protection.',            dAr: 'تلميع عميق، شمع وحماية للطلاء.' },
  { key: 'oil',      icon: '🛢️', en: 'Oil Change',        ar: 'تغيير الزيت',       dEn: 'Engine oil and filter changed on-site.',            dAr: 'تغيير زيت المحرك والفلتر في موقعك.' },
  { key: 'battery',  icon: '🔋', en: 'Battery Service',   ar: 'خدمة البطارية',     dEn: 'Testing, jump-start and replacement.',              dAr: 'فحص وتشغيل وتغيير البطارية.' },
  { key: 'tyre',     icon: '🛞', en: 'Tyre Service',      ar: 'خدمة الإطارات',     dEn: 'Puncture repair, swap and pressure check.',         dAr: 'تصليح بنشر، تبديل وفحص الضغط.' },
  { key: 'ac',       icon: '❄️', en: 'A/C Service',       ar: 'صيانة المكيف',      dEn: 'Gas refill and cooling check for Oman summers.',    dAr: 'تعبئة غاز وفحص التبريد لصيف عُمان.' },
  { key: 'brakes',   icon: '🛑', en: 'Brake Check',       ar: 'فحص الفرامل',       dEn: 'Pads, discs and brake-fluid inspection.',           dAr: 'فحص الفحمات والأقراص وزيت الفرامل.' }
];

const GOVERNORATES = [
  { key: 'muscat',      en: 'Muscat',            ar: 'مسقط' },
  { key: 'dhofar',      en: 'Dhofar',            ar: 'ظفار' },
  { key: 'musandam',    en: 'Musandam',          ar: 'مسندم' },
  { key: 'buraimi',     en: 'Al Buraimi',        ar: 'البريمي' },
  { key: 'dakhiliyah',  en: 'Ad Dakhiliyah',     ar: 'الداخلية' },
  { key: 'batinah-n',   en: 'Al Batinah North',  ar: 'شمال الباطنة' },
  { key: 'batinah-s',   en: 'Al Batinah South',  ar: 'جنوب الباطنة' },
  { key: 'sharqiyah-n', en: 'Ash Sharqiyah North', ar: 'شمال الشرقية' },
  { key: 'sharqiyah-s', en: 'Ash Sharqiyah South', ar: 'جنوب الشرقية' },
  { key: 'dhahirah',    en: 'Ad Dhahirah',       ar: 'الظاهرة' },
  { key: 'wusta',       en: 'Al Wusta',          ar: 'الوسطى' }
];

/* prices are in Omani Rial (OMR) – the starting price for a standard sedan */
const PROVIDERS = [
  {
    id: 'al-noor', name: 'Al Noor Mobile Wash', nameAr: 'النور للغسيل المتنقل', initials: 'AN', color: '#0E7C86',
    govs: ['muscat'], areas: [['Al Khuwair', 'الخوير'], ['Qurum', 'القرم'], ['Al Ghubra', 'الغبرة'], ['Bawshar', 'بوشر'], ['Al Mawaleh', 'الموالح']],
    services: { wash: 3, interior: 7, detail: 18 },
    rating: 4.8, reviews: 214, years: 6, hours: [7, 22], reply: 10, wa: '96891000001',
    desc: 'Waterless and low-water mobile washing vans. We arrive fully equipped, so you only need a parking spot.',
    descAr: 'سيارات غسيل متنقلة بمياه قليلة. نصلك بكامل المعدات وكل ما تحتاجه موقف للسيارة.'
  },
  {
    id: 'sahara', name: 'Sahara Auto Care', nameAr: 'صحارى لخدمة السيارات', initials: 'SA', color: '#B45309',
    govs: ['muscat', 'batinah-s'], areas: [['Seeb', 'السيب'], ['Al Maabela', 'المعبيلة'], ['Al Khoud', 'الخوض'], ['Barka', 'بركاء']],
    services: { oil: 13, battery: 28, brakes: 22, ac: 16, tyre: 3 },
    rating: 4.7, reviews: 168, years: 9, hours: [8, 21], reply: 20, wa: '96891000002',
    desc: 'A workshop on wheels. Certified mechanics, genuine-spec oil and filters, and a written service report.',
    descAr: 'ورشة متنقلة بميكانيكيين معتمدين وزيوت وفلاتر بمواصفات الوكالة وتقرير خدمة مكتوب.'
  },
  {
    id: 'gulf-shine', name: 'Gulf Shine Detailing', nameAr: 'لمعة الخليج للتلميع', initials: 'GS', color: '#6D28D9',
    govs: ['muscat'], areas: [['Qurum', 'القرم'], ['Shatti Al Qurum', 'شاطئ القرم'], ['Madinat Sultan Qaboos', 'مدينة السلطان قابوس'], ['Azaiba', 'العذيبة']],
    services: { wash: 4, interior: 9, detail: 25 },
    rating: 4.9, reviews: 97, years: 4, hours: [8, 21], reply: 15, wa: '96891000003',
    desc: 'Premium paint correction, nano-wax and leather care for owners who want a showroom finish.',
    descAr: 'تلميع احترافي ونانو واكس وعناية بالجلد لمن يريد لمعة المعرض.'
  },
  {
    id: 'dhofar-oil', name: 'Dhofar Oil Express', nameAr: 'ظفار إكسبريس للزيوت', initials: 'DO', color: '#15803D',
    govs: ['dhofar'], areas: [['Salalah', 'صلالة'], ['Saada', 'السعادة'], ['Awqad', 'عوقد'], ['Taqah', 'طاقة']],
    services: { oil: 12, ac: 15, tyre: 3, battery: 26 },
    rating: 4.6, reviews: 132, years: 7, hours: [7, 23], reply: 25, wa: '96891000004',
    desc: 'Fast oil changes and A/C checks across Salalah. Perfect for the Khareef season when roads are wet.',
    descAr: 'تغيير زيت سريع وفحص مكيف في صلالة، مثالي لموسم الخريف.'
  },
  {
    id: 'khareef-wash', name: 'Khareef Car Wash', nameAr: 'الخريف لغسيل السيارات', initials: 'KW', color: '#0369A1',
    govs: ['dhofar'], areas: [['Salalah', 'صلالة'], ['Al Dahariz', 'الدهاريز'], ['Awqad', 'عوقد']],
    services: { wash: 2.5, interior: 6, detail: 20 },
    rating: 4.5, reviews: 88, years: 3, hours: [6, 22], reply: 20, wa: '96891000005',
    desc: 'Affordable daily and weekly wash plans for families and fleets in Salalah.',
    descAr: 'باقات غسيل يومية وأسبوعية بأسعار مناسبة للعائلات والشركات في صلالة.'
  },
  {
    id: 'sohar-garage', name: 'Sohar Mobile Garage', nameAr: 'كراج صحار المتنقل', initials: 'SM', color: '#BE123C',
    govs: ['batinah-n'], areas: [['Sohar', 'صحار'], ['Shinas', 'شناص'], ['Liwa', 'لوى'], ['Saham', 'صحم']],
    services: { oil: 14, battery: 30, brakes: 24, ac: 17, tyre: 3.5, wash: 3 },
    rating: 4.8, reviews: 156, years: 8, hours: [7, 22], reply: 15, wa: '96891000006',
    desc: 'The widest range in Al Batinah North – from a quick wash to brake jobs, all done in your driveway.',
    descAr: 'أوسع نطاق خدمات في شمال الباطنة، من الغسيل السريع إلى الفرامل، كلها أمام بيتك.'
  },
  {
    id: 'nizwa-doctor', name: 'Nizwa Auto Doctor', nameAr: 'دكتور السيارات نزوى', initials: 'ND', color: '#9A3412',
    govs: ['dakhiliyah'], areas: [['Nizwa', 'نزوى'], ['Bahla', 'بهلا'], ['Izki', 'إزكي'], ['Manah', 'منح']],
    services: { oil: 13, battery: 27, tyre: 3, brakes: 21, ac: 15 },
    rating: 4.7, reviews: 74, years: 5, hours: [8, 20], reply: 30, wa: '96891000007',
    desc: 'Reliable mechanics for the interior of Oman. We drive to you, wherever you are in Ad Dakhiliyah.',
    descAr: 'ميكانيكيون موثوقون في الداخلية، نأتي إليك أينما كنت.'
  },
  {
    id: 'sur-sparkle', name: 'Sur Sparkle', nameAr: 'بريق صور', initials: 'SS', color: '#0F766E',
    govs: ['sharqiyah-s'], areas: [['Sur', 'صور'], ['Al Kamil Wal Wafi', 'الكامل والوافي'], ['Ras Al Hadd', 'رأس الحد']],
    services: { wash: 3, interior: 7, detail: 19, oil: 13 },
    rating: 4.6, reviews: 61, years: 4, hours: [7, 21], reply: 20, wa: '96891000008',
    desc: 'Coastal-friendly washing that removes salt and dust, plus quick oil changes at your home.',
    descAr: 'غسيل مناسب للمناطق الساحلية يزيل الملح والغبار مع تغيير زيت سريع في بيتك.'
  },
  {
    id: 'barka-roadside', name: 'Barka Quick Fix Roadside', nameAr: 'باركا كويك فيكس', initials: 'BQ', color: '#DC2626',
    govs: ['batinah-s', 'muscat'], areas: [['Barka', 'بركاء'], ['Rustaq', 'الرستاق'], ['Al Musannah', 'المصنعة'], ['Seeb', 'السيب']],
    services: { battery: 25, tyre: 3, oil: 12.5, brakes: 20 },
    rating: 4.4, reviews: 119, years: 5, hours: [0, 24], reply: 12, wa: '96891000009',
    desc: 'Open 24 hours. Dead battery or flat tyre at midnight? We are the ones to call.',
    descAr: 'نعمل على مدار الساعة. بطارية فارغة أو إطار مبنشر في منتصف الليل؟ اتصل بنا.'
  },
  {
    id: 'buraimi-shine', name: 'Al Buraimi Shine & Service', nameAr: 'بريق وخدمة البريمي', initials: 'BS', color: '#4338CA',
    govs: ['buraimi'], areas: [['Al Buraimi', 'البريمي'], ['Mahdah', 'محضة'], ['Sunaynah', 'السنينة']],
    services: { wash: 3, interior: 6.5, oil: 13, ac: 16, battery: 28 },
    rating: 4.5, reviews: 52, years: 3, hours: [8, 22], reply: 25, wa: '96891000010',
    desc: 'Wash and basic service for Al Buraimi homes and offices, with flexible weekend appointments.',
    descAr: 'غسيل وصيانة أساسية لبيوت ومكاتب البريمي مع مواعيد مرنة في نهاية الأسبوع.'
  },
  {
    id: 'ibri-clinic', name: 'Ibri Car Clinic', nameAr: 'عيادة السيارات عبري', initials: 'IC', color: '#A21CAF',
    govs: ['dhahirah'], areas: [['Ibri', 'عبري'], ['Yanqul', 'ينقل'], ['Dhank', 'ضنك']],
    services: { oil: 13, tyre: 3, battery: 27, ac: 15, brakes: 21 },
    rating: 4.6, reviews: 47, years: 4, hours: [8, 21], reply: 30, wa: '96891000011',
    desc: 'Full mechanical care for Ad Dhahirah, with honest quotes before any work starts.',
    descAr: 'عناية ميكانيكية متكاملة في الظاهرة مع تسعيرة واضحة قبل بدء العمل.'
  },
  {
    id: 'khasab-care', name: 'Musandam Mobile Care', nameAr: 'مسندم للعناية المتنقلة', initials: 'MC', color: '#0891B2',
    govs: ['musandam'], areas: [['Khasab', 'خصب'], ['Bukha', 'بخا'], ['Dibba', 'دبا']],
    services: { wash: 3.5, oil: 14, tyre: 4 },
    rating: 4.3, reviews: 28, years: 2, hours: [8, 20], reply: 35, wa: '96891000012',
    desc: 'The first mobile car-care team serving Khasab, Bukha and Dibba.',
    descAr: 'أول فريق عناية متنقل بالسيارات يخدم خصب وبخا ودبا.'
  },
  {
    id: 'ibra-wash', name: 'Ibra Auto Wash', nameAr: 'إبراء أوتو واش', initials: 'IW', color: '#CA8A04',
    govs: ['sharqiyah-n'], areas: [['Ibra', 'إبراء'], ['Bidiyah', 'بدية'], ['Mudhaibi', 'المضيبي']],
    services: { wash: 3, interior: 6.5, detail: 18, oil: 13.5 },
    rating: 4.5, reviews: 39, years: 3, hours: [7, 21], reply: 25, wa: '96891000013',
    desc: 'Friendly wash and oil-change team for Ash Sharqiyah North, available on weekends too.',
    descAr: 'فريق غسيل وتغيير زيت لشمال الشرقية، متوفر في عطلة نهاية الأسبوع أيضاً.'
  },
  {
    id: 'duqm-care', name: 'Duqm Car Care', nameAr: 'الدقم لخدمات السيارات', initials: 'DC', color: '#475569',
    govs: ['wusta'], areas: [['Duqm', 'الدقم'], ['Al Jazer', 'الجازر'], ['Mahout', 'محوت']],
    services: { wash: 3.5, oil: 15, battery: 30, tyre: 4, ac: 18 },
    rating: 4.4, reviews: 33, years: 3, hours: [7, 20], reply: 30, wa: '96891000014',
    desc: 'Serving workers, families and fleets in Duqm and the Al Wusta region.',
    descAr: 'نخدم العاملين والعائلات والأساطيل في الدقم ومنطقة الوسطى.'
  }
];
