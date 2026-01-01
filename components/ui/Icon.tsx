import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';

type IconLibrary = 'material' | 'ionicons' | 'feather';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  library?: IconLibrary;
}

export function Icon({ name, size = 24, color = '#000', library = 'material' }: IconProps) {
  const props = { name: name as any, size, color };

  switch (library) {
    case 'ionicons':
      return <Ionicons {...props} />;
    case 'feather':
      return <Feather {...props} />;
    default:
      return <MaterialIcons {...props} />;
  }
}

// Common icon mappings for easy use
export const Icons = {
  home: { name: 'home', library: 'material' as IconLibrary },
  cart: { name: 'shopping-cart', library: 'material' as IconLibrary },
  orders: { name: 'receipt', library: 'material' as IconLibrary },
  profile: { name: 'person', library: 'material' as IconLibrary },
  search: { name: 'search', library: 'material' as IconLibrary },
  back: { name: 'arrow-back', library: 'material' as IconLibrary },
  close: { name: 'close', library: 'material' as IconLibrary },
  add: { name: 'add', library: 'material' as IconLibrary },
  remove: { name: 'remove', library: 'material' as IconLibrary },
  delete: { name: 'delete', library: 'material' as IconLibrary },
  edit: { name: 'edit', library: 'material' as IconLibrary },
  check: { name: 'check', library: 'material' as IconLibrary },
  checkCircle: { name: 'check-circle', library: 'material' as IconLibrary },
  star: { name: 'star', library: 'material' as IconLibrary },
  starOutline: { name: 'star-border', library: 'material' as IconLibrary },
  favorite: { name: 'favorite', library: 'material' as IconLibrary },
  favoriteBorder: { name: 'favorite-border', library: 'material' as IconLibrary },
  notification: { name: 'notifications', library: 'material' as IconLibrary },
  settings: { name: 'settings', library: 'material' as IconLibrary },
  support: { name: 'support-agent', library: 'material' as IconLibrary },
  location: { name: 'location-on', library: 'material' as IconLibrary },
  phone: { name: 'phone', library: 'material' as IconLibrary },
  email: { name: 'email', library: 'material' as IconLibrary },
  chat: { name: 'chat', library: 'material' as IconLibrary },
  payment: { name: 'payment', library: 'material' as IconLibrary },
  money: { name: 'money', library: 'material' as IconLibrary },
  creditCard: { name: 'credit-card', library: 'material' as IconLibrary },
  truck: { name: 'local-shipping', library: 'material' as IconLibrary },
  arrowForward: { name: 'arrow-forward', library: 'material' as IconLibrary },
  filter: { name: 'filter-list', library: 'material' as IconLibrary },
  sort: { name: 'sort', library: 'material' as IconLibrary },
  menu: { name: 'menu', library: 'material' as IconLibrary },
  more: { name: 'more-vert', library: 'material' as IconLibrary },
  radioChecked: { name: 'radio-button-checked', library: 'material' as IconLibrary },
  radioUnchecked: { name: 'radio-button-unchecked', library: 'material' as IconLibrary },
  closeCircle: { name: 'cancel', library: 'material' as IconLibrary },
  category: { name: 'category', library: 'material' as IconLibrary },
};
