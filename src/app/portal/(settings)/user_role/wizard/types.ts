export interface IWizardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    code: string;
  }>;
}
