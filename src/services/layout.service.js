// Layout Service - NavBar and Footer Content

import { layoutMock } from '../data/mock/layout.mock';

export const layoutService = {
  getNavContent: () => {
    return layoutMock.nav;
  },
  
  getFooterContent: () => {
    return layoutMock.footer;
  }
};
