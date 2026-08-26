// Footer Component

import { layoutService } from "../services/layout.service";

export const Footer = () => {
  const footerContent = layoutService.getFooterContent();

  return <footer className="footer">{footerContent.text}</footer>;
};
