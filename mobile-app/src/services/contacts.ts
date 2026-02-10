/**
 * Contacts Service
 * Import and manage phone contacts for trusted contact list
 */
import Contacts from 'react-native-contacts';
import { PermissionsAndroid, Platform } from 'react-native';

export interface PhoneContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  thumbnailPath?: string;
}

class ContactsService {
  /**
   * Request permission to access contacts
   */
  async requestPermission(): Promise<boolean> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Acceso a Contactos',
          message: 'MANO necesita acceso a tus contactos para configurar contactos de confianza.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Denegar',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  /**
   * Check if permission is granted
   */
  async checkPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS
      );
      return result;
    } else {
      const permission = await Contacts.checkPermission();
      return permission === 'authorized';
    }
  }

  /**
   * Get all contacts from phone
   */
  async getAllContacts(): Promise<PhoneContact[]> {
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) {
        throw new Error('Permiso de contactos denegado');
      }
    }

    try {
      const contacts = await Contacts.getAll();
      
      return contacts
        .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .map(contact => ({
          id: contact.recordID,
          name: this.formatName(contact),
          phone: this.formatPhone(contact.phoneNumbers[0]?.number || ''),
          email: contact.emailAddresses?.[0]?.email,
          thumbnailPath: contact.thumbnailPath,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  }

  /**
   * Search contacts by name or phone
   */
  async searchContacts(query: string): Promise<PhoneContact[]> {
    const allContacts = await this.getAllContacts();
    const lowerQuery = query.toLowerCase();
    
    return allContacts.filter(contact => 
      contact.name.toLowerCase().includes(lowerQuery) ||
      contact.phone.includes(query)
    );
  }

  /**
   * Get contact by ID
   */
  async getContactById(contactId: string): Promise<PhoneContact | null> {
    try {
      const contact = await Contacts.getContactById(contactId);
      if (!contact) return null;

      return {
        id: contact.recordID,
        name: this.formatName(contact),
        phone: this.formatPhone(contact.phoneNumbers?.[0]?.number || ''),
        email: contact.emailAddresses?.[0]?.email,
        thumbnailPath: contact.thumbnailPath,
      };
    } catch (error) {
      console.error('Error getting contact:', error);
      return null;
    }
  }

  /**
   * Format contact name
   */
  private formatName(contact: any): string {
    const parts = [
      contact.givenName,
      contact.middleName,
      contact.familyName,
    ].filter(Boolean);
    
    if (parts.length > 0) {
      return parts.join(' ');
    }
    
    return contact.displayName || contact.company || 'Sin nombre';
  }

  /**
   * Format phone number
   */
  private formatPhone(phone: string): string {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Add Spain country code if not present
    if (cleaned.length === 9 && !cleaned.startsWith('+')) {
      return `+34${cleaned}`;
    }
    
    return cleaned;
  }

  /**
   * Open native contact picker
   */
  async openContactPicker(): Promise<PhoneContact | null> {
    try {
      const contact = await Contacts.openContactForm({});
      if (!contact) return null;

      return {
        id: contact.recordID,
        name: this.formatName(contact),
        phone: this.formatPhone(contact.phoneNumbers?.[0]?.number || ''),
        email: contact.emailAddresses?.[0]?.email,
        thumbnailPath: contact.thumbnailPath,
      };
    } catch (error) {
      console.error('Error opening contact picker:', error);
      return null;
    }
  }
}

export const contactsService = new ContactsService();
export default contactsService;
