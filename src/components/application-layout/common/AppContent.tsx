import ContentWraper from './ContentWrapper'

const AppContent = ({ children }: any) => {
  return (
    <ContentWraper>
      {children}
    </ContentWraper>
  );
};

export default AppContent;
