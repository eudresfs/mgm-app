/**
 * Validation middleware for authentication routes
 * Validates user input data before processing
 */

const validateRegistration = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = {};

  // Validate email
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please provide a valid email address';
  }

  // Validate password
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }

  // Validate name
  if (!name) {
    errors.name = 'Name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  // Validate email
  if (!email) {
    errors.email = 'Email is required';
  }

  // Validate password
  if (!password) {
    errors.password = 'Password is required';
  }

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateRequest = (type) => {
  return (req, res, next) => {
    const errors = {};

    if (type === 'affiliate') {
      const { name, email, website, paymentInfo } = req.body;

      // Validate name
      if (!name) {
        errors.name = 'Name is required';
      } else if (name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long';
      }

      // Validate email
      if (!email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please provide a valid email address';
      }

      // Validate website if provided
      if (website && !/^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(website)) {
        errors.website = 'Please provide a valid website URL';
      }

      // Validate payment info
      if (!paymentInfo) {
        errors.paymentInfo = 'Payment information is required';
      } else {
        if (!paymentInfo.type) {
          errors.paymentInfo = 'Payment type is required';
        }
        if (!paymentInfo.details) {
          errors.paymentInfo = 'Payment details are required';
        }
      }
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
};

const validateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  const errors = {};

  // Validate refresh token
  if (!refreshToken) {
    errors.refreshToken = 'Refresh token is required';
  }

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateRequest,
  validateRefreshToken
};