import React, { createContext, useContext, ReactNode } from 'react';
import {
  ShoppingBagIcon,
  UserCircleIcon,
  InboxIcon,
  PowerIcon,
  FolderIcon,
  IdentificationIcon,
  TableCellsIcon,
  UserPlusIcon,
  ComputerDesktopIcon,
  HomeIcon,
  BookOpenIcon
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
      label: 'Cats',
      icon: <HomeIcon className="h-5 w-5" />,
      route: '/',
    },
    {
      label: 'Reservation scheduler',
      icon: <InboxIcon className="h-5 w-5" />,
      route: '/volunteer/reservations',
    },
    {
      label: 'My Walks',
      icon: <BookOpenIcon className="h-5 w-5" />,
      route: '/volunteer/walks',
    },
    {
      label: 'Log Out',
      icon: <PowerIcon className="h-5 w-5" />,
      route: '/logout',
    },
  ];

  const sidebarUnauthData: SidebarItem[] = [
    {
      label: 'Cats',
      icon: <HomeIcon className="h-5 w-5" />,
      route: '/',
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
      label: 'Users',
      icon: <IdentificationIcon className="h-5 w-5" />,
      route: '/admin/users',
    }
  ];

  // Define caregiver-specific sidebar data
  const caregiverSidebarData: SidebarItem[] = [
    {
      label: 'Cats',
      icon: <HomeIcon className="h-5 w-5" />,
      route: '/',
    },
    {
      label: 'Species',
      icon: <UserCircleIcon className="h-5 w-5" />,
      route: '/caregiver/species',
    },
    {
      label: 'Health Records',
      icon: <FolderIcon className="h-5 w-5" />,
      route: '/vets/healthrecords',
    },
    {
      label: 'Reservation Management',
      icon: <TableCellsIcon className="h-5 w-5" />,
      route: '/caregiver/reservations',
    },
    {
      label: 'Examination Requests',
      icon: <TableCellsIcon className="h-5 w-5" />,
      route: '/caregiver/examination_requests',
    },
    {
      label: 'Volunteer Validation',
      icon: <UserPlusIcon className="h-5 w-5" />,
      route: '/caregiver/volunteer_validation',
    },
    {
      label: 'Walk Management',
      icon: <ComputerDesktopIcon className="h-5 w-5" />,
      route: '/caregiver/walks',
    },
    {
      label: 'Log Out',
      icon: <PowerIcon className="h-5 w-5" />,
      route: '/logout',
    }
  ];

  const vetsSidebarData: SidebarItem[] = [
    {
      label: 'Cats',
      icon: <HomeIcon className="h-5 w-5" />,
      route: '/',
    },
    {
      label: 'Health Records',
      icon: <FolderIcon className="h-5 w-5" />,
      route: '/vets/healthrecords',
    },
    {
      label: 'Examination Requests',
      icon: <TableCellsIcon className="h-5 w-5" />,
      route: '/caregiver/examination_requests',
    },
    {
      label: 'Log Out',
      icon: <PowerIcon className="h-5 w-5" />,
      route: '/logout',
    }
  ];

  // Select data based on role
  const sidebarData = React.useMemo(() => {
    switch (role) {
      case Role.ADMIN:
        return [...adminSidebarData, ...caregiverSidebarData];
      case Role.CAREGIVER:
        return [...caregiverSidebarData];
      case Role.VOLUNTEER:
        return volunteerSidebarData;
      case Role.VERIFIED_VOLUNTEER:
        return volunteerSidebarData;
      case Role.VETS:
        return vetsSidebarData;
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
