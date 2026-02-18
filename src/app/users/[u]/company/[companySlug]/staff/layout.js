'use client';

import { useContext } from 'react';
import { CompanyInfoContext, ReusableCompanySidebar } from '../layout';

export default function StaffLayout({ children }) {
  return (
    <ReusableCompanySidebar>
      {children}
    </ReusableCompanySidebar>
  );
}