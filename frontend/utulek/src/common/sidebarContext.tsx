import React, { createContext, useContext, ReactNode } from 'react';
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { Role } from '../auth/jwt';
import { useAuth } from '../auth/AuthContext';

// Define the shape of a sidebar item with optional children for dropdowns
interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  route?: string;  // route is optional for items that have children
  children?: SidebarItem[];  // Nested sub-items for dropdowns
}

interface SidebarContextType {
  items: SidebarItem[];
}

// Create the context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Create a provider component
export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { role } = useAuth();
  console.log("role:", role);
  
  // Define user-specific sidebar data
  const userSidebarData: SidebarItem[] = [
    {
      label: 'Home',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/',
    },
    {
      label: 'Macicky',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/inbox',
    },
    {
      label: 'Settings',
      icon: <Cog6ToothIcon className="h-5 w-5" />,
      route: '/settings',
    },
    {
      label: 'Profile',
      icon: <UserCircleIcon className="h-5 w-5" />,
      route: '/profile',
    },
    {
      label: 'Log Out',
      icon: <PowerIcon className="h-5 w-5" />,
      route: '/logout',
    },
  ];

  const sidebarUnauthData: SidebarItem[] = [
    {
      label: 'Home',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/',
    },
    {
      label: 'Macicky',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/inbox',
    },
    {
      label: 'Settings',
      icon: <Cog6ToothIcon className="h-5 w-5" />,
      route: '/settings',
    },
    {
      label: 'Login',
      icon: <UserCircleIcon className="h-5 w-5" />,
      route: '/login',
    },
  ];

  // Define admin-specific sidebar data
  const adminSidebarData: SidebarItem[] = [
    {
      label: 'Dashboard',
      icon: <PresentationChartBarIcon className="h-5 w-5" />,
      route: '/admin/dashboard',
    },
    {
      label: 'Users',
      icon: <UserCircleIcon className="h-5 w-5" />,
      route: '/admin/users',
    },
    {
      label: 'Fentanyl',
      icon: <ShoppingBagIcon className="h-5 w-5" />,
      children: [
        { label: 'Orders', route: '/admin/ecommerce/orders', icon: <ChevronRightIcon strokeWidth={3} className="h-3 w-5" /> },
        { label: 'Products', route: '/admin/ecommerce/products', icon: <ChevronRightIcon strokeWidth={3} className="h-3 w-5" /> },
      ],
    },
  ];

  // Define caregiver-specific sidebar data
  const caregiverSidebarData: SidebarItem[] = [
    {
      label: 'Species',
      icon: <UserCircleIcon className="h-5 w-5" />,
      route: '/caregiver/species',
    },
    {
      label: 'Health Records',
      icon: <ShoppingBagIcon className="h-5 w-5" />,
      route: '/vets/healthrecords',
    }
  ];

  const vetsSidebarData: SidebarItem[] = [
    {
      label: 'Health Records',
      icon: <ShoppingBagIcon className="h-5 w-5" />,
      route: '/vets/healthrecords',
    }
  ];

  // Select data based on role
  const sidebarData = React.useMemo(() => {
    switch (role) {
      case Role.ADMIN:
        return [...adminSidebarData, ...userSidebarData, ...caregiverSidebarData];
      case Role.CAREGIVER:
        return caregiverSidebarData;
      case Role.USER:
        return userSidebarData;
      case Role.VETS:
        return vetsSidebarData;
      default:
        return sidebarUnauthData;
    }
  }, [role]);

  return (
    <SidebarContext.Provider value={{ items: sidebarData }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook to use the sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
