import { Card } from "~/components/ui/card";
import UserProfileForm from "./_components/sample";
import UserProfileForm2 from "./_components/sample2";

export default function Page() {
  return (
    <Card>
      <UserProfileForm />
      <UserProfileForm2/>
    </Card>
  );
}