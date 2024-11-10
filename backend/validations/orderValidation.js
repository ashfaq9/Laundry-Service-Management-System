

const orderValidation = {
  orderPersonName: {
    in: ['body'],
    exists: { errorMessage: 'Order person name is required' },
    isString: { errorMessage: 'Order person name must be a string' },
  },
  phoneNumber: {
    in: ['body'],
    exists: { errorMessage: 'Phone number is required' },
    isString: { errorMessage: 'Phone number must be a string' },
    isMobilePhone: { errorMessage: 'Invalid phone number', options: ['any'] },
  },
  user: {
    in: ['body'],
    exists: { errorMessage: 'User is required' },
    isMongoId: { errorMessage: 'Invalid user ID' },
  },
  services: {
    in: ['body'],
    isArray: { errorMessage: 'Services should be an array' },
  },
  'services.*.service': {
    in: ['body'],
    exists: { errorMessage: 'Service ID is required' },
    isMongoId: { errorMessage: 'Invalid service ID' },
  },
  'services.*.items': {
    in: ['body'],
    isArray: { errorMessage: 'Items should be an array' },
  },
  'services.*.items.*.item': {
    in: ['body'],
    exists: { errorMessage: 'Item name is required' },
  },
  'services.*.items.*.quantity': {
    in: ['body'],
    exists: { errorMessage: 'Item quantity is required' },
    isInt: { options: { min: 1 }, errorMessage: 'Quantity should be a number greater than 0' },
  },
  pickupDate: {
    in: ['body'],
    exists: { errorMessage: 'Pickup date is required' },
    isISO8601: { errorMessage: 'Invalid date format' },
    custom: {
      options: (value) => {
        const pickupDate = new Date(value);
        const now = new Date();
        const diffHours = (pickupDate - now) / (1000 * 60 * 60);
        return diffHours >= 48;
      },
      errorMessage: 'Pickup date must be at least 48 hours from now',
    },
  },
  formatted_address: {
    in: ['body'],
    exists: { errorMessage: 'Location is required' },
    isString: { errorMessage: 'Location must be a string' },
  },
  latitude: {
    in: ['body'],
    exists: { errorMessage: 'Latitude is required' },
    isFloat: { options: { min: -90, max: 90 }, errorMessage: 'Invalid latitude' },
  },
  longitude: {
    in: ['body'],
    exists: { errorMessage: 'Longitude is required' },
    isFloat: { options: { min: -180, max: 180 }, errorMessage: 'Invalid longitude' },
  },
};

module.exports = orderValidation;
