export function formatCardNumber(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/(\d{1,4})/g);
    return groups ? groups.join(' ').substr(0, 19) : '';
  }
  
  export function formatExpiryDate(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 4);
    
    if (limited.length > 2) {
      return limited.slice(0, 2) + '/' + limited.slice(2);
    }
    
    return limited;
  }