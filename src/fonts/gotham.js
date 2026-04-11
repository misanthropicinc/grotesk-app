import localFont from 'next/font/local';

export const gotham = localFont({
  src: [
    { path: './gotham_book.otf', weight: '100', style: 'normal' },
    { path: './gotham_bookitalic.otf', weight: '100', style: 'italic' },
    { path: './gotham_medium.otf', weight: '200', style: 'normal' },
    { path: './gotham_mediumitalic.otf', weight: '200', style: 'italic' },
    { path: './gotham_bold.otf', weight: '300', style: 'normal' },
    { path: './gotham_bolditalic.otf', weight: '300', style: 'italic' },
  ],
  variable: '--font-gotham',
  display: 'swap',
});