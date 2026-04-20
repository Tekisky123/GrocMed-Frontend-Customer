/**
 * Safely parses and formats a date string for UI display.
 * Prevents crashes on older Android versions where invalid date strings might cause hard errors.
 */
export const formatSafeDate = (dateString: string | undefined | null, options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' }): string => {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        
        // Check for "Invalid Date"
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        
        return date.toLocaleDateString('en-IN', options);
    } catch (error) {
        console.warn('Date parsing failed for:', dateString, error);
        return 'N/A';
    }
};

/**
 * Checks if a date is older than today safely.
 */
export const isExpired = (expiryDate: string | undefined | null): boolean => {
    if (!expiryDate) return false;
    
    try {
        const date = new Date(expiryDate);
        if (isNaN(date.getTime())) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return date < today;
    } catch {
        return false;
    }
};
