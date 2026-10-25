export type Language = 'en' | 'ur';

export interface Translations {
  appName: string;
  tagline: string;
  agriOlx: string;
  market: string;
  liveRates: string;
  sell: string;
  account: string;
  login: string;
  register: string;
  logout: string;
  searchPlaceholder: string;
  installApp: string;
  allPakistan: string;
  allCategories: string;
  wheat: string;
  rice: string;
  flour: string;
  pulses: string;
  otherGrains: string;
  cotton: string;
  sugar: string;
  maize: string;
  oilseeds: string;
  showingListings: string;
  newestFirst: string;
  priceLowHigh: string;
  priceHighLow: string;
  unlockedOnly: string;
  clearFilters: string;
  postAdFree: string;
  topUpWallet: string;
  freeUnlocks: string;
  walletBalance: string;
  contactsRemaining: string;
  welcomeBonusNote: string;
  depositTitle: string;
  depositDesc: string;
  unlockContact: string;
  unlockContactFee: string;
  unlockWithReferral: string;
  sellerRating: string;
  sellerReviews: string;
  verifiedTrader: string;
  quantity: string;
  variety: string;
  packaging: string;
  moisture: string;
  harvestYear: string;
  callSeller: string;
  whatsapp: string;
  exactLocation: string;
  lowBalanceAlert: string;
  depositRequired: string;
  referralTitle: string;
  referralDesc: string;
  myReferralCode: string;
  copyCode: string;
  codeCopied: string;
  shareWhatsApp: string;
  switchAccount: string;
  exitAdmin: string;
  rateAnalysis: string;
  minPrice: string;
  maxPrice: string;
  avgPrice: string;
  trend: string;
  mandiUnit: string;
  close: string;
  confirmLogoutTitle: string;
  confirmLogoutYes: string;
  cancel: string;
  province: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'KisanMandi',
    tagline: 'Agricultural Commodities Marketplace',
    agriOlx: 'Agri OLX',
    market: 'Market',
    liveRates: 'Live Rates',
    sell: 'Sell Crop',
    account: 'Account',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    searchPlaceholder: 'Search Wheat, Basmati Rice, Flour, Pulses, Cotton, City...',
    installApp: 'Install App',
    allPakistan: 'All Pakistan',
    allCategories: 'All Categories',
    wheat: 'Wheat',
    rice: 'Rice',
    flour: 'Chakki Flour',
    pulses: 'Pulses & Gram',
    otherGrains: 'Maize & Oilseeds',
    cotton: 'Cotton & Lint',
    sugar: 'Sugar & Cane',
    maize: 'Maize & Corn',
    oilseeds: 'Mustard & Canola',
    showingListings: 'Showing crop ads',
    newestFirst: 'Newest First',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    unlockedOnly: 'Unlocked Contacts Only',
    clearFilters: 'Clear all filters',
    postAdFree: 'Post Ad (+)',
    topUpWallet: 'Top Up Wallet',
    freeUnlocks: 'Free Unlocks',
    walletBalance: 'Wallet Balance',
    contactsRemaining: 'Free Contacts Remaining',
    welcomeBonusNote: 'Welcome Bonus Policy: Free Rs. 100 signup balance cannot be withdrawn. It is exclusively for unlocking 10 verified seller contacts (Rs. 10 each).',
    depositTitle: 'Deposit Balance',
    depositDesc: 'Instant top-up via JazzCash, EasyPaisa or Bank Transfer',
    unlockContact: 'Pay Rs. 10 & Unlock Contact',
    unlockContactFee: 'Contact Reveal Fee: Rs. 10 (or 1 Free Referral)',
    unlockWithReferral: 'Unlock Free (Use 1 Referral)',
    sellerRating: 'Seller Rating & Reviews',
    sellerReviews: 'Customer Reviews',
    verifiedTrader: 'Verified Mandi Trader',
    quantity: 'Quantity',
    variety: 'Variety / Grade',
    packaging: 'Packaging',
    moisture: 'Moisture Level',
    harvestYear: 'Harvest Year',
    callSeller: 'Call Seller',
    whatsapp: 'WhatsApp',
    exactLocation: 'Mandi Warehouse Address',
    lowBalanceAlert: 'Your free 10 contact reveals balance is exhausted!',
    depositRequired: 'To view more seller phone numbers and mandi locations, please deposit funds to your wallet via JazzCash or EasyPaisa.',
    referralTitle: 'Refer Friends & Earn Free Contact Unlocks',
    referralDesc: 'For every friend who joins with your code, you get 1 free contact reveal!',
    myReferralCode: 'Your Referral Code',
    copyCode: 'Copy',
    codeCopied: 'Copied!',
    shareWhatsApp: 'Share on WhatsApp',
    switchAccount: 'Switch User Account',
    exitAdmin: 'Exit Admin View',
    rateAnalysis: '7-Day Price Trend Analysis',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    avgPrice: 'Average Price',
    trend: 'Daily Trend',
    mandiUnit: 'Unit',
    close: 'Close',
    confirmLogoutTitle: 'Are you sure you want to log out of your account?',
    confirmLogoutYes: 'Yes, Logout',
    cancel: 'Cancel',
    province: 'Province',
  },
  ur: {
    appName: 'کسان منڈی',
    tagline: 'پاکستان کی زرعی اجناس کی سب سے بڑی مارکیٹ',
    agriOlx: 'ایگری او ایل ایکس',
    market: 'منڈی',
    liveRates: 'لائیو ریٹس',
    sell: 'فصل بیچیں',
    account: 'اکاؤنٹ',
    login: 'لاگ ان',
    register: 'رجسٹریشن',
    logout: 'لاگ آؤٹ',
    searchPlaceholder: 'گندم، چاول، کپاس، مکئی، چینی، دالیں یا شہر تلاش کریں...',
    installApp: 'موبائل ایپ انسٹال کریں',
    allPakistan: 'تمام پاکستان',
    allCategories: 'تمام اجناس',
    wheat: 'گندم',
    rice: 'چاول',
    flour: 'چکی آٹا',
    pulses: 'دالیں و چنا',
    otherGrains: 'مکئی و تیل بیج',
    cotton: 'کپاس و روئی',
    sugar: 'چینی و کماد',
    maize: 'مکئی',
    oilseeds: 'سرسوں و کینولا',
    showingListings: 'اشتہارات دکھائے جا رہے ہیں',
    newestFirst: 'تازہ ترین پہلے',
    priceLowHigh: 'قیمت: کم سے زیادہ',
    priceHighLow: 'قیمت: زیادہ سے کم',
    unlockedOnly: 'صرف کھولے گئے نمبرز',
    clearFilters: 'تمام فلٹرز ختم کریں',
    postAdFree: 'اشتہار لگائیں (+)',
    topUpWallet: 'رقم جمع کریں',
    freeUnlocks: 'مفت ان لاکس',
    walletBalance: 'والٹ بیلنس',
    contactsRemaining: 'باقی مفت نمبرز',
    welcomeBonusNote: 'ویلکم بونس پالیسی: رجسٹریشن پر ملا ہوا Rs. 100 فری بیلنس نکلوایا نہیں جا سکتا۔ یہ صرف 10 کسانوں کے موبائل فون نمبر کھولنے کے لیے مختص ہے۔',
    depositTitle: 'بیلنس جمع کروائیں',
    depositDesc: 'جاز کیش، ایزی پیسہ یا بینک ٹرانسفر سے فوری ڈپازٹ',
    unlockContact: '۱۰ روپے ادا کر کے نمبر کھولیں',
    unlockContactFee: 'نمبر کھولنے کی فیس: ۱۰ روپے (یا ۱ ریفرل پر مفت)',
    unlockWithReferral: 'مفت کھولیں (۱ ریفرل کریڈٹ)',
    sellerRating: 'سیلر ریٹنگ اور کسٹمر فیڈبیک',
    sellerReviews: 'خریداروں کی آراء',
    verifiedTrader: 'مصدقہ منڈی تاجر',
    quantity: 'مقدار (وزن)',
    variety: 'قسم / کوالٹی',
    packaging: 'پیکنگ کی قسم',
    moisture: 'نمی کا تناسب',
    harvestYear: 'فصل کا سال',
    callSeller: 'کال کریں',
    whatsapp: 'واٹس ایپ',
    exactLocation: 'گودام / دکان کا مکمل پتہ',
    lowBalanceAlert: 'آپ کے مفت ۱۰ نمبر کھولنے کا بیلنس مکمل ہو چکا ہے!',
    depositRequired: 'مزید کسانوں اور بیوپاریوں کے رابطے کھولنے کے لیے اپنے والٹ میں JazzCash یا EasyPaisa سے رقم جمع کروائیں۔',
    referralTitle: 'دوستوں کو ریفر کریں اور فری نمبر حاصل کریں',
    referralDesc: 'ہر نئے دوست کی شمولیت پر آپ کو ایک کسان کا نمبر بالکل مفت ملے گا!',
    myReferralCode: 'آپ کا ریفرل کوڈ',
    copyCode: 'کاپی کریں',
    codeCopied: 'کاپی ہو گیا!',
    shareWhatsApp: 'واٹس ایپ شیئر',
    switchAccount: 'دوسرا اکاؤنٹ تبدیل کریں',
    exitAdmin: 'ایڈمن پینل بند کریں',
    rateAnalysis: 'گزشتہ ۷ دن کی قیمتوں کا اتار چڑھاؤ',
    minPrice: 'کم سے کم',
    maxPrice: 'زیادہ سے زیادہ',
    avgPrice: 'اوسط ریٹ',
    trend: 'روزانہ کا فرق',
    mandiUnit: 'پیمائش',
    close: 'بند کریں',
    confirmLogoutTitle: 'کیا آپ واقعی اس اکاؤنٹ سے لاگ آؤٹ کرنا چاہتے ہیں؟',
    confirmLogoutYes: 'جی ہاں، لاگ آؤٹ کریں',
    cancel: 'منسوخ کریں',
    province: 'صوبہ',
  },
};
