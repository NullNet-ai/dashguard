import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { type IFilterBy } from "../Category/type";
import CategoryView from "../Category/View";
interface IProps extends IFilterBy {
  test?: any;
}
const GridDialog = ({ filter_id, filter_by, sort_by }: IProps) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Show Options</Button>
      </DialogTrigger>
      <DialogContent className="h-[85%] w-[60%]">
        <div className="mb-2 text-sm">
          <span className="font-semibold">Options {filter_id}</span>
        </div>
        <Separator />
        <div className="flex h-full flex-1 gap-2 py-4">
          <CategoryView
            sort_by={sort_by}
            filter_by={filter_by}
            filter_id={filter_id}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GridDialog;
