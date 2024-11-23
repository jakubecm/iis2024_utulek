import { Typography } from '@material-tailwind/react';
import React from 'react';

const Forbidden: React.FC = () => {
    return (
        <div>
            <Typography variant='h3'>This page is for verified volunteers only!</Typography>
            <Typography variant='lead'>Please wait until a caregiver verifies your account.</Typography>
        </div>
    );
};

export default Forbidden;