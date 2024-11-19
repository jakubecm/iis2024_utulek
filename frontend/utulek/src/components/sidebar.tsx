import React, { useState } from 'react';
import { Card, List, ListItem, ListItemPrefix, Typography, Accordion, AccordionHeader, AccordionBody } from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Link } from 'react-router-dom';
import { useSidebar } from '../common/sidebarContext';

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  const { items } = useSidebar();  // No conditional logic here

  const handleOpen = (value: number) => {
    setOpen(open === value ? null : value);
  };

  return (
    <Card className="h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
      <div className="mb-2 p-4">
        <Typography variant="h5" color="blue-gray">
          Rizztulek
        </Typography>
      </div>
      <List>
        {items.map((item, index) => (
          item.children ? (
            <Accordion
              key={index}
              open={open === index}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${
                    open === index ? "rotate-180" : ""
                  }`}
                />
              }
            >
              <ListItem className="p-0" selected={open === index}>
                <AccordionHeader onClick={() => handleOpen(index)} className="border-b-0 p-3">
                  <ListItemPrefix>{item.icon}</ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">
                    {item.label}
                  </Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  {item.children.map((subItem, subIndex) => (
                    <Link to={subItem.route!} key={subIndex}>
                      <ListItem>
                        <ListItemPrefix>{subItem.icon}</ListItemPrefix>
                        {subItem.label}
                      </ListItem>
                    </Link>
                  ))}
                </List>
              </AccordionBody>
            </Accordion>
          ) : (
            <Link to={item.route!} key={index}>
              <ListItem>
                <ListItemPrefix>{item.icon}</ListItemPrefix>
                {item.label}
              </ListItem>
            </Link>
          )
        ))}
      </List>
    </Card>
  );
}

export default Sidebar;
