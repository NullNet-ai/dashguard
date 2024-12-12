import { type PropsWithChildren, type ReactNode } from "react";
import MainContent from "./MainContent";
import Summary from "./Summary";
import Tabs from "./Tabs";
import RecordProvider from "./Provider";

interface RecordProps extends PropsWithChildren{
  config: {
    tabs: ReactNode;
    entityCode: string;
    entityName?: string;
  };
}

const Record = ({ config: {  tabs,entityCode,entityName },children }: RecordProps) => {
  return (
    <RecordProvider config={{
      entityCode: entityCode,
      entityName: entityName,
    }} params={{
      code: entityCode
    }}>
      <Summary code={entityCode}/>
      <Tabs>{tabs} </Tabs>
      <MainContent>{children}</MainContent>
    </RecordProvider>
  )
};

export default Record;
