
const APP_CONSTANTS = {

  GRN_NUMBER_PREFIX: 'GRN',
  GRN_NUMBER_FORMAT: 'YYYYMM',
  GRN_SEQUENCE_START: 1,
  GRN_SEQUENCE_PADDING: 3,


  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },


  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, 
    ALLOWED_FILE_TYPES: ['.xlsx', '.xls'],
    UPLOAD_PATH: 'uploads/'
  },


  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

 
  VALIDATION: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MIN_DESCRIPTION_LENGTH: 10,
    MAX_DESCRIPTION_LENGTH: 500
  }
};

module.exports = APP_CONSTANTS; 