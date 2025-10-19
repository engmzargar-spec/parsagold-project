// فایل: lib/countries.ts
export interface CountryOption {
  value: string;
  label: string;
  code: string;
  flag: string;
}

export const countryOptions: CountryOption[] = [
  {
    value: 'IR',
    label: 'ایران',
    code: '+98',
    flag: '🇮🇷'
  },
  {
    value: 'TR',
    label: 'ترکیه',
    code: '+90',
    flag: '🇹🇷'
  },
  {
    value: 'AE',
    label: 'امارات',
    code: '+971',
    flag: '🇦🇪'
  },
  {
    value: 'QA',
    label: 'قطر',
    code: '+974',
    flag: '🇶🇦'
  },
  {
    value: 'TJ',
    label: 'تاجیکستان',
    code: '+992',
    flag: '🇹🇯'
  },
  {
    value: 'IQ',
    label: 'عراق',
    code: '+964',
    flag: '🇮🇶'
  },
  {
    value: 'AF',
    label: 'افغانستان',
    code: '+93',
    flag: '🇦🇫'
  },
  {
    value: 'AZ',
    label: 'آذربایجان',
    code: '+994',
    flag: '🇦🇿'
  },
  {
    value: 'AM',
    label: 'ارمنستان',
    code: '+374',
    flag: '🇦🇲'
  },
  {
    value: 'PK',
    label: 'پاکستان',
    code: '+92',
    flag: '🇵🇰'
  },
  {
    value: 'IN',
    label: 'هند',
    code: '+91',
    flag: '🇮🇳'
  }
];