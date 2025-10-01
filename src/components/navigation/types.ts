
export interface MenuItem {
  title: string;
  key: string;
  hasDropdown: boolean;
  requiresAuth?: boolean;
  onClick?: () => void;
  path?: string;
  items?: {
    title: string;
    path?: string;
    onClick?: () => void;
  }[];
}

export interface MobileMenuItem {
  title: string;
  key: string;
  hasDropdown: boolean;
  requiresAuth?: boolean;
  path?: string;
  onClick?: () => void;
  items?: {
    title: string;
    path?: string;
    onClick?: () => void;
  }[];
}
