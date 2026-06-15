import Header from "@/components/header";
import { SpendingAlertsBanner } from "@/features/spending-alerts/components/spending-alerts-banner";

type Props = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  return (
    <>
      <Header />
      <SpendingAlertsBanner />
      <main className="px-3 lg:px-14">{children}</main>
    </>
  );
};

export default DashboardLayout;
