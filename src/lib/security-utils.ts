/**
 * Security utilities for sensitive data handling
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;

/**
 * Generate a secure random encryption key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Encrypt sensitive data
 */
export function encryptData(text: string, key: string): string {
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, keyBuffer);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error('Encryption failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string, key: string): string {
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(ALGORITHM, keyBuffer);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Hash sensitive data (one-way)
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const middle = '*'.repeat(data.length - (visibleChars * 2));
  
  return start + middle + end;
}

/**
 * Validate environment variable format
 */
export function validateEnvVar(name: string, value: string | undefined, required: boolean = true): boolean {
  if (!value) {
    if (required) {
      throw new Error(`Required environment variable ${name} is missing`);
    }
    return false;
  }
  
  // Check for placeholder values
  if (value.includes('your_') || value.includes('_here') || value === 'undefined') {
    throw new Error(`Environment variable ${name} contains placeholder value`);
  }
  
  return true;
}