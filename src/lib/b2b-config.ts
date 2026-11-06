export interface B2BServiceConfig {
  qr: {
    errorCorrection: 'L' | 'M' | 'Q' | 'H';
    defaultDpi: number;
    defaultFormat: 'svg' | 'png' | 'pdf';
    colorSeparation: 'sRGB' | 'CMYK-FOGRA39';
    margin: number;
    foregroundColor: string;
    backgroundColor: string;
    dotStyle: 'square' | 'rounded' | 'dots';
  };
  barcode: {
    defaultSymbology: 'CODE128' | 'EAN13' | 'UPC' | 'ITF14' | 'CODE39' | 'DATAMATRIX';
    barWidth: number;
    barHeight: number;
    displayValue: boolean;
    fontSize: number;
    colorProfile: 'black-white' | 'inverted' | 'cmyk-k100';
  };
  photoDpi: {
    targetDpi: 300 | 600 | 1200;
    halftoneScreening: boolean;
    screenRulingLpi: number;
    bleedMarginMm: number;
    cropMarks: boolean;
  };
  nfc: {
    defaultRecordType: 'vcard' | 'url' | 'text' | 'custom';
    presetTagType: 'NTAG213' | 'NTAG215' | 'NTAG216' | 'Type4';
    autoLockTag: boolean;
  };
  batchMatrix: {
    maxBatchSize: number;
    zipCompressionLevel: number;
    includeMetadataCsv: boolean;
    matrixLayout: 'grid' | 'single' | 'sheet-a4';
  };
  webhooks: {
    enabled: boolean;
    endpointUrl: string;
    signingSecret: string;
    events: string[];
  };
}

export const DEFAULT_B2B_CONFIG: B2BServiceConfig = {
  qr: {
    errorCorrection: 'H',
    defaultDpi: 300,
    defaultFormat: 'svg',
    colorSeparation: 'sRGB',
    margin: 2,
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    dotStyle: 'square',
  },
  barcode: {
    defaultSymbology: 'CODE128',
    barWidth: 2,
    barHeight: 100,
    displayValue: true,
    fontSize: 16,
    colorProfile: 'black-white',
  },
  photoDpi: {
    targetDpi: 300,
    halftoneScreening: false,
    screenRulingLpi: 150,
    bleedMarginMm: 3,
    cropMarks: true,
  },
  nfc: {
    defaultRecordType: 'vcard',
    presetTagType: 'NTAG213',
    autoLockTag: false,
  },
  batchMatrix: {
    maxBatchSize: 1000,
    zipCompressionLevel: 6,
    includeMetadataCsv: true,
    matrixLayout: 'grid',
  },
  webhooks: {
    enabled: false,
    endpointUrl: '',
    signingSecret: '',
    events: ['generation.completed', 'credits.threshold'],
  },
};
