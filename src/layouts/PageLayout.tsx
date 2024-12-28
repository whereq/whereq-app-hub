import { ReactNode } from "react";

const PageLayout = ({ children }: { children: ReactNode }) => {
  return <div className="h-full bg-gray-900 text-orange-300 font-fira-code">{children}</div>;
};

export default PageLayout;