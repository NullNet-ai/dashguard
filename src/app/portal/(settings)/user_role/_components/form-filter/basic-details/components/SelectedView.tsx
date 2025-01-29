import { cn } from "~/lib/utils";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

const SelectedView = ({ record }: Record<string, any>) => {
  return (
    <div className="flex">
      <div className="w-1/2">
        <Label className={cn("text-md font-semibold")}>Role: *</Label>
        <Input
          readOnly={true}
          className={`${true && "border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100"}`}
          placeholder={"Role"}
          value={record?.role}
          required={true}
        />
      </div>
    </div>
  );
};

export default SelectedView;
