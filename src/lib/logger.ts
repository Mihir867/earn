import { Logger } from 'tslog';

const logger = new Logger({
  minLevel: 2,
  prettyLogTimeZone: 'UTC',
  prettyErrorStackTemplate:
    '  • {{fileName}}\t{{method}}\n\t{{filePathWithLine}}',
  prettyErrorTemplate:
    '\n{{errorName}} {{errorMessage}}\nerror stack:\n{{errorStack}}',
  prettyLogTemplate: '{{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}',
  stylePrettyLogs: true,
  prettyLogStyles: {
    logLevelName: {
      '*': ['bold', 'black', 'bgWhiteBright', 'dim'],
      SILLY: ['bold', 'white'],
      TRACE: ['bold', 'blue'],
      DEBUG: ['bold', 'cyan'],
      INFO: ['bold', 'green'],
      WARN: ['bold', 'yellow'],
      ERROR: ['bold', 'red'],
      FATAL: ['bold', 'magenta'],
    },
    dateIsoStr: 'blue',
    filePathWithLine: 'magenta',
  },
});

export default logger;
