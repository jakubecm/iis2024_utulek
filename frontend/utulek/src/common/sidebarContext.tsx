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
  const volunteerSidebarData: SidebarItem[] = [
    {
      label: 'Home',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/',
    },
    {
      label: 'Reservations',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/volunteer/reservations',
    },
    {
      label: 'Walk History',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/volunteer/walks',
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
    },
    {
      label: 'Reservation Requests',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/caregiver/reservations',
    },
    {
      label: 'Examination Requests',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/caregiver/examination_requests',
    },
    {
      label: 'Volunteer Validation',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/caregiver/volunteer_validation',
    },
    {
      label: 'Walk Management',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/caregiver/walks',
    }
  ];

  const vetsSidebarData: SidebarItem[] = [
    {
      label: 'Health Records',
      icon: <ShoppingBagIcon className="h-5 w-5" />,
      route: '/vets/healthrecords',
    },
    {
      label: 'Examination Requests',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/caregiver/examination_requests',
    },
  ];

  // Select data based on role
  const sidebarData = React.useMemo(() => {
    switch (role) {
      case Role.ADMIN:
        return [...adminSidebarData, ...caregiverSidebarData, ...volunteerSidebarData];
      case Role.CAREGIVER:
        return [...caregiverSidebarData, ...volunteerSidebarData];
      case Role.VOLUNTEER:
        return volunteerSidebarData;
      case Role.VETS:
        return [...vetsSidebarData, ...volunteerSidebarData];
      default:
        return sidebarUnauthData;
    }
  }, [role]);

  const value = React.useMemo(() => ({ items: sidebarData }), [sidebarData]);

  return (
    <SidebarContext.Provider value={value}>
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
