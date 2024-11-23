// Luhn algorithm for card number validation
export function isValidCardNumber(cardNumber: string): boolean {
    const sanitizedNumber = cardNumber.replace(/\D/g, '');
    
    if (!/^\d{15,16}$/.test(sanitizedNumber)) {
      return false;
    }
  
    let sum = 0;
    let isEven = false;
  
    for (let i = sanitizedNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitizedNumber[i]);
  
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
  
      sum += digit;
      isEven = !isEven;
    }
  
    return sum % 10 === 0;
  }
  
  export function isValidExpiryDate(expiry: string): boolean {
    const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
  
    if (!month || !year || month < 1 || month > 12) {
      return false;
    }
  
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
  
    return true;
  }
  
  export function isValidCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }
  
  export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  export function isValidPhone(phone: string): boolean {
    // Basic international phone format validation
    return /^\+?[\d\s-]{8,}$/.test(phone);
  }
  
  export function isValidName(name: string): boolean {
    return name.trim().length >= 2 && /^[a-zA-Z\s-']+$/.test(name);
  }